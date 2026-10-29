/*
 * md3-cards — Material 3 style Lovelace cards for Home Assistant (own implementation, no dependencies).
 * Built from src/*.js by tools/build.sh — edit the parts, not dist/md3-cards.js.
 */
const MD3_VERSION = "2.14.0";

const css = (strings, ...v) =>
  strings.reduce((a, s, i) => a + s + (v[i] ?? ""), "");

const TOKENS = css`
  :host {
    --md3-surface: var(
      --md-sys-color-surface-container,
      var(--card-background-color, #1e1e1e)
    );
    --md3-surface-high: var(
      --md-sys-color-surface-container-high,
      var(--secondary-background-color, #2a2a2a)
    );
    --md3-surface-highest: var(--md-sys-color-surface-container-highest, #333);
    --md3-on-surface: var(
      --md-sys-color-on-surface,
      var(--primary-text-color, #fff)
    );
    --md3-on-surface-variant: var(
      --md-sys-color-on-surface-variant,
      var(--secondary-text-color, #aaa)
    );
    --md3-primary: var(--md-sys-color-primary, var(--primary-color, #8ab4f8));
    --md3-on-primary: var(--md-sys-color-on-primary, #fff);
    --md3-primary-container: var(--md-sys-color-primary-container, #3b4a6b);
    --md3-on-primary-container: var(--md-sys-color-on-primary-container, #fff);
    --md3-secondary-container: var(--md-sys-color-secondary-container, #3a4256);
    --md3-on-secondary-container: var(
      --md-sys-color-on-secondary-container,
      #fff
    );
    --md3-error: var(--md-sys-color-error, var(--error-color, #f2b8b5));
    --md3-error-container: var(--md-sys-color-error-container, #601410);
    --md3-radius: var(--ha-card-border-radius, 28px);
    display: block;
  }
  ha-card {
    background: var(--md3-bg, var(--md3-surface));
    border-radius: var(--md3-radius);
    color: var(--md3-fg, var(--md3-on-surface));
    box-sizing: border-box;
    overflow: hidden;
    font-family: var(
      --ha-font-family-body,
      var(--paper-font-body1_-_font-family, Roboto, sans-serif)
    );
  }
  .title {
    font-weight: 600;
    font-size: 14px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-word;
  }
  .sub {
    font-size: 12px;
    color: var(--md3-on-surface-variant);
  }
  button {
    font: inherit;
    color: inherit;
    cursor: pointer;
    border: 0;
    background: none;
  }
  .icon-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--md3-surface-high);
    color: var(--md3-on-surface);
  }
  .icon-btn:active {
    transform: scale(0.94);
  }
  .chip {
    padding: 8px 14px;
    border-radius: 999px;
    background: var(--md3-surface-high);
    font-size: 13px;
    font-weight: 500;
  }
  .chip.on {
    background: var(--md3-primary-container);
    color: var(--md3-on-primary-container);
  }
`;

/* ------------------------------------------------------------------ helpers */
function fire(node, type, detail) {
  node.dispatchEvent(
    new CustomEvent(type, { detail, bubbles: true, composed: true }),
  );
}
function moreInfo(node, entityId) {
  const target = document.querySelector("home-assistant") || node;
  target.dispatchEvent(
    new CustomEvent("hass-more-info", {
      detail: { entityId },
      bubbles: true,
      composed: true,
    }),
  );
}
const domainOf = (e) => (e || "").split(".")[0];
const fmtRemaining = (m, short = false) => {
  if (!(m > 0)) return "";
  const h = Math.floor(m / 60),
    min = m % 60,
    mins = short ? `${min} Min.` : `${min} ${min === 1 ? "Minute" : "Minuten"}`;
  return `Noch ${h ? (min ? `${h} h ${mins}` : `${h} h`) : mins}`;
};
const num = (v, d = 0) => (isFinite(parseFloat(v)) ? parseFloat(v) : d);
const haptic = () => {
  try {
    navigator.vibrate && navigator.vibrate(30);
  } catch (_) {
    /* ignore */
  }
};
const esc = (t) =>
  String(t ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

/** "yellow" -> var(--yellow-color); "#fff" / "var(...)" / "rgb(...)" pass through. */
function colorValue(c) {
  if (!c) return "";
  const s = String(c).trim();
  if (/^(#|rgb|hsl|var\(|color-mix|transparent|currentcolor)/i.test(s))
    return s;
  if (/^[a-z-]+$/i.test(s))
    return `color-mix(in srgb, var(--${s}-color, ${s}) 78%, var(--md-sys-color-on-surface, currentColor) 22%)`;
  return s;
}

function formatState(hass, s) {
  if (!s) return "–";
  return hass.formatEntityState ? hass.formatEntityState(s) : s.state;
}

/** Tile-style name object: {type: entity|device|area|floor} or {text}. */
function resolveNameObject(hass, entityId, n) {
  if (!n || typeof n !== "object") return n;
  const s = hass.states[entityId];
  const ent = hass.entities && hass.entities[entityId];
  const dev =
    ent && ent.device_id && hass.devices && hass.devices[ent.device_id];
  switch (n.type) {
    case "text":
      return n.text ?? "";
    case "area":
      return areaOf(hass, entityId) || (s && s.attributes.friendly_name) || "";
    case "device":
      return (
        (dev && (dev.name_by_user || dev.name)) ||
        (s && s.attributes.friendly_name) ||
        ""
      );
    case "floor": {
      const aid = ent && (ent.area_id || (dev && dev.area_id));
      const fid = aid && hass.areas[aid] && hass.areas[aid].floor_id;
      return (
        (fid && hass.floors && hass.floors[fid] && hass.floors[fid].name) || ""
      );
    }
    default:
      return (s && s.attributes.friendly_name) || "";
  }
}

function areaOf(hass, entityId) {
  const ent = hass.entities && hass.entities[entityId];
  if (!ent) return null;
  const aid =
    ent.area_id ||
    (ent.device_id &&
      hass.devices &&
      hass.devices[ent.device_id] &&
      hass.devices[ent.device_id].area_id);
  return aid && hass.areas && hass.areas[aid] ? hass.areas[aid].name : null;
}

/* Entities per area (cached per entity registry) and a small status summary for rooms. */
const _areaIdx = new WeakMap();
function areaEntities(h, areaId) {
  if (!h.entities) return [];
  let idx = _areaIdx.get(h.entities);
  if (!idx) {
    idx = {};
    Object.keys(h.entities).forEach((e) => {
      const x = h.entities[e],
        aid =
          x.area_id ||
          (x.device_id &&
            h.devices &&
            h.devices[x.device_id] &&
            h.devices[x.device_id].area_id);
      if (aid) (idx[aid] = idx[aid] || []).push(e);
    });
    _areaIdx.set(h.entities, idx);
  }
  return idx[areaId] || [];
}
/**
 * What is going on in a room: ids of lights that are on, windows/doors that are open and motion sensors that fire.
 * `opt.lights` replaces the automatic lights of the area, `opt.include` adds entities from elsewhere, `opt.exclude` leaves some out
 * (entities with the label "Status Hidden" are always left out).
 */
function areaStatusDetail(h, areaId, opt = {}) {
  const out = { lights: [], open: [], motion: [] },
    ex = opt.exclude || [];
  const ok = (e) => {
    const s = h.states[e];
    return (
      !!s &&
      s.state === "on" &&
      !ex.includes(e) &&
      !hasLabel(h, e, "Status Hidden")
    );
  };
  const ids = areaId ? areaEntities(h, areaId).slice() : [];
  (opt.include || []).forEach((e) => {
    if (!ids.includes(e)) ids.push(e);
  });
  ids.forEach((e) => {
    if (!ok(e)) return;
    const s = h.states[e],
      d = domainOf(e),
      dc = s.attributes.device_class;
    if (d === "light") {
      if (!opt.lights && !Array.isArray(s.attributes.entity_id))
        out.lights.push(e);
    } else if (
      d === "binary_sensor" &&
      ["window", "door", "opening", "garage_door"].includes(dc)
    )
      out.open.push(e);
    else if (
      d === "binary_sensor" &&
      ["motion", "occupancy", "presence"].includes(dc)
    )
      out.motion.push(e);
  });
  (opt.lights || []).forEach((e) => {
    if (ok(e) && !out.lights.includes(e)) out.lights.push(e);
  });
  return out;
}
/** Status options of a room/nav entry: `status: {lights, include, exclude}` or the same keys directly on the entry (what the editors write). */
function statusOpts(o) {
  const s = o.status || {};
  return {
    lights: o.lights || s.lights,
    include: o.include || s.include,
    exclude: o.exclude || s.exclude,
  };
}
/** { lights, open, motion } counts of areaStatusDetail. */
function areaStatus(h, areaId, opt) {
  const d = areaStatusDetail(h, areaId, opt);
  return {
    lights: d.lights.length,
    open: d.open.length,
    motion: d.motion.length,
  };
}

function hasLabel(hass, entityId, name) {
  const ent = hass.entities && hass.entities[entityId];
  if (!ent || !ent.labels) return false;
  return ent.labels.some(
    (id) =>
      id === name ||
      id === name.toLowerCase().replace(/\s+/g, "_") ||
      (hass.labels && hass.labels[id] && hass.labels[id].name === name),
  );
}

/** Resample a step history into equal time buckets (time-weighted), then smooth lightly. */
function resample(points, hours, buckets) {
  if (!points.length) return [];
  const end = Date.now(),
    start = end - hours * 3600 * 1000,
    dt = (end - start) / buckets;
  const pts = points.filter((p) => p[0] <= end).sort((x, y) => x[0] - y[0]);
  const out = [];
  let idx = 0,
    cur = pts[0][1];
  for (let i = 0; i < buckets; i++) {
    const b0 = start + i * dt,
      b1 = b0 + dt;
    while (idx < pts.length && pts[idx][0] <= b0) {
      cur = pts[idx][1];
      idx++;
    }
    let acc = 0,
      t = b0,
      v = cur,
      j = idx;
    while (j < pts.length && pts[j][0] < b1) {
      acc += v * (pts[j][0] - t);
      t = pts[j][0];
      v = pts[j][1];
      j++;
    }
    acc += v * (b1 - t);
    out.push([b0 + dt / 2, acc / dt]);
  }
  return out;
}

function smoothSeries(pts) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)][1],
      c = pts[Math.min(pts.length - 1, i + 1)][1];
    return [p[0], (a + 2 * p[1] + c) / 4];
  });
}

/**
 * Builds SVG paths for a sparkline. opts: hours, smooth (default true), buckets (48), minSpan, unit.
 * The y range is padded and never narrower than minSpan so small noise does not look like big jumps.
 */
function sparkPath(points, w, h, pad = 3, opts = {}) {
  if (points.length < 2) return { line: "", area: "" };
  const smooth = opts.smooth !== false;
  let pts = points;
  if (smooth) {
    pts = resample(points, opts.hours || 24, opts.buckets || 48);
    pts = smoothSeries(smoothSeries(pts));
  }
  const xs = pts.map((p) => p[0]),
    ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs),
    x1 = Math.max(...xs);
  let y0 = Math.min(...ys),
    y1 = Math.max(...ys);
  const mid = (y0 + y1) / 2,
    unit = String(opts.unit || "");
  const defMin =
    opts.minSpan != null
      ? num(opts.minSpan)
      : unit.includes("%")
        ? 10
        : unit.includes("°")
          ? 2
          : Math.max(Math.abs(mid) * 0.05, 1);
  if (y1 - y0 < defMin) {
    y0 = mid - defMin / 2;
    y1 = mid + defMin / 2;
  }
  const span = y1 - y0;
  y0 -= span * 0.12;
  y1 += span * 0.12;
  const px = opts.padX != null ? opts.padX : pad;
  const sx = (x) => px + ((x - x0) / (x1 - x0 || 1)) * (w - 2 * px);
  const sy = (y) => h - pad - ((y - y0) / (y1 - y0 || 1)) * (h - 2 * pad);
  const P = pts.map((p) => [sx(p[0]), sy(p[1])]);
  let line;
  if (smooth && P.length > 2) {
    line = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)],
        p1 = P[i],
        p2 = P[i + 1],
        p3 = P[Math.min(P.length - 1, i + 2)];
      const lo = Math.min(p1[1], p2[1]),
        hi = Math.max(p1[1], p2[1]);
      const c1y = Math.min(hi, Math.max(lo, p1[1] + (p2[1] - p0[1]) / 6));
      const c2y = Math.min(hi, Math.max(lo, p2[1] - (p3[1] - p1[1]) / 6));
      line += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${c1y.toFixed(
        1,
      )} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${c2y.toFixed(
        1,
      )} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
  } else
    line = P.map(
      (p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`,
    ).join(" ");
  const last = P[P.length - 1],
    first = P[0];
  const area = `${line} L${last[0].toFixed(1)},${h} L${first[0].toFixed(
    1,
  )},${h} Z`;
  return { line, area, min: y0, max: y1 };
}

async function fetchHistory(hass, entityId, hours) {
  const end = new Date();
  const start = new Date(end.getTime() - hours * 3600 * 1000);
  const res = await hass.callWS({
    type: "history/history_during_period",
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    entity_ids: [entityId],
    minimal_response: true,
    no_attributes: true,
    significant_changes_only: false,
  });
  const rows = (res && res[entityId]) || [];
  return rows
    .map((r) => [
      (r.lu ?? r.last_updated ?? r.lc) * (r.lu ? 1000 : 1),
      parseFloat(r.s ?? r.state),
    ])
    .filter((p) => isFinite(p[0]) && isFinite(p[1]));
}

/* ---------------------------------------------------------------- templates */
/** JavaScript templates: [[[ expression or statements with return ]]]; vars: entity, states, hass, user, config. */
function renderJs(str, ctx) {
  if (typeof str !== "string" || !str.includes("[[[")) return str;
  const run = (body) => {
    try {
      const code = /\breturn\b/.test(body) ? body : `return (${body});`;
      return new Function(
        "entity",
        "states",
        "hass",
        "user",
        "config",
        `"use strict"; ${code}`,
      )(ctx.entity, ctx.states, ctx.hass, ctx.user, ctx.config);
    } catch (e) {
      return "";
    }
  };
  const whole = str.trim().match(/^\[\[\[([\s\S]*)\]\]\]$/);
  if (whole && !whole[1].includes("]]]")) return run(whole[1]);
  return str.replace(/\[\[\[([\s\S]*?)\]\]\]/g, (_, b) => String(run(b) ?? ""));
}

/** Resolves card fields containing JavaScript ([[[ ]]]) or Jinja ({{ }} / {% %}) templates. */
class Tpl {
  constructor(onChange) {
    this._onChange = onChange;
    this._subs = [];
    this._vals = {};
    this._cfg = null;
  }
  setup(hass, config, fields) {
    this.dispose();
    this._cfg = config;
    this._fields = fields;
    this._hass = hass;
    this._vals = {};
    if (!hass || !hass.connection) return;
    fields.forEach((k) => {
      const t = config[k];
      if (typeof t === "string" && /\{\{|\{%/.test(t)) {
        this._subs.push(
          hass.connection.subscribeMessage(
            (m) => {
              this._vals[k] = m.result;
              this._onChange();
            },
            {
              type: "render_template",
              template: t,
              variables: { config, entity: config.entity },
              strict: false,
            },
          ),
        );
      }
    });
  }
  get(k, hass) {
    const t = this._cfg && this._cfg[k];
    if (typeof t !== "string") return t;
    if (/\{\{|\{%/.test(t)) return this._vals[k];
    if (t.includes("[[[")) {
      return renderJs(t, {
        entity: hass.states[this._cfg.entity],
        states: hass.states,
        hass,
        user: hass.user,
        config: this._cfg,
      });
    }
    return t;
  }
  dispose() {
    this._subs.forEach((p) => p.then((f) => f()).catch(() => {}));
    this._subs = [];
  }
}

/* ------------------------------------------------------------------ actions */
/* Swipe / system-gesture guard: a click that ends a swipe, or starts in the screen-edge back-gesture zone, is not a tap. */
const EDGE_ZONE = 28,
  MOVE_SLOP = 10;
const gesture = { x: 0, y: 0, moved: false, edge: false };
const gestureBlocked = () => gesture.moved || gesture.edge;
window.addEventListener(
  "pointerdown",
  (e) => {
    gesture.x = e.clientX;
    gesture.y = e.clientY;
    gesture.moved = false;
    gesture.edge =
      e.pointerType === "touch" &&
      (e.clientX < EDGE_ZONE || e.clientX > window.innerWidth - EDGE_ZONE);
  },
  true,
);
window.addEventListener(
  "pointermove",
  (e) => {
    if (
      !gesture.moved &&
      Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) > MOVE_SLOP
    )
      gesture.moved = true;
  },
  true,
);
window.addEventListener(
  "click",
  (e) => {
    const blocked = gestureBlocked();
    gesture.moved = false;
    gesture.edge = false;
    if (!blocked) return;
    const path = e.composedPath();
    if (
      path.some(
        (el) => el.localName === "md3-dialog" || el.localName === "md3-sheet",
      )
    )
      return;
    if (path.some((el) => el.localName && el.localName.startsWith("md3-"))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  },
  true,
);

/** State history as segments [{t0, t1, state}] covering the last `hours` hours (for timelines of discrete entities). */
async function fetchStates(hass, entityId, hours) {
  const end = Date.now(),
    start = end - hours * 3600 * 1000;
  const res = await hass.callWS({
    type: "history/history_during_period",
    start_time: new Date(start).toISOString(),
    end_time: new Date(end).toISOString(),
    entity_ids: [entityId],
    minimal_response: true,
    no_attributes: true,
    significant_changes_only: false,
  });
  const rows = (res && res[entityId]) || [];
  const segs = [];
  rows.forEach((r) => {
    const t = Math.max(start, ((r.lu ?? r.last_updated ?? r.lc) || 0) * 1000);
    const state = r.s ?? r.state;
    if (segs.length) {
      const last = segs[segs.length - 1];
      if (last.state === state) return;
      last.t1 = t;
    }
    segs.push({ t0: t, t1: end, state });
  });
  if (segs.length) segs[0].t0 = start;
  return segs;
}

/** "3 h 12 min", "45 min", "40 s". */
function fmtDuration(ms) {
  const m = Math.round(ms / 60000);
  if (m < 1) return `${Math.max(1, Math.round(ms / 1000))} s`;
  const h = Math.floor(m / 60);
  return h ? `${h} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`;
}

const TL_ACTIVE = [
  "on",
  "open",
  "opening",
  "running",
  "home",
  "detected",
  "heat",
  "heating",
  "cool",
  "cooling",
  "playing",
  "unlocked",
  "charging",
  "active",
  "armed_home",
  "armed_away",
];
const TL_DIM = [
  "off",
  "closed",
  "idle",
  "standby",
  "not_home",
  "paused",
  "locked",
  "clear",
  "disarmed",
  "none",
];
const TL_PALETTE = [
  "var(--md-sys-color-tertiary,#d0bcff)",
  "var(--md-sys-color-secondary,#ccc2dc)",
  "#f5c542",
  "#ef6c4d",
  "#66bb6a",
  "#4fc3f7",
];
/** Colour of a timeline segment; `idx` is the order of first appearance of a state without a fixed meaning. */
function timelineColor(state, idx) {
  const s = String(state).toLowerCase();
  if (["unavailable", "unknown"].includes(s)) return "rgba(127,127,127,.55)";
  if (TL_DIM.includes(s))
    return "var(--md-sys-color-surface-container-highest,#444)";
  if (TL_ACTIVE.includes(s)) return "var(--md-sys-color-primary,#8ab4f8)";
  return TL_PALETTE[idx % TL_PALETTE.length];
}

/** Card option `active_when: {entity?, above?, below?, state?, state_not?}` decides whether a tile counts as active; null = not configured. */
function activeWhen(hass, cfg, s) {
  const a = cfg.active_when;
  if (!a) return null;
  const e = a.entity ? hass.states[a.entity] : s;
  if (!e) return false;
  const v = parseFloat(e.state),
    list = (x) => [].concat(x);
  if (a.above != null && !(v > a.above)) return false;
  if (a.below != null && !(v < a.below)) return false;
  if (a.state != null && !list(a.state).includes(e.state)) return false;
  if (a.state_not != null && list(a.state_not).includes(e.state)) return false;
  return true;
}

/** Mount point inside <home-assistant>'s shadow root, so embedded HA elements (e.g. ha-map) can reach its context providers. */
function mountRoot() {
  const ha = document.querySelector("home-assistant");
  return (ha && ha.shadowRoot) || document.body;
}

/** True when a scrollable element between the event target and `host` can still scroll in the wanted direction. */
function canScrollWithin(path, host, down) {
  for (const el of path) {
    if (el === host) break;
    if (el.nodeType !== 1) continue;
    const oy = getComputedStyle(el).overflowY;
    if (
      (oy === "auto" || oy === "scroll") &&
      el.scrollHeight > el.clientHeight + 1
    ) {
      if (
        down
          ? el.scrollTop + el.clientHeight < el.scrollHeight - 1
          : el.scrollTop > 0
      )
        return true;
    }
  }
  return false;
}

/** Keep swipes and the mouse wheel inside an overlay: only scrollable content that can still move may scroll, the page behind never does. */
function trapScroll(host) {
  if (host._trapScroll) return;
  host._trapScroll = true;
  const passthrough = (path) =>
    path.some(
      (el) =>
        el.localName === "ha-slider" ||
        (el.localName === "input" && el.type === "range"),
    );
  let y = 0;
  host.addEventListener(
    "touchstart",
    (e) => {
      y = e.touches[0].clientY;
    },
    { passive: true },
  );
  host.addEventListener(
    "touchmove",
    (e) => {
      const ny = e.touches[0].clientY,
        down = ny < y; // finger moves up -> content scrolls down
      y = ny;
      const path = e.composedPath();
      if (
        !passthrough(path) &&
        !canScrollWithin(path, host, down) &&
        e.cancelable
      )
        e.preventDefault();
    },
    { passive: false },
  );
  host.addEventListener(
    "wheel",
    (e) => {
      if (
        !canScrollWithin(e.composedPath(), host, e.deltaY > 0) &&
        e.cancelable
      )
        e.preventDefault();
    },
    { passive: false },
  );
}

/** Same breakpoint as Home Assistant's own adaptive dialogs: bottom sheet on phones, top-aligned dialog otherwise. */
const SHEET_MQ = "(max-width: 450px), (max-height: 500px)";
const isBottomSheet = () => window.matchMedia(SHEET_MQ).matches;

/** Swipe a bottom sheet down to close it: from anywhere once its content is scrolled to the top (sliders and maps keep their own gestures). */
function swipeToClose(host, panel, close, distance = 0) {
  let y0 = null,
    dy = 0,
    active = false,
    vy = 0,
    ly = 0,
    lt = 0;
  const blocked = (path) =>
    path.some(
      (el) =>
        el.localName === "ha-slider" ||
        el.localName === "ha-map" ||
        (el.localName === "input" && el.type === "range") ||
        (el.classList && el.classList.contains("leaflet-container")),
    );
  host.addEventListener(
    "touchstart",
    (e) => {
      y0 =
        isBottomSheet() && !blocked(e.composedPath())
          ? e.touches[0].clientY
          : null;
      dy = 0;
      active = false;
      vy = 0;
      ly = y0;
      lt = e.timeStamp;
    },
    { passive: true },
  );
  host.addEventListener(
    "touchmove",
    (e) => {
      if (y0 == null) return;
      const y = e.touches[0].clientY;
      if (!active) {
        if (y - y0 <= 6 || canScrollWithin(e.composedPath(), host, false))
          return;
        active = true;
        y0 = y;
        ly = y;
        panel.style.transition = "none";
      }
      dy = Math.max(0, y - y0);
      vy = (y - ly) / Math.max(1, e.timeStamp - lt);
      ly = y;
      lt = e.timeStamp;
      panel.style.transform = `translateY(${dy}px)`;
      if (e.cancelable) e.preventDefault();
    },
    { passive: false },
  );
  const end = () => {
    const was = active;
    active = false;
    y0 = null;
    if (!was) return;
    panel.style.transition = "transform .2s ease";
    if (
      dy > (distance || Math.min(140, panel.offsetHeight * 0.25)) ||
      vy > 0.6
    ) {
      panel.style.transform = "translateY(100%)";
      setTimeout(close, 200);
    } else panel.style.transform = "";
  };
  host.addEventListener("touchend", end);
  host.addEventListener("touchcancel", end);
}

function openMd3Dialog(hass, entityId, cfg = {}) {
  const d = document.createElement("md3-dialog");
  mountRoot().appendChild(d);
  d.open(hass, entityId, cfg);
  return d;
}

const TOGGLE_DOMAINS = [
  "light",
  "switch",
  "input_boolean",
  "fan",
  "cover",
  "automation",
  "lock",
  "humidifier",
];
const ACTIVE_STATES = [
  "on",
  "open",
  "opening",
  "unlocked",
  "playing",
  "heat",
  "cool",
  "heat_cool",
  "auto",
  "home",
  "running",
  "heating",
  "cooling",
  "detected",
  "armed_home",
  "armed_away",
  "armed_night",
  "armed_vacation",
];
const DIALOG_SENSOR_CLASSES = [
  "battery",
  "temperature",
  "humidity",
  "motion",
  "presence",
  "occupancy",
  "door",
  "window",
  "power",
  "energy",
  "illuminance",
  "pressure",
  "carbon_dioxide",
  "moisture",
];

/** True when md3 has its own dialog for this entity. */
function hasMd3Dialog(hass, entityId) {
  const d = domainOf(entityId);
  const s = hass.states[entityId];
  if (
    [
      "person",
      "light",
      "switch",
      "input_boolean",
      "fan",
      "automation",
      "media_player",
      "alarm_control_panel",
      "camera",
    ].includes(d)
  )
    return true;
  if (!s) return false;
  if (d === "binary_sensor") return true;
  // any measured value gets the history dialog, not only the listed device classes (e.g. a temperature difference in K)
  return (
    d === "sensor" &&
    (DIALOG_SENSOR_CLASSES.includes(s.attributes.device_class) ||
      s.attributes.device_class === "enum" ||
      !!s.attributes.state_class ||
      !!s.attributes.unit_of_measurement)
  );
}

function runAction(node, hass, a, entityId, hold) {
  if (!a) a = entityId ? { action: "md3-default" } : { action: "none" };
  const ent = a.entity || entityId;
  const dcfg = a.dialog || (node && node._config && node._config.dialog) || {}; // `dialog:` on the action or on the card
  switch (a.action) {
    case "md3-default": {
      const d = domainOf(ent);
      if (hold) {
        if (hasMd3Dialog(hass, ent)) openMd3Dialog(hass, ent, dcfg);
        else moreInfo(node, ent);
      } else if (TOGGLE_DOMAINS.includes(d))
        hass.callService("homeassistant", "toggle", { entity_id: ent });
      else if (["script", "scene", "button", "input_button"].includes(d))
        hass.callService(
          d,
          d === "button" || d === "input_button" ? "press" : "turn_on",
          { entity_id: ent },
        );
      else if (hasMd3Dialog(hass, ent)) openMd3Dialog(hass, ent, dcfg);
      else moreInfo(node, ent);
      break;
    }
    case "more-info":
    case "custom-more-info":
      if (ent) {
        if (hasMd3Dialog(hass, ent)) openMd3Dialog(hass, ent, dcfg);
        else moreInfo(node, ent);
      }
      break;
    case "ha-more-info":
      if (ent) moreInfo(node, ent);
      break;
    case "md3-dialog":
      openMd3Dialog(hass, ent, dcfg);
      break;
    case "toggle":
      hass.callService("homeassistant", "toggle", { entity_id: ent });
      break;
    case "navigate":
      history.pushState(null, "", a.navigation_path);
      window.dispatchEvent(
        new CustomEvent("location-changed", { detail: { replace: false } }),
      );
      break;
    case "url":
      window.open(a.url_path, a.new_tab === false ? "_self" : "_blank");
      break;
    case "assist":
      history.pushState(null, "", `${location.pathname}?conversation=1`);
      window.dispatchEvent(
        new CustomEvent("location-changed", { detail: { replace: false } }),
      );
      break;
    case "call-service":
    case "perform-action": {
      const [d, s] = (a.service || a.perform_action || "").split(".");
      if (d && s)
        hass.callService(d, s, a.data || a.service_data || {}, a.target);
      break;
    }
    default:
      break;
  }
}

/** tap / hold / double-tap handling for a card surface. */
function attachTap(node, el, getHass, getCfg, getEntity) {
  let holdTimer = null,
    held = false,
    clickTimer = null;
  el.addEventListener("pointerdown", () => {
    held = false;
    holdTimer = setTimeout(() => {
      if (gestureBlocked()) return;
      held = true;
      const c = getCfg();
      haptic();
      runAction(node, getHass(), c.hold_action, getEntity(), true);
    }, 550);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) =>
    el.addEventListener(ev, () => clearTimeout(holdTimer)),
  );
  el.addEventListener("click", () => {
    if (held) return;
    const c = getCfg();
    const single = () => {
      haptic();
      runAction(node, getHass(), c.tap_action, getEntity(), false);
    };
    if (c.double_tap_action) {
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
        haptic();
        runAction(node, getHass(), c.double_tap_action, getEntity(), false);
      } else
        clickTimer = setTimeout(() => {
          clickTimer = null;
          single();
        }, 260);
    } else single();
  });
}

const DC_ICONS = {
  plug: "mdi:power-plug",
  vibration: "mdi:vibrate",
  motion: "m3of:sensors",
  presence: "m3of:person",
  occupancy: "m3of:home",
  door: "m3of:door-front",
  window: "m3of:window",
  moisture: "m3of:water-drop",
  smoke: "m3of:detector-smoke",
  battery: "m3of:battery-full",
  temperature: "m3of:thermometer",
  humidity: "m3of:humidity-percentage",
  power: "m3of:bolt",
  energy: "m3of:bolt",
  illuminance: "m3of:brightness-5",
  pressure: "m3of:speed",
  carbon_dioxide: "m3of:co2",
  connectivity: "m3of:lan",
  lock: "m3of:lock",
  opening: "m3of:door-open",
  problem: "m3of:error",
};
const DOMAIN_ICONS = {
  update: "mdi:package-up",
  device_tracker: "mdi:cellphone",
  light: "m3of:lightbulb",
  switch: "m3of:toggle-on",
  input_boolean: "m3of:toggle-on",
  fan: "m3of:mode-fan",
  cover: "m3of:blinds",
  climate: "m3of:thermostat",
  media_player: "m3of:speaker",
  sensor: "m3of:sensors",
  binary_sensor: "m3of:radio-button-checked",
  person: "m3of:person",
  scene: "m3of:palette",
  script: "m3of:description",
  automation: "m3of:smart-toy",
  button: "m3of:touch-app",
  vacuum: "m3of:vacuum",
  camera: "m3of:videocam",
  weather: "m3of:partly-cloudy-day",
  water_heater: "m3of:water-heater",
  humidifier: "m3of:humidity-high",
  alarm_control_panel: "m3of:shield",
};
/** Icon for an entity: registry/attribute icon, else device-class icon, else domain icon. */
function entityIcon(hass, s) {
  if (!s) return "m3of:radio-button-unchecked";
  const reg = hass.entities && hass.entities[s.entity_id];
  const dc = s.attributes.device_class;
  const on = s.state === "on";
  if (reg && reg.icon) return reg.icon;
  if (s.attributes.icon) return s.attributes.icon;
  if (dc === "door") return on ? "m3of:door-open" : "m3of:door-front";
  if (dc === "window" && on) return "m3of:window";
  return (
    DC_ICONS[dc] ||
    DOMAIN_ICONS[domainOf(s.entity_id)] ||
    "m3of:radio-button-unchecked"
  );
}

/** Thermostat tile text: "Ist 20,5° • Soll 21°" (or "Aus • 20,5°" when switched off). */
function climateText(hass, s, base) {
  const a = s.attributes,
    lang = (hass.locale && hass.locale.language) || "de";
  const f = (v) =>
    `${Number(v).toLocaleString(lang, { maximumFractionDigits: 1 })}°`;
  const ist = a.current_temperature != null ? f(a.current_temperature) : "";
  const soll =
    a.temperature != null
      ? f(a.temperature)
      : a.target_temp_low != null && a.target_temp_high != null
        ? `${f(a.target_temp_low)}–${f(a.target_temp_high)}`
        : "";
  if (s.state === "off") return ist ? `${base} • ${ist}` : base;
  const parts = [ist && `Ist ${ist}`, soll && `Soll ${soll}`].filter(Boolean);
  return parts.length ? parts.join(" • ") : base;
}

function stateText(hass, s) {
  if (!s) return "–";
  const base = formatState(hass, s);
  const d = domainOf(s.entity_id);
  if (["unavailable", "unknown"].includes(s.state)) return base;
  if (d === "climate") return climateText(hass, s, base);
  if (d === "water_heater" && s.attributes.current_temperature != null)
    return `${base} • ${s.attributes.current_temperature}°`;
  if (d === "media_player" && s.state === "playing" && s.attributes.media_title)
    return s.attributes.media_title;
  if (d === "light" && s.state === "on" && s.attributes.brightness != null)
    return `${Math.round(s.attributes.brightness / 2.55)} %`;
  return base;
}

/** Common base for single-entity cards. */
class Md3Base extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
  }
  setConfig(config) {
    if (!config || !config.entity) throw new Error("entity is required");
    this._config = { ...config };
    this._build();
    if (this._hass) this._update();
  }
  set hass(hass) {
    this._hass = hass;
    this._update();
  }
  get hass() {
    return this._hass;
  }
  get stateObj() {
    return this._hass && this._hass.states[this._config.entity];
  }
  getCardSize() {
    return 2;
  }
  getGridOptions() {
    return { columns: 6, rows: 2, min_columns: 3, min_rows: 1 };
  }
  _name() {
    const s = this.stateObj;
    return (
      this._config.name ||
      (s && s.attributes.friendly_name) ||
      this._config.entity
    );
  }
  _build() {}
  _update() {}
}
/* ------------------------------------------------------------------- button */
const TILE_FIELDS = [
  "name",
  "secondary",
  "label",
  "icon",
  "icon_color",
  "text_color",
  "background_color",
];

class Md3ButtonCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tpl = new Tpl(() => this._render());
  }
  disconnectedCallback() {
    this._tpl.dispose();
    this._tplReady = false;
  }
  connectedCallback() {
    if (this._hass && this._config && !this._tplReady) this._setupTpl();
  }
  _setupTpl() {
    this._tplReady = true;
    this._tpl.setup(this._hass, this._config, TILE_FIELDS);
  }
  setConfig(config) {
    this._config = { ...config };
    if (this._config.use_card_entity === false) delete this._config.entity;
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      ha-card { height: var(--md3-height, 120px); padding: 0 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background .2s; user-select: none; -webkit-user-select: none; }
      ha-card.on:not(.custom) { background: var(--md3-primary-container); color: var(--md3-on-primary-container); }
      ha-card.on:not(.custom) .sub { color: inherit; opacity: .8; }
      ha-card.heat:not(.custom) { background-image: linear-gradient(rgba(255,138,76,.30), rgba(255,138,76,.30)); background-color: var(--md3-surface); color: var(--md3-on-surface); }
      ha-card.cool:not(.custom) { background-image: linear-gradient(rgba(79,172,254,.28), rgba(79,172,254,.28)); background-color: var(--md3-surface); color: var(--md3-on-surface); }
      ha-card.dry:not(.custom) { background-image: linear-gradient(rgba(245,197,66,.28), rgba(245,197,66,.28)); background-color: var(--md3-surface); color: var(--md3-on-surface); }
      ha-card.fan:not(.custom) { background-image: linear-gradient(rgba(102,187,106,.28), rgba(102,187,106,.28)); background-color: var(--md3-surface); color: var(--md3-on-surface); }
      ha-card.heat .sub, ha-card.cool .sub, ha-card.dry .sub, ha-card.fan .sub { color: inherit; opacity: .8; }
      ha-card.lit:not(.custom):not(.on) { background-image: linear-gradient(rgba(255,214,102,.16), rgba(255,214,102,.16)); background-color: var(--md3-surface); }
      ha-card { position: relative; }
      .st { position: absolute; top: 10px; right: 10px; display: flex; gap: 4px; }
      .st i { min-width: 22px; height: 22px; padding: 0 5px; box-sizing: border-box; border-radius: 11px; display: flex; align-items: center; justify-content: center; gap: 2px; font-style: normal; font-size: 11px; font-weight: 600; color: #1d1b20; }
      .st i ha-icon { --mdc-icon-size: 14px; }
      .st .lit { background: #ffd54f; } .st .open { background: #ff9800; } .st .motion { background: var(--md3-primary); color: var(--md3-on-primary, #fff); }
      ha-card.off { opacity: .75; }
      ha-card.custom .sub { color: inherit; opacity: .8; }
      ha-icon { --mdc-icon-size: 26px; flex: none; }
      .t { min-width: 0; flex: 1; }
      .title { -webkit-line-clamp: var(--md3-title-lines, 1); }
      .sub { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      ha-card { container-type: inline-size; }
      @container (max-width: 210px) { ha-card { padding: 0 12px; gap: 10px; } ha-icon { --mdc-icon-size: 24px; } .title { font-size: 13px; } .sub { font-size: 11px; } }
      .chev { --mdc-icon-size: 20px; opacity: .6; display: none; }
      ha-card.chevron .chev { display: block; }
      ha-card:active { transform: scale(.98); }
    </style><ha-card id="c"><ha-icon id="icon"></ha-icon><div class="t"><div class="title" id="name"></div><div class="sub" id="sub"></div></div><ha-icon class="chev" icon="mdi:chevron-right"></ha-icon><div class="st" id="st"></div></ha-card>`;
    attachTap(
      this,
      this.shadowRoot.getElementById("c"),
      () => this._hass,
      () => this._cfgForTap(),
      () => this._config.entity,
    );
    if (this._hass) {
      this._setupTpl();
      this._render();
    }
  }
  _cfgForTap() {
    const c = this._config;
    const none = { action: "none" };
    const t =
      c.tap_action ||
      (c.use_default_toggle === false || !c.entity ? none : undefined);
    const hold =
      c.hold_action || (c.use_default_toggle === false ? none : undefined);
    return {
      tap_action: t,
      hold_action: hold || (c.entity ? { action: "md3-default" } : none),
      double_tap_action: c.double_tap_action,
    };
  }
  set hass(h) {
    const first = !this._hass;
    this._hass = h;
    if (!this._config) return;
    if (first && !this._tplReady) this._setupTpl();
    this._render();
  }
  _render() {
    const h = this._hass,
      c = this._config,
      r = this.shadowRoot;
    if (!h || !c || !r.getElementById("c")) return;
    const s = c.entity && h.states[c.entity];
    const t = (k) => this._tpl.get(k, h);
    const aw = activeWhen(h, c, s);
    const active = aw !== null ? aw : !!(s && ACTIVE_STATES.includes(s.state));
    const offline = !!(s && ["unavailable", "unknown"].includes(s.state));
    let name =
      c.name && typeof c.name === "object"
        ? resolveNameObject(h, c.entity, c.name)
        : t("name");
    name = name ?? (s && s.attributes.friendly_name) ?? "";
    let sub = t("secondary") ?? t("label");
    if (sub == null) {
      if (c.use_default_text === false && s)
        sub = active ? c.text_on : c.text_off;
      else if (c.entity && c.show_state !== false) sub = stateText(h, s);
      else sub = "";
    }
    let icon = c.dual_icon ? (active ? c.icon_on : c.icon_off) : t("icon");
    icon = icon || (s ? entityIcon(h, s) : "mdi:circle-outline");
    r.getElementById("name").textContent = name;
    r.getElementById("sub").textContent = sub ?? "";
    r.getElementById("icon").setAttribute("icon", icon);
    const bg = t("background_color"),
      fg = t("text_color"),
      ic = t("icon_color");
    const card = r.getElementById("c");
    const custom = !!bg;
    let cls = custom ? "custom" : "";
    if (offline) cls += " off";
    else if (c.use_material_color && s && domainOf(c.entity) === "climate") {
      const st = s.attributes.preset_mode === "eco" ? "fan" : s.state;
      cls +=
        st === "heat" || st === "auto" || s.attributes.hvac_action === "heating"
          ? " heat"
          : st === "cool"
            ? " cool"
            : st === "dry"
              ? " dry"
              : st === "fan_only"
                ? " fan"
                : "";
    } else if (active && !c.icon_color_only) cls += " on";
    if (c.show_chevron || c.show_shavron_icon) cls += " chevron";
    const ast = c.area || c.status ? areaStatus(h, c.area, c.status) : null;
    if (ast && ast.lights) cls += " lit";
    const stEl = r.getElementById("st"),
      stHtml = ast
        ? `${
            ast.lights
              ? `<i class="lit"><ha-icon icon="mdi:lightbulb-on"></ha-icon>${
                  ast.lights > 1 ? ast.lights : ""
                }</i>`
              : ""
          }${
            ast.open
              ? `<i class="open"><ha-icon icon="mdi:window-open-variant"></ha-icon>${
                  ast.open > 1 ? ast.open : ""
                }</i>`
              : ""
          }${
            ast.motion
              ? '<i class="motion"><ha-icon icon="mdi:motion-sensor"></ha-icon></i>'
              : ""
          }`
        : "";
    if (stEl && stEl._h !== stHtml) {
      stEl.innerHTML = stHtml;
      stEl._h = stHtml;
    }
    if (stEl && !stEl._bound) {
      // tapping the chips lists what they are made of (so wrong entries are easy to find and exclude)
      stEl._bound = true;
      stEl.addEventListener("pointerdown", (e) => e.stopPropagation());
      stEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const d = areaStatusDetail(
            this._hass,
            this._config.area,
            this._config.status,
          ),
          ids = [...d.lights, ...d.open, ...d.motion];
        if (ids.length) {
          haptic();
          openMd3Dialog(this._hass, ids[0], {
            name: `${this._config.name || ""} – aktiv`,
            icon: "mdi:information-outline",
            entities: ids,
          });
        }
      });
    }
    card.className = cls.trim();
    card.style.setProperty("--md3-bg", bg ? colorValue(bg) : "");
    card.style.setProperty("--md3-fg", fg ? colorValue(fg) : "");
    r.getElementById("icon").style.color = ic ? colorValue(ic) : "";
  }
  getCardSize() {
    return 2;
  }
  getGridOptions() {
    return { columns: 6, rows: 2, min_columns: 3, min_rows: 1 };
  }
  static getStubConfig() {
    return { entity: "light.example" };
  }
}

