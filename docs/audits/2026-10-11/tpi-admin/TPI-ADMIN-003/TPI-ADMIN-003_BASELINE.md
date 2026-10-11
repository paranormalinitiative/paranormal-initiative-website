# TPI-ADMIN-003 Baseline

Date: 2026-10-11. Canonical source: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`.

Starting Git baseline: `0ea012f` (`main`, aligned with `origin/main`). Current Cloudflare runtime baseline from ADMIN-002: `b5bf38ef-e438-433c-b05d-680e6ca285fe`; the earlier runtime migration/deployment record is retained in `TPI-ADMIN-002_RELEASE_REPORT.md`.

The repository had unrelated dirty files before this audit. They were not edited, staged, or included in this documentation batch. The existing static HTML / Worker / D1 Administration Center was reviewed; it was not rebuilt or duplicated.

Prior evidence carried forward: ADMIN-002 local API regression 225/225, migration replay and syntax checks passed, production anonymous smoke 10/10, migration 0048 applied read-only verified with zero Founding 50 allocations and zero Creator Studio entitlement rows. Authenticated production UI was previously unverified.

This audit adds acceptance evidence and limitations only. No production database, R2 object, recording, membership, entitlement, role, or runtime code was changed.
