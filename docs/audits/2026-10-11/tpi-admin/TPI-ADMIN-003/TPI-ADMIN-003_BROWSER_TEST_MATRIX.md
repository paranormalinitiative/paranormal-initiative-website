# TPI-ADMIN-003 Browser Test Matrix

Browser: Codex in-app browser, live production `https://paranormalinitiative.com`, 2026-10-11. No authorized owner/admin session was present. No credentials, session tokens, or authentication bypass were used.

| Test | Method | Result |
|---|---|---|
| Anonymous `/admin-panel.html` | Actual browser navigation and accessibility inspection | PASS: restricted-access screen rendered |
| Anonymous `/studio/` | Actual browser navigation and accessibility inspection | PASS WITH LIMITATIONS: protected Coming Soon screen rendered; HTTP status not independently exposed by browser tool |
| Public `/live-video` | Actual browser navigation and screenshot | PASS: Coming Soon page visibly rendered |
| Authenticated admin dashboard | Actual browser navigation | BLOCKED: no authorized session |
| Authenticated sidebar/navigation | Actual interaction | BLOCKED |
| Authenticated tables, filters, charts | Actual interaction | BLOCKED |
| Production member action testing | Not attempted | BLOCKED / intentionally not performed |
| Production Founding 50 allocation | Not attempted | BLOCKED BY OWNER ACTIVATION SAFETY GATE |
| Local authenticated browser shell | Static HTTP server only; auth/API unavailable | NOT ACCEPTANCE EVIDENCE |

The prior ADMIN-001/002 browser limitation remains unresolved. No screenshot is claimed for an authenticated screen.
