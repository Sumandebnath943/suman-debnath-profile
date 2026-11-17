/* Career Mode — shared scenery pieces: sky, clouds, buildings, street furniture.
   Each chapter bakes its own layers out of these. */
import { mk, rng, R, mix, disc, seg, text, textW, B4, rgb } from './kit.js';
export { rng };

export const DK = '#2a2338';
export const BLD = {
  ochre: { b: '#d9a441', l: '#f2cb6c', d: '#a9722f' },
  rose: { b: '#c96a5b', l: '#e59079', d: '#93463f' },
  blue: { b: '#7fa7ba', l: '#aacbd8', d: '#557789' },
  cream: { b: '#e3d1a5', l: '#f5eac8', d: '#b79f70' },
  mint: { b: '#8fb99b', l: '#b6d6ba', d: '#5d8a6d' },
  brick: { b: '#a8443a', l: '#cc6248', d: '#712c2c' },
  grey: { b: '#8b93a8', l: '#aeb6c8', d: '#626a80' },
};
export const SH = { b: '#2f6b4f', l: '#4d9c6c', d: '#1f4636' };
export const CLOTH = ['#ef7d57', '#f4f4f4', '#41a6f6', '#ffcd75', '#b13e53', '#a7f070'];

/* ───────── sky ───────── */
const STOPS = [0, 0.46, 0.82, 1];

// Paints a banded, dithered sky and returns the colour at the horizon (used for haze).
export function paintSky(x, W, H, horizon, sky) {
  const cols = sky.map(rgb);
  const N = 22, bands = [];
  for (let i = 0; i < N; i++) {
    const v = i / (N - 1);
    let k = 0;
    while (k < STOPS.length - 2 && v > STOPS[k + 1]) k++;
    const u = (v - STOPS[k]) / (STOPS[k + 1] - STOPS[k]);
    bands.push(cols[k].map((c, j) => Math.round(c + (cols[k + 1][j] - c) * u)));
  }
  const id = x.createImageData(W, H), d = id.data, hz = bands[N - 1];
  for (let y = 0; y < H; y++) {
    const v = Math.min(1, y / Math.max(1, horizon));
    for (let px = 0; px < W; px++) {
      const b = y >= horizon ? hz : bands[Math.min(N - 1, Math.floor(v * (N - 1) + (B4[(px & 3) + ((y & 3) << 2)] + 0.5) / 16))];
      const i = (y * W + px) * 4;
      d[i] = b[0]; d[i + 1] = b[1]; d[i + 2] = b[2]; d[i + 3] = 255;
    }
  }
  x.putImageData(id, 0, 0);
  return '#' + hz.map((c) => c.toString(16).padStart(2, '0')).join('');
}

export function cloud(seed, w, light, mid, dark) {
  const r = rng(seed), h = Math.max(6, Math.round(w * 0.36)), o = mk(w, h);
  const n = 5 + Math.floor(r() * 4);
  for (let i = 0; i < n; i++) {
    const rr = Math.max(2, Math.round(h * (0.22 + r() * 0.24)));
    disc(o.x, light, w * 0.16 + r() * w * 0.68, h - rr - 1 - r() * h * 0.12, rr);
  }
  R(o.x, light, w * 0.08, h - Math.round(h * 0.3), w * 0.84, Math.round(h * 0.3));
  o.x.globalCompositeOperation = 'source-atop';
  R(o.x, mid, 0, h - Math.round(h * 0.42), w, h);
  R(o.x, dark, 0, h - Math.max(2, Math.round(h * 0.2)), w, h);
  return o.c;
}

/* ───────── building blocks ───────── */
export function facade(x, X, baseY, w, h, p, r) {
  R(x, p.b, X, baseY - h, w, h);
  R(x, p.d, X, baseY - h, 2, h);
  R(x, p.l, X + w - 1, baseY - h, 1, h);
  R(x, p.l, X - 1, baseY - h - 2, w + 2, 2);
  R(x, p.d, X, baseY - h, w, 1);
  x.globalAlpha = 0.22;
  for (let i = 0; i < w / 8; i++) R(x, p.d, X + 3 + r() * (w - 6), baseY - h + 1, 1, 4 + r() * 16);
  x.globalAlpha = 1;
  R(x, p.d, X, baseY - 2, w, 2);
}

