"""Two-way sync between ViCare time programs and schedule helpers.

Every writable time program of the device gets a schedule helper
(``schedule.*``). Changes on the device (app, controller, services) are
mirrored to the helper, edits of the helper are validated against the device
constraints and written to the device. While a boost or permanent override is
active the helper shows, and edits, the original program that is restored
afterwards.
"""

from __future__ import annotations

from collections.abc import Callable
import inspect
import logging
from typing import Any

from homeassistant.components import persistent_notification
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.storage import Store

from .logic import (
    HELPER_DAYS,
    ScheduleError,
    ScheduleSpec,
    clean_string,
    entries_to_helper,
    group_label,
    group_of,
    helper_to_entries,
    normalize_helper,
    prop,
)
from .overrides import override_key, write_schedule
from .runtime import DeviceContext, PlusRuntime

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1

GROUP_ICONS = {
    "dhw": "mdi:water-boiler",
    "circulation": "mdi:water-sync",
}
DEFAULT_ICON = "mdi:radiator"


def find_schedule_collection(hass: HomeAssistant) -> Any | None:
    """Return the storage collection of the schedule integration.

    The collection is not published in hass.data, it is reached through the
    websocket handler that the collection registered.
    """
    handlers = hass.data.get("websocket_api") or {}
    entry = handlers.get("schedule/list")
    if not entry:
        return None
    handler = inspect.unwrap(entry[0])
    owner = getattr(handler, "__self__", None)
    collection = getattr(owner, "storage_collection", None)
    if collection is None or not hasattr(collection, "async_update_item"):
        return None
    return collection


def helper_name(ctx: DeviceContext, spec: ScheduleSpec, language: str | None) -> str:
    """Return the name of the helper of a time program."""
    german = (language or "").startswith("de")
    group = group_of(spec.feature)
    label = group_label(group, language, ctx.heatpump)
    if group.startswith("circuit_"):
        name = prop(ctx.features.get(f"heating.circuits.{group[8:]}.name"), "name")
        if isinstance(name, str) and name.strip():
            label = f"{label} ({clean_string(name)})"
    return f"ViCare {label} {'Zeitprogramm' if german else 'schedule'}"


def _clean_name(name: str) -> str:
    name = " ".join(name.replace("\x00", " ").split())
    return name.replace("( ", "(").replace(" )", ")")


