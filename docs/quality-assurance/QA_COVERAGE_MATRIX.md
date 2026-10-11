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
| Camera and microphone | PARTIAL | OWNER VERIFIED — WORKING; automated media capture not reproduced | owner verification remains authoritative | preserve existing systems |
| Guest WebRTC media transport | BLOCKED | NOT YET VERIFIED | NOT YET VERIFIED | no configured automated browser-room media lab |
| Compositor, overlays, ticker, graphics | PARTIAL | local/browser implementation evidence only | production output NOT YET VERIFIED | actual rendered capture needed |
| Audio mixer and A/V sync | BLOCKED | NOT YET VERIFIED | NOT YET VERIFIED | FFmpeg available; mixer harness absent |
| Local RTMP bridge | PASS syntax / prior local receiver evidence | local synthetic receiver prior evidence | public RTMP/RTMPS NOT YET VERIFIED | no external provider claim |
| Multi-destination broadcast | BLOCKED | NOT YET VERIFIED | NOT YET VERIFIED | receiver matrix absent |
| Pre-recorded broadcast | PARTIAL | file playback/recovery evidence is separate | production authenticated workflow NOT YET VERIFIED | retain open owner checks |
| Recording, checkpoint/recovery, download | PARTIAL | local synthetic browser evidence; physical/long-session NOT YET VERIFIED | production workflow NOT YET VERIFIED | do not mark export/recovery broadly verified |
| Storage destinations | PARTIAL | browser/IndexedDB architecture evidence | physical picker/cloud providers NOT YET VERIFIED | no TPI-managed recording R2 |
| Scheduling/library | PARTIAL | local UI/API evidence | authenticated production workflow NOT YET VERIFIED | calendar/provider tests open |
| Owner-only Studio access | PASS boundary checks | n/a | anonymous direct URL/API denial read-only verified | preserve `/live-video` Coming Soon |
