/* Career Mode — Chapter 2: Pune, 2016 to 2018. The MBA, the agency that never opened,
   the rejection and the job offer. Also exports the Pune backdrop that later chapters reuse. */
import { mk, R, mix, disc, seg, text, textW, kf, clamp, ease } from './kit.js';
import { rng, DK, BLD, facade, win, tree, skyline, room, lamp, signboard } from './props.js';
import { ground, foreground, lcd, laptop, desk, person, shelf, plant, picture, autorick, scooter, cart, modern, hills } from './parts.js';

export const GLASS = { b: '#d9d2c4', l: '#f0ebe0', d: '#a8a091' };
export const STEEL = { b: '#8794ad', l: '#aab6cc', d: '#5f6b84' };

// The flame tree: Pune's campuses are full of them.
export function gulmohar(x, X, B, s, r) {
  tree(x, X, B, s, r);
  for (let i = 0; i < s * 1.6; i++) R(x, r() < 0.5 ? '#e43b44' : '#ff7a3a', X + (r() - 0.5) * s * 1.1, B - s * 0.95 - r() * s * 0.45, 1 + (r() < 0.3), 1);
}

// Hills, towers and cranes: the skyline behind every Pune scene.
export function puneBackdrop(seed) {
  const r = rng(seed);
  const far = mk(1300, 140);
  hills(far.x, far.w, 140, r, '#6f8fb4', 34, 66, 26);
  [[240, 60], [780, 56]].forEach(([fx, fy]) => { R(far.x, '#587aa0', fx, 140 - fy - 6, 34, 6); for (let i = 0; i < 34; i += 4) R(far.x, '#587aa0', fx + i, 140 - fy - 8, 2, 2); R(far.x, '#587aa0', fx + 14, 140 - fy - 12, 6, 6); });
  [150, 420, 468, 930, 1010].forEach((tx) => { const ty = 140 - 60 - r() * 10; R(far.x, '#e8eef6', tx, ty - 16, 1, 16); [[-6, -3], [6, -2], [0, 7]].forEach(([dx, dy]) => seg(far.x, '#e8eef6', tx, ty - 16, tx + dx, ty - 16 + dy, 1)); });
  hills(far.x, far.w, 140, r, '#55789a', 16, 42, 20);

  const mid = mk(1500, 160), mx = mid.x;
  for (let X = -8; X < mid.w;) {
    const w = 22 + Math.floor(r() * 26), h = 46 + Math.floor(r() * 84);
    if (r() < 0.45) modern(mx, X, 160, w, h, STEEL, r, 0);
    else {
      const p = [GLASS, BLD.cream, BLD.grey, BLD.mint][Math.floor(r() * 4)];
      facade(mx, X, 160, w, h, p, r);
      for (let y = 160 - h + 5; y < 152; y += 8) for (let wx = X + 3; wx < X + w - 4; wx += 6) win(mx, wx, y, 3, 4, r() < 0.14 ? 'lit' : 'gl');
    }
    if (r() < 0.16) { const cx0 = X + (w >> 1), top = 160 - h - 34; R(mx, '#d99a22', cx0, top, 2, 36); R(mx, '#d99a22', cx0 - 10, top, 44, 2); seg(mx, '#d99a22', cx0, top - 8, cx0 + 34, top, 1); seg(mx, '#d99a22', cx0, top - 8, cx0 - 10, top, 1); R(mx, '#5a6988', cx0 + 28, top + 2, 1, 12); R(mx, '#5a6988', cx0 - 9, top + 2, 6, 5); }
    X += w + (r() < 0.3 ? 4 + Math.floor(r() * 8) : 0);
  }

  const back = mk(1900, 172), bx = back.x;
  skyline(bx, back.w, 172, r, { w: [36, 72], h: [38, 84], win: [4, 6], pals: [BLD.cream, BLD.grey, BLD.mint, BLD.rose, GLASS], big: true });
  for (let X = 30; X < back.w; X += 90 + Math.floor(r() * 120)) (r() < 0.55 ? gulmohar : tree)(bx, X, 172, 26 + Math.floor(r() * 14), r);

  return [
    { c: far.c, f: 0.08, haze: 0.5, sink: 0, pad: 0 },
    { c: mid.c, f: 0.26, haze: 0.42, sink: -6, pad: 10 },
    { c: back.c, f: 0.52, haze: 0.2, sink: 0, pad: 20 },
  ];
}

