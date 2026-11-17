// The visitor beacon's payload, and the only way it gets into the server: parseBeacon().
//
// Everything here is reported by a browser, so it's untrusted and bounded on every axis: a crafted
// request can't blow up a Telegram message or the server's memory. Network facts (IP, location, user
// agent) are never taken from the payload; the server reads them from the request.
//
// kind      "arrival" once per visit · "event" a moment worth a ping · "end" the whole visit
// activity  what the reader did on Career Mode:
//   role     picked who they are in the first quest log ("A marketing hire")
//   fit      ran the job-description fit check (never what they pasted)
//   tool     opened one of the free tools
//   contact  opened the email composer, the résumé, LinkedIn or MIGI's summary
// game      how far they walked, and what they collected

export const LIMITS = { pages: 10, actions: 30, activity: 20 };
export const ACTIVITY_KINDS = ['role', 'fit', 'tool', 'contact'];

const DAY = 86_400_000;
const KINDS = ['arrival', 'event', 'end'];
const ACTIONS = ['click', 'submit', 'copy', 'download', 'external'];

const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const int = (v, max, fallback = 0) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.round(v))) : fallback);
const real = (v, max, fallback = 0) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, v)) : fallback);
const intOrNull = (v, max) => (typeof v === 'number' && Number.isFinite(v) ? int(v, max) : null);
const text = (v, max) => {
  if (typeof v !== 'string') return undefined;
  // Control characters have no business in an alert.
  const clean = v.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim();
  return clean ? clean.slice(0, max) : undefined;
};
const bool = (v, fallback = false) => (typeof v === 'boolean' ? v : fallback);
const list = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);
const oneOf = (v, options) => (typeof v === 'string' && options.includes(v) ? v : undefined);

function activity(v) {
  const a = obj(v);
  const kind = oneOf(a.kind, ACTIVITY_KINDS);
  const label = text(a.label, 160);
  return kind && label ? { t: int(a.t, DAY), kind, label } : null;
}

function game(v) {
  const g = obj(v);
  const total = int(g.total, 500);
  if (!total) return undefined;
  return {
    furthest: Math.max(1, Math.min(total, int(g.furthest, 500, 1))),
    total,
    chapter: text(g.chapter, 80),
    coins: int(g.coins, 1000),
    coinsTotal: int(g.coinsTotal, 1000),
    skills: int(g.skills, 1000),
    skillsTotal: int(g.skillsTotal, 1000),
    level: int(g.level, 100),
    plain: bool(g.plain),
    phone: bool(g.phone),
  };
}

/** A clean, bounded payload, or null when the body isn't a beacon at all. */
export function parseBeacon(input) {
  const b = obj(input);
  const kind = oneOf(b.kind, KINDS);
  const sid = typeof b.sid === 'string' && /^[a-z0-9]{6,40}$/i.test(b.sid) ? b.sid : null;
  const path = text(b.path, 300);
  if (b.v !== 1 || !kind || !sid || !path || !path.startsWith('/')) return null;

  const event = kind === 'event' ? activity(b.event) : null;
  if (kind === 'event' && !event) return null;

  const visitor = obj(b.visitor);
  const scroll = obj(b.scroll);
  const s = obj(b.signals);
  const device = obj(b.device);
  const g = game(b.game);

  return {
    v: 1,
    sid,
    kind,
    ...(event ? { event } : {}),
    ...(g ? { game: g } : {}),
    path,
    title: text(b.title, 160),
    referrer: text(b.referrer, 400),
    visitor: {
      returning: bool(visitor.returning),
      visitCount: Math.max(1, int(visitor.visitCount, 100_000, 1)),
      sinceLastMs: intOrNull(visitor.sinceLastMs, 365 * DAY),
      pageLoads: Math.max(1, int(visitor.pageLoads, 500, 1)),
    },
    report: Math.max(1, int(b.report, 3, 1)),
    sessionMs: int(b.sessionMs, DAY),
    activeMs: int(b.activeMs, DAY),
    pages: list(b.pages, LIMITS.pages)
      .map((p) => {
        const page = obj(p);
        const pagePath = text(page.path, 300);
        if (!pagePath) return null;
        return { path: pagePath, title: text(page.title, 160), t: int(page.t, DAY), ...(typeof page.ms === 'number' ? { ms: int(page.ms, DAY) } : {}) };
      })
      .filter(Boolean),
    actions: list(b.actions, LIMITS.actions)
      .map((a) => {
        const action = obj(a);
        const type = oneOf(action.type, ACTIONS);
        const label = text(action.label, 120);
        return type && label ? { t: int(action.t, DAY), type, label } : null;
      })
      .filter(Boolean),
    activity: list(b.activity, LIMITS.activity).map(activity).filter(Boolean),
    scroll: {
      maxPx: int(scroll.maxPx, 2_000_000),
      maxPct: int(scroll.maxPct, 100),
      milestones: list(scroll.milestones, 4).filter((m) => m === 25 || m === 50 || m === 75 || m === 100),
      events: int(scroll.events, 1_000_000),
    },
    signals: {
      pointerMoves: int(s.pointerMoves, 1_000_000),
      clicks: int(s.clicks, 10_000),
      keys: int(s.keys, 100_000),
      touches: int(s.touches, 100_000),
      visibilityChanges: int(s.visibilityChanges, 10_000),
      firstActionMs: intOrNull(s.firstActionMs, DAY),
      lastActionMs: intOrNull(s.lastActionMs, DAY),
      webdriver: bool(s.webdriver),
      touchSupport: bool(s.touchSupport),
      cookiesEnabled: bool(s.cookiesEnabled, true),
      doNotTrack: bool(s.doNotTrack),
      languages: int(s.languages, 50),
      plugins: int(s.plugins, 200),
      hardwareConcurrency: int(s.hardwareConcurrency, 1024),
      deviceMemory: real(s.deviceMemory, 1024),
      timezone: text(s.timezone, 60),
      language: text(s.language, 35),
    },
    device: {
      screenW: int(device.screenW, 30_000),
      screenH: int(device.screenH, 30_000),
      viewportW: int(device.viewportW, 30_000),
      viewportH: int(device.viewportH, 30_000),
      dpr: real(device.dpr, 10, 1),
    },
  };
}
