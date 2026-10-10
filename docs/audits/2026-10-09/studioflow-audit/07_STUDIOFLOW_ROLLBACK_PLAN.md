# StudioFlow Rollback Plan

This plan is for a future approved promotion. No rollback was performed.

## Preserve before promotion

Before replacing TPI `studio/`:

1. Record the TPI Git commit and working-tree status.
2. Create a manifest of every existing `studio/` file.
3. Record SHA-256 and byte size for every existing file.
4. Preserve the complete prior generated bundle in a recoverable, clearly named snapshot outside the active `studio/` directory.
5. Record the candidate manifest and the approved promotion decision.

The snapshot must include the TPI-specific `studio/index.html` theme bridge and any approved generated assets. Do not rely only on timestamps or a single JavaScript hash.

## Restore procedure

1. Stop the promotion process and do not deploy further changes.
2. Identify the prior snapshot by its manifest and approved TPI commit.
3. Compare the snapshot manifest against the known-good pre-promotion manifest.
4. Restore only the `studio/` generated files; do not restore the entire TPI repository and do not touch unrelated website files.
5. Confirm the restored JavaScript, CSS, HTML, and image hashes.
6. Run static route/asset checks and verify the host access gate and `/live-video` entry behavior.
7. Review `git diff -- studio` and `git status` for unexpected changes.
8. Obtain separate owner approval before committing or deploying the rollback.

## Git-based recovery

If the approved prior bundle was committed in TPI Git, use the known commit or a narrowly scoped file restore only after owner approval. Never use a broad reset or checkout that could discard unrelated TPI work. If the prior bundle was not committed, use the preserved manifest-backed snapshot.

## Failed integration test

If the candidate fails before deployment, discard only the temporary candidate and leave TPI `studio/` untouched. If a promotion was approved and staged but fails integration before commit, restore from the pre-promotion snapshot, re-run the manifest and route checks, and stop for owner review. Production rollback is a separate operational action and is not authorized by this directive.

