# External Link Preview Unavailable State

**Date:** 2026-11-16 19:30 EST  
**Scope:** Public Community Feed external-link previews  
**Status:** DEPLOYED AND LIVE VERIFIED.

## What happened

Bill Heiland's Battery Drain Experiment link showed a large black preview area
and an "Open interactive preview" action, but no useful image. The card looked
broken even though the source link itself was still available.

## Confirmed cause

The linked page returned a title but no usable Open Graph or Twitter preview
image. The preview parser classified the script-driven page as an interactive
external page and the member renderer embedded it in a frame. That is not
reliable for external sites: a host may block framing, return a security
interstitial, or render a blank frame. TPI cannot create a truthful source
thumbnail when the external page does not provide one.

## Fix

- Keep source-provided images as normal static preview images.
- Keep direct external video responses as playable video previews.
- Replace the blank interactive frame for image-less external pages with a
  clear card stating **Preview image unavailable**.
- Explain that the source did not provide an image TPI can safely display.
- Keep a direct **Open source** link so the member can view the complete page.
- Remove the retired blank-frame styling and the misleading
  **Open interactive preview** wording.

## Safety and scope

The safe URL validation, redirect limits, bounded metadata fetch, and external
content boundary remain unchanged. This is a presentation repair; it does not
proxy arbitrary page content or bypass a source's framing/security policy.
StudioFlow, Creator Studio, Nova Workspace, private media, and owner data are
outside this change.

## Verification

- Link-preview regression: **18/18**.
- Member interaction contracts: **35/35**.
- `git diff --check`: passed.
- Guarded release preflight: **READY**, exact candidate certified with **11
  gates**.
- Focused Firefox profile/feed acceptance: **57/57**.
- Production anonymous smoke: **10/10**.
- Live Bill URL preview response: confirmed `image: ""`; the deployed Member
  Home bundle contains the unavailable-preview state and no interactive iframe.

Production release:

- Release: `rel-2de944d38363-c0615bf4976b`
- Worker version: `fe7d3561-708d-4c4f-8bf0-a5ef88882e8e`
- Source commit: `2de944d383635b285eb5f970040340e7b09e59a4`
- Traffic: **100% production**
- Rollback version: `74c14f0d-7cfd-4570-9563-db467673bd2b`

StudioFlow, Creator Studio, Nova Workspace, private media, and owner data
were not modified. The protected-application integrity guard passed.

## Expected member behavior

When a source provides an image, TPI shows the image preview. When it does not,
TPI shows an honest unavailable-preview message and an **Open source** link
instead of a black or misleading embedded panel.
