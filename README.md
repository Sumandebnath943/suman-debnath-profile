# Suman Debnath: Career Mode

A one-page résumé you walk through as a small pixel-art game. Live at https://hiresumandebnath.houseofnamus.com/ (GitHub Pages, custom domain in `CNAME`).

- `index.html`, `styles.css`, `ui.css`, `js/`: the live page. Every sprite is drawn in code; there are no image assets apart from `og-image.png`.
- `classic/`: a backup of the previous version of the page. It is marked `noindex`.
- `llms.txt`, `robots.txt`, `sitemap.xml`: for search engines and AI assistants.

The contact email is written as `__CONTACT_EMAIL__` in `index.html`, `llms.txt` and `classic/index.html`. Replace it with the real address before the page goes live.

To run it locally, serve the folder with any static server, for example `python -m http.server 5186`, and open http://127.0.0.1:5186/.
