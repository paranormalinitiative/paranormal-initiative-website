#!/usr/bin/env python3
"""
TPI Event Scraper
Scrapes paranormal events from Eventbrite and Meetup public pages
"""

import requests
import json
import os
import re
from datetime import datetime
from bs4 import BeautifulSoup

# Output file
OUTPUT_FILE = "/Users/toddknipple/Desktop/paranormal-initiative-website/events-data.json"

# Headers to mimic browser
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

# Eventbrite search URLs
EVENTBRITE_URLS = [
    "https://www.eventbrite.com/d/online/paranormal-events/",
    "https://www.eventbrite.com/d/online/ghost-hunting/",
    "https://www.eventbrite.com/d/online/haunted-events/",
    "https://www.eventbrite.com/d/online/ufo-events/",
    "https://www.eventbrite.com/d/online/supernatural-events/",
    "https://www.eventbrite.com/d/united-states/paranormal-events/",
    "https://www.eventbrite.com/d/united-states/ghost-hunting/",
]

# Meetup search URLs
MEETUP_URLS = [
    "https://www.meetup.com/find/?keywords=paranormal&location=us",
    "https://www.meetup.com/find/?keywords=ghost+hunting&location=us",
    "https://www.meetup.com/find/?keywords=ufo&location=us",
    "https://www.meetup.com/find/?keywords=haunted&location=us",
]

def scrape_eventbrite():
    """Scrape events from Eventbrite"""
    events = []
    
    for url in EVENTBRITE_URLS:
        try:
            print(f"  Scraping: {url}")
            response = requests.get(url, headers=HEADERS, timeout=15)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
                
                # Find event links (they have the data we need)
                event_links = soup.select('a.event-card-link')
                
                for link in event_links[:30]:
                    try:
                        # Get data from attributes
                        title = link.get('aria-label', '').replace('View ', '').strip()
                        location = link.get('data-event-location', '')
                        event_url = link.get('href', '')
                        event_id = link.get('data-event-id', '')
                        
                        # Get parent card for more info
                        parent = link.find_parent('div', class_='event-card')
                        card_text = parent.get_text(strip=True) if parent else ''
                        
                        # Extract date from card text
                        # Pattern: "Sat, Oct 31, 7:00 PM" or "Mon, Jan 15, 8:00 PM EDT"
                        date_match = re.search(r'(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?(?:\s*[A-Z]{2,4})?)', card_text)
                        date_text = date_match.group(0).strip() if date_match else ''
                        # Clean date - remove trailing timezone artifacts
                        date_text = re.sub(r'\s*[A-Z]{2,4}$', '', date_text).strip()
                        
                        # Parse city from location
                        city = ''
                        state = ''
                        is_virtual = False
                        if location:
                            if location.lower() == 'online':
                                is_virtual = True
                            else:
                                parts = location.split(',')
                                city = parts[0].strip() if parts else ''
                                state = parts[-1].strip() if len(parts) > 1 else ''
                        
                        # Check title for virtual indicators
                        if 'online' in title.lower() or 'virtual' in title.lower() or 'live stream' in title.lower():
                            is_virtual = True
                        
                        # Extract venue from card text (only for non-virtual events)
                        venue = ''
                        if not is_virtual and location.lower() != 'online':
                            venue_match = re.search(r'(?:AM|PM|EDT|CDT|MDT|PDT|GMT)(.*?)(?:Save|Share)', card_text)
                            venue = venue_match.group(1).strip() if venue_match else ''
                            # Clean venue - remove city prefix and dots
                            if '·' in venue:
                                venue = venue.split('·')[-1].strip()
                            venue = venue.replace('Â·', '').strip()
                            # Remove timezone artifacts
                            venue = re.sub(r'^[A-Z]{2,4}\s*\+\s*\d+\s*more', '', venue).strip()
                        
                        # Get image
                        img_elem = link.select_one('img')
                        image_url = img_elem.get('src', '') if img_elem else ''
                        
                        if title:
                            events.append({
                                "id": f"eb_{event_id}" if event_id else f"eb_{len(events)}",
                                "title": title,
                                "description": "",
                                "type": classify_event_type(title),
                                "category": classify_category(title),
                                "startDate": parse_date(date_text),
                                "endDate": "",
                                "locationName": venue,
                                "address": "",
                                "city": city,
                                "state": state,
                                "country": "United States",
                                "isVirtual": is_virtual,
                                "imageUrl": image_url,
                                "organizer": "",
                                "organizerUrl": "",
                                "url": event_url,
                                "source": "eventbrite",
                                "status": "approved"
                            })
                    except Exception as e:
                        continue
            else:
                print(f"    Status: {response.status_code}")
                
        except Exception as e:
            print(f"    Error: {e}")
    
    return events

