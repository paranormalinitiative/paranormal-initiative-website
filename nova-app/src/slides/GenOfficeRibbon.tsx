import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Eraser, Image as ImageIcon, Maximize, MessageSquare, Palette, PenLine, Plus, Redo2, Save, Square, Type, Undo2, Upload, WandSparkles, X } from "lucide-react";
import type { ElementAnimation, SlideElement, SlideTransition } from "./model";

/**
 * The ribbon structure follows GenOffice's Slides renderer:
 * apps/slides/src/renderer/components/Ribbon.tsx and ribbon-shared.tsx.
 * Nova keeps its own web-safe commands and presentation model, but uses the
 * same tab-strip/grouped-command interaction so the Content Editor feels like
 * the GenOffice authoring surface without importing Electron-only code.
 */

type RibbonTab = "home" | "insert" | "draw" | "design" | "transitions" | "animations" | "slideShow" | "review" | "view";
export type SlideThemeKey = "field-report" | "evidence-brief" | "lecture" | "blank";
export type SlideViewMode = "normal" | "sorter" | "reading";

interface Props {
  readOnly: boolean;
  hasSlides: boolean;
  dirty: boolean;
  canDeleteSlide: boolean;
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
  onAddSlide: () => void;
  onDuplicateSlide: () => void;
  onDeleteSlide: () => void;
  onAddText: () => void;
  onAddShape: () => void;
  onUploadImage: () => void;
  onAddImageUrl: () => void;
  onToggleBackground: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onPresent: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onAddLine: (stroke: string, strokeWidth: number) => void;
  onDeleteSelected: () => void;
  selectedElement: SlideElement | null;
  onSetTheme: (theme: SlideThemeKey) => void;
  onSetTransition: (transition: SlideTransition) => void;
  currentTransition: SlideTransition;
  onSetAnimation: (animation: ElementAnimation) => void;
  onViewModeChange: (mode: SlideViewMode) => void;
  viewMode: SlideViewMode;
  reviewNote: string;
  onReviewNoteChange: (value: string) => void;
}

const TABS: Array<{ id: RibbonTab; label: string }> = [
  { id: "home", label: "Home" },
  { id: "insert", label: "Insert" },
  { id: "draw", label: "Draw" },
  { id: "design", label: "Design" },
  { id: "transitions", label: "Transitions" },
  { id: "animations", label: "Animations" },
  { id: "slideShow", label: "Slide Show" },
  { id: "review", label: "Review" },
  { id: "view", label: "View" }
];

function Group({ label, children }: { label: string; children: ReactNode }) {
  return <section className="nova-ribbon-group"><div className="nova-ribbon-group-items">{children}</div><span className="nova-ribbon-group-label">{label}</span></section>;
}

function Command({ label, icon, disabled, onClick, title }: { label: string; icon: ReactNode; disabled?: boolean; onClick?: () => void; title?: string }) {
  return <button type="button" className="nova-ribbon-command" disabled={disabled} onClick={onClick} title={title || label}><span className="nova-ribbon-command-icon">{icon}</span><span>{label}</span></button>;
}

function Separator() {
  return <span className="nova-ribbon-separator" aria-hidden="true" />;
}

