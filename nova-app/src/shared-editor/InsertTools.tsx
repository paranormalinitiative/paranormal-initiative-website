import { useState } from "react";
import type { Editor } from "@tiptap/core";
import { Bookmark, CalendarDays } from "lucide-react";
import { createBookmark, listBookmarks, navigateBookmark, removeBookmark } from "./commands/bookmarks";
import { insertField } from "./commands/fields";
import { FIELD_TYPES } from "./bookmarkFieldExtensions";

// Bookmark and field controls for the shared Insert group. Each action calls a
// command, so validation and the single-transaction rule live in one place.
// Controls are disabled when the editor is read-only, except navigation.

interface Props {
  editor: Editor;
  disabled: boolean;
  documentTitle: string;
}

export function InsertTools({ editor, disabled, documentTitle }: Props) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [fieldType, setFieldType] = useState<(typeof FIELD_TYPES)[number]>("DATE");
  const bookmarks = listBookmarks(editor);

  const report = (result: { ok: boolean; reason?: string }) => {
    setMessage(result.ok ? "" : (result.reason ?? "That action could not be completed."));
    return result.ok;
  };

  return (
    <>
      <div className="nova-tool-group" role="group" aria-label="Bookmarks">
        <input
          type="text"
          className="nova-bookmark-input"
          aria-label="Bookmark name"
          title="Bookmark name"
          placeholder="Bookmark name"
          data-testid="bookmark-name"
          value={name}
          disabled={disabled}
          onChange={event => setName(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (report(createBookmark(editor, name))) setName("");
            }
          }}
        />
        <button
          type="button"
          className="nova-tool"
          aria-label="Add bookmark at cursor"
          title="Add bookmark at cursor"
          data-testid="bookmark-add"
          disabled={disabled}
          onMouseDown={event => event.preventDefault()}
          onClick={() => { if (report(createBookmark(editor, name))) setName(""); }}
        >
          <Bookmark size={16} strokeWidth={1.9} aria-hidden="true" focusable="false" />
        </button>
        <select
          className="nova-block-select"
          aria-label="Go to bookmark"
          title="Go to bookmark"
          data-testid="bookmark-go"
          value=""
          onChange={event => { if (event.target.value) report(navigateBookmark(editor, event.target.value)); }}
        >
          <option value="">Go to bookmark</option>
          {bookmarks.map(bookmark => <option key={bookmark} value={bookmark}>{bookmark}</option>)}
        </select>
        <select
          className="nova-block-select"
          aria-label="Remove bookmark"
          title="Remove bookmark"
          data-testid="bookmark-remove"
          value=""
          disabled={disabled}
          onChange={event => { if (event.target.value) report(removeBookmark(editor, event.target.value)); }}
        >
          <option value="">Remove bookmark</option>
          {bookmarks.map(bookmark => <option key={bookmark} value={bookmark}>{bookmark}</option>)}
        </select>
      </div>

      <div className="nova-tool-group" role="group" aria-label="Fields">
        <select
          className="nova-block-select"
          aria-label="Field type"
          title="Field type"
          data-testid="field-type"
          value={fieldType}
          disabled={disabled}
          onChange={event => setFieldType(event.target.value as (typeof FIELD_TYPES)[number])}
        >
          {FIELD_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <button
          type="button"
          className="nova-tool"
          aria-label={`Insert ${fieldType} field`}
          title={`Insert ${fieldType} field`}
          data-testid="field-insert"
          disabled={disabled}
          onMouseDown={event => event.preventDefault()}
          onClick={() => report(insertField(editor, fieldType, documentTitle))}
        >
          <CalendarDays size={16} strokeWidth={1.9} aria-hidden="true" focusable="false" />
        </button>
      </div>

      {message ? <p className="nova-tool-message" role="alert" data-testid="insert-message">{message}</p> : null}
    </>
  );
}
