# TPI-DEV-021 — Website-Wide Functional Audit

## Scope

Evaluate the development website as one connected system after TPI-DEV-020. This includes public navigation, authentication, member workflows, Community Feed, profiles, messaging, notifications, Education, Paranormal Teams, TPI Videos/Reels, Creator Studio, Creator Partnership, Administration Center, events, search, privacy, security, D1 integrity, performance, and responsive-risk assessment.

## Safety boundaries

- Development Worker and D1 only.
- No production deployment or production data access.
- No Tavily, external research, scraping, real email, invitations, media publication, research import, or Founding 50 activation.
- Existing fixtures and worktree changes remain preserved.
- Browser visual evidence is reported separately from API/source evidence.

## Method

Reuse TPI-DEV-020 and prior regression evidence. Add only two isolated synthetic members (`tpi-dev021-a` and `tpi-dev021-b`) for cross-account tests. Use the bounded integration harness `scripts/qa/tpi-dev-021-integration.mjs` and the existing source/build suites. Do not treat a successful build as functional acceptance.

## Required records

- `TPI-DEV-021-WEBSITE-FUNCTIONAL-MATRIX.md`
- `TPI-DEV-021-SECURITY-AND-DATA-INTEGRITY.md`
- `TPI-DEV-021-PRODUCTION-READINESS.md`
- `TPI-DEV-021-IMPLEMENTATION-REPORT.md`
- `TPI-DEV-021-OWNER-VISUAL-CHECKLIST.md`

