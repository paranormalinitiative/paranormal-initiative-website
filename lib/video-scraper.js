// ParaTube scraper — aggregates paranormal videos from public video
// platforms into D1. Shared by the cron worker and the /api/videos/refresh
// endpoint (same pattern as lib/news-scraper.js so the two can never drift).
//
// Live-tested 2026-10-05:
//   - Dailymotion Graph API: PUBLIC, no key, rich fields. WORKING.
//   - Internet Archive advancedsearch + metadata APIs: PUBLIC. WORKING.
//   - Odysee claim_search proxy: returns 0 results even for generic queries
//     (API-side issue 2026-10-05) — adapter kept, disabled by default.
//   - Rumble: search HTML 403s server-side; no public RSS. Adapter kept,
//     disabled by default.
//   - BitChute: /feeds/rss/* now 404 through api.bitchute.com. Disabled.
//
// Every source is no-auth and failure-tolerant: a dead source skips itself
// without affecting the others.

// (news-scraper exports the category list + hashId; text helpers live here
// to keep the two scrapers independent.)
import { hashId } from "./news-scraper.js";

function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (m, c) => String.fromCharCode(parseInt(c, 16)))
    .replace(/&#(\d+);/g, (m, c) => String.fromCharCode(Number(c)))
    .replace(/\s+/g, " ")
    .trim();
}

// Per-category search terms tuned per platform. Dailymotion search is a
// plain text match, so keyword groups work better than single words.
const DAILYMOTION_QUERIES = [
  "paranormal investigation",
  "ghost hunting",
  "haunted house real",
  "UFO UAP sighting",
  "bigfoot sighting",
  "cryptid creature sighting",
  "EVP session spirit box",
  "near death experience documentary",
];

// Internet Archive: mediatype:movies only (real playable videos), sorted
// newest first. Broad queries — Archive's text search is weak on niche terms.
const ARCHIVE_QUERIES = [
  "paranormal",
  "ghost investigation",
  "UFO sighting",
  "bigfoot",
];

// Dailymotion query rows that look like drama-clip spam (tested live: the
// "ghost haunting" query returns K-drama uploads). These are filtered by
// title heuristics below, not at query time.
const SPAM_PATTERNS = [
  /\bep(isode)?\s*\d+.*(engsub|drama)\b/i,
  /\bengsub\b/i,
  /\bfull ep\b/i,
  /mafia (romance|don)/i,
  /\bshort drama\b/i,
  /\bmy online ex\b/i,
];

function isSpam(title) {
  return SPAM_PATTERNS.some((re) => re.test(title));
}

