# TPI-SOCIAL-002 Personalization

`Personalization → Highlights` remains enum-validated, member-scoped, persisted, and separate from the six site themes. The focused API/SQLite test passed save, isolation, and public-style behavior.

The owner-reported Highlights issue was not reproduced in source/API verification. Browser save/reload/computed-style verification remains **BLOCKED** by the missing Playwright module; it is not classified as a browser PASS.
