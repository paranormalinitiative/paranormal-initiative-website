# The Doss House — Pennsylvania Directory Addition

Status: COMPLETE — PRODUCTION VERIFIED

## Scope

The Pennsylvania location directory now includes The Doss House in Loretto,
Pennsylvania. This is an owner-authorized research-directory addition that
leaves the question of whether the location is haunted to visitors and
investigators.

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
stairway incident. The directory identifies these as owner-attributed reports
and leaves their interpretation to visitors and investigators.

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

- Local JavaScript syntax check: PASS.
- Haunted-location directory verification: PASS — 50 state pages, 100 new
  starter entries, no placeholders.
- Initial directory source commit: `db14c5d1c0cc406e65d45cc96d6f3e1125a0d1fd`.
- Final wording source commit: `92b8e8959190fafd7e592e484d512ed9b0886a59`.
- Final release ID: `rel-92b8e8959190-3a4a24ef9a95`.
- Release profile: website-only; StudioFlow and Nova Editorial Workspace
  remained under the protected maintenance lock.
- Production Worker version: `59f60efc-09a4-4ed7-8cdd-264b5805a3af`.
- Rollback reference: `276beec7-c05b-4314-a6e9-fb3d483929b2`.
- Live anonymous production smoke: PASS — 10/10.
- Live Pennsylvania verification: PASS — page, supplement, source map, exact
  reference image, and TPI case-file treatment all returned HTTP 200; the
  runtime reported five Pennsylvania locations including The Doss House.
- Live wording verification: PASS — the requested folklore/testimony sentence
  is absent, and the directory now leaves the determination to visitors and
  investigators while retaining access, safety, and permission requirements.
