# StudioFlow Build Comparison

## Compared locations

- Current source: `/Users/toddknipple/Documents/StudioFlow/web/src` and related source/config files
- Existing canonical build: `/Users/toddknipple/Documents/StudioFlow/web/dist`
- Existing TPI deployment copy: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/studio`
- Isolated candidate: temporary source-copy build at `/private/tmp/tpi-studioflow-candidate.TsAGjk`

## Candidate result

The isolated build succeeded from the current source copy. Its JavaScript, CSS, HTML, and image manifest are byte-identical to the existing `StudioFlow/web/dist` output.

The candidate and existing `dist/` hashes include:

| File | SHA-256 |
|---|---|
| `index.html` | `e327fade5b2483ef35aae1640234362d3665f52d44f21178d7906bd360345e5e` |
| `assets/index-BnVhfqg-.js` | `43b22eb13318c2bfff7a5ebabea0b18850e538c5660f654fbe06adeee01bce05` |
| `assets/index-BdUF5pZO.css` | `ae8351964124b989bf27803caf8a77c21c5c331f3aa16e4a884e9985afea8e6b` |

## TPI comparison

The TPI `studio/` directory matches the candidate/`dist` output for the JavaScript bundle, CSS bundle, and all bundled image assets. The only substantive difference is `studio/index.html`: TPI adds a site-theme bridge script before the same `/studio/assets/` references. The TPI directory also contains an unrelated `.DS_Store`.

Therefore, the earlier assumption that the current source necessarily produces a newer generated application bundle is not supported by the isolated build. The source working tree contains a large uncommitted diff, but the current isolated Vite output is identical to the existing generated JS/CSS/assets. The source changes may already be represented in the generated bundle, or may be changes that do not affect the emitted bundle; this comparison does not infer their authorship or release intent.

## Source-state difference

The source itself remains dirty: `App.tsx`, `styles.css`, `useMediaDevices.ts`, `room-server.mjs`, `rtmp-bridge.mjs`, and `src/assets/` differ from the source repository commit. Those source changes must still be preserved and reviewed independently before any commit or promotion.

## No promotion performed

No files were copied into TPI `studio/`. No obsolete asset was deleted. No current generated bundle was replaced. No commit, push, or deployment was performed.

