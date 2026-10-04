# TPI vs ParaPost Network — Competitive Comparison

**Date:** Oct 4, 2026 · **TPI:** paranormalinitiative.com · **Rival:** parapost.net (Parapost Network)
**Method:** Live exploration of parapost.net (dashboard, reels, live, friends, settings, 19 probed routes, SSR HTML, robots/sitemap) vs full audit of TPI's 206 root pages + member systems. Facts observed directly; nothing assumed.

---

## 1. Snapshot

| | **Parapost Network** | **The Paranormal Initiative** |
|---|---|---|
| Platform | Next.js on Vercel + Supabase, native iOS/Android apps | Cloudflare Workers + D1, web-first |
| Web surface | 8 routes: dashboard, reels, live, friends, messages, notifications, settings, profile | 206 root pages + teams/ directory + member area + studio |
| Public content | **Zero** — homepage is a sign-in wall | 200+ original education/research pages, fully public |
| SEO | No OG/Twitter tags, one static `<title>`, no robots.txt, no sitemap.xml, no about/terms/privacy | OG+Twitter on all 210 content pages, robots.txt, sitemap, site search, clean URLs |
| Community activity | Feed: 0 items, 0 likes, 0 comments, 0 shares. "People to Discover": empty. Reels: none | Members, forum, chat, teams submissions (pre-launch) |
| advertised-but-missing | Hub (Investigations, Evidence Vault, Case Files, Events, Groups, Bookmarks, Explore) all "Soon"; Showcases "Coming Soon"; 19 probed routes 404 | Reels is a static shell; no native apps |

## 2. What ParaPost does well (steal these)

1. **Purpose-built social shell.** Their dashboard is a real social app: composer with Photos/Reel/Live/Feeling chips, For You / Friends / Following / Live feed tabs, right rail (People to Discover, Recently Viewed, Explore Reels, Trending with numbered categories), bottom mobile nav with a center **+** create button. Polished dark-purple design in the same family as TPI's redesign.
2. **Empty states done gracefully.** "Coming Soon" cards, friendly sign-in prompts — the product *feels* alive even when empty.
3. **Native mobile apps** on both App Store and Google Play, with recent marketing push (Facebook/Instagram/Threads posts within the last weeks).
4. **Reels infrastructure already works** (Supabase-backed upload/feed), even though the feed is empty.
5. **Category thinking.** Trending is broken into named buckets (New Posts, Creator Moments, Reels, Community Highlights, Shared Experiences) — good discoverability pattern.
6. **Live ambition:** dedicated Live manager with scheduled shows + replays concept.

## 3. Where ParaPost is weak (our openings)

1. **No public content at all.** Not one crawlable page of value. Every Google query about paranormal education lands on *our* 200+ pages, never theirs. They cannot grow through search; they can only grow through app-store marketing.
2. **Everything advertised is missing.** Their own sidebar labels the entire Parapost Hub "SOON": Investigations, Evidence Vault, Case Files, Events, Groups, Bookmarks, Explore. Showcases: "Coming Soon." Probed routes for every one of them: 404. Their marketing posts promise "Ghost Hunts, Investigations, Evidence Collections, Case Files, Events and Groups" — none exist on the web today.
3. **Ghost town.** 0 feed items, 0 likes, 0 comments, 0 shares, 0 reels, empty People to Discover, generic trending placeholders. New signups see an empty product.
4. **"Live" is a YouTube/Twitch link paste**, not real streaming — no encoding, no guest rooms, no production tools.
5. **Zero share previews** (no OG tags — the exact bug TPI fixed this morning), one static title site-wide, no robots.txt/sitemap — the web app is effectively invisible to crawlers and ugly in iMessage/Discord/X shares.
6. **No trust surface:** no terms, privacy, or about pages found. For a platform collecting user data, that's a credibility gap.
7. **Team/organization features: none.** Nothing like TPI's Teams Directory (50 states + 43 countries, moderated submissions).

## 4. Where TPI is strong

1. **The content moat.** 200+ original pages: Ghostology 101 (18 lessons), EVP/ITC coursework, Anabela Cardoso ITC journal series, equipment guides, field encyclopedia, forensic compendium, terminology reference, safety and standards content. Nobody in the niche — least of all ParaPost — has anything comparable, and it's all public, indexed, and share-preview-ready as of today.
2. **Real infrastructure.** Verified-domain transactional email (welcome, verification, password reset, team alerts), rate limiting, moderation queues, admin approval flows, in-site notifications with deep links, session security.
3. **Teams Directory** — unique in the niche, live, with submissions + leadership alerts (bell + email).
4. **TPI Studio (in progress)** — *native* broadcast: guest invite links, backstage/recorded consent model, RTMP multi-destination, countdowns, branded backgrounds, real recording. ParaPost's "Live" is pasting a YouTube URL.
5. **Fresh visual redesign** — purple/black system, carousel, Education Center quick-start, Reels page shell.
6. **Discoverability** — sitemap, robots, per-page titles, site search, and now full OG/Twitter previews on every page.

## 5. Where TPI is behind (honest list)

