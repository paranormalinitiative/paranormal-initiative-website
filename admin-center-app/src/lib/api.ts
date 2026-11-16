export type AdminOverview = {
  generatedAt: string;
  viewer?: { username?: string; role?: string };
  range?: { preset: string; start: string; end: string };
  metrics: Record<string, Record<string, unknown>>;
  trends: Record<string, Array<{ day: string; count: number }> | { unavailable: boolean }>;
};

export type AnalyticsPoint = { day: string; count: number };
export type AnalyticsUnavailable = { unavailable: true; reason?: string };
export type AnalyticsSeries = AnalyticsPoint[] | AnalyticsUnavailable;

export type AdminAnalytics = Pick<AdminOverview, "range" | "trends"> & {
  definitions?: Record<string, string>;
  series?: {
    memberGrowth?: { newMembers: AnalyticsSeries; totalMembers: AnalyticsSeries } | AnalyticsUnavailable;
    communityEngagement?: { posts: AnalyticsSeries; comments: AnalyticsSeries; reactions: AnalyticsSeries };
    creatorActivity?: { accounts: AnalyticsSeries; channels: AnalyticsSeries; publishedContent: AnalyticsSeries };
    moderation?: { available: boolean; reports: AnalyticsSeries };
  };
  summary?: {
    communityEngagement?: { posts: number; comments: number; reactions: number; range?: string };
    creatorActivity?: { accounts: number; channels: number; publishedContent: number; engagement?: { available?: boolean; unavailable?: boolean; reason?: string; videoReactions?: number | null; videoComments?: number | null } };
    moderation?: { available?: boolean; total: number; pending: number; resolved: number; dismissed: number };
    content?: Array<{ key: string; label: string; count: number }>;
  };
  membershipDistribution?: { available: boolean; source?: string; definition?: string; reason?: string; categories: Array<{ key: string; label: string; count: number }> };
  contentOverview?: Array<{ key: string; label: string; count: number }>;
  websiteActivity?: { unavailable: boolean; reason?: string };
};

export type Member = {
  username: string;
  displayName: string;
  title?: string;
  affiliation?: string;
  organization?: string;
  website?: string;
  bio?: string;
  photoUrl?: string;
  role: string;
  active: boolean;
  createdAt: string;
  topicCount: number;
  postCount: number;
  commentCount?: number;
};

