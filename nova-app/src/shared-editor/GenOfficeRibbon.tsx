import { useState, type ReactNode } from "react";
import type { Editor } from "@tiptap/core";
import type { Transaction } from "@tiptap/pm/state";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  BookOpen,
  Clipboard,
  Copy,
  Eraser,
  Highlighter,
  IndentDecrease,
  IndentIncrease,
  Italic,
  LayoutDashboard,
  Link,
  List,
  ListOrdered,
  MessageSquare,
  Minus,
  Plus,
  Quote,
  Redo2,
  Scissors,
  Strikethrough,
  Table,
  Type,
  Underline,
  Undo2,
  ZoomIn,
  ZoomOut,
  type LucideIcon
} from "lucide-react";
import { InsertTools } from "./InsertTools";

type RibbonTab = "Home" | "Insert" | "Draw" | "Design" | "Layout" | "References" | "Mailings" | "Review" | "View";

interface Props {
  editor: Editor;
  disabled: boolean;
  onRequestLink: () => void;
  documentTitle?: string;
}
interface RibbonButtonProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  compact?: boolean;
  testId?: string;
}

const TABS: RibbonTab[] = ["Home", "Insert", "Draw", "Design", "Layout", "References", "Mailings", "Review", "View"];

function RibbonButton({ label, icon: Icon, onClick, active, disabled, compact, testId }: RibbonButtonProps) {
  return (
    <button
      type="button"
      className={`nova-ribbon-button${active ? " is-active" : ""}${compact ? " is-compact" : ""}`}
      aria-label={label}
      aria-pressed={active ? true : undefined}
      data-testid={testId}
      title={label}
      disabled={disabled}
      onMouseDown={event => event.preventDefault()}
      onClick={onClick}
    >
      <Icon size={compact ? 15 : 20} strokeWidth={1.8} aria-hidden="true" focusable="false" />
      {!compact ? <span>{label}</span> : null}
    </button>
  );
}
function RibbonGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="nova-ribbon-group" role="group" aria-label={label}>
      <div className="nova-ribbon-group-tools">{children}</div>
      <span className="nova-ribbon-group-label">{label}</span>
    </div>
  );
}

function Divider() {
  return <span className="nova-ribbon-divider" aria-hidden="true" />;
}

const MAX_INDENT = 288;

function runClipboard(editor: Editor, command: "copy" | "cut" | "paste") {
  if (command === "paste" && navigator.clipboard?.readText) {
    void navigator.clipboard.readText().then(text => {
      if (text) editor.chain().focus().insertContent(text).run();
    }).catch(() => {
      try { document.execCommand("paste"); } catch { /* Browser denied clipboard access. */ }
    });
    return;
  }
  try { document.execCommand(command); } catch { /* Browser denied clipboard access. */ }
}

function selectedTextblocks(tr: Transaction) {
  const blocks = new Map<number, ProseMirrorNode>();
  const { from, to, $from, $to } = tr.selection;
  tr.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isTextblock) blocks.set(pos, node);
    return !node.isTextblock;
  });
  for (const resolved of [$from, $to]) {
    for (let depth = resolved.depth; depth > 0; depth -= 1) {
      const node = resolved.node(depth);
      if (!node.isTextblock) continue;
      blocks.set(resolved.before(depth), node);
      break;
    }
  }
  return blocks;
}

function setAlignment(editor: Editor, align: "left" | "center" | "right" | "justify") {
  editor.chain().focus().command(({ tr }) => {
    for (const [pos, node] of selectedTextblocks(tr)) {
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, textAlign: align });
    }
    return true;
  }).run();
}

function setIndent(editor: Editor, delta: number) {
  editor.chain().focus().command(({ tr }) => {
    for (const [pos, node] of selectedTextblocks(tr)) {
      const current = Number(node.attrs.indentLeft) || 0;
      const next = Math.max(0, Math.min(MAX_INDENT, current + delta));
      if (next !== current) tr.setNodeMarkup(pos, undefined, { ...node.attrs, indentLeft: next });
    }
    return true;
  }).run();
}

function clearFormatting(editor: Editor) {
  editor.chain().focus().unsetAllMarks().command(({ tr }) => {
    for (const [pos, node] of selectedTextblocks(tr)) {
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, textAlign: null, indentLeft: 0, indentRight: 0 });
    }
    return true;
  }).run();
}

