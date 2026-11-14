# Notification Deep Links and Timestamp Repair

## Incident record

- Date: 2026-11-14
- Time recorded: 13:14:53 EST
- Area: Member notifications and Community Feed
- Scope: Site-wide member experience; verified against the shared source used by all browsers
- Protected applications changed: None. StudioFlow, Nova Editorial Workspace, and Creator Studio were not modified.

## What happened

Notification Open links reached the member home URL with the correct post hash, but the Community Feed did not reliably scroll to the matching post after the feed and link previews finished laying out. In Chrome this looked like the notification had not opened the post.

Some notification records came from SQLite `CURRENT_TIMESTAMP`, which is UTC text without a timezone suffix. The browser interpreted that text as local time. For users in a negative UTC offset, the calculated age could become negative and was clamped to `just now`, even when the notification was hours old.

## How it was fixed

1. Notification timestamps now explicitly parse SQLite timestamp text as UTC before calculating relative time or the exact local tooltip time.
2. Notification metadata now exposes the exact localized timestamp on hover while keeping the readable relative label such as `10m ago` or `5d ago`.
3. Community Feed post focusing now retries briefly while the feed finishes rendering and layout-changing previews settle, then uses a deterministic scroll fallback. This preserves the exact post deep link across browsers.
4. The shared `member-login.js` cache version was advanced site-wide so every page receives the repaired notification formatter.
5. Regression checks were added for UTC timestamp parsing and delayed post focusing.

## Verification

- Existing member interaction regression checks: passed.
- New timestamp and post-focus source checks: passed.
- Live Chrome diagnostic: the notification navigated to the exact post URL and the matching post card was present; the missing behavior was confirmed to be the scroll/focus step.
- Browser policy: the implementation uses standard anchors, URL hashes, `Date`, and `scrollIntoView`, with no browser-specific share or navigation API dependency.
- Release classification: website/member experience only; protected application source and deployments were not included.

## Reference lesson

When a notification appears to open the wrong place, check both the destination URL and whether the target card is actually visible. A correct hash can still fail the user experience if asynchronous feed rendering or image/link-preview layout shifts cancel the initial scroll.
