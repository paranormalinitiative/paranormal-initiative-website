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
