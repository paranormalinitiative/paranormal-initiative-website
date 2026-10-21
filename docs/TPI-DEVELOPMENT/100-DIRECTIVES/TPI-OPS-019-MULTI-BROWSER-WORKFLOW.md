# TPI-OPS-019 — Multi-Browser Development Workflow

Date: 2026-10-17  
Status: COMPLETE WITH LIMITATIONS / LOCAL ONLY

## Policy

| Role | Browser | Authority |
| --- | --- | --- |
| Active agent development and QA | Codex In-App Browser | Verified for the local Worker |
| Standby | FreeBuff | Not verified and not used for agent QA |
| Owner visual review | Opera | Available for owner review; not used for agent QA |

Canonical local endpoints:

- Website: `http://127.0.0.1:8787/`
- StudioFlow room server: `http://127.0.0.1:8788/`

No second site, browser-hosted deployment, remote database, R2 store, public
development origin, production origin, or alternate checkout is part of this
workflow.

## Verified capabilities

Codex opened the canonical local homepage and verified the development banner,
page content, navigation, and screenshot capture. The existing bounded browser
harness also verified the authenticated synthetic `local_admin`,
`local_member`, and `local_contributor` workflows, role boundaries, console
inspection, and request isolation. The latest matrix evidence is 278 PASS, 6
expected PASS WITH LIMITATIONS, 0 FAIL, and 54/54 focused checks; non-loopback
requests were blocked before dispatch.

The local service remains launchd-owned. Read-only status verification confirmed
the Worker on 8787 and the independent room server on 8788, local D1/R2 state,
loopback binding, and outbound-service blocking. No restart, stop, deployment,
database mutation, import, commit, or push was performed for this directive.

## Browser boundaries

FreeBuff was not launched or connected to an agent session, so repository,
browser, localhost, Node, and log reachability there is **NOT VERIFIED**.
Opera is reserved for the owner to review the local origin manually; no agent
acceptance claim is made for Opera. The owner review procedure is documented in
the [local development user guide](../TPI-LOCAL-DEVELOPMENT-USER-GUIDE.md).

## Safe change and review procedure

1. Edit the canonical source only.
2. If the edit affects staged local assets, run
   `node scripts/stage-local-assets.mjs`.
3. Open the affected route in Codex at 127.0.0.1:8787.
4. Inspect the page, console, and local request activity.
5. Run focused local tests and applicable regressions.
6. Record limitations and owner-review needs; do not imply acceptance that was
   not observed.

Do not expose credentials or private fixtures. Do not use a browser to contact
external services. Do not restart the owner-controlled service without a
separate explicit service-lifecycle request.

## Handoff

The concise continuation record is
[TPI-DEVELOPMENT-AGENT-HANDOFF.md](../TPI-DEVELOPMENT-AGENT-HANDOFF.md).
