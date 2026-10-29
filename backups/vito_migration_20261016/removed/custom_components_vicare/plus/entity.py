"""Entities of ViCare Plus."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
import logging
from typing import Any, override

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.components.button import ButtonEntity
from homeassistant.components.number import (
    NumberDeviceClass,
    NumberEntity,
    NumberMode,
    RestoreNumber,
)
from homeassistant.components.select import SelectEntity
from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.components.switch import SwitchEntity
from homeassistant.components.text import TextEntity
from homeassistant.const import (
    PERCENTAGE,
    EntityCategory,
    UnitOfEnergy,
    UnitOfPower,
    UnitOfPressure,
    UnitOfTemperature,
    UnitOfTime,
    UnitOfVolume,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.restore_state import ExtraStoredData, RestoreEntity
from homeassistant.util import dt as dt_util

from ..const import DOMAIN
from ..entity import ViCareCoordinatorEntity, ViCareEntity
from .logic import (
    WEEKDAYS,
    CommandSpec,
    FeatureMap,
    PropertySpec,
    ScheduleError,
    ScheduleSpec,
    camel_to_snake,
    circuit_room_setpoint,
    clean_string,
    command,
    command_name,
    feature_label,
    get_features,
    group_label,
    group_of,
    heating_curve_supply,
    icon_for,
    is_core_covered,
    is_duplicate,
    is_noise,
    mode_at,
    next_change,
    prop,
    property_name,
    property_value,
    strip_group_prefix,
    validate_schedule,
)
from .overrides import KIND_PERMANENT, write_schedule
from .runtime import API_DAILY_LIMIT, DeviceContext, PlusRuntime, execute_command

_LOGGER = logging.getLogger(__name__)

UNITS: dict[
    str, tuple[str | None, SensorDeviceClass | None, SensorStateClass | None]
] = {
    "celsius": (
        UnitOfTemperature.CELSIUS,
        SensorDeviceClass.TEMPERATURE,
        SensorStateClass.MEASUREMENT,
    ),
    "kelvin": (
        UnitOfTemperature.KELVIN,
        SensorDeviceClass.TEMPERATURE,
        SensorStateClass.MEASUREMENT,
    ),
    "kilowattHour": (
        UnitOfEnergy.KILO_WATT_HOUR,
        SensorDeviceClass.ENERGY,
        SensorStateClass.TOTAL_INCREASING,
    ),
    "wattHour": (
        UnitOfEnergy.WATT_HOUR,
        SensorDeviceClass.ENERGY,
        SensorStateClass.TOTAL_INCREASING,
    ),
    "watt": (UnitOfPower.WATT, SensorDeviceClass.POWER, SensorStateClass.MEASUREMENT),
    "kilowatt": (
        UnitOfPower.KILO_WATT,
        SensorDeviceClass.POWER,
        SensorStateClass.MEASUREMENT,
    ),
    "percent": (PERCENTAGE, None, SensorStateClass.MEASUREMENT),
    "bar": (
        UnitOfPressure.BAR,
        SensorDeviceClass.PRESSURE,
        SensorStateClass.MEASUREMENT,
    ),
    "cubicMeter": (
        UnitOfVolume.CUBIC_METERS,
        SensorDeviceClass.GAS,
        SensorStateClass.TOTAL_INCREASING,
    ),
    "liter": (
        UnitOfVolume.LITERS,
        SensorDeviceClass.VOLUME,
        SensorStateClass.TOTAL_INCREASING,
    ),
    "hour": (
        UnitOfTime.HOURS,
        SensorDeviceClass.DURATION,
        SensorStateClass.TOTAL_INCREASING,
    ),
    "hours": (
        UnitOfTime.HOURS,
        SensorDeviceClass.DURATION,
        SensorStateClass.TOTAL_INCREASING,
    ),
    "minute": (
        UnitOfTime.MINUTES,
        SensorDeviceClass.DURATION,
        SensorStateClass.MEASUREMENT,
    ),
    "second": (
        UnitOfTime.SECONDS,
        SensorDeviceClass.DURATION,
        SensorStateClass.MEASUREMENT,
    ),
}

DE = "de"


def _t(runtime: PlusRuntime, de: str, en: str) -> str:
    return de if (runtime.language or "").startswith(DE) else en


def _as_number(value: float) -> float | int:
    return int(value) if float(value).is_integer() else value


# --------------------------------------------------------------------------
# Base
# --------------------------------------------------------------------------


OFF_STATES = (False, "off", "inactive", "disabled", "standby")


def group_device_info(
    ctx: DeviceContext,
    group: str,
    language: str | None,
    hass: HomeAssistant | None = None,
) -> DeviceInfo:
    """Return the device info of a thematic sub-device."""
    model = ctx.device.config.getModel().replace("_", " ")
    label = group_label(group, language, ctx.heatpump)
    sub_model = label
    if group.startswith("circuit_"):
        name = prop(ctx.features.get(f"heating.circuits.{group[8:]}.name"), "name")
        if isinstance(name, str) and name.strip():
            sub_model = f"{label} ({clean_string(name)})"
    info = DeviceInfo(
        identifiers={(DOMAIN, f"{ctx.identifier}_{group}")},
        name=f"{model} {label}",
        manufacturer="Viessmann",
        model=sub_model,
    )
    if hass is not None and (
        main := dr.async_get(hass).async_get_device(
            identifiers={(DOMAIN, ctx.identifier)}
        )
    ):
        info["via_device_id"] = main.id
    return info


class PlusEntity(ViCareCoordinatorEntity):
    """Base class of all coordinator backed ViCare Plus entities.

    Entities are clustered into thematic sub-devices (heating circuits, DHW,
    circulation, solar, boiler, system) linked to the main device.
    """

    _plus_group: str | None = None

    def __init__(
        self,
        runtime: PlusRuntime,
        ctx: DeviceContext,
        key: str,
        name: str,
        *,
        enabled: bool = True,
        category: EntityCategory | None = None,
    ) -> None:
        """Initialize the entity."""
        device = ctx.device
        assert device.coordinator is not None
        super().__init__(
            device.coordinator, f"plus-{key}", device.serial, device.config, device.api
        )
        self._runtime = runtime
        self._ctx = ctx
        self._group = self._plus_group or group_of(key.split(":", 1)[0])
        self._attr_name = strip_group_prefix(name, self._group, runtime.language)
        self._attr_entity_registry_enabled_default = enabled
        self._attr_entity_category = category
        self._icon_off: str | None = None
        if getattr(self, "_attr_icon", None) is None:
            icon, self._icon_off = icon_for(key)
            if icon is not None:
                self._attr_icon = icon
        self._features: FeatureMap = ctx.features
        self._present = True
        self._update_values()

    @property
    @override
    def device_info(self) -> DeviceInfo:
        return group_device_info(
            self._ctx, self._group, self._runtime.language, self.hass
        )

    @property
    @override
    def icon(self) -> str | None:
        if self._icon_off is not None and self._is_off():
            return self._icon_off
        return super().icon

    def _is_off(self) -> bool:
        state = getattr(self, "_attr_is_on", None)
        if state is None:
            state = getattr(self, "_attr_native_value", None)
        return state in OFF_STATES

    @override
    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        _inherit_area(self.hass, self._ctx, self._group)

    @override
    def _read_value(self) -> None:
        self._features = get_features(self._ctx.api)
        self._update_values()

    def _update_values(self) -> None:
        """Derive the entity state from self._features."""

    @property
    @override
    def available(self) -> bool:
        return super().available and self._present

    async def _async_send(
        self, feature: str, cmd: str, params: dict[str, Any] | None = None
    ) -> None:
        await self.hass.async_add_executor_job(
            execute_command, self._ctx.api, feature, cmd, params or {}
        )
        self.async_write_ha_state()
        await self.coordinator.async_request_refresh()


@callback
def _inherit_area(hass: HomeAssistant, ctx: DeviceContext, group: str) -> None:
    """Put a new sub-device into the area of its main device."""
    registry = dr.async_get(hass)
    sub = registry.async_get_device(identifiers={(DOMAIN, f"{ctx.identifier}_{group}")})
    main = registry.async_get_device(identifiers={(DOMAIN, ctx.identifier)})
    if sub is None or main is None or sub.area_id or not main.area_id:
        return
    # Only for freshly created sub-devices, a later manual choice is kept.
    if dt_util.utcnow() - sub.created_at > timedelta(minutes=10):
        return
    registry.async_update_device(sub.id, area_id=main.area_id)


# --------------------------------------------------------------------------
# Generic entities built from the feature model
# --------------------------------------------------------------------------


def _property_enabled(spec: PropertySpec) -> bool:
    return not (
        is_core_covered(spec.key) or is_noise(spec.key) or spec.kind == "connection"
    )


class PlusSensor(PlusEntity, SensorEntity):
    """Any readable value of the API."""

    def __init__(
        self, runtime: PlusRuntime, ctx: DeviceContext, spec: PropertySpec
    ) -> None:
        """Initialize the sensor."""
        self._spec = spec
        unit, device_class, state_class = UNITS.get(spec.unit or "", (None, None, None))
        if spec.kind == "number" and state_class is None and not spec.diagnostic:
            state_class = (
                SensorStateClass.TOTAL_INCREASING
                if spec.prop == "starts"
                else SensorStateClass.MEASUREMENT
            )
        if spec.kind == "array" and spec.index != 0:
            state_class = (
                None
                if device_class != SensorDeviceClass.ENERGY
                else SensorStateClass.TOTAL
            )
        if spec.kind == "string":
            unit = device_class = state_class = None
            if spec.prop in ("start", "end"):
                device_class = SensorDeviceClass.DATE
        self._attr_native_unit_of_measurement = unit
        self._attr_device_class = device_class
        self._attr_state_class = state_class
        super().__init__(
            runtime,
            ctx,
            spec.key,
            property_name(spec, runtime.language),
            enabled=_property_enabled(spec),
            category=EntityCategory.DIAGNOSTIC if spec.diagnostic else None,
        )

    @override
    def _update_values(self) -> None:
        self._present = self._spec.feature in self._features
        value = property_value(self._features, self._spec)
        if self._attr_device_class == SensorDeviceClass.DATE:
            value = _parse_date(value)
        self._attr_native_value = value
        self._attr_extra_state_attributes = {"feature": self._spec.feature}


def _parse_date(value: Any) -> date | None:
    if not isinstance(value, str) or not value:
        return None
    parsed = dt_util.parse_date(value[:10])
    return parsed


class PlusBinarySensor(PlusEntity, BinarySensorEntity):
    """Any on/off value of the API."""

    def __init__(
        self, runtime: PlusRuntime, ctx: DeviceContext, spec: PropertySpec
    ) -> None:
        """Initialize the binary sensor."""
        self._spec = spec
        feature = spec.feature
        if spec.kind == "connection":
            self._attr_device_class = BinarySensorDeviceClass.PROBLEM
        elif "pump" in feature or (
            spec.prop == "active"
            and (".burners." in feature or ".compressors." in feature)
        ):
            self._attr_device_class = BinarySensorDeviceClass.RUNNING
        super().__init__(
            runtime,
            ctx,
            spec.key,
            property_name(spec, runtime.language),
            enabled=_property_enabled(spec),
            category=EntityCategory.DIAGNOSTIC if spec.kind == "connection" else None,
        )

    @override
    def _update_values(self) -> None:
        self._present = self._spec.feature in self._features
        self._attr_is_on = property_value(self._features, self._spec)
        self._attr_extra_state_attributes = {"feature": self._spec.feature}


def _command_enabled(spec: CommandSpec) -> bool:
    return not (is_core_covered(spec.key) or is_noise(spec.key))


class PlusNumber(PlusEntity, NumberEntity):
    """A numeric setting of the API."""

    def __init__(
        self, runtime: PlusRuntime, ctx: DeviceContext, spec: CommandSpec
    ) -> None:
        """Initialize the number."""
        self._spec = spec
        self._attr_native_min_value = spec.minimum or 0
        self._attr_native_max_value = spec.maximum or 100
        self._attr_native_step = spec.step or 1
        self._attr_mode = NumberMode.BOX
        unit = UNITS.get(spec.unit or "", (None, None, None))[0]
        self._attr_native_unit_of_measurement = unit
        if spec.unit == "celsius":
            self._attr_device_class = NumberDeviceClass.TEMPERATURE
        super().__init__(
            runtime,
            ctx,
            spec.key,
            command_name(spec, runtime.language),
            enabled=_command_enabled(spec),
            category=EntityCategory.CONFIG,
        )

    @override
    def _update_values(self) -> None:
        feature = self._features.get(self._spec.feature)
        self._present = feature is not None
        self._attr_native_value = prop(feature, self._spec.value_prop or "value")

    @override
    async def async_set_native_value(self, value: float) -> None:
        await self._async_send(
            self._spec.feature,
            self._spec.command,
            {self._spec.param: _as_number(value)},
        )
        self._attr_native_value = value


class PlusSelect(PlusEntity, SelectEntity):
    """An enumerated setting of the API, e.g. the operating mode of a circuit."""

    def __init__(
        self, runtime: PlusRuntime, ctx: DeviceContext, spec: CommandSpec
    ) -> None:
        """Initialize the select."""
        self._spec = spec
        self._to_api = {camel_to_snake(option): option for option in spec.options}
        self._attr_options = list(self._to_api)
        if spec.feature.endswith("operating.modes.active"):
            self._attr_translation_key = "plus_operating_mode"
        super().__init__(
            runtime,
            ctx,
            spec.key,
            command_name(spec, runtime.language),
            enabled=_command_enabled(spec),
        )

    @override
    def _update_values(self) -> None:
        feature = self._features.get(self._spec.feature)
        self._present = feature is not None
        cmd = command(feature, self._spec.command)
        if cmd:
            enum = (
                cmd.get("params", {})
                .get(self._spec.param, {})
                .get("constraints", {})
                .get("enum")
            )
            if enum:
                self._to_api = {camel_to_snake(option): option for option in enum}
                self._attr_options = list(self._to_api)
        value = prop(feature, self._spec.value_prop or "value")
        option = camel_to_snake(value) if isinstance(value, str) else None
        if option is not None and option not in self._to_api:
            self._to_api[option] = value
            self._attr_options = [*self._attr_options, option]
        self._attr_current_option = option

    @override
    async def async_select_option(self, option: str) -> None:
        await self._async_send(
            self._spec.feature,
            self._spec.command,
            {self._spec.param: self._to_api.get(option, option)},
        )
        self._attr_current_option = option


class PlusText(PlusEntity, TextEntity):
    """A free text setting of the API, e.g. the name of a circuit."""

    def __init__(
        self, runtime: PlusRuntime, ctx: DeviceContext, spec: CommandSpec
    ) -> None:
        """Initialize the text."""
        self._spec = spec
        self._attr_native_min = spec.min_length or 0
        self._attr_native_max = spec.max_length or 100
        super().__init__(
            runtime,
            ctx,
            spec.key,
            command_name(spec, runtime.language),
            enabled=_command_enabled(spec),
            category=EntityCategory.CONFIG,
        )

    @override
    def _update_values(self) -> None:
        feature = self._features.get(self._spec.feature)
        self._present = feature is not None
        self._attr_native_value = clean_string(
            prop(feature, self._spec.value_prop or "name")
        )

    @override
    async def async_set_value(self, value: str) -> None:
        await self._async_send(
            self._spec.feature, self._spec.command, {self._spec.param: value}
        )
        self._attr_native_value = value


class PlusSwitch(PlusEntity, SwitchEntity):
    """A program that can be activated and deactivated."""

    def __init__(
        self, runtime: PlusRuntime, ctx: DeviceContext, spec: CommandSpec
    ) -> None:
        """Initialize the switch."""
        self._spec = spec
        super().__init__(
            runtime,
            ctx,
            spec.key,
            command_name(spec, runtime.language),
            enabled=_command_enabled(spec),
        )

    @override
    def _update_values(self) -> None:
        feature = self._features.get(self._spec.feature)
        self._present = feature is not None
        self._attr_is_on = prop(feature, self._spec.value_prop or "active")
        attributes: dict[str, Any] = {"feature": self._spec.feature}
        for name in (self._spec.command, self._spec.off_command):
            if name and (cmd := command(feature, name)) is not None:
                attributes[f"{camel_to_snake(name)}_executable"] = cmd.get(
                    "isExecutable", True
                )
        self._attr_extra_state_attributes = attributes

    @override
    async def async_turn_on(self, **kwargs: Any) -> None:
        if self._spec.off_command:
            await self._async_send(self._spec.feature, self._spec.command)
        else:
            await self._async_send(
                self._spec.feature, self._spec.command, {self._spec.param: True}
            )
        self._attr_is_on = True

    @override
    async def async_turn_off(self, **kwargs: Any) -> None:
        if self._spec.off_command:
            await self._async_send(self._spec.feature, self._spec.off_command)
        else:
            await self._async_send(
                self._spec.feature, self._spec.command, {self._spec.param: False}
            )
        self._attr_is_on = False


class PlusButton(PlusEntity, ButtonEntity):
    """A command without parameters."""

    def __init__(
        self, runtime: PlusRuntime, ctx: DeviceContext, spec: CommandSpec
    ) -> None:
        """Initialize the button."""
        self._spec = spec
        super().__init__(
            runtime,
            ctx,
            spec.key,
            command_name(spec, runtime.language),
            enabled=_command_enabled(spec),
            category=EntityCategory.CONFIG,
        )

    @override
    def _update_values(self) -> None:
        feature = self._features.get(self._spec.feature)
        cmd = command(feature, self._spec.command)
        self._present = cmd is not None
        self._attr_extra_state_attributes = {
            "feature": self._spec.feature,
            "executable": bool(cmd and cmd.get("isExecutable", True)),
        }

    @override
    async def async_press(self) -> None:
        await self._async_send(self._spec.feature, self._spec.command)


# --------------------------------------------------------------------------
# Time programs
# --------------------------------------------------------------------------


def _schedule_base_label(runtime: PlusRuntime, spec: ScheduleSpec) -> str:
    return feature_label(spec.feature.removesuffix(".schedule"), runtime.language)


def _strip_positions(entries: Any) -> dict[str, list[dict[str, Any]]]:
    if not isinstance(entries, dict):
        return {}
    return {
        day: [
            {"start": e.get("start"), "end": e.get("end"), "mode": e.get("mode")}
            for e in entries.get(day, []) or []
        ]
        for day in WEEKDAYS
    }


class ScheduleSensor(PlusEntity, SensorEntity):
    """A time program with its current state, the week plan and the next switch."""

    _attr_icon = "mdi:calendar-clock"

    def __init__(
        self, runtime: PlusRuntime, ctx: DeviceContext, spec: ScheduleSpec
    ) -> None:
        """Initialize the schedule sensor."""
        self._spec = spec
        self._attr_device_class = SensorDeviceClass.ENUM
        self._attr_options = sorted({spec.default_mode, *spec.modes})
        super().__init__(
            runtime,
            ctx,
            f"{spec.feature}:schedule",
            feature_label(spec.feature, runtime.language),
        )

    @property
    def spec(self) -> ScheduleSpec:
        """Return the schedule spec."""
        return self._spec

    @override
    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        if self._runtime.overrides is not None:
            self.async_on_remove(
                self._runtime.overrides.async_add_listener(self._handle_override_change)
            )

    @callback
    def _handle_override_change(self) -> None:
        self._update_values()
        self.async_write_ha_state()

    def _entries(self) -> dict[str, Any] | None:
        entries = prop(self._features.get(self._spec.feature), "entries")
        return entries if isinstance(entries, dict) else None

    @override
    def _update_values(self) -> None:
        entries = self._entries()
        self._present = entries is not None
        if entries is None:
            return
        now = dt_util.now()
        self._attr_native_value = mode_at(entries, self._spec.default_mode, now)
        change = next_change(entries, self._spec.default_mode, now)
        override = (
            self._runtime.overrides.get(self._ctx, self._spec.feature)
            if self._runtime.overrides
            else None
        )
        self._attr_extra_state_attributes = {
            "feature": self._spec.feature,
            "next_change": change[0].isoformat() if change else None,
            "next_mode": change[1] if change else None,
            "modes": list(self._spec.modes),
            "default_mode": self._spec.default_mode,
            "max_entries": self._spec.max_entries,
            "resolution": self._spec.resolution,
            "override": override["kind"] if override else None,
            "override_until": override.get("until") if override else None,
            "schedule": _strip_positions(entries),
        }

    async def async_set_schedule(
        self,
        schedule: dict[str, Any] | None = None,
        day: str | None = None,
        entries: list[dict[str, Any]] | None = None,
    ) -> None:
        """Write a full week, or a single day, of the time program."""
        current = _strip_positions(self._entries())
        if schedule is not None:
            unknown = set(schedule) - set(WEEKDAYS)
            if unknown:
                raise ServiceValidationError(f"Unknown days: {sorted(unknown)}")
            new = {**current, **schedule}
        elif day is not None:
            new = {**current, day: entries or []}
        else:
            raise ServiceValidationError(
                "Provide either 'schedule' or 'day' with 'entries'"
            )
        try:
            validated = validate_schedule(new, self._spec)
        except ScheduleError as err:
            raise ServiceValidationError(str(err)) from err
        if self._runtime.overrides is not None:
            self._runtime.overrides.async_forget(self._ctx, self._spec.feature)
        await self.hass.async_add_executor_job(
            write_schedule, self._ctx, self._spec.feature, validated
        )
        await self.coordinator.async_request_refresh()

    async def async_reset_schedule(self, day: str | None = None) -> None:
        """Reset the time program, or a single day, to the factory default."""
        if self._runtime.overrides is not None:
            self._runtime.overrides.async_forget(self._ctx, self._spec.feature)
        if day:
            await self._async_send(self._spec.feature, "resetDay", {"day": day})
        else:
            await self._async_send(self._spec.feature, "resetSchedule")

    async def async_boost(self, duration: timedelta, mode: str | None = None) -> None:
        """Activate the program from now on for the given duration."""
        assert self._runtime.overrides is not None
        await self._runtime.overrides.async_boost(self._ctx, self._spec, duration, mode)

    async def async_restore(self) -> None:
        """End a boost or permanent override and restore the original program."""
        assert self._runtime.overrides is not None
        if not await self._runtime.overrides.async_restore(
            self._ctx, self._spec.feature
        ):
            raise ServiceValidationError("No override active for this time program")


def _schedule_on_by_default(spec: ScheduleSpec) -> bool:
    # Hot water and circulation are typical one-shot use cases; heating
    # circuits have dedicated operating modes for that.
    return ".circuits." not in spec.feature


class SchedulePermanentSwitch(PlusEntity, SwitchEntity):
    """Keep a time program on around the clock, restoring it when turned off."""

    _attr_icon = "mdi:calendar-lock"

    def __init__(
        self, runtime: PlusRuntime, ctx: DeviceContext, spec: ScheduleSpec
    ) -> None:
        """Initialize the switch."""
        self._spec = spec
        super().__init__(
            runtime,
            ctx,
            f"{spec.feature}:permanent",
            f"{_schedule_base_label(runtime, spec)} {_t(runtime, 'Dauerbetrieb', 'permanent')}",
            enabled=_schedule_on_by_default(spec),
        )

    @override
    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        assert self._runtime.overrides is not None
        self.async_on_remove(
            self._runtime.overrides.async_add_listener(self._handle_override_change)
        )

    @callback
    def _handle_override_change(self) -> None:
        self._update_values()
        self.async_write_ha_state()

    @override
    def _update_values(self) -> None:
        self._present = self._spec.feature in self._features
        override = (
            self._runtime.overrides.get(self._ctx, self._spec.feature)
            if self._runtime.overrides
            else None
        )
        self._attr_is_on = bool(override and override["kind"] == KIND_PERMANENT)

    @override
    async def async_turn_on(self, **kwargs: Any) -> None:
        assert self._runtime.overrides is not None
        await self._runtime.overrides.async_set_permanent(self._ctx, self._spec)

    @override
    async def async_turn_off(self, **kwargs: Any) -> None:
        assert self._runtime.overrides is not None
        await self._runtime.overrides.async_restore(self._ctx, self._spec.feature)


class ScheduleBoostButton(PlusEntity, ButtonEntity):
    """Switch a time program on from now for the configured boost duration."""

    _attr_icon = "mdi:rocket-launch"

    def __init__(
        self, runtime: PlusRuntime, ctx: DeviceContext, spec: ScheduleSpec
    ) -> None:
        """Initialize the button."""
        self._spec = spec
        super().__init__(
            runtime,
            ctx,
            f"{spec.feature}:boost",
            f"{_schedule_base_label(runtime, spec)} Boost",
            enabled=_schedule_on_by_default(spec),
        )

    @override
    def _update_values(self) -> None:
        self._present = self._spec.feature in self._features

    @override
    async def async_press(self) -> None:
        assert self._runtime.overrides is not None
        minutes = self._runtime.boost_minutes.get(self._spec.feature, 30)
        await self._runtime.overrides.async_boost(
            self._ctx, self._spec, timedelta(minutes=minutes)
        )


class ScheduleBoostDuration(ViCareEntity, RestoreNumber):
    """Duration used by the boost button of a time program."""

    _attr_should_poll = False
    _attr_entity_category = EntityCategory.CONFIG
    _attr_native_min_value = 10
    _attr_native_max_value = 360
    _attr_native_step = 10
    _attr_native_unit_of_measurement = UnitOfTime.MINUTES
    _attr_mode = NumberMode.BOX
    _attr_icon = "mdi:timer-cog-outline"

    def __init__(
        self, runtime: PlusRuntime, ctx: DeviceContext, spec: ScheduleSpec
    ) -> None:
        """Initialize the number."""
        device = ctx.device
        super().__init__(
            f"plus-{spec.feature}:boost_duration",
            device.serial,
            device.config,
            device.api,
        )
        self._runtime = runtime
        self._ctx = ctx
        self._feature = spec.feature
        self._group = group_of(spec.feature)
        self._attr_name = strip_group_prefix(
            f"{_schedule_base_label(runtime, spec)} "
            f"{_t(runtime, 'Boost-Dauer', 'boost duration')}",
            self._group,
            runtime.language,
        )
        self._attr_entity_registry_enabled_default = _schedule_on_by_default(spec)
        self._attr_native_value = 30

    @property
    @override
    def device_info(self) -> DeviceInfo:
        return group_device_info(
            self._ctx, self._group, self._runtime.language, self.hass
        )

    @override
    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        _inherit_area(self.hass, self._ctx, self._group)
        if (data := await self.async_get_last_number_data()) is not None and (
            data.native_value is not None
        ):
            self._attr_native_value = data.native_value
        self._runtime.boost_minutes[self._feature] = float(
            self._attr_native_value or 30
        )

    @override
    async def async_set_native_value(self, value: float) -> None:
        self._attr_native_value = value
        self._runtime.boost_minutes[self._feature] = value
        self.async_write_ha_state()


# --------------------------------------------------------------------------
# Derived values
# --------------------------------------------------------------------------


class HeatingCurveSensor(PlusEntity, SensorEntity):
    """Target supply temperature calculated from the heating curve."""

    _attr_device_class = SensorDeviceClass.TEMPERATURE
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS
    _attr_suggested_display_precision = 1
    _attr_icon = "mdi:chart-bell-curve-cumulative"

    def __init__(
        self, runtime: PlusRuntime, ctx: DeviceContext, circuit: str, deviation: bool
    ) -> None:
        """Initialize the sensor."""
        self._circuit = circuit
        self._deviation = deviation
        label = feature_label(f"heating.circuits.{circuit}", runtime.language)
        if deviation:
            name = f"{label} {_t(runtime, 'Vorlauf Abweichung zur Heizkurve', 'supply deviation from heating curve')}"
            self._attr_device_class = None
            self._attr_native_unit_of_measurement = UnitOfTemperature.KELVIN
        else:
            name = f"{label} {_t(runtime, 'Soll-Vorlauftemperatur (Heizkurve)', 'target supply temperature (heating curve)')}"
        super().__init__(
            runtime,
            ctx,
            f"heating.circuits.{circuit}:{'curve_deviation' if deviation else 'curve_target'}",
            name,
        )

    @override
    def _update_values(self) -> None:
        features = self._features
        curve = features.get(f"heating.circuits.{self._circuit}.heating.curve")
        outside = prop(features.get("heating.sensors.temperature.outside"), "value")
        shift = prop(curve, "shift")
        slope = prop(curve, "slope")
        room, program = circuit_room_setpoint(features, self._circuit)
        self._present = curve is not None
        if None in (outside, shift, slope, room):
            self._attr_native_value = None
            return
        target = heating_curve_supply(outside, room, shift, slope, self._ctx.heatpump)
        mode = prop(
            features.get(f"heating.circuits.{self._circuit}.operating.modes.active"),
            "value",
        )
        attributes = {
            "outside_temperature": outside,
            "room_setpoint": room,
            "room_setpoint_program": program,
            "shift": shift,
            "slope": slope,
            "operating_mode": mode,
            "heating_enabled": mode not in ("standby", "dhw"),
        }
        if self._deviation:
            supply = prop(
                features.get(
                    f"heating.circuits.{self._circuit}.sensors.temperature.supply"
                ),
                "value",
            )
            self._attr_native_value = (
                None if supply is None else round(supply - target, 1)
            )
            attributes["supply_temperature"] = supply
            attributes["target_supply_temperature"] = target
        else:
            self._attr_native_value = target
        self._attr_extra_state_attributes = attributes


RETURN_FEATURES = (
    "heating.sensors.temperature.return",
    "heating.boiler.sensors.temperature.return",
    "heating.primaryCircuit.sensors.temperature.return",
    "heating.secondaryCircuit.sensors.temperature.return",
)
SUPPLY_FEATURES = (
    "heating.boiler.sensors.temperature.main",
    "heating.boiler.sensors.temperature.commonSupply",
    "heating.sensors.temperature.commonSupply",
    "heating.secondaryCircuit.sensors.temperature.supply",
)


def _first_value(features: FeatureMap, names: tuple[str, ...]) -> tuple[str, Any]:
    for name in names:
        feature = features.get(name)
        if feature is not None and feature.get("isEnabled", True):
            value = prop(feature, "value")
            if isinstance(value, (int, float)):
                return name, value
    return "", None


class SpreadSensor(PlusEntity, SensorEntity):
    """Difference between supply/boiler and return temperature.

    Uses a return sensor of the device if it has one, otherwise the external
    temperature sensor configured in the options.
    """

    _attr_native_unit_of_measurement = UnitOfTemperature.KELVIN
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 1
    _attr_icon = "mdi:thermometer-lines"

    def __init__(self, runtime: PlusRuntime, ctx: DeviceContext) -> None:
        """Initialize the sensor."""
        self._external = runtime.return_entity
        self._external_value: float | None = None
        super().__init__(
            runtime,
            ctx,
            "heating.boiler:spread",
            _t(
                runtime,
                "Kessel Spreizung Vorlauf/Rücklauf",
                "Boiler supply/return spread",
            ),
        )

    @override
    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        if self._external is None:
            return
        self._read_external()
        self._update_values()
        self.async_write_ha_state()

        @callback
        def _changed(_event: Any) -> None:
            self._read_external()
            self._update_values()
            self.async_write_ha_state()

        self.async_on_remove(
            async_track_state_change_event(self.hass, [self._external], _changed)
        )

    @callback
    def _read_external(self) -> None:
        state = self.hass.states.get(self._external) if self._external else None
        try:
            self._external_value = float(state.state) if state else None
        except ValueError:
            self._external_value = None
        if (
            state is not None
            and self._external_value is not None
            and state.attributes.get("unit_of_measurement")
            == UnitOfTemperature.FAHRENHEIT
        ):
            self._external_value = (self._external_value - 32) / 1.8

    @override
    def _update_values(self) -> None:
        supply_feature, supply = _first_value(self._features, SUPPLY_FEATURES)
        return_feature, ret = _first_value(self._features, RETURN_FEATURES)
        if ret is None and self._external is not None:
            return_feature, ret = self._external, self._external_value
        self._attr_native_value = (
            None if supply is None or ret is None else round(supply - ret, 1)
        )
        self._attr_extra_state_attributes = {
            "supply_temperature": supply,
            "supply_source": supply_feature or None,
            "return_temperature": None if ret is None else round(ret, 1),
            "return_source": return_feature or None,
        }


class SolarDeltaSensor(PlusEntity, SensorEntity):
    """Temperature difference between solar collector and storage."""

    _attr_native_unit_of_measurement = UnitOfTemperature.KELVIN
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 1
    _attr_icon = "mdi:delta"

    def __init__(self, runtime: PlusRuntime, ctx: DeviceContext) -> None:
        """Initialize the sensor."""
        super().__init__(
            runtime,
            ctx,
            "heating.solar:delta",
            _t(
                runtime,
                "Solar Temperaturdifferenz Kollektor/Speicher",
                "Solar collector/storage delta",
            ),
        )

    @override
    def _update_values(self) -> None:
        collector = prop(
            self._features.get("heating.solar.sensors.temperature.collector"), "value"
        )
        storage = prop(
            self._features.get("heating.solar.sensors.temperature.dhw"), "value"
        )
        self._present = collector is not None and storage is not None
        self._attr_native_value = (
            round(collector - storage, 1) if self._present else None
        )


class BurnerDerivedSensor(PlusEntity, SensorEntity):
    """Cycling statistics of a burner."""

    def __init__(
        self, runtime: PlusRuntime, ctx: DeviceContext, burner: str, kind: str
    ) -> None:
        """Initialize the sensor."""
        self._burner = burner
        self._kind = kind
        label = feature_label(f"heating.burners.{burner}", runtime.language)
        names = {
            "avg_runtime": _t(
                runtime, "Ø Laufzeit pro Start", "average runtime per start"
            ),
            "starts_last_hour": _t(runtime, "Starts letzte Stunde", "starts last hour"),
            "last_run": _t(runtime, "letzte Laufzeit", "last runtime"),
            "last_pause": _t(runtime, "letzte Pause", "last pause"),
        }
        if kind == "starts_last_hour":
            self._attr_state_class = SensorStateClass.MEASUREMENT
            self._attr_icon = "mdi:counter"
        else:
            self._attr_native_unit_of_measurement = UnitOfTime.MINUTES
            self._attr_device_class = SensorDeviceClass.DURATION
            self._attr_state_class = SensorStateClass.MEASUREMENT
            self._attr_suggested_display_precision = 1
            self._attr_icon = {
                "avg_runtime": "mdi:timer-sand",
                "last_run": "mdi:timer-play-outline",
                "last_pause": "mdi:timer-pause-outline",
            }[kind]
        super().__init__(
            runtime, ctx, f"heating.burners.{burner}:{kind}", f"{label} {names[kind]}"
        )

    @override
    def _update_values(self) -> None:
        tracker = self._ctx.burners.get(self._burner)
        value: float | None = None
        if self._kind == "avg_runtime":
            stats = self._features.get(f"heating.burners.{self._burner}.statistics")
            hours = prop(stats, "hours")
            starts = prop(stats, "starts")
            self._present = stats is not None
            if hours is not None and starts:
                value = round(hours * 60 / starts, 1)
        elif tracker is not None:
            if self._kind == "starts_last_hour":
                value = tracker.starts_within(dt_util.utcnow(), timedelta(hours=1))
            elif self._kind == "last_run":
                value = None if tracker.last_run is None else round(tracker.last_run, 1)
            elif self._kind == "last_pause":
                value = (
                    None if tracker.last_pause is None else round(tracker.last_pause, 1)
                )
        self._attr_native_value = value


class BurnerCyclingBinarySensor(PlusEntity, BinarySensorEntity):
    """Detect short cycling (too many burner starts per hour)."""

    _attr_device_class = BinarySensorDeviceClass.PROBLEM
    _attr_icon = "mdi:sine-wave"

    def __init__(self, runtime: PlusRuntime, ctx: DeviceContext, burner: str) -> None:
        """Initialize the binary sensor."""
        self._burner = burner
        label = feature_label(f"heating.burners.{burner}", runtime.language)
        super().__init__(
            runtime,
            ctx,
            f"heating.burners.{burner}:cycling",
            f"{label} {_t(runtime, 'Taktung', 'short cycling')}",
        )

    @override
    def _update_values(self) -> None:
        tracker = self._ctx.burners.get(self._burner)
        starts = (
            tracker.starts_within(dt_util.utcnow(), timedelta(hours=1))
            if tracker
            else None
        )
        threshold = self._runtime.cycling_threshold
        self._attr_is_on = None if starts is None else starts >= threshold
        self._attr_extra_state_attributes = {
            "starts_last_hour": starts,
            "threshold": threshold,
        }


@dataclass
class _DailyData(ExtraStoredData):
    day: str | None
    value: float
    baseline: float | None = None

    def as_dict(self) -> dict[str, Any]:
        return {"day": self.day, "value": self.value, "baseline": self.baseline}


class _DailyRestoreSensor(PlusEntity, SensorEntity, RestoreEntity):
    """Base for counters that reset at local midnight."""

    _day: str | None = None
    _value: float = 0.0
    _baseline: float | None = None

    @override
    async def async_added_to_hass(self) -> None:
        if (extra := await self.async_get_last_extra_data()) is not None:
            data = extra.as_dict()
            if data.get("day") == dt_util.now().date().isoformat():
                self._day = data["day"]
                self._value = float(data.get("value") or 0)
                self._baseline = data.get("baseline")
        await super().async_added_to_hass()

    @property
    @override
    def extra_restore_state_data(self) -> ExtraStoredData:
        return _DailyData(self._day, self._value, self._baseline)

    def _roll_day(self) -> bool:
        today = dt_util.now().date().isoformat()
        if self._day != today:
            self._day = today
            self._value = 0.0
            self._baseline = None
            return True
        return False


class RuntimeTodaySensor(_DailyRestoreSensor):
    """Runtime today of a pump or burner, integrated from its on/off state."""

    _attr_device_class = SensorDeviceClass.DURATION
    _attr_state_class = SensorStateClass.TOTAL_INCREASING
    _attr_native_unit_of_measurement = UnitOfTime.HOURS
    _attr_suggested_display_precision = 2
    _attr_icon = "mdi:timer-outline"

    def __init__(
        self, runtime: PlusRuntime, ctx: DeviceContext, spec: PropertySpec
    ) -> None:
        """Initialize the sensor."""
        self._spec = spec
        self._last_on: bool | None = None
        self._last_time: datetime | None = None
        name = (
            f"{feature_label(spec.feature, runtime.language)} "
            f"{_t(runtime, 'Laufzeit heute', 'runtime today')}"
        )
        super().__init__(runtime, ctx, f"{spec.key}:runtime_today", name)

    @override
    def _update_values(self) -> None:
        self._present = self._spec.feature in self._features
        now = dt_util.now()
        is_on = property_value(self._features, self._spec)
        if self._last_time is not None and self._last_on:
            elapsed = now - self._last_time
            # Ignore gaps (restart, outage) longer than a few polling cycles.
            limit = timedelta(seconds=max(self._runtime.scan_interval, 60) * 5)
            if elapsed <= limit:
                if self._roll_day():
                    midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
                    elapsed = min(elapsed, now - midnight)
                self._value += elapsed.total_seconds() / 3600
        self._roll_day()
        self._last_on = bool(is_on) if is_on is not None else None
        self._last_time = now
        self._attr_native_value = round(self._value, 3)


class BurnerStartsTodaySensor(_DailyRestoreSensor):
    """Burner starts since local midnight."""

    _attr_state_class = SensorStateClass.TOTAL_INCREASING
    _attr_icon = "mdi:counter"

    def __init__(self, runtime: PlusRuntime, ctx: DeviceContext, burner: str) -> None:
        """Initialize the sensor."""
        self._burner = burner
        label = feature_label(f"heating.burners.{burner}", runtime.language)
        super().__init__(
            runtime,
            ctx,
            f"heating.burners.{burner}:starts_today",
            f"{label} {_t(runtime, 'Starts heute', 'starts today')}",
        )

    @override
    def _update_values(self) -> None:
        starts = prop(
            self._features.get(f"heating.burners.{self._burner}.statistics"), "starts"
        )
        self._present = starts is not None
        if starts is None:
            return
        self._roll_day()
        if self._baseline is None or starts < self._baseline:
            self._baseline = starts
        self._value = starts - self._baseline
        self._attr_native_value = int(self._value)


@dataclass
class _ApiCallData(ExtraStoredData):
    timestamps: list[float]

    def as_dict(self) -> dict[str, Any]:
        return {"timestamps": self.timestamps}


class ApiCallsSensor(PlusEntity, SensorEntity, RestoreEntity):
    """API requests in the rolling 24 h window the Viessmann quota uses."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_icon = "mdi:api"

    def __init__(self, runtime: PlusRuntime, ctx: DeviceContext) -> None:
        """Initialize the sensor."""
        super().__init__(
            runtime,
            ctx,
            "api_calls_24h",
            _t(runtime, "API-Aufrufe (24 h)", "API calls (24 h)"),
            category=EntityCategory.DIAGNOSTIC,
        )

    @override
    async def async_added_to_hass(self) -> None:
        if (extra := await self.async_get_last_extra_data()) is not None:
            self._runtime.restore_api_calls(extra.as_dict().get("timestamps") or [])
        await super().async_added_to_hass()

    @property
    @override
    def extra_restore_state_data(self) -> ExtraStoredData:
        self._runtime.api_calls_last_24h()
        return _ApiCallData(list(self._runtime.api_calls))

    @override
    def _update_values(self) -> None:
        calls = self._runtime.api_calls_last_24h()
        self._attr_native_value = calls
        self._attr_extra_state_attributes = {
            "limit": API_DAILY_LIMIT,
            "usage_percent": round(calls * 100 / API_DAILY_LIMIT, 1),
            "polling_interval_s": self._runtime.scan_interval,
        }


