import type { JSONContent } from "@tiptap/core";

// Canonical Nova document form: TipTap/ProseMirror JSON. Never browser HTML.
export type NovaDocJSON = JSONContent;

export const NOVA_DOC_FORMAT = "nova-document";
export const NOVA_DOC_VERSION = 1;

export interface NovaDocEnvelope {
  format: typeof NOVA_DOC_FORMAT;
  version: typeof NOVA_DOC_VERSION;
  doc: NovaDocJSON;
}

export function serializeDocument(doc: NovaDocJSON): string {
  const envelope: NovaDocEnvelope = {
    format: NOVA_DOC_FORMAT,
    version: NOVA_DOC_VERSION,
    doc,
  };
  return JSON.stringify(envelope);
}

export function parseDocument(text: string): NovaDocJSON {
  const parsed: unknown = JSON.parse(text);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as NovaDocEnvelope).format !== NOVA_DOC_FORMAT ||
    (parsed as NovaDocEnvelope).version !== NOVA_DOC_VERSION ||
    typeof (parsed as NovaDocEnvelope).doc !== "object"
  ) {
    throw new Error("Not a valid Nova document envelope");
  }
  return (parsed as NovaDocEnvelope).doc;
}

export const SAMPLE_DOCUMENT: NovaDocJSON = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Nova spike document" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Plain, " },
        { type: "text", marks: [{ type: "bold" }], text: "bold" },
        { type: "text", text: ", " },
        { type: "text", marks: [{ type: "italic" }], text: "italic" },
        { type: "text", text: " and " },
        {
          type: "text",
          marks: [{ type: "link", attrs: { href: "https://example.com/" } }],
          text: "a link",
        },
        { type: "text", text: "." },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Bullet one" }] },
          ],
        },
        {
          type: "listItem",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Bullet two" }] },
          ],
        },
      ],
    },
    {
      type: "orderedList",
      content: [
        {
          type: "listItem",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Numbered one" }] },
          ],
        },
        {
          type: "listItem",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Numbered two" }] },
          ],
        },
      ],
    },
    {
      type: "image",
      attrs: { src: "/placeholder.png", alt: "Placeholder image", title: "Placeholder" },
    },
    {
      type: "table",
      content: [
        {
          type: "tableRow",
          content: [
            {
              type: "tableHeader",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Header A" }] }],
            },
            {
              type: "tableHeader",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Header B" }] }],
            },
          ],
        },
        {
          type: "tableRow",
          content: [
            {
              type: "tableCell",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Cell 1" }] }],
            },
            {
              type: "tableCell",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Cell 2" }] }],
            },
          ],
        },
      ],
    },
  ],
};
