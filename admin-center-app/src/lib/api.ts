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
  reactionActivity: Array<{ id: string; targetType: string; targetId: string; reaction: string; label?: string; contentHref?: string; createdAt: string }>;
  reports: Array<{ id: string; reportType: string; contentType?: string; contentId?: string; contentLabel?: string; reason: string; description?: string; status: string; createdAt: string; reviewedAt?: string; memberRelation?: string; evidenceNote?: string }>;
  moderationHistory: Array<{ id: string; action: string; actorUsername: string; actorRole: string; targetType?: string; targetId?: string; metadata?: Record<string, unknown>; createdAt: string }>;
  activityPagination?: { page: number; pageSize: number; hasMore: Record<string, boolean> };
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

export type AdminTeam = {
  id: string;
  name: string;
  acronym?: string;
  scope?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  description?: string;
  createdAt: string;
  recordType?: string;
  verificationStatus?: string;
  status: "pending" | "approved" | "rejected";
  submitterName?: string;
  submitterEmail?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  externalId?: string;
  externalSource?: string;
  claimedAt?: string;
  claimedBy?: string;
};

export type AdminContributor = {
  username: string;
  displayName: string;
  title?: string;
  role: string;
  affiliation?: string;
  organization?: string;
  website?: string;
  active: boolean;
  createdAt: string;
};

export type AdminInvite = {
  code: string;
  role: string;
  used: boolean | number;
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
};

export type AdminScraperRun = {
  id: string;
  scraperType: string;
  source?: string;
  trigger?: string;
  startedAt?: string;
  completedAt?: string;
  status: string;
  found?: number;
  inserted?: number;
  skipped?: number;
  errorCount?: number;
  errorMessage?: string;
  durationMs?: number;
};

export type AdminProviderStatus = { key: string; label: string; state: string };

export type AdminCreatorMembership = {
  id: string;
  membershipType: string;
  membershipState: string;
  entitlementCode?: string;
  founding50Slot?: string;
  awardedAt?: string;
  createdAt?: string;
  username: string;
  displayName?: string;
  role: string;
  active: boolean | number;
  creatorStudioEntitlementState?: string;
};

export type AdminCreatorEntitlement = {
  id: string;
  entitlementCode?: string;
  entitlementState: string;
  grantedAt?: string;
  revokedAt?: string;
  username: string;
  displayName?: string;
  role: string;
  active: boolean | number;
};

export type AdminFoundingApplication = {
  id: string;
  status: string;
  administrativeNotes?: string;
  createdAt?: string;
  reviewedAt?: string;
  username: string;
  displayName?: string;
  role: string;
  active: boolean | number;
};

export type AdminPublishedArticle = {
  id: string;
  title: string;
  destination?: string;
  contributionType?: string;
  author?: string;
  authorDisplayName?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminPublishedVideo = {
  id: string;
  title: string;
  category?: string;
  sourceType?: string;
  channelName?: string;
  publishedAt?: string;
  status: string;
  viewingAccess?: string;
};

export type AdminEventRecord = {
  id?: string | number;
  title: string;
  type?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  city?: string;
  state?: string;
  country?: string;
  status?: string;
};

export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, { credentials: "same-origin", headers: { "Content-Type": "application/json", ...(init?.headers || {}) }, ...init });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Administration request failed (${response.status}).`);
  return body as T;
}

export function metricValue(metrics: AdminOverview["metrics"], section: string, key: string) {
  const value = metrics?.[section]?.[key];
  if (metrics?.[section]?.unavailable) return "Unavailable";
  return typeof value === "number" ? value.toLocaleString() : value == null ? "—" : String(value);
}
