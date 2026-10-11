# TPI-SOCIAL-001 Defect Register

## SOCIAL-001 — Messenger attachment authorization — HIGH — REPAIRED

Before repair, any authenticated member who obtained or guessed a Messenger R2
URL passed the login check; conversation membership was not checked. The Worker
now requires an exact non-deleted message attachment match plus participant
membership before `TPI_MEDIA.get`. Anonymous access remains 401 and a
nonparticipant receives 404 without an R2 read.

Regression: `node scripts/qa/messenger-media-security.mjs` PASS; full local API
suite PASS=211 FAIL=0.

## SOCIAL-002 — Settings browser verification — MEDIUM — BLOCKED

The existing test requires Playwright, which is not installed. API/source
behavior passed; no runtime repair is justified until browser dependencies are
available.
