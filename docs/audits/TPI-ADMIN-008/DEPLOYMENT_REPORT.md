# TPI-ADMIN-008 — Deployment report

Status: **DEPLOYED WITH LIMITATIONS — protected preview only; promotion not ready.**

This batch is limited to the TPI repository and protected preview assets/API.
The production `/admin-panel` remains unchanged. The Cloudflare target must be
verified as account `221ea5479876fd303ddc87002b9e892d`, Worker
`theparanormalinitiative`, D1 `tpi_contributor_portal`, and R2
`tpi-contributor-media` immediately before deployment.

No D1 migration, production data mutation, R2 object operation, credential
change, Founding 50 activation, or Creator Studio access expansion is part of
this batch.

## Release evidence

The initial protected-preview batch and this incremental Teams integration are
both retained below as release history.

- Git commit: `0bc2d474fe67606aac022366d810db109a4ce66a`
- GitHub: pushed to `origin/main`
- Cloudflare Version ID: `ff131b83-25a2-4dd9-a9aa-dd45e0f7ae5a`
- Worker: `theparanormalinitiative`
- Preview asset: `/admin-center-preview/assets/index-SUDuDyoT.js`
- Dry run: PASS; `TPI_DB` resolved to `tpi_contributor_portal` and `TPI_MEDIA`
  resolved to `tpi-contributor-media`.

## Anonymous production verification

| Endpoint | Result |
| --- | --- |
| `/` | HTTP 200 |
| `/admin-panel.html` | HTTP 403 |
| `/admin-center-preview/` | HTTP 403 |
| `/admin-center-preview/assets/index-SUDuDyoT.js` | HTTP 403 |
| `/api/admin/overview` | HTTP 403 |
| `/live-video` | HTTP 200; Coming Soon preserved |
| `/docs/audits/TPI-ADMIN-008/FEATURE_PARITY_MATRIX.md` | HTTP 200 |

Authenticated administrator browser verification remains BLOCKED without an
authorized session. `/admin-panel` promotion remains explicitly gated by full
parity, authenticated acceptance, rollback verification, and owner approval.

## Teams integration release

- Git commit: `2f46d35cd74d00508c6df91b086f2e0b6e156867`
- GitHub: pushed to `origin/main`
- Cloudflare Version ID: `c4594714-a6c5-45cf-9ee1-0cf16de2875e`
- Preview asset: `/admin-center-preview/assets/index-CdANy844.js`
- Wrangler identity: PASS — designated TPI account ID
  `221ea5479876fd303ddc87002b9e892d`
- Dry run: PASS — `TPI_DB` resolved to `tpi_contributor_portal`, `TPI_MEDIA`
  resolved to `tpi-contributor-media`, and `ASSETS` was present.
- Uploaded assets were limited to the protected preview bundle, focused QA
  script, and TPI-ADMIN-008 documentation.
- No D1 migration, team-record mutation, R2 operation, or `/admin-panel`
  replacement was performed.
- Documentation sync commit: `d6b45ed` pushed to `origin/main`.
- Documentation sync Cloudflare Version ID: `53f787b5-ed28-4796-9b0a-20b01ade2f87`.

## Contributor Management release

- Git commit: `88f2316` pushed to `origin/main`.
- Cloudflare Version ID: `6e48d46b-5f3b-44f8-98a6-7596e84db61d`.
- Preview asset: `/admin-center-preview/assets/index-b-VW_Pff.js`.
- Dry run: PASS — `TPI_DB` resolved to `tpi_contributor_portal`, `TPI_MEDIA`
  resolved to `tpi-contributor-media`, and `ASSETS` was present.
- Anonymous boundary checks: preview, preview asset, `/api/admin/contributors`,
  and `/api/invites` returned HTTP 403; `/live-video` returned HTTP 200 with
  Coming Soon preserved.
- No contributor, invite, role, D1, or R2 data was mutated during verification.

## Platform Health release

