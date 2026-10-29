/*
 * Schedule Helper Card — weekly schedules for any device, with optional Shabbat and Jewish holiday modes.
 *
 *   type: custom:schedule-helper-card
 *   type: custom:schedule-helper-shabbat-card
 *
 * Until 2.0 the cards were `custom:beit-schedule-card` and `custom:beit-shabbat-card`; those types still work.
 *
 * Everything the card writes is a native Home Assistant object: a `schedule` helper and an ordinary automation,
 * and a label per mode. The data shapes are fixed by docs/contract.md, shared with the Beit app.
 *
 * Pure logic sits at the top and is exported, so `node --test` can import this file.
 * Custom elements are registered only where `customElements` exists.
 */

export const VERSION = '2.3.0';

// ---------------------------------------------------------------------------- week model

/** HA's day keys, Sunday first — the Israeli week. */
export const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
export const DAY_NAMES = {
  he: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};
export const DAY_SHORT = {
  he: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
};

/** "HH:MM[:SS]" → minutes from midnight. "24:00:00" is 1440, and so is "23:59:59". Minute precision. */
export function parseBlock(hms) {
  const p = String(hms).split(':').map((x) => parseInt(x, 10));
  const minutes = p[0] * 60 + (p[1] || 0);
  return p.length > 2 && p[2] === 59 && minutes === 1439 ? 1440 : minutes;
}

