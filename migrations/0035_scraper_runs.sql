-- Scraper run history: one row per scraper execution (or per video provider
-- within a video run) so administrators can monitor discovery health from
-- the admin panel. Observability only — scrapers must never fail because
-- logging failed. Pruned to ~90 days of history by the scheduled cron.
--
-- scraper_type: news | videos | events
-- source:       provider/feed identifier (dailymotion, internet_archive,
--               odysee, eventbrite, '' for aggregated news runs). Free-form
--               so future providers (youtube, rumble, rss, ...) need no
--               schema change.
-- run_trigger:  cron | manual
-- status:       success | partial | failed

CREATE TABLE IF NOT EXISTS scraper_runs (
    id TEXT PRIMARY KEY,
    scraper_type TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT '',
    run_trigger TEXT NOT NULL DEFAULT 'cron',
    started_at TEXT NOT NULL,
    completed_at TEXT,
    status TEXT NOT NULL DEFAULT 'running',
    items_found INTEGER NOT NULL DEFAULT 0,
    items_inserted INTEGER NOT NULL DEFAULT 0,
    items_skipped INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    error_message TEXT NOT NULL DEFAULT '',
    duration_ms INTEGER NOT NULL DEFAULT 0,
    metadata_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_scraper_runs_recent
    ON scraper_runs (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_scraper_runs_type
    ON scraper_runs (scraper_type, source, started_at DESC);
