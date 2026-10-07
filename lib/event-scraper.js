// Shared Eventbrite scraper for TPI events.
// Used by BOTH the cron worker (worker.js scheduled()) and the
// /api/events/refresh endpoint (functions/api/[[path]].js) so the two
// can never drift apart again.
//
// Markup reference (verified live 2026-10-05): each event card renders as
//   <a href=... class="event-card-link " aria-label="View TITLE"
//      data-event-id=... data-event-location=... data-event-category=...>
// and the date sits in a <p> immediately after the anchor's close, e.g.
//   </a><p ...>Sun, Feb 28, 12:00 PM EST</p>
// Each event appears in ~2 card layout variants (image card + title card),
// so results are deduped by data-event-id and merged across variants.
//
// Run results are recorded in the scraper_runs table (scraper-log.js):
// one aggregated row per event scrape.

const EVENTBRITE_URLS = [
  "https://www.eventbrite.com/d/online/paranormal-investigation/",
  "https://www.eventbrite.com/d/online/ghost-hunting/",
  "https://www.eventbrite.com/d/online/ghost-hunt/",
  "https://www.eventbrite.com/d/online/haunted-investigation/",
  "https://www.eventbrite.com/d/united-states/paranormal-investigation/",
  "https://www.eventbrite.com/d/united-states/ghost-hunting/",
  "https://www.eventbrite.com/d/united-states/ghost-hunt/",
  "https://www.eventbrite.com/d/united-states/haunted-house-investigation/",
  "https://www.eventbrite.com/d/online/paranormal-conference/",
  "https://www.eventbrite.com/d/online/paranormal-expo/",
  "https://www.eventbrite.com/d/united-states/paranormal-conference/",
  "https://www.eventbrite.com/d/united-states/paranormal-expo/",
  "https://www.eventbrite.com/d/online/evp-spirit-box/",
  "https://www.eventbrite.com/d/online/evp-session/",
  "https://www.eventbrite.com/d/online/psychic-development/",
  "https://www.eventbrite.com/d/online/mediumship/",
  "https://www.eventbrite.com/d/online/psychic-fair/",
  "https://www.eventbrite.com/d/online/metaphysical/",
  "https://www.eventbrite.com/d/online/past-life-regression/",
  "https://www.eventbrite.com/d/online/reiki/",
  "https://www.eventbrite.com/d/online/ufo-conference/",
  "https://www.eventbrite.com/d/online/psychic-medium/",
  "https://www.eventbrite.com/d/online/psychic-reading/",
  "https://www.eventbrite.com/d/online/tarot/",
  "https://www.eventbrite.com/d/online/astrology/",
  "https://www.eventbrite.com/d/online/cryptid/",
  "https://www.eventbrite.com/d/online/bigfoot/",
  "https://www.eventbrite.com/d/online/witchcraft/",
  "https://www.eventbrite.com/d/online/ghost-tour/",
  "https://www.eventbrite.com/d/united-states/ghost-tour/",
  "https://www.eventbrite.com/d/united-states/haunted-house-tour/",
];

const PARANORMAL_KEYWORDS = [
  "paranormal", "ghost", "haunt", "spirit", "supernatural", "evp", "itc",
  "investigation", "hunt", "entity", "apparition", "poltergeist",
  "spectral", "ethereal", "ectoplasm", "spirit box", "emf",
  "haunted", "ghostly", "investigator", "night vision",
  "seance", "ouija", "divination", "possession", "exorcism", "demon",
  "ufo", "uap", "alien", "extraterrestrial", "abduction",
  "flying saucer", "sighting", "close encounter", "contactee",
  "cryptid", "bigfoot", "sasquatch", "yeti", "chupacabra", "mothman",
  "psychic", "medium", "clairvoyant", "telepathy", "telekinesis",
  "remote viewing", "astral projection", "out of body", "obe",
  "near death", "nde", "past life", "reincarnation", "regression",
  "channeling", "trance", "automatic writing", "aura", "chakra", "reiki",
  "energy healing", "healing touch", "consciousness", "altered state",
  "mystical", "transcendent", "spiritual awakening", "kundalini",
  "third eye", "lucid dream", "premonition", "intuition", "synchronicity",
  "witch", "witchcraft", "wicca", "pagan", "occult", "ritual", "spell",
  "magick", "ceremony", "tarot", "astrology", "numerology", "crystal",
  "parapsychology", "anomalous", "phenomenon", "fortean", "unexplained", "mystery",
  "mediumship", "metaphysical", "spiritual",
];

