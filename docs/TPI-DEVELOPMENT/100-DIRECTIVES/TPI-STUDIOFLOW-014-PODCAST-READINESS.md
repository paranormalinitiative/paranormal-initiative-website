# TPI-STUDIOFLOW-014 — Podcast Production Readiness

Date: 2026-10-17  
Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`  
Branch: `codex/tpi-development`

## Scope

This directive authorizes local inspection and focused corrections for the
owner's future productions, **The Paranormal Initiative** and **Crossroads of
the Unknown**.

The directive does not authorize creating the real podcast Studios, uploading
real podcast assets, starting a recording or livestream, contacting external
providers, restarting the Worker, stopping the room server, deploying,
committing, or pushing.

## Readiness questions

The validation must distinguish:

- persistent Studio configuration from browser-local recording data;
- asset references from actual uploaded media bytes;
- Studio switching from production locking;
- browser storage from Mac disk or external-drive storage; and
- local preflight support from verified external livestream destinations.

## Required evidence

Use the existing synthetic Studios and fixtures. Do not modify the owner's
future podcast names, create real podcast workspaces, or replace existing
Studio configuration. Record actual persistence, isolation, recording,
scheduling, and browser results in
`docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-014-READINESS-RESULT.md`.

## Safety boundary

All tests remain local and loopback-only. The existing production-lock,
workspace, recording-recovery, and local-storage boundaries must remain
fail-closed. Real camera/microphone, recording, livestream, RealtimeKit, and
external-destination acceptance remain owner/provider-gated follow-up work.
