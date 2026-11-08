import { useMemo, useState } from "react";
import type { Editor } from "@tiptap/core";
import { X } from "lucide-react";

interface Props {
  editor: Editor;
  onClose: () => void;
}

function textMatches(editor: Editor, query: string, caseSensitive: boolean): Array<{ from: number; to: number }> {
  const needle = caseSensitive ? query : query.toLocaleLowerCase();
  if (!needle) return [];
  const matches: Array<{ from: number; to: number }> = [];
  editor.state.doc.descendants((node, position) => {
    if (!node.isText || !node.text) return;
    const source = caseSensitive ? node.text : node.text.toLocaleLowerCase();
    let offset = 0;
    while (offset < source.length) {
      const index = source.indexOf(needle, offset);
      if (index < 0) break;
      matches.push({ from: position + index, to: position + index + needle.length });
      offset = index + Math.max(needle.length, 1);
    }
  });
  return matches;
}

export function FindReplacePanel({ editor, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const matches = useMemo(() => textMatches(editor, query, caseSensitive), [editor, query, caseSensitive, editor.state.doc]);

  const findNext = () => {
    if (!matches.length) return;
    const head = editor.state.selection.head;
    const next = matches.find(match => match.from > head) || matches[0];
    editor.chain().focus().setTextSelection(next).scrollIntoView().run();
  };

  const replaceCurrent = () => {
    const selection = editor.state.selection;
    if (!query || selection.from === selection.to) return findNext();
    const selected = editor.state.doc.textBetween(selection.from, selection.to, "\n");
    const expected = caseSensitive ? query : query.toLocaleLowerCase();
    if ((caseSensitive ? selected : selected.toLocaleLowerCase()) !== expected) return findNext();
    editor.chain().focus().insertContentAt({ from: selection.from, to: selection.to }, replacement).run();
    findNext();
  };

  const replaceAll = () => {
    if (!query || !matches.length) return;
    const transaction = editor.state.tr;
    [...matches].reverse().forEach(match => transaction.insertText(replacement, match.from, match.to));
    editor.view.dispatch(transaction);
    editor.commands.focus();
  };

  return <section className="nova-find-panel" aria-label="Find and replace">
    <label><span>Find</span><input autoFocus value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); findNext(); } }} /></label>
    <label><span>Replace with</span><input value={replacement} onChange={event => setReplacement(event.target.value)} /></label>
    <label className="nova-find-check"><input type="checkbox" checked={caseSensitive} onChange={event => setCaseSensitive(event.target.checked)} /><span>Match case</span></label>
    <span className="nova-find-count">{query ? `${matches.length} match${matches.length === 1 ? "" : "es"}` : "Type a search term"}</span>
    <button type="button" className="nova-button nova-button-small" onClick={findNext}>Find next</button>
    <button type="button" className="nova-button nova-button-small" onClick={replaceCurrent} disabled={!matches.length}>Replace</button>
    <button type="button" className="nova-button nova-button-small" onClick={replaceAll} disabled={!matches.length}>Replace all</button>
    <button type="button" className="nova-icon-button" aria-label="Close find and replace" title="Close find and replace" onClick={onClose}><X size={15} /></button>
  </section>;
}
