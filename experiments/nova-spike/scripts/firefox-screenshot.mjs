// Headful Firefox Developer Edition visual capture for TPI-NOVA-002 acceptance.
// Usage: node scripts/firefox-screenshot.mjs [url]
// Writes PNGs to /tmp/nova-firefox-*.png (spike evidence, not committed).

import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";

const URL_UNDER_TEST = process.argv[2] ?? "http://127.0.0.1:5180/";
const PORT = 4450;
const BASE = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wd(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${text}`);
  return text ? JSON.parse(text).value : {};
}

const gecko = spawn("geckodriver", ["--port", String(PORT)], { stdio: "ignore" });
let sessionId;
try {
  for (let i = 0; i < 60; i += 1) {
    try {
      if ((await fetch(`${BASE}/status`)).ok) break;
    } catch {
      await sleep(250);
    }
  }
  const session = await wd("POST", "/session", {
    capabilities: {
      alwaysMatch: {
        browserName: "firefox",
        "moz:firefoxOptions": {
          binary: "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox",
          args: ["-width=1280", "-height=900"],
        },
      },
    },
  });
  sessionId = session.sessionId;

  const shoot = async (width, height, file) => {
    await wd("POST", `/session/${sessionId}/window/rect`, { width, height, x: 40, y: 40 });
    await sleep(900);
    const data = await wd("GET", `/session/${sessionId}/screenshot`);
    await writeFile(file, Buffer.from(data, "base64"));
    console.log("saved", file);
  };

  await wd("POST", `/session/${sessionId}/url`, { url: URL_UNDER_TEST });
  await sleep(2500);
  await shoot(1280, 1400, "/tmp/nova-firefox-desktop.png");
  await wd("POST", `/session/${sessionId}/execute/sync`, {
    script: "document.querySelector('[data-testid=\"slide-canvas-host\"]').scrollIntoView({block:'center'}); return true;",
    args: [],
  });
  await sleep(600);
  await shoot(1280, 900, "/tmp/nova-firefox-slides.png");
  await shoot(820, 1200, "/tmp/nova-firefox-tablet.png");
} finally {
  if (sessionId) {
    try {
      await wd("DELETE", `/session/${sessionId}`);
    } catch {
      /* ignore */
    }
  }
  gecko.kill("SIGTERM");
}
