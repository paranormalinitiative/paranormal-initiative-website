# MIMO DIRECTIVE — TPI Website (read this before every session)

> **Naming:** this file keeps its historical name, but "MiMo" = **Opencode**, Todd's coder/assistant
> agent. You implement directives written by **Buffy (Codebuff)**, the architect agent. Todd approves
> everything. Team roster + project state live in **MASTER_BUILD_PLAN.md** — log your work there
> (mark: `[OPENCODE]`) as well as the handoff note in §6.

You are working on **github.com/paranormalinitiative/paranormal-initiative-website** (branch `main`),
live at **https://paranormalinitiative.com** via Cloudflare Workers (`npx wrangler deploy`).
Owner: **Todd** (Todd_Wayne, admin, paranormalinitiative@yahoo.com).
You share this repo with **another AI agent (Codebuff/Buffy)** working in parallel. The rules below
exist so neither of you destroys the other's work.

**Official Cloudflare target:** `Paranormalsomerset@gmail.com's Account`
(`paranormalsomerset@gmail.com`), account ID
`221ea5479876fd303ddc87002b9e892d`, Free plan. The production Worker is
`theparanormalinitiative`, with custom domain `paranormalinitiative.com`.
`wrangler.toml` pins this account ID. Never deploy TPI to another account
without explicit owner approval.

---

## 1. The Iron Rules (never break these)

1. **`git pull origin main` before you start. `git push` before you finish.** The workspace sync
   (`~/Desktop/sync-tpi-workspace.command`) is pull-only — anything you leave uncommitted or unpushed
   does NOT travel to the other agent. Finish = committed AND pushed.
2. **Never force-push, never rebase, never reset.** History is shared. If a push is rejected, pull and retry — never `-f`.
3. **Deploy = last-write-wins on the whole worker.** `npx wrangler deploy` ships the ENTIRE repo state.
   If the other agent pushed work you don't have, your deploy erases it from production. So:
   pull immediately before deploying, and confirm the Version ID printed (see §3).
4. **Stay in your lane.** Your assignment comes from a per-task DIRECTIVE (see "How you get
   tasks" below). The standing default is the EVENTS system (events.html, submit-event.html,
   admin-events.html, event scrapers, D1 events tables). Do not "fix" things outside your current
   directive — especially NOT the member portal (member-home, member-profile, member-dashboard,
   member-login, member-shell.*), the landing page (index.html hero), or the themes. If you see a
   bug elsewhere, REPORT it in your handoff note instead of touching it.

### How you get tasks

Todd runs a two-agent workflow: **Codebuff (the other agent) writes a per-task directive; Todd hands
it to you with the sync.** When one is in force:

- That directive is your assignment for the session — do ONLY what it says, exactly as scoped.
- The standing default lane above applies only when no per-task directive is in force.
- Do not expand scope, do not "improve" adjacent things you happen to notice — report them instead.
- If a directive and this file conflict, the directive wins; if a directive seems to break an Iron
  Rule (§1), stop and ask Todd instead of following it.

5. **Check `git log --oneline -10` before every commit** to see what the other agent landed. Never
   stage files you didn't change.

## 2. Staging hygiene (repo has local junk files)

```bash
git add <only your files>          # never `git add -A`
```
Permanently exclude: `.DS_Store`, `assets/.DS_Store`, `.freebuff/`, `itc-visual-studio.zip`.
Never commit them, never "clean them up," never add a .gitignore change without asking Todd.

## 3. Deploy discipline

```bash
npx wrangler deploy 2>&1 | tail -4
```
- Before deploying, verify the pinned account and target bindings with
  `npx wrangler whoami`, `npx wrangler deployments list --name theparanormalinitiative`,
  `npx wrangler d1 info tpi_contributor_portal`, and
  `npx wrangler r2 bucket list`. The expected account ID is
  `221ea5479876fd303ddc87002b9e892d`; expected D1 ID is
  `f36b9161-b517-4634-9857-bef4147cefe3`; expected R2 bucket is
  `tpi-contributor-media`.
- You MUST see `Current Version ID: <uuid>` in the output. **No Version ID printed = NOT deployed.**
  This failure mode has happened once already and cost a whole debugging session (Todd saw a stale
  site and thought features were missing). Re-run the deploy if in doubt.
