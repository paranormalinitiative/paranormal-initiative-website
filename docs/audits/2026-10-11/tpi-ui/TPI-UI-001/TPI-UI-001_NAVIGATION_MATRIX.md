# TPI-UI-001 Navigation Matrix

| Workspace | Dedicated navigation | Return control | Generic member sidebar | Destination preserved |
|---|---|---|---|---|
| Administration Center | Existing `admin-center-nav` | `member-home.html` (`Back to TPI`) | Suppressed on route | Yes |
| Settings Center | Existing generated `data-settings-nav` | `member-home.html` (`Back to TPI`) | Suppressed on route | Yes |
| Ordinary member pages | Existing shared member navigation | Existing behavior | Preserved | Yes |

The shared public include anchors remain in both protected pages for bootstrap compatibility, but their visible chrome is route-scoped out by CSS.
