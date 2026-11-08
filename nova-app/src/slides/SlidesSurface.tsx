import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, Image as ImageIcon, Maximize, Plus, Save, Square, Trash2, Type, Upload, X } from "lucide-react";
import { NovaApiError, describeNovaError, novaApi } from "../lib/api";
import type { NovaCollection, NovaItem, NovaItemSummary } from "../lib/types";
import { AccessNotice } from "../documents/AccessNotice";
import { SlideCanvas } from "./SlideCanvas";
import { addSlide, createPresentationFromTemplate, deleteSlide, duplicateSlide, envelope, parsePresentation, reorderSlide, type Presentation, type SlideElement, type SlideTemplateKey, updateElement } from "./model";

interface Props {
  presentationId: string | null;
  onNavigatePresentation: (id: string | null) => void;
}

const TEMPLATE_OPTIONS: Array<{ key: SlideTemplateKey; label: string; description: string }> = [
  { key: "field-report", label: "Field Report", description: "Dark green, evidence-aware paranormal briefing" },
  { key: "evidence-brief", label: "Evidence Brief", description: "Navy and gold research presentation" },
  { key: "lecture", label: "Lecture", description: "Purple lecture and community presentation" },
  { key: "blank", label: "Blank Canvas", description: "Start with a clean editable slide" }
];

function normalizePresentationLayout(presentation: Presentation): Presentation {
  const cover = presentation.slides[0];
  const legacyImage = cover?.elements.find(element => element.kind === "image" && element.x === 420 && element.y === 160 && element.width === 320 && element.height === 210);
  const coverTitle = cover?.elements.find((element): element is Extract<SlideElement, { kind: "text" }> => element.kind === "text" && element.text === presentation.title);
  const titleNeedsFit = Boolean(coverTitle && presentation.title.length > 36 && (coverTitle.fontSize > 34 || coverTitle.height < 100 || !coverTitle.text.includes("\n")));
  if (!legacyImage && !titleNeedsFit) return presentation;
  return {
    ...presentation,
    slides: presentation.slides.map((slide, index) => index === 0
      ? { ...slide, elements: slide.elements.map(element => {
        if (legacyImage && element.id === legacyImage.id) return { ...element, x: 620, y: 320, width: 240, height: 150 };
        if (coverTitle && element.id === coverTitle.id && titleNeedsFit) return { ...element, text: presentation.title.replace(": ", ":\n"), fontSize: 34, height: 112 };
        return element;
      }) }
      : slide)
  };
}

function imageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The selected image could not be read."));
    reader.onload = () => {
      const source = new window.Image();
      source.onerror = () => reject(new Error("The selected image could not be decoded."));
      source.onload = () => {
        const scale = Math.min(1, 1400 / source.naturalWidth, 900 / source.naturalHeight);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("The browser could not prepare the selected image."));
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      source.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function SlidesSurface({ presentationId, onNavigatePresentation }: Props) {
  const [items, setItems] = useState<NovaItemSummary[]>([]);
  const [collections, setCollections] = useState<NovaCollection[]>([]);
  const [error, setError] = useState<{ status: number | null; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [templateKey, setTemplateKey] = useState<SlideTemplateKey>("field-report");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [itemResponse, collectionResponse] = await Promise.all([
        novaApi.listItems({ type: "nova-presentation" }),
        novaApi.listCollections()
      ]);
      setItems(itemResponse.items);
      setCollections(collectionResponse.collections);
      setError(null);
    } catch (failure) {
      setError({ status: failure instanceof NovaApiError ? failure.status : null, message: describeNovaError(failure) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load, refresh]);

  const createPresentation = async () => {
    try {
      const title = "Untitled Presentation";
      const response = await novaApi.createItem({ title, content: envelope(createPresentationFromTemplate(crypto.randomUUID(), title, templateKey)), templateKey, sourceKind: "nova-editorial-workspace" });
      onNavigatePresentation(response.item.id);
    } catch (failure) {
      setError({ status: failure instanceof NovaApiError ? failure.status : null, message: describeNovaError(failure) });
    }
  };

  if (error && (error.status === 401 || error.status === 403)) return <AccessNotice status={error.status} message={error.message} onRetry={() => void load()} />;
  if (presentationId) return <PresentationEditor itemId={presentationId} collections={collections} onBack={() => { setRefresh(value => value + 1); onNavigatePresentation(null); }} onChanged={() => setRefresh(value => value + 1)} />;

  return (
    <div className="nova-slide-surface">
      <div className="nova-slide-list-header">
        <div><span className="nova-eyebrow">Nova Editorial Workspace</span><h1>Slides</h1><p>Build polished presentations with templates, editable content, imagery, notes, and presenter mode.</p></div>
        <div className="nova-slide-create-actions">
          <label className="nova-template-picker"><span>Template</span><select aria-label="Presentation template" value={templateKey} onChange={event => setTemplateKey(event.target.value as SlideTemplateKey)}>{TEMPLATE_OPTIONS.map(option => <option key={option.key} value={option.key}>{option.label}</option>)}</select></label>
          <button type="button" className="nova-button nova-button-primary" data-testid="new-presentation" onClick={() => void createPresentation()}><Plus size={16} /> New presentation</button>
        </div>
      </div>
      {error ? <div className="nova-banner nova-banner-error" role="alert">{error.message}</div> : null}
      {loading ? <div className="nova-booting" role="status">Loading presentations…</div> : items.length === 0 ? (
        <div className="nova-empty-state"><strong>No presentations yet.</strong><span>Create a deck for a webinar, investigation, class or production.</span><button type="button" className="nova-button" onClick={() => void createPresentation()}>Create your first presentation</button></div>
      ) : (
        <div className="nova-slide-card-grid">{items.map(item => <button type="button" className="nova-slide-card" key={item.id} onClick={() => onNavigatePresentation(item.id)}><span className="nova-slide-card-preview"><span>{item.title.slice(0, 42)}</span></span><strong>{item.title}</strong><small>{new Date(item.updatedAt).toLocaleString()}</small></button>)}</div>
      )}
    </div>
  );
}

function PresentationEditor({ itemId, collections: _collections, onBack, onChanged }: { itemId: string; collections: NovaCollection[]; onBack: () => void; onChanged: () => void }) {
  const [item, setItem] = useState<NovaItem | null>(null);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [current, setCurrent] = useState(0);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Saved");
  const [failure, setFailure] = useState("");
  const [dirty, setDirty] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [presenting, setPresenting] = useState(false);
  const versionRef = useRef(0);
  const dirtyRef = useRef(false);
  const saveTimer = useRef<number | null>(null);
  const imageFileInput = useRef<HTMLInputElement | null>(null);
  const titleRef = useRef("");
  const presentationRef = useRef<Presentation | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await novaApi.getItem(itemId);
      const raw = parsePresentation(response.item.content);
      const loaded = normalizePresentationLayout(raw);
      let persistedItem = response.item;
      if (loaded !== raw && response.item.status === "active") {
        const migrated = await novaApi.updateItem(response.item.id, {
          expectedVersion: response.item.version,
          title: response.item.title,
          content: envelope(loaded)
        });
        persistedItem = migrated.item;
      }
      setItem(persistedItem);
      setPresentation(loaded);
      setTitle(persistedItem.title);
      titleRef.current = persistedItem.title;
      presentationRef.current = loaded;
      setCurrent(0);
      setSelectedElementId(null);
      versionRef.current = persistedItem.version;
      dirtyRef.current = false;
      setDirty(false);
      setStatus("Saved");
      setFailure("");
    } catch (loadFailure) {
      setFailure(describeNovaError(loadFailure));
    }
  }, [itemId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => () => { if (saveTimer.current !== null) window.clearTimeout(saveTimer.current); }, []);

  const save = useCallback(async () => {
    const latestPresentation = presentationRef.current;
    if (!item || !latestPresentation || !dirtyRef.current || item.status !== "active") return;
    setStatus("Saving…");
    try {
      const response = await novaApi.updateItem(item.id, { expectedVersion: versionRef.current, title: titleRef.current.trim() || "Untitled Presentation", content: envelope(latestPresentation) });
      setItem(response.item);
      versionRef.current = response.item.version;
      dirtyRef.current = false;
      setDirty(false);
      setStatus("Saved");
      setFailure("");
      onChanged();
    } catch (saveFailure) {
      setStatus("Needs attention");
      setFailure(describeNovaError(saveFailure));
    }
  }, [item, onChanged]);

  const markDirty = () => {
    dirtyRef.current = true;
    setDirty(true);
    setStatus("Unsaved changes");
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => { void save(); }, 900);
  };

  const edit = (updater: (value: Presentation) => Presentation) => {
    setPresentation(value => {
      if (!value) return value;
      const next = updater(value);
      presentationRef.current = next;
      return next;
    });
    markDirty();
  };

  const handleTitleChange = (nextTitle: string) => {
    const previousTitle = titleRef.current;
    titleRef.current = nextTitle;
    setTitle(nextTitle);
    const coverTitle = presentationRef.current?.slides[0]?.elements.find(element => element.kind === "text" && (element.text === "Untitled Presentation" || element.text === previousTitle || element.text === previousTitle.replace(": ", ":\n")));
    if (coverTitle) {
      edit(value => updateElement(value, 0, coverTitle.id, { text: nextTitle }));
    } else {
      markDirty();
    }
  };

  if (failure && !item) return <div className="nova-error-panel" role="alert"><h1>This presentation could not be opened</h1><p>{failure}</p><button type="button" className="nova-button" onClick={onBack}>Back to Slides</button></div>;
  if (!item || !presentation) return <div className="nova-booting" role="status">Opening presentation…</div>;

  const slide = presentation.slides[current] ?? presentation.slides[0];
  const readOnly = item.status !== "active";
  const selectedSlide = presentation.slides[current];
  const selectedElement = selectedSlide.elements.find(element => element.id === selectedElementId) || null;
  const addElement = (element: SlideElement) => edit(value => ({ ...value, slides: value.slides.map((candidate, index) => index === current ? { ...candidate, elements: [...candidate.elements, element] } : candidate) }));
  const addElementAndSelect = (element: SlideElement) => { setSelectedElementId(element.id); addElement(element); };
  const updateCurrentElement = (patch: Partial<SlideElement>) => { if (selectedElementId) edit(value => updateElement(value, current, selectedElementId, patch)); };
  const removeSelectedElement = () => {
    if (!selectedElementId) return;
    edit(value => ({ ...value, slides: value.slides.map((candidate, index) => index === current ? { ...candidate, elements: candidate.elements.filter(element => element.id !== selectedElementId) } : candidate) }));
    setSelectedElementId(null);
  };
  const insertImage = (src: string, alt = "Slide image") => {
    if (!src.trim()) return;
    addElementAndSelect({ id: crypto.randomUUID(), kind: "image", x: 620, y: 320, width: 240, height: 150, placeholder: alt, src: src.trim(), alt });
    setImageUrl("");
  };
  const handleImageFile = async (file: File | undefined) => {
    if (!file) return;
    try { insertImage(await imageFileToDataUrl(file), file.name.replace(/\.[^.]+$/, "")); setFailure(""); }
    catch (imageFailure) { setFailure(imageFailure instanceof Error ? imageFailure.message : "The image could not be inserted."); }
  };

  if (presenting) return <PresenterMode presentation={presentation} current={current} title={title} onChangeSlide={setCurrent} onExit={() => setPresenting(false)} />;

  return (
    <div className="nova-slides-editor" data-testid="slides-editor">
      <header className="nova-slides-editor-header">
        <button type="button" className="nova-icon-button" aria-label="Back to Slides" onClick={onBack}><ArrowLeft size={18} /></button>
        <input className="nova-slides-title" value={title} aria-label="Presentation title" disabled={readOnly} onChange={event => handleTitleChange(event.target.value)} />
        <span className={`nova-save-state ${dirty ? "is-dirty" : ""}`}>{status}</span>
        <button type="button" className="nova-button nova-button-present" disabled={!presentation.slides.length} onClick={() => setPresenting(true)}><Maximize size={15} /> Present</button>
        <button type="button" className="nova-button" disabled={readOnly || !dirty} onClick={() => void save()}><Save size={15} /> Save</button>
      </header>
      {failure ? <div className="nova-banner nova-banner-error" role="alert">{failure}</div> : null}
      <div className="nova-slides-workspace">
        <aside className="nova-slide-thumbnails" aria-label="Slides">
          <button type="button" className="nova-button nova-button-primary" onClick={() => edit(addSlide)} disabled={readOnly}><Plus size={15} /> Slide</button>
          {presentation.slides.map((candidate, index) => <button type="button" key={candidate.id} className={`nova-slide-thumbnail${index === current ? " is-selected" : ""}`} onClick={() => { setCurrent(index); setSelectedElementId(null); }}><span>{index + 1}</span><div style={{ background: candidate.background }}>{candidate.elements.find(element => element.kind === "text")?.text || "Blank slide"}</div></button>)}
          <div className="nova-slide-thumbnail-actions"><button type="button" aria-label="Duplicate slide" onClick={() => edit(value => duplicateSlide(value, current))} disabled={readOnly}><Copy size={15} /></button><button type="button" aria-label="Delete slide" onClick={() => { edit(value => deleteSlide(value, current)); setCurrent(value => Math.min(value, Math.max(0, presentation.slides.length - 2))); }} disabled={readOnly || presentation.slides.length <= 1}><Trash2 size={15} /></button></div>
        </aside>
        <main className="nova-slide-stage-area">
          <div className="nova-slide-toolbar" role="toolbar" aria-label="Slide tools">
            <button type="button" onClick={() => addElementAndSelect({ id: crypto.randomUUID(), kind: "text", x: 120, y: 180, width: 420, height: 62, text: "Edit this text", fontSize: 28, fill: "#1d281f" })} disabled={readOnly}><Type size={16} /> Text</button>
            <button type="button" onClick={() => addElementAndSelect({ id: crypto.randomUUID(), kind: "rect", x: 180, y: 220, width: 240, height: 120, fill: "#4e8b61" })} disabled={readOnly}><Square size={16} /> Shape</button>
            <button type="button" onClick={() => imageFileInput.current?.click()} disabled={readOnly}><Upload size={16} /> Upload image</button>
            <input ref={imageFileInput} type="file" accept="image/*" hidden onChange={event => { void handleImageFile(event.target.files?.[0]); event.target.value = ""; }} />
            <label className="nova-slide-image-url"><span>Image URL</span><input aria-label="Image URL" value={imageUrl} onChange={event => setImageUrl(event.target.value)} placeholder="https://…" /></label>
            <button type="button" onClick={() => insertImage(imageUrl)} disabled={readOnly || !imageUrl.trim()}><ImageIcon size={16} /> Add URL</button>
            <button type="button" onClick={() => edit(value => ({ ...value, slides: value.slides.map((candidate, index) => index === current ? { ...candidate, background: candidate.background === "#ffffff" ? "#f7f4ec" : "#ffffff" } : candidate) }))} disabled={readOnly}>Background</button>
            <span className="nova-slide-toolbar-spacer" />
            <button type="button" onClick={() => edit(value => reorderSlide(value, current, current - 1))} disabled={readOnly || current === 0}>↑</button><button type="button" onClick={() => edit(value => reorderSlide(value, current, current + 1))} disabled={readOnly || current === presentation.slides.length - 1}>↓</button>
          </div>
          <div className="nova-slide-canvas-wrap"><SlideCanvas presentation={presentation} slide={slide} scale={Math.min(0.82, 860 / presentation.width)} onSelectElement={setSelectedElementId} onUpdateElement={(elementId, patch) => edit(value => updateElement(value, current, elementId, patch))} /></div>
          <SlideInspector element={selectedElement} readOnly={readOnly} onUpdate={updateCurrentElement} onDelete={removeSelectedElement} />
          <div className="nova-slide-notes"><label>Speaker notes<textarea value={selectedSlide.speakerNotes || ""} disabled={readOnly} onChange={event => edit(value => ({ ...value, slides: value.slides.map((candidate, index) => index === current ? { ...candidate, speakerNotes: event.target.value } : candidate) }))} placeholder="Notes for the presenter…" /></label></div>
        </main>
      </div>
    </div>
  );
}

