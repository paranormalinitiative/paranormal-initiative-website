# TPI-ADMIN-010 — Deployment Report

Status: **DEPLOYED — PROTECTED PREVIEW ONLY**.

Runtime commit: `fa56fc6` (`feat(admin): complete community post management`).
Cloudflare Version ID: `0b9dccc1-590b-463f-a187-01223dca4a4a`.
Preview URL: `https://paranormalinitiative.com/admin-center-preview/`.
Preview JavaScript asset: `/admin-center-preview/assets/index-Dg_8vCrs.js`.
Preview CSS asset: `/admin-center-preview/assets/index-CcAOeEMa.css`.

Read-only live smoke results after deployment:

- `/`: HTTP 200.
- `/live-video`: HTTP 200 and body contains `Coming Soon`.
- `/admin-panel`: HTTP 403 without an authorized session.
- `/admin-center-preview/`: HTTP 403 without an authorized session.
- Exact preview JavaScript asset: HTTP 403 without an authorized session.
- `/api/admin/community/posts`: HTTP 403 without an authorized session.
- TPI-ADMIN-010 audit document: HTTP 200.

The final documentation-only deployment will be recorded below after its
Cloudflare Version ID is available.

The legacy `/admin-panel` route must remain unchanged. No production database,
R2 object, role assignment, public navigation, Creator Studio access, or
livestream behavior is in scope.

Authenticated owner/admin browser acceptance and rollback verification remain
pending. Anonymous 403 results prove the access gate only; they do not prove
authenticated functional acceptance.
