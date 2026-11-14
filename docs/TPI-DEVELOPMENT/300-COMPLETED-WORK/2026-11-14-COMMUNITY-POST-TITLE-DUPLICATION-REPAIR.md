# Community Post Title Duplication Repair

## Incident record

- **Date:** 2026-11-14
- **Time reported:** 14:24:59 ET
- **Reported by:** Todd Wayne, Owner/Founder/CEO
- **Area:** Community Feed post composer and post card rendering
- **Scope:** Site-wide member Community Feed
- **Protected applications changed:** None. StudioFlow, Nova Editorial Workspace,
  and Creator Studio were not modified.

## What happened

The supplied post began with a bold heading followed by the message. The feed
displayed that opening text twice:

1. The composer automatically derived a title from the first 120 characters of
   the complete message.
2. The composer also sent the complete message unchanged as the body.
3. The feed rendered the generated title and the body together.

Because the old title generator used a character count, the title could also
contain several sentences instead of being a clean one-line headline.

## Root cause

The Community Feed post model requires both a title and body. The composer
filled the required title by taking a prefix of the body, but did not remove the
derived title from the body. The renderer had no legacy-duplicate check, so it
could not distinguish an intentional title from a generated title that was
already present in the body.

## Repair applied

- Auto-title generation now uses the first non-empty line rather than the first
  120 characters of the entire message.
- Multi-line submissions store the opening line as the title and the remaining
  message as the body.
- Single-line submissions remain valid and are shown once.
- Existing database records remain unchanged. The renderer suppresses a title
  only when the normalized body already begins with that same title, which
  removes the old visual duplication without rewriting history.
- Added source-contract checks for the new composer payload and the legacy
  renderer behavior.

## Verification

- Member interaction source contracts: **16/16 passed**.
- Official Firefox member/profile regression: **50/50 passed**.
- Existing profile, navigation, feed, and protected-application checks remained
  passing.
- No historical Community Feed data was modified.

## Release record

- **Source branch:** `codex/tpi-development`
- **Release classification:** Website/member experience
- **Protected applications:** StudioFlow, Nova Workspace, and Creator Studio
  remain outside the release scope.
- **Production status:** Must pass the guarded website preflight and deployment
  before being considered live.

## Reusable lesson

When a database model requires a title but the UI accepts one free-form message,
the composer must define whether the first line is a title or body content. It
must never send the same generated text into both fields without a renderer
fallback for records created by the older behavior.

## Source references

- [`member-home.html`](../../../member-home.html) — composer and Community Feed card renderer
- [`tpi-member-interactions.mjs`](../../../scripts/verify/tpi-member-interactions.mjs) — source contracts
- [`tpi-member-profile-feed-firefox.mjs`](../../../scripts/verify/tpi-member-profile-feed-firefox.mjs) — browser regression
- [`TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md`](../TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md) — living incident reference
