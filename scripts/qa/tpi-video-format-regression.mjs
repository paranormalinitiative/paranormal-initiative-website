import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../../tpi-video-format.js", import.meta.url), "utf8");
const context = { window: {}, Intl, Number, String, Math, Date };
vm.runInNewContext(source, context, { filename: "tpi-video-format.js" });
const format = context.window.TPI_VIDEO_FORMAT;
assert.ok(format, "format API is exposed");

const cases = [[31, "0:31"], [60, "1:00"], [799, "13:19"], [900, "15:00"], [1648, "27:28"], [4418, "1:13:38"]];
for (const [seconds, expected] of cases) assert.equal(format.formatDuration(seconds, "seconds"), expected);
assert.equal(format.formatDuration("45:20", "formatted"), "45:20");
assert.equal(format.formatDuration(null, "seconds"), "");
assert.equal(format.formatDuration("invalid", "formatted"), "");
assert.equal(format.formatDuration("799", undefined), "");
assert.equal(format.durationBucket({ duration: "31", durationUnit: "seconds" }), "under-1");
assert.equal(format.durationBucket({ duration: "2:20", durationUnit: "formatted" }), "1-5");
assert.equal(format.durationBucket({ duration: "unknown", durationUnit: "formatted" }), "unknown");
assert.equal(format.formatDate("2026-10-11T16:00:00.000Z"), "October 11, 2026");
assert.equal(format.formatDate("not-a-date"), "");

const catalog = fs.readFileSync(new URL("../../tpi-videos.html", import.meta.url), "utf8");
assert.match(catalog, /id="video-duration-filter"/);
assert.match(catalog, /tpi-video-format\.js\?v=1/);
assert.match(catalog, /durationBucket/);
assert.match(catalog, /aria-label="Duration/);

console.log("TPI video duration/date regression: PASS (formatting, unknown handling, filters, and card wiring)");
