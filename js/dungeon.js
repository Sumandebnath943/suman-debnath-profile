/* Career Mode — Chapter 5: the floors below. Everything Suman built with AI lives down here,
   by torchlight, with blue System windows for the numbers. */
import { mk, R, mix, disc, seg, text, clamp } from './kit.js';
import { rng } from './props.js';
import { ground, foreground, laptop, person } from './parts.js';

const STONE = { b: '#34305a', l: '#4a4580', d: '#232042', m: '#1b1836' };

function torch(x, X, Y) {
  R(x, '#1b1836', X - 1, Y, 4, 2); R(x, '#5a4632', X, Y - 6, 2, 8); R(x, '#8a6c4a', X + 1, Y - 6, 1, 8); R(x, '#262b44', X - 1, Y - 7, 4, 2);
  return { x: X + 1, y: Y - 10 };
}
function crystal(x, X, Y, h, a, b) {
  for (let i = 0; i < h; i++) { const w = Math.max(1, Math.round((i < h * 0.3 ? i / (h * 0.3) : 1) * h * 0.32)); R(x, a, X - w, Y - h + i, w, 1); R(x, b, X, Y - h + i, w, 1); }
  R(x, '#ffffff', X - 1, Y - h + 2, 1, Math.round(h * 0.4));
}
function smallChest(x, X, Y, band) {
  R(x, '#181425', X - 1, Y - 9, 12, 10); R(x, '#8b5a2b', X, Y - 5, 10, 5); R(x, '#a9743c', X, Y - 8, 10, 3); R(x, '#c9905a', X, Y - 8, 10, 1);
  R(x, band, X + 1, Y - 8, 1, 8); R(x, band, X + 8, Y - 8, 1, 8); R(x, '#ffcd75', X + 4, Y - 5, 2, 2);
}

