/* Career Mode — Chapter 4: the marketing floor at PIBM, 2019 to today,
   and Chapter 6: the rooftop at sunrise, where the story ends and the ask begins. */
import { mk, R, mix, disc, seg, text, textW, kf, clamp } from './kit.js';
import { rng, DK, BLD, facade, win, tree, room, lamp, signboard } from './props.js';
import { ground, foreground, lcd, laptop, desk, person, shelf, plant, picture, scooter, modern } from './parts.js';
import { puneBackdrop, gulmohar, GLASS, STEEL } from './pune.js';

const DAWN = ['#1f2452', '#5b3f87', '#e2766a', '#ffd28a'];
const DAY = ['#2b78d2', '#5fb0ef', '#a3dbf5', '#e6f5ee'];
const WARM = ['#3a7fd0', '#79b6ea', '#c9dff0', '#f5ecd8'];
const GOLD = ['#3b4a9a', '#c9739a', '#f7a25a', '#ffe08a'];
const DUSK = ['#231f5c', '#6a3f8a', '#d9686a', '#ffb878'];
const NIGHT = ['#0d0f2c', '#181a46', '#2a2d66', '#40458a'];

export function floor() {
  const r = rng(2019), PX0 = -340, LH = 180, B = 134, F = 160;
  const play = mk(2920, LH), x = play.x, c = (wx) => wx - PX0, lights = [], hot = [], live = {};
  [-280, -170, -60, 296, 506, 716, 926, 1136, 1346, 1560, 1680].forEach((wx, i) => gulmohar(x, c(wx), B, 26 + (i % 3) * 6, r));
  R(x, '#d9d2c4', c(-340), B - 20, 360, 20); R(x, '#f0ebe0', c(-340), B - 20, 360, 1); R(x, '#a8a091', c(-340), B - 3, 360, 3);
  [26, 72].forEach((wx) => { R(x, '#b8ae9c', c(wx), B - 44, 9, 44); R(x, '#d6ccba', c(wx), B - 44, 9, 1); R(x, '#8f8676', c(wx), B - 44, 2, 44); });
  R(x, DK, c(22), B - 60, 63, 15); R(x, '#1d2552', c(23), B - 59, 61, 13); text(x, 'PIBM', c(42), B - 56, '#f4f4f4');

  // One wing of rooms. Each call draws a block, its sign and an open room, and returns the room's corner.
  const wing = (wx, w, h, pal, sign, wall, glass) => {
    const X = c(wx), rx = X + 22, ry = B - 42, rw = w - 44;
    (glass ? modern : facade)(x, X, B, w, h, pal, r, 46);
    if (!glass) for (let o = 12; o < w - 14; o += 26) win(x, X + o, B - h + 8, 9, 12, r() < 0.3 ? 'lit' : 'gl');
    signboard(x, sign, X + w / 2, B - 58, '#1d2552', '#f4f4f4');
    room(x, rx, ry, rw, 38, wall, '#56627a');
    return [rx, ry, rw];
  };

  { // Head office: his desk, and the boardroom upstairs.
    const [rx, ry] = wing(108, 184, 112, GLASS, 'BRAND MARKETING', '#3f5878', true);
    // The boardroom: one lit room set into the top band of glass, so the facade stays whole.
    { const bx = rx + 30, by = B - 105, bw = 64, bh = 10;
      R(x, DK, bx - 1, by - 1, bw + 2, bh + 2); R(x, '#ffe9a8', bx, by, bw, bh); R(x, '#fff6d6', bx, by, bw, 1); R(x, '#e8c98a', bx, by + bh - 2, bw, 2);
      [12, 26, 40, 52].forEach((o, i) => { R(x, i % 2 ? '#3a2f2a' : '#262b44', bx + o, by + 2, 3, 3); R(x, i % 2 ? '#3a2f2a' : '#262b44', bx + o - 1, by + 5, 5, 3); });
      R(x, '#8b5a2b', bx + 8, by + 7, 48, 2); R(x, '#a9743c', bx + 8, by + 7, 48, 1); }
    desk(x, rx + 8, ry + 24, 42, '#8b5a2b'); lcd(x, rx + 12, ry + 13, '#3b5dc9'); laptop(x, rx + 30, ry + 15);
    picture(x, rx + 60, ry + 6, 14, 10, '#ef7d57'); picture(x, rx + 78, ry + 6, 14, 10, '#41a6f6'); picture(x, rx + 96, ry + 6, 14, 10, '#ffcd75');
    shelf(x, rx + 112, ry + 5, 22, 29); plant(x, rx + 56, ry + 34, 1);
    hot.push({ x: 108 + 52, y: B - 109, w: 66, h: 14, say: 'The boardroom. For eight years he has reported to the Chairman and to the CEO almost every working day.' });
  }
  { // The team: design, web and digital.
    const [rx, ry, rw] = wing(308, 190, 92, BLD.cream, 'DESIGN - WEB - DIGITAL', '#4a5f86');
    const cols = ['#ef7d57', '#41a6f6', '#38b764', '#b13e53', '#ffcd75', '#c9a0ff', '#73eff7', '#f6757a', '#a7f070'];
    for (let i = 0; i < 7; i++) { const dx = rx + 4 + i * 20; desk(x, dx, ry + 24, 17, '#7a8296'); lcd(x, dx + 2, ry + 13, ['#3b5dc9', '#b13e53', '#38b764'][i % 3]); person(x, dx + 9, ry + 16, { c: cols[i], h: i % 2 ? '#3a2f2a' : '#262b44', f: -1, t: 8 }); }
    for (let i = 0; i < 7; i++) person(x, rx + 10 + i * 19, ry + 5, { c: cols[(i + 4) % 9], h: i % 3 ? '#262b44' : '#5a4632', f: i % 2 ? 1 : -1, t: 5 });
  }
  { // Web: fifty sites on one wall.
    const [rx, ry, rw] = wing(518, 190, 88, STEEL, 'WEB STUDIO', '#2c3350', true);
    live.web = [];
    for (let j = 0; j < 2; j++) for (let i = 0; i < 8; i++) { const sx0 = rx + 6 + i * 13, sy0 = ry + 5 + j * 10; R(x, '#181425', sx0, sy0, 11, 8); R(x, ['#3b5dc9', '#38b764', '#b13e53', '#ef7d57'][(i + j) % 4], sx0 + 1, sy0 + 1, 9, 2); R(x, '#e8edf4', sx0 + 1, sy0 + 3, 9, 4); R(x, '#8b9bb4', sx0 + 2, sy0 + 4, 5, 1); live.web.push({ x: sx0 + PX0 + 2, y: sy0 + 5 }); }
    desk(x, rx + 8, ry + 27, 70, '#7a8296'); person(x, rx + 20, ry + 19, { c: '#41a6f6', t: 8 }); person(x, rx + 50, ry + 19, { c: '#a7f070', h: '#3a2f2a', t: 8 });
    R(x, '#1c1b22', rx + 116, ry + 6, 22, 28); for (let j = 0; j < 5; j++) R(x, '#33313d', rx + 118, ry + 8 + j * 5, 18, 3);
    live.rack = { x: rx + 119 + PX0, y: ry + 9 };
    lights.push({ x: 518 + 22 + 56, y: ry + 12, g: 'cool', always: 1, flicker: 9 });
  }
  { // Print: where a typo costs lakhs.
    const [rx, ry, rw] = wing(728, 190, 84, BLD.rose, 'PRINT ROOM', '#5a4a44');
    R(x, '#8b93a8', rx + 8, ry + 14, 46, 20); R(x, '#aeb6c8', rx + 8, ry + 14, 46, 1); R(x, '#626a80', rx + 8, ry + 30, 46, 4);
    R(x, '#262b44', rx + 12, ry + 18, 16, 8); [0, 1, 2, 3].forEach((i) => R(x, ['#41a6f6', '#f6757a', '#ffcd3a', '#181425'][i], rx + 32 + i * 5, ry + 18, 4, 4));
    R(x, '#f4f4f4', rx + 54, ry + 22, 10, 2); live.press = { x: rx + 54 + PX0, y: ry + 22 };
    for (let i = 0; i < 8; i++) R(x, i % 2 ? '#f4f4f4' : '#d8d0c0', rx + 68, ry + 33 - i, 18, 1);
    for (let i = 0; i < 5; i++) R(x, i % 2 ? '#f4f4f4' : '#d8d0c0', rx + 90, ry + 33 - i, 14, 1);
    [['#ef7d57', 70], ['#3b5dc9', 86], ['#38b764', 102], ['#ffcd75', 118]].forEach(([col, o]) => { R(x, '#f4f4f4', rx + o, ry + 5, 13, 16); R(x, col, rx + o + 1, ry + 6, 11, 8); R(x, '#8b9bb4', rx + o + 2, ry + 16, 8, 1); });
    person(x, rx + 112, ry + 20, { c: '#262b44', t: 9, f: -1 });
    // A hoarding on the roof.
    const hx = c(728) + 40, hy = B - 84 - 40;
    R(x, '#5a6988', hx + 12, hy + 26, 2, 14); R(x, '#5a6988', hx + 94, hy + 26, 2, 14);
    R(x, DK, hx - 1, hy - 1, 110, 28); R(x, '#1d2552', hx, hy, 108, 26); R(x, '#ef7d57', hx, hy, 30, 26); disc(x, '#ffcd75', hx + 15, hy + 13, 8);
    text(x, 'ADMISSIONS', hx + 36, hy + 4, '#f4f4f4'); text(x, 'OPEN', hx + 36, hy + 14, '#ffcd75');
    hot.push({ x: 768, y: hy, w: 108, h: 26, say: 'A tri-vision hoarding: three faces on turning slats. Print does not take hotfixes, so he proofs these himself.' });
    // Its three faces. The hoarding turns to the numbers while the print beat is on screen.
    const face = (draw) => { const f = mk(108, 26); draw(f.x); return f.c; };
    live.faces = [
      face((g) => { R(g, '#1d2552', 0, 0, 108, 26); R(g, '#ef7d57', 0, 0, 30, 26); disc(g, '#ffcd75', 15, 13, 8); text(g, 'ADMISSIONS', 36, 4, '#f4f4f4'); text(g, 'OPEN', 36, 14, '#ffcd75'); }),
      face((g) => { R(g, '#181425', 0, 0, 108, 26); R(g, '#ffcd75', 0, 0, 2, 26); text(g, '1,000+', 6, 2, '#ffcd75', 2); text(g, 'PIECES SIGNED OFF', 4, 18, '#f4f4f4'); }),
      face((g) => { R(g, '#181425', 0, 0, 108, 26); R(g, '#a7f070', 0, 0, 2, 26); text(g, 'RS 30-40', 6, 2, '#a7f070', 2); text(g, 'LAKH A YEAR', 6, 18, '#f4f4f4'); }),
    ];
    live.hoard = { x: 768, y: hy };
  }
  { // Launches.
    const [rx, ry, rw] = wing(938, 190, 96, GLASS, 'LAUNCH ROOM', '#3a4a5e', true);
    R(x, '#181425', rx + 6, ry + 5, 46, 22); R(x, '#16213a', rx + 7, ry + 6, 44, 20);
    live.chart = { x: rx + 10 + PX0, y: ry + 24 };
    R(x, '#f4f4f4', rx + 58, ry + 5, 30, 20); seg(x, '#3b5dc9', rx + 62, ry + 8, rx + 84, ry + 8, 1); seg(x, '#3b5dc9', rx + 66, ry + 13, rx + 80, ry + 13, 1); seg(x, '#e43b44', rx + 70, ry + 18, rx + 76, ry + 18, 1); seg(x, '#8b9bb4', rx + 62, ry + 8, rx + 70, ry + 18, 1); seg(x, '#8b9bb4', rx + 84, ry + 8, rx + 76, ry + 18, 1);
    R(x, '#f4f4f4', rx + 96, ry + 5, 16, 22); R(x, '#27324f', rx + 97, ry + 6, 14, 20); seg(x, '#f4f4f4', rx + 104, ry + 9, rx + 104, ry + 19, 3); R(x, '#e43b44', rx + 103, ry + 8, 3, 2); R(x, '#ffcd75', rx + 103, ry + 20, 3, 3);
    desk(x, rx + 20, ry + 28, 80, '#8b5a2b'); person(x, rx + 30, ry + 20, { c: '#ef7d57', t: 8 }); person(x, rx + 58, ry + 20, { c: '#3b5dc9', h: '#3a2f2a', t: 8, f: -1 }); person(x, rx + 84, ry + 20, { c: '#38b764', t: 8, f: -1 });
    lights.push({ x: 938 + 22 + 28, y: ry + 16, g: 'cool', always: 1, flicker: 7 });
  }
  { // Decks and events.
    const [rx, ry, rw] = wing(1148, 190, 88, BLD.blue, 'AUDITORIUM', '#3a2f44');
    R(x, '#f4f4f4', rx + 8, ry + 4, 54, 24); R(x, '#1d2552', rx + 9, ry + 5, 52, 5); R(x, '#8b9bb4', rx + 12, ry + 13, 30, 1); R(x, '#8b9bb4', rx + 12, ry + 17, 38, 1); R(x, '#8b9bb4', rx + 12, ry + 21, 24, 1); R(x, '#ef7d57', rx + 46, ry + 19, 12, 7);
    R(x, '#6a4320', rx + 68, ry + 22, 8, 12); R(x, '#8b5a2b', rx + 67, ry + 21, 10, 2); person(x, rx + 69, ry + 11, { c: '#2b3a78', h: '#262b44', t: 11, f: 1 });
    for (let j = 0; j < 2; j++) for (let i = 0; i < 6; i++) { const px0 = rx + 86 + i * 10 - j * 3, py0 = ry + 20 + j * 6; R(x, ['#262b44', '#3a2f2a', '#5a4632'][(i + j) % 3], px0, py0, 5, 4); R(x, '#7a2a3c', px0 - 1, py0 + 4, 7, 5); }
    R(x, '#b13e53', rx, ry, 6, 34); R(x, '#7a2a3c', rx + 5, ry, 1, 34);
  }
  { // The corner where the automation started, and the stairs down.
    const [rx, ry, rw] = wing(1358, 150, 78, BLD.grey, 'AI CORNER', '#1e2440');
    desk(x, rx + 6, ry + 24, 44, '#3a4466'); lcd(x, rx + 9, ry + 13, '#16213a'); lcd(x, rx + 25, ry + 13, '#16213a');
    live.ai = [{ x: rx + 10 + PX0, y: ry + 14 }, { x: rx + 26 + PX0, y: ry + 14 }];
    person(x, rx + 44, ry + 16, { c: '#2b3a78', h: '#262b44', t: 9, f: -1 });
    R(x, '#0b0a18', rx + 66, ry + 6, 34, 28); for (let i = 0; i < 6; i++) { R(x, '#3a3560', rx + 66 + i * 5, ry + 30 - i * 4, 34 - i * 5, 4); R(x, '#544e84', rx + 66 + i * 5, ry + 30 - i * 4, 34 - i * 5, 1); }
    R(x, '#73eff7', rx + 68, ry + 8, 1, 1); R(x, '#73eff7', rx + 74, ry + 12, 1, 1);
    lights.push({ x: 1358 + 22 + 82, y: ry + 22, g: 'cyan', always: 1, flicker: 5 }, { x: 1358 + 22 + 20, y: ry + 16, g: 'cool', always: 1, flicker: 11 });
    hot.push({ x: 1358 + 22 + 66, y: ry + 6, w: 34, h: 28, say: 'Stairs going down. Everything he built with AI is on the floors below.' });
  }
  [286, 706, 1126, 1520].forEach((wx) => { const l = lamp(x, c(wx), B, 60); lights.push({ x: l.x + PX0, y: l.y, g: 'warm' }); });
  [[300, '#41a6f6'], [912, '#ef7d57'], [1340, '#a7f070']].forEach(([wx, col]) => scooter(x, c(wx), B, col));
  for (let wx = 1510; wx < 2570; wx += 12) R(x, '#243a4a', c(wx), B - 10, 2, 10);
  R(x, '#243a4a', c(1510), B - 10, 1060, 1); R(x, '#3c5a6e', c(1510), B - 11, 1060, 1);
  { // The cutting-chai cycle: half a glass of tea, the fuel of every Pune office.
    const X = c(1590);
    disc(x, '#181425', X + 4, B - 5, 5); disc(x, '#5a6988', X + 4, B - 5, 4); disc(x, '#181425', X + 4, B - 5, 3);
    disc(x, '#181425', X + 30, B - 5, 5); disc(x, '#5a6988', X + 30, B - 5, 4); disc(x, '#181425', X + 30, B - 5, 3);
    seg(x, '#b13e53', X + 4, B - 5, X + 14, B - 14, 1); seg(x, '#b13e53', X + 14, B - 14, X + 26, B - 14, 1); seg(x, '#b13e53', X + 26, B - 14, X + 30, B - 5, 1); seg(x, '#b13e53', X + 14, B - 14, X + 18, B - 5, 1); seg(x, '#b13e53', X + 18, B - 5, X + 4, B - 5, 1);
    R(x, '#262b44', X + 12, B - 16, 5, 1); seg(x, '#262b44', X + 26, B - 14, X + 28, B - 19, 1); R(x, '#262b44', X + 26, B - 20, 5, 1);
    R(x, '#6a4320', X - 4, B - 19, 12, 2); R(x, '#8b9bb4', X - 2, B - 26, 8, 7); R(x, '#c0cbdc', X - 2, B - 26, 8, 1); R(x, '#5a6988', X + 6, B - 24, 2, 1); R(x, '#5a6988', X, B - 28, 4, 2);
    for (let i = 0; i < 4; i++) { R(x, 'rgba(220,240,255,.7)', X - 4 + i * 3, B - 22, 2, 3); R(x, '#c8853a', X - 4 + i * 3, B - 21, 2, 2); }
    person(x, X + 36, B - 24, { c: '#f4f4f4', h: '#262b44', f: -1, t: 12 }); R(x, '#3a4466', X + 36, B - 12, 6, 12);
    hot.push({ x: 1586, y: B - 28, w: 48, h: 28, say: 'The cutting-chai cycle: half a glass of tea, the fuel of every office in Pune.' });
  }
  ground(x, play.w, B, LH, r, 'city');

  return {
    id: 'floor', len: 1560, title: 'CHAPTER 4 - PUNE - 2019',
    layers: puneBackdrop(2019), play: { c: play.c, x0: PX0, F, B }, fg: { c: foreground(3000, 19), f: 1.32 },
    lights, hot, perches: [], steam: [], coins: [[80, 14], [300, 54], [510, 14], [720, 14], [930, 54], [1140, 14], [1345, 54], [1500, 14]],
    u: (lx) => clamp(lx / 1560, 0, 1),
    // Eight years in one building: sunrise, a long working day, and lights on at night.
    mood(u) {
      const q = Math.round(u * 80) / 80, night = clamp((u - 0.8) / 0.2, 0, 1), gold = clamp(1 - Math.abs(u - 0.68) / 0.16, 0, 1), dawn = clamp(1 - u / 0.1, 0, 1);
      return {
        sky: [0, 1, 2, 3].map((i) => kf([[0, DAWN[i]], [0.1, DAY[i]], [0.46, WARM[i]], [0.68, GOLD[i]], [0.84, DUSK[i]], [1, NIGHT[i]]], q)),
        amb: night > 0.05 ? ['#1a1c4a', 0.42 * night] : dawn > 0 ? ['#43387e', 0.3 * dawn] : ['#ff9648', 0.14 * gold], lamp: Math.max(night, dawn, 0.5 * gold), stars: night, pink: Math.max(dawn, gold), grey: 0,
        sun: kf([[0, 0.06], [0.3, 0.95], [0.68, 0.22], [0.84, 0]], u), sunA: 0.85 * (1 - night), rain: 0, glit: 0, night,
        rim: night > 0.4 ? ['#9fb4ff', 0.3] : ['#ffd9a8', 0.18 + 0.25 * Math.max(gold, dawn)],
      };
    },
    live({ x: g, sx, py, t, beat, bt }) {
      if (beat === 'print' && bt > 0.4) {                 // the hoarding's slats turn: ADMISSIONS OPEN > 1,000+ > RS 30-40 LAKH > ...
        const k = (bt + 1.8) / 2.8, from = Math.floor(k) % 3, to = (from + 1) % 3, u = (k % 1) * 2.8;   // u: seconds into this face
        const X0h = sx(live.hoard.x), Y0h = py + live.hoard.y;
        for (let i = 0; i < 9; i++) {
          const p = clamp((u - 2.2 - i * 0.04) / 0.28, 0, 1), f = p < 0.5 ? live.faces[from] : live.faces[to], w = Math.max(0, Math.round(12 * Math.abs(1 - 2 * p)));
          R(g, '#0b0a16', X0h + i * 12, Y0h, 12, 26);
          if (w > 0) g.drawImage(f, i * 12, 0, 12, 26, X0h + i * 12 + ((12 - w) >> 1), Y0h, w, 26);
          if (i) R(g, '#0b0a16', X0h + i * 12, Y0h, 1, 26);
        }
      }
      live.web.forEach((s, i) => R(g, Math.sin(t * 2 + i * 1.3) > 0.6 ? '#a7f070' : '#8b9bb4', sx(s.x), py + s.y, 3, 1));
      for (let j = 0; j < 5; j++) R(g, Math.sin(t * (6 + j * 2) + j) > 0 ? '#a7f070' : '#1f4636', sx(live.rack.x) + (j % 2) * 12, py + live.rack.y + j * 5, 1, 1);
      R(g, '#f4f4f4', sx(live.press.x), py + live.press.y, 4 + Math.floor((t * 6) % 9), 2);
      for (let i = 0; i < 9; i++) { const h = 3 + Math.round((i * 1.6) * (0.75 + 0.25 * Math.sin(t * 1.5 + i))); R(g, i > 5 ? '#a7f070' : '#41a6f6', sx(live.chart.x) + i * 4, py + live.chart.y - h, 3, h); }
      live.ai.forEach((s, i) => { for (let j = 0; j < 4; j++) R(g, '#73eff7', sx(s.x), py + s.y + j * 1.5 + (j > 1 ? 1 : 0), 2 + Math.floor((Math.sin(t * 3 + i * 2 + j * 1.7) * 0.5 + 0.5) * 8), 1); });
    },
    // Billboards stand on the roofs (bot is the roof line), two lines at most, so the rooms stay visible.
    stations: {
      pibm: { x: 200, bot: B - 113, items: [{ at: 0.4, n: 8, suf: ' YEARS', sc: 2, col: '#ffcd75' }, { at: 1.1, s: 'REPORTS TO CHAIRMAN AND CEO', col: '#f4f4f4' }] },
      team: { x: 403, bot: B - 93, items: [{ at: 0.4, n: 21, suf: ' PEOPLE', sc: 2, col: '#ffcd75' }, { at: 1.1, s: '99% ON TIME FOR 6 YEARS', col: '#a7f070' }] },
      web: { x: 613, bot: B - 89, items: [{ at: 0.4, n: 50, suf: '+ WEBSITES', sc: 2, col: '#ffcd75' }, { at: 1.1, s: 'ORGANIC TRAFFIC +40-50%', col: '#a7f070' }] },
      launch: { x: 1033, bot: B - 97, items: [{ at: 0.4, n: 20, suf: '+ LAUNCHES', sc: 2, col: '#ffcd75' }, { at: 1.1, s: 'FULL GO-TO-MARKET, EACH', col: '#f4f4f4' }] },
      decks: { x: 1243, bot: B - 89, items: [{ at: 0.4, n: 150, suf: '+ DECKS', sc: 2, col: '#ffcd75' }, { at: 1.2, s: '50-100 PIECES IN 3 DAYS', col: '#f4f4f4' }] },
      aiteam: { x: 1433, bot: B - 79, items: [{ at: 0.4, s: '2-3 HOURS', sc: 2, col: '#73eff7' }, { at: 1, s: 'SAVED EVERY DAY', col: '#f4f4f4' }] },
    },
  };
}

