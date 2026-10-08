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
from datetime import datetime
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
    if not url.startswith("http"):
        url = f"https://{url}"
    try:
        parsed = urlparse(url)
        # Normalize: lowercase scheme/host, remove trailing slash, remove www
        host = parsed.netloc.lower().replace("www.", "")
        path = parsed.path.rstrip("/")
        return f"{parsed.scheme}://{host}{path}".lower()
    except Exception:
        return url.lower()


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


def run_dry_run(output_path=None):
    """Run the migration dry-run analysis."""
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
                'org1_id': seen_names[norm_name],
                'org2_id': org_dict['id'],
                'org1_name': org_dict['canonical_name'],
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

        seen_names[norm_name] = org_dict['id']
        if norm_website:
            seen_websites[norm_website] = org_dict['id']
        if norm_email:
            seen_emails[norm_email] = org_dict['id']

        # Determine scope
        scope = "us" if org_dict['source_region'] == 'USA' else "international"

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
                'external_id': str(org_dict['external_id']),
                'external_source': 'paranormalsocieties.com',
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
                'details': org_dict['details'],
                'record_type': 'IMPORTED_DIRECTORY_LISTING',
                'verification_status': 'UNVERIFIED'
            })

    conn.close()

    # Generate summary
    summary = {
        'generated_at': datetime.utcnow().isoformat(),
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
        }
    }

    result = {
        'summary': summary,
        'valid_records': valid[:50],  # Preview only
        'invalid_records': invalid[:20],  # Preview only
        'duplicate_candidates': duplicate_candidates[:50],  # Preview only
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
