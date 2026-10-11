const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata",
  "instance-data.ec2.internal",
  "100.100.100.200",
  "169.254.169.254"
]);

function isPrivateIpv4(hostname) {
  const parts = String(hostname || "").split(".").map(Number);
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) || a === 192 && b === 168 ||
    (a === 172 && b >= 16 && b <= 31) || (a === 198 && (b === 18 || b === 19));
}

function isPrivateIpv6(hostname) {
  const host = String(hostname || "").toLowerCase().replace(/^\[|\]$/g, "");
  const mappedIpv4 = host.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return host === "::1" || host === "0:0:0:0:0:0:0:1" || host === "::" ||
    host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd") ||
    Boolean(mappedIpv4 && isPrivateIpv4(mappedIpv4[1]));
}

export function isSafePreviewUrl(value) {
  let url;
  try { url = new URL(String(value || "")); } catch { return { ok: false, error: "The link is not a valid URL." }; }
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!/^https?:$/.test(url.protocol)) return { ok: false, error: "Only HTTP and HTTPS links can be previewed." };
  if (!hostname || BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost") || hostname.endsWith(".internal") || hostname.endsWith(".local")) {
    return { ok: false, error: "Private and local network links cannot be previewed." };
  }
  if (isPrivateIpv4(hostname) || isPrivateIpv6(hostname)) return { ok: false, error: "Private and local network links cannot be previewed." };
  if (url.username || url.password) return { ok: false, error: "Credential-bearing links cannot be previewed." };
  if (url.port && url.port !== "80" && url.port !== "443") return { ok: false, error: "Links on custom ports cannot be previewed." };
  return { ok: true, url };
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) => {
      const parsed = /^x/i.test(code) ? parseInt(code.slice(1), 16) : parseInt(code, 10);
      return Number.isFinite(parsed) ? String.fromCodePoint(Math.min(parsed, 0x10ffff)) : "";
    })
    .replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
}

function cleanText(value, limit = 500) {
  return decodeHtml(String(value || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()).slice(0, limit);
}

function firstMeta(html, names) {
  const wanted = names.map(name => name.toLowerCase());
  const pattern = /<meta\b[^>]*>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const tag = match[0];
    const name = (tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i) || [])[1];
    if (!name || !wanted.includes(name.toLowerCase())) continue;
    return (tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i) || [])[1] || "";
  }
  return "";
}

export function parsePreviewHtml(html, sourceUrl) {
  const safe = isSafePreviewUrl(sourceUrl);
  if (!safe.ok) return null;
  const title = cleanText(firstMeta(html, ["og:title", "twitter:title"]) || ((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ""), 180);
  const description = cleanText(firstMeta(html, ["og:description", "twitter:description", "description"]), 320);
  const rawImage = firstMeta(html, ["og:image", "twitter:image"]);
  let imageCandidate = "";
  try { imageCandidate = rawImage ? new URL(rawImage, safe.url).toString() : ""; } catch {}
  const image = isSafePreviewUrl(imageCandidate).ok ? imageCandidate : "";
  return {
    url: safe.url.toString(),
    title: title || safe.url.hostname,
    description,
    image,
    host: safe.url.hostname,
    fetched: Boolean(title || description || image)
  };
}

async function readBoundedText(response, maxBytes) {
  if (!response.body || !response.body.getReader) return (await response.text()).slice(0, maxBytes);
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  while (total < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = value || new Uint8Array();
    const remaining = maxBytes - total;
    const clipped = chunk.byteLength > remaining ? chunk.slice(0, remaining) : chunk;
    chunks.push(clipped);
    total += clipped.byteLength;
    if (clipped.byteLength < chunk.byteLength) break;
  }
  try { await reader.cancel(); } catch {}
  const bytes = new Uint8Array(total);
  let offset = 0;
  chunks.forEach(chunk => { bytes.set(chunk, offset); offset += chunk.byteLength; });
  return new TextDecoder().decode(bytes);
}

export async function fetchExternalLinkPreview(value, options = {}) {
  const initial = isSafePreviewUrl(value);
  if (!initial.ok) return { ok: false, status: 400, error: initial.error };
  const maxRedirects = Number.isInteger(options.maxRedirects) ? options.maxRedirects : 3;
  const timeoutMs = Number.isInteger(options.timeoutMs) ? options.timeoutMs : 3500;
  const maxBytes = Number.isInteger(options.maxBytes) ? options.maxBytes : 512 * 1024;
  let current = initial.url;
  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetch(current.toString(), {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1", "User-Agent": "TPI-Link-Preview/1.0" }
      });
    } catch (error) {
      clearTimeout(timer);
      return { ok: false, status: 502, error: error?.name === "AbortError" ? "The preview request timed out." : "The linked page could not be reached." };
    }
    clearTimeout(timer);
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (redirectCount >= maxRedirects) return { ok: false, status: 502, error: "The linked page redirected too many times." };
      const location = response.headers.get("Location");
      let nextValue = "";
      try { nextValue = location ? new URL(location, current).toString() : ""; } catch {}
      const next = isSafePreviewUrl(nextValue);
      if (!next.ok) return { ok: false, status: 400, error: next.error };
      current = next.url;
      continue;
    }
    if (!response.ok) return { ok: false, status: response.status, error: "The linked page did not return a previewable response." };
    const contentType = String(response.headers.get("Content-Type") || "").toLowerCase();
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      return { ok: true, preview: { url: current.toString(), title: current.hostname, description: "", image: "", host: current.hostname, fetched: false } };
    }
    const html = await readBoundedText(response, maxBytes);
    return { ok: true, preview: parsePreviewHtml(html, current.toString()) };
  }
  return { ok: false, status: 502, error: "The linked page could not be previewed." };
}
