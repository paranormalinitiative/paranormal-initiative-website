# TPI-STUDIOFLOW-126C — Production Card Border Regression

Date: 2026-11-01  
Environment: Authoritative local Worker, `http://127.0.0.1:8787/studio/`  
Production deployment: **NOT PERFORMED**

## Result

**COMPLETE — root cause identified and corrected in the development release
candidate.** The corrected candidate passes the production-artifact build,
isolated Firefox acceptance, maintained regressions, authentication lifecycle,
and release-safety checks. Production remains on the previously verified
rollback Worker and was not changed by 126C.

## Exact root cause

The 126A application CSS contained the correct type-specific variables and
selected-state rules. The maintained website bridge stylesheet was corrected to
consume `var(--production-item-border)`, but the production entry document was
still cacheable and the bridge stylesheet URL retained the same cache key:

```text
/studio/studioflow-012-overrides.css?tpi022=video-organization-v12&tpi-panels=exclusive-v3&tpi037=scenes-panel-uniformity-v2
```

The 126B Firefox run rendered the previous production styling. A read-only
Firefox inspection of the active rollback baseline showed the served stylesheet
was the previous `index-SDxcWQji.css`, while the corrected candidate is
`index-CphVaGhF.css`. The old production card had the type border variable but
no `--production-item-selected-border` variable; its computed borders were the
generic blue values observed in the 126B failure:

- selected: `rgb(84, 199, 255)`
- unselected: `rgba(105, 189, 255, 0.5)`

The same inspection showed that the type icon and normal border variables were
present, proving the failure was not caused by missing type tokens or a source
selector mismatch. The release path did not make the StudioFlow entry document
uncacheable, and the unchanged override URL allowed the old production asset
path to remain in use.

## Correction

1. `worker.js`
   - StudioFlow `/studio`, `/studio/`, and `/studio/index.html` responses now
     receive `Cache-Control: no-store`.
   - HTML `etag` and `last-modified` headers are removed for that entry
     document so a release cannot reuse a stale app shell.
   - Other production assets retain their existing behavior.

2. `studio/index.html`
   - The bridge stylesheet URL now includes:
     `tpi126c=production-item-border-v2`.

3. `scripts/stage-studioflow-authoritative.mjs`
   - The authoritative staging process now preserves the same cache-busting
     token instead of regenerating the old URL.

4. `scripts/verify/tpi-studioflow-126a-firefox.mjs`
   - Firefox acceptance now asserts the intended hashed JavaScript and CSS
     assets are actually referenced by the rendered page.
   - Failure diagnostics include loaded stylesheets and the computed normal and
     selected border variables.
   - Existing full-perimeter, selected Teleprompter, and refresh assertions are
     retained.

No StudioFlow source styling or production-item layout was changed under 126C;
the approved source remains `a6784cfe490f57d413dce99135f148936f854c9f`.

## Regression evidence

The known defective production baseline was exercised in isolated Firefox. It
loaded `index-SDxcWQji.css`, had empty selected-border variables, and failed the
type-specific border assertions. The corrected candidate loaded the intended
assets and passed all seven focused checks.

| Verification | Result |
| --- | --- |
| Defective production baseline asset/border detection | PASS — failure reproduced; 3/6 legacy checks failed |
| Corrected Firefox artifact acceptance | PASS — 7/7 |
| Exact JS/CSS asset references | PASS |
| Normal type borders | PASS |
| Selected type borders | PASS |
| Selected Teleprompter remains purple | PASS |
| Refresh persistence | PASS |
| Scenes regression | PASS — 20/20 |
| TPI-125 Firefox integration | PASS — 21/21 |
| Recording/storage regression | PASS — 33/33 |
| Screen-sharing regression | PASS — 13/13; native OS picker `NOT_AUTOMATED` |
| Local auth lifecycle | PASS — 38/38 before restart, after restart, and after rebuild |
| Release safety | PASS — 21/21 |
| Production deployment | NOT PERFORMED |

## Firefox evidence

- [Defective production baseline cards](evidence/TPI-STUDIOFLOW-126C/defective-production-baseline-all-production-card-borders.png)
- [Defective selected Teleprompter card](evidence/TPI-STUDIOFLOW-126C/defective-production-baseline-selected-teleprompter-purple-border.png)
- [Corrected local candidate cards](evidence/TPI-STUDIOFLOW-126C/corrected-local-all-production-card-borders.png)
- [Corrected selected Teleprompter card](evidence/TPI-STUDIOFLOW-126C/corrected-local-selected-teleprompter-purple-border.png)

## Release artifact

The authoritative staging process built the approved source twice and produced
identical output:

- JavaScript: `studio/assets/index-CSTJXjG2.js`
  - SHA-256: `94d5ba564a6e358ac013f94dcc30bf78e49e1acd93db4e3a46e32dbab06505bc`
- CSS: `studio/assets/index-CphVaGhF.css`
  - SHA-256: `328a8c77587c1976c7a8e1ee3dd72c7e0e4a979216975b1be4e53f23997f3385`
- Integrated entrypoint SHA-256:
  `c893fb35444f2fb1c17cb891d2987fddd8672c1657502e7f3423b73227c208ab`
- Integrated files: 29
- Reproducible builds: PASS
- Obsolete bundle references: none

## Baseline and safety

- Confirmed production Worker: `584f29db-1568-4ff4-a99e-b32b3b63a23e`
  at 100% traffic after the 126B rollback.
- No production deployment, database mutation, storage mutation, credential
  change, or owner-profile access occurred under 126C.
- The unrelated untracked `flame.html` remains preserved and unstaged.
- Canonical source worktree changes remain untouched.

## Commits and parity

- Approved StudioFlow source: `a6784cfe490f57d413dce99135f148936f854c9f`.
- Website 126C implementation commit: `c6b6d8e6fc0e572be9a5cb4541fa8f7a26a7b48e`
  (`fix StudioFlow production asset cache parity`).
- Website branch: `codex/tpi-development`.
- Documentation commit: `0cbc0705dde7917c94635712c4b52054ffff873d`.
- GitHub parity: VERIFIED after push; `origin/codex/tpi-development` matches
  the final documentation commit.

## Final status

**TPI-STUDIOFLOW-126C — DEVELOPMENT VERIFIED; PRODUCTION UNCHANGED.**

The candidate is ready for a separately authorized guarded production release,
but 126C itself does not authorize deployment.