- Verify after every deploy with `curl -sL https://paranormalinitiative.com/<page>` (the `-L` matters).
- D1 database binding is `TPI_DB` (`tpi_contributor_portal`). Migrations: apply to BOTH local and
  remote (`npx wrangler d1 migrations apply TPI_DB --local` and `--remote`), verify with pragma/table check.
  Local wrangler dev needs `--compatibility-date 2026-07-15` (installed workerd is older than the
  project's 2026-07-18); local `sessions` table has NO id column (token is the PK).

## 4. Code conventions (break these and the site breaks visually)

- **Cache-bust every changed static asset.** Pages reference `style.css?v=85`, `member-shell.css?v=59`,
  `member-shell.js?v=55`, `member-login.js?v=38`, etc. If you edit one of those files, bump its `?v=`
  on EVERY page that references it, then `grep` for the old version to confirm 0 stale refs.
- **Themes: six member themes** (cryptid default, asylum, seance, fieldops, cosmic, gothicnight) driven
  by CSS custom properties (`--accent`, `--bg`, `--text`, `--purple-700`, …). NEVER hardcode hex colors
  in HTML/CSS — use tokens or `color-mix(in srgb, var(--accent) X%, transparent)`. Adding a theme has
  SEVEN touchpoints (style.css tokens, member-shell.js SITE_THEMES, dashboard picker, teams.css block,
  teams bootstrap regex ×7 pages, studio bridge, backend MEMBER_THEMES allowlist).
- **TPI interface visual identity:** All new or modified TPI interfaces must follow the existing
  Paranormal Initiative website design system. The existing website is the visual source of truth.
  Refine, shadcn/ui, or any other component framework must be configured to use TPI's established
  colors, typography, spacing, and theme behavior. Generic white dashboards, default framework themes,
  and unrelated visual styles are not acceptable. Visual consistency must be verified before a feature
  is considered complete.
- **Permanent release requirement:** Every completed and verified TPI development batch must be
  committed to the approved Git repository, pushed to the approved remote, deployed to the designated
  Cloudflare environment, and verified on the live domain. Approved production fixes must be deployed
  to production. Unapproved replacement applications must remain in their protected preview
  environment until owner acceptance. Every completion report must include the Git commit, Cloudflare
  deployment ID, live URL, and verification results. Do not claim completion when implementation
  remains only in local files.
- **TPI Studio (`studio/`)** is a built bundle, not source — DO NOT modify it. It's gated: non-leadership
  gets a Coming Soon page (worker.js STUDIO_GATE_HTML) and a disabled nav item.
- **Specificity traps in style.css:** `.editor-access-card` is `width:min(440px,100%)` (wide cards need
  an explicit width class) and `.editor-access-card label { display:grid }` beats single-class flex —
  scope custom rows under a container class.
- `getSignedInUser` is closure-private in includes.js/member-shell.js — gates must call
  `/api/auth/me` directly.

## 5. Current state (as of Oct 5, 2026)

- Landing/front door: index.html = public "Explore before you join" pitch + teaser cards;
  `/?member=1` redirects to member-home.html. ONE home page. Don't reintroduce a second one.
- Member pages: member-home (composer + community feed + My Content), member-profile (identity summary
  + editable form + footer buttons Edit Profile / Save Profile / View Public Profile),
  member-dashboard = Settings only (login settings + color themes).
- Events system is YOURS: it now has D1 wiring + cron scraping per your recent commits
  (`e8833d6`…`964bf17`, 177 events). Full architecture notes live in
  **UI_REDESIGN_LOG.md → "TPI Event System — Technical Handoff"** (file map, scraper spec, schema,
  display rules Todd approved: dated events first, locations prominent, virtual last).
- Prod session cookie for testing as Todd: `tpi_session` (Todd provides the token when needed —
  ALWAYS restore it after any visitor-mode test: clearing cookies logs him out).

## 6. Every session ends with a handoff note

Append to **STUDIOFLOW_MASTER_TODO.md** (dated entry, "session: mimo") covering:
what you changed, deploy Version ID, what you verified on prod, what you did NOT finish,
and anything the other agent needs to know (files touched, new migrations, new cache versions).
Then commit (message explains the WHY, ends with your agent signature) and push.

**Documentation files that must stay current:** UI_REDESIGN_LOG.md, SITE_STREAMLINING_PLAN.md,
STUDIOFLOW_MASTER_TODO.md. If you shipped a feature and didn't log it, you're not done.

## 7. Escalate, don't assume

If a task is ambiguous, if two approaches both seem fine, or if you're about to touch something
outside your lane — STOP and ask Todd. He runs this site and answers fast. Guessing wrong on a
live site is worse than a one-line question.
