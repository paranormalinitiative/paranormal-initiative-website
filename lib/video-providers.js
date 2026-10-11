// Centralized validation for creator-authored external video references.
// Scraped provider URLs remain source-owned data and are not rewritten here.

const PROVIDERS = [
  { key: "youtube", label: "YouTube", hosts: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"], embedHosts: ["youtube.com", "www.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"] },
  { key: "rumble", label: "Rumble", hosts: ["rumble.com", "www.rumble.com"], embedHosts: ["rumble.com", "www.rumble.com"] },
  { key: "odysee", label: "Odysee", hosts: ["odysee.com", "www.odysee.com"], embedHosts: [] },
  { key: "dailymotion", label: "Dailymotion", hosts: ["dailymotion.com", "www.dailymotion.com", "dai.ly"], embedHosts: ["geo.dailymotion.com", "dailymotion.com", "www.dailymotion.com"] },
  { key: "internet_archive", label: "Internet Archive", hosts: ["archive.org", "www.archive.org"], embedHosts: [] }
];

const providerForHost = (hostname, field = "source") => {
  const host = String(hostname || "").toLowerCase().replace(/\.$/, "");
  const provider = PROVIDERS.find(item => (field === "embed" ? item.embedHosts : item.hosts).includes(host));
  return provider || null;
};

function parseHttps(value, field) {
  const raw = String(value || "").trim();
  if (!raw) return { ok: true, value: "" };
  let url;
  try { url = new URL(raw); } catch { return { ok: false, error: `${field} must be a valid HTTPS URL.` }; }
  if (url.protocol !== "https:") return { ok: false, error: `${field} must use HTTPS.` };
  if (url.username || url.password || url.port || url.hash) return { ok: false, error: `${field} contains an unsupported URL structure.` };
  return { ok: true, value: url };
}

function providerVideoId(provider, url) {
  const path = url.pathname.replace(/\/+$/, "");
  if (provider.key === "youtube") {
    if (url.hostname === "youtu.be") return path.slice(1).split("/")[0] || url.searchParams.get("v");
    if (path.startsWith("/embed/")) return path.split("/")[2];
    if (path.startsWith("/shorts/")) return path.split("/")[2];
    return url.searchParams.get("v");
  }
  if (provider.key === "rumble") return (path.match(/\/(?:embed\/)?(v[a-z0-9]+)$/i) || [])[1] || (path.match(/\/(v[a-z0-9]+)[-_]/i) || [])[1];
  if (provider.key === "dailymotion") return (path.match(/\/(?:video\/|embed\/video\/)([a-z0-9]+)/i) || [])[1] || (url.hostname === "dai.ly" ? path.slice(1) : "");
  if (provider.key === "odysee") return path.startsWith("/@") ? path.slice(2) : path.slice(1);
  if (provider.key === "internet_archive") return path.startsWith("/details/") ? path.split("/")[2] : "";
  return "";
}

export function providerForVideoUrl(value) {
  const parsed = parseHttps(value, "Video URL");
  if (!parsed.ok || !parsed.value) return null;
  return providerForHost(parsed.value.hostname, "source");
}

export function validateVideoSource(videoUrl, embedUrl = "") {
  const source = parseHttps(videoUrl, "Video URL");
  if (!source.ok || !source.value) return { ok: false, error: source.error || "Video URL is required." };
  const provider = providerForHost(source.value.hostname, "source");
  if (!provider) return { ok: false, error: "This video provider is not approved for TPI video listings." };
  if (!providerVideoId(provider, source.value)) return { ok: false, error: `The ${provider.label} URL format was not recognized.` };

  const embed = parseHttps(embedUrl, "Embed URL");
  if (!embed.ok) return { ok: false, error: embed.error };
  let canonicalEmbedUrl = "";
  if (embed.value) {
    const embedProvider = providerForHost(embed.value.hostname, "embed");
    if (!embedProvider || embedProvider.key !== provider.key) return { ok: false, error: "Embed URL must use the same approved provider as the video URL." };
    if (!providerVideoId(embedProvider, embed.value)) return { ok: false, error: "The embed URL format was not recognized." };
    canonicalEmbedUrl = embed.value.toString();
  } else if (provider.key === "youtube") {
    canonicalEmbedUrl = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(providerVideoId(provider, source.value))}`;
  } else if (provider.key === "rumble") {
    canonicalEmbedUrl = `https://rumble.com/embed/${encodeURIComponent(providerVideoId(provider, source.value))}/`;
  }

  return { ok: true, provider: provider.key, platform: provider.label, videoUrl: source.value.toString(), embedUrl: canonicalEmbedUrl };
}

export function validateThumbnailUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return { ok: true, value: "" };
  const parsed = parseHttps(raw, "Thumbnail URL");
  if (!parsed.ok) return parsed;
  const host = parsed.value.hostname.toLowerCase().replace(/\.$/, "");
  const approved = ["paranormalinitiative.com", "www.paranormalinitiative.com", "rumble.com", "www.rumble.com", "odysee.com", "www.odysee.com", "archive.org", "www.archive.org", "dailymotion.com", "www.dailymotion.com", "geo.dailymotion.com", "youtube.com", "www.youtube.com", "i.ytimg.com", "img.youtube.com", "thumbs.odycdn.com"];
  if (!approved.includes(host)) return { ok: false, error: "Thumbnail host is not approved." };
  return { ok: true, value: parsed.value.toString() };
}

export function providerCatalog() {
  return PROVIDERS.map(({ key, label }) => ({ key, label }));
}
