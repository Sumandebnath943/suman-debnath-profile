// Which automated agent a request claims to be, read from its user agent in the middleware.
//
// The visitor beacon can't do this: it's client-side JavaScript, and almost no crawler runs it.
// Kinds are per agent, not per vendor, because they mean very different things:
//   ClaudeBot         a training crawl
//   Claude-SearchBot  indexing for Claude's search: decides whether Claude can cite the page
//   Claude-User       someone asked Claude a question just now, and it came here to answer
// User agents are self-declared. Search engines that publish a reverse-DNS domain are verified in
// verify.js; everything else is "claims to be".
//
// kind: live · ai · search · social · seo · tool · unknown

const GOOGLE = ['googlebot.com', 'google.com', 'googleusercontent.com'];

/**
 * Most specific first: the first match wins. ChatGPT-User must sit above GPTBot, Claude-SearchBot above
 * ClaudeBot and Applebot-Extended above Applebot, or the interesting signal gets relabelled as routine
 * crawling. Patterns are tested against the lowercased user agent.
 */
const RULES = [
  // Live fetchers: these mean a person asked an AI about something, and it came here.
  ['chatgpt-user', { name: 'ChatGPT-User', vendor: 'OpenAI', kind: 'live' }],
  ['claude-user', { name: 'Claude-User', vendor: 'Anthropic', kind: 'live' }],
  ['perplexity-user', { name: 'Perplexity-User', vendor: 'Perplexity', kind: 'live' }],
  ['mistralai-user', { name: 'MistralAI-User', vendor: 'Mistral', kind: 'live' }],
  ['meta-externalfetcher', { name: 'Meta-ExternalFetcher', vendor: 'Meta', kind: 'live' }],
  ['duckassistbot', { name: 'DuckAssistBot', vendor: 'DuckDuckGo', kind: 'live' }],
  ['google-notebooklm', { name: 'Google-NotebookLM', vendor: 'Google', kind: 'live' }],
  ['manus-user', { name: 'Manus-User', vendor: 'Manus', kind: 'live' }],

  // AI search indexing and training.
  ['oai-searchbot', { name: 'OAI-SearchBot', vendor: 'OpenAI', kind: 'ai' }],
  ['claude-searchbot', { name: 'Claude-SearchBot', vendor: 'Anthropic', kind: 'ai' }],
  ['perplexitybot', { name: 'PerplexityBot', vendor: 'Perplexity', kind: 'ai' }],
  ['applebot-extended', { name: 'Applebot-Extended', vendor: 'Apple', kind: 'ai' }],
  ['google-extended', { name: 'Google-Extended', vendor: 'Google', kind: 'ai' }],
  ['gptbot', { name: 'GPTBot', vendor: 'OpenAI', kind: 'ai' }],
  ['claudebot', { name: 'ClaudeBot', vendor: 'Anthropic', kind: 'ai' }],
  [/claude-web|anthropic-ai/, { name: 'Anthropic (legacy agent)', vendor: 'Anthropic', kind: 'ai' }],
  ['ccbot', { name: 'CCBot', vendor: 'Common Crawl', kind: 'ai' }],
  ['bytespider', { name: 'Bytespider', vendor: 'ByteDance', kind: 'ai' }],
  ['meta-externalagent', { name: 'Meta-ExternalAgent', vendor: 'Meta', kind: 'ai' }],
  ['amazonbot', { name: 'Amazonbot', vendor: 'Amazon', kind: 'ai' }],
  ['youbot', { name: 'YouBot', vendor: 'You.com', kind: 'ai' }],
  [/cohere-ai|cohere-training-data-crawler/, { name: 'cohere-ai', vendor: 'Cohere', kind: 'ai' }],
  ['ai2bot', { name: 'AI2Bot', vendor: 'Allen Institute', kind: 'ai' }],
  ['mistralai', { name: 'MistralAI', vendor: 'Mistral', kind: 'ai' }],
  ['pangubot', { name: 'PanGuBot', vendor: 'Huawei', kind: 'ai' }],
  ['diffbot', { name: 'Diffbot', vendor: 'Diffbot', kind: 'ai' }],
  ['timpibot', { name: 'Timpibot', vendor: 'Timpi', kind: 'ai' }],
  ['kagibot', { name: 'Kagibot', vendor: 'Kagi', kind: 'ai' }],
  [/\bgrok\b|\bxai[-\s]?bot\b/, { name: 'xAI / Grok (unconfirmed)', vendor: 'xAI', kind: 'ai' }],
  [/bravebot|brave[-\s]?search/, { name: 'Brave Search (unconfirmed)', vendor: 'Brave', kind: 'ai' }],

  // Search engines.
  ['google-inspectiontool', { name: 'Google Search Console', vendor: 'Google', kind: 'search', verifyDomains: GOOGLE }],
  ['googleother', { name: 'GoogleOther', vendor: 'Google', kind: 'search', verifyDomains: GOOGLE }],
  ['storebot-google', { name: 'Storebot-Google', vendor: 'Google', kind: 'search', verifyDomains: GOOGLE }],
  ['googlebot-image', { name: 'Googlebot-Image', vendor: 'Google', kind: 'search', verifyDomains: GOOGLE }],
  ['googlebot', { name: 'Googlebot', vendor: 'Google', kind: 'search', verifyDomains: GOOGLE }],
  [/bingbot|bingpreview|microsoftpreview|adidxbot/, { name: 'Bingbot', vendor: 'Microsoft', kind: 'search', verifyDomains: ['search.msn.com'] }],
  ['duckduckbot', { name: 'DuckDuckBot', vendor: 'DuckDuckGo', kind: 'search' }],
  ['applebot', { name: 'Applebot', vendor: 'Apple', kind: 'search', verifyDomains: ['applebot.apple.com'] }],
  ['yandex', { name: 'YandexBot', vendor: 'Yandex', kind: 'search', verifyDomains: ['yandex.ru', 'yandex.net', 'yandex.com'] }],
  ['baiduspider', { name: 'Baiduspider', vendor: 'Baidu', kind: 'search', verifyDomains: ['baidu.com', 'baidu.jp'] }],
  ['seznambot', { name: 'SeznamBot', vendor: 'Seznam', kind: 'search' }],
  [/naver|yeti\//, { name: 'Yeti', vendor: 'Naver', kind: 'search' }],
  ['mojeekbot', { name: 'MojeekBot', vendor: 'Mojeek', kind: 'search' }],
  ['qwantbot', { name: 'Qwantbot', vendor: 'Qwant', kind: 'search' }],

  // Link unfurlers: someone pasted a link to this page somewhere.
  ['linkedinbot', { name: 'LinkedInBot', vendor: 'LinkedIn', kind: 'social' }],
  [/slackbot|slack-imgproxy/, { name: 'Slackbot', vendor: 'Slack', kind: 'social' }],
  ['whatsapp', { name: 'WhatsApp', vendor: 'Meta', kind: 'social' }],
  ['telegrambot', { name: 'TelegramBot', vendor: 'Telegram', kind: 'social' }],
  ['twitterbot', { name: 'Twitterbot', vendor: 'X', kind: 'social' }],
  [/facebookexternalhit|facebookcatalog/, { name: 'facebookexternalhit', vendor: 'Meta', kind: 'social' }],
  ['discordbot', { name: 'Discordbot', vendor: 'Discord', kind: 'social' }],
  ['redditbot', { name: 'redditbot', vendor: 'Reddit', kind: 'social' }],
  [/bluesky|cardyb/, { name: 'Bluesky', vendor: 'Bluesky', kind: 'social' }],
  ['mastodon', { name: 'Mastodon', vendor: 'Mastodon', kind: 'social' }],
  ['pinterestbot', { name: 'Pinterestbot', vendor: 'Pinterest', kind: 'social' }],
  ['skypeuripreview', { name: 'Skype / Teams preview', vendor: 'Microsoft', kind: 'social' }],

  // SEO and audit crawlers.
  ['ahrefsbot', { name: 'AhrefsBot', vendor: 'Ahrefs', kind: 'seo' }],
  [/semrushbot|siteauditbot/, { name: 'SemrushBot', vendor: 'Semrush', kind: 'seo' }],
  [/mj12bot|dotbot|petalbot|blexbot|seokicks|dataforseobot|serpstatbot|barkrowler/, { name: 'SEO crawler', kind: 'seo' }],
  [/screaming frog|lighthouse|chrome-lighthouse|pagespeed|gtmetrix|thatonecrawler/, { name: 'Site auditor', kind: 'seo' }],

  // Tooling.
  [/headlesschrome|headless|puppeteer|playwright|phantom|selenium|webdriver/, { name: 'Headless browser', kind: 'tool' }],
  [/curl|wget|python-requests|python-urllib|httpx|aiohttp|go-http|node-fetch|undici|axios|okhttp|libwww|java\/|scrapy/, { name: 'Script', kind: 'tool' }],
  [/pingdom|uptimerobot|statuscake|betteruptime|newrelicpinger|vercel-screenshot|vercelbot/, { name: 'Uptime monitor', kind: 'tool' }],
];

/** Anything that describes itself as automated but isn't named above. */
const GENERIC = /bot\b|crawler|crawl|spider|slurp|scraper|scrape|preview|fetcher|monitor|validator/;

/** What this request claims to be, or null when it looks like a real browser. */
export function identifyCrawler(userAgent) {
  if (!userAgent) return { name: 'Unknown (no user agent)', kind: 'unknown' };
  const ua = userAgent.toLowerCase();
  for (const [match, crawler] of RULES) {
    if (typeof match === 'string' ? ua.includes(match) : match.test(ua)) return crawler;
  }
  if (GENERIC.test(ua)) return { name: 'Unidentified crawler', kind: 'unknown' };
  return null;
}

/** Agents that matter for AI search and AI answers: the ones kept when bot alerts are set to "AI only". */
export const isAiAgent = (crawler) => crawler.kind === 'live' || crawler.kind === 'ai';
