// TPI-NOVA-003: Nova Core server-side storage and API foundation.
//
// Nova Core is the shared persistence layer for Nova Edit (documents) and the
// Nova Editorial Workspace (documents + presentations). It owns identity,
// versioned structured JSON, optimistic concurrency, revisions, collections
// and lifecycle. It deliberately has no editor UI and no StudioFlow coupling.
//
// Content rule: canonical content is the versioned structured envelope from
// TPI-NOVA-002. HTML bodies and rendered Konva nodes are never stored.
import { NOVA_LIMITS } from "./nova-limits.js";
import { isNovaLocked } from "./editorial-workflow.js";

export { NOVA_LIMITS };

const NOVA_DOCUMENT = "nova-document";
const NOVA_PRESENTATION = "nova-presentation";
const NOVA_TYPES = new Set([NOVA_DOCUMENT, NOVA_PRESENTATION]);
const SUPPORTED_FORMAT_VERSIONS = new Set([1]);

const ITEM_COLUMNS = "id, owner_id, type, title, collection_id, trash_collection_id, status, format_version, content_json, content_bytes, version, template_key, source_kind, source_ref, created_at, updated_at, deleted_at";

const ITEM_PATH = /^\/nova\/items\/([^/]+)$/;
const ITEM_ACTION_PATH = /^\/nova\/items\/([^/]+)\/(archive|trash|restore)$/;
const ITEM_PERMANENT_DELETE_PATH = /^\/nova\/items\/([^/]+)\/permanent-delete$/;
const ITEM_REVISIONS_PATH = /^\/nova\/items\/([^/]+)\/revisions$/;
const ITEM_REVISION_RESTORE_PATH = /^\/nova\/items\/([^/]+)\/revisions\/([^/]+)\/restore$/;
const COLLECTION_PATH = /^\/nova\/collections\/([^/]+)$/;
const COLLECTION_DELETE_PATH = /^\/nova\/collections\/([^/]+)\/delete$/;

const encoder = new TextEncoder();

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store",
      ...headers
    }
  });
}

function fail(status, code, error, extra = {}) {
  return json({ error, code, ...extra }, status, { "Cache-Control": "no-store" });
}

