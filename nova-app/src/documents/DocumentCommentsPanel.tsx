import { useState } from "react";
import type { NovaDocumentComment } from "../lib/types";

interface Props {
  comments: NovaDocumentComment[];
  readOnly: boolean;
  selectedQuote: string;
  onAdd: (comment: NovaDocumentComment) => void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function DocumentCommentsPanel({ comments, readOnly, selectedQuote, onAdd, onResolve, onDelete, onClose }: Props) {
  const [text, setText] = useState("");
  const add = () => {
    const trimmed = text.trim();
    if (!trimmed || readOnly) return;
    onAdd({ id: crypto.randomUUID(), quote: selectedQuote || "Document selection", text: trimmed, author: "Local Administrator", createdAt: new Date().toISOString(), resolved: false });
    setText("");
  };
  return <aside className="nova-document-comments" aria-label="Document comments" data-testid="document-comments">
    <div className="nova-side-pane-heading"><div><strong>Comments</strong><span>{comments.filter(comment => !comment.resolved).length} open</span></div><button type="button" className="nova-icon-button" aria-label="Close comments" onClick={onClose}>×</button></div>
    <label className="nova-field"><span>New comment</span><textarea value={text} disabled={readOnly} onChange={event => setText(event.target.value)} placeholder="Add an editorial comment…" /></label>
    <button type="button" className="nova-button nova-button-primary" disabled={readOnly || !text.trim()} onClick={add}>Add comment</button>
    <div className="nova-comments-list">
      {comments.length === 0 ? <p className="nova-meta-text">No comments yet. Select text before adding one to keep the discussion anchored.</p> : comments.map(comment => <article key={comment.id} className={`nova-comment${comment.resolved ? " is-resolved" : ""}`}>
        <small>{comment.author} · {new Date(comment.createdAt).toLocaleString()}</small>
        <blockquote>{comment.quote}</blockquote>
        <p>{comment.text}</p>
        <div className="nova-comment-actions"><button type="button" className="nova-button nova-button-small" onClick={() => onResolve(comment.id)}>{comment.resolved ? "Reopen" : "Resolve"}</button><button type="button" className="nova-button nova-button-small nova-button-danger-quiet" disabled={readOnly} onClick={() => onDelete(comment.id)}>Delete</button></div>
      </article>)}
    </div>
  </aside>;
}
