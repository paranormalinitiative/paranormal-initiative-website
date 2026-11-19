# Nova Login Return and Session Repair — 2026-11-18

## Incident

Bill Heiland reported this navigation trail while trying to reach the Nova
Editorial Workspace:

```text
Paper Editor -> Member Login -> Member Home
```

That was not a normal Nova access denial. The shared member shell made one
transient `/api/auth/me` failure equivalent to a confirmed signed-out session.
It then rewrote the protected Nova link to Member Login. After sign-in, the
login client always sent the member to Member Home and discarded the requested
workspace.

## Repair

The repair is site-wide because the affected code is shared identity and member
navigation code:

1. `member-shell.js` retries transient Worker, network, and HTTP 429/5xx
   session failures before falling back to guest mode. A successful `200` with
   `user: null` remains a confirmed signed-out response.
2. Guest-facing Nova links preserve a same-origin `next=/paper-editor.html`
   destination when they must send someone through Member Login.
3. `member-login.js` validates the `next` destination against the current
   origin, returns the member to Nova after a confirmed sign-in, and keeps
   Member Home as the safe default when no valid destination is supplied.
4. Nova's own client and Worker authorization checks remain unchanged and still
   decide whether the account can use the workspace. Redirect state never grants
   access.

## Verification

The maintained isolated Firefox regression passed **13/13**:

- guest Nova link preserves the editor return destination;
- an authenticated session returns from Member Login to Nova;
- the contributor opens a new Nova-linked paper;
- title, destination, and body save correctly;
- publication creates one live Education Center article;
- Member Home shows exactly one matching feed card with the canonical link;
- the legacy compatibility editor remains explicitly protected.

The run used a disposable Worker, D1 database, synthetic contributor, synthetic
reader, and isolated Firefox profile. Cleanup removed the synthetic article,
accounts, and temporary state. No production account, membership, article,
post, or owner browser storage was changed.

## Release state

Status: **DEPLOYED AND LIVE VERIFIED.**

The guarded full-platform release preflight passed **40/40** gates for the
exact source commit `a99ccfe814a06990613bc292493c46ba90bc2637`. The first
deployment attempt was automatically rolled back after a one-time Firefox
navigation timeout while the authenticated Member Home document was being
replaced. A disposable rerun against the rolled-back site passed **65/65**;
the unchanged certified candidate was then deployed successfully.

- Release ID: `rel-a99ccfe814a0-bca2b2352004`
- Deployed Worker version: `6c6738b2-d2e5-433a-abde-c08a52ed498f`
- Live anonymous smoke: **10/10 PASS**
- Live isolated Firefox Developer Edition acceptance: **65/65 PASS**
- Traffic confirmation: **100% on the new Worker version**
- Rollback version retained: `1ed3035c-b2d1-4ab1-8a24-239e2cc2e0fc`

The temporary Firefox profiles and synthetic acceptance data were isolated;
no owner account, member content, or owner browser storage was used.

## Files

- `member-shell.js`
- `member-login.js`
- `scripts/verify/tpi-paper-editor-to-feed-firefox.mjs`
- `docs/TPI-DEVELOPMENT/TPI-CURRENT-DEVELOPMENT-STATUS.md`
- `docs/TPI-DEVELOPMENT/200-AUDITS/2026-11-18-SITE-WIDE-COMPONENT-BOUNDARY-AUDIT.md`
