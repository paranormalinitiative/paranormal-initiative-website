# TPI-STUDIOFLOW-017 — Seamless Studio Switching and Automatic Restoration

Status: **IMPLEMENTED LOCALLY / LIVE RUNTIME VERIFICATION BLOCKED**

## Objective

Existing StudioFlow creators must be able to select an owned saved Studio from
My Studios and return directly to that Studio's production workspace. The
current workspace must be persisted before the switch, failed persistence must
keep the current Studio active, and the last successfully opened owned Studio
must be restored when StudioFlow is reopened.

## Scope

- Reuse the existing `studio_workspaces` API and StudioFlow `studio` route.
- Preserve independent workspace configuration, scenes, branding, and media
  references.
- Preserve the creator-level production lock and block unsafe switches.
- Do not create, delete, import, deploy, commit, push, record, or broadcast as
  part of this directive.

## Acceptance requirements

1. Selecting an existing Studio performs the current Studio save and waits for
   its result before loading the selected workspace.
2. A failed or unavailable save leaves the current Studio active and reports a
   retryable error.
3. The selected workspace is applied before the existing StudioFlow `studio`
   route is restored, with no Home-screen stop or second selection.
4. The last active Studio is restored only when it is still returned by the
   authenticated workspace API; an unavailable Studio falls back to Home.
5. In-flight saves are awaited and stale autosave work cannot silently switch
   ownership to the newly selected Studio.
6. Active recording/livestream production continues to block switching.

## Verification boundary

Offline source checks and syntax checks are required in the canonical
repository. Browser verification must use the local Codex browser and must
not start recording or broadcasting. A Worker restart is outside this
directive; if the running Worker does not serve the corrected source, live
verification remains blocked until the owner separately authorizes that
restart.
