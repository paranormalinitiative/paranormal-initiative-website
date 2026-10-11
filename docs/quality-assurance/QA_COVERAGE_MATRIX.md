# QA Coverage Matrix

Legend: **PASS** = executed evidence; **PARTIAL** = some local coverage; **BLOCKED** = tooling or access is absent; **NOT YET VERIFIED** = requires a distinct device/provider/owner test.

| Pipeline | Local synthetic/integration | Actual media or external transport | Production/authenticated | Evidence / limitation |
|---|---:|---:|---:|---|
| Social auth and permissions | PASS | n/a | anonymous boundaries previously read-only verified | `api-e2e.sh`, production smoke is read-only |
| Community feed, comments, replies, reactions | PASS | n/a | authenticated production mutation NOT YET VERIFIED | 152/0 local suite |
| Messenger, unread/read, block/mute | PASS | attachments exercised locally | authenticated production mutation NOT YET VERIFIED | local D1 synthetic identities |
| Notifications and preferences | PASS | n/a | authenticated production mutation NOT YET VERIFIED | unread-count assertions repaired |
| Profiles/settings/privacy | PARTIAL | n/a | signed-in production save NOT YET VERIFIED | existing member-settings harness |
| Education/contributor/admin boundaries | PASS | n/a | anonymous boundaries read-only verified | contributor/member/admin matrix |
| Camera and microphone | PASS local / owner verified | OWNER VERIFIED — WORKING; 019 connected local devices and captured a Program recording | owner verification remains distinct from local automation | preserve existing systems |
| Guest WebRTC media transport | BLOCKED | NOT YET VERIFIED | NOT YET VERIFIED | no configured automated browser-room media lab |
| Compositor, overlays, ticker, graphics | PASS local / PARTIAL overall | 019A ticker visible in actual local RTMP output and downloaded Program-recording frame | production output NOT YET VERIFIED; layout/responsive matrix remains open | `/tmp/tpi-019a-ticker-received.flv`, `/tmp/tpi-019a-ticker-frame.png`, `/tmp/tpi-019a-ticker-recording-frame.png` |
| Audio mixer and A/V sync | FAIL for prerecorded audio / PARTIAL overall | Synthetic prerecorded 440 Hz tone was absent from received program audio; local bridge audio decode still works in isolated Odysee-shaped test | broad mixer, guest, physical-device, and public-provider coverage remains open | 019A `astats` measured approximately -108 dB RMS on repeat prerecorded captures |
| Local RTMP bridge | PASS | prior local single/multi receiver evidence decoded by FFprobe | public RTMP/RTMPS NOT YET VERIFIED | no external provider claim |
| Multi-destination broadcast | PASS local synthetic | prior isolated receiver matrix | public/provider destinations NOT YET VERIFIED | failure isolation was local only |
| Pre-recorded broadcast | PASS local synthetic/browser | prior 017 file playback, compositor, auto-end, and Library evidence | production authenticated workflow NOT YET VERIFIED | retain open owner checks |
| Recording, checkpoint/recovery, download | PARTIAL | 019A recovered browser-generated chunks into Library and downloaded real recordings; browser playback/frame extraction worked | strict FFmpeg validation reports WebM Opus/timestamp issues; physical/native/long-session NOT YET VERIFIED | do not mark recovery/export broadly verified |
| Storage destinations | PARTIAL | browser/IndexedDB architecture evidence | physical picker/cloud providers NOT YET VERIFIED | no TPI-managed recording R2 |
| Scheduling/library | PARTIAL | local UI/API evidence | authenticated production workflow NOT YET VERIFIED | calendar/provider tests open |
| Owner-only Studio access | PASS boundary checks | n/a | anonymous direct URL/API denial read-only verified | preserve `/live-video` Coming Soon |
| TPI-STUDIOFLOW-023 live interaction controls | PASS local source/build; local unauthenticated mode gate | PARTIAL | authenticated route execution and comment pixels NOT YET VERIFIED | automatic queue, duration, visible filter, manual override, reply, moderation wiring in canonical StudioFlow |
| TPI-STUDIOFLOW-023 release boundary | PASS read-only production smoke | n/a | owner-authenticated acceptance NOT YET VERIFIED | production smoke 10/10; /studio/ 403; /live-video Coming Soon |
| TPI-VIDEOS-002 creator video security/publishing | PASS — 171/171 local migration-backed API assertions | no external provider claim | authenticated production creator workflow NOT YET VERIFIED | draft privacy, ownership, lifecycle, channel, and embed validation covered |