1. **Social shell polish.** Our member dashboard lacks their right rail (people discovery, trending), feed tabs, activity stats bar, and bottom mobile nav — exactly Phase 9 of SITE_STREAMLINING_PLAN, not yet started.
2. **Reels is a shell.** Theirs uploads/plays; ours is a static page until we build D1+R2+API behind it.
3. **No native app-store apps.** Mitigated: TPI ships real installable browser apps — Visual ITC Lab (ffmpeg pipeline, LUTs, full user manual), ACS, Aether Spectra SLS, and the Paranormal Initiative app — plus StudioFlow. These are unique *instruments* no rival has. (Future option: PWA manifests + install prompts for app-store-like presence without store fees.)
4. **No friend/follow graph.** We have a member directory and forum, but not friendships/following like theirs.
5. **No events/groups.** Their placeholders at least promise them; we have neither yet (Teams Directory is our differentiator, not a substitute).
6. **Momentum marketing.** They're actively posting on socials; our public-facing growth content (socials, app-store-style pitch) lags.

## 5b. Identity rule — ours, not a clone (Todd's direction)

ParaPost's layout patterns are worth studying, but TPI must never read as a ParaPost copy:

- **Dark theme stays** — Todd: dark is easy on the eyes; both platforms agree there.
- **Colors are distinctly TPI — DECIDED & SHIPPED (Oct 4, 2026).** Todd supplied four palettes; **Cryptid & Folklore** (deep forest `#1a221e` base, eerie slime-green `#32cd32` accent) is the site default, with Gothic Séance, Cosmic Horror, and Asylum & Investigation shipped as member-selectable themes (dashboard Appearance picker, saved to the member's account). Every ParaPost-purple literal has been tokenized out of the stylesheets.
- **Our own names and structure.** Keep TPI naming (TPI Reels, Teams Directory, Education Center, TPI Studio) — organize the dashboard around *our* pillars (Learn / Investigate / Share / Teams), not their Hub taxonomy.
- **Borrow mechanics, not look.** Right-rail discovery, trending categories, bottom mobile nav are UX patterns, not ParaPost property — implement them in TPI's visual language.

## 6. Head-to-head scorecard

| Category | ParaPost | TPI | Edge |
|---|---|---|---|
| Design / UI polish | 8/10 | 7/10 | ParaPost (social shell) |
| Content & education | 0/10 | 10/10 | **TPI, massively** |
| SEO / discoverability | 0/10 | 9/10 | **TPI, massively** |
| Social graph (friends/chat/notifications) | 6/10 | 7/10 | TPI (real email + alerts) |
| Feed / composer experience | 7/10 (built, empty) | 5/10 (plainer) | ParaPost |
| Reels | 6/10 (works, empty) | 3/10 (shell) | ParaPost |
| Live streaming | 3/10 (link paste) | 6/10 (Studio: native, near-launch) | **TPI** |
| Teams / orgs | 0/10 | 8/10 (Directory live) | **TPI** |
| Events / Groups / Case files | 1/10 ("Soon") | 2/10 (neither) | tie-for-last |
| Trust (email, moderation, policies) | 3/10 | 8/10 | **TPI** |
| Dedicated tools / apps | 8/10 (native social apps) | 8/10 (Visual ITC Lab w/ ffmpeg+LUTs, ACS, Aether Spectra SLS, Paranormal Initiative app — all installable browser apps + native-grade StudioFlow) | **tie, but TPI's are unique instruments, theirs are commodity social** |
| Growth engine | 6/10 (app stores + socials) | 7/10 (SEO + content + shares) | **TPI** |

**Verdict:** TPI is the *substance* leader (content, SEO, ops, live streaming, teams). ParaPost is the *form* leader (social-app shell, native apps, buzz). Their product is a polished empty room; ours is a library with a plain reading room. The fastest path to "way better" is closing the form gap while pressing every substance advantage they can't copy quickly.

## 7. The playbook — make TPI's community the best

**P0 — Finish TPI Studio (already green-lit).** Native live shows with guests, backstage recording, replays, multi-platform push. Their Live is a YouTube link; ours becomes a studio. Ship it, then add public show/replay pages with OG previews so every broadcast is a shareable, crawlable artifact. The Visual ITC Lab / ACS / SLS browser apps stay a unique TPI instrument layer ParaPost cannot match.

**P1 — Phase 9 dashboard, in TPI's own skin (steal mechanics, not the look).** Right rail with **People to Discover** (powered by our real member directory), **Trending in TPI** with named categories (New Posts, Education, Evidence, Teams), activity stats bar, feed tabs, and the **bottom mobile nav with center + create** — all restyled in whatever distinct accent identity Todd picks, organized around TPI pillars (Learn / Investigate / Share / Teams), never their Hub taxonomy.

**P2 — Reels for real.** D1 + R2 + API behind reels.html: upload (members), feed, likes, per-reel permalink pages with OG tags and sitemap inclusion. Their reels can't be crawled or shared richly; ours will be. Launch the feed with TPI-produced seed content (studio clips, field clips) so day one isn't a ghost town.

**P3 — Groups & Events on top of the Teams Directory.** Reuse the teams submission/approval/notifications machinery for paranormal groups and public events (watch parties, live investigations, studio shows). They've promised this for months and shipped none of it; we ship it first.

**P4 — Trust + growth surface.** Public About/Standards pages are strong; add visible Terms & Privacy (they have none — make it a listed differentiator for teams deciding where to post). Keep publishing share-preview-perfect pages for every new artifact (reel, event, replay).

**Sequencing note:** P0 (Studio) is the agreed next work; P1/P2 are pure site work consistent with live-site rules; P3/P4 follow once the community has daily activity.
