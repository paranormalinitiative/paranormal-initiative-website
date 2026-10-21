import { readFileSync } from "node:fs";
import { studioAssetUrls } from "../studioflow-asset-version.mjs";

const html = readFileSync("studio/index.html", "utf8");
const assetUrls = studioAssetUrls(html);
const javascriptUrl = assetUrls.find((url) => url.endsWith(".js"));
const cssUrl = assetUrls.find((url) => url.endsWith(".css"));
const bundle = readFileSync(javascriptUrl.replace(/^\//, ""), "utf8");
const css = readFileSync(cssUrl.replace(/^\//, ""), "utf8");
const worker = readFileSync("worker.js", "utf8");
const checks = [];
const check = (name, passed) => checks.push({ name, passed: Boolean(passed) });

check("HTML references the current JavaScript bundle", Boolean(javascriptUrl));
check("HTML references the current CSS bundle", Boolean(cssUrl));
check("current bundle contains the organized background headings", bundle.includes('children:"BACKGROUNDS"') && bundle.includes('children:"MOTION BACKGROUNDS"'));
check("current CSS contains the background section separator", css.includes(".asset-subsection+.asset-subsection"));
check("local and development environments share the development asset policy", worker.includes('env.TPI_ENV === "development" || env.TPI_ENV === "local"'));
check("non-HTML assets receive no-store in local development", worker.includes('if (!contentType.includes("text/html"))') && worker.includes('headers.set("Cache-Control", "no-store")'));
check("HTML assets receive no-store in local development", worker.includes('if (body === html)') && worker.includes('if (isDevelopmentAsset)'));
check("development validators remove validator headers that can preserve stale assets", worker.includes('headers.delete("etag")') && worker.includes('headers.delete("last-modified")'));
check("StudioFlow does not register a service worker", !html.includes("serviceWorker.register") && !bundle.includes("serviceWorker.register"));
check("the updated bundle retains the single upload control", bundle.includes("Upload background") && bundle.split("Upload background").length - 1 === 1);

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}`);
const failed = checks.filter((result) => !result.passed);
console.log(JSON.stringify({
  directive: "TPI-STUDIOFLOW-040A",
  checks: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  liveServerProbe: "not performed against protected Studio assets",
  ownerDataAccessed: false,
  browserStorageModified: false,
}));
if (failed.length) process.exitCode = 1;
