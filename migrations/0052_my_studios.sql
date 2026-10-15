-- TPI-DEV-037: numbered My Studios metadata and recoverable deletion.
-- Development-first migration. Production application of this file requires
-- the separate production schema authorization gate in TPI-DEV-037.
ALTER TABLE studio_workspaces ADD COLUMN studio_number INTEGER;
ALTER TABLE studio_workspaces ADD COLUMN deleted_at TEXT;

CREATE TABLE studio_number_allocations (
  owner_id TEXT PRIMARY KEY REFERENCES contributors(id) ON DELETE CASCADE,
  next_number INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

UPDATE studio_workspaces
SET studio_number = (
  SELECT ranked.studio_number
  FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY owner_id
      ORDER BY created_at, id
    ) AS studio_number
    FROM studio_workspaces
  ) ranked
  WHERE ranked.id = studio_workspaces.id
)
WHERE studio_number IS NULL;

INSERT INTO studio_number_allocations(owner_id, next_number, updated_at)
SELECT owner_id, MAX(studio_number) + 1, CURRENT_TIMESTAMP
FROM studio_workspaces
GROUP BY owner_id;

CREATE UNIQUE INDEX idx_studio_workspaces_owner_number
  ON studio_workspaces(owner_id, studio_number);

CREATE INDEX idx_studio_workspaces_owner_deleted_updated
  ON studio_workspaces(owner_id, deleted_at, updated_at DESC);
