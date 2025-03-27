@service
def force_sensor_update(entity_id=None):
    oldstate = state.get(entity_id)
    oldattributes = state.getattr(entity_id)
    state.set(
        entity_id, value=oldstate,
        new_attributes=oldattributes, **kwargs,
    )
