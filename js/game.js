/* Career Mode — the engine.
   Scrolling the page walks Suman through eight scenes laid end to end. Nothing is hijacked:
   the page scrolls natively, and the world simply reads how far you have come. */
import { mk, R, mix, disc, tint, glow, text, textW, label, plate, sysBox, logo, makeHero, makeMigi, coinFrames, crow, clamp, ease, out3, commas, INK } from './kit.js';
import { paintSky, cloud } from './props.js';
import { kolkata } from './kolkata.js';
import { pune } from './pune.js';
import { road, gap, kerala } from './away.js';
import { floor, roof } from './work.js';
import { dungeon } from './dungeon.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const worldEl = $('#world'), stage = $('#stage'), wrap = $('#scene-wrap'), cv = $('#scene'), main = cv.getContext('2d');
let ctx = main;                                         // points at the screen, or at the buffer of the scene being left
const tipEl = $('#tip'), hudYear = $('#hud-year'), hudCh = $('#hud-chapter'), hudCoins = $('#hud-coins'), hudLv = $('#hud-lv'), hudEv = $('#hud-ev');
const nextBtn = $('#next'), prevBtn = $('#prev'), pipsEl = $('#pips'), countEl = $('#count'), soundBtn = $('#sound');

/* ───────── the world: eight scenes, end to end ───────── */
const scenes = [kolkata(), road(), pune(), kerala(), gap(), floor(), dungeon(), roof()];
let acc = 0;
scenes.forEach((s, i) => { s.ox = acc; acc += s.len; s.x1 = i === scenes.length - 1 ? 1e9 : acc; });
const byId = Object.fromEntries(scenes.map((s) => [s.id, s]));
const sceneAt = (wx) => scenes.find((s) => wx < s.x1);

const beats = $$('.beat').map((el, i) => ({ el, i, id: el.dataset.id, x: byId[el.dataset.s].ox + +el.dataset.x, year: el.dataset.year || '', ch: +el.dataset.c || 1, chName: el.dataset.ch || '', lv: +el.dataset.lv || 0 }));
const X0 = beats[0].x, X1 = beats[beats.length - 1].x + 40;
const REWIND = 252, BORN = byId.dungeon.ox + byId.dungeon.born;
const outfit = (x) => (x < REWIND ? 'adult' : x < byId.road.ox ? 'teen' : x < byId.kerala.ox ? 'student' : 'adult');
const COINS = scenes.flatMap((s) => s.coins.map(([x, h]) => ({ x: s.ox + x, h, got: false })));
// Hurdles from the story lie on the road. A jump clears one for a bonus coin; walking into one costs a coin.
const OBST = scenes.flatMap((s) => (s.obstacles || []).map((o) => ({ ...o, x: s.ox + o.x, done: false })));
scenes.forEach((s) => (s.obstacles || []).forEach((o) => s.hot.push({ x: o.x - 10, y: 160 - (o.h || 4) - 8, w: 20, h: (o.h || 4) + 10, say: o.say, jump: 1 })));
const COIN_TOTAL = COINS.length + OBST.length;
$('#hud-coins-total').textContent = COIN_TOTAL;

// MIGI's evidence log: every skill listed in a beat is logged the first time that beat is reached.
const SKILLS = beats.map((b) => [...b.el.querySelectorAll('.skills li')].map((li) => li.textContent.trim()));
const ALL_SKILLS = [...new Set(SKILLS.flat())];
const logged = new Set();
$('#hud-ev-total').textContent = ALL_SKILLS.length;
// Who is reading: set from the chips in the first beat. MIGI marks the beats that matter to them.
let role = '';
const forRole = (b) => !!role && role !== 'curious' && (b.el.dataset.for || '').split(' ').includes(role);

const hero = makeHero(), migi = makeMigi(), coinF = coinFrames();
const GL = { warm: glow(26, '#ffcf7a', 0.5), warmS: glow(13, '#ffd98f', 0.55), cool: glow(13, '#9fd8ff', 0.5), cyan: glow(8, '#73eff7', 0.45), sun: glow(46, '#ffe2a0', 0.55) };
const CL = [0, 1, 2, 3, 4, 5, 6].map((i) => {
  const w = 34 + ((i * 37) % 46);
  return { day: cloud(11 + i, w, '#ffffff', '#e3ecf8', '#c5d4ea'), dawn: cloud(11 + i, w, '#ffdcc2', '#f2a08c', '#b56d98'), grey: cloud(11 + i, w + 14, '#a9b2c4', '#8791a8', '#667088'), x: i * 97 + 20, y: 4 + ((i * 53) % 44), sp: 1.2 + (i % 3) * 0.7 };
});
const STARS = Array.from({ length: 40 }, (_, i) => ({ x: (i * 0.6180339) % 1, y: (i * 0.3819) % 1, tw: 1 + (i % 5) * 0.5, ph: i }));
const MOTES = Array.from({ length: 16 }, (_, i) => ({ x: i * 71, y: 8 + ((i * 29) % 46), sp: 2 + (i % 4), ph: i * 1.7 }));
const QUIPS = [
  'I am agent 46 of 46. The other 45 are busy doing his admin.',
  'The whole fleet has cost him about five dollars to run so far. He still checks my work.',
  'More than 500 automated checks watch what I do. I choose to find that flattering.',
];

/* ───────── state ───────── */
let S = 4, W = 360, H = 225, Fs = 205, RATIO = 2, anchor = 0.62, sunFrac = 0.72, narrow = false, hudW = 12;
let trackTop = 0, trackLen = 1, cam0 = 0, camX = 0, tNow = 0, active = -1, beatT = 0, variant = 'adult', level = 1;
let tmp, wb, fade, kb = null, coinsGot = 0, quip = 0, started = 0, tipT = 0, cur = scenes[0], leaving = null, wasBorn = false;
const P = { x: X0, v: 0, face: 1, phase: 0, jy: 0, vy: 0, ground: true, blink: 0, blinkT: 2, run: false, moving: false };
const M = { x: X0 - 22, y: -46, face: 1, talk: 0, happy: 0, alert: 0 };
// blend: how much of the scene being left is still on screen (1 → 0). snap: blend from a still frame after a long jump.
const fx = { rewind: 0, dir: -1, blend: 0, snap: false, title: '', titleT: 0, lvl: 0, born: 0 };
const BLEND = 1.1, TITLE = 2.2;
const MAXV = 300;                                       // Suman's top speed, in world pixels a second: he runs, he never teleports
let teleport = false, hintShown = false, warnT = 0;
const keys = { l: false, r: false };
const parts = [];
const flown = new Set();

/* ───────── sound: off until the visitor turns it on ───────── */
let actx = null, soundOn = false;
const beep = (f, d = 0.08, type = 'square', v = 0.035, slide = 0, delay = 0) => {
  if (!soundOn) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain(), t0 = actx.currentTime + delay;
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t0 + d);
    g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g).connect(actx.destination); o.start(t0); o.stop(t0 + d + 0.02);
  } catch (e) { /* audio is a bonus */ }
};

