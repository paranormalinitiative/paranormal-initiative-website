# TPI-STUDIOFLOW-017 — Test Matrix

All rows below are scoped to the canonical local source at `/Users/toddknipple/Documents/StudioFlow/web`, revision `e40b876`, unless a production endpoint is named. A PASS means the stated test was actually performed; PARTIAL and BLOCKED are intentional non-passing statuses.

| ID | Pipeline/test | Method and input | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|
| 017-001 | Toolchain | `node`, `npm`, FFmpeg/FFprobe inventory | Required tools identified without assumptions | Node/npm/FFmpeg/FFprobe available; no repo Playwright suite | PASS | Audit command output; package.json |
| 017-002 | Generated media | FFmpeg color source + 880 Hz sine | Decodable MP4 and WebM with known codecs | H.264/AAC MP4 and VP8/Opus WebM produced and FFprobed | PASS | `/private/tmp/studioflow-017/synthetic-blue-6s.*` |
| 017-003 | RTMP bridge health | GET `/api/rtmp/health` | Bridge reports operational FFmpeg | `{"ok":true,"ffmpegAvailable":true}` | PASS | Loopback response |
| 017-004 | Single RTMP | POST session/start/chunk/stop with generated WebM; receiver on 1935 | Receiver gets valid audio/video | 6.037 s H.264/AAC FLV, 640×360, 48 kHz mono | PASS | `received-single.flv` |
| 017-005 | Multi RTMP | Two destinations on 1935/1936 | Both receive equivalent valid media | Both captures 6.037 s, H.264/AAC, 640×360 | PASS | `received-multi-a.flv`, `received-multi-b.flv` |
| 017-006 | Destination failure | Session to unavailable 1999 receiver | Accurate failure and bridge remains usable | Session `error`; health remained OK | PASS | Session `0b74f696-b141-48ed-a05a-1df5099ac59c` |
| 017-007 | Room guest presence | POST waiting guest/status/delete | Guest appears while waiting and disappears on removal | Passed; non-waiting guest correctly omitted | PASS | Loopback room API responses |
| 017-008 | Room signaling | POST synthetic `guest-offer` signal | Signal is relayed/stored | `signalCount=1`, type `guest-offer` | PASS | Loopback room API responses |
| 017-009 | Guest media transport | Two real browser peers with tracks | Connected remote audio/video tracks | Not completed safely in isolated browser | BLOCKED | No media transport evidence claimed |
| 017-010 | Pre-recorded UI source | Upload generated MP4 through Create Live Stream | Metadata and audio validation appear | UI showed 00:06, 640×360, video/mp4; source stored locally | PASS | Browser AX state |
| 017-011 | Browser livestream | Select manual RTMP, Go Live, wait for source end | Output starts, is captured, and ends at source end | Captured 6.067 s output; UI showed auto-end toast | PASS | Browser AX state; `received-browser.flv` |
| 017-012 | Browser output analysis | FFprobe and packet timestamp inspection | Valid audio/video and plausible pacing | Decodable; 182 video frames, packet timestamps ~0–6 s; 1,000 fps metadata anomaly | PARTIAL | FFprobe output |
| 017-013 | Program recording | Start Record, wait, Stop, confirm | Library record finalizes | Library entry saved; blob URL `readyState=4`, 1920×1080, 10.995 s | PASS | Browser AX/evaluate state |
| 017-014 | Playback | Open Library video | Video decodes and exposes duration/dimensions | Passed | PASS | Browser evaluate state |
| 017-015 | Download | Click Library Download | Completed file path available to harness | Button existed and was invoked; no completed path exposed by IAB | PARTIAL | Browser AX/DOM state |
| 017-016 | Checkpoint recovery | Controlled interruption + reload | Checkpoint survives and recovers | Not performed against an active owner session | BLOCKED | Manual procedure required |
| 017-017 | Folder/external storage | Native directory picker | File is written and re-openable | Not tested; no physical folder touched | BLOCKED | Owner/manual test required |
| 017-018 | Scheduling | Create/edit future and pre-recorded entries | Local record persists and can reopen | Local create/library path exercised; DST/unattended start not run | PARTIAL | Browser UI and Library record |
| 017-019 | UI smoke | Create modal, source, destination, studio, library | Controls visible and accessible | Passed for exercised surfaces | PASS | Browser AX state |
| 017-020 | Production boundary | Prior read-only endpoint checks | Gate and Coming Soon remain intact | `/studio/`/asset 403; `/live-video` Coming Soon | PASS | Prior deployment verification |
| 017-021 | Authenticated production StudioFlow | Signed-in owner and ordinary member sessions | Owner can enter; others see Coming Soon | No authenticated production sessions available | BLOCKED | Must remain owner acceptance test |
| 017-022 | Long duration | Multi-hour media/recording | Stable resources and no drift | Not run; short test is not extrapolated | BLOCKED | Pending dedicated run |

## Classification rules

- Simulated/local generated media is separated from owner verification and production-provider testing.
- Signaling is not media transport proof.
- Blob existence is not file-export integrity proof.
- A short run does not pass long-duration reliability.
- The browser capture’s unusual FLV frame-rate metadata is recorded as a partial result, not silently normalized.

