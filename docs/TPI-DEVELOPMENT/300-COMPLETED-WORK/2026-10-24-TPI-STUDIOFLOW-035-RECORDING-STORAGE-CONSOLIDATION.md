# TPI-STUDIOFLOW-035 — Right Navigation Cleanup, Teleprompter Placement, and Recording & Storage Consolidation

Date: 2026-10-24
Agent: FreeBuff / MiMO 2.6 Pro (NiMo 2.6 Pro directive assignment)
Directive: TPI-STUDIOFLOW-035
Status: COMPLETE / DEPLOYED AND LIVE-VERIFIED

## Summary

StudioFlow's right-side production workspace was cleaned up and recording and
storage management was consolidated into one authoritative section. The three
unwanted right-rail items (Live interaction, Comments, Widgets) were removed,
Teleprompter was placed directly beneath Notes and reuses the existing studio
teleprompter reader, and a first-class Recording & Storage rail section now
hosts every recording/storage setting with truthful save status and honest
destination capability reporting. Settings > Recording and Settings >
Recording & Storage now link to that section instead of keeping duplicate
controls. The investigation also found and repaired four partially connected
recording-settings persistence defects in the workspace bridge and React
activation path.

The authoritative source-to-live path was followed end to end. No production
D1 rows, R2 objects, Crossroads data, owner recordings, owner storage
destinations, or owner browser profiles were read or modified.

## Governing authority and historical review

`AGENTS.md`, the master autonomous-agent authority, the local-to-production
runbook, and `TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md` were read before any
change. Historical records for TPI-STUDIOFLOW-028 and Addendum A, 029, 030,
031, 032, 033, and 034, the Playback Contract, the Workspace Configuration
Contract, the directive index, development status, and agent handoff were
reviewed. The TPI-033 configuration persistence repairs and the TPI-034
mutation repair are preserved and re-verified by their maintained suites.

Repositories: website repository
`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website` on
`codex/tpi-development`; authoritative StudioFlow source
`/Users/toddknipple/Documents/StudioFlow/web` on its local `main`. Starting
website HEAD `c6c581a`; starting production source commit `cb38061`; starting
Worker `5c8e78b5-f920-4335-940f-a5e4d6df0e49`; starting rollback
`0c0a8660-21cf-47e1-ac66-98c91b26972c`.

## Complete settings inventory (directive §6)

Every recording/storage-related control was located and traced from the
control to its real behavior before consolidation.

