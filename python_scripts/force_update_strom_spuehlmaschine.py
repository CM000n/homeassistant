#pass entity_id as argument from call
sensor = data.get('entity_id')

#read old state
oldstate = hass.states.get(sensor)

#write old state to entity and force update to record database
hass.states.set(sensor, oldstate.state , oldstate.attributes, force_update=True)