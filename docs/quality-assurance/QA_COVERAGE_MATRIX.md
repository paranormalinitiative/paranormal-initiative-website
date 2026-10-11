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
| Compositor, overlays, ticker, graphics | PARTIAL | 019 ticker control path exercised during local recording; prior compositor capture evidence | production output NOT YET VERIFIED; downloaded ticker bytes not independently inspected in 019 | retain output-integrity follow-up |
| Audio mixer and A/V sync | PARTIAL | local device recording and prior synthetic path; exhaustive mixer matrix absent | NOT YET VERIFIED | no broad sync claim |
| Local RTMP bridge | PASS | prior local single/multi receiver evidence decoded by FFprobe | public RTMP/RTMPS NOT YET VERIFIED | no external provider claim |
| Multi-destination broadcast | PASS local synthetic | prior isolated receiver matrix | public/provider destinations NOT YET VERIFIED | failure isolation was local only |
| Pre-recorded broadcast | PASS local synthetic/browser | prior 017 file playback, compositor, auto-end, and Library evidence | production authenticated workflow NOT YET VERIFIED | retain open owner checks |
| Recording, checkpoint/recovery, download | PARTIAL | 019 real 00:28 browser recording persisted and Download invoked; physical/reload/byte-level/long-session NOT YET VERIFIED | production workflow NOT YET VERIFIED | do not mark recovery/export broadly verified |
| Storage destinations | PARTIAL | browser/IndexedDB architecture evidence | physical picker/cloud providers NOT YET VERIFIED | no TPI-managed recording R2 |
| Scheduling/library | PARTIAL | local UI/API evidence | authenticated production workflow NOT YET VERIFIED | calendar/provider tests open |
| Owner-only Studio access | PASS boundary checks | n/a | anonymous direct URL/API denial read-only verified | preserve `/live-video` Coming Soon |
