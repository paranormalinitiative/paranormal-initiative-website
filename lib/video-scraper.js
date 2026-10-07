// ParaTube scraper — aggregates paranormal videos from public video
// platforms into D1. Shared by the cron worker and the /api/videos/refresh
// endpoint (same pattern as lib/news-scraper.js so the two can never drift).
//
// Live-tested 2026-10-05:
//   - Dailymotion Graph API: PUBLIC, no key, rich fields. WORKING.
//   - Internet Archive advancedsearch + metadata APIs: PUBLIC. WORKING.
//   - Odysee claim_search proxy: WORKING via any_tags (see fetchOdysee note)
//   - Rumble: search HTML 403s server-side; no public RSS. Adapter kept,
//     disabled by default.
//   - BitChute: /feeds/rss/* now 404 through api.bitchute.com. Disabled.
//
// Every source is no-auth and failure-tolerant: a dead source skips itself
// without affecting the others.

// (news-scraper exports the category list + hashId; text helpers live here
// to keep the two scrapers independent.)
import { hashId } from "./news-scraper.js";
import { logScraperRun, startScraperRun } from "./scraper-log.js";

// Provider states for the admin monitoring dashboard. Single source of
// truth: the API serves this directly. not_configured is a normal,
// non-error state (a provider we have not built yet).
export const PROVIDER_STATUS = [
  { key: "dailymotion", label: "Dailymotion", state: "active" },
  { key: "internet_archive", label: "Internet Archive", state: "active" },
  { key: "odysee", label: "Odysee", state: "active" },
  { key: "youtube", label: "YouTube", state: "not_configured" },
  { key: "rumble", label: "Rumble", state: "not_configured" },
];

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
  "ITC instrumental transcommunication",
  "seance ouija session",
  "parapsychology telepathy",
  "alien abduction documentary",
  "declassified secret UFO program",
  "psychic medium reading",
  "astral projection out of body",
  "paranormal documentary 2026",
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
  // Obvious non-paranormal entertainment (kept narrow: dramatic paranormal
  // investigation content must still pass).
  /\bgameplay\b/i,
  /\blet'?s play\b/i,
  /\bminecraft\b/i,
  /\bmusic video\b/i,
  /\blyrics?\b.*\b(?:song|official)\b/i,
  /\btrailer\b.*\b(?:movie|film|netflix|series)\b/i,
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
    // Weak single-word categories (dream/ancient/spiritual...) match lots of
    // mainstream content. Require corroboration — at least a phrase keyword
    // (worth 2) or two weak hits — before assigning the category. Specific
    // categories (ghosts/ufo/cryptozoology/...) keep the single-hit rule.
    const minimumScore = WEAK_CATEGORIES.has(category) ? 2 : 1;
    if (score >= minimumScore) return category;
  }
  return "unexplained";
}

// Categories whose single generic word is too common to classify alone.
const WEAK_CATEGORIES = new Set(["dreams", "ancient", "spirituality"]);

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

// Strong paranormal signal — title/description must contain one of these to
// be kept when the classifier could not assign a category. Deliberately
// broader than any single keyword list so documentaries, historical cases
// and folklore survive.
const STRONG_PARANORMAL_RE = /paranormal|ghost|haunt|spirit|ufo|uap|alien|bigfoot|cryptid|sasquatch|seance|ouija|\bevp\b|itc (?:session|research|recording|device|experiment|spirit|radio)|near[- ]death|apparition|poltergeist|supernatural|unexplained|parapsychology|cryptozoology/i;

// ── Dailymotion ─────────────────────────────────────────────────────────────

async function fetchDailymotion(env, diag) {
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
        diag.found++;
        if (!video.url || !video.title) { diag.skipped++; continue; }
        const title = stripHtml(String(video.title));
        if (isSpam(title)) { diag.skipped++; continue; }
        const description = stripHtml(String(video.description || "")).slice(0, 500);
        // Dailymotion "search" is fuzzy; keep results that actually relate
        // to the paranormal space so the feed stays on-topic.
        const rel = classifyVideo(title, description);
        if (rel === "unexplained" && !STRONG_PARANORMAL_RE.test(title + " " + description)) { diag.skipped++; continue; }
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
      diag.errors.push(`query "${query}": ${e.message}`);
      console.error(`Dailymotion query failed ("${query}"):`, e.message);
    }
  }
  return results;
}

