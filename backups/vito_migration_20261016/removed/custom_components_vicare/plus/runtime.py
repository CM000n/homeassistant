"""Runtime state of ViCare Plus for one config entry."""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import logging
import time
from typing import TYPE_CHECKING, Any

from PyViCare.PyViCareUtils import (
    PyViCareCommandError,
    PyViCareDeviceCommunicationError,
    PyViCareInternalServerError,
    PyViCareInvalidDataError,
    PyViCareNotSupportedFeatureError,
    PyViCareRateLimitError,
)
import requests

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.util import dt as dt_util

from ..const import (
    CONF_CYCLING_THRESHOLD,
    CONF_RETURN_TEMPERATURE,
    CONF_SCAN_INTERVAL,
    CONF_SYNC_SCHEDULES,
    DEFAULT_CACHE_DURATION,
    DEFAULT_CYCLING_THRESHOLD,
    DOMAIN,
)
from .logic import Discovery, FeatureMap, command, discover, get_features, prop

if TYPE_CHECKING:
    from ..types import ViCareConfigEntry, ViCareDevice
    from .overrides import ScheduleOverrideManager

_LOGGER = logging.getLogger(__name__)

PLUS_DATA = f"{DOMAIN}_plus"
API_DAILY_LIMIT = 1450
API_WINDOW = 86400


def device_identifier(device: ViCareDevice) -> str:
    """Return the device registry identifier the core integration uses."""
    gateway_serial = device.config.getConfig().serial
    if device.serial is not None:
        return f"{gateway_serial}_{device.serial.replace('-', '_')}"
    return f"{gateway_serial}_{device.config.getId()}"


class BurnerTracker:
    """Derive cycling statistics from burner samples."""

    def __init__(self, burner: str) -> None:
        """Initialize the tracker."""
        self.burner = burner
        self.samples: deque[tuple[datetime, int]] = deque()
        self.active: bool | None = None
        self.on_since: datetime | None = None
        self.off_since: datetime | None = None
        self.last_run: float | None = None
        self.last_pause: float | None = None

    def update(self, features: FeatureMap, now: datetime) -> None:
        """Update from a fresh feature snapshot. Runs in the executor."""
        base = f"heating.burners.{self.burner}"
        starts = prop(features.get(f"{base}.statistics"), "starts")
        if isinstance(starts, (int, float)):
            self.samples.append((now, int(starts)))
            while self.samples and now - self.samples[0][0] > timedelta(hours=2):
                self.samples.popleft()
        active = prop(features.get(base), "active")
        if not isinstance(active, bool):
            return
        if self.active is not None and active != self.active:
            if active:
                if self.off_since is not None:
                    self.last_pause = (now - self.off_since).total_seconds() / 60
                self.on_since = now
            else:
                if self.on_since is not None:
                    self.last_run = (now - self.on_since).total_seconds() / 60
                self.off_since = now
        self.active = active

    def starts_within(self, now: datetime, window: timedelta) -> int | None:
        """Return the burner starts within the given window."""
        if not self.samples:
            return None
        latest = self.samples[-1][1]
        reference = None
        for when, starts in self.samples:
            if now - when <= window:
                reference = starts
                break
        if reference is None:
            return None
        return max(latest - reference, 0)


@dataclass
class DeviceContext:
    """Everything ViCare Plus knows about a device."""

    device: ViCareDevice
    identifier: str
    discovery: Discovery
    features: FeatureMap
    heatpump: bool
    burners: dict[str, BurnerTracker] = field(default_factory=dict)

    @property
    def api(self) -> Any:
        """Return the PyViCare device."""
        return self.device.api


