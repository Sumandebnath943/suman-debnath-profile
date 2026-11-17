import { callTelegram } from './telegram.js';

// The alert settings you change from Telegram (/bots off, /pause 2h…).
//
// The site has no database, so the settings live in Telegram itself: in the bot's short description
// (the line under its name on its profile). Only the bot's own token can change it, it survives
// redeploys, and it doubles as a readable status: "bots: off". Each server instance caches it for a
// minute, so a change reaches every instance within a minute.
//
// bots: "all" every crawler and bot · "ai" only AI assistants and AI search crawlers · "off" humans only
// pausedUntil: every alert is held until this time (ms), or null

const LABEL = '🎮 Career Mode alerts';
const CACHE_MS = 60_000;
export const MAX_PAUSE_MS = 7 * 24 * 60 * 60_000;

let cached = null;

/** BEACON_ALERT_BOTS sets the starting point before you've used /bots: 1/all (default), ai, or 0/off. */
export function defaultSettings() {
  const env = (process.env.BEACON_ALERT_BOTS || '').trim().toLowerCase();
  const bots = env === '0' || env === 'off' || env === 'false' ? 'off' : env === 'ai' ? 'ai' : 'all';
  return { bots, pausedUntil: null };
}

const iso = (ms) => new Date(ms).toISOString().slice(0, 16) + 'Z';

export function encodeSettings(s, now = Date.now()) {
  const parts = [LABEL, `bots: ${s.bots}`];
  if (s.pausedUntil && s.pausedUntil > now) parts.push(`paused until ${iso(s.pausedUntil)}`);
  return parts.join(' · ');
}

export function decodeSettings(text, fallback = defaultSettings()) {
  if (!text) return fallback;
  const bots = (text.match(/bots: (all|ai|off)\b/) || [])[1];
  const until = (text.match(/paused until (\d{4}-\d\d-\d\dT\d\d:\d\dZ)/) || [])[1];
  const pausedUntil = until ? Date.parse(until) : NaN;
  return { bots: bots || fallback.bots, pausedUntil: Number.isFinite(pausedUntil) ? pausedUntil : null };
}

/** "30m", "2h", "1d", "90" (minutes) → milliseconds. */
export function parseDuration(input) {
  if (!input) return 60 * 60_000;
  const m = input.trim().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(m|min|mins|minutes?|h|hr|hrs|hours?|d|days?)?$/);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = (m[2] || 'm')[0];
  const ms = n * (unit === 'd' ? 86_400_000 : unit === 'h' ? 3_600_000 : 60_000);
  return ms > 0 ? Math.min(ms, MAX_PAUSE_MS) : null;
}

export const isPaused = (s, now = Date.now()) => Boolean(s.pausedUntil && s.pausedUntil > now);

export async function getSettings() {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;
  const res = await callTelegram('getMyShortDescription', {});
  // If Telegram can't be reached, keep the last known settings rather than flipping to defaults.
  const value = res.ok ? decodeSettings(res.result && res.result.short_description) : cached ? cached.value : defaultSettings();
  cached = { at: Date.now(), value };
  return value;
}

export async function saveSettings(next) {
  const res = await callTelegram('setMyShortDescription', { short_description: encodeSettings(next) });
  if (res.ok) cached = { at: Date.now(), value: next };
  return res.ok;
}

/** For tests. */
export function resetSettingsCache() {
  cached = null;
}

export function describeMode(mode) {
  return mode === 'all' ? 'on: every crawler and bot' : mode === 'ai' ? 'AI only: AI assistants and AI search crawlers, nothing else' : 'off: real human visitors only';
}
