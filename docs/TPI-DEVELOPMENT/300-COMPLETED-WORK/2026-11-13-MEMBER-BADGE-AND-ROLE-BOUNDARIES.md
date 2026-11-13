# Member Badge and Role Boundaries

Date: 2026-11-13
Status: **DEPLOYED AND LIVE VERIFIED — RELEASE `rel-5ee1fc9f2d50-3a843a3d7d47`; Worker `dfee6075-5bc3-4e88-aceb-09c97bb53c93`**

## Owner-confirmed staff boundaries

| Role | Intended boundary |
|---|---|
| Owner / CEO / Founder / Director / Assistant Director | Executive authority with complete platform control. Protected from Admin removal, blocking, demotion, or disabling. |
| Full Administrator | Broad platform and member administration, but cannot remove/block protected executives, another Admin, or a Moderator; cannot elevate themselves. |
| Administrator | Delegated platform operations and content administration, including removing inappropriate posts. Does not have executive or unrestricted authority. |
| Moderator | Review reports; hide/remove posts or comments that violate community rules; document actions; issue warnings and limited temporary content restrictions; escalate serious or conflicted cases. No account deletion, staff appointments, access/billing/security changes, or unrelated private-message access. |
| Member | Standard community participation. |

These boundaries are policy, not a role-system launch. The current server still
uses its existing `owner` and `admin` account roles. No Moderator appointment,
Admin tier, or new authorization has been created. Permanent account action,
exact tier hierarchy, and appointment/revocation authority remain future work.

## Honors & Distinctions badges

- The supplied transparent TPI Member badge appears after existing earned
  recognition for every active member profile, including existing accounts.
  Since the shared profile renderer supplies it, future signups receive it
  automatically without a per-account database edit.
- The supplied transparent Administrator badge appears only when the public
  profile record's server-provided `role` is `admin`. It is a visual identity;
  API authorization remains server-side.
- The supplied transparent Moderator badge and image derivatives are ready,
  but the current member model has no Moderator appointment record. It is not
  shown for someone based on their title, post, badge, or client input.
- Older operational badge masters remain preserved for provenance. The new
  transparent masters are the current source art. Masters are excluded from the
  published asset set; optimized web files are included.

## Verification

- `npm run verify:member-profile-feed` — **35/35 passed**; 0 remote requests.
- `npm run verify:member-profile-feed-firefox` — **35/35 passed** in disposable
  Firefox Developer Edition. Verified the Member badge image loads in an
  existing active member's Honors shelf and the Administrator badge renders
  with Member recognition on the existing synthetic Admin account.
- Badge master files verified as 1254 × 1254 RGBA PNGs with real transparency.
- The complete guarded preflight certified the exact pushed candidate with all
  **30 gates passed**. Live anonymous production smoke passed **10/10** and
  isolated production Firefox Developer Edition acceptance passed **65/65**.
- Production confirmed the new Worker version holds 100% of traffic; the
  release completed without a schema migration or member-data changes.
