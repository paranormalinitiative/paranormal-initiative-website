-- 0028: per-category notification preferences (ParaPost-style notification settings).
-- JSON map of category key -> 0/1; NULL means all categories on (the default).
ALTER TABLE contributors ADD COLUMN notification_prefs TEXT;
