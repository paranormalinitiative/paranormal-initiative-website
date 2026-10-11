# TPI-WEBSITE-018 — Functional Test Matrix

Statuses mean: **PASS** = executed and observed; **FAIL** = executed and failed; **PARTIAL** = some dimensions executed; **BLOCKED** = not safely executable in the isolated environment.

## Local synthetic API matrix

| Area | Test method and evidence | Status |
|---|---|---|
| Registration/login/session | Four local synthetic accounts registered and logged in; anonymous `/auth/me` returned no user | PASS |
| Profile | A updated profile and read it back; invalid email rejected | PASS |
| Member directory | A read active synthetic members and presence fields | PASS |
| Personalization/themes | A read personalization and block-list state | PASS |
| Messenger creation | A/B direct conversation creation and idempotent reopen | PASS |
| Messenger messages | Empty rejection, send, reply, reload, read receipt, unread count | PASS |
| Messenger authorization | C received 404 for A/B conversation; anonymous routes received 401 | PASS |
| Messenger notifications | Chat notification appeared for recipient and was read through notification API/UI | PASS |
| Messenger attachments | Local R2 upload and authenticated retrieval; anonymous direct retrieval was repaired from 200 to 401 | PASS |
| Community categories | Public and authenticated category lists returned active categories | PASS |
| Community post CRUD | A created/edited post; required title/body validation executed | PASS |
| Community comments | B commented; A listed comments; cross-author delete rejected | PASS |
| Community reactions | B reacted and toggled the reaction off; counts changed correctly | PASS |
| Community attachments | Local R2 upload, attachment metadata, and post association executed | PASS |
| Community notifications | Post/comment activity generated notification rows for the author | PASS |
| Contributor boundary | C created a local draft; A received 403; anonymous contributor route received 401 | PASS |
| Admin boundary | D listed members, member activity, and settings; A received 403 | PASS |
| Public teams | Public team list/count routes returned successfully with an empty local fixture | PASS |
| Validation/failure handling | Empty messages, invalid profile email, unauthorized ownership actions, and missing access returned expected statuses | PASS |
| External identity/email | No external mail provider or OAuth flow was invoked | BLOCKED |
| Physical-device/native share | No physical iOS/Android device was attached | BLOCKED |
| Conversation-level media authorization | Current key format lacks conversation ID; authentication-only repair verified | PARTIAL |

## Browser/UI matrix

| Surface | Method | Status |
|---|---|---|
| Member Home / Community Feed | Authenticated local browser at 467×784; real local API data rendered | PASS |
| Messenger panel | Visible synthetic conversation, reply, composer, member list, and controls | PASS |
| Notifications | Visible notification totals, unread filter, chat/community entries, action controls | PASS |
| Admin panel | Ordinary member saw server-backed Access Required state | PASS |
| Desktop layout | Source/history inspection; no fresh desktop screenshot in this run | PARTIAL |
| Tablet layout | Source/history inspection; no fresh tablet screenshot in this run | PARTIAL |
| Keyboard/screen-reader audit | Not fully executed; no dedicated accessibility runner in repository | BLOCKED |

## Production read-only matrix

| Endpoint/surface | Result | Status |
|---|---|---|
| Homepage | 200 | PASS |
| `/live-video` | 200, Coming Soon retained | PASS |
| `/studio/` anonymous | 403 | PASS |
| `/api/auth/me` anonymous | `user: null` | PASS |
| `/api/conversations` anonymous | 401 | PASS |
| `/api/notifications` anonymous | 401 | PASS |
| `/api/admin/members` anonymous | 403 | PASS |
| `/api/media/messenger/...` anonymous fake-key probe | 401 | PASS |
| Public community categories/posts | 200 | PASS |
| Authenticated production social workflows | Not attempted; no real account used | BLOCKED |
| Production uploads/mutations | Not attempted | BLOCKED |

## Duration and resource notes

- Local Worker and API run: short interactive run on 2026-10-10; no multi-hour soak test.
- No FFmpeg/WebRTC/RTMP media pipeline was in scope for this website social-network audit.
- CPU/memory/dropped-frame metrics were not collected because this directive audits website social features, not StudioFlow media pipelines.
