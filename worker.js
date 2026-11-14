import { onRequest as handleApiRequest } from "./functions/api/[[path]].js";
import { getSessionUser, hasCreatorStudioAccess } from "./lib/auth.js";
import { CAPABILITY, memberHasCapability } from "./lib/membership-entitlements.js";
import { scrapeAndUpdateEvents } from "./lib/event-scraper.js";
import { scrapeNews } from "./lib/news-scraper.js";
import { scrapeVideos } from "./lib/video-scraper.js";
import { pruneScraperRuns } from "./lib/scraper-log.js";

// Reuse the saved site theme on server-generated access pages as well as static
// HTML assets. This runs before the gate's inline styles for a consistent first
// paint and reads no authentication or account data.
const EARLY_THEME_BOOTSTRAP = `<style data-tpi-theme-bootstrap>
html,body{background:#1a221e;color:#f2f7f3}
html[data-theme="seance"],html[data-theme="seance"] body{background:#120c1f;color:#f9f6ee}
html[data-theme="cosmic"],html[data-theme="cosmic"] body{background:#0d0c28;color:#f0f2fa}
html[data-theme="asylum"],html[data-theme="asylum"] body{background:#1e1e1e;color:#ededed}
html[data-theme="fieldops"],html[data-theme="fieldops"] body{background:#0a0c10;color:#e8ecf4}
html[data-theme="gothicnight"],html[data-theme="gothicnight"] body{background:#0e0a1a;color:#f5f1fa}
</style><script data-tpi-theme-bootstrap>(function(){try{var t=localStorage.getItem("tpiSiteTheme");var ok=["cryptid","seance","cosmic","asylum","fieldops","gothicnight"].indexOf(t)!==-1;document.documentElement.setAttribute("data-theme",ok?t:"cryptid")}catch(e){document.documentElement.setAttribute("data-theme","cryptid")}})();</script>`;

