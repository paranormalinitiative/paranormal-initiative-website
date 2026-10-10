# StudioFlow Feature Inventory

This inventory classifies 48 scoped feature rows from current source inspection. “Complete and Verified” means current-tree behavior was physically exercised in this audit; static/type checks alone do not qualify.

## Count summary

| Classification | Count |
|---|---:|
| Complete and Verified | 0 |
| Implemented but Unverified | 25 |
| Partially Implemented | 15 |
| Not Implemented | 5 |
| Deferred / Owner Decision | 3 |
| **Total** | **48** |

## Owner verification overlay — October 10, 2026

The original inventory below distinguishes current-tree implementation from the automated audit performed at that time. The owner has since directly verified these existing capabilities:

| Capability | Status | Qualification |
|---|---|---|
| Camera functionality | **OWNER VERIFIED — WORKING** | Separate from automated testing; does not verify every device/recovery edge case |
| Microphone functionality | **OWNER VERIFIED — WORKING** | Separate from automated testing; does not verify every device/recovery edge case |
| Creating a local video recording | **OWNER VERIFIED — WORKING** | Does not verify export, recovery, long-session durability, or cloud persistence |
| Live video broadcasting | **NOT YET VERIFIED** | No owner or automated live-broadcast acceptance recorded |
| Webinar functionality | **NOT YET VERIFIED** | No owner or automated webinar acceptance recorded |
| Four repaired General settings | **NOT YET VERIFIED** | Runtime verification remains required |

Owner verification does not retroactively change the historical automated-audit count above; it adds a separate evidence source.

## Implemented but unverified — 25

Home/route shell; create studio/broadcast configuration; rename/delete broadcast; camera selection/preview; microphone selection/meter; speaker selection/test; camera/microphone toggles; permission handling/device recovery; resolution/orientation; main stage/compositor; participant preview/backstage; toolbar/side panels/status; scene CRUD/order; layouts; guest invite-code/lifecycle UI; guest lobby/identity; guest mute/camera/screen/leave controls; host screen share; branding/logo/background/overlays; banners/nameplates/theme; media upload/preview/delete; program recording; backstage recording; library playback/download; notes/teleprompter.

These are supported by current source paths and state handling, but no current browser/device test was run, so they are not release-verified.

## Partially implemented — 15

Reopening an existing studio is local-browser persistence only; destination configuration is local RTMP configuration; responsive/fullscreen behavior needs physical viewport testing; remote WebRTC guest media lacks TURN and cross-network proof; host stage/remove behavior needs live guest testing; guest reconnect/network recovery is incomplete; audio/music/sound-effect mixing is present but needs output acceptance testing; intro/outro media behavior is incomplete; RTMP setup/destinations are local bridge dependent; live start/stop/status is local bridge dependent; reconnect/failure handling is partial; chat/comments/audience features are local or prototype-level; host/guest permissions persist locally but are not fully enforced by a production room service; auth/authorization is split between TPI access control and room-code capability; accessibility/responsive/performance/logging need a formal matrix.

## Not implemented — 5

Recording recovery and long-session recovery; production broadcast output path; native YouTube/Facebook/Rumble integrations; RealtimeKit frontend integration; cross-device/cloud persistence through D1/R2.

## Deferred or owner decision — 3

On-Air webinar workflow; pre-recorded streaming/scheduling; guest destinations and platform chat ingestion.

## Important qualification

The classifications describe implementation state, not percentage completion. A local prototype can have a broad interface while still lacking the transport, durability, authorization, and operational evidence required for a production creator platform.