// ── Internet Archive ────────────────────────────────────────────────────────

async function fetchArchive(env, diag) {
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
        diag.found++;
        if (!doc.identifier || !doc.title) { diag.skipped++; continue; }
        const title = stripHtml(String(doc.title));
        if (isSpam(title)) { diag.skipped++; continue; }
        const description = stripHtml(String(doc.description || "")).slice(0, 500);
        // Archive search matches any word in the query, so results drift far
        // off-topic ("paranormal" returns unrelated uploads). Apply the same
        // relevance bar as Dailymotion: the classifier must assign a category
        // using title + description together, or the text must carry a strong
        // paranormal signal. Keeps historical/folklore material ("1977 UFO
        // documentary", "Sasquatch field recordings") while dropping
        // unrelated videos.
        const rel = classifyVideo(title, description);
        if (rel === "unexplained" && !STRONG_PARANORMAL_RE.test(title + " " + description)) { diag.skipped++; continue; }
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
      diag.errors.push(`query "${query}": ${e.message}`);
      console.error(`Archive query failed ("${query}"):`, e.message);
    }
  }
  return results;
}

// ── Odysee ─────────────────────────────────────────────────────────────────
//
// 2026-10-07 live audit (Phase 2A): claim_search works — the earlier "zero
// results" diagnosis was wrong about the cause. Two specific parameters were
// poisoning every query, including the tag-based ones:
//
//   1. `media_type: ["video"]` — returns 0 items (total_items: 0) on this
//      proxy for every query tested, even alongside a working text search.
//   2. `order_by: ["release_time"]` (and "creation_time") — returns 0 items
//      with total_items missing. Only the default ordering and
//      "trending_mixed" return results.
//
// With those removed, `any_tags` queries return well-formed video claims
// (control tag "gaming" included), each carrying claim_id, canonical_url,
// thumbnails, durations, and timestamps. Video-only filtering is therefore
// done client-side via `value.video` presence. No pagination: one page of 20
// per tag, 6 tags per cycle — a small, bounded request footprint every 6h.
// No credentials involved; the proxy is public and unauthenticated.

const ODYSEE_ENABLED = true;
const ODYSEE_TAGS = ["paranormal", "ghosts", "ufo", "bigfoot", "hauntings", "cryptid"];

async function fetchOdysee(env, diag) {
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
            page_size: 20,
            not_tags: ["porn", "mature", "c:private", "c:unlisted"],
          },
          id: 1,
        }),
      });
      if (!response.ok) continue;
      const data = await response.json();
      for (const item of data?.result?.items || []) {
        diag.found++;
        const value = item.value || {};
        // The proxy cannot filter by media_type (see note above): video
        // streams are identified client-side by the presence of value.video.
        if (!value.video) { diag.skipped++; continue; }
        const title = stripHtml(String(value.title || item.name || ""));
        if (!title) { diag.skipped++; continue; }
        if (isSpam(title)) { diag.skipped++; continue; }
        const description = stripHtml(String(value.description || "")).slice(0, 500);
        // Same relevance bar as Dailymotion/Internet Archive: a category or
        // a strong paranormal phrase, title + description together.
        const rel = classifyVideo(title, description);
        if (rel === "unexplained" && !STRONG_PARANORMAL_RE.test(title + " " + description)) { diag.skipped++; continue; }
        // Canonical Odysee web URL: lbry://@channel#x/claim#y becomes
        // https://odysee.com/@channel:x/claim:y. claim_id is permanent, so
        // the URL is stable across runs.
        const lbryUrl = String(item.canonical_url || item.permanent_url || "");
        if (!lbryUrl) { diag.skipped++; continue; }
        const sourceUrl = "https://odysee.com/" + lbryUrl.replace(/^lbry:\/\//, "").replace(/#/g, ":");
        const channelRaw = String(
          value.signing_channel?.value?.title ||
          String(value.signing_channel?.canonical_url || "").replace(/^lbry:\/\/@/, "").replace(/#.*$/, "") ||
          ""
        );
        results.push({
          externalId: "pt_od_" + (item.claim_id || hashId(lbryUrl)),
          title: title.slice(0, 220),
          description,
          thumbnailUrl: value.thumbnail?.url || "",
          sourceUrl,
          sourceName: "Odysee",
          channelName: stripHtml(channelRaw).slice(0, 120),
          durationSeconds: Number(value.video?.duration) || 0,
          category: rel,
          publishedAt: value.release_time
            ? new Date(value.release_time * 1000).toISOString()
            : (item.timestamp ? new Date(item.timestamp * 1000).toISOString() : ""),
        });
      }
    } catch (e) {
      diag.errors.push(`tag "${tag}": ${e.message}`);
      console.error(`Odysee tag failed ("${tag}"):`, e.message);
    }
  }
  return results;
}

