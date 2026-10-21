const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function isLocalUrl(value) {
  const url = new URL(value);
  return LOCAL_HOSTS.has(url.hostname) || url.hostname.endsWith(".localhost");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function retryDelay(response, attempt, baseDelayMs) {
  const retryAfter = response?.headers?.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.min(30000, seconds * 1000);
    const date = Date.parse(retryAfter);
    if (Number.isFinite(date)) return Math.min(30000, Math.max(0, date - Date.now()));
  }
  return Math.min(30000, baseDelayMs * (2 ** attempt));
}

export function createRequestBudget({
  baseUrl,
  label = "development verification",
  maxRequests = positiveInteger(process.env.TPI_MAX_REQUESTS, 100),
  maxConcurrency = positiveInteger(process.env.TPI_MAX_CONCURRENCY, 4),
  timeoutMs = positiveInteger(process.env.TPI_REQUEST_TIMEOUT_MS, 10000),
  maxRetries = Number.isInteger(Number(process.env.TPI_MAX_RETRIES)) ? Math.max(0, Number(process.env.TPI_MAX_RETRIES)) : 1,
  backoffMs = positiveInteger(process.env.TPI_RETRY_BACKOFF_MS, 250)
} = {}) {
  if (!baseUrl) throw new Error("A base URL is required for request budgeting.");
  const origin = new URL(baseUrl).origin;
  const external = !isLocalUrl(baseUrl);
  if (external && process.env.TPI_ALLOW_EXTERNAL_DEV_REQUESTS !== "1") {
    const error = new Error(`${label} targets an external Worker. Set TPI_ALLOW_EXTERNAL_DEV_REQUESTS=1 for an explicit bounded run.`);
    error.code = "EXTERNAL_REQUEST_OPT_IN_REQUIRED";
    throw error;
  }

  let used = 0;
  let active = 0;
  let stopped = false;
  const waiters = [];

  function release() {
    active = Math.max(0, active - 1);
    const next = waiters.shift();
    if (next) next();
  }

  async function acquire() {
    while (active >= maxConcurrency) await new Promise(resolve => waiters.push(resolve));
    if (stopped || used >= maxRequests) {
      stopped = true;
      const error = new Error(`${label} request budget exhausted (${used}/${maxRequests}).`);
      error.code = "REQUEST_BUDGET_EXHAUSTED";
      throw error;
    }
    used += 1;
    active += 1;
  }

  function isTarget(url) {
    return new URL(url, `${origin}/`).origin === origin;
  }

  function reserveBrowserRequest(url) {
    if (!isTarget(url)) return true;
    if (stopped || used >= maxRequests) {
      stopped = true;
      return false;
    }
    used += 1;
    return true;
  }

  async function request(input, options = {}) {
    let attempt = 0;
    while (true) {
      await acquire();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      let response;
      try {
        response = await fetch(input, { ...options, signal: controller.signal });
      } catch (error) {
        if (attempt >= maxRetries) throw error;
        await sleep(Math.min(30000, backoffMs * (2 ** attempt)));
        attempt += 1;
        continue;
      } finally {
        clearTimeout(timer);
        release();
      }

      if (response.status === 429 || response.status === 1027) {
        stopped = true;
        const error = new Error(`${label} stopped on HTTP ${response.status}; no retry was attempted.`);
        error.code = "CLOUDFLARE_RATE_LIMIT";
        error.status = response.status;
        throw error;
      }
      if (response.status >= 500 && response.status <= 599 && attempt < maxRetries) {
        await sleep(retryDelay(response, attempt, backoffMs));
        attempt += 1;
        continue;
      }
      return response;
    }
  }

  return {
    fetch: request,
    reserveBrowserRequest,
    isTarget,
    summary: () => ({ label, origin, external, maxRequests, maxConcurrency, timeoutMs, maxRetries, requestsUsed: used, requestsRemaining: Math.max(0, maxRequests - used), stopped })
  };
}

