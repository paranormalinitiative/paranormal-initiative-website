# Community content management

Community posts use `GET /api/admin/community/posts` with server-side search,
status, and pagination. Existing post status mutation is exposed as the
smallest safe control for visible/hidden/deleted states. The preview shows
author, category-adjacent text, comments, reactions, status, and created date.

Private messages and unrelated community systems are not surfaced.
