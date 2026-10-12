# Functional test results

| Check | Result | Evidence |
| --- | --- | --- |
| TypeScript + Vite production build | PASS | `cd admin-center-app && npm run build` |
| Required navigation taxonomy | PASS (source) | `src/app.tsx` `navGroups` |
| Refine member query parameters | PASS (source) | `src/main.tsx`, `src/app.tsx` |
| Member detail avoids conversations | PASS (source) | `MemberDetail` tabs and `MEMBER_MANAGEMENT.md` |
| Loading/error/empty states | PASS (source) | `LoadingState`, `ErrorState`, `EmptyState` |
| Authenticated API mutations | NOT RUN | No already-authorized fixture supplied |
| D1-backed browser interaction | BLOCKED | Vite-only preview has no Worker/D1 binding |
| Anonymous production preview gate | PASS | `/admin-center-preview/` returned HTTP 403 |
| Direct generated asset gate | PASS | Generated JS asset returned HTTP 403 |
| Legacy `/admin-panel.html` boundary | PASS | Anonymous production request returned HTTP 403 |
| Public `/live-video` behavior | PASS | HTTP 200 and visible Coming Soon marker |
| Main production domain | PASS | HTTP 200 and TPI title marker |

The build is not evidence of authenticated production acceptance.