- Git commit: `8d006bf` pushed to `origin/main`.
- Cloudflare Version ID: `a4efadbc-5dde-4df3-b57c-0c4343b21392`.
- Preview asset: `/admin-center-preview/assets/index-DU0WSzoQ.js`.
- Dry run: PASS — `TPI_DB`, `TPI_MEDIA`, and `ASSETS` resolved to the
  designated TPI resources.
- Anonymous boundary checks: preview, preview asset, and
  `/api/admin/scraper-runs` returned HTTP 403; `/live-video` returned HTTP 200
  with Coming Soon preserved.
- No scraper refresh job, D1 migration, R2 operation, or production data
  mutation was performed.

## Creator Management release

- Git commit: `0a6e8bc` pushed to `origin/main`.
- Cloudflare Version ID: `1294ca23-52b8-41f7-a11a-73ff4445d72e`.
- Preview asset: `/admin-center-preview/assets/index-CiNmH33P.js`.
- Dry run: PASS — `TPI_DB`, `TPI_MEDIA`, and `ASSETS` resolved to the
  designated TPI resources.
- Anonymous boundary checks: preview, preview asset,
  `/api/admin/creator-partnership`, `/api/admin/founding-50`, and
  `/api/admin/creator-studio/entitlements` returned HTTP 403; `/live-video`
  returned HTTP 200 with Coming Soon preserved.
- No Founding 50 award, Creator Studio entitlement, D1, or R2 mutation was
  performed during verification.

## System Settings release

- Git commit: `85b8ac6` pushed to `origin/main`.
- Cloudflare Version ID: `d4576ae9-1d28-45bc-9c7a-beae7203464a`.
- Preview asset: `/admin-center-preview/assets/index-CNAPvCfq.js`.
- Dry run: PASS — `TPI_DB`, `TPI_MEDIA`, and `ASSETS` resolved to the
  designated TPI resources.
- Anonymous boundary checks: preview, preview asset, and `/api/admin/settings`
  returned HTTP 403; `/live-video` returned HTTP 200 with Coming Soon
  preserved.
- The preview invoked no settings POST mutation and changed no production
  configuration.

## Published content views release

- Git commit: `82ca842` pushed to `origin/main`.
- Cloudflare Version ID: `fd566f6e-9a15-4183-a450-709c19ed3b1b`.
- Preview asset: `/admin-center-preview/assets/index-BhFaD7AW.js`.
- Dry run: PASS — `TPI_DB`, `TPI_MEDIA`, and `ASSETS` resolved to the
  designated TPI resources.
- Anonymous boundary checks: preview and preview asset returned HTTP 403;
  existing public `/api/articles`, `/api/tpi-videos`, and `/api/events`
  listings returned HTTP 200; `/live-video` returned HTTP 200 with Coming
  Soon preserved.
- No draft, event, video, article, D1, or R2 mutation was performed.

## Reports metadata queue release

- Git commit: `30996baa0742263b6958b12ad696b568418c4783` pushed to `origin/main`.
- Cloudflare Version ID: `0ceddb56-cc3e-4820-a132-3ee5e01ba94a`.
- Preview asset: `/admin-center-preview/assets/index-BgDOmMqw.js`.
- Dry run: PASS — `TPI_DB`, `TPI_MEDIA`, and `ASSETS` resolved to the
  designated TPI resources.
- The protected `/api/admin/reports` route now provides a metadata-only queue
  over existing video and messenger reports with status filters. It does not
  expose report details, private conversation IDs or bodies, recordings, or
  stream data, and it presents no unverified resolution mutation.
- Anonymous boundary checks: preview, exact preview asset, `/api/admin/reports`,
  `/admin-panel.html`, and `/api/admin/overview` returned HTTP 403; public
  article/video/event listings returned HTTP 200; `/live-video` returned HTTP
  200 with Coming Soon preserved.
- No D1 migration, report mutation, R2 operation, credential change,
  `/admin-panel` replacement, or Creator Studio access expansion was performed.

## Release documentation sync

- Documentation commit: `3b8ba6d` pushed to `origin/main`.
- Documentation sync Cloudflare Version ID: `763f96a9-19ee-472a-bbd0-f20531d615df`.
- The sync published the updated deployment report and regression results;
  runtime code remained unchanged.

