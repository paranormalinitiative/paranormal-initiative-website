# TPI-OPS-017 — Local Browser Testing Enablement

## Authorized scope

Enable the existing bounded local browser acceptance harness from OPS-016,
verify ownership of the already-running local service without restarting it,
and rerun the existing 284-route inventory. This directive is local-only.

The scope excludes deployments, production/public-development requests,
database or storage changes, external requests, commits, pushes, and changes
to application behavior unrelated to browser-test compatibility.

## Safety boundaries

- Browser requests are allowed only to loopback ports 8787 and 8788.
- External browser requests are aborted before dispatch.
- No browser binary download is authorized or required.
- No global or sudo package installation is authorized.
- The existing LaunchAgent and Worker must not be restarted or killed.
- The OPS-015 284-route inventory is authoritative and must not be replaced.

## Completion evidence

The existing harness was enabled with repository-scoped Playwright 1.64.1
from already-cached npm artifacts, with install scripts disabled. The installed
Google Chrome executable was reused. The harness completed all 284 inventoried
routes and 54 focused checks. Results are recorded in the OPS-017 audit and
completion report.
