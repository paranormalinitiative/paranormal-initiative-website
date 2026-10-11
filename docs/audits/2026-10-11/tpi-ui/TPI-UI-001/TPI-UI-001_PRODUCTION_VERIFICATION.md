# TPI-UI-001 Production Verification

Status at implementation time: pending deployment.

Required post-deployment checks:

1. Anonymous access to `/admin-panel` and `/member-dashboard` remains protected.
2. Authorized owner/admin access renders the dedicated Administration Center without the generic member sidebar.
3. Authorized member access renders the dedicated Settings Center without the generic member sidebar.
4. `/live-video` remains Coming Soon.
5. Ordinary member pages retain the normal TPI member layout.

The authenticated checks must be performed with an authorized session; no production credentials are stored in this report.
