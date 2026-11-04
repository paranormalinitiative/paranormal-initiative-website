import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  testId?: string;
}

// A single Nova-styled dialog replaces window.confirm/window.prompt throughout
// the application. Escape closes it, and focus moves into the dialog when it
// opens so keyboard users are never stranded behind the overlay.
export function Modal({ title, description, open, onClose, children, footer, testId }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const target = cardRef.current?.querySelector<HTMLElement>("input, textarea, button, select");
    target?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="nova-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="nova-modal" role="dialog" aria-modal="true" aria-label={title} data-testid={testId} ref={cardRef}>
        <div className="nova-modal-head">
          <h2>{title}</h2>
          <button type="button" className="nova-icon-button" aria-label="Close dialog" onClick={onClose}>×</button>
        </div>
        {description ? <p className="nova-modal-description">{description}</p> : null}
        <div className="nova-modal-body">{children}</div>
        <div className="nova-modal-footer">{footer}</div>
      </div>
    </div>
  );
}
