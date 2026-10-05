import { onRequest as handleApiRequest } from "./functions/api/[[path]].js";
import { getSessionUser } from "./lib/auth.js";

const MEMBER_GATE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>ITC Visual Studio — Member Access | The Paranormal Initiative</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #0a0c10; color: #c8cdd8; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
    .gate-card { max-width: 520px; width: 100%; background: #12151c; border: 1px solid #1e2230; border-radius: 12px; padding: 2.5rem; text-align: center; }
    .gate-kicker { text-transform: uppercase; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; color: #59a9dc; margin-bottom: 0.75rem; }
    h1 { font-size: 1.5rem; font-weight: 700; color: #e8ecf4; margin-bottom: 1rem; }
    .gate-message { font-size: 0.95rem; line-height: 1.6; color: #8d93a3; margin-bottom: 2rem; }
    .gate-actions { display: flex; flex-direction: column; gap: 0.75rem; }
    .gate-button { display: block; width: 100%; padding: 0.85rem 1.5rem; border-radius: 8px; font-size: 0.95rem; font-weight: 600; text-decoration: none; text-align: center; cursor: pointer; border: none; transition: background 0.2s, transform 0.1s; }
    .gate-button:hover { transform: translateY(-1px); }
    .gate-button:active { transform: translateY(0); }
    .gate-button-primary { background: #59a9dc; color: #0a0c10; }
    .gate-button-primary:hover { background: #6db8e8; }
    .gate-button-secondary { background: #1e2230; color: #c8cdd8; border: 1px solid #2a2f3e; }
    .gate-button-secondary:hover { background: #252a3a; }
    .gate-button-tertiary { background: transparent; color: #59a9dc; font-weight: 400; font-size: 0.85rem; }
    .gate-button-tertiary:hover { color: #6db8e8; }
    .gate-divider { width: 40px; height: 1px; background: #1e2230; margin: 0.5rem auto; }
  </style>
</head>
<body>
  <div class="gate-card">
    <p class="gate-kicker">The Paranormal Initiative</p>
    <h1>ITC Visual Studio — Member Access</h1>
    <p class="gate-message">ITC Visual Studio is available to registered members of The Paranormal Initiative. Sign in to continue, or create a free member account to access the application.</p>
    <div class="gate-actions">
      <a class="gate-button gate-button-primary" href="/member-login.html">Sign In</a>
      <a class="gate-button gate-button-secondary" href="/member-login.html">Create Free Account</a>
      <div class="gate-divider"></div>
      <a class="gate-button gate-button-tertiary" href="/">Return to The Paranormal Initiative</a>
    </div>
  </div>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // R2 WASM route (public, unchanged)
    if (url.pathname === "/app-assets/itc-visual-studio/ffmpeg-core.wasm") {
      const object = await env.TPI_MEDIA.get("apps/itc-visual-studio/ffmpeg-core.wasm");

      if (!object) {
        return new Response("FFmpeg core not found", { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("Content-Type", "application/wasm");
      headers.set("Cache-Control", "public, max-age=31536000, immutable");

      return new Response(object.body, {
        headers
      });
    }

    // API routes (unchanged)
    if (url.pathname.startsWith("/api/") || url.pathname === "/api") {
      const apiPath = url.pathname.replace(/^\/api\/?/, "");
      return handleApiRequest({
        request,
        env,
        ctx,
        params: {
          path: apiPath
        }
      });
    }

    // ITC Visual Studio member gate
    if (url.pathname.startsWith("/itc-visual-studio")) {
      const user = await getSessionUser(request, env);
      if (!user) {
        // For the entry route, show branded gate page
        if (url.pathname === "/itc-visual-studio" || url.pathname === "/itc-visual-studio/" || url.pathname === "/itc-visual-studio/index.html") {
          return new Response(MEMBER_GATE_HTML, {
            status: 403,
            headers: { "Content-Type": "text/html; charset=utf-8" }
          });
        }
        // For direct asset requests (.js, .css, etc.), return 403 without HTML body
        return new Response("Forbidden", { status: 403 });
      }
      // Authenticated - serve static asset
      return env.ASSETS.fetch(request);
    }

    // StudioFlow is in private build testing: leadership access only (owner or
    // admin, matching member-shell.js) until guest rooms and livestreaming pass
    // their production tests (see STUDIOFLOW_MASTER_TODO.md Phase 3). Revisit
    // this gate when RealtimeKit guests go into testing.
    if (url.pathname === "/studio" || url.pathname.startsWith("/studio/")) {
      // Guest invite links are the guest's credential (ground rule 6: guests
      // join via browser link — no website account needed). The app boots in
      // guest mode from the /studio/guest/<room> URL. App assets are public so
      // guests can load the same bundle; the host studio itself stays gated.
      if (url.pathname.startsWith("/studio/guest/")) {
        // Fetch the clean directory URL: /studio/index.html would 307 to
        // /studio/ (assets clean-URL handling, known bug #16) and guests
        // would bounce into the gated host page. The query string must
        // survive the rewrite: guest invite links carry ?code=<showCode>
        // (per-show invite codes; see functions/api room-codes endpoints).
        const appUrl = new URL("/studio/", url.origin);
        appUrl.search = url.search;
        return env.ASSETS.fetch(new Request(appUrl, request));
      }
      if (url.pathname.startsWith("/studio/assets/")) {
        return env.ASSETS.fetch(request);
      }
      const user = await getSessionUser(request, env);
      const hasStudioAccess = user && (user.role === "owner" || user.role === "admin");
      if (!hasStudioAccess) {
        const gateHtml = MEMBER_GATE_HTML
          .replaceAll("ITC Visual Studio", "StudioFlow")
          .replaceAll("StudioFlow — Member Access", "StudioFlow — Private Build Testing")
          .replaceAll(
            "StudioFlow is available to registered members of The Paranormal Initiative. Sign in to continue, or create a free member account to access the application.",
            "StudioFlow is in private build testing and is not open to member access yet. Please check back soon."
          );
        return new Response(gateHtml, {
          status: 403,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      }
      return env.ASSETS.fetch(request);
    }

    // Default: serve normal website static assets
    return env.ASSETS.fetch(request);
  },

  // Cron trigger: runs daily at 6 AM UTC
  async scheduled(event, env, ctx) {
    console.log("Running scheduled event scrape...");
    try {
      const result = await scrapeAndUpdateEvents(env);
      console.log(`Events updated: ${result.scraped} scraped, ${result.inserted} inserted`);
    } catch (e) {
      console.error("Scheduled event scrape failed:", e.message);
    }
  },
};

// ============================================================
// EVENT SCRAPER - Runs on cron trigger
// ============================================================

const EVENTBRITE_URLS = [
  "https://www.eventbrite.com/d/online/paranormal-investigation/",
  "https://www.eventbrite.com/d/online/ghost-hunting/",
  "https://www.eventbrite.com/d/online/ghost-hunt/",
  "https://www.eventbrite.com/d/online/haunted-investigation/",
  "https://www.eventbrite.com/d/online/paranormal-conference/",
  "https://www.eventbrite.com/d/online/paranormal-expo/",
  "https://www.eventbrite.com/d/online/evp-spirit-box/",
  "https://www.eventbrite.com/d/online/evp-session/",
  "https://www.eventbrite.com/d/online/psychic-development/",
  "https://www.eventbrite.com/d/online/mediumship/",
  "https://www.eventbrite.com/d/online/psychic-fair/",
  "https://www.eventbrite.com/d/online/metaphysical/",
  "https://www.eventbrite.com/d/online/past-life-regression/",
  "https://www.eventbrite.com/d/online/reiki/",
  "https://www.eventbrite.com/d/online/ufo-conference/",
  "https://www.eventbrite.com/d/online/cryptid/",
  "https://www.eventbrite.com/d/online/bigfoot/",
  "https://www.eventbrite.com/d/online/witchcraft/",
  "https://www.eventbrite.com/d/online/tarot/",
  "https://www.eventbrite.com/d/online/astrology/",
  "https://www.eventbrite.com/d/online/ghost-tour/",
  "https://www.eventbrite.com/d/online/haunted-tour/",
  "https://www.eventbrite.com/d/united-states/paranormal-investigation/",
  "https://www.eventbrite.com/d/united-states/ghost-hunting/",
  "https://www.eventbrite.com/d/united-states/haunted-house-investigation/",
  "https://www.eventbrite.com/d/united-states/paranormal-conference/",
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
];

const EXCLUDE_KEYWORDS = [
  "coding", "programming", "software", "tech meetup", "startup",
  "yoga", "meditation class", "wellness retreat", "fitness",
  "cooking class", "dance class", "music concert", "art class",
  "book club", "networking event", "sports", "football", "basketball",
  "gaming tournament", "video game", "esports",
];

function isParanormalEvent(title, description = "") {
  const text = `${title} ${description}`.toLowerCase();
  for (const keyword of EXCLUDE_KEYWORDS) {
    if (text.includes(keyword)) return false;
  }
  for (const keyword of PARANORMAL_KEYWORDS) {
    if (text.includes(keyword)) return true;
  }
  return false;
}

async function scrapeAndUpdateEvents(env) {
  const events = [];
  
  for (const url of EVENTBRITE_URLS) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TPI-EventBot/1.0)",
          "Accept": "text/html",
        },
      });
      
      if (!response.ok) continue;
      const html = await response.text();
      
      // Extract events using regex
      const linkRegex = /class="event-card-link"[^>]*aria-label="View ([^"]*)"[^>]*data-event-location="([^"]*)"[^>]*href="([^"]*)"[^>]*data-event-id="([^"]*)"/g;
      let match;
      
      while ((match = linkRegex.exec(html)) !== null) {
        const [, titleRaw, location, eventUrl, eventId] = match;
        const title = titleRaw.replace(/^View\s+/, "").trim();
        
        if (!isParanormalEvent(title)) continue;
        
        // Parse location
        let city = "", state = "", isVirtual = false;
        if (location.toLowerCase() === "online") {
          isVirtual = true;
        } else {
          const parts = location.split(",");
          city = (parts[0] || "").trim();
          state = (parts[1] || "").trim();
        }
        
        // Extract date
        const dateRegex = new RegExp(`${escapeRegex(title.substring(0, 30))}[^<]*?(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+(\\d{1,2}),?\\s+(\\d{1,2}:\\d{2}\\s*(?:AM|PM)?)`, "i");
        const dateMatch = html.match(dateRegex);
        const dateText = dateMatch ? dateMatch[0].replace(title.substring(0, 30), "").trim() : "";
        
        // Extract image
        const imgRegex = new RegExp(`data-event-id="${eventId}"[^>]*>[^<]*<[^>]*src="([^"]*)"`, "i");
        const imgMatch = html.match(imgRegex);
        const imageUrl = imgMatch ? imgMatch[1] : "";
        
        events.push({
          externalId: `eb_${eventId}`,
          title: title.substring(0, 200),
          type: classifyType(title),
          category: classifyCategory(title),
          startDate: dateText,
          locationName: isVirtual ? "Online" : "",
          city,
          state,
          country: "United States",
          isVirtual: isVirtual ? 1 : 0,
          imageUrl,
          sourceUrl: eventUrl,
          source: "eventbrite",
        });
      }
    } catch (e) {
      console.error(`Error scraping ${url}:`, e.message);
    }
  }
  
  // Deduplicate
  const seen = new Set();
  const uniqueEvents = events.filter(e => {
    const key = e.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  // Update database
  let inserted = 0;
  if (uniqueEvents.length > 0) {
    // Delete old eventbrite events
    await env.TPI_DB.prepare("DELETE FROM events WHERE source = 'eventbrite'").run();
    
    for (const event of uniqueEvents) {
      try {
        await env.TPI_DB.prepare(`
          INSERT INTO events (external_id, title, type, category, start_date, date_display,
            location_name, city, state, country, is_virtual, image_url, source_url, source, status, scraped_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', datetime('now'))
        `).bind(
          event.externalId,
          event.title,
          event.type,
          event.category,
          event.startDate,
          event.startDate,
          event.locationName,
          event.city,
          event.state,
          event.country,
          event.isVirtual,
          event.imageUrl,
          event.sourceUrl,
          event.source
        ).run();
        inserted++;
      } catch (e) {
        // Skip duplicates
      }
    }
  }
  
  return { scraped: uniqueEvents.length, inserted };
}

function classifyType(title) {
  const t = title.toLowerCase();
  if (/investigation|ghost hunt|hunt|explore/.test(t)) return "investigation";
  if (/conference|con|symposium|summit|expo/.test(t)) return "conference";
  if (/meetup|meet-up|group/.test(t)) return "meetup";
  if (/workshop|class|training|learn/.test(t)) return "workshop";
  if (/live|stream|broadcast/.test(t)) return "livestream";
  if (/lecture|talk|presentation|speaker/.test(t)) return "lecture";
  if (/festival|fair|convention/.test(t)) return "festival";
  if (/tour|walk|walking/.test(t)) return "tour";
  if (/seance|evp|spirit box/.test(t)) return "investigation";
  return "other";
}

function classifyCategory(text) {
  const t = text.toLowerCase();
  if (/ghost|haunt|spirit|apparition|poltergeist/.test(t)) return "ghosts";
  if (/ufo|uap|alien|extraterrestrial/.test(t)) return "ufo";
  if (/cryptid|bigfoot|sasquatch|mothman/.test(t)) return "cryptid";
  if (/evp|itc|electronic voice|spirit box/.test(t)) return "evp";
  if (/psychic|medium|clairvoyant|telepathy|reiki/.test(t)) return "metaphysical";
  if (/history|historic|ancient/.test(t)) return "history";
  if (/witch|witchcraft|occult|divination/.test(t)) return "occult";
  if (/demon|exorcism|possession/.test(t)) return "demonic";
  return "paranormal";
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
