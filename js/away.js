/* Career Mode — the scenes away from home: the long road to Pune, the first job in Kerala,
   and the four-month gap that follows it. */
import { mk, R, mix, disc, seg, text, textW, plate, kf, clamp } from './kit.js';
import { rng, DK, BLD, facade, win, palm, room, lamp, signboard } from './props.js';
import { ground, foreground, lcd, laptop, desk, person, plant, hills } from './parts.js';

const h1 = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
const vn = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return h1(i) * (1 - u) + h1(i + 1) * u; };

const DAY = ['#2b78d2', '#5fb0ef', '#a3dbf5', '#e6f5ee'];
const DUSK = ['#2d2a6a', '#8a4a8f', '#f08a5a', '#ffd98a'];
const NIGHT = ['#0d0f2c', '#181a46', '#2a2d66', '#40458a'];
const DAWN = ['#1f2452', '#5b3f87', '#e2766a', '#ffd28a'];

/* A stretch of open country, drawn fresh every frame. Used twice:
   once as a day-and-night journey, once as a night road with a gap in it. */
function country(o) {
  const frames = o.gap
    ? [[0, NIGHT], [0.72, NIGHT], [1, DAWN]]
    : [[0, DAY], [0.26, DUSK], [0.46, NIGHT], [0.62, NIGHT], [0.8, DAWN], [1, DAY]];
  const nightAt = o.gap ? [[0, 1], [0.72, 1], [1, 0.35]] : [[0.2, 0], [0.44, 1], [0.64, 1], [0.84, 0]];
  const G0 = 96, G1 = 216, MONTHS = ['NOV', 'DEC', 'JAN', 'FEB'];
  return {
    id: o.id, len: o.len, title: o.title, coins: o.coins || [], lights: [], hot: [], perches: [], steam: [],
    u: (lx) => clamp(lx / o.len, 0, 1),
    mood(u) {
      const q = Math.round(u * 60) / 60, night = kf(nightAt, u);
      return {
        sky: [0, 1, 2, 3].map((i) => kf(frames.map(([a, s]) => [a, s[i]]), q)), amb: ['#1a1c4a', 0], lamp: night, stars: night, pink: o.gap ? clamp((u - 0.72) / 0.28, 0, 1) : (u > 0.62 ? 1 - Math.abs(u - 0.8) / 0.2 : (u < 0.4 ? clamp(1 - Math.abs(u - 0.26) / 0.16, 0, 1) : 0)), grey: 0,
        sun: o.gap ? 0 : (u < 0.3 ? 0.9 - u * 3 : clamp((u - 0.76) * 3.6, 0, 0.9)), sunA: (1 - night) * 0.9, rain: 0, glit: 0, night,
        rim: night > 0.5 ? ['#9fb4ff', 0.3] : ['#ffd9a8', 0.25],
      };
    },
    custom({ ctx, W, H, Fs, cam, t, base, horizon, m, px }) {
      const night = m.night, sp = o.gap ? 1 : 4, far = cam * sp * 0.22, mid = cam * sp * 0.55, near = cam * sp;
      const cF = mix(mix('#7f9cc0', m.sky[3], 0.45), '#1b1f4e', night), cM = mix('#4f8a5a', '#131a3a', night), cT = mix('#2f6b4f', '#0d1230', night);
      if (night > 0.2) { ctx.globalAlpha = night; disc(ctx, '#f4f1dc', Math.round(W * 0.74), Math.round(horizon * 0.3), 6); disc(ctx, m.sky[1], Math.round(W * 0.74) + 3, Math.round(horizon * 0.3) - 2, 5); ctx.globalAlpha = 1; }
      for (let X = 0; X < W; X++) {
        const hf = 12 + 18 * vn((far + X) / 80) + 6 * vn((far + X) / 19);
        R(ctx, cF, X, horizon - hf, 1, hf + 31);
        const hm = 6 + 9 * vn((mid + X) / 34 + 40);
        R(ctx, cM, X, base - 9 - hm, 1, hm + 10);
      }
      // The night train: every Indian landscape has one somewhere.
      if (o.train && night > 0.15) {
        const tx = Math.round(-190 + clamp((cam / o.len - 0.25) / 0.5, 0, 1) * (W + 380)), ty = base - 15;
        ctx.globalAlpha = Math.min(1, night * 1.5);
        R(ctx, '#0b0e26', tx - 400, ty + 6, 700, 1);
        for (let i = 0; i < 9; i++) { const cx0 = tx + i * 19; R(ctx, '#0f1330', cx0, ty, 18, 6); if (i < 8) for (let j = 0; j < 4; j++) R(ctx, '#ffd98a', cx0 + 2 + j * 4, ty + 1, 2, 2); else { R(ctx, '#0f1330', cx0 + 4, ty - 2, 8, 2); R(ctx, '#fff6c9', cx0 + 17, ty + 2, 2, 2); } }
        ctx.globalAlpha = 1;
      }
      // Trees, palms and pylons on the far side of the road.
      for (let i = Math.floor((near - 40) / 58); i * 58 - near < W + 40; i++) {
        const X = Math.round(i * 58 + 30 * h1(i) - near), k = h1(i + 7), y = base;
        if (k < 0.3) { for (let j = 0; j < 22; j++) R(ctx, cT, X + Math.round(j * j / 160), y - j, 1, 1); [[-7, 3], [-5, -2], [0, -5], [5, -2], [8, 3]].forEach(([dx, dy]) => seg(ctx, cT, X + 3, y - 22, X + 3 + dx, y - 22 + dy, 1)); }
        else if (k < 0.75) { R(ctx, cT, X, y - 8, 2, 8); disc(ctx, cT, X + 1, y - 13, 6 + Math.floor(k * 4)); }
        else if (!o.gap) { seg(ctx, cT, X, y, X + 4, y - 30, 1); seg(ctx, cT, X + 8, y, X + 4, y - 30, 1); R(ctx, cT, X - 3, y - 24, 15, 1); R(ctx, cT, X - 1, y - 16, 11, 1); }
      }
      for (let i = Math.floor(near / 36) - 1; i * 36 - near < W; i++) R(ctx, mix(h1(i + 3) < 0.5 ? '#7fb35a' : '#c9c05a', '#141c36', night), Math.round(i * 36 - near), base - 3, 36, 3);
      // The road itself moves at walking pace.
      const d = (c0) => mix(c0, '#10132c', night * 0.72);
      R(ctx, d('#6f7d48'), 0, base, W, 3); R(ctx, d('#2c3048'), 0, base + 3, W, 1); R(ctx, d('#3b4058'), 0, base + 4, W, 15);
      for (let X = -(((cam % 20) + 20) % 20); X < W; X += 20) R(ctx, d('#7c849e'), Math.round(X) + 4, base + 11, 9, 1);
      R(ctx, d('#c9b07a'), 0, base + 19, W, 1); R(ctx, d('#8f7a52'), 0, base + 20, W, 1); R(ctx, d('#b89a6a'), 0, base + 21, W, 13); R(ctx, d('#cdb07e'), 0, base + 21, W, 1);
      for (let i = Math.floor(cam / 7) - 1; i * 7 - cam < W; i++) R(ctx, d(h1(i) < 0.5 ? '#d2b98a' : '#9c8358'), Math.round(i * 7 + h1(i + 9) * 7 - cam), base + 23 + Math.floor(h1(i + 2) * 10), 1, 1);
      R(ctx, d('#6a6258'), 0, base + 34, W, 2); R(ctx, '#2b2a40', 0, base + 36, W, H);
      for (let i = Math.floor(cam / 84) - 1; i * 84 - cam < W; i++) { const X = Math.round(i * 84 + 40 - cam); R(ctx, d('#f4f4f4'), X, base - 7, 6, 7); R(ctx, d('#ffcd3a'), X, base - 9, 6, 3); }

      if (o.gap) {                                    // the gap, and the bridge built one month at a time
        const a = Math.round(G0 - cam), b = Math.round(G1 - cam), pw = (G1 - G0) / 8, n = clamp(Math.floor((px - G0 + 30) / pw), 0, 8);
        R(ctx, '#141230', a, base, b - a, 8); R(ctx, '#0a0916', a, base + 8, b - a, H);
        for (let y = base; y < H; y += 3) { R(ctx, '#2b2a40', a - 1 + Math.round(h1(y) * 3), y, 3, 3); R(ctx, '#2b2a40', b - 2 - Math.round(h1(y + 5) * 3), y, 3, 3); }
        for (let i = 0; i < 14; i++) R(ctx, '#3a3560', a + 6 + h1(i) * (b - a - 12), base + 12 + h1(i + 4) * (H - base - 14), 1, 1);
        [a - 3, b + 1].forEach((X) => { R(ctx, '#4a3526', X, Fs - 14, 3, 16); R(ctx, '#6a4a32', X + 2, Fs - 14, 1, 16); });
        for (let i = 0; i < n; i++) {
          const X = a + Math.round(i * pw), drop = i === n - 1 ? Math.round(6 * clamp(1 - ((px - G0 + 30) / pw - i), 0, 1)) : 0;
          R(ctx, '#8b5a2b', X + 1, Fs - 1 - drop, Math.ceil(pw) - 1, 4); R(ctx, '#b9824a', X + 1, Fs - 1 - drop, Math.ceil(pw) - 1, 1); R(ctx, '#5a3a1c', X + 1, Fs + 2 - drop, Math.ceil(pw) - 1, 1);
        }
        if (n > 0) { const e = a + Math.round(n * pw); for (let X = a; X <= e; X++) { const u = (X - a) / (b - a); R(ctx, '#c9b07a', X, Fs - 13 + Math.round(22 * u * (1 - u)), 1, 1); } }
        MONTHS.forEach((s, i) => { if (n >= i * 2 + 1) plate(ctx, s, a + Math.round((i * 2 + 1) * pw), Fs - 34, '#ffcd75'); });
        plate(ctx, 'OCT 2018', a - 26, Fs - 50, '#f6757a');
        if (n >= 8) plate(ctx, 'MAR 2019', b + 26, Fs - 50, '#a7f070');
      }
    },
    over({ ctx, W, t, u, narrow }) {
      if (o.gap || !o.route) return;                 // a route line across the top of the screen
      const [a, b] = o.route, w = narrow ? Math.min(120, W - textW(a) - textW(b) - 30) : 90, x0 = Math.round(narrow ? (W - w) / 2 : W * 0.72 - w / 2), y = narrow ? 26 : 30;
      plate(ctx, a, x0 - textW(a) / 2 - 8, y - 6, '#f4f4f4'); plate(ctx, b, x0 + w + textW(b) / 2 + 8, y - 6, '#ffcd75');
      R(ctx, '#181425', x0 - 1, y - 1, w + 2, 4);
      for (let X = 0; X < w; X += 4) R(ctx, X / w <= u ? '#ffcd75' : '#5a6988', x0 + X, y, 2, 2);
      R(ctx, '#f4f4f4', x0 + Math.round(u * w) - 1, y - 2, 3, 6);
    },
    stations: o.stations || {},
  };
}