/* ───────── layout ───────── */
function resize() {
  const b = wrap.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  if (!b.width || !b.height) return;
  // Remember where Suman stands, so a resize (or hiding the text on a phone) does not move him.
  const keepX = started > 0.5 && !document.documentElement.classList.contains('plain') ? X0 + clamp((window.scrollY - trackTop) / trackLen, 0, 1) * (X1 - X0) : null;
  let s = Math.max(2, Math.round(b.height / 216));
  const whole = (v) => Math.abs(v * dpr - Math.round(v * dpr)) < 0.01;
  if (!whole(s)) { if (whole(s + 1) && b.height / (s + 1) >= 168) s += 1; else if (s > 2 && whole(s - 1)) s -= 1; }
  if (b.width / s < 176) s = Math.max(2, Math.floor(b.width / 176));   // a tall, narrow scene keeps enough width for the billboards
  S = s; W = Math.ceil(b.width / S); H = Math.ceil(b.height / S);
  cv.width = W; cv.height = H; cv.style.width = W * S + 'px'; cv.style.height = H * S + 'px';
  ctx.imageSmoothingEnabled = false;
  narrow = window.getComputedStyle(stage).display === 'flex';
  Fs = H - 20; anchor = narrow ? 0.4 : 0.44; sunFrac = narrow ? 0.66 : 0.72;   // the whole scene is free now: Suman walks a little left of centre
  hudW = Math.ceil(Math.max(0, $('#hud').getBoundingClientRect().bottom - b.top) / S) + 3;
  // Scroll pixels per world pixel. A mouse-wheel notch now moves Suman about a third of a building, not a whole one.
  RATIO = narrow ? S * 0.9 : S * 0.78;
  trackLen = (X1 - X0) * RATIO;
  worldEl.style.height = Math.round(stage.offsetHeight + trackLen) + 'px';
  trackTop = worldEl.getBoundingClientRect().top + window.scrollY;
  cam0 = X0 - W * anchor;
  tmp = mk(W, H); wb = mk(W, H); fade = mk(W, H);
  scenes.forEach((s) => { s.sky = mk(W, H); s.skyKey = ''; s.haze = s.haze || '#ffd28a'; });
  if (keepX !== null) { kb = null; window.scrollTo(0, trackTop + (keepX - X0) * RATIO); }
}

const beatY = (i) => trackTop + (beats[i].x - X0) * RATIO;
// A neighbouring beat is walked to; a far one (a chapter button) is jumped to, behind the scene blend.
const goTo = (i) => {
  i = clamp(i, 0, beats.length - 1);
  const far = Math.abs(beats[i].x - P.x) > 600;
  if (far) teleport = true;
  window.scrollTo({ top: beatY(i), behavior: reduced || far ? 'auto' : 'smooth' });
};

function setActive(i) {
  if (i === active) return;
  active = i; beatT = 0;
  const b = beats[i];
  beats.forEach((o) => o.el.classList.toggle('is-active', o.i === i));
  $$('button', pipsEl).forEach((p, j) => { p.setAttribute('aria-current', j + 1 === b.ch ? 'true' : 'false'); p.classList.toggle('is-done', j + 1 < b.ch); });
  hudYear.textContent = b.year; if (hudCh) hudCh.textContent = b.chName;
  countEl.textContent = `${i + 1} of ${beats.length}`;
  prevBtn.disabled = i === 0;
  setNextLabel();
  M.talk = 1.6;
  // MIGI logs the skills this beat proves.
  const fresh = SKILLS[i].filter((s) => !logged.has(s));
  if (fresh.length) {
    fresh.forEach((s) => logged.add(s));
    hudEv.textContent = logged.size;
    if (started > 0.6) {
      parts.push({ k: 'txt', s: `+${fresh.length} SKILL${fresh.length > 1 ? 'S' : ''}`, x: M.x - 18, y: M.y - 16, vx: 0, vy: -14, life: 1.5, max: 1.5, col: '#73eff7' });
      const ev = hudEv.parentElement; ev.classList.remove('is-ping'); void ev.offsetWidth; ev.classList.add('is-ping');
    }
  }
  if (forRole(b) && started > 0.6) { M.alert = 2.2; [880, 1175].forEach((f, k) => beep(f, 0.07, 'triangle', 0.03, 0, k * 0.08)); }
  let lv = 1;
  for (const o of beats) if (o.i <= i && o.lv > lv) lv = o.lv;
  if (lv !== level) {
    if (lv > level && started > 0.6) { fx.lvl = 1; sparkle(P.x, -24, 22, '#ffe08a'); [523, 659, 784, 1047].forEach((f, k) => beep(f, 0.12, 'square', 0.035, 0, k * 0.09)); }
    level = lv; hudLv.textContent = lv;
  }
  if (started > 0.6) beep(660, 0.05, 'triangle', 0.03);
}

// With a reader's role set, Next skips to the next beat that matters to them.
const nextFor = (i) => { if (!role || role === 'curious') return i + 1; for (let j = i + 1; j < beats.length; j++) if (forRole(beats[j])) return j; return beats.length - 1; };
const smallScreen = window.matchMedia('(max-width: 820px), (max-aspect-ratio: 5/6)');
function setNextLabel() {
  const i = Math.max(0, active), sm = smallScreen.matches, forYou = role && role !== 'curious';
  nextBtn.textContent = i === 0 ? (sm ? 'Start ▶' : 'Start walking ▶') : i === beats.length - 1 ? (sm ? 'Again ↺' : 'Back to the start ↺') : forYou && !sm ? 'Next for you ▶' : 'Next ▶';
}
smallScreen.addEventListener && smallScreen.addEventListener('change', setNextLabel);
function setRole(w) {
  role = w || '';
  beats.forEach((b) => b.el.classList.toggle('for-you', forRole(b)));
  setNextLabel();
}

function showTip(html, cx, cy) {
  tipEl.innerHTML = html;
  const b = wrap.getBoundingClientRect();
  tipEl.style.left = clamp(cx - 110, 8, Math.max(8, b.width - 262)) + 'px';
  tipEl.style.top = clamp(cy - 96, 50, Math.max(50, b.height - 110)) + 'px';
  tipEl.classList.add('is-on');
  tipT = 4.5;
}

function jump() {
  if (!P.ground) return;
  P.ground = false; P.vy = -182;
  beep(330, 0.14, 'square', 0.03, 1.9);
  puff(P.x, 0, 3);
}
function puff(x, y, n) {
  if (reduced) return;
  for (let i = 0; i < n; i++) parts.push({ k: 'dust', x: x + (Math.random() - 0.5) * 8, y: y - 1, vx: (Math.random() - 0.5) * 22, vy: -6 - Math.random() * 10, life: 0.45, max: 0.45 });
}
function sparkle(x, y, n, col = '#ffe08a') {
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = 20 + Math.random() * 40; parts.push({ k: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, life: 0.5, max: 0.5, col }); }
}

