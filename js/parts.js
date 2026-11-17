/* Career Mode — pieces shared by the later chapters: ground, furniture, vehicles, hills. */
import { mk, rng, R, mix, disc, seg, text, textW } from './kit.js';
import { CLOTH } from './props.js';

// Ground: far pavement, road, kerb and the strip Suman walks on.
export function ground(x, w, B, LH, r, kind = 'city') {
  if (kind === 'stone') {                                   // dungeon floor
    R(x, '#1b1830', 0, B, w, LH - B); R(x, '#2a2646', 0, B, w, 3);
    R(x, '#3a3560', 0, B + 3, w, 16); R(x, '#2a2646', 0, B + 19, w, 2);
    R(x, '#4a4474', 0, B + 21, w, 13); R(x, '#5c568c', 0, B + 21, w, 1);
    for (let X = 0; X < w; X += 22) { R(x, '#2a2646', X, B + 3, 1, 16); R(x, '#322d54', X + 11, B + 22, 1, 12); }
    R(x, '#322d54', 0, B + 28, w, 1);
    for (let i = 0; i < w * 0.6; i++) R(x, r() < 0.5 ? '#544e84' : '#3c3766', r() * w, B + 4 + r() * 29, 1 + (r() < 0.3), 1);
    R(x, '#15122a', 0, B + 34, w, LH - B - 34);
    return;
  }
  if (kind === 'roof') {                                    // a rooftop terrace
    R(x, '#7c7786', 0, B, w, LH - B); R(x, '#b9b4be', 0, B, w, 1);
    R(x, '#8a8594', 0, B + 1, w, 20); R(x, '#a39eac', 0, B + 21, w, 13); R(x, '#bdb8c6', 0, B + 21, w, 1);
    for (let X = 0; X < w; X += 26) R(x, '#8a8594', X, B + 22, 1, 12);
    for (let i = 0; i < w; i++) R(x, r() < 0.5 ? '#afaab8' : '#928d9c', r() * w, B + 2 + r() * 31, 1, 1);
    R(x, '#5f5a6a', 0, B + 34, w, 2); R(x, '#2b2a40', 0, B + 36, w, LH - B - 36);
    return;
  }
  const dirt = kind === 'dirt';
  R(x, dirt ? '#8d9a5a' : '#cfc5b3', 0, B, w, 1); R(x, dirt ? '#6f7d48' : '#b5aa99', 0, B + 1, w, 2);
  R(x, '#2c3048', 0, B + 3, w, 1); R(x, '#3b4058', 0, B + 4, w, 15);
  for (let i = 0; i < w * 1.4; i++) R(x, r() < 0.5 ? '#454b66' : '#33374e', r() * w, B + 4 + r() * 15, 1 + (r() < 0.2), 1);
  for (let X = 4; X < w; X += 20) R(x, '#7c849e', X, B + 11, 9, 1);
  R(x, dirt ? '#c9b07a' : '#e2dacb', 0, B + 19, w, 1); R(x, dirt ? '#8f7a52' : '#958b7c', 0, B + 20, w, 1);
  R(x, dirt ? '#b89a6a' : '#aa9f8f', 0, B + 21, w, 13); R(x, dirt ? '#cdb07e' : '#bdb3a3', 0, B + 21, w, 1);
  if (!dirt) { for (let X = 0; X < w; X += 13) R(x, '#93897a', X, B + 22, 1, 12); R(x, '#93897a', 0, B + 28, w, 1); }
  for (let i = 0; i < w * 0.5; i++) R(x, r() < 0.5 ? (dirt ? '#d2b98a' : '#b8ae9e') : (dirt ? '#9c8358' : '#9d9383'), r() * w, B + 22 + r() * 11, 1, 1);
  R(x, '#6a6258', 0, B + 34, w, 2); R(x, '#2b2a40', 0, B + 36, w, LH - B - 36);
  for (let i = 0; i < w / 5; i++) { const gx = r() * w; R(x, '#2f6b4f', gx, B + 35 - (r() < 0.4), 1, 2); if (r() < 0.3) R(x, '#4d9c6c', gx + 1, B + 35, 1, 1); }
}

