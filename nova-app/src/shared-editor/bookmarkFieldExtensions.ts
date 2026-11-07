import { Node, mergeAttributes } from "@tiptap/core";

// TPI-NOVA-005B2A: a bookmark is a zero-width inline atom placed at the start of
// its paragraph, heading or list item. Blocks without bookmarks keep exactly the
// JSON they had before, so opening an existing document reports no change.
export const TpiBookmark = Node.create({
  name: "tpiBookmark",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      name: { default: "" }
    };
  },
  parseHTML() {
    return [{ tag: "span[data-tpi-bookmark]" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-tpi-bookmark": node.attrs.name })];
  }
});

export const FIELD_TYPES = ["DATE", "TIME", "FILENAME"] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

// A structured field. The semantic identity is `fieldType`; `displayText` is a
// cached copy that the renderer regenerates at publication time.
export const TpiField = Node.create({
  name: "tpiField",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      fieldType: { default: "DATE" },
      format: { default: "default" },
      displayText: { default: "" }
    };
  },
  parseHTML() {
    return [{ tag: "span[data-tpi-field]" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-tpi-field": node.attrs.fieldType,
        "data-tpi-format": node.attrs.format
      }),
      node.attrs.displayText
    ];
  }
});
