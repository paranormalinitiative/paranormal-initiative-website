# TPI-SOCIAL-001 Feature Inventory

| Area | Current evidence | Status |
|---|---|---|
| Accounts/login/session | `/auth/*`, `requireMember`, local E2E auth gates | PASS locally |
| Member dashboard/home | `member-home.html`, member shell, feed/pulse/rail | PARTIAL: browser signed-in run blocked |
| Profiles | `member-profile.html`, `contributor-profile.html`, public profile API | PARTIAL |
| Feed/posts/media | `/api/community/*`, feed hydration, local multi-user E2E | PASS locally |
| Comments/reactions | community comments/reactions and video equivalents | PASS locally |
| Messenger | conversations, messages, blocks/restrictions/preferences | PASS locally |
| Messenger attachments | upload/message metadata plus repaired participant-gated fetch | PASS focused/local |
| Notifications | categories, unread/read state, notification preferences | PASS locally |
| Settings/personalization | six themes, profile highlight/font API and UI source | PARTIAL |
| Library/private media | D1 owner rows and private-library owner gate | PARTIAL |
| Following/directory | member directory and video channel follows | PASS locally |
| Contributors/teams/education/events | existing public/member routes and APIs | PARTIAL |
| Search/export/deletion | static/public search; no connected export/deletion endpoint | NOT IMPLEMENTED / documented |
| Admin/moderation | admin guards, community moderation, member controls | PASS API locally |

Detailed area reports and evidence classifications are in the companion files.
