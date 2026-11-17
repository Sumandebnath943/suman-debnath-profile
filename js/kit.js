/* Career Mode — pixel kit.
   Every sprite on the page is drawn here in code: no image files, no sprite sheets. */

export const INK = '#181425';

export const mk = (w, h) => {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  return { c, x, w: c.width, h: c.height };
};

// Small seeded random generator, so the city looks the same on every visit.
export const rng = (s) => () => {
  s |= 0; s = (s + 0x6D2B79F5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const R = (x, c, X, Y, W = 1, H = 1) => {
  x.fillStyle = c;
  x.fillRect(Math.round(X), Math.round(Y), Math.round(W), Math.round(H));
};

export const rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const mix = (a, b, t) => {
  const A = rgb(a), B = rgb(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
};

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const ease = (t) => t * t * (3 - 2 * t);
export const out3 = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
export const commas = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// Blend along a list of [position, value] keyframes. Values are numbers or hex colours.
export const kf = (frames, u) => {
  if (u <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    if (u <= frames[i][0]) {
      const [a0, v0] = frames[i - 1], [a1, v1] = frames[i], k = (u - a0) / (a1 - a0 || 1);
      return typeof v0 === 'number' ? v0 + (v1 - v0) * k : mix(v0, v1, k);
    }
  }
  return frames[frames.length - 1][1];
};

export const disc = (x, c, cx, cy, r) => {
  x.fillStyle = c;
  for (let y = -r; y <= r; y++) {
    const w = Math.floor(Math.sqrt(r * r - y * y) + 0.35);
    x.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1);
  }
};

// Pixel line with a square brush (Bresenham).
export const seg = (x, c, x0, y0, x1, y1, w = 1) => {
  x.fillStyle = c;
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  const o = Math.floor((w - 1) / 2);
  let e = dx + dy;
  for (;;) {
    x.fillRect(x0 - o, y0 - o, w, w);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) { e += dy; x0 += sx; }
    if (e2 <= dx) { e += dx; y0 += sy; }
  }
};

export const grid = (x, rows, pal, X, Y) => {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const k = row[i];
      if (k !== '.' && pal[k]) R(x, pal[k], X + i, Y + j);
    }
  });
};

// Tint only the pixels that are already drawn.
export const tint = (x, w, h, color, a) => {
  if (a <= 0) return;
  x.save();
  x.globalCompositeOperation = 'source-atop';
  x.globalAlpha = Math.min(1, a);
  x.fillStyle = color;
  x.fillRect(0, 0, w, h);
  x.restore();
};

// One-pixel outline around any sprite. Returns a canvas 2px larger than the source.
export const outlined = (src, color = INK) => {
  const o = mk(src.width + 2, src.height + 2), s = mk(src.width, src.height);
  s.x.drawImage(src, 0, 0);
  s.x.globalCompositeOperation = 'source-in';
  R(s.x, color, 0, 0, s.w, s.h);
  [[0, 1], [2, 1], [1, 0], [1, 2]].forEach(([a, b]) => o.x.drawImage(s.c, a, b));
  o.x.drawImage(src, 1, 1);
  return o;
};

export const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

// Soft light, kept pixel-honest: four dithered rings instead of a smooth gradient.
export const glow = (r, color, strength = 0.6) => {
  const g = mk(r * 2 + 1, r * 2 + 1), [cr, cg, cb] = rgb(color);
  const id = g.x.createImageData(g.w, g.h);
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    const d = Math.hypot(x - r, y - r) / r;
    const a = d >= 1 ? 0 : (1 - d) * (1 - d);
    const q = Math.min(1, Math.floor(a * 5 + (B4[(x & 3) + ((y & 3) << 2)] + 0.5) / 16) / 5);
    const i = (y * g.w + x) * 4;
    id.data[i] = cr; id.data[i + 1] = cg; id.data[i + 2] = cb; id.data[i + 3] = q * 255 * strength;
  }
  g.x.putImageData(id, 0, 0);
  return g.c;
};

