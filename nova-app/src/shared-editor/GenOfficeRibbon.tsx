import { useEffect, useState, type ReactNode } from "react";
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
  Merge,
  MessageSquare,
  Minus,
  PaintBucket,
  Plus,
  Quote,
  Redo2,
  Rows3,
  Search,
  Scissors,
  Split,
  Strikethrough,
  Table,
  TableProperties,
  Type,
  Underline,
  Undo2,
  ZoomIn,
  ZoomOut,
  type LucideIcon
} from "lucide-react";
import { InsertTools } from "./InsertTools";
import {
  addNovaColumn,
  addNovaRow,
  currentTable,
  deleteNovaColumn,
  deleteNovaRow,
  inTable,
  insertNovaTable,
  mergeNovaCells,
  setNovaCellFill,
  setNovaCellHorizontalAlign,
  setNovaCellVerticalAlign,
  setNovaRowHeight,
  setNovaTableAlignment,
  setNovaTableAutoFit,
  setNovaTableBorder,
  setNovaTableStyle,
  setNovaTableWidth,
  splitNovaCell
} from "./commands/tables";
import { CELL_VERTICAL_ALIGNMENTS, TABLE_ALIGNMENTS, TABLE_AUTOFIT, TABLE_BORDER_STYLES, TABLE_STYLE_PRESETS } from "./tableAttributes";

type RibbonTab = "Home" | "Insert" | "Draw" | "Design" | "Layout" | "References" | "Mailings" | "Review" | "View";
export type DocumentViewMode = "print" | "web" | "outline";

interface Props {
  editor: Editor;
  disabled: boolean;
  onRequestLink: () => void;
  documentTitle?: string;
  onToggleFindReplace?: () => void;
  viewMode?: DocumentViewMode;
  onViewModeChange?: (mode: DocumentViewMode) => void;
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

export function GenOfficeRibbon({ editor, disabled, onRequestLink, documentTitle = "", onToggleFindReplace, viewMode = "print", onViewModeChange }: Props) {
  const [tab, setTab] = useState<RibbonTab>("Home");
  const [fontFamily, setFontFamily] = useState("Georgia");
  const [fontSize, setFontSize] = useState("17px");
  const [textColor, setTextColor] = useState("#eef4ef");
  const [highlightColor, setHighlightColor] = useState("#f5d76e");
  const [showStyles, setShowStyles] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [wordCount, setWordCount] = useState<number | null>(null);
  const [, refreshSelectionState] = useState(0);

  useEffect(() => {
    const refresh = () => refreshSelectionState(value => value + 1);
    editor.on("selectionUpdate", refresh);
    editor.on("transaction", refresh);
    return () => {
      editor.off("selectionUpdate", refresh);
      editor.off("transaction", refresh);
    };
  }, [editor]);

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
  const tableContext = inTable(editor);
  const table = currentTable(editor);
  const tableStyle = String(table?.attrs.stylePreset || "plain");
  const tableAutoFit = String(table?.attrs.autoFit || "window");
  const tableAlignment = String(table?.attrs.alignment || "left");
  const tableBorderStyle = String(table?.attrs.borderStyle || "solid");
  const tableBorderWidth = String(table?.attrs.borderWidth || 1);
  const tableBorderColor = String(table?.attrs.borderColor || "#33403a");
  const cellFill = String(editor.getAttributes("tableCell").fill || editor.getAttributes("tableHeader").fill || "#202b25");

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
        <RibbonButton label="Table" icon={Table} testId="toolbar-table" onClick={() => insertNovaTable(editor)} disabled={disabled} />
        <RibbonButton label="Link" icon={Link} testId="toolbar-link" onClick={onRequestLink} disabled={disabled} />
        <RibbonButton label="Find and replace" icon={Search} onClick={onToggleFindReplace} />
        <div className="nova-ribbon-icon-row">
          <RibbonButton label="Add row" icon={Plus} compact testId="toolbar-add-row" onClick={() => addNovaRow(editor)} disabled={disabled || !tableContext} />
          <RibbonButton label="Add column" icon={Plus} compact testId="toolbar-add-column" onClick={() => addNovaColumn(editor)} disabled={disabled || !tableContext} />
          <RibbonButton label="Delete column" icon={Minus} compact testId="toolbar-delete-column" onClick={() => deleteNovaColumn(editor)} disabled={disabled || !tableContext} />
        </div>
      </RibbonGroup>
    </div>
  );

