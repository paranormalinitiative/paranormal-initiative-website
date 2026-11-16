# TPI Connected Destinations — Authorization and Publishing Foundation

Date: **2026-11-16**
Status: **DEPLOYED AND LIVE VERIFIED / PRODUCTION SCHEMA APPLIED / PROVIDER CONFIGURATION REQUIRED**

## Owner request

The owner requested a TPI-controlled destination layer so Facebook and YouTube
can be authorized through TPI, Facebook links can be published from an
authorized administration session, StudioFlow destinations can be reported
honestly, and Rumble can retain its provider-controlled stop behavior.

## What was implemented

- Added additive D1 tables for encrypted connected-destination records and
  short-lived OAuth state records in migration `0073`.
- Added `lib/social-destinations.js` as the single provider boundary for
  Facebook Page and YouTube OAuth, provider discovery, encrypted token storage,
  safe metadata projection, disconnect, and Facebook Page link publishing.
- Added protected API routes:
  - `GET /api/social/destinations`
  - `GET /api/social/destinations/capabilities`
  - `GET /api/social/oauth/facebook/start`
  - `GET /api/social/oauth/facebook/callback`
  - `GET /api/social/oauth/youtube/start`
  - `GET /api/social/oauth/youtube/callback`
  - `POST /api/social/destinations/:id/disconnect`
  - `POST /api/social/share/facebook`
- Added a **Connected Destinations** view to the protected Administration
  Center. It shows configuration state, connected accounts, provider consent,
  disconnect, hosted-relay state, and Rumble's manual/provider-controlled
  lifecycle boundary.
- Added `npm run verify:social-destinations` with source-contract checks for
  encryption, state expiry, authorization boundaries, token minimization, and
  explicit lifecycle capability reporting.

## Security and permission boundary

- Only effective Owner, Executive, Full Administrator, or Administrator roles
  can read or mutate connected destinations. Ordinary members cannot reach the
  connection APIs.
- OAuth state is single-use, expires after ten minutes, and is tied to the
  authenticated TPI account that started the flow.
- Access and refresh tokens are encrypted with AES-GCM using the private
  `SOCIAL_OAUTH_ENCRYPTION_KEY` secret. The Admin Center receives provider IDs,
  names, scopes, status, expiry metadata, and capabilities only.
- Disconnect removes TPI's stored authorization. It does not delete provider
  content or claim to stop an external livestream.
- No credentials, tokens, stream keys, private messages, or provider responses
  containing secrets are logged, committed, or returned to the browser.

## Current provider status

| Provider | TPI connection | Direct publishing | StudioFlow live start/stop |
| --- | --- | --- | --- |
| Facebook Pages | OAuth boundary implemented; Meta app secrets required | Page link publishing implemented | Hosted relay/provider adapter still required |
| YouTube | OAuth boundary implemented; Google client secrets required | Authorization stored for future destination work | Hosted relay/provider adapter still required |
| Rumble | Existing manual RTMP path preserved | Not claimed | Start remains manual; stop remains provider-controlled |
| Custom RTMP | Existing StudioFlow manual path preserved | Not applicable | Uses supplied RTMP URL/key through the existing flow |

## Why live delivery is not falsely marked complete

The existing StudioFlow application correctly supports manual RTMP/RTMPS
destinations and a local engineering bridge. The production website does not
yet have a configured hosted RTMP relay or provider-specific live adapter.
OAuth authorization alone does not create a working video transport. The
Administration Center therefore reports that distinction instead of showing a
connected account as a verified live destination.

The protected StudioFlow source and generated application bundle were not
changed in this implementation slice. The existing manual-destination path,
recording library, Nova Workspace, and Creator Studio remain protected.

## Verification

- `npm run verify:social-destinations` — PASS after the final source-contract
  correction.
- `node --check lib/social-destinations.js` — PASS.
- `node --check functions/api/[[path]].js` — PASS.
- `npm run verify:release-safety` — PASS, 37/37.
- `npm --prefix admin-center-app run build` — PASS; Vite emitted only its
  existing large-bundle warning.
- Guarded production preflight — PASS, 38 gates; certified release
  `rel-6109c7f6169a-0f4c1f4a3019`.
- Production deployment — PASS; Worker version
  `ded22d94-a406-4fec-b025-e1822a23307c` reached 100% traffic.
- Live anonymous production smoke — PASS, 10/10.
- Live isolated Firefox Developer Edition acceptance — PASS, 65/65.
- Production D1 migration `0073_social_destination_connections.sql` — applied
  individually after a read-only absence check; both additive tables verified
  present and empty.

Real Facebook and YouTube consent cannot be verified until the private Meta
and Google OAuth clients and `SOCIAL_OAUTH_ENCRYPTION_KEY` are configured
through the secure Cloudflare secret workflow. No provider authorization was
claimed or simulated in this record.

## Next controlled step

Configure the provider clients privately, connect one disposable/test Facebook Page and one
YouTube channel, verify the metadata-only response and disconnect path, then
design and test the hosted RTMP/provider adapter separately before enabling
one-click StudioFlow live controls.
