const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const TABLE_AUTOFIT = ["fixed", "contents", "window"] as const;
export const TABLE_ALIGNMENTS = ["left", "center", "right"] as const;
export const TABLE_BORDER_STYLES = ["none", "solid", "dashed", "dotted"] as const;
export const TABLE_STYLE_PRESETS = ["plain", "grid", "striped", "accent"] as const;
export const CELL_VERTICAL_ALIGNMENTS = ["top", "middle", "bottom"] as const;

export type TableAutoFit = (typeof TABLE_AUTOFIT)[number];
export type TableAlignment = (typeof TABLE_ALIGNMENTS)[number];
export type TableBorderStyle = (typeof TABLE_BORDER_STYLES)[number];
export type TableStylePreset = (typeof TABLE_STYLE_PRESETS)[number];
export type CellVerticalAlignment = (typeof CELL_VERTICAL_ALIGNMENTS)[number];

const MAX_TABLE_WIDTH_PX = 1600;
const MAX_TABLE_WIDTH_PCT = 100;
const MAX_TABLE_INDENT = 288;
const MAX_ROW_HEIGHT_PX = 640;
const MAX_BORDER_WIDTH = 6;

function numberInRange(value: unknown, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

export function safeHexColor(value: unknown) {
  return typeof value === "string" && HEX_COLOR.test(value) ? value.toLowerCase() : null;
}

export function safeTableWidthPx(value: unknown) {
  return numberInRange(value, 40, MAX_TABLE_WIDTH_PX);
}

export function safeTableWidthPct(value: unknown) {
  return numberInRange(value, 10, MAX_TABLE_WIDTH_PCT);
}

export function safeTableIndent(value: unknown) {
  return numberInRange(value, 0, MAX_TABLE_INDENT) ?? 0;
}

export function safeRowHeightPx(value: unknown) {
  return numberInRange(value, 24, MAX_ROW_HEIGHT_PX);
}

export function safeBorderWidth(value: unknown) {
  return numberInRange(value, 0, MAX_BORDER_WIDTH) ?? 1;
}

function safeEnum<T extends readonly string[]>(value: unknown, values: T): T[number] | null {
  return typeof value === "string" && values.includes(value) ? value : null;
}

function parseStylePx(value: string) {
  const match = /^\s*(\d+(?:\.\d+)?)px\s*$/i.exec(value || "");
  return match ? safeTableWidthPx(match[1]) : null;
}

function parseStylePct(value: string) {
  const match = /^\s*(\d+(?:\.\d+)?)%\s*$/i.exec(value || "");
  return match ? safeTableWidthPct(match[1]) : null;
}

function parseDataNumber(element: HTMLElement, name: string, parser: (value: unknown) => number | null) {
  return parser(element.getAttribute(name));
}

export const tableAttributes = {
  widthPx: {
    default: null,
    parseHTML: (element: HTMLElement) => parseDataNumber(element, "data-tpi-width-px", safeTableWidthPx) ?? parseStylePx(element.style.width),
    renderHTML: () => ({})
  },
  widthPct: {
    default: null,
    parseHTML: (element: HTMLElement) => parseDataNumber(element, "data-tpi-width-pct", safeTableWidthPct) ?? parseStylePct(element.style.width),
    renderHTML: () => ({})
  },
  autoFit: {
    default: null,
    parseHTML: (element: HTMLElement) => safeEnum(element.getAttribute("data-tpi-autofit"), TABLE_AUTOFIT),
    renderHTML: () => ({})
  },
  alignment: {
    default: null,
    parseHTML: (element: HTMLElement) => safeEnum(element.getAttribute("data-tpi-alignment"), TABLE_ALIGNMENTS),
    renderHTML: () => ({})
  },
  indentLeft: {
    default: 0,
    parseHTML: (element: HTMLElement) => parseDataNumber(element, "data-tpi-indent-left", safeTableIndent) ?? safeTableIndent(element.style.marginLeft.replace(/px$/i, "")),
    renderHTML: () => ({})
  },
  stylePreset: {
    default: null,
    parseHTML: (element: HTMLElement) => safeEnum(element.getAttribute("data-tpi-style"), TABLE_STYLE_PRESETS),
    renderHTML: () => ({})
  },
  borderStyle: {
    default: null,
    parseHTML: (element: HTMLElement) => safeEnum(element.getAttribute("data-tpi-border-style"), TABLE_BORDER_STYLES),
    renderHTML: () => ({})
  },
  borderWidth: {
    default: null,
    parseHTML: (element: HTMLElement) => parseDataNumber(element, "data-tpi-border-width", safeBorderWidth),
    renderHTML: () => ({})
  },
  borderColor: {
    default: null,
    parseHTML: (element: HTMLElement) => safeHexColor(element.getAttribute("data-tpi-border-color")),
    renderHTML: () => ({})
  }
};

export const tableRowAttributes = {
  heightPx: {
    default: null,
    parseHTML: (element: HTMLElement) => parseDataNumber(element, "data-tpi-height-px", safeRowHeightPx) ?? safeRowHeightPx(element.style.height.replace(/px$/i, "")),
    renderHTML: () => ({})
  }
};

export const tableCellAttributes = {
  verticalAlign: {
    default: null,
    parseHTML: (element: HTMLElement) => safeEnum(element.getAttribute("data-tpi-vertical-align") || element.style.verticalAlign, CELL_VERTICAL_ALIGNMENTS),
    renderHTML: () => ({})
  },
  fill: {
    default: null,
    parseHTML: (element: HTMLElement) => safeHexColor(element.getAttribute("data-tpi-fill") || element.style.backgroundColor),
    renderHTML: () => ({})
  },
  borderStyle: {
    default: null,
    parseHTML: (element: HTMLElement) => safeEnum(element.getAttribute("data-tpi-cell-border-style"), TABLE_BORDER_STYLES),
    renderHTML: () => ({})
  },
  borderWidth: {
    default: null,
    parseHTML: (element: HTMLElement) => parseDataNumber(element, "data-tpi-cell-border-width", safeBorderWidth),
    renderHTML: () => ({})
  },
  borderColor: {
    default: null,
    parseHTML: (element: HTMLElement) => safeHexColor(element.getAttribute("data-tpi-cell-border-color")),
    renderHTML: () => ({})
  }
};

function appendStyle(attributes: Record<string, unknown>, declarations: string[]) {
  const style = declarations.filter(Boolean).join(";");
  if (!style) return attributes;
  const existing = typeof attributes.style === "string" ? attributes.style : "";
  return { ...attributes, style: [existing, style].filter(Boolean).join(";") };
}

export function tableHTMLAttributes(attrs: Record<string, unknown>) {
  const widthPx = safeTableWidthPx(attrs.widthPx);
  const widthPct = safeTableWidthPct(attrs.widthPct);
  const autoFit = safeEnum(attrs.autoFit, TABLE_AUTOFIT);
  const alignment = safeEnum(attrs.alignment, TABLE_ALIGNMENTS);
  const indentLeft = safeTableIndent(attrs.indentLeft);
  const stylePreset = safeEnum(attrs.stylePreset, TABLE_STYLE_PRESETS);
  const borderStyle = safeEnum(attrs.borderStyle, TABLE_BORDER_STYLES);
  const borderWidth = safeBorderWidth(attrs.borderWidth);
  const borderColor = safeHexColor(attrs.borderColor);
  const declarations = [
    widthPx ? `width:${widthPx}px` : widthPct ? `width:${widthPct}%` : "",
    autoFit === "fixed" ? "table-layout:fixed" : autoFit === "contents" ? "table-layout:auto" : "",
    alignment === "center" ? "margin-left:auto;margin-right:auto" : alignment === "right" ? "margin-left:auto;margin-right:0" : indentLeft ? `margin-left:${indentLeft}px` : "",
    borderStyle && borderWidth > 0 ? `border-collapse:collapse;border-style:${borderStyle};border-width:${borderWidth}px;border-color:${borderColor || "#33403a"}` : ""
  ];
  const output: Record<string, unknown> = {};
  if (widthPx) output["data-tpi-width-px"] = String(widthPx);
  if (widthPct) output["data-tpi-width-pct"] = String(widthPct);
  if (autoFit) output["data-tpi-autofit"] = autoFit;
  if (alignment) output["data-tpi-alignment"] = alignment;
  if (indentLeft) output["data-tpi-indent-left"] = String(indentLeft);
  if (stylePreset) output["data-tpi-style"] = stylePreset;
  if (borderStyle) output["data-tpi-border-style"] = borderStyle;
  if (attrs.borderWidth != null) output["data-tpi-border-width"] = String(borderWidth);
  if (borderColor) output["data-tpi-border-color"] = borderColor;
  return appendStyle(output, declarations);
}

export function tableRowHTMLAttributes(attrs: Record<string, unknown>) {
  const heightPx = safeRowHeightPx(attrs.heightPx);
  return heightPx
    ? appendStyle({ "data-tpi-height-px": String(heightPx) }, [`height:${heightPx}px`])
    : {};
}

export function tableCellHTMLAttributes(attrs: Record<string, unknown>) {
  const verticalAlign = safeEnum(attrs.verticalAlign, CELL_VERTICAL_ALIGNMENTS);
  const fill = safeHexColor(attrs.fill);
  const borderStyle = safeEnum(attrs.borderStyle, TABLE_BORDER_STYLES);
  const borderWidth = safeBorderWidth(attrs.borderWidth);
  const borderColor = safeHexColor(attrs.borderColor);
  const output: Record<string, unknown> = {};
  if (verticalAlign) output["data-tpi-vertical-align"] = verticalAlign;
  if (fill) output["data-tpi-fill"] = fill;
  if (borderStyle) output["data-tpi-cell-border-style"] = borderStyle;
  if (attrs.borderWidth != null) output["data-tpi-cell-border-width"] = String(borderWidth);
  if (borderColor) output["data-tpi-cell-border-color"] = borderColor;
  return appendStyle(output, [
    verticalAlign ? `vertical-align:${verticalAlign}` : "",
    fill ? `background-color:${fill}` : "",
    borderStyle && borderWidth > 0 ? `border-style:${borderStyle};border-width:${borderWidth}px;border-color:${borderColor || "#33403a"}` : ""
  ]);
}
