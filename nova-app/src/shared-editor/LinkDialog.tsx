import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { validateLinkHref } from "./commands/validation";

interface Props {
  open: boolean;
  initialUrl: string;
  hasExistingLink: boolean;
  onApply: (url: string | null) => void;
  onClose: () => void;
}

// Bare domains get https://. Every other value goes through the same validator
// the command layer uses, so the dialog cannot accept what a command refuses.
function normalizeUrl(value: string): { ok: true; href: string } | { ok: false; reason: string } {
  const trimmed = value.trim();
  const candidate = /^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(trimmed) && !/^(https?:|mailto:|tel:)/i.test(trimmed) ? `https://${trimmed}` : trimmed;
  return validateLinkHref(candidate);
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
    const result = normalizeUrl(value);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    onApply(result.href);
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
