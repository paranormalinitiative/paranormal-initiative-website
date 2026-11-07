# TPI-NOVA-006 — Nova Slides and StudioFlow Nova Edit Foundation

**Date:** 2026-11-07
**Status:** FOUNDATION IMPLEMENTED
**Authoritative Nova origin:** `http://127.0.0.1:8787/nova/`
**StudioFlow room service:** `http://127.0.0.1:8788/`

## Delivered

Nova Editorial Workspace now has a real Slides route backed by the existing Nova
Core `nova-presentation` envelope:

- Documents and Slides are separate lazy-loaded workspace modes;
- presentation creation, title editing and optimistic-version saves;
- slide thumbnails and selection;
- add, duplicate, reorder and delete slides;
- slide canvas with text, shape and image-placeholder elements;
- drag and transformer resize writing geometry back to structured presentation JSON;
- per-slide backgrounds and speaker notes;
- read-only state inherited from Nova item lifecycle;
- dedicated Konva vendor chunk so Documents does not load the canvas engine;
- browser-confirmed create → add slide → add text → save flow on authenticated 8787.

StudioFlow now has a creator-facing **Nova Edit** navigation surface with direct
links into Nova Edit Documents and Nova Edit Slides. It establishes the product
boundary: Nova owns structured authoring, while StudioFlow remains the production
surface. The explicit “Add to Production” resource bridge is the next integration
tranche; no local-storage Notes editor was rewritten or removed.

## Verification

| Gate | Result |
|---|---:|
| Nova Slides source verifier | 8 passed, 0 failed |
| Nova application typecheck | passed |
| Nova application build | passed |
| Content Editor build | passed |
| StudioFlow web typecheck/build | passed |
| Authenticated browser Slides smoke | passed |

The authenticated browser smoke created a real presentation, added a second slide,
added a text element, and saved the structured item through the 8787 API. Production
was untouched and the persistent 8787 Worker was not restarted.

## Deliberate next tranche

This is the usable Slides foundation, not a claim of full PowerPoint parity. The
next implementation adds real asset references and image upload, richer typography
and alignment, layout templates, preview/presentation mode, PDF export, practical
PPTX interchange, and the StudioFlow “Add to Production” bridge. Those features
must continue using the same presentation model rather than creating a second
StudioFlow-specific slide format.
