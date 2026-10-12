# Testing and Verification

## Evidence categories

- Verified: directly executed in the current environment with recorded output.
- Implemented: source or documentation exists, but runtime acceptance may remain open.
- Partial: only some required behavior was exercised.
- Blocked: a safety or environment prerequisite prevents execution.
- Not tested: no current evidence.

## TPI-DEV-001 audit results

| Check | Result | Evidence |
| --- | --- | --- |
| Repository, remote, branch, and HEAD | VERIFIED | Canonical checkout; origin is git@github.com:paranormalinitiative/paranormal-initiative-website.git; branch main; HEAD 11070e444200f95c546997e4d9412ae245752cc9 at audit start |
| Wrangler identity | VERIFIED | npx wrangler whoami; designated account ID confirmed |
| Production D1 binding | VERIFIED | npx wrangler d1 info tpi_contributor_portal |
| Dry-run bindings | VERIFIED | npx wrangler deploy --dry-run reported TPI_DB, TPI_MEDIA, and ASSETS |
| Dev/prod public HTML comparison | VERIFIED | Both 19,312 bytes and SHA-256 87669c4992174b729e1b8d220c24dfd041951d3de008fe9041f747ed1b86d6e0c2c6f; byte comparison equal |
| Isolated development deployment | BLOCKED | No separate Worker, D1, R2, or auth boundary found |
| Authenticated dev workflow | NOT TESTED | No isolated test account/environment |
| Production mutation | NOT PERFORMED | Safety requirement preserved |

## Future verification

After isolation is approved, test public routes, auth, community, messenger, notifications, videos, Creator Studio restrictions, Administration Center APIs, D1/R2 boundaries, scheduled tasks, and responsive behavior against synthetic data. Record exact URLs, deployment IDs, and evidence files.
