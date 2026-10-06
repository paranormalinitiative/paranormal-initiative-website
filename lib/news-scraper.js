// ParaNews scraper — aggregates paranormal news from RSS feeds into D1.
// Shared by the cron worker and the /api/news/refresh endpoint (same
// pattern as lib/event-scraper.js so the two can never drift).
//
// Every source is no-auth and failure-tolerant: a dead feed skips itself
// without affecting the others.

const FEEDS = [
  // Bing News RSS — direct article URLs + real images per item (best cards)
  { name: "Bing News · Paranormal", url: "https://www.bing.com/news/search?q=paranormal+OR+ghost+OR+haunted&format=RSS", bing: true },
  { name: "Bing News · UFO/UAP", url: "https://www.bing.com/news/search?q=UFO+OR+UAP&format=RSS", bing: true },
  { name: "Bing News · Bigfoot", url: "https://www.bing.com/news/search?q=bigfoot+OR+cryptid&format=RSS", bing: true },
  { name: "Bing News · Psychic", url: "https://www.bing.com/news/search?q=psychic+OR+medium&format=RSS", bing: true },
  { name: "Bing News · Haunted", url: "https://www.bing.com/news/search?q=haunted+OR+%22ghost+hunt%22&format=RSS", bing: true },

  // Google News RSS — one query per major topic for broad coverage
  { name: "Google News · Paranormal", url: "https://news.google.com/rss/search?q=paranormal+OR+ghost+OR+haunted&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News · UFO/UAP", url: "https://news.google.com/rss/search?q=UFO+OR+UAP+OR+alien&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News · Bigfoot/Cryptid", url: "https://news.google.com/rss/search?q=bigfoot+OR+cryptid+OR+cryptozoology&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News · Psychic/Medium", url: "https://news.google.com/rss/search?q=psychic+OR+mediumship+OR+clairvoyant&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News · Paranormal Investigation", url: "https://news.google.com/rss/search?q=%22paranormal+investigation%22+OR+%22ghost+hunt%22&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News · Dreams", url: "https://news.google.com/rss/search?q=%22sleep+paralysis%22+OR+%22lucid+dream%22&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News · Mandela", url: "https://news.google.com/rss/search?q=%22mandela+effect%22&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News · Near Death", url: "https://news.google.com/rss/search?q=%22near-death+experience%22+OR+%22near+death%22&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News · Prophecies", url: "https://news.google.com/rss/search?q=prophecy+OR+nostradamus&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News · Ancient", url: "https://news.google.com/rss/search?q=ancient+mystery+OR+archaeology+discovery&hl=en-US&gl=US&ceid=US:en" },

  // Paranormal site + community RSS feeds (verified live 2026-10-05)
  { name: "MUFON", url: "https://mufon.com/feed" },
  { name: "The Paranormal Daily News", url: "https://www.paranormaldailynews.com/feed" },
  { name: "Daily Grail", url: "https://www.dailygrail.com/feed" },
  { name: "All That Is Interesting", url: "https://allthatsinteresting.com/feed" },
  { name: "Ancient Origins", url: "https://www.ancient-origins.net/rss.xml" },
  { name: "Archaeology Magazine", url: "https://www.archaeology.org/feed" },
  { name: "Earthfiles", url: "https://www.earthfiles.com/rss" },
  { name: "OpenMinds TV", url: "https://www.openminds.tv/feed" },
  { name: "Ghost Theory", url: "https://www.ghosttheory.com/feed" },
  { name: "Bigfoot Evidence", url: "https://bigfootevidence.blogspot.com/feeds/posts/default" },
  { name: "UFO Sightings Daily", url: "https://www.ufosightingsdaily.com/feeds/posts/default" },
];

// The 12 ParaNews categories (Todd's list, in page order).
export const NEWS_CATEGORIES = [
  "cryptozoology", "ufo", "ghosts", "ancient", "dreams", "mandela",
  "psychic", "prophecies", "near death", "spirituality", "rabbit hole", "unexplained",
];

