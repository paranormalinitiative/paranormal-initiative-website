import { describe, expect, it } from "vitest";
import {
  createSamplePresentation,
  deleteSlide,
  duplicateSlide,
  parsePresentation,
  reorderSlide,
  serializePresentation,
  updateElement,
} from "../src/slides/model";

describe("Nova slide model", () => {
  it("round trips the presentation through JSON", () => {
    const original = createSamplePresentation();
    const restored = parsePresentation(serializePresentation(original));
    expect(restored).toEqual(original);
    expect(restored.slides).toHaveLength(2);
    expect(restored.slides[0].elements.map((e) => e.kind)).toEqual([
      "text",
      "rect",
      "image",
    ]);
  });

  it("reorders slides", () => {
    const p = createSamplePresentation();
    const next = reorderSlide(p, 0, 1);
    expect(next.slides.map((s) => s.id)).toEqual(["slide-2", "slide-1"]);
    // original untouched (immutable update)
    expect(p.slides.map((s) => s.id)).toEqual(["slide-1", "slide-2"]);
  });

  it("duplicates a slide with fresh element ids", () => {
    const p = createSamplePresentation();
    const next = duplicateSlide(p, 0, "copy");
    expect(next.slides).toHaveLength(3);
    expect(next.slides[1].id).toBe("copy");
    const sourceIds = p.slides[0].elements.map((e) => e.id);
    const copyIds = next.slides[1].elements.map((e) => e.id);
    expect(copyIds.some((id) => sourceIds.includes(id))).toBe(false);
  });

  it("deletes a slide", () => {
    const p = createSamplePresentation();
    const next = deleteSlide(p, 0);
    expect(next.slides.map((s) => s.id)).toEqual(["slide-2"]);
  });

  it("updates one element without touching the others", () => {
    const p = createSamplePresentation();
    const next = updateElement(p, 0, "el-box", { x: 400, width: 300 });
    const el = next.slides[0].elements.find((e) => e.id === "el-box");
    expect(el).toMatchObject({ x: 400, width: 300, fill: "#4a7c59" });
    expect(next.slides[0].elements.find((e) => e.id === "el-title")).toBe(
      p.slides[0].elements.find((e) => e.id === "el-title"),
    );
  });

  it("keeps view state out of the persisted model", () => {
    const p = createSamplePresentation();
    const json = serializePresentation(p);
    for (const key of ["selection", "zoom", "dragging", "transformer", "guides"]) {
      expect(json.toLowerCase()).not.toContain(`"${key}`);
    }
  });
});
