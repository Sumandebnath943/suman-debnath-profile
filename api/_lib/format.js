import { describeClient, trafficSource } from './bot.js';
import { describePlace, mapLink } from './geo.js';
import { OWN_HOST, SITE_NAME } from './site.js';
import { clip, esc } from './telegram.js';

// Visitor alerts, formatted for Telegram (HTML mode). Three kinds per visit:
//   arrival  when the visit starts: who, from where, how they found the page
//   event    a moment worth a ping: a role picked, a fit check, a move towards contact (capped per visit)
//   end      the whole visit in one message: how far they walked, what they did, how human they looked

export function duration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return s % 60 ? `${m}m ${s % 60}s` : `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return m % 60 ? `${h}h ${m % 60}m` : `${h}h`;
  const d = Math.floor(h / 24);
  return h % 24 ? `${d}d ${h % 24}h` : `${d}d`;
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const verdictIcon = (v) => (v.score >= 80 ? '🧑' : v.score >= 62 ? '🙂' : v.score >= 40 ? '❔' : v.score >= 20 ? '🤖' : '⛔️');

function verdictLine(v, provisional) {
  return `${verdictIcon(v)} <b>${v.label}</b> ${v.score}/100${provisional ? ' <i>(first impression)</i>' : ''}` + (v.reasons.length ? ` · ${esc(v.reasons.join(', '))}` : '');
}

/** The visitor's own wall-clock time, which says more than the server's UTC. */
function localTime(tz) {
  const now = new Date();
  if (tz) {
    try {
      const local = new Intl.DateTimeFormat('en-GB', { timeZone: tz, day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
      return `${local} their time (${esc(tz)})`;
    } catch {
      // Fall through to UTC.
    }
  }
  return now.toUTCString().replace('GMT', 'UTC');
}

/** Location, never more precise than it really is. */
function locationBlock(geo) {
  const lines = [];
  const flag = geo.flag ? ` ${geo.flag}` : '';
  if (geo.precision === 'city') {
    lines.push(`📍 <b>${esc(describePlace(geo))}</b>${flag}`);
    const coords = geo.latitude && geo.longitude ? `${Number(geo.latitude).toFixed(3)}, ${Number(geo.longitude).toFixed(3)}` : null;
    const bits = [geo.postal ? `postal ${esc(geo.postal)}` : null, coords, geo.timezone ? esc(geo.timezone) : null].filter(Boolean);
    if (bits.length) lines.push(`   ${bits.join(' · ')}`);
  } else if (geo.precision === 'country') {
    lines.push(`📍 <b>${esc(describePlace(geo))}</b>${flag} <i>(country only, no map pin)</i>`);
  } else {
    lines.push('📍 <b>Location unknown</b> <i>(private or local address)</i>');
  }
  const net = [geo.isp ? esc(clip(geo.isp, 42)) : null, geo.asn ? esc(geo.asn) : null].filter(Boolean).join(' · ');
  lines.push(`🛰 <code>${esc(geo.ip)}</code>${net ? ` · ${net}` : ''}`);
  if (geo.mobile) lines.push('   📶 mobile network: the city may be the carrier\'s gateway');
  if (geo.datacenter) lines.push('   ⚠️ datacenter or hosting network (VPN, proxy or bot)');
  if (geo.disagreement) lines.push(`   ℹ️ sources differ: ${esc(geo.disagreement)}`);
  const link = mapLink(geo);
  if (link) lines.push(`   <a href="${link}">open in maps</a>`);
  return lines;
}

/** One line for events: enough to tell visitors apart. */
function shortWho(payload, geo, ua) {
  const place = geo.precision === 'unknown' ? 'unknown location' : describePlace(geo);
  const visit = payload.visitor.returning ? `visit #${payload.visitor.visitCount}` : 'first visit';
  return `👤 ${esc(place)}${geo.flag ? ` ${geo.flag}` : ''} · ${esc(describeClient(ua))} · ${visit}`;
}

function sourceLine(source) {
  switch (source.kind) {
    case 'ai': return `✨ <b>Came from ${esc(source.name)}</b>: an AI answer linked here`;
    case 'search': return `🔎 from ${esc(source.name)} search`;
    case 'social': return `💬 from ${esc(source.name)}`;
    case 'site': return `↩️ from ${esc(clip(source.name, 80))}`;
    default: return `↩️ ${esc(source.name)}`;
  }
}

