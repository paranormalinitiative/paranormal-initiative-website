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

## Master artwork

The owner supplied updated transparent PNG masters on 2026-11-11. The existing
master filenames remain stable, including the historical spelling
`FoundingAllAcceessBadgeMaster.png`; the original non-transparent artwork was
replaced with these approved transparent files. Keep these masters unmodified
and regenerate the published derivatives from them.

| File | Source | SHA-256 |
|---|---|---|
| `masters/FoundingCreatorBadgeMaster.png` | `/Users/toddknipple/Desktop/FoundingCreatorMaster.png` | `26da1b544aad253e59c8d8fab9f92d25e78b49d20420c65679f10cab4604537f` |
| `masters/FoundingContributorBadgeMaster.png` | `/Users/toddknipple/Desktop/FoundingContributerMaster.png` | `28a587da4238fa82efca3516a6225d8ed55302b094ad403a4b72e15ffd933362` |
| `masters/FoundingAllAcceessBadgeMaster.png` | `/Users/toddknipple/Desktop/FoundingAllAccessMaster.png` | `c9ccab770d6575ac402d122f1a0458eefaab552d7a77ea303fef19d5a483f72d` |

All three masters are 1254×1254 RGBA PNGs with transparent backgrounds. Verify
with:

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
