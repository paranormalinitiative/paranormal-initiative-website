const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

const shortFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return dateFormatter.format(date);
}

export function formatShortTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const now = Date.now();
  const diff = now - date.getTime();
  if (diff >= 0 && diff < 60_000) return "Just now";
  if (diff >= 0 && diff < 3_600_000) {
    const minutes = Math.max(1, Math.round(diff / 60_000));
    return `${minutes} min ago`;
  }
  return shortFormatter.format(date);
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function statusLabel(status: string): string {
  if (status === "archived") return "Archived";
  if (status === "trash") return "Trash";
  return "Active";
}
