import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { validateVideoSource } from "../../lib/video-providers.js";

const source = fs.readFileSync(new URL("../../tpi-video-player.js", import.meta.url), "utf8");
const context = { window: {}, URL, location: { hostname: "paranormalinitiative.com", href: "https://paranormalinitiative.com/tpi-video.html" } };
vm.runInNewContext(source, context, { filename: "tpi-video-player.js" });
const player = context.window.TPI_VIDEO_PLAYER;
assert.ok(player, "player API is exposed");

const direct = player.resolveSource({
  title: "Controlled fixture",
  directMediaUrl: "https://media.paranormalinitiative.com/fixtures/tpi-007.mp4",
});
assert.equal(direct.kind, "DIRECT_BROWSER_MEDIA");
assert.match(player.renderPlayer({ title: "Controlled fixture" }, direct), /<video[^>]+controls/);
assert.match(player.renderPlayer({ title: "Controlled fixture" }, direct), /playsinline/);

const verifiedReplay = player.resolveSource({
  replayUrl: "https://media.paranormalinitiative.com/replays/example.webm",
  replayPublished: true,
});
assert.equal(verifiedReplay.kind, "DIRECT_BROWSER_MEDIA");

const youtube = player.resolveSource({
  embedUrl: "https://www.youtube-nocookie.com/embed/example123",
});
assert.equal(youtube.kind, "APPROVED_PROVIDER_EMBED");
assert.match(player.renderPlayer({ title: "Approved embed" }, youtube), /<iframe/);

const external = player.resolveSource({
  videoUrl: "https://odysee.com/@tpi/example",
});
assert.equal(external.kind, "APPROVED_EXTERNAL_WATCH");
assert.equal(external.intent, "EXTERNAL_BY_DESIGN");
assert.equal(external.actionLabel, "WATCH ON ODYSEE");
assert.match(player.renderPlayer({ title: "External" }, external), /Watch this video on Odysee/);
assert.doesNotMatch(player.renderPlayer({ title: "External" }, external), /Playback unavailable here/);
assert.doesNotMatch(player.renderPlayer({ title: "External" }, external), /<video/);

const dailymotion = player.resolveSource({
  videoUrl: "https://www.dailymotion.com/video/xbhjoqe",
});
assert.equal(dailymotion.kind, "APPROVED_EXTERNAL_WATCH");
assert.equal(dailymotion.intent, "EXTERNAL_FALLBACK");
assert.equal(dailymotion.actionLabel, "WATCH ON DAILYMOTION");

const dailymotionEmbed = player.resolveSource({
  embedUrl: "https://geo.dailymotion.com/player/x8lr5.html?video=xbhjoqe",
});
assert.equal(dailymotionEmbed.kind, "APPROVED_PROVIDER_EMBED");

const dailymotionNoPlayer = player.resolveSource({
  embedUrl: "https://geo.dailymotion.com/player.html?video=xbhjoqe",
});
assert.equal(dailymotionNoPlayer.kind, "UNSUPPORTED");

const serverDailymotion = validateVideoSource(
  "https://www.dailymotion.com/video/xbhjoqe",
  "https://geo.dailymotion.com/player/x8lr5.html?video=xbhjoqe"
);
assert.equal(serverDailymotion.ok, true);
assert.equal(serverDailymotion.embedUrl, "https://geo.dailymotion.com/player/x8lr5.html?video=xbhjoqe");
assert.equal(validateVideoSource("https://www.dailymotion.com/video/xbhjoqe", "https://geo.dailymotion.com/player.html?video=xbhjoqe").ok, false);
assert.equal(validateVideoSource("https://odysee.com/@tpi/example", "").ok, true);
assert.equal(validateVideoSource("javascript:alert(1)", "").ok, false);

const local = player.resolveSource({ storageLocation: "browser", recordingBlobKey: "recording-1" });
assert.equal(local.kind, "LOCAL_PRIVATE_RECORDING");

const unsafe = player.resolveSource({ embedUrl: "javascript:alert(1)" });
assert.equal(unsafe.kind, "UNSUPPORTED");
assert.doesNotMatch(player.renderPlayer({ title: "Unsafe" }, unsafe), /<(?:iframe|video)\b/);

const thumbnailOnly = player.resolveSource({ thumbnail: "https://paranormalinitiative.com/images/example.jpg" });
assert.equal(thumbnailOnly.kind, "UNAVAILABLE");
assert.doesNotMatch(player.renderPlayer({ title: "Thumbnail only" }, thumbnailOnly), /<img/);

const html = fs.readFileSync(new URL("../../tpi-video.html", import.meta.url), "utf8");
assert.match(html, /tpi-video-player\.js\?v=2/);
assert.match(html, /TPI_VIDEO_PLAYER\.resolveSource/);
assert.match(html, /Members-only playback/);

const catalog = fs.readFileSync(new URL("../../tpi-videos.html", import.meta.url), "utf8");
assert.match(catalog, /tpi-video-player\.js\?v=2/);
assert.match(catalog, /TPI_VIDEO_PLAYER\.actionFor/);
assert.match(catalog, /target="_blank" rel="noopener noreferrer"/);

console.log("TPI video player regression: PASS (22 source, policy, server-validation, and rendering assertions)");
