"""Text entities of ViCare Plus (string parameters of API commands)."""

from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .plus.entity import async_setup_plus_platform
from .types import ViCareConfigEntry


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ViCareConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create the ViCare text entities."""
    await async_setup_plus_platform(
        hass, config_entry.entry_id, "text", async_add_entities
    )
