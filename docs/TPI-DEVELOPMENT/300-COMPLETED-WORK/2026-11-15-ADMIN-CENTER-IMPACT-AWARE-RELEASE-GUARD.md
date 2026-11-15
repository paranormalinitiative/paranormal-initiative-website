# Administration Center Impact-Aware Release Guard

**Date:** 2026-11-15 16:31 EST
**Scope:** TPI release classification, protected-application integrity, and
Administration Center verification
**Status:** Implementation complete locally; repository verification and release
record are the remaining gates

## Problem

The Administration Center command-center preview was treated as a full-platform
release because its source, generated preview, and admin verification lived in
paths covered by the broad release patterns. That caused the release to rebuild
and browser-test StudioFlow during an unrelated administration change. The
candidate then rolled back after an unrelated StudioFlow recording setup gate
timed out.

## Fix

The release classifier now has a distinct `admin-center` profile. It applies
only when every changed path belongs to the Administration Center surface or
its dedicated verification. That profile runs:

- local authentication smoke;
- the Administration Center source and protected-route contract;
- authenticated local Administration Center browser acceptance;
- candidate staging and protected-application byte verification.

It does not build StudioFlow, run StudioFlow room acceptance, or reopen the
StudioFlow regression suite.

## What still escalates

The following remain full-platform changes because they can affect every
application:

- `worker.js` or Worker configuration/bindings;
- shared authentication/security libraries;
- migrations or dependency locks;
- release/deployment tooling;
- multiple applications or ambiguous paths.

This keeps the release fast only when the change is actually isolated. It is
not a switch that can be used to bypass required checks.

## Protected application safeguard

Every release profile compares the staged candidate's protected application
bytes with the previous certified release. The candidate may change only the
application explicitly represented in the changed source paths. If generated
StudioFlow, Nova, or Administration Center bytes change unexpectedly, the
release stops before deployment.

The guard also ignores only the generated Administration Center release
metadata file, `admin-center-preview/release.json`, whose timestamp and source
commit are expected to change during staging.

## Verification target

The change is not complete until the repository passes the release-impact and
release-safety contracts, the normal local checks, a clean commit/push, and the
maintained release preflight. This release-tooling change does not itself
require a no-op Worker deployment; the next real Administration Center
application release will use the new profile and still receive anonymous
production smoke plus automatic rollback protection.
