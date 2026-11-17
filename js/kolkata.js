/* Career Mode — Chapter 1: Kolkata at dawn, 2009 to 2016.
   Everything is baked once into a few small canvases, then scrolled as parallax layers. */
import { mk, R, mix, disc, seg, text, textW, plate, ease, out3, commas, bnText } from './kit.js';
import { rng, DK, BLD, SH, CLOTH, facade, win, tree, skyline, howrah, victoria, crt, room, taxi, lamp, pole, wire, signboard } from './props.js';

/* ───────── the chapter ───────── */
export function kolkata() {
  const r = rng(2009);

  // Far: the Hooghly, the far bank and Howrah Bridge.
  const far = mk(1100, 152);
  {
    const x = far.x, hz = 118;
    for (let X = -4; X < far.w;) { const w = 6 + Math.floor(r() * 16), h = 5 + Math.floor(r() * 20); R(x, '#474c84', X, hz - h, w, h); if (r() < 0.3) R(x, '#474c84', X + 2, hz - h - 3, 2, 3); X += w; }
    howrah(x, 380, 108, 190, '#383d72');
    R(x, '#4f5c98', 0, hz, far.w, 34); R(x, '#5c6aa8', 0, hz, far.w, 9);
    for (let i = 0; i < 300; i++) { const y = hz + 1 + r() * 32; R(x, r() < 0.5 ? '#8598d2' : '#6c7dba', r() * far.w, y, 2 + r() * (3 + (y - hz) * 0.3), 1); }
    // Country boats on the Hooghly.
    [[300, 131, 1], [455, 126, -1], [560, 137, 1], [150, 128, -1], [720, 134, 1]].forEach(([bx, by, d]) => {
      R(x, '#2c2f5c', bx, by, 20, 2); R(x, '#2c2f5c', bx + 2, by + 2, 16, 1); R(x, '#2c2f5c', bx - 2 * d, by - 1, 3, 1); R(x, '#2c2f5c', bx + (d > 0 ? 19 : -1), by - 1, 2, 1);
      R(x, '#2c2f5c', bx + 6, by - 5, 9, 5); R(x, '#3e4278', bx + 6, by - 5, 9, 1);
      R(x, '#2c2f5c', bx + (d > 0 ? 17 : 2), by - 6, 1, 6); R(x, '#2c2f5c', bx + (d > 0 ? 16 : 1), by - 8, 2, 2);
      R(x, '#3a4480', bx + 1, by + 4, 18, 1);
    });
  }

  // Middle: rooftops, water tanks and the Victoria Memorial.
  const mid = mk(1220, 150);
  skyline(mid.x, mid.w, 150, r, { w: [20, 44], h: [44, 96], win: [2, 3], pals: Object.values(BLD), big: false, gap: [40, 420] });
  victoria(mid.x, 640, 150);

  // Back: the nearer row, with shutters, balconies and washing lines.
  const back = mk(1540, 172);
  skyline(back.x, back.w, 172, r, { w: [38, 74], h: [72, 128], win: [4, 6], pals: [BLD.ochre, BLD.rose, BLD.blue, BLD.cream, BLD.mint, BLD.grey], big: true, gap: [44, 410] });

  // The street the story happens on. It starts well left of the first beat, so the road always
  // reaches the left edge of the screen, however wide the screen is.
  const PX0 = -460, LH = 180, B = 134, F = 160;
  const play = mk(1900, LH), x = play.x, c = (wx) => wx - PX0;
  const lights = [], hot = [];

  // West end of the street: a second stretch of old wall, and a hand-pulled rickshaw waiting for a fare.
  const r2 = rng(1947);                                 // its own seed, so the rest of the street is unchanged
  R(x, '#b9946e', c(-460), B - 22, 330, 22); R(x, '#d3ad83', c(-460), B - 22, 330, 1); R(x, '#94704f', c(-460), B - 3, 330, 3);
  for (let i = 0; i < 7; i++) { const bx = c(-450 + r2() * 300), by = B - 18 + r2() * 8; R(x, '#a8443a', bx, by, 6, 3); R(x, '#712c2c', bx + 2, by, 1, 3); }
  [['#73eff7', -430], ['#ffcd75', -402], ['#f6757a', -300], ['#a7f070', -214]].forEach(([col, wx]) => { R(x, '#f4f4f4', c(wx), B - 19, 10, 12); R(x, col, c(wx) + 1, B - 18, 8, 7); R(x, DK, c(wx) + 2, B - 9, 6, 1); });
  tree(x, c(-330), B, 30, r2);
  { const l0 = lamp(x, c(-390), B, 62); lights.push({ x: l0.x + PX0, y: l0.y, g: 'warm' }); }
  const rickshaw = () => { // The rickshaw: a big spoked wheel, a black folding hood, long shafts and the puller resting between them.
    const X = c(936), Y = B + 16;                       // parked in front of the sweet shop
    seg(x, '#4a2f18', X - 30, Y - 12, X - 2, Y - 10, 1); seg(x, '#6a4320', X - 30, Y - 13, X - 2, Y - 11, 1);
    R(x, '#7a2a3c', X - 4, Y - 20, 20, 9); R(x, '#b13e53', X - 4, Y - 20, 20, 1); R(x, '#4a1c28', X - 4, Y - 12, 20, 2);
    R(x, '#262b44', X - 2, Y - 31, 18, 11); R(x, '#3a4466', X, Y - 33, 14, 2); R(x, '#3a4466', X - 2, Y - 31, 1, 11);
    for (let i = 0; i < 4; i++) R(x, '#3a4466', X + 1 + i * 4, Y - 30, 1, 9);
    disc(x, '#181425', X + 12, Y - 8, 8); disc(x, '#8b5a2b', X + 12, Y - 8, 7); disc(x, '#181425', X + 12, Y - 8, 5);
    for (let a = 0; a < 8; a++) seg(x, '#a9743c', X + 12, Y - 8, X + 12 + Math.round(Math.cos(a * 0.785) * 5), Y - 8 + Math.round(Math.sin(a * 0.785) * 5), 1);
    disc(x, '#c0cbdc', X + 12, Y - 8, 1);
    const px0 = X - 26;                                 // the puller, in a white vest and a checked gamchha
    R(x, '#c8946a', px0, Y - 26, 5, 5); R(x, '#262b44', px0, Y - 27, 5, 2); R(x, '#181425', px0, Y - 24, 1, 1);
    R(x, '#e8edf4', px0 - 1, Y - 21, 7, 7); R(x, '#e43b44', px0 - 1, Y - 21, 7, 1); R(x, '#c8946a', px0 + 5, Y - 18, 2, 5);
    R(x, '#8b9bb4', px0 - 1, Y - 14, 7, 4); R(x, '#c8946a', px0, Y - 10, 2, 6); R(x, '#c8946a', px0 + 4, Y - 10, 2, 6);
    hot.push({ x: 904, y: B - 18, w: 50, h: 34, say: 'A hand-pulled rickshaw. Kolkata is one of the last cities in the world that still has them.' });
  };

  // Trees and the big banyan sit behind everything else on the street.
  tree(x, c(-78), B, 44, r);
  for (let i = 0; i < 9; i++) seg(x, '#3f3024', c(-96 + i * 5), B - 44 + r() * 8, c(-96 + i * 5), B - 14 - r() * 10, 1);
  tree(x, c(424), B, 24, r); tree(x, c(992), B, 30, r); tree(x, c(1176), B, 34, r); tree(x, c(1300), B, 28, r);

  // Old plastered wall with film posters.
  R(x, '#c9a27a', c(-120), B - 26, 104, 26); R(x, '#e0bd92', c(-120), B - 26, 104, 1); R(x, '#a07b58', c(-120), B - 3, 104, 3);
  R(x, '#8f6a4a', c(-120), B - 28, 106, 2);
  for (let i = 0; i < 5; i++) { const bx = c(-112 + r() * 86), by = B - 20 + r() * 10; R(x, '#a8443a', bx, by, 7, 3); R(x, '#712c2c', bx + 3, by, 1, 3); R(x, '#712c2c', bx, by + 3, 7, 1); }
  [['#ef7d57', -104], ['#41a6f6', -90], ['#ffcd75', -52], ['#b13e53', -38]].forEach(([col, wx]) => { R(x, '#f4f4f4', c(wx), B - 22, 11, 14); R(x, col, c(wx) + 1, B - 21, 9, 8); R(x, DK, c(wx) + 2, B - 11, 7, 1); });

  // Chai stall.
  {
    const X = c(-8), Y = B;
    R(x, '#6a4320', X + 2, Y - 34, 1, 34); R(x, '#6a4320', X + 44, Y - 34, 1, 34);
    for (let i = 0; i < 48; i += 4) { R(x, i % 8 ? '#f4f4f4' : '#e43b44', X + i, Y - 39, 4, 6); R(x, i % 8 ? '#c0cbdc' : '#a22633', X + i, Y - 34, 4, 1); }
    R(x, DK, X, Y - 40, 48, 1);
    signboard(x, 'CHAI', X + 24, Y - 31, '#ffcd75', '#712c2c');
    R(x, '#8b5a2b', X + 4, Y - 14, 40, 11); R(x, '#a9743c', X + 4, Y - 14, 40, 1); R(x, '#6a4320', X + 4, Y - 4, 40, 1);
    for (let i = 8; i < 42; i += 8) R(x, '#6a4320', X + i, Y - 13, 1, 9);
    disc(x, '#181425', X + 10, Y - 2, 2); disc(x, '#181425', X + 38, Y - 2, 2);
    R(x, '#8b9bb4', X + 9, Y - 20, 7, 6); R(x, '#c0cbdc', X + 9, Y - 20, 7, 1); R(x, '#8b9bb4', X + 16, Y - 19, 2, 1); R(x, '#5a6988', X + 11, Y - 22, 3, 2);
    for (let i = 0; i < 4; i++) R(x, '#c96a5b', X + 22 + i * 3, Y - 16, 2, 2);
    R(x, 'rgba(220,240,255,.75)', X + 34, Y - 20, 4, 6); R(x, '#d9a441', X + 35, Y - 18, 2, 4); R(x, '#e43b44', X + 34, Y - 21, 4, 1);
    lights.push({ x: -8 + 24, y: B - 24, g: 'warmS' });
    hot.push({ x: -8, y: B - 40, w: 48, h: 40, say: 'Chai in a clay cup. In Kolkata, most plans start at a stall like this one.' });
  }

  // Riverside railing: the open view where the story starts.
  for (let wx = 52; wx < 246; wx += 12) R(x, '#243a4a', c(wx), B - 10, 2, 10);
  R(x, '#243a4a', c(52), B - 10, 194, 1); R(x, '#3c5a6e', c(52), B - 11, 194, 1); R(x, '#243a4a', c(52), B - 5, 194, 1);
  const l1 = lamp(x, c(72), B, 62); lights.push({ x: l1.x + PX0, y: l1.y, g: 'warm' });

  // House A: the tutor's room.
  {
    const X = c(250), w = 150, h = 86;
    facade(x, X, B, w, h, BLD.ochre, r);
    R(x, BLD.ochre.d, X, B - 45, w, 2); R(x, BLD.ochre.l, X, B - 46, w, 1);
    [18, 68, 118].forEach((o) => { win(x, X + o, B - 76, 9, 13, o === 68 ? 'lit' : 'sh'); });
    R(x, DK, X + 58, B - 60, 30, 1); for (let bx = X + 59; bx < X + 88; bx += 3) R(x, DK, bx, B - 66, 1, 6); R(x, DK, X + 58, B - 67, 30, 1);
    R(x, DK, X + 9, B - 25, 14, 25); R(x, SH.b, X + 10, B - 24, 12, 24); R(x, SH.d, X + 16, B - 24, 1, 24);
    R(x, SH.l, X + 11, B - 22, 4, 8); R(x, SH.l, X + 17, B - 22, 4, 8); R(x, '#ffcd75', X + 14, B - 12, 1, 2);
    R(x, '#c9bfae', X + 7, B - 1, 18, 1);
    const rx = X + 40, ry = B - 38, rw = 66, rh = 34;
    room(x, rx, ry, rw, rh, '#3d6b6b', '#7a5236');
    R(x, '#8b5a2b', rx + 5, ry + 5, 25, 14); R(x, '#1f4636', rx + 6, ry + 6, 23, 12); text(x, 'ABC', rx + 9, ry + 8, '#e8edf4');
    R(x, '#f4f4f4', rx + 7, ry + 17, 3, 1);
    R(x, DK, rx + 45, ry, 1, 4); R(x, '#fff1b8', rx + 44, ry + 4, 3, 2);
    lights.push({ x: 250 + 40 + 45, y: ry + 6, g: 'warm' });
    R(x, '#6a4320', rx + 30, ry + 24, 6, 1); R(x, '#6a4320', rx + 31, ry + 25, 1, 5); R(x, '#6a4320', rx + 34, ry + 25, 1, 5);
    R(x, '#c0cbdc', rx + 52, ry + 8, 6, 2); R(x, '#c8946a', rx + 52, ry + 10, 6, 4); R(x, '#181425', rx + 52, ry + 11, 2, 1); R(x, '#181425', rx + 55, ry + 11, 2, 1);
    R(x, '#e8edf4', rx + 50, ry + 14, 9, 8); R(x, '#b5c1d6', rx + 50, ry + 14, 1, 8);
    R(x, '#8b5a2b', rx + 36, ry + 21, 28, 2); R(x, '#a9743c', rx + 36, ry + 21, 28, 1); R(x, '#6a4320', rx + 37, ry + 23, 1, 7); R(x, '#6a4320', rx + 62, ry + 23, 1, 7);
    R(x, '#f4f4f4', rx + 40, ry + 19, 9, 2); R(x, '#b13e53', rx + 44, ry + 19, 1, 2); R(x, '#c8946a', rx + 49, ry + 19, 3, 2);
    signboard(x, 'ENGLISH TUITION', X + 75, B - 57 + 4, '#1f4636', '#f5eac8');
    hot.push({ x: 290, y: ry, w: rw, h: rh, say: 'The slate on the wall says A B C. Everything on this page started with those three letters.' });
  }

  // Phone booth. Before mobiles, this was how you called another city.
  {
    const X = c(442), w = 44, h = 46;
    R(x, DK, X - 1, B - h - 1, w + 2, h + 1);
    R(x, '#ffcd3a', X, B - h, w, h); R(x, '#fff1a8', X, B - h, w, 1); R(x, '#d99a22', X, B - 3, w, 3); R(x, '#d99a22', X, B - h, 1, h);
    R(x, '#181425', X + 3, B - h + 3, 21, 31);
    ['STD', 'ISD', 'PCO'].forEach((s, i) => text(x, s, X + 5, B - h + 6 + i * 9, '#ffcd3a'));
    R(x, DK, X + 27, B - h + 3, 14, 40); R(x, '#27324f', X + 28, B - h + 4, 12, 22); R(x, '#6a8ab8', X + 29, B - h + 5, 2, 8);
    R(x, '#d99a22', X + 28, B - h + 27, 12, 15); R(x, '#181425', X + 31, B - h + 12, 5, 8); R(x, '#8b9bb4', X + 32, B - h + 13, 3, 2);
    hot.push({ x: 442, y: B - h, w, h, say: 'An STD, ISD and PCO booth. In 2009 this was how you phoned another city.' });
  }

  // Apartment block B: the bedroom and the study.
  const rooms = {};
  {
    const X = c(530), w = 322, h = 98;
    facade(x, X, B, w, h, BLD.blue, r);
    R(x, BLD.blue.d, X, B - 50, w, 2); R(x, BLD.blue.l, X, B - 51, w, 1);
    for (let o = 16; o < w - 16; o += 30) {
      win(x, X + o, B - 86, 9, 13, (o / 30) % 3 === 1 ? 'lit' : (o / 30) % 2 ? 'gl' : 'sh');
      if ((o / 30) % 2 === 0) { R(x, DK, X + o - 4, B - 68, 18, 1); for (let bx = X + o - 3; bx < X + o + 14; bx += 3) R(x, DK, bx, B - 73, 1, 5); R(x, DK, X + o - 4, B - 74, 18, 1); }
    }
    for (let o = 140; o < 190; o += 5) R(x, CLOTH[(o / 5) % CLOTH.length], X + o, B - 62, 3, 5);
    R(x, DK, X + 136, B - 63, 58, 1);
    // Drainpipes, window coolers and balcony plants: the small things that make a wall look lived in.
    [124, 200, 304].forEach((o) => { R(x, '#4a6a7c', X + o, B - h + 2, 2, h - 4); R(x, '#6f93a6', X + o + 1, B - h + 2, 1, h - 4); for (let j = 12; j < h - 6; j += 22) R(x, '#35505f', X + o - 1, B - j, 4, 1); });
    [46, 226].forEach((o) => { R(x, DK, X + o + 10, B - 84, 9, 7); R(x, '#c9c0ae', X + o + 11, B - 83, 7, 5); R(x, '#8b9bb4', X + o + 12, B - 82, 5, 1); R(x, '#8b9bb4', X + o + 12, B - 80, 5, 1); });
    [16, 76, 136, 256].forEach((o) => { R(x, '#a8443a', X + o - 2, B - 70, 4, 2); R(x, '#2b7a4a', X + o - 3, B - 73, 2, 3); R(x, '#4fae58', X + o - 1, B - 75, 3, 5); R(x, '#a8443a', X + o + 9, B - 70, 4, 2); R(x, '#4fae58', X + o + 9, B - 74, 2, 4); R(x, '#f6757a', X + o + 11, B - 75, 1, 1); });
    for (let i = 0; i < 26; i++) { const cx0 = X + 6 + r() * (w - 12), cy0 = B - 48 + r() * 44; R(x, r() < 0.5 ? BLD.blue.d : BLD.blue.l, cx0, cy0, 1 + Math.floor(r() * 3), 1); }
    signboard(x, 'NO. 27', X + 162, B - 44, '#1d2552', '#f4f4f4', 2);
    // entrance
    R(x, DK, X + 152, B - 30, 20, 30); R(x, '#6a4320', X + 153, B - 29, 18, 29); R(x, '#8b5a2b', X + 154, B - 27, 7, 12); R(x, '#8b5a2b', X + 163, B - 27, 7, 12);
    R(x, '#ffcd75', X + 161, B - 13, 2, 2); R(x, '#c9bfae', X + 149, B - 1, 26, 1);
    R(x, '#e3d1a5', X + 176, B - 22, 8, 10); for (let i = 0; i < 3; i++) R(x, DK, X + 177, B - 20 + i * 3, 6, 1);

    // Bedroom: World of Lamborghini.
    const bx = X + 32, by = B - 42, bw = 80, bh = 38;
    room(x, bx, by, bw, bh, '#34507a', '#6a4a3a');
    R(x, '#f4f4f4', bx + 6, by + 5, 30, 18); R(x, '#181425', bx + 7, by + 6, 28, 16);
    R(x, '#ffcd3a', bx + 10, by + 15, 22, 3); R(x, '#ffcd3a', bx + 16, by + 13, 10, 2); R(x, '#ffcd3a', bx + 18, by + 12, 6, 1);
    R(x, '#fff1a8', bx + 11, by + 15, 20, 1); R(x, '#27324f', bx + 18, by + 13, 6, 2); R(x, '#ffcd3a', bx + 30, by + 16, 3, 2);
    disc(x, '#5a6988', bx + 14, by + 18, 2); disc(x, '#5a6988', bx + 28, by + 18, 2); R(x, '#c0cbdc', bx + 14, by + 18, 1, 1); R(x, '#c0cbdc', bx + 28, by + 18, 1, 1);
    R(x, '#e43b44', bx + 9, by + 8, 8, 1); R(x, '#8b9bb4', bx + 9, by + 10, 5, 1);
    R(x, '#6a4320', bx + 2, by + 19, 2, 15); R(x, '#6a4320', bx + 2, by + 30, 36, 2); R(x, '#e8edf4', bx + 4, by + 27, 34, 3);
    R(x, '#ffffff', bx + 5, by + 25, 7, 2); R(x, '#b13e53', bx + 14, by + 27, 24, 3); R(x, '#d9606f', bx + 14, by + 27, 24, 1); R(x, '#6a4320', bx + 37, by + 32, 1, 2);
    R(x, '#8b5a2b', bx + 44, by + 24, 33, 2); R(x, '#a9743c', bx + 44, by + 24, 33, 1); R(x, '#6a4320', bx + 45, by + 26, 1, 8); R(x, '#6a4320', bx + 75, by + 26, 1, 8);
    const s1 = crt(x, bx + 49, by + 9);
    R(x, '#3b5dc9', s1.x, s1.y, 11, 2); R(x, '#f4f4f4', s1.x, s1.y + 2, 11, 6); R(x, '#ffcd3a', s1.x + 1, s1.y + 3, 5, 3);
    R(x, '#8b9bb4', s1.x + 7, s1.y + 3, 3, 1); R(x, '#8b9bb4', s1.x + 7, s1.y + 5, 3, 1); R(x, '#3b5dc9', s1.x + 1, s1.y + 7, 2, 1);
    R(x, '#d8d0c0', bx + 48, by + 23, 13, 1);
    R(x, '#c9c0ae', bx + 67, by + 27, 6, 7); R(x, '#a89f8c', bx + 72, by + 27, 1, 7); R(x, '#38b764', bx + 69, by + 29, 1, 1);
    R(x, '#3a4466', bx + 40, by + 22, 2, 9); R(x, '#3a4466', bx + 40, by + 28, 7, 1); R(x, '#262b44', bx + 43, by + 29, 1, 5);
    R(x, '#8b5a2b', bx + 64, by + 12, 13, 1);
    ['#ef7d57', '#41a6f6', '#f4f4f4', '#a7f070', '#b13e53'].forEach((col, i) => R(x, col, bx + 65 + i * 2, by + 7 + (i % 2), 2, 5 - (i % 2)));
    rooms.bed = { x: 530 + 32 + bw / 2, top: B - h, screen: { x: s1.x + PX0, y: s1.y } };
    lights.push({ x: s1.x + PX0 + 5, y: s1.y + 4, g: 'cool', always: 1, flicker: 23 });
    hot.push({ x: 530 + 32, y: by, w: 40, h: bh, say: 'A supercar poster above the bed. The closest he got to the real thing, back then.' });

    // Study: YouTube over dial-up.
    const sx = X + 210, sy = B - 42;
    room(x, sx, sy, bw, bh, '#5a4a6a', '#6a4a3a');
    R(x, '#8b5a2b', sx + 6, sy + 24, 44, 2); R(x, '#a9743c', sx + 6, sy + 24, 44, 1); R(x, '#6a4320', sx + 7, sy + 26, 1, 8); R(x, '#6a4320', sx + 48, sy + 26, 1, 8);
    const s2 = crt(x, sx + 11, sy + 9);
    R(x, '#181425', s2.x, s2.y, 11, 7); R(x, '#e43b44', s2.x + 3, s2.y + 1, 5, 4); R(x, '#f4f4f4', s2.x + 5, s2.y + 2, 1, 2); R(x, '#f4f4f4', s2.x + 6, s2.y + 3, 1, 1);
    R(x, '#3a4466', s2.x, s2.y + 7, 11, 1);
    R(x, '#d8d0c0', sx + 10, sy + 23, 13, 1);
    R(x, '#262b44', sx + 31, sy + 21, 12, 3); R(x, '#3a4466', sx + 31, sy + 21, 12, 1);
    wire(x, sx + 43, sy + 22, sx + 52, sy + 30, 2);
    disc(x, '#f4f4f4', sx + 36, sy + 10, 3); R(x, DK, sx + 36, sy + 8, 1, 3); R(x, DK, sx + 36, sy + 10, 2, 1);
    [['#ffcd75', 44, 6], ['#73eff7', 44, 13], ['#f6757a', 28, 14]].forEach(([col, o, v]) => R(x, col, sx + o, sy + v, 4, 4));
    R(x, '#6a4320', sx + 55, sy + 5, 22, 29); R(x, '#4a2f18', sx + 56, sy + 6, 20, 27);
    [6, 15, 24].forEach((v, j) => {
      R(x, '#6a4320', sx + 56, sy + v + 8, 20, 1);
      for (let i = 0; i < 9; i++) { const hgt = 4 + ((i * 7 + j * 3) % 3); R(x, CLOTH[(i + j * 2) % CLOTH.length], sx + 57 + i * 2, sy + v + 8 - hgt, 2, hgt); }
    });
    R(x, '#3a4466', sx + 22, sy + 22, 2, 9); R(x, '#3a4466', sx + 22, sy + 28, 7, 1); R(x, '#262b44', sx + 25, sy + 29, 1, 5);
    rooms.study = { x: 530 + 210 + bw / 2, top: B - h, screen: { x: s2.x + PX0, y: s2.y }, modem: { x: sx + 33 + PX0, y: sy + 22 } };
    lights.push({ x: s2.x + PX0 + 5, y: s2.y + 4, g: 'cool', always: 1, flicker: 17 });
  }

  // Sweet shop.
  {
    const X = c(884), w = 90, h = 52;
    facade(x, X, B, w, h, BLD.rose, r);
    R(x, DK, X + 6, B - 30, 78, 30); R(x, '#4a2a35', X + 7, B - 29, 76, 29);
    for (let i = 0; i < 96; i += 6) { R(x, i % 12 ? '#f5eac8' : '#2f6b4f', X - 3 + i, B - 37, 6, 6); R(x, i % 12 ? '#b79f70' : '#1f4636', X - 3 + i, B - 32, 6, 1); }
    signboard(x, 'MISHTI', X + 45, B - 50, '#7a2a3c', '#ffe08a');
    R(x, '#e3d1a5', X + 10, B - 16, 62, 2); R(x, 'rgba(180,220,255,.35)', X + 10, B - 14, 62, 11); R(x, '#b79f70', X + 10, B - 3, 62, 3);
    for (let i = 0; i < 9; i++) { disc(x, '#f4f4f4', X + 14 + i * 4, B - 11, 1); }
    for (let i = 0; i < 7; i++) { R(x, '#ef9d3a', X + 13 + i * 5, B - 7, 3, 2); R(x, '#d9773a', X + 14 + i * 5, B - 6, 1, 1); }
    for (let i = 0; i < 5; i++) R(x, '#d9a441', X + 52 + i * 4, B - 11, 3, 3);
    R(x, DK, X + 44, B - 29, 1, 5); R(x, '#fff1b8', X + 43, B - 24, 3, 2);
    lights.push({ x: 884 + 44, y: B - 22, g: 'warm' });
    hot.push({ x: 884, y: B - h, w, h, say: 'Mishti means sweets. The white ones are rosogolla, and Kolkata will argue with you about who invented them.' });
  }

  // The road out of town.
  for (let wx = 1010; wx < 1440; wx += 12) R(x, '#243a4a', c(wx), B - 10, 2, 10);
  R(x, '#243a4a', c(1010), B - 10, 430, 1); R(x, '#3c5a6e', c(1010), B - 11, 430, 1); R(x, '#243a4a', c(1010), B - 5, 430, 1);
  {
    const X = c(1078);
    R(x, '#5a6988', X + 21, B - 48, 2, 48); R(x, '#8b9bb4', X + 22, B - 48, 1, 48);
    R(x, '#f4f4f4', X - 1, B - 63, 46, 17); R(x, '#2f6b4f', X, B - 62, 44, 15); R(x, '#4d9c6c', X, B - 62, 44, 1);
    text(x, 'PUNE >', X + 5, B - 58, '#f4f4f4');
    R(x, '#f4f4f4', c(1046), B - 10, 9, 10); R(x, '#ffcd3a', c(1046), B - 12, 9, 4); R(x, '#ffcd3a', c(1047), B - 13, 7, 1); R(x, '#181425', c(1048), B - 6, 5, 1); R(x, '#181425', c(1048), B - 4, 3, 1);
    hot.push({ x: 1078, y: B - 63, w: 44, h: 63, say: 'Pune is almost 2,000 km from Kolkata by road. That is where the next scene goes.' });
  }
  const l2 = lamp(x, c(1150), B, 62); lights.push({ x: l2.x + PX0, y: l2.y, g: 'warm' });

  // Poles and tangled wires.
  const poles = [228, 506, 866, 1126, 1360];
  poles.forEach((wx) => pole(x, c(wx), B, 82));
  const perches = [];
  for (let i = 0; i < poles.length - 1; i++) {
    const a = c(poles[i]), b = c(poles[i + 1]);
    wire(x, a - 4, B - 80, b - 4, B - 80, 5); wire(x, a + 6, B - 80, b + 6, B - 80, 7); wire(x, a + 1, B - 74, b + 1, B - 74, 4);
    [0.3, 0.36, 0.62].forEach((u, j) => { if ((i + j) % 2 === 0) perches.push({ x: poles[i] + (poles[i + 1] - poles[i]) * u, y: B - 80 + 5 * 4 * u * (1 - u) - 3 }); });
  }

  // Ground: far pavement, road, kerb, the pavement Suman walks on.
  R(x, '#cfc5b3', 0, B, play.w, 1); R(x, '#b5aa99', 0, B + 1, play.w, 2);
  R(x, '#2c3048', 0, B + 3, play.w, 1); R(x, '#3b4058', 0, B + 4, play.w, 15);
  for (let i = 0; i < play.w * 1.4; i++) R(x, r() < 0.5 ? '#454b66' : '#33374e', r() * play.w, B + 4 + r() * 15, 1 + (r() < 0.2), 1);
  for (let X = 4; X < play.w; X += 20) R(x, '#7c849e', X, B + 11, 9, 1);
  R(x, '#e2dacb', 0, B + 19, play.w, 1); R(x, '#958b7c', 0, B + 20, play.w, 1);
  R(x, '#aa9f8f', 0, B + 21, play.w, 13); R(x, '#bdb3a3', 0, B + 21, play.w, 1);
  for (let X = 0; X < play.w; X += 13) R(x, '#93897a', X, B + 22, 1, 12);
  R(x, '#93897a', 0, B + 28, play.w, 1);
  for (let i = 0; i < play.w * 0.5; i++) R(x, r() < 0.5 ? '#b8ae9e' : '#9d9383', r() * play.w, B + 22 + r() * 11, 1, 1);
  R(x, '#6a6258', 0, B + 34, play.w, 2); R(x, '#2b2a40', 0, B + 36, play.w, LH - B - 36);
  for (let i = 0; i < play.w / 5; i++) { const gx = r() * play.w; R(x, '#2f6b4f', gx, B + 35 - (r() < 0.4), 1, 2); if (r() < 0.3) R(x, '#4d9c6c', gx + 1, B + 35, 1, 1); }

  // Parked taxi, drawn after the road so its wheels sit on it.
  taxi(x, c(152), B + 17);
  rickshaw();
  hot.push({ x: 152, y: B - 5, w: 48, h: 22, say: 'A yellow Ambassador taxi, as Kolkata as it gets. The supercars come later in the story.' });

  // Foreground silhouettes that slide past in front of everything.
  const fg = mk(2600, 40);
  {
    const fx = fg.x, d = '#1c1a30', l = '#3d3760', rr = rng(77);
    for (let X = 60; X < fg.w; X += 150 + Math.floor(rr() * 190)) {
      const k = rr();
      if (k < 0.7) { for (let i = 0; i < 16; i++) { const hgt = 3 + rr() * 9; R(fx, d, X + i * 2, 40 - hgt, 2, hgt); if (i % 4 === 3) R(fx, l, X + i * 2 + 1, 40 - hgt, 1, 2); } }
      else { disc(fx, d, X + 6, 33, 6); disc(fx, d, X + 26, 33, 6); fx.clearRect(X + 3, 30, 7, 7); fx.clearRect(X + 23, 30, 7, 7); disc(fx, d, X + 6, 33, 1); disc(fx, d, X + 26, 33, 1); seg(fx, d, X + 6, 33, X + 14, 22, 1); seg(fx, d, X + 14, 22, X + 24, 22, 1); seg(fx, d, X + 24, 22, X + 26, 33, 1); seg(fx, d, X + 14, 22, X + 18, 33, 1); seg(fx, d, X + 18, 33, X + 6, 33, 1); R(fx, d, X + 12, 20, 5, 1); R(fx, d, X + 23, 19, 4, 1); }
    }
  }

  // Bengali signs: a blue street plate pointing to Howrah Bridge, the sweet shop's rooftop board and the chai stall's.
  // The lettering needs the Bengali web fonts, so it is drawn once they have loaded.
  let bn = null;
  const buildBn = () => {
    if (bn) return;
    bn = {
      howrah: bnText('হাওড়া ব্রিজ', 11, '#ffffff'),
      sweet: bnText('মিষ্টিমুখ', 15, '#ffe08a', '"Galada", "Hind Siliguri", "Noto Sans Bengali", "Nirmala UI", cursive', 400),
      cha: bnText('চা', 13, '#712c2c'),
    };
  };
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load('700 11px "Hind Siliguri"', 'হাওড়া ব্রিজ চা'), document.fonts.load('400 15px "Galada"', 'মিষ্টিমুখ')]).catch(() => {}).finally(buildBn);
    setTimeout(buildBn, 4000);
  } else buildBn();
  hot.push({ x: 144, y: B - 72, w: 82, h: 30, say: 'A Kolkata street sign: Bengali first, then English. হাওড়া ব্রিজ is Howrah Bridge, the one behind it.' });
  hot.push({ x: 894, y: B - 76, w: 70, h: 24, say: 'মিষ্টিমুখ, mishtimukh: "a sweet mouth". In Bengal, good news is always shared with a sweet.' });
  hot.push({ x: 4, y: B - 58, w: 24, h: 18, say: 'চা, cha: Bengali for tea. Every plan in this city starts with one.' });
  const signs = (g, sx, py) => {
    if (!bn) return;
    { // the street plate, hung off the electric pole by the river
      const s = bn.howrah, en = 'HOWRAH BR. >', w = Math.max(s.w, textW(en)) + 8, h = s.h + 15, X = sx(225) - w, Y = py + B - 70;
      R(g, '#262b44', X + w, Y + 5, 4, 2); R(g, '#262b44', X + w, Y + h - 6, 4, 2);
      R(g, '#f4f4f4', X - 1, Y - 1, w + 2, h + 2); R(g, '#1d4f9c', X, Y, w, h); R(g, '#3b6fc4', X, Y, w, 1);
      g.drawImage(s.c, X + ((w - s.w) >> 1), Y + 3);
      text(g, en, X + ((w - textW(en)) >> 1), Y + s.h + 6, '#f4f4f4');
    }
    { // the sweet shop's board on its roof
      const s = bn.sweet, w = s.w + 10, h = s.h + 9, X = sx(929) - (w >> 1), Y = py + B - 56 - h;
      R(g, '#4a2f18', X + 6, Y + h, 2, 4); R(g, '#4a2f18', X + w - 8, Y + h, 2, 4);
      R(g, '#181425', X - 1, Y - 1, w + 2, h + 2); R(g, '#7a2a3c', X, Y, w, h); R(g, '#a8445a', X, Y, w, 1); R(g, '#4a1c28', X, Y + h - 1, w, 1);
      g.drawImage(s.c, X + ((w - s.w) >> 1), Y + 4);
    }
    { // the chai stall's little board, on top of its awning
      const s = bn.cha, w = s.w + 8, h = s.h + 6, X = sx(16) - (w >> 1), Y = py + B - 41 - h;
      R(g, '#181425', X - 1, Y - 1, w + 2, h + 2); R(g, '#f5eac8', X, Y, w, h); R(g, '#e3d1a5', X, Y + h - 1, w, 1);
      g.drawImage(s.c, X + ((w - s.w) >> 1), Y + 3);
    }
  };

  const SKY = [['#1f2452', '#5b3f87', '#e2766a', '#ffd28a'], ['#2b78d2', '#5fb0ef', '#a3dbf5', '#e6f5ee']];
  const SKILLS = [['SEO', '#ffcd75'], ['GOOGLE ADS', '#73eff7'], ['ANALYTICS', '#a7f070'], ['PHOTOSHOP', '#41a6f6'], ['PREMIERE PRO', '#f6757a'], ['AFTER EFFECTS', '#c9a0ff']];
  const top = B - 98;

  return {
    id: 'kolkata', len: 1120,
    layers: [
      { c: far.c, f: 0.1, haze: 0.44, sink: 4, pad: 0, anchor: 475, water: 1 },   // the bridge stays under the sun
      { c: mid.c, f: 0.32, haze: 0.5, sink: -8, pad: 10 },
      { c: back.c, f: 0.58, haze: 0.26, sink: 0, pad: 20 },
    ],
    play: { c: play.c, x0: PX0, F, B },
    fg: { c: fg.c, f: 1.32 },
    lights, hot, perches,
    steam: [{ x: 6, y: B - 22 }],
    coins: [[232, 14], [414, 14], [480, 54], [700, 14], [876, 54], [985, 14]],
    u: (lx) => Math.max(0, Math.min(1, (lx - 252) / 818)),
    // Dawn turns into a bright morning as Suman walks through the chapter.
    mood(u) {
      const q = Math.round(u * 40) / 40, dawn = 1 - ease(Math.min(1, u / 0.62));
      return {
        sky: SKY[0].map((col, i) => mix(col, SKY[1][i], q)), amb: ['#43387e', 0.36 * dawn], lamp: dawn, stars: dawn, pink: dawn, grey: 0,
        sun: u, sunA: 0.95 - 0.55 * u, rain: 0, glit: 0.45 + 0.55 * dawn, rim: ['#ffd9a8', 0.16 + 0.26 * dawn],
      };
    },
    // Small live details inside the rooms: the video buffers slowly and the modem blinks.
    live({ x: g, sx, py, t }) {
      signs(g, sx, py);
      const st = rooms.study;
      R(g, '#e43b44', sx(st.screen.x), py + st.screen.y + 7, 1 + Math.floor(((t * 0.9) % 6) / 6 * 6), 1);
      [0, 1, 2].forEach((i) => R(g, Math.sin(t * (9 + i * 4) + i) > 0 ? (i === 1 ? '#ffcd75' : '#a7f070') : '#1f4636', sx(st.modem.x) + i * 3, py + st.modem.y, 1, 1));
    },
    // Numbers that count up on the buildings as Suman arrives.
    over({ ctx, sx, py, beat, bt }) {
      if (beat === 'tutor' && bt > 0.35) {
        const k = out3((bt - 0.35) / 0.4);
        ctx.globalAlpha = k;
        plate(ctx, '* STAR MARK IN ENGLISH', sx(325), py + B - 64 - Math.round(4 * k), '#ffcd75');
      }
      if (beat === 'lambo') {
        const second = bt > 3.6 && Math.floor((bt - 3.6) / 3.4) % 2 === 0;
        const k0 = bt > 3.6 ? (bt - 3.6) % 3.4 : bt;
        ctx.globalAlpha = out3(k0 / 0.25);
        const h = plate(ctx, commas((second ? 677503 : 82000) * out3(k0 / 1.3)), sx(rooms.bed.x), py + top + 6, second ? '#73eff7' : '#ffcd75', 2);
        plate(ctx, second ? 'PEOPLE SAW ONE POST' : 'FOLLOWERS, NO BUDGET', sx(rooms.bed.x), py + top + 9 + h, '#f4f4f4');
      }
      if (beat === 'study') {
        SKILLS.forEach(([s, col], i) => {
          const k1 = (bt - 0.25 - i * 0.28) / 0.3;
          if (k1 <= 0) return;
          ctx.globalAlpha = out3(k1);
          const w = textW(s) + 8;
          plate(ctx, s, sx(rooms.study.x) + (i % 2 === 0 ? -w / 2 - 3 : w / 2 + 3), py + top + 5 + Math.floor(i / 2) * 15 + Math.round(5 * (1 - out3(k1))), col);
        });
      }
      ctx.globalAlpha = 1;
    },
  };
}
