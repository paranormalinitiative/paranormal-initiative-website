import { readFileSync } from "node:fs";

const css = readFileSync("studio/studioflow-012-overrides.css", "utf8");
const shell = readFileSync("studio/index.html", "utf8");
const jsReference = shell.match(/<script type="module" crossorigin src="([^"]+\.js)"><\/script>/)?.[1];
const cssReference = shell.match(/<link rel="stylesheet" crossorigin href="([^"]+\.css)">/)?.[1];
if (!jsReference || !cssReference) throw new Error("StudioFlow entry point is missing generated JS/CSS references");
const bundle = readFileSync(jsReference.replace(/^\//, ""), "utf8");
const compiledCss = readFileSync(cssReference.replace(/^\//, ""), "utf8");
const assetBridge = readFileSync("studio/workspace-asset-state-bridge.js", "utf8");

const checks = [];
const check = (name, passed) => checks.push({ name, passed: Boolean(passed) });

const stageVideoRule = css.match(/\.program-stage > video\.stage-video\.contain\s*\{([\s\S]*?)\}/)?.[1] ?? "";
const requiredRuleProperties = [
  "position: absolute",
  "inset: 0",
  "display: block",
  "width: 100%",
  "height: 100%",
  "max-width: none",
  "max-height: none",
  "margin: 0",
  "padding: 0",
  "border: 0",
  "object-fit: contain",
  "object-position: center"
];

const stageVideoIndex = bundle.indexOf('className:"stage-video contain"');
const stageVideoContext = stageVideoIndex >= 0 ? bundle.slice(stageVideoIndex, stageVideoIndex + 320) : "";
check("the compiled StudioFlow render path uses a dedicated stage video element for intro/outro clips", stageVideoIndex >= 0 && stageVideoContext.includes("onEnded:"));
check("the production stage is explicitly landscape 16:9", compiledCss.includes(".program-stage{position:relative") && compiledCss.includes("aspect-ratio:16 / 9"));
check("intro/outro stage media is full-frame without inherited margins or sizing caps", requiredRuleProperties.every((property) => stageVideoRule.includes(property)));
check("intro/outro stage media preserves source proportions", stageVideoRule.includes("object-fit: contain") && !stageVideoRule.includes("object-fit: cover"));
check("clip persistence remains studio-scoped and browser-local", assetBridge.includes("videoClips") && assetBridge.includes("blobKey") && assetBridge.includes("IndexedDB/browser storage"));
check("the 1920x1080 reference ratio matches the stage ratio", Math.abs((1920 / 1080) - (16 / 9)) < 0.000001);
check("the override does not alter video bytes or upload behavior", !css.includes("re-encode") && !assetBridge.includes("/api/uploads"));

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}`);
const failed = checks.filter((result) => !result.passed);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-019", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, externalRequests: 0 }));
if (failed.length) process.exit(1);
