#!/usr/bin/env python3
"""
Migration dry-run utility for Paranormal Teams import.
Reads the research database and generates an import preview.

Usage:
    python3 migration_dry_run.py [--output preview.json]
"""

import json
import sqlite3
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

RESEARCH_DB = Path("/Users/toddknipple/Documents/Parapost Site/paranormal-research-database/data/paranormal_research.db")


def normalize_url(url):
    """Normalize a URL for comparison."""
    if not url:
        return ""
    url = url.strip()
    if not url:
        return ""
    if not re.match(r"^https?://", url, re.IGNORECASE):
        url = f"https://{url}"
    try:
        parsed = urlparse(url)
        if parsed.scheme.lower() not in {"http", "https"} or not parsed.netloc:
            return ""
        # Normalize: lowercase scheme/host, remove trailing slash, remove www
        host = parsed.netloc.lower()
        if host.startswith("www."):
            host = host[4:]
        path = parsed.path.rstrip("/")
        query = f"?{parsed.query}" if parsed.query else ""
        return f"{parsed.scheme.lower()}://{host}{path}{query}".lower()
    except Exception:
        return ""


def clean_display_text(value):
    """Remove source-page HTML comments from display-only preview text.

    The raw historical value is kept in the `details` field. This helper is
    only for a safe preview of what the public renderer will show.
    """
    if value is None:
        return None
    cleaned = re.sub(r"<!--[\s\S]*?-->", "", str(value)).strip()
    return cleaned or None


def normalize_social_url(value, platform):
    """Normalize a social identity, including bare handles when present."""
    if not value:
        return ""
    candidate = str(value).strip()
    if not candidate:
        return ""
    if platform == "x" and candidate.startswith("@"):
        candidate = f"https://x.com/{candidate[1:]}"
    elif platform == "x" and not re.match(r"^https?://", candidate, re.IGNORECASE) and "/" not in candidate and "." not in candidate:
        candidate = f"https://x.com/{candidate}"
    return normalize_url(candidate)


def build_organization_links(org_dict):
    """Build normalized, explicitly unverified online identities."""
    links = []
    seen = set()
    candidates = (
        ("website", org_dict.get("website"), "website"),
        ("facebook", org_dict.get("facebook_url"), "page"),
        ("x", org_dict.get("twitter_url"), "profile"),
        ("youtube", org_dict.get("youtube_url"), "channel"),
    )
    for platform, raw_url, link_type in candidates:
        normalized = normalize_social_url(raw_url, platform) if platform == "x" else normalize_url(raw_url)
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        links.append({
            "platform": platform,
            "url": normalized,
            "link_type": link_type,
            "discovery_source": "paranormalsocieties.com",
            "discovered_at": org_dict.get("retrieved_at"),
            "last_checked_at": None,
            "link_status": "unverified",
            "verification_status": "unverified",
            "evidence_notes": "Collected from a historical source-directory snapshot; current ownership, activity, and reachability have not been independently verified.",
        })
    return links


def normalize_name(name):
    """Normalize organization name for duplicate detection."""
    if not name:
        return ""
    name = name.lower().strip()
    name = re.sub(r'[^a-z0-9\s]', '', name)
    name = re.sub(r'\s+', ' ', name)
    return name


def extract_domain(url):
    """Extract domain from URL."""
    if not url:
        return ""
    try:
        parsed = urlparse(url if url.startswith("http") else f"https://{url}")
        return parsed.netloc.lower().replace("www.", "")
    except Exception:
        return ""