  const renderInsert = () => (
    <div className="nova-ribbon-groups">
      <RibbonGroup label="Tables">
        <RibbonButton label="Table" icon={Table} onClick={() => insertNovaTable(editor)} disabled={disabled} />
        <div className="nova-ribbon-icon-row">
          <RibbonButton label="Add row" icon={Plus} compact onClick={() => addNovaRow(editor)} disabled={disabled || !tableContext} />
          <RibbonButton label="Add column" icon={Plus} compact onClick={() => addNovaColumn(editor)} disabled={disabled || !tableContext} />
          <RibbonButton label="Delete row" icon={Minus} compact onClick={() => deleteNovaRow(editor)} disabled={disabled || !tableContext} />
          <RibbonButton label="Delete column" icon={Minus} compact onClick={() => deleteNovaColumn(editor)} disabled={disabled || !tableContext} />
          <RibbonButton label="Merge cells" icon={Merge} compact onClick={() => mergeNovaCells(editor)} disabled={disabled || !tableContext} />
          <RibbonButton label="Split cell" icon={Split} compact onClick={() => splitNovaCell(editor)} disabled={disabled || !tableContext} />
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

  const renderDraw = () => (
    <div className="nova-ribbon-groups">
      <RibbonGroup label="Markup">
        <RibbonButton label="Highlight" icon={Highlighter} onClick={() => applyTextStyle({ backgroundColor: highlightColor })} disabled={disabled} />
        <RibbonButton label="Remove highlight" icon={Eraser} onClick={() => applyTextStyle({ backgroundColor: null })} disabled={disabled} />
        <RibbonButton label="Horizontal rule" icon={Minus} onClick={() => editor.chain().focus().setHorizontalRule().run()} disabled={disabled} />
      </RibbonGroup>
      <Divider />
      <RibbonGroup label="Ink color">
        <label className="nova-ribbon-color" title="Markup color"><Highlighter size={15} /><input type="color" aria-label="Markup color" value={highlightColor} disabled={disabled} onChange={event => setHighlightColor(event.target.value)} /></label>
      </RibbonGroup>
    </div>
  );

  const renderDesign = () => (
    <div className="nova-ribbon-groups">
      <RibbonGroup label="Document theme">
        <select className="nova-ribbon-select nova-ribbon-style" aria-label="Document theme" disabled={disabled} value={fontFamily} onChange={event => { setFontFamily(event.target.value); applyTextStyle({ fontFamily: event.target.value }); }}>
          <option value="Georgia">Editorial Serif</option><option value="Arial">Clean Sans</option><option value="Calibri">Office</option><option value="Times New Roman">Classic</option>
        </select>
        <label className="nova-ribbon-color" title="Theme color"><Type size={15} /><input type="color" aria-label="Theme color" value={textColor} disabled={disabled} onChange={event => { setTextColor(event.target.value); applyTextStyle({ color: event.target.value }); }} /></label>
      </RibbonGroup>
      <Divider />
      <RibbonGroup label="Document styles">
        <RibbonButton label="Title" icon={Type} onClick={() => setBlock("h1")} disabled={disabled} />
        <RibbonButton label="Heading" icon={Type} onClick={() => setBlock("h2")} disabled={disabled} />
        <RibbonButton label="Normal" icon={Type} onClick={() => setBlock("p")} disabled={disabled} />
      </RibbonGroup>
    </div>
  );

  const renderLayout = () => (
    <div className="nova-ribbon-groups">
      <RibbonGroup label="Paragraph layout">
        <RibbonButton label="Decrease indent" icon={IndentDecrease} compact disabled={disabled} onClick={() => setIndent(editor, -36)} />
        <RibbonButton label="Increase indent" icon={IndentIncrease} compact disabled={disabled} onClick={() => setIndent(editor, 36)} />
        <RibbonButton label="Align left" icon={AlignLeft} compact disabled={disabled} onClick={() => setAlignment(editor, "left")} />
        <RibbonButton label="Center" icon={AlignCenter} compact disabled={disabled} onClick={() => setAlignment(editor, "center")} />
        <RibbonButton label="Align right" icon={AlignRight} compact disabled={disabled} onClick={() => setAlignment(editor, "right")} />
        <RibbonButton label="Justify" icon={AlignJustify} compact disabled={disabled} onClick={() => setAlignment(editor, "justify")} />
      </RibbonGroup>
      <Divider />
      {tableContext ? renderTableLayout() : <RibbonGroup label="Document flow"><RibbonButton label="Quote" icon={Quote} onClick={() => editor.chain().focus().toggleBlockquote().run()} disabled={disabled} /><RibbonButton label="List" icon={List} onClick={() => editor.chain().focus().toggleBulletList().run()} disabled={disabled} /></RibbonGroup>}
    </div>
  );

  const renderReferences = () => (
    <div className="nova-ribbon-groups">
      <RibbonGroup label="References">
        <RibbonButton label="Citation" icon={BookOpen} onClick={() => editor.chain().focus().insertContent("[Citation needed]").run()} disabled={disabled} />
        <RibbonButton label="Footnote marker" icon={Type} onClick={() => editor.chain().focus().insertContent("[^1]").run()} disabled={disabled} />
        <RibbonButton label="Source link" icon={Link} onClick={onRequestLink} disabled={disabled} />
      </RibbonGroup>
    </div>
  );

  const renderMailings = () => (
    <div className="nova-ribbon-groups">
      <RibbonGroup label="Merge fields">
        <RibbonButton label="Author" icon={Type} onClick={() => editor.chain().focus().insertContent("{{author}}").run()} disabled={disabled} />
        <RibbonButton label="Organization" icon={Type} onClick={() => editor.chain().focus().insertContent("{{organization}}").run()} disabled={disabled} />
        <RibbonButton label="Date" icon={Type} onClick={() => editor.chain().focus().insertContent("{{date}}").run()} disabled={disabled} />
      </RibbonGroup>
    </div>
  );

  const renderReview = () => (
    <div className="nova-ribbon-groups">
      <RibbonGroup label="Proofing">
        <RibbonButton label="Word count" icon={BookOpen} onClick={() => setWordCount(editor.getText().trim().split(/\s+/).filter(Boolean).length)} disabled={disabled} />
        <RibbonButton label="Clear formatting" icon={Eraser} onClick={() => clearFormatting(editor)} disabled={disabled} />
      </RibbonGroup>
      <Divider />
      <RibbonGroup label="Review state">
        <span className="nova-ribbon-zoom">{editor.getText().trim() ? "Content ready for review" : "Empty document"}</span>
        {wordCount !== null && <span className="nova-ribbon-zoom">{wordCount} words</span>}
      </RibbonGroup>
    </div>
  );

  const renderTableDesign = () => {
    if (!tableContext) return <PlannedPanel tab="Design" available="Select a table cell to enable table design controls." />;
    return (
      <div className="nova-ribbon-groups">
        <RibbonGroup label="Table Style">
          <select className="nova-ribbon-select nova-ribbon-style" aria-label="Table style" value={tableStyle} disabled={disabled} onChange={event => setNovaTableStyle(editor, event.target.value as typeof TABLE_STYLE_PRESETS[number])}>
            {TABLE_STYLE_PRESETS.map(style => <option key={style} value={style}>{style[0].toUpperCase() + style.slice(1)}</option>)}
          </select>
        </RibbonGroup>
        <Divider />
        <RibbonGroup label="Borders">
          <select className="nova-ribbon-select" aria-label="Border style" value={tableBorderStyle} disabled={disabled} onChange={event => setNovaTableBorder(editor, event.target.value as typeof TABLE_BORDER_STYLES[number], Number(tableBorderWidth), tableBorderColor)}>
            {TABLE_BORDER_STYLES.map(style => <option key={style} value={style}>{style[0].toUpperCase() + style.slice(1)}</option>)}
          </select>
          <select className="nova-ribbon-select" aria-label="Border width" value={tableBorderWidth} disabled={disabled} onChange={event => setNovaTableBorder(editor, tableBorderStyle as typeof TABLE_BORDER_STYLES[number], Number(event.target.value), tableBorderColor)}>
            {[0, 1, 2, 3].map(width => <option key={width} value={width}>{width}px</option>)}
          </select>
          <label className="nova-ribbon-color" title="Border color"><TableProperties size={15} /><input type="color" aria-label="Border color" value={tableBorderColor} disabled={disabled} onChange={event => setNovaTableBorder(editor, tableBorderStyle as typeof TABLE_BORDER_STYLES[number], Number(tableBorderWidth), event.target.value)} /></label>
        </RibbonGroup>
        <Divider />
        <RibbonGroup label="Shading">
          <label className="nova-ribbon-color" title="Cell shading"><PaintBucket size={15} /><input type="color" aria-label="Cell shading" value={cellFill} disabled={disabled} onChange={event => setNovaCellFill(editor, event.target.value)} /></label>
          <RibbonButton label="Clear shading" icon={Eraser} compact disabled={disabled} onClick={() => setNovaCellFill(editor, null)} />
        </RibbonGroup>
      </div>
    );
  };

  const renderTableLayout = () => {
    if (!tableContext) return <PlannedPanel tab="Layout" available="Select a table cell to enable table layout controls." />;
    return (
      <div className="nova-ribbon-groups">
        <RibbonGroup label="Rows">
          <RibbonButton label="Add row" icon={Rows3} onClick={() => addNovaRow(editor)} disabled={disabled} />
          <RibbonButton label="Delete row" icon={Minus} onClick={() => deleteNovaRow(editor)} disabled={disabled} />
          <select className="nova-ribbon-select" aria-label="Row height" disabled={disabled} defaultValue="auto" onChange={event => setNovaRowHeight(editor, event.target.value === "auto" ? null : Number(event.target.value))}>
            <option value="auto">Auto height</option><option value="32">32px</option><option value="48">48px</option><option value="72">72px</option>
          </select>
        </RibbonGroup>
        <Divider />
        <RibbonGroup label="Columns">
          <RibbonButton label="Add column" icon={Plus} onClick={() => addNovaColumn(editor)} disabled={disabled} />
          <RibbonButton label="Delete column" icon={Minus} onClick={() => deleteNovaColumn(editor)} disabled={disabled} />
        </RibbonGroup>
        <Divider />
        <RibbonGroup label="Merge">
          <RibbonButton label="Merge cells" icon={Merge} onClick={() => mergeNovaCells(editor)} disabled={disabled} />
          <RibbonButton label="Split cell" icon={Split} onClick={() => splitNovaCell(editor)} disabled={disabled} />
        </RibbonGroup>
        <Divider />
        <RibbonGroup label="Cell alignment">
          <select className="nova-ribbon-select" aria-label="Horizontal cell alignment" disabled={disabled} defaultValue="left" onChange={event => setNovaCellHorizontalAlign(editor, event.target.value as typeof TABLE_ALIGNMENTS[number])}>
            {TABLE_ALIGNMENTS.map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}
          </select>
          <select className="nova-ribbon-select" aria-label="Vertical cell alignment" disabled={disabled} defaultValue="top" onChange={event => setNovaCellVerticalAlign(editor, event.target.value as typeof CELL_VERTICAL_ALIGNMENTS[number])}>
            {CELL_VERTICAL_ALIGNMENTS.map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}
          </select>
        </RibbonGroup>
        <Divider />
        <RibbonGroup label="Table">
          <select className="nova-ribbon-select" aria-label="AutoFit" value={tableAutoFit} disabled={disabled} onChange={event => setNovaTableAutoFit(editor, event.target.value as typeof TABLE_AUTOFIT[number])}>
            {TABLE_AUTOFIT.map(value => <option key={value} value={value}>AutoFit {value[0].toUpperCase() + value.slice(1)}</option>)}
          </select>
          <select className="nova-ribbon-select" aria-label="Table alignment" value={tableAlignment} disabled={disabled} onChange={event => setNovaTableAlignment(editor, event.target.value as typeof TABLE_ALIGNMENTS[number])}>
            {TABLE_ALIGNMENTS.map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}
          </select>
          <select className="nova-ribbon-select" aria-label="Table width" disabled={disabled} defaultValue="window" onChange={event => setNovaTableWidth(editor, event.target.value)}>
            <option value="window">Window width</option><option value="720">720px</option><option value="900">900px</option><option value="1200">1200px</option>
          </select>
        </RibbonGroup>
      </div>
    );
  };

  const renderView = () => (
    <div className="nova-ribbon-groups">
      <RibbonGroup label="Show"><RibbonButton label="Navigation pane" icon={BookOpen} active={showNav} onClick={() => setShowNav(value => !value)} /><RibbonButton label="Styles pane" icon={LayoutDashboard} active={showStyles} onClick={() => setShowStyles(value => !value)} /><RibbonButton label="Find and replace" icon={Search} onClick={onToggleFindReplace} /></RibbonGroup>
      <Divider /><RibbonGroup label="Document view"><select className="nova-ribbon-select" aria-label="Document view" value={viewMode} onChange={event => onViewModeChange?.(event.target.value as DocumentViewMode)}><option value="print">Print Layout</option><option value="web">Web Layout</option><option value="outline">Outline</option></select></RibbonGroup>
      <Divider /><RibbonGroup label="Zoom"><RibbonButton label="Zoom out" icon={ZoomOut} onClick={() => setZoom(value => Math.max(70, value - 10))} /><span className="nova-ribbon-zoom">{zoom}%</span><RibbonButton label="Zoom in" icon={ZoomIn} onClick={() => setZoom(value => Math.min(160, value + 10))} /></RibbonGroup>
    </div>
  );

  const renderTab = () => {
    if (tab === "Home") return renderHome();
    if (tab === "Insert") return renderInsert();
    if (tab === "Draw") return renderDraw();
    if (tab === "Design") return tableContext ? renderTableDesign() : renderDesign();
    if (tab === "View") return renderView();
    if (tab === "Layout") return renderLayout();
    if (tab === "References") return renderReferences();
    if (tab === "Mailings") return renderMailings();
    if (tab === "Review") return renderReview();
    return renderHome();
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
