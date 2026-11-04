#!/usr/bin/env node
// TPI-LOCALDEV-006C focused checks for local static asset staging.
// Run: node scripts/verify/tpi-localdev-006c-staging.mjs
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";
import { DEFAULT_ASSET_FILE_LIMIT, assetFileLimit, stageLocalAssets } from "../stage-local-assets.mjs";
import { STUDIO_RUNTIME_FILES } from "../stage-local-studio-assets.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const failures = [];
let passed = 0;

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`FAIL ${name}: ${error.message}`);
  }
}

function write(path, content = "") {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function listFiles(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  const walk = current => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else files.push(relative(directory, path).split(sep).join("/"));
    }
  };
  walk(directory);
  return files;
}

// A disposable repository fixture: the directed defect cases plus the
// legitimate surfaces that must keep staging.
function createFixture() {
  const fixture = mkdtempSync(join(tmpdir(), "tpi-006c-staging-"));
  write(join(fixture, "studio/index.html"), [
    "<!doctype html><html><head>",
    '<link rel="stylesheet" href="/studio/assets/index-fixture.css">',
    '</head><body><script type="module" src="/studio/assets/index-fixture.js"></script></body></html>',
  ].join("\n"));
  write(join(fixture, "studio/assets/index-fixture.js"), "export {};\n");
  write(join(fixture, "studio/assets/index-fixture.css"), "body{}\n");
  for (const name of STUDIO_RUNTIME_FILES) write(join(fixture, "studio", name), "// fixture\n");
  write(join(fixture, "footer.html"), "<footer>fixture</footer>\n");
  write(join(fixture, "member-sidebar.html"), "<nav>fixture</nav>\n");

  // Required: nested dependency trees at several depths.
  write(join(fixture, "nova-app/node_modules/dep/index.js"), "module.exports = 1;\n");
  write(join(fixture, "nova-app/node_modules/dep/node_modules/inner/index.js"), "module.exports = 2;\n");
  write(join(fixture, "example/subproject/node_modules/package/file.js"), "module.exports = 3;\n");
  write(join(fixture, "experiments/nova-spike/node_modules/package/index.js"), "module.exports = 4;\n");
  write(join(fixture, "node_modules/top-level-dep/index.js"), "module.exports = 5;\n");
  write(join(fixture, "anything/else/node_modules/package/file.js"), "module.exports = 6;\n");

  // Required: legitimate nested application assets.
  write(join(fixture, "example/subproject/app.js"), "export const app = true;\n");
  write(join(fixture, "example/subproject/styles/site.css"), "body{}\n");
  write(join(fixture, "assets/logo.svg"), "<svg></svg>\n");
  write(join(fixture, "content-editor-nova/index.html"), "<!doctype html><title>nova</title>\n");
  write(join(fixture, "content-editor-nova/assets/bundle.js"), "export {};\n");
  write(join(fixture, "nova/index.html"), "<!doctype html><title>nova build</title>\n");
  write(join(fixture, "admin-center-preview/index.html"), "<!doctype html><title>acp</title>\n");

  // Required: local state and repository internals never become assets.
  write(join(fixture, ".local-dev/state/v3/d1/miniflare-D1DatabaseObject/x.sqlite"), "not-a-db\n");
  write(join(fixture, ".local-dev/state/v3/r2/tpi-local-media/object"), "not-an-object\n");
  write(join(fixture, "docs/readme.md"), "# docs\n");
  write(join(fixture, "scripts/tool.mjs"), "export {};\n");
  write(join(fixture, "package.json"), "{}\n");
  write(join(fixture, ".DS_Store"), "finder\n");
  write(join(fixture, "example/.DS_Store"), "finder\n");
  return fixture;
}

