# StudioFlow Live Video Studio — Full Audit

Audited: October 1, 2026, against the current checkout plus the authoritative local source.

## 1. What StudioFlow Is Here

StudioFlow is a StreamYard-style live video studio for TPI members. It lives in two places:

- **Authoritative source (React/Vite/TypeScript):** `/Users/toddknipple/Documents/StudioFlow/web` — 7 commits, latest "Make StudioFlow views control program layouts" (Sep 2, 2026). Working tree clean.
- **Deployed copy (this repo):** `studio/index.html` + `studio/assets/index-CBzaWrJT.js` (~313 KB JS, ~64 KB CSS).

**Sync verified:** the deployed bundle hash (`2b91bcb3a4973c72ba87f8262881a9b8`) is byte-identical to a fresh build of the source. The deployed studio is current — no drift between source and site.

**Build health verified today:** `tsc --noEmit` passes clean, `npm run check:room` and `check:rtmp` pass, `node --check worker.js` and `node --check functions/api/[[path]].js` pass.

## 2. How Members Reach It (verified wiring)

- Member sidebar → "TPI Studio" → `/studio/` ([member-sidebar.html](member-sidebar.html)).
- [worker.js:102-119](worker.js#L102-L119) gates `/studio/*` behind a TPI member session (guest route `/studio/guest/:id` is intentionally public and unguessable; `/studio/assets/` is public so the app can load).
- Unauthenticated visitors get the branded member gate page.
- The app itself double-checks `/api/auth/me` and redirects to `member-login.html` on failure.
**Live website verification (Oct 1, 2026):** `https://paranormalinitiative.com/studio/` serves the branded member gate correctly on mobile and desktop viewports (Sign In / Create Free Account / Return links all present). `/studio` is intentionally absent from the public `sitemap.xml` — correct for a gated member app. The live route is live and pointing at the current build.

## 3. Feature-by-Feature Status

### WORKING (implemented, builds, needs physical-device testing)

| Feature | Evidence |
|---|---|
| Camera + mic capture, device enumeration, permission handling, mute/camera toggles, live mic meter | `useMediaDevices.ts` (305 lines), deployed bundle |
| Screen share via `getDisplayMedia` with ended-track handling | App.tsx `startScreenShare` |
| 8 layouts: Speaker, Two-person split, Group grid, Spotlight, Screen share, PiP, News, Cinema | layout map in App.tsx |
| Hidden 1920×1080@30fps program compositor (canvas draws camera, screen, staged guests, backgrounds, branding, comments, banners, widgets) | `canvas.captureStream(30)` at App.tsx:4173 |
| Program Recording — MediaRecorder in chunks → IndexedDB blob → Library item with thumbnail, preview, download | recorder wiring App.tsx:4240-4260, `studioflow-recordings` IndexedDB store |
| Separate Backstage Recording with auto-stop for program and optional resume | `backstageRecorderRef`, preferences |
| Local recording Library (metadata, preview URLs restored from IndexedDB on load) | `studioflow.libraryItems` + blob store |
| Logos, overlays, looping backgrounds, nameplates, banners, comments, widgets (built-in + one custom slot each for logo/background/sound/music/clip) | recent commits "Add looping backgrounds and uploaded asset deletion", "Match StreamYard stage and clip behavior" |
| Teleprompter: script library, edit, import/export, countdown, scroll, speed, size, mirror, in-studio modal | teleprompter storage keys + UI |
| Guest links UI (copy invite URL `/studio/guest/:roomId`) | App.tsx:2118 |
| Guest join page with WebRTC peer connection, connection state, BroadcastChannel + SSE signaling | App.tsx:5723-5776, room-server.mjs |
| TPI profile/headline branding ("The Paranormal Initiative") when opened in member mode | App.tsx TPI-mode effect |

### PARTIAL (real behavior, known gaps)

- **Speaker selection** — devices list, but no `setSinkId` routing and the **Test button is dead** (`<button className="ghost-button">Test</button>`, App.tsx:6669).
- **Audio processing** — "Echo cancellation" checkbox is hardcoded `checked` and never touches constraints; noise/auto-gain/stereo/mic-volume sliders are inert (App.tsx:6668-6675).
- **Recording durability** — chunks accumulate in memory (`recordingChunksRef`) and are only persisted to IndexedDB **at stop**. A tab crash or finalization failure loses the whole recording. This is the single biggest reliability gap.
- **Scenes/layouts** — 8 layouts render in preview; the plan requires proving every layout in the *recorded/live* output, not just the preview.
- **Teleprompter/persistence** — everything lives in `localStorage` of one browser. No cloud sync.

### PLACEHOLDER (visible but do nothing — honesty problem)

- Settings → General: resolution/orientation selectors are visual; output is fixed 1920×1080 landscape.
- Settings → Audio: Speaker Test, echo/noise/auto-gain, mic volume (above).
- Settings → Visual effects: background/filter controls are decorative.
- Settings → Hotkeys: read-only labels, **no keyboard handlers exist** (zero `addEventListener("keydown")` in source).
- Settings → Guests: StreamYard-style switches not connected to any room permissions.
- **Google Drive upload:** `VITE_GOOGLE_CLIENT_ID` is an **empty string** in source (`const eh=""`), so `th()` always returns false and every upload attempt correctly errors "Google Drive is not configured." Code is real; config was never supplied.
- Comments widget: manual local test comments only.
- Private chat: localStorage host-only; guests never receive messages.
- On-Air webinar card: no workflow behind it.

### NOT PRODUCTION-READY

- **Remote guests** — same-browser fallback (BroadcastChannel), `localhost:8788` room server, public STUN. Fine for dev; nothing remote.
- **Livestreaming** — RTMP bridge is hardwired to `http://127.0.0.1:8787` (App.tsx:4323, 2604) and shells out to local `ffmpeg`. It cannot run in a browser-only production deployment at all.
- **Cloud persistence** — zero `/api/studio`, R2, or D1 calls in the entire frontend (grep-verified). Home shows "Unlimited" storage, which is false.

### BACKEND: SCAFFOLDED BUT UNCALLED

The website backend is **ahead** of the frontend:

- [migrations/0023_studioflow_realtimekit.sql](migrations/0023_studioflow_realtimekit.sql) — `studio_rooms` table with host/broadcast unique index. Status of its application to production D1: **unverified**.
- [functions/api/[[path]].js:78-83](functions/api/[[path]].js#L78-L83) — full route surface: create room, guest-token, close, livestream start/stop, all RealtimeKit-API-backed with proper secrets gating via `assertRealtimeKitConfigured` (requires `CLOUDFLARE_ACCOUNT_ID`, `REALTIMEKIT_APP_ID`, `REALTIMEKIT_API_TOKEN`, `REALTIMEKIT_HOST_PRESET`, `REALTIMEKIT_GUEST_PRESET`).
- Host token refresh, guest invite validation, room ownership checks, and RTMP-or-Cloudflare livestream modes are all correctly structured.

**But the frontend never calls any of it.** There are zero RealtimeKit references in App.tsx (grep-verified) and no `@cloudflare/realtimekit` in package.json. The guest flow still fetches `http://<hostname>:8788/api/rooms/...` — dead on production.

### HYGIENE FINDING

`dist/worker.js` in this repo is a stale Jul 25 build artifact that does **not** contain the StudioFlow handlers. It is not what Cloudflare runs (wrangler bundles `worker.js` + `functions/` fresh), but it will confuse future audits — regenerate or delete it.

## 4. UI Direction: StreamYard Parity First (locked Oct 1, 2026)

Per Todd: StudioFlow follows the StreamYard UI (streamyard.com, First Steps guide) until everything works like StreamYard. Then keep the best parts for StudioFlow's own workflow and remove the rest. Practical implications for the build order:

- When adding or finishing any feature, match StreamYard's placement and flow for it (stage, left participants/backstage rail, right Brand/Destinations/Comments/Chat panels, bottom action bar) instead of inventing new UI.
- The existing 8 StudioFlow layouts, compositor, and TPI branding stay — parity is about workflow and control placement, not cloning their visual identity.
- Placeholder/honesty cleanup and A1 recording work should move controls toward StreamYard positions where they differ, so the cleanup is not redone later.

## 5. The One-Sentence Verdict

StudioFlow is a genuinely strong **local single-host production studio** (camera → compositor → branded program recording → library) with an honest placeholder layer, but it is **not a live studio**: no production guests, no real streaming, no cloud persistence, and its polished backend waits unused.

## 6. What Needs Completing (priority order, from the plan + this audit)

1. **A1 — Make host-only recording dependable** (do first; everything else waits)
   - Persist chunks during the session, add preparing/finalized/recoverable states, and incomplete-session recovery.
   - Wire real resolution/orientation + audio settings, or delete them.
   - Navigation/exit guard while recording.
   - Prove all 8 layouts and every overlay asset in the *saved file*, then the 30-minute host-only test.
2. **Make the interface honest** — remove or disable: webinar card, "Unlimited" storage, Google Drive (or supply the client ID), fake platform connections, hotkeys/guests/effects panels.
3. **A2 — RealtimeKit guests** (backend is ready and waiting)
   - Add the RealtimeKit client SDK; point room creation at `POST /api/studio/rooms` and guest join at the guest-token endpoint (replacing `localhost:8788`).
   - Confirm migration 0023 is applied to production D1; configure the RealtimeKit app, presets, and secrets; then the two-network host+tablet test.
4. **A3 — Program-accurate livestreaming** — prototype `canvas.captureStream()` + mixed program audio as the published feed (the only viable path now that localhost FFmpeg is ruled out), then Custom RTMP, then private/unlisted destination tests.
5. **A4/A5 — R2/D1 persistence, upload retry, recovery, and the full physical test matrix.**

## 7. What You Can Safely Test Today

The host-only path in [STUDIOFLOW_READINESS_AUDIT.md](STUDIOFLOW_READINESS_AUDIT.md) ("What Todd Can Safely Test Now") remains accurate: sign in → `/studio/` → connect camera/mic → place yourself on stage → add logo/banner → brief screen share → sound effect + music → Program Recording 2–3 min → two layout changes → stop → Library playback + download. Do **not** use Go live, guest invitations, webinar, or Drive as production features.
