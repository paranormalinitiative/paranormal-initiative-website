# TPI-OPS-015 — Page and Capability Inventory

Verified: 2026-10-17  
Source: canonical repository filesystem plus sequential loopback checks against http://127.0.0.1:8787.

## Scope and method

This inventory is generated from every HTML page in the canonical repository,
excluding the three known shared fragments header.html, footer.html, and
member-sidebar.html. Each page was requested sequentially from the local
Worker with redirects held for observation. No hosted Worker, external API, or
public service was contacted. A status of 200, 3xx, or an intentional 403
means the route was accounted for; 5xx and request errors remain failures or
blocked dependencies.

## Inventory totals

- HTML documents discovered: **287**
- Page routes inventoried: **284**
- Shared HTML fragments excluded from page count: **3**
- API route literals identified in functions/api/[[path]].js: **90**
- API route patterns identified in source: **93**
- Routes with HTTP 5xx or request errors: **0**

### Page groups

| Group | Pages |
| --- | ---: |
| Administrator | 6 |
| Authentication / Access | 1 |
| Contributor | 5 |
| Education / Research | 141 |
| Member | 15 |
| Public | 109 |
| StudioFlow / ParaTube | 7 |

### Runtime response counts

| Result | Pages |
| --- | ---: |
| HTTP 200 | 1 |
| HTTP 307 | 269 |
| HTTP 403 | 10 |
| HTTP 404 | 4 |

## Capability and access interpretation

| Capability | Source of truth | Local verification status |
| --- | --- | --- |
| Public pages and research/education pages | HTML source and Worker asset serving | Route inventory completed; pages with 200/3xx were route-verified. Browser interaction was not performed for every static document. |
| Authentication and member pages | worker.js, member-shell.js, lib/auth.js | OPS-009/011 and OPS-015 browser checks passed; local sessions are synthetic only. |
| Administrator pages and APIs | requireAdmin, admin HTML gate, functions/api/[[path]].js | Admin page/API read verification passed; 26/26 menu items were navigated in the browser. |
| Contributor tools | Contributor HTML gate and requireContributor contracts | Contributor authoring page passed; member denial passed. Mutating authoring workflows were not exercised. |
| Community, Messenger, Notifications | OPS-010/011 APIs and member shell | Existing bounded suites passed; no real member data or external delivery was used. |
| StudioFlow and ParaTube | OPS-012 routes, local D1/R2, preserved 8788 room server | Existing 26/26 local suite passed; WebSocket/playback/RealtimeKit remain externally bounded. |
| Media and local R2 | wrangler.local.toml, local media fixtures, OPS-012 | Synthetic local object coverage passed; no production media was copied. |

## Administrator capability surface

The synthetic local_admin account has the application-defined admin
role. The server gate is the existing user.role owner/admin check; no
universal override was added. Read-only
verification passed for overview, analytics, audit logs, Founding 50, creator
partnership, entitlements, invites, contributors, members, community posts and
comments, article comments/articles, reports, notifications, channels, roles,
restrictions, events, settings, scraper runs, Paranormal Teams, and claims.

Owner-only operations remain owner-only. No Founding 50 allocation, publication,
destructive moderation, account mutation, or external notification was
performed.

## Local schema completion

The pre-OPS-015 local database lacked authoritative tables needed by the admin
surface. A fresh local-only backup was created before changes:

- File: .local-dev/backups/tpi-ops-015-before-admin-schema.sql
- Size: 51,965 bytes
- SHA-256: 85848aa6dcbb50faae5d9555c7af9ca4b6aed0e29200d9817ddfdf621ac6a02c

The following repository migrations were applied only to isolated local D1:

0025_paranormal_teams.sql, 0035_scraper_runs.sql,
0036_paranormal_teams_extensions.sql, 0039_paranormal_teams_profile_fields.sql,
0040_paranormal_teams_management_audit.sql, 0047_admin_audit_logs.sql,
0048_creator_partnership_admin.sql, and 0050_creator_application_details.sql.

Existing synthetic accounts and local state were preserved. No remote migration
was executed.

## Detailed page inventory

