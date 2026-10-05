#!/usr/bin/env python3
"""
TPI Event Scraper v2
Scrapes ONLY paranormal, metaphysical, supernatural events
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

# Eventbrite search URLs (paranormal-specific)
EVENTBRITE_URLS = [
    "https://www.eventbrite.com/d/online/paranormal-investigation/",
    "https://www.eventbrite.com/d/online/ghost-hunting/",
    "https://www.eventbrite.com/d/online/paranormal-conference/",
    "https://www.eventbrite.com/d/online/evp-spirit-box/",
    "https://www.eventbrite.com/d/united-states/paranormal-investigation/",
    "https://www.eventbrite.com/d/united-states/ghost-hunting/",
    "https://www.eventbrite.com/d/united-states/haunted-house-investigation/",
]

# Meetup search URLs
MEETUP_URLS = [
    "https://www.meetup.com/find/?keywords=paranormal+investigation&location=us",
    "https://www.meetup.com/find/?keywords=ghost+hunting&location=us",
]

# MUST match at least one to be considered paranormal
PARANORMAL_KEYWORDS = [
    # Ghosts & Hauntings
    "paranormal", "ghost", "haunt", "spirit", "supernatural", "evp", "itc",
    "investigation", "hunt", "entity", "apparition", "poltergeist",
    "spectral", "ethereal", "ectoplasm", "spirit box", "emf",
    "haunted", "ghostly", "investigator", "night vision",
    "séance", "seance", "ouija", "divination",
    "possession", "exorcism", "demon", "dark entities",
    
    # UFOs & Aliens
    "ufo", "uap", "alien", "extraterrestrial", "abduction",
    "flying saucer", "sighting", "close encounter", "contactee",
    "greys", "greys", "roswell", "area 51", "disclosure",
    "spacecraft", "orb", "light phenomenon",
    
    # Cryptids
    "cryptid", "bigfoot", "sasquatch", "yeti", "chupacabra",
    "mothman", "wendigo", "skinwalker", "thunderbird",
    "lake monster", "nessie", "ogopogo", "beast",
    
    # Psychic & Metaphysical
    "psychic", "medium", "clairvoyant", "clairaudient", "clairsentient",
    "telepathy", "telekinesis", "telepathic", "precognition",
    "remote viewing", "astral projection", "out of body", "obe",
    "near death", "nde", "past life", "reincarnation", "regression",
    "channeling", "channeling", "trance", "automatic writing",
    "aura", "chakra", "reiki", "energy healing", "healing touch",
    
    # Consciousness & Experience
    "consciousness", "altered state", "expanded consciousness",
    "mystical", "transcendent", "spiritual awakening",
    "kundalini", "third eye", "pineal", "dmt", "ayahuasca",
    "lucid dream", "premonition", "intuition", "synchronicity",
    
    # Witchcraft & Occult
    "witch", "witchcraft", "wicca", "pagan", "occult",
    "ritual", "spell", "magick", "ceremony", "initiation",
    "tarot", "astrology", "numerology", "crystal",
    "herb", "potion", "talisman", "amulet", "grimoire",
    
    # Parapsychology & Research
    "parapsychology", "anomalous", "phenomenon", "fortean",
    "unexplained", "mystery", "investigation", "research",
    "field investigation", "baseline", "controlled experiment",
    "skeptic", "debunk", "evidence", "documentation",
    
    # General
    "paranormal country", "tpi", "the paranormal initiative",
    "ghost tour", "haunted tour", "paranormal expo",
    "ghost convention", "paranormal conference"
]

# Keywords to EXCLUDE
EXCLUDE_KEYWORDS = [
    "coding", "programming", "software", "tech meetup", "startup",
    "yoga", "meditation class", "wellness retreat", "fitness",
    "cooking class", "recipe", "food tour", "dinner party",
    "dance class", "salsa", "tango", "ballroom",
    "music concert", "band", "dj night", "rave",
    "art class", "painting class", "craft workshop",
    "book club", "reading group",
    "networking event", "business meetup", "marketing",
    "sports", "football", "basketball", "soccer",
    "gaming tournament", "video game", "esports", "anime con"
]


def is_paranormal_event(title, description=""):
    """Check if event is actually paranormal-related"""
    text = f"{title} {description}".lower()
    
    # Check for exclude keywords first
    for keyword in EXCLUDE_KEYWORDS:
        if keyword in text:
            return False
    
    # Must match at least one paranormal keyword
    for keyword in PARANORMAL_KEYWORDS:
        if keyword in text:
            return True
    
    return False


def scrape_eventbrite():
    """Scrape events from Eventbrite"""
    events = []
    
    for url in EVENTBRITE_URLS:
        try:
            print(f"  Scraping: {url}")
            response = requests.get(url, headers=HEADERS, timeout=15)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
                event_links = soup.select('a.event-card-link')
                
                for link in event_links[:30]:
                    try:
                        title = link.get('aria-label', '').replace('View ', '').strip()
                        location = link.get('data-event-location', '')
                        event_url = link.get('href', '')
                        event_id = link.get('data-event-id', '')
                        
                        parent = link.find_parent('div', class_='event-card')
                        card_text = parent.get_text(strip=True) if parent else ''
                        
                        # Skip if not paranormal
                        if not is_paranormal_event(title, card_text):
                            continue
                        
                        # Extract date
                        date_match = re.search(r'(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?(?:\s*[A-Z]{2,4})?)', card_text)
                        date_text = date_match.group(0).strip() if date_match else ''
                        date_text = re.sub(r'\s*[A-Z]{2,4}$', '', date_text).strip()
                        
                        # Parse location
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
                        
                        # Check title for virtual
                        if any(w in title.lower() for w in ['online', 'virtual', 'live stream', 'livestream']):
                            is_virtual = True
                        
                        # Extract venue
                        venue = ''
                        if not is_virtual and location.lower() != 'online':
                            venue_match = re.search(r'(?:AM|PM|EDT|CDT|MDT|PDT|GMT)(.*?)(?:Save|Share)', card_text)
                            venue = venue_match.group(1).strip() if venue_match else ''
                            if '·' in venue:
                                venue = venue.split('·')[-1].strip()
                            venue = venue.replace('Â·', '').strip()
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
                                "category": classify_category(title + " " + card_text),
                                "startDate": date_text,
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
                event_links = soup.select('a[href*="/events/"]')
                
                for link in event_links[:30]:
                    try:
                        full_text = link.text.strip()
                        if len(full_text) < 10:
                            continue
                        
                        title = re.sub(r'(Every|Mon|Tue|Wed|Thu|Fri|Sat|Sun).*$', '', full_text).strip()
                        title = re.sub(r'\d{1,2}:\d{2}\s*(AM|PM).*$', '', title).strip()
                        title = re.sub(r'^\w{3},?\s*', '', title).strip()
                        
                        if not title or len(title) < 5:
                            title = full_text[:80].strip()
                        
                        # Skip if not paranormal
                        if not is_paranormal_event(title, full_text):
                            continue
                        
                        event_url = link.get("href", "")
                        if event_url and not event_url.startswith("http"):
                            event_url = f"https://www.meetup.com{event_url}"
                        
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


def classify_event_type(title):
    """Classify event type based on title"""
    title_lower = title.lower()
    
    if any(w in title_lower for w in ["investigation", "ghost hunt", "hunt", "explore"]):
        return "investigation"
    elif any(w in title_lower for w in ["conference", "con", "symposium", "summit", "expo"]):
        return "conference"
    elif any(w in title_lower for w in ["meetup", "meet-up", "meet up", "group"]):
        return "meetup"
    elif any(w in title_lower for w in ["workshop", "class", "training", "learn"]):
        return "workshop"
    elif any(w in title_lower for w in ["live", "stream", "broadcast"]):
        return "livestream"
    elif any(w in title_lower for w in ["lecture", "talk", "presentation", "speaker"]):
        return "lecture"
    elif any(w in title_lower for w in ["festival", "fair", "convention"]):
        return "festival"
    elif any(w in title_lower for w in ["tour", "walk", "walking"]):
        return "tour"
    elif any(w in title_lower for w in ["séance", "seance", "evp", "spirit box"]):
        return "investigation"
    else:
        return "other"


def classify_category(text):
    """Classify event category based on text"""
    text_lower = text.lower()
    
    if any(w in text_lower for w in ["ghost", "haunt", "spirit", "apparition", "poltergeist"]):
        return "ghosts"
    elif any(w in text_lower for w in ["ufo", "uap", "alien", "extraterrestrial"]):
        return "ufo"
    elif any(w in text_lower for w in ["cryptid", "bigfoot", "sasquatch", "monster", "creature"]):
        return "cryptid"
    elif any(w in text_lower for w in ["evp", "itc", "electronic voice", "spirit box"]):
        return "evp"
    elif any(w in text_lower for w in ["psychic", "medium", "clairvoyant", "telepathy", "reiki"]):
        return "metaphysical"
    elif any(w in text_lower for w in ["history", "historic", "ancient", "artifact"]):
        return "history"
    elif any(w in text_lower for w in ["witch", "witchcraft", "occult", "divination"]):
        return "occult"
    elif any(w in text_lower for w in ["demon", "exorcism", "possession", "dark"]):
        return "demonic"
    else:
        return "paranormal"


def save_events(events):
    """Save events to JSON file"""
    seen = set()
    unique_events = []
    for event in events:
        key = event.get("title", "").lower().strip()
        if key not in seen:
            seen.add(key)
            unique_events.append(event)
    
    unique_events.sort(key=lambda x: x.get("startDate", "") or "")
    
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
    print("TPI Event Scraper v2 — Paranormal Only")
    print("=" * 50)
    
    all_events = []
    
    print("\n1. Scraping Eventbrite...")
    eventbrite_events = scrape_eventbrite()
    print(f"   Found {len(eventbrite_events)} paranormal events")
    all_events.extend(eventbrite_events)
    
    print("\n2. Scraping Meetup...")
    meetup_events = scrape_meetup()
    print(f"   Found {len(meetup_events)} paranormal events")
    all_events.extend(meetup_events)
    
    print("\n" + "=" * 50)
    print(f"Total paranormal events: {len(all_events)}")
    saved_events = save_events(all_events)
    
    print("\nEvent Summary:")
    print(f"  - Investigations: {len([e for e in saved_events if e.get('type') == 'investigation'])}")
    print(f"  - Conferences: {len([e for e in saved_events if e.get('type') == 'conference'])}")
    print(f"  - Meetups: {len([e for e in saved_events if e.get('type') == 'meetup'])}")
    print(f"  - Workshops: {len([e for e in saved_events if e.get('type') == 'workshop'])}")
    print(f"  - Tours: {len([e for e in saved_events if e.get('type') == 'tour'])}")
    print(f"  - Séances/EVP: {len([e for e in saved_events if e.get('type') == 'investigation'])}")
    print(f"  - Other: {len([e for e in saved_events if e.get('type') == 'other'])}")
    
    print(f"\nCategories:")
    print(f"  - Ghosts/Hauntings: {len([e for e in saved_events if e.get('category') == 'ghosts'])}")
    print(f"  - UFO/UAP: {len([e for e in saved_events if e.get('category') == 'ufo'])}")
    print(f"  - EVP/ITC: {len([e for e in saved_events if e.get('category') == 'evp'])}")
    print(f"  - Metaphysical: {len([e for e in saved_events if e.get('category') == 'metaphysical'])}")
    print(f"  - Occult: {len([e for e in saved_events if e.get('category') == 'occult'])}")
    print(f"  - Paranormal: {len([e for e in saved_events if e.get('category') == 'paranormal'])}")


if __name__ == "__main__":
    main()