/* ───────── 5×7 bitmap font, for every word painted inside the world ───────── */
const F = {
  A: [14, 17, 17, 31, 17, 17, 17], B: [30, 17, 17, 30, 17, 17, 30], C: [14, 17, 16, 16, 16, 17, 14], D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31], F: [31, 16, 16, 30, 16, 16, 16], G: [14, 17, 16, 23, 17, 17, 15], H: [17, 17, 17, 31, 17, 17, 17],
  I: [14, 4, 4, 4, 4, 4, 14], J: [7, 2, 2, 2, 2, 18, 12], K: [17, 18, 20, 24, 20, 18, 17], L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17], N: [17, 25, 21, 19, 17, 17, 17], O: [14, 17, 17, 17, 17, 17, 14], P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13], R: [30, 17, 17, 30, 20, 18, 17], S: [15, 16, 16, 14, 1, 1, 30], T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14], V: [17, 17, 17, 17, 17, 10, 4], W: [17, 17, 17, 21, 21, 21, 10], X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4], Z: [31, 1, 2, 4, 8, 16, 31],
  0: [14, 17, 19, 21, 25, 17, 14], 1: [4, 12, 4, 4, 4, 4, 14], 2: [14, 17, 1, 2, 4, 8, 31], 3: [31, 2, 4, 2, 1, 17, 14],
  4: [2, 6, 10, 18, 31, 2, 2], 5: [31, 16, 30, 1, 1, 17, 14], 6: [6, 8, 16, 30, 17, 17, 14], 7: [31, 1, 2, 4, 8, 8, 8],
  8: [14, 17, 17, 14, 17, 17, 14], 9: [14, 17, 17, 15, 1, 2, 12],
  '.': [0, 0, 0, 0, 0, 12, 12], ',': [0, 0, 0, 0, 12, 4, 8], '!': [4, 4, 4, 4, 4, 0, 4], '?': [14, 17, 1, 2, 4, 0, 4],
  '+': [0, 4, 4, 31, 4, 4, 0], '-': [0, 0, 0, 31, 0, 0, 0], ':': [0, 12, 12, 0, 12, 12, 0], '/': [1, 1, 2, 4, 8, 16, 16],
  "'": [4, 4, 8, 0, 0, 0, 0], '%': [24, 25, 2, 4, 8, 19, 3], '&': [8, 20, 20, 8, 21, 18, 13],
  '$': [4, 15, 20, 14, 5, 30, 4], '=': [0, 0, 31, 0, 31, 0, 0], '"': [10, 10, 0, 0, 0, 0, 0],
  '>': [0, 4, 2, 31, 2, 4, 0], '<': [0, 4, 8, 31, 8, 4, 0], '*': [4, 4, 31, 14, 14, 27, 17],
};

export const textW = (s, sc = 1) => (String(s).length * 6 - 1) * sc;
export const text = (x, s, X, Y, c, sc = 1) => {
  x.fillStyle = c;
  s = String(s).toUpperCase(); X = Math.round(X); Y = Math.round(Y);
  for (let i = 0; i < s.length; i++) {
    const g = F[s[i]];
    if (!g) continue;
    for (let r = 0; r < 7; r++) for (let b = 0; b < 5; b++) {
      if ((g[r] >> (4 - b)) & 1) x.fillRect(X + (i * 6 + b) * sc, Y + r * sc, sc, sc);
    }
  }
};
// Bengali lettering for signboards. The bitmap font above is Latin only, so Bengali is set in a real
// font, then every pixel is snapped to fully on or off, so it sits in the pixel art without blur.
export const bnText = (s, px, color, family = '"Hind Siliguri", "Noto Sans Bengali", "Nirmala UI", sans-serif', weight = 700) => {
  const probe = mk(4, 4).x;
  probe.font = `${weight} ${px}px ${family}`;
  const w = Math.ceil(probe.measureText(s).width) + 4, h = Math.ceil(px * 1.7);
  const o = mk(w, h);
  o.x.font = probe.font; o.x.textBaseline = 'alphabetic'; o.x.fillStyle = '#000';
  o.x.fillText(s, 2, Math.round(px * 1.18));
  const id = o.x.getImageData(0, 0, o.w, o.h), d = id.data, [r, g, b] = rgb(color);
  let top = o.h, bottom = 0;
  for (let i = 0; i < d.length; i += 4) {
    const on = d[i + 3] >= 118;
    d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = on ? 255 : 0;
    if (on) { const y = (i / 4 / o.w) | 0; top = Math.min(top, y); bottom = Math.max(bottom, y); }
  }
  o.x.putImageData(id, 0, 0);
  const t = mk(o.w, Math.max(1, bottom - top + 1));       // trimmed to the ink, so it centres on a board
  t.x.drawImage(o.c, 0, -top);
  return t;
};