export function win(x, X, Y, w, h, kind) {
  R(x, DK, X - 1, Y - 1, w + 2, h + 2);
  const m = X + (w >> 1);
  if (kind === 'lit') { R(x, '#ffd27a', X, Y, w, h); R(x, '#fff1b8', X, Y, w, Math.max(1, h >> 2)); }
  else if (kind === 'gl') { R(x, '#27324f', X, Y, w, h); R(x, '#4a6a9a', X + 1, Y + 1, 1, Math.max(1, h >> 1)); }
  else {
    R(x, SH.b, X, Y, w, h);
    for (let j = 1; j < h; j += 2) R(x, SH.d, X, Y + j, w, 1);
    R(x, SH.l, X, Y, w, 1);
  }
  if (w >= 4) R(x, DK, m, Y, 1, h);
  R(x, 'rgba(255,255,255,.28)', X - 1, Y + h + 1, w + 2, 1);
}

export function roofStuff(x, X, top, w, r, big) {
  if (r() < 0.6) { const tx = X + 3 + r() * (w - 12); R(x, '#1d1f33', tx, top - 6, 6, 5); R(x, '#3a3f5c', tx, top - 6, 6, 1); R(x, '#1d1f33', tx, top - 1, 1, 1); R(x, '#1d1f33', tx + 5, top - 1, 1, 1); }
  if (r() < 0.5) { const ax = X + 4 + r() * (w - 8); R(x, DK, ax, top - 10, 1, 10); R(x, DK, ax - 2, top - 9, 5, 1); R(x, DK, ax - 1, top - 7, 3, 1); }
  if (big && w > 30 && r() < 0.5) {
    const a = X + 4, b = X + w - 5;
    R(x, DK, a, top - 6, 1, 6); R(x, DK, b, top - 6, 1, 6); R(x, DK, a, top - 5, b - a, 1);
    for (let c = a + 3; c < b - 3; c += 4 + Math.floor(r() * 3)) R(x, CLOTH[Math.floor(r() * CLOTH.length)], c, top - 4, 2, 3);
  }
  if (big && r() < 0.35) { const sx = X + w - 14; R(x, '#8b93a8', sx, top - 8, 10, 8); R(x, '#aeb6c8', sx, top - 8, 10, 1); R(x, DK, sx + 3, top - 5, 3, 5); }
}

export function palm(x, X, baseY, h, r) {
  const lean = (r() - 0.5) * 6;
  for (let i = 0; i < h; i++) R(x, i % 3 ? '#5a4632' : '#3f3024', X + Math.round(lean * (i / h) * (i / h)), baseY - i, 2, 1);
  const tx = X + Math.round(lean), ty = baseY - h;
  [[-9, 3], [-7, -2], [-3, -5], [3, -5], [8, -2], [10, 3], [-5, 5], [6, 5]].forEach(([dx, dy], i) => {
    seg(x, i % 2 ? '#2f8a50' : '#1f5a3c', tx + 1, ty, tx + 1 + dx, ty + dy, 1);
    seg(x, '#1f5a3c', tx + 1, ty + 1, tx + 1 + dx, ty + dy + 1, 1);
  });
  R(x, '#5cb85c', tx, ty - 1, 3, 1);
}

export function tree(x, X, baseY, s, r) {
  const th = Math.round(s * 0.7);
  R(x, '#4a3526', X - 1, baseY - th, 3, th); R(x, '#6a4a32', X + 1, baseY - th, 1, th);
  const cy = baseY - th - s * 0.25;
  const blobs = [];
  for (let i = 0; i < 6; i++) blobs.push([X + (r() - 0.5) * s * 1.1, cy + (r() - 0.5) * s * 0.5, s * (0.28 + r() * 0.2)]);
  blobs.forEach(([a, b, c]) => disc(x, '#1c4f38', a, b + 2, Math.round(c)));
  blobs.forEach(([a, b, c]) => disc(x, '#2b7a4a', a + 1, b, Math.round(c * 0.82)));
  blobs.forEach(([a, b, c]) => disc(x, '#4fae58', a + c * 0.3, b - c * 0.3, Math.round(c * 0.45)));
  for (let i = 0; i < s * 0.5; i++) R(x, '#a7f070', X + (r() - 0.2) * s * 0.7, cy - s * 0.2 + (r() - 0.5) * s * 0.4, 1, 1);
}