export type MemberActivity = {
  member: Member & { can_post?: number; can_comment?: number; can_message?: number; correspondence?: string; contactName?: string; phone?: string };
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

export type SocialDestinationProvider = {
  provider: "facebook" | "youtube";
  label: string;
  configured: boolean;
  connected?: boolean;
  connectionCount?: number;
  scopes: string[];
  capabilities: {
    connect: boolean;
    publishLinks: boolean;
    startLivestream: boolean;
    stopLivestream: boolean;
    chat: boolean;
  };
};

export type SocialDestinationConnection = {
  id: string;
  provider: "facebook" | "youtube";
  providerAccountId: string;
  displayName: string;
  scopes: string[];
  capabilities: SocialDestinationProvider["capabilities"];
  status: string;
  tokenExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SocialDestinations = {
  providers: SocialDestinationProvider[];
  connections: SocialDestinationConnection[];
  hostedRelay: { state: string; startLivestream: boolean; stopLivestream: boolean; message: string };
  rumble: { state: string; startLivestream: string; stopLivestream: string; message: string };
};

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
  sourceType?: string;
  canManage?: boolean;
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
  reportType: "video" | "messenger" | "bug" | string;
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

export type AdminStaffDirectoryEntry = {
  id: string;
  username: string;
  displayName?: string;
  title?: string;
  accountRole: string;
  effectiveRole: string;
  roleLabel: string;
  rank: number;
  capabilities: string[];
  areas: Array<{ key: string; label: string; allowed: boolean }>;
  active: boolean;
  source: string;
  officeTitle?: string;
  appointment?: { id: string; status: string; reason?: string; appointedAt?: string; changedAt?: string } | null;
  createdAt: string;
};

export type AdminStaffHistory = {
  id: string;
  contributorId: string;
  username: string;
  displayName?: string;
  roleCode: string;
  officeTitle?: string;
  status: string;
  reason?: string;
  appointedAt?: string;
  changedAt?: string;
  changeNote?: string;
  changedBy?: string;
};

export type AdminStaffRoleDefinition = {
  code: string;
  label: string;
  rank: number;
  capabilities: string[];
  areas: Array<{ key: string; label: string; allowed: boolean }>;
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

export type AdminMembershipEntitlementRecord = {
  id: string;
  username: string;
  displayName?: string;
  title?: string;
  role: string;
  effectiveRole: string;
  effectiveRoleLabel: string;
  active: boolean;
  createdAt: string;
  capabilities: {
    creator: boolean;
    contributor: boolean;
    editorialReview: boolean;
    editorialPublish: boolean;
    canPost: boolean;
    canComment: boolean;
    canMessage: boolean;
  };
  creatorStudioAccess: boolean;
  foundingMemberships: Array<{ id: string; classCode: string; displayName: string; membershipNumber: string; state: string; issuedAt?: string }>;
  entitlementSources: Array<{ type: string; id: string; label: string; capabilities: string[] }>;
  entitlementSchemaPending: boolean;
  accountRestrictions: string[];
  activeModerationActions: Array<{ id: string; actionType: string; scope: string; reason: string; startsAt: string; expiresAt?: string | null; status: string }>;
  restricted: boolean;
  staffAppointment?: { id: string; roleCode: string; officeTitle?: string; status: string; reason?: string; appointedAt?: string; changedAt?: string } | null;
};

export type AdminMembershipEntitlements = {
  members: AdminMembershipEntitlementRecord[];
  totals: { returned: number; active: number; staff: number; creatorCapable: number; contributorCapable: number; creatorStudioAccess: number; restricted: number };
  metadataOnly: boolean;
  mutationBoundary: string;
  schema: { appointmentSchemaAvailable: boolean; moderationSchemaAvailable: boolean; entitlementSchemaAvailable: boolean };
  search: string;
  pagination: { page: number; pageSize: number; returned: number; total: number; totalPages: number };
};

export type AdminModerationAction = {
  id: string;
  memberId: string;
  memberUsername: string;
  memberName?: string;
  actorUsername?: string;
  actionType: "warning" | "temporary_restriction";
  scope: "posting" | "commenting" | "messaging" | "all_content";
  reason: string;
  sourceReportType?: string | null;
  sourceReportId?: string | null;
  startsAt: string;
  expiresAt?: string | null;
  status: "active" | "expired" | "revoked";
  revokedAt?: string | null;
  revocationNote?: string | null;
  createdAt: string;
};

export type AdminAppeal = {
  id: string;
  actionId: string;
  memberId: string;
  memberUsername: string;
  memberName?: string;
  actionType: "warning" | "temporary_restriction";
  scope: string;
  actionReason: string;
  startsAt: string;
  expiresAt?: string | null;
  statement: string;
  status: "pending" | "under_review" | "accepted" | "denied" | "withdrawn";
  reviewerUsername?: string | null;
  reviewedAt?: string | null;
  responseNote?: string | null;
  createdAt: string;
  updatedAt?: string;
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

// TPI-NOVA-004R6D: reviewer contract for the Editorial Review Queue. These
// reads require EDITORIAL_REVIEW; the UI never derives review authority from the
// admin role.
export type AdminAreaAccess = { key: string; label: string; route: string; allowed: boolean };
export type EditorialAccess = { role: string; editorialReview: boolean; editorialPublish: boolean; adminAccess: boolean; educationLeadershipAccess?: boolean; adminAreas?: AdminAreaAccess[] };

export type EditorialNovaNode = { type: string; text?: string; attrs?: { level?: number; href?: string }; content?: EditorialNovaNode[]; marks?: Array<{ type: string; attrs?: { href?: string } }> };
export type EditorialNovaDocument = { type: string; content?: EditorialNovaNode[] };

export type EditorialQueueRow = {
  articleId: string;
  title: string;
  destination: string;
  articleType: string;
  editorialStatus: string;
  contributorId: string;
  authorName?: string;
  contributorName?: string | null;
  contributorUsername?: string | null;
  submissionId: string;
  submittedAt: string;
  submittedNovaVersion: number;
  reviewerId?: string | null;
  reviewStartedAt?: string | null;
  reviewerName?: string | null;
  round: number;
};

export type EditorialEvent = {
  id: string;
  submissionId: string;
  actorId: string;
  eventType: string;
  fromState?: string | null;
  toState?: string | null;
  novaVersion?: number | null;
  note?: string | null;
  visibleToContributor: number;
  createdAt: string;
  actorName?: string | null;
};

export type EditorialSubmission = {
  id: string;
  submittedBy: string;
  submittedAt: string;
  submittedNovaVersion: number;
  submittedDestination: string;
  submittedArticleType: string;
  reviewerId?: string | null;
  reviewStartedAt?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  approvedNovaVersion?: number | null;
  outcome: string;
  supersededBy?: string | null;
  createdAt: string;
  reviewerName?: string | null;
  approverName?: string | null;
  round?: number | null;
  feedback?: EditorialEvent[];
};

export type EditorialSubmissionDetail = {
  article: {
    articleId: string;
    title: string;
    subtitle?: string | null;
    destination: string;
    articleType: string;
    authorName?: string | null;
    contributorId: string;
    novaItemId?: string | null;
    editorialStatus: string;
    publicationStatus?: string | null;
    updatedAt?: string | null;
    contributorName?: string | null;
    contributorUsername?: string | null;
  };
  currentSubmission: EditorialSubmission | null;
  history: EditorialSubmission[];
  events: EditorialEvent[];
  pinned: { version: number | null; title?: string | null; formatVersion?: number; content: EditorialNovaDocument | { format?: string; version?: number; doc?: EditorialNovaDocument } | null; source?: string; unavailable?: boolean; code?: string };
};

// TPI-NOVA-004R6E: Publisher contract. Reading the queue and publishing both
// require EDITORIAL_PUBLISH; the UI never infers it from the admin role, and the
// publication body is generated on the server from the approved Nova version.
export type EditorialPublicationRow = {
  articleId: string;
  title: string;
  destination: string;
  articleType: string;
  editorialStatus: string;
  publicationStatus?: string | null;
  publishedAt?: string | null;
  contributorId: string;
  contributorName?: string | null;
  contributorUsername?: string | null;
  submissionId: string;
  submittedAt: string;
  submittedNovaVersion: number;
  approvedNovaVersion: number | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  approverName?: string | null;
  round: number;
};

export type EditorialPublicationDetail = {
  article: {
    articleId: string;
    title: string;
    subtitle?: string | null;
    destination: string;
    articleType: string;
    authorName?: string | null;
    source?: string | null;
    labels?: string | null;
    href?: string | null;
    editorialStatus: string;
    publicationStatus: string;
    publishedAt?: string | null;
    publicBodyBytes: number;
    contributorId: string;
    contributorName?: string | null;
    contributorUsername?: string | null;
  };
  submission: {
    id: string;
    round: number;
    submittedBy: string;
    submittedAt: string;
    submittedNovaVersion: number;
    submittedDestination: string;
    submittedArticleType: string;
    approvedBy?: string | null;
    approvedAt?: string | null;
    approvedNovaVersion: number | null;
    approverName?: string | null;
  } | null;
  pinned: { version: number | null; title?: string | null; formatVersion?: number; content: EditorialNovaDocument | { format?: string; version?: number; doc?: EditorialNovaDocument } | null; source?: string; unavailable?: boolean; code?: string };
  currentNovaVersion: number | null;
  destinationMatches: boolean;
  articleTypeMatches: boolean;
  publishable: boolean;
  blocked: { code: string; fields?: string[] | null } | null;
};

export type EditorialPublicationResult = {
  articleId: string;
  editorialStatus: string;
  publicationStatus: string;
  published: boolean;
  publishedAt?: string | null;
  publicationBodyBytes: number;
  submissionId: string | null;
  approvedNovaVersion: number | null;
  publishedBy: string | null;
};