/* ───────── update ───────── */
function update(dt) {
  tNow += dt; started += dt; beatT += dt;
  if (keys.l !== keys.r) {
    kb = clamp((kb === null ? window.scrollY : kb) + (keys.r ? 1 : -1) * 150 * RATIO * dt, trackTop, trackTop + trackLen);
    window.scrollTo(0, kb);
  } else kb = null;

  const sc = clamp((window.scrollY - trackTop) / trackLen, 0, 1);
  const target = X0 + sc * (X1 - X0);
  const prev = P.x;
  // Suman follows the scroll, but never faster than he can run, so every scene has time to arrive.
  // Only a chapter button or a dragged scrollbar (a very long way) moves him in one go.
  if (reduced || teleport || Math.abs(target - P.x) > 1400 || started < 0.1) { P.x = target; teleport = false; }
  else {
    let step = (target - P.x) * (1 - Math.exp(-dt * 8));
    step = clamp(step, -MAXV * dt, MAXV * dt);
    P.x += step;
    if (Math.abs(target - P.x) < 0.08) P.x = target;
  }
  const dx = P.x - prev;
  P.v = dx / dt;
  P.moving = Math.abs(P.v) > 9;
  if (P.moving) P.face = Math.sign(P.v);
  const wasRun = P.run;
  P.run = Math.abs(P.v) > 175;
  if (P.run && !wasRun && P.ground) puff(P.x - P.face * 4, 0, 2);
  P.phase = P.moving ? (P.phase + Math.abs(dx) / (P.run ? 28 : 17)) % 1 : 0;

  // Obstacles: crossed going forwards, on foot or in the air.
  warnT = Math.max(0, warnT - dt);
  for (const o of OBST) {
    if (o.done) continue;
    const ahead = o.x - P.x;
    if (ahead > 0 && ahead < 46 && P.ground && P.moving && P.face > 0) {
      warnT = 0.4;
      if (!hintShown && started > 0.6) {
        hintShown = true;
        showTip('<b>MIGI says:</b>Jump! Press Space or the up arrow, or tap the scene.', (P.x - camX) * S, (Fs - 40) * S);
      }
    }
    if (!(prev < o.x && P.x >= o.x)) continue;
    o.done = true;
    if (Math.abs(dx) > 120) continue;                   // passed during a jump between chapters: no score either way
    if (!P.ground && -P.jy >= (o.h || 3) * 0.6) {
      coinsGot++; hudCoins.textContent = coinsGot;
      sparkle(o.x, -(o.h || 3) - 4, 12, '#a7f070');
      parts.push({ k: 'txt', s: 'CLEARED +1', x: o.x - 26, y: -30, vx: 0, vy: -18, life: 1.2, max: 1.2, col: '#a7f070' });
      M.happy = 1.2; beep(784, 0.08); beep(1175, 0.14, 'square', 0.035, 0, 0.08);
    } else {
      P.ground = false; P.vy = -80; puff(o.x, 0, 6);
      parts.push({ k: 'txt', s: 'OOF', x: o.x - 9, y: -34, vx: 0, vy: -16, life: 1, max: 1, col: '#f6757a' });
      if (coinsGot > 0) { coinsGot--; hudCoins.textContent = coinsGot; parts.push({ k: 'coin', x: o.x, y: -18, vx: -30, vy: -70, life: 0.9, max: 0.9 }); }
      beep(150, 0.18, 'sawtooth', 0.03, 0.6);
    }
  }

  if (!P.ground) {
    P.vy += 640 * dt; P.jy += P.vy * dt;
    if (P.jy >= 0) { P.jy = 0; P.vy = 0; P.ground = true; puff(P.x, 0, 4); }
  }
  P.blinkT -= dt; P.blink -= dt;
  if (P.blinkT < 0) { P.blink = 0.13; P.blinkT = 2.2 + Math.random() * 3; }

  // One scene dissolves into the next while Suman keeps walking. Both are drawn live during the blend;
  // after a long jump (a chapter button), the last frame of the old scene fades out instead.
  const sNow = sceneAt(P.x);
  if (sNow !== cur) {
    const fwd = scenes.indexOf(sNow) > scenes.indexOf(cur);
    if (started > 0.3 && !reduced) {
      fx.snap = Math.abs(dx) > 300 || fx.blend > 0.5;
      if (fx.snap) { fade.x.globalAlpha = 1; fade.x.globalCompositeOperation = 'source-over'; fade.x.clearRect(0, 0, W, H); fade.x.drawImage(cv, 0, 0); }
      leaving = cur; fx.blend = 1;
      if (fwd) { fx.title = sNow.title || ''; fx.titleT = TITLE; }
      beep(220, 0.3, 'triangle', 0.03, 2);
    }
    cur = sNow;
  }
  fx.blend = Math.max(0, fx.blend - dt / BLEND);
  if (fx.blend === 0) leaving = null;
  fx.titleT = Math.max(0, fx.titleT - dt);

  // The story rewinds to 2009 once, and Suman becomes the schoolboy he was.
  const v = outfit(P.x);
  if (v !== variant) {
    const rewound = (v === 'teen' && variant === 'adult' && P.x < 400) || (v === 'adult' && variant === 'teen');
    variant = v;
    if (rewound && started > 0.3) { fx.rewind = 1; fx.dir = v === 'teen' ? -1 : 1; sparkle(P.x, -20, 14, '#73eff7'); beep(880, 0.35, 'sawtooth', 0.025, v === 'teen' ? 0.3 : 2.2); }
  }
  fx.rewind = Math.max(0, fx.rewind - dt / 0.95);
  fx.lvl = Math.max(0, fx.lvl - dt / 1.8);

  // MIGI is a hologram until the day he is built.
  const born = P.x >= BORN;
  if (born !== wasBorn) { wasBorn = born; if (born && started > 0.3) { fx.born = 1; sparkle(M.x, M.y, 26, '#73eff7'); [392, 523, 784].forEach((f, k) => beep(f, 0.16, 'triangle', 0.04, 0, k * 0.1)); } }
  fx.born = Math.max(0, fx.born - dt / 1.6);

  let a = 0;
  for (const b of beats) if (P.x >= b.x - 28) a = b.i;   // the story follows Suman, not the scroll bar
  setActive(a);
  if (cur.tick) cur.tick(dt, beats[active].id, beatT);

  // MIGI trails behind Suman's shoulder and keeps an eye on him.
  const mx = P.x - P.face * 21, my = -47 + Math.sin(tNow * 2.3) * 2.2 + P.jy * 0.3;
  M.x += (mx - M.x) * (1 - Math.exp(-dt * 4.5));
  M.y += (my - M.y) * (1 - Math.exp(-dt * 7));
  if (Math.abs(P.x - M.x) > 3) M.face = Math.sign(P.x - M.x);
  M.talk -= dt; M.happy -= dt; M.alert -= dt;

  for (const c of COINS) {
    if (c.got || Math.abs(P.x - c.x) > 9) continue;
    if (c.h > 40 && -P.jy < c.h - 42) continue;
    c.got = true; coinsGot++; hudCoins.textContent = coinsGot;
    sparkle(c.x, -c.h, 10); parts.push({ k: 'txt', s: '+1', x: c.x - 5, y: -c.h - 6, vx: 0, vy: -22, life: 0.9, max: 0.9, col: '#ffe08a' });
    M.happy = 1.2; beep(988, 0.07); beep(1319, 0.14, 'square', 0.035, 0, 0.07);
    if (coinsGot === COIN_TOTAL) parts.push({ k: 'txt', s: 'EVERY COIN!', x: P.x - 32, y: -64, vx: 0, vy: -12, life: 2.4, max: 2.4, col: '#a7f070' });
  }

  // Crows leave the wire when Suman walks underneath.
  cur.perches.forEach((p, i) => {
    const key = cur.id + i;
    if (flown.has(key) || Math.abs(P.x - cur.ox - p.x) > 26) return;
    flown.add(key);
    parts.push({ k: 'crow', x: cur.ox + p.x, y: p.y - 160, vx: -34 - Math.random() * 20, vy: -30 - Math.random() * 14, life: 4, max: 4 });
  });
  if (!reduced) for (const s of cur.steam) if (Math.random() < dt * 5) parts.push({ k: 'steam', x: cur.ox + s.x + (Math.random() - 0.5) * 4, y: s.y - 160, vx: 2 + Math.random() * 3, vy: -9, life: 1.6, max: 1.6 });
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.k === 'spark' || p.k === 'coin') p.vy += 160 * dt;
    if (p.k === 'dust') { p.vx *= 0.94; p.vy *= 0.94; }
    if (p.life <= 0) parts.splice(i, 1);
  }

  if (tipT > 0) { tipT -= dt; if (tipT <= 0) tipEl.classList.remove('is-on'); }
  camX = Math.max(cam0, P.x - W * anchor);
}

