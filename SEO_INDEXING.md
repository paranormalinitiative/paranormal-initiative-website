# The Paranormal Initiative
## SEO & Google Indexing Documentation

This document records the site's indexing configuration, SEO implementation, and maintenance recommendations. It serves as the project's permanent reference for search-engine visibility, sitemap management, and future indexing decisions.

---

# Project Goal

- Allow Google Search to fully index all public educational content.
- Prevent indexing of private, member, and administrative pages.
- Maintain a clean, automatically generated sitemap.
- Use canonical URLs consistently across all public pages.
- Keep metadata accurate and unique per page.
- Preserve long-term search visibility through technically correct configuration rather than short-term ranking tactics.

---

# SEO Foundation Implemented

## robots.txt

The site uses a repository-managed `robots.txt` at the project root. When deployed to Cloudflare Pages, this file overrides any Cloudflare-generated default.

```
User-agent: *
Allow: /

Disallow: /member-login.html
Disallow: /member-dashboard.html
Disallow: /paper-editor.html
Disallow: /command-center.html
Disallow: /contributor-invite.html
Disallow: /api/

Sitemap: https://paranormalinitiative.com/sitemap.xml
```

All public content pages are crawlable. The `/api/` path, member-registration pages, and internal editor/dashboard pages are explicitly blocked.

**File:** `robots.txt` (repository root)

---

## Cloudflare Managed Content Signals

Cloudflare may automatically prepend AI-oriented content-signal directives to the `robots.txt` response. These directives allow Google Search (`User-agent: *`) while restricting AI training bots:

- `GPTBot` → Disallow
- `ClaudeBot` → Disallow
- `Google-Extended` → Disallow
- `CCBot` → Disallow
- `meta-externalagent` → Disallow
- `Amazonbot`, `Applebot-Extended`, `Bytespider` → Disallow

These Cloudflare-managed signals are separate from the repository rules and are applied at the CDN level. They do not affect standard search-engine crawling.

---

## sitemap.xml

The sitemap is generated automatically by `scripts/build-sitemap.js`.

- **Current URL count:** 211
- **Production domain:** all `<loc>` values use `https://paranormalinitiative.com/`
- **Exclusions:** private pages, utility partials (`header.html`, `footer.html`), the search utility page, and `published-article.html`
- **No duplicate URLs, no preview-domain URLs, no noindexed pages**

To regenerate the sitemap:

```bash
node scripts/build-sitemap.js
```

**File:** `sitemap.xml` (generated, committed to repository)

---

## Canonical URLs

Every public page contains exactly one `<link rel="canonical">` tag in its `<head>`.

Canonical URLs always reference the production domain:

```
https://paranormalinitiative.com/
```

Preview-deployment canonicals intentionally point to the production domain, not to the temporary preview URL.

Private and administrative pages do not receive canonical tags.

---

## Meta Descriptions

Every public page has exactly one unique `<meta name="description">` tag.

- Major navigation and landing pages received hand-written descriptions.
- Article, lesson, and state-directory pages received auto-generated descriptions based on their `pp:title` and `pp:subtitle` metadata.
- No two pages share the exact same description text.
- Private and administrative pages do not receive descriptions, as they are excluded from indexing.

---

## Open Graph (Homepage)

```
<meta property="og:type" content="website">
<meta property="og:site_name" content="The Paranormal Initiative">
<meta property="og:title" content="The Paranormal Initiative">
<meta property="og:description" content="Responsible paranormal research, field investigation, education, EVP and ITC experimentation, technology, and evidence-aware inquiry.">
<meta property="og:url" content="https://paranormalinitiative.com/">
```

No `og:image` is set. A 1200 × 630 social-sharing image should be created and added before relying on social-platform link previews.

---

## Twitter / X Cards (Homepage)

```
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="The Paranormal Initiative">
<meta name="twitter:description" content="Responsible paranormal research, investigation, education, technology, EVP and ITC experimentation, and evidence-aware inquiry.">
```

---

## Organization JSON-LD (Homepage)

Structured data describes The Paranormal Initiative as a `schema.org/Organization`:

```json
{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The Paranormal Initiative",
    "url": "https://paranormalinitiative.com/",
    "description": "A paranormal research, investigation, education, and technology organization focused on responsible inquiry, ethical fieldwork, documentation, evidence integrity, EVP and ITC research, and investigator development."
}
```

This supports knowledge-panel eligibility and entity understanding by search engines without over-claiming features (no fabricated reviews, ratings, or physical addresses).

