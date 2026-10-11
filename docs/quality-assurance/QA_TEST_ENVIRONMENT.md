# QA Test Environment

Baseline date: 2026-10-11, America/New_York.

## Local tools observed

- Node.js `/opt/homebrew/bin/node` v25.9.0.
- Python `/usr/local/bin/python3` v3.12.0.
- FFmpeg `/opt/homebrew/bin/ffmpeg` 8.0.1.
- FFprobe `/opt/homebrew/bin/ffprobe` 8.0.1.
- Wrangler through `npx wrangler`.
- Existing local D1/Wrangler Worker harness and curl/Python assertions.
- StudioFlow has no Playwright/Vitest dependency and no configured Git remote at baseline.

## Isolation

The TPI API suite creates a fresh local D1 state, applies migrations, seeds disposable synthetic identities, and starts a local Worker. It does not use production cookies or mutate production D1/R2. External scraper calls are disabled by default.

StudioFlow media, device, provider, TURN, and long-duration tests require an isolated local lab. A tool being installed is not evidence that a pipeline was exercised.

## Evidence rules

Record the exact command, duration, input media, output metadata, and capture path for actual media tests. Distinguish owner verification, synthetic browser evidence, local integration, authenticated production, external provider, and physical-device evidence.
