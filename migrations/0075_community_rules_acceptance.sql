-- Versioned acknowledgement for the member-facing Community Rules.
-- Additive only; existing accounts remain valid and can review the current rules.
ALTER TABLE contributors ADD COLUMN community_rules_version TEXT;
ALTER TABLE contributors ADD COLUMN community_rules_accepted_at TEXT;
