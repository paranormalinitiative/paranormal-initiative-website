# TPI Founding Membership Registry

Effective: 2026-11-02

Status: **IMPLEMENTED (local/development). No production migration or
deployment has been performed.**

Source of record for the permanent Founding Membership classes, their numbering,
assignment authority, lifecycle, audit trail, and entitlement mapping.
Implementation: `migrations/0058_founding_membership_entitlements.sql`,
`lib/membership-entitlements.js`, `lib/founding-memberships.js`,
`functions/api/[[path]].js`.

This document does not define Creator Incentive business rules. Amounts, payout
values, qualification thresholds, point systems, revenue percentages, reward
schedules, approval requirements, payout frequency, and accounting rules remain
**UNRESOLVED — OWNER DECISION REQUIRED**.

## 1. Classes

| Class | Display name | Number range | Capability set | Badge |
|---|---|---|---|---|
| `FC` | Founding Creator | `FC-001` – `FC-050` | `creator` | `founding_creator`, green |
| `FCT` | Founding Contributor | `FCT-001` – `FCT-050` | `contributor` | `founding_contributor`, blue |
| `FAA` | Founding All-Access | `FAA-001` – `FAA-050` | `creator` + `contributor` | `founding_all_access`, purple |

Lifetime capacity is 50 per class and 150 in total. The class table stores the
capability set, so All-Access is a union of the Creator and Contributor sets
rather than a third permission list.

## 2. Permanent numbers

- Format: prefix, hyphen, three-digit zero-padded sequence (`FC-007`).
- The sequence is monotonic: the next number is the highest sequence ever issued
  in that class plus one.
- Issued numbers are permanent and never recycled. A suspended or revoked
  membership keeps its row, its number, and its place in the lifetime count.
- Assignment fails closed after 050. No `FC-051`, `FCT-051`, or `FAA-051` can be
  generated, and the admin interface reports the class as exhausted.

Storage-level enforcement (`founding_memberships`):

- `CHECK (sequence_number BETWEEN 1 AND 50)`
- `CHECK (membership_number = class_code || '-' || substr('00' || sequence_number, -3))`
- `UNIQUE (membership_number)`
- `UNIQUE (class_code, sequence_number)`
- `UNIQUE (class_code, contributor_id)` — one membership per class per account

A concurrent issuance that loses the race fails the whole batch and returns
`409 concurrent_assignment_conflict`; nothing partial survives.

## 3. Assignment authority

- Founding Memberships are never self-selected and never created for placeholder
  accounts.
- The member registers a normal TPI account first. An authenticated owner or
  administrator then assigns the membership to that existing account by
  username.
- Every route is enforced server-side (`requireAdmin`). Ordinary members cannot
  read the registry, assign, change state, grant capability, or read another
  account's entitlements.
- Client-supplied numbers, sequences, capabilities, and badges are ignored; the
  server derives all of them.
- Assigning the same class twice is refused with `409 duplicate_assignment` and
  the existing permanent number is reported. No second number is consumed.

## 4. Lifecycle

States: `active`, `suspended`, `revoked`.

- State changes never delete a registry row and never recycle a number.
- `suspended` and `revoked` stop granting the class capability; `active`
  restores it.
- History is append-only in `founding_membership_history` (`issued`,
  `state_changed`) and administrative actions are also written to
  `admin_audit_logs`.
- Accounts referenced by a membership cannot be deleted (`ON DELETE RESTRICT`),
  so issuance history cannot be orphaned.

## 5. Entitlement mapping

Membership determines entitlements; entitlements determine feature access.

`member_entitlements` is a ledger: one row per (account, capability, source).
An account can hold several capabilities from several sources at once. Adding a
Contributor membership or grant never updates or deletes the Creator row.

Capabilities resolve as the union of:

1. active Founding Memberships (class capability set),
2. active explicit administrative capability grants,
3. active legacy Creator Studio entitlements (migration 0048) — Creator,
4. the existing account role (`owner`/`admin` → both, `creator` → Creator,
   `contributor` → Contributor).

Resolution is fail-closed if the additive schema is missing.

## 6. Dual access

Supported deliberately, not as an accident:

- an account may hold two Founding Memberships (for example `FC` then `FCT`), or
- an administrator may grant an additional capability, or
- both.

In every ordering the capabilities accumulate. There is no "last role wins"
code path: no statement writes a single `role`/`membership` value that replaces
another source.

## 7. Badge presentation

`primaryBadge()` selects `FAA`, then `FC`, then `FCT`. An All-Access member is
presented with one All-Access identity while internally holding both capability
sets. Public profile payloads expose only class label, permanent number, state,
and badge identity — never email, session data, or administrative notes.

