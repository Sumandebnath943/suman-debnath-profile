/* Career Mode — the windows around the game: the pre-written email, the fit check,
   the free tools, the plain-text view and the "who is reading" choice. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const enc = encodeURIComponent;
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const EMAIL = ($('meta[name="contact-email"]') || {}).content || '';
const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } } };
// Tells the visit beacon (js/beacon.js) about a moment worth knowing. Nothing is sent from here.
const track = (kind, label) => { try { window.dispatchEvent(new CustomEvent('cm:track', { detail: { kind, label } })); } catch (e) { /* never break the page */ } };
const smallScreen = window.matchMedia('(max-width: 820px), (max-aspect-ratio: 5/6)');

/* ───────── who is reading ───────── */
const WHO = {
  brand: 'MIGI will flag the stops that matter for a marketing hire, and Next will skip to them. Chapter 4 is the heart of it.',
  ai: 'MIGI will flag the stops that matter for an AI hire, and Next will skip to them. Chapter 5 is the heart of it.',
  founder: 'MIGI will flag what he can build for you, and Next will skip to it. The rooftop has a free 15-minute consult.',
  curious: 'Welcome. There are coins along the way, and a few hurdles that need a jump.',
};
const ROLE_NAME = { brand: 'a marketing hire', ai: 'an AI hire', founder: 'a client who needs something built', curious: 'a curious visitor' };
let who = store.get('cm:who') || '';
const setWho = (w) => {
  who = w; store.set('cm:who', w);
  $$('[data-who]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.who === w)));
  // Phones walk by swiping and have no Next button, so the line drops the part about it.
  if (WHO[w]) $('#who-line').textContent = smallScreen.matches ? WHO[w].replace(/, and Next will skip to (them|it)\./, '.') : WHO[w];
  window.dispatchEvent(new CustomEvent('cm:who', { detail: w }));   // the game marks the beats for this reader
};
$$('[data-who]').forEach((b) => b.addEventListener('click', () => { setWho(b.dataset.who); track('role', `Said they are here as ${ROLE_NAME[b.dataset.who] || b.dataset.who}`); }));
if (WHO[who]) setWho(who);

/* ───────── the pre-written email ───────── */
const sign = '\n\nThanks,\n';
const MAIL = {
  default: ['A role you may be right for', 'Hi Suman,\n\nI walked through your Career Mode page and would like to talk about a role.\n\nRole: \nCompany: \nA good time for a 20-minute call: '],
  brand: ['A brand marketing role for you', 'Hi Suman,\n\nI am hiring for a brand marketing role and your page caught my attention.\n\nRole: \nCompany: \nTeam size and budget: \nA good time for a 20-minute call: '],
  ai: ['An AI product role for you', 'Hi Suman,\n\nI am hiring for an AI product role and would like to hear how you would approach it.\n\nRole: \nCompany: \nWhat the product does: \nA good time for a 20-minute call: '],
  founder: ['Something I need built', 'Hi Suman,\n\nI have a problem I would like your view on.\n\nWhat I need built: \nMy deadline: \nA good time for a 20-minute call: '],
  curious: ['Hello from your Career Mode page', 'Hi Suman,\n\nI found your page and wanted to say hello.\n\n'],
  consult: ['My free 15-minute AI consult', 'Hi Suman,\n\nI would like to take up the free 15-minute AI consult.\n\nThe process my team repeats every week: \nRoughly how many hours it takes: \nA good time for the call: '],
  roasmind: ['Early access to ROASmind', 'Hi Suman,\n\nI would like early access to ROASmind.\n\nThe ad platforms I run: \nMy monthly ad spend, roughly: '],
};
const dlg = (id) => $('#dlg-' + id);
const subj = $('#compose-subject'), body = $('#compose-body');
const links = () => {
  const s = enc(subj.value), b = enc(body.value), to = enc(EMAIL);
  $('#send-gmail').href = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${s}&body=${b}`;
  $('#send-outlook').href = `https://outlook.office.com/mail/deeplink/compose?to=${to}&subject=${s}&body=${b}`;
  $('#send-mailto').href = `mailto:${EMAIL}?subject=${s}&body=${b}`;
};
function openCompose(key, extra = '') {
  const [s, b] = MAIL[key] || MAIL[who] || MAIL.default;
  subj.value = s; body.value = b + extra + sign;
  $('#compose-to').textContent = EMAIL.includes('__') ? 'Suman Debnath (the address is added before launch)' : EMAIL;
  links();
  dlg('compose').showModal();
}
[subj, body].forEach((el) => el.addEventListener('input', links));
const copy = async (text, btn, done) => {
  try { await navigator.clipboard.writeText(text); const old = btn.textContent; btn.textContent = done; setTimeout(() => { btn.textContent = old; }, 1800); } catch (e) { btn.textContent = 'Copying is blocked here'; }
};
$('#copy-message').addEventListener('click', (e) => { copy(`To: ${EMAIL}\nSubject: ${subj.value}\n\n${body.value}`, e.currentTarget, 'Copied'); track('contact', 'Copied the pre-written email'); });

/* ───────── the fit check: all of it runs in the visitor's browser ───────── */
const EVIDENCE = [
  [['brand', 'branding', 'positioning', 'identity'], 'Brand strategy: he built brands from nothing at CBS Ventures and for PIBM sister brands, and has led institutional brand marketing since 2019.'],
  [['team', 'lead', 'manage', 'leadership', 'mentor', 'direct reports'], 'Team leadership: he leads a 21-person design, web and digital team, with 12 to 15 direct reports.'],
  [['stakeholder', 'cross-functional', 'c-suite', 'executive', 'senior management', 'founder'], 'Senior stakeholders: for eight years he has reported directly to the Chairman and to the CEO, almost every working day.'],
  [['go-to-market', 'gtm', 'launch', 'product marketing'], 'Go-to-market: he ran full launches for 20+ programmes, from the brief to landing pages and lead campaigns.'],
  [['performance marketing', 'paid', 'google ads', 'meta ads', 'ppc', 'sem', 'roas', 'cpa', 'acquisition', 'demand gen', 'lead gen'], 'Paid campaigns: he plans and builds the Google Ads and Meta Ads campaigns for 20+ programme launches, from the creative and the campaign structure to remarketing and the budget plan.'],
  [['seo', 'organic', 'search engine', 'content strategy', 'aeo', 'geo'], 'SEO and content: he grew organic traffic by 40–50% across 50+ websites and 1,000+ pages.'],
  [['budget', 'vendor', 'agency', 'procurement'], 'Budgets and vendors: he owns a ₹30–40 lakh a year production budget and manages ₹40–60 lakh in marketing budgets.'],
  [['creative', 'design', 'copy', 'video', 'storytelling', 'campaign'], 'Creative direction: he has written, designed or signed off 1,000+ print and digital pieces and 150+ decks.'],
  [['deadline', 'project management', 'process', 'operations', 'workflow', 'on time'], 'Delivery: 99% of projects on time for six years, through a written-brief system he introduced.'],
  [['website', 'cms', 'ux', 'landing page', 'conversion', 'cro'], 'Websites: he shipped five search-ready sites with payment gateways in one month.'],
  [['ai', 'llm', 'generative', 'genai', 'agent', 'machine learning', 'artificial intelligence'], 'AI products: he has shipped 26+ on his own since 2024, including a 46-agent system and a language model trained from scratch.'],
  [['evaluation', 'evals', 'testing', 'quality', 'guardrail', 'responsible'], 'AI quality: 500+ automated checks guard his agent fleet, and he corrected his own benchmark from 39.0% to 42.1%.'],
  [['automation', 'automate', 'efficiency', 'productivity', 'martech'], 'Automation: his AI pipelines save the team 2–3 hours a day and removed 7–8 hours of retouching a week.'],
  [['product manager', 'product management', 'roadmap', 'prioriti', 'user research', 'requirements'], 'Product thinking: he takes products from idea to live release alone, including strategy, build, launch and marketing.'],
  [['analytics', 'data', 'reporting', 'dashboard', 'metrics', 'kpi'], 'Analytics: he is Google Analytics certified, and his AI funnels clean thousands of rows of lead data daily.'],
  [['mba', 'postgraduate', 'master'], 'Education: an MBA in Marketing, a PGP in Strategic Digital Marketing, and Generative and Agentic AI at Oxford Saïd (in progress).'],
  [['remote', 'relocat', 'hybrid', 'time zone', 'timezone'], 'Location: he is based in Pune, India (IST), and is open to remote work and relocation.'],
];
const GAPS = [
  [['computer science', 'engineering degree', 'b.tech', 'btech'], 'A computer science or engineering degree. He has an MBA in Marketing and a BA in English instead.'],
  [['python', 'java', 'c++', 'sql', 'kubernetes', 'software engineer'], 'Production code written by hand. He builds with AI coding tools and reviews what they produce.'],
  [['fmcg', 'cpg', 'd2c', 'e-commerce', 'ecommerce', 'retail', 'fintech', 'saas'], 'Years of leadership in that exact sector. Most of his marketing leadership has been in higher education.'],
  [['work authorization', 'work authorisation', 'visa', 'security clearance'], 'Work authorisation outside India. Ask him directly.'],
];
const has = (text, kw) => new RegExp(`(^|[^a-z0-9])${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}${kw.length <= 3 ? '([^a-z0-9]|$)' : ''}`, 'i').test(text);
const SAMPLE = 'Head of Brand Marketing. You will lead a team of designers and digital marketers, own the brand strategy and positioning, plan go-to-market for new launches, manage agency and vendor budgets, and run performance marketing with clear ROAS targets. 8+ years of experience, strong SEO and content skills, and comfort using generative AI to automate marketing workflows. Remote, with stakeholder management at C-suite level.';
function runFit() {
  const text = $('#fit-input').value.trim(), out = $('#fit-result');
  if (text.length < 40) { out.innerHTML = '<p class="dim">Paste a few more lines of the job description, then try again.</p>'; return; }
  const hit = EVIDENCE.filter(([k]) => k.some((w) => has(text, w))).map(([, t]) => t);
  const miss = GAPS.filter(([k]) => k.some((w) => has(text, w))).map(([, t]) => t);
  const yrs = /(\d{1,2})\s*\+?\s*(?:years|yrs)/i.exec(text);
  if (yrs) (+yrs[1] <= 9 ? hit : miss).push(+yrs[1] <= 9 ? `Experience: the role asks for ${yrs[1]}+ years, and he has 9+ years in brand and digital marketing.` : `The role asks for ${yrs[1]}+ years. He has 9+ years in brand and digital marketing.`);
  out.innerHTML = `<p class="fit-score"><b>${hit.length}</b> requirement${hit.length === 1 ? '' : 's'} in this job description ${hit.length === 1 ? 'has' : 'have'} evidence on this page.</p>`
    + (hit.length ? `<ul class="fit-list good">${hit.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '')
    + (miss.length ? `<p class="fit-score">${miss.length === 1 ? 'One thing it asks for is' : 'Some things it asks for are'} not evidenced here.</p><ul class="fit-list bad">${miss.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '')
    + '<p class="dim">This is keyword matching, not a judgement. A 20-minute call will tell you more.</p><p class="cta-row"><button class="btn btn-gold px" type="button" id="fit-mail">Email Suman about this role</button></p>';
  $('#fit-mail').addEventListener('click', () => { dlg('fit').close(); openCompose(null); });
}
// The beacon hears that the fit check ran, never what was pasted into it.
$('#fit-run').addEventListener('click', () => { runFit(); track('fit', 'Ran the fit check on their own job description'); });
$('#fit-sample').addEventListener('click', () => { $('#fit-input').value = SAMPLE; runFit(); track('fit', 'Tried the fit check with the sample job'); });

/* ───────── question pack and cost calculator ───────── */
$('#pack-copy').addEventListener('click', (e) => copy($$('#pack-list .q').map((q, i) => `${i + 1}. ${q.textContent}`).join('\n'), e.currentTarget, 'Copied'));
const PRICE = { large: [3, 15], mid: [1, 4], small: [0.15, 0.6] };
function calc() {
  const v = Object.fromEntries($$('#calc [data-k]').map((el) => [el.dataset.k, el.value]));
  const runs = Math.max(0, +v.runs || 0) * 30, tin = Math.max(0, +v.tin || 0), tout = Math.max(0, +v.tout || 0), share = (+v.share || 0) / 100;
  const cost = ([a, b]) => runs * (tin * a + tout * b) / 1e6;
  const all = cost(PRICE[v.tier]), routed = all * (1 - share) + cost(PRICE.small) * share;
  const money = (n) => '$' + (n >= 100 ? Math.round(n).toLocaleString('en-US') : n.toFixed(2));
  const set = (k, t) => { $(`[data-out="${k}"]`).textContent = t; };
  set('share', Math.round(share * 100) + '%'); set('all', money(all)); set('routed', money(routed)); set('save', money(Math.max(0, all - routed)));
}
$$('#calc [data-k]').forEach((el) => el.addEventListener('input', calc));
calc();

/* ───────── MIGI's evidence summary: every skill on the page, with the proof behind it ───────── */
function buildSummary() {
  const cm = window.__cm;
  const beats = $$('.beat').filter((b) => b.querySelector('.skills'));
  const role = (cm && cm.role) || who;
  const rel = (b) => role && role !== 'curious' && (b.dataset.for || '').split(' ').includes(role);
  const ordered = role && role !== 'curious' ? [...beats.filter(rel), ...beats.filter((b) => !rel(b))] : beats;
  const seen = cm ? cm.logged : new Set();
  const total = cm ? cm.ALL_SKILLS.length : 0;
  $('#summary-intro').textContent = `${seen.size} of ${total} skills logged on your walk${role && ROLE_NAME[role] ? `, ordered for ${ROLE_NAME[role]}` : ''}. Skills you have not reached yet are shown faded.`;
  const text = [`Suman Debnath: evidence summary (from hire.sumandebnath.houseofnamus.com)`, ''];
  $('#summary-body').innerHTML = ordered.map((b) => {
    const h = b.querySelector('h2, h1').textContent.trim();
    const proof = $$('.proof li', b).map((li) => li.textContent.replace(/\s*↗/g, '').trim());
    const skills = $$('.skills li', b).map((li) => li.textContent.trim());
    text.push(h, ...proof.map((p) => `- ${p}`), `Skills: ${skills.join(', ')}`, '');
    return `<section><h4>${esc(h)}</h4>${proof.length ? `<ul>${proof.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}<ul class="tags">${skills.map((s) => `<li class="${seen.has(s) ? '' : 'unseen'}">${esc(s)}</li>`).join('')}</ul></section>`;
  }).join('');
  text.push(`Contact: ${EMAIL} · Résumé: https://sumandebnath.houseofnamus.com/Suman_Debnath_Resume.pdf`);
  const plainText = text.join('\n');
  $('#summary-share').href = `mailto:?subject=${enc('Candidate: Suman Debnath (brand marketing + AI)')}&body=${enc(plainText.slice(0, 1800))}`;
  return plainText;
}
let summaryText = '';
$('#summary-copy').addEventListener('click', (e) => { copy(summaryText, e.currentTarget, 'Copied'); track('contact', "Copied MIGI's evidence summary"); });
$('#summary-print').addEventListener('click', () => { track('contact', "Printed MIGI's evidence summary"); window.print(); });
$('#summary-share').addEventListener('click', () => track('contact', "Emailed MIGI's evidence summary to someone"));

/* ───────── opening and closing windows ───────── */
// What each window means to the visit beacon.
const OPENED = {
  compose: ['contact', 'Opened the pre-written email to Suman'],
  consult: ['contact', 'Opened the email for the free 15-minute AI consult'],
  summary: ['contact', "Opened MIGI's evidence summary"],
  fit: ['tool', 'Opened the job fit check'],
  pack: ['tool', 'Opened the AI-hiring questions'],
  audit: ['tool', 'Opened the AI-visibility audit'],
  slides: ['tool', 'Opened Slide Doctor'],
  dpe: ['tool', 'Opened D-PE.ai prompts'],
  calc: ['tool', 'Opened the AI cost calculator'],
};
document.addEventListener('click', (e) => {
  const t = e.target instanceof Element ? e.target : null;
  if (!t) return;
  const opener = t.closest('[data-open]');
  if (opener) {
    const d = t.closest('dialog');
    if (d) d.close();
    const what = OPENED[opener.dataset.compose === 'consult' ? 'consult' : opener.dataset.open];
    if (what) track(what[0], what[1]);
    if (opener.dataset.open === 'compose') openCompose(opener.dataset.compose || null);
    else { if (opener.dataset.open === 'summary') summaryText = buildSummary(); dlg(opener.dataset.open).showModal(); }
    return;
  }
  if (t.closest('[data-close]')) t.closest('dialog').close();
  else if (t instanceof HTMLDialogElement) t.close();      // a click on the backdrop
});

/* ───────── full screen ─────────
   Browsers only allow full screen after the visitor clicks or presses a key, so it is a button (and the F key),
   never automatic. Phones that do not support it (iPhone) do not see the button. */
const fsBtn = $('#fs'), root = document.documentElement;
const canFs = !!(root.requestFullscreen || root.webkitRequestFullscreen) && (document.fullscreenEnabled || document.webkitFullscreenEnabled);
const fsOn = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
const toggleFs = () => {
  try {
    if (fsOn()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else (root.requestFullscreen || root.webkitRequestFullscreen).call(root, { navigationUI: 'hide' });
  } catch (e) { /* refused by the browser: nothing to do */ }
};
if (canFs && fsBtn) {
  fsBtn.hidden = false;
  fsBtn.addEventListener('click', toggleFs);
  const sync = () => { const on = fsOn(); fsBtn.setAttribute('aria-pressed', String(on)); fsBtn.title = on ? 'Leave full screen (F)' : 'Play in full screen (F)'; fsBtn.setAttribute('aria-label', fsBtn.title); };
  document.addEventListener('fullscreenchange', sync); document.addEventListener('webkitfullscreenchange', sync);
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'KeyF' || e.metaKey || e.ctrlKey || e.altKey || document.querySelector('dialog[open]')) return;
    const el = e.target instanceof Element ? e.target : null;
    if (el && el.closest('input, textarea, select, [contenteditable]')) return;
    toggleFs();
  });
}

/* ───────── plain-text view ───────── */
const plainBtn = $('#plain');
plainBtn.addEventListener('click', () => {
  const on = document.documentElement.classList.toggle('plain');
  plainBtn.setAttribute('aria-pressed', String(on));
  $('.long', plainBtn).textContent = on ? 'Back to the game' : 'Plain text';
  $('.short', plainBtn).textContent = on ? 'Game' : 'Text';
  window.scrollTo(0, 0);
  if (!on && window.__cm) window.__cm.resize();
});
