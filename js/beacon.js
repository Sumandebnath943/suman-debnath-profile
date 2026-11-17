/* Career Mode — visit alerts and analytics.
 *
 * 1. The visitor beacon: tells Suman (on Telegram, through /api/beacon) when someone visits, what they did
 *    and how they left. No cookies. A visit is one browser tab, kept in sessionStorage, so it survives a
 *    reload and ends with the tab. At most three kinds of message per visit:
 *      arrival  once, about a second after the page opens
 *      event    a moment worth a ping (a role picked, a fit check run, a move towards contact), 5 at most
 *      end      the whole visit, when the tab is hidden or closed
 * 2. Google Analytics 4, only once GA_ID below is filled in. Consent Mode keeps it cookieless for visitors
 *    in the EEA, the UK and Switzerland.
 *
 * Both stay off for anyone who opens the page once with ?notrack=1 (undo with ?notrack=0), off everywhere
 * except the live address, and off on localhost unless localStorage "cm_beacon_debug" is "1".
 * Other scripts report moments with: window.dispatchEvent(new CustomEvent('cm:track', { detail: { kind, label } }))
 */
(function () {
  'use strict';

  const LIVE_HOST = 'hire.sumandebnath.houseofnamus.com';
  const GA_ID = ''; // The GA4 measurement ID, like 'G-XXXXXXXXXX'. Empty means GA4 is off.
  const OPT_OUT_KEY = 'cm_beacon_off';
  const DEBUG_KEY = 'cm_beacon_debug';

  const store = (s) => ({
    get(k) { try { const v = s.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(k, v) { try { s.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode or a full quota */ } },
  });
  let local, session;
  try { local = store(localStorage); session = store(sessionStorage); } catch (e) { return; }

  // ?notrack=1 silences this browser for good, ?notrack=0 undoes it. Applied before anything is sent.
  try {
    const p = new URLSearchParams(location.search).get('notrack');
    if (p !== null) {
      if (p === '0' || p === 'false') localStorage.removeItem(OPT_OUT_KEY);
      else localStorage.setItem(OPT_OUT_KEY, '1');
    }
  } catch (e) { /* blocked storage */ }
  let optedOut = false, debug = false;
  try { optedOut = localStorage.getItem(OPT_OUT_KEY) === '1'; debug = localStorage.getItem(DEBUG_KEY) === '1'; } catch (e) { /* blocked storage */ }
  if (optedOut || (location.hostname !== LIVE_HOST && !debug)) return;

  /* ───────── Google Analytics 4 ───────── */
  if (/^G-[A-Z0-9]{4,20}$/.test(GA_ID)) {
    window.dataLayer = window.dataLayer || [];
    const gtag = function () { window.dataLayer.push(arguments); };
    window.gtag = gtag;
    const ask = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
    gtag('consent', 'default', Object.assign({ analytics_storage: 'granted' }, ask));
    // Where the law asks for consent first, GA4 sends cookieless pings only.
    gtag('consent', 'default', Object.assign({ analytics_storage: 'denied', region: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH'] }, ask));
    gtag('js', new Date());
    gtag('config', GA_ID);
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
    window.addEventListener('cm:track', (e) => { const d = e.detail || {}; if (d.kind) gtag('event', `cm_${d.kind}`, { label: String(d.label || '').slice(0, 100) }); });
  }

  /* ───────── the visitor beacon ───────── */
  const ENDPOINT = '/api/beacon';
  const ARRIVAL_DELAY_MS = 900; // let the page settle without making the alert late
  const IDLE_AFTER_MS = 30000; // no input for this long stops the "active" clock
  const VISIT_GAP_MS = 30 * 60000; // a tab resumed after this long is a new visit
  const INTERNAL_NAV_MS = 2500; // an unload this soon after an internal click means "still here"
  const MAX_REPORTS = 3; // someone who comes back to the tab can produce an updated report
  const MAX_INSTANT = 5;
  const INSTANT = ['role', 'fit', 'contact'];
  const LIMITS = { pages: 10, actions: 30, activity: 20 };
  const VISIT_KEY = 'cm_visit', VISITOR_KEY = 'cm_visitor';
  const smallScreen = window.matchMedia('(max-width: 820px), (max-aspect-ratio: 5/6)');

  const newSid = () => Array.from(crypto.getRandomValues(new Uint8Array(9)), (b) => b.toString(36).padStart(2, '0')).join('');

  function loadVisit() {
    const saved = session.get(VISIT_KEY);
    // A tab left open overnight isn't one very long visit.
    if (saved && saved.sid && typeof saved.startedAt === 'number' && Date.now() - saved.lastActivity < VISIT_GAP_MS) {
      ['pages', 'actions', 'activity', 'instantSent'].forEach((k) => { if (!Array.isArray(saved[k])) saved[k] = []; });
      return saved;
    }
    const prior = local.get(VISITOR_KEY);
    const now = Date.now();
    local.set(VISITOR_KEY, { visits: ((prior && prior.visits) || 0) + 1, lastSeen: now });
    return {
      sid: newSid(), startedAt: now, lastActivity: now, activeMs: 0, pages: [], actions: [], activity: [],
      scroll: { maxPx: 0, maxPct: 0, milestones: [], events: 0 },
      pointerMoves: 0, clicks: 0, keys: 0, touches: 0, visibilityChanges: 0, firstActionMs: null, lastActionMs: null,
      arrivalSent: false, instantSent: [], reportsSent: 0, dirtySinceReport: true, pageLoads: 0, furthest: 0, plain: false,
      referrer: document.referrer || undefined,
      returning: Boolean(prior), visitCount: ((prior && prior.visits) || 0) + 1, sinceLastMs: prior && prior.lastSeen ? Math.max(0, now - prior.lastSeen) : null,
    };
  }

  const v = loadVisit();
  v.pageLoads += 1;
  const persist = () => session.set(VISIT_KEY, v);
  const since = () => Date.now() - v.startedAt;
  const markActivity = () => { v.lastActivity = Date.now(); v.dirtySinceReport = true; };
  let internalNavUntil = 0;

  const path = location.pathname + location.search;
  const lastPage = v.pages[v.pages.length - 1];
  if (lastPage && lastPage.ms === undefined) lastPage.ms = Math.max(0, since() - lastPage.t);
  if (v.pages.length < LIMITS.pages) v.pages.push({ path, title: document.title.slice(0, 160), t: since() });
  persist();

  function recordAction(type, label) {
    const t = since();
    if (v.firstActionMs === null) v.firstActionMs = t;
    v.lastActionMs = t;
    if (v.actions.length < LIMITS.actions) v.actions.push({ type, label: String(label).slice(0, 120), t });
    markActivity();
  }

  /** A readable name for whatever was clicked. */
  function labelFor(el) {
    const node = el.closest('a, button, [role="button"], summary, label, select, input') || el;
    const aria = node.getAttribute && node.getAttribute('aria-label');
    if (aria) return aria.trim();
    const text = node.innerText && node.innerText.trim();
    if (text) return text.replace(/\s+/g, ' ').slice(0, 120);
    const title = node.getAttribute && node.getAttribute('title');
    if (title) return title.trim();
    if (node.href) return node.href;
    return node.tagName.toLowerCase();
  }

  function scrollPct() {
    const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    if (height <= window.innerHeight) return 100;
    return Math.max(0, Math.min(100, Math.round(((window.scrollY + window.innerHeight) / height) * 100)));
  }

  const num = (sel) => { const el = document.querySelector(sel); const n = el ? parseInt(el.textContent, 10) : 0; return Number.isFinite(n) ? n : 0; };

  /** How far the reader has walked, from the game's own state (window.__cm, set by js/game.js). */
  function trackGame() {
    const cm = window.__cm;
    if (cm && cm.state) v.furthest = Math.max(v.furthest || 0, cm.state.active || 0);
    if (document.documentElement.classList.contains('plain')) v.plain = true;
  }
  function gameInfo() {
    const cm = window.__cm;
    if (!cm || !cm.beats) return undefined;
    trackGame();
    const beat = cm.beats[v.furthest] || cm.beats[0];
    return {
      furthest: v.furthest + 1, total: cm.beats.length, chapter: beat && beat.chName,
      coins: num('#hud-coins'), coinsTotal: num('#hud-coins-total'), skills: num('#hud-ev'), skillsTotal: num('#hud-ev-total'), level: num('#hud-lv'),
      plain: Boolean(v.plain), phone: smallScreen.matches,
    };
  }

  function build(kind, event) {
    // Close out the page being viewed so its time is counted.
    const pages = v.pages.map((p) => Object.assign({}, p));
    const last = pages[pages.length - 1];
    if (last && last.ms === undefined) last.ms = Math.max(0, since() - last.t);
    return {
      v: 1, sid: v.sid, kind, ...(event ? { event } : {}),
      visitor: { returning: v.returning, visitCount: v.visitCount, sinceLastMs: v.sinceLastMs, pageLoads: Math.max(1, v.pageLoads) },
      report: v.reportsSent || 1,
      path: location.pathname + location.search,
      title: (document.title || '').slice(0, 160),
      // Where the visit came from: the first page's referrer, not a later reload.
      referrer: v.referrer,
      sessionMs: since(), activeMs: Math.round(v.activeMs),
      pages, actions: v.actions, activity: v.activity, scroll: v.scroll, game: gameInfo(),
      signals: {
        pointerMoves: v.pointerMoves, clicks: v.clicks, keys: v.keys, touches: v.touches, visibilityChanges: v.visibilityChanges,
        firstActionMs: v.firstActionMs, lastActionMs: v.lastActionMs,
        webdriver: Boolean(navigator.webdriver), touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        cookiesEnabled: navigator.cookieEnabled, doNotTrack: navigator.doNotTrack === '1',
        languages: (navigator.languages && navigator.languages.length) || 0, plugins: (navigator.plugins && navigator.plugins.length) || 0,
        hardwareConcurrency: navigator.hardwareConcurrency || 0, deviceMemory: navigator.deviceMemory || 0,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, language: navigator.language,
      },
      device: { screenW: screen.width, screenH: screen.height, viewportW: window.innerWidth, viewportH: window.innerHeight, dpr: window.devicePixelRatio || 1 },
    };
  }

  function send(kind, viaBeacon, event) {
    const json = JSON.stringify(build(kind, event));
    if (viaBeacon && typeof navigator.sendBeacon === 'function') {
      try { if (navigator.sendBeacon(ENDPOINT, new Blob([json], { type: 'application/json' }))) return; } catch (e) { /* fall through to fetch */ }
    }
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: json, keepalive: true }).catch(() => { /* never worth surfacing */ });
  }

  /** Something happened on the page: a role picked, a fit check, a tool, a move towards contact. */
  function onTrack(detail) {
    if (!detail || !detail.label || !detail.kind) return;
    const entry = { t: since(), kind: detail.kind, label: String(detail.label).slice(0, 160) };
    if (v.activity.length < LIMITS.activity) v.activity.push(entry);
    markActivity();
    const key = `${entry.kind}|${entry.label}`;
    if (INSTANT.includes(entry.kind) && !v.instantSent.includes(key) && v.instantSent.length < MAX_INSTANT) {
      v.instantSent.push(key);
      persist();
      send('event', false, entry);
      return;
    }
    persist();
  }
  const track = (kind, label) => onTrack({ kind, label });

  function endVisit() {
    if (v.reportsSent >= MAX_REPORTS) return;
    if (v.reportsSent > 0 && !v.dirtySinceReport) return;
    trackGame();
    v.reportsSent += 1;
    v.dirtySinceReport = false;
    persist();
    send('end', true);
  }

  /* ───────── listeners: every one passive ───────── */
  const passive = { passive: true };
  window.addEventListener('pointermove', () => { v.pointerMoves += 1; markActivity(); }, passive);
  window.addEventListener('scroll', () => {
    v.scroll.events += 1;
    v.scroll.maxPx = Math.max(v.scroll.maxPx, Math.round(window.scrollY));
    v.scroll.maxPct = Math.max(v.scroll.maxPct, scrollPct());
    [25, 50, 75, 100].forEach((m) => { if (v.scroll.maxPct >= m && !v.scroll.milestones.includes(m)) v.scroll.milestones.push(m); });
    markActivity();
  }, passive);
  window.addEventListener('click', (e) => {
    v.clicks += 1;
    const el = e.target instanceof Element ? e.target : null;
    if (!el) { markActivity(); return; }
    const a = el.closest('a');
    const href = a ? a.href || '' : '';
    // A same-page link means the tab is staying, not leaving.
    if (a && a.origin === location.origin && !a.target) internalNavUntil = Date.now() + INTERNAL_NAV_MS;
    const type = a && a.hasAttribute('download') ? 'download' : a && href && a.origin !== location.origin ? 'external' : 'click';
    recordAction(type, labelFor(el));
    // The links that mean someone wants to get in touch.
    if (/Suman_Debnath_Resume\.pdf/i.test(href)) track('contact', 'Opened the résumé PDF');
    else if (/linkedin\.com\/in\//i.test(href)) track('contact', 'Opened his LinkedIn');
    else if (/^https:\/\/mail\.google\.com\//.test(href)) track('contact', 'Opened Gmail with the email ready to send');
    else if (/^https:\/\/outlook\.office\.com\//.test(href)) track('contact', 'Opened Outlook with the email ready to send');
    else if (/^mailto:[^?]*hire\./i.test(href)) track('contact', 'Opened their mail app with the email ready to send');
    persist();
  }, true);
  window.addEventListener('keydown', () => { v.keys += 1; markActivity(); }, passive);
  window.addEventListener('touchstart', () => { v.touches += 1; markActivity(); }, passive);
  document.addEventListener('copy', () => recordAction('copy', 'copied text'), passive);
  document.addEventListener('visibilitychange', () => {
    v.visibilityChanges += 1;
    if (document.visibilityState === 'hidden') {
      persist();
      // Phones rarely fire pagehide when a tab is closed or the app switched, so a hidden tab reports now.
      if (Date.now() >= internalNavUntil) endVisit();
    } else markActivity();
  });
  window.addEventListener('pagehide', () => {
    persist();
    if (Date.now() < internalNavUntil) return; // still on the site: the next page load resumes this visit
    endVisit();
  });
  window.addEventListener('cm:track', (e) => onTrack(e.detail));

  // Active time and progress, plus a periodic save so a crash doesn't lose the visit.
  setInterval(() => {
    trackGame();
    if (document.visibilityState !== 'visible' || Date.now() - v.lastActivity > IDLE_AFTER_MS) return;
    v.activeMs += 1000;
    if (v.activeMs % 5000 === 0) persist();
  }, 1000);

  // Announced once per visit, not once per reload.
  if (!v.arrivalSent) {
    setTimeout(() => {
      if (v.arrivalSent) return;
      v.arrivalSent = true;
      persist();
      send('arrival', false);
    }, ARRIVAL_DELAY_MS);
  }
})();
