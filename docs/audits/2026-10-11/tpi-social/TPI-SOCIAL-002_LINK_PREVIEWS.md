# TPI-SOCIAL-002 Link Previews

The existing SSRF-bounded resolver from TPI-VIDEOS-009 remains in use. Focused parser/security regression: **PASS 7/7**.

Current browser evidence:

- Direct URL paste: preview card appeared in the existing composer.
- NASA metadata: title, description, provider host, and image rendered; image completed at `3000 × 2400` natural dimensions.
- Example Domain: no image was fabricated; the safe text/provider fallback rendered.
- Post persistence: the preview reappeared after the Feed was reloaded.
- Safe external card: `target="_blank"`, `rel="noopener noreferrer ugc"`, original URL preserved.

The full provider matrix remains subject to each provider's current metadata availability. Missing or blocked metadata remains a graceful fallback, not a fabricated preview.
