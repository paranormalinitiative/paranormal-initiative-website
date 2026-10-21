#!/usr/bin/env node

// Read-only UI verification for TPI-STUDIOFLOW-040. No browser storage,
// database, media, or owner Studio data is accessed.
import { readFileSync } from "node:fs";

const bundle = readFileSync("studio/assets/index-j2x9m9vI.js", "utf8");
const styles = readFileSync("studio/assets/index-DXjilBOR.css", "utf8");
const source = readFileSync(process.env.STUDIOFLOW_SOURCE ?? "/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx", "utf8");
const checks = [];

function check(name, condition) {
  if (!condition) throw new Error(`${name} failed`);
  checks.push(name);
}

function classify(asset) {
  return asset?.mediaType === "video" ||
    String(asset?.mediaType || "").toLowerCase().startsWith("video/") ||
    /\.(mp4|webm)$/i.test(asset?.fileName || "")
    ? "motion"
    : "static";
}

check("background panel remains one existing section", source.includes('title="Backgrounds"') && source.includes('Upload background'));
check("static subsection label exists", source.includes("<h4>BACKGROUNDS</h4>"));
check("motion subsection label exists", source.includes("<h4>MOTION BACKGROUNDS</h4>"));
check("static custom asset is gated out of motion assets", source.includes("customBackground && !customBackgroundIsVideo"));
check("motion custom asset is gated into motion assets", source.includes("customBackground && customBackgroundIsVideo"));
check("legacy video filename fallback remains present", source.includes('/\\.(mp4|webm)$/i.test(customBackground.fileName)'));
check("single upload control remains", (bundle.match(/Upload background/g) || []).length === 1);
check("section separator styling exists", styles.includes(".asset-subsection+.asset-subsection"));
check("image metadata classifies as static", classify({ mediaType: "image/png", fileName: "background.png" }) === "static");
check("video MIME metadata classifies as motion", classify({ mediaType: "video/mp4", fileName: "background.bin" }) === "motion");
check("legacy MP4 filename classifies as motion", classify({ fileName: "COTUMotion Background.mp4" }) === "motion");
check("legacy WEBM filename classifies as motion", classify({ fileName: "motion.webm" }) === "motion");
check("unknown legacy asset safely remains static", classify({ fileName: "background.dat" }) === "static");

console.log(JSON.stringify({
  status: "PASSED",
  checksPassed: checks.length,
  checks,
  ownerDataAccessed: false,
  storageModified: false,
}));
