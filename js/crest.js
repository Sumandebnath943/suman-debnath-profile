/* Career Mode — draws the stacked crest logo into the top bar and the loading screen.
   It runs before the game script, so the logo is there while the world is still being built. */
import { crest } from './kit.js';

const SIZES = { hud: [2, 3, 1, 1], boot: [4, 6, 4, 2] };     // word scales, plate unit, on-screen zoom
document.querySelectorAll('canvas[data-crest]').forEach((cv) => {
  const [a, b, u, zoom] = SIZES[cv.dataset.crest] || SIZES.hud;
  const c = crest(a, b, u);
  cv.width = c.width; cv.height = c.height;
  cv.getContext('2d').drawImage(c, 0, 0);
  cv.style.width = c.width * zoom + 'px'; cv.style.height = c.height * zoom + 'px';
});
document.documentElement.classList.add('crest-ready');