/** How far they walked, and what they collected. */
function gameLines(g) {
  if (!g) return [];
  const lines = [`🎮 walked to stop <b>${g.furthest} of ${g.total}</b>${g.chapter ? ` · ${esc(clip(g.chapter, 60))}` : ''}`];
  const bits = [
    g.skillsTotal ? `🧩 ${g.skills}/${g.skillsTotal} skills logged` : null,
    g.coinsTotal ? `🪙 ${g.coins}/${g.coinsTotal} coins` : null,
    g.level ? `LV ${g.level}` : null,
  ].filter(Boolean);
  if (bits.length) lines.push(`   ${bits.join(' · ')}`);
  if (g.plain) lines.push('📖 switched to the plain-text view');
  return lines;
}

const ACTIVITY_ICON = { role: '🎯', fit: '📝', tool: '🛠', contact: '📨' };
const EVENT_TITLE = {
  role: '🎯 <b>A reader said who they are</b>',
  fit: '📝 <b>Fit check run</b>',
  tool: '🛠 <b>Tool opened</b>',
  contact: '📨 <b>A move towards contact</b>',
};

export function formatArrival(payload, geo, verdict, ua) {
  const v = payload.visitor;
  const source = trafficSource(payload.referrer, payload.path, OWN_HOST);
  const phone = payload.game && payload.game.phone;
  return [
    v.returning
      ? `🔁 <b>Returning visitor</b> on ${SITE_NAME} · visit #${v.visitCount}${v.sinceLastMs !== null ? ` · last here ${duration(v.sinceLastMs)} ago` : ''}`
      : `🟢 <b>New visitor</b> on ${SITE_NAME}`,
    '',
    ...locationBlock(geo),
    '',
    `📄 <b>${esc(clip(payload.path, 90))}</b>`,
    sourceLine(source),
    ...(source.kind !== 'direct' && payload.referrer ? [`   <i>${esc(clip(payload.referrer, 90))}</i>`] : []),
    '',
    `${phone ? '📱' : '💻'} ${esc(describeClient(ua))} · ${payload.device.viewportW}×${payload.device.viewportH}${payload.signals.language ? ` · ${esc(payload.signals.language)}` : ''}`,
    verdictLine(verdict, true),
    ...(payload.signals.doNotTrack ? ['🔕 <i>Their browser sends Do Not Track</i>'] : []),
    `🕒 ${localTime(payload.signals.timezone)}`,
  ].join('\n');
}

export function formatEvent(payload, geo, ua) {
  const e = payload.event;
  const g = payload.game;
  return [
    `${EVENT_TITLE[e.kind]} on ${SITE_NAME}`,
    '',
    `<b>${esc(clip(e.label, 160))}</b>`,
    '',
    shortWho(payload, geo, ua),
    ...(g ? [`🎮 at stop ${g.furthest} of ${g.total} · ${duration(payload.sessionMs)} into the visit`] : []),
  ].join('\n');
}

export function formatEnd(payload, geo, verdict, ua) {
  const s = payload.signals;
  const lines = [
    payload.report > 1 ? `📋 <b>Visit update</b> on ${SITE_NAME} <i>(they came back to the tab)</i>` : `📋 <b>Visit ended</b> on ${SITE_NAME}`,
    '',
    `⏱ <b>${duration(payload.sessionMs)}</b> on the page · <b>${duration(payload.activeMs)}</b> active`,
    ...gameLines(payload.game),
  ];

  if (payload.activity.length) {
    lines.push('', '🔍 <b>What they did</b>');
    for (const a of payload.activity.slice(0, 12)) lines.push(`   ${ACTIVITY_ICON[a.kind]} ${duration(a.t)} · ${esc(clip(a.label, 110))}`);
    if (payload.activity.length > 12) lines.push(`   …and ${payload.activity.length - 12} more`);
  }

  const sc = payload.scroll;
  lines.push('', `📜 scrolled <b>${sc.maxPct}%</b> of the page${sc.milestones.length ? ` · passed ${sc.milestones.join('/')}` : ''}`);
  if (payload.actions.length) {
    lines.push(`🖱 <b>${plural(payload.actions.length, 'click')} on controls</b>`);
    for (const a of payload.actions.slice(0, 10)) lines.push(`   ${duration(a.t)} · ${a.type} · ${esc(clip(a.label, 60))}`);
    if (payload.actions.length > 10) lines.push(`   …and ${payload.actions.length - 10} more`);
  } else {
    lines.push('🖱 no clicks on any control');
  }
  lines.push(`🎛 ${s.pointerMoves} moves · ${s.clicks} clicks · ${s.keys} keys · ${s.touches} touches`);
  lines.push('', ...locationBlock(geo), '', `${payload.game && payload.game.phone ? '📱' : '💻'} ${esc(describeClient(ua))}`, verdictLine(verdict, false));
  if (payload.visitor.returning) lines.push(`🔁 visit #${payload.visitor.visitCount} from this browser`);
  return lines.join('\n');
}
