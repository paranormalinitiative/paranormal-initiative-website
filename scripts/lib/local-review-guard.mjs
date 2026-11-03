// TPI-CREATOR-INCENTIVE-001A — fail-closed guards for local review fixtures.
//
// The Founding Membership review fixtures (FC-001, FCT-001, FAA-001, …) exist
// only in the owner's isolated local environment. These guards are deliberately
// narrow: they accept a loopback origin, the local-only Wrangler configuration,
// and a Worker that identifies itself as a local environment. Anything else
// aborts before a review account or membership is created.

const LOOPBACK_HOSTNAMES = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);
const REVIEW_PORTS = new Set(["8787", "8788"]);

const REQUIRED_LOCAL_SETTINGS = [
  'name = "tpi-local"',
  'TPI_ENV = "local"',
  'TPI_LOCAL_ONLY = "1"',
  'database_name = "tpi-local-foundation"',
];

const FORBIDDEN_TARGET_MARKERS = [
  "theparanormalinitiative",
  "paranormalinitiative.com",
  "tpi_contributor_portal",
  "remote = true",
];

function refuse(message) {
  throw new Error(message);
}

export function assertLoopbackReviewTarget(baseUrl) {
  let url;
  try {
    url = new URL(String(baseUrl));
  } catch {
    refuse(`review target is not a valid URL: ${baseUrl}`);
  }
  if (url.protocol !== "http:") refuse(`review target must use plain http on loopback, received ${url.protocol}`);
  if (!LOOPBACK_HOSTNAMES.has(url.hostname)) refuse(`review target must be loopback, received ${url.hostname}`);
  if (!REVIEW_PORTS.has(url.port)) refuse(`review target must use a recognised local review port, received ${url.port || "(none)"}`);
  return url;
}

export function assertLocalOnlyConfig(configText) {
  const text = String(configText || "");
  for (const setting of REQUIRED_LOCAL_SETTINGS) {
    if (!text.includes(setting)) refuse(`required local setting is missing: ${setting}`);
  }
  for (const marker of FORBIDDEN_TARGET_MARKERS) {
    if (text.includes(marker)) refuse(`remote or production value found in the local config: ${marker}`);
  }
  return true;
}

// The Worker itself is the authority: production never sets TPI_ENV=local, so it
// never reports localReviewData. A missing or false flag means "not local".
export function assertLocalServerData(payload) {
  if (payload?.localReviewData !== true) {
    refuse("the server did not confirm a local review environment; refusing to create review fixtures");
  }
  return true;
}

export function assertLocalReviewEnvironment({ baseUrl, configText, registryPayload }) {
  assertLoopbackReviewTarget(baseUrl);
  assertLocalOnlyConfig(configText);
  assertLocalServerData(registryPayload);
  return true;
}
