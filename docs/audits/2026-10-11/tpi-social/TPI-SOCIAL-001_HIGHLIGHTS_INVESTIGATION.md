# Highlights Investigation

## Reproduction and root cause

Source review and the real API/SQLite portion of `scripts/e2e/member-settings.mjs`
show the Highlights control is present, enum-validated, owner-scoped, persisted,
and separated from the six site themes. `profile-style.js` applies the saved
value to member/public profile surfaces and CSS maps each allowed value to an
accent token. No confirmed application defect was reproducible at the API or
source level.

## Result

**No additional runtime repair.** The browser reproduction/save/reload and
computed-style assertions are specified but BLOCKED because `playwright` is not
installed in this repository. This is intentionally recorded as unverified,
not as passing. The current focused Settings API result is PASS.