function currentTextBlockAttr(editor: Editor, name: string) {
  return editor.state.selection.$from.parent.attrs[name];
}

function PlannedPanel({ tab, available }: { tab: RibbonTab; available?: string }) {
  return (
    <div className="nova-ribbon-planned" role="note">
      <strong>{tab} tools are staged for a later Nova tranche.</strong>
      <span>{available ?? "This tab will be enabled as its document model and persistence contract are implemented."}</span>
    </div>
  );
}

export function GenOfficeRibbon({ editor, disabled, onRequestLink, documentTitle = "" }: Props) {
  const [tab, setTab] = useState<RibbonTab>("Home");
  const [fontFamily, setFontFamily] = useState("Georgia");
  const [fontSize, setFontSize] = useState("17px");
  const [textColor, setTextColor] = useState("#eef4ef");
  const [highlightColor, setHighlightColor] = useState("#f5d76e");
  const [showStyles, setShowStyles] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [zoom, setZoom] = useState(100);

  const applyTextStyle = (attrs: Record<string, string | null>) => {
    editor.chain().focus().setMark("tpiTextStyle", attrs).run();
  };

  const block = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
      ? "h2"
      : editor.isActive("heading", { level: 3 })
        ? "h3"
        : "p";

  const setBlock = (value: string) => {
    const chain = editor.chain().focus();
    if (value === "p") chain.setParagraph().run();
    else chain.toggleHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 }).run();
  };

  const renderHome = () => (
    <div className="nova-ribbon-groups">
      <RibbonGroup label="Clipboard">
        <RibbonButton label="Paste" icon={Clipboard} onClick={() => runClipboard(editor, "paste")} disabled={disabled} />
        <div className="nova-ribbon-stack">
          <RibbonButton label="Cut" icon={Scissors} compact onClick={() => runClipboard(editor, "cut")} disabled={disabled} />
          <RibbonButton label="Copy" icon={Copy} compact onClick={() => runClipboard(editor, "copy")} disabled={disabled} />
        </div>
      </RibbonGroup>
      <Divider />
      <RibbonGroup label="Font">
        <select className="nova-ribbon-select nova-ribbon-font" aria-label="Font family" value={fontFamily} disabled={disabled} onChange={event => { setFontFamily(event.target.value); applyTextStyle({ fontFamily: event.target.value }); }}>
          <option>Georgia</option><option>Arial</option><option>Calibri</option><option>Garamond</option><option>Inter</option><option>Times New Roman</option>
        </select>
        <select className="nova-ribbon-select nova-ribbon-size" aria-label="Font size" value={fontSize} disabled={disabled} onChange={event => { setFontSize(event.target.value); applyTextStyle({ fontSize: event.target.value }); }}>
          {["11px", "12px", "14px", "16px", "17px", "18px", "20px", "24px", "28px", "32px", "40px"].map(size => <option key={size}>{size}</option>)}
        </select>
        <div className="nova-ribbon-icon-row">
          <RibbonButton label="Bold" icon={Bold} compact active={editor.isActive("bold")} disabled={disabled} testId="toolbar-bold" onClick={() => editor.chain().focus().toggleBold().run()} />
          <RibbonButton label="Italic" icon={Italic} compact active={editor.isActive("italic")} disabled={disabled} testId="toolbar-italic" onClick={() => editor.chain().focus().toggleItalic().run()} />
          <RibbonButton label="Underline" icon={Underline} compact active={editor.isActive("underline")} disabled={disabled} testId="toolbar-underline" onClick={() => editor.chain().focus().toggleUnderline().run()} />
          <RibbonButton label="Strikethrough" icon={Strikethrough} compact active={editor.isActive("strike")} disabled={disabled} onClick={() => editor.chain().focus().toggleStrike().run()} />
          <label className="nova-ribbon-color" title="Font color"><Type size={15} /><input type="color" aria-label="Font color" value={textColor} disabled={disabled} onChange={event => { setTextColor(event.target.value); applyTextStyle({ color: event.target.value }); }} /></label>
          <label className="nova-ribbon-color" title="Text highlight"><Highlighter size={15} /><input type="color" aria-label="Text highlight" value={highlightColor} disabled={disabled} onChange={event => { setHighlightColor(event.target.value); applyTextStyle({ backgroundColor: event.target.value }); }} /></label>
          <RibbonButton label="Clear formatting" icon={Eraser} compact disabled={disabled} onClick={() => clearFormatting(editor)} />
        </div>
      </RibbonGroup>
      <Divider />
      <RibbonGroup label="Paragraph">
        <select className="nova-ribbon-select nova-ribbon-style" aria-label="Styles" data-testid="block-type" value={block} disabled={disabled} onChange={event => setBlock(event.target.value)}>
          <option value="p">Normal</option><option value="h1">Title</option><option value="h2">Heading 1</option><option value="h3">Heading 2</option>
        </select>
        <div className="nova-ribbon-icon-row">
          <RibbonButton label="Bulleted list" icon={List} compact active={editor.isActive("bulletList")} disabled={disabled} testId="toolbar-bullet-list" onClick={() => editor.chain().focus().toggleBulletList().run()} />
          <RibbonButton label="Numbered list" icon={ListOrdered} compact active={editor.isActive("orderedList")} disabled={disabled} testId="toolbar-ordered-list" onClick={() => editor.chain().focus().toggleOrderedList().run()} />
          <RibbonButton label="Decrease indent" icon={IndentDecrease} compact disabled={disabled} onClick={() => setIndent(editor, -36)} />
          <RibbonButton label="Increase indent" icon={IndentIncrease} compact disabled={disabled} onClick={() => setIndent(editor, 36)} />
          <RibbonButton label="Align left" icon={AlignLeft} compact active={(currentTextBlockAttr(editor, "textAlign") || "left") === "left"} disabled={disabled} onClick={() => setAlignment(editor, "left")} />
          <RibbonButton label="Center" icon={AlignCenter} compact active={currentTextBlockAttr(editor, "textAlign") === "center"} disabled={disabled} onClick={() => setAlignment(editor, "center")} />
          <RibbonButton label="Align right" icon={AlignRight} compact active={currentTextBlockAttr(editor, "textAlign") === "right"} disabled={disabled} onClick={() => setAlignment(editor, "right")} />
          <RibbonButton label="Justify" icon={AlignJustify} compact active={currentTextBlockAttr(editor, "textAlign") === "justify"} disabled={disabled} onClick={() => setAlignment(editor, "justify")} />
          <RibbonButton label="Blockquote" icon={Quote} compact active={editor.isActive("blockquote")} disabled={disabled} testId="toolbar-blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} />
          <RibbonButton label="Horizontal rule" icon={Minus} compact testId="toolbar-hr" onClick={() => editor.chain().focus().setHorizontalRule().run()} disabled={disabled} />
        </div>
      </RibbonGroup>
      <Divider />
      <RibbonGroup label="Styles">
        <RibbonButton label="Styles pane" icon={LayoutDashboard} onClick={() => setShowStyles(value => !value)} active={showStyles} />
      </RibbonGroup>
      <Divider />
      <RibbonGroup label="Document">
        <RibbonButton label="Table" icon={Table} testId="toolbar-table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} disabled={disabled} />
        <RibbonButton label="Link" icon={Link} testId="toolbar-link" onClick={onRequestLink} disabled={disabled} />
        <div className="nova-ribbon-icon-row">
          <RibbonButton label="Add row" icon={Plus} compact testId="toolbar-add-row" onClick={() => editor.chain().focus().addRowAfter().run()} disabled={disabled} />
          <RibbonButton label="Add column" icon={Plus} compact testId="toolbar-add-column" onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={disabled} />
          <RibbonButton label="Delete column" icon={Minus} compact testId="toolbar-delete-column" onClick={() => editor.chain().focus().deleteColumn().run()} disabled={disabled} />
        </div>
      </RibbonGroup>
    </div>
  );

  const renderInsert = () => (
    <div className="nova-ribbon-groups">
      <RibbonGroup label="Tables">
        <RibbonButton label="Table" icon={Table} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} disabled={disabled} />
        <div className="nova-ribbon-icon-row">
          <RibbonButton label="Add row" icon={Plus} compact onClick={() => editor.chain().focus().addRowAfter().run()} disabled={disabled} />
          <RibbonButton label="Add column" icon={Plus} compact onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={disabled} />
          <RibbonButton label="Delete column" icon={Minus} compact onClick={() => editor.chain().focus().deleteColumn().run()} disabled={disabled} />
        </div>
      </RibbonGroup>
      <Divider />
      <RibbonGroup label="Links">
        <RibbonButton label="Link" icon={Link} onClick={onRequestLink} disabled={disabled} />
      </RibbonGroup>
      <Divider />
      <RibbonGroup label="Text">
        <RibbonButton label="Symbol" icon={Type} onClick={() => editor.chain().focus().insertContent(" • ").run()} disabled={disabled} />
        <RibbonButton label="Horizontal rule" icon={Minus} onClick={() => editor.chain().focus().setHorizontalRule().run()} disabled={disabled} />
      </RibbonGroup>
      <Divider />
      <InsertTools editor={editor} disabled={disabled} documentTitle={documentTitle} />
    </div>
  );

  const renderView = () => (
    <div className="nova-ribbon-groups">
      <RibbonGroup label="Show"><RibbonButton label="Navigation pane" icon={BookOpen} active={showNav} onClick={() => setShowNav(value => !value)} /><RibbonButton label="Styles pane" icon={LayoutDashboard} active={showStyles} onClick={() => setShowStyles(value => !value)} /></RibbonGroup>
      <Divider /><RibbonGroup label="Zoom"><RibbonButton label="Zoom out" icon={ZoomOut} onClick={() => setZoom(value => Math.max(70, value - 10))} /><span className="nova-ribbon-zoom">{zoom}%</span><RibbonButton label="Zoom in" icon={ZoomIn} onClick={() => setZoom(value => Math.min(160, value + 10))} /></RibbonGroup>
    </div>
  );

  const renderTab = () => {
    if (tab === "Home") return renderHome();
    if (tab === "Insert") return renderInsert();
    if (tab === "View") return renderView();
    if (tab === "Layout") return <PlannedPanel tab={tab} available="Basic paragraph indentation and alignment are live on Home; page geometry is scheduled for the layout tranche." />;
    if (tab === "Review") return <PlannedPanel tab={tab} available="Read-only locks and publication review are live in the document workflow; comments and tracked changes are scheduled separately." />;
    return <PlannedPanel tab={tab} />;
  };

  return (
    <div className="nova-ribbon-shell" data-testid="genoffice-ribbon">
      <div className="nova-ribbon-tab-row" role="tablist" aria-label="GenOffice document ribbon">
        <div className="nova-ribbon-quick"><RibbonButton label="Undo" icon={Undo2} compact testId="toolbar-undo" disabled={disabled || !editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} /><RibbonButton label="Redo" icon={Redo2} compact testId="toolbar-redo" disabled={disabled || !editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} /></div>
        {TABS.map(item => <button type="button" role="tab" aria-selected={tab === item} className={`nova-ribbon-tab${tab === item ? " is-active" : ""}`} key={item} onClick={() => setTab(item)} data-testid={`ribbon-tab-${item.toLowerCase()}`}>{item}</button>)}
        <div className="nova-ribbon-tab-spacer" />
        <button type="button" className="nova-ribbon-comments" onClick={() => setTab("Review")}><MessageSquare size={15} /> Show Comments</button>
      </div>
      <div className="nova-ribbon-panel" role="tabpanel" aria-label={`${tab} ribbon`}>{renderTab()}</div>
      {showNav ? <aside className="nova-ribbon-side-pane" aria-label="Navigation pane"><strong>Navigation</strong><span>Headings and document bookmarks</span><button type="button" onClick={() => setShowNav(false)}>Close pane</button></aside> : null}
      {showStyles ? <aside className="nova-ribbon-side-pane nova-ribbon-styles-pane" aria-label="Styles pane"><strong>Styles</strong><button type="button" onClick={() => setBlock("h1")}>Title</button><button type="button" onClick={() => setBlock("h2")}>Heading 1</button><button type="button" onClick={() => setBlock("h3")}>Heading 2</button><button type="button" onClick={() => setBlock("p")}>Normal</button></aside> : null}
    </div>
  );
}
