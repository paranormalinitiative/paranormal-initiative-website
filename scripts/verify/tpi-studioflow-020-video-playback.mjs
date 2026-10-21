import { readFileSync } from "node:fs";

const index = readFileSync("studio/index.html", "utf8");
const bridge = readFileSync("studio/video-playback-reset-bridge.js", "utf8");
const moduleMatch = index.match(/<script type="module" crossorigin src="([^"]+\.js)"><\/script>/);
if (!moduleMatch) throw new Error("StudioFlow module asset is missing from studio/index.html");
const moduleReference = moduleMatch[1];
const bundle = readFileSync(moduleReference.replace(/^\//, ""), "utf8");

const checks = [];
const check = (name, passed) => checks.push({ name, passed: Boolean(passed) });

check("the playback reset bridge is loaded before the current StudioFlow module", index.indexOf("video-playback-reset-bridge.js?tpi031=video-overlay-v1") < index.indexOf(moduleReference));
check("fresh stage activations reset the visible video to zero", bridge.includes('video.addEventListener("play"') && bridge.includes("video.currentTime = 0"));
check("natural completion resets the visible video", bridge.includes('video.addEventListener("ended"') && bridge.includes('video.addEventListener("emptied"'));
check("removed stage videos are paused and reset", bridge.includes("record.removedNodes.forEach") && bridge.includes("reset(node)"));
check("the selected Intro/Outro control toggles playback off", bridge.includes("selected && (kind === \"intro\" || kind === \"outro\")") && bridge.includes("stopProgramPreview(true)"));
check("switching scenes stops the previous program moment", bridge.includes("!selected && (kind === \"intro\" || kind === \"outro\" || kind === \"demo\")"));
check("production start clears preview state without starting playback", bridge.includes('label === "record" || label === "go live"') && bridge.includes("Do not start playback here"));
check("playback position is not persisted as workspace state", !bridge.includes("localStorage") && !bridge.includes("sessionStorage"));
check("the production compositor clip is one-shot rather than looping", bundle.includes('const P=document.createElement("video");P.playsInline=!0,P.autoplay=!0,P.loop=!1,P.muted=!0'));
check("recording and livestream controls remain outside the playback bridge", !bridge.includes("MediaRecorder") && !bridge.includes("getUserMedia") && !bridge.includes("stopLiveStream"));
check("natural Outro completion does not stop recording or livestreaming", !bundle.includes('u==="outro"&&(tt==="recording"&&xf(),') && !bundle.includes('(fe==="streaming"||fe==="reconnecting")&&kf()'));
check("removed stage videos are recognized after DOM detachment", bridge.includes('node.matches("video.stage-video, video.stage-background-video")'));
check("removed mirrored videos remove their stale canvas surface", bridge.includes("__tpiStageSurfaceCanvas") && bridge.includes("canvas.parentNode.removeChild(canvas)"));
check("emptied mirrored videos clear their stale canvas surface", bridge.includes("__tpiStageSurfaceClear") && bridge.includes("context.clearRect(0, 0, canvas.width, canvas.height)"));

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}`);
const failed = checks.filter((result) => !result.passed);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-020", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, externalRequests: 0 }));
if (failed.length) process.exit(1);