// Text with a dark outline, readable on any background.
export const label = (x, s, X, Y, c, sc = 1, o = INK) => {
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (a || b) text(x, s, X + a, Y + b, o, sc);
  text(x, s, X, Y + 1 + (sc > 1 ? 1 : 0), o, sc);
  text(x, s, X, Y, c, sc);
};

// A dark plate with a coloured underline: the big numbers that appear on buildings.
export const plate = (x, s, cx, y, col, sc = 1) => {
  const w = textW(s, sc) + 8, h = 7 * sc + 6, X = Math.round(cx - w / 2);
  y = Math.round(y);
  R(x, INK, X, y, w, h); R(x, INK, X + 1, y - 1, w - 2, h + 2);
  R(x, col, X + 1, y + h - 1, w - 2, 1);
  text(x, s, X + 4, y + 3, col, sc);
  return h;
};

// A blue "System" window, as in the dungeon stories this chapter borrows from. The title reads SHISUTEMU.
const KANA = [
  ['.......', '#.....#', '.#....#', '#....#.', '.#..#..', '...#...', '.##....'],
  ['######.', '.....#.', '....#..', '...#...', '..#.#..', '.#...#.', '#.....#'],
  ['.#####.', '.......', '#######', '...#...', '...#...', '..#....', '.#.....'],
  ['...#...', '..#....', '..#....', '.#.....', '.#..#..', '#....#.', '#######'],
];
export const sysBox = (x, rows, cx, y, W, t) => {
  const w = Math.max(54, ...rows.map((r) => textW(r.s, r.sc))) + 14, h = 16 + rows.reduce((a, r) => a + 7 * r.sc + 3, 0);
  const X = Math.round(clamp(cx - w / 2, 3, W - w - 3)); y = Math.round(y);
  x.globalAlpha = 0.9; R(x, '#0e1a3e', X, y, w, h);
  x.globalAlpha = 0.5 + 0.1 * Math.sin(t * 5); R(x, '#16306e', X + 1, y + 1, w - 2, 10);
  x.globalAlpha = 1;
  R(x, '#73eff7', X + 1, y - 1, w - 2, 1); R(x, '#73eff7', X + 1, y + h, w - 2, 1); R(x, '#73eff7', X - 1, y + 1, 1, h - 2); R(x, '#73eff7', X + w, y + 1, 1, h - 2);
  R(x, '#73eff7', X, y, 1, 1); R(x, '#73eff7', X + w - 1, y, 1, 1); R(x, '#73eff7', X, y + h - 1, 1, 1); R(x, '#73eff7', X + w - 1, y + h - 1, 1, 1);
  R(x, '#3b5dc9', X + 1, y + 11, w - 2, 1);
  KANA.forEach((g, i) => g.forEach((row, j) => { for (let k = 0; k < 7; k++) if (row[k] === '#') R(x, '#73eff7', X + 5 + i * 9 + k, y + 2 + j, 1, 1); }));
  R(x, '#73eff7', X + w - 8, y + 4, 3, 3); R(x, '#3b5dc9', X + w - 13, y + 4, 3, 3);
  let yy = y + 15;
  rows.forEach((r) => { x.globalAlpha = r.k; text(x, r.s, X + 7, yy, r.col, r.sc); yy += 7 * r.sc + 3; });
  x.globalAlpha = 1;
  return h;
};

// The title, as a game logo: banded gold fill, dark outline, plum drop shadow.
export const logo = (word = 'CAREER MODE', sc = 3) => {
  const w = textW(word, sc), h = 7 * sc, L = mk(w + 8, h + 9), T = mk(w, h);
  text(T.x, word, 0, 0, '#fff6c9', sc);
  T.x.globalCompositeOperation = 'source-atop';
  R(T.x, '#ffe08a', 0, sc * 2, w, sc * 2);
  R(T.x, '#ffb84a', 0, sc * 4, w, sc * 2);
  R(T.x, '#ef7d57', 0, sc * 6, w, sc);
  text(L.x, word, 6, 7, '#5d275d', sc);
  text(L.x, word, 5, 6, '#5d275d', sc);
  for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) if (Math.abs(a) + Math.abs(b) < 4) text(L.x, word, 3 + a, 3 + b, INK, sc);
  L.x.drawImage(T.c, 3, 3);
  return L.c;
};

