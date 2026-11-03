import StarterKit from "@tiptap/starter-kit";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";

// Nova's document schema. StarterKit already includes Link and Underline in the
// pinned TipTap 3 release, so they are configured here rather than registered a
// second time. Code blocks are disabled: they are not part of the approved
// Nova-004 formatting set and would add a node the toolbar cannot manage.
export const novaExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    codeBlock: false,
    link: {
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" }
    },
    underline: {}
  }),
  Table.configure({ resizable: false, allowTableNodeSelection: true }),
  TableRow,
  TableHeader,
  TableCell
];
