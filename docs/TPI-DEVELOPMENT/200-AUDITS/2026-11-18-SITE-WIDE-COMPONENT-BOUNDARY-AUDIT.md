# TPI Site-Wide Component Boundary Audit

Date: 2026-11-18  
Status: **AUDITED — COMBINED PUBLISHING JOURNEY VERIFIED**

## Purpose

The Paranormal Initiative is a connected community, but a change to one
component must not silently change unrelated components. This audit maps the
shared boundaries, the user journeys that cross them, and the verification
profile each kind of change must trigger.

The rule going forward is:

> Test the component that changed, test every declared boundary it crosses, and
> protect every component outside that boundary with an integrity guard.

## Component tree

```text
TPI platform
├── Public shell and content
│   ├── public navigation, pages, Education Center, Ghostology
│   ├── Haunted Locations and submissions
│   └── public link/video previews
├── Identity boundary
│   ├── registration and verification
│   ├── login, sessions, recovery, logout
│   └── server-derived roles, memberships, and capabilities
├── Member shell
│   ├── Member Home and shared navigation
│   ├── profile, avatar, banner, bio, and honors
│   ├── Community Feed, composer, comments, reactions, and notifications
│   └── Friends and Messenger
├── Publishing boundary
│   ├── Nova Editorial Workspace
│   ├── Education Center article snapshots
│   └── published-article discovery in the Member Feed
├── Protected applications
│   ├── StudioFlow and its local/production runtime
│   ├── Creator Studio
│   └── Administration Center and internal Help Desk
└── Assistant boundary
    ├── Mystic — paranormal/research knowledge
    └── Nova — TPI Help Center and Help Desk knowledge
```

## Shared boundaries that require expanded testing

| Boundary | Authoritative source | Consumers | Required impact profile |
| --- | --- | --- | --- |
| Identity/session | `functions/api/[[path]].js`, `lib/auth.js`, `api-client.js`, login/recovery clients | Every authenticated member surface, StudioFlow, Nova, Admin | Full/shared API |
| Member shell | `member-home.html`, `member-shell.js`, `member-shell.css`, shared fragments | Profile, feed, Messenger, notifications, Friends, public dual-mode pages | Shared API plus member Firefox |
| Community Feed | feed renderer and community routes in `member-home.html` and `functions/api/[[path]].js` | Posts, comments, reactions, notifications, link/media previews, Nova publication discovery | Shared API plus feed/interactions |
| Profile media | `member-profile.html`, profile editor, profile media routes, R2 authorization | Member profiles, comments, feed, Messenger, honors | Shared API plus profile Firefox |
| Messenger | `member-chat.js`, conversation/media routes, member shell | Friends, profile Chat actions, notifications, MP4/ZIP media | Shared API plus Messenger browser/media round trip |
| Nova publication | `paper-editor.js`, `content-editor-nova/`, editorial libraries/routes | Education Center snapshots, publication notifications, Member Feed discovery | Full/shared API plus Nova/editorial gates |
| StudioFlow | `studio/` authoritative source, integrated Worker route/assets | Creator navigation and Studio runtime | StudioFlow profile and protected-app guard |
| Administration Center | `admin-center-app/`, admin APIs, protected routes | Governance, moderation, memberships, Help Desk | Admin profile and protected-app guard |

A file in one row is not automatically isolated if it imports or calls a
boundary in another row. The release classifier must escalate from the
changed file to the boundary it crosses; a feed-only visual change stays
website-scoped only when it does not touch the shared API, auth, shell, or
publication path.

## Requested member journey and evidence

### Nova access handoff incident

The Bill Heiland report exposed a shared identity/navigation boundary defect,
not a Nova document or publication failure. A one-shot `/api/auth/me` read
could make the shared shell treat a real member as a guest during a transient
Worker, network, or rate-limit failure. The shell then rewrote the Nova link to
Member Login, while the login page always returned to Member Home and discarded
the intended workspace. This explains the observed trail:

```text
Nova Editorial Workspace -> Member Login -> Member Home
```

The repair is deliberately boundary-safe:

- `member-shell.js` retries transient session failures before guest fallback;
- the Nova link carries a same-origin `/paper-editor.html` return destination;
- `member-login.js` validates that destination and returns there after a
  confirmed session, while preserving Member Home as the default;
- `paper-editor.js` and the Worker continue to perform independent Nova access
  checks, so a return URL cannot grant contributor access.

