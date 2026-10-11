# TPI-VIDEOS-009 Shorts and Reels

The existing Reels route was audited as a static demonstration rather than a persisted feature. It now reads published TPI video listings marked `Shorts / Reel` through the shared TPI Videos API and uses the existing provider resolver. There is no duplicate Reels datastore, fake engagement loop, or automatic external-provider claim. Empty state explicitly reports that published Shorts/Reels are not yet available. Creator Studio receives a format selector; the additive `format` migration defaults existing records to Regular.

Status: PARTIAL. The browse path and format data model are implemented; a full short-form capture/editing workflow, reactions/comments integration, and real published Reel inventory remain unverified.