| Control | Original location | State field | Functional? | Final location |
| --- | --- | --- | --- | --- |
| Record backstage automatically | Settings > Recording | `recordingPreferences.recordBackstageAutomatically` (workspace settings `recordBackstageAutomatically`) | Yes — drives backstage auto-start | Recording & Storage > Recording Configuration |
| Resume backstage recording after show ends | Settings > Recording | `recordingPreferences.resumeBackstageAfterShow` (workspace settings) | Yes | Recording & Storage > Recording Configuration |
| Save automatically after recording | Settings > Recording & Storage | `recordingStorage.saveAutomatically` (workspace settings `saveAutomatically`) | Yes — governs automatic folder copy | Recording & Storage > Recording Configuration |
| Keep a local browser backup | Settings > Recording & Storage | `recordingStorage.keepLocalBackup` (workspace settings `keepLocalBackup`) | Yes — keeps browser copy alongside folder writes | Recording & Storage > Recording Configuration |
| Recording library location (Choose Folder / Change / Restore Default) | Settings > Recording & Storage | `recordingStorage.libraryLocation`, `folderName` + IndexedDB handle | Yes — File System Access API directory handle | Recording & Storage > Local & External Storage |
| Default recording destination | Settings > Recording & Storage | `recordingStorage.recordingDestination` (workspace settings `recordingDestination`) | Yes — with pre-existing mapping defects, now repaired (below) | Recording & Storage > Save Destination |
| Save to Files / Device workflow | Settings > Recording & Storage | none (action) | Yes — opens the Library export workflow | Recording & Storage > Local & External Storage |
| Storage Information dashboard | Settings > Recording & Storage | none (read-only) | Yes — `navigator.storage.estimate()` | Recording & Storage > Local & External / Cloud Storage sections |
| Record locally for each participant | Settings > Recording | none | **No — visual placeholder** (no state, no handler, no behavior) | Not relocated; documented as a dependency (below) |
| Save backstage as separate file | Settings > Recording | `recordingPreferences.saveBackstageSeparately` (disabled checkbox) | Display of fixed behavior (backstage always finalizes its own file) | Not relocated; behavior stated in the Recording Configuration note |
| Remove temporary copy after verified save | Settings > Recording & Storage | `recordingStorage.removeTemporaryCopy` (disabled checkbox) | Intentionally disabled (temporary copies kept until migration can verify a destination) | Not relocated; documented |
| Settings > Audio (mic/speaker devices, echo cancellation, noise suppression, auto gain, mic volume, stereo placeholder) | Settings > Audio | `media.audioProcessing`, `media.micVolume` | Yes (stereo is a labeled in-development placeholder) | Unchanged — microphone processing is not recording/storage management (directive §7 rule 8). Mic volume affects the recorded program mix and remains an Audio setting. |
| Program/Backstage recording transport, backstage-allowed toggle, live stream card, RTMP summary | Right rail > Recording | recording/streaming state, `recordingPreferences` summary | Yes | Unchanged — transport/operation, not management. Its "Recording settings" button now opens Recording & Storage. |
| Workspace `settings` persistence fields | `studio/workspace-bridge.js` + API normalizer | `recordingDestination`, `keepLocalBackup`, `saveAutomatically`, `recordBackstageAutomatically`, `resumeBackstageAfterShow` | Partially — mapping defects, now repaired | Same persistence path, corrected mapping |

## Discovered disconnected settings and repairs (directive §11)

1. **Workspace save read the wrong destination field.** `stateForSave()` read
   `storage.mode || storage.destination || storage.storageMode` — none of which
   exist on `RecordingStorageSettings` — so every workspace saved
   `recordingDestination: "browser"` regardless of the chosen destination.
   **Repaired:** reads `storage.recordingDestination` first with the legacy
   names retained as fallbacks (same for `recording.storageMode`).
2. **Workspace save read backup/auto-save from the wrong storage key.**
   `keepLocalBackup` and `saveAutomatically` were read from
   `studioflow.recordingPreferences.v2`, where the React application never
   writes them (they live in `studioflow.recordingStorage.v1`), so
   `saveAutomatically` always saved as `false`. **Repaired:** read from the
   storage key first with the legacy source as fallback.
3. **Workspace hydration wrote to the wrong keys.** `applyState()` merged
   `keepLocalBackup`/`saveAutomatically` into the preferences key instead of
   the storage key. **Repaired:** each field is now patched into its owning
   key, and only when the workspace actually carries the field, so valid saved
   values are preserved and absent fields never clobber local settings.
4. **React state never re-read recording settings on Studio activation.**
   The TPI-033 orientation bug class applied to `recordingPreferences` and
   `recordingStorage`: the UI showed the previously active Studio's values and
   the next change could write them over the restored Studio. **Repaired** in
   `App.tsx`'s workspace activation bridge, mirroring the TPI-033 orientation
   re-read.
5. **"Record locally for each participant"** (Settings > Recording) is a
   visual placeholder with no state or behavior. Implementing per-participant
   recording requires significant new capture/muxing infrastructure; it was
   **not** relocated into the authoritative panel (directive §10: no
   decorative settings) and is recorded here as a dependency for a future
   directive.
6. **`removeTemporaryCopy`** remains intentionally disabled until a migration
   workflow can verify the destination and preserve a retryable original.
   **`saveBackstageSeparately`** displays the fixed behavior (backstage
   recordings always finalize as their own library file).

Note on historical workspaces: workspaces saved before this repair carry the
previously derived values (`recordingDestination: "browser"`,
`saveAutomatically: false`). They restore those faithfully and re-save with
correct values after their next save under the repaired mapping.

## Right-side navigation (directive §3–§5)

Final rail order: Banners, Media assets, Voice FX, Style, Notes, Teleprompter,
People, Private chat, Recording, Recording & Storage.

