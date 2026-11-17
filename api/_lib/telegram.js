// The Telegram Bot API: the few calls the beacon needs. Safe for both the Node functions and the
// edge middleware (fetch only).
//
//   TELEGRAM_BOT_TOKEN       from @BotFather
//   TELEGRAM_CHAT_ID         your chat with the bot
//   TELEGRAM_WEBHOOK_SECRET  any long random string; lets the bot take commands (/bots off…)
//
// With the token or chat id missing, every alert is a quiet no-op, so a half-configured deploy
// never breaks a page.

// Overridable only so tests can point it at a local fake.
const api = () => (process.env.TELEGRAM_API_URL || 'https://api.telegram.org').replace(/\/$/, '');

// A cold connection from a serverless region to Telegram can take over 5s; shorter timeouts dropped alerts.
const SEND_TIMEOUT_MS = 8000;
/** Telegram rejects messages over 4,096 characters. */
const MAX_TEXT = 4000;

export const telegramConfigured = () => Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
export const ownerChatId = () => process.env.TELEGRAM_CHAT_ID || '';

/** Telegram's HTML mode only needs these three escaped. */
export const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function clip(value, max) {
  const t = String(value).trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}


export async function callTelegram(method, body) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: 'not configured' };
  // Two tries: the first request from a cold container pays for TCP and TLS, and that's exactly the one
  // carrying the first alert after a deploy. A rejected request isn't retried.
  let lastError = 'request failed';
  for (let attempt = 0; attempt < 2; attempt++) {
    const c = new AbortController();
    const timer = setTimeout(() => c.abort(), SEND_TIMEOUT_MS);
    try {
      const res = await fetch(`${api()}/bot${token}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: c.signal,
        cache: 'no-store',
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.ok) return { ok: true, result: data.result };
      return { ok: false, error: `telegram ${res.status} ${clip((data && data.description) || '', 160)}` };
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'request failed';
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, error: lastError };
}

/** options: { buttons: [[{ text, data }]], silent: boolean, chatId: string } */
export async function sendTelegram(text, options = {}) {
  const chatId = options.chatId || ownerChatId();
  if (!process.env.TELEGRAM_BOT_TOKEN || !chatId) return { ok: false, error: 'not configured' };
  const sent = await callTelegram('sendMessage', {
    chat_id: chatId,
    text: clip(text, MAX_TEXT),
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    ...(options.silent ? { disable_notification: true } : {}),
    ...(options.buttons && options.buttons.length
      ? { reply_markup: { inline_keyboard: options.buttons.map((row) => row.map((b) => ({ text: b.text, callback_data: b.data }))) } }
      : {}),
  });
  if (!sent.ok) console.error('[beacon] telegram send failed:', sent.error);
  return sent;
}
