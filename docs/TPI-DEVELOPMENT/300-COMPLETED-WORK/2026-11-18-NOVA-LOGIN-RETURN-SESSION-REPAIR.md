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

Source implementation and regression are ready for the mandatory shared/API
release preflight. Production deployment and live Firefox acceptance must be
recorded here before this repair is called live-verified.

## Files

- `member-shell.js`
- `member-login.js`
- `scripts/verify/tpi-paper-editor-to-feed-firefox.mjs`
- `docs/TPI-DEVELOPMENT/TPI-CURRENT-DEVELOPMENT-STATUS.md`
- `docs/TPI-DEVELOPMENT/200-AUDITS/2026-11-18-SITE-WIDE-COMPONENT-BOUNDARY-AUDIT.md`
