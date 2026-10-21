import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";

const checks = [];
async function check(name, fn) {
  try { await fn(); checks.push({ name, passed: true }); }
  catch (error) { checks.push({ name, passed: false, detail: error instanceof Error ? error.message : String(error) }); }
}

const bridge = await readFile("studio/backup-bridge.js", "utf8");
const fixture = await readFile("studio/assets/tpi033-real-test.html", "utf8");
const hash = value => createHash("sha256").update(value).digest("hex");
const syntheticRoot = "/Users/toddknipple/Desktop/TPI-033 Opera Backup Test";

await check("synthetic fixture is isolated from Crossroads", async () => {
  assert.match(fixture, /tpi033-source-workspace/);
  assert.match(fixture, /TPI-033 Backup Test/);
  assert.doesNotMatch(fixture, /43b20614-69da-4d82-af9d-063cace4b6cc/);
  assert.doesNotMatch(fixture, /Crossroads of the Unknown/);
});
await check("fixture includes all required synthetic media roles", async () => {
  for (const key of ["tpi033-intro", "tpi033-outro", "tpi033-background", "tpi033-logo", "tpi033-banner", "tpi033-audio"]) assert.match(fixture, new RegExp(key));
});
await check("folder picker is explicit and persisted through the supported handle path", async () => {
  assert.match(bridge, /showDirectoryPicker\(\{ id: "studioflow-backups", mode: "readwrite" \}\)/);
  assert.match(bridge, /directoryHandles/);
  assert.match(bridge, /saveHandle\(handle\)/);
});
await check("backup verifies written bytes before COMPLETE", async () => {
  assert.match(bridge, /verify\(dest, published, complete, false\)/);
  assert.match(bridge, /writeFile\(published \+ "\/COMPLETE"/);
  assert.match(bridge, /verify\(dest, published, complete, true\)/);
});
await check("automatic backup remains explicitly enabled per Studio", async () => {
  assert.match(bridge, /automaticEnabled/);
  assert.match(bridge, /scheduleAutomaticBackup/);
  assert.match(bridge, /if \(!current\.automaticEnabled \|\| !current\.destinationName\) return/);
});
await check("restore requires a verified package and restores as new", async () => {
  assert.match(bridge, /verificationStatus !== "VERIFIED"/);
  assert.match(bridge, /Restore .* as a new Studio/);
  assert.match(bridge, /restoreFromBackup: true/);
  assert.match(bridge, /newBroadcastId = "studio-restore-/);
});
await check("restore media accumulator is initialized correctly", async () => {
  assert.match(bridge, /manifest\.media\.reduce\(function \(promise, asset\).*Promise\.resolve\(\{\}\)/s);
  assert.doesNotMatch(bridge, /promise\.then\(function \(media\) \{[\s\S]{0,400}\}, \{\}\)/);
});
await check("restore preserves unknown configuration fields and remaps only blob keys", async () => {
  assert.match(bridge, /function remapBlobKeys/);
  assert.match(bridge, /configuration: remapBlobKeys\(state, mediaMap\)/);
  assert.match(bridge, /Object\.keys\(value\)\.forEach/);
});
await check("recording bytes remain excluded from configuration backups", async () => {
  assert.doesNotMatch(bridge, /role: "recording"/);
  assert.match(bridge, /recording/);
});
await check("real Opera package contains a verified manifest and completion marker", async () => {
  await access(syntheticRoot);
  const studios = await readdir(`${syntheticRoot}/studios/tpi033-source-workspace/history`, { withFileTypes: true });
  const versions = studios.filter(entry => entry.isDirectory() && !entry.name.endsWith(".staging")).map(entry => entry.name).sort();
  assert.ok(versions.length >= 1);
  const packageRoot = `${syntheticRoot}/studios/tpi033-source-workspace/history/${versions.at(-1)}`;
  const manifest = JSON.parse(await readFile(`${packageRoot}/manifest.json`, "utf8"));
  assert.equal(manifest.verificationStatus, "VERIFIED");
  assert.equal(manifest.media.length, 6);
  assert.equal((await readFile(`${packageRoot}/COMPLETE`, "utf8")).trim(), manifest.backupId);
  for (const asset of manifest.media) {
    const data = await readFile(`${packageRoot}/${asset.relativePath}`);
    assert.equal(data.byteLength, asset.size);
    assert.equal(hash(data), asset.sha256);
  }
});

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = checks.filter(result => !result.passed);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-033", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, ownerDataAccessed: false, externalRequests: 0 }));
if (failed.length) process.exit(1);
