export type AdminOverview = {
  generatedAt: string;
  viewer?: { username?: string; role?: string };
  range?: { preset: string; start: string; end: string };
  metrics: Record<string, Record<string, unknown>>;
  trends: Record<string, Array<{ day: string; count: number }> | { unavailable: boolean }>;
};

export type Member = {
  username: string;
  displayName: string;
  title?: string;
  role: string;
  active: boolean;
  createdAt: string;
  topicCount: number;
  postCount: number;
  commentCount?: number;
};

export type MemberActivity = {
  member: Member & { can_post?: number; can_comment?: number; can_message?: number };
  posts: Array<{ id: string; body: string; status: string; createdAt: string }>;
  comments: Array<{ id: string; body?: string; text?: string; status: string; createdAt: string }>;
  tpiVideos: Array<{ id: string; title: string; status: string; createdAt: string }>;
  articles: Array<{ id: string; title: string; status: string; createdAt: string }>;
  videoComments?: Array<{ id: string; body?: string; status: string; createdAt: string }>;
};

export type CommunityPost = {
  id: string;
  title?: string;
  preview?: string;
  status: string;
  createdAt: string;
  authorUsername?: string;
  authorDisplayName?: string;
  categoryTitle?: string;
  commentCount: number;
  reactionCount: number;
};

export type ClassicComment = {
  id: string;
  pageId?: string;
  name?: string;
  authorUsername?: string;
  text?: string;
  status: string;
  createdAt: string;
};

export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, { credentials: "same-origin", headers: { "Content-Type": "application/json", ...(init?.headers || {}) }, ...init });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Administration request failed (${response.status}).`);
  return body as T;
}

export function metricValue(metrics: AdminOverview["metrics"], section: string, key: string) {
  const value = metrics?.[section]?.[key];
  return typeof value === "number" ? value.toLocaleString() : value == null ? "—" : String(value);
}
