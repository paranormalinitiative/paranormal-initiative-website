# StudioFlow Firefox Acceptance Window Repair

Date: 2026-10-22

## Problem

The isolated Firefox Developer Edition acceptance runner completed its page
rendering and automation in a Selenium-managed disposable profile, but macOS
exposed the Marionette window as a zero-size or non-visible native window. The
owner therefore could not see the manual production login prompt.

## Repair

`scripts/verify/tpi-studioflow-firefox-acceptance.mjs` now:

- requests a separate Firefox instance with `-no-remote` and `-new-instance`;
- raises and sizes the newest isolated window when macOS exposes it as blank;
- opens a normal, explicitly sized login popup inside the same disposable
  profile for manual production authentication;
- attaches the acceptance driver to that popup when Firefox creates it; and
- repeats the focus operation after the login page is loaded.

The fallback uses a visible Firefox Private Browsing window when the host
cannot expose the Selenium-created profile. The private window is separate
from the owner's normal browser storage and is not used for Crossroads data.

## Verification

- The existing normal Firefox window and its two tabs were preserved.
- A visible private Firefox window opened at the production member login page.
- The normal owner profile was not used for the acceptance profile.
- No production deployment or owner-data mutation was performed as part of
  this launcher repair.

## Remaining acceptance step

Manual sign-in in the visible isolated/private Firefox window is still
required before live production acceptance can continue. Credentials must be
entered by the owner in the browser; they are not stored in the repository or
sent through the test command.

## Safety finding during follow-up

The visible Firefox Private Browsing window authenticated successfully, but
then displayed the protected `Crossroads of the Unknown` identity. It is
therefore not accepted as an isolated test context. No studio switch, upload,
delete, backup, restore, or other StudioFlow mutation was performed in that
window. Live acceptance and deployment remain stopped until Firefox provides a
genuinely separate profile/storage context.
