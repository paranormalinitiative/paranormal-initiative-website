// Nova document and collection shapes returned by /api/nova.
import type { JSONContent } from "@tiptap/core";

export type NovaItemType = "nova-document" | "nova-presentation";
export type NovaItemStatus = "active" | "archived" | "trash";

export interface NovaDocumentEnvelope {
  format: "nova-document";
  version: 1;
  doc: JSONContent;
  meta?: NovaDocumentMeta;
}

export interface NovaDocumentComment {
  id: string;
  quote: string;
  text: string;
  author: string;
  createdAt: string;
  resolved: boolean;
}

export interface NovaDocumentMeta {
  pageSize: "letter" | "a4" | "legal";
  orientation: "portrait" | "landscape";
  margins: { top: number; right: number; bottom: number; left: number };
  header: string;
  footer: string;
  showPageNumbers: boolean;
  comments: NovaDocumentComment[];
}

export interface NovaPresentationEnvelope {
  format: "nova-presentation";
  version: 1;
  presentation: {
    id: string;
    title: string;
    width: number;
    height: number;
    slides: unknown[];
  };
}

export type NovaContentEnvelope = NovaDocumentEnvelope | NovaPresentationEnvelope;

export interface NovaItemSummary {
  id: string;
  type: NovaItemType;
  title: string;
  collectionId: string | null;
  status: NovaItemStatus;
  formatVersion: number;
  version: number;
  contentBytes: number;
  templateKey: string | null;
  sourceKind: string | null;
  sourceRef: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface NovaItem extends NovaItemSummary {
  content: NovaContentEnvelope;
}

export interface NovaCollection {
  id: string;
  parentId: string | null;
  name: string;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NovaRevision {
  id: string;
  revisionNumber: number;
  title: string;
  formatVersion: number;
  contentBytes: number;
  restoredFromRevision: number | null;
  createdAt: string;
  content: NovaDocumentEnvelope;
}

export interface NovaItemListResponse {
  items: NovaItemSummary[];
  filters: { type: string; status: string; collectionId: string | null; search: string };
  limits: { documentBytes: number; presentationBytes: number; listMax: number; revisionRetention: number };
}

export interface NovaCollectionListResponse {
  collections: NovaCollection[];
}

export interface NovaRevisionListResponse {
  revisions: NovaRevision[];
  retention: number;
}

export type NovaCollectionFilter = "all" | "unfiled" | string;
