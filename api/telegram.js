import { timingSafeEqual } from 'node:crypto';
import { judge } from './_lib/bot.js';
import { duration, formatArrival } from './_lib/format.js';
import { parseBeacon } from './_lib/payload.js';
import { describeMode, getSettings, isPaused, MAX_PAUSE_MS, parseDuration, saveSettings } from './_lib/settings.js';
import { SITE_URL } from './_lib/site.js';
import { callTelegram, esc, ownerChatId, sendTelegram } from './_lib/telegram.js';

// The bot's webhook: commands you send it in Telegram. Run `npm run telegram:setup` once to point
// Telegram here. Only updates carrying the webhook secret are read, and only from your own chat
// (TELEGRAM_CHAT_ID); anything else is ignored.

function secretMatches(given) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const CONTROLS = [
  [
    { text: '🤖 All bots', data: 'bots:all' },
    { text: '✨ AI only', data: 'bots:ai' },
    { text: '🔕 Humans only', data: 'bots:off' },
  ],
  [
    { text: '⏸ 1 hour', data: 'pause:60' },
    { text: '⏸ 8 hours', data: 'pause:480' },
    { text: '▶️ Resume', data: 'resume' },
  ],
];

const HELP = [
  '🎮 <b>Career Mode alerts</b>',
  '',
  '/status · what\'s on, with buttons',
  '/bots off · humans only: no crawler or bot alerts',
  '/bots ai · only AI assistants and AI search crawlers',
  '/bots on · every crawler and bot',
  '/pause 2h · hold every alert (30m, 2h, 1d…)',
  '/resume · alerts back on',
  '/test · send a sample visitor alert',
].join('\n');

function untilLabel(ms) {
  const when = new Date(ms).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata', hour12: false });
  return `${when} IST (in ${duration(Math.max(0, ms - Date.now()))})`;
}

function statusText(s) {
  return [
    '🎮 <b>Career Mode alerts</b>',
    '',
    `🤖 Bot alerts: <b>${esc(describeMode(s.bots))}</b>`,
    isPaused(s) ? `⏸ <b>Paused</b> until ${untilLabel(s.pausedUntil)}` : '🔔 Human visitor alerts: <b>on</b>',
    '',
    `🩺 Health check: ${SITE_URL}/api/beacon`,
    `🙈 Mute your own browser: open ${SITE_URL}/?notrack=1 once (undo with ?notrack=0)`,
  ].join('\n');
}

function modeFrom(arg) {
  const a = (arg || '').toLowerCase();
  if (a === 'on' || a === 'all' || a === 'yes') return 'all';
  if (a === 'off' || a === 'none' || a === 'no' || a === 'humans') return 'off';
  if (a === 'ai') return 'ai';
  return null;
}

async function setMode(mode) {
  const current = await getSettings();
  const ok = await saveSettings({ ...current, bots: mode });
  if (!ok) return '⚠️ Couldn\'t save that. Telegram didn\'t accept the change; try again in a moment.';
  return mode === 'off'
    ? '🔕 <b>Bot alerts off.</b> You\'ll only hear about real human visitors.'
    : mode === 'ai'
      ? '✨ <b>AI only.</b> You\'ll hear about humans, plus AI assistants and AI search crawlers (ChatGPT, Claude, Perplexity…). Everything else stays quiet.'
      : '🤖 <b>Bot alerts on.</b> Every crawler and bot will be reported.';
}

async function pause(ms) {
  const current = await getSettings();
  const until = Date.now() + ms;
  const ok = await saveSettings({ ...current, pausedUntil: until });
  return ok ? `⏸ <b>Paused</b> until ${untilLabel(until)}. /resume to turn alerts back on sooner.` : '⚠️ Couldn\'t save that. Try again in a moment.';
}

async function resume() {
  const current = await getSettings();
  const ok = await saveSettings({ ...current, pausedUntil: null });
  return ok ? '▶️ <b>Alerts are back on.</b>' : '⚠️ Couldn\'t save that. Try again in a moment.';
}

