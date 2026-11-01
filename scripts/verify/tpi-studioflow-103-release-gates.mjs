import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// TPI-STUDIOFLOW-103 historical release-gate contract, updated by TPI-130:
// permanent deletion is no longer globally disabled. The route and browser
// bridge must use the guarded implementation, while the dialog requires a
// complete inventory before the exact-name button can activate.
const api = readFileSync('functions/api/[[path]].js', 'utf8');
const bridge = readFileSync('studio/workspace-bridge.js', 'utf8');
const app = readFileSync('/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx', 'utf8');
const index = readFileSync('studio/index.html', 'utf8');

assert.match(api, /path\.match\(\/\^\\\/studio\\\/workspaces.*\/purge\$\/\)\) return requireStudioAccess\(request, env, user => handlePurgeStudioWorkspace\(path, request, env, user\)/);
assert.doesNotMatch(api, /path\.match\(\/\^\\\/studio\\\/workspaces.*unavailablePermanentStudioDeletion\(request\)/);
assert.match(api, /function handlePurgeStudioWorkspace\(/);
assert.match(api, /studioProductionGuard\(existing, mode === "with-contents" \? false : true\)/);
assert.match(api, /code: "workspace_conflict"/);
assert.match(api, /code: "purge_reconciliation_required"/);
assert.match(bridge, /return deleteStudioAttempt\(key, options\)\.catch/);
assert.doesNotMatch(bridge, /Permanent Studio deletion is temporarily unavailable pending recording safety verification/);
assert.match(app, /const inventoryReady = Boolean\(/);
assert.match(app, /onChange=\{\(event\) => setTyped\(event\.currentTarget\.value\)\}/);
assert.match(app, /Delete Studio Permanently/);
assert.match(app, /data-testid="studio-delete-submit"/);
for (const match of index.matchAll(/(?:src|href)="(\/studio\/[^"?]+)(?:\?[^\"]*)?"/g)) readFileSync(`.${match[1]}`);

console.log(JSON.stringify({
  status: 'PASSED',
  checks: 13,
  contract: 'TPI-STUDIOFLOW-130 guarded permanent deletion is routed, inventory-gated, and reactively name-confirmed'
}, null, 2));