| Route | Title | Group | Expected access | Anonymous local response | Redirect/location or error |
| --- | --- | --- | --- | ---: | --- |
| `/.freebuff/theme-preview.html` | TPI Theme Lab — pick with your eyes | Public | public or page-specific | 307 | /.freebuff/theme-preview |
| `/TPI_Evidence_Compendium.html` | Evidence Compendium \| The Paranormal Initiative | Public | public or page-specific | 307 | /TPI_Evidence_Compendium |
| `/TPI_Field_Encyclopedia.html` | Official Field Encyclopedia \| The Paranormal Initiative | Public | public or page-specific | 307 | /TPI_Field_Encyclopedia |
| `/TPI_Forensic_Analysis_Compendium.html` | Forensic Analysis Compendium \| The Paranormal Initiative | Public | public or page-specific | 307 | /TPI_Forensic_Analysis_Compendium |
| `/TPI_Investigation_Compendium.html` | Investigation Compendium \| The Paranormal Initiative | Public | public or page-specific | 307 | /TPI_Investigation_Compendium |
| `/TPI_Terminology_Reference_Unified.html` | Paranormal Terminology Reference Guide \| The Paranormal Initiative | Public | public or page-specific | 307 | /TPI_Terminology_Reference_Unified |
| `/about.html` | About \| The Paranormal Initiative | Public | public or page-specific | 307 | /about |
| `/admin-advanced-settings.html` | Advanced Page Settings \| The Paranormal Initiative | Administrator | owner/admin | 403 | /admin-advanced-settings.html |
| `/admin-center-app/index.html` | TPI Administration Center | Administrator | owner/admin | 404 | /admin-center-app/index.html |
| `/admin-center-preview/index.html` | TPI Administration Center | Administrator | owner/admin | 403 | /admin-center-preview/index.html |
| `/admin-events.html` | Manage Events \| The Paranormal Initiative | Administrator | owner/admin | 403 | /admin-events.html |
| `/admin-panel.html` | TPI Administration Center \| The Paranormal Initiative | Administrator | owner/admin | 403 | /admin-panel.html |
| `/advisory-board-invitation.html` | Professional Advisory Board Invitation \| The Paranormal Initiative | Public | public or page-specific | 307 | /advisory-board-invitation |
| `/advisory-board.html` | Professional Advisory Board \| The Paranormal Initiative | Public | public or page-specific | 307 | /advisory-board |
| `/ai.html` | Artificial Intelligence \| The Paranormal Initiative | Public | public or page-specific | 307 | /ai |
| `/anabela-cardoso-animal-voices-2-surya-nisha.html` | Animal Voices 2: Surya and Nisha, My Beloved \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-animal-voices-2-surya-nisha |
| `/anabela-cardoso-animal-voices-3-1-first-abandoned.html` | Animal Voices 3.1: So the First Abandoned... \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-animal-voices-3-1-first-abandoned |
| `/anabela-cardoso-animal-voices-other-manifestations.html` | Animal Voices and Other Manifestations \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-animal-voices-other-manifestations |
| `/anabela-cardoso-dear-readers-fascinating-occurrences.html` | Dear Readers... \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-dear-readers-fascinating-occurrences |
| `/anabela-cardoso-instrumental-transcommunication-itc-evidence.html` | Instrumental Transcommunication (ITC) Evidence \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-instrumental-transcommunication-itc-evidence |
| `/anabela-cardoso-introduction-radioelectric-frequencies.html` | Introduction to the Radioelectric Frequencies \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-introduction-radioelectric-frequencies |
| `/anabela-cardoso-itc-journal-42-radioelectric-frequencies.html` | ITC Journal 42: Radioelectric Frequencies \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-itc-journal-42-radioelectric-frequencies |
| `/anabela-cardoso-itc-personal-results-guidance-method.html` | ITC Personal Results and Guidance on Method \| Anabela Cardoso \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /anabela-cardoso-itc-personal-results-guidance-method |
| `/anabela-cardoso-itc-transpersonal-connection.html` | ITC: A Transpersonal Connection \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-itc-transpersonal-connection |
| `/anabela-cardoso-itc-voices-contact-with-another-reality.html` | ITC Voices: Contact with Another Reality \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-itc-voices-contact-with-another-reality |
| `/anabela-cardoso-jochem-sotschek-itc-journal.html` | Jochem Sotschek in ITC Journal \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-jochem-sotschek-itc-journal |
| `/anabela-cardoso-neuroquantology-september-2012-volume-10.html` | NeuroQuantology, September 2012, Volume 10 \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-neuroquantology-september-2012-volume-10 |
| `/anabela-cardoso-note-on-witnesses.html` | Note on the Witnesses to My... \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-note-on-witnesses |
| `/anabela-cardoso-papers.html` | Anabela Cardoso Papers \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-papers |
| `/anabela-cardoso-paranormal-review-itc-paper.html` | Paranormal Review ITC Paper \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-paranormal-review-itc-paper |
| `/anabela-cardoso-prof-hans-bender-friedrich-jurgenson-anomalous-voices.html` | Prof. Hans Bender on F. Jurgenson&#x27;s Anomalous Voices \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-prof-hans-bender-friedrich-jurgenson-anomalous-voices |
| `/anabela-cardoso-profile.html` | Anabela Cardoso \| Honorary Member \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-profile |
| `/anabela-cardoso-radioelectric-frequencies-rio-do-tempo.html` | The Radioelectric Frequencies of Rio do Tempo \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-radioelectric-frequencies-rio-do-tempo |
| `/anabela-cardoso-soul-of-the-cat.html` | The Soul of the Cat \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-soul-of-the-cat |
| `/anabela-cardoso-technicians-message-translation.html` | Technicians&#x27; Message Translation \| Anabela Cardoso \| The Paranormal Initiative | Public | public or page-specific | 307 | /anabela-cardoso-technicians-message-translation |
| `/anabela-cardoso-two-year-investigation-electronic-voices.html` | A Two-Year Investigation of the Allegedly Anomalous Electronic Voices or EVP \| Anabela Cardoso \| The Paranor | Education / Research | public or page-specific | 307 | /anabela-cardoso-two-year-investigation-electronic-voices |
| `/analysis.html` | Analysis Labs \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /analysis |
| `/app-acs.html` | ACS Aetheric Communication System \| The Paranormal Initiative | Public | public or page-specific | 307 | /app-acs |
| `/app-aether-spectra-sls.html` | Aether Spectra SLS \| The Paranormal Initiative | Public | public or page-specific | 307 | /app-aether-spectra-sls |
| `/app-itc-visual-studio.html` | ITC Visual Studio \| The Paranormal Initiative | Public | public or page-specific | 307 | /app-itc-visual-studio |
| `/app-paranormal-initiative.html` | The Paranormal Initiative App \| The Paranormal Initiative | Public | public or page-specific | 307 | /app-paranormal-initiative |
| `/command-center.html` | Command Center \| The Paranormal Initiative | Public | public or page-specific | 307 | /command-center |
| `/community-home.html` | Redirecting… \| The Paranormal Initiative | Member | authenticated member or public shell | 307 | /community-home |
| `/contributor-invite.html` | Contributor Invite \| The Paranormal Initiative | Contributor | contributor/admin/owner | 307 | /contributor-invite |
| `/contributor-profile.html` | Contributor Profile \| The Paranormal Initiative | Contributor | contributor/admin/owner | 307 | /contributor-profile |
| `/creator-videos.html` | My Creator Videos \| The Paranormal Initiative | Contributor | contributor/admin/owner | 403 | /creator-videos.html |
| `/data/paranormal-team-verification/runs/unified-enrichment-001/triage/ALL_TEAMS_REVIEW.html` | TPI Paranormal Teams — Human Review | Public | public or page-specific | 404 | /data/paranormal-team-verification/runs/unified-enrichment-001/triage/ALL_TEAMS_REVIEW.html |
| `/data/paranormal-team-verification/runs/unified-enrichment-001/triage/review-workflow/decision-progress.html` | Decision Progress Tracker — Batch 001 (local) | Public | public or page-specific | 404 | /data/paranormal-team-verification/runs/unified-enrichment-001/triage/review-workflow/decision-progress.html |
| `/data/paranormal-team-verification/runs/unified-enrichment-001/triage/review-workflow/index.html` | TPI Paranormal Teams — Human Review | Public | public or page-specific | 404 | /data/paranormal-team-verification/runs/unified-enrichment-001/triage/review-workflow/index.html |
| `/early-access.html` | Contact &amp; Links \| The Paranormal Initiative | Authentication / Access | public or page-specific | 307 | /early-access |
| `/education-area-artificial-intelligence.html` | Artificial Intelligence \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-area-artificial-intelligence |
| `/education-area-consciousness-human-experience.html` | Consciousness &amp; Human Experience \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-area-consciousness-human-experience |
| `/education-area-education-community-development.html` | Community Development &amp; Publication \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-area-education-community-development |
| `/education-area-environmental-research.html` | Environmental Research \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-area-environmental-research |
| `/education-area-ethics-professional-standards.html` | Ethics &amp; Professional Standards \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-area-ethics-professional-standards |
| `/education-area-evidence-science-analysis.html` | Evidence Science &amp; Analysis \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-area-evidence-science-analysis |
| `/education-area-evp-itc-research.html` | EVP &amp; ITC Research \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-area-evp-itc-research |
| `/education-area-historical-cultural-research.html` | Historical &amp; Cultural Research \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-area-historical-cultural-research |
| `/education-area-instrumentation-technology.html` | Instrumentation &amp; Technology \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-area-instrumentation-technology |
| `/education-area-investigation-science.html` | Investigation Science \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-area-investigation-science |
| `/education-area-reporting-documentation.html` | Reporting &amp; Documentation \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-area-reporting-documentation |
| `/education-area-technology-development-ai.html` | Technology Development \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-area-technology-development-ai |
| `/education-center.html` | Education Center \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-center |
| `/education-research-audio-photo-video-review.html` | Introduction to Audio, Photo, and Video Review \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-audio-photo-video-review |
| `/education-research-choosing-researching-location.html` | How Beginners Choose and Research a Location \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-choosing-researching-location |
| `/education-research-debunking-natural-explanations.html` | Debunking Basics and Natural Explanations \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-debunking-natural-explanations |
| `/education-research-equipment-what-tools-measure.html` | Introduction to Equipment and What Tools Actually Measure \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-equipment-what-tools-measure |
| `/education-research-field-safety-permission.html` | Basic Field Safety and Permission \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-field-safety-permission |
| `/education-research-foundational-terminology-paranormal-research.html` | Basic Terminology and Foundational Language \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-foundational-terminology-paranormal-research |
| `/education-research-historical-records-local-legends-cemeteries-oral-history.html` | Historical Records, Local Legends, Cemeteries, and Oral History \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-historical-records-local-legends-cemeteries-oral-history |
| `/education-research-history-hauntings-folklore-psychical-research.html` | History of Hauntings, Folklore, Ghost Hunting, and Psychical Research \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-history-hauntings-folklore-psychical-research |
| `/education-research-investigation-ethics-professional-conduct.html` | Investigation Ethics and Professional Conduct \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-investigation-ethics-professional-conduct |
| `/education-research-motivations-meaning-paranormal-experience.html` | Personal Experience, Curiosity, Belief, Fear, Grief, Social Media, and the Search for Meaning \| The Paranorma | Education / Research | public or page-specific | 307 | /education-research-motivations-meaning-paranormal-experience |
| `/education-research-observation-note-taking.html` | Basic Observation and Note-Taking \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-observation-note-taking |
| `/education-research-professional-documentation-reporting.html` | Professional Investigation Documentation and Reporting \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-professional-documentation-reporting |
| `/education-research-psychological-triggers-paranormal-experiences.html` | Psychological Triggers of Paranormal Experiences \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-psychological-triggers-paranormal-experiences |
| `/education-research-spiritual-religious-demonic-claim-language.html` | Spiritual, Religious, and Demonic-Claim Language \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-spiritual-religious-demonic-claim-language |
| `/education-research-types-hauntings-claim-categories.html` | Types of Hauntings and Claim Categories \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-types-hauntings-claim-categories |
| `/education-research-weather-environment-building-science-causes.html` | Weather, Environment, and Building-Science Causes \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-weather-environment-building-science-causes |
| `/education-research-what-is-ghost-hunting.html` | What Is Ghost Hunting? \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-what-is-ghost-hunting |
| `/education-research-what-is-paranormal-investigation.html` | What Is Paranormal Investigation? \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-what-is-paranormal-investigation |
| `/education-research-why-investigate-paranormal.html` | Why People Choose to Investigate the Paranormal \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /education-research-why-investigate-paranormal |
| `/environment.html` | Environmental Intelligence \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /environment |
| `/equipment-audio-recorders.html` | Audio Recorders \| Equipment &amp; Technology | Education / Research | public or page-specific | 307 | /equipment-audio-recorders |
| `/equipment-cameras-video.html` | Cameras &amp; Video \| Equipment &amp; Technology | Education / Research | public or page-specific | 307 | /equipment-cameras-video |
| `/equipment-emf-k2-meters.html` | EMF &amp; K2 Meters \| Equipment &amp; Technology | Education / Research | public or page-specific | 307 | /equipment-emf-k2-meters |
| `/equipment-environmental-sensors.html` | Environmental Sensors \| Equipment &amp; Technology | Education / Research | public or page-specific | 307 | /equipment-environmental-sensors |
| `/equipment-spirit-boxes-experimental-devices.html` | Spirit Boxes &amp; Experimental Devices \| Equipment &amp; Technology | Education / Research | public or page-specific | 307 | /equipment-spirit-boxes-experimental-devices |
| `/equipment-technology.html` | Equipment &amp; Technology \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /equipment-technology |
| `/equipment-thermal-tools.html` | Thermal Tools \| Equipment &amp; Technology | Education / Research | public or page-specific | 307 | /equipment-thermal-tools |
| `/equipment.html` | Investigation Equipment \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /equipment |
| `/events.html` | Events \| The Paranormal Initiative | Public | public or page-specific | 307 | /events |
| `/evp-itc-lesson-acs-philosophy.html` | ACS Research Philosophy \| EVP / ITC Experimentation | Education / Research | public or page-specific | 307 | /evp-itc-lesson-acs-philosophy |
| `/evp-itc-lesson-contamination-controls.html` | Contamination &amp; Controls \| EVP / ITC Experimentation | Education / Research | public or page-specific | 307 | /evp-itc-lesson-contamination-controls |
| `/evp-itc-lesson-evp-basics.html` | EVP Basics \| EVP / ITC Experimentation | Education / Research | public or page-specific | 307 | /evp-itc-lesson-evp-basics |
| `/evp-itc-lesson-itc-basics.html` | ITC Basics \| EVP / ITC Experimentation | Education / Research | public or page-specific | 307 | /evp-itc-lesson-itc-basics |
| `/evp-itc-lesson-review-language.html` | Review Language \| EVP / ITC Experimentation | Education / Research | public or page-specific | 307 | /evp-itc-lesson-review-language |
| `/evp-itc-lesson-water-steam.html` | Water &amp; Steam ITC \| EVP / ITC Experimentation | Education / Research | public or page-specific | 307 | /evp-itc-lesson-water-steam |
| `/evp-itc-lessons.html` | EVP / ITC Experimentation \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /evp-itc-lessons |
| `/evp-itc-research.html` | EVP / ITC Research \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /evp-itc-research |
| `/explore.html` | Your Feed \| The Paranormal Initiative | Member | authenticated member or public shell | 307 | /explore |
| `/field-articles.html` | Field Articles \| The Paranormal Initiative | Public | public or page-specific | 307 | /field-articles |
| `/ghostology-101-lesson-01.html` | Lesson 01: Why do you want to investigate the paranormal? \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-01 |
| `/ghostology-101-lesson-02.html` | Lesson 02: What is ghost hunting? \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-02 |
| `/ghostology-101-lesson-03.html` | Lesson 03: What is paranormal investigation? \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-03 |
| `/ghostology-101-lesson-04.html` | Lesson 04: Personal experience, curiosity, belief, fear, grief, social media, and the search for meaning \| Gh | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-04 |
| `/ghostology-101-lesson-05.html` | Lesson 05: Basic terminology and foundational language \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-05 |
| `/ghostology-101-lesson-06.html` | Lesson 06: History of hauntings, folklore, ghost hunting, and psychical research \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-06 |
| `/ghostology-101-lesson-07.html` | Lesson 07: Types of hauntings and claim categories \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-07 |
| `/ghostology-101-lesson-08.html` | Lesson 08: How beginners choose and research a location \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-08 |
| `/ghostology-101-lesson-09.html` | Lesson 09: Historical records, local legends, cemeteries, and oral history \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-09 |
| `/ghostology-101-lesson-10.html` | Lesson 10: Weather, environment, and building-science causes \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-10 |
| `/ghostology-101-lesson-11.html` | Lesson 11: Psychological triggers of paranormal experiences \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-11 |
| `/ghostology-101-lesson-12.html` | Lesson 12: Spiritual, religious, and demonic-claim language \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-12 |
| `/ghostology-101-lesson-13.html` | Lesson 13: Introduction to equipment and what tools actually measure \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-13 |
| `/ghostology-101-lesson-14.html` | Lesson 14: Basic observation and note-taking \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-14 |
| `/ghostology-101-lesson-15.html` | Lesson 15: Basic field safety and permission \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-15 |
| `/ghostology-101-lesson-16.html` | Lesson 16: Intro to audio, photo, and video review \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-16 |
| `/ghostology-101-lesson-17.html` | Lesson 17: Debunking basics and natural explanations \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-17 |
| `/ghostology-101-lesson-18.html` | Lesson 18: Investigation Ethics and Professional Conduct \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-18 |
| `/ghostology-101-lesson-19.html` | Lesson 19: Professional Investigation Documentation and Reporting \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-19 |
| `/ghostology-101-lesson-20.html` | Lesson 20: Ghostology 101 Final Review and Next Steps \| Ghostology 101 | Education / Research | public or page-specific | 307 | /ghostology-101-lesson-20 |
| `/ghostology-101.html` | Ghostology 101 \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /ghostology-101 |
| `/haunted-location-directory/alabama.html` | Location Reference Directory • Alabama | Public | public or page-specific | 307 | /haunted-location-directory/alabama |
| `/haunted-location-directory/alaska.html` | Location Reference Directory • Alaska | Public | public or page-specific | 307 | /haunted-location-directory/alaska |
| `/haunted-location-directory/arizona.html` | Location Reference Directory • Arizona | Public | public or page-specific | 307 | /haunted-location-directory/arizona |
| `/haunted-location-directory/arkansas.html` | Location Reference Directory • Arkansas | Public | public or page-specific | 307 | /haunted-location-directory/arkansas |
| `/haunted-location-directory/california.html` | Location Reference Directory • California | Public | public or page-specific | 307 | /haunted-location-directory/california |
| `/haunted-location-directory/colorado.html` | Location Reference Directory • Colorado | Public | public or page-specific | 307 | /haunted-location-directory/colorado |
| `/haunted-location-directory/connecticut.html` | Location Reference Directory • Connecticut | Public | public or page-specific | 307 | /haunted-location-directory/connecticut |
| `/haunted-location-directory/delaware.html` | Location Reference Directory • Delaware | Public | public or page-specific | 307 | /haunted-location-directory/delaware |
| `/haunted-location-directory/florida.html` | Location Reference Directory • Florida | Public | public or page-specific | 307 | /haunted-location-directory/florida |
| `/haunted-location-directory/georgia.html` | Location Reference Directory • Georgia | Public | public or page-specific | 307 | /haunted-location-directory/georgia |
| `/haunted-location-directory/hawaii.html` | Location Reference Directory • Hawaii | Public | public or page-specific | 307 | /haunted-location-directory/hawaii |
| `/haunted-location-directory/idaho.html` | Location Reference Directory • Idaho | Public | public or page-specific | 307 | /haunted-location-directory/idaho |
| `/haunted-location-directory/illinois.html` | Haunted Location Directory • Illinois | Public | public or page-specific | 307 | /haunted-location-directory/illinois |
| `/haunted-location-directory/index.html` | Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/ |
| `/haunted-location-directory/indiana.html` | Haunted Location Directory • Indiana | Public | public or page-specific | 307 | /haunted-location-directory/indiana |
| `/haunted-location-directory/iowa.html` | Haunted Location Directory • Iowa | Public | public or page-specific | 307 | /haunted-location-directory/iowa |
| `/haunted-location-directory/kansas.html` | Haunted Location Directory • Kansas | Public | public or page-specific | 307 | /haunted-location-directory/kansas |
| `/haunted-location-directory/kentucky.html` | Haunted Location Directory • Kentucky | Public | public or page-specific | 307 | /haunted-location-directory/kentucky |
| `/haunted-location-directory/louisiana.html` | Haunted Location Directory • Louisiana | Public | public or page-specific | 307 | /haunted-location-directory/louisiana |
| `/haunted-location-directory/maine.html` | Haunted Location Directory • Maine | Public | public or page-specific | 307 | /haunted-location-directory/maine |
| `/haunted-location-directory/maryland.html` | Haunted Location Directory • Maryland | Public | public or page-specific | 307 | /haunted-location-directory/maryland |
| `/haunted-location-directory/massachusetts.html` | Haunted Location Directory • Massachusetts | Public | public or page-specific | 307 | /haunted-location-directory/massachusetts |
| `/haunted-location-directory/michigan.html` | Michigan Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/michigan |
| `/haunted-location-directory/minnesota.html` | Minnesota Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/minnesota |
| `/haunted-location-directory/mississippi.html` | Mississippi Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/mississippi |
| `/haunted-location-directory/missouri.html` | Missouri Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/missouri |
| `/haunted-location-directory/montana.html` | Montana Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/montana |
| `/haunted-location-directory/nebraska.html` | Nebraska Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/nebraska |
| `/haunted-location-directory/nevada.html` | Nevada Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/nevada |
| `/haunted-location-directory/new-hampshire.html` | New Hampshire Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/new-hampshire |
| `/haunted-location-directory/new-jersey.html` | New Jersey Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/new-jersey |
| `/haunted-location-directory/new-mexico.html` | New Mexico Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/new-mexico |
| `/haunted-location-directory/new-york.html` | New York Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/new-york |
| `/haunted-location-directory/north-carolina.html` | North Carolina Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/north-carolina |
| `/haunted-location-directory/north-dakota.html` | North Dakota Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/north-dakota |
| `/haunted-location-directory/ohio.html` | Ohio Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/ohio |
| `/haunted-location-directory/oklahoma.html` | Oklahoma Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/oklahoma |
| `/haunted-location-directory/oregon.html` | Oregon Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/oregon |
| `/haunted-location-directory/pennsylvania.html` | Pennsylvania Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/pennsylvania |
| `/haunted-location-directory/rhode-island.html` | Rhode Island Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/rhode-island |
| `/haunted-location-directory/south-carolina.html` | South Carolina Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/south-carolina |
| `/haunted-location-directory/south-dakota.html` | South Dakota Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/south-dakota |
| `/haunted-location-directory/tennessee.html` | Tennessee Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/tennessee |
| `/haunted-location-directory/texas.html` | Texas Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/texas |
| `/haunted-location-directory/utah.html` | Utah Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/utah |
| `/haunted-location-directory/vermont.html` | Vermont Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/vermont |
| `/haunted-location-directory/virginia.html` | Virginia Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/virginia |
| `/haunted-location-directory/washington.html` | Washington Haunted Location Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-location-directory/washington |
| `/haunted-location-directory/west-virginia.html` | Haunted Location Directory • West Virginia | Public | public or page-specific | 307 | /haunted-location-directory/west-virginia |
| `/haunted-location-directory/wisconsin.html` | Location Reference Directory • Wisconsin | Public | public or page-specific | 307 | /haunted-location-directory/wisconsin |
| `/haunted-location-directory/wyoming.html` | Location Reference Directory • Wyoming | Public | public or page-specific | 307 | /haunted-location-directory/wyoming |
| `/haunted-locations.html` | Haunted Locations \| The Paranormal Initiative | Public | public or page-specific | 307 | /haunted-locations |
| `/honorary-member-collections.html` | Honorary Member Collections \| The Paranormal Initiative | Member | authenticated member or public shell | 307 | /honorary-member-collections |
| `/` | The Paranormal Initiative \| Research, Investigation, Education, and Technology | Public | public or page-specific | 200 | / |
| `/investigation-development-acs-evp-itc-phonetic-data.html` | Aetheric Communication System For EVP &amp; ITC Research \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-acs-evp-itc-phonetic-data |
| `/investigation-development-aether-spectra-sls-seeing-beyond-visible.html` | Aether Spectra SLS: Seeing Beyond The Visible \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-aether-spectra-sls-seeing-beyond-visible |
| `/investigation-development-aetherspectra-sls-development-update.html` | AetherSpectra SLS Development Update \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-aetherspectra-sls-development-update |
| `/investigation-development-aetherspectra-sls-for-apple-users.html` | AetherSpectra SLS For Apple Users \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-aetherspectra-sls-for-apple-users |
| `/investigation-development-ai-truth-behind-it.html` | Let's Talk About AI And The Truth Behind It \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-ai-truth-behind-it |
| `/investigation-development-applied-paranormal-research-and-studies.html` | What Is The Paranormal Initiative About? \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-applied-paranormal-research-and-studies |
| `/investigation-development-baseline-readings.html` | Baseline Readings: Establishing What Is Normal \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-baseline-readings |
| `/investigation-development-belief-vs-investigation.html` | Belief Vs Investigation \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-belief-vs-investigation |
| `/investigation-development-burden-of-proof.html` | The Burden Of Proof Lies On The Person Making The Claim \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-burden-of-proof |
| `/investigation-development-canoe-creek-limestone-kilns-could-talk.html` | What If The Canoe Creek Limestone Kilns Could Talk? \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-canoe-creek-limestone-kilns-could-talk |
| `/investigation-development-claims-vs-evidence.html` | Lesson 3: Claims Vs Evidence — Know The Difference \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-claims-vs-evidence |
| `/investigation-development-community-first-focus.html` | When You Investigate A Location, What Do You Focus On First? \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-community-first-focus |
| `/investigation-development-contamination-before-investigation.html` | How Contamination Begins Before The Investigation Starts \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-contamination-before-investigation |
| `/investigation-development-emf-challenge-phone-distance.html` | EMF Challenge: How Close Before It Spikes? \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-emf-challenge-phone-distance |
| `/investigation-development-emotional-testimony-objective-observation.html` | Lesson 6: Emotional Testimony Vs. Objective Observation \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-emotional-testimony-objective-observation |
| `/investigation-development-energy-consciousness-soul-remembers.html` | Are The Energies Created By Death Still Consciousness? \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-energy-consciousness-soul-remembers |
| `/investigation-development-entertainment-vs-investigation.html` | Entertainment Vs Investigation: Understanding The Difference \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-entertainment-vs-investigation |
| `/investigation-development-environmental-red-flags.html` | Environmental Red Flags Most Investigators Miss \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-environmental-red-flags |
| `/investigation-development-evp-voices-we-didnt-hear.html` | EVP: The Voices We Didn't Hear \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-evp-voices-we-didnt-hear |
| `/investigation-development-faked-evidence-misinterpretation.html` | Faked Evidence, Misinterpretation, And Investigator Responsibility \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-faked-evidence-misinterpretation |
| `/investigation-development-fort-roberdeau-never-fell-silent.html` | What If Fort Roberdeau Never Truly Fell Silent? \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-fort-roberdeau-never-fell-silent |
| `/investigation-development-ghost-boxes-radio-scanning-phoneme-systems.html` | Ghost Boxes, Radio Scanning, And Why Phoneme-Based Systems Matter \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-ghost-boxes-radio-scanning-phoneme-systems |
| `/investigation-development-ghostology-101-academy-introduction.html` | Ghostology 101: Introduction To Ghost Hunting &amp; Paranormal Investigation \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-ghostology-101-academy-introduction |
| `/investigation-development-haunted-locations-why-they-matter.html` | Haunted Locations: Why They Matter \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-haunted-locations-why-they-matter |
| `/investigation-development-how-do-we-know-paranormal.html` | How Do We Really Know What Is and What Isn't Paranormal? \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-how-do-we-know-paranormal |
| `/investigation-development-intake-most-important-step.html` | Lesson 2: The Intake Is The Most Important Step \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-intake-most-important-step |
| `/investigation-development-join-the-mission-community-group.html` | Join The Mission \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-join-the-mission-community-group |
| `/investigation-development-k2-cell-phone-field-experiment.html` | K2 Meter Vs Cell Phones \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-k2-cell-phone-field-experiment |
| `/investigation-development-k2-meters-mobile-devices.html` | K2 Meters &amp; Mobile Devices \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-k2-meters-mobile-devices |
| `/investigation-development-k2-meters-paid-events.html` | K2 Meters At Paid Haunted-Location Events \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-k2-meters-paid-events |
| `/investigation-development-kittens-door-creaking-experience.html` | The Door Creaking Open At 4 AM \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-kittens-door-creaking-experience |
| `/investigation-development-neurodivergent-minds-paranormal-differently.html` | Could Neurodivergent Minds Experience The Paranormal Differently? \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-neurodivergent-minds-paranormal-differently |
| `/investigation-development-new-investigator-read-this-first.html` | If You're New To Paranormal Investigation, Read This First \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-new-investigator-read-this-first |
| `/investigation-development-not-all-orbs-are-the-same.html` | Not All Orbs Are The Same \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-not-all-orbs-are-the-same |
| `/investigation-development-not-every-evp-is-obvious.html` | Not Every EVP Is Meant To Be Obvious \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-not-every-evp-is-obvious |
| `/investigation-development-not-everything-unexplained-is-paranormal.html` | Not Everything Unexplained Is Paranormal \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-not-everything-unexplained-is-paranormal |
| `/investigation-development-not-here-to-change-how-you-investigate.html` | We Are Not Here To Change How You Investigate \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-not-here-to-change-how-you-investigate |
| `/investigation-development-old-perfume-transient-visitor.html` | The Old Perfume At 2:30 AM \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-old-perfume-transient-visitor |
| `/investigation-development-original-goal-of-itc-research.html` | What Was The Original Goal Of ITC Research? \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-original-goal-of-itc-research |
| `/investigation-development-our-values-our-standard-our-commitment.html` | Our Values, Our Standard, Our Commitment \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-our-values-our-standard-our-commitment |
| `/investigation-development-personal-experiences-not-proof.html` | Personal Experiences Are Not Proof Of The Paranormal \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-personal-experiences-not-proof |
| `/investigation-development-raising-the-standards.html` | Raising The Standards Of Paranormal Investigation \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-raising-the-standards |
| `/investigation-development-role-of-the-investigator.html` | Lesson 7: The Role Of The Investigator \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-role-of-the-investigator |
| `/investigation-development-series.html` | Investigation Development Series \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-series |
| `/investigation-development-seven-principles.html` | The 7 Principles of The Paranormal Initiative \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-seven-principles |
| `/investigation-development-thirty-years-real-investigations.html` | Thirty Years Of Real Investigations \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-thirty-years-real-investigations |
| `/investigation-development-thunderstorms-paranormal-activity.html` | Do Thunderstorms Increase Paranormal Activity? \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-thunderstorms-paranormal-activity |
| `/investigation-development-true-science-paranormal-investigation.html` | The True Science Of Paranormal Investigation \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-true-science-paranormal-investigation |
| `/investigation-development-truth-vs-validation-thought-for-day.html` | Truth Does Not Care What We Want It To Be \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-truth-vs-validation-thought-for-day |
| `/investigation-development-types-of-hauntings.html` | Understanding The Different Types Of Hauntings \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-types-of-hauntings |
| `/investigation-development-understanding-patterns.html` | Lesson 4: Understanding Patterns In Paranormal Claims \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-understanding-patterns |
| `/investigation-development-understanding-sls-cameras.html` | Understanding SLS Cameras \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-understanding-sls-cameras |
| `/investigation-development-voices-behind-the-investigations.html` | The Voices Behind The Investigations \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-voices-behind-the-investigations |
| `/investigation-development-walkthrough-first-investigation.html` | Lesson 8: The Walkthrough Is Your First Investigation \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-walkthrough-first-investigation |
| `/investigation-development-walkthrough-what-to-look-for.html` | What You Should Be Looking For During A Walkthrough \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-walkthrough-what-to-look-for |
| `/investigation-development-walkthroughs-baseline-readings.html` | Why Are Walkthroughs And Baseline Readings So Important? \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-walkthroughs-baseline-readings |
| `/investigation-development-welcome-to-the-paranormal-initiative.html` | Welcome To The Paranormal Initiative \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-welcome-to-the-paranormal-initiative |
| `/investigation-development-what-are-you-actually-investigating.html` | Day 1: What Are You Actually Investigating? \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-what-are-you-actually-investigating |
| `/investigation-development-what-is-itc-research-trying-to-accomplish.html` | What Is ITC Research Really Trying To Accomplish? \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-what-is-itc-research-trying-to-accomplish |
| `/investigation-development-where-investigation-leaves-science-behind.html` | Where Paranormal Investigation Leaves Science Behind \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-where-investigation-leaves-science-behind |
| `/investigation-development-why-investigations-fail.html` | Lesson 5: Why Most Investigations Fail Before They Begin \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-why-investigations-fail |
| `/investigation-development-why-some-people-see-ghosts.html` | Why Some People See Ghosts While Others Don't \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /investigation-development-why-some-people-see-ghosts |
| `/itc-visual-studio/Resources/VisualITCLab_User_Manual.html` | ITC Visual Studio / Browser Version - User Manual | StudioFlow / ParaTube | public or page-specific | 403 | /itc-visual-studio/Resources/VisualITCLab_User_Manual.html |
| `/itc-visual-studio/index.html` | ITC Visual Studio / Browser Version | StudioFlow / ParaTube | public or page-specific | 403 | /itc-visual-studio/index.html |
| `/live-video.html` | Live Video Studio \| The Paranormal Initiative | StudioFlow / ParaTube | public or page-specific | 307 | /live-video |
| `/member-dashboard.html` | Settings \| The Paranormal Initiative | Member | authenticated member or public shell | 307 | /member-dashboard |
| `/member-files.html` | Your Files \| The Paranormal Initiative | Member | authenticated member or public shell | 307 | /member-files |
| `/member-home.html` | Home \| The Paranormal Initiative | Member | authenticated member or public shell | 307 | /member-home |
| `/member-login.html` | Member Login \| The Paranormal Initiative | Member | authenticated member or public shell | 307 | /member-login |
| `/member-notifications.html` | Notifications \| The Paranormal Initiative | Member | authenticated member or public shell | 307 | /member-notifications |
| `/member-photos.html` | Your Photos \| The Paranormal Initiative | Member | authenticated member or public shell | 307 | /member-photos |
| `/member-profile.html` | My Profile \| The Paranormal Initiative | Member | authenticated member or public shell | 307 | /member-profile |
| `/member-videos.html` | Your Videos \| The Paranormal Initiative | Member | authenticated member or public shell | 307 | /member-videos |
| `/method-exercises.html` | Method Exercises \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /method-exercises |
| `/news.html` | ParaNews \| Paranormal News & Headlines \| The Paranormal Initiative | Public | public or page-specific | 307 | /news |
| `/our-apps.html` | Our Apps \| The Paranormal Initiative | Public | public or page-specific | 307 | /our-apps |
| `/paper-editor.html` | Content Editor \| The Paranormal Initiative | Contributor | contributor/admin/owner | 403 | /paper-editor.html |
| `/paranormal-investigation.html` | Paranormal Investigation \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /paranormal-investigation |
| `/paratube.html` | ParaTube \| Paranormal Videos \| The Paranormal Initiative | StudioFlow / ParaTube | public or page-specific | 307 | /paratube |
| `/podcast.html` | Podcast Studio \| The Paranormal Initiative | Public | public or page-specific | 307 | /podcast |
| `/published-article.html` | Published Article \| The Paranormal Initiative | Public | public or page-specific | 307 | /published-article |
| `/published-article/index.html` | Published Article \| The Paranormal Initiative | Public | public or page-specific | 307 | /published-article/ |
| `/reels.html` | TPI Reels \| The Paranormal Initiative | Member | authenticated member or public shell | 307 | /reels |
| `/reports.html` | Reporting &amp; Documentation \| The Paranormal Initiative | Public | public or page-specific | 307 | /reports |
| `/repository-pathways.html` | Repository Pathways \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /repository-pathways |
| `/repository.html` | Repository \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /repository |
| `/search.html` | Search \| The Paranormal Initiative | Public | public or page-specific | 307 | /search |
| `/social-feed-lab/index.html` | TPI Social Feed Lab | Member | authenticated member or public shell | 307 | /social-feed-lab/ |
| `/software-use.html` | Software Use Terms \| The Paranormal Initiative | Public | public or page-specific | 307 | /software-use |
| `/standards.html` | Professional Standards &amp; Ethics \| The Paranormal Initiative | Education / Research | public or page-specific | 307 | /standards |
| `/steam-itc.html` | Steam ITC \| The Paranormal Initiative | Public | public or page-specific | 307 | /steam-itc |
| `/studio/index.html` | StudioFlow | StudioFlow / ParaTube | public or page-specific | 403 | /studio/index.html |
| `/submit-event.html` | Submit Event \| The Paranormal Initiative | Contributor | contributor/admin/owner | 307 | /submit-event |
| `/teams/add.html` | Add a Team \| TPI Paranormal Teams Directory | Public | public or page-specific | 307 | /teams/add |
| `/teams/admin.html` | Team Approvals \| TPI Paranormal Teams Directory | Administrator | owner/admin | 403 | /teams/admin.html |
| `/teams/browse.html` | Browse Teams \| TPI Paranormal Teams Directory | Public | public or page-specific | 307 | /teams/browse |
| `/teams/find.html` | Find a Team \| TPI Paranormal Teams Directory | Public | public or page-specific | 307 | /teams/find |
| `/teams/index.html` | Paranormal Teams Directory \| The Paranormal Initiative | Public | public or page-specific | 307 | /teams/ |
| `/teams/search.html` | Search \| TPI Paranormal Teams Directory | Public | public or page-specific | 307 | /teams/search |
| `/teams/team.html` | Team Listing \| TPI Paranormal Teams Directory | Public | public or page-specific | 307 | /teams/team |
| `/tools.html` | Investigation Workflow \| Paranormal Pro | Education / Research | public or page-specific | 307 | /tools |
| `/tpi-channel.html` | TPI Creator Channel | Public | public or page-specific | 307 | /tpi-channel |
| `/tpi-video.html` | TPI Video \| The Paranormal Initiative | StudioFlow / ParaTube | public or page-specific | 307 | /tpi-video |
| `/tpi-videos.html` | TPI Videos \| The Paranormal Initiative | StudioFlow / ParaTube | public or page-specific | 307 | /tpi-videos |
| `/watch-history.html` | Watch History \| The Paranormal Initiative | Member | authenticated member or public shell | 307 | /watch-history |
| `/watch-later.html` | Watch Later \| The Paranormal Initiative | Member | authenticated member or public shell | 307 | /watch-later |
| `/water-itc.html` | Water ITC \| The Paranormal Initiative | Public | public or page-specific | 307 | /water-itc |

## Limitations

- This inventory establishes route coverage and HTTP response behavior; it does
  not claim every page's complete interactive workflow is verified.
- Static pages that reference hosted canonical URLs may contain those URLs as
  document metadata; the local browser request guard still blocked all observed
  non-loopback requests before dispatch.
- External authentication, email, RealtimeKit, livestream providers, remote
  scraping/link previews, and third-party APIs remain **EXTERNAL DEPENDENCY
  BLOCKED** in local mode.
- Full real-media playback, real recording sessions, live broadcasts, and
  production/member data are intentionally not tested.
- FreeBuff and OpenCode agent access was not verified.
