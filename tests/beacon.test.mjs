// Tests for the visitor alerts. They run offline: Telegram is a fake local server.
//   npm test
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, describe, test } from 'node:test';

import { judge, trafficSource } from '../api/_lib/bot.js';
import { identifyCrawler } from '../api/_lib/crawlers.js';
import { formatEnd, formatEvent } from '../api/_lib/format.js';
import { parseBeacon } from '../api/_lib/payload.js';
import { classifyPath, isReportablePath } from '../api/_lib/paths.js';
import { decodeSettings, encodeSettings, parseDuration, resetSettingsCache } from '../api/_lib/settings.js';
import { expandIpv6, reverseName } from '../api/_lib/verify.js';

const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const GEO = { ip: '10.0.0.1', city: 'Pune', region: 'MH', country: 'India', countryCode: 'IN', flag: '🇮🇳', datacenter: false, mobile: false, precision: 'city', source: 'vercel' };

const visit = (over = {}) => ({
  v: 1, sid: 'abc123def', kind: 'arrival', path: '/', title: 'Career Mode', referrer: '',
  visitor: { returning: false, visitCount: 1, sinceLastMs: null, pageLoads: 1 },
  sessionMs: 30_000, activeMs: 20_000,
  pages: [{ path: '/', t: 0 }], actions: [], activity: [],
  scroll: { maxPx: 4000, maxPct: 40, milestones: [25], events: 60 },
  game: { furthest: 12, total: 31, chapter: 'Chapter 3 of 6: The gap', coins: 4, coinsTotal: 40, skills: 27, skillsTotal: 67, level: 4, phone: true },
  signals: { pointerMoves: 0, clicks: 2, keys: 0, touches: 40, visibilityChanges: 0, firstActionMs: 4000, lastActionMs: 20000, webdriver: false, touchSupport: true, cookiesEnabled: true, doNotTrack: false, languages: 2, plugins: 5, hardwareConcurrency: 8, deviceMemory: 8, timezone: 'Asia/Kolkata', language: 'en-IN' },
  device: { screenW: 390, screenH: 844, viewportW: 390, viewportH: 760, dpr: 3 },
  ...over,
});

describe('payload', () => {
  test('rejects anything that is not a beacon', () => {
    assert.equal(parseBeacon(null), null);
    assert.equal(parseBeacon({ v: 1, kind: 'arrival', sid: 'x', path: '/' }), null, 'sid too short');
    assert.equal(parseBeacon({ v: 1, kind: 'nope', sid: 'abcdefgh', path: '/' }), null);
    assert.equal(parseBeacon({ v: 1, kind: 'arrival', sid: 'abcdefgh', path: 'http://evil' }), null);
    assert.equal(parseBeacon({ v: 1, kind: 'event', sid: 'abcdefgh', path: '/' }), null, 'an event needs an activity');
  });
  test('bounds every field and keeps the game progress', () => {
    const p = parseBeacon(visit({ title: 'x'.repeat(999), game: { furthest: 999, total: 31, chapter: 'Chapter 6 of 6: Today' }, activity: Array(50).fill({ kind: 'tool', label: 'Opened Slide Doctor', t: 1 }) }));
    assert.equal(p.title.length, 160);
    assert.equal(p.game.furthest, 31, 'clamped to the number of stops');
    assert.equal(p.activity.length, 20);
    assert.equal(parseBeacon(visit({ activity: [{ kind: 'scan', label: 'unknown kind', t: 1 }] })).activity.length, 0);
  });
});

describe('human or bot', () => {
  test('a phone visitor who swiped through the story is human', () => {
    const v = judge(parseBeacon(visit({ kind: 'end' })), GEO, IPHONE, 'en-IN');
    assert.ok(v.score >= 80, `score ${v.score}`);
  });
  test('a declared crawler is a bot', () => {
    assert.equal(judge(parseBeacon(visit()), GEO, 'Mozilla/5.0 (compatible; Googlebot/2.1)', 'en').label, 'Bot');
  });
  test('a headless script is a bot', () => {
    const p = parseBeacon(visit({ kind: 'end', signals: { webdriver: true, languages: 0 }, device: {}, scroll: { maxPct: 100, events: 1 }, sessionMs: 500, activeMs: 0 }));
    assert.ok(judge(p, { ...GEO, datacenter: true }, 'HeadlessChrome', null).score < 20);
  });
  test('names where a visit came from', () => {
    assert.deepEqual(trafficSource('', '/?utm_source=chatgpt.com', 'hire.sumandebnath.houseofnamus.com'), { kind: 'ai', name: 'ChatGPT' });
    assert.equal(trafficSource('https://www.google.co.in/', '/').name, 'Google');
    assert.equal(trafficSource('https://www.linkedin.com/feed/', '/').name, 'LinkedIn');
    assert.equal(trafficSource('https://sumandebnath.houseofnamus.com/resume', '/').name, 'his main portfolio');
    assert.equal(trafficSource(undefined, '/').kind, 'direct');
  });
});