const CATEGORY_KEYWORDS = {
  "cryptozoology": ["bigfoot", "sasquatch", "cryptid", "cryptozoology", "creature", "beast", "mothman", "chupacabra", "yeti", "yowie", "dogman", "thunderbird", "lake monster", " Loch ness", "nessie"],
  "ufo": ["ufo", "uap", "alien", "extraterrestrial", "flying saucer", "abduction", "disclosure", "crash retrieval", "nasa uap"],
  "ghosts": ["ghost", "haunt", "haunted", "spirit box", "apparition", "poltergeist", "evp", "seance", "ouija", "paranormal investigation", "ghost hunt"],
  "ancient": ["ancient", "artifact", "ruins", "archaeology", "archaeologist", "pyramid", "megalith", "antiquity", "prehistoric", "lost city"],
  "dreams": ["dream", "lucid", "nightmare", "sleep paralysis", "REM sleep"],
  "mandela": ["mandela effect", "alternate reality", "timeline shift", "false memory", "glitch in the matrix"],
  "psychic": ["psychic", "medium", "mediumship", "clairvoyant", "telepathy", "telekinesis", "precognition", "esp", "mind reading"],
  "prophecies": ["prophecy", "prophecies", "prediction", "oracle", "divination", "nostradamus", "doomsday", "apocalypse prediction"],
  "near death": ["near death", "nde", "afterlife", "out of body", "obe", "life after death", "clinical death", "past life", "reincarnation"],
  "spirituality": ["spiritual", "spirituality", "meditation", "enlightenment", "soul", "aura", "chakra", "energy healing", "awakening", "consciousness"],
  "rabbit hole": ["conspiracy", "cover-up", "coverup", "cover up", "secret government", "hidden truth", "declassified", "freemason", "illuminati", "new world order"],
};

const EXCLUDE_PATTERNS = [
  /job(s)?\b/i, /hiring/i, /coupon/i, /deal(s)?\b.*discount/i, /giveaway.*enter/i,
];

export function classifyNews(title, excerpt = "") {
  const text = `${title} ${excerpt}`.toLowerCase();
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(text)) return null;
  }
  let best = null;
  let bestScore = 0;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) score += keyword.includes(" ") ? 2 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }
  return best || "unexplained";
}

// Pulls readable text out of a CDATA block or plain tag body.
function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'");
}

function tagContent(xml, tag, occurrence = 1) {
  const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i");
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  let found = 0;
  for (const re of [cdataRe, plainRe]) {
    const global = new RegExp(re.source, "gi");
    let m;
    while ((m = global.exec(xml)) !== null) {
      found++;
      if (found === occurrence) return m[1].trim();
    }
  }
  return "";
}

