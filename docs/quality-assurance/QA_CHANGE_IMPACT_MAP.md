# QA Change Impact Map

Run the smallest relevant set, then the full deterministic regression before release. This is a routing map, not a replacement for the underlying suites.

| Changed paths or behavior | Required checks |
|---|---|
| `worker.js`, `functions/api/[[path]].js`, API routes, auth, permissions | syntax checks + `scripts/e2e/api-e2e.sh`; production smoke after deployment |
| `migrations/`, D1 schema, seed behavior | migration replay/equivalence + full API E2E |
| `member-*.js`, settings, notifications, Messenger, feed UI | focused browser harness where available + full API E2E |
| `studio/`, StudioFlow generated integration assets | StudioFlow build/checks + read-only release inspector + owner-only smoke |
| StudioFlow media, recording, storage, RTMP, room server | StudioFlow build/checks plus the actual isolated media test available for that feature; unverified paths stay open |
| `.github/workflows/`, QA scripts, documentation only | syntax/runner execution; push documentation/test changes; no runtime deployment unless assets also changed |
| `wrangler.toml`, credentials, R2/D1 bindings | stop and review separately; no destructive migration or credential change in routine QA |
| `lib/video-providers.js`, authored TPI video routes, creator/channel pages | provider validation + migration-backed API E2E + anonymous production smoke; owner-authenticated production workflow remains separate |
| `migrations/0042_tpi_video_channels.sql` | local migration replay + full API E2E; apply remote only as part of the authorized additive release |