// Dark shapes that slide past in front of the scene: grass and the odd bicycle.
export function foreground(len, seed, d = '#1c1a30', l = '#3d3760', bikes = true) {
  const fg = mk(len, 40), fx = fg.x, rr = rng(seed);
  for (let X = 60; X < fg.w; X += 150 + Math.floor(rr() * 190)) {
    if (!bikes || rr() < 0.7) { for (let i = 0; i < 16; i++) { const h = 3 + rr() * 9; R(fx, d, X + i * 2, 40 - h, 2, h); if (i % 4 === 3) R(fx, l, X + i * 2 + 1, 40 - h, 1, 2); } }
    else { disc(fx, d, X + 6, 33, 6); disc(fx, d, X + 26, 33, 6); fx.clearRect(X + 3, 30, 7, 7); fx.clearRect(X + 23, 30, 7, 7); disc(fx, d, X + 6, 33, 1); disc(fx, d, X + 26, 33, 1); seg(fx, d, X + 6, 33, X + 14, 22, 1); seg(fx, d, X + 14, 22, X + 24, 22, 1); seg(fx, d, X + 24, 22, X + 26, 33, 1); seg(fx, d, X + 14, 22, X + 18, 33, 1); seg(fx, d, X + 18, 33, X + 6, 33, 1); R(fx, d, X + 12, 20, 5, 1); R(fx, d, X + 23, 19, 4, 1); }
  }
  return fg.c;
}

export function lcd(x, X, Y, scr = '#3b5dc9') {
  R(x, '#181425', X, Y, 13, 9); R(x, scr, X + 1, Y + 1, 11, 7); R(x, 'rgba(255,255,255,.25)', X + 1, Y + 1, 11, 1);
  R(x, '#5a6988', X + 5, Y + 9, 3, 2); R(x, '#5a6988', X + 3, Y + 11, 7, 1);
  return { x: X + 1, y: Y + 1, w: 11, h: 7 };
}
export function laptop(x, X, Y, scr = '#27324f') {
  R(x, '#8b9bb4', X, Y, 12, 8); R(x, scr, X + 1, Y + 1, 10, 6);
  R(x, '#c0cbdc', X - 1, Y + 8, 14, 2); R(x, '#8b9bb4', X - 1, Y + 9, 14, 1);
  return { x: X + 1, y: Y + 1, w: 10, h: 6 };
}
export function desk(x, X, Y, w, c = '#8b5a2b') {
  R(x, c, X, Y, w, 2); R(x, mix(c, '#ffffff', 0.22), X, Y, w, 1);
  R(x, mix(c, '#000000', 0.3), X + 1, Y + 2, 1, 8); R(x, mix(c, '#000000', 0.3), X + w - 2, Y + 2, 1, 8);
}
// A small seated or standing figure. Y is the top of the head.
export function person(x, X, Y, o = {}) {
  const s = o.s || '#c8946a', f = o.f < 0 ? -1 : 1, c = o.c || '#3b5dc9', t = o.t || 7;
  R(x, o.h || '#262b44', X, Y, 6, 3); R(x, s, X + (f > 0 ? 1 : 0), Y + 2, 5, 4); R(x, o.h || '#262b44', X + (f > 0 ? 0 : 5), Y + 2, 1, 3);
  R(x, '#181425', X + (f > 0 ? 4 : 1), Y + 3, 1, 1);
  if (o.g) R(x, '#181425', X + (f > 0 ? 2 : 0), Y + 3, 4, 1);
  R(x, c, X - 1, Y + 6, 8, t); R(x, mix(c, '#000000', 0.25), X - 1, Y + 6, 1, t);
  R(x, s, X + 2, Y + 6, 2, 1);
}
export function shelf(x, X, Y, w, h) {
  R(x, '#6a4320', X, Y, w, h); R(x, '#4a2f18', X + 1, Y + 1, w - 2, h - 2);
  for (let v = 8, j = 0; v < h; v += 9, j++) {
    R(x, '#6a4320', X + 1, Y + v, w - 2, 1);
    for (let i = 0; i < (w - 3) / 2; i++) { const hg = 4 + ((i * 7 + j * 3) % 3); R(x, CLOTH[(i + j * 2) % CLOTH.length], X + 2 + i * 2, Y + v - hg, 2, hg); }
  }
}
export function plant(x, X, Y, big) {
  R(x, '#a8443a', X, Y - 4, 5, 4); R(x, '#cc6248', X, Y - 4, 5, 1);
  const t = big ? 12 : 8;
  [[-3, 0], [3, 1], [0, 3], [-2, 2], [4, 3]].forEach(([dx, dy], i) => seg(x, i % 2 ? '#2b7a4a' : '#4fae58', X + 2, Y - 4, X + 2 + dx, Y - t + dy, 1));
  R(x, '#a7f070', X + 2, Y - t + 2, 1, 1);
}
export function picture(x, X, Y, w, h, c) { R(x, '#e3d1a5', X, Y, w, h); R(x, c, X + 1, Y + 1, w - 2, h - 2); }

