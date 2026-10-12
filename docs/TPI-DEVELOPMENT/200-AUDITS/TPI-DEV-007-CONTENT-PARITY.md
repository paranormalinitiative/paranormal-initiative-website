# TPI-DEV-007 Content Parity Audit and Development Repair

Date: 2026-10-12
Status: **PARTIAL COMPLETION — development repair verified; owner acceptance pending**

## Scope and safety boundary

This audit compares the canonical development deployment with the public production website and repairs only the isolated development environment.

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Desktop archive: `/Users/toddknipple/Desktop/paranormal-initiative-website` — not accessed or modified
- Cloudflare account: `221ea5479876fd303ddc87002b9e892d`
- Development Worker: `theparanormalinitiative-dev`
- Development D1: `tpi_contributor_portal_dev` / `4948ecc5-35de-4782-8f6b-b07fa1782b66`
- Development R2: `tpi-contributor-media-dev`
- Production Worker: `theparanormalinitiative`
- Production D1: `tpi_contributor_portal` / `f36b9161-b517-4634-9857-bef4147cefe3`
- Production R2: `tpi-contributor-media`

No production Worker, route, D1, R2, authentication, cron, domain, or member record was changed. No production media or private member data was copied.

## Baseline findings

The development deployment and production deployment are separate. Development uses `wrangler.dev.toml`, the development preflight, a separate D1, a separate R2 bucket, a development-only banner, and no cron trigger. The development outbound guard remains enabled.

The content discrepancy is a data-population difference, not a missing public page or a failed API route:

| Area | Development before repair | Production read-only observation | Root cause |
| --- | ---: | ---: | --- |
| `tpi_videos` | 0 | 0 | No creator-authored catalog records in either environment |
| `videos` | 0 | 453 | Production discovery records were never seeded into development; the public TPI Videos API reads this table for discovered content |
| `community_categories` | 16 | 16 | Schema and categories present in development |
| `community_posts` | 0 | 5 | Development had no synthetic feed records |
| `community_comments` | 0 | 2 | Development had no synthetic discussion records |
| `community_reactions` | 0 | 2 | Development had no synthetic reaction records |
| `articles` | 1 | 25 | Development has only baseline migration content; not repaired in this focused batch |
| `events` | 0 | 450 | Development has no event seed; not repaired in this focused batch |
| `paranormal_teams` | 0 | 4,935 | Development has no team import; private/large production data was not copied |

The production comparison used read-only public HTTP responses and read-only D1 count queries. Production content was used as evidence of the discrepancy, not as seed input.

## Development-only repair

Added `scripts/dev/seed-development-content.mjs`. The script:

1. Refuses to run unless the current branch is `codex/tpi-development`.
2. Verifies the exact development Worker, D1 ID, R2 bucket, development flag, and outbound guard.
3. Rejects production Worker, D1, R2, and domain values.
4. Seeds only development D1.
5. Uses deterministic IDs and `INSERT OR IGNORE` for repeatable seeding.
6. Labels all seeded content as `[DEVELOPMENT TEST CONTENT]`.
7. Uses public open-media project pages as external playback references; it does not copy media into R2.
8. Provides `--cleanup`, which deletes only the fixed development seed IDs after the same development guards pass.

Seeded representative content:

- Three synthetic Community Feed posts across Investigation Science, Evidence Science & Analysis, and Instrumentation & Technology.
- Two synthetic comments and two synthetic reactions.
- Three external playback references to the Blender Open Movie project pages on Internet Archive.
- No production authors, member profiles, attachments, private recordings, or credentials.

The development account seed remains separate: `tpi-dev-owner` and `tpi-dev-member`. Their passwords remain in the existing local mode-600 recovery file and are not documented here.

## Verification results

### API and data

