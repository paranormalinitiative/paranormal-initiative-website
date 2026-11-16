# Administration Center Role-Aware Navigation Repair

**Date:** 2026-11-15 22:08 EST  
**Surface:** Reactive Administration Center and shared access probe  
**Status:** Deployed and live Owner-verified  
**Commit:** `661b06b5`  
**Release:** `rel-661b06b57761-81f33a142a9c`  
**Worker:** `b00b96d8-c0a6-4ca8-a137-63bfd980ce0f`

## Request

Repair the Administration Center so the Owner/Founder/CEO can access the
complete protected surface, authorized staff see the areas permitted by their
role, and regular members do not receive Administration Center navigation.
Keep the existing server protections and do not change StudioFlow, Creator
Studio, Nova Editor Workspace, private media, or owner data.

## Problem found

The reactive Administration Center had grown to more navigation areas than the
older server capability catalog named. The server-side effective-role resolver,
protected HTML gate, route allowlist, and handler checks were already the
authority, but the client navigation used a partial catalog and hardcoded
limited filtering for only Staff Directory and Membership & Entitlements.

The access-probe error fallback also defaulted the client to an administrative
state. That did not bypass the server, but it could expose an incorrect UI
shell during an access-probe failure.

## Repair applied

- Expanded the server-returned capability catalog to cover every current
  reactive navigation key, including Members, Community, Creators, Governance,
  Content & Publishing, System, Help Desk, Security, and Audit Logs.
- Added route metadata and computed each area's `allowed` flag from the
  existing server-side role/action matrix.
- Kept Help Desk and TPI Videos behind the existing full Administration Center
  boundary while preserving their own server-side capability checks.
- Made the React navigation filter only from the server-returned allowed-area
  set; removed the two-item hardcoded role exception.
- Made access-probe errors fail closed with no admin areas.
- Reset a deep-linked view to Overview when the current role is no longer
  allowed to see that view.
- Added regression checks for full catalog coverage and fail-closed navigation.

## Protection boundary

This is a visibility and parity repair, not an authority grant. Every
protected HTML route, API endpoint, and mutation continues to enforce access
on the server. The repair does not alter staff appointments, role assignments,
membership entitlements, moderation actions, Help Desk content, migrations,
private media, or production data.

Protected applications were not modified or unnecessarily redeployed as
application source. StudioFlow's required local lifecycle/build checks still
passed, and the release candidate's protected-application byte guard remained
clean.

## Verification

- Administration Center focused source checks: **94/94 passed**.
- Administration Center production build: **passed**.
- Maintained local authentication lifecycle: **38/38 passed**.
- Isolated Firefox Developer Edition StudioFlow acceptance: **65/65 passed**.
- Full guarded release preflight: **13/13 certification gates passed**;
  Tier 1 shared-API candidate completed in **24.5 seconds**.
- Production anonymous smoke: **10/10 passed**.
- Live Firefox Owner session: protected session and complete role-aware
  navigation confirmed after refresh.

## Rollback and recovery

The exact rollback Worker remains `e9306f06-8fe6-49d2-894c-e30bd2e21f7f`.
The release used the sealed immutable candidate, final Git/GitHub parity
checks, protected-application integrity guard, and production smoke before
confirming 100% traffic.

## Reusable rule

The client may display the server's authorization result, but it must never
derive authority from labels or assume access after a failed probe. New
Administration Center views must be added to the server capability catalog,
the route matrix, the focused regression checks, and the guarded release
record together.
