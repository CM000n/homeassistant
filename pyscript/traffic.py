## ID address for light
#entity_id = state.get('entity_id')
#
## Current state of traffic
## ~sensor.home_to_office is my google_travel_time sensor
#traffic_status = (hass.states.get('sensor.von_zu_hause_zur_arbeit')).state
#
## Adjust times for different severity
## Good traffic
#if int(traffic_status) < 35:
#    hass.services.call(
#        'light', 'turn_on', {
#            'entity_id': entity_id, 'color_name': 'darkgreen', 'brightness': '255',
#        },
#    )
## OK traffic
#elif int(traffic_status) <= 40:
#    hass.services.call(
#        'light', 'turn_on', {
#            'entity_id': entity_id, 'color_name': 'darkorange', 'brightness': '255',
#        },
#    )
## Bad traffic
#elif int(traffic_status) > 40:
#    hass.services.call(
#        'light', 'turn_on', {
#            'entity_id': entity_id, 'color_name': 'darkred', 'brightness': '255',
#        },
#    )
## Unknown condtions
#else:
#    hass.services.call(
#        'light', 'turn_on', {
#            'entity_id': entity_id, 'color_name': 'purple', 'brightness': '255',
#        },
#    )
