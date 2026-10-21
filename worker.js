import { onRequest as handleApiRequest } from "./functions/api/[[path]].js";
import { getSessionUser, hasCreatorStudioAccess } from "./lib/auth.js";
import { scrapeAndUpdateEvents } from "./lib/event-scraper.js";
import { scrapeNews } from "./lib/news-scraper.js";
import { scrapeVideos } from "./lib/video-scraper.js";
import { pruneScraperRuns } from "./lib/scraper-log.js";

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

const STUDIO_COMING_SOON_HTML = MEMBER_GATE_HTML
  .replaceAll("ITC Visual Studio — Member Access", "Creator Studio — Coming Soon")
  .replace(
    "<h1>Creator Studio — Coming Soon</h1>",
    '<p class="coming-soon-pill">COMING SOON</p><h1>Creator Studio</h1>'
  )
  .replace(
    "ITC Visual Studio is available to registered members of The Paranormal Initiative. Sign in to continue, or create a free member account to access the application.",
    "Creator Studio is in final development and is not publicly available yet. Authorized owner and test access remains protected."
  );

const STUDIO_ACCESS_HTML = STUDIO_COMING_SOON_HTML
  .replace("Creator Studio — Coming Soon", "Creator Studio — Restricted Access")
  .replace("<p class=\"coming-soon-pill\">COMING SOON</p>", "")
  .replace(
    "Creator Studio is in final development and is not publicly available yet. Authorized owner and test access remains protected.",
    "Creator Studio is restricted to the owner, administrators, and accounts with an active Creator Studio entitlement."
  );

const ADMIN_GATE_HTML = MEMBER_GATE_HTML
  .replaceAll("ITC Visual Studio — Member Access", "Administration Center — Restricted Access")
  .replace(
    "<h1>Administration Center — Restricted Access</h1>",
    "<h1>Administration Center</h1>"
  )
  .replace(
    "ITC Visual Studio is available to registered members of The Paranormal Initiative. Sign in to continue, or create a free member account to access the application.",
    "The TPI Administration Center is restricted to authorized owner and administrator accounts. Sign in with an approved account to continue."
  );

const CONTRIBUTOR_GATE_HTML = MEMBER_GATE_HTML
  .replaceAll("ITC Visual Studio — Member Access", "Contributor Tools — Restricted Access")
  .replace(
    "<h1>Contributor Tools — Restricted Access</h1>",
    "<h1>Contributor Tools</h1>"
  )
  .replace(
    "ITC Visual Studio is available to registered members of The Paranormal Initiative. Sign in to continue, or create a free member account to access the application.",
    "Content Editor and creator management tools are restricted to approved contributors, administrators, and the owner. Sign in with an approved account to continue."
  );

const DEVELOPMENT_BANNER = `<div data-tpi-development-environment style="position:fixed;z-index:2147483647;top:0;left:0;right:0;padding:7px 12px;background:#5b2a86;color:#fff;font:700 12px/1.2 system-ui,sans-serif;letter-spacing:.08em;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.35)">DEVELOPMENT ENVIRONMENT</div>`;

// Browser-side fail-closed protection for the local Worker. This covers the
// request APIs available to page JavaScript; it does not pretend to govern
// passive HTML media/font loads or a separately running browser extension.
const LOCAL_REQUEST_GUARD = `<script data-tpi-local-request-guard>(function(){
  if (window.__TPI_LOCAL_REQUEST_GUARD__) return;
  window.__TPI_LOCAL_REQUEST_GUARD__ = true;
  var allowed = new Set([location.origin, "http://127.0.0.1:8788", "http://localhost:8788"]);
  var blocked = new Set(["https://paranormalinitiative.com", "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev"]);
  function target(value) { try { return new URL(String(value), location.href); } catch (_) { return null; } }
  function assert(value) {
    var url = target(value);
    if (!url || blocked.has(url.origin) || !allowed.has(url.origin)) {
      var origin = url ? url.origin : "invalid target";
      console.warn("TPI local request blocked", origin);
      throw new Error("TPI local development blocked an external request");
    }
    return url;
  }
  var nativeFetch = window.fetch.bind(window);
  window.fetch = function(input, init) { assert(typeof input === "string" ? input : input && input.url); return nativeFetch(input, init); };
  var nativeOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) { assert(url); return nativeOpen.apply(this, arguments); };
  var NativeWebSocket = window.WebSocket;
  window.WebSocket = function(url, protocols) { assert(url); return protocols === undefined ? new NativeWebSocket(url) : new NativeWebSocket(url, protocols); };
  window.WebSocket.prototype = NativeWebSocket.prototype;
  var NativeEventSource = window.EventSource;
  window.EventSource = function(url, config) { assert(url); return new NativeEventSource(url, config); };
  window.EventSource.prototype = NativeEventSource.prototype;
  if (navigator.sendBeacon) {
    var nativeBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function(url, data) { assert(url); return nativeBeacon(url, data); };
  }
})();</script>`;

