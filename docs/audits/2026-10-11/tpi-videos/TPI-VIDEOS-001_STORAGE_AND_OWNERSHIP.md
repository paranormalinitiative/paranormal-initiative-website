# TPI-VIDEOS-001 Storage and Ownership

## Current storage paths

| Path | Owner | Storage | Public? |
|---|---|---|---|
| Authored TPI metadata | TPI/contributor record | D1 `tpi_videos`; playback remains external URL/embed | According to `viewing_access` and page rules |
| Scraped discovery metadata | TPI discovery index | D1 `videos`; external thumbnails and source URLs | Approved directory metadata |
| Member library upload | Individual member | R2 `TPI_MEDIA` plus D1 library metadata | No; owner-authenticated private-library path |
| StudioFlow recording | Creator | Browser/device/external/creator-connected destination per 010A-1 | No automatic TPI cloud recording archive |

## Policy conclusions

- Do not create an R2 recording-storage product, recording quota, or silent StudioFlow upload path.
- Do not confuse browser storage quota with computer or external-drive capacity.
- Preserve local browser recovery and download/export workflows.
- Any creator cloud provider integration requires a separate capability and security review; none is represented as implemented here.
- Public TPI publishing should reference creator-authorized media or an explicitly approved external source, with ownership and takedown records.

The existing private member upload path is unrelated to the approved decision not to host creators' StudioFlow recordings in TPI-managed cloud storage.
