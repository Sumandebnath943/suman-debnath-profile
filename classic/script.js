/* ─────────────────────────────────────────────
   Dual Class — game layer.
   Every word on the page is in the HTML and readable without this file.
   This adds the intro, characters, themes, XP, quests, coins and loot.
   ───────────────────────────────────────────── */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;

  /* ══ Config ══ */
  const CONFIG = { email: $('meta[name="contact-email"]')?.content || '' };

  // Pre-written emails. [Brackets] are for the sender to fill in.
  const EMAILS = {
    default: { subject: '20 minutes to talk?', body: 'Hi Suman,\n\nI came across your one-page résumé and would like to talk about [a role / a project]. Would you have 20 minutes for a call this week?\n\nA few times that work for me:\n- \n- \n\nThanks,\n[Your name]' },
    scout: { subject: 'AI product role: a 20-minute call?', body: 'Hi Suman,\n\nI’m hiring for [role] at [company], and your one-page résumé caught my eye. Would you have 20 minutes this week for a quick call about the role?\n\nA few times that work for me:\n- \n- \n\nThanks,\n[Your name]\n[Company · Role]' },
    growth: { subject: 'Marketing leadership role: a 20-minute call?', body: 'Hi Suman,\n\nI’m hiring for a marketing leadership role ([role]) at [company]. Your mix of brand, growth and AI tooling stood out. Could we talk for 20 minutes this week?\n\nA few times that work for me:\n- \n- \n\nThanks,\n[Your name]\n[Company · Role]' },
    founder: { subject: 'A problem I’d like your help with', body: 'Hi Suman,\n\nI’m working on [project] and could use help with [the problem]. My timeline is [when]. Could we talk for 20 minutes?\n\nA few times that work for me:\n- \n- \n\nThanks,\n[Your name]' },
    explorer: { subject: 'Hello from Dual Class', body: 'Hi Suman,\n\nI played through your one-page résumé and wanted to say hello. [Your note]\n\n[Your name]' },
    consult: { subject: 'Claiming my free 15-minute AI consult', body: 'Hi Suman,\n\nI unlocked the free 15-minute consult. The process my team repeats every week is:\n\n[Describe it: who does it, how often, and how long it takes]\n\nA few times that work for me:\n- \n- \n\nThanks,\n[Your name]\n[Company · Role]' },
    roasmind: { subject: 'Early access to ROASmind', body: 'Hi Suman,\n\nI’d like early access to ROASmind. We run paid campaigns on [Meta / Google / LinkedIn] and spend roughly [monthly budget].\n\nThanks,\n[Your name]\n[Company]' },
  };

  const ZONES = ['who', 'when', 'what', 'how', 'faq', 'recruit'];
  const AREA = { who: [1, 'About Suman'], when: [2, 'His career'], what: [3, 'His AI projects'], how: [4, 'How he works'], faq: [5, 'Recruiter questions'], recruit: [6, 'How to contact him'] };
  const SECTION = { who: '#about', when: '#career', what: '#projects', how: '#approach', faq: '#faq', recruit: '#contact' };
  const XP = { cls: 100, zone: 110, item: 20, fit: 60, coin: 25, loot: 30, talk: 10, objective: 50, route: 150, perLevel: 250 };
  const REWARD_NAMES = { pack: 'the AI-hiring question pack', audit: 'the free AI-visibility audit', calc: 'the AI running-cost calculator', consult: 'the free 15-minute AI consult' };
  const TOTAL_COINS = 8;

  // MIGI's lines. A character's own tips override these.
  const MIGI = {
    who: 'Hi, I’m MIGI, agent number 46 in Suman’s fleet. The other 45 are busy, so I’ll be your guide. This is his character sheet: his photo, his stats and the proof behind each one.',
    when: 'Use the buttons or scroll sideways through his career. Each level stays locked until you reach it, so watch the blocks break.',
    what: 'This is his inventory. Press “See details” on anything that looks interesting. Yes, I’m in there too.',
    how: 'These are the four rules he builds by. Every one of them exists because something went wrong first.',
    faq: 'Recruiters ask me these questions all the time, so I wrote the answers down for you.',
  };

  // Things Suman says when you click him. All true, all from his career.
  const LORE = [
    'I started an agency, IllusionFX, before it had a single client. It taught me that the urge to build survives any business plan.',
    'I once missed the group discussion at a job interview. I showed my portfolio instead, and they hired me on the spot.',
    'My 46 AI agents have cost me about five dollars so far. I still check their work.',
    'I learned SEO, ads and video editing for a Facebook page. 82,000 people followed it before anyone paid me to do this.',
    'I write up every bug that embarrassed me in a public notebook. It is the most useful thing I have written.',
    'On weekends I build games. One of my pixel villages holds elections and picks its own mayor.',
    'I trained a language model from scratch on a free cloud GPU. It turns plain English into terminal commands.',
    'I speak Bengali, Hindi and English. My code, unfortunately, only speaks English.',
  ];

  const CLASSES = {
    scout: {
      name: 'Talent Scout', recs: ['pentacmd', 'migi', 'qdex', 'banking'], starter: ['pack'],
      copy: 'Hiring for AI product management, AI product marketing or AI implementation? Email Suman; the message is already written for you, and a 20-minute call is usually enough to see whether there’s a fit.',
      perks: ['<b>You get the AI-hiring question pack now:</b> ten interview questions with strong answers and red flags.', '<b>The fit check is your first objective:</b> paste a job description and see the matching evidence.', '<b>You get a recruiter route</b> of four objectives that takes about three minutes.', '<b>Projects are sorted for you</b>, with his AI models and agents first.'],
      tips: {
        who: 'For AI product roles, the rare part is the pairing: nine years of owning business results, plus two years of building models and agents himself.',
        when: 'Levels 7 and 8 are the AI chapters. The earlier levels explain why he builds for business problems instead of demos.',
        what: 'Start with PentaCMD-47M and MIGI: one model trained from scratch, and one 46-agent fleet running in production. That second one is me.',
        how: 'These are the rules he would bring to your AI team on day one.',
      },
      route: { title: 'Scout the candidate', steps: [
        { t: 'Run the fit check on your job description.', done: (s) => s.fitDone, go: () => openFit() },
        { t: 'Open the details of one of his AI models or agents.', done: (s) => ['pentacmd', 'migi', 'qdex'].some((i) => s.inspected.has(i)), go: '#projects' },
        { t: 'Read how he works with AI.', done: (s) => s.zones.has('how'), go: '#approach' },
        { t: 'Send Suman a message.', done: (s) => s.messaged, go: () => openCompose() },
      ] },
    },
    growth: {
      name: 'Growth Lead', recs: ['crawler', 'roasmind', 'migi'], starter: ['audit'],
      copy: 'Looking for a senior brand or marketing lead who can also build the tooling? Email Suman; the message is already written for you.',
      perks: ['<b>You get the free AI-visibility audit now:</b> 53 checks on whether ChatGPT and Google can quote your site.', '<b>The marketing proof comes first:</b> return on ad spend, launches and team size.', '<b>You get a growth route</b> of four objectives through his marketing career.', '<b>Projects are sorted for you</b>, with his marketing tools first.'],
      tips: {
        who: 'Marketing comes first for him: a 21-person team, 20+ launches and 350%+ return on ad spend. The AI is how he makes a marketing team faster.',
        when: 'Levels 2 to 6 cover his marketing career, from an 82,000-follower page to running brand at a business school.',
        what: 'That One Crawler and the locked project are built for marketers: one audits AI visibility, the other runs Meta, Google and LinkedIn ads from one place.',
        how: 'Read “He writes so AI chatbots can cite him.” He did it on his own site, in public.',
      },
      route: { title: 'Audit the marketer', steps: [
        { t: 'Reach level 6, his current marketing role.', done: (s) => s.boss, go: '#career' },
        { t: 'Run your free AI-visibility audit.', done: (s) => s.used.has('audit'), go: () => openReward('audit') },
        { t: 'Read how he gets cited by AI chatbots.', done: (s) => s.zones.has('how'), go: '#approach' },
        { t: 'Send Suman a message.', done: (s) => s.messaged, go: () => openCompose() },
      ] },
    },
    founder: {
      name: 'Founder', recs: ['aegis', 'migi', 'crawler', 'banking'], starter: ['calc', 'consult'],
      copy: 'Have a hard problem and a deadline? Email Suman and describe it; he’ll tell you honestly whether he’s the right person for it.',
      perks: ['<b>You get the AI running-cost calculator now.</b>', '<b>Your free 15-minute consult unlocks instantly</b>; everyone else has to explore all six areas first.', '<b>You get a founder route</b> through security, cost and shipping.', '<b>Projects are sorted for you</b>, with his security and business builds first.'],
      tips: {
        who: 'He ships end to end, alone: strategy, design, code, launch and the marketing after.',
        when: 'The short version: he has been building things before anyone asked him to since 2011.',
        what: 'AEGIS VAULT and the Banking Co-pilot show how he handles security and trust, not just features.',
        how: 'Running cost and human approval are built into everything he ships.',
      },
      route: { title: 'Brief the builder', steps: [
        { t: 'Open the details of AEGIS VAULT.', done: (s) => s.inspected.has('aegis'), go: '#projects' },
        { t: 'Try the AI running-cost calculator.', done: (s) => s.used.has('calc'), go: () => openReward('calc') },
        { t: 'Read how he works with AI.', done: (s) => s.zones.has('how'), go: '#approach' },
        { t: 'Claim your free 15-minute consult.', done: (s) => s.used.has('consult'), go: () => openReward('consult') },
      ] },
    },
    explorer: {
      name: 'Explorer', recs: ['pixelville', 'nuno', 'qdex'], starter: [],
      copy: 'Say hello. Suman is always up for talking about odd builds, games and what broke along the way.',
      perks: ['<b>You earn double XP</b> on everything you do.', '<b>You get a coin radar:</b> the eight hidden coins sparkle so you can find them.', '<b>You get an arcade pass:</b> his games are shown first.', '<b>You get an explorer route</b> that sends you after the secrets.'],
      tips: {
        who: 'Welcome, explorer. The stats are his own ratings, but the evidence beside them is real.',
        when: 'Every level has a real story behind it. Click Suman at the top of the page to hear a few.',
        what: 'Play NUNO with friends, or build a village in PixelVille and walk around inside it.',
        how: 'His notebook is where he writes up what broke. Start with the five-dollar story.',
      },
      route: { title: 'Find the secrets', steps: [
        { t: 'Find three hidden coins.', done: (s) => s.coins.size >= 3, go: () => toast('Coins hide in plain sight. With your <b>coin radar</b>, look for the sparkle.') },
        { t: 'Hear three stories by clicking Suman.', done: (s) => s.heard.size >= 3, go: '#top' },
        { t: 'Discover all six areas.', done: (s) => s.zones.size >= 6, go: () => goTo(SECTION[ZONES.find((z) => !state.zones.has(z)) || 'recruit']) },
        { t: 'Say hello to Suman.', done: (s) => s.messaged, go: () => openCompose() },
      ] },
    },
  };
  const NO_ROUTE = { title: 'Explore the page', steps: [
    { t: 'Choose a character to get a free tool.', done: (s) => !!s.cls, go: () => openSelect() },
    { t: 'Discover three areas.', done: (s) => s.zones.size >= 3, go: '#about' },
    { t: 'Open a loot chest.', done: (s) => s.used.size >= 1, go: '#loot' },
    { t: 'Send Suman a message.', done: (s) => s.messaged, go: () => openCompose() },
  ] };

  /* ══ Pixel art ══ */
  const ICONS = {
    scout: ['01110000', '10001000', '10001000', '10001000', '01110000', '00001100', '00000110', '00000011'],
    growth: ['00000011', '00000011', '00011011', '00011011', '11011011', '11011011', '11011011', '11111111'],
    founder: ['00011000', '00111100', '00100100', '00111100', '00111100', '01111110', '11011011', '00100100'],
    explorer: ['00010000', '00010000', '00111000', '11111110', '00111000', '00101000', '01000100', '00000000'],
    star: ['00011000', '00011000', '11111111', '01111110', '00111100', '01111110', '11100111', '11000011'],
    lock: ['00111100', '01000010', '01000010', '11111111', '11100111', '11100111', '11111111', '00000000'],
    doc: ['01111100', '01000110', '01011111', '01000001', '01011101', '01000001', '01011101', '01111111'],
    play: ['01000000', '01100000', '01110000', '01111000', '01111000', '01110000', '01100000', '01000000'],
    shield: ['01111110', '11111111', '11100111', '11100111', '11111111', '01111110', '00111100', '00011000'],
    check: ['00000000', '00000011', '00000110', '10001100', '11011000', '01110000', '00100000', '00000000'],
    coin: ['00111100', '01111110', '11100111', '11011111', '11011111', '11100111', '01111110', '00111100'],
    bubble: ['11111111', '10000001', '10111101', '10000001', '10111001', '11111111', '01100000', '01000000'],
    chest: ['01111110', '10000001', '11111111', '10011001', '10011001', '10000001', '11111111', '00000000'],
    sound: ['00010000', '00110010', '11110001', '11110101', '11110101', '11110001', '00110010', '00010000'],
    mute: ['00010000', '00110000', '11110101', '11110010', '11110101', '11110000', '00110000', '00010000'],
    torch: ['00010000', '00111000', '00111000', '00010000', '01111100', '00010000', '00010000', '00010000'],
    sun: ['00011000', '01000010', '00111100', '10111101', '10111101', '00111100', '01000010', '00011000'],
  };

  // 16×20 chibi body shared by every human. Eyes are 2×2 with an anime highlight.
  const BODY = [
    '..khhsssssshhk..', '..khsssssssshk..', '..kswesssswesk..', '..kseesssseesk..',
    '..kbsssddsssbk..', '..kbbbbddbbbbk..', '...kbbbbbbbbk...', '....kjjttjjk....',
    '...kjjjttjjjk...', '..kjjjjttjjjjk..', '..ksjjjttjjjsk..', '..kkjjjjjjjjkk..',
    '....kppppppk....', '....kppkkppk....', '....kpk..kpk....', '...kkkk..kkkk...',
  ];
  const TOPS = {
    suman: ['....kkkkkkkk....', '...khhhhhhhhk...', '..khhhhhhhhhhk..', '..khhhhhhhhhhk..'],
    scout: ['....kkkkkkkk....', '...kHHHHHHHHk...', '.kHHHHHHHHHHHHk.', '..kkkkkkkkkkkk..'],
    growth: ['......khhk......', '...kkkhhhhkkk...', '..khhhhhhhhhhk..', '..khhhhhhhhhhk..'],
    founder: ['....kkkkkkkk....', '...kJJJJJJJJk...', '..kJJJJJJJJJJk..', '..kJJhhhhhhJJk..'],
    explorer: ['....kkkkkkkk....', '...kCCCCCCCCk...', '..kCCCCCCCCCCk..', '..kCCCCCCCCCCCCk'],
  };
  const K = '#1a1c2c';
  const W = '#f4f4f4';
  const BLUSH = '..kusssddsssuk..';
  const HUMAN_PAL = {
    suman: { k: K, w: W, h: '#333c57', s: '#c68642', d: '#8d5524', b: '#3a3550', e: K, j: '#29366f', t: '#ef7d57', p: '#566c86' },
    scout: { k: K, w: W, H: '#5d275d', h: '#333c57', s: '#e0a370', d: '#b8784c', b: '#e0a370', u: '#e8806a', e: K, j: '#257179', t: '#f4f4f4', p: '#333c57' },
    growth: { k: K, w: W, h: '#b13e53', s: '#f0c39a', d: '#d39b70', b: '#f0c39a', u: '#ef8f7a', e: K, j: '#3b5dc9', t: '#ffcd75', p: '#29366f' },
    founder: { k: K, w: W, J: '#38b764', h: '#333c57', s: '#a8693c', d: '#7a4a28', b: '#a8693c', u: '#c96a4a', e: K, j: '#38b764', t: '#a7f070', p: '#333c57' },
    explorer: { k: K, w: W, C: '#ef7d57', h: '#ffcd75', s: '#e8b07a', d: '#c08050', b: '#e8b07a', u: '#ef8f7a', e: K, j: '#41a6f6', t: '#f4f4f4', p: '#257179' },
    ghost: { k: '#333c57', w: '#566c86', h: '#566c86', s: '#566c86', d: '#566c86', b: '#566c86', e: '#333c57', j: '#566c86', t: '#566c86', p: '#566c86' },
  };
  const human = (top, pal, over = {}, blush = true) => {
    const rows = TOPS[top].concat(BODY);
    if (blush) rows[8] = BLUSH;
    Object.entries(over).forEach(([i, r]) => { rows[i] = r; });
    return { rows, pal, eyeKeys: 'ew', eyeUnder: 's', split: 15, shadow: true, shade: true };
  };
  const SPRITES = {
    suman: human('suman', HUMAN_PAL.suman, {}, false),
    scout: human('scout', HUMAN_PAL.scout),
    growth: human('growth', HUMAN_PAL.growth),
    founder: human('founder', HUMAN_PAL.founder, { 4: '..kJJssssssJJk..', 5: '..kJssssssssJk..' }),
    explorer: human('explorer', HUMAN_PAL.explorer),
    ghost: human('suman', HUMAN_PAL.ghost, {}, false),
    migi: {
      rows: ['.......y........', '.......k........', '......kkk.......', '..kkkkkkkkkkkk..', '..kggggggggggk..', '..kgkkkkkkkkgk..', '..kgkcecceckgk..', '..kgkcccccckgk..', '..kgkcckkcckgk..', '..kgkkkkkkkkgk..', '..kggggggggggk..', '...kkkkkkkkkk...', '..kkgggrrgggkk..', '.kgkgggrrgggkgk.', '.kk.kggggggk.kk.', '....kk....kk....'],
      pal: { k: K, g: '#94b0c2', c: '#29366f', e: '#73eff7', y: '#ffcd75', r: '#b13e53' }, eyeKeys: 'e', eyeUnder: 'c', glow: 'y', shade: true,
    },
    chest: {
      rows: ['..kkkkkkkkkkkk..', '.kwwwwwwwwwwwwk.', '.kwwwwwwwwwwwwk.', '.kkkkkkggkkkkkk.', '.kwwwwwggwwwwwk.', '.kwwwwwkkwwwwwk.', '.kgwwwwwwwwwwgk.', '.kgwwwwwwwwwwgk.', '.kkkkkkkkkkkkkk.'],
      pal: { k: K, w: '#c4643a', g: '#ffcd75' }, shade: true,
    },
    'chest-open': {
      rows: ['.kkkkkkkkkkkkkk.', '.kwwwwwwwwwwwwk.', '.kkkkkkkkkkkkkk.', '.kyyoyyyyyyoyyk.', '.kkkkkkggkkkkkk.', '.kwwwwwggwwwwwk.', '.kwwwwwwwwwwwwk.', '.kgwwwwwwwwwwgk.', '.kkkkkkkkkkkkkk.'],
      pal: { k: K, w: '#c4643a', g: '#ffcd75', y: '#ffcd75', o: '#f4f4f4' }, glow: 'o', shade: true,
    },
    torch: {
      rows: ['....y...', '...yy...', '..yooy..', '..orro..', '..orro..', '...rr...', '..mmmm..', '...ww...', '...ww...', '...ww...', '...ww...', '...ww...'],
      pal: { y: '#ffe08a', o: '#f4a03c', r: '#d9532c', m: '#566c86', w: '#8d5524' }, flame: 'yor',
    },
  };

  const mix = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16);
    const t = amt < 0 ? 0 : 255;
    const p = Math.abs(amt);
    const ch = (v) => Math.round(v + (t - v) * p);
    return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => ch(v).toString(16).padStart(2, '0')).join('')}`;
  };
  const spriteSVG = (name) => {
    const def = SPRITES[name];
    if (!def) return '';
    const rows = def.rows;
    const h = rows.length;
    const w = rows[0].length;
    const at = (x, y) => (y < 0 || y >= h || x < 0 || x >= w ? '.' : rows[y][x]);
    const edge = (c) => c === '.' || c === 'k';
    const skip = `k.${def.eyeKeys || ''}${def.glow || ''}${def.flame || ''}`;
    // Colour grid with simple light-from-top-left shading.
    const grid = rows.map((row, y) => [...row].map((c, x) => {
      if (c === '.') return null;
      let col = def.pal[c] || '#ff00ff';
      if ((def.eyeKeys || '').includes(c)) col = def.pal[def.eyeUnder];
      if (def.shade && !skip.includes(c)) {
        if (edge(at(x + 1, y)) || edge(at(x, y + 1))) col = mix(col, -0.24);
        else if (edge(at(x - 1, y)) || edge(at(x, y - 1))) col = mix(col, 0.16);
      }
      return { c, col };
    }));
    const runs = (y0, y1, filter) => {
      let out = '';
      for (let y = y0; y < y1; y++) {
        let x = 0;
        while (x < w) {
          const g = grid[y][x];
          if (!g || !filter(g.c)) { x++; continue; }
          let run = 1;
          while (x + run < w && grid[y][x + run] && filter(grid[y][x + run].c) && grid[y][x + run].col === g.col) run++;
          out += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${g.col}"/>`;
          x += run;
        }
      }
      return out;
    };
    const isEye = (c) => (def.eyeKeys || '').includes(c);
    const eyes = (y0, y1) => {
      let out = '';
      for (let y = y0; y < y1; y++) for (let x = 0; x < w; x++) if (isEye(rows[y][x])) out += `<rect x="${x}" y="${y}" width="1" height="1" fill="${def.pal[rows[y][x]]}"/>`;
      return out ? `<g class="px-eye">${out}</g>` : '';
    };
    const plain = (c) => !(def.glow || '').includes(c) && !(def.flame || '').includes(c);
    const split = def.split || h;
    let body = '';
    if (def.shadow) body += `<rect x="3" y="${h}" width="10" height="1" fill="#000" fill-opacity=".28"/><rect x="4" y="${h - 0.5}" width="8" height=".5" fill="#000" fill-opacity=".18"/>`;
    body += `<g>${runs(split, h, plain)}</g>`;
    body += `<g class="${def.split ? 'px-up' : ''}">${runs(0, split, plain)}${eyes(0, split)}</g>`;
    if (def.glow) body += `<g class="px-glow">${runs(0, h, (c) => def.glow.includes(c))}</g>`;
    if (def.flame) body += `<g class="px-flame">${runs(0, h, (c) => def.flame.includes(c))}</g>`;
    const vh = def.shadow ? h + 1 : h;
    return `<svg viewBox="0 0 ${w} ${vh}" aria-hidden="true" focusable="false" style="--blink:-${(Math.random() * 4).toFixed(2)}s">${body}</svg>`;
  };
  const iconSVG = (name) => {
    const rows = ICONS[name];
    if (!rows) return '';
    let r = '';
    rows.forEach((row, y) => [...row].forEach((c, x) => { if (c === '1') r += `<rect x="${x}" y="${y}" width="1" height="1"/>`; }));
    return `<svg viewBox="0 0 8 8" fill="currentColor" aria-hidden="true" focusable="false">${r}</svg>`;
  };
  const renderArt = (root = document) => {
    root.querySelectorAll('[data-icon]').forEach((el) => {
      if (el.dataset.drawn === el.dataset.icon) return;
      el.innerHTML = iconSVG(el.dataset.icon);
      el.dataset.drawn = el.dataset.icon;
    });
    root.querySelectorAll('[data-sprite]').forEach((el) => {
      if (el.dataset.drawn === el.dataset.sprite) return;
      el.innerHTML = spriteSVG(el.dataset.sprite);
      el.dataset.drawn = el.dataset.sprite;
    });
  };

  /* ══ Helpers ══ */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const enc = encodeURIComponent;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dungeon = () => html.dataset.theme === 'dungeon';
  function goTo(sel) {
    $$('dialog[open]').forEach((d) => d.close());
    $(sel)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  }

  /* ══ Save file ══ */
  const KEY = 'dualclass:v1';
  const saved = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })();
  const set = (k) => new Set(Array.isArray(saved[k]) ? saved[k] : []);
  const state = {
    cls: CLASSES[saved.cls] ? saved.cls : null,
    resume: !!saved.resume,
    sound: !!saved.sound,
    xp: +saved.xp || 0,
    zones: set('zones'), inspected: set('inspected'), rewards: set('rewards'), used: set('used'),
    coins: set('coins'), objDone: set('objDone'), routeDone: set('routeDone'), heard: set('heard'),
    fitDone: !!saved.fitDone, messaged: !!saved.messaged, boss: !!saved.boss,
    done: !!saved.done, completionist: !!saved.completionist, treasure: !!saved.treasure, listener: !!saved.listener, konami: !!saved.konami,
    trackerCollapsed: saved.trackerCollapsed,
  };
  const save = () => {
    try {
      const out = {};
      Object.entries(state).forEach(([k, v]) => { out[k] = v instanceof Set ? [...v] : v; });
      localStorage.setItem(KEY, JSON.stringify(out));
    } catch { /* storage unavailable: play continues without a save file */ }
  };

  /* ══ Sound (8-bit, synthesized, off by default) ══ */
  const SFX = {
    unlock: [[523, .06], [659, .06], [784, .06], [1047, .14]],
    smash: [[392, .04], [294, .04], [220, .05], [880, .05], [1175, .12]],
    zone: [[784, .06], [1175, .14]],
    coin: [[988, .06], [1319, .18]],
    reward: [[392, .07], [523, .07], [659, .07], [784, .07], [1047, .22]],
    fanfare: [[523, .1], [523, .1], [523, .1], [659, .26], [587, .12], [784, .4]],
    levelup: [[523, .07], [659, .07], [784, .07], [1047, .07], [1319, .25]],
    select: [[660, .04], [880, .05]],
    talk: [[440, .03], [520, .03], [480, .03]],
    gate: [[196, .12], [247, .12], [294, .12], [392, .3]],
    click: [[660, .04]],
  };
  let actx = null;
  const play = (name) => {
    if (!state.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      let t = actx.currentTime + .01;
      (SFX[name] || []).forEach(([f, d]) => {
        const o = actx.createOscillator();
        const g = actx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(.0001, t);
        g.gain.exponentialRampToValueAtTime(.04, t + .01);
        g.gain.exponentialRampToValueAtTime(.0001, t + d);
        o.connect(g).connect(actx.destination);
        o.start(t);
        o.stop(t + d + .02);
        t += d * .9;
      });
    } catch { /* audio unavailable */ }
  };

  /* ══ Feedback ══ */
  const toastsEl = $('#toasts');
  function toast(msg, ms = 3000) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = msg;
    toastsEl.appendChild(t);
    while (toastsEl.children.length > 3) toastsEl.firstElementChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 220); }, ms);
  }
  const floatsEl = $('#floats');
  const floatAt = (at, text, tone = '') => {
    if (reduced()) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;
    if (at instanceof Element) { const r = at.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top; }
    else if (at && 'x' in at) ({ x, y } = at);
    const f = document.createElement('span');
    f.className = `float ${tone}`;
    f.textContent = text;
    f.style.left = `${x}px`;
    f.style.top = `${y}px`;
    floatsEl.appendChild(f);
    setTimeout(() => f.remove(), 1000);
  };
  const banner = $('#area-banner');
  let bannerT;
  const showArea = (z, xp) => {
    const [n, name] = AREA[z];
    $('#area-kicker').textContent = dungeon() ? `[ System ] You entered floor B${n} of B6` : `You found area ${n} of 6`;
    $('#area-name').textContent = name;
    $('#area-xp').textContent = `+${xp} XP`;
    banner.classList.add('show');
    clearTimeout(bannerT);
    bannerT = setTimeout(() => banner.classList.remove('show'), 1900);
  };
  const lvlUpEl = $('#levelup');
  const levelUp = (lv) => {
    $('#levelup-lv').textContent = `You reached level ${lv}`;
    lvlUpEl.classList.remove('show');
    void lvlUpEl.offsetWidth;
    lvlUpEl.classList.add('show');
    play('levelup');
  };
  const ach = $('#achievement');
  let achT;
  function achievement(title, text, kicker) {
    $('#ach-kicker').textContent = kicker || (dungeon() ? '[ System ] Title acquired' : 'Achievement unlocked');
    $('#ach-title').textContent = title;
    $('#ach-text').innerHTML = text;
    ach.classList.add('show');
    play('fanfare');
    clearTimeout(achT);
    achT = setTimeout(() => ach.classList.remove('show'), 5500);
  }
  ach.addEventListener('click', () => ach.classList.remove('show'));

  /* ══ XP & HUD ══ */
  const levelFor = (xp) => 1 + Math.floor(xp / XP.perLevel);
  let lastLevel = null;
  let hudReady = false;
  const gain = (n, at, label) => {
    const amount = n * (state.cls === 'explorer' ? 2 : 1);
    state.xp += amount;
    if (at) floatAt(at, label || `+${amount} XP`);
    updateHUD();
    save();
    return amount;
  };
  function updateHUD() {
    const lv = levelFor(state.xp);
    const pct = ((state.xp % XP.perLevel) / XP.perLevel) * 100;
    $('#hud-lv').textContent = lv;
    $('#xp-fill').style.width = `${pct}%`;
    $('#hud').style.setProperty('--xp-pct', `${pct}%`);
    $('#hud-coins').textContent = state.coins.size;
    $$('[data-zone-link]').forEach((a) => {
      const found = state.zones.has(a.dataset.zoneLink);
      a.classList.toggle('found', found);
      a.title = `${AREA[a.dataset.zoneLink][1]}${found ? ' (discovered)' : ''}`;
    });
    if (hudReady && lastLevel !== null && lv > lastLevel) levelUp(lv);
    updateRewards(hudReady);
    refreshTracker();
    lastLevel = lv;
  }

  /* ══ Loot ══ */
  const rewardEls = $$('.reward');
  const rewardUnlocked = (el) => {
    const id = el.dataset.reward;
    return state.resume
      || state.zones.size >= +el.dataset.need
      || (state.cls && CLASSES[state.cls].starter.includes(id))
      || (id === 'pack' && state.fitDone);
  };
  function updateRewards(announce) {
    let n = 0;
    rewardEls.forEach((el) => {
      const id = el.dataset.reward;
      const open = rewardUnlocked(el);
      el.classList.toggle('locked', !open);
      el.classList.toggle('unlocked', open);
      el.style.setProperty('--p', `${Math.min(100, (state.zones.size / +el.dataset.need) * 100)}%`);
      $('.chest', el).dataset.sprite = open ? 'chest-open' : 'chest';
      renderArt(el);
      const need = $('.reward-need', el);
      need.textContent = `${need.dataset.base} You have explored ${Math.min(state.zones.size, +el.dataset.need)} of ${el.dataset.need}.`;
      if (open) n++;
      if (open && !state.resume && !state.rewards.has(id)) {
        state.rewards.add(id);
        if (announce) {
          el.classList.add('just-unlocked');
          setTimeout(() => el.classList.remove('just-unlocked'), 1000);
          setTimeout(() => { toast(`<b>A chest opened:</b> you unlocked ${REWARD_NAMES[id]}. <a href="#loot">Go to the loot ↓</a>`, 4500); play('reward'); }, 700);
        }
      }
    });
    $('#hud-loot').textContent = n;
  }

  /* ══ Quest tracker ══ */
  const tracker = $('#tracker');
  const trackerList = $('#tracker-list');
  const routeFor = () => (state.cls ? CLASSES[state.cls].route : NO_ROUTE);
  const routeKey = () => state.cls || 'none';
  const runGo = (go) => (typeof go === 'function' ? go() : goTo(go));
  let routeRendered = '';
  function refreshTracker() {
    const route = routeFor();
    const key = routeKey();
    const dones = route.steps.map((s) => !!s.done(state));
    const fresh = [];
    dones.forEach((d, i) => {
      const id = `${key}:${i}`;
      if (d && !state.objDone.has(id)) { state.objDone.add(id); fresh.push(route.steps[i].t); }
    });
    const sig = `${key}|${dones.join()}`;
    if (sig !== routeRendered) {
      routeRendered = sig;
      $('#tracker-title').textContent = route.title;
      $('#tracker-count').textContent = `${dones.filter(Boolean).length}/${dones.length}`;
      const next = dones.indexOf(false);
      trackerList.innerHTML = route.steps.map((s, i) => `<li class="${dones[i] ? 'done' : ''}${i === next ? ' next' : ''}"><button type="button" data-step="${i}"><i aria-hidden="true"></i>${s.t}</button></li>`).join('');
    }
    if (!hudReady) return;
    fresh.forEach((t, i) => setTimeout(() => {
      toast(`<b>Objective complete:</b> ${t}`);
      play('zone');
      tracker.classList.remove('pulse');
      void tracker.offsetWidth;
      tracker.classList.add('pulse');
      gain(XP.objective, $('#tracker-count'));
    }, 400 + i * 300));
    if (dones.every(Boolean) && !state.routeDone.has(key)) {
      state.routeDone.add(key);
      setTimeout(() => {
        achievement(`Route complete: ${route.title}`, `You earned ${XP.route} bonus XP. ${state.messaged ? 'Thank you for the message.' : 'One more thing: <a href="#contact">say hello</a>.'}`);
        gain(XP.route);
      }, 900);
    }
  }
  trackerList.addEventListener('click', (e) => {
    const b = e.target instanceof Element && e.target.closest('[data-step]');
    if (b) runGo(routeFor().steps[+b.dataset.step].go);
  });
  const setTrackerCollapsed = (c, persist = true) => {
    tracker.dataset.collapsed = String(c);
    $('#tracker-toggle').setAttribute('aria-expanded', String(!c));
    if (persist) { state.trackerCollapsed = c; save(); }
  };
  $('#tracker-toggle').addEventListener('click', () => setTrackerCollapsed(tracker.dataset.collapsed !== 'true'));

  /* ══ Characters ══ */
  const DEFAULT_COPY = $('#recruit-copy').textContent;
  const emailFor = (key) => {
    const e = EMAILS[key] || EMAILS[state.cls] || EMAILS.default;
    return { subject: e.subject, body: e.body + (state.konami ? '\n\nP.S. ↑↑↓↓←→←→BA' : '') };
  };
  const mailtoFor = ({ subject, body }) => `mailto:${CONFIG.email}?subject=${enc(subject)}&body=${enc(body)}`;
  const itemsEl = $('#items');
  const tipFor = (z) => (state.cls && CLASSES[state.cls].tips[z]) || MIGI[z];

  function applyClass() {
    const c = CLASSES[state.cls];
    document.body.dataset.class = state.cls || '';
    document.body.classList.toggle('radar', state.cls === 'explorer');
    $$('.item', itemsEl).forEach((it) => {
      const i = c ? c.recs.indexOf(it.dataset.item) : -1;
      it.classList.toggle('rec', i > -1);
      it.style.order = i > -1 ? String(i - 10) : '';
    });
    const you = $('#slot-you');
    you.classList.toggle('filled', !!c);
    $('#you-sprite').dataset.sprite = state.cls || 'ghost';
    $('#you-name').innerHTML = c ? c.name : '<a href="#" data-open-select>Choose a character ↑</a>';
    $('#hud-char-sprite').dataset.sprite = state.cls || 'ghost';
    $('#hud-char-name').textContent = c ? c.name : 'Choose character';
    renderArt();
    $$('[data-compose]').forEach((a) => { a.href = mailtoFor(emailFor(a.dataset.compose)); });
    $('#recruit-copy').textContent = c ? c.copy : DEFAULT_COPY;
    $$('.npc').forEach((n) => { if (n.dataset.typed) sayInstant(n); });
    routeRendered = '';
    updateHUD();
    save();
  }
  const chooseClass = (cls) => {
    const first = !state.cls;
    const changed = state.cls !== cls;
    state.cls = cls;
    applyClass();
    if (!changed) return;
    play('coin');
    toast(`You are playing as the <b>${CLASSES[cls].name}</b>. Your objectives are in the box at the bottom right.`, 4200);
    if (first) gain(XP.cls, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    if (cls === 'explorer') setTimeout(() => toast('<b>Your coin radar is on.</b> Hidden coins now sparkle.', 4000), 900);
  };

  /* ══ Character select ══ */
  const sel = $('#select');
  const heroes = $$('.hero', sel);
  const confirmBtn = $('#sel-confirm');
  let picked = null;
  const highlight = (cls, sound = true) => {
    picked = cls;
    heroes.forEach((h) => h.setAttribute('aria-checked', String(h.dataset.class === cls)));
    const c = CLASSES[cls];
    $('#perks-title').textContent = `What the ${c.name} gets:`;
    $('#perks-list').innerHTML = c.perks.map((p) => `<li><span>${p}</span></li>`).join('');
    confirmBtn.disabled = false;
    confirmBtn.textContent = `Start as the ${c.name} ▶`;
    if (sound) play('select');
  };
  let selOpener = null;
  function openSelect() {
    $$('dialog[open]').forEach((d) => d.close());
    selOpener = document.activeElement;
    sel.hidden = false;
    document.body.style.overflow = 'hidden';
    sel.classList.remove('leaving');
    sel.classList.add('entering');
    if (state.cls) highlight(state.cls, false);
    renderArt(sel);
    setTimeout(() => (heroes.find((h) => h.dataset.class === picked) || heroes[0]).focus(), 60);
  }
  const closeSelect = () => new Promise((resolve) => {
    sel.classList.remove('entering');
    sel.classList.add('leaving');
    setTimeout(() => {
      sel.hidden = true;
      sel.classList.remove('leaving');
      document.body.style.overflow = '';
      if (selOpener && document.contains(selOpener) && selOpener.offsetParent) selOpener.focus({ preventScroll: true });
      resolve();
    }, reduced() ? 0 : 360);
  });
  heroes.forEach((h) => h.addEventListener('click', () => {
    if (picked === h.dataset.class) confirmBtn.click();
    else highlight(h.dataset.class);
  }));
  confirmBtn.addEventListener('click', async () => {
    if (!picked) return;
    const cls = picked;
    await closeSelect();
    chooseClass(cls);
  });
  $('#sel-later').addEventListener('click', async () => {
    await closeSelect();
    if (!state.cls) toast('No problem. You can choose a character at any time from the top bar.');
  });
  $('#sel-resume').addEventListener('click', async () => {
    await closeSelect();
    setResume(true);
  });
  const selKeys = (e) => {
    const order = heroes.map((h) => h.dataset.class);
    const i = order.indexOf(picked);
    if (['ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); const n = order[(i + 1) % 4]; highlight(n); heroes[order.indexOf(n)].focus(); }
    else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); const n = order[(i + 3) % 4]; highlight(n); heroes[order.indexOf(n)].focus(); }
    else if (['1', '2', '3', '4'].includes(e.key)) { const n = order[+e.key - 1]; highlight(n); heroes[+e.key - 1].focus(); }
    else if (e.key === 'Enter' && picked && !(e.target instanceof HTMLButtonElement)) { e.preventDefault(); confirmBtn.click(); }
    else if (e.key === 'Escape') { e.preventDefault(); $('#sel-later').click(); }
  };
  document.addEventListener('click', (e) => {
    const t = e.target instanceof Element && e.target.closest('[data-open-select]');
    if (t) { e.preventDefault(); openSelect(); }
  });

  /* ══ Talk to Suman ══ */
  let loreIdx = 0;
  $('#talk').addEventListener('click', (e) => {
    const i = loreIdx % LORE.length;
    loreIdx++;
    $('#talk-text').textContent = LORE[i];
    const b = $('#talk-bubble');
    b.classList.remove('pop');
    void b.offsetWidth;
    b.classList.add('pop');
    play('talk');
    if (!state.heard.has(i)) {
      state.heard.add(i);
      gain(XP.talk, e.currentTarget);
      if (state.heard.size === LORE.length && !state.listener) {
        state.listener = true;
        setTimeout(() => achievement('Good listener', 'You heard all eight of Suman’s stories. He would like to hear yours: <a href="#contact">say hello</a>.'), 500);
      }
      save();
    }
  });

  /* ══ Zones ══ */
  const discover = (z) => {
    if (state.resume || state.zones.has(z) || !html.classList.contains('ready')) return;
    state.zones.add(z);
    play('zone');
    showArea(z, XP.zone * (state.cls === 'explorer' ? 2 : 1));
    gain(XP.zone);
    if (state.zones.size === ZONES.length && !state.done) {
      state.done = true;
      setTimeout(() => achievement('World explored', 'You discovered all six areas, so every chest is open. Your last reward is <a href="#contact">a 20-minute call with Suman</a>.'), 2100);
    }
    save();
  };
  const zoneEls = $$('[data-zone]');
  const discIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) discover(en.target.dataset.zone); });
  }, { rootMargin: '0px 0px -45% 0px' });
  zoneEls.forEach((z) => discIO.observe(z));
  const curIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      $$('[data-zone-link]').forEach((a) => a.classList.toggle('current', a.dataset.zoneLink === en.target.dataset.zone));
    });
  }, { rootMargin: '-45% 0px -54% 0px' });
  zoneEls.forEach((z) => curIO.observe(z));
  $$('.zone[data-jp]').forEach((z) => $('.zone-head', z)?.setAttribute('data-jp', z.dataset.jp));

  /* ══ MIGI typewriter ══ */
  function sayInstant(npc) {
    const t = $('.npc-text', npc);
    t.classList.remove('typing');
    t.textContent = tipFor(npc.dataset.tip);
    npc.dataset.typed = '1';
  }
  const typeOut = async (npc) => {
    const text = tipFor(npc.dataset.tip);
    const t = $('.npc-text', npc);
    npc.dataset.typed = '1';
    if (reduced()) { t.textContent = text; return; }
    t.classList.add('typing');
    t.textContent = '';
    for (let i = 0; i < text.length; i += 2) {
      t.textContent = text.slice(0, i + 2);
      await sleep(14);
    }
    t.textContent = tipFor(npc.dataset.tip);
    t.classList.remove('typing');
  };
  const npcIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting || en.target.dataset.typed) return;
      npcIO.unobserve(en.target);
      typeOut(en.target);
    });
  }, { threshold: .6 });
  $$('.npc').forEach((n) => { $('.npc-text', n).textContent = tipFor(n.dataset.tip); npcIO.observe(n); });

  /* ══ Career map: mystery blocks that shatter ══ */
  const levelsEl = $('#levels');
  const lvls = $$('.lvl', levelsEl);
  const skills = $$('.skill');
  const skillCount = $('#skill-count');
  skills.forEach((s) => s.classList.add('is-locked'));
  skillCount.textContent = '0';
  lvls.forEach((l) => {
    const n = +l.dataset.level;
    const cover = document.createElement('div');
    cover.className = 'lvl-cover';
    cover.setAttribute('aria-hidden', 'true');
    cover.innerHTML = '<i></i>'.repeat(32) + `<span class="lvl-cover-label"><b>?</b><span>Level ${n} is locked. Move here to break it open.</span></span>`;
    $('.lvl-card', l).appendChild(cover);
  });
  let cleared = 0;
  const breakLevel = (l) => {
    const cover = $('.lvl-cover', l);
    if (!cover) return;
    $$('i', cover).forEach((c, i) => {
      const dir = (i % 8) < 4 ? -1 : 1;
      c.style.setProperty('--dx', `${dir * (30 + Math.random() * 90)}px`);
      c.style.setProperty('--dy', `${60 + Math.random() * 140}px`);
      c.style.setProperty('--r', `${dir * (60 + Math.random() * 200)}deg`);
      c.style.setProperty('--d', `${Math.random() * .12}s`);
    });
    l.classList.add('breaking');
    setTimeout(() => { cover.remove(); l.classList.remove('breaking'); }, 900);
  };
  const clearUpTo = (n) => {
    if (n <= cleared) return;
    const from = cleared;
    cleared = n;
    let shown = 0;
    lvls.filter((l) => +l.dataset.level > from && +l.dataset.level <= n).forEach((l) => {
      const r = l.getBoundingClientRect();
      const lr = levelsEl.getBoundingClientRect();
      const onScreen = r.right > lr.left && r.left < lr.right && r.bottom > 0 && r.top < window.innerHeight && !reduced();
      setTimeout(() => {
        l.classList.add('cleared');
        const got = skills.filter((s) => +s.dataset.level === +l.dataset.level && !s.classList.contains('unlocked'));
        if (onScreen) {
          breakLevel(l);
          play('smash');
          if (got.length) setTimeout(() => floatAt($('.tag', l), `+${got.length} skill${got.length > 1 ? 's' : ''}`, 'lime'), 250);
        } else {
          $('.lvl-cover', l)?.remove();
        }
        got.forEach((s) => {
          s.classList.remove('is-locked');
          s.classList.add('unlocked', 'flash');
          setTimeout(() => s.classList.remove('flash'), 700);
        });
        skillCount.textContent = skills.filter((s) => s.classList.contains('unlocked')).length;
        if (+l.dataset.level === 6 && !state.boss) { state.boss = true; save(); updateHUD(); toast('<b>Boss level cleared:</b> his current marketing role at PIBM.'); }
      }, onScreen ? (shown++) * 300 : 0);
    });
  };
  // Only unlock levels while the map itself is on screen, so nobody misses the effect.
  const seenLevels = new Set();
  let mapVisible = false;
  const tryClear = () => { if (mapVisible && seenLevels.size) clearUpTo(Math.max(...seenLevels)); };
  const lvlIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) seenLevels.add(+en.target.dataset.level); });
    tryClear();
  }, { root: levelsEl, threshold: .6 });
  lvls.forEach((l) => lvlIO.observe(l));
  new IntersectionObserver((entries) => {
    mapVisible = entries[0].isIntersecting;
    tryClear();
  }, { threshold: .45 }).observe(levelsEl);

  const progressEl = $('#map-progress');
  const currentLevel = () => {
    const lr = levelsEl.getBoundingClientRect();
    let best = 1;
    let bestDist = Infinity;
    lvls.forEach((l) => {
      const d = Math.abs(l.getBoundingClientRect().left - lr.left);
      if (d < bestDist) { bestDist = d; best = +l.dataset.level; }
    });
    return best;
  };
  let progT;
  levelsEl.addEventListener('scroll', () => {
    clearTimeout(progT);
    progT = setTimeout(() => { progressEl.textContent = `You are looking at level ${currentLevel()} of ${lvls.length}.`; }, 80);
  }, { passive: true });
  const stepMap = (dir) => {
    const target = Math.min(lvls.length, Math.max(1, currentLevel() + dir));
    levelsEl.scrollTo({ left: lvls[target - 1].offsetLeft - levelsEl.offsetLeft - 6, behavior: reduced() ? 'auto' : 'smooth' });
    play('click');
  };
  $('#map-prev').addEventListener('click', () => stepMap(-1));
  $('#map-next').addEventListener('click', () => stepMap(1));
  levelsEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); stepMap(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); stepMap(-1); }
  });

  /* ══ Attribute bars & chain ══ */
  $$('.stat').forEach((s) => {
    const v = +s.dataset.val;
    const bar = $('.bar', s);
    bar.innerHTML = Array.from({ length: 10 }, (_, i) => `<i style="--i:${i}" class="${i < v ? 'on' : ''}"></i>`).join('');
    bar.setAttribute('aria-hidden', 'true');
  });
  const statsIO = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { $('#stats').classList.add('in-view'); statsIO.disconnect(); }
  }, { threshold: .35 });
  statsIO.observe($('#stats'));
  const chainIO = new IntersectionObserver(async (entries) => {
    if (!entries[0].isIntersecting) return;
    chainIO.disconnect();
    for (const li of $$('#chain li')) { li.classList.add('lit'); play('click'); await sleep(reduced() ? 0 : 240); }
  }, { threshold: .5 });
  chainIO.observe($('#chain'));

  /* ══ Pixelated photo reveal ══ */
  const loaded = (img) => (img.complete && img.naturalWidth)
    ? Promise.resolve(img)
    : new Promise((res, rej) => { img.addEventListener('load', () => res(img), { once: true }); img.addEventListener('error', rej, { once: true }); });
  const pixelate = (canvas, img, res, posY = 0) => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = Math.round(r.width * dpr);
    const ch = Math.round(r.height * dpr);
    canvas.width = cw;
    canvas.height = ch;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * s;
    const dh = img.naturalHeight * s;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) * posY;
    const sw = Math.max(1, res);
    const sh = Math.max(1, Math.round(res * ch / cw));
    const off = document.createElement('canvas');
    off.width = sw;
    off.height = sh;
    off.getContext('2d').drawImage(img, dx * sw / cw, dy * sh / ch, dw * sw / cw, dh * sh / ch);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(off, 0, 0, sw, sh, 0, 0, cw, ch);
  };
  const portraitImg = $('#portrait-img');
  const portrait = $('#portrait');
  const portraitCanvas = $('#portrait-px');
  const portraitLabel = $('#portrait-label');
  let portraitDone = false;
  const portraitReady = loaded(portraitImg);
  portraitReady.then(() => {
    if (reduced()) { portraitDone = true; return; }
    portrait.classList.add('rendering');
    pixelate(portraitCanvas, portraitImg, 8);
    portraitLabel.textContent = 'Loading character…';
    const io = new IntersectionObserver(async (entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const steps = [8, 12, 18, 26, 38, 56, 84];
      for (let i = 0; i < steps.length; i++) {
        pixelate(portraitCanvas, portraitImg, steps[i]);
        portraitLabel.textContent = `Rendering ${Math.round(((i + 1) / steps.length) * 100)}%`;
        await sleep(160);
      }
      portrait.classList.remove('rendering');
      portraitLabel.textContent = 'Character loaded';
      portraitDone = true;
    }, { threshold: .45 });
    io.observe(portrait);
  }).catch(() => {
    portraitImg.hidden = true;
    portrait.classList.add('no-img');
    portraitLabel.hidden = true;
  });
  const lockedThumb = $('.thumb-locked');
  const lockedImg = $('.locked-src', lockedThumb);
  const drawLocked = () => pixelate($('canvas', lockedThumb), lockedImg, 14, .5);
  loaded(lockedImg).then(drawLocked).catch(() => {});
  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      if (!portraitDone && portrait.classList.contains('rendering') && portraitImg.naturalWidth) pixelate(portraitCanvas, portraitImg, 8);
      if (lockedImg.naturalWidth) drawLocked();
    }, 150);
  });

  /* ══ Project details ══ */
  const dlg = $('#inspect');
  const openItem = (item, btn) => {
    const id = item.dataset.item;
    const locked = item.dataset.rarity === 'locked';
    const name = locked ? 'ROASmind' : $('h3', item).textContent.trim();
    $('#d-tags').innerHTML = $('.item-tags', item).innerHTML;
    $('#inspect-title').textContent = name;
    dlg.style.setProperty('--rc', getComputedStyle(item).getPropertyValue('--rc'));
    const media = $('#d-media');
    media.innerHTML = '';
    const img = $('.thumb > img', item);
    if (img) {
      const big = new Image();
      big.src = img.src.replace('w=640', 'w=1080');
      big.alt = img.alt;
      media.appendChild(big);
    }
    const content = $('#d-content');
    content.innerHTML = '';
    content.appendChild($('template.detail', item).content.cloneNode(true));
    if (typeof dlg.showModal !== 'function') { window.open($('h3 a', item)?.href || '#contact'); return; }
    dlg.showModal();
    play('click');
    if (locked && lockedImg.naturalWidth) {
      const c = document.createElement('canvas');
      media.appendChild(c);
      requestAnimationFrame(() => pixelate(c, lockedImg, 22, .5));
    }
    if (!state.inspected.has(id)) {
      state.inspected.add(id);
      gain(XP.item, btn);
      if (state.inspected.size === 9 && !state.completionist) {
        state.completionist = true;
        setTimeout(() => achievement('Completionist', 'You opened every project. That kind of thoroughness is exactly what Suman likes in a teammate.'), 500);
      }
      save();
    }
  };
  $$('.item .inspect').forEach((b) => b.addEventListener('click', () => openItem(b.closest('.item'), b)));
  $$('.game-dialog').forEach((d) => d.addEventListener('click', (e) => {
    if (e.target === d || (e.target instanceof Element && e.target.closest('[data-close-dialog]'))) d.close();
  }));

  /* ══ Compose ══ */
  const compose = $('#compose');
  const subjEl = $('#compose-subject');
  const bodyEl = $('#compose-body');
  const syncSendLinks = () => {
    const s = enc(subjEl.value);
    const b = enc(bodyEl.value);
    const to = enc(CONFIG.email);
    $('#send-gmail').href = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${s}&body=${b}`;
    $('#send-outlook').href = `https://outlook.office.com/mail/deeplink/compose?to=${to}&subject=${s}&body=${b}`;
    $('#send-mailto').href = `mailto:${CONFIG.email}?subject=${s}&body=${b}`;
  };
  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { /* ignore */ }
      ta.remove();
      return ok;
    }
  };
  function openCompose(keyOrEmail) {
    if (typeof compose.showModal !== 'function') { window.location.href = mailtoFor(emailFor(keyOrEmail)); return; }
    const e = typeof keyOrEmail === 'object' ? keyOrEmail : emailFor(keyOrEmail);
    subjEl.value = e.subject;
    bodyEl.value = e.body;
    syncSendLinks();
    $$('dialog[open]').forEach((d) => d.close());
    compose.showModal();
    play('click');
  }
  const markMessaged = () => { if (!state.messaged) { state.messaged = true; save(); updateHUD(); } };
  [subjEl, bodyEl].forEach((el) => el.addEventListener('input', syncSendLinks));
  document.addEventListener('click', (e) => {
    const a = e.target instanceof Element && e.target.closest('[data-compose]');
    if (a) { e.preventDefault(); openCompose(a.dataset.compose || undefined); }
  });
  compose.addEventListener('click', (e) => { if (e.target === compose) compose.close(); });
  ['#send-gmail', '#send-outlook', '#send-mailto'].forEach((s) => $(s).addEventListener('click', () => {
    toast('Your email app is opening. <b>Thank you for reaching out.</b>', 3500);
    markMessaged();
  }));
  $('#copy-message').addEventListener('click', async () => {
    const ok = await copyText(`To: ${CONFIG.email}\nSubject: ${subjEl.value}\n\n${bodyEl.value}`);
    toast(ok ? '<b>The message is copied.</b> Paste it into any email app.' : 'The copy didn’t work. Select the text and copy it yourself.');
    if (ok) markMessaged();
  });
  $('#cta-copy').addEventListener('click', async (e) => {
    const ok = await copyText(CONFIG.email);
    toast(ok ? `<b>Copied:</b> ${esc(CONFIG.email)}` : esc(CONFIG.email));
    if (ok) floatAt(e.currentTarget, 'Copied!', 'cyan');
  });

  /* ══ Fit check ══ */
  const FIT = [
    { k: 'AI product management', re: /\b(ai|ml)\s+product|product manag|product owner|roadmap|product discovery|\bprd\b/i, ev: 'He has shipped 26+ AI products alone, from discovery to launch.', at: '#projects' },
    { k: 'LLMs and generative AI', re: /\bllms?\b|large language|gen\s?ai|generative|\bgpt|chatgpt|claude|gemini|openai|anthropic/i, ev: 'He builds daily with Claude, GPT, Gemini and Groq.', at: '#projects' },
    { k: 'AI agents', re: /agent|agentic|autonomous|orchestrat/i, ev: 'He runs MIGI, 46 autonomous agents in production.', at: '#projects' },
    { k: 'Model training and ML', re: /machine learning|\bml\b|model training|fine-?tun|pytorch|transformer|deep learning|\bnlp\b/i, ev: 'He trained PentaCMD-47M from scratch and fine-tuned Qdex-1.5B.', at: '#projects' },
    { k: 'Evaluation and quality', re: /\bevals?\b|evaluat|benchmark|quality assurance|\bqa\b|test(ing)?\b/i, ev: '500+ automated checks guard his agents; he benchmarks models on HumanEval.', at: '#approach' },
    { k: 'RAG and knowledge', re: /\brag\b|retrieval|vector|embedding|knowledge (graph|base)/i, ev: 'His Banking Co-pilot answers from policy documents with citations.', at: '#projects' },
    { k: 'Prompt and context engineering', re: /prompt|context engineering/i, ev: 'He is certified in prompt and context engineering (2025).', at: '#career' },
    { k: 'Automation and workflows', re: /automat|workflow|n8n|zapier|make\.com|integration/i, ev: 'He uses n8n, Make and Zapier; his GenAI pipelines save his team 2–3 hours a day.', at: '#career' },
    { k: 'Hands-on building', re: /next\.?js|react|typescript|javascript|node\.?js|full[- ]?stack|front-?end|\bapis?\b|python|fastapi|prototyp|technical/i, ev: 'He ships with Next.js, TypeScript, Python, FastAPI and Supabase.', at: '#projects' },
    { k: 'Security and responsible AI', re: /security|privacy|encrypt|complian|governance|responsible ai|guardrail/i, ev: 'He built a zero-knowledge vault and a co-pilot with 38 security tests.', at: '#projects' },
    { k: 'Brand strategy', re: /\bbrand|positioning|identity|messaging|narrative/i, ev: 'He has 9 years in brand and is a Senior Brand Marketing Manager.', at: '#about' },
    { k: 'Go-to-market and launches', re: /go-to-market|\bgtm\b|launch|product marketing|\bpmm\b/i, ev: 'He has run go-to-market for 20+ programme launches.', at: '#career' },
    { k: 'Performance marketing', re: /performance marketing|paid (media|social|search)|\bppc\b|\bsem\b|google ads|meta ads|linkedin ads|\broas\b|\bcpa\b|\bcac\b|acquisition|demand gen/i, ev: 'He delivered 350%+ return on ad spend and 30% lower cost per acquisition.', at: '#career' },
    { k: 'SEO, AEO and content', re: /\bseo\b|\baeo\b|\bgeo\b|organic|content (strategy|marketing)|search visibility/i, ev: 'He grew web traffic 40–50%, and ChatGPT cites his site.', at: '#approach' },
    { k: 'Analytics and metrics', re: /analytic|data-driven|\bkpis?\b|metrics|dashboard|attribution|\bga4\b/i, ev: 'He owns launch KPIs and runs analytics-led paid campaigns.', at: '#career' },
    { k: 'Team leadership', re: /lead(ing)? (a |the )?team|team lead|people manag|manag(e|ing) (a )?team|leadership|mentor|cross-functional|stakeholder/i, ev: 'He leads a 21-person cross-functional team.', at: '#career' },
    { k: 'Budgets and vendors', re: /budget|vendor|agenc(y|ies)|procurement|p&l/i, ev: 'He manages ₹40–60 lakh in annual marketing budgets.', at: '#career' },
    { k: 'Design and creative', re: /graphic design|visual design|brand design|design system|creative direction|figma|\bux\b|\bui\b|video|motion graphics|photoshop|creative (team|lead|production|assets)/i, ev: 'He does hands-on design, video and motion, and directs creative work.', at: '#about' },
    { k: 'Websites and conversion', re: /website|wordpress|\bcms\b|landing page|\bcro\b|conversion/i, ev: 'He manages 50+ websites with over 1,000 pages.', at: '#career' },
    { k: 'Communication and writing', re: /communicat|writing|copywrit|presentation|storytell/i, ev: 'He has a BA in English and writes a public build notebook.', at: '#career' },
    { k: 'Ownership and 0 to 1', re: /0\s?(to|-|→)\s?1|zero to one|startup|founder|entrepreneur|ownership|self-starter|ambigu/i, ev: 'He has built and shipped 26+ products alone, end to end.', at: '#projects' },
    { k: 'Education sector', re: /edtech|higher ed|education|universit|academic/i, ev: 'He has 6+ years marketing a management institute.', at: '#career' },
  ];
  const NOT_RE = {
    'SQL': /\bsql\b/i, 'Salesforce': /salesforce/i, 'HubSpot': /hubspot/i, 'Marketo': /marketo/i, 'Kubernetes': /kubernetes|\bk8s\b/i,
    'AWS': /\baws\b|amazon web services/i, 'Azure': /azure/i, 'GCP': /\bgcp\b|google cloud/i, 'Java': /\bjava\b/i, 'Tableau': /tableau/i,
    'Power BI': /power\s?bi/i, 'Jira': /\bjira\b/i, 'B2B SaaS': /b2b|saas/i, 'Fintech': /fintech|financial services/i, 'Healthcare': /health/i,
    'Mobile apps': /\bios\b|android|mobile app/i, 'A/B testing': /a\/b|experimentation/i,
  };
  const SAMPLE_JD = 'AI Product Manager\n\nWe’re looking for an AI Product Manager to own our generative AI roadmap. You’ll work with engineering and design to ship LLM-powered features and AI agents, define evaluation metrics, and launch them to market with our product marketing team.\n\nYou have experience shipping AI products end to end, hands-on familiarity with prompt engineering, RAG and model evaluation, strong communication and stakeholder management, and comfort with ambiguity and a 0 to 1 mindset. Bonus: SQL, experience in B2B SaaS, and a track record of go-to-market launches.';
  const fitDlg = $('#fitcheck');
  const fitInput = $('#fit-input');
  const fitResult = $('#fit-result');
  let lastFit = null;
  function openFit() {
    $$('dialog[open]').forEach((d) => d.close());
    if (typeof fitDlg.showModal === 'function') fitDlg.showModal();
    play('click');
    setTimeout(() => fitInput.focus(), 50);
  }
  document.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.closest('[data-fitcheck]')) { e.preventDefault(); openFit(); }
  });
  const runFit = () => {
    const jd = fitInput.value.trim();
    fitResult.hidden = false;
    if (jd.split(/\s+/).length < 25) {
      fitResult.innerHTML = '<p class="fit-heads">Paste a bit more of the job description, at least a couple of sentences, so the match is useful.</p>';
      return;
    }
    const hits = FIT.filter((g) => g.re.test(jd));
    const gaps = Object.keys(NOT_RE).filter((t) => NOT_RE[t].test(jd));
    const total = hits.length + gaps.length;
    const ratio = total ? hits.length / total : 0;
    const verdict = ratio >= .75 ? ['It’s a strong match.', ''] : ratio >= .5 ? ['It’s a good match.', 'mid'] : ['It’s a partial match.', 'low'];
    const cs = /computer science|\bcs degree|degree in (cs|engineering)|b\.?tech|bachelor'?s in (computer|engineering)/i.test(jd);
    const title = (jd.split('\n').find((l) => l.trim()) || 'this role').trim().slice(0, 80);
    lastFit = { title, hits, gaps, verdict: verdict[0] };
    fitResult.innerHTML = `
      <div class="fit-score">
        <span class="fit-verdict ${verdict[1]}">${verdict[0]}</span>
        <span class="fit-meter" aria-hidden="true">${Array.from({ length: 10 }, (_, i) => `<i class="${i < Math.round(ratio * 10) ? 'on' : ''}"></i>`).join('')}</span>
        <span class="fit-num">${hits.length} of the ${total} requirements we found have evidence on this page.</span>
      </div>
      ${hits.length ? `<p class="fit-h">Requirements with evidence on this page</p><ul class="fit-list">${hits.map((h) => `<li><b>${h.k}</b><span>${h.ev}</span><a href="${h.at}" data-close-dialog>See the evidence ↓</a></li>`).join('')}</ul>` : ''}
      ${gaps.length ? `<p class="fit-h">Requirements this page doesn’t cover, which are worth asking him about</p><div class="fit-gaps">${gaps.map((g) => `<span class="chip">${g}</span>`).join('')}</div>` : ''}
      ${cs ? '<p class="fit-heads">This job description mentions a computer science or engineering degree. Suman doesn’t have one, and he makes the case for why that shouldn’t matter here: <a href="https://sumandebnath.houseofnamus.com/notebook/ai-product-role-without-cs-degree" target="_blank" rel="noopener">read his argument ↗</a></p>' : ''}
      <p class="tool-fine">This is keyword matching, not an AI judgement. It points to the evidence so you can check it yourself.</p>
      <div class="tool-actions">
        <button class="btn btn-gold btn-sm" type="button" data-fit-email>Email Suman about this role</button>
        <button class="btn btn-ghost btn-sm" type="button" data-fit-copy>Copy this summary</button>
      </div>`;
    play('reward');
    if (!state.fitDone) {
      state.fitDone = true;
      toast('<b>Your scout report is filed.</b>');
      gain(XP.fit, $('#fit-run'));
    }
  };
  $('#fit-sample').addEventListener('click', () => { fitInput.value = SAMPLE_JD; runFit(); });
  $('#fit-run').addEventListener('click', runFit);
  const fitSummary = () => {
    if (!lastFit) return '';
    const { title, hits, gaps, verdict } = lastFit;
    return [`Fit check: Suman Debnath for ${title}`, `${verdict} ${hits.length} of ${hits.length + gaps.length} requirements have evidence.`, '', ...hits.map((h) => `✓ ${h.k}: ${h.ev}`), ...(gaps.length ? ['', `To ask him about: ${gaps.join(', ')}`] : []), '', 'Profile: https://hiresumandebnath.houseofnamus.com/'].join('\n');
  };
  fitResult.addEventListener('click', async (e) => {
    if (!(e.target instanceof Element)) return;
    if (e.target.closest('[data-fit-copy]')) {
      const ok = await copyText(fitSummary());
      toast(ok ? '<b>The summary is copied.</b> Paste it into your notes or your applicant tracking system.' : 'The copy didn’t work. Select the text and copy it yourself.');
    }
    if (e.target.closest('[data-fit-email]')) {
      openCompose({ subject: `Role: ${lastFit.title}`, body: `Hi Suman,\n\nI ran the fit check on your page for this role. Here's what it found:\n\n${fitSummary()}\n\nWould you have 20 minutes this week to talk?\n\nA few times that work for me:\n- \n- \n\nThanks,\n[Your name]\n[Company]${state.konami ? '\n\nP.S. ↑↑↓↓←→←→BA' : ''}` });
    }
  });

  /* ══ Rewards ══ */
  const rewardDlg = $('#reward');
  const rewardBody = $('#reward-body');
  const money = (n) => `$${n < 100 ? n.toFixed(2) : Math.round(n).toLocaleString('en-US')}`;
  const TIERS = { large: [3, 15], mid: [1, 4], small: [.15, .6] };
  const wireCalc = (root) => {
    const calc = $('[data-calc]', root);
    const val = (k) => $(`[data-k="${k}"]`, calc).value;
    const update = () => {
      const runs = Math.max(0, +val('runs') || 0) * 30;
      const tin = Math.max(0, +val('tin') || 0);
      const tout = Math.max(0, +val('tout') || 0);
      const share = (+val('share') || 0) / 100;
      const cost = ([pi, po]) => runs * (tin * pi + tout * po) / 1e6;
      const all = cost(TIERS[val('tier')]);
      const routed = all * (1 - share) + cost(TIERS.small) * share;
      $('[data-out="share"]', root).textContent = `${Math.round(share * 100)}%`;
      $('[data-out="all"]', root).textContent = money(all);
      $('[data-out="routed"]', root).textContent = money(routed);
      $('[data-out="save"]', root).textContent = money(Math.max(0, all - routed));
    };
    calc.addEventListener('input', update);
    update();
  };
  const useReward = (id, at) => { if (!state.used.has(id)) { state.used.add(id); gain(XP.loot, at); } };
  function openReward(id) {
    const el = $(`.reward[data-reward="${id}"]`);
    if (el && !rewardUnlocked(el)) { goTo('#loot'); toast(`<b>That chest is still locked.</b> ${$('.reward-need', el).textContent}`); return; }
    if (id === 'consult') { useReward(id); openCompose('consult'); return; }
    $('#reward-title').textContent = `You unlocked ${REWARD_NAMES[id]}.`;
    rewardBody.innerHTML = '';
    rewardBody.appendChild($(`#tpl-${id}`).content.cloneNode(true));
    if (id === 'calc') wireCalc(rewardBody);
    $$('dialog[open]').forEach((d) => d.close());
    rewardDlg.showModal();
    play('reward');
    useReward(id);
  }
  rewardEls.forEach((el) => $('.reward-open', el).addEventListener('click', () => openReward(el.dataset.reward)));
  rewardBody.addEventListener('click', async (e) => {
    if (!(e.target instanceof Element) || !e.target.closest('[data-copy-pack]')) return;
    const text = $$('.pack li', rewardBody).map((li, i) => {
      const [q, a] = $$('p', li).map((p) => p.innerText.trim());
      return `${i + 1}. ${q}\n   ${a}`;
    }).join('\n\n');
    const ok = await copyText(`AI-hiring question pack, from Suman Debnath\n\n${text}`);
    toast(ok ? '<b>All ten questions are copied.</b>' : 'The copy didn’t work. Select the text and copy it yourself.');
  });
  rewardBody.addEventListener('submit', async (e) => {
    if (!e.target.matches('[data-audit]')) return;
    e.preventDefault();
    const url = $('#audit-url', rewardBody).value.trim();
    if (url) await copyText(url);
    window.open('https://thatonecrawler.houseofnamus.com/', '_blank', 'noopener');
    toast(url ? `<b>Copied:</b> ${esc(url)}. Paste it into the crawler that just opened.` : 'The crawler opened in a new tab.');
  });

  /* ══ Hidden coins ══ */
  $$('.coin').forEach((c) => {
    if (state.coins.has(c.dataset.coin)) c.classList.add('got');
    c.addEventListener('click', () => {
      const id = c.dataset.coin;
      if (state.coins.has(id)) return;
      state.coins.add(id);
      play('coin');
      floatAt(c, `+${XP.coin * (state.cls === 'explorer' ? 2 : 1)} XP`);
      c.classList.add('got');
      toast(`<b>You found a hidden coin.</b> That is ${state.coins.size} of ${TOTAL_COINS}.`);
      gain(XP.coin);
      if (state.coins.size === TOTAL_COINS && !state.treasure) {
        state.treasure = true;
        setTimeout(() => achievement('Treasure hunter', 'You found all eight hidden coins. That attention to detail is exactly what Suman looks for in a teammate.'), 600);
        save();
      }
    });
  });

  /* ══ Toggles: theme, sound, résumé view ══ */
  const themeBtn = $('#theme-toggle');
  const setTheme = (t, announce = true) => {
    html.dataset.theme = t;
    try { localStorage.setItem('dc:theme', t); } catch { /* ignore */ }
    const dg = t === 'dungeon';
    themeBtn.setAttribute('aria-pressed', String(dg));
    $('#theme-label').textContent = dg ? 'Daylight' : 'Dungeon';
    themeBtn.title = dg ? 'Switch back to the daylight theme' : 'Switch to the dungeon theme';
    $('.px-icon', themeBtn).dataset.icon = dg ? 'sun' : 'torch';
    renderArt(themeBtn);
    $('meta[name="theme-color"]').content = dg ? '#0d0c12' : '#41a6f6';
    if (announce) {
      play(dg ? 'gate' : 'coin');
      toast(dg ? '<b>[ System ] The gate is open.</b> You are now in the dungeon. Torches are lit.' : '<b>You are back in the daylight.</b>');
    }
  };
  themeBtn.addEventListener('click', () => setTheme(dungeon() ? 'overworld' : 'dungeon'));

  const soundBtn = $('#sound-toggle');
  function setSound(on, announce = true) {
    state.sound = on;
    soundBtn.setAttribute('aria-pressed', String(on));
    soundBtn.title = on ? 'Sound effects are on' : 'Sound effects are off';
    $('.px-icon', soundBtn).dataset.icon = on ? 'sound' : 'mute';
    renderArt(soundBtn);
    save();
    if (announce) { toast(on ? '<b>Sound is on.</b> It’s 8-bit, as nature intended.' : 'Sound is off.'); play('coin'); }
  }
  soundBtn.addEventListener('click', () => setSound(!state.sound));

  const resumeBtn = $('#resume-toggle');
  function setResume(on, { announce = true } = {}) {
    state.resume = on;
    document.body.classList.toggle('resume-mode', on);
    $('#resume').hidden = !on;
    resumeBtn.setAttribute('aria-pressed', String(on));
    $('#resume-label').textContent = on ? 'Game view' : 'Résumé view';
    resumeBtn.title = on ? 'Switch back to the game' : 'Show this page as a plain résumé';
    $('.px-icon', resumeBtn).dataset.icon = on ? 'play' : 'doc';
    renderArt(resumeBtn);
    updateRewards(false);
    save();
    if (announce) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      toast(on ? 'This is the plain résumé. Press <b>Game view</b> in the top bar to go back.' : '<b>You are back in the game.</b> Your progress was saved.');
    }
  }
  resumeBtn.addEventListener('click', () => setResume(!state.resume));

  /* ══ Keyboard ══ */
  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let k = 0;
  document.addEventListener('keydown', (e) => {
    if (!sel.hidden) { selKeys(e); return; }
    if (html.classList.contains('booting')) {
      if (e.key === 'Enter' && !$('#boot-start').hidden) { e.preventDefault(); startGame(false); }
      return;
    }
    if ((e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) || $('dialog[open]')) return;
    const key = e.key.toLowerCase();
    k = key === KONAMI[k] ? k + 1 : (key === KONAMI[0] ? 1 : 0);
    if (k === KONAMI.length) {
      k = 0;
      if (!state.konami) { state.konami = true; gain(999, null); applyClass(); }
      achievement('+999 XP', 'You clearly know your games. A P.S. has been added to your email, so Suman will know too.', 'Cheat code accepted');
    }
  });

  /* ══ New game ══ */
  $('#new-game').addEventListener('click', () => {
    try { localStorage.removeItem(KEY); sessionStorage.removeItem('dc:booted'); } catch { /* ignore */ }
    window.location.href = window.location.pathname;
  });

  /* ══ Boot: loading screen → press start → character select ══ */
  const boot = $('#boot');
  const TIPS = [
    'Tip: recruiters can check Suman’s fit for a job description in about 10 seconds.',
    'Tip: every area you discover opens a loot chest with a free tool inside.',
    'Tip: short on time? The Résumé view button turns this page into a plain résumé.',
    'Tip: eight coins are hidden around the page.',
    'Tip: click Suman at the top of the page and he will tell you a story.',
    'Tip: the torch button in the top bar switches to the dungeon theme.',
  ];
  let started = false;
  const afterBoot = (fromBoot) => {
    html.classList.add('ready');
    hudReady = true;
    if (state.resume) return;
    if (!state.cls && fromBoot) setTimeout(openSelect, reduced() ? 0 : 250);
    else if (state.cls && fromBoot) toast(`Welcome back. You are playing as the <b>${CLASSES[state.cls].name}</b>.`);
  };
  async function startGame(withSound) {
    if (started) return;
    started = true;
    try { sessionStorage.setItem('dc:booted', '1'); } catch { /* ignore */ }
    if (withSound) setSound(true, false);
    play(dungeon() ? 'gate' : 'coin');
    boot.classList.add('leaving');
    await sleep(reduced() ? 0 : 560);
    html.classList.remove('booting');
    boot.classList.remove('leaving');
    afterBoot(true);
  }
  const runBoot = async () => {
    renderArt(boot);
    const tipEl = $('#boot-tip');
    let tip = 0;
    tipEl.textContent = TIPS[tip];
    const tipT = setInterval(() => { tip = (tip + 1) % TIPS.length; tipEl.textContent = TIPS[tip]; }, 1700);
    const fill = $('#boot-fill');
    const pct = $('#boot-pct');
    const word = () => (dungeon() ? 'Opening the gate' : 'Loading');
    let p = 0;
    const setP = (v) => { p = v; fill.style.width = `${v}%`; pct.textContent = v >= 100 ? (dungeon() ? 'The gate is open: 100%' : 'Ready: 100%') : `${word()}… ${Math.round(v)}%`; };
    const ready = Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), portraitReady.catch(() => {}), sleep(reduced() ? 150 : 900)]);
    let done = false;
    Promise.race([ready, sleep(2500)]).then(() => { done = true; });
    while (!done && !started) { setP(Math.min(92, p + 6 + Math.random() * 10)); await sleep(100); }
    if (started) { clearInterval(tipT); return; }
    setP(100);
    await sleep(200);
    $('#boot-start').hidden = false;
    $('#start-mute').focus();
    clearInterval(tipT);
  };
  $('#start-mute').addEventListener('click', () => startGame(false));
  $('#start-sound').addEventListener('click', () => startGame(true));
  $('#boot-skip').addEventListener('click', () => startGame(false));

  /* ══ Init ══ */
  renderArt();
  const params = new URLSearchParams(window.location.search);
  const urlClass = params.get('class');
  if (CLASSES[urlClass]) state.cls = urlClass; // shareable: ?class=scout|growth|founder|explorer
  if (params.get('mode') === 'resume') state.resume = true; // shareable: ?mode=resume
  if (params.get('theme') === 'dungeon') html.dataset.theme = 'dungeon'; // shareable: ?theme=dungeon
  setTheme(html.dataset.theme === 'dungeon' ? 'dungeon' : 'overworld', false);
  setTrackerCollapsed(typeof state.trackerCollapsed === 'boolean' ? state.trackerCollapsed : (window.innerWidth < 720 || window.innerHeight < 640), false);
  applyClass();
  setResume(state.resume, { announce: false });
  setSound(state.sound, false);
  if (html.classList.contains('booting')) runBoot();
  else afterBoot(false);
})();
