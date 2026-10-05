# TPI Site Streamlining Game Plan

## Overview

This document outlines the strategy for streamlining The Paranormal Initiative website to make it easier to navigate while still showcasing all the content and features that make TPI a premier paranormal/ITC community.

**Test Environment:** `/Users/toddknipple/Desktop/paranormal-initiative-website`
**Live Site:** `https://paranormalinitiative.com/` (GitHub + Cloudflare)

**IMPORTANT:** This test site is used to prototype and validate changes before applying them to the live site. All changes documented here should be replicated to the live site once approved.

## Live Site Rules

When working on the live site (GitHub/Cloudflare):
1. **ONLY modify:** UI, CSS, HTML files
2. **DO NOT TOUCH:** StudioFlow (TPI Studio) — it is complete and working
3. **ADD:** TPI Reels page to the live site
4. **Backend:** Already configured with Cloudflare Workers, D1 Database, R2 Storage

---

## Core Principle

**Show depth without drowning the user.**

TPI is a premier paranormal/ITC community — the content depth is a STRENGTH. But the presentation needs to let users:
1. **Start simple** — Clear entry points
2. **Go deeper** — Progressive disclosure
3. **Explore freely** — But with guidance

---

## Game Plan: 3 Layers

### Layer 1: Entry Points (Homepage)
**Goal:** 30-second overview of what TPI is

**Current:** 23 cards, wall of text
**Proposed:** 6 cards + 1 featured section

```
┌─────────────────────────────────────────────────┐
│  HERO: "Responsible research into the           │
│         unexplained" + 3 buttons                │
├─────────────────────────────────────────────────┤
│  FEATURED CAROUSEL (4 items)                    │
│  [Latest Video] [New Article] [EVP Lab] [Reels] │
├─────────────────────────────────────────────────┤
│  START HERE (4 cards)                           │
│  [New to TPI] [Education] [Repository] [Videos] │
├─────────────────────────────────────────────────┤
│  WHAT WE DO (brief text, no cards)              │
├─────────────────────────────────────────────────┤
│  COMMUNITY PREVIEW                              │
│  [Latest forum posts or activity]               │
├─────────────────────────────────────────────────┤
│  COLLABORATION CTA                              │
│  [Advisory Invitation] [Contact]                │
└─────────────────────────────────────────────────┘
```

**Remove from homepage:**
- "What We Do" 6 cards → Move to About page
- "Research & Education" 3 cards → Education Center has them
- "Field & Evidence" 3 cards → Repository has them
- "Experimentation & Tools" 3 cards → Education Center has them

**Result:** 23 cards → 4 cards + carousel

---

### Layer 2: Section Hubs (Navigation Pages)
**Goal:** Clear overview of each section with organized sub-navigation

**Current:** Education Center has 50 cards in a flat grid
**Proposed:** Grouped into clear categories with expandable sections

#### Education Center Redesign
```
┌─────────────────────────────────────────────────┐
│  HERO: "Research Library & Field Papers"        │
├─────────────────────────────────────────────────┤
│  QUICK START (3 cards)                          │
│  [Investigation Dev] [Ghostology] [EVP/ITC]     │
├─────────────────────────────────────────────────┤
│  RESEARCH TOPICS (accordion/expandable)         │
│  ▸ Investigation Science (6 articles)           │
│  ▸ Evidence Science & Analysis (5 articles)     │
│  ▸ EVP & ITC Research (4 articles)              │
│  ▸ Consciousness & Human Experience (3 articles)│
│  ▸ Environmental Research (4 articles)          │
│  ▸ Historical & Cultural Research (3 articles)  │
│  ▸ Ethics & Professional Standards (3 articles) │
│  ▸ Reporting & Documentation (4 articles)       │
├─────────────────────────────────────────────────┤
│  HONORARY MEMBERS (profiles)                    │
├─────────────────────────────────────────────────┤
│  SEARCH                                         │
└─────────────────────────────────────────────────┘
```

**Result:** 50 cards → 3 quick-start cards + expandable categories

#### Repository Redesign
```
┌─────────────────────────────────────────────────┐
│  HERO: "Educational Repository"                 │
├─────────────────────────────────────────────────┤
│  SHELF: Foundation (2 guides)                   │
│  [Field Encyclopedia] [Terminology]             │
├─────────────────────────────────────────────────┤
│  SHELF: Field Operations (1 guide)              │
│  [Investigation Compendium]                     │
├─────────────────────────────────────────────────┤
│  SHELF: Evidence Review (2 guides)              │
│  [Forensic Analysis] [Evidence Compendium]      │
├─────────────────────────────────────────────────┤
│  PATHWAYS (reading paths)                       │
└─────────────────────────────────────────────────┘
```

**Result:** Already clean (5 guides) — just polish

---

### Layer 3: Content Pages (Articles/Papers)
**Goal:** Consistent, readable, easy to navigate between related content

**Current:** Each article is standalone
**Proposed:** Add navigation between related articles

