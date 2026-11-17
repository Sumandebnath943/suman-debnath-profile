# Visitor alerts (the beacon)

Career Mode pings Suman on Telegram when people, and bots, visit. It is a port of That One Crawler's beacon, rebuilt for a static page with no framework and no dependencies.

## What you get

| Alert | When | Sound |
| --- | --- | --- |
| 🟢 **New visitor** / 🔁 **Returning visitor** | A visit starts: where from, which device, how they found the page (✨ when an AI answer sent them) | Yes |
| 🎯 **A reader said who they are** | They picked a role in the first quest log ("a marketing hire") | Yes |
| 📝 **Fit check run** | They ran the job fit check. What they pasted is never sent | Yes |
| 📨 **A move towards contact** | The email composer, Gmail or Outlook with the email ready, the résumé, LinkedIn, MIGI's summary | Yes |
| 📋 **Visit ended** / **Visit update** | The tab is hidden or closed: how far they walked (stop 23 of 31, chapter), skills and coins, what they did, a human-or-bot verdict | Silent |
| 🔥 AI assistant fetched a page | ChatGPT-User, Claude-User, Perplexity-User: someone asked an AI, and it came here | Yes |
| 🤖 🔎 🔗 📈 🛠 crawler alerts | AI crawlers, search engines (✅ when reverse DNS proves they're real, 🎭 when they're fakes), link previews, SEO bots, scripts | Silent |
| 🚨 Probe | Something fishing for `/.env`, `/wp-login.php`… | Silent |

At most 5 sound alerts per visit beyond the arrival. Tool openings (Slide Doctor, the cost calculator…) go into the end report instead.

## Setup

1. **Create the bot.** In Telegram, message [@BotFather](https://t.me/BotFather) → `/newbot` → a name ("Career Mode Alerts") and a username ending in `bot`. Copy the token. Use a new bot, not That One Crawler's: a bot has one webhook and one set of settings.
2. **Start a chat with it.** Open `t.me/<your_bot_username>` and press **Start**.
3. **Find your chat id.** Copy `.env.example` to `.env` (git-ignored), paste the token, then run `npm run telegram:setup -- --find-chat`. It prints `TELEGRAM_CHAT_ID=…`.
4. **Make a webhook secret** (for the commands): `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`.
5. **Vercel** → Project → Settings → Environment Variables → add `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` and `TELEGRAM_WEBHOOK_SECRET` for Production → then **Deployments → ⋯ → Redeploy** (variables only reach new deployments).
6. **Turn on commands** (after the redeploy): put the same three values in `.env`, then `npm run telegram:setup`. It points the webhook at `/api/telegram` and registers the command menu.
7. **Check it:** open `https://hire.sumandebnath.houseofnamus.com/api/beacon`. It should say `"telegramConfigured": true, "commandsConfigured": true`. Send `/status` to the bot, then `/test` for a sample alert.
8. **Mute yourself:** open `https://hire.sumandebnath.houseofnamus.com/?notrack=1` once in each browser you use (undo with `?notrack=0`).

## Commands

| Command | What it does |
| --- | --- |
| `/bots off` | Humans only: no crawler or bot alerts, and visits that look automated are dropped too |
| `/bots ai` | Humans plus AI assistants and AI search crawlers. Everything else stays quiet |
| `/bots on` | Every crawler and bot (the default) |
| `/pause 2h` | Hold every alert (`30m`, `2h`, `1d`, up to 7 days) |
| `/resume` | End a pause early |
| `/status` | Current settings, with one-tap buttons |
| `/test` | A sample visitor alert |

Settings live in the bot's own short description ("🎮 Career Mode alerts · bots: off"), so they survive redeploys without a database. Only messages from `TELEGRAM_CHAT_ID` that carry the webhook secret are obeyed.

## How it works

| File | Job |
| --- | --- |
| `js/beacon.js` | Browser side. A visit is one tab (sessionStorage). Passive listeners; `sendBeacon` when the tab is hidden or closed. Also loads GA4 once `GA_ID` is set. Off on every host but the live one, and for anyone who opened `?notrack=1` |
| `js/ui.js` | Reports the moments (`cm:track` events): a role picked, the fit check, windows opened, contact moves |
| `api/beacon.js` | Collector: validates, locates (Vercel headers, then ipwho.is), scores human vs bot, applies settings and rate limits, formats, sends. Always answers 204. `GET` is a health check |
| `middleware.js` + `api/_lib/crawler-alert.js` | Crawler alerts from every page request, sent in `waitUntil` so pages never wait. Fake Googlebots are caught with reverse DNS over HTTPS |
| `api/telegram.js`, `api/_lib/settings.js` | Commands and their storage |
| `api/_lib/*` | Shared pieces. Files under `_lib` are not endpoints |

With the Telegram variables unset, everything is a quiet no-op. `npm test` runs the tests offline against a fake Telegram.

To try the browser side locally: `localStorage.setItem('cm_beacon_debug', '1')` in the console, then reload.