function stripHtml(html) {
  return html
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

// Google News description HTML is DOUBLE-escaped (it wraps an <a> tag in
// entity-encoded text), so strip twice: once as markup, once as entities.
function stripGoogleNewsHtml(html) {
  return stripHtml(stripHtml(html));
}

// Extracts the first image URL from an RSS item (media:content, enclosure,
// media:thumbnail, or an <img> inside the description).
function extractImage(item) {
  const media = item.match(/<(?:media:content|media:thumbnail|enclosure)[^>]*url="([^"]+\.(?:jpe?g|png|webp|gif)[^"]*)"/i);
  if (media) return media[1];
  const itunes = item.match(/<itunes:image[^>]*href="([^"]+)"/i);
  if (itunes) return itunes[1];
  // WordPress feeds carry images in <content:encoded>, not <description>.
  const contentEncoded = item.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i);
  if (contentEncoded) {
    const cimg = contentEncoded[1].match(/<img[^>]*src=["']?(https?:\/\/[^"'\s>]+)/i);
    if (cimg) return cimg[1];
  }
  const description = tagContent(item, "description");
  const img = description.match(/<img[^>]*src=["']?(https?:\/\/[^"'\s>]+)/i);
  if (img) return img[1];
  // Last resort: any <img src> anywhere in the raw item markup.
  const anyImg = item.match(/<img[^>]*src=["']?(https?:\/\/[^"'\s>]+)/i);
  if (anyImg) return anyImg[1];
  return "";
}

export function hashId(text) {
  // FNV-1a 32-bit, hex — stable dedupe key for external_id
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return "pn_" + hash.toString(16).padStart(8, "0");
}

export function parseRssItems(xml) {
  // Handles both <item> (RSS 2.0) and <entry> (Atom) shapes.
  const items = [];
  const itemRe = /<(?:item|entry)[\s\S]*?<\/(?:item|entry)>/gi;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const item = m[0];
    let title = stripHtml(tagContent(item, "title"));
    let link = tagContent(item, "link");
    if (!link) {
      const href = item.match(/<link[^>]*href="([^"]+)"/i);
      if (href) link = href[1];
    }
    // Bing wraps the real article URL in an apiclick redirect; unwrap it.
    // Entities first (&amp; -> &) so the url= param boundary parses right.
    if (link && link.includes("bing.com/news/apiclick")) {
      const unwrapped = decodeURIComponent(
        (link.replace(/&amp;/g, "&").match(/[?&]url=([^&]+)/) || [])[1] || ""
      );
      if (unwrapped.startsWith("http")) link = unwrapped;
    }
    // Google News: title is "Headline - Source"; keep both.
    let sourceName = "";
    const gnSource = tagContent(item, "source") || item.match(/<News:Source>([\s\S]*?)<\/News:Source>/i)?.[1];
    if (gnSource) sourceName = stripHtml(gnSource);
    else if (/<-\s*[^<]+$/.test(title)) {
      const idx = title.lastIndexOf(" - ");
      if (idx > 10) {
        sourceName = title.slice(idx + 3);
        title = title.slice(0, idx);
      }
    }
    const excerpt = stripGoogleNewsHtml(tagContent(item, "description")).slice(0, 400);
    const pubRaw = tagContent(item, "pubDate") || tagContent(item, "published") || tagContent(item, "updated");
    let publishedAt = "";
    if (pubRaw) {
      const d = new Date(pubRaw);
      if (!isNaN(d.getTime())) publishedAt = d.toISOString();
    }
    if (!title || !link) continue;
    if (!/^https?:\/\//i.test(link)) continue;
    // Bing puts the article image in a namespaced <News:Image> tag.
    const bingImage = item.match(/<News:Image>([^<]+)<\/News:Image>/i);
    const image = bingImage ? decodeEntities(bingImage[1].trim()) : extractImage(item);
    items.push({ title, link, excerpt, publishedAt, sourceName, image });
  }
  return items;
}

export async function scrapeNews(env) {
  const byId = new Map();
  let feedsOk = 0;

  for (const feed of FEEDS) {
    try {
      const response = await fetch(feed.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; TPI-NewsBot/1.0)", "Accept": "application/rss+xml, application/xml, text/xml, */*" },
      });
      if (!response.ok) continue;
      const xml = await response.text();
      const items = parseRssItems(xml);
      if (!items.length) continue;
      feedsOk++;
      for (const item of items) {
        const key = item.link.replace(/[?#].*$/, "").replace(/\/$/, "").toLowerCase();
        const externalId = hashId(key);
        if (byId.has(externalId)) continue;
        byId.set(externalId, {
          externalId,
          title: item.title.slice(0, 220),
          excerpt: item.excerpt,
          imageUrl: item.image,
          sourceUrl: item.link.slice(0, 1000),
          sourceName: (item.sourceName || feed.name).slice(0, 120),
          category: classifyNews(item.title, item.excerpt),
          publishedAt: item.publishedAt || "",
        });
      }
    } catch (e) {
      console.error(`News feed failed (${feed.name}):`, e.message);
    }
  }

  // Atomically replace nothing — news ACCUMULATES; insert-only with
  // idempotent external_id, then prune anything older than 30 days.
  const rows = [...byId.values()];
  let inserted = 0;
  if (rows.length) {
    const statements = [];
    for (const row of rows.slice(0, 250)) {
      statements.push(
        env.TPI_DB.prepare(`
          INSERT INTO news_articles (external_id, title, excerpt, image_url, source_url, source_name, author, category, published_at, status, scraped_at)
          VALUES (?, ?, ?, ?, ?, ?, '', ?, ?, 'approved', datetime('now'))
          ON CONFLICT(external_id) DO NOTHING
        `).bind(
          row.externalId, row.title, row.excerpt, row.imageUrl,
          row.sourceUrl, row.sourceName, row.category, row.publishedAt
        )
      );
    }
    statements.push(
      env.TPI_DB.prepare(`DELETE FROM news_articles WHERE COALESCE(published_at, scraped_at) < datetime('now', '-30 days')`)
    );
    try {
      const results = await env.TPI_DB.batch(statements);
      // Count successful inserts (meta.changes; the prune DELETE is last).
      for (let i = 0; i < results.length - 1; i++) {
        inserted += Number(results[i]?.meta?.changes || 0);
      }
    } catch (e) {
      console.error("News batch write failed:", e.message);
      throw e;
    }
  }

  return { feedsOk, feedsTotal: FEEDS.length, collected: rows.length, inserted };
}
