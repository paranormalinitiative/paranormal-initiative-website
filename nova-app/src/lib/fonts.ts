export interface CustomFontRecord {
  id: string;
  family: string;
  fileName: string;
  format: "woff2" | "woff" | "truetype" | "opentype";
  bytes: number;
  createdAt: string;
}

interface StoredFont extends CustomFontRecord { buffer: ArrayBuffer; }
const DB_NAME = "tpi-nova-brand-fonts";
const STORE_NAME = "fonts";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error ?? new Error("The brand-font library could not be opened."));
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function storeRequest<T>(operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDatabase().then(database => new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const request = operation(transaction.objectStore(STORE_NAME));
    request.onerror = () => reject(request.error ?? new Error("The brand-font library request failed."));
    request.onsuccess = () => resolve(request.result);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error ?? new Error("The brand-font library transaction failed."));
  }));
}

export function normalizeFontFamily(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9 _-]/g, "").replace(/\s+/g, " ").slice(0, 80).trim();
}

export function fontFormat(fileName: string): CustomFontRecord["format"] | null {
  const extension = fileName.toLowerCase().split(".").pop();
  if (extension === "woff2") return "woff2";
  if (extension === "woff") return "woff";
  if (extension === "ttf") return "truetype";
  if (extension === "otf") return "opentype";
  return null;
}

export async function installCustomFont(font: StoredFont): Promise<void> {
  if (typeof FontFace === "undefined" || !document.fonts) return;
  const face = new FontFace(font.family, font.buffer, { style: "normal", weight: "100 900" });
  await face.load();
  document.fonts.add(face);
}

export async function installAllCustomFonts(): Promise<CustomFontRecord[]> {
  const records = await storeRequest<StoredFont[]>(store => store.getAll());
  await Promise.all(records.map(record => installCustomFont(record)));
  return records.map(({ buffer: _buffer, ...record }) => record).sort((a, b) => a.family.localeCompare(b.family));
}

export async function saveCustomFont(file: File, familyInput: string): Promise<CustomFontRecord> {
  const format = fontFormat(file.name);
  if (!format) throw new Error("Use a WOFF2, WOFF, TTF, or OTF font file.");
  const family = normalizeFontFamily(familyInput || file.name.replace(/\.[^.]+$/, ""));
  if (!family) throw new Error("Enter a name for this font.");
  const record: StoredFont = { id: crypto.randomUUID(), family, fileName: file.name, format, bytes: file.size, createdAt: new Date().toISOString(), buffer: await file.arrayBuffer() };
  await storeRequest(store => store.put(record));
  await installCustomFont(record);
  const { buffer: _buffer, ...metadata } = record;
  return metadata;
}

export async function deleteCustomFont(id: string): Promise<void> {
  await storeRequest(store => store.delete(id));
}
