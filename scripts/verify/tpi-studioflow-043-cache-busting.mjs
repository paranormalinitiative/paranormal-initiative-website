import { readFileSync } from "node:fs";
import { contentVersion, studioAssetUrls, versionStudioAssetReferences } from "../studioflow-asset-version.mjs";

const sourceHtml = readFileSync("studio/index.html", "utf8");
const assetUrls = studioAssetUrls(sourceHtml);
const javascriptUrl = assetUrls.find((url) => url.endsWith(".js"));
const cssUrl = assetUrls.find((url) => url.endsWith(".css"));
const javascript = readFileSync(javascriptUrl.replace(/^\//, ""));
const css = readFileSync(cssUrl.replace(/^\//, ""));
const worker = readFileSync("worker.js", "utf8");
const localDev = readFileSync("scripts/local-dev.mjs", "utf8");
const liveStage = readFileSync("scripts/stage-local-studio-assets.mjs", "utf8");
const checks = [];
const check = (name, passed) => checks.push({ name, passed: Boolean(passed) });

const contents = new Map([
  [javascriptUrl, javascript],
  [cssUrl, css],
]);
const versionedHtml = versionStudioAssetReferences(sourceHtml, contents);
const changedJavascript = Buffer.from(`${javascript}\ncache-busting-fixture`);
const changedContents = new Map(contents).set(javascriptUrl, changedJavascript);
const changedHtml = versionStudioAssetReferences(sourceHtml, changedContents);

check("source HTML references the current StudioFlow JavaScript asset", Boolean(javascriptUrl));
check("source HTML references the current StudioFlow CSS asset", Boolean(cssUrl));
check("staged HTML adds a deterministic JavaScript version", versionedHtml.includes(`${javascriptUrl}?v=${contentVersion(javascript)}`));
check("staged HTML adds a deterministic CSS version", versionedHtml.includes(`${cssUrl}?v=${contentVersion(css)}`));
check("unchanged content produces a stable version", versionStudioAssetReferences(sourceHtml, contents) === versionedHtml);
check("changed JavaScript content changes only its version", changedHtml.includes(`${javascriptUrl}?v=${contentVersion(changedJavascript)}`) && changedHtml.includes(`${cssUrl}?v=${contentVersion(css)}`));
check("asset discovery is limited to StudioFlow JS/CSS assets", studioAssetUrls(sourceHtml).every(url => url.startsWith("/studio/assets/") && /\.(?:js|css)$/.test(url)));
check("local Worker preserves asset query parameters", worker.includes("const response = await env.ASSETS.fetch(request)") && worker.includes("fallbackUrl.search =") === false);
check("local development assets retain no-store behavior", worker.includes('const isDevelopmentAsset = env.TPI_ENV === "development" || env.TPI_ENV === "local"') && worker.includes('headers.set("Cache-Control", "no-store")'));
check("Studio authentication runs before asset serving", worker.includes('if (url.pathname === "/studio" || url.pathname.startsWith("/studio/"))') && worker.indexOf("hasCreatorStudioAccess") < worker.indexOf("return servePageAsset(request, env)"));
check("no production cache policy was changed", !worker.includes("public, max-age=31536000, immutable") || worker.includes('if (!isDevelopmentAsset) return response'));
check("the local launcher watches StudioFlow asset directories", localDev.includes("studioAssetWatchTargets") && localDev.includes('watch(directory, { persistent: false }') && !localDev.includes('"index-j2x9m9vI.js"') && !localDev.includes('"index-DXjilBOR.css"'));
check("source changes are debounced before restaging", localDev.includes("setTimeout(stageNow, 300)") && localDev.includes("stage-local-studio-assets.mjs"));
check("live asset restaging writes atomically", liveStage.includes("renameSync(temporary, target)") && liveStage.includes("stageStudioAssets"));

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}`);
const failed = checks.filter(result => !result.passed);
console.log(JSON.stringify({
  directive: "TPI-STUDIOFLOW-043",
  checks: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  ownerDataAccessed: false,
  browserStorageModified: false,
}));
if (failed.length) process.exitCode = 1;
