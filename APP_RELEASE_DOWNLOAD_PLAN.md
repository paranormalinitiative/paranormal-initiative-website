# App Release Download Plan

This note is for internal website/build planning. It should not be displayed as public page copy.

## Public Website Behavior

The public app pages should show:

- App name and purpose
- Screenshots or artwork
- Current version when available
- Mac download button when available
- Windows download button when available
- Release notes when available
- Software Use Terms link

The public app pages should not explain backend hosting details such as Cloudflare R2, GitHub Releases, update feeds, or build storage unless there is a user-facing reason to do so.

## Planned Download Structure

Release files can be hosted through Cloudflare R2 or GitHub Releases, with each app page showing version numbers, release notes, screenshots, and platform-specific downloads when builds are ready.

Recommended public structure:

- `app-aether-spectra-sls.html`
- `app-acs.html`
- `app-itc-visual-studio.html`
- `app-paranormal-initiative.html`

Recommended metadata file:

- `app-releases.json`

## Cloudflare R2 Option

Cloudflare R2 is the preferred place for large installer files if the site needs direct TPI-hosted downloads.

Possible R2 download paths:

- `downloads.paranormalinitiative.com/aether-spectra-sls/mac/`
- `downloads.paranormalinitiative.com/aether-spectra-sls/windows/`
- `downloads.paranormalinitiative.com/acs/mac/`
- `downloads.paranormalinitiative.com/acs/windows/`
- `downloads.paranormalinitiative.com/itc-visual-studio/mac/`
- `downloads.paranormalinitiative.com/itc-visual-studio/windows/`
- `downloads.paranormalinitiative.com/paranormal-initiative-app/mac/`
- `downloads.paranormalinitiative.com/paranormal-initiative-app/windows/`

R2 should be used for large files because Cloudflare Workers static assets have file-size limits and should not be used for large app installers.

## GitHub Releases Option

GitHub Releases can also host Mac and Windows builds. This is useful for version history, release notes, and a backup download source.

If GitHub Releases are used, the website can link directly to release assets or mirror those links in `app-releases.json`.

## Update System

Planned updater paths:

- macOS: Sparkle
- Windows: WinSparkle or another Windows updater path

Sparkle and WinSparkle are third-party open-source updater frameworks. Their notices should be preserved in:

- `THIRD-PARTY-NOTICES.md`
- App bundle acknowledgments
- Installer documentation, if needed

Using Sparkle or WinSparkle does not make TPI apps open source.

## TPI Software Position

TPI apps are free to download and use for ITC, EVP, paranormal research, documentation, and experimentation.

They are not open-source releases.

Users may not copy, redistribute, sell, modify, reverse engineer, decompile, repackage, clone, or claim ownership of TPI software without written permission.

## Next Steps

1. Build public Mac and Windows release packages for each app when ready.
2. Upload large installers to Cloudflare R2 or GitHub Releases.
3. Fill in `app-releases.json` with version numbers, release notes, and download URLs.
4. Replace "Coming Soon" buttons on app pages with real download buttons.
5. Add Sparkle and WinSparkle feeds when app-level updater code is ready.
6. Keep public app-page wording simple and user-facing.
