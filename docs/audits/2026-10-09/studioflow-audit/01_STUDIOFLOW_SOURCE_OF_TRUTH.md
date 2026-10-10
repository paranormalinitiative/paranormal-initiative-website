# StudioFlow Source of Truth

Audit directive: `TPI-STUDIOFLOW-002`  
Date: 2026-10-09  
Mode: controlled local implementation; production deployment not authorized

## Canonical source

The canonical StudioFlow development workspace is:

`/Users/toddknipple/Documents/StudioFlow/web`

It contains the React/Vite/TypeScript application source, styles, device handling, recording and broadcasting code, guest infrastructure, assets, build configuration, and local development servers.

The canonical source is a Git repository on branch `main` at commit:

`130275ca0b168847a49a80896c77488416c2970f` — `Make StudioFlow views control program layouts`

## Current source protection status

The source working tree is not clean. The following changes were preserved and not reset, stashed, overwritten, committed, or pushed:

- Modified: `server/room-server.mjs`
- Modified: `server/rtmp-bridge.mjs`
- Modified: `src/App.tsx`
- Modified: `src/styles.css`
- Untracked: `src/assets/`

The existing ignored `dist/` directory was not deleted or replaced.

## Generated deployment copy

The TPI website repository is:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`

Its StudioFlow deployment directory is:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/studio/`

That directory is generated output. It is not a second StudioFlow source tree and must not be used for feature development. Source-to-deployment flow is one-way:

```text
StudioFlow/web source
        |
        v
isolated verified build
        |
        v
StudioFlow/web/dist
        |
        v
owner-approved copy to TPI/studio
        |
        v
TPI integration verification
        |
        v
commit/push, then separate deployment approval
```

## Protection rules

- Do not copy files from `TPI/studio` back into `StudioFlow/web/src`.
- Do not build into the existing source checkout when the build tool writes temporary config files beside `vite.config.ts`.
- Do not replace `TPI/studio` without explicit owner approval.
- Do not commit, push, deploy, or alter production as part of a build verification.
- Do not reset, clean, stash, or discard current source work.