## Notifications metadata queue release

- Git commit: `8f0142c` pushed to `origin/main`.
- Cloudflare Version ID: `e4796d24-83bc-49d7-b2a3-758fc0cfa061`.
- Preview asset: `/admin-center-preview/assets/index-DtzLRBXy.js`.
- Dry run: PASS — `TPI_DB`, `TPI_MEDIA`, and `ASSETS` resolved to the
  designated TPI resources.
- The protected `/api/admin/notifications` route now provides unread/read/all
  metadata browsing over `member_notifications`. Notification bodies and action
  URLs are excluded, and no send/edit/read/delete mutation is exposed.
- Anonymous boundary checks: preview, exact preview asset,
  `/api/admin/notifications`, `/api/admin/reports`, and `/admin-panel.html`
  returned HTTP 403; `/live-video` returned HTTP 200 with Coming Soon
  preserved; updated parity and security docs returned HTTP 200.
- No D1 migration, notification mutation, R2 operation, credential change,
  `/admin-panel` replacement, or Creator Studio access expansion was performed.

## Creator Channels metadata directory release

- Git commit: `18ceb20` pushed to `origin/main`.
- Cloudflare Version ID: `9d360f2f-965b-4b46-bf6f-5ba467df29b4`.
- Preview asset: `/admin-center-preview/assets/index-BM2E7VZ7.js`.
- Dry run: PASS — `TPI_DB`, `TPI_MEDIA`, and `ASSETS` resolved to the
  designated TPI resources.
- The protected `/api/admin/channels` route now provides public/private
  visibility and channel/owner search filters plus published-video counts from
  `tpi_video_channels`. It remains metadata-only and exposes no channel or
  video lifecycle mutation.
- Anonymous boundary checks: preview, exact preview asset,
  `/api/admin/channels`, `/api/admin/notifications`, `/api/admin/reports`, and
  `/admin-panel.html` returned HTTP 403; `/live-video` returned HTTP 200 with
  Coming Soon preserved; the parity matrix returned HTTP 200.
- No D1 migration, channel mutation, R2 operation, credential change,
  `/admin-panel` replacement, or Creator Studio access expansion was performed.

## Roles & Permissions summary release

- Git commit: `f643b81` pushed to `origin/main`.
- Cloudflare Version ID: `b1e22ab4-779c-45e7-8d6e-4826bfedb821`.
- Preview asset: `/admin-center-preview/assets/index-DVENW52k.js`.
- Dry run: PASS — `TPI_DB`, `TPI_MEDIA`, and `ASSETS` resolved to the
  designated TPI resources.
- The protected `/api/admin/roles` route now provides aggregate role,
  active-account, and `can_post`/`can_comment`/`can_message` counts from the
  existing contributor records. It returns no password/session data and adds
  no role, capability, or restriction mutation.
- Anonymous boundary checks: preview, exact preview asset, `/api/admin/roles`,
  `/api/admin/channels`, `/api/admin/notifications`, `/api/admin/reports`, and
  `/admin-panel.html` returned HTTP 403; `/live-video` returned HTTP 200 with
  Coming Soon preserved; member-management documentation returned HTTP 200.
- No D1 migration, account mutation, R2 operation, credential change,
  `/admin-panel` replacement, or Creator Studio access expansion was performed.

## Security boundary view release

- Git commit: `1a650708993b1c16cb3ae7502c8d9dec00a2e418` pushed to `origin/main`.
- Cloudflare Version ID: `af0b5ce1-9cf1-404a-a0b7-86f42c75a871`.
- Preview asset: `/admin-center-preview/assets/index-FI-EnamA.js`.
- Dry run: PASS — account `221ea5479876fd303ddc87002b9e892d`, Worker
  `theparanormalinitiative`, D1 `tpi_contributor_portal`, R2
  `tpi-contributor-media`, and `ASSETS` binding were confirmed.
