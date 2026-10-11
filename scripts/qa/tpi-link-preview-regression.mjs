import assert from "node:assert/strict";
import { isSafePreviewUrl, parsePreviewHtml } from "../../lib/link-preview.js";

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

console.log(`TPI link-preview regression: ${checks.length} passed`);
