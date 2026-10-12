# TPI-ADMIN-010B — Deployment Report

Status: **DEPLOYED — PROTECTED PREVIEW ONLY**.

Target: `https://paranormalinitiative.com/admin-center-preview/` only.

Runtime commit: `45649cc` (`feat(admin): integrate comment and report review`).
Cloudflare Version ID: `41858f81-27d2-413d-821b-6a03f7316bf3`.
Preview URL: `https://paranormalinitiative.com/admin-center-preview/`.
Preview JavaScript asset: `/admin-center-preview/assets/index-DHCMRuca.js`.
Preview CSS asset: `/admin-center-preview/assets/index-CcAOeEMa.css`.

Read-only live smoke results:

- `/`: HTTP 200.
- `/live-video`: HTTP 200 and body contains `Coming Soon`.
- `/admin-panel`: HTTP 403 anonymously.
- `/admin-center-preview/`: HTTP 403 anonymously.
- Exact preview JavaScript asset: HTTP 403 anonymously.
- Community comment detail API: HTTP 403 anonymously.
- Report detail API: HTTP 403 anonymously.
- TPI-ADMIN-010B audit document: HTTP 200.

Anonymous 403 results prove access protection only; authenticated owner/admin
workflow acceptance remains pending.

The legacy `/admin-panel`, public website, production data, R2, roles,
entitlements, Creator Studio restrictions, and `/live-video` behavior remain
out of scope.
