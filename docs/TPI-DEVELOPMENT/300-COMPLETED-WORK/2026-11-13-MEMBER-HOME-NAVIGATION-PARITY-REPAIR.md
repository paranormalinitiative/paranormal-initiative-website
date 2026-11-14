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

Focused checks passed before release:

- Staff role and Creator Studio access: 16/16.
- Shared asset cache consistency: all 238 in-scope HTML pages.
- Administration/Settings workspace regressions: both passed.
- Admin functional and Nova navigation checks: 16/16 each.
- ParaNews/ParaTube shared shell: 16/16.
- `git diff --check`: passed.

Local Firefox authenticated redirect acceptance and maintained release gates
are pending. No member or production account data was changed. Haunted Location
books and standalone Repository books were not modified.

## Release

Pending guarded release and live acceptance.
