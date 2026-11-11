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

Qualification and assignment are now explicit owner/admin-controlled recognition
records. Gold, Silver, and Bronze are assigned through the authenticated
owner/admin-gated Leadership & Honors workflow and are never inferred from a
Founding Membership.
They remain visual recognition only; server-side account records continue to
decide permissions and access.

## Master artwork

Updated from the owner's transparent artwork on 2026-11-10. The masters are
1254×1254 RGBA PNGs with transparent backgrounds and are used to regenerate the
published derivatives.

| File | Source | Dimensions | SHA-256 |
|---|---|---|---|
| `masters/Gold Badge.png` | `/Users/toddknipple/Desktop/GoldTransparent.png` | 1254×1254 RGBA | `da1b64832aa4110250376ad29a3a9f461a90825f50e8f2027917f830a2c4bd14` |
| `masters/Silver Badge.png` | `/Users/toddknipple/Desktop/SilverTransparent.png` | 1254×1254 RGBA | `aa7726f1e3fd6e82790281fc60e1f685c9273eb58d30ed85013f4c6bf7fa0012` |
| `masters/Bronze Badge.png` | `/Users/toddknipple/Desktop/BronzeTransparent.png` | 1254×1254 RGBA | `683dbcae5351474c46a5dfdbf49a50960cda05d116ccd9d114f30e21a9158763` |

The supplied transparent artwork is preserved without a baked checkerboard or
colored image backing. Profile surfaces render the medallions directly on the
page background.

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
| Qualification / assignment rules | **DONE — authenticated owner/admin-gated explicit assignment** |
| Assignment authority, audit history, revocation/status handling | **DONE** |
| Profile / leadership display surfaces | **DONE** |
| Community-feed author identity | **DEFERRED — separate projection work** |

Tracked as the roadmap item **TPI Society / Leadership Badge System**; see
`docs/TPI-DEVELOPMENT/TPI-FOUNDING-MEMBERSHIP-REGISTRY.md`.

## Publishing

Only the optimized `web/` derivatives are published. `.assetsignore` keeps
`masters/` Git-only, so the authoritative artwork stays version-controlled while
profile surfaces can load the intended derivative assets.
