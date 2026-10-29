"""Entities for the ViCare integration."""

from collections.abc import Generator
from contextlib import contextmanager
import logging
from typing import override

from PyViCare.PyViCareDevice import Device as PyViCareDevice
from PyViCare.PyViCareDeviceConfig import PyViCareDeviceConfig
from PyViCare.PyViCareHeatingDevice import (
    HeatingDeviceWithComponent as PyViCareHeatingDeviceComponent,
)
from PyViCare.PyViCareUtils import (
    PyViCareDeviceCommunicationError,
    PyViCareInternalServerError,
    PyViCareInvalidDataError,
    PyViCareRateLimitError,
)
from requests.exceptions import ConnectionError as RequestConnectionError

from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, VIESSMANN_DEVELOPER_PORTAL
from .coordinator import ViCareCoordinator

_LOGGER = logging.getLogger(__name__)


class ViCareEntity(Entity):
    """Base class for ViCare entities."""

    _attr_has_entity_name = True

    @contextmanager
    def vicare_api_handler(self) -> Generator[None]:
        """Handle common ViCare API errors."""
        try:
            yield
        except RequestConnectionError:
            _LOGGER.error("Unable to retrieve data from ViCare server")
        except ValueError:
            _LOGGER.error("Unable to decode data from ViCare server")
        except PyViCareRateLimitError as err:
            _LOGGER.error("ViCare API rate limit exceeded: %s", err)
        except PyViCareInvalidDataError as err:
            _LOGGER.error("Invalid data from ViCare server: %s", err)
        except PyViCareDeviceCommunicationError as err:
            _LOGGER.warning("Device communication error: %s", err)
        except PyViCareInternalServerError as err:
            _LOGGER.warning("ViCare server error: %s", err)

    def __init__(
        self,
        unique_id_suffix: str,
        device_serial: str | None,
        device_config: PyViCareDeviceConfig,
        device: PyViCareDevice,
        component: PyViCareHeatingDeviceComponent | None = None,
    ) -> None:
        """Initialize the entity."""
        gateway_serial = device_config.getConfig().serial
        device_id = device_config.getId()
        model = device_config.getModel().replace("_", " ")

        identifier = (
            f"{gateway_serial}_{device_serial.replace('-', '_')}"
            if device_serial is not None
            else f"{gateway_serial}_{device_id}"
        )

        self._api: PyViCareDevice | PyViCareHeatingDeviceComponent = component or device
        self._attr_unique_id = f"{identifier}-{unique_id_suffix}"
        if component:
            self._attr_unique_id += f"-{component.id}"

        self._gateway_serial = gateway_serial
        self._device_serial = device_serial
        self._device_identifier = identifier
        self._model = model
        self._group_key = unique_id_suffix
        self._group_component = (
            (type(component).__name__, component.id) if component else None
        )

    def _group_device_info(self) -> DeviceInfo | None:
        """Return the thematic sub-device of ViCare Plus, if any."""
        if self.hass is None or self.platform is None:
            return None
        if (self._device_serial or "").startswith("zigbee-"):
            return None
        config_entry = self.platform.config_entry
        if config_entry is None:
            return None
        # Imported here, the plus package imports this module.
        from .plus.entity import group_device_info  # noqa: PLC0415
        from .plus.logic import core_group  # noqa: PLC0415
        from .plus.runtime import get_runtime  # noqa: PLC0415

        runtime = get_runtime(self.hass, config_entry.entry_id)
        ctx = runtime.find_device(self._device_identifier) if runtime else None
        if runtime is None or ctx is None:
            return None
        kind, component_id = self._group_component or (None, None)
        group = core_group(self._group_key, kind, component_id)
        self._group_ctx = (ctx, group)
        return group_device_info(ctx, group, runtime.language, self.hass)

    @override
    async def async_added_to_hass(self) -> None:
        """Move a freshly created sub-device into the area of the main device."""
        await super().async_added_to_hass()
        if group_ctx := getattr(self, "_group_ctx", None):
            from .plus.entity import _inherit_area  # noqa: PLC0415

            _inherit_area(self.hass, *group_ctx)

    @property
    @override
    def device_info(self) -> DeviceInfo:
        """Return device info, resolving the zigbee gateway link at add time."""
        if (group_info := self._group_device_info()) is not None:
            return group_info
        device_info = DeviceInfo(
            identifiers={(DOMAIN, self._device_identifier)},
            name=self._model,
            manufacturer="Viessmann",
            model=self._model,
            configuration_url=VIESSMANN_DEVELOPER_PORTAL,
        )

        device_serial = self._device_serial
        if device_serial and device_serial.startswith("zigbee-"):
            parts = device_serial.split("-", 2)
            if len(parts) == 3:
                _, zigbee_ieee, _ = parts
                config_entry = self.platform.config_entry
                assert config_entry is not None
                # Link best effort: the gateway may be absent (its main device
                # was omitted or its serial could not be retrieved), in which
                # case the channel stays unlinked rather than aborting setup.
                gateway_device = dr.async_get(self.hass).async_get_device_by_identifier(
                    (DOMAIN, f"{self._gateway_serial}_zigbee_{zigbee_ieee}"),
                    config_entry.entry_id,
                )
                if gateway_device is not None:
                    device_info["via_device_id"] = gateway_device.id
            elif (
                len(parts) == 2
                and len(zigbee_ieee := device_serial.removeprefix("zigbee-")) == 16
            ):
                device_info["serial_number"] = "-".join(
                    zigbee_ieee.upper()[i : i + 2] for i in range(0, 16, 2)
                )
        else:
            device_info["serial_number"] = device_serial

        return device_info


class ViCareCoordinatorEntity(CoordinatorEntity[ViCareCoordinator], ViCareEntity):
    """Base class for ViCare entities backed by the update coordinator.

    Values are read in ``_read_value``, which the coordinator calls from its
    executor job. Properties must only return what was read there: a PyViCare
    getter takes the library cache lock and does blocking I/O when that cache
    is cold.
    """

    def __init__(
        self,
        coordinator: ViCareCoordinator,
        unique_id_suffix: str,
        device_serial: str | None,
        device_config: PyViCareDeviceConfig,
        device: PyViCareDevice,
        component: PyViCareHeatingDeviceComponent | None = None,
    ) -> None:
        """Initialize the entity."""
        CoordinatorEntity.__init__(self, coordinator)
        ViCareEntity.__init__(
            self, unique_id_suffix, device_serial, device_config, device, component
        )

    @override
    async def async_added_to_hass(self) -> None:
        """Register the value reader and prime the first value."""
        await super().async_added_to_hass()
        self.async_on_remove(self.coordinator.async_add_value_reader(self._read_value))
        # The coordinator's first refresh ran before this entity existed.
        await self.hass.async_add_executor_job(self._read_value)

    def _read_value(self) -> None:
        """Read this entity's value from the API. Runs in the executor."""
