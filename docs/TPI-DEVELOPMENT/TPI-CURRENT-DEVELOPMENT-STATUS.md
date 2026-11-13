# TPI Current Development Status

## 2026-11-12 — Site-wide shell and theme audit

Status: **AUDIT IN PROGRESS — THEME AND FIREFOX VALIDATION FIXES DEPLOYED AND LIVE VERIFIED.** The current
tracked source contains 293 HTML documents. After excluding the 51 Haunted
Location directory documents, five standalone Repository books, and three
shared fragments, 234 in-scope page files remain. None of those in-scope pages
uses the old `.brand-header` shell. All 29 tracked legacy brand-header pages
are within the protected scope: 24 Haunted Location state books and the five
standalone Repository books. They were not modified.

Theme-source review found Nova Editorial's internal workspace colors were
fixed to Cryptid. Nova now maps its workspace colors to all six site themes,
and server-generated access gates use the saved theme and matching color
tokens. The shared Worker, member shell, Teams, and Administration Center
theme paths were also reviewed. StudioFlow, Nova Editorial, Administration
Center, Teams, and Reels retain distinct application layouts while following
the saved theme path.

Representative Firefox theme routes passed 48/48; Nova access-gate theme
checks passed 6/6; Education Center/Ghostology acceptance passed 30/30; Nova
theme rendering passed 6/6; source checks passed 5/5; navigation checks
passed 13/13. A separate complete local browser sweep then checked all 234
in-scope HTML files: 227 PASS, seven documented expected limitations, zero
failures, and 61/61 focused checks passed. The seven limitations are internal
source/test files, an intentionally embedded editor shell, and Nova's expected
anonymous access gate; no broken visitor route was found. The full route table
is in [TPI-OPS-017 browser acceptance](200-AUDITS/TPI-OPS-017-BROWSER-ROUTE-ACCEPTANCE.md).
Guarded production preflight certified all 30 gates, live
anonymous smoke passed 10/10, and isolated Firefox production acceptance
passed 65/65. The initial theme release `rel-8d444b943916-8e1f9c61cc85` was
followed by the browser-validation fix release `rel-926fbdd8b659-1e05e0517898`,
which is live at 100% traffic on Worker version
`0df5ebd5-e07c-42d8-a094-bd7d4f1abe75`. A full
responsive visual consistency review remains open: the route sweep did not inspect
every page at mobile/desktop sizes or compare all six themes on each page.
Historical OPS-015/016 284-route results are not current full-site
certification. No protected books or production data were changed. Details
and counts are in
[TPI-OPS-017](200-AUDITS/TPI-OPS-017-SITE-WIDE-SHELL-AND-THEME-AUDIT.md).

### 2026-11-12 — Responsive visual sample

Status: **DEPLOYED AND LIVE VERIFIED — REPRESENTATIVE REVIEW COMPLETE.** A repeatable Firefox
sample checked 17 representative page routes in the applicable public, member,
contributor, and administrator sessions, at desktop and phone sizes, across all
six themes (204 combinations). It exposed mobile layout issues in the profile
editor, Settings, and member home. The shared responsive rules are repaired;
the final local sweep had zero overflow, wrong-theme, blank-route, broken-local-
image, JavaScript-error, or title/greeting-overlap findings. The profile editor
was also checked at ten widths from 320px to 1440px with no document overflow
or title/greeting collision.

This is representative coverage, not visual certification of all 234 pages.
Continue auditing page families as source review and owner reports identify
them. The runnable check, scope, results, and limitations are in
[the visual sample review](200-AUDITS/TPI-OPS-017-RESPONSIVE-VISUAL-SAMPLE-REVIEW.md).
Production release `rel-da185da5ae93-5ab88ae30d0e` deployed commit
`da185da5ae939b75d74670944135e8084e01172d` as Worker
`c48da23b-d832-49ed-97fd-38e398798807` at 100% traffic. Preflight passed 30/30
gates, live smoke 10/10, and isolated Firefox 65/65. The Haunted Location
books and five standalone Repository books remain excluded.

The Firefox audit uncovered HTML validation patterns that rejected the
literal punctuation syntax under current browser rules. Username fields and
the creator-channel slug pattern were corrected; the three-field Firefox
spot-check passed. The complete 234-page Firefox rerun passed with zero route
failures, and the repeatable browser runner now includes focused valid/invalid
input checks. This correction is deployed and live verified: release preflight
passed all 30 gates, live anonymous smoke passed 10/10, and isolated Firefox
Developer Edition acceptance passed 65/65. Release ID, source commit, Worker
version, and remaining visual-review scope are recorded in TPI-OPS-017.

## 2026-11-12 — Founding Membership header pill removal

Status: **COMPLETE — DEPLOYED AND LIVE VERIFIED.** Founding Membership
chips no longer appear below member names in the shared profile header. This
applies consistently to the signed-in member's own profile and profiles opened
from People to Discover. Founding badges, membership numbers, descriptions,
and clickable detail views remain in the Honors & Distinctions wall and right
rail.

Verification: local member-profile API checks 31/31 and isolated Firefox
profile acceptance 31/31. Release preflight certified the exact pushed source
commit and passed its 30 release gates, authentication lifecycle 38/38,
read-only production smoke 10/10, full isolated Firefox release acceptance
65/65, and StudioFlow release regressions. The deployed production
`member-home.html` was fetched read-only: the header membership marker is
absent while the Honors renderer remains present.

Production release `rel-a5a815e8b9a3-a2f404f5c50c` deployed source commit
`a5a815e8b9a3e30fa9b4df6043bfe3614420e5c4` as Worker
`f65602de-f2ff-4af4-85e4-bef08490f6ee` at 100% traffic. Rollback Worker:
`83cd8130-f963-487e-add8-9cc31a77c7e0`. Completion record:
`300-COMPLETED-WORK/2026-11-12-MEMBER-PROFILE-HONORS-HEADER-CLEANUP.md`.

## 2026-11-11 — Shared member shell and theme consistency

Status: **COMPLETE — DEPLOYED AND LIVE VERIFIED.** Ghostology and the other
dual-mode education pages now load the same shared member sidebar, active theme,
and member layout when opened with `?member=1`. The Ghostology navigation item
continues to open `ghostology-101?member=1`, while the Education Center keeps
its 18 compact subject shelves, article lists, clean subject routes, and final
TPI Videos-to-Contribute spacing.

The site audit covered 294 HTML assets: 211 shared public-shell pages, 35 full
member-shell pages, and 29 legacy brand-header pages. The five standalone
compendia and 24 Haunted Location state books were explicitly left untouched
for this release, per scope. No other repository books were changed, and no
member, article, Studio, or production data was changed.

Verification: local focused Education/Ghostology acceptance 30/30; production
focused Education/Ghostology acceptance 30/30; guarded release preflight
30/30; anonymous production smoke 10/10; live isolated Firefox acceptance
65/65. The first production focused run exposed only a timing race in the
acceptance script, which was corrected to wait for the fetched sidebar link and
then passed 30/30; no application change was required.

Production release `rel-3f93f9728dad-b6670a9d5b6a` deployed source commit
`3f93f9728dad9a7da20596257d99c28bb4a2013b` as Worker
`ce3cfa23-229a-422d-82f1-20849ed2f4bf` at 100% traffic. Rollback Worker:
`5ee216f8-39a8-4dc9-9f19-652383c67c1b`.

## 2026-11-11 — Education Center research-library orientation

Status: **COMPLETE — DEPLOYED AND LIVE VERIFIED.** The Education Center now
opens with an explanation of what the library is, why it exists, and how to
use it. The copy describes the full research scope across paranormal and
supernatural investigation, metaphysical traditions, witchcraft and folklore,
consciousness and human experience, EVP/ITC, technology, ethics, and
documentation.

The narrow “Field papers, investigation guides, and EVP/ITC research” heading
was replaced with a broader orientation. “Research Library & Field Papers” is
now simply “Research Library.” “Featured Research Shelves” is now “Research
Shelves,” and the directory tells visitors to browse the research library by
subject. The existing search, 18 compact subject shelves, clean routes, and
48px separation before Contribute remain intact. Images were not added in this
pass; they remain a deliberate follow-up design pass after the information
architecture is settled.

Verification: Education Center source checks 37/37; local Firefox acceptance
29/29; production Firefox acceptance 29/29. The guarded release preflight
passed 30/30, anonymous production smoke passed 10/10, and live isolated
Firefox acceptance passed 65/65.

Production release `rel-af6c0d80197e-cc11313a7498` deployed source commit
`af6c0d80197e9cae989f71532534260581d3ecdf` as Worker
`5ee216f8-39a8-4dc9-9f19-652383c67c1b` at 100% traffic. Rollback Worker:
`3ab51f65-54ce-47ee-ae41-4c14c362f816`.

## 2026-11-10 — Public profile recognition shelf and profile boundary

Status: **COMPLETE — DEPLOYED AND LIVE VERIFIED.** Todd Wayne’s public profile
now presents Honors & Distinctions as one centered, ordered shelf: the Gold
Medallion first, Board Member second, and any later recognitions after them.
Board artwork remains available as separate clickable medallions, and each
recognition opens its accessible detail modal.

The public “Visual recognition only...” note and Profile Wall have been
removed from both the rendered profile and the public contributor-profile API.
Community Feed posts remain in the feed; they are no longer mixed into public
profiles. Generic recognition wording no longer exposes “Legacy recognition.”

The contribution-level presentation now uses **CEO** with the context
**CEO / Founder / Director**, and both the member and Administration Center
profile editors offer **Chief Executive Officer (CEO)**. The stored public
title was not silently changed in production; it remains editable through the
protected profile editor.

Verification: local synthetic profile acceptance 12/12; live Todd Wayne
profile acceptance 16/16; Leadership 18/18; Board 20/20; Admin Center preview
build passed. The guarded release preflight passed 30/30, anonymous production
smoke passed 10/10, and live isolated Firefox acceptance passed 65/65.

Production release `rel-6d41e66cdff5-37b854331f69` deployed source commit
`6d41e66cdff58334b7cf804580a926dab8e1f62b` as Worker
`3ab51f65-54ce-47ee-ae41-4c14c362f816` at 100% traffic. Rollback Worker:
`8a74a433-3078-4904-b332-cf2f639b3641`.

## 2026-11-10 — Ghostology member navigation and naming

Status: **COMPLETE — DEPLOYED AND LIVE VERIFIED.** The left member navigation
now has a dedicated **Ghostology** link to `ghostology-101?member=1`. The
Education Center subject shelf and Nova Editorial destination are also named
**Ghostology** instead of Ghostology Reference. Ghostology hub, lesson, and
academy-introduction pages keep the Ghostology navigation item active.

Verification: Education Center source checks 36/36; local Firefox acceptance
29/29; production Firefox acceptance 29/29, including the Ghostology link,
all 18 shelves, clean routes, and mobile overflow safety. The guarded release
preflight passed 30/30, anonymous production smoke passed 10/10, and live
isolated Firefox acceptance passed 65/65. No database, member, article, or
Studio data was changed.

Production release `rel-aee6e1231c74-d74df1cf174c` deployed source commit
`aee6e1231c740a16eb7f36a89e3bc28168ae7b29` as Worker
`8a74a433-3078-4904-b332-cf2f639b3641` at 100% traffic. Rollback Worker:
`c9e07261-d3a5-4411-a154-47ff49068756`.

## 2026-11-10 — Education Center shelf-to-Contribute spacing

Status: **COMPLETE — DEPLOYED AND LIVE VERIFIED.** The final TPI Videos
subject shelf now has a deliberate 48px separation before the Contribute card.
The spacing is scoped to the member Education Center layout so it is not
collapsed by the shared member-shell resets.

Verification: Education Center source checks 33/33; local Firefox Education
Center acceptance 28/28; production Firefox Education Center acceptance 28/28,
including the measured 48px gap, all 18 compact subject shelves, clean subject
routes, and mobile overflow safety. The guarded release preflight passed 30/30,
anonymous production smoke passed 10/10, and live isolated Firefox acceptance
passed 65/65. No database, member, article, or Studio data was changed.

Production release `rel-6b574ea53d16-75429a7fa16c` deployed source commit
`6b574ea53d1698e31152e05aa67b1cac1bfdcefc` as Worker
`c9e07261-d3a5-4411-a154-47ff49068756` at 100% traffic. Rollback Worker:
`fb700070-b2b4-4c1b-a326-5f95553330bd`.

## 2026-11-09 — Owner-requested continuation audit

The historical records below contain prior implementation and release claims.
The current audit reconciles those records with the present source tree and
fresh disposable local verification. This table is the authoritative current
queue; older rows below are historical evidence, not a substitute for the
acceptance level shown here.

| Area | Current evidence | Remaining proof or action |
| --- | --- | --- |
| Messenger | Implemented; source and local Firefox gates pass; prior production live verification recorded | Current production re-audit remains required for final completion |
| Community Feed | Implemented; workstation/source gates pass; prior production release recorded | Current production re-audit remains required for final completion |
| Friends and bug reporting | Implemented; workstation/source gates pass; Friends padding repair passes local and production Firefox layout 9/9 | No remaining implementation blocker |
| Leadership, Board, profiles, Sol, and Education | Implemented; governance/profile/source gates pass; Education Center complete subject directory passes local and production Firefox acceptance | No remaining implementation blocker |
| Nova Editorial Workspace and Nova Edit | Implemented; current review 47/47, publish 60/60, revision 26/26, Slides 23/23, workstation 9/9, and StudioFlow Nova Edit 13/13 pass locally | Current production re-audit remains required for final completion |
| Founding Membership | Implemented; Firefox/Chromium browser audit passes 48/48 and capability separation passes | Current production re-audit remains required for final completion |
| StudioFlow destinations and recording storage | Local and production Firefox/source audit passes 33/33; external-folder and cloud destinations remain honestly gated | No remaining implementation blocker; retain disposable-account-only acceptance and do not claim unsupported broadcast destinations |

Current release-safety verification passes 28/28. The latest test-only repairs
are pushed on `codex/tpi-development` as `d07e7905` and `f2799a96`; no owner
data, production broadcasts, or unrelated production access-control records
were changed during this audit. The synthetic production QA account was
already granted StudioFlow access externally before final acceptance.

Current production read-only evidence added during this continuation: the
anonymous boundary smoke passes 10/10; disposable Firefox Messenger acceptance
passes 18/18; and the disposable Firefox member UI audit passes 8/8 across
Community Feed, Friends search, bug reporting, Education Center, Sol, and a
public profile. Friends search correctly returned no active match for the
synthetic `qa` query; no follow/unfollow or bug report was submitted. The
production Community Feed interaction then passed 3/3 for in-place Open Post,
complete inline expansion, and no navigation reload. The synthetic local
Firefox Friends interaction passed 7/7 for search, follow, following-list
display, unfollow, and restoration of the initial state; it also confirmed no
`file:///` navigation. No real or production member relationship was changed.
The post-release production Friends layout acceptance passes 9/9 at desktop and
mobile widths, including 24px/18px panel padding, inset controls, panel bounds,
and horizontal-overflow safety.
Historical production evidence captured the prior `Todd_Wayne` profile state;
the 2026-11-10 release removed Profile Wall data from the public profile API.
Sol’s public leadership profile was browser-verified separately.
guarded preflight certified the synchronized branch as release
`rel-9ef3594abed1-23357aacd79c`; the guarded deployment then served Worker
version `84b2fa25-3fb2-4654-94ad-b47d015ee8a3` and passed live smoke 10/10 and
live Firefox StudioFlow acceptance 65/65. The dedicated production
recording/destination audit then passed 33/33.

## 2026-11-09 — Messenger navigation home and readable conversation names

Status: **COMPLETE — DEPLOYED AND LIVE VERIFIED.**
The existing floating Messenger now has a durable Chat home in both desktop and
mobile member navigation. Hide stores the movable/resizable frame and closes the
panel; selecting Chat restores it at the saved position and size. Member names,
usernames, and conversation previews wrap instead of being clipped by the
previous single-line ellipsis rules.

Focused source checks pass 19/19. Isolated Firefox Developer Edition
acceptance against the canonical local Worker passes 18/18, and the same
focused acceptance against production passes 18/18 using a disposable profile
and the synthetic production QA account. Both runs cover desktop dragging,
Hide/restore, refresh persistence, narrow viewport navigation, wrap-safe
labels/previews, and composer input. No owner browser storage or owner Studio
was used.

The guarded preflight passed 30/30 gates, including the repaired disposable
D1/API path (294/294), local authentication lifecycle (38/38), and guarded
Wrangler dry-run. Anonymous production smoke passed 10/10. Production release
`rel-99bac3bb4a5f-66c24136e926` deployed website commit
`99bac3bb4a5f8fdc19a615ff2e72b74150809c80` as Worker
`ce3a569c-a29e-4868-af75-10b9614fe033` at 100% traffic, with rollback target
`f9bb5d31-4636-40d9-a3fd-474021559169`.

Full record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-MEMBER-MESSENGER-NAVIGATION.md`.

## 2026-11-09 — Profile honors, medallion details, Profile Wall, and admin editing

Status: **COMPLETE — DEPLOYED AND LIVE VERIFIED.** Public profiles
now show larger clickable Founding, Board, and Leadership recognition artwork.
Selecting a recognition opens an enlarged detail view with its name, rank or
membership number, and purpose. Profiles also include a read-only Profile Wall
of the member's visible Community Feed posts with a link back to each post.
The Administration Center can edit public display name, title or credentials,
affiliation, organization, website, profile image URL, and biography for an
existing member through a protected owner/admin route. No schema change was
required and recognition remains visual-only.

Focused checks: Profile honors/wall Firefox 10/10 locally and 12/12 against the
live `Todd_Wayne` profile, including separate Board badge and Gold Medallion
activation, Leadership 18/18, Board 20/20, subject index 24/24,
community workstation 12/12, release safety 27/27. Unauthenticated profile
update correctly returned 403. Full guarded release gates passed, anonymous
production smoke passed 10/10, and live isolated Firefox acceptance passed
65/65.

Production release: source/website commit `bbf594669b08a631c03d594a300e819b6fd8ff84`,
release `rel-bbf594669b08-b5f52b15955f`, Worker
`f9bb5d31-4636-40d9-a3fd-474021559169` at 100% traffic. Rollback Worker:
`8caaf9f4-bb79-4721-ae8b-676808e76b38`.

Full record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-COMMUNITY-PROFILE-HONORS-WALL-AND-ADMIN-EDIT.md`.

## 2026-11-09 — Rank-safe leadership, Board medallions, and Education subjects

Status: **COMPLETE — DEPLOYED AND LIVE VERIFIED.**
Leadership assignment now chooses from a server-owned role catalog whose rank
controls the medallion, so executive roles cannot be assigned Bronze. Board
appointments now choose a governed Board role and paranormal umbrella domain;
the Board Member badge remains visible alongside the derived Gold, Silver, or
Bronze medallion. Both interfaces retain authenticated search, duplicate
protection, audit history, and revoke controls.

The Nova Editorial Workspace and public Education Center now share one complete
18-destination subject catalog. A live contributor-publications index groups
published articles by those destinations and preserves legacy reference shelves,
including Water & Steam ITC. Existing article destinations were not changed.

Focused checks: Leadership 18/18, Leadership local 10/10, Board 20/20, Board
local 11/11, subject index 24/24, release safety 27/27, Admin Center build PASS.
Production migrations 0067 and 0068 applied in order; production schema
readiness PASS. Guarded certification passed 30/30, anonymous production smoke
passed 10/10, and isolated Firefox Developer Edition production acceptance
passed 65/65.

Production release: source/website commit
`f1c2b2c02c8883eedd69f7abd4c689225530834b`, release
`rel-f1c2b2c02c88-c6acf327c5ce`, Worker
`6e552552-9458-4506-ab8f-48fd8e4b45fc` at 100% traffic. Rollback Worker:
`a8184f43-8d53-437b-9a8f-bc88cef485f8`.

The live article API confirms Steve Glanz's published Ethics paper is present
under Ethics & Professional Standards. The Education Center now has a shared
18-subject catalog and legacy Water & Steam ITC shelf. No owner/admin
credential was used for live destructive or administrative assignment actions;
anonymous admin access remains correctly denied.

Full record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-GOVERNANCE-006-LEADERSHIP-BOARD-EDUCATION.md`.

## 2026-11-09 — Board Member badge and appointment workflow

Status: **IMPLEMENTED — LOCAL VERIFIED / PRODUCTION PENDING SCHEMA RELEASE.**
The owner-provided Board Member badge is now a protected, auditable governance
appointment separate from Founding Memberships, medallions, and account roles.
Administration Center → Leadership & Honors can search existing registered
members, appoint or revoke Board Member status, record a position title and
administrative note, and show active appointments. Authenticated and public
profiles receive the server-resolved Board Member badge when an active
appointment exists.

Focused contract verification passed 16/16, local integration passed 10/10,
leadership regression passed 15/15, Admin Center preview checks passed 6/6,
and release safety passed 27/27. The local-only additive migration
`0067_board_members_and_badge.sql` was applied successfully. No production
database, creator record, or storage object was changed.

The guarded release is intentionally blocked until production D1 contains the
new `board_members` table. The release baseline now requires migration 0067 and
the read-only production schema gate will fail closed until that additive
schema release is separately authorized and completed.

Full record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-GOVERNANCE-005-BOARD-MEMBERS.md`.

## 2026-11-09 — Leadership profiles and Gold/Silver/Bronze distinctions

Status: **COMPLETE — DEPLOYED AND LIVE VERIFIED.** The preserved Society /
Leadership artwork is now backed by an
audited, authenticated owner/admin-gated distinction layer separate from Founding Memberships and
account permissions. Profiles can display Gold, Silver, and Bronze Medallions;
the Admin Center can assign or revoke them for existing accounts; and a
transparent, non-login Sol AI collaborator profile is available at
`leadership-profile.html?slug=sol` with its owner-designated Gold Medallion.

Sol is represented as an AI system and advisory identity, not as a fabricated
human account or a legal officer. The medallion is recognition only and never
grants access. No production account, membership, entitlement, D1 row, or R2
object was changed in this implementation pass. The owner Gold assignment for
the verified member account remains an explicit Admin Center action after the
release rather than an inferred identity match.

Focused contract verification passed 15/15, local assignment/revocation
integration passed 10/10, and release-safety source checks passed 27/27. The
guarded release passed 30/30 gates, anonymous production smoke passed 10/10,
and isolated Firefox production acceptance passed 65/65.
Production release: commit `779a723be02e4244b300a824d8bce02c27bcdb39`, release
`rel-779a723be02e-d5ef57799b3a`, Worker
`0debc66f-58db-41d7-8323-b44681fee655` at 100% traffic. Rollback Worker:
`a74f05ae-3026-44f9-9eeb-41f45019a315`.
Full record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-GOVERNANCE-004-LEADERSHIP-DISTINCTIONS.md`.

## 2026-11-09 — Friends, bug reporting, and Messenger identity release

Status: **COMPLETE — DEPLOYED AND VERIFIED.** The authenticated member shell
now includes Friends search/follow/unfollow and a protected **Report a bug**
form. Bug reports enter the Administration Center queue, while Messenger
rosters and messages preserve readable display names plus normalized usernames.

Migration `0065_member_social_and_bug_reports.sql` was applied additively to
local and production D1; no existing creator rows or storage objects were
modified. Focused workstation checks passed 9/9. The guarded release passed 30
certification gates, local auth passed 38/38, live anonymous smoke passed 10/10,
and isolated Firefox production acceptance passed 65/65.

Production release: commit `9a1ccc6a3b570fc8e2c3f9e84a7c479c84c63a75`, release
`rel-9a1ccc6a3b57-00b3315dfc7e`, Worker
`a74f05ae-3026-44f9-9eeb-41f45019a315` at 100% traffic. Rollback Worker:
`b40bd498-5b70-43e5-be33-c6a312964eae`. Full record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-COMMUNITY-WORKSTATION-FRIENDS-BUG-REPORTS.md`.

The requested privileged Sol account remains intentionally uncreated pending a
real account identity and explicit entitlement record.

## 2026-11-10 — Friends workspace visual correction

Status: **COMPLETE — DEPLOYED AND VERIFIED.** Friends now uses the shared member-shell
panel, input, button, section-heading, border, hover, and responsive patterns.
The previous native-looking controls and duplicated inner heading were removed;
search, follow, and unfollow behavior is unchanged. Focused community checks
pass 12/12. The guarded release passed 30/30 certification gates, live
anonymous smoke passed 10/10, and isolated Firefox production acceptance passed
65/65. Worker `8caaf9f4-bb79-4721-ae8b-676808e76b38` is active at 100% traffic;
rollback is `6e552552-9458-4506-ab8f-48fd8e4b45fc`. No database or production
member data changes were required.

## 2026-11-10 — Friends panel padding repair

Status: **COMPLETE — DEPLOYED AND VERIFIED.** The shared member-mode
section reset was overriding Friends' panel padding, leaving the border flush
against the search controls and section headings. Friends now restores 24px
desktop padding and 18px mobile padding with the correct cascade. A dedicated
Firefox Developer Edition regression check passes 9/9 locally and 9/9 against
production for desktop and mobile padding, inset content, panel bounds, and
horizontal-overflow safety. Search, follow, and unfollow behavior is unchanged.
The guarded release `rel-f7db083f23b2-fc3f459cdd14` deployed Worker
`0e06c46e-cca8-4548-bfe3-272b59eafbe8` at 100% traffic with rollback
`84b2fa25-3fb2-4654-94ad-b47d015ee8a3`. No database or member data changes were
required.

## 2026-11-10 — Education Center complete subject directory and clean routes

Status: **COMPLETE — DEPLOYED AND VERIFIED.** The
Education Center now presents one complete directory driven by the same 18
destinations available in Nova Editorial Workspace: 12 main education areas
and 6 legacy/reference shelves. Investigation Science and every other subject
now use direct extensionless routes such as
`/education-area-investigation-science`; the contributor publication grouping
remains available.

Focused source verification passes 26/26. Disposable Firefox Developer Edition
acceptance against the canonical local Worker passes 24/24 and against
production passes 24/24, including complete catalog rendering, desktop
containment, mobile no-overflow behavior, the Investigation Science route, and
all 18 clean destination routes. The live DOM was also checked after member
shell initialization to confirm the cards are visibly rendered. No database,
member, contributor, or production content was changed.

Production release `rel-b75e17f7518f-c38dc3ead5aa` deployed website commit
`b75e17f7518f45842dc518a1af3b4a9c68daef2b` as Worker
`eb3a2a70-3435-48b1-9100-c664f74eda19` at 100% traffic. Rollback Worker:
`0e06c46e-cca8-4548-bfe3-272b59eafbe8`.

## 2026-11-10 — Education Center organization cleanup

Status: **COMPLETE — DEPLOYED AND VERIFIED.** The
Education Center now has one clear Featured Research Shelves section titled
“Selected lessons and guides.” The redundant Quick Start block, duplicate
accordion shelves, More Resources block, and internal Nova implementation
wording were removed. The complete 18-card subject directory remains the
direct path into the library, and contributor publications now sit inside the
member content column with empty subject groups omitted. The search field now
also searches the subject cards.

Focused source verification passes 30/30. Disposable Firefox Developer Edition
acceptance against the canonical local Worker passes 25/25, including the
single-shelf structure, visible directory, desktop containment, mobile
no-overflow behavior, all 18 direct routes, and the corrected lower-page
layout. The same isolated production Firefox acceptance passes 25/25 after
release. No database, member, contributor, or production content was changed.

Production release `rel-20b70b533121-78641d086c47` deployed website commit
`20b70b5331213b97dd950bb46f0a67656c796b6a` as Worker version
`5f6e6ad8-1d81-4444-b809-25fd183e626b`; the prior Worker version
`eb3a2a70-3435-48b1-9100-c664f74eda19` remains the rollback target.

## 2026-11-10 — Education Center compact shelf correction

Status: **COMPLETE — DEPLOYED AND VERIFIED.** The previous cleanup left the
18-subject directory as large cards and retained only the older eight compact
shelves. That structure has been replaced. The Education Center now presents
all 18 catalog subjects as compact Featured Research Shelves. Each shelf
contains a direct subject guide plus the available resources from that subject
page and published contributor work, with duplicate titles removed. The shelf
headers open and close their article lists, and Investigation Science keeps its
direct clean route at `/education-area-investigation-science`.

Focused source verification passes 32/32. Disposable Firefox Developer Edition
acceptance passes 27/27 locally and 27/27 against production, including 18
shelves, zero large directory cards, a non-empty article list for every shelf,
interactive shelf opening, desktop containment, mobile no-overflow behavior,
and all 18 destination routes. No database, member, contributor, or production
content was changed.

Production release `rel-968df23cd9e5-081d4b3b685b` deployed website commit
`968df23cd9e58dac673dfdf11b116d851a61887b` as Worker version
`dd129573-0ab5-4465-97ca-ce8ba1d83f8a`; the prior Worker version
`5f6e6ad8-1d81-4444-b809-25fd183e626b` remains the rollback target.

## 2026-11-10 — Education Center subject placement and wording correction

Status: **COMPLETE — DEPLOYED AND VERIFIED.** Subject shelves now use the
catalog destination as the organizing rule, so published items remain in their
assigned subject instead of being copied into unrelated topic shelves. Each
subject keeps its own compact card with its direct subject guide and assigned
published work. Visitor-facing subject descriptions no longer call any area
“legacy.”

Focused source verification passes 33/33. Disposable Firefox Developer Edition
acceptance passes 27/27 locally and 27/27 against production, including 18
subject shelves, non-empty shelf content, shelf interaction, desktop
containment, mobile no-overflow behavior, and all 18 destination routes. No
database, member, contributor, or production content was changed.

Production release `rel-805e9c6de4a1-67d656f96bab` deployed website commit
`805e9c6de4a1260dd4222c86490dedd511eec046` as Worker version
`fb700070-b2b4-4c1b-a326-5f95553330bd`; the prior Worker version
`dd129573-0ab5-4465-97ca-ce8ba1d83f8a` remains the rollback target.

## 2026-11-09 — Community Feed Open post no-reload correction

Status: **COMPLETE — DEPLOYED AND LIVE-VERIFIED.** The compact Community Feed
**Open post** action now expands the full post in place instead of refreshing
the whole page. The canonical `post=<id>#post-<id>` URL is preserved with
`history.pushState`, and requested posts outside the first feed page are loaded
through the existing feed API. Real Education Center categories remain
clickable; General Discussion remains a feed-only label.

Focused member-home QA passed 48/48. The guarded preflight passed 30 gates,
production smoke passed 10/10, live isolated Firefox release acceptance passed
65/65, and the focused live Firefox test confirmed compact-to-full expansion
without a page reload. The disposable live post was removed after testing.

Production release: website commit
`0a2fc260fa1ccd4ac56856a6992b7de56f1e1199`, release
`rel-0a2fc260fa1c-9033787d36ef`, Worker
`13805918-374e-471a-adc9-01beb98c6e13` at 100% traffic. Rollback Worker:
`cd4a233c-8d05-4fcc-b244-b1fc01dd20dc`. Full record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-MEMBER-COMMUNITY-OPEN-POST-REFRESH.md`.

## 2026-11-09 — Nova editor caret and compact community feed release

Status: **COMPLETE — DEPLOYED AND VERIFIED.** The regular Nova Content Editor
now presents a centered document surface with an explicit native blinking caret;
the browser's normal keyboard editing behavior remains intact. Community Feed
cards are compact again, while **Open post** loads the canonical full-post view
and a visible-page five-minute check offers **Refresh now** when newer content
is detected without replacing the post being read.

Guarded preflight passed all 30 certification gates, including isolated Firefox
acceptance, StudioFlow lifecycle/deletion/ownership regressions, Notes
restoration and visual acceptance, mobile layout, and release safety. Production
smoke passed 10/10 and live isolated Firefox acceptance passed 65/65. No owner
Firefox profile, creator data, Studio records, Notes, recordings, or production
database/storage records were modified.

Production release: website/source integration commit
`f3a91b7d13e6f6e277ca145adf06e1e78857466b`, release
`rel-f3a91b7d13e6-3b622c5b1134`, Worker
`cd4a233c-8d05-4fcc-b244-b1fc01dd20dc` at 100% traffic. Rollback Worker:
`ae0e5d09-543a-4979-974d-b28174088c42`. The certified release manifest digest is
`1f6c202b81ac01ca08b944b0305a5c5b1a12c59e8135a8f665e006c3383e34c3`. Full
record: `docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-NOVA-010-EDITOR-CARET-COMMUNITY-FEED-RELEASE.md`.

## 2026-11-09 — Community feed full posts and canonical open links

Status: **COMPLETE — DEPLOYED AND VERIFIED.** Community feed cards now display
the complete post body directly, with safe clickable URLs for destinations such
as the Education Center. The existing **Open post** action remains available as
the canonical link to the post's location and now loads a requested post even
when it is beyond the first feed page. The Steve Glanz post was not modified;
the correction applies to all authorized community posts.

Focused member-home QA passed 42/42. The isolated Firefox disposable-post check
confirmed full-body rendering, a visible hash-selected target, a clickable
Education Center URL, and targeted API loading. Guarded preflight certified 30
gates, production smoke passed 10/10, and live isolated Firefox acceptance
passed 65/65. The live entrypoint returned HTTP 200 with
`public, max-age=0, must-revalidate` and contained the new feed rendering and
target-navigation markers.

Production release: website commit
`c916ee45fa2b99aaa69d0d87413da851dc879c83`, release
`rel-c916ee45fa2b-0232626142f1`, Worker
`ae0e5d09-543a-4979-974d-b28174088c42` at 100% traffic. Rollback Worker:
`2ce0b94d-5eb7-45dd-a55f-7965da187668`. Live entrypoint SHA-256:
`d5f1a20f246ff10349a8d4a4981db52aa0d13829ac1362c8d6c30faed3a33993`. Full
record: `docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-MEMBER-COMMUNITY-FULL-POST.md`.

## 2026-11-09 — Mobile member header and Messenger correction

Status: **COMPLETE — DEPLOYED AND VERIFIED.** On narrow mobile viewports, the
authenticated member greeting now occupies its own header row instead of
overlapping the Paranormal Initiative title/logo. Messenger defaults to a
minimized frame on mobile when no explicit mobile expansion preference exists;
an intentional Show action remains available and is preserved.

Focused member-home QA passed 40/40. The guarded release preflight certified 30
gates, production smoke passed 10/10, live isolated Firefox acceptance passed
65/65, and the live asset check confirmed HTTP 200 for the entrypoint and shell,
the `member-shell.js?v=56` reference, and the mobile correction logic. No
creator data or database records were changed.

Production release: website commit
`d81da4e7d08673098d68fd9f17e48959dcd95b4c`, release
`rel-d81da4e7d086-71f677773147`, Worker
`2ce0b94d-5eb7-45dd-a55f-7965da187668` at 100% traffic. Rollback Worker:
`bcb18b54-6841-46ef-9996-973ec061b251`. Full record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-MEMBER-MOBILE-HEADER-CHAT.md`.

## 2026-11-09 — Community feed posts made openable

Status: **COMPLETE — DEPLOYED AND VERIFIED.** Community feed cards now expose a
visible **Open post** action, stable `post-<id>` anchors, and hash navigation
that scrolls to and highlights the selected post. Existing comment, reaction,
share, edit, and delete controls were preserved. The focused member-home QA
passed 38/38; the guarded release preflight certified 30 gates; production
smoke passed 10/10; and live isolated Firefox acceptance passed 65/65.

Production release: website commit
`23e457e2f9dc503dbe92719db6b1dce5b06dc341`, release
`rel-23e457e2f9dc-b823f53ac601`, Worker
`bcb18b54-6841-46ef-9996-973ec061b251` at 100% traffic. Rollback Worker:
`8ad865f0-14a5-402d-8349-fbe8c9b45cd2`. Full record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-MEMBER-HOME-COMMUNITY-POST-OPEN.md`.

## 2026-11-09 — Founding Membership issuance repair deployed

Status: **COMPLETE — DEVELOPMENT VERIFIED AND DEPLOYED.** The Administration
Center Founding Memberships workflow now supports administrator-only search by
username, display name, or registered email; account selection; explicit
issuance review; and transactional assignment of the existing FC, FCT, and FAA
classes without changing numbering or capability rules.

Production release: website commit
`8798717c5577eec4cf11ad78658e382560d35504`, integrated StudioFlow source
`0061dc692b07d571f9b1e022ef3949d9a50f4bf2`, Worker
`8ad865f0-14a5-402d-8349-fbe8c9b45cd2` at 100% traffic. Rollback Worker:
`3bd482e0-00f3-4b35-ab7d-b372d8468b4d`. Live smoke passed 10/10 and isolated
Firefox release acceptance passed 65/65. No production migration or creator
data deletion was performed. Full record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-ADMIN-FOUNDING-MEMBERSHIP-ISSUANCE-REPAIR.md`.

## 2026-11-09 — StudioFlow Nova Edit production release

Status: **COMPLETE — DEPLOYED AND LIVE-VERIFIED.** StudioFlow now presents the
full shared Documents and Slides engine under the visible **Nova Edit** rail and
panel label. The underlying Notes state key remains `Notes` for compatibility,
so the accepted Notes workspace, Trash, export, Teleprompter, and project data
remain intact.

The guarded release certified 30/30 gates, built reproducibly from source
`2c7c651f34839b0115596d632f1009214e4cd63d`, passed live anonymous smoke 10/10,
and passed isolated Firefox Developer Edition acceptance 65/65 with owner
profile access false. Production Worker version
`b40bd498-5b70-43e5-be33-c6a312964eae` receives 100% traffic; rollback Worker
is `13805918-374e-471a-adc9-01beb98c6e13`.

Website release commit: `6a9dbc3bf4ac45be1de692032515b2ffc8203e24`; release
`rel-6a9dbc3bf4ac-9e05557aea4b`; manifest digest
`82ed373fdfe87003a976314a988e78eacc9d902695142694fa66c1939c5a25d0`.
Deployed StudioFlow assets are `index-BAUieVoD.js`
(`06315f104af7ddef7637d4f2001556d50a1770fc9b21e354ffaa60ab946bfb0b`) and
`index-V2mQ_DP8.css`
(`6e68faa590fb4a116d57b71bb768835e6b901c8ffdd903eee75267d4fad9899b`). The
deployed `studio/index.html` SHA-256 is
`98f050274c7855e0f74ee74d10951564715269a4557bb99d8ae959dae1dd49d2`.

The shared Documents/Slides ribbons, Presenter mode, notes, templates,
imagery, lifecycle controls, and Brand fonts support remain available. Brand
font bytes remain browser-local by design; server synchronization is deferred.
Full execution record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-NOVA-008-STUDIOFLOW-NOVA-EDIT.md`.

## 2026-11-08 — StudioFlow Nova Edit Documents, Slides, and Brand Fonts

Historical status at the time of that record: **IMPLEMENTED AND VERIFIED LOCALLY
— NOT YET DEPLOYED.** StudioFlow now
opens the shared Nova Documents and Slides engine inside a focused Nova Edit
workspace at `/studio/`. Both surfaces retain their full ribbon, templates,
imagery, speaker notes, Presenter mode, and existing persistence/lifecycle
behavior. The selected Nova Edit surface survives Firefox refresh.

The shared Brand fonts library is available in both Nova Editorial Workspace
and StudioFlow Nova Edit Documents/Slides. It accepts WOFF2, WOFF, TTF, and OTF
files, installs them through FontFace, and stores them privately in browser-local
IndexedDB. Server synchronization of custom fonts remains a documented future
limitation.

Local verification: Nova Edit 13/13; workstation 9/9; Documents parity 9/9;
Slides parity 23/23; release safety 27/27; reproducible authoritative source
staging PASS; Firefox embedded Documents, Slides, Brand fonts dialog, Presenter
entry point, and Slides refresh persistence PASS.

Source baseline: `c42bad300bc516756d7738e32f6bb201c7fc007b`. Local Worker assets:
`index-Bj1VLcW4.js` SHA-256
`4844d55113cf9bb4f97275f8268a7df04dd0abf730878ede3843380abea47af4` and
`index-DtqNaHu6.css` SHA-256
`1e4cae07240dafe0152bc944f71073163845d08ab348c0e86d3e7e21821a6a29`.
Execution record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-NOVA-008-STUDIOFLOW-NOVA-EDIT.md`.

## 2026-11-08 — Workstation editor completion deployed

Status: **IMPLEMENTED AND VERIFIED LOCALLY — RELEASE CANDIDATE READY.** The
authoritative Content Editor at `/paper-editor` now receives the completed
Documents and Slides surface through the actual linked host integration.
Documents includes persisted Page setup, Print, comments, structured merge
fields, and the existing full ribbon. Slides includes the full ribbon, layout
and template workflow, editable charts, images, tables, live thumbnails,
Presenter mode with speaker notes and next-slide context, refresh-safe routing,
and archive/Trash/restore/permanent-delete lifecycle controls.

Focused workstation verification is 9/9, the existing Documents parity suite is
9/9, the Slides parity suite is 23/23, table parity is 6/6, Nova typecheck
passes, and official localhost Firefox rendered Page setup, Review comments,
the full Slides ribbon, chart command, Presenter mode, and the existing
eight-slide paranormal deck. The exact candidate passed the guarded release
path and is live in production.

Release `rel-aa1bcd9d92fe-0cab15a20e62` is active at 100% as Worker
`3bd482e0-00f3-4b35-ab7d-b372d8468b4d`, with rollback Worker
`8ad4c7da-c4b9-4e95-9b34-915164559cf4`. Website/source commit:
`aa1bcd9d92fe69516cdb6ed485577cd7234516f2`. Integrated StudioFlow source
baseline remains `eefb7de9518809d98726062aee478a4111c921a5`.

Production Content Editor assets:

- `content-editor-nova/content-editor.html` —
  `a822139e5644fccf4571ef6e4b841e59b587b2811abe3100aa8c0cc179717c94`
- `content-editor-nova/assets/content-editor-Bz1s_Qh-.js` —
  `933e6d9d1e013bd4a9df3b22b58cf40c4062b146750f7c9116e534732c25d78c`
- `content-editor-nova/assets/content-editor-C9qlYDES.css` —
  `4624acbd09df71ac7affcc19dd86807b9e06530dd7ada93e63d6db5530027e90`
- `content-editor-nova/assets/nova-vendor-slides-CnB9V7H-.js` —
  `e16ff8150886297be969f9e6c48d060cffc5b63bf0a6626185dad5d15b47d22d`

Live production smoke passed 10/10 and isolated Firefox release acceptance
passed 65/65. Owner-facing Firefox verified the live NDE article in Documents,
Page setup and Print, the saved eight-slide paranormal deck, the complete
Slides ribbon, and Presenter mode with speaker notes and next-slide context.

## 2026-11-08 — Flagship Content Editor completion and lifecycle release

Status: **DEPLOYED AND VERIFIED IN PRODUCTION.** The authoritative editorial
workspace is `/paper-editor`, not StudioFlow `/studio`. Documents and Slides
now share the completed web editing surface, persistence, presentation
controls, and guarded archive/Trash/restore/permanent-delete lifecycle.

The active product source uses neutral Nova-owned editor naming. Historical
audit records remain preserved as historical provenance and are not active
product branding.

Release `rel-21899dea371d-bfe1a68ef72a` is active at 100% as Worker
`8ad4c7da-c4b9-4e95-9b34-915164559cf4`, with rollback Worker
`9906e87a-3332-48e2-8e8c-a7ce27f84e75`. Website commit:
`21899dea371dc2515e1d757272db190fdae0fa03`. Integrated StudioFlow source
baseline: `eefb7de9518809d98726062aee478a4111c921a5`.

Release preflight certified 30 gates. Production smoke passed 10/10 and
isolated Firefox production acceptance passed 65/65. The Documents parity
verifier passed 9/9 and the Slides parity verifier passed 23/23. The execution
record is `docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-NOVA-007-FLAGSHIP-EDITOR-COMPLETION.md`.

## 2026-11-08 — GenOffice web parity audit and core completion tranche

Status: **DEPLOYED AND VERIFIED IN PRODUCTION.** The Content Editor remains the
authoritative home for both Nova
Documents and Nova Slides at `/paper-editor`; no work was moved into
StudioFlow. The current pass adds portable image insertion, find/replace,
document view modes, layout/table controls, slide layouts, shapes, tables,
text formatting, and an explicit parity audit against the inspected GenOffice
reference checkout (`968d7d23`).

Local verification: `verify:nova-006-slides` 22/22, editor parity 8/8, Nova
typecheck PASS, `paper-editor.js` syntax PASS, diff check PASS, and the
Content Editor build PASS. Firefox on the authoritative local Worker showed
the full Documents and Slides tab strips and the new control groups.

This pass does not falsely claim literal Electron parity. Native-only or
unported systems remain documented in:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-NOVA-006F-GENOFFICE-WEB-PARITY-AUDIT.md`.

Release `rel-c78b1578295e-fa00ad69e51b` is active at 100% as Worker
`9906e87a-3332-48e2-8e8c-a7ce27f84e75`, with rollback Worker
`df85737f-5dda-4a81-89fd-76853b7d1d75`. Production smoke passed 10/10 and
isolated Firefox production acceptance passed 65/65. Live Firefox verified the
Documents and Slides workspaces at `/paper-editor`, including the full ribbon
surfaces, slide thumbnails, speaker notes, Present, and saved Slides routing.
The exact release assets and hashes are recorded in the 006F execution record.

## 2026-11-08 — GenOffice editor parity implementation

Status: **DEPLOYED AND VERIFIED IN PRODUCTION.** The existing Content
Editor now keeps Slides selected across refresh, reopens the same presentation,
and exposes functional ribbon controls across the Documents and Slides tabs.
This work remains in the Content Editor at `/paper-editor`; it is not
StudioFlow `/studio`.

The implementation uses the inspected GenOffice ribbon architecture as its
reference while retaining Nova's server-backed web model and persistence. The
focused Slides verifier now passes 19/19, Nova typecheck passes, the production
build passes, and Firefox local interaction verified both workspaces. Execution
record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-NOVA-006E-GENOFFICE-EDITOR-PARITY.md`.

Release `rel-b64510defa5a-a5958c7afcd7` is deployed at 100% as Worker
`df85737f-5dda-4a81-89fd-76853b7d1d75`, with rollback Worker
`8bbae63d-bf43-4209-9fa3-b0f789ad0073`. Production smoke passed 10/10 and
isolated Firefox production acceptance passed 65/65. Live Firefox confirmed
that `/paper-editor?workspace=slides&presentation=...` reopens the same deck
after refresh. No production document or presentation content was changed.

## 2026-11-08 — Slides ribbon layout correction deployed

Status: **DEPLOYED AND VERIFIED — EXISTING CONTENT EDITOR, NOT STUDIOFLOW.**
The Slides ribbon layout correction is live at `/paper-editor`. The root cause
was the host site's legacy global `section` styling, which applied a centered
maximum width, large padding, and an entrance animation to the GenOffice-derived
Slides ribbon. The correction is a scoped reset for the Nova Slides ribbon only;
it now matches the Documents editor's full-width toolbar geometry without
changing the global site rule.

Release `rel-52be2e9f41fa-b1264f456c60` is deployed at 100% as Worker
`8bbae63d-bf43-4209-9fa3-b0f789ad0073`, with rollback Worker
`8a0a324c-d666-4d69-afe4-30c636a392e9`. Anonymous production smoke passed
10/10 and isolated Firefox Developer Edition acceptance passed 65/65. The
owner-facing Firefox check confirmed the full-width ribbon, live thumbnails,
main canvas, and speaker notes on the production Content Editor route. No
production content was changed. Execution record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-NOVA-006D-RIBBON-LAYOUT-CORRECTION.md`.

## 2026-11-08 final deployment — GenOffice-style Slides ribbon and live previews

Status: **DEPLOYED AND VERIFIED — EXISTING CONTENT EDITOR, NOT STUDIOFLOW.**
The Nova Slides correction requested from the GenOffice reference repository is
live at `/paper-editor` on the main production website. The Content Editor now
shows a professional tabbed ribbon, grouped presentation commands, live slide
previews in the library and left rail, and the selected slide rendered on the
main canvas. The existing server-backed Nova presentation model, image controls,
speaker notes, autosave, and Presenter Mode remain in use.

The guarded release completed as `rel-b5d5819f5e3e-db5e16c2da34` from website
commit `b5d5819f5e3ee852e85961e4b57fe2bae69985da`, Worker
`8a0a324c-d666-4d69-afe4-30c636a392e9` at 100% traffic. Rollback Worker:
`78e86e60-2b45-4b73-bf89-75a53d9f7f42`. Release manifest digest:
`884647e6bcb87bc4be091658f648483cc36d7e9ba83f794c0b9b00de9fc5bc4f`.
Anonymous production smoke passed 10/10, isolated Firefox production
acceptance passed 65/65, and owner Firefox live verification confirmed the
ribbon and rendered thumbnails without creating or deleting production content.
Execution record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-NOVA-006C-GENOFFICE-RIBBON-THUMBNAILS.md`.

## 2026-11-08 amendment — GenOffice-derived Slides ribbon and live previews

Nova Slides now uses the actual GenOffice Slides renderer as its inspected
architectural reference for the professional ribbon and thumbnail workflow.
The Content Editor at `/paper-editor.html` now has a tabbed command ribbon with
Home, Insert, Design, Slide Show and related presentation tabs, while the
existing Nova commands remain connected to the same structured presentation
model and autosave path. The left slide rail and Slides library now render live
previews from the slide model instead of text-only placeholders.

The implementation is Nova-owned web code adapted from the inspected GenOffice
patterns in `apps/slides/src/renderer/components/Ribbon.tsx`,
`ribbon-shared.tsx`, `SlideThumb.tsx`, and `use-visible-thumbs.ts` at local
reference checkout `968d7d23`; Electron-only code and GenOffice branding were
not imported. Local Firefox verification shows the ribbon, real thumbnails,
slide selection, and Insert image controls. Focused Slides verification is
16/16, Nova typecheck passes, and release-safety is 27/27. The guarded release
is now complete; the live production verification is recorded above. Execution record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-NOVA-006C-GENOFFICE-RIBBON-THUMBNAILS.md`.

## TPI-NOVA — Editorial Workspace primary engine migration (2026-11-07)

Status: **DEPLOYED_AND_VERIFIED — TARGET IS THE EXISTING CONTENT EDITOR, NOT STUDIOFLOW.**
The GenOffice/Nova editing engine now enters through `/paper-editor.html` for
server-backed editorial articles. The original article body and public HTML stay
unchanged while an owner-scoped Nova working document is linked automatically;
the legacy editor remains an explicit compatibility fallback. The StudioFlow
entrypoint was restored to its prior bundle for this release and Nova Edit is
deferred to a separate StudioFlow directive.

Production D1 received the focused additive Nova schema bootstrap
`scripts/sql/tpi-nova-editorial-production-reconciliation.sql` after a verified
pre-change export. Existing production data counts were preserved. The guarded
website deployment completed as Worker
`42783d89-c43b-4ffe-87ad-e4f7eb4c4d62` at 100% traffic. Production smoke passed
10/10 and live isolated Firefox acceptance passed 65/65. The release is served
through `/paper-editor.html`; Nova Edit was not added to `/studio/`.

### 2026-11-08 amendment — legacy article conversion corrected and verified

The first live Nova pass left one legacy article in Compatibility Fallback
because its `<section><article>` wrapper was discarded by the HTML-to-Nova
converter, yielding an empty document. The API correctly failed closed with
`nova_conversion_empty`; the original article and public snapshot were not
changed. Source commit `65481d73c51224abbeab299513633445c44d96a8` now walks
semantic containers recursively and preserves their block descendants.

The corrected certified release `rel-65481d73c512-87f66192b97e` is deployed at
100% as Worker `1c063a9c-0c23-4592-ab53-351467442f80`, with rollback Worker
`42783d89-c43b-4ffe-87ad-e4f7eb4c4d62`. Certification passed all 30 gates;
anonymous production smoke passed 10/10; isolated Firefox release acceptance
passed 65/65. In the owner Firefox session, the affected legacy article now
opens with the full GenOffice/Nova ribbon and its content loaded in the Nova
document body. Evidence is preserved at
`docs/TPI-DEVELOPMENT/evidence/tpi-nova-editorial/production-genoffice-firefox-20261108.png`.
The production target remains the existing Content Editor route
`/paper-editor.html`, not StudioFlow `/studio/`; Nova Edit remains a separate
future scope.

### 2026-11-08 amendment — GenOffice Slides integrated into Content Editor

The existing Nova Slides foundation is now mounted inside the same production
Content Editor shell at `/paper-editor.html`. The top-level Documents/Slides
workspace switcher is active, and Slides uses the existing `SlidesSurface` and
server-backed `nova-presentation` records. It is not part of StudioFlow
`/studio/`.

Local Firefox acceptance created a disposable presentation, added a text
element, saved it, returned to the Slides library, refreshed the page, and
confirmed persistence. Focused verification passed 11/11; Nova typecheck,
Content Editor build, and `git diff --check` passed. The guarded production
release then completed as `rel-ae6854fcec4e-fe465822e352`, Worker
`0e9c8080-4a2d-4451-9a37-464c69301baf` at 100% traffic, with rollback Worker
`1c063a9c-0c23-4592-ab53-351467442f80`. Isolated Firefox production acceptance
passed 65/65 and owner Firefox live verification rendered the Slides workspace
inside the existing Content Editor without creating production content. This
amendment is **DEPLOYED AND VERIFIED**. The production target is
`/paper-editor`, not StudioFlow `/studio/`. Execution record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-NOVA-006A-EDITORIAL-SLIDES-INTEGRATION.md`.

### 2026-11-08 final deck refresh — Beyond the Veil

The owner-requested deck is now a ready-to-use seven-slide Nova Slides
presentation titled **Beyond the Veil: A Field Guide to Paranormal
Experiences**. It uses the Field Report theme, a real paranormal cover image,
structured slide content, speaker notes on every slide, and Presenter Mode.
Owner Firefox verification confirmed the cover title wraps cleanly, the image
does not overlap the body copy, and Presenter Mode shows the notes and next
slide. The finished deck is in the existing Content Editor `/paper-editor`
under Slides; the earlier placeholder deck was left untouched.

The final compatibility correction for older saved cover geometry is deployed
and verified as Worker `78e86e60-2b45-4b73-bf89-75a53d9f7f42` at 100% traffic,
release `rel-e7d71a009a4c-4a93cd524017`, from commit
`e7d71a009a4ceca1f08c32be3b887aa504f0f723`. Guarded preflight passed 30/30
certification gates; production smoke passed 10/10; isolated Firefox passed
65/65. The Content Editor assets are `content-editor-FxUho0bs.js`
(`104a14912935a88f29d4e61e1d56a25fb7690001d46692c75be27c5b828da6e1`) and
`content-editor-C4FZKtzb.css`
(`aeb7676f911edb6833d48222858b614a36a16ce668f885d205173552cafe9798`), with
entrypoint hash
`af6d7bcf236f9bbd1934795967de1231ac40b1dd168204448dc252989707addd`.
The production target remains Content Editor/Nova, not StudioFlow `/studio/`.

### 2026-11-08 amendment — Professional Slides and Presenter Mode

The existing GenOffice/Nova Slides engine was extended in place after local
acceptance exposed that the initial canvas could persist notes but could not
produce a presentation-ready deck. The Content Editor now provides Field
Report, Evidence Brief, Lecture, and Blank Canvas templates; editable selected
text/shape/image elements; browser image upload and image URL insertion; and a
Presenter Mode with navigation, next-slide context, full-screen control, and
speaker notes. Autosave now uses the latest title and presentation refs so
debounced saves cannot overwrite a freshly edited title with stale state.

Local Firefox verification passed: a seven-slide Field Report deck was created,
renamed to `Beyond the Veil: A Field Guide to Paranormal Experiences`, saved,
reopened after refresh, given a real image URL, and opened in Presenter Mode.
Source typecheck passed; the focused Slides verifier passed 15/15; the Content
Editor build passed; and `git diff --check` passed. Production status for this
amendment is **DEPLOYED AND VERIFIED**. The guarded release completed with
release ID `rel-6180a41bbc27-c6d2a3d3ba79`, Worker
`86c67c55-2e42-410c-98ff-2361564672ef` at 100% traffic, and rollback Worker
`0e9c8080-4a2d-4451-9a37-464c69301baf`. Isolated Firefox production acceptance
passed 65/65; live anonymous smoke passed 10/10; and the owner Firefox live
check confirmed `/paper-editor` serves the Slides workspace without creating
production content. The production target is the Content Editor `/paper-editor`,
not StudioFlow `/studio/`. Execution record:
`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-NOVA-006B-PROFESSIONAL-SLIDES-PRESENTER.md`.

## TPI-NOVA-004R6G — Member Home published fallback audit (2026-11-05)

Status: **Member Home reads only the authoritative Contributor API.** Audit found `member-home.html` never read `tpiPublishedArticles`; its article data comes solely from `/api/contributors/me/articles`. The one remaining legacy check, `a.published`, was removed from the My Content count so it uses server `status` only. The API never returns `published`, so the count is unchanged. Remaining `tpiPublishedArticles` readers (`includes.js`, `member-login.js`, `published-article.js`, `search.js`, `paper-editor.js`) are outside Member Home and were not changed. No article was migrated, enrolled or modified. Production untouched.

## TPI-NOVA-004R6F — Published revision lifecycle & legacy workflow containment (2026-11-05)

Status: **COMPLETE — PUBLISHED REVISION LIFECYCLE IMPLEMENTED — NEW EDUCATION CENTER CONTENT WORKFLOW-NATIVE — LEGACY DIRECT PUBLISH CONTAINED TO GRANDFATHERED CONTENT.** R6F is local-only; production has not received R6F and was not deployed to.

Delivered:

- **Two-dimensional model unchanged.** `articles.status` still means public publication (`draft`/`published`); `articles.editorial_status` still means workflow. No `editorial_status = published` value was introduced. A revised article is `status='published'` with `editorial_status='draft'`.
- **Start New Revision.** `POST /api/articles/:id/revision/start` (`handleStartRevision` in `functions/api/[[path]].js`) is the only way to reopen a published article. It requires the Contributor session, article ownership, `status='published'`, `editorial_status='approved'`, an open approved submission whose `outcome='published'` with `published_at`, a resolvable `approved_nova_version` in `nova_revisions`, and no later open round. Approved-but-unpublished content is refused (`409 revision_not_published`), so publication itself still never unlocks editing.
- **Guarded transition.** `lib/editorial-workflow.js` gained a pure `canStartRevision()` predicate and the single `approved → draft` transition, reachable only from this operation. It verifies `nova_items.version` equals the last published `approved_nova_version` and fails closed with `revision_version_mismatch` rather than reopening ambiguous content. There is no generic client state assignment.
- **Revision event and history.** Migration `migrations/0063_editorial_revision_started.sql` rebuilds `article_editorial_events` so the CHECK accepts `revision_started`, and recreates both append-only triggers. The event records actor, prior submission, prior approved Nova version, previous and next editorial state and timestamp; the `published` event, the published submission row and every earlier round are left untouched. The existing submission, approval and publication columns were audited and are sufficient to answer which submission and version were published, and by whom and when — no additional history table was added.
- **Public snapshot unchanged.** Revision start does not touch `articles.status`, `body_html`, `article_html`, `updated_at`, the public URL, destination, article type, owner or `created_by`. The previously published snapshot stays public for the whole revision cycle.
- **Resubmission, review, republish.** The new round reuses R6C/R6D/R6E unchanged: it pins the new current Nova version, appears in the Editorial Review Queue with its own reviewer, and publishes through the Publisher action, which replaces the snapshot atomically on the same article id and URL. Two full publish → revise → republish cycles were exercised on disposable data without duplicate articles, duplicate Nova items, lost rounds or changed ownership.
- **Contributor UI.** `paper-editor.js` shows Publication **Published** separately from Workflow **Draft Revision**, keeps the editor unlocked with normal autosave, and never implies the article became unpublished. `workflowPayload` is additive: it now also returns `publicationStatus` and `canStartRevision`, so the badge is derived from server state rather than inferred in the browser.
- **New content is workflow-native.** Article creation defaults `editorial_status='draft'`, and the create path refuses `status:'published'` server-side with `409 editorial_workflow_publish_refused` instead of relying on hidden buttons. The same refusal covers the Admin article update route for enrolled content. A new normal article therefore cannot become legacy direct-publish content.
- **Legacy containment.** The two real local articles remain `published` + `legacy` and keep their existing direct-publish compatibility until they are explicitly enrolled; nothing was mass-converted or enrolled. Enrollment through Submit for Review stays one-way — there is no return-to-legacy, no undo-enrollment and no legacy publishing path for enrolled articles. Legacy direct publish is contained, not deleted; its full removal remains deferred until actual legacy records are migrated.
- **Defect found and fixed during acceptance.** `local-ops011-article` stores the destination `education-center.html`, which is not one of the eighteen `<option>` values. Assigning it deselects every option, and `getDestinationLabel()` then threw on `selectedIndex === undefined`, silently blocking the grandfathered publish dialog. `paper-editor.js` now sets off-list destinations through `setDestinationValue()` and reads the label null-safely, so grandfathered records stay representable without editing real content.
- **Nova retention.** `lib/nova.js` now protects revisions pinned by editorial submissions from the ordinary revision-trim rule, so a version referenced by editorial history cannot become silently unrecoverable. Cleanup was not globally disabled.
- **TPI Video unchanged.** No video route, table or publish path was modified.

Verification (observed, 2026-11-05, authoritative 8787 workerd):

- `scripts/verify/tpi-nova-004r6f-revision.mjs`: **26 passed, 0 failed**, exit 0 (`node --check paper-editor.js` exit 0; `git diff --check` clean).
- Firefox Developer Edition authoritative acceptance plus Chromium smoke, disposable fixtures over real HTTP: **71 passed, 0 failed**, exit 0. The 20-step lifecycle, the second full cycle, non-owner and admin refusals, legacy grandfather compatibility, one-way enrollment and cleanup are all covered. Contributor actions and the Publisher publish action were exercised through real UI clicks; the intermediate review and approval steps were driven through the authenticated HTTP APIs, because the review UI lives in the Administration Center and is separately covered by the R6D verifier.
- Post-cleanup real-data protection: the two real local articles are byte-identical to the pre-test fingerprint `1eea9b37008c9d68`, both still `published` + `legacy`; fixture articles, Nova items, submissions, events and capability grants were removed, leaving 2 articles, 1 Nova item, 0 submissions, 0 events, 7 entitlements and 288 notifications.
- Regression: Nova 003 105/0; Nova 004 134/0; 004R2 14/0; 004R4 13/0; 004R5 67/0; 006C 13/13; 004R6B 47/0; 004R6C 23/0; 004R6D 47/0; 004R6E 60/0; 004R6F 26/0; Nova typecheck exit 0; Nova Editorial Workspace build exit 0; Administration Center build exit 0; public Education Center pages `/`, `/member-home`, `/education-center.html` and both published article URLs 200; `node --check` exit 0; `git diff --check` exit 0.

## TPI-NOVA-004R6E — Authorized publication of approved Nova content (2026-11-05)

Status: **COMPLETE — AUTHORIZED PUBLICATION OF APPROVED NOVA CONTENT IMPLEMENTED — EDUCATION CENTER SNAPSHOT PUBLISHING ENFORCED — READY FOR PUBLISHED-REVISION LIFECYCLE & LEGACY RETIREMENT.** R6E is local-only; production has not received R6E and was not deployed to.

Delivered:

- **Publisher authority.** Publication requires `EDITORIAL_PUBLISH` from an active `member_entitlements` row. `requireAdmin` is not a substitute. Admin, Contributor, Creator and `EDITORIAL_REVIEW` do not imply it, and the capabilities remain distinct. `worker.js` `hasAdministrationCenterAccess` previously admitted only `EDITORIAL_REVIEW`, so a Publisher-only account was refused at `/admin-panel`; it now accepts either editorial capability. No new app, route or shell was added: the Publisher surface is the Approved Publication workspace inside the existing React Administration Center.
- **Routes.** `GET /api/editorial/publications` (approved queue), `GET /api/editorial/articles/:id/publication` (read-only exact approved version and publication facts), `POST /api/editorial/articles/:id/publish`. All three run through `requirePublisher` in `functions/api/[[path]].js`.
- **Exact approved version.** Publication resolves `approved_nova_version` from the open approved submission and renders that version from `nova_revisions` (the live `nova_items` row only when its version equals the approved version exactly). A missing, shadowed, empty or unreconstructable approved version fails closed with `approved_version_unavailable` / `nova_item_unavailable` / `approved_document_empty`; there is no fallback to the current Nova document, no client HTML and no browser-local copy. `validatePublication` additionally refuses a changed current version (`stale_version`) and drifted reviewed metadata (`reviewed_metadata_changed`).
- **Server-generated snapshot.** New `lib/nova-document-html.js` is a deterministic server renderer that mirrors the browser Nova converter. `body_html` and the public `article_html` are derived from the approved document. A crafted request carrying `body_html`, `article_html` or publication state is refused `422 publication_payload_refused`.
- **Atomic publication.** One D1 batch updates `articles.status='published'`, `body_html`, `article_html` and `updated_at`; marks the approved submission `outcome='published'` with `published_by`/`published_at`; and appends the `published` editorial event (`approved → approved`). Article id, href, owner, `created_by`, destination and article type are preserved, and there is no unpublish window — the old public snapshot stays live until the single replacement commits.
- **Editorial state.** `editorial_status` stays `approved`; no `published` editorial state was introduced. Publication is reported to the Contributor as **Published — Live in the Education Center** with the workflow badge and locked document, and no new revision cycle is unlocked (R6F).
- **Separation of duties.** `published_by != submitted_by` is enforced server-side (`403 self_publication_refused`). Reviewer and Publisher may be the same person when both capabilities are legitimately held.
- **Admin bypass constrained.** For `editorial_status != 'legacy'`, the Admin article status route and the Admin article update route return `409 editorial_workflow_publish_refused`. Legacy articles keep their existing administrative behavior, no legacy content was mass-enrolled, and TPI Video keeps its specialized publication path and remains excluded from the publication queue.
- **Direct publication control.** The Nova Editorial Workspace still refuses direct publication of enrolled articles (R6C preserved). The settings drawer carried a second `[data-action="publish"]` button that the previous single-element toggle left visible; `applyWorkflowState` now hides every control with that action for enrolled articles.
- **Notifications.** Publication writes at most one `education` notification, only when the article was not already published, and excludes the submitter. Review actions do not notify, so publication is not announced twice.
- **No schema change.** `migrations/0062_editorial_capabilities.sql` already provided `editorial_publish`; R6E added no migration.

Verification (observed, 2026-11-05, authoritative 8787 workerd):

- `scripts/verify/tpi-nova-004r6e-publish.mjs`: **60 passed, 0 failed**, exit 0.
- Firefox Developer Edition authoritative workflow plus Chromium compatibility smoke (disposable fixtures, real HTTP APIs, least-privilege accounts): **80 passed, 0 failed**. Covers the 15-step workflow (create → submit → review → request changes → edit → resubmit → approve → public unchanged → Publisher preview → Publish Approved Version → snapshot replaced → Contributor Published indication → history retained), the published-revision proof that the old body stays live until the Publisher action, and the Publisher-only Administration Center access.
- Post-cleanup real-data protection: the two real local articles are byte-identical to the pre-test fingerprint `1eea9b37008c9d68`; fixture articles, Nova items, submissions, events, capability grants and publication notifications were removed, leaving 2 articles, 0 submissions, 0 events and 7 entitlements.
- Regression: Nova 003 105/0; Nova 004 134/0; 004R2 0 failures; 004R4 13/0; 004R5 67/0; 006C 13/13; 004R6B 47/0; 004R6C 23/0; 004R6D 47/0; 004R6E 60/0; Nova typecheck exit 0; Nova Editorial Workspace build exit 0; Administration Center build exit 0; `node --check` exit 0; `git diff --check` exit 0.

## TPI-NOVA-004R6D — Editorial Review Queue, reviewer actions & changes requested (2026-11-05)

Status: **COMPLETE — EDITORIAL REVIEW QUEUE, REQUEST CHANGES & APPROVAL WORKFLOW IMPLEMENTED — READY FOR AUTHORIZED PUBLICATION.** R6D is local-only; production has not received R6D. Publishing is still not implemented: approval records the reviewed version and never touches `articles.status` or the public snapshot. The Publisher UI is R6E. `tpi-videos.html` and its specialized publish path are unchanged.

Delivered:

- The Editorial Review Queue is a section of the existing React Administration Center (`/admin-panel`), not a new app, route or shell. Default queue = `submitted` + `in_review`, with optional Changes Requested / Approved filters. Published historical rows, legacy articles and TPI Video are excluded.
- Queue rows show title, Contributor, article type, destination, submitted date/time, round, status and the submitted Nova version, without exposing internal IDs as the primary UI.
- Review panel: read-only rendering of the exact pinned `submitted_nova_version` (newest revision at or below the version; the live item only when its version equals it exactly; otherwise `submitted_version_unavailable` and approval is blocked), submitted metadata, submission history and prior reviewer feedback. The Contributor's Nova document is never editable from review.
- Reviewer authority is `EDITORIAL_REVIEW` only, resolved from an active `member_entitlements` row. `requireAdmin` is not a substitute, ordinary Admin is not equivalent, and `EDITORIAL_PUBLISH` is not required.
- Actions: Start Review (`submitted → in_review`), Request Changes (`in_review → changes_requested`, note required) and Approve (`in_review → approved`). Reviewer ownership is recorded and one reviewer owns a round; a second reviewer cannot silently take it over (`409 review_owned_by_another_reviewer`). Reassignment is deferred.
- Feedback reuses `article_editorial_events.note`; no parallel feedback store was added. The Contributor sees Changes Requested with the reviewer note and timestamp next to the workflow controls, keeps the unlocked editor, autosave, Resubmit and no direct Publish (R6C preserved).
- Approval enforces server-side: approver ≠ submitter, no metadata drift, no version drift, pinned version resolvable, and records `approved_by`, `approved_at` and `approved_nova_version = submitted_nova_version`. The Contributor state becomes Approved — Awaiting Publication and the document stays locked with no publish, withdraw, edit or resubmit.
- All transitions run through `lib/editorial-workflow.js`; handlers do not duplicate transition rules. Reads and mutations require `EDITORIAL_REVIEW`; public APIs still never expose submitted unpublished content.
- `migrations/0062_editorial_capabilities.sql` widens the `member_entitlements` capability CHECK (rebuild, since SQLite cannot widen in place) so `editorial_review`/`editorial_publish` can be granted through the entitlement ledger at all; 0058 allowed only `creator`/`contributor`.

Verification (observed, 2026-11-05, authoritative 8787 workerd):

- `scripts/verify/tpi-nova-004r6d-review.mjs`: **47 passed, 0 failed**, exit 0. It builds its ledger from the real 0058 + 0062 + 0061 migrations and covers the §32 list, including the ledger-only grant check.
- Firefox Developer Edition human workflow (16 steps, disposable synthetic content): **39 passed, 0 failed**. Includes exact pinned render, reviewer ownership, feedback visibility, unlock/edit/autosave, resubmission as a new round with retained history, approval pinning the submitted version, and the locked approved state.
- Chromium smoke: **13 passed, 0 failed**.
- Public snapshot: `articles.status` stayed `draft` throughout review and approval; the public article API and `/education-center.html` never contained the submission.
- Regression: Nova 003 105/0; Nova 004 134/0; 004R2 14/0; 004R4 13/0; 004R5 67/0; 004R6B 47/0; 004R6C 23/0; 006C 13/13; Nova typecheck exit 0; Admin Center build exit 0; `node --check` exit 0; `git diff --check` exit 0.
- Fixture cleanup and real-data protection: the synthetic `r6d-*` contributors, sessions, entitlements, articles, Nova items, submissions and events were removed with the two append-only event triggers suspended and recreated from their exact stored definitions. Post-cleanup counts — contributors 20, articles 2, Nova items 1, submissions 0, events 0 — and both real-article digests (`d27d79670460fdc8`, `eeda6913548edbd8`) match the pre-test baseline.

## TPI-NOVA-004R6C3 — Final acceptance, fixture cleanup & milestone close (2026-11-05)

Status: **COMPLETE — CONTRIBUTOR SUBMISSION, WITHDRAWAL, LOCKING & RESUBMISSION WORKFLOW IMPLEMENTED — READY FOR EDITORIAL REVIEW QUEUE.** R6C is local-only; production has not received R6C. Not implemented: the Editorial Review queue, Request Changes reviewer controls, the Approval UI and the Publisher UI. `tpi-videos.html` and its specialized publish path are unchanged.

Acceptance evidence:

- Firefox console review for the workflow driver: 11 PASS / 0 FAIL, zero console errors, uncaught exceptions, rejected promises or failed requests captured. This closes the R6C2 console gap.
- Published-revision snapshot test: a published legacy article with a newer unpublished Nova edit was submitted for review. Status stayed `published`; `body_html` and the public `article_html` snapshot were unchanged; the public page still showed the old snapshot and excluded the newer edit; the Nova document kept the newer text. Submission did not republish.
- Public regression on 8787: `/` 200, `/api/articles` 200, `published-article.html` 200, `education-center.html` 200. Public API payload excludes unpublished Nova text.
- Fixture cleanup: the 16 synthetic R6C2/R6C3 articles, their submission rows and append-only events, 20 synthetic Nova items and the R6C2 acceptance contributor were removed in one transaction. The two append-only event triggers were suspended only on the authoritative local DB and recreated from the exact 0061 definitions, then verified. One pre-existing Nova item owned by `local-ops009-admin` was left in place because it is not a recorded fixture.
- Post-cleanup baseline: contributors 20, articles 2, published 2, drafts 0, enrolled articles 0, submissions 0, events 0.
- Real-article fingerprints: both real articles match the pre-R6C values for ID, title, `body_html`, `article_html`, destination, href, status, editorial status, type, `created_by` and `nova_item_id`. Body hashes `caa7ee940a60` and `8d3f28f290c8`.

## TPI-NOVA-004R6C2 — Contributor submission, withdrawal, locking & resubmission (2026-11-05)

Status: **COMPLETE — CONTRIBUTOR SUBMISSION, WITHDRAWAL, LOCKING & RESUBMISSION WORKFLOW IMPLEMENTED — READY FOR EDITORIAL REVIEW QUEUE.** No Admin review queue, Reviewer UI or Publisher UI yet. Legacy direct Publish remains for unenrolled articles until R6E. Production untouched.

Delivered:

- Contributor actions in the Content Editor: Submit for Review (legacy → draft → submitted, recorded as two logical transitions), Withdraw Submission (`submitted` → `draft`, only before review starts), Resubmit for Review (`changes_requested` → `submitted`). Each pins the server-resolved Nova version. Resubmission supersedes the prior open round and inserts a new one; history is retained.
- Locking: the server refuses Nova updates for linked items in `submitted`, `in_review` and `approved` (`409 nova_locked_for_review`). The React editor is set read-only from server state on load and reload.
- Direct-publish bypass prevention: enrolled articles cannot be published through `POST /api/articles` (`409 editorial_workflow_publish_refused`). Legacy articles keep direct Publish.
- Published snapshot preservation: submitting a revision of a published article does not change `articles.status`, `body_html` or the public page.
- TPI Video is excluded: no workflow badge or Submit; the specialized Publish Video path is unchanged; submission is refused server-side (`409 editorial_workflow_not_applicable`).
- Conflict state disables Submit/Resubmit; withdrawal after review start is refused and the UI refreshes to the server state.
- The Contributor read model is additive (`editorialStatus`, `submittedAt`, `submittedNovaVersion`, `locked`). It carries no reviewer fields.

Verification (observed, 2026-11-05, authoritative 8787 workerd, no restart):

- Firefox Developer Edition, disposable fixture steps 5–17: 40 PASS, 0 FAIL. TPI Video step 20: 6 PASS, 0 FAIL.
- Server/curl checks: crafted Nova PUT while submitted → 409 `nova_locked_for_review`; crafted `status=published` on enrolled article → refused; withdrawal after review start → 409 `withdrawal_refused`; published-snapshot revision keeps `body_html` hash and public page 200; legacy direct publish 200.
- Chromium smoke: 13 PASS, 0 FAIL. Chromium did not directly test editor read-only state.
- Regression: Nova 003 PASS; Nova 004 134/0; 004R2 14/0; 004R4 13/0; 004R5 67/0; 006C 13/13; 004R6B 47/0; 004R6C 23/0; Nova typecheck exit 0; `build:content-editor-nova` exit 0; `node --check` exit 0; `git diff --check` exit 0.

Known gaps:

- Firefox console capture was not wired into the driver, so no console evidence was recorded for step 21. This is not a pass.
- Disposable enrolled articles, their Nova items, submission rows and append-only events cannot be deleted through normal paths: the FK rules and append-only triggers refuse it, by design. They were not removed by weakening those rules. Four disposable legacy articles were deleted through the normal delete route. Retained synthetic rows are labelled `R6C2`.
- Real-article fingerprints match the pre-test values: `education-area-ethics-…` (body `caa7ee940a60`) and `local-ops011-article` (body `8d3f28f290c8`) remain `published`, `legacy`, with no Nova item and unchanged destinations.

## TPI-NOVA-004R6B — Editorial workflow foundation, capabilities & state-integrity engine (2026-11-05)

Status: **COMPLETE — EDITORIAL WORKFLOW FOUNDATION, CAPABILITIES & STATE-INTEGRITY ENGINE IMPLEMENTED — READY FOR CONTRIBUTOR SUBMISSION WORKFLOW.** No UI, no public-route change, no direct-publish retirement, no production deployment.

Delivered:

- Capabilities `EDITORIAL_REVIEW` and `EDITORIAL_PUBLISH` added to the existing `CAPABILITY` identifiers in `lib/membership-entitlements.js`. They are not in any membership set or legacy role mapping; Contributor, Creator, Admin and membership never imply editorial authority.
- Additive migration `migrations/0061_article_editorial_workflow.sql`: `articles.editorial_status` (default `legacy`, CHECK over the six states), `article_editorial_submissions` (one row per review round), and append-only `article_editorial_events` (UPDATE/DELETE blocked by triggers). `articles.status` is unchanged. No cascades: deletes are refused while editorial history exists.
- Centralized workflow engine `lib/editorial-workflow.js`: canonical states, the seven legal transitions (all others refused), owner/reviewer authority, self-review refusal, note requirement for changes, Nova ownership/active/version verification, stale-version checks, approval-version equality, reviewed destination/article_type change detection, and the `requireEditorialPublish` publication primitive.
- Verifier `scripts/verify/tpi-nova-004r6b-workflow.mjs` (`npm run verify:nova-004r6b`): 47 passed, 0 failed. It applies the real 0061 migration to an in-memory SQLite database.
- Authoritative local state (`.local-dev/state/v3`) received only the targeted 0061 migration after a pre-change backup (`.local-dev/backups/tpi-nova-004r6b-before-0061.sqlite`, SHA-256 in the matching `.sha256` file). Post-check: 2 articles (2 published, 0 draft) unchanged, all `editorial_status = legacy`, 20 contributors, submission and event tables empty. `/` and `/api/articles` return 200.
- Production untouched. Direct publishing, Contributor UI and Content Editor behavior are unchanged.

Regression: Nova Core 003 105/0; Nova 004 134/0; 004R2 14/0; 004R4 13/0; 004R5 67/0; 006C 13/0; R6B 47/0; Nova typecheck exit 0; Content Editor Nova build exit 0.

## TPI-NOVA-004R6A — Editorial submission, review & publishing authority architecture (2026-11-05)

Status: **ARCHITECTURE COMPLETE. IMPLEMENTATION NOT STARTED. NO SCHEMA, MIGRATION, APPLICATION, OR DEPLOYMENT CHANGE.**

- The architecture is defined in [TPI-NOVA-EDITORIAL-SUBMISSION-REVIEW-PUBLISHING-ARCHITECTURE.md](400-FUTURE-DEVELOPMENT/TPI-NOVA-EDITORIAL-SUBMISSION-REVIEW-PUBLISHING-ARCHITECTURE.md).
- Editorial review, editorial publishing, and the Contributor submission workflow are **not implemented**. Current code still allows direct publication paths that R6 must retire or constrain.
- Publication visibility (`articles.status`) and editorial workflow (`articles.editorial_status`) remain separate. Public articles keep the last approved snapshot while a new Nova revision is reviewed.
- Next phase: **TPI-NOVA-004R6B** (workflow foundation).

## TPI-GOVERNANCE-003B2 — Future-work reconciliation (2026-11-03)

Status: **DOCUMENTATION ONLY. NO APPLICATION, DATABASE, ASSET, OR DEPLOYMENT
CHANGE.**

- Every major future system raised during 003A, 003B, and 003B1 is now indexed in
  [TPI-FUTURE-WORK-REGISTER.md](400-FUTURE-DEVELOPMENT/TPI-FUTURE-WORK-REGISTER.md),
  so none of it depends on memory: the 003C governance architecture, Full Platform
  Authority, Gold/Silver/Bronze medallion policy, Board medallions, additional
  artwork, staff-tier and Assistant Administrator finalization, oath implementation,
  the complete Community Standards, the Community Help Center, the Internal Help
  Desk, Mystic policy assistance, Honors & Distinctions, the Honors Wall,
  achievements, education credentials, profile Primary Distinction, the
  Administration Center audit, the Moderator badge derivative cleanup, and the
  operational master release-packaging exclusion.
- The register records the split that must survive implementation: public/member
  policy (Community Standards, Help Center), internal/staff procedure (Internal Help
  Desk, permission matrices, escalation, Administration Center guides), and
  authoritative Markdown as the single source of truth.
- It also records what the owner still owes: additional badge and medallion artwork,
  and the landmark policy decisions (Silver/Bronze qualification, staff tier list,
  Assistant Administrator status, Board and office definitions).
- Nothing was built, authored, generated, repaired, or deployed. Unchanged behavior:
  the admin gate is still an owner-or-admin session, the registry is still empty, and
  no staff tier, standards page, help surface, or support knowledge source exists.
- Next governance section: **TPI-GOVERNANCE-003C — Governance, Board & Executive
  Leadership Architecture**. None of the deferred items block it, and the owner has
  deferred starting 003C: current development priority is the **Nova product
  family** (StudioFlow Nova Edit and the Nova Editorial Workspace), beginning
  with architecture and repository investigation before any implementation.

## TPI-GOVERNANCE-003B1 — Constitutional values, staff oath, and help architecture (2026-11-03)

Status: **DOCUMENTATION ONLY. NO ROLE ASSIGNMENT, PERMISSION CHANGE, OR
DEPLOYMENT.**

- The operational-role architecture now states the organizational principles that
  bound staff authority: freedom of religion, freedom of speech, and freedom of the
  press, an evidence-first rule that protects both skepticism and belief, a clear
  boundary that freedom of expression does not authorize abuse, viewpoint-neutral
  moderation, protection for criticism of TPI itself, and a prohibition on using
  staff authority for retaliation or to protect friends.
- A working **Moderator / Administrator oath** is recorded, approved in principle by
  the owner, with final wording refinable before implementation. The principles it
  states may not be weakened.
- Recusal ("recuse and escalate"), fair and documented process, equal application
  regardless of Founder, Board, Medallion, Founding, Creator, Contributor, or staff
  status, and a rule that Honors Wall service recognition never reactivates expired
  authority are recorded.
- Future roadmap only, nothing built: a full **TPI Community Standards** system, a
  member-facing **Community Help Center**, a staff-facing **Internal Help Desk**, the
  rule that authoritative governance Markdown is the single source of truth, and the
  rule that Mystic may explain policy but never invent it.
- Unchanged behavior: the admin gate is still an owner-or-admin session; no staff
  tier, oath record, standards page, help center, or support knowledge source exists.

## TPI-GOVERNANCE-003B — Operational roles and administrative authority (2026-11-03)

Status: **DOCUMENTATION AND ASSET IMPORT ONLY. NO ROLE ASSIGNMENT, PERMISSION
CHANGE, OR DEPLOYMENT.**

- The operational staff architecture is recorded in
  [TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md](400-FUTURE-DEVELOPMENT/TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md):
  the Moderator family (Moderator, Senior Moderator, Lead Moderator), the
  Administrator family (Administrator, Senior Administrator, Platform
  Administrator), and a separate Owner/Founder authority that is not another
  admin tier.
- Operational roles are appointed, never purchased, earned from posting,
  inherited from Founding status, or inferred from artwork. Free Members may hold
  them; paid, Creator, Contributor, and Founding states simply coexist.
- The historical **Assistant Administrator** term is preserved as an unresolved
  role question instead of being erased.
- Current implementation is recorded factually and separately: a single
  `owner`/`admin` role value gates the admin routes and APIs; no Moderator tier,
  capability table, staff directory, or role assignment exists.
- Operational badge masters imported byte-identically to
  `assets/operational-roles/masters/` (Administrator and Moderator, 1024×1024).
  Both were delivered as `.png` files that are actually JPEG without alpha, and
  the Moderator file has a **baked checkerboard matte**; the defects are recorded,
  not repaired, and the masters are excluded from publishing.
- Senior/Lead/Platform insignia remain undecided; no artwork was invented.

## TPI-GOVERNANCE-003A — Core membership and professional access architecture (2026-11-03)

Status: **DOCUMENTATION ONLY. NO APPLICATION, DATABASE, OR DEPLOYMENT CHANGE.**

- The authoritative membership and professional-access model is now recorded in
  [TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md](400-FUTURE-DEVELOPMENT/TPI-MEMBERSHIP-AND-PROFESSIONAL-ACCESS-ARCHITECTURE.md).
  It fixes the central rule that community membership, payment, professional
  application access, Founding status, organizational role, achievement, honor,
  and authority are separate concepts, and that one never silently replaces
  another.
- Layers are recorded as TPI account → community membership (Free/Paid) →
  professional capability package (Creator / Contributor / Creator + Contributor)
  → optional historical identity (Founding Creator / Founding Contributor /
  Founding All-Access), resolved cumulatively server-side.
- Absolutely preserved: purchasing Creator, Contributor, or both never creates a
  Founding Membership; Founding memberships are conferred, not purchased, and are
  complimentary lifetime memberships; each class remains capped at 50 with no
  `FC-051`, `FCT-051`, or `FAA-051`.
- Commercial items stay unresolved and are listed rather than guessed: paid-plan
  marketing name, prices, combined-plan pricing, term options, trial policy,
  premium-member feature list, billing provider, cancellation/refund policy, and
  public commercial terms.
- Moderator/Administrator architecture was intentionally excluded; it is the next
  section, TPI-GOVERNANCE-003B.

## TPI-CREATOR-INCENTIVE-001RA — Production acceptance and D1 reconciliation (2026-11-03)

Status: **COMPLETE — OWNER ACCEPTED IN PRODUCTION. NO MUTATIONS.**

- Release `rel-d5fca8ea960d-5007997d873d` (Worker `0568cce9-f286-4156-892e-70f87b2d4029`)
  runs the Founding system in production: three classes, permanent numbering,
  cumulative entitlements, server-side badges, Administration Center issuance.
- Owner visual acceptance passed on the live Administration Center: three class
  cards with green/blue/purple badges, 50 left each, 0 issued, next numbers
  `FC-001`/`FCT-001`/`FAA-001`, empty registry, no local review data.
- The 001R claim that migrations 0055–0057 were absent from production was
  incorrect. All four `studio_note*` tables and seven note indexes exist in
  `tpi_contributor_portal` (`f36b9161-b517-4634-9857-bef4147cefe3`). The apparent
  gap was caused by a wrong `LIKE 'studioflow_note%'` pattern and by the
  `d1_migrations` ledger recording only `0001`/`0002` because later migrations
  were applied with `execute --file`. Classification B — no repair needed.
- `FAA-001` remains unissued; the registry is empty and no number was consumed.

## TPI-CREATOR-INCENTIVE-001B — Badge integration and production readiness (2026-11-03)

Status: **IMPLEMENTED AND CERTIFIED LOCALLY. NOT DEPLOYED; MIGRATION 0058 STILL
PENDING PRODUCTION.**

- Founding badges are wired to the server-side class mapping and render in the
  Administration Center (class cards, permanent registry, capability inspection),
  the member's own profile, and the public contributor profile. All-Access shows
  one purple badge, never two.
- Badge masters remain in Git but are excluded from the published asset package
  by `.assetsignore`; only optimized derivatives are deployed (≈2.36 MB published
  instead of ≈10.3 MB of masters and unpublished Society artwork).
- The owner's real assignment workflow is tested end to end with an existing
  account username, no SQL and no database ids.
- Remaining display work: community feed author identity (no per-author badge
  field yet).

## TPI-CREATOR-INCENTIVE-001 — Founding Membership foundation (2026-11-02)

Status: **IMPLEMENTED AND TESTED LOCAL/DEVELOPMENT ONLY. PRODUCTION NOT
DEPLOYED.**

| Item | State |
|---|---|
| Founding Creator / Contributor / All-Access registry | **IMPLEMENTED LOCALLY** — permanent numbers, 50/class lifetime limit, non-recycled |
| Cumulative Creator + Contributor capabilities | **IMPLEMENTED LOCALLY** — All-Access is the union; dual access cannot lose a capability |
| Admin assignment workflow | **IMPLEMENTED LOCALLY** — canonical Administration Center, owner/admin server-side |
| Creator Incentive eligibility | **IMPLEMENTED LOCALLY**; all financial rules **UNRESOLVED — OWNER DECISION REQUIRED** |
| Nova entitlements | **CONTRACT ONLY** — Nova is not built and not active |
| Production D1 / Worker | **UNTOUCHED** — Worker `daa5aee1-304f-4e96-89a8-86aac2df98e9` |

Evidence: membership suite 99/99, isolated API E2E 282/282, Firefox Developer
Edition + Chromium acceptance 22/22. Records:
[directive](100-DIRECTIVES/TPI-CREATOR-INCENTIVE-001.md),
[registry specification](TPI-FOUNDING-MEMBERSHIP-REGISTRY.md),
[security model](007-SECURITY-AND-PERMISSIONS.md),
[browser evidence](../audits/TPI-CREATOR-INCENTIVE-001/).

Owner review environment: `http://127.0.0.1:8787/admin-panel#founding-memberships`
(local Worker). Sign in as `local_admin`, open **Creators → Founding
Memberships**. Representative review accounts are prepared with
`npm run local:creator-incentive-review`; credentials are written only to the
gitignored `.local-dev/creator-incentive-review.json`.

Addendum **TPI-CREATOR-INCENTIVE-001A** (2026-11-03) corrected the assignment
form spacing and hardened review-data isolation. The view now shows a single
server-decided **Local review data** notice in development only. Local fixtures
(`FC-001`, `FCT-001`, `FAA-001`, `FC-002`, `FC-003`) are not in the migration, not
in build output, and not reachable from production; a clean production registry
starts at 50 left / 0 issued with next numbers `FC-001`, `FCT-001`, `FAA-001`.

Official badge artwork is now version-controlled in two separate families:
`assets/founding-memberships/masters/` (masters preserved unchanged, including
the owner's `FoundingAllAcceessBadgeMaster.png` spelling) and
`assets/society-leadership/masters/` (`Gold Badge.png`, `Silver Badge.png`,
`Bronze Badge.png`, preserved byte-for-byte). Both families have web derivatives;
neither is assigned automatically.

### Recorded future quality requirements

Both items stay in the roadmap until completed; neither is part of 001A.

- **TPI Administration Center — Complete Quality & Functional Audit** — every
  navigation item, form, control, authorization path, account isolation,
  responsive layout, Firefox Developer Edition and Chrome parity, visual
  consistency, accessibility, error/loading/empty states, confirmations, audit
  behavior, deep links, refresh persistence, data integrity, and production
  safety. Target: complete, consistent, secure, and flawless for normal
  administrative use.
- **Founding Membership Badge Integration & Community Display** — implement and
  verify badge display on member profile, feed/member identity, Administration
  Center, and membership surfaces using the imported derivatives.
- **TPI Society / Leadership Badge System** — Gold/Silver/Bronze qualification
  and assignment rules, assignment authority, audit history, profile and
  community display, leadership/advisory display, interaction with Founding
  Membership badges, revocation/status handling, and server-side authority
  mapping. Policy is **UNRESOLVED — OWNER DECISION REQUIRED**; assets are
  preserved but nothing is assigned.


## TPI-DOCS-ROADMAP-001 — Roadmap synchronization (2026-11-02)

Status: **COMPLETE — DOCUMENTATION ONLY.** No application code, permission,
membership, Education Center, StudioFlow, database, or production change was
made or deployed.

### Current position

| Item | State |
|---|---|
| **TPI-OPS-005** — certified immutable release | **COMPLETE — CERTIFIED IMMUTABLE RELEASE WORKFLOW VERIFIED** |
| **StudioFlow Core** | **STABLE / MAINTENANCE MODE** — not the active development track |
| **Next primary track** | **Creator Incentive System + Dual-Member Permissions** |
| Production Worker | `daa5aee1-304f-4e96-89a8-86aac2df98e9` (untouched by OPS-005) |

### TPI-OPS-005 — operations optimization track closed

A release is now proven **once**. `npm run release:certify` (alias
`npm run release:preflight`) builds one immutable candidate, runs the complete
certification suite against it, and seals a cryptographic certification binding
every deployable file. `TPI_PRODUCTION_DEPLOY=approved npm run release:production`
verifies that certification and deploys those exact bytes; it no longer repeats
the certification suite.

Measured: modelled release sequence went from **~13:46.5** to **~7:12.6**
(−47.7% versus the immediately previous workflow, −52.0% versus the original
workflow). Production-time protections were preserved and not reused:
authorization, live read-only schema readiness, Worker identity, rollback
capture, final parity recheck, and full production acceptance. Mutation, source
drift, dependency drift, release-tooling drift, parity loss, wrong branch, dirty
tree, and tier downgrade all fail closed.

Implementation committed and pushed at `dde68d9`.
[Completion record](300-COMPLETED-WORK/TPI-OPS-005-CERTIFIED-IMMUTABLE-RELEASE-CANDIDATE.md).

### StudioFlow

**STUDIOFLOW CORE — STABLE / MAINTENANCE MODE.** The current completed
production release remains **TPI-STUDIOFLOW-137R — COMPLETE — PRODUCTION
VERIFIED** (see below). StudioFlow is not the active primary development track.

Two StudioFlow phases remain deferred and unscheduled:

- **Guest / Invite Connected Studio** — invitation, guest connection, guest
  Studio/session, permissions, isolation, participation, disconnect/reconnect,
  completion.
- **Livestream Destination Connections** — external destination authentication,
  account linking, destination management, connection status, errors, security,
  broadcast routing.

The next StudioFlow-related work is **StudioFlow Nova Edit**, which is a Nova
authoring suite inside StudioFlow, not a playback or production feature.

### Next primary development track

**Creator Incentive System + Dual-Member Permissions.**

A real dual-access member already exists and needs correct combined
capabilities. The permission model must support **cumulative** legitimate
entitlements: one role or membership must never overwrite another. Combining
Creator and Contributor access must preserve both capability sets, and that
combination is now a permanent regression requirement.

Access model:

- **Creator** — Creator capabilities, StudioFlow access, StudioFlow Nova Edit,
  production-oriented document and presentation creation.
- **Contributor / Editorial member** — Nova Editorial Workspace, professional
  document and presentation capability, Education Center workflow appropriate
  to their editorial permissions.
- **Dual / All-Access** — both, through one account.

### Nova product family

Nova is TPI's unified document and presentation technology with one shared core
and two experiences: **StudioFlow Nova Edit** (streamlined production edition,
Documents + Slides, no editorial authority required) and **Nova Editorial
Workspace** (full professional edition, Nova Docs + Nova Slides, Education
Center integrated).

- PDF is **export-only**; no standalone PDF editor is on the roadmap.
- **AI is not required** for Nova's initial development.
- GenOffice is recorded as an **Apache-2.0 architectural/component reference to
  evaluate later**, not an adoption decision.

[TPI Nova architecture record](400-FUTURE-DEVELOPMENT/TPI-NOVA-PRODUCT-FAMILY-ARCHITECTURE-AND-ROADMAP.md).
The canonical development sequence is the top section of
[`../planning/TPI-DOCS-001_MASTER_STATUS.md`](../planning/TPI-DOCS-001_MASTER_STATUS.md).

## TPI-STUDIOFLOW-137R — Production Notes release (2026-11-02)

Status: **COMPLETE — PRODUCTION VERIFIED.**
**STUDIOFLOW CORE — STABLE / MAINTENANCE MODE.**

The complete Notes workspace and the approved Home layout are live at
https://paranormalinitiative.com.

- Production Worker: `daa5aee1-304f-4e96-89a8-86aac2df98e9` (immediate rollback
target `da8c4757-f9d9-42ce-af79-da7a0362c786`).
- Source `eefb7de`, website `fff7609`; assets `index-ChuELpxr.js`
`7e740646…` and `index-CxnemqTQ.css` `cc1c0142…`.
- Migrations `0055`, `0056`, `0057` applied **individually, in order, by file** —
never `wrangler d1 migrations apply`. Production went from 68 tables / 205
indexes and zero note objects to 72 / 218 with 4 Notes tables and 7 indexes.
- D1 Time Travel verified beforehand; Worker rollback does **not** reverse a
schema migration.
- Production acceptance: Notes 37/37, Notes visual 67/67, true 390/375 viewport
19/19, anonymous smoke PASS, live Firefox acceptance PASS.

The TPI-137A limitation is closed: Firefox cannot render below 500 CSS px on this
host, so a same-origin 390/375 px frame provides a genuine CSS viewport and was
run against production.

Addendum 01 corrects two Home defects found after the release started. The
five-across Create row had never reached this lineage — its approved fix
`c2a6f6e` is not an ancestor of `f44f3a0` — so the fifth card pushed
Teleprompter onto a second row. Five-across is now restored and adapted to the
real content width (starts at 1280px with a compact icon band up to 1360px), and
the Home My Studios header gained an 18px separation from the list below.
Home layout acceptance passes 41/41; preflight is READY at `e1ac570`.

The owner accepted both corrections and the addendum deployed as Worker
`daa5aee1…`, verified live: Home 41/41, mobile 19/19, Notes 37/37, Notes visual
67/67, live Firefox acceptance 64/64. No database change accompanied it.
[Record](100-DIRECTIVES/TPI-STUDIOFLOW-137R-PRODUCTION-NOTES-RELEASE.md).

StudioFlow feature work is now frozen. Guest / Invite Connected Studio and
Livestream Destinations remain separate future phases; primary development
attention moves to Creator Incentive Directives, including dual-member access.

## TPI-STUDIOFLOW-137A — Notes workspace visual restoration (2026-11-02)

Status: **VISUAL RESTORATION AND LOCAL ACCEPTANCE COMPLETE — PRODUCTION
DEPLOYMENT NOT AUTHORIZED.**

The Notes workspace restored by TPI-137 was functioning but not presenting as
approved. Owner inspection was correct: the interface was rendering with
browser-default controls. The cause was CSS that never reached the browser.

- Source commits `5d557d2`, `57effec`, `9113baf` on
`codex/tpi-137-notes-restoration`.
- Assets: `index-PJlxxK5f.js` SHA-256 `7e740646…` (JavaScript unchanged from
TPI-137) and `index-7UmKFnSB.css` SHA-256 `9a815d2b…`.

The TPI-137 port selected CSS rules line by line from a partly minified
stylesheet. Every block that shared a line with another matching block was
dropped, so `.notes-nav-item` had no rules at all and each organization control
fell back to an unstyled `<button>` with a 2px grey border. The port also lost
two comment openers, each of which caused a parser to discard the rule that
followed: the approved `max-width:1800px` and, far worse,
`container: notes-workspace / inline-size`. Without that container every
`@container notes-workspace` rule was dead, so the workspace kept its wide
three-column grid at all sizes and overflowed viewports below 1280.

Two further rules were genuine compatibility adaptations: the library list's
implicit max-content grid column stretched cards to 617px inside a 291px panel,
and the card title row could not shrink, so long titles were clipped by the
panel edge instead of using the approved ellipsis.

A rule-level parity audit against `a6784cf` now reports 280 of 284 approved
Notes selectors present and identical, zero conflicting and zero extra. The four
unported selectors are `.notes-global-folder-action*`, which no component in
either version ever referenced.

Measured on the authoritative `8787` Worker in Firefox Developer Edition: nav
items back to 34px flat rows with the approved hover and selected states, the
container live, no horizontal overflow at 1920, 1440, 1280, 1024, 834, 390 or
375, and no clipped controls. The new maintained suite
(`verify:studioflow-137a-notes-visual`) passes **67/67** and is now a
`release:preflight` gate. TPI-137 36/36, TPI-133 44/44, TPI-134 43/43, TPI-135
30/30, TPI-087 40, TPI-088 32, TPI-089 26 and the continuity guard all pass.

Production remains blocked on the unauthorized Notes schema migrations
`0055`–`0057`; the production schema gate is unchanged and was not weakened.
[Record](100-DIRECTIVES/TPI-STUDIOFLOW-137A-NOTES-VISUAL-RESTORATION.md).

## TPI-STUDIOFLOW-137 — Complete Notes workspace restoration (2026-11-02)

Status: **IMPLEMENTATION AND LOCAL ACCEPTANCE COMPLETE — PRODUCTION DEPLOYMENT
BLOCKED PENDING AUTHORIZED NOTES SCHEMA MIGRATION.**

The complete Notes workspace approved under the TPI-STUDIOFLOW-122 family is
restored on the released lineage. The historical branch was not merged; the
Notes modules were ported onto `f44f3a0` in the isolated worktree
`/Users/toddknipple/Documents/StudioFlow/web-137` on branch
`codex/tpi-137-notes-restoration`.

- StudioFlow source: `19c69d4` (port) and `cd5e88b` (refresh survival).
- Website repository: `44147cd` (baseline, staged assets, suites and guards),
documentation `8d5d98f`.
- Staged assets: `index-LICdWePz.js` SHA-256 `7e740646…`, `index-8ILYgVKI.css`
SHA-256 `bd696c76…`; both builds of the approved commit were identical.

The workspace now appears in its original two locations — a Notes card on the
Home create grid between On-Air webinar and Teleprompter, and a Notes entry in
the main navigation between Destinations and Teleprompter. The older right-side
Notes scratchpad is unchanged and stays a separate feature; the historical
implementation's rail takeover was deliberately not ported because the
directive forbids replacing the existing utility.

One genuine compatibility defect was found and fixed: the maintained
`studio/workspace-bridge.js` rewrites the stored route to `studio` during
startup hydration, which replaced a refreshed Notes page with the recording
surface. `cd5e88b` honours the session Notes intent when resolving the initial
route and clears it for every other route.

Firefox Developer Edition acceptance passes 36/36 on the authoritative
`http://127.0.0.1:8787` Worker. Existing regressions pass unchanged: maintained
Firefox 64/64, TPI-133 44/44, TPI-134 43/43, TPI-135 30/30, TPI-087 40,
TPI-088 32, TPI-089 26, Notes continuity and lineage 14/14, release safety.

Production is **blocked**. Read-only inspection of D1 `tpi_contributor_portal`
returned no `studio_note_*` table or index, so the restored interface could not
persist there. Migrations `0055`–`0057` are not authorized by this directive.
The guarded release now enforces the gap: `release:production` runs
`scripts/verify/tpi-studioflow-137-production-schema.mjs` and refuses to deploy
while a required table is missing, and `release:preflight` runs a continuity
guard that fails if a new approved commit does not descend from the previous
one or if the Notes entry points and bundle markers disappear.

The protected uncommitted owner work in
`/Users/toddknipple/Documents/StudioFlow/web` (`src/App.tsx`,
`src/styles.css`) is byte-identical to its state before the directive.
[Record](100-DIRECTIVES/TPI-STUDIOFLOW-137-COMPLETE-NOTES-RESTORATION.md).

## TPI-STUDIOFLOW-136 — Complete Notes workspace recovery investigation (2026-11-02)

Status: **INVESTIGATION COMPLETE — RESTORATION PLAN PENDING OWNER AUTHORIZATION.**
Investigation only: no implementation, merge, migration or deployment was
performed or authorized.

The missing complete Notes workspace was located intact and unmodified on the
unmerged StudioFlow branch `codex/studioflow-122-notes` at `a6784cf`
(worktree `/Users/toddknipple/Documents/StudioFlow/web-122`). It was **not
deleted**: `git merge-base main codex/studioflow-122-notes` is `main`'s own HEAD
`9f85f9d`, and the branch is 62 commits ahead, 0 behind.

It reached production under TPI-STUDIOFLOW-126F (source `a6784cf`, Worker
`1a6a2ab5-db20-4e43-9d10-18a0a1edc784`, deployed `2026-11-01T04:54:30.803Z`,
artefact `index-CSTJXjG2.js` SHA-256 `94d5ba56…` — hash-verified and containing
the `notesWorkspaceIntent` marker) and TPI-STUDIOFLOW-127 (source `ded5a3d`,
Worker `4108a0d7-5833-435f-8a0b-f6be8c1c8b27`).

The loss mechanism is the release baseline, not a deletion. When the TPI-130
artefact baseline was approved on 2026-11-01 01:54, `scripts/studioflow-release-baseline.json`
moved `source.approvedCommit` from the Notes tip `a6784cf` to the **sibling**
lineage `859febc` (main → deletion work → 131 → 133 → 134). That sibling lineage
has never contained Notes, so TPI-130 through TPI-135R all shipped without it.
TPI-130 (Worker `99ca2347-3181-4525-b9eb-d28cb61cf42a`) is the release that
removed Notes from production.

Current live production is provably the `f44f3a0` build: the live JavaScript
recorded in TPI-135R (`index-D9yljEwa.js`, SHA-256 `e317fc07…`) is byte-identical
to the repository artefact, whose marker counts are `notesWorkspaceIntent` 0,
`NotesView` 0, `studioflow.notes.layout` 0, but `studioflow.studioNotes` 1 and
`"Write private show notes"` 1 — only the old far-right scratchpad remains.

Chrome was not involved. Firefox Developer Edition was the authoritative
acceptance browser in every Notes directive; Chrome appears only as a
compatibility target for screen sharing and as the only browser supporting the
Notes local-folder sync (File System Access API, which fails closed in Firefox
with a documented ZIP fallback). The TPI-134 handoff independently recorded
"Chrome was not involved".

Production never had the Notes D1 schema — both Notes-bearing releases record
"no D1/R2 migration" — so the deployed Notes UI could not persist and **no
owner Notes data existed in production to lose**. Locally the schema exists with
204 notes, 3 collections, 429 revisions and 0 attachments, but 203 belong to an
automated test account and 184 are already in Trash; exactly one genuine
owner-authored note exists (`Crosroads of the Unknown`, 204 characters).

Recommended restoration is **Option C — Compatibility Adaptation**: an isolated
worktree at `f44f3a0`, the three new Notes modules (`NotesView.tsx`,
`projectExport.ts`, `projectFolderSync.ts`) brought across unchanged, the Notes
styles appended additively, the `App.tsx` integration hand-applied against the
release lineage, migrations 0055–0057 applied to production only under separate
authorization, plus an account-backed save/reload gate and the TPI-131/133/134/135
regression suites. Risk: **HIGH**, driven by `App.tsx` collision with the protected
uncommitted owner work. Re-pointing the old verified Notes bundle was rejected:
it predates five shipped releases and would regress TPI-131, 132R, 133, 134 and 135.

The protected uncommitted work in `/Users/toddknipple/Documents/StudioFlow/web`
(`src/App.tsx`, `src/styles.css`) was preserved untouched. No build, staging,
migration or deployment command was run, and production inspection was read-only.
[Investigation record](100-DIRECTIVES/TPI-STUDIOFLOW-136-COMPLETE-NOTES-RECOVERY-INVESTIGATION.md).

## TPI-STUDIOFLOW-135 — Scene production item persistence (2026-11-01)

Status: **CORRECTED AND VERIFIED LOCALLY — PRODUCTION NOT AUTHORIZED AND STILL
RUNS THE PRE-FIX BUILD**. The TPI-134R reload loss was reproduced and
root-caused: two independent allow-lists discarded the Scene
`teleprompter-script` kind. `normalizeStudioConfiguration()` in
`functions/api/[[path]].js` rebuilt every saved workspace state from a six-kind
list that excluded it (and had no field for `teleprompterScriptId`), so the row
the browser sent was dropped on save — measured directly: a PATCH carrying five
rows produced a stored workspace with four, and the reload then honestly
restored four. `normalizeScenePanelItems()` in `studio/workspace-bridge.js`
carried the same list and stripped the row a second time during restore
hydration. Both now accept the kind and preserve the script reference, and
`applyState` gives a snapshot with no stored panel that Studio's own default
panel instead of leaving the previously open Studio's rows in place.

Verification is account-backed: the new maintained suite
`verify:studioflow-135-scene-persistence` (wired into `release:preflight`)
creates disposable Studios through the real dashboard, inspects the stored
snapshot, reloads the page for real, exercises the live Teleprompter, switches
Studios, removes a row, replays a legacy snapshot and purges its own records.
It passed **30/30** on the isolated disposable Worker and **30/30** on the
authoritative `8787` Worker, and **30/30** inside the full guarded preflight,
which finished **READY with exit 0** at `sourceCommit 05ac821` with
`rollbackVersion 4de115db`. Adjacent suites also pass: TPI-134 Firefox (43/43),
TPI-133 (44/44), TPI-037 Scenes panel (20/20), Studio ownership, Studio deletion
and deletion safety, release safety (21 checks) and TPI-107 provenance. No bundle hash changed (the React bundle was not
modified); only the unbundled bridge was restaged.

**Status: DEPLOYED AND VERIFIED IN PRODUCTION (TPI-135R) — owner acceptance
pending.** Before release, preflight caught a real flaw in the new legacy-snapshot
handling: the gate read the Scenes panel once at mount, racing the application's
restore, and the bridge left the previously open Studio's rows reachable. Fixed
in `44c707f`: the browser copy is reset to that Studio's own default panel, and
the check now waits for the panel to settle and asserts that every restored row
belongs to this Studio. Released 2026-11-02T01:14:50Z as Worker
`3082475b-80ad-4557-82d6-32618e3f7079` from website commit `44c707f` (rollback
`4de115db`); live account-backed persistence passed 30/30 on
`https://paranormalinitiative.com` and the served bundle is byte-identical to the
owner-accepted build.

[Full record](100-DIRECTIVES/TPI-STUDIOFLOW-135-SCENE-PRODUCTION-ITEM-PERSISTENCE.md)
· [release record](100-DIRECTIVES/TPI-STUDIOFLOW-135R-PRODUCTION-RELEASE.md).

## TPI-STUDIOFLOW-134 — Scene drag-and-drop and production colors (2026-11-01)

Status: **DEPLOYED AND VERIFIED IN PRODUCTION (TPI-134R) — owner acceptance
pending, one live limitation recorded**. Released at 2026-11-01T22:37:19Z as
Worker `4de115db-6537-41b5-9bf7-ae99cb0e20fc` from website commit `ea2ca6a`
(rollback `71a5293d`). Live verification confirmed the served bundle is
byte-identical to the approved build, all five production colors with
full-perimeter borders, the purple script drop path, and the Scene script
cuing the live presenter teleprompter paused at the beginning with Play, Pause
and Reset working. **Live limitation:** a dropped Scene script row does not
survive a page reload in an account-backed Studio, because the workspace
snapshot carries only `broadcast`, `settings`, `recording` and `configuration`
and never `scenePanelItems`; the restore path therefore replaces the
browser-local rows with server defaults. No previously working behavior
regressed, and rollback was not triggered; the fix shipped in TPI-STUDIOFLOW-135
together with its TPI-STUDIOFLOW-135R release.
See the [release record](100-DIRECTIVES/TPI-STUDIOFLOW-134R-PRODUCTION-RELEASE.md).

Original diagnosis: the missing production-item colors, highlighting, icon
colors and Teleprompter-to-Scenes drag were caused by **divergent StudioFlow
source lineages**, not by a browser change and not by a rendering defect.
TPI-STUDIOFLOW-125 (`77f32d9`) and TPI-STUDIOFLOW-126A (`a6784cf`) live only on
`codex/studioflow-122-notes`; the revisions that built TPI-130 through TPI-133
descend from `main` (`9f85f9d`) and never contained either. The shipped bundle
had **zero** `data-production-kind` attributes and **zero**
`--production-item-*` custom properties, so the maintained bridge stylesheet
correctly fell through to its generic blue fallback and every row lost its type
color. Chrome is excluded: the maintained release gate still launches real
Firefox Developer Edition through `geckodriver`, and a feature absent from the
compiled bundle cannot render in any browser.

Correction: source `f44f3a0…` on `codex/tpi-134` (from `820d680d…`) ports both
approved features
onto the released lineage — the `teleprompter-script` production kind, its
normalization and persistence, the external drop path and purple drop
placeholder, the draggable rail scripts with the approved
`application/x-studioflow-teleprompter-script` payload, and the complete
approved color system (video orange, Teleprompter purple, Scene blue, Timer
yellow, Music green) driving border, tint, icon, selected and dragging states.
The hardened TPI-130/131/132R/133 deletion subsystem and every bridge file are
unchanged; a full lineage merge was evaluated and rejected because it conflict
ted in 22 places inside the owner's data-deletion code. Website commits
`6dc1525` (staged assets and baseline) and `8e75a0e` (new Firefox gate), pushed
with parity; baseline assets are `index-D9yljEwa.js` and
`index-D6ZhUVW1.css`.

Addendum (same directive): selecting a Scene's Teleprompter item now loads its
script into the **existing live presenter teleprompter** on the stage, rewound to
the beginning and paused, instead of opening the blocking reader dialog. The
pre-change behavior resolved the script correctly but never touched the live
surface (`prompterOverlayOpen`), so nothing was ever cued for playback. The
maintained Firefox gate grew to **43/43** with Play/Pause/Reset scrolling,
script switching, refresh persistence, no-duplicate/immutability and deleted
script coverage. See the
[addendum record](100-DIRECTIVES/TPI-STUDIOFLOW-134-ADDENDUM-SCENE-TELEPROMPTER-PLAYBACK.md).

Verified: Firefox Developer Edition release acceptance 64/64, new TPI-134
colors and script-drag acceptance 27/27 (now part of `release:preflight`),
Scenes panel 20/20, release safety PASS, local auth lifecycle 38/38, and exact
reproducible staging. **Pre-existing failure:** `verify:studioflow-035` asserts
`[data-private-teleprompter="true"]`, which exists only on the unreleased
122-notes lineage; it failed before this change and cannot pass until that work
is restored or the suite is reconciled.

**Larger finding requiring an owner decision:** the same divergence also
removed the Notes workspace, podcast project export, local project folder sync,
recording-audio work and the private stage Teleprompter reader from the released
lineage. That restoration still needs its own directive; it is not part of
TPI-134R, which shipped only the 134 colors, drag and live-cue work.

[Full record](100-DIRECTIVES/TPI-STUDIOFLOW-134-SCENE-DRAG-AND-PRODUCTION-COLORS.md).

## TPI-STUDIOFLOW-133 — Floating Studio actions menu positioning (2026-11-01)

Status: **DEPLOYED AND VERIFIED — owner acceptance pending**. The Studio card
**More Actions** menu used fixed page offsets
(`right: -74px; top: 44px`) with no positioned ancestor, so it resolved against
the page and appeared at the top-right corner of the viewport instead of beside
the card that opened it. It is now anchored to that button: directly beneath it
with right edges aligned, flipped above when there is no room below, clamped
inside the viewport on desktop, tablet and phone widths, and recomputed on
scroll and resize. Only one card menu can be open, and the existing
outside-click, Escape, action-selection, keyboard and focus behaviors are
preserved alongside the unchanged Rename, Archive and Delete actions (including
every TPI-STUDIOFLOW-088/089/132R deletion safeguard). New Firefox suite passes
44/44 (including eight genuine 390 px phone-viewport checks) and is now part of
`release:preflight`; the StudioFlow source is committed
at `e608ca9414d27f96058503c53865a8b03993ab7a` and the website release baseline
records assets `index-mYnRoDcA.js` (`03802154…`) and `index-B-jk8V4i.css`
(`c64c8f9d…`).

Release commit `b2868f6d1f1203d03143d6f9edd008dea3b7cf36` (implementation
`f182bc5`) was deployed through the guarded workflow. Previous Worker
`cd37afb8-cc82-406a-9e15-e84b3dffa234`; active Worker
`71a5293d-fef4-4643-bf50-e9dfc7327eb5` at 100% traffic. The live document
references only `index-mYnRoDcA.js` (`03802154…`) and `index-B-jk8V4i.css`
(`c64c8f9d…`), the live bridge is unchanged
(`9e69ee70…`), and no migration, SQL or server-code file changed. Gates: local
authentication lifecycle PASS, preflight READY (deletion/archive 32/32, deletion
safety 26/26, Studio lifecycle 29/29, ownership 40/40, release acceptance 64/64,
floating menu regression 44/44, staging verification, guarded dry-run),
production smoke, live isolated Firefox acceptance 64/64, and a focused
non-destructive production acceptance 16/16 that confirmed the menu opens beside
its own More Actions button on the live site.

A post-release test commit `9d0d827` raised the 133 regression to 44/44 with a
genuine 390 px phone viewport (Firefox clamps driven windows to about 500 px, so
the suite runs the real bundle in a same-origin 390 px iframe);
`release:preflight` re-reported READY against it and the deployed bundle is
byte-identical, so no further deployment was made. Production D1 still holds the same
18 live Studio rows; the owner's browser-local Studio was never opened or
altered. See
[`TPI-STUDIOFLOW-133-FLOATING-STUDIO-MENU-POSITIONING.md`](100-DIRECTIVES/TPI-STUDIOFLOW-133-FLOATING-STUDIO-MENU-POSITIONING.md).

## TPI-STUDIOFLOW-132 — Production Studio deletion failure (2026-11-01)

Status: **ROOT CAUSE CONFIRMED AND CORRECTED — DEPLOYED AND VERIFIED UNDER
TPI-STUDIOFLOW-132R (owner acceptance pending)**. At the time of the
investigation, production was serving the expected Worker
`f4be38fb-9d26-45cb-9c48-5223a1d4c12c` and
`index-B_8Inyh0.js`; the deletion gating is byte-identical to the bundle that
deleted the owner's three Studios earlier the same day. The confirmed causes are
in the maintained bridge: a browser-only Studio carrying a recovery snapshot was
classified as server-backed (`storage: "both"` with `server: null`), which made
`Delete Studio Permanently` wait forever for a server inventory that cannot
exist; and a server deletion guard (`{ code, error }`) was passed to React as a
render child, throwing error #31 and freezing the dialog on "Preparing the
deletion inventory…" instead of showing the safety reason. Both are corrected in
`studio/workspace-bridge.js` with no server, schema, bundle or authorization
change. New Firefox regression suite passes 28/28; deletion safety 26/26,
deletion/archive 32/32, release safety PASSED, and the 130 button suite passes
20/20 in both browser legs. See
[`TPI-STUDIOFLOW-132-PRODUCTION-DELETION-FAILURE.md`](100-DIRECTIVES/TPI-STUDIOFLOW-132-PRODUCTION-DELETION-FAILURE.md).

### TPI-STUDIOFLOW-132R — production release (2026-11-01)

Status: **DEPLOYED AND VERIFIED — owner acceptance pending**. Release commit
`d9af9024506e792221a111c7ec8c4016f7f69112` (implementation `98e0ac8`) was
deployed through the guarded workflow. Previous Worker
`f4be38fb-9d26-45cb-9c48-5223a1d4c12c`; active Worker
`cd37afb8-cc82-406a-9e15-e84b3dffa234` at 100% traffic. JavaScript
`index-B_8Inyh0.js` (`e250a5e4…`) and CSS `index-C_oD8YSH.css` (`5bdc30cf…`)
are unchanged; the live workspace bridge is
`9e69ee7064a9314be1026646f3d6d34ff1e123695ff996e3edd208d2911ac573`, identical
to the release commit. Gates: local authentication lifecycle PASS, preflight
READY (deletion/archive 32/32, deletion safety 26/26, Studio lifecycle 29/29,
ownership 40/40, Firefox release acceptance 64/64, staging verification,
guarded dry-run), production smoke 10/10, live isolated Firefox acceptance
64/64, and a focused non-destructive production deletion acceptance 18/18. A
browser-local Studio with a recovery snapshot now activates `Delete Studio
Permanently` on the exact name, and guarded Studios explain themselves. No
production data was migrated, reset or deleted outside the two disposable QA
fixtures the acceptance created and purged. Rollback:
`f4be38fb-9d26-45cb-9c48-5223a1d4c12c`. Completion still requires the owner to
confirm the button activates in their own production Firefox session.

## TPI-STUDIOFLOW-131 — Final Studio deletion (2026-11-01)

Status: **COMPLETE / LOCAL DEVELOPMENT VERIFIED FOR FINAL ACTIVE AND FINAL ARCHIVED STUDIO**. The
isolated source correction changes post-purge catalog reconciliation to read
from the authoritative workspace bridge rather than the stale React
`broadcasts` closure. Real Firefox acceptance passed final active and final
archived disposable-Studio deletion, the `No Studios yet` empty state, refresh
persistence, no automatic recreation, and creation/opening of a replacement
Studio. The maintained deletion/archive regression passed 32/32, deletion
safety 26/26, local auth lifecycle 64/64, and release safety 21/21. See
[`TPI-STUDIOFLOW-131-FINAL-STUDIO-DELETION.md`](100-DIRECTIVES/TPI-STUDIOFLOW-131-FINAL-STUDIO-DELETION.md).

### TPI-STUDIOFLOW-131R — production release (2026-11-01)

Status: **DEPLOYED AND VERIFIED IN PRODUCTION**. The final-Studio correction
was deployed through the guarded release workflow at 100% traffic. Previous
Worker: `99ca2347-3181-4525-b9eb-d28cb61cf42a`. Active Worker:
`f4be38fb-9d26-45cb-9c48-5223a1d4c12c`. Source correction:
`fb95c43ce79dd0dfcf3f880eb34555d746c5c8ce`. Website release:
`b48fd7e13b91f5e082dab26ada893bc265fc7fcf`. JavaScript
`index-B_8Inyh0.js` (`e250a5e41376be2861c1fe0747165a189da193ca2f180c596d49b19750fd1abe`),
CSS `index-C_oD8YSH.css`
(`5bdc30cfd0945a8978cfff024af30af71886de0be8b13875b1abed3147f62040`), and
entrypoint SHA-256 `ba80f8b040b6411b8d46cf1908a04a7a4a657834e479197d81c6d07508d79c64`
match the verified candidate. Deletion/archive passed 32/32, deletion safety
26/26, release safety 21/21, production smoke 10/10, and isolated production
Firefox acceptance 64/64. The live entrypoint returned `Cache-Control:
no-store`; no production destructive deletion was executed, and existing
creator data was preserved. Rollback: `99ca2347-3181-4525-b9eb-d28cb61cf42a`.
See the execution record above.

## TPI-STUDIOFLOW-126F — Final production deployment (2026-11-01)

Status: **COMPLETE / DEPLOYED AND VERIFIED IN PRODUCTION**. The verified 126C
candidate, with the 126E deletion-safety harness correction preserved, was
deployed as Worker `1a6a2ab5-db20-4e43-9d10-18a0a1edc784` at 100% traffic.
Production smoke passed 10/10, broad isolated Firefox acceptance passed
64/64, and focused live Firefox asset/border acceptance passed 8/8. The live
entrypoint returned `Cache-Control: no-store`; all five production-item border
colors, selected/dragging Teleprompter states, and refresh persistence passed.
Rollback remains `584f29db-1568-4ff4-a99e-b32b3b63a23e`. See
[`TPI-STUDIOFLOW-126F-FINAL-PRODUCTION-DEPLOYMENT.md`](100-DIRECTIVES/TPI-STUDIOFLOW-126F-FINAL-PRODUCTION-DEPLOYMENT.md).

## TPI-STUDIOFLOW-126E — Deletion safety release blocker (2026-11-01)

Status: **COMPLETE / DEVELOPMENT VERIFIED / PRODUCTION UNCHANGED**. The prior
`TPI-STUDIOFLOW-089-DELETION-SAFETY` 31/32 result was traced to a test-harness
autosave race: the rejected-deletion comparison ran while the disposable target
was still the active browser workspace, allowing legitimate `version` and
`updatedAt` changes. The harness now switches to a disposable keep Studio and
waits for that save to settle before comparing state. The corrected run passes
32/32 with identical workspace contents and metadata before and after rejected
deletion. The 126C candidate remains unchanged and production remains on Worker
`584f29db-1568-4ff4-a99e-b32b3b63a23e` at 100%. See
[`TPI-STUDIOFLOW-126E-DELETION-SAFETY-RELEASE-BLOCKER.md`](100-DIRECTIVES/TPI-STUDIOFLOW-126E-DELETION-SAFETY-RELEASE-BLOCKER.md).

## TPI-STUDIOFLOW-126D — Approved production deployment (2026-11-01)

Status: **BLOCKED — NOT DEPLOYED**. The exact TPI-STUDIOFLOW-126C candidate
(`b17e8cb692d458d864cc801bc1bd10bb1509b39b`) passed artifact, reproducibility,
release-safety, authentication, build, and isolated Firefox checks, but the
guarded deployment stopped before upload when the current
`TPI-STUDIOFLOW-089-DELETION-SAFETY` regression failed 31/32. Production was
rechecked and remains on Worker `584f29db-1568-4ff4-a99e-b32b3b63a23e` at 100%.
No rollback or production data change occurred. See
[`TPI-STUDIOFLOW-126D-PRODUCTION-DEPLOYMENT.md`](100-DIRECTIVES/TPI-STUDIOFLOW-126D-PRODUCTION-DEPLOYMENT.md).

## TPI-STUDIOFLOW-126C — Production card border regression correction (2026-11-01)

Status: **COMPLETE / DEVELOPMENT VERIFIED / PRODUCTION UNCHANGED**. The 126B
failure was traced to stale production entrypoint/bridge asset caching. The
candidate now makes the StudioFlow entry document `no-store`, versions the
bridge stylesheet URL, and verifies exact hashed asset references in Firefox.
Focused acceptance passes 8/8; Scenes 20/20, TPI-125 Firefox 21/21,
recording/storage 33/33, screen sharing 13/13, local auth lifecycle 38/38,
and release safety 21/21 pass. Production remains on Worker
`584f29db-1568-4ff4-a99e-b32b3b63a23e`; no deployment occurred. See
[`TPI-STUDIOFLOW-126C-PRODUCTION-BORDER-REGRESSION.md`](100-DIRECTIVES/TPI-STUDIOFLOW-126C-PRODUCTION-BORDER-REGRESSION.md).

## TPI-STUDIOFLOW-126B — My Scenes production promotion (2026-11-01)

Status: **ROLLED BACK — LIVE FIREFOX ACCEPTANCE FAILED**. The TPI-126A
candidate was deployed as Worker `fb780aae-8a1c-4dbf-b41a-c82cce96e8be`, but
production Firefox rendered generic blue My Scenes borders instead of the
required type-specific borders, including the selected Teleprompter Script.
The release was rolled back to Worker `584f29db-1568-4ff4-a99e-b32b3b63a23e`
at 100% traffic. See
[`TPI-STUDIOFLOW-126B-MY-SCENES-PRODUCTION-DEPLOYMENT.md`](100-DIRECTIVES/TPI-STUDIOFLOW-126B-MY-SCENES-PRODUCTION-DEPLOYMENT.md).
The correction remains verified in development only.

## TPI-STUDIOFLOW-126 — FINAL PRODUCTION RELEASE (2026-11-01)

[Execution record](100-DIRECTIVES/TPI-STUDIOFLOW-126-FINAL-PRODUCTION-RELEASE.md).

The approved StudioFlow baseline is **DEPLOYED AND VERIFIED IN PRODUCTION**.
The release used website commit `a025889a7e0361ddbd1867c2f66c83c0ebbe1e43`
and StudioFlow source commit `e2363fb877d3984c938f0703fe62446ad9f17c4f`.
Production Worker `theparanormalinitiative` is
`584f29db-1568-4ff4-a99e-b32b3b63a23e` at 100% traffic; rollback is
`4108a0d7-5833-435f-8a0b-f6be8c1c8b27`. The canonical StudioFlow assets are
`index-C7n2E6kz.js` (`94d5ba564a6e358ac013f94dcc30bf78e49e1acd93db4e3a46e32dbab06505bc`)
and `index-SDxcWQji.css`
(`0b2b18de7f6308a19116e539d2ac10de54bd9241f300b8d7229577c5eca302b7`).

All release gates passed: local authentication 38/38, Firefox local and live
acceptance 64/64, Studio lifecycle 29/29, ownership 40/40, deletion/archive
31/31, deletion safety 32/32, production smoke 10/10, and release safety
21/21. The 122F.4A–122F.5 Notes Trash sequence and TPI-STUDIOFLOW-125 are
included. Native 122H.1–122H.2 local-folder synchronization remains partial
and was excluded. Native OS screen-picker automation and external livestream
delivery remain documented limitations.

## TPI-STUDIOFLOW-125 — TELEPROMPTER SCENE INTEGRATION (2026-10-31)

[Execution record](100-DIRECTIVES/TPI-STUDIOFLOW-125-TELEPROMPTER-SCENE-INTEGRATION.md).

The authoritative local Worker now serves the development-only Teleprompter
Script production-item integration from source commit
`e2363fb877d3984c938f0703fe62446ad9f17c4f`. My Scenes accepts stable existing
script-library references, the Add production item menu includes Teleprompter
Script, existing Teleprompter rail scripts are drag sources, and production
cards use centralized type colors: scenes blue, videos orange, scripts purple,
timers yellow, and music green. Script selection opens the existing private
reader without auto-play or scene transitions; playback state and the
full-display privacy warning are preserved.

Focused isolated Firefox acceptance passes 21/21, including recording while
the private reader is active. Maintained Scenes passes 20/20,
recording/storage passes 33/33, the existing screen-sharing panel passes
13/13, source checks pass 57/57 plus screen-sharing 10/10 and request-budget
checks, and release safety passes 21/21. Native screen capture remains
explicitly not automated by the maintained picker boundary. Production remains
unchanged and no deployment was performed.

## TPI-STUDIOFLOW-122F.5 — NOTES TRASH BASELINE CLOSED (2026-10-31)

[Closure record](100-DIRECTIVES/TPI-STUDIOFLOW-122F5-NOTES-TRASH-CLOSURE.md).

The 122F.4A–122F.4C Notes Trash sequence is now **VERIFIED COMPLETE** in the
authoritative local development environment. Firefox Developer Edition 160.0b3
successfully selected the disposable Trash note, executed browser Restore,
rendered the exact missing-folder fallback notification, kept it visible, and
cleared it after the next note action. Attachment-safe deletion, shared-reference
protection, revision preservation, storage-failure safety, Notes regression, and
release safety remain accepted. The verified source baseline is
`9703b087e91e85e0f791f618a90f9b2c4eeb5160`; production remains unchanged.

## TPI-STUDIOFLOW-122F.4A — PARTIAL / ATTACHMENT-SAFE TRASH CORRECTION (2026-10-31)

[Directive execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F4A-NOTES-TRASH-COMPLETION.md).

The authoritative local candidate now uses the exact server-reported missing-
folder restore result and keeps the notice visible until another Notes action
clears it. Permanent deletion audits attachment object keys and revision HTML/
ID references, fails closed for cross-note references, removes only the
selected trashed note's D1 attachment/revision/note rows when safe, and retains
private R2 bytes because the current architecture has no atomic D1/R2 cleanup
ledger. Real disposable attachment uploads, multi-attachment deletion,
shared-reference protection, maintained Notes regression, and release safety
pass. The rendered Firefox missing-folder notice remains UNVERIFIED because
the isolated harness intermittently fails to select that disposable Trash
card; production remains unchanged.

Source commit: `9703b087e91e85e0f791f618a90f9b2c4eeb5160`. Local assets are
`index-2zeoh76e.js` (`bbe0e82636bf2c80d9fd5a720590343f32895d2d79ddede86c432d684ead2912`)
and `index-Y3KKfVMj.css`
(`b60d93eb648c49585d5c57200a99313334a2ff390422e71cc0396365d02aae18`).

## TPI-STUDIOFLOW-122F.4 — PARTIAL / NOTES TRASH CORE VERIFIED (2026-10-31)

[Directive execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F4-NOTES-TRASH.md).

The authoritative local Worker at `http://127.0.0.1:8787/studio/` now provides
owner-scoped Notes Trash, restore, deletion timestamps, read-only trashed-note
views, and explicitly confirmed permanent deletion for attachment-free trashed
notes. Restore preserves content, folders and revisions where possible; the
server safely falls back to All Notes when the original folder is gone. Notes
with attachments fail closed rather than risking shared or historical storage
deletion. Focused Firefox acceptance passed the core 21/22 checks, with only
the browser-only fallback-notice observation remaining unverified; maintained
Notes regression and release safety pass. Source is
`ddc8eed4321510a86da35d7a1bb35f0cf8b8a50e`; production remains unchanged.

## TPI-STUDIOFLOW-122F.3 — COMPLETE / ORGANIZE PANEL VERIFIED (2026-10-31)

[Directive execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F3-ORGANIZE-PANEL-SIZING.md).

The authoritative local Worker at `http://127.0.0.1:8787/studio/` now serves
the bounded responsive Organize-panel correction from source commit
`7f3a3e37850163d78a97e97fce05693fdf48ea84`. Long project and folder names wrap
without clipping, three-dot action menus remain visible, the saved Note Library
resize and organization rail remain functional, and a container-based narrow
layout prevents horizontal overflow in the space available beside navigation.
The real Firefox Notes acceptance passes, maintained Firefox passes 64/64,
release safety passes 21/21, and reproducible staging passes. Production was
not modified or deployed.

## TPI-STUDIOFLOW-122F.2D — COMPLETE / NOTES DOCUMENT PADDING VERIFIED (2026-10-31)

[Directive execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F2D-NOTES-EDITOR-PADDING.md).

The Notes rich-text surface now uses 22px desktop horizontal padding, 18px at
medium widths, and 14px on narrow layouts instead of the previous 4px
horizontal inset. The correction is source commit
`6af7b1089fbe38fb85a72590c0017086ff65f6b1`; website integration commit is
`142c8a8bafc6cad56c16b5e80ec2ade9017aeb5d`. Firefox computed-padding checks,
the Notes acceptance suite, maintained Firefox 64/64, release safety 21/21,
and reproducible staging all pass. Production was not modified or deployed.

## TPI-STUDIOFLOW-127 — PARTIAL / RELEASE PRESERVED, PUSHED, AND DEPLOYED (2026-10-31)

[Directive execution record](100-DIRECTIVES/TPI-STUDIOFLOW-127-PRESERVE-PUSH-DEPLOY-CLEAN.md).

The verified StudioFlow candidate from source commit
`ded5a3d73c5838d56f3c5e1cb0a32534acdab44f` was integrated on website branch
`codex/tpi-development`, pushed, and deployed through the guarded release path.
Production Worker `theparanormalinitiative` is now version
`4108a0d7-5833-435f-8a0b-f6be8c1c8b27`; rollback remains
`a8709be8-6cec-4e99-a904-0f0e8877f00f`. The deployed StudioFlow assets are
`index-CZ1q5Q9d.js` (SHA-256
`89f744d4ca0a889001acb94f2afd6826609a8c64cee02ad23508f0f4da8a14b3`) and
`index-DtHLNYVn.css` (SHA-256
`720b9f58e86b2006281120234b4cb9a4bf7e2f2b7388b04badd4e2d3808eb668`).
Anonymous production smoke passes 10/10 and isolated Firefox production
acceptance passes 64/64. The canonical release worktrees are clean; unrelated
historical and original mixed-checkout WIP remains preserved and was not
cleaned or included, so the all-worktree consolidation objective remains
PARTIAL. The source repository has no configured remote, so independent source
branch GitHub parity is not asserted. Native 122H.2 local-folder
synchronization remains PARTIAL/UNVERIFIED and is not represented as passed.

## TPI-STUDIOFLOW-122H — COMPLETE / PODCAST PROJECT EXPORT VERIFIED (2026-10-31)

[Directive execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122H-PODCAST-PROJECT-EXPORT.md).

The authoritative local Worker at `http://127.0.0.1:8787/studio/` now provides
read-only `View Project Files` and `Download Project` actions for existing
Notes podcast project collections. The bounded browser export creates a
standard ZIP with project/episode metadata, offline note HTML, private
attachments when fetchable, checksums, and explicit omissions for resources
without verified project associations. Final Firefox export acceptance passes;
maintained Firefox is 64/64 and release safety is 21/21. Source commit is
`56f8ad7cc403560e22388e907b2000ee9f49c0db`; production remains unchanged.

Scripts, recordings, media, artwork, guest information, and scenes remain
documented omissions until the existing model provides verified project or
episode associations. No production deployment is authorized under D122H.

## TPI-STUDIOFLOW-122F.2C — COMPLETE / FINAL NOTES FOCUS STYLING VERIFIED (2026-10-31)

[Directive execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F2C-NOTES-FOCUS-STYLING.md).

The authoritative local Worker at `http://127.0.0.1:8787/studio/` now serves
the final Notes editor focus correction from source commit
`eb6d09d991d851d8f92853e60a2ecb8c0f934e87`. The remaining green horizontal
line was the scoped `.notes-rich-editor:focus-visible` inset shadow; it has
been removed. The editor retains a visible caret and uses a subtle theme-token
surface tint for accessible focus without a rectangle, border, outline, or
replacement line.

Live Firefox computed-style verification passes. Maintained Firefox passes
64/64, release safety passes 21/21, and exact reproducible source/staging
provenance passes. The broader disposable Notes harness stalled before a
result and remains unverified; inherited D122F.2B image persistence gaps are
unchanged. Production was not modified or deployed.

## TPI-STUDIOFLOW-122F.2B — PARTIAL / INDIVIDUAL IMAGE REMOVAL VERIFIED (2026-10-31)

[Directive execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F2B-NOTES-IMAGE-REMOVAL.md).

The authoritative local Worker at `http://127.0.0.1:8787/studio/` now provides
a contextual Delete Image action for the exact selected embedded photograph.
Real Firefox interaction removes only the selected image, preserves the other
image and surrounding text, and browser undo/redo restores/removes the image
and caption. Stored attachment IDs and R2 objects are not deleted.

Source commit
`a9f0207876944b37c234e16b73d9e6a6863a9c8a` stages JavaScript
`index-iWHM28jf.js`
(`a06403c49de188a6e5d534f00512e05da58271dde48f74bafe4598ae6d1306af`) and CSS
`index-Py1pkkT-.css`
(`11e1a67b3cd18447de5691edaca14b5a103df2c3e7151260ec542c78de98c4a2`).
Maintained Firefox passes 64/64, release safety passes 21/21 and provenance
passes. Image autosave/refresh, trusted keyboard input and native uploaded-image
bytes remain unverified because the repeated full Notes harness encountered a
disposable fixture hydration failure. Production was not modified or deployed.

## TPI-STUDIOFLOW-122F.2A — COMPLETE / NOTES EDITOR DOCUMENT STYLE VERIFIED (2026-10-31)

[Directive execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F2A-NOTES-EDITOR-DOCUMENT-STYLE.md).

The authoritative local Worker at `http://127.0.0.1:8787/studio/` now presents
the Notes rich editor as a document-writing surface. The full perimeter focus
box is removed; the existing automatic caret and immediate writing behavior
remain, with a subtle shared-token surface tint and keyboard-visible bottom
focus cue.

Source commit
`95fc46baae987dee0d7035e6032822330a709c32` stages JavaScript
`index-DbEHpRbI.js`
(`ff618245fa0a77811673fab77632914fd6239f1a57a596ae3114da2a477e39e9`) and CSS
`index-Diqa40JX.css`
(`e4abe1d372de5f21dbecdd97c2dc9f0fef053e7c0e37fa2f36431d82bfd8794a`).
Focused Notes acceptance passes, D122F.1 rail checks pass 13/13, maintained
Firefox passes 64/64, release safety passes 21/21 and provenance verification
passes. Production was not modified or deployed.

## TPI-STUDIOFLOW-122F.2 Addendum — COMPLETE / NOTES EDITOR WRITING FOCUS VERIFIED (2026-10-31)

[Directive execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F2-ADDENDUM-EDITOR-FOCUS.md).

The authoritative local Worker at `http://127.0.0.1:8787/studio/` now focuses
the existing rich-text editor after Note hydration. Empty Notes receive a
visible start caret and CSS-only `Start writing…` guidance; existing content
opens with the insertion point at the end. The addendum preserves paragraph
entry, formatting, automatic titles, autosave, revisions, attachments and
toolbar behavior.

Source commit
`4caa882c4d13de283265d5204e2431370f825e70` stages JavaScript
`index-c4ihiW_I.js`
(`ff618245fa0a77811673fab77632914fd6239f1a57a596ae3114da2a477e39e9`) and CSS
`index-Dm22zsyB.css`
(`ef516f605e43d7e7437da49f9cedb439944d111e43b67e1e1f834bc215242975`).
Focused Notes acceptance passes, D122F.1 rail checks pass 13/13, maintained
Firefox passes 64/64, release safety passes 21/21 and provenance verification
passes. Production was not modified or deployed.

## TPI-STUDIOFLOW-122F.2 — COMPLETE / NOTES ATTACHMENT CONTROLS VERIFIED (2026-10-31)

[Directive 122F.2 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F2-NOTES-ATTACHMENT-CONTROLS.md).

The authoritative local Worker at `http://127.0.0.1:8787/studio/` now keeps
the toolbar photograph and paperclip actions as the two attachment entry
points, removes the duplicate Attach Files control above the toolbar, and
replaces the permanent footer chooser with a contextual drag/paste hint.
Existing private attachment links, metadata, captions, drag/drop, clipboard
handling, autosave and revisions remain intact.

Source commit
`009211f13a1dd8ef6c7caed7fa94840eba7337b1` stages JavaScript
`index-52sL-vjB.js`
(`6c7d5871f41bc1d3e30d56648e73d39a372e3acf1f90df507c266e4a34a641e5`) and CSS
`index-ChghdUBo.css`
(`b7d6b2e0c427c3a79857268926ceeb2613fa4edd0eb140934e460aace57e8e2d`).
Focused Notes acceptance passes, D122F.1 rail checks pass 13/13, maintained
Firefox passes 64/64, release safety passes 21/21 and provenance verification
passes. Production was not modified or deployed.

## TPI-STUDIOFLOW-122F.1 — COMPLETE / NOTES ORGANIZATION RAIL VERIFIED (2026-10-31)

[Directive 122F.1 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F1-NOTES-ORGANIZATION-RAIL.md).

The Notes Organization panel now collapses into a dedicated narrow rail on the
authoritative local Worker at `http://127.0.0.1:8787/studio/`. The expand
control is inside the rail, never over the Note Library, and the library
heading remains unobstructed. Expanded-state alignment beside `Organize`,
selection/editor preservation and responsive behavior remain intact.

Source commit `b9a7772fec70ceb4143deaa03963b89072a56564` stages JavaScript
`index-lCAgDCwK.js`
(`240717548162c54cdbad49289b375e6c17e9c85e058f012ab46cf01cbed5ed48`) and CSS
`index-D9akxKCz.css`
(`bc541f62a96352584b811fdc308bf4f4b71888fd7d586b4285887fbc2839f980`). The
focused geometry verifier passes 13/13, maintained Firefox passes 64/64,
release safety passes 21/21, and source/staging provenance passes. Production
was not modified or deployed.

## TPI-STUDIOFLOW-122F — PARTIAL / NOTES COMPLETION CANDIDATE VERIFIED (2026-10-31)

[Directive 122F execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122F-NOTES-COMPLETION.md).

The authoritative local Worker at `http://127.0.0.1:8787/studio/` now renders
one Notes organization panel. Collapse is beside `Organize`, the collapsed
state has an accessible reopen control, and redundant global/far-right folder
and collapse controls are removed. Podcast, episode and folder actions are
grouped beneath Projects and folders. The editor also has a sanitized,
autosaved structured research-reference block action, and attachment IDs are
included in subsequent note revisions.

Source commit `ef2377f8b92b278bdab67c18d51a44c5a63c3dd9` stages JavaScript
`index-B0cx-IId.js`
(`240717548162c54cdbad49289b375e6c17e9c85e058f012ab46cf01cbed5ed48`) and CSS
`index-DNQBejED.css`
(`75f2a65407810b92b9baea6fb0694bb3f5f802b67154e1044dbc3b9d8d7a3261`). The
website parity/documentation commit is `54771c4c3834304636f95e4c38eb38897226c19e`.
The focused D122F Firefox check passes 11/11, maintained Notes acceptance passes,
maintained Firefox StudioFlow regression passes 64/64, release safety passes
21/21, and reproducible staging passes. D122F remains PARTIAL because native
attachment/recovery, interruption and multi-tab autosave, exhaustive revision
restore, all-theme, Chrome/Safari and tablet/mobile checks remain unverified.
Production was not modified or deployed.

## TPI-STUDIOFLOW-122E.1 — COMPLETE / HOME CREATE LAYOUT VERIFIED (2026-10-31)

[Directive 122E.1 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122E1-HOME-CREATE-LAYOUT.md).

The authoritative local Worker at `http://127.0.0.1:8787/studio/` now displays
Live stream, Recording, On-Air webinar, Notes, and Teleprompter in one equal
five-card row on wide desktop screens. Responsive layouts use balanced 3+2,
2+2+1, and one-column arrangements without document-wide horizontal overflow.
The card order, styling, icons, descriptions, and navigation actions remain
unchanged.

Final isolated StudioFlow source commit
`1e08da2b651136ea19a654ad03b97ddd45ca4457` stages JavaScript
`index-DmaCJVhN.js`
(`e0a7d71aa44da90ab2db5c15b1e4deba89562e4059d1e83475a8a4efcb2dde2d`) and CSS
`index-DLIu5icU.css`
(`e09191f0e7f94bacea4e63876cf3d5e407c9b7076d7f4ab35203e71992e0ea13`).
Focused Firefox acceptance passes 19/19, maintained Firefox regression passes
64/64, and release-safety passes 21/21. Production was not modified or
deployed.

## TPI-STUDIOFLOW-122E — COMPLETE / HOME NAVIGATION AND DIALOG VERIFIED (2026-10-31)

[Directive 122E execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122E-HOME-NAVIGATION-DIALOG-USABILITY.md).

The authoritative local Worker at `http://127.0.0.1:8787/studio/` now exposes
the existing Notes workspace directly from a fifth Home Create card immediately
before Teleprompter. Explicit Studio exit persists Home while retaining the
selected Studio identity and saved configuration; startup hydration no longer
rewrites Home or Notes into the Studio route. The archived-Studio permanent
deletion dialog is viewport-bounded and scrollable, while permanent deletion
remains disabled.

Source commit `046ae3aaeebf9945597ce7373f5a9ada8a00cd37` stages JavaScript
`index-CAngUv37.js`
(`e0a7d71aa44da90ab2db5c15b1e4deba89562e4059d1e83475a8a4efcb2dde2d`) and CSS
`index-CxtEcOJP.css`
(`c4a34d03e42c981b2168e6287e232552ba1cdcb0676b2067ff33cbe573487254`). Focused
Firefox acceptance passes 22/22, maintained Notes acceptance passes 57/57,
maintained Firefox regression passes 64/64, and release-safety passes 21/21.
Production was not modified or deployed.

## TPI-STUDIOFLOW-122D — COMPLETE / USER FOLDERS VERIFIED (2026-10-31)

[Directive 122D execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122D-USER-CREATED-FOLDERS.md).

The authoritative local Worker at `http://127.0.0.1:8787/studio/` now exposes
discoverable New Folder actions, a persisted nested collection tree, subfolder
creation, rename, safe deletion, folder filtering and note movement. The
existing `parent_id` schema from migration 0055 was reused; no migration was
required. The API now rejects unowned parents and hierarchy cycles. Source
commit `bf93bb58a72eb0f5b0e47f401af0ebd97daa77ef` stages the final candidate.
Real Firefox folder acceptance passes 57/57. Production was not modified or
deployed.

## TPI-STUDIOFLOW-122B — COMPLETE / AUTOMATIC NOTE TITLES VERIFIED (2026-10-31)

[Directive 122B execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122B-AUTOMATIC-NOTE-TITLES.md).

Automatic note titles are implemented on the authoritative local Worker at
`http://127.0.0.1:8787/studio/` from isolated StudioFlow source commit
`8a68c677fa8c29cd2dffe3fc7edb29ef1a9919a5`. New Notes begin as `New Note`,
derive titles from the first meaningful rendered text line, update live while
automatic mode is active, and persist through the existing autosave/version
boundary. Direct title editing switches to manual mode; **Use automatic title**
restores generation. Existing notes default to manual through additive migration
0056, so historical titles are not rewritten.

The staged assets are `index-BkV9BhfI.js`
(`140141d76481fa3288fea1560ba564e59887e7e0c9a0c93952b7b0624adc6040`) and
`index-DCzHEnai.css`
(`c0a544549f0d440a3c017a3c4098158e62610b8cc36d7222b71cbeaaba9ece2c`). Real
Firefox D122B acceptance passes 40/40, maintained Firefox regression passes
64/64, release-safety passes 21/21, and reproducible source/staging checks
pass. Production was not modified or deployed.

## TPI-STUDIOFLOW-122A — PARTIAL / CONNECTED NOTES REFINEMENT VERIFIED (2026-10-31)

[Directive 122A execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122A-CONNECTED-NOTES-WORKSPACE.md).

The D122 Notes workspace is refined on the authoritative 8787 Worker from
StudioFlow source commit `fd4d2758f689f4731516055887cbac4df5c1f3dd`. It now has
a connected three-column layout, persistent Organization collapse, keyboard and
pointer-resizable Note Library, Focus Mode, and grouped Lucide icon controls
with accessible names, tooltips, menus, active formatting state, photo/file
actions and responsive behavior. Real Firefox acceptance passes 33/33.

The candidate remains PARTIAL because native file chooser uploads, full theme
coverage, pointer-drag execution and Chrome/Safari/tablet/mobile coverage were
not completed. Production was not modified or deployed.

## TPI-STUDIOFLOW-122 — PARTIAL / NOTES DEVELOPMENT CANDIDATE VERIFIED (2026-10-31)

[Directive 122 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-122-FEATURE-RICH-NOTES.md).

An additive, development-only Notes workspace is staged on the authoritative
local Worker at `http://127.0.0.1:8787/studio/`. Source commit
`96e28a3de4129fb248a32fe0a7f0e0527409ebc9` is built reproducibly and the staged
assets are `index-C48-jDnZ.js`
(`2b24c5295c7457f948fdf0109a5453c760cd103b7d6a642c4d69676d19a96314`) and
`index-D6SZajag.css`
(`340a54faf4f643d668dbecffe2d26883d94b9983616f7d195d9551a6feb2765c`).

The D122 focused Firefox run passes 18/18, the maintained Firefox regression
passes 64/64, release-safety passes 21/21, and the authoritative staging
verifier passes. The candidate includes the independent three-column workspace,
owner-scoped notes/collections/revisions/private attachment routes, rich editing,
spellcheck, autosave, recovery and private Studio sidebar access. D122 remains
PARTIAL because exhaustive attachment UX/recovery, structured research
references, revision/concurrency interruption tests, and Chrome/Safari/device
coverage are not complete. Production was not modified or deployed.

## TPI-STUDIOFLOW-121 — COMPLETE / ENHANCED SCREEN SHARING DEPLOYED AND VERIFIED (2026-10-31)

[Directive 121 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-121-CONTROLLED-PRODUCTION-DEPLOYMENT.md).

The owner-approved Directive 120 Enhanced Screen Sharing candidate was deployed
through the guarded production workflow. The approved StudioFlow source is
`a8a7d11759905ae4bf8043005e0c2259b1fd6a81`; the website release and updated
baseline commit is `cbf652d5c5546f1c1b7e1c2e0fc9b8d25b3fe023`. Worker
`a8709be8-6cec-4e99-a904-0f0e8877f00f` is active at 100% traffic. The previous
production Worker `f5af1836-8cf8-4a3c-9db7-18c53ff9ded2` is the verified
rollback target.

The approved production assets are JavaScript `index-CgmAxo34.js`
(`f4bd273c8fe8f60ef6025389b0738b03f392a9d3d618fe3433b819083e1a3595`) and
CSS `index-DpwwYG6_.css`
(`869e46025ce505491069a596af277bdacdd9df6a3493ac1e8db0c03a58a6b619`).
Guarded preflight passed, live anonymous production smoke passed 10/10, and
isolated Firefox production acceptance passed 64/64. No rollback was required;
production data, authentication, existing StudioFlow tools and permanent
deletion safeguards were preserved.

Owner-confirmed Chrome screen sharing is recorded as accepted. Shared video or
shared audio in saved recordings, complete browser compatibility, and full
end-to-end screen-sharing recording acceptance remain explicitly deferred to
the final StudioFlow acceptance phase and are not reported as passed here.

## TPI-STUDIOFLOW-120 — BLOCKED / SCREEN-SHARING IMPLEMENTATION STAGED (2026-10-31)

[Directive 120 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-120-ENHANCED-SCREEN-SHARING.md).

The isolated D120 source candidate is committed at
`a8a7d11759905ae4bf8043005e0c2259b1fd6a81` and is staged on the authoritative
local Worker at `http://127.0.0.1:8787/studio/`. It adds an original,
theme-aware Share content panel with Browser tab, Application window and Entire
display choices, browser-owned permission selection, preview, shared-audio
status, Add to Stage gating, and capture lifecycle cleanup. Source, build,
staging, focused Firefox panel 13/13 and maintained Firefox 64/64 checks pass.

Native browser-picker selection and an actual recording containing a captured
tab/window/display remain pending manual acceptance. Chrome and Safari capture
compatibility are not yet tested, so D120 is not claimed complete and no
production release candidate or deployment exists. The D119 production
baseline, owner data, authentication and port 5192 state are unchanged.

### Directive 120A — native picker verification remains blocked

Chrome `156.0.8078.79` on macOS 27.0 reached the native capture boundary in a
disposable profile, but macOS denied assistive access needed to operate the
picker (`-25211`). No source was selected and no captured-media recording was
created. Firefox native capture and Safari remain untested for the same safe
interaction boundary. Do not claim shared-video or shared-audio recording
until the owner completes the visible browser-picker test.

## TPI-STUDIOFLOW-119 — COMPLETE / TELEPROMPTER 092 DEPLOYED AND VERIFIED (2026-10-30)

[Directive 119 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-119-CONTROLLED-PRODUCTION-DEPLOYMENT.md).

The owner-approved StudioFlow Teleprompter release was deployed through the
guarded production workflow. The approved source is
`244993beab7f9fbba7ee89376a3b3dea616fa62a`; the website deployment candidate
was `6d4c062ce0c3b647f39d3b5e3004531d692f62ba`. Production Worker
`f5af1836-8cf8-4a3c-9db7-18c53ff9ded2` is active at 100% traffic. The previous
Worker `91a8460e-1db1-440c-9643-a85b6e178fba` remains the verified rollback
target.

Production serves JavaScript `index-DG-_pPI_.js` with SHA-256
`66f9407e808f74c803491917efcb412566301f4feca6df20978cd64dc48d7560` and CSS
`index-28KfU4BI.css` with SHA-256
`48b3b88702dde14713240d89a31e3057e58a53a1bea5356c0ba569aee77dea6f`.
Guarded preflight passed, live anonymous smoke passed 10/10, and isolated
Firefox production acceptance passed 64/64. Existing production data,
authentication, recording paths and permanent-deletion safeguards were
preserved. No rollback was required. The new production baseline is now the
approved starting point for subsequent StudioFlow work.

## TPI-STUDIOFLOW-118 — COMPLETE / TELEPROMPTER SIDEBAR CORRECTED (2026-10-30)

[Directive 118 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-118-CORRECT-TELEPROMPTER-SIDEBAR.md).

The Teleprompter right-toolbar icon now opens only the right sidebar, matching
Notes and the other panels. Saved scripts are filtered to the active Studio and
sorted oldest-first using stable creation metadata; legacy scripts retain their
stored order. Selecting a script opens the existing private stage reader, while
the sidebar's `Open Teleprompter` button opens the complete workstation.

The corrected source commit is
`244993beab7f9fbba7ee89376a3b3dea616fa62a`. The real 8787 Firefox owner
workflow passed 36/36, including UI-created script ordering, edit stability,
all right-sidebar panels, Studio isolation, recording, non-silent audio and
decoded-frame privacy. Production remains unchanged; owner acceptance is
pending.

## TPI-STUDIOFLOW-117 — COMPLETE / PRIVATE STAGE READER VERIFIED (2026-10-30)

[Directive 117 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-117-PRIVATE-STAGE-TELEPROMPTER-OVERLAY.md).

The authoritative Worker at `http://127.0.0.1:8787/studio/` now serves source
commit `3530140afefee9659947626db3f23524a25c3a80`. The recording Studio's
Teleprompter rail lists only the active Studio's saved scripts; selecting one
opens the existing private, transparent, bounded and draggable presenter reader
over the stage. Play/pause/resume/reset, speed, text size and Studio-specific
state persistence pass. The existing Home workstation, full-workstation entry,
recording compositor, audio repair and bottom-toolbar removal remain intact.

The real 8787 Firefox acceptance run passed 24/24. The saved WebM contains
1920x1080 VP8 video and 48 kHz stereo Opus audio; decoded audio measured mean
`-23.1 dB` and peak `-19.8 dB`, and five decoded frames contained no private
canary phrase. Source checks 38/38, build, Voice FX, recording-audio and
release-safety checks pass. Website integration is pushed on
`codex/tpi-development`; owner acceptance is pending and production remains
unchanged.

## TPI-STUDIOFLOW-116 — COMPLETE / TELEPROMPTER CONSOLIDATED ON AUTHORITATIVE LOCALHOST (2026-10-30)

[Directive 116 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-116-TELEPROMPTER-WORKSTATION-CONSOLIDATION.md).

The approved Teleprompter 092 source was consolidated in isolated source
commit `cf4afb9362fef8e4ec2d9ef82cafb3355805c611`, preserving the complete Home
workstation. The redundant recording bottom-toolbar entry was removed, and the
right-sidebar Teleprompter entry now opens the same workstation in a private
full-screen overlay with a Back to Studio return. Studio-specific scripts,
selected scripts, reader settings and scroll position use the existing storage
model. The local Worker at `http://127.0.0.1:8787/studio/` serves the verified
candidate assets and the Firefox acceptance run passed 19/19, including saved
VP8 video, decoded non-silent Opus audio and presenter-canary privacy.

The original mixed StudioFlow checkout, owner data, production configuration
and production release baseline remain unchanged. Owner acceptance is pending;
production deployment is not authorized.

## TPI-STUDIOFLOW-115 — COMPLETE / AUTHORITATIVE DOCUMENTATION STANDARDIZED (2026-10-29)

[Directive 115 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-115-STANDARDIZE-AUTHORITATIVE-LOCAL-DEVELOPMENT-DOCUMENTATION.md).

The sole owner-facing StudioFlow development environment is
`http://127.0.0.1:8787/studio/`, served by the local `workerd` Cloudflare
Worker started with `npm run dev:local`. Local D1/R2 persistence is under
`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/.local-dev/state/v3`.
Port 5192 is retired historical Directive 113 infrastructure and is not an
available development URL. Historical 5192 execution records remain preserved
as evidence but are not current instructions.

Teleprompter 092 is implemented and engineering-verified at source commit
`05a9aa5cd7b4ccb94d11162f244d2281fcd572bb`; the Directive 111 recording-audio
repair is integrated and verified, and Directive 113 isolated acceptance is
complete. The feature is **not integrated into port 8787**: the authoritative
local frontend remains the approved Video Setup 091 baseline. Owner acceptance
is pending and production release is not authorized.

No application code, frontend asset, Worker route, D1/R2 state, browser storage
or production configuration changed under Directive 115.

## TPI-STUDIOFLOW-114 — COMPLETE / AUTHORITATIVE LOCALHOST RESTORED (2026-10-29)

The owner-used StudioFlow development environment is verified at
`http://127.0.0.1:8787/studio/`. It is the maintained loopback Cloudflare
Worker launched by `npm run dev:local`, on `codex/tpi-development`, backed by
the persistent local-only D1/R2 state under `.local-dev/state/v3`. The Worker
remained running throughout this directive. A verified read-only recovery
snapshot of its D1, R2 metadata and all 3,894 local R2 blobs is preserved at
`/private/tmp/tpi114-backup-20261029-2335`; integrity checks passed and Studio
workspace/media counts remained 1,018/951.

The D113 Vite preview at `http://127.0.0.1:5192/studio/` was correctly
classified as temporary isolated feature testing, not the owner environment.
It served detached Teleprompter commit `05a9aa5...` without Worker/D1/R2/auth
and used a separate browser origin. Its identified process was stopped after
evidence was preserved, and its clean generated staging worktree was removed
by the mandatory amendment. The approved commit and evidence remain intact.
The Brand 1 observation
does not prove source age: Brand 1 is a built-in StudioFlow default, while the
actual difference was the separate origin/runtime and its empty or independent
browser-local state.

The active 8787 assets are the approved 091 bundle (`index-D1h4nSZd.js` /
`index-CcFjA_0p.css`, SHA-256 `4eed57...` / `850186...`). They contain the
older generic Teleprompter but not the 092-specific Studio-state and
presenter-only markers. Teleprompter 092 is therefore **not deployed to 8787**.
The safe integration path is a future reviewed development candidate update of
the source-provenance manifest and local website assets, followed by
authenticated acceptance against preserved owner state; no integration or
data migration was performed here. Production is unchanged.

See [Directive 114 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-114-RESTORE-AUTHORITATIVE-LOCALHOST.md).

## TPI-STUDIOFLOW-113 — COMPLETE / DEVELOPMENT STAGED / OWNER ACCEPTANCE PENDING (2026-10-29)

Historical execution record. The 5192 preview and staging worktree were
retired under Directive 114; do not use this historical URL for current owner
development or acceptance.

Directive 113 historically staged the exact feature commit
`05a9aa5cd7b4ccb94d11162f244d2281fcd572bb` in the then-clean detached
worktree `/Users/toddknipple/Documents/StudioFlow/web-113-staging` and served
it from the generated preview at `http://127.0.0.1:5192/studio/`. The
reproducible build served JS `index-Ce54wjuX.js`
(`4440217bc7fb07807bf0e47630906c9b59c0050e8d6c8a97bbe29ecc9bc96fa6`) and CSS
`index-D7-9JtPq.css`
(`be00c2115d1f8014a015d7c07a527684b1c4b328b401177475fe52dd27441fed`).
Firefox preview acceptance passed 39/39, focused checks 23/23, recording audio
and video decoding, recording privacy, RTMP privacy, screen-share 9/9 and Video
Setup 091 9/9. The isolated backend fixture passed lifecycle 29/29, ownership
40/40, recording/storage 33/33, deletion 31/31, deletion safety 32/32 and
direct Worker 23/23. Directive 114 retired the preview and removed the
worktree after preserving its evidence. Personal owner acceptance remained
pending. No Worker was deployed and production is unchanged. See [Directive
113 staging record](100-DIRECTIVES/TPI-STUDIOFLOW-113-DEVELOPMENT-STAGING.md).

## TPI-STUDIOFLOW-112 — COMPLETE / TELEPROMPTER 092 ACCEPTED / NOT DEPLOYED (2026-10-29)

Directive 111's verified microphone-volume repair is integrated into the
preserved Teleprompter 092 worktree at
`/Users/toddknipple/Documents/StudioFlow/web-109`, branch
`codex/studioflow-109-teleprompter`. The completed isolated feature commit is
`05a9aa5cd7b4ccb94d11162f244d2281fcd572bb`, containing the Teleprompter
implementation, the exact audio fallback repair from `4b44d365e44a8daab6151ea4796f0c2344dd7296`,
and focused checks only. Build, audio preference cases, Firefox saved-media
decoding, Voice FX, Teleprompter 39/39, focused checks 23/23, screen-share 9/9,
RTMP privacy, Video Setup 091 9/9, and the isolated authenticated Worker gates
all pass. Lifecycle 29/29, ownership 40/40, recording/storage 33/33, deletion
31/31, deletion safety 32/32 and direct Worker 23/23 pass. Permanent deletion
remains disabled. Original development and production remain unchanged; no
deployment occurred. See [Directive 112 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-112-INTEGRATE-AUDIO-TELEPROMPTER-ACCEPTANCE.md).

## TPI-STUDIOFLOW-111 — COMPLETE / ISOLATED AUDIO REPAIR / NOT DEPLOYED (2026-10-29)

Directive 111 compared the approved Video Setup 091 commit against the preserved
Teleprompter worktree with identical Firefox synthetic-media recording probes.
Both the approved 091 baseline and the Teleprompter branch reproduced silent
program audio, proving this was a pre-existing recording defect rather than a
Teleprompter regression. The root cause was `Number(null)`/`Number("")` turning
an absent `studioflow.micVolume` preference into zero before the host microphone
entered the program `MediaStreamAudioDestinationNode`.

The isolated repair branch
`codex/studioflow-111-recording-audio` returns the intended fallback of `1` for
absent, blank, invalid or non-finite stored volume. Firefox saved-media decoding
now passes with non-silent 48 kHz Opus audio and playable 1920x1080 VP8 video;
Voice FX disabled/enabled/changed/bypassed, Video Setup 091 9/9, Teleprompter
acceptance 39/39, focused Teleprompter checks 23/23 and screen-share privacy
9/9 pass. Original and Teleprompter worktrees remain preserved. No production
endpoint or deployment was used. See [Directive 111 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-111-RECORDING-AUDIO.md).

## TPI-STUDIOFLOW-110 — BLOCKED / TELEPROMPTER ACCEPTANCE (2026-10-29)

Directive 110 resumed the preserved implementation in isolated source worktree
`/Users/toddknipple/Documents/StudioFlow/web-109`, branch
`codex/studioflow-109-teleprompter`, base `6b9c3c4b6b40f0496012e5d718d32d75e149dcf6`.
Firefox Developer Edition browser acceptance passed 39/39 for in-Studio reader,
script assignment, controls, persistence and two-Studio isolation. Host screen-share
privacy passed 9/9. Actual local RTMP output was captured and the private canary is
absent from decoded frames. Video Setup 091 passed 9/9; Voice FX was ready; static
release safety passed 21/21. Build, focused teleprompter checks 23/23, Voice FX
check and `git diff --check` pass.

The saved 1080p recording plays and its video frames are canary-free, but its
Opus audio decodes as silence (−91 dB; malformed packet headers). Independent
Firefox synthetic audio records successfully (−23 dB; live tone RMS 0.0619),
while an instrumented app run measured the generated source at ~0.087 RMS and the
program recorder stream at 0.0 RMS with live tracks. This implicates the app's
program audio mix/capture path in that run; recording audio is BLOCKED. Play,
Pause, Resume and Close were confirmed while recording was active with live A/V;
a final reopen-during-recording attempt was inconclusive after the recorder stopped.
Authenticated Worker-backed Studio lifecycle/ownership/archive regressions remain
NOT RUN because no isolated test fixture/account is available. The source patch is
snapshotted and deliberately uncommitted; original mixed checkout and production
are unchanged. No production endpoint was contacted.
See [Directive 110 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-110-TELEPROMPTER-ACCEPTANCE.md)
and local source-worktree evidence `directive110-results.json`.

## TPI-STUDIOFLOW-109 — DEVELOPMENT IMPLEMENTATION / ACCEPTANCE PARTIAL / NOT DEPLOYED (2026-10-28)

Recovered the existing Teleprompter workspace/editor and integrated a Studio-
scoped reader into the current Studio presenter rail. The isolated source worktree
is `/Users/toddknipple/Documents/StudioFlow/web-109`, branch
`codex/studioflow-109-teleprompter`, based on approved Video Setup source
`6b9c3c4`. Script ownership, per-Studio selected script/settings/scroll position,
script-switch reset, and Studio-switch stop/remount behavior are implemented.
Screen-sharing is fail-closed for the host: the presenter overlay is synchronously
closed before the host display-capture picker is invoked, and cannot be reopened
while host display capture is active. Recording/RTMP video originates from the
separate program canvas compositor; the teleprompter DOM is not composited.
`npm run build`, `npm run check:voice-fx`, and the new focused
`npm run check:teleprompter` (23/23) pass. Local Vite UI loaded and script creation,
editing, save, and control display were exercised in the browser; detailed reader
playback and recording/livestream device-output acceptance could not be completed
in this environment. Preview automation stalled after the temporary recording
setup opened, and no browser automation dependency exists in the isolated source
project. Because required interaction/output acceptance could not be completed,
the source changes remain uncommitted for continuation; no deployment or production
change. Permanent Studio deletion remains disabled. See Directive 109 record
`100-DIRECTIVES/TPI-STUDIOFLOW-109-TELEPROMPTER-092.md`.

## TPI-STUDIOFLOW-108 — COMPLETE / TOOLING ONLY / PUSHED (2026-10-28)

Directive 107's source-provenance workflow is integrated into the authorized
branch: `3b55fe9` fast-forwarded onto `codex/tpi-development` (from `b5cd1b7`)
and pushed; local and remote HEAD match. Scope verified limited to the staging
workflow, release baseline, regression test, package script and documentation —
no `studio/` assets, Worker code, migrations or Cloudflare config touched.
107 suite 20/20; 025 12/12; 055 17/17. Entry point still references
`index-D1h4nSZd.js`/`index-CcFjA_0p.css` with hashes `4eed57a4…`/`850186…`
matching the approved baseline. Preserved development (`fc6fe45`) intact;
nothing deployed; production unchanged (Worker `91a8460e`).
[Directive 108 record](100-DIRECTIVES/TPI-STUDIOFLOW-108-INTEGRATE-SOURCE-PROVENANCE-WORKFLOW.md).

## TPI-STUDIOFLOW-107 — COMPLETE / TOOLING ONLY (2026-10-28)

Source provenance corrected: `scripts/stage-studioflow-authoritative.mjs` builds
exactly the approved source commit recorded in `scripts/studioflow-release-baseline.json`
(`6b9c3c4`) from a disposable clean worktree (or a provided clean pinned worktree),
never from the mixed development checkout. Dirty, wrong-commit, missing-commit,
foreign and unauthorized sources are rejected before any build; no bypass flags.
Verify-only rebuilds and compares (never writes); `--apply` is the only staging path.
Two clean builds identical; output reproduces the known-good assets
(`4eed57a4…` / `850186…`); staged `studio/` matches byte-for-byte. Regression
`verify:studioflow-107-provenance` 20/20 (12 required cases); release-safety 21
and 055 pass. Branch `codex/studioflow-107-source-provenance`; nothing deployed;
production unchanged. Owner acceptance of the live interface remains pending.
[Directive 107 record](100-DIRECTIVES/TPI-STUDIOFLOW-107-SOURCE-PROVENANCE-AND-REPRODUCIBILITY.md).

## TPI-STUDIOFLOW-106 — DEPLOYED_AND_VERIFIED (2026-10-27)

Directive 105's authentication blocker resolved: in-progress development preserved
byte-for-byte to `codex/studioflow-105-preserved-development` (`fc6fe45`), then the
canonical checkout moved to clean `codex/tpi-development` @ `9b3f033` (exact origin
parity) so the managed local Worker serves the candidate. Protected credential and
persistent `local_admin` present; auth lifecycle PASS (38/38 ×3, Firefox 64/0).
Guarded preflight READY (lifecycle 29/0, ownership 40/0, deletion 31/0, safety 32/0,
reproducible staging, Cloudflare + dry-run). Application byte-identical to verified
candidate `81a234a` (JS `4eed57a4…`, CSS `850186…`). Deployed Worker
`91a8460e-1db1-440c-9643-a85b6e178fba` at 100% traffic (rollback `17b9f9d5…`).
Live smoke 10/10, Firefox production acceptance 64/0, Video Setup 091 9/0 on the
byte-identical candidate. Both permanent deletion modes remain disabled. Physical
camera/mic device capture and owner acceptance remain pending.
[Directive 106 deployment record](100-DIRECTIVES/TPI-STUDIOFLOW-106-RESOLVE-AUTH-GATE-AND-PRODUCTION-DEPLOY.md).

## TPI-STUDIOFLOW-105 — INTEGRATED/PUSHED / RELEASE BLOCKED (2026-10-26)

Directive 104 evidence committed as `20eba92d2dce2a1db985bc352bedbbe174139d8f`;
fast-forward integrated/pushed on `codex/tpi-development` with live origin parity.
Clean release worktree `.local-dev/worktrees/website-105`; exact approved assets
and application unchanged. Release contract 21/21, 103 gates and 093 regression PASS.
Original website dirty files/HEAD/status preserved under renamed local branch
`codex/studioflow-105-preserved-development`; original source worktrees untouched.
Mandatory `verify:local-auth-lifecycle` FAILED: protected local credential file missing
or not mode 0600 in the new isolated worktree. Stopped as directed: full preflight,
deployment and live verification NOT RUN. Both permanent deletion modes remain blocked.
No Worker deployment ID; no production data operations; owner acceptance PENDING.
[Directive 105 blocker and next release preparation](100-DIRECTIVES/TPI-STUDIOFLOW-105-PRODUCTION-RELEASE.md).

## TPI-STUDIOFLOW-104 — LOCAL ACCEPTANCE PASSED / GUARDED RELEASE BLOCKED (2026-10-26)

Disposable local authentication and Worker acceptance completed on unchanged website
candidate `81a234a2ce91844a1a9ad33be524282dbb7d2874`, source
`6b9c3c4b6b40f0496012e5d718d32d75e149dcf6`. Lifecycle 29/29, 035 33/33,
087 40/40, 088 31/31, 089 32/32, authenticated 091 9/9, Worker 23/23 PASS.
Both permanent deletion modes remain blocked; successful-deletion test exclusions
explicitly documented. Exact JS/CSS/entry-point hashes unchanged; 092 excluded.
Acceptance branch `codex/studioflow-104-release-acceptance` contains uncommitted
harness/documentation changes only. Full preflight rejects the non-release branch.
Authorized integration/push, reconciliation of dirty originals/authoritative source,
clean origin parity and complete maintained auth lifecycle/preflight remain pending.
Original development not edited; no merge, push, deployment or owner acceptance.
[Directive 104 evidence and remaining release gates](100-DIRECTIVES/TPI-STUDIOFLOW-104-RELEASE-ACCEPTANCE.md).

## TPI-STUDIOFLOW-103 — SOURCE INTEGRATED / RELEASE BLOCKED (2026-10-26)

New isolated source branch `codex/studioflow-103-video-setup-release`, commit
`6b9c3c4b6b40f0496012e5d718d32d75e149dcf6`; website branch
`codex/studioflow-103-website-release`. 091 integrated; both permanent deletion
modes intentionally disabled in UI/handler/bridge and authenticated server purge route.
Worklet BASE_URL compatibility fixed after exact staged Firefox failure; rerun 9/9 PASS.
Reproducible staged builds, Voice FX architecture, 101 22/22, 102 8/8, 093 and
website static guards PASS. Lifecycle/035/087/088/089 acceptance BLOCKED by missing
isolated QA credentials. Preflight rejects non-release branch; origin parity and
full Worker acceptance pending. Originals hash-verified unchanged; 092 excluded.
No push, merge, deployment or owner acceptance. See
[Directive 103 candidate evidence](100-DIRECTIVES/TPI-STUDIOFLOW-103-VIDEO-SETUP-RELEASE-CANDIDATE.md).

## TPI-STUDIOFLOW-102 — BLOCKED (2026-10-26)

Real disposable Firefox tests reproduce a legacy tab writing ownership metadata while
another tab holds an exclusive Web Lock. Current-writer locks cannot exclude older tabs;
localStorage ownership and IndexedDB cleanup have no shared transaction. Explicit stop
condition reached; content deletion remains blocked. Source stays clean at `0a104519`.
Browser boundary/storage/helper-recovery checks 8/8, existing local fixtures 22/22,
TypeScript, production build and unchanged 093 regression pass. Full application
concurrent completion/switching and interrupted cleanup acceptance remain unverified.
No source/server repair, 091/092 import, original-tree edit, push, merge or deployment.
[Directive 102 evidence and writer inventory](100-DIRECTIVES/TPI-STUDIOFLOW-102-CROSS-TAB-RECORDING-DELETION-SAFETY.md).

## TPI-STUDIOFLOW-101 — BLOCKED (2026-10-26)

Partial local deletion repairs committed in isolated source `0a10451997e19a09ef2aae94bb9b25395603bfac`.
Local injected fixture tests 22/22, TypeScript, production build and unchanged 093 VM regression pass.
Existing ownership writers and older tabs do not coordinate with deletion locks; a last-moment
localStorage read is not atomic with IndexedDB deletion. **Content deletion now fails closed
before any mutation**; Studio-only retains blobs. This is an intentional blocked-development
behavior change, not safety completion or release readiness. Actual browser/IndexedDB and
cross-tab acceptance remain unverified. No 091/092 code, original-tree edits, push, merge or deployment.
Resolve all-writer coordination and old-tab handling before enabling cleanup. See
[Directive 101 evidence](100-DIRECTIVES/TPI-STUDIOFLOW-101-LOCAL-RECORDING-DELETION-SAFETY.md).

## TPI-STUDIOFLOW-100 — SOURCE ISOLATED (2026-10-26)

Deletion source is isolated on `codex/studioflow-100-deletion-isolation`, source commit
`8b72de811cf1623ac7d6caa5642a43e418d69924`. Paired website server branch:
`codex/studioflow-100-deletion-server`. The website commit is the commit introducing
[the Directive 100 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-100-DELETION-ISOLATION.md).
Both worktrees are under the original website checkout's ignored `.local-dev/worktrees/`.
Original development file bytes and statuses were fingerprinted and verified unchanged.
TypeScript/build/isolation checks and 093 VM purge regression passed. 088 and 089 were
attempted but blocked before browser launch by missing isolated `test_admin` credentials.
No generated website assets, push, merge, deployment, or production mutation occurred.
No 091 or 092 code is included. This is not implementation-complete, safety-verified,
deployed, or owner-accepted. Preserve browser-local recordings; no new ownership DB.
The existing browser bridge already constructs local/shared blob lists; earlier claims
that the server must return them omitted that layer. Local error swallowing, reference
ambiguity, cross-tab races and dialog overflow remain for subsequent implementation.
See the execution record for exact files, build hashes, evidence and next actions.


Last verified: 2026-10-26

## Current source-to-live workflow

`TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md` is the canonical map for moving
StudioFlow from `/Users/toddknipple/Documents/StudioFlow/web` into the website
repository, committing and pushing the deployable checkpoint, running the
guarded production release, and verifying the live site in Firefox Developer
Edition. Source saves, local tests, Git pushes, development-Worker deployments,
and production deployments are separate events and must not be reported as if
they automatically synchronize.

## TPI-STUDIOFLOW-088 Deletion & Archive — Production Verification and Production Repairs — 2026-10-26

Status: `DEPLOYED / LIVE VERIFIED (agent) / OWNER ACCEPTANCE PENDING`.
Authenticated production verification of the Studio deletion suite reproduced
two production-only defects and both were repaired through the maintained
release path. (1) The boot-time Studio replay and identity convergence called
the React activation bridge, whose callback unconditionally opened the studio
view; on production latency the replay landed seconds after load and yanked
the owner (and the QA suite) out of Home mid-flow (`route: "studio"`, empty
card grid). Activations now carry a `background` flag: they restore Studio
state but never navigate after the owner has touched the interface, and
activation resolution is keyed on identity rather than route so bridge switch
bookkeeping cannot jam. (2) Archive/restore sent the menu's cached
`expectedVersion` with no retry and swallowed `workspace_conflict` (409)
failures silently — an autosave racing the request left the owner with a
ignored click. Archive/restore now retry once with the fresh version the
conflict response carries and report every failure in the panel status.
Verified: 088 deletion suite 39/39 including the new Test 11 view-guard
checks, on authenticated production with disposable QA Studios (evidence:
`300-COMPLETED-WORK/evidence/2026-10-26-studioflow-088-production-suite.json`)
and locally 39/39, 087 40/40, lifecycle 29/29, auth lifecycle 64/64. Three
guarded releases: source `9f85f9d` (StudioFlow repo); website commits
`5e206a7`, `6d9facb`, `7da1fb5` (pushed); live production Worker
`fb9ffdb9-137f-4e9e-b5a3-6c5c5fe1e91b`, rollback checkpoints `25f3d4ea` →
`d0dc37a5` → `5ee8b6d2` preserved. No database or storage changes; Crossroads
and all owner Studios untouched. Full record:
`300-COMPLETED-WORK/2026-10-26-TPI-STUDIOFLOW-088-DELETION-PRODUCTION-VERIFICATION.md`.

## TPI-STUDIOFLOW-087 Independent Studios, Studio Dashboards & Production Ownership — 2026-10-26

Status: `IMPLEMENTED / LOCAL TESTED / DEPLOYED / LIVE VERIFIED / OWNER
ACCEPTANCE PENDING`. The homepage listed non-ended Broadcast records while
My Studios listed Studio identities, so production titles masqueraded as
Studios and a server-backed Studio like Crossroads with no local Broadcast
record could never appear on the homepage. The Home page now shows a My
Studios card section built from the same authorized Studio collection as the
My Studios selector (server + browser-local, via
`window.__tpiStudioWorkspace.listStudios()`), and every Studio has its own
dashboard (Enter Studio, Create Livestream/Recording/Webinar, My Productions,
Recordings, Studio Settings). Studio and production creation are separate;
production creation offers an Owning Studio selector and every
livestream/recording/webinar is stamped with its Studio's stable host key at
creation (never from the dropdown selection or a title match). Rename,
Archive, and Restore Archived Studio work end to end (the server restore route
was missing and is now added). Permanent Studio deletion is deferred for
owner approval; historical productions without reliable ownership remain
preserved and unassigned. Verified: 087 suite 40/40 local and 40/40 on
authenticated production (isolated QA account; durable evidence in
`300-COMPLETED-WORK/evidence/2026-10-26-studioflow-087-production-suite.json`),
lifecycle 29/29, 033 26/26, local auth lifecycle 64/64. Source `db3aab4`;
integration `37803f3` + `815fb85` (pushed); production Worker
`b4605f5f-f33e-4f1d-8082-b12fc8bf5bdf`; rollback `6bbdae3d` preserved. The
five pre-existing static-contract suite failures and the timing-sensitive 030
rapid-upload step remain documented and open. Crossroads, Testing 123, and
Browser Only Crossroads were not modified. Full record:
`300-COMPLETED-WORK/2026-10-26-TPI-STUDIOFLOW-087-INDEPENDENT-STUDIOS.md`.

## Emergency Live Production Repair 001 — 2026-10-25/26

Status: `DEPLOYED AND AGENT-VERIFIED — OWNER ACCEPTANCE PENDING`. Four Studio
Management defects were repaired in `studio/workspace-bridge.js`: malformed
browser-local snapshot records (and a corrupt snapshot store) were silently
overwritten instead of preserved for recovery; the My Studios menu could hide
an existing browser-local Studio until an unrelated re-render; a stale menu
selection did nothing and said nothing; and a title conflict silently
disarmed the save integrity gate so a blocked switch fell through to the
browser-local save path and switched anyway. The cache-buster advanced to
`tpi-recovery=preserve-v1`. The owner-approved Testing 123 reset was executed
(one guarded UPDATE on `a75afc38-c7a6-452d-9460-5d746712d411`, full backup and
rollback SQL in `backups/`) and re-verified post-deploy: the stored row and
its live rendering are exactly the four clean default items with no inherited
Crossroads media. Verified with the maintained lifecycle suite 29/29 locally
and 29/29 on authenticated production (including the new H3/H4 preservation
checks), plus the Testing 123 render check 6/6. Deployed Worker
`6bbdae3d-f424-4373-87ff-84030df50a49`, rollback checkpoint `9d3aa40c`.
"Browser Only Crossroads" remains browser-local-only; a read-only owner
diagnostic procedure is in the completion record. Full record:
`300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001.md`.

## Owner Verification 001 — post-deployment Studio Management verification — 2026-10-25

Status: `AGENT VERIFIED — OWNER ACCEPTANCE PENDING`. The deployed Studio
lifecycle recovery was independently re-verified against authenticated
production with the isolated QA account: deployed Worker `9d3aa40c` confirmed
as the active 100% version (rollback `7bddac9c` intact), live application and
bridge assets byte-identical to the website integration, and the maintained
`verify:studioflow-studio-lifecycle` suite passing 25/25 on production and
25/25 locally (both creation workflows, A→B→A switching, isolation, refresh,
unsaved changes, failed-save handling, rapid switching, missing-snapshot
recovery). Read-only D1 inspection established that the owner's "Testing 123"
workspace (`a75afc38-c7a6-452d-9460-5d746712d411`) was created at 16:37Z
before the repair deployed and its saved state retains the historically
inherited eight-item Crossroads-like configuration (proposed remediation
awaiting owner authorization; nothing modified); "Browser Only Crossroads" is
browser-local with no server record and cannot be inspected from the server
side. The four-item vs eight-item difference is workspace data, not an
application mismatch. §11 gap closed: `release:preflight` now runs the
lifecycle suite, enforced by a release-safety contract check. The five
pre-existing static-contract suite failures (048/049/dev-024/dev-037/022) and
the timing-sensitive 030 rapid-upload step remain documented and open. No new
deployment was necessary. Full record:
`300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-OWNER-VERIFICATION-001.md`.

## Studio Creation, Switching & Workspace Isolation Recovery — 2026-10-25

The owner-observed Studio Management failures (new Studio inheriting the
active Studio's configuration; Studio switching silently failing; workspace
identity confusion) are repaired, deployed, and live-verified. Source commit
`44f9478` (StudioFlow canonical repository), application commit `161d03d`
(website integration, pushed), production Worker
`9d3aa40c-9a44-4bf9-bcf1-8efcbf837683` with rollback checkpoint
`7bddac9c-bda3-41c1-95d2-13aacc09cb28`; the live application serves
`/studio/assets/index-Drm85nEM.js` and `/studio/assets/index-8wAEEeJ8.css`.
Root causes: home-screen creation never reset per-Studio configuration;
browser-local Studios without snapshots made `openLocalWorkspace` silently
revert; failed pre-switch saves blocked switching with only a transient
message; only scene slices re-hydrated on switches. Repairs live in
`/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx` (clean creation
reset, complete per-Studio re-hydration, outgoing-Studio preservation) and
`studio/workspace-bridge.js` (per-broadcast configuration sync,
missing-snapshot recovery with visible notice, local recovery copies on save
failure, sticky truthful messaging). The maintained suite
`npm run verify:studioflow-studio-lifecycle` (Directive Tests 1–10 plus
owner-flow checks) passes locally and against production with the isolated QA
account; disposable Studios only, Crossroads untouched. Owner acceptance
remains pending. Full record:
`300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-STUDIO-LIFECYCLE-RECOVERY.md`.

## Production parity investigation — 2026-10-25

Read-only investigation under the archived parity-investigation
authorization. Authenticated production asset parity is verified three ways
(live ↔ website integration ↔ reproducible source build; all
byte-identical), so the owner's Studio symptoms are not caused by stale or
mixed deployments. The production Studio "Testing 123" discrepancy is a
pre-recovery create-path data condition: before the Studio Management
recovery, workspace creation merged the active Studio's localStorage asset
configuration into the new workspace, and the deployed bridge now creates
Studios from explicit clean defaults. "Testing 123" is owner-account data
whose stored state was not inspected; remediation requires owner
authorization. Reported deployments and suite counts remain labeled as
reported where they were not independently re-verified. Full evidence and
the proposed repair plan:
`300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-PRODUCTION-PARITY-INVESTIGATION.md`.

## Integrated Studio Management & Scene System Recovery — 2026-10-25

The integrated recovery is deployed and live-verified, with owner acceptance
pending. The confirmed source/application checkpoints are `657f80e` and
`e83b732` (website application/verification commit).
Local Firefox Developer Edition verification passed the new 21-check recovery
suite plus TPI-027 (12/12), TPI-028 (33/33), TPI-030 (25/25), TPI-031 (34/34),
TPI-033 (26/26), TPI-034 mutation regression, TPI-036 (28/28), TPI-037
(20/20), Addendum D (10/10), and Addendum E (20/20). The recording/storage
suite initially exposed a stale denied production-lock state after recording
finalization. The lock bridge now leaves denied reservations unlocked, and the
corrected Firefox suite passes 33/33.

Confirmed repairs include clean independent Studio creation, immediate
activation of the returned Studio identity, generation-guarded switching,
fixed in-viewport scene menus, removal of legacy Move Up/Move Down commands,
and meaningful scene configuration change notifications for autosave. The
canonical source build is reproducible and the staged entry point references
`/studio/assets/index-BZ_tF0DV.js` and `/studio/assets/index-8wAEEeJ8.css`.

The guarded release deployed Worker
`7bddac9c-bda3-41c1-95d2-13aacc09cb28` and reported 10/10 anonymous
production smoke and 64/64 isolated Firefox Developer Edition live checks,
with rollback `871c0ae7-33c5-46ae-b635-19ec3100c989`. (An earlier draft of
this paragraph claimed production "remains on the previously recorded
Worker" pending the release; that sentence predated the deploy and is
corrected here. The suite counts are the releasing agent's reported results
and were not re-run during the 2026-10-25 parity investigation.)

Independently verified 2026-10-25 (production parity investigation): an
authenticated isolated-QA session on production loads
`/studio/assets/index-BZ_tF0DV.js` and `/studio/assets/index-8wAEEeJ8.css`
byte-identical to the GitHub website integration, and
`stage-studioflow-authoritative.mjs --verify-only` reports
`generatedAssetsMatchIntegratedCandidate: true` with reproducible source
builds — original source, website integration, and production run the same
implementation. All eleven maintained bridge/override files are
byte-identical live versus the repository; the live HTML differs from
`studio/index.html` only by the intentional Worker theme bootstrap
(`worker.js`, `EARLY_THEME_BOOTSTRAP`) and the Cloudflare analytics beacon.
See `300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-PRODUCTION-PARITY-INVESTIGATION.md`.
No production D1, R2, owner Studio, recording, livestream, or media data was
changed under this recovery.

## TPI-STUDIOFLOW-037 Addendum E deployed repair — 2026-10-25

The owner-reported Scenes-panel failures are repaired in the canonical source
and verified locally. New Studios use Intro Video → Scene 1 → Scene 2 → Outro
Video; every production item has a working context menu; `Remove from Scenes`
persists without deleting media or saved scene configuration; new scenes use
the next available sequential name; and saved scene-layout deletion is
confirmation-backed. An individual Intro preview stop no longer starts After
Intro music. Natural Intro completion and sequence rehearsal retain the
configured production handoff.

- Source commit: `8fdabf4`
- Website application commit: `b1c21a0`
- Local Firefox Addendum E: 20/20
- Regressions: TPI-037 20/20; Addendum C 26/26; Addendum D 10/10; TPI-028
  33/33; TPI-030 25/25; TPI-031 34/34; TPI-033 26/26; TPI-034 PASS; TPI-035
  33/33; TPI-036 28/28; TPI-021 31/31
- Production status: superseded by the integrated recovery deployment in Worker
  `7bddac9c-bda3-41c1-95d2-13aacc09cb28`
- Rollback: `871c0ae7-33c5-46ae-b635-19ec3100c989`
- Guarded release: 17/17 safety contract, 10/10 anonymous smoke, and 64/64
  isolated Firefox Developer Edition checks passed
- Focused live Addendum E Firefox workflow: 20/20 with disposable production
  QA workspace archived after verification
- Owner acceptance: pending
- Completion record: `300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-INTEGRATED-RECOVERY.md`

## TPI-STUDIOFLOW-037 production recovery reconciliation — 2026-10-25

The prior Addendum E release was serving the intended application bundle, but
its automated menu assertion only checked DOM existence. Firefox evidence
showed the React scene menu positioned outside the left rail and clipped by
the ancestor `.studio { overflow: hidden; }`. The canonical CSS now keeps the
menu inside the rail, and the maintained test requires a real Firefox click
plus a visible, in-viewport bounding rectangle.

- Source commit: `eff6b69`
- Website application/test commit: `877efb3`
- Loaded production assets: `/studio/assets/index-BfmRc0ua.js` and
  `/studio/assets/index-DB0QL1ns.css`
- Production Worker: `871c0ae7-33c5-46ae-b635-19ec3100c989`
- Rollback: `d58d7e1e-5f86-4c87-93b3-110999d200a9`
- Local focused Firefox Addendum E: 20/20 with visible-menu assertions
- Live focused Firefox Addendum E: 20/20 with disposable production QA
  workspace archived after verification
- Guarded release: `DEPLOYED_AND_VERIFIED`; smoke 10/10; live acceptance 64/64
- Owner acceptance: pending

## TPI-STUDIOFLOW-037 verified production release — 2026-10-24

The Scenes panel redesign, Addenda A/B visual corrections, Addendum B
reactive drag-and-drop repair, and the Addendum C visual-consistency and drag
interaction corrections are deployed and live-verified. The uniform
shortcut layer preserves the existing timer, Video Clips, scene, and
Background Music owners; its panel manifest is validated and saved through
the established per-Studio workspace configuration. TPI-037 passed 20/20 and
the maintained TPI-031 suite passed 34/34.

Addendum A corrected the injected Add Background Music / After Intro shortcut
to use the same 56px solid production surface, blue icon treatment, readable
two-line labels, and non-truncated standard labels as the other production
items. The extended TPI-037 suite passed 13/13 and the existing Background
Music suite remained 34/34.

Addendum B standardizes the exact Intro Video outer dimensions across
Background Music, Countdown Timer, Add Production Item, and Play Sequence;
keeps `Background Music` and `Countdown Timer` as stable visible labels;
preserves creator scene names with fixed-height controlled truncation/tooltips;
and leaves all saved assignments and playback architecture unchanged. Its
reactive drag repair adds live blue insertion feedback, surrounding-item
movement, Escape cancellation, edge auto-scroll, no-playback drag handling,
and autosave through the existing workspace configuration.

Addendum C corrects the owner-reported issues: single-line production labels
(`Intro Video`, `Countdown Timer`, `Background Music`, `Outro Video`) with
full-name tooltips instead of inconsistent wrapping/truncation, Background
Music buttons tinted with their assigned SmartPad track color (neutral when
unassigned), the same drag handle on every movable item, and a reactive drag
where surrounding rows visibly reposition around a live `Move here` gap that
follows the pointer before release. The Addendum C Firefox acceptance suite
passes 26/26 locally and 26/26 against the deployed interface using the
approved synthetic production QA account. Owner acceptance of the corrected
interface remains pending.

- Source commit: `d6b8f03` (Addendum C; prior `322b132`)
- Website application commit: `8a954ad` (Addendum C; test commit `dd22fc5`)
- Active production Worker: `5536bcc5-8c50-4851-b6e4-4a660eb1b0fb`
- Rollback: `1c752f3f-8af3-461f-8082-3dd8a447fd3d` (Addendum B release)
- Acceptance: TPI-037 20/20; Addendum C 26/26 local and production;
  TPI-020–036 suites pass; production smoke 10/10;
  isolated Firefox live acceptance 64/64;
  owner profile access false; release preflight and auth lifecycle PASS
- Completion record: `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-037-SCENES-PANEL-REDESIGN.md`

## TPI-STUDIOFLOW-037 Addendum D verified production release — 2026-10-25

Addendum D repairs production-item playback controls without replacing the
existing timer, Video Clips, Background Music, or rehearsal engines. Playable
media shortcuts now toggle their own existing preview on first and second
click; Play Sequence toggles rehearsal and Stop Sequence cancels pending
rehearsal transitions and active rehearsal media. The context menu now uses
the non-destructive `Remove from Scenes` action; underlying media assets are
never deleted.

The root causes were missing same-item toggle handling in the Video Clips and
Background Music bridges, a timer shortcut that only started the shared ring
engine, and rehearsal advancement that used uncancellable delayed callbacks.
The repair adds generation/token cancellation guards and reuses the existing
stop paths, so individual previews cannot advance rehearsal or create a second
player.

- StudioFlow source commit: `5186e28` (local authoritative source)
- Website application/test commit: `8d46a45`
- Active production Worker: `3a9b090f-78b5-43d6-bb11-17a1ba54d41b`
- Rollback: `5536bcc5-8c50-4851-b6e4-4a660eb1b0fb`
- Validation: Addendum D 10/10 locally; TPI-037 20/20; TPI-028 33/33;
  TPI-031 34/34; TPI-034 mutation regression PASS; local/live isolated
  Firefox acceptance 64/64; production smoke 10/10; release preflight PASS
- Completion record: `300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md`
- Owner acceptance: pending

## Latest verified production release — 2026-10-24 (TPI-STUDIOFLOW-036 cinematic video timers)

TPI-STUDIOFLOW-036 is deployed and live-verified. The supplied owner-approved
Spectacular Cinematic Edition was integrated into the existing Video Timers
engine as nine silent selectable themes in a three-column desktop grid. The
existing Classic Countdown remains the native renderer; the other eight themes
share the same countdown engine, duration state, program-output path, and
cleanup lifecycle. Timer design and duration now round-trip through the
existing per-Studio workspace configuration without a competing persistence or
playback system.

- Directive: TPI-STUDIOFLOW-036
- Application commit: `7bd8c4606660c959c6b3409b4a46a319fc11ec8a`
- StudioFlow source commit: `37c6598`
- Active production Worker: `076c9614-9251-4efd-b047-0e7033f4ad9c`
- Rollback: `aa9bff15-6252-4ae5-9422-17d63b99ab5a` (TPI-035)
- Validation: TPI-036 timer regression 28/28; local Firefox 64/64; live
  Firefox 64/64; production smoke 10/10; release safety 17/17; local auth
  lifecycle PASS; complete isolated QA/API E2E PASS; reproducible staging
  PASS; prior 020/021/027/028/030/031/032/033/034/035 coverage retained
- Data protection: no owner Studio, Crossroads data, production D1 records,
  R2 objects, recordings, or production media were mutated for testing
- Completion record: `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-036-CINEMATIC-VIDEO-TIMERS.md`

## Prior verified production release — 2026-10-24 (TPI-STUDIOFLOW-035 Recording & Storage consolidation)

TPI-STUDIOFLOW-035 is deployed and live-verified. The far-right production
navigation was cleaned up (Live interaction, Comments, and Widgets removed;
Teleprompter placed directly beneath Notes and reusing the existing studio
teleprompter reader), and a first-class Recording & Storage rail section now
hosts every recording/storage setting with truthful save status and honest
destination capability reporting. Settings > Recording and Settings >
Recording & Storage redirect to that section instead of keeping duplicate
controls. Recording saves now report confirmed outcomes with the destination
actually used, an unavailable folder destination requires explicit fallback
confirmation (declining leaves the recording in the awaiting-action state),
and cloud providers are presented only as "Not connected" until verified
OAuth integration exists. Four partially connected workspace recording-
settings defects were repaired (wrong save fields, wrong hydration keys, and
stale React state on Studio activation). The maintained 035 suite passed
33/33 with disposable Firefox and fake media devices.

- Directive: TPI-STUDIOFLOW-035
- Application commit: `d0b1f70da86e6c5490bb89a644f07c5f50a53a1e`
- StudioFlow source commit: `60af530db1d53536975ac910b9501526c54c7600`
- Active production Worker: `aa9bff15-6252-4ae5-9422-17d63b99ab5a`
- Rollback: `5c8e78b5-f920-4335-940f-a5e4d6df0e49` (TPI-033)
- Validation: 035 suite 33/33; 033 round-trip 26/26; 034 mutation regression
  twice; 021 browser 31/31; 028 browser 33/33; 030 browser 25/25; 031
  music pads 34/34; static contracts (021 86/86, 020 14/14 and 13/13, 027
  12/12, 031 overlays 12/12); release safety 17/17; local auth lifecycle
  PASS; local Firefox acceptance 63/63; production smoke PASS; guarded live
  Firefox acceptance 63/63; live artifact verification 200s
- Data protection: no D1, R2, Crossroads, owner-recording, or owner-browser
  mutation; live acceptance non-destructive
- Completion record: `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md`

## Prior verified production release — 2026-10-24 (TPI-STUDIOFLOW-034 DOM mutation repair)

The idle StudioFlow mutation storm was reproduced and resolved in the maintained
bridge layer. The root cycle was an audio soundboard observer responding to its
own unchanged scene-label text-node replacement; redundant visibility writes and
unguarded studio-menu rendering amplified the churn. The repair preserves the
existing playback, persistence, studio-switching, and panel architecture. The
maintained mutation regression passed twice consecutively: settled idle windows
had 0 child-list churn, 0 redundant writes, and only 5 expected checkbox
attribute updates over 5 seconds and 35 over 30 seconds.

- Directive: TPI-STUDIOFLOW-034
- Application commit: `8d7185b`
- StudioFlow source commit: `ce7c389` (website bridge-only release; source unchanged)
- Active production Worker: `0c0a8660-21cf-47e1-ac66-98c91b26972c`
- Rollback: `7029c6c5-3994-42a1-9570-d6119a5792f3`
- Validation: mutation regression twice; local auth lifecycle; complete QA/API
  E2E; focused 020/021/027/028/030/031/032 checks; release safety; production
  smoke 10/10; production Firefox acceptance 64/64
- Data protection: no D1, R2, Crossroads, owner-browser, or user-media mutation
- Completion record: `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-034-DOM-MUTATION-REPAIR.md`

## Prior verified production release — 2026-10-24 (TPI-STUDIOFLOW-033 configuration persistence)

TPI-STUDIOFLOW-033 is deployed and live-verified. The API normalizer preserves
Video Clips assignments and validated pad slots, the bridges serialize scalar
program orientation, and StudioFlow rehydrates program-output state on Studio
activation. The focused local API/Firefox round-trip passed 26/26. The guarded
production release also passed the complete local auth/QA gates, production
smoke 10/10, and isolated live Firefox acceptance 64/64.

- Application commit: `cb38061656565d8e4bd7702a7d627335fe2d4993`
- Documentation checkpoint: this post-deployment synchronization commit
- StudioFlow source commit: `53bf8dc`
- Worker: `theparanormalinitiative`
- Active production Worker: `5c8e78b5-f920-4335-940f-a5e4d6df0e49`
- Rollback: `0c0a8660-21cf-47e1-ac66-98c91b26972c`
- Release source checkpoint: `d51d9de7f86f1b64c80bbcfd427f9c206a120cba`
- Data protection: no D1 migration, R2 mutation, Crossroads mutation, or
  owner-browser access
- Completion record: `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-033-WORKSPACE-CONFIGURATION-PERSISTENCE.md`

## Latest verified production release — 2026-10-24 (TPI-STUDIOFLOW-032 pad artwork replacement)

StudioFlow's audio pads now show distinct, approved per-category artwork
inside the unchanged circular icon container: the Waveform image on
Background Music pads and the Microphone image on Sound Effects pads,
replacing the music-note glyphs. The two approved PNGs
(`/studio/Waveform.png`, `/studio/Microphone.png`) are maintained StudioFlow
assets delivered through the established staging and cache-tag pipeline;
the artwork keeps its proportions, never captures pointer events, and the
pad layout, colors, labels, playback, drag-and-drop, context menus, and
persistence are all unchanged. Both files serve byte-identical on
production (authenticated fetch, SHA-256 compared).

One test-harness repair accompanied the release: the 021 browser suite's
home-screen entry was obsolete (StudioFlow now boots straight into the
active Studio and its Home nav exists only during the boot route
transition), leaving the suite hanging on a transient nav click. Each run
now seeds a fresh browser-local recording broadcast — the same empty-state
studio the home "Record without going live" flow creates — so the suite's
31 assertions run against a clean studio and no longer leave server-side
test studios behind. All assertions are unchanged.

- Directive: TPI-STUDIOFLOW-032
- Application commit: `6a1f8ad` (feature `02056c1`)
- StudioFlow source commit: `ce7c389` (website-only release; source unchanged)
- Worker: `theparanormalinitiative`
- Active production Worker version: `7029c6c5-3994-42a1-9570-d6119a5792f3`
- Immediate rollback reference: `48cdb81d-efcc-4f03-8717-eaa5a51e45d5`
  (the TPI-STUDIOFLOW-031 release)
- Reported validation, verified against the guarded release records:
  021 browser interactions 31/31 (two consecutive runs); 028 browser
  33/33 (two consecutive runs); 030 sound effects browser 25/25 (two
  consecutive runs); 031 music pad browser 34/34 (two consecutive runs);
  021 static contracts 86/86; 020 contracts 14/14; 020 video clips 13/13;
  027 contracts 12/12; 031 overlays 12/12; release safety 17/17; local
  auth lifecycle PASS (isolated Firefox acceptance 64/64); guarded live
  acceptance against production 64/64; live asset verification (icons
  byte-identical on production)
- No D1 migration, R2 mutation, Crossroads mutation, or owner-browser access
- Current release record:
  `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-032-PAD-ARTWORK-REPLACEMENT.md`

## Prior production release — 2026-10-24 (TPI-STUDIOFLOW-031 Background Music pad reordering)

Superseded as the current baseline by the TPI-STUDIOFLOW-032 release above;
retained as deployment history. StudioFlow's Background Music pads now match the Sound Effects experience:
the permanent three-dot menu buttons are gone (the unchanged options menu
opens on right-click, Shift+F10 / the ContextMenu key, or touch long-press),
and creators can arrange their music pads by drag-and-drop or Alt+Arrow
keys. The new order saves automatically per studio with no Save button, and
each studio restores its own arrangement on switching. Pad reordering moves
the complete configuration — media assignment and pad metadata — and never
starts, stops, or restarts playback. Sol's After Intro Background Music
assignment is tracked by stable asset identifier and is verified unchanged
across reorders, with the approved automatic post-Intro transition intact.

Two pre-existing persistence defects were repaired to make this possible:
the API workspace normalizer silently dropped `backgroundMusicSlots`,
`backgroundMusicLoop`, and `sceneMusicAssignments` (music never survived a
studio switch), and the asset-state bridge matched uploaded media
replacements by visit position instead of by asset, cross-wiring the music
and sound lists on save. The TPI-030 Sound Effects improvements are intact.

- Directive: TPI-STUDIOFLOW-031
- Application commit: `4cacb3a`
- StudioFlow source commit: `ce7c389` (website-only release; source unchanged)
- Worker: `theparanormalinitiative`
- Active production Worker version: `48cdb81d-efcc-4f03-8717-eaa5a51e45d5`
- Immediate rollback reference: `9e7cf4ba-1262-4c8d-9b3a-249670eb6a78`
  (the TPI-STUDIOFLOW-030 release)
- Reported validation, verified against the guarded release records:
  031 music pad browser interactions 34/34 (two consecutive runs); 030
  sound effects browser 25/25; 028 browser 33/33; 021 browser 31/31;
  021 static contracts 78/78; 020 contracts 14/14; 027 contracts 12/12;
  031 video overlays 12/12; release safety 17/17; local auth lifecycle
  (Node 38/38, isolated Firefox acceptance 64/64); guarded live acceptance
  against production 64/64
- No D1 migration, R2 mutation, Crossroads mutation, or owner-browser access
- Current release record:
  `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-031-BACKGROUND-MUSIC-PAD-REORDERING.md`

## Prior production release — 2026-10-23 (TPI-STUDIOFLOW-030 Sound Effects pad reordering)

Superseded as the current baseline by the TPI-STUDIOFLOW-031 release above;
retained as deployment history. StudioFlow's Sound Effects panel is cleaner and the sound pads are
organizable by the creator. The Stop Sound button is removed from the sound
controls (the volume slider, playback, and routing are unchanged; Background
Music keeps its own stop control), the permanent three-dot menu buttons are
removed from pads while the existing options menu (Rename, Change color,
Replace audio, Remove) stays available on right-click and on Shift+F10 or
the ContextMenu key, and pads can be reordered by drag-and-drop or by
Alt+ArrowLeft/Alt+ArrowRight. The new order saves automatically per studio
through the existing workspace configuration — no Save button — and each
studio restores its own arrangement on switching.

- Directive: TPI-STUDIOFLOW-030
- Application commit: `e18d327` (feature `8f6035a`)
- StudioFlow source commit: `ce7c389` (bridge-only release; source unchanged)
- Worker: `theparanormalinitiative`
- Active production Worker version: `9e7cf4ba-1262-4c8d-9b3a-249670eb6a78`
- Immediate rollback reference: `21ea05f7-588d-4b5a-b039-c6063f7fd248`
  (the TPI-STUDIOFLOW-028 Addendum A release)
- Reported validation, verified against the guarded release records:
  030 sound effects browser interactions 25/25 (two consecutive runs);
  021 static contracts 69/69; 021 browser interactions 31/31; 028 browser
  interactions 33/33; 020 contracts 14/14; 031 overlays 12/12; release
  safety 17/17; local auth lifecycle (Node) 38/38 and isolated Firefox
  acceptance 61/61; guarded live acceptance against production 61/61
- No D1 migration, R2 mutation, Crossroads mutation, or owner-browser access
- Current release record:
  `300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-030-SOUND-EFFECTS-PAD-REORDERING.md`

## Prior production release — 2026-10-23 (TPI-STUDIOFLOW-028 Addendum A)

Superseded as the current baseline by the TPI-STUDIOFLOW-030 release above;
retained as deployment history. StudioFlow's My Scenes controls again operate as independent production
shortcuts: Intro Video and Outro Video play their assigned Video Clips from
00:00 with Play/Stop toggles and scene restoration, and Sol's original After
Intro Background Music automatic transition is preserved. The current
approved playback contract and the verified regression history are recorded
in `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`.

- Directive: TPI-STUDIOFLOW-028 Addendum A, following TPI-STUDIOFLOW-027
  (authenticated media resolution, application commit `eee0cff`) and
  TPI-STUDIOFLOW-028 (scene playback and restoration, application commit
  `592028a`) the same day
- Application commit: `cb97464`
- Documentation commit: `89baade`
- Worker: `theparanormalinitiative`
- Active production Worker version: `21ea05f7-588d-4b5a-b039-c6063f7fd248`
- Immediate rollback reference: `210f4610-ff8a-4192-a944-4668892dd669`
  (the TPI-STUDIOFLOW-028 release; its own rollback reference is
  `d6ee132b-59f6-4694-a64b-09d6de37d3e5`, the TPI-STUDIOFLOW-027 release)
- Reported validation, verified against the guarded release records:
  028 browser interactions 33/33; 021 static contracts 58/58; 021 browser
  interactions 29/29; 020 contracts 14/14; release safety 17/17; live smoke
  10/10; live isolated Firefox Developer Edition acceptance 60/60
- No D1 migration, R2 mutation, Crossroads mutation, or owner-browser access
- Current release record:
  `300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md`
  (including its Addendum A section)

## Prior production release — 2026-10-23 (countdown timer deduplication)

StudioFlow's Video Timers controls now render one duration row containing
exactly `10s`, `20s`, `30s`, and `60s`. The maintained media bridge previously
moved each React-created row without removing the stale row retained from the
prior render, causing the four choices to repeat. The bridge now scopes timer
controls to the canonical container and removes stale duration rows before
attaching the current row.

- Superseded as the current baseline by the TPI-STUDIOFLOW-028 Addendum A
  release above; retained as deployment history.
- Release commit: `b922102ae59e6e01738f86ca1c8991c2598966f5`
- Functional fix commit: `aabbb48`
- Worker: `theparanormalinitiative`
- Active production Worker version: `dcb6ad62-d496-44fc-bfa2-20be076f0617`
- Immediate rollback reference: `0862ff17-3003-4e27-8ab3-dc7218dbbff3`
- Live anonymous smoke: PASS, 10/10
- Live isolated Firefox Developer Edition acceptance: PASS, 60/60
- Countdown row: PASS initially and after uploads, Studio switching, and refresh
- No D1 migration, R2 mutation, Crossroads mutation, or owner-browser access
- Current release record:
  `300-COMPLETED-WORK/2026-10-23-STUDIOFLOW-COUNTDOWN-TIMER-DEDUPLICATION.md`

## Prior production release — 2026-10-23 (live panel display repair)

The latest release fixes the actual production cause of the cumulative
StudioFlow right rail. The bridges set their injected media elements to
`hidden`, but production grid styles kept those elements visibly rendered.
The bridges and stylesheet now enforce a true rendered `display: none` outside
Media Assets, and the acceptance harness checks computed layout rather than
trusting the hidden property alone.

- Release commit: f1603710545447b072fbe6160acc3bccbcf456e4
- Worker: theparanormalinitiative
- Active production Worker version: 0862ff17-3003-4e27-8ab3-dc7218dbbff3 at 100%
- Immediate rollback reference: a4e1f565-21fb-449d-878a-388beabac36c
- Live anonymous smoke: PASS, 10/10
- Live isolated Firefox Developer Edition acceptance: PASS, 59/59
- Authenticated owner Firefox production verification: PASS for all 11 tabs
- Every non-media tab omitted rendered Video Timers, Sounds, and Background Music
- Media Assets retained video, timer, sound, and music controls
- Bridge and stylesheet cache identifier: exclusive-v3
- Owner production browser storage was not changed; the owner profile was used
  only for non-destructive live tab verification.
- No rollback required; protected resources were untouched.
- Current release record:
  300-COMPLETED-WORK/2026-10-23-STUDIOFLOW-LIVE-PANEL-DISPLAY-REPAIR.md

## Prior production release — 2026-10-23 (historical)

This earlier release attempted the exclusive StudioFlow right-rail panel
repair. It is retained as deployment history and is superseded by the live
panel display repair above.

- Release branch: codex/tpi-development
- Deployment commit: 0ce8774ff62b437e7a7862e47e60f3302d306d37
- Worker: theparanormalinitiative
- Active production Worker version: 41c7c0bf-5b46-4fd7-b2af-4bdf3f101bc3 at 100%
- Immediate rollback reference: 78693444-4f7b-4115-b77b-5039be40db3f
- Anonymous live smoke: PASS, 10/10
- Isolated production Firefox Developer Edition acceptance: PASS, 59/59
- Exclusive right-rail panel checks: PASS for all 11 panels
- Release preflight, API E2E, build, staging, request-budget guard, and guarded
  Wrangler dry-run: PASS
- Current StudioFlow release record:
  300-COMPLETED-WORK/2026-10-23-STUDIOFLOW-EXCLUSIVE-PANEL-REPAIR.md
- Protected resources: Crossroads of the Unknown untouched; no D1 migration,
  R2 mutation, or owner-browser storage access.

## Earlier StudioFlow panel-navigation and program-cue release (historical)

This earlier release repaired StudioFlow panel navigation and program cues. It
is retained as deployment history and is superseded by the live panel display
repair above.

- Release branch: codex/tpi-development
- Source commit: 17bbd4a in /Users/toddknipple/Documents/StudioFlow/web
- Deployment commit: ee679bcd2d29b83659dbcdc4fc6ccc1c6862dd47
- Worker: theparanormalinitiative
- Active production Worker version: 5a092da4-cab0-4551-bb60-4ce0f40f6573 at 100%
- Immediate rollback reference: e04b6691-6f35-453b-8780-1015e5a55cb5
- Anonymous live smoke: PASS, 10/10
- Isolated production Firefox Developer Edition acceptance: PASS, 37/37
- Right-rail panels: PASS, 11/11
- Release preflight, local authentication lifecycle, API E2E, build, staging,
  request-budget guard, room/RTMP syntax, and guarded Wrangler dry-run: PASS
- Program cue behavior: Intro, Outro, and assigned scene music remain idle
  until Live or Record is engaged; explicit pad playback remains available.
  (Historical record of this release only: the program-state playback gating
  and scene-music gating were later identified as regressions of the
  TPI-STUDIOFLOW-020 click-to-play contract and Sol's approved After Intro
  music transition, and were repaired by TPI-STUDIOFLOW-028 and its Addendum
  A. See `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`.)
- Current StudioFlow release record:
  300-COMPLETED-WORK/2026-10-23-STUDIOFLOW-PANEL-AND-PROGRAM-CUE-REPAIR.md
- Protected resources: Crossroads of the Unknown untouched; no D1 migration,
  R2 mutation, or owner-browser storage access.

## Earlier production baseline record (historical)

The release below is retained as historical provenance and must not be
interpreted as the active production state.

- Release branch: `codex/tpi-development`
- Source commit: `68e44b7ff0c294db72aaef1bc1f21307af8c765d`
- Worker: `theparanormalinitiative`
- Active production Worker version: `e04b6691-6f35-453b-8780-1015e5a55cb5` at 100%
- Deployment date: `2026-10-23`
- Immediate rollback reference: `ad3b6211-ca07-4156-9cef-e99ab9484035`
- Anonymous live smoke: PASS, 10/10
- Isolated production Firefox Developer Edition acceptance: PASS, 26/26
- Video Clips focused checks: PASS, 13/13
- Media organization focused checks: PASS, 22/22
- Release safety checks: PASS, 15/15
- Authoritative StudioFlow build: PASS, reproducible twice
- Guarded Wrangler dry-run: PASS
- Intro/Outro card behavior: PASS — assigned cards are display-only, omit card
  Preview, have no fullscreen controls, and defer playback to the left-side
  Intro/Outro scene cards; visible thumbnails or control-free stored-video
  previews confirm that a clip is loaded; general Video Clips remain
  stage-playable.
- Protected resources: Crossroads of the Unknown untouched; no D1 migration, R2
  mutation, or owner-browser storage access
- Current StudioFlow release record:
  `300-COMPLETED-WORK/2026-10-23-STUDIOFLOW-GHOST-PRESET-REPAIR.md`
- Workflow repair: the acceptance runner now labels and foregrounds the exact
  disposable Firefox window `TPI ISOLATED LIVE ACCEPTANCE — SIGN IN HERE` and
  rejects other Firefox windows as evidence for production acceptance.

## Controlling agent authority

`100-DIRECTIVES/TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md` is the active
operations policy. Every capable agent has standing authority to carry an
active TPI directive through investigation, repair, testing, focused commit,
GitHub push, guarded production deployment, live Firefox Developer Edition
verification, and rollback. Routine repairable blockers are not reasons to
stop or request another directive.

Older `no deploy`, `owner approval required`, `stop after reporting`, and
similar statements remain accurate records of their original task. They do not
override a newer directive or create permanent repository-wide restrictions.
A current task that is explicitly read-only or says not to deploy remains
limited for that task.

The mandatory implementation procedure is
`TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md`. It requires permanent local-admin
verification, exact disposition of every working-tree file, focused staging,
commit and GitHub parity, complete release preflight, guarded production
deployment for every completed application directive, live Firefox Developer
Edition acceptance, automatic rollback on critical failure, and a clean final
tree.

## Project identity

- Canonical repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Last fully verified release-workflow source: `cb9746411398df16282c305101cb0b41425bcd39`
- Current verified production release source: `cb9746411398df16282c305101cb0b41425bcd39`
- Development Worker: `theparanormalinitiative-dev`
- Development URL: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev`
- Development version: cf58029d-62be-409f-98ff-58591b020641
- Production version: `21ea05f7-588d-4b5a-b039-c6063f7fd248`
- Production: the verified release includes the existing TPI-DEV-037 and later
  StudioFlow functionality, the completed StudioFlow 020–023 release scope,
  and the 2026-10-23 scene-media release scope (TPI-STUDIOFLOW-027, 028, and
  028 Addendum A; see `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`). Live Firefox
  acceptance verified the StudioFlow shell, video cards, timers, soundboards,
  My Studios layout, browser-local save, portable media-inclusive backup,
  restore-as-new, switching, and persistence with disposable data.

The development and production deployment records report the verified branch
and application source commit above.

## Release traceability (TPI-OPS-030)

| Directive | Git commit | Branch | Cloudflare Worker version | Production verification |
| --- | --- | --- | --- | --- |
| TPI-STUDIOFLOW-026 to 029 release (isolated E2E harness, synthetic admin seed, configuration integrity, studio bridge fixes) | `db7e1c5` | `codex/tpi-development` (pushed; local and remote match) | `7c5ea692-e2e9-41f1-9b34-651230e03997` at 100%, deployed 2026-10-22 05:43 UTC | Read-only HTTP only: `/` and `/api/auth/me` return 200 on the Worker host and `paranormalinitiative.com`; `/studio/` returns 403 Coming Soon page. Browser and authenticated production acceptance not yet run. |
| Worker request-budget repair | `0657ab0` | `codex/tpi-development` (pushed; local and remote match) | Not deployed; rollback baseline `7c5ea692-e2e9-41f1-9b34-651230e03997` remains at 100% | Local Firefox 23/23, API E2E 225/225, focused StudioFlow regressions, reproducible build, and guarded Wrangler dry-run passed. Production release waits for the Cloudflare daily request allowance to reset. |

Current rollback target: `7c5ea692-e2e9-41f1-9b34-651230e03997`. The guarded
release workflow records and verifies the active version immediately before
each later deployment and restores it automatically if critical live acceptance
fails.

### Worker request-budget incident and permanent repair — 2026-10-22

- Cloudflare recorded 160,573 successful Worker events in the preceding 24
  hours while static asset requests accounted for only about 2,400 requests.
  This was automated API traffic, not traffic from the five registered members.
- The isolated production Firefox acceptance runner called `/api/auth/me`
  every 200 milliseconds while waiting as long as ten minutes for manual login.
  It now waits on browser-local navigation or DOM state and performs one final
  authenticated-session confirmation.
- The maintained StudioFlow React source also polled production room signals
  every 900 milliseconds and guests plus status every two seconds. Source
  commit `9f0e24e` replaces those fixed intervals with non-overlapping,
  visibility-aware scheduling: visible signal polling every two seconds,
  visible guest/status refresh every ten seconds, and substantially slower
  background-tab polling. The request-budget regression is mandatory in the
  authoritative build and complete QA gate.
- Canonical implementation commit `0657ab0` also excludes Markdown files from
  production asset packages and repairs authoritative staging so Video Clips,
  Soundboards, cache tags, and the verified existing CSS remain preserved.
- Verification: API E2E 225/225, isolated Firefox Developer Edition 23/23,
  local authentication 38/38, focused StudioFlow regression suites passed,
  source builds were reproducible, and the guarded Wrangler dry-run passed.
- Production remained safely rolled back to
  `7c5ea692-e2e9-41f1-9b34-651230e03997` at 100%. No D1 rows, R2 objects,
  Crossroads data, or owner browser storage were changed. Deployment and live
  acceptance must occur only after the Cloudflare allowance resets and the
  full guarded preflight succeeds.

### TPI-STUDIOFLOW-026 Addendum A — permanent local authentication and release workflow

- Implementation commit: `7aae32a` on `codex/tpi-development`.
- Root cause confirmed: the persistent D1 `local_admin` password hash had
  drifted from the protected mode-0600 credential store. The active admin row
  was restored in place; its identity and role were preserved and only its
  prior sessions were invalidated.
- Permanent boundary: API E2E can no longer seed `.local-dev/state`; the
  former reuse mode fails closed and full E2E uses disposable port 8789 state.
- Lifecycle acceptance: OPS-009 38/38 before restart, 38/38 after the managed
  restart, 38/38 after a StudioFlow build, and isolated Firefox Developer
  Edition 23/23. Credential and D1 fingerprints remained unchanged.
- Maintained commands: `npm run verify:local-auth-lifecycle`,
  `npm run release:preflight`, and owner-authorized
  `TPI_PRODUCTION_DEPLOY=approved npm run release:production`.
- The release command enforces clean Git/GitHub parity, Cloudflare account and
  rollback checks, isolated E2E, Firefox acceptance, guarded dry-run, guarded
  deployment, live smoke, and automatic Worker rollback. It contains no D1
  migration or R2 deletion step.
- No production deployment or production-data mutation was performed by this
  addendum.

### TPI-OPS-031 final authenticated acceptance — 2026-10-22 (BLOCKED)

- Production version re-verified: `7c5ea692-e2e9-41f1-9b34-651230e03997` at 100%.
- Git: `codex/tpi-development` local and remote at `065b480`; working tree clean.
- Access control, sign-in, StudioFlow load, feature controls, backup controls, and console checks: NOT TESTED.
- Blocker: no safe, supported way was found to provision a synthetic production account with a Creator Studio entitlement. Public member registration (`/members/register`) creates a plain member with no `creator_studio_entitlements` row, and no admin session was used. The existing owner-authorized fixtures `TPI Acceptance Test A/B` (TPI-STUDIOFLOW-081) are not in the repository and their credentials are not available.
- Release status: STATE B for authenticated acceptance. The release is deployed and unauthenticated checks pass, but it does not qualify for STATE A.
- No production data, secrets, Crossroads studio, or migrations were changed.

### TPI-OPS-032 account recovery and entitlement check — 2026-10-22 (BLOCKED)

- Read-only production D1 query: no contributor row matches `TPI Acceptance Test A` or `B` (by username or display name). They do not exist under those names, so their StudioFlow entitlement state cannot be confirmed.
- Supported entitlement path: the only admin route that writes `creator_studio_entitlements` is the Founding 50 award (`handleAdminAllocateFounding50`). It returns 423 unless `FOUNDING50_PRODUCTION_ACTIVATION` is `approved`, and the Admin Panel award button is disabled pending owner approval. Invitations and public registration grant no StudioFlow entitlement.
- Account recovery: not possible without the existing credentials or an owner-authorized path. No password was reset.
- Owner action required: either approve the Founding 50 activation gate for one synthetic acceptance account, or provide an existing StudioFlow-entitled synthetic account. Then authenticated acceptance can run.
- Authenticated acceptance: NOT TESTED. Release remains STATE B.

Isolated release-gate results for this release were run against the local isolated Worker on 127.0.0.1:8789, not production: API E2E 225/225, Firefox acceptance 23/23, Chromium 021 17/17, Chromium 022 16/16, backup and restore 13/13, configuration integrity 6/6.

TPI-MASTER-001C is active under the mandatory completion policy. The current production-facing repair is the deployed
My Studios dropdown clipping correction recorded in
`docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-MASTER-001-RESULT.md`. No
database migration or owner-data operation was performed. Authenticated editor
interaction remains the final verification limitation; the exact handoff
requirement is recorded in `300-COMPLETED-WORK/TPI-MASTER-001C-RESULT.md`.

Chronological production execution under TPI-MASTER-001A has reconciled
TPI-DEV-001 through TPI-DEV-037 in source order, preserving explicit archive
gaps for DEV-006, DEV-029, and DEV-033. DEV-001 is blocked as
non-production infrastructure work; DEV-002 and DEV-003 are superseded for
the current production-target mission; DEV-004 is verified documentation-only;
DEV-010's reviewed member-login repair is deployed, with authenticated-state
verification passed and signed-out submission/recovery branches still pending;
DEV-013 remains blocked on migration-ledger reconciliation because the
physical creator/StudioFlow schema is ahead of the recorded ledger. The
next available source sequence is the StudioFlow directive archive beginning
at TPI-STUDIOFLOW-013. The available StudioFlow sequence has now been
reconciled against the current production release lineage through
TPI-STUDIOFLOW-082; the remaining live gates are authenticated save/switch/
refresh and media/guest acceptance, not an untracked local development copy.
See `300-COMPLETED-WORK/TPI-MASTER-001A-PROGRESS-2026-10-20.md`.

## Status vocabulary

- **VERIFIED COMPLETE**: current source and executed evidence support the claim.
- **IMPLEMENTED, VISUAL ACCEPTANCE PENDING**: source and non-visual tests exist,
  but authenticated browser inspection remains open.
- **IMPLEMENTED, EXTERNAL ACCEPTANCE PENDING**: local integration exists, but a
  separately authorized provider or external service test has not occurred.
- **PARTIALLY COMPLETE**: only a defined subset is verified.
- **NOT IMPLEMENTED**: no current implementation evidence.
- **BLOCKED**: a required safe prerequisite prevents verification.
- **NOT TESTED**: no current execution evidence for the specific claim.

## Documentation synchronization policy

Every completed TPI development directive must update the affected Markdown
records before its status is marked COMPLETE. The record must include the source
files changed, verification results, known limitations, current development
status, and the corresponding directive-index entry. Historical reports remain
immutable records; corrections belong in a dated addendum or a later result.
Documentation must distinguish COMPLETE, PARTIAL, BLOCKED, NOT VERIFIED, and NOT
DEPLOYED. Local tests alone must never be described as proof of production
readiness.

## Current feature matrix

| Area | Current status | Evidence / limitation |
| --- | --- | --- |
| Public homepage, navigation, content, authentication entry points | VERIFIED COMPLETE | Development runtime and prior website integration evidence; visual scope remains subject to owner review where noted below |
| Member Home, profiles, feed, comments, reactions, messaging, notifications, settings, privacy | IMPLEMENTED, VISUAL ACCEPTANCE PENDING | DEV-021 integration evidence and focused API regressions; no claim of complete owner visual acceptance |
| Education Center | IMPLEMENTED, VISUAL ACCEPTANCE PENDING | Existing development source and prior integration evidence; production publication is outside scope |
| Paranormal Teams | IMPLEMENTED, IMPORT NOT AUTHORIZED | Research remains separate; no research import or publication was performed |
| TPI Videos | VERIFIED COMPLETE WITH REGRESSION LIMITATIONS | Video player: 22 assertions passed; format/date, navigation, and media-grid regressions passed |
| Media uploads and retrieval | IMPLEMENTED, VISUAL ACCEPTANCE PENDING | DEV-022 offline privacy contracts and media regression passed; no production media changes |
| Search | VERIFIED COMPLETE AT CONTRACT LEVEL | DEV-022 offline search contracts passed; broad visual acceptance remains owner work |
| Events | VERIFIED COMPLETE AT DEVELOPMENT RUNTIME LEVEL | Browser inspection rendered the development Events page, filters, cards, RSVP controls, and submit-event navigation; authenticated administration UI remains owner acceptance |
| Administration Center | IMPLEMENTED, DEVELOPMENT AND PRODUCTION DEPLOYED / VISUAL ACCEPTANCE PENDING | DEV-032 navigation correction and DEV-031 analytics are deployed to both environments; anonymous protection, public routes, private-source exclusion, and development authenticated authorization passed; authenticated production owner inspection remains open |
| Public landing and authenticated home routing | IMPLEMENTED AND DEPLOYED / AUTHENTICATED ACCEPTANCE PENDING | TPI-DEV-035 uses the existing shared shell for guest navigation, makes hosted /api/auth/me authoritative, redirects authenticated / server-side to /member-home, and marks anonymous root HTML private/no-store. Anonymous development and production checks passed; authenticated browser acceptance remains open. |
| Creator applications and entitlement enforcement | VERIFIED COMPLETE WITH LIMITATIONS | DEV-014 and DEV-025 authenticated synthetic tests passed; real membership activation remains disabled |
| Founding 50 activation/allocation | VERIFIED PROTECTED | Development activation is `disabled`; protected mutation remains expected HTTP 423 |
| StudioFlow creator access | VERIFIED COMPLETE WITH LIMITATIONS | Positive entitled creator access and revoked denial passed; visual acceptance remains open |
| StudioFlow workspaces and My Studios | IMPLEMENTED AND DEPLOYED / DEVELOPMENT FINAL ACCEPTANCE PASSED / AUTHENTICATED EDITOR CLICK VERIFICATION PENDING | DEV-037 correction commit `7385f0c`; development `cf58029d-62be-409f-98ff-58591b020641`; production `37cdf44a-3ef9-4095-b95e-543017d77e74`; 37/37 final acceptance, concurrent-save conflict repair, numbered allocation, rename, duplicate, soft-delete/recovery, autosave, owner isolation, active/scheduled guards, deployed selector portal repair, production schema, and public protection passed; editor automation still times out after media-heavy editor entry |
| StudioFlow JSON configuration backup/import | VERIFIED COMPLETE AT API/OFFLINE LEVEL | Export structure and import validation passed; browser download/file-picker interaction remains owner acceptance |
| StudioFlow recording recovery | IMPLEMENTED, BROWSER RESTART ACCEPTANCE PENDING | Existing browser-local recovery and download behavior preserved; session restart and playback were not manually verified in DEV-026 |
| RealtimeKit rooms/livestreams | IMPLEMENTED, EXTERNAL ACCEPTANCE PENDING | Integration path and protections are documented; no external room or livestream was created |

## Administration Center and creator boundaries

Creator Studio entitlement does not grant Administration Center access. The
current tests verify owner-scoped workspace access and cross-account isolation.
Private recordings, stream credentials, unpublished media, and provider tokens
remain outside the administration preview surface.

## Database and migration status

Development D1 is `tpi_contributor_portal_dev` (`4948ecc5-35de-4782-8f6b-b07fa1782b66`).
The `studio_workspaces` table exists in both remote environments and supports
the deployed workspace routes. Development contains the exact table and two
indexes from `0051_studioflow_workspaces.sql`. Production received that exact
targeted schema correction under TPI-DEV-036 after a verified private D1 export;
the production table is currently empty. The production `d1_migrations` ledger
still contains only its original `0001` and `0002` rows and was intentionally
not fabricated or advanced because the historical backlog is incomplete.

TPI-DEV-036 backup: `/Users/toddknipple/Documents/TPI-DEV-036-backups/2026-10-15/tpi_contributor_portal.sql`
(SHA-256 `bf85cce8cfb16dd2042e6141c5b496a8c583877ef1b0cb333a0a4c14032a1760`).
Authenticated production workspace mutation remains not tested because no
authorized production test identity was available.

DEV-037 adds `studio_number`, `deleted_at`, the
`studio_number_allocations` table, and two indexes through
`migrations/0052_my_studios.sql`. Development preserves all 17 existing
workspace rows. Production received only this authorized migration after a
fresh private backup; existing production counts and the original two-entry
migration ledger remain unchanged.

## Backup and restore policy

Cloudflare D1 and R2 are application-storage services, not backup destinations.
The approved backup destinations are local storage, personal cloud drives, and
external/removable storage. StudioFlow currently exports/imports workspace
configuration JSON locally. Recording binaries are not included in that JSON;
existing browser-local recordings remain in browser storage until the creator
explicitly downloads or exports them. No automatic upload, deletion, or cloud
drive OAuth was introduced.

## Verified test evidence

- DEV-025 creator acceptance: 39/39 passed.
- DEV-037 My Studios development acceptance: 32/32 passed; final acceptance: 37/37 passed; offline contracts: 12/12 passed. The final acceptance found and repaired one concurrent-save response defect before promotion.
- DEV-024 offline workspace/backup boundaries: 17/17 passed.
- DEV-022 offline media/search/Events contracts: 15/15 passed.
- DEV-014 authenticated authorization: 57/57 passed.
- DEV-020 acceptance: 39/39 passed.
- DEV-021 integration: 116/116 passed.
- Video player regression: 22 assertions passed.
- Video format/date regression: passed.
- Media grid regression: passed.
- TPI Videos navigation regression: passed after a stale assertion was repaired.

Historical totals are not added together as unique coverage.

## Remaining owner and release decisions

1. Perform authenticated StudioFlow browser acceptance at desktop, tablet, and
   mobile sizes.
2. Verify browser download/import dialogs and browser session-restart recording
   recovery with a synthetic recording.
3. Decide whether to authorize a separate bounded RealtimeKit test, including any
   provider cost and cleanup approval.
4. Reconcile the development D1 migration ledger before future migration work.
5. Complete authenticated production StudioFlow workspace acceptance only with
   an authorized production test identity; no Worker release is required for
   the TPI-DEV-036 schema repair.
6. Complete authenticated production My Studios acceptance only with a
   dedicated authorized production test identity; no real member workspace was
   mutated during DEV-037 promotion. Production read-only routes, schema, and
   preservation counts passed after the correction release.

See [TPI-DEV-026 implementation report](300-COMPLETED-WORK/TPI-DEV-026-IMPLEMENTATION-REPORT.md)
and [TPI-DEV-026 production readiness gap analysis](200-AUDITS/TPI-DEV-026-PRODUCTION-READINESS-GAP-ANALYSIS.md).

## TPI-OPS-004 Cloudflare Worker inventory and traffic forensics

The current Cloudflare account inventory returned exactly four Workers. The TPI
Workers are `theparanormalinitiative` (production) and
`theparanormalinitiative-dev` (development); the other two are separate
projects. No older similarly named TPI development Worker was found in the
current account inventory. The development Worker was created on 2026-10-12
and uses the isolated development D1/R2 resources, outbound guard variables,
and no scheduled trigger. The production Worker retains the production custom
domain, production D1/R2 resources, and six-hour scraper cron.

The reconciled Wrangler deployment history shows active development version
`cf58029d-62be-409f-98ff-58591b020641` and active production version
`05c5d075-8d28-4f72-a4c8-a8edba01bb10`. The earlier `c181...` and `f89...`
values were retained historical deployments, not the active versions. No
deployment was performed by OPS-004.

The previously measured 116,223 development requests on 2026-10-16 remain
partially unexplained: the aggregate and a bounded 41,852-request window are
confirmed, but complete endpoint, user-agent, hourly, and caller attribution
was unavailable. OPS-003 found no active local TPI runaway process, and the
current source/configuration audit found no TPI Worker-to-TPI Worker loop.

OPS-002 local traffic-protection checks remain **CONDITIONALLY READY FOR A
SEPARATE CONTROLLED DEPLOYMENT**. OPS-004 performed no deployment, Worker
traffic, database/R2 change, billing change, commit, or push. See [the
OPS-004 inventory](100-DIRECTIVES/TPI-OPS-004-CLOUDFLARE-WORKER-INVENTORY.md),
[traffic forensics](200-AUDITS/TPI-OPS-004-WORKER-TRAFFIC-FORENSICS.md), and
[completion record](300-COMPLETED-WORK/TPI-OPS-004-CLOUDFLARE-WORKER-INVENTORY.md).

## TPI-OPS-005 controlled development deployment and request baseline

The OPS-002 runtime protections were deployed once to development from an
isolated snapshot based on canonical HEAD `7385f0c`, with only
`member-shell.js` and `tpi-video.html` overlaid. The active development Worker
is now `802425a6-e7d0-4ff4-917f-12fff09d147f` at 100%. The deployed provenance
payload matches the isolated source snapshot and `codex/tpi-development`.

Static analysis confirms that normal multi-tab development activity can
plausibly generate tens of thousands of requests through visible notification,
Messenger, and live-video polling, but the historical 116,223-request source
remains **INSUFFICIENT EVIDENCE** rather than proven causation. StudioFlow's
one-second timer is local state/fingerprint work, not a one-second network
poll.

The bounded post-deployment verification used 13 of 30 authorized development
requests. Root and Member Home returned 200; anonymous Administration Center,
notifications, Messenger, and StudioFlow protections returned expected 403/401
responses; provenance matched. Authenticated multi-hour traffic and recording
recovery were not tested. Production remained unchanged. See the [OPS-005
baseline](200-AUDITS/TPI-OPS-005-DEVELOPMENT-REQUEST-BASELINE.md) and
[deployment verification](300-COMPLETED-WORK/TPI-OPS-005-DEPLOYMENT-VERIFICATION.md).

## TPI-OPS-006 local development environment assessment

OPS-006 was completed as a read-only assessment. The canonical Worker entry,
production/development Wrangler separation, D1/R2 binding usage, authentication
cookie and entitlement model, external-service paths, StudioFlow loopback room
server, and agent/browser access boundaries were inventoried. No local Worker
was started and no local configuration, schema, fixture, application behavior,
database, R2 object, deployment, account, or worktree change outside the
required documentation was performed.

Cloudflare’s current platform documentation confirms that `wrangler dev` can
run the Worker locally with local D1 and R2 simulations and persistent local
state. The repository is not yet operationally ready for that workflow: it
needs a separate local config, reviewed schema bootstrap, synthetic fixtures,
local media state, an outbound fail-closed guard, and a local HTTPS/cookie
decision. The existing StudioFlow room service remains a separate loopback
dependency on port 8788 and is in-memory only. Port 8787 was free; no server
was started. See the [OPS-006 assessment](100-DIRECTIVES/TPI-OPS-006-LOCAL-DEVELOPMENT-ASSESSMENT.md),
[architecture audit](200-AUDITS/TPI-OPS-006-LOCAL-ENVIRONMENT-ARCHITECTURE.md),
and [future implementation plan](400-FUTURE-DEVELOPMENT/TPI-LOCAL-DEVELOPMENT-IMPLEMENTATION-PLAN.md).

The current readiness classification is **ASSESSMENT COMPLETE / LOCAL
ENVIRONMENT NOT OPERATIONALLY VERIFIED**. The next step requires a separate
implementation authorization; OPS-006 itself did not authorize implementation.

## TPI-OPS-007 local development server foundation

OPS-007 implemented the first local-only foundation using the actual Worker
source. `wrangler.local.toml` selects a loopback Worker at `127.0.0.1:8787`,
local D1 `tpi-local-foundation`, local R2 `tpi-local-media`, no cron, no remote
bindings, and `.local-dev/state` persistence. `scripts/local-dev.mjs` is the
guarded startup command. Local browser/server request guards block production,
hosted-development, and unapproved external targets in local mode; scrapers,
link previews, RealtimeKit, and email remain blocked locally. A local indicator
reads `TPI — LOCAL DEVELOPMENT`.

The initial local D1 schema was applied from `migrations/0001_contributor_portal.sql`
without copying accounts or data. The local R2 state directory was initialized
without objects. JavaScript syntax, `git diff --check`, OPS-002 (11/11), and the
new OPS-007 guard regression (8/8) passed.

At the time of OPS-007, the actual Worker could not remain running because
Wrangler/esbuild raised `spawn EBADF` before binding to localhost. OPS-008
repaired that blocker by staging a sanitized asset directory, selecting the
runtime-supported local compatibility date, and preventing automatic loading of
the repository `.dev.vars` file. The OPS-007 record remains historical; current
local runtime status is recorded below.

**Superseding clarification (TPI-LOCALDEV-006C, 2026-11-04):** the `spawn EBADF`
failure attributed to Wrangler/esbuild (and, in other records, to Node, file
descriptors, or the sandbox) was not any of those. Local staging copied nested
`node_modules` trees into `.local-dev/assets`, inflating the served static tree
from the documented hundreds of files to about 11,726. Wrangler's and Workerd's
asset handling failed against that tree and surfaced as `spawn EBADF`. With the
recursive exclusion in place the staged tree is 759 files / 262 MB and the Worker
starts and reloads normally. Earlier records keep their original wording as
historical evidence; this clarification is the current explanation.

## TPI-OPS-008 local runtime startup repair

OPS-008 is **COMPLETE / LOCAL HTTP VERIFIED**. The actual TPI Worker starts via
`node scripts/local-dev.mjs` on `127.0.0.1:8787`, using local D1/R2 simulation
and 532 staged runtime asset files. Homepage HTTP 200, expected TPI content,
the local banner, browser request-guard marker, static asset HTTP 200, local
D1-backed `/api/auth/me`, R2 route behavior, Wrangler request logs, and clean
shutdown all passed. The existing StudioFlow room server on `127.0.0.1:8788`
remained untouched.

The confirmed original failure was Miniflare runtime reconfiguration after
processing the repository root as `assets.directory="."`; the installed local
workerd also rejected compatibility date `2026-07-18`, so the local-only config
uses `2026-07-15`. The launcher now selects a secret-free `scripts/local-dev.env`
instead of auto-loading `.dev.vars`. OPS-002 passed 11/11, OPS-007 passed
10/10, syntax checks and `git diff --check` passed. No deployment, remote D1/R2
change, public Worker traffic, production change, hosted-development change,
or StudioFlow restart occurred. See the [OPS-008 directive](100-DIRECTIVES/TPI-OPS-008-LOCAL-RUNTIME-STARTUP-REPAIR.md),
[diagnostics](200-AUDITS/TPI-OPS-008-WRANGLER-STARTUP-DIAGNOSTICS.md), and
[completion report](300-COMPLETED-WORK/TPI-OPS-008-LOCAL-RUNTIME-REPAIR-RESULT.md).

## TPI-OPS-009 local authentication and synthetic session isolation

OPS-009 is **PARTIALLY COMPLETED / LOCAL AUTH VERIFIED WITH BOUNDARIES**. The
existing authentication implementation remains the source of truth. A
fail-closed HTTP-loopback cookie exception was added for the isolated local
Worker, while hosted cookies remain Secure. A repeatable local-only fixture
process creates fictional admin, contributor, member, and disabled accounts
with generated credentials stored mode `0600` under ignored `.local-dev/`.

The bounded localhost suite passed 27 checks: anonymous state, login,
HttpOnly/SameSite cookie behavior, authenticated `/api/auth/me`, admin
authorization, contributor/member denial, invalid and disabled credentials,
expiration, logout invalidation, local banner, authenticated root redirect to
`/member-home`, and member-home availability. The local D1 foundation tables
were confirmed and OPS-002/OPS-007 regressions passed. No deployment, remote
database/storage change, public Worker request, real account/credential copy,
commit, or push occurred. The minimal local schema does not include later
capability columns used by some admin routes, and no browser visual session was
run; those limits remain documented in the [OPS-009 verification](200-AUDITS/TPI-OPS-009-LOCAL-AUTHENTICATION-VERIFICATION.md)
and [completion result](300-COMPLETED-WORK/TPI-OPS-009-LOCAL-AUTHENTICATION-RESULT.md).

## TPI-DEV-031 interactive visual analytics

DEV-031 extends the existing protected Administration Center with member-growth,
community-engagement, membership-distribution, creator-activity, moderation,
and content-overview charts. The development Worker version is
`893f373b-8fa8-48ed-bd2b-f46e73142f57` from source commit `863387e`.
Analytics queries are read-only and bounded. Website traffic is shown as
unavailable because no reliable first-party visits/page-views source exists in
the current schema; no synthetic traffic is displayed. Membership distribution
is limited to actual creator-partnership membership categories where available,
with an explicit unavailable state when a general plan table is absent.

The DEV-031 focused checks pass 11/11, existing authorization regression passes
57/57, the React build passes, and authenticated development API verification
returns the expected analytics series. Production was not deployed or modified.
Owner authenticated browser inspection of the protected chart view remains an
acceptance item.

## TPI-DEV-032 navigation correction

The Administration Center now follows the existing member-shell navigation
patterns rather than maintaining a separate navigation design. The desktop and
iPad rail is fixed and independently scrollable; the main content scrolls in its
own viewport; active items use page-current semantics; the mobile layout uses a
drawer and bottom navigation; and `Return to Main Site` uses the current host's
`/` route. Existing menu groups and DEV-031 analytics remain present.

The final application source is `51236c3`. Development version
`c181a58d-005d-4c57-b188-24d3467fef78` and production version
`4f679573-fb15-4bf9-9541-2a85e70209a0` use the same built asset hashes. A
packaging-only corrective deployment removed private `lib/` and `functions/`
source files from the asset package; both environments now return 404 for
those paths. No database migrations, imports, or data writes were performed.

## TPI-DEV-027 production-release preparation

Production release preparation is currently `BLOCKED`. Read-only inspection
confirmed production Worker version `7e357215-2579-4c60-b27e-dd572a5656fe`, the
production D1 binding `tpi_contributor_portal`, and production R2 bucket
`tpi-contributor-media`. Production D1 contains many later application tables but
its Wrangler migration ledger records only `0001_contributor_portal.sql` and
`0002_contributor_profiles.sql`; `studio_workspaces` is absent.

The development D1 has the workspace table and five existing workspace rows, but
does not record migration 0051 in its ledger. Because both environments have
schema/history discrepancies, no migration was applied and no production backup
was exported. The release candidate and required approval procedure are recorded
in the TPI-DEV-027 reports. Production remains untouched.

## TPI-DEV-028 focused Administration Center release

TPI-DEV-028 was deployed after explicit owner approval. The
candidate source snapshot is `8dc0d45c8e0ab9dac2b7154f4458503d4a58bc44` on
`codex/tpi-development`; the production Worker version immediately before the
DEV-028 release was `7e357215-2579-4c60-b27e-dd572a5656fe`. Anonymous
read-only checks returned
HTTP 403 for `/admin-center-preview/`, `/admin-panel.html`, and
`/api/admin/overview`, confirming that the existing public boundary remains
protected.

The focused package is limited to the existing Administration Center preview
runtime, its protected admin API compatibility changes, and the already
present authentication/navigation boundary. It excludes StudioFlow, Events,
research, synthetic data, Founding 50 activation, database replacement, and
unapproved migrations. Dashboard, member management, community moderation,
notifications metadata, Education, video metadata/lifecycle, Paranormal Teams,
settings, roles/restrictions, and read-only creator/entitlement views passed
the local focused checks. Creator-application detail/create is deferred because
production does not have the additive `0050_creator_application_details.sql`
columns or the membership `application_id` column. No production write,
No production D1/R2 write, migration, export, data import, Founding 50
activation, or unrelated feature deployment was performed for DEV-028. The
final production Worker version is
`830aa684-d14e-4d39-b103-7fb7538fef84` at the time of the DEV-028 release;
an initial package version
`0f114a72-ccf0-46c7-aae2-ea53b79510de` was immediately corrected after its root
asset manifest exposed existing documentation paths. The final asset manifest
excludes `docs/`, and the checked documentation path now returns `404`.

## TPI-DEV-030 release workflow repair and deployment

The Administration Center source and route boundary has now been unified in
the development branch. `/admin-panel` is the canonical protected route, the
historical `/admin-center-preview/` path serves the same React package for
compatibility, and authenticated `/admin-panel.html` bookmarks redirect to the
canonical route. Desktop and mobile Administration navigation now use
`/admin-panel`. The shared React application hydrates the signed-in member's
saved theme and typography from the existing personalization APIs. The guarded
development staging script records an Administration Center package manifest
with source identity and SHA-256 file hashes. TPI-DEV-030 implementation checks
pass. The owner-approved release was deployed to development as Worker
`85a142a1-026e-4658-b8f1-a7924ba30062` and to production as Worker
`f89c0971-b3e5-40be-9b20-abfa9a132dcd` from final source commit
`ef7182e77d7966dacff49e21701580ba189103ae`. The first production version
`40e6b45d-7f85-40ec-acc3-0cd1edac490c` was immediately corrected after a
non-destructive source-path check found `/lib/auth.js` publicly readable; the
corrected asset manifest excludes `lib/`, and the path now returns 404. The
production package was assembled against the production baseline and uses the
production D1/R2 bindings; no migrations, imports, secret changes, or data
writes were made. Anonymous protection and public smoke routes passed, and the
deployed source and documentation paths are not publicly exposed. Authenticated
owner/admin browser rendering, dashboard data loading, and production
personalization acceptance remain pending because no owner production session
was available.

## TPI-DEV-034 unified ParaNews and ParaTube layout

TPI-DEV-034 unified the canonical `/news` and `/paratube` content hubs with
the existing TPI member shell. The implementation reuses the established
sidebar, independent scrolling, mobile navigation, authentication boundary,
theme variables, typography, and member-home conventions. Existing news/video
APIs, cards, search/category controls, links, scrapers, and the distinct `/`,
`/member-home`, and `/explore` destinations were preserved.

The original implementation source is `50cedea2bd5e9f7e2f0bad1bcbfd9a9761cc5ee0`.
The addendum source is `41de90a98fac0747fe19c376e463c70a578cee36`.
Development deployment `264e5ea5-b165-4b6e-adc0-1bc41f7bebcc` and production
deployment `80cc9aa2-c2a2-4fc8-99c7-989e523e4654` use the addendum source.
Focused source checks passed 16/16; member-home, DEV-032, DEV-033,
DEV-030, workspace-layout, syntax, and diff checks passed; development
runtime verification passed, including authenticated development root routing;
and the anonymous production smoke suite passed 10/10. No D1/R2 writes,
migrations, imports, authentication changes, or
unrelated feature changes were made. Authenticated production browser visual
acceptance remains pending because no production owner session was available.

The root routing correction uses the Worker session boundary to redirect
authenticated `/` requests to `/member-home` while preserving the public home
for signed-out visitors. The early theme bootstrap applies the existing local
theme before first paint, and the member shell now synchronizes with the
include-ready event instead of waiting a fixed 150 ms. The production rollback
target was `a2cbde12-0c39-4eeb-ac75-269e66c6dcea`.

## TPI-DEV-035 public landing and authenticated home routing

TPI-DEV-035 corrected the remaining public/authenticated mismatch. Hosted
/api/auth/me is authoritative, while localStorage identities are accepted only
for local preview origins. This prevents stale preview state from showing a
member greeting when the Worker correctly has no session. Anonymous root
responses are private, no-store, and authenticated root requests continue to
redirect to /member-home.

The public landing page retains the established TPI visual system and content
assets while adding clear entry cards for ParaNews, ParaTube, Our Apps, and
Contact & Links. The existing shared sidebar is populated for guests with
public route destinations and remains unchanged for authenticated members.
Because the deployed Cloudflare asset configuration returned 500 for the
standalone clean URLs /member-sidebar and /footer, the guarded staging
scripts emit .txt aliases containing the exact canonical source markup.

Development deployment 20031a3d-1c35-4621-a1b4-b74842256a95 and production
deployment adc6e8d7-1950-49a7-8127-54f0a2acd634 use source commit d127bd3.
Source checks and public runtime checks passed. The broad authenticated browser
runner was blocked by its own safety gate because it would create six
development session records; authenticated production acceptance remains
pending and is not represented as passed.

## TPI-DEV-036 StudioFlow saved-workspace production schema repair

TPI-DEV-036 repaired the missing production `studio_workspaces` table using the
exact development-verified table definition and its two required indexes. A
complete production D1 export was created and verified outside the repository
before the write. The operation executed only the targeted workspace schema;
the historical production migration backlog and migration ledger were not
run or changed.

Development synthetic workspace QA passed 23/23, including owner isolation,
conflict protection, archive behavior, and recording-sensitive-state exclusion.
Production read-only checks confirmed the new schema, required foreign keys,
constraints, indexes, unchanged existing row counts, and unchanged migration
ledger. Public routes remained reachable, `/studio/` remained protected, and
the unauthenticated workspace API returned 401. No Worker deployment was
needed because production already ran the verified workspace API source.

Authenticated production workspace mutation and browser-level StudioFlow
acceptance remain not tested without an authorized production test identity.

## TPI-OPS-002 development traffic protection

The current-day Cloudflare aggregate measured 116,223 requests for the
development Worker and 9,088 for production. Exact development request paths
remain unverified because the available analytics dimensions did not expose
them and the Worker was rate-limited during safety probing. Development has no
cron trigger and retains `TPI_DISABLE_OUTBOUND="1"`.

TPI-OPS-002 added fail-closed request budgets to remote QA/browser verification
and reduced unnecessary authenticated polling for guests, hidden tabs, and
in-flight duplicate requests. The focused 11-check traffic-protection
regression and source checks pass. Deployment is blocked until Cloudflare
capacity recovers; no live post-change reduction is claimed, and no production,
D1, R2, billing, membership, commit, or push change was made. See
`docs/TPI-DEVELOPMENT/200-AUDITS/TPI-OPS-002-REQUEST-FORENSICS.md` and
`docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-OPS-002-DEVELOPMENT-TRAFFIC-PROTECTION.md`.

## TPI-OPS-003 agent and development traffic investigation

The local process, scheduler, workspace, browser-automation, and source audit
found no currently running old website-copying agent, TPI crawler, remote QA
loop, Wrangler/Vite server, Playwright/Puppeteer process, or TPI LaunchAgent.
The historical Freebuff reconstruction thread was completed and idle with
auto-run disabled, and its documented target was the separate Parapost local
clone rather than a production-to-development TPI synchronizer. No process was
stopped because no runaway TPI process was confirmed.

The source of the prior 116,223 development requests remains unverified: the
available Cloudflare analytics did not provide a current process correlation,
and additional analytics queries were not repeated while rate-limited. OPS-002
protections remain present locally but are not deployed. See
`docs/TPI-DEVELOPMENT/200-AUDITS/TPI-OPS-003-AGENT-TRAFFIC-INVESTIGATION.md`.

## TPI-OPS-010 local Community Feed, Messenger, Notifications, and member data

TPI-OPS-010 extended only the isolated local Wrangler/D1 state with the
authoritative schema required by the existing Community Feed, Messenger,
Notifications, member directory, and personalization routes. A verified
4,708-byte local SQLite backup was created before schema work and restored
successfully into a temporary database. The narrow migration set was applied
without executing the historical migration backlog; only
`0038_member_personalization.sql` was newly applied after the other selected
definitions were confirmed present.

Repeatable fictional fixtures were added for one community category/post/
comment/reaction, two conversations, two messages, two notifications, and one
personalization row. The loopback service suite passed 38/38 checks, including
authentication, anonymous write denial, community ownership, comments,
reactions, Messenger participant isolation, read state, notification
preferences, personalization, and authenticated `/member-home` routing. The
existing OPS-009 authentication regression passed 27/27. The repository QA
runner reported 9 passed, 0 failed, and 3 unrelated optional checks blocked.

The local browser could reach the Worker and was correctly redirected to Member
Login without a browser session. Authenticated browser visual acceptance was
not claimed. Loading the broader member-home asset graph exposed pre-existing
out-of-scope local gaps for `events`, `news_articles`, `videos`, and
`articles.article_type`; no unrelated schemas were applied to mask them. No
deployment, remote D1/R2 change, external request, real-member data copy,
commit, push, or StudioFlow room-server interruption occurred. See
`docs/TPI-DEVELOPMENT/200-AUDITS/TPI-OPS-010-LOCAL-APPLICATION-DATA-AUDIT.md`
and `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-OPS-010-LOCAL-COMMUNITY-RESULT.md`.

## TPI-OPS-011 local website completion

TPI-OPS-011 added only the verified local D1 dependencies required by the
existing member-home implementation: article classification and reactions,
video comments/content/reactions/saves/reports, news articles, video listings,
and events. A fresh 17,275-byte local D1 backup was created and restored before
the additive schema pass. The historical migration backlog was not executed.

The repeatable local fixture set now includes one clearly fictional record for
each dashboard content type: a published classified article, TPI video, news
article, video listing, and event, alongside the stable OPS-010 Community Feed,
Messenger, notification, and personalization fixtures. Reapplication leaves
the stable counts unchanged and removes only known transient community-test
notifications.

The focused member-home suite passed 37/37 with zero remote requests and no
credential output. OPS-009 passed 27/27, OPS-010 passed 41/41, and the
repository QA gate reported 9 passed, 0 failed, and 3 unrelated optional checks
blocked. The authoritative Paranormal Teams CSV remains 4,935 records with
SHA-256 `b802fb97dbfe142e85df8bd55e6f3182e80ec35966b06671598e5bdd1fdd4490`.

The local browser reached the expected Member Login shell from `/member-home`
and showed the local banner and member navigation. Authenticated browser visual
acceptance is explicitly blocked because the secure browser bridge cannot enter
the ignored synthetic password without exposing it. The local Worker was
stopped after verification; StudioFlow's `127.0.0.1:8788` room server remained
untouched. No hosted environment, deployment, import, commit, or push occurred.

## TPI-OPS-012 local StudioFlow and ParaTube integration

TPI-OPS-012 extended the existing local-only schema runner with the
authoritative StudioFlow/ParaTube dependencies required by the current code:
member media library, StudioFlow rooms/invites/relay/workspaces, creator video
channels/social metadata, live-interaction metadata, video formats, and saved/
watch-history tables. A fresh 27,933-byte local D1 backup was verified and
restored before schema changes; rerunning the schema runner reported every
selected definition as already present.

The existing fixture mechanism now references one deterministic 480-byte
fictional SVG thumbnail stored only at `ops012/thumbnail.svg` in local R2.
No recording or video upload was performed. The focused OPS-012 suite passed
26/26 with zero external requests, no RealtimeKit use, no livestream start,
and no recording upload. It verified authenticated StudioFlow workspace
create/read/update/archive, role and owner isolation, room relay guest
metadata, ParaTube listings/details/comments/reactions, local R2 retrieval,
missing-object behavior, and bounded HTTP connectivity to the preserved
`127.0.0.1:8788` room server.

Required regressions also passed: OPS-002 11/11, OPS-007 10/10, OPS-009
27/27, OPS-010 41/41, OPS-011 37/37, DEV-024 offline 17/17, DEV-033 offline
16/16, DEV-037 offline 12/12, DEV-022 offline 15/15, TPI video player 22
assertions, and video navigation/duration regressions. The repository QA gate
reported 9 passed, 0 failed, and 3 unrelated optional checks blocked.

ParaTube rendered in the local browser with the local banner and synthetic
video card. Anonymous StudioFlow correctly showed its protected surface.
Authenticated browser interaction, WebSocket transport, actual media playback,
recording/recovery/autosave, livestream, and RealtimeKit remain unverified by
design. The local Worker was stopped after verification; port 8788 remained
running and untouched. No hosted environment, public traffic, deployment,
import, commit, or push occurred.

## TPI-OPS-013 shared local development environment

TPI-OPS-013 extended the existing local Wrangler launcher with one
authoritative local control surface. `npm run dev:local` starts the loopback
Worker at `http://127.0.0.1:8787/`; `npm run dev:local:status` reports the
Worker, local D1/R2 persistence, preserved `127.0.0.1:8788` StudioFlow room
server, branch, and HEAD; and `npm run dev:local:stop` signals only a verified
launcher-owned Worker. An occupied or ambiguous 8787 fails closed, and no
control path targets 8788.

OPS-013 control checks passed 16/16. The bounded local authenticated browser
harness passed 12/12 using a fresh Playwright context and ignored mode-0600
synthetic credentials. It verified the real login form, Member Home,
Messenger, Notifications, Profile, logout, and session clearing. It blocked
Google Fonts before dispatch and sent no external browser request. Existing
OPS-002/007/009/010/011/012 regressions passed 11/11, 10/10, 27/27, 41/41,
37/37, and 26/26 respectively.

The preferred daily browser origin is `127.0.0.1:8787`; localhost also reached
the same anonymous local Worker, but authenticated cookie sharing is not
assumed. Codex local access is verified. FreeBuff and OpenCode were not
connected to an agent session and remain **NOT VERIFIED** for repository,
Node, browser, localhost, and log reachability. WebSocket, playback,
recording-recovery restart, RealtimeKit, and livestream behavior remain outside
OPS-013. No deployment, remote D1/R2 mutation, public traffic, commit, push, or
StudioFlow room-server interruption occurred. See the
[OPS-013 access audit](200-AUDITS/TPI-OPS-013-AGENT-AND-BROWSER-ACCESS.md) and
[completion record](300-COMPLETED-WORK/TPI-OPS-013-LOCAL-DEVELOPMENT-RESULT.md).

## TPI-OPS-014 automatic local server startup

The existing local Worker now runs through the owner-controlled macOS user
LaunchAgent `com.tpi.local-development` at
`/Users/toddknipple/Library/LaunchAgents/com.tpi.local-development.plist`.
The service reuses `scripts/local-dev.mjs`, binds only to
`http://127.0.0.1:8787/`, uses the existing local-only Wrangler configuration,
and leaves the independent StudioFlow room server at `127.0.0.1:8788` running
and untouched. Owner state changes require `TPI_LOCAL_OWNER_CONTROL=1`; status
is read-only. Logs are bounded and redacted under `.local-dev/logs/`.

The LaunchAgent is installed and loaded with `RunAtLoad`, `KeepAlive`, and a
10-second throttle. Owner stop/start/restart, the repaired loopback readiness
check, intentional-stop suppression, and a bounded exact-wrapper crash-recovery
test passed. The Worker and 8788 room server were both running at final
verification. OPS-014 focused QA passed 20/20; OPS-002/007/009/011/012 and
OPS-013 regressions passed; the local authenticated browser harness passed
12/12 with zero external requests.

Codex local repository/Node/browser/log reachability is verified. FreeBuff and
OpenCode were not connected to an agent session and remain **NOT VERIFIED**.
A full macOS logout/reboot startup test was not performed. No deployment,
remote D1/R2 change, public exposure, commit, push, or StudioFlow interruption
occurred. See the [OPS-014 audit](200-AUDITS/TPI-OPS-014-LAUNCHAGENT-VERIFICATION.md)
and [completion record](300-COMPLETED-WORK/TPI-OPS-014-AUTOMATIC-SERVER-RESULT.md).

## TPI-OPS-015 complete local website access

OPS-015 established the current local page and capability inventory without
rebuilding or redesigning the website. The canonical source tree contains 287
HTML documents; after excluding three shared fragments, 284 page routes were
inventoried against the loopback Worker. The inventory records 109 public, 15
member, 5 contributor, 6 administrator, 141 education/research, 7
StudioFlow/ParaTube, and 1 authentication/access page. There were zero
unexpected 5xx or request failures. Four 404s are explicitly accounted for as
the unserved React source entry and three local Paranormal Teams review
artifacts.

The isolated local D1 was backed up before applying only the authoritative
admin/team dependencies 0025, 0035, 0036, 0039, 0040, 0047, 0048, and 0050.
The backup is `.local-dev/backups/tpi-ops-015-before-admin-schema.sql`,
51,965 bytes, SHA-256
`85848aa6dcbb50faae5d9555c7af9ca4b6aed0e29200d9817ddfdf621ac6a02c`.
The existing `local_admin`, `local_contributor`, and `local_member` roles and
fictional fixtures were preserved.

OPS-015 administrator/API QA passed 62/62. The Codex browser harness passed
51/51: all 26 Administration Center menu items navigated with active
indicators, administrator return controls rendered, contributor authoring
access worked, and member/contributor administrator denial worked. The browser
request guard blocked Google Fonts and Refine telemetry before dispatch.
OPS-002/007/009/010/011/012/013/014 regressions passed 11/11, 10/10, 27/27,
41/41, 37/37, 26/26, 16/16, and 20/20 respectively.

Overall OPS-015 status is **PARTIALLY COMPLETED** because all-page interactive
parity, real media/external integrations, and alternate-agent access remain
unverified or intentionally blocked. Production, public development, remote
D1/R2, 8788, real member data, and deployments remained untouched. See the
[OPS-015 inventory](200-AUDITS/TPI-OPS-015-PAGE-AND-CAPABILITY-INVENTORY.md)
and [completion record](300-COMPLETED-WORK/TPI-OPS-015-LOCAL-WEBSITE-VERIFICATION.md).

## TPI-OPS-016 complete local browser verification

OPS-016 continued from the OPS-015 inventory and preserved all 284 inventoried
routes. The owner-controlled `com.tpi.local-development` LaunchAgent was
confirmed read-only through `launchctl`, with the canonical repository,
loopback-only flags, local Worker, and preserved `127.0.0.1:8788` room server.
OPS-017 then enabled the existing Playwright harness from local npm cache
artifacts and reused installed Google Chrome without a browser download.

The complete matrix is recorded in
[TPI-OPS-016-BROWSER-ACCEPTANCE-MATRIX.md](200-AUDITS/TPI-OPS-016-BROWSER-ACCEPTANCE-MATRIX.md).
All 284 routes are now browser-accounted: 278 PASS, 6 PASS WITH LIMITATIONS,
zero FAIL, and 54/54 focused checks passed. Non-loopback browser requests were
blocked before dispatch.

Targeted local regressions passed: OPS-002 11/11, OPS-007 10/10, OPS-009
27/27, OPS-011 37/37, OPS-012 26/26, OPS-014 20/20, and OPS-015 admin/API
QA 62/62. OPS-015's authenticated role-browser result of 51/51 remains
preserved. Overall OPS-016/017 is **COMPLETED WITH LIMITATIONS**; OPS-018
repaired the published-article fragment paths. No production/public-development
request, deployment, remote D1/R2 change, import, commit, push, or 8788
interruption occurred. See
the [OPS-016 completion record](300-COMPLETED-WORK/TPI-OPS-016-LOCAL-BROWSER-RESULT.md)
and [OPS-017 result](300-COMPLETED-WORK/TPI-OPS-017-BROWSER-TESTING-RESULT.md).

## TPI-OPS-018 published article route repair

OPS-018 repaired the single browser-route failure found by OPS-017. The shared
`includes.js` fragment URLs are now root-relative, so the clean nested route
`/published-article/` loads `/header.html` and `/footer.txt` instead of looking
under `/published-article/`. The local asset staging script was run manually;
the owner-controlled Worker was not restarted.

The focused article check passed with HTTP 200, header and footer present, zero
console errors, zero failed local requests, and zero external requests. The
existing 284-route browser matrix then passed 278 routes, classified six as
expected limitations, and recorded zero failures, blocked routes, or
unverified routes. Focused browser checks passed 54/54.

The six limitations are four preserved source/research artifacts that are not
Worker application routes and two expected anonymous ITC Visual Studio access
gates. OPS-002/007/009/011/012/014 and OPS-015 administrator/API regressions
passed. Production, public development, remote D1/R2, StudioFlow 8788,
external services, commits, and pushes remained untouched. See the
[OPS-018 result](300-COMPLETED-WORK/TPI-OPS-018-ARTICLE-REPAIR-RESULT.md) and
[updated browser matrix](200-AUDITS/TPI-OPS-016-BROWSER-ACCEPTANCE-MATRIX.md).

## TPI-STUDIOFLOW-013 local production-lock validation

TPI-STUDIOFLOW-013 applied the additive StudioFlow production-lock migration
only to the isolated local D1 after a verified private backup. The authorized
single Worker restart restored the LaunchAgent-owned Worker on 8787 while the
independent room server on 8788 remained running. Two temporary Studios proved
independent schedule persistence, creator-scoped production locking, matching
heartbeat/stop behavior, and concurrent-start serialization in 15/15 local
API checks. Synthetic rows were removed after validation; existing Studio
fixtures remained available and the local D1 integrity and foreign-key checks
passed.

The restarted StudioFlow browser surface retained the saved Studio selector,
scene/media controls, connected room bridge, and `/member-home` return target;
the local-development banner remained absent and browser error logs were empty.
The floating Messenger surface was visible on authenticated ParaTube, but a
direct `/messenger` browser navigation was blocked before inspection and is
therefore not claimed as verified. TPI-STUDIOFLOW-013 is **PARTIALLY COMPLETE /
CONDITIONALLY READY** for a future separately authorized local or development
validation batch. No production, hosted development, external provider,
deployment, commit, push, recording, livestream, or database import occurred.
See the [TPI-STUDIOFLOW-013 validation result](300-COMPLETED-WORK/TPI-STUDIOFLOW-013-VALIDATION-RESULT.md).

## TPI-STUDIOFLOW-014 podcast production readiness

TPI-STUDIOFLOW-014 inspected the existing StudioFlow readiness boundary for
future owner podcast productions without creating real Studios or assets. The
workspace model correctly separates owner-scoped Studio configuration and
asset references from browser-local recording bytes, recording chunks,
recovery state, and optional File System Access folder handles. Existing
synthetic Studios retain distinct scenes and backgrounds; local schedules and
the creator production lock remain compatible.

A repeatable SPA transition defect was found and corrected in
`studio/workspace-bridge.js`: a detached asset-panel reference prevented the
bridge from reattaching `My Studios` after opening an existing Studio from the
StudioFlow home screen. The correction is staged locally and passes focused
offline checks 10/10, but live verification is blocked because this directive
prohibits a Worker restart. Real camera/microphone recording, interruption
recovery, external-drive writes, provider livestreaming, and external
destinations remain owner/provider testing requirements. TPI-STUDIOFLOW-014 is
**PARTIALLY COMPLETE / CONDITIONALLY READY**. See the
[TPI-STUDIOFLOW-014 readiness result](300-COMPLETED-WORK/TPI-STUDIOFLOW-014-READINESS-RESULT.md).

## TPI-STUDIOFLOW-017 seamless Studio switching

TPI-STUDIOFLOW-017 corrected the existing My Studios bridge so an owned saved
Studio is persisted and restored through StudioFlow's existing internal
`studio` route without falling back to Home. In-flight saves are awaited,
failed saves keep the current Studio active, the remembered Studio is restored
only after the authenticated workspace API confirms it is still available, and
the creator production lock continues to block unsafe switching.

Focused offline checks passed 14/14, the TPI-STUDIOFLOW-014 regression passed
10/10, the TPI-STUDIOFLOW-012 regression passed 14/14, bridge syntax checks
passed, and `git diff --check` passed. The owner-authorized live browser
verification then passed direct Studio opening, save-before-switch,
studio-specific persistence, scene restoration, and last-active-Studio
restoration. Live recording/livestream and injected save-failure tests were
not performed by design. No deployment or production database change
occurred; local synthetic workspace autosaves were exercised as required by
the test. No commit or push occurred. See the
[TPI-STUDIOFLOW-017 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-017-RESULT.md).

## TPI-STUDIOFLOW-017 SMART Pads addendum

The existing Sound Effects and Background Music libraries now have reusable
colored SMART Pads. Sound-effect clicks dispatch through the maintained React
program audio bus so they can be heard in the live stage/program path; music
uses the existing background-music path and loop setting. Pad names and colors
persist with each studio, MP3 title metadata is used when available, and scene
cards can assign music with an optional Start after Intro handoff. Focused
build, isolated E2E, bridge, media, release-safety, production smoke, guarded
deployment, and Firefox live scene-control checks passed. Worker
`115a9bd2-e462-407f-8ca7-47736ef07fe4` is active. Disposable authenticated audio
playback was not exercised against protected Crossroads media.
See the [SMART Pads implementation record](300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-SMART-PADS-RESULT.md).

## TPI-STUDIOFLOW-019 intro/outro full-stage video rendering

TPI-STUDIOFLOW-019 added an explicit full-frame rule for the shared
prerecorded intro/outro video path. The production stage remains a 16:9 box;
direct stage videos now have explicit zero insets, dimensions, margins,
padding, borders, and `object-fit: contain`. This lets 1920 × 1080 clips fill
the stage while preserving 4:3 and 9:16 media without distortion or cropping.

The live local browser measured the stage at 855 × 480.9375 pixels (16:9),
loaded the patched stylesheet, and reported no console errors. Focused checks
passed 7/7; TPI-STUDIOFLOW-012, -014, -017, and TPI-DEV-033 regressions also
passed. No media bytes, studio records, databases, deployments, commits, or
pushes were changed. The owner’s `/Users/toddknipple/Desktop/COTU INTRO.mp4`
was inspected without alteration and matches H.264 1920 × 1080, 30 fps,
BT.709. A temporary browser-local copy was loaded into synthetic Studio 10
for direct runtime measurement, rendered at the exact 16:9 stage dimensions
with no generated side borders, and was then removed. No separate Outro
fixture was available, so actual outro playback, audio synchronization,
recording, and livestream acceptance remain pending. See the
[TPI-STUDIOFLOW-019 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-019-RESULT.md).

## TPI-STUDIOFLOW-020 playback toggles and Opera compatibility

TPI-STUDIOFLOW-020 added a local reset bridge around the existing Intro and
Outro scene controls. Selected clips now toggle between Play and Stop, each
activation resets playback to `00:00`, scene changes stop the prior clip, and
recording/Go Live controls clear preview state without starting a clip. The
compiled production compositor no longer loops prerecorded clips, and natural
Outro completion no longer stops recording or livestream state.

Codex live toggle checks passed for Intro, Outro, cross-playback, scene
restoration, and fresh-start behavior. Opera Air was directly inspected: its
pre-patch stage was stretched to approximately 1086 × 578 pixels (about
1.88:1), while the local correction restored an approximately 1029 × 578
pixel 16:9 stage and removed the visible side-area defect. Focused playback
checks passed 11/11, with the TPI-STUDIOFLOW-012, -014, -017, -019, and
DEV-033 regressions still passing. Full natural completion and recording or
livestream startup were not activated and remain owner-controlled acceptance
items. No deployment, database mutation, service restart, commit, or push
occurred. See the [TPI-STUDIOFLOW-020 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-020-RESULT.md).

## TPI-OPS-019 multi-browser development workflow

The active local agent browser is Codex In-App Browser. Codex opened the
canonical loopback homepage, verified the local-development banner and
navigation, and captured a screenshot. Retained Playwright evidence covers
synthetic admin, member, and contributor sessions, role boundaries,
console/request inspection, and local-only request guarding: 278 PASS, 6
expected limitations, 0 FAIL across 284 routes, with 54/54 focused checks.

FreeBuff remains standby and **NOT VERIFIED** for agent QA. Opera is available
for the owner to review the same `http://127.0.0.1:8787/` origin, but no Opera
agent acceptance is claimed. The launchd-owned Worker on 8787 and independent
StudioFlow room server on 8788 were read-only verified running. No service
restart, deployment, external request, database/R2 mutation, import, commit, or
push occurred. See the [OPS-019 directive](100-DIRECTIVES/TPI-OPS-019-MULTI-BROWSER-WORKFLOW.md),
[result](300-COMPLETED-WORK/TPI-OPS-019-BROWSER-WORKFLOW-RESULT.md), and
[agent handoff](TPI-DEVELOPMENT-AGENT-HANDOFF.md).

### OPS-019 Addendum A — local administrator fixture

The existing OPS-009 `local_admin` fixture is active in isolated local D1 with
the legitimate `admin` role. OPS-009 authentication passed 27/27 and OPS-015
administrator/role-boundary QA passed 62/62 with zero external requests and no
credentials printed. The owner-only terminal viewer is
`scripts/show-local-admin-credentials.sh`; it requires an interactive terminal,
checks the Git-ignored credential file remains mode 0600, and does not reset,
log, HTTP-serve, or clipboard-copy the password. Production and hosted
development remain untouched.

## TPI-OPS-021 local development banner removal

The visible local banner was centrally injected by `worker.js` after local HTML
asset responses and was removed without changing the local request guard,
authentication, D1/R2 isolation, or production/public-development safeguards.
The single owner-authorized Worker restart loaded the fix. Codex verified `/`,
`/admin-panel`, `/member-home`, Messenger, `/paratube`, and `/studio/` with no
banner or layout obstruction. StudioFlow Home, Library, Destinations, and
Teleprompter controls were interactively reached; no broadcast, recording, or
configuration action was invoked. Focused browser and local regressions passed
with zero external requests. See the
[OPS-021 result](300-COMPLETED-WORK/TPI-OPS-021-BANNER-REMOVAL-RESULT.md).

## TPI-STUDIOFLOW-021 unified Opera development browser workflow

Opera Air is now the authoritative browser for live local StudioFlow
verification at `http://127.0.0.1:8787/studio/`. Source inspection confirms
that workspace names, scenes, configuration snapshots, guest settings, and
asset metadata are shared through the authenticated local workspace API and
local development D1, while localStorage, browser IndexedDB media/recording
data, avatar data, session cookies, and ephemeral BroadcastChannel state are
browser-specific. Opera's existing workspace was directly inspected without
clearing or changing storage. The Codex browser remains an isolated synthetic
test surface and its Studios must not be treated as the owner's workspace.

The local Worker and room server were verified running on ports 8787 and 8788.
No Studio, scene, media asset, guest setting, preference, database, production
resource, deployment, commit, push, or tunnel service was modified. Direct
Opera storage-inspector enumeration remains not tested because the available
automation surface exposes the page and screenshot but not browser-private
storage tools. The canonical shell asset references are known, but Opera's
network inspector was not exposed by the available automation surface. See the
[TPI-STUDIOFLOW-021 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-021-RESULT.md).

## TPI-STUDIOFLOW-022 development Studio backup and recovery investigation

TPI-STUDIOFLOW-022 is **INVESTIGATION COMPLETE / BACKUP IMPLEMENTATION
DEFERRED**. Read-only source inspection confirms that authenticated Studio
identity, normalized workspace configuration, scenes, guest settings, ownership,
versions, and asset metadata are shared through the local Worker and development
D1. Opera-specific localStorage mirrors active context and preferences, while
the browser-local IndexedDB database `studioflow-recordings` stores uploaded
media blobs, recordings, chunks, recovery checkpoints, and storage handles.
The separate `studioflow-avatars` database stores avatar bytes. Existing JSON
configuration backup is not a complete media backup because it preserves
`blobKey` references without the referenced browser-local bytes.

The investigation recommends a future versioned application-level package that
combines validated Studio configuration, a checksum-backed media manifest/media
pack, and a separately authorized development D1 export. Restore should be
previewed, version-aware, non-destructive, and new-copy by default. Browser
profile copying is not recommended because it can expose credentials and private
session state. Exact Wrangler/local-D1 export syntax, blob-to-Studio ownership
mapping, browser quota limits, and file-system-handle recovery remain future
implementation questions.

No Opera storage, D1 record, media byte, migration, R2 object, production
resource, or service was modified. No backup, export, restore, or destructive
test was performed. See the [TPI-STUDIOFLOW-022 investigation](100-DIRECTIVES/TPI-STUDIOFLOW-022-BACKUP-RECOVERY-INVESTIGATION.md)
and [completion report](300-COMPLETED-WORK/TPI-STUDIOFLOW-022-RESULT.md).

## TPI-STUDIOFLOW-023 active Studio name in navigation

TPI-STUDIOFLOW-023 is **COMPLETE / OPERA VERIFIED / LOCAL DEVELOPMENT ONLY**.
The selector derives its label from the active Studio title and retains the
`My Studios` fallback. The development shell references a versioned bridge URL
so Opera can revalidate the bridge without clearing browser state. The bridge
now parses the app's JSON active-broadcast ID, reconciles after host hydration,
and avoids autosaving a local-only Crossroads broadcast into an unrelated
synthetic server workspace. Existing switching, production lock, scene, media,
and restoration logic remains intact.

The existing Opera StudioFlow tab was refreshed only; the exact visible label
was `Crossroads of the Unknown ▾` and the accessibility label was
`Select Studio: Crossroads of the Unknown`. Focused TPI-023 checks passed
14/14 and TPI-STUDIOFLOW-017 passed 14/14. No browser storage, cookies, cache,
deployment, migration, commit, or push occurred. Earlier authorized refreshes
did issue existing autosave PATCH requests, which are documented rather than
reported as zero database activity. Crossroads remains local-only until a
separate approved server-workspace mapping is made. See the [TPI-STUDIOFLOW-023
result](300-COMPLETED-WORK/TPI-STUDIOFLOW-023-RESULT.md).

## TPI-STUDIOFLOW-024 automatic local backup system — Phase 2

TPI-STUDIOFLOW-024 Phase 2 is **CONDITIONALLY COMPLETE / SYNTHETIC VALIDATION
PASSED / OWNER ACTIVATION DEFERRED**. Phase 1 mapped the split StudioFlow model:
authenticated server-backed workspaces and normalized state are stored through
the local Worker and D1, while browser-local localStorage and IndexedDB hold
active context, media bytes, recordings, recovery chunks, and filesystem
handles. Phase 2 adds a source-kind-aware backup core, strict manifest
validation, actual-byte media collection through an injected resolver, staged
verified publication, preserved history, change detection, destination-error
handling, and a guarded desktop folder adapter.

The TPI-023 historical record described Crossroads as local-only. A current
read-only D1 snapshot now contains a matching active Crossroads workspace, so
the future backup format must support both local-broadcast and
server-workspace source kinds without rewriting the historical report. A
versioned manifest package with verified media bytes, staged writes, retained
history, destination-loss handling, and restore-as-new is recommended. Desktop
automatic folder backup is a future Opera/Chromium target; iPhone, iPad, and
Android require a clearly labeled manual package/share fallback until their
runtime capabilities are separately tested.

The Phase 2 suite passed 23/23 synthetic checks with zero external requests and
no owner-data access. TPI-017 passed 14/14, TPI-023 passed 14/14, TPI-DEV-022
passed 15/15, TPI-012 passed 14/14, syntax checks passed 3/3, and
`git diff --check` passed. Automatic backup remains off, the Backup Now/history/
restore controls remain unavailable, and no folder permission was requested.
The local Worker was not restarted, so Opera runtime verification of the new
card is pending. No owner Studio, scene, media byte, browser-storage item, D1
record, R2 object, service, production resource, or public environment was
modified. No backup, export, restore, permission request, migration,
deployment, commit, or push was performed. See the [TPI-STUDIOFLOW-024
architecture](100-DIRECTIVES/TPI-STUDIOFLOW-024-LOCAL-BACKUP-ARCHITECTURE.md)
and [Phase 2 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-024-PHASE-2-RESULT.md).

## TPI-STUDIOFLOW-025 active workspace reconciliation and safe test-Studio cleanup

TPI-STUDIOFLOW-025 is **COMPLETE / LOCAL OPERA VERIFIED / PRODUCTION NOT
TOUCHED**. The bridge now reconciles the active Opera broadcast with a unique
server workspace using verified identity and title matching, preserves the
selected workspace identity during saves, and avoids duplicate workspace
creation. The owner-authorized Studio 8 and Studio 9 records were archived
through StudioFlow's supported deletion action; Crossroads of the Unknown
workspace `43b20614-69da-4d82-af9d-063cace4b6cc` remains active and intact.

Opera was refreshed only on the StudioFlow tab. The final selector showed
`Crossroads of the Unknown ▾`, and the list contained only `Studio 10:
Crossroads of the Unknown`, `Create New Studio`, and the expected Recently
Deleted control. TPI-025 passed 11/11, TPI-017 passed 14/14, TPI-023 passed
14/14, TPI-024 Phase 2 passed 23/23, syntax checks passed, and `git diff
--check` passed. No Worker or room-server restart, production access,
deployment, migration, commit, or push occurred. See the [TPI-STUDIOFLOW-025
result](300-COMPLETED-WORK/TPI-STUDIOFLOW-025-RESULT.md).

## TPI-STUDIOFLOW-025 Opera persistence diagnostic

The read-only Opera diagnostic is **CONDITIONALLY COMPLETE / IMPLEMENTATION
DEFERRED**. Opera's current settings show JavaScript enabled, third-party
cookies allowed, ad/tracker blocking disabled, and localhost camera/microphone
permission allowed. The existing StudioFlow tab remains on
`http://127.0.0.1:8787/studio/`; no refresh or storage operation was performed.

Read-only D1 evidence confirms Crossroads workspace
`43b20614-69da-4d82-af9d-063cace4b6cc` is active at version 152 with correct
workspace metadata, but its saved `state_json.broadcast.title` is empty. The
visible Crossroads label therefore does not prove that the saved broadcast
state is complete. The primary classification is a StudioFlow reconciliation
defect, with browser-local active-broadcast state a contributing risk. No
Opera setting, origin mismatch, IndexedDB identity mismatch, service worker,
or stale-cache cause was confirmed. TPI-017 14/14, TPI-023 14/14, TPI-024
Phase 2 23/23, and `git diff --check` passed. No application code or owner data
was modified. See the [diagnostic result](300-COMPLETED-WORK/TPI-STUDIOFLOW-025-DIAGNOSTIC-RESULT.md).

## TPI-STUDIOFLOW-026 Crossroads configuration integrity

The read-only integrity review is **CONDITIONALLY COMPLETE / CORRECTION
DEFERRED**. Crossroads workspace `43b20614-69da-4d82-af9d-063cace4b6cc` remains
active at version 152, with matching `local_broadcast_id` and saved broadcast
ID. Its top-level workspace title is `Crossroads of the Unknown`, but the
nested `state_json.broadcast.title` remains empty. Source inspection confirms
that the current save shape preserves the saved broadcast ID without
backfilling that empty nested title from workspace metadata. This is a
confirmed persistence-integrity defect/risk; it does not establish that scenes
or media were lost.

Four scenes and the current intro, outro, and background references remain
present in the valid D1 snapshot. Logo, overlay, and audio fields are absent or
empty in that snapshot and were not classified as corruption because browser
local media state was not enumerated. Synthetic integrity checks passed 10/10;
TPI-017 passed 14/14, TPI-023 14/14, TPI-024 Phase 2 23/23, TPI-025 11/11,
syntax checks passed, and `git diff --check` passed. No Opera refresh, storage
change, D1 write, owner save, media export, service restart, deployment,
migration, commit, or push occurred. See the [TPI-STUDIOFLOW-026 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-026-RESULT.md).

## TPI-STUDIOFLOW-027 Studio title persistence correction

The targeted application correction is **CONDITIONALLY COMPLETE / OWNER REPAIR
DEFERRED**. `studio/workspace-bridge.js` now validates the selected workspace
and broadcast identities, fills only empty nested broadcast titles from
verified workspace metadata, rejects conflicting titles before PATCH, and keeps
explicit Studio renames synchronized in both title fields. Workspace version
guards, switching, restoration, save-in-flight handling, and production locks
remain intact.

Synthetic integrity coverage passed 21/21. TPI-017 passed 14/14, TPI-023
14/14, TPI-024 Phase 2 23/23, TPI-025 11/11, syntax checks passed, and
`git diff --check` passed. Read-only D1 verification confirms Crossroads is
still active at version 152 with the same identity and the pre-existing empty
nested title; no owner repair was executed. Opera was not refreshed. No owner
data, browser storage, D1 records, media, services, production resources,
deployment, migration, commit, or push was touched. See the
[TPI-STUDIOFLOW-027 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-027-RESULT.md).

## TPI-STUDIOFLOW-028 / 029 Crossroads workspace repair

TPI-STUDIOFLOW-028 is **CONDITIONALLY COMPLETE** under TPI-STUDIOFLOW-029.
The local Worker was staged and restarted once through the owned LaunchAgent;
the corrected bridge was served, and Opera’s authorized StudioFlow refresh
completed the supported restore/autosave path. Crossroads now reports version
154 with matching workspace and nested broadcast titles. Its IDs, scenes,
media references, guest settings, and other configuration remain intact;
Studios 8 and 9 remain archived.

A verified post-repair configuration snapshot exists outside Git. Because the
authorized refresh triggered the save immediately, a pre-write snapshot was
not materialized before the application write; this is the remaining
limitation. No production resource, deployment, migration, commit, or push was
used. See the [TPI-STUDIOFLOW-029 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-029-RESULT.md).

## TPI-STUDIOFLOW-030 automatic backup integration

TPI-STUDIOFLOW-030 is **CONDITIONALLY COMPLETE**. The local backup core now
preserves complete supported configuration, includes broadcast identity,
collects actual supported media bytes from the existing recording Blob store,
and verifies written manifests, configuration, media hashes, and completion
markers by reading the destination back. The browser bridge supports explicit
folder selection, guarded manual backup, destination reconnection, status and
history, and debounced automatic scheduling after a confirmed workspace save.

Synthetic real-filesystem verification passed 13/13, and the prior Phase 2
suite passed 23/23. Opera remains the authoritative browser, but no owner
folder permission was requested and Crossroads automatic backups remain OFF.
Full restore, mobile/tablet automatic folder writes, retention cleanup, and
owner activation remain deferred. No owner data or media was modified or
exported; production was not accessed; no deployment, commit, or push occurred.
See the [TPI-STUDIOFLOW-030 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-030-RESULT.md).

## TPI-STUDIOFLOW-031 video overlay cleanup

The source correction is **CONDITIONALLY COMPLETE / OPERA VERIFICATION
BLOCKED**. The production preview stage uses bare HTML video elements and does
not render the reported pop-out/skip controls as StudioFlow buttons. Opera's
browser-level Video Popout/Video Skip overlay is avoided for the production
background and direct Intro/Outro stage clips with a stage-only canvas mirror;
the underlying video elements remain mounted for audio, looping, playback
events, and compositor compatibility. Native PiP/remote-playback hints remain
in place, and the bridge URL is cache-busted for the local Worker. The focused
overlay checks pass 12/12 and the combined TPI-017/019/020/023/025/027/030/031
regression checks pass 103/103, with syntax and `git diff --check` passing. The
remaining evidence is a fresh Opera check after the authorized local Worker
refresh across three loops, scene switching, Intro, Outro, and return to the
normal scene. The
existing Opera tab remains in a loading state with the pre-change render, and
the direct cache-busted bridge request returns the site access gate rather than
the bridge, so those live checks are not credited. No recording or livestream
was started, and Crossroads was not modified. See the
[TPI-STUDIOFLOW-031 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-031-RESULT.md).

## TPI-STUDIOFLOW-032 Backup & Recovery completion

TPI-STUDIOFLOW-032 is **CONDITIONALLY COMPLETE**. The local backup system now
supports verified, staged media-inclusive packages and restore-as-new with new
workspace/broadcast identities, media Blob-key remapping, required-media
validation, corruption rejection, duplicate-click protection, and cleanup on
failed workspace creation. Backup settings are scoped by Studio, automatic
backups remain off by default, and selected custom backgrounds are treated as
required media when active. The focused TPI-032 restore suite passed 11/11;
the combined TPI-017/023/024/025/027/030/031/032 set passed 119/119, with
syntax and `git diff --check` passing.

Opera remains the authoritative local browser at
`http://127.0.0.1:8787/studio/`; Crossroads is active and visually intact. No
owner folder was selected, no filesystem permission was requested, no owner
backup or restore was run, and automatic backups remain OFF. Real Opera folder
permission, cross-device recovery, mobile fallback, recording-byte backup,
retention cleanup, and rich inline backup history remain follow-up work. See
the [TPI-STUDIOFLOW-032 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-032-RESULT.md).

## TPI-STUDIOFLOW-033 real Opera backup and restore verification

TPI-STUDIOFLOW-033 is **CONDITIONALLY COMPLETE / REAL SYNTHETIC OPERA
WORKFLOW VERIFIED**. Opera selected and granted edit permission for a dedicated
synthetic folder, wrote a verified six-media package, read the files and
SHA-256 hashes back from disk, completed a debounced automatic backup, and
restored the package as a new synthetic workspace with new workspace and
broadcast identities. The backup bridge mutation-loop defect and restore media
accumulator defect found during live verification were corrected. Focused and
prior regression suites pass 129/129 across TPI-017, 023, 024 Phase 2, 025,
027, 030, 031, 032, and 033; syntax checks and `git diff --check` pass.

The test used an isolated Opera fixture and did not access Crossroads, owner
browser storage, owner media, or shared D1 for writes. Crossroads automatic
backups remain OFF and no permanent owner destination is configured. Full
disaster recovery into an empty D1, physical cross-device recovery, mobile
unattended folder writes, and recording-byte backup remain unverified or
deferred. See the [TPI-STUDIOFLOW-033 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-033-RESULT.md).

## TPI-STUDIOFLOW-034 automatic server startup and local runtime reliability

TPI-STUDIOFLOW-034 is **CONDITIONALLY COMPLETE / STARTUP AND RECOVERY
VERIFIED**. The existing `com.tpi.local-development` LaunchAgent remains the
startup architecture. Its generated plist now uses stable `/opt/homebrew/bin/node`
instead of a versioned Cellar path, installation waits for launchd unload
completion, and the Worker launcher exits when 8787 readiness is lost so
LaunchAgent `KeepAlive` can recover the service. A controlled 8787-only Worker
termination recovered automatically; the focused startup suite passed 10/10.

Host-level requests reached the Worker. Anonymous `/studio/` requests returned
the intentional local Creator Studio 403 access boundary, so no authentication
or production protection was weakened. Opera's current tab still showed a
browser error document after refresh, preventing authenticated owner UI
acceptance. Ports 8788 and 8789 were not restarted or modified and were not
listening during this check. The combined StudioFlow regression set remains
129/129, with syntax and `git diff --check` passing. See the
[TPI-STUDIOFLOW-034 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-034-RESULT.md).

## TPI-STUDIOFLOW-037 Safari white-screen repair

TPI-STUDIOFLOW-037 is **COMPLETE / LOCAL DEVELOPMENT**. Safari's white screen was
caused by the local Worker returning empty 404 documents for clean page URLs even
though the corresponding `.html` assets existed. `worker.js` now performs a narrow
clean-URL fallback while preserving the existing Creator Studio authentication gate.
Safari directly rendered the clean homepage, Member Home, and `/studio/` routes.
The focused route checks passed 7/7; no browser storage, D1 data, owner media, or
credentials were changed. See the [TPI-STUDIOFLOW-037 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-037-RESULT.md).

## TPI-STUDIOFLOW-047 development recovery and release readiness

TPI-STUDIOFLOW-047 is **PARTIAL / LOCAL INTEGRATION COMPLETE / PRODUCTION NOT
READY**. After the owner cleared Opera data, read-only local inspection confirmed
Crossroads remains active at version 228 with its expected workspace and broadcast
identities. The current D1 workspace has no persisted scene entries or owner
media bytes, so browser-local media recovery remains unverified and no old backup
was restored. The existing asset watcher and deterministic staging pipeline were
rebuilt and verified; the visible Room Bridge status card was removed from the
backstage row while diagnostics remain in People; guest waiting-room regressions
remain green. Production requires separate authenticated HTTPS/WebRTC, room,
storage, and owner-acceptance testing. See the [TPI-STUDIOFLOW-047 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-047-RESULT.md).

## TPI-STUDIOFLOW-048 persistent project saving, backups, and recovery

TPI-STUDIOFLOW-048 is **CONDITIONALLY COMPLETE / LOCAL IMPLEMENTATION AND SYNTHETIC
VERIFICATION**. Existing D1-backed My Studios workspaces remain the authoritative
project store. The project menu now exposes Save Project, project metadata
configuration export/import, and server-backed recovery snapshots stored in the
existing R2 binding. Autosave remains debounced and version checked; recovery
restoration always creates a new Studio. The focused suite passes 20/20, syntax
checks and `git diff --check` pass, Crossroads was not modified, and no owner
backup was activated. Authenticated browser snapshot round-trip remains a
follow-up acceptance item. See the [TPI-STUDIOFLOW-048 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-048-RESULT.md).

## TPI-STUDIOFLOW-049 portable project backups and save status

TPI-STUDIOFLOW-049 is **CONDITIONALLY COMPLETE / LOCAL IMPLEMENTATION AND
SYNTHETIC VERIFICATION**. My Studios now distinguishes server-confirmed
`UNSAVED CHANGES`, `SAVING...`, `PROJECT SAVED`, and `SAVE FAILED` states from
portable-backup state. Configuration export reports `BACKUP PREPARED — CONFIRM
FILE SAVED` until the user confirms a browser download; complete project backup
uses the existing verified media-inclusive folder writer and tracks
`BACKUP CURRENT`, `BACKUP OUTDATED`, and `BACKUP FAILED` by workspace version.
R2 recovery snapshots remain a separate server-backed recovery layer. The
focused suite and syntax checks pass locally; authenticated browser/download
acceptance remains follow-up work. See the
[TPI-STUDIOFLOW-049 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-049-RESULT.md).

## TPI-STUDIOFLOW-050 Studio interface flicker / reload-loop repair

TPI-STUDIOFLOW-050 is **PARTIAL / SOURCE REPAIR COMPLETE / AUTHENTICATED
BROWSER VERIFICATION PENDING**. The confirmed cause was three document reload
paths in the generated workspace reconciliation bridge. Workspace selection and
route reconciliation now apply state in place without navigation; save gating,
version checks, production lock, asset staging, and guest-audio paths remain
intact. Focused stability checks pass 10/10 and the broader StudioFlow set
passes 170/170. The visible Opera page remained stable during the available
observation, but the authenticated owner Studio view was not available for the
required continuous runtime check. See the
[TPI-STUDIOFLOW-050 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-050-RESULT.md).

## TPI-STUDIOFLOW-051 production migration

TPI-STUDIOFLOW-051 is **BLOCKED / NO DEPLOYMENT**. The authoritative
StudioFlow source build passes, and the local StudioFlow regression suites are
green, but the canonical `StudioFlow/web/dist` output differs from the
repository `studio/` integration output. The worktree also contains
uncommitted application changes, which the guarded production deploy correctly
rejects. Read-only Cloudflare D1 verification failed with OAuth error `10000`,
so production D1/R2 bindings, authenticated acceptance, HTTPS/WebRTC signaling,
and rollback readiness remain unverified. No production resource was modified.
See the [TPI-STUDIOFLOW-051 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-051-RESULT.md).

## TPI-STUDIOFLOW-052 fresh-browser session and Home page flickering

TPI-STUDIOFLOW-052 is **BLOCKED / DATA-INTEGRITY INCIDENT REQUIRES OWNER
REVIEW**. The original authenticated trace reproduced a full-document reload
loop caused by a stale staged `workspace-bridge.js`; a second fresh-session
defect caused repeated autosave attempts because server workspace state was not
hydrated before fingerprinting. Staging, watcher coverage, and initialization
hydration were repaired. A mutation-blocked isolated browser run passed the
fresh unauthenticated gate, authenticated render/refresh, and the full
120-second stability window. The initial unguarded diagnostic unexpectedly
autosaved the protected Crossroads workspace; read-only inspection found its
expected identities but reported zero persisted scenes at version 240. No
rollback or backup restore was performed. TPI-STUDIOFLOW-051 remains blocked.
See the [TPI-STUDIOFLOW-052 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-052-RESULT.md).

## TPI-STUDIOFLOW-053 Crossroads data integrity and release recovery

TPI-STUDIOFLOW-053 is **COMPLETE / READ-ONLY / RECOVERY NOT PERFORMED**. The
investigation recorded the protected Crossroads workspace at version 240 with
the expected workspace and broadcast identities and zero persisted scenes. No
workspace save, restore, backup import, browser-storage change, D1 mutation, or
R2 mutation was performed. The owner subsequently decided to rebuild Crossroads,
so the investigation preserves the evidence without initiating recovery. See
the [TPI-STUDIOFLOW-053 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-053-RESULT.md).

## TPI-STUDIOFLOW-054 production release preparation and live migration

TPI-STUDIOFLOW-054 is **BLOCKED / NOT DEPLOYED**. Production resources remain
unchanged. Release gates still require an approved source/build checkpoint,
production schema review, authenticated acceptance, server-side media
persistence verification, HTTPS/WebRTC guest signaling, and a reviewed rollback
plan. The Crossroads rebuild decision does not authorize overwriting existing
records or bypassing these release gates. See the
[TPI-STUDIOFLOW-054 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-054-RESULT.md).

## TPI-STUDIOFLOW-055 source and website integration reconciliation

TPI-STUDIOFLOW-055 is **PARTIAL / LOCAL RECONCILIATION VERIFIED / RELEASE
CHECKPOINT PENDING**. The authoritative StudioFlow source at
`/Users/toddknipple/Documents/StudioFlow/web` builds twice with equivalent
artifacts. The integrated website candidate references the current generated
JavaScript and CSS, preserves the TPI bridge layer, and contains no obsolete
bundle references. The source worktree remains uncommitted, and mixed website
backend changes require hunk-level review before staging. See the
[TPI-STUDIOFLOW-055 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-055-RESULT.md).

## TPI-STUDIOFLOW-056 release checkpoint and documentation synchronization

TPI-STUDIOFLOW-056 is **COMPLETE / AUDIT COMPLETE / NO CHECKPOINT CREATED**.
The read-only audit classified 33 modified tracked files and 259 untracked
paths into release source, generated assets, TPI integration, tests, docs,
local-only data, unrelated work, and owner-review items. Nothing was staged,
committed, pushed, deployed, deleted, or reset. The proposed release manifest
and remaining questions are recorded in the
[TPI-STUDIOFLOW-056 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-056-RESULT.md).

## TPI-STUDIOFLOW-057 verification test reconciliation

TPI-STUDIOFLOW-057 is **COMPLETE / 107 OF 107 CHECKS PASS**. TPI-012's two
failures were outdated assertions for the current project-management menu:
the application intentionally exposes `Import Project Configuration`, `Save
Project`, and `Refresh Project Library` instead of the legacy action-row
labels. TPI-020 and TPI-031 had hardcoded references to retired generated
bundle names; those checks now resolve the current JavaScript asset from the
integrated entry point while retaining meaningful content and ordering checks.
The same current-asset correction was applied to TPI-045.

After the asset-name correction exposed the current generated code, TPI-020
also identified a real application regression: the authoritative compositor
created finite intro/outro clips with `loop = true`. The source now sets that
compositor clip to one-shot, and the website integration was regenerated as
`studio/assets/index-AccwBwcd.js`. The authoritative staging verifier passed
two equivalent builds, current generated asset matching, and preserved TPI
bridges. The new TPI-055 source-reconciliation verifier passes 12/12.

The final named-suite results are TPI-012 14/14, TPI-020 11/11, TPI-031 12/12,
TPI-043 14/14, TPI-045 14/14, TPI-048 20/20, TPI-050 10/10, and TPI-055 12/12.
These are local source/build checks; they do not constitute production
readiness or authenticated browser acceptance. No owner Studio, browser
storage, production resource, commit, push, or deployment was touched. See
the [TPI-STUDIOFLOW-057 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-057-RESULT.md).

## TPI-STUDIOFLOW-058 authoritative source checkpoint preparation

TPI-STUDIOFLOW-058 is **COMPLETE / PREPARED / OWNER AUTHORIZATION REQUIRED**.
The authoritative repository `/Users/toddknipple/Documents/StudioFlow/web` is
on `main` at `8437b071c2bf1eda3d9df44dca53f95f08e6b032`, with only
`src/App.tsx` and `src/styles.css` modified. The current diff is fingerprinted
as `8d07fdfd01b7745631bb91d374d1e7acc6bc590ef2efabd485ac0241c1b8edbd`.

The source build passes TypeScript and Vite validation, producing
`index-AccwBwcd.js` and `index-TsnuK4Ub.css`. Those files match the current
website integration byte-for-byte. The existing staging verifier also passes
two equivalent builds, current asset matching, bridge preservation, and no
obsolete bundle references. The current source changes are all attributable to
the reviewed StudioFlow feature work and TPI-057 compositor correction; no
unrelated or sensitive source files are present.

The proposed source checkpoint contains both modified source files, but has
not been staged or committed. Owner review is still required for the guest
audio/admission behavior, default recording preference, and the fact that the
website integration remains dependent on these uncommitted source changes.
The website integration checkpoint remains a separate follow-up. See the
[TPI-STUDIOFLOW-058 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-058-RESULT.md).

## TPI-STUDIOFLOW-059 source checkpoint staging and final review

TPI-STUDIOFLOW-059 is **COMPLETE / STAGED / AWAITING OWNER COMMIT
AUTHORIZATION**. The pre-staging repository state matched TPI-058 exactly:
`main`, HEAD `8437b071c2bf1eda3d9df44dca53f95f08e6b032`, no prior staged files,
and diff fingerprint
`8d07fdfd01b7745631bb91d374d1e7acc6bc590ef2efabd485ac0241c1b8edbd`.

Exactly these two source files are staged:

- `src/App.tsx`
- `src/styles.css`

The cached diff is 311 additions and 61 deletions across two files, passes
`git diff --cached --check`, and contains only the reviewed StudioFlow guest
audio/admission, recording-default, compositor, background, backstage, guest
messaging, and responsive-style changes. No other files are staged. The
proposed commit message is `feat(studioflow): complete guest stage audio and
studio UI integration`. No commit or push has occurred. See the
[TPI-STUDIOFLOW-059 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-059-RESULT.md).

## TPI-STUDIOFLOW-060 authorized source checkpoint commit

TPI-STUDIOFLOW-060 is **COMPLETE / LOCAL COMMIT CREATED / NOT PUSHED**. The
owner-authorized source checkpoint was committed in
`/Users/toddknipple/Documents/StudioFlow/web` on `main`.

- Previous HEAD: `8437b071c2bf1eda3d9df44dca53f95f08e6b032`
- New HEAD: `a919a881705c4f21dc184a6f2af8a5096d68e5f4`
- Commit: `feat(studioflow): complete guest stage audio and studio UI integration`
- Files: `src/App.tsx`, `src/styles.css` only
- Statistics: 311 insertions, 61 deletions

The post-commit source worktree is clean. The authoritative TypeScript/Vite
build passes, TPI-057 compositor correction remains present, and the website
integration verifier reports two equivalent builds, matching generated assets,
and preserved TPI bridges. No push, deployment, production change, or owner
data modification occurred. See the
[TPI-STUDIOFLOW-060 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-060-RESULT.md).

## TPI-STUDIOFLOW-061 website integration checkpoint audit

TPI-STUDIOFLOW-061 is **COMPLETE / AUDIT COMPLETE / NO CHECKPOINT CREATED**. The
website repository is on `codex/tpi-development` at
`7385f0cf24155f121bdc967a0985553daa8a05df`, with 37 modified tracked paths,
269 pre-audit untracked paths, and no staged files before this documentation-only update.
The authoritative StudioFlow source is clean at approved commit
`a919a881705c4f21dc184a6f2af8a5096d68e5f4`.

The integrated entry point references `index-AccwBwcd.js` and
`index-TsnuK4Ub.css`; both match the authoritative source build byte-for-byte.
The verify-only staging pipeline passed two equivalent builds, 1,597 transformed
modules per build, 14 generated files, 22 integration candidates, no obsolete
bundle references, and preserved TPI bridges. Focused local checks run for this
audit passed 115/115, including production-lock schema checks, persistence,
backup, guest-audio, stability, and source-reconciliation checks.

The proposed checkpoint is not staged. The backend files
`functions/api/[[path]].js`, `worker.js`, and `lib/auth.js` are mixed with
local-runtime, authentication, or unrelated website changes and require
hunk-level review. Migration `0053_studioflow_creator_production_lock.sql`
is additive but has no down migration and was not applied. Local configuration,
credentials, browser storage, owner media, recordings, snapshots, and ignored
state remain excluded. See the
[TPI-STUDIOFLOW-061 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-061-RESULT.md).

## TPI-STUDIOFLOW-062 website repository change inventory and change-control audit

TPI-STUDIOFLOW-062 is **COMPLETE / INVESTIGATION COMPLETE / NO CODE OR GIT
CHANGES**. The read-only audit found 37 modified tracked paths, 270 untracked
paths, and no staged paths at inventory time on branch
`codex/tpi-development`, HEAD
`7385f0cf24155f121bdc967a0985553daa8a05df`. The repository contains
interleaved Administration, StudioFlow, shared website/backend, local
operations, research, and documentation streams; untracked files cannot be
assigned to a historical task with certainty from Git alone.

The complete exact path inventory is in
[TPI-WEBSITE-REPOSITORY-CHANGE-INVENTORY.md](TPI-WEBSITE-REPOSITORY-CHANGE-INVENTORY.md).
The shared files `functions/api/[[path]].js`, `worker.js`, and `lib/auth.js`
require hunk-level review before any checkpoint. Migration
`0053_studioflow_creator_production_lock.sql` remains an owner-review item and
was not applied. No application code, Git state, production resource, owner
data, or browser storage was changed. See the
[TPI-STUDIOFLOW-062 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-062-RESULT.md).

## TPI-063 master development system foundation

TPI-063 is **COMPLETE / DOCUMENTATION FOUNDATION CREATED / NO CODE OR GIT
CHANGES**. A read-only architecture audit confirmed the public website,
Community, Creator Systems, Administration, Research/Education, Applications,
Shared Infrastructure, and Operations divisions. The numbered master tree is
in `docs/TPI-MASTER-DEVELOPMENT/`, with a control index, system map, active
mission record, shared dependency map, release register, Rabbit Hole backlog,
division masters, and stable module records.

StudioFlow remains the primary development mission. Its source checkpoint is
`a919a881705c4f21dc184a6f2af8a5096d68e5f4`; website integration remains pending
shared backend hunk review, migration 0053 approval, and production gates. The
TPI-062 exact inventory is connected to the new uncommitted-work map; unknown
and local-only paths remain explicitly marked rather than guessed or deleted.

No application code, StudioFlow source, runtime assets, Git staging, commit,
production resource, database, browser storage, owner data, media, recording,
branch, or worktree was modified. See the
[TPI-063 result](300-COMPLETED-WORK/TPI-063-RESULT.md) and the
[master development control](../TPI-MASTER-DEVELOPMENT/00-MASTER-DEVELOPMENT-CONTROL/00-MASTER-DEVELOPMENT-CONTROL.md).

## TPI-064 StudioFlow backend separation and release manifest

TPI-064 is **COMPLETE / READ-ONLY AUDIT / CHECKPOINT NOT STAGED**. The current
website repository remains on `codex/tpi-development` at
`7385f0cf24155f121bdc967a0985553daa8a05df`, with no staged files. The audit
classified changed hunks in `functions/api/[[path]].js`, `worker.js`, and
`lib/auth.js` rather than treating those shared files as StudioFlow-owned.

StudioFlow workspace, snapshot, production-lock, broadcast-linkage, and room
livestream hunks are identified as required candidates. Local request guards,
public link-preview behavior, shared routing, authentication, and unrelated
website behavior remain shared or local-only. The `localFetch` dependency and
migration `0053_studioflow_creator_production_lock.sql` remain release-review
blockers; the migration was not applied.

The proposed manifest keeps the current StudioFlow entry point, verified
assets, bridges, backup runtime, staging/versioning scripts, and focused
verification records as candidates while deferring whole shared files and
sensitive/local material. See the
[TPI-064 result](300-COMPLETED-WORK/TPI-064-RESULT.md), the updated
[Creator Studio record](../TPI-MASTER-DEVELOPMENT/03-TPI-CREATOR-SYSTEMS/01-TPI-CREATOR-STUDIO.md),
and the updated
[shared dependency map](../TPI-MASTER-DEVELOPMENT/00-MASTER-DEVELOPMENT-CONTROL/04-SHARED-DEPENDENCIES.md).

## TPI-065 StudioFlow production-safe backend extraction

TPI-065 is **PARTIAL / CONTROLLED LOCAL EXTRACTION / NO STAGE OR COMMIT**.
The API runtime dependency on the local-only request-guard path was separated
into `lib/outbound-fetch.js`; the original local guard remains as a re-export
for local tooling and its protections remain active. No changes were made to
`worker.js` or `lib/auth.js`.

The remaining StudioFlow backend changes are still mixed into
`functions/api/[[path]].js` and require a reviewed hunk-level checkpoint.
Migration `0053_studioflow_creator_production_lock.sql` remains additive,
unapplied, and production-gated. Offline/source checks passed, but the local
startup verification reported 8/10 because the LaunchAgent was running while
the loopback Worker HTTP probes returned no response. No production resource,
owner workspace, database, browser storage, staging area, commit, or push was
modified. See [TPI-065 result](300-COMPLETED-WORK/TPI-065-RESULT.md).

## TPI-066 isolated StudioFlow release candidate

TPI-066 is **PARTIAL / CANDIDATE PREPARED / NOT COMMITTED OR DEPLOYED**. The
isolated candidate is at
`/Users/toddknipple/Documents/GitHub/tpi-studioflow-release-candidate` on
`codex/studioflow-release-candidate`, based on website HEAD
`7385f0cf24155f121bdc967a0985553daa8a05df`. The original dirty worktree
remains preserved and unstaged.

The candidate includes the approved StudioFlow assets and bridge layer,
workspace/snapshot/production-lock backend hunks, the shared outbound-fetch
dependency, required verification/staging scripts, and unapplied migration
0053. The authoritative source build is reproducible with matching
`index-AccwBwcd.js` and `index-TsnuK4Ub.css`; focused candidate checks pass
285/285. A temporary local-only compatibility-date configuration allowed the
candidate Worker to start on port 8897: `/` returned 200 and unauthenticated
`/studio/` returned 403.

The repository's normal `2026-07-18` compatibility date exceeds the installed
local workerd support ceiling of `2026-07-15`; the production repository
configuration was not changed. Authenticated candidate acceptance, production
migration approval, HTTPS/WebRTC/media verification, and deployment remain
blocked. See [TPI-066 result](300-COMPLETED-WORK/TPI-066-RESULT.md).

## TPI-067 StudioFlow release candidate acceptance

TPI-067 is **PARTIAL / AUTHENTICATED STUDIOFLOW VERIFIED WITH RELEASE
BLOCKERS / NOT COMMITTED OR DEPLOYED**. The isolated candidate at
`/Users/toddknipple/Documents/GitHub/tpi-studioflow-release-candidate` remains
on `codex/studioflow-release-candidate` at the clean website baseline
`7385f0cf24155f121bdc967a0985553daa8a05df` plus the uncommitted candidate
manifest. No files are staged and no commit, push, deployment, migration, or
production access occurred.

Candidate verification passed 285/285 focused StudioFlow checks, JavaScript
syntax checks, migration structure checks, auth-cookie boundary checks,
`git diff --check`, synthetic authenticated browser loading, workspace list and
save, R2 recovery snapshot creation/retrieval, production start/heartbeat/stop,
and unauthorized route/asset protection. Chrome loaded the protected
`/studio/` route and retained the synthetic session after refresh. Physical
camera/microphone permission was declined, so hardware/WebRTC behavior was not
claimed.

Remaining blockers are the installed local workerd ceiling of `2026-07-15`
against the repository's `2026-07-18` compatibility date, the candidate's
synthetic login redirect returning 404 at `/member-home`, missing disposable
RealtimeKit credentials for room creation/invite/guest/close testing, and
unverified server-side persistence of browser-local Studio media. Migration
0053 remains unapplied and unapproved. See the
[TPI-067 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-067-RESULT.md).

## TPI-068 StudioFlow release blocker resolution

TPI-068 is **PARTIAL / ROUTE AND LOCAL RUNTIME REPAIRED / NOT DEPLOYED**. In
the isolated candidate, the `/member-home` 404 was traced to the Worker’s
default raw asset lookup: the existing `member-home.html` file was present,
but `/member-home` was not passed through the existing clean-URL fallback.
The candidate now routes only `/member-home` and `/member-home/` through
`servePageAsset`; no member page or authentication semantics were replaced.

The installed Wrangler `4.110.0`/workerd supports through compatibility date
`2026-07-15`, while the production and development configs remain at
`2026-07-18`. A candidate-scoped `wrangler.local.toml` uses `2026-07-15` for
local validation; production configuration was not changed and no global
tooling was changed.

Synthetic Chrome acceptance passed login to `/member-home`, browser refresh,
authenticated `/studio/` loading, logout, and unauthenticated `/studio/`
blocking. The 21-file focused suite remains **285/285**, syntax and
`git diff --check` pass, and the local Worker was ready on isolated port
8898. StudioFlow workspace saves and recovery snapshots are server-backed,
but recordings and custom Studio media remain browser-local; workspace
snapshots retain configuration/references rather than media bytes. Room
creation still fails closed until disposable RealtimeKit configuration is
provided. See the [TPI-068 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-068-RESULT.md).

## TPI-069 StudioFlow media persistence and guest readiness

TPI-069 is **PARTIAL / DISPOSABLE MEDIA PATH VERIFIED / NOT DEPLOYED**. The
isolated candidate adds a narrow server-side custom-media contract for supported
image, video, and audio assets: authenticated workspace-scoped upload, D1
metadata, private R2 objects, authorized retrieval, stable asset references,
content-type and size validation, and cleanup on failed metadata writes. The
existing browser-local media bridge now uploads eligible local media during
workspace save and replaces configuration references only after the server
returns a stable asset identity. Existing browser-local recordings remain
unchanged and are not treated as custom Studio media.

Disposable local testing passed upload (201), listing, authenticated retrieval,
unauthenticated denial, cross-owner denial, configuration persistence, and the
bridge contract (5/5). The existing 21-file StudioFlow regression set remains
285/285, and an isolated authenticated browser loaded the synthetic workspace
and StudioFlow interface. A separate browser-profile portability run was not
available, and live guest-room acceptance remains blocked because no disposable
RealtimeKit configuration was provided. Migration `0054_studioflow_media_assets.sql`
is unapplied; no production D1/R2 or owner data was accessed. See the
[TPI-069 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-069-RESULT.md).

## TPI-070 StudioFlow final release readiness gate

TPI-070 is **PARTIAL / RELEASE BLOCKED / NOT DEPLOYED**. The isolated
candidate remains on `codex/studioflow-release-candidate` at baseline
`7385f0cf24155f121bdc967a0985553daa8a05df` with the previously prepared,
unstaged candidate changes. The candidate was not staged, committed, pushed,
migrated, or deployed.

The complete StudioFlow verification set passed: 22 focused suites, **290/290
checks** including the TPI-069 media bridge contract. JavaScript syntax checks
and `git diff --check` passed. Migration review confirms 0053 must follow the
existing workspace/room/broadcast prerequisites before production-lock routes,
and 0054 must follow workspace/contributor prerequisites before media routes;
both require production backup, approval, and post-migration validation.

The release gate remains open for two reasons. The available browser automation
surface exposes only one in-app browser and cannot provide two genuinely
separate disposable profiles, so full cross-profile image/video/audio playback
acceptance is not claimed. No disposable RealtimeKit variables are configured,
so room creation, invitation, guest authentication, admission, removal, and
closure were not attempted or claimed. No production or owner data was
accessed. See the [TPI-070 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-070-RESULT.md).

## TPI-071 existing live guest integration verification

TPI-071 is **PARTIAL / EXISTING GUEST PATH CONFIRMED / PRODUCTION ACCEPTANCE
BLOCKED**. The authoritative StudioFlow source is clean at approved commit
`a919a881705c4f21dc184a6f2af8a5096d68e5f4` and contains the existing guest
experience: invite-code resolution, waiting-room presence, WebRTC peer
connections, camera/microphone tracks, host admission/removal signals, program
audio return, and guest status transitions. The candidate bundle contains the
same guest signaling and media path; no guest feature was added or treated as
missing.

The local development gateway is the existing
`/Users/toddknipple/Documents/StudioFlow/web/server/room-server.mjs` on
`127.0.0.1:8788`. Its synthetic health, guest presence, status, signal, and
removal contracts passed. The integrated candidate Worker also contains the
production `/api/rooms`, `/api/room-codes`, and `/api/studio/rooms` routes.

Two release boundaries remain. The candidate has no disposable RealtimeKit
configuration, so RealtimeKit-backed room creation and participant-token
acceptance were not attempted. Also, the production candidate's `/api/rooms`
and `/api/room-codes` wrappers use `requireAdmin`, while the guest UI resolves
production relay URLs as same-origin account-free guest links. This is an
unresolved authentication/integration boundary requiring review; it must not be
silently bypassed. The candidate does not contain the standalone local gateway,
which is appropriate for the integrated website but means localhost browser
acceptance requires the existing 8788 service.

Focused guest/audio checks passed 14/14, production-lock checks 16/16,
stability checks 10/10, source integration checks 12/12, media contract 5/5,
and syntax/diff checks passed. No production or owner data was accessed. See
the [TPI-071 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-071-RESULT.md).

## TPI-072 production update preparation and release manifest

TPI-072 is **PARTIAL / RELEASE UPDATE PREPARED FOR OWNER REVIEW / NOT
DEPLOYED**. The isolated candidate remains on
`codex/studioflow-release-candidate` at baseline
`7385f0cf24155f121bdc967a0985553daa8a05df`; the original website worktree and
authoritative StudioFlow source were preserved. No files were staged, committed,
pushed, migrated, or deployed.

The candidate JavaScript and CSS match the authoritative StudioFlow `dist`
artifacts byte-for-byte by SHA-256. The entry point references the current
assets and preserves the workspace, production-lock, backup, video, media-state,
and navigation bridges. Targeted candidate verification passed 71/71 checks:
TPI-012 14/14, production-lock 16/16, guest audio 14/14, flicker stability
10/10, source integration 12/12, and media 5/5. Syntax checks and
`git diff --check` also passed.

The release remains blocked. The production revision in the documentation is a
historical baseline and was not revalidated. Shared backend/authentication files
remain mixed and require hunk-level extraction; `/api/rooms` and
`/api/room-codes` still require explicit review because their candidate wrappers
use `requireAdmin` while the guest UI describes account-free invite links.
Migrations 0053 and 0054 are unapplied, disposable RealtimeKit configuration is
unavailable, two-profile media portability is not verified, and production
HTTPS/WebRTC, media, rollback, and live smoke acceptance remain open.

See the [TPI-072 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-072-RESULT.md).

## TPI-073 final release candidate isolation (checkpointed by TPI-074)

TPI-073 is **COMPLETE / RELEASE DIFF ISOLATED / UNSTAGED / NOT DEPLOYED**.
The isolated candidate remains at baseline
`7385f0cf24155f121bdc967a0985553daa8a05df`; the authoritative StudioFlow
source remains clean at approved commit
`a919a881705c4f21dc184a6f2af8a5096d68e5f4`. The original website worktree
was preserved. No files are staged, and no commit, push, production migration,
or deployment occurred.

The candidate's local login/logout cookie changes were removed; its auth module
matches baseline. Local no-store behavior was scoped to StudioFlow routes.
Existing guest-code and room-relay declarations/handlers compare byte-for-byte
with baseline, preserving the established Live Bridge access behavior. The
proposed checkpoint lists only StudioFlow runtime assets, bridges, selected
backend hunks, two migrations, build staging, and focused regression scripts;
candidate-only local configuration and watcher files are excluded.

The authoritative source staging command completed two equivalent builds
(1,597 modules each; 14 generated assets; 22 integrated files), and retained all
eight maintained bridge files. The complete StudioFlow suite passed 23/23
suites; the new API/Worker acceptance harness passed 21/21 using only
in-memory SQLite and synthetic R2. Existing website navigation smoke passed
13/13. Migrations 0053 and 0054 preserved synthetic records in the required
order and remain unapplied to production.

TPI-073's manifest was subsequently staged and committed exactly under
TPI-074. Production migration authorization and production
HTTPS/media/session validation remain separate release operations. See the
[TPI-073 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-073-RESULT.md) and
[TPI-074 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-074-RESULT.md).

## TPI-074 controlled StudioFlow Git checkpoint

TPI-074 is **COMPLETE / LOCAL COMMIT CREATED / NOT PUSHED / NOT DEPLOYED**.
The isolated candidate remains on `codex/studioflow-release-candidate`. Commit
`ebcd0122e8099418fa99ed07c32d0f9d8c1d31a0` has parent
`7385f0cf24155f121bdc967a0985553daa8a05df` and contains exactly the 37 paths
in the approved TPI-073 manifest. No other path was committed. Candidate-local
development configuration and cache-watcher files remain unstaged and
untouched; the original website worktree and StudioFlow source were preserved.

All 21 maintained verification scripts passed, including the 21-check
TPI-073 API/Worker isolation suite. The source staging verifier completed two
reproducible builds, matched the candidate JS/CSS assets, and preserved the
maintained bridge layer. Website navigation smoke passed 13/13. The staged
diff passed security-path/pattern review and `git diff --cached --check`.
Migrations 0053/0054 were tested only against disposable SQLite and were not
applied to production. No push, production access, migration, or deployment
occurred. Production readiness remains unestablished.

See the [TPI-074 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-074-RESULT.md).

## TPI-075 production release readiness

TPI-075 is **PARTIAL / NO-GO / NOT DEPLOYED**. The local release checkpoint
`ebcd0122e8099418fa99ed07c32d0f9d8c1d31a0` is verified at 37 files and its
approved StudioFlow assets reproduce from source. Offline verification passed:
21/21 maintained StudioFlow scripts, 13/13 website navigation checks, two
reproducible source builds, syntax checks, and staged/working-tree whitespace
checks. No remote or production service was contacted.

Repository documentation names `main` as the production promotion branch and
describes Wrangler deployment; the only checked-in GitHub workflow is QA. The
Cloudflare dashboard Git-integration setting and current deployed Worker
version remain unconfirmed. The local cached `origin/main` is at
`f09e4e63a325235c9378ce69c0a91855ae166daf`, an ancestor 71 commits behind the
candidate baseline, so blind cherry-pick/integration is not approved. Historical
production D1 migration records show a schema/ledger discrepancy. Migration
0053 adds columns without idempotent guards; 0054 is additive but requires its
workspace/contributor prerequisites and existing R2 binding. Both remain
unapplied to production. Production backup, migration, HTTPS/media/guest
acceptance, release integration, and deployment are **NO-GO** pending evidence
and separate authorization.

See the [TPI-075 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-075-RESULT.md).

## TPI-076 final release execution

TPI-076 is **BLOCKED / NO INTEGRATED COMMIT / NOT PUSHED / NOT DEPLOYED**.
Read-only Cloudflare inspection identified Worker version
`05c5d075-8d28-4f72-a4c8-a8edba01bb10` (deployment source SHA unavailable),
confirmed the configured production R2 bucket exists, and found production
D1 ledger/schema divergence. The workspace schema exists physically, but
0053's production-lock columns/table and 0054's media table do not.

The approved 37-path checkpoint conflicts when applied to refreshed
`origin/main`, the documented promotion branch. Required workspace API
handlers and `studio/workspace-bridge.js` are missing from that baseline. The
new isolated integration worktree is clean at `origin/main`; the original
dirty development worktree and candidate-local files were preserved. Synthetic
0053→0054 SQLite verification passed, but integrated suites were not run
because the release tree is incomplete.

No production backup, migration, push, or deployment occurred. Release remains
NO-GO pending owner review of a dependency-only manifest addendum and a safe
production D1 ledger reconciliation plan. See the
[TPI-076 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-076-RESULT.md).

## TPI-STUDIOFLOW-079 production correction

TPI-STUDIOFLOW-079 is **PARTIAL / DEPLOYED WITH LIVE SMOKE PASS / OWNER SESSION ACCEPTANCE PENDING**. The clean StudioFlow release was redeployed as Worker version `cf85d853-9a6c-438e-aef9-fe031d6f068a` after restoring the established `serveAssets` fallback and public-root member redirect behavior. The deployment reused the existing `TPI_DB`, `TPI_MEDIA`, and `ASSETS` bindings; no production migration or data write was performed. Anonymous live checks passed for the public root (200), protected StudioFlow route (403), unauthenticated StudioFlow API (401), and protected StudioFlow assets (403). The TPI-073 isolated API/Worker contract passed 21/21. Authenticated owner-session verification after this final correction remains pending because the available isolated browser had no production session.

## Current live integration follow-on

The owner-authorized follow-on integration is **DEPLOYED / AUTHENTICATED ACCEPTANCE PENDING**.
Worker version `b3b9549e-8b21-4ccd-9f0b-8c16b1103117` now carries the current protected
Administration Center implementation together with the preserved StudioFlow release,
private StudioFlow media routes, workspace persistence, and existing Live Bridge paths.
The only production schema write was additive migration 0050, applied after a targeted
read-only check; 0053 and 0054 were not replayed because their physical structures were
already present. The public root remained 200, anonymous StudioFlow/Admin access remained
403, and protected APIs remained fail-closed at 401/403. Focused Admin source suites and
the isolated Worker smoke passed. Authenticated live screen acceptance still requires
the owner to sign in in the browser; no owner data was used or modified.

The subsequent public/member navigation batch is also deployed as Worker
`7c5562e8-e8cd-4b25-8d02-5aca4d0a92ed`. It includes the committed shared shell,
login routing, public landing navigation, ParaNews, ParaTube, and canonical
Admin navigation files. Live read-only checks returned 200 for `/`, `/news`,
`/paratube`, `/member-home`, and `/member-login`; protected Admin and StudioFlow
routes remained 403. Authenticated browser acceptance is still pending.

The subsequent production-safe runtime hardening batch is deployed as Worker
`f0477367-ea62-4e30-a7b7-22558b18a99b` from isolated commit `e7daf78`. It includes
root-relative shared fragments, hidden-tab polling pauses/request deduplication,
and local-only external-fetch guards. OPS traffic protection passed 11/11,
video regression passed 22/22, and bounded live anonymous smoke passed for the
public/member routes and protected StudioFlow/Admin boundaries. Authenticated
owner-session acceptance remains pending because the current browser session is
signed out.

## StudioFlow chronological catch-up verification — 2026-10-19

The archived StudioFlow directive search reaches TPI-STUDIOFLOW-079; no later
StudioFlow directive is present in the repository. The authoritative source is
`/Users/toddknipple/Documents/StudioFlow/web` at `main` commit `2e877a7`.
The production build passes (`tsc` plus Vite, 1,597 modules), and the generated
JS/CSS hashes match the website integration and the isolated release used by the
active Worker `f0477367-ea62-4e30-a7b7-22558b18a99b`.

The complete local StudioFlow verification inventory is 30 passing suites. The
only non-passing item is TPI-STUDIOFLOW-052, which reports `BLOCKED` because
Chrome cannot launch in this execution environment; it does not indicate a
StudioFlow assertion failure. Anonymous live checks remain correct and fail
closed (`/studio/` protected, workspace API `401`).

Read-only production schema inspection confirms the required StudioFlow tables,
columns, and indexes exist, including the 0053 production-session and 0054 media
structures. The production `d1_migrations` ledger still records only 0001 and
0002. This ledger/schema discrepancy is documented and has not been rewritten;
doing so requires explicit production migration-ledger authorization.

The current remaining release gate is an authenticated, non-destructive live
StudioFlow acceptance pass using an owner-signed browser session. No Crossroads
workspace, owner media, recordings, backups, or browser storage were modified.

## Authenticated live follow-up — 2026-10-19

The owner signed in successfully as `Todd_Wayne`. The live `/api/auth/me`
response confirms `creatorStudioAccess: true`, so the Creator Studio entitlement
and authentication boundary are working. The authenticated
`/api/studio/workspaces` response is `{"workspaces":[]}`. A bounded read-only
production D1 count confirms zero `studio_workspaces`, zero `live_broadcasts`,
and zero `studio_media_assets` rows. The missing live My Studios list is
therefore an empty production data state, not a missing route or entitlement.

The live StudioFlow shell, Library, Destinations, Teleprompter, and live-stream
creation UI load without a reload loop. No production workspace, broadcast,
media asset, recording, database row, R2 object, or browser storage was created
or changed during this check. Rebuilding or importing a production studio still
requires an explicit owner-supplied configuration and a separate authorization;
the protected Crossroads workspace was not touched.

## Member left-navigation production repair — 2026-10-19

The signed-in member screenshot exposed a separate integration defect: the live
`member-shell.js` requested `/member-sidebar.txt`, but that generated include
was absent from the deployed asset package, so the left sidebar rendered empty.
The existing source of truth remains `member-sidebar.html`; the production
staging convention generates the text copy for Cloudflare asset serving.

The current live Worker was redeployed as `44825c4d-e3f6-4619-8e47-7c35510f7c68`
with the current runtime/public package unchanged and only the generated
`member-sidebar.txt` asset added. Live checks returned 200 for `/`,
`/member-home`, and `/member-sidebar.txt`; protected `/studio/` remained 403
to anonymous requests and `/api/studio/workspaces` remained 401. The owner’s
authenticated browser visibly showed the restored left navigation, including
TPI Creator Studio. No D1/R2 data, owner workspace, recording, media, or
browser storage was modified.

## StudioFlow Brand 1 / My Studios lifecycle repair — 2026-10-19

Live authenticated browser verification showed the Crossroads editor retaining
the legacy `Brand 1` heading because the My Studios bridge stopped polling after
ten seconds, before the editor's asset panel mounted from StudioFlow Home. The
repair keeps a document mutation observer active for the editor lifecycle, so
the bridge attaches when the panel appears and reattaches after a remount.

The repair was deployed to the existing Worker as version
`a3b6d8a2-0afb-4d61-915e-eb18a3039177`. Wrangler reported one new or modified
static asset: `studio/workspace-bridge.js`; the existing D1, R2, and ASSETS
bindings were retained. Authenticated browser verification then showed
`Crossroads of the Unknown`, `My Studios`, the selected Crossroads control, and
the loaded Crossroads scenes, logo, intro/outro, motion background, and sound
assets. No save, delete, import, migration, D1 write, R2 write, recording
operation, or browser-storage reset was performed.

The production workspace API still reports no server-backed workspace records;
the visible Crossroads state is therefore not evidence of a new server save.
Preserving and migrating that owner configuration requires a separate explicit
data-save decision and was intentionally not performed in this UI repair.

## StudioFlow My Studios selector/menu visibility repair — 2026-10-19

The owner reported that the My Studios dropdown and its management menu were not
visible enough in the live editor. The existing bridge already contained both
controls, but the selector menu was implicit and, with no server-saved workspace
rows in production, exposed only the create action. The production bridge now
labels the selector as an explicit menu, shows the currently loaded browser
studio as a non-mutating status row, reports when no server-saved Studios exist,
and exposes `Open Studio Menu` inside the selector dropdown. The separate
management control is now visibly labeled `Menu` as well.

Worker version `641ed13e-7f4c-4a1d-88a3-9edd7ca1e4f7` deployed exactly one
modified static asset, `studio/workspace-bridge.js`; production D1, R2, and
ASSETS bindings were retained. Source syntax, `git diff --check`, Wrangler
dry-run, and authenticated browser loading of the StudioFlow editor passed.
Opening the selector was attempted in the browser, but the browser automation
session timed out while collecting the post-click tree; no production action,
save, import, delete, migration, or owner-data mutation was performed.

The production D1 read-only audit confirms that the StudioFlow workspace, media,
broadcast, and production-session tables and required columns already exist;
the migration ledger still records only 0001/0002. Current counts are zero for
`studio_workspaces`, `live_broadcasts`, and `studio_media_assets`. No migration
was required or executed. Worker version `46cbffe1-58e8-475d-b218-65ff800112e1`
adds a confirmation-backed `Save Current Studio to My Studios` action for a
browser-local studio, without automatically writing the protected Crossroads
configuration.

The media bridge now recognizes all ordinary workspace-creation requests,
including browser-local broadcast IDs that do not use the generated `studio-`
prefix. Backup restores remain excluded because their media package is already
handled explicitly. Worker `48e863ce-9b41-4793-ab10-776563523ebd` deployed the
modified `studio/workspace-asset-state-bridge.js` only.

## StudioFlow explicit My Studios dropdown — 2026-10-19

The live selector now visibly reads `My Studios: [current studio] ▾` and its
dropdown includes the `Studio Menu` action. The selector uses an explicit menu
contract (`aria-haspopup="menu"`, `aria-expanded`, and `aria-controls`) and the
menu layer is kept visible above the asset-panel layout. Source checks passed:
TPI-055 14/14, TPI-050 10/10, and TPI-069 5/5. Worker version
`d1018c32-88c5-4c20-a70d-03c7848a85ad` deployed only the updated
`studio/workspace-bridge.js`, retaining the existing D1/R2/ASSETS bindings.
The authenticated editor reloaded after deployment; post-click browser-tree
capture remains limited by the editor automation timeout. Production workspace
rows remain zero until the owner explicitly saves a browser-local Studio.

The StudioFlow entry point also received a cache-buster rotation for both
bridge scripts so signed-in browsers fetch the corrected selector. Worker
`63cd692e-b892-456c-b7c5-866deb165dec` uploaded only `studio/index.html`; no
database, R2, migration, or protected-workspace mutation occurred.

The subsequent selector-stability deployment is Worker
`fa84d720-2e0a-49e7-9986-611b3109741f`. It corrected the rendered-label
reconciliation loop, added immediate fallback labels, and bounded the panel
lifecycle watcher. TPI-048 (20/20), TPI-049 (12/12), TPI-050 (10/10), TPI-055
(17/17), and TPI-069 (5/5) passed. Live authenticated editor loading and the
Crossroads production surface passed; menu-open capture remains limited by the
browser automation timeout, and production workspace rows remain zero until an
explicit owner-controlled save.

The latest UI correction is deployed as Worker
`ef9e889d-05f6-4054-9885-70f9f449c77c`: My Studios is now one full-width
`My Studios: [current studio] ▾` dropdown, and its contents include `Studio
Menu` for the management actions. The adjacent standalone Menu button was
removed to make the dropdown unambiguous. TPI-055 source reconciliation remains
17/17, syntax and targeted diff checks pass, and no D1/R2/migration/protected
workspace mutation occurred. Live post-click browser capture remains limited
by the editor frame-tree timeout.

## StudioFlow live repair update — 2026-10-19

The latest local-to-production repair deployed Worker
`1a64e4bf-c783-425e-9bf3-d751ca7b79eb` with the cache-busted, lifecycle-safe
`My Studios` bridge. Local authenticated browser verification confirmed the
single dropdown, nested `Studio Menu`, and existing project-management actions.
The live StudioFlow home loaded, but the live editor's post-entry DOM capture
timed out in browser automation, so authenticated live-editor acceptance remains
NOT CONFIRMED. Production D1/R2 bindings were retained and no production
migration or owner-data write occurred. See
`docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-079-RESULT.md`.

## StudioFlow DOM insertion repair — 2026-10-20

The selector visibility defect was traced to the workspace bridge inserting
the My Studios panel relative to a nested Brand row as though it were a direct
child of the React asset-panel host. The bridge now resolves the host's direct
child before insertion. Focused local verification passed: TPI-STUDIOFLOW-012
14/14, 014 10/10, 017 14/14, 019 7/7, 020 11/11, TPI-DEV-037 12/12,
TPI-STUDIOFLOW-050 10/10, 055 17/17, and 069 5/5. Worker
`93e5acef-6dc2-4d2d-aeed-edb72dda1c3c` deployed `studio/index.html` and
`studio/workspace-bridge.js` only, with the `single-dropdown-v5` cache-buster.
The live authenticated shell referenced the new bridge. Live post-entry DOM
capture remains pending because the browser's WebRTC/media editor frame tree
times out; no production migration or owner-data write occurred.

## StudioFlow live asset correspondence recheck — 2026-10-20

A fresh authenticated live StudioFlow session reported the current bridge set
and bundle references from the live document: `workspace-asset-state-bridge.js`
(`media-sync-v2`), `production-lock-bridge.js`, `workspace-bridge.js`
(`single-dropdown-v5`), `brand-heading-bridge.js`,
`video-playback-reset-bridge.js`, `backup-bridge.js`,
`assets/index-Cvy0xcXe.js`, `navigation-bridge.js`, and
`assets/index-TsnuK4Ub.css`. These match the current local `studio/index.html`
and establish that the live shell is not pointing at the stale historical
`index-j2x9m9vI.js`/`index-DXjilBOR.css` references.

Read-only Wrangler deployment inspection also confirmed that Worker version
`93e5acef-6dc2-4d2d-aeed-edb72dda1c3c` is currently serving 100% of production;
no deployment or configuration write occurred during the inspection.

The live home displayed the protected Crossroads entry. Initial post-entry DOM
capture timed out during the editor's WebRTC/media frame initialization, but a
reconnect to the same editor tab subsequently confirmed the live selector/menu
and a 60-second stable observation. No production mutation was attempted. The
focused local contracts were rerun and passed: 012 14/14, 014 10/10, 017
14/14, 019 7/7, 020 11/11, DEV-037 12/12, 050 10/10, 055 17/17, and 069 5/5;
bridge syntax also passed.

## Fresh live editor acceptance — 2026-10-20

A fresh authenticated browser session then entered the live editor successfully.
The repaired `#tpi-my-studios-panel` was visible, the selector displayed
`My Studios: Crossroads of the Unknown ▾`, the dropdown opened, and the nested
Studio Menu exposed all 11 management actions. Scenes, Intro/Outro, background
and motion-background controls, media assets, recording, and production
controls were visible. A 60-second observation kept the panel mounted and the
selector stable without navigation or disappearance.

The live panel currently reports `No server-saved Studios yet` for the
browser-local Crossroads configuration. Crossroads remains protected, so no
save, create, delete, D1, or R2 mutation was performed. Server-backed
create/switch/autosave and media acceptance remain pending a disposable
production test identity/workspace or a separately approved owner-data action.

The historical offline verification recheck found one stale TPI-023 assertion,
not an application regression. Its maintained script still expected the old
`active-title-v3` and title-only `Select Studio` contract; it now asserts the
current `single-dropdown-v5` and explicit `My Studios: [current studio] ▾`
contract and passes 14/14. TPI-024, 025, 027, 030, 031, 032, 033, 041, 041A,
043, 045, 048, and 049 also passed their current offline contracts.

The current isolated development Worker also passed the authenticated synthetic
acceptance suites: TPI-DEV-025 Creator Studio 39/39, TPI-DEV-037 My Studios QA
32/32, and TPI-DEV-037 final acceptance 37/37. These covered workspace
creation/restoration, saves and version conflicts, import isolation, ownership
boundaries, numbering, rename, duplicate, archive/recovery, concurrent saves,
production deletion guards, and entitlement denial. Synthetic development rows
were archived by the harness; no production or RealtimeKit resource was used.

## StudioFlow master handoff — 2026-10-20

The consolidated handoff is maintained at
`docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-MASTER-HANDOFF.md`. It is the working
index for the archived directives, source and generated files, backend routes,
migrations, PDFs, verification commands, deployment history, protected-data
rules, completed work, and remaining acceptance gates. It does not replace the
numbered historical directive reports.

## Production D1 schema reconciliation read — 2026-10-20

A bounded read-only Wrangler query against `tpi_contributor_portal` confirmed
that the physical StudioFlow schema is present: workspaces, studio numbering,
production sessions, media assets, room tables, the workspace/broadcast
columns, and the required indexes all exist. The `d1_migrations` ledger still
contains only `0001_contributor_portal.sql` and `0002_contributor_profiles.sql`.
The physical schema is therefore ahead of the ledger. No migration was replayed,
no ledger row was inserted, no production D1/R2 write occurred, and no owner
workspace was changed. A ledger/schema reconciliation plan is required before
any future migration operation.

A follow-up read-only production count found zero rows in the StudioFlow
workspace, media, room, production-session, and live-broadcast tables. The
unauthenticated live API routes `/api/studio/workspaces`, `/api/studio/rooms`,
and workspace media each returned HTTP 401, confirming that the routes are
deployed and fail closed. No disposable production fixture currently exists
for authenticated mutation acceptance.

## TPI-STUDIOFLOW-081 — controlled production acceptance — 2026-10-20

The owner-authorized acceptance batch created two disposable production
fixtures without touching Crossroads: `TPI Acceptance Test A` and `TPI
Acceptance Test B`. Both are active, owner-isolated D1 rows at version 1; A was
created through the authenticated StudioFlow UI, while B was inserted through a
controlled additive fixture fallback after browser editor automation became
unstable. The refreshed authenticated workspace API returns both fixtures and a
read-only D1 check confirms zero Crossroads workspace rows.

The final non-destructive asset repair remains deployed as Worker
`4fc9bcda-4b17-4c3a-a1f4-cc6d213a07de`. The browser-local Crossroads export
fallback is deployed, but the browser automation surface did not independently
confirm the downloaded file path, so that backup is not marked externally
verified. Production save/autosave/switch/refresh isolation, synthetic media,
and guest acceptance remain unverified because the full editor tab became
unstable during media/frame initialization. Status remains **PARTIAL**, not
production acceptance complete.

See `300-COMPLETED-WORK/TPI-STUDIOFLOW-081-RESULT.md`.
## TPI-STUDIOFLOW-082 — production acceptance and browser test recovery — 2026-10-20

TPI-STUDIOFLOW-082 remains **PARTIAL / ACCEPTANCE BLOCKED**. The owner
reported that My Studios does not open in the live editor. Fresh live Home
navigation was stable, but editor DOM/AX and screenshot capture became
unavailable after editor entry. The same automation input did not activate
ordinary local editor controls, so this run did not establish an application
defect and did not deploy a speculative dropdown patch. The authoritative
bridge still contains the selector click listener and hidden-menu CSS.

No production code, D1/R2 data, Crossroads, acceptance fixtures, browser
storage, or Live Bridge resources were changed. A reliable manual or alternate
browser interaction is the next gate; after that, continue the required A/B
save/switch/refresh, media, backup-file, and guest acceptance tests.

See `300-COMPLETED-WORK/TPI-STUDIOFLOW-082-RESULT.md`.

## TPI-STUDIOFLOW-083 — scene-list production repair — 2026-10-20

The live StudioFlow left Scenes panel was missing the completed Intro, Demo
scene 1, Demo scene 2, and Outro entries because post-initialization workspace
hydration wrote an incomplete `studioScenes` list. The fix normalizes hydrated
scene writes in both `studio/workspace-asset-state-bridge.js` and
`studio/workspace-bridge.js`; `studio/index.html` references the cache-busted
`scene-normalization-v2` bridge assets. The final bounded deployment is Worker
`bcf91bac-c524-4f3e-aea1-a1e561f02413`, with `dd147e9d-1e6b-4e04-ad96-6df59cf70180`
retained as the rollback target. Opera authenticated live-editor verification
on disposable TPI Acceptance Test B showed Intro video, Default Scene, Demo
scene 1, Demo scene 2, and Outro video. No D1/R2 writes, migrations, owner
workspace changes, Crossroads changes, or Live Bridge changes occurred.

This closes the targeted scene-list defect only. Authenticated save/switch/
refresh persistence, media acceptance, backup-file verification, and guest
acceptance remain separate release gates.

See `300-COMPLETED-WORK/TPI-STUDIOFLOW-083-RESULT.md`.

## TPI-STUDIOFLOW-084 — Firefox login layout repair — 2026-10-20

Firefox Developer Edition exposed a live Member Login layout defect: the Sign
In button rendered directly against the password field. The production-safe
repair added explicit submit-button spacing in `style.css` and changed the
`member-login.html` stylesheet reference to `style.css?v=91`. Only those two
static assets were deployed as Worker
`8d240a53-7dc3-464d-8a86-e0ddcff191bd`. Firefox live visual verification shows
the separated, full-width Sign In control. Authentication logic, D1, R2,
StudioFlow data, Crossroads, and Live Bridge resources were not modified.

See `300-COMPLETED-WORK/TPI-STUDIOFLOW-084-RESULT.md`.

## TPI-MASTER-001E — Firefox production acceptance — 2026-10-20

The current live repair is deployed as Worker
`b8d85644-afd2-487e-b46b-2e698fa12deb`, from isolated source commit
`4c0b3973aa17c74d367de55761de340b405d89cb`. Firefox Developer Edition
verified the My Studios selector, direct Acceptance Test A/B switching,
save-before-switch behavior, independent server-backed settings, and refresh
restoration. A and B remained isolated: A retained `showLogo:false` and its
blue-waves/media references while B retained `showLogo:true`, default-black,
and no A custom media.

This closes the confirmed selector/direct-switch/refresh defect, but does not
close the entire production acceptance gate. A new synthetic R2 upload and
ownership test was not performed; existing A media references are browser-local
or reference-only (`serverAssetId:null`). The read-only backup search found
TPI-033 synthetic backup artifacts but no artifact conclusively identified as
the Crossroads backup. No disposable RealtimeKit gateway/credentials were
available, so live guest acceptance remains blocked. No production migration,
D1/R2 write, owner-workspace mutation, public broadcast, or Live Bridge change
occurred.

Status: **BLOCKED — OWNER ACTION REQUIRED**. See
`300-COMPLETED-WORK/TPI-MASTER-001E-RESULT.md`.

## TPI-STUDIOFLOW-084 media acceptance — 2026-10-20

Firefox Developer Edition completed a bounded production media run using only
TPI Acceptance Test A and B. Authenticated audio upload/retrieval and video
upload/playback passed; Acceptance Test B remained isolated with an empty media
listing. A valid `preview_frame.png` overlay remained visible in the browser UI
but did not appear in A's authenticated server media metadata after refresh,
save, and re-upload. The malformed 24-byte control image did create a metadata
row, so the result is recorded as an image-specific synchronization defect,
not a generic declaration that the media endpoint is broken.

No valid media-inclusive Crossroads backup artifact was found. Existing records
identify only synthetic backup artifacts and explicitly state that a complete
Crossroads media backup does not exist. No owner workspace, browser storage,
D1/R2 data, Live Bridge resource, or production code was modified, and no new
deployment was performed. TPI-STUDIOFLOW-084 media status is **PARTIAL — AUDIO/
VIDEO VERIFIED; IMAGE PERSISTENCE AND CROSSROADS BACKUP UNVERIFIED**.

See `300-COMPLETED-WORK/TPI-STUDIOFLOW-084-MEDIA-RESULT.md`.

## TPI-STUDIOFLOW-084A — image persistence repair — 2026-10-20

The stale server-reference defect was repaired in
`studio/workspace-asset-state-bridge.js` and deployed as Worker
`100ff967-a7f8-4b83-9aa9-1aeb3b3212fd`. Live Firefox verification confirms
synthetic PNG metadata creation, authenticated `200 image/png` retrieval after
save, refresh/reopen visibility, and A/B media isolation. Audio and video
retrieval remain passing. This is not a full owner asset-reload approval:
server-backed scene assignment was not verified and no real Crossroads backup
artifact was found. Crossroads and owner data were untouched.

See `300-COMPLETED-WORK/TPI-STUDIOFLOW-084A-RESULT.md`.

## TPI-STUDIOFLOW-084B — scene persistence repair — 2026-10-20

The server-backed scene image assignment defect is repaired and deployed as
Worker `17f9a096-0eb6-4c75-a889-71fb9a9d418d`. The existing asset-state bridge
now reconstructs the selected custom-background descriptor from the existing
browser blob when metadata is missing, allowing the established upload and
workspace-save path to persist the private R2/D1 media reference. Live Firefox
verification read back A's `customBackground` with asset ID, private media URL,
PNG content type, filename, and a stable five-scene configuration. A/B media
and scene state remain isolated; image, audio, video, refresh, and scene
hydration regressions remain passing.

The Crossroads backup gate remains blocked. The designated authenticated
Firefox profile contains only the disposable acceptance studios and recording
storage; it exposes no Crossroads title or protected workspace/broadcast ID.
The only inspected backup package is synthetic TPI-033 data, not Crossroads.
No owner data was accessed or modified. Status is **PARTIAL / BLOCKED — OWNER
DATA ACCESS REQUIRED**, and owner asset reload is not approved until Crossroads
is opened in the designated profile and a real backup artifact is independently
parsed and validated.

See `300-COMPLETED-WORK/TPI-STUDIOFLOW-084B-RESULT.md`.

## TPI-STUDIOFLOW-085 — editor performance and freeze repair — 2026-10-20

Firefox Profiler identified the confirmed freeze source: the former
`workspace-bridge.js` root-subtree mutation observer consumed 5,459 samples
(99%) in a 5.5-second live-editor profile. The final repair removes that
persistent observer, uses a frame-coalesced bootstrap observer that disconnects
after attachment, bounds later lifecycle checks, makes Brand heading
reconciliation idempotent, and stops paused-video canvas animation.

The final isolated deployment is Worker
`f3422853-8a81-4aa1-8412-27a14af234bd`. Firefox live verification confirmed
the My Studios dropdown, direct A/B switching, save-before-switch status,
scenes, synthetic-media listing, responsive panel interaction, and rendering
of a separately generated valid synthetic MP4 in Acceptance Test A. The
retained 1 KB synthetic MP4 is malformed and Firefox reported
`NS_ERROR_DOM_MEDIA_METADATA_ERR`; it was excluded from playback evidence.
The separately generated valid MP4 survived a full reload and reopening
Acceptance Test A, and remained listed after its scene assignment was changed
to Default black. The live disposable-asset delete confirmation was verified
and canceled. Crossroads and owner data were untouched.

Status: **VERIFIED COMPLETE — PRODUCTION VERIFIED**. See
`300-COMPLETED-WORK/TPI-STUDIOFLOW-085-RESULT.md`.

## TPI-MASTER-002 — historical archive and My Studios recovery — 2026-10-20

The unified historical archive was copied from the Desktop original into
`docs/TPI-MASTER-DEVELOPMENT/HISTORICAL-SOURCES/`, verified with SHA-256
`066f50d06c34362149e4e32b640dc6c27d5a6d9eb8bd2eda9a8187d64cb49d8c`, tested
with `unzip -t`, and extracted without overwriting an existing source file.
The searchable inventory is documented in
`HISTORICAL-SOURCES/HISTORICAL-SOURCE-INDEX.md`.

The recovered My Studios authority is documented in
`FEATURE-HISTORY/MY-STUDIOS-HISTORICAL-SPECIFICATION.md`. The key chain is
TPI-STUDIOFLOW-012 A–C (Brand 1 replacement, independent workspaces, create
flow, production lock), TPI-STUDIOFLOW-014 (SPA bridge lifecycle),
TPI-STUDIOFLOW-017/017A (save-before-switch/direct open/isolation),
TPI-STUDIOFLOW-023 (active-name restoration), TPI-STUDIOFLOW-024–033
(backup/identity protection), and TPI-DEV-037 (numbering/autosave/branding).

Read-only Firefox Developer Edition observation found an unresolved production
identity discrepancy: the editor title was `Crossroads of the Unknown`, while
the server-backed My Studios menu contained only TPI Acceptance Test A and B.
No Crossroads click, save, reset, import, media, scene, database, R2, commit,
push, or deployment operation was performed. Status:
**PARTIAL / OWNER-DATA IDENTITY BLOCKER**. A verified protected Crossroads
workspace identity and genuine backup artifact are required before any mapping
repair can be safely implemented.

See `300-COMPLETED-WORK/TPI-MASTER-002-RESULT.md`.

## TPI-STUDIOFLOW-122H.1 — local podcast project folders — 2026-10-31

The local-folder enhancement is staged on the authoritative Worker at
`http://127.0.0.1:8787/studio/`. It reuses the verified 122H project packager,
uses the permission-based File System Access API where available, stores only
an authorized directory handle and sync metadata in browser IndexedDB, and
requires an explicit `Sync Project to Local Folder` action. Existing local
files are preserved; externally changed files receive a StudioFlow conflict
copy instead of being silently overwritten. `Download Project` remains the
fallback.

Source commit `ded5a3d73c5838d56f3c5e1cb0a32534acdab44f` builds reproducibly as
`index-CZ1q5Q9d.js` (`89f744d4ca0a889001acb94f2afd6826609a8c64cee02ad23508f0f4da8a14b3`)
and `index-DtHLNYVn.css`
(`720b9f58e86b2006281120234b4cb9a4bf7e2f2b7388b04badd4e2d3808eb668`). ZIP
fallback acceptance passed 17/17, maintained Firefox passed 64/64, and release
safety passed 21/21. Native Chrome folder selection and independent real-folder
inspection remain **UNVERIFIED**, so 122H.1 is **PARTIAL**, not complete.

## TPI-STUDIOFLOW-122H.2 — local folder verification — 2026-10-31

122H.2 verified the 8787 Worker baseline, the staged assets, the real
authenticated Project Files dialog, the disposable-project setup path, the
ZIP fallback, and the maintained safety suites. An isolated Chrome/macOS run
could not complete the native directory picker, so no local files were
written and no Finder inspection was claimed. Repeated synchronization,
external-file conflict, permission recovery, and native handle persistence
remain **UNVERIFIED**. The directive is **PARTIAL**, not complete.

The focused harness now foregrounds the isolated browser and avoids targeting
the owner's personal Chrome window. Continue with an interactive supported
Chrome session for the native picker gate. Source remains
`ded5a3d73c5838d56f3c5e1cb0a32534acdab44f`; production remains unchanged.

## TPI-LOCALDEV-006C — local asset staging and automatic refresh — 2026-11-04

006C is **COMPLETE / LOCAL VERIFIED**. The proven defect was staged static
assets, not the runtime: `scripts/stage-local-assets.mjs` rejected
`node_modules` only as a first path segment, so `nova-app/node_modules` and
every other nested dependency tree were copied into `.local-dev/assets`. The
served tree reached about **11,726 files**, and Wrangler/workerd failed against
it with `spawn EBADF` before the Worker bound.

The correction is a general recursive rule: any path containing a
`node_modules` segment at any depth is excluded, together with `.git`,
`.wrangler`, `.local-dev`, and `.DS_Store`. Legitimate built surfaces continue
to stage: root website files, `assets/`, `nova/`, `content-editor-nova/`,
`studio/assets/`, and `admin-center-preview/`.

Measured result: **11,726 → 759 staged files (61 directories, 262 MB, zero
`node_modules` paths, zero local-state files)**. The documented baselines were
532 (OPS-008), 613 (OPS-004), and 765 (006B); 759 is that 765 minus six
`.DS_Store` files now excluded.

`scripts/verify/tpi-localdev-006c-staging.mjs` (13/13) proves nested dependency
exclusion, legitimate nested asset staging, the `content-editor-nova/` bundle,
state isolation, and that a real stage contains no `node_modules` path.
Staging also enforces a defensive ceiling of 4000 files
(`TPI_ASSET_LIMIT_EXCEEDED`, override `TPI_LOCAL_ASSET_LIMIT`) with actionable
guidance, so an abnormal asset explosion cannot silently reach Workerd again.

Automatic asset freshness: `scripts/local-dev.mjs` now watches the served
surfaces and incrementally re-stages changed files (`syncStagedPaths`) instead
of requiring a full restage or an owner restart. Proven twice on the real
service: a root `style.css` marker and a `content-editor-nova/` probe file were
staged within ~2 s, served over HTTP 200, then reverted, with the Workerd PID
unchanged and the staged count back at 759. A third proof was the 004R4
`paper-editor.js` fix itself, which reached the running Worker without a
restart.

Runtime after the fix: two foreground reloads on the real `.local-dev/state/v3`
returned HTTP 200 with no `EBADF`, then the documented owner-control service
restore (`TPI_LOCAL_OWNER_CONTROL=1 node scripts/local-dev-service.mjs start`)
produced one supervisor, one Wrangler, and one workerd on `127.0.0.1:8787`, with
no crash loop. The separate StudioFlow room server on `127.0.0.1:8788` was left
untouched, and port 5192 remains retired. Local D1 (11,036 KB) and R2 (7,475
files) were unchanged across all staging and refresh work.

Node remains the existing `/opt/homebrew/bin/node` v25.9.0. The EOL Node 25
runtime did not cause this defect; adopting the installed Node 24.15.0 Active
LTS by pinning the service's Node path is recorded as a required follow-up
rather than a global Node change.

## TPI-NOVA-004R5 — Nova structured document persistence linked to existing article records — 2026-11-04

**Local schema.** Migration `0059_nova_core.sql` (Nova Core tables, applied
locally) and `0060_article_nova_link.sql` (nullable `articles.nova_item_id` with
a partial unique index, applied locally) are in place. No production migration
was run. Production has not received the 0059/0060 Nova Editorial Workspace
persistence work under this milestone.

**Access.** Contributor access reaches `POST /api/articles/:id/nova` and
`GET|PUT /api/articles/:id/nova/item`. Standalone `/api/nova/*` remains gated by
Creator Studio access. Ownership is `created_by === user.id`. User B is rejected
on convert, read, update and relink of User A's article.

**Adapter.** One article links to one Nova document (Option A). The `articles`
row stays the publication record. The server creates the Nova item and ignores
any client-supplied `novaItemId`. A duplicate link returns the existing item
(200) and never creates a second one. Nova Core helpers
`createNovaItemForOwner` and `updateNovaItemForOwner` are shared by the
standalone routes and the article adapter. `lib/nova.js` never writes to
`articles`.

**Conversion.** HTML→Nova conversion runs in the browser through
`TPINovaConvert.htmlToNovaDoc`. The server validates the envelope and refuses an
empty document when the stored article has text (422 `nova_conversion_empty`).
A non-empty legacy article with no conversion document is refused (422
`nova_conversion_required`). A new blank article is allowed. Unsupported markup
is reported, not silently claimed as full fidelity.

**Persistence.** Autosave uses `PUT .../nova/item` with `expectedVersion`. The
version advances and reload returns the saved structured document. A stale
version returns 409 with the newer document preserved, and the stale local
content remains recoverable. There is no last-write-wins. The local recovery
draft key is `tpi-nova-draft:<novaItemId>`, so it is scoped to one Nova item and
therefore to one article. Revisions live in `nova_revisions`, not
`admin_audit_logs`. Restore creates a new current version and leaves article
metadata unchanged.

**Lifecycle separation.** Archive and trash of a linked Nova item do not change
article status, body, destination, href or `nova_item_id`. Article delete does
not permanently delete the Nova item. There is no cascade and no automatic
unlinking.

**Publication.** The publish snapshot is produced client-side (`novaDocToHtml`)
and written to `body_html`/`article_html` only through the existing publish
path. Ordinary Nova autosave never rewrites the publication body. The server
never writes `body_html` from Nova. `id`, `href`, `destination`, `article_type`,
`author` and `created_by` are preserved. TPI Video stays on the legacy
`tpi-videos.html` path with no Nova document.

**Verification.**
- Server verifier `scripts/verify/tpi-nova-004r5-persistence.mjs` on an isolated
  port: 67 passed, 0 failed (includes the linked archive, trash and restore
  scenario with a dual-entitled account, and article-delete separation).
- Firefox Developer Edition (authoritative, isolated disposable profile) against
  the live 8787 Worker as a Contributor without Studio access: 30 browser-observed
  checks passed, 0 failed, in two runs (11 + 19). Covered: standalone
  `/api/nova/items` returns 403; legacy article opens without auto-conversion;
  explicit conversion through `TPINovaConvert.htmlToNovaDoc` creates one linked
  item; unsupported-markup warning persists and the article body is unchanged;
  422 `nova_conversion_required` and `nova_conversion_empty` refusals; new blank
  article allowed; `expectedVersion` autosave; reload reopens the same item;
  stale-save conflict shows the newer server version and keeps the local copy;
  recovery is scoped per item; live preview shows the newest edits; publish
  snapshot from Nova to `body_html`; publication metadata preserved; public
  `/api/articles` and `published-article.html` render the edit; TPI Video remains
  legacy with no Nova link. Firefox console: no page errors.
- Chromium smoke (Chrome 157, Selenium, disposable profile): 27 browser-observed
  checks passed, 0 failed, in two runs (11 + 16). Covered the same workflow,
  including duplicate-link prevention (repeat link returns the same item, no new
  Nova item). Firefox remains authoritative.
- Regression on the current tree: Nova Core 003 105/105; 004R2 14/0; 004R4 13/0;
  004R5 persistence verifier 67/0; 006C 13/13; `nova-app` typecheck exit 0;
  Content Editor Nova build exit 0; `node --check` on changed JS exit 0;
  `git diff --check` exit 0.

**Existing data.** Both real published articles remain present with their
original IDs, URLs, destinations, authorship and bodies, and with
`nova_item_id = NULL`. Final fingerprint comparison against the 004R5E baseline:
both articles match on title, `body_html`, `article_html` (NULL), destination,
href, status, created_by, article_type and `nova_item_id`. Disposable articles and Nova items created by browser acceptance were
removed by targeted deletes of their recorded IDs. Final local counts: articles
2, published 2, drafts 0, linked 0, Nova items 0, revisions 0, contributors 20.

**Deferred Editorial Workspace UI.** These are product-surface enhancements, not
blockers for structured document persistence:
- Contributor-facing revision history interface.
- Contributor-facing archive/trash/restore interface.

Revision persistence is operational in Nova Core; Contributor-facing revision-history
controls are deferred to a later Editorial Workspace milestone. Nova lifecycle
separation is verified at the persistence/API layer. Contributor-facing
archive/trash/restore controls are deferred.

**Production has not received migrations 0059/0060 or the 004R5 application
changes.**
