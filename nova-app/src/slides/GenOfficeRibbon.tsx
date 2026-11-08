import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Image as ImageIcon, Maximize, Plus, Save, Square, Type, Upload, WandSparkles, X } from "lucide-react";

/**
 * The ribbon structure follows GenOffice's Slides renderer:
 * apps/slides/src/renderer/components/Ribbon.tsx and ribbon-shared.tsx.
 * Nova keeps its own web-safe commands and presentation model, but uses the
 * same tab-strip/grouped-command interaction so the Content Editor feels like
 * the GenOffice authoring surface without importing Electron-only code.
 */

type RibbonTab = "home" | "insert" | "draw" | "design" | "transitions" | "animations" | "slideShow" | "review" | "view";

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
  const [activeTab, setActiveTab] = useState<RibbonTab>("home");
  const {
    readOnly, hasSlides, dirty, canDeleteSlide, imageUrl, onImageUrlChange,
    onAddSlide, onDuplicateSlide, onDeleteSlide, onAddText, onAddShape,
    onUploadImage, onAddImageUrl, onToggleBackground, onMoveUp, onMoveDown,
    onPresent, onSave
  } = props;

  return (
    <section className="nova-genoffice-ribbon" aria-label="Presentation ribbon">
      <nav className="nova-ribbon-tabs" aria-label="Presentation tools">
        {TABS.map(tab => <button key={tab.id} type="button" className={`nova-ribbon-tab${activeTab === tab.id ? " is-active" : ""}`} onClick={() => setActiveTab(tab.id)} aria-selected={activeTab === tab.id}>{tab.label}</button>)}
      </nav>
      <div className="nova-ribbon-body">
        {activeTab === "home" ? <>
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
        </> : activeTab === "design" ? <>
          <Group label="Canvas"><Command label="Background" icon={<WandSparkles size={20} />} disabled={readOnly} onClick={onToggleBackground} /></Group>
          <Separator /><div className="nova-ribbon-placeholder"><strong>Design</strong><span>Use the current presentation theme and background controls.</span></div>
        </> : activeTab === "slideShow" ? <>
          <Group label="Start show"><Command label="Present" icon={<Maximize size={20} />} disabled={!hasSlides} onClick={onPresent} /></Group>
          <Separator /><div className="nova-ribbon-placeholder"><strong>Presenter mode</strong><span>Speaker notes and slide navigation are available in Present.</span></div>
        </> : activeTab === "view" ? <>
          <Group label="Show"><Command label="Slide thumbnails" icon={<span className="nova-ribbon-thumbnails-icon">▦</span>} title="Slide thumbnails are shown in the left rail" /></Group>
          <Separator /><div className="nova-ribbon-placeholder"><strong>View</strong><span>Slide thumbnails remain visible beside the editing canvas.</span></div>
        </> : <div className="nova-ribbon-placeholder"><strong>{TABS.find(tab => tab.id === activeTab)?.label}</strong><span>GenOffice-style ribbon tab ready for the next editing command.</span></div>}
      </div>
    </section>
  );
}