export const road = () => country({ id: 'road', len: 200, title: 'KOLKATA > PUNE', route: ['KOLKATA', 'PUNE'], train: true, coins: [[150, 14]] });
export const gap = () => country({
  id: 'gap', len: 300, gap: true, title: 'OCTOBER 2018', coins: [[156, 30]],
  stations: { gap: { x: 156, y: 44, items: [{ at: 0.4, s: 'FOUR MONTHS, NO JOB', col: '#f6757a' }, { at: 1.4, s: 'FREELANCING TO STAY AFLOAT', col: '#f4f4f4' }] } },
});

/* ───────── Kerala, 2018: the first job ───────── */
function bigPalm(x, X, B, h, r) {
  const lean = (r() - 0.5) * 14;
  for (let i = 0; i < h; i++) { const px = X + Math.round(lean * (i / h) * (i / h)); R(x, i % 4 ? '#6a5238' : '#4a3828', px, B - i, 3, 1); R(x, '#8a6c4a', px + 2, B - i, 1, 1); }
  const tx = X + Math.round(lean) + 1, ty = B - h;
  [[-18, 6], [-15, -3], [-8, -9], [0, -11], [9, -9], [16, -3], [19, 6], [-10, 9], [11, 9]].forEach(([dx, dy], i) => {
    seg(x, '#1c4f38', tx, ty + 1, tx + dx, ty + dy + 1, 2);
    seg(x, i % 2 ? '#2b7a4a' : '#4fae58', tx, ty, tx + dx, ty + dy, 1);
    for (let k = 0.3; k < 1; k += 0.2) R(x, '#2b7a4a', tx + dx * k, ty + dy * k + 1, 1, 3);
  });
  disc(x, '#6a4a32', tx, ty + 2, 2); disc(x, '#8a6c4a', tx + 3, ty + 3, 1);
}

