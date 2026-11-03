# TPI-CREATOR-INCENTIVE-001B — Founding Membership badge integration and production readiness

Date: 2026-11-03. Status: **COMPLETE — CERTIFIED — READY FOR OWNER ACCEPTANCE —
NOT DEPLOYED.** Parent directives: TPI-CREATOR-INCENTIVE-001 and 001A.

Scope: finish the production-facing Founding Membership experience (badge
artwork, admin display, member/profile display, asset packaging, tests) and
prepare — not execute — the production release. `release:production` was not run,
migration `0058` was not applied to production, and no real member was assigned.

## 1. Badge mapping implemented

Badge identity is resolved on the server from the membership class and travels
with every payload that already exposes a membership:

| Class | Numbers | Badge identity | Published derivative |
|---|---|---|---|
| `FC` | `FC-001`–`FC-050` | Founding Creator | `/assets/founding-memberships/web/founding-creator-256.png` (+ `-512` 2x, `-256.webp`) |
| `FCT` | `FCT-001`–`FCT-050` | Founding Contributor | `/assets/founding-memberships/web/founding-contributor-256.png` |
| `FAA` | `FAA-001`–`FAA-050` | Founding All-Access | `/assets/founding-memberships/web/founding-all-access-256.png` |

`lib/membership-entitlements.js` now owns one `badgeForClass()` mapping (label,
colour, alt text, derivative paths). `primaryBadge()`, the registry rows,
`/me/entitlements`, the admin entitlement inspection, `/auth/me`, the public
contributor profile and the assignment response all use it, so a class cannot be
rendered with another class's artwork.

All-Access displays exactly one purple Founding All-Access badge. It is not
rendered as Creator + Contributor badges; internally it still resolves both
capability sets.

## 2. Where badges now appear

| Surface | State |
|---|---|
| Administration Center class cards | Badge artwork beside each class, 44px |
| Administration Center permanent registry | Badge artwork beside each permanent number |
| Administration Center capability inspection | Badge artwork with label and colour |
| Member's own profile (`member-profile.html`) | Identity chip: badge, label, permanent number |
| Public contributor profile (`contributor-profile.html`) | Identity chip in the profile sidebar |
| Community feed (`explore.js`) | **Not implemented** — no per-author badge field in the feed projection; recorded as remaining community-display work |

The chip is presentation only; it is rendered from the resolved server payload.

## 3. Asset packaging

Masters stay in Git and are excluded from the published asset package through the
repository's maintained `.assetsignore`:

```
assets/founding-memberships/masters/
assets/founding-memberships/masters/**
assets/society-leadership/
assets/society-leadership/**
```

| Measure | Bytes |
|---|---|
| Six badge masters in Git | 8,552,727 (≈8.2 MiB) |
| Founding published derivatives | 2,363,608 (≈2.25 MiB) |
| Society derivatives in Git (not published) | 1,769,855 |
| Published badge bytes removed by this change | ≈10.3 MB (all six masters + all society artwork) |

Verification: `GET /assets/founding-memberships/web/founding-all-access-256.png`
returns `200`; `GET /assets/founding-memberships/masters/…png` returns `404`;
`GET /assets/society-leadership/web/gold-256.png` returns `404` on both the local
and isolated Workers. The same `.assetsignore` governs the production deploy,
which uses the repository root as its asset directory.

## 4. All-Access acceptance model

Representative local account `tpi_review_allaccess` (`FAA-001`) proves:

- identity: **Founding All-Access**, number `FAA-001`, state `active`;
- capabilities: Creator **yes**, Contributor **yes**;
- entitlements: StudioFlow Nova Edit entitled, Nova Editorial Workspace entitled,
  both reported unavailable because the features are not built;
- Creator Incentive: eligible under the non-financial participation rules;
- badge: one purple Founding All-Access badge with alt text
  "Founding All-Access badge".

Verified in the API, in Firefox Developer Edition and in Chromium.

## 5. Real member assignment workflow (no SQL)

1. Member already has a normal registered account.
2. Owner/admin signs in and opens **Creators → Founding Memberships**.
3. Types the existing account's username (no UUID, row id, or foreign key).
4. Selects **Founding All-Access (FAA)**, optionally adds a note.
5. Clicks **Issue membership**.
6. The server atomically issues the next permanent `FAA-###`, writes the
   membership row, grants both capability rows, writes history and the admin
   audit entry.
7. The registry refreshes; the member sees the identity chip on their profile and
   public profile.

No step requires database access. The account is not duplicated, renamed, or
otherwise modified beyond the added Founding identity.

Duplicate safety: a second assignment of the same class returns
`409 duplicate_assignment` with the existing permanent number and consumes no new
number. Verified through the form in both browsers and through the API.

## 6. Security

- The client never supplies a badge, class, number, or capability that the server
  honours. A forged `badge`/`membershipNumber`/`capabilities` payload is ignored;
  the response reports the server-resolved class and artwork.