/* ───────── Suman ─────────
   The head and torso are hand-placed pixels. The limbs are a small rig: two-bone
   legs with inverse kinematics and swinging arms, snapped to eight frames. */
const SKIN = { s: '#c8834a', S: '#9c5b35', l: '#e2a468', e: INK, m: '#7a3f38' };
const PAL_A = {
  ...SKIN, h: '#262b44', H: '#434c74', b: '#2a2a40', B: '#474160',
  j: '#2b3a78', J: '#4a63c0', k: '#1d2552', t: '#ef7d57', T: '#c8553f', p: '#3e4a66',
  arm: '#35488f', fore: '#35488f', edge: '#1d2552', hand: '#c8834a',
  armD: '#1d2552', foreD: '#1d2552', handD: '#9c5b35',
  leg: '#5a6988', legD: '#3e4a66', shoe: '#eef2f8', shoeD: '#b5c1d6',
};
const PAL_T = {
  ...SKIN, h: '#262b44', H: '#434c74',
  j: '#e8edf4', J: '#ffffff', k: '#b5c1d6', t: '#2b3a78', T: '#1d2552', p: '#1d2552',
  arm: '#f4f7fb', fore: '#c8834a', edge: '#b5c1d6', hand: '#c8834a',
  armD: '#b5c1d6', foreD: '#9c5b35', handD: '#9c5b35',
  leg: '#2b3a78', legD: '#1d2552', shoe: '#262b44', shoeD: '#181425',
};
const HEAD_A = [
  '.....hhhhhh..',
  '...hhhHHHHhh.',
  '..hhhHHhhhhhh',
  '.hhhhhhhhhhhh',
  '.hhhhhsssssl.',
  '.hhhhsSSsSSs.',
  '.hhhSssessel.',
  '.hhbSssessel.',
  '..bbbsssssSl.',
  '..bbbbbbBBBb.',
  '...bbbbbmmb..',
  '....bbbbbb...',
];
const HEAD_T = [
  '.....hhhhhh..',
  '...hhhHHHHhh.',
  '..hhhHHhhhhhh',
  '.hhhhhhhhhhhh',
  '.hhhhhhhhsss.',
  '.hhhhsSSsSSl.',
  '.hhhSssessel.',
  '.hhSsssessel.',
  '..SsssssssSl.',
  '..Ssssssssss.',
  '...SsssmmsS..',
  '....Ssssss...',
];
const PAL_S = {
  ...SKIN, h: '#262b44', H: '#434c74',
  j: '#257179', J: '#3aa39a', k: '#17494f', t: '#f4f4f4', T: '#c0cbdc', p: '#262b44',
  arm: '#2f8a8c', fore: '#2f8a8c', edge: '#17494f', hand: '#c8834a',
  armD: '#17494f', foreD: '#17494f', handD: '#9c5b35',
  leg: '#3f4d78', legD: '#2a3352', shoe: '#eef2f8', shoeD: '#b5c1d6',
};
const HEAD_S = [
  '.....hhhhhh..',
  '...hhhHHHHhh.',
  '..hhhHHhhhhhh',
  '.hhhhhhhhhhhh',
  '.hhhhhhsssss.',
  '.hhhhsSSsSSl.',
  '.hhhSssessel.',
  '.hhSSssessel.',
  '..SSsssssSSl.',
  '..SSSssSSSSs.',
  '...SSSssmmS..',
  '....SSSSSS...',
];
const TORSO = [
  '...jsssj..',
  '.jjjjjttJ.',
  'kjjjjjttJj',
  'kjjjjjttJj',
  'kjjjjjttJj',
  'kjjjjjttJj',
  'kjjjjjTtJj',
  'kjjjjjTTJj',
  '.kjjjjjjj.',
  '..pppppp..',
];

const VARIANTS = {
  adult: { pal: PAL_A, head: HEAD_A, L1: 7, L2: 6, lift: 4 },
  teen: { pal: PAL_T, head: HEAD_T, L1: 6, L2: 5, lift: 3, bag: 'back' },
  student: { pal: PAL_S, head: HEAD_S, L1: 7, L2: 6, lift: 4, bag: 'sling' },
};

