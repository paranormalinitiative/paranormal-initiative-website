# TPI-VIDEOS-010B StudioFlow Acceptance

**Classification:** READY WITH LIMITATIONS.

## Verified

- `/opt/homebrew/bin/npm run build` — PASS (TypeScript/Vite production build;
  existing large-chunk warning only).
- `npm run check:room` — PASS.
- `npm run check:rtmp` — PASS.
- Isolated browser run at `http://127.0.0.1:5183/?testMedia=1` created a
  14-second Program recording, finalized it, and returned it to Library.
- The Library card exposed a native video with `13.965s`, `1920×1080`, and
  `readyState=4`; this is direct browser playback evidence.
- The pre-broadcast checklist and Ethernet/Wi-Fi guidance rendered in the
  recording setup flow.

## Still open

Physical camera/microphone interruption and reload, native OS folder-picker
confirmation, long-duration durability, external-provider sessions, complete
owner-authenticated publication, and production playback of an authorized
creator-owned recording remain unverified. The full API E2E runner was attempted
but hung before assertions and is not counted as a pass.