```
┌─────────────────────────────────────────────────┐
│  BREADCRUMB: Education > Investigation Science  │
├─────────────────────────────────────────────────┤
│  ARTICLE CONTENT                                │
├─────────────────────────────────────────────────┤
│  RELATED ARTICLES (3-4 cards)                   │
├─────────────────────────────────────────────────┤
│  PREV / NEXT navigation                         │
└─────────────────────────────────────────────────┘
```

---

## Specific Page Improvements

### 1. Homepage (Priority: HIGH)
- [x] Remove "What We Do" 6 cards (moved to About page)
- [x] Remove "Research & Education" 3 cards (Education Center has them)
- [x] Remove "Field & Evidence" 3 cards (Repository has them)
- [x] Remove "Experimentation & Tools" 3 cards (Education Center has them)
- [x] Keep: Hero + Carousel + 4 "Start Here" cards + Collaboration CTA
- [x] Add: Community preview section (Forum, Reels, Live)
- [x] Fix spacing between Community and Collaboration sections

**Result:** 23 cards → 4 cards + carousel + 3 community cards

**New Structure:**
```
Hero (3 buttons)
↓
Start Here (4 cards)
↓
Featured Carousel (4 items)
↓
Community (3 cards)
↓
Collaboration CTA
```

### 2. Education Center (Priority: HIGH)
- [x] Replace flat grid with accordion/categories
- [x] Add "Quick Start" section (3 recommended starting points)
- [x] Group education pages into 8 categories
- [x] Add search functionality
- [x] Add contributor profiles section
- [x] Fix card layout — 3 cards in a row on desktop
- [x] Add spacing between Research Topics and More Resources
- [x] Center count pills in accordion headers

**Result:** 50 flat cards → 3 quick-start cards + 8 expandable categories with articles

### 3. Community Forum (Priority: MEDIUM)
- [ ] Already well-designed — just polish
- [ ] Add category icons/colors
- [ ] Better empty states

### 4. Member Home (Priority: MEDIUM)
- [ ] Simplify profile section
- [ ] Add activity feed
- [ ] Quick links to key features

### 5. Repository (Priority: LOW)
- [ ] Already clean — just polish styling

### 6. Content Pages (Priority: LOW)
- [ ] Add breadcrumbs
- [ ] Add related articles
- [ ] Add prev/next navigation

---

## Navigation Improvements

### Current Sidebar (20+ items)
```
Alerts
  - Notifications
  - Your Feed
TPI
  - Home
  - About
  - Our Apps
  - Education Center
  - Repository
  - Haunted Locations
  - Standards & Ethics
  - Advisory Board
  - Search
  - Contact & Links
Video & Studio
  - TPI Reels
  - TPI Videos
  - TPI Studio
Community
  - Community Forum
  - Chat
  - Activity (coming)
Content Tools
  - Content Editor
You
  - Profile
  - Saved (coming)
  - Settings
  - Admin Panel
  - Log Out
```

### Proposed Sidebar (grouped better)
```
MAIN
  - Home
  - Your Feed
  - Notifications

COMMUNITY
  - Forum
  - Chat
  - Reels

RESEARCH
  - Education Center
  - Repository
  - EVP/ITC Research

MEDIA
  - TPI Videos
  - Live Studio
  - Podcast

TOOLS
  - Content Editor
  - Our Apps

ACCOUNT
  - Profile
  - Settings
  - Admin Panel
  - Log Out
```

**Changes:**
- "Saved" and "Activity" hidden until ready
- "About", "Standards", "Advisory Board", "Search", "Contact" moved to footer or secondary nav
- "Haunted Locations" moved to Repository section
- Grouped by function, not by feature type

---

## Visual Improvements

### Cards
- [x] Use consistent card sizes in grids
- [x] Add subtle hover effects (already done)
- [x] Use icons for visual interest
- [x] Limit to 3-4 cards per row on desktop
- [x] All cards rounded to 24px (--radius-lg) site-wide (51 card/panel classes)
- [x] All hardcoded border-radius values replaced with CSS variables
- [x] Universal card styles applied site-wide (homepage as source of truth)
- [x] Purple hue added to all cards (border, glow, background tint)

### Typography
- [x] Clear hierarchy: H1 > H2 > H3 > Body > Meta
- [x] Consistent spacing between sections
- [x] Max 2 font sizes per section
- [x] Bolder headings, improved line heights

### Color
- [x] Already consistent (purple/black)
- [x] Use accent color sparingly for CTAs
- [x] Muted colors for secondary content
- [x] Purple hue added to all cards (border, glow, background tint)
- [x] Category badges system (10 color-coded types)

### Visual Elements
- [x] TPI-branded visual elements added
- [x] Logo mark, accent bar, glow effects, patterns
- [x] Featured content hero section
- [x] Category badges for content types
- [x] Enhanced card depth with shadows and gradients
- [x] TPI logo added to homepage and sidebar (transparent PNG)

### Whitespace
- [x] More breathing room between sections
- [x] Larger padding on cards
- [x] Don't fill every pixel

---

## Implementation Order