/** A realistic sample, built by the same code as real alerts. */
export function sampleAlert() {
  const payload = parseBeacon({
    v: 1,
    sid: 'sampletest',
    kind: 'arrival',
    path: '/?utm_source=chatgpt.com',
    title: 'Hire Suman Debnath | Brand Marketing Leader & AI Product Builder',
    referrer: 'https://chatgpt.com/',
    visitor: { returning: false, visitCount: 1, sinceLastMs: null, pageLoads: 1 },
    game: { furthest: 1, total: 31, chapter: 'Chapter 1 of 6: Kolkata', phone: true },
    signals: { languages: 2, plugins: 5, hardwareConcurrency: 8, deviceMemory: 8, timezone: 'Europe/London', language: 'en-GB', cookiesEnabled: true },
    device: { screenW: 390, screenH: 844, viewportW: 390, viewportH: 760, dpr: 3 },
  });
  const geo = {
    ip: '203.0.113.7', city: 'London', region: 'England', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', timezone: 'Europe/London',
    isp: 'Example Broadband', asn: 'AS64500', datacenter: false, mobile: false, precision: 'city', source: 'vercel',
  };
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
  return `🧪 <b>Sample alert</b> (not a real visitor)\n\n${formatArrival(payload, geo, judge(payload, geo, ua, 'en-GB'), ua)}`;
}

async function handleCommand(text, chatId) {
  const [rawCommand, ...args] = text.trim().split(/\s+/);
  const command = rawCommand.toLowerCase().replace(/@.*$/, '');
  const reply = (body, buttons) => sendTelegram(body, { chatId, buttons });

  switch (command) {
    case '/start':
    case '/help':
      await reply(HELP, CONTROLS);
      return;
    case '/status':
      await reply(statusText(await getSettings()), CONTROLS);
      return;
    case '/bots': {
      const mode = modeFrom(args[0]);
      if (!mode) {
        await reply(`🤖 Bot alerts are <b>${esc(describeMode((await getSettings()).bots))}</b>.\nSend /bots off, /bots ai or /bots on.`, [CONTROLS[0]]);
        return;
      }
      await reply(await setMode(mode));
      return;
    }
    case '/pause': {
      const ms = parseDuration(args[0]);
      await reply(ms ? await pause(ms) : 'Try /pause 30m, /pause 2h or /pause 1d.');
      return;
    }
    case '/resume':
      await reply(await resume());
      return;
    case '/test':
      await reply(sampleAlert());
      return;
    default:
      if (command.startsWith('/')) await reply(`Unknown command.\n\n${HELP}`);
  }
}

async function handleButton(data, chatId, queryId) {
  let toast = 'Done';
  let message = null;
  if (data.startsWith('bots:')) {
    const mode = modeFrom(data.slice(5));
    if (mode) {
      message = await setMode(mode);
      toast = mode === 'off' ? 'Humans only' : mode === 'ai' ? 'AI bots only' : 'All bots';
    }
  } else if (data.startsWith('pause:')) {
    const minutes = Number(data.slice(6));
    if (minutes > 0) {
      message = await pause(Math.min(minutes * 60_000, MAX_PAUSE_MS));
      toast = 'Paused';
    }
  } else if (data === 'resume') {
    message = await resume();
    toast = 'Resumed';
  }
  await callTelegram('answerCallbackQuery', { callback_query_id: queryId, text: toast });
  if (message) await sendTelegram(message, { chatId });
}

export async function POST(request) {
  if (!secretMatches(request.headers.get('x-telegram-bot-api-secret-token'))) return new Response('forbidden', { status: 403 });
  let update;
  try {
    update = await request.json();
  } catch {
    return new Response('ok');
  }
  const owner = ownerChatId();
  try {
    const msg = update.message;
    const cb = update.callback_query;
    if (msg && msg.text && String(msg.chat.id) === owner) await handleCommand(msg.text, owner);
    else if (cb && cb.data && cb.message && String(cb.message.chat.id) === owner) await handleButton(cb.data, owner, cb.id);
  } catch (err) {
    console.error('[telegram] command failed:', err);
  }
  // Always 200 for a genuine update, or Telegram keeps retrying it.
  return new Response('ok');
}