---

## `noindex` Pages

Six pages are intentionally excluded from search indexing. Each contains:

```html
<meta name="robots" content="noindex, nofollow">
```

| Page | Reason |
|------|--------|
| `member-login.html` | Authentication page with no public content |
| `member-dashboard.html` | Private member area; requires login |
| `paper-editor.html` | Content-editing tool; behind contributor gate |
| `command-center.html` | Internal investigation-synchronization tool |
| `contributor-invite.html` | Invite-only contributor registration |
| `published-article.html` | Dynamic article viewer; content inserted entirely by JavaScript; not crawlable |

These pages are also excluded from `sitemap.xml`.

---

# Google Search Console Status

- Sitemap submitted and processed successfully at `https://paranormalinitiative.com/sitemap.xml`.
- 211 pages discovered.
- Homepage is indexed and available to Google.
- HTTPS validated on the production domain.

This marks the completion of the initial SEO indexing foundation project.

---

# Future Maintenance

## When adding a new public page

- [ ] Add a unique `<title>`.
- [ ] Add a unique `<meta name="description" content="...">` (approximately 120–160 characters).
- [ ] Add `<link rel="canonical" href="https://paranormalinitiative.com/FILENAME">`.
- [ ] Ensure the page is linked from at least one other public page (navigation, hub, or article).
- [ ] Ensure the page is included in the sitemap (excluded pages are listed in `scripts/build-sitemap.js`).

## When adding a private or administrative page

- [ ] Add `<meta name="robots" content="noindex, nofollow">` inside `<head>`.
- [ ] Add the filename to the `EXCLUDED_FILES` set in `scripts/build-sitemap.js`.
- [ ] Add a `Disallow` rule to `robots.txt` if the path should be blocked at the crawler level.

## When changing domains

Update every file that references the production domain:

- [ ] Canonical URLs in all HTML pages
- [ ] `sitemap.xml` (regenerate with updated domain)
- [ ] `robots.txt` sitemap declaration
- [ ] Homepage JSON-LD `url` field
- [ ] Homepage Open Graph `og:url`
- [ ] Homepage Twitter metadata

## After every deployment

- [ ] Verify `/robots.txt` is served as plain text with the correct sitemap reference.
- [ ] Verify `/sitemap.xml` is served as valid XML.
- [ ] Verify the homepage contains exactly one canonical, one description, and no `noindex`.
- [ ] Spot-check canonical URLs on a few public pages.
- [ ] Confirm private pages return `noindex, nofollow` in their HTML.

## Google Search Console — periodic review

- [ ] Coverage report: check for errors or newly excluded pages.
- [ ] Indexing status: confirm expected pages are indexed.
- [ ] Crawl stats: monitor for unexpected crawl budget issues.
- [ ] Search Performance: review queries, impressions, and click-through.
- [ ] Core Web Vitals: check page-experience signals.

---

# Recommended Future Improvements

## Sitemap `lastmod` accuracy

Currently `scripts/build-sitemap.js` assigns each page's filesystem modification date as its `<lastmod>`. This is accurate immediately after generation, but a future improvement could use each file's most recent Git commit date instead (falling back to filesystem time). This would produce more trustworthy `lastmod` values that reflect the actual content-change history rather than the build timestamp.

## Structured data expansion

The Organization JSON-LD on the homepage could be expanded with:

- **Article** structured data on individual research papers and lessons.
- **BreadcrumbList** structured data on deep pages to improve SERP breadcrumb display.
- Additional Organization properties (logo, sameAs social links) when appropriate assets exist.

## Rich Results testing

Validate key pages with Google's [Rich Results Test](https://search.google.com/test/rich-results) after adding or modifying structured data.

## Internal linking

Continue cross-linking related educational articles, investigation-development lessons, and research papers. Strong internal linking helps Google discover deep content and understand topic relationships.

## Content quality

- Prioritize original research and field-authored articles.
- Maintain the existing evidence-aware, educational tone.
- Avoid duplicate or substantially overlapping content across pages.
- When converting legacy authored pages, ensure each published article has a distinct, crawlable public URL.

---

# Maintenance Philosophy

The SEO foundation is intentionally conservative.

The focus is long-term discoverability through technically correct indexing, accurate metadata, strong internal linking, and high-quality educational content rather than attempting to manipulate search rankings. Every public page earns its place in the index through substance, not through optimization tricks.