describe('crawlers and paths', () => {
  test('tells live AI fetches from training crawls', () => {
    assert.equal(identifyCrawler('Mozilla/5.0; ChatGPT-User/1.0; +https://openai.com/bot').kind, 'live');
    assert.equal(identifyCrawler('Mozilla/5.0; compatible; GPTBot/1.2').kind, 'ai');
    assert.equal(identifyCrawler('Claude-SearchBot/1.0').name, 'Claude-SearchBot');
    assert.deepEqual(identifyCrawler('Googlebot/2.1').verifyDomains, ['googlebot.com', 'google.com', 'googleusercontent.com']);
    assert.equal(identifyCrawler(CHROME), null);
    assert.equal(identifyCrawler('').kind, 'unknown', 'no user agent at all is a bot');
  });
  test('knows this site, and what probes look for', () => {
    assert.deepEqual(classifyPath('/'), { known: true, probe: null });
    assert.deepEqual(classifyPath('/llms-full.txt'), { known: true, probe: null });
    assert.equal(classifyPath('/.env').probe, 'env file (API keys)');
    assert.equal(classifyPath('/wp-login.php').probe, 'WordPress');
    assert.deepEqual(classifyPath('/somewhere'), { known: false, probe: null });
    assert.equal(isReportablePath('/'), true);
    assert.equal(isReportablePath('/llms.txt'), true);
    assert.equal(isReportablePath('/robots.txt'), false);
    assert.equal(isReportablePath('/og-image.png'), false);
  });
  test('builds reverse-DNS names for both IP versions', () => {
    assert.equal(reverseName('66.249.66.1'), '1.66.249.66.in-addr.arpa');
    assert.equal(expandIpv6('2001:db8::1'), '20010db8000000000000000000000001');
    assert.ok(reverseName('2001:db8::1').endsWith('.8.b.d.0.1.0.0.2.ip6.arpa'));
  });
});

describe('settings and formatting', () => {
  test('settings survive a round trip through the bot description', () => {
    const until = Date.parse('2030-01-01T10:30:00Z');
    assert.deepEqual(decodeSettings(encodeSettings({ bots: 'ai', pausedUntil: until }, 0)), { bots: 'ai', pausedUntil: until });
    assert.equal(parseDuration('2h'), 7_200_000);
    assert.equal(parseDuration('99d'), 7 * 86_400_000, 'capped at a week');
    assert.equal(parseDuration('soon'), null);
  });
  test('alerts escape whatever the browser sent', () => {
    const p = parseBeacon(visit({ kind: 'event', event: { kind: 'contact', label: '<b>Opened</b> & more', t: 5 } }));
    const text = formatEvent(p, GEO, IPHONE);
    assert.ok(text.includes('&lt;b&gt;Opened&lt;/b&gt; &amp; more'));
    assert.ok(text.includes('stop 12 of 31'));
  });
  test('the end report says how far they walked', () => {
    const text = formatEnd(parseBeacon(visit({ kind: 'end', activity: [{ kind: 'fit', label: 'Ran the fit check on their own job description', t: 9000 }] })), GEO, judge(parseBeacon(visit({ kind: 'end' })), GEO, IPHONE, 'en'), IPHONE);
    assert.ok(text.includes('walked to stop <b>12 of 31</b>'));
    assert.ok(text.includes('27/67 skills'));
    assert.ok(text.includes('Ran the fit check'));
  });
});