export function skyline(x, W, baseY, r, o) {
  let X = -12;
  while (X < W) {
    // Leave the riverside open, so the opening shot is sky, water and the bridge.
    if (o.gap && X + o.w[0] > o.gap[0] && X < o.gap[1]) {
      if (o.big) { palm(x, o.gap[0] + 8, baseY, 40, r); palm(x, o.gap[1] - 10, baseY, 46, r); palm(x, o.gap[1] - 22, baseY, 32, r); }
      X = o.gap[1];
      continue;
    }
    const w = Math.floor(o.w[0] + r() * (o.w[1] - o.w[0])), h = Math.floor(o.h[0] + r() * (o.h[1] - o.h[0]));
    const p = o.pals[Math.floor(r() * o.pals.length)];
    facade(x, X, baseY, w, h, p, r);
    const [ww, wh] = o.win, gx = ww + (o.big ? 6 : 3), gy = wh + (o.big ? 8 : 4);
    for (let wy = baseY - h + (o.big ? 7 : 4); wy < baseY - wh - 3; wy += gy) {
      for (let wx = X + (o.big ? 5 : 3); wx < X + w - ww - 2; wx += gx) {
        const k = r();
        win(x, wx, wy, ww, wh, k < 0.13 ? 'lit' : k < 0.45 ? 'gl' : 'sh');
      }
      if (o.big && r() < 0.5) { R(x, p.d, X + 2, wy + wh + 2, w - 4, 1); for (let bx = X + 3; bx < X + w - 3; bx += 2) R(x, DK, bx, wy + wh + 3, 1, 2); }
    }
    roofStuff(x, X, baseY - h - 2, w, r, o.big);
    X += w;
    if (r() < 0.28) { const g = 6 + Math.floor(r() * 10); if (o.big) palm(x, X + (g >> 1), baseY, 30 + r() * 26, r); X += g; }
  }
}

export function howrah(x, X, deckY, span, c) {
  const t1 = X + span * 0.26, t2 = X + span * 0.74, th = 46;
  const top = (px) => {
    if (px < t1) return deckY - 5 - (th - 5) * Math.pow((px - X) / (t1 - X), 1.7);
    if (px > t2) return deckY - 5 - (th - 5) * Math.pow((X + span - px) / (X + span - t2), 1.7);
    return deckY - th + th * 0.5 * Math.sin(Math.PI * (px - t1) / (t2 - t1));
  };
  for (let px = X; px <= X + span; px++) {
    const ty = top(px);
    R(x, c, px, ty, 1, 2);
    if ((px - X) % 6 === 0) R(x, c, px, ty, 1, deckY - ty);
  }
  for (let px = X, i = 0; px < X + span; px += 6, i++) {
    if (i % 2) seg(x, c, px, top(px) + 1, px + 6, deckY, 1); else seg(x, c, px, deckY, px + 6, top(px + 6) + 1, 1);
  }
  R(x, c, X - 30, deckY, span + 60, 3);
  [t1, t2].forEach((t) => { R(x, c, t - 2, deckY - th - 5, 5, th + 16); R(x, c, t - 3, deckY - th - 7, 7, 2); R(x, c, t - 4, deckY + 3, 9, 8); });
}

export function victoria(x, X, baseY) {
  const l = '#ece7da', m = '#cfc8b8', d = '#a79f8f';
  R(x, m, X, baseY - 16, 70, 16); R(x, l, X, baseY - 16, 70, 2);
  for (let i = 3; i < 68; i += 5) R(x, d, X + i, baseY - 12, 2, 9);
  [2, 58].forEach((o) => { R(x, m, X + o, baseY - 26, 10, 10); disc(x, l, X + o + 5, baseY - 26, 4); R(x, d, X + o + 5, baseY - 33, 1, 3); });
  R(x, m, X + 26, baseY - 30, 18, 14); R(x, l, X + 26, baseY - 30, 18, 1);
  disc(x, l, X + 35, baseY - 30, 9); x.clearRect(X + 24, baseY - 29, 22, 0);
  R(x, m, X + 26, baseY - 30, 18, 6);
  R(x, d, X + 35, baseY - 44, 1, 5); R(x, d, X + 34, baseY - 45, 3, 1);
}

/* ───────── street-level pieces ───────── */
export function crt(x, X, Y) {
  R(x, '#d8d0c0', X, Y, 15, 12); R(x, '#f0eadc', X, Y, 15, 1); R(x, '#a89f8c', X, Y + 11, 15, 1); R(x, '#a89f8c', X + 14, Y, 1, 12);
  R(x, '#1b2238', X + 2, Y + 2, 11, 8);
  R(x, '#b8ae9c', X + 5, Y + 12, 5, 2); R(x, '#a89f8c', X + 3, Y + 14, 9, 1);
  return { x: X + 2, y: Y + 2, w: 11, h: 8 };
}