// The black and yellow autorickshaw. X = left, Y = bottom of the wheels.
export function autorick(x, X, Y) {
  R(x, 'rgba(0,0,0,.3)', X + 2, Y - 1, 32, 2);
  R(x, '#ffcd3a', X + 3, Y - 23, 26, 5); R(x, '#fff1a8', X + 5, Y - 24, 22, 1); R(x, '#d99a22', X + 3, Y - 19, 26, 1);
  R(x, '#ffcd3a', X + 2, Y - 18, 8, 7); R(x, '#27324f', X + 4, Y - 17, 4, 3);
  R(x, '#3a2f2a', X + 10, Y - 18, 14, 8); R(x, '#b13e53', X + 11, Y - 13, 9, 3);
  seg(x, '#1c1b22', X + 24, Y - 18, X + 31, Y - 11, 2); R(x, '#9fd8ff', X + 25, Y - 16, 3, 4);
  R(x, '#1c1b22', X + 2, Y - 11, 31, 8); R(x, '#38b764', X + 2, Y - 11, 31, 1); R(x, '#33313d', X + 3, Y - 9, 29, 1);
  R(x, '#fff6c9', X + 33, Y - 9, 1, 2);
  [8, 29].forEach((o) => { disc(x, '#181425', X + o, Y - 3, 3); R(x, '#8b9bb4', X + o - 1, Y - 4, 2, 2); });
}
export function scooter(x, X, Y, c = '#41a6f6') {
  disc(x, '#181425', X + 3, Y - 2, 2); disc(x, '#181425', X + 14, Y - 2, 2);
  R(x, c, X + 2, Y - 7, 8, 4); R(x, mix(c, '#ffffff', 0.3), X + 2, Y - 7, 8, 1); R(x, '#262b44', X + 3, Y - 9, 6, 2);
  seg(x, c, X + 10, Y - 5, X + 14, Y - 10, 2); R(x, '#262b44', X + 12, Y - 12, 4, 1); R(x, '#fff6c9', X + 15, Y - 9, 1, 2);
}
// A food cart under an umbrella.
export function cart(x, X, Y, name, c1 = '#ef7d57', c2 = '#fff1a8') {
  R(x, '#6a4320', X + 20, Y - 36, 1, 24);
  for (let i = 0; i < 6; i++) { const w = 44 - i * 7; R(x, i % 2 ? c2 : c1, X + 21 - w / 2, Y - 34 - i, w, 1); }
  R(x, '#2a2338', X - 1, Y - 33, 44, 1);
  R(x, '#8b5a2b', X + 2, Y - 14, 38, 11); R(x, '#a9743c', X + 2, Y - 14, 38, 1);
  disc(x, '#181425', X + 9, Y - 2, 2); disc(x, '#181425', X + 33, Y - 2, 2);
  R(x, '#33313d', X + 6, Y - 18, 11, 4); R(x, '#5a6988', X + 5, Y - 19, 13, 1);
  for (let i = 0; i < 5; i++) disc(x, '#e8b37a', X + 23 + i * 3, Y - 16, 1);
  if (name) { const w = textW(name) + 4; R(x, '#2a2338', X + 21 - w / 2 - 1, Y - 12, w + 2, 9); text(x, name, X + 21 - w / 2 + 2, Y - 11, '#ffe08a'); }
}

// A modern block with bands of glass on its upper floors.
export function modern(x, X, B, w, h, p, r, floor = 44) {
  R(x, p.b, X, B - h, w, h); R(x, p.d, X, B - h, 2, h); R(x, p.l, X + w - 1, B - h, 1, h);
  R(x, p.l, X - 1, B - h - 2, w + 2, 2); R(x, p.d, X, B - h, w, 1);
  for (let y = B - h + 7; y < B - floor - 8; y += 16) {
    R(x, '#2a3a5a', X + 4, y, w - 8, 10); R(x, '#4f79a8', X + 5, y + 1, w - 10, 8);
    for (let i = X + 5; i < X + w - 12; i += 9) { R(x, '#2a3a5a', i + 8, y + 1, 1, 8); R(x, r() < 0.3 ? '#ffe9a8' : '#7fa6cc', i + 1, y + 2, 6, 3); }
    R(x, 'rgba(255,255,255,.18)', X + 5, y + 1, w - 10, 1);
  }
  R(x, p.d, X, B - 2, w, 2);
}

// Flat-topped hills, like the Sahyadri range behind Pune.
export function hills(x, W, baseY, r, col, lo, hi, step = 18) {
  let X = -10, h = lo + r() * (hi - lo);
  x.fillStyle = col;
  while (X < W) {
    const run = step + Math.floor(r() * step * 2), nh = lo + r() * (hi - lo), ramp = 6 + Math.floor(r() * 10);
    for (let i = 0; i < run; i++) { const k = i < ramp ? i / ramp : 1, hh = h + (nh - h) * k; x.fillRect(X + i, Math.round(baseY - hh), 1, Math.ceil(hh) + 1); }
    X += run; h = nh;
  }
}
