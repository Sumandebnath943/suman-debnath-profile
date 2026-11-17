// Tells IndexNow search engines (Bing, Yandex, Seznam, Naver, Yep) that pages changed, so they recrawl in
// hours instead of weeks. Google doesn't use IndexNow. Run after deploying new or changed content:
//
//   npm run indexnow                        every URL in the live sitemap, plus llms.txt and llms-full.txt
//   npm run indexnow -- / /llms.txt         just these paths
//
// The key is the 32-character name of the .txt file at the project root. It isn't a secret: it only
// proves that submissions for this site come from whoever controls the site.

import { readdirSync } from 'node:fs';

const site = (process.env.SITE_URL || 'https://hire.sumandebnath.houseofnamus.com').replace(/\/$/, '');
const root = new URL('../', import.meta.url);

async function main() {
  const file = readdirSync(root).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (!file) return 'No IndexNow key file (32 hex characters + .txt) at the project root.';
  const key = file.slice(0, 32);

  const live = await fetch(`${site}/${file}`);
  if (!live.ok || (await live.text()).trim() !== key) return `${site}/${file} doesn't serve the key yet. Deploy first, then run this again.`;

  const paths = process.argv.slice(2).filter((a) => a.startsWith('/'));
  let urls = paths.map((p) => `${site}${p}`);
  if (!urls.length) {
    const xml = await (await fetch(`${site}/sitemap.xml`)).text();
    urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()).filter((u) => !/\.(png|jpe?g|webp)$/i.test(u));
    urls.push(`${site}/llms.txt`, `${site}/llms-full.txt`);
  }
  if (!urls.length) return `No URLs found in ${site}/sitemap.xml.`;

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(site).host, key, keyLocation: `${site}/${file}`, urlList: urls }),
  });
  // 200 = accepted, 202 = accepted while the key is still being checked.
  console.log(`IndexNow answered ${res.status} for ${urls.length} URL${urls.length === 1 ? '' : 's'}:`);
  urls.forEach((u) => console.log(`  ${u}`));
  if (res.status >= 400) return await res.text();
  return null;
}

const error = await main();
if (error) {
  console.error(error);
  process.exitCode = 1;
}