- The protected preview now has an explicit read-only Security boundary view
  documenting the existing admin/API gates, preserved Creator Studio and
  `/admin-panel` boundaries, private-data exclusions, and `/live-video`
  Coming Soon state. It adds no authorization or data mutation system.
- Anonymous boundary checks: preview HTML, exact preview asset,
  `/admin-panel.html`, `/api/admin/restrictions`, `/api/admin/roles`,
  `/api/admin/channels`, `/api/admin/notifications`, and
  `/api/admin/reports` returned HTTP 403; `/live-video` returned HTTP 200
  with Coming Soon; parity, security, and owner-checklist docs returned
  HTTP 200.
- Authenticated owner/admin Security view, role-matrix, and session-expiry
  testing remain pending without an authorized session. No D1 migration,
  R2 operation, production-data mutation, or `/admin-panel` replacement was
  performed.

## Release documentation sync — parity reconciliation

- Documentation commit: `05b79fe` pushed to `origin/main`.
- Documentation sync Cloudflare Version ID: `fb1d9db4-0bbc-4d2a-8725-e4ed4299e904`.
- The sync corrected the current baseline, integration summary, creator/content
  status, and latest documentation pointers; runtime code remained unchanged.

## Release documentation sync — Account Restrictions

- Documentation commit: `bfb18e9` pushed to `origin/main`.
- Documentation sync Cloudflare Version ID: `4a139d16-f32e-4ca8-9b03-151d30b2050f`.
- The sync published the corrected current-status baseline, parity summaries,
  regression results, and Account Restrictions release history; runtime code
  remained unchanged.

## Account Restrictions status release

- Git commit: `daceb96` pushed to `origin/main`.
- Cloudflare Version ID: `c3acc232-061c-4155-ac11-c8c2a68603ac`.
- Preview asset: `/admin-center-preview/assets/index-BDgFA2FY.js`.
- Dry run: PASS — `TPI_DB`, `TPI_MEDIA`, and `ASSETS` resolved to the
  designated TPI resources.
- The protected `/api/admin/restrictions` route now lists only inactive or
  capability-restricted contributor accounts. It excludes user-to-user
  `member_restrictions` rows and exposes no suspension or restriction mutation.
- Final anonymous boundary checks: preview, exact preview asset,
  `/api/admin/restrictions`, `/api/admin/roles`, `/api/admin/channels`,
  `/api/admin/notifications`, `/api/admin/reports`, and `/admin-panel.html`
  returned HTTP 403; `/live-video` returned HTTP 200 with Coming Soon
  preserved; member-management documentation returned HTTP 200.
- No D1 migration, account mutation, R2 operation, credential change,
  `/admin-panel` replacement, or Creator Studio access expansion was performed.

## Release documentation sync — Security boundary

- Documentation commit: `85dc0862c78dd5cf9df1eec4edd25388ce454ac2` pushed to
  `origin/main`.
- Documentation sync Cloudflare Version ID:
  `c629157c-399d-439b-8f1a-8224dc0e40d2`.
- The sync published the Security boundary release evidence and final
  regression results; runtime code remained unchanged.

## Community Comments queue release

- Git commit: `86b8279d3deb2ccbd22c3422ca5bf8755b36261d` pushed to
  `origin/main`.
- Cloudflare Version ID: `15415be0-ecc1-426e-90d6-642eb8d82dca`.
- Preview asset: `/admin-center-preview/assets/index-Dbr2-v9H.js`.
- Dry run: PASS — account `221ea5479876fd303ddc87002b9e892d`, Worker
  `theparanormalinitiative`, D1 `tpi_contributor_portal`, R2
  `tpi-contributor-media`, and `ASSETS` binding were confirmed.
- The protected `/api/admin/community/comments` route now provides a
  metadata-only Community Feed comment queue backed by `community_comments`
  with visible/deleted/all filters, search, bounded previews, and pagination.
  It exposes no administrative comment mutation.
