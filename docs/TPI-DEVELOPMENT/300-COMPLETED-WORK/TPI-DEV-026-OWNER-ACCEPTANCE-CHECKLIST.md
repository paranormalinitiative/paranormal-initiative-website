# TPI-DEV-026 — Owner Acceptance Checklist

Use only the development website. Do not use production credentials or publish
content.

## StudioFlow

- [ ] Sign in as an approved entitled development creator.
- [ ] Confirm Creator Studio is visible and Administration Center access remains
  separately protected.
- [ ] Create, save, reopen, edit, and archive a workspace.
- [ ] Confirm a second creator cannot read or mutate the first creator's workspace.
- [ ] Export workspace configuration JSON through the browser download UI.
- [ ] Inspect the file for valid structure and absence of secrets or recording
  binaries.
- [ ] Import it as a new workspace.
- [ ] Try malformed, unsupported-version, and duplicate imports.
- [ ] Confirm existing workspaces and recordings are not overwritten.

## Recording recovery

- [ ] Create a synthetic completed recording.
- [ ] Confirm it appears in Browser Library.
- [ ] Reload the page and confirm metadata remains available.
- [ ] Close and reopen the browser session.
- [ ] Confirm playback and explicit download/export.
- [ ] Confirm storage explanations distinguish browser storage from backup.

## Responsive review

- [ ] Desktop: 1280, 1440, and 1920 pixels.
- [ ] Tablet: 768 and 1024 pixels.
- [ ] Mobile: 375, 390, and 430 pixels.
- [ ] Check navigation, dialogs, text, touch controls, overflow, workspace
  actions, and event controls.

## Do not perform

- [ ] Do not create a RealtimeKit room unless separately authorized.
- [ ] Do not activate or allocate Founding 50 memberships.
- [ ] Do not deploy or import into production.
- [ ] Do not use Cloudflare as a backup destination.
