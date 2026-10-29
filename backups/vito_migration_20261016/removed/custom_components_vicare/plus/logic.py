"""Pure logic for ViCare Plus (no Home Assistant imports, unit testable).

Works on the raw feature payload of the Viessmann API, so every data point and
command the API exposes for a device can be turned into an entity, without
depending on a dedicated getter in PyViCare.
"""

from __future__ import annotations

from collections.abc import Iterable
import copy
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import re
import threading
from typing import Any

type Feature = dict[str, Any]
type FeatureMap = dict[str, Feature]

WEEKDAYS = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")
MINUTES_PER_DAY = 1440

# --------------------------------------------------------------------------
# Feature access
# --------------------------------------------------------------------------

_snapshot_lock = threading.Lock()
_snapshots: dict[tuple[int, str], tuple[Any, FeatureMap]] = {}


def get_features(api: Any) -> FeatureMap:
    """Return all features of a PyViCare device, keyed by feature name.

    Reads from the PyViCare cache that the coordinator just filled, so this
    does not cost an extra API call. Must run in the executor.
    """
    service = api.service
    accessor = api.accessor
    data = service.fetch_all_features(accessor)
    key = (id(service), str(accessor.device_id))
    with _snapshot_lock:
        cached = _snapshots.get(key)
        if cached is not None and cached[0] is data:
            return cached[1]
    extract = getattr(service, "_extract_entities", None)
    entities = extract(data, accessor) if extract else data.get("data", [])
    features = {
        item["feature"]: item
        for item in entities
        if isinstance(item, dict) and "feature" in item
    }
    with _snapshot_lock:
        _snapshots[key] = (data, features)
    return features


def prop(feature: Feature | None, name: str, default: Any = None) -> Any:
    """Return the value of a feature property."""
    if not feature:
        return default
    value = feature.get("properties", {}).get(name)
    if not isinstance(value, dict):
        return default
    return value.get("value", default)


def prop_unit(feature: Feature | None, name: str) -> str | None:
    """Return the unit of a feature property."""
    if not feature:
        return None
    value = feature.get("properties", {}).get(name)
    if not isinstance(value, dict):
        return None
    return value.get("unit") or None


def command(feature: Feature | None, name: str) -> dict[str, Any] | None:
    """Return a command definition of a feature."""
    if not feature:
        return None
    return feature.get("commands", {}).get(name)


def clean_string(value: Any) -> Any:
    """Strip NUL padding the API uses for fixed length strings."""
    if isinstance(value, str):
        value = value.replace("\x00", "").strip()
        return value or None
    return value


def camel_to_snake(value: str) -> str:
    """Convert an API enum value to a Home Assistant friendly option."""
    return re.sub(r"(?<=[a-z0-9])([A-Z])", r"_\1", value).lower()


# --------------------------------------------------------------------------
# Naming
# --------------------------------------------------------------------------

FEATURE_NAMES: dict[str, dict[str, str]] = {
    "de": {
        "heating.boiler.temperature": "Kessel Solltemperatur",
        "heating.boiler.sensors.temperature.main": "Kesseltemperatur",
        "heating.boiler.sensors.temperature.commonSupply": "Gemeinsame Vorlauftemperatur",
        "heating.boiler.pumps.internal": "Interne Kesselpumpe",
        "heating.sensors.temperature.outside": "Außentemperatur",
        "heating.dhw": "Warmwasser",
        "heating.dhw.charging": "Warmwasser Speicherladung",
        "heating.dhw.temperature.main": "Warmwasser Solltemperatur",
        "heating.dhw.sensors.temperature.hotWaterStorage": "Warmwasser Speichertemperatur",
        "heating.dhw.sensors.temperature.dhwCylinder": "Warmwasser Zylindertemperatur",
        "heating.dhw.sensors.temperature.outlet": "Warmwasser Auslauftemperatur",
        "heating.dhw.pumps.circulation": "Zirkulationspumpe",
        "heating.dhw.pumps.primary": "Speicherladepumpe",
        "heating.dhw.schedule": "Warmwasser Zeitprogramm",
        "heating.dhw.pumps.circulation.schedule": "Zirkulation Zeitprogramm",
        "heating.solar": "Solar",
        "heating.solar.power.cumulativeProduced": "Solar Gesamtertrag",
        "heating.solar.power.production": "Solarertrag",
        "heating.solar.rechargeSuppression": "Solar Nachladeunterdrückung",
        "heating.solar.pumps.circuit": "Solarkreispumpe",
        "heating.solar.sensors.temperature.collector": "Solar Kollektortemperatur",
        "heating.solar.sensors.temperature.dhw": "Solar Speichertemperatur",
        "heating.operating.programs.holiday": "Urlaubsprogramm",
        "heating.controller.serial": "Regler Seriennummer",
        "heating.boiler.serial": "Kessel Seriennummer",
        "heating.burners": "Brenner",
        "heating.circuits": "Heizkreise",
    },
    "en": {
        "heating.boiler.temperature": "Boiler target temperature",
        "heating.boiler.sensors.temperature.main": "Boiler temperature",
        "heating.boiler.sensors.temperature.commonSupply": "Common supply temperature",
        "heating.boiler.pumps.internal": "Internal boiler pump",
        "heating.sensors.temperature.outside": "Outside temperature",
        "heating.dhw": "DHW",
        "heating.dhw.charging": "DHW charging",
        "heating.dhw.temperature.main": "DHW target temperature",
        "heating.dhw.sensors.temperature.hotWaterStorage": "DHW storage temperature",
        "heating.dhw.sensors.temperature.dhwCylinder": "DHW cylinder temperature",
        "heating.dhw.sensors.temperature.outlet": "DHW outlet temperature",
        "heating.dhw.pumps.circulation": "DHW circulation pump",
        "heating.dhw.pumps.primary": "DHW charging pump",
        "heating.dhw.schedule": "DHW schedule",
        "heating.dhw.pumps.circulation.schedule": "Circulation schedule",
        "heating.solar": "Solar",
        "heating.solar.power.cumulativeProduced": "Solar total production",
        "heating.solar.power.production": "Solar production",
        "heating.solar.rechargeSuppression": "Solar recharge suppression",
        "heating.solar.pumps.circuit": "Solar circuit pump",
        "heating.solar.sensors.temperature.collector": "Solar collector temperature",
        "heating.solar.sensors.temperature.dhw": "Solar storage temperature",
        "heating.operating.programs.holiday": "Holiday program",
        "heating.controller.serial": "Controller serial",
        "heating.boiler.serial": "Boiler serial",
        "heating.burners": "Burners",
        "heating.circuits": "Circuits",
    },
}