// Keep the first paint on the same dark surface as the TPI design system.
// This is deliberately limited to the browser's existing local theme choice;
// it does not inspect authentication state or expose account information.
const EARLY_THEME_BOOTSTRAP = `<style data-tpi-theme-bootstrap>
html,body{background:#1a221e;color:#f2f7f3}
html[data-theme="seance"],html[data-theme="seance"] body{background:#120c1f;color:#f9f6ee}
html[data-theme="cosmic"],html[data-theme="cosmic"] body{background:#0d0c28;color:#f0f2fa}
html[data-theme="asylum"],html[data-theme="asylum"] body{background:#1e1e1e;color:#ededed}
html[data-theme="fieldops"],html[data-theme="fieldops"] body{background:#0a0c10;color:#e8ecf4}
html[data-theme="gothicnight"],html[data-theme="gothicnight"] body{background:#0e0a1a;color:#f5f1fa}
</style><script data-tpi-theme-bootstrap>(function(){try{var t=localStorage.getItem("tpiSiteTheme");var ok=["cryptid","seance","cosmic","asylum","fieldops","gothicnight"].indexOf(t)!==-1;document.documentElement.setAttribute("data-theme",ok?t:"cryptid")}catch(e){document.documentElement.setAttribute("data-theme","cryptid")}})();</script>`;