export function dungeon() {
  const r = rng(46), PX0 = -340, LH = 180, B = 134, F = 160, TOP = B - 100;
  // Cavern in the distance: columns, stalactites and crystals.
  const far = mk(1200, 200), fx = far.x;
  R(fx, '#100e24', 0, 0, far.w, 200);
  for (let X = 0; X < far.w; X += 60 + Math.floor(r() * 70)) { const w = 12 + Math.floor(r() * 16); R(fx, '#181533', X, 0, w, 200); R(fx, '#201c40', X + w - 2, 0, 2, 200); R(fx, '#181533', X - 4, 0, w + 8, 10); }
  for (let X = 0; X < far.w; X += 8 + Math.floor(r() * 14)) { const h = 6 + r() * 26; for (let i = 0; i < h; i++) R(fx, '#181533', X + i * 0.18, i, Math.max(1, 5 - i * 0.2), 1); }
  for (let i = 0; i < 26; i++) crystal(fx, r() * far.w, 196, 8 + r() * 14, r() < 0.5 ? '#3b5dc9' : '#7a4ac9', r() < 0.5 ? '#73eff7' : '#c9a0ff');
  const mid = mk(1600, 200), mx = mid.x;
  for (let X = -20; X < mid.w; X += 150) {
    R(mx, '#1e1a3c', X, 0, 20, 200); R(mx, '#2a2550', X + 17, 0, 3, 200); R(mx, '#1e1a3c', X - 6, 0, 32, 12); R(mx, '#1e1a3c', X - 4, 188, 28, 12);
    for (let i = 0; i < 130; i++) { const u = i / 130, y = 12 + 34 * (1 - Math.sin(Math.PI * u)); R(mx, '#1e1a3c', X + 20 + i, 0, 1, y); }
    seg(mx, '#141230', X + 80, 14, X + 80, 60 + r() * 30, 1); R(mx, '#3a3560', X + 78, 62, 5, 4);
  }

  const play = mk(2280, LH), x = play.x, c = (wx) => wx - PX0, lights = [], hot = [], flames = [], live = {};
  // Brick wall.
  R(x, STONE.b, 0, TOP, play.w, B - TOP);
  for (let y = TOP, j = 0; y < B; y += 8, j++) {
    R(x, STONE.d, 0, y + 7, play.w, 1);
    for (let X = (j % 2) * 9 - 9; X < play.w; X += 18) { R(x, STONE.d, X, y, 1, 7); const k = r(); if (k < 0.16) R(x, STONE.l, X + 1, y, 17, 7); else if (k < 0.3) R(x, STONE.d, X + 1, y, 17, 7); if (k > 0.9) R(x, '#2f6b4f', X + 2, y + 5, 6, 2); }
  }
  R(x, STONE.l, 0, TOP, play.w, 2); R(x, STONE.m, 0, TOP - 6, play.w, 6);
  for (let X = 0; X < play.w; X += 12) R(x, STONE.m, X, TOP - 10, 6, 4);
  R(x, STONE.m, 0, B - 4, play.w, 4);
  // Pillars and torches between the rooms.
  for (let wx = -230; wx < 1800; wx += 210) {
    const X = c(wx);
    R(x, STONE.d, X - 2, TOP - 4, 22, B - TOP + 4); R(x, STONE.l, X, TOP - 4, 16, B - TOP + 4); R(x, '#5c568c', X, TOP - 4, 2, B - TOP + 4); R(x, STONE.b, X + 11, TOP - 4, 5, B - TOP + 4);
    R(x, STONE.l, X - 4, TOP - 8, 24, 5); R(x, STONE.l, X - 4, B - 6, 24, 6); R(x, STONE.d, X - 4, B - 1, 24, 1);
    const t0 = torch(x, X + 7, B - 46); flames.push({ x: t0.x + PX0, y: t0.y }); lights.push({ x: t0.x + PX0, y: t0.y, g: 'warm', always: 1, flicker: 11 + (wx % 7) });
  }
  // An arched alcove for each exhibit.
  const alcove = (wx, w = 112) => {
    const X = c(wx), Y = B - 52;
    R(x, STONE.m, X - 3, Y - 3, w + 6, 55); R(x, '#141230', X, Y, w, 52);
    for (let i = 0; i < 8; i++) { R(x, STONE.m, X, Y + i, 8 - i, 1); R(x, STONE.m, X + w - 8 + i, Y + i, 8 - i, 1); }
    R(x, '#1e1a3c', X, Y + 46, w, 6); R(x, '#2a2550', X, Y + 46, w, 1);
    return [X, Y];
  };

  { // The way in, and five steps of learning.
    const [X, Y] = alcove(132);
    for (let i = 0; i < 6; i++) { R(x, '#3a3560', X + i * 6, Y + 10 + i * 6, 36 - i * 6, 6); R(x, '#544e84', X + i * 6, Y + 10 + i * 6, 36 - i * 6, 1); }
    live.runes = [];
    for (let i = 0; i < 5; i++) { const rx = X + 44 + i * 13; R(x, '#232042', rx, Y + 30, 10, 16); R(x, '#34305a', rx + 1, Y + 31, 8, 14); live.runes.push({ x: rx + 3 + PX0, y: Y + 34 }); }
  }
  { // Twenty-six chests.
    const [X, Y] = alcove(342);
    [0, 1, 2].forEach((j) => { R(x, '#5a4632', X + 6, Y + 14 + j * 14, 100, 2); for (let i = 0; i < 8; i++) smallChest(x, X + 8 + i * 12, Y + 14 + j * 14, ['#e43b44', '#3b5dc9', '#38b764', '#c9a0ff', '#ffcd75'][(i + j * 2) % 5]); });
    smallChest(x, X + 30, Y + 46, '#73eff7'); smallChest(x, X + 70, Y + 46, '#f6757a');
  }
  { // MIGI's dock.
    const [X, Y] = alcove(552);
    for (let a = 0; a < 40; a++) { const an = Math.PI * a / 39; R(x, a % 5 ? '#5a6988' : '#8b9bb4', X + 30 - Math.cos(an) * 18, Y + 44 - Math.sin(an) * 30, 3, 3); }
    R(x, '#262b44', X + 9, Y + 40, 44, 6); R(x, '#3a4466', X + 9, Y + 40, 44, 1);
    seg(x, '#262b44', X + 52, Y + 44, X + 66, Y + 30, 1); seg(x, '#262b44', X + 52, Y + 42, X + 70, Y + 38, 1);
    live.bots = [];
    for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) { const bx = X + 64 + i * 11, by = Y + 8 + j * 12; R(x, '#181425', bx - 1, by - 1, 10, 9); R(x, '#c0cbdc', bx, by, 8, 7); R(x, '#16213a', bx + 1, by + 1, 6, 4); R(x, '#ffcd75', bx + 3, by - 2, 2, 1); live.bots.push({ x: bx + 2 + PX0, y: by + 2 }); }
    lights.push({ x: 552 + 31, y: Y + 30, g: 'cool', always: 1, flicker: 4 });
    live.dock = { x: 552 + 31, y: Y + 26 };
  }
  { // Two models.
    const [X, Y] = alcove(762);
    R(x, STONE.l, X + 16, Y + 34, 26, 12); R(x, '#5c568c', X + 16, Y + 34, 26, 1); crystal(x, X + 29, Y + 34, 26, '#7a4ac9', '#c9a0ff');
    R(x, STONE.l, X + 66, Y + 38, 28, 8); R(x, '#5c568c', X + 66, Y + 38, 28, 1); laptop(x, X + 70, Y + 28, '#16213a'); crystal(x, X + 90, Y + 38, 12, '#38b764', '#a7f070');
    lights.push({ x: 762 + 29, y: Y + 22, g: 'cool', always: 1, flicker: 3 }, { x: 762 + 90, y: Y + 32, g: 'cyan', always: 1, flicker: 5 });
  }
  { // A vault, and a chest that is still locked.
    const [X, Y] = alcove(972);
    disc(x, '#5a6988', X + 30, Y + 26, 19); disc(x, '#8b9bb4', X + 30, Y + 26, 16); disc(x, '#5a6988', X + 30, Y + 26, 12); disc(x, '#c0cbdc', X + 30, Y + 26, 4);
    [[0, -9], [0, 9], [-9, 0], [9, 0]].forEach(([dx, dy]) => seg(x, '#c0cbdc', X + 30, Y + 26, X + 30 + dx, Y + 26 + dy, 1));
    R(x, '#181425', X + 67, Y + 30, 28, 17); R(x, '#8b5a2b', X + 68, Y + 37, 26, 9); R(x, '#a9743c', X + 68, Y + 31, 26, 6); R(x, '#5a6988', X + 72, Y + 31, 2, 15); R(x, '#5a6988', X + 88, Y + 31, 2, 15);
    seg(x, '#8b9bb4', X + 66, Y + 34, X + 96, Y + 44, 1); seg(x, '#8b9bb4', X + 96, Y + 34, X + 66, Y + 44, 1); R(x, '#ffcd75', X + 79, Y + 36, 5, 6); R(x, '#181425', X + 81, Y + 38, 1, 2);
    hot.push({ x: 972 + 66, y: Y + 30, w: 30, h: 18, say: 'The locked chest is ROASmind: more than 200,000 lines, in private testing. You can ask him for early access.' });
  }
  { // Four rules, cut into stone.
    const [X, Y] = alcove(1182);
    ['I', 'II', 'III', 'IV'].forEach((s, i) => { const tx = X + 8 + i * 26; R(x, STONE.d, tx - 1, Y + 11, 22, 36); R(x, STONE.l, tx, Y + 12, 20, 34); R(x, '#5c568c', tx, Y + 12, 20, 1); for (let k = 0; k < 6; k++) R(x, STONE.l, tx + k, Y + 12 - 3 + k / 2, 20 - k * 2, 1); text(x, s, tx + 10 - (s.length * 6 - 1) / 2, Y + 17, '#ffcd75'); for (let k = 0; k < 4; k++) R(x, STONE.b, tx + 3, Y + 28 + k * 4, 14 - (k % 2) * 4, 1); });
  }
  { // The cinema.
    const [X, Y] = alcove(1392);
    R(x, '#181425', X + 8, Y + 6, 70, 30); R(x, '#f4f4f4', X + 10, Y + 8, 66, 26);
    live.screen = { x: X + 10 + PX0, y: Y + 8 };
    for (let i = 0; i < 6; i++) { R(x, '#7a2a3c', X + 10 + i * 12, Y + 40, 9, 7); R(x, '#b13e53', X + 10 + i * 12, Y + 40, 9, 2); }
    R(x, '#262b44', X + 90, Y + 22, 14, 10); R(x, '#5a6988', X + 86, Y + 25, 4, 4); R(x, '#262b44', X + 96, Y + 32, 2, 14); disc(x, '#3a4466', X + 94, Y + 20, 3); disc(x, '#3a4466', X + 101, Y + 20, 3);
    lights.push({ x: 1392 + 43, y: Y + 20, g: 'cool', always: 1, flicker: 14 });
    hot.push({ x: 1392 + 8, y: Y + 6, w: 70, h: 30, say: 'The film is called "Who am I?" and runs 5 minutes 57 seconds. The link is in the story panel.' });
  }
  // Banners between the alcoves.
  [270, 480, 690, 900, 1110, 1320].forEach((wx, i) => { const X = c(wx); R(x, '#5a4632', X - 1, TOP + 6, 14, 2); R(x, i % 2 ? '#3b5dc9' : '#b13e53', X, TOP + 8, 12, 22); R(x, i % 2 ? '#73eff7' : '#ffcd75', X + 5, TOP + 14, 2, 8); R(x, STONE.b, X, TOP + 28, 4, 2); R(x, STONE.b, X + 8, TOP + 28, 4, 2); });
  ground(x, play.w, B, LH, r, 'stone');

  const NIGHT = ['#0b0a18', '#100e24', '#161232', '#1c1740'];
  return {
    id: 'dungeon', len: 1600, title: 'CHAPTER 5 - THE FLOORS BELOW', born: 572,
    layers: [{ c: far.c, f: 0.14, haze: 0, sink: 20, pad: 0 }, { c: mid.c, f: 0.42, haze: 0, sink: 20, pad: 10 }],
    play: { c: play.c, x0: PX0, F, B }, fg: { c: foreground(3200, 46, '#0b0a18', '#2a2550', false), f: 1.32 },
    lights, hot, perches: [], steam: [], coins: [[70, 14], [300, 54], [505, 14], [716, 54], [930, 14], [1140, 14], [1350, 54], [1540, 14]],
    u: (lx) => clamp(lx / 1600, 0, 1),
    mood() {
      return { sky: NIGHT, amb: ['#1a1440', 0.3], lamp: 1, stars: 0, pink: 0, grey: 0, sun: 0, sunA: 0, rain: 0, glit: 0, night: 1, indoor: 1, embers: 1, rim: ['#ffb070', 0.42] };
    },
    live({ x: g, sx, py, t, beat, bt, lx }) {
      flames.forEach((f, i) => {                               // torches
        const X = sx(f.x), Y = py + f.y, k = Math.floor(t * 9 + i * 3) % 3;
        R(g, '#d9532c', X - 2, Y, 4, 4); R(g, '#f4a03c', X - 1 - (k === 1), Y - 2, 3, 5); R(g, '#ffe08a', X - 1 + (k === 2), Y - 1 - (k === 0), 2, 3); R(g, '#f4a03c', X - (k === 0), Y - 4 - (k === 2), 1, 2);
      });
      live.runes.forEach((s, i) => {                           // prompts, context, workflows, agents, products
        const on = beat === 'learn' ? bt > 0.3 + i * 0.35 : lx > 300;
        R(g, on ? ['#ffcd75', '#73eff7', '#a7f070', '#c9a0ff', '#f6757a'][i] : '#232042', sx(s.x), py + s.y, 4, 2); R(g, on ? '#ffffff' : '#232042', sx(s.x) + 1, py + s.y + 4, 2, 4);
      });
      live.bots.forEach((s, i) => { if (lx > 520) { const b = Math.sin(t * 1.5 + i * 2.1) > 0.94; R(g, '#73eff7', sx(s.x), py + s.y + (b ? 1 : 0), 1, b ? 1 : 2); R(g, '#73eff7', sx(s.x) + 3, py + s.y + (b ? 1 : 0), 1, b ? 1 : 2); } });
      const a = sx(live.dock.x - 340 + 340), ring = 0.5 + 0.5 * Math.sin(t * 4);
      if (lx > 500 && lx < 640) for (let i = 0; i < 6; i++) R(g, i % 2 ? '#73eff7' : '#d9fdff', a - 12 + i * 5, py + live.dock.y + 14 - Math.round(((t * 20 + i * 7) % 26)), 1, 2 + (ring > 0.5));
      const s = live.screen, fl = Math.floor(t * 12) % 7;       // the film flickers on the screen
      R(g, '#ffcf7a', sx(s.x) + 4, py + s.y + 18, 58, 8); R(g, '#e2766a', sx(s.x), py + s.y + 14, 66, 5); R(g, '#5b3f87', sx(s.x), py + s.y, 66, 14); disc(g, '#fff6c9', sx(s.x) + 46, py + s.y + 15, 5);
      R(g, '#181425', sx(s.x) + 14 + Math.round(Math.sin(t) * 3), py + s.y + 13, 5, 11); R(g, '#f4f4f4', sx(s.x) + fl * 9, py + s.y, 1, 26);
    },
    stations: {
      learn: { sys: 1, x: 188, y: TOP + 6, items: [{ at: 0.3, s: 'PROMPTS', col: '#ffcd75' }, { at: 0.65, s: '> CONTEXT', col: '#73eff7' }, { at: 1, s: '> WORKFLOWS', col: '#a7f070' }, { at: 1.35, s: '> AGENTS', col: '#c9a0ff' }, { at: 1.7, s: '> PRODUCTS', col: '#f6757a' }] },
      shipped: { sys: 1, x: 398, y: TOP + 6, items: [{ at: 0.3, n: 26, suf: '+ AI PRODUCTS', sc: 2, col: '#ffcd75' }, { at: 1.1, s: 'SHIPPED SOLO SINCE 2024', col: '#f4f4f4' }, { at: 1.8, s: '200,000+ LINES, AI-ASSISTED', col: '#73eff7' }] },
      migi: { sys: 1, x: 608, y: TOP + 6, items: [{ at: 0.3, n: 46, suf: ' AGENTS', sc: 2, col: '#73eff7' }, { at: 1.1, n: 500, suf: '+ AUTOMATED CHECKS', col: '#f4f4f4' }, { at: 1.9, s: 'COST SO FAR: ABOUT $5', col: '#a7f070' }] },
      models: { sys: 1, x: 818, y: TOP + 6, items: [{ at: 0.3, s: '47M PARAMETERS', sc: 2, col: '#c9a0ff' }, { at: 1.1, s: 'ABOUT 87% EXACT MATCH', col: '#f4f4f4' }, { at: 1.9, s: 'HUMANEVAL 1.2% > 42.1%', col: '#a7f070' }] },
      trust: { sys: 1, x: 1028, y: TOP + 6, items: [{ at: 0.3, n: 38, suf: ' SECURITY TESTS', sc: 2, col: '#ffcd75' }, { at: 1.1, s: '12 MODULES, 3 AUDITS', col: '#f4f4f4' }, { at: 1.9, s: 'EVERY ANSWER CITES POLICY', col: '#73eff7' }] },
      rules: { sys: 1, x: 1238, y: TOP + 6, items: [{ at: 0.3, s: 'FOUR RULES', sc: 2, col: '#ffcd75' }, { at: 1, s: 'EACH ONE FROM A FAILURE', col: '#f4f4f4' }] },
      film: { sys: 1, x: 1448, y: TOP + 6, items: [{ at: 0.3, s: 'WHO AM I?', sc: 2, col: '#ffcd75' }, { at: 1, s: '5:57, MADE BY ONE PERSON', col: '#f4f4f4' }] },
    },
  };
}
