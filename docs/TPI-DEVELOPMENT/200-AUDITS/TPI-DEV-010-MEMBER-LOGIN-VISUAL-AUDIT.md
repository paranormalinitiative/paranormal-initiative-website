# TPI-DEV-010 — Member Login Visual Repair and Authentication Navigation Audit

Date: 2026-10-13
Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
Branch: `codex/tpi-development`
Status: **PARTIAL COMPLETION — development repair deployed; owner acceptance and full local E2E remain pending**

## Safety boundary

This work was limited to the canonical development checkout and the isolated
development Worker. Production inspection was read-only. No production Worker,
D1, R2 bucket, route, cron, member account, session, secret, or authentication
configuration was modified. The Desktop archive and unrelated projects were
not modified.

Recovery checkpoint: `/private/tmp/tpi-dev-010-recovery-20261013/`

Pre-repair committed checkpoint: `6e14b6e6ec2e9874a0bcc07ba2073513120ab7b6`

Final source commits:

- `524aef4` — repair member login controls and authenticated navigation.
- `d6dd140` — keep the persistent messenger overlay clear of the login state.
- `7afa903` — prevent authenticated mobile header overlap.

## Original findings

The supplied October 13 screenshot showed the development banner, an
authenticated development account, Sign Out, a Member Login heading, a green
Sign In control, a dark Forgot Password control, two-column forms, and a long
registration card extending below the viewport.

The registration card extending below the viewport was not treated as a defect
by itself. Normal vertical scrolling is valid. The confirmed defects were the
cramped Sign In control, inconsistent control sizing, excessive top spacing,
and the misleading ability to remain on the login form while authenticated.

## Production comparison

Production URL: `https://paranormalinitiative.com/member-login`