class Md3ControlCard extends Md3ButtonCard {
  setConfig(config) {
    super.setConfig({
      name: "Control",
      icon: "mdi:link",
      ...config,
      use_card_entity: config.use_card_entity === true,
    });
  }
  static getStubConfig() {
    return {
      name: "Control",
      icon: "mdi:link",
      tap_action: { action: "none" },
    };
  }
}
class Md3TemplateCard extends Md3ButtonCard {
  static getStubConfig() {
    return {
      name: "{{ now().strftime('%H:%M') }}",
      label: "Template",
      icon: "mdi:clock",
    };
  }
}

/* --------------------------------------------------------------------- menu */
class Md3MenuCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  setConfig(config) {
    this._config = { ...config };
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      ha-card { padding: 12px 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; }
      .ic { width: 44px; height: 44px; border-radius: 50%; background: var(--md3-primary-container); color: var(--md3-on-primary-container); display: flex; align-items: center; justify-content: center; flex: none; }
      .t { flex: 1; min-width: 0; }
    </style><ha-card id="c"><span class="ic"><ha-icon id="icon"></ha-icon></span><div class="t"><div class="title" id="name"></div><div class="sub" id="label"></div></div><ha-icon icon="mdi:chevron-right"></ha-icon></ha-card>`;
    const r = this.shadowRoot;
    r.getElementById("name").textContent = this._config.name || "";
    r.getElementById("label").textContent = this._config.label || "";
    r.getElementById("icon").setAttribute(
      "icon",
      this._config.icon || "mdi:history",
    );
    attachTap(
      this,
      r.getElementById("c"),
      () => this._hass,
      () => ({
        ...this._config,
        tap_action: this._config.tap_action || { action: "none" },
      }),
      () => this._config.entity,
    );
  }
  set hass(h) {
    this._hass = h;
  }
  getCardSize() {
    return 1;
  }
  getGridOptions() {
    return { columns: 12, rows: 1, min_columns: 6 };
  }
  static getStubConfig() {
    return {
      name: "Aktivität",
      icon: "mdi:history",
      label: "Letzte Aktionen",
      tap_action: { action: "navigate", navigation_path: "/logbook" },
    };
  }
}

/* ------------------------------------------------------------------ options */
const RADIUS = { small: "12px", medium: "20px", large: "28px" };
class Md3OptionsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tpl = new Tpl(() => this._render());
  }
  disconnectedCallback() {
    this._tpl.dispose();
    this._tplReady = false;
  }
  connectedCallback() {
    if (this._hass && this._config && !this._tplReady) {
      this._tplReady = true;
      this._tpl.setup(this._hass, this._config, ["name", "label", "icon"]);
    }
  }
  setConfig(config) {
    this._config = {
      options_type: "options",
      border_radius_style: "small",
      ...config,
    };
    const c = this._config;
    const radius =
      c.border_radius_style === "custom" && c.border_radius
        ? c.border_radius
        : RADIUS[c.border_radius_style] || RADIUS.small;
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      ha-card { border-radius: ${radius}; padding: ${
        c.use_large_buttons ? "20px" : "12px"
      } 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; }
      ha-card.dyn { background: var(--md3-primary-container); color: var(--md3-on-primary-container); }
      ha-card.dyn .sub { color: inherit; opacity: .8; }
      .t { flex: 1; min-width: 0; ${
        c.display_text_inline
          ? "display: flex; align-items: baseline; gap: 8px; white-space: nowrap; overflow: hidden;"
          : ""
      } }
      .t .title { ${
        c.display_text_inline
          ? "display: block; white-space: nowrap; text-overflow: ellipsis;"
          : ""
      } }
      .t .sub { ${
        c.display_text_inline
          ? "white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
          : ""
      } }
      .val { font-size: 13px; font-weight: 500; opacity: .85; white-space: nowrap; }
      ha-icon { --mdc-icon-size: 24px; flex: none; }
    </style><ha-card id="c"><ha-icon id="icon"></ha-icon><div class="t"><div class="title" id="name"></div><div class="sub" id="label"></div></div><span class="val" id="val"></span></ha-card>`;
    attachTap(
      this,
      this.shadowRoot.getElementById("c"),
      () => this._hass,
      () => ({
        ...this._config,
        tap_action:
          this._config.tap_action ||
          (this._config.entity ? undefined : { action: "none" }),
      }),
      () => this._config.entity,
    );
    if (this._hass) {
      this._tplReady = true;
      this._tpl.setup(this._hass, this._config, ["name", "label", "icon"]);
      this._render();
    }
  }
  set hass(h) {
    const first = !this._hass;
    this._hass = h;
    if (!this._config) return;
    if (first && !this._tplReady) {
      this._tplReady = true;
      this._tpl.setup(h, this._config, ["name", "label", "icon"]);
    }
    this._render();
  }
  _render() {
    const h = this._hass,
      c = this._config,
      r = this.shadowRoot;
    if (!h || !r.getElementById("c")) return;
    const s = c.entity && h.states[c.entity];
    const on = !!(s && ACTIVE_STATES.includes(s.state));
    r.getElementById("name").textContent =
      this._tpl.get("name", h) ?? (s && s.attributes.friendly_name) ?? "";
    r.getElementById("label").textContent = this._tpl.get("label", h) ?? "";
    let icon = c.dual_icon
      ? on
        ? c.icon_on
        : c.icon_off
      : this._tpl.get("icon", h);
    r.getElementById("icon").setAttribute(
      "icon",
      icon || (s && s.attributes.icon) || "mdi:cog",
    );
    r.getElementById("val").textContent =
      c.include_entity_options && s ? formatState(h, s) : "";
    r.getElementById("c").classList.toggle(
      "dyn",
      c.options_type === "dynamic" && on,
    );
  }
  getCardSize() {
    return 1;
  }
  getGridOptions() {
    return { columns: 12, rows: 1, min_columns: 4 };
  }
  static getStubConfig() {
    return { name: "Options", label: "Subtitle", icon: "mdi:cog" };
  }
}

/* ------------------------------------------------------------------- slider */
class Md3SliderCard extends Md3Base {
  _spec(s) {
    const c = this._config,
      d = domainOf(s.entity_id);
    const a = s.attributes;
    if (d === "cover")
      return {
        attr: "position",
        min: 0,
        max: 100,
        get: () => num(a.current_position, s.state === "open" ? 100 : 0),
      };
    const attr = c.attribute || "brightness";
    const hs = a.hs_color || [0, 100],
      rgb = a.rgb_color || [255, 255, 255];
    const defMin = c.min != null ? num(c.min) : null,
      defMax = c.max != null ? num(c.max) : null;
    switch (attr) {
      case "hue":
        return { attr, min: defMin ?? 0, max: defMax ?? 360, get: () => hs[0] };
      case "saturation":
        return { attr, min: defMin ?? 0, max: defMax ?? 100, get: () => hs[1] };
      case "red":
      case "green":
      case "blue": {
        const i = { red: 0, green: 1, blue: 2 }[attr];
        return {
          attr,
          min: defMin ?? 0,
          max: defMax ?? 255,
          get: () => rgb[i],
          idx: i,
        };
      }
      case "color_temp": {
        const lo = num(a.min_color_temp_kelvin, 2000),
          hi = num(a.max_color_temp_kelvin, 6500);
        return {
          attr,
          min: defMin ?? lo,
          max: defMax ?? hi,
          get: () => num(a.color_temp_kelvin, lo),
        };
      }
      default:
        return {
          attr: "brightness",
          min: defMin ?? 0,
          max: defMax ?? 100,
          get: () =>
            s.state === "on" ? Math.round(num(a.brightness, 255) / 2.55) : 0,
        };
    }
  }
  _apply(s, v) {
    const spec = this._spec(s);
    const a = s.attributes;
    const id = { entity_id: s.entity_id };
    if (spec.attr === "position")
      return this._hass.callService("cover", "set_cover_position", {
        ...id,
        position: v,
      });
    const hs = a.hs_color || [0, 100],
      rgb = [...(a.rgb_color || [255, 255, 255])];
    switch (spec.attr) {
      case "hue":
        return this._hass.callService("light", "turn_on", {
          ...id,
          hs_color: [v, hs[1]],
        });
      case "saturation":
        return this._hass.callService("light", "turn_on", {
          ...id,
          hs_color: [hs[0], v],
        });
      case "red":
      case "green":
      case "blue":
        rgb[spec.idx] = v;
        return this._hass.callService("light", "turn_on", {
          ...id,
          rgb_color: rgb,
        });
      case "color_temp":
        return this._hass.callService("light", "turn_on", {
          ...id,
          color_temp_kelvin: v,
        });
      default:
        return this._hass.callService("light", "turn_on", {
          ...id,
          brightness_pct: Math.max(1, v),
        });
    }
  }
  _build() {
    const c = this._config;
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      ha-card { height: ${
        c.height ? c.height + "px" : "var(--md3-height, 120px)"
      }; position: relative; cursor: pointer; touch-action: pan-y; user-select: none; -webkit-user-select: none; ${
        c.text_color ? "color:" + colorValue(c.text_color) + ";" : ""
      } }
      .fill { position: absolute; inset: 0 auto 0 0; width: 0; background: var(--md3-fill, var(--md3-primary-container)); transition: width .25s ease; }
      ha-card.drag .fill { transition: none; }
      .in { position: relative; height: 100%; padding: 0 16px; display: flex; align-items: center; gap: 12px; pointer-events: none; }
      .t { min-width: 0; flex: 1; }
      .sub { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ${
        c.bold_text ? "font-weight: 700;" : ""
      } }
      ha-icon { --mdc-icon-size: 26px; flex: none; }
      ha-card.off { opacity: .75; }
    </style><ha-card id="c"><div class="fill" id="fill"></div><div class="in"><ha-icon id="icon"></ha-icon><div class="t"><div class="title" id="name"></div><div class="sub" id="sub"></div></div></div></ha-card>`;
    const card = this.shadowRoot.getElementById("c");
    let x0 = 0,
      drag = false,
      down = false,
      held = false,
      timer = null,
      val = 0;
    const calc = (e, spec) => {
      const b = card.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (e.clientX - b.left) / b.width));
      return Math.round(spec.min + p * (spec.max - spec.min));
    };
    card.addEventListener("pointerdown", (e) => {
      down = true;
      drag = false;
      held = false;
      x0 = e.clientX;
      timer = setTimeout(() => {
        if (gestureBlocked()) return;
        held = true;
        if (!drag) {
          haptic();
          runAction(
            this,
            this._hass,
            this._config.hold_action,
            this._config.entity,
            true,
          );
        }
      }, 550);
    });
    card.addEventListener("pointermove", (e) => {
      if (!down) return;
      const s = this.stateObj;
      if (!s) return;
      if (!drag && Math.abs(e.clientX - x0) > 8) {
        drag = true;
        clearTimeout(timer);
        card.classList.add("drag");
        try {
          card.setPointerCapture(e.pointerId);
        } catch (_) {
          /* ignore */
        }
      }
      if (drag) {
        const spec = this._spec(s);
        val = calc(e, spec);
        this.shadowRoot.getElementById("fill").style.width = `${
          ((val - spec.min) / (spec.max - spec.min || 1)) * 100
        }%`;
        if (this._config.show_percentage !== false)
          this.shadowRoot.getElementById("sub").textContent =
            spec.attr === "brightness" ||
            spec.attr === "position" ||
            spec.attr === "saturation"
              ? `${val} %`
              : `${val}`;
      }
    });
    const end = (e) => {
      if (!down) return;
      down = false;
      clearTimeout(timer);
      card.classList.remove("drag");
      const s = this.stateObj;
      if (!s) return;
      if (drag) this._apply(s, val);
      else if (!held && e.type === "pointerup" && !gestureBlocked()) {
        haptic();
        const c2 = this._config;
        if (c2.tap_action)
          runAction(this, this._hass, c2.tap_action, c2.entity, false);
        else
          this._hass.callService("homeassistant", "toggle", {
            entity_id: s.entity_id,
          });
      }
    };
    card.addEventListener("pointerup", end);
    card.addEventListener("pointercancel", end);
  }
  _update() {
    const s = this.stateObj,
      r = this.shadowRoot,
      c = this._config;
    if (!r.getElementById("name")) return;
    r.getElementById("name").textContent = this._name();
    const ic = r.getElementById("icon");
    ic.setAttribute(
      "icon",
      c.icon ||
        (s && s.attributes.icon) ||
        (domainOf(c.entity) === "cover" ? "mdi:blinds" : "mdi:lightbulb"),
    );
    if (!s) return;
    const off = ["unavailable", "unknown"].includes(s.state);
    const spec = this._spec(s);
    const v = spec.get();
    const card = r.getElementById("c");
    if (!card.classList.contains("drag")) {
      r.getElementById("fill").style.width = `${Math.min(
        100,
        Math.max(0, ((v - spec.min) / (spec.max - spec.min || 1)) * 100),
      )}%`;
      const unitPct =
        spec.attr === "brightness" ||
        spec.attr === "position" ||
        spec.attr === "saturation";
      r.getElementById("sub").textContent = off
        ? formatState(this._hass, s)
        : c.show_percentage === false
          ? ""
          : unitPct
            ? v || s.state === "open"
              ? `${Math.round(v)} %`
              : formatState(this._hass, s)
            : `${Math.round(v)}`;
    }
    card.classList.toggle("off", off);
    ic.style.color = c.icon_color ? colorValue(c.icon_color) : "";
    let fill = c.background_color ? colorValue(c.background_color) : "";
    if (c.colorize && s.attributes.rgb_color && s.state === "on")
      fill = `rgb(${s.attributes.rgb_color.join(",")})`;
    card.style.setProperty("--md3-fill", fill);
  }
  static getStubConfig() {
    return { entity: "light.example" };
  }
}

/* ------------------------------------------------------------------ climate */
class Md3ClimateCard extends Md3Base {
  _build() {
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      ha-card { height: var(--md3-height, 120px); padding: 14px 16px; display: flex; flex-direction: column; justify-content: space-between; }
      ha-card.heat { background-image: linear-gradient(rgba(255,138,76,.30), rgba(255,138,76,.30)); background-color: var(--md3-surface); }
      ha-card.cool { background-image: linear-gradient(rgba(79,172,254,.28), rgba(79,172,254,.28)); background-color: var(--md3-surface); }
      ha-card.dry { background-image: linear-gradient(rgba(245,197,66,.28), rgba(245,197,66,.28)); background-color: var(--md3-surface); }
      ha-card.fan { background-image: linear-gradient(rgba(102,187,106,.28), rgba(102,187,106,.28)); background-color: var(--md3-surface); }
      ha-card.off, ha-card.unavailable { opacity: .75; }
      .head { display: flex; align-items: center; gap: 8px; cursor: pointer; }
      .head ha-icon { --mdc-icon-size: 20px; }
      .row { display: flex; align-items: center; justify-content: space-between; }
      .temp { font-size: 28px; font-weight: 600; line-height: 1; }
      .temp small { font-size: 13px; font-weight: 400; color: var(--md3-on-surface-variant); margin-left: 6px; }
    </style>
    <ha-card>
      <div class="head" id="head"><ha-icon id="icon"></ha-icon><div><div class="title" id="name"></div><div class="sub" id="sub"></div></div></div>
      <div class="row">
        <button class="icon-btn" id="minus"><ha-icon icon="mdi:minus"></ha-icon></button>
        <div class="temp"><span id="target"></span><small id="cur"></small></div>
        <button class="icon-btn" id="plus"><ha-icon icon="mdi:plus"></ha-icon></button>
      </div>
    </ha-card>`;
    const r = this.shadowRoot;
    r.getElementById("head").onclick = () =>
      moreInfo(this, this._config.entity);
    r.getElementById("minus").onclick = () => this._step(-1);
    r.getElementById("plus").onclick = () => this._step(1);
  }
  _step(dir) {
    const s = this.stateObj;
    if (!s) return;
    haptic();
    const c = this._config;
    const step = num(
      dir > 0 ? c.increase_temp : c.decrease_temp,
      num(
        c.step,
        num(
          s.attributes.target_temp_step,
          domainOf(s.entity_id) === "water_heater" ? 1 : 0.5,
        ),
      ),
    );
    const min = num(s.attributes.min_temp, 5),
      max = num(s.attributes.max_temp, 35);
    const cur =
      this._pending ??
      num(s.attributes.temperature, num(s.attributes.current_temperature, 20));
    const next = Math.min(
      max,
      Math.max(min, Math.round((cur + dir * step) / step) * step),
    );
    this._pending = next;
    this.shadowRoot.getElementById("target").textContent = `${next}°`;
    clearTimeout(this._t);
    this._t = setTimeout(() => {
      this._hass.callService(domainOf(s.entity_id), "set_temperature", {
        entity_id: s.entity_id,
        temperature: next,
      });
      this._pending = null;
    }, 600);
  }
  _update() {
    const s = this.stateObj;
    const r = this.shadowRoot;
    if (!r.getElementById("name")) return;
    r.getElementById("name").textContent = this._name();
    const card = r.querySelector("ha-card");
    if (!s) {
      card.className = "unavailable";
      r.getElementById("sub").textContent = "Nicht gefunden";
      return;
    }
    const a = s.attributes;
    const action = a.hvac_action;
    let cls = "";
    if (["unavailable", "unknown", "off"].includes(s.state)) cls = s.state;
    else if (this._config.use_material_color !== false) {
      if (a.preset_mode === "eco") cls = "fan";
      else if (
        action === "heating" ||
        s.state === "heat" ||
        s.state === "auto" ||
        s.state === "heat_cool"
      )
        cls = "heat";
      else if (action === "cooling" || s.state === "cool") cls = "cool";
      else if (s.state === "dry") cls = "dry";
      else if (s.state === "fan_only") cls = "fan";
    }
    card.className = cls;
    r.getElementById("icon").setAttribute(
      "icon",
      this._config.icon ||
        (s.state === "off"
          ? "mdi:thermostat-off"
          : action === "cooling"
            ? "mdi:snowflake"
            : "mdi:fire"),
    );
    r.getElementById("sub").textContent = formatState(this._hass, s);
    if (this._pending == null)
      r.getElementById("target").textContent =
        a.temperature != null ? `${a.temperature}°` : "–";
    r.getElementById("cur").textContent =
      a.current_temperature != null ? `Ist ${a.current_temperature}°` : "";
    const off = ["unavailable", "unknown"].includes(s.state);
    r.getElementById("minus").disabled = off;
    r.getElementById("plus").disabled = off;
  }
  static getStubConfig() {
    return { entity: "climate.example" };
  }
}

