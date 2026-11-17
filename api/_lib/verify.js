// Is that really Googlebot? Search engines publish a reverse-DNS domain for their crawlers: the IP's PTR
// name must end in it, and that name must resolve back to the same IP. Anyone can type "Googlebot" into a
// user agent; this is the part that can't be faked.
//
// The middleware runs on the edge, where there's no DNS module, so this asks Cloudflare's DNS-over-HTTPS
// resolver instead. It runs in the background (waitUntil), so it never slows a page down.
//
// Result: { state: "verified", host } | { state: "spoofed", host? } | { state: "unknown" }

const DOH = 'https://cloudflare-dns.com/dns-query';
const TIMEOUT_MS = 1500;
const TTL_MS = 6 * 60 * 60_000;
const cache = new Map();

async function query(name, type) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${DOH}?name=${encodeURIComponent(name)}&type=${type}`, { headers: { accept: 'application/dns-json' }, signal: c.signal });
    if (!res.ok) throw new Error(`doh ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

/** "2001:db8::1" → 32 hex digits, so two spellings of one IPv6 address compare equal. */
export function expandIpv6(ip) {
  const [head, tail] = ip.toLowerCase().split('::');
  const h = head ? head.split(':') : [];
  const t = tail ? tail.split(':') : [];
  const fill = tail === undefined ? [] : Array(Math.max(0, 8 - h.length - t.length)).fill('0');
  return [...h, ...fill, ...t].map((x) => x.padStart(4, '0')).join('');
}

/** The PTR query name: 66.249.66.1 → 1.66.249.66.in-addr.arpa */
export function reverseName(ip) {
  if (ip.includes(':')) return `${expandIpv6(ip).split('').reverse().join('.')}.ip6.arpa`;
  return `${ip.split('.').reverse().join('.')}.in-addr.arpa`;
}

const sameIp = (a, b) => (a.includes(':') && b.includes(':') ? expandIpv6(a) === expandIpv6(b) : a === b);
const records = (answer, type) => (answer.Answer || []).filter((r) => r.type === type).map((r) => String(r.data).replace(/\.$/, '').toLowerCase());

export async function verifyCrawler(ip, domains) {
  if (!ip || ip === 'unknown') return { state: 'unknown' };
  const key = `${ip}|${domains.join(',')}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  let value = { state: 'unknown' };
  try {
    const ptr = await query(reverseName(ip), 'PTR');
    const names = records(ptr, 12);
    // No PTR record at all is a "no": real crawlers always have one.
    if (ptr.Status === 3 || !names.length) value = { state: 'spoofed' };
    else {
      const host = names.find((name) => domains.some((d) => name === d || name.endsWith(`.${d}`)));
      if (!host) value = { state: 'spoofed', host: names[0] };
      else {
        const v6 = ip.includes(':');
        const fwd = await query(host, v6 ? 'AAAA' : 'A');
        value = records(fwd, v6 ? 28 : 1).some((a) => sameIp(a, ip)) ? { state: 'verified', host } : { state: 'spoofed', host };
      }
    }
  } catch {
    // A timeout or resolver error tells us nothing either way.
    value = { state: 'unknown' };
  }
  if (cache.size > 2000) cache.clear();
  cache.set(key, { at: Date.now(), value });
  return value;
}
