// TPI-NOVA-003: Nova Core content and request limits.
//
// Reasoning for the selected values:
//
// - Nova code is structured JSON, which is far more compact per unit of content
//   than the HTML bodies StudioFlow Notes stores. A 60-page document with rich
//   text is typically well under 200 KiB of ProseMirror JSON; a 40-slide deck
//   with text and shape nodes typically lands under 400 KiB.
// - StudioFlow Notes already caps a note body at 512 KiB. Nova documents keep
//   that same ceiling so document behaviour is predictable across the two
//   writing surfaces instead of inviting much larger payloads by default.
// - Presentations carry per-slide geometry and node trees, so they receive a
//   larger 1 MiB ceiling. That is still comfortably inside D1's practical
//   row/string limits (a single SQLite string is capped near 1,000,000 bytes,
//   and a row near 2,000,000 bytes) once envelope metadata is added.
// - Requests are capped slightly above the presentation limit so the envelope
//   plus title/metadata never trips the request guard before content validation
//   produces the specific per-type error.
// - Revisions retain the latest 50 content versions per item. At the maximum
//   presentation size that is a bounded ~50 MiB of revision storage per item,
//   versus Notes' 100 revisions of smaller HTML bodies.
export const NOVA_LIMITS = Object.freeze({
  documentBytes: 512 * 1024,
  presentationBytes: 1024 * 1024,
  requestBytes: 1024 * 1024 + 16 * 1024,
  revisionRetention: 50,
  titleLength: 200,
  collectionNameLength: 120,
  listDefault: 100,
  listMax: 200,
  searchLength: 120
});
