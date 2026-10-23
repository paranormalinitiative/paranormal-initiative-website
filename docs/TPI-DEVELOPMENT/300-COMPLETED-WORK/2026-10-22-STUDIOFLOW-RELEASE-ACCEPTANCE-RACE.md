# StudioFlow Release Acceptance Navigation Race

Date: 2026-10-22

## Finding

Immediately after a Cloudflare Worker deployment, isolated Firefox could
briefly return to `/member-login` while the authenticated session propagated.
The acceptance runner incorrectly treated the member shell's `HOME` navigation
label as a StudioFlow shell and then timed out.

## Repair

- StudioFlow acceptance now rejects `/member-login` as a false shell match.
- It retries authenticated `/studio/` navigation with bounded backoff before
  failing.
- Production application code and authentication behavior were not changed.

## Verification

- Local isolated Firefox acceptance: 26 passed, 0 failed.
- The guarded release workflow retains automatic rollback on genuine live
  acceptance failure.
