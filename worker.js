import { onRequest as handleApiRequest } from "./functions/api/[[path]].js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

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

    return new Response("Not found", { status: 404 });
  }
};