const fixture = createFixture();
try {
  const staged = stageLocalAssets({ repoRoot: fixture, env: {} });
  const stagedFiles = listFiles(staged.stage);
  const has = path => stagedFiles.includes(path);
  const matches = pattern => stagedFiles.filter(path => pattern.test(path));

  check("a nested node_modules subtree never reaches staged assets", () => {
    assert.equal(has("example/subproject/node_modules/package/file.js"), false);
    assert.equal(has("anything/else/node_modules/package/file.js"), false);
    assert.equal(has("experiments/nova-spike/node_modules/package/index.js"), false);
  });

  check("doubly nested dependencies and top-level dependencies stay excluded", () => {
    assert.equal(has("nova-app/node_modules/dep/index.js"), false);
    assert.equal(has("nova-app/node_modules/dep/node_modules/inner/index.js"), false);
    assert.equal(has("node_modules/top-level-dep/index.js"), false);
    assert.deepEqual(matches(/node_modules/), []);
  });

  check("a legitimate nested application asset still stages", () => {
    assert.equal(has("example/subproject/app.js"), true);
    assert.equal(has("example/subproject/styles/site.css"), true);
    assert.equal(has("assets/logo.svg"), true);
  });

  check("the Content Editor Nova bundle is staged when present", () => {
    assert.equal(has("content-editor-nova/index.html"), true);
    assert.equal(has("content-editor-nova/assets/bundle.js"), true);
    assert.equal(has("nova/index.html"), true);
    assert.equal(has("admin-center-preview/index.html"), true);
  });

  check("local state is never copied into static assets", () => {
    assert.deepEqual(matches(/^\.local-dev\//), []);
    assert.deepEqual(matches(/state\/v3/), []);
    assert.equal(has("docs/readme.md"), false);
    assert.equal(has("scripts/tool.mjs"), false);
    assert.equal(has("package.json"), false);
  });

  check("operating-system metadata is not served", () => {
    assert.deepEqual(matches(/(^|\/)\.DS_Store$/), []);
  });

  check("the StudioFlow shared includes are staged in Worker parity form", () => {
    assert.equal(has("footer.html"), true);
    assert.equal(has("footer.txt"), true);
    assert.equal(has("member-sidebar.txt"), true);
  });

  check("an abnormal asset explosion fails with an actionable ceiling message", () => {
    assert.throws(
      () => stageLocalAssets({ repoRoot: fixture, env: { TPI_LOCAL_ASSET_LIMIT: "3" } }),
      error => error.code === "TPI_ASSET_LIMIT_EXCEEDED"
        && /exceeded the safety ceiling of 3/.test(error.message)
        && /TPI_LOCAL_ASSET_LIMIT/.test(error.message),
    );
  });

  check("the ceiling has substantial headroom over the documented baseline", () => {
    assert.equal(DEFAULT_ASSET_FILE_LIMIT, 4000);
    assert.equal(assetFileLimit({}), DEFAULT_ASSET_FILE_LIMIT);
    assert.equal(assetFileLimit({ TPI_LOCAL_ASSET_LIMIT: "6000" }), 6000);
    assert.equal(assetFileLimit({ TPI_LOCAL_ASSET_LIMIT: "not-a-number" }), DEFAULT_ASSET_FILE_LIMIT);
    // OPS-008 recorded 532 staged runtime files; the ceiling must not sit near it.
    assert.ok(DEFAULT_ASSET_FILE_LIMIT > 532 * 4);
  });
} finally {
  rmSync(fixture, { recursive: true, force: true });
}

// ---- The real repository stage ------------------------------------------
const realStage = join(root, ".local-dev/assets");
check("the real local stage exists and stays at a sane documented scale", () => {
  assert.ok(existsSync(realStage), "run `node scripts/stage-local-assets.mjs` first");
  assert.ok(statSync(realStage).isDirectory());
  const files = listFiles(realStage);
  assert.ok(files.length > 0, "the staged tree is empty");
  assert.ok(
    files.length <= assetFileLimit(),
    `${files.length} staged files exceed the ${assetFileLimit()} ceiling`,
  );
});

check("after real staging, zero node_modules paths are staged", () => {
  assert.deepEqual(listFiles(realStage).filter(path => path.split("/").includes("node_modules")), []);
});

check("the real stage never contains local state or repository internals", () => {
  const files = listFiles(realStage);
  assert.deepEqual(files.filter(path => path.startsWith(".local-dev/") || path.includes("state/v3")), []);
});

check("the real stage keeps the Content Editor Nova and built Nova surfaces", () => {
  if (existsSync(join(root, "content-editor-nova"))) {
    assert.equal(existsSync(join(realStage, "content-editor-nova/content-editor.html")), true);
    assert.ok(listFiles(join(realStage, "content-editor-nova/assets")).some(path => /\.(js|css)$/.test(path)));
  }
  if (existsSync(join(root, "nova/index.html"))) assert.equal(existsSync(join(realStage, "nova/index.html")), true);
});

console.log(`\n${passed}/${passed + failures.length} checks passed`);
if (failures.length) {
  console.log(`FAILED: ${failures.join("; ")}`);
  process.exit(1);
}