def run_dry_run(output_path=None, include_all=False):
    """Run the migration dry-run analysis.

    The default output remains a small preview. Review-manifest tooling can
    request the complete in-memory candidate set without changing the legacy
    preview artifact.
    """
    if not RESEARCH_DB.exists():
        print(f"ERROR: Research database not found at {RESEARCH_DB}")
        return None

    conn = sqlite3.connect(str(RESEARCH_DB))
    conn.row_factory = sqlite3.Row

    # Get all organizations with their latest snapshot
    orgs = conn.execute("""
        SELECT o.id, o.canonical_name, o.normalized_name, o.city, o.state_province, 
               o.postal_code, o.country, o.created_at,
               sr.id as source_record_id, sr.source_region, sr.source_record_id as external_id,
               ss.id as source_snapshot_id, ss.source_url, ss.retrieved_at,
               ss.website, ss.email, ss.phone, ss.contact_name, ss.founder,
               ss.year_founded, ss.member_count, ss.areas_served, ss.specialties, ss.details,
               ss.facebook_url, ss.twitter_url, ss.youtube_url, ss.alternate_email,
               ss.alternate_phone, ss.fax
        FROM organizations o
        JOIN source_records sr ON sr.organization_id = o.id
        JOIN source_snapshots ss ON ss.source_record_id = sr.id
        WHERE ss.id = (
            SELECT MAX(ss2.id) FROM source_snapshots ss2
            JOIN source_records sr2 ON sr2.id = ss2.source_record_id
            WHERE sr2.organization_id = o.id
        )
        ORDER BY o.canonical_name
    """).fetchall()

    print(f"Found {len(orgs)} organizations in research database")

    # Analyze each organization
    valid = []
    invalid = []
    duplicate_candidates = []
    link_platform_stats = {'website': 0, 'facebook': 0, 'x': 0, 'youtube': 0}
    records_with_links = 0
    records_with_details = 0
    missing_fields_stats = {
        'website': 0, 'email': 0, 'phone': 0, 'contact_name': 0,
        'city': 0, 'state_province': 0, 'country': 0
    }

    seen_names = {}
    seen_websites = {}
    seen_emails = {}

    for org in orgs:
        org_dict = dict(org)
        issues = []

        # Validate required fields
        if not org_dict['canonical_name']:
            issues.append("Missing name")
        if not org_dict['city']:
            issues.append("Missing city")
            missing_fields_stats['city'] += 1

        # Track missing optional fields
        if not org_dict['website']:
            missing_fields_stats['website'] += 1
        if not org_dict['email']:
            missing_fields_stats['email'] += 1
        if not org_dict['phone']:
            missing_fields_stats['phone'] += 1
        if not org_dict['contact_name']:
            missing_fields_stats['contact_name'] += 1
        if not org_dict['state_province']:
            missing_fields_stats['state_province'] += 1
        if not org_dict['country']:
            missing_fields_stats['country'] += 1

        # Normalize for duplicate detection
        norm_name = normalize_name(org_dict['canonical_name'])
        norm_website = normalize_url(org_dict['website'])
        norm_email = (org_dict['email'] or "").lower().strip()

        # Check for duplicates
        if norm_name in seen_names:
            duplicate_candidates.append({
                'type': 'name_match',
                'org1_id': seen_names[norm_name]['id'],
                'org2_id': org_dict['id'],
                'org1_name': seen_names[norm_name]['name'],
                'org2_name': org_dict['canonical_name'],
                'evidence': f"Normalized name: '{norm_name}'"
            })

        if norm_website and norm_website in seen_websites:
            duplicate_candidates.append({
                'type': 'website_match',
                'org1_id': seen_websites[norm_website],
                'org2_id': org_dict['id'],
                'evidence': f"Website: {norm_website}"
            })

        if norm_email and norm_email in seen_emails:
            duplicate_candidates.append({
                'type': 'email_match',
                'org1_id': seen_emails[norm_email],
                'org2_id': org_dict['id'],
                'evidence': f"Email: {norm_email}"
            })

        seen_names[norm_name] = {
            'id': org_dict['id'],
            'name': org_dict['canonical_name']
        }
        if norm_website:
            seen_websites[norm_website] = org_dict['id']
        if norm_email:
            seen_emails[norm_email] = org_dict['id']

        # Determine scope
        scope = "us" if org_dict['source_region'] == 'USA' else "international"
        organization_links = build_organization_links(org_dict)
        if organization_links:
            records_with_links += 1
            for link in organization_links:
                link_platform_stats[link['platform']] += 1
        if org_dict['details']:
            records_with_details += 1

        # Map country/state
        country = org_dict['country'] or ""
        state = org_dict['state_province'] or ""
        if scope == "us":
            # Normalize state to match website's state list
            state = state.strip()
            country = ""

        if issues:
            invalid.append({
                'id': org_dict['id'],
                'name': org_dict['canonical_name'],
                'issues': issues,
                'data': org_dict
            })
        else:
            valid.append({
                'id': org_dict['id'],
                'research_organization_id': org_dict['id'],
                'source_record_id': org_dict['source_record_id'],
                'source_snapshot_id': org_dict['source_snapshot_id'],
                'source_region': org_dict['source_region'],
                'external_id': str(org_dict['external_id']),
                'source_identity': f"{org_dict['source_region']}:{org_dict['external_id']}",
                'external_source': 'paranormalsocieties.com',
                'source_url': org_dict['source_url'],
                'source_retrieved_at': org_dict['retrieved_at'],
                'name': org_dict['canonical_name'],
                'acronym': None,
                'scope': scope,
                'city': org_dict['city'],
                'state': state if scope == 'us' else None,
                'country': country if scope == 'international' else None,
                'zip': org_dict['postal_code'],
                'contact_name': org_dict['contact_name'],
                'phone': org_dict['phone'],
                'phone_alt': org_dict['alternate_phone'],
                'fax': org_dict['fax'],
                'email': org_dict['email'],
                'email_alt': org_dict['alternate_email'],
                'website': org_dict['website'],
                'facebook': org_dict['facebook_url'],
                'twitter': org_dict['twitter_url'],
                'youtube': org_dict['youtube_url'],
                'founder': org_dict['founder'],
                'year_founded': str(org_dict['year_founded']) if org_dict['year_founded'] else None,
                'members': str(org_dict['member_count']) if org_dict['member_count'] else None,
                'areas_served': org_dict['areas_served'],
                'specialties': org_dict['specialties'],
                # The source has no dedicated description field. Keep this
                # null rather than re-labeling historical details as current
                # organization copy.
                'description': None,
                'description_source': 'not_available_in_source',
                'details': org_dict['details'],
                'details_display': clean_display_text(org_dict['details']),
                'organization_links': organization_links,
                'record_type': 'IMPORTED_DIRECTORY_LISTING',
                'verification_status': 'UNVERIFIED'
            })

    conn.close()

    # Generate summary
    summary = {
        'generated_at': datetime.now(timezone.utc).isoformat(),
        'research_db_path': str(RESEARCH_DB),
        'total_organizations': len(orgs),
        'valid_for_import': len(valid),
        'invalid_records': len(invalid),
        'duplicate_candidates': len(duplicate_candidates),
        'missing_fields': missing_fields_stats,
        'scope_breakdown': {
            'us': sum(1 for v in valid if v['scope'] == 'us'),
            'international': sum(1 for v in valid if v['scope'] == 'international')
        },
        'record_type_breakdown': {
            'IMPORTED_DIRECTORY_LISTING': len(valid)
        },
        'historical_description_mapping': {
            'policy': 'UNMAPPED',
            'description_source': 'not_available_in_source',
            'reason': 'source_snapshots has no dedicated description column; historical details remain preserved in their original field',
            'records_with_description': 0,
            'records_with_details': records_with_details
        },
        'organization_links': {
            'records_with_links': records_with_links,
            'total_links': sum(link_platform_stats.values()),
            'by_platform': link_platform_stats,
            'verification_policy': 'UNVERIFIED until independently checked'
        }
    }

    result = {
        'summary': summary,
        'valid_records': valid if include_all else valid[:50],
        'invalid_records': invalid if include_all else invalid[:20],
        'duplicate_candidates': duplicate_candidates if include_all else duplicate_candidates[:50],
        'total_valid': len(valid),
        'total_invalid': len(invalid),
        'total_duplicates': len(duplicate_candidates)
    }

    if output_path:
        with open(output_path, 'w') as f:
            json.dump(result, f, indent=2, default=str)
        print(f"Preview written to {output_path}")

    # Print summary
    print("\n" + "=" * 60)
    print("MIGRATION DRY-RUN SUMMARY")
    print("=" * 60)
    print(f"Total organizations: {summary['total_organizations']}")
    print(f"Valid for import:    {summary['valid_for_import']}")
    print(f"Invalid records:     {summary['invalid_records']}")
    print(f"Duplicate candidates: {summary['duplicate_candidates']}")
    print(f"\nScope breakdown:")
    print(f"  USA:           {summary['scope_breakdown']['us']}")
    print(f"  International: {summary['scope_breakdown']['international']}")
    print(f"\nMissing fields:")
    for field, count in missing_fields_stats.items():
        pct = (count / len(orgs) * 100) if orgs else 0
        print(f"  {field}: {count} ({pct:.1f}%)")
    print(f"\nDuplicate candidates: {len(duplicate_candidates)}")
    if duplicate_candidates:
        print("  (See preview file for details)")
    print("=" * 60)

    return result


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Migration dry-run utility")
    parser.add_argument("--output", "-o", help="Output file path", default="data/migration_preview.json")
    args = parser.parse_args()

    output_path = Path(__file__).parent.parent / args.output
    output_path.parent.mkdir(parents=True, exist_ok=True)
    run_dry_run(output_path)