function clean(value) {
  return String(value ?? "").trim();
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function byteSize(value) {
  return encoder.encode(typeof value === "string" ? value : JSON.stringify(value)).length;
}

function sameOriginMutationAllowed(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function contentLimitFor(format) {
  return format === NOVA_DOCUMENT ? NOVA_LIMITS.documentBytes : NOVA_LIMITS.presentationBytes;
}

export function validateNovaEnvelope(value) {
  if (!isPlainObject(value)) {
    return { ok: false, status: 400, code: "invalid_nova_format", error: "Nova content must be a structured JSON object." };
  }
  if (!NOVA_TYPES.has(value.format)) {
    return { ok: false, status: 400, code: "invalid_nova_format", error: "Nova content format must be nova-document or nova-presentation." };
  }
  if (!Number.isInteger(value.version) || !SUPPORTED_FORMAT_VERSIONS.has(value.version)) {
    return { ok: false, status: 400, code: "unsupported_nova_format_version", error: "This Nova content format version is not supported." };
  }
  const bodyKey = value.format === NOVA_DOCUMENT ? "doc" : "presentation";
  const body = value[bodyKey];
  if (!isPlainObject(body)) {
    return { ok: false, status: 400, code: "invalid_nova_shape", error: `Nova ${value.format} content requires a ${bodyKey} object.` };
  }
  if (value.format === NOVA_DOCUMENT) {
    if ("type" in body && body.type !== "doc") {
      return { ok: false, status: 400, code: "invalid_nova_shape", error: "Nova document content must have type \"doc\"." };
    }
    if ("content" in body && !Array.isArray(body.content)) {
      return { ok: false, status: 400, code: "invalid_nova_shape", error: "Nova document content must be an array of blocks." };
    }
  } else {
    if ("slides" in body && !Array.isArray(body.slides)) {
      return { ok: false, status: 400, code: "invalid_nova_shape", error: "Nova presentation content must include a slides array." };
    }
    for (const key of ["width", "height"]) {
      if (key in body && !(Number.isFinite(body[key]) && body[key] > 0)) {
        return { ok: false, status: 400, code: "invalid_nova_shape", error: "Nova presentation dimensions must be positive numbers." };
      }
    }
  }
  const serialized = JSON.stringify(value);
  const bytes = byteSize(serialized);
  const limitBytes = contentLimitFor(value.format);
  if (bytes > limitBytes) {
    return {
      ok: false,
      status: 413,
      code: "nova_content_too_large",
      error: "This Nova content exceeds the storage limit for its type.",
      limitBytes,
      contentBytes: bytes
    };
  }
  return { ok: true, format: value.format, formatVersion: value.version, contentJson: serialized, contentBytes: bytes, limitBytes };
}

async function readNovaBody(request) {
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (Number.isFinite(declared) && declared > NOVA_LIMITS.requestBytes) {
    return { ok: false, status: 413, code: "nova_request_too_large", error: "This Nova request body is too large.", limitBytes: NOVA_LIMITS.requestBytes };
  }
  let text = "";
  try {
    text = await request.text();
  } catch {
    return { ok: false, status: 400, code: "invalid_json", error: "The Nova request body could not be read." };
  }
  if (byteSize(text) > NOVA_LIMITS.requestBytes) {
    return { ok: false, status: 413, code: "nova_request_too_large", error: "This Nova request body is too large.", limitBytes: NOVA_LIMITS.requestBytes };
  }
  if (!text.trim()) return { ok: true, data: {} };
  try {
    const data = JSON.parse(text);
    if (!isPlainObject(data)) return { ok: false, status: 400, code: "invalid_json", error: "The Nova request body must be a JSON object." };
    return { ok: true, data };
  } catch {
    return { ok: false, status: 400, code: "invalid_json", error: "The Nova request body is not valid JSON." };
  }
}

function expectedVersion(data) {
  if (data.expectedVersion === undefined || data.expectedVersion === null || data.expectedVersion === "") return null;
  const value = Number(data.expectedVersion);
  return Number.isInteger(value) && value > 0 ? value : NaN;
}

function requireExpectedVersion(data) {
  const expected = expectedVersion(data);
  if (expected === null) return { ok: false, response: fail(400, "expected_version_required", "Nova writes require the current expectedVersion.") };
  if (Number.isNaN(expected)) return { ok: false, response: fail(400, "invalid_expected_version", "expectedVersion must be a positive integer.") };
  return { ok: true, expected };
}

function normalizeTitle(value) {
  return clean(value).replace(/\s+/g, " ").slice(0, NOVA_LIMITS.titleLength);
}

function normalizeCollectionName(value) {
  return clean(value).replace(/\s+/g, " ").slice(0, NOVA_LIMITS.collectionNameLength);
}

function itemPayload(row, { includeContent = false } = {}) {
  const payload = {
    id: row.id,
    type: row.type,
    title: row.title,
    collectionId: row.collection_id || null,
    status: row.status,
    formatVersion: Number(row.format_version),
    version: Number(row.version),
    contentBytes: Number(row.content_bytes),
    templateKey: row.template_key || null,
    sourceKind: row.source_kind || null,
    sourceRef: row.source_ref || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || null
  };
  if (includeContent) payload.content = JSON.parse(row.content_json);
  return payload;
}

export function novaItemPayloadForArticle(row) {
  return itemPayload(row, { includeContent: true });
}

function collectionPayload(row) {
  return {
    id: row.id,
    parentId: row.parent_id || null,
    name: row.name,
    itemCount: row.item_count === undefined ? undefined : Number(row.item_count),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function conflict(existing) {
  return fail(409, "nova_item_conflict", "This Nova item changed elsewhere. Refresh before retrying.", {
    item: itemPayload(existing)
  });
}

function novaFailure(error) {
  const detail = String(error?.message || error || "").toLowerCase();
  const schemaUnavailable = /no such table|no such column|unknown table|does not exist/.test(detail);
  return fail(
    503,
    schemaUnavailable ? "nova_schema_unsupported" : "nova_backend_unavailable",
    schemaUnavailable
      ? "Nova storage is not available in this environment yet. Apply the additive Nova Core schema."
      : "Nova storage is temporarily unavailable."
  );
}

export async function getOwnedItem(env, id, ownerId) {
  return env.TPI_DB.prepare(`SELECT ${ITEM_COLUMNS} FROM nova_items WHERE id = ? AND owner_id = ? LIMIT 1`)
    .bind(id, ownerId)
    .first();
}

async function ownedCollection(env, id, ownerId) {
  return env.TPI_DB.prepare("SELECT id, parent_id, name, created_at FROM nova_collections WHERE id = ? AND owner_id = ? LIMIT 1")
    .bind(id, ownerId)
    .first();
}

async function recordRevision(env, revision) {
  await env.TPI_DB.prepare(`
    INSERT INTO nova_revisions (id, item_id, owner_id, revision_number, title, format_version, content_json, content_bytes, restored_from_revision, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    revision.itemId,
    revision.ownerId,
    revision.revisionNumber,
    revision.title,
    revision.formatVersion,
    revision.contentJson,
    revision.contentBytes,
    revision.restoredFromRevision ?? null,
    new Date().toISOString()
  ).run();
  const cutoff = revision.revisionNumber - NOVA_LIMITS.revisionRetention;
  if (cutoff > 0) {
    // TPI-NOVA-004R6F: a version pinned by any editorial submission round for an
    // article linked to this item (submitted or approved) is never trimmed, so
    // published history stays recoverable. Everything else is trimmed as before.
    await env.TPI_DB.prepare(`
      DELETE FROM nova_revisions
      WHERE item_id = ? AND owner_id = ? AND revision_number <= ?
        AND revision_number NOT IN (
          SELECT s.submitted_nova_version FROM article_editorial_submissions s
          JOIN articles a ON a.id = s.article_id WHERE a.nova_item_id = ?
          UNION
          SELECT s.approved_nova_version FROM article_editorial_submissions s
          JOIN articles a ON a.id = s.article_id WHERE a.nova_item_id = ? AND s.approved_nova_version IS NOT NULL
        )
    `).bind(revision.itemId, revision.ownerId, cutoff, revision.itemId, revision.itemId).run();
  }
}

async function listItems(request, env, user) {
  const url = new URL(request.url);
  const type = clean(url.searchParams.get("type")) || "all";
  if (type !== "all" && !NOVA_TYPES.has(type)) {
    return fail(400, "invalid_filter", "type must be nova-document, nova-presentation, or all.");
  }
  const status = clean(url.searchParams.get("status")) || "active";
  if (!["active", "archived", "trash", "all"].includes(status)) {
    return fail(400, "invalid_filter", "status must be active, archived, trash, or all.");
  }
  const collectionId = clean(url.searchParams.get("collectionId"));
  const search = clean(url.searchParams.get("search")).slice(0, NOVA_LIMITS.searchLength);
  const rawLimit = url.searchParams.get("limit");
  const limit = rawLimit === null ? NOVA_LIMITS.listDefault : Number(rawLimit);
  if (!Number.isInteger(limit) || limit < 1 || limit > NOVA_LIMITS.listMax) {
    return fail(400, "invalid_filter", `limit must be an integer between 1 and ${NOVA_LIMITS.listMax}.`);
  }

  const filters = ["owner_id = ?"];
  const binds = [user.id];
  if (type !== "all") { filters.push("type = ?"); binds.push(type); }
  if (status !== "all") { filters.push("status = ?"); binds.push(status); }
  if (collectionId === "unfiled") {
    filters.push("collection_id IS NULL");
  } else if (collectionId) {
    filters.push("collection_id = ?");
    binds.push(collectionId);
  }
  if (search) { filters.push("title LIKE ?"); binds.push(`%${search}%`); }

  const { results } = await env.TPI_DB.prepare(`
    SELECT ${ITEM_COLUMNS} FROM nova_items
    WHERE ${filters.join(" AND ")}
    ORDER BY updated_at DESC, id ASC
    LIMIT ?
  `).bind(...binds, limit).all();

  return json({
    items: (results || []).map(row => itemPayload(row)),
    filters: { type, status, collectionId: collectionId || null, search },
    limits: {
      documentBytes: NOVA_LIMITS.documentBytes,
      presentationBytes: NOVA_LIMITS.presentationBytes,
      listMax: NOVA_LIMITS.listMax,
      revisionRetention: NOVA_LIMITS.revisionRetention
    }
  });
}

async function createItem(request, env, user) {
  const body = await readNovaBody(request);
  if (!body.ok) return fail(body.status, body.code, body.error, body.limitBytes ? { limitBytes: body.limitBytes } : {});
  return createNovaItemForOwner(env, user, body.data);
}

// Shared Nova Core create path: validation, envelope, limits, initial revision and
// ownership. Product entitlement gates stay in the route layers that call it.
export async function createNovaItemForOwner(env, user, data) {
  if (data.content === undefined) {
    return fail(400, "nova_content_required", "A Nova item requires structured content.");
  }
  const validation = validateNovaEnvelope(data.content);
  if (!validation.ok) {
    const { status, code, error, ...extra } = validation;
    return fail(status, code, error, extra);
  }
  const collectionId = clean(data.collectionId) || null;
  if (collectionId && !(await ownedCollection(env, collectionId, user.id))) {
    return fail(400, "invalid_collection", "The selected Nova collection does not exist.");
  }
  const title = normalizeTitle(data.title)
    || (validation.format === NOVA_DOCUMENT ? "Untitled document" : "Untitled presentation");
  const now = new Date().toISOString();
  const row = {
    id: crypto.randomUUID(),
    owner_id: user.id,
    type: validation.format,
    title,
    collection_id: collectionId,
    trash_collection_id: null,
    status: "active",
    format_version: validation.formatVersion,
    content_json: validation.contentJson,
    content_bytes: validation.contentBytes,
    version: 1,
    template_key: clean(data.templateKey).slice(0, 120) || null,
    source_kind: clean(data.sourceKind).slice(0, 60) || null,
    source_ref: clean(data.sourceRef).slice(0, 240) || null,
    created_at: now,
    updated_at: now,
    deleted_at: null
  };
  await env.TPI_DB.batch([
    env.TPI_DB.prepare(`
      INSERT INTO nova_items (id, owner_id, type, title, collection_id, trash_collection_id, status, format_version, content_json, content_bytes, version, template_key, source_kind, source_ref, created_at, updated_at, deleted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      row.id, row.owner_id, row.type, row.title, row.collection_id, row.trash_collection_id, row.status,
      row.format_version, row.content_json, row.content_bytes, row.version, row.template_key, row.source_kind,
      row.source_ref, row.created_at, row.updated_at, row.deleted_at
    ),
    env.TPI_DB.prepare(`
      INSERT INTO nova_revisions (id, item_id, owner_id, revision_number, title, format_version, content_json, content_bytes, restored_from_revision, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)
    `).bind(crypto.randomUUID(), row.id, user.id, 1, title, row.format_version, row.content_json, row.content_bytes, now)
  ]);
  return json({ item: itemPayload(row, { includeContent: true }) }, 201);
}

async function getItem(id, env, user) {
  const row = await getOwnedItem(env, id, user.id);
  if (!row) return fail(404, "nova_item_not_found", "Nova item not found.");
  return json({ item: itemPayload(row, { includeContent: true }) });
}

async function updateItem(id, request, env, user) {
  const body = await readNovaBody(request);
  if (!body.ok) return fail(body.status, body.code, body.error, body.limitBytes ? { limitBytes: body.limitBytes } : {});
  return updateNovaItemForOwner(env, user, id, body.data);
}

// Shared Nova Core update path: expectedVersion, trash guard, validation, revisions
// and ownership. Product entitlement gates stay in the route layers that call it.
export async function updateNovaItemForOwner(env, user, id, data) {
  const expected = requireExpectedVersion(data);
  if (!expected.ok) return expected.response;

  const existing = await getOwnedItem(env, id, user.id);
  if (!existing) return fail(404, "nova_item_not_found", "Nova item not found.");
  if (existing.status === "trash") {
    return fail(409, "nova_item_in_trash", "Nova items in Trash are read-only. Restore the item before editing it.");
  }
  if (expected.expected !== Number(existing.version)) return conflict(existing);

  // TPI-NOVA-004R6C: a Nova document linked to an article under editorial review
  // (submitted, in_review, approved) is locked server-side for every write path.
  const linkedArticle = await env.TPI_DB.prepare("SELECT editorial_status FROM articles WHERE nova_item_id = ? AND created_by = ?")
    .bind(id, user.id).first();
  if (linkedArticle && isNovaLocked(linkedArticle.editorial_status)) {
    return fail(409, "nova_locked_for_review", "This document is locked while it is submitted for editorial review. Withdraw the submission or wait for requested changes before editing.");
  }

  let contentJson = existing.content_json;
  let contentBytes = Number(existing.content_bytes);
  let formatVersion = Number(existing.format_version);
  let contentChanged = false;
  if (data.content !== undefined) {
    const validation = validateNovaEnvelope(data.content);
    if (!validation.ok) {
      const { status, code, error, ...extra } = validation;
      return fail(status, code, error, extra);
    }
    if (validation.format !== existing.type) {
      return fail(400, "nova_type_mismatch", "Existing Nova content cannot change item type.");
    }
    contentJson = validation.contentJson;
    contentBytes = validation.contentBytes;
    formatVersion = validation.formatVersion;
    contentChanged = true;
  }

  const title = data.title === undefined
    ? existing.title
    : (normalizeTitle(data.title) || (existing.type === NOVA_DOCUMENT ? "Untitled document" : "Untitled presentation"));
  const collectionId = data.collectionId === undefined
    ? (existing.collection_id || null)
    : (clean(data.collectionId) || null);
  if (collectionId && collectionId !== existing.collection_id && !(await ownedCollection(env, collectionId, user.id))) {
    return fail(400, "invalid_collection", "The selected Nova collection does not exist.");
  }

  const nextVersion = Number(existing.version) + 1;
  const now = new Date().toISOString();
  const result = await env.TPI_DB.prepare(`
    UPDATE nova_items
    SET title = ?, collection_id = ?, content_json = ?, format_version = ?, content_bytes = ?, version = ?, updated_at = ?
    WHERE id = ? AND owner_id = ? AND version = ?
  `).bind(title, collectionId, contentJson, formatVersion, contentBytes, nextVersion, now, id, user.id, expected.expected).run();
  if (!result.meta?.changes) {
    const current = await getOwnedItem(env, id, user.id);
    return current ? conflict(current) : fail(404, "nova_item_not_found", "Nova item not found.");
  }
  if (contentChanged) {
    await recordRevision(env, {
      itemId: id,
      ownerId: user.id,
      revisionNumber: nextVersion,
      title,
      formatVersion,
      contentJson,
      contentBytes
    });
  }
  const updated = await getOwnedItem(env, id, user.id);
  return json({ item: itemPayload(updated, { includeContent: true }) });
}

async function itemAction(id, action, request, env, user) {
  const body = await readNovaBody(request);
  if (!body.ok) return fail(body.status, body.code, body.error);
  const expected = requireExpectedVersion(body.data);
  if (!expected.ok) return expected.response;

  const existing = await getOwnedItem(env, id, user.id);
  if (!existing) return fail(404, "nova_item_not_found", "Nova item not found.");
  if (expected.expected !== Number(existing.version)) return conflict(existing);

  if (action === "archive" && existing.status === "trash") {
    return fail(409, "nova_item_in_trash", "Restore the Nova item before archiving it.");
  }
  if ((action === "archive" && existing.status === "archived")
    || (action === "trash" && existing.status === "trash")
    || (action === "restore" && existing.status === "active")) {
    return json({ item: itemPayload(existing, { includeContent: true }), changed: false });
  }

  const now = new Date().toISOString();
  const nextVersion = Number(existing.version) + 1;
  let restoreNotice = "";
  let statement;
  if (action === "trash") {
    statement = env.TPI_DB.prepare(`
      UPDATE nova_items
      SET status = 'trash', deleted_at = COALESCE(deleted_at, ?), trash_collection_id = COALESCE(trash_collection_id, collection_id), version = ?, updated_at = ?
      WHERE id = ? AND owner_id = ? AND version = ?
    `).bind(now, nextVersion, now, id, user.id, expected.expected);
  } else if (action === "restore") {
    const candidate = existing.trash_collection_id || existing.collection_id || null;
    let collection = null;
    if (candidate) collection = await ownedCollection(env, candidate, user.id);
    if (candidate && !collection) {
      restoreNotice = "Item restored to Unfiled because its original collection no longer exists.";
    }
    statement = env.TPI_DB.prepare(`
      UPDATE nova_items
      SET status = 'active', collection_id = ?, deleted_at = NULL, trash_collection_id = NULL, version = ?, updated_at = ?
      WHERE id = ? AND owner_id = ? AND version = ?
    `).bind(collection?.id || null, nextVersion, now, id, user.id, expected.expected);
  } else {
    statement = env.TPI_DB.prepare(`
      UPDATE nova_items
      SET status = 'archived', deleted_at = NULL, trash_collection_id = NULL, version = ?, updated_at = ?
      WHERE id = ? AND owner_id = ? AND version = ?
    `).bind(nextVersion, now, id, user.id, expected.expected);
  }

  const result = await statement.run();
  if (!result.meta?.changes) {
    const current = await getOwnedItem(env, id, user.id);
    return current ? conflict(current) : fail(404, "nova_item_not_found", "Nova item not found.");
  }
  const updated = await getOwnedItem(env, id, user.id);
  return json({
    item: itemPayload(updated, { includeContent: true }),
    changed: true,
    restoreNotice: restoreNotice || undefined
  });
}

async function permanentlyDeleteItem(id, request, env, user) {
  const body = await readNovaBody(request);
  if (!body.ok) return fail(body.status, body.code, body.error);
  if (clean(body.data.confirmation) !== "DELETE PERMANENTLY") {
    return fail(400, "confirmation_required", "Explicit permanent-delete confirmation is required.");
  }
  const expected = requireExpectedVersion(body.data);
  if (!expected.ok) return expected.response;

  const existing = await getOwnedItem(env, id, user.id);
  if (!existing) return fail(404, "nova_item_not_found", "Nova item not found.");
  if (existing.status !== "trash") {
    return fail(409, "nova_item_not_in_trash", "Only Nova items already in Trash can be permanently deleted.");
  }
  if (expected.expected !== Number(existing.version)) return conflict(existing);

  const results = await env.TPI_DB.batch([
    env.TPI_DB.prepare("DELETE FROM nova_revisions WHERE item_id = ? AND owner_id = ?").bind(id, user.id),
    env.TPI_DB.prepare("DELETE FROM nova_items WHERE id = ? AND owner_id = ? AND status = 'trash' AND version = ?").bind(id, user.id, expected.expected)
  ]);
  if (!results?.[1]?.meta?.changes) {
    const current = await getOwnedItem(env, id, user.id);
    return current ? conflict(current) : fail(404, "nova_item_not_found", "Nova item not found.");
  }
  return json({ ok: true, deletedId: id });
}

async function listRevisions(id, env, user) {
  if (!(await getOwnedItem(env, id, user.id))) return fail(404, "nova_item_not_found", "Nova item not found.");
  const { results } = await env.TPI_DB.prepare(`
    SELECT id, revision_number, title, format_version, content_json, content_bytes, restored_from_revision, created_at
    FROM nova_revisions
    WHERE item_id = ? AND owner_id = ?
    ORDER BY revision_number DESC
    LIMIT ?
  `).bind(id, user.id, NOVA_LIMITS.revisionRetention).all();
  return json({
    revisions: (results || []).map(row => ({
      id: row.id,
      revisionNumber: Number(row.revision_number),
      title: row.title,
      formatVersion: Number(row.format_version),
      contentBytes: Number(row.content_bytes),
      restoredFromRevision: row.restored_from_revision === null ? null : Number(row.restored_from_revision),
      createdAt: row.created_at,
      content: JSON.parse(row.content_json)
    })),
    retention: NOVA_LIMITS.revisionRetention
  });
}

async function restoreRevision(id, revisionId, request, env, user) {
  const body = await readNovaBody(request);
  if (!body.ok) return fail(body.status, body.code, body.error);
  const expected = requireExpectedVersion(body.data);
  if (!expected.ok) return expected.response;

  const current = await getOwnedItem(env, id, user.id);
  if (!current) return fail(404, "nova_item_not_found", "Nova item not found.");
  if (current.status === "trash") {
    return fail(409, "nova_item_in_trash", "Restore the Nova item before restoring one of its revisions.");
  }
  if (expected.expected !== Number(current.version)) return conflict(current);

  const revision = await env.TPI_DB.prepare(`
    SELECT id, revision_number, title, format_version, content_json, content_bytes
    FROM nova_revisions
    WHERE id = ? AND item_id = ? AND owner_id = ?
    LIMIT 1
  `).bind(revisionId, id, user.id).first();
  if (!revision) return fail(404, "nova_revision_not_found", "Nova revision not found.");

  const content = JSON.parse(revision.content_json);
  const validation = validateNovaEnvelope(content);
  if (!validation.ok) {
    return fail(409, "nova_revision_invalid", "This Nova revision cannot be restored because its stored content is invalid.");
  }

  const nextVersion = Number(current.version) + 1;
  const now = new Date().toISOString();
  const result = await env.TPI_DB.prepare(`
    UPDATE nova_items
    SET title = ?, content_json = ?, format_version = ?, content_bytes = ?, version = ?, updated_at = ?
    WHERE id = ? AND owner_id = ? AND version = ?
  `).bind(
    revision.title, revision.content_json, Number(revision.format_version), Number(revision.content_bytes),
    nextVersion, now, id, user.id, expected.expected
  ).run();
  if (!result.meta?.changes) {
    const latest = await getOwnedItem(env, id, user.id);
    return latest ? conflict(latest) : fail(404, "nova_item_not_found", "Nova item not found.");
  }
  await recordRevision(env, {
    itemId: id,
    ownerId: user.id,
    revisionNumber: nextVersion,
    title: revision.title,
    formatVersion: Number(revision.format_version),
    contentJson: revision.content_json,
    contentBytes: Number(revision.content_bytes),
    restoredFromRevision: Number(revision.revision_number)
  });
  const updated = await getOwnedItem(env, id, user.id);
  return json({
    item: itemPayload(updated, { includeContent: true }),
    restoredFromRevision: Number(revision.revision_number)
  });
}

async function listCollections(env, user) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT c.id, c.parent_id, c.name, c.created_at, c.updated_at,
      (SELECT COUNT(*) FROM nova_items i
        WHERE i.collection_id = c.id AND i.owner_id = c.owner_id AND i.status = 'active') AS item_count
    FROM nova_collections c
    WHERE c.owner_id = ?
    ORDER BY c.name COLLATE NOCASE, c.created_at ASC
  `).bind(user.id).all();
  return json({ collections: (results || []).map(collectionPayload) });
}

async function validateCollectionParent(env, parentId, ownerId, collectionId = "") {
  let currentId = parentId || null;
  const visited = new Set();
  while (currentId) {
    if (currentId === collectionId) return "A Nova collection cannot be nested inside itself or one of its descendants.";
    if (visited.has(currentId) || visited.size >= 1000) return "The Nova collection hierarchy contains a cycle.";
    visited.add(currentId);
    const parent = await env.TPI_DB.prepare("SELECT id, parent_id FROM nova_collections WHERE id = ? AND owner_id = ? LIMIT 1")
      .bind(currentId, ownerId)
      .first();
    if (!parent) return "Parent Nova collection not found.";
    currentId = parent.parent_id || null;
  }
  return "";
}

async function createCollection(request, env, user) {
  const body = await readNovaBody(request);
  if (!body.ok) return fail(body.status, body.code, body.error);
  const name = normalizeCollectionName(body.data.name);
  if (!name) return fail(400, "collection_name_required", "A Nova collection name is required.");
  const parentId = clean(body.data.parentId) || null;
  const parentError = await validateCollectionParent(env, parentId, user.id);
  if (parentError) return fail(400, "invalid_collection_parent", parentError);
  const now = new Date().toISOString();
  const row = { id: crypto.randomUUID(), parent_id: parentId, name, created_at: now, updated_at: now };
  await env.TPI_DB.prepare("INSERT INTO nova_collections (id, owner_id, parent_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(row.id, user.id, row.parent_id, row.name, row.created_at, row.updated_at)
    .run();
  return json({ collection: collectionPayload(row) }, 201);
}

async function updateCollection(id, request, env, user) {
  const body = await readNovaBody(request);
  if (!body.ok) return fail(body.status, body.code, body.error);
  const existing = await ownedCollection(env, id, user.id);
  if (!existing) return fail(404, "nova_collection_not_found", "Nova collection not found.");
  if (body.data.name === undefined && body.data.parentId === undefined) {
    return fail(400, "invalid_collection_update", "Provide a name or parentId to update the Nova collection.");
  }
  const name = body.data.name === undefined ? existing.name : normalizeCollectionName(body.data.name);
  if (!name) return fail(400, "collection_name_required", "A Nova collection name is required.");
  const parentId = body.data.parentId === undefined ? (existing.parent_id || null) : (clean(body.data.parentId) || null);
  const parentError = await validateCollectionParent(env, parentId, user.id, id);
  if (parentError) return fail(400, "invalid_collection_parent", parentError);
  const now = new Date().toISOString();
  await env.TPI_DB.prepare("UPDATE nova_collections SET name = ?, parent_id = ?, updated_at = ? WHERE id = ? AND owner_id = ?")
    .bind(name, parentId, now, id, user.id)
    .run();
  return json({ collection: { id, parentId, name, createdAt: existing.created_at, updatedAt: now } });
}

async function deleteCollection(id, env, user) {
  const existing = await env.TPI_DB.prepare("SELECT id, parent_id FROM nova_collections WHERE id = ? AND owner_id = ? LIMIT 1")
    .bind(id, user.id)
    .first();
  if (!existing) return fail(404, "nova_collection_not_found", "Nova collection not found.");
  const now = new Date().toISOString();
  // Deleting organization never deletes Nova content. Items return to Unfiled
  // and child collections are re-parented under the deleted collection's
  // parent (or the root), matching the safe Notes behaviour.
  const items = await env.TPI_DB.prepare("UPDATE nova_items SET collection_id = NULL, updated_at = ? WHERE collection_id = ? AND owner_id = ?")
    .bind(now, id, user.id)
    .run();
  const children = await env.TPI_DB.prepare("UPDATE nova_collections SET parent_id = ?, updated_at = ? WHERE parent_id = ? AND owner_id = ?")
    .bind(existing.parent_id || null, now, id, user.id)
    .run();
  await env.TPI_DB.prepare("DELETE FROM nova_collections WHERE id = ? AND owner_id = ?").bind(id, user.id).run();
  return json({
    ok: true,
    itemsPreserved: true,
    itemsUnfiled: Number(items.meta?.changes || 0),
    childrenMovedTo: existing.parent_id || null,
    childrenMoved: Number(children.meta?.changes || 0)
  });
}

function decodeParam(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}

export async function handleNovaApi(path, request, env, user) {
  if (!path.startsWith("/nova/")) return null;
  const method = request.method;
  if (method !== "GET" && method !== "HEAD" && !sameOriginMutationAllowed(request)) {
    return fail(403, "cross_origin_forbidden", "Cross-origin Nova mutations are not allowed.");
  }

  try {
    if (path === "/nova/items") {
      if (method === "GET") return await listItems(request, env, user);
      if (method === "POST") return await createItem(request, env, user);
      return fail(405, "method_not_allowed", "Method not allowed.");
    }

    if (path === "/nova/collections") {
      if (method === "GET") return await listCollections(env, user);
      if (method === "POST") return await createCollection(request, env, user);
      return fail(405, "method_not_allowed", "Method not allowed.");
    }

    let match = path.match(ITEM_REVISIONS_PATH);
    if (match && method === "GET") return await listRevisions(decodeParam(match[1]), env, user);

    match = path.match(ITEM_REVISION_RESTORE_PATH);
    if (match && method === "POST") {
      return await restoreRevision(decodeParam(match[1]), decodeParam(match[2]), request, env, user);
    }

    match = path.match(ITEM_PERMANENT_DELETE_PATH);
    if (match && method === "POST") return await permanentlyDeleteItem(decodeParam(match[1]), request, env, user);

    match = path.match(ITEM_ACTION_PATH);
    if (match && method === "POST") return await itemAction(decodeParam(match[1]), match[2], request, env, user);

    match = path.match(ITEM_PATH);
    if (match) {
      const id = decodeParam(match[1]);
      if (method === "GET") return await getItem(id, env, user);
      if (method === "PATCH" || method === "PUT") return await updateItem(id, request, env, user);
      return fail(405, "method_not_allowed", "Method not allowed.");
    }

    match = path.match(COLLECTION_DELETE_PATH);
    if (match && method === "POST") return await deleteCollection(decodeParam(match[1]), env, user);

    match = path.match(COLLECTION_PATH);
    if (match && (method === "PATCH" || method === "PUT")) {
      return await updateCollection(decodeParam(match[1]), request, env, user);
    }

    return fail(404, "nova_route_not_found", "Nova route not found.");
  } catch (error) {
    return novaFailure(error);
  }
}
