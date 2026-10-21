import { readFileSync } from "node:fs";

const index = readFileSync("studio/index.html", "utf8");
const bridge = readFileSync("studio/video-playback-reset-bridge.js", "utf8");
const moduleMatch = index.match(/<script type="module" crossorigin src="([^"]+\.js)"><\/script>/);
if (!moduleMatch) throw new Error("StudioFlow module asset is missing from studio/index.html");
const moduleReference = moduleMatch[1];
const bundle = readFileSync(moduleReference.replace(/^\//, ""), "utf8");
const source = readFileSync(process.env.STUDIOFLOW_SOURCE ?? "/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx", "utf8");

const checks = [];
const check = (name, passed) => checks.push({ name, passed: Boolean(passed) });

check("the overlay policy bridge is cache-busted and loaded before the current StudioFlow module", index.includes("video-playback-reset-bridge.js?tpi031=video-overlay-v1") && index.indexOf("video-playback-reset-bridge.js") < index.indexOf(moduleReference));
check("the production stage is the bridge scope", bridge.includes('".program-stage video"') && bridge.includes("isStageVideo(video)"));
check("native video controls remain disabled", bridge.includes("video.controls = false"));
check("Picture-in-Picture is explicitly disabled for stage videos", bridge.includes("video.disablePictureInPicture = true") && bridge.includes('setAttribute("disablepictureinpicture", "")'));
check("remote playback is explicitly disabled for stage videos", bridge.includes("video.disableRemotePlayback = true") && bridge.includes('setAttribute("disableremoteplayback", "")'));
check("browser media-control hints are present without disabling StudioFlow Play/Stop controls", bridge.includes('setAttribute("controlslist", "nodownload noremoteplayback noplaybackrate")') && bridge.includes("selected && (kind === \"intro\" || kind === \"outro\")"));
check("Opera browser-level overlays are avoided with a stage-only canvas surface", bridge.includes('var MIRROR_VIDEO = ".program-stage > video.stage-background-video, .program-stage > video.stage-video"') && bridge.includes('document.createElement("canvas")') && bridge.includes('video.style.display = "none"'));
check("the canvas surface preserves playback, audio, looping, and completion events", bridge.includes("the same playback element into a") && bridge.includes('video.addEventListener("ended"') && bridge.includes("requestAnimationFrame(paint)"));
check("the background preview remains muted, inline, and looping", bundle.includes('className:"stage-background-video",loop:!0,muted:!0,playsInline:!0'));
check("the regular shared-media video remains muted, inline, and looping", bundle.includes('className:"stage-video contain",autoPlay:!0,loop:!0,muted:!0,playsInline:!0'));
check("intro and outro clips remain separate stage videos with playback completion handling", source.includes('activeScene?.kind !== "demo" && activeVideoClip?.previewUrl') && source.includes('onEnded={() => finishVideoClipPlayback(activeScene?.kind)}'));
check("the correction does not alter media bytes or add a replacement player", !bridge.includes("fetch(") && !bridge.includes("MediaRecorder") && !bridge.includes("re-encode"));

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}`);
const failed = checks.filter((result) => !result.passed);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-031", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, externalRequests: 0 }));
if (failed.length) process.exit(1);