export function makeHero() {
  const A = mk(48, 56), E = mk(48, 56), O = mk(50, 58), S = mk(48, 56);

  const leg = (x, col, hx, hy, tx, ty, L1, L2, shoe) => {
    const dx = tx - hx, dy = ty - hy, d = Math.min(Math.hypot(dx, dy), L1 + L2 - 0.01);
    const a = Math.atan2(dy, dx);
    const k = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    const kx = hx + Math.cos(a - k) * L1, ky = hy + Math.sin(a - k) * L1;
    const ax = hx + Math.cos(a) * d, ay = hy + Math.sin(a) * d;
    seg(x, col, hx, hy, kx, ky, 3);
    seg(x, col, kx, ky, ax, ay, 3);
    const fx = Math.round(ax), fy = Math.round(ay);
    R(x, shoe, fx - 1, fy, 4, 1);
    R(x, shoe, fx - 1, fy + 1, 5, 1);
  };
  const arm = (x, up, fore, hand, sx, sy, a1, a2, edge) => {
    const ex = sx + Math.sin(a1) * 4, ey = sy + Math.cos(a1) * 4;
    const hx = ex + Math.sin(a2) * 4, hy = ey + Math.cos(a2) * 4;
    if (edge) { seg(x, edge, sx - 1, sy, ex - 1, ey, 2); seg(x, edge, ex - 1, ey, hx - 1, hy, 2); }
    seg(x, up, sx, sy, ex, ey, 2);
    seg(x, fore, ex, ey, hx, hy, 2);
    R(x, hand, Math.round(hx), Math.round(hy), 2, 2);
  };

  /* st: { variant, mode: 'idle'|'walk'|'jump', phase, t, facing, blink, run, rim: {color, a, dir} } */
  return (ctx, X, Y, st) => {
    const V = VARIANTS[st.variant] || VARIANTS.adult, P = V.pal, HD = V.head, teen = V.bag === 'back', sling = V.bag === 'sling';
    const L1 = V.L1, L2 = V.L2, s = st.run ? 5 : 4, lift = V.lift, gy = 48, hx = 24;
    const walking = st.mode === 'walk', air = st.mode === 'jump';
    const p = walking ? Math.round(st.phase * 8) / 8 : 0;
    const c2 = Math.cos(2 * Math.PI * p);
    const bob = walking ? Math.round(Math.abs(c2)) : 0;
    const breathe = st.mode === 'idle' && Math.sin(st.t * 2.2) > 0.2 ? 1 : 0;
    const hy = gy - (L1 + L2) + 0.6 + bob;
    const x = A.x;
    x.clearRect(0, 0, 48, 56);

    const foot = (ph) => {
      ph = ((ph % 1) + 1) % 1;
      if (ph < 0.5) return [hx + s * (1 - 4 * ph), gy];
      const u = (ph - 0.5) * 2;
      return [hx - s + 2 * s * u, gy - lift * Math.sin(Math.PI * u)];
    };
    let fF, fB, aF, bF, aB, bB;
    if (air) { fF = [hx + 3, gy - 6]; fB = [hx - 3, gy - 3]; aF = 2.3; bF = 2.7; aB = -1.0; bB = -0.6; }
    else if (walking) {
      fF = foot(p); fB = foot(p + 0.5);
      const sw = c2 * (st.run ? 0.95 : 0.6);
      aF = -sw; bF = aF + 0.45; aB = sw; bB = aB + 0.45;
    } else { fF = [hx + 2, gy]; fB = [hx - 1, gy]; aF = 0.06; bF = 0.2; aB = -0.06; bB = 0.12; }

    const ty = Math.round(hy) - 9 - breathe, sy = ty + 2, lean = st.run && walking ? 1 : 0;
    arm(x, P.armD, P.foreD, P.handD, hx + 1 + lean, sy, aB, bB);
    leg(x, P.legD, hx - 1, hy, fB[0] - 1, fB[1], L1, L2, P.shoeD);
    leg(x, P.leg, hx + 1, hy, fF[0] + 1, fF[1], L1, L2, P.shoe);
    if (teen) { R(x, '#b13e53', hx - 8 + lean, ty + 1, 4, 7); R(x, '#7a2a3c', hx - 8 + lean, ty + 1, 1, 7); R(x, '#d9606f', hx - 7 + lean, ty + 1, 3, 1); }
    if (sling) { R(x, '#6a4320', hx - 8 + lean, ty + 5, 4, 5); R(x, '#8b5a2b', hx - 7 + lean, ty + 5, 3, 1); }
    grid(x, TORSO, P, hx - 5 + lean, ty);
    if (teen) R(x, '#b13e53', hx + lean, ty + 1, 1, 5);
    if (sling) seg(x, '#6a4320', hx + 3 + lean, ty + 1, hx - 4 + lean, ty + 7, 1);
    const hY = ty - 11, hX = hx - 6 + lean * 2;
    grid(x, HD, P, hX, hY);
    if (st.blink) { R(x, P.s, hX + 7, hY + 6); R(x, P.s, hX + 10, hY + 6); }
    arm(x, P.arm, P.fore, P.hand, hx - 2 + lean, sy, aF, bF, P.edge);

    // Rim light on the side that faces the sun.
    if (st.rim && st.rim.a > 0) {
      const dir = st.rim.dir * (st.facing < 0 ? -1 : 1);
      E.x.globalCompositeOperation = 'source-over';
      E.x.clearRect(0, 0, 48, 56);
      E.x.drawImage(A.c, 0, 0);
      E.x.globalCompositeOperation = 'destination-out';
      E.x.drawImage(A.c, -dir, 0);
      E.x.globalCompositeOperation = 'source-in';
      R(E.x, st.rim.color, 0, 0, 48, 56);
      x.globalAlpha = st.rim.a;
      x.drawImage(E.c, 0, 0);
      x.globalAlpha = 1;
    }

    // Outline.
    S.x.globalCompositeOperation = 'source-over';
    S.x.clearRect(0, 0, 48, 56);
    S.x.drawImage(A.c, 0, 0);
    S.x.globalCompositeOperation = 'source-in';
    R(S.x, INK, 0, 0, 48, 56);
    O.x.clearRect(0, 0, 50, 58);
    [[0, 1], [2, 1], [1, 0], [1, 2]].forEach(([a, b]) => O.x.drawImage(S.c, a, b));
    O.x.drawImage(A.c, 1, 1);

    ctx.save();
    ctx.translate(Math.round(X), Math.round(Y));
    if (st.facing < 0) ctx.scale(-1, 1);
    ctx.drawImage(O.c, -25, -51);
    ctx.restore();
  };
}

