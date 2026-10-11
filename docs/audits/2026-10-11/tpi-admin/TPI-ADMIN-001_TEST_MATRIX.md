# TPI-ADMIN-001 Test Matrix

| Test | Method | Result |
|---|---|---|
| Worker syntax | `node --check worker.js` | PASS |
| API syntax | `node --check functions/api/[[path]].js` | PASS |
| Admin JS syntax | `node --check admin-center.js` | PASS |
| Patch whitespace | `git diff --check` and final new-file review | PASS |
| Existing local API regression | Fresh local D1/Wrangler, `scripts/e2e/api-e2e.sh 8793` | PASS 213/213 |
| Anonymous admin HTML and redirect variants | Local Worker probes | PASS 403 |
| Ordinary member admin HTML | Seeded local member session | PASS 403 |
| Authorized admin HTML redirect | Seeded local admin session | PASS 200 |
| Admin API anonymous boundary | Local Worker probes | PASS 403 |
| Overview/founding/audit responses | Seeded local admin session | PASS 200 |
| Responsive sidebar | Source/CSS review; browser capture | PARTIAL; visual production capture pending |
| Founding 50 activation | No mutation performed | BLOCKED BY OWNER ACTIVATION GATE |
| R2/recording behavior | Not touched | NOT IN SCOPE |
