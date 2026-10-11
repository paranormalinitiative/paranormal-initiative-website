# Messenger Security Matrix

## Attachment test

Fixture: isolated in-memory D1 with users A, B, C; one A/B conversation; one
sanitized Messenger attachment URL; fake R2 object with read counter.

| Requester | Message metadata | Attachment fetch | Result |
|---|---:|---:|---|
| Anonymous | denied | denied | PASS, 401 |
| A participant | allowed | allowed | PASS, 200 |
| B participant | allowed | allowed | PASS, 200 |
| C nonparticipant | denied | denied | PASS, 404 |

Denied C access did not call the R2 `get` method. The repair in
`functions/api/[[path]].js` finds non-deleted messages containing the exact URL
and requires conversation membership before object retrieval. Existing message
routes continue to call `requireConversationAccess`.

This is local isolated evidence, not proof of production R2 behavior. The test
command is `node scripts/qa/messenger-media-security.mjs`.
