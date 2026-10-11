# Admin Requirements

The current admin boundary is server-side and role-based. A complete admin
release should retain:

1. authenticated owner/admin checks for every mutation;
2. audit-friendly status and ownership changes;
3. moderation actions that do not destroy source evidence silently;
4. member access controls separate from public visibility;
5. no exposure of stream keys, private messages, or R2 object secrets;
6. local regression coverage before production mutation.

This audit found no need to broaden admin scope. Future UI work should map each
admin control to an existing Worker route rather than add client-only gates.
