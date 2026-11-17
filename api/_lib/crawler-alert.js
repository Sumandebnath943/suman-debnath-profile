import { identifyCrawler, isAiAgent } from './crawlers.js';
import { clientIp, flagFor } from './geo.js';
import { classifyPath, isReportablePath } from './paths.js';
import { getSettings, isPaused } from './settings.js';
import { clip, esc, sendTelegram, telegramConfigured } from './telegram.js';
import { verifyCrawler } from './verify.js';

// Telegram alerts for crawler and bot visits, fired from the middleware.
//
// Everything that decides whether to alert (user agent, path, dedupe) runs synchronously and cheaply;
// only the settings read, the DNS check and the send are deferred to waitUntil, so an alert never adds
// latency to a page and a Telegram outage never slows the site.

/**
 * One alert per crawler per visitor per window, so Googlebot reading the page and its files is one
 * message, with "+N more requests" on the next one. Live AI fetches are per page (each is a different
 * question someone asked), and probes are one per attacker. Best-effort: each edge instance remembers on
 * its own, which still catches the bursts that arrive together.
 */
const WINDOW_MS = 10 * 60_000;
const PROBE_WINDOW_MS = 30 * 60_000;
/** Telegram allows about 20 messages a minute per chat and drops the rest. */
const MAX_PER_MINUTE = 15;

const seen = new Map();
let minute = { start: 0, count: 0 };

function claim(key, windowMs, now = Date.now()) {
  if (seen.size > 2000) seen.clear();
  const last = seen.get(key);
  if (last && now - last.at < windowMs) {
    last.skipped += 1;
    return { send: false, skipped: 0 };
  }
  if (now - minute.start > 60_000) minute = { start: now, count: 0 };
  if (minute.count >= MAX_PER_MINUTE) return { send: false, skipped: 0 };
  minute.count += 1;
  seen.set(key, { at: now, skipped: 0 });
  return { send: true, skipped: last ? last.skipped : 0 };
}

const LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/;
const ICON = { live: '🔥', ai: '🤖', search: '🔎', social: '🔗', seo: '📈', tool: '🛠', unknown: '❔' };
const KIND_LABEL = {
  live: 'AI assistant, fetching for a person',
  ai: 'AI search / AI training',
  search: 'search engine',
  social: 'link preview',
  seo: 'SEO crawler',
  tool: 'script or tool',
  unknown: 'unidentified bot',
};
const MEANING = {
  live: 'Someone asked this assistant a question just now, and it came here to answer it.',
  social: 'Somebody pasted a link to this page somewhere, and the platform is building its preview card.',
};
const verb = (kind) => (kind === 'live' ? 'fetched a page' : kind === 'social' ? 'built a link preview' : 'crawled a page');

export function formatCrawler({ crawler, pathname, verdict, headers: h, ip, skipped, verification }) {
  const spoofed = verification && verification.state === 'spoofed';
  const name = esc(crawler.name);
  const headline = verdict.probe
    ? `🚨 <b>${name}</b> probed for something that isn't here`
    : spoofed
      ? `🎭 <b>Fake ${name}</b> ${verb(crawler.kind)}`
      : `${ICON[crawler.kind]} <b>${name}</b> ${verb(crawler.kind)}${verification && verification.state === 'verified' ? ' ✅' : ''}`;

  const decode = (v) => {
    try { return v ? decodeURIComponent(v) : ''; } catch { return v || ''; }
  };
  const country = h.get('x-vercel-ip-country') || '';
  const place = [decode(h.get('x-vercel-ip-city')), h.get('x-vercel-ip-country-region'), country].filter(Boolean).join(', ');
  const asn = h.get('x-vercel-ip-as-number');
  const referer = h.get('referer');
  const ua = h.get('user-agent') || '';

  const lines = [
    headline,
    '',
    verdict.known ? `📄 <code>${esc(pathname)}</code>` : `📄 <code>${esc(clip(pathname, 120))}</code> · <b>404</b>, no such page`,
    verdict.probe ? `⚠️ Fishing for ${esc(verdict.probe)}` : '',
    `🏷 ${crawler.vendor ? `${esc(crawler.vendor)} · ` : ''}${KIND_LABEL[crawler.kind]}`,
    verification && verification.state === 'verified' ? `✅ verified by reverse DNS: <code>${esc(verification.host)}</code>` : '',
    spoofed ? `🎭 <b>not really ${name}</b>: this IP doesn't belong to ${esc(crawler.vendor || 'them')}${verification.host ? ` (<code>${esc(verification.host)}</code>)` : ''}` : '',
    place ? `📍 ${esc(place)}${flagFor(country) ? ` ${flagFor(country)}` : ''}` : '',
    `🌐 <code>${esc(ip)}</code>${asn ? ` · AS${esc(asn)}` : ''}`,
    referer ? `↩️ ${esc(clip(referer, 200))}` : '',
    ua ? `🖥 <code>${esc(clip(ua, 300))}</code>` : '🖥 <i>no user agent</i>',
    skipped ? `➕ ${skipped} more request${skipped === 1 ? '' : 's'} from it since the last alert` : '',
  ].filter(Boolean);

  const meaning = verdict.probe
    ? 'Nothing was served. Every public site gets these; it\'s background noise worth knowing about.'
    : spoofed
      ? 'Something is pretending to be a search engine. Treat it as an ordinary scraper.'
      : MEANING[crawler.kind];
  if (meaning) lines.push('', `<i>${meaning}</i>`);
  return lines.join('\n');
}

/** Shown under crawler alerts, so muting bots is one tap away. */
export const MUTE_BUTTONS = [[{ text: '🔕 Humans only', data: 'bots:off' }, { text: '✨ AI bots only', data: 'bots:ai' }]];

/** Returns a promise for waitUntil, or null when there's nothing to report. */
export function crawlerAlert(request) {
  if (!telegramConfigured()) return null;
  const url = new URL(request.url);
  // Local work never alerts, unless you ask it to. (curl is a recognised agent.)
  if (process.env.BEACON_DEBUG !== '1' && LOCAL.test(url.hostname)) return null;

  const crawler = identifyCrawler(request.headers.get('user-agent'));
  if (!crawler) return null;

  // Probes first: nearly every probe target looks like a file (.env, wp-login.php), which the asset
  // filter would otherwise throw away.
  const pathname = url.pathname;
  const verdict = classifyPath(pathname);
  if (!verdict.probe && !isReportablePath(pathname)) return null;

  const ip = clientIp(request.headers);
  const key = verdict.probe ? `probe|${ip}` : crawler.kind === 'live' ? `${crawler.name}|${ip}|${pathname}` : `${crawler.name}|${ip}`;
  const { send, skipped } = claim(key, verdict.probe ? PROBE_WINDOW_MS : WINDOW_MS);
  if (!send) return null;

  const headers = new Headers(request.headers);
  return (async () => {
    const settings = await getSettings();
    if (isPaused(settings) || settings.bots === 'off') return;
    if (settings.bots === 'ai' && (!isAiAgent(crawler) || verdict.probe)) return;
    const verification = crawler.verifyDomains ? await verifyCrawler(ip, crawler.verifyDomains) : undefined;
    const text = formatCrawler({ crawler, pathname, verdict, headers, ip, skipped, verification });
    // Only an AI answering someone's question right now is worth a sound.
    await sendTelegram(text, { silent: crawler.kind !== 'live', buttons: MUTE_BUTTONS });
  })().catch(() => undefined);
}
