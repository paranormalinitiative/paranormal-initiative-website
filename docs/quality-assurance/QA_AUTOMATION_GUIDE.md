# QA Automation Guide

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