const EXCLUDE_KEYWORDS = [
  "coding", "programming", "software", "tech meetup", "startup",
  "yoga", "meditation class", "wellness retreat", "fitness",
  "cooking class", "dance class", "music concert", "art class",
  "book club", "networking event", "sports", "football", "basketball",
  "gaming tournament", "video game", "esports",
];

// US timezone abbreviation -> UTC offset hours (DST variants included).
import { logScraperRun, startScraperRun } from "./scraper-log.js";

const TZ_OFFSET_HOURS = {
  EST: 5, EDT: 4, CST: 6, CDT: 5, MST: 7, MDT: 6,
  PST: 8, PDT: 7, AKST: 9, AKDT: 8, HST: 10, GMT: 0, UTC: 0,
};

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

export function isParanormalEvent(title, extra = "") {
  const text = `${title} ${extra}`.toLowerCase();
  for (const keyword of EXCLUDE_KEYWORDS) {
    if (text.includes(keyword)) return false;
  }
  for (const keyword of PARANORMAL_KEYWORDS) {
    if (text.includes(keyword)) return true;
  }
  return false;
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (m, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (m, code) => String.fromCharCode(parseInt(code, 16)));
}

function attrFrom(tag, name) {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`));
  return match ? match[1] : "";
}

function tzOffsetHours(tz) {
  if (!tz) return null;
  const upper = tz.toUpperCase();
  if (upper in TZ_OFFSET_HOURS) return TZ_OFFSET_HOURS[upper];
  // GMT+1 / UTC-5 style offsets. NOTE: TZ_OFFSET_HOURS stores "hours to add
  // to local time to get UTC" (EST -> +5), so east-of-UTC offsets are negative.
  const gmt = upper.match(/^(?:GMT|UTC)([+-])(\d{1,2})$/);
  if (gmt) return (gmt[1] === "-" ? 1 : -1) * Number(gmt[2]);
  return null;
}

// Parses Eventbrite card date text. Handled formats (verified live):
//   "Sun, Feb 28, 12:00 PM EST"        (month-day; year computed as nearest future)
//   "Fri, Oct 16, 6:30"                (no meridiem)
//   "Sat, Dec 13 · 2:00 PM EDT"
//   "Tomorrow at 7:00 PM GMT+1"        (relative day)
//   "Today at 8:00 PM EDT"
//   "Wednesday at 1:00 PM MDT"         (weekday-only -> next occurrence)
//   "Date and time is TBD"             (returns null)
// Returns { iso, display } or null. ISO is UTC; display keeps the original text.
export function parseEventbriteDate(text, nowMs = Date.now()) {
  if (!text) return null;
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  if (lower.includes("tbd")) return null;

  const timeRe = "(\\d{1,2}):(\\d{2})\\s*([AP])\\.?M\\.?";

  const buildIso = (year, month, day, hour, minute, tz) => {
    let offsetHours = tzOffsetHours(tz);
    if (offsetHours === null) {
      // No usable timezone: assume US Eastern with rough DST handling.
      offsetHours = month >= 3 && month <= 11 ? 4 : 5;
    }
    const utcMs = Date.UTC(year, month - 1, day, hour, minute) + offsetHours * 3600000;
    return new Date(utcMs).toISOString();
  };

  const timeMatch = trimmed.match(new RegExp(timeRe, "i"));
  const hourRaw = timeMatch ? Number(timeMatch[1]) : 0;
  const minute = timeMatch ? Number(timeMatch[2]) : 0;
  const meridiem = timeMatch ? timeMatch[3].toUpperCase() : null;
  let hour = hourRaw;
  if (meridiem === "P" && hour < 12) hour += 12;
  if (meridiem === "A" && hour === 12) hour = 0;
  const tzMatch = timeMatch ? trimmed.match(new RegExp(timeRe + "\\s*([A-Za-z]{2,4}(?:[+-]\\d{1,2})?)", "i")) : null;
  const tz = tzMatch ? tzMatch[4] : null;

  // Relative day: "Today at ..." / "Tomorrow at ..."
  const relMatch = lower.match(/\b(today|tomorrow)\b/);
  if (relMatch && timeMatch) {
    const base = new Date(nowMs);
    if (relMatch[1] === "tomorrow") base.setUTCDate(base.getUTCDate() + 1);
    const iso = buildIso(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), hour, minute, tz);
    return { iso, display: trimmed };
  }

  // Weekday-only: "Wednesday at 1:00 PM MDT" -> next occurrence of that weekday
  const weekdayMatch = trimmed.match(/\b(Sun|Mon|Tue|Wed|Thu|Fri|Sat)[a-z]*\b/i);
  const WEEKDAYS = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  if (weekdayMatch && timeMatch && !trimmed.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i)) {
    const target = WEEKDAYS[weekdayMatch[1].slice(0, 3).toLowerCase()];
    const base = new Date(nowMs);
    let delta = (target - base.getUTCDay() + 7) % 7;
    // If it's already that weekday, keep today only when the time hasn't clearly passed.
    if (delta === 0) {
      const todayIso = buildIso(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), hour, minute, tz);
      if (new Date(todayIso).getTime() < nowMs - 3600000) delta = 7;
    }
    if (delta > 0) base.setUTCDate(base.getUTCDate() + delta);
    const iso = buildIso(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), hour, minute, tz);
    return { iso, display: trimmed };
  }

  // Month-day: "Sun, Feb 28, 12:00 PM EST"
  const monthMatch = trimmed.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})/i);
  if (monthMatch) {
    const month = MONTHS[monthMatch[1].slice(0, 3).toLowerCase()];
    const day = Number(monthMatch[2]);
    const now = new Date(nowMs);
    let year = now.getUTCFullYear();
    let iso = buildIso(year, month, day, hour, minute, tz);
    // Pick the year that makes this the nearest future occurrence
    // (event pages rarely include the year). Tolerate events earlier today.
    if (new Date(iso).getTime() < nowMs - 36 * 3600000) {
      year += 1;
      iso = buildIso(year, month, day, hour, minute, tz);
    }
    return { iso, display: trimmed };
  }

  return null;
}

export function classifyType(title) {
  const t = title.toLowerCase();
  if (/investigation|ghost hunt|hunt|explore/.test(t)) return "investigation";
  if (/conference|con\b|symposium|summit|expo/.test(t)) return "conference";
  if (/meetup|meet-up|group/.test(t)) return "meetup";
  if (/workshop|class|training|learn|circle|development|practice|course/.test(t)) return "workshop";
  if (/live|stream|broadcast/.test(t)) return "livestream";
  if (/lecture|talk|presentation|speaker/.test(t)) return "lecture";
  if (/festival|fair|convention/.test(t)) return "festival";
  if (/tour|walk|walking/.test(t)) return "tour";
  if (/seance|evp|spirit box|reading|mediumship/.test(t)) return "investigation";
  return "other";
}

export function classifyCategory(title, eventbriteCategory = "") {
  const t = `${title} ${eventbriteCategory}`.toLowerCase();
  if (/ghost|haunt|spirit|apparition|poltergeist/.test(t)) return "ghosts";
  if (/ufo|uap|alien|extraterrestrial/.test(t)) return "ufo";
  if (/cryptid|bigfoot|sasquatch|mothman/.test(t)) return "cryptid";
  if (/evp|itc|electronic voice|spirit box/.test(t)) return "evp";
  if (/witch|witchcraft|occult|divination|tarot|astrology|pagan|wicca/.test(t)) return "occult";
  if (/demon|exorcism|possession/.test(t)) return "demonic";
  if (/psychic|medium|clairvoyant|telepathy|reiki|spiritual|healing|crystal|meditation/.test(t)) return "metaphysical";
  if (/history|historic|ancient/.test(t)) return "history";
  return "paranormal";
}

// Scrapes all EVENTBRITE_URLS, then atomically replaces every
// source='eventbrite' row in the events table. Returns { scraped, inserted }.
// Community-submitted rows (any other source) are never touched.
export async function scrapeAndUpdateEvents(env, options = {}) {
  const trigger = options.trigger || "cron";
  const started = startScraperRun();
  const byId = new Map();
  let fetchErrors = 0;
  let scrapeError = null;

  for (const url of EVENTBRITE_URLS) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TPI-EventBot/1.0)",
          "Accept": "text/html",
        },
      });
      if (!response.ok) { fetchErrors++; continue; }
      const html = await response.text();

      // Each card layout variant starts with an event-card-link anchor.
      const segments = html.split(/(?=<a\s[^>]*class="event-card-link)/);
      for (const segment of segments) {
        if (!segment.startsWith("<a")) continue;
        const anchorEnd = segment.indexOf(">");
        if (anchorEnd === -1) continue;
        const anchor = segment.slice(0, anchorEnd + 1);

        const eventId = attrFrom(anchor, "data-event-id");
        if (!eventId) continue;

        const record = byId.get(eventId) || { title: "", dateText: "", imageUrl: "", href: "", location: "", ebCategory: "" };

        if (!record.title) {
          const label = decodeEntities(attrFrom(anchor, "aria-label") || "").replace(/^View\s+/i, "").trim();
          if (label) record.title = label;
        }
        if (!record.href) record.href = attrFrom(anchor, "href");
        if (!record.location) record.location = attrFrom(anchor, "data-event-location");
        if (!record.ebCategory) record.ebCategory = attrFrom(anchor, "data-event-category");

        // Date lives in the first <p> after the anchor close, inside this card.
        if (!record.dateText) {
          const dateMatch = segment.match(/<\/a>\s*<p[^>]*>([^<]{3,90})<\/p>/);
          if (dateMatch) record.dateText = decodeEntities(dateMatch[1]).trim();
        }
        // Image lives in the image-card variant.
        if (!record.imageUrl) {
          const imgMatch = segment.match(/<img[^>]*class="event-card-image"[^>]*src="([^"]*)"/);
          if (imgMatch) record.imageUrl = imgMatch[1];
        }

        byId.set(eventId, record);
      }
    } catch (e) {
      console.error(`Error scraping ${url}:`, e.message);
    }
  }

  // Merge complete, filter, and shape rows.
  const events = [];
  for (const [eventId, record] of byId) {
    if (!record.title) continue;
    if (!isParanormalEvent(record.title, record.ebCategory)) continue;

    let city = "", state = "", isVirtual = 0, locationName = "";
    const location = (record.location || "").toLowerCase();
    if (location === "online") {
      isVirtual = 1;
      locationName = "Online";
    } else {
      const parts = (record.location || "").split(",");
      city = (parts[0] || "").trim();
      state = (parts[1] || "").trim();
    }

    const parsed = parseEventbriteDate(record.dateText);

    events.push({
      externalId: `eb_${eventId}`,
      title: record.title.substring(0, 200),
      type: classifyType(record.title),
      category: classifyCategory(record.title, record.ebCategory),
      startDate: parsed ? parsed.iso : "",
      dateDisplay: parsed ? parsed.display : record.dateText,
      locationName,
      city: city.substring(0, 120),
      state: state.substring(0, 60),
      isVirtual,
      imageUrl: record.imageUrl,
      sourceUrl: record.href,
    });
  }

  // Atomically replace the eventbrite rows (D1 batch = single transaction).
  let inserted = 0;
  if (events.length > 0) {
    const statements = [env.TPI_DB.prepare("DELETE FROM events WHERE source = 'eventbrite'")];
    for (const event of events.slice(0, 300)) {
      statements.push(
        env.TPI_DB.prepare(`
          INSERT INTO events (external_id, title, type, category, start_date, date_display,
            location_name, city, state, country, is_virtual, image_url, source_url, source, status, scraped_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'United States', ?, ?, ?, 'eventbrite', 'approved', datetime('now'))
        `).bind(
          event.externalId,
          event.title,
          event.type,
          event.category,
          event.startDate,
          event.dateDisplay,
          event.locationName,
          event.city,
          event.state,
          event.isVirtual,
          event.imageUrl,
          event.sourceUrl
        )
      );
    }
    try {
      await env.TPI_DB.batch(statements);
      inserted = statements.length - 1;
    } catch (e) {
      console.error("Event batch write failed:", e.message);
      scrapeError = e;
      // Not rethrown: the fetch/parse pass completed; the run record below
      // captures the storage failure. Callers' behavior is unchanged.
    }
  }

  await logScraperRun(env, {
    scraperType: "events", source: "eventbrite", trigger, started,
    status: scrapeError ? "failed" : (fetchErrors > 0 ? "partial" : "success"),
    found: events.length, inserted: inserted, skipped: fetchErrors,
    errorCount: fetchErrors + (scrapeError ? 1 : 0),
    errorMessage: scrapeError?.message || "",
    metadata: { urls: EVENTBRITE_URLS.length },
  });

  if (scrapeError) throw scrapeError;
  return { scraped: events.length, inserted };
}
