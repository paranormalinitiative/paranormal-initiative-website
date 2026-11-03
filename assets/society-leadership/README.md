# TPI Society / Leadership badge assets

Authoritative artwork for the TPI Society / Leadership distinctions (Gold,
Silver, Bronze). This is a **separate badge family** from the Founding
Membership badges in `../founding-memberships/`. Holding one does not imply the
other, and the two systems must never be merged into a single rank.

Badges are visual identity only. Membership, role, entitlement, leadership rank,
administrative authority, and editorial capability are decided by server-side
records. No image, CSS class, DOM element, or client-side state grants access.

## Badge mapping

| Distinction | Master artwork | Web derivatives |
|---|---|---|
| Gold | `masters/Gold Badge.png` | `web/gold-{512,256,128}.png`, `web/gold-{512,256}.webp` |
| Silver | `masters/Silver Badge.png` | `web/silver-{512,256,128}.png`, `web/silver-{512,256}.webp` |
| Bronze | `masters/Bronze Badge.png` | `web/bronze-{512,256,128}.png`, `web/bronze-{512,256}.webp` |

Qualification and assignment rules for Gold, Silver, and Bronze are **not
defined**. **UNRESOLVED — OWNER DECISION REQUIRED.** The assets are preserved,
version-controlled, and available for a future implementation; they must not be
assigned automatically or inferred from a Founding Membership.

## Master artwork (preserved unchanged)

Imported from the owner's Mac on 2026-11-03. Files are byte-identical copies with
the owner's original filenames, including the spaces.

| File | Source | Dimensions | SHA-256 |
|---|---|---|---|
| `masters/Gold Badge.png` | `/Users/toddknipple/Desktop/Gold Badge.png` | 992×1061 | `d80316b2c527e3d5fe65bc4c667adc689e5c70189c06808d42c3304808d5403f` |
| `masters/Silver Badge.png` | `/Users/toddknipple/Desktop/Silver Badge.png` | 992×1061 | `0ef87714d6348b56db48e4fcb847ae4ebfe7223645bd7f8d6647f8d3d7f03f8d` |
| `masters/Bronze Badge.png` | `/Users/toddknipple/Desktop/Bronze Badge.png` | 992×1061 | `af0e03cbbe5c1d04912775d97fa46c287b9d9f441a43fafca22fdb3613ba4fe8` |

Two properties of the supplied originals are preserved deliberately and are
**not** corrected in the masters:

1. The `.png` files actually contain JPEG data (JFIF), not PNG. They display
   correctly because browsers decode by content, but the extension is
   inaccurate. The masters are not re-encoded.
2. The artwork has a flattened transparency checkerboard baked into the pixels
   (a JPEG has no alpha channel). Any production surface therefore shows a light
   checkerboard behind the medallion. Producing a transparent-background or
   circular-mask variant is a visual-identity decision for the owner, not an
   automatic edit; do not matte, recolor, or crop the masters.

## Web derivatives

Derivatives are generated from the masters and are disposable; regenerate rather
than edit. Because the masters are JPEG data inside `.png` files, the format must
be forced explicitly or the derivative inherits JPEG:

```sh
cd assets/society-leadership
for pair in "Gold Badge.png:gold" "Silver Badge.png:silver" "Bronze Badge.png:bronze"; do
  src="masters/${pair%%:*}"; base="${pair##*:}"
  for size in 512 256 128; do sips -s format png -Z "$size" "$src" --out "web/${base}-${size}.png"; done
  cwebp -quiet -q 88 "web/${base}-512.png" -o "web/${base}-512.webp"
  cwebp -quiet -q 88 "web/${base}-256.png" -o "web/${base}-256.webp"
done
```

Derivatives keep the master aspect ratio (478×512 at the 512 step). Intended
surfaces once policy exists: member profile, community feed identity,
Administration Center recognition views, leadership and advisory board pages,
membership/recognition displays, responsive/mobile use, and high-DPI display.

## Status

| Item | State |
|---|---|
| Master artwork version-controlled | **DONE** |
| Web derivatives | **DONE** |
| Qualification / assignment rules | **UNRESOLVED — OWNER DECISION REQUIRED** |
| Assignment authority, audit history, revocation/status handling | **NOT IMPLEMENTED** |
| Profile / community / leadership display surfaces | **NOT IMPLEMENTED** |

Tracked as the roadmap item **TPI Society / Leadership Badge System**; see
`docs/TPI-DEVELOPMENT/TPI-FOUNDING-MEMBERSHIP-REGISTRY.md`.