TOKENS: dict[str, dict[str, str]] = {
    "de": {
        "boiler": "Kessel",
        "burners": "Brenner",
        "circuits": "Heizkreis",
        "compressors": "Verdichter",
        "circulation": "Zirkulation",
        "pump": "Pumpe",
        "pumps": "Pumpe",
        "internal": "intern",
        "primary": "Primär",
        "secondary": "Sekundär",
        "frostprotection": "Frostschutz",
        "curve": "Heizkurve",
        "schedule": "Zeitprogramm",
        "modes": "Betriebsart",
        "programs": "Programm",
        "comfort": "Komfort",
        "eco": "Eco",
        "normal": "Normal",
        "reduced": "Reduziert",
        "standby": "Standby",
        "external": "Extern",
        "holiday": "Urlaub",
        "holidayAtHome": "Urlaub zu Hause",
        "forcedNormal": "Dauernd Normal",
        "forcedReduced": "Dauernd Reduziert",
        "dhwAndHeating": "Warmwasser und Heizung",
        "dhw": "Warmwasser",
        "temperature": "Temperatur",
        "supply": "Vorlauf",
        "return": "Rücklauf",
        "outside": "Außen",
        "room": "Raum",
        "solar": "Solar",
        "power": "Leistung",
        "production": "Ertrag",
        "consumption": "Verbrauch",
        "gas": "Gas",
        "statistics": "Statistik",
        "modulation": "Modulation",
        "errorStatus": "Fehlerstatus",
        "automatic": "Automatik",
        "charging": "Ladung",
        "controller": "Regler",
        "serial": "Seriennummer",
        "name": "Name",
        "active": "Aktiv",
        "summary": "Zusammenfassung",
    },
    "en": {"dhw": "DHW", "dhwAndHeating": "DHW and heating"},
}

PROPERTY_NAMES: dict[str, dict[str, str]] = {
    "de": {
        "hours": "Betriebsstunden",
        "starts": "Starts",
        "errorCode": "Fehlercode",
        "errorDetails": "Fehlerdetails",
        "demand": "Anforderung",
        "start": "Beginn",
        "end": "Ende",
        "temperature": "Temperatur",
        "shift": "Niveau",
        "slope": "Neigung",
        "status": "Status",
    },
    "en": {"errorCode": "error code", "errorDetails": "error details"},
}

COMMAND_NAMES: dict[str, dict[str, str]] = {
    "de": {
        "unschedule": "beenden",
        "resetSchedule": "zurücksetzen",
        "activate": "aktivieren",
        "deactivate": "deaktivieren",
        "reboot": "neu starten",
    },
    "en": {"resetSchedule": "reset"},
}

# Properties that carry the main value of a feature and need no suffix.
PRIMARY_PROPS = {"value", "status", "active", "entries"}
SKIP_TOKENS = {"heating", "sensors", "operating", "main", "active"}
TOKEN_PAIRS = {
    ("circulation", "pump"): {"de": "Pumpe", "en": "pump"},
    ("temperature", "supply"): {"de": "Vorlauftemperatur", "en": "supply temperature"},
    ("temperature", "return"): {"de": "Rücklauftemperatur", "en": "return temperature"},
    ("temperature", "room"): {"de": "Raumtemperatur", "en": "room temperature"},
}


def _lang(language: str | None) -> str:
    return "de" if (language or "").lower().startswith("de") else "en"


def _split_camel(token: str) -> str:
    return re.sub(r"(?<=[a-z0-9])([A-Z])", r" \1", token).lower()


def feature_label(feature: str, language: str | None = None) -> str:
    """Return a human readable label for a feature path."""
    lang = _lang(language)
    if feature in FEATURE_NAMES[lang]:
        return FEATURE_NAMES[lang][feature]
    tokens = feature.split(".")
    words: list[str] = []
    # Translate a known prefix as a whole, e.g. heating.dhw.pumps.circulation
    for length in range(len(tokens) - 1, 1, -1):
        prefix = ".".join(tokens[:length])
        if prefix in FEATURE_NAMES[lang] and not prefix.endswith(
            ("heating.burners", "heating.circuits")
        ):
            words.append(FEATURE_NAMES[lang][prefix])
            tokens = tokens[length:]
            break
    index = 0
    while index < len(tokens):
        token = tokens[index]
        nxt = tokens[index + 1] if index + 1 < len(tokens) else None
        if token in ("circuits", "burners", "compressors") and nxt and nxt.isdigit():
            base = TOKENS[lang].get(token) or _split_camel(token).capitalize()
            if lang == "en":
                base = {"circuits": "Circuit", "burners": "Burner"}.get(token, base)
            words.append(f"{base} {nxt}")
            index += 2
            continue
        if nxt and (token, nxt) in TOKEN_PAIRS:
            words.append(TOKEN_PAIRS[(token, nxt)][lang])
            index += 2
            continue
        if token in SKIP_TOKENS:
            index += 1
            continue
        word = TOKENS[lang].get(token) or _split_camel(token)
        if not words or words[-1].lower() != word.lower():
            words.append(word)
        index += 1
    label = " ".join(words).strip() or feature
    return label[0].upper() + label[1:]


def property_label(name: str, language: str | None = None) -> str:
    """Return a label suffix for a property, empty for primary properties."""
    if name in PRIMARY_PROPS:
        return ""
    lang = _lang(language)
    return PROPERTY_NAMES[lang].get(name) or _split_camel(name)


def command_label(name: str, language: str | None = None) -> str:
    """Return a label suffix for a command."""
    lang = _lang(language)
    return COMMAND_NAMES[lang].get(name) or _split_camel(name)


def join_label(*parts: str) -> str:
    """Join label parts, skipping empty ones."""
    return " ".join(part for part in parts if part).strip()


# --------------------------------------------------------------------------
# Discovery
# --------------------------------------------------------------------------

