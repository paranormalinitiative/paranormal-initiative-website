/* ============================================================================
 * TPI Research & Investigation Studio — service worker
 * (TPI-V2-WEB-009C §6/§21)
 *
 * ROOT CAUSE FIXED HERE
 * The previous worker was cache-first for EVERY same-origin GET — including
 * Vite development modules — under a cache name that never changed
 * ("tpi-shell-v1"). A cached /index.html referenced the previous build's
 * `?t=<timestamp>` module URLs, which were themselves permanently cached, so a
 * browser could keep rendering an old build long after the server started
 * serving new code. That is the "outdated dashboard" symptom.
 *
 * STRATEGY NOW
 *  - Navigations (/, /index.html): NETWORK-FIRST (fresh build wins immediately;
 *    cache is only used when the network is unavailable → offline still works).
 *  - Development modules (Vite /src, /@vite, /@fs, /@id, /node_modules, *.ts,
 *    any URL carrying a `?t=` HMR stamp): NETWORK-ONLY, never cached.
 *  - Hashed production assets (/assets/*): CACHE-FIRST (immutable filenames),
 *    refreshed in the background.
 *  - Other same-origin static files: NETWORK-FIRST with cache fallback.
 *
 * DATA SAFETY: this worker touches Cache Storage ONLY. It never reads or writes
 * IndexedDB, OPFS, or any investigation data, and it only ever deletes caches
 * it created itself (prefixed "tpi-shell-"), never caches belonging to anything
 * else on the origin.
 * ========================================================================== */

const CACHE_PREFIX = "tpi-shell-";
const CACHE = `${CACHE_PREFIX}v2`; // bumping this purges the previous stale shell
const SHELL_ASSETS = ["/apps/paranormal-initiative/", "/apps/paranormal-initiative/index.html", "/apps/paranormal-initiative/manifest.webmanifest", "/apps/paranormal-initiative/favicon.svg"];

/** Requests that must never be served from (or written to) the cache. */
function isDevelopmentAsset(url) {
  const path = url.pathname;
  return (
    path.startsWith("/src/") ||
    path.startsWith("/@vite") ||
    path.startsWith("/@fs") ||
    path.startsWith("/@id/") ||
    path.startsWith("/node_modules/") ||
    path === "/apps/paranormal-initiative/sw.js" ||
    /\.(ts|tsx|jsx|mjs)$/.test(path) ||
    url.searchParams.has("t") || // Vite hot-update stamps
    url.searchParams.has("import")
  );
}

function isNavigation(request, url) {
  return request.mode === "navigate" || url.pathname === "/apps/paranormal-initiative/" || url.pathname === "/apps/paranormal-initiative/index.html";
}

function isImmutableBuildAsset(url) {
  return url.pathname.startsWith("/apps/paranormal-initiative/assets/");
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      // Only remove our own previous shells — never anyone else's caches.
      Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "TPI_SW_VERSION") {
    event.source?.postMessage?.({
      type: "TPI_SW_VERSION_REPLY",
      cache: CACHE,
      devAssetsBypassCache: true,
    });
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== location.origin) return;

  // 1) Development modules: straight to the network, never cached.
  if (isDevelopmentAsset(url)) return;

  // 2) Navigations: network-first so a new build is visible on the next load.
  if (isNavigation(request, url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached ?? caches.match("/apps/paranormal-initiative/index.html"))),
    );
    return;
  }

  // 3) Immutable hashed build assets: cache-first, revalidated in background.
  if (isImmutableBuildAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
            }
            return response;
          })
          .catch(() => cached);
        return cached ?? network;
      }),
    );
    return;
  }

  // 4) Everything else same-origin: network-first with offline fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