/* ───────── drawing ───────── */
/* A billboard stands on the roof of the building it describes: its rows grow upwards from the roof line,
   so the building itself stays in view. The layout is measured from every row, shown or not, so the board
   does not jump as the numbers arrive. */
function drawBillboard(st, sx, py) {
  const cx = sx(st.x), bot = py + st.bot;
  const items = (st.items || []).map((it) => {
    const full = it.n != null ? commas(it.n) + (it.suf || '') : it.s;
    let sc = it.sc || 1;
    if (textW(full, sc) + 22 > W) sc = 1;
    return { it, sc, w: textW(full, sc) };
  });
  const tagRows = [];
  for (let i = 0; i < (st.tags || []).length; i += 3) tagRows.push(st.tags.slice(i, i + 3));
  const h = tagRows.length * 15 + items.reduce((a, r) => a + 7 * r.sc + 9, 0);
  let y = Math.max(hudW, bot - 3 - h);
  const first = st.tags ? (beatT - 0.25) / 0.3 : items.length ? (beatT - items[0].it.at) / 0.3 : 0;
  if (first > 0 && y + h < bot) {                       // two posts down to the roof
    ctx.globalAlpha = out3(first);
    const pw = clamp(Math.round(Math.max(30, ...items.map((r) => r.w)) / 2) - 8, 10, 44);
    [-1, 1].forEach((d) => { R(ctx, '#3a4466', cx + d * pw - 1, y + h - 2, 2, bot - (y + h) + 2); R(ctx, '#5a6988', cx + d * pw - 1, y + h - 2, 1, bot - (y + h) + 2); });
  }
  tagRows.forEach((row, j) => {
    const ws = row.map(([s]) => textW(s) + 8), tw = ws.reduce((a, w) => a + w, 0) + (row.length - 1) * 3;
    let x0 = clamp(cx - tw / 2, 2, W - tw - 2);
    row.forEach(([s, col], i) => {
      const k = (beatT - 0.25 - (j * 3 + i) * 0.22) / 0.3;
      if (k > 0) { ctx.globalAlpha = out3(k); plate(ctx, s, x0 + ws[i] / 2, y + Math.round(4 * (1 - out3(k))), col); }
      x0 += ws[i] + 3;
    });
    y += 15;
  });
  items.forEach(({ it, sc }) => {
    const k = (beatT - it.at) / 0.3, s = it.n != null ? commas(it.n * out3((beatT - it.at) / 1.1)) + (it.suf || '') : it.s, hw = (textW(s, sc) + 12) / 2;
    if (k > 0) { ctx.globalAlpha = out3(k); plate(ctx, s, clamp(cx, hw, W - hw), y + Math.round(4 * (1 - out3(k))), it.col || '#f4f4f4', sc); }
    y += 7 * sc + 9;
  });
  ctx.globalAlpha = 1;
}

function drawStation(st, sx, py) {
  if (st.bot != null && !st.sys) { drawBillboard(st, sx, py); return; }
  const cx = sx(st.x);
  let y = py + st.y;
  if (st.sys && st.bot != null) {                       // a System window that sits above the alcove, not inside it
    const h = 16 + (st.items || []).reduce((a, it) => a + 7 * ((it.sc && textW(it.n != null ? commas(it.n) + (it.suf || '') : it.s, it.sc) + 22 <= W) ? it.sc : 1) + 3, 0);
    y = py + st.bot - h;
  }
  y = Math.max(y, hudW);
  if (st.tags) {
    st.tags.forEach(([s, col], i) => {
      const k = (beatT - 0.25 - i * 0.26) / 0.3;
      if (k <= 0) return;
      ctx.globalAlpha = out3(k);
      const w = textW(s) + 8;
      plate(ctx, s, cx + (i % 2 === 0 ? -w / 2 - 3 : w / 2 + 3), y + Math.floor(i / 2) * 15 + Math.round(5 * (1 - out3(k))), col);
    });
    y += Math.ceil(st.tags.length / 2) * 15 + 2;
  }
  const rows = [];
  for (const it of st.items || []) {
    const k = (beatT - it.at) / 0.3;
    if (k <= 0) continue;
    const s = it.n != null ? commas(it.n * out3((beatT - it.at) / 1.1)) + (it.suf || '') : it.s;
    let sc = it.sc || 1;
    if (textW(s, sc) + 22 > W) sc = 1;
    rows.push({ s, col: it.col || '#f4f4f4', sc, k: out3(k) });
  }
  if (st.sys) { if (rows.length) sysBox(ctx, rows, cx, y, W, tNow); }
  else rows.forEach((rw) => { ctx.globalAlpha = rw.k; y += plate(ctx, rw.s, clamp(cx, (textW(rw.s, rw.sc) + 12) / 2, W - (textW(rw.s, rw.sc) + 12) / 2), y + Math.round(4 * (1 - rw.k)), rw.col, rw.sc) + 3; });
  ctx.globalAlpha = 1;
}