/* ───────── MIGI, agent 46 of 46 ───────── */
const MIGI_ROWS = [
  '.......yy.......',
  '.......yy.......',
  '.......aa.......',
  '..cccccccccccc..',
  '.cCCCCCCCCCCCCg.',
  '.cCddddddddddCg.',
  '.cCddddddddddCg.',
  '.cCddddddddddCg.',
  '.cCddddddddddCg.',
  '.cCddddddddddCg.',
  '.cCCCCCCCCCCCCg.',
  '..gggggggggggg..',
  '.....aCCCCa.....',
  '..a.cCCrrCCg.a..',
  '..aacCCrrCCgaa..',
  '....cCCCCCCg....',
  '.....gggggg.....',
];
const MIGI_PAL = { y: '#ffcd75', a: '#5a6988', c: '#f4f7fb', C: '#c0cbdc', g: '#8b9bb4', d: '#16213a', r: '#e43b44' };

export function makeMigi() {
  const base = mk(16, 21), M = mk(18, 23), S = mk(16, 21);
  /* st: { t, face: 'idle'|'blink'|'happy'|'smug'|'talk'|'wow', facing, holo } */
  return (ctx, X, Y, st) => {
    const x = base.x, f = st.face, cy = '#73eff7', hi = '#d9fdff';
    x.globalAlpha = 1;
    x.clearRect(0, 0, 16, 21);
    grid(x, MIGI_ROWS, MIGI_PAL, 0, 0);
    R(x, '#243457', 3, 5, 10, 1);                                   // screen reflection
    if (st.pulse) { R(x, '#fff6c9', 7, 0, 2, 2); }
    const sh = st.facing < 0 ? -1 : 1, l = 5 + sh, r = 9 + sh;
    if (f === 'blink') { R(x, cy, l, 7, 2, 1); R(x, cy, r, 7, 2, 1); }
    else if (f === 'happy') { [l, r].forEach((e) => { R(x, cy, e - 1, 7); R(x, cy, e, 6, 2, 1); R(x, cy, e + 2, 7); }); }
    else if (f === 'smug') { R(x, cy, l, 7, 2, 1); R(x, cy, r, 6, 2, 2); R(x, hi, r, 6); }
    else if (f === 'wow') { R(x, cy, l, 5, 2, 3); R(x, cy, r, 5, 2, 3); R(x, hi, l, 5); R(x, hi, r, 5); }
    else { R(x, cy, l, 6, 2, 2); R(x, cy, r, 6, 2, 2); R(x, hi, l, 6); R(x, hi, r, 6); }
    if (f === 'talk' && Math.floor(st.t * 9) % 2) R(x, cy, 7, 9, 2, 1);
    else if (f === 'happy' || f === 'smug') R(x, cy, 7, 9, 2, 1);
    const fl = Math.floor(st.t * 14) % 3;                            // ion thrusters
    [5, 9].forEach((c, i) => {
      R(x, '#73eff7', c, 17, 2, 1);
      R(x, '#41a6f6', c, 18, 2, (fl + i) % 3 === 0 ? 2 : 1);
      if ((fl + i) % 3 === 1) R(x, '#3b5dc9', c + (i ? 1 : 0), 20, 1, 1);
    });

    S.x.globalCompositeOperation = 'source-over';
    S.x.clearRect(0, 0, 16, 21);
    S.x.drawImage(base.c, 0, 0, 16, 17, 0, 0, 16, 17);
    S.x.globalCompositeOperation = 'source-in';
    R(S.x, INK, 0, 0, 16, 21);
    M.x.globalCompositeOperation = 'source-over';
    M.x.globalAlpha = 1;
    M.x.clearRect(0, 0, 18, 23);
    [[0, 1], [2, 1], [1, 0], [1, 2]].forEach(([a, b]) => M.x.drawImage(S.c, a, b));
    M.x.drawImage(base.c, 1, 1);
    if (st.holo) {                                                  // a projection: scan lines and a cyan cast
      M.x.globalCompositeOperation = 'source-atop';
      M.x.globalAlpha = 0.34; R(M.x, '#73eff7', 0, 0, 18, 23);
      M.x.globalCompositeOperation = 'destination-out';
      M.x.globalAlpha = 0.5;
      const o = Math.floor(st.t * 6) % 3;
      for (let y = o; y < 23; y += 3) R(M.x, '#000', 0, y, 18, 1);
      M.x.globalAlpha = 1;
      M.x.globalCompositeOperation = 'source-over';
    }
    ctx.save();
    ctx.globalAlpha = st.holo ? 0.86 : 1;
    ctx.translate(Math.round(X), Math.round(Y));
    if (st.facing < 0) ctx.scale(-1, 1);
    ctx.drawImage(M.c, -9, -12);
    ctx.restore();
  };
}