/* ---------------------------------------------------------------- dashboard */
class Md3DashboardCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tpl = null;
  }
  setConfig(config) {
    this._config = { ...config };
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      .g { display: grid; grid-template-columns: repeat(auto-fit, minmax(104px, 1fr)); gap: 8px; }
      .tile { height: var(--md3-height, 120px); border-radius: var(--md3-radius); padding: 14px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer;
        background: color-mix(in srgb, var(--tc, var(--md3-primary)) 16%, var(--md3-surface)); color: var(--md3-on-surface); user-select: none; }
      .tile:active { transform: scale(.98); }
      .tile ha-icon { --mdc-icon-size: 26px; color: var(--tc, var(--md3-primary)); }
      .tile .l { font-size: 12px; color: var(--md3-on-surface-variant); }
      .tile .n { font-weight: 600; font-size: 14px; }
    </style><div class="g" id="g"></div>`;
    this._sig = null;
    if (this._hass) this.hass = this._hass;
  }
  _tiles(h) {
    const c = this._config,
      L = {
        lighting: "Beleuchtung",
        wifi: "WLAN",
        climate: "Klima",
        cameras: "Kameras",
        ...(c.labels || {}),
      };
    const keys = Object.keys(h.states);
    const lights = keys.filter(
      (e) => e.startsWith("light.") && h.states[e].state !== "unavailable",
    );
    const lightsOn = lights.filter((e) => h.states[e].state === "on").length;
    const trackers = keys.filter(
      (e) =>
        e.startsWith("device_tracker.") &&
        h.states[e].state === "home" &&
        h.states[e].attributes.source_type === "router",
    );
    const climates = keys.filter((e) => e.startsWith("climate."));
    const cams = keys.filter((e) => e.startsWith("camera."));
    const t = [];
    const add = (key, name, icon, color, label) => {
      if (c[key] && !c[`hide_${key}`])
        t.push({ name, icon, color, label, path: c[key] });
    };
    add(
      "lighting",
      L.lighting,
      "mdi:lightbulb-group",
      "#f5c542",
      `${lightsOn}/${lights.length} Lichter`,
    );
    add("wifi", L.wifi, "mdi:wifi", "#66bb6a", `${trackers.length} Geräte`);
    add(
      "climate",
      L.climate,
      "mdi:thermostat",
      "#ef6c4d",
      `${climates.length} Geräte`,
    );
    add("cameras", L.cameras, "mdi:cctv", "#4facfe", `${cams.length} Kameras`);
    (c.custom_sections || []).forEach((sct) => {
      const ev = (v) =>
        typeof v === "string"
          ? renderJs(v, {
              entity: undefined,
              states: h.states,
              hass: h,
              user: h.user,
              config: c,
            })
          : v;
      if (ev(sct.hidden) === true || ev(sct.hidden) === "true") return;
      t.push({
        name: ev(sct.name),
        icon: ev(sct.icon),
        color: ev(sct.color),
        bg: ev(sct.background_color),
        label: ev(sct.label),
        path: sct.path,
      });
    });
    return t;
  }
  set hass(h) {
    this._hass = h;
    if (!this._config) return;
    const tiles = this._tiles(h);
    const sig = JSON.stringify(tiles);
    if (sig === this._sig) return;
    this._sig = sig;
    const g = this.shadowRoot.getElementById("g");
    g.innerHTML = "";
    tiles.forEach((tl) => {
      const d = document.createElement("div");
      d.className = "tile";
      if (tl.color) d.style.setProperty("--tc", colorValue(tl.color));
      if (tl.bg) d.style.background = colorValue(tl.bg);
      d.innerHTML = `<ha-icon icon="${esc(
        tl.icon,
      )}"></ha-icon><div><div class="n">${esc(
        tl.name,
      )}</div><div class="l">${esc(tl.label)}</div></div>`;
      d.onclick = () => {
        haptic();
        if (tl.path)
          runAction(this, h, { action: "navigate", navigation_path: tl.path });
      };
      g.appendChild(d);
    });
  }
  getCardSize() {
    return 2;
  }
  getGridOptions() {
    return { columns: 12, rows: 2, min_columns: 6 };
  }
  static getStubConfig() {
    return { lighting: "/lovelace/lights", climate: "/lovelace/climate" };
  }
}
/* ------------------------------------------------------------------- circle */
class Md3CircleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  setConfig(config) {
    if (!config || !config.entity) throw new Error("entity is required");
    this._config = { min: 0, max: 100, ...config };
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      ha-card { height: var(--md3-height, 120px); padding: 12px 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; }
      svg { width: 84px; height: 84px; flex: none; }
      .track { stroke: var(--md3-surface-high); }
      .bar { transition: stroke-dashoffset .6s ease, stroke .3s; stroke-linecap: round; }
      .val { font-size: 22px; font-weight: 600; }
      .col { min-width: 0; }
      ha-card.off { opacity: .75; }
      ha-card { container-type: inline-size; }
      @container (max-width: 230px) { ha-card { gap: 10px; padding: 12px; } svg { width: 56px; height: 56px; } .val { font-size: 17px; } }
    </style>
    <ha-card id="c"><svg viewBox="0 0 100 100">
      <circle class="track" cx="50" cy="50" r="42" fill="none" stroke-width="10"/>
      <circle class="bar" id="bar" cx="50" cy="50" r="42" fill="none" stroke-width="10" transform="rotate(-90 50 50)" stroke-dasharray="263.9" stroke-dashoffset="263.9"/>
      <foreignObject x="22" y="30" width="56" height="40"><div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;justify-content:center;align-items:center;height:100%"><ha-icon id="icon" style="--mdc-icon-size:30px;color:var(--md3-on-surface-variant)"></ha-icon></div></foreignObject>
    </svg>
    <div class="col"><div class="title" id="name"></div><div class="val" id="val"></div></div></ha-card>`;
    attachTap(
      this,
      this.shadowRoot.getElementById("c"),
      () => this._hass,
      () => this._config,
      () => this._config.entity,
    );
    if (this._hass) this.hass = this._hass;
  }
  _color(v, battery) {
    const sev = this._config.severity;
    if (Array.isArray(sev) && sev.length) {
      let c = sev[0].color;
      for (const s of sev) if (v >= num(s.from)) c = s.color;
      return colorValue(c);
    }
    if (battery)
      return v < 20
        ? "var(--md3-error)"
        : v < 50
          ? "#f5c542"
          : "var(--md3-primary)";
    return "var(--md3-primary)";
  }
  set hass(h) {
    this._hass = h;
    const c = this._config,
      r = this.shadowRoot;
    if (!c || !r.getElementById("name")) return;
    const s = h.states[c.entity];
    r.getElementById("name").textContent =
      c.name || (s && s.attributes.friendly_name) || c.entity;
    const raw = s ? (c.attribute ? s.attributes[c.attribute] : s.state) : null;
    const v = parseFloat(raw);
    const battery = !!(s && s.attributes.device_class === "battery");
    const unit = c.unit ?? (s && s.attributes.unit_of_measurement) ?? "";
    r.getElementById("val").textContent = isFinite(v)
      ? `${Math.round(v * 10) / 10}${unit ? " " + unit : ""}`
      : raw ?? "–";
    let icon = c.icon || (s && s.attributes.icon);
    if (!icon)
      icon = battery
        ? v < 20
          ? "mdi:battery-alert"
          : "mdi:battery"
        : "mdi:gauge";
    r.getElementById("icon").setAttribute("icon", icon);
    const pct = isFinite(v)
      ? Math.min(1, Math.max(0, (v - c.min) / (c.max - c.min || 1)))
      : 0;
    const bar = r.getElementById("bar");
    bar.style.strokeDashoffset = String(263.9 * (1 - pct));
    bar.style.stroke = this._color(isFinite(v) ? v : c.min, battery);
    r.getElementById("c").classList.toggle(
      "off",
      !!(s && ["unavailable", "unknown"].includes(s.state)),
    );
  }
  getCardSize() {
    return 2;
  }
  getGridOptions() {
    return { columns: 6, rows: 2, min_columns: 3, min_rows: 1 };
  }
  static getStubConfig() {
    return { entity: "sensor.example", min: 0, max: 100 };
  }
}

/* -------------------------------------------------------------------- graph */
class Md3GraphCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tpl = new Tpl(() => this._render());
  }
  disconnectedCallback() {
    this._tpl.dispose();
    this._tplReady = false;
  }
  connectedCallback() {
    if (this._hass && this._config && !this._tplReady) this._setupTpl();
  }
  _setupTpl() {
    this._tplReady = true;
    this._tpl.setup(this._hass, this._config, [
      "name",
      "label",
      "icon",
      "background_color",
      "text_color",
      "icon_color",
    ]);
  }
  setConfig(config) {
    if (!config || !config.entity) throw new Error("entity is required");
    this._config = {
      hours_to_show: config.hours ?? 24,
      max_height: 45,
      default_color: true,
      low_battery_level: 15,
      ...config,
    };
    const c = this._config;
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      ha-card { height: var(--md3-height, 120px); position: relative; cursor: pointer; }
      ha-card.low { background: var(--md3-error-container); }
      svg { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: ${Math.min(
        100,
        Math.max(10, num(c.max_height, 45)),
      )}%; }
      .area { fill: var(--gc, var(--md3-primary)); opacity: .16; }
      .line { fill: none; stroke: var(--gc, var(--md3-primary)); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
      .txt { position: relative; padding: 14px 16px; pointer-events: none; display: flex; align-items: flex-start; gap: 10px; text-shadow: 0 0 6px var(--md3-bg, var(--md3-surface)), 0 0 2px var(--md3-bg, var(--md3-surface)); }
      .txt ha-icon { --mdc-icon-size: 22px; }
      .val { font-size: 22px; font-weight: 700; }
      .chev { position: absolute; right: 10px; top: 14px; --mdc-icon-size: 20px; opacity: .6; display: none; }
      ha-card.chevron .chev { display: block; }
    </style>
    <ha-card id="c">
      <svg viewBox="0 0 300 100" preserveAspectRatio="none"><path class="area" id="area"/><path class="line" id="line"/></svg>
      <div class="txt"><ha-icon id="icon"></ha-icon><div><div class="title" id="name"></div><div class="val" id="val"></div></div></div>
      <ha-icon class="chev" icon="mdi:chevron-right"></ha-icon>
    </ha-card>`;
    attachTap(
      this,
      this.shadowRoot.getElementById("c"),
      () => this._hass,
      () => this._config,
      () => this._config.entity,
    );
    this._lastFetch = 0;
    if (this._hass) {
      this._setupTpl();
      this._render();
    }
  }
  set hass(h) {
    const first = !this._hass;
    this._hass = h;
    if (!this._config) return;
    if (first && !this._tplReady) this._setupTpl();
    this._render();
  }
  async _load() {
    if (!this._hass || Date.now() - this._lastFetch < 5 * 60 * 1000) return;
    this._lastFetch = Date.now();
    try {
      const pts = await fetchHistory(
        this._hass,
        this._config.entity,
        num(this._config.hours_to_show, 24),
      );
      const st = this._hass.states[this._config.entity];
      const p = sparkPath(pts, 300, 100, 6, {
        padX: 0,
        hours: num(this._config.hours_to_show, 24),
        smooth: this._config.smooth,
        buckets: this._config.buckets,
        minSpan: this._config.min_range,
        unit: st && st.attributes.unit_of_measurement,
      });
      this.shadowRoot.getElementById("line").setAttribute("d", p.line);
      this.shadowRoot.getElementById("area").setAttribute("d", p.area);
    } catch (e) {
      this._lastFetch = 0;
    }
  }
  _render() {
    const h = this._hass,
      c = this._config,
      r = this.shadowRoot;
    if (!h || !r.getElementById("name")) return;
    const s = h.states[c.entity];
    const t = (k) => this._tpl.get(k, h);
    r.getElementById("name").textContent =
      t("name") ?? (s && s.attributes.friendly_name) ?? c.entity;
    const unit = (s && s.attributes.unit_of_measurement) || "";
    r.getElementById("val").textContent =
      t("label") ?? (s ? `${formatState(h, s)}`.replace(/\s*$/, "") : "–");
    const ic = r.getElementById("icon");
    const icon = t("icon") || (s && s.attributes.icon);
    ic.style.display = icon ? "" : "none";
    if (icon) ic.setAttribute("icon", icon);
    ic.style.color = t("icon_color") ? colorValue(t("icon_color")) : "";
    const card = r.getElementById("c");
    const low = !!(
      c.low_battery_color &&
      s &&
      num(s.state, 100) <= num(c.low_battery_level, 15) &&
      s.attributes.device_class === "battery"
    );
    card.classList.toggle("low", low);
    card.classList.toggle("chevron", !!(c.show_chevron || c.show_shavron_icon));
    card.style.setProperty(
      "--md3-bg",
      t("background_color") ? colorValue(t("background_color")) : "",
    );
    card.style.setProperty(
      "--md3-fg",
      t("text_color") ? colorValue(t("text_color")) : "",
    );
    card.style.setProperty(
      "--gc",
      c.default_color === false && c.graph_color
        ? colorValue(c.graph_color)
        : "",
    );
    if (!unit && !s) r.getElementById("val").textContent = "–";
    this._load();
  }
  getCardSize() {
    return 2;
  }
  getGridOptions() {
    return { columns: 6, rows: 2, min_columns: 3, min_rows: 1 };
  }
  static getStubConfig() {
    return { entity: "sensor.example", hours_to_show: 24 };
  }
}

/* -------------------------------------------------------------- media card */
const APP_ICONS = [
  [/spotify/i, "mdi:spotify"],
  [/netflix/i, "mdi:netflix"],
  [/youtube\s*music/i, "mdi:youtube-music"],
  [/youtube/i, "mdi:youtube"],
  [/prime|amazon/i, "mdi:amazon"],
  [/plex/i, "mdi:plex"],
  [/disney/i, "mdi:disney-plus"],
  [/twitch/i, "mdi:twitch"],
  [/apple\s*tv|appletv/i, "mdi:apple"],
  [/kodi/i, "mdi:kodi"],
  [/sonos/i, "mdi:speaker-wireless"],
  [/tidal/i, "mdi:music-circle"],
];
class Md3MediaCard extends Md3Base {
  _build() {
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      ha-card { height: var(--md3-height, 120px); position: relative; padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between; background-size: cover; background-position: center; cursor: pointer; }
      .scrim { position: absolute; inset: 0; background: linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.7)); }
      ha-card:not(.cover) .scrim { display: none; }
      .z { position: relative; }
      ha-card.cover .z { color: #fff; }
      .top { display: flex; align-items: center; gap: 8px; }
      .top .n { flex: 1; font-size: 12px; font-weight: 600; }
      .mid { display: flex; align-items: center; gap: 10px; }
      .mid .t { flex: 1; min-width: 0; }
      .mid .title { font-size: 14px; }
      .mid .sub { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      ha-card.cover .mid .sub { color: rgba(255,255,255,.75); }
      .play { width: 46px; height: 46px; border-radius: 16px; background: var(--md3-primary-container); color: var(--md3-on-primary-container); display: flex; align-items: center; justify-content: center; }
      .bar { display: flex; align-items: center; gap: 8px; font-size: 10px; font-variant-numeric: tabular-nums; }
      .bar.hide { display: none; }
      .bar .track { flex: 1; height: 4px; border-radius: 2px; background: rgba(127,127,127,.35); cursor: pointer; position: relative; }
      .bar .fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 2px; background: currentColor; }
      .bar button { display: flex; }
      ha-icon { --mdc-icon-size: 20px; }
      ha-card.idle .z { opacity: .8; }
    </style>
    <ha-card id="c"><div class="scrim"></div>
      <div class="z top"><ha-icon id="app" icon="mdi:speaker"></ha-icon><div class="n" id="name"></div><button id="mi"><ha-icon icon="mdi:dots-vertical"></ha-icon></button></div>
      <div class="z mid"><div class="t"><div class="title" id="title"></div><div class="sub" id="artist"></div></div><button class="play" id="play"><ha-icon id="pi" icon="mdi:play" style="--mdc-icon-size:26px"></ha-icon></button></div>
      <div class="z bar" id="bar"><button id="prev"><ha-icon icon="mdi:skip-previous"></ha-icon></button><span id="pos">0:00</span><div class="track" id="track"><div class="fill" id="fill"></div></div><span id="dur">0:00</span><button id="next"><ha-icon icon="mdi:skip-next"></ha-icon></button></div>
    </ha-card>`;
    const r = this.shadowRoot;
    const stop = (el) =>
      ["click", "pointerdown"].forEach((ev) =>
        el.addEventListener(ev, (e) => e.stopPropagation()),
      );
    ["play", "prev", "next", "mi", "track"].forEach((id) =>
      stop(r.getElementById(id)),
    );
    const call = (svc, data = {}) => {
      haptic();
      this._hass.callService("media_player", svc, {
        entity_id: this._config.entity,
        ...data,
      });
    };
    r.getElementById("play").addEventListener("click", () =>
      call("media_play_pause"),
    );
    r.getElementById("prev").addEventListener("click", () =>
      call("media_previous_track"),
    );
    r.getElementById("next").addEventListener("click", () =>
      call("media_next_track"),
    );
    r.getElementById("mi").addEventListener("click", () =>
      moreInfo(this, this._config.entity),
    );
    r.getElementById("track").addEventListener("click", (e) => {
      const s = this.stateObj;
      if (!s || !s.attributes.media_duration) return;
      const b = e.currentTarget.getBoundingClientRect();
      call("media_seek", {
        seek_position: Math.round(
          ((e.clientX - b.left) / b.width) * s.attributes.media_duration,
        ),
      });
    });
    attachTap(
      this,
      r.getElementById("c"),
      () => this._hass,
      () => this._config,
      () => this._config.entity,
    );
    clearInterval(this._tick);
    this._tick = setInterval(() => this._progress(), 1000);
  }
  disconnectedCallback() {
    clearInterval(this._tick);
    this._tick = null;
  }
  connectedCallback() {
    if (this._config && !this._tick)
      this._tick = setInterval(() => this._progress(), 1000);
  }
  _fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  }
  _progress() {
    const s = this.stateObj,
      r = this.shadowRoot;
    if (!s || !r.getElementById("fill")) return;
    const a = s.attributes;
    const dur = num(a.media_duration);
    let pos = num(a.media_position);
    if (s.state === "playing" && a.media_position_updated_at)
      pos +=
        (Date.now() - new Date(a.media_position_updated_at).getTime()) / 1000;
    pos = Math.min(dur || pos, pos);
    r.getElementById("fill").style.width = dur
      ? `${Math.min(100, (pos / dur) * 100)}%`
      : "0%";
    r.getElementById("pos").textContent = this._fmt(pos);
    r.getElementById("dur").textContent = this._fmt(dur);
  }
  _update() {
    const s = this.stateObj,
      r = this.shadowRoot,
      st = {
        show_name: false,
        show_dynamic_icon: true,
        show_app_icon: true,
        show_cover: true,
        show_time: true,
        ...(this._config.settings || {}),
      };
    if (!r.getElementById("name")) return;
    r.getElementById("name").textContent = st.show_name
      ? this._name()
      : (s && s.attributes.app_name) || "";
    if (!s) return;
    const a = s.attributes;
    const active = ["playing", "paused", "buffering"].includes(s.state);
    const card = r.getElementById("c");
    const pic = a.entity_picture_local || a.entity_picture;
    const showCover = st.show_cover && pic && active;
    card.className = (active ? "" : "idle ") + (showCover ? "cover" : "");
    card.style.backgroundImage = showCover
      ? `url("${this._hass.hassUrl ? this._hass.hassUrl(pic) : pic}")`
      : "";
    r.getElementById("title").textContent = active
      ? a.media_title || a.source || ""
      : formatState(this._hass, s);
    r.getElementById("artist").textContent = active
      ? [a.media_artist, a.media_album_name].filter(Boolean).join(" · ")
      : "";
    let icon = this._config.icon;
    if (!icon && st.show_app_icon && a.app_name) {
      const m = APP_ICONS.find(([re]) => re.test(a.app_name));
      if (m) icon = m[1];
    }
    if (!icon && st.show_dynamic_icon)
      icon =
        {
          tv: "mdi:television",
          speaker: "mdi:speaker",
          receiver: "mdi:audio-video",
        }[a.device_class] || a.icon;
    r.getElementById("app").setAttribute("icon", icon || "mdi:cast");
    r.getElementById("pi").setAttribute(
      "icon",
      s.state === "playing" ? "mdi:pause" : "mdi:play",
    );
    r.getElementById("bar").classList.toggle("hide", st.show_time === false);
    this._progress();
  }
  getGridOptions() {
    return { columns: 12, rows: 2, min_columns: 6, min_rows: 2 };
  }
  static getStubConfig() {
    return { entity: "media_player.example" };
  }
}

