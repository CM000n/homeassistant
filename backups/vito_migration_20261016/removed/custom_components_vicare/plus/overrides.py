"""Temporary and permanent overrides of ViCare time programs.

The API offers no direct pump or one-time charge control for many devices, but
every time program is writable. An override stores the original program in
Home Assistant, writes a modified one and restores the original afterwards,
also across restarts.
"""

from __future__ import annotations

from collections.abc import Callable
import copy
from datetime import datetime, timedelta
import logging
from typing import Any

from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers.event import async_track_point_in_utc_time
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .logic import (
    ScheduleError,
    ScheduleSpec,
    boost_schedule,
    get_features,
    permanent_schedule,
    prop,
)
from .runtime import DeviceContext, PlusRuntime, execute_command

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
KIND_BOOST = "boost"
KIND_PERMANENT = "permanent"


def override_key(ctx: DeviceContext, feature: str) -> str:
    """Return the storage key of a schedule override."""
    return f"{ctx.identifier}|{feature}"


def write_schedule(ctx: DeviceContext, feature: str, entries: dict[str, Any]) -> None:
    """Write a full week program. Runs in the executor."""
    execute_command(ctx.api, feature, "setSchedule", {"newSchedule": entries})


def read_schedule(ctx: DeviceContext, feature: str) -> dict[str, Any]:
    """Read the current week program. Runs in the executor."""
    entries = prop(get_features(ctx.api).get(feature), "entries")
    if not isinstance(entries, dict):
        raise HomeAssistantError(f"Time program '{feature}' is not available")
    return copy.deepcopy(entries)