/* ───────── the endpoints and the middleware, against a fake Telegram ───────── */
describe('end to end', () => {
  const sent = [];
  let server;
  const site = 'https://hire.sumandebnath.houseofnamus.com';

  before(async () => {
    server = createServer((req, res) => {
      let body = '';
      req.on('data', (c) => { body += c; });
      req.on('end', () => {
        const method = req.url.split('/').pop();
        sent.push({ method, body: body ? JSON.parse(body) : {} });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true, result: method === 'getMyShortDescription' ? { short_description: '' } : {} }));
      });
    });
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    Object.assign(process.env, { TELEGRAM_API_URL: `http://127.0.0.1:${server.address().port}`, TELEGRAM_BOT_TOKEN: 'test-token', TELEGRAM_CHAT_ID: '42', TELEGRAM_WEBHOOK_SECRET: 'a-test-secret-of-enough-length' });
    resetSettingsCache();
  });
  after(() => server.close());

  const messages = () => sent.filter((s) => s.method === 'sendMessage').map((s) => s.body);
  const headers = (ua) => ({ 'user-agent': ua, 'accept-language': 'en-IN', 'x-real-ip': '10.0.0.7', 'x-vercel-ip-city': 'Pune', 'x-vercel-ip-country': 'IN', 'x-vercel-ip-country-region': 'MH', 'content-type': 'application/json' });

  test('a visit arrives, pings, and ends', async () => {
    const { POST } = await import('../api/beacon.js');
    const post = (p) => POST(new Request(`${site}/api/beacon`, { method: 'POST', headers: headers(IPHONE), body: JSON.stringify(p) }));
    assert.equal((await post(visit())).status, 204);
    assert.equal((await post(visit({ kind: 'event', event: { kind: 'fit', label: 'Ran the fit check on their own job description', t: 9000 } }))).status, 204);
    assert.equal((await post(visit({ kind: 'end', report: 1 }))).status, 204);
    assert.equal((await post({ junk: true })).status, 204, 'junk is ignored quietly');
    const m = messages();
    assert.equal(m.length, 3);
    assert.match(m[0].text, /New visitor<\/b> on Career Mode/);
    assert.match(m[0].text, /Pune/);
    assert.match(m[1].text, /Fit check run/);
    assert.match(m[2].text, /Visit ended/);
    assert.equal(m[2].disable_notification, true, 'the end report arrives silently');
    assert.equal(m[0].chat_id, '42');
  });

  test('the bot answers commands only with the secret, and only from the owner', async () => {
    const { POST } = await import('../api/telegram.js');
    const hook = (secret, chatId, text) => POST(new Request(`${site}/api/telegram`, { method: 'POST', headers: { 'x-telegram-bot-api-secret-token': secret, 'content-type': 'application/json' }, body: JSON.stringify({ message: { chat: { id: chatId }, text } }) }));
    const before = messages().length;
    assert.equal((await hook('wrong', 42, '/status')).status, 403);
    assert.equal((await hook('a-test-secret-of-enough-length', 999, '/status')).status, 200);
    assert.equal(messages().length, before, 'a stranger gets nothing');
    await hook('a-test-secret-of-enough-length', 42, '/test');
    assert.match(messages().at(-1).text, /Sample alert/);
  });

  test('the middleware reports crawlers and probes, never people, and never waits for Telegram', async () => {
    const { default: middleware } = await import('../middleware.js');
    const run = async (path, ua, ip) => {
      const waits = [];
      const res = middleware(new Request(`${site}${path}`, { headers: { ...headers(ua), 'x-real-ip': ip } }), { waitUntil: (p) => waits.push(p) });
      await Promise.all(waits);
      return { res, waits: waits.length };
    };
    const before = messages().length;
    assert.deepEqual(await run('/', CHROME, '10.0.0.8'), { res: undefined, waits: 0 }, 'a person: nothing');
    assert.equal((await run('/', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)', '10.0.0.9')).waits, 1);
    assert.equal((await run('/', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)', '10.0.0.9')).waits, 0, 'one alert per crawler per window');
    await run('/.env', 'curl/8.4.0', '10.0.0.10');
    const m = messages().slice(before);
    assert.match(m[0].text, /GPTBot<\/b> crawled a page/);
    assert.match(m[1].text, /probed for something that isn't here/);
    assert.equal((await run('/package.json', CHROME, '10.0.0.11')).res.status, 404);
  });
});
