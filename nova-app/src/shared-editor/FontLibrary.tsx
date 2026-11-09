import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Type, Trash2, Upload } from "lucide-react";
import { Modal } from "./Modal";
import { deleteCustomFont, installAllCustomFonts, saveCustomFont, type CustomFontRecord } from "../lib/fonts";

interface FontLibraryContextValue {
  fonts: CustomFontRecord[];
  addFont: (file: File, family: string) => Promise<void>;
  removeFont: (id: string) => Promise<void>;
}
const FontLibraryContext = createContext<FontLibraryContextValue | null>(null);

export function FontLibraryProvider({ children }: { children: ReactNode }) {
  const [fonts, setFonts] = useState<CustomFontRecord[]>([]);
  const refresh = async () => setFonts(await installAllCustomFonts());
  useEffect(() => { void refresh().catch(() => undefined); }, []);
  const addFont = async (file: File, family: string) => { await saveCustomFont(file, family); await refresh(); };
  const removeFont = async (id: string) => { await deleteCustomFont(id); await refresh(); };
  return <FontLibraryContext.Provider value={{ fonts, addFont, removeFont }}>{children}</FontLibraryContext.Provider>;
}

export function useFontLibrary(): FontLibraryContextValue {
  const value = useContext(FontLibraryContext);
  if (!value) throw new Error("FontLibraryProvider is missing.");
  return value;
}

export function FontLibraryButton() {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className="nova-font-library-button" onMouseDown={event => event.preventDefault()} onClick={() => setOpen(true)} title="Brand fonts" aria-label="Brand fonts"><Type size={15} aria-hidden="true" /><span>Brand fonts</span></button>
    <FontLibraryDialog open={open} onClose={() => setOpen(false)} />
  </>;
}

function FontLibraryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { fonts, addFont, removeFont } = useFontLibrary();
  const [file, setFile] = useState<File | null>(null);
  const [family, setFamily] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    if (!file || busy) return;
    setBusy(true); setError("");
    try { await addFont(file, family); setFile(null); setFamily(""); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "The font could not be added."); }
    finally { setBusy(false); }
  };
  return <Modal open={open} title="Brand fonts" description="Add a private font to this browser's Nova library. It becomes available in Documents and Slides on this device." onClose={onClose} testId="font-library-dialog" footer={<><span className="nova-spacer" /><button type="button" className="nova-button" onClick={onClose}>Close</button></>}>
    <div className="nova-font-library">
      <label className="nova-field"><span>Font file</span><input type="file" accept=".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf" onChange={event => { const selected = event.target.files?.[0] ?? null; setFile(selected); setFamily(selected?.name.replace(/\.[^.]+$/, "") ?? ""); setError(""); }} /></label>
      <label className="nova-field"><span>Font family name</span><input value={family} onChange={event => setFamily(event.target.value)} placeholder="e.g. TPI Display" /></label>
      <button type="button" className="nova-button nova-button-primary" disabled={!file || !family.trim() || busy} onClick={() => void submit()}><Upload size={15} /> {busy ? "Adding…" : "Add font"}</button>
      {error ? <p className="nova-field-error" role="alert">{error}</p> : null}
      <div className="nova-font-library-list" aria-label="Installed brand fonts"><strong>Installed fonts</strong>{fonts.length === 0 ? <span className="nova-muted">No custom fonts added yet.</span> : fonts.map(font => <div className="nova-font-library-row" key={font.id}><span style={{ fontFamily: font.family }}>{font.family}<small>{font.fileName}</small></span><button type="button" className="nova-icon-button" aria-label={`Remove ${font.family}`} onClick={() => void removeFont(font.id)}><Trash2 size={15} /></button></div>)}</div>
    </div>
  </Modal>;
}
