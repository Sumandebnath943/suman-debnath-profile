import { crawlerAlert } from './api/_lib/crawler-alert.js';

/**
 * Vercel Routing Middleware. It runs before every page and text file (never for the scripts, styles,
 * images or the API), and does one thing: tells Telegram when a crawler or bot arrives, in the background,
 * so a page never waits for it. It returns nothing, so every request carries on to the site untouched.
 */
export const config = {
  matcher: ['/((?!api/|js/|images/|.*\\.(?:css|js|mjs|png|jpe?g|webp|gif|svg|ico|woff2?|map)$).*)'],
};

export default function middleware(request, context) {
  // Telemetry must never cost a page: a throw here is swallowed, never turned into an error page.
  try {
    const alert = crawlerAlert(request);
    if (alert && context && typeof context.waitUntil === 'function') context.waitUntil(alert);
  } catch {
    // Nothing useful to do, and logging on every request is its own problem.
  }
  // The project's package.json is only there for the functions; it isn't a page.
  if (new URL(request.url).pathname === '/package.json') return new Response('Not found', { status: 404 });
  return undefined;
}
