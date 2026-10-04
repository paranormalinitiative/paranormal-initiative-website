-- 0027: Per-member UI theme preference
-- Values: cryptid (default) | seance | cosmic | asylum
ALTER TABLE contributors ADD COLUMN theme TEXT;