function SlideInspector({ element, readOnly, onUpdate, onDelete }: { element: SlideElement | null; readOnly: boolean; onUpdate: (patch: Partial<SlideElement>) => void; onDelete: () => void }) {
  if (!element) return <div className="nova-slide-inspector nova-slide-inspector-empty">Select a slide element to edit its text, color, size, or position.</div>;
  return <section className="nova-slide-inspector" aria-label="Selected slide element">
    <div className="nova-slide-inspector-header"><strong>Edit element</strong><button type="button" aria-label="Delete selected element" onClick={onDelete} disabled={readOnly}><Trash2 size={15} /></button></div>
    {element.kind === "text" ? <><label>Text<textarea value={element.text} disabled={readOnly} onChange={event => onUpdate({ text: event.target.value })} /></label><div className="nova-slide-inspector-grid"><label>Font size<input type="number" min="10" max="120" value={element.fontSize} disabled={readOnly} onChange={event => onUpdate({ fontSize: Number(event.target.value) || 10 })} /></label><label>Color<input type="color" value={element.fill} disabled={readOnly} onChange={event => onUpdate({ fill: event.target.value })} /></label></div></> : element.kind === "rect" ? <label>Fill<input type="color" value={element.fill} disabled={readOnly} onChange={event => onUpdate({ fill: event.target.value })} /></label> : <label>Alt text<input value={element.alt || element.placeholder} disabled={readOnly} onChange={event => onUpdate({ alt: event.target.value, placeholder: event.target.value })} /></label>}
  </section>;
}