/* Hurdles from the story, drawn standing on the pavement. X is the centre, Y the ground under Suman's feet. */
function drawObstacle(o, X, Y, t) {
  const c = ctx;
  if (o.kind === 'slip') {                              // the group-discussion rejection, November 2017
    R(c, INK, X - 9, Y - 12, 18, 12); R(c, '#f4f4f4', X - 8, Y - 11, 16, 10); R(c, '#c0cbdc', X - 8, Y - 2, 16, 1);
    R(c, '#c0cbdc', X + 4, Y - 11, 4, 3); R(c, '#e8edf4', X + 5, Y - 10, 3, 2);
    text(c, 'NO', X - 6, Y - 10, '#e43b44'); R(c, '#e43b44', X - 7, Y - 3, 11, 1);
  } else if (o.kind === 'pothole') {                    // the months without a job
    R(c, '#6a6258', X - 9, Y - 1, 18, 1); R(c, '#0b0a16', X - 8, Y, 16, 3); R(c, '#1c1a2e', X - 6, Y + 1, 12, 1);
    R(c, INK, X + 9, Y - 7, 5, 7); R(c, '#ef7d57', X + 10, Y - 6, 3, 6); R(c, '#f4f4f4', X + 10, Y - 4, 3, 1); R(c, '#ef7d57', X + 9, Y - 1, 5, 1);
  } else if (o.kind === 'bug') {                        // the scorer bug that hid three HumanEval points
    const k = Math.floor(t * 8) % 2;
    [-4, 0, 4].forEach((d, i) => { R(c, INK, X + d - 1, Y - 2 + ((i + k) % 2), 1, 2); R(c, INK, X + d + 2, Y - 2 + ((i + k + 1) % 2), 1, 2); });
    R(c, INK, X - 6, Y - 8, 12, 6); R(c, '#e43b44', X - 5, Y - 7, 10, 4); R(c, '#f6757a', X - 4, Y - 7, 3, 1); R(c, INK, X, Y - 7, 1, 4);
    R(c, INK, X + 5, Y - 7, 3, 3); R(c, '#ffcd75', X + 6, Y - 6, 1, 1);
    R(c, INK, X + 8, Y - 10, 1, 3); R(c, INK, X + 9, Y - 11, 1, 1);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 + 0.2 * Math.sin(t * 5); R(c, '#e43b44', X - 7, Y - 9, 14, 8); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  } else if (o.kind === 'bot') {                        // a fake crawler asking for /.env
    const b = Math.round(Math.sin(t * 4) * 1);
    R(c, INK, X - 5, Y - 11 + b, 10, 9); R(c, '#5a6988', X - 4, Y - 10 + b, 8, 7); R(c, '#16213a', X - 3, Y - 9 + b, 6, 3);
    R(c, Math.floor(t * 3) % 2 ? '#e43b44' : '#f6757a', X - 2, Y - 8 + b, 1, 1); R(c, Math.floor(t * 3) % 2 ? '#e43b44' : '#f6757a', X + 1, Y - 8 + b, 1, 1);
    R(c, INK, X - 3, Y - 2, 2, 2); R(c, INK, X + 1, Y - 2, 2, 2); R(c, INK, X, Y - 13 + b, 1, 2);
    R(c, INK, X - 15, Y - 22, 30, 10); R(c, '#f4f4f4', X - 14, Y - 21, 28, 8); text(c, '/.ENV', X - 14, Y - 20, '#b13e53');
  } else if (o.kind === 'grave') {                      // the model a provider retired
    R(c, INK, X - 10, Y - 13, 20, 13); R(c, INK, X - 8, Y - 15, 16, 2); R(c, '#8b9bb4', X - 9, Y - 12, 18, 12); R(c, '#8b9bb4', X - 7, Y - 14, 14, 2);
    R(c, '#c0cbdc', X - 9, Y - 12, 18, 1); R(c, '#5a6988', X - 9, Y - 2, 18, 2); text(c, 'RIP', X - 8, Y - 11, INK);
    R(c, '#2f6b4f', X - 11, Y - 1, 3, 1); R(c, '#4d9c6c', X + 8, Y - 2, 2, 2);
  }
}

