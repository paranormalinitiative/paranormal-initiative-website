# Local Worker Asset Freshness Repair

Date: 2026-11-14
Incident: `INC-2026-11-14-11`
Detected: **2026-11-14 15:14:15 ET**
Status: **REPAIRED, LOCALLY VERIFIED, AND PUSHED**

## What happened

Firefox acceptance once opened a maintained local Worker that was still serving
the previous `.local-dev/assets` copy. The repository source had the current
profile markup, but the browser received the older staged page, so the test
reported a missing profile element.

The local launcher already had a filesystem watcher, but `dev:local` returned
immediately when an owned Worker was already running. That left a freshness gap
after fast edits, missed filesystem events, or a source update that happened
while the watcher was restarting.

## Repair

- Reusing an already-running owned Worker now refreshes general website assets
  in place before returning status.
- Added the explicit maintained command:

  ```sh
  npm run dev:local:refresh
  ```

- The refresh command updates the running staged site or creates a full stage
  when the Worker is stopped.
- Refresh refuses to touch an unverified process occupying port 8787.
- Directory refresh now synchronizes files in place and removes stale entries,
  instead of deleting and replacing the watched directory.
- StudioFlow, Nova, and Content Editor Nova directories are excluded from the
  ordinary website reuse refresh and remain protected behind their explicit
  application workflow.

## Protection and verification

- Local staging checks passed **14/14**.
- Local Worker startup checks passed **11/11**.
- StudioFlow cache-busting and asset-watcher checks passed **14/14**.
- The maintained `dev:local` command reported an in-place refresh of **280
  paths** while reusing the running Worker.
- The refreshed Worker served current member profile markup.
- Firefox member profile/feed acceptance passed **53/53** after the refresh.

This is local tooling only. It does not change production assets, production
data, StudioFlow source, Nova source, or Creator Studio source, so no
production deployment was required.

## Maintained usage

After source edits, the normal command is safe to repeat:

```sh
npm run dev:local
```

If a browser test is about to run and there is any doubt about freshness:

```sh
npm run dev:local:refresh
```

The browser should use the canonical local URL:
`http://127.0.0.1:8787/`.
