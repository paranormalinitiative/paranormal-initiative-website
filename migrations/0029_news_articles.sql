-- ParaNews: aggregated paranormal news articles (RSS + community sources)
CREATE TABLE IF NOT EXISTS news_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    source_url TEXT NOT NULL,
    source_name TEXT,
    author TEXT,
    category TEXT NOT NULL DEFAULT 'unexplained',
    published_at TEXT,
    scraped_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'approved'
);

CREATE INDEX IF NOT EXISTS idx_news_articles_category
    ON news_articles (category, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_articles_published
    ON news_articles (published_at DESC);
