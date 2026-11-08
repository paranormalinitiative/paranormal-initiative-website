export const NOVA_SLIDES_FORMAT = "nova-presentation" as const;
export const NOVA_SLIDES_VERSION = 1 as const;

export type SlideTemplateKey = "blank" | "field-report" | "evidence-brief" | "lecture";

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
  src?: string;
  alt?: string;
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

export function createBlankPresentation(id: string = crypto.randomUUID(), title = "Untitled Presentation"): Presentation {
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

function text(id: string, x: number, y: number, width: number, height: number, value: string, fontSize: number, fill: string): TextElement {
  return { id, kind: "text", x, y, width, height, text: value, fontSize, fill };
}

function templateSlide(title: string, body: string, notes: string, background: string, accent: string, index: number): Slide {
  return {
    id: crypto.randomUUID(),
    background,
    elements: [
      { id: crypto.randomUUID(), kind: "rect", x: 72, y: 72, width: 10, height: 396, fill: accent },
      text(crypto.randomUUID(), 112, 76, 760, 70, title, 38, "#f5f7f4"),
      text(crypto.randomUUID(), 112, 168, 742, 250, body, 22, "#d7e4dc"),
      text(crypto.randomUUID(), 112, 474, 740, 28, `THE PARANORMAL INITIATIVE  •  ${String(index).padStart(2, "0")}`, 13, accent)
    ],
    speakerNotes: notes
  };
}

export function createPresentationFromTemplate(id: string, title: string, template: SlideTemplateKey): Presentation {
  if (template === "blank") return createBlankPresentation(id, title);
  const palettes = {
    "field-report": { background: "#10211b", accent: "#72d6a3" },
    "evidence-brief": { background: "#101a2c", accent: "#f4c95d" },
    lecture: { background: "#1b1630", accent: "#d9a7ff" }
  } as const;
  const palette = palettes[template];
  const slides = template === "field-report" ? [
    templateSlide(title, "A practical framework for approaching unusual experiences with curiosity, care, and clear evidence.", "Open by setting expectations: this is an educational field guide, not a claim that every unusual report has one explanation. Invite the audience to hold wonder and rigor together.", palette.background, palette.accent, 1),
    templateSlide("Start with the experience", "Witness • context • timeline\nSeparate what happened from what it might mean.", "Ask the audience to listen for the original account before hearing an interpretation. The witness's language, context, and timeline are primary source material.", palette.background, palette.accent, 2),
    templateSlide("Patterns in the reports", "Light, presence, movement, memory, transformation\nRecurring themes are worth studying; they are not automatic proof.", "Use this slide to introduce recurring motifs without flattening individual stories. Explain that a pattern is a reason to investigate, not a substitute for evidence.", palette.background, palette.accent, 3),
    templateSlide("NDEs: many lenses", "Neurophysiology  •  Psychology  •  Culture  •  Spiritual meaning", "Present the lenses as complementary questions. Avoid implying that a single anecdote settles a neurological or metaphysical debate.", palette.background, palette.accent, 4),
    templateSlide("Build a trustworthy record", "Preserve wording • document conditions • test alternatives\nMake uncertainty visible.", "Describe a simple field workflow: record the account, preserve timestamps and conditions, document ordinary explanations, then compare independent sources.", palette.background, palette.accent, 5),
    templateSlide("Ethics are part of the method", "Consent • dignity • privacy • no promised certainty", "Remind presenters that people are not props. Obtain permission before recording or sharing, protect sensitive details, and never pressure a witness toward a preferred conclusion.", palette.background, palette.accent, 6),
    templateSlide("Leave room for wonder", "The strongest conclusion may be a better question.\nStay curious. Stay honest. Keep the record.", "Close by inviting questions and field notes. The goal is not to make every mystery disappear; it is to make our observations more reliable and our community more trustworthy.", palette.background, palette.accent, 7)
  ] : template === "evidence-brief" ? [
    templateSlide(title, "A concise evidence briefing for a curious, careful audience.", "Introduce the topic, audience, and desired outcome. Keep claims proportionate to the available evidence.", palette.background, palette.accent, 1),
    templateSlide("The question", "What is being claimed?\nWhat would count as evidence?", "State the question neutrally and define key terms before presenting examples.", palette.background, palette.accent, 2),
    templateSlide("What we can observe", "First-hand accounts • records • conditions • repeatability", "Distinguish direct observations from later interpretation. Note what is missing as well as what is present.", palette.background, palette.accent, 3),
    templateSlide("Competing explanations", "Ordinary causes first\nThen unresolved possibilities", "Treat alternative explanations as tools, not insults. Compare predictions and identify what would change your mind.", palette.background, palette.accent, 4),
    templateSlide("Confidence and limits", "Supported • plausible • unresolved • unsupported", "Use confidence language deliberately. Do not turn an engaging story into a stronger claim than the record supports.", palette.background, palette.accent, 5),
    templateSlide("Takeaways", "Keep the question open.\nKeep the evidence clear.\nKeep people safe.", "Summarize the three practical takeaways and invite the audience to continue the investigation responsibly.", palette.background, palette.accent, 6)
  ] : [
    templateSlide(title, "A presentation-ready lecture structure for the Nova Editorial Workspace.", "Set the frame for the lecture and tell the audience what they will leave understanding.", palette.background, palette.accent, 1),
    templateSlide("A story worth examining", "Begin with a vivid account, then slow down and examine the details.", "Choose a respectful example. Tell it briefly, then identify where the account is strong, incomplete, or open to interpretation.", palette.background, palette.accent, 2),
    templateSlide("The framework", "Define terms • establish context • compare explanations • state limits", "Walk through the method one step at a time. Pause for questions before moving to conclusions.", palette.background, palette.accent, 3),
    templateSlide("The evidence", "What is documented?\nWhat is inferred?\nWhat remains unknown?", "Keep source quality and uncertainty visible. Explain why different sources receive different weight.", palette.background, palette.accent, 4),
    templateSlide("Discussion", "Invite questions that sharpen the inquiry rather than close it.", "Use this pause for audience participation. Capture questions that could become future research notes or articles.", palette.background, palette.accent, 5),
    templateSlide("Closing perspective", "Wonder is strongest when it can survive careful questions.", "End with the central message and a clear invitation to continue learning, documenting, and revising conclusions.", palette.background, palette.accent, 6)
  ];
  return { id, title, width: 960, height: 540, slides };
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
