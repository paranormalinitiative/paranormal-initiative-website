# TPI StudioFlow and Website Rebuild Plan

Last updated: September 1, 2026

## Purpose

Finish StudioFlow as a dependable recording and live-production studio, then reorganize The Paranormal Initiative into a visually coherent public website, member community, and application platform.

This is the current master plan. Older project plans remain useful history, but this document controls the order of work and the definition of “finished.”

## The Outcome We Are Building

TPI should have three clearly separated experiences:

1. **Public website** — an atmospheric, evidence-aware introduction to TPI, its research, education, investigations, videos, applications, and free community.
2. **Member community** — profiles, feed, forums, messenger, rooms, notifications, and member activity.
3. **Working applications** — StudioFlow, ITC Visual Studio, research tools, repositories, and administrative systems.

The public site should explain the organization before exposing its machinery. Member and administrative controls should not dominate the public experience.

## Current Reality

### StudioFlow frontend

Authoritative source:

```text
/Users/toddknipple/Documents/StudioFlow/web
```

Deployment output:

```text
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/studio
```

The source already contains a large StreamYard-inspired React/Vite interface, local media capture, screen sharing, a compositor, local Program and Backstage recording, media assets, layouts, banners, widgets, notes, teleprompter features, a local guest-room proof of concept, and a local FFmpeg RTMP bridge.

It is **not production complete**:

- Remote guests depend on a local signaling proof of concept and same-browser fallback.
- There is no production TURN/room transport in the frontend.
- The frontend does not currently include or connect to Cloudflare RealtimeKit.
- Livestreaming depends on a locally running FFmpeg bridge.
- Many settings are visual or only partially connected.
- Recording recovery, long-session reliability, browser/device testing, and cloud persistence are incomplete.
- The program output must be proven to include the exact selected layout, guests, screen share, audio mix, logo, overlays, banners, widgets, intro/outro media, and music.

### TPI website backend

The website repository already contains:

- `migrations/0023_studioflow_realtimekit.sql`
- Studio room, guest-token, room-close, livestream-start, and livestream-stop API scaffolding in `functions/api/[[path]].js`
- Private host routing and a public guest invitation route in `worker.js`

This backend scaffold is ahead of the authoritative StudioFlow frontend. It is not proof that remote guest rooms or livestreaming work. The migration, Cloudflare application, presets, secrets, frontend SDK integration, deployment, and real remote tests must all be completed.

### TPI public and member site

The site contains valuable research, education, applications, community systems, publishing tools, and member features, but they grew without one information architecture or visual system. Broad subjects, specialist methods, content formats, applications, and account tools often compete at the same level.

The redesign must consolidate rather than merely restyle this complexity.

## Locked Decisions

1. Finish StudioFlow before beginning a broad visual rebuild of the public website.
2. Preserve the existing StudioFlow visual direction unless a usability defect requires a focused change.
3. Treat `/Users/toddknipple/Documents/StudioFlow/web` as source. Never edit compiled `studio/` files as source.
4. Local recording must continue if livestreaming disconnects.
5. Backstage recordings must never enter the public program output.
6. Guests join through a browser link and install nothing.
7. A green build is not completion. Physical-browser, two-device, audio, recording, and livestream tests are required.
8. Do not migrate the whole website to Next.js during the repair. The visual and structural redesign can be completed on the current Cloudflare stack. Re-platforming is a later, separate decision supported by evidence.
9. Keep TPI evidence-aware. Do not present paranormal claims, EVP, or ITC results as established proof.

---

# Workstream A — Finish StudioFlow

## A0. Establish a Truthful Baseline

Deliverables:

- Inventory every visible StudioFlow control as **working**, **partially working**, **placeholder**, or **obsolete**.
- Remove or clearly disable controls that cannot yet perform their stated action.
- Run TypeScript/build, room-server, and RTMP-bridge checks from the authoritative source.
- Capture desktop and tablet screenshots of Home, Setup, Studio, Guest Join, Settings, Destinations, and Library.
- Record the browser, operating system, camera, microphone, and speaker used for each physical test.

Exit gate:

- One current readiness table exists and no feature is called complete without a reproducible test.

## A1. Production-Quality Finished Video Recording

This phase comes before remote guests and livestreaming.

Deliverables:

- Make all recording states explicit: idle, preparing, recording, stopping, finalized, recoverable failure, and unrecoverable failure.
- Persist recording chunks during the session so a tab or finalization failure does not destroy the entire recording.
- Verify 720p and 1080p output choices and landscape/portrait orientation where offered.
- Verify camera, microphone, screen sharing, speaker monitoring, mic gain, echo cancellation, noise suppression, and device switching.
- Mix all intended program audio: host, staged guests when available, screen audio when browser permission allows it, intro/outro clips, sound effects, and music.
- Verify every supported layout in the hidden compositor—not only in the visible preview.
- Verify logos, overlays, backgrounds, nameplates, banners, comments, widgets, intro/outro video, and screen sharing appear in the saved file exactly as previewed.
- Keep backstage output separate from Program Recording.
- Save playable files and correct metadata to Library.
- Provide download/export with truthful file type and resolution labels.
- Add an active-recording navigation warning and safe studio-exit finalization.
- Remove settings that do nothing or connect them to real behavior.

