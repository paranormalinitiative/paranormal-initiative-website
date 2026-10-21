#!/usr/bin/env node

import { readFileSync } from "node:fs";

const sourcePath = process.env.STUDIOFLOW_SOURCE ?? "/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx";
const source = readFileSync(sourcePath, "utf8");
const index = readFileSync("studio/index.html", "utf8");
const moduleMatch = index.match(/<script type="module" crossorigin src="([^"]+\.js)"><\/script>/);
if (!moduleMatch) throw new Error("StudioFlow module asset is missing from studio/index.html");
const bundle = readFileSync(moduleMatch[1].replace(/^\//, ""), "utf8");
const checks = [];

function check(name, condition) {
  checks.push({ name, passed: Boolean(condition) });
}

check("admission signal is defined", source.includes('type: "guest-stage-state"'));
check("host sends synchronized admission state", source.includes("admitted: stagedGuestIdsRef.current.includes(message.guestId)"));
check("guest receives synchronized admission state", source.includes("setGuestAdmitted(signal.admitted)"));
check("waiting guest audio is excluded from program inputs", source.includes("getProgramAudioInputs(excludeGuestId?: string)") && source.includes("guest.id !== excludeGuestId"));
check("guest return mix excludes the receiving guest", source.includes("createGuestReturnAudioMix(guestId") && source.includes("getProgramAudioInputs(guestId)"));
check("host sends a per-guest audio return track", source.includes("connection.addTrack(track, entry.destination.stream)"));
check("guest plays the received program audio", source.includes("guestProgramAudioElementRef") && source.includes("connection.ontrack") && source.includes('event.track.kind !== "audio"'));
check("stage removal uses admission state instead of disconnect", source.includes("toggleGuestOnStage(guest.id)") && source.includes('type: "guest-removed"'));
check("explicit guest removal remains separate", source.includes("function removeGuestFromStudio(guestId: string)"));
check("waiting message states listen-only behavior", source.includes("You are backstage. You can hear the show, but the studio cannot hear you until you are added to the stage."));
check("admitted message states on-stage behavior", source.includes("You are on stage. Your audio and video can participate in the show."));
check("recording remains opt-in by default", source.includes("recordBackstageAutomatically: false"));
check("generated local bundle contains the admission signal", bundle.includes("guest-stage-state"));
check("generated local bundle contains return-audio handling", bundle.includes("Studio program audio") && bundle.includes("setSinkId") && bundle.includes("guest-stage-state"));

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}`);
const failed = checks.filter((result) => !result.passed);
console.log(JSON.stringify({
  directive: "TPI-STUDIOFLOW-045",
  checks: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  ownerDataAccessed: false,
  storageModified: false
}));
if (failed.length) process.exitCode = 1;