The isolated Firefox regression passes **13/13**, including the exact guest
link → login return path and the existing Nova publication → Member Feed
journey. The guarded full-platform release preflight passed **40/40** gates;
live anonymous smoke passed **10/10** and live isolated Firefox acceptance
passed **65/65**. Release `rel-a99ccfe814a0-bca2b2352004` is deployed at 100%
traffic on Worker version `6c6738b2-d2e5-433a-abde-c08a52ed498f`.

The owner-requested journey was checked through maintained local and isolated
verification rather than the owner's browser or production account:

1. **Login and Member Home** — local authentication lifecycle **38/38** at
   pre-restart, post-restart, and post-StudioFlow-build checkpoints; isolated
   Firefox StudioFlow acceptance **65/65**; member Home/profile/feed Firefox
   acceptance **57/57**.
2. **Create a community post** — local community-service integration passed;
   fictional member post creation, update, comment, reaction, and soft-delete
   all passed without touching production data. The interaction source contract
   passed **35/35**.
3. **Open Nova Editorial Workspace** — isolated Nova Firefox/Chromium editor
   acceptance passed **134/134**, including access gates, creation, editing,
   autosave, reload, recovery, revisions, trash/restore, permanent-delete
   confirmation, and responsive behavior.
4. **Create, publish, and return to the feed** — the exact combined Firefox
   journey now passes **11/11** in a disposable Worker: Member Home opens Nova,
   New document creates a Nova-linked paper, the author edits its title,
   Education Center destination, and body, Save persists both metadata and the
   linked document, Publish writes one live Investigation Science article, and
   returning to Member Home renders exactly one matching article feed card with
   the canonical published-article link. The existing editorial workflow
   contracts also pass: R6B **47**, R6C **23**, R6D **47**, R6E **67**, and R6F
   **30**.
5. **Profile updates for members** — Firefox acceptance covered Update Profile,
   short bio, avatar preview/save, banner preview/save, session round-trip, and
   the public profile view. Signup browser acceptance also passed for account
   creation, session establishment, Member Home, and profile edits.
6. **Recovery and operational boundaries** — password recovery/browser
   acceptance passed; community workstation checks passed **22/22**; local
   service checks passed **41/41**; anonymous protected-route boundaries remain
   enforced.

These results establish that the maintained paths are currently green in local
and isolated acceptance. They do not mean every one of the 234 tracked HTML
files has received a fresh visual review; the route inventory remains a
separate audit surface.

## Board cleanup finding

The live authoritative Board Member table contains only:

- Todd Wayne — Board Chair — Research & Investigation
- Keith J. Clark — Advisory Board Member — Ethics & Professional Conduct

Michelle and Rick have no active production Board Member appointment rows.
Their stale public cards were hard-coded in `advisory-board.html`; those cards
are removed in this release. The source contract now prevents those former
profiles and their old image references from being reintroduced accidentally.
Their image files remain unreferenced source artifacts for now; deleting
unique historical assets is a separate archival decision and is not required
to remove their public Board status.

## Legacy-code finding

There is one intentional compatibility boundary in Nova: the legacy article
editor remains available only for migration of older article records. Normal
documents open directly in Nova, and the compatibility surface is hidden until
the authoritative Nova editor is ready. The combined browser journey explicitly
checks that new papers open in Nova and that this legacy boundary remains in
source. It should not be deleted until the remaining legacy article inventory
is migrated and verified; deleting it now would risk making older published or
editable records inaccessible.

The same rule applies to other older routes: preserve a compatibility path only
when a current record or public URL still depends on it, mark it explicitly,
and remove it only after a migration test proves that no record, link, or
published snapshot relies on it.

## Stabilization plan

1. Keep the component tree and boundary table as the release-impact source of
   truth.
2. Add or maintain one focused regression per user-facing component and one
   browser journey per boundary crossing.
3. Keep the protected-application byte guard on StudioFlow, Nova, and Admin so
   an unrelated website release cannot silently rewrite them.
4. Treat `functions/api/[[path]].js`, `lib/auth.js`, shared member shell files,
   and release tooling as high-impact files that require broader certification.
5. Remove duplicate or legacy code only after a record inventory, migration,
   route check, and rollback-safe release prove it is unused.
6. Use synthetic accounts, fictional posts, and disposable media for testing;
   never use Bill's, the owner's, or another member's real content as test
   data.
7. Require the release sequence to end with live anonymous smoke, isolated
   Firefox acceptance, 100% Worker traffic confirmation, and a clean Git tree.

This gives TPI a dependency tree instead of a guess: a feed-only change has a
small verification path, while a shared API or identity change automatically
expands to the full platform boundary.
