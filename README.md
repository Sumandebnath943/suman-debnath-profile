# Suman Debnath: Career Mode

A one-page résumé you walk through as a small pixel-art game. Live at https://hire.sumandebnath.houseofnamus.com/ (hosted on Vercel; there is no build step and no dependency).

- `index.html`, `styles.css`, `ui.css`, `js/`: the live page. Every sprite is drawn in code; the only image files are `og-image.png`, the icons and the portrait.
- `classic/`: a backup of the previous version of the page. It is marked `noindex`.
- `llms.txt`, `llms-full.txt`, `robots.txt`, `sitemap.xml`: for search engines and AI assistants. `llms-full.txt` is generated from `index.html` with `npm run llms`; run it after any change to the story or the FAQ.
- `api/`, `middleware.js`, `js/beacon.js`: visitor alerts on Telegram, and GA4. See [docs/BEACON.md](docs/BEACON.md).
- `<32 hex characters>.txt`: the IndexNow key. After a deploy that changes content, run `npm run indexnow`.

Run it locally with any static server, for example `python -m http.server 5186`, and open http://127.0.0.1:5186/. Tests: `npm test`.
