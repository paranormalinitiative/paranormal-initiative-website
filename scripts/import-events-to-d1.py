#!/usr/bin/env python3
"""
Import events from events-data.json to Cloudflare D1 database
Run this once to seed the database with scraped events
"""

import json
import requests
import os

# Cloudflare API credentials (set these as environment variables)
CLOUDFLARE_ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
CLOUDFLARE_API_TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", "")
D1_DATABASE_ID = os.environ.get("D1_DATABASE_ID", "f36b9161-b517-4634-9857-bef4147cefe3")

# Input file
INPUT_FILE = "/Users/toddknipple/Desktop/paranormal-initiative-website/events-data.json"

def create_events_table():
    """Create the events table in D1"""
    sql = """
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        external_id TEXT UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL DEFAULT 'other',
        category TEXT DEFAULT 'general',
        start_date TEXT,
        end_date TEXT,
        date_display TEXT,
        location_name TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        country TEXT DEFAULT 'United States',
        latitude REAL,
        longitude REAL,
        is_virtual INTEGER DEFAULT 0,
        virtual_link TEXT,
        platform TEXT,
        organizer_name TEXT,
        organizer_url TEXT,
        organizer_email TEXT,
        image_url TEXT,
        max_attendees INTEGER,
        current_attendees INTEGER DEFAULT 0,
        price TEXT DEFAULT 'Free',
        source TEXT DEFAULT 'manual',
        source_url TEXT,
        status TEXT DEFAULT 'pending',
        featured INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        scraped_at TEXT
    );
    """
    return execute_sql(sql)

def execute_sql(sql, params=None):
    """Execute SQL against D1 database"""
    if not CLOUDFLARE_ACCOUNT_ID or not CLOUDFLARE_API_TOKEN:
        print("ERROR: Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN environment variables")
        return None

    url = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/d1/database/{D1_DATABASE_ID}/query"
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
        "Content-Type": "application/json"
    }
    data = {"sql": sql}
    if params:
        data["params"] = params

    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"SQL Error: {response.status_code} - {response.text}")
        return None

def import_events():
    """Import events from JSON to D1"""
    # Read events
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    events = data.get('events', [])
    print(f"Found {len(events)} events to import")
    
    # Create table if needed
    print("Creating events table...")
    create_events_table()
    
    # Import each event
    imported = 0
    skipped = 0
    errors = 0
    
    for event in events:
        try:
            # Check if event already exists (by external_id or title)
            external_id = event.get('id', '')
            title = event.get('title', '')
            
            sql = """
            INSERT INTO events (
                external_id, title, description, type, category,
                start_date, end_date, date_display,
                location_name, address, city, state, country, is_virtual,
                organizer_name, organizer_url, image_url, source_url,
                source, status, scraped_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', datetime('now'))
            ON CONFLICT(external_id) DO UPDATE SET
                title = excluded.title,
                description = excluded.description,
                start_date = excluded.start_date,
                location_name = excluded.location_name,
                city = excluded.city,
                state = excluded.state,
                is_virtual = excluded.is_virtual,
                image_url = excluded.image_url,
                updated_at = datetime('now')
            """
            
            params = [
                external_id,
                title[:200],  # Truncate long titles
                (event.get('description', '') or '')[:1000],
                event.get('type', 'other'),
                event.get('category', 'general'),
                event.get('startDate', ''),
                event.get('endDate', ''),
                event.get('startDate', ''),  # Use as date_display
                event.get('locationName', ''),
                event.get('address', ''),
                event.get('city', ''),
                event.get('state', ''),
                event.get('country', 'United States'),
                1 if event.get('isVirtual') else 0,
                event.get('organizer', ''),
                event.get('organizerUrl', ''),
                event.get('imageUrl', ''),
                event.get('url', ''),
                event.get('source', 'scraper')
            ]
            
            result = execute_sql(sql, params)
            if result:
                imported += 1
            else:
                errors += 1
                
        except Exception as e:
            print(f"Error importing '{event.get('title', '')[:50]}': {e}")
            errors += 1
    
    print(f"\nImport complete:")
    print(f"  - Imported: {imported}")
    print(f"  - Skipped: {skipped}")
    print(f"  - Errors: {errors}")

if __name__ == "__main__":
    if not CLOUDFLARE_ACCOUNT_ID or not CLOUDFLARE_API_TOKEN:
        print("Usage:")
        print("  export CLOUDFLARE_ACCOUNT_ID='your-account-id'")
        print("  export CLOUDFLARE_API_TOKEN='your-api-token'")
        print("  python3 scripts/import-events-to-d1.py")
        print("")
        print("Or run manually in Cloudflare Dashboard > D1 > SQL Console")
    else:
        import_events()