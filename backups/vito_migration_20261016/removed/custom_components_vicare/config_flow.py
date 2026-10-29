"""Config flow for ViCare integration."""

from collections.abc import Mapping
import logging
from typing import Any, override

import voluptuous as vol

from homeassistant.components.sensor import SensorDeviceClass
from homeassistant.config_entries import (
    SOURCE_REAUTH,
    ConfigEntry,
    ConfigFlowResult,
    OptionsFlowWithReload,
)
from homeassistant.core import DOMAIN as HOMEASSISTANT_DOMAIN, callback
from homeassistant.helpers import config_entry_oauth2_flow
from homeassistant.helpers.device_registry import format_mac
from homeassistant.helpers.selector import (
    BooleanSelector,
    EntitySelector,
    EntitySelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
)
from homeassistant.helpers.service_info.dhcp import DhcpServiceInfo

from .const import (
    CONF_CYCLING_THRESHOLD,
    CONF_RETURN_TEMPERATURE,
    CONF_SCAN_INTERVAL,
    CONF_SYNC_SCHEDULES,
    DEFAULT_CACHE_DURATION,
    DEFAULT_CYCLING_THRESHOLD,
    DOMAIN,
    MAX_SCAN_INTERVAL,
    MIN_SCAN_INTERVAL,
    VICARE_NAME,
)

_LOGGER = logging.getLogger(__name__)


class ViCareOptionsFlow(OptionsFlowWithReload):
    """Options of ViCare Plus."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            data: dict[str, Any] = {
                CONF_SCAN_INTERVAL: int(user_input[CONF_SCAN_INTERVAL]),
                CONF_CYCLING_THRESHOLD: int(user_input[CONF_CYCLING_THRESHOLD]),
                CONF_SYNC_SCHEDULES: bool(user_input.get(CONF_SYNC_SCHEDULES, True)),
            }
            if user_input.get(CONF_RETURN_TEMPERATURE):
                data[CONF_RETURN_TEMPERATURE] = user_input[CONF_RETURN_TEMPERATURE]
            return self.async_create_entry(data=data)
        options = self.config_entry.options
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_SCAN_INTERVAL,
                    default=options.get(CONF_SCAN_INTERVAL, DEFAULT_CACHE_DURATION),
                ): NumberSelector(
                    NumberSelectorConfig(
                        min=MIN_SCAN_INTERVAL,
                        max=MAX_SCAN_INTERVAL,
                        step=10,
                        unit_of_measurement="s",
                        mode=NumberSelectorMode.BOX,
                    )
                ),
                vol.Required(
                    CONF_CYCLING_THRESHOLD,
                    default=options.get(
                        CONF_CYCLING_THRESHOLD, DEFAULT_CYCLING_THRESHOLD
                    ),
                ): NumberSelector(
                    NumberSelectorConfig(
                        min=1, max=20, step=1, mode=NumberSelectorMode.BOX
                    )
                ),
                vol.Required(
                    CONF_SYNC_SCHEDULES,
                    default=options.get(CONF_SYNC_SCHEDULES, True),
                ): BooleanSelector(),
                vol.Optional(
                    CONF_RETURN_TEMPERATURE,
                    description={
                        "suggested_value": options.get(CONF_RETURN_TEMPERATURE)
                    },
                ): EntitySelector(
                    EntitySelectorConfig(
                        domain="sensor", device_class=SensorDeviceClass.TEMPERATURE
                    )
                ),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)


class ViCareFlowHandler(
    config_entry_oauth2_flow.AbstractOAuth2FlowHandler, domain=DOMAIN
):
    """Handle a config flow for ViCare using OAuth2."""

    DOMAIN = DOMAIN
    VERSION = 2
    MINOR_VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> ViCareOptionsFlow:
        """Return the options flow."""
        return ViCareOptionsFlow()

    @property
    @override
    def logger(self) -> logging.Logger:
        """Return logger."""
        return logging.getLogger(__name__)

    @override
    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle a flow initiated by the user."""
        if self.source != SOURCE_REAUTH and self._async_current_entries():
            return self.async_abort(
                reason="single_instance_allowed",
                translation_domain=HOMEASSISTANT_DOMAIN,
            )

        return await super().async_step_user(user_input)

    @override
    async def async_oauth_create_entry(self, data: dict) -> ConfigFlowResult:
        """Create an entry after OAuth or update existing for reauth."""
        if self.source == SOURCE_REAUTH:
            reauth_entry = self._get_reauth_entry()
            return self.async_update_reload_and_abort(
                reauth_entry,
                data={**reauth_entry.data, **data},
            )

        return self.async_create_entry(
            title=VICARE_NAME,
            data=data,
        )

    async def async_step_reauth(
        self, entry_data: Mapping[str, Any]
    ) -> ConfigFlowResult:
        """Perform reauth upon an API authentication error."""
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Dialog that informs the user that reauth is required."""
        if user_input is None:
            return self.async_show_form(step_id="reauth_confirm")

        return await self.async_step_user()

    @override
    async def async_step_dhcp(
        self, discovery_info: DhcpServiceInfo
    ) -> ConfigFlowResult:
        """Invoke when a Viessmann MAC address is discovered on the network."""
        formatted_mac = format_mac(discovery_info.macaddress)
        _LOGGER.debug("Found device with mac %s", formatted_mac)

        await self.async_set_unique_id(formatted_mac)
        self._abort_if_unique_id_configured()

        if self._async_current_entries():
            return self.async_abort(
                reason="single_instance_allowed",
                translation_domain=HOMEASSISTANT_DOMAIN,
            )

        return await self.async_step_user()
