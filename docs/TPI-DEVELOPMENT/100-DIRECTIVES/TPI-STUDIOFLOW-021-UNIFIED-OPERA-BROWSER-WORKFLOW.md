# TPI-STUDIOFLOW-021 — Unified Opera Development Browser Workflow

Status: Local-only workflow and storage investigation

Opera is the authoritative browser for the owner's StudioFlow development workspace. Codex's in-app browser remains an isolated test surface and must not be treated as the owner's workspace.

Requirements:

- Use `http://127.0.0.1:8787/studio/` for local StudioFlow verification.
- Preserve Opera's localStorage, IndexedDB, cookies, Studios, scenes, media, and preferences.
- Do not migrate, clear, reset, overwrite, or delete browser data.
- Use Codex only for synthetic or isolated regression testing.
- Do not deploy, commit, push, modify production, restart unrelated services, or interfere with the mobile guest tunnel.
