// Local crash/reload protection for Nova.
//
// Nova drafts live under their own `tpi:nova:` prefix so they can never collide
// with StudioFlow Notes recovery keys or any other StudioFlow local state.
import type { NovaDocumentEnvelope } from "./types";

const DRAFT_PREFIX = "tpi:nova:draft:v1:";

export interface NovaDraft {
  itemId: string;
  title: string;
  content: NovaDocumentEnvelope;
  baseVersion: number;
  updatedAt: string;
}

function storage(): Storage | null {
  try {
    const probe = "__tpi_nova_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function draftKey(itemId: string): string {
  return `${DRAFT_PREFIX}${itemId}`;
}

export function readDraft(itemId: string): NovaDraft | null {
  const store = storage();
  if (!store) return null;
  const raw = store.getItem(draftKey(itemId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<NovaDraft>;
    if (
      parsed &&
      parsed.itemId === itemId &&
      parsed.content &&
      parsed.content.format === "nova-document" &&
      parsed.content.version === 1 &&
      parsed.content.doc &&
      typeof parsed.title === "string" &&
      typeof parsed.baseVersion === "number"
    ) {
      return {
        itemId,
        title: parsed.title,
        content: parsed.content,
        baseVersion: parsed.baseVersion,
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString()
      };
    }
  } catch {
    // A corrupt draft is discarded rather than surfacing a broken editor state.
  }
  store.removeItem(draftKey(itemId));
  return null;
}

export function writeDraft(draft: NovaDraft): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(draftKey(draft.itemId), JSON.stringify(draft));
  } catch {
    // Quota or private-mode failures must never break editing.
  }
}

export function clearDraft(itemId: string): void {
  const store = storage();
  if (!store) return;
  store.removeItem(draftKey(itemId));
}
