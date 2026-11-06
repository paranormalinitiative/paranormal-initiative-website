-- TPI-NOVA-005A6E: article-specific publication metadata.
-- These describe the article itself and may differ from the Contributor profile,
-- so they live on the article row. All columns are nullable; existing articles are not populated.
ALTER TABLE articles ADD COLUMN affiliation TEXT;
ALTER TABLE articles ADD COLUMN organization TEXT;
ALTER TABLE articles ADD COLUMN correspondence TEXT;
ALTER TABLE articles ADD COLUMN website TEXT;
