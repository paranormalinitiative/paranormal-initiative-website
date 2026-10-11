# Profiles

Member and public contributor profile routes use the existing profile editor,
bio/avatar fields, public profile rendering, published work, and profile-style
hydration. `profile-style.js` applies stored highlight/font values without
changing the site-wide theme or content visibility.

The Settings API test verifies public style lookup is separate from owner style
lookup and that owner isolation holds. Browser rendering of profile cards is
specified by `scripts/e2e/member-settings.mjs` but blocked by the missing
Playwright module.

Status: **PARTIAL / browser NOT VERIFIED**.