// Draws one scene, with everyone in it, into ctx.
function render(cs) {
  const t = tNow, base = Fs - 26, horizon = base - 30, py = Fs - 160;
  const lx = P.x - cs.ox, camL = camX - cs.ox, u = cs.u(lx), m = cs.mood(u);
  const sx = (l) => Math.round(l - camL), sxw = (wx) => Math.round(wx - camX);
  const beat = beats[active] ? beats[active].id : '';
  const key = m.sky.join('') + horizon;
  if (key !== cs.skyKey) { cs.haze = paintSky(cs.sky.x, W, H, horizon, m.sky); cs.skyKey = key; }
  const haze = cs.haze;
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.drawImage(cs.sky.c, 0, 0);

  if (m.stars > 0.05) for (const s of STARS) {
    ctx.globalAlpha = m.stars * (0.3 + 0.7 * Math.abs(Math.sin(t * s.tw + s.ph)));
    R(ctx, '#fff6e0', Math.floor(s.x * W), Math.floor(s.y * horizon * 0.6), 1, 1);
  }
  const sunX = Math.round(W * sunFrac), sunY = Math.round(horizon - 13 - m.sun * horizon * 0.66);
  if (!m.indoor) {
    if (m.sunA > 0.02) {
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = m.sunA;
      ctx.drawImage(GL.sun, sunX - 46, sunY - 46);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = Math.min(1, m.sunA * 2);
      disc(ctx, mix('#fff0b0', '#fffbea', m.sun), sunX, sunY, 8); disc(ctx, '#fffdf2', sunX - 1, sunY - 1, 5);
    }
    const dark = m.night || 0;
    for (const c of CL) {
      const span = W + 150, cx = Math.round((((c.x - camX * 0.04 + t * c.sp) % span) + span) % span - 75), cy = c.y + 12;
      const g = m.grey, pk = m.pink * (1 - g), dy = (1 - m.pink) * (1 - g);
      if (dy > 0.02) { ctx.globalAlpha = dy * 0.95 * (1 - dark * 0.75); ctx.drawImage(c.day, cx, cy); }
      if (pk > 0.02) { ctx.globalAlpha = pk * 0.92 * (1 - dark * 0.6); ctx.drawImage(c.dawn, cx, cy); }
      if (g > 0.02) { ctx.globalAlpha = g * 0.95; ctx.drawImage(c.grey, cx - 6, cy - 2); ctx.drawImage(c.grey, cx + 40, cy + 9); }
    }
    ctx.globalAlpha = 0.8 * (1 - (m.night || 0)) * (1 - m.rain);
    if (!reduced && ctx.globalAlpha > 0.05) for (let i = 0; i < 5; i++) {
      const span = W + 260, bx = span - ((t * 11 + i * 17 + (i % 2) * 9) % span) - 60;
      crow(ctx, Math.round(bx), Math.round(horizon * 0.34 + (i % 3) * 7 + Math.sin(t * 1.3 + i) * 2), Math.floor(t * 5 + i) % 2, '#3a3358');
    }
  }
  ctx.globalAlpha = 1;

  const g0 = { ctx, x: wb.x, W, H, Fs, base, horizon, py, t, m, u, lx, px: lx, cam: camL, sx, beat, bt: beatT, narrow, hudW };
  const dcam = camL - (cs === scenes[0] ? cam0 : -W * anchor);
  if (cs.custom) cs.custom(g0);
  else {
    // Parallax city. Each layer is washed with the colour of the horizon, so distance reads as haze.
    for (const L of cs.layers) {
      tmp.x.clearRect(0, 0, W, H);
      let px0 = -Math.round(dcam * L.f) - L.pad;
      if (L.anchor) px0 += sunX - L.anchor;
      tmp.x.drawImage(L.c, px0, base + L.sink - L.c.height);
      if (m.amb[1] > 0) tint(tmp.x, W, H, m.amb[0], m.amb[1] * (1 - L.haze));
      tint(tmp.x, W, H, haze, L.haze);
      ctx.drawImage(tmp.c, 0, 0);
      if (L.water && m.glit > 0.02) {                    // the sun's path across the water
        ctx.globalCompositeOperation = 'lighter';
        const tick = Math.floor(t * 4), hash = (a, b) => { const q = Math.sin(a * 12.9898 + b * 78.233 + tick * 37.719) * 43758.5453; return q - Math.floor(q); };
        for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) {
          if (hash(i, j + 9) < 0.25) continue;
          ctx.globalAlpha = (0.62 - i * 0.03) * (0.4 + 0.6 * hash(i, j + 3)) * m.glit;
          R(ctx, '#ffe2a0', sunX + Math.round((hash(i, j) - 0.5) * 2 * (2 + i * 1.3)), horizon + 2 + i * 2, 1 + Math.floor(hash(i, j + 5) * (2 + i * 0.3)), 1);
        }
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      }
    }
    // The street.
    wb.x.clearRect(0, 0, W, H);
    wb.x.drawImage(cs.play.c, Math.round(cs.play.x0 - camL), py);
    if (cs.live) cs.live(g0);
    cs.perches.forEach((p, i) => { if (!flown.has(cs.id + i)) { const X = sx(p.x), Y = py + Math.round(p.y); R(wb.x, '#231d2e', X, Y, 4, 2); R(wb.x, '#231d2e', X + 3, Y - 1, 2, 2); R(wb.x, '#8b9bb4', X + 5, Y, 1, 1); } });
    if (m.amb[1] > 0) tint(wb.x, W, H, m.amb[0], m.amb[1]);
    ctx.drawImage(wb.c, 0, 0);
  }

  ctx.globalCompositeOperation = 'lighter';
  for (const l of cs.lights) {
    const a = (l.always ? 0.55 + 0.45 * m.lamp : m.lamp) * (l.flicker ? 0.82 + 0.18 * Math.sin(t * l.flicker) : 1);
    if (a < 0.03) continue;
    const g = GL[l.g];
    ctx.globalAlpha = a;
    ctx.drawImage(g, sx(l.x) - (g.width >> 1), py + Math.round(l.y) - (g.height >> 1));
  }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;

  if (!m.indoor) for (const mo of MOTES) {
    const span = W + 40, mx = (((mo.x - camX * 1.1 + t * mo.sp) % span) + span) % span - 20;
    ctx.globalAlpha = (0.25 + 0.3 * Math.sin(t * 0.9 + mo.ph)) * (0.3 + 0.7 * m.lamp) * (1 - m.rain);
    R(ctx, '#ffe9b8', Math.round(mx), Math.round(Fs - mo.y + Math.sin(t * 0.6 + mo.ph) * 3), 1, 1);
  }
  if (m.embers && !reduced) for (let i = 0; i < 18; i++) {
    const y = H - ((t * (9 + (i % 4) * 4) + i * 41) % (H + 10)), x = (((i * 67.3 - camX * 0.9 + Math.sin(t * 0.7 + i) * 6) % W) + W) % W;
    ctx.globalAlpha = 0.25 + 0.55 * Math.abs(Math.sin(t * 2 + i));
    R(ctx, i % 3 ? '#f4a03c' : '#ffe08a', Math.round(x), Math.round(y), 1, 1);
  }
  ctx.globalAlpha = 1;

  for (const c of COINS) {
    if (c.got) continue;
    const X = sxw(c.x), Y = Fs - c.h + Math.round(Math.sin(t * 3 + c.x) * 1.5);
    if (X < -12 || X > W + 12) continue;
    ctx.drawImage(coinF[Math.floor(t * 7 + c.x) % 4], X - 5, Y - 5);
    if (Math.floor(t * 2 + c.x) % 5 === 0) R(ctx, '#fffdf2', X + 3, Y - 5, 1, 1);
  }
  for (const o of OBST) {
    if (o.x < cs.ox - 40 || o.x > cs.x1 + 40) continue;
    const X = sxw(o.x);
    if (X > -30 && X < W + 30) drawObstacle(o, X, Fs, t);
  }

  // Shadows, then MIGI, then Suman.
  const hx = sxw(P.x), k = clamp(1 + P.jy / 60, 0.45, 1);
  ctx.globalAlpha = 0.3;
  R(ctx, INK, hx - Math.round(7 * k), Fs, Math.round(14 * k), 1); R(ctx, INK, hx - Math.round(5 * k), Fs + 1, Math.round(10 * k), 1);
  ctx.globalAlpha = 0.16;
  R(ctx, INK, sxw(M.x) - 4, Fs + 1, 8, 1);
  ctx.globalAlpha = 1;

  const holo = !(P.x < REWIND || wasBorn);
  const face = fx.born > 0 ? 'happy' : M.talk > 0 ? 'talk' : M.happy > 0 ? 'happy' : !P.ground ? 'wow' : P.blink > 0 ? 'blink' : 'idle';
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5 + 0.2 * m.lamp + fx.born * 0.5;
  ctx.drawImage(GL.cyan, sxw(M.x) - 8, Math.round(Fs + M.y) - 12);
  if (fx.born > 0) ctx.drawImage(GL.cool, sxw(M.x) - 13, Math.round(Fs + M.y) - 14);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  migi(ctx, M.x - camX, Fs + M.y, { t, face, facing: M.face, holo, pulse: M.talk > 0 && Math.floor(t * 8) % 2 });
  const alert = warnT > 0 || M.alert > 0;
  if (M.talk > 0.2 || alert) {
    const bx = sxw(M.x) - 6, by = Math.round(Fs + M.y) - 25;
    R(ctx, INK, bx - 1, by, 15, 9); R(ctx, INK, bx, by - 1, 13, 11); R(ctx, alert ? '#ffcd75' : '#f4f4f4', bx, by, 13, 9); R(ctx, alert ? '#ffcd75' : '#f4f4f4', bx + 3, by + 9, 2, 1); R(ctx, INK, bx + 2, by + 10, 4, 1);
    if (alert) { const on = Math.floor(t * 8) % 2; R(ctx, INK, bx + 6, by + 1 + on, 1, 4); R(ctx, INK, bx + 6, by + 6 + on, 1, 1); if (M.alert > 0 && warnT <= 0) { R(ctx, INK, bx + 2, by + 3, 1, 1); R(ctx, INK, bx + 10, by + 3, 1, 1); } }
    else for (let i = 0; i < 3; i++) R(ctx, Math.floor(t * 6) % 3 === i ? '#3b5dc9' : '#8b9bb4', bx + 2 + i * 4, by + 4, 2, 2);
  }
  if (M.alert > 0 && warnT <= 0) {                      // a beat that matters to this reader
    ctx.globalAlpha = Math.min(1, M.alert * 2); label(ctx, 'FOR YOU', sxw(M.x) - 20, Math.round(Fs + M.y) - 38, '#73eff7'); ctx.globalAlpha = 1;
  }
  if (fx.born > 0) { ctx.globalAlpha = Math.min(1, fx.born * 3); label(ctx, 'MIGI IS ONLINE', sxw(M.x) - 41, Math.round(Fs + M.y) - 40 - Math.round((1 - fx.born) * 8), '#73eff7'); ctx.globalAlpha = 1; }

  hero(ctx, P.x - camX, Fs + P.jy, {
    variant, mode: !P.ground ? 'jump' : P.moving ? 'walk' : 'idle', phase: P.phase, t, facing: P.face,
    blink: P.blink > 0, run: P.run, rim: { color: m.rim[0], a: m.rim[1], dir: 1 },
  });
  if (fx.lvl > 0) { ctx.globalAlpha = Math.min(1, fx.lvl * 3); label(ctx, `LEVEL ${level}!`, hx - textW(`LEVEL ${level}!`) / 2, Fs - 56 - Math.round((1 - fx.lvl) * 14), '#ffcd75'); ctx.globalAlpha = 1; }

  for (const p of parts) {
    const a = clamp(p.life / p.max, 0, 1), X = sxw(p.x), Y = Math.round(Fs + p.y);
    if (p.k === 'dust') { ctx.globalAlpha = a * 0.7; R(ctx, '#d8d0c0', X, Y, a > 0.5 ? 2 : 1, a > 0.5 ? 2 : 1); }
    else if (p.k === 'spark') { ctx.globalAlpha = a; R(ctx, p.col, X, Y, 1, 1); }
    else if (p.k === 'steam') { ctx.globalAlpha = a * 0.5; R(ctx, '#f4f4f4', X, Y, 2, 2); }
    else if (p.k === 'crow') { ctx.globalAlpha = Math.min(1, a * 3); crow(ctx, X, Y, Math.floor(t * 9) % 2, '#231d2e'); }
    else if (p.k === 'txt') { ctx.globalAlpha = Math.min(1, a * 2.5); label(ctx, p.s, X, Y, p.col); }
    else if (p.k === 'coin') { ctx.globalAlpha = Math.min(1, a * 2); ctx.drawImage(coinF[Math.floor(t * 12) % 4], X - 5, Y - 5); }
  }
  ctx.globalAlpha = 1;

  if (m.rain > 0.02) {                                   // rain, and a grey veil over everything
    ctx.globalAlpha = 0.1 * m.rain; R(ctx, '#3a4662', 0, 0, W, H);
    const n = Math.round(90 * m.rain * (W / 360));
    for (let i = 0; i < n; i++) {
      const sp = 150 + (i % 5) * 24, y = ((i * 53.7 + t * sp) % (H + 20)) - 10, x = ((((i * 97.3 - t * sp * 0.3) % (W + 30)) + W + 30) % (W + 30)) - 15;
      ctx.globalAlpha = (0.3 + (i % 3) * 0.12) * m.rain;
      R(ctx, '#d6e4f7', Math.round(x), Math.round(y), 1, 3); R(ctx, '#d6e4f7', Math.round(x) - 1, Math.round(y) + 3, 1, 2);
    }
    for (let i = 0; i < 16; i++) { const q = Math.sin(i * 91.7 + Math.floor(t * 9) * 13.1) * 43758.5; ctx.globalAlpha = 0.5 * m.rain; R(ctx, '#e8f0ff', Math.floor((q - Math.floor(q)) * W), Fs - 3 + (i % 9), 2, 1); }
    ctx.globalAlpha = 1;
  }

  if (cs.over) cs.over(g0);
  const st = cs.stations && cs.stations[beat];
  if (st) drawStation(st, sx, py);

  if (cs.fg && !cs.custom) ctx.drawImage(cs.fg.c, -Math.round(dcam * cs.fg.f) - 30, H - 40);
}