class ScheduleOverrideManager:
    """Keep track of schedule overrides of one config entry."""

    def __init__(self, hass: HomeAssistant, runtime: PlusRuntime) -> None:
        """Initialize the manager."""
        self.hass = hass
        self.runtime = runtime
        self._store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION, f"vicare_plus.overrides.{runtime.entry.entry_id}"
        )
        self._data: dict[str, dict[str, Any]] = {}
        self._timers: dict[str, CALLBACK_TYPE] = {}
        self._listeners: list[Callable[[], None]] = []

    async def async_load(self) -> None:
        """Load stored overrides and resume their timers."""
        self._data = (await self._store.async_load()) or {}
        now = dt_util.utcnow()
        for key, item in list(self._data.items()):
            until = item.get("until")
            if until is None:
                continue
            end = dt_util.parse_datetime(until)
            if end is None or end <= now:
                self.hass.async_create_task(self._async_finish(key))
            else:
                self._schedule_timer(key, end)

    @callback
    def async_unload(self) -> None:
        """Cancel all timers; stored overrides resume on the next start."""
        for cancel in self._timers.values():
            cancel()
        self._timers.clear()

    @callback
    def async_add_listener(self, listener: Callable[[], None]) -> Callable[[], None]:
        """Register a listener for override changes."""
        self._listeners.append(listener)
        return lambda: self._listeners.remove(listener)

    def get(self, ctx: DeviceContext, feature: str) -> dict[str, Any] | None:
        """Return the override of a time program, if any."""
        return self._data.get(override_key(ctx, feature))

    async def async_boost(
        self,
        ctx: DeviceContext,
        spec: ScheduleSpec,
        duration: timedelta,
        mode: str | None = None,
    ) -> datetime:
        """Add a temporary slot starting now and restore the program after."""
        key = override_key(ctx, spec.feature)
        current = self._data.get(key)
        if current and current["kind"] == KIND_PERMANENT:
            raise ServiceValidationError(
                "Permanent mode is active for this time program, turn it off first"
            )
        original = (
            current["original"]
            if current
            else await self.hass.async_add_executor_job(
                read_schedule, ctx, spec.feature
            )
        )
        try:
            boosted, end = boost_schedule(original, spec, dt_util.now(), duration, mode)
        except ScheduleError as err:
            raise ServiceValidationError(str(err)) from err
        await self.hass.async_add_executor_job(
            write_schedule, ctx, spec.feature, boosted
        )
        end_utc = dt_util.as_utc(end)
        self._data[key] = {
            "kind": KIND_BOOST,
            "original": original,
            "until": end_utc.isoformat(),
            "mode": mode,
        }
        await self._store.async_save(self._data)
        self._schedule_timer(key, end_utc)
        await self._async_after_write(ctx)
        return end

    async def async_set_permanent(
        self, ctx: DeviceContext, spec: ScheduleSpec, mode: str | None = None
    ) -> None:
        """Keep the program's active mode on around the clock."""
        key = override_key(ctx, spec.feature)
        current = self._data.get(key)
        original = (
            current["original"]
            if current
            else await self.hass.async_add_executor_job(
                read_schedule, ctx, spec.feature
            )
        )
        await self.hass.async_add_executor_job(
            write_schedule, ctx, spec.feature, permanent_schedule(spec, mode)
        )
        self._cancel_timer(key)
        self._data[key] = {
            "kind": KIND_PERMANENT,
            "original": original,
            "until": None,
            "mode": mode,
        }
        await self._store.async_save(self._data)
        await self._async_after_write(ctx)

    async def async_restore(self, ctx: DeviceContext, feature: str) -> bool:
        """Restore the original program. Returns False if nothing to restore."""
        key = override_key(ctx, feature)
        if key not in self._data:
            return False
        await self._async_restore_key(key, ctx)
        return True

    async def async_update_original(
        self, ctx: DeviceContext, feature: str, entries: dict[str, Any]
    ) -> None:
        """Replace the program that is restored when the override ends."""
        key = override_key(ctx, feature)
        if key not in self._data:
            raise HomeAssistantError(f"No override active for '{feature}'")
        self._data[key]["original"] = copy.deepcopy(entries)
        await self._store.async_save(self._data)
        self._notify()

    @callback
    def async_forget(self, ctx: DeviceContext, feature: str) -> None:
        """Drop an override without restoring, e.g. after a manual change."""
        key = override_key(ctx, feature)
        if self._data.pop(key, None) is not None:
            self._cancel_timer(key)
            self.hass.async_create_task(self._store.async_save(self._data))
            self._notify()

    async def _async_finish(self, key: str) -> None:
        identifier = key.split("|", 1)[0]
        ctx = self.runtime.find_device(identifier)
        if ctx is None:
            _LOGGER.warning("ViCare Plus: device for override %s is gone", key)
            return
        try:
            await self._async_restore_key(key, ctx)
        except HomeAssistantError as err:
            # Retry later, e.g. when the API quota is exhausted.
            _LOGGER.warning("ViCare Plus: restoring %s failed, retrying: %s", key, err)
            self._schedule_timer(key, dt_util.utcnow() + timedelta(minutes=10))

    async def _async_restore_key(self, key: str, ctx: DeviceContext) -> None:
        feature = key.split("|", 1)[1]
        item = self._data[key]
        await self.hass.async_add_executor_job(
            write_schedule, ctx, feature, item["original"]
        )
        self._cancel_timer(key)
        self._data.pop(key, None)
        await self._store.async_save(self._data)
        await self._async_after_write(ctx)

    def _schedule_timer(self, key: str, when: datetime) -> None:
        self._cancel_timer(key)

        @callback
        def _fire(_now: datetime) -> None:
            self._timers.pop(key, None)
            self.hass.async_create_task(self._async_finish(key))

        self._timers[key] = async_track_point_in_utc_time(self.hass, _fire, when)

    def _cancel_timer(self, key: str) -> None:
        if (cancel := self._timers.pop(key, None)) is not None:
            cancel()

    async def _async_after_write(self, ctx: DeviceContext) -> None:
        self._notify()
        if ctx.device.coordinator is not None:
            await ctx.device.coordinator.async_request_refresh()

    @callback
    def _notify(self) -> None:
        for listener in list(self._listeners):
            listener()