# Data points the core integration already exposes. Plus creates them too,
# so nothing is missing, but disabled by default to avoid duplicates.
CORE_COVERED = [
    re.compile(pattern)
    for pattern in (
        r"^heating\.sensors\.temperature\.outside:value$",
        r"^heating\.boiler\.sensors\.temperature\.main:value$",
        r"^heating\.circuits\.\d+\.sensors\.temperature\.(supply|return|room):value$",
        r"^heating\.burners\.\d+:active$",
        r"^heating\.burners\.\d+\.statistics:(hours|starts)$",
        r"^heating\.burners\.\d+\.modulation:value$",
        r"^heating\.circuits\.\d+\.circulation\.pump:status$",
        r"^heating\.circuits\.\d+\.frostprotection:status$",
        r"^heating\.dhw\.charging:active$",
        r"^heating\.dhw\.pumps\.(circulation|primary):status$",
        r"^heating\.solar\.pumps\.circuit:status$",
        r"^heating\.solar\.sensors\.temperature\.(collector|dhw):value$",
        r"^heating\.dhw\.sensors\.temperature\.(hotWaterStorage|outlet)\w*:value$",
        r"^heating\.dhw\.temperature\.main:setTargetTemperature$",
        r"^heating\.circuits\.\d+\.operating\.programs\.(normal|reduced|comfort)\w*:setTemperature$",
        r"^heating\.circuits\.\d+\.operating\.programs\.(comfort|eco)\w*:switch$",
        r"^heating\.dhw\.operating\.modes\.active:setMode$",
        r"^heating\.(solar\.power\.production|gas\.consumption\.[\w.]+|power\.consumption\.[\w.]+):(day|week|month|year)#0$",
        r"^heating\.compressors\.\d+:active$",
        r"^heating\.circuits\.\d+\.heating\.curve:(shift|slope)$",
    )
]

# Redundant or rarely useful data points, created disabled by default.
NOISE = [
    re.compile(pattern)
    for pattern in (
        r"\.operating\.modes\.(?!active)\w+:active$",
        r"\.operating\.programs\.(?!active|holiday)\w+:active$",
        r":demand$",
        r"\.operating\.programs\.external:temperature$",
        r":resetSchedule$",
        r"\.serial:value$",
    )
]


def is_noise(key: str) -> bool:
    """Return True for data points that are created disabled by default."""
    return any(pattern.search(key) for pattern in NOISE)


# Features without user value or with dangerous commands.
SKIP_FEATURES = {"device.serial"}
SKIP_COMMANDS = {"setPrin", "setCurve", "setSchedule", "resetDay", "changeEndDate"}
SKIP_PROPS = {"audience", "position", "name", "type"}
# Diagnostic properties.
DIAGNOSTIC_PROPS = {"errorCode", "errorDetails"}
ARRAY_PERIODS = {"day": (0, 1), "week": (0, 1), "month": (0, 1), "year": (0, 1)}
ARRAY_LABELS = {
    "de": {
        ("day", 0): "heute",
        ("day", 1): "gestern",
        ("week", 0): "diese Woche",
        ("week", 1): "letzte Woche",
        ("month", 0): "dieser Monat",
        ("month", 1): "letzter Monat",
        ("year", 0): "dieses Jahr",
        ("year", 1): "letztes Jahr",
        ("day", "sum7"): "letzte 7 Tage",
        "connection": "Sensorfehler",
        "status": "Status",
    },
    "en": {
        ("day", 0): "today",
        ("day", 1): "yesterday",
        ("week", 0): "this week",
        ("week", 1): "last week",
        ("month", 0): "this month",
        ("month", 1): "last month",
        ("year", 0): "this year",
        ("year", 1): "last year",
        ("day", "sum7"): "last 7 days",
        "connection": "sensor fault",
        "status": "status",
    },
}


def is_core_covered(key: str) -> bool:
    """Return True if the core integration already exposes this data point."""
    return any(pattern.search(key) for pattern in CORE_COVERED)


# Data points that report the same sensor as another feature on many devices.
ALIASES: dict[re.Pattern[str], str] = {
    re.compile(
        r"^heating\.dhw\.sensors\.temperature\.dhwCylinder:(value|status)$"
    ): "heating.dhw.sensors.temperature.hotWaterStorage",
}


def is_duplicate(key: str, features: FeatureMap) -> bool:
    """Return True if a data point would duplicate an existing entity.

    Core entities win, they usually carry the longer history.
    """
    if is_core_covered(key):
        return True
    for pattern, original in ALIASES.items():
        if pattern.search(key):
            feature = features.get(original)
            if feature and feature.get("isEnabled", True):
                return True
    return False


@dataclass(frozen=True)
class PropertySpec:
    """A readable data point."""

    platform: str  # sensor | binary_sensor
    feature: str
    prop: str
    kind: str  # number | string | boolean | status | array
    unit: str | None = None
    index: int | str | None = None  # array element or aggregate
    diagnostic: bool = False
    with_active: bool = False

    @property
    def key(self) -> str:
        suffix = f"#{self.index}" if self.index is not None else ""
        return f"{self.feature}:{self.prop}{suffix}"


@dataclass(frozen=True)
class CommandSpec:
    """A writable data point or an action."""

    platform: str  # number | select | text | switch | button
    feature: str
    command: str
    param: str | None = None
    value_prop: str | None = None
    unit: str | None = None
    minimum: float | None = None
    maximum: float | None = None
    step: float | None = None
    options: tuple[str, ...] = ()
    min_length: int | None = None
    max_length: int | None = None
    off_command: str | None = None

    @property
    def key(self) -> str:
        name = (
            "switch" if self.platform == "switch" and self.off_command else self.command
        )
        return f"{self.feature}:{name}"


@dataclass(frozen=True)
class ScheduleSpec:
    """A writable time program."""

    feature: str
    modes: tuple[str, ...]
    default_mode: str
    max_entries: int
    resolution: int
    overlap_allowed: bool


@dataclass
class Discovery:
    """All entities ViCare Plus can create for a device."""

    properties: list[PropertySpec] = field(default_factory=list)
    commands: list[CommandSpec] = field(default_factory=list)
    schedules: list[ScheduleSpec] = field(default_factory=list)