# --------------------------------------------------------------------------
# Builders
# --------------------------------------------------------------------------


def build_entities(runtime: PlusRuntime, platform: str) -> list[Entity]:
    """Return all ViCare Plus entities of a platform."""
    entities: list[Entity] = []
    for ctx in runtime.devices:
        if ctx.device.coordinator is None:
            continue
        disc = ctx.discovery
        for pspec in disc.properties:
            if pspec.platform != platform or is_duplicate(pspec.key, ctx.features):
                continue
            if platform == "sensor":
                entities.append(PlusSensor(runtime, ctx, pspec))
            elif platform == "binary_sensor":
                entities.append(PlusBinarySensor(runtime, ctx, pspec))
        for cspec in disc.commands:
            if cspec.platform != platform or is_duplicate(cspec.key, ctx.features):
                continue
            entities.append(
                {
                    "number": PlusNumber,
                    "select": PlusSelect,
                    "text": PlusText,
                    "switch": PlusSwitch,
                    "button": PlusButton,
                }[platform](runtime, ctx, cspec)
            )
        for sspec in disc.schedules:
            if platform == "sensor":
                entities.append(ScheduleSensor(runtime, ctx, sspec))
            elif platform == "switch":
                entities.append(SchedulePermanentSwitch(runtime, ctx, sspec))
            elif platform == "button":
                entities.append(ScheduleBoostButton(runtime, ctx, sspec))
            elif platform == "number":
                entities.append(ScheduleBoostDuration(runtime, ctx, sspec))
        if platform == "sensor":
            entities.extend(_derived_sensors(runtime, ctx))
        if platform == "binary_sensor":
            entities.extend(
                BurnerCyclingBinarySensor(runtime, ctx, burner)
                for burner in ctx.burners
            )
    if platform == "sensor" and runtime.devices:
        first = next((c for c in runtime.devices if c.device.coordinator), None)
        if first is not None:
            entities.append(ApiCallsSensor(runtime, first))
    return entities


