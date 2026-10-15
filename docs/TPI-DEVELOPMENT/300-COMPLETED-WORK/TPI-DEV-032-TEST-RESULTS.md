# TPI-DEV-032 — Test Results

Date: 2026-10-14

| Test area | Status | Result |
| --- | --- | --- |
| Existing member navigation source comparison | PASSED | Fixed rail, active state, theme, typography, and mobile patterns reused |
| DEV-032 source checks | PASSED | 12/12 |
| DEV-030 compatibility | PASSED | 9/9 |
| DEV-031 analytics preservation | PASSED | 11/11 |
| Administration preview regression | PASSED | 81/81 |
| React/Vite build | PASSED | TypeScript and Vite build completed |
| Authenticated development authorization | PASSED | 57/57 |
| Development protected Admin Center | PASSED | Login 200; `/admin-panel` 200; release manifest 200 |
| Production dry-run | PASSED | Correct Worker and bindings; sanitized package |
| Production anonymous authorization | PASSED | Admin/API routes 403 |
| Production public/member boundary | PASSED | Public routes 200; member routes redirect 307 |
| Production private source exposure | PASSED | `lib`, `functions`, Worker, docs paths 404 after correction |
| Production authenticated visual owner acceptance | NOT TESTED | No production owner session available |

No test performed a migration, import, member-data mutation, R2 write, or
Founding 50 activation.
