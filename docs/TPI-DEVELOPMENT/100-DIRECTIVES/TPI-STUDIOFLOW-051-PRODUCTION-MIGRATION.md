# TPI-STUDIOFLOW-051 — Production Migration

## Scope and release rule

This directive authorizes a controlled production migration only after every
release gate passes. The current review is local/read-only and stops before
deployment because the release candidate and production-binding verification
are incomplete.

## Current architecture

Production is configured by `wrangler.toml` for Worker
`theparanormalinitiative`, with D1 binding `TPI_DB` mapped to
`tpi_contributor_portal` and R2 binding `TPI_MEDIA` mapped to
`tpi-contributor-media`. The Worker routes StudioFlow workspace, snapshot,
production-lock, room, guest-token, and livestream operations through the
existing authenticated API boundary. The local room server on port 8788 is
not a production dependency for the release; production signaling must use the
configured HTTPS/API room-relay path.

## Gate review

| Gate | Result | Evidence / blocker |
| --- | --- | --- |
| A — Home stability | PASS WITH LIMITATION | Settled local Opera Home remained stable for approximately 64 seconds; authenticated production StudioFlow behavior was not tested. |
| B — Production build | PASS / ARTIFACT RECONCILIATION BLOCKED | Canonical `/Users/toddknipple/Documents/StudioFlow/web` passed `tsc && vite build`. Its `dist` output differs from repository `studio/`; the candidate has not been reconciled. |
| C — Automated regressions | PASS LOCALLY | StudioFlow focused suites passed; production runtime acceptance remains separate. |
| D — Authentication | NOT VERIFIED | No authorized authenticated production browser session was available. |
| E — D1/R2 bindings | NOT VERIFIED | Read-only Wrangler D1 API request failed with Cloudflare authentication error code 10000. R2 verification was not continued after the D1 failure. |
| F — Project saving/loading | LOCAL ONLY | Synthetic/local persistence tests pass; production save/load was not exercised. |
| G — Export/import | LOCAL ONLY | Synthetic/local export/import tests pass; production browser download/import acceptance remains open. |
| H — Guest microphone isolation | LOCAL/SYNTHETIC ONLY | TPI-045 bridge checks pass; production HTTPS/WebRTC audio was not exercised. |
| I — Production signaling | NOT VERIFIED | Production room-relay behavior and provider configuration remain unverified. |
| J — Rollback | NOT READY | The guarded deploy procedure does not yet have a captured current production version and tested rollback record for this candidate. |
| K — Website protection | NOT PASSED | Candidate artifacts are not reconciled, and the working tree contains uncommitted application changes. |

## Build and artifact findings

The authoritative source build passed and produced `index-CjmN1suQ.js` and
`index-TsnuK4Ub.css`. The repository currently serves the older generated
`index-j2x9m9vI.js` and `index-DXjilBOR.css` alongside repository-specific
StudioFlow bridge files. The release must reconcile the canonical build with
those integration bridges in an isolated candidate and review the resulting
asset manifest before any production deployment.

The canonical source also has uncommitted changes in `src/App.tsx` and
`src/styles.css`. The repository has additional uncommitted application and
generated-output changes. `scripts/deploy-production-guarded.mjs` correctly
rejects uncommitted application files; that guard must not be bypassed.

## Required next steps before deployment

1. Reconcile the canonical build with the repository integration bridges and
   verify the final asset manifest.
2. Review and authorize the exact application files for a release checkpoint;
   do not include unrelated dirty-worktree changes.
3. Capture a private current production Worker/version record and prepare a
   tested rollback command or version reference.
4. Refresh/repair Cloudflare API authentication, then verify production D1 and
   R2 bindings read-only.
5. Run authenticated production smoke tests with a dedicated authorized test
   identity, without mutating owner Studios.
6. Re-run the guarded deploy preflight. Deploy only if every gate is green.

No migration was applied. No production Worker, D1 record, R2 object, owner
Studio, media asset, recording, or browser storage was modified.

