#!/usr/bin/env python3
"""Generate chunked, idempotent SQL for the local Paranormal Teams rehearsal.

The generated SQL is intended for a disposable local D1 only. It imports the
latest historical snapshot fields, provenance, and normalized links while
keeping every team pending and unverified.
"""

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from migration_dry_run import run_dry_run


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_MANIFEST = ROOT / "data" / "paranormal_teams_publication_review.json"


def sql_literal(value):
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def team_id_for(record):
    source = record["external_source"].replace(".", "-")
    identity = record["source_identity"].replace(":", "-")
    return f"imported-{source}-{identity}"


def team_insert(record, team_id, imported_at, import_batch):
    values = [
        team_id,
        "pending",
        record["scope"],
        record["name"],
        record["acronym"],
        None,
        record["city"],
        record["state"],
        record["country"],
        record["zip"],
        record["contact_name"],
        record["phone"],
        record["phone_alt"],
        record["fax"],
        record["email"],
        record["email_alt"],
        record["website"],
        record["facebook"],
        record["twitter"],
        record["youtube"],
        record["founder"],
        record["year_founded"],
        record["members"],
        record["areas_served"],
        record["specialties"],
        None,
        record["details"],
        None,
        None,
        None,
        None,
        None,
        "IMPORTED_DIRECTORY_LISTING",
        record["source_identity"],
        record["external_source"],
        imported_at,
        import_batch,
        "UNVERIFIED",
    ]
    columns = (
        "id, status, scope, name, acronym, address, city, state, country, zip, "
        "contact_name, phone, phone_alt, fax, email, email_alt, website, facebook, "
        "twitter, youtube, founder, year_founded, members, areas_served, specialties, "
        "description, details, additional_states, submitter_name, submitter_email, "
        "heard_about, submitted_ip, record_type, external_id, external_source, "
        "imported_at, import_batch, verification_status"
    )
    return f"INSERT OR IGNORE INTO paranormal_teams ({columns}) VALUES ({', '.join(sql_literal(value) for value in values)});"


def import_tracking_insert(record, team_id, import_batch, imported_at, import_status):
    values = [team_id, record["source_identity"], record["external_source"], import_batch, import_status, imported_at]
    return (
        "INSERT OR IGNORE INTO team_imports "
        "(team_id, external_id, external_source, import_batch, import_status, imported_at) "
        f"VALUES ({', '.join(sql_literal(value) for value in values)});"
    )


def link_inserts(record, team_id):
    statements = []
    for link in record.get("organization_links", []):
        link_id = f"{team_id}-link-{link['platform']}"
        values = [
            link_id,
            team_id,
            link["platform"],
            link["url"],
            link["link_type"],
            link["discovery_source"],
            link["discovered_at"],
            link["last_checked_at"],
            link["link_status"],
            link["verification_status"],
            link["evidence_notes"],
        ]
        statements.append(
            "INSERT OR IGNORE INTO organization_links "
            "(id, team_id, platform, url, link_type, discovery_source, discovered_at, "
            "last_checked_at, link_status, verification_status, evidence_notes) "
            f"VALUES ({', '.join(sql_literal(value) for value in values)});"
        )
    return statements


def generate(output_dir, manifest_path, chunk_size, import_batch, import_status="rehearsal"):
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest["publication_policy"]["auto_publish"] is not False:
        raise ValueError("Publication manifest must have auto_publish=false")
    if manifest["publication_policy"]["initial_status"] != "pending":
        raise ValueError("Publication manifest must keep imported teams pending")

    dry_run = run_dry_run(include_all=True)
    if dry_run is None:
        raise RuntimeError("Research database is unavailable")
    records = dry_run["valid_records"]
    manifest_ids = {item["research_organization_id"] for item in manifest["review_queue"]}
    dry_run_ids = {item["research_organization_id"] for item in records}
    if manifest_ids != dry_run_ids:
        raise ValueError("Manifest and dry-run candidate sets do not match")

    output_dir = Path(output_dir)
    if output_dir.exists():
        raise FileExistsError(f"Refusing to overwrite existing rehearsal directory: {output_dir}")
    output_dir.mkdir(parents=True, exist_ok=False)

    imported_at = datetime.now(timezone.utc).isoformat()
    chunks = []
    for start in range(0, len(records), chunk_size):
        statements = [
            "PRAGMA foreign_keys = ON;",
        ]
        for record in records[start:start + chunk_size]:
            team_id = team_id_for(record)
            statements.append(team_insert(record, team_id, imported_at, import_batch))
            statements.append(import_tracking_insert(record, team_id, import_batch, imported_at, import_status))
            statements.extend(link_inserts(record, team_id))
        statements.append("")
        chunk_path = output_dir / f"chunk-{start // chunk_size + 1:03d}.sql"
        chunk_path.write_text("\n".join(statements), encoding="utf-8")
        chunks.append(chunk_path)

    metadata = {
        "rehearsal_type": "PARANORMAL_TEAMS_LOCAL_D1_IMPORT",
        "generated_at": imported_at,
        "import_batch": import_batch,
        "candidate_records": len(records),
        "chunk_size": chunk_size,
        "chunk_count": len(chunks),
        "policy": {
            "status": "pending",
            "record_type": "IMPORTED_DIRECTORY_LISTING",
            "verification_status": "UNVERIFIED",
            "auto_publish": False,
            "claimed_by": None,
            "import_status": import_status,
        },
        "idempotency": {
            "team_ids": "imported-<external_source>-<source_region>-<external_id>",
            "stored_external_id": "<source_region>:<external_id>",
            "link_ids": "<team_id>-link-<platform>",
            "insert_mode": "INSERT OR IGNORE",
        },
    }
    (output_dir / "manifest.json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    return metadata


def main():
    parser = argparse.ArgumentParser(description="Generate local-only Paranormal Teams rehearsal SQL")
    parser.add_argument("--output-dir", required=True, help="New directory for chunked SQL")
    parser.add_argument("--manifest", default=str(DEFAULT_MANIFEST), help="Publication review manifest")
    parser.add_argument("--chunk-size", type=int, default=200)
    parser.add_argument("--import-batch", default="paranormal-teams-rehearsal-2026-10-09")
    parser.add_argument("--import-status", choices=["rehearsal", "imported"], default="rehearsal")
    args = parser.parse_args()
    if args.chunk_size < 1:
        raise SystemExit("--chunk-size must be positive")
    metadata = generate(args.output_dir, Path(args.manifest), args.chunk_size, args.import_batch, args.import_status)
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