const DAY = ['#2b78d2', '#5fb0ef', '#a3dbf5', '#e6f5ee'];
const WARM = ['#3a7fd0', '#79b6ea', '#c9dff0', '#f5ecd8'];
const RAIN = ['#394560', '#55627f', '#8490a8', '#aab4c4'];
const GOLD = ['#3b4a9a', '#c9739a', '#f7a25a', '#ffe08a'];

export function pune() {
  const r = rng(2016), PX0 = -340, LH = 180, B = 134, F = 160;
  const play = mk(2550, LH), x = play.x, c = (wx) => wx - PX0;
  const lights = [], hot = [];

  [-262, -150, 618, 1062, 1150, 1250, 1380].forEach((wx, i) => gulmohar(x, c(wx), B, 30 + (i % 3) * 6, r));

  // Compound wall and the way in.
  R(x, '#d9d2c4', c(-340), B - 20, 430, 20); R(x, '#f0ebe0', c(-340), B - 20, 430, 1); R(x, '#a8a091', c(-340), B - 3, 430, 3);
  for (let wx = -340; wx < 90; wx += 6) R(x, DK, c(wx), B - 27, 1, 7);
  R(x, DK, c(-340), B - 27, 430, 1);
  cart(x, c(40), B, 'VADA PAV');
  lights.push({ x: 61, y: B - 22, g: 'warmS' });
  hot.push({ x: 40, y: B - 40, w: 44, h: 40, say: 'Vada pav: a spiced potato fritter in a soft bun. It is what students in Pune run on.' });

  // Gate.
  [96, 142].forEach((wx) => { R(x, '#b8ae9c', c(wx), B - 44, 9, 44); R(x, '#d6ccba', c(wx), B - 44, 9, 1); R(x, '#8f8676', c(wx), B - 44, 2, 44); R(x, '#d6ccba', c(wx) - 1, B - 46, 11, 2); });
  R(x, DK, c(92), B - 60, 63, 15); R(x, '#1d2552', c(93), B - 59, 61, 13); R(x, '#35488f', c(93), B - 59, 61, 1);
  text(x, 'PIBM', c(112), B - 56, '#f4f4f4');
  for (let wx = 106; wx < 142; wx += 4) R(x, '#3a4466', c(wx), B - 36, 1, 36);
  R(x, '#3a4466', c(105), B - 36, 37, 1); R(x, '#3a4466', c(105), B - 18, 37, 1);
  const l0 = lamp(x, c(160), B, 60); lights.push({ x: l0.x + PX0, y: l0.y, g: 'warm' });

  // Notice board: the three specialisations.
  const nb = { x: 176, y: B - 50 };
  R(x, '#6a4320', c(184), B - 14, 2, 14); R(x, '#6a4320', c(226), B - 14, 2, 14);
  R(x, '#6a4320', c(nb.x), nb.y, 64, 38); R(x, '#2f6b4f', c(nb.x) + 2, nb.y + 2, 60, 34);
  ['FINANCE', 'HR', 'MARKETING'].forEach((s, i) => { R(x, '#f5eac8', c(nb.x) + 4, nb.y + 4 + i * 11, 56, 9); text(x, s, c(nb.x) + 6, nb.y + 5 + i * 11, '#262b44'); R(x, '#e43b44', c(nb.x) + 57, nb.y + 4 + i * 11, 2, 2); });

  // Main building.
  {
    const X = c(250), w = 160, h = 104;
    modern(x, X, B, w, h, GLASS, r, 44);
    signboard(x, 'BUSINESS SCHOOL', X + 80, B - 46, '#1d2552', '#f4f4f4');
    R(x, DK, X + 60, B - 32, 40, 32); R(x, '#4f79a8', X + 61, B - 31, 18, 31); R(x, '#4f79a8', X + 81, B - 31, 18, 31);
    R(x, '#7fa6cc', X + 63, B - 29, 3, 12); R(x, '#7fa6cc', X + 83, B - 29, 3, 12); R(x, '#ffcd75', X + 78, B - 16, 1, 3); R(x, '#ffcd75', X + 82, B - 16, 1, 3);
    R(x, '#a8a091', X + 54, B - 35, 52, 3); R(x, '#f0ebe0', X + 54, B - 36, 52, 1);
    [10, 34, 114, 138].forEach((o) => win(x, X + o, B - 28, 11, 16, 'gl'));
    plant(x, X + 48, B, 1); plant(x, X + 108, B, 1);
    R(x, '#8b9bb4', X + 20, B - h - 24, 1, 24); R(x, '#ff9933', X + 21, B - h - 24, 9, 2); R(x, '#f4f4f4', X + 21, B - h - 22, 9, 2); R(x, '#138808', X + 21, B - h - 20, 9, 2); R(x, '#1d2552', X + 25, B - h - 22, 1, 2);
  }
  scooter(x, c(228), B, '#ef7d57');

  // Computer lab: where IllusionFX was built.
  const st = {};
  {
    const X = c(420), w = 184, h = 84, rx = X + 26, ry = B - 42, rw = 110, rh = 38;
    facade(x, X, B, w, h, BLD.grey, r);
    signboard(x, 'COMPUTER LAB', X + 81, B - 58, '#262b44', '#73eff7');
    [8, 150].forEach((o) => win(x, X + o, B - 30, 11, 16, 'gl'));
    [10, 44, 78, 112, 150].forEach((o) => win(x, X + o, B - 78, 9, 11, o === 78 ? 'lit' : 'gl'));
    room(x, rx, ry, rw, rh, '#4a5f86', '#56627a');
    R(x, '#f4f4f4', rx + 6, ry + 5, 24, 13); R(x, '#8b9bb4', rx + 6, ry + 5, 24, 1); seg(x, '#3b5dc9', rx + 9, ry + 14, rx + 15, ry + 9, 1); seg(x, '#e43b44', rx + 15, ry + 9, rx + 26, ry + 12, 1);
    R(x, '#e8edf4', rx + 84, ry + 4, 18, 6); R(x, '#8b9bb4', rx + 85, ry + 8, 16, 1);
    [36, 58].forEach((o, i) => { desk(x, rx + o, ry + 24, 18, '#7a8296'); lcd(x, rx + o + 3, ry + 13, i ? '#41a6f6' : '#3b5dc9'); person(x, rx + o + 6, ry + 15, { h: i ? '#3a2f2a' : '#262b44', c: i ? '#b13e53' : '#38b764', f: -1, t: 9 }); });
    desk(x, rx + 8, ry + 24, 22, '#7a8296');
    const lp = laptop(x, rx + 12, ry + 15);
    R(x, '#c9a0ff', lp.x + 1, lp.y + 1, 4, 2); R(x, '#73eff7', lp.x + 6, lp.y + 1, 3, 2); R(x, '#566c86', lp.x + 1, lp.y + 4, 8, 1);
    R(x, '#1c1b22', rx + 84, ry + 14, 18, 20); for (let j = 0; j < 4; j++) R(x, '#33313d', rx + 86, ry + 16 + j * 5, 14, 3);
    st.lab = { bar: { x: lp.x + PX0 + 1, y: lp.y + 4 }, rack: { x: rx + 87 + PX0, y: ry + 17 } };
    lights.push({ x: lp.x + PX0 + 5, y: lp.y + 3, g: 'cool', always: 1, flicker: 13 });
    hot.push({ x: 446, y: ry, w: 34, h: rh, say: 'A laptop with 4 GB of memory. Every few seconds of animation took minutes to render.' });
  }
  scooter(x, c(612), B, '#a7f070');
  const l1 = lamp(x, c(626), B, 60); lights.push({ x: l1.x + PX0, y: l1.y, g: 'warm' });

  // Placement block: the group discussion.
  {
    const X = c(640), w = 160, h = 92, rx = X + 24, ry = B - 42, rw = 96, rh = 38;
    facade(x, X, B, w, h, BLD.cream, r);
    signboard(x, 'CAMPUS PLACEMENTS', X + 80, B - 58, '#7a2a3c', '#ffe08a');
    [12, 46, 100, 134].forEach((o, i) => win(x, X + o, B - 84, 9, 12, i === 1 ? 'lit' : 'gl'));
    room(x, rx, ry, rw, rh, '#7a6a55', '#5a4a3a');
    R(x, '#f4f4f4', rx + 6, ry + 5, 22, 12); R(x, '#8b9bb4', rx + 8, ry + 8, 14, 1); R(x, '#8b9bb4', rx + 8, ry + 11, 10, 1); R(x, '#8b9bb4', rx + 8, ry + 14, 16, 1);
    [[34, '#3b5dc9', '#262b44'], [46, '#b13e53', '#3a2f2a'], [58, '#38b764', '#262b44'], [70, '#ef7d57', '#5a4632']].forEach(([o, col, hair], i) => person(x, rx + o, ry + 12, { c: col, h: hair, f: i < 2 ? 1 : -1, t: 9 }));
    for (let i = 0; i < 5; i++) R(x, '#6a4320', rx + 30 + i, ry + 23 + (i < 2 ? 2 - i : 0), 1, 1);
    R(x, '#8b5a2b', rx + 30, ry + 24, 50, 4); R(x, '#a9743c', rx + 31, ry + 24, 48, 1); R(x, '#6a4320', rx + 54, ry + 28, 3, 6);
    R(x, '#3a4466', rx + 84, ry + 20, 6, 8); R(x, '#262b44', rx + 86, ry + 28, 1, 6);          // the empty chair
    R(x, DK, X + 128, B - 28, 16, 28); R(x, '#6a4320', X + 129, B - 27, 14, 27); R(x, '#ffcd75', X + 140, B - 14, 1, 2);
    text(x, '2', X + 134, B - 24, '#f5eac8');
  }
  scooter(x, c(812), B, '#f6757a');

  // Admin block: the director's office.
  {
    const X = c(840), w = 170, h = 98, rx = X + 26, ry = B - 42, rw = 90, rh = 38;
    facade(x, X, B, w, h, BLD.rose, r);
    signboard(x, 'DIRECTOR', X + 71, B - 58, '#1f4636', '#f5eac8');
    [10, 44, 78, 112, 146].forEach((o, i) => win(x, X + o, B - 90, 9, 13, i === 3 ? 'lit' : 'gl'));
    R(x, BLD.rose.d, X, B - 64, w, 2); R(x, BLD.rose.l, X, B - 65, w, 1);
    room(x, rx, ry, rw, rh, '#6a4a3a', '#4a3528');
    picture(x, rx + 6, ry + 6, 9, 7, '#f5eac8'); picture(x, rx + 18, ry + 6, 9, 7, '#f5eac8'); picture(x, rx + 30, ry + 5, 11, 9, '#3b5dc9');
    shelf(x, rx + 66, ry + 5, 20, 29);
    person(x, rx + 44, ry + 11, { h: '#c0cbdc', c: '#262b44', g: 1, f: -1, t: 10 });
    R(x, '#3a2f2a', rx + 42, ry + 9, 12, 4);
    desk(x, rx + 22, ry + 24, 40, '#8b5a2b'); R(x, '#6a4320', rx + 23, ry + 26, 38, 8);
    R(x, '#f4f4f4', rx + 46, ry + 22, 7, 2); R(x, '#ffcd75', rx + 55, ry + 21, 2, 3);
    plant(x, rx + 8, ry + 34, 1);
    st.office = { phone: { x: rx + 27 + PX0, y: ry + 21 } };
    R(x, DK, X + 132, B - 28, 16, 28); R(x, '#6a4320', X + 133, B - 27, 14, 27); R(x, '#ffcd75', X + 135, B - 14, 1, 2);
  }
  const l2 = lamp(x, c(1028), B, 60); lights.push({ x: l2.x + PX0, y: l2.y, g: 'warm' });

  // The way out.
  for (let wx = 1020; wx < 2200; wx += 12) R(x, '#243a4a', c(wx), B - 10, 2, 10);
  R(x, '#243a4a', c(1020), B - 10, 1180, 1); R(x, '#3c5a6e', c(1020), B - 11, 1180, 1); R(x, '#243a4a', c(1020), B - 5, 1180, 1);
  {
    const X = c(1086);
    R(x, '#5a6988', X + 36, B - 48, 2, 48); R(x, '#8b9bb4', X + 37, B - 48, 1, 48);
    R(x, '#f4f4f4', X - 1, B - 63, 76, 17); R(x, '#2f6b4f', X, B - 62, 74, 15); R(x, '#4d9c6c', X, B - 62, 74, 1);
    text(x, 'FIRST JOB >', X + 5, B - 58, '#f4f4f4');
  }

  { // A Puneri pati: Pune's famously blunt notice boards.
    const X = c(1196);
    R(x, '#4a2f18', X + 4, B - 22, 2, 22); R(x, '#4a2f18', X + 70, B - 22, 2, 22);
    R(x, DK, X - 1, B - 43, 78, 23); R(x, '#f5eac8', X, B - 42, 76, 21); R(x, '#e3d1a5', X, B - 23, 76, 2);
    text(x, 'NO PARKING.', X + 5, B - 40, '#b13e53'); text(x, 'NOT EVEN YOU.', X + 2, B - 31, '#262b44');
    hot.push({ x: 1196, y: B - 43, w: 76, h: 43, say: 'A Puneri pati. Pune is famous for notice boards this blunt, and nobody takes them personally.' });
  }
  ground(x, play.w, B, LH, r, 'city');
  autorick(x, c(-6), B + 17);
  hot.push({ x: -6, y: B - 8, w: 36, h: 26, say: 'The black and yellow autorickshaw: three wheels, and the quickest way across any Indian city.' });

  let clear = 0;
  return {
    id: 'pune', len: 1150, title: 'CHAPTER 2 - PUNE - 2016',
    layers: puneBackdrop(2016), play: { c: play.c, x0: PX0, F, B }, fg: { c: foreground(2600, 16), f: 1.32 },
    lights, hot, perches: [], steam: [{ x: 52, y: B - 20 }],
    coins: [[110, 14], [262, 14], [330, 54], [620, 14], [826, 54], [1060, 14]],
    u: (lx) => clamp(lx / 1100, 0, 1),
    tick(dt, beat, bt) { const want = beat === 'hired' && bt > 2.2 ? 1 : 0; clear += (want - clear) * Math.min(1, dt * (want ? 1.1 : 4)); },
    // A bright day that clouds over at the rejection, then breaks into gold at the job offer.
    mood(u) {
      const q = Math.round(u * 60) / 60, k = Math.round(ease(clear) * 30) / 30;
      const base = [[0, 0], [0.5, 1], [0.57, 2], [0.86, 2], [0.94, 3], [1, 3]], set = [DAY, WARM, RAIN, GOLD];
      const sky = [0, 1, 2, 3].map((i) => mix(kf(base.map(([a, s]) => [a, set[s][i]]), q), GOLD[i], k));
      const rain = kf([[0.5, 0], [0.58, 1], [0.86, 1], [0.92, 0]], u) * (1 - clear);
      const gold = Math.max(kf([[0.86, 0], [0.95, 1]], u), clear);
      return {
        sky, amb: rain > gold ? ['#27345a', 0.34 * rain] : ['#ff9648', 0.15 * gold], lamp: Math.max(0.7 * rain, 0.5 * gold), stars: 0, pink: gold, grey: rain,
        sun: kf([[0, 0.95], [0.5, 0.7], [0.86, 0.3], [1, 0.12]], u) * (1 - 0.6 * clear), sunA: (0.4 + 0.55 * gold) * (1 - rain), rain, glit: 0,
        rim: gold > 0.2 ? ['#ffc070', 0.4 * gold] : ['#ffffff', 0.14],
      };
    },
    live({ x: g, sx, py, t, beat, bt }) {
      // The laptop renders, a few seconds at a time.
      R(g, '#a7f070', sx(st.lab.bar.x), py + st.lab.bar.y, 1 + Math.floor((t * 0.6) % 8), 1);
      for (let j = 0; j < 4; j++) R(g, Math.sin(t * (7 + j * 3) + j) > 0 ? '#a7f070' : '#1f4636', sx(st.lab.rack.x) + (j % 2) * 9, py + st.lab.rack.y + j * 5, 1, 1);
      // Two options are crossed off the notice board, and one is left.
      if (beat === 'elim') {
        const bxs = sx(nb.x);
        if (bt > 0.5) R(g, '#e43b44', bxs + 5, py + nb.y + 8, Math.min(46, (bt - 0.5) * 160), 1);
        if (bt > 1.1) R(g, '#e43b44', bxs + 5, py + nb.y + 19, Math.min(16, (bt - 1.1) * 80), 1);
        if (bt > 1.7) { const on = Math.floor(t * 4) % 2 || bt > 3; R(g, on ? '#a7f070' : '#4d9c6c', bxs + 3, py + nb.y + 25, 58, 1); R(g, on ? '#a7f070' : '#4d9c6c', bxs + 3, py + nb.y + 35, 58, 1); R(g, '#a7f070', bxs + 3, py + nb.y + 25, 1, 11); R(g, '#a7f070', bxs + 60, py + nb.y + 25, 1, 11); }
      }
      // The director's phone rings.
      const ph = st.office.phone, ring = beat === 'hired' && bt > 0.3 && bt < 2 && Math.floor(t * 10) % 2;
      R(g, '#262b44', sx(ph.x) + (ring ? 1 : 0), py + ph.y, 7, 3); R(g, '#3a4466', sx(ph.x) + (ring ? 0 : 1), py + ph.y - 1, 7, 1);
      if (ring) { R(g, '#ffcd75', sx(ph.x) - 2, py + ph.y - 3, 1, 1); R(g, '#ffcd75', sx(ph.x) + 9, py + ph.y - 3, 1, 1); R(g, '#ffcd75', sx(ph.x) + 3, py + ph.y - 5, 1, 1); }
    },
    stations: {
      // Billboards stand on the roofs (bot is the roof line), two lines at most.
      elim: { x: 352, bot: B - 105, items: [{ at: 2.1, s: 'MBA IN MARKETING', col: '#a7f070' }, { at: 2.6, s: '2016 TO 2018', col: '#f4f4f4' }] },
      agency: { x: 512, bot: B - 85, items: [{ at: 0.3, s: 'ILLUSIONFX', sc: 2, col: '#c9a0ff' }, { at: 0.9, s: 'ARTIFICIALLY REAL', col: '#73eff7' }] },
      cut: { x: 720, bot: B - 93, items: [{ at: 0.4, s: 'WRITTEN ROUND: CLEARED', col: '#a7f070' }, { at: 1.5, s: 'GROUP DISCUSSION: CUT', col: '#f6757a' }] },
      hired: { x: 925, bot: B - 99, items: [{ at: 0.6, s: 'PORTFOLIO ON THE TABLE', col: '#ffcd75' }, { at: 2.2, s: 'HIRED ON THE SPOT', sc: 2, col: '#a7f070' }] },
    },
    obstacles: [{ x: 792, kind: 'slip', h: 12, say: 'The rejection slip from the group discussion, November 2017. Jump it: he did.' }],
  };
}
