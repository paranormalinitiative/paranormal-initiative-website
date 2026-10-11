# TPI-VIDEOS-005 Baseline

Date: 2026-10-11

Canonical sources are `/Users/toddknipple/Documents/StudioFlow/web` and this TPI checkout. TPI-VIDEOS-004 supplied the additive broadcast identity, lifecycle, schedule, playback, replay, owner, and discovery model. The baseline remains intact: StudioFlow schedules are device-local, TPI publication is explicit, `/studio/` remains protected, and `/live-video` remains Coming Soon.

005 adds the authenticated browser bridge and synchronization safety around that model. It does not upload creator recordings, reset data, replace the existing video catalog, or create a TPI cloud recording product.

Evidence: the local API regression suite passed 207/207 checks after the 005 changes. Authenticated production verification is recorded separately in `TPI-VIDEOS-005_PRODUCTION_VERIFICATION.md`.