export function room(x, X, Y, W, H, wall, floor) {
  R(x, DK, X - 2, Y - 2, W + 4, H + 4);
  R(x, wall, X, Y, W, H);
  R(x, mix(wall, '#000000', 0.28), X, Y, W, 3);
  R(x, mix(wall, '#000000', 0.18), X, Y, 2, H);
  R(x, mix(wall, '#ffffff', 0.08), X + W - 1, Y, 1, H);
  R(x, floor, X, Y + H - 4, W, 4); R(x, mix(floor, '#ffffff', 0.22), X, Y + H - 4, W, 1);
}

export function taxi(x, X, Y) {                       // X = left, Y = bottom of the wheels
  const b = '#ffcd3a', l = '#fff1a8', d = '#d99a22';
  R(x, 'rgba(0,0,0,.3)', X + 2, Y - 1, 46, 2);
  R(x, b, X + 1, Y - 10, 47, 7); R(x, d, X + 1, Y - 5, 47, 2);
  R(x, b, X + 3, Y - 11, 43, 1); R(x, l, X + 4, Y - 11, 40, 1);
  R(x, b, X + 13, Y - 18, 24, 8); R(x, b, X + 15, Y - 19, 20, 1); R(x, l, X + 15, Y - 19, 20, 1);
  R(x, '#27324f', X + 15, Y - 17, 9, 6); R(x, '#27324f', X + 26, Y - 17, 9, 6);
  R(x, '#6a8ab8', X + 16, Y - 16, 2, 3); R(x, '#6a8ab8', X + 27, Y - 16, 2, 3);
  R(x, '#3b5dc9', X + 1, Y - 8, 47, 1);
  R(x, DK, X + 24, Y - 11, 1, 7);
  [10, 38].forEach((o) => { disc(x, d, X + o, Y - 4, 4); disc(x, '#181425', X + o, Y - 3, 3); R(x, '#8b9bb4', X + o - 1, Y - 4, 2, 2); });
  R(x, '#c0cbdc', X, Y - 6, 2, 2); R(x, '#c0cbdc', X + 47, Y - 6, 2, 2);
  R(x, '#fff6c9', X + 46, Y - 10, 2, 2); R(x, '#b13e53', X + 1, Y - 10, 1, 2);
  R(x, '#181425', X + 21, Y - 21, 8, 2); R(x, '#ffcd3a', X + 23, Y - 21, 4, 1);
}

export function lamp(x, X, baseY, h) {
  R(x, DK, X, baseY - h, 2, h); R(x, '#4a4370', X + 1, baseY - h, 1, h);
  R(x, DK, X - 1, baseY - 3, 4, 3);
  R(x, DK, X, baseY - h - 1, 9, 1); R(x, DK, X + 6, baseY - h, 5, 2);
  R(x, '#fff1b8', X + 7, baseY - h + 2, 3, 1);
  return { x: X + 8, y: baseY - h + 3 };
}

export function pole(x, X, baseY, h) {
  R(x, '#3a2f2a', X, baseY - h, 2, h); R(x, '#5a4a40', X + 1, baseY - h, 1, h);
  R(x, '#3a2f2a', X - 5, baseY - h + 3, 12, 1); R(x, '#3a2f2a', X - 4, baseY - h + 8, 10, 1);
  [-5, 6].forEach((o) => R(x, '#8b9bb4', X + o, baseY - h + 2, 1, 1));
  R(x, '#6a6258', X - 2, baseY - h + 14, 5, 6);
}

export function wire(x, x0, y0, x1, y1, sag) {
  x.fillStyle = '#231d2e';
  for (let px = x0; px <= x1; px++) {
    const u = (px - x0) / (x1 - x0);
    x.fillRect(px, Math.round(y0 + (y1 - y0) * u + sag * 4 * u * (1 - u)), 1, 1);
  }
}

export function signboard(x, s, cx, Y, bg, fg, pad = 3) {
  const w = textW(s) + pad * 2;
  R(x, DK, cx - (w >> 1) - 1, Y - 1, w + 2, 13);
  R(x, bg, cx - (w >> 1), Y, w, 11); R(x, mix(bg, '#ffffff', 0.25), cx - (w >> 1), Y, w, 1);
  text(x, s, cx - (w >> 1) + pad, Y + 2, fg);
}
