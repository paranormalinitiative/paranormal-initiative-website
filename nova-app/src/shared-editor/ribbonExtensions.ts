import { Mark, mergeAttributes } from "@tiptap/core";

const FONT_SIZES = new Set(["11px", "12px", "14px", "16px", "17px", "18px", "20px", "24px", "28px", "32px", "40px"]);
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const SAFE_FONT = /^[a-zA-Z0-9][a-zA-Z0-9 _-]{0,79}$/;

function safeFontFamily(value: unknown) {
  return typeof value === "string" && SAFE_FONT.test(value.trim()) ? value.trim() : null;
}

function safeFontSize(value: unknown) {
  return typeof value === "string" && FONT_SIZES.has(value) ? value : null;
}

function safeColor(value: unknown) {
  return typeof value === "string" && HEX_COLOR.test(value) ? value.toLowerCase() : null;
}

const textStyleAttrs = {
  fontFamily: {
    default: null,
    parseHTML: (element: HTMLElement) => safeFontFamily(element.style.fontFamily.replace(/^['"]|['"]$/g, "")),
    renderHTML: () => ({})
  },
  fontSize: {
    default: null,
    parseHTML: (element: HTMLElement) => safeFontSize(element.style.fontSize),
    renderHTML: () => ({})
  },
  color: {
    default: null,
    parseHTML: (element: HTMLElement) => safeColor(element.style.color),
    renderHTML: () => ({})
  },
  backgroundColor: {
    default: null,
    parseHTML: (element: HTMLElement) => safeColor(element.style.backgroundColor),
    renderHTML: () => ({})
  }
};

/** Persistent character formatting used by the document ribbon. */
export const TpiTextStyle = Mark.create({
  name: "tpiTextStyle",
  addAttributes() {
    return textStyleAttrs;
  },
  parseHTML() {
    return [{ tag: "span[data-tpi-text-style]" }];
  },
  renderHTML({ HTMLAttributes }) {
    const fontFamily = safeFontFamily(HTMLAttributes.fontFamily);
    const fontSize = safeFontSize(HTMLAttributes.fontSize);
    const color = safeColor(HTMLAttributes.color);
    const backgroundColor = safeColor(HTMLAttributes.backgroundColor);
    const style = [
      fontFamily ? `font-family:${fontFamily}` : "",
      fontSize ? `font-size:${fontSize}` : "",
      color ? `color:${color}` : "",
      backgroundColor ? `background-color:${backgroundColor}` : ""
    ].filter(Boolean).join(";");
    return ["span", mergeAttributes({ "data-tpi-text-style": "true", style }), 0];
  }
});
