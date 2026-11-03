// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import { novaDocumentExtensions } from "../src/document/extensions";
import {
  SAMPLE_DOCUMENT,
  parseDocument,
  serializeDocument,
} from "../src/document/model";

const makeEditor = (content = SAMPLE_DOCUMENT) =>
  new Editor({ extensions: novaDocumentExtensions, content });

describe("Nova document model", () => {
  it("round trips structured JSON without changing formatting", () => {
    const editor = makeEditor();
    const before = editor.getJSON();
    const reloaded = parseDocument(serializeDocument(before));
    const second = makeEditor(reloaded).getJSON();

    expect(second).toEqual(before);
    expect(JSON.stringify(second)).toBe(JSON.stringify(before));

    // formatting marks and node types survive
    const flat = JSON.stringify(second);
    expect(flat).toContain('"type":"bold"');
    expect(flat).toContain('"type":"italic"');
    expect(flat).toContain('"type":"link"');
    expect(flat).toContain('"type":"table"');
    expect(flat).toContain('"type":"image"');
    expect(flat).toContain('"type":"bulletList"');
    expect(flat).toContain('"type":"orderedList"');
    expect(flat).toContain('"type":"heading"');
    editor.destroy();
  });

  it("produces schema-valid JSON accepted by a fresh editor", () => {
    const editor = makeEditor();
    const json = parseDocument(serializeDocument(editor.getJSON()));
    const fresh = makeEditor(json);
    expect(fresh.schema.nodeFromJSON(json).type.name).toBe("doc");
    expect(fresh.getText()).toContain("Header A");
    editor.destroy();
    fresh.destroy();
  });

  it("rejects a payload that is not a Nova document envelope", () => {
    expect(() => parseDocument('{"hello":true}')).toThrow(/Nova document/);
    expect(() => parseDocument("not json")).toThrow();
  });

  it("applies bold and undo/redo through document transactions", () => {
    const editor = makeEditor({ type: "doc", content: [{ type: "paragraph" }] });
    editor.commands.setContent({ type: "doc", content: [{ type: "paragraph" }] });
    editor.commands.insertContent({ type: "text", text: "Nova text" });
    editor.commands.selectAll();
    editor.commands.toggleBold();

    const bolded = editor.getJSON();
    expect(JSON.stringify(bolded)).toContain('"type":"bold"');

    editor.commands.undo();
    expect(JSON.stringify(editor.getJSON())).not.toContain('"type":"bold"');

    editor.commands.redo();
    expect(editor.getJSON()).toEqual(bolded);
    editor.destroy();
  });

  it("never stores HTML as the canonical document", () => {
    const editor = makeEditor();
    const json = editor.getJSON();
    expect(json.type).toBe("doc");
    expect(Array.isArray(json.content)).toBe(true);
    expect(JSON.stringify(json)).not.toContain("contenteditable");
    editor.destroy();
  });
});
