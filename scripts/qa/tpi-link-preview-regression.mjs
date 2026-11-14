import assert from "node:assert/strict";
import { fetchExternalLinkPreview, isSafePreviewUrl, parsePreviewHtml, youtubeVideoId } from "../../lib/link-preview.js";

const checks = [];
function check(name, fn) {
  fn();
  checks.push(name);
}

check("accepts ordinary HTTPS URLs", () => {
  assert.equal(isSafePreviewUrl("https://example.com/research?id=9").ok, true);
});
check("accepts HTTP URLs for preserved community links", () => {
  assert.equal(isSafePreviewUrl("http://example.com/article").ok, true);
});
check("blocks loopback", () => {
  assert.equal(isSafePreviewUrl("http://127.0.0.1:8788/").ok, false);
});
check("blocks private IPv4 ranges", () => {
  assert.equal(isSafePreviewUrl("http://192.168.1.10/").ok, false);
  assert.equal(isSafePreviewUrl("http://10.0.0.8/").ok, false);
});
check("blocks cloud metadata and local hostnames", () => {
  assert.equal(isSafePreviewUrl("http://169.254.169.254/latest/meta-data/").ok, false);
  assert.equal(isSafePreviewUrl("http://service.internal/secret").ok, false);
});
check("blocks credentials and custom ports", () => {
  assert.equal(isSafePreviewUrl("https://user:pass@example.com/").ok, false);
  assert.equal(isSafePreviewUrl("https://example.com:8080/").ok, false);
});
check("extracts bounded Open Graph metadata", () => {
  const result = parsePreviewHtml(`<!doctype html><title>Fallback</title><meta property="og:title" content="&quot;Research&quot;"><meta property="og:description" content="A useful &amp; safe description"><meta property="og:image" content="/cover.jpg">`, "https://example.com/story");
  assert.equal(result.title, '"Research"');
  assert.equal(result.description, "A useful & safe description");
  assert.equal(result.image, "https://example.com/cover.jpg");
});

check("recognizes supported YouTube URL forms", () => {
  assert.equal(youtubeVideoId("https://youtu.be/qB3dMpROEdE"), "qB3dMpROEdE");
  assert.equal(youtubeVideoId("https://www.youtube.com/watch?v=qB3dMpROEdE"), "qB3dMpROEdE");
  assert.equal(youtubeVideoId("https://youtube.com/shorts/qB3dMpROEdE"), "qB3dMpROEdE");
  assert.equal(youtubeVideoId("https://youtube.com/live/qB3dMpROEdE"), "qB3dMpROEdE");
});

check("rejects lookalike and malformed YouTube URLs", () => {
  assert.equal(youtubeVideoId("https://youtube.example/watch?v=qB3dMpROEdE"), "");
  assert.equal(youtubeVideoId("https://youtube.com/watch?v=too-short"), "");
  assert.equal(youtubeVideoId("http://youtu.be/qB3dMpROEdE"), "");
});

const youtubePreview = await fetchExternalLinkPreview("https://youtu.be/qB3dMpROEdE", {
  fetcher: async url => {
    assert.match(String(url), /^https:\/\/www\.youtube\.com\/oembed\?/);
    return new Response(JSON.stringify({
      title: "ShadowNode SLS",
      author_name: "Dover Para-Tech",
      thumbnail_url: "https://i.ytimg.com/vi/qB3dMpROEdE/hqdefault.jpg"
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
});
check("uses YouTube oEmbed metadata and a privacy-enhanced player", () => {
  assert.equal(youtubePreview.ok, true);
  assert.equal(youtubePreview.preview.title, "ShadowNode SLS");
  assert.equal(youtubePreview.preview.description, "Video by Dover Para-Tech");
  assert.equal(youtubePreview.preview.provider, "youtube");
  assert.equal(youtubePreview.preview.videoId, "qB3dMpROEdE");
  assert.equal(youtubePreview.preview.embedUrl, "https://www.youtube-nocookie.com/embed/qB3dMpROEdE");
});

const youtubeFallback = await fetchExternalLinkPreview("https://youtu.be/nXyaLOYIZso", {
  fetcher: async () => new Response("limited", { status: 429 })
});
check("keeps a playable YouTube preview when metadata is rate limited", () => {
  assert.equal(youtubeFallback.ok, true);
  assert.equal(youtubeFallback.preview.title, "YouTube video");
  assert.equal(youtubeFallback.preview.videoId, "nXyaLOYIZso");
  assert.equal(youtubeFallback.preview.image, "https://i.ytimg.com/vi/nXyaLOYIZso/hqdefault.jpg");
});

const localYoutube = await fetchExternalLinkPreview("https://youtu.be/qB3dMpROEdE", {
  env: { TPI_ENV: "local", TPI_LOCAL_ONLY: "1" },
  fetcher: async () => { throw new Error("local YouTube previews must not make external requests"); }
});
check("renders deterministic YouTube previews in isolated local development", () => {
  assert.equal(localYoutube.ok, true);
  assert.equal(localYoutube.preview.videoId, "qB3dMpROEdE");
});

console.log(`TPI link-preview regression: ${checks.length} passed`);
