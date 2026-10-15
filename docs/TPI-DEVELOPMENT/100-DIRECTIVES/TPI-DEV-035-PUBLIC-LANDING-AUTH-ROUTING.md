# TPI-DEV-035 — Public Landing, Authentication Routing, and Navigation

## Directive scope

TPI-DEV-035 corrects the public/authenticated homepage distinction and restores
the established TPI sidebar navigation on the public landing page. The public
homepage remains /; an authenticated member's canonical destination is
/member-home; the Community Feed remains /explore where that route is used.

The implementation reuses the existing member-shell.js, member-shell.css, and
member-sidebar.html source of truth. It does not introduce a second navigation
system, database migration, import, deployment feature, membership activation,
or StudioFlow room.

## Required boundaries

- Preserve unrelated worktree changes.
- Use the real server session as the authority on hosted origins.
- Keep local preview identities limited to file:, localhost, 127.0.0.1, and [::1].
- Keep public / and authenticated /member-home distinct.
- Keep production and development on the same application implementation.
- Use no D1/R2 writes, migrations, imports, or Founding 50 activation.

## Acceptance targets

- The signed-out landing page renders the existing TPI design system and public navigation.
- Authenticated / requests are redirected server-side to /member-home.
- Stale localStorage preview state cannot create a hosted “Hello” greeting.
- Public sidebar links resolve to public routes; member-only destinations remain protected by login or the existing server gate.
- The landing page exposes Education, Community, Events, Reels, ParaNews, ParaTube, Our Apps, and Contact & Links.
- The shared sidebar remains independently scrollable on desktop and uses the existing mobile navigation behavior.