// The frame: the scene being left dissolves into the new one, then the effects that sit on top of both.
function frameDraw() {
  if (leaving && fx.blend > 0) {
    if (!fx.snap) { ctx = fade.x; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; render(leaving); ctx = main; }
    render(cur);
    ctx.globalAlpha = ease(fx.blend);
    ctx.drawImage(fade.c, 0, 0);
    ctx.globalAlpha = 1;
  } else render(cur);

  const t = tNow;
  if (fx.titleT > 0 && fx.title) {                      // the chapter's name, for a moment
    const k1 = Math.min(1, (TITLE - fx.titleT) / 0.25, fx.titleT / 0.6);
    const sc = textW(fx.title, 2) + 16 < W ? 2 : 1, w = textW(fx.title, sc) + 8, h = 7 * sc + 6;
    const X = Math.round((W - w) / 2), Y = Math.max(hudW + 4, Math.round(H * 0.3) - Math.round((1 - k1) * 4));
    ctx.globalAlpha = k1 * 0.86; R(ctx, INK, X - 6, Y - 4, w + 12, h + 8);
    ctx.globalAlpha = k1; R(ctx, '#ffcd75', X - 6, Y + h + 3, w + 12, 1);
    label(ctx, fx.title, X + 4, Y + 3, '#ffcd75', sc);
    ctx.globalAlpha = 1;
  }
  if (fx.rewind > 0) {
    const k1 = fx.rewind;
    ctx.globalAlpha = Math.min(1, k1 * 1.6) * 0.8;
    for (let y = 0; y < H; y += 5) R(ctx, y % 10 ? '#f4f4f4' : '#73eff7', ((((t * 620 * fx.dir + y * 37) % (W + 90)) + W + 90) % (W + 90)) - 90, y, 70, 1);
    ctx.globalAlpha = clamp(k1 * 2.4 - 1.4, 0, 1) * 0.85;
    R(ctx, '#f4f4f4', 0, 0, W, H);
    ctx.globalAlpha = Math.min(1, k1 * 3);
    const s = fx.dir < 0 ? '<< 2009' : '>> TODAY', sc = narrow ? 2 : 3;
    label(ctx, s, (W - textW(s, sc)) / 2, Math.round(H * 0.42), '#ffcd75', sc);
    ctx.globalAlpha = 1;
  }
}

