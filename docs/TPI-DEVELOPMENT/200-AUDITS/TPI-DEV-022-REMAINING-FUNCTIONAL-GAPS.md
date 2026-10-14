# TPI-DEV-022 Remaining Functional Gaps

| Area | Status | Remaining work |
| --- | --- | --- |
| R2 private media upload/retrieval/library | VERIFIED COMPLETE | Browser/mobile visual acceptance remains pending |
| Public/community/messenger media UI | FUNCTIONALLY VERIFIED, VISUAL PENDING | Run focused browser acceptance with safe synthetic fixtures |
| Interactive public search | FUNCTIONALLY VERIFIED, VISUAL PENDING | Verify keystroke/render behavior in an authenticated-capable browser session |
| Admin event create/edit/cancel source | VERIFIED COMPLETE locally | Guarded development deployment and runtime acceptance require an authorized clean/reproducible source checkpoint |
| Admin event create/edit/cancel deployed runtime | BLOCKED BY EXTERNAL DEPENDENCY | Deployment preflight rejects uncommitted application files; no commit was authorized |
| Studio entitlement denial | VERIFIED COMPLETE | Positive entitlement path requires an existing approved synthetic entitlement and external RealtimeKit configuration |
| Studio project/workspace persistence | NOT IMPLEMENTED in this website API | Define and implement against the canonical StudioFlow source, with owner-approved schema and storage design |
| Studio cloud recording/playback | BLOCKED BY EXTERNAL DEPENDENCY | Requires provider credentials and external service session |
| Production readiness | NOT READY | Browser/mobile visual acceptance and the Studio persistence gap remain |

No production resource, Tavily provider, research workspace, production D1/R2, member entitlement, or authentication setting was changed.