async function serveAssets(request, env) {
  const response = await env.ASSETS.fetch(request);
  if (!response.ok) return response;
  const isDevelopmentAsset = env.TPI_ENV === "development" || env.TPI_ENV === "local";
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    if (!isDevelopmentAsset) return response;
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    headers.delete("etag");
    headers.delete("last-modified");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
  const html = await response.text();
  let body = html;
  if (!html.includes("data-tpi-theme-bootstrap")) {
    body = body.replace(/<head([^>]*)>/i, `<head$1>${EARLY_THEME_BOOTSTRAP}`);
  }
  if (env.TPI_ENV === "local" && !body.includes("data-tpi-local-request-guard")) {
    body = body.replace(/<head([^>]*)>/i, `<head$1>${LOCAL_REQUEST_GUARD}`);
  }
  if (env.TPI_ENV === "development" && !body.includes("data-tpi-development-environment")) {
    body = body.replace(/<body([^>]*)>/i, `<body$1>${DEVELOPMENT_BANNER}`);
  }
  // Reading an HTML response consumes its body. Return a fresh response when
  // no local wrapper was needed instead of handing the consumed response back
  // to the runtime. This matters for extensionless local HTML asset routes.
  if (body === html) {
    const headers = new Headers(response.headers);
    if (isDevelopmentAsset) {
      headers.set("Cache-Control", "no-store");
      headers.delete("etag");
      headers.delete("last-modified");
    }
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("etag");
  headers.delete("last-modified");
  if (isDevelopmentAsset) headers.set("Cache-Control", "no-store");
  return new Response(body, { status: response.status, statusText: response.statusText, headers });
}

// Wrangler's local asset handler does not consistently apply the hosted
// clean-URL fallback for extensionless HTML routes. Keep the browser-facing
// URLs stable by retrying only an existing, deterministic HTML counterpart
// after the original asset lookup returns 404. Authentication gates run before
// this helper for protected surfaces such as Creator Studio.
function cleanUrlAssetPath(pathname) {
  if (pathname === "/studio" || pathname === "/studio/") return "/studio/index.html";
  if (pathname.endsWith("/")) return `${pathname}index.html`;
  if (!pathname.endsWith(".html") && !pathname.includes(".")) return `${pathname}.html`;
  return null;
}

async function servePageAsset(request, env) {
  const response = await serveAssets(request, env);
  if (response.status !== 404) return response;

  const url = new URL(request.url);
  const fallbackPath = cleanUrlAssetPath(url.pathname);
  if (!fallbackPath || fallbackPath === url.pathname) return response;

  const fallbackUrl = new URL(request.url);
  fallbackUrl.pathname = fallbackPath;
  return serveAssets(new Request(fallbackUrl, request), env);
}

// The React Administration Center is the canonical implementation. Keep the
// historical preview asset directory as its static package namespace, but
// serve the same entry document and assets from the user-facing /admin-panel
// route so development and production cannot drift into separate frontends.
async function serveCanonicalAdminCenter(request, env) {
  const sourceUrl = new URL(request.url);
  const targetPath = sourceUrl.pathname === "/admin-panel" ||
    sourceUrl.pathname === "/admin-panel/" ||
    sourceUrl.pathname === "/admin-panel/index.html"
    ? "/admin-center-preview/"
    : sourceUrl.pathname.replace(/^\/admin-panel(?:\.html)?/, "/admin-center-preview");
  const targetUrl = new URL(targetPath + sourceUrl.search, sourceUrl.origin);
  return serveAssets(new Request(targetUrl, request), env);
}

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

    // Community Forum retirement (see FORUM_DEPENDENCY_AUDIT.md): the
    // dedicated Forum UI is retired; the Community Feed (member-home) is the
    // single community discussion system. Historical links and old
    // notification hrefs pointing here redirect to the Feed.
    if (url.pathname === "/community-forum.html" || url.pathname === "/community-forum" || url.pathname === "/community-forum/") {
      return Response.redirect(new URL("/member-home?member=1", url.origin).toString(), 302);
    }

    // The public root remains available to signed-out visitors, while the
    // authoritative server session determines the destination for members.
    // This prevents the homepage from briefly rendering public content before
    // client-side auth code can redirect an already signed-in member.
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const user = await getSessionUser(request, env);
      if (user) {
        return new Response(null, {
          status: 307,
          headers: {
            Location: new URL(`/member-home${url.search}`, url.origin).toString(),
            "Cache-Control": "private, no-store"
          }
        });
      }
      const publicHome = await servePageAsset(request, env);
      const publicHeaders = new Headers(publicHome.headers);
      publicHeaders.set("Cache-Control", "private, no-store");
      return new Response(publicHome.body, {
        status: publicHome.status,
        statusText: publicHome.statusText,
        headers: publicHeaders
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
      return serveAssets(request, env);
    }

    // Creator Studio is distinct from Administration Center. Leadership keeps
    // its existing access, while creators must have an active entitlement.
    // The check is server-side for the host route and every direct asset.
    if (url.pathname === "/studio" || url.pathname.startsWith("/studio/")) {
      const user = await getSessionUser(request, env);
      const hasStudioAccess = await hasCreatorStudioAccess(env, user);
      if (!hasStudioAccess) {
        return new Response(user ? STUDIO_ACCESS_HTML : STUDIO_COMING_SOON_HTML, {
          status: 403,
          headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
        });
      }
      return servePageAsset(request, env);
    }

    // TPI-ADMIN-005 isolated React preview. Gate the entry document and every
    // generated asset so an obscure URL is never treated as authorization.
    if (url.pathname === "/admin-center-preview" || url.pathname.startsWith("/admin-center-preview/")) {
      const user = await getSessionUser(request, env);
      const hasAdminAccess = user && (user.role === "owner" || user.role === "admin");
      if (!hasAdminAccess) {
        return new Response(ADMIN_GATE_HTML, {
          status: 403,
          headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
        });
      }
      return serveAssets(request, env);
    }

    // Canonical Administration Center entry point. The old HTML admin panel
    // remains a protected compatibility bookmark and redirects authenticated
    // administrators here; it is no longer a second implementation.
    const isCanonicalAdminCenter = url.pathname === "/admin-panel" ||
      url.pathname === "/admin-panel/" ||
      url.pathname === "/admin-panel/index.html" ||
      url.pathname === "/admin-panel.html" ||
      url.pathname.startsWith("/admin-panel/assets/");
    if (isCanonicalAdminCenter) {
      const user = await getSessionUser(request, env);
      const hasAdminAccess = user && (user.role === "owner" || user.role === "admin");
      if (!hasAdminAccess) {
        return new Response(ADMIN_GATE_HTML, {
          status: 403,
          headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
        });
      }
      if (url.pathname === "/admin-panel.html") {
        return Response.redirect(new URL(`/admin-panel${url.search}`, url.origin).toString(), 307);
      }
      return serveCanonicalAdminCenter(request, env);
    }

    // Administrative pages contain privileged operational controls. Keep the
    // existing API authorization intact and add the same server-side boundary
    // to the HTML entry points so ordinary members cannot load the admin UI
    // bundle by guessing a direct URL.
    const isAdminPage = [
      "/admin-panel.html",
      "/admin-panel",
      "/admin-panel/",
      "/admin-advanced-settings.html",
      "/admin-advanced-settings",
      "/admin-advanced-settings/",
      "/admin-events.html",
      "/admin-events",
      "/admin-events/",
      "/teams/admin.html",
      "/teams/admin",
      "/teams/admin/"
    ].includes(url.pathname);
    if (isAdminPage) {
      const user = await getSessionUser(request, env);
      const hasAdminAccess = user && (user.role === "owner" || user.role === "admin");
      if (!hasAdminAccess) {
        return new Response(ADMIN_GATE_HTML, {
          status: 403,
          headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
        });
      }
      return serveAssets(request, env);
    }

    // Contributor management pages contain authoring and creator controls.
    // Keep the entry documents server-gated so direct URLs cannot expose the
    // management surface to public visitors or ordinary members. API routes
    // remain independently protected by requireContributor and ownership
    // checks in functions/api/[[path]].js.
    const isContributorManagementPage = [
      "/paper-editor.html",
      "/paper-editor",
      "/paper-editor/",
      "/creator-videos.html",
      "/creator-videos",
      "/creator-videos/"
    ].includes(url.pathname);
    if (isContributorManagementPage) {
      const user = await getSessionUser(request, env);
      const hasContributorAccess = user && ["owner", "admin", "contributor"].includes(user.role);
      if (!hasContributorAccess) {
        return new Response(CONTRIBUTOR_GATE_HTML, {
          status: 403,
          headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
        });
      }
      return serveAssets(request, env);
    }

    // Default: serve normal website static assets
    return servePageAsset(request, env);
  },

  // Cron trigger: every 6 hours (see wrangler.toml crons). Events refresh
  // each run; ParaNews accumulates and prunes on each run.
  async scheduled(event, env, ctx) {
    console.log("Running scheduled scrapes...");
    try {
      const result = await scrapeAndUpdateEvents(env, { trigger: "cron" });
      console.log(`Events updated: ${result.scraped} scraped, ${result.inserted} inserted`);
    } catch (e) {
      console.error("Scheduled event scrape failed:", e.message);
    }
    try {
      const news = await scrapeNews(env, { trigger: "cron" });
      console.log(`News updated: ${news.collected} collected, ${news.inserted} inserted, feeds ${news.feedsOk}/${news.feedsTotal} (this run: ${news.feedsActive})`);
    } catch (e) {
      console.error("Scheduled news scrape failed:", e.message);
    }
    try {
      const videos = await scrapeVideos(env, { trigger: "cron" });
      console.log(`Videos updated: ${videos.collected} collected, ${videos.inserted} inserted`);
    } catch (e) {
      console.error("Scheduled video scrape failed:", e.message);
    }
    // Keep scraper run history bounded (scraper_runs only — never content).
    await pruneScraperRuns(env);
  },
};

// Event scraping lives in lib/event-scraper.js, shared with the
// /api/events/refresh endpoint so cron and manual refresh stay identical.

