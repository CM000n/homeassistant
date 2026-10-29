"""Services of ViCare Plus."""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any

import voluptuous as vol

from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
)
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv, device_registry as dr
from homeassistant.helpers.entity_platform import EntityPlatform

from ..const import DOMAIN
from .logic import WEEKDAYS, clean_string, get_features
from .runtime import DeviceContext, execute_command, iter_runtimes

ATTR_DEVICE_ID = "device_id"
ATTR_FEATURE = "feature"
ATTR_COMMAND = "command"
ATTR_PARAMS = "params"
ATTR_FILTER = "filter"
ATTR_START = "start"
ATTR_END = "end"
ATTR_SCHEDULE = "schedule"
ATTR_DAY = "day"
ATTR_ENTRIES = "entries"
ATTR_DURATION = "duration"
ATTR_MODE = "mode"

HOLIDAY_FEATURE = "heating.operating.programs.holiday"

_ENTRY_SCHEMA = vol.Schema(
    {
        vol.Required("start"): cv.string,
        vol.Required("end"): cv.string,
        vol.Optional("mode"): cv.string,
    },
    extra=vol.ALLOW_EXTRA,
)


def _resolve_device(hass: HomeAssistant, device_id: str | None) -> DeviceContext:
    contexts = [ctx for runtime in iter_runtimes(hass) for ctx in runtime.devices]
    if device_id is None:
        if len(contexts) == 1:
            return contexts[0]
        raise ServiceValidationError(
            "Several ViCare devices found, please select one via device_id"
        )
    device = dr.async_get(hass).async_get(device_id)
    if device is None:
        raise ServiceValidationError(f"Unknown device {device_id}")
    identifiers = {value for domain, value in device.identifiers if domain == DOMAIN}
    for ctx in contexts:
        if ctx.identifier in identifiers:
            return ctx
    raise ServiceValidationError(f"Device {device_id} is not a loaded ViCare device")


async def _async_refresh(ctx: DeviceContext) -> None:
    if ctx.device.coordinator is not None:
        await ctx.device.coordinator.async_request_refresh()


def _summarize(features: dict[str, Any], text_filter: str | None) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for name in sorted(features):
        if text_filter and text_filter.lower() not in name.lower():
            continue
        feature = features[name]
        result[name] = {
            "enabled": feature.get("isEnabled", True),
            "properties": {
                key: {
                    "value": clean_string(value.get("value")),
                    **({"unit": value["unit"]} if value.get("unit") else {}),
                }
                for key, value in (feature.get("properties") or {}).items()
                if isinstance(value, dict)
            },
            "commands": {
                key: {
                    "executable": cmd.get("isExecutable", True),
                    "params": cmd.get("params", {}),
                }
                for key, cmd in (feature.get("commands") or {}).items()
            },
        }
    return result