### Phase 1: Homepage Simplification (Quick Win)
1. Remove excess cards from homepage
2. Add community preview section
3. Test and refine

### Phase 2: Education Center Redesign (Big Impact)
1. Create accordion/category system
2. Group 32 education pages into categories
3. Add Quick Start section
4. Add search

### Phase 3: Navigation Cleanup
1. Reorganize sidebar
2. Move secondary items to footer
3. Test user flow

### Phase 4: Content Page Polish
1. Add breadcrumbs
2. Add related articles
3. Add prev/next navigation

### Phase 5: Dashboard Enhancements (New — Based on Parapost Comparison) — NOT part of live deployment
No Phase 5 items shipped with the Oct 4 live deploy; they remain future work.
- [ ] Add right sidebar with widgets (trending, people discovery, recently viewed)
- [ ] Add activity stats bar (feed counts, likes, comments, shares)
- [ ] Add rich composer (investigation notes, EVP clips, location reports, photos, videos)
- [ ] Add status indicators (online dots, "New" badges, activity timestamps)
- [ ] Add people discovery section (new members, suggested connections)
- [ ] Add trending topics section
- [ ] Add bottom mobile navigation bar

### Phase 6: Public Landing & Discovery (New — Based on Paranormal Country Comparison)
- [x] Events page created with featured event, filters, and event cards
- [x] Event card design with actual images (date badge, type badge, location, time, RSVP)
- [x] Filter system (All, Investigations, Conferences, Meetups, Workshops, Live Streams)
- [x] RSVP functionality with toggle
- [x] Submit Event CTA linked to submission form
- [x] Added to sidebar navigation (Community section, "New" tag)
- [x] Admin event entry form (admin-events.html)
- [x] Community event submission form (submit-event.html)
- [x] Form formatting fixed and polished
- [x] **Members Home / Feed merged (Oct 4, 2026)** — Your Feed folded into the HOME page: composer front and center, community feed (Activity / Posts / Published Content tabs), sidebar Home renamed "Members Home / Feed" and the separate Your Feed item removed; explore.html kept for deep links
- [x] **Settings / Profile split + Home rename (Oct 4, 2026)** — member-dashboard.html is Settings-only (Login Settings + Color Theme); new member-profile.html holds the profile (identity, email verification, full form); sidebar Profile rewired, header greeting button → Home, nav label back to "Home", and Home gained a My Content counts strip; page-header/identity hooks fixed so the Profile page no longer inherits "Settings" labels
- [x] **Profile card + hero actions consolidated (Oct 5, 2026)** — the member-home identity card now tops member-profile.html; the hero beneath it carries a single ☺ Edit Profile button that smooth-scrolls to the profile form, replacing the Settings / Open Content Editor / Sign Out cluster
- [ ] Redesign public landing page (match Paranormal Country polish)
- [ ] Add interactive haunt map (map-based location directory)
- [ ] Add Press/Media page (showcase coverage, press kit)
- [ ] Add seasonal content (Halloween features, investigation season guides)
- [ ] Add "Free to join" messaging (lower barrier to entry)
- [ ] Add Games/Quizzes (location puzzles, case-file quizzes)

### Phase 7: API Integration (Planned — Not Started)
- [ ] Eventbrite API for paranormal events
- [ ] Meetup API for paranormal groups
- [ ] Facebook Events API (requires app review)
- [ ] D1 database schema for events
- [ ] API endpoints for events CRUD
- [ ] Connect admin form to database
- [ ] Connect community form to database
- [ ] Automated daily/weekly event scraping

### Phase 8: Live Site Deployment
- [x] Apply all UI/CSS/HTML changes to live site (GitHub/Cloudflare) — **DONE Oct 4, 2026**: full redesign merged onto the live repo via git 3-way merge (test base commit existed in live history, so no live-only work was lost), all 39 touched files + reels.html + tpi-banner/logo assets
- [x] Add TPI Reels page to live site — reels.html deployed with sidebar link + NEW tag
- [x] DO NOT modify StudioFlow (TPI Studio) — studio/ bundle untouched; Teams Directory keeps its own blue/green theme by design
- [x] Post-merge fixes applied on live: `body.member-mode .portal-button-secondary` was overriding the new button theme with old dark-on-dark colors (invisible buttons) — now uses design-system variables; style.css cache-bust unified to v=80 across all pages
- [x] Live-only features preserved in the merge: Paranormal Teams Directory, member notifications, Resend email verification/reset, admin teams queue
- [x] **Events section deployed to live (Oct 4, 2026)** — events.html / submit-event.html / admin-events.html migrated from the desktop copy with purple literals converted to the six-theme token system; sidebar Events + Manage Events (admin-only); OG tags, search index, sitemap; admin-events gated to owner/admin

### Phase 9: TPI Creator Studio (Future Build)

---

## Success Metrics

- **Homepage:** User understands TPI in 30 seconds
- **Education Center:** User can find specific topic in 3 clicks
- **Navigation:** User can reach any page in 2-3 clicks
- **Content:** User can explore related content easily

---

*Created: October 3, 2026*