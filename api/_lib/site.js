// The one place that names the live site. SITE_URL can be overridden in Vercel if the domain ever moves.
export const SITE_URL = (process.env.SITE_URL || 'https://hire.sumandebnath.houseofnamus.com').replace(/\/$/, '');
export const SITE_NAME = 'Career Mode';
export const OWN_HOST = new URL(SITE_URL).hostname;
