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

    // StudioFlow uses a public, unguessable guest invitation route while keeping
    // the host workspace behind the existing TPI member session.
    if (url.pathname.startsWith("/studio/assets/")) {
      return env.ASSETS.fetch(request);
    }

    if (url.pathname.startsWith("/studio/guest/")) {
      const appUrl = new URL("/studio/index.html", url.origin);
      return env.ASSETS.fetch(new Request(appUrl, request));
    }

    if (url.pathname === "/studio" || url.pathname.startsWith("/studio/")) {
      const user = await getSessionUser(request, env);
      if (!user) {
        return new Response(MEMBER_GATE_HTML.replaceAll("ITC Visual Studio", "StudioFlow"), {
          status: 403,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      }
      return env.ASSETS.fetch(request);
    }

    // Default: serve normal website static assets
    return env.ASSETS.fetch(request);
  }
};
