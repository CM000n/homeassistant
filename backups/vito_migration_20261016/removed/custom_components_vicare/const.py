"""Constants for the ViCare integration."""

from homeassistant.const import Platform

DOMAIN = "vicare"

PLATFORMS = [
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.CLIMATE,
    Platform.FAN,
    Platform.NUMBER,
    Platform.SELECT,
    Platform.SENSOR,
    Platform.SWITCH,
    Platform.TEXT,
    Platform.WATER_HEATER,
]

UNSUPPORTED_DEVICES = [
    "Heatbox1",
    "Heatbox2_SRC",
    "Heatbox3",
    "E3_TCU10_x07",
    "E3_TCU41_x04",
    "E3_RoomControl_One_522",
]

VICARE_NAME = "ViCare"
VICARE_TOKEN_FILENAME = "vicare_token.save"

VIESSMANN_DEVELOPER_PORTAL = "https://app.developer.viessmann-climatesolutions.com"

CONF_CIRCUIT = "circuit"

DEFAULT_CACHE_DURATION = 60

CONF_SCAN_INTERVAL = "scan_interval"
CONF_CYCLING_THRESHOLD = "cycling_threshold"
DEFAULT_CYCLING_THRESHOLD = 4
CONF_SYNC_SCHEDULES = "sync_schedules"
CONF_RETURN_TEMPERATURE = "return_temperature_entity"
MIN_SCAN_INTERVAL = 60
MAX_SCAN_INTERVAL = 3600

VICARE_BAR = "bar"
VICARE_CELSIUS = "celsius"
VICARE_CUBIC_METER = "cubicMeter"
VICARE_KW = "kilowatt"
VICARE_KWH = "kilowattHour"
VICARE_PERCENT = "percent"
VICARE_W = "watt"
VICARE_WH = "wattHour"
