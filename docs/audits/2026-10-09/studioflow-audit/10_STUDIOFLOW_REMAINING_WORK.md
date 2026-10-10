# StudioFlow Remaining Work

## Highest-priority work

### 1. Establish a truthful release boundary

Remove or clearly mark controls that are decorative, local-only, development-only, or not enforced. Document exactly what the first release supports. Resolve the security review of room-code close, presence, and signaling before exposing those paths broadly.

### 2. Make host recording durable

Define chunk checkpointing, resumable/finalizable recording, crash recovery, quota behavior, long-session limits, export validation, and cleanup. Add acceptance tests for a normal recording, interrupted tab, browser restart, storage pressure, and failed finalization.

### 3. Choose production guest transport

Either complete RealtimeKit frontend integration or deliberately harden the WebRTC path with TURN, signaling authorization, lifecycle state, reconnect, admission, stage/remove, and cross-network tests. The current STUN-only path is insufficient as a production guarantee.

### 4. Replace localhost broadcast dependency

Define the production program-output architecture, destination secret handling, egress location, bitrate/codec policy, start/stop state, retries, backpressure, and operator-visible failures. Verify one private/custom destination before adding native integrations.

### 5. Add cloud persistence

Model ownership and persistence for studios, scenes, broadcasts, destinations, media assets, recordings, notes, and retention. Use D1 for metadata and R2 or an equivalent durable blob store for media/recordings, with signed access and deletion semantics.

## Secondary work

- Complete comments/private chat/audience semantics.
- Finish scene/output acceptance and reusable studio behavior.
- Decide whether participant-isolated recordings are in scope.
- Finish visual effects only if they remain a product priority.
- Add native destinations only after production egress is stable.
- Decide on webinar, scheduled/pre-recorded, guest-destination, and platform-chat scope.
- Add monitoring, structured logging, privacy/retention documentation, and support diagnostics.

## What not to prioritize yet

More decorative panels, additional branding skins, or visual imitation of StreamYard do not close the current production gaps. Infrastructure, durability, authorization, and verification are the critical path.

