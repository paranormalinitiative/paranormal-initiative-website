# TPI-OPS-012 — Local StudioFlow and ParaTube Integration

## Authorized scope

TPI-OPS-012 extends the existing isolated local environment for controlled
testing of StudioFlow, ParaTube, related media APIs, local D1 records, local
R2 objects, and authenticated navigation. It reuses the existing application
architecture and does not replace StudioFlow, ParaTube, recording, recovery,
autosave, livestream, or publishing behavior.

Canonical repository:
`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`

Branch: `codex/tpi-development`

Local Worker: `http://127.0.0.1:8787`

Local R2: `tpi-local-media`

Existing StudioFlow room server: `127.0.0.1:8788`

## Safety boundaries

- No deployment to public development or production.
- No remote D1/R2 access, imports, migrations, or data changes.
- No external streaming, RealtimeKit, Tavily, Facebook, or public media
  requests.
- No real member media, credentials, recordings, or livestream secrets.
- No public tunnel and no exposure of localhost.
- No change to the existing 8788 room server.
- No reset, clean, commit, push, merge, or unrelated worktree cleanup.
- Local schema and fixture scripts remain fail-closed with `--local-only`.

## Implementation scope

1. Audit the existing StudioFlow and ParaTube routes, bindings, room relay,
   workspace persistence, video catalog, media access, and browser entry points.
2. Create and verify a local-only D1 backup before additive schema work.
3. Extend the existing local schema runner with only authoritative migration
   definitions required by the tested workflows.
4. Add one deterministic local R2 SVG thumbnail and point synthetic ParaTube
   metadata at that object.
5. Verify local page routes, API availability, D1 persistence, owner/role
   isolation, R2 retrieval, missing-object handling, and preserved room-server
   connectivity.
6. Run required OPS-002 through OPS-011 regressions and focused OPS-012 QA.

Full recording, recording recovery, autosave, external livestream, RealtimeKit,
and WebSocket parity are not started by this directive.
