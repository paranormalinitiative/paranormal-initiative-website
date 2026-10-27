#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Exercise the actual handler and cleanup functions without accessing owner data.
const source = readFileSync('functions/api/[[path]].js', 'utf8');
const start = source.indexOf('async function handlePurgeStudioWorkspace(');
const end = source.indexOf('// TPI-STUDIOFLOW-089 §2: pre-deletion inventory.', start);
assert(start >= 0 && end > start);
const context = vm.createContext({
  console: { error() {} },
  sameOriginMutationAllowed: () => true,
  workspacePathId: () => 'qa-id',
  getOwnedStudioWorkspace: async env => env.row,
  readJson: async request => request.body,
  clean: value => String(value || '').trim(),
  safeJsonParse: value => { try { return JSON.parse(value); } catch { return null; } },
  studioProductionGuard: () => null,
  studioWorkspacePayload: row => row,
  studioWorkspaceStorageFailure: () => ({ status: 503, body: { ok: false } }),
  json: (body, status = 200) => ({ body, status }),
  STUDIO_RECOVERY_SNAPSHOT_PREFIX: 'snapshots',
  snapshotSegment: value => value
});
vm.runInContext(source.slice(start, end) + '\nglobalThis.purge = handlePurgeStudioWorkspace;', context);
function environment() {
  const env = {
    row: { id: 'qa-id', title: 'QA', version: 1, state_json: '{}', owner_id: 'owner' },
    asset: { id: 'asset', object_key: 'qa-object' },
    object: true,
    failDelete: false,
    TPI_MEDIA: {
      async delete() { if (env.failDelete) throw new Error('synthetic R2 failure'); env.object = false; },
      async head() { return env.object ? {} : null; },
      async list() { return { objects: [], truncated: false }; }
    }
  };
  env.TPI_DB = { prepare(sql) { let args; return {
    bind(...values) { args = values; return this; },
    async run() {
      if (sql.startsWith('UPDATE studio_workspaces SET')) {
        if (env.row.version !== args[5]) return { meta: { changes: 0 } };
        env.row = { ...env.row, title: '', deleted_at: args[0], state_json: args[1], version: env.row.version + 1 };
      } else if (sql.startsWith('DELETE FROM studio_media_assets')) env.asset = null;
      return { meta: { changes: 1 } };
    },
    async all() {
      if (sql.includes('FROM live_broadcasts lb')) return { results: [] };
      if (sql.startsWith('SELECT id, object_key FROM studio_media_assets')) return { results: env.asset ? [env.asset] : [] };
      if (sql.startsWith('SELECT id, title, state_json FROM studio_workspaces')) return { results: [] };
      throw new Error(`unexpected query: ${sql}`);
    }
  }; } };
  return env;
}
const call = (env, body) => context.purge('/studio/workspaces/qa-id/purge', { body }, env, { id: 'owner' });
let env = environment();
let result = await call(env, { mode: 'studio-only', expectedVersion: 1 });
assert.equal(result.status, 200);
assert.equal(env.object, true);
result = await call(env, { mode: 'with-contents' });
assert.equal(result.status, 409);
assert.equal(result.body.code, 'purge_scope_conflict');
assert.equal(env.object, true);
env = environment();
env.row = { ...env.row, title: '', state_json: '' };
result = await call(env, { mode: 'with-contents' });
assert.equal(result.status, 409);
assert.equal(result.body.code, 'purge_scope_unknown');
assert.equal(env.object, true);
env = environment();
env.failDelete = true;
result = await call(env, { mode: 'with-contents', expectedVersion: 1 });
assert.equal(result.status, 503);
assert.equal(result.body.code, 'purge_reconciliation_required');
assert(env.asset, 'asset metadata must remain available for retry');
assert.equal(env.object, true);
env.failDelete = false;
result = await call(env, { mode: 'with-contents' });
assert.equal(result.status, 200);
assert.equal(env.asset, null);
assert.equal(env.object, false);
console.log('PASS: immutable scope, legacy scope rejection, failed R2 cleanup, and retry');