def _derived_sensors(runtime: PlusRuntime, ctx: DeviceContext) -> list[Entity]:
    features = ctx.features
    entities: list[Entity] = []
    if "heating.sensors.temperature.outside" in features:
        for name in sorted(features):
            parts = name.split(".")
            if (
                len(parts) == 5
                and parts[1] == "circuits"
                and parts[3:] == ["heating", "curve"]
                and features[name].get("isEnabled", True)
            ):
                entities.append(HeatingCurveSensor(runtime, ctx, parts[2], False))
                if (
                    f"heating.circuits.{parts[2]}.sensors.temperature.supply"
                    in features
                ):
                    entities.append(HeatingCurveSensor(runtime, ctx, parts[2], True))
    if (
        "heating.solar.sensors.temperature.collector" in features
        and "heating.solar.sensors.temperature.dhw" in features
    ):
        entities.append(SolarDeltaSensor(runtime, ctx))
    if _first_value(features, SUPPLY_FEATURES)[1] is not None and (
        runtime.return_entity or _first_value(features, RETURN_FEATURES)[1] is not None
    ):
        entities.append(SpreadSensor(runtime, ctx))
    for burner in ctx.burners:
        entities.extend(
            BurnerDerivedSensor(runtime, ctx, burner, kind)
            for kind in ("avg_runtime", "starts_last_hour", "last_run", "last_pause")
        )
        entities.append(BurnerStartsTodaySensor(runtime, ctx, burner))
    for pspec in ctx.discovery.properties:
        if pspec.kind == "status" and "pump" in pspec.feature:
            entities.append(RuntimeTodaySensor(runtime, ctx, pspec))
        elif (
            pspec.kind == "boolean"
            and pspec.prop == "active"
            and pspec.feature.startswith("heating.burners.")
        ):
            entities.append(RuntimeTodaySensor(runtime, ctx, pspec))
    return entities


async def async_setup_plus_platform(
    hass: HomeAssistant,
    entry_id: str,
    platform: str,
    async_add_entities: Any,
) -> None:
    """Add the ViCare Plus entities of a platform."""
    from .runtime import get_runtime  # noqa: PLC0415

    runtime = get_runtime(hass, entry_id)
    if runtime is None:
        return
    async_add_entities(build_entities(runtime, platform))
