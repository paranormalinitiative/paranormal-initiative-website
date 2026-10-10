# StudioFlow Backend Architecture

## Current components

### Canonical frontend

`/Users/toddknipple/Documents/StudioFlow/web` is a React/Vite application. `src/App.tsx` owns route-level state, local persistence, studio controls, WebRTC orchestration, compositor state, recording, and local export. `src/useMediaDevices.ts` owns device acquisition, permissions, meters, screen capture, and device recovery helpers.

### Local development services

`server/room-server.mjs` provides an in-memory room/presence/signaling service using SSE, room codes, and permissive CORS. `server/rtmp-bridge.mjs` accepts WebM chunks and shells out to local `ffmpeg`; its current dirty source supports multiple RTMP outputs from one process. Both are development/local services, not production infrastructure.

### TPI edge/API layer

`functions/api/[[path]].js` contains the D1-backed room relay and a RealtimeKit server-side scaffold. It exposes room-code lookup/close, guest presence, signaling, room status, and RealtimeKit room/guest/livestream routes. `worker.js` serves the TPI Studio route and public guest/assets routes. Owner/admin access gates the private Studio host area; guest links are handled separately.

### Data model

Migration `0023_studioflow_realtimekit.sql` creates `studio_rooms` with host/broadcast identifiers, RealtimeKit meeting/participant/token fields, and livestream fields. Migration `0024_studioflow_invite_codes.sql` creates `studio_room_codes`. The frontend does not currently use D1/R2 for its studio configuration, recordings, or media assets.

## Request and media topology

The production-oriented room relay carries presence and signaling metadata, not media. Current guest media is intended to flow peer-to-peer over WebRTC. The local development path uses the Node room server; the production path uses same-origin TPI API relay and polling/SSE-style signaling mechanisms. The source contains no production RealtimeKit client SDK integration.

## Security/readiness finding

The low-level room relay is intentionally code-capability based, but the current API review found a high-priority authorization concern requiring owner-approved remediation: `POST /room-codes/current/close` appears to have no auth guard, while guest presence/signaling routes accept room identifiers without a signed capability beyond the room-code flow. An actor able to reach those endpoints may be able to overwrite guest state/signals or close the current show. This was a static finding; no live exploit test was performed. It should be treated as a P1 production-readiness issue pending careful reproduction and fix design.

## Architecture conclusion

The project has both a local prototype backend and a partially prepared edge/backend integration. They are not yet one coherent production architecture because frontend transport, durable state, broadcast egress, authorization, and operational recovery remain split across local services, browser state, and incomplete TPI routes.

