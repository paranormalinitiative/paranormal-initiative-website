# The Doss House — Pennsylvania Directory Addition

Status: IMPLEMENTED LOCALLY — RELEASE PENDING

## Scope

The Pennsylvania location directory now includes The Doss House in Loretto,
Pennsylvania. This is an owner-authorized research-directory addition, not a
claim that paranormal activity has been proven.

The owner, Shawnna Rigsby, directly confirmed ownership and permission to the
TPI owner in the supplied conversation. The entry uses that permission for the
provided exterior photograph and presents the location respectfully, including
its connection to Shawnna's late mother, Holley Cataldo.

## Source record

- [Official Doss House history](https://www.thedosshouse-pa.com/about-the-doss-house)
- [Official history and activity page](https://www.thedosshouse-pa.com/history-activity)
- [Official daytime tours and access](https://www.thedosshouse-pa.com/daytime-tours)

The official history describes an 1810 house and its changing community uses,
including residence, medical, undertaking, and barber-shop history. The owner’s
published account also describes reported figures, a child in a green dress,
basement reports, an audible growl, unexplained mantle activity, and a reported
stairway incident. The directory labels these as owner-attributed reports and
does not present them as verified evidence.

The official site describes tours and extended stays by appointment. The entry
therefore keeps the access boundary as owner permission / appointment required
and does not direct members to trespass or enter restricted areas.

## Assets

- `haunted-location-directory/case-file-photos/doss-house-loretto.jpg` — exact
  owner-provided reference photograph, used with permission.
- `haunted-location-directory/case-file-photos/doss-house-loretto-case-file.png`
  — TPI archival case-file treatment derived from that exact reference.
- The treatment is labeled **PENNSYLVANIA** and **THE PARANORMAL INITIATIVE**.
  It contains no unrelated people, ghost/entity additions, advertisements,
  third-party badges, or watermarks.

## Implementation

- `haunted-location-directory/pennsylvania-doss-house.js` appends the one
  owner-authorized entry after the shared Pennsylvania state data loads.
- `haunted-location-directory/pennsylvania.html` loads that supplement before
  the shared renderer and image-source map.
- `haunted-location-directory/case-file-sources.js` maps the exact Pennsylvania
  entry to both local assets and records the official source and permission
  credit.

The supplement is intentionally page-scoped so the shared state data and other
states remain unchanged.

## Verification and release record

- Local JavaScript syntax check: pending final run.
- Haunted-location directory verification: pending final run.
- Git commit: pending.
- Production release: pending.
- Live Pennsylvania page and image smoke: pending.
