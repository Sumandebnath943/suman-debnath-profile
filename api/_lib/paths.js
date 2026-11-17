// What a crawler was asking for. The middleware runs before the files are looked up, so it can't see the
// response; without this, a probe for /.env (a 404) and a read of /llms.txt (a real file) look identical.
// Two separate questions that fail in opposite directions:
//   known  does the path match a real page or file? This site is small, so the list is exact.
//   probe  is it a known attack target? Errs toward "no", and anchors to whole path segments.

/** Pages and files on this site. Keep in step with the sitemap and llms.txt. */
const KNOWN = new Set(['/', '/index.html', '/classic', '/classic/', '/classic/index.html', '/llms.txt', '/llms-full.txt', '/robots.txt', '/sitemap.xml', '/404', '/404.html']);

export const isKnownPath = (pathname) => KNOWN.has(pathname) || /^\/[0-9a-f]{32}\.txt$/.test(pathname);

/** Pages and agent files worth an alert. Assets and robots/sitemap fetches are noise. */
export function isReportablePath(pathname) {
  if (pathname.startsWith('/api/')) return false;
  if (pathname === '/robots.txt' || pathname === '/sitemap.xml') return false;
  // An agent reading the AI files is the most interesting arrival there is.
  if (pathname === '/llms.txt' || pathname === '/llms-full.txt' || pathname.endsWith('.md')) return true;
  return !/\.[a-z0-9]{2,5}$/i.test(pathname) || pathname.endsWith('.html');
}

const SEG = '(?:^|/)';
const PROBES = [
  [/^\/\.git(\/|$)/i, 'git repository (source and history)'],
  [/^\/\.env(\.|\/|$)/i, 'env file (API keys)'],
  [/^\/\.(aws|ssh|npmrc|docker|htpasswd|svn|hg|vscode|idea|ds_store)(\/|$)/i, 'developer credentials'],
  [new RegExp(`${SEG}(wp-admin|wp-login\\.php|wp-content|wp-includes|xmlrpc\\.php|wordpress|wp-json)(/|$)`, 'i'), 'WordPress'],
  [new RegExp(`${SEG}(phpmyadmin|phpinfo\\.php|eval-stdin\\.php|cgi-bin|vendor|phpunit)(/|$)`, 'i'), 'PHP tooling'],
  [/\.php$/i, 'a PHP script'],
  [/^\/(administrator|admin|cpanel|webmail|manager|login|dashboard)(\/|$)/i, 'an admin panel'],
  [new RegExp(`${SEG}(backup|backups|dump|db|database)(/|$)|\\.(sql|bak|dump|zip|tar|gz)$`, 'i'), 'a database or site backup'],
  [new RegExp(`${SEG}(config\\.json|credentials|secrets?)(/|$)|\\.(pem|key|p12|pfx)$|${SEG}id_rsa`, 'i'), 'a secrets file'],
  [new RegExp(`${SEG}(actuator|server-status|telescope|_profiler|debug|swagger|graphql)(/|$)`, 'i'), 'a framework debug endpoint'],
];

/** { known, probe }: probe names what it was fishing for, or is null. */
export function classifyPath(pathname) {
  // A real page can't be a probe, whatever it's called.
  if (isKnownPath(pathname)) return { known: true, probe: null };
  for (const [re, what] of PROBES) if (re.test(pathname)) return { known: false, probe: what };
  // /.well-known/ is a standard, not an intrusion; it's just not served here.
  if (pathname.startsWith('/.well-known/')) return { known: false, probe: null };
  if (/(^|\/)\.[^/]/.test(pathname)) return { known: false, probe: 'a hidden dotfile' };
  return { known: false, probe: null };
}
