-- TPI Events Database Schema
-- Run this in Cloudflare D1 dashboard or via wrangler

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE, -- Eventbrite/Meetup ID
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'other', -- investigation, conference, meetup, workshop, livestream, etc.
    category TEXT DEFAULT 'general', -- ghosts, ufo, cryptid, evp, metaphysical, history, general
    
    -- Date/Time
    start_date TEXT, -- ISO 8601 format
    end_date TEXT,
    date_display TEXT, -- Human-readable date like "Sat, Oct 31, 7:00 PM"
    
    -- Location
    location_name TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'United States',
    latitude REAL,
    longitude REAL,
    is_virtual INTEGER DEFAULT 0,
    virtual_link TEXT,
    platform TEXT, -- youtube, twitch, zoom, etc.
    
    -- Organizer
    organizer_name TEXT,
    organizer_url TEXT,
    organizer_email TEXT,
    
    -- Media
    image_url TEXT,
    
    -- Capacity
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    price TEXT DEFAULT 'Free',
    
    -- Source
    source TEXT DEFAULT 'manual', -- eventbrite, meetup, community, admin, manual
    source_url TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, cancelled
    featured INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    scraped_at TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);
CREATE INDEX IF NOT EXISTS idx_events_external_id ON events(external_id);

-- RSVPs table
CREATE TABLE IF NOT EXISTS event_rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id INTEGER,
    guest_email TEXT,
    guest_name TEXT,
    status TEXT DEFAULT 'going', -- going, maybe, not_going
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_user ON event_rsvps(user_id);