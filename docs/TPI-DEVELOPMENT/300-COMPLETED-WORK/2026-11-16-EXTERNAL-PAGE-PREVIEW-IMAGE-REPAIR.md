# External Page Preview Image Repair

Date: 2026-11-16
Incident: `TPI-EXTERNAL-PAGE-PREVIEW-2026-11-16`

Status: **Implemented and protected in source; production release follows the maintained guarded workflow**

## Reported impact

A member shared `www.chimera.audio`. TPI recognized the page as an interactive
external page, but the Community Feed hid the visual result behind an
**Open interactive preview** button. The member had to click before seeing the
page preview.

## Confirmed cause

The shared Community Feed renderer treated every `external-page` result as a
button-controlled iframe. When a source supplied `og:image`, that image was
still placed behind the same overlay. When a JavaScript-rendered source did not
publish an image, the existing safe iframe was not created until the button was
clicked.

## Repair

- External pages that publish a safe preview image now show that image
  immediately as the card media.
- JavaScript-rendered external pages without an image now load the existing
  sandboxed preview inline, so members can see the page without an extra click.
- The direct **Open interactive preview** link remains available for the full
  external experience and for sources that block in-card framing.
- The existing URL validation, redirect bounds, response limits, iframe
  sandbox, and external-source fallback remain in place.
- YouTube and direct external-video behavior remain unchanged.

## Protection

The shared member interaction verification now asserts that external page
cards contain either the static image path or the inline safe-preview path and
that the old button-only behavior cannot return. The link-preview regression
continues to cover JavaScript-rendered pages, direct video responses, metadata,
and SSRF protections.

StudioFlow, Nova Workspace, Creator Studio, and other protected applications
are outside this change.