/* ───────── the rooftop ───────── */
function chest(x, X, Y, band, open) {
  R(x, DK, X - 1, Y - 13, 20, 14); R(x, '#8b5a2b', X, Y - 8, 18, 8); R(x, '#6a4320', X, Y - 2, 18, 2);
  R(x, '#a9743c', X, Y - 12 - (open ? 3 : 0), 18, 4); R(x, '#c9905a', X, Y - 12 - (open ? 3 : 0), 18, 1);
  if (open) R(x, '#fff6c9', X + 1, Y - 9, 16, 2);
  R(x, band, X + 2, Y - 12 - (open ? 3 : 0), 2, 12 + (open ? 3 : 0)); R(x, band, X + 14, Y - 12 - (open ? 3 : 0), 2, 12 + (open ? 3 : 0));
  R(x, '#ffcd75', X + 8, Y - 8, 3, 3); R(x, '#8a4b1c', X + 9, Y - 7, 1, 1);
}

export function roof() {
  const r = rng(2026), PX0 = -340, LH = 180, B = 134, F = 160;
  const play = mk(1580, LH), x = play.x, c = (wx) => wx - PX0, lights = [], hot = [];
  // Parapet, water tanks and the usual rooftop clutter.
  R(x, '#9a94a6', 0, B - 14, play.w, 14); R(x, '#c4bfcc', 0, B - 14, play.w, 2); R(x, '#6f6a7c', 0, B - 3, play.w, 3);
  for (let X = 0; X < play.w; X += 30) R(x, '#7f7a8c', X, B - 12, 1, 9);
  [-250, 250, 610, 940].forEach((wx) => { const X = c(wx); R(x, '#262b44', X + 2, B - 30, 2, 16); R(x, '#262b44', X + 22, B - 30, 2, 16); R(x, '#1d1f33', X, B - 44, 26, 16); R(x, '#3a3f5c', X, B - 44, 26, 2); R(x, '#3a3f5c', X + 3, B - 46, 20, 2); });
  [-120, 470, 1010].forEach((wx) => { const X = c(wx); R(x, DK, X + 8, B - 26, 1, 12); for (let i = 0; i < 3; i++) { R(x, '#27324f', X + i * 9, B - 34 + i, 8, 9); R(x, '#4a6a9a', X + i * 9 + 1, B - 33 + i, 6, 1); R(x, '#4a6a9a', X + i * 9 + 1, B - 30 + i, 6, 1); } });
  [-190, 60, 400, 690, 1090].forEach((wx, i) => { plant(x, c(wx), B, 1); plant(x, c(wx) + 8, B, i % 2); });
  { const X = c(-60); R(x, DK, X, B - 50, 1, 36); R(x, DK, X - 3, B - 48, 7, 1); disc(x, '#c0cbdc', X + 12, B - 30, 6); disc(x, '#8b9bb4', X + 13, B - 29, 4); seg(x, DK, X + 12, B - 30, X + 18, B - 37, 1); }
  // Study corner.
  { const X = c(136); desk(x, X, B - 12, 40, '#8b5a2b'); R(x, '#6a4320', X + 1, B - 10, 38, 10); const lp = laptop(x, X + 6, B - 22, '#16213a'); R(x, '#73eff7', lp.x + 1, lp.y + 1, 6, 1); R(x, '#f4f4f4', lp.x + 1, lp.y + 3, 8, 1);
    for (let i = 0; i < 4; i++) R(x, ['#b13e53', '#3b5dc9', '#ffcd75', '#38b764'][i], X + 24, B - 14 - i * 2, 12, 2);
    R(x, '#8b9bb4', X + 46, B - 44, 1, 44); R(x, '#002147', X + 47, B - 44, 40, 11); R(x, '#002147', X + 47, B - 33, 32, 2); text(x, 'OXFORD', X + 49, B - 42, '#f4f4f4');
    lights.push({ x: 136 + 12, y: B - 18, g: 'cool', always: 1, flicker: 9 });
    hot.push({ x: 136 + 46, y: B - 44, w: 42, h: 14, say: 'He is studying Generative and Agentic AI at Said Business School, University of Oxford.' });
  }
  // The fit-check terminal.
  { const X = c(346); R(x, '#262b44', X + 14, B - 22, 4, 22); R(x, '#181425', X, B - 50, 34, 30); R(x, '#16213a', X + 2, B - 48, 30, 24); R(x, '#3a4466', X + 4, B - 20, 26, 2);
    for (let j = 0; j < 5; j++) R(x, j < 3 ? '#a7f070' : '#5a6988', X + 5, B - 45 + j * 4, 2, 2);
    for (let j = 0; j < 5; j++) R(x, '#8b9bb4', X + 9, B - 45 + j * 4, 12 + ((j * 7) % 9), 2);
    lights.push({ x: 346 + 17, y: B - 36, g: 'cool', always: 1, flicker: 6 });
  }
  // Four chests.
  [['#e43b44', 0], ['#3b5dc9', 26], ['#38b764', 52], ['#c9a0ff', 78], ['#ffcd75', 104], ['#73eff7', 130]].forEach(([band, o]) => chest(x, c(530 + o), B, band, false));
  // The door to the next level.
  { const X = c(776); R(x, DK, X - 3, B - 54, 40, 54); R(x, '#d99a22', X - 2, B - 53, 38, 53); R(x, '#ffe08a', X - 2, B - 53, 38, 2); R(x, '#fff6c9', X + 2, B - 49, 30, 49); R(x, '#fffdf2', X + 6, B - 45, 22, 45);
    for (let i = 0; i < 5; i++) R(x, '#ffe9a8', X + 2 - i * 4, B - 2 + i, 30 + i * 8, 1);
    R(x, DK, c(730) - 1, B - 27, 12, 27); R(x, '#e43b44', c(730), B - 26, 10, 26); R(x, '#f6757a', c(730), B - 26, 10, 2); R(x, '#181425', c(730) + 2, B - 20, 6, 2); R(x, '#a22633', c(730), B - 8, 10, 2);
    lights.push({ x: 776 + 17, y: B - 26, g: 'warm', always: 1, flicker: 3 }, { x: 776 + 17, y: B - 40, g: 'warm', always: 1 });
    hot.push({ x: 730, y: B - 27, w: 12, h: 27, say: 'A red post box. The email button is faster, and he reads every message himself.' });
  }
  ground(x, play.w, B, LH, r, 'roof');

  return {
    id: 'roof', len: 880, title: 'CHAPTER 6 - TODAY',
    layers: puneBackdrop(2026).map((L, i) => ({ ...L, sink: L.sink + [14, 22, 34][i] })), play: { c: play.c, x0: PX0, F, B }, fg: { c: mk(10, 40).c, f: 1.32 },
    lights, hot, perches: [], steam: [], coins: [[70, 14], [290, 54], [500, 14], [700, 14]],
    u: (lx) => clamp(lx / 820, 0, 1),
    // The story began at sunrise, and it ends at the next one.
    mood(u) {
      const q = Math.round(u * 60) / 60, dawn = 1 - clamp((u - 0.5) / 0.5, 0, 1), night = clamp(1 - u / 0.35, 0, 1);
      return {
        sky: [0, 1, 2, 3].map((i) => kf([[0, NIGHT[i]], [0.4, DAWN[i]], [0.75, GOLD[i]], [1, WARM[i]]], q)),
        amb: ['#43387e', 0.34 * dawn + 0.1 * night], lamp: dawn, stars: night, pink: clamp(u / 0.4, 0, 1) * dawn + 0.3, grey: 0,
        sun: kf([[0.3, 0], [1, 0.5]], u), sunA: clamp((u - 0.25) / 0.2, 0, 1) * 0.95, rain: 0, glit: 0, night,
        rim: ['#ffd9a8', 0.2 + 0.3 * clamp(u / 0.6, 0, 1)],
      };
    },
    stations: {
      fit: { x: 363, bot: B - 52, items: [{ at: 0.4, s: 'FIT CHECK', sc: 2, col: '#a7f070' }, { at: 1, s: 'RUNS IN YOUR BROWSER', col: '#f4f4f4' }] },
      tools: { x: 604, bot: B - 18, items: [{ at: 0.4, s: 'SIX FREE CHESTS', sc: 2, col: '#ffcd75' }, { at: 1, s: 'NO SIGN-UP', col: '#f4f4f4' }] },
      contact: { x: 793, bot: B - 56, items: [{ at: 0.5, s: '5% DONE', sc: 2, col: '#ffcd75' }, { at: 1.3, s: '95% TO GO', col: '#f4f4f4' }] },
    },
  };
}
