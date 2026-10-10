#!/usr/bin/env python3
"""Build a production-ready, reviewable Paranormal Teams import package.

This only writes local SQL/checklist artifacts. It never invokes Wrangler and
never connects to remote D1. The generated rollback is conservative: records
that have been approved, claimed, edited, or verified are excluded and must be
handled manually rather than deleted automatically.
"""

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from generate_paranormal_teams_rehearsal_sql import generate, team_id_for
from migration_dry_run import run_dry_run


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_MANIFEST = ROOT / "data" / "paranormal_teams_publication_review.json"


def sql_literal(value):
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def safe_team_query(import_batch):
    batch = sql_literal(import_batch)
    return (
        "SELECT pt.id FROM paranormal_teams pt "
        f"WHERE pt.import_batch = {batch} "
        "AND pt.record_type = 'IMPORTED_DIRECTORY_LISTING' "
        "AND pt.status = 'pending' "
        "AND pt.claimed_by IS NULL "
        "AND NOT EXISTS (SELECT 1 FROM team_edit_events tee WHERE tee.team_id = pt.id) "
        "AND NOT EXISTS (SELECT 1 FROM team_claims tc WHERE tc.team_id = pt.id) "
        "AND NOT EXISTS (SELECT 1 FROM team_verification_events tve WHERE tve.team_id = pt.id)"
    )


def write_rollback(output_dir, import_batch, chunk_size, records):
    rollback_dir = output_dir / "rollback"
    rollback_dir.mkdir(parents=True, exist_ok=False)
    safe_ids = safe_team_query(import_batch)
    statements = [
        "-- Conservative rollback: only untouched pending/unclaimed imported rows are removed.",
        "-- Run rollback-blockers.sql first and review its output.",
        f"DELETE FROM organization_links WHERE team_id IN ({safe_ids});",
        f"DELETE FROM team_imports WHERE team_id IN ({safe_ids});",
        f"DELETE FROM paranormal_teams WHERE id IN ({safe_ids});",
        "",
    ]
    rollback_path = rollback_dir / "rollback.sql"
    rollback_path.write_text("\n".join(statements), encoding="utf-8")

    blockers = (
        "SELECT 'approved' AS blocker, COUNT(*) AS count FROM paranormal_teams "
        f"WHERE import_batch = {sql_literal(import_batch)} AND status = 'approved' "
        "UNION ALL SELECT 'claimed', COUNT(*) FROM paranormal_teams "
        f"WHERE import_batch = {sql_literal(import_batch)} AND claimed_by IS NOT NULL "
        "UNION ALL SELECT 'edited', COUNT(*) FROM paranormal_teams pt "
        f"WHERE pt.import_batch = {sql_literal(import_batch)} AND EXISTS (SELECT 1 FROM team_edit_events tee WHERE tee.team_id = pt.id) "
        "UNION ALL SELECT 'claimed_or_reviewed', COUNT(*) FROM paranormal_teams pt "
        f"WHERE pt.import_batch = {sql_literal(import_batch)} AND (EXISTS (SELECT 1 FROM team_claims tc WHERE tc.team_id = pt.id) OR EXISTS (SELECT 1 FROM team_verification_events tve WHERE tve.team_id = pt.id));"
    )
    (rollback_dir / "rollback-blockers.sql").write_text(blockers + "\n", encoding="utf-8")

    expected = (
        "SELECT "
        f"(SELECT COUNT(*) FROM paranormal_teams WHERE import_batch = {sql_literal(import_batch)}) AS imported_teams, "
        f"(SELECT COUNT(*) FROM team_imports WHERE import_batch = {sql_literal(import_batch)}) AS import_rows, "
        f"(SELECT COUNT(*) FROM paranormal_teams WHERE import_batch = {sql_literal(import_batch)} AND status = 'pending' AND verification_status = 'UNVERIFIED') AS pending_unverified, "
        f"(SELECT COUNT(*) FROM paranormal_teams WHERE import_batch = {sql_literal(import_batch)} AND status = 'approved') AS approved;"
    )
    (output_dir / "verify-after-import.sql").write_text(expected + "\n", encoding="utf-8")
    return {"rollback_path": str(rollback_path), "candidate_records": len(records), "chunk_size": chunk_size}


def checksum_tree(root):
    checksums = {}
    for path in sorted(root.rglob("*") if root.exists() else []):
        if path.is_file() and path.name != "checksums.sha256":
            checksums[str(path.relative_to(root))] = hashlib.sha256(path.read_bytes()).hexdigest()
    return checksums


def main():
    parser = argparse.ArgumentParser(description="Build local-only production import package")
    parser.add_argument("--output-dir", required=True, help="New package directory")
    parser.add_argument("--manifest", default=str(DEFAULT_MANIFEST))
    parser.add_argument("--chunk-size", type=int, default=200)
    parser.add_argument("--import-batch", default="paranormal-teams-import-2026-10-09")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    if output_dir.exists():
        raise SystemExit(f"Refusing to overwrite existing package directory: {output_dir}")
    output_dir.mkdir(parents=True, exist_ok=False)

    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    if manifest["publication_policy"]["auto_publish"] is not False:
        raise SystemExit("Publication manifest must have auto_publish=false")

    import_metadata = generate(
        output_dir / "import",
        Path(args.manifest),
        args.chunk_size,
        args.import_batch,
        "imported",
    )
    dry_run = run_dry_run(include_all=True)
    if dry_run is None:
        raise SystemExit("Research database is unavailable")
    rollback_metadata = write_rollback(output_dir, args.import_batch, args.chunk_size, dry_run["valid_records"])
    generated_at = datetime.now(timezone.utc).isoformat()

    release = {
        "package_type": "TPI_PARANORMAL_TEAMS_PRODUCTION_IMPORT",
        "package_version": 1,
        "generated_at": generated_at,
        "remote_execution": "NOT_PERFORMED",
        "authorization_required": True,
        "source_manifest": str(Path(args.manifest)),
        "import_batch": args.import_batch,
        "policy": {
            "status": "pending",
            "record_type": "IMPORTED_DIRECTORY_LISTING",
            "verification_status": "UNVERIFIED",
            "auto_publish": False,
            "claimed_by": None,
            "description": "Historical description remains null; raw details are preserved.",
        },
        "expected": {
            "organizations_in_source": dry_run["summary"]["total_organizations"],
            "candidate_records": len(dry_run["valid_records"]),
            "blocked_records": dry_run["total_invalid"],
            "duplicate_candidate_pairs": dry_run["total_duplicates"],
            "links_in_candidate_records": sum(len(record.get("organization_links", [])) for record in dry_run["valid_records"]),
            "import_chunks": import_metadata["chunk_count"],
        },
        "execution_order": [
            "Apply migrations/0039_paranormal_teams_profile_fields.sql and migrations/0040_paranormal_teams_management_audit.sql.",
            "Run import/ chunk files in lexical order against the intended D1 database.",
            "Run verify-after-import.sql and compare with this manifest.",
            "Keep all imported records pending until the publication policy is separately approved.",
        ],
        "rollback": rollback_metadata,
    }
    (output_dir / "release-manifest.json").write_text(json.dumps(release, indent=2) + "\n", encoding="utf-8")
    checksums = checksum_tree(output_dir)
    (output_dir / "checksums.sha256").write_text(
        "".join(f"{digest}  {path}\n" for path, digest in checksums.items()), encoding="utf-8"
    )
    print(json.dumps(release, indent=2))
    print(f"Package written to {output_dir}")


if __name__ == "__main__":
    main()