export function GenOfficeRibbon(props: Props) {
  const [activeTab, setActiveTab] = useState<RibbonTab>(() => {
    try {
      const saved = window.localStorage.getItem("nova-slides-ribbon-tab") as RibbonTab | null;
      return saved && TABS.some(tab => tab.id === saved) ? saved : "home";
    } catch {
      return "home";
    }
  });
  const {
    readOnly, hasSlides, dirty, canDeleteSlide, imageUrl, onImageUrlChange,
    onAddSlide, onDuplicateSlide, onDeleteSlide, onAddText, onAddShape,
    onUploadImage, onAddImageUrl, onToggleBackground, onMoveUp, onMoveDown,
    onPresent, onSave, onUndo, onRedo, canUndo, canRedo, onAddLine, onDeleteSelected,
    selectedElement, onSetTheme, onSetTransition, currentTransition, onSetAnimation, onViewModeChange,
    viewMode, reviewNote, onReviewNoteChange
  } = props;

  const selectTab = (tab: RibbonTab) => {
    setActiveTab(tab);
    try { window.localStorage.setItem("nova-slides-ribbon-tab", tab); } catch { /* best effort */ }
  };

  return (
    <section className="nova-genoffice-ribbon" aria-label="Presentation ribbon">
      <nav className="nova-ribbon-tabs" aria-label="Presentation tools">
        {TABS.map(tab => <button key={tab.id} type="button" className={`nova-ribbon-tab${activeTab === tab.id ? " is-active" : ""}`} onClick={() => selectTab(tab.id)} aria-selected={activeTab === tab.id}>{tab.label}</button>)}
      </nav>
      <div className="nova-ribbon-body">
        {activeTab === "home" ? <>
          <Group label="History">
            <Command label="Undo" icon={<Undo2 size={20} />} disabled={readOnly || !canUndo} onClick={onUndo} />
            <Command label="Redo" icon={<Redo2 size={20} />} disabled={readOnly || !canRedo} onClick={onRedo} />
          </Group>
          <Separator />
          <Group label="Slides">
            <Command label="New Slide" icon={<Plus size={20} />} disabled={readOnly} onClick={onAddSlide} />
            <Command label="Duplicate" icon={<span className="nova-ribbon-stack-icon">▣</span>} disabled={readOnly || !hasSlides} onClick={onDuplicateSlide} />
            <Command label="Delete" icon={<X size={20} />} disabled={readOnly || !canDeleteSlide} onClick={onDeleteSlide} />
          </Group>
          <Separator />
          <Group label="Editing">
            <Command label="Text" icon={<Type size={20} />} disabled={readOnly} onClick={onAddText} />
            <Command label="Shape" icon={<Square size={20} />} disabled={readOnly} onClick={onAddShape} />
            <Command label="Image" icon={<ImageIcon size={20} />} disabled={readOnly} onClick={onUploadImage} />
          </Group>
          <Separator />
          <Group label="Arrange">
            <Command label="Move up" icon={<ArrowUp size={20} />} disabled={readOnly} onClick={onMoveUp} />
            <Command label="Move down" icon={<ArrowDown size={20} />} disabled={readOnly} onClick={onMoveDown} />
          </Group>
          <Separator />
          <Group label="Presentation">
            <Command label="Present" icon={<Maximize size={20} />} disabled={!hasSlides} onClick={onPresent} />
            <Command label="Save" icon={<Save size={20} />} disabled={readOnly || !dirty} onClick={onSave} />
          </Group>
        </> : activeTab === "insert" ? <>
          <Group label="Slides"><Command label="New Slide" icon={<Plus size={20} />} disabled={readOnly} onClick={onAddSlide} /></Group>
          <Separator />
          <Group label="Text and shapes"><Command label="Text" icon={<Type size={20} />} disabled={readOnly} onClick={onAddText} /><Command label="Shape" icon={<Square size={20} />} disabled={readOnly} onClick={onAddShape} /></Group>
          <Separator />
          <Group label="Images"><Command label="Upload image" icon={<Upload size={20} />} disabled={readOnly} onClick={onUploadImage} /><label className="nova-ribbon-url-field"><span>Image URL</span><input aria-label="Image URL" value={imageUrl} onChange={event => onImageUrlChange(event.target.value)} placeholder="https://…" /><button type="button" onClick={onAddImageUrl} disabled={readOnly || !imageUrl.trim()}>Add</button></label></Group>
        </> : activeTab === "draw" ? <>
          <Group label="Drawing tools">
            <Command label="Pen" icon={<PenLine size={20} />} disabled={readOnly} onClick={() => onAddLine("#72d6a3", 4)} />
            <Command label="Highlighter" icon={<PenLine size={20} />} disabled={readOnly} onClick={() => onAddLine("#f4c95d", 12)} />
            <Command label="Eraser" icon={<Eraser size={20} />} disabled={readOnly || !selectedElement} onClick={onDeleteSelected} />
          </Group>
          <Separator /><div className="nova-ribbon-placeholder"><strong>Draw</strong><span>Drawings are saved as editable slide marks and can be selected, moved, resized, and removed.</span></div>
        </> : activeTab === "design" ? <>
          <Group label="Themes">
            {([["field-report", "Field Report"], ["evidence-brief", "Evidence Brief"], ["lecture", "Lecture"], ["blank", "Blank"]] as Array<[SlideThemeKey, string]>).map(([key, label]) => <Command key={key} label={label} icon={<Palette size={20} />} disabled={readOnly} onClick={() => onSetTheme(key)} />)}
          </Group>
          <Separator /><Group label="Canvas"><Command label="Background" icon={<WandSparkles size={20} />} disabled={readOnly} onClick={onToggleBackground} /></Group>
        </> : activeTab === "transitions" ? <>
          <Group label="Slide transition"><select className="nova-ribbon-select" aria-label="Slide transition" value={currentTransition} disabled={readOnly} onChange={event => onSetTransition(event.target.value as SlideTransition)}><option value="none">None</option><option value="fade">Fade</option><option value="push">Push</option><option value="wipe">Wipe</option></select></Group>
          <Separator /><div className="nova-ribbon-placeholder"><strong>Transitions</strong><span>The selected slide transition is saved and used by Presenter Mode.</span></div>
        </> : activeTab === "animations" ? <>
          <Group label="Selected element"><select className="nova-ribbon-select" aria-label="Element animation" value={elementAnimationValue(selectedElement)} disabled={readOnly || !selectedElement} onChange={event => onSetAnimation(event.target.value as ElementAnimation)}><option value="none">None</option><option value="fade">Fade in</option></select></Group>
          <Separator /><div className="nova-ribbon-placeholder"><strong>Animations</strong><span>Choose an animation for the selected text, shape, line, or image. It plays when the slide enters Presenter Mode.</span></div>
        </> : activeTab === "slideShow" ? <>
          <Group label="Start show"><Command label="Present" icon={<Maximize size={20} />} disabled={!hasSlides} onClick={onPresent} /><Command label="From current" icon={<Maximize size={20} />} disabled={!hasSlides} onClick={onPresent} /></Group>
          <Separator /><div className="nova-ribbon-placeholder"><strong>Presenter mode</strong><span>Speaker notes, next-slide preview, keyboard navigation, and full screen are available in Present.</span></div>
        </> : activeTab === "review" ? <>
          <Group label="Review"><Command label="Save review note" icon={<MessageSquare size={20} />} disabled={readOnly} onClick={() => onReviewNoteChange(reviewNote.trim())} /></Group>
          <Separator /><label className="nova-ribbon-review-field"><span>Review note</span><textarea aria-label="Review note" value={reviewNote} disabled={readOnly} onChange={event => onReviewNoteChange(event.target.value)} placeholder="Add an editorial review note…" /></label>
        </> : activeTab === "view" ? <>
          <Group label="Presentation views"><Command label="Normal" icon={<span className="nova-ribbon-thumbnails-icon">▣</span>} onClick={() => onViewModeChange("normal")} /><Command label="Slide sorter" icon={<span className="nova-ribbon-thumbnails-icon">▦</span>} onClick={() => onViewModeChange("sorter")} /><Command label="Reading view" icon={<Maximize size={20} />} onClick={() => onViewModeChange("reading")} /></Group>
          <Separator /><div className="nova-ribbon-placeholder"><strong>View: {viewMode}</strong><span>Change between editing, slide sorter, and reading/presenter views.</span></div>
        </> : null}
      </div>
    </section>
  );
}

function elementAnimationValue(element: SlideElement | null): ElementAnimation {
  return element?.animation || "none";
}