def _required_params(cmd: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {
        name: param
        for name, param in (cmd.get("params") or {}).items()
        if param.get("required", False)
    }


def _value_prop_for(feature: Feature, param: str, kind: str) -> str | None:
    props = feature.get("properties", {})
    if param in props:
        return param
    if kind == "number":
        if param in ("targetTemperature", "temperature") and "temperature" in props:
            return "temperature"
        if "value" in props:
            return "value"
        numeric = [n for n, p in props.items() if p.get("type") == "number"]
        if len(numeric) == 1:
            return numeric[0]
        return None
    if "value" in props:
        return "value"
    return None


def schedule_spec(feature: Feature) -> ScheduleSpec | None:
    """Return the schedule spec of a feature with a setSchedule command."""
    cmd = command(feature, "setSchedule")
    if cmd is None or prop(feature, "entries") is None:
        return None
    constraints = (
        (cmd.get("params") or {}).get("newSchedule", {}).get("constraints", {})
    )
    modes = tuple(constraints.get("modes") or ())
    return ScheduleSpec(
        feature=feature["feature"],
        modes=modes,
        default_mode=constraints.get("defaultMode", "off"),
        max_entries=int(constraints.get("maxEntries", 4)),
        resolution=int(constraints.get("resolution", 10)),
        overlap_allowed=bool(constraints.get("overlapAllowed", True)),
    )


def discover(features: FeatureMap) -> Discovery:
    """Classify every enabled feature of a device into entity specs."""
    result = Discovery()
    for name in sorted(features):
        feature = features[name]
        if name in SKIP_FEATURES or not feature.get("isEnabled", True):
            continue
        props: dict[str, dict[str, Any]] = feature.get("properties", {}) or {}
        commands: dict[str, dict[str, Any]] = feature.get("commands", {}) or {}
        controlled: set[str] = set()

        spec = schedule_spec(feature)
        if spec is not None:
            result.schedules.append(spec)
            controlled.update({"entries", "active"})

        # Commands
        if (
            "activate" in commands
            and "deactivate" in commands
            and props.get("active", {}).get("type") == "boolean"
        ):
            result.commands.append(
                CommandSpec(
                    platform="switch",
                    feature=name,
                    command="activate",
                    off_command="deactivate",
                    value_prop="active",
                )
            )
            controlled.add("active")
        for cmd_name, cmd in commands.items():
            if cmd_name in SKIP_COMMANDS:
                continue
            if cmd_name in ("activate", "deactivate") and "active" in controlled:
                continue
            required = _required_params(cmd)
            if not required:
                result.commands.append(
                    CommandSpec(platform="button", feature=name, command=cmd_name)
                )
                continue
            if len(required) != 1:
                continue
            param_name, param = next(iter(required.items()))
            constraints = param.get("constraints") or {}
            ptype = param.get("type")
            if ptype == "number" and "min" in constraints and "max" in constraints:
                value_prop = _value_prop_for(feature, param_name, "number")
                if value_prop is None:
                    continue
                result.commands.append(
                    CommandSpec(
                        platform="number",
                        feature=name,
                        command=cmd_name,
                        param=param_name,
                        value_prop=value_prop,
                        unit=prop_unit(feature, value_prop),
                        minimum=float(constraints["min"]),
                        maximum=float(constraints["max"]),
                        step=float(constraints.get("stepping", 1) or 1),
                    )
                )
                controlled.add(value_prop)
            elif ptype == "string" and constraints.get("enum"):
                value_prop = _value_prop_for(feature, param_name, "string")
                if value_prop is None:
                    continue
                result.commands.append(
                    CommandSpec(
                        platform="select",
                        feature=name,
                        command=cmd_name,
                        param=param_name,
                        value_prop=value_prop,
                        options=tuple(constraints["enum"]),
                    )
                )
                controlled.add(value_prop)
            elif ptype == "string" and "maxLength" in constraints:
                if f"{name}.name" in features:
                    continue
                value_prop = _value_prop_for(feature, param_name, "string")
                if value_prop is None:
                    continue
                result.commands.append(
                    CommandSpec(
                        platform="text",
                        feature=name,
                        command=cmd_name,
                        param=param_name,
                        value_prop=value_prop,
                        min_length=int(constraints.get("minLength", 0)),
                        max_length=int(constraints["maxLength"]),
                    )
                )
                controlled.add(value_prop)
            elif ptype == "boolean":
                value_prop = _value_prop_for(feature, param_name, "boolean")
                if value_prop is None:
                    continue
                result.commands.append(
                    CommandSpec(
                        platform="switch",
                        feature=name,
                        command=cmd_name,
                        param=param_name,
                        value_prop=value_prop,
                    )
                )
                controlled.add(value_prop)

        # Properties
        for prop_name, prop_def in props.items():
            if prop_name in controlled or prop_name in SKIP_PROPS:
                continue
            if not isinstance(prop_def, dict):
                continue
            ptype = prop_def.get("type")
            value = prop_def.get("value")
            unit = prop_def.get("unit") or None
            diagnostic = prop_name in DIAGNOSTIC_PROPS or name.endswith(".serial")
            if ptype == "number":
                result.properties.append(
                    PropertySpec(
                        "sensor", name, prop_name, "number", unit, None, diagnostic
                    )
                )
            elif ptype == "boolean":
                result.properties.append(
                    PropertySpec("binary_sensor", name, prop_name, "boolean")
                )
            elif ptype == "string":
                if prop_name == "status" and value in ("on", "off"):
                    result.properties.append(
                        PropertySpec(
                            "binary_sensor",
                            name,
                            prop_name,
                            "status",
                            with_active="active" in props,
                        )
                    )
                elif prop_name == "status" and value in (
                    "connected",
                    "notConnected",
                    "error",
                ):
                    result.properties.append(
                        PropertySpec(
                            "binary_sensor",
                            name,
                            prop_name,
                            "connection",
                            None,
                            None,
                            True,
                        )
                    )
                elif name.endswith("ValueReadAt") or prop_name.endswith("ValueReadAt"):
                    continue
                else:
                    result.properties.append(
                        PropertySpec(
                            "sensor", name, prop_name, "string", None, None, diagnostic
                        )
                    )
            elif ptype == "array" and prop_name in ARRAY_PERIODS:
                if not isinstance(value, list) or not value:
                    continue
                if not all(isinstance(item, (int, float)) for item in value):
                    continue
                for index in ARRAY_PERIODS[prop_name]:
                    if index < len(value):
                        result.properties.append(
                            PropertySpec(
                                "sensor", name, prop_name, "array", unit, index
                            )
                        )
                if prop_name == "day" and len(value) >= 7:
                    result.properties.append(
                        PropertySpec("sensor", name, prop_name, "array", unit, "sum7")
                    )
    return result


def property_value(features: FeatureMap, spec: PropertySpec) -> Any:
    """Read the current value of a property spec."""
    feature = features.get(spec.feature)
    if feature is None:
        return None
    value = prop(feature, spec.prop)
    if spec.kind == "array":
        if not isinstance(value, list):
            return None
        if spec.index == "sum7":
            return round(sum(value[:7]), 3) if len(value) >= 7 else None
        assert isinstance(spec.index, int)
        return value[spec.index] if spec.index < len(value) else None
    if spec.kind == "status":
        return None if value is None else value == "on"
    if spec.kind == "connection":
        return None if value is None else value != "connected"
    if spec.kind == "string":
        value = clean_string(value)
        if value in ("unknown", "nothing"):
            return None
    return value


def property_name(spec: PropertySpec, language: str | None = None) -> str:
    """Return the display name of a property spec."""
    label = feature_label(spec.feature, language)
    lang = _lang(language)
    if spec.kind == "array":
        return join_label(label, ARRAY_LABELS[lang].get((spec.prop, spec.index), ""))
    if spec.kind == "connection":
        return join_label(label, ARRAY_LABELS[lang]["connection"])
    if spec.kind == "status" and spec.with_active:
        return join_label(label, ARRAY_LABELS[lang]["status"])
    return join_label(label, property_label(spec.prop, language))


def command_name(spec: CommandSpec, language: str | None = None) -> str:
    """Return the display name of a command spec."""
    label = feature_label(spec.feature, language)
    if spec.platform == "button":
        return join_label(label, command_label(spec.command, language))
    if spec.platform in ("switch", "select", "text"):
        return label
    return join_label(label, property_label(spec.value_prop or "", language))


# --------------------------------------------------------------------------
# Schedules
# --------------------------------------------------------------------------


def parse_time(value: str) -> int:
    """Convert HH:MM (including 24:00) to minutes of the day."""
    hours, minutes = value.split(":")
    return int(hours) * 60 + int(minutes)


def format_time(minutes: int) -> str:
    """Convert minutes of the day to HH:MM."""
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


def mode_at(
    entries: dict[str, list[dict[str, Any]]], default_mode: str, when: datetime
) -> str:
    """Return the scheduled mode at a point in time."""
    day = WEEKDAYS[when.weekday()]
    minute = when.hour * 60 + when.minute
    for entry in entries.get(day, []) or []:
        if parse_time(entry["start"]) <= minute < parse_time(entry["end"]):
            return entry.get("mode", default_mode)
    return default_mode


def next_change(
    entries: dict[str, list[dict[str, Any]]], default_mode: str, now: datetime
) -> tuple[datetime, str] | None:
    """Return the next point in time the scheduled mode changes."""
    current = mode_at(entries, default_mode, now)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    for offset in range(8):
        day_start = start_of_day + timedelta(days=offset)
        day = WEEKDAYS[day_start.weekday()]
        boundaries = sorted(
            {parse_time(e["start"]) for e in entries.get(day, []) or []}
            | {parse_time(e["end"]) for e in entries.get(day, []) or []}
            | {0}
        )
        for minute in boundaries:
            # Midnight boundaries are evaluated on the following day.
            if minute >= MINUTES_PER_DAY:
                continue
            point = day_start + timedelta(minutes=minute)
            if point <= now:
                continue
            mode = mode_at(entries, default_mode, point)
            if mode != current:
                return point, mode
    return None


def normalize_entries(entries: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    """Sort entries and renumber their positions."""
    result = []
    for position, entry in enumerate(
        sorted(entries, key=lambda e: (parse_time(e["start"]), parse_time(e["end"])))
    ):
        result.append(
            {
                "start": entry["start"],
                "end": entry["end"],
                "mode": entry["mode"],
                "position": position,
            }
        )
    return result


def merge_intervals(
    entries: Iterable[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Merge overlapping or adjacent entries with the same mode."""
    by_mode: dict[str, list[tuple[int, int]]] = {}
    for entry in entries:
        by_mode.setdefault(entry["mode"], []).append(
            (parse_time(entry["start"]), parse_time(entry["end"]))
        )
    merged: list[dict[str, Any]] = []
    for mode, intervals in by_mode.items():
        intervals.sort()
        current_start, current_end = intervals[0]
        for start, end in intervals[1:]:
            if start <= current_end:
                current_end = max(current_end, end)
            else:
                merged.append(
                    {
                        "start": format_time(current_start),
                        "end": format_time(current_end),
                        "mode": mode,
                    }
                )
                current_start, current_end = start, end
        merged.append(
            {
                "start": format_time(current_start),
                "end": format_time(current_end),
                "mode": mode,
            }
        )
    return normalize_entries(merged)


class ScheduleError(ValueError):
    """Raised when a schedule violates the device constraints."""


def validate_schedule(
    entries: dict[str, list[dict[str, Any]]], spec: ScheduleSpec
) -> dict[str, list[dict[str, Any]]]:
    """Validate and normalize a full week schedule against its constraints."""
    result: dict[str, list[dict[str, Any]]] = {}
    for day in WEEKDAYS:
        day_entries = entries.get(day, []) or []
        cleaned = []
        for entry in day_entries:
            try:
                start = parse_time(str(entry["start"])[:5])
                end = parse_time(str(entry["end"])[:5])
            except (KeyError, ValueError) as err:
                raise ScheduleError(f"{day}: invalid entry {entry}") from err
            mode = entry.get("mode") or (spec.modes[0] if spec.modes else None)
            if spec.modes and mode not in spec.modes:
                raise ScheduleError(
                    f"{day}: mode '{mode}' not allowed, use one of {list(spec.modes)}"
                )
            if not 0 <= start < end <= MINUTES_PER_DAY:
                raise ScheduleError(f"{day}: start must be before end ({entry})")
            if start % spec.resolution or end % spec.resolution:
                raise ScheduleError(
                    f"{day}: times must be multiples of {spec.resolution} minutes"
                )
            cleaned.append(
                {"start": format_time(start), "end": format_time(end), "mode": mode}
            )
        if not spec.overlap_allowed:
            cleaned = merge_intervals(cleaned)
        cleaned = normalize_entries(cleaned)
        if len(cleaned) > spec.max_entries:
            raise ScheduleError(
                f"{day}: at most {spec.max_entries} entries allowed, got {len(cleaned)}"
            )
        result[day] = cleaned
    return result


def floor_to(minutes: int, resolution: int) -> int:
    """Round down to the schedule resolution."""
    return minutes - minutes % resolution


def ceil_to(minutes: int, resolution: int) -> int:
    """Round up to the schedule resolution."""
    return (
        minutes
        if minutes % resolution == 0
        else minutes + resolution - minutes % resolution
    )


def boost_schedule(
    entries: dict[str, list[dict[str, Any]]],
    spec: ScheduleSpec,
    now: datetime,
    duration: timedelta,
    mode: str | None = None,
) -> tuple[dict[str, list[dict[str, Any]]], datetime]:
    """Return a copy of the schedule with an extra slot starting now.

    The slot ends at midnight at the latest. Returns the new schedule and the
    point in time the slot ends.
    """
    mode = mode or (spec.modes[0] if spec.modes else "on")
    if spec.modes and mode not in spec.modes:
        raise ScheduleError(f"mode '{mode}' not allowed, use one of {list(spec.modes)}")
    minute = now.hour * 60 + now.minute
    start = floor_to(minute, spec.resolution)
    end = min(
        ceil_to(minute + max(int(duration.total_seconds() // 60), 1), spec.resolution),
        MINUTES_PER_DAY,
    )
    if end <= start:
        end = min(start + spec.resolution, MINUTES_PER_DAY)
    day = WEEKDAYS[now.weekday()]
    new_entries = copy.deepcopy(entries)
    day_entries = [
        {k: e[k] for k in ("start", "end", "mode")}
        for e in new_entries.get(day, []) or []
    ]
    day_entries.append(
        {"start": format_time(start), "end": format_time(end), "mode": mode}
    )
    merged = merge_intervals(day_entries)
    if len(merged) > spec.max_entries:
        raise ScheduleError(
            f"No free slot left in today's schedule (max {spec.max_entries} entries)"
        )
    new_entries[day] = merged
    end_time = now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(
        minutes=end
    )
    return new_entries, end_time


def permanent_schedule(
    spec: ScheduleSpec, mode: str | None = None
) -> dict[str, list[dict[str, Any]]]:
    """Return a schedule that keeps the given mode active around the clock."""
    mode = mode or (spec.modes[0] if spec.modes else "on")
    return {
        day: [{"start": "00:00", "end": "24:00", "mode": mode, "position": 0}]
        for day in WEEKDAYS
    }


# --------------------------------------------------------------------------
# Heating curve
# --------------------------------------------------------------------------


def heating_curve_supply(
    outside: float, room: float, shift: float, slope: float, heatpump: bool = False
) -> float:
    """Return the target supply temperature of a Viessmann heating curve."""
    delta = outside - room
    factor = 1.148987 if heatpump else 1.4347
    supply = (
        room + shift - slope * delta * (factor + 0.021 * delta + 247.9e-6 * delta**2)
    )
    if heatpump:
        supply += 5
    return round(supply, 1)


def circuit_room_setpoint(
    features: FeatureMap, circuit: str
) -> tuple[float | None, str | None]:
    """Return the room setpoint the active program of a circuit aims for."""
    base = f"heating.circuits.{circuit}.operating.programs"
    active = prop(features.get(f"{base}.active"), "value")
    candidates = [active] if active else []
    candidates.append("normal")
    for program in candidates:
        temperature = prop(features.get(f"{base}.{program}"), "temperature")
        if isinstance(temperature, (int, float)) and temperature >= 5:
            return float(temperature), program
    return None, None


# --------------------------------------------------------------------------
# Thematic groups (sub-devices)
# --------------------------------------------------------------------------

GROUP_SYSTEM = "system"
GROUP_GENERATOR = "generator"
GROUP_DHW = "dhw"
GROUP_CIRCULATION = "circulation"
GROUP_SOLAR = "solar"
GROUP_BUFFER = "buffer"
GROUP_VENTILATION = "ventilation"

_GROUP_PREFIXES: list[tuple[str, str]] = [
    ("heating.dhw.pumps.circulation", GROUP_CIRCULATION),
    ("heating.dhw", GROUP_DHW),
    ("heating.solar", GROUP_SOLAR),
    ("heating.boiler", GROUP_GENERATOR),
    ("heating.burner", GROUP_GENERATOR),
    ("heating.compressor", GROUP_GENERATOR),
    ("heating.condensor", GROUP_GENERATOR),
    ("heating.evaporator", GROUP_GENERATOR),
    ("heating.inverter", GROUP_GENERATOR),
    ("heating.primaryCircuit", GROUP_GENERATOR),
    ("heating.secondaryCircuit", GROUP_GENERATOR),
    ("heating.gas", GROUP_GENERATOR),
    ("heating.power", GROUP_GENERATOR),
    ("heating.buffer", GROUP_BUFFER),
    ("ventilation", GROUP_VENTILATION),
]

_GROUP_LABELS: dict[str, dict[str, str]] = {
    "de": {
        GROUP_SYSTEM: "Anlage",
        GROUP_GENERATOR: "Kessel",
        GROUP_DHW: "Warmwasser",
        GROUP_CIRCULATION: "Zirkulation",
        GROUP_SOLAR: "Solar",
        GROUP_BUFFER: "Pufferspeicher",
        GROUP_VENTILATION: "Lüftung",
        "circuit": "Heizkreis",
        "heatpump": "Wärmepumpe",
    },
    "en": {
        GROUP_SYSTEM: "System",
        GROUP_GENERATOR: "Boiler",
        GROUP_DHW: "DHW",
        GROUP_CIRCULATION: "Circulation",
        GROUP_SOLAR: "Solar",
        GROUP_BUFFER: "Buffer",
        GROUP_VENTILATION: "Ventilation",
        "circuit": "Circuit",
        "heatpump": "Heat pump",
    },
}

# Name prefixes removed from entity names inside a group, the group name is
# already part of the friendly name through the device.
_GROUP_STRIP: dict[str, dict[str, tuple[str, ...]]] = {
    "de": {
        GROUP_GENERATOR: ("Kessel",),
        GROUP_DHW: ("Warmwasser",),
        GROUP_CIRCULATION: ("Zirkulation",),
        GROUP_SOLAR: ("Solar",),
        GROUP_BUFFER: ("Pufferspeicher", "Puffer"),
    },
    "en": {
        GROUP_GENERATOR: ("Boiler",),
        GROUP_DHW: ("DHW circulation", "DHW"),
        GROUP_CIRCULATION: ("DHW circulation", "Circulation"),
        GROUP_SOLAR: ("Solar",),
        GROUP_BUFFER: ("Buffer",),
    },
}


def group_of(feature: str) -> str:
    """Return the thematic group of a feature, e.g. circuit_1 or dhw."""
    parts = feature.split(".")
    if len(parts) >= 3 and parts[:2] == ["heating", "circuits"] and parts[2].isdigit():
        if len(parts) > 3 and parts[3] == "dhw":
            return GROUP_CIRCULATION if "circulation" in feature else GROUP_DHW
        return f"circuit_{parts[2]}"
    for prefix, group in _GROUP_PREFIXES:
        if feature.startswith(prefix):
            return group
    return GROUP_SYSTEM


def group_label(group: str, language: str | None, heatpump: bool = False) -> str:
    """Return the display name of a group."""
    labels = _GROUP_LABELS[_lang(language)]
    if group.startswith("circuit_"):
        return f"{labels['circuit']} {group.split('_', 1)[1]}"
    if group == GROUP_GENERATOR and heatpump:
        return labels["heatpump"]
    return labels.get(group, group)


def strip_group_prefix(name: str, group: str, language: str | None) -> str:
    """Remove the group name from the beginning of an entity name."""
    lang = _lang(language)
    if group == GROUP_GENERATOR:
        # Single burner devices: "Brenner 0 Modulation" -> "Brenner Modulation"
        name = re.sub(r"^(Brenner|Burner) 0\b", r"\1", name)
    if group.startswith("circuit_"):
        prefixes: tuple[str, ...] = (group_label(group, language),)
    else:
        prefixes = _GROUP_STRIP[lang].get(group, ())
    for prefix in prefixes:
        if name == prefix:
            return "Aktiv" if lang == "de" else "Active"
        if name.startswith(f"{prefix} "):
            rest = name[len(prefix) + 1 :]
            return rest[:1].upper() + rest[1:]
        # German compounds: "Solarertrag" -> "Ertrag", "Zirkulationspumpe" -> "Pumpe"
        if (
            lang == "de"
            and name.startswith(prefix)
            and len(name) > len(prefix) + 2
            and name[len(prefix)].islower()
        ):
            rest = name[len(prefix) :]
            # Linking "s": "Zirkulationspumpe" -> "Pumpe"
            if prefix.endswith(("ion", "ung", "heit", "keit")) and rest[:1] == "s":
                rest = rest[1:]
            return rest[:1].upper() + rest[1:]
    return name


# --------------------------------------------------------------------------
# Icons
# --------------------------------------------------------------------------

# (regex on "<feature>:<prop or command>", icon, icon when off)
ICON_RULES: list[tuple[str, str, str | None]] = [
    (r"sensors\.temperature[^:]*:status", "mdi:thermometer-alert", None),
    (
        r"errorCode|errorDetails|errorStatus|\.messages\.",
        "mdi:alert-circle-outline",
        None,
    ),
    (r"\.automatic:", "mdi:check-network-outline", None),
    (r"\.schedule:resetSchedule", "mdi:calendar-refresh", None),
    (r"\.schedule", "mdi:calendar-clock", None),
    (r"\.pumps\.circulation:(status|active)", "mdi:water-sync", "mdi:sync-off"),
    (r"\.(pumps\.\w+|circulation\.pump):(status|active)", "mdi:pump", "mdi:pump-off"),
    (r"^heating\.burners?\.\d+:active", "mdi:fire", "mdi:fire-off"),
    (r"^heating\.burners?\.\d+\.modulation", "mdi:fire-circle", None),
    (r"^heating\.burners?\.\d+\.statistics:starts", "mdi:counter", None),
    (
        r"^heating\.burners?\.\d+\.statistics:hours",
        "mdi:clock-time-eight-outline",
        None,
    ),
    (r"^heating\.burners?", "mdi:fire", None),
    (r"holiday[^:]*:start", "mdi:airplane-takeoff", None),
    (r"holiday[^:]*:end", "mdi:airplane-landing", None),
    (r"holiday[^:]*:unschedule", "mdi:airplane-off", None),
    (r"holiday", "mdi:airplane", "mdi:airplane-off"),
    (r"\.operating\.modes\.active", "mdi:cog-transfer-outline", None),
    (r"\.operating\.modes\.standby", "mdi:power-standby", None),
    (r"\.operating\.modes\.dhw:", "mdi:water-boiler", "mdi:water-boiler-off"),
    (r"\.operating\.modes\.dhwAndHeating", "mdi:home-thermometer", None),
    (r"\.operating\.modes\.forced", "mdi:hand-back-right-outline", None),
    (r"\.operating\.programs\.comfort", "mdi:sofa-outline", None),
    (r"\.operating\.programs\.eco", "mdi:leaf", None),
    (r"\.operating\.programs\.reduced", "mdi:thermometer-low", None),
    (r"\.operating\.programs\.normal", "mdi:thermometer", None),
    (r"\.operating\.programs\.standby", "mdi:power-standby", None),
    (r"\.operating\.programs\.external", "mdi:thermometer-lines", None),
    (r"\.operating\.programs\.active", "mdi:format-list-bulleted-type", None),
    (r"frostprotection", "mdi:snowflake-thermometer", None),
    (r"\.name:", "mdi:rename-outline", None),
    (r"serial", "mdi:barcode", None),
    (r"^heating\.circuits\.\d+:active", "mdi:radiator", "mdi:radiator-off"),
    (r"temperature\.supply", "mdi:thermometer-chevron-up", None),
    (r"temperature\.return", "mdi:thermometer-chevron-down", None),
    (r"temperature\.outside", "mdi:home-thermometer-outline", None),
    (r"^heating\.dhw:(active|status)", "mdi:water-boiler", "mdi:water-boiler-off"),
    (r"^heating\.dhw\.charging", "mdi:water-boiler-alert", None),
    (r"^heating\.dhw\.temperature", "mdi:water-thermometer", None),
    (r"^heating\.dhw\.sensors", "mdi:water-thermometer-outline", None),
    (r"^heating\.dhw", "mdi:water-boiler", None),
    (r"^heating\.solar\.sensors\.temperature\.collector", "mdi:solar-panel", None),
    (r"^heating\.solar\.sensors", "mdi:solar-power-variant-outline", None),
    (r"^heating\.solar\.rechargeSuppression", "mdi:battery-off-outline", None),
    (r"^heating\.solar\.power", "mdi:solar-power-variant", None),
    (r"^heating\.solar", "mdi:white-balance-sunny", "mdi:weather-night"),
    (r"^heating\.boiler\.(sensors\.)?temperature", "mdi:thermometer-water", None),
    (r"gas", "mdi:meter-gas-outline", None),
    (r"power\.consumption", "mdi:flash", None),
    (r"\.curve", "mdi:chart-bell-curve-cumulative", None),
]

_ICON_RULES = [(re.compile(rule), on, off) for rule, on, off in ICON_RULES]


def icon_for(key: str) -> tuple[str | None, str | None]:
    """Return the (icon, icon when off) for an entity key."""
    for rule, on, off in _ICON_RULES:
        if rule.search(key):
            return on, off
    return None, None


# --------------------------------------------------------------------------
# Home Assistant schedule helper mapping
# --------------------------------------------------------------------------

HELPER_DAYS = (
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
)


def _helper_time(minutes: int) -> str:
    return "24:00:00" if minutes >= MINUTES_PER_DAY else f"{format_time(minutes)}:00"


def flatten_day(
    entries: Iterable[dict[str, Any]],
    default_mode: str,
    modes: tuple[str, ...] = (),
) -> list[tuple[int, int, str]]:
    """Turn possibly overlapping entries into ordered, disjoint active ranges.

    Where entries overlap, the mode listed later in modes wins (e.g. comfort
    over normal).
    """
    items = [
        (parse_time(e["start"]), parse_time(e["end"]), e.get("mode") or default_mode)
        for e in entries
    ]
    bounds = sorted(
        {0, MINUTES_PER_DAY, *(s for s, _, _ in items), *(e for _, e, _ in items)}
    )
    result: list[tuple[int, int, str]] = []
    for start, end in zip(bounds, bounds[1:], strict=False):
        active = [m for s, e, m in items if s <= start < e]
        if not active:
            continue
        mode = max(active, key=lambda m: modes.index(m) if m in modes else -1)
        if mode == default_mode:
            continue
        if result and result[-1][1] == start and result[-1][2] == mode:
            result[-1] = (result[-1][0], end, mode)
        else:
            result.append((start, end, mode))
    return result


def entries_to_helper(
    entries: dict[str, Any] | None, spec: ScheduleSpec
) -> dict[str, list[dict[str, Any]]]:
    """Convert a device week program into the schedule helper format."""
    entries = entries or {}
    result: dict[str, list[dict[str, Any]]] = {}
    for short, long in zip(WEEKDAYS, HELPER_DAYS, strict=True):
        ranges = []
        for start, end, mode in flatten_day(
            entries.get(short) or [], spec.default_mode, spec.modes
        ):
            item: dict[str, Any] = {
                "from": _helper_time(start),
                "to": _helper_time(end),
            }
            if len(spec.modes) > 1:
                item["data"] = {"mode": mode}
            ranges.append(item)
        result[long] = ranges
    return result


def _helper_minutes(value: Any) -> int:
    text = str(value)
    hours, minutes = text.split(":")[:2]
    return int(hours) * 60 + int(minutes)


def normalize_helper(
    item: dict[str, Any], spec: ScheduleSpec
) -> dict[str, list[dict[str, Any]]]:
    """Return the comparable week of a schedule helper item."""
    return entries_to_helper(helper_to_entries(item, spec, strict=False), spec)


def helper_to_entries(
    item: dict[str, Any], spec: ScheduleSpec, strict: bool = True
) -> dict[str, list[dict[str, Any]]]:
    """Convert a schedule helper item into a device week program.

    Times are aligned to the resolution of the device. With strict, a program
    the device cannot store raises ScheduleError.
    """
    fallback = spec.modes[0] if spec.modes else "on"
    week: dict[str, list[dict[str, Any]]] = {}
    for short, long in zip(WEEKDAYS, HELPER_DAYS, strict=True):
        day = []
        for time_range in item.get(long) or []:
            start = floor_to(_helper_minutes(time_range["from"]), spec.resolution)
            end = min(
                ceil_to(_helper_minutes(time_range["to"]), spec.resolution),
                MINUTES_PER_DAY,
            )
            if end <= start:
                continue
            mode = (time_range.get("data") or {}).get("mode")
            if mode not in spec.modes:
                mode = fallback
            day.append(
                {"start": format_time(start), "end": format_time(end), "mode": mode}
            )
        week[short] = merge_intervals(day) if day else []
    if strict:
        return validate_schedule(week, spec)
    return week


# Entities of the core integration, mapped by their unique id suffix.
_CORE_KEY_GROUPS: list[tuple[re.Pattern[str], str]] = [
    (
        re.compile(r"(dhw|domestic_hot_water)_?circulation"),
        GROUP_CIRCULATION,
    ),
    (re.compile(r"^(solar|collector)"), GROUP_SOLAR),
    (
        re.compile(r"dhw|hotwater|hot_water|charging|onetimecharge|one_time_charge"),
        GROUP_DHW,
    ),
    (re.compile(r"^buffer"), GROUP_BUFFER),
    (
        re.compile(
            r"^(ventilation|quickmode|filter|supply_fan|exhaust|extract|pm\d"
            r"|supply_humidity|supply_temperature$)"
        ),
        GROUP_VENTILATION,
    ),
    (
        re.compile(
            r"^(boiler|burner|compressor|condenser|evaporator|inverter|heating_rod"
            r"|hot_gas|suction_gas|liquid_gas|primary_circuit|secondary_circuit"
            r"|return_temperature|volumetric_flow|hydraulic_separator"
            r"|supply_pressure|cop_|spf_|gas_|power[ _]consumption|power_production"
            r"|energy_|fuel_need)"
        ),
        GROUP_GENERATOR,
    ),
]

_GENERATOR_COMPONENTS = ("burner", "compressor", "condens", "evaporator", "inverter")


def core_group(key: str, component_kind: str | None, component_id: Any) -> str:
    """Return the group of a core entity from its key and component."""
    kind = (component_kind or "").lower()
    if "circuit" in kind and component_id is not None:
        return f"circuit_{component_id}"
    if any(part in kind for part in _GENERATOR_COMPONENTS):
        return GROUP_GENERATOR
    if key.isdigit():
        # The water heater uses the circuit id as key.
        return GROUP_DHW
    for pattern, group in _CORE_KEY_GROUPS:
        if pattern.search(key):
            return group
    return GROUP_SYSTEM