function tiledHouse(x, X, B, w, h, r) {
  R(x, '#efe9dc', X, B - h, w, h); R(x, '#c9c1b0', X, B - h, 2, h); R(x, '#b8ae9c', X, B - 2, w, 2);
  for (let i = 0; i < 9; i++) { R(x, i % 2 ? '#b4513c' : '#c9654a', X - 5 + i, B - h - 1 - i, w + 10 - i * 2, 1); }
  R(x, '#8f3a2c', X - 6, B - h, w + 12, 2);
  for (let wx = X + 5; wx < X + w - 8; wx += 12) win(x, wx, B - h + 8, 5, 8, r() < 0.3 ? 'lit' : 'sh');
}

export function kerala() {
  const r = rng(2018), PX0 = -340, LH = 180, B = 134, F = 160;
  // Backwater, palms and low green hills.
  const far = mk(1000, 152);
  hills(far.x, far.w, 118, r, '#5f9a8a', 10, 30, 30);
  for (let X = 0; X < far.w; X += 9 + Math.floor(r() * 12)) palm(far.x, X, 118, 12 + r() * 12, r);
  R(far.x, '#3f7f86', 0, 118, far.w, 34); R(far.x, '#56a0a0', 0, 118, far.w, 8);
  for (let i = 0; i < 260; i++) { const y = 119 + r() * 32; R(far.x, r() < 0.5 ? '#8fd0c8' : '#69b4b0', r() * far.w, y, 2 + r() * (3 + (y - 118) * 0.3), 1); }
  [[210, 132], [470, 128], [700, 136]].forEach(([bx, by]) => { R(far.x, '#2a3f3a', bx, by, 30, 3); R(far.x, '#2a3f3a', bx - 3, by - 1, 4, 1); R(far.x, '#2a3f3a', bx + 29, by - 1, 4, 1); R(far.x, '#8a6c4a', bx + 5, by - 8, 20, 8); R(far.x, '#b9a070', bx + 5, by - 8, 20, 2); R(far.x, '#3a2f2a', bx + 8, by - 5, 3, 3); R(far.x, '#3a2f2a', bx + 14, by - 5, 3, 3); });
  const mid = mk(1100, 150);
  for (let X = -10; X < mid.w; X += 38 + Math.floor(r() * 46)) tiledHouse(mid.x, X, 150, 26 + Math.floor(r() * 18), 22 + Math.floor(r() * 12), r);
  for (let X = 0; X < mid.w; X += 10 + Math.floor(r() * 14)) palm(mid.x, X, 150, 26 + r() * 26, r);
  const back = mk(1300, 172);
  for (let X = 10; X < back.w; X += 90 + Math.floor(r() * 80)) tiledHouse(back.x, X, 172, 50 + Math.floor(r() * 26), 36 + Math.floor(r() * 16), r);
  for (let X = 0; X < back.w; X += 26 + Math.floor(r() * 30)) bigPalm(back.x, X, 172, 44 + r() * 30, r);

  const play = mk(1240, LH), x = play.x, c = (wx) => wx - PX0, lights = [], hot = [];
  [-290, -210, -110, -30, 46, 322, 392, 470, 560, 660, 760].forEach((wx) => bigPalm(x, c(wx), B, 62 + r() * 26, r));
  for (let wx = -340; wx < 900; wx += 5) { const hgt = 4 + r() * 7; R(x, r() < 0.5 ? '#2b7a4a' : '#1c4f38', c(wx), B - hgt, 3, hgt); if (r() < 0.2) R(x, '#f6757a', c(wx) + 1, B - hgt, 1, 1); }
  {
    const X = c(104), w = 190, h = 56, rx = X + 34, ry = B - 42, rw = 112, rh = 38;
    R(x, '#efe9dc', X, B - h, w, h); R(x, '#c9c1b0', X, B - h, 2, h); R(x, '#fbf7ee', X + w - 1, B - h, 1, h); R(x, '#b8ae9c', X, B - 2, w, 2);
    for (let i = 0; i < 20; i++) R(x, i % 2 ? '#b4513c' : '#c9654a', X - 10 + i * 2, B - h - 1 - i, w + 20 - i * 4, 1);
    for (let i = 0; i < 20; i += 2) for (let tx = X - 8 + i * 2; tx < X + w + 8 - i * 2; tx += 5) R(x, '#8f3a2c', tx, B - h - 1 - i, 1, 1);
    R(x, '#8f3a2c', X - 12, B - h, w + 24, 2);
    [6, 22, 164, 180].forEach((o) => { R(x, '#6a4320', X + o, B - h + 2, 3, h - 2); R(x, '#8b5a2b', X + o + 2, B - h + 2, 1, h - 2); });
    signboard(x, 'CBS VENTURES', X + 95, B - h + 1, '#1d2552', '#f4f4f4');
    room(x, rx, ry, rw, rh, '#4f6f66', '#6a4a3a');
    [['#ffcd75', 6], ['#f6757a', 13], ['#73eff7', 20], ['#a7f070', 27], ['#c9a0ff', 34]].forEach(([col, o]) => R(x, col, rx + o, ry + 6, 5, 5));
    R(x, '#f4f4f4', rx + 6, ry + 13, 33, 6); R(x, '#8b9bb4', rx + 8, ry + 15, 20, 1);
    desk(x, rx + 6, ry + 24, 58, '#8b5a2b');
    lcd(x, rx + 9, ry + 13, '#3b5dc9'); lcd(x, rx + 24, ry + 13, '#b13e53'); laptop(x, rx + 40, ry + 15, '#27324f');
    R(x, '#262b44', rx + 55, ry + 21, 6, 3); for (let i = 0; i < 4; i++) R(x, i % 2 ? '#f4f4f4' : '#e3d1a5', rx + 8 + i, ry + 22 - i, 9, 1);
    seg(x, '#262b44', rx + 70, ry + 34, rx + 73, ry + 18, 1); seg(x, '#262b44', rx + 76, ry + 34, rx + 73, ry + 18, 1); R(x, '#262b44', rx + 70, ry + 14, 7, 5); R(x, '#73eff7', rx + 76, ry + 15, 2, 2);
    R(x, '#6a4320', rx + 84, ry + 28, 24, 2); R(x, '#6a4320', rx + 85, ry + 30, 1, 4); R(x, '#6a4320', rx + 106, ry + 30, 1, 4);
    person(x, rx + 87, ry + 17, { c: '#ef7d57', h: '#3a2f2a', f: -1, t: 11 }); person(x, rx + 98, ry + 17, { c: '#41a6f6', f: -1, t: 11 });
    plant(x, rx + 64, ry + 34, 1);
    lights.push({ x: 104 + 34 + 20, y: ry + 17, g: 'cool', always: 1, flicker: 15 });
    hot.push({ x: 104 + 34 + 82, y: ry, w: 30, h: rh, say: 'Two candidates waiting for an interview. He was barely out of college and running the hiring too.' });
  }
  const l0 = lamp(x, c(70), B, 58); lights.push({ x: l0.x + PX0, y: l0.y, g: 'warm' });
  const l1 = lamp(x, c(420), B, 58); lights.push({ x: l1.x + PX0, y: l1.y, g: 'warm' });
  ground(x, play.w, B, LH, r, 'city');

  const TROP = ['#3f8fd0', '#8cc4e8', '#d6e8d8', '#fbe9c0'];
  return {
    id: 'kerala', len: 520, title: 'CHAPTER 3 - KERALA - 2018',
    layers: [{ c: far.c, f: 0.1, haze: 0.4, sink: 4, pad: 0, water: 1 }, { c: mid.c, f: 0.3, haze: 0.36, sink: -6, pad: 10 }, { c: back.c, f: 0.55, haze: 0.16, sink: 0, pad: 20 }],
    play: { c: play.c, x0: PX0, F, B }, fg: { c: foreground(1800, 18, '#12241f', '#2f5a4a', false), f: 1.32 },
    lights, hot, perches: [], steam: [], coins: [[60, 14], [330, 14], [400, 54]],
    u: (lx) => clamp(lx / 520, 0, 1),
    // A bright afternoon that burns down to dusk and then night.
    mood(u) {
      const q = Math.round(u * 60) / 60, night = clamp((u - 0.62) / 0.38, 0, 1);
      return {
        sky: [0, 1, 2, 3].map((i) => kf([[0, TROP[i]], [0.45, TROP[i]], [0.72, DUSK[i]], [1, NIGHT[i]]], q)),
        amb: night > 0 ? ['#1a1c4a', 0.4 * night] : ['#ff9648', 0.1 * clamp((u - 0.4) / 0.3, 0, 1)], lamp: clamp((u - 0.5) / 0.3, 0, 1), stars: night, pink: clamp(1 - Math.abs(u - 0.72) / 0.2, 0, 1), grey: 0,
        sun: kf([[0, 0.7], [0.7, 0.04], [1, 0]], u), sunA: 0.8 * (1 - night), rain: 0, glit: 0.6 * (1 - night), night,
        rim: night > 0.5 ? ['#9fb4ff', 0.3] : ['#ffd9a8', 0.3],
      };
    },
    stations: {
      job: { x: 199, bot: B - 78, tags: [['DESIGN', '#ffcd75'], ['VIDEO', '#f6757a'], ['DIGITAL', '#73eff7'], ['SEO + WEB', '#a7f070'], ['BRAND', '#c9a0ff'], ['HIRING', '#41a6f6']], items: [{ at: 2.3, s: 'ONE PERSON, TEN MONTHS', col: '#f4f4f4' }] },
    },
  };
}
