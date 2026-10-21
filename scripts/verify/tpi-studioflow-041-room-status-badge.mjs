import { readFileSync } from "node:fs";

const html = readFileSync("studio/index.html", "utf8");
const jsAsset = html.match(/src="(?:\/studio\/|\.\/)?assets\/(index-[^"]+\.js)"/)?.[1];
const cssAsset = html.match(/href="(?:\/studio\/|\.\/)?assets\/(index-[^"]+\.css)"/)?.[1];
if (!jsAsset || !cssAsset) throw new Error("StudioFlow entry point does not reference generated JS/CSS assets");
const bundle = readFileSync(`studio/assets/${jsAsset}`, "utf8");
const css = readFileSync(`studio/assets/${cssAsset}`, "utf8");
const source = readFileSync(process.env.STUDIOFLOW_SOURCE ?? "/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx", "utf8");
const sourceCss = readFileSync(process.env.STUDIOFLOW_STYLES ?? "/Users/toddknipple/Documents/StudioFlow/web/src/styles.css", "utf8");
const checks = [];
const check = (name, passed) => checks.push({ name, passed: Boolean(passed) });

const participantsStart = source.indexOf('className="participants"');
const participantsEnd = source.indexOf('className="present-menu"', participantsStart);
const participantsMarkup = source.slice(participantsStart, participantsEnd > participantsStart ? participantsEnd : undefined);
const presentInvite = "Present or invite";
const addToStage = "Add to stage";

// TPI-041A superseded the original overlay badge placement. Keep this historical
// suite aligned with the accepted contract: diagnostics remain available in the
// People panel while the owner, invite, and guest cards stay independent.
check("Room Bridge status remains available in People diagnostics", source.includes("Room bridge</span>") && source.includes("roomBridgeStatus.signalCount"));
check("guest count and signal count remain in the diagnostics", source.includes("guestPresences.length") && source.includes("roomBridgeStatus.signalCount"));
check("status card is removed from the main participant row", !participantsMarkup.includes("backstage-room-status") && !participantsMarkup.includes("room-status-chip"));
check("status card is not rendered over the owner camera", !source.includes("backstage-room-status") && !sourceCss.includes("backstage-room-status"));
check("owner camera remains a distinct participant card", bundle.includes("owner-participant-card") && bundle.includes("participant-video"));
check("Present or invite remains a neighboring control", bundle.includes(presentInvite) && bundle.includes("backstage-invite-card"));
check("host and guest stage admission controls remain", bundle.includes(addToStage) && bundle.includes("remote-guest-card"));
check("desktop order remains owner, invite, then guests", sourceCss.includes(".participants > .owner-participant-card") && sourceCss.includes(".participants > .backstage-invite-card") && sourceCss.includes(".participants > .remote-guest-card") && sourceCss.includes("order: 0") && sourceCss.includes("order: 1") && sourceCss.includes("order: 2"));
check("participant row wraps instead of overflowing", sourceCss.includes("flex-wrap: wrap"));
check("narrow layouts keep owner and invite cards usable", sourceCss.includes(".participants > .owner-participant-card") && sourceCss.includes(".participants > .backstage-invite-card"));
for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}`);
const failed = checks.filter((result) => !result.passed);
console.log(JSON.stringify({
  directive: "TPI-STUDIOFLOW-041 (current contract; superseded placement covered by TPI-041A)",
  checks: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  ownerDataAccessed: false,
  storageModified: false,
}));
if (failed.length) process.exitCode = 1;