/* ───────── small things ───────── */
export const coinFrames = (() => {
  let cache;
  return () => {
    if (cache) return cache;
    cache = [8, 6, 2, 6].map((w, i) => {
      const o = mk(8, 8), l = (8 - w) >> 1;
      disc(o.x, '#ffcd75', 3.5, 3.5, 3.5);
      o.x.clearRect(0, 0, l, 8); o.x.clearRect(l + w, 0, 8, 8);
      if (w > 2) {
        R(o.x, '#fff6c9', l + 1, 1, 1, 3); R(o.x, '#e8963c', l + w - 2, 4, 1, 3);
        if (w > 4) R(o.x, i === 0 ? '#e8963c' : '#ffe08a', l + (w >> 1) - 1, 2, 2, 4);
      } else R(o.x, '#fff6c9', l, 1, 1, 6);
      return outlined(o.c, '#8a4b1c').c;
    });
    return cache;
  };
})();

export const crow = (x, X, Y, flap, c = '#262b44') => {
  R(x, c, X, Y, 3, 1); R(x, c, X + 3, Y, 1, 1);
  if (flap) { R(x, c, X + 1, Y - 1, 1, 1); R(x, c, X, Y - 2, 1, 1); }
  else { R(x, c, X + 1, Y + 1, 1, 1); R(x, c, X, Y + 2, 1, 1); }
};
