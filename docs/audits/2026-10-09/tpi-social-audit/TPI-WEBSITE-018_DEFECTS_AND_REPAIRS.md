# TPI-WEBSITE-018 — Defects and Repairs

## D018-001 — Messenger media was anonymously readable

**Severity:** High privacy defect
**Status:** Repaired locally; deploy verification required
**Affected path:** `functions/api/[[path]].js`, `handleMediaRequest`

### Reproduction

1. Register/login synthetic member A in isolated local D1.
2. Upload a text attachment through `POST /api/uploads/messenger-media`.
3. Request the returned `/api/media/messenger/...` URL without a cookie.
4. Before the repair, the Worker returned HTTP 200 and the attachment body.
5. An unrelated authenticated synthetic member also received HTTP 200.

### Repair

`handleMediaRequest` now requires an authenticated member for every `messenger/` key and returns HTTP 401 with private no-store caching when no session is present. Community-media visibility, private-library owner isolation, upload sanitization, and existing attachment URLs were otherwise left unchanged.

### Verification

After the repair:

- Anonymous Messenger-media request: HTTP 401 — PASS.
- Authenticated member with the URL: HTTP 200 — PASS.
- Full 45-check synthetic multi-user regression: 45/45 — PASS.
- Production deployment verification is recorded in the companion audit after release.

### Remaining limitation

Messenger upload keys currently identify the uploader but do not encode the conversation ID. The repaired boundary prevents anonymous retrieval, but it does not yet enforce recipient-level authorization for an authenticated user who obtains a direct URL. A future conversation-bound media design would require coordinated upload/message API and client changes and should be handled as a separate scoped security improvement.

## Non-defects / test corrections

- The initial admin community activity request omitted the required `?username=` query parameter and returned HTTP 400. Repeating it with `?username=tpi018_user_a` returned HTTP 200. This was a test-shape error, not an application defect.
- The first rerun expected HTTP 201 when reopening an already-existing direct conversation; the implementation correctly returned HTTP 200 for the idempotent existing conversation. The final test accepts both creation and reopen semantics.

## Unresolved or unverified items

- No additional confirmed application defect was found in the locally executable social-network flows.
- External email/OAuth/push integrations, physical-device behavior, authenticated production mutation, desktop/tablet capture, and conversation-level Messenger media authorization remain unverified or partial.
- No destructive migration, production database change, R2 migration, or unrelated source repair was performed.
