#!/usr/bin/env python3
"""
TPI Event Fetcher
Fetches paranormal events from Eventbrite and other sources
"""

import requests
import json
import os
from datetime import datetime, timedelta

# Output file
OUTPUT_FILE = "/Users/toddknipple/Desktop/paranormal-initiative-website/events-data.json"

# Search queries for paranormal events
SEARCH_QUERIES = [
    "paranormal",
    "ghost hunting",
    "ghost hunt",
    "haunted",
    "supernatural",
    "paranormal investigation",
    "ufo",
    "uap",
    "cryptid",
    "bigfoot",
    "evp",
    "spirit",
    "paranormal conference",
    "ghost tour",
    "haunted house",
    "paranormal meetup"
]

def fetch_eventbrite_events():
    """Fetch events from Eventbrite API (no auth required for public events)"""
    events = []
    
    for query in SEARCH_QUERIES:
        try:
            # Eventbrite public search API
            url = "https://www.eventbriteapi.com/v3/events/search/"
            params = {
                "q": query,
                "location.address": "United States",
                "location.within": "100mi",
                "expand": "venue,organizer,category",
                "sort_by": "date",
                "page_size": 50
            }
            headers = {
                "Authorization": "Bearer YOUR_EVENTBRITE_TOKEN",  # Replace with actual token
                "Content-Type": "application/json"
            }
            
            # For now, use the public endpoint without auth
            # Eventbrite allows some public access
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                for event in data.get("events", []):
                    events.append({
                        "id": f"eb_{event.get('id')}",
                        "title": event.get("name", {}).get("text", "Untitled"),
                        "description": event.get("description", {}).get("text", "")[:500],
                        "type": classify_event_type(event.get("name", {}).get("text", "")),
                        "category": classify_category(event.get("name", {}).get("text", "") + " " + event.get("description", {}).get("text", "")),
                        "startDate": event.get("start", {}).get("local"),
                        "endDate": event.get("end", {}).get("local"),
                        "locationName": event.get("venue", {}).get("name", ""),
                        "address": event.get("venue", {}).get("address", {}).get("address_1", ""),
                        "city": event.get("venue", {}).get("address", {}).get("city", ""),
                        "state": event.get("venue", {}).get("address", {}).get("region", ""),
                        "country": event.get("venue", {}).get("address", {}).get("country", "United States"),
                        "isVirtual": event.get("online_event", False),
                        "imageUrl": event.get("logo", {}).get("url", ""),
                        "organizer": event.get("organizer", {}).get("name", ""),
                        "organizerUrl": event.get("organizer", {}).get("url", ""),
                        "url": event.get("url", ""),
                        "source": "eventbrite",
                        "status": "approved"
                    })
            else:
                print(f"Eventbrite API error for '{query}': {response.status_code}")
                
        except Exception as e:
            print(f"Error fetching Eventbrite events for '{query}': {e}")
    
    return events

