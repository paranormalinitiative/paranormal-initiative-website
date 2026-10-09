# TPI Settings Center migration — October 9, 2026

Authoritative source: GitHub checkout, `member-dashboard.html`. The existing main-nav Settings destination is unchanged. Reference: isolated `/Users/toddknipple/Desktop/Paracommunity Fresh Build/app/pages/settings*.mjs` and its settings navigation/data inventory. The clone was not edited or deployed.

## Scope and current behavior

All five reference groups and twelve primary sections are represented, with searchable navigation, direct hash links, a responsive desktop sidebar/mobile section menu, and TPI theme-token styling. This is a Settings structure migration, not a claim that every reference feature is implemented.

| Group | Section | Current implementation |
| --- | --- | --- |
| Your Account | Account & Security | Existing username/password handlers and identity; existing sign-in recovery link. Reflowed fields to fit the Settings content column. |
| Your Account | Profile Settings | Real name/bio preview; link to the existing complete profile editor (no duplicate form that could clear private fields). |
| Your Account | Profile Visibility | Public/private controls visibly disabled pending server-side protection of every applicable route. No existing visibility changed. |
| Privacy & Safety | Privacy & Safety | Related sections, current Contact & Links path, reserved disabled safety-message form. |
| Privacy & Safety | Blocked Users | Reads the member's actual existing Messenger blocks, searchable. Unblocking remains in existing conversation controls; no claim of feed/profile blocking. |
| Preferences | Personalization | Six existing TPI site themes, independent profile Highlights, six heading-font choices, live preview, explicit account save/reset-preview controls. |
| Preferences | Notifications | Existing real per-category API/UI, instant saving and defaults reset. Device push controls remain disabled. |
| Preferences | Content & Feed | All six reference preference areas and advanced filtering areas reserved/disabled. Contributor articles continue to stay out of the social feed. |
| Data & Support | Data & Account Files | Working private Photos/Videos/Files links. Reserved request form is disabled; no export/deletion or account-removal action. |
| Data & Support | Help & Support | Working existing contact-page link; reserved in-app message form is disabled. |
| Data & Support | Legal & Policies | Eight linked policy areas, explicitly awaiting approved TPI wording. Reference legal text/promises/counts are not adopted. |
| Monetization | Payments | Promoted Posts, Sponsored Posts, Business & Creator Tools, Billing History are coming-soon information only. No charges or new sponsored feed behavior. |

Secondary areas: Reel Preferences, Message Requests, Reporting & Moderation. Policy areas: Terms, Privacy, Community Guidelines, Data Deletion, Safety & Reporting, Cookies, Copyright/IP, Child Safety. These are navigable review placeholders, not approved policy documents or active enforcement controls.

## Themes versus Highlights

- Site themes retain their six original palettes and member-area behavior. Added the missing `/api/contributors/me/theme` POST handler: the previous picker called an unhandled route. Saving now reports success or restores the prior browser theme on failure.
- Highlights are profile-only name/avatar-ring presentation choices: Follow my theme, Cryptid Green, Field Blue, Séance Rose, Cosmic Cyan, Investigation Amber, Gothic Purple. They do not replace the full-site theme.
- Fonts affect profile headings, not forms or the whole site. Appearance choices reach both `member-profile.html` and `contributor-profile.html`.
- `0038_member_personalization.sql` creates an additive owner-keyed table. Applied locally and remotely and schema verified. Remote SQL-file import returned Cloudflare authentication error 10000; the equivalent direct CREATE query succeeded. No existing account/content records changed by the migration.
- Authenticated GET/POST `/api/me/personalization` uses the session owner only; supported values are validated. Public GET `/api/profile-style?username=...` returns only the two presentation choices. GET `/api/me/blocked-users` exposes only the caller's existing Messenger blocks.

## Files / cache versions

`member-dashboard.html`, `member-settings.js/css` v1, `profile-style.js/css` v1, `lib/member-settings.js`, API router, migration 0038, private/public profile pages. Shared `member-shell.js` v55 (all root HTML references bumped). Main-nav Settings is not duplicated. No Desktop playground or clone source changes; untracked `data/` is preserved.

## Verification

Checked-in runner: `scripts/e2e/member-settings.mjs`, Node with `node:sqlite` and Playwright. Set `SETTINGS_PLAYWRIGHT` to an available Playwright module path and optionally `SETTINGS_CHROME` to the Chrome executable.

Verified synthetic two-member API/SQLite auth gates, supported-value validation, owner isolation, saved theme choices, public style-only payload, and real Messenger block-list queries. Actual shared member shell/Settings frontend tested at 1440, 1024, 768, and 390px: all twelve sections, eight policy areas, three secondary routes, search, direct links, saved choices/reload, failed-save rollback, profile font application. No JavaScript errors or Settings control overflow. Other background APIs return empty fixtures; no live member credentials were used, and no live member account/password/profile was edited.

Production feature commit `4d0c4a7` was pushed to main and deployed with Wrangler as Cloudflare Version ID `b10402aa-ceb2-4373-9156-5d861ee71c46`. Live Settings HTML, Settings/Profile style assets, both profile pages and shared shell returned 200 and matched local source bytes. Anonymous personalization GET/POST, theme-save POST, and block-list GET returned 401; a missing public-style username returned 404. A signed-in production save still needs a normal member-session smoke check; synthetic checks are not that check. Subsequent handoff-document deployment carries the same verified feature code.

## Next pass

Todd will review the migrated sections and approve community-specific wording and behavior. Privacy enforcement, feed ranking/filtering, device push, in-app support/data-request workflows, legal wording, and monetization remain separate implementation/approval work. Do not enable placeholder switches or transplant the clone's mock persistence/legal claims.
