# Operational role (service insignia) badge assets

Authoritative artwork for TPI's operational staff identities — **Moderator** and
**Administrator**. Imported under TPI-GOVERNANCE-003B.

These badges are **presentation only**. Operational authority is resolved from
server-side role/capability records; no image, filename, DOM element, CSS class,
or client-side label grants or implies moderation or administrative authority.
They are also **not** ranks: they do not establish which staff tier a person
holds.

## Family separation

TPI maintains three distinct badge families. They must never be collapsed into one
generic rank field.

| Family | Identities | Location |
|---|---|---|
| Founding Membership | Founding Creator, Founding Contributor, Founding All-Access | `../founding-memberships/` |
| Operational Service | Moderator, Administrator | this directory |
| Leadership / Society | Gold, Silver, Bronze, future Board/leadership medallions | `../society-leadership/` |

A person may legitimately display a Founding badge, an operational insignia, and a
leadership medallion at the same time. One does not replace another.

## Master artwork (preserved unchanged)

Imported from the owner's Mac on 2026-11-03 as byte-identical copies. The owner's
Desktop originals are untouched: they were copied, not moved, renamed, resized,
recolored, or re-encoded.

| Identity | Source | Repository master | SHA-256 |
|---|---|---|---|
| Administrator | `/Users/toddknipple/Desktop/ADMIN.png` | `masters/AdministratorBadgeMaster.jpg` | `683b7c1237879092bcbb996a7c91653cb6e752c10f22ac8b54c40d08d667facc` |
| Moderator | `/Users/toddknipple/Desktop/MODERATOR.png` | `masters/ModeratorBadgeMaster.jpg` | `48aa9ad5d7879432408c09e298cafa26a2a958bab4c82f308e695e26b0ea1d36` |

Verify with:

```sh
shasum -a 256 assets/operational-roles/masters/*.jpg
```

## Recorded asset defects (not repaired)

Both source files were delivered with a `.png` extension but are **JPEG**-encoded.
The repository copies keep the true extension and the exact bytes; only the
filename differs from the Desktop original.

| Property | Administrator | Moderator |
|---|---|---|
| Actual encoded format | JPEG (JFIF 1.01, baseline, Exif, software=Picasa) | JPEG (JFIF 1.01, baseline, Exif, software=Picasa) |
| Dimensions | 1024 × 1024 | 1024 × 1024 |
| Colour | RGB, 8 bits/sample | RGB, 8 bits/sample |
| Alpha channel | **none** | **none** |
| File size | 392,660 bytes | 401,567 bytes |
| Extension mismatch | `.png` extension on JPEG data | `.png` extension on JPEG data |
| Background | opaque near-white; usable on light surfaces only | **baked checkerboard matte** where transparency was intended |

The Moderator master is the same class of problem found in the Society assets: the
designer's transparency was flattened into a visible grey/white checkerboard
pattern, and JPEG cannot carry alpha. Placing it on the dark TPI interface without
rework would show the checkerboard as part of the image. This is recorded as a
defect for the owner to resolve with new artwork or an approved matte/alpha
rebuild; the master is deliberately **not** repaired here.

## No derivatives yet

No `web/` derivatives exist, and no display surface may reference `masters/`.
When the operational-insignia feature is authorized, generate derivatives from the
masters (not from screenshots) and document source, SHA-256, dimensions, format,
and the regeneration command as the Founding family does. The Moderator matte must
be resolved before it is displayed on a dark background.

## Publishing

`.assetsignore` excludes `assets/operational-roles/masters/` from the deployed
asset package, the same way the Founding masters are excluded. Git keeps the
originals; nothing from this family is served until the feature exists and
optimized derivatives are added.

## Release tooling note (follow-up, not changed here)

`scripts/deploy-production-guarded.mjs` keeps an explicit
`unpublishedAssetPrefixes` list so the certified candidate equals what is
actually published; it currently names the Founding masters and the Society
family but **not** `assets/operational-roles/masters/`. `.assetsignore` already
prevents these files from being uploaded, so nothing extra is served, but the next
release directive should add this prefix to that list (two lines) so the candidate
digest is not computed over ~800 KB of unserved masters.

## Authority separation

- Operational role state and permissions come from server-side records, never from
  artwork, profile markup, `localStorage`, or a client-supplied role value.
- Renaming, swapping, or deleting an image changes only what is displayed.
- Active role and historical service are different states: a former Moderator may
  keep an honorable service distinction while holding no operational permission.

Policy: [`docs/TPI-DEVELOPMENT/400-FUTURE-DEVELOPMENT/TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md`](../../docs/TPI-DEVELOPMENT/400-FUTURE-DEVELOPMENT/TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md).
Implementation truth for current admin gates: [`docs/TPI-DEVELOPMENT/007-SECURITY-AND-PERMISSIONS.md`](../../docs/TPI-DEVELOPMENT/007-SECURITY-AND-PERMISSIONS.md).