- Non-members resolve `badge: null` and an empty `badges` array.
- A suspended or revoked membership stops resolving an active badge while its
  permanent number and state remain visible in the registry and public identity.
- Badge URL, CSS, DOM, localStorage, or client state cannot grant a capability.
- Unauthorized accounts cannot read the registry, assign memberships, or mutate
  badge identity: anonymous/member requests receive `403`; cross-account
  entitlement paths are admin-gated and audited.

## 7. Production schema plan for migration 0058

Migration: `migrations/0058_founding_membership_entitlements.sql`. Reviewed
against the certified implementation; unchanged. **Not applied.**

Creates (additive only, no `ALTER`, no `DROP`):

| Object | Kind |
|---|---|
| `founding_membership_classes` | table (class configuration) |
| `founding_memberships` | table (permanent registry) |
| `founding_membership_history` | table (lifecycle audit) |
| `member_entitlements` | table (cumulative capability ledger) |
| `creator_incentive_participation` | table (participation only) |
| `idx_founding_memberships_contributor` | index |
| `idx_founding_memberships_class_state` | index |
| `idx_founding_history_membership` | index |
| `idx_founding_history_contributor` | index |
| `idx_member_entitlements_contributor` | index |
| `idx_member_entitlements_capability` | index |
| `idx_creator_incentive_participation_state` | index |

Static inserts: exactly three rows into `founding_membership_classes` (FC, FCT,
FAA with capacity 50, capability sets, badge keys/colours). No contributor, no
membership, no entitlement, no incentive row, no review account.

Pre-apply checks:

1. `SELECT name FROM sqlite_master WHERE type='table' AND name IN (…5 tables…)`
   returns 0 rows.
2. `SELECT COUNT(*) FROM founding_memberships` is impossible; instead confirm the
   tables are absent and `wrangler d1 migrations list --remote` shows `0058` as
   pending.
3. Production Worker version equals the certified candidate's predecessor until
   deployment.

Post-apply checks:

1. All five tables and seven indexes exist.
2. `SELECT class_code, lifetime_capacity FROM founding_membership_classes` returns
   three rows, all capacity 50.
3. `SELECT COUNT(*) FROM founding_memberships` = 0; `member_entitlements` = 0;
   `creator_incentive_participation` = 0.
4. `SELECT nextNumber` via the admin registry shows `FC-001`, `FCT-001`,
   `FAA-001` with 50 remaining each.
5. Existing Creator Partnership/Founding 50 tables from 0048 are unchanged.

Rollback limitations: the migration is additive and D1 has no transactional
rollback for a completed migration. Recovery is manual and must preserve data:

- While the registry is empty (the expected production start), dropping the five
  new tables and their indexes returns the schema to its prior state.
- After real issuance, dropping `founding_memberships` would destroy permanent
  records and is **not** an acceptable rollback. The supported recovery is to
  disable issuance (feature gate or admin procedure) and keep the tables.
- `ON DELETE RESTRICT` on membership → contributor prevents deleting an account
  that holds a membership.

## 8. Production read-only verification

Performed without writes on 2026-11-03:

- Worker `theparanormalinitiative` serves
  `daa5aee1-304f-4e96-89a8-86aac2df98e9` (unchanged).
- Production D1 contains only `founding50_allocations` and
  `founding50_applications` from migration 0048; none of the 0058 tables exist.
- `wrangler d1 migrations list --remote` still lists
  `0058_founding_membership_entitlements.sql` under "Migrations to be applied".
- No production Founding number has been consumed and no QA membership row
  exists.

## 9. Testing

| Suite | Baseline (001A) | Now |
|---|---|---|
| Membership/registry/numbering/packaging suite | 130 | **155 / 155** |
| Isolated API E2E | 285 | **293 / 293** |
| Firefox DE + Chromium acceptance | 28 | **46 / 46** |

New assertions cover class-to-artwork mapping, derivative existence and format,
master exclusion from the published package, registry/inspection/profile artwork,
alt text, the single All-Access identity, no-badge states, suspended presentation,
forged badge handling, and master/society `404`s.

## 10. Browser acceptance

Firefox Developer Edition (authoritative, isolated disposable profile): admin
badge artwork on class cards and registry rows, badge in capability inspection,
All-Access member profile chip with number and alt text, public profile chip for
FAA and FC (correct artwork per class), ordinary member with no Founding badge,
and the existing 403 refusals unchanged, with no console errors. Chromium: identical rendering and
authorization, badge artwork loads on the admin view and the member profile, no
console errors on the profile.

## 11. Certification and source control

Certified through `npm run release:certify` after commit and push. Receipt values
are reported in the completion report and stored in
`.local-dev/release-preflight.json`. `release:production` was **not** run.

## 12. Deferred

- Community feed badge display (no per-author badge field in the feed projection).
- Society / Leadership badges: assets preserved and excluded from publishing;
  qualification, assignment, display, revocation and audit remain
  **UNRESOLVED — OWNER DECISION REQUIRED**.
- Administration Center complete quality audit (separate future directive).