// ── Main scrape entry ───────────────────────────────────────────────────────

// Collapse the same upload appearing under slightly different titles
// ("Nightfall: A Paranormal Investigation" / "Nightfall A Paranormal
// Investigation 2025") or across sources: lowercase, strip years, strip
// punctuation, collapse spaces.
export function normalizeVideoTitle(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/\b(19|20)\d{2}\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Canonicalizes a video URL for cross-source duplicate comparison:
// strips tracking parameters (utm_*, and platform-specific junk like
// Dailymotion's Gtrack referral paths) and trailing slashes. Host and path
// are preserved so platform-specific URLs remain identifiable and two
// different videos are never collapsed.
export function canonicalVideoUrl(url) {
  let cleaned = String(url || "").trim().replace(/\/$/, "");
  if (!cleaned) return "";
  try {
    const parsed = new URL(cleaned);
    const params = new URLSearchParams(parsed.search);
    const tracking = [...params.keys()].filter(
      (key) => /^utm_/i.test(key) || /^(ref|source|fbclid|gclid)$/i.test(key)
    );
    tracking.forEach((key) => params.delete(key));
    const search = params.toString();
    return parsed.origin + parsed.pathname + (search ? "?" + search : "");
  } catch (e) {
    return cleaned.toLowerCase();
  }
}

// Jaccard word-overlap 0..1 for two normalized titles. Cheap, deterministic,
// and conservative: only near-identical titles exceed the flag threshold.
export function titleSimilarity(a, b) {
  const setA = new Set(String(a || "").split(/\s+/).filter(Boolean));
  const setB = new Set(String(b || "").split(/\s+/).filter(Boolean));
  if (!setA.size || !setB.size) return 0;
  let intersection = 0;
  for (const word of setA) if (setB.has(word)) intersection++;
  return intersection / (setA.size + setB.size - intersection);
}

// Conservative cross-source duplicate test. Used only to skip a NEW row when
// an existing record already covers the same video. Optional signals
// (channel, duration, date) corroborate; a match without them (normalized
// title alone) is flagged, not silently merged.
export function isProbableDuplicate(row, existing) {
  const normA = normalizeVideoTitle(row.title);
  const normB = normalizeVideoTitle(existing.title);
  if (!normA || !normB) return false;
  // Exact canonical URL match (across any source) is conclusive — tracking
  // parameters aside, a platform URL identifies one video.
  if (row.sourceUrl && existing.sourceUrl &&
      canonicalVideoUrl(row.sourceUrl) === canonicalVideoUrl(existing.sourceUrl)) return true;
  const similarity = titleSimilarity(normA, normB);
  if (similarity < 0.8) return false;
  // Strong corroboration: same channel ± 1 minute duration.
  const channelA = String(row.channelName || "").toLowerCase().trim();
  const channelB = String(existing.channelName || "").toLowerCase().trim();
  const sameChannel = channelA && channelB && channelA === channelB;
  const durA = Number(row.durationSeconds) || 0;
  const durB = Number(existing.durationSeconds) || 0;
  const closeDuration = durA && durB && Math.abs(durA - durB) <= 60;
  if (sameChannel && closeDuration) return true;
  // Title alone: still a duplicate within the same provider (the in-run
  // normalized-title rule); across providers requires corroboration.
  const sameSource = row.sourceName === existing.sourceName;
  return sameSource ? similarity >= 0.8 : false;
}

export async function scrapeVideos(env, options = {}) {
  const trigger = options.trigger || "cron";
  const started = startScraperRun();
  const dmDiag = { found: 0, skipped: 0, errors: [] };
  const iaDiag = { found: 0, skipped: 0, errors: [] };
  const odDiag = { found: 0, skipped: 0, errors: [] };
  let batches;
  let scrapeError = null;
  try {
    batches = await Promise.all([fetchDailymotion(env, dmDiag), fetchArchive(env, iaDiag), fetchOdysee(env, odDiag)]);
  } catch (e) {
    scrapeError = e;
    batches = [[], [], []];
  }
  const byId = new Map();
  const seenTitles = new Set();
  let duplicatesSkipped = 0;
  // Round-robin across provider batches so the 200-row storage cap cannot be
  // monopolized by whichever provider returns the most results (a busy
  // Dailymotion day otherwise crowds out Internet Archive and Odysee
  // entirely). Dedup rules are unchanged.
  const queues = batches.map((batch) => [...batch]);
  while (queues.some((queue) => queue.length)) {
    for (const queue of queues) {
      const row = queue.shift();
      if (!row) continue;
      if (byId.has(row.externalId)) continue;
      const key = normalizeVideoTitle(row.title);
      if (key && seenTitles.has(key)) { duplicatesSkipped++; continue; }
      if (key) seenTitles.add(key);
      byId.set(row.externalId, row);
    }
  }

  const rows = [...byId.values()];
  let inserted = 0;
  let writeError = null;
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
    // Prune by DB age (scraped_at), NOT published_at — a great 2015
    // documentary is still worth listing, and pruning on published_at was
    // wiping most Dailymotion results the moment they were inserted.
    statements.push(
      env.TPI_DB.prepare(`DELETE FROM videos WHERE scraped_at < datetime('now', '-180 days')`)
    );
    try {
      const results = await env.TPI_DB.batch(statements);
      for (let i = 0; i < results.length - 1; i++) {
        inserted += Number(results[i]?.meta?.changes || 0);
      }
    } catch (e) {
      console.error("ParaTube batch write failed:", e.message);
      writeError = e;
      // Intentionally not rethrown: the scrape itself completed, and the run
      // record below captures the storage failure for the admin dashboard.
    }
  }

  // Per-provider run records so the dashboard can show one health line per
  // source, then one aggregated record for the videos run as a whole.
  await Promise.all([      logScraperRun(env, {
      scraperType: "videos", source: "dailymotion", trigger, started,
      status: dmDiag.errors.length === 0 ? "success" : (dmDiag.errors.length < DAILYMOTION_QUERIES.length ? "partial" : "failed"),
      found: dmDiag.found, skipped: dmDiag.skipped,
      errorCount: dmDiag.errors.length, errorMessage: dmDiag.errors.join(" | "),
      metadata: { queries: DAILYMOTION_QUERIES.length },
    }),
    logScraperRun(env, {
      scraperType: "videos", source: "internet_archive", trigger, started,
      status: iaDiag.errors.length === 0 ? "success" : (iaDiag.errors.length < ARCHIVE_QUERIES.length ? "partial" : "failed"),
      found: iaDiag.found, skipped: iaDiag.skipped,
      errorCount: iaDiag.errors.length, errorMessage: iaDiag.errors.join(" | "),
      metadata: { queries: ARCHIVE_QUERIES.length },
    }),
    logScraperRun(env, {
      scraperType: "videos", source: "odysee", trigger, started,
      status: ODYSEE_ENABLED ? (odDiag.errors.length === 0 ? "success" : (odDiag.errors.length < ODYSEE_TAGS.length ? "partial" : "failed")) : "success",
      found: odDiag.found, skipped: odDiag.skipped,
      errorCount: odDiag.errors.length, errorMessage: odDiag.errors.join(" | "),
      metadata: { enabled: ODYSEE_ENABLED, queries: ODYSEE_TAGS.length },
    }),
  ]);
  await logScraperRun(env, {
    scraperType: "videos", source: "", trigger, started,
    status: scrapeError || writeError ? "failed" : "success",
    found: rows.length + duplicatesSkipped, inserted: inserted, skipped: duplicatesSkipped,
    errorCount: (scrapeError ? 1 : 0) + (writeError ? 1 : 0),
    errorMessage: scrapeError?.message || writeError?.message || "",
  });

  if (scrapeError) throw scrapeError;
  return { collected: rows.length, inserted };
}