- **Removed:** Live interaction, Comments, Widgets — navigation entries and
  their now-unreachable panel JSX. Underlying state, persistence keys,
  automation, and program-output services (comment overlay state, widget
  drawing, broadcast status services) were deliberately preserved per the
  directive's "remove presentation code only when safe" rule; they remain
  inert without the removed panels and were not deleted.
- **Teleprompter beneath Notes:** the panel lists the saved scripts
  (`studioflow.teleprompterScripts`, unchanged persistence) and opens the
  **existing** `StudioTeleprompterModal` reader. No duplicate teleprompter was
  created; script content and reader settings are preserved exactly.
- **Recording & Storage:** new first-class rail section with the directive's
  conceptual structure — Recording Configuration, Save Destination, Local &
  External Storage, Cloud Storage, Save Status, Recording Information, Errors
  & Recovery. Settings > Recording and Settings > Recording & Storage now
  render redirect notices with an "Open Recording & Storage" action (which
  closes Settings and selects the rail section) instead of duplicate controls;
  saved values were preserved.

## Save status and destination management (directive §8–§9)

A truthful `RecordingSaveStatus` tracks each program/backstage recording:
`recording` → `preparing` (stopped, not yet saving) → `saving` → `saved` |
`failed`, plus `awaiting-action` when a destination decision is pending.
"Saved" is set only after the actual save operation resolves —
`saveRecordingBlob()` to IndexedDB for browser saves, or `writer.close()` plus
a byte-size integrity check for folder writes. The Save Status card names the
recording, source, **destination actually used** (including whether a Browser
Library backup was kept), file name (folder saves; browser saves state
truthfully that the name is assigned on export), size, duration, timestamp,
and any failure reason. Success/failure toasts accompany the persistent card.

Destination honesty:

- **Local Browser Storage** (IndexedDB) — fully functional; always finalizes a
  recording to protect work; checkpoints allow recovery after failures.
- **Computer Folder / External Drive** — functional through the File System
  Access API where the browser exposes `showDirectoryPicker` (Chromium
  browsers); Firefox does not, so the option is disabled with an explicit
  note. Includes per-start permission checks and a write-integrity check.
- **No silent switches:** if the folder destination is unavailable at
  recording start (missing handle, denied permission, write failure), the
  creator must explicitly approve the Local Browser Storage fallback via a
  confirm dialog; declining leaves the recording stopped in the
  **awaiting-action** state with the reason shown. The save record always
  identifies the destination actually used.
- **Cloud (Google Drive, Dropbox)** — **not implemented**; presented only as
  "Not connected" with the exact requirement (verified OAuth client,
  provider integration, resumable upload handling). No upload path exists, no
  passwords are requested or stored, and no recording leaves the device
  without explicit creator action. Implementing a provider needs owner
  direction and registered OAuth credentials — the recorded dependency.
- **iCloud Drive** — available only as a user-selected local folder where the
  browser exposes it.

Recovery: every recording is checkpointed chunk-by-chunk; failed saves keep
their chunks recoverable (studio-entry recovery prompt and Library export),
and temporary copies are only removed after a verified save.

## Files changed

Authoritative StudioFlow source (`/Users/toddknipple/Documents/StudioFlow/web`):

- `src/App.tsx` — right-rail cleanup, Teleprompter and Recording & Storage
  panels, save-status lifecycle, destination fallback confirmation, Settings
  redirect notices, workspace-activation re-read of recording settings.
- `src/styles.css` — styling for the new rail panels and save-status card.

Website repository:

- `studio/workspace-bridge.js` — repaired workspace recording-settings save
  and hydration mapping (defects 1–3 above).
- `studio/index.html`, `studio/assets/index-CbTVrNkq.js`,
  `studio/assets/index-Drf9_hF3.css` — staged authoritative build (content-
  hashed bundles; no additional cache-buster needed).
- `scripts/verify/tpi-studioflow-035-recording-storage.mjs` — maintained
  regression (new).