class PlusRuntime:
    """ViCare Plus state of one config entry."""

    def __init__(self, hass: HomeAssistant, entry: ViCareConfigEntry) -> None:
        """Initialize the runtime."""
        self.hass = hass
        self.entry = entry
        self.language = hass.config.language
        self.api_calls: deque[float] = deque()
        self.devices: list[DeviceContext] = []
        self.overrides: ScheduleOverrideManager | None = None
        self.boost_minutes: dict[str, float] = {}

    @property
    def scan_interval(self) -> int:
        """Return the configured polling interval in seconds."""
        return int(self.entry.options.get(CONF_SCAN_INTERVAL, DEFAULT_CACHE_DURATION))

    @property
    def cycling_threshold(self) -> int:
        """Return the burner starts per hour that count as cycling."""
        return int(
            self.entry.options.get(CONF_CYCLING_THRESHOLD, DEFAULT_CYCLING_THRESHOLD)
        )

    @property
    def sync_schedules(self) -> bool:
        """Return whether time programs are mirrored to schedule helpers."""
        return bool(self.entry.options.get(CONF_SYNC_SCHEDULES, True))

    @property
    def return_entity(self) -> str | None:
        """Return the external return temperature sensor, if configured."""
        return self.entry.options.get(CONF_RETURN_TEMPERATURE) or None

    def record_api_call(self) -> None:
        """Record an API request. Called from executor threads."""
        self.api_calls.append(time.time())

    def api_calls_last_24h(self) -> int:
        """Return the number of API requests in the rolling quota window."""
        cutoff = time.time() - API_WINDOW
        while self.api_calls and self.api_calls[0] < cutoff:
            self.api_calls.popleft()
        return len(self.api_calls)

    def restore_api_calls(self, timestamps: list[float]) -> None:
        """Merge persisted request timestamps after a restart."""
        cutoff = time.time() - API_WINDOW
        merged = sorted({*(t for t in timestamps if t >= cutoff), *self.api_calls})
        self.api_calls = deque(merged)

    def build_devices(self, devices: list[ViCareDevice]) -> None:
        """Discover all features of all devices. Runs in the executor."""
        for device in devices:
            try:
                features = get_features(device.api)
            except (
                PyViCareNotSupportedFeatureError,
                PyViCareInvalidDataError,
                PyViCareDeviceCommunicationError,
                PyViCareInternalServerError,
                PyViCareRateLimitError,
                requests.RequestException,
            ) as err:
                _LOGGER.warning("ViCare Plus: cannot read features: %s", err)
                features = {}
            roles = getattr(device.api, "roles", []) or []
            ctx = DeviceContext(
                device=device,
                identifier=device_identifier(device),
                discovery=discover(features),
                features=features,
                heatpump="type:heatpump" in roles,
            )
            for name, feature in features.items():
                parts = name.split(".")
                if (
                    len(parts) == 3
                    and parts[:2] == ["heating", "burners"]
                    and parts[2].isdigit()
                    and feature.get("isEnabled", True)
                ):
                    ctx.burners[parts[2]] = BurnerTracker(parts[2])
            self.devices.append(ctx)

    def update_trackers(self, ctx: DeviceContext) -> None:
        """Refresh the feature snapshot and feed the trackers. Runs in the executor."""
        features = get_features(ctx.api)
        ctx.features = features
        now = dt_util.utcnow()
        for tracker in ctx.burners.values():
            tracker.update(features, now)

    def find_device(self, identifier: str) -> DeviceContext | None:
        """Return the device context for a device registry identifier."""
        return next((d for d in self.devices if d.identifier == identifier), None)


def execute_command(
    api: Any, feature_name: str, command_name: str, params: dict[str, Any]
) -> Any:
    """Run an API command after checking it against the feature model.

    Runs in the executor.
    """
    features = get_features(api)
    feature = features.get(feature_name)
    if feature is None:
        raise ServiceValidationError(f"Feature '{feature_name}' is not available")
    cmd = command(feature, command_name)
    if cmd is None:
        available = ", ".join(feature.get("commands", {})) or "none"
        raise ServiceValidationError(
            f"Command '{command_name}' is not available for '{feature_name}' "
            f"(available: {available})"
        )
    if cmd.get("isExecutable") is False:
        raise ServiceValidationError(
            f"Command '{command_name}' of '{feature_name}' is currently not executable"
        )
    for name, param in (cmd.get("params") or {}).items():
        if param.get("required") and name not in params:
            raise ServiceValidationError(
                f"Parameter '{name}' is required for '{command_name}'"
            )
    try:
        return api.setProperty(feature_name, command_name, params)
    except PyViCareCommandError as err:
        raise HomeAssistantError(f"ViCare rejected '{command_name}': {err}") from err
    except PyViCareRateLimitError as err:
        raise HomeAssistantError(f"ViCare API rate limit exceeded: {err}") from err
    except (
        PyViCareDeviceCommunicationError,
        PyViCareInternalServerError,
        PyViCareInvalidDataError,
        requests.RequestException,
    ) as err:
        raise HomeAssistantError(f"ViCare command failed: {err}") from err


def get_runtime(hass: HomeAssistant, entry_id: str) -> PlusRuntime | None:
    """Return the runtime of a config entry."""
    return hass.data.get(PLUS_DATA, {}).get(entry_id)


def iter_runtimes(hass: HomeAssistant) -> list[PlusRuntime]:
    """Return the runtimes of all loaded config entries."""
    return list(hass.data.get(PLUS_DATA, {}).values())
