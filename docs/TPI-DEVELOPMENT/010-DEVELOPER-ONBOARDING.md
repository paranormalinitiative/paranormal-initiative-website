# Developer Onboarding

## First session

    cd /Users/toddknipple/Documents/GitHub/paranormal-initiative-website
    git status --short
    git branch --show-current
    git rev-parse HEAD

Read 001-DEVELOPER-START-HERE.md, the applicable directive index entry, and the relevant audit before changing code.

## Local Administration Center

    cd /Users/toddknipple/Documents/GitHub/paranormal-initiative-website/admin-center-app
    npm install
    npm run dev

Use the URL printed by Vite. Build with npm run build; preview the build with npm run preview.

## Review and release

Run git diff --check, review only the intended files, run the relevant tests, and preserve unrelated dirty files. Push only to the approved repository and branch after review. Production requires a separate explicit owner authorization.

## Never do without approval

Do not deploy the root Wrangler configuration as development, run remote migrations, write production D1/R2, alter authentication, expose admin routes, activate memberships, launch livestreaming, or modify The Cauldron & The Craft.

## Where to find records

- Numbered workflow: docs/TPI-DEVELOPMENT/
- Directives: docs/TPI-DEVELOPMENT/100-DIRECTIVES/
- Audits: docs/TPI-DEVELOPMENT/200-AUDITS/
- Completed work links: docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/
- Future work: docs/TPI-DEVELOPMENT/400-FUTURE-DEVELOPMENT/
- Original historical documentation: repository docs/ and root Markdown files