export function classifyVideo(title, description = "") {
  // Reuses the ParaNews keyword classifier over the video title/description.
  const text = `${title} ${description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS_VIDEO)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) score += keyword.includes(" ") ? 2 : 1;
    }
    if (score > 0) return category;
  }
  return "unexplained";
}

// Video-tuned keyword map (subset + extras; falls back to unexplained).
const CATEGORY_KEYWORDS_VIDEO = {
  ghosts: ["ghost", "haunt", "haunted", "spirit box", "apparition", "poltergeist", "evp", "seance", "ouija", "paranormal investigation", "ghost hunt"],
  ufo: ["ufo", "uap", "alien", "extraterrestrial", "flying saucer", "abduction", "crash retrieval"],
  cryptozoology: ["bigfoot", "sasquatch", "cryptid", "cryptozoology", "creature", "mothman", "chupacabra", "yeti", "dogman", "lake monster", "nessie"],
  "near death": ["near death", "nde", "afterlife", "out of body", "life after death", "reincarnation"],
  psychic: ["psychic", "medium", "mediumship", "clairvoyant", "telepathy", "precognition"],
  dreams: ["dream", "lucid", "nightmare", "sleep paralysis"],
  ancient: ["ancient", "artifact", "ruins", "archaeology", "pyramid", "megalith", "lost city"],
  spirituality: ["spiritual", "meditation", "consciousness", "awakening", "soul"],
  mandela: ["mandela effect", "glitch in the matrix", "false memory"],
  prophecies: ["prophecy", "nostradamus", "prediction", "divination"],
  "rabbit hole": ["conspiracy", "cover-up", "coverup", "declassified", "hidden truth"],
};

// ── Dailymotion ─────────────────────────────────────────────────────────────

async function fetchDailymotion(env) {
  const results = [];
  for (const query of DAILYMOTION_QUERIES) {
    try {
      const url =
        "https://api.dailymotion.com/videos?search=" + encodeURIComponent(query) +
        "&fields=id,title,description,thumbnail_360_url,url,created_time,owner.screenname,duration" +
        "&limit=20&sort=relevance";
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; TPI-VideoBot/1.0)" },
      });
      if (!response.ok) continue;
      const data = await response.json();
      for (const video of data.list || []) {
        if (!video.url || !video.title) continue;
        const title = stripHtml(String(video.title));
        if (isSpam(title)) continue;
        const description = stripHtml(String(video.description || "")).slice(0, 500);
        // Dailymotion "search" is fuzzy; keep results that actually relate
        // to the paranormal space so the feed stays on-topic.
        const rel = classifyVideo(title, description);
        if (rel === "unexplained" && !/paranormal|ghost|haunt|spirit|ufo|uap|alien|bigfoot|cryptid/i.test(title + " " + description)) continue;
        results.push({
          externalId: "pt_dm_" + video.id,
          title: title.slice(0, 220),
          description,
          thumbnailUrl: video.thumbnail_360_url || "",
          sourceUrl: video.url,
          sourceName: "Dailymotion",
          channelName: String((video["owner.screenname"]) || "Dailymotion").slice(0, 120),
          durationSeconds: Number(video.duration) || 0,
          category: rel,
          publishedAt: video.created_time
            ? new Date(video.created_time * 1000).toISOString()
            : "",
        });
      }
    } catch (e) {
      console.error(`Dailymotion query failed ("${query}"):`, e.message);
    }
  }
  return results;
}

// ── Internet Archive ────────────────────────────────────────────────────────

async function fetchArchive(env) {
  const results = [];
  for (const query of ARCHIVE_QUERIES) {
    try {
      const searchUrl =
        "https://archive.org/advancedsearch.php?q=" + encodeURIComponent(`${query} AND mediatype:movies`) +
        "&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=description&fl%5B%5D=date&rows=15" +
        "&sort%5B%5D=date+desc&output=json";
      const response = await fetch(searchUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; TPI-VideoBot/1.0)" },
      });
      if (!response.ok) continue;
      const data = await response.json();
      const docs = data?.response?.docs || [];
      for (const doc of docs) {
        if (!doc.identifier || !doc.title) continue;
        const title = stripHtml(String(doc.title));
        if (isSpam(title)) continue;
        const description = stripHtml(String(doc.description || "")).slice(0, 500);
        results.push({
          externalId: "pt_ia_" + doc.identifier,
          title: title.slice(0, 220),
          description,
          // Real thumbnail from the item's .thumbs/ files (verified format).
          thumbnailUrl: `https://archive.org/services/img/${encodeURIComponent(doc.identifier)}`,
          sourceUrl: `https://archive.org/details/${encodeURIComponent(doc.identifier)}`,
          sourceName: "Internet Archive",
          channelName: "Internet Archive",
          durationSeconds: 0,
          category: classifyVideo(title, description),
          publishedAt: doc.date ? new Date(doc.date).toISOString() : "",
        });
      }
    } catch (e) {
      console.error(`Archive query failed ("${query}"):`, e.message);
    }
  }
  return results;
}

// ── Odysee (disabled — adapter ready for when the public API recovers) ──────

