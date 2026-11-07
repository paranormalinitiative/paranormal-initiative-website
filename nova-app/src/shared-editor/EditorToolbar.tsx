import { useEffect, useReducer, type ReactNode } from "react";
import type { Editor } from "@tiptap/core";
import { InsertTools } from "./InsertTools";
import { refreshFieldDisplays } from "./commands/fields";
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Rows3,
  Columns3,
  Table,
  Trash2,
  Underline,
  Undo2,
  type LucideIcon
} from "lucide-react";

interface Props {
  editor: Editor;
  disabled: boolean;
  onRequestLink: () => void;
  documentTitle?: string;
}

interface ButtonProps {
  label: string;
  testId: string;
  icon: LucideIcon;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

function ToolButton({ label, testId, icon: Icon, onClick, active, disabled }: ButtonProps) {
  return (
    <button
      type="button"
      className={`nova-tool${active ? " is-active" : ""}`}
      aria-label={label}
      aria-pressed={active ? true : undefined}
      title={label}
      data-testid={testId}
      disabled={disabled}
      // Keep the editor selection: a toolbar control must never steal focus
      // before the command runs.
      onMouseDown={event => event.preventDefault()}
      onClick={onClick}
    >
      <Icon size={16} strokeWidth={1.9} aria-hidden="true" focusable="false" />
    </button>
  );
}

function ToolGroup({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`nova-tool-group${className ? ` ${className}` : ""}`} role="group" aria-label={label}>
      {children}
    </div>
  );
}

export function EditorToolbar({ editor, disabled, onRequestLink, documentTitle = "" }: Props) {
  const [, refresh] = useReducer((value: number) => value + 1, 0);

  useEffect(() => {
    let fieldRefreshTimer: number | undefined;
    const scheduleFieldRefresh = () => {
      if (fieldRefreshTimer !== undefined) window.clearTimeout(fieldRefreshTimer);
      fieldRefreshTimer = window.setTimeout(() => {
        fieldRefreshTimer = undefined;
        refreshFieldDisplays(editor, documentTitle);
      }, 0);
    };
    const update = () => {
      refresh();
      scheduleFieldRefresh();
    };
    editor.on("transaction", update);
    editor.on("selectionUpdate", update);
    scheduleFieldRefresh();
    return () => {
      if (fieldRefreshTimer !== undefined) window.clearTimeout(fieldRefreshTimer);
      editor.off("transaction", update);
      editor.off("selectionUpdate", update);
    };
  }, [editor, documentTitle]);

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
      <ToolGroup label="History">
        <ToolButton label="Undo" testId="toolbar-undo" icon={Undo2} disabled={disabled || !editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
        <ToolButton label="Redo" testId="toolbar-redo" icon={Redo2} disabled={disabled || !editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
      </ToolGroup>

      <ToolGroup label="Style">
        <select
          className="nova-block-select"
          aria-label="Paragraph style"
          title="Paragraph style"
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
      </ToolGroup>

      <ToolGroup label="Text">
        <ToolButton label="Bold" testId="toolbar-bold" icon={Bold} active={editor.isActive("bold")} disabled={disabled} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolButton label="Italic" testId="toolbar-italic" icon={Italic} active={editor.isActive("italic")} disabled={disabled} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolButton label="Underline" testId="toolbar-underline" icon={Underline} active={editor.isActive("underline")} disabled={disabled} onClick={() => editor.chain().focus().toggleUnderline().run()} />
      </ToolGroup>

      <ToolGroup label="Paragraph">
        <ToolButton label="Bulleted list" testId="toolbar-bullet-list" icon={List} active={editor.isActive("bulletList")} disabled={disabled} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolButton label="Numbered list" testId="toolbar-ordered-list" icon={ListOrdered} active={editor.isActive("orderedList")} disabled={disabled} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolButton label="Quote" testId="toolbar-blockquote" icon={Quote} active={editor.isActive("blockquote")} disabled={disabled} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      </ToolGroup>

      <ToolGroup label="Insert">
        <ToolButton label="Link" testId="toolbar-link" icon={Link} active={editor.isActive("link")} disabled={disabled} onClick={onRequestLink} />
        <ToolButton label="Insert table" testId="toolbar-table" icon={Table} disabled={disabled} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
        <ToolButton label="Divider" testId="toolbar-hr" icon={Minus} disabled={disabled} onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      </ToolGroup>

      <InsertTools editor={editor} disabled={disabled} documentTitle={documentTitle} />

      {inTable ? (
        <ToolGroup label="Table" className="nova-tool-group-table">
          <ToolButton label="Add row below" testId="toolbar-add-row" icon={Rows3} disabled={disabled} onClick={() => editor.chain().focus().addRowAfter().run()} />
          <ToolButton label="Add column right" testId="toolbar-add-column" icon={Columns3} disabled={disabled} onClick={() => editor.chain().focus().addColumnAfter().run()} />
          <ToolButton label="Delete row" testId="toolbar-delete-row" icon={Trash2} disabled={disabled} onClick={() => editor.chain().focus().deleteRow().run()} />
          <ToolButton label="Delete column" testId="toolbar-delete-column" icon={Trash2} disabled={disabled} onClick={() => editor.chain().focus().deleteColumn().run()} />
        </ToolGroup>
      ) : null}
    </div>
  );
}
