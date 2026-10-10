# StudioFlow Promotion Procedure

This is the approved design for a future owner-authorized promotion. It is documentation only; no promotion was performed by `TPI-STUDIOFLOW-002`.

## Preconditions

1. Confirm `/Users/toddknipple/Documents/StudioFlow/web` is the intended canonical source.
2. Confirm `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website` is the intended TPI checkout.
3. Inspect both Git states and stop if an unexpected change, branch, or source path is found.
4. Preserve all source changes; do not reset, clean, stash, or copy from TPI back into source.
5. Confirm no active development process would be disrupted. If process inventory is unavailable, record that limitation and obtain owner confirmation before any disruptive step.

## Candidate preparation

1. Copy the current StudioFlow source/configuration to an isolated temporary workspace, excluding `.git`, `dist`, and `node_modules`.
2. Reference the existing dependency installation read-only or install dependencies only with separate authorization.
3. Run TypeScript validation and the room/RTMP syntax checks.
4. Run Vite from the temporary source copy into a temporary candidate output directory.
5. Record the candidate manifest, file sizes, SHA-256 hashes, and build output.
6. Check `/studio/` asset paths, image references, development-only URLs, and missing output files.
7. Perform the browser/runtime release validation listed in `03_STUDIOFLOW_RELEASE_VALIDATION.md`.

## Owner approval gate

Do not replace TPI `studio/` merely because the candidate builds. Present the candidate report, source Git status, build comparison, runtime results, and changed-file list to the owner. Promotion requires explicit approval after those results are reviewed.

## Staging after approval

When explicitly authorized:

1. Create a recoverable snapshot of the existing TPI `studio/` bundle, including a manifest and hashes.
2. Stage the candidate outside `studio/`.
3. Compare the staged candidate against the approved candidate manifest.
4. Replace only approved generated StudioFlow files in `studio/`; preserve unrelated TPI files.
5. Verify the resulting `studio/` manifest and TPI Worker integration.
6. Review `git diff` and `git status` to confirm only approved files changed.
7. Commit only after owner approval. Do not push automatically.

## Deployment gate

Commit or push does not authorize production deployment. A separate explicit deployment approval is required. If the repository or Cloudflare configuration has automatic deployment behavior, inspect and document it before pushing. Do not use this procedure to deploy.

## Refusal conditions

The process must stop if the source path is ambiguous, the source has unexpected changes, the candidate cannot be isolated, required validation fails, the TPI destination is not the expected checkout, or approval is absent.