/* ───────── a sprite sheet for close inspection: add ?sheet to the address ───────── */
function sheet() {
  S = 6; W = 232; H = 150;
  cv.width = W; cv.height = H; cv.style.width = W * S + 'px'; cv.style.height = H * S + 'px';
  $('#panel').style.display = 'none';
  const draw = (now) => {
    const t = now / 1000;
    R(ctx, '#7fa7ba', 0, 0, W, H); R(ctx, '#aa9f8f', 0, 48, W, 6); R(ctx, '#aa9f8f', 0, 96, W, 6); R(ctx, '#aa9f8f', 0, 144, W, 6);
    ['adult', 'student', 'teen'].forEach((v, row) => {
      const y = 48 + row * 48, rim = { color: '#ffd9a8', a: 0.4, dir: 1 };
      hero(ctx, 16, y, { variant: v, mode: 'idle', phase: 0, t, facing: 1, blink: Math.floor(t) % 3 === 0, rim });
      for (let i = 0; i < 8; i++) hero(ctx, 40 + i * 20, y, { variant: v, mode: 'walk', phase: i / 8, t, facing: 1, rim });
      hero(ctx, 204, y - 6, { variant: v, mode: 'jump', phase: 0, t, facing: 1, rim });
      hero(ctx, 222, y, { variant: v, mode: 'walk', phase: (t * 1.6) % 1, t, facing: -1, rim });
    });
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}

/* ───────── start ───────── */
function boot() {
  // The logo is shown at a whole-number scale, so every pixel stays square.
  const lc = $('#logo');
  const fitLogo = () => {
    if (!lc) return;
    const avail = lc.parentElement.clientWidth - 40;
    let lg = logo('CAREER MODE', 3), k = Math.floor(avail / lg.width);
    if (k < 2) { lg = logo('CAREER MODE', 2); k = Math.max(1, Math.floor(avail / lg.width)); }
    lc.width = lg.width; lc.height = lg.height;
    lc.getContext('2d').drawImage(lg, 0, 0);
    lc.style.width = lg.width * Math.min(k, 2) + 'px';
  };
  fitLogo();
  window.addEventListener('resize', fitLogo);
  // Each speech card gets Suman's portrait, cut from his sprite in the outfit of that year, and a name tag.
  const PF = {};
  ['adult', 'teen', 'student'].forEach((v) => {
    const s = mk(50, 58), c = mk(26, 28);
    hero(s.x, 25, 51, { variant: v, mode: 'idle', phase: 0, t: 0, facing: 1, blink: false, rim: { color: '#ffd9a8', a: 0.35, dir: 1 } });
    c.x.drawImage(s.c, -12, -2);
    PF[v] = c.c.toDataURL();
  });
  beats.forEach((b) => {
    const say = b.el.querySelector('.say');
    if (!say) return;
    say.style.setProperty('--pf-img', `url(${PF[outfit(b.x)]})`);
    say.insertAdjacentHTML('afterbegin', `<span class="pf" aria-hidden="true"></span><span class="name" aria-hidden="true"><span>Suman · ${b.year}</span></span>`);
  });

  const f = mk(18, 23);
  migi(f.x, 9, 12, { t: 0, face: 'happy', facing: 1, holo: false });
  document.documentElement.style.setProperty('--migi-face', `url(${f.c.toDataURL()})`);

  if (new URLSearchParams(window.location.search).has('sheet')) { sheet(); return; }

  const chapters = [...new Set(beats.map((b) => b.ch))];
  chapters.forEach((ch) => {
    const li = document.createElement('li'), btn = document.createElement('button'), first = beats.find((b) => b.ch === ch);
    btn.type = 'button'; btn.textContent = ch;
    btn.setAttribute('aria-label', `Go to ${first.chName}`);
    btn.title = first.chName;
    btn.addEventListener('click', () => goTo(first.i));
    li.appendChild(btn); pipsEl.appendChild(li);
  });
  nextBtn.addEventListener('click', () => goTo(active === beats.length - 1 ? 0 : nextFor(active)));
  prevBtn.addEventListener('click', () => goTo(active - 1));
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    soundBtn.setAttribute('aria-label', soundOn ? 'Sound is on' : 'Sound is off');
    soundBtn.title = soundOn ? 'Sound is on' : 'Sound is off';
    beep(660, 0.08); beep(990, 0.12, 'square', 0.035, 0, 0.08);
  });

  // The reader's choice in the first beat ("A marketing hire", "An AI hire"...) comes from ui.js.
  window.addEventListener('cm:who', (e) => setRole(e.detail));

  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || document.querySelector('dialog[open]') || document.documentElement.classList.contains('plain')) return;
    const el = e.target instanceof Element ? e.target : null;
    if (el && el.closest('input, textarea, select, [contenteditable]')) return;
    const onControl = el && el.closest('button, a');
    if (e.code === 'ArrowRight' || e.code === 'KeyD') { keys.r = true; e.preventDefault(); }
    else if (e.code === 'ArrowLeft' || e.code === 'KeyA') { keys.l = true; e.preventDefault(); }
    else if ((e.code === 'Space' && !onControl) || e.code === 'ArrowUp' || e.code === 'KeyW') { jump(); e.preventDefault(); }
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.r = false;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.l = false;
  });
  window.addEventListener('blur', () => { keys.l = keys.r = false; });

  cv.addEventListener('click', (e) => {
    const b = cv.getBoundingClientRect(), mx = (e.clientX - b.left) / S, my = (e.clientY - b.top) / S;
    const wb0 = wrap.getBoundingClientRect(), cx = e.clientX - wb0.left, cy = e.clientY - wb0.top;
    if (Math.abs(mx - (M.x - camX)) < 11 && Math.abs(my - (Fs + M.y)) < 13) {
      showTip(`<b>MIGI says:</b>${QUIPS[quip++ % QUIPS.length]}`, cx, cy); M.talk = 1.6; beep(740, 0.06, 'triangle'); return;
    }
    const lx = mx + camX - cur.ox, ly = my - (Fs - 160);
    const h = cur.hot.find((o) => lx >= o.x && lx <= o.x + o.w && ly >= o.y && ly <= o.y + o.h);
    if (h) { showTip(`<b>MIGI points out:</b>${h.say}`, cx, cy); M.talk = 1.6; beep(740, 0.06, 'triangle'); if (h.jump) jump(); return; }
    jump();
  });

  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(wrap);
  resize();
  if (document.fonts) document.fonts.ready.then(resize);

  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    if (!document.hidden && !document.documentElement.classList.contains('plain')) { update(dt); frameDraw(); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  window.__cm = { P, M, beats, goTo, resize, logged, SKILLS, ALL_SKILLS, get role() { return role; }, get state() { return { S, W, H, active, variant, camX, coinsGot, RATIO, trackLen, level, scene: cur.id }; } };

  // The loading screen: it fills as the fonts and the first frames arrive, and never stays longer than it must.
  const root = document.documentElement, bootEl = $('#boot');
  if (root.classList.contains('booting') && bootEl) {
    const fill = $('#boot-fill'), msg = $('#boot-msg'), t0 = performance.now();
    const steps = ['Loading Kolkata, 2009…', 'Teaching MIGI the numbers…', 'Laying the road to Pune…', 'Ready.'];
    const set = (k) => { fill.style.width = [35, 62, 86, 100][k] + '%'; msg.textContent = steps[k]; };
    set(0);
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => { set(1); fitLogo(); resize(); });
    Promise.all([fontsReady, new Promise((r) => setTimeout(r, 650))]).then(() => {
      set(2);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        set(3);
        setTimeout(() => {
          bootEl.classList.add('is-out');
          try { sessionStorage.setItem('cm:booted', '1'); } catch (e) { /* private mode */ }
          setTimeout(() => root.classList.remove('booting'), 500);
        }, Math.max(250, 1300 - (performance.now() - t0)));
      }));
    });
  }
}

boot();
