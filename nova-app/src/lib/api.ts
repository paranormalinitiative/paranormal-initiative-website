import type {
  NovaCollection,
  NovaCollectionListResponse,
  NovaDocumentEnvelope,
  NovaItem,
  NovaItemListResponse,
  NovaItemStatus,
  NovaRevisionListResponse
} from "./types";

const NOVA_API = "/api/nova";

export class NovaApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly payload: unknown;

  constructor(message: string, status: number, code: string, payload: unknown) {
    super(message);
    this.name = "NovaApiError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

interface ErrorBody {
  error?: string;
  code?: string;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined) headers.set("Content-Type", "application/json");
  const response = await fetch(`${NOVA_API}${path}`, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const body = (data ?? {}) as ErrorBody;
    const code = body.code || `http_${response.status}`;
    const message = body.error || response.statusText || "Nova request failed.";
    throw new NovaApiError(message, response.status, code, data);
  }

  return data as T;
}

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

export interface ListItemsOptions {
  status?: NovaItemStatus | "all";
  collectionId?: string;
  search?: string;
  limit?: number;
}

export const novaApi = {
  listItems(options: ListItemsOptions = {}) {
    return request<NovaItemListResponse>(`/items${query({
      type: "nova-document",
      status: options.status ?? "active",
      collectionId: options.collectionId,
      search: options.search,
      limit: options.limit
    })}`);
  },

  getItem(id: string) {
    return request<{ item: NovaItem }>(`/items/${encodeURIComponent(id)}`);
  },

  createItem(body: { title: string; content: NovaDocumentEnvelope; collectionId?: string | null }) {
    return request<{ item: NovaItem }>("/items", { method: "POST", body: JSON.stringify(body) });
  },

  updateItem(id: string, body: {
    expectedVersion: number;
    title?: string;
    content?: NovaDocumentEnvelope;
    collectionId?: string | null;
  }) {
    return request<{ item: NovaItem }>(`/items/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  },

  act(id: string, action: "archive" | "trash" | "restore", expectedVersion: number) {
    return request<{ item: NovaItem; changed: boolean; restoreNotice?: string }>(
      `/items/${encodeURIComponent(id)}/${action}`,
      { method: "POST", body: JSON.stringify({ expectedVersion }) }
    );
  },

  permanentlyDelete(id: string, expectedVersion: number) {
    return request<{ ok: true; deletedId: string }>(`/items/${encodeURIComponent(id)}/permanent-delete`, {
      method: "POST",
      body: JSON.stringify({ expectedVersion, confirmation: "DELETE PERMANENTLY" })
    });
  },

  listRevisions(id: string) {
    return request<NovaRevisionListResponse>(`/items/${encodeURIComponent(id)}/revisions`);
  },

  restoreRevision(id: string, revisionId: string, expectedVersion: number) {
    return request<{ item: NovaItem; restoredFromRevision: number }>(
      `/items/${encodeURIComponent(id)}/revisions/${encodeURIComponent(revisionId)}/restore`,
      { method: "POST", body: JSON.stringify({ expectedVersion }) }
    );
  },

  listCollections() {
    return request<NovaCollectionListResponse>("/collections");
  },

  createCollection(body: { name: string; parentId?: string | null }) {
    return request<{ collection: NovaCollection }>("/collections", {
      method: "POST",
      body: JSON.stringify(body)
    });
  },

  renameCollection(id: string, name: string) {
    return request<{ collection: NovaCollection }>(`/collections/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ name })
    });
  }
};

export function describeNovaError(error: unknown): string {
  if (error instanceof NovaApiError) {
    if (error.status === 401) return "Your TPI session has ended. Sign in again to keep working in Nova.";
    if (error.status === 403) return "This account does not currently have Nova access.";
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Nova is temporarily unavailable.";
}
