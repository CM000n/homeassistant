# Welcome 👋!

This is my Home Assistant installation.

## Some statistics about my installation:

| Description                                                                                        | value    |
| -------------------------------------------------------------------------------------------------- | -------- |
| Installed version                                                                                  | 2024.6.3 |
| Total entity objects                                                                               | 822      |
| Entities in the [`person`](https://www.home-assistant.io/components/person) domain                 | 6        |
| Entities in the [`sun`](https://www.home-assistant.io/components/sun) domain                       | 1        |
| Entities in the [`group`](https://www.home-assistant.io/components/group) domain                   | 8        |
| Entities in the [`script`](https://www.home-assistant.io/components/script) domain                 | 10       |
| Entities in the [`input_number`](https://www.home-assistant.io/components/input_number) domain     | 2        |
| Entities in the [`input_select`](https://www.home-assistant.io/components/input_select) domain     | 1        |
| Entities in the [`input_datetime`](https://www.home-assistant.io/components/input_datetime) domain | 3        |
| Entities in the [`input_boolean`](https://www.home-assistant.io/components/input_boolean) domain   | 14       |
| Entities in the [`scene`](https://www.home-assistant.io/components/scene) domain                   | 51       |
| Entities in the [`zone`](https://www.home-assistant.io/components/zone) domain                     | 4        |
| Entities in the [`conversation`](https://www.home-assistant.io/components/conversation) domain     | 1        |
| Entities in the [`light`](https://www.home-assistant.io/components/light) domain                   | 51       |
| Entities in the [`device_tracker`](https://www.home-assistant.io/components/device_tracker) domain | 65       |
| Entities in the [`binary_sensor`](https://www.home-assistant.io/components/binary_sensor) domain   | 54       |
| Entities in the [`sensor`](https://www.home-assistant.io/components/sensor) domain                 | 323      |
| Entities in the [`switch`](https://www.home-assistant.io/components/switch) domain                 | 116      |
| Entities in the [`media_player`](https://www.home-assistant.io/components/media_player) domain     | 10       |
| Entities in the [`remote`](https://www.home-assistant.io/components/remote) domain                 | 1        |
| Entities in the [`fan`](https://www.home-assistant.io/components/fan) domain                       | 1        |
| Entities in the [`button`](https://www.home-assistant.io/components/button) domain                 | 14       |
| Entities in the [`event`](https://www.home-assistant.io/components/event) domain                   | 4        |
| Entities in the [`stt`](https://www.home-assistant.io/components/stt) domain                       | 1        |
| Entities in the [`tts`](https://www.home-assistant.io/components/tts) domain                       | 1        |
| Entities in the [`wake_word`](https://www.home-assistant.io/components/wake_word) domain           | 1        |
| Entities in the [`weather`](https://www.home-assistant.io/components/weather) domain               | 1        |
| Entities in the [`automation`](https://www.home-assistant.io/components/automation) domain         | 14       |
| Entities in the [`camera`](https://www.home-assistant.io/components/camera) domain                 | 1        |
| Entities in the [`select`](https://www.home-assistant.io/components/select) domain                 | 3        |
| Entities in the [`number`](https://www.home-assistant.io/components/number) domain                 | 29       |
| Entities in the [`vacuum`](https://www.home-assistant.io/components/vacuum) domain                 | 1        |
| Entities in the [`calendar`](https://www.home-assistant.io/components/calendar) domain             | 10       |
| Entities in the [`update`](https://www.home-assistant.io/components/update) domain                 | 13       |
| Entities in the [`water_heater`](https://www.home-assistant.io/components/water_heater) domain     | 2        |
| Entities in the [`climate`](https://www.home-assistant.io/components/climate) domain               | 3        |
| Entities in the [`image`](https://www.home-assistant.io/components/image) domain                   | 1        |
| Entities in the [`humidifier`](https://www.home-assistant.io/components/humidifier) domain         | 1        |

## Core integrations that I use

| Integration                                                                                                                                                                                                                                                                                                                                                                                                          | Configuration                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [<img src="https://brands.home-assistant.io/_/adguard/icon.png" height="24"/>](https://brands.home-assistant.io/_/adguard/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/adguard/icon.png" height="24"/>](https://brands.home-assistant.io/_/adguard/icon.png#gh-light-mode-only) [AdGuard Home](https://home-assistant.io/integrations/adguard)                                      | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/apple_tv/icon.png" height="24"/>](https://brands.home-assistant.io/_/apple_tv/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/apple_tv/icon.png" height="24"/>](https://brands.home-assistant.io/_/apple_tv/icon.png#gh-light-mode-only) [Apple TV](https://home-assistant.io/integrations/apple_tv)                                     | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/automation/icon.png" height="24"/>](https://brands.home-assistant.io/_/automation/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/automation/icon.png" height="24"/>](https://brands.home-assistant.io/_/automation/icon.png#gh-light-mode-only) [Automation](https://home-assistant.io/integrations/automation)                         | [./automations.yaml](./automations.yaml)                                                 |
| [<img src="https://brands.home-assistant.io/_/wemo/icon.png" height="24"/>](https://brands.home-assistant.io/_/wemo/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/wemo/icon.png" height="24"/>](https://brands.home-assistant.io/_/wemo/icon.png#gh-light-mode-only) [Belkin WeMo](https://home-assistant.io/integrations/wemo)                                                      | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/cast/icon.png" height="24"/>](https://brands.home-assistant.io/_/cast/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/cast/icon.png" height="24"/>](https://brands.home-assistant.io/_/cast/icon.png#gh-light-mode-only) [Google Cast](https://home-assistant.io/integrations/cast)                                                      | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/cloud/icon.png" height="24"/>](https://brands.home-assistant.io/_/cloud/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/cloud/icon.png" height="24"/>](https://brands.home-assistant.io/_/cloud/icon.png#gh-light-mode-only) [Home Assistant Cloud](https://home-assistant.io/integrations/cloud)                                        | [./packages/integrations/core/cloud.yaml](./packages/integrations/core/cloud.yaml)       |
| [<img src="https://brands.home-assistant.io/_/cloudflare/icon.png" height="24"/>](https://brands.home-assistant.io/_/cloudflare/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/cloudflare/icon.png" height="24"/>](https://brands.home-assistant.io/_/cloudflare/icon.png#gh-light-mode-only) [Cloudflare](https://home-assistant.io/integrations/cloudflare)                         | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/default_config/icon.png" height="24"/>](https://brands.home-assistant.io/_/default_config/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/default_config/icon.png" height="24"/>](https://brands.home-assistant.io/_/default_config/icon.png#gh-light-mode-only) [Default Config](https://home-assistant.io/integrations/default_config) | [./configuration.yaml](./configuration.yaml)                                             |
| [<img src="https://brands.home-assistant.io/_/frontend/icon.png" height="24"/>](https://brands.home-assistant.io/_/frontend/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/frontend/icon.png" height="24"/>](https://brands.home-assistant.io/_/frontend/icon.png#gh-light-mode-only) [Frontend](https://home-assistant.io/integrations/frontend)                                     | [./packages/integrations/core/frontend.yaml](./packages/integrations/core/frontend.yaml) |
| [<img src="https://brands.home-assistant.io/_/github/icon.png" height="24"/>](https://brands.home-assistant.io/_/github/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/github/icon.png" height="24"/>](https://brands.home-assistant.io/_/github/icon.png#gh-light-mode-only) [GitHub](https://home-assistant.io/integrations/github)                                                 | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/influxdb/icon.png" height="24"/>](https://brands.home-assistant.io/_/influxdb/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/influxdb/icon.png" height="24"/>](https://brands.home-assistant.io/_/influxdb/icon.png#gh-light-mode-only) [InfluxDB](https://home-assistant.io/integrations/influxdb)                                     | [./packages/integrations/core/influxdb.yaml](./packages/integrations/core/influxdb.yaml) |
| [<img src="https://brands.home-assistant.io/_/launch_library/icon.png" height="24"/>](https://brands.home-assistant.io/_/launch_library/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/launch_library/icon.png" height="24"/>](https://brands.home-assistant.io/_/launch_library/icon.png#gh-light-mode-only) [Launch Library](https://home-assistant.io/integrations/launch_library) | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/logger/icon.png" height="24"/>](https://brands.home-assistant.io/_/logger/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/logger/icon.png" height="24"/>](https://brands.home-assistant.io/_/logger/icon.png#gh-light-mode-only) [Logger](https://home-assistant.io/integrations/logger)                                                 | [./packages/integrations/core/logger.yaml](./packages/integrations/core/logger.yaml)     |
| [<img src="https://brands.home-assistant.io/_/met/icon.png" height="24"/>](https://brands.home-assistant.io/_/met/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/met/icon.png" height="24"/>](https://brands.home-assistant.io/_/met/icon.png#gh-light-mode-only) [Met.no](https://home-assistant.io/integrations/met)                                                                | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/mobile_app/icon.png" height="24"/>](https://brands.home-assistant.io/_/mobile_app/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/mobile_app/icon.png" height="24"/>](https://brands.home-assistant.io/_/mobile_app/icon.png#gh-light-mode-only) [Mobile App](https://home-assistant.io/integrations/mobile_app)                         | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/nanoleaf/icon.png" height="24"/>](https://brands.home-assistant.io/_/nanoleaf/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/nanoleaf/icon.png" height="24"/>](https://brands.home-assistant.io/_/nanoleaf/icon.png#gh-light-mode-only) [Nanoleaf](https://home-assistant.io/integrations/nanoleaf)                                     | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/netatmo/icon.png" height="24"/>](https://brands.home-assistant.io/_/netatmo/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/netatmo/icon.png" height="24"/>](https://brands.home-assistant.io/_/netatmo/icon.png#gh-light-mode-only) [Netatmo](https://home-assistant.io/integrations/netatmo)                                           | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/plex/icon.png" height="24"/>](https://brands.home-assistant.io/_/plex/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/plex/icon.png" height="24"/>](https://brands.home-assistant.io/_/plex/icon.png#gh-light-mode-only) [Plex Media Server](https://home-assistant.io/integrations/plex)                                                | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/rest/icon.png" height="24"/>](https://brands.home-assistant.io/_/rest/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/rest/icon.png" height="24"/>](https://brands.home-assistant.io/_/rest/icon.png#gh-light-mode-only) [Rest](https://home-assistant.io/integrations/rest)                                                             | [./packages/integrations/core/rest.yaml](./packages/integrations/core/rest.yaml)         |
| [<img src="https://brands.home-assistant.io/_/script/icon.png" height="24"/>](https://brands.home-assistant.io/_/script/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/script/icon.png" height="24"/>](https://brands.home-assistant.io/_/script/icon.png#gh-light-mode-only) [Script](https://home-assistant.io/integrations/script)                                                 | [./scripts.yaml](./scripts.yaml)                                                         |
| [<img src="https://brands.home-assistant.io/_/sentry/icon.png" height="24"/>](https://brands.home-assistant.io/_/sentry/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/sentry/icon.png" height="24"/>](https://brands.home-assistant.io/_/sentry/icon.png#gh-light-mode-only) [Sentry](https://home-assistant.io/integrations/sentry)                                                 | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/spotify/icon.png" height="24"/>](https://brands.home-assistant.io/_/spotify/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/spotify/icon.png" height="24"/>](https://brands.home-assistant.io/_/spotify/icon.png#gh-light-mode-only) [Spotify](https://home-assistant.io/integrations/spotify)                                           | [./packages/integrations/core/spotify.yaml](./packages/integrations/core/spotify.yaml)   |
| [<img src="https://brands.home-assistant.io/_/hassio/icon.png" height="24"/>](https://brands.home-assistant.io/_/hassio/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/hassio/icon.png" height="24"/>](https://brands.home-assistant.io/_/hassio/icon.png#gh-light-mode-only) [Supervisor](https://home-assistant.io/integrations/hassio)                                             | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/synology_dsm/icon.png" height="24"/>](https://brands.home-assistant.io/_/synology_dsm/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/synology_dsm/icon.png" height="24"/>](https://brands.home-assistant.io/_/synology_dsm/icon.png#gh-light-mode-only) [Synology DSM](https://home-assistant.io/integrations/synology_dsm)             | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/tailscale/icon.png" height="24"/>](https://brands.home-assistant.io/_/tailscale/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/tailscale/icon.png" height="24"/>](https://brands.home-assistant.io/_/tailscale/icon.png#gh-light-mode-only) [Tailscale](https://home-assistant.io/integrations/tailscale)                               | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/tautulli/icon.png" height="24"/>](https://brands.home-assistant.io/_/tautulli/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/tautulli/icon.png" height="24"/>](https://brands.home-assistant.io/_/tautulli/icon.png#gh-light-mode-only) [Tautulli](https://home-assistant.io/integrations/tautulli)                                     | [./packages/integrations/core/tautulli.yaml](./packages/integrations/core/tautulli.yaml) |
| [<img src="https://brands.home-assistant.io/_/telegram/icon.png" height="24"/>](https://brands.home-assistant.io/_/telegram/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/telegram/icon.png" height="24"/>](https://brands.home-assistant.io/_/telegram/icon.png#gh-light-mode-only) [Telegram BOT](https://home-assistant.io/integrations/telegram)                                 | [./packages/integrations/core/telegram.yaml](./packages/integrations/core/telegram.yaml) |
| [<img src="https://brands.home-assistant.io/_/template/icon.png" height="24"/>](https://brands.home-assistant.io/_/template/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/template/icon.png" height="24"/>](https://brands.home-assistant.io/_/template/icon.png#gh-light-mode-only) [Template](https://home-assistant.io/integrations/template)                                     | [./packages/integrations/core/template.yaml](./packages/integrations/core/template.yaml) |
| [<img src="https://brands.home-assistant.io/_/tuya/icon.png" height="24"/>](https://brands.home-assistant.io/_/tuya/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/tuya/icon.png" height="24"/>](https://brands.home-assistant.io/_/tuya/icon.png#gh-light-mode-only) [Tuya](https://home-assistant.io/integrations/tuya)                                                             | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/uptimerobot/icon.png" height="24"/>](https://brands.home-assistant.io/_/uptimerobot/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/uptimerobot/icon.png" height="24"/>](https://brands.home-assistant.io/_/uptimerobot/icon.png#gh-light-mode-only) [UptimeRobot](https://home-assistant.io/integrations/uptimerobot)                   | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/version/icon.png" height="24"/>](https://brands.home-assistant.io/_/version/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/version/icon.png" height="24"/>](https://brands.home-assistant.io/_/version/icon.png#gh-light-mode-only) [Version](https://home-assistant.io/integrations/version)                                           | Config flow[^1]                                                                          |
| [<img src="https://brands.home-assistant.io/_/xiaomi_miio/icon.png" height="24"/>](https://brands.home-assistant.io/_/xiaomi_miio/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/xiaomi_miio/icon.png" height="24"/>](https://brands.home-assistant.io/_/xiaomi_miio/icon.png#gh-light-mode-only) [Xiaomi Miio](https://home-assistant.io/integrations/xiaomi_miio)                   | Config flow[^1]                                                                          |

## The custom integrations that I use

### [<img src="https://brands.home-assistant.io/_/places/icon.png" height="24"/>](https://brands.home-assistant.io/_/places/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/places/icon.png" height="24"/>](https://brands.home-assistant.io/_/places/icon.png#gh-light-mode-only) [Places](https://github.com/custom-components/places)

_Component to integrate with OpenStreetMap Reverse Geocode (places)_

| **Version**   | v2.7.0   |
| ------------- | -------- |
| **Author(s)** | @Snuffy2 |

### [<img src="https://brands.home-assistant.io/_/ltss/icon.png" height="24"/>](https://brands.home-assistant.io/_/ltss/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/ltss/icon.png" height="24"/>](https://brands.home-assistant.io/_/ltss/icon.png#gh-light-mode-only) [Ltss](https://github.com/freol35241/ltss)

_Long time state storage (LTSS) custom component for Home Assistant using Timescale DB_

[**My configuration for Ltss**](./packages/integrations/custom/ltss.yaml)
**Version** | v2.1.0
--|--
**Author(s)** | @freol35241

### [<img src="https://brands.home-assistant.io/_/vesync/icon.png" height="24"/>](https://brands.home-assistant.io/_/vesync/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/vesync/icon.png" height="24"/>](https://brands.home-assistant.io/_/vesync/icon.png#gh-light-mode-only) [Custom Vesync](https://github.com/vlebourl/custom_vesync)

_Custom VeSync component for Home Assistant_

| **Version**   | v1.3.0                                                          |
| ------------- | --------------------------------------------------------------- |
| **Author(s)** | @markperdue, @webdjoe, @thegardenmonkey, @vlebourl, @tv4you2016 |

### [<img src="https://brands.home-assistant.io/_/adaptive_lighting/icon.png" height="24"/>](https://brands.home-assistant.io/_/adaptive_lighting/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/adaptive_lighting/icon.png" height="24"/>](https://brands.home-assistant.io/_/adaptive_lighting/icon.png#gh-light-mode-only) [Adaptive Lighting](https://github.com/basnijholt/adaptive-lighting)

_Adaptive Lighting custom component for Home Assistant_

| **Version**   | 1.22.0                                               |
| ------------- | ---------------------------------------------------- |
| **Author(s)** | @basnijholt, @RubenKelevra, @th3w1zard1, @protyposis |

### [<img src="https://brands.home-assistant.io/_/pyscript/icon.png" height="24"/>](https://brands.home-assistant.io/_/pyscript/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/pyscript/icon.png" height="24"/>](https://brands.home-assistant.io/_/pyscript/icon.png#gh-light-mode-only) [Pyscript](https://github.com/custom-components/pyscript)

_Pyscript adds rich Python scripting to HASS_

| **Version**   | 1.5.0         |
| ------------- | ------------- |
| **Author(s)** | @craigbarratt |

### [<img src="https://brands.home-assistant.io/_/watchman/icon.png" height="24"/>](https://brands.home-assistant.io/_/watchman/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/watchman/icon.png" height="24"/>](https://brands.home-assistant.io/_/watchman/icon.png#gh-light-mode-only) [Watchman](https://github.com/dummylabs/thewatchman)

_Home Assistant custom integration to keep track of missing entities and services in your config files_

| **Version**   | v0.6.1     |
| ------------- | ---------- |
| **Author(s)** | @dummylabs |

### [<img src="https://brands.home-assistant.io/_/extended_openai_conversation/icon.png" height="24"/>](https://brands.home-assistant.io/_/extended_openai_conversation/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/extended_openai_conversation/icon.png" height="24"/>](https://brands.home-assistant.io/_/extended_openai_conversation/icon.png#gh-light-mode-only) [Extended Openai Conversation](https://github.com/jekalmin/extended_openai_conversation)

_Home Assistant custom component of conversation agent. It uses OpenAI to control your devices._

| **Version**   | 1.0.3     |
| ------------- | --------- |
| **Author(s)** | @jekalmin |

### [<img src="https://brands.home-assistant.io/_/hacs/icon.png" height="24"/>](https://brands.home-assistant.io/_/hacs/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/hacs/icon.png" height="24"/>](https://brands.home-assistant.io/_/hacs/icon.png#gh-light-mode-only) [HACS](https://github.com/hacs/integration)

_HACS gives you a powerful UI to handle downloads of all your custom needs._

| **Version**   | 1.34.0   |
| ------------- | -------- |
| **Author(s)** | @ludeeus |

### [<img src="https://brands.home-assistant.io/_/readme/icon.png" height="24"/>](https://brands.home-assistant.io/_/readme/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/readme/icon.png" height="24"/>](https://brands.home-assistant.io/_/readme/icon.png#gh-light-mode-only) [Generate Readme](https://github.com/custom-components/readme)

_Use Jinja and data from Home Assistant to generate your README.md file_

| **Version**   | 0.5.0    |
| ------------- | -------- |
| **Author(s)** | @ludeeus |

### [<img src="https://brands.home-assistant.io/_/toyota/icon.png" height="24"/>](https://brands.home-assistant.io/_/toyota/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/toyota/icon.png" height="24"/>](https://brands.home-assistant.io/_/toyota/icon.png#gh-light-mode-only) [Toyota Connected Services Europe](https://github.com/DurgNomis-drol/ha_toyota)

_Toyota Connected Services integration for Home Assistant._

| **Version**   | v2.0.3          |
| ------------- | --------------- |
| **Author(s)** | @DurgNomis-drol |

## The custom lovelace plugins that I use

### [My Cards Bundle](https://github.com/AnthonMS/my-cards)

_Bundle of my custom Lovelace cards for Home Assistant. Includes: my-slider, my-slider-v2, my-button_

| **Version** | v1.0.5 |
| ----------- | ------ |

### [Stack In Card](https://github.com/custom-cards/stack-in-card)

_🛠 group multiple cards into one card without the borders_

| **Version** | 0.2.0 |
| ----------- | ----- |

### [Card Mod](https://github.com/thomasloven/lovelace-card-mod)

_🔹 Add CSS styles to (almost) any lovelace card_

| **Version** | v3.4.3 |
| ----------- | ------ |

### [Mushroom](https://github.com/piitaya/lovelace-mushroom)

_Build a beautiful Home Assistant dashboard easily_

| **Version** | v3.6.2 |
| ----------- | ------ |

### [Valetudo Map Card](https://github.com/Hypfer/lovelace-valetudo-map-card)

_Display the map from a valetudo-enabled robot in a home assistant dashboard card._

| **Version** | v2023.04.0 |
| ----------- | ---------- |

### [Decluttering Card](https://github.com/custom-cards/decluttering-card)

_🧹 Declutter your lovelace configuration with the help of this card_

| **Version** | v1.0.0 |
| ----------- | ------ |

### [Bar Card](https://github.com/custom-cards/bar-card)

_Customizable Animated Bar card for Home Assistant Lovelace_

| **Version** | 3.2.0 |
| ----------- | ----- |

### [Swipe Card](https://github.com/bramkragten/swipe-card)

_Card that allows you to swipe throught multiple cards for Home Assistant Lovelace_

| **Version** | v5.0.0 |
| ----------- | ------ |

### [Mini Media Player](https://github.com/kalkih/mini-media-player)

_Minimalistic media card for Home Assistant Lovelace UI_

| **Version** | v1.16.9 |
| ----------- | ------- |

### [Button Card](https://github.com/custom-cards/button-card)

_❇️ Lovelace button-card for home assistant_

| **Version** | v4.1.2 |
| ----------- | ------ |

### [Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus)

_A power distribution card inspired by the official Energy Distribution card for Home Assistant_

| **Version** | v0.2.2 |
| ----------- | ------ |

### [Apexcharts Card](https://github.com/RomRider/apexcharts-card)

_📈 A Lovelace card to display advanced graphs and charts based on ApexChartsJS for Home Assistant_

| **Version** | v2.0.4 |
| ----------- | ------ |

### [Layout Card](https://github.com/thomasloven/lovelace-layout-card)

_🔹 Get more control over the placement of lovelace cards._

| **Version** | v2.4.5 |
| ----------- | ------ |
