import { useEffect, useReducer, type ReactNode } from "react";
import type { Editor } from "@tiptap/core";

interface Props {
  editor: Editor;
  disabled: boolean;
  onRequestLink: () => void;
}

interface ButtonProps {
  label: string;
  testId: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: ReactNode;
}

function ToolButton({ label, testId, onClick, active, disabled, title, children }: ButtonProps) {
  return (
    <button
      type="button"
      className={`nova-tool${active ? " is-active" : ""}`}
      aria-label={label}
      aria-pressed={active ? true : undefined}
      title={title ?? label}
      data-testid={testId}
      disabled={disabled}
      // Keep the editor selection: a toolbar control must never steal focus
      // before the command runs.
      onMouseDown={event => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({ editor, disabled, onRequestLink }: Props) {
  const [, refresh] = useReducer((value: number) => value + 1, 0);

  useEffect(() => {
    const update = () => refresh();
    editor.on("transaction", update);
    editor.on("selectionUpdate", update);
    return () => {
      editor.off("transaction", update);
      editor.off("selectionUpdate", update);
    };
  }, [editor]);

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

  const inTable = editor.isActive("table");

  return (
    <div className="nova-toolbar" role="toolbar" aria-label="Document formatting" data-testid="editor-toolbar">
      <div className="nova-tool-group">
        <ToolButton label="Undo" testId="toolbar-undo" disabled={disabled || !editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>↺</ToolButton>
        <ToolButton label="Redo" testId="toolbar-redo" disabled={disabled || !editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>↻</ToolButton>
      </div>

      <div className="nova-tool-group">
        <select
          className="nova-block-select"
          aria-label="Paragraph style"
          data-testid="block-type"
          value={block}
          disabled={disabled}
          onChange={event => setBlock(event.target.value)}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
      </div>

      <div className="nova-tool-group">
        <ToolButton label="Bold" testId="toolbar-bold" active={editor.isActive("bold")} disabled={disabled} onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></ToolButton>
        <ToolButton label="Italic" testId="toolbar-italic" active={editor.isActive("italic")} disabled={disabled} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></ToolButton>
        <ToolButton label="Underline" testId="toolbar-underline" active={editor.isActive("underline")} disabled={disabled} onClick={() => editor.chain().focus().toggleUnderline().run()}><span className="nova-underline-glyph">U</span></ToolButton>
      </div>

      <div className="nova-tool-group">
        <ToolButton label="Bulleted list" testId="toolbar-bullet-list" active={editor.isActive("bulletList")} disabled={disabled} onClick={() => editor.chain().focus().toggleBulletList().run()}>•≡</ToolButton>
        <ToolButton label="Numbered list" testId="toolbar-ordered-list" active={editor.isActive("orderedList")} disabled={disabled} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1≡</ToolButton>
        <ToolButton label="Quote" testId="toolbar-blockquote" active={editor.isActive("blockquote")} disabled={disabled} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</ToolButton>
        <ToolButton label="Divider" testId="toolbar-hr" disabled={disabled} onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</ToolButton>
      </div>

      <div className="nova-tool-group">
        <ToolButton label="Link" testId="toolbar-link" active={editor.isActive("link")} disabled={disabled} onClick={onRequestLink}>Link</ToolButton>
        <ToolButton label="Insert table" testId="toolbar-table" disabled={disabled} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Table</ToolButton>
      </div>

      {inTable ? (
        <div className="nova-tool-group nova-tool-group-table">
          <ToolButton label="Add row below" testId="toolbar-add-row" disabled={disabled} onClick={() => editor.chain().focus().addRowAfter().run()}>+Row</ToolButton>
          <ToolButton label="Add column right" testId="toolbar-add-column" disabled={disabled} onClick={() => editor.chain().focus().addColumnAfter().run()}>+Col</ToolButton>
          <ToolButton label="Delete row" testId="toolbar-delete-row" disabled={disabled} onClick={() => editor.chain().focus().deleteRow().run()}>−Row</ToolButton>
          <ToolButton label="Delete column" testId="toolbar-delete-column" disabled={disabled} onClick={() => editor.chain().focus().deleteColumn().run()}>−Col</ToolButton>
        </div>
      ) : null}
    </div>
  );
}
