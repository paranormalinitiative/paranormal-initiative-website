# TPI-UI-003 Accessibility

The repair preserves the existing semantic workspace header, Settings and
Administration navigation landmarks, search input, buttons, links, focus
styles, and keyboard-operated menu controls. The new account slot is a labeled
group and does not remove the authenticated account menu or Messenger actions.

The existing mobile Administration menu toggle, Settings search, Back to TPI,
Sign Out, and Messenger controls remain in the DOM and keep their existing
handlers. No screen-reader or keyboard behavior was intentionally removed.

Automated source checks and JavaScript syntax checks pass. Authenticated
keyboard traversal, screen-reader announcements, contrast, zoom, and rendered
focus testing remain owner-assisted verification items rather than being
claimed as completed browser acceptance.
