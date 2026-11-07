export const NOVA_SLIDES_FORMAT = "nova-presentation" as const;
export const NOVA_SLIDES_VERSION = 1 as const;

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
  speakerNotes?: string;
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

export function envelope(presentation: Presentation): PresentationEnvelope {
  return { format: NOVA_SLIDES_FORMAT, version: NOVA_SLIDES_VERSION, presentation };
}

export function createBlankPresentation(id = crypto.randomUUID(), title = "Untitled Presentation"): Presentation {
  return {
    id,
    title,
    width: 960,
    height: 540,
    slides: [{
      id: crypto.randomUUID(),
      background: "#f7f4ec",
      elements: [{
        id: crypto.randomUUID(),
        kind: "text",
        x: 72,
        y: 64,
        width: 816,
        height: 78,
        text: title,
        fontSize: 42,
        fill: "#1d281f"
      }],
      speakerNotes: ""
    }]
  };
}

export function parsePresentation(value: unknown): Presentation {
  const parsed = value as Partial<PresentationEnvelope>;
  if (parsed?.format !== NOVA_SLIDES_FORMAT || parsed.version !== NOVA_SLIDES_VERSION || !parsed.presentation || !Array.isArray(parsed.presentation.slides)) {
    throw new Error("Not a valid Nova presentation envelope");
  }
  return parsed.presentation;
}

export function updateElement(presentation: Presentation, slideIndex: number, elementId: string, patch: Partial<SlideElement>): Presentation {
  const slide = presentation.slides[slideIndex];
  if (!slide) return presentation;
  return {
    ...presentation,
    slides: presentation.slides.map((candidate, index) => index === slideIndex
      ? { ...candidate, elements: candidate.elements.map(element => element.id === elementId ? { ...element, ...patch } as SlideElement : element) }
      : candidate)
  };
}

export function addSlide(presentation: Presentation): Presentation {
  const index = presentation.slides.length + 1;
  return {
    ...presentation,
    slides: [...presentation.slides, {
      id: crypto.randomUUID(),
      background: "#ffffff",
      elements: [{ id: crypto.randomUUID(), kind: "text", x: 72, y: 64, width: 816, height: 64, text: `Slide ${index}`, fontSize: 36, fill: "#1d281f" }],
      speakerNotes: ""
    }]
  };
}

export function duplicateSlide(presentation: Presentation, index: number): Presentation {
  const source = presentation.slides[index];
  if (!source) return presentation;
  const id = crypto.randomUUID();
  const copy = { ...source, id, elements: source.elements.map(element => ({ ...element, id: crypto.randomUUID() })) };
  return { ...presentation, slides: [...presentation.slides.slice(0, index + 1), copy, ...presentation.slides.slice(index + 1)] };
}

export function deleteSlide(presentation: Presentation, index: number): Presentation {
  if (presentation.slides.length <= 1 || !presentation.slides[index]) return presentation;
  return { ...presentation, slides: presentation.slides.filter((_, candidate) => candidate !== index) };
}

export function reorderSlide(presentation: Presentation, from: number, to: number): Presentation {
  if (from < 0 || to < 0 || from >= presentation.slides.length || to >= presentation.slides.length) return presentation;
  const slides = [...presentation.slides];
  const [moved] = slides.splice(from, 1);
  slides.splice(to, 0, moved);
  return { ...presentation, slides };
}
