import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

// Shared extension set for the Nova Documents spike. Structured JSON is canonical.
export const novaDocumentExtensions = [
  StarterKit.configure({ link: false }),
  Link.configure({ openOnClick: false, autolink: false }),
  Image,
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
];

export type { JSONContent };