- `scripts/verify/tpi-studioflow-firefox-acceptance.mjs` — panel expectations
  updated for the approved rail changes (removals asserted; Teleprompter and
  Recording & Storage added; assertions on other panels unchanged).
- `package.json` — `verify:studioflow-035-recording-storage` script.

## Validation results

| Gate | Result |
| --- | --- |
| TPI-035 maintained suite (disposable Firefox, fake media devices) | 33/33 |
| TPI-033 workspace configuration round-trip | 26/26 |
| TPI-034 mutation regression (no new churn from the rail panels) | PASS (two runs) |
| TPI-021 browser interactions | 31/31 |
| TPI-021 static contracts | 86/86 |
| TPI-028 browser interactions | 33/33 |
| TPI-030 Sound Effects browser | 25/25 |
| TPI-031 Background Music pads | 34/34 |
| TPI-020 playback / video clips | 14/14 / 13/13 |
| TPI-027 contracts / TPI-031 overlays | 12/12 / 12/12 |
| Release safety | 17/17 |
| Local auth lifecycle | PASS (63 checks) |
| Local Firefox Developer Edition acceptance | 63/63 |
| Guarded live anonymous smoke | PASS |
| Guarded live Firefox acceptance (production, disposable profile) | 63/63 |
| Live artifact verification | shell/bundle/CSS 200; bundle carries the new panels |

The 035 suite covers: the three removals, Notes preservation, Teleprompter
beneath Notes, Recording & Storage visibility and exact rail order,
teleprompter reader reuse, all seven consolidated sections, honest folder
gating and cloud status, both Settings redirects and the link into the rail,
connected and persisted configuration toggles with refresh restoration, the
full save lifecycle with confirmed destination and file reporting, library
landing and IndexedDB byte storage (no silent loss), recording survival across
unrelated navigation, destination-fallback decline (awaiting-action) and
approval (fallback destination identified), and per-studio preference
isolation across real Studio switching.

Browser-test harness findings recorded for future suites: Firefox fake capture
requires `media.navigator.streams.fake`, `media.navigator.audio.fake`, and
`media.navigator.permission.disabled`; panels render only their selected rail
tab (assert against the open panel), and inline `find` callbacks must not read
`arguments` from the outer script scope.

## Release

- Application commit: `d0b1f70da86e6c5490bb89a644f07c5f50a53a1e`
- StudioFlow source commit: `60af530db1d53536975ac910b9501526c54c7600`
- Documentation commit: this synchronization commit (see directive index)
- Worker: `theparanormalinitiative`
- Deployed Worker version: `aa9bff15-6252-4ae5-9422-17d63b99ab5a` (100% traffic)
- Rollback reference: `5c8e78b5-f920-4335-940f-a5e4d6df0e49` (TPI-033 release)
- Deployment result: `DEPLOYED_AND_VERIFIED` (2026-10-24)

The guarded release ran the complete preflight (release-safety contract,
staged local assets, local auth lifecycle, isolated QA/API E2E, local Firefox
acceptance, authoritative staging verification, Cloudflare access and
rollback-readiness checks, guarded Wrangler dry-run), deployed the exact clean
pushed commit, then ran the live anonymous smoke and the isolated live Firefox
acceptance against `https://paranormalinitiative.com` before printing
`DEPLOYED_AND_VERIFIED`. The standalone acceptance runner intentionally
refuses production targets outside this guarded flow.

## Limitations and open dependencies

1. Cloud destinations (Google Drive/Dropbox) require registered OAuth
   credentials and provider upload integration; owner direction is required
   before any such infrastructure is introduced. They are presented as "Not
   connected" only.
2. Direct folder recording exists only where the browser exposes the File
   System Access API; on browsers without it the interface states the real
   limitation instead of implying filesystem access.
3. "Record locally for each participant" remains an unimplemented placeholder;
   per-participant capture/muxing is a separate infrastructure decision.
4. Save-failure handling is covered by the awaiting-action and failed states
   plus checkpoint recovery; an in-test forced save-failure injection was not
   built (the failure path shares the verified error plumbing).
5. Live acceptance is non-destructive by design and did not create production
   recordings; recording lifecycle evidence is the local disposable suite
   (33/33).
