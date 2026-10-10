#!/usr/bin/env python3
"""Build a review-only publication manifest for imported Paranormal Teams.

This file deliberately does not write to D1 or change any source records. It
turns the read-only migration dry-run into an explicit publication queue:
every imported candidate remains pending, unverified, and requires review.
"""

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from migration_dry_run import run_dry_run


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT = ROOT / "data" / "paranormal_teams_publication_review.json"


def compact_invalid_record(record):
    data = record.get("data") or {}
    return {
        "research_organization_id": record.get("id"),
        "name": record.get("name"),
        "source_region": data.get("source_region"),
        "external_id": str(data.get("external_id")) if data.get("external_id") is not None else None,
        "source_url": data.get("source_url"),
        "issues": record.get("issues", []),
        "publication_state": "BLOCKED_PENDING_DATA_REVIEW",
    }


def build_manifest(dry_run):
    valid_records = dry_run["valid_records"]
    duplicate_candidates = dry_run["duplicate_candidates"]
    duplicate_ids = {
        candidate_id
        for candidate in duplicate_candidates
        for candidate_id in (candidate.get("org1_id"), candidate.get("org2_id"))
    }

    records = []
    reason_counts = {}
    no_online_identity = 0
    duplicate_record_count = 0

    for record in valid_records:
        reasons = ["manual_publication_review"]
        if record["id"] in duplicate_ids:
            reasons.append("duplicate_candidate")
            duplicate_record_count += 1
        if not record.get("organization_links"):
            reasons.append("no_normalized_online_identity")
            no_online_identity += 1

        for reason in reasons:
            reason_counts[reason] = reason_counts.get(reason, 0) + 1

        display_details = record.get("details_display") or ""
        records.append({
            "research_organization_id": record["research_organization_id"],
            "source_record_id": record["source_record_id"],
            "source_snapshot_id": record["source_snapshot_id"],
            "source_region": record["source_region"],
            "external_id": record["external_id"],
            "source_identity": record["source_identity"],
            "external_source": record["external_source"],
            "source_url": record["source_url"],
            "source_retrieved_at": record["source_retrieved_at"],
            "name": record["name"],
            "scope": record["scope"],
            "city": record["city"],
            "state": record["state"],
            "country": record["country"],
            "zip": record["zip"],
            "contact_name": record["contact_name"],
            "phone": record["phone"],
            "email": record["email"],
            "founder": record["founder"],
            "year_founded": record["year_founded"],
            "members": record["members"],
            "areas_served": record["areas_served"],
            "specialties": record["specialties"],
            "website": record["website"],
            "organization_links": record["organization_links"],
            "has_historical_details": bool(record.get("details")),
            "details_display_preview": display_details[:280] or None,
            "description": None,
            "description_source": "not_available_in_source",
            "record_type": "IMPORTED_DIRECTORY_LISTING",
            "verification_status": "UNVERIFIED",
            "suggested_initial_status": "pending",
            "publication_state": "PENDING_REVIEW",
            "review_required": True,
            "review_reasons": reasons,
        })

    generated_at = datetime.now(timezone.utc).isoformat()
    candidate_link_count = sum(len(record.get("organization_links", [])) for record in records)
    candidate_records_with_links = sum(1 for record in records if record.get("organization_links"))
    return {
        "manifest_type": "PARANORMAL_TEAMS_PUBLICATION_REVIEW",
        "manifest_version": 1,
        "generated_at": generated_at,
        "source": {
            "research_db_path": dry_run["summary"]["research_db_path"],
            "snapshot_policy": "latest snapshot per organization",
            "raw_source_values_preserved": True,
        },
        "publication_policy": {
            "policy_state": "REVIEW_ONLY",
            "record_type": "IMPORTED_DIRECTORY_LISTING",
            "initial_status": "pending",
            "verification_status": "UNVERIFIED",
            "claimed_by": None,
            "auto_publish": False,
            "manual_review_required": True,
            "current_activity_inferred": False,
            "historical_description_mapping": "description remains null; raw historical details remain in the source field",
            "duplicate_handling": "hold for review; do not merge or overwrite automatically",
        },
        "summary": {
            "candidate_records": len(records),
            "auto_publish_records": 0,
            "manual_review_records": len(records),
            "blocked_invalid_records": dry_run["total_invalid"],
            "duplicate_candidate_records": duplicate_record_count,
            "records_without_normalized_online_identity": no_online_identity,
            "review_reason_counts": reason_counts,
            "duplicate_candidate_pairs": dry_run["total_duplicates"],
            "normalized_links_in_candidates": candidate_link_count,
            "candidate_records_with_normalized_links": candidate_records_with_links,
        },
        "review_queue": records,
        "blocked_records": [compact_invalid_record(record) for record in dry_run["invalid_records"]],
        "duplicate_candidates": duplicate_candidates,
    }


def main():
    parser = argparse.ArgumentParser(description="Build a review-only Paranormal Teams publication manifest")
    parser.add_argument("--output", "-o", default=str(DEFAULT_OUTPUT), help="Manifest output path")
    args = parser.parse_args()

    output_path = Path(args.output)
    if not output_path.is_absolute():
        output_path = ROOT / output_path
    output_path.parent.mkdir(parents=True, exist_ok=True)

    dry_run = run_dry_run(include_all=True)
    if dry_run is None:
        raise SystemExit(1)

    manifest = build_manifest(dry_run)
    output_path.write_text(json.dumps(manifest, indent=2, default=str) + "\n", encoding="utf-8")
    print(f"Publication review manifest written to {output_path}")
    print(json.dumps(manifest["summary"], indent=2))


if __name__ == "__main__":
    main()