function PresenterMode({ presentation, current, title, onChangeSlide, onExit }: { presentation: Presentation; current: number; title: string; onChangeSlide: (index: number) => void; onExit: () => void }) {
  const presenterRef = useRef<HTMLDivElement | null>(null);
  const slide = presentation.slides[current] || presentation.slides[0];
  const next = presentation.slides[current + 1];
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") { event.preventDefault(); onChangeSlide(Math.min(presentation.slides.length - 1, current + 1)); }
      if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); onChangeSlide(Math.max(0, current - 1)); }
      if (event.key === "Escape") onExit();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current, onChangeSlide, onExit, presentation.slides.length]);
  return <div ref={presenterRef} className="nova-presenter" role="dialog" aria-modal="true" aria-label="Presenter mode">
    <header className="nova-presenter-header"><div><span className="nova-eyebrow">Presenter mode</span><strong>{title}</strong></div><div className="nova-presenter-actions"><span>Slide {current + 1} of {presentation.slides.length}</span><button type="button" className="nova-button" onClick={() => presenterRef.current?.requestFullscreen?.()}><Maximize size={15} /> Full screen</button><button type="button" className="nova-button" onClick={onExit}><X size={15} /> Exit</button></div></header>
    <div className="nova-presenter-body"><main className="nova-presenter-stage"><SlideCanvas presentation={presentation} slide={slide} scale={Math.min(1.08, 1120 / presentation.width)} interactive={false} onUpdateElement={() => {}} /><div className="nova-presenter-nav"><button type="button" onClick={() => onChangeSlide(Math.max(0, current - 1))} disabled={current === 0}><ChevronLeft size={18} /> Previous</button><button type="button" onClick={() => onChangeSlide(Math.min(presentation.slides.length - 1, current + 1))} disabled={current === presentation.slides.length - 1}>Next <ChevronRight size={18} /></button></div></main><aside className="nova-presenter-notes"><span className="nova-eyebrow">Speaker notes</span><h2>Presenter view</h2><p>{slide?.speakerNotes || "No speaker notes for this slide."}</p>{next ? <div className="nova-presenter-next"><span className="nova-eyebrow">Up next</span><strong>{next.elements.find(element => element.kind === "text")?.text || `Slide ${current + 2}`}</strong></div> : <div className="nova-presenter-next">Final slide</div>}</aside></div>
  </div>;
}
