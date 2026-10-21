const REMOTE_TPI_ORIGINS = new Set([
  "https://paranormalinitiative.com",
  "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev",
]);

const LOCAL_ORIGINS = new Set([
  "http://127.0.0.1:8787",
  "http://localhost:8787",
  "http://127.0.0.1:8788",
  "http://localhost:8788",
]);

export function isLocalEnvironment(env) {
  return env?.TPI_ENV === "local" && env?.TPI_LOCAL_ONLY === "1";
}

export function localTargetAllowed(env, input) {
  if (!isLocalEnvironment(env)) return true;
  let url;
  try {
    url = new URL(String(input), env.TPI_LOCAL_ORIGIN || "http://127.0.0.1:8787");
  } catch {
    return false;
  }
  if (REMOTE_TPI_ORIGINS.has(url.origin)) return false;
  return LOCAL_ORIGINS.has(url.origin);
}

export function localOutboundError(input) {
  const target = (() => {
    try { return new URL(String(input)).origin; } catch { return "invalid target"; }
  })();
  return new Error(`Local development outbound request blocked: ${target}`);
}

export function localFetch(env, input, init) {
  if (!localTargetAllowed(env, input)) throw localOutboundError(input);
  return fetch(input, init);
}