/** Minutes → "HH:MM:00"; 1440 → "24:00:00" (HA's "until midnight"). */
export function formatBlock(m) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:00`;
}

/**
 * A time as typed, always 24-hour: "7", "07", "730", "0730", "7:30", "07.30", "24:00". Minutes from midnight, or null.
 * 24:00 (1440) is allowed; the caller decides where it makes sense.
 */
export function parseTimeInput(text) {
  const v = String(text ?? '').trim().replace(/[.,;]/g, ':');
  let m = v.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (!m) {
    const digits = v.match(/^(\d{3,4})$/)?.[1];
    if (digits) m = [digits, digits.slice(0, -2), digits.slice(-2)];
  }
  if (!m) return null;
  const h = Number(m[1]);
  const min = m[2] === undefined ? 0 : Number(m[2]);
  if (h > 24 || min > 59 || (h === 24 && min !== 0)) return null;
  return h * 60 + min;
}

/** Minutes → "HH:MM" for display; 1440 → "24:00". */
export const hm = (m) => formatBlock(m).slice(0, 5);

export const blockLabel = (b) => `${hm(b.start)}–${hm(b.end)}`;

const byStart = (a, b) => a.start - b.start;

export class WeekSchedule {
  constructor({ name = '', days = {} } = {}) {
    this.name = name;
    this.days = {};
    for (const d of DAYS) this.days[d] = (days[d] || []).map((b) => ({ ...b }));
  }

  /** From a `schedule/list` item (or anything with the seven day keys). */
  static fromHA(j) {
    const days = {};
    for (const d of DAYS) {
      // HA lets a block carry extra `data`; it rides along so an edit does not drop it.
      days[d] = (j?.[d] || []).map((b) => ({ start: parseBlock(b.from), end: parseBlock(b.to), ...(b.data ? { data: b.data } : {}) })).sort(byStart);
    }
    return new WeekSchedule({ name: j?.name ?? '', days });
  }

  /** The body HA's `schedule/create` and `schedule/update` expect (minus the id). Days go out Sunday first, sorted. */
  toHA() {
    const out = { name: this.name.trim() };
    for (const d of DAYS) {
      out[d] = [...this.days[d]].sort(byStart).map((b) => ({ from: formatBlock(b.start), to: formatBlock(b.end), ...(b.data ? { data: b.data } : {}) }));
    }
    return out;
  }

  get isEmpty() {
    return DAYS.every((d) => !this.days[d].length);
  }

  clone() {
    return new WeekSchedule({ name: this.name, days: this.days });
  }

  /** Why HA would reject this week, in words; null when it is valid. */
  validate(lang = 'en') {
    const t = STRINGS[lang] || STRINGS.en;
    if (!this.name.trim()) return t.errName;
    for (let i = 0; i < DAYS.length; i++) {
      const blocks = [...this.days[DAYS[i]]].sort(byStart);
      const day = (DAY_NAMES[lang] || DAY_NAMES.en)[i];
      for (let k = 0; k < blocks.length; k++) {
        if (blocks[k].end <= blocks[k].start) return t.errReversed(day);
        if (k > 0 && blocks[k].start < blocks[k - 1].end) return t.errOverlap(day);
      }
    }
    return null;
  }
}

// ---------------------------------------------------------------------------- the automation a schedule drives

/** Marks automations this card (or the Beit app, which shares the data) wrote, so it knows which ones it may rewrite or delete. */
export const BEIT_MARKER = 'נוצר באפליקציית Beit';

/**
 * What a new schedule does to its device:
 * `{entityId, name, hvacMode?, temperature?, brightnessPct?, turnOffAtEnd = true}`.
 */
const domainOf = (entityId) => String(entityId).split('.')[0];
const given = (v) => v !== null && v !== undefined;

export function onActions(target) {
  const domain = domainOf(target.entityId);
  const t = { entity_id: target.entityId };
  switch (domain) {
    case 'climate':
      if (given(target.temperature)) {
        const data = { temperature: target.temperature };
        if (given(target.hvacMode)) data.hvac_mode = target.hvacMode;
        return [{ action: 'climate.set_temperature', target: t, data }];
      }
      return [{ action: 'climate.set_hvac_mode', target: t, data: { hvac_mode: target.hvacMode ?? 'cool' } }];
    case 'water_heater':
      return [
        { action: 'water_heater.turn_on', target: t },
        ...(given(target.temperature) ? [{ action: 'water_heater.set_temperature', target: t, data: { temperature: target.temperature } }] : []),
      ];
    case 'light':
      return [{ action: 'light.turn_on', target: t, ...(given(target.brightnessPct) ? { data: { brightness_pct: target.brightnessPct } } : {}) }];
    case 'cover':
      return [{ action: 'cover.open_cover', target: t }];
    case 'valve':
      return [{ action: 'valve.open_valve', target: t }];
    default:
      return [{ action: `${domain}.turn_on`, target: t }];
  }
}

export function offActions(target) {
  if (target.turnOffAtEnd === false) return [];
  const domain = domainOf(target.entityId);
  const t = { entity_id: target.entityId };
  switch (domain) {
    case 'cover':
      return [{ action: 'cover.close_cover', target: t }];
    case 'valve':
      return [{ action: 'valve.close_valve', target: t }];
    case 'media_player':
      return [{ action: 'media_player.media_pause', target: t }];
    default:
      return [{ action: `${domain}.turn_off`, target: t }];
  }
}

/** The automation that makes a schedule drive a device (contract §2). */
export function buildScheduleAutomation({ id, scheduleEntityId, scheduleName, target }) {
  // A restart makes the schedule pass through "unavailable"; that is not an edge.
  const notFrom = ['unavailable', 'unknown'];
  const off = offActions(target);
  const trigger = (to, tid) => ({ trigger: 'state', entity_id: [scheduleEntityId], to: [to], not_from: notFrom, id: tid });
  const branch = (tid, sequence) => ({ conditions: [{ condition: 'trigger', id: tid }], sequence });
  return {
    id,
    alias: scheduleAlias(scheduleName),
    description: `${BEIT_MARKER} — ${target.name ?? target.entityId} לפי ${scheduleEntityId}`,
    triggers: [trigger('on', 'schedule_on'), ...(off.length ? [trigger('off', 'schedule_off')] : [])],
    conditions: [],
    actions: [{ choose: [branch('schedule_on', onActions(target)), ...(off.length ? [branch('schedule_off', off)] : [])] }],
    mode: 'queued',
  };
}

/** True for an automation config carrying the marker (so the card may rewrite or delete it). */
export const isOurs = (config) => String(config?.description ?? '').includes(BEIT_MARKER);

// Key order is HA's business; compare configs by content.
const canonical = (v) => (Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical(v[k])])) : v);
export const sameConfig = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

export const scheduleAlias = (scheduleName) => `Beit · ${scheduleName}`;

/**
 * Reads back what an automation written by buildScheduleAutomation does: `{scheduleEntityId, scheduleName, target}`.
 * Null unless it carries the marker and is exactly in that shape (so it was not edited by hand since): the card never
 * rewrites what it could not write again.
 */
export function parseScheduleAutomation(config) {
  if (!isOurs(config)) return null;
  const choose = config.actions?.[0]?.choose;
  const on = choose?.[0]?.sequence;
  const scheduleEntityId = config.triggers?.[0]?.entity_id?.[0];
  const first = on?.[0];
  const entityId = first?.target?.entity_id;
  if (!scheduleEntityId || typeof entityId !== 'string' || !String(config.alias ?? '').startsWith('Beit · ')) return null;
  const data = first.data || {};
  const name = String(config.description).match(/ — (.*) לפי schedule\.[a-z0-9_]+$/)?.[1] ?? entityId;
  const target = {
    entityId,
    name,
    hvacMode: data.hvac_mode ?? null,
    temperature: data.temperature ?? on[1]?.data?.temperature ?? null,
    brightnessPct: data.brightness_pct ?? null,
    turnOffAtEnd: (choose?.length ?? 0) > 1,
  };
  const scheduleName = config.alias.slice('Beit · '.length);
  const again = buildScheduleAutomation({ id: config.id, scheduleEntityId, scheduleName, target });
  return sameConfig(again, config) ? { scheduleEntityId, scheduleName, target } : null;
}

/** The schedule entities an automation config refers to. */
export function schedulesIn(config, states = null) {
  const ids = [...new Set(JSON.stringify(config ?? {}).match(/schedule\.[a-z0-9_]+/g) || [])];
  // "schedule.reload" or "schedule.get_schedule" are actions, not entities: keep what HA has as a state.
  return states ? ids.filter((id) => id in states) : ids;
}

// ---------------------------------------------------------------------------- modes

export const MODES = ['שבת', 'חג'];
export const MODE_LABEL_STYLE = {
  שבת: { icon: 'mdi:candle', color: 'amber' },
  חג: { icon: 'mdi:star-david', color: 'indigo' },
};

/** A mode's switch: 'on' when every member automation is on, 'partial' when some are, 'off' when none, 'empty'. */
export function modeState(members) {
  const list = members || [];
  if (!list.length) return 'empty';
  const on = list.filter((m) => (typeof m === 'string' ? m : m?.state) === 'on').length;
  return on === list.length ? 'on' : on ? 'partial' : 'off';
}

// ---------------------------------------------------------------------------- calendar

const UNUSABLE = new Set(['unknown', 'unavailable', 'אין מידע', '', 'None']);
export const usable = (st) => !!st && !UNUSABLE.has(String(st.state));

/** The entity for a base id, allowing HA's `_2`/`_3` suffixes. Prefers the exact id, then a live one. */
function pick(states, base) {
  const re = new RegExp(`^${base.replace(/\./g, '\\.')}(_\\d+)?$`);
  const hits = Object.keys(states).filter((id) => re.test(id)).sort((a, b) => a.length - b.length || a.localeCompare(b));
  return hits.find((id) => usable(states[id])) || hits[0] || null;
}

/**
 * The Jewish calendar entities in this house: the core Jewish Calendar integration (preferred) and Hebcal.
 * Every field is an entity id or null.
 */
export function findCalendar(states) {
  const s = states || {};
  const jc = (kind, suffix) => pick(s, `${kind}.jewish_calendar_${suffix}`);
  const hc = (suffix) => pick(s, `sensor.hebcal_${suffix}`);
  const cal = {
    issur: jc('binary_sensor', 'issur_melacha_in_effect'),
    erev: jc('binary_sensor', 'erev_shabbat_hag'),
    motzei: jc('binary_sensor', 'motzei_shabbat_hag'),
    candleLighting: jc('sensor', 'upcoming_candle_lighting'),
    shabbatCandleLighting: jc('sensor', 'upcoming_shabbat_candle_lighting'),
    havdalah: jc('sensor', 'upcoming_havdalah'),
    date: jc('sensor', 'date'),
    parasha: jc('sensor', 'weekly_torah_portion'),
    holiday: jc('sensor', 'holiday'),
    hebcal: {
      isShabbat: hc('is_shabbat'),
      date: hc('hebrew_date'),
      parasha: hc('parasha'),
      event: hc('event_name'),
      candleLighting: hc('shabbat_entry'),
      havdalah: hc('shabbat_came_out'),
    },
  };
  cal.source = cal.issur || cal.motzei ? 'jewish_calendar' : cal.hebcal.isShabbat ? 'hebcal' : null;
  return cal;
}

// ---------------------------------------------------------------------------- automatic modes

/** One automation per mode switches the mode on before it begins and off after it ends. Recognised by alias. */
export const AUTO_ALIAS = { שבת: 'Beit · מצב שבת אוטומטי', חג: 'Beit · מצב חג אוטומטי' };
export const AUTO_SHABBAT_ALIAS = AUTO_ALIAS['שבת'];
export const isAutoAlias = (name) => Object.values(AUTO_ALIAS).includes(name);

/** When a mode switches on: `{at: 'HH:MM'}` on the day, or `{hoursBefore: n}` before candle lighting (Jewish Calendar). */
export const DEFAULT_AUTO_START = { at: '12:00' };
const START_ID = { שבת: 'erev_shabbat', חג: 'erev_chag' };
const END_ID = { שבת: 'motzei_shabbat', חג: 'motzei_chag' };
// Longer than any Shabbat on its own (about 25-26 hours from candle lighting to havdalah), shorter than Shabbat plus a
// day of chag (about 49): on a Friday, a longer stretch ahead means a chag is next to this Shabbat.
const LONG_REST_SECONDS = 36 * 3600;

/**
 * The trigger that marks the end of Shabbat. Jewish Calendar's "issur melacha" going off is preferred
 * (then its "motzei" going on); Hebcal's is_shabbat True→False otherwise. Explicit from/to: both pass
 * through "unknown" on a restart. Null when the house has no calendar.
 */
export function autoShabbatEndTrigger(cal) {
  const t = (entity, from, to) => ({ trigger: 'state', entity_id: [entity], from, to, id: END_ID['שבת'] });
  if (cal?.issur) return t(cal.issur, 'on', 'off');
  if (cal?.motzei) return t(cal.motzei, 'off', 'on');
  if (cal?.hebcal?.isShabbat) return t(cal.hebcal.isShabbat, 'True', 'False');
  return null;
}

/** The end of a mode: Shabbat as above; chag needs Jewish Calendar (Hebcal's yom tov sensor is not reliable). */
export function autoEndTrigger(mode, cal) {
  if (mode === 'שבת') return autoShabbatEndTrigger(cal);
  return cal?.issur ? { trigger: 'state', entity_id: [cal.issur], from: 'on', to: 'off', id: END_ID['חג'] } : null;
}

/**
 * The calendar facts that say a mode is over and not about to begin: no issur melacha, not erev, and for Shabbat not a
 * Friday (the mode may switch on at noon, hours before Jewish Calendar's erev or Hebcal's Shabbat). Each fact is
 * `[entity, state]`; `friday` says whether Friday must be excluded too. Null when the house has no calendar to ask.
 */
function outsideFacts(mode, cal) {
  const facts = [];
  if (cal?.issur) {
    facts.push([cal.issur, 'off']);
    if (cal.erev) facts.push([cal.erev, 'off']);
  } else if (mode === 'שבת' && cal?.motzei) facts.push([cal.motzei, 'on']);
  else if (mode === 'שבת' && cal?.hebcal?.isShabbat) facts.push([cal.hebcal.isShabbat, 'False']);
  if (!facts.length) return null;
  return { facts, friday: mode === 'שבת' };
}

/** The same check as a template, for the automatic automation's catch-up after a restart. */
function outsideTemplate(mode, cal) {
  const o = outsideFacts(mode, cal);
  if (!o) return null;
  const parts = o.facts.map(([id, st]) => `is_state('${id}', '${st}')`);
  if (o.friday) parts.push('now().weekday() != 4');
  return `{{ ${parts.join(' and ')} }}`;
}

/**
 * Whether a mode should be off right now by the calendar: true (outside it), false (in it, or about to begin), or null
 * when the house has no calendar or its sensors are not readable (e.g. right after a restart).
 */
export function modeOutsideNow(mode, states, now = new Date()) {
  const o = outsideFacts(mode, findCalendar(states));
  if (!o || o.facts.some(([id]) => !usable(states?.[id]))) return null;
  return o.facts.every(([id, st]) => states[id].state === st) && !(o.friday && now.getDay() === 5);
}

/** Home Assistant's own "add an integration" page for Jewish Calendar (the path my.home-assistant.io redirects to). */
export const ADD_JEWISH_CALENDAR = '/_my_redirect/config_flow_start?domain=jewish_calendar';

/** Whether this house can run the automatic mode at all. */
export function autoAvailable(mode, cal) {
  if (mode === 'שבת') return !!autoShabbatEndTrigger(cal);
  return !!(cal?.issur && cal?.erev && cal?.candleLighting && cal?.havdalah);
}

const pad2 = (n) => String(n).padStart(2, '0');

/** The trigger that switches a mode on; null when the start needs a sensor this house lacks. */
export function autoStartTrigger(mode, start, cal) {
  const id = START_ID[mode];
  if (start?.hoursBefore != null) {
    const sensor = mode === 'שבת' ? cal?.shabbatCandleLighting || cal?.candleLighting : cal?.candleLighting;
    if (!sensor) return null;
    const minutes = Math.round(Number(start.hoursBefore) * 60);
    return { trigger: 'time', at: { entity_id: sensor, offset: `-${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}:00` }, id };
  }
  const at = parseTimeInput(start?.at ?? DEFAULT_AUTO_START.at);
  return { trigger: 'time', at: `${hm(at ?? 720)}:00`, id };
}

/** Reads the start back from an automatic-mode config: `{at}` or `{hoursBefore}`; null when it has another shape. */
export function parseAutoStart(config) {
  const tr = (config?.triggers || []).find((x) => Object.values(START_ID).includes(x?.id));
  if (!tr) return null;
  if (typeof tr.at === 'string') return { at: tr.at.slice(0, 5) };
  const off = String(tr.at?.offset ?? '').match(/^-(\d{1,2}):(\d{2})(?::\d{2})?$/);
  return off ? { hoursBefore: Number(off[1]) + Number(off[2]) / 60 } : null;
}

/** "at 12:00" / "3 hours before candle lighting", as the description and the card say it. */
export function startText(start, lang = 'en') {
  if (start?.hoursBefore != null) {
    const n = Number(start.hoursBefore);
    return lang === 'he' ? (n === 1 ? 'שעה לפני הדלקת הנרות' : `${n} שעות לפני הדלקת הנרות`) : `${n} hour${n === 1 ? '' : 's'} before candle lighting`;
  }
  return lang === 'he' ? `ב-${start?.at ?? DEFAULT_AUTO_START.at}` : `at ${start?.at ?? DEFAULT_AUTO_START.at}`;
}

/** On a Friday, only when Shabbat is joined by a chag; any other erev (Jewish Calendar's sensor) is erev chag. */
function erevChagTemplate(cal) {
  return `{% set cl = as_datetime(states('${cal.candleLighting}'), none) %}{% set hv = as_datetime(states('${cal.havdalah}'), none) %}` +
    `{{ is_state('${cal.erev}', 'on') and (now().weekday() != 4 or (cl is not none and hv is not none and (hv - cl).total_seconds() > ${LONG_REST_SECONDS})) }}`;
}

function autoDescription(mode, start, endTrigger) {
  const source = String(endTrigger.entity_id[0]).includes('hebcal') ? 'Hebcal' : 'Jewish Calendar';
  return mode === 'שבת'
    ? `${BEIT_MARKER} — מדליק את כל האוטומציות עם התווית "שבת" בשישי ${startText(start, 'he')} (לפני התזמונים של אחר הצהריים), ` +
      `ומכבה אותן ביציאת השבת לפי ${source}, אחרי שכל תזמוני השבת הסתיימו.`
    : `${BEIT_MARKER} — מדליק את כל האוטומציות עם התווית "חג" בערב חג ${startText(start, 'he')}, ` +
      `ומכבה אותן בצאת החג לפי Jewish Calendar, אחרי שכל תזמוני החג הסתיימו. חג שחל בשבת מכוסה במצב שבת.`;
}

export const CATCH_UP_ID = 'ha_start';

/**
 * The one automatic automation of a mode (contract §3). `catchUp: false` builds it as the card wrote it before 2.0.2,
 * without the restart catch-up (to recognise one that can be upgraded).
 */
export function buildAutoModeAutomation({ id, mode, labelId, start = DEFAULT_AUTO_START, cal, startTrigger, endTrigger, catchUp = true }) {
  const on = startTrigger ?? autoStartTrigger(mode, start, cal);
  const off = endTrigger ?? autoEndTrigger(mode, cal);
  const target = { label_id: labelId };
  const onConditions = mode === 'שבת'
    ? [{ condition: 'time', weekday: ['fri'] }]
    : [{ condition: 'template', value_template: erevChagTemplate(cal) }];
  const waitForSchedules = {
    wait_template: `{{ label_entities('${labelId}') | select('match', 'schedule\\\\.') | select('is_state', 'on') | list | count == 0 }}`,
    timeout: '06:00:00',
    continue_on_timeout: true,
  };
  const turnOff = { action: 'automation.turn_off', target, data: { stop_actions: false } };
  // A restart drops a run waiting for the schedules to end, and an end that came while HA was down never fires: on
  // start, once the calendar can be read, a mode that is over is switched off the same way.
  const outside = catchUp ? outsideTemplate(mode, cal) : null;
  const facts = outside ? outsideFacts(mode, cal).facts.map(([e]) => e) : [];
  const catchUpBranch = outside && {
    conditions: [{ condition: 'trigger', id: CATCH_UP_ID }],
    sequence: [
      {
        wait_template: `{{ ${facts.map((e) => `states('${e}') not in ['unknown', 'unavailable']`).join(' and ')} }}`,
        timeout: '00:10:00',
        continue_on_timeout: false,
      },
      { condition: 'template', value_template: outside },
      waitForSchedules,
      turnOff,
    ],
  };
  return {
    id,
    alias: AUTO_ALIAS[mode],
    description: autoDescription(mode, start, off),
    triggers: [on, off, ...(catchUpBranch ? [{ trigger: 'homeassistant', event: 'start', id: CATCH_UP_ID }] : [])],
    conditions: [],
    actions: [
      {
        choose: [
          {
            conditions: [{ condition: 'trigger', id: on.id }, ...onConditions],
            sequence: [{ action: 'automation.turn_on', target }],
          },
          {
            conditions: [{ condition: 'trigger', id: off.id }],
            sequence: [waitForSchedules, turnOff],
          },
          ...(catchUpBranch ? [catchUpBranch] : []),
        ],
      },
    ],
    mode: 'single',
  };
}

/** The automatic-Shabbat automation with the default start (kept for callers of 1.0). */
export function buildAutoShabbatAutomation({ id, labelId, shabbatEndTrigger, start = DEFAULT_AUTO_START, cal = {} }) {
  return buildAutoModeAutomation({ id, mode: 'שבת', labelId, start, cal, endTrigger: shabbatEndTrigger, startTrigger: autoStartTrigger('שבת', start, cal) });
}

// ---------------------------------------------------------------------------- time

const MINUTES_PER_WEEK = 7 * 1440;

/**
 * Whether a week is "on" at `now` (local time) and when it next changes, the way HA computes a schedule's state
 * and `next_event`. Adjacent ranges (Friday until 24:00, Saturday from 00:00) are one range.
 */
export function weekStatus(week, now = new Date()) {
  const ranges = [];
  DAYS.forEach((d, i) => {
    for (const b of week.days[d]) ranges.push([i * 1440 + b.start, i * 1440 + b.end]);
  });
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const r of ranges) {
    const last = merged.at(-1);
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }
  if (!merged.length) return { on: false, next: null };
  if (merged.length === 1 && merged[0][0] === 0 && merged[0][1] === MINUTES_PER_WEEK) return { on: true, next: null };
  // A range that runs to the end of Saturday continues into Sunday's first one.
  if (merged.length > 1 && merged.at(-1)[1] === MINUTES_PER_WEEK && merged[0][0] === 0) {
    const tail = merged.pop();
    merged[0] = [tail[0], merged[0][1] + MINUTES_PER_WEEK];
  }
  const t = now.getDay() * 1440 + now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const inside = (r, x) => x >= r[0] && x < r[1];
  const on = merged.find((r) => inside(r, t) || inside(r, t + MINUTES_PER_WEEK));
  let delta;
  if (on) {
    delta = (inside(on, t) ? on[1] - t : on[1] - (t + MINUTES_PER_WEEK));
  } else {
    delta = Math.min(...merged.map((r) => ((r[0] - t) % MINUTES_PER_WEEK + MINUTES_PER_WEEK) % MINUTES_PER_WEEK));
  }
  const next = new Date(now);
  next.setSeconds(0, 0);
  next.setMinutes(next.getMinutes() + Math.round(delta + now.getSeconds() / 60)); // local-time arithmetic: DST-safe
  return { on: !!on, next };
}

// ---------------------------------------------------------------------------- Home Assistant operations
//
// Every function takes `hass`: anything with callWS, callApi, callService and a *live* `states` (the card passes an
// adapter that always reads its latest hass). The order of calls follows the Beit app's home_store.dart.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** HA's own error text: WebSocket errors carry `message`, REST ones (hass.callApi) `body.message` or `error`. */
export const errorText = (err) =>
  err?.body?.message || err?.message || (typeof err?.error === 'string' && err.error) || (typeof err === 'string' ? err : JSON.stringify(err));

/** Waits for an entity to appear in the live state, matched by `test`. */
export async function waitForEntity(hass, test, { tries = 40, every = 150 } = {}) {
  for (let i = 0; i < tries; i++) {
    const hit = Object.values(hass.states || {}).find(test);
    if (hit) return hit;
    await sleep(every);
  }
  throw new Error('Home Assistant did not report the new entity');
}

/**
 * The helper id behind each schedule entity: its registry unique_id. Usually `schedule.<id>`, but the user may have
 * renamed the entity. `{entity_id: schedule_id}`.
 */
export async function scheduleIdsOf(hass, entityIds) {
  const pairs = await Promise.all(entityIds.map(async (id) => {
    const e = await hass.callWS({ type: 'config/entity_registry/get', entity_id: id }).catch(() => null);
    return [id, e?.platform === 'schedule' && e.unique_id ? String(e.unique_id) : null];
  }));
  return Object.fromEntries(pairs.filter(([, u]) => u));
}

/** The entity HA made for a new schedule helper: `schedule.<id>`, or `schedule.<id>_2` when that id is taken. */
async function scheduleEntityFor(hass, scheduleId, { tries = 40, every = 150 } = {}) {
  const re = new RegExp(`^schedule\\.${scheduleId}(_\\d+)?$`);
  for (let i = 0; i < tries; i++) {
    const candidates = Object.keys(hass.states || {}).filter((id) => re.test(id));
    if (candidates.length) {
      const ids = await scheduleIdsOf(hass, candidates);
      const hit = candidates.find((c) => ids[c] === scheduleId);
      if (hit) return hit;
    }
    await sleep(every);
  }
  throw new Error('Home Assistant did not report the new schedule');
}

/** `{id: WeekSchedule}` for every UI-managed schedule. */
export async function listSchedules(hass) {
  const list = await hass.callWS({ type: 'schedule/list' });
  return Object.fromEntries(list.map((s) => [s.id, WeekSchedule.fromHA(s)]));
}

/**
 * The weeks of any schedule entities, UI or YAML, through the schedule.get_schedule action. Unlike schedule/list it
 * is open to every user. `{entity_id: WeekSchedule}`.
 */
export async function readSchedules(hass, entityIds) {
  if (!entityIds.length) return {};
  const res = await hass.callService('schedule', 'get_schedule', {}, { entity_id: entityIds }, false, true);
  const weeks = res?.response ?? {};
  return Object.fromEntries(Object.entries(weeks).map(([id, days]) => [id, WeekSchedule.fromHA({ ...days, name: '' })]));
}

export const updateSchedule = (hass, id, week) => hass.callWS({ type: 'schedule/update', schedule_id: id, ...week.toHA() });

export async function automationsFor(hass, entityId) {
  const r = await hass.callWS({ type: 'search/related', item_type: 'entity', item_id: entityId });
  return r?.automation || [];
}

export async function automationConfig(hass, automationEntityId) {
  const r = await hass.callWS({ type: 'automation/config', entity_id: automationEntityId });
  return r?.config ?? null;
}

/**
 * Creates the schedule helper and the automation that drives `target` from it; if the automation cannot be written,
 * the helper is deleted again. Returns the new schedule's entity id.
 */
export async function createScheduleWithAutomation(hass, week, target, { labelName = null, waitOptions } = {}) {
  const created = await hass.callWS({ type: 'schedule/create', ...week.toHA() });
  let scheduleEntityId;
  try {
    scheduleEntityId = await scheduleEntityFor(hass, created.id, waitOptions);
  } catch (err) {
    await hass.callWS({ type: 'schedule/delete', schedule_id: created.id });
    throw err;
  }
  try {
    await addScheduleAutomation(hass, scheduleEntityId, week.name, target, { labelName, waitOptions });
  } catch (err) {
    // Half a schedule (a helper that drives nothing) is worse than none.
    if (!err?.posted) await hass.callWS({ type: 'schedule/delete', schedule_id: created.id });
    // The schedule and its automation exist: saving again would make a second pair.
    else throw Object.assign(err, { created: scheduleEntityId });
    throw err;
  }
  return scheduleEntityId;
}

/**
 * Writes the automation that makes an existing schedule switch a device (contract §2), and puts it in the schedule's
 * mode. Used for a new schedule, and for one that nothing uses yet. An error after the POST carries `posted: true`:
 * the automation exists then, and writing it again would make a second one.
 */
export async function addScheduleAutomation(hass, scheduleEntityId, scheduleName, target, { labelName = null, waitOptions } = {}) {
  const automationId = String(Date.now());
  await hass.callApi(
    'POST',
    `config/automation/config/${automationId}`,
    buildScheduleAutomation({ id: automationId, scheduleEntityId, scheduleName: scheduleName.trim(), target }),
  );
  if (!labelName) return;
  try {
    const automation = await waitForEntity(
      hass,
      (e) => e.entity_id.startsWith('automation.') && String(e.attributes?.id) === automationId,
      waitOptions,
    );
    await setModeMembership(hass, labelName, [scheduleEntityId, automation.entity_id], true);
    await alignWithMode(hass, labelName, [automation.entity_id]);
  } catch (err) {
    throw Object.assign(err instanceof Error ? err : new Error(errorText(err)), { posted: true });
  }
}

/**
 * Deletes a schedule and the automations driving it that carry the marker. Automations written by hand are left alone;
 * their names are returned.
 */
export async function deleteSchedule(hass, scheduleEntityId, scheduleId = scheduleEntityId.slice('schedule.'.length)) {
  const kept = [];
  for (const a of await automationsFor(hass, scheduleEntityId)) {
    const cfg = await automationConfig(hass, a);
    if (isOurs(cfg) && cfg?.id != null) await hass.callApi('DELETE', `config/automation/config/${cfg.id}`);
    else kept.push(hass.states?.[a]?.attributes?.friendly_name || a);
  }
  await hass.callWS({ type: 'schedule/delete', schedule_id: scheduleId });
  return kept;
}

/**
 * Rewrites the automation the card wrote for a schedule, under the same id, to drive `target` (and carry the schedule's
 * current name). Only for a config parseScheduleAutomation understands. Returns false when nothing would change.
 */
export async function rewriteScheduleAutomation(hass, config, { scheduleName, target }) {
  const parsed = parseScheduleAutomation(config);
  if (!parsed) throw new Error('This automation was edited by hand; change it in Home Assistant');
  const next = buildScheduleAutomation({
    id: config.id,
    scheduleEntityId: parsed.scheduleEntityId,
    scheduleName: (scheduleName ?? parsed.scheduleName).trim(),
    target: target ?? parsed.target,
  });
  if (sameConfig(next, config)) return false;
  await hass.callApi('POST', `config/automation/config/${config.id}`, next);
  return true;
}

/**
 * After a schedule is renamed: the automations the card wrote for it follow, but only those still named
 * `Beit · <old name>`; an alias the user changed stays. Returns the entity ids that were renamed.
 */
export async function renameScheduleAutomations(hass, automationEntityIds, oldName, newName) {
  const renamed = [];
  if (oldName.trim() === newName.trim()) return renamed;
  for (const id of automationEntityIds) {
    const cfg = await automationConfig(hass, id);
    if (!isOurs(cfg) || cfg.alias !== scheduleAlias(oldName.trim()) || cfg.id == null) continue;
    await hass.callApi('POST', `config/automation/config/${cfg.id}`, { ...cfg, alias: scheduleAlias(newName.trim()) });
    renamed.push(id);
  }
  return renamed;
}

export const setAutomationEnabled = (hass, automationEntityId, enabled) =>
  hass.callService('automation', enabled ? 'turn_on' : 'turn_off', {}, { entity_id: automationEntityId });

// ---- modes: an HA label names the automations (and schedules) of a mode ----

/** Labels and each entity's labels, read fresh from HA: `{labels, entityLabels: {entity_id: [label_id]}}`. */
export async function loadRegistry(hass) {
  const [labels, display] = await Promise.all([
    hass.callWS({ type: 'config/label_registry/list' }),
    hass.callWS({ type: 'config/entity_registry/list_for_display' }),
  ]);
  return { labels, entityLabels: Object.fromEntries(display.entities.map((e) => [e.ei, e.lb || []])), display };
}

export const labelNamed = (registry, name) => registry?.labels?.find((l) => l.name === name) || null;

export async function ensureLabel(hass, name) {
  const labels = await hass.callWS({ type: 'config/label_registry/list' });
  const existing = labels.find((l) => l.name === name);
  if (existing) return existing;
  const style = MODE_LABEL_STYLE[name] || {};
  return hass.callWS({ type: 'config/label_registry/create', name, ...style });
}

/**
 * Adds the mode's label to (or removes it from) each entity. `config/entity_registry/update` replaces the whole
 * list, so the entity's other labels are merged back in.
 */
export async function setModeMembership(hass, labelName, entityIds, member) {
  const label = member
    ? await ensureLabel(hass, labelName)
    : (await hass.callWS({ type: 'config/label_registry/list' })).find((l) => l.name === labelName);
  if (!label) return null; // nothing to take away
  for (const id of entityIds) {
    // The entity's own entry: list_for_display leaves out disabled entities, and a replaced list would lose labels.
    const entry = await hass.callWS({ type: 'config/entity_registry/get', entity_id: id }).catch(() => null);
    if (!entry) continue;
    const current = entry.labels || [];
    const next = member ? [...new Set([...current, label.label_id])] : current.filter((l) => l !== label.label_id);
    if (next.length === current.length && next.every((l) => current.includes(l))) continue;
    await hass.callWS({ type: 'config/entity_registry/update', entity_id: id, labels: next });
  }
  return label;
}

/**
 * Puts an automation into a mode, or takes it out, together with the schedules its config refers to. Taking it out
 * leaves a schedule in the mode while another automation of the mode still follows it.
 */
export async function setAutomationInMode(hass, labelName, automationId, member) {
  const schedules = schedulesIn(await automationConfig(hass, automationId), hass.states);
  if (member) return setModeMembership(hass, labelName, [automationId, ...schedules], true);
  const registry = await loadRegistry(hass);
  const stillUsed = new Set();
  for (const other of modeMembers(hass.states, registry, labelName)) {
    if (other.entity_id === automationId) continue;
    for (const id of schedulesIn(await automationConfig(hass, other.entity_id).catch(() => null), hass.states)) stillUsed.add(id);
  }
  return setModeMembership(hass, labelName, [automationId, ...schedules.filter((id) => !stillUsed.has(id))], false);
}

/** The entities of a mode, by name, sorted by their display name. */
export function modeMembers(states, registry, labelName, domain = 'automation') {
  const label = labelNamed(registry, labelName);
  if (!label) return [];
  return Object.values(states || {})
    .filter((e) => e.entity_id.startsWith(`${domain}.`) && (registry.entityLabels[e.entity_id] || []).includes(label.label_id))
    .sort((a, b) => entityName(a).localeCompare(entityName(b), 'he'));
}

/**
 * After automations join a mode (or leave all modes, `labelName` null): they follow the mode's current state, so
 * joining a mode that is off switches them off; leaving means they run every week again, so they are switched on.
 * The first to join an empty mode follows the calendar: off when it is not Shabbat (or chag) and not about to be,
 * since nothing else would switch it off before the mode ends next. Without a readable calendar it is left as it is.
 */
export async function alignWithMode(hass, labelName, automationIds) {
  if (!automationIds.length) return;
  let on = true;
  if (labelName) {
    const registry = await loadRegistry(hass);
    const others = modeMembers(hass.states, registry, labelName)
      .filter((m) => !automationIds.includes(m.entity_id) && !isAutoAlias(m.attributes?.friendly_name));
    const state = modeState(others);
    if (state === 'partial') return; // nothing clear to follow
    if (state === 'empty') {
      const outside = modeOutsideNow(labelName, hass.states);
      if (outside === null) return;
      on = !outside;
    } else on = state === 'on';
  }
  const change = automationIds.filter((id) => (hass.states?.[id]?.state === 'on') !== on);
  if (change.length) await hass.callService('automation', on ? 'turn_on' : 'turn_off', {}, { entity_id: change });
}

/** Whether a home uses Shabbat or chag at all: a label named for either exists. */
export const hasModeLabels = (labels) => (labels || []).some((l) => MODES.includes(l?.name));

/** Switches every automation of a mode on or off in one call. */
export async function setModeEnabled(hass, registry, labelName, enabled) {
  const members = modeMembers(hass.states, registry, labelName).filter((m) => !isAutoAlias(m.attributes?.friendly_name));
  if (!members.length) return;
  await hass.callService('automation', enabled ? 'turn_on' : 'turn_off', {}, { entity_id: members.map((m) => m.entity_id) });
}

// ---- automatic modes ----

/**
 * The existing automatic automation of a mode, if any: `{entityId, config, ours}`. Recognised by its alias; one that
 * carries the marker is preferred.
 */
export async function findAuto(hass, mode) {
  const byAlias = Object.values(hass.states || {})
    .filter((e) => e.entity_id.startsWith('automation.') && e.attributes?.friendly_name === AUTO_ALIAS[mode])
    .map((e) => e.entity_id);
  // Renamed in HA, it is still the automation that targets the mode's label: search finds those.
  let byLabel = [];
  try {
    const label = (await hass.callWS({ type: 'config/label_registry/list' })).find((l) => l.name === mode);
    if (label) byLabel = (await hass.callWS({ type: 'search/related', item_type: 'label', item_id: label.label_id }))?.automation || [];
  } catch {
    /* alias only */
  }
  let fallback = null;
  for (const id of [...new Set([...byAlias, ...byLabel])]) {
    const config = await automationConfig(hass, id).catch(() => null);
    const ours = isOurs(config);
    const isAuto = (config?.triggers || []).some((t) => t?.id === START_ID[mode]);
    if (ours && isAuto) return { entityId: id, config, ours };
    if (byAlias.includes(id)) fallback ??= { entityId: id, config, ours };
  }
  return fallback;
}

/** Turns an automatic mode on: switches an existing one on, or creates the one automation. Never a second one. */
export async function enableAuto(hass, mode, { start = DEFAULT_AUTO_START, waitOptions } = {}) {
  const existing = await findAuto(hass, mode);
  if (existing) {
    if (hass.states?.[existing.entityId]?.state !== 'on') await setAutomationEnabled(hass, existing.entityId, true);
    return existing.entityId;
  }
  const cal = findCalendar(hass.states);
  const t = STRINGS[langOf(hass)];
  if (!autoAvailable(mode, cal)) throw new Error(mode === 'שבת' ? t.errNoCalendar : t.errNoJewishCalendar);
  if (!autoStartTrigger(mode, start, cal)) throw new Error(t.errNoCandleSensor);
  const label = await ensureLabel(hass, mode);
  const id = String(Date.now());
  await hass.callApi('POST', `config/automation/config/${id}`, buildAutoModeAutomation({ id, mode, labelId: label.label_id, start, cal }));
  const entity = await waitForEntity(hass, (e) => e.entity_id.startsWith('automation.') && String(e.attributes?.id) === id, waitOptions);
  return entity.entity_id;
}

/**
 * Turns an automatic mode off by disabling its automation. It is never deleted: whatever the user changed in it
 * survives, and switching on again enables the same one.
 */
export async function disableAuto(hass, mode) {
  const existing = await findAuto(hass, mode);
  if (!existing) return null;
  await setAutomationEnabled(hass, existing.entityId, false);
  return 'turned_off';
}

/**
 * Changes when an automatic mode switches on. Only its start trigger is replaced (and the description, if it is still
 * the one the card wrote); everything else in the automation stays as it is. Only for one carrying the marker.
 */
export async function setAutoStart(hass, mode, start) {
  const existing = await findAuto(hass, mode);
  const t = STRINGS[langOf(hass)];
  if (!existing?.ours || existing.config?.id == null) throw new Error(t.autoShabbatNotOurs);
  const cfg = existing.config;
  const trigger = autoStartTrigger(mode, start, findCalendar(hass.states));
  if (!trigger) throw new Error(t.errNoCandleSensor);
  const index = (cfg.triggers || []).findIndex((x) => x?.id === START_ID[mode]);
  if (index < 0) throw new Error(t.autoShabbatNotOurs);
  const old = parseAutoStart(cfg);
  const end = cfg.triggers.find((x) => x?.id === END_ID[mode]);
  const next = { ...cfg, triggers: cfg.triggers.map((x, i) => (i === index ? trigger : x)) };
  if (end && old && cfg.description === autoDescription(mode, old, end)) next.description = autoDescription(mode, start, end);
  if (sameConfig(next, cfg)) return false;
  await hass.callApi('POST', `config/automation/config/${cfg.id}`, next);
  return true;
}

/**
 * Adds the restart catch-up to an automatic automation written before 2.0.2. Only when it carries the marker and is
 * still exactly what the card wrote then (start and end as they are now): one changed by hand is left alone.
 * True when it was rewritten.
 */
export async function upgradeAuto(hass, mode, existing) {
  const cfg = existing?.config;
  if (!existing?.ours || cfg?.id == null || (cfg.triggers || []).some((x) => x?.id === CATCH_UP_ID)) return false;
  const startTrigger = (cfg.triggers || []).find((x) => x?.id === START_ID[mode]);
  const endTrigger = (cfg.triggers || []).find((x) => x?.id === END_ID[mode]);
  const labelId = cfg.actions?.[0]?.choose?.[0]?.sequence?.[0]?.target?.label_id;
  const start = parseAutoStart(cfg);
  if (!startTrigger || !endTrigger || !labelId || !start) return false;
  const cal = findCalendar(hass.states);
  const args = { id: cfg.id, mode, labelId, start, cal, startTrigger, endTrigger };
  if (!sameConfig(buildAutoModeAutomation({ ...args, catchUp: false }), cfg)) return false;
  const next = buildAutoModeAutomation(args);
  if (!(next.triggers || []).some((x) => x?.id === CATCH_UP_ID)) return false; // no calendar to check against
  await hass.callApi('POST', `config/automation/config/${cfg.id}`, next);
  return true;
}

export const findAutoShabbat = (hass) => findAuto(hass, 'שבת');
export const enableAutoShabbat = (hass, options) => enableAuto(hass, 'שבת', options);
export const disableAutoShabbat = (hass) => disableAuto(hass, 'שבת');

// ---- the Schedule Helper dashboard ----

/** The dashboard the card can create: a new one in the sidebar, with both cards. Never an existing one changed. */
export const DASHBOARD = { url_path: 'schedule-helper', view: 'schedules', title: 'Schedule Helper', icon: 'mdi:calendar-clock' };
// Where the dashboard lived before the card was renamed (1.2.x): found too, so it is never made twice.
const LEGACY_DASHBOARD_PATHS = ['beit-schedules'];

export function dashboardConfig() {
  return {
    title: DASHBOARD.title,
    views: [{ title: DASHBOARD.title, path: DASHBOARD.view, cards: [{ type: 'custom:schedule-helper-card', show_modes: true }, { type: 'custom:schedule-helper-shabbat-card' }] }],
  };
}

export async function findDashboard(hass) {
  const list = await hass.callWS({ type: 'lovelace/dashboards/list' });
  return list.find((d) => d.url_path === DASHBOARD.url_path)
    || list.find((d) => LEGACY_DASHBOARD_PATHS.includes(d.url_path)) || null;
}

/**
 * Creates the Schedule Helper dashboard. If one is already at that address it is left as it is (`created: false`). If its
 * content cannot be saved, the empty dashboard just created is removed again.
 */
export async function createDashboard(hass) {
  const existing = await findDashboard(hass);
  if (existing) return { ...existing, created: false };
  const created = await hass.callWS({
    type: 'lovelace/dashboards/create',
    url_path: DASHBOARD.url_path,
    title: DASHBOARD.title,
    icon: DASHBOARD.icon,
    show_in_sidebar: true,
    require_admin: false,
    mode: 'storage',
  });
  try {
    await hass.callWS({ type: 'lovelace/config/save', url_path: DASHBOARD.url_path, config: dashboardConfig() });
  } catch (err) {
    await hass.callWS({ type: 'lovelace/dashboards/delete', dashboard_id: created.id }).catch(() => {});
    throw err;
  }
  return { ...created, created: true };
}

export const entityName = (st) => st?.attributes?.friendly_name || st?.entity_id || '';

// ---------------------------------------------------------------------------- device picker

/** Domains a schedule can drive, in the order the picker lists them (the app's tile domains, minus scene/script/lock). */
// Not vacuum: the contract's <domain>.turn_on / turn_off are not services of a vacuum (it has start / return_to_base).
export const PICKABLE_DOMAINS = ['light', 'switch', 'fan', 'cover', 'climate', 'water_heater', 'media_player', 'input_boolean', 'siren', 'valve'];

/**
 * The picker's sections: devices grouped by area (the entity's own area, else its device's), areas by name, then the
 * ones with no area. Hidden and auxiliary (config/diagnostic) entities are left out, as the app does.
 * `display` is `config/entity_registry/list_for_display`.
 */
export function deviceSections({ states, display, devices = [], areas = [], domains = null, only = null }, query = '', noAreaTitle = 'No room', lang = 'en') {
  const meta = Object.fromEntries((display?.entities || []).map((e) => [e.ei, e]));
  const deviceArea = Object.fromEntries(devices.map((d) => [d.id, d.area_id]));
  const q = query.trim().toLowerCase();
  const byArea = new Map();
  for (const e of Object.values(states || {})) {
    const domain = domainOf(e.entity_id);
    if (!PICKABLE_DOMAINS.includes(domain)) continue;
    if (domains?.length && !domains.includes(domain)) continue; // the card's device_domains
    if (only && domain !== only) continue; // the picker's type chip
    const m = meta[e.entity_id];
    if (m && (m.hb || m.ec !== undefined && m.ec !== null)) continue;
    const areaId = m?.ai ?? (m?.di ? deviceArea[m.di] : null) ?? null;
    if (!byArea.has(areaId)) byArea.set(areaId, []);
    byArea.get(areaId).push(e);
  }
  const order = (e) => PICKABLE_DOMAINS.indexOf(domainOf(e.entity_id));
  const sorted = [...areas].sort((a, b) => a.name.localeCompare(b.name, lang));
  const sections = [
    ...sorted.map((a) => ({ areaId: a.area_id, title: a.name })),
    { areaId: null, title: noAreaTitle },
  ];
  return sections
    .map((sec) => ({
      ...sec,
      entities: (byArea.get(sec.areaId) || [])
        .filter((e) => !q || entityName(e).toLowerCase().includes(q) || sec.title.toLowerCase().includes(q) || e.entity_id.includes(q))
        .sort((a, b) => order(a) - order(b) || entityName(a).localeCompare(entityName(b), lang)),
    }))
    .filter((sec) => sec.entities.length);
}

const VERBS = {
  he: { on: 'נדלק', open: 'נפתח', close: 'נסגר', off: 'נכבה', pause: 'מושהה', stays: 'נשאר כמו שהוא', play: 'מופעל' },
  en: { on: 'turns on', open: 'opens', close: 'closes', off: 'turns off', pause: 'pauses', stays: 'stays as it is', play: 'turns on' },
};

/** "בתחילת הטווח: נדלק (קירור, 24°) · בסופו: נכבה": what a target does, in words. */
export function actionSummary(target, lang = 'en') {
  const t = STRINGS[lang];
  const v = VERBS[lang];
  const domain = domainOf(target.entityId);
  const details = [
    target.hvacMode && domain === 'climate' ? t.hvac[target.hvacMode] || target.hvacMode : null,
    given(target.temperature) ? `${target.temperature}°` : null,
    given(target.brightnessPct) ? `${target.brightnessPct}%` : null,
  ].filter(Boolean);
  const start = (domain === 'cover' || domain === 'valve' ? v.open : domain === 'media_player' ? v.play : v.on) +
    (details.length ? ` (${details.join(', ')})` : '');
  const end = target.turnOffAtEnd === false ? v.stays
    : domain === 'cover' || domain === 'valve' ? v.close : domain === 'media_player' ? v.pause : v.off;
  return `${t.atStart}: ${start} · ${t.atEnd}: ${end}`;
}

/** What the editor offers for a device: HVAC modes, a temperature range, brightness. */
export function actionOptions(st) {
  const domain = domainOf(st.entity_id);
  const a = st.attributes || {};
  const hvacModes = domain === 'climate' ? (a.hvac_modes || []).filter((m) => m !== 'off') : [];
  const temp = domain === 'climate' || domain === 'water_heater'
    ? {
      min: Number(a.min_temp ?? 16),
      max: Number(a.max_temp ?? 30),
      step: Number(a.target_temp_step) > 0 ? Number(a.target_temp_step) : 1,
      initial: Number(a.temperature ?? Math.round(((a.min_temp ?? 16) + (a.max_temp ?? 30)) / 2)),
    }
    : null;
  const brightness = domain === 'light' && (a.supported_color_modes || []).some((m) => m !== 'onoff');
  return { domain, hvacModes, defaultHvac: hvacModes.includes('cool') ? 'cool' : hvacModes[0] ?? null, temp, brightness };
}

// ---------------------------------------------------------------------------- strings

export const STRINGS = {
  he: {
    errName: 'צריך שם לתזמון',
    errReversed: (day) => `ביום ${day}: שעת הסיום לפני שעת ההתחלה`,
    errOverlap: (day) => `ביום ${day}: יש טווחים חופפים`,
    errNoCalendar: 'לא נמצא לוח שנה עברי (Jewish Calendar או Hebcal) — אין לפי מה לדעת מתי השבת יוצאת',
    errNoJewishCalendar: 'חג אוטומטי צריך את אינטגרציית Jewish Calendar (של Home Assistant) — Hebcal לא אמין לחגים',
    addJewishCalendar: 'הוספת Jewish Calendar ←',
    errNoCandleSensor: 'לזמן יחסי להדלקת נרות צריך את אינטגרציית Jewish Calendar',
    schedules: 'תזמונים',
    newSchedule: 'תזמון חדש',
    onNow: 'פועל עכשיו',
    offNow: 'כבוי',
    starts: 'מתחיל',
    ends: 'נגמר',
    today: 'היום',
    tomorrow: 'מחר',
    onDay: (day) => `ביום ${day}`,
    at: (when, time) => `${when} ב-${time}`,
    yaml: 'מוגדר ב-YAML — לקריאה בלבד',
    noSchedules: 'אין תזמונים להצגה',
    automationOff: 'האוטומציה כבויה',
    noAutomation: 'אין אוטומציה',
    modeIsOff: (m) => `מצב ${m} כבוי`,
    wontRun: 'התזמון לא יפעיל כלום כל עוד אין אוטומציה פעילה שמשתמשת בו',
    wontRunShort: 'לא יפעיל כלום',
    changedElsewhere: 'התזמון השתנה במקום אחר מאז שנפתח כאן. שמירה תחליף את השינוי ההוא.',
    loadTheirs: 'טען את הגרסה החדשה',
    deletedElsewhere: 'התזמון נמחק במקום אחר.',
    loadSchedulesFailed: 'לא הצלחתי לטעון את התזמונים לעריכה.',
    retry: 'נסה שוב',
    loading: 'טוען…',
    readOnly: 'צפייה בלבד — רק מנהל יכול לערוך',
    modeName: { שבת: 'שבת', חג: 'חג' },
    editSchedule: 'עריכת תזמון',
    name: 'שם התזמון',
    type: 'סוג',
    regular: 'רגיל',
    modeHint: (m) => `יופעל ויכובה יחד עם שאר תזמוני ה${m}, מכרטיס "שבת וחג".`,
    device: 'מכשיר',
    chooseDevice: 'בחר מכשיר',
    changeDevice: 'החלף',
    searchDevice: 'חיפוש מכשיר או חדר',
    noArea: 'ללא חדר',
    noDevices: 'לא נמצאו מכשירים',
    whileActive: 'מצב בזמן פעילות',
    whatItDoes: 'מה הוא עושה',
    handEdited: 'האוטומציה של התזמון נערכה ידנית — את המכשיר ואת הפעולה משנים בה, ב-Home Assistant.',
    setTemp: 'לקבוע טמפרטורה',
    brightness: 'בהירות',
    turnOffAtEnd: 'לכבות בסוף הטווח',
    closeAtEnd: 'לסגור בסוף הטווח',
    drives: 'מפעיל את',
    autoOn: 'אוטומציה פעילה',
    autoOff: 'אוטומציה כבויה',
    drivesNothing: 'אף אוטומציה לא משתמשת בתזמון הזה — הוא לא מפעיל כלום. בחרו מכשיר למטה, והכרטיס ייצור את האוטומציה.',
    addDevice: 'מכשיר להפעלה',
    hours: 'שעות פעילות',
    addRange: 'טווח',
    from: 'מ־',
    to: 'עד',
    midnightHint: 'שעון 24 שעות; סיום 00:00 או 24:00 = עד חצות',
    errTime: 'שעה לא תקינה — כתבו למשל 7:30 או 2330',
    ok: 'אישור',
    cancel: 'ביטול',
    copyTo: (day) => `להעתיק את יום ${day} אל…`,
    weekdays: 'ימי חול',
    wholeWeek: 'כל השבוע',
    copy: 'העתק',
    copyDays: 'העתק לימים אחרים',
    clearAll: 'נקה הכול',
    save: 'שמור',
    delete: 'מחק',
    close: 'סגור',
    back: 'חזרה',
    deleteQ: 'למחוק את התזמון?',
    deleteText: 'האוטומציה שנוצרה עבורו תימחק גם היא. אוטומציות שנכתבו ידנית יישארו.',
    kept: (list) => `נשארו אוטומציות שמפנות לתזמון שנמחק: ${list}`,
    saveFailed: (e) => `השמירה נכשלה: ${e}`,
    deleteFailed: (e) => `המחיקה נכשלה: ${e}`,
    errEmpty: 'צריך לפחות טווח שעות אחד',
    errDevice: 'בחר מכשיר שהתזמון יפעיל',
    errRange: 'שעת הסיום לפני שעת ההתחלה',
    editRange: 'עריכת טווח',
    removeRange: 'מחיקת טווח',
    hvac: { cool: 'קירור', heat: 'חימום', heat_cool: 'אוטומטי', auto: 'אוטומטי', dry: 'ייבוש', fan_only: 'מאוורר' },
    shabbatAndChag: 'שבת וחג',
    modeTitle: (m) => `מצב ${m}`,
    modeEmpty: 'אין עדיין אוטומציות במצב הזה',
    modeOn: (n) => `פעיל — ${n} אוטומציות`,
    modeOff: 'כבוי',
    modePartial: (on, n) => `פעיל חלקית — ${on} מתוך ${n}`,
    modeSwitch: (m) => `הפעלת מצב ${m}`,
    scheduleList: 'תזמונים',
    chooseAutomations: 'בחירת אוטומציות',
    automationsIn: (m) => `אוטומציות במצב ${m}`,
    searchAutomation: 'חיפוש אוטומציה',
    noAutomations: 'לא נמצאו אוטומציות',
    autoShabbat: 'שבת אוטומטית',
    autoTitle: { שבת: 'שבת אוטומטית', חג: 'חג אוטומטי' },
    autoHint: (mode) => (mode === 'שבת'
      ? 'מדליק את מצב השבת בשישי, לפני התזמונים, ומכבה אחרי צאת השבת כשכל תזמוני השבת הסתיימו.'
      : 'מדליק את מצב החג בערב חג, לפני התזמונים, ומכבה אחרי צאת החג כשכל תזמוני החג הסתיימו. חג שחל בשבת מכוסה במצב שבת.'),
    saved: 'התזמון נשמר',
    createdPartly: (e) => `התזמון והאוטומציה נוצרו, אבל השלב האחרון נכשל: ${e}. פתחו את התזמון כדי לבדוק את הסוג שלו.`,
    created: 'התזמון נוצר',
    namePlaceholder: 'יתמלא משם המכשיר',
    atStart: 'בתחילת הטווח',
    atEnd: 'בסופו',
    startLabel: 'התחלה',
    change: 'שינוי',
    startAtLabel: 'בשעה',
    hoursBeforeLabel: 'שעות לפני הדלקת הנרות',
    errHours: 'מספר שעות בין חצי שעה ל-12',
    autoShabbatNotOurs: 'אוטומציה בשם הזה נכתבה ידנית — הכרטיס רק מדליק ומכבה אותה.',
    calToday: 'היום',
    calParasha: 'פרשה',
    calHoliday: 'חג',
    calCandles: 'הדלקת נרות',
    calHavdalah: 'הבדלה',
    calInEffect: 'שבת / חג עכשיו',
    selfExcluded: 'האוטומציות של שבת וחג אוטומטיים לא יכולות להיות חלק ממצב — הן היו מכבות את עצמן.',
    edGeneral: 'כללי',
    edTitle: 'כותרת',
    edShowAdd: 'כפתור "תזמון חדש"',
    edShowModes: 'הצגת שבת וחג',
    edShowModesHint: 'לכל תזמון יוצג המצב שלו, ואפשר יהיה לבחור אותו בעריכה. כברירת מחדל: מופעל רק אם בבית כבר יש תווית "שבת" או "חג".',
    edDeviceDomains: 'סוגי מכשירים לתזמון',
    edDeviceDomainsHint: 'רק הסוגים המסומנים יופיעו בבחירת מכשיר.',
    allTypes: 'הכול',
    domainName: { light: 'תאורה', switch: 'מתגים ושקעים', fan: 'מאווררים', cover: 'תריסים', climate: 'מזגנים', water_heater: 'דודים',
      media_player: 'נגנים', input_boolean: 'מתגים וירטואליים', vacuum: 'שואבים', siren: 'צופרים', valve: 'ברזים' },
    edModeFilter: 'הצגת תזמונים',
    edAllSchedules: 'כל התזמונים',
    edOnlyMode: (m) => `רק תזמוני ${m}`,
    edSchedules: 'תזמונים בכרטיס',
    edSchedulesHint: 'סמנו את התזמונים שיוצגו.',
    edAll: 'הכול',
    edNone: 'כלום',
    edModes: 'מצבים',
    edShowCalendar: 'הצגת זמני השבת והחג',
    edDashboard: 'דשבורד Schedule Helper בסרגל הצד',
    edDashboardHint: 'יוצר דשבורד חדש בשם Schedule Helper עם שני הכרטיסים. דשבורדים קיימים לא משתנים.',
    edDashboardCreate: 'צור דשבורד Schedule Helper',
    edDashboardExists: 'הדשבורד כבר קיים.',
    edDashboardCreated: 'הדשבורד נוצר ומופיע בסרגל הצד.',
    edDashboardOpen: 'פתח',
    edHeight: 'גובה',
    edHeightHint: 'עד 700px כברירת מחדל — או למשל 500px, 60vh, או auto בלי הגבלה',
  },
  en: {
    errName: 'The schedule needs a name',
    errReversed: (day) => `${day}: a range ends before it starts`,
    errOverlap: (day) => `${day}: ranges overlap`,
    errNoCalendar: 'No Jewish calendar found (Jewish Calendar or Hebcal), so there is no way to tell when Shabbat ends',
    errNoJewishCalendar: "Automatic chag needs Home Assistant's Jewish Calendar integration; Hebcal is not reliable for chagim",
    addJewishCalendar: 'Add Jewish Calendar →',
    errNoCandleSensor: 'A start relative to candle lighting needs the Jewish Calendar integration',
    schedules: 'Schedules',
    newSchedule: 'New schedule',
    onNow: 'On now',
    offNow: 'Off',
    starts: 'starts',
    ends: 'ends',
    today: 'today',
    tomorrow: 'tomorrow',
    onDay: (day) => day,
    at: (when, time) => `${when} at ${time}`,
    yaml: 'Defined in YAML — read only',
    noSchedules: 'No schedules to show',
    automationOff: 'Automation off',
    noAutomation: 'No automation',
    modeIsOff: (m) => `${m} mode off`,
    wontRun: 'This schedule switches nothing while no automation that uses it is on',
    wontRunShort: 'will not run',
    changedElsewhere: 'This schedule was changed elsewhere since you opened it. Saving will replace that change.',
    loadTheirs: 'Load the new version',
    deletedElsewhere: 'This schedule was deleted elsewhere.',
    loadSchedulesFailed: 'Could not load the schedules for editing.',
    retry: 'Try again',
    loading: 'Loading…',
    readOnly: 'View only — only an administrator can edit',
    modeName: { שבת: 'Shabbat', חג: 'Chag' },
    editSchedule: 'Edit schedule',
    name: 'Schedule name',
    type: 'Type',
    regular: 'Regular',
    modeHint: (m) => `Switched on and off together with the other ${m} schedules, from the Shabbat & chag card.`,
    device: 'Device',
    chooseDevice: 'Choose a device',
    changeDevice: 'Change',
    searchDevice: 'Search a device or room',
    noArea: 'No room',
    noDevices: 'No devices found',
    whileActive: 'Mode while active',
    whatItDoes: 'What it does',
    handEdited: "This schedule's automation was edited by hand; change its device and action in Home Assistant.",
    setTemp: 'Set a temperature',
    brightness: 'Brightness',
    turnOffAtEnd: 'Turn off at the end',
    closeAtEnd: 'Close at the end',
    drives: 'Drives',
    autoOn: 'Automation on',
    autoOff: 'Automation off',
    drivesNothing: 'No automation uses this schedule, so it drives nothing. Choose a device below and the card creates the automation.',
    addDevice: 'Device to switch',
    hours: 'Active hours',
    addRange: 'Range',
    from: 'From',
    to: 'To',
    midnightHint: '24-hour clock; an end of 00:00 or 24:00 means until midnight',
    errTime: 'Not a time. Type e.g. 7:30 or 2330',
    ok: 'OK',
    cancel: 'Cancel',
    copyTo: (day) => `Copy ${day} to…`,
    weekdays: 'Weekdays',
    wholeWeek: 'Whole week',
    copy: 'Copy',
    copyDays: 'Copy to other days',
    clearAll: 'Clear all',
    save: 'Save',
    delete: 'Delete',
    close: 'Close',
    back: 'Back',
    deleteQ: 'Delete this schedule?',
    deleteText: 'The automation created for it is deleted too. Automations written by hand stay.',
    kept: (list) => `These automations still refer to the deleted schedule: ${list}`,
    saveFailed: (e) => `Saving failed: ${e}`,
    deleteFailed: (e) => `Deleting failed: ${e}`,
    errEmpty: 'Add at least one range of hours',
    errDevice: 'Choose the device this schedule drives',
    errRange: 'The range ends before it starts',
    editRange: 'Edit range',
    removeRange: 'Remove range',
    hvac: { cool: 'Cool', heat: 'Heat', heat_cool: 'Auto', auto: 'Auto', dry: 'Dry', fan_only: 'Fan' },
    shabbatAndChag: 'Shabbat & chag (Jewish holidays)',
    modeTitle: (m) => (m === 'Chag' ? 'Chag (Jewish holiday) mode' : `${m} mode`),
    modeEmpty: 'No automations in this mode yet',
    modeOn: (n) => `On — ${n} automations`,
    modeOff: 'Off',
    modePartial: (on, n) => `Partly on — ${on} of ${n}`,
    modeSwitch: (m) => `${m} mode`,
    scheduleList: 'Schedules',
    chooseAutomations: 'Choose automations',
    automationsIn: (m) => `Automations in ${m} mode`,
    searchAutomation: 'Search automations',
    noAutomations: 'No automations found',
    autoShabbat: 'Automatic Shabbat',
    autoTitle: { שבת: 'Automatic Shabbat', חג: 'Automatic chag' },
    autoHint: (mode) => (mode === 'שבת'
      ? 'Turns Shabbat mode on on Friday, before its schedules, and off after Shabbat ends once every Shabbat schedule has finished.'
      : 'Turns chag (Jewish holiday) mode on on erev chag, before its schedules, and off after the chag ends once every chag schedule has finished. A chag on Shabbat is covered by Shabbat mode.'),
    saved: 'Schedule saved',
    createdPartly: (e) => `The schedule and its automation were created, but the last step failed: ${e}. Open the schedule to check its type.`,
    created: 'Schedule created',
    namePlaceholder: "Filled in from the device's name",
    atStart: 'When a range starts',
    atEnd: 'when it ends',
    startLabel: 'Starts',
    change: 'Change',
    startAtLabel: 'At',
    hoursBeforeLabel: 'hours before candle lighting',
    errHours: 'A number of hours from 0.5 to 12',
    autoShabbatNotOurs: 'An automation with this name was written by hand; the card only switches it on and off.',
    calToday: 'Today',
    calParasha: 'Parasha',
    calHoliday: 'Holiday',
    calCandles: 'Candle lighting',
    calHavdalah: 'Havdalah',
    calInEffect: 'Shabbat / chag now',
    selfExcluded: 'The automatic Shabbat and chag automations cannot be part of a mode: they would switch themselves off.',
    edGeneral: 'General',
    edTitle: 'Title',
    edShowAdd: '"New schedule" button',
    edShowModes: 'Show Shabbat and chag (Jewish holidays)',
    edShowModesHint: 'The card shows each schedule\'s mode and lets you choose it when editing. By default, on only if your home already has a "שבת" or "חג" label.',
    edDeviceDomains: 'Device types to schedule',
    edDeviceDomainsHint: 'Only the ticked types appear when choosing a device.',
    allTypes: 'All',
    domainName: { light: 'Lights', switch: 'Switches & plugs', fan: 'Fans', cover: 'Covers', climate: 'Air conditioners', water_heater: 'Water heaters',
      media_player: 'Media players', input_boolean: 'Virtual switches', vacuum: 'Vacuums', siren: 'Sirens', valve: 'Valves' },
    edModeFilter: 'Schedules shown',
    edAllSchedules: 'All schedules',
    edOnlyMode: (m) => `Only ${m} schedules`,
    edSchedules: 'Schedules on the card',
    edSchedulesHint: 'Tick the schedules to show.',
    edAll: 'All',
    edNone: 'None',
    edModes: 'Modes',
    edShowCalendar: 'Show Shabbat and Jewish holiday times',
    edDashboard: 'A Schedule Helper dashboard in the sidebar',
    edDashboardHint: 'Creates a new dashboard named Schedule Helper with both cards. Existing dashboards are not changed.',
    edDashboardCreate: 'Create the Schedule Helper dashboard',
    edDashboardExists: 'The dashboard already exists.',
    edDashboardCreated: 'The dashboard was created; it is in the sidebar.',
    edDashboardOpen: 'Open',
    edHeight: 'Height',
    edHeightHint: 'Up to 700px by default — or e.g. 500px, 60vh, or auto for no limit',
  },
};

/** The most a card grows when no `height` is set; beyond it the content scrolls inside the card. */
export const DEFAULT_MAX_HEIGHT = '700px';

/** A config height ("500px", "60vh", or a bare number of pixels) as CSS; null when unset or "auto". */
export function cssHeight(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const v = String(value).trim();
  if (v.toLowerCase() === 'auto') return null;
  return /^\d+(\.\d+)?$/.test(v) ? `${v}px` : v;
}

/** The user's language in HA's profile: Hebrew ('he', or the old 'iw') gets Hebrew; anything else, or none, English. */
export const langOf = (hass) => (/^(he|iw)\b/.test(String(hass?.locale?.language || hass?.language || 'en')) ? 'he' : 'en');

/** "היום ב-16:00" / "tomorrow at 16:00" / "ביום שישי ב-16:00". */
export function formatWhen(date, now = new Date(), lang = 'en') {
  const t = STRINGS[lang];
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((midnight(date) - midnight(now)) / 86400000);
  const when = days === 0 ? t.today : days === 1 ? t.tomorrow : t.onDay(DAY_NAMES[lang][date.getDay()]);
  return t.at(when, time);
}

// ---------------------------------------------------------------------------- UI helpers

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Material Design Icons paths (Apache 2.0), inlined: HA's own icon elements are not ours to depend on.
const ICONS = {
  plus: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z',
  close: 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
  delete: 'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z',
  copy: 'M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z',
  clock: 'M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z',
  minus: 'M19,13H5V11H19V13Z',
  back: 'M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z',
};
const icon = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;

const BASE_STYLE = `
  :host { display: block; }
  ha-card { overflow: hidden; }
  * { box-sizing: border-box; }
  .ic { width: 20px; height: 20px; fill: currentColor; flex: none; }
  [dir=rtl] .ic.flip { transform: scaleX(-1); }
  button { font: inherit; color: inherit; }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 18px; cursor: pointer;
    border: 1px solid var(--divider-color); background: transparent; color: var(--primary-color); font-size: 14px; font-weight: 500; }
  .btn.primary { background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: var(--primary-color); }
  .btn.danger { color: var(--error-color, #db4437); }
  .btn:disabled { opacity: .5; cursor: default; }
  .icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%;
    border: 0; background: transparent; cursor: pointer; color: var(--secondary-text-color); flex: none; }
  .icon-btn:hover, .btn:hover { background: color-mix(in srgb, var(--primary-color) 10%, transparent); }
  .btn.primary:hover { filter: brightness(1.08); background: var(--primary-color); }
  :focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  /* With a height set, the header stays put and the rest scrolls. */
  ha-card.fixed { display: flex; flex-direction: column; overflow: hidden; }
  ha-card.fixed .body { display: flex; flex-direction: column; flex: 1; min-height: 0; }
  ha-card.fixed .header { flex: none; }
  ha-card.fixed .scroll { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
  .header { display: flex; align-items: center; gap: 8px; padding: 16px 16px 8px; }
  .header h2 { margin: 0; flex: 1; font-size: 20px; font-weight: 500; color: var(--ha-card-header-color, var(--primary-text-color)); }
  .muted { color: var(--secondary-text-color); }
  .small { font-size: 12px; }
  .hint { color: var(--secondary-text-color); font-size: 13px; padding: 8px 16px 16px; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 10px; font-size: 12px; line-height: 18px;
    background: color-mix(in srgb, var(--chip-color, var(--primary-color)) 16%, transparent); color: var(--primary-text-color); white-space: nowrap; }
  .chip.shabbat { --chip-color: #ffa000; }
  .chip.chag { --chip-color: #5c6bc0; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--disabled-text-color, #9e9e9e); flex: none; }
  .dot.on { background: var(--success-color, #43a047); }
  /* a switch built from a checkbox */
  .switch { position: relative; display: inline-block; width: 36px; height: 20px; flex: none; }
  /* The box reaches past the drawn switch: 36x20 is too small a target for a finger. Sized explicitly: Safari keeps a
     checkbox at its own 12px whatever its insets, which left it beside the switch instead of over it. */
  .switch input { position: absolute; top: -8px; left: -8px; width: calc(100% + 16px); height: calc(100% + 16px);
    -webkit-appearance: none; appearance: none; opacity: 0; margin: 0; padding: 0; border: 0; cursor: pointer; z-index: 1;
    -webkit-tap-highlight-color: transparent; }
  .switch .track { position: absolute; inset: 3px 0; border-radius: 7px; background: var(--switch-unchecked-track-color, #9e9e9e); opacity: .5; transition: .15s; }
  .switch .knob { position: absolute; top: 0; inset-inline-start: 0; width: 20px; height: 20px; border-radius: 50%;
    background: var(--switch-unchecked-button-color, #fafafa); box-shadow: 0 1px 3px rgba(0,0,0,.4); transition: .15s; }
  .switch input:checked ~ .track { background: var(--switch-checked-track-color, var(--primary-color)); }
  .switch input:checked ~ .knob { inset-inline-start: 16px; background: var(--switch-checked-button-color, var(--primary-color)); }
  .switch.partial input ~ .knob { inset-inline-start: 8px; background: var(--switch-checked-button-color, var(--primary-color)); }
  .switch input:disabled { cursor: default; }
  .switch input:disabled ~ .knob, .switch input:disabled ~ .track { opacity: .35; }
  .switch input:focus-visible ~ .knob { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  .toast { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 10; max-width: min(560px, calc(100vw - 32px));
    background: var(--primary-text-color); color: var(--card-background-color, #fff); padding: 10px 16px; border-radius: 8px; font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,.3); }
  .toast[hidden] { display: none; }
`;

const switchHtml = ({ checked = false, partial = false, disabled = false, label = '', attrs = '' } = {}) =>
  `<span class="switch ${partial ? 'partial' : ''}"><input type="checkbox" role="switch" ${checked ? 'checked' : ''}
    aria-checked="${partial ? 'mixed' : checked}" ${disabled ? 'disabled' : ''} aria-label="${esc(label)}" ${attrs}>
    <span class="track"></span><span class="knob"></span></span>`;

const Base = globalThis.HTMLElement || class {};

/** What both cards share: shadow root, language, a live adapter over hass for the ops, the label registry, a toast. */
class CardBase extends Base {
  constructor() {
    super();
    // The ops wait for entities to appear, so they need the latest hass, not the one they started with.
    const self = this;
    this._h = {
      callWS: (m) => self._hass.callWS(m),
      callApi: (...a) => self._hass.callApi(...a),
      callService: (...a) => self._hass.callService(...a),
      get states() {
        return self._hass?.states || {};
      },
    };
    this._labels = null;
    this._displayLabels = null;
  }

  get _lang() {
    return langOf(this._hass);
  }

  /**
   * A switch the user just flipped shows its new position until HA's state catches up. Without this, a redraw before
   * the state change arrives puts it back where it was, and the click looks lost. Gives up after 10 s.
   */
  _expect(ids, on) {
    this._pending ??= new Map();
    const until = Date.now() + 10000;
    for (const id of ids) this._pending.set(id, { state: on ? 'on' : 'off', until });
  }

  _forget(ids) {
    for (const id of ids) this._pending?.delete(id);
  }

  /** An entity's state as the user should see it: HA's, or the one a switch was just flipped to. */
  _stateOf(id) {
    const real = this._hass?.states?.[id]?.state;
    const p = this._pending?.get(id);
    if (!p) return real;
    if (real === p.state || Date.now() > p.until) {
      this._pending.delete(id);
      return real;
    }
    return p.state;
  }

  /** Flips automations on or off, showing the new position at once and taking it back if the call fails. */
  async _flip(ids, on, call) {
    this._expect(ids, on);
    const ok = await this._run(async () => {
      await call();
      return true;
    });
    if (!ok) this._forget(ids);
    return ok;
  }

  get _t() {
    return STRINGS[this._lang];
  }

  get _isAdmin() {
    return this._hass?.user?.is_admin !== false;
  }

  _root() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    return this.shadowRoot;
  }

  /** Labels by name, and each entity's labels: from hass.entities when HA provides them, else list_for_display. */
  _registry() {
    const ents = this._hass?.entities;
    const entityLabels = {};
    if (ents && Object.keys(ents).length) {
      for (const [id, e] of Object.entries(ents)) entityLabels[id] = e.labels || [];
    } else Object.assign(entityLabels, this._displayLabels || {});
    return { labels: this._labels || [], entityLabels };
  }

  async _loadLabels() {
    try {
      const reg = await loadRegistry(this._h);
      this._labels = reg.labels;
      this._displayLabels = reg.entityLabels;
    } catch {
      this._labels ??= [];
    }
    this._render(true);
  }

  /** HA replaces hass.entities when the registry changes; a label id we have not seen means a label was created. */
  _checkLabels() {
    const ents = this._hass?.entities;
    if (!ents || ents === this._entitiesSeen || !this._labels) return;
    this._entitiesSeen = ents;
    const known = new Set(this._labels.map((l) => l.label_id));
    if (Object.values(ents).some((e) => (e.labels || []).some((l) => !known.has(l)))) this._loadLabels();
  }

  _modeOf(entityId, reg = this._registry()) {
    const own = reg.entityLabels[entityId] || [];
    return MODES.find((m) => {
      const l = labelNamed(reg, m);
      return l && own.includes(l.label_id);
    }) || null;
  }

  _toast(text, ms = 6000) {
    const root = this._root();
    // A modal dialog sits in the top layer: a toast outside it would be hidden behind its backdrop.
    const host = root.querySelector('dialog[open]') || root;
    // A direct child: `:scope >` matches nothing when asked of a shadow root.
    let el = [...host.children].find((c) => c.classList.contains('toast'));
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      host.appendChild(el);
    }
    el.textContent = text;
    el.hidden = false;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => (el.hidden = true), ms);
  }

  /** Runs a write; HA's error text goes to the toast. Returns the result, or undefined when it failed. */
  async _run(fn) {
    try {
      return await fn();
    } catch (err) {
      this._toast(errorText(err));
      return undefined;
    }
  }

  _dirAttr() {
    return this._lang === 'he' ? 'rtl' : 'ltr';
  }

  /** Writes the card body: a header and a scroll area, which keeps its scroll position across redraws. */
  _paint(header, content) {
    const root = this._root();
    const card = root.querySelector('ha-card');
    // No height set: the card grows with its content up to DEFAULT_MAX_HEIGHT, then scrolls; "auto" never caps it.
    const height = cssHeight(this._config.height);
    const unset = !height && String(this._config.height ?? '').trim().toLowerCase() !== 'auto';
    card.classList.toggle('fixed', !!height || unset);
    card.style.height = height || '';
    card.style.maxHeight = unset ? DEFAULT_MAX_HEIGHT : '';
    const body = root.querySelector('.body');
    const top = body.querySelector('.scroll')?.scrollTop ?? 0;
    body.setAttribute('dir', this._dirAttr());
    body.innerHTML = `${header}<div class="scroll">${content}</div>`;
    body.querySelector('.scroll').scrollTop = top;
  }
}

// ---------------------------------------------------------------------------- schedule-helper-card

class ScheduleHelperCard extends CardBase {
  static getStubConfig() {
    return { show_add: true };
  }

  static getConfigElement() {
    return document.createElement('schedule-helper-card-editor');
  }

  setConfig(config) {
    if (config?.entities && !Array.isArray(config.entities)) throw new Error('entities must be a list');
    if (config?.hide_entities && !Array.isArray(config.hide_entities)) throw new Error('hide_entities must be a list');
    if (config?.device_domains && !Array.isArray(config.device_domains)) throw new Error('device_domains must be a list');
    this._config = { show_add: true, ...config };
    this._sig = null;
    this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) {
      this._loadLabels();
      this._loadWeeks();
      this._loadDrivers();
      this._subscribe();
    } else {
      if (this._driversSig !== this._driversKey()) this._loadDrivers();
      this._checkLabels();
      if (this._weeksSig !== this._scheduleSig()) this._loadWeeks();
    }
    this._render();
    this._editor?.onHass();
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    return 2 + this._visible().length * 2;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  connectedCallback() {
    // "today"/"tomorrow" go stale at midnight; the signature carries the date, so a tick is enough.
    this._clock = setInterval(() => this._render(), 60000);
    if (this._hass) {
      this._subscribe();
      if (this._detached) this._loadWeeks(); // back on the page: whatever changed meanwhile
    }
  }

  /**
   * Hours edited elsewhere (HA's own editor, another device) often leave the entity's state and next_event as they
   * were, so HA sends no state change and the card would keep showing the old week. The schedule collection's own
   * subscription reports every create, update and delete. Without it (no connection, or HA refuses it) the card
   * still follows state changes.
   */
  _subscribe() {
    const conn = this._hass?.connection;
    if (this._unsub || !conn?.subscribeMessage || !this.isConnected) return;
    let first = true;
    this._unsub = conn.subscribeMessage((changes) => {
      if (first) {
        first = false; // the current list, already loaded
        return;
      }
      for (const c of changes || []) if (c.schedule_id === this._editor?.id) this._editor.changedElsewhere(c);
      clearTimeout(this._subTimer);
      this._subTimer = setTimeout(() => this._loadWeeks(), 250);
    }, { type: 'schedule/subscribe' }).catch(() => null);
  }

  disconnectedCallback() {
    clearInterval(this._clock);
    clearTimeout(this._subTimer);
    this._unsub?.then((unsub) => unsub?.()).catch(() => {});
    this._unsub = null;
    this._detached = true;
    // A dialog removed from the page leaves the top layer without a close event.
    this._editor?.dlg?.close();
    this._editor?.destroy();
  }

  // Which schedule entities changed, cheaply: their last_updated.
  _scheduleSig() {
    return Object.values(this._hass?.states || {})
      .filter((e) => e.entity_id.startsWith('schedule.'))
      .map((e) => `${e.entity_id}@${e.last_updated}`)
      .join('|');
  }

  async _loadWeeks() {
    this._weeksSig = this._scheduleSig();
    const entities = Object.keys(this._hass?.states || {}).filter((id) => id.startsWith('schedule.'));
    if (this._isAdmin) {
      // schedule/list is an admin command, and the only source of what can be edited.
      try {
        this._weeks = await listSchedules(this._h);
        this._weeksError = null;
      } catch (err) {
        this._weeks ??= {};
        this._weeksError = errorText(err);
      }
      // Which helper each entity is (an entity id can be renamed); asked again only when the set of schedules changes.
      const sig = entities.slice().sort().join('|');
      if (sig !== this._idsSig) {
        this._idsSig = sig;
        this._ids = await scheduleIdsOf(this._h, entities).catch(() => ({}));
      }
    }
    // The rest (YAML schedules, or every schedule for a non-admin) is read-only: get_schedule is open to everyone.
    const rest = entities.filter((id) => !this._weeks?.[this._idOf(id)]);
    try {
      this._readWeeks = await readSchedules(this._h, rest);
    } catch {
      this._readWeeks ??= {};
    }
    this._render(true);
  }

  /** The helper id behind a schedule entity. */
  _idOf(entityId) {
    return this._ids?.[entityId] ?? entityId.slice('schedule.'.length);
  }

  /** Shabbat and chag: as `show_modes` says, or, when it is not set, only in a home that already has their labels. */
  _showModes() {
    const v = this._config?.show_modes;
    if (typeof v === 'boolean') return v;
    return hasModeLabels(this._labels);
  }

  _visible() {
    const c = this._config || {};
    const reg = this._registry();
    const only = c.entities;
    const hide = c.hide_entities || [];
    return Object.values(this._hass?.states || {})
      .filter((e) => e.entity_id.startsWith('schedule.'))
      .filter((e) => (!only || only.includes(e.entity_id)) && !hide.includes(e.entity_id))
      .filter((e) => !c.mode || this._modeOf(e.entity_id, reg) === c.mode)
      .sort((a, b) => entityName(a).localeCompare(entityName(b), this._lang));
  }

  _render(force = false) {
    if (!this._config || !this._hass) return;
    const reg = this._registry();
    const visible = this._visible();
    const sig = JSON.stringify([
      this._lang, this._isAdmin, this._config, new Date().toDateString(), new Date().getHours(),
      visible.map((e) => [e.entity_id, e.last_updated, reg.entityLabels[e.entity_id], this._idleReason(e.entity_id, reg)]), !!this._weeks, Object.keys(this._readWeeks || {}).length, this._labels?.length,
    ]);
    if (!force && sig === this._sig) return;
    this._sig = sig;
    const t = this._t;
    const root = this._root();
    if (!root.querySelector('ha-card')) {
      root.innerHTML = `<style>${BASE_STYLE}${SCHEDULE_STYLE}${EDITOR_STYLE}</style><ha-card><div class="body"></div></ha-card><div class="toast" hidden role="status"></div>`;
      root.addEventListener('click', (e) => this._onClick(e));
      root.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.row[data-id]')) {
          e.preventDefault();
          this._onClick(e);
        }
      });
    }
    const canEdit = this._isAdmin;
    const now = new Date();
    const rows = visible.map((e) => this._rowHtml(e, reg, now, canEdit)).join('');
    this._paint(`
      <div class="header">
        <h2>${esc(this._config.title ?? t.schedules)}</h2>
        ${canEdit && this._config.show_add !== false ? `<button class="btn primary" data-act="new">${esc(t.newSchedule)}</button>` : ''}
      </div>`, `
      ${canEdit ? '' : `<div class="hint">${esc(t.readOnly)}</div>`}
      ${canEdit && this._weeksError ? `<div class="warn load-error" role="alert"><span class="grow">${esc(t.loadSchedulesFailed)} ${esc(this._weeksError)}</span>
        <button class="btn" data-act="retry">${esc(t.retry)}</button></div>` : ''}
      <div class="list" role="list">${rows || `<div class="hint">${esc(this._weeks || !canEdit ? t.noSchedules : t.loading)}</div>`}</div>`);
  }

  _rowHtml(e, reg, now, canEdit) {
    const t = this._t;
    const id = this._idOf(e.entity_id);
    const editableWeek = this._weeks?.[id];
    const week = editableWeek || this._readWeeks?.[e.entity_id];
    const yaml = e.attributes?.editable === false || (this._weeks && !week);
    const mode = this._showModes() ? this._modeOf(e.entity_id, reg) : null;
    const on = e.state === 'on';
    const next = e.attributes?.next_event ? new Date(e.attributes.next_event) : null;
    const editable = canEdit && !yaml && !!editableWeek;
    const when = next && !isNaN(next) ? `${on ? t.ends : t.starts} ${formatWhen(next, now, this._lang)}` : '';
    const idle = this._idleReason(e.entity_id, reg);
    if (idle) {
      const ownMode = this._modeOf(e.entity_id, reg);
      const label = idle === 'modeOff' ? t.modeIsOff(t.modeName[ownMode]) : t[idle];
      return this._rowShell(e, editable, `
        <div class="line">
          <span class="dot" title="${esc(label)}"></span>
          <span class="name">${esc(entityName(e))}</span>
          ${mode ? `<span class="chip ${mode === 'שבת' ? 'shabbat' : 'chag'}">${esc(t.modeName[mode])}</span>` : ''}
          <span class="spacer"></span>
          <span class="state idle" title="${esc(t.wontRun)}">${esc(label)}</span>
        </div>
        ${when ? `<div class="when muted small">${esc(when)} · ${esc(t.wontRunShort)}</div>` : ''}
        ${yaml ? `<div class="muted small">${esc(t.yaml)}</div>` : ''}
        ${week ? `<div class="idle-bars">${weekBarsHtml(week, this._lang)}</div>` : ''}`);
    }
    return `
      <div class="row ${editable ? 'editable' : ''}" role="listitem" ${editable ? `data-id="${esc(e.entity_id)}" tabindex="0"` : ''}
        aria-label="${esc(entityName(e))}">
        <div class="line">
          <span class="dot ${on ? 'on' : ''}" title="${esc(on ? t.onNow : t.offNow)}"></span>
          <span class="name">${esc(entityName(e))}</span>
          ${mode ? `<span class="chip ${mode === 'שבת' ? 'shabbat' : 'chag'}">${esc(t.modeName[mode])}</span>` : ''}
          <span class="spacer"></span>
          <span class="state ${on ? 'on' : ''}">${esc(on ? t.onNow : t.offNow)}</span>
        </div>
        ${when ? `<div class="when muted small">${esc(when)}</div>` : ''}
        ${yaml ? `<div class="muted small">${esc(t.yaml)}</div>` : ''}
        ${week ? weekBarsHtml(week, this._lang) : ''}
      </div>`;
  }

  _rowShell(e, editable, inner) {
    return `
      <div class="row idle ${editable ? 'editable' : ''}" role="listitem" ${editable ? `data-id="${esc(e.entity_id)}" tabindex="0"` : ''}
        aria-label="${esc(`${entityName(e)} — ${this._t.wontRun}`)}">${inner}
      </div>`;
  }

  _onClick(e) {
    const act = e.target.closest?.('[data-act]')?.dataset.act;
    if (act === 'new') return this._openEditor(null);
    if (act === 'retry') {
      this._weeksError = null;
      return this._loadWeeks();
    }
    const row = e.target.closest?.('.row[data-id]');
    if (row) this._openEditor(row.dataset.id);
  }

  async _openEditor(entityId) {
    if (!this._isAdmin || this._editor || this._opening) return;
    if (entityId) {
      // The week may have changed elsewhere without touching the entity's state: edit what HA has now.
      this._opening = true;
      try {
        this._weeks = await listSchedules(this._h);
        this._weeksError = null;
      } catch (err) {
        // The cached copy will do; without one the row can't open, and the card says why.
        if (!this._weeks?.[this._idOf(entityId)]) this._weeksError = errorText(err);
      } finally {
        this._opening = false;
      }
      this._render(true);
      if (!this._weeks?.[this._idOf(entityId)] || this._editor) return;
    }
    this._editor = new ScheduleEditor(this, entityId);
    this._editor.open();
  }

  /** After a write: fresh weeks and labels, whatever the entity states say. */
  _afterWrite() {
    this._loadWeeks();
    this._loadLabels();
    this._driversSig = null;
    this._loadDrivers();
  }

  /** The schedules and automations there are: when either set changes, which automation drives what may have too. */
  _driversKey() {
    const ids = Object.keys(this._hass?.states || {});
    return ids.filter((id) => id.startsWith('schedule.') || id.startsWith('automation.')).sort().join('|');
  }

  /**
   * The automations that use each schedule (search/related), to tell when none of them is on and the schedule will
   * switch nothing. Null when HA would not say; the card then falls back to the schedule's mode.
   */
  async _loadDrivers() {
    const key = this._driversKey();
    if (key === this._driversSig) return;
    this._driversSig = key;
    const schedules = Object.keys(this._hass.states).filter((id) => id.startsWith('schedule.'));
    try {
      const pairs = await Promise.all(schedules.map(async (id) => [id, await automationsFor(this._h, id)]));
      if (key === this._driversSig) this._drivers = Object.fromEntries(pairs);
    } catch {
      this._drivers = null;
    }
    this._render(true);
  }

  /**
   * Why a schedule will not switch anything right now, or null when it will: 'automationOff' (every automation that
   * uses it is off), 'noAutomation' (none uses it), or 'modeOff' (no answer from HA about its automations, but it is in
   * a mode that is off).
   */
  _idleReason(entityId, reg) {
    const states = this._hass.states;
    const drivers = this._drivers?.[entityId];
    if (drivers) {
      const known = drivers.filter((a) => states[a]);
      if (!known.length) return 'noAutomation';
      return known.some((a) => states[a].state === 'on') ? null : 'automationOff';
    }
    if (this._drivers) return null; // loaded, but not for this one yet
    const mode = this._modeOf(entityId, reg);
    if (!mode) return null;
    const members = modeMembers(states, reg, mode).filter((m) => !isAutoAlias(m.attributes?.friendly_name));
    return modeState(members) === 'off' ? 'modeOff' : null;
  }

  /** Areas, devices and the entity registry, for the device picker; read once per card. */
  async _pickerData() {
    this._pickerCache ??= Promise.all([
      this._h.callWS({ type: 'config/area_registry/list' }),
      this._h.callWS({ type: 'config/device_registry/list' }),
      this._h.callWS({ type: 'config/entity_registry/list_for_display' }),
    ]).then(([areas, devices, display]) => ({ areas, devices, display }));
    try {
      return await this._pickerCache;
    } catch (err) {
      this._pickerCache = null;
      throw err;
    }
  }
}

// ---------------------------------------------------------------------------- the editor dialog


/** Create a schedule for a device, or edit the week of an existing one. Lives in a <dialog> in the card's shadow root. */
class ScheduleEditor {
  constructor(card, entityId) {
    this.card = card;
    this.entityId = entityId; // null = a new schedule
    this.isNew = !entityId;
    this.id = entityId ? card._idOf(entityId) : null;
    this.week = entityId ? card._weeks[this.id].clone() : new WeekSchedule({ name: '' });
    this.mode = entityId ? card._modeOf(entityId) : null;
    this.originalMode = this.mode;
    this.originalName = this.week.name;
    this.view = 'main'; // 'picker' | 'confirmDelete'
    this.device = null;
    this.hvacMode = null;
    this.temperature = null;
    this.brightness = null;
    this.turnOffAtEnd = true;
    this.automations = null; // existing schedule: the automations it drives
    this.driven = null; // existing schedule: {automation, config, parsed} for the one automation the card can rewrite
    this.handEdited = false;
    this.rangeEdit = null; // {day, index}
    this.copyFrom = null; // {day, chosen: Set}
    this.query = '';
    this.picker = null;
    this.saving = false;
    this.error = '';
  }

  get t() {
    return this.card._t;
  }

  get lang() {
    return this.card._lang;
  }

  open() {
    const root = this.card._root();
    const dlg = document.createElement('dialog');
    dlg.className = 'editor';
    dlg.setAttribute('aria-labelledby', 'dlg-title');
    root.appendChild(dlg);
    this.dlg = dlg;
    dlg.addEventListener('click', (e) => this.onClick(e));
    dlg.addEventListener('change', (e) => this.onChange(e));
    dlg.addEventListener('input', (e) => this.onInput(e));
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.target.id === 'from' || e.target.id === 'to')) {
        e.preventDefault();
        this.dlg.querySelector('[data-act=rangeOk]')?.click();
      }
    });
    dlg.addEventListener('cancel', (e) => {
      e.preventDefault();
      this.back();
    });
    dlg.addEventListener('close', () => this.destroy());
    this.render();
    dlg.showModal();
    if (this.isNew) {
      this.card._pickerData().then((d) => { this.picker = d; if (this.view === 'picker') this.render(); }, (err) => { this.error = errorText(err); this.render(); });
    } else {
      this.automationsReady = automationsFor(this.card._h, this.entityId).then(
        (a) => {
          this.automations = a;
          // Nothing uses it: the device section appears, to create the automation.
          if (!a.length && this.view === 'main') this.render();
          else this.renderLinked();
          return this.loadDriven(a);
        },
        () => { this.automations = []; this.automationsUnknown = true; this.renderLinked(); },
      );
    }
  }

  /** The automation the card wrote for this schedule, if it can be rewritten: then device and action become editable. */
  async loadDriven(automations) {
    const h = this.card._h;
    const ours = [];
    for (const a of automations) {
      const config = await automationConfig(h, a).catch(() => null);
      if (isOurs(config)) ours.push({ automation: a, config, parsed: parseScheduleAutomation(config) });
    }
    this.oursAutomations = ours.map((o) => o.automation);
    const editable = ours.filter((o) => o.parsed && o.parsed.scheduleEntityId === this.entityId);
    if (editable.length === 1) {
      this.driven = editable[0];
      const tgt = this.driven.parsed.target;
      this.device = this.card._hass.states[tgt.entityId] || { entity_id: tgt.entityId, state: 'unavailable', attributes: { friendly_name: tgt.name } };
      this.hvacMode = tgt.hvacMode;
      this.temperature = tgt.temperature;
      this.brightness = tgt.brightnessPct;
      this.turnOffAtEnd = tgt.turnOffAtEnd;
    } else this.handEdited = ours.some((o) => !o.parsed);
    if (this.view === 'main' && (this.driven || this.handEdited)) {
      this.syncName();
      this.render();
    }
  }

  /** An existing schedule that no automation uses: choosing a device creates the automation for it. */
  get attachable() {
    return !this.isNew && Array.isArray(this.automations) && !this.automations.length && !this.automationsUnknown;
  }

  /** What the device section describes now. */
  currentTarget() {
    const d = this.device;
    const keepName = this.driven && this.driven.parsed.target.entityId === d.entity_id;
    return {
      entityId: d.entity_id,
      name: keepName ? this.driven.parsed.target.name : entityName(d),
      hvacMode: domainOf(d.entity_id) === 'climate' ? this.hvacMode : null,
      temperature: this.temperature,
      brightnessPct: this.brightness,
      turnOffAtEnd: this.turnOffAtEnd,
    };
  }

  close() {
    if (this.saving) return; // the result has to be seen
    if (this.dlg?.open) this.dlg.close();
    else this.destroy();
  }

  destroy() {
    this.dlg?.remove();
    if (this.card._editor === this) this.card._editor = null;
  }

  /** Escape or the back arrow: leave a sub-view first, then the dialog. */
  back() {
    if (this.saving) return;
    if (this.view !== 'main') {
      if (this.view === 'confirmDelete') this.error = ''; // a failed delete is not the main view's business
      this.view = 'main';
      this.render();
    } else if (this.rangeEdit || this.copyFrom) {
      this.rangeEdit = this.copyFrom = null;
      this.render();
    } else this.close();
  }

  onHass() {
    if (this.view === 'main' && !this.isNew) this.renderLinked();
  }

  // ---- rendering ----

  render() {
    if (!this.dlg) return;
    // What is typed in an open range panel survives a redraw (e.g. the late "What it does" section).
    if (this.rangeEdit && this._panelFor === this.rangeEdit && this.dlg.querySelector('#from')) {
      this.rangeEdit.from = this.dlg.querySelector('#from').value;
      this.rangeEdit.to = this.dlg.querySelector('#to').value;
    }
    const t = this.t;
    const root = this.card._root();
    const focusKey = root.activeElement?.dataset?.focus;
    const scroller = this.dlg.querySelector('.dlg-body');
    const scrollTop = scroller?.scrollTop ?? 0;
    this.dlg.setAttribute('dir', this.card._dirAttr());
    const title = this.view === 'picker' ? t.chooseDevice : this.isNew ? t.newSchedule : t.editSchedule;
    const head = this.view === 'main'
      ? `<button class="icon-btn" data-act="close" aria-label="${esc(t.close)}" data-focus="close" ${this.saving ? 'disabled' : ''}>${icon('close')}</button>
         <h3 id="dlg-title">${esc(title)}</h3>
         ${this.isNew ? '' : `<button class="icon-btn" data-act="askDelete" aria-label="${esc(t.delete)}" title="${esc(t.delete)}" ${this.saving ? 'disabled' : ''}>${icon('delete')}</button>`}
         <button class="btn primary" data-act="save" ${this.saving ? 'disabled' : ''}>${this.saving ? '<span class="spinner"></span>' : ''}${esc(t.save)}</button>`
      : `<button class="icon-btn" data-act="back" aria-label="${esc(t.back)}" data-focus="back">${icon('back', 'flip')}</button><h3 id="dlg-title">${esc(this.view === 'picker' ? title : t.deleteQ)}</h3>`;
    const body = this.view === 'picker' ? this.pickerHtml() : this.view === 'confirmDelete' ? this.confirmHtml() : this.mainHtml();
    // The card's toast lives in the dialog while it is open (see _toast): keep it across the re-render.
    const toast = [...this.dlg.children].find((c) => c.classList.contains('toast'));
    this.dlg.innerHTML = `<div class="dlg-head">${head}</div><div class="dlg-body">${body}</div>`;
    if (toast) this.dlg.appendChild(toast);
    const again = this.dlg.querySelector('.dlg-body');
    if (this.view === 'main') again.scrollTop = scrollTop;
    // A panel that just opened (or an error in it) takes the focus and scrolls into view with its day.
    if (this.focusPanel) {
      this.focusPanel = false;
      const panel = this.dlg.querySelector('.panel');
      panel?.closest('.day')?.scrollIntoView({ block: 'nearest' });
      const field = panel?.querySelector('[data-autofocus]');
      field?.focus();
      field?.select?.();
      return;
    }
    const focus = (focusKey && this.dlg.querySelector(`[data-focus="${focusKey}"]`)) || this.dlg.querySelector('[data-autofocus]');
    focus?.focus();
  }

  /** The open schedule was changed or deleted elsewhere (HA's editor, another device) while this dialog was open. */
  changedElsewhere(change) {
    if (this.saving || !this.dlg?.open) return; // our own write coming back, or already closing
    // Or it already says what this dialog says (our own write arriving late, or the same edit made twice).
    if (change.item && JSON.stringify(WeekSchedule.fromHA(change.item).toHA()) === JSON.stringify(this.week.toHA())) return;
    this.remote = change;
    if (this.view === 'main') this.render();
  }

  remoteHtml() {
    const t = this.t;
    if (!this.remote) return '';
    if (this.remote.change_type === 'removed') return `<div class="warn" role="alert"><span>${esc(t.deletedElsewhere)}</span></div>`;
    return `<div class="warn" role="alert"><span class="grow">${esc(t.changedElsewhere)}</span>
      <button class="btn" data-act="reloadRemote">${esc(t.loadTheirs)}</button></div>`;
  }

  mainHtml() {
    const t = this.t;
    const seg = [[null, t.regular], ...MODES.map((m) => [m, t.modeName[m]])];
    return `
      ${this.remoteHtml()}
      ${this.error ? `<div class="error" role="alert"><span>${esc(this.error)}</span></div>` : ''}
      ${this.isNew ? this.targetHtml() : ''}
      <label class="field"><span>${esc(t.name)}</span>
        <input id="name" data-focus="name" value="${esc(this.week.name)}" autocomplete="off"
          ${this.isNew ? `placeholder="${esc(t.namePlaceholder)}"` : ''}></label>
      ${!this.card._showModes() ? '' : `<div class="section">
        <div class="label">${esc(t.type)}</div>
        <div class="seg" role="radiogroup" aria-label="${esc(t.type)}">
          ${seg.map(([m, label]) => `<button role="radio" aria-checked="${this.mode === m}" data-act="mode" data-mode="${esc(m ?? '')}"
            data-focus="mode-${esc(m ?? '')}">${esc(label)}</button>`).join('')}
        </div>
        ${this.mode ? `<div class="muted small">${esc(t.modeHint(t.modeName[this.mode]))}</div>` : ''}
      </div>`}
      ${this.isNew ? '' : `<div class="section linked">${this.linkedHtml()}</div>
        ${this.driven ? this.targetHtml(t.whatItDoes) : this.attachable ? this.targetHtml(t.addDevice) : this.handEdited ? `<div class="muted small">${esc(t.handEdited)}</div>` : ''}`}
      <div class="section">
        <div class="label row-between"><span>${esc(t.hours)}</span>
          <button class="link" data-act="clear" data-focus="clear">${esc(t.clearAll)}</button></div>
        <div class="muted small">${esc(t.midnightHint)}</div>
        <div class="days">${DAYS.map((_, i) => this.dayHtml(i)).join('')}</div>
      </div>`;
  }

  targetHtml(title = this.t.device) {
    const t = this.t;
    const d = this.device;
    let options = '';
    if (d) {
      const o = actionOptions(d);
      if (o.hvacModes.length) {
        options += `<div class="label">${esc(t.whileActive)}</div><div class="chips" role="radiogroup" aria-label="${esc(t.whileActive)}">
          ${o.hvacModes.map((m) => `<button class="choice" role="radio" aria-checked="${this.hvacMode === m}" data-act="hvac" data-v="${esc(m)}"
            data-focus="hvac-${esc(m)}">${esc(t.hvac[m] || m)}</button>`).join('')}</div>`;
      }
      if (o.temp) {
        options += `<div class="opt"><label class="check"><input type="checkbox" data-field="useTemp" data-focus="useTemp" ${this.temperature != null ? 'checked' : ''}>
          <span>${esc(t.setTemp)}</span></label>
          ${this.temperature != null ? `<span class="stepper" dir="ltr">
            <button class="icon-btn" data-act="temp" data-v="-1" aria-label="−" data-focus="temp-">${icon('minus')}</button>
            <b aria-live="polite">${esc(this.temperature)}°</b>
            <button class="icon-btn" data-act="temp" data-v="1" aria-label="+" data-focus="temp+">${icon('plus')}</button></span>` : ''}</div>`;
      }
      if (o.brightness) {
        options += `<div class="opt"><label class="check"><input type="checkbox" data-field="useBrightness" data-focus="useBrightness" ${this.brightness != null ? 'checked' : ''}>
          <span>${esc(t.brightness)}</span></label>
          ${this.brightness != null ? `<input type="range" min="1" max="100" value="${this.brightness}" data-field="brightness" data-focus="brightness"
            aria-label="${esc(t.brightness)}"><b class="bval">${this.brightness}%</b>` : ''}</div>`;
      }
      options += `<div class="muted small summary">${esc(actionSummary(this.currentTarget(), this.lang))}</div>`;
      options += `<div class="opt"><span>${esc(o.domain === 'cover' ? t.closeAtEnd : t.turnOffAtEnd)}</span><span class="spacer"></span>
        ${switchHtml({ checked: this.turnOffAtEnd, label: o.domain === 'cover' ? t.closeAtEnd : t.turnOffAtEnd, attrs: 'data-field="turnOff" data-focus="turnOff"' })}</div>`;
    }
    return `<div class="section">
      <div class="label">${esc(title)}</div>
      <button class="device" data-act="pick" data-focus="pick">
        ${d ? `<span class="dname">${esc(entityName(d))}</span><span class="muted small" dir="ltr">${esc(d.entity_id)}</span><span class="spacer"></span><span class="link">${esc(t.changeDevice)}</span>`
          : `<span>${esc(t.chooseDevice)}</span>`}
      </button>
      ${options}
    </div>`;
  }

  linkedHtml() {
    const t = this.t;
    const autos = this.automations;
    const states = this.card._hass.states;
    let inner;
    if (autos === null) inner = `<div class="muted small">${esc(t.loading)}</div>`;
    else if (!autos.length) inner = `<div class="warn"><span>${esc(t.drivesNothing)}</span></div>`;
    else {
      inner = autos.map((a) => {
        const on = this.card._stateOf(a) === 'on';
        return `<div class="opt"><div class="grow"><div>${esc(entityName(states[a]) || a)}</div>
          <div class="muted small">${esc(on ? t.autoOn : t.autoOff)}</div></div>
          ${switchHtml({ checked: on, label: entityName(states[a]) || a, attrs: `data-field="auto" data-id="${esc(a)}" data-focus="auto-${esc(a)}"` })}</div>`;
      }).join('');
    }
    return `<div class="label">${esc(t.drives)}</div>${inner}`;
  }

  renderLinked() {
    const el = this.dlg?.querySelector('.linked');
    if (!el) return;
    const sig = JSON.stringify([this.automations, (this.automations || []).map((a) => this.card._stateOf(a))]);
    if (sig === this._linkedSig) return;
    this._linkedSig = sig;
    const focusKey = this.card._root().activeElement?.dataset?.focus;
    el.innerHTML = this.linkedHtml();
    if (focusKey) el.querySelector(`[data-focus="${focusKey}"]`)?.focus();
  }

  dayHtml(i) {
    const t = this.t;
    const name = DAY_NAMES[this.lang][i];
    const blocks = this.week.days[DAYS[i]];
    const chips = blocks.map((b, k) => `<span class="range"><button data-act="edit" data-day="${i}" data-index="${k}" dir="ltr"
        aria-label="${esc(`${t.editRange} ${name} ${blockLabel(b)}`)}" data-focus="edit-${i}-${k}">${esc(blockLabel(b))}</button><button
        class="x" data-act="remove" data-day="${i}" data-index="${k}" aria-label="${esc(`${t.removeRange} ${blockLabel(b)}`)}">${icon('close')}</button></span>`).join('');
    let panel = '';
    if (this.rangeEdit?.day === i) {
      this._panelFor = this.rangeEdit;
      const b = this.rangeEdit.index != null ? blocks[this.rangeEdit.index] : { start: 8 * 60, end: 9 * 60 };
      panel = `<div class="panel" role="group" aria-label="${esc(t.editRange)}">
        <div class="times" dir="ltr">
          <label><span>${esc(t.from)}</span><input type="text" inputmode="numeric" autocomplete="off" maxlength="5" placeholder="HH:MM" id="from" data-focus="from"
            value="${esc(this.rangeEdit.from ?? hm(b.start))}" data-autofocus></label>
          <span aria-hidden="true">–</span>
          <label><span>${esc(t.to)}</span><input type="text" inputmode="numeric" autocomplete="off" maxlength="5" placeholder="HH:MM" id="to" data-focus="to"
            value="${esc(this.rangeEdit.to ?? hm(b.end))}"></label>
        </div>
        ${this.rangeEdit.error ? `<div class="error small" role="alert">${esc(this.rangeEdit.error)}</div>` : ''}
        <div class="actions"><button class="btn" data-act="rangeCancel">${esc(t.cancel)}</button><button class="btn primary" data-act="rangeOk">${esc(t.ok)}</button></div>
      </div>`;
    } else if (this.copyFrom?.day === i) {
      const chosen = this.copyFrom.chosen;
      panel = `<div class="panel" role="group" aria-label="${esc(t.copyTo(name))}">
        <div class="label">${esc(t.copyTo(name))}</div>
        <div class="chips"><button class="choice" data-act="copyPreset" data-v="weekdays" data-autofocus>${esc(t.weekdays)}</button>
          <button class="choice" data-act="copyPreset" data-v="week">${esc(t.wholeWeek)}</button></div>
        <div class="copy-days">${DAYS.map((_, k) => (k === i ? '' : `<label class="check"><input type="checkbox" data-field="copyDay" data-v="${k}" ${chosen.has(k) ? 'checked' : ''}>
          <span>${esc(DAY_NAMES[this.lang][k])}</span></label>`)).join('')}</div>
        <div class="actions"><button class="btn" data-act="copyCancel">${esc(t.cancel)}</button><button class="btn primary" data-act="copyOk">${esc(t.copy)}</button></div>
      </div>`;
    }
    return `<div class="day">
      <div class="day-line">
        <span class="dname">${esc(name)}</span>
        <div class="ranges">${chips}<button class="add" data-act="add" data-day="${i}" data-focus="add-${i}" aria-label="${esc(`${t.addRange} ${name}`)}">+ ${esc(t.addRange)}</button></div>
        ${blocks.length ? `<button class="icon-btn" data-act="copyOpen" data-day="${i}" aria-label="${esc(`${t.copyDays} (${name})`)}" title="${esc(t.copyDays)}" data-focus="copy-${i}">${icon('copy')}</button>` : '<span class="icon-space"></span>'}
      </div>
      ${panel}
    </div>`;
  }

  pickerHtml() {
    const t = this.t;
    if (!this.picker) return `<div class="muted">${esc(t.loading)}</div>`;
    // A chip per device type this house has (within the card's device_domains).
    const present = new Set(deviceSections(this.pickerData()).flatMap((sec) => sec.entities.map((e) => domainOf(e.entity_id))));
    const types = PICKABLE_DOMAINS.filter((d) => present.has(d));
    const chip = (v, label) => `<button class="choice" role="radio" aria-checked="${(this.domainFilter ?? null) === v}" data-act="domain"
      data-v="${esc(v ?? '')}" data-focus="domain-${esc(v ?? 'all')}">${esc(label)}</button>`;
    return `<div class="picker-top"><label class="search"><input type="search" id="q" data-focus="q" data-autofocus placeholder="${esc(t.searchDevice)}"
      aria-label="${esc(t.searchDevice)}" value="${esc(this.query)}"></label>
      ${types.length > 1 ? `<div class="chips types" role="radiogroup" aria-label="${esc(t.device)}">${chip(null, t.allTypes)}${types.map((d) => chip(d, t.domainName[d] || d)).join('')}</div>` : ''}</div>
      <div class="picker-list">${this.pickerListHtml()}</div>`;
  }

  pickerData(only = null) {
    return { states: this.card._hass.states, ...this.picker, domains: this.card._config.device_domains, only };
  }

  pickerListHtml() {
    const t = this.t;
    const sections = deviceSections(this.pickerData(this.domainFilter), this.query, t.noArea, this.lang);
    if (!sections.length) return `<div class="muted">${esc(t.noDevices)}</div>`;
    return sections.map((sec) => `<div class="area">${esc(sec.title)}</div>${sec.entities.map((e) => `
      <button class="pick" data-act="choose" data-id="${esc(e.entity_id)}"><span class="grow">${esc(entityName(e))}</span>
        <span class="muted small" dir="ltr">${esc(e.entity_id)}</span></button>`).join('')}`).join('');
  }

  confirmHtml() {
    const t = this.t;
    return `<p>${esc(t.deleteText)}</p>
      ${this.error ? `<div class="error" role="alert"><span>${esc(this.error)}</span></div>` : ''}
      <div class="actions"><button class="btn" data-act="back" ${this.saving ? 'disabled' : ''}>${esc(t.cancel)}</button>
        <button class="btn primary danger-fill" data-act="doDelete" data-autofocus ${this.saving ? 'disabled' : ''}>${this.saving ? '<span class="spinner"></span>' : ''}${esc(t.delete)}</button></div>`;
  }

  // ---- events ----

  onClick(e) {
    if (e.target === this.dlg) return; // the backdrop: keep what was typed
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const act = el.dataset.act;
    const day = el.dataset.day != null ? Number(el.dataset.day) : null;
    const index = el.dataset.index != null ? Number(el.dataset.index) : null;
    const w = this.week;
    switch (act) {
      case 'close': return this.close();
      case 'back': return this.back();
      case 'save': return this.save();
      case 'askDelete': this.view = 'confirmDelete'; this.error = ''; break;
      case 'doDelete': return this.remove();
      case 'reloadRemote':
        // Starts again from the version saved elsewhere: what was changed here is dropped.
        if (this.remote?.item) {
          this.week = WeekSchedule.fromHA(this.remote.item);
          this.originalName = this.week.name;
        }
        this.remote = null;
        this.rangeEdit = this.copyFrom = null;
        break;
      case 'mode': this.mode = el.dataset.mode || null; break;
      case 'pick':
        this.view = 'picker';
        this.query = '';
        if (!this.picker) {
          this.card._pickerData().then((d) => { this.picker = d; if (this.view === 'picker') this.render(); }, (err) => { this.error = errorText(err); this.view = 'main'; this.render(); });
        }
        break;
      case 'choose': {
        const d = this.card._hass.states[el.dataset.id];
        if (!d) return;
        this.device = d;
        const o = actionOptions(d);
        this.hvacMode = o.defaultHvac;
        this.temperature = null;
        this.brightness = null;
        if (!this.nameInput().trim()) this.week.name = entityName(d);
        this.view = 'main';
        break;
      }
      case 'hvac': this.hvacMode = el.dataset.v; break;
      case 'domain': this.domainFilter = el.dataset.v || null; break;
      case 'temp': {
        const o = actionOptions(this.device);
        const step = o.temp.step;
        const next = Math.round((this.temperature + Number(el.dataset.v) * step) / step) * step;
        this.temperature = Math.min(o.temp.max, Math.max(o.temp.min, Number(next.toFixed(1))));
        break;
      }
      case 'clear': for (const d of DAYS) w.days[d] = []; this.rangeEdit = this.copyFrom = null; break;
      case 'add': this.rangeEdit = { day, index: null }; this.copyFrom = null; this.focusPanel = true; break;
      case 'edit': this.rangeEdit = { day, index }; this.copyFrom = null; this.focusPanel = true; break;
      case 'remove': w.days[DAYS[day]] = w.days[DAYS[day]].filter((_, k) => k !== index); this.rangeEdit = null; break;
      case 'rangeCancel': this.rangeEdit = null; break;
      case 'rangeOk': {
        const from = this.dlg.querySelector('#from').value;
        const to = this.dlg.querySelector('#to').value;
        Object.assign(this.rangeEdit, { from, to }); // kept if the panel is drawn again with an error
        const start = parseTimeInput(from);
        let end = parseTimeInput(to);
        if (end === 0) end = 1440; // "until midnight"
        if (start == null || end == null || start >= 1440) {
          this.rangeEdit.error = this.t.errTime;
          this.focusPanel = true;
          break;
        }
        if (end <= start) {
          this.rangeEdit.error = this.t.errRange;
          this.focusPanel = true;
          break;
        }
        const d = DAYS[this.rangeEdit.day];
        const old = this.rangeEdit.index != null ? w.days[d][this.rangeEdit.index] : null;
        const next = w.days[d].filter((_, k) => k !== this.rangeEdit.index);
        next.push({ ...(old?.data ? { data: old.data } : {}), start, end });
        w.days[d] = next.sort(byStart);
        this.rangeEdit = null;
        break;
      }
      case 'copyOpen': this.copyFrom = { day, chosen: new Set() }; this.rangeEdit = null; this.focusPanel = true; break;
      case 'copyPreset': for (const k of el.dataset.v === 'weekdays' ? [0, 1, 2, 3, 4] : [0, 1, 2, 3, 4, 5, 6]) this.copyFrom.chosen.add(k); break;
      case 'copyCancel': this.copyFrom = null; break;
      case 'copyOk': {
        const from = w.days[DAYS[this.copyFrom.day]];
        for (const k of this.copyFrom.chosen) if (k !== this.copyFrom.day) w.days[DAYS[k]] = from.map((b) => ({ ...b }));
        this.copyFrom = null;
        break;
      }
      default: return;
    }
    this.syncName();
    this.render();
  }

  onChange(e) {
    const f = e.target.dataset?.field;
    if (!f) return;
    if (f === 'auto') {
      const id = e.target.dataset.id;
      // Shows the new position until HA confirms it, or goes back to what HA says if the call failed.
      const on = e.target.checked;
      this.card._flip([id], on, () => setAutomationEnabled(this.card._h, id, on)).then(() => {
        this._linkedSig = null;
        this.renderLinked();
      });
      return;
    }
    if (f === 'copyDay') {
      const k = Number(e.target.dataset.v);
      e.target.checked ? this.copyFrom.chosen.add(k) : this.copyFrom.chosen.delete(k);
      return;
    }
    if (f === 'useTemp') this.temperature = e.target.checked ? actionOptions(this.device).temp.initial : null;
    else if (f === 'useBrightness') this.brightness = e.target.checked ? 80 : null;
    else if (f === 'turnOff') this.turnOffAtEnd = e.target.checked;
    else if (f === 'brightness') this.brightness = Number(e.target.value);
    else return;
    this.syncName();
    this.render();
  }

  onInput(e) {
    if (e.target.id === 'name') this.week.name = e.target.value;
    else if (e.target.id === 'q') {
      this.query = e.target.value;
      this.dlg.querySelector('.picker-list').innerHTML = this.pickerListHtml();
    } else if (e.target.dataset?.field === 'brightness') {
      this.brightness = Number(e.target.value);
      const b = this.dlg.querySelector('.bval');
      if (b) b.textContent = `${this.brightness}%`;
    }
  }

  nameInput() {
    return this.dlg.querySelector('#name')?.value ?? this.week.name;
  }

  syncName() {
    const el = this.dlg?.querySelector('#name');
    if (el) this.week.name = el.value;
  }

  // ---- writes ----

  async save() {
    const t = this.t;
    this.syncName();
    const problem = this.week.validate(this.lang) ?? (this.week.isEmpty ? t.errEmpty : null) ?? (this.isNew && !this.device ? t.errDevice : null);
    if (problem) {
      this.error = problem;
      this.render();
      this.dlg.querySelector('.dlg-body').scrollTop = 0;
      return;
    }
    this.error = '';
    this.saving = true;
    this.rangeEdit = this.copyFrom = null;
    this.render();
    const h = this.card._h;
    try {
      if (this.isNew) {
        await createScheduleWithAutomation(h, this.week, this.currentTarget(), { labelName: this.mode });
      } else {
        await this.automationsReady; // mode and rename need the linked automations
        await updateSchedule(h, this.id, this.week);
        if (this.attachable && this.device) {
          // The mode it already has (or the one just chosen): the new automation joins it.
          await addScheduleAutomation(h, this.entityId, this.week.name, this.currentTarget(), { labelName: this.mode });
        }
        if (this.driven) {
          // Read again: it may have been edited by hand in HA since this dialog opened, and is then left alone.
          const config = await automationConfig(h, this.driven.automation);
          // The alias follows the new name only while it is still the one the card gave it; renameScheduleAutomations decides.
          const followsName = config?.alias === scheduleAlias(this.originalName.trim());
          await rewriteScheduleAutomation(h, config, {
            scheduleName: followsName ? this.week.name : undefined,
            target: this.currentTarget(),
          });
        }
        await renameScheduleAutomations(h, this.automations || [], this.originalName, this.week.name);
        // Only when the user changed it: the automations may carry a mode the schedule itself does not.
        if (this.mode !== this.originalMode) {
          // Only the automations the card wrote for this schedule move: one the user wrote may only mention it.
          const autos = this.oursAutomations || [];
          const ids = [this.entityId, ...autos];
          for (const m of MODES) await setModeMembership(h, m, ids, this.mode === m);
          await alignWithMode(h, this.mode, autos);
        }
      }
      this.saving = false;
      this.card._afterWrite();
      this.close();
      this.card._toast(this.isNew ? t.created : t.saved, 3000);
    } catch (err) {
      this.saving = false;
      if (err?.created) {
        // The schedule and its automation were created; only a later step failed. Saving again would duplicate them.
        this.card._afterWrite();
        this.close();
        this.card._toast(t.createdPartly(errorText(err)), 12000);
        return;
      }
      this.error = t.saveFailed(errorText(err));
      if (!this.dlg?.isConnected) return this.card._toast(this.error, 12000); // closed meanwhile (e.g. Escape twice)
      this.render();
      this.dlg.querySelector('.dlg-body').scrollTop = 0;
    }
  }

  async remove() {
    const t = this.t;
    this.saving = true;
    this.render();
    try {
      const kept = await deleteSchedule(this.card._h, this.entityId, this.id);
      this.saving = false;
      this.card._afterWrite();
      this.close();
      if (kept.length) this.card._toast(t.kept(kept.join(', ')), 12000);
    } catch (err) {
      this.saving = false;
      this.error = t.deleteFailed(errorText(err));
      if (!this.dlg?.isConnected) return this.card._toast(this.error, 12000);
      this.render();
    }
  }
}

const EDITOR_STYLE = `
  dialog.editor { padding: 0; border: 0; border-radius: var(--ha-card-border-radius, 12px); width: min(640px, calc(100vw - 32px));
    max-height: calc(100vh - 48px); background: var(--card-background-color, #fff); color: var(--primary-text-color);
    box-shadow: 0 8px 32px rgba(0,0,0,.35); overflow: hidden; }
  dialog.editor[open] { display: flex; flex-direction: column; }
  dialog.editor::backdrop { background: rgba(0,0,0,.5); }
  @media (max-width: 600px) {
    dialog.editor { width: 100vw; max-width: 100vw; height: 100vh; height: 100dvh; max-height: 100dvh; border-radius: 0; margin: 0; }
  }
  .dlg-head { display: flex; align-items: center; gap: 4px; padding: 8px 12px; border-bottom: 1px solid var(--divider-color); flex: none; }
  .dlg-head h3 { flex: 1; margin: 0 4px; font-size: 18px; font-weight: 500; }
  .dlg-body { overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 18px; overscroll-behavior: contain; }
  .field { display: flex; flex-direction: column; gap: 4px; }
  .field span, .label { font-size: 13px; color: var(--secondary-text-color); font-weight: 500; }
  .field input, .search input, .times input { font: inherit; color: inherit; padding: 9px 12px; border-radius: 8px;
    border: 1px solid var(--divider-color); background: var(--secondary-background-color, transparent); }
  .field input { font-size: 16px; }
  .section { display: flex; flex-direction: column; gap: 8px; }
  .row-between { display: flex; align-items: center; justify-content: space-between; }
  .link { font: inherit; font-size: 13px; color: var(--primary-color); background: none; border: 0; padding: 0; cursor: pointer; }
  a.link { text-decoration: none; display: inline-block; margin-top: 4px; }
  .seg { display: inline-flex; align-self: flex-start; border: 1px solid var(--divider-color); border-radius: 18px; overflow: hidden; }
  .seg button { display: inline-flex; gap: 4px; align-items: center; padding: 7px 16px; border: 0; background: transparent; cursor: pointer; font-size: 14px; }
  .seg button + button { border-inline-start: 1px solid var(--divider-color); }
  .seg button[aria-checked="true"] { background: color-mix(in srgb, var(--primary-color) 20%, transparent); font-weight: 600; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .choice { padding: 6px 14px; border-radius: 16px; border: 1px solid var(--divider-color); background: transparent; cursor: pointer; font-size: 14px; }
  .choice[aria-checked="true"] { background: color-mix(in srgb, var(--primary-color) 20%, transparent); border-color: var(--primary-color); font-weight: 600; }
  .device { display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 12px; border-radius: 8px; cursor: pointer; text-align: start;
    border: 1px dashed var(--divider-color); background: transparent; color: var(--primary-color); font-size: 14px; }
  .device .dname { color: var(--primary-text-color); font-weight: 500; }
  .opt { display: flex; align-items: center; gap: 8px; min-height: 40px; }
  .summary { padding: 2px 0; }
  .opt input[type=range] { flex: 1; accent-color: var(--primary-color); }
  .grow, .spacer { flex: 1; min-width: 0; }
  .check { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
  .check input { width: 18px; height: 18px; accent-color: var(--primary-color); margin: 0; }
  .stepper { display: inline-flex; align-items: center; gap: 2px; margin-inline-start: auto; }
  .stepper b { min-width: 40px; text-align: center; font-size: 16px; }
  .warn, .error { display: flex; gap: 8px; align-items: flex-start; padding: 10px 12px; border-radius: 8px; font-size: 14px; }
  .warn { background: color-mix(in srgb, var(--warning-color, #ffa600) 16%, transparent); }
  .error { background: color-mix(in srgb, var(--error-color, #db4437) 14%, transparent); color: var(--error-color, #db4437); }
  .error.small { padding: 4px 8px; font-size: 13px; }
  .days { display: flex; flex-direction: column; }
  .day { border-bottom: 1px solid var(--divider-color); padding: 6px 0; }
  .day:last-child { border-bottom: 0; }
  .day-line { display: flex; align-items: center; gap: 8px; }
  .day-line .dname { width: 52px; flex: none; font-size: 14px; }
  dialog.editor[dir=ltr] .day-line .dname { width: 88px; } /* "Wednesday" */
  .ranges { flex: 1; display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
  .range { display: inline-flex; align-items: center; border-radius: 16px; background: color-mix(in srgb, var(--primary-color) 16%, transparent); }
  .range button { border: 0; background: transparent; cursor: pointer; padding: 5px 4px 5px 12px; font-size: 14px; font-variant-numeric: tabular-nums; }
  .range .x { padding: 4px 8px 4px 2px; display: inline-flex; color: var(--secondary-text-color); }
  .range .x .ic { width: 16px; height: 16px; }
  .add { display: inline-flex; align-items: center; gap: 2px; padding: 4px 10px 4px 6px; border-radius: 16px; font-size: 13px; cursor: pointer;
    border: 1px dashed var(--divider-color); background: transparent; color: var(--primary-color); }
  .add .ic { width: 16px; height: 16px; }
  .icon-space { width: 36px; flex: none; }
  .panel { margin: 8px 0 4px; padding: 12px; border-radius: 10px; background: var(--secondary-background-color, rgba(127,127,127,.1));
    display: flex; flex-direction: column; gap: 10px; }
  .times { display: flex; align-items: flex-end; gap: 8px; flex-wrap: wrap; }
  .times label { display: flex; flex-direction: column; gap: 2px; font-size: 12px; color: var(--secondary-text-color); }
  .times input { font-size: 16px; color: var(--primary-text-color); background: var(--card-background-color); width: 6.5em;
    text-align: center; font-variant-numeric: tabular-nums; }
  .actions { display: flex; gap: 8px; justify-content: flex-end; }
  .copy-days { display: flex; flex-wrap: wrap; gap: 6px 16px; }
  .picker-top { position: sticky; top: -16px; background: var(--card-background-color); padding: 4px 0 8px; z-index: 1; display: flex; flex-direction: column; gap: 8px; }
  .search { display: flex; align-items: center; gap: 8px; background: var(--card-background-color); }
  .picker-top .search { padding: 0; }
  .chips.types { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 2px; scrollbar-width: thin; }
  .chips.types .choice { white-space: nowrap; font-size: 13px; padding: 4px 12px; }
  .search input { flex: 1; font-size: 16px; }
  .search .ic { color: var(--secondary-text-color); }
  .picker-list { display: flex; flex-direction: column; }
  .area { font-size: 13px; font-weight: 600; color: var(--secondary-text-color); padding: 12px 4px 4px; }
  .pick { display: flex; align-items: center; gap: 8px; padding: 10px 8px; border: 0; border-radius: 8px; background: transparent; cursor: pointer; text-align: start; font-size: 15px; }
  .pick:hover { background: color-mix(in srgb, var(--primary-color) 8%, transparent); }
  .btn.danger-fill, .btn.danger-fill:hover { background: var(--error-color, #db4437); border-color: var(--error-color, #db4437); }
  .spinner { width: 14px; height: 14px; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin .8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

/** Seven thin bars, one per day, Sunday first; the time axis always runs left to right. */
function weekBarsHtml(week, lang) {
  const names = DAY_NAMES[lang];
  return `<div class="bars" dir="ltr">${DAYS.map((d, i) => `
    <div class="bar-row" title="${esc(names[i])}: ${esc(week.days[d].map(blockLabel).join(', ') || '—')}">
      <span class="bar-day">${esc(DAY_SHORT[lang][i])}</span>
      <span class="bar">${week.days[d].map((b) => `<i style="left:${(b.start / 14.4).toFixed(2)}%;width:${((b.end - b.start) / 14.4).toFixed(2)}%"></i>`).join('')}</span>
    </div>`).join('')}</div>`;
}

const SCHEDULE_STYLE = `
  .list { padding: 0 8px 8px; }
  .load-error { margin: 0 16px 8px; align-items: center; }
  .row { padding: 10px 8px; border-top: 1px solid var(--divider-color); border-radius: 8px; }
  .row:first-child { border-top: 0; }
  .row.editable { cursor: pointer; }
  .row.editable:hover { background: color-mix(in srgb, var(--primary-color) 6%, transparent); }
  .line { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .name { font-size: 15px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
  .spacer { flex: 1; }
  .state { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; }
  .state.on { color: var(--success-color, #43a047); font-weight: 500; }
  .state.idle { color: var(--warning-color, #ffa600); font-weight: 500; }
  .idle-bars { opacity: .45; }
  .when { margin: 2px 16px 0; }
  .bars { margin: 8px 16px 0; display: flex; flex-direction: column; gap: 3px; }
  .bar-row { display: flex; align-items: center; gap: 6px; }
  .bar-day { width: 16px; font-size: 10px; color: var(--secondary-text-color); text-align: center; flex: none; }
  .bar { position: relative; flex: 1; height: 5px; border-radius: 3px; background: color-mix(in srgb, var(--divider-color) 70%, transparent); overflow: hidden; }
  .bar i { position: absolute; top: 0; bottom: 0; background: var(--primary-color); border-radius: 3px; }
`;

// ---------------------------------------------------------------------------- schedule-helper-shabbat-card

/** What the calendar block shows, from findCalendar: Jewish Calendar values first, Hebcal's where it has none. */
export function calendarRows(states, cal, lang = 'en', now = new Date()) {
  const t = STRINGS[lang];
  const val = (id) => (id && usable(states[id]) ? String(states[id].state) : null);
  const when = (id, hebcalId) => {
    const v = val(id);
    if (v) {
      const d = new Date(v);
      if (!isNaN(d)) return formatWhen(d, now, lang);
    }
    return val(hebcalId);
  };
  const rows = [
    ['calHoliday', val(cal.holiday) || (cal.holiday ? null : val(cal.hebcal.event))],
    ['calParasha', val(cal.parasha) || val(cal.hebcal.parasha)],
    ['calCandles', when(cal.candleLighting, cal.hebcal.candleLighting)],
    ['calHavdalah', when(cal.havdalah, cal.hebcal.havdalah)],
  ].filter(([, v]) => v);
  return {
    date: val(cal.date) || val(cal.hebcal.date),
    inEffect: states[cal.issur]?.state === 'on' || states[cal.hebcal.isShabbat]?.state === 'True',
    rows: rows.map(([k, v]) => ({ label: t[k], value: v })),
  };
}

class ScheduleHelperShabbatCard extends CardBase {
  static getStubConfig() {
    return { modes: [...MODES], show_calendar: true };
  }

  static getConfigElement() {
    return document.createElement('schedule-helper-shabbat-card-editor');
  }

  setConfig(config) {
    if (config?.modes && !Array.isArray(config.modes)) throw new Error('modes must be a list');
    this._config = { modes: [...MODES], show_calendar: true, ...config };
    this._sig = null;
    this._autoSig = null; // the modes shown may have changed
    this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._loadLabels();
    else this._checkLabels();
    if (this._autoSig !== this._automationIds()) this._loadAuto();
    this._render();
    this._members?.render();
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    return 3 + this._config.modes.length * 3;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  connectedCallback() {
    this._clock = setInterval(() => this._render(), 60000);
    if (this._detached && this._hass) {
      // Back on the page: labels and automatic automations may have changed meanwhile.
      this._loadLabels();
      this._loadAuto();
    }
  }

  disconnectedCallback() {
    clearInterval(this._clock);
    this._members?.dlg?.close();
    this._detached = true;
  }

  /**
   * What makes the automatic automations worth reading again: the set of automations, and when each automatic one
   * last changed. Saving one in HA's editor reloads it (a new state object), so a start changed there shows up here.
   */
  _automationIds() {
    const states = this._hass?.states || {};
    const autos = Object.values(this._auto || {}).filter(Boolean).map((a) => `${a.entityId}@${states[a.entityId]?.last_updated}`);
    return [Object.keys(states).filter((id) => id.startsWith('automation.')).join('|'), ...autos].join('#');
  }

  /** Finds each mode's automatic automation. Its config is admin-only; others see it by alias alone. */
  async _loadAuto() {
    this._autoSig = this._automationIds();
    const auto = {};
    for (const mode of this._config.modes.filter((m) => MODES.includes(m))) {
      if (!this._isAdmin) {
        const hit = Object.values(this._hass.states).find((e) => e.entity_id.startsWith('automation.') && e.attributes?.friendly_name === AUTO_ALIAS[mode]);
        auto[mode] = hit ? { entityId: hit.entity_id, ours: true, config: null } : null;
      } else {
        auto[mode] = await findAuto(this._h, mode).catch(() => null);
        // An automatic automation from before 2.0.2 gets the restart catch-up, once, if nobody changed it by hand.
        this._upgraded ??= new Set();
        if (auto[mode] && !this._upgraded.has(mode)) {
          this._upgraded.add(mode);
          const done = await upgradeAuto(this._h, mode, auto[mode]).catch((err) => console.warn('schedule-helper-card: upgrade', err));
          if (done) auto[mode] = await findAuto(this._h, mode).catch(() => auto[mode]);
        }
      }
    }
    this._auto = auto;
    this._autoSig = this._automationIds(); // now with the automatic ones' own times
    this._autoLoaded = true;
    this._render(true);
  }

  _render(force = false) {
    if (!this._config || !this._hass) return;
    const states = this._hass.states;
    const reg = this._registry();
    const cal = findCalendar(states);
    const modes = this._config.modes.filter((m) => MODES.includes(m));
    const members = Object.fromEntries(modes.map((m) => [m, {
      automations: modeMembers(states, reg, m).filter((e) => !isAutoAlias(e.attributes?.friendly_name))
        .map((e) => ({ ...e, state: this._stateOf(e.entity_id) })),
      schedules: modeMembers(states, reg, m, 'schedule'),
    }]));
    const calIds = [cal.issur, cal.candleLighting, cal.havdalah, cal.date, cal.parasha, cal.holiday, ...Object.values(cal.hebcal)].filter(Boolean);
    const sig = JSON.stringify([
      this._lang, this._isAdmin, this._config, new Date().toDateString(), new Date().getHours(), this._busy,
      calIds.map((id) => states[id]?.state), this._labels?.length, this._auto, this._start,
      this._startEdit && [this._startEdit.mode, this._startEdit.kind, this._startEdit.error], // not what is typed
      Object.values(this._auto || {}).map((a) => a && states[a.entityId]?.state),
      modes.map((m) => [members[m].automations.map((e) => [e.entity_id, e.state]), members[m].schedules.map((e) => [e.entity_id, e.last_updated])]),
    ]);
    if (!force && sig === this._sig) return;
    this._sig = sig;
    const root = this._root();
    if (!root.querySelector('ha-card')) {
      root.innerHTML = `<style>${BASE_STYLE}${SHABBAT_STYLE}${EDITOR_STYLE}</style><ha-card><div class="body"></div></ha-card><div class="toast" hidden role="status"></div>`;
      root.addEventListener('click', (e) => this._onClick(e));
      root.addEventListener('change', (e) => this._onChange(e));
      root.addEventListener('input', (e) => {
        const f = e.target.dataset?.startField;
        if (f && this._startEdit) this._startEdit[f] = e.target.value; // kept across redraws while typing
      });
      root.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.dataset?.startField) root.querySelector('[data-act=startSave]')?.click();
      });
    }
    const t = this._t;
    const focusId = root.activeElement?.id;
    this._paint(
      this._config.title !== '' ? `<div class="header"><h2>${esc(this._config.title ?? t.shabbatAndChag)}</h2></div>` : '',
      `${this._config.show_calendar !== false ? this._calendarHtml(states, cal) : ''}
      ${modes.map((m) => this._modeHtml(m, members[m], cal)).join('')}`,
    );
    if (focusId) root.getElementById?.(focusId)?.focus();
  }

  _calendarHtml(states, cal) {
    const c = calendarRows(states, cal, this._lang);
    if (!c.date && !c.rows.length) return '';
    return `<div class="cal">
      <div class="cal-date">${esc(c.date || '')}${c.inEffect ? `<span class="chip shabbat">${esc(this._t.calInEffect)}</span>` : ''}</div>
      ${c.rows.map((r) => `<div class="cal-row"><span class="muted">${esc(r.label)}</span><span>${esc(r.value)}</span></div>`).join('')}
    </div>`;
  }

  _modeHtml(mode, { automations, schedules }, cal) {
    const t = this._t;
    const name = t.modeName[mode];
    const state = modeState(automations);
    const onCount = automations.filter((a) => a.state === 'on').length;
    const status = state === 'empty' ? t.modeEmpty : state === 'on' ? t.modeOn(automations.length) : state === 'off' ? t.modeOff : t.modePartial(onCount, automations.length);
    const busy = this._busy === mode;
    const now = new Date();
    return `<section class="mode ${mode === 'שבת' ? 'shabbat' : 'chag'} ${state}">
      <div class="mode-head">
        <div class="grow"><div class="mode-title">${esc(t.modeTitle(name))}</div><div class="muted small">${esc(status)}</div></div>
        ${switchHtml({ checked: state === 'on', partial: state === 'partial', disabled: state === 'empty' || busy, label: t.modeSwitch(name), attrs: `data-master="${esc(mode)}" id="master-${esc(mode)}"` })}
      </div>
      ${automations.length ? `<div class="members">${automations.map((a) => `
        <div class="member"><span class="grow">${esc(entityName(a))}</span>
          ${switchHtml({ checked: a.state === 'on', label: entityName(a), attrs: `data-auto="${esc(a.entity_id)}" id="member-${esc(a.entity_id)}"` })}</div>`).join('')}</div>` : ''}
      ${schedules.length ? `<div class="scheds"><div class="label muted small">${esc(t.scheduleList)}</div>${schedules.map((s) => {
        const next = s.attributes?.next_event ? new Date(s.attributes.next_event) : null;
        const on = s.state === 'on';
        return `<div class="sched"><span class="dot ${on ? 'on' : ''}"></span><span class="grow">${esc(entityName(s))}</span>
          ${next && !isNaN(next) ? `<span class="muted small">${esc(`${on ? t.ends : t.starts} ${formatWhen(next, now, this._lang)}`)}</span>` : ''}</div>`;
      }).join('')}</div>` : ''}
      ${this._autoHtml(mode, cal)}
      ${this._isAdmin ? `<div class="mode-foot"><button class="btn" data-act="members" data-mode="${esc(mode)}">${esc(t.chooseAutomations)}</button></div>` : ''}
    </section>`;
  }

  /** The start of a mode: what its automation says, or what will be used when it is created. */
  _currentStart(mode) {
    const auto = this._auto?.[mode];
    return (auto?.config && parseAutoStart(auto.config)) || this._start?.[mode] || DEFAULT_AUTO_START;
  }

  _autoHtml(mode, cal) {
    const t = this._t;
    const auto = this._auto?.[mode];
    const on = !!auto && this._hass.states[auto.entityId]?.state === 'on';
    const unavailable = !auto && !autoAvailable(mode, cal);
    const disabled = !this._isAdmin || !this._autoLoaded || this._busy === `auto-${mode}` || unavailable;
    const start = this._currentStart(mode);
    const canEditStart = this._isAdmin && this._autoLoaded && !unavailable && (!auto || (auto.ours && parseAutoStart(auto.config)));
    const hint = unavailable ? (mode === 'שבת' ? t.errNoCalendar : t.errNoJewishCalendar)
      : auto && !auto.ours ? t.autoShabbatNotOurs : t.autoHint(mode);
    // Jewish Calendar is part of Home Assistant, but has to be added once; an admin can do it from here.
    const addCalendar = unavailable && this._isAdmin && !cal?.issur
      ? `<div class="small"><a class="link" href="${ADD_JEWISH_CALENDAR}" target="_top">${esc(t.addJewishCalendar)}</a></div>` : '';
    return `<div class="auto">
      <div class="grow"><div>${esc(t.autoTitle[mode])}</div>
        <div class="muted small">${esc(hint)}</div>
        ${addCalendar}
        ${canEditStart && this._startEdit?.mode !== mode ? `<div class="small start-line">${esc(t.startLabel)}: ${esc(startText(start, this._lang))} ·
          <button class="link" data-act="startEdit" data-mode="${esc(mode)}">${esc(t.change)}</button></div>` : ''}</div>
      ${switchHtml({ checked: on, disabled, label: t.autoTitle[mode], attrs: `data-automode="${esc(mode)}" id="auto-${esc(mode)}"` })}
    </div>
    ${this._startEdit?.mode === mode ? this._startPanelHtml(mode, cal) : ''}`;
  }

  _startPanelHtml(mode, cal) {
    const t = this._t;
    const e = this._startEdit;
    const relative = !!autoStartTrigger(mode, { hoursBefore: 1 }, cal);
    return `<div class="panel start-panel" role="group" aria-label="${esc(t.startLabel)}">
      <label class="check"><input type="radio" name="start-${esc(mode)}" value="at" data-start-kind ${e.kind === 'at' ? 'checked' : ''}>
        <span>${esc(t.startAtLabel)}</span>
        <input type="text" id="start-at" data-start-field="at" inputmode="numeric" maxlength="5" placeholder="HH:MM" value="${esc(e.at)}" dir="ltr"></label>
      <label class="check ${relative ? '' : 'off'}"><input type="radio" name="start-${esc(mode)}" value="hoursBefore" data-start-kind
        ${e.kind === 'hoursBefore' ? 'checked' : ''} ${relative ? '' : 'disabled'}>
        <input type="text" id="start-hb" data-start-field="hoursBefore" inputmode="decimal" maxlength="4" value="${esc(e.hoursBefore)}" dir="ltr" ${relative ? '' : 'disabled'}>
        <span>${esc(t.hoursBeforeLabel)}</span></label>
      ${relative ? '' : `<div class="muted small">${esc(t.errNoCandleSensor)}</div>`}
      ${e.error ? `<div class="error small" role="alert">${esc(e.error)}</div>` : ''}
      <div class="actions"><button class="btn" data-act="startCancel">${esc(t.cancel)}</button>
        <button class="btn primary" data-act="startSave" data-mode="${esc(mode)}" ${this._busy ? 'disabled' : ''}>${esc(t.save)}</button></div>
    </div>`;
  }

  async _saveStart(mode) {
    const t = this._t;
    const e = this._startEdit;
    let start;
    if (e.kind === 'hoursBefore') {
      const n = Number(String(e.hoursBefore).replace(',', '.'));
      if (!(n >= 0.5 && n <= 12)) return this._startError(t.errHours);
      start = { hoursBefore: Math.round(n * 2) / 2 };
    } else {
      const at = parseTimeInput(e.at);
      if (at == null || at >= 1440) return this._startError(t.errTime);
      start = { at: hm(at) };
    }
    const auto = this._auto?.[mode];
    if (!auto) {
      this._start = { ...this._start, [mode]: start }; // used when the automation is created
      this._startEdit = null;
      return this._render(true);
    }
    this._busy = `auto-${mode}`;
    this._render(true);
    const ok = await this._run(async () => { await setAutoStart(this._h, mode, start); return true; });
    this._busy = null;
    if (ok) this._startEdit = null;
    await this._loadAuto();
  }

  _startError(message) {
    this._startEdit.error = message;
    this._render(true);
  }

  _onClick(e) {
    const el = e.target.closest?.('[data-act]');
    const act = el?.dataset.act;
    if (act === 'members' && !this._members) {
      this._members = new MembershipDialog(this, el.dataset.mode);
      this._members.open();
    } else if (act === 'startEdit') {
      const start = this._currentStart(el.dataset.mode);
      this._startEdit = {
        mode: el.dataset.mode,
        kind: start.hoursBefore != null ? 'hoursBefore' : 'at',
        at: start.at ?? DEFAULT_AUTO_START.at,
        hoursBefore: String(start.hoursBefore ?? 3),
      };
      this._render(true);
      this._root().getElementById?.(this._startEdit.kind === 'at' ? 'start-at' : 'start-hb')?.focus();
    } else if (act === 'startCancel') {
      this._startEdit = null;
      this._render(true);
    } else if (act === 'startSave') this._saveStart(el.dataset.mode);
  }

  async _onChange(e) {
    const d = e.target.dataset || {};
    const on = e.target.checked;
    if (d.master) {
      const ids = modeMembers(this._hass.states, this._registry(), d.master)
        .filter((m) => !isAutoAlias(m.attributes?.friendly_name)).map((m) => m.entity_id);
      this._expect(ids, on); // before the busy redraw, so the switch stays where it was flipped to
      this._busy = d.master;
      this._render(true);
      await this._flip(ids, on, () => setModeEnabled(this._h, this._registry(), d.master, on));
      this._busy = null;
      this._render(true);
    } else if (d.auto) {
      await this._flip([d.auto], on, () => setAutomationEnabled(this._h, d.auto, on));
      this._render(true);
    } else if (d.automode) {
      const mode = d.automode;
      this._busy = `auto-${mode}`;
      this._render(true);
      await this._run(() => (on ? enableAuto(this._h, mode, { start: this._currentStart(mode) }) : disableAuto(this._h, mode)));
      this._busy = null;
      await this._loadAuto();
      this._loadLabels();
    } else if (d.startKind !== undefined && this._startEdit) {
      this._startEdit.kind = e.target.value;
      this._startEdit.error = null;
      this._render(true);
    }
  }
}

/** "Choose automations": a checklist that writes the mode's label to an automation and the schedules it follows. */
class MembershipDialog {
  constructor(card, mode) {
    this.card = card;
    this.mode = mode;
    this.busy = new Set();
    this.query = '';
  }

  open() {
    const dlg = document.createElement('dialog');
    dlg.className = 'editor';
    dlg.setAttribute('aria-labelledby', 'dlg-title');
    this.card._root().appendChild(dlg);
    this.dlg = dlg;
    dlg.addEventListener('click', (e) => {
      if (e.target.closest?.('[data-act=close]')) dlg.close();
    });
    dlg.addEventListener('input', (e) => {
      if (e.target.id === 'q') {
        this.query = e.target.value;
        this.renderList();
      }
    });
    dlg.addEventListener('change', (e) => this.toggle(e.target));
    dlg.addEventListener('close', () => {
      dlg.remove();
      this.card._members = null;
    });
    const t = this.card._t;
    dlg.setAttribute('dir', this.card._dirAttr());
    dlg.innerHTML = `<div class="dlg-head"><button class="icon-btn" data-act="close" aria-label="${esc(t.close)}">${icon('close')}</button>
      <h3 id="dlg-title">${esc(t.automationsIn(t.modeName[this.mode]))}</h3></div>
      <div class="dlg-body"><label class="search"><input type="search" id="q" placeholder="${esc(t.searchAutomation)}" aria-label="${esc(t.searchAutomation)}"></label>
      <div class="muted small">${esc(t.selfExcluded)}</div><div class="checklist"></div></div>`;
    this.renderList();
    dlg.showModal();
  }

  render() {
    if (this.dlg) this.renderList();
  }

  renderList() {
    const t = this.card._t;
    const states = this.card._hass.states;
    const reg = this.card._registry();
    const members = new Set(modeMembers(states, reg, this.mode).map((e) => e.entity_id));
    const sig = JSON.stringify([this.query, [...this.busy], [...members],
      Object.values(states).filter((e) => e.entity_id.startsWith('automation.')).map((e) => [e.entity_id, entityName(e)])]);
    if (sig === this._sig) return; // hass changes many times a second; a rebuilt list swallows clicks
    this._sig = sig;
    const q = this.query.trim().toLowerCase();
    const autos = Object.values(states)
      .filter((e) => e.entity_id.startsWith('automation.') && !isAutoAlias(e.attributes?.friendly_name))
      .filter((e) => !q || entityName(e).toLowerCase().includes(q) || e.entity_id.includes(q))
      .sort((a, b) => entityName(a).localeCompare(entityName(b), this.card._lang));
    const list = this.dlg.querySelector('.checklist');
    const focusId = this.card._root().activeElement?.dataset?.id;
    list.innerHTML = autos.length ? autos.map((a) => `
      <label class="check-row"><input type="checkbox" data-id="${esc(a.entity_id)}" ${members.has(a.entity_id) ? 'checked' : ''} ${this.busy.has(a.entity_id) ? 'disabled' : ''}>
        <span class="grow"><span>${esc(entityName(a))}</span><span class="muted small" dir="ltr">${esc(a.entity_id)}</span></span>
        ${this.busy.has(a.entity_id) ? '<span class="spinner"></span>' : ''}</label>`).join('') : `<div class="muted">${esc(t.noAutomations)}</div>`;
    const again = this.refocus && !this.busy.has(this.refocus) ? this.refocus : focusId;
    if (again) list.querySelector(`[data-id="${CSS.escape(again)}"]`)?.focus();
    if (again === this.refocus) this.refocus = null;
  }

  async toggle(input) {
    const id = input.dataset?.id;
    if (!id) return;
    const member = input.checked;
    const h = this.card._h;
    this.busy.add(id);
    this.refocus = id; // the box is disabled while busy; focus comes back to it after
    this.renderList();
    try {
      // The automation and the schedules it follows move together; a schedule another member still follows stays.
      await setAutomationInMode(h, this.mode, id, member);
      await this.card._loadLabels();
    } catch (err) {
      this.card._toast(errorText(err));
    } finally {
      this.busy.delete(id);
      this.renderList();
    }
  }
}

const SHABBAT_STYLE = `
  .cal { margin: 0 16px 8px; padding: 12px 14px; border-radius: 10px; background: color-mix(in srgb, #ffa000 10%, transparent); }
  .cal-date { font-weight: 600; font-size: 15px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 4px; }
  .cal-row { display: flex; gap: 12px; font-size: 14px; padding: 2px 0; }
  .cal-row .muted { min-width: 96px; }
  .mode { margin: 8px 16px 12px; padding: 12px 0 4px; border-top: 1px solid var(--divider-color); }
  .mode-head { display: flex; align-items: center; gap: 10px; }
  .mode-title { font-size: 17px; font-weight: 600; }
  .grow { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .members, .scheds { margin-top: 8px; }
  .member, .auto { display: flex; align-items: center; gap: 8px; min-height: 36px; }
  .sched { display: flex; align-items: center; gap: 8px; min-height: 26px; font-size: 14px; }
  .sched .grow { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .auto { margin-top: 8px; padding: 8px 10px 8px 12px; border-radius: 10px; background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .start-line { margin-top: 4px; color: var(--secondary-text-color); }
  .start-panel { margin: 8px 0 0; }
  .start-panel .check { flex-wrap: wrap; }
  .start-panel .check.off { opacity: .5; }
  .start-panel input[type=text] { font: inherit; width: 5.5em; padding: 6px 8px; border-radius: 8px; border: 1px solid var(--divider-color);
    background: var(--card-background-color); color: var(--primary-text-color); text-align: center; font-variant-numeric: tabular-nums; }
  .mode-foot { display: flex; justify-content: flex-end; margin-top: 8px; }
  .checklist { display: flex; flex-direction: column; }
  .check-row { display: flex; align-items: center; gap: 12px; padding: 8px 4px; border-bottom: 1px solid var(--divider-color); cursor: pointer; }
  .check-row input { width: 18px; height: 18px; margin: 0; accent-color: var(--primary-color); flex: none; }
  .check-row .grow span:first-child { font-size: 15px; }
`;

// ---------------------------------------------------------------------------- visual config editors

/** Shared by both editors: HA echoes our own config-changed back through setConfig; re-rendering then would steal focus. */
class EditorBase extends Base {
  setConfig(config) {
    if (this._emitted && JSON.stringify(config) === this._emitted) return;
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) {
      this._render();
      this._loadDash();
    }
  }

  get _t() {
    return STRINGS[langOf(this._hass)];
  }

  // ---- "Create the Schedule Helper dashboard", shared by both editors ----

  async _loadDash() {
    if (this._hass?.user?.is_admin === false) return;
    try {
      this._dash = { existing: await findDashboard(this._hass) };
    } catch {
      this._dash = null; // no dashboards API here (e.g. YAML mode): no section
    }
    this._renderDash();
  }

  async _createDash() {
    this._dash = { ...this._dash, busy: true, error: null };
    this._renderDash();
    try {
      const r = await createDashboard(this._hass);
      this._dash = { existing: r, created: r.created };
    } catch (err) {
      this._dash = { ...this._dash, busy: false, error: errorText(err) };
    }
    this._renderDash();
  }

  _renderDash() {
    const el = this.shadowRoot?.querySelector('[data-dash]');
    if (!el) return;
    const t = this._t;
    const d = this._dash;
    if (!d || this._hass?.user?.is_admin === false) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    const href = `/${d.existing?.url_path || DASHBOARD.url_path}`;
    el.innerHTML = `<h3>${esc(t.edDashboard)}</h3>
      ${d.existing
        ? `<p class="hint">${esc(d.created ? t.edDashboardCreated : t.edDashboardExists)} <a href="${esc(href)}" target="_top">${esc(t.edDashboardOpen)}</a></p>`
        : `<p class="hint">${esc(t.edDashboardHint)}</p>
           <div><button class="make" data-act="makeDash" ${d.busy ? 'disabled' : ''}>${esc(t.edDashboardCreate)}</button></div>`}
      ${d.error ? `<p class="err" role="alert">${esc(d.error)}</p>` : ''}`;
    el.querySelector('[data-act=makeDash]')?.addEventListener('click', () => this._createDash());
  }

  // Empty lists mean "the default", except a whitelist (`entities: []` shows nothing) and `modes`. An empty string is
  // dropped only by the field that was cleared (`_field`), so a YAML `title: ''` (no title) survives other edits.
  _emit(config) {
    for (const [k, v] of Object.entries(config)) {
      if (v === undefined || (Array.isArray(v) && !v.length && k !== 'modes' && k !== 'entities')) delete config[k];
    }
    this._config = config;
    this._emitted = JSON.stringify(config);
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
  }

  /** Text fields and selects: a cleared one goes back to its default. */
  _fields(root) {
    root.querySelectorAll('[data-key]').forEach((el) => el.addEventListener('change', () => {
      const config = { ...this._config, [el.dataset.key]: el.value.trim() };
      if (config[el.dataset.key] === '') delete config[el.dataset.key];
      this._emit(config);
    }));
  }

  _shell(inner) {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${CONFIG_EDITOR_STYLE}</style><div class="ed" dir="${langOf(this._hass) === 'he' ? 'rtl' : 'ltr'}">
      <section data-dash class="dash" hidden></section>${inner}</div>`;
    this._renderDash();
    return this.shadowRoot;
  }
}

class ScheduleHelperCardEditor extends EditorBase {
  set hass(hass) {
    const first = !this._hass;
    super.hass = hass;
    if (first) {
      // What "Show Shabbat and chag" means when it is not set: whether the home has their labels.
      hass.callWS({ type: 'config/label_registry/list' }).then((labels) => {
        this._modesInHome = hasModeLabels(labels);
        this._render();
      }, () => {});
    }
  }

  get hass() {
    return this._hass;
  }

  _render() {
    if (!this._config) return;
    const t = this._t;
    const c = this._config;
    const showModes = typeof c.show_modes === 'boolean' ? c.show_modes : !!this._modesInHome;
    const schedules = Object.values(this._hass?.states || {})
      .filter((e) => e.entity_id.startsWith('schedule.'))
      .sort((a, b) => entityName(a).localeCompare(entityName(b), langOf(this._hass)));
    const whitelist = Array.isArray(c.entities);
    const shown = (id) => (whitelist ? c.entities.includes(id) : !(c.hide_entities || []).includes(id));
    const root = this._shell(`
      <section>
        <h3>${esc(t.edGeneral)}</h3>
        <label class="field"><span>${esc(t.edTitle)}</span><input data-key="title" value="${esc(c.title ?? '')}" placeholder="${esc(t.schedules)}"></label>
        <label class="field"><span>${esc(t.edHeight)}</span><input data-key="height" value="${esc(c.height ?? '')}" placeholder="${esc(t.edHeightHint)}"></label>
        <label class="chk"><input type="checkbox" data-bool="show_add" ${c.show_add !== false ? 'checked' : ''}><span>${esc(t.edShowAdd)}</span></label>
        <label class="chk"><input type="checkbox" data-bool="show_modes" ${showModes ? 'checked' : ''}><span>${esc(t.edShowModes)}</span></label>
        <p class="hint">${esc(t.edShowModesHint)}</p>
        ${showModes ? `<label class="field"><span>${esc(t.edModeFilter)}</span><select data-key="mode">
          <option value="" ${!c.mode ? 'selected' : ''}>${esc(t.edAllSchedules)}</option>
          ${MODES.map((m) => `<option value="${esc(m)}" ${c.mode === m ? 'selected' : ''}>${esc(t.edOnlyMode(t.modeName[m]))}</option>`).join('')}
        </select></label>` : ''}
      </section>
      <section>
        <h3>${esc(t.edDeviceDomains)}</h3>
        <p class="hint">${esc(t.edDeviceDomainsHint)}</p>
        <div class="types">${PICKABLE_DOMAINS.map((d) => `<label class="chk"><input type="checkbox" data-domain="${esc(d)}"
          ${!c.device_domains?.length || c.device_domains.includes(d) ? 'checked' : ''}><span>${esc(t.domainName[d])}</span></label>`).join('')}</div>
      </section>
      <section>
        <h3>${esc(t.edSchedules)}</h3>
        <p class="hint">${esc(t.edSchedulesHint)}</p>
        <div class="actions"><button data-all>${esc(t.edAll)}</button><button data-none>${esc(t.edNone)}</button></div>
        <div class="list">${schedules.map((e) => `<label class="chk row"><input type="checkbox" data-schedule="${esc(e.entity_id)}" ${shown(e.entity_id) ? 'checked' : ''}>
          <span>${esc(entityName(e))}</span><small dir="ltr">${esc(e.entity_id)}</small></label>`).join('') || `<div class="hint">${esc(t.noSchedules)}</div>`}</div>
      </section>`);
    this._fields(root);
    root.querySelectorAll('[data-bool]').forEach((el) => el.addEventListener('change', () => {
      const config = { ...this._config, [el.dataset.bool]: el.checked };
      if (el.dataset.bool === 'show_modes' && !el.checked) delete config.mode;
      // Store only what differs from the default: show_add is on; show_modes follows the home's labels.
      const byDefault = el.dataset.bool === 'show_add' ? true : !!this._modesInHome;
      if (el.checked === byDefault) delete config[el.dataset.bool];
      this._emit(config);
      if (el.dataset.bool === 'show_modes') this._render();
    }));
    root.querySelector('.list').addEventListener('change', () => this._saveSchedules());
    root.querySelector('.types').addEventListener('change', (e) => {
      const ticked = [...root.querySelectorAll('[data-domain]')].filter((b) => b.checked).map((b) => b.dataset.domain);
      // No type at all would be stored as "all types": keep the last one ticked instead.
      if (!ticked.length) {
        e.target.checked = true;
        return;
      }
      const config = { ...this._config, device_domains: ticked };
      if (ticked.length === PICKABLE_DOMAINS.length) delete config.device_domains; // all is the default
      this._emit(config);
    });
    root.querySelector('[data-all]').addEventListener('click', () => this._setAll(true));
    root.querySelector('[data-none]').addEventListener('click', () => this._setAll(false));
  }

  _setAll(on) {
    this.shadowRoot.querySelectorAll('[data-schedule]').forEach((b) => (b.checked = on));
    this._saveSchedules();
  }

  _saveSchedules() {
    const boxes = [...this.shadowRoot.querySelectorAll('[data-schedule]')];
    const config = { ...this._config };
    if (Array.isArray(config.entities)) config.entities = boxes.filter((b) => b.checked).map((b) => b.dataset.schedule);
    else config.hide_entities = boxes.filter((b) => !b.checked).map((b) => b.dataset.schedule);
    this._emit(config);
  }
}

class ScheduleHelperShabbatCardEditor extends EditorBase {
  _render() {
    if (!this._config) return;
    const t = this._t;
    const c = this._config;
    const modes = c.modes || MODES;
    const root = this._shell(`
      <section>
        <h3>${esc(t.edGeneral)}</h3>
        <label class="field"><span>${esc(t.edTitle)}</span><input data-key="title" value="${esc(c.title ?? '')}" placeholder="${esc(t.shabbatAndChag)}"></label>
        <label class="field"><span>${esc(t.edHeight)}</span><input data-key="height" value="${esc(c.height ?? '')}" placeholder="${esc(t.edHeightHint)}"></label>
        <label class="chk"><input type="checkbox" data-bool="show_calendar" ${c.show_calendar !== false ? 'checked' : ''}><span>${esc(t.edShowCalendar)}</span></label>
      </section>
      <section>
        <h3>${esc(t.edModes)}</h3>
        ${MODES.map((m) => `<label class="chk"><input type="checkbox" data-mode="${esc(m)}" ${modes.includes(m) ? 'checked' : ''}><span>${esc(t.modeTitle(t.modeName[m]))}</span></label>`).join('')}
      </section>`);
    this._fields(root);
    root.querySelector('[data-bool]').addEventListener('change', (e) => {
      const config = { ...this._config, show_calendar: e.target.checked };
      if (e.target.checked) delete config.show_calendar;
      this._emit(config);
    });
    root.querySelectorAll('[data-mode]').forEach((el) => el.addEventListener('change', () => {
      const chosen = [...root.querySelectorAll('[data-mode]')].filter((b) => b.checked).map((b) => b.dataset.mode);
      this._emit({ ...this._config, modes: chosen });
    }));
  }
}

const CONFIG_EDITOR_STYLE = `
  .ed { display: flex; flex-direction: column; gap: 18px; color: var(--primary-text-color); font-size: 14px; }
  section { display: flex; flex-direction: column; gap: 8px; }
  h3 { margin: 0; font-size: 15px; font-weight: 600; }
  .hint, small { color: var(--secondary-text-color); font-size: 12px; margin: 0; }
  .field { display: flex; flex-direction: column; gap: 4px; }
  .field span { font-size: 12px; color: var(--secondary-text-color); }
  .field input, .field select { font: inherit; color: inherit; padding: 9px 12px; border-radius: 8px; border: 1px solid var(--divider-color);
    background: var(--card-background-color, transparent); }
  .chk { display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .chk input { width: 16px; height: 16px; margin: 0; accent-color: var(--primary-color); flex: none; }
  .chk span { flex: 1; min-width: 0; }
  .list { display: flex; flex-direction: column; max-height: 280px; overflow-y: auto; border: 1px solid var(--divider-color); border-radius: 10px; }
  .row { padding: 7px 10px; border-bottom: 1px solid var(--divider-color); }
  .row:last-child { border-bottom: 0; }
  .dash { padding: 12px; border-radius: 10px; background: color-mix(in srgb, var(--primary-color) 8%, transparent); }
  .make { font: inherit; font-size: 14px; font-weight: 500; padding: 7px 14px; border-radius: 18px; cursor: pointer;
    border: 0; background: var(--primary-color); color: var(--text-primary-color, #fff); }
  .make:disabled { opacity: .5; cursor: default; }
  .hint a { color: var(--primary-color); }
  .err { color: var(--error-color, #db4437); font-size: 13px; margin: 0; }
  .types { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px 12px; }
  .actions { display: flex; gap: 12px; }
  .actions button { font: inherit; font-size: 12px; color: var(--primary-color); background: none; border: 0; padding: 0; cursor: pointer; }
`;

export { ScheduleHelperCardEditor, ScheduleHelperShabbatCardEditor };

export { ScheduleHelperCard, ScheduleHelperShabbatCard, CardBase };

if (typeof customElements !== 'undefined') {
  console.info(`%c SCHEDULE-HELPER-CARD %c ${VERSION} `, 'background:#03a9f4;color:#fff;font-weight:600', 'background:#333;color:#fff');
  const define = (name, cls) => {
    if (!customElements.get(name)) customElements.define(name, cls);
  };
  define('schedule-helper-card', ScheduleHelperCard);
  define('schedule-helper-shabbat-card', ScheduleHelperShabbatCard);
  define('schedule-helper-card-editor', ScheduleHelperCardEditor);
  define('schedule-helper-shabbat-card-editor', ScheduleHelperShabbatCardEditor);
  // The names before 2.0, so dashboards made with them keep working. Not offered in the card picker.
  define('beit-schedule-card', class extends ScheduleHelperCard {});
  define('beit-shabbat-card', class extends ScheduleHelperShabbatCard {});
  window.customCards = window.customCards || [];
  if (!window.customCards.some((c) => c.type === 'schedule-helper-card')) {
    window.customCards.push({
      type: 'schedule-helper-card',
      name: 'Schedule Helper Card',
      description: 'Weekly schedules for any device, in any home; optional Shabbat and Jewish holiday modes. תזמון שבועי לכל מכשיר.',
      preview: true,
    });
  }
  if (!window.customCards.some((c) => c.type === 'schedule-helper-shabbat-card')) {
    window.customCards.push({
      type: 'schedule-helper-shabbat-card',
      name: 'Schedule Helper — Shabbat & Jewish holidays (שבת וחג)',
      description: 'Optional: Shabbat and Jewish holiday (chag) modes, automatic Shabbat and chag, and the times. מצבי שבת וחג.',
      preview: true,
    });
  }
}
