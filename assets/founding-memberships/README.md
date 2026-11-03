# Founding Membership badge assets

Authoritative badge artwork for the three permanent Founding Membership classes
(TPI-CREATOR-INCENTIVE-001). Badges are **presentation only**: membership,
capability, and authorization state always come from the server-side D1
membership and entitlement records. No image, filename, or DOM element grants or
implies a capability.

This is one of two separate badge families. The TPI Society / Leadership badges
(Gold, Silver, Bronze) live in `../society-leadership/` and are **not** Founding
Membership identities. A member may eventually hold either, both, or neither; the
families must never be merged into one rank.

## Class mapping

| Class | Numbers | Badge identity | Master artwork | Web derivatives |
|---|---|---|---|---|
| `FC` | `FC-001`–`FC-050` | Founding Creator | `masters/FoundingCreatorBadgeMaster.png` | `web/founding-creator-{512,256,128}.png`, `web/founding-creator-{512,256}.webp` |
| `FCT` | `FCT-001`–`FCT-050` | Founding Contributor | `masters/FoundingContributorBadgeMaster.png` | `web/founding-contributor-{512,256,128}.png`, `web/founding-contributor-{512,256}.webp` |
| `FAA` | `FAA-001`–`FAA-050` | Founding All-Access | `masters/FoundingAllAcceessBadgeMaster.png` | `web/founding-all-access-{512,256,128}.png`, `web/founding-all-access-{512,256}.webp` |

## Master artwork (preserved unchanged)

Imported from the owner's Mac on 2026-11-03. The files are byte-identical copies;
the spelling `FoundingAllAcceessBadgeMaster.png` (including `Acceess`) is the
owner's original filename and is preserved deliberately. Do not rename, resize,
re-encode, or overwrite the masters.

| File | Source | SHA-256 |
|---|---|---|
| `masters/FoundingCreatorBadgeMaster.png` | `/Users/toddknipple/Desktop/FoundingCreatorBadgeMaster.png` | `3b5556fd431efa48c824366f1f377244cfdefcb17e7bc62e06da0d8a54460dc3` |
| `masters/FoundingContributorBadgeMaster.png` | `/Users/toddknipple/Desktop/FoundingContributorBadgeMaster.png` | `90c1e78dc013799e8581e4c6364b4316d410a1caf6bddfbb18013e5982cf5dea` |
| `masters/FoundingAllAcceessBadgeMaster.png` | `/Users/toddknipple/Desktop/FoundingAllAcceessBadgeMaster.png` | `45a165d4e877314f73049e024af4b7d71efbaaf95bcfb03b6cf946d61d1fb4d8` |

All three masters are 1254×1254 8-bit PNG without an alpha channel. Verify with:

```sh
shasum -a 256 assets/founding-memberships/masters/*.png
```

## Web derivatives

Derivatives are generated **from the masters** and are disposable: regenerate
rather than edit. Square aspect is preserved (`-Z` fits the longest edge).

```sh
cd assets/founding-memberships
for pair in "FoundingCreatorBadgeMaster.png:founding-creator" \
            "FoundingContributorBadgeMaster.png:founding-contributor" \
            "FoundingAllAcceessBadgeMaster.png:founding-all-access"; do
  src="masters/${pair%%:*}"; base="${pair##*:}"
  for size in 512 256 128; do sips -Z "$size" "$src" --out "web/${base}-${size}.png"; done
  cwebp -quiet -q 88 "web/${base}-512.png" -o "web/${base}-512.webp"
  cwebp -quiet -q 88 "web/${base}-256.png" -o "web/${base}-256.webp"
done
```

Intended surfaces: member profile badge (512 / high-DPI), feed and member
identity (256), compact and mobile lists (128), Administration Center membership
views (256), and WebP-preferring browsers (512 / 256). Any new surface uses these
derivatives; it must not point at the 2.4 MB masters.

## Separation from authorization

- `lib/membership-entitlements.js` derives badge identity from the assigned
  class code (`primaryBadge`), never from an image or client input.
- The API returns badge metadata from resolved membership rows; the client
  cannot set a badge.
- Deleting, swapping, or renaming an image changes only what is displayed. It
  cannot add a capability, issue a number, or alter Creator Incentive
  eligibility.

Community-surface rollout (feed, comments, profile header) and the complete
Administration Center quality audit are tracked roadmap items; see
`docs/TPI-DEVELOPMENT/TPI-FOUNDING-MEMBERSHIP-REGISTRY.md`.

## Publishing (production packaging)

The masters are deliberately **not** published. `.assetsignore` excludes
`assets/founding-memberships/masters/` from the deployed asset package while Git
keeps the originals; only `web/` derivatives are served. Verified behaviour:
a derivative returns `200`, a master returns `404` on the local and isolated
Workers, and the production deploy uses the same ignore file (its asset
directory is the repository root).

Footprint: masters total 8,552,727 bytes in Git; the published founding
derivatives total 2,363,608 bytes. Never point a display surface at `masters/`.
