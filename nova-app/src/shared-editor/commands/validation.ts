// TPI-NOVA-005B2A: central validation shared by every document command. The
// dialog is not trusted: commands and the publication renderer both check these.

// Bookmark names: letters (including CJK), digits and underscore, starting with a
// letter or underscore. Matches the GenOffice bookmark rule, up to 80 characters.
const BOOKMARK_NAME = /^[A-Za-z\u4e00-\u9fff_][\w\u4e00-\u9fff]*$/;
const MAX_BOOKMARK_LENGTH = 80;

export type BookmarkNameResult = { ok: true; name: string } | { ok: false; reason: string };

// Trims surrounding whitespace and checks the shape. Case is preserved for display;
// uniqueness is decided case-insensitively by the command layer.
export function validateBookmarkName(input: string): BookmarkNameResult {
  const name = String(input ?? "").trim();
  if (!name) return { ok: false, reason: "Enter a bookmark name." };
  if (name.length > MAX_BOOKMARK_LENGTH) return { ok: false, reason: `Bookmark names can be at most ${MAX_BOOKMARK_LENGTH} characters.` };
  if (!BOOKMARK_NAME.test(name)) {
    return { ok: false, reason: "Use letters, numbers and underscores, starting with a letter or underscore. No spaces." };
  }
  return { ok: true, name };
}

// Allowed link destinations: https, http, mailto, tel, and #BookmarkName for
// internal targets. Everything else (javascript:, data:, unknown schemes) is refused.
const SAFE_SCHEME = /^(https?:|mailto:|tel:)/i;

export type HrefResult = { ok: true; href: string } | { ok: false; reason: string };

export function validateLinkHref(input: string): HrefResult {
  const href = String(input ?? "").trim();
  if (!href) return { ok: false, reason: "Enter a web address or bookmark." };
  if (/[\u0000-\u001f\s]/.test(href)) return { ok: false, reason: "Links cannot contain spaces or control characters." };
  if (href.startsWith("#")) {
    const check = validateBookmarkName(href.slice(1));
    return check.ok ? { ok: true, href: `#${check.name}` } : { ok: false, reason: "Internal links must name a bookmark." };
  }
  if (SAFE_SCHEME.test(href)) return { ok: true, href };
  return { ok: false, reason: "Only https, http, mailto, tel and #bookmark links are allowed." };
}