Original badge master artwork is untouched. This directive ships the badge data
foundation and a CSS-safe presentation (label + colour identity); it does not
introduce or regenerate artwork.

## 8. Administrative API

| Method | Route | Authority | Purpose |
|---|---|---|---|
| GET | `/admin/founding-memberships` | owner/admin | class capacity, exhaustion, registry, participation |
| POST | `/admin/founding-memberships/assign` | owner/admin | issue the next permanent number |
| POST | `/admin/founding-memberships/:id/status` | owner/admin | active / suspended / revoked |
| GET | `/admin/founding-memberships/:id/history` | owner/admin | issuance and state trail |
| GET | `/admin/members/:username/entitlements` | owner/admin | resolved capability set and sources |
| POST | `/admin/members/:username/entitlements` | owner/admin | add an explicit capability grant |
| POST | `/admin/members/entitlements/:id/revoke` | owner/admin | revoke one grant |
| GET | `/admin/creator-incentive` | owner/admin | creator-capable accounts and participation |
| POST | `/admin/creator-incentive/participation` | owner/admin | enrol / suspend participation (requires Creator capability) |
| GET | `/me/entitlements` | member | own capabilities, badges, incentive eligibility |
| GET | `/me/creator-incentive` | member | own eligibility and participation |

The canonical Administration Center exposes this through **Creators → Founding
Memberships** (`admin-center-app/src/app.tsx`, built to `admin-center-preview`).

## 9. Creator Incentive eligibility

Eligibility is a capability question: `creator` capability present, account
active, participation not `suspended`/`withdrawn`.

- Founding Creator — eligible.
- Founding All-Access — eligible (contains the Creator capability).
- Founding Contributor alone — not eligible.
- Ordinary member — not eligible.

`creator_incentive_participation` tracks `not_enrolled`, `enrolled`,
`suspended`, `withdrawn` for auditability only. It stores no amounts and implies
no financial policy.

## 10. Explicit non-goals

- No Nova UI, no Nova Edit Documents/Slides, no Nova Editorial Workspace, no
  Nova Docs/Slides, no GenOffice integration.
- No Education Center publishing change. Contributor capability does not imply
  Author/Submitter/Editor/Publisher/Administrator authority.
- No StudioFlow behavior change. The only integration is the existing Creator
  Studio access check, which now reads the resolved Creator capability.

## 11. Local review data (development only)

The local review environment issues real rows into the local database so the
owner can inspect the workflow: `FC-001`, `FCT-001`, `FAA-001`, `FC-002` (dual
access), and `FC-003` (browser issuance check). They belong to synthetic
`tpi_review_*` accounts and are **not** TPI Founding Memberships.

They cannot reach production:

- The schema migration seeds class definitions only; it never inserts a member,
  a membership, an entitlement, or an incentive row.
- The fixture driver requires `--local-only`, a loopback origin, the local-only
  Wrangler configuration, and a Worker that reports `localReviewData`. Any other
  target aborts before an account is created.
- `.local-dev` (state, credentials, staged assets) is untracked and excluded from
  build output and the certified release candidate.

A clean registry — including the future production database on first launch —
reports `50 left / 0 issued` per class with next numbers `FC-001`, `FCT-001`, and
`FAA-001`. Local fixtures consume none of those numbers.

In a local environment the Administration Center shows a single **Local review
data** notice above the class cards. It is server-decided and cannot render in
production.

## 12. Badge assets

Official master artwork is version-controlled under
`assets/founding-memberships/masters/`, imported byte-for-byte from the owner's
originals:

| Class | Numbers | Badge identity | Master |
|---|---|---|---|
| `FC` | `FC-001`–`FC-050` | Founding Creator | `FoundingCreatorBadgeMaster.png` |
| `FCT` | `FCT-001`–`FCT-050` | Founding Contributor | `FoundingContributorBadgeMaster.png` |
| `FAA` | `FAA-001`–`FAA-050` | Founding All-Access | `FoundingAllAcceessBadgeMaster.png` |

Masters are 1254×1254 PNG, preserved unchanged — including the owner's
`Acceess` spelling — and must never be resized or overwritten. Web derivatives
(`512`, `256`, `128` PNG; `512`, `256` WebP) live in
`assets/founding-memberships/web/` and are regenerated from the masters; the
recipe, digests, and surface guidance are in
`assets/founding-memberships/README.md`.

