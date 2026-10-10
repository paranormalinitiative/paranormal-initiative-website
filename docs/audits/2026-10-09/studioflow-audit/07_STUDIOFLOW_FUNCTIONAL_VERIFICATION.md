# StudioFlow Functional Verification

## Checks completed in this audit

| Check | Result | Meaning |
|---|---|---|
| TypeScript no-emit in canonical StudioFlow source | PASS | Current TypeScript type graph has no reported errors |
| `server/room-server.mjs` syntax check | PASS | Node parser accepts the current room server |
| `server/rtmp-bridge.mjs` syntax check | PASS | Node parser accepts the current RTMP bridge |
| TPI `worker.js` syntax check | PASS | Worker source parses |
| TPI `functions/api/[[path]].js` syntax check | PASS | API source parses |
| Canonical StudioFlow `git diff --check` | PASS | No whitespace errors reported in the dirty source diff |
| Current browser workflow | NOT RUN | No server or browser was started |
| Physical device matrix | NOT RUN | No desktop/mobile/tablet exercise was performed |
| Cross-network guest call | NOT RUN | No TURN/NAT/reconnect evidence |
| Live broadcast | NOT RUN | No destination or FFmpeg session was started |
| Production recording recovery | NOT RUN | No crash/long-session/storage test |

## Verification coverage

Current-tree verification coverage is approximately 25–40% when static/type/syntax evidence is counted and is effectively 0% for full end-to-end production behavior. The range reflects that source inspection covers many paths while no physical runtime matrix was executed. It is not a measured test percentage.

## Missing acceptance matrix

The next verification pass should exercise camera/mic permission denial and recovery; device changes; camera resolutions and portrait output; all scene/layout branches; logo/overlay/banner/widget layering; music and sound effects; program and backstage recording; browser refresh/reopen; quota pressure; guest invite/admission/stage/remove/leave/reconnect; two browsers on separate networks; host controls; RTMP start/stop/reconnect; destination failure; and D1/R2 persistence once implemented.

Each case needs an observable result, browser/device, build identifier, timestamp, and artifact or log. A build pass alone cannot close this list.

