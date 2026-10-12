# Regression results

PASS: existing Worker route strings for `/admin-panel`, `/studio`, and the
admin API authorization helpers remain present.

PASS: no migration files, database identifiers, R2 bindings, authentication
helpers, or StudioFlow source were modified.

PASS: source and dependency directories are excluded from asset publishing.

PENDING: authenticated production smoke for the new preview path. Anonymous
boundary checks are complete on Cloudflare version
`7256a900-37ab-41c0-81e1-858d536e26c1`: preview document `403`, direct asset
`403`, admin API `403`, legacy admin entry `403`, and public `/live-video`
`200` with Coming Soon. Signed-in owner/admin regression remains pending.
