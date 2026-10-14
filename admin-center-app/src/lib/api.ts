export type AdminOverview = {
  generatedAt: string;
  viewer?: { username?: string; role?: string };
  range?: { preset: string; start: string; end: string };
  metrics: Record<string, Record<string, unknown>>;
  trends: Record<string, Array<{ day: string; count: number }> | { unavailable: boolean }>;
};

export type AdminAnalytics = Pick<AdminOverview, "range" | "trends"> & {
  definitions?: Record<string, string>;
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

export type AdminCommunityComment = {
  id: string;
  postId: string;
  preview?: string;
  status: string;
  createdAt: string;
  postTitle?: string;
  postStatus?: string;
  authorUsername?: string;
  authorDisplayName?: string;
};

export type AdminCommunityCommentDetail = {
  comment: AdminCommunityComment & {
    body: string;
    updatedAt?: string;
    authorRole?: string;
    postBody?: string;
  };
  reactions: Array<{ id: string; reaction: string; createdAt?: string; contributorUsername?: string; contributorDisplayName?: string }>;
  replies: AdminCommunityComment[];
  repliesAvailable: boolean;
  repliesNote?: string;
  reports: AdminReport[];
  reportsAvailable: boolean;
  reportsNote?: string;
};

export type AdminCommunityPostDetail = {
  post: CommunityPost & {
    body: string;
    updatedAt?: string;
    categoryTitle?: string;
    authorRole?: string;
  };
  comments: Array<AdminCommunityComment>;
  reactions: Array<{ id: string; reaction: string; createdAt?: string; contributorUsername?: string; contributorDisplayName?: string }>;
  reports: Array<AdminReport>;
  reportsAvailable: boolean;
  reportsNote?: string;
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

export type AdminTeamClaim = {
  id: string;
  teamId: string;
  claimantId: string;
  claimantName?: string;
  claimantEmail?: string;
  claimantRole?: string;
  evidenceUrl?: string;
  evidenceDescription?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  teamName?: string;
  recordType?: string;
  verificationStatus?: string;
  teamClaimedBy?: string;
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
  contactEmail?: string;
  websiteUrl?: string;
  socialChannels?: string[];
  videoChannels?: string[];
  creatorDescription?: string;
  applicantId?: string;
  membershipId?: string;
  membershipState?: string;
  entitlementState?: string;
  readiness?: string;
  createdAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  username: string;
  displayName?: string;
  role: string;
  active: boolean | number;
};

export type AdminPublishedArticle = {
  id: string;
  title: string;
  destination?: string;
  href?: string;
  subtitle?: string;
  contributionType?: string;
  author?: string;
  authorUsername?: string;
  authorDisplayName?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  bodyHtml?: string;
  articleHtml?: string;
  source?: string;
  labels?: string;
};

export type AdminArticleDetail = {
  article: AdminPublishedArticle;
  history: Array<{ id: string; actorUsername: string; actorRole: string; action: string; targetType?: string; targetId?: string; metadata?: Record<string, unknown>; createdAt: string }>;
};

export type AdminPublishedVideo = {
  id: string;
  slug?: string;
  title: string;
  category?: string;
  sourceType?: string;
  channelName?: string;
  videoUrl?: string;
  thumbnail?: string;
  publishedAt?: string;
  status: string;
  viewingAccess?: string;
  description?: string;
  tags?: string[];
  platform?: string;
  embedUrl?: string;
  featured?: boolean;
  isLive?: boolean;
  format?: string;
  creator?: { username?: string; displayName?: string; title?: string } | null;
  createdAt?: string;
  updatedAt?: string;
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

export type AdminReport = {
  id: string;
  reportType: "video" | "messenger" | string;
  contentType?: string;
  contentId?: string;
  contentLabel?: string;
  reason: string;
  status: string;
  reporterUsername?: string;
  reporterName?: string;
  reportedUsername?: string;
  reportedName?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  evidenceNote?: string;
};

export type AdminReportDetail = {
  report: AdminReport;
  history: Array<{ id: string; actorUsername: string; actorRole: string; action: string; targetType?: string; targetId?: string; metadata?: Record<string, unknown>; createdAt: string }>;
  privateEvidence: boolean;
  metadataOnly: boolean;
};

export type AdminNotification = {
  id: string;
  title: string;
  type: string;
  readAt?: string;
  createdAt: string;
  recipientUsername?: string;
  recipientName?: string;
  createdByUsername?: string;
  canMutate?: boolean | number;
  body?: string;
  actionHref?: string;
};

export type AdminNotificationDetail = {
  notification: AdminNotification;
  metadataOnly?: boolean;
  privateContentBoundary?: string;
};

export type AdminTeamHistory = {
  team: { id: string; name: string; status: string; verificationStatus?: string; reviewedAt?: string; reviewedBy?: string };
  verificationEvents: Array<{ id: string | number; status: string; evidenceUrl?: string; evidenceType?: string; evidenceDescription?: string; lastApparentActivity?: string; confidence?: string; verifier?: string; notes?: string; createdAt: string }>;
  claims: AdminTeamClaim[];
  auditLogs: Array<{ id: string; actorUsername: string; actorRole: string; action: string; targetType?: string; targetId?: string; metadata?: Record<string, unknown>; createdAt: string }>;
};

export type AdminCreatorDetail = {
  creator: { id: string; username: string; displayName: string; role: string; active: boolean | number; title?: string; organization?: string; website?: string; createdAt?: string };
  memberships: Array<AdminCreatorMembership & { updatedAt?: string; notes?: string }>;
  entitlements: Array<AdminCreatorEntitlement & { createdAt?: string; updatedAt?: string }>;
  applications: Array<AdminFoundingApplication & { administrativeNotes?: string; updatedAt?: string }>;
  channels: Array<AdminChannel & { description?: string }>;
  history: Array<{ id: string; actorUsername: string; actorRole: string; action: string; targetType?: string; targetId?: string; metadata?: Record<string, unknown>; createdAt: string }>;
};

export type AdminChannel = {
  id: string;
  slug: string;
  displayName: string;
  visibility: "public" | "private" | string;
  createdAt: string;
  updatedAt: string;
  ownerUsername?: string;
  ownerName?: string;
  publishedVideoCount?: number;
};

export type AdminRoleSummary = {
  role: string;
  total: number;
  active: number;
  canPost: number;
  canComment: number;
  canMessage: number;
};

export type AdminRestriction = {
  username: string;
  displayName: string;
  title?: string;
  role: string;
  active: boolean;
  canPost: boolean;
  canComment: boolean;
  canMessage: boolean;
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
  if (metrics?.[section]?.unavailable) return "Unavailable";
  return typeof value === "number" ? value.toLocaleString() : value == null ? "—" : String(value);
}
