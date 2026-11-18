# Founding Member Product Access Repair

Date: 2026-11-18  
Status: **DEPLOYED AND LIVE VERIFIED**

## Owner request

Founding members must see and be able to use the applications included in
their active founding membership. A founding member with All-Access must see
both Nova Editorial Workspace and StudioFlow. The rule must also work for
future founding assignments without adding per-member navigation exceptions.

## Root cause

Bill Heiland's production record was correct: active membership `FAA-002`
resolved server-side to both the `creator` and `contributor` capabilities.
The failure was in the member-facing contract. The shared navigation and the
Nova editor were checking only the legacy base account role (`member`) instead
of the server-resolved founding capabilities. The API entitlement resolver and
the protected contributor route were already using the capability model.

## Corrected access contract

| Active founding class | Capability | Application navigation |
| --- | --- | --- |
| Founding Creator (`FC`) | `creator` | StudioFlow |
| Founding Contributor (`FCT`) | `contributor` | Nova Editorial Workspace |
| Founding All-Access (`FAA`) | both | StudioFlow and Nova Editorial Workspace |

The server remains authoritative. The login and session responses now expose
navigation hints derived from the same entitlement resolver, while each
application route and API repeats its own server-side authorization check.
Owners, executives, and authorized administrators retain their existing
access. No production membership, entitlement, owner account, or member data
was changed.

## Protected implementation

- `functions/api/[[path]].js` resolves and returns both application-access
  flags from active capabilities.
- `member-shell.js` gates the shared Content Tools and mobile navigation from
  the server-derived Nova capability.
- `member-sidebar.html` marks Nova Editorial Workspace with the shared
  capability gate.
- `paper-editor.js` accepts the server-derived contributor capability instead
  of relying on the stale base role.
- The authorization QA contract covers Founding Creator, Founding Contributor,
  and Founding All-Access mappings, including future resolver-driven access.
- The release guard now waits for Cloudflare's settled 100% traffic report
  before declaring deployment success or initiating rollback. This prevents a
  healthy upload from being treated as failed during short deployment-state
  propagation.

## Verification and release evidence

- Focused authorization contract: **18/18 passed**.
- Membership and entitlement regression: **165 passed, 0 failed**.
- Member sidebar verification: **passed**.
- Nova editorial content controls: **20/20 passed**.
- Shared editor verification: **14/14 passed**.
- Release workflow consistency regression: **7/7 passed**.
- Local authentication lifecycle: **38/38 passed**.
- Full impact-aware preflight: **40 gates passed**.
- Production schema readiness: **passed, read-only; no pending migrations**.
- Live anonymous production smoke: **10/10 passed**.
- Live isolated Firefox Developer Edition acceptance: **65/65 passed**.
- Cloudflare confirmed the new Worker at **100% traffic**.

Release `rel-5bb583755b75-4f082098b483` deployed source commit
`5bb583755b750e99be38125914d8429a9def7079` as Worker
`abe9b70b-115f-4dd0-a773-d4ebd195b39c`. The rollback reference is
`351b5e6a-1d83-4283-8a2d-e9e48820eb41` and the certified manifest digest is
`a684b8848cfbee27df45ed2813cfcc8f1aae8f54c7d3533a2522c34a22d038b5`.