- Anonymous boundary checks: preview HTML, exact preview asset,
  `/api/admin/community/comments?status=visible`,
  `/api/admin/community/comments?status=deleted`, `/admin-panel.html`,
  `/api/admin/overview`, `/api/admin/reports`, and
  `/api/admin/notifications` returned HTTP 403; `/live-video` returned HTTP
  200 with Coming Soon; parity and security docs returned HTTP 200.
- No D1 migration, Community Feed record mutation, R2 operation, credential
  change, `/admin-panel` replacement, or Creator Studio access expansion was
  performed.

## Release documentation sync — Community Comments

- Documentation commit: `7e36035c67e9d799367e2e0ff806c0cac76b2e33` pushed to
  `origin/main`.
- Documentation sync Cloudflare Version ID:
  `6002a341-89f4-4133-bf08-832d74ac23b1`.
- The sync published the Community Comments release evidence and regression
  results; runtime code remained unchanged.

## Events review queue release

- Git commit: `52e67a8c15e7547cf7bf4e9e7aaca8262d1e6c6a` pushed to
  `origin/main`.
- Cloudflare Version ID: `87900f2f-d620-412d-8fc0-e57d2dd16331`.
- Preview asset: `/admin-center-preview/assets/index-CQ5r140J.js`.
- Dry run: PASS — account `221ea5479876fd303ddc87002b9e892d`, Worker
  `theparanormalinitiative`, D1 `tpi_contributor_portal`, R2
  `tpi-contributor-media`, and `ASSETS` binding were confirmed.
- The protected `/api/admin/events` route now provides a metadata-only review
  queue over the existing `events` table with approved/pending/rejected/
  cancelled/all filters, search, and pagination. Private submission fields
  and event mutations remain excluded.
- Anonymous boundary checks: preview HTML, exact preview asset, all five
  `/api/admin/events` status variants, and `/admin-panel.html` returned HTTP
  403; `/live-video` returned HTTP 200 with Coming Soon; parity and security
  docs returned HTTP 200.
- No D1 migration, event mutation, R2 operation, credential change,
  `/admin-panel` replacement, or Creator Studio access expansion was
  performed.

## Release documentation sync — Events

- Documentation commit: `2b7540f28e246a366a317935ae6a5736f9077541` pushed to
  `origin/main`.
- Documentation sync Cloudflare Version ID:
  `20d0738b-1900-49e5-83d6-970519fa36ee`.
- The sync published the Events review-queue release evidence and regression
  results; runtime code remained unchanged.

## Audit Logs pagination release

- Git commit: `42e6ff2` pushed to `origin/main`.
- Cloudflare Version ID: `575453ba-7c6b-4830-8374-7ac37b509983`.
- Preview asset: `/admin-center-preview/assets/index-CXNAwm4r.js`.
- Dry run: PASS — account `221ea5479876fd303ddc87002b9e892d`, Worker
  `theparanormalinitiative`, D1 `tpi_contributor_portal`, R2
  `tpi-contributor-media`, and `ASSETS` binding were confirmed.
- The protected Audit Logs view now uses the existing `/admin/audit-logs`
  contract with bounded query pagination, a matching-record count, and
  previous/next controls. Moderation History remains client-filtered and the
  integrated view remains explicitly read-only.
- Source/build checks: PASS — Admin Center TypeScript/Vite production build,
  `git diff --check`, and focused QA 50/50. Vite emitted only its existing
  large-chunk advisory.
- Anonymous boundary checks after deployment: preview HTML, exact preview
  asset, `/api/admin/audit-logs?page=1&limit=50`, and `/admin-panel.html`
  returned HTTP 403; `/live-video` returned HTTP 200 with Coming Soon
  preserved; the published parity documentation returned HTTP 200.
- Authenticated owner/admin browser rendering, pagination interaction, and
  rollback verification remain pending an authorized browser session and are
  not claimed as passed.
- No D1 migration, production record mutation, R2 operation, credential
  change, `/admin-panel` replacement, or Creator Studio access expansion was
  performed.

## Audit Logs search repair release

- Git commit: `fd05c8ab324bf9443d5bed136319c3999b96b17e` pushed to
  `origin/main`.
