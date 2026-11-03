import { useEffect, useState } from "react";
import { SlideCanvas } from "./SlideCanvas";
import {
  createSamplePresentation,
  deleteSlide,
  duplicateSlide,
  reorderSlide,
  serializePresentation,
  parsePresentation,
  updateElement,
  type Presentation,
  type SlideElement,
} from "./model";

let duplicateCounter = 0;

export function SlidesSpike() {
  const [presentation, setPresentation] = useState<Presentation>(() => createSamplePresentation());
  const [current, setCurrent] = useState(0);
  const [saved, setSaved] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    window.__novaSpike = {
      ...window.__novaSpike,
      presentation: () => presentation,
      currentSlide: () => current,
    };
  }, [presentation, current]);

  const slide = presentation.slides[current] ?? presentation.slides[0];
  const scale = 0.5;

  const onUpdateElement = (elementId: string, patch: Partial<SlideElement>) =>
    setPresentation((p) => updateElement(p, current, elementId, patch));

  const move = (delta: number) => {
    const target = current + delta;
    setPresentation((p) => reorderSlide(p, current, target));
    setCurrent(target);
  };

  const duplicate = () => {
    duplicateCounter += 1;
    setPresentation((p) => duplicateSlide(p, current, `slide-dup-${duplicateCounter}`));
    setStatus("Duplicated slide");
  };

  const remove = () => {
    setPresentation((p) => deleteSlide(p, current));
    setCurrent((c) => Math.max(0, c - 1));
    setStatus("Deleted slide");
  };

  const save = () => {
    const text = serializePresentation(presentation);
    setSaved(text);
    setStatus(`Saved ${text.length} characters of presentation JSON`);
  };

  const reload = () => {
    if (!saved) {
      setStatus("Nothing saved yet");
      return;
    }
    setPresentation(parsePresentation(saved));
    setCurrent(0);
    setStatus("Reloaded presentation from JSON");
  };

  return (
    <section aria-labelledby="slides-heading">
      <h2 id="slides-heading">Slides (Konva / React-Konva)</h2>
      <div role="toolbar" aria-label="Slide controls" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button type="button" data-testid="slide-prev" onClick={() => setCurrent((c) => Math.max(0, c - 1))}>Previous slide</button>
        <button type="button" data-testid="slide-next" onClick={() => setCurrent((c) => Math.min(presentation.slides.length - 1, c + 1))}>Next slide</button>
        <button type="button" data-testid="slide-move-up" onClick={() => move(-1)} disabled={current === 0}>Move up</button>
        <button type="button" data-testid="slide-move-down" onClick={() => move(1)} disabled={current >= presentation.slides.length - 1}>Move down</button>
        <button type="button" data-testid="slide-duplicate" onClick={duplicate}>Duplicate slide</button>
        <button type="button" data-testid="slide-delete" onClick={remove} disabled={presentation.slides.length <= 1}>Delete slide</button>
        <button type="button" data-testid="pres-save" onClick={save}>Save JSON</button>
        <button type="button" data-testid="pres-reload" onClick={reload}>Reload JSON</button>
      </div>
      <p data-testid="slide-index">
        Slide {current + 1} of {presentation.slides.length} (id: {slide.id})
      </p>
      <div
        data-testid="slide-canvas-host"
        style={{ border: "1px solid #aaa", display: "inline-block", marginTop: 8, maxWidth: "100%", overflow: "auto" }}
      >
        <SlideCanvas
          key={slide.id}
          presentation={presentation}
          slide={slide}
          slideIndex={current}
          scale={scale}
          onUpdateElement={onUpdateElement}
        />
      </div>
      <p data-testid="slides-status" role="status">{status}</p>
    </section>
  );
}
