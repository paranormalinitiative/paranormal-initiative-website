// Nova document and collection shapes returned by /api/nova.
import type { JSONContent } from "@tiptap/core";

export type NovaItemType = "nova-document" | "nova-presentation";
export type NovaItemStatus = "active" | "archived" | "trash";

export interface NovaDocumentEnvelope {
  format: "nova-document";
  version: 1;
  doc: JSONContent;
}

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
  content: NovaDocumentEnvelope;
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
