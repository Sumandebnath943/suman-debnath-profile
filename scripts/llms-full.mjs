// Builds llms-full.txt: the whole Career Mode story as plain Markdown, for AI assistants and answer
// engines that would rather not dig through a game. Everything comes from index.html, so the two can't
// drift apart. Run after any change to the story, the quest logs or the FAQ:
//
//   npm run llms

import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const SITE = 'https://hire.sumandebnath.houseofnamus.com';

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', mdash: '—', ndash: '–', hellip: '…', middot: '·', rarr: '→' };
const decode = (s) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => (e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENT[e.toLowerCase()] ?? m));
/** Inline HTML → Markdown text: links kept, phone-only and desktop-only hints dropped, tags stripped. */
const text = (s) =>
  decode(
    s
      .replace(/<span class="(desk-only|story-only)">[\s\S]*?<\/span>/g, '')
      .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (m, href, t) => `[${t.replace(/<[^>]+>/g, '').replace(/\s*↗\s*/g, '').trim()}](${href.replace(/&amp;/g, '&')})`)
      .replace(/<[^>]+>/g, ''),
  ).replace(/\s+/g, ' ').trim();
const one = (block, re) => { const m = block.match(re); return m ? text(m[1]) : ''; };
const all = (block, re) => [...block.matchAll(re)].map((m) => text(m[1])).filter(Boolean);

const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());   // YYYY-MM-DD, in India
const out = [
  '# Suman Debnath: the full Career Mode story',
  '',
  '> Suman Debnath is a Senior Brand Marketing Manager in Pune, India, with 9+ years in brand and digital marketing. Since 2024 he has also built and shipped 26+ AI products on his own. This file is the complete text of his one-page résumé, Career Mode, in reading order.',
  '',
  `This is the full text of ${SITE}/, where the story is told as a small pixel-art game: you scroll, and Suman walks through his career. Suman tells the story in the first person; MIGI, one of his AI agents, adds asides and logs the evidence. The short version, with a table of quotable facts, is ${SITE}/llms.txt. Last updated: ${today}.`,
];

let chapter = '';
for (const m of html.matchAll(/<article class="beat[^"]*"([^>]*)>([\s\S]*?)<\/article>/g)) {
  const attrs = m[1], body = m[2];
  const attr = (n) => (attrs.match(new RegExp(`data-${n}="([^"]*)"`)) || [])[1] || '';
  const ch = decode(attr('ch'));
  if (ch && ch !== chapter) { chapter = ch; out.push('', `## ${ch}`); }

  const say = (body.match(/<div class="say">([\s\S]*?)<\/div>\s*<div class="quest">/) || [])[1] || body;
  const quest = (body.match(/<div class="quest">([\s\S]*)$/) || [])[1] || '';
  const heading = one(say, /<h[12][^>]*>([\s\S]*?)<\/h[12]>/);
  const year = attr('year');
  out.push('', `### ${heading}${year ? ` (${year})` : ''}`);
  const story = one(say, /<p class="story"[^>]*>([\s\S]*?)<\/p>/);
  if (story) out.push('', story);
  const migi = one(say, /<p class="migi"[^>]*>([\s\S]*?)<\/p>/);
  if (migi) out.push('', `*${migi.replace(/^MIGI:\s*/, 'MIGI: ')}*`);

  const tag = one(quest, /<p class="beat-tag[^"]*">([\s\S]*?)<\/p>/).replace(/^Quest log\s*·\s*/, '');
  // Objectives lists are instructions for playing the game, not facts.
  const proof = all(quest.replace(/<ul class="proof todo">[\s\S]*?<\/ul>/g, ''), /<li[^>]*>([\s\S]*?)<\/li>/g).filter((li) => !/^\s*$/.test(li));
  const skillsBlock = (quest.match(/<ul class="skills">([\s\S]*?)<\/ul>/) || [])[1] || '';
  const skills = all(skillsBlock, /<li[^>]*>([\s\S]*?)<\/li>/g);
  const evidence = proof.filter((p) => !skills.includes(p));
  if (evidence.length) out.push('', `Evidence${tag ? ` (${tag})` : ''}:`, '', ...evidence.map((p) => `- ${p}`));
  if (skills.length) out.push('', `Skills shown: ${skills.join(', ')}.`);
  const actions = all(quest, /<(?:button|a) class="btn[^"]*"[^>]*>([\s\S]*?)<\/(?:button|a)>/g).map((a) => a.replace(/\s*[▶↗]\s*$/, ''));
  if (actions.length) out.push('', `On the page, this stop offers: ${actions.join(', ')}.`);
}

const faq = [...html.matchAll(/<details[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>\s*<\/details>/g)];
if (faq.length) {
  out.push('', '## Questions recruiters and clients ask');
  for (const [, q, a] of faq) out.push('', `### ${text(q)}`, '', text(a));
}

out.push(
  '',
  '## Contact',
  '',
  '- Email: hire.sumandebnath@gmail.com',
  '- Résumé (PDF): https://sumandebnath.houseofnamus.com/Suman_Debnath_Resume.pdf',
  '- LinkedIn: https://linkedin.com/in/suman-debnath-a528653a1',
  '- Main portfolio: https://sumandebnath.houseofnamus.com/',
  '',
);

writeFileSync(new URL('llms-full.txt', root), out.join('\n'));
console.log(`llms-full.txt: ${out.length} lines, ${faq.length} questions.`);