const ODYSEE_ENABLED = false;
const ODYSEE_TAGS = ["paranormal", "ghosts", "ufo", "bigfoot", "hauntings", "cryptid"];

async function fetchOdysee(env) {
  if (!ODYSEE_ENABLED) return [];
  const results = [];
  for (const tag of ODYSEE_TAGS) {
    try {
      const response = await fetch("https://api.na-backend.odysee.com/api/v1/proxy?m=claim_search", {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (compatible; TPI-VideoBot/1.0)" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "claim_search",
          params: {
            any_tags: [tag],
            claim_type: ["stream"],
            media_type: ["video"],
            order_by: ["release_time"],
            page_size: 20,
            not_tags: ["porn", "mature", "c:private", "c:unlisted"],
          },
          id: 1,
        }),
      });
      if (!response.ok) continue;
      const data = await response.json();
      for (const item of data?.result?.items || []) {
        const value = item.value || {};
        const title = stripHtml(String(value.title || item.name || ""));
        if (!title) continue;
        const permanentUrl = item.permanent_url || "";
        // canonical_url is the shareable odysee.com link; fall back to the
        // lbry.tv form built from the permanent url.
        const canonical = value.source?.url || permanentUrl;
        const sourceUrl = canonical.startsWith("http")
          ? canonical
          : "https://odysee.com/" + encodeURIComponent(permanentUrl).replace(/%23/g, ":").replace(/%24/g, "%24");
        results.push({
          externalId: "pt_od_" + (item.claim_id || hashId(permanentUrl)),
          title: title.slice(0, 220),
          description: stripHtml(String(value.description || "")).slice(0, 500),
          thumbnailUrl: value.thumbnail?.url || "",
          sourceUrl,
          sourceName: "Odysee",
          channelName: String(value.signing_channel?.value?.title || value.signing_channel?.name || "Odysee").slice(0, 120),
          durationSeconds: Number(value.video?.duration) || 0,
          category: classifyVideo(title, String(value.description || "")),
          publishedAt: value.release_time
            ? new Date(value.release_time * 1000).toISOString()
            : (item.timestamp ? new Date(item.timestamp * 1000).toISOString() : ""),
        });
      }
    } catch (e) {
      console.error(`Odysee tag failed ("${tag}"):`, e.message);
    }
  }
  return results;
}

// ── Main scrape entry ───────────────────────────────────────────────────────

export async function scrapeVideos(env) {
  const batches = await Promise.all([fetchDailymotion(env), fetchArchive(env), fetchOdysee(env)]);
  const byId = new Map();
  for (const batch of batches) {
    for (const row of batch) {
      if (!byId.has(row.externalId)) byId.set(row.externalId, row);
    }
  }

  const rows = [...byId.values()];
  let inserted = 0;
  if (rows.length) {
    const statements = [];
    for (const row of rows.slice(0, 200)) {
      statements.push(
        env.TPI_DB.prepare(`
          INSERT INTO videos (external_id, title, description, thumbnail_url, source_url, source_name, channel_name, duration_seconds, category, published_at, status, scraped_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', datetime('now'))
          ON CONFLICT(external_id) DO NOTHING
        `).bind(
          row.externalId, row.title, row.description, row.thumbnailUrl,
          row.sourceUrl, row.sourceName, row.channelName, row.durationSeconds,
          row.category, row.publishedAt
        )
      );
    }
    // Keep ~90 days of video rows; videos age slower than news.
    statements.push(
      env.TPI_DB.prepare(`DELETE FROM videos WHERE COALESCE(published_at, scraped_at) < datetime('now', '-90 days')`)
    );
    try {
      const results = await env.TPI_DB.batch(statements);
      for (let i = 0; i < results.length - 1; i++) {
        inserted += Number(results[i]?.meta?.changes || 0);
      }
    } catch (e) {
      console.error("ParaTube batch write failed:", e.message);
      throw e;
    }
  }

  return { collected: rows.length, inserted };
}
