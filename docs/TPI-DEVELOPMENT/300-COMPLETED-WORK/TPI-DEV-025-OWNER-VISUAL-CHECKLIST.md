# TPI-DEV-025 — Owner Visual Checklist

Use only the development Worker with an authorized synthetic creator session.

- [ ] At 1280, 1440, and 1920px, open StudioFlow and confirm Saved Workspaces
      does not obscure editor controls.
- [ ] At 768, 1024, 375, 390, and 430px, confirm the panel, buttons, list,
      dialogs, and controls have no horizontal overflow and remain touch usable.
- [ ] Save a workspace, choose Export current, and confirm the browser downloads
      a `tpi-studioflow-*-backup.json` configuration file.
- [ ] Open Import, select that file, confirm the explicit new-workspace prompt,
      and verify the imported workspace appears without changing the original.
- [ ] Confirm the backup notice says recording binaries are not included.
- [ ] Open the existing StudioFlow Library and use its existing Download/Save
      to device flow for a completed local recording, if one is available.
- [ ] Reload StudioFlow and confirm existing browser-local recovery behavior.
- [ ] Do not create a RealtimeKit room, start a livestream, upload a recording,
      activate Founding 50, or use production.

Status: `NOT YET OWNER-VERIFIED` at implementation handoff.