Exit gate:

- Record and play back a 30-minute host-only production containing camera, screen share, intro, outro, music, banner, logo, and at least two layout changes with synchronized audio and no missing segments.

## A2. Cloudflare RealtimeKit Guest Rooms

Deliverables:

- Add the supported Cloudflare RealtimeKit client SDK to the StudioFlow frontend.
- Connect host room creation to `POST /api/studio/rooms`.
- Connect public guest invitations to the guest-token API.
- Join the host and guests to the same production room.
- Publish and subscribe to camera, microphone, and screen-share tracks.
- Display real guest connection state: joining, backstage, connected, reconnecting, failed, and left.
- Allow the host to add and remove each guest from the program stage without disconnecting them.
- Allow the host to remove a guest from the room.
- Support guest mute/camera controls, device changes, leave, and reconnection.
- Implement actual speaker-output routing where the browser supports it.
- Prevent echo and duplicate monitoring on the host.
- Close expired rooms and reject invalid invitations.
- Enforce the intended guest limit in both interface and backend.
- Apply migration `0023_studioflow_realtimekit.sql` to the correct production D1 database.
- Configure the RealtimeKit application and separate host/guest presets.
- Store Cloudflare credentials only as deployment secrets—never in source, Markdown, or browser storage.

Exit gate:

- A MacBook host and a tablet/second computer on a different network join using the live invitation URL. Camera, microphone, screen share, backstage, add-to-stage, remove-from-stage, remove-from-room, leave, and reconnect all work.

## A3. Program-Accurate Livestreaming

The livestream must match StudioFlow’s Program output. Streaming a plain meeting grid while the host sees custom layouts and overlays is not acceptable.

First implementation decision to prove:

- Publish the StudioFlow compositor’s `canvas.captureStream()` video plus the mixed program audio as the program feed RealtimeKit/livestream uses; or
- Use a production RTMP encoder service that receives that exact composite feed.

Choose the path only after a short prototype proves output fidelity, browser stability, latency, and platform compatibility.

Deliverables:

- Start and stop a live session from StudioFlow.
- Show preparing, live, reconnecting, failed, and ended states.
- Show elapsed time and meaningful stream-health information.
- Keep Program Recording running through a stream interruption.
- Prevent double starts and orphaned live sessions.
- Support Custom RTMP first, then verified YouTube, Facebook, and Rumble settings.
- Keep stream keys out of visible logs and exported diagnostics.
- Ensure live output includes staged guests, selected layout, screen share, logos, overlays, banners, widgets, intro/outro media, effects, and the intended audio mix.
- Provide a private/unlisted test procedure before any public broadcast.

Exit gate:

- Complete a 30-minute private or unlisted livestream with one remote guest, screen sharing, layout changes, branded overlays, music/effects, and simultaneous local Program Recording. Interrupt the stream connection once and verify the local recording remains complete.

## A4. Persistence, Library, and Recovery

Deliverables:

- Persist reusable studio scenes and branding.
- Persist multiple logos, overlays, backgrounds, clips, sounds, and music items.
- Persist teleprompter scripts and show notes where appropriate.
- Upload finalized recordings to R2 only after local finalization succeeds.
- Keep a downloadable local copy and clear upload state.
- Support interrupted-upload retry without duplicating records.
- Store metadata in D1 and binary media in R2.
- Add storage limits, cleanup rules, and explicit destructive confirmations.
- Add recovery for incomplete local recording sessions.

Exit gate:

- Create a studio, close the browser, reopen it, and recover its scenes/assets. Finalize a recording, upload it, replay it, download it, and recover from one interrupted upload.

## A5. Full Production Test Matrix

Required physical tests:

- Host: current Safari and Chrome on the MacBook Pro.
- Guest: tablet Safari plus a second desktop browser.
- Same network and different networks.
- Camera/mic permission denied, then recovered.
- Device unplug/replug during setup and during a session.
- Guest joins late, leaves, and reconnects.
- Guest screen share starts and stops.
- Host removes guest from stage and from room.
- 30-minute recording.
- 30-minute private/unlisted livestream plus simultaneous local recording.
- Network interruption while live.
- Browser refresh/close warning while recording.
- Library playback and download.
- Mobile/tablet guest layout at real viewport sizes.

StudioFlow is complete for initial use only when these tests pass and the results are recorded.

---

# Workstream B — Reorganize and Redesign TPI

This begins after StudioFlow passes A1 and the production guest/livestream plumbing is actively testable.

## B0. Content and Feature Inventory

