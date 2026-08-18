# ITC Visual Studio Browser Version

This is a separate browser-based project for **ITC Visual Studio**.

It is not the Mac/JUCE source project, and the existing Mac source folders should not be modified for browser work.

## Start Here

Read this first:

`START_HERE_SOURCE_OF_TRUTH.md`

That file is the consolidated current workflow and build direction so nobody has to hunt through old chats.

## Reference Sources

Reference-only Mac app documents are copied into:

`Reference - Mac App Docs`

Use those files as the workflow/specification source for the browser build.

Original Mac app folders:

- `/Users/toddknipple/Documents/The paranormal Initiative - Visual ITC Lab`
- `/Users/toddknipple/Documents/Visual ITC Lab - Mac`

Do not edit those folders while building the browser version unless the user explicitly asks for Mac app changes.

## Product Name

Project folder:

`ITC Visual Studio Browser Version`

In-app product name:

`ITC Visual Studio`

## Browser Version Principle

This should be a clean browser implementation of the proven Mac workflow, not a line-by-line conversion of the C++/JUCE source.

The Mac app is the specification.

The browser app should reproduce the workflow with browser-native tools.

## Core Workflow

1. Restore a portable `.vitc.zip` session capsule from the native Mac app, or create a new browser session.
2. Import a raw video with FFmpeg/WASM extraction, restore an existing capsule, or use loose images as a manual fallback.
3. Extract frames from video.
4. Skim through frames.
5. Mark setup/junk frames.
6. Delete marked junk frames while protecting checked evidence frames.
7. Review remaining frames.
8. Use Fit, Focus, Manual, zoom, and pan while reviewing frames.
9. Apply grouped visual effects from ALL, GEN, WATER, SMOKE, FIRE, INK, STEAM, or REF when useful.
10. Check frames worth keeping.
11. Save checked frames as evidence.
12. Export evidence images.
13. Add optional text/image watermarks.
14. Build and export a slideshow.
15. Export/reopen a portable session archive capsule.

Native zipped session capsules are the primary restore workflow. Raw video import now uses FFmpeg/WASM to extract JPEG frames. Loose JPG/PNG import is only a manual fallback for testing or one-off photo review.

## Two-Minute Recording Standard

Default browser recording limit should be 2 minutes.

At 30 FPS this is about 3,600 frames, which is enough for water agitation and settling while keeping extraction and review manageable.

Longer recording should be treated as an advanced option because browsers have stricter memory/storage limits than the native app.

## Production Deployment

ITC Visual Studio is live as a browser application at:

**https://paranormalinitiative.com/itc-visual-studio/**

Launch page: https://paranormalinitiative.com/app-itc-visual-studio

The browser application is no longer a localhost prototype. It is deployed on The Paranormal Initiative website with Cloudflare R2 hosting the FFmpeg WASM binary.

## Suggested Browser Stack

- Dependency-free static HTML/CSS/JavaScript (no build step)
- Canvas for image viewing and effects
- IndexedDB for active session storage
- FFmpeg/WASM for video frame extraction
- Browser-native MediaRecorder for camera capture
- Browser-native `createImageBitmap()` / `OffscreenCanvas` for PNG-to-JPEG conversion

## First Build Target

Start with the full session workflow: restore native archive capsules, import media, record short browser clips, analyze frames, save evidence, export images, and build slideshows.

Recommended first milestone:

1. Restore native `.vitc.zip` session capsules.
2. Import video and extract JPEG frames with FFmpeg/WASM.
3. Read `Metadata/session.json`, `Metadata/frames.json`, and `Metadata/evidence_candidates.json`.
4. Show filmstrip and frame viewer from archived frame images.
5. Zoom/pan frames.
6. Apply the merged native Mac effect preset library with live preview tiles generated from the current or first loaded frame.
7. Check/save evidence.
8. Export checked images.
9. Export a simple browser capsule.

Next passes should focus on local bundled FFmpeg assets, longer-session worker optimization, deeper native shader/LUT parity, and stronger archive-capsule compatibility testing.
