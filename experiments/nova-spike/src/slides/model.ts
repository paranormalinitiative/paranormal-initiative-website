// Nova Slides presentation model. Plain data only: no Konva nodes, no selection,
// zoom, drag or transformer state. Those belong to the view, not the model.

export const NOVA_SLIDES_FORMAT = "nova-presentation";
export const NOVA_SLIDES_VERSION = 1;

export interface TextElement {
  id: string;
  kind: "text";
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fill: string;
}

export interface ShapeElement {
  id: string;
  kind: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

export interface ImageElement {
  id: string;
  kind: "image";
  x: number;
  y: number;
  width: number;
  height: number;
  placeholder: string;
}

export type SlideElement = TextElement | ShapeElement | ImageElement;

export interface Slide {
  id: string;
  background: string;
  elements: SlideElement[];
}

export interface Presentation {
  id: string;
  title: string;
  width: number;
  height: number;
  slides: Slide[];
}

export interface PresentationEnvelope {
  format: typeof NOVA_SLIDES_FORMAT;
  version: typeof NOVA_SLIDES_VERSION;
  presentation: Presentation;
}

export function serializePresentation(p: Presentation): string {
  const envelope: PresentationEnvelope = {
    format: NOVA_SLIDES_FORMAT,
    version: NOVA_SLIDES_VERSION,
    presentation: p,
  };
  return JSON.stringify(envelope);
}

export function parsePresentation(text: string): Presentation {
  const parsed = JSON.parse(text) as Partial<PresentationEnvelope>;
  if (
    parsed.format !== NOVA_SLIDES_FORMAT ||
    parsed.version !== NOVA_SLIDES_VERSION ||
    !parsed.presentation ||
    !Array.isArray(parsed.presentation.slides)
  ) {
    throw new Error("Not a valid Nova presentation envelope");
  }
  return parsed.presentation;
}

export function createSamplePresentation(): Presentation {
  return {
    id: "pres-spike",
    title: "Nova spike presentation",
    width: 960,
    height: 540,
    slides: [
      {
        id: "slide-1",
        background: "#f5f1e8",
        elements: [
          { id: "el-title", kind: "text", x: 60, y: 40, width: 840, height: 80, text: "Slide one", fontSize: 44, fill: "#1d1b16" },
          { id: "el-box", kind: "rect", x: 80, y: 180, width: 260, height: 160, fill: "#4a7c59" },
          { id: "el-img", kind: "image", x: 480, y: 180, width: 300, height: 200, placeholder: "Image placeholder" },
        ],
      },
      {
        id: "slide-2",
        background: "#ffffff",
        elements: [
          { id: "el-title-2", kind: "text", x: 60, y: 40, width: 840, height: 80, text: "Slide two", fontSize: 44, fill: "#1d1b16" },
        ],
      },
    ],
  };
}

// ---- Pure operations (immutable, return new presentations) ----

export function reorderSlide(p: Presentation, from: number, to: number): Presentation {
  if (from < 0 || from >= p.slides.length || to < 0 || to >= p.slides.length) return p;
  const slides = p.slides.slice();
  const [moved] = slides.splice(from, 1);
  slides.splice(to, 0, moved);
  return { ...p, slides };
}

export function duplicateSlide(p: Presentation, index: number, newId: string): Presentation {
  const source = p.slides[index];
  if (!source) return p;
  const copy: Slide = {
    ...source,
    id: newId,
    elements: source.elements.map((el) => ({ ...el, id: `${el.id}-${newId}` })),
  };
  const slides = p.slides.slice();
  slides.splice(index + 1, 0, copy);
  return { ...p, slides };
}

export function deleteSlide(p: Presentation, index: number): Presentation {
  if (index < 0 || index >= p.slides.length) return p;
  return { ...p, slides: p.slides.filter((_, i) => i !== index) };
}

export function updateElement(
  p: Presentation,
  slideIndex: number,
  elementId: string,
  patch: Partial<SlideElement>,
): Presentation {
  const slide = p.slides[slideIndex];
  if (!slide) return p;
  const elements = slide.elements.map((el) =>
    el.id === elementId ? ({ ...el, ...patch } as SlideElement) : el,
  );
  const slides = p.slides.slice();
  slides[slideIndex] = { ...slide, elements };
  return { ...p, slides };
}