/* --------------------------------------------------------------- alarm card */
class Md3AlarmCard extends Md3Base {
  getGridOptions() {
    return this._config && this._config.display_style === "extended"
      ? { columns: 12, rows: 4, min_columns: 6 }
      : { columns: 6, rows: 2, min_columns: 3 };
  }
  _modes(s) {
    const f = num(s.attributes.supported_features);
    const m = [];
    if (f & 1) m.push(["alarm_arm_home", "Zuhause", "mdi:home"]);
    if (f & 2) m.push(["alarm_arm_away", "Abwesend", "mdi:map-marker"]);
    if (f & 4) m.push(["alarm_arm_night", "Nacht", "mdi:weather-night"]);
    if (f & 16) m.push(["alarm_arm_vacation", "Urlaub", "mdi:airplane"]);
    return m;
  }
  _build() {
    const ext = this._config.display_style === "extended";
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      ha-card { height: ${
        ext ? "auto" : "var(--md3-height, 120px)"
      }; padding: 16px; cursor: pointer; display: flex; flex-direction: column; gap: 12px; ${
        ext ? "" : "justify-content: center;"
      } }
      ha-card.triggered { background: var(--md3-error-container); }
      .head { display: flex; align-items: center; gap: 12px; }
      .head .t { flex: 1; min-width: 0; }
      .head ha-icon.main { --mdc-icon-size: 28px; }
      .lock { width: 44px; height: 44px; border-radius: 16px; background: var(--md3-primary-container); color: var(--md3-on-primary-container); display: flex; align-items: center; justify-content: center; }
      .chip2 { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: var(--md3-surface-high); font-size: 12px; width: fit-content; }
      .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--dc, #888); }
      .big { align-self: center; width: 88px; height: 88px; border-radius: 28px; background: var(--md3-surface-high); display: flex; align-items: center; justify-content: center; }
      .big ha-icon { --mdc-icon-size: 48px; color: var(--ic, var(--md3-on-surface)); }
      .seg { display: flex; gap: 4px; padding: 6px; border-radius: 22px; background: var(--md3-surface-high); }
      .seg button { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 4px; border-radius: 16px; font-size: 11px; }
      .seg button.on { background: var(--md3-primary-container); color: var(--md3-on-primary-container); }
      .seg ha-icon { --mdc-icon-size: 20px; }
      .compact .lock { display: none; }
    </style>
    <ha-card id="c" class="${ext ? "ext" : "compact"}">
      <div class="head"><ha-icon class="main" id="icon"></ha-icon><div class="t"><div class="title" id="name"></div><div class="sub" id="state"></div></div>
        <button class="lock" id="lock"><ha-icon icon="mdi:lock"></ha-icon></button></div>
      <div id="extra"></div>
    </ha-card>`;
    const r = this.shadowRoot;
    r.getElementById("lock").onclick = (e) => {
      e.stopPropagation();
      openMd3Dialog(this._hass, this._config.entity, {
        alarm: this._config.settings || {},
      });
    };
    attachTap(
      this,
      r.getElementById("c"),
      () => this._hass,
      () => this._config,
      () => this._config.entity,
    );
  }
  _update() {
    const s = this.stateObj,
      r = this.shadowRoot;
    if (!r.getElementById("name")) return;
    r.getElementById("name").textContent = this._name();
    if (!s) return;
    const ext = this._config.display_style === "extended";
    const sig = s.state + (ext ? "x" : "c");
    r.getElementById("c").classList.toggle(
      "triggered",
      s.state === "triggered",
    );
    r.getElementById("state").textContent = formatState(this._hass, s);
    const armed = s.state.startsWith("armed");
    const icon =
      this._config.icon ||
      (s.state === "triggered"
        ? "mdi:bell-ring"
        : armed
          ? "mdi:shield-check"
          : "mdi:shield-off-outline");
    r.getElementById("icon").setAttribute("icon", icon);
    if (sig === this._sig) return;
    this._sig = sig;
    const extra = r.getElementById("extra");
    extra.innerHTML = "";
    if (!ext) return;
    const col =
      s.state === "triggered"
        ? "var(--md3-error)"
        : armed
          ? "#66bb6a"
          : ["arming", "pending"].includes(s.state)
            ? "#f5c542"
            : "#888";
    const chip = document.createElement("div");
    chip.className = "chip2";
    chip.innerHTML = `<span class="dot" style="--dc:${col}"></span>${esc(
      formatState(this._hass, s),
    )}`;
    const big = document.createElement("div");
    big.className = "big";
    big.innerHTML = `<ha-icon icon="${
      s.state === "triggered"
        ? "mdi:bell-ring"
        : armed
          ? "mdi:shield-check"
          : "mdi:shield-off-outline"
    }" style="--ic:${col}"></ha-icon>`;
    const seg = document.createElement("div");
    seg.className = "seg";
    const needCode = !!s.attributes.code_format;
    this._modes(s).forEach(([svc, label, ic]) => {
      const b = document.createElement("button");
      b.className =
        s.state === svc.replace("alarm_", "").replace("arm_", "armed_")
          ? "on"
          : "";
      b.innerHTML = `<ha-icon icon="${ic}"></ha-icon>${esc(label)}`;
      b.onclick = (e) => {
        e.stopPropagation();
        haptic();
        if (needCode)
          openMd3Dialog(this._hass, this._config.entity, {
            alarm: this._config.settings || {},
          });
        else
          this._hass.callService("alarm_control_panel", svc, {
            entity_id: this._config.entity,
          });
      };
      seg.appendChild(b);
    });
    if (armed || s.state === "triggered") {
      const d = document.createElement("button");
      d.innerHTML = `<ha-icon icon="mdi:shield-off"></ha-icon>Aus`;
      d.onclick = (e) => {
        e.stopPropagation();
        haptic();
        if (needCode)
          openMd3Dialog(this._hass, this._config.entity, {
            alarm: this._config.settings || {},
          });
        else
          this._hass.callService("alarm_control_panel", "alarm_disarm", {
            entity_id: this._config.entity,
          });
      };
      seg.appendChild(d);
    }
    extra.append(chip, big, seg);
  }
  static getStubConfig() {
    return { entity: "alarm_control_panel.example", display_style: "compact" };
  }
}

/* -------------------------------------------------------------------- users */
class Md3UsersCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  setConfig(config) {
    this._config = { ...config };
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      ha-card { background: transparent; }
      .row { display: flex; gap: 14px; flex-wrap: wrap; }
      .u { display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; width: 64px; }
      .a { width: 52px; height: 52px; border-radius: 50%; background: var(--md3-primary-container); color: var(--md3-on-primary-container); display: flex; align-items: center; justify-content: center; font-weight: 600; background-size: cover; background-position: center; border: 3px solid transparent; }
      .u.home .a { border-color: var(--md3-primary); }
      .u:not(.home) .a { filter: grayscale(.8); opacity: .8; }
      .u.add .a { background: var(--md3-surface-high); color: var(--md3-on-surface); }
      .n { font-size: 12px; max-width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    </style><ha-card><div class="row" id="row"></div></ha-card>`;
    this._sig = null;
    if (this._hass) this.hass = this._hass;
  }
  set hass(h) {
    this._hass = h;
    const c = this._config;
    if (!c) return;
    const admin = !!(h.user && h.user.is_admin);
    const ids =
      c.entities ||
      Object.keys(h.states).filter((e) => e.startsWith("person."));
    const sig =
      ids.map((e) => e + (h.states[e] && h.states[e].state)).join("|") + admin;
    if (sig === this._sig) return;
    this._sig = sig;
    const row = this.shadowRoot.getElementById("row");
    row.innerHTML = "";
    ids.forEach((e) => {
      const s = h.states[e];
      if (!s) return;
      const u = document.createElement("div");
      u.className = "u" + (s.state === "home" ? " home" : "");
      const a = document.createElement("div");
      a.className = "a";
      const pic = s.attributes.entity_picture;
      if (pic) a.style.backgroundImage = `url("${pic}")`;
      else
        a.textContent = (s.attributes.friendly_name || "?")
          .charAt(0)
          .toUpperCase();
      const n = document.createElement("div");
      n.className = "n";
      n.textContent = s.attributes.friendly_name || e;
      u.append(a, n);
      u.onclick = () => {
        if (admin || c.is_user_map_enabled !== false) openMd3Dialog(h, e);
      };
      row.appendChild(u);
    });
    if (c.is_add_button_enabled === true) {
      const u = document.createElement("div");
      u.className = "u add";
      u.innerHTML = `<div class="a"><ha-icon icon="mdi:${
        admin ? "account-plus" : "account"
      }"></ha-icon></div><div class="n">${
        admin ? "Hinzufügen" : "Profil"
      }</div>`;
      u.onclick = () =>
        runAction(this, h, {
          action: "navigate",
          navigation_path: admin ? "/config/person" : "/profile",
        });
      row.appendChild(u);
    }
  }
  getCardSize() {
    return 1;
  }
  getGridOptions() {
    return { columns: 12, rows: 1, min_columns: 3 };
  }
  static getStubConfig() {
    return {};
  }
}

/* ------------------------------------------------------------------- header */
class Md3HeaderCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  setConfig(config) {
    this._config = {
      show_search: true,
      search_behavior: "assist",
      icon: "mdi:star-four-points",
      show_user: true,
      ...config,
    };
    const c = this._config;
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      ha-card { background: transparent; box-shadow: none; border: 0; }
      .row { display: flex; align-items: center; gap: 12px; padding: 4px 0; }
      .menu { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--md3-on-surface); }
      .pill { flex: 1; height: 48px; border-radius: 999px; padding: 2px; cursor: pointer; background: linear-gradient(90deg, #4caf50, #fbc02d, #e57373, #5c6bc0, #4caf50); ${
        c.show_search ? "" : "display:none;"
      } }
      .pill > div { height: 100%; border-radius: 999px; background: var(--md3-surface); display: flex; align-items: center; gap: 12px; padding: 0 6px; }
      .pill #t { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
      .spark { width: 36px; height: 36px; border-radius: 50%; background: var(--md3-primary-container); color: var(--md3-on-primary-container); display: flex; align-items: center; justify-content: center; flex: none; }
      .sp { flex: 1; }
      .avatar { width: 44px; height: 44px; border-radius: 50%; display: ${
        c.show_user ? "flex" : "none"
      }; align-items: center; justify-content: center; overflow: hidden;
        background: var(--md3-primary-container); color: var(--md3-on-primary-container); font-weight: 600; cursor: pointer; background-size: cover; background-position: center; }
    </style><ha-card><div class="row"><button class="menu" id="menu"><ha-icon icon="mdi:menu"></ha-icon></button>
      <div class="pill" id="pill"><div><span class="spark"><ha-icon id="ic"></ha-icon></span><span id="t"></span></div></div>${
        c.show_search ? "" : '<div class="sp"></div>'
      }
      <div class="avatar" id="avatar"></div></div></ha-card>`;
    const r = this.shadowRoot;
    r.getElementById("ic").setAttribute("icon", c.icon);
    r.getElementById("menu").onclick = () => fire(this, "hass-toggle-menu");
    r.getElementById("pill").onclick = () => {
      if (c.search_behavior === "search") {
        window.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "e",
            code: "KeyE",
            bubbles: true,
          }),
        );
        document.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "e",
            code: "KeyE",
            bubbles: true,
          }),
        );
      } else runAction(this, this._hass, { action: "assist" });
    };
    r.getElementById("avatar").onclick = () =>
      runAction(
        this,
        this._hass,
        c.avatar_action || { action: "navigate", navigation_path: "/profile" },
      );
    if (this._hass) this.hass = this._hass;
  }
  set hass(h) {
    this._hass = h;
    const r = this.shadowRoot;
    const av = r.getElementById("avatar");
    if (!av) return;
    const person = this._config.person && h.states[this._config.person];
    const pic = person && person.attributes.entity_picture;
    const name =
      (person && person.attributes.friendly_name) ||
      (h.user && h.user.name) ||
      "?";
    av.style.backgroundImage = pic ? `url("${pic}")` : "";
    av.textContent = pic ? "" : name.trim().charAt(0).toUpperCase();
    r.getElementById("t").textContent =
      this._config.title || document.title.split(/[–-]/)[0].trim() || "Home";
  }
  getCardSize() {
    return 1;
  }
  getGridOptions() {
    return { columns: 12, rows: 1, min_columns: 6 };
  }
  static getStubConfig() {
    return {};
  }
}

/* ------------------------------------------------------------------- lights */
class Md3LightsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  setConfig(config) {
    this._config = { on_text: "Alle an", off_text: "Alle aus", ...config };
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      ha-card { background: transparent; display: flex; height: 64px; border-radius: 0; }
      button { flex: 1; font-size: 15px; font-weight: 600; border: 1px solid transparent; background: var(--md3-surface); color: var(--md3-on-surface-variant); }
      #on { border-radius: 999px 0 0 999px; }
      #off { border-radius: 0 999px 999px 0; }
      button.act { background: var(--md-sys-color-tertiary-container, #50472a); color: var(--md-sys-color-on-tertiary-container, #ffe083); border-color: var(--md-sys-color-tertiary, #fae093); }
    </style><ha-card><button id="on"></button><button id="off"></button></ha-card>`;
    const r = this.shadowRoot;
    r.getElementById("on").textContent = this._config.on_text;
    r.getElementById("off").textContent = this._config.off_text;
    r.getElementById("on").onclick = () => this._set(true);
    r.getElementById("off").onclick = () => this._set(false);
    if (this._hass) this.hass = this._hass;
  }
  _lights() {
    const h = this._hass,
      c = this._config;
    let ids = Object.keys(h.states).filter((e) => e.startsWith("light."));
    if (c.entities) ids = c.entities;
    else if (c.area_id && c.control_area !== false) {
      ids = ids.filter((e) => {
        const ent = h.entities && h.entities[e];
        if (!ent) return false;
        const area =
          ent.area_id ||
          (ent.device_id &&
            h.devices[ent.device_id] &&
            h.devices[ent.device_id].area_id);
        return area === c.area_id;
      });
    }
    return ids.filter(
      (e) => h.states[e] && h.states[e].state !== "unavailable",
    );
  }
  _set(on) {
    haptic();
    const ids = this._lights();
    if (ids.length)
      this._hass.callService("light", on ? "turn_on" : "turn_off", {
        entity_id: ids,
      });
  }
  set hass(h) {
    this._hass = h;
    const r = this.shadowRoot;
    if (!this._config || !r.getElementById("on")) return;
    const any = this._lights().some((e) => h.states[e].state === "on");
    r.getElementById("on").classList.toggle("act", any);
    r.getElementById("off").classList.toggle("act", !any);
  }
  getCardSize() {
    return 1;
  }
  getGridOptions() {
    return { columns: 12, rows: 1, min_columns: 6 };
  }
  static getStubConfig() {
    return {};
  }
}

/* ------------------------------------------------------------ select (chips) */
class Md3SelectCard extends Md3Base {
  setConfig(config) {
    if (!config || !config.entity) throw new Error("entity is required");
    this._config = { display: "chips", ...config };
    this._build();
    if (this._hass) this._update();
  }
  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }
  _build() {
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      ha-card { padding: 14px 16px; }
      .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
      select { width: 100%; margin-top: 10px; padding: 12px; border-radius: 16px; border: 0; background: var(--md3-surface-high); color: var(--md3-on-surface); font: inherit; }
    </style><ha-card><div class="title" id="name"></div><div id="body"></div></ha-card>`;
    this._sig = null;
  }
  _update() {
    const s = this.stateObj;
    const r = this.shadowRoot;
    if (!r.getElementById("name")) return;
    r.getElementById("name").textContent = this._name();
    const body = r.getElementById("body");
    if (!s) {
      body.textContent = "Nicht gefunden";
      return;
    }
    const options = this._config.options || s.attributes.options || [];
    const sig = options.join("|") + "#" + s.state + "#" + this._config.display;
    if (sig === this._sig) return;
    this._sig = sig;
    const pick = (o) => {
      haptic();
      this._hass.callService(domainOf(s.entity_id), "select_option", {
        entity_id: s.entity_id,
        option: o,
      });
    };
    body.innerHTML = "";
    if (this._config.display === "dropdown") {
      const sel = document.createElement("select");
      options.forEach((o) => {
        const op = document.createElement("option");
        op.value = o;
        op.textContent = o;
        op.selected = o === s.state;
        sel.appendChild(op);
      });
      sel.onchange = () => pick(sel.value);
      body.appendChild(sel);
    } else {
      const wrap = document.createElement("div");
      wrap.className = "chips";
      options.forEach((o) => {
        const b = document.createElement("button");
        b.className = "chip" + (o === s.state ? " on" : "");
        b.textContent = o;
        b.onclick = () => pick(o);
        wrap.appendChild(b);
      });
      body.appendChild(wrap);
    }
  }
  static getStubConfig() {
    return { entity: "input_select.example" };
  }
}

/* -------------------------------------------------------------- group tile */
class Md3GroupCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  setConfig(config) {
    this._config = { ...config };
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      ha-card { height: var(--md3-height, 120px); padding: 16px; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer; }
      ha-card.on { background: var(--md3-primary-container); color: var(--md3-on-primary-container); }
      ha-icon { --mdc-icon-size: 26px; }
    </style><ha-card id="c"><ha-icon id="icon"></ha-icon><div><div class="title" id="name"></div><div class="sub" id="sub"></div></div></ha-card>`;
    this.shadowRoot.getElementById("c").onclick = () => {
      const ids = this._config.entities || [];
      if (ids.length) {
        haptic();
        openMd3Dialog(this._hass, ids[0], {
          name: this._config.name,
          icon: this._config.icon,
          entities: ids,
        });
      }
    };
    if (this._hass) this.hass = this._hass;
  }
  set hass(h) {
    this._hass = h;
    const c = this._config,
      r = this.shadowRoot;
    if (!c || !r.getElementById("name")) return;
    const ids = c.entities || [];
    const want = c.count_state || "on";
    const n = ids.filter(
      (e) => h.states[e] && h.states[e].state === want,
    ).length;
    r.getElementById("name").textContent = c.name || "";
    r.getElementById("icon").setAttribute(
      "icon",
      c.icon || "mdi:format-list-bulleted",
    );
    r.getElementById("icon").style.color = c.icon_color
      ? colorValue(c.icon_color)
      : "";
    r.getElementById("sub").textContent =
      c.secondary ?? `${n}/${ids.length}${c.label ? " " + c.label : ""}`;
    r.getElementById("c").classList.toggle(
      "on",
      n > 0 && c.highlight !== false,
    );
  }
  getCardSize() {
    return 2;
  }
  getGridOptions() {
    return { columns: 6, rows: 2, min_columns: 3, min_rows: 1 };
  }
  static getStubConfig() {
    return { name: "Gruppe", icon: "mdi:format-list-bulleted", entities: [] };
  }
}

/* ---------------------------------------------------------------- appliance */
const APPLIANCE_IDLE = [
  "off",
  "idle",
  "ready",
  "unknown",
  "unavailable",
  "finished",
  "standby",
  "none",
  "inactive",
];
/** Minutes left according to a duration (min / s / h) or timestamp sensor; 0 when unknown. */
function applianceMinutes(h, entityId) {
  const e = entityId && h.states[entityId];
  if (!e || ["unknown", "unavailable"].includes(e.state)) return 0;
  if (e.attributes.device_class === "timestamp")
    return Math.ceil((new Date(e.state).getTime() - Date.now()) / 60000);
  let m = num(e.state, NaN);
  if (!isFinite(m)) return 0;
  const u = e.attributes.unit_of_measurement || "";
  if (u === "s") m /= 60;
  else if (u === "h") m *= 60;
  return Math.round(m);
}

class Md3ApplianceCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  setConfig(config) {
    if (!config || !config.entity) throw new Error("entity is required");
    this._config = { ...config };
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      ha-card { height: var(--md3-height, 120px); padding: 0 16px; position: relative; display: flex; align-items: center; cursor: pointer; }
      .row { display: flex; align-items: center; gap: 12px; width: 100%; }
      .ic { width: 40px; height: 40px; border-radius: 14px; flex: none; display: flex; align-items: center; justify-content: center; background: var(--md3-surface-high); }
      ha-card.run .ic { background: var(--md3-primary-container); color: var(--md3-on-primary-container); }
      ha-card.run.spin ha-icon { animation: md3spin 2.4s linear infinite; }
      @keyframes md3spin { to { transform: rotate(360deg); } }
      ha-icon { --mdc-icon-size: 24px; }
      .t { min-width: 0; flex: 1; }
      .title { -webkit-line-clamp: 1; }
      .sub, .rem { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .rem { font-size: 13px; font-weight: 500; color: var(--md3-primary); }
      .rem[hidden], .rem .s { display: none; }
      .bar { position: absolute; left: 16px; right: 16px; bottom: 12px; height: 6px; border-radius: 3px; background: var(--md3-surface-high); overflow: hidden; display: none; }
      ha-card.run .bar { display: block; }
      .bar i { display: block; height: 100%; width: 0; border-radius: 3px; background: var(--md3-primary); transition: width .6s ease; }
      ha-card.off { opacity: .75; }
      @container (max-width: 210px) { .title { font-size: 13px; } .sub { font-size: 11px; } .rem { font-size: 12px; } .rem .l { display: none; } .rem .s { display: inline; } .ic { width: 34px; height: 34px; } ha-card { padding: 0 12px; } .bar { left: 12px; right: 12px; } }
      ha-card { container-type: inline-size; }
    </style><ha-card id="c"><div class="row"><div class="ic"><ha-icon id="icon"></ha-icon></div><div class="t"><div class="title" id="name"></div><div class="sub" id="sub"></div><div class="rem" id="rem" hidden></div></div></div><div class="bar"><i id="fill"></i></div></ha-card>`;
    attachTap(
      this,
      this.shadowRoot.getElementById("c"),
      () => this._hass,
      () => this._tapConfig(),
      () => this._config.entity,
    );
    if (this._hass) this.hass = this._hass;
  }
  /** Tap opens the appliance dialog unless an own tap_action is configured. */
  _tapConfig() {
    const c = this._config;
    if (c.tap_action) return c;
    const {
      program_entity,
      progress_entity,
      remaining_entity,
      name,
      icon,
      spin,
    } = c;
    return {
      ...c,
      tap_action: {
        action: "md3-dialog",
        dialog: {
          ...(c.dialog || {}),
          name,
          icon,
          appliance: {
            program_entity,
            progress_entity,
            remaining_entity,
            name,
            icon,
            spin,
          },
        },
      },
    };
  }
  _remaining(h) {
    return applianceMinutes(h, this._config.remaining_entity);
  }
  connectedCallback() {
    this._tick = setInterval(
      () => this._hass && (this.hass = this._hass),
      30000,
    );
  }
  disconnectedCallback() {
    clearInterval(this._tick);
  }
  set hass(h) {
    this._hass = h;
    const c = this._config,
      r = this.shadowRoot;
    if (!c || !r.getElementById("name")) return;
    const s = h.states[c.entity];
    const st = s ? s.state : "unavailable";
    const active = !APPLIANCE_IDLE.includes(String(st).toLowerCase());
    const card = r.getElementById("c");
    card.className =
      (active ? "run" : "") +
      (active && c.spin !== false && String(st).toLowerCase() === "running"
        ? " spin"
        : "") +
      (st === "unavailable" ? " off" : "");
    r.getElementById("name").textContent =
      c.name || (s && s.attributes.friendly_name) || "";
    r.getElementById("icon").setAttribute(
      "icon",
      c.icon || (s && s.attributes.icon) || "mdi:washing-machine",
    );
    const prog = c.program_entity && h.states[c.program_entity];
    const parts = [formatState(h, s)];
    if (
      active &&
      prog &&
      !["unknown", "unavailable", "none"].includes(prog.state)
    )
      parts.push(formatState(h, prog));
    r.getElementById("sub").textContent = parts.join(" • ");
    const mins = active ? this._remaining(h) : 0;
    const remEl = r.getElementById("rem");
    remEl.innerHTML =
      mins > 0
        ? `<span class="l">${fmtRemaining(
            mins,
          )}</span><span class="s">${fmtRemaining(mins, true)}</span>`
        : "";
    remEl.hidden = !(mins > 0);
    const pe = c.progress_entity && h.states[c.progress_entity];
    const pct = pe ? Math.min(100, Math.max(0, num(pe.state))) : 0;
    r.getElementById("fill").style.width = `${pct}%`;
  }
  getCardSize() {
    return 2;
  }
  getGridOptions() {
    return { columns: 6, rows: 2, min_columns: 3, min_rows: 1 };
  }
  static getStubConfig() {
    return {
      entity: "sensor.washer_state",
      program_entity: "sensor.washer_program",
      progress_entity: "sensor.washer_progress",
    };
  }
}
/* ------------------------------------------------------- entity dialog (md3) */
const DIALOG_CSS = `
  :host { position: fixed; inset: 0; z-index: 9999; }
  .scrim { position: absolute; inset: 0; background: var(--mdc-dialog-scrim-color, rgba(0,0,0,.32)); touch-action: none; animation: md3fade .2s ease; }
  .sheet { position: absolute; left: 0; right: 0; margin: 0 auto; top: 40px; width: min(580px, calc(100% - 32px));
    max-height: calc(100dvh - 72px); overflow: auto; overscroll-behavior: contain; box-sizing: border-box; padding: 16px 20px 28px;
    background: var(--ha-dialog-surface-background, var(--md-sys-color-surface-container-high, var(--card-background-color, #222))); color: var(--md-sys-color-on-surface, #fff);
    border-radius: var(--ha-dialog-border-radius, 28px); font-family: var(--ha-font-family-body, Roboto, sans-serif); animation: md3pop .2s ease; }
  .sheet.glow { background-image: linear-gradient(rgba(255,214,102,.16), rgba(255,214,102,.04)); background-color: var(--md-sys-color-surface-container-high, #222); }
  .handle { display: none; width: 36px; height: 4px; border-radius: 2px; background: var(--md-sys-color-on-surface-variant, #aaa); opacity: .45; margin: -8px auto 10px; }
  @media (max-width: 450px), (max-height: 500px) {
    .sheet { top: auto; bottom: 0; width: 100%; max-height: min(calc(100dvh - 72px), 90dvh); border-radius: 20px 20px 0 0; animation: md3up .3s ease; }
    .handle { display: block; }
  }
  @keyframes md3up { from { transform: translateY(100%); } }
  @keyframes md3pop { from { opacity: 0; transform: translateY(-12px); } }
  @keyframes md3fade { from { opacity: 0; } }
  .head { display: flex; align-items: center; gap: 10px; }
  .head .t { flex: 1; min-width: 0; }
  .area { font-size: 12px; color: var(--md-sys-color-on-surface-variant, #aaa); }
  .name { font-size: 18px; font-weight: 600; }
  .state { font-size: 13px; color: var(--md-sys-color-on-surface-variant, #aaa); }
  button { font: inherit; color: inherit; border: 0; background: var(--md-sys-color-surface-container-highest, #333); border-radius: 999px; cursor: pointer; }
  .x { width: 40px; height: 40px; flex: none; }
  .big { display: flex; justify-content: center; margin: 18px 0 6px; }
  .big button { width: 96px; height: 96px; border-radius: 32px; }
  .big button.on { background: var(--md-sys-color-primary-container, #3b4a6b); color: var(--md-sys-color-on-primary-container, #fff); }
  .big ha-icon { --mdc-icon-size: 44px; }
  label { display: block; margin: 18px 0 6px; font-size: 13px; color: var(--md-sys-color-on-surface-variant, #aaa); }
  input[type=range] { width: 100%; height: 36px; accent-color: var(--md-sys-color-primary, #8ab4f8); }
  .value { font-size: 44px; font-weight: 600; text-align: center; margin: 14px 0 4px; }
  svg.g { width: 100%; height: 140px; margin-top: 14px; }
  .area-f { fill: var(--md-sys-color-primary, #8ab4f8); opacity: .18; }
  .line { fill: none; stroke: var(--md-sys-color-primary, #8ab4f8); stroke-width: 2; vector-effect: non-scaling-stroke; stroke-linejoin: round; }
  .more { margin-top: 18px; width: 100%; padding: 12px; }
  .sec { margin: 20px 0 0; font-size: 14px; font-weight: 600; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
  .grid button { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 12px 14px; border-radius: 20px; text-align: left; }
  .grid button.on { background: var(--md-sys-color-primary-container, #3b4a6b); color: var(--md-sys-color-on-primary-container, #fff); }
  .grid b { font-weight: 600; font-size: 13px; }
  .grid span { font-size: 12px; opacity: .75; }
  .pav { display: flex; justify-content: center; margin: 18px 0 8px; }
  .pav div { width: 104px; height: 104px; border-radius: 50%; background: var(--md-sys-color-primary-container, #3b4a6b) center/cover; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 600; border: 4px solid var(--pc, transparent); box-sizing: border-box; }
  .chipst { display: flex; justify-content: center; margin-bottom: 6px; }
  .chipst span { padding: 6px 14px; border-radius: 999px; background: var(--md-sys-color-surface-container-highest, #333); font-size: 13px; font-weight: 500; }
  .pgrid { margin-top: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .pc { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 16px; background: var(--md-sys-color-surface-container-highest, #333); min-width: 0; }
  .pc ha-icon { --mdc-icon-size: 20px; flex: none; opacity: .8; }
  .pc .k { font-size: 11px; color: var(--md-sys-color-on-surface-variant, #aaa); }
  .pc .v { font-size: 13px; font-weight: 500; overflow-wrap: anywhere; }
  .rows { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }
  .rows > div { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 18px; background: var(--md-sys-color-surface-container-highest, #333); }
  .rows ha-icon { --mdc-icon-size: 22px; flex: none; opacity: .8; }
  .rows .k { font-size: 12px; color: var(--md-sys-color-on-surface-variant, #aaa); }
  .rows .v { font-size: 14px; font-weight: 500; }
  .pulse { display: flex; justify-content: center; margin: 22px 0 10px; }
  .pulse div { width: 112px; height: 112px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--md-sys-color-surface-container-highest, #333); position: relative; }
  .pulse div.on { background: var(--md-sys-color-primary-container, #3b4a6b); }
  .pulse div.on::after { content: ""; position: absolute; inset: -6px; border-radius: 50%; border: 3px solid var(--md-sys-color-primary, #8ab4f8); animation: md3pulse 1.6s ease-out infinite; }
  @keyframes md3pulse { 0% { transform: scale(.92); opacity: .9; } 100% { transform: scale(1.18); opacity: 0; } }
  .pulse ha-icon { --mdc-icon-size: 48px; }
  .ring { display: flex; justify-content: center; margin: 14px 0 4px; position: relative; }
  .ring svg { width: 180px; height: 180px; }
  .ring .v { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 600; }
  .center { text-align: center; color: var(--md-sys-color-on-surface-variant, #aaa); font-size: 13px; }
  .per { display: flex; gap: 6px; margin: 16px 0 4px; }
  .per button { height: 32px; padding: 0 14px; font-size: 13px; }
  .per button.on { background: var(--md-sys-color-primary-container, #3b4a6b); color: var(--md-sys-color-on-primary-container, #fff); }
  .tlbar { position: relative; height: 44px; margin-top: 10px; border-radius: 14px; overflow: hidden; background: var(--md-sys-color-surface-container-highest, #333); cursor: pointer; }
  .tlbar i { position: absolute; top: 0; bottom: 0; }
  .tlbar i.sel { box-shadow: inset 0 0 0 2px var(--md-sys-color-on-surface, #fff); }
  .tlax { display: flex; justify-content: space-between; margin-top: 4px; font-size: 11px; color: var(--md-sys-color-on-surface-variant, #aaa); }
  .tlinfo { margin-top: 8px; min-height: 18px; font-size: 13px; color: var(--md-sys-color-on-surface-variant, #aaa); text-align: center; }
  .legend { display: flex; flex-direction: column; gap: 4px; margin-top: 10px; }
  .legend div { display: flex; align-items: center; gap: 10px; font-size: 13px; }
  .legend i { width: 12px; height: 12px; border-radius: 4px; flex: none; }
  .legend span { margin-left: auto; color: var(--md-sys-color-on-surface-variant, #aaa); }
  .aphero { display: flex; align-items: center; gap: 14px; margin-top: 12px; }
  .apic { width: 64px; height: 64px; border-radius: 22px; flex: none; display: flex; align-items: center; justify-content: center; background: var(--md-sys-color-surface-container-highest, #333); }
  .apic ha-icon { --mdc-icon-size: 34px; }
  .aphero.run .apic { background: var(--md-sys-color-primary-container, #3b4a6b); color: var(--md-sys-color-on-primary-container, #fff); }
  .aphero.spin ha-icon { animation: md3spin 2.4s linear infinite; }
  .aphero .st { font-size: 20px; font-weight: 600; }
  .aphero .pr { font-size: 13px; color: var(--md-sys-color-on-surface-variant, #aaa); }
  .ring .v.ap { flex-direction: column; gap: 2px; }
  .ring .v.ap b { font-size: 34px; font-weight: 600; }
  .ring .v.ap span { font-size: 13px; font-weight: 500; color: var(--md-sys-color-on-surface-variant, #aaa); }
  @keyframes md3spin { to { transform: rotate(360deg); } }
  .hero { margin-top: 16px; padding: 24px; border-radius: 24px; text-align: center; background: var(--md-sys-color-tertiary-container, #4a2c5a); }
  .hero ha-icon { --mdc-icon-size: 48px; }
  .hero b { display: block; font-size: 22px; margin-top: 8px; }
  .modes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px; }
  .modes button { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; padding: 14px; border-radius: 20px; text-align: left; }
  .modes ha-icon { --mdc-icon-size: 22px; }
  .keypad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; }
  .keypad button { padding: 14px 0; border-radius: 16px; font-size: 18px; font-weight: 500; }
  .code { grid-column: 1 / -1; text-align: center; letter-spacing: 8px; font-size: 22px; min-height: 28px; }
  .cv { margin-top: 16px; border-radius: 24px; overflow: hidden; position: relative; min-height: 150px; background: var(--md-sys-color-surface-container-highest, #333) center/cover; }
  .cv .sc { position: absolute; inset: 0; background: linear-gradient(transparent, rgba(0,0,0,.75)); }
  .cv .tx { position: relative; padding: 60px 16px 14px; color: #fff; }
  .cv b { display: block; font-size: 17px; }
  .cv span { font-size: 13px; opacity: .85; }
  .ct { display: flex; justify-content: center; gap: 14px; margin-top: 16px; }
  .ct button { width: 56px; height: 56px; }
  .ct button.p { width: 72px; border-radius: 24px; background: var(--md-sys-color-primary-container, #3b4a6b); }
  .vol { display: flex; align-items: center; gap: 10px; margin-top: 16px; }
  .vol input { flex: 1; }
  select { width: 100%; padding: 12px; border-radius: 16px; border: 0; background: var(--md-sys-color-surface-container-highest, #333); color: inherit; font: inherit; }
`;

