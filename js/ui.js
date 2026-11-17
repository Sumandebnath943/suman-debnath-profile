/* Career Mode — the windows around the game: the pre-written email, the fit check,
   the free tools, the plain-text view and the "who is reading" choice. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const enc = encodeURIComponent;
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const EMAIL = ($('meta[name="contact-email"]') || {}).content || '';
const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } } };

/* ───────── who is reading ───────── */
const WHO = {
  brand: 'For a marketing hire, start with chapter 4. It has the team of 21, the 20+ launches and the 50+ websites.',
  ai: 'For an AI hire, chapter 5 has the 26+ products, the 46 agents and the model he trained from scratch.',
  founder: 'If you need something built, chapter 5 shows what he ships alone, and the last chapter has a free 15-minute consult.',
  curious: 'Welcome. There are coins along the way, and some of them need a jump.',
};
let who = store.get('cm:who') || '';
const setWho = (w) => {
  who = w; store.set('cm:who', w);
  $$('[data-who]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.who === w)));
  if (WHO[w]) $('#who-line').textContent = WHO[w];
};
$$('[data-who]').forEach((b) => b.addEventListener('click', () => setWho(b.dataset.who)));
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
$('#copy-message').addEventListener('click', (e) => copy(`To: ${EMAIL}\nSubject: ${subj.value}\n\n${body.value}`, e.currentTarget, 'Copied'));

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
$('#fit-run').addEventListener('click', runFit);
$('#fit-sample').addEventListener('click', () => { $('#fit-input').value = SAMPLE; runFit(); });

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

/* ───────── opening and closing windows ───────── */
document.addEventListener('click', (e) => {
  const t = e.target instanceof Element ? e.target : null;
  if (!t) return;
  const opener = t.closest('[data-open]');
  if (opener) {
    const d = t.closest('dialog');
    if (d) d.close();
    if (opener.dataset.open === 'compose') openCompose(opener.dataset.compose || null); else dlg(opener.dataset.open).showModal();
    return;
  }
  if (t.closest('[data-close]')) t.closest('dialog').close();
  else if (t instanceof HTMLDialogElement) t.close();      // a click on the backdrop
});

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
