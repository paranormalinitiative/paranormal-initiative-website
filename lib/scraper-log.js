// Scraper run logging — observability for the discovery engine.
//
// Hard rule: logging must never break a scraper. Every write is wrapped so a
// logging failure can only ever produce a console error. Errors are
// sanitized (secrets redacted, length capped) before they reach D1 so the
// admin monitoring UI can safely display them.
//
// Schema: migrations/0035_scraper_runs.sql. Free-form `source` so future
// providers (youtube, rumble, rss, ...) need no schema change.

const RETENTION_DAYS = 90;


// Redacts anything that smells like a credential and caps the length so the
// admin failure-details view can never leak secrets or dump huge payloads.
export function sanitizeScraperError(message) {
  return String(message || "")
    .replace(/\b(sk|pk|rk)_[A-Za-z0-9_-]+/g, "[redacted]")
    .replace(/\b(bearer|token|api[_-]?key|apikey|password|authorization|cookie)\b\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .slice(0, 500);
}

// Fire-and-forget run record. Never throws.
export async function logScraperRun(env, run) {
  try {
    await env.TPI_DB.prepare(`
      INSERT INTO scraper_runs
        (id, scraper_type, source, run_trigger, started_at, completed_at, status,
         items_found, items_inserted, items_skipped, error_count, error_message,
         duration_ms, metadata_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      String(run.scraperType || ""),
      String(run.source || ""),
      String(run.trigger || "cron"),
      run.startedAt || new Date().toISOString(),
      run.completedAt || new Date().toISOString(),
      String(run.status || "success"),
      Number(run.found) || 0,
      Number(run.inserted) || 0,
      Number(run.skipped) || 0,
      Number(run.errorCount) || 0,
      sanitizeScraperError(run.errorMessage || ""),
      Number(run.durationMs ?? Math.max(0, Date.now() - (run.started?.startedMs || 0))) || 0,
      run.metadataJson ? JSON.stringify(run.metadataJson).slice(0, 2000) : null
    ).run();
  } catch (error) {
    console.error(`scraper_runs log failed (${run.scraperType}/${run.source}):`, error.message);
  }
}

// Removes run records past the retention window. Called from the scheduled
// cron; only ever touches scraper_runs — never content tables.
export async function pruneScraperRuns(env) {
  try {
    await env.TPI_DB.prepare(
      `DELETE FROM scraper_runs WHERE started_at < datetime('now', '-${RETENTION_DAYS} days')`
    ).run();
  } catch (error) {
    console.error("scraper_runs prune failed:", error.message);
  }
}

// Standard run timestamps: pass the returned object as `started` into
// logScraperRun, which computes durationMs at write time.
export function startScraperRun() {
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  return {
    startedAt,
    startedMs,
  };
}
