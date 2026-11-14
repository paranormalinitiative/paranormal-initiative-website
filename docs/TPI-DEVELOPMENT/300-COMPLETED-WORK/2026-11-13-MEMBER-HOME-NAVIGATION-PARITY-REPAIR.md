# Member Home Navigation and Creator Studio Parity Repair

Date: 2026-11-13

## Owner report

The owner reported that `/member-login` continued to show an “Already Signed In”
card, its “Open Member Dashboard” action did not navigate, and the shared left
navigation still did not match local development (including a missing Creator
Studio link).

## Root causes and repair

- Authenticated users were left on the separate login screen. The login page now
  redirects signed-in members to `/member-home?member=1`.
- The shared desktop Home link already selected the member Home view, while the
  generated mobile Home link selected the bare route. Both now point to the same
  member Home view.
- Creator Studio server authorization and the navigation gate did not include
  appointed Executive leadership. The gate now includes Owner and Executive
  leadership while keeping Full Administrators, Administrators, Moderators,
  and ordinary members subject to their existing entitlements.
- Updated member-shell asset references on the shared member page set, and
  aligned the profile/editor and login stylesheets with their current versions.
- Updated focused regression checks to cover the shared routes and reflect the
  existing Education leadership boundary for TPI Videos.

## Verification

Focused checks passed:

- Staff role and Creator Studio access: 16/16.
- Shared asset cache consistency: all 238 in-scope HTML pages.
- Administration/Settings workspace regressions: both passed.
- Admin functional checks: 16/16; TPI Videos navigation branding: passed.
- ParaNews/ParaTube shared shell: 16/16.
- Member profile/feed Firefox Developer Edition acceptance: 44/44, including
  signed-in member and administrator redirects, the shared Home shell, visible
  Creator Studio navigation for the administrator, and the profile/feed paths.
- Local authentication lifecycle: 38/38 at each checkpoint; isolated Firefox
  StudioFlow acceptance 65/65.
- Complete guarded release preflight: 30/30 gates, including API E2E, Firefox,
  Studio lifecycle/data-safety suites, reproducible asset staging, Cloudflare
  target validation, and Wrangler dry-run.
- Production anonymous smoke: 10/10; isolated production Firefox acceptance:
  65/65.
- `git diff --check`: passed.

No member or production account data was changed. Haunted Location books and
standalone Repository books were not modified.

## Release

**DEPLOYED AND LIVE VERIFIED.** Release `rel-775f9c40e0c3-1b13f7ed1083`,
source commit `775f9c40e0c3e823eae5a5be0511eb8dec82bbf6`, Worker version
`e321a3e4-ee26-4b53-adfe-3b5799361235`; rollback reference
`f4ee230f-b1d1-4f4b-bffd-630ade38cef6`. The new Worker version holds 100% of
traffic. GitHub and the source commit matched before deployment. The remaining
acceptance limitation is that the owner's existing browser session was not
used; live Firefox acceptance used the isolated synthetic release account.

## Production follow-up — authentication redirect loop

Date: 2026-11-14

After release, the owner reported that Home repeatedly switched between
`/member-home?member=1` and `/member-login`. Cloudflare Worker error logs
confirmed that `/api/auth/me` failed with `D1_ERROR: no such table:
staff_role_appointments`. The staff-role feature's additive migration had been
applied to local D1, but not production. As a result, an otherwise valid
session could not be confirmed. The login page's browser-storage fallback then
treated stale identity as a signed-in session and sent the browser back to
Home.

The repair makes `effectiveStaffRole` fall back to the existing legacy
Owner/Admin/member role when appointment lookup is unavailable. This preserves
authentication and profile access while appointment-dependent roles and
permissions fail closed until the table exists. Hosted login now trusts only a
server-confirmed session; local preview retains its browser-storage fallback.
No production migration or member data change was performed.

Verification before release: staff-role checks 18/18; member profile/feed
checks 40/40; Firefox Developer Edition member navigation/profile acceptance
44/44; local authentication lifecycle 38/38 at all three checkpoints, with
isolated StudioFlow browser acceptance 65/65; and focused admin functional,
ParaNews/ParaTube, shared-asset, and workspace checks passed. The initial
authentication lifecycle attempt ran while the official local Worker was
stopped and timed out; it was rerun successfully after the documented local
launcher confirmed the Worker was running. Release preflight was first invoked
before committing and correctly stopped because the working tree was dirty; it
must be rerun against the committed candidate.

**Release and isolated production browser acceptance: pending.** Record the
release identifier, deployed Worker version, live `/api/auth/me` result, and
Firefox login-to-Home result here when complete. Production D1 migration
`0071_staff_role_appointments.sql` remains unapplied under the runbook's
separate-migration rule.
