# TPI-OPS-017 — Browser Route Acceptance

Verified: 2026-11-13  
Browser: Firefox (Playwright-managed isolated Firefox build; Developer Edition was not Playwright-compatible)  
Origin: http://127.0.0.1:8787  
Source inventory: TPI-OPS-017 in-scope HTML inventory

## Scope

This matrix performs one sequential browser pass over the 234 in-scope HTML
files using one anonymous context and one authenticated context per synthetic
role. All Haunted Location books, five standalone Repository books, and three
shared HTML fragments are excluded. Requests are permitted only to loopback
ports 8787 and 8788; external requests are blocked before dispatch. Interactive
checks are then performed on representative administrator, member,
contributor, StudioFlow, ParaTube, and public/education pages.

## Summary

- In-scope HTML files checked: **234**
- PASS: **227**
- PASS WITH LIMITATIONS: **7**
- FAIL: **0**
- BLOCKED: **0**
- NOT VERIFIED: **0**
- Focused checks passed: **61/61**
- Unexpected browser/console/request issues on application routes: **0**
- External requests dispatched: **0**

## Classification rules

- PASS means the selected role received the expected local response, the
  document rendered non-empty content, and no local request/page errors were
  observed.
- PASS WITH LIMITATIONS means the route passed with an expected redirect,
  page-specific access behavior, known source/research artifact status, or a
  blocked external asset that did not affect the local application route.
- FAIL means the route did not render or produced an unexpected local failure.
- Four internal source/experiment entry files and one Creator Studio test page
  are classified as non-application artifacts, not broken visitor routes.

## Focused browser areas

- PASS — administrator synthetic session (role session established)
- PASS — contributor synthetic session (role session established)
- PASS — member synthetic session (role session established)
- PASS — administrator dashboard renders (HTTP 200)
- PASS — local development banner is absent (banner absent)
- PASS — administrator navigation exposes 30 menu items (count=30)
- PASS — administrator navigation item: Overview (active indicator)
- PASS — administrator navigation item: Analytics (active indicator)
- PASS — administrator navigation item: Activity (active indicator)
- PASS — administrator navigation item: Member Directory (active indicator)
- PASS — administrator navigation item: Roles & Permissions (active indicator)
- PASS — administrator navigation item: Account Restrictions (active indicator)
- PASS — administrator navigation item: Community Overview (active indicator)
- PASS — administrator navigation item: Posts & Comments (active indicator)
- PASS — administrator navigation item: Reactions (active indicator)
- PASS — administrator navigation item: Reports & Moderation (active indicator)
- PASS — administrator navigation item: Moderation History (active indicator)
- PASS — administrator navigation item: Creator Directory (active indicator)
- PASS — administrator navigation item: Founding 50 (active indicator)
- PASS — administrator navigation item: Founding Memberships (active indicator)
- PASS — administrator navigation item: Creator Studio Access (active indicator)
- PASS — administrator navigation item: Creator Channels (active indicator)
- PASS — administrator navigation item: Leadership (active indicator)
- PASS — administrator navigation item: Board Members (active indicator)
- PASS — administrator navigation item: Contributor Management (active indicator)
- PASS — administrator navigation item: Editorial Review (active indicator)
- PASS — administrator navigation item: Paranormal Teams (active indicator)
- PASS — administrator navigation item: Education Center (active indicator)
- PASS — administrator navigation item: Article Comment Moderation (active indicator)
- PASS — administrator navigation item: TPI Videos (active indicator)
- PASS — administrator navigation item: Events (active indicator)
- PASS — administrator navigation item: Notifications (active indicator)
- PASS — administrator navigation item: Platform Health (active indicator)
- PASS — administrator navigation item: Security (active indicator)
- PASS — administrator navigation item: Audit Logs (active indicator)
- PASS — administrator navigation item: System Settings (active indicator)
- PASS — administrator return-to-member-home controls (controls=4)
- PASS — member home renders (HTTP 200)
- PASS — community feed tab opens (tab state)
- PASS — messenger opens from member navigation (visibleElements=3)
- PASS — member route renders: /member-notifications (HTTP 200)
- PASS — member route renders: /member-profile (HTTP 200)
- PASS — member route renders: /member-dashboard (HTTP 200)
- PASS — notifications list is present (HTTP 200)
- PASS — contributor route renders: /paper-editor (HTTP 200)
- PASS — contributor route renders: /creator-videos (HTTP 200)
- PASS — contributor route renders: /contributor-profile (HTTP 200)
- PASS — contributor route renders: /submit-event (HTTP 200)
- PASS — creator channel slug validation accepts valid values and rejects spaces (no submission)
- PASS — /member-login username validation compiles and enforces no spaces (no submission)
- PASS — /member-dashboard username validation compiles and enforces no spaces (no submission)
- PASS — StudioFlow page renders for administrator (HTTP 200)
- PASS — StudioFlow local room API is reachable (HTTP 200)
- PASS — optional StudioFlow room server status is recorded without blocking page audit (not running locally; separate from page/theme checks)
- PASS — ParaTube homepage renders (HTTP 200)
- PASS — ParaTube exposes video navigation (links=3)
- PASS — TPI video listing renders (HTTP 200)
- PASS — public page renders: / (HTTP 200)
- PASS — public page renders: /about.html (HTTP 200)
- PASS — public page renders: /education-center.html (HTTP 200)
- PASS — public page renders: /repository.html (HTTP 200)

