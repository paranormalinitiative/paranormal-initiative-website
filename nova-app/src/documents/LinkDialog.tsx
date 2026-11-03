import { useEffect, useState } from "react";
import { Modal } from "./Modal";

interface Props {
  open: boolean;
  initialUrl: string;
  hasExistingLink: boolean;
  onApply: (url: string | null) => void;
  onClose: () => void;
}

function normalizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return null;
}

export function LinkDialog({ open, initialUrl, hasExistingLink, onApply, onClose }: Props) {
  const [value, setValue] = useState(initialUrl);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setValue(initialUrl);
      setError("");
    }
  }, [open, initialUrl]);

  const submit = () => {
    const normalized = normalizeUrl(value);
    if (!normalized) {
      setError("Enter a web address, email link, or a path beginning with /.");
      return;
    }
    onApply(normalized);
  };

  return (
    <Modal
      open={open}
      title={hasExistingLink ? "Edit link" : "Add link"}
      description="Links open in a new tab and are stored as a structured link mark, not HTML."
      onClose={onClose}
      testId="link-dialog"
      footer={
        <>
          {hasExistingLink ? (
            <button
              type="button"
              className="nova-button nova-button-danger-quiet"
              data-testid="link-remove"
              onClick={() => onApply(null)}
            >
              Remove link
            </button>
          ) : null}
          <span className="nova-spacer" />
          <button type="button" className="nova-button" onClick={onClose}>Cancel</button>
          <button type="button" className="nova-button nova-button-primary" data-testid="link-apply" onClick={submit}>
            Apply link
          </button>
        </>
      }
    >
      <label className="nova-field">
        <span>Link address</span>
        <input
          type="text"
          data-testid="link-input"
          value={value}
          placeholder="https://example.com"
          onChange={event => { setValue(event.target.value); setError(""); }}
          onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); submit(); } }}
        />
      </label>
      {error ? <p className="nova-field-error" role="alert">{error}</p> : null}
    </Modal>
  );
}