class Md3Dialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  open(hass, entityId, config = {}) {
    this._hass = hass;
    this._entityId = entityId;
    this._config = config;
    this._code = "";
    this._pendingMode = null;
    this.shadowRoot.innerHTML = `<style>${DIALOG_CSS}</style>
    <div class="scrim" id="scrim"></div>
    <div class="sheet" id="sheet"><div class="handle"></div><div class="head"><button class="x" id="x"><ha-icon icon="mdi:close"></ha-icon></button>
      <div class="t"><div class="area" id="area"></div><div class="name" id="name"></div><div class="state" id="state"></div></div>
      <button class="x" id="hist" title="Verlauf"><ha-icon icon="mdi:chart-box-outline"></ha-icon></button></div>
      <div id="body"></div>
      <button class="more" id="more">Weitere Optionen</button></div>`;
    const close = () => this.close();
    const r = this.shadowRoot;
    trapScroll(this);
    swipeToClose(this, r.getElementById("sheet"), close);
    r.getElementById("scrim").onclick = close;
    r.getElementById("x").onclick = close;
    r.getElementById("more").onclick = () => {
      close();
      moreInfo(document.body, entityId);
    };
    r.getElementById("hist").onclick = () => {
      close();
      runAction(document.body, this._hass, {
        action: "navigate",
        navigation_path: `/history?entity_id=${encodeURIComponent(entityId)}`,
      });
    };
    this._key = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", this._key);
    this._sig = null;
    this._render();
    this._loadGraph();
    if (config.appliance)
      this._tick = setInterval(() => {
        this._sig = null;
        this._render();
      }, 30000);
  }
  close() {
    clearInterval(this._camTimer);
    clearInterval(this._tick);
    window.removeEventListener("keydown", this._key);
    this.remove();
  }
  set hass(h) {
    this._hass = h;
    if (this._mapEl) this._mapEl.hass = h;
    if (this.isConnected && this._entityId) this._render();
  }
  _kind(s) {
    const d = domainOf(s.entity_id),
      dc = s.attributes.device_class;
    if (this._config.appliance) return "appliance";
    if (this._config.entities) return "grid";
    if (d === "person") return "person";
    if (d === "alarm_control_panel") return "alarm";
    if (d === "media_player") return "media";
    if (d === "camera") return "camera";
    if (d === "light") return "light";
    if (["switch", "input_boolean", "fan", "automation", "script"].includes(d))
      return "switch";
    if (d === "binary_sensor") return "binary";
    if (dc === "battery") return "battery";
    if (
      [
        "motion",
        "presence",
        "occupancy",
        "door",
        "window",
        "moisture",
        "opening",
      ].includes(dc)
    )
      return "binary";
    return "sensor";
  }
  /** Related entities of the same device. Dialog options: `related: false`, `related_entities: [...]`, `exclude_entities`, `exclude_domains`. */
  _related(s, raw = false) {
    const h = this._hass,
      c = this._config;
    if (!raw && (c.related === false || c.hide_related === true)) return [];
    if (!raw && Array.isArray(c.related_entities))
      return c.related_entities.filter((e) => h.states[e] && e !== s.entity_id);
    if (hasLabel(h, s.entity_id, "Template")) return [];
    const ent = h.entities && h.entities[s.entity_id];
    if (!ent || !ent.device_id) return [];
    const exE = (!raw && c.exclude_entities) || [],
      exD = (!raw && c.exclude_domains) || [];
    return Object.keys(h.entities).filter((e) => {
      const x = h.entities[e];
      if (
        e === s.entity_id ||
        x.device_id !== ent.device_id ||
        !h.states[e] ||
        x.hidden ||
        hasLabel(h, e, "Dialog Hidden")
      )
        return false;
      if (exE.includes(e) || exD.includes(domainOf(e))) return false;
      if (x.entity_category === "config") return false;
      return (
        x.entity_category !== "diagnostic" ||
        h.states[e].attributes.device_class === "battery"
      );
    });
  }
  /** Related-entities grid, limited to `max_related` (default 12) with a button to expand the rest. */
  _relGrid(ids) {
    const max = num(this._config.max_related, 12);
    const shown = this._relAll ? ids : ids.slice(0, max);
    const html = this._grid(shown, "Zugehörige Entitäten");
    return html && ids.length > shown.length
      ? `${html}<button class="more" data-rel-more>${
          ids.length - shown.length
        } weitere anzeigen</button>`
      : html;
  }
  _grid(ids, title) {
    const h = this._hass;
    if (!ids.length) return "";
    const items = ids
      .map((id) => {
        const st = h.states[id];
        return `<button data-e="${esc(id)}" class="${
          st.state === "on" ? "on" : ""
        }"><ha-icon icon="${esc(entityIcon(h, st))}"></ha-icon><b>${esc(
          st.attributes.friendly_name || id,
        )}</b><span>${esc(formatState(h, st))}</span></button>`;
      })
      .join("");
    return `<div class="sec">${esc(
      title,
    )}</div><div class="grid">${items}</div>`;
  }
  _bindGrid(body) {
    const more = body.querySelector("[data-rel-more]");
    if (more)
      more.onclick = () => {
        this._relAll = true;
        this._render();
      };
    body.querySelectorAll(".grid button[data-e]").forEach((b) => {
      b.onclick = () => {
        const id = b.getAttribute("data-e");
        this.close();
        if (hasMd3Dialog(this._hass, id)) openMd3Dialog(this._hass, id);
        else moreInfo(document.body, id);
      };
    });
  }
  _periodChips() {
    const cur = this._hours || 24;
    return `<div class="per" id="per">${[
      [6, "6 Std."],
      [24, "24 Std."],
      [168, "7 Tage"],
    ]
      .map(
        ([hrs, l]) =>
          `<button data-h="${hrs}" class="${
            hrs === cur ? "on" : ""
          }">${l}</button>`,
      )
      .join("")}</div>`;
  }
  _bindPeriod(body) {
    body.querySelectorAll("#per button").forEach((b) => {
      b.onclick = () => {
        this._hours = num(b.getAttribute("data-h"), 24);
        body
          .querySelectorAll("#per button")
          .forEach((x) => x.classList.toggle("on", x === b));
        const ax = body.querySelector("#tlax");
        if (ax) ax.innerHTML = this._axisInner();
        this._loadGraph();
        this._loadTimeline();
      };
    });
  }
  _axisInner() {
    const hrs = this._hours || 24,
      now = Date.now();
    const fmt = (t) =>
      hrs > 24
        ? new Date(t).toLocaleDateString([], { weekday: "short" })
        : new Date(t).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
    return [0, 0.25, 0.5, 0.75, 1]
      .map((f) => `<span>${esc(fmt(now - hrs * 3600000 * (1 - f)))}</span>`)
      .join("");
  }
  _axisHtml() {
    return `<div class="tlax" id="tlax">${this._axisInner()}</div>`;
  }
  _timelineHtml() {
    return `${this._periodChips()}<div class="tlbar" id="tlbar"></div>${this._axisHtml()}<div class="tlinfo" id="tlinfo"></div><div id="tlstats"></div>`;
  }
  _graphBlock() {
    return `${this._periodChips()}${this._graphSvg()}${this._axisHtml()}<div id="nstats"></div>`;
  }
  async _loadTimeline() {
    if (!this.shadowRoot.getElementById("tlbar")) return;
    const token = (this._tlToken = (this._tlToken || 0) + 1);
    try {
      const segs = await fetchStates(
        this._hass,
        this._entityId,
        this._hours || 24,
      );
      if (token !== this._tlToken) return;
      this._segs = segs;
      this._paintTimeline();
    } catch (e) {
      /* no history */
    }
  }
  _paintTimeline() {
    const r = this.shadowRoot,
      bar = r.getElementById("tlbar"),
      segs = this._segs;
    if (!bar || !segs || !segs.length) return;
    const h = this._hass,
      s = h.states[this._entityId];
    const t0 = segs[0].t0,
      span = Math.max(1, segs[segs.length - 1].t1 - t0);
    const order = [];
    segs.forEach((g) => {
      if (!order.includes(g.state)) order.push(g.state);
    });
    const color = (state) =>
      timelineColor(
        state,
        order
          .filter(
            (x) =>
              !TL_DIM.includes(String(x).toLowerCase()) &&
              !TL_ACTIVE.includes(String(x).toLowerCase()) &&
              !["unavailable", "unknown"].includes(String(x).toLowerCase()),
          )
          .indexOf(state),
      );
    const label = (state) =>
      ({ unavailable: "Nicht verfügbar", unknown: "Unbekannt" })[state] ||
      (s ? formatState(h, { ...s, state }) : state);
    bar.innerHTML = segs
      .map(
        (g, i) =>
          `<i data-i="${i}" style="left:${
            ((g.t0 - t0) / span) * 100
          }%;width:${Math.max(
            0.3,
            ((g.t1 - g.t0) / span) * 100,
          )}%;background:${color(g.state)}"></i>`,
      )
      .join("");
    const clock = (t) =>
      new Date(t).toLocaleString(
        [],
        this._hours > 24
          ? { weekday: "short", hour: "2-digit", minute: "2-digit" }
          : { hour: "2-digit", minute: "2-digit" },
      );
    const info = r.getElementById("tlinfo");
    const show = (i) => {
      const g = segs[i];
      bar
        .querySelectorAll("i")
        .forEach((x, k) => x.classList.toggle("sel", k === i));
      info.textContent = `${label(g.state)} · ${clock(g.t0)} – ${
        i === segs.length - 1 ? "jetzt" : clock(g.t1)
      } (${fmtDuration(g.t1 - g.t0)})`;
    };
    bar.onclick = (e) => {
      const b = bar.getBoundingClientRect(),
        t = t0 + ((e.clientX - b.left) / b.width) * span;
      const i = segs.findIndex((g) => t >= g.t0 && t <= g.t1);
      if (i >= 0) show(i);
    };
    info.textContent = "Tippe auf die Leiste für Details";
    // totals per state, longest first
    const tot = {};
    segs.forEach((g) => {
      tot[g.state] = (tot[g.state] || 0) + (g.t1 - g.t0);
    });
    const stats = r.getElementById("tlstats");
    const kind = this._kind(s);
    const activeMs = segs
      .filter((g) => TL_ACTIVE.includes(String(g.state).toLowerCase()))
      .reduce((a, g) => a + g.t1 - g.t0, 0);
    if (["binary", "switch"].includes(kind)) {
      const runs = segs.filter((g) =>
        TL_ACTIVE.includes(String(g.state).toLowerCase()),
      );
      const starts = runs.filter((g) => g !== segs[0]).length;
      const longest = runs.reduce((a, g) => Math.max(a, g.t1 - g.t0), 0);
      const last = runs[runs.length - 1];
      const cells = [
        ["mdi:timer-outline", "Aktiv", fmtDuration(activeMs)],
        [
          "mdi:percent-outline",
          "Anteil",
          `${Math.round((activeMs / span) * 100)} %`,
        ],
        ["mdi:restart", "Einschaltvorgänge", String(starts)],
        [
          "mdi:timer-sand",
          "Längste Phase",
          longest ? fmtDuration(longest) : "–",
        ],
      ];
      if (last)
        cells.push([
          "mdi:history",
          last === segs[segs.length - 1] ? "Aktiv seit" : "Zuletzt aktiv bis",
          clock(last === segs[segs.length - 1] ? last.t0 : last.t1),
        ]);
      stats.innerHTML = `<div class="pgrid">${cells
        .map(
          ([ic, k, v]) =>
            `<div class="pc"><ha-icon icon="${esc(
              ic,
            )}"></ha-icon><span><div class="k">${esc(
              k,
            )}</div><div class="v">${esc(v)}</div></span></div>`,
        )
        .join("")}</div>`;
    } else {
      stats.innerHTML = `<div class="legend">${Object.keys(tot)
        .sort((a, b) => tot[b] - tot[a])
        .map(
          (st) =>
            `<div><i style="background:${color(st)}"></i>${esc(
              label(st),
            )}<span>${esc(fmtDuration(tot[st]))}</span></div>`,
        )
        .join("")}</div>`;
    }
  }
  _graphSvg() {
    return `<svg class="g" id="g" viewBox="0 0 300 140" preserveAspectRatio="none"><path class="area-f" id="area"/><path class="line" id="line"/></svg>`;
  }
  _render() {
    const h = this._hass;
    const s = h.states[this._entityId];
    const r = this.shadowRoot;
    if (!s) return;
    const a = s.attributes;
    r.getElementById("name").textContent =
      this._config.name || a.friendly_name || s.entity_id;
    r.getElementById("area").textContent = areaOf(h, s.entity_id) || "";
    r.getElementById("state").textContent = formatState(h, s);
    const kind = this._kind(s);
    const sig = [
      kind,
      s.state,
      a.brightness,
      a.color_temp_kelvin,
      a.hs_color && a.hs_color[0],
      a.media_title,
      a.volume_level,
      a.source,
      a.entity_picture,
      a.latitude,
      a.longitude,
      this._pendingMode,
      this._relAll,
      this._config.appliance
        ? Object.values(this._config.appliance)
            .map((e) => h.states[e] && h.states[e].state)
            .join(",")
        : "",
    ].join("|");
    if (sig === this._sig) return;
    this._sig = sig;
    const body = r.getElementById("body");
    const dom = domainOf(s.entity_id);
    const on = s.state === "on";
    const call = (svc, data = {}, d = dom) =>
      h.callService(d, svc, { entity_id: s.entity_id, ...data });
    r.getElementById("sheet").classList.toggle("glow", kind === "light" && on);
    r.getElementById("more").style.display = ["grid", "alarm"].includes(kind)
      ? "none"
      : "";

    if (kind === "grid") {
      const ids = this._config.entities.filter((e) => h.states[e]);
      body.innerHTML = this._grid(ids, "Entitäten");
      this._bindGrid(body);
    } else if (kind === "appliance") {
      this._renderAppliance(body, s);
      this._bindGrid(body);
    } else if (kind === "person") {
      this._renderPerson(body, s);
    } else if (kind === "alarm") {
      this._renderAlarm(body, s);
    } else if (kind === "media") {
      const act = ["playing", "paused", "buffering"].includes(s.state);
      const pic = a.entity_picture_local || a.entity_picture;
      body.innerHTML = `
        <div class="cv" style="${
          pic && act
            ? `background-image:url('${esc(h.hassUrl ? h.hassUrl(pic) : pic)}')`
            : ""
        }"><div class="sc"></div><div class="tx"><b>${esc(
          a.media_title || formatState(h, s),
        )}</b><span>${esc(
          [a.media_artist, a.media_album_name].filter(Boolean).join(" · "),
        )}</span></div></div>
        <div class="ct"><button id="pv"><ha-icon icon="mdi:skip-previous"></ha-icon></button><button class="p" id="pp"><ha-icon icon="${
          s.state === "playing" ? "mdi:pause" : "mdi:play"
        }" style="--mdc-icon-size:32px"></ha-icon></button><button id="nx"><ha-icon icon="mdi:skip-next"></ha-icon></button></div>
        <div class="vol"><ha-icon icon="mdi:volume-high"></ha-icon><input id="vl" type="range" min="0" max="100" value="${Math.round(
          num(a.volume_level) * 100,
        )}"/></div>
        ${
          Array.isArray(a.source_list) && a.source_list.length
            ? `<label>Quelle / App</label><select id="src">${a.source_list
                .map(
                  (x) =>
                    `<option ${x === a.source ? "selected" : ""}>${esc(
                      x,
                    )}</option>`,
                )
                .join("")}</select>`
            : ""
        }`;
      const mp = (svc, data = {}) =>
        h.callService("media_player", svc, { entity_id: s.entity_id, ...data });
      body.querySelector("#pp").onclick = () => mp("media_play_pause");
      body.querySelector("#pv").onclick = () => mp("media_previous_track");
      body.querySelector("#nx").onclick = () => mp("media_next_track");
      body.querySelector("#vl").onchange = (e) =>
        mp("volume_set", { volume_level: num(e.target.value) / 100 });
      const src = body.querySelector("#src");
      if (src) src.onchange = () => mp("select_source", { source: src.value });
    } else if (kind === "camera") {
      const pic = a.entity_picture;
      body.innerHTML = `<img id="cam" style="width:100%;border-radius:24px;margin-top:16px" src="${esc(
        pic ? (h.hassUrl ? h.hassUrl(pic) : pic) : "",
      )}"/>`;
      clearInterval(this._camTimer);
      this._camTimer = setInterval(() => {
        const im = r.getElementById("cam");
        if (im && pic)
          im.src = `${h.hassUrl ? h.hassUrl(pic) : pic}&t=${Date.now()}`;
      }, 5000);
    } else if (kind === "light" || kind === "switch") {
      body.innerHTML = `<div class="big"><button id="tgl" class="${
        on ? "on" : ""
      }"><ha-icon icon="${
        kind === "light" ? "mdi:lightbulb" : "mdi:power"
      }"></ha-icon></button></div>`;
      body.querySelector("#tgl").onclick = () => {
        haptic();
        call("toggle", {}, "homeassistant");
      };
      if (kind === "switch") {
        body.insertAdjacentHTML("beforeend", this._timelineHtml());
        this._bindPeriod(body);
      }
      if (kind === "light" && on) {
        const modes = a.supported_color_modes || [];
        const slider = (lbl, min, max, val, cb) => {
          const l = document.createElement("label");
          l.textContent = lbl;
          const i = document.createElement("input");
          i.type = "range";
          i.min = min;
          i.max = max;
          i.value = val;
          i.onchange = () => cb(num(i.value));
          body.append(l, i);
        };
        if (modes.some((m) => m !== "onoff"))
          slider(
            "Helligkeit",
            1,
            100,
            Math.round(num(a.brightness, 255) / 2.55),
            (v) => call("turn_on", { brightness_pct: v }),
          );
        if (modes.includes("color_temp"))
          slider(
            "Farbtemperatur (K)",
            num(a.min_color_temp_kelvin, 2000),
            num(a.max_color_temp_kelvin, 6500),
            num(a.color_temp_kelvin, 3000),
            (v) => call("turn_on", { color_temp_kelvin: v }),
          );
        if (modes.some((m) => ["hs", "xy", "rgb", "rgbw", "rgbww"].includes(m)))
          slider("Farbton", 0, 360, num(a.hs_color && a.hs_color[0], 0), (v) =>
            call("turn_on", { hs_color: [v, 100] }),
          );
      }
    } else if (kind === "battery") {
      const v = Math.min(100, Math.max(0, num(s.state)));
      const c =
        v < 20
          ? "var(--md-sys-color-error, #f2b8b5)"
          : v < 50
            ? "#f5c542"
            : "var(--md-sys-color-primary, #8ab4f8)";
      body.innerHTML = `<div class="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="var(--md-sys-color-surface-container-highest,#333)" stroke-width="9"/><circle cx="50" cy="50" r="42" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round" transform="rotate(-90 50 50)" stroke-dasharray="263.9" stroke-dashoffset="${
        263.9 * (1 - v / 100)
      }"/></svg><div class="v">${Math.round(
        v,
      )} %</div></div>${this._graphBlock()}${this._relGrid(this._related(s))}`;
      this._bindGrid(body);
      this._bindPeriod(body);
    } else if (kind === "binary") {
      const dc = a.device_class;
      const icon =
        a.icon ||
        {
          motion: "mdi:motion-sensor",
          presence: "mdi:account",
          occupancy: "mdi:home-account",
          door: on ? "mdi:door-open" : "mdi:door-closed",
          window: on ? "mdi:window-open" : "mdi:window-closed",
          moisture: "mdi:water-alert",
          opening: "mdi:door-open",
        }[dc] ||
        entityIcon(h, s);
      const since = s.last_changed
        ? new Date(s.last_changed).toLocaleString()
        : "";
      body.innerHTML = `<div class="pulse"><div class="${
        on ? "on" : ""
      }"><ha-icon icon="${esc(
        icon,
      )}"></ha-icon></div></div><div class="center">Letzte Änderung: ${esc(
        since,
      )}</div>${this._timelineHtml()}${this._relGrid(this._related(s))}`;
      this._bindGrid(body);
      this._bindPeriod(body);
    } else {
      const unit = a.unit_of_measurement || "";
      const rel = this._related(s);
      const hum =
        a.device_class === "temperature"
          ? this._related(s, true).find(
              (e) => h.states[e].attributes.device_class === "humidity",
            )
          : null;
      if (a.device_class === "humidity" && isFinite(parseFloat(s.state))) {
        const v = Math.min(100, Math.max(0, num(s.state)));
        body.innerHTML = `<div class="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="var(--md-sys-color-surface-container-highest,#333)" stroke-width="9"/><circle cx="50" cy="50" r="42" fill="none" stroke="var(--md-sys-color-primary,#8ab4f8)" stroke-width="9" stroke-linecap="round" transform="rotate(-90 50 50)" stroke-dasharray="263.9" stroke-dashoffset="${
          263.9 * (1 - v / 100)
        }"/></svg><div class="v">${Math.round(v)} %</div></div>`;
      } else
        body.innerHTML = `<div class="value">${esc(formatState(h, s))}</div>${
          hum
            ? `<div class="center">Luftfeuchtigkeit ${esc(
                formatState(h, h.states[hum]),
              )}</div>`
            : ""
        }`;
      body.innerHTML += `${
        isFinite(parseFloat(s.state))
          ? this._graphBlock()
          : this._timelineHtml()
      }${this._relGrid(rel.filter((e) => e !== hum))}`;
      this._bindGrid(body);
      this._bindPeriod(body);
      void unit;
    }
    this._paintGraph();
    this._paintTimeline();
    if (body.querySelector("#tlbar")) this._loadTimeline();
  }
  _renderAppliance(body, s) {
    const h = this._hass,
      ap = this._config.appliance,
      st = (id) => id && h.states[id];
    const idle = APPLIANCE_IDLE.includes(String(s.state).toLowerCase());
    const running = !idle;
    const prog = st(ap.program_entity),
      pe = st(ap.progress_entity);
    const progText =
      prog && !["unknown", "unavailable", "none"].includes(prog.state)
        ? formatState(h, prog)
        : "";
    const mins = running ? applianceMinutes(h, ap.remaining_entity) : 0;
    const pct = pe && running ? Math.min(100, Math.max(0, num(pe.state))) : 0;
    const icon = ap.icon || s.attributes.icon || "mdi:washing-machine";
    const spin =
      running &&
      ap.spin !== false &&
      String(s.state).toLowerCase() === "running";
    const hhmm = (d) =>
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const cells = [["mdi:state-machine", "Status", formatState(h, s)]];
    if (progText) cells.push(["mdi:playlist-play", "Programm", progText]);
    if (running && pe)
      cells.push(["mdi:progress-clock", "Fortschritt", `${Math.round(pct)} %`]);
    if (mins > 0) {
      cells.push([
        "mdi:timer-sand",
        "Restzeit",
        fmtRemaining(mins).replace("Noch ", ""),
      ]);
      cells.push([
        "mdi:clock-check-outline",
        "Fertig um",
        hhmm(new Date(Date.now() + mins * 60000)),
      ]);
    }
    if (s.last_changed)
      cells.push(["mdi:history", "Seit", hhmm(new Date(s.last_changed))]);
    const ring =
      running && pe
        ? `<div class="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="var(--md-sys-color-surface-container-highest,#333)" stroke-width="9"/><circle cx="50" cy="50" r="42" fill="none" stroke="var(--md-sys-color-primary,#8ab4f8)" stroke-width="9" stroke-linecap="round" transform="rotate(-90 50 50)" stroke-dasharray="263.9" stroke-dashoffset="${
            263.9 * (1 - pct / 100)
          }"/></svg><div class="v ap"><b>${Math.round(pct)} %</b>${
            mins > 0 ? `<span>${esc(fmtRemaining(mins))}</span>` : ""
          }</div></div>`
        : "";
    const skip = [ap.program_entity, ap.progress_entity, ap.remaining_entity];
    body.innerHTML = `<div class="aphero ${running ? "run" : ""} ${
      spin ? "spin" : ""
    }"><div class="apic"><ha-icon icon="${esc(icon)}"></ha-icon></div>
        <div><div class="st">${esc(formatState(h, s))}</div>${
          progText ? `<div class="pr">${esc(progText)}</div>` : ""
        }</div></div>
      ${ring}<div class="pgrid">${cells
        .map(
          ([ic, k, v]) =>
            `<div class="pc"><ha-icon icon="${esc(
              ic,
            )}"></ha-icon><span><div class="k">${esc(
              k,
            )}</div><div class="v">${esc(v)}</div></span></div>`,
        )
        .join("")}</div>
      ${this._relGrid(this._related(s).filter((e) => !skip.includes(e)))}`;
  }
  _renderPerson(body, s) {
    const h = this._hass,
      a = s.attributes;
    const home = s.state === "home";
    const zone = h.states[`zone.${s.state}`];
    const where = home
      ? "Zuhause"
      : s.state === "not_home"
        ? "Unterwegs"
        : (zone && zone.attributes.friendly_name) || s.state;
    const pic = a.entity_picture;
    const name = a.friendly_name || s.entity_id;
    const trackers = (a.device_trackers || []).filter((e) => h.states[e]);
    const rel = (v) => {
      const d = (Date.now() - new Date(v).getTime()) / 60000;
      return d < 1
        ? "gerade eben"
        : d < 60
          ? `vor ${Math.round(d)} Min.`
          : d < 1440
            ? `vor ${Math.round(d / 60)} Std.`
            : new Date(v).toLocaleDateString();
    };
    const cells = [];
    cells.push(["mdi:map-marker", "Standort", where]);
    cells.push(["mdi:clock-outline", "Seit", rel(s.last_changed)]);
    // proximity integration: sensors of platform "proximity" that mention this person
    const pn = name.toLowerCase();
    const prox = Object.keys(h.entities || {}).filter(
      (e) =>
        h.entities[e].platform === "proximity" &&
        h.states[e] &&
        (h.states[e].attributes.friendly_name || "").toLowerCase().includes(pn),
    );
    const dist = prox.find(
      (e) =>
        h.states[e].attributes.unit_of_measurement &&
        isFinite(parseFloat(h.states[e].state)),
    );
    const dir = prox.find(
      (e) =>
        Array.isArray(h.states[e].attributes.options) &&
        h.states[e].attributes.options.includes("towards"),
    );
    if (dist)
      cells.push([
        "mdi:ruler",
        "Entfernung zu Zuhause",
        formatState(h, h.states[dist]),
      ]);
    if (dir) {
      const dv = h.states[dir].state;
      const di =
        {
          arrived: "mdi:home-map-marker",
          towards: "mdi:arrow-right-bold-circle",
          away_from: "mdi:arrow-left-bold-circle",
          stationary: "mdi:pause-circle",
        }[dv] || "mdi:compass";
      cells.push([di, "Bewegung", formatState(h, h.states[dir])]);
    }
    if (a.gps_accuracy != null)
      cells.push([
        "mdi:crosshairs-gps",
        "GPS-Genauigkeit",
        `±${a.gps_accuracy} m`,
      ]);
    trackers.forEach((e) => {
      const t = h.states[e],
        ent = h.entities && h.entities[e];
      cells.push([
        t.attributes.icon || "mdi:cellphone",
        t.attributes.friendly_name || e,
        formatState(h, t),
      ]);
      const bats =
        ent && ent.device_id
          ? Object.keys(h.entities).filter(
              (x) =>
                h.entities[x].device_id === ent.device_id &&
                h.states[x] &&
                h.states[x].attributes.device_class === "battery" &&
                isFinite(parseFloat(h.states[x].state)),
            )
          : [];
      bats
        .slice(0, 1)
        .forEach((x) =>
          cells.push([
            num(h.states[x].state) < 20 ? "mdi:battery-alert" : "mdi:battery",
            "Akku",
            `${Math.round(num(h.states[x].state))} %`,
          ]),
        );
    });
    if (a.latitude != null)
      cells.push([
        "mdi:crosshairs",
        "Koordinaten",
        `${num(a.latitude).toFixed(4)}, ${num(a.longitude).toFixed(4)}`,
      ]);
    body.innerHTML = `<div style="display:flex;align-items:center;gap:12px;margin-top:12px">
        <div style="width:56px;height:56px;border-radius:50%;flex:none;background:var(--md-sys-color-primary-container,#3b4a6b) center/cover;${
          pic ? `background-image:url('${esc(pic)}');` : ""
        }display:flex;align-items:center;justify-content:center;font-weight:600;font-size:22px;border:3px solid ${
          home ? "var(--md-sys-color-primary,#8ab4f8)" : "transparent"
        };box-sizing:border-box">${
          pic ? "" : esc(name.charAt(0).toUpperCase())
        }</div>
        <div class="chipst" style="margin:0"><span>${esc(
          where,
        )}</span></div></div>
      <div id="pmap" style="margin-top:12px;border-radius:20px;overflow:hidden;background:var(--md-sys-color-surface-container-highest,#333);min-height:${
        a.latitude != null ? 210 : 0
      }px"></div>
      <div class="pgrid">${cells
        .map(
          ([ic, k, v]) =>
            `<div class="pc"><ha-icon icon="${esc(
              ic,
            )}"></ha-icon><span><div class="k">${esc(
              k,
            )}</div><div class="v">${esc(v)}</div></span></div>`,
        )
        .join("")}</div>`;
    if (a.latitude != null)
      this._attachMap(body.querySelector("#pmap"), s.entity_id);
  }
  async _attachMap(host, entityId) {
    try {
      if (!this._mapEl) {
        // creating the stock map card makes Home Assistant load the <ha-map> element
        const helpers = await window.loadCardHelpers();
        await helpers.createCardElement({ type: "map", entities: [entityId] });
        await customElements.whenDefined("ha-map");
        const el = document.createElement("ha-map");
        el.style.display = "block";
        el.style.height = "210px";
        el.entities = [{ entity_id: entityId, color: "#c49200" }];
        el.zoom = 15;
        el.autoFit = true;
        el.fitZones = true;
        el.themeMode = "auto";
        el.hass = this._hass;
        this._mapEl = el;
      }
      this._mapEl.hass = this._hass;
      host.appendChild(this._mapEl);
    } catch (e) {
      host.style.minHeight = "0";
    }
  }
  _renderAlarm(body, s) {
    const h = this._hass,
      a = s.attributes,
      cfg = this._config.alarm || {};
    const f = num(a.supported_features);
    const modes = [];
    if (f & 1) modes.push(["alarm_arm_home", "Zuhause", "mdi:home-lock"]);
    if (f & 2) modes.push(["alarm_arm_away", "Abwesend", "mdi:shield-lock"]);
    if (f & 4) modes.push(["alarm_arm_night", "Nacht", "mdi:weather-night"]);
    if (f & 16) modes.push(["alarm_arm_vacation", "Urlaub", "mdi:airplane"]);
    modes.push(["alarm_disarm", "Deaktivieren", "mdi:shield-off"]);
    const needCode = !!a.code_format && !cfg.keypad_code;
    const showKeypad = needCode && cfg.show_keypad !== false;
    const armed = s.state.startsWith("armed");
    const sensors =
      (cfg.sensors && cfg.sensors.filter((e) => h.states[e])) ||
      this._related(s).slice(0, 24);
    const camEnt =
      cfg.camera_entity_stream && h.states[cfg.camera_entity_stream];
    const camOnline =
      !cfg.camera_entity_status ||
      (h.states[cfg.camera_entity_status] &&
        h.states[cfg.camera_entity_status].state === "on");
    const showCam =
      camEnt &&
      camOnline &&
      cfg.show_camera_on_panel &&
      (s.state !== "disarmed" || cfg.show_camera_on_disarmed);
    body.innerHTML = `<div class="hero"><ha-icon icon="${
      s.state === "triggered"
        ? "mdi:bell-ring"
        : armed
          ? "mdi:shield-check"
          : "mdi:shield-off-outline"
    }"></ha-icon><b>${esc(formatState(h, s))}</b></div>
      ${
        showCam
          ? `${
              cfg.camera_title
                ? `<div class="sec">${esc(cfg.camera_title)}</div>`
                : ""
            }<img id="cam" style="width:100%;border-radius:24px;margin-top:10px" src="${esc(
              h.hassUrl
                ? h.hassUrl(camEnt.attributes.entity_picture || "")
                : camEnt.attributes.entity_picture || "",
            )}"/>`
          : ""
      }
      <div class="modes" id="modes"></div>
      <div class="keypad" id="pad" style="display:none"></div>
      ${this._grid(sensors, cfg.sensor_label || "Sensoren")}`;
    this._bindGrid(body);
    const call = (svc, code) => {
      const data = { entity_id: s.entity_id };
      const c = code || cfg.keypad_code;
      if (c) data.code = c;
      h.callService("alarm_control_panel", svc, data);
      this._code = "";
      this._pendingMode = null;
      this._sig = null;
    };
    const modesEl = body.querySelector("#modes");
    const pad = body.querySelector("#pad");
    const drawPad = () => {
      pad.style.display = "grid";
      pad.innerHTML = `<div class="code">${"•".repeat(
        this._code.length,
      )}</div>`;
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "OK"].forEach(
        (k) => {
          const b = document.createElement("button");
          b.textContent = k;
          b.onclick = () => {
            haptic();
            if (k === "⌫") this._code = this._code.slice(0, -1);
            else if (k === "OK") {
              call(this._pendingMode, this._code);
              return;
            } else this._code += k;
            drawPad();
          };
          pad.appendChild(b);
        },
      );
    };
    modes.forEach(([svc, label, ic]) => {
      const b = document.createElement("button");
      b.innerHTML = `<ha-icon icon="${ic}"></ha-icon><b>${esc(label)}</b>`;
      b.onclick = () => {
        haptic();
        if (needCode) {
          this._pendingMode = svc;
          this._code = "";
          if (showKeypad) drawPad();
        } else call(svc);
      };
      modesEl.appendChild(b);
    });
  }
  async _loadGraph() {
    const s = this._hass.states[this._entityId];
    if (
      !s ||
      !["sensor", "battery"].includes(this._kind(s)) ||
      !isFinite(parseFloat(s.state))
    )
      return;
    try {
      this._pts = await fetchHistory(
        this._hass,
        this._entityId,
        this._hours || 24,
      );
      this._paintGraph();
    } catch (e) {
      /* no history */
    }
  }
  _paintGraph() {
    const line = this.shadowRoot.getElementById("line");
    if (!line || !this._pts) return;
    const st = this._hass.states[this._entityId];
    const p = sparkPath(this._pts, 300, 140, 6, {
      padX: 0,
      hours: this._hours || 24,
      unit: st && st.attributes.unit_of_measurement,
    });
    line.setAttribute("d", p.line);
    this.shadowRoot.getElementById("area").setAttribute("d", p.area);
    this._paintNumStats(st);
  }
  /** Min / max / time-weighted average (and growth or computed energy) of the numeric history. */
  _paintNumStats(st) {
    const el = this.shadowRoot.getElementById("nstats"),
      pts = this._pts;
    if (!el || !pts || pts.length < 2 || !st) return;
    const now = Date.now(),
      a = st.attributes,
      unit = a.unit_of_measurement || "";
    const lang = (this._hass.locale && this._hass.locale.language) || "de";
    const f = (v, u = unit) =>
      `${Number(v).toLocaleString(lang, {
        maximumFractionDigits: Math.abs(v) >= 100 ? 0 : 1,
      })}${u ? ` ${u}` : ""}`;
    let min = Infinity,
      max = -Infinity,
      area = 0,
      tmax = 0;
    pts.forEach(([t, v], i) => {
      if (v < min) min = v;
      if (v > max) {
        max = v;
        tmax = t;
      }
      area += v * ((i + 1 < pts.length ? pts[i + 1][0] : now) - t);
    });
    const span = Math.max(1, now - pts[0][0]),
      avg = area / span;
    const clock = (t) =>
      new Date(t).toLocaleString(
        [],
        this._hours > 24
          ? { weekday: "short", hour: "2-digit", minute: "2-digit" }
          : { hour: "2-digit", minute: "2-digit" },
      );
    const cells = [
      ["mdi:arrow-collapse-down", "Minimum", f(min)],
      ["mdi:arrow-collapse-up", `Maximum (${clock(tmax)})`, f(max)],
      ["mdi:chart-line-variant", "Durchschnitt", f(avg)],
    ];
    if (a.device_class === "power" && ["W", "kW"].includes(unit))
      cells.push([
        "mdi:lightning-bolt",
        "Energie im Zeitraum",
        f((avg * (span / 3600000)) / (unit === "W" ? 1000 : 1), "kWh"),
      ]);
    else if (["total", "total_increasing"].includes(a.state_class))
      cells.push([
        "mdi:trending-up",
        "Zuwachs im Zeitraum",
        f(pts[pts.length - 1][1] - pts[0][1]),
      ]);
    el.innerHTML = `<div class="pgrid">${cells
      .map(
        ([ic, k, v]) =>
          `<div class="pc"><ha-icon icon="${esc(
            ic,
          )}"></ha-icon><span><div class="k">${esc(
            k,
          )}</div><div class="v">${esc(v)}</div></span></div>`,
      )
      .join("")}</div>`;
  }
}

/* ----------------------------------------------- popup / dialog (cards inside) */
const SHEET_CSS = `
  :host { position: fixed; inset: 0; z-index: 9998; font-family: var(--ha-font-family-body, Roboto, sans-serif); }
  .backdrop { position: absolute; inset: 0; background: var(--mdc-dialog-scrim-color, rgba(0,0,0,.32)); touch-action: none; animation: md3fade .2s ease; }
  .panel { position: absolute; box-sizing: border-box; display: flex; flex-direction: column; overflow: hidden; border-radius: var(--r, 28px);
    background: var(--ha-dialog-surface-background, var(--md-sys-color-surface-container-high, var(--card-background-color, #222))); color: var(--md-sys-color-on-surface, #fff);
    transition: transform .25s ease; }
  .panel.popup, .panel.dialog { left: 0; right: 0; margin: 0 auto; top: 40px; max-height: calc(100dvh - 72px); animation: md3pop .2s ease; }
  .panel.dialog.full { inset: 0; margin: 0; width: 100% !important; max-height: none; height: 100%; border-radius: 0 !important; animation: md3up .3s ease; }
  @media (max-width: 450px), (max-height: 500px) {
    .panel.popup { top: auto; bottom: 0; max-height: min(calc(100dvh - 72px), 90dvh); border-radius: var(--r, 28px) var(--r, 28px) 0 0; animation: md3up .3s ease; }
  }
  @keyframes md3up { from { transform: translateY(100%); } }
  @keyframes md3pop { from { opacity: 0; transform: translateY(-12px); } }
  @keyframes md3fade { from { opacity: 0; } }
  .handle { display: none; width: 36px; height: 4px; border-radius: 2px; background: var(--md-sys-color-outline, #888); opacity: .6; margin: 8px auto 0; flex: none; }
  @media (max-width: 450px), (max-height: 500px) { .handle { display: block; } }
  .hd { display: flex; align-items: center; gap: 8px; padding: 10px 14px; flex: none; touch-action: none; }
  .hd .t { flex: 1; min-width: 0; }
  .hd .a { font-size: 12px; color: var(--md-sys-color-on-surface-variant, #aaa); }
  .hd .n { font-size: 17px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 8px; }
  .hd .s { font-size: 12px; color: var(--md-sys-color-on-surface-variant, #aaa); }
  button { font: inherit; color: inherit; border: 0; background: var(--md-sys-color-surface-container-highest, #333); border-radius: 999px; cursor: pointer; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; flex: none; }
  button.sw { width: 52px; height: 30px; padding: 3px; justify-content: flex-start; }
  button.sw i { display: block; width: 24px; height: 24px; border-radius: 50%; background: var(--md-sys-color-outline, #999); transition: transform .15s; }
  button.sw.on { background: var(--md-sys-color-primary, #8ab4f8); justify-content: flex-end; }
  button.sw.on i { background: var(--md-sys-color-on-primary, #000); }
  .body { overflow: auto; overscroll-behavior: contain; padding: 4px 14px 22px; display: flex; flex-direction: column; gap: 8px; }
  .menu { position: absolute; right: 14px; top: 56px; min-width: 180px; padding: 6px; border-radius: 16px; background: var(--md-sys-color-surface-container-highest, #333); z-index: 3; box-shadow: 0 6px 20px rgba(0,0,0,.4); }
  .menu div { padding: 10px 12px; border-radius: 10px; display: flex; gap: 10px; align-items: center; cursor: pointer; font-size: 14px; }
  .menu div:hover { background: rgba(127,127,127,.2); }
`;

class Md3Sheet extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  async show(hass, config, mode, onClose) {
    this._hass = hass;
    this._config = config;
    this._mode = mode;
    this._onClose = onClose;
    this._views = config.views || [];
    this._view = this._views.length ? this._views[0].view_id : null;
    const st = config.style || {},
      se = config.settings || {};
    const mobile = isBottomSheet();
    const widthDesk = num(st.width_desktop, mode === "popup" ? 500 : 560);
    const widthMob = num(st.width_mobile, 100);
    const radius = num(st.border_radius, 28);
    const full = mode === "dialog" && mobile;
    const width = mobile
      ? `${widthMob}%`
      : `min(${widthDesk}px, calc(100% - 32px))`;
    this.shadowRoot.innerHTML = `<style>${SHEET_CSS}</style>
      <div class="backdrop" id="bd" style="${
        st.backdrop_blur
          ? `backdrop-filter: blur(${num(
              st.backdrop_blur,
            )}px); -webkit-backdrop-filter: blur(${num(st.backdrop_blur)}px);`
          : ""
      }"></div>
      <div class="panel ${mode}${
        full ? " full" : ""
      }" id="panel" style="width:${width};--r:${radius}px">
        ${mode === "popup" ? '<div class="handle" id="handle"></div>' : ""}
        <div class="hd" id="hd"></div><div class="body" id="body"></div></div>`;
    const r = this.shadowRoot;
    trapScroll(this);
    if (se.close_by_clicking_outside !== false)
      r.getElementById("bd").onclick = () => this.close();
    this._key = (e) => {
      if (e.key === "Escape") this.close();
    };
    window.addEventListener("keydown", this._key);
    this._renderHeader();
    await this._renderBody();
    this._dragSetup(num(se.slide_to_close_distance, 0));
    if (num(se.auto_close) > 0)
      this._autoClose = setTimeout(() => this.close(), num(se.auto_close));
  }
  _viewDef() {
    return this._views.find((v) => v.view_id === this._view);
  }
  _renderHeader() {
    const h = this._hass,
      c = this._config,
      hd = c.header || {},
      r = this.shadowRoot;
    const el = r.getElementById("hd");
    if (hd.show_header === false) {
      el.style.display = "none";
      return;
    }
    const ent = hd.entity && h.states[hd.entity];
    const view = this._viewDef();
    const title =
      (view && view.title) ||
      hd.name ||
      (ent && ent.attributes.friendly_name) ||
      (this._mode === "popup" ? "Popup" : "");
    const icon = (view && view.icon) || hd.icon;
    const area =
      hd.show_area !== false && hd.entity ? areaOf(h, hd.entity) : "";
    el.innerHTML = `${
      this._mode === "dialog"
        ? '<button id="close"><ha-icon icon="mdi:close"></ha-icon></button>'
        : ""
    }
      <div class="t">${
        area ? `<div class="a">${esc(area)}</div>` : ""
      }<div class="n">${
        icon ? `<ha-icon icon="${esc(icon)}"></ha-icon>` : ""
      }${esc(title)}</div>${
        hd.button_type === "state" && ent
          ? `<div class="s">${esc(formatState(h, ent))}</div>`
          : ""
      }</div>
      ${
        hd.button_type === "switch" && ent
          ? `<button class="sw ${
              ent.state === "on" ? "on" : ""
            }" id="sw"><i></i></button>`
          : ""
      }
      ${(hd.sub_buttons || [])
        .map(
          (b, i) =>
            `<button data-sb="${i}"><ha-icon icon="${esc(
              b.icon || "mdi:dots-horizontal",
            )}"></ha-icon></button>`,
        )
        .join("")}
      ${
        (hd.dropdown_buttons || []).length
          ? '<button id="dd"><ha-icon icon="mdi:dots-vertical"></ha-icon></button>'
          : ""
      }
      ${
        this._mode === "popup"
          ? '<button id="close"><ha-icon icon="mdi:close"></ha-icon></button>'
          : ""
      }`;
    const close = el.querySelector("#close");
    if (close) close.onclick = () => this.close();
    const sw = el.querySelector("#sw");
    if (sw)
      sw.onclick = () =>
        h.callService("homeassistant", "toggle", { entity_id: hd.entity });
    el.querySelectorAll("[data-sb]").forEach((b) => {
      b.onclick = () => {
        const def = hd.sub_buttons[num(b.getAttribute("data-sb"))];
        if (def.navigate_view) {
          this._view = def.navigate_view;
          this._renderHeader();
          this._renderBody();
          return;
        }
        runAction(this, h, def.tap_action || def, def.entity || hd.entity);
      };
    });
    const dd = el.querySelector("#dd");
    if (dd) {
      dd.onclick = () => {
        const old = r.getElementById("menu");
        if (old) {
          old.remove();
          return;
        }
        const m = document.createElement("div");
        m.className = "menu";
        m.id = "menu";
        (hd.dropdown_buttons || []).forEach((b) => {
          const row = document.createElement("div");
          row.innerHTML = `${
            b.icon ? `<ha-icon icon="${esc(b.icon)}"></ha-icon>` : ""
          }${esc(b.name || "")}`;
          row.onclick = () => {
            m.remove();
            if (b.navigate_view) {
              this._view = b.navigate_view;
              this._renderHeader();
              this._renderBody();
            } else runAction(this, h, b.tap_action || b, b.entity || hd.entity);
          };
          m.appendChild(row);
        });
        r.getElementById("panel").appendChild(m);
      };
    }
  }
  async _renderBody() {
    const body = this.shadowRoot.getElementById("body");
    body.innerHTML = "";
    const view = this._viewDef();
    const cards = view ? view.cards || [] : this._config.cards || [];
    this._cards = [];
    let helpers = null;
    try {
      helpers = await window.loadCardHelpers();
    } catch (e) {
      /* ignore */
    }
    for (const cfg of cards) {
      try {
        const el = helpers
          ? await helpers.createCardElement(cfg)
          : document.createElement("div");
        el.hass = this._hass;
        body.appendChild(el);
        this._cards.push(el);
      } catch (e) {
        /* skip broken card */
      }
    }
  }
  set hass(h) {
    this._hass = h;
    if (!this.isConnected) return;
    (this._cards || []).forEach((c) => {
      c.hass = h;
    });
    const hd = (this._config && this._config.header) || {};
    if (hd.entity) {
      const st = h.states[hd.entity];
      const sig = st && st.state;
      if (sig !== this._hsig) {
        this._hsig = sig;
        this._renderHeader();
      }
    }
  }
  _dragSetup(distance) {
    if (this._mode === "popup")
      swipeToClose(
        this,
        this.shadowRoot.getElementById("panel"),
        () => this.close(),
        distance,
      );
  }
  close() {
    clearTimeout(this._autoClose);
    window.removeEventListener("keydown", this._key);
    this.remove();
    if (this._onClose) this._onClose();
  }
}

/** Invisible card that opens a popup / dialog when the URL hash matches `hash`. */
class Md3SheetCard extends HTMLElement {
  constructor(mode) {
    super();
    this._mode = mode;
    this.attachShadow({ mode: "open" });
    this._onLoc = () => this._check();
  }
  setConfig(config) {
    this._config = {
      hash: this._mode === "popup" ? "#popup" : "#dialog",
      cards: [],
      views: [],
      header: {},
      settings: {},
      style: {},
      ...config,
    };
    this.shadowRoot.innerHTML = `<style>:host{display:block}</style>`;
    if (this.isConnected) this._check();
  }
  connectedCallback() {
    window.addEventListener("location-changed", this._onLoc);
    window.addEventListener("hashchange", this._onLoc);
    window.addEventListener("popstate", this._onLoc);
    this._check();
  }
  disconnectedCallback() {
    window.removeEventListener("location-changed", this._onLoc);
    window.removeEventListener("hashchange", this._onLoc);
    window.removeEventListener("popstate", this._onLoc);
    if (this._sheet) {
      this._sheet.remove();
      this._sheet = null;
    }
  }
  set hass(h) {
    this._hass = h;
    if (this._sheet) this._sheet.hass = h;
    this._check();
  }
  _check() {
    if (!this._config || !this._hass) return;
    const match = location.hash === this._config.hash;
    if (match && !this._sheet) {
      this._sheet = document.createElement("md3-sheet");
      mountRoot().appendChild(this._sheet);
      this._sheet.show(this._hass, this._config, this._mode, () => {
        this._sheet = null;
        if (location.hash === this._config.hash)
          history.replaceState(null, "", location.pathname + location.search);
      });
    } else if (!match && this._sheet) {
      const s = this._sheet;
      this._sheet = null;
      s._onClose = null;
      s.close();
    }
  }
  getCardSize() {
    return 0;
  }
  getGridOptions() {
    return { columns: 12, rows: "auto" };
  }
}
class Md3PopupCard extends Md3SheetCard {
  constructor() {
    super("popup");
  }
  static getStubConfig() {
    return { hash: "#popup", header: { name: "Popup" }, cards: [] };
  }
}
class Md3DialogCard extends Md3SheetCard {
  constructor() {
    super("dialog");
  }
  static getStubConfig() {
    return { hash: "#dialog", header: { name: "Dialog" }, cards: [] };
  }
}
/* ----------------------------------------------------------- navigation bar */
/* One floating bar for the whole dashboard. `md3-nav-card` (invisible, one per view) feeds it; the bar replaces Home Assistant's tab bar. */
const NAV_CSS = `
  :host { position: fixed; left: 0; right: 0; bottom: 0; height: 0; z-index: 7; font-family: var(--ha-font-family-body, Roboto, sans-serif); }
  .bar { position: absolute; left: 50%; bottom: calc(10px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); width: min(560px, calc(100vw - 20px)); height: 64px; box-sizing: border-box; padding: 0 8px;
    display: flex; align-items: center; justify-content: space-around; gap: 2px; border-radius: 32px;
    background: color-mix(in srgb, var(--md-sys-color-surface-container-high, #2b292f) 90%, transparent); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
    box-shadow: 0 4px 18px rgba(0,0,0,.35), inset 0 0 0 1px color-mix(in srgb, var(--md-sys-color-outline-variant, #49454f) 45%, transparent); }
  button { font: inherit; border: 0; background: none; cursor: pointer; color: var(--md-sys-color-on-surface-variant, #cac4d0); }
  .it { height: 48px; min-width: 48px; padding: 0 12px; border-radius: 24px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background .2s, color .2s; -webkit-tap-highlight-color: transparent; }
  .it.on { background: var(--md-sys-color-primary-container, #4f378b); color: var(--md-sys-color-on-primary-container, #eaddff); }
  .it:active { transform: scale(.94); }
  .ic { position: relative; display: flex; }
  .ic ha-icon { --mdc-icon-size: 24px; }
  .lb { display: none; font-size: 13px; font-weight: 600; white-space: nowrap; }
  .it.on .lb { display: inline; }
  @media (min-width: 620px) { .lb { display: inline; } .it { padding: 0 16px; } }
  .dot { position: absolute; top: -3px; right: -4px; width: 9px; height: 9px; border-radius: 50%; box-sizing: border-box; border: 2px solid var(--md-sys-color-surface-container-high, #2b292f); }
  .dot.open { background: #ff9800; } .dot.lit { background: #ffd54f; } .dot.motion { background: var(--md-sys-color-primary, #d0bcff); }
  .scrim { position: fixed; inset: 0; z-index: 9990; background: var(--mdc-dialog-scrim-color, rgba(0,0,0,.32)); touch-action: none; animation: md3fade .2s ease; }
  .sheet { position: absolute; left: 0; right: 0; margin: 0 auto; top: 40px; width: min(560px, calc(100% - 32px)); max-height: calc(100dvh - 72px); overflow: auto; overscroll-behavior: contain; box-sizing: border-box; padding: 16px 16px 24px;
    background: var(--ha-dialog-surface-background, var(--md-sys-color-surface-container-high, #2b292f)); color: var(--md-sys-color-on-surface, #fff); border-radius: var(--ha-dialog-border-radius, 28px); animation: md3pop .2s ease; }
  .handle { display: none; width: 36px; height: 4px; border-radius: 2px; background: var(--md-sys-color-on-surface-variant, #aaa); opacity: .45; margin: -4px auto 10px; }
  @media (max-width: 450px), (max-height: 500px) { .sheet { top: auto; bottom: 0; width: 100%; max-height: min(calc(100dvh - 72px), 90dvh); border-radius: 20px 20px 0 0; animation: md3up .3s ease; } .handle { display: block; } }
  .sheet h2 { margin: 0 4px 12px; font-size: 18px; font-weight: 600; }
  .grid h3 { margin: 14px 4px 8px; font-size: 13px; font-weight: 600; letter-spacing: .4px; color: var(--md-sys-color-on-surface-variant, #aaa); }
  .grid h3:first-child { margin-top: 0; }
  .tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .tile { height: 72px; padding: 0 14px; border-radius: 20px; display: flex; align-items: center; gap: 12px; text-align: left; color: var(--md-sys-color-on-surface, #fff); background: var(--md-sys-color-surface-container-highest, #36343b); }
  .tile.on { background: var(--md-sys-color-primary-container, #4f378b); color: var(--md-sys-color-on-primary-container, #eaddff); }
  .tile ha-icon { --mdc-icon-size: 26px; flex: none; }
  .tile b { display: block; font-size: 14px; font-weight: 600; } .tile span { display: block; font-size: 12px; opacity: .75; }
  @keyframes md3up { from { transform: translateY(100%); } }
  @keyframes md3pop { from { opacity: 0; transform: translateY(-12px); } }
  @keyframes md3fade { from { opacity: 0; } }
`;

/** Finds Home Assistant's <hui-root> (for the stock tab bar and the view list). */
function findHuiRoot() {
  try {
    const q = (r, s) => r && r.querySelector(s);
    const main = q(
      document.querySelector("home-assistant").shadowRoot,
      "home-assistant-main",
    );
    const panel =
      q(main.shadowRoot, "ha-panel-lovelace") ||
      q(
        q(main.shadowRoot, "partial-panel-resolver").shadowRoot,
        "ha-panel-lovelace",
      );
    return q(panel.shadowRoot, "hui-root");
  } catch (e) {
    return null;
  }
}

/** False when the view named by `path` exists but is hidden from the current user. */
function navViewAllowed(hass, item) {
  if (!item.path || item.path.startsWith("/")) return true;
  const root = findHuiRoot(),
    views =
      root &&
      root.lovelace &&
      root.lovelace.config &&
      root.lovelace.config.views;
  const v = views && views.find((x) => x.path === item.path);
  if (!v || v.visible == null) return true;
  if (typeof v.visible === "boolean") return v.visible;
  return v.visible.some((x) => x.user === (hass.user && hass.user.id));
}

/** Path of the view being shown; resolves `/dashboard` (default view) and `/dashboard/0` (view index) to the view's own path. */
function navCurrentPath() {
  const seg = location.pathname.split("/")[2] || "";
  const root = findHuiRoot(),
    views =
      root &&
      root.lovelace &&
      root.lovelace.config &&
      root.lovelace.config.views;
  if (!views || !views.length) return seg;
  if (!seg) return views[0].path || "0";
  if (/^\d+$/.test(seg) && views[Number(seg)])
    return views[Number(seg)].path || seg;
  return seg;
}

function navStatusText(st) {
  const p = [];
  if (st.lights)
    p.push(`${st.lights} ${st.lights === 1 ? "Licht" : "Lichter"} an`);
  if (st.open) p.push(st.open === 1 ? "offen" : `${st.open} offen`);
  if (st.motion) p.push("Bewegung");
  return p.join(" · ");
}
const navDot = (st) =>
  st.open ? "open" : st.lights ? "lit" : st.motion ? "motion" : "";

/** Toolbar buttons that are never needed ("Home Assistant durchsuchen", "Assist"); also in the overflow menu on phones. Applies to every dashboard. */
let MD3_HIDE_BUTTONS = ["search", "assist", "menu"];
function hideToolbarButtons() {
  try {
    if (localStorage.getItem("md3-keep-toolbar") === "1") return;
  } catch (e) {
    /* ignore */
  }
  const root = findHuiRoot(),
    sr = root && root.shadowRoot;
  if (!sr) return;
  const re = {
    search: /durchsuch|search home assistant/i,
    assist: /^assist\b/i,
  };
  sr.querySelectorAll(
    ".toolbar ha-icon-button, .toolbar ha-dropdown-item",
  ).forEach((e) => {
    const t = String(
      e.label ||
        e.getAttribute("aria-label") ||
        e.getAttribute("title") ||
        e.textContent ||
        "",
    ).trim();
    if (
      e.style.display !== "none" &&
      MD3_HIDE_BUTTONS.some((k) => re[k] && re[k].test(t))
    )
      e.style.setProperty("display", "none", "important");
  });
  // the three-dot overflow menu of the narrow (phone) layout; left alone while the dashboard is being edited
  if (
    MD3_HIDE_BUTTONS.includes("menu") &&
    !(root.lovelace && root.lovelace.editMode)
  ) {
    sr.querySelectorAll(".toolbar ha-icon-button[slot='trigger']").forEach(
      (b) => {
        const t = String(b.label || b.getAttribute("aria-label") || "");
        const dd = b.closest("ha-dropdown");
        if (
          dd &&
          /dashboard.?(menü|menu)/i.test(t) &&
          dd.style.display !== "none"
        )
          dd.style.setProperty("display", "none", "important");
      },
    );
  }
}
setInterval(hideToolbarButtons, 1000);

class Md3Nav extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._sig = null;
    this._onLoc = () => this._render();
  }
  connectedCallback() {
    ["location-changed", "popstate", "hashchange"].forEach((e) =>
      window.addEventListener(e, this._onLoc),
    );
    this._onSize = () => this._place();
    window.addEventListener("resize", this._onSize);
    this._ro = new ResizeObserver(this._onSize);
  }
  disconnectedCallback() {
    ["location-changed", "popstate", "hashchange"].forEach((e) =>
      window.removeEventListener(e, this._onLoc),
    );
    window.removeEventListener("resize", this._onSize);
    if (this._ro) this._ro.disconnect();
  }
  /** Centre the bar in the content area (next to the sidebar), not in the whole window. */
  _place() {
    const bar = this.shadowRoot.getElementById("bar"),
      root = findHuiRoot();
    if (!bar || !root) return;
    if (this._watched !== root) {
      if (this._watched) this._ro.unobserve(this._watched);
      this._ro.observe(root);
      this._watched = root;
    }
    const b = root.getBoundingClientRect();
    if (!b.width) return;
    bar.style.left = `${b.left + b.width / 2}px`;
    bar.style.width = `${Math.min(560, b.width - 20)}px`;
  }
  configure(config, hass) {
    this._config = config;
    this._hass = hass;
    this._hideStock();
    this._render();
  }
  _hideStock() {
    const root = findHuiRoot(),
      sr = root && root.shadowRoot,
      tabs = sr && sr.querySelector("ha-tab-group");
    if (tabs && tabs.style.display !== "none") tabs.style.display = "none";
    if (tabs) this._stock = tabs;
    if (this._config && this._config.hide_buttons)
      MD3_HIDE_BUTTONS = this._config.hide_buttons;
  }
  destroy() {
    this.closeMore();
    if (this._stock) this._stock.style.display = "";
    this.remove();
  }
  _isActive(it) {
    const parts = location.pathname.split("/"),
      want = it.path.split("/");
    return it.path.startsWith("/")
      ? want[1] === parts[1] && (!want[2] || want[2] === parts[2])
      : navCurrentPath() === it.path;
  }
  _go(it) {
    haptic();
    const url = it.path.startsWith("/")
      ? it.path
      : `/${location.pathname.split("/")[1]}/${it.path}`;
    this.closeMore();
    if (location.pathname === url) return;
    history.pushState(null, "", url);
    window.dispatchEvent(
      new CustomEvent("location-changed", { detail: { replace: false } }),
    );
  }
  _status(it) {
    return (it.area || it.status || it.lights || it.include) && this._hass
      ? areaStatus(this._hass, it.area, statusOpts(it))
      : { lights: 0, open: 0, motion: 0 };
  }
  _render() {
    const h = this._hass,
      c = this._config;
    if (!h || !c) return;
    const items = (c.items || []).filter((i) => navViewAllowed(h, i)),
      more = (c.more || []).filter((i) => navViewAllowed(h, i));
    const act = items.map((i) => this._isActive(i)),
      moreActive = more.some((i) => this._isActive(i));
    const sts = items.map((i) => this._status(i)),
      mst = more.map((i) => this._status(i));
    const moreDot = mst.reduce((a, s) => a || navDot(s), "") || "";
    const sig = JSON.stringify([
      items.map((i) => i.path),
      act,
      moreActive,
      sts,
      more.map((i) => i.path),
      mst,
      this._sheet ? 1 : 0,
    ]);
    if (sig === this._sig) return;
    this._sig = sig;
    const btn = (cls, icon, label, dot, attr) =>
      `<button class="it ${cls}" ${attr}><span class="ic"><ha-icon icon="${esc(
        icon,
      )}"></ha-icon>${
        dot ? `<i class="dot ${dot}"></i>` : ""
      }</span><span class="lb">${esc(label)}</span></button>`;
    const bar =
      items
        .map((i, k) =>
          btn(
            act[k] ? "on" : "",
            i.icon,
            i.label,
            navDot(sts[k]),
            `data-i="${k}"`,
          ),
        )
        .join("") +
      (more.length
        ? btn(
            moreActive ? "on" : "",
            c.more_icon || "m3of:apps",
            c.more_label || "Mehr",
            moreActive ? "" : moreDot,
            'data-more="1"',
          )
        : "");
    const r = this.shadowRoot;
    let barEl = r.getElementById("bar");
    if (!barEl) {
      r.innerHTML = `<style>${NAV_CSS}</style><div class="bar" id="bar"></div>`;
      barEl = r.getElementById("bar");
    }
    barEl.innerHTML = bar;
    this._place();
    barEl.querySelectorAll("[data-i]").forEach((b) => {
      b.onclick = () => this._go(items[num(b.getAttribute("data-i"))]);
    });
    const mb = barEl.querySelector("[data-more]");
    if (mb) mb.onclick = () => this.openMore(more, mst);
    if (this._sheet) this._fillSheet(more, mst);
  }
  openMore(more, mst) {
    if (this._sheet) {
      this.closeMore();
      return;
    }
    haptic();
    const s = document.createElement("div");
    s.className = "scrim";
    s.innerHTML = `<div class="sheet"><div class="handle"></div><h2>${esc(
      this._config.more_title || "Alle Räume",
    )}</h2><div class="grid"></div></div>`;
    this.shadowRoot.appendChild(s);
    this._sheet = s;
    s.onclick = (e) => {
      if (e.target === s) this.closeMore();
    };
    this._key = (e) => {
      if (e.key === "Escape") this.closeMore();
    };
    window.addEventListener("keydown", this._key);
    trapScroll(this);
    swipeToClose(this, s.querySelector(".sheet"), () => this.closeMore());
    this._fillSheet(more, mst);
  }
  _fillSheet(more, mst) {
    const g = this._sheet.querySelector(".grid");
    // keep the floors apart: items with the same `floor` are grouped under a heading (in order of first appearance)
    const groups = [];
    more.forEach((it, k) => {
      const key = it.floor || "";
      let grp = groups.find((x) => x.key === key);
      if (!grp) {
        grp = { key, items: [] };
        groups.push(grp);
      }
      grp.items.push(k);
    });
    const tile = (k) =>
      `<button class="tile ${
        this._isActive(more[k]) ? "on" : ""
      }" data-k="${k}"><ha-icon icon="${esc(
        more[k].icon,
      )}"></ha-icon><span style="min-width:0"><b>${esc(
        more[k].label,
      )}</b><span>${esc(navStatusText(mst[k]))}</span></span></button>`;
    g.innerHTML = groups
      .map(
        (grp) =>
          `${
            grp.key ? `<h3>${esc(grp.key)}</h3>` : ""
          }<div class="tiles">${grp.items.map(tile).join("")}</div>`,
      )
      .join("");
    g.querySelectorAll("[data-k]").forEach((b) => {
      b.onclick = () => this._go(more[num(b.getAttribute("data-k"))]);
    });
  }
  closeMore() {
    if (!this._sheet) return;
    this._sheet.remove();
    this._sheet = null;
    this._sig = null;
    window.removeEventListener("keydown", this._key);
    this._render();
  }
}

/** Invisible card: put it into every view. Items need `path` (view path or absolute URL), `icon`, `label` and optionally `area` for the status dots. */
class Md3NavCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = "<style>:host{display:block}</style>";
  }
  setConfig(config) {
    this._config = { items: [], more: [], ...config };
    this._sync();
  }
  connectedCallback() {
    Md3NavCard._n = (Md3NavCard._n || 0) + 1;
    clearTimeout(Md3NavCard._rm);
    this._sync();
  }
  disconnectedCallback() {
    Md3NavCard._n -= 1;
    if (Md3NavCard._n <= 0)
      Md3NavCard._rm = setTimeout(() => {
        const n = mountRoot().querySelector("md3-nav");
        if (n) n.destroy();
      }, 500);
  }
  set hass(h) {
    this._hass = h;
    this._sync();
  }
  _sync() {
    if (!this._config || !this._hass || !this.isConnected) return;
    let nav = mountRoot().querySelector("md3-nav");
    if (!nav) {
      nav = document.createElement("md3-nav");
      mountRoot().appendChild(nav);
    }
    nav.configure(this._config, this._hass);
  }
  getCardSize() {
    return 0;
  }
  getGridOptions() {
    return { columns: 12, rows: "auto" };
  }
  static getStubConfig() {
    return {
      items: [{ path: "00_home", icon: "mdi:home", label: "Home" }],
      more: [],
    };
  }
}
/* ------------------------------------------------- greeting / attention / rooms */
const WEATHER_ICONS = {
  "clear-night": ["mdi:weather-night", "#b39ddb"],
  cloudy: ["mdi:weather-cloudy", ""],
  exceptional: ["mdi:alert-circle-outline", "#ef6c4d"],
  fog: ["mdi:weather-fog", ""],
  hail: ["mdi:weather-hail", "#64b5f6"],
  lightning: ["mdi:weather-lightning", "#f5c542"],
  "lightning-rainy": ["mdi:weather-lightning-rainy", "#f5c542"],
  partlycloudy: ["mdi:weather-partly-cloudy", "#ffb300"],
  pouring: ["mdi:weather-pouring", "#64b5f6"],
  rainy: ["mdi:weather-rainy", "#64b5f6"],
  snowy: ["mdi:weather-snowy", "#90caf9"],
  "snowy-rainy": ["mdi:weather-snowy-rainy", "#90caf9"],
  sunny: ["mdi:weather-sunny", "#ffb300"],
  windy: ["mdi:weather-windy", ""],
  "windy-variant": ["mdi:weather-windy-variant", ""],
};

/** Time-of-day greeting with the user's first name, the date and the current weather. */
class Md3GreetingCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  setConfig(config) {
    this._config = { ...config };
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      :host { font-family: var(--ha-font-family-body, Roboto, sans-serif); color: var(--md3-on-surface); }
      .h { font-size: clamp(26px, 7vw, 36px); font-weight: 600; line-height: 1.15; padding: 0 4px; }
      .d { margin-top: 6px; padding: 0 4px; font-size: 15px; color: var(--md3-on-surface-variant); display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; }
      .w { display: none; align-items: center; gap: 6px; padding: 4px 10px 4px 6px; margin: -4px 0; border-radius: 16px; font: inherit; font-weight: 500; color: var(--md3-on-surface); background: transparent; cursor: pointer; }
      .w:active { background: var(--md3-surface-high); }
      .w.show { display: inline-flex; }
      .w ha-icon { --mdc-icon-size: 22px; }
    </style><div class="h" id="h"></div><div class="d"><span id="d"></span><button class="w" id="w"><ha-icon id="wi"></ha-icon><span id="wt"></span></button></div>`;
    this.shadowRoot.getElementById("w").onclick = () => {
      if (this._config.weather) moreInfo(this, this._config.weather);
    };
    if (this._hass) this.hass = this._hass;
  }
  connectedCallback() {
    this._tick = setInterval(
      () => this._hass && (this.hass = this._hass),
      60000,
    );
  }
  disconnectedCallback() {
    clearInterval(this._tick);
  }
  set hass(h) {
    this._hass = h;
    const c = this._config,
      r = this.shadowRoot;
    if (!c || !r.getElementById("h")) return;
    const now = new Date(),
      hr = now.getHours(),
      lang = (h.locale && h.locale.language) || "de";
    const hello =
      hr >= 5 && hr < 11
        ? "Guten Morgen"
        : hr >= 11 && hr < 17
          ? "Guten Tag"
          : hr >= 17 && hr < 22
            ? "Guten Abend"
            : "Gute Nacht";
    const name = c.name || ((h.user && h.user.name) || "").split(" ")[0];
    r.getElementById("h").textContent = name ? `${hello}, ${name}` : hello;
    r.getElementById("d").textContent = now.toLocaleDateString(lang, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const w = c.weather && h.states[c.weather],
      box = r.getElementById("w");
    box.classList.toggle("show", !!w);
    if (!w) return;
    const [icon, color] = WEATHER_ICONS[w.state] || ["mdi:weather-cloudy", ""];
    const wi = r.getElementById("wi");
    wi.setAttribute("icon", icon);
    wi.style.color = color;
    const t = w.attributes.temperature;
    const temp =
      t != null
        ? `${Number(t).toLocaleString(lang, { maximumFractionDigits: 1 })} ${
            w.attributes.temperature_unit || "°C"
          }`
        : "";
    r.getElementById("wt").textContent = [temp, formatState(h, w)]
      .filter(Boolean)
      .join(" · ");
  }
  getCardSize() {
    return 1;
  }
  getGridOptions() {
    return { columns: 12, rows: 1 };
  }
  static getStubConfig() {
    return { weather: "weather.home" };
  }
}

/** Tiles that only appear when something needs attention: leaks, open windows/doors, weak batteries, updates. Same height and shape as the summary tiles. */
/** "seit 5 Min.", "seit 2 Std." from a state's last_changed. */
function sinceText(s) {
  const m = Math.max(
    0,
    Math.round((Date.now() - new Date(s.last_changed).getTime()) / 60000),
  );
  return m < 1
    ? "gerade eben"
    : m < 60
      ? `seit ${m} Min.`
      : m < 1440
        ? `seit ${Math.floor(m / 60)} Std.${m % 60 ? ` ${m % 60} Min.` : ""}`
        : `seit ${Math.floor(m / 1440)} Tg.`;
}

class Md3AttentionCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  setConfig(config) {
    this._config = { ...config };
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      :host { display: none; font-family: var(--ha-font-family-body, Roboto, sans-serif); }
      :host(.show) { display: block; margin-bottom: 16px; }
      :host { container-type: inline-size; }
      .row { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
      @container (min-width: 650px) { .row { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @container (min-width: 980px) { .row { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
      .row.m { grid-template-columns: repeat(auto-fill, min(100%, var(--tile-w))); justify-content: start; }
      button { display: flex; align-items: center; gap: 12px; height: var(--md3-height, 56px); padding: 0 16px; border-radius: var(--md3-radius); text-align: left; color: var(--md3-on-surface); min-width: 0; transition: background .2s; }
      button:active { transform: scale(.98); }
      .ic { flex: none; display: flex; }
      .ic ha-icon { --mdc-icon-size: 26px; }
      .x { flex: none; width: 28px; height: 28px; margin-right: -6px; border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: .7; }
      .x:hover, .x:active { opacity: 1; background: rgba(255,255,255,.14); }
      .x ha-icon { --mdc-icon-size: 18px; }
      .t { min-width: 0; flex: 1; }
      .t b { display: block; font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .t span { display: block; font-size: 12px; opacity: .8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      @media (max-width: 450px) { button { padding: 0 12px; gap: 10px; } .ic ha-icon { --mdc-icon-size: 24px; } .t b { font-size: 13px; } .t span { font-size: 11px; } }
      .warn { background: color-mix(in srgb, #ff9800 26%, var(--md3-surface)); } .warn .ic ha-icon { color: #ffb74d; }
      .err { background: var(--md3-error-container); } .err .ic ha-icon { color: var(--md3-error); }
      .info { background: var(--md3-secondary-container); color: var(--md3-on-secondary-container); }
    </style><div class="row" id="row"></div>`;
    this._sig = null;
    if (this._hass) this.hass = this._hass;
  }
  connectedCallback() {
    this._tick = setInterval(() => {
      if (this._hass) this.hass = this._hass;
    }, 60000);
    this._ro = new ResizeObserver(() => this._measure());
    this._onR = () => this._measure();
    window.addEventListener("resize", this._onR);
    setTimeout(() => this._measure(), 300);
  }
  disconnectedCallback() {
    clearInterval(this._tick);
    window.removeEventListener("resize", this._onR);
    if (this._ro) this._ro.disconnect();
  }
  /** One attention tile is exactly as wide as two summary tiles of the same section (measured at runtime). */
  _measure() {
    let node = this,
      sec = null;
    for (let i = 0; i < 12 && node; i++) {
      const root = node.getRootNode && node.getRootNode();
      node = root && root.host;
      if (node && /section/.test(node.localName)) {
        sec = node;
        break;
      }
    }
    let tile = null;
    const find = (root, depth) => {
      if (tile || depth > 6 || !root) return;
      for (const e of root.querySelectorAll("*")) {
        if (e.localName === "md3-button-card") {
          tile = e;
          return;
        }
        if (e.shadowRoot) {
          find(e.shadowRoot, depth + 1);
          if (tile) return;
        }
      }
    };
    if (sec) find(sec.shadowRoot || sec, 0);
    const w = tile ? tile.getBoundingClientRect().width : 0,
      row = this.shadowRoot.getElementById("row");
    if (!row) return;
    if (tile && this._watched !== tile) {
      if (this._watched) this._ro.unobserve(this._watched);
      this._ro.observe(tile);
      this._watched = tile;
    }
    if (w > 80) {
      row.style.setProperty(
        "--tile-w",
        `${Math.round((w * 2 + 8) * 10) / 10}px`,
      );
      row.classList.add("m");
    } else row.classList.remove("m");
  }
  _groups(h) {
    const c = this._config,
      ex = c.exclude || [],
      g = [];
    const open = [],
      leaks = [],
      bats = [],
      upd = [];
    const lim = c.batteries === false ? null : num(c.batteries, 20);
    Object.keys(h.states).forEach((e) => {
      if (ex.includes(e) || hasLabel(h, e, "Status Hidden")) return;
      const s = h.states[e],
        d = domainOf(e),
        dc = s.attributes.device_class;
      if (d === "binary_sensor" && s.state === "on") {
        if (["window", "door", "opening", "garage_door"].includes(dc))
          open.push(e);
        else if (dc === "moisture") leaks.push(e);
        else if (dc === "battery" && lim != null) bats.push(e);
      } else if (
        d === "sensor" &&
        dc === "battery" &&
        lim != null &&
        isFinite(parseFloat(s.state)) &&
        parseFloat(s.state) < lim &&
        s.attributes.unit_of_measurement === "%"
      )
        bats.push(e);
      else if (d === "update" && s.state === "on" && c.updates !== false)
        upd.push(e);
    });
    const name = (e) =>
      (h.states[e].attributes.friendly_name || e)
        .replace(/\s+(Batterie|Battery)$/i, "")
        .replace(/^Update:\s*/i, "");
    const detail = (ids, since) =>
      ids.length === 1 && since
        ? `${name(ids[0])} · ${sinceText(h.states[ids[0]])}`
        : ids.length > 3
          ? `${ids.slice(0, 3).map(name).join(", ")} +${ids.length - 3}`
          : ids.map(name).join(", ");
    const pick = (ids, one, many, icon, cls, dialog, since) => {
      if (ids.length)
        g.push({
          key: dialog,
          noDismiss: cls === "err" && dialog === "Wasserlecks",
          ids,
          icon,
          cls,
          dialog,
          title: ids.length === 1 ? one : many,
          text: detail(ids, since),
        });
    };
    if (c.leaks !== false)
      pick(
        leaks,
        "Wasserleck",
        "Wasserlecks",
        "mdi:water-alert",
        "err",
        "Wasserlecks",
      );
    const openMin = num(c.open_minutes, 0),
      alertMin = num(c.open_alert_minutes, 0);
    const openLong = open.filter(
      (e) =>
        Date.now() - new Date(h.states[e].last_changed).getTime() >=
        openMin * 60000,
    );
    const alarm =
      alertMin > 0 &&
      openLong.some(
        (e) =>
          Date.now() - new Date(h.states[e].last_changed).getTime() >=
          alertMin * 60000,
      );
    if (c.windows !== false)
      pick(
        openLong,
        "Offen",
        `Offen`,
        "mdi:window-open-variant",
        alarm ? "err" : "warn",
        "Offene Fenster und Türen",
        true,
      );
    pick(
      bats,
      "Batterie schwach",
      "Batterien schwach",
      "mdi:battery-alert",
      "warn",
      "Schwache Batterien",
    );
    pick(upd, "Update", "Updates", "mdi:update", "info", "Verfügbare Updates");
    // own rules: { entity, state | state_not | above | below, for_minutes?, title, text?, icon?, tone?: warn|err|info, tap_action? }
    (c.rules || []).forEach((r) => {
      const st = h.states[r.entity];
      if (
        !st ||
        ["unavailable", "unknown"].includes(st.state) ||
        !activeWhen(h, { active_when: r }, st)
      )
        return;
      if (
        num(r.for_minutes) > 0 &&
        Date.now() - new Date(st.last_changed).getTime() <
          num(r.for_minutes) * 60000
      )
        return;
      g.push({
        key: `rule:${r.entity}:${r.title || ""}`,
        ids: [r.entity],
        icon: r.icon || "mdi:alert-circle-outline",
        cls: { err: "err", info: "info" }[r.tone] || "warn",
        dialog: r.title,
        title: r.title || name(r.entity),
        text: r.text || `${name(r.entity)} · ${sinceText(st)}`,
        rule: r,
      });
    });
    return g;
  }
  set hass(h) {
    this._hass = h;
    if (!this._config || !this.shadowRoot.getElementById("row")) return;
    // dismissed tiles stay hidden until their entities change state again (stored per browser)
    const dkey = `md3-attention-${this._config.id || "default"}`;
    let dism = {};
    try {
      dism = JSON.parse(localStorage.getItem(dkey) || "{}");
    } catch (e) {
      /* ignore */
    }
    const stamp = (g) =>
      g.ids.map((e) => `${e}@${h.states[e].last_changed}`).join("|");
    const groups = this._groups(h).filter(
      (g) => g.noDismiss || dism[g.key] !== stamp(g),
    );
    this._dismiss = (g) => {
      dism[g.key] = stamp(g);
      try {
        localStorage.setItem(dkey, JSON.stringify(dism));
      } catch (e) {
        /* ignore */
      }
      this._sig = null;
      this.hass = this._hass;
    };
    const sig = JSON.stringify(
      groups.map((g) => [g.cls, g.title, g.text, g.ids]),
    );
    if (sig === this._sig) return;
    this._sig = sig;
    this.classList.toggle("show", groups.length > 0);
    const row = this.shadowRoot.getElementById("row");
    row.innerHTML = groups
      .map(
        (g, i) =>
          `<button class="${
            g.cls
          }" data-i="${i}"><span class="ic"><ha-icon icon="${
            g.icon
          }"></ha-icon></span><span class="t"><b>${esc(g.title)}</b><span>${esc(
            g.text,
          )}</span></span>${
            g.noDismiss
              ? ""
              : `<span class="x" data-x="${i}" title="Ausblenden"><ha-icon icon="mdi:close"></ha-icon></span>`
          }</button>`,
      )
      .join("");
    row.querySelectorAll(".x").forEach((x) => {
      x.onclick = (e) => {
        e.stopPropagation();
        haptic();
        this._dismiss(groups[num(x.getAttribute("data-x"))]);
      };
      x.addEventListener("pointerdown", (e) => e.stopPropagation());
    });
    row.querySelectorAll("button").forEach((b) => {
      b.onclick = () => {
        haptic();
        const g = groups[num(b.getAttribute("data-i"))];
        if (g.rule && g.rule.tap_action) {
          runAction(this, this._hass, g.rule.tap_action, g.ids[0]);
          return;
        }
        if (g.ids.length === 1 && hasMd3Dialog(this._hass, g.ids[0]))
          openMd3Dialog(this._hass, g.ids[0], { hide_related: true });
        else if (g.ids.length === 1) moreInfo(this, g.ids[0]);
        else
          openMd3Dialog(this._hass, g.ids[0], {
            name: g.dialog,
            icon: g.icon,
            entities: g.ids,
          });
      };
    });
  }
  getCardSize() {
    return 1;
  }
  getGridOptions() {
    return { columns: "full", rows: "auto" };
  }
  static getStubConfig() {
    return {};
  }
}

/** Room tiles grouped by floor with chips to switch between floors (the choice is remembered per device). */
class Md3RoomsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tiles = [];
  }
  setConfig(config) {
    if (!config || !Array.isArray(config.rooms))
      throw new Error("rooms is required");
    this._config = { floors: [], ...config };
    this._key = `md3-rooms-${config.id || "default"}`;
    const cols = Math.max(2, Math.round(num(config.max_columns, 3)));
    const floors = this._config.floors;
    let saved = null;
    try {
      saved = localStorage.getItem(this._key);
    } catch (e) {
      /* ignore */
    }
    this._floor =
      saved && (saved === "*" || floors.some((f) => f.id === saved))
        ? saved
        : (floors[0] && floors[0].id) || "*";
    this.shadowRoot.innerHTML = `<style>${TOKENS}
      :host { font-family: var(--ha-font-family-body, Roboto, sans-serif); }
      .chips { display: flex; gap: 8px; margin: 0 0 10px; flex-wrap: wrap; }
      .chips button { position: relative; height: 36px; padding: 0 16px; border-radius: 18px; background: var(--md3-surface); color: var(--md3-on-surface); font-size: 14px; font-weight: 600; }
      .chips button.on { background: var(--md3-primary-container); color: var(--md3-on-primary-container); }
      .chips i { position: absolute; top: 4px; right: 5px; width: 8px; height: 8px; border-radius: 50%; }
      .chips i.open { background: #ff9800; } .chips i.lit { background: #ffd54f; }
      :host { container-type: inline-size; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
      @container (min-width: 650px) { .grid { grid-template-columns: repeat(${cols}, minmax(0, 1fr)); max-width: ${
        cols * 260 + (cols - 1) * 8
      }px; } }
      md3-button-card[hidden] { display: none; }
    </style><div class="chips" id="chips"></div><div class="grid" id="grid"></div>`;
    const grid = this.shadowRoot.getElementById("grid");
    this._tiles = this._config.rooms.map((r) => {
      const el = document.createElement("md3-button-card");
      el.setConfig({
        entity: r.entity,
        name: r.name,
        icon: r.icon,
        area: r.area,
        status: statusOpts(r),
        tap_action: { action: "navigate", navigation_path: r.path },
        hold_action: { action: "none" },
        dialog: { related: false },
      });
      grid.appendChild(el);
      return el;
    });
    this._sig = null;
    if (this._hass) this.hass = this._hass;
  }
  /** Floors the current user may see (`users` on a floor limits it to those user ids). */
  _visible(h) {
    const uid = h && h.user && h.user.id;
    return this._config.floors.filter((f) => !f.users || f.users.includes(uid));
  }
  _apply(h) {
    const rooms = this._config.rooms,
      vis = this._visible(h || this._hass).map((f) => f.id);
    if (this._floor !== "*" && !vis.includes(this._floor))
      this._floor = vis[0] || "*";
    this._tiles.forEach((t, i) => {
      t.hidden =
        !vis.includes(rooms[i].floor) ||
        !(this._floor === "*" || rooms[i].floor === this._floor);
    });
  }
  set hass(h) {
    this._hass = h;
    if (!this._config) return;
    this._tiles.forEach((t) => {
      t.hass = h;
    });
    this._apply(h);
    const vis = this._visible(h),
      floors = [...vis, { id: "*", name: "Alle" }];
    const stat = (f) =>
      this._config.rooms
        .filter((r) =>
          f.id === "*" ? vis.some((v) => v.id === r.floor) : r.floor === f.id,
        )
        .reduce(
          (a, r) => {
            const s =
              r.area || r.status || r.lights || r.include
                ? areaStatus(h, r.area, statusOpts(r))
                : { lights: 0, open: 0 };
            return { lights: a.lights + s.lights, open: a.open + s.open };
          },
          { lights: 0, open: 0 },
        );
    const chips = floors.map((f) => ({ f, s: stat(f) }));
    const sig = JSON.stringify([
      this._floor,
      chips.map((c) => [c.s.lights > 0, c.s.open > 0]),
    ]);
    if (sig === this._sig) return;
    this._sig = sig;
    const el = this.shadowRoot.getElementById("chips");
    el.innerHTML = chips
      .map(
        ({ f, s }) =>
          `<button data-f="${esc(f.id)}" class="${
            f.id === this._floor ? "on" : ""
          }">${esc(f.name)}${
            f.id !== "*" && (s.open || s.lights)
              ? `<i class="${s.open ? "open" : "lit"}"></i>`
              : ""
          }</button>`,
      )
      .join("");
    el.querySelectorAll("button").forEach((b) => {
      b.onclick = () => {
        this._floor = b.getAttribute("data-f");
        try {
          localStorage.setItem(this._key, this._floor);
        } catch (e) {
          /* ignore */
        }
        this._sig = null;
        this.hass = this._hass;
      };
    });
  }
  getCardSize() {
    return 4;
  }
  getGridOptions() {
    return { columns: "full", rows: "auto" };
  }
  static getStubConfig() {
    return { floors: [{ id: "og", name: "OG" }], rooms: [] };
  }
}
/* ------------------------------------------------------------ visual editors */
/* Home Assistant renders `static getConfigForm()` with its own <ha-form>, so the editors are plain schemas. */
const EDITOR_LABELS = {
  entity: "Entität",
  name: "Name",
  secondary: "Zweite Zeile",
  label: "Beschriftung",
  icon: "Icon",
  show_chevron: "Pfeil anzeigen",
  use_material_color: "Klima-Farbe (Heizen/Kühlen)",
  use_card_entity: "An Entität binden",
  tap_action: "Beim Tippen",
  hold_action: "Beim Gedrückthalten",
  double_tap_action: "Beim Doppeltippen",
  dialog: "Dialog (Popup)",
  hide_related: "Zugehörige Entitäten ausblenden",
  max_related: "Max. zugehörige Entitäten (Standard 12)",
  related_entities: "Nur diese Entitäten zeigen",
  exclude_entities: "Diese Entitäten ausblenden",
  program_entity: "Programm-Entität",
  progress_entity: "Fortschritt-Entität (%)",
  remaining_entity: "Restzeit-Entität",
  attribute: "Attribut",
  min: "Minimum",
  max: "Maximum",
  unit: "Einheit",
  height: "Höhe (px)",
  colorize: "Lichtfarbe übernehmen",
  hours_to_show: "Stunden anzeigen",
  max_height: "Höhe der Kurve (%)",
  increase_temp: "Schritt bei +",
  decrease_temp: "Schritt bei −",
  items: "Einträge der Leiste",
  more: "Einträge im Mehr-Popup",
  more_label: "Beschriftung von „Mehr“",
  more_title: "Titel des Mehr-Popups",
  more_icon: "Icon von „Mehr“",
  floors: "Etagen",
  rooms: "Räume",
  id: "Speicher-ID (pro Dashboard eindeutig)",
  max_columns: "Max. Kacheln pro Reihe",
  exclude: "Ausnahmen (Entitäten)",
  rules: "Eigene Hinweise",
  open_minutes: "Fenster erst nach … Min. melden",
  open_alert_minutes: "Fenster rot ab … Min. offen",
  area: "Bereich (Status-Chips)",
  status: "Status-Chips feinjustieren",
  lights: "Nur diese Lichter",
  include: "Zusätzlich zählen",
  exclude: "Nicht zählen",
  display: "Darstellung",
  display_style: "Stil",
  entities: "Entitäten",
  area_id: "Bereich",
  is_add_button_enabled: "Hinzufügen-Button zeigen",
  weather: "Wetter-Entität",
  batteries: "Batterie schwach unter (%)",
};
const ed = {
  entity: (domain) => ({
    name: "entity",
    selector: { entity: domain ? { domain } : {} },
  }),
  text: (name) => ({ name, selector: { text: {} } }),
  icon: { name: "icon", selector: { icon: {} } },
  bool: (name) => ({ name, selector: { boolean: {} } }),
  num: (name, min, max, step = 1) => ({
    name,
    selector: { number: { min, max, step, mode: "box" } },
  }),
  pick: (name, options) => ({
    name,
    selector: { select: { mode: "dropdown", options } },
  }),
  ents: (name, domain) => ({
    name,
    selector: { entity: { multiple: true, ...(domain ? { domain } : {}) } },
  }),
  pair: (a, b) => ({ type: "grid", name: "", schema: [a, b] }),
  actions: () => [
    { name: "tap_action", selector: { ui_action: {} } },
    { name: "hold_action", selector: { ui_action: {} } },
    { name: "double_tap_action", selector: { ui_action: {} } },
  ],
  status: () => ({
    name: "status",
    type: "expandable",
    schema: [
      ed.ents("lights", "light"),
      ed.ents("include"),
      ed.ents("exclude"),
    ],
  }),
  dialog: () => ({
    name: "dialog",
    type: "expandable",
    schema: [
      ed.bool("hide_related"),
      ed.num("max_related", 1, 50),
      ed.ents("related_entities"),
      ed.ents("exclude_entities"),
    ],
  }),
};
const NAV_FIELDS = {
  path: {
    selector: { text: {} },
    required: true,
    label: "Pfad (Ansicht oder /dashboard/ansicht)",
  },
  icon: { selector: { icon: {} }, required: true, label: "Icon" },
  label: { selector: { text: {} }, required: true, label: "Beschriftung" },
  area: { selector: { area: {} }, label: "Bereich (für Statuspunkte)" },
  floor: { selector: { text: {} }, label: "Etage (Überschrift im Popup)" },
  lights: {
    selector: { entity: { multiple: true, domain: "light" } },
    label: "Nur diese Lichter zählen",
  },
  include: {
    selector: { entity: { multiple: true } },
    label: "Zusätzlich zählen",
  },
  exclude: { selector: { entity: { multiple: true } }, label: "Nicht zählen" },
};
const ROOM_FIELDS = {
  floor: { selector: { text: {} }, required: true, label: "Etage (ID)" },
  name: { selector: { text: {} }, required: true, label: "Name" },
  icon: { selector: { icon: {} }, required: true, label: "Icon" },
  path: {
    selector: { text: {} },
    required: true,
    label: "Pfad (/dashboard/ansicht)",
  },
  area: { selector: { area: {} }, label: "Bereich" },
  entity: { selector: { entity: {} }, label: "Entität für die Zeile darunter" },
  lights: {
    selector: { entity: { multiple: true, domain: "light" } },
    label: "Nur diese Lichter zählen (statt aller im Bereich)",
  },
  include: {
    selector: { entity: { multiple: true } },
    label: "Zusätzlich zählen (Lichter, Fenster/Türen, Bewegung)",
  },
  exclude: { selector: { entity: { multiple: true } }, label: "Nicht zählen" },
};
const RULE_FIELDS = {
  entity: { selector: { entity: {} }, required: true, label: "Entität" },
  state: { selector: { text: {} }, label: "Zustand (z. B. finished)" },
  title: { selector: { text: {} }, required: true, label: "Überschrift" },
  text: { selector: { text: {} }, label: "Text darunter" },
  icon: { selector: { icon: {} }, label: "Icon" },
  tone: {
    selector: {
      select: {
        options: [
          { value: "warn", label: "Warnung" },
          { value: "err", label: "Fehler" },
          { value: "info", label: "Info" },
        ],
      },
    },
    label: "Farbe",
  },
  for_minutes: {
    selector: { number: { min: 0, max: 1440, mode: "box" } },
    label: "Erst nach … Minuten",
  },
};
const objList = (name, fields, labelField, descField) => ({
  name,
  selector: {
    object: {
      multiple: true,
      label_field: labelField,
      description_field: descField,
      fields,
    },
  },
});
const EDITOR_SCHEMAS = {
  "md3-button-card": () => [
    ed.entity(),
    ed.pair(ed.text("name"), ed.text("secondary")),
    ed.icon,
    { name: "area", selector: { area: {} } },
    ed.status(),
    ed.pair(ed.bool("show_chevron"), ed.bool("use_material_color")),
    ...ed.actions(),
    ed.dialog(),
  ],
  "md3-control-card": () => [
    ed.pair(ed.text("name"), ed.text("label")),
    ed.icon,
    ed.bool("use_card_entity"),
    ed.entity(),
    ...ed.actions(),
  ],
  "md3-template-card": () => [
    ed.entity(),
    ed.pair(ed.text("name"), ed.text("secondary")),
    ed.icon,
    ...ed.actions(),
    ed.dialog(),
  ],
  "md3-slider-card": () => [
    ed.entity(["light", "cover"]),
    ed.pair(ed.text("name"), ed.icon),
    ed.pick("attribute", [
      "brightness",
      "hue",
      "saturation",
      "red",
      "green",
      "blue",
      "color_temp",
    ]),
    ed.pair(ed.num("min", 0, 10000), ed.num("max", 0, 10000)),
    ed.pair(ed.num("height", 40, 300), ed.bool("colorize")),
    ...ed.actions(),
  ],
  "md3-climate-card": () => [
    ed.entity("climate"),
    ed.pair(
      ed.num("increase_temp", 0.1, 5, 0.1),
      ed.num("decrease_temp", 0.1, 5, 0.1),
    ),
    ed.bool("use_material_color"),
  ],
  "md3-circle-card": () => [
    ed.entity(),
    ed.pair(ed.text("name"), ed.text("unit")),
    ed.pair(ed.num("min", -1000, 100000), ed.num("max", -1000, 100000)),
    ...ed.actions(),
    ed.dialog(),
  ],
  "md3-graph-card": () => [
    ed.entity(),
    ed.text("name"),
    ed.pair(ed.num("hours_to_show", 1, 720), ed.num("max_height", 10, 100)),
    ...ed.actions(),
    ed.dialog(),
  ],
  "md3-appliance-card": () => [
    ed.entity(),
    ed.pair(ed.text("name"), ed.icon),
    {
      name: "program_entity",
      selector: { entity: { domain: ["select", "sensor"] } },
    },
    { name: "progress_entity", selector: { entity: { domain: "sensor" } } },
    { name: "remaining_entity", selector: { entity: { domain: "sensor" } } },
    ...ed.actions(),
    ed.dialog(),
  ],
  "md3-greeting-card": () => [ed.entity("weather"), ed.text("name")],
  "md3-attention-card": () => [
    ed.num("batteries", 1, 100),
    ed.pair(
      ed.num("open_minutes", 0, 1440),
      ed.num("open_alert_minutes", 0, 1440),
    ),
    ed.ents("exclude"),
    objList("rules", RULE_FIELDS, "title", "entity"),
  ],
  "md3-nav-card": () => [
    objList("items", NAV_FIELDS, "label", "path"),
    objList("more", NAV_FIELDS, "label", "path"),
    ed.pair(ed.text("more_label"), ed.text("more_title")),
    { name: "more_icon", selector: { icon: {} } },
  ],
  "md3-rooms-card": () => [
    ed.text("id"),
    ed.num("max_columns", 2, 6),
    objList(
      "floors",
      {
        id: { selector: { text: {} }, required: true, label: "ID" },
        name: { selector: { text: {} }, required: true, label: "Name" },
      },
      "name",
      "id",
    ),
    objList("rooms", ROOM_FIELDS, "name", "path"),
  ],
  "md3-media-card": () => [ed.entity("media_player"), ...ed.actions()],
  "md3-alarm-card": () => [
    ed.entity("alarm_control_panel"),
    ed.pick("display_style", ["compact", "extended"]),
  ],
  "md3-users-card": () => [
    ed.ents("entities", "person"),
    ed.bool("is_add_button_enabled"),
  ],
  "md3-select-card": () => [
    ed.entity(["select", "input_select"]),
    ed.pick("display", ["chips", "dropdown"]),
  ],
  "md3-group-card": () => [
    ed.pair(ed.text("name"), ed.icon),
    ed.ents("entities"),
  ],
  "md3-lights-card": () => [
    { name: "area_id", selector: { area: {} } },
    ed.ents("entities", "light"),
  ],
};

function attachEditors(defs) {
  defs.forEach(([tag, cls]) => {
    const make = EDITOR_SCHEMAS[tag];
    if (!make) return;
    cls.getConfigForm = () => ({
      schema: make(),
      computeLabel: (s) => EDITOR_LABELS[s.name] || s.name,
    });
  });
}
const DEFS = [
  [
    "md3-button-card",
    Md3ButtonCard,
    "MD3 Button",
    "Universelle Kachel: Schalten, Dialoge, Navigation, Templates",
  ],
  [
    "md3-control-card",
    Md3ControlCard,
    "MD3 Control",
    "Aktions-Kachel (optional an eine Entität gebunden)",
  ],
  [
    "md3-template-card",
    Md3TemplateCard,
    "MD3 Template",
    "Kachel mit JavaScript- und Jinja-Templates",
  ],
  [
    "md3-menu-card",
    Md3MenuCard,
    "MD3 Menu",
    "Menüzeile mit Icon, Text und Aktion",
  ],
  [
    "md3-options-card",
    Md3OptionsCard,
    "MD3 Options",
    "Listen-/Menüzeile mit dynamischem Stil und Entity-Status",
  ],
  [
    "md3-slider-card",
    Md3SliderCard,
    "MD3 Slider",
    "Licht-/Rollo-Kachel mit Wischregler (Helligkeit, Farbe, Position)",
  ],
  [
    "md3-climate-card",
    Md3ClimateCard,
    "MD3 Climate",
    "−/+ Thermostat mit Modusfarben",
  ],
  [
    "md3-dashboard-card",
    Md3DashboardCard,
    "MD3 Dashboard",
    "Navigationskacheln mit Zählern und eigenen Sektionen",
  ],
  [
    "md3-circle-card",
    Md3CircleCard,
    "MD3 Circle Progress",
    "Runde Fortschrittsanzeige (Sensor-/Batterieansicht)",
  ],
  ["md3-graph-card", Md3GraphCard, "MD3 Graph", "Kompakte Verlaufskarte"],
  [
    "md3-appliance-card",
    Md3ApplianceCard,
    "MD3 Appliance",
    "Waschmaschine/Trockner/Geschirrspüler mit Programm, Restzeit und Fortschritt",
  ],
  [
    "md3-media-card",
    Md3MediaCard,
    "MD3 Media",
    "Kompakter Mediaplayer mit Cover, App-Icon und Fortschritt",
  ],
  [
    "md3-alarm-card",
    Md3AlarmCard,
    "MD3 Alarm",
    "Alarmkarte (compact / extended)",
  ],
  [
    "md3-users-card",
    Md3UsersCard,
    "MD3 Users",
    "Personen mit Anwesenheitsstatus",
  ],
  [
    "md3-header-card",
    Md3HeaderCard,
    "MD3 Header",
    "Kopfzeile mit Menü, Assist-/Suchleiste und Avatar",
  ],
  [
    "md3-lights-card",
    Md3LightsCard,
    "MD3 Lights",
    "Alle an / Alle aus für alle Lichter oder einen Bereich",
  ],
  [
    "md3-select-card",
    Md3SelectCard,
    "MD3 Select",
    "select / input_select als Chips oder Dropdown",
  ],
  [
    "md3-group-card",
    Md3GroupCard,
    "MD3 Group",
    "Kachel mit Zähler, öffnet einen Dialog mit mehreren Entitäten",
  ],
  [
    "md3-greeting-card",
    Md3GreetingCard,
    "MD3 Greeting",
    "Begrüßung mit Tageszeit, Datum und Wetter",
  ],
  [
    "md3-attention-card",
    Md3AttentionCard,
    "MD3 Attention",
    "Chips für offene Fenster, Lecks, schwache Batterien und Updates (nur wenn nötig)",
  ],
  [
    "md3-rooms-card",
    Md3RoomsCard,
    "MD3 Rooms",
    "Raumkacheln nach Etage mit Umschalter",
  ],
  [
    "md3-nav-card",
    Md3NavCard,
    "MD3 Navigation",
    "Schwebende Navigationsleiste mit Statuspunkten und Mehr-Popup",
  ],
  [
    "md3-popup-card",
    Md3PopupCard,
    "MD3 Popup",
    "Bottom-Sheet mit beliebigen Karten, per URL-Hash geöffnet",
  ],
  [
    "md3-dialog-card",
    Md3DialogCard,
    "MD3 Dialog",
    "Dialog mit beliebigen Karten, per URL-Hash geöffnet",
  ],
];
attachEditors(DEFS);
customElements.define("md3-dialog", Md3Dialog);
customElements.define("md3-sheet", Md3Sheet);
customElements.define("md3-nav", Md3Nav);
window.customCards = window.customCards || [];
DEFS.forEach(([tag, cls, name, description]) => {
  customElements.define(tag, cls);
  window.customCards.push({ type: tag, name, description, preview: false });
});
/* Anything that can navigate (badges, stock cards, automations) can open an md3 dialog via the URL hash:
 *   #md3-entity:person.simon          (append ?hide_related=1 to leave out the related-entities list)
 *   #md3-appliance:sensor.washer_state?program=sensor.p&progress=sensor.pct&remaining=sensor.left&name=Waschmaschine&icon=mdi:washing-machine */
const HASH_ENTITY = "#md3-entity:",
  HASH_APPLIANCE = "#md3-appliance:";
function openHashDialog() {
  const hash = location.hash;
  const isApp = hash.startsWith(HASH_APPLIANCE);
  if (!isApp && !hash.startsWith(HASH_ENTITY)) return;
  const [rawId, query = ""] = hash
    .slice((isApp ? HASH_APPLIANCE : HASH_ENTITY).length)
    .split("?");
  const id = decodeURIComponent(rawId);
  const ha = document.querySelector("home-assistant");
  if (!ha || !ha.hass || !ha.hass.states[id]) return;
  history.replaceState(null, "", location.pathname + location.search);
  if (isApp) {
    const q = new URLSearchParams(query),
      name = q.get("name") || undefined,
      icon = q.get("icon") || undefined;
    openMd3Dialog(ha.hass, id, {
      name,
      icon,
      hide_related: q.get("hide_related") === "1",
      appliance: {
        program_entity: q.get("program") || undefined,
        progress_entity: q.get("progress") || undefined,
        remaining_entity: q.get("remaining") || undefined,
        name,
        icon,
        spin: q.get("spin") !== "0",
      },
    });
  } else if (hasMd3Dialog(ha.hass, id))
    openMd3Dialog(ha.hass, id, {
      hide_related: new URLSearchParams(query).get("hide_related") === "1",
    });
  else moreInfo(ha, id);
}
["location-changed", "hashchange", "popstate"].forEach((ev) =>
  window.addEventListener(ev, openHashDialog),
);
openHashDialog();
console.info(
  `%c md3-cards ${MD3_VERSION} `,
  "background:#6750a4;color:#fff;border-radius:4px",
);
