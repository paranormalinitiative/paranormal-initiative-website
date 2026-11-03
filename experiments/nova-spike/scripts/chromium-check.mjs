// TPI-NOVA-002 Chromium compatibility check (compatibility validation only;
// Firefox Developer Edition remains authoritative). Uses the Playwright copy
// already present in the repository, driving an isolated headless Chromium.
//
// Usage: node scripts/chromium-check.mjs [url]

import { chromium } from "playwright";

const URL_UNDER_TEST = process.argv[2] ?? "http://127.0.0.1:5180/";
const results = [];
let failures = 0;

function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(`console.error: ${m.text()}`);
});

const byTestId = (id) => page.locator(`[data-testid="${id}"]`);
const readDoc = () => page.evaluate(() => window.__novaSpike.docJSON());
const readPres = () => page.evaluate(() => window.__novaSpike.presentation());
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

try {
  await page.goto(URL_UNDER_TEST, { waitUntil: "load" });
  await page.waitForFunction(() => window.__novaSpike?.docJSON && window.__novaSpike?.presentation, null, {
    timeout: 15000,
  });
  check("Chromium loaded the spike application", true, await page.title());

  // ---------- documents ----------
  const editor = byTestId("nova-document");
  await editor.click();
  await page.keyboard.type(" Chromium typing check.");
  let doc = await readDoc();
  const docBeforeFormat = JSON.stringify(doc);
  check("Documents: typing inserts structured text", docBeforeFormat.includes("Chromium typing check."));

  await page.keyboard.press("Meta+a");
  await byTestId("fmt-bold").click();
  doc = await readDoc();
  const boldBefore = JSON.stringify(doc);
  const marks = await page.evaluate(() => {
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
    walk(window.__novaSpike.docJSON());
    return { total, bold };
  });
  check(
    "Documents: selection formatting applies bold via transaction",
    marks.total > 0 && marks.bold === marks.total,
    `${marks.bold}/${marks.total} text nodes bold`,
  );

  await byTestId("undo").click();
  doc = await readDoc();
  check("Documents: undo reverts formatting", JSON.stringify(doc) === docBeforeFormat);
  await byTestId("redo").click();
  doc = await readDoc();
  check("Documents: redo restores formatting", JSON.stringify(doc) === boldBefore);

  const cell = page.locator('[data-testid="nova-document"] table th').first();
  await cell.click();
  const rowsBefore = countType(await readDoc(), "tableRow");
  await byTestId("tbl-row").click();
  const rowsAfter = countType(await readDoc(), "tableRow");
  check("Documents: table row command mutates the table", rowsAfter === rowsBefore + 1, `${rowsBefore} -> ${rowsAfter} rows`);

  await byTestId("doc-save").click();
  const savedStatus = await byTestId("doc-status").textContent();
  check("Documents: JSON save produced structured JSON", /Saved \d+ characters of structured JSON/.test(savedStatus ?? ""), savedStatus ?? "");

  const beforeReload = await readDoc();
  await editor.click();
  await page.keyboard.type(" MUTATION");
  await byTestId("doc-reload").click();
  const afterReload = await readDoc();
  check(
    "Documents: JSON reload reconstructs the saved document",
    JSON.stringify(afterReload) === JSON.stringify(beforeReload) && !JSON.stringify(afterReload).includes("MUTATION"),
  );

  // ---------- slides ----------
  const host = byTestId("slide-canvas-host");
  await host.scrollIntoViewIfNeeded();
  const canvas = host.locator("canvas").first();
  const canvasBox = await canvas.boundingBox();
  check("Slides: Konva stage renders a canvas", Boolean(canvasBox && canvasBox.width > 0), `${Math.round(canvasBox?.width ?? 0)}x${Math.round(canvasBox?.height ?? 0)}`);

  const painted = await page.evaluate(() => {
    const c = document.querySelector('[data-testid="slide-canvas-host"] canvas');
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] || d[i + 1] || d[i + 2] || d[i + 3]) n += 1;
    return n;
  });
  check("Slides: canvas contains rendered pixels", painted > 1000, `${painted} non-transparent pixels`);

  const scale = 0.5;
  const boxStart = { x: canvasBox.x + 210 * scale, y: canvasBox.y + 260 * scale };
  await page.mouse.click(boxStart.x, boxStart.y);
  const selection = await page.evaluate(() => window.__novaSpike.selection());
  check("Slides: clicking an element selects it (transformer attaches)", selection === "el-box", String(selection));

  await page.mouse.move(boxStart.x, boxStart.y);
  await page.mouse.down();
  await page.mouse.move(boxStart.x + 50, boxStart.y + 30, { steps: 6 });
  await page.mouse.up();
  let pres = await readPres();
  let box = pres.slides[0].elements.find((e) => e.id === "el-box");
  check("Slides: dragging updates the model", Math.abs(box.x - 180) < 8 && Math.abs(box.y - 240) < 8, `x=${box.x} y=${box.y}`);

  const handle = { x: canvasBox.x + (box.x + box.width) * scale, y: canvasBox.y + (box.y + box.height) * scale };
  await page.mouse.move(handle.x, handle.y);
  await page.mouse.down();
  await page.mouse.move(handle.x + 40, handle.y + 20, { steps: 6 });
  await page.mouse.up();
  pres = await readPres();
  box = pres.slides[0].elements.find((e) => e.id === "el-box");
  check(
    "Slides: transformer resize updates the model",
    box.width > 300 && box.height > 180,
    `w=${Math.round(box.width)} h=${Math.round(box.height)}`,
  );
  check(
    "Slides: text element renders from the model",
    pres.slides[0].elements.some((e) => e.kind === "text" && e.text === "Slide one"),
  );

  await byTestId("slide-next").click();
  const indexText = await byTestId("slide-index").textContent();
  const currentSlide = await page.evaluate(() => window.__novaSpike.currentSlide());
  check("Slides: slide switching works", currentSlide === 1 && (indexText ?? "").includes("Slide 2 of 2"), indexText ?? "");

  await byTestId("slide-duplicate").click();
  pres = await readPres();
  check("Slides: duplicate slide", pres.slides.length === 3, `${pres.slides.length} slides`);

  const orderBefore = pres.slides.map((s) => s.id);
  await byTestId("slide-move-up").click();
  pres = await readPres();
  const orderAfter = pres.slides.map((s) => s.id);
  check("Slides: reorder slides", orderAfter[0] === orderBefore[1] && orderAfter[1] === orderBefore[0], orderAfter.join(","));

  await byTestId("slide-delete").click();
  pres = await readPres();
  check("Slides: delete slide", pres.slides.length === 2, `${pres.slides.length} slides`);

  await byTestId("pres-save").click();
  const savedPres = await readPres();
  const textEl = savedPres.slides[currentSlide]?.elements.find((e) => e.kind === "text");
  await host.scrollIntoViewIfNeeded();
  const canvasBox2 = await canvas.boundingBox();
  if (textEl && canvasBox2) {
    const start = { x: canvasBox2.x + (textEl.x + 20) * scale, y: canvasBox2.y + (textEl.y + 15) * scale };
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + 45, start.y, { steps: 5 });
    await page.mouse.up();
  }
  const mutated = await readPres();
  await byTestId("pres-reload").click();
  const reloaded = await readPres();
  check(
    "Slides: JSON save/reload restores the presentation",
    JSON.stringify(mutated) !== JSON.stringify(savedPres) && JSON.stringify(reloaded) === JSON.stringify(savedPres),
  );
  check(
    "Slides: reloaded presentation has no view state",
    !JSON.stringify(reloaded).toLowerCase().includes("transformer") && !("selection" in (reloaded.slides[0] ?? {})),
  );

  // ---------- responsive ----------
  const overflow = async (width, height) => {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(250);
    return page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
  };
  const desktop = await overflow(1280, 900);
  const tablet = await overflow(820, 1000);
  check(
    "Layout: no horizontal page overflow at desktop and tablet widths",
    desktop.scroll <= desktop.client + 1 && tablet.scroll <= tablet.client + 1,
    `desktop ${desktop.scroll}/${desktop.client}, tablet ${tablet.scroll}/${tablet.client}`,
  );

  const hookErrors = await page.evaluate(() => window.__novaErrors);
  check("Chromium console: no runtime errors", consoleErrors.length === 0 && hookErrors.length === 0, JSON.stringify([...consoleErrors, ...hookErrors]));
} catch (error) {
  check("Chromium check completed without harness errors", false, String(error));
} finally {
  await browser.close();
}

const passed = results.filter((r) => r.ok).length;
console.log(`\nChromium: ${passed}/${results.length} checks passed`);
if (failures > 0) {
  console.log("RESULT: FAIL");
  process.exit(1);
}
console.log("RESULT: PASS");
