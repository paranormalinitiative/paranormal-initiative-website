import { createHash } from "node:crypto";

const STUDIO_ASSET_URL = /(["'])(\/studio\/assets\/[^"'?]+\.(?:js|css))(?:\?[^"']*)?\1/g;

export function contentVersion(content) {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

export function versionStudioAssetReferences(html, contentsByUrl) {
  return html.replace(STUDIO_ASSET_URL, (match, quote, url) => {
    const content = contentsByUrl.get(url);
    if (content === undefined) return match;
    return `${quote}${url}?v=${contentVersion(content)}${quote}`;
  });
}

export function studioAssetUrls(html) {
  const urls = [];
  for (const match of html.matchAll(STUDIO_ASSET_URL)) urls.push(match[2]);
  return urls;
}