Badge presentation is separate from authorization. Identity is derived from the
assigned class code on the server, and the API returns badge metadata from
resolved membership rows. An image swap or DOM edit cannot grant a capability,
issue a number, or change Creator Incentive eligibility.

## 13. Recorded future requirements

Two items are permanently recorded in the roadmap until completed:

1. **TPI Administration Center — Complete Quality & Functional Audit** — a
   dedicated directive covering every navigation item, administrative form,
   control, server-side authorization path, account-isolation boundary,
   responsive layout, Firefox Developer Edition and Chrome behavior, visual
   consistency, accessibility, error handling, loading/empty states,
   confirmation behavior, audit behavior, deep links, refresh persistence, data
   integrity, and production safety. Target standard: complete, consistent,
   secure, and flawless for normal administrative use.
2. **Founding Membership Badge Integration & Community Display** — implement and
   verify badge display on member profile, feed/member identity, Administration
   Center, and membership surfaces using the imported derivatives.

The Founding Membership experience is not "completely finished" until both are
complete and the system is released through the guarded production workflow.

## 14. Society / Leadership badge assets (separate family)

The owner supplied three further high-rank badge masters. They are **not**
Founding Membership identities and must not be merged with `FC`/`FCT`/`FAA`:

| Distinction | Master (owner original path) | Repo path |
|---|---|---|
| Gold | `/Users/toddknipple/Desktop/Gold Badge.png` | `assets/society-leadership/masters/Gold Badge.png` |
| Silver | `/Users/toddknipple/Desktop/Silver Badge.png` | `assets/society-leadership/masters/Silver Badge.png` |
| Bronze | `/Users/toddknipple/Desktop/Bronze Badge.png` | `assets/society-leadership/masters/Bronze Badge.png` |

All six masters are version-controlled: the three Founding masters above and these
three Society/Leadership masters. Lawful combinations are owner policy; a person
may hold a Founding Membership badge, a Society/Leadership badge, both, or
neither.

Masters are preserved byte-for-byte with the owner's filenames (including spaces)
and were not resized, re-encoded, recolored, or compressed in place. Two
characteristics of the supplied files are documented rather than "fixed": they
contain JPEG data despite the `.png` extension, and they carry a flattened
transparency checkerboard in the pixels. Web derivatives (`512`, `256`, `128` PNG
and `512`/`256` WebP) are generated from the masters with the format forced to
PNG; the recipe is in `assets/society-leadership/README.md`.

Gold/Silver/Bronze qualification, assignment authority, audit history, revocation
and display are **not implemented and not defined**:
**UNRESOLVED — OWNER DECISION REQUIRED**. The assets are preserved and available;
nothing is assigned automatically.

## 15. Badge authority separation

For both families, badge identity is derived on the server from resolved
membership or leadership records; the API never accepts a badge from the client.
Changing an image, CSS class, DOM element, or client state cannot grant a
capability. Server-side records remain authoritative for membership, role,
entitlement, leadership rank, administrative authority, and editorial capability.

## 16. Badge display surfaces (implemented)

`badgeForClass()` is the single server-side class → artwork mapping (label,
colour, alt text, published derivative paths). It is used by the admin class
cards, the permanent registry, capability inspection, `/me/entitlements`,
`/auth/me`, the public contributor profile, and the assignment response. The
client never supplies a badge.

| Surface | State |
|---|---|
| Administration Center class cards / registry / inspection | Implemented |
| Member's own profile | Implemented (identity chip: badge, label, permanent number) |
| Public contributor profile | Implemented (identity chip) |
| Community feed author identity | **Not implemented** — the feed projection carries no per-author badge field; recorded as remaining community work |

All-Access renders exactly one purple badge; it is never shown as two badges.
Suspended or revoked memberships resolve no active badge while keeping their
permanent number and state.

## 17. Publishing and packaging

Badge masters stay in Git and are excluded from the published asset package by
`.assetsignore`; only optimized `web/` derivatives are deployed (2,363,608 bytes)
instead of the 8,552,727 bytes of masters plus the 1,769,855 bytes of unpublished
Society derivatives. A derivative returns `200`; a master returns `404` locally
and in the isolated environment. Society artwork is entirely unpublished until its
feature exists.

## 18. Production assignment workflow

The owner assigns a real member from **Creators → Founding Memberships** by
existing username, choosing the class and confirming. The server atomically
issues the next permanent number, writes both capability rows for All-Access,
records history and the admin audit entry, and returns the resolved badge. No
SQL, UUID, or database id is required, and the account itself is not duplicated,
renamed, or otherwise altered. A duplicate assignment returns
`409 duplicate_assignment` with the existing number and consumes nothing.