- Development `/api/tpi-videos?page=1&pageSize=24&source=all`: **PASS** — three labeled records returned.
- Development `/api/feed?limit=20&offset=0&scope=community`: **PASS** — three labeled Community Feed records returned.
- Development `/api/community/posts`: **PASS** — three posts, comment counts, and reaction counts returned.
- Owner/member development login and `/api/auth/me`: **PASS** for both isolated test accounts.
- Disposable member post creation: **PASS**.
- Own-post edit: **PASS**.
- Owner comment creation: **PASS**.
- Post reaction add and toggle-off: **PASS**.
- Own comment deletion: **PASS**.
- Own post deletion: **PASS**; post no longer resolved afterward.
- Disposable Community attachment upload to development R2: **PASS** (HTTP 200).
- Attachment read-back: **PASS** (HTTP 200).
- Remote deletion from `tpi-contributor-media-dev`: **PASS**.
- Post-delete media read: **PASS** (HTTP 404).
- Disposable library row cleanup in development D1: **PASS**.

### Rendered browser verification

Using the actual development deployment in the Codex in-app browser:

- `/tpi-videos.html`: **PASS** — development banner, three rendered video cards, labels, durations, categories, external playback links, sorting/source/duration controls, and regular-video tab were visible.
- `/member-login.html` followed by the isolated member account: **PASS** — redirected to the member home with development navigation and protected session state.
- `/member-home?username=tpi-dev-member`: **PASS** — development banner, three Community Feed cards, categories, comment counts, reaction count, active discussions, and development-only member names were visible.
- `/admin-center-preview/`: owner/member protection was previously verified under TPI-DEV-005; no access boundary was changed in this batch.
- `/live-video`: preserved as Coming Soon.

### Automated checks

Passed:

- TPI video format regression.
- TPI video player regression.
- TPI media grid regression.
- TPI navigation branding regression.
- TPI Admin Center preview checks: 78/78.
- Node syntax and Bash syntax checks in the existing QA runner.
- Development content seed script syntax check.

The existing full local API E2E suite remains **BLOCKED**, not passed: its local Wrangler 4.110 server exits before serving with `spawn EBADF`. The migration files themselves apply successfully when run with the required local Wrangler permissions; this is a local test-runner startup limitation, not evidence of a migration failure. The remote development API checks above provide the completed-feature evidence for this batch.

Responsive and owner-authenticated production acceptance remain pending. No owner acceptance is claimed.

## Remaining parity work

The following remain outside this focused repair and require separate development work or approved sanitized fixtures:

- Education article parity beyond the one baseline development article.
- Events representative development data.
- Paranormal Teams data; the production team directory was not copied because it contains real records and the directive prohibited private/production data replication.
- Podcasts, news, creator channels, Notifications, Messenger conversations, and StudioFlow content parity.
- Broader mobile/tablet visual comparison.
- Full local API E2E once the Wrangler/esbuild `spawn EBADF` runner issue is repaired or an approved compatible runner is available.
- Owner review of the development URLs.

## Owner acceptance URLs

- Development home: https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/
- Development Community Feed/member home: https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/member-home.html?member=1
- Development TPI Videos: https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/tpi-videos.html
- Development Administration Center: https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/admin-center-preview/

Use the development-only accounts from the existing local recovery file. Do not use production credentials.

## Deployment and production safety

The repair was performed against development D1 only.

- Git commit: `7b6c8a5` (`dev: seed isolated content parity fixtures`), pushed to `origin/codex/tpi-development`.
- A clean-archive Worker upload created version `6e01afa5-928a-4bae-91a6-7f16fcee52f6`. It was immediately rolled back because the clean committed archive intentionally excluded three unrelated application files that were already present in the prior development deployment as uncommitted owner work.
- Effective active development version after the safety rollback: `c8432743-71c7-4b5c-8cd1-9503cb81e038`.
- The rollback changed Worker traffic only; it did not roll back or alter development D1/R2. The seeded content remains verified at the development URLs above.
- Production latest observed version remained `7e357215-2579-4c60-b27e-dd572a5656fe`.

The three unrelated dirty application files and all other unrelated dirty/untracked files remain untouched and unstaged. Production remains protected and must not be promoted from this branch without separate owner authorization.