def _week_of(item: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    return {day: list(item.get(day) or []) for day in HELPER_DAYS}


class ScheduleSync:
    """Mirror the time programs of one config entry to schedule helpers."""

    def __init__(self, hass: HomeAssistant, runtime: PlusRuntime) -> None:
        """Initialize the sync."""
        self.hass = hass
        self.runtime = runtime
        self._store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION, f"vicare_plus.schedule_sync.{runtime.entry.entry_id}"
        )
        self._data: dict[str, dict[str, Any]] = {}
        self._collection: Any = None
        self._specs: dict[str, tuple[DeviceContext, ScheduleSpec]] = {}
        self._unsubs: list[Callable[[], None]] = []

    async def async_start(self) -> bool:
        """Create missing helpers and start listening. False if unavailable."""
        self._collection = find_schedule_collection(self.hass)
        if self._collection is None:
            _LOGGER.warning(
                "ViCare Plus: schedule integration not available, "
                "time programs are not synced to schedule helpers"
            )
            return False
        self._data = (await self._store.async_load()) or {}
        for ctx in self.runtime.devices:
            for spec in ctx.discovery.schedules:
                self._specs[override_key(ctx, spec.feature)] = (ctx, spec)
        for key, (ctx, spec) in self._specs.items():
            await self._async_ensure_helper(key, ctx, spec)
        await self._store.async_save(self._data)

        self._unsubs.append(
            self._collection.async_add_listener(self._async_collection_changed)
        )
        for ctx in {id(c): c for c, _ in self._specs.values()}.values():
            if ctx.device.coordinator is not None:
                self._unsubs.append(
                    ctx.device.coordinator.async_add_listener(
                        self._async_device_changed
                    )
                )
        if self.runtime.overrides is not None:
            self._unsubs.append(
                self.runtime.overrides.async_add_listener(self._async_device_changed)
            )
        return True

    @callback
    def async_stop(self) -> None:
        """Stop listening."""
        while self._unsubs:
            self._unsubs.pop()()

    # ----------------------------------------------------------------------
    # Device -> helper
    # ----------------------------------------------------------------------

    def _device_week(
        self, ctx: DeviceContext, spec: ScheduleSpec
    ) -> dict[str, list[dict[str, Any]]] | None:
        override = (
            self.runtime.overrides.get(ctx, spec.feature)
            if self.runtime.overrides is not None
            else None
        )
        if override is not None:
            entries = override["original"]
        else:
            entries = prop(ctx.features.get(spec.feature), "entries")
        if not isinstance(entries, dict):
            return None
        return entries_to_helper(entries, spec)

    async def _async_ensure_helper(
        self, key: str, ctx: DeviceContext, spec: ScheduleSpec
    ) -> None:
        state = self._data.get(key)
        if state is not None and state.get("deleted"):
            return
        week = self._device_week(ctx, spec)
        if week is None:
            return
        item_id = state.get("item_id") if state else None
        if item_id is not None and item_id not in self._collection.data:
            # Removed while Home Assistant was not running: respect it.
            self._data[key] = {"item_id": item_id, "deleted": True}
            return
        if item_id is None:
            self._data[key] = {"item_id": None, "synced": week}
            item = await self._collection.async_create_item(
                {
                    "name": helper_name(ctx, spec, self.runtime.language),
                    "icon": GROUP_ICONS.get(group_of(spec.feature), DEFAULT_ICON),
                    **week,
                }
            )
            self._data[key]["item_id"] = item["id"]
            _LOGGER.info("ViCare Plus: created schedule helper %s", item["id"])
            return
        await self._async_push_to_helper(key, week, force=True)

    async def _async_push_to_helper(
        self, key: str, week: dict[str, list[dict[str, Any]]], force: bool = False
    ) -> None:
        state = self._data[key]
        item = self._collection.data.get(state["item_id"])
        if item is None:
            return
        _, spec = self._specs[key]
        if not force and state.get("synced") == week:
            return
        state["synced"] = week
        if (
            normalize_helper(item, spec) == week
            and _week_of(item) == week
            and item["name"] == _clean_name(item["name"])
        ):
            return
        await self._collection.async_update_item(
            state["item_id"],
            {
                "name": _clean_name(item["name"]),
                **({"icon": item["icon"]} if item.get("icon") else {}),
                **week,
            },
        )

    @callback
    def _async_device_changed(self) -> None:
        changed = False
        for key, (ctx, spec) in self._specs.items():
            state = self._data.get(key)
            if not state or state.get("deleted") or not state.get("item_id"):
                continue
            week = self._device_week(ctx, spec)
            if week is None or state.get("synced") == week:
                continue
            changed = True
            self.hass.async_create_task(self._async_push_to_helper(key, week))
        if changed:
            self._store.async_delay_save(lambda: self._data, 5)

    # ----------------------------------------------------------------------
    # Helper -> device
    # ----------------------------------------------------------------------

    def _key_of_item(self, item_id: str) -> str | None:
        return next(
            (
                key
                for key, state in self._data.items()
                if state.get("item_id") == item_id and not state.get("deleted")
            ),
            None,
        )

    async def _async_collection_changed(
        self, change_type: str, item_id: str, item: dict[str, Any]
    ) -> None:
        # Listeners are awaited inside the collection update, process later.
        if self._key_of_item(item_id) is not None:
            self.hass.async_create_task(
                self._async_handle_change(change_type, item_id, dict(item))
            )

    async def _async_handle_change(
        self, change_type: str, item_id: str, item: dict[str, Any]
    ) -> None:
        try:
            await self._async_process_change(change_type, item_id, item)
        except Exception:
            _LOGGER.exception("ViCare Plus: syncing schedule helper %s failed", item_id)

    async def _async_process_change(
        self, change_type: str, item_id: str, item: dict[str, Any]
    ) -> None:
        key = self._key_of_item(item_id)
        if key is None or key not in self._specs:
            return
        state = self._data[key]
        if change_type == "removed":
            state["deleted"] = True
            state.pop("synced", None)
            await self._store.async_save(self._data)
            return
        if change_type != "updated":
            return
        ctx, spec = self._specs[key]
        week = normalize_helper(item, spec)
        if week == state.get("synced"):
            if _week_of(item) != week:
                # Only rounding differs, show what the device stores.
                await self._async_push_to_helper(key, week, force=True)
            return
        try:
            entries = helper_to_entries(item, spec)
        except ScheduleError as err:
            self._notify_error(item, str(err))
            await self._async_push_to_helper(key, state["synced"], force=True)
            return
        overrides = self.runtime.overrides
        try:
            if overrides is not None and overrides.get(ctx, spec.feature):
                await overrides.async_update_original(ctx, spec.feature, entries)
            else:
                await self.hass.async_add_executor_job(
                    write_schedule, ctx, spec.feature, entries
                )
        except HomeAssistantError as err:
            self._notify_error(item, str(err))
            await self._async_push_to_helper(key, state["synced"], force=True)
            return
        state["synced"] = week
        await self._store.async_save(self._data)
        if _week_of(item) != week:
            await self._async_push_to_helper(key, week, force=True)
        if ctx.device.coordinator is not None:
            await ctx.device.coordinator.async_request_refresh()

    def _notify_error(self, item: dict[str, Any], error: str) -> None:
        german = (self.runtime.language or "").startswith("de")
        persistent_notification.async_create(
            self.hass,
            (
                f"Der Zeitplan **{item.get('name')}** konnte nicht an die Heizung "
                f"übertragen werden und wurde zurückgesetzt:\n\n{error}"
                if german
                else f"Schedule **{item.get('name')}** could not be written to the "
                f"heating system and was reverted:\n\n{error}"
            ),
            title="ViCare Plus",
            notification_id=f"vicare_plus_schedule_{item.get('id')}",
        )