## Route matrix

| Route | Title | Area | Browser role | HTTP | Final path | Render | JavaScript errors | Asset failures | API failures | Interactive | Classification | Limitations |
| --- | --- | --- | --- | ---: | --- | --- | ---: | ---: | ---: | --- | --- | --- |
| `/about.html` | About \| The Paranormal Initiative | Public | anonymous | 200 | /about.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/advisory-board-invitation.html` | Professional Advisory Board Invitation \| The Paranormal Initiative | Public | anonymous | 200 | /advisory-board-invitation.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/advisory-board.html` | Professional Advisory Board \| The Paranormal Initiative | Public | anonymous | 200 | /advisory-board.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ai.html` | Artificial Intelligence \| The Paranormal Initiative | Public | anonymous | 200 | /ai.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/bug-report.html` | Report a bug \| The Paranormal Initiative | Member | member | 200 | /bug-report.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/command-center.html` | Command Center \| The Paranormal Initiative | Public | anonymous | 200 | /command-center.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/community-home.html` | Local Member \| The Paranormal Initiative | Member | member | 200 | /member-home | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/contributor-invite.html` | Contributor Invite \| The Paranormal Initiative | Contributor | contributor | 200 | /contributor-invite.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/creator-videos.html` | My Creator Videos \| The Paranormal Initiative | Contributor | contributor | 200 | /creator-videos.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/early-access.html` | Contact & Links \| The Paranormal Initiative | Public | anonymous | 200 | /early-access.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/events.html` | Events \| The Paranormal Initiative | Public | anonymous | 200 | /events.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/explore.html` | Your Feed \| The Paranormal Initiative | Member | member | 200 | /explore.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/haunted-locations.html` | Haunted Locations \| The Paranormal Initiative | Public | anonymous | 200 | /haunted-locations.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/honorary-member-collections.html` | Honorary Member Collections \| The Paranormal Initiative | Member | member | 200 | /honorary-member-collections.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/` | The Paranormal Initiative \| Research, Investigation, Education, and Technology | Public | anonymous | 200 | / | PASS | 0 | 0 | 0 | PASS | PASS |  |
| `/live-video.html` | Live Video Studio \| The Paranormal Initiative | StudioFlow / ParaTube | anonymous | 200 | /live-video.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/news.html` | ParaNews \| Paranormal News & Headlines \| The Paranormal Initiative | Public | anonymous | 200 | /news.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/our-apps.html` | Our Apps \| The Paranormal Initiative | Public | anonymous | 200 | /our-apps.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/paratube.html` | ParaTube \| Paranormal Videos \| The Paranormal Initiative | StudioFlow / ParaTube | anonymous | 200 | /paratube.html | PASS | 0 | 0 | 0 | PASS WITH LIMITATIONS | PASS |  |
| `/podcast.html` | Podcast Studio \| The Paranormal Initiative | Public | anonymous | 200 | /podcast.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/reels.html` | TPI Reels \| The Paranormal Initiative | Member | member | 200 | /reels.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/repository-pathways.html` | Repository Pathways \| The Paranormal Initiative | Education / Research | anonymous | 200 | /repository-pathways.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/repository.html` | Repository \| The Paranormal Initiative | Education / Research | anonymous | 200 | /repository.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/search.html` | Search \| The Paranormal Initiative | Public | anonymous | 200 | /search.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/standards.html` | Professional Standards & Ethics \| The Paranormal Initiative | Education / Research | anonymous | 200 | /standards.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/submit-event.html` | Submit Event \| The Paranormal Initiative | Contributor | contributor | 200 | /submit-event.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/tpi-channel.html` | TPI Creator Channel | Public | anonymous | 200 | /tpi-channel.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/tpi-video.html` | TPI Video \| The Paranormal Initiative | StudioFlow / ParaTube | anonymous | 200 | /tpi-video.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/tpi-videos.html` | TPI Videos \| The Paranormal Initiative | StudioFlow / ParaTube | anonymous | 200 | /tpi-videos.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/watch-history.html` | Watch History \| The Paranormal Initiative | Member | member | 200 | /watch-history.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/watch-later.html` | Watch Later \| The Paranormal Initiative | Member | member | 200 | /watch-later.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-area-artificial-intelligence.html` | Artificial Intelligence \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-area-artificial-intelligence.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-area-consciousness-human-experience.html` | Consciousness & Human Experience \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-area-consciousness-human-experience.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-area-education-community-development.html` | Community Development & Publication \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-area-education-community-development.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-area-environmental-research.html` | Environmental Research \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-area-environmental-research.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-area-ethics-professional-standards.html` | Ethics & Professional Standards \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-area-ethics-professional-standards.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-area-evidence-science-analysis.html` | Evidence Science & Analysis \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-area-evidence-science-analysis.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-area-evp-itc-research.html` | EVP & ITC Research \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-area-evp-itc-research.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-area-historical-cultural-research.html` | Historical & Cultural Research \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-area-historical-cultural-research.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-area-instrumentation-technology.html` | Instrumentation & Technology \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-area-instrumentation-technology.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-area-investigation-science.html` | Investigation Science \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-area-investigation-science.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-area-reporting-documentation.html` | Reporting & Documentation \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-area-reporting-documentation.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-area-technology-development-ai.html` | Technology Development \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-area-technology-development-ai.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-center.html` | Education Center \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-center.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-audio-photo-video-review.html` | Introduction to Audio, Photo, and Video Review \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-research-audio-photo-video-review.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-choosing-researching-location.html` | How Beginners Choose and Research a Location \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-research-choosing-researching-location.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-debunking-natural-explanations.html` | Debunking Basics and Natural Explanations \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-research-debunking-natural-explanations.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-equipment-what-tools-measure.html` | Introduction to Equipment and What Tools Actually Measure \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-research-equipment-what-tools-measure.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-field-safety-permission.html` | Basic Field Safety and Permission \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-research-field-safety-permission.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-foundational-terminology-paranormal-research.html` | Basic Terminology and Foundational Language \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-research-foundational-terminology-paranormal-research.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-historical-records-local-legends-cemeteries-oral-history.html` | Historical Records, Local Legends, Cemeteries, and Oral History \| The Paranormal Initiati | Education / Research | anonymous | 200 | /education-research-historical-records-local-legends-cemeteries-oral-history.htm | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-history-hauntings-folklore-psychical-research.html` | History of Hauntings, Folklore, Ghost Hunting, and Psychical Research \| The Paranormal In | Education / Research | anonymous | 200 | /education-research-history-hauntings-folklore-psychical-research.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-investigation-ethics-professional-conduct.html` | Investigation Ethics and Professional Conduct \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-research-investigation-ethics-professional-conduct.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-motivations-meaning-paranormal-experience.html` | Personal Experience, Curiosity, Belief, Fear, Grief, Social Media, and the Search for Mean | Education / Research | anonymous | 200 | /education-research-motivations-meaning-paranormal-experience.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-observation-note-taking.html` | Basic Observation and Note-Taking \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-research-observation-note-taking.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-professional-documentation-reporting.html` | Professional Investigation Documentation and Reporting \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-research-professional-documentation-reporting.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-psychological-triggers-paranormal-experiences.html` | Psychological Triggers of Paranormal Experiences \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-research-psychological-triggers-paranormal-experiences.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-spiritual-religious-demonic-claim-language.html` | Spiritual, Religious, and Demonic-Claim Language \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-research-spiritual-religious-demonic-claim-language.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-types-hauntings-claim-categories.html` | Types of Hauntings and Claim Categories \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-research-types-hauntings-claim-categories.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-weather-environment-building-science-causes.html` | Weather, Environment, and Building-Science Causes \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-research-weather-environment-building-science-causes.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-what-is-ghost-hunting.html` | What Is Ghost Hunting? \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-research-what-is-ghost-hunting.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-what-is-paranormal-investigation.html` | What Is Paranormal Investigation? \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-research-what-is-paranormal-investigation.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/education-research-why-investigate-paranormal.html` | Why People Choose to Investigate the Paranormal \| The Paranormal Initiative | Education / Research | anonymous | 200 | /education-research-why-investigate-paranormal.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-acs-evp-itc-phonetic-data.html` | Aetheric Communication System For EVP & ITC Research \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-acs-evp-itc-phonetic-data.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-aether-spectra-sls-seeing-beyond-visible.html` | Aether Spectra SLS: Seeing Beyond The Visible \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-aether-spectra-sls-seeing-beyond-visible.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-aetherspectra-sls-development-update.html` | AetherSpectra SLS Development Update \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-aetherspectra-sls-development-update.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-aetherspectra-sls-for-apple-users.html` | AetherSpectra SLS For Apple Users \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-aetherspectra-sls-for-apple-users.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-ai-truth-behind-it.html` | Let's Talk About AI And The Truth Behind It \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-ai-truth-behind-it.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-applied-paranormal-research-and-studies.html` | What Is The Paranormal Initiative About? \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-applied-paranormal-research-and-studies.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-baseline-readings.html` | Baseline Readings: Establishing What Is Normal \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-baseline-readings.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-belief-vs-investigation.html` | Belief Vs Investigation \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-belief-vs-investigation.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-burden-of-proof.html` | The Burden Of Proof Lies On The Person Making The Claim \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-burden-of-proof.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-canoe-creek-limestone-kilns-could-talk.html` | What If The Canoe Creek Limestone Kilns Could Talk? \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-canoe-creek-limestone-kilns-could-talk.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-claims-vs-evidence.html` | Lesson 3: Claims Vs Evidence — Know The Difference \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-claims-vs-evidence.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-community-first-focus.html` | When You Investigate A Location, What Do You Focus On First? \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-community-first-focus.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-contamination-before-investigation.html` | How Contamination Begins Before The Investigation Starts \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-contamination-before-investigation.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-emf-challenge-phone-distance.html` | EMF Challenge: How Close Before It Spikes? \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-emf-challenge-phone-distance.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-emotional-testimony-objective-observation.html` | Lesson 6: Emotional Testimony Vs. Objective Observation \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-emotional-testimony-objective-observation.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-energy-consciousness-soul-remembers.html` | Are The Energies Created By Death Still Consciousness? \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-energy-consciousness-soul-remembers.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-entertainment-vs-investigation.html` | Entertainment Vs Investigation: Understanding The Difference \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-entertainment-vs-investigation.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-environmental-red-flags.html` | Environmental Red Flags Most Investigators Miss \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-environmental-red-flags.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-evp-voices-we-didnt-hear.html` | EVP: The Voices We Didn't Hear \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-evp-voices-we-didnt-hear.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-faked-evidence-misinterpretation.html` | Faked Evidence, Misinterpretation, And Investigator Responsibility \| The Paranormal Initi | Education / Research | anonymous | 200 | /investigation-development-faked-evidence-misinterpretation.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-fort-roberdeau-never-fell-silent.html` | What If Fort Roberdeau Never Truly Fell Silent? \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-fort-roberdeau-never-fell-silent.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-ghost-boxes-radio-scanning-phoneme-systems.html` | Ghost Boxes, Radio Scanning, And Why Phoneme-Based Systems Matter \| The Paranormal Initia | Education / Research | anonymous | 200 | /investigation-development-ghost-boxes-radio-scanning-phoneme-systems.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-ghostology-101-academy-introduction.html` | Ghostology 101: Introduction To Ghost Hunting & Paranormal Investigation \| The Paranormal | Education / Research | anonymous | 200 | /investigation-development-ghostology-101-academy-introduction.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-haunted-locations-why-they-matter.html` | Haunted Locations: Why They Matter \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-haunted-locations-why-they-matter.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-how-do-we-know-paranormal.html` | How Do We Really Know What Is and What Isn't Paranormal? \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-how-do-we-know-paranormal.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-intake-most-important-step.html` | Lesson 2: The Intake Is The Most Important Step \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-intake-most-important-step.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-join-the-mission-community-group.html` | Join The Mission \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-join-the-mission-community-group.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-k2-cell-phone-field-experiment.html` | K2 Meter Vs Cell Phones \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-k2-cell-phone-field-experiment.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-k2-meters-mobile-devices.html` | K2 Meters & Mobile Devices \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-k2-meters-mobile-devices.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-k2-meters-paid-events.html` | K2 Meters At Paid Haunted-Location Events \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-k2-meters-paid-events.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-kittens-door-creaking-experience.html` | The Door Creaking Open At 4 AM \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-kittens-door-creaking-experience.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-neurodivergent-minds-paranormal-differently.html` | Could Neurodivergent Minds Experience The Paranormal Differently? \| The Paranormal Initia | Education / Research | anonymous | 200 | /investigation-development-neurodivergent-minds-paranormal-differently.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-new-investigator-read-this-first.html` | If You're New To Paranormal Investigation, Read This First \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-new-investigator-read-this-first.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-not-all-orbs-are-the-same.html` | Not All Orbs Are The Same \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-not-all-orbs-are-the-same.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-not-every-evp-is-obvious.html` | Not Every EVP Is Meant To Be Obvious \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-not-every-evp-is-obvious.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-not-everything-unexplained-is-paranormal.html` | Not Everything Unexplained Is Paranormal \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-not-everything-unexplained-is-paranormal.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-not-here-to-change-how-you-investigate.html` | We Are Not Here To Change How You Investigate \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-not-here-to-change-how-you-investigate.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-old-perfume-transient-visitor.html` | The Old Perfume At 2:30 AM \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-old-perfume-transient-visitor.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-original-goal-of-itc-research.html` | What Was The Original Goal Of ITC Research? \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-original-goal-of-itc-research.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-our-values-our-standard-our-commitment.html` | Our Values, Our Standard, Our Commitment \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-our-values-our-standard-our-commitment.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-personal-experiences-not-proof.html` | Personal Experiences Are Not Proof Of The Paranormal \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-personal-experiences-not-proof.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-raising-the-standards.html` | Raising The Standards Of Paranormal Investigation \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-raising-the-standards.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-role-of-the-investigator.html` | Lesson 7: The Role Of The Investigator \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-role-of-the-investigator.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-series.html` | Investigation Development Series \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-series.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-seven-principles.html` | The 7 Principles of The Paranormal Initiative \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-seven-principles.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-thirty-years-real-investigations.html` | Thirty Years Of Real Investigations \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-thirty-years-real-investigations.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-thunderstorms-paranormal-activity.html` | Do Thunderstorms Increase Paranormal Activity? \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-thunderstorms-paranormal-activity.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-true-science-paranormal-investigation.html` | The True Science Of Paranormal Investigation \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-true-science-paranormal-investigation.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-truth-vs-validation-thought-for-day.html` | Truth Does Not Care What We Want It To Be \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-truth-vs-validation-thought-for-day.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-types-of-hauntings.html` | Understanding The Different Types Of Hauntings \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-types-of-hauntings.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-understanding-patterns.html` | Lesson 4: Understanding Patterns In Paranormal Claims \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-understanding-patterns.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-understanding-sls-cameras.html` | Understanding SLS Cameras \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-understanding-sls-cameras.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-voices-behind-the-investigations.html` | The Voices Behind The Investigations \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-voices-behind-the-investigations.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-walkthrough-first-investigation.html` | Lesson 8: The Walkthrough Is Your First Investigation \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-walkthrough-first-investigation.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-walkthrough-what-to-look-for.html` | What You Should Be Looking For During A Walkthrough \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-walkthrough-what-to-look-for.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-walkthroughs-baseline-readings.html` | Why Are Walkthroughs And Baseline Readings So Important? \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-walkthroughs-baseline-readings.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-welcome-to-the-paranormal-initiative.html` | Welcome To The Paranormal Initiative \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-welcome-to-the-paranormal-initiative.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-what-are-you-actually-investigating.html` | Day 1: What Are You Actually Investigating? \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-what-are-you-actually-investigating.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-what-is-itc-research-trying-to-accomplish.html` | What Is ITC Research Really Trying To Accomplish? \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-what-is-itc-research-trying-to-accomplish.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-where-investigation-leaves-science-behind.html` | Where Paranormal Investigation Leaves Science Behind \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-where-investigation-leaves-science-behind.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-why-investigations-fail.html` | Lesson 5: Why Most Investigations Fail Before They Begin \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-why-investigations-fail.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/investigation-development-why-some-people-see-ghosts.html` | Why Some People See Ghosts While Others Don't \| The Paranormal Initiative | Education / Research | anonymous | 200 | /investigation-development-why-some-people-see-ghosts.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-01.html` | Lesson 01: Why do you want to investigate the paranormal? \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-01.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-02.html` | Lesson 02: What is ghost hunting? \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-02.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-03.html` | Lesson 03: What is paranormal investigation? \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-03.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-04.html` | Lesson 04: Personal experience, curiosity, belief, fear, grief, social media, and the sear | Education / Research | anonymous | 200 | /ghostology-101-lesson-04.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-05.html` | Lesson 05: Basic terminology and foundational language \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-05.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-06.html` | Lesson 06: History of hauntings, folklore, ghost hunting, and psychical research \| Ghosto | Education / Research | anonymous | 200 | /ghostology-101-lesson-06.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-07.html` | Lesson 07: Types of hauntings and claim categories \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-07.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-08.html` | Lesson 08: How beginners choose and research a location \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-08.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-09.html` | Lesson 09: Historical records, local legends, cemeteries, and oral history \| Ghostology 1 | Education / Research | anonymous | 200 | /ghostology-101-lesson-09.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-10.html` | Lesson 10: Weather, environment, and building-science causes \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-10.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-11.html` | Lesson 11: Psychological triggers of paranormal experiences \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-11.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-12.html` | Lesson 12: Spiritual, religious, and demonic-claim language \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-12.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-13.html` | Lesson 13: Introduction to equipment and what tools actually measure \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-13.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-14.html` | Lesson 14: Basic observation and note-taking \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-14.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-15.html` | Lesson 15: Basic field safety and permission \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-15.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-16.html` | Lesson 16: Intro to audio, photo, and video review \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-16.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-17.html` | Lesson 17: Debunking basics and natural explanations \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-17.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-18.html` | Lesson 18: Investigation Ethics and Professional Conduct \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-18.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-19.html` | Lesson 19: Professional Investigation Documentation and Reporting \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-19.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101-lesson-20.html` | Lesson 20: Ghostology 101 Final Review and Next Steps \| Ghostology 101 | Education / Research | anonymous | 200 | /ghostology-101-lesson-20.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/ghostology-101.html` | Ghostology 101 \| The Paranormal Initiative | Education / Research | anonymous | 200 | /ghostology-101.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-animal-voices-2-surya-nisha.html` | Animal Voices 2: Surya and Nisha, My Beloved \| Anabela Cardoso \| The Paranormal Initiati | Public | anonymous | 200 | /anabela-cardoso-animal-voices-2-surya-nisha.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-animal-voices-3-1-first-abandoned.html` | Animal Voices 3.1: So the First Abandoned... \| Anabela Cardoso \| The Paranormal Initiati | Public | anonymous | 200 | /anabela-cardoso-animal-voices-3-1-first-abandoned.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-animal-voices-other-manifestations.html` | Animal Voices and Other Manifestations \| Anabela Cardoso \| The Paranormal Initiative | Public | anonymous | 200 | /anabela-cardoso-animal-voices-other-manifestations.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-dear-readers-fascinating-occurrences.html` | Dear Readers... \| Anabela Cardoso \| The Paranormal Initiative | Public | anonymous | 200 | /anabela-cardoso-dear-readers-fascinating-occurrences.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-instrumental-transcommunication-itc-evidence.html` | Instrumental Transcommunication (ITC) Evidence \| Anabela Cardoso \| The Paranormal Initia | Public | anonymous | 200 | /anabela-cardoso-instrumental-transcommunication-itc-evidence.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-introduction-radioelectric-frequencies.html` | Introduction to the Radioelectric Frequencies \| Anabela Cardoso \| The Paranormal Initiat | Public | anonymous | 200 | /anabela-cardoso-introduction-radioelectric-frequencies.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-itc-journal-42-radioelectric-frequencies.html` | ITC Journal 42: Radioelectric Frequencies \| Anabela Cardoso \| The Paranormal Initiative | Public | anonymous | 200 | /anabela-cardoso-itc-journal-42-radioelectric-frequencies.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-itc-personal-results-guidance-method.html` | ITC Personal Results and Guidance on Method \| Anabela Cardoso \| The Paranormal Initiativ | Education / Research | anonymous | 200 | /anabela-cardoso-itc-personal-results-guidance-method.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-itc-transpersonal-connection.html` | ITC: A Transpersonal Connection \| Anabela Cardoso \| The Paranormal Initiative | Public | anonymous | 200 | /anabela-cardoso-itc-transpersonal-connection.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-itc-voices-contact-with-another-reality.html` | ITC Voices: Contact with Another Reality \| Anabela Cardoso \| The Paranormal Initiative | Public | anonymous | 200 | /anabela-cardoso-itc-voices-contact-with-another-reality.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-jochem-sotschek-itc-journal.html` | Jochem Sotschek in ITC Journal \| Anabela Cardoso \| The Paranormal Initiative | Public | anonymous | 200 | /anabela-cardoso-jochem-sotschek-itc-journal.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-neuroquantology-september-2012-volume-10.html` | NeuroQuantology, September 2012, Volume 10 \| Anabela Cardoso \| The Paranormal Initiative | Public | anonymous | 200 | /anabela-cardoso-neuroquantology-september-2012-volume-10.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-note-on-witnesses.html` | Note on the Witnesses to My... \| Anabela Cardoso \| The Paranormal Initiative | Public | anonymous | 200 | /anabela-cardoso-note-on-witnesses.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-papers.html` | Anabela Cardoso Papers \| The Paranormal Initiative | Public | anonymous | 200 | /anabela-cardoso-papers.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-paranormal-review-itc-paper.html` | Paranormal Review ITC Paper \| Anabela Cardoso \| The Paranormal Initiative | Public | anonymous | 200 | /anabela-cardoso-paranormal-review-itc-paper.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-prof-hans-bender-friedrich-jurgenson-anomalous-voices.html` | Prof. Hans Bender on F. Jurgenson's Anomalous Voices \| Anabela Cardoso \| The Paranormal  | Public | anonymous | 200 | /anabela-cardoso-prof-hans-bender-friedrich-jurgenson-anomalous-voices.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-profile.html` | Anabela Cardoso \| Honorary Member \| The Paranormal Initiative | Public | anonymous | 200 | /anabela-cardoso-profile.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-radioelectric-frequencies-rio-do-tempo.html` | The Radioelectric Frequencies of Rio do Tempo \| Anabela Cardoso \| The Paranormal Initiat | Public | anonymous | 200 | /anabela-cardoso-radioelectric-frequencies-rio-do-tempo.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-soul-of-the-cat.html` | The Soul of the Cat \| Anabela Cardoso \| The Paranormal Initiative | Public | anonymous | 200 | /anabela-cardoso-soul-of-the-cat.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-technicians-message-translation.html` | Technicians' Message Translation \| Anabela Cardoso \| The Paranormal Initiative | Public | anonymous | 200 | /anabela-cardoso-technicians-message-translation.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/anabela-cardoso-two-year-investigation-electronic-voices.html` | A Two-Year Investigation of the Allegedly Anomalous Electronic Voices or EVP \| Anabela Ca | Education / Research | anonymous | 200 | /anabela-cardoso-two-year-investigation-electronic-voices.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/evp-itc-lesson-acs-philosophy.html` | ACS Research Philosophy \| EVP / ITC Experimentation | Education / Research | anonymous | 200 | /evp-itc-lesson-acs-philosophy.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/evp-itc-lesson-contamination-controls.html` | Contamination & Controls \| EVP / ITC Experimentation | Education / Research | anonymous | 200 | /evp-itc-lesson-contamination-controls.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/evp-itc-lesson-evp-basics.html` | EVP Basics \| EVP / ITC Experimentation | Education / Research | anonymous | 200 | /evp-itc-lesson-evp-basics.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/evp-itc-lesson-itc-basics.html` | ITC Basics \| EVP / ITC Experimentation | Education / Research | anonymous | 200 | /evp-itc-lesson-itc-basics.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/evp-itc-lesson-review-language.html` | Review Language \| EVP / ITC Experimentation | Education / Research | anonymous | 200 | /evp-itc-lesson-review-language.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/evp-itc-lesson-water-steam.html` | Water & Steam ITC \| EVP / ITC Experimentation | Education / Research | anonymous | 200 | /evp-itc-lesson-water-steam.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/evp-itc-lessons.html` | EVP / ITC Experimentation \| The Paranormal Initiative | Education / Research | anonymous | 200 | /evp-itc-lessons.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/evp-itc-research.html` | EVP / ITC Research \| The Paranormal Initiative | Education / Research | anonymous | 200 | /evp-itc-research.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/steam-itc.html` | Steam ITC \| The Paranormal Initiative | Public | anonymous | 200 | /steam-itc.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/water-itc.html` | Water ITC \| The Paranormal Initiative | Public | anonymous | 200 | /water-itc.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/environment.html` | Environmental Intelligence \| The Paranormal Initiative | Education / Research | anonymous | 200 | /environment.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/equipment-audio-recorders.html` | Audio Recorders \| Equipment & Technology | Education / Research | anonymous | 200 | /equipment-audio-recorders.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/equipment-cameras-video.html` | Cameras & Video \| Equipment & Technology | Education / Research | anonymous | 200 | /equipment-cameras-video.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/equipment-emf-k2-meters.html` | EMF & K2 Meters \| Equipment & Technology | Education / Research | anonymous | 200 | /equipment-emf-k2-meters.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/equipment-environmental-sensors.html` | Environmental Sensors \| Equipment & Technology | Education / Research | anonymous | 200 | /equipment-environmental-sensors.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/equipment-spirit-boxes-experimental-devices.html` | Spirit Boxes & Experimental Devices \| Equipment & Technology | Education / Research | anonymous | 200 | /equipment-spirit-boxes-experimental-devices.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/equipment-technology.html` | Equipment & Technology \| The Paranormal Initiative | Education / Research | anonymous | 200 | /equipment-technology.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/equipment-thermal-tools.html` | Thermal Tools \| Equipment & Technology | Education / Research | anonymous | 200 | /equipment-thermal-tools.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/equipment.html` | Investigation Equipment \| The Paranormal Initiative | Education / Research | anonymous | 200 | /equipment.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/software-use.html` | Software Use Terms \| The Paranormal Initiative | Public | anonymous | 200 | /software-use.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/tools.html` | Investigation Workflow \| Paranormal Pro | Education / Research | anonymous | 200 | /tools.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/analysis.html` | Analysis Labs \| The Paranormal Initiative | Education / Research | anonymous | 200 | /analysis.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/field-articles.html` | Field Articles \| The Paranormal Initiative | Public | anonymous | 200 | /field-articles.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/method-exercises.html` | Method Exercises \| The Paranormal Initiative | Education / Research | anonymous | 200 | /method-exercises.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/paper-editor.html` | Nova Editorial Workspace \| The Paranormal Initiative | Contributor | contributor | 200 | /paper-editor.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/paranormal-investigation.html` | Paranormal Investigation \| The Paranormal Initiative | Education / Research | anonymous | 200 | /paranormal-investigation.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/published-article.html` | Published Article \| The Paranormal Initiative | Public | anonymous | 200 | /published-article.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/published-article/index.html` | Published Article \| The Paranormal Initiative | Public | anonymous | 200 | /published-article/index.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/reports.html` | Reporting & Documentation \| The Paranormal Initiative | Public | anonymous | 200 | /reports.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/contributor-profile.html` | Contributor Profile \| The Paranormal Initiative | Contributor | contributor | 200 | /contributor-profile.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/friends.html` | Friends \| The Paranormal Initiative | Member | member | 200 | /friends.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/leadership-profile.html` | Sol \| Leadership \| The Paranormal Initiative | Public | anonymous | 200 | /leadership-profile.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/member-dashboard.html` | Settings \| The Paranormal Initiative | Member | member | 200 | /member-dashboard.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/member-files.html` | Your Files \| The Paranormal Initiative | Member | member | 200 | /member-files.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/member-home.html` | Local Member \| The Paranormal Initiative | Member | member | 200 | /member-home.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/member-login.html` | Member Login \| The Paranormal Initiative | Member | member | 200 | /member-login.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/member-notifications.html` | Notifications \| The Paranormal Initiative | Member | member | 200 | /member-notifications.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/member-photos.html` | Your Photos \| The Paranormal Initiative | Member | member | 200 | /member-photos.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/member-profile.html` | Update Profile \| The Paranormal Initiative | Member | member | 200 | /member-profile.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/member-videos.html` | Your Videos \| The Paranormal Initiative | Member | member | 200 | /member-videos.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/teams/add.html` | Add a Team \| TPI Paranormal Teams Directory | Public | anonymous | 200 | /teams/add.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/teams/admin.html` | Team Approvals \| TPI Paranormal Teams Directory | Administrator | admin | 200 | /teams/admin.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/teams/browse.html` | Find a Team \| TPI Paranormal Teams Directory | Public | anonymous | 200 | /teams/find.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/teams/find.html` | Find a Team \| TPI Paranormal Teams Directory | Public | anonymous | 200 | /teams/find.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/teams/index.html` | Paranormal Teams Directory \| The Paranormal Initiative | Public | anonymous | 200 | /teams/index.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/teams/search.html` | Search \| TPI Paranormal Teams Directory | Public | anonymous | 200 | /teams/search.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/teams/team.html` | Team Listing \| TPI Paranormal Teams Directory | Public | anonymous | 200 | /teams/team.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/admin-advanced-settings.html` | Advanced Page Settings \| The Paranormal Initiative | Administrator | admin | 200 | /admin-advanced-settings.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/admin-center-app/index.html` | Problem loading page | Administrator | admin | ERROR | /admin-center-app/index.html | NOT APPLICABLE | 0 | 0 | 0 | NOT_SELECTED | PASS WITH LIMITATIONS | source/research artifact is not a Worker-served application route |
| `/admin-center-preview/index.html` | TPI Administration Center | Administrator | admin | 200 | /admin-center-preview/index.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/admin-events.html` | Manage Events \| The Paranormal Initiative | Administrator | admin | 200 | /admin-events.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/admin-panel.html` | TPI Administration Center | Administrator | admin | 200 | /admin-panel | PASS | 0 | 0 | 0 | PASS | PASS |  |
| `/app-acs.html` | ACS Aetheric Communication System \| The Paranormal Initiative | Public | anonymous | 200 | /app-acs.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/app-aether-spectra-sls.html` | Aether Spectra SLS \| The Paranormal Initiative | Public | anonymous | 200 | /app-aether-spectra-sls.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/app-itc-visual-studio.html` | ITC Visual Studio \| The Paranormal Initiative | Member | member | 200 | /app-itc-visual-studio.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/app-paranormal-initiative.html` | The Paranormal Initiative App \| The Paranormal Initiative | Public | anonymous | 200 | /app-paranormal-initiative.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/content-editor-nova/content-editor.html` | Nova Content Editor Mode | Public | anonymous | 200 | /content-editor-nova/content-editor.html | NOT APPLICABLE | 0 | 0 | 0 | NOT_SELECTED | PASS WITH LIMITATIONS | embedded editor bootstrap; it intentionally renders only when mounted by the authenticated Paper Editor |
| `/experiments/nova-spike/index.html` | Problem loading page | Public | anonymous | ERROR | /experiments/nova-spike/index.html | NOT APPLICABLE | 0 | 0 | 0 | NOT_SELECTED | PASS WITH LIMITATIONS | source/research artifact is not a Worker-served application route |
| `/itc-visual-studio/Resources/VisualITCLab_User_Manual.html` | ITC Visual Studio / Browser Version - User Manual | Member | member | 200 | /itc-visual-studio/Resources/VisualITCLab_User_Manual.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/itc-visual-studio/index.html` | ITC Visual Studio / Browser Version | Member | member | 200 | /itc-visual-studio/index.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/nova-app/content-editor.html` | Problem loading page | Public | anonymous | ERROR | /nova-app/content-editor.html | NOT APPLICABLE | 0 | 0 | 0 | NOT_SELECTED | PASS WITH LIMITATIONS | source/research artifact is not a Worker-served application route |
| `/nova-app/index.html` | Problem loading page | Public | anonymous | ERROR | /nova-app/index.html | NOT APPLICABLE | 0 | 0 | 0 | NOT_SELECTED | PASS WITH LIMITATIONS | source/research artifact is not a Worker-served application route |
| `/nova/index.html` | Nova — Restricted Access \| The Paranormal Initiative | Public | anonymous | 403 | /nova/index.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS WITH LIMITATIONS | page-specific authentication gate observed anonymously |
| `/studio/assets/tpi033-real-test.html` | Problem loading page | Administrator | admin | ERROR | /studio/assets/tpi033-real-test.html | NOT APPLICABLE | 0 | 0 | 0 | NOT_SELECTED | PASS WITH LIMITATIONS | source/research artifact is not a Worker-served application route |
| `/studio/index.html` | StudioFlow | Administrator | admin | 200 | /studio/index.html | PASS | 0 | 0 | 0 | PASS WITH LIMITATIONS | PASS |  |
| `/.freebuff/theme-preview.html` | TPI Theme Lab — pick with your eyes | Public | anonymous | 200 | /.freebuff/theme-preview.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |
| `/social-feed-lab/index.html` | TPI Social Feed Lab | Member | member | 200 | /social-feed-lab/index.html | PASS | 0 | 0 | 0 | NOT_SELECTED | PASS |  |

## Safety observations

- Synthetic credentials were read from the existing mode-0600 local fixture and
  were never printed.
- No production or public-development origins were contacted.
- No database or storage mutation was performed by this harness.
- No RealtimeKit room, livestream, recording session, or media upload was
  started.
- External browser requests observed by the guard were blocked before dispatch.