Development URL: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/member-login`

At a matching browser viewport of 1280 x 720 CSS pixels, production and
development had the same pre-repair login geometry:

| Measurement | Production | Development | Finding |
| --- | ---: | ---: | --- |
| Login card width | 440px | 440px | Same |
| Login card top | 350.39px | 350.39px | Same excessive top position |
| Sign In width | 79.13px | 79.13px | Confirmed cramped defect |
| Sign In height | 43.59px | 43.59px | Text-height driven, not component-height driven |
| Forgot Password width | 189.88px | 189.88px | Inconsistent with Sign In |
| Forgot Password height | 38px | 38px | Existing portal-button rule |
| Document scroll width | 1265px | 1265px | No horizontal overflow at this viewport |

Result: **YES** — the visual layout defect exists in both production and
development. It is not caused only by the development banner, authentication
state, or browser zoom. Production was documented, not repaired.

After deployment, production still serves `style.css?v=89` and
`member-login.js?v=38`. Development serves `style.css?v=90` and
`member-login.js?v=39`, plus the development banner and development bindings.

## Root causes

1. The generic `.editor-access-card button` rule used `min-height: 38px`,
   `padding: 8px 12px`, and the browser's default inline-block sizing. The
   login submit button therefore sized to its text rather than the card width.
2. Forgot Password already used the member `.portal-button` component, so its
   dimensions and alignment differed from the submit button.
3. Login and registration forms did not establish an explicit grid gap. Their
   spacing depended on normal block flow and surrounding rules.
4. The shared member shell injects a page heading and retains the large public
   command-header padding. The login route had no scoped reduction for that
   combination, which created unnecessary vertical space above the cards.
5. `member-login.html` is intentionally not a server-protected route. The
   valid session was correctly reflected by the shared header, but the page
   itself had no authenticated-state treatment. Public homepage and footer
   login links were also static.
6. The floating messenger is a member-only overlay. A previously opened chat
   could cover the login card in a narrow authenticated browser. The repair
   hides that overlay on this access route only; messenger behavior elsewhere
   is unchanged.

## Development repair

Implemented only in the development branch:

- Sign In, registration, invite, owner-setup, and reset-submit controls use a
  full-width, 44px minimum flex-button treatment with centered text.
- Forgot Password is full width and aligned with the form controls.
- Hover, keyboard focus-visible, and disabled states are explicit.
- Login and registration forms use explicit grid gaps.
- Registration checkbox alignment is explicit and remains readable.
- The login command header and injected page heading are reduced on this route;
  authenticated narrow layouts receive a separate header offset so the
  greeting and title do not overlap.
- The login route has an “Already Signed In” state with the current display
  name, an Open Member Dashboard link, and a Sign Out and Use Another Account
  action.
- The authenticated state is resolved from the existing `/api/auth/me`
  session endpoint. The local-storage path remains only for local previews.
  No role or permission is inferred from visible labels.
- Public-shell links labelled Sign In, Member Login, or Contributor Login are
  changed to Member Dashboard only after a valid session is returned.
- Guest registration, invite, password recovery, and owner-setup content stays
  available when signed out.
- The page status element is now a polite live region.
- The route-local messenger overlay is not displayed so it cannot cover the
  access state.

## Authentication navigation findings

The development browser session was valid: `/api/auth/me` returned the
authenticated development member and the shared header showed the account
greeting and Sign Out. The login page was reachable because the route was
public and the homepage Sign In link was static. This was a navigation/UX
issue, not an authentication bypass.

The existing server-side protections remain controlling:

- `getSessionUser` requires the HttpOnly `tpi_session` cookie, a matching D1
  session, an unexpired session, and an active contributor.
- Admin, owner, contributor, member, StudioFlow, and Administration Center
  checks remain server-side.
- The repaired login state does not grant access; the dashboard and protected
  routes still perform their own session and role checks.
- All account roles and permissions were left unchanged.

Role destinations remain architecture-compatible: members use the shared
member home/dashboard route, while role-gated navigation exposes contributor,
admin, and owner tools only after the server-verified role is returned.

## Testing results

### Verified in this audit

- Development preflight: PASS; branch, Worker, D1, R2, development flag,
  outbound guard, and reproducible source check passed.
- Wrangler development dry-run: PASS; only development D1/R2 bindings were
  reported.
- Final development deployment: PASS; development smoke suite **10/10**.
- Production read-only smoke suite: **10/10**.
- Anonymous development `/api/auth/me`: HTTP 200 with `{"user":null}`.
- Deliberately invalid development login: HTTP 401 with the expected generic
  failure message.
- Anonymous development `/studio/`: HTTP 403.
- Anonymous development admin API: HTTP 403.
- Local signed-out browser preview at 1280 x 720: no horizontal overflow;
  Sign In measured 386 x 44px and Forgot Password 386 x 38px.
- Local signed-out invalid-login feedback: visible.
- Local registration password-mismatch feedback: visible.
- Authenticated development browser at 322 x 853: valid account state,
  dashboard link, Sign Out, account-switch control, no horizontal overflow,
  no visible messenger overlay, and no title/greeting overlap.
- Admin Center preview gate and legacy admin preservation checks: PASS.
- TPI Videos navigation, video grid, duration/date, and player regressions:
  PASS.
- Settings Content Ownership regression: PASS.
- Link-preview regression: PASS.
- Messenger media authorization regression: PASS.
- Worker, API, client, shell, include, and QA script syntax checks: PASS.
- Production deployment history remained at
  `7e357215-2579-4c60-b27e-dd572a5656fe`.

### Not fully verified or blocked

- The repository’s full local multi-user API E2E was attempted and did not
  start because Wrangler/esbuild raised the existing `spawn EBADF` error.
  It is recorded as **BLOCKED**, not passed.
- A password-based valid-login replay was not performed because no development
  password was exposed or logged. The existing authenticated development
  session and `/api/auth/me` state were verified instead.
- Duplicate username/email, password-recovery email delivery, session expiry,
  keyboard submission across every form, and separate owner/admin/contributor
  login cycles were not fully exercised in this audit.
- Exact automated viewport runs at 1920 x 1080, 1440 x 900, 1280 x 800,
  1024 x 768, 768 x 1024, 390 x 844, and 375 x 812 were not available through
  the current browser control surface. Actual browser captures were completed
  at 1280 x 720 and 322 x 853; CSS breakpoint rules and geometry were inspected
  without claiming the unperformed exact device sizes.
- Authenticated Administration Center and StudioFlow owner acceptance remains
  an owner review item. Anonymous protection is verified; authenticated
  functionality is not claimed as independently tested here.

## Deployment record

Worker: `theparanormalinitiative-dev`

Source commit: `7afa9032e026e1d1da0188788a4436fc72685e77`

Final development deployment/version ID:
`77f8e9e1-4fdc-4b99-86ca-4b43d8f1d276`

Development D1: `tpi_contributor_portal_dev`
(`4948ecc5-35de-4782-8f6b-b07fa1782b66`)

Development R2: `tpi-contributor-media-dev`

Changed application files:

- `includes.js`
- `member-login.html`
- `member-login.js`
- `style.css`

No production deployment command was run. The final deploy reported only the
development Worker, development D1/R2 bindings, `TPI_ENV=development`, and
`TPI_DISABLE_OUTBOUND=1`.

## Owner review

Development login URL:

`https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/member-login`

Owner acceptance: **PENDING**. Review signed-out rendering, then sign in with
the development owner account and confirm the Already Signed In state, Open
Member Dashboard link, role-gated Administration Center/StudioFlow access, and
the requested responsive sizes.

## Production issues requiring separate authorization

The production Member Login page has the same pre-repair visual defect. It
remains unchanged under this directive. A production repair requires a new
explicit authorization and a separate production release review.