const MEMBER_GATE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  ${EARLY_THEME_BOOTSTRAP}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>ITC Visual Studio — Member Access | The Paranormal Initiative</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root { --gate-bg:#0a0c10; --gate-card:#12151c; --gate-border:#1e2230; --gate-accent:#59a9dc; --gate-accent-hover:#6db8e8; --gate-text:#c8cdd8; --gate-heading:#e8ecf4; --gate-muted:#8d93a3; --gate-button:#1e2230; --gate-button-border:#2a2f3e; --gate-button-hover:#252a3a; --gate-on-accent:#081018; }
    html[data-theme="cryptid"] { --gate-bg:#1a221e; --gate-card:#2a3430; --gate-border:#34403a; --gate-accent:#2f9e44; --gate-accent-hover:#4bb263; --gate-text:#cfd6d3; --gate-heading:#f2f7f3; --gate-muted:#9ba8a0; --gate-button:#1f2824; --gate-button-border:#34403a; --gate-button-hover:#323d38; --gate-on-accent:#0b140b; }
    html[data-theme="seance"] { --gate-bg:#120c1f; --gate-card:#1e162d; --gate-border:#332a47; --gate-accent:#8f152a; --gate-accent-hover:#b01e37; --gate-text:#b9b3a9; --gate-heading:#f9f6ee; --gate-muted:#8a857c; --gate-button:#171126; --gate-button-border:#332a47; --gate-button-hover:#251b37; --gate-on-accent:#f9f6ee; }
    html[data-theme="cosmic"] { --gate-bg:#0d0c28; --gate-card:#161537; --gate-border:#2b2a58; --gate-accent:#14b8d4; --gate-accent-hover:#3fcfe6; --gate-text:#b8bbd0; --gate-heading:#f0f2fa; --gate-muted:#8a8da8; --gate-button:#12112e; --gate-button-border:#2b2a58; --gate-button-hover:#1d1c44; --gate-on-accent:#04141a; }
    html[data-theme="asylum"] { --gate-bg:#1e1e1e; --gate-card:#2d2d2d; --gate-border:#454545; --gate-accent:#e08600; --gate-accent-hover:#f39c1a; --gate-text:#e5e0d8; --gate-heading:#f2eee6; --gate-muted:#a39e94; --gate-button:#242424; --gate-button-border:#454545; --gate-button-hover:#353535; --gate-on-accent:#1c1200; }
    html[data-theme="fieldops"] { --gate-bg:#0a0c10; --gate-card:#12151c; --gate-border:#1e2230; --gate-accent:#59a9dc; --gate-accent-hover:#6db8e8; --gate-text:#c8cdd8; --gate-heading:#e8ecf4; --gate-muted:#8d93a3; --gate-button:#1e2230; --gate-button-border:#2a2f3e; --gate-button-hover:#252a3a; --gate-on-accent:#081018; }
    html[data-theme="gothicnight"] { --gate-bg:#0e0a1a; --gate-card:#1a1228; --gate-border:#322449; --gate-accent:#c084fc; --gate-accent-hover:#d0a4fd; --gate-text:#cfc4dd; --gate-heading:#f5f1fa; --gate-muted:#9c8fb0; --gate-button:#140d24; --gate-button-border:#322449; --gate-button-hover:#211736; --gate-on-accent:#1a0b2e; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: var(--gate-bg); color: var(--gate-text); min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
    .gate-card { max-width: 520px; width: 100%; background: var(--gate-card); border: 1px solid var(--gate-border); border-radius: 12px; padding: 2.5rem; text-align: center; }
    .gate-kicker { text-transform: uppercase; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; color: var(--gate-accent); margin-bottom: 0.75rem; }
    h1 { font-size: 1.5rem; font-weight: 700; color: var(--gate-heading); margin-bottom: 1rem; }
    .gate-message { font-size: 0.95rem; line-height: 1.6; color: var(--gate-muted); margin-bottom: 2rem; }
    .gate-actions { display: flex; flex-direction: column; gap: 0.75rem; }
    .gate-button { display: block; width: 100%; padding: 0.85rem 1.5rem; border-radius: 8px; font-size: 0.95rem; font-weight: 600; text-decoration: none; text-align: center; cursor: pointer; border: none; transition: background 0.2s, transform 0.1s; }
    .gate-button:hover { transform: translateY(-1px); }
    .gate-button:active { transform: translateY(0); }
    .gate-button-primary { background: var(--gate-accent); color: var(--gate-on-accent); }
    .gate-button-primary:hover { background: var(--gate-accent-hover); }
    .gate-button-secondary { background: var(--gate-button); color: var(--gate-text); border: 1px solid var(--gate-button-border); }
    .gate-button-secondary:hover { background: var(--gate-button-hover); }
    .gate-button-tertiary { background: transparent; color: var(--gate-accent); font-weight: 400; font-size: 0.85rem; }
    .gate-button-tertiary:hover { color: var(--gate-accent-hover); }
    .gate-divider { width: 40px; height: 1px; background: var(--gate-border); margin: 0.5rem auto; }
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

// Nova Edit shares the temporary Creator Studio access check until Nova has
// its own Contributor-facing entitlement policy. The gate page is Nova-branded
// so the boundary never looks like a StudioFlow failure.
const NOVA_ACCESS_HTML = STUDIO_ACCESS_HTML
  .replaceAll("Creator Studio — Restricted Access", "Nova — Restricted Access")
  .replace("<h1>Creator Studio</h1>", "<h1>Nova Edit</h1>")
  .replace(
    "Creator Studio is restricted to the owner, administrators, and accounts with an active Creator Studio entitlement.",
    "Nova Edit is in active development and is available to the owner, administrators, and accounts with an active Creator Studio entitlement. Contributor-facing Nova access arrives in a later release."
  )
  .replaceAll("#59a9dc", "#4bb263")
  .replaceAll("#6db8e8", "#8ce8b6");

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

const INTERNAL_HELP_GATE_HTML = ADMIN_GATE_HTML
  .replaceAll("Administration Center — Restricted Access", "Internal Help Center — Restricted Access")
  .replace("<h1>Administration Center</h1>", "<h1>Internal Help Center</h1>")
  .replace(
    "The TPI Administration Center is restricted to authorized owner and administrator accounts. Sign in with an approved account to continue.",
    "The TPI Internal Help Center is restricted to authorized staff accounts. Sign in with an active staff appointment or another approved internal access path to continue."
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

async function serveAssets(request, env) {
  const response = await env.ASSETS.fetch(request);
  if (!response.ok) return response;
  const isDevelopmentAsset = env.TPI_ENV === "development" || env.TPI_ENV === "local";
  const assetPath = new URL(request.url).pathname;
  const isStudioEntryDocument = assetPath === "/studio" || assetPath === "/studio/" || assetPath === "/studio/index.html";
  const isMemberLoginDocument = assetPath === "/member-login" || assetPath === "/member-login/" || assetPath === "/member-login.html";
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
    if (isDevelopmentAsset || isStudioEntryDocument || isMemberLoginDocument) {
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
  if (isDevelopmentAsset || isStudioEntryDocument || isMemberLoginDocument) {
    headers.set("Cache-Control", "no-store");
    headers.delete("etag");
    headers.delete("last-modified");
  }
  return new Response(body, { status: response.status, statusText: response.statusText, headers });
}

// Wrangler's local asset handler does not consistently apply the hosted
// clean-URL fallback for extensionless HTML routes. Keep the browser-facing
// URLs stable by retrying only an existing, deterministic HTML counterpart
// after the original asset lookup returns 404. Authentication gates run before
// this helper for protected surfaces such as Creator Studio.
function cleanUrlAssetPath(pathname) {
  if (pathname === "/studio" || pathname === "/studio/") return "/studio/index.html";
  if (pathname === "/nova" || pathname === "/nova/") return "/nova/index.html";
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
// TPI-NOVA-004R6D: an Editorial Reviewer who is not an owner or admin still
// needs the Administration Center shell to reach the Editorial Review Queue.
// The UI shows that reviewer only the review section, and every review API
// route independently re-checks EDITORIAL_REVIEW. The admin role is never
// treated as editorial authority by this helper; it is only a separate reason
// the existing shell stays available. Databases without the entitlement tables
// default to deny.
// TPI-NOVA-004R6E: EDITORIAL_PUBLISH is a separate capability, so a Publisher
// who holds no review authority still needs the same shell to reach the
// publication surface. Each editorial API route re-checks its own capability.
async function hasAdministrationCenterAccess(env, user) {
  if (!user) return false;
  try {
    const staff = await env.TPI_DB.prepare("SELECT role_code FROM staff_role_appointments WHERE contributor_id = ? AND status = 'active' LIMIT 1").bind(user.id).first();
    if (staff?.role_code) return ["executive", "full_administrator", "administrator"].includes(staff.role_code);
    if (user.role === "owner" || user.role === "admin") return true;
    if (await memberHasCapability(env, user, CAPABILITY.EDITORIAL_REVIEW)) return true;
    return await memberHasCapability(env, user, CAPABILITY.EDITORIAL_PUBLISH);
  } catch (error) {
    return false;
  }
}

// The Internal Help Center is broader than the Administration Center: a
// moderator needs the operational procedures even when the moderator cannot
// open every admin dashboard section. The content remains server-gated for an
// active staff appointment, and role-specific action APIs remain authoritative.
async function hasInternalHelpCenterAccess(env, user) {
  if (!user) return false;
  if (user.role === "owner" || user.role === "admin") return true;
  try {
    const staff = await env.TPI_DB.prepare("SELECT role_code FROM staff_role_appointments WHERE contributor_id = ? AND status = 'active' LIMIT 1").bind(user.id).first();
    return ["executive", "full_administrator", "administrator", "moderator"].includes(staff?.role_code);
  } catch (error) {
    return false;
  }
}

async function serveCanonicalAdminCenter(request, env) {
  const sourceUrl = new URL(request.url);
  const targetPath = sourceUrl.pathname === "/admin-panel" ||
    sourceUrl.pathname === "/admin-panel/" ||
    sourceUrl.pathname === "/admin-panel/index.html"
    ? "/admin-center-preview/index.html"
    : sourceUrl.pathname.replace(/^\/admin-panel(?:\.html)?/, "/admin-center-preview");
  const targetUrl = new URL(targetPath + sourceUrl.search, sourceUrl.origin);
  return serveAssets(new Request(targetUrl, request), env);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (["/moderation", "/moderation/", "/moderation.html"].includes(url.pathname)) {
      const user = await getSessionUser(request, env);
      let allowed = false;
      if (user && !allowed) {
        try {
          const appointment = await env.TPI_DB.prepare("SELECT role_code FROM staff_role_appointments WHERE contributor_id = ? AND status = 'active' LIMIT 1").bind(user.id).first();
          allowed = appointment?.role_code
            ? ["executive", "full_administrator", "administrator", "moderator"].includes(appointment.role_code)
            : ["owner", "admin"].includes(user.role);
        } catch (error) { allowed = false; }
      }
      if (!allowed) return new Response(ADMIN_GATE_HTML, { status: 403, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
      return serveAssets(new Request(new URL("/moderation.html", url.origin), request), env);
    }

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

    // The clean member-profile route is the signed-in member's home profile:
    // identity, recognitions, and that member's own community feed. The old
    // .html bookmark remains the profile editor until the dedicated edit
    // surface is opened from Settings.
    if (url.pathname === "/member-profile" || url.pathname === "/member-profile/") {
      const profileUrl = new URL(request.url);
      profileUrl.pathname = "/member-home.html";
      return serveAssets(new Request(profileUrl, request), env);
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

    // Nova Edit is a separate application from StudioFlow and is built into
    // the committed /nova/ asset directory. It uses the same temporary access
    // check as Creator Studio (recorded architecture debt); the gate applies to
    // the entry document and to every direct asset request.
    if (url.pathname === "/nova" || url.pathname.startsWith("/nova/")) {
      const user = await getSessionUser(request, env);
      const hasNovaAccess = await hasCreatorStudioAccess(env, user);
      if (!hasNovaAccess) {
        return new Response(NOVA_ACCESS_HTML, {
          status: 403,
          headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
        });
      }
      return servePageAsset(request, env);
    }

    // Internal Help Center content is static, but the entire namespace is
    // protected here so direct HTML, clean URLs, and asset requests cannot
    // expose staff procedures to public visitors or ordinary members.
    if (url.pathname === "/internal-help-center" || url.pathname.startsWith("/internal-help-center/") || url.pathname.startsWith("/internal-help-center-") || url.pathname.startsWith("/internal-help-center.")) {
      const user = await getSessionUser(request, env);
      if (!await hasInternalHelpCenterAccess(env, user)) {
        return new Response(INTERNAL_HELP_GATE_HTML, {
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
      const hasAdminAccess = await hasAdministrationCenterAccess(env, user);
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
      const hasAdminAccess = await hasAdministrationCenterAccess(env, user);
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
      const hasAdminAccess = await hasAdministrationCenterAccess(env, user);
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
      return servePageAsset(request, env);
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

