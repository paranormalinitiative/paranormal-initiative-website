# TPI Member Help Center — Facebook-Reference Guide Expansion

Date: 2026-11-14 22:11 ET
Status: DEPLOYED AND LIVE-VERIFIED

## Purpose

Expanded the member-facing Help Center so a member can find ordinary product
guidance, account help, safety information, and reporting routes without being
shown internal Help Desk procedures.

The information architecture takes the familiar expandable topic-group pattern
of the Facebook Help Center as a usability reference. TPI does not copy
Facebook article text, branding, or product rules. The labels, examples, safety
boundaries, and guidance are written for The Paranormal Initiative.

## Member topics added or clarified

- Creating an account
- Your profile
- Friending
- Home Page and Member Home
- Messaging
- Reels
- Stories
- Photos
- Videos, including external-link previews and direct fallbacks
- Accessibility
- Login, recovery & security
- Managing your account
- Privacy and safety
- Policies and community standards
- Reporting a bug or community issue
- Reporting abuse, harmful content, or a privacy concern

Pages and Groups remain intentionally deferred. They are not presented as live
member features until their permissions, publishing rules, and support content
are ready.

## Audience boundary

This change updates `help-center-data.js`, the member Help Center only. The
internal Help Desk remains a separate protected experience in the
Administration Center. No staff procedures, ban instructions, role guidance,
or administrative controls were added to the member Help Center.

## Freshness safeguard

The member shell now references `help-center-data.js?v=3` so browsers and the
maintained local Worker do not keep the older article inventory after release.
The maintained `npm run dev:local:refresh` workflow remains the supported local
freshness boundary; it must not touch the protected StudioFlow, Nova, or Creator
Studio application directories.

## Verification plan

- `node --check help-center-data.js`
- `node --check help-center.js`
- `git diff --check`
- `npm run verify:help-center-separation`
- `npm run release:preflight`
- Guarded production deployment and isolated Firefox Developer Edition live
  acceptance through the maintained runbook

## Release evidence

- Source commit: `3b8669dc87ae5dce6d9c0e09a705998df33016b6`
- Release candidate: `rel-3b8669dc87ae-4b2f91c483dc`
- Preflight: **READY**, 35 workflow gates; Help Center separation **13/13**;
  profile/feed browser regression **53/53**
- Protected application integrity: **passed**; StudioFlow, Nova, and Creator
  Studio assets remained unchanged
- Production Worker: `4ffc57d6-006f-4553-86f9-e0ab77bb667d`
- Rollback Worker: `59cf78af-f9d1-4bc8-b7ef-4fd2d2294b00`
- Live anonymous production smoke: **10/10 passed**
- Production release result: **DEPLOYED_AND_VERIFIED**

The separation regression now checks the requested member topic inventory and
asserts that Pages and Groups remain deferred.
