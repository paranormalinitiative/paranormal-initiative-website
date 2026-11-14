# QA Automation Guide

## Member-access gate

For any credential or recovery change, run:

```sh
npm run verify:password-hash
npm run verify:password-recovery
npm run verify:local-auth-lifecycle
```

The password-hash suite covers the current salted PBKDF2 format and legacy
SHA-256 upgrade path. The recovery suite does not prove real email delivery;
mailbox/provider delivery and operational failure alerting require separate
evidence. Production promotion still uses the mandatory certified release
workflow, not these focused commands alone.

## Local deterministic gate

From the TPI repository:

```sh
node scripts/qa/run-qa.mjs --e2e \
  --studioflow-root /Users/toddknipple/Documents/StudioFlow/web \
  --report docs/quality-assurance/reports/local-baseline.json
```

The runner reuses the existing API E2E suite and StudioFlow package scripts. A nonzero exit means a required check failed. `BLOCKED` entries are explicit scope limits and do not become passes.

## Optional live-provider checks

The API suite keeps external scraper refreshes out of the default regression. Use `TPI_E2E_LIVE_SCRAPERS=1` only in an isolated, authorized environment where provider requests are intended and observable.

## Production smoke

After a runtime deployment, run the read-only anonymous boundary checks:

```sh
node scripts/qa/production-smoke.mjs --base https://paranormalinitiative.com
```

This does not sign in, create content, upload media, change schedules, or mutate production data. Owner/authenticated acceptance remains a separate human or authorized-session test.

## CI

`.github/workflows/qa.yml` runs the deterministic TPI gate on pushes, pull requests, and manual dispatch. It contains no deployment step and no secrets. Extend the existing workflow rather than creating a second deployment workflow if a repository workflow is added later.
