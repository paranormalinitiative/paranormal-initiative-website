// TPI-NOVA-002 Firefox Developer Edition acceptance check.
// Drives the installed Firefox Developer Edition via geckodriver (WebDriver),
// using an isolated throwaway profile. Not part of the product.
//
// Usage: node scripts/firefox-check.mjs [url]

import { spawn } from "node:child_process";

const URL_UNDER_TEST = process.argv[2] ?? "http://127.0.0.1:5180/";
const FIREFOX_BINARY =
  "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const PORT = 4449;
const BASE = `http://127.0.0.1:${PORT}`;

const results = [];
let failures = 0;

function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wd(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status} ${text}`);
  }
  return json.value;
}

async function waitForGeckodriver() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`${BASE}/status`);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  throw new Error("geckodriver did not start");
}

const gecko = spawn("geckodriver", ["--port", String(PORT)], {
  stdio: ["ignore", "pipe", "pipe"],
});
gecko.stderr.on("data", (d) => process.stderr.write(`[geckodriver] ${d}`));

let sessionId;

try {
  await waitForGeckodriver();
  // geckodriver creates a disposable temporary profile for the session, so the
  // check never touches the owner's Firefox profile.
  const session = await wd("POST", "/session", {
    capabilities: {
      alwaysMatch: {
        browserName: "firefox",
        "moz:firefoxOptions": {
          binary: FIREFOX_BINARY,
          args: ["-headless", "-width=1280", "-height=1024"],
          prefs: { "dom.disable_beforeunload": true },
        },
      },
    },
  });
  sessionId = session.sessionId;
  check(
    "Firefox Developer Edition session created",
    Boolean(sessionId),
    session.capabilities?.browserVersion ?? "",
  );

  const el = (using, value) =>
    wd("POST", `/session/${sessionId}/element`, { using, value }).then((v) => v["element-6066-11e4-a52e-4f735466cecf"]);
  const click = (id) => wd("POST", `/session/${sessionId}/element/${id}/click`, {});
  const text = (id) => wd("GET", `/session/${sessionId}/element/${id}/text`);
  const sendKeys = (id, value) =>
    wd("POST", `/session/${sessionId}/element/${id}/value`, { text: value });
  const exec = async (script, args = []) => {
    const v = await wd("POST", `/session/${sessionId}/execute/sync`, { script, args });
    return v;
  };
  const byTestId = (id) => el("css selector", `[data-testid="${id}"]`);

  async function actions(list) {
    await wd("POST", `/session/${sessionId}/actions`, { actions: list });
    await wd("DELETE", `/session/${sessionId}/actions`);
  }

  async function drag(from, to, steps = 6) {
    const pointer = [{ type: "pointerMove", duration: 0, x: from.x, y: from.y, origin: "viewport" }];
    pointer.push({ type: "pointerDown", button: 0 });
    for (let i = 1; i <= steps; i += 1) {
      pointer.push({
        type: "pointerMove",
        duration: 30,
        x: Math.round(from.x + ((to.x - from.x) * i) / steps),
        y: Math.round(from.y + ((to.y - from.y) * i) / steps),
        origin: "viewport",
      });
    }
    pointer.push({ type: "pointerUp", button: 0 });
    await actions([{ type: "pointer", id: "mouse", parameters: { pointerType: "mouse" }, actions: pointer }]);
  }

  async function stageOrigin() {
    return exec(
      `const c = document.querySelector('[data-testid="slide-canvas-host"] canvas');
       c.scrollIntoView({block:'center'});
       const r = c.getBoundingClientRect();
       return {left: r.left, top: r.top, width: r.width, height: r.height};`,
    );
  }

  const readDoc = () => exec("return window.__novaSpike.docJSON();");
  const readPres = () => exec("return window.__novaSpike.presentation();");
  const countType = (node, type) => {
    let n = 0;
    const walk = (x) => {
      if (!x || typeof x !== "object") return;
      if (x.type === type) n += 1;
      (x.content ?? []).forEach(walk);
    };
    walk(node);
    return n;
  };

  // ---------- load ----------
  await wd("POST", `/session/${sessionId}/url`, { url: URL_UNDER_TEST });
  await sleep(1200);
  await exec(
    `return new Promise((resolve) => {
       const start = Date.now();
       const tick = () => {
         if (window.__novaSpike && window.__novaSpike.docJSON && window.__novaSpike.presentation) resolve(true);
         else if (Date.now() - start > 15000) resolve(false);
         else setTimeout(tick, 100);
       };
       tick();
     });`,
  );
  const ready = await exec("return Boolean(window.__novaSpike && window.__novaSpike.docJSON);");
  check("Firefox loaded the spike application", ready === true);

  // ---------- documents ----------
  const docEditor = await byTestId("nova-document");
  await click(docEditor);
  await sendKeys(docEditor, " Firefox typing check.");
  let doc = await readDoc();
  const docText = JSON.stringify(doc);
  const docBeforeFormat = docText;
  check("Documents: typing inserts structured text", docText.includes("Firefox typing check."));

  // select all + bold through the toolbar
  await actions([
    {
      type: "key",
      id: "keyboard",
      actions: [
        { type: "keyDown", value: "\uE03D" },
        { type: "keyDown", value: "a" },
        { type: "keyUp", value: "a" },
        { type: "keyUp", value: "\uE03D" },
      ],
    },
  ]);
  await click(await byTestId("fmt-bold"));
  doc = await readDoc();
  const boldBefore = JSON.stringify(doc);
  const allBold = (() => {
    let total = 0;
    let bold = 0;
    const walk = (x) => {
      if (!x || typeof x !== "object") return;
      if (x.type === "text" && x.text.trim().length > 0) {
        total += 1;
        if ((x.marks ?? []).some((m) => m.type === "bold")) bold += 1;
      }
      (x.content ?? []).forEach(walk);
    };
    walk(doc);
    return { total, bold };
  })();
  check(
    "Documents: selection formatting applies bold via transaction",
    allBold.total > 0 && allBold.bold === allBold.total,
    `${allBold.bold}/${allBold.total} text nodes bold`,
  );

  await click(await byTestId("undo"));
  doc = await readDoc();
  check(
    "Documents: undo reverts formatting",
    JSON.stringify(doc) === docBeforeFormat,
    `bold nodes after undo: ${JSON.stringify(doc).split('"type":"bold"').length - 1}`,
  );

  await click(await byTestId("redo"));
  doc = await readDoc();
  check("Documents: redo restores formatting", JSON.stringify(doc) === boldBefore);

  // table interaction: click into the first header cell, then add a row
  const tablePoint = await exec(
    `const editor = document.querySelector('[data-testid="nova-document"]');
     const cell = editor.querySelector('table th, table td');
     if (!cell) return null;
     const r = cell.getBoundingClientRect();
     return {x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2)};`,
  );
  if (tablePoint) {
    await actions([
      {
        type: "pointer",
        id: "mouse",
        parameters: { pointerType: "mouse" },
        actions: [
          { type: "pointerMove", duration: 0, x: tablePoint.x, y: tablePoint.y, origin: "viewport" },
          { type: "pointerDown", button: 0 },
          { type: "pointerUp", button: 0 },
        ],
      },
    ]);
  }
  const rowsBefore = countType(await readDoc(), "tableRow");
  await click(await byTestId("tbl-row"));
  const rowsAfter = countType(await readDoc(), "tableRow");
  check(
    "Documents: table row command mutates the table",
    tablePoint !== null && rowsAfter === rowsBefore + 1,
    `${rowsBefore} -> ${rowsAfter} rows`,
  );

  await click(await byTestId("doc-save"));
  const savedStatus = await text(await byTestId("doc-status"));
  check("Documents: JSON save produced structured JSON", /Saved \d+ characters of structured JSON/.test(savedStatus), savedStatus);

  const beforeReload = await readDoc();
  // mutate after save so the reload is observable
  await click(docEditor);
  await sendKeys(docEditor, " MUTATION");
  await click(await byTestId("doc-reload"));
  const afterReload = await readDoc();
  check(
    "Documents: JSON reload reconstructs the saved document",
    JSON.stringify(afterReload) === JSON.stringify(beforeReload) &&
      !JSON.stringify(afterReload).includes("MUTATION"),
  );

  // ---------- slides ----------
  const origin = await stageOrigin();
  check(
    "Slides: Konva stage renders a canvas",
    origin && origin.width > 0 && origin.height > 0,
    `${Math.round(origin.width)}x${Math.round(origin.height)}`,
  );

  const painted = await exec(
    `const c = document.querySelector('[data-testid="slide-canvas-host"] canvas');
     const ctx = c.getContext('2d');
     const d = ctx.getImageData(0, 0, c.width, c.height).data;
     let nonBackground = 0;
     for (let i = 0; i < d.length; i += 4) {
       if (d[i] !== 0 || d[i+1] !== 0 || d[i+2] !== 0 || d[i+3] !== 0) nonBackground += 1;
     }
     return nonBackground;`,
  );
  check("Slides: canvas contains rendered pixels", painted > 1000, `${painted} non-transparent pixels`);

  // select + drag the rectangle element (model coords 80,180 260x160 at scale 0.5)
  const scale = 0.5;
  const boxStart = { x: origin.left + 210 * scale, y: origin.top + 260 * scale };
  // click to select, then drag 50x30 CSS px (=> 100x60 model units at 0.5 scale)
  await actions([
    {
      type: "pointer",
      id: "mouse",
      parameters: { pointerType: "mouse" },
      actions: [
        { type: "pointerMove", duration: 0, x: Math.round(boxStart.x), y: Math.round(boxStart.y), origin: "viewport" },
        { type: "pointerDown", button: 0 },
        { type: "pointerUp", button: 0 },
      ],
    },
  ]);
  const selection = await exec("return window.__novaSpike.selection();");
  check("Slides: clicking an element selects it (transformer attaches)", selection === "el-box", String(selection));

  await drag(boxStart, { x: boxStart.x + 50, y: boxStart.y + 30 });
  let pres = await readPres();
  let box = pres.slides[0].elements.find((e) => e.id === "el-box");
  check(
    "Slides: dragging updates the model without touching canvas nodes",
    Math.abs(box.x - 180) < 8 && Math.abs(box.y - 240) < 8,
    `x=${box.x} y=${box.y}`,
  );

  // resize via the bottom-right transformer handle
  const handle = {
    x: origin.left + (box.x + box.width) * scale,
    y: origin.top + (box.y + box.height) * scale,
  };
  await drag(handle, { x: handle.x + 40, y: handle.y + 20 });
  pres = await readPres();
  box = pres.slides[0].elements.find((e) => e.id === "el-box");
  check(
    "Slides: transformer resize updates the model",
    box.width > 300 && box.height > 180,
    `w=${Math.round(box.width)} h=${Math.round(box.height)}`,
  );

  // text element still present and unchanged kind
  check(
    "Slides: text element renders from the model",
    pres.slides[0].elements.some((e) => e.kind === "text" && e.text === "Slide one"),
  );

  // slide switching
  await click(await byTestId("slide-next"));
  const indexText = await text(await byTestId("slide-index"));
  const currentSlide = await exec("return window.__novaSpike.currentSlide();");
  check("Slides: slide switching works", currentSlide === 1 && indexText.includes("Slide 2 of 2"), indexText);

  // duplicate / reorder / delete
  await click(await byTestId("slide-duplicate"));
  pres = await readPres();
  check("Slides: duplicate slide", pres.slides.length === 3, `${pres.slides.length} slides`);

  const orderBefore = pres.slides.map((s) => s.id);
  await click(await byTestId("slide-move-up"));
  pres = await readPres();
  const orderAfter = pres.slides.map((s) => s.id);
  check(
    "Slides: reorder slides",
    orderAfter[0] === orderBefore[1] && orderAfter[1] === orderBefore[0],
    orderAfter.join(","),
  );

  await click(await byTestId("slide-delete"));
  pres = await readPres();
  check("Slides: delete slide", pres.slides.length === 2, `${pres.slides.length} slides`);

  // JSON round trip
  await click(await byTestId("pres-save"));
  const savedPres = await readPres();
  const presMutationOrigin = await stageOrigin();
  const textEl = savedPres.slides[currentSlide]?.elements.find((e) => e.kind === "text");
  if (textEl) {
    await drag(
      { x: presMutationOrigin.left + (textEl.x + 20) * scale, y: presMutationOrigin.top + (textEl.y + 15) * scale },
      { x: presMutationOrigin.left + (textEl.x + 120) * scale, y: presMutationOrigin.top + (textEl.y + 15) * scale },
    );
  }
  const mutated = await readPres();
  await click(await byTestId("pres-reload"));
  const reloaded = await readPres();
  check(
    "Slides: JSON save/reload restores the presentation",
    JSON.stringify(mutated) !== JSON.stringify(savedPres) &&
      JSON.stringify(reloaded) === JSON.stringify(savedPres),
  );
  check(
    "Slides: reloaded presentation has no view state",
    !JSON.stringify(reloaded).toLowerCase().includes("transformer") &&
      !("selection" in (reloaded.slides[0] ?? {})),
  );

  // ---------- responsive ----------
  await wd("POST", `/session/${sessionId}/window/rect`, { width: 1024, height: 800, x: 0, y: 0 });
  await sleep(300);
  const desktop = await exec(
    `return { scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth };`,
  );
  await wd("POST", `/session/${sessionId}/window/rect`, { width: 820, height: 1000, x: 0, y: 0 });
  await sleep(300);
  const tablet = await exec(
    `return { scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth,
              stage: document.querySelector('[data-testid="slide-canvas-host"] canvas').getBoundingClientRect().width,
              toolbar: document.querySelector('[role="toolbar"]').getBoundingClientRect().width };`,
  );
  check(
    "Layout: no horizontal page overflow at desktop and tablet widths",
    desktop.scroll <= desktop.client + 1 && tablet.scroll <= tablet.client + 1,
    `desktop ${desktop.scroll}/${desktop.client}, tablet ${tablet.scroll}/${tablet.client}, stage ${Math.round(tablet.stage)}px`,
  );

  // ---------- console ----------
  const errors = await exec("return window.__novaErrors;");
  check("Firefox console: no runtime errors", Array.isArray(errors) && errors.length === 0, JSON.stringify(errors));

  await wd("DELETE", `/session/${sessionId}`);
  sessionId = undefined;
} catch (error) {
  check("Firefox check completed without harness errors", false, String(error));
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

const passed = results.filter((r) => r.ok).length;
console.log(`\nFirefox Developer Edition: ${passed}/${results.length} checks passed`);
if (failures > 0) {
  console.log("RESULT: FAIL");
  process.exit(1);
}
console.log("RESULT: PASS");
