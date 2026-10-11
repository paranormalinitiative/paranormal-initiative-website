# TPI-MEDIA-001 Test Matrix

| Area | Method | Result |
| --- | --- | --- |
| Grid source regression | Node assertion | PASS |
| Grid rendered desktop | Authenticated local browser, 1440px | PASS, 4 columns |
| Grid responsive | Authenticated local browser, 1024/800/390px | PASS, 3/2/1 columns |
| Video provider/player policy | Node regression | PASS, 22 assertions |
| Link previews | Node regression | PASS, 7 assertions |
| Navigation/access labels | Node regression | PASS |
| Multi-user API | Isolated local D1 and Wrangler | PASS, 213/213 |
| StudioFlow build | Canonical StudioFlow source | PASS |
| StudioFlow room/RTMP syntax | Canonical StudioFlow source | PASS |
| Production boundary smoke | Read-only production HTTP checks | PASS, 10/10 |
| Native media playback | Disposable unapproved source | BLOCKED by source policy, truthful unavailable state |
| Physical devices | Camera/microphone/reconnect | NOT TESTED |
| Authenticated production mutations | Owner session | NOT TESTED |
| Long-duration media | Extended session | NOT TESTED |
