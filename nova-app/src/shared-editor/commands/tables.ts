import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import {
  CELL_VERTICAL_ALIGNMENTS,
  TABLE_ALIGNMENTS,
  TABLE_AUTOFIT,
  TABLE_BORDER_STYLES,
  TABLE_STYLE_PRESETS,
  safeBorderWidth,
  safeHexColor,
  safeRowHeightPx,
  safeTableIndent,
  safeTableWidthPct,
  safeTableWidthPx,
  type CellVerticalAlignment,
  type TableAlignment,
  type TableAutoFit,
  type TableBorderStyle,
  type TableStylePreset
} from "../tableAttributes";

function tableContext(editor: Editor) {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name === "table") return { node, pos: $from.before(depth) };
  }
  return null;
}

function rowContext(editor: Editor) {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name === "tableRow") return { node, pos: $from.before(depth) };
  }
  return null;
}

export function inTable(editor: Editor) {
  return Boolean(tableContext(editor));
}

export function currentTable(editor: Editor): ProseMirrorNode | null {
  return tableContext(editor)?.node ?? null;
}

export function insertNovaTable(editor: Editor, rows = 3, cols = 3) {
  return editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
}

export function addNovaRow(editor: Editor) { return editor.chain().focus().addRowAfter().run(); }
export function deleteNovaRow(editor: Editor) { return editor.chain().focus().deleteRow().run(); }
export function addNovaColumn(editor: Editor) { return editor.chain().focus().addColumnAfter().run(); }
export function deleteNovaColumn(editor: Editor) { return editor.chain().focus().deleteColumn().run(); }
export function mergeNovaCells(editor: Editor) { return editor.chain().focus().mergeCells().run(); }
export function splitNovaCell(editor: Editor) { return editor.chain().focus().splitCell().run(); }

function setTableAttrs(editor: Editor, attrs: Record<string, unknown>) {
  const context = tableContext(editor);
  if (!context) return false;
  return editor.chain().focus().command(({ tr }) => {
    tr.setNodeMarkup(context.pos, undefined, { ...context.node.attrs, ...attrs });
    return true;
  }).run();
}

function setCellAttr(editor: Editor, name: string, value: unknown) {
  return editor.chain().focus().setCellAttribute(name, value).run();
}

export function setNovaTableWidth(editor: Editor, value: string) {
  if (value === "window") return setTableAttrs(editor, { widthPx: null, widthPct: 100, autoFit: "window" });
  const px = safeTableWidthPx(value);
  return px == null ? false : setTableAttrs(editor, { widthPx: px, widthPct: null, autoFit: "fixed" });
}

export function setNovaTableWidthPercent(editor: Editor, value: number | null) {
  const pct = value == null ? null : safeTableWidthPct(value);
  return setTableAttrs(editor, { widthPx: null, widthPct: pct });
}

export function setNovaTableAutoFit(editor: Editor, value: TableAutoFit) {
  if (!TABLE_AUTOFIT.includes(value)) return false;
  return setTableAttrs(editor, { autoFit: value });
}

export function setNovaTableAlignment(editor: Editor, value: TableAlignment) {
  if (!TABLE_ALIGNMENTS.includes(value)) return false;
  return setTableAttrs(editor, { alignment: value });
}

export function setNovaTableIndent(editor: Editor, value: number) {
  return setTableAttrs(editor, { indentLeft: safeTableIndent(value) });
}

export function setNovaTableStyle(editor: Editor, value: TableStylePreset) {
  if (!TABLE_STYLE_PRESETS.includes(value)) return false;
  return setTableAttrs(editor, { stylePreset: value });
}

export function setNovaTableBorder(editor: Editor, style: TableBorderStyle, width: number, color: string) {
  if (!TABLE_BORDER_STYLES.includes(style)) return false;
  return setTableAttrs(editor, { borderStyle: style, borderWidth: safeBorderWidth(width), borderColor: safeHexColor(color) });
}

export function setNovaCellFill(editor: Editor, color: string | null) {
  return setCellAttr(editor, "fill", color == null ? null : safeHexColor(color));
}

export function setNovaCellVerticalAlign(editor: Editor, value: CellVerticalAlignment) {
  if (!CELL_VERTICAL_ALIGNMENTS.includes(value)) return false;
  return setCellAttr(editor, "verticalAlign", value);
}

export function setNovaCellHorizontalAlign(editor: Editor, value: TableAlignment | null) {
  if (value !== null && !TABLE_ALIGNMENTS.includes(value)) return false;
  return setCellAttr(editor, "align", value);
}

export function setNovaRowHeight(editor: Editor, value: number | null) {
  const context = rowContext(editor);
  if (!context) return false;
  const heightPx = value == null ? null : safeRowHeightPx(value);
  return editor.chain().focus().command(({ tr }) => {
    tr.setNodeMarkup(context.pos, undefined, { ...context.node.attrs, heightPx });
    return true;
  }).run();
}
