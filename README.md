# Welcome 👋!

Welcome to my Home Assistant Configuration Backup repository!
This repository is dedicated to managing and backing up my personal Home Assistant configuration.
Home Assistant is an incredibly powerful open-source platform for automating smart home devices, and maintaining a reliable backup of configurations is crucial for ensuring smooth operation and easy recovery in case of any issues.

# Table of contents

1. [Introduction](#introduction)
2. [Installation statistics](#statistics)
3. [Installed componentents](#installed_components)
   1. [Core integrations](#core_integrations)

## Introduction <a name="introduction"></a>

In this repository, I have included most .yaml configurations and assets of my Home Assistant setup to help automate the backup process for my Home Assistant configurations.
The goal is to provide a personal solution that ensures my configurations are regularly saved and easily recoverable.

### Key Features

- **Documentation**: The current configuration is documented with the help of the repository and background information can be provided that may also be of interest to others.
- **Version Control**: Keep track of changes in configurations over time with git versioning.
- **Easy Restoration**: Simply use the repository to restore a large part of the configurations in the event of an error.

## Some statistics about my installation: <a name="statistics"></a>

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

## Installed components: <a name="installed_components"></a>

### Core integrations that I use <a name="core_integrations"></a>

| Integrations                                                                                                                                                                                                                                                                                                                                                                                                         | Configuration                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [<img src="https://brands.home-assistant.io/_/binary_sensor/icon.png" height="24"/>](https://brands.home-assistant.io/_/binary_sensor/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/binary_sensor/icon.png" height="24"/>](https://brands.home-assistant.io/_/binary_sensor/icon.png#gh-light-mode-only) [Binary sensor](https://home-assistant.io/integrations/binary_sensor)       | [./integrations/binary_sensor.yaml](./integrations/binary_sensor.yaml) |
| [<img src="https://brands.home-assistant.io/_/config/icon.png" height="24"/>](https://brands.home-assistant.io/_/config/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/config/icon.png" height="24"/>](https://brands.home-assistant.io/_/config/icon.png#gh-light-mode-only) [Configuration](https://home-assistant.io/integrations/config)                                          | [./integrations/config.yaml](./integrations/config.yaml)               |
| [<img src="https://brands.home-assistant.io/_/energy/icon.png" height="24"/>](https://brands.home-assistant.io/_/energy/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/energy/icon.png" height="24"/>](https://brands.home-assistant.io/_/energy/icon.png#gh-light-mode-only) [Energy](https://home-assistant.io/integrations/energy)                                                 | [./integrations/energy.yaml](./integrations/energy.yaml)               |
| [<img src="https://brands.home-assistant.io/_/fan/icon.png" height="24"/>](https://brands.home-assistant.io/_/fan/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/fan/icon.png" height="24"/>](https://brands.home-assistant.io/_/fan/icon.png#gh-light-mode-only) [Fan](https://home-assistant.io/integrations/fan)                                                                   | [./integrations/fan.yaml](./integrations/fan.yaml)                     |
| [<img src="https://brands.home-assistant.io/_/group/icon.png" height="24"/>](https://brands.home-assistant.io/_/group/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/group/icon.png" height="24"/>](https://brands.home-assistant.io/_/group/icon.png#gh-light-mode-only) [Group](https://home-assistant.io/integrations/group)                                                       | [./integrations/group.yaml](./integrations/group.yaml)                 |
| [<img src="https://brands.home-assistant.io/_/history/icon.png" height="24"/>](https://brands.home-assistant.io/_/history/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/history/icon.png" height="24"/>](https://brands.home-assistant.io/_/history/icon.png#gh-light-mode-only) [History](https://home-assistant.io/integrations/history)                                           | [./integrations/history.yaml](./integrations/history.yaml)             |
| [<img src="https://brands.home-assistant.io/_/homeassistant/icon.png" height="24"/>](https://brands.home-assistant.io/_/homeassistant/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/homeassistant/icon.png" height="24"/>](https://brands.home-assistant.io/_/homeassistant/icon.png#gh-light-mode-only) [Home Assistant core](https://home-assistant.io/integrations/homeassistant) | [./configuration.yaml](./configuration.yaml)                           |
| [<img src="https://brands.home-assistant.io/_/light/icon.png" height="24"/>](https://brands.home-assistant.io/_/light/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/light/icon.png" height="24"/>](https://brands.home-assistant.io/_/light/icon.png#gh-light-mode-only) [Light](https://home-assistant.io/integrations/light)                                                       | [./integrations/lights.yaml](./integrations/lights.yaml)               |

### The custom Custom integrations that I use

| Custom integrations                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Description                                                                                             | Version |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------- |
| [<img src="https://brands.home-assistant.io/_/places/icon.png" height="24"/>](https://brands.home-assistant.io/_/places/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/places/icon.png" height="24"/>](https://brands.home-assistant.io/_/places/icon.png#gh-light-mode-only) [Places](https://github.com/custom-components/places)                                                                                                                            | _Component to integrate with OpenStreetMap Reverse Geocode (places)_                                    | v2.7.0  |
| [<img src="https://brands.home-assistant.io/_/ltss/icon.png" height="24"/>](https://brands.home-assistant.io/_/ltss/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/ltss/icon.png" height="24"/>](https://brands.home-assistant.io/_/ltss/icon.png#gh-light-mode-only) [Ltss](https://github.com/freol35241/ltss)                                                                                                                                               | _Long time state storage (LTSS) custom component for Home Assistant using Timescale DB_                 | v2.1.0  |
| [<img src="https://brands.home-assistant.io/_/vesync/icon.png" height="24"/>](https://brands.home-assistant.io/_/vesync/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/vesync/icon.png" height="24"/>](https://brands.home-assistant.io/_/vesync/icon.png#gh-light-mode-only) [Custom Vesync](https://github.com/vlebourl/custom_vesync)                                                                                                                       | _Custom VeSync component for Home Assistant_                                                            | v1.3.0  |
| [<img src="https://brands.home-assistant.io/_/adaptive_lighting/icon.png" height="24"/>](https://brands.home-assistant.io/_/adaptive_lighting/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/adaptive_lighting/icon.png" height="24"/>](https://brands.home-assistant.io/_/adaptive_lighting/icon.png#gh-light-mode-only) [Adaptive Lighting](https://github.com/basnijholt/adaptive-lighting)                                                                 | _Adaptive Lighting custom component for Home Assistant_                                                 | 1.22.0  |
| [<img src="https://brands.home-assistant.io/_/pyscript/icon.png" height="24"/>](https://brands.home-assistant.io/_/pyscript/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/pyscript/icon.png" height="24"/>](https://brands.home-assistant.io/_/pyscript/icon.png#gh-light-mode-only) [Pyscript](https://github.com/custom-components/pyscript)                                                                                                                | _Pyscript adds rich Python scripting to HASS_                                                           | 1.5.0   |
| [<img src="https://brands.home-assistant.io/_/watchman/icon.png" height="24"/>](https://brands.home-assistant.io/_/watchman/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/watchman/icon.png" height="24"/>](https://brands.home-assistant.io/_/watchman/icon.png#gh-light-mode-only) [Watchman](https://github.com/dummylabs/thewatchman)                                                                                                                     | _Home Assistant custom integration to keep track of missing entities and services in your config files_ | v0.6.1  |
| [<img src="https://brands.home-assistant.io/_/extended_openai_conversation/icon.png" height="24"/>](https://brands.home-assistant.io/_/extended_openai_conversation/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/extended_openai_conversation/icon.png" height="24"/>](https://brands.home-assistant.io/_/extended_openai_conversation/icon.png#gh-light-mode-only) [Extended Openai Conversation](https://github.com/jekalmin/extended_openai_conversation) | _Home Assistant custom component of conversation agent. It uses OpenAI to control your devices._        | 1.0.3   |
| [<img src="https://brands.home-assistant.io/_/hacs/icon.png" height="24"/>](https://brands.home-assistant.io/_/hacs/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/hacs/icon.png" height="24"/>](https://brands.home-assistant.io/_/hacs/icon.png#gh-light-mode-only) [HACS](https://github.com/hacs/integration)                                                                                                                                              | _HACS gives you a powerful UI to handle downloads of all your custom needs._                            | 1.34.0  |
| [<img src="https://brands.home-assistant.io/_/readme/icon.png" height="24"/>](https://brands.home-assistant.io/_/readme/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/readme/icon.png" height="24"/>](https://brands.home-assistant.io/_/readme/icon.png#gh-light-mode-only) [Generate Readme](https://github.com/custom-components/readme)                                                                                                                   | _Use Jinja and data from Home Assistant to generate your README.md file_                                | 0.5.0   |
| [<img src="https://brands.home-assistant.io/_/toyota/icon.png" height="24"/>](https://brands.home-assistant.io/_/toyota/dark_icon.png#gh-dark-mode-only)[<img src="https://brands.home-assistant.io/_/toyota/icon.png" height="24"/>](https://brands.home-assistant.io/_/toyota/icon.png#gh-light-mode-only) [Toyota Connected Services Europe](https://github.com/DurgNomis-drol/ha_toyota)                                                                                                  | _Toyota Connected Services integration for Home Assistant._                                             | v2.0.3  |

### The custom Lovelace plugins that I use

| Lovelace plugins                                                          | Description                                                                                           | Version    |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------- |
| [My Cards Bundle](https://github.com/AnthonMS/my-cards)                   | _Bundle of my custom Lovelace cards for Home Assistant. Includes: my-slider, my-slider-v2, my-button_ | v1.0.5     |
| [Stack In Card](https://github.com/custom-cards/stack-in-card)            | _🛠 group multiple cards into one card without the borders_                                           | 0.2.0      |
| [Card Mod](https://github.com/thomasloven/lovelace-card-mod)              | _🔹 Add CSS styles to (almost) any lovelace card_                                                     | v3.4.3     |
| [Mushroom](https://github.com/piitaya/lovelace-mushroom)                  | _Build a beautiful Home Assistant dashboard easily_                                                   | v3.6.2     |
| [Valetudo Map Card](https://github.com/Hypfer/lovelace-valetudo-map-card) | _Display the map from a valetudo-enabled robot in a home assistant dashboard card._                   | v2023.04.0 |
| [Decluttering Card](https://github.com/custom-cards/decluttering-card)    | _🧹 Declutter your lovelace configuration with the help of this card_                                 | v1.0.0     |
| [Bar Card](https://github.com/custom-cards/bar-card)                      | _Customizable Animated Bar card for Home Assistant Lovelace_                                          | 3.2.0      |
| [Swipe Card](https://github.com/bramkragten/swipe-card)                   | _Card that allows you to swipe throught multiple cards for Home Assistant Lovelace_                   | v5.0.0     |
| [Mini Media Player](https://github.com/kalkih/mini-media-player)          | _Minimalistic media card for Home Assistant Lovelace UI_                                              | v1.16.9    |
| [Button Card](https://github.com/custom-cards/button-card)                | _❇️ Lovelace button-card for home assistant_                                                          | v4.1.2     |
| [Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus)   | _A power distribution card inspired by the official Energy Distribution card for Home Assistant_      | v0.2.2     |
| [Apexcharts Card](https://github.com/RomRider/apexcharts-card)            | _📈 A Lovelace card to display advanced graphs and charts based on ApexChartsJS for Home Assistant_   | v2.0.4     |
| [Layout Card](https://github.com/thomasloven/lovelace-layout-card)        | _🔹 Get more control over the placement of lovelace cards._                                           | v2.4.5     |
