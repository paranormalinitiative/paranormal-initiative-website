# StudioFlow Master TODO

**Last updated:** October 1, 2026
**This file controls all StudioFlow work.** Work top-to-bottom by phase. Check items off only when their acceptance criteria are met and physically tested where noted. Update the "Where We Are" status line every session.

**How to use this file:**
- `- [ ]` = not started · `- [x]` = done (with date) · `▶ IN PROGRESS:` prefix = active
- Every completed item gets a date and a one-line proof note (what was tested, where).
- New discoveries get added under the phase they belong to, not a separate list.
- The full technical audit backing this file is [STUDIOFLOW_FULL_AUDIT.md](STUDIOFLOW_FULL_AUDIT.md). The original phased plan is [TPI_STUDIOFLOW_AND_SITE_REBUILD_PLAN.md](TPI_STUDIOFLOW_AND_SITE_REBUILD_PLAN.md) (Workstream A only — Workstream B site rebuild is **cancelled**, the website is done and good).

---

## Where We Are (status snapshot)

**Date: Oct 1, 2026 — Phase 0 ✅ complete (deployed). Phase 1 next, as BUILD work (direction corrected: nothing gets removed — every control gets built until it works).**

- **Source of truth:** `/Users/toddknipple/Documents/StudioFlow/web` — React/Vite/TS, latest commit `130275c` "Make StudioFlow views control program layouts" (Sep 2, 2026), working tree clean. Never edit compiled `studio/` files directly; build there, copy `dist/` output here.
- **Deployed:** `studio/` in this repo → live at `https://paranormalinitiative.com/studio/`. Verified byte-identical to source build (hash `2b91bcb3a4973c72ba87f8262881a9b8`).
- **Build health:** `tsc --noEmit`, `check:room`, `check:rtmp`, `node --check worker.js`, `node --check "functions/api/[[path]].js"` — all passing.
- **Backend:** RealtimeKit room/livestream API is fully scaffolded in `functions/api/[[path]].js` + migration `0023` — **frontend has never called it** (zero RealtimeKit references in source).
- **The honest one-liner:** a strong local host-only recording studio with placeholder controls, waiting on: real guests, real streaming, durable recording, and cloud persistence.

---

## Ground Rules (locked — do not relitigate)