- Cloudflare Version ID: `e579674d-4805-4917-98e6-63f921f12d0c`.
- Preview asset: `/admin-center-preview/assets/index-R-ZadZ2y.js`.
- Dry run: PASS — account `221ea5479876fd303ddc87002b9e892d`, Worker
  `theparanormalinitiative`, D1 `tpi_contributor_portal`, R2
  `tpi-contributor-media`, and `ASSETS` binding were confirmed.
- Corrected the protected Audit Logs search submit path so Enter reloads the
  current query even when the user is already on page 1. Pagination and
  read-only boundaries remain unchanged.
- Source/build checks: PASS — Admin Center TypeScript/Vite production build,
  Worker syntax, legacy-admin syntax, `git diff --check`, and focused QA
  52/52. Vite emitted only its existing large-chunk advisory.
- Anonymous boundary checks after deployment: preview HTML, exact preview
  asset, `/api/admin/audit-logs?page=1&limit=50`, and `/admin-panel.html`
  returned HTTP 403; `/live-video` returned HTTP 200 with Coming Soon
  preserved; the published regression documentation returned HTTP 200.
- Authenticated Audit Logs search interaction remains pending an authorized
  browser session and is not claimed as owner-verified.
- No D1 migration, production record mutation, R2 operation, credential
  change, `/admin-panel` replacement, or Creator Studio access expansion was
  performed.

## Release documentation sync — protected Analytics contract

- Documentation commit: `8f35faafad4898c9b96869989590a501054564f8` pushed to
  `origin/main`.
- Documentation sync Cloudflare Version ID:
  `2fd65d58-2f2b-4206-98ab-271b05ed9389`.
- The sync published the Analytics release evidence and regression results;
  runtime code remained unchanged.

## Release documentation sync — Audit Logs pagination

- Documentation commit: `35476abc83c8d6efcc3bbd68c621a74759badb94` pushed to
  `origin/main`.
- Documentation sync Cloudflare Version ID:
  `b2e28c73-45d1-4aee-a96c-7bd54d191db9`.
- The sync published the Audit Logs pagination release evidence and regression
  results; runtime code remained unchanged.

## Final release documentation sync — Audit Logs pagination

- Documentation-history commit: `5995dc8d36a8a9095f4503eb3ae21d0007ad4583`
  pushed to `origin/main`.
- Final documentation sync Cloudflare Version ID:
  `ca8bed91-669b-4d34-b388-bd80e2b7ee9e`.
- This final sync published the preceding documentation-sync identifier in
  the release history; runtime code remained unchanged.

## Protected Analytics contract release

- Git commit: `7fa6a9d9457d77856f7bf7e36981f9ec3f67f96a` pushed to
  `origin/main`.
- Cloudflare Version ID: `e092586e-4f6c-44ac-910a-06517661f691`.
- Preview asset: `/admin-center-preview/assets/index-6AjarIbz.js`.
- Dry run: PASS — account `221ea5479876fd303ddc87002b9e892d`, Worker
  `theparanormalinitiative`, D1 `tpi_contributor_portal`, R2
  `tpi-contributor-media`, and `ASSETS` binding were confirmed.
- The Analytics view now queries the existing protected `/admin/analytics`
  endpoint directly and renders its authoritative trend definitions. No
  mutation or new data source was introduced.
- Source/build checks: PASS — Admin Center TypeScript/Vite production build,
  Worker syntax, legacy-admin syntax, `git diff --check`, and focused QA
  51/51. Vite emitted only its existing large-chunk advisory.
- Anonymous boundary checks after deployment: preview HTML, exact preview
  asset, `/api/admin/analytics?range=30d`, and `/admin-panel.html` returned
  HTTP 403; `/live-video` returned HTTP 200 with Coming Soon preserved; the
  published parity matrix returned HTTP 200.
- Authenticated owner/admin Analytics rendering and range/filter interaction
  remain pending an authorized browser session and are not claimed as passed.
- No D1 migration, production record mutation, R2 operation, credential
  change, `/admin-panel` replacement, or Creator Studio access expansion was
  performed.
