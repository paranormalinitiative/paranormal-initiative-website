import type { NovaDocumentMeta } from "../lib/types";

interface Props {
  meta: NovaDocumentMeta;
  readOnly: boolean;
  onChange: (meta: NovaDocumentMeta) => void;
  onClose: () => void;
}

export function PageSetupPanel({ meta, readOnly, onChange, onClose }: Props) {
  const update = (patch: Partial<NovaDocumentMeta>) => onChange({ ...meta, ...patch });
  const updateMargins = (key: keyof NovaDocumentMeta["margins"], value: number) => onChange({ ...meta, margins: { ...meta.margins, [key]: Math.max(0, Math.min(72, value)) } });
  return <aside className="nova-document-comments nova-page-setup" aria-label="Page setup" data-testid="page-setup">
    <div className="nova-side-pane-heading"><div><strong>Page setup</strong><span>Document layout</span></div><button type="button" className="nova-icon-button" aria-label="Close page setup" onClick={onClose}>×</button></div>
    <label className="nova-field"><span>Paper size</span><select value={meta.pageSize} disabled={readOnly} onChange={event => update({ pageSize: event.target.value as NovaDocumentMeta["pageSize"] })}><option value="letter">Letter</option><option value="a4">A4</option><option value="legal">Legal</option></select></label>
    <label className="nova-field"><span>Orientation</span><select value={meta.orientation} disabled={readOnly} onChange={event => update({ orientation: event.target.value as NovaDocumentMeta["orientation"] })}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
    <fieldset className="nova-page-margins"><legend>Margins (px)</legend>{(["top", "right", "bottom", "left"] as const).map(key => <label key={key}><span>{key}</span><input type="number" min="0" max="72" value={meta.margins[key]} disabled={readOnly} onChange={event => updateMargins(key, Number(event.target.value) || 0)} /></label>)}</fieldset>
    <label className="nova-field"><span>Header</span><input value={meta.header} disabled={readOnly} onChange={event => update({ header: event.target.value })} placeholder="Optional header" /></label>
    <label className="nova-field"><span>Footer</span><input value={meta.footer} disabled={readOnly} onChange={event => update({ footer: event.target.value })} placeholder="Optional footer" /></label>
    <label className="nova-checkbox"><input type="checkbox" checked={meta.showPageNumbers} disabled={readOnly} onChange={event => update({ showPageNumbers: event.target.checked })} /> Show page numbers</label>
  </aside>;
}