1. **The website is done.** No site rebuild, no information-architecture work. StudioFlow only.
2. **StreamYard is the UI parity target** (streamyard.com, [First Steps guide](https://support.streamyard.com/hc/en-us/articles/360043291252-First-Steps)): match its flows and control placement — Home broadcast cards, Setup check, Studio with stage + left participants/backstage rail + right Brand/Destinations/Comments/Chat panels + bottom action bar. Don't invent divergent UI before parity. When a feature reaches parity and works, **keep only what earns its place for StudioFlow and remove the rest**. TPI branding + evidence-aware tone stay.
3. `/Users/toddknipple/Documents/StudioFlow/web` is source. `studio/` here is build output only.
4. Local recording must survive a livestream disconnect, tab crash, and finalization failure.
5. Backstage recordings never enter public program output.
6. Guests join through a browser link and install nothing.
7. **A green build is not completion.** Every feature needs a physical browser test before its box gets checked.
8. Keep it evidence-aware; no paranormal claims presented as proof.
9. **Owner-only during build.** `/studio` is restricted to Todd Wayne's owner account until guest rooms are in testing (revisit at Phase 3). No other members see the studio yet.
10. **No trial/limited features.** Everything in StudioFlow is fully functioning with no limits — no watermarks, caps, locked tiers, or "upgrade to unlock."
11. **Every session ends with commit → push → Cloudflare deploy** so Todd can test live as we go. Wrangler is authenticated (`paranormalsomerset@gmail.com` / paranormalinitiative.com).
12. **Never remove UI.** Every card, panel, button, and setting in StudioFlow is a feature in development — placeholders are things needing completed, not things needing deleted. The only exceptions are explicit Todd decisions. When unsure, ask, don't remove.

---

## Phase 0 — Housekeeping (quick wins)

- [x] **Delete stale `dist/` (Jul 25 worker artifact)** — Oct 1, 2026. Removed; worker bundles fresh from `worker.js` + `functions/` at deploy.
- [x] **Wire `live-video.html` + `podcast.html` launch buttons** to `/studio/?mode=live` and `/studio/?mode=podcast` — Oct 1, 2026. Buttons now "Launch Live Studio" / "Launch Podcast Studio"; access note says private build testing.
- [x] **Add `/studio` to `robots.txt` Disallow list** — Oct 1, 2026.
- [x] **Apply migration `0023_studioflow_realtimekit.sql` to production D1** — Oct 1, 2026. It was **never applied** (verified via wrangler); applied with `wrangler d1 execute --remote`, verified `studio_rooms` table now exists.
- [x] **Owner-only studio gate** — Oct 1, 2026. `worker.js` now requires `user.role === "owner"` for all `/studio/*`; everyone else (including signed-in non-owner members) gets the gate page reading "StudioFlow is in private build testing and is not open to member access yet." asset requests get bare 403. Revisit at Phase 3.
- [x] **Internal build .md files removed from public site assets** — Oct 1, 2026. Added all internal plan/audit/TODO docs to `.assetsignore` (they were publicly downloadable before).

---

## Phase 1 — Make Everything Real (build out every control — nothing gets removed)

**Direction from Todd (Oct 1, 2026): do not remove anything.** The webinar card, YouTube/Facebook/Rumble destinations, Drive upload, hotkeys, visual effects, guest settings — all of it stays and gets built until it fully works. Phase 1 = wire every currently-fake control to real behavior.

- [ ] **Build the "On-Air webinar" flow** — the creation card stays; give it a real workflow (private webinar room with guests via Phase 3 RealtimeKit, no public broadcast). *AC: creating a webinar and hosting one end to end works.*
- [ ] **Google Drive upload works for real** — the code exists; supply and set `VITE_GOOGLE_CLIENT_ID`, test a real upload, fix whatever breaks. *AC: a library recording uploads to Drive and plays back from Drive.*
- [ ] **Destinations become real** — keep YouTube/Facebook/Rumble/Custom RTMP cards; make each destination verifiable (via Phase 4 livestream work: real RTMP presets per platform, private/unlisted test instructions, saved per-destination settings). *AC: each destination can be configured and pass a private test when Phase 4 lands.*
- [ ] **Settings → General: real resolution/orientation** — *Batch 1 done Oct 1: selectors now drive the actual program compositor (720p/1080p/4K-beta × landscape/portrait), persisted, with a real resolution badge drawn on stage. Remaining: physical test that a 720p choice produces a 720p file and portrait renders portrait.*
- [ ] **Settings → General checkboxes become real:** *Batch 1: resolution badge is real. Remaining: informative messages, shift-videos-for-comments, audio avatars, auto-add presented media — connect each to compositor/UI behavior.*
- [ ] **Settings → Audio: full audio processing** — *Batch 1 done Oct 1: echo cancellation / noise suppression / auto gain now drive real getUserMedia constraints (re-acquires on change), mic volume scales the program mic gain node (0–200%), Speaker Test plays a 440Hz tone through setSinkId to the selected output. Remaining: physical audio test.*
- [ ] **Settings → Visual effects: real processing** — not started. Backgrounds/filters/sliders become real canvas/WebGL processing on the camera feed.
- [ ] **Settings → Hotkeys: real shortcuts** — *Batch 1 done Oct 1: mute CMD+D, camera CMD+E, screen share SHIFT+S, record start CMD+SHIFT+R, stop CMD+SHIFT+X, speaker layout SHIFT+1, group layout SHIFT+3, cycle layout L — all live in-studio with typing-target guard. Remaining: editable rebinding + conflict handling + physical test.*
- [ ] **Settings → Guests: real permissions** — *Batch 1 done Oct 1: all five switches persist to localStorage under `studioflow.guestPermissionSettings`, ready for the Phase 3 room layer to enforce. Remaining: enforcement when guests exist.*
- [ ] **Settings → Camera: real resolution + firewall mode** — *Batch 1: resolution selector now drives real camera constraints (720p/1080p). Firewall mode is honestly labeled "in development" pending Phase 3 relay policy.*
- [ ] **Make storage display real** — *Batch 1 done Oct 1: Home now shows real `navigator.storage.estimate()` usage + quota, refreshed every 30s. Extends to cloud usage in Phase 5.*
- [ ] **Comments widget: real comments** — currently manual host-only test comments; build toward real platform comment ingestion (YouTube/Facebook Live comments) in a later phase; until then keep it functional as manual comments and label the platform integration as in development. *AC: manual comments work fully; roadmap label visible.*
- [ ] **Private chat: real room chat** — build real host↔guest chat through the Phase 3 room layer (messages delivered to guests, persisted per session). Until guests exist it remains host-side; do not strip it. *AC: host and a guest exchange messages in a live room.*
- [ ] **Gate-page title nit** — production gate page still says "StudioFlow — Member Access"; adjust wording to fit the private-build state. *AC: gate copy matches private-build status.*

---

## Phase 2 — Durable Recording (A1 — the core; do before guests)

The single biggest reliability gap: recording chunks live in memory until stop; a crash loses everything.

- [ ] **Persist chunks to IndexedDB as they arrive** — write each `ondataavailable` blob to `studioflow-recordings` during the session, not just at stop. *AC: kill the tab mid-recording; the chunks up to that moment are recoverable.*
- [ ] **Explicit recording states** — idle / preparing / recording / stopping / finalized / recoverable failure / unrecoverable failure, each visible in the UI. *AC: every state observable in a real recording.*
- [ ] **Incomplete-session recovery** — on app load, detect orphaned chunk sets and offer "Recover recording" → finalize into Library or discard. *AC: crash → reload → recovery prompt → playable file.*
- [ ] **Navigation/exit protection** — `beforeunload` warning + in-app route guard while recording. *AC: closing/refreshing tab mid-recording warns and never silently loses everything.*
- [ ] **Wire real audio into program output** — intro/outro clip audio, sound effects, music at controlled levels must be audible in the saved file. *AC: short test recording contains each at sensible levels.*
- [ ] **Truthful file labels** — resolution/file-type readouts match actual output. *AC: a 1080p WebM says so; no false labels.*
- [ ] **Verify all 8 layouts in the SAVED FILE** (Speaker, Two-person split, Group grid, Spotlight, Screen share, PiP, News, Cinema) — preview parity, not just visible preview. *AC: each layout appears correctly in a saved recording.*
- [ ] **Verify every output-visible asset in the saved file:** logo, overlays, backgrounds, nameplates, banners, comments, widgets, intro/outro, screen share. *AC: each appears exactly as previewed.*
- [ ] **Keep Backstage Recording separate from Program** through all of the above. *AC: backstage content never in program file.*
- [ ] **2-minute acceptance test** (from readiness audit: camera, mic, screen share, logo, banner, sfx, music, 2 layout changes → playback + download outside the app). *AC: passes in Chrome; note browser/device.*
- [ ] **30-minute host-only acceptance test.** *AC: full-length file, synced audio, no missing segments; note file size + browser.*

---

## Phase 3 — RealtimeKit Guest Rooms (A2 — backend is ready and waiting)

- [ ] **Add RealtimeKit client SDK** to StudioFlow source. *AC: SDK in package.json + working host join in dev.*
- [ ] **Host room creation → `POST /api/studio/rooms`** (replaces localhost room server for room identity). *AC: room appears in D1 `studio_rooms` on create; reuse path returns same room.*
- [ ] **Guest join → `POST /api/studio/rooms/:id/guest-token`** (replaces `http://<host>:8788` signaling). *AC: invite link opens guest setup from another device; invalid/closed room rejected.*
- [ ] **Publish/subscribe camera, mic, and screen-share tracks.** *AC: two-way media between host and guest.*
- [ ] **Real guest connection states** — joining / backstage / connected / reconnecting / failed / left, in the participants rail (StreamYard position). *AC: each state observed live.*
- [ ] **Host stage controls** — add-to-stage, remove-from-stage (guest stays in room), remove-from-room. *AC: all three work from the rail.*
- [ ] **Guest-side controls** — mute, camera toggle, device change, leave, reconnect. *AC: each works for the guest.*
- [ ] **Speaker-output routing** (`setSinkId` where supported) + no echo/duplicate monitoring on host. *AC: guest audio routes to chosen output; no echo loop.*
- [ ] **Room lifecycle** — enforce guest limit (UI + backend), close expired rooms, reject closed-room tokens. *AC: limits enforced end to end.*
- [ ] **Deploy RealtimeKit secrets** as Worker secrets (never in source/docs): `CLOUDFLARE_ACCOUNT_ID`, `REALTIMEKIT_APP_ID`, `REALTIMEKIT_API_TOKEN`, `REALTIMEKIT_HOST_PRESET`, `REALTIMEKIT_GUEST_PRESET`. Configure host/guest presets in the RealtimeKit app. *AC: handlers stop returning "not configured" on production.*
- [ ] **Two-network acceptance test:** MacBook host + tablet/second computer on a different network via live invite URL — full camera/mic/screen-share/backstage/stage-control/leave/reconnect cycle. *AC: passes; devices + networks recorded.*

---

## Phase 4 — Program-Accurate Livestreaming (A3)

First decision to prove by prototype (localhost FFmpeg bridge is a dead end for production):
- [ ] **Prototype A: publish compositor `canvas.captureStream()` video + mixed program audio as the live feed** via RealtimeKit. *(Expected winner — browser-native, already matches Program output.)*
- [ ] Prototype B only if A fails fidelity/stability: hosted RTMP encoder receiving the exact composite feed. *AC: chosen path proven on fidelity, stability, latency, platform compat — decision recorded here: ___________.*

Then:
- [ ] **Start/stop live session from StudioFlow** → backend livestream start/stop endpoints. *AC: RTMP URL reaches the platform; start/stop reflect on the destination.*
- [ ] **Live states + health** — preparing / live / reconnecting / failed / ended, elapsed time, meaningful stream health. *AC: each state observed.*
- [ ] **Local recording survives stream interruption** (Ground Rule 4). *AC: force-drop the stream mid-broadcast; local Program Recording stays complete.*
- [ ] **Prevent double starts and orphaned live sessions.** *AC: rapid double-click and abandoned sessions handled.*
- [ ] **Custom RTMP first**, then private/unlisted YouTube, Facebook, Rumble tests. Stream keys never in logs or diagnostics. *AC: each destination verified via private/unlisted test.*
- [ ] **Live output parity** — staged guests, selected layout, screen share, logos, overlays, banners, widgets, intro/outro, effects, audio mix all present in the live feed exactly as in Program. *AC: side-by-side comparison recorded.*
- [ ] **30-minute private/unlisted livestream acceptance test** with one remote guest, screen share, layout changes, overlays, music, simultaneous local recording, and one forced interruption. *AC: passes; local recording intact.*

---

## Phase 5 — Cloud Persistence, Library & Recovery (A4)

- [ ] **Reusable studio scenes + branding → D1** (persist across browsers/devices). *AC: create studio, reopen from another browser, scenes/assets restored.*
- [ ] **Media libraries → R2** — logos, overlays, backgrounds, clips, sounds, music (multi-item, not single custom slots). *AC: upload, reuse, delete; records in D1, binaries in R2.*
- [ ] **Teleprompter scripts + show notes → D1** where appropriate. *AC: scripts survive browser change.*
- [ ] **Finalized recordings → R2 upload after local finalization succeeds** — keep local copy, show upload state, retry interrupted uploads without duplicating records. *AC: upload → replay from cloud → download; one forced-interrupt retry clean.*
- [ ] **Storage limits, cleanup rules, explicit destructive confirmations.** *AC: deletion requires confirmation; limits surfaced in UI.*
- [ ] **Replace "Unlimited" with real usage** (local + cloud). *AC: numbers truthful.* (If Phase 1 already fixed local display, this extends it to cloud.)

---

## Phase 6 — Full Physical Test Matrix (A5)

Record browser, OS, device, and network for every line. Nothing ships unchecked.

- [ ] Host: current Safari **and** Chrome on the MacBook Pro
- [ ] Guest: tablet Safari + a second desktop browser
- [ ] Same network **and** different networks
- [ ] Camera/mic permission denied, then recovered
- [ ] Device unplug/replug during setup **and** during a session
- [ ] Guest joins late, leaves, reconnects
- [ ] Guest screen share start/stop
- [ ] Host removes guest from stage and from room
- [ ] 30-minute recording (repeat from Phase 2 on final build)
- [ ] 30-minute private livestream + simultaneous local recording (final build)
- [ ] Network interruption while live
- [ ] Browser refresh/close warning while recording
- [ ] Library playback + download on all tested browsers
- [ ] Mobile/tablet guest layout at real viewport sizes
- [ ] Login validity across Safari/Chrome/tablet sessions

---

## Known Bugs & Fixes (found in audit — fold into phases above)

| # | Issue | Location | Phase |
|---|---|---|---|
| 1 | Recording chunks in memory only; crash loses recording | `App.tsx` recorder (`recordingChunksRef`) | 2 |
| 2 | Speaker "Test" button does nothing | `App.tsx` ~L6669 | 1 |
| 3 | "Echo cancellation" checkbox hardcoded, never touches constraints | `App.tsx` ~L6668 | 1 |
| 4 | Noise/auto-gain/stereo/mic-volume controls inert | Settings → Audio | 1 |
| 5 | Hotkeys panel has no keyboard handlers at all | Settings → Hotkeys | 1 |
| 6 | Google Drive always errors (`VITE_GOOGLE_CLIENT_ID` = empty string) | `googleDrive.ts` / env | 1 |
| 7 | Home claims "Unlimited" storage | Home page | 1 |
| 8 | RTMP bridge hardcoded to `127.0.0.1:8787` — production dead end | `App.tsx` L2604/L4323, `rtmp-bridge.mjs` | 4 |
| 9 | Room signaling hardcoded to `:8788` localhost server | `App.tsx` L463-465, `room-server.mjs` | 3 |
| 10 | Zero RealtimeKit references in frontend — backend never called | whole frontend | 3 |
| 11 | Stale `dist/worker.js` (Jul 25) missing studio handlers | repo root | 0 |
| 12 | Resolution/orientation selectors decorative; output fixed 1080p | Settings → General | 1 |
| 13 | Webinar card advertises nothing that exists | Home | 1 |
| 14 | Private chat is localStorage host-only; guests see nothing | chat widget | 1 (build real chat) → 3 (room layer) |
| 15 | Comments widget is manual test comments only | comments widget | 1 (works manually; platform ingestion later) |

---

## Definition of Done (all must be true)

1. Every visible control performs its stated action (no placeholders anywhere).
2. 30-min host-only recording: correct video, synchronized mixed audio, all assets/layouts in the file.
3. Remote guest from another device + network: full join/backstage/stage/leave/reconnect cycle.
4. 30-min private/unlisted livestream matching Program output exactly, with simultaneous local recording.
5. Forced stream interruption: local recording intact.
6. Cloud persistence: scenes/assets/recordings survive browser close; interrupted upload recovers.
7. Full Phase 6 matrix passes with recorded results.
8. Deployed site matches the tested local build (hash-verified like the Oct 1 audit).

---

## Session Log (append every working session)

- **Oct 1, 2026** — Full audit completed ([STUDIOFLOW_FULL_AUDIT.md](STUDIOFLOW_FULL_AUDIT.md)). Verified: deployed bundle matches source, all builds green, live `/studio/` gate working on production. Locked: StreamYard parity as UI target; site rebuild cancelled. Created this master TODO. Next: Phase 0 + Phase 1.
- **Oct 1, 2026 (session 2)** — Phase 0 complete: owner-only gate in `worker.js`, launch buttons wired, robots.txt updated, migration 0023 applied to production D1 (was missing), stale `dist/` removed, internal .md files excluded from public assets. New ground rules locked: owner-only access during build, fully-functioning-no-limits, commit/push/deploy every session. Committed, pushed, deployed to Cloudflare. Next: Phase 1 honesty pass.
- **Oct 1, 2026 (session 3)** — **Direction corrected by Todd: DO NOT REMOVE ANY UI.** All cards/panels/settings are features in development; Phase 1 rewritten from "honesty pass (remove or fake-label)" to "Make Everything Real (build out every control)." No StudioFlow UI had been edited yet, so nothing to revert. Ground rule 12 added. Phase 1 build not yet started.
- **Oct 1, 2026 (session 4)** — Phase 1 batch 1 built, committed (`ff54671`), pushed, deployed (version `262f72b0`): real audio processing constraints + mic volume in program mix + working Speaker Test tone, real hotkeys (8 bindings live), real program resolution/orientation driving the compositor + resolution badge, real camera resolution, persisted guest permission settings, real local-storage usage display. **Build only — not physically tested yet. Todd to test live:** Settings → Audio toggles change mic behavior, Speaker Test plays tone, mic volume slider changes recording loudness, hotkeys fire in studio (not while typing), General 720p/portrait changes output, storage shows real number. Gate page title nit still open.