def scrape_meetup():
    """Scrape events from Meetup"""
    events = []
    
    for url in MEETUP_URLS:
        try:
            print(f"  Scraping: {url}")
            response = requests.get(url, headers=HEADERS, timeout=15)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
                
                # Find event links (Meetup uses /events/ URLs)
                event_links = soup.select('a[href*="/events/"]')
                
                for link in event_links[:30]:
                    try:
                        full_text = link.text.strip()
                        
                        # Skip if too short
                        if len(full_text) < 10:
                            continue
                        
                        # Parse the text - format is usually:
                        # "TitleDate · Time · Location"
                        # or "TitleDate · Time · Online"
                        
                        # Extract title (first line or before date pattern)
                        lines = full_text.split('\n')
                        title = lines[0].strip() if lines else full_text[:100]
                        
                        # Clean up title - remove date/time patterns
                        title = re.sub(r'(Every|Mon|Tue|Wed|Thu|Fri|Sat|Sun).*$', '', title).strip()
                        title = re.sub(r'\d{1,2}:\d{2}\s*(AM|PM).*$', '', title).strip()
                        title = re.sub(r'^\w{3},?\s*', '', title).strip()
                        
                        if not title or len(title) < 5:
                            title = full_text[:80].strip()
                        
                        # Get event URL
                        event_url = link.get("href", "")
                        if event_url and not event_url.startswith("http"):
                            event_url = f"https://www.meetup.com{event_url}"
                        
                        # Determine if virtual
                        is_virtual = "online" in full_text.lower() or "virtual" in full_text.lower()
                        
                        events.append({
                            "id": f"mu_{len(events)}",
                            "title": title,
                            "description": "",
                            "type": classify_event_type(title),
                            "category": classify_category(title),
                            "startDate": "",
                            "endDate": "",
                            "locationName": "Online" if is_virtual else "",
                            "address": "",
                            "city": "",
                            "state": "",
                            "country": "United States",
                            "isVirtual": is_virtual,
                            "imageUrl": "",
                            "organizer": "",
                            "organizerUrl": "",
                            "url": event_url,
                            "source": "meetup",
                            "status": "approved"
                        })
                    except Exception as e:
                        continue
            else:
                print(f"    Status: {response.status_code}")
                
        except Exception as e:
            print(f"    Error: {e}")
    
    return events

def scrape_facebook_events():
    """Scrape public Facebook events (limited)"""
    events = []
    
    # Facebook pages for paranormal groups
    pages = [
        "https://www.facebook.com/paranormalsociety/events/",
        "https://www.facebook.com/ghosthunters/events/",
        "https://www.facebook.com/ufosightings/events/",
    ]
    
    for url in pages:
        try:
            print(f"  Scraping Facebook: {url}")
            response = requests.get(url, headers=HEADERS, timeout=15)
            
            if response.status_code == 200:
                # Facebook requires login for events, so this is limited
                soup = BeautifulSoup(response.text, "html.parser")
                
                # Try to find event links
                event_links = soup.select("a[href*='/events/']")
                
                for link in event_links[:10]:
                    title = link.text.strip()
                    if title and len(title) > 5:
                        events.append({
                            "id": f"fb_{len(events)}",
                            "title": title,
                            "description": "",
                            "type": classify_event_type(title),
                            "category": classify_category(title),
                            "startDate": "",
                            "endDate": "",
                            "locationName": "",
                            "address": "",
                            "city": "",
                            "state": "",
                            "country": "United States",
                            "isVirtual": False,
                            "imageUrl": "",
                            "organizer": "",
                            "organizerUrl": "",
                            "url": f"https://facebook.com{link.get('href', '')}",
                            "source": "facebook",
                            "status": "approved"
                        })
        except Exception as e:
            print(f"    Error: {e}")
    
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

def parse_date(date_text):
    """Try to parse date from text"""
    if not date_text:
        return ""
    
    # Common date formats
    formats = [
        "%B %d, %Y",
        "%b %d, %Y",
        "%m/%d/%Y",
        "%Y-%m-%d",
        "%B %d",
        "%b %d",
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_text.strip(), fmt).isoformat()
        except:
            continue
    
    return date_text

def extract_city(location):
    """Extract city from location string"""
    if not location:
        return ""
    
    # Try to find city after comma
    parts = location.split(",")
    if len(parts) > 0:
        return parts[0].strip()
    return location

def extract_state(location):
    """Extract state from location string"""
    if not location:
        return ""
    
    parts = location.split(",")
    if len(parts) > 1:
        return parts[-1].strip()
    return ""

def save_events(events):
    """Save events to JSON file"""
    # Remove duplicates based on title
    seen = set()
    unique_events = []
    for event in events:
        key = event.get("title", "").lower().strip()
        if key not in seen and key:
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
    
    print(f"\nSaved {len(unique_events)} events to {OUTPUT_FILE}")
    return unique_events

def main():
    print("TPI Event Scraper")
    print("=" * 50)
    print("Scraping paranormal events from public sources...")
    print()
    
    all_events = []
    
    # Scrape Eventbrite
    print("1. Scraping Eventbrite...")
    eventbrite_events = scrape_eventbrite()
    print(f"   Found {len(eventbrite_events)} events")
    all_events.extend(eventbrite_events)
    
    # Scrape Meetup
    print("\n2. Scraping Meetup...")
    meetup_events = scrape_meetup()
    print(f"   Found {len(meetup_events)} events")
    all_events.extend(meetup_events)
    
    # Scrape Facebook
    print("\n3. Scraping Facebook...")
    facebook_events = scrape_facebook_events()
    print(f"   Found {len(facebook_events)} events")
    all_events.extend(facebook_events)
    
    # Save events
    print("\n" + "=" * 50)
    print(f"Total events scraped: {len(all_events)}")
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
    print("Open events.html to see the results!")

if __name__ == "__main__":
    main()