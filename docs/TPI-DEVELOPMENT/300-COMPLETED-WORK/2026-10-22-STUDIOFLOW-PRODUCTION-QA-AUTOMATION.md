# StudioFlow Production QA Automation

Date: 2026-10-22  
Scope: authenticated Firefox Developer Edition acceptance for the guarded release workflow

## Result

Production acceptance can now run without opening, reusing, or asking the owner
to sign into an existing Firefox window. The release runner uses a disposable
Firefox profile and a dedicated synthetic production QA member.

The first live acceptance run passed all 22 checks against the currently served
production site. It did not deploy code and did not access Crossroads of the
Unknown.

## Synthetic account

- Username: `qa-studioflow-prod`
- Role: regular `member`
- Entitlement: `creator_studio_lifetime`
- Credential file: `.local-dev/qa-studioflow-prod.json`
- Credential-file mode: `0600`
- Password: intentionally not recorded here, in Git, logs, or chat

The account was created and granted through
`scripts/qa/tpi-ops-033-qa-accounts.mjs` with its explicit production-D1 safety
gates. Only the synthetic member and its entitlement were changed. No owner
studio, Crossroads record, R2 object, migration, authentication policy, or
application data was modified.

## Release-runner contract

The production Firefox acceptance environment must include:

```sh
TPI_FIREFOX_ALLOW_PRODUCTION=1
TPI_FIREFOX_PRODUCTION_QA=approved
TPI_FIREFOX_ACCOUNT=production_qa
TPI_FIREFOX_PRODUCTION_CREDENTIALS_FILE="$PWD/.local-dev/qa-studioflow-prod.json"
TPI_FIREFOX_BASE_URL=https://paranormalinitiative.com
```

The acceptance script rejects production execution unless the explicit QA gate
is present and the loaded username matches the `qa-studioflow-*` policy. Local
`local_admin`, test accounts, and owner credentials cannot be sent to
production. The `.local-dev` credential file is ignored by Git and must remain
private.

## Verification

Checks passed: 22  
Checks failed: 0  
Browser: Firefox Developer Edition  
Profile: temporary Selenium profile under the system temporary directory  
Owner profile accessed: no

The run verified StudioFlow loading, video cards, timer controls, sound and
music slots, Intro/Outro previews, independent playback, readable My Studios
layout, browser-local save and switching, portable backup file creation,
media-inclusive backup, restore-as-new, restored media, reopening persistence,
and narrow-width usability.

## Maintained files

- `scripts/verify/tpi-studioflow-firefox-acceptance.mjs`
- `scripts/tpi-release.mjs`
- `scripts/verify/tpi-studioflow-026a-deployment-workflow.mjs`
- `docs/TPI-DEVELOPMENT/TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md`

The production Worker was not deployed by this change. The normal guarded
preflight and explicit production deployment command remain mandatory.
