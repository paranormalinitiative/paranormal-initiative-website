import type { Editor } from "@tiptap/core";
import { GenOfficeRibbon } from "./GenOfficeRibbon";

interface Props {
  editor: Editor;
  disabled: boolean;
  onRequestLink: () => void;
  documentTitle?: string;
}

export function EditorToolbar({ editor, disabled, onRequestLink, documentTitle = "" }: Props) {
  return <div data-testid="editor-toolbar"><GenOfficeRibbon editor={editor} disabled={disabled} onRequestLink={onRequestLink} documentTitle={documentTitle} /></div>;
}
