# TPI-OPS-018 — Published Article Route Repair

## Authorized scope

Repair the single confirmed browser failure from OPS-017 at
`/published-article/`, review the six routes classified `PASS WITH
LIMITATIONS`, and rerun the existing bounded 284-route browser harness.

This directive is local-only. It prohibits deployment, production or public
development changes, remote D1/R2 changes, external requests, unrelated page
repairs, commits, and pushes. The owner-controlled local Worker must not be
restarted or stopped.

## Required outcome

The clean published-article route must load its existing shared header and
footer, preserve the article design and publishing behavior, and complete the
existing browser matrix with no confirmed route failures. The six limited
routes must be individually classified as expected local limitations or real
defects.

## Completion evidence

The root-relative shared-fragment repair was applied to `includes.js`, local
assets were restaged without restarting the Worker, the focused article check
passed, and the existing harness completed 284/284 routes with 278 PASS, 6
expected PASS WITH LIMITATIONS, 0 FAIL, 0 BLOCKED, and 0 NOT VERIFIED.