def async_setup_services(hass: HomeAssistant) -> None:
    """Register the device level services."""

    async def execute(call: ServiceCall) -> ServiceResponse:
        ctx = _resolve_device(hass, call.data.get(ATTR_DEVICE_ID))
        response = await hass.async_add_executor_job(
            execute_command,
            ctx.api,
            call.data[ATTR_FEATURE],
            call.data[ATTR_COMMAND],
            call.data.get(ATTR_PARAMS) or {},
        )
        await _async_refresh(ctx)
        if call.return_response:
            return {"response": response}
        return None

    async def features(call: ServiceCall) -> ServiceResponse:
        ctx = _resolve_device(hass, call.data.get(ATTR_DEVICE_ID))
        data = await hass.async_add_executor_job(get_features, ctx.api)
        return {"features": _summarize(data, call.data.get(ATTR_FILTER))}

    async def set_holiday(call: ServiceCall) -> None:
        ctx = _resolve_device(hass, call.data.get(ATTR_DEVICE_ID))
        start: date = call.data[ATTR_START]
        end: date = call.data[ATTR_END]
        if end <= start:
            raise ServiceValidationError("The end date must be after the start date")
        for feature in await _holiday_features(hass, ctx):
            await hass.async_add_executor_job(
                execute_command,
                ctx.api,
                feature,
                "schedule",
                {"start": start.isoformat(), "end": end.isoformat()},
            )
        await _async_refresh(ctx)

    async def end_holiday(call: ServiceCall) -> None:
        ctx = _resolve_device(hass, call.data.get(ATTR_DEVICE_ID))
        for feature in await _holiday_features(hass, ctx):
            await hass.async_add_executor_job(
                execute_command, ctx.api, feature, "unschedule", {}
            )
        await _async_refresh(ctx)

    device_schema = {vol.Optional(ATTR_DEVICE_ID): cv.string}
    hass.services.async_register(
        DOMAIN,
        "execute_command",
        execute,
        schema=vol.Schema(
            {
                **device_schema,
                vol.Required(ATTR_FEATURE): cv.string,
                vol.Required(ATTR_COMMAND): cv.string,
                vol.Optional(ATTR_PARAMS, default={}): dict,
            }
        ),
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        "get_features",
        features,
        schema=vol.Schema({**device_schema, vol.Optional(ATTR_FILTER): cv.string}),
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN,
        "set_holiday",
        set_holiday,
        schema=vol.Schema(
            {
                **device_schema,
                vol.Required(ATTR_START): cv.date,
                vol.Required(ATTR_END): cv.date,
            }
        ),
    )
    hass.services.async_register(
        DOMAIN, "end_holiday", end_holiday, schema=vol.Schema(device_schema)
    )


async def _holiday_features(hass: HomeAssistant, ctx: DeviceContext) -> list[str]:
    features = await hass.async_add_executor_job(get_features, ctx.api)
    if HOLIDAY_FEATURE in features and features[HOLIDAY_FEATURE].get("isEnabled", True):
        return [HOLIDAY_FEATURE]
    names = [
        name
        for name, feature in features.items()
        if name.endswith(".operating.programs.holiday")
        and feature.get("isEnabled", True)
        and "schedule" in (feature.get("commands") or {})
    ]
    if not names:
        raise ServiceValidationError("This device offers no holiday program")
    return names


def async_register_schedule_services(platform: EntityPlatform) -> None:
    """Register the entity services of the time program sensors."""
    from .entity import ScheduleSensor  # noqa: PLC0415

    def _schedule(entity: Any) -> ScheduleSensor:
        if not isinstance(entity, ScheduleSensor):
            raise ServiceValidationError(
                f"{entity.entity_id} is not a ViCare time program sensor"
            )
        return entity

    async def set_schedule(entity: Any, call: ServiceCall) -> None:
        await _schedule(entity).async_set_schedule(
            call.data.get(ATTR_SCHEDULE),
            call.data.get(ATTR_DAY),
            call.data.get(ATTR_ENTRIES),
        )

    async def reset_schedule(entity: Any, call: ServiceCall) -> None:
        await _schedule(entity).async_reset_schedule(call.data.get(ATTR_DAY))

    async def boost(entity: Any, call: ServiceCall) -> None:
        await _schedule(entity).async_boost(
            call.data[ATTR_DURATION], call.data.get(ATTR_MODE)
        )

    async def restore(entity: Any, call: ServiceCall) -> None:
        await _schedule(entity).async_restore()

    day = vol.In(WEEKDAYS)
    platform.async_register_entity_service(
        "set_schedule",
        {
            vol.Optional(ATTR_SCHEDULE): vol.Schema({day: [_ENTRY_SCHEMA]}),
            vol.Optional(ATTR_DAY): day,
            vol.Optional(ATTR_ENTRIES): [_ENTRY_SCHEMA],
        },
        set_schedule,
    )
    platform.async_register_entity_service(
        "reset_schedule", {vol.Optional(ATTR_DAY): day}, reset_schedule
    )
    platform.async_register_entity_service(
        "schedule_boost",
        {
            vol.Optional(ATTR_DURATION, default=timedelta(minutes=30)): vol.All(
                cv.time_period, cv.positive_timedelta
            ),
            vol.Optional(ATTR_MODE): cv.string,
        },
        boost,
    )
    platform.async_register_entity_service("schedule_restore", {}, restore)
