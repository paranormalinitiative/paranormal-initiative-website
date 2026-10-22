# The Paranormal Initiative — Agent Authority

All agents working in this repository must first read:

`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md`

That directive is the controlling operational authority for current TPI work.
It grants standing authority to investigate, repair, refactor, test, build,
commit, push, deploy through the guarded production workflow, verify live, and
roll back when necessary. A new owner directive is not required for each
ordinary repair or each verified production release.

Historical directives and reports remain evidence of requirements and past
scope. Their task-specific limitations do not silently become permanent
repository-wide restrictions. The newest explicit owner instruction controls
when directives conflict.

Agents must still preserve credentials, authentication controls, Git history,
Crossroads of the Unknown, and unrelated owner data. Destructive production
data operations, irreversible migrations, force-pushes, security bypasses, and
secret disclosure require separate explicit owner approval.

The maintained release path is:

```sh
npm run verify:local-auth-lifecycle
npm run release:preflight
TPI_PRODUCTION_DEPLOY=approved npm run release:production
```

Firefox Developer Edition is the default browser for both local and production
acceptance. Use isolated disposable profiles and data unless the owner directly
authorizes use of an existing profile or owner Studio.