- Inventory every public page, member page, application, forum area, notification type, profile tool, and administrative tool.
- Identify duplicates, dead ends, obsolete pages, and features that belong only inside the member area.
- Preserve working URLs through redirects or an explicit migration map.
- Do not delete content merely because it overlaps; decide its correct subject, method, and format.

## B1. New Information Architecture

Primary public navigation:

```text
Home | Explore | Learn | Investigate | Watch | Community | Our Apps
```

Account access remains clear but secondary:

```text
Join Free | Log In
```

Logged-in member tools belong inside the member environment:

```text
Feed | Notifications | Messenger | Forums | Profile | Member Tools
```

Administrative controls remain permission-gated and visually separate from normal membership.

## B2. Remove Subject Overlap with a Three-Axis Taxonomy

Do not treat Paranormal, Supernatural, Metaphysical, and ITC/EVP as four equal competing departments.

### Subject

- Hauntings and Apparitions
- Consciousness and Psychic Phenomena
- Spirituality, Belief, and Metaphysics
- Folklore and Supernatural Traditions
- UAP and Unexplained Phenomena
- Cryptids and Mysterious Creatures

### Method

- EVP and Audio Research
- Visual ITC
- Instrumental Transcommunication
- Environmental Monitoring
- Photography and Video
- Evidence Documentation and Review

### Format

- Community Discussion
- Educational Article
- Investigation Report
- Research Paper
- Video or Livestream
- Photo or Media Record
- Case File

One item can be found through all three axes without creating duplicate pages.

## B3. Visual System

- Create one TPI design system for typography, spacing, page widths, colors, buttons, cards, imagery, forms, status indicators, and responsive behavior.
- Use an atmospheric, cinematic public presentation without copying another organization’s branding, assets, text, or page implementation.
- Retain TPI’s identity and evidence-aware research tone.
- Use large purposeful imagery and fewer, stronger sections instead of grids of equally weighted small cards.
- Design desktop, tablet, and mobile layouts deliberately.
- Meet practical accessibility requirements for contrast, keyboard navigation, focus, labels, motion, and alt text.

## B4. Public Homepage First

The new homepage establishes the reusable system for later pages.

Required sections:

- Cinematic hero with one clear explanation of TPI.
- Join Free and Explore TPI actions.
- What the community offers.
- Featured investigations and research.
- Education Center.
- Videos and StudioFlow-produced broadcasts.
- ITC Visual Studio and other TPI applications.
- Evidence, ethics, and safety approach.
- Community invitation and feedback request.

## B5. Reusable Page Families

Create consistent templates for:

- Public landing pages.
- Subject and method hubs.
- Educational/research articles.
- Video and media pages.
- Applications.
- Member/community pages.
- Administrative pages.

Migrate one family at a time and validate links, permissions, responsive layout, and live behavior before moving to the next.

## B6. Community Completion

- Finish messenger behavior and run true two-account tests.
- Consolidate notification types and make every notice open its exact destination.
- Keep visual unread indicators accurate.
- Verify member online presence and avatar indicators at larger member counts.
- Verify room creation, add/remove people, chat/room hiding, retention, message/media editing, and removal permissions.
- Keep archived/hidden material out of normal chat lists while preserving authorized administrative access.

---

# Execution Order

1. StudioFlow A0 — truthful inventory and baseline.
2. StudioFlow A1 — dependable finished-video recording.
3. StudioFlow A2 — production RealtimeKit guest rooms.
4. StudioFlow A3 — program-accurate livestreaming.
5. StudioFlow A4/A5 — persistence, recovery, and physical test matrix.
6. TPI B0/B1/B2 — inventory, information architecture, and taxonomy.
7. TPI B3/B4 — design system and new public homepage.
8. TPI B5/B6 — migrate remaining page families and complete community systems.

## Immediate First Milestone

Begin with StudioFlow A0 and A1:

1. Build the authoritative StudioFlow frontend.
2. Open every route and record every dead or partial control.
3. Trace the current compositor and audio graph.
4. Produce a short test recording containing camera, microphone, screen share, logo, banner, music, intro, and outro.
5. Compare the saved file with the visible Program preview.
6. Fix discrepancies before adding RealtimeKit guests.

## User-Supplied Access Needed Later

The implementation can proceed locally without storing credentials in this plan. Live Cloudflare and destination testing will eventually require authorized access to:

- The correct Cloudflare account/project.
- RealtimeKit application and host/guest presets.
- Production D1 and R2 bindings.
- Private/unlisted YouTube, Facebook, Rumble, or Custom RTMP test destinations.

Ask for these only when the relevant implementation is ready to test. Never paste passwords, stream keys, or API tokens into this Markdown file.

## Completion Reporting Rule

Every milestone handoff must state:

- What changed.
- Which source files changed.
- Which automated checks passed.
- Which physical-browser tests passed.
- What remains unverified.
- Whether the deployed site matches the tested local build.

“Built,” “wired,” and “looks complete” are not substitutes for a successful end-to-end test.
