# TPI-STUDIOFLOW-033 — Video Clips, Program Orientation, and Workspace Configuration Persistence

Date: 2026-10-24  
Agent: GPT-5.6 Luna  
Directive: TPI-STUDIOFLOW-033  
Status: IMPLEMENTED / LOCAL VALIDATION COMPLETE / PRODUCTION RELEASE PENDING

## Summary

This repair closes the configuration round-trip gaps left deliberately open by
TPI-STUDIOFLOW-031. Video Clips assignments and program orientation now survive
the existing server-backed Studio workspace lifecycle without adding a media
system, changing D1/R2 schemas, or altering stable asset identity.

The authoritative source-to-live path remains the canonical website repository
plus the separate StudioFlow source repository. No production files, owner
studios, Crossroads data, D1 rows, R2 objects, or owner browser storage were
modified during local validation.

## Investigation and root cause

Starting website commit: `df77d3dc5c216c87f40d12d23b010530074337e3` on
`codex/tpi-development`. Starting production Worker:
`0c0a8660-21cf-47e1-ac66-98c91b26972c`, rollback
`7029c6c5-3994-42a1-9570-d6119a5792f3`.

The local disposable API probe independently reproduced the defects:

1. `normalizeStudioConfiguration()` did not return `videoClipSlots` or the
   configuration copy of `programOrientation`, so valid client configuration
   was silently discarded during server normalization.
2. The generic asset-list normalizer removed each asset's `slot`, so even a
   preserved list could not restore its board arrangement.
3. The bridge serialized the local-storage program orientation object as the
   configuration value and, in one state path, as the workspace settings value.
   The server accepts the scalar contract and correctly defaulted the object to
   `landscape`.
4. The asset-state fetch bridge merged local configuration after the workspace
   bridge had prepared the request and could reintroduce the raw orientation
   object.
5. After workspace hydration, the React compositor retained the previous
   Studio's program-output state until the next save. That could write the old
   orientation back over the newly activated Studio.

The API normalizer, not localStorage, is the persistence authority. The repair
keeps its validation and stale-version protections intact.

## Implementation

Website repository changes:

- `functions/api/[[path]].js` — preserve validated `videoClipSlots`, their
  validated `slot` values, and scalar `programOrientation` in the established
  configuration allow-list.
- `studio/workspace-bridge.js` — serialize orientation through one validated
  scalar helper for both configuration and workspace settings.
- `studio/workspace-asset-state-bridge.js` — normalize orientation when local
  configuration is merged into authenticated workspace requests.
- `studio/index.html` and `studio/assets/index-_zI3dNlT.js` — integrated the
  current authoritative StudioFlow build after the source activation-hydration
  repair.
- `package.json` — added the maintained `verify:studioflow-033-roundtrip`
  command.
- `scripts/verify/tpi-studioflow-033-workspace-roundtrip.mjs` — added API and
  real Firefox regression coverage using disposable local Studios.

Authoritative StudioFlow source change:

- `/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx` — re-read the
  restored `programOrientation` value during workspace activation so the React
  program-output state matches the hydrated Studio. Source commit:
  `53bf8dc`.

Existing `public/Microphone.png` and `public/Waveform.png` files in the source
repository were pre-existing and were not part of this directive.

## Configuration round-trip results

| Field | Before | After | Verified |
| --- | --- | --- | --- |
| `videoClipSlots` | Dropped by API normalizer | Preserved with stable IDs and slots | Yes |
| `programOrientation` configuration | Dropped/defaulted | Preserved as validated scalar | Yes |
| `programOrientation` settings | Client could send object; server defaulted | Scalar restored and retained | Yes |
| `backgroundMusicSlots` | Preserved by 031 | Preserved | Yes |
| `backgroundMusicLoop` | Preserved by 031 | Preserved | Yes |
| `sceneMusicAssignments` | Preserved by 031 | Preserved by blobKey | Yes |
| stale workspace version | 030 protection | 409 rejection retained | Yes |

The complete supported-field inventory is maintained in
[`TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md`](../TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md).

## Validation

`npm run verify:studioflow-033-roundtrip` passed 26/26 on 2026-10-24. It
verified:

- disposable API Studio A/B creation and cleanup;
- server preservation of Video Clips metadata and pad slots;
- server preservation of both orientation locations;
- existing Background Music fields;
- studio isolation;
- current-version update and stale-update rejection;
- invalid-value normalization and established defaults;
- authenticated Firefox UI hydration;
- orientation selection through the existing control;
- browser-side server PATCH and response round-trip;
- Studio A/B switching in both directions;
- independent Video Clips assignment restoration; and
- refresh restoration of Studio A's assignments and orientation.

Static syntax checks and `git diff --check` passed. Local Worker and room
server health were confirmed before the browser run. No real livestream or
recording was initiated.

The existing TPI-034 mutation regression and the established 020/021/027/028/
030/031/032 suites remain required release gates. They are not replaced by this
focused round-trip test.

## Release state

Feature commit, guarded production preflight, production Worker version, live
Firefox acceptance, and rollback reference will be recorded here after the
required push and guarded release complete. Until then this record is
implemented and locally verified, but not production-deployed.

