import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, Image, Plus, Save, Square, Trash2, Type } from "lucide-react";
import { NovaApiError, describeNovaError, novaApi } from "../lib/api";
import type { NovaCollection, NovaItem, NovaItemSummary } from "../lib/types";
import { AccessNotice } from "../documents/AccessNotice";
import { SlideCanvas } from "./SlideCanvas";
import { addSlide, createBlankPresentation, deleteSlide, duplicateSlide, envelope, parsePresentation, reorderSlide, type Presentation, type SlideElement, updateElement } from "./model";

interface Props {
  presentationId: string | null;
  onNavigatePresentation: (id: string | null) => void;
}

const EMPTY_PRESENTATION = (title: string) => envelope(createBlankPresentation(crypto.randomUUID(), title));

export default function SlidesSurface({ presentationId, onNavigatePresentation }: Props) {
  const [items, setItems] = useState<NovaItemSummary[]>([]);
  const [collections, setCollections] = useState<NovaCollection[]>([]);
  const [error, setError] = useState<{ status: number | null; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

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
      const response = await novaApi.createItem({ title, content: EMPTY_PRESENTATION(title), templateKey: "blank", sourceKind: "nova-editorial-workspace" });
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
        <div><span className="nova-eyebrow">Nova Editorial Workspace</span><h1>Slides</h1><p>Build presentations on the same structured Nova core as Documents.</p></div>
        <button type="button" className="nova-button nova-button-primary" data-testid="new-presentation" onClick={() => void createPresentation()}><Plus size={16} /> New presentation</button>
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
  const versionRef = useRef(0);
  const dirtyRef = useRef(false);
  const saveTimer = useRef<number | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await novaApi.getItem(itemId);
      const loaded = parsePresentation(response.item.content);
      setItem(response.item);
      setPresentation(loaded);
      setTitle(response.item.title);
      setCurrent(0);
      versionRef.current = response.item.version;
      dirtyRef.current = false;
      setDirty(false);
      setFailure("");
    } catch (loadFailure) {
      setFailure(describeNovaError(loadFailure));
    }
  }, [itemId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => () => { if (saveTimer.current !== null) window.clearTimeout(saveTimer.current); }, []);

  const save = useCallback(async () => {
    if (!item || !presentation || !dirtyRef.current || item.status !== "active") return;
    setStatus("Saving…");
    try {
      const response = await novaApi.updateItem(item.id, { expectedVersion: versionRef.current, title: title.trim() || "Untitled Presentation", content: envelope(presentation) });
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
  }, [item, onChanged, presentation, title]);

  const markDirty = () => {
    dirtyRef.current = true;
    setDirty(true);
    setStatus("Unsaved changes");
    if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => { void save(); }, 900);
  };

  const edit = (updater: (value: Presentation) => Presentation) => {
    setPresentation(value => value ? updater(value) : value);
    markDirty();
  };

  if (failure && !item) return <div className="nova-error-panel" role="alert"><h1>This presentation could not be opened</h1><p>{failure}</p><button type="button" className="nova-button" onClick={onBack}>Back to Slides</button></div>;
  if (!item || !presentation) return <div className="nova-booting" role="status">Opening presentation…</div>;

  const slide = presentation.slides[current] ?? presentation.slides[0];
  const readOnly = item.status !== "active";
  const selectedSlide = presentation.slides[current];
  const addElement = (element: SlideElement) => edit(value => ({ ...value, slides: value.slides.map((candidate, index) => index === current ? { ...candidate, elements: [...candidate.elements, element] } : candidate) }));

  return (
    <div className="nova-slides-editor" data-testid="slides-editor">
      <header className="nova-slides-editor-header">
        <button type="button" className="nova-icon-button" aria-label="Back to Slides" onClick={onBack}><ArrowLeft size={18} /></button>
        <input className="nova-slides-title" value={title} aria-label="Presentation title" disabled={readOnly} onChange={event => { setTitle(event.target.value); markDirty(); }} />
        <span className={`nova-save-state ${dirty ? "is-dirty" : ""}`}>{status}</span>
        <button type="button" className="nova-button" disabled={readOnly || !dirty} onClick={() => void save()}><Save size={15} /> Save</button>
      </header>
      {failure ? <div className="nova-banner nova-banner-error" role="alert">{failure}</div> : null}
      <div className="nova-slides-workspace">
        <aside className="nova-slide-thumbnails" aria-label="Slides">
          <button type="button" className="nova-button nova-button-primary" onClick={() => edit(addSlide)} disabled={readOnly}><Plus size={15} /> Slide</button>
          {presentation.slides.map((candidate, index) => <button type="button" key={candidate.id} className={`nova-slide-thumbnail${index === current ? " is-selected" : ""}`} onClick={() => setCurrent(index)}><span>{index + 1}</span><div style={{ background: candidate.background }}>{candidate.elements.find(element => element.kind === "text")?.text || "Blank slide"}</div></button>)}
          <div className="nova-slide-thumbnail-actions"><button type="button" aria-label="Duplicate slide" onClick={() => edit(value => duplicateSlide(value, current))} disabled={readOnly}><Copy size={15} /></button><button type="button" aria-label="Delete slide" onClick={() => { edit(value => deleteSlide(value, current)); setCurrent(value => Math.min(value, Math.max(0, presentation.slides.length - 2))); }} disabled={readOnly || presentation.slides.length <= 1}><Trash2 size={15} /></button></div>
        </aside>
        <main className="nova-slide-stage-area">
          <div className="nova-slide-toolbar" role="toolbar" aria-label="Slide tools">
            <button type="button" onClick={() => addElement({ id: crypto.randomUUID(), kind: "text", x: 120, y: 180, width: 420, height: 62, text: "New text", fontSize: 28, fill: "#1d281f" })} disabled={readOnly}><Type size={16} /> Text</button>
            <button type="button" onClick={() => addElement({ id: crypto.randomUUID(), kind: "rect", x: 180, y: 220, width: 240, height: 120, fill: "#4e8b61" })} disabled={readOnly}><Square size={16} /> Shape</button>
            <button type="button" onClick={() => addElement({ id: crypto.randomUUID(), kind: "image", x: 420, y: 190, width: 280, height: 180, placeholder: "Image placeholder" })} disabled={readOnly}><Image size={16} /> Image</button>
            <button type="button" onClick={() => edit(value => ({ ...value, slides: value.slides.map((candidate, index) => index === current ? { ...candidate, background: candidate.background === "#ffffff" ? "#f7f4ec" : "#ffffff" } : candidate) }))} disabled={readOnly}>Background</button>
            <span className="nova-slide-toolbar-spacer" />
            <button type="button" onClick={() => edit(value => reorderSlide(value, current, current - 1))} disabled={readOnly || current === 0}>↑</button><button type="button" onClick={() => edit(value => reorderSlide(value, current, current + 1))} disabled={readOnly || current === presentation.slides.length - 1}>↓</button>
          </div>
          <div className="nova-slide-canvas-wrap"><SlideCanvas presentation={presentation} slide={slide} scale={Math.min(0.82, 860 / presentation.width)} onUpdateElement={(elementId, patch) => edit(value => updateElement(value, current, elementId, patch))} /></div>
          <div className="nova-slide-notes"><label>Speaker notes<textarea value={selectedSlide.speakerNotes || ""} disabled={readOnly} onChange={event => edit(value => ({ ...value, slides: value.slides.map((candidate, index) => index === current ? { ...candidate, speakerNotes: event.target.value } : candidate) }))} placeholder="Notes for the presenter…" /></label></div>
        </main>
      </div>
    </div>
  );
}
