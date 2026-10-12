# Regression results

PASS: existing Worker route strings for `/admin-panel`, `/studio`, and the
admin API authorization helpers remain present.

PASS: no migration files, database identifiers, R2 bindings, authentication
helpers, or StudioFlow source were modified.

PASS: source and dependency directories are excluded from asset publishing.

PENDING: authenticated production smoke and direct anonymous asset-request
checks for the new preview path. These require a deployed build and test
sessions and must precede any replacement of `/admin-panel`.