def fetch_meetup_events():
    """Fetch events from Meetup API"""
    events = []
    
    for query in SEARCH_QUERIES[:5]:  # Limit queries for Meetup
        try:
            # Meetup GraphQL API (public events)
            url = "https://api.meetup.com/gql"
            query_str = """
            query($search: String!) {
                keywordSearch(input: {first: 50, filter: {searchQuery: $search, eventType: PHYSICAL}}) {
                    edges {
                        node {
                            ... on Event {
                                id
                                title
                                description
                                dateTime
                                endTime
                                venue {
                                    name
                                    address
                                    city
                                    state
                                }
                                group {
                                    name
                                }
                            }
                        }
                    }
                }
            }
            """
            
            response = requests.post(url, json={
                "query": query_str,
                "variables": {"search": query}
            }, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                for edge in data.get("data", {}).get("keywordSearch", {}).get("edges", []):
                    event = edge.get("node", {})
                    if event:
                        events.append({
                            "id": f"mu_{event.get('id')}",
                            "title": event.get("title", "Untitled"),
                            "description": event.get("description", "")[:500],
                            "type": classify_event_type(event.get("title", "")),
                            "category": classify_category(event.get("title", "") + " " + event.get("description", "")),
                            "startDate": event.get("dateTime"),
                            "endDate": event.get("endTime"),
                            "locationName": event.get("venue", {}).get("name", ""),
                            "address": event.get("venue", {}).get("address", ""),
                            "city": event.get("venue", {}).get("city", ""),
                            "state": event.get("venue", {}).get("state", ""),
                            "country": "United States",
                            "isVirtual": False,
                            "imageUrl": "",
                            "organizer": event.get("group", {}).get("name", ""),
                            "organizerUrl": "",
                            "url": f"https://meetup.com/events/{event.get('id')}",
                            "source": "meetup",
                            "status": "approved"
                        })
            else:
                print(f"Meetup API error for '{query}': {response.status_code}")
                
        except Exception as e:
            print(f"Error fetching Meetup events for '{query}': {e}")
    
    return events

def classify_event_type(title):
    """Classify event type based on title"""
    title_lower = title.lower()
    
    if any(word in title_lower for word in ["investigation", "ghost hunt", "hunt", "explore"]):
        return "investigation"
    elif any(word in title_lower for word in ["conference", "con", "symposium", "summit"]):
        return "conference"
    elif any(word in title_lower for word in ["meetup", "meet-up", "meet up", "group"]):
        return "meetup"
    elif any(word in title_lower for word in ["workshop", "class", "training", "learn"]):
        return "workshop"
    elif any(word in title_lower for word in ["live", "stream", "broadcast"]):
        return "livestream"
    elif any(word in title_lower for word in ["lecture", "talk", "presentation", "speaker"]):
        return "lecture"
    elif any(word in title_lower for word in ["festival", "fair", "convention"]):
        return "festival"
    elif any(word in title_lower for word in ["tour", "walk", "walking"]):
        return "tour"
    else:
        return "other"

def classify_category(text):
    """Classify event category based on text"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ["ghost", "haunt", "spirit", "paranormal"]):
        return "ghosts"
    elif any(word in text_lower for word in ["ufo", "uap", "alien", "extraterrestrial"]):
        return "ufo"
    elif any(word in text_lower for word in ["cryptid", "bigfoot", "sasquatch", "monster", "creature"]):
        return "cryptid"
    elif any(word in text_lower for word in ["evp", "itc", "electronic voice", "spirit box"]):
        return "evp"
    elif any(word in text_lower for word in ["psychic", "medium", "clairvoyant", "telepathy"]):
        return "metaphysical"
    elif any(word in text_lower for word in ["history", "historic", "ancient", "artifact"]):
        return "history"
    else:
        return "general"

def save_events(events):
    """Save events to JSON file"""
    # Remove duplicates based on title
    seen = set()
    unique_events = []
    for event in events:
        key = event.get("title", "").lower().strip()
        if key not in seen:
            seen.add(key)
            unique_events.append(event)
    
    # Sort by date
    unique_events.sort(key=lambda x: x.get("startDate", "") or "")
    
    # Save to file
    output = {
        "lastUpdated": datetime.now().isoformat(),
        "totalEvents": len(unique_events),
        "events": unique_events
    }
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(unique_events)} events to {OUTPUT_FILE}")
    return unique_events

def main():
    print("Fetching paranormal events...")
    print("=" * 50)
    
    all_events = []
    
    # Fetch from Eventbrite
    print("\n1. Fetching from Eventbrite...")
    eventbrite_events = fetch_eventbrite_events()
    print(f"   Found {len(eventbrite_events)} events from Eventbrite")
    all_events.extend(eventbrite_events)
    
    # Fetch from Meetup
    print("\n2. Fetching from Meetup...")
    meetup_events = fetch_meetup_events()
    print(f"   Found {len(meetup_events)} events from Meetup")
    all_events.extend(meetup_events)
    
    # Save events
    print("\n" + "=" * 50)
    print(f"Total events fetched: {len(all_events)}")
    saved_events = save_events(all_events)
    
    # Print summary
    print("\nEvent Summary:")
    print(f"  - Investigations: {len([e for e in saved_events if e.get('type') == 'investigation'])}")
    print(f"  - Conferences: {len([e for e in saved_events if e.get('type') == 'conference'])}")
    print(f"  - Meetups: {len([e for e in saved_events if e.get('type') == 'meetup'])}")
    print(f"  - Workshops: {len([e for e in saved_events if e.get('type') == 'workshop'])}")
    print(f"  - Live Streams: {len([e for e in saved_events if e.get('type') == 'livestream'])}")
    print(f"  - Tours: {len([e for e in saved_events if e.get('type') == 'tour'])}")
    print(f"  - Other: {len([e for e in saved_events if e.get('type') == 'other'])}")
    
    print(f"\nEvents saved to: {OUTPUT_FILE}")
    print("Open the events page to see the results!")

if __name__ == "__main__":
    main()