# TPI-SOCIAL-001 Baseline

Date: 2026-10-11
Source: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
Scope: existing TPI member, community, messaging, media, settings, and integrations.

The site is a static HTML/CSS/vanilla-JS frontend with Cloudflare Pages/Worker
functions, D1 database `tpi_contributor_portal`, and R2 binding `TPI_MEDIA`.
This is an audit of the existing implementation, not a rebuild. The repository
started with pre-existing unrelated dirty files; none were staged.

Outcome: **READY WITH LIMITATIONS** for existing local/API behavior. A confirmed
Messenger attachment authorization defect was repaired and regression-tested.
Signed-in browser automation, physical devices, and external providers remain
unverified because the local Playwright dependency and those test resources were
not available. No production writes or runtime deployment were performed.
