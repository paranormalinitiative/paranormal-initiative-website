import { SESSION_COOKIE, getCookie, getSessionUser, hasCreatorStudioAccess } from "../../lib/auth.js";
import { scrapeAndUpdateEvents } from "../../lib/event-scraper.js";
import { scrapeNews } from "../../lib/news-scraper.js";
import { scrapeVideos, PROVIDER_STATUS } from "../../lib/video-scraper.js";
import { handleMemberLibrary, recordMemberUpload } from "../../lib/member-library.js";
import { handlePersonalization, handleSiteTheme, handlePublicStyle, handleBlockedUsers } from "../../lib/member-settings.js";
import { validateThumbnailUrl, validateVideoSource } from "../../lib/video-providers.js";
import { fetchExternalLinkPreview, isSafePreviewUrl } from "../../lib/link-preview.js";

export async function onRequest(context) {
  const { request, env, params } = context;
  const routePath = Array.isArray(params.path) ? params.path.join("/") : params.path || "";
  const path = `/${routePath}`;

  if (!env.TPI_DB) {
    return json({ error: "D1 database binding TPI_DB is not configured." }, 500);
  }

  try {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });
    if (request.method === "GET" && path === "/auth/me") return handleMe(request, env);
    if (path === "/me/personalization") return requireMember(request, env, user => handlePersonalization(request, env, user));
    if (request.method === "POST" && path === "/contributors/me/theme") return requireMember(request, env, user => handleSiteTheme(request, env, user));
    if (request.method === "GET" && path === "/profile-style") return handlePublicStyle(request, env);
    if (request.method === "GET" && path === "/me/blocked-users") return requireMember(request, env, user => handleBlockedUsers(request, env, user));
    if (path === "/me/library" || path.startsWith("/me/library/")) return requireMember(request, env, user => handleMemberLibrary(path, request, env, user));
    if (request.method === "POST" && path === "/uploads/library") return requireMember(request, env, user => handleMediaUpload(request, env, user, "private-library", "library", ["image/", "video/", "application/pdf", "text/plain", "text/csv", "application/json", "application/rtf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/zip", "application/octet-stream"]));
    if (request.method === "GET" && path === "/me/pulse") return requireMember(request, env, user => handleMyPulse(request, env, user));
    if (request.method === "POST" && path === "/auth/login") return handleLogin(request, env);
    if (request.method === "POST" && path === "/auth/logout") return handleLogout();
    if (request.method === "POST" && path === "/auth/password-reset/request") return handlePasswordResetRequest(request, env);
    if (request.method === "POST" && path === "/members/register") return handleMemberRegister(request, env);
    if (request.method === "POST" && path === "/owner/bootstrap") return handleOwnerBootstrap(request, env);
    if (request.method === "GET" && path === "/admin/overview") return requireAdmin(request, env, user => handleAdminOverview(request, env, user));
    if (request.method === "GET" && path === "/admin/analytics") return requireAdmin(request, env, user => handleAdminAnalytics(request, env, user));
    if (request.method === "GET" && path === "/admin/audit-logs") return requireAdmin(request, env, user => handleAdminAuditLogs(request, env, user));
    if (request.method === "GET" && path === "/admin/founding-50") return requireAdmin(request, env, user => handleAdminFounding50(env, user));
    if (request.method === "GET" && path === "/admin/founding-50/applications") return requireAdmin(request, env, user => handleAdminFounding50Applications(request, env, user));
    if (request.method === "POST" && path === "/admin/founding-50/applications") return requireAdmin(request, env, user => handleAdminCreateFounding50Application(request, env, user));
    if (request.method === "POST" && path.match(/^\/admin\/founding-50\/applications\/[^/]+\/status$/)) return requireAdmin(request, env, user => handleAdminFounding50ApplicationStatus(path, request, env, user));
    if (request.method === "POST" && path === "/admin/founding-50/allocate") return requireOwner(request, env, user => handleAdminAllocateFounding50(request, env, user));
    if (request.method === "POST" && path.match(/^\/admin\/founding-50\/memberships\/[^/]+\/status$/)) return requireOwner(request, env, user => handleAdminFounding50MembershipStatus(path, request, env, user));
    if (request.method === "GET" && path === "/admin/creator-partnership") return requireAdmin(request, env, user => handleAdminCreatorPartnership(request, env, user));
    if (request.method === "GET" && path.match(/^\/admin\/creators\/[^/]+$/)) return requireAdmin(request, env, user => handleAdminCreatorDetail(path, env, user));
    if (request.method === "GET" && path === "/admin/creator-studio/entitlements") return requireAdmin(request, env, user => handleAdminCreatorStudioEntitlements(request, env, user));
    if (request.method === "GET" && path === "/invites") return requireAdmin(request, env, user => handleListInvites(request, env, user));
    if (request.method === "POST" && path === "/invites") return requireAdmin(request, env, user => handleCreateInvite(request, env, user));
    if (request.method === "GET" && path === "/admin/contributors") return requireAdmin(request, env, user => handleListContributors(request, env, user));
    if (request.method === "POST" && path === "/admin/contributors/title") return requireAdmin(request, env, user => handleUpdateContributorTitle(request, env, user));
    if (request.method === "GET" && path === "/admin/members") return requireAdmin(request, env, user => handleAdminListMembers(request, env, user));
    if (request.method === "GET" && path.match(/^\/admin\/members\/[^/]+\/activity$/)) return requireAdmin(request, env, user => handleAdminMemberActivity(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/admin\/members\/[^/]+\/access$/)) return requireAdmin(request, env, user => handleAdminUpdateMemberAccess(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/admin\/members\/[^/]+\/notifications$/)) return requireAdmin(request, env, user => handleAdminSendMemberNotification(path, request, env, user));
    if (request.method === "POST" && path.startsWith("/admin/members/") && path.endsWith("/block")) return requireAdmin(request, env, user => handleAdminSetMemberActive(path, env, user, false));
    if (request.method === "POST" && path.startsWith("/admin/members/") && path.endsWith("/unblock")) return requireAdmin(request, env, user => handleAdminSetMemberActive(path, env, user, true));
    if (request.method === "GET" && path === "/admin/community/posts") return requireAdmin(request, env, user => handleAdminCommunityPosts(request, env, user));
    if (request.method === "GET" && path.match(/^\/admin\/community\/posts\/[^/]+$/)) return requireAdmin(request, env, user => handleAdminCommunityPostDetail(path, env, user));
    if (request.method === "GET" && path === "/admin/community/comments") return requireAdmin(request, env, user => handleAdminCommunityComments(request, env, user));
    if (request.method === "GET" && path.match(/^\/admin\/community\/comments\/[^/]+$/)) return requireAdmin(request, env, user => handleAdminCommunityCommentDetail(path, env, user));
    if (request.method === "POST" && path.match(/^\/admin\/community\/posts\/[^/]+\/status$/)) return requireAdmin(request, env, user => handleAdminSetCommunityPostStatus(path, request, env, user));
    if (request.method === "GET" && path === "/admin/comments") return requireAdmin(request, env, user => handleAdminListComments(request, env, user));
    if (request.method === "GET" && path === "/admin/articles") return requireAdmin(request, env, user => handleAdminArticles(request, env, user));
    if (request.method === "GET" && path.match(/^\/admin\/articles\/[^/]+$/)) return requireAdmin(request, env, user => handleAdminArticleDetail(path, env, user));
    if ((request.method === "PUT" || request.method === "PATCH") && path.match(/^\/admin\/articles\/[^/]+$/)) return requireAdmin(request, env, user => handleAdminArticleUpdate(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/admin\/articles\/[^/]+\/status$/)) return requireAdmin(request, env, user => handleAdminArticleStatus(path, request, env, user));
    if (request.method === "GET" && path === "/admin/reports") return requireAdmin(request, env, user => handleAdminReports(request, env, user));
    if (request.method === "GET" && path.match(/^\/admin\/reports\/(video|messenger)\/[^/]+$/)) return requireAdmin(request, env, user => handleAdminReportDetail(path, env, user));
    if (request.method === "POST" && path.match(/^\/admin\/reports\/(video|messenger)\/[^/]+\/status$/)) return requireAdmin(request, env, user => handleAdminReportStatus(path, request, env, user));
    if (request.method === "GET" && path === "/admin/notifications") return requireAdmin(request, env, user => handleAdminNotifications(request, env, user));
    if (request.method === "GET" && path.match(/^\/admin\/notifications\/[^/]+$/)) return requireAdmin(request, env, user => handleAdminNotificationDetail(path, env, user));
    if (request.method === "POST" && path.match(/^\/admin\/notifications\/[^/]+\/(read|unread)$/)) return requireAdmin(request, env, user => handleAdminNotificationState(path, env, user));
    if (request.method === "POST" && path === "/admin/notifications/read-all") return requireAdmin(request, env, user => handleAdminMarkAllNotificationsRead(env, user));
    if (request.method === "GET" && path === "/admin/channels") return requireAdmin(request, env, user => handleAdminChannels(request, env, user));
    if (request.method === "GET" && path === "/admin/roles") return requireAdmin(request, env, user => handleAdminRoles(request, env, user));
    if (request.method === "GET" && path === "/admin/restrictions") return requireAdmin(request, env, user => handleAdminRestrictions(request, env, user));
    if (request.method === "GET" && path === "/admin/events") return requireAdmin(request, env, user => handleAdminEvents(request, env, user));
    if (request.method === "GET" && path.match(/^\/admin\/events\/[^/]+$/)) return requireAdmin(request, env, user => handleAdminEventDetail(path, env, user));
    if ((request.method === "PUT" || request.method === "PATCH") && path.match(/^\/admin\/events\/[^/]+$/)) return requireAdmin(request, env, user => handleAdminEventUpdate(path, request, env, user));
    if (request.method === "DELETE" && path.match(/^\/admin\/events\/[^/]+$/)) return requireAdmin(request, env, user => handleAdminEventCancel(path, env, user));
    if (request.method === "POST" && path.startsWith("/admin/comments/") && path.endsWith("/approve")) return requireAdmin(request, env, user => handleAdminApproveComment(path, env, user));
    if (request.method === "DELETE" && path.startsWith("/admin/comments/")) return requireAdmin(request, env, user => handleAdminDeleteComment(path, env, user));
    if (request.method === "GET" && path === "/admin/settings") return requireAdmin(request, env, user => handleAdminGetSettings(env, user));
    if (request.method === "POST" && path === "/admin/settings") return requireAdmin(request, env, user => handleAdminUpdateSettings(request, env, user));
    if (request.method === "POST" && path === "/invites/check") return handleCheckInvite(request, env);
    if (request.method === "POST" && path === "/contributors/register") return handleRegister(request, env);
    if (request.method === "POST" && path === "/contributors/me/profile") return requireMember(request, env, user => handleUpdateProfile(request, env, user));
    if (request.method === "POST" && path === "/contributors/me/username") return requireMember(request, env, user => handleUpdateUsername(request, env, user));
    if (request.method === "POST" && path === "/contributors/me/password") return requireMember(request, env, user => handleChangePassword(request, env, user));
    if (request.method === "GET" && path === "/contributors/me/articles") return requireContributor(request, env, user => handleContributorArticles(env, user));
    if (request.method === "GET" && path === "/notifications") return requireMember(request, env, user => handleListNotifications(env, user));
    if (request.method === "GET" && path === "/notifications/unread-count") return requireMember(request, env, user => handleNotificationUnreadCount(env, user));
    if (request.method === "POST" && path === "/notifications/read-all") return requireMember(request, env, user => handleMarkAllNotificationsRead(request, env, user));
    if (request.method === "GET" && path === "/notifications/preferences") return requireMember(request, env, user => handleGetNotificationPreferences(env, user));
    if (request.method === "POST" && path === "/notifications/preferences") return requireMember(request, env, user => handleSetNotificationPreferences(request, env, user));
    if (request.method === "POST" && path.match(/^\/notifications\/[^/]+\/read$/)) return requireMember(request, env, user => handleMarkNotificationRead(path, env, user));
    if (request.method === "GET" && path === "/contributors") return handleListPublicContributors(env);
    if (request.method === "GET" && path === "/contributors/profile") return handlePublicContributorProfile(request, env);
    if (request.method === "GET" && path === "/members/directory") return requireMember(request, env, user => handleMemberDirectory(request, env, user));
    if (request.method === "POST" && path === "/messenger/presence") return requireMember(request, env, user => handlePresenceHeartbeat(request, env, user));
    if (request.method === "GET" && path === "/conversations") return requireMember(request, env, user => handleListConversations(request, env, user));
    if (request.method === "POST" && path === "/conversations") return requireMember(request, env, user => handleCreateConversation(request, env, user));
    if (request.method === "GET" && path === "/conversations/unread-count") return requireMember(request, env, user => handleConversationUnreadCount(env, user));
    if (request.method === "GET" && path === "/admin/scraper-runs") return requireAdmin(request, env, user => handleAdminScraperRuns(request, env, user));
    if (request.method === "PUT" && path.match(/^\/conversations\/[^/]+\/members$/)) return requireMember(request, env, user => handleReplaceConversationMembers(path, request, env, user));
    if (request.method === "GET" && path.match(/^\/conversations\/[^/]+$/)) return requireMember(request, env, user => handleGetConversation(path, env, user));
    if (request.method === "GET" && path.match(/^\/conversations\/[^/]+\/messages$/)) return requireMember(request, env, user => handleListMessages(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/conversations\/[^/]+\/messages$/)) return requireMember(request, env, user => handleCreateMessage(path, request, env, user));
    if (request.method === "PUT" && path.match(/^\/conversations\/[^/]+\/messages\/[^/]+$/)) return requireMember(request, env, user => handleUpdateMessage(path, request, env, user));
    if (request.method === "DELETE" && path.match(/^\/conversations\/[^/]+\/messages\/[^/]+$/)) return requireMember(request, env, user => handleRemoveMessage(path, env, user));
    if (request.method === "POST" && path.match(/^\/conversations\/[^/]+\/read$/)) return requireMember(request, env, user => handleMarkConversationRead(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/conversations\/[^/]+\/hide$/)) return requireMember(request, env, user => handleHideConversation(path, env, user));
    if (request.method === "POST" && path.match(/^\/conversations\/[^/]+\/unhide$/)) return requireMember(request, env, user => handleUnhideConversation(path, env, user));
    if (request.method === "POST" && path.match(/^\/conversations\/[^/]+\/archive$/)) return requireMember(request, env, user => handleArchiveConversation(path, env, user));
    if (request.method === "POST" && path.match(/^\/conversations\/[^/]+\/unarchive$/)) return requireMember(request, env, user => handleUnarchiveConversation(path, env, user));
    if (request.method === "POST" && path.match(/^\/conversations\/[^/]+\/preferences$/)) return requireMember(request, env, user => handleUpdateConversationPreferences(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/conversations\/[^/]+\/nickname$/)) return requireMember(request, env, user => handleSetNickname(path, request, env, user));
    if (request.method === "GET" && path.match(/^\/conversations\/[^/]+\/nicknames$/)) return requireMember(request, env, user => handleGetNicknames(path, env, user));
    if (request.method === "POST" && path.match(/^\/conversations\/[^/]+\/mute$/)) return requireMember(request, env, user => handleMuteConversation(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/conversations\/[^/]+\/unmute$/)) return requireMember(request, env, user => handleUnmuteConversation(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/conversations\/[^/]+\/block$/)) return requireMember(request, env, user => handleBlockMember(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/conversations\/[^/]+\/unblock$/)) return requireMember(request, env, user => handleUnblockMember(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/conversations\/[^/]+\/restrict$/)) return requireMember(request, env, user => handleRestrictMember(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/conversations\/[^/]+\/unrestrict$/)) return requireMember(request, env, user => handleUnrestrictMember(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/conversations\/[^/]+\/report$/)) return requireMember(request, env, user => handleReportConversation(path, request, env, user));
    if (request.method === "POST" && path === "/uploads/profile-photo") return requireMember(request, env, user => handleProfilePhotoUpload(request, env, user));
    if (request.method === "POST" && path === "/uploads/community-media") return requireMember(request, env, user => handleCommunityMediaUpload(request, env, user));
    if (request.method === "POST" && path === "/uploads/messenger-media") return requireMember(request, env, user => handleMessengerMediaUpload(request, env, user));
    if (request.method === "POST" && path === "/uploads/article-media") return requireContributor(request, env, user => handleArticleMediaUpload(request, env, user));
    // StudioFlow room relay: guest invite links carry the roomId as the
    // credential (no website account). Same API shape as the local dev
    // room server so the frontend uses one code-scoped room id
    // (`show-<code>`; see 0024_studioflow_invite_codes.sql).
    // Creator Studio preview is owner/admin-only. This covers the room relay,
    // invite-code lifecycle, guest-token minting, and livestream controls so
    // direct API calls cannot bypass the Worker gate or expose session state.
    if (request.method === "GET" && path === "/room-codes/current") return requireAdmin(request, env, () => handleRoomCodeCurrent(env));
    if (request.method === "POST" && path === "/room-codes/current/close") return requireAdmin(request, env, () => handleRoomCodeClose(env));
    if (request.method === "GET" && path.match(/^\/room-codes\/[^/]+$/)) return requireAdmin(request, env, () => handleRoomCodeValidate(path, env));
    if (request.method === "GET" && path.match(/^\/rooms\/([^/]+)\/guests$/)) return requireAdmin(request, env, () => handleRoomListGuests(path, env));
    if (request.method === "POST" && path.match(/^\/rooms\/([^/]+)\/guests$/)) return requireAdmin(request, env, () => handleRoomUpsertGuest(path, request, env));
    if (request.method === "DELETE" && path.match(/^\/rooms\/([^/]+)\/guests\/[^/]+$/)) return requireAdmin(request, env, () => handleRoomRemoveGuest(path, env));
    if (request.method === "GET" && path.match(/^\/rooms\/([^/]+)\/status$/)) return requireAdmin(request, env, () => handleRoomStatus(path, env));
    if (request.method === "POST" && path.match(/^\/rooms\/([^/]+)\/signals$/)) return requireAdmin(request, env, () => handleRoomPostSignal(path, request, env));
    if (request.method === "GET" && path.match(/^\/rooms\/([^/]+)\/signals$/)) return requireAdmin(request, env, () => handleRoomGetSignals(path, request, env));
    if (request.method === "GET" && path === "/studio/rooms") return requireStudioAccess(request, env, user => handleListStudioRooms(request, env, user));
    if (request.method === "POST" && path === "/studio/rooms") return requireStudioAccess(request, env, user => handleCreateStudioRoom(request, env, user));
    if (request.method === "POST" && path.match(/^\/studio\/rooms\/[^/]+\/guest-token$/)) return requireStudioAccess(request, env, user => handleStudioGuestToken(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/studio\/rooms\/[^/]+\/close$/)) return requireStudioAccess(request, env, user => handleCloseStudioRoom(path, env, user));
    if (request.method === "POST" && path.match(/^\/studio\/rooms\/[^/]+\/livestream\/start$/)) return requireStudioAccess(request, env, user => handleStartStudioLivestream(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/studio\/rooms\/[^/]+\/livestream\/stop$/)) return requireStudioAccess(request, env, user => handleStopStudioLivestream(path, env, user));
    if (request.method === "GET" && path === "/studio/workspaces") return requireStudioAccess(request, env, user => handleListStudioWorkspaces(request, env, user));
    if (request.method === "POST" && path === "/studio/workspaces") return requireStudioAccess(request, env, user => handleCreateStudioWorkspace(request, env, user));
    if (request.method === "GET" && path.match(/^\/studio\/workspaces\/[^/]+$/)) return requireStudioAccess(request, env, user => handleGetStudioWorkspace(path, request, env, user));
    if ((request.method === "PUT" || request.method === "PATCH") && path.match(/^\/studio\/workspaces\/[^/]+$/)) return requireStudioAccess(request, env, user => handleUpdateStudioWorkspace(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/studio\/workspaces\/[^/]+\/archive$/)) return requireStudioAccess(request, env, user => handleArchiveStudioWorkspace(path, request, env, user));
    if (request.method === "GET" && path.startsWith("/media/")) return handleMediaRequest(path, env, request);
    if (request.method === "GET" && path === "/articles/reactions") return handleArticleReactions(request, env);
    if (request.method === "POST" && path === "/articles/reactions") return requireMember(request, env, user => handleSetArticleReaction(request, env, user));
    if (request.method === "GET" && path === "/articles") return handleListArticles(request, env);
    if (request.method === "POST" && path === "/articles") return requireContributor(request, env, user => handleCreateArticle(request, env, user));
    if (request.method === "DELETE" && path.startsWith("/articles/")) return requireContributor(request, env, user => handleDeleteArticle(path, env, user));
    if (request.method === "GET" && path === "/link-preview") return handleLinkPreview(request, env);
    if (request.method === "GET" && path === "/feed") return handleCommunityFeed(request, env);
    if (request.method === "GET" && path === "/feed/user") return handleUserFeed(request, env);

    // Community Feed (TPI's single community discussion system). The dedicated
    // Community data model (community_*) replaced the retired Forum tables —
    // see FORUM_DEPENDENCY_AUDIT.md and migrations 0032–0034.
    if (request.method === "GET" && path === "/community/categories") return handleListCommunityCategories(env);
    if (request.method === "GET" && path === "/community/posts") return handleListCommunityPosts(request, env);
    if (request.method === "POST" && path === "/community/posts") return requireMember(request, env, user => handleCreateCommunityPost(request, env, user));
    if (request.method === "PUT" && path.match(/^\/community\/posts\/[^/]+$/)) return requireMember(request, env, user => handleUpdateCommunityPost(path, request, env, user));
    if (request.method === "DELETE" && path.match(/^\/community\/posts\/[^/]+$/)) return requireMember(request, env, user => handleDeleteCommunityPost(path, env, user));
    if (request.method === "GET" && path.match(/^\/community\/posts\/[^/]+\/comments$/)) return handleListCommunityComments(path, request, env);
    if (request.method === "POST" && path.match(/^\/community\/posts\/[^/]+\/comments$/)) return requireMember(request, env, user => handleCreateCommunityComment(path, request, env, user));
    if (request.method === "DELETE" && path.match(/^\/community\/comments\/[^/]+$/)) return requireMember(request, env, user => handleDeleteCommunityComment(path, env, user));
    if (request.method === "POST" && path.match(/^\/community\/posts\/[^/]+\/reactions$/)) return requireMember(request, env, user => handleSetCommunityReaction(path, request, env, user, "post"));
    if (request.method === "POST" && path.match(/^\/community\/comments\/[^/]+\/reactions$/)) return requireMember(request, env, user => handleSetCommunityReaction(path, request, env, user, "comment"));
    if (request.method === "GET" && path === "/comments") return handleListComments(request, env);
    if (request.method === "POST" && path === "/comments") return handleCreateComment(request, env);
    if (request.method === "GET" && path === "/video-comments") return handleListVideoComments(request, env);
    if (request.method === "POST" && path === "/video-comments") return requireMember(request, env, user => handleCreateVideoComment(request, env, user));
    if (request.method === "POST" && path === "/studio/live-broadcasts") return requireStudioAccess(request, env, user => handleRegisterLiveBroadcast(request, env, user));
    if (request.method === "POST" && path.match(/^\/studio\/live-broadcasts\/[^/]+\/(start|stop)$/)) return requireStudioAccess(request, env, user => handleSetLiveBroadcastStatus(path, request, env, user));
    if (request.method === "GET" && path === "/tpi-broadcasts") return handleListTpiBroadcasts(request, env);
    if (request.method === "POST" && path === "/tpi-broadcasts") return requireContributorOrStudio(request, env, user => handleCreateTpiBroadcast(request, env, user));
    if (request.method === "GET" && path.match(/^\/tpi-broadcasts\/[^/]+$/)) return handleGetTpiBroadcast(path, request, env);
    if (request.method === "PUT" && path.match(/^\/tpi-broadcasts\/[^/]+$/)) return requireContributorOrStudio(request, env, user => handleUpdateTpiBroadcast(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/tpi-broadcasts\/[^/]+\/(publish|unpublish|cancel|status|playback|replay)$/)) return requireContributorOrStudio(request, env, user => handleTpiBroadcastAction(path, request, env, user));
    if (request.method === "GET" && path.match(/^\/live-broadcasts\/[^/]+\/events$/)) return requireMember(request, env, user => handleLiveBroadcastEvents(path, request, env, user));
    if (request.method === "GET" && path.match(/^\/live-broadcasts\/[^/]+\/comments$/)) return requireMember(request, env, user => handleListLiveComments(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/live-broadcasts\/[^/]+\/comments$/)) return requireMember(request, env, user => handleCreateLiveComment(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/live-broadcasts\/[^/]+\/comments\/[^/]+\/(star|display|hide|moderate|reply)$/)) return requireAdmin(request, env, user => handleLiveCommentControl(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/live-broadcasts\/[^/]+\/reactions$/)) return requireMember(request, env, user => handleSetLiveReaction(path, request, env, user));
    if (request.method === "GET" && path.match(/^\/live-broadcasts\/[^/]+\/reactions$/)) return requireMember(request, env, user => handleGetLiveReactions(path, env, user));
    if (request.method === "GET" && path === "/tpi-videos") return handleListTpiVideos(request, env);
    if (request.method === "GET" && path.match(/^\/tpi-videos\/[^/]+$/)) return handleGetTpiVideo(path, env, request);
    if (request.method === "POST" && path === "/tpi-videos") return requireContributor(request, env, user => handleCreateTpiVideo(request, env, user));
    if (request.method === "PUT" && path.match(/^\/tpi-videos\/[^/]+$/)) return requireContributor(request, env, user => handleUpdateTpiVideo(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/tpi-videos\/[^/]+\/(publish|unpublish|remove)$/)) return requireContributor(request, env, user => handleTpiVideoLifecycle(path, env, user));
    if (request.method === "POST" && path.match(/^\/tpi-videos\/[^/]+\/share$/)) return requireMember(request, env, user => handleShareTpiVideo(path, request, env, user));
    if (request.method === "DELETE" && path.match(/^\/tpi-videos\/[^/]+$/)) return requireContributor(request, env, user => handleDeleteTpiVideo(path, env, user));
    if (request.method === "GET" && path === "/tpi-channels/me") return requireContributorOrStudio(request, env, user => handleGetMyTpiChannel(env, user));
    if (request.method === "PUT" && path === "/tpi-channels/me") return requireContributorOrStudio(request, env, user => handleUpdateMyTpiChannel(request, env, user));
    if (request.method === "POST" && path.match(/^\/tpi-channels\/[^/]+\/follow$/)) return requireMember(request, env, user => handleToggleTpiChannelFollow(path, env, user, true));
    if (request.method === "DELETE" && path.match(/^\/tpi-channels\/[^/]+\/follow$/)) return requireMember(request, env, user => handleToggleTpiChannelFollow(path, env, user, false));
    if (request.method === "GET" && path.match(/^\/tpi-channels\/[^/]+$/)) return handleGetTpiChannel(path, env, request);
    if (request.method === "GET" && path === "/video-reactions") return handleGetVideoReactions(request, env);
    if (request.method === "POST" && path === "/video-reactions") return requireMember(request, env, user => handleSetVideoReaction(request, env, user));
    if (request.method === "GET" && path === "/video-saves") return requireMember(request, env, user => handleGetVideoSaves(env, user));
    if (request.method === "POST" && path === "/video-saves") return requireMember(request, env, user => handleToggleVideoSave(request, env, user));
    if (request.method === "GET" && path === "/video-history") return requireMember(request, env, user => handleGetVideoHistory(env, user));
    if (request.method === "POST" && path === "/video-history") return requireMember(request, env, user => handleRecordVideoHistory(request, env, user));
    if (request.method === "DELETE" && path === "/video-history") return requireMember(request, env, user => handleClearVideoHistory(request, env, user));
    if (request.method === "POST" && path === "/video-reports") return requireMember(request, env, user => handleCreateVideoReport(request, env, user));

    // Events API
    // Manual refresh endpoints trigger expensive external scraping, so they
    // require owner/admin authorization (ordinary members and anonymous
    // visitors are rejected). The scheduled cron calls the shared scraper
    // functions directly and does not go through these HTTP routes.
    if (request.method === "GET" && path === "/events") return handleListEvents(request, env);
    if (request.method === "GET" && path === "/events/refresh") return requireAdmin(request, env, () => handleRefreshEvents(env));


    if (request.method === "GET" && path === "/news") return handleListNews(request, env);
    if (request.method === "GET" && path === "/news/refresh") return requireAdmin(request, env, () => handleRefreshNews(env));
    if (request.method === "GET" && path === "/videos") return handleListVideos(request, env);
    if (request.method === "GET" && path === "/videos/refresh") return requireAdmin(request, env, () => handleRefreshVideos(env));
    if (request.method === "GET" && path.match(/^\/events\/[^/]+$/)) return handleGetEvent(path, env);
    if (request.method === "POST" && path === "/events") return requireAdmin(request, env, user => handleCreateEvent(request, env, user));
    if (request.method === "POST" && path === "/events/submit") return handleCommunityEventSubmit(request, env);
    if (request.method === "POST" && path.match(/^\/events\/[^/]+\/rsvp$/)) return handleEventRsvp(path, request, env);

    // ============================================================
    // PARANORMAL TEAMS API
    // ============================================================

    // Public endpoints
    if (request.method === "GET" && path === "/teams/counts") return handleTeamCounts(env);
    if (request.method === "GET" && path.match(/^\/teams\/[^/]+$/) && !path.includes("/counts")) return handleGetTeam(path, env);
    if (request.method === "GET" && path === "/teams") return handleListTeams(request, env);
    if (request.method === "POST" && path === "/teams") return handleSubmitTeam(request, env);
    if (request.method === "PUT" && path.match(/^\/teams\/[^/]+$/)) return requireMember(request, env, user => handleUpdateTeam(path, request, env, user));

    // Team links
    if (request.method === "GET" && path.match(/^\/teams\/[^/]+\/links$/)) return handleGetTeamLinks(path, env);
    if (request.method === "POST" && path.match(/^\/teams\/[^/]+\/links$/)) return requireMember(request, env, user => handleAddTeamLink(path, request, env, user));

    // Team verification
    if (request.method === "GET" && path.match(/^\/teams\/[^/]+\/verification$/)) return handleGetTeamVerification(path, env);
    if (request.method === "POST" && path.match(/^\/teams\/[^/]+\/verification$/)) return requireAdmin(request, env, user => handleAddTeamVerification(path, request, env, user));

    // Team claims
    if (request.method === "POST" && path.match(/^\/teams\/[^/]+\/claim$/)) return requireMember(request, env, user => handleSubmitClaim(path, request, env, user));

    // Admin endpoints
    if (request.method === "GET" && path === "/admin/teams") return requireAdmin(request, env, user => handleAdminListTeams(request, env, user));
    if (request.method === "GET" && path === "/admin/teams/claims") return requireAdmin(request, env, user => handleAdminListClaims(request, env, user));
    if (request.method === "GET" && path.match(/^\/admin\/teams\/[^/]+\/history$/)) return requireAdmin(request, env, user => handleAdminTeamHistory(path, env, user));
    if (request.method === "POST" && path.match(/^\/admin\/teams\/claims\/[^/]+\/(approve|reject)$/)) return requireAdmin(request, env, user => handleAdminReviewClaim(path, request, env, user));
    if (request.method === "DELETE" && path.match(/^\/admin\/teams\/[^/]+$/)) return requireAdmin(request, env, user => handleAdminDeleteTeam(path, env, user));
    if (request.method === "POST" && path.match(/^\/admin\/teams\/[^/]+\/approve$/)) return requireAdmin(request, env, user => handleAdminApproveTeam(path, env, user));
    if (request.method === "POST" && path.match(/^\/admin\/teams\/[^/]+\/reject$/)) return requireAdmin(request, env, user => handleAdminRejectTeam(path, env, user));
    if (request.method === "POST" && path.match(/^\/admin\/teams\/[^/]+\/status$/)) return requireAdmin(request, env, user => handleAdminSetTeamStatus(path, request, env, user));

    return json({ error: "Not found." }, 404);
  } catch (error) {
    return json({ error: error.message || "Request failed." }, 500);
  }
}

async function handleOwnerBootstrap(request, env) {
  const data = await readJson(request);
  if (!env.TPI_OWNER_SETUP_KEY || data.setupKey !== env.TPI_OWNER_SETUP_KEY) {
    return json({ error: "Owner setup key did not match." }, 403);
  }

  const username = clean(data.username || "tpi-owner");
  const password = String(data.password || "");
  if (!username || !password) return json({ error: "Username and password are required." }, 400);
  if (!isValidUsername(username)) return json({ error: "Username cannot contain spaces. Use letters, numbers, dashes, underscores, periods, or symbols." }, 400);

  const user = await getUserByUsername(env, username);
  const payload = [
    user?.id || crypto.randomUUID(),
    username,
    await hashPassword(password),
    clean(data.displayName || "Todd Wayne"),
    clean(data.title || "Founder / Director"),
    "owner",
    clean(data.correspondence || "paranormalinitiative@yahoo.com"),
    clean(data.affiliation || "The Paranormal Initiative - Applied Paranormal Research and Studies"),
    clean(data.organization || "Somerset Paranormal Research Society"),
    clean(data.website || ""),
    clean(data.bio || ""),
    clean(data.photoUrl || "")
  ];

  await env.TPI_DB.prepare(`
    INSERT INTO contributors (id, username, password_hash, display_name, title, role, correspondence, affiliation, organization, website, bio, photo_url, comment_signature_enabled, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
    ON CONFLICT(username) DO UPDATE SET
      password_hash = excluded.password_hash,
      display_name = excluded.display_name,
      title = excluded.title,
      role = 'owner',
      correspondence = excluded.correspondence,
      affiliation = excluded.affiliation,
      organization = excluded.organization,
      website = excluded.website,
      bio = excluded.bio,
      photo_url = excluded.photo_url,
      active = 1
  `).bind(...payload).run();

  return json({ ok: true });
}

async function handleLogin(request, env) {
  const data = await readJson(request);
  const username = clean(data.username);
  const password = String(data.password || "");
  const user = await getUserByLoginIdentifier(env, username);
  if (!user || !user.active || user.password_hash !== await hashPassword(password)) {
    return json({ error: "Username or password did not match." }, 401);
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
  await env.TPI_DB.prepare("INSERT INTO sessions (token, contributor_id, expires_at) VALUES (?, ?, ?)")
    .bind(token, user.id, expires)
    .run();

  return json({ user: privateMemberUser(user) }, 200, {
    "Set-Cookie": `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 14}`
  });
}

async function handlePasswordResetRequest(request, env) {
  const data = await readJson(request);
  const email = clean(data.email).toLowerCase();
  if (!email || !email.includes("@")) return json({ error: "Enter the email address on the account." }, 400);

  const user = await getUserByEmail(env, email);
  if (user) {
    try {
      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString();
      await env.TPI_DB.prepare(`
        INSERT INTO password_reset_tokens (token, contributor_id, expires_at)
        VALUES (?, ?, ?)
      `).bind(token, user.id, expires).run();
    } catch (error) {
      // The reset-token table and outbound email provider can be enabled after the UI is live.
    }
  }

  return json({
    ok: true,
    message: "If that email is on a member account, reset instructions will be sent when email delivery is connected."
  });
}

async function handleLogout() {
  return json({ ok: true }, 200, {
    "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
  });
}

async function handleMe(request, env) {
  const user = await getSessionUser(request, env);
  return json({ user: user ? privateMemberUser(user, await hasCreatorStudioAccess(env, user)) : null }, 200, { "Cache-Control": "no-store" });
}

// My Pulse stats: every number is a truthful count from real tables —
// no estimates. Likes = reactions the member gave across community posts,
// articles and videos. Comments = article + video comments. Uploads =
// media objects the member put in R2. Posts = everything the member has
// posted across the site: community posts, community comments, and
// published articles/papers. Following / Live Streams have no feature
// yet, so they report 0 until those features exist.

async function handleMemberRegister(request, env) {
  const data = await readJson(request);
  const username = clean(data.username);
  const password = String(data.password || "");
  const displayName = clean(data.displayName || username);
  const email = clean(data.email || data.correspondence).toLowerCase();
  if (!username || !password || !displayName) {
    return json({ error: "Display name, username, and password are required." }, 400);
  }
  if (!isValidUsername(username)) return json({ error: "Username cannot contain spaces. Use letters, numbers, dashes, underscores, periods, or symbols." }, 400);
  if (!email || !email.includes("@")) return json({ error: "A valid email address is required." }, 400);
  if (password.length < 8) return json({ error: "Password must be at least 8 characters." }, 400);
  if (await getUserByUsername(env, username)) return json({ error: "That username already exists." }, 409);
  if (await getUserByEmail(env, email)) return json({ error: "That email is already connected to an account." }, 409);

  const id = crypto.randomUUID();
  await env.TPI_DB.prepare(`
    INSERT INTO contributors (
      id, username, password_hash, display_name, title, role, correspondence,
      contact_name, phone, address_line1, address_line2, city, state, postal_code,
      affiliation, organization, website, bio, photo_url, comment_signature_enabled, active
    )
    VALUES (?, ?, ?, ?, ?, 'member', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(
    id,
    username,
    await hashPassword(password),
    displayName,
    clean(data.title || "Member"),
    email,
    clean(data.contactName || displayName),
    clean(data.phone),
    clean(data.addressLine1),
    clean(data.addressLine2),
    clean(data.city),
    clean(data.state),
    clean(data.postalCode),
    clean(data.affiliation),
    clean(data.organization),
    clean(data.website),
    clean(data.bio),
    clean(data.photoUrl),
    data.commentSignatureEnabled === false ? 0 : 1
  ).run();

  return json({ ok: true });
}

async function handleCreateInvite(request, env, user) {
  const data = await readJson(request);
  const code = clean(data.code || makeInviteCode());
  const assignment = getInviteAssignment(code);
  const role = assignment?.role || (["owner", "admin", "contributor", "member"].includes(data.role) ? data.role : "contributor");
  if (!code) return json({ error: "Invite code is required." }, 400);
  if (["owner", "admin"].includes(role) && user.role !== "owner") {
    return json({ error: "Only the Director can create Director, Assistant Director, or Admin invites." }, 403);
  }

  await env.TPI_DB.prepare("INSERT INTO invite_codes (code, role, created_by) VALUES (?, ?, ?)")
    .bind(code, role, user.id)
    .run();
  return json({ invite: { code, role, used: false } });
}

async function handleListInvites(request, env) {
  const url = new URL(request.url);
  const paginated = url.searchParams.has("page") || url.searchParams.has("pageSize");
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "25", 10) || 25, 100));
  const limitSql = paginated ? "LIMIT ? OFFSET ?" : "";
  const { results } = await env.TPI_DB.prepare(`
    SELECT code, role, used, used_by, used_at, created_at
    FROM invite_codes
    ORDER BY created_at DESC
    ${limitSql}
  `).bind(...(paginated ? [pageSize, (page - 1) * pageSize] : [])).all();
  const payload = { invites: results };
  if (!paginated) return json(payload);
  const count = await env.TPI_DB.prepare("SELECT COUNT(*) AS total FROM invite_codes").first();
  const total = Number(count?.total || 0);
  return json({ ...payload, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}

async function handleListContributors(request, env) {
  const url = new URL(request.url);
  const paginated = url.searchParams.has("page") || url.searchParams.has("pageSize") || url.searchParams.has("status") || url.searchParams.has("search");
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "50", 10) || 50, 100));
  const status = clean(url.searchParams.get("status") || "all");
  const search = clean(url.searchParams.get("search") || "").slice(0, 120);
  const filters = [];
  const binds = [];
  if (status === "active" || status === "inactive") {
    filters.push("active = ?");
    binds.push(status === "active" ? 1 : 0);
  }
  if (search) {
    filters.push("(username LIKE ? OR display_name LIKE ? OR title LIKE ? OR role LIKE ?)");
    const pattern = `%${search}%`;
    binds.push(pattern, pattern, pattern, pattern);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const limitSql = paginated ? "LIMIT ? OFFSET ?" : "";
  const { results } = await env.TPI_DB.prepare(`
    SELECT username, display_name, title, role, correspondence, active, created_at
    FROM contributors
    ${where}
    ORDER BY active DESC, display_name COLLATE NOCASE, username COLLATE NOCASE
    ${limitSql}
  `).bind(...(paginated ? [...binds, pageSize, (page - 1) * pageSize] : binds)).all();
  const payload = { contributors: results.map(publicUser) };
  if (!paginated) return json(payload);
  const count = await env.TPI_DB.prepare(`SELECT COUNT(*) AS total FROM contributors ${where}`).bind(...binds).first();
  const total = Number(count?.total || 0);
  return json({ ...payload, status, search, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}

async function handleUpdateContributorTitle(request, env, actingUser) {
  const data = await readJson(request);
  const username = clean(data.username);
  const title = clean(data.title).slice(0, 160);
  const requestedRole = clean(data.role);
  const target = await getUserByUsername(env, username);
  if (!target || !target.active) return json({ error: "Contributor was not found." }, 404);
  if (target.role === "owner" && actingUser.role !== "owner") {
    return json({ error: "Only the owner can change an owner profile." }, 403);
  }

  let nextRole = target.role;
  if (requestedRole && requestedRole !== target.role) {
    const changingLeadershipAccess = ["owner", "admin"].includes(requestedRole) || ["owner", "admin"].includes(target.role);
    if (changingLeadershipAccess && actingUser.role !== "owner") {
      return json({ error: "Only the owner can change owner or admin access." }, 403);
    }
    if (!["owner", "admin", "contributor", "member"].includes(requestedRole)) {
      return json({ error: "Account access type was not recognized." }, 400);
    }
    nextRole = requestedRole;
  }

  await env.TPI_DB.prepare("UPDATE contributors SET title = ?, role = ? WHERE username = ?")
    .bind(title, nextRole, username)
    .run();

  await writeAdminAuditLog(env, actingUser, "member.role_or_title_updated", "member", username, {
    previousRole: target.role,
    role: nextRole,
    titleChanged: title !== clean(target.title)
  });

  const updated = await getUserByUsername(env, username);
  return json({ contributor: publicUser(updated) });
}

async function handleAdminListMembers(request, env) {
  const url = new URL(request.url);
  const search = clean(url.searchParams.get("search")).slice(0, 80);
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "25", 10) || 25, 100));
  const status = clean(url.searchParams.get("status")).toLowerCase();
  const role = clean(url.searchParams.get("role")).toLowerCase();
  const sort = { name: "c.display_name COLLATE NOCASE", username: "c.username COLLATE NOCASE", created: "c.created_at", activity: "(topicCount + postCount)" }[clean(url.searchParams.get("sort")).toLowerCase()] || "c.active";
  const direction = clean(url.searchParams.get("direction")).toLowerCase() === "asc" ? "ASC" : "DESC";
  const where = [];
  const binds = [];
  if (search) {
    const like = `%${search}%`;
    where.push("(c.username LIKE ? OR c.display_name LIKE ? OR c.title LIKE ? OR c.role LIKE ?)");
    binds.push(like, like, like, like);
  }
  if (status === "active" || status === "inactive") {
    where.push("c.active = ?");
    binds.push(status === "active" ? 1 : 0);
  }
  if (["member", "contributor", "creator", "admin", "owner"].includes(role)) {
    where.push("c.role = ?");
    binds.push(role);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const baseSql = `
    FROM contributors c
    LEFT JOIN community_posts cp ON cp.author_id = c.id AND cp.status != 'deleted'
    LEFT JOIN community_comments cm ON cm.author_id = c.id AND cm.status = 'visible'
    ${whereSql}
    GROUP BY c.id
  `;
  const countRow = await env.TPI_DB.prepare(`SELECT COUNT(*) AS total FROM contributors c ${whereSql}`).bind(...binds).first();
  const { results } = await env.TPI_DB.prepare(`
    SELECT c.username, c.display_name AS displayName, c.title, c.role, c.active,
           c.created_at AS createdAt,
           COUNT(DISTINCT cp.id) AS topicCount,
           COUNT(DISTINCT cm.id) AS postCount
    ${baseSql}
    ORDER BY ${sort} ${direction}, c.username COLLATE NOCASE ASC
    LIMIT ? OFFSET ?
  `).bind(...binds, pageSize, (page - 1) * pageSize).all();
  const total = Number(countRow?.total || 0);
  return json({
    members: results.map(member => ({
      ...member,
      active: Boolean(member.active),
      topicCount: Number(member.topicCount || 0),
      postCount: Number(member.postCount || 0)
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
  });
}

function adminDateRange(request) {
  const url = new URL(request.url);
  const preset = clean(url.searchParams.get("range") || "30d").toLowerCase();
  const now = new Date();
  const requestedEnd = clean(url.searchParams.get("to"));
  const end = /^\d{4}-\d{2}-\d{2}$/.test(requestedEnd) ? requestedEnd : now.toISOString().slice(0, 10);
  const startDate = new Date(`${end}T00:00:00Z`);
  if (preset === "today") startDate.setUTCDate(startDate.getUTCDate());
  else if (preset === "7d") startDate.setUTCDate(startDate.getUTCDate() - 7);
  else if (preset === "90d") startDate.setUTCDate(startDate.getUTCDate() - 90);
  else if (preset === "custom" && /^\d{4}-\d{2}-\d{2}$/.test(clean(url.searchParams.get("from")))) {
    return { preset, start: clean(url.searchParams.get("from")), end };
  } else startDate.setUTCDate(startDate.getUTCDate() - 30);
  return { preset: ["today", "7d", "90d"].includes(preset) ? preset : "30d", start: startDate.toISOString().slice(0, 10), end };
}

async function handleAdminOverview(request, env, user) {
  const range = adminDateRange(request);
  const queries = [
    ["members", "SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END), 0) AS active, COALESCE(SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END), 0) AS inactive FROM contributors"],
    ["communityPosts", "SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN status = 'visible' THEN 1 ELSE 0 END), 0) AS visible, COALESCE(SUM(CASE WHEN status = 'hidden' THEN 1 ELSE 0 END), 0) AS hidden FROM community_posts"],
    ["communityComments", "SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN status = 'visible' THEN 1 ELSE 0 END), 0) AS visible, COALESCE(SUM(CASE WHEN status = 'hidden' THEN 1 ELSE 0 END), 0) AS hidden FROM community_comments"],
    ["videos", "SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END), 0) AS published FROM tpi_videos"],
    ["events", "SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END), 0) AS published FROM events"],
    ["communityReactions", "SELECT COUNT(*) AS total FROM community_reactions"],
    ["articles", "SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END), 0) AS published FROM articles"],
    ["creatorChannels", "SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN visibility = 'public' THEN 1 ELSE 0 END), 0) AS public FROM tpi_video_channels"],
    ["founding50", "SELECT COUNT(*) AS allocated FROM founding50_allocations"],
    ["teams", "SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) AS approved FROM paranormal_teams"],
    ["notifications", "SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN read_at IS NULL THEN 1 ELSE 0 END), 0) AS unread FROM member_notifications"],
    ["scraperRuns", "SELECT COUNT(*) AS total, MAX(started_at) AS lastStartedAt, MAX(CASE WHEN status = 'failed' THEN started_at END) AS lastFailedAt FROM scraper_runs"],
    ["creatorAccounts", "SELECT COUNT(*) AS total FROM contributors WHERE role IN ('creator', 'contributor')"],
    ["videoReports", "SELECT COUNT(*) AS total FROM video_reports WHERE status IN ('open', 'pending')"],
    ["messengerReports", "SELECT COUNT(*) AS total FROM messenger_reports WHERE status IN ('open', 'pending')"],
    ["pendingReports", "SELECT COUNT(*) AS total FROM messenger_reports WHERE status = 'pending'"],
    ["pendingEvents", "SELECT COUNT(*) AS total FROM events WHERE status = 'pending'"],
    ["pendingCreatorApplications", "SELECT COUNT(*) AS total FROM founding50_applications WHERE status = 'pending'"],
    ["pendingContent", "SELECT COUNT(*) AS total FROM articles WHERE status = 'draft'"],
    ["pendingModeration", "SELECT (SELECT COUNT(*) FROM comments WHERE status = 'pending') + (SELECT COUNT(*) FROM video_reports WHERE status IN ('open', 'pending')) + (SELECT COUNT(*) FROM messenger_reports WHERE status IN ('open', 'pending')) AS total"]
  ];
  const entries = await Promise.all(queries.map(async ([key, sql]) => {
    try {
      const row = await env.TPI_DB.prepare(sql).first();
      return [key, row || {}];
    } catch (error) {
      // A missing optional table should make only that card unavailable, not
      // break the rest of the admin dashboard.
      return [key, { unavailable: true }];
    }
  }));
  const data = Object.fromEntries(entries);
  const trends = await getAdminTrends(env, range);
  return json({
    generatedAt: new Date().toISOString(),
    viewer: { username: user?.username, role: user?.role },
    range,
    metrics: data,
    trends
  }, 200, { "Cache-Control": "no-store" });
}

async function handleAdminAnalytics(request, env, user) {
  const overview = await handleAdminOverview(request, env, user);
  const body = await overview.json();
  const analytics = await getAdminAnalyticsData(env, body.range, body.metrics || {}, body.trends || {});
  return json({
    range: body.range,
    trends: body.trends,
    definitions: analytics.definitions,
    series: analytics.series,
    summary: analytics.summary,
    membershipDistribution: analytics.membershipDistribution,
    contentOverview: analytics.contentOverview,
    websiteActivity: analytics.websiteActivity
  }, 200, { "Cache-Control": "no-store" });
}

async function getAdminAnalyticsData(env, range, metrics, trends) {
  const creatorSeries = await Promise.all([
    getAdminDailySeries(env, "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM contributors WHERE role IN ('creator', 'contributor') AND created_at >= ? AND created_at <= ? GROUP BY day ORDER BY day", range),
    getAdminDailySeries(env, "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM tpi_video_channels WHERE created_at >= ? AND created_at <= ? GROUP BY day ORDER BY day", range),
    getAdminDailySeries(env, "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM (SELECT created_at FROM tpi_videos WHERE status = 'published' UNION ALL SELECT created_at FROM articles WHERE status = 'published') GROUP BY day ORDER BY day", range)
  ]);
  const memberGrowth = await getAdminMemberGrowthSeries(env, range);
  const moderation = await getAdminModerationAnalytics(env, range);
  const membershipDistribution = await getAdminMembershipDistribution(env);

  const community = {
    posts: normalizeAdminSeries(trends.communityPosts, range),
    comments: normalizeAdminSeries(trends.communityComments, range),
    reactions: normalizeAdminSeries(trends.communityReactions, range)
  };
  const creator = {
    accounts: creatorSeries[0],
    channels: creatorSeries[1],
    publishedContent: creatorSeries[2]
  };
  const creatorEngagement = await getAdminCreatorEngagement(env);
  const rangeTotals = {
    posts: sumAdminSeries(community.posts),
    comments: sumAdminSeries(community.comments),
    reactions: sumAdminSeries(community.reactions)
  };

  return {
    definitions: {
      members: "Contributor accounts created per day; total membership is cumulative through each day.",
      communityPosts: "Visible and historical Community Feed posts grouped by created_at day.",
      communityComments: "Community Feed comments grouped by created_at day.",
      communityReactions: "Community Feed reactions grouped by created_at day.",
      videos: "Published TPI Videos grouped by created_at day.",
      events: "Event records grouped by created_at day.",
      membershipDistribution: membershipDistribution.definition,
      websiteActivity: "Unavailable: the current application does not expose a reliable first-party visits or page-views table."
    },
    series: {
      memberGrowth,
      communityEngagement: community,
      creatorActivity: creator,
      moderation: moderation.series
    },
    summary: {
      communityEngagement: { ...rangeTotals, range: range.preset },
      creatorActivity: {
        accounts: metricNumber(metrics.creatorAccounts, "total"),
        channels: metricNumber(metrics.creatorChannels, "total"),
        publishedContent: metricNumber(metrics.videos, "published") + metricNumber(metrics.articles, "published"),
        engagement: creatorEngagement
      },
      moderation: moderation.summary,
      content: [
        { key: "communityPosts", label: "Community posts", count: metricNumber(metrics.communityPosts, "visible") },
        { key: "articles", label: "Education articles", count: metricNumber(metrics.articles, "published") },
        { key: "videos", label: "TPI Videos", count: metricNumber(metrics.videos, "published") },
        { key: "events", label: "Published events", count: metricNumber(metrics.events, "published") }
      ]
    },
    membershipDistribution,
    contentOverview: [
      { key: "communityPosts", label: "Community posts", count: metricNumber(metrics.communityPosts, "visible") },
      { key: "articles", label: "Education articles", count: metricNumber(metrics.articles, "published") },
      { key: "videos", label: "TPI Videos", count: metricNumber(metrics.videos, "published") },
      { key: "events", label: "Published events", count: metricNumber(metrics.events, "published") }
    ],
    websiteActivity: {
      unavailable: true,
      reason: "No reliable first-party visits or page-views data source is configured."
    }
  };
}

function metricNumber(metric, key) {
  if (!metric || metric.unavailable) return 0;
  return Number(metric[key] || 0);
}

function sumAdminSeries(series) {
  return Array.isArray(series) ? series.reduce((total, point) => total + Number(point.count || 0), 0) : 0;
}

function adminDateKeys(range) {
  const dates = [];
  const cursor = new Date(`${range.start}T00:00:00Z`);
  const end = new Date(`${range.end}T00:00:00Z`);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function normalizeAdminSeries(series, range) {
  if (series && !Array.isArray(series)) return series;
  const byDay = new Map((series || []).map(point => [point.day, Number(point.count || 0)]));
  return adminDateKeys(range).map(day => ({ day, count: byDay.get(day) || 0 }));
}

async function getAdminDailySeries(env, sql, range) {
  try {
    const { results } = await env.TPI_DB.prepare(sql).bind(`${range.start}T00:00:00`, `${range.end}T23:59:59`).all();
    return normalizeAdminSeries((results || []).map(row => ({ day: row.day, count: Number(row.count || 0) })), range);
  } catch (error) {
    return { unavailable: true, reason: "The source table or timestamp field is unavailable." };
  }
}

async function getAdminMemberGrowthSeries(env, range) {
  try {
    const [baseline, daily] = await Promise.all([
      env.TPI_DB.prepare("SELECT COUNT(*) AS count FROM contributors WHERE created_at < ?").bind(`${range.start}T00:00:00`).first(),
      env.TPI_DB.prepare("SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM contributors WHERE created_at >= ? AND created_at <= ? GROUP BY day ORDER BY day").bind(`${range.start}T00:00:00`, `${range.end}T23:59:59`).all()
    ]);
    const byDay = new Map((daily.results || []).map(row => [row.day, Number(row.count || 0)]));
    let total = Number(baseline?.count || 0);
    const newMembers = [];
    const totalMembers = [];
    for (const day of adminDateKeys(range)) {
      const count = byDay.get(day) || 0;
      total += count;
      newMembers.push({ day, count });
      totalMembers.push({ day, count: total });
    }
    return { newMembers, totalMembers };
  } catch (error) {
    return { unavailable: true, reason: "Member creation timestamps are unavailable." };
  }
}

async function getAdminCreatorEngagement(env) {
  const queries = [
    ["videoReactions", "SELECT COUNT(*) AS count FROM video_reactions"],
    ["videoComments", "SELECT COUNT(*) AS count FROM video_comments"]
  ];
  const values = await Promise.all(queries.map(async ([key, sql]) => {
    try {
      const row = await env.TPI_DB.prepare(sql).first();
      return [key, Number(row?.count || 0)];
    } catch (error) {
      return [key, null];
    }
  }));
  const available = values.some(([, value]) => value !== null);
  if (!available) return { unavailable: true, reason: "No creator-specific engagement tables are available." };
  return { available: true, videoReactions: values[0][1], videoComments: values[1][1] };
}

async function getAdminMembershipDistribution(env) {
  try {
    const { results } = await env.TPI_DB.prepare("SELECT membership_type AS category, COUNT(*) AS count FROM creator_partnership_memberships GROUP BY membership_type ORDER BY count DESC, category ASC").all();
    return {
      available: true,
      source: "creator_partnership_memberships",
      definition: "Actual creator partnership membership records grouped by membership_type. General free/paid plan categories are not present in the current schema.",
      categories: (results || []).map(row => ({ key: row.category || "unknown", label: row.category || "Unknown", count: Number(row.count || 0) }))
    };
  } catch (error) {
    return {
      available: false,
      source: "none",
      definition: "Unavailable: the current schema does not expose a general membership-category table.",
      categories: [],
      reason: "No membership distribution source is available."
    };
  }
}

async function getAdminModerationAnalytics(env, range) {
  const tables = ["video_reports", "messenger_reports"];
  const summaries = await Promise.all(tables.map(async table => {
    try {
      const row = await env.TPI_DB.prepare(`SELECT COUNT(*) AS total, SUM(CASE WHEN status IN ('pending', 'open') THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved, SUM(CASE WHEN status = 'dismissed' THEN 1 ELSE 0 END) AS dismissed FROM ${table}`).first();
      return { table, available: true, values: { total: Number(row?.total || 0), pending: Number(row?.pending || 0), resolved: Number(row?.resolved || 0), dismissed: Number(row?.dismissed || 0) } };
    } catch (error) {
      return { table, available: false, values: { total: 0, pending: 0, resolved: 0, dismissed: 0 } };
    }
  }));
  const seriesRows = await Promise.all(tables.map(table => getAdminDailySeries(env, `SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM ${table} WHERE created_at >= ? AND created_at <= ? GROUP BY day ORDER BY day`, range)));
  const availableSeries = seriesRows.some(series => Array.isArray(series));
  const byDay = new Map();
  for (const series of seriesRows) {
    if (!Array.isArray(series)) continue;
    for (const point of series) byDay.set(point.day, (byDay.get(point.day) || 0) + point.count);
  }
  const summary = summaries.reduce((total, item) => ({
    total: total.total + item.values.total,
    pending: total.pending + item.values.pending,
    resolved: total.resolved + item.values.resolved,
    dismissed: total.dismissed + item.values.dismissed
  }), { total: 0, pending: 0, resolved: 0, dismissed: 0 });
  return {
    summary: { ...summary, available: summaries.some(item => item.available) },
    series: { available: availableSeries, reports: availableSeries ? adminDateKeys(range).map(day => ({ day, count: byDay.get(day) || 0 })) : { unavailable: true, reason: "No moderation report source is available." } }
  };
}

async function getAdminTrends(env, range) {
  const sources = {
    members: "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM contributors WHERE created_at >= ? AND created_at <= ? GROUP BY day ORDER BY day",
    communityPosts: "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM community_posts WHERE created_at >= ? AND created_at <= ? GROUP BY day ORDER BY day",
    communityComments: "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM community_comments WHERE created_at >= ? AND created_at <= ? GROUP BY day ORDER BY day",
    communityReactions: "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM community_reactions WHERE created_at >= ? AND created_at <= ? GROUP BY day ORDER BY day",
    videos: "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM tpi_videos WHERE created_at >= ? AND created_at <= ? GROUP BY day ORDER BY day",
    events: "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count FROM events WHERE created_at >= ? AND created_at <= ? GROUP BY day ORDER BY day"
  };
  const start = `${range.start}T00:00:00`;
  const end = `${range.end}T23:59:59`;
  const entries = await Promise.all(Object.entries(sources).map(async ([key, sql]) => {
    try {
      const { results } = await env.TPI_DB.prepare(sql).bind(start, end).all();
      return [key, (results || []).map(row => ({ day: row.day, count: Number(row.count || 0) }))];
    } catch (error) {
      return [key, { unavailable: true }];
    }
  }));
  return Object.fromEntries(entries);
}

async function handleAdminFounding50(env) {
  try {
    const summary = await env.TPI_DB.prepare(`
      SELECT
        COUNT(*) AS allocated,
        COALESCE(SUM(CASE WHEN cpm.membership_state = 'active' THEN 1 ELSE 0 END), 0) AS active,
        COALESCE(SUM(CASE WHEN cpm.membership_state = 'suspended' THEN 1 ELSE 0 END), 0) AS suspended,
        COALESCE(SUM(CASE WHEN cpm.membership_state = 'revoked' THEN 1 ELSE 0 END), 0) AS revoked
      FROM founding50_allocations f
      JOIN creator_partnership_memberships cpm ON cpm.id = f.membership_id
    `).first();
    const applications = await env.TPI_DB.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) AS pending,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) AS approved,
        COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) AS rejected
      FROM founding50_applications
    `).first();
    const allocated = Number(summary?.allocated || 0);
    return json({
      program: "Founding 50",
      status: allocated ? "partially_allocated" : "not_activated",
      capacity: 50,
      allocated,
      remaining: Math.max(0, 50 - allocated),
      active: Number(summary?.active || 0),
      suspended: Number(summary?.suspended || 0),
      revoked: Number(summary?.revoked || 0),
      pendingApplications: Number(applications?.pending || 0),
      approvedApplications: Number(applications?.approved || 0),
      rejectedApplications: Number(applications?.rejected || 0),
      slotPolicy: "Only activated founding50 allocations consume one of the 50 slots.",
      eligibility: "existing-account-only",
      entitlement: "complimentary-lifetime-creator + creator_studio_lifetime",
      creatorStudioAccess: "production-award-gated",
      note: "No production award is possible until the explicit activation gate is enabled by the owner. Allocated slots are never silently recycled."
    }, 200, { "Cache-Control": "no-store" });
  } catch (error) {
    return json({ program: "Founding 50", status: "migration_pending", capacity: 50, allocated: null, remaining: null, note: "The additive Creator Partnership migration is not available in this environment." }, 200, { "Cache-Control": "no-store" });
  }
}

async function handleAdminFounding50Applications(request, env) {
  const url = new URL(request.url);
  const status = ["pending", "approved", "rejected", "all"].includes(clean(url.searchParams.get("status")).toLowerCase()) ? clean(url.searchParams.get("status")).toLowerCase() : "pending";
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "25", 10) || 25, 100));
  const where = status === "all" ? "" : "WHERE fa.status = ?";
  const binds = status === "all" ? [] : [status];
  try {
    const count = await env.TPI_DB.prepare(`SELECT COUNT(*) AS total FROM founding50_applications fa ${where}`).bind(...binds).first();
    const { results } = await env.TPI_DB.prepare(`
      SELECT fa.id, fa.status, fa.administrative_notes AS administrativeNotes,
             fa.created_at AS createdAt, fa.reviewed_at AS reviewedAt,
             fa.contact_email AS contactEmail, fa.website_url AS websiteUrl,
             fa.social_channels AS socialChannels, fa.video_channels AS videoChannels,
             fa.creator_description AS creatorDescription, fa.applicant_id AS applicantId,
             cpm.id AS membershipId, cpm.membership_state AS membershipState,
             cse.entitlement_state AS entitlementState,
             c.username, c.display_name AS displayName, c.role, c.active
      FROM founding50_applications fa
      JOIN contributors c ON c.id = fa.applicant_id
      LEFT JOIN creator_partnership_memberships cpm ON cpm.application_id = fa.id
      LEFT JOIN creator_studio_entitlements cse ON cse.source_membership_id = cpm.id
      ${where}
      ORDER BY fa.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...binds, pageSize, (page - 1) * pageSize).all();
    const total = Number(count?.total || 0);
    return json({ applications: (results || []).map(founderApplicationPayload), pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (error) {
    return json({ applications: [], pagination: { page, pageSize, total: 0, totalPages: 0 }, status: "migration_pending" });
  }
}

function founderApplicationPayload(row) {
  const parseList = value => {
    try {
      const parsed = JSON.parse(value || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };
  return {
    ...row,
    active: Boolean(row.active),
    socialChannels: parseList(row.socialChannels),
    videoChannels: parseList(row.videoChannels),
    readiness: row.entitlementState === "active" && row.membershipState === "active"
      ? "activated"
      : row.status === "approved"
        ? "ready_for_owner_activation"
        : row.status === "rejected"
          ? "rejected"
          : "under_review"
  };
}

function normalizeApplicationUrlList(value, label) {
  const raw = Array.isArray(value) ? value : String(value || "").split(/[\n,]+/);
  const values = Array.from(new Set(raw.map(item => clean(String(item)).slice(0, 500)).filter(Boolean)));
  if (values.length > 8) return { error: `${label} may contain up to eight URLs.` };
  if (values.some(value => !/^https?:\/\//i.test(value))) return { error: `${label} must contain only http or https URLs.` };
  return { values };
}

async function handleAdminCreateFounding50Application(request, env, actingUser) {
  const data = await readJson(request);
  const username = clean(data.accountUsername || data.username);
  if (!username) return json({ error: "An existing TPI account username is required." }, 400);
  const member = await getUserByUsername(env, username);
  if (!member || !member.active) return json({ error: "An active existing TPI account is required." }, 400);
  const contactEmail = clean(data.contactEmail).slice(0, 320).toLowerCase();
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return json({ error: "Contact email is invalid." }, 400);
  const websiteUrl = clean(data.websiteUrl).slice(0, 500);
  if (websiteUrl && !/^https?:\/\//i.test(websiteUrl)) return json({ error: "Website URL must start with http:// or https://." }, 400);
  const social = normalizeApplicationUrlList(data.socialChannels, "Social channels");
  const video = normalizeApplicationUrlList(data.videoChannels, "Video channels");
  if (social.error || video.error) return json({ error: social.error || video.error }, 400);
  const description = clean(data.creatorDescription || data.description).slice(0, 4000);
  const administrativeNotes = clean(data.administrativeNotes || data.notes).slice(0, 2000);
  try {
    const existing = await env.TPI_DB.prepare(`
      SELECT id, status FROM founding50_applications
      WHERE applicant_id = ? AND status IN ('pending', 'approved')
      ORDER BY created_at DESC LIMIT 1
    `).bind(member.id).first();
    if (existing) return json({ error: "This account already has a pending or approved Founding 50 application.", applicationId: existing.id }, 409);
    const id = crypto.randomUUID();
    await env.TPI_DB.prepare(`
      INSERT INTO founding50_applications
        (id, applicant_id, status, administrative_notes, contact_email, website_url, social_channels, video_channels, creator_description)
      VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?)
    `).bind(id, member.id, administrativeNotes, contactEmail, websiteUrl, JSON.stringify(social.values), JSON.stringify(video.values), description).run();
    await writeAdminAuditLog(env, actingUser, "founding50.application_created", "founding50_application", id, { applicantUsername: member.username, status: "pending" });
    return json({ application: { id, applicantId: member.id, username: member.username, status: "pending", readiness: "under_review" } }, 201);
  } catch (error) {
    return json({ error: "Creator application storage is not available in this development database." }, 503);
  }
}

async function handleAdminFounding50ApplicationStatus(path, request, env, actingUser) {
  const id = clean(decodeURIComponent(path.match(/^\/admin\/founding-50\/applications\/([^/]+)\/status$/)?.[1] || ""));
  const data = await readJson(request);
  const status = clean(data.status).toLowerCase();
  if (!id || !["approved", "rejected", "pending"].includes(status)) return json({ error: "A valid application and status are required." }, 400);
  try {
    const application = await env.TPI_DB.prepare("SELECT id, applicant_id, status FROM founding50_applications WHERE id = ?").bind(id).first();
    if (!application) return json({ error: "Founding 50 application was not found." }, 404);
    await env.TPI_DB.prepare("UPDATE founding50_applications SET status = ?, administrative_notes = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(status, clean(data.notes).slice(0, 2000), actingUser.id, id).run();
    await writeAdminAuditLog(env, actingUser, `founding50.application_${status}`, "founding50_application", id, { previousStatus: application.status });
    return json({ application: { id, status } });
  } catch (error) {
    return json({ error: "Founding 50 application storage is not available." }, 503);
  }
}

async function handleAdminCreatorPartnership(request, env) {
  const url = new URL(request.url);
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "25", 10) || 25, 100));
  const search = clean(url.searchParams.get("search")).slice(0, 120);
  const where = search ? "WHERE lower(c.username) LIKE lower(?) OR lower(c.display_name) LIKE lower(?) OR lower(cpm.membership_type) LIKE lower(?) OR lower(cpm.membership_state) LIKE lower(?)" : "";
  const binds = search ? Array(4).fill(`%${search}%`) : [];
  try {
    const count = await env.TPI_DB.prepare(`
      SELECT COUNT(*) AS total
      FROM creator_partnership_memberships cpm
      JOIN contributors c ON c.id = cpm.contributor_id
      ${where}
    `).bind(...binds).first();
    const { results } = await env.TPI_DB.prepare(`
      SELECT cpm.id, cpm.membership_type AS membershipType, cpm.membership_state AS membershipState,
             cpm.entitlement_code AS entitlementCode, cpm.founding50_slot AS founding50Slot,
             cpm.awarded_at AS awardedAt, cpm.created_at AS createdAt,
             c.username, c.display_name AS displayName, c.role, c.active,
             cse.entitlement_state AS creatorStudioEntitlementState
      FROM creator_partnership_memberships cpm
      JOIN contributors c ON c.id = cpm.contributor_id
      LEFT JOIN creator_studio_entitlements cse ON cse.contributor_id = c.id
      ${where}
      ORDER BY cpm.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...binds, pageSize, (page - 1) * pageSize).all();
    const total = Number(count?.total || 0);
    return json({ memberships: results || [], search, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (error) {
    return json({ memberships: [], search, pagination: { page, pageSize, total: 0, totalPages: 0 }, status: "migration_pending" });
  }
}

async function handleAdminCreatorDetail(path, env) {
  const username = clean(decodeURIComponent(path.match(/^\/admin\/creators\/([^/]+)$/)?.[1] || ""));
  if (!username) return json({ error: "Creator username is required." }, 400);
  const creator = await env.TPI_DB.prepare("SELECT id, username, display_name AS displayName, role, active, title, organization, website, created_at AS createdAt FROM contributors WHERE username = ?").bind(username).first();
  if (!creator) return json({ error: "Creator account was not found." }, 404);
  try {
    const [memberships, entitlements, applications, channels, history] = await Promise.all([
      env.TPI_DB.prepare(`SELECT id, membership_type AS membershipType, membership_state AS membershipState, entitlement_code AS entitlementCode, founding50_slot AS founding50Slot, awarded_at AS awardedAt, created_at AS createdAt, updated_at AS updatedAt, notes FROM creator_partnership_memberships WHERE contributor_id = ? ORDER BY created_at DESC`).bind(creator.id).all(),
      env.TPI_DB.prepare(`SELECT id, entitlement_code AS entitlementCode, entitlement_state AS entitlementState, granted_at AS grantedAt, revoked_at AS revokedAt, created_at AS createdAt, updated_at AS updatedAt FROM creator_studio_entitlements WHERE contributor_id = ? ORDER BY created_at DESC`).bind(creator.id).all(),
      env.TPI_DB.prepare(`SELECT id, status, administrative_notes AS administrativeNotes, contact_email AS contactEmail, website_url AS websiteUrl, social_channels AS socialChannels, video_channels AS videoChannels, creator_description AS creatorDescription, created_at AS createdAt, updated_at AS updatedAt, reviewed_at AS reviewedAt, reviewed_by AS reviewedBy FROM founding50_applications WHERE applicant_id = ? ORDER BY created_at DESC`).bind(creator.id).all(),
      env.TPI_DB.prepare(`SELECT ch.id, ch.slug, ch.display_name AS displayName, ch.description, ch.visibility, ch.created_at AS createdAt, ch.updated_at AS updatedAt, COUNT(CASE WHEN tv.status = 'published' THEN 1 END) AS publishedVideoCount FROM tpi_video_channels ch LEFT JOIN tpi_videos tv ON tv.channel_id = ch.id WHERE ch.owner_id = ? GROUP BY ch.id, ch.slug, ch.display_name, ch.description, ch.visibility, ch.created_at, ch.updated_at ORDER BY ch.updated_at DESC`).bind(creator.id).all(),
      env.TPI_DB.prepare(`SELECT id, actor_username AS actorUsername, actor_role AS actorRole, action, target_type AS targetType, target_id AS targetId, metadata_json AS metadata, created_at AS createdAt FROM admin_audit_logs WHERE (target_type = 'member' AND target_id = ?) OR (target_type = 'creator_partnership_membership' AND target_id IN (SELECT id FROM creator_partnership_memberships WHERE contributor_id = ?)) OR (target_type = 'founding50_application' AND target_id IN (SELECT id FROM founding50_applications WHERE applicant_id = ?)) ORDER BY created_at DESC LIMIT 100`).bind(username, creator.id, creator.id).all().catch(() => ({ results: [] }))
    ]);
    const parseList = value => safeJsonParse(value) || [];
    return json({ creator, memberships: memberships.results || [], entitlements: entitlements.results || [], applications: (applications.results || []).map(row => ({ ...row, socialChannels: parseList(row.socialChannels), videoChannels: parseList(row.videoChannels) })), channels: channels.results || [], history: (history.results || []).map(row => ({ ...row, metadata: safeJsonParse(row.metadata) || {} })) }, 200, { "Cache-Control": "no-store" });
  } catch (error) {
    return json({ error: "Creator management details are unavailable in this development database." }, 503);
  }
}

async function handleAdminCreatorStudioEntitlements(request, env) {
  const url = new URL(request.url);
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "25", 10) || 25, 100));
  try {
    const count = await env.TPI_DB.prepare("SELECT COUNT(*) AS total FROM creator_studio_entitlements").first();
    const { results } = await env.TPI_DB.prepare(`
      SELECT cse.id, cse.entitlement_code AS entitlementCode, cse.entitlement_state AS entitlementState,
             cse.granted_at AS grantedAt, cse.revoked_at AS revokedAt,
             c.username, c.display_name AS displayName, c.role, c.active
      FROM creator_studio_entitlements cse
      JOIN contributors c ON c.id = cse.contributor_id
      ORDER BY cse.granted_at DESC
      LIMIT ? OFFSET ?
    `).bind(pageSize, (page - 1) * pageSize).all();
    const total = Number(count?.total || 0);
    return json({ entitlements: results || [], pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (error) {
    return json({ entitlements: [], pagination: { page, pageSize, total: 0, totalPages: 0 }, status: "migration_pending" });
  }
}

async function handleAdminAllocateFounding50(request, env, actingUser) {
  const activationApproved = env.TPI_ENV === "development"
    ? String(env.FOUNDING50_DEVELOPMENT_ACTIVATION || "").toLowerCase() === "approved"
    : String(env.FOUNDING50_PRODUCTION_ACTIVATION || "").toLowerCase() === "approved";
  if (!activationApproved) {
    return json({ error: "Founding 50 activation is owner-gated. No membership or Creator Studio entitlement was changed." }, 423);
  }
  const data = await readJson(request);
  const username = clean(data.username);
  const applicationId = clean(data.applicationId);
  const application = applicationId
    ? await env.TPI_DB.prepare("SELECT id, applicant_id, status FROM founding50_applications WHERE id = ?").bind(applicationId).first()
    : null;
  if (applicationId && (!application || application.status !== "approved")) return json({ error: "An approved Founding 50 application is required before activation." }, 409);
  const member = application
    ? await env.TPI_DB.prepare("SELECT * FROM contributors WHERE id = ? AND active = 1").bind(application.applicant_id).first()
    : await getUserByUsername(env, username);
  if (!member || !member.active) return json({ error: "An active existing account is required." }, 400);
  try {
    const existing = await env.TPI_DB.prepare("SELECT id FROM creator_partnership_memberships WHERE contributor_id = ? AND membership_type = 'founding50'").bind(member.id).first();
    if (existing) return json({ error: "This account already has a Creator Partnership membership." }, 409);
    const slots = await env.TPI_DB.prepare("SELECT slot_number AS slot FROM founding50_allocations ORDER BY slot_number").all();
    const used = new Set((slots.results || []).map(row => Number(row.slot)));
    const slot = Array.from({ length: 50 }, (_, index) => index + 1).find(value => !used.has(value));
    if (!slot) return json({ error: "All 50 Founding 50 memberships have already been allocated." }, 409);
    const membershipId = crypto.randomUUID();
    const entitlementId = crypto.randomUUID();
    const historyId = crypto.randomUUID();
    await env.TPI_DB.batch([
      env.TPI_DB.prepare(`INSERT INTO creator_partnership_memberships (id, contributor_id, membership_type, membership_state, entitlement_code, founding50_slot, awarded_at, awarded_by, notes, application_id) VALUES (?, ?, 'founding50', 'active', 'creator_studio_lifetime', ?, CURRENT_TIMESTAMP, ?, ?, ?)`)
        .bind(membershipId, member.id, slot, actingUser.id, clean(data.notes).slice(0, 2000), application?.id || null),
      env.TPI_DB.prepare("INSERT INTO founding50_allocations (slot_number, membership_id, contributor_id, allocated_by) VALUES (?, ?, ?, ?)").bind(slot, membershipId, member.id, actingUser.id),
      env.TPI_DB.prepare("INSERT INTO creator_studio_entitlements (id, contributor_id, source_membership_id, entitlement_code, entitlement_state, granted_by) VALUES (?, ?, ?, 'creator_studio_lifetime', 'active', ?)").bind(entitlementId, member.id, membershipId, actingUser.id),
      env.TPI_DB.prepare("INSERT INTO creator_partnership_membership_history (id, membership_id, contributor_id, from_state, to_state, action, actor_id) VALUES (?, ?, ?, NULL, 'active', 'founding50_awarded', ?)").bind(historyId, membershipId, member.id, actingUser.id)
    ]);
    await writeAdminAuditLog(env, actingUser, "founding50.membership_awarded", "member", member.username, { slot, membershipId, entitlementId, applicationId: application?.id || null });
    return json({ membership: { id: membershipId, username: member.username, slot, membershipState: "active", entitlementState: "active" } }, 201);
  } catch (error) {
    if (String(error?.message || "").toLowerCase().includes("unique") || String(error?.message || "").toLowerCase().includes("constraint")) {
      return json({ error: "The account or Founding 50 slot was allocated concurrently. No duplicate award was created." }, 409);
    }
    return json({ error: "Founding 50 allocation could not be completed." }, 500);
  }
}

async function handleAdminFounding50MembershipStatus(path, request, env, actingUser) {
  const activationApproved = env.TPI_ENV === "development"
    ? String(env.FOUNDING50_DEVELOPMENT_ACTIVATION || "").toLowerCase() === "approved"
    : String(env.FOUNDING50_PRODUCTION_ACTIVATION || "").toLowerCase() === "approved";
  if (!activationApproved) {
    return json({ error: "Founding 50 status changes are owner-gated. No membership or entitlement was changed." }, 423);
  }
  const membershipId = clean(decodeURIComponent(path.match(/^\/admin\/founding-50\/memberships\/([^/]+)\/status$/)?.[1] || ""));
  const data = await readJson(request);
  const nextState = clean(data.status).toLowerCase();
  if (!membershipId || !["active", "suspended", "revoked"].includes(nextState)) {
    return json({ error: "A valid Founding 50 membership and status are required." }, 400);
  }
  try {
    const membership = await env.TPI_DB.prepare(`
      SELECT cpm.id, cpm.contributor_id AS contributorId, cpm.membership_type AS membershipType,
             cpm.membership_state AS membershipState, cpm.founding50_slot AS founding50Slot,
             c.username, c.active AS accountActive, cse.id AS entitlementId,
             cse.entitlement_state AS entitlementState
      FROM creator_partnership_memberships cpm
      JOIN contributors c ON c.id = cpm.contributor_id
      LEFT JOIN creator_studio_entitlements cse ON cse.source_membership_id = cpm.id
      WHERE cpm.id = ?
    `).bind(membershipId).first();
    if (!membership || membership.membershipType !== "founding50") return json({ error: "Founding 50 membership was not found." }, 404);
    if (membership.membershipState === nextState) return json({ error: `Membership is already ${nextState}.` }, 409);
    if (nextState === "active" && !membership.accountActive) return json({ error: "An inactive account cannot be reactivated." }, 409);
    const action = `founding50.membership_${nextState}`;
    const historyId = crypto.randomUUID();
    const entitlementState = nextState === "active" ? "active" : nextState;
    await env.TPI_DB.batch([
      env.TPI_DB.prepare(`
        UPDATE creator_partnership_memberships
        SET membership_state = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(nextState, membershipId),
      env.TPI_DB.prepare(`
        UPDATE creator_studio_entitlements
        SET entitlement_state = ?, revoked_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE source_membership_id = ?
      `).bind(entitlementState, nextState === "active" ? null : new Date().toISOString(), membershipId),
      env.TPI_DB.prepare(`
        INSERT INTO creator_partnership_membership_history
          (id, membership_id, contributor_id, from_state, to_state, action, notes, actor_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(historyId, membershipId, membership.contributorId, membership.membershipState, nextState, action, clean(data.notes).slice(0, 2000), actingUser.id)
    ]);
    await writeAdminAuditLog(env, actingUser, action, "creator_partnership_membership", membershipId, {
      username: membership.username,
      fromState: membership.membershipState,
      toState: nextState,
      founding50Slot: membership.founding50Slot,
      slotPolicy: "allocated_slots_are_not_recycled"
    });
    return json({ membership: {
      id: membershipId,
      username: membership.username,
      founding50Slot: membership.founding50Slot,
      membershipState: nextState,
      entitlementState
    }, slotConsumed: true, slotPolicy: "allocated_slots_are_not_recycled" });
  } catch (error) {
    return json({ error: "Founding 50 membership status could not be updated." }, 500);
  }
}
async function handleAdminAuditLogs(request, env) {
  const url = new URL(request.url);
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || url.searchParams.get("pageSize") || "50", 10), 1), 100);
  const offset = Math.min(Math.max(parseInt(url.searchParams.get("offset") || String((page - 1) * limit), 10), 0), 10000);
  const actor = clean(url.searchParams.get("actor")).slice(0, 120);
  const action = clean(url.searchParams.get("action")).slice(0, 120);
  const target = clean(url.searchParams.get("target")).slice(0, 160);
  const query = clean(url.searchParams.get("q")).slice(0, 160);
  const scope = clean(url.searchParams.get("scope")).toLowerCase();
  const from = clean(url.searchParams.get("from")).slice(0, 30);
  const to = clean(url.searchParams.get("to")).slice(0, 30);
  const filters = [];
  const binds = [];
  if (actor) { filters.push("actor_username LIKE ?"); binds.push(`%${actor}%`); }
  if (action) { filters.push("action LIKE ?"); binds.push(`%${action}%`); }
  if (target) { filters.push("(target_id LIKE ? OR target_type LIKE ?)"); binds.push(`%${target}%`, `%${target}%`); }
  if (query) { filters.push("(actor_username LIKE ? OR action LIKE ? OR target_id LIKE ? OR target_type LIKE ?)"); binds.push(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`); }
  if (scope === "moderation") {
    filters.push("(action LIKE '%moder%' OR action LIKE '%comment%' OR action LIKE '%community%' OR action LIKE '%block%' OR action LIKE '%deactivat%' OR action LIKE '%report%')");
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(from)) { filters.push("created_at >= ?"); binds.push(`${from}T00:00:00`); }
  if (/^\d{4}-\d{2}-\d{2}$/.test(to)) { filters.push("created_at <= ?"); binds.push(`${to}T23:59:59`); }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  try {
    const count = await env.TPI_DB.prepare(`SELECT COUNT(*) AS total FROM admin_audit_logs ${where}`).bind(...binds).first();
    const { results } = await env.TPI_DB.prepare(`
      SELECT id, actor_username AS actorUsername, actor_role AS actorRole,
             action, target_type AS targetType, target_id AS targetId,
             metadata_json AS metadata, created_at AS createdAt
      FROM admin_audit_logs
      ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...binds, limit, offset).all();
    const total = Number(count?.total || 0);
    return json({ logs: (results || []).map(row => ({
      ...row,
      metadata: safeJsonParse(row.metadata) || {}
    })), limit, offset, page, pagination: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) } }, 200, { "Cache-Control": "no-store" });
  } catch (error) {
    return json({ logs: [], limit, offset, status: "migration_pending" }, 200, { "Cache-Control": "no-store" });
  }
}

async function handleAdminReports(request, env) {
  const url = new URL(request.url);
  const requestedStatus = clean(url.searchParams.get("status") || "open").toLowerCase();
  const allowedStatuses = ["open", "pending", "reviewed", "dismissed", "actioned", "all"];
  const status = allowedStatuses.includes(requestedStatus) ? requestedStatus : "open";
  const search = clean(url.searchParams.get("search") || "").slice(0, 120);
  const requestedType = clean(url.searchParams.get("type") || "all").toLowerCase();
  const reportType = ["video", "messenger", "all"].includes(requestedType) ? requestedType : "all";
  const from = clean(url.searchParams.get("from") || "");
  const to = clean(url.searchParams.get("to") || "");
  const requestedSort = clean(url.searchParams.get("sort") || "created").toLowerCase();
  const sort = requestedSort === "status" ? "status" : "created";
  const direction = clean(url.searchParams.get("direction") || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "50", 10) || 50, 100));
  const offset = (page - 1) * pageSize;
  const filters = [];
  const binds = [];
  if (status !== "all") {
    filters.push(status === "open" ? "status IN ('open', 'pending')" : "status = ?");
    if (status !== "open") binds.push(status);
  }
  if (search) {
    const pattern = `%${search}%`;
    filters.push("(reportType LIKE ? OR contentLabel LIKE ? OR reason LIKE ? OR reporterUsername LIKE ? OR reporterName LIKE ? OR reportedUsername LIKE ? OR reportedName LIKE ?)");
    binds.push(pattern, pattern, pattern, pattern, pattern, pattern, pattern);
  }
  if (reportType !== "all") { filters.push("reportType = ?"); binds.push(reportType); }
  if (/^\d{4}-\d{2}-\d{2}$/.test(from)) { filters.push("createdAt >= ?"); binds.push(`${from}T00:00:00`); }
  if (/^\d{4}-\d{2}-\d{2}$/.test(to)) { filters.push("createdAt <= ?"); binds.push(`${to}T23:59:59`); }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const queueSource = `
    FROM (
      SELECT vr.id, 'video' AS reportType, 'video' AS contentType,
             vr.video_id AS contentId, tv.title AS contentLabel, vr.reason,
             vr.status, reporter.username AS reporterUsername,
             reporter.display_name AS reporterName, NULL AS reportedUsername,
             NULL AS reportedName, vr.created_at AS createdAt,
             vr.reviewed_at AS reviewedAt, reviewer.username AS reviewedBy,
             'Video report metadata only; report details are not exposed here.' AS evidenceNote
      FROM video_reports vr
      LEFT JOIN tpi_videos tv ON tv.id = vr.video_id
      LEFT JOIN contributors reporter ON reporter.id = vr.contributor_id
      LEFT JOIN contributors reviewer ON reviewer.id = vr.reviewed_by
      UNION ALL
      SELECT mr.id, 'messenger' AS reportType, 'private-conversation' AS contentType,
             NULL AS contentId, NULL AS contentLabel, mr.reason, mr.status,
             reporter.username AS reporterUsername, reporter.display_name AS reporterName,
             reported.username AS reportedUsername, reported.display_name AS reportedName,
             mr.created_at AS createdAt, mr.reviewed_at AS reviewedAt,
             reviewer.username AS reviewedBy,
             'Private conversation evidence is report-scoped and not exposed here.' AS evidenceNote
      FROM messenger_reports mr
      LEFT JOIN contributors reporter ON reporter.id = mr.reporter_id
      LEFT JOIN contributors reported ON reported.id = mr.reported_contributor_id
      LEFT JOIN contributors reviewer ON reviewer.id = mr.reviewed_by
    ) reportQueue`;
  const count = await env.TPI_DB.prepare(`SELECT COUNT(*) AS total ${queueSource} ${where}`).bind(...binds).first();
  const { results } = await env.TPI_DB.prepare(`
    SELECT id, reportType, contentType, contentId, contentLabel, reason, status,
           reporterUsername, reporterName, reportedUsername, reportedName,
           createdAt, reviewedAt, reviewedBy, evidenceNote
    ${queueSource}
    ${where}
    ORDER BY ${sort === "status" ? "status" : "createdAt"} ${direction}
    LIMIT ? OFFSET ?`).bind(...binds, pageSize, offset).all();
  const total = Number(count?.total || 0);
  return json({ reports: results || [], status, search, filters: { type: reportType, from, to, sort, direction: direction.toLowerCase() }, pagination: { page, pageSize, returned: (results || []).length, total, totalPages: Math.ceil(total / pageSize) }, metadataOnly: true }, 200, { "Cache-Control": "no-store" });
}

async function handleAdminReportDetail(path, env) {
  const match = path.match(/^\/admin\/reports\/(video|messenger)\/([^/]+)$/);
  const reportType = match?.[1] || "";
  const reportId = clean(decodeURIComponent(match?.[2] || ""));
  if (!reportId) return json({ error: "Report id is required." }, 400);
  try {
    let report;
    if (reportType === "video") {
      report = await env.TPI_DB.prepare(`
        SELECT vr.id, 'video' AS reportType, 'video' AS contentType,
               vr.video_id AS contentId, tv.title AS contentLabel, vr.reason,
               vr.status, reporter.username AS reporterUsername,
               reporter.display_name AS reporterName, vr.created_at AS createdAt,
               vr.reviewed_at AS reviewedAt, reviewer.username AS reviewedBy,
               'Video report details are limited to supported metadata; private media and credentials are excluded.' AS evidenceNote
        FROM video_reports vr
        LEFT JOIN tpi_videos tv ON tv.id = vr.video_id
        LEFT JOIN contributors reporter ON reporter.id = vr.contributor_id
        LEFT JOIN contributors reviewer ON reviewer.id = vr.reviewed_by
        WHERE vr.id = ?
      `).bind(reportId).first();
    } else {
      report = await env.TPI_DB.prepare(`
        SELECT mr.id, 'messenger' AS reportType, 'private-conversation' AS contentType,
               NULL AS contentId, NULL AS contentLabel, mr.reason, mr.status,
               reporter.username AS reporterUsername, reporter.display_name AS reporterName,
               reported.username AS reportedUsername, reported.display_name AS reportedName,
               mr.created_at AS createdAt, mr.reviewed_at AS reviewedAt,
               reviewer.username AS reviewedBy,
               'Private conversation evidence is report-scoped and not exposed here.' AS evidenceNote
        FROM messenger_reports mr
        LEFT JOIN contributors reporter ON reporter.id = mr.reporter_id
        LEFT JOIN contributors reported ON reported.id = mr.reported_contributor_id
        LEFT JOIN contributors reviewer ON reviewer.id = mr.reviewed_by
        WHERE mr.id = ?
      `).bind(reportId).first();
    }
    if (!report) return json({ error: "Report was not found." }, 404);
    const history = await env.TPI_DB.prepare(`
      SELECT id, actor_username AS actorUsername, actor_role AS actorRole,
             action, target_type AS targetType, target_id AS targetId,
             metadata_json AS metadata, created_at AS createdAt
      FROM admin_audit_logs
      WHERE target_type = ? AND target_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).bind(`${reportType}_report`, reportId).all().catch(() => ({ results: [] }));
    return json({ report, history: (history.results || []).map(row => ({ ...row, metadata: safeJsonParse(row.metadata) || {} })), privateEvidence: false, metadataOnly: true }, 200, { "Cache-Control": "no-store" });
  } catch (error) {
    return json({ error: "Report details are unavailable." }, 503);
  }
}

async function handleAdminReportStatus(path, request, env, actingUser) {
  const match = path.match(/^\/admin\/reports\/(video|messenger)\/([^/]+)\/status$/);
  const reportType = match?.[1] || "";
  const reportId = clean(decodeURIComponent(match?.[2] || ""));
  const data = await readJson(request);
  const status = clean(data.status).toLowerCase();
  const reason = clean(data.reason).slice(0, 500);
  const allowedStatuses = reportType === "video"
    ? ["open", "reviewed", "dismissed", "actioned"]
    : ["pending", "reviewed", "dismissed", "actioned"];
  if (!reportId) return json({ error: "Report id is required." }, 400);
  if (!allowedStatuses.includes(status)) return json({ error: "Report status was not recognized." }, 400);
  const table = reportType === "video" ? "video_reports" : "messenger_reports";
  const current = await env.TPI_DB.prepare(`SELECT id, status FROM ${table} WHERE id = ?`).bind(reportId).first();
  if (!current) return json({ error: "Report was not found." }, 404);
  if (status === "open" || status === "pending") {
    await env.TPI_DB.prepare(`UPDATE ${table} SET status = ?, reviewed_at = NULL, reviewed_by = NULL WHERE id = ?`).bind(status, reportId).run();
  } else {
    await env.TPI_DB.prepare(`UPDATE ${table} SET status = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ? WHERE id = ?`).bind(status, actingUser.id, reportId).run();
  }
  await writeAdminAuditLog(env, actingUser, `report.${status}`, `${reportType}_report`, reportId, { previousStatus: current.status, status, reason: reason || undefined });
  return json({ report: { id: reportId, reportType, status } });
}

async function handleAdminNotifications(request, env, actingUser) {
  const url = new URL(request.url);
  const requestedStatus = clean(url.searchParams.get("status") || "all").toLowerCase();
  const allowedStatuses = ["unread", "read", "all"];
  const status = allowedStatuses.includes(requestedStatus) ? requestedStatus : "all";
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "50", 10) || 50, 100));
  const offset = (page - 1) * pageSize;
  const type = clean(url.searchParams.get("type") || "").slice(0, 80);
  const filters = [];
  const filterBinds = [];
  if (status === "unread") filters.push("mn.read_at IS NULL");
  if (status === "read") filters.push("mn.read_at IS NOT NULL");
  if (type) { filters.push("mn.type = ?"); filterBinds.push(type); }
  const statusWhere = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const count = await env.TPI_DB.prepare(`SELECT COUNT(*) AS total FROM member_notifications mn ${statusWhere}`).bind(...filterBinds).first();
  const { results } = await env.TPI_DB.prepare(`
    SELECT mn.id, mn.title, mn.type, mn.read_at AS readAt, mn.created_at AS createdAt,
           CASE WHEN mn.contributor_id = ? THEN 1 ELSE 0 END AS canMutate,
           recipient.username AS recipientUsername, recipient.display_name AS recipientName,
           creator.username AS createdByUsername
    FROM member_notifications mn
    LEFT JOIN contributors recipient ON recipient.id = mn.contributor_id
    LEFT JOIN contributors creator ON creator.id = mn.created_by
    ${statusWhere}
    ORDER BY mn.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(actingUser.id, ...filterBinds, pageSize, offset).all();
  const total = Number(count?.total || 0);
  return json({ notifications: results || [], status, type, metadataOnly: true, privateContentBoundary: "Bodies and action targets are returned only by the owning member notification workflow.", pagination: { page, pageSize, returned: (results || []).length, total, totalPages: Math.ceil(total / pageSize) } }, 200, { "Cache-Control": "no-store" });
}

async function handleAdminNotificationDetail(path, env, actingUser) {
  const id = clean(decodeURIComponent(path.match(/^\/admin\/notifications\/([^/]+)$/)?.[1] || ""));
  if (!id) return json({ error: "Notification id is required." }, 400);
  const notification = await env.TPI_DB.prepare(`
    SELECT mn.id, mn.title, mn.type, mn.read_at AS readAt, mn.created_at AS createdAt,
           mn.contributor_id AS recipientId, mn.body, mn.action_href AS actionHref,
           recipient.username AS recipientUsername, recipient.display_name AS recipientName,
           creator.username AS createdByUsername
    FROM member_notifications mn
    LEFT JOIN contributors recipient ON recipient.id = mn.contributor_id
    LEFT JOIN contributors creator ON creator.id = mn.created_by
    WHERE mn.id = ?
  `).bind(id).first();
  if (!notification) return json({ error: "Notification was not found." }, 404);
  const ownsNotification = notification.recipientId === actingUser.id;
  const detail = { ...notification, body: ownsNotification ? notification.body : undefined, actionHref: ownsNotification ? notification.actionHref : undefined, canMutate: ownsNotification };
  delete detail.recipientId;
  return json({ notification: detail, metadataOnly: !ownsNotification, privateContentBoundary: ownsNotification ? "Owner-scoped notification content." : "Private notification content is not exposed to administrative oversight." }, 200, { "Cache-Control": "private, no-store" });
}

async function handleAdminNotificationState(path, env, actingUser) {
  const match = path.match(/^\/admin\/notifications\/([^/]+)\/(read|unread)$/);
  const id = clean(decodeURIComponent(match?.[1] || ""));
  const nextState = match?.[2];
  if (!id || !nextState) return json({ error: "Notification state is required." }, 400);
  const notification = await env.TPI_DB.prepare("SELECT id, contributor_id, read_at FROM member_notifications WHERE id = ?").bind(id).first();
  if (!notification) return json({ error: "Notification was not found." }, 404);
  if (notification.contributor_id !== actingUser.id) return json({ error: "Only the notification recipient can change its read state." }, 403);
  const readAt = nextState === "read" ? "CURRENT_TIMESTAMP" : "NULL";
  await env.TPI_DB.prepare(`UPDATE member_notifications SET read_at = ${readAt} WHERE id = ? AND contributor_id = ?`).bind(id, actingUser.id).run();
  await writeAdminAuditLog(env, actingUser, `notification.${nextState}`, "member_notification", id, { previousReadAt: notification.read_at || null });
  return json({ ok: true, id, read: nextState === "read" });
}

async function handleAdminMarkAllNotificationsRead(env, actingUser) {
  const result = await env.TPI_DB.prepare("UPDATE member_notifications SET read_at = datetime('now') WHERE contributor_id = ? AND read_at IS NULL").bind(actingUser.id).run();
  const updated = Number(result.meta?.changes || 0);
  if (updated) await writeAdminAuditLog(env, actingUser, "notification.read_all", "member_notifications", actingUser.id, { updated });
  return json({ ok: true, updated });
}

async function handleAdminChannels(request, env) {
  const url = new URL(request.url);
  const visibility = clean(url.searchParams.get("visibility") || "all").toLowerCase();
  const search = clean(url.searchParams.get("search") || "").slice(0, 120);
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "50", 10) || 50, 100));
  const offset = (page - 1) * pageSize;
  const filters = [];
  const binds = [];
  if (["public", "private"].includes(visibility)) {
    filters.push("ch.visibility = ?");
    binds.push(visibility);
  }
  if (search) {
    filters.push("(ch.display_name LIKE ? OR ch.slug LIKE ? OR owner.username LIKE ?)");
    const pattern = `%${search}%`;
    binds.push(pattern, pattern, pattern);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const baseFrom = `
    FROM tpi_video_channels ch
    LEFT JOIN contributors owner ON owner.id = ch.owner_id`;
  const count = await env.TPI_DB.prepare(`SELECT COUNT(*) AS total ${baseFrom} ${where}`).bind(...binds).first();
  const { results } = await env.TPI_DB.prepare(`
    SELECT ch.id, ch.slug, ch.display_name AS displayName, ch.visibility,
           ch.created_at AS createdAt, ch.updated_at AS updatedAt,
           owner.username AS ownerUsername, owner.display_name AS ownerName,
           COUNT(CASE WHEN tv.status = 'published' THEN 1 END) AS publishedVideoCount
    ${baseFrom}
    LEFT JOIN tpi_videos tv ON tv.channel_id = ch.id
    ${where}
    GROUP BY ch.id, ch.slug, ch.display_name, ch.visibility, ch.created_at,
             ch.updated_at, owner.username, owner.display_name
    ORDER BY ch.updated_at DESC
    LIMIT ? OFFSET ?
  `).bind(...binds, pageSize, offset).all();
  const total = Number(count?.total || 0);
  return json({ channels: results || [], visibility: ["public", "private"].includes(visibility) ? visibility : "all", search, metadataOnly: true, pagination: { page, pageSize, returned: (results || []).length, total, totalPages: Math.ceil(total / pageSize) } }, 200, { "Cache-Control": "no-store" });
}

async function handleAdminRoles(request, env) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT role,
           COUNT(*) AS total,
           SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS active,
           SUM(CASE WHEN can_post = 1 THEN 1 ELSE 0 END) AS canPost,
           SUM(CASE WHEN can_comment = 1 THEN 1 ELSE 0 END) AS canComment,
           SUM(CASE WHEN can_message = 1 THEN 1 ELSE 0 END) AS canMessage
    FROM contributors
    GROUP BY role
    ORDER BY CASE role
      WHEN 'owner' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'creator' THEN 3
      WHEN 'contributor' THEN 4
      WHEN 'member' THEN 5
      ELSE 6
    END, role
  `).all();
  return json({ roles: results || [], metadataOnly: true, mutationBoundary: "Role and capability changes remain on existing protected Contributor Management workflows." }, 200, { "Cache-Control": "no-store" });
}

async function handleAdminRestrictions(request, env) {
  const url = new URL(request.url);
  const search = clean(url.searchParams.get("search") || "").slice(0, 120);
  const paginated = url.searchParams.has("page") || url.searchParams.has("pageSize");
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "50", 10) || 50, 100));
  const binds = [];
  const filters = ["(active = 0 OR can_post = 0 OR can_comment = 0 OR can_message = 0)"];
  if (search) {
    filters.push("(username LIKE ? OR display_name LIKE ? OR role LIKE ?)");
    const pattern = `%${search}%`;
    binds.push(pattern, pattern, pattern);
  }
  const limitSql = paginated ? "LIMIT ? OFFSET ?" : "LIMIT 100";
  const { results } = await env.TPI_DB.prepare(`
    SELECT username, display_name AS displayName, title, role, active,
           can_post AS canPost, can_comment AS canComment, can_message AS canMessage,
           created_at AS createdAt
    FROM contributors
    WHERE ${filters.join(" AND ")}
    ORDER BY active ASC, username COLLATE NOCASE ASC
    ${limitSql}
  `).bind(...(paginated ? [...binds, pageSize, (page - 1) * pageSize] : binds)).all();
  const payload = { restrictions: (results || []).map(row => ({ ...row, active: Boolean(row.active), canPost: Boolean(row.canPost), canComment: Boolean(row.canComment), canMessage: Boolean(row.canMessage) })), search, metadataOnly: true, boundary: "Capability restrictions only; user-to-user member_restrictions and administrative suspension are separate workflows." };
  if (!paginated) return json(payload, 200, { "Cache-Control": "no-store" });
  const count = await env.TPI_DB.prepare(`SELECT COUNT(*) AS total FROM contributors WHERE ${filters.join(" AND ")}`).bind(...binds).first();
  const total = Number(count?.total || 0);
  return json({ ...payload, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } }, 200, { "Cache-Control": "no-store" });
}

async function handleAdminEvents(request, env) {
  const url = new URL(request.url);
  const requestedStatus = clean(url.searchParams.get("status")).toLowerCase();
  const status = ["approved", "pending", "rejected", "cancelled", "all"].includes(requestedStatus) ? requestedStatus : "approved";
  const search = clean(url.searchParams.get("search")).slice(0, 100);
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "50", 10) || 50, 100));
  const where = [];
  const binds = [];
  if (status !== "all") { where.push("e.status = ?"); binds.push(status); }
  if (search) {
    where.push("(e.title LIKE ? OR e.type LIKE ? OR e.category LIKE ? OR e.city LIKE ? OR e.state LIKE ? OR e.organizer_name LIKE ?)");
    const like = `%${search}%`;
    binds.push(like, like, like, like, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  try {
    const count = await env.TPI_DB.prepare(`SELECT COUNT(*) AS total FROM events e ${whereSql}`).bind(...binds).first();
    const { results } = await env.TPI_DB.prepare(`
      SELECT e.id, e.title, e.type, e.category, e.start_date, e.end_date,
             e.location_name, e.city, e.state, e.country, e.organizer_name,
             e.source, e.status, e.featured, e.created_at
      FROM events e
      ${whereSql}
      ORDER BY CASE e.status WHEN 'pending' THEN 1 WHEN 'approved' THEN 2 ELSE 3 END,
               e.start_date ASC, e.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...binds, pageSize, (page - 1) * pageSize).all();
    const total = Number(count?.total || 0);
    return json({ events: results || [], status, search, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }, metadataOnly: true, mutationBoundary: "Event creation, review, and lifecycle changes remain on the existing protected event workflow." }, 200, { "Cache-Control": "no-store" });
  } catch (error) {
    return json({ events: [], status, search, pagination: { page, pageSize, total: 0, totalPages: 0 }, metadataOnly: true, statusCode: "events_unavailable" }, 503);
  }
}

function adminEventIdFromPath(path) {
  return clean(decodeURIComponent(path.replace(/^\/admin\/events\//, "")));
}

async function getAdminEvent(path, env) {
  const id = adminEventIdFromPath(path);
  if (!id) return { id: "", event: null };
  const event = await env.TPI_DB.prepare("SELECT * FROM events WHERE id = ? LIMIT 1").bind(id).first();
  return { id, event };
}

async function handleAdminEventDetail(path, env) {
  const { id, event } = await getAdminEvent(path, env);
  if (!id) return json({ error: "Event id is required." }, 400);
  if (!event) return json({ error: "Event not found." }, 404);
  return json({ event, metadataOnly: true }, 200, { "Cache-Control": "no-store" });
}

function eventMutationValues(data) {
  const requestedStatus = clean(data.status || "approved").toLowerCase();
  const maxAttendeesRaw = data.maxAttendees;
  const maxAttendees = maxAttendeesRaw === "" || maxAttendeesRaw == null ? null : Number(maxAttendeesRaw);
  const maxAttendeesValid = maxAttendees === null || (Number.isInteger(maxAttendees) && maxAttendees >= 0);
  const organizerUrl = clean(data.organizerUrl || "");
  const imageUrl = clean(data.imageUrl || "");
  const virtualLink = clean(data.virtualLink || "");
  return {
    title: clean(data.title),
    description: clean(data.description || ""),
    type: clean(data.type || ""),
    category: clean(data.category || "general"),
    startDate: clean(data.startDate || ""),
    endDate: clean(data.endDate || ""),
    locationName: clean(data.locationName || ""),
    address: clean(data.address || ""),
    city: clean(data.city || ""),
    state: clean(data.state || ""),
    country: clean(data.country || "United States"),
    isVirtual: data.isVirtual ? 1 : 0,
    virtualLink,
    platform: clean(data.platform || ""),
    organizerName: clean(data.organizerName || data.organizer || ""),
    organizerUrl,
    imageUrl,
    maxAttendees,
    maxAttendeesValid,
    price: clean(data.price || ""),
    status: ["approved", "pending", "rejected", "cancelled"].includes(requestedStatus) ? requestedStatus : "approved",
    featured: data.featured ? 1 : 0
  };
}

function isValidEventDate(value) {
  return Boolean(value && Number.isFinite(new Date(value).getTime()));
}

function isValidEventUrl(value) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function validateEventMutation(values) {
  if (!values.title) return "Title is required.";
  if (!values.type) return "Event type is required.";
  if (!isValidEventDate(values.startDate)) return "A valid start date and time are required.";
  if (values.endDate && !isValidEventDate(values.endDate)) return "The end date and time are invalid.";
  if (values.endDate && new Date(values.endDate).getTime() < new Date(values.startDate).getTime()) return "The end date and time cannot be before the start date and time.";
  if (!isValidEventUrl(values.virtualLink) || !isValidEventUrl(values.organizerUrl) || !isValidEventUrl(values.imageUrl)) return "Event links must use http:// or https:// URLs.";
  if (!values.maxAttendeesValid) return "Maximum attendees must be a non-negative whole number.";
  if (!["approved", "pending", "rejected", "cancelled"].includes(values.status)) return "Event status was not recognized.";
  return "";
}

async function handleAdminEventUpdate(path, request, env, user) {
  const { id, event } = await getAdminEvent(path, env);
  if (!id) return json({ error: "Event id is required." }, 400);
  if (!event) return json({ error: "Event not found." }, 404);
  const data = await readJson(request);
  const values = eventMutationValues(data);
  const validationError = validateEventMutation(values);
  if (validationError) return json({ error: validationError }, 400);

  await env.TPI_DB.prepare(`
    UPDATE events SET title = ?, description = ?, type = ?, category = ?, start_date = ?, end_date = ?,
      location_name = ?, address = ?, city = ?, state = ?, country = ?, is_virtual = ?, virtual_link = ?,
      platform = ?, organizer_name = ?, organizer_url = ?, image_url = ?, max_attendees = ?, price = ?,
      status = ?, featured = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    values.title, values.description, values.type, values.category, values.startDate, values.endDate,
    values.locationName, values.address, values.city, values.state, values.country, values.isVirtual,
    values.virtualLink, values.platform, values.organizerName, values.organizerUrl, values.imageUrl,
    values.maxAttendees, values.price, values.status, values.featured, id
  ).run();
  await writeAdminAuditLog(env, user, "event.updated", "event", id, { previousStatus: event.status, status: values.status, title: values.title });
  const updated = await env.TPI_DB.prepare("SELECT * FROM events WHERE id = ? LIMIT 1").bind(id).first();
  return json({ ok: true, event: updated }, 200, { "Cache-Control": "no-store" });
}

async function handleAdminEventCancel(path, env, user) {
  const { id, event } = await getAdminEvent(path, env);
  if (!id) return json({ error: "Event id is required." }, 400);
  if (!event) return json({ error: "Event not found." }, 404);
  await env.TPI_DB.prepare("UPDATE events SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(id).run();
  await writeAdminAuditLog(env, user, "event.cancelled", "event", id, { previousStatus: event.status, title: event.title });
  return json({ ok: true, status: "cancelled" }, 200, { "Cache-Control": "no-store" });
}

async function writeAdminAuditLog(env, actor, action, targetType = null, targetId = null, metadata = {}) {
  try {
    await env.TPI_DB.prepare(`
      INSERT INTO admin_audit_logs
        (id, actor_id, actor_username, actor_role, action, target_type, target_id, metadata_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(), actor?.id || null, clean(actor?.username || "unknown"), clean(actor?.role || "unknown"),
      clean(action).slice(0, 120), clean(targetType).slice(0, 80) || null,
      clean(targetId).slice(0, 160) || null, JSON.stringify(metadata || {})
    ).run();
  } catch (error) {
    // Audit logging must never turn a completed admin action into a failed
    // request while an older deployment is still missing the new table.
  }
}

async function handleAdminSetMemberActive(path, env, actingUser, active) {
  const username = clean(decodeURIComponent(path.replace(/^\/admin\/members\//, "").replace(/\/(?:un)?block$/, "")));
  if (!username) return json({ error: "Member username is required." }, 400);
  const target = await getUserByUsername(env, username);
  if (!target) return json({ error: "Member was not found." }, 404);
  if (target.id === actingUser.id) return json({ error: "You cannot block your own account." }, 400);
  if (target.role === "owner" && actingUser.role !== "owner") return json({ error: "Only the owner can change a director account." }, 403);

  await env.TPI_DB.prepare("UPDATE contributors SET active = ? WHERE username = ?")
    .bind(active ? 1 : 0, username)
    .run();

  await writeAdminAuditLog(env, actingUser, active ? "member.reactivated" : "member.deactivated", "member", username);

  const updated = await getUserByUsername(env, username);
  return json({ member: { username: updated.username, displayName: updated.display_name, title: updated.title, role: updated.role, active: Boolean(updated.active) } });
}

async function handleAdminUpdateMemberAccess(path, request, env, actingUser) {
  const username = clean(decodeURIComponent(path.match(/^\/admin\/members\/([^/]+)\/access$/)?.[1] || ""));
  if (!username) return json({ error: "Member username is required." }, 400);
  const target = await getUserByUsername(env, username);
  if (!target) return json({ error: "Member was not found." }, 404);
  if (target.role === "owner" && actingUser.role !== "owner") return json({ error: "Only the owner can change a director account." }, 403);
  const data = await readJson(request);
  await env.TPI_DB.prepare(`
    UPDATE contributors
    SET can_post = ?, can_comment = ?, can_message = ?
    WHERE username = ?
  `).bind(
    data.canPost === false ? 0 : 1,
    data.canComment === false ? 0 : 1,
    data.canMessage === false ? 0 : 1,
    username
  ).run();
  await writeAdminAuditLog(env, actingUser, "member.access_updated", "member", username, {
    canPost: data.canPost !== false,
    canComment: data.canComment !== false,
    canMessage: data.canMessage !== false
  });
  const updated = await getUserByUsername(env, username);
  return json({ member: privateMemberUser(updated) });
}

async function handleAdminSendMemberNotification(path, request, env, actingUser) {
  const username = clean(decodeURIComponent(path.match(/^\/admin\/members\/([^/]+)\/notifications$/)?.[1] || ""));
  if (!username) return json({ error: "Member username is required." }, 400);
  const target = await getUserByUsername(env, username);
  if (!target) return json({ error: "Member was not found." }, 404);
  const data = await readJson(request);
  if (!categoryEnabledForType(target.notification_prefs, data.type || "profile-request")) {
    return json({ suppressed: true, category: NOTIFICATION_TYPE_CATEGORY[normalizeNotificationType(data.type)] || "other", username: target.username }, 200, { "Cache-Control": "no-store" });
  }
  const title = clean(data.title || "Please verify your account email").slice(0, 160);
  const body = clean(data.body || "Please confirm that your account email is current. Phone and address information are optional and private.").slice(0, 1000);
  const actionHref = clean(data.actionHref || "member-dashboard.html").slice(0, 500);
  const id = crypto.randomUUID();
  await env.TPI_DB.prepare(`
    INSERT INTO member_notifications (id, contributor_id, title, body, action_href, type, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, target.id, title, body, actionHref, clean(data.type || "profile-request"), actingUser.id).run();
  await writeAdminAuditLog(env, actingUser, "member.notification_sent", "member", username, {
    type: clean(data.type || "profile-request"),
    title
  });
  return json({ notification: { id, username: target.username, title, body, actionHref, read: false } });
}

async function notifyActiveMembers(env, notification) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT id, notification_prefs AS notificationPrefs FROM contributors WHERE active = 1 AND id != ?
  `).bind(notification.excludeContributorId || "").all();
  const recipients = (results || []).filter(recipient => categoryEnabledForType(recipient.notificationPrefs, notification.type));
  if (!recipients.length) return 0;
  await env.TPI_DB.batch(recipients.map(recipient => env.TPI_DB.prepare(`
    INSERT INTO member_notifications (id, contributor_id, title, body, action_href, type, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    recipient.id,
    clean(notification.title).slice(0, 160),
    clean(notification.body).slice(0, 500),
    clean(notification.actionHref).slice(0, 500),
    clean(notification.type).slice(0, 60),
    notification.createdBy || null
  )));
  return recipients.length;
}

async function createCommunityContentNotifications(env, user, content) {
  const actionHref = `member-home.html?member=1#post-${encodeURIComponent(content.postId)}`;
  const kindLabel = content.isComment ? "commented on a community post" : "posted in the community";
  const authorName = user.display_name || user.username || "A member";
  await notifyActiveMembers(env, {
    title: `${authorName} ${kindLabel}`,
    body: clean(content.body).slice(0, 180),
    actionHref,
    type: "community_post",
    createdBy: user.id,
    excludeContributorId: user.id
  });
  const attachments = Array.isArray(content.attachments) ? content.attachments : [];
  if (!content.isComment && attachments.some(item => item.mediaType === "image")) {
    await notifyActiveMembers(env, {
      title: `${authorName} added new photos`,
      body: `Open the community post to see the new photos.`,
      actionHref,
      type: "photo",
      createdBy: user.id,
      excludeContributorId: user.id
    });
  }
  if (!content.isComment && attachments.some(item => item.mediaType === "video")) {
    await notifyActiveMembers(env, {
      title: `${authorName} added a new video`,
      body: `Open the community post to watch the new video.`,
      actionHref,
      type: "video",
      createdBy: user.id,
      excludeContributorId: user.id
    });
  }
}

async function handleMyPulse(request, env, user) {
  const counts = {
    likes: 0,
    following: 0,
    posts: 0,
    comments: 0,
    uploads: 0,
    liveStreams: 0
  };
  const queries = [
    env.TPI_DB.prepare("SELECT COUNT(*) AS n FROM community_reactions WHERE contributor_id = ?").bind(user.id).first(),
    env.TPI_DB.prepare("SELECT COUNT(*) AS n FROM article_reactions WHERE contributor_id = ?").bind(user.id).first(),
    env.TPI_DB.prepare("SELECT COUNT(*) AS n FROM video_reactions WHERE contributor_id = ?").bind(user.id).first(),
    env.TPI_DB.prepare("SELECT COUNT(*) AS n FROM community_posts WHERE author_id = ? AND status = 'visible'").bind(user.id).first(),
    env.TPI_DB.prepare("SELECT COUNT(*) AS n FROM comments WHERE contributor_id = ? AND status = 'approved'").bind(user.id).first(),
    env.TPI_DB.prepare("SELECT COUNT(*) AS n FROM video_comments WHERE contributor_id = ? AND status = 'visible'").bind(user.id).first(),
    env.TPI_DB.prepare("SELECT COUNT(*) AS n FROM community_comments WHERE author_id = ? AND status = 'visible'").bind(user.id).first(),
    env.TPI_DB.prepare("SELECT COUNT(*) AS n FROM articles WHERE created_by = ? AND status = 'published'").bind(user.id).first()
  ];
  const results = await Promise.all(queries.map(q => q.catch(() => ({ n: 0 }))));
  counts.likes = Number(results[0]?.n || 0) + Number(results[1]?.n || 0) + Number(results[2]?.n || 0);
  // Posts = community posts + community comments + published articles.
  counts.posts = Number(results[3]?.n || 0) + Number(results[6]?.n || 0) + Number(results[7]?.n || 0);
  counts.comments = Number(results[4]?.n || 0) + Number(results[5]?.n || 0);
  // R2 media keys are area/<username>/<date>/... so a prefix scan counts
  // this member's uploads directly.
  if (env.TPI_MEDIA && typeof env.TPI_MEDIA.list === "function" && user.username) {
    const safeUser = clean(user.username).toLowerCase().replace(/[^a-z0-9-]/g, "-") || "contributor";
    const markers = ["/" + safeUser + "/"];
    try {
      let cursor, done = false;
      while (!done) {
        const page = await env.TPI_MEDIA.list({ cursor, limit: 500 });
        for (const obj of (page.objects || [])) {
          for (const marker of markers) {
            if (obj.key.includes(marker)) { counts.uploads++; break; }
          }
        }
        if (page.truncated && page.cursor) { cursor = page.cursor; } else { done = true; }
      }
    } catch (e) { /* media count stays at what we could read */ }
  }
  return json({ pulse: counts });
}

async function handleAdminCommunityPosts(request, env) {
  const url = new URL(request.url);
  const username = clean(url.searchParams.get("username"));
  if (!username) {
    const search = clean(url.searchParams.get("search")).slice(0, 100);
    const author = clean(url.searchParams.get("author")).slice(0, 80);
    const sort = clean(url.searchParams.get("sort")).toLowerCase();
    const direction = clean(url.searchParams.get("direction")).toLowerCase() === "asc" ? "ASC" : "DESC";
    const sortColumn = sort === "updated" ? "cp.updated_at" : "cp.created_at";
    const requestedStatus = clean(url.searchParams.get("status")).toLowerCase();
    // Active is the safe default for administrative lists: deleted records
    // remain in D1 and are available only through an explicit deleted view.
    const status = ["visible", "hidden", "deleted", "active"].includes(requestedStatus) ? requestedStatus : "active";
    const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
    const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "25", 10) || 25, 100));
    const where = [];
    const binds = [];
    if (status === "active") where.push("cp.status IN ('visible', 'hidden')");
    else { where.push("cp.status = ?"); binds.push(status); }
    if (search) { where.push("(cp.title LIKE ? OR cp.body LIKE ? OR c.username LIKE ? OR c.display_name LIKE ?)"); const like = `%${search}%`; binds.push(like, like, like, like); }
    if (author) { where.push("c.username LIKE ?"); binds.push(`%${author}%`); }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    try {
      const count = await env.TPI_DB.prepare(`SELECT COUNT(*) AS total FROM community_posts cp LEFT JOIN contributors c ON c.id = cp.author_id ${whereSql}`).bind(...binds).first();
      const { results } = await env.TPI_DB.prepare(`
        SELECT cp.id, cp.title, substr(cp.body, 1, 240) AS preview, cp.status,
               cp.created_at AS createdAt, c.username AS authorUsername,
               c.display_name AS authorDisplayName, cc.title AS categoryTitle,
               (SELECT COUNT(*) FROM community_comments cm WHERE cm.post_id = cp.id AND cm.status != 'deleted') AS commentCount,
               (SELECT COUNT(*) FROM community_reactions cr WHERE cr.target_type = 'post' AND cr.target_id = cp.id) AS reactionCount
        FROM community_posts cp
        LEFT JOIN contributors c ON c.id = cp.author_id
        LEFT JOIN community_categories cc ON cc.id = cp.category_id
        ${whereSql}
        ORDER BY ${sortColumn} ${direction}
        LIMIT ? OFFSET ?
      `).bind(...binds, pageSize, (page - 1) * pageSize).all();
      const total = Number(count?.total || 0);
      return json({ posts: results || [], pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }, filters: { search, author, sort: sort === "updated" ? "updated" : "created", direction: direction.toLowerCase() } });
    } catch (error) {
      return json({ posts: [], pagination: { page, pageSize, total: 0, totalPages: 0 }, status: "community_unavailable" }, 503);
    }
  }
  const member = await getUserByUsername(env, username);
  if (!member) return json({ error: "Member was not found." }, 404);

  const postsQuery = env.TPI_DB.prepare(`
    SELECT
      cp.id,
      cp.body,
      cp.status,
      cp.created_at AS createdAt,
      cc.title AS categoryTitle
    FROM community_posts cp
    LEFT JOIN community_categories cc ON cc.id = cp.category_id
    WHERE cp.author_id = ?
    ORDER BY cp.created_at DESC
    LIMIT 100
  `).bind(member.id);
  const commentsQuery = env.TPI_DB.prepare(`
    SELECT
      cm.id,
      cm.post_id AS postId,
      cm.body,
      cm.status,
      cm.created_at AS createdAt,
      '' AS topicTitle,
      '' AS categoryTitle
    FROM community_comments cm
    WHERE cm.author_id = ?
    ORDER BY cm.created_at DESC
    LIMIT 100
  `).bind(member.id);

  const [postsResult, commentsResult] = await Promise.all([postsQuery.all().catch(() => ({ results: [] })), commentsQuery.all().catch(() => ({ results: [] }))]);

  const posts = (postsResult.results || []).map(row => ({
    ...row,
    topicId: row.id,
    topicTitle: "Community post",
    topicStatus: row.status
  }));
  // Include comment activity as separate rows so leadership sees the member's
  // full community footprint (posts and comments in one list).
  const comments = (commentsResult.results || []).map(row => ({
    id: row.id,
    topicId: row.postId,
    topicTitle: "Community comment",
    topicStatus: row.status,
    body: row.body,
    status: row.status,
    createdAt: row.createdAt,
    categoryTitle: "Comment"
  }));

  return json({
    member: { username: member.username, displayName: member.display_name, title: member.title, role: member.role, active: Boolean(member.active) },
    posts: posts.concat(comments).sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
  });
}

async function handleAdminSetCommunityPostStatus(path, request, env, actingUser) {
  const postId = clean(decodeURIComponent(path.match(/^\/admin\/community\/posts\/([^/]+)\/status$/)?.[1] || ""));
  const data = await readJson(request);
  const status = clean(data.status).toLowerCase();
  if (!postId) return json({ error: "Post id is required." }, 400);
  if (!["visible", "hidden", "deleted"].includes(status)) {
    return json({ error: "Post status was not recognized." }, 400);
  }

  const post = await env.TPI_DB.prepare("SELECT id, title, status FROM community_posts WHERE id = ?").bind(postId).first();
  if (!post) return json({ error: "Post was not found." }, 404);

  await env.TPI_DB.prepare("UPDATE community_posts SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(status, postId)
    .run();

  await writeAdminAuditLog(env, actingUser, "community.post_status_updated", "community_post", postId, {
    previousStatus: post.status,
    status
  });

  return json({ post: { id: post.id, title: post.title, status } });
}

async function handleAdminCommunityPostDetail(path, env) {
  const postId = clean(decodeURIComponent(path.match(/^\/admin\/community\/posts\/([^/]+)$/)?.[1] || ""));
  if (!postId) return json({ error: "Post id is required." }, 400);
  try {
    const post = await env.TPI_DB.prepare(`
      SELECT cp.id, cp.title, cp.body, cp.status, cp.created_at AS createdAt,
             cp.updated_at AS updatedAt, cc.title AS categoryTitle,
             c.username AS authorUsername, c.display_name AS authorDisplayName,
             c.role AS authorRole
      FROM community_posts cp
      LEFT JOIN community_categories cc ON cc.id = cp.category_id
      LEFT JOIN contributors c ON c.id = cp.author_id
      WHERE cp.id = ?
    `).bind(postId).first();
    if (!post) return json({ error: "Post was not found." }, 404);
    const [comments, reactions] = await Promise.all([
      env.TPI_DB.prepare(`
        SELECT cm.id, cm.post_id AS postId, substr(cm.body, 1, 500) AS preview,
               cm.status, cm.created_at AS createdAt,
               c.username AS authorUsername, c.display_name AS authorDisplayName
        FROM community_comments cm
        LEFT JOIN contributors c ON c.id = cm.author_id
        WHERE cm.post_id = ?
        ORDER BY cm.created_at DESC
        LIMIT 100
      `).bind(postId).all(),
      env.TPI_DB.prepare(`
        SELECT cr.id, cr.reaction, cr.created_at AS createdAt,
               c.username AS contributorUsername, c.display_name AS contributorDisplayName
        FROM community_reactions cr
        LEFT JOIN contributors c ON c.id = cr.contributor_id
        WHERE cr.target_type = 'post' AND cr.target_id = ?
        ORDER BY cr.created_at DESC
        LIMIT 100
      `).bind(postId).all()
    ]);
    return json({
      post,
      comments: comments.results || [],
      reactions: reactions.results || [],
      reports: [],
      reportsAvailable: false,
      reportsNote: "No community-post report table or supported report contract is present; video and private-message reports remain separate."
    }, 200, { "Cache-Control": "no-store" });
  } catch (error) {
    return json({ error: "Community post details are unavailable." }, 503);
  }
}

async function handleAdminCommunityComments(request, env) {
  const url = new URL(request.url);
  const requestedStatus = clean(url.searchParams.get("status")).toLowerCase();
  const status = ["visible", "deleted", "all"].includes(requestedStatus) ? requestedStatus : "visible";
  const search = clean(url.searchParams.get("search")).slice(0, 100);
  const author = clean(url.searchParams.get("author")).slice(0, 80);
  const from = clean(url.searchParams.get("from"));
  const to = clean(url.searchParams.get("to"));
  const requestedSort = clean(url.searchParams.get("sort")).toLowerCase();
  const sort = requestedSort === "updated" ? "updated" : "created";
  const direction = clean(url.searchParams.get("direction")).toLowerCase() === "asc" ? "ASC" : "DESC";
  const sortColumn = sort === "updated" ? "cm.updated_at" : "cm.created_at";
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "25", 10) || 25, 100));
  const where = [];
  const binds = [];
  if (status !== "all") { where.push("cm.status = ?"); binds.push(status); }
  if (search) {
    where.push("(cm.body LIKE ? OR cp.title LIKE ? OR c.username LIKE ? OR c.display_name LIKE ?)");
    const like = `%${search}%`;
    binds.push(like, like, like, like);
  }
  if (author) { where.push("(c.username LIKE ? OR c.display_name LIKE ?)"); binds.push(`%${author}%`, `%${author}%`); }
  if (/^\d{4}-\d{2}-\d{2}$/.test(from)) { where.push("cm.created_at >= ?"); binds.push(`${from}T00:00:00`); }
  if (/^\d{4}-\d{2}-\d{2}$/.test(to)) { where.push("cm.created_at <= ?"); binds.push(`${to}T23:59:59`); }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  try {
    const count = await env.TPI_DB.prepare(`
      SELECT COUNT(*) AS total
      FROM community_comments cm
      LEFT JOIN community_posts cp ON cp.id = cm.post_id
      LEFT JOIN contributors c ON c.id = cm.author_id
      ${whereSql}
    `).bind(...binds).first();
    const { results } = await env.TPI_DB.prepare(`
      SELECT cm.id, cm.post_id AS postId, substr(cm.body, 1, 240) AS preview,
             cm.status, cm.created_at AS createdAt,
             cp.title AS postTitle, cp.status AS postStatus,
             c.username AS authorUsername, c.display_name AS authorDisplayName
      FROM community_comments cm
      LEFT JOIN community_posts cp ON cp.id = cm.post_id
      LEFT JOIN contributors c ON c.id = cm.author_id
      ${whereSql}
      ORDER BY ${sortColumn} ${direction}
      LIMIT ? OFFSET ?
    `).bind(...binds, pageSize, (page - 1) * pageSize).all();
    const total = Number(count?.total || 0);
    return json({ comments: results || [], pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }, filters: { status, search, author, from, to, sort, direction: direction.toLowerCase() }, metadataOnly: true });
  } catch (error) {
    return json({ comments: [], pagination: { page, pageSize, total: 0, totalPages: 0 }, filters: { status, search, author, from, to, sort, direction: direction.toLowerCase() }, metadataOnly: true, status: "community_comments_unavailable" }, 503);
  }
}

async function handleAdminCommunityCommentDetail(path, env) {
  const commentId = clean(decodeURIComponent(path.match(/^\/admin\/community\/comments\/([^/]+)$/)?.[1] || ""));
  if (!commentId) return json({ error: "Comment id is required." }, 400);
  try {
    const comment = await env.TPI_DB.prepare(`
      SELECT cm.id, cm.post_id AS postId, cm.body, cm.status,
             cm.created_at AS createdAt, cm.updated_at AS updatedAt,
             c.username AS authorUsername, c.display_name AS authorDisplayName,
             c.role AS authorRole, cp.title AS postTitle, cp.body AS postBody,
             cp.status AS postStatus, cp.author_id AS postAuthorId
      FROM community_comments cm
      LEFT JOIN contributors c ON c.id = cm.author_id
      LEFT JOIN community_posts cp ON cp.id = cm.post_id
      WHERE cm.id = ?
    `).bind(commentId).first();
    if (!comment) return json({ error: "Community comment was not found." }, 404);
    const reactions = await env.TPI_DB.prepare(`
      SELECT cr.id, cr.reaction, cr.created_at AS createdAt,
             c.username AS contributorUsername, c.display_name AS contributorDisplayName
      FROM community_reactions cr
      LEFT JOIN contributors c ON c.id = cr.contributor_id
      WHERE cr.target_type = 'comment' AND cr.target_id = ?
      ORDER BY cr.created_at DESC
      LIMIT 100
    `).bind(commentId).all();
    return json({
      comment,
      reactions: reactions.results || [],
      replies: [],
      repliesAvailable: false,
      repliesNote: "Community comments do not have a parent-comment/reply field in the current TPI schema; replies are not represented as a supported administrative relationship.",
      reports: [],
      reportsAvailable: false,
      reportsNote: "No community-comment report table or supported report contract is present; video and private-message reports remain separate."
    }, 200, { "Cache-Control": "no-store" });
  } catch (error) {
    return json({ error: "Community comment details are unavailable." }, 503);
  }
}

async function handleMarkAllNotificationsRead(request, env, user) {
  const result = await env.TPI_DB.prepare(
    "UPDATE member_notifications SET read_at = datetime('now') WHERE contributor_id = ? AND read_at IS NULL"
  ).bind(user.id).run();
  return json({ ok: true, updated: (result.meta && result.meta.changes) || 0 }, 200, { "Cache-Control": "no-store" });
}

async function handleListNotifications(env, user) {
  const prefs = parseNotificationPrefs(user.notification_prefs);
  const { results } = await env.TPI_DB.prepare(`
    SELECT id, title, body, action_href AS actionHref, type, read_at AS readAt, created_at AS createdAt
    FROM member_notifications
    WHERE contributor_id = ?
    ORDER BY read_at IS NOT NULL ASC, created_at DESC
    LIMIT 100
  `).bind(user.id).all();
  const notifications = (results || []).map(notification => ({ ...notification, read: Boolean(notification.readAt) }));

  const chatNotifications = prefs.chat ? await getChatNotifications(env, user) : [];
  const allNotifications = notifications.concat(chatNotifications).sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (a.read !== b.read) return a.read ? 1 : -1;
    return bTime - aTime;
  }).slice(0, 100);

  return json({ notifications: allNotifications }, 200, { "Cache-Control": "no-store" });
}

async function getChatNotifications(env, user) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT c.id AS conversationId, c.title, c.direct,
           m.id AS messageId, m.body, m.created_at AS createdAt,
           sender.id AS senderId, sender.username AS senderUsername, sender.display_name AS senderDisplayName,
           rs.last_read_at AS lastReadAt
    FROM conversations c
    JOIN conversation_participants cp ON cp.conversation_id = c.id
    JOIN messages m ON m.conversation_id = c.id AND m.deleted_at IS NULL
    JOIN contributors sender ON sender.id = m.contributor_id
    LEFT JOIN message_read_state rs ON rs.conversation_id = c.id AND rs.contributor_id = ?
    WHERE cp.contributor_id = ?
      AND m.contributor_id != ?
      AND m.created_at > COALESCE(rs.last_read_at, '1970-01-01')
      AND (cp.muted_until IS NULL OR cp.muted_until <= CURRENT_TIMESTAMP)
      AND NOT EXISTS (
        SELECT 1 FROM member_restrictions mr
        WHERE mr.restrictor_id = ? AND mr.restricted_id = m.contributor_id
      )
    ORDER BY m.created_at DESC
  `).bind(user.id, user.id, user.id, user.id).all();

  const seen = new Set();
  const notifications = [];
  for (const row of results || []) {
    const conversationId = row.conversationId;
    if (seen.has(conversationId)) continue;
    seen.add(conversationId);
    const preview = String(row.body || "").slice(0, 120);
    const senderName = row.senderDisplayName || row.senderUsername || "Someone";
    notifications.push({
      id: `chat-${conversationId}`,
      title: `${senderName} sent you a message`,
      body: preview ? `"${preview}"` : "New chat message",
      actionHref: "#messenger",
      type: "chat",
      read: false,
      createdAt: row.createdAt,
      conversationId: conversationId,
      chat: true
    });
  }
  return notifications;
}

async function handleNotificationUnreadCount(env, user) {
  const row = await env.TPI_DB.prepare(`
    SELECT COUNT(*) AS unreadCount
    FROM member_notifications
    WHERE contributor_id = ? AND read_at IS NULL
  `).bind(user.id).first();
  const tableCount = Number(row?.unreadCount || 0);
  const chatCount = await getChatUnreadCount(env, user);
  return json({ unreadCount: tableCount + chatCount });
}

async function getChatUnreadCount(env, user) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT COUNT(DISTINCT c.id) AS count
    FROM conversations c
    JOIN conversation_participants cp ON cp.conversation_id = c.id
    WHERE cp.contributor_id = ?
      AND (cp.muted_until IS NULL OR cp.muted_until <= CURRENT_TIMESTAMP)
      AND EXISTS (
        SELECT 1 FROM messages m
        WHERE m.conversation_id = c.id AND m.deleted_at IS NULL AND m.contributor_id != ?
          AND m.created_at > COALESCE((SELECT last_read_at FROM message_read_state WHERE conversation_id = c.id AND contributor_id = ?), '1970-01-01')
          AND NOT EXISTS (
            SELECT 1 FROM member_restrictions mr
            WHERE mr.restrictor_id = ? AND mr.restricted_id = m.contributor_id
          )
      )
  `).bind(user.id, user.id, user.id, user.id).all();
  return Number((results && results[0] && results[0].count) || 0);
}

async function handleMarkNotificationRead(path, env, user) {
  const id = clean(decodeURIComponent(path.match(/^\/notifications\/([^/]+)\/read$/)?.[1] || ""));
  if (!id) return json({ error: "Notification id is required." }, 400);

  if (String(id).startsWith("chat-")) {
    const conversationId = id.slice(5);
    const access = await requireConversationAccess(env, conversationId, user);
    if (!access) return json({ error: "Conversation not found." }, 404);
    const latest = await env.TPI_DB.prepare(`
      SELECT id FROM messages WHERE conversation_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1
    `).bind(conversationId).first();
    const now = new Date().toISOString();
    await env.TPI_DB.prepare(`
      INSERT INTO message_read_state (conversation_id, contributor_id, last_read_message_id, last_read_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(conversation_id, contributor_id) DO UPDATE SET
        last_read_message_id = excluded.last_read_message_id,
        last_read_at = excluded.last_read_at
    `).bind(conversationId, user.id, latest ? latest.id : null, now).run();
    // Clear hidden state so conversation reappears in CHATS when notification is opened
    await env.TPI_DB.prepare(`
      UPDATE conversation_participants SET hidden_at = NULL, archived_at = NULL
      WHERE conversation_id = ? AND contributor_id = ?
    `).bind(conversationId, user.id).run();
    return json({ ok: true, id });
  }

  await env.TPI_DB.prepare(`
    UPDATE member_notifications
    SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
    WHERE id = ? AND contributor_id = ?
  `).bind(id, user.id).run();
  return json({ ok: true, id });
}

async function handleAdminGetSettings(env) {
  return json({ settings: await getSiteSettings(env) });
}

async function handleAdminUpdateSettings(request, env, user) {
  const data = await readJson(request);
  const allowed = [
    "autoRestrictUnverifiedEmail",
    "requireVerifiedEmailToPost",
    "requireVerifiedEmailToComment",
    "requireVerifiedEmailToMessage"
  ];
  const pairs = {
    autoRestrictUnverifiedEmail: "auto_restrict_unverified_email",
    requireVerifiedEmailToPost: "require_verified_email_to_post",
    requireVerifiedEmailToComment: "require_verified_email_to_comment",
    requireVerifiedEmailToMessage: "require_verified_email_to_message"
  };
  for (const key of allowed) {
    if (!(key in data)) continue;
    await env.TPI_DB.prepare(`
      INSERT INTO site_settings (key, value, updated_by, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = CURRENT_TIMESTAMP
    `).bind(pairs[key], data[key] ? "1" : "0", user.id).run();
  }
  await writeAdminAuditLog(env, user, "site.settings_updated", "site_settings", "general", {
    keys: allowed.filter(key => key in data)
  });
  return json({ settings: await getSiteSettings(env) });
}

async function handleAdminMemberActivity(path, request, env) {
  const username = clean(decodeURIComponent(path.match(/^\/admin\/members\/([^/]+)\/activity$/)?.[1] || ""));
  if (!username) return json({ error: "Member username is required." }, 400);
  const member = await getUserByUsername(env, username);
  if (!member) return json({ error: "Member was not found." }, 404);
  const activityUrl = new URL(request.url);
  const activityPage = Math.max(1, Math.min(parseInt(activityUrl.searchParams.get("page") || "1", 10) || 1, 10000));
  const activityPageSize = Math.max(1, Math.min(parseInt(activityUrl.searchParams.get("pageSize") || "25", 10) || 25, 100));
  const activityOffset = (activityPage - 1) * activityPageSize;

  const { results: postResults } = await env.TPI_DB.prepare(`
    SELECT
      cp.id,
      cp.body,
      cp.status,
      cp.created_at AS createdAt,
      cc.title AS categoryTitle
    FROM community_posts cp
    LEFT JOIN community_categories cc ON cc.id = cp.category_id
    WHERE cp.author_id = ?
    ORDER BY cp.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(member.id, activityPageSize, activityOffset).all();

  const { results: commentResultsRows } = await env.TPI_DB.prepare(`
    SELECT
      cm.id,
      cm.body,
      cm.status,
      cm.created_at AS createdAt
    FROM community_comments cm
    WHERE cm.author_id = ?
    ORDER BY cm.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(member.id, activityPageSize, activityOffset).all();

  const { results: videoResults } = await env.TPI_DB.prepare(`
    SELECT id, slug, title, category, status, published_at AS publishedAt, created_at AS createdAt, thumbnail, video_url AS videoUrl
    FROM tpi_videos
    WHERE created_by = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).bind(member.id, activityPageSize, activityOffset).all();

  const { results: articleResults } = await env.TPI_DB.prepare(`
    SELECT id, destination, href, title, subtitle, article_type AS contributionType, author, source, labels, status, created_at AS createdAt, updated_at AS updatedAt
    FROM articles
    WHERE created_by = ? OR lower(author) IN (lower(?), lower(?))
    ORDER BY COALESCE(updated_at, created_at) DESC
    LIMIT ? OFFSET ?
  `).bind(member.id, member.display_name || "", member.username || "", activityPageSize, activityOffset).all();

  const { results: commentResults } = await env.TPI_DB.prepare(`
    SELECT id, page_id AS pageId, parent_id AS parentId, name, author_title AS authorTitle, text, status, created_at AS createdAt
    FROM comments
    WHERE contributor_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).bind(member.id, activityPageSize, activityOffset).all();

  const { results: videoCommentResults } = await env.TPI_DB.prepare(`
    SELECT vc.id, vc.video_id AS videoId, vc.body, vc.status, vc.created_at AS createdAt, tv.slug AS videoSlug, tv.title AS videoTitle
    FROM video_comments vc
    LEFT JOIN tpi_videos tv ON tv.id = vc.video_id
    WHERE vc.contributor_id = ?
    ORDER BY vc.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(member.id, activityPageSize, activityOffset).all();

  const [communityReactionRows, articleReactionRows, videoReactionRows, videoReportRows, messengerReportRows, moderationHistoryRows] = await Promise.all([
    env.TPI_DB.prepare(`
      SELECT cr.id, cr.target_type AS targetType, cr.target_id AS targetId,
             cr.reaction, cr.created_at AS createdAt,
             CASE WHEN cr.target_type = 'post' THEN cp.title ELSE substr(cc.body, 1, 180) END AS label,
             CASE WHEN cr.target_type = 'post' THEN '/member-home.html?member=1#post-' || cr.target_id
                  ELSE '/member-home.html?member=1#post-' || cc.post_id END AS contentHref
      FROM community_reactions cr
      LEFT JOIN community_posts cp ON cr.target_type = 'post' AND cp.id = cr.target_id
      LEFT JOIN community_comments cc ON cr.target_type = 'comment' AND cc.id = cr.target_id
      WHERE cr.contributor_id = ?
      ORDER BY cr.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(member.id, activityPageSize, activityOffset).all().catch(() => ({ results: [] })),
    env.TPI_DB.prepare(`
      SELECT ar.id, 'article' AS targetType, ar.page_id AS targetId,
             ar.reaction, ar.created_at AS createdAt, ar.page_id AS label,
             NULL AS contentHref
      FROM article_reactions ar
      WHERE ar.contributor_id = ?
      ORDER BY ar.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(member.id, activityPageSize, activityOffset).all().catch(() => ({ results: [] })),
    env.TPI_DB.prepare(`
      SELECT vr.id, 'video' AS targetType, vr.video_id AS targetId,
             vr.reaction, vr.created_at AS createdAt, tv.title AS label,
             '/tpi-video.html?id=' || vr.video_id AS contentHref
      FROM video_reactions vr
      LEFT JOIN tpi_videos tv ON tv.id = vr.video_id
      WHERE vr.contributor_id = ?
      ORDER BY vr.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(member.id, activityPageSize, activityOffset).all().catch(() => ({ results: [] })),
    env.TPI_DB.prepare(`
      SELECT vr.id, 'video' AS reportType, vr.video_id AS contentId,
             tv.title AS contentLabel, vr.reason, vr.details AS description,
             vr.status, vr.created_at AS createdAt, vr.reviewed_at AS reviewedAt,
             'submitted' AS memberRelation
      FROM video_reports vr
      LEFT JOIN tpi_videos tv ON tv.id = vr.video_id
      WHERE vr.contributor_id = ?
      ORDER BY vr.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(member.id, activityPageSize, activityOffset).all().catch(() => ({ results: [] })),
    env.TPI_DB.prepare(`
      SELECT mr.id, 'messenger' AS reportType, 'private-conversation' AS contentType,
             mr.reason, mr.status, mr.created_at AS createdAt, mr.reviewed_at AS reviewedAt,
             CASE WHEN mr.reporter_id = ? THEN 'submitted' ELSE 'reported' END AS memberRelation,
             'message evidence is report-scoped and not included in member activity' AS evidenceNote
      FROM messenger_reports mr
      WHERE mr.reporter_id = ? OR mr.reported_contributor_id = ?
      ORDER BY mr.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(member.id, member.id, member.id, activityPageSize, activityOffset).all().catch(() => ({ results: [] })),
    env.TPI_DB.prepare(`
      SELECT id, action, actor_username AS actorUsername, actor_role AS actorRole,
             target_type AS targetType, target_id AS targetId,
             metadata_json AS metadata, created_at AS createdAt
      FROM admin_audit_logs
      WHERE target_type IN ('member', 'contributor') AND target_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(member.username, activityPageSize, activityOffset).all().catch(() => ({ results: [] }))
  ]);

  const communityPostRows = (postResults || []).map(row => ({
    ...row,
    topicId: row.id,
    topicTitle: "Community post",
    topicStatus: row.status
  }));
  const communityCommentRows = (commentResultsRows || []).map(row => ({
    ...row,
    topicId: row.id,
    topicTitle: "Community comment",
    topicStatus: row.status,
    categoryTitle: "Comment"
  }));
  await attachCommunityMedia(env, communityPostRows, "post");
  await attachCommunityMedia(env, communityCommentRows, "comment");
  const posts = communityPostRows.concat(communityCommentRows)
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  const photos = posts.flatMap(post => (post.attachments || [])
    .filter(item => item.mediaType === "image")
    .map(item => ({ ...item, postId: post.id, topicTitle: post.topicTitle, createdAt: post.createdAt })));
  const communityVideos = posts.flatMap(post => (post.attachments || [])
    .filter(item => item.mediaType === "video")
    .map(item => ({ ...item, postId: post.id, topicTitle: post.topicTitle, createdAt: post.createdAt })));

  return json({
    member: privateMemberUser(member),
    posts,
    photos,
    communityVideos,
    tpiVideos: videoResults || [],
    articles: articleResults || [],
    comments: commentResults || [],
    videoComments: videoCommentResults || [],
    reactionActivity: [...(communityReactionRows.results || []), ...(articleReactionRows.results || []), ...(videoReactionRows.results || [])]
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))),
    reports: [...(videoReportRows.results || []), ...(messengerReportRows.results || [])]
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))),
    moderationHistory: (moderationHistoryRows.results || []).map(row => ({ ...row, metadata: safeJsonParse(row.metadata) || {} })),
    activityPagination: {
      page: activityPage,
      pageSize: activityPageSize,
      hasMore: {
        posts: (postResults || []).length === activityPageSize,
        comments: (commentResultsRows || []).length === activityPageSize,
        videos: (videoResults || []).length === activityPageSize,
        articles: (articleResults || []).length === activityPageSize,
        reactions: (communityReactionRows.results || []).length + (articleReactionRows.results || []).length + (videoReactionRows.results || []).length >= activityPageSize,
        reports: (videoReportRows.results || []).length + (messengerReportRows.results || []).length >= activityPageSize,
        moderationHistory: (moderationHistoryRows.results || []).length === activityPageSize
      }
    }
  });
}

// ===== Admin: member community activity + post status =====

async function handleAdminListComments(request, env) {
  const url = new URL(request.url);
  const status = clean(url.searchParams.get("status") || "pending");
  const allowedStatus = ["pending", "approved"].includes(status) ? status : "pending";
  const paginated = url.searchParams.has("page") || url.searchParams.has("pageSize");
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "50", 10) || 50, 100));
  const limitSql = paginated ? "LIMIT ? OFFSET ?" : "LIMIT 100";
  const { results } = await env.TPI_DB.prepare(`
    SELECT cm.id, cm.page_id AS pageId, cm.parent_id AS parentId, cm.name, cm.author_title AS authorTitle, c.username AS authorUsername, cm.text, cm.status, cm.created_at AS createdAt
    FROM comments cm
    LEFT JOIN contributors c ON c.id = cm.contributor_id
    WHERE cm.status = ?
    ORDER BY cm.created_at DESC
    ${limitSql}
  `).bind(...(paginated ? [allowedStatus, pageSize, (page - 1) * pageSize] : [allowedStatus])).all();
  if (!paginated) return json({ comments: results });
  const count = await env.TPI_DB.prepare("SELECT COUNT(*) AS total FROM comments WHERE status = ?").bind(allowedStatus).first();
  const total = Number(count?.total || 0);
  return json({ comments: results, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}

async function handleAdminApproveComment(path, env) {
  const id = clean(decodeURIComponent(path.replace(/^\/admin\/comments\//, "").replace(/\/approve$/, "")));
  if (!id) return json({ error: "Comment id is required." }, 400);
  await env.TPI_DB.prepare("UPDATE comments SET status = 'approved' WHERE id = ?").bind(id).run();
  return json({ ok: true, id });
}

async function handleAdminDeleteComment(path, env) {
  const id = clean(decodeURIComponent(path.replace(/^\/admin\/comments\//, "")));
  if (!id) return json({ error: "Comment id is required." }, 400);
  await env.TPI_DB.prepare("DELETE FROM comments WHERE id = ? OR parent_id = ?").bind(id, id).run();
  return json({ deleted: true, id });
}

async function handleCheckInvite(request, env) {
  const data = await readJson(request);
  const invite = await getOpenInvite(env, clean(data.code));
  if (!invite) return json({ error: "Invite code was not found or has already been used." }, 404);
  return json({ invite: { code: invite.code, role: invite.role } });
}

async function handleRegister(request, env) {
  const data = await readJson(request);
  const invite = await getOpenInvite(env, clean(data.inviteCode));
  if (!invite) return json({ error: "Invite code was not found or has already been used." }, 404);

  const username = clean(data.username);
  const password = String(data.password || "");
  if (!username || !password || !clean(data.displayName)) {
    return json({ error: "Display name, username, and password are required." }, 400);
  }
  if (!isValidUsername(username)) return json({ error: "Username cannot contain spaces. Use letters, numbers, dashes, underscores, periods, or symbols." }, 400);
  if (await getUserByUsername(env, username)) return json({ error: "That username already exists." }, 409);
  const email = clean(data.correspondence || data.email).toLowerCase();
  if (!email || !email.includes("@")) return json({ error: "A valid email address is required." }, 400);
  if (email && await getUserByEmail(env, email)) return json({ error: "That email is already connected to an account." }, 409);
  const inviteAssignment = getInviteAssignment(invite.code);
  const assignedTitle = inviteAssignment?.title || clean(data.title);
  if (isProtectedOrgTitle(data.title) && !inviteAssignment && !["owner", "admin"].includes(invite.role)) {
    return json({ error: "That leadership title is assigned by site leadership." }, 403);
  }

  const id = crypto.randomUUID();
  await env.TPI_DB.batch([
    env.TPI_DB.prepare(`
      INSERT INTO contributors (
        id, username, password_hash, display_name, title, role, correspondence,
        contact_name, phone, address_line1, address_line2, city, state, postal_code,
        affiliation, organization, website, bio, photo_url, comment_signature_enabled, active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).bind(
      id,
      username,
      await hashPassword(password),
      clean(data.displayName),
      assignedTitle,
      inviteAssignment?.role || invite.role,
      email,
      clean(data.contactName || data.displayName),
      clean(data.phone),
      clean(data.addressLine1),
      clean(data.addressLine2),
      clean(data.city),
      clean(data.state),
      clean(data.postalCode),
      clean(data.affiliation),
      clean(data.organization),
      clean(data.website),
      clean(data.bio),
      clean(data.photoUrl),
      data.commentSignatureEnabled === false ? 0 : 1
    ),
    env.TPI_DB.prepare("UPDATE invite_codes SET used = 1, used_by = ?, used_at = CURRENT_TIMESTAMP WHERE code = ?").bind(username, invite.code)
  ]);

  return json({ ok: true });
}

async function handleUpdateProfile(request, env, user) {
  const data = await readJson(request);
  if (isProtectedOrgTitle(data.title) && !["owner", "admin"].includes(user.role)) {
    return json({ error: "That leadership title is assigned by site leadership." }, 403);
  }
  const correspondence = clean(data.correspondence).toLowerCase();
  if (!correspondence || !correspondence.includes("@")) {
    return json({ error: "A valid account email address is required." }, 400);
  }
  const existingEmailUser = await getUserByEmail(env, correspondence);
  if (existingEmailUser && existingEmailUser.id !== user.id) {
    return json({ error: "That email is already connected to another account." }, 409);
  }
  await env.TPI_DB.prepare(`
    UPDATE contributors SET
      display_name = ?,
      title = ?,
      correspondence = ?,
      contact_name = ?,
      phone = ?,
      address_line1 = ?,
      address_line2 = ?,
      city = ?,
      state = ?,
      postal_code = ?,
      affiliation = ?,
      organization = ?,
      website = ?,
      bio = ?,
      photo_url = ?,
      comment_signature_enabled = ?,
      chat_color = ?
    WHERE id = ?
  `).bind(
    clean(data.displayName || user.display_name),
    clean(data.title).slice(0, 160),
    correspondence,
    clean(data.contactName || data.displayName || user.display_name),
    clean(data.phone),
    clean(data.addressLine1),
    clean(data.addressLine2),
    clean(data.city),
    clean(data.state),
    clean(data.postalCode),
    clean(data.affiliation),
    clean(data.organization),
    clean(data.website),
    clean(data.bio),
    clean(data.photoUrl || user.photo_url),
    data.commentSignatureEnabled === false ? 0 : 1,
    normalizeChatColor(data.chatColor || user.chat_color),
    user.id
  ).run().catch(async error => {
    if (!String(error.message || "").includes("chat_color")) throw error;
    await env.TPI_DB.prepare(`
      UPDATE contributors SET
        display_name = ?,
        title = ?,
        correspondence = ?,
        contact_name = ?,
        phone = ?,
        address_line1 = ?,
        address_line2 = ?,
        city = ?,
        state = ?,
        postal_code = ?,
        affiliation = ?,
        organization = ?,
        website = ?,
        bio = ?,
        photo_url = ?,
        comment_signature_enabled = ?
      WHERE id = ?
    `).bind(
      clean(data.displayName || user.display_name),
      clean(data.title).slice(0, 160),
      correspondence,
      clean(data.contactName || data.displayName || user.display_name),
      clean(data.phone),
      clean(data.addressLine1),
      clean(data.addressLine2),
      clean(data.city),
      clean(data.state),
      clean(data.postalCode),
      clean(data.affiliation),
      clean(data.organization),
      clean(data.website),
      clean(data.bio),
      clean(data.photoUrl || user.photo_url),
      data.commentSignatureEnabled === false ? 0 : 1,
      user.id
    ).run();
  });
  if (correspondence !== clean(user.correspondence).toLowerCase()) {
    await env.TPI_DB.prepare("UPDATE contributors SET email_verified = 0 WHERE id = ?").bind(user.id).run();
  }
  const updated = await env.TPI_DB.prepare("SELECT * FROM contributors WHERE id = ?").bind(user.id).first();
  return json({ user: privateMemberUser(updated) });
}

async function handleUpdateUsername(request, env, user) {
  const data = await readJson(request);
  const username = clean(data.username);
  if (!isValidUsername(username)) {
    return json({ error: "Username cannot contain spaces. Use letters, numbers, dashes, underscores, periods, or symbols." }, 400);
  }
  if (username === user.username) return json({ user: privateMemberUser(user) });
  const existing = await getUserByUsername(env, username);
  if (existing) return json({ error: "That username already exists." }, 409);

  await env.TPI_DB.prepare("UPDATE contributors SET username = ? WHERE id = ?")
    .bind(username, user.id)
    .run();
  await env.TPI_DB.prepare("UPDATE invite_codes SET used_by = ? WHERE used_by = ?")
    .bind(username, user.username)
    .run();

  const updated = await env.TPI_DB.prepare("SELECT * FROM contributors WHERE id = ?").bind(user.id).first();
  return json({ user: privateMemberUser(updated) });
}

async function handleChangePassword(request, env, user) {
  const data = await readJson(request);
  const currentPassword = String(data.currentPassword || "");
  const newPassword = String(data.newPassword || "");
  if (!currentPassword || !newPassword) return json({ error: "Current password and new password are required." }, 400);
  if (newPassword.length < 8) return json({ error: "New password must be at least 8 characters." }, 400);
  if (user.password_hash !== await hashPassword(currentPassword)) return json({ error: "Current password did not match." }, 401);

  await env.TPI_DB.prepare("UPDATE contributors SET password_hash = ? WHERE id = ?")
    .bind(await hashPassword(newPassword), user.id)
    .run();
  return json({ ok: true });
}

async function handleProfilePhotoUpload(request, env, user) {
  if (!env.TPI_MEDIA) return json({ error: "R2 media bucket binding TPI_MEDIA is not configured yet." }, 501);
  const upload = await readUploadFile(request);
  if (!upload) return json({ error: "Choose a profile photo to upload." }, 400);
  if (!upload.type.startsWith("image/")) return json({ error: "Profile photo must be an image file." }, 400);

  const key = makeMediaKey("profiles", user.username, upload.name, upload.type);
  await env.TPI_MEDIA.put(key, upload.body, {
    httpMetadata: { contentType: upload.type },
    customMetadata: { contributorId: user.id, purpose: "profile-photo", originalName: upload.name }
  });
  await recordMemberUpload(env, user, key, upload);
  const url = `/api/media/${key}`;
  await env.TPI_DB.prepare("UPDATE contributors SET photo_url = ? WHERE id = ?").bind(url, user.id).run();
  const updated = await env.TPI_DB.prepare("SELECT * FROM contributors WHERE id = ?").bind(user.id).first();
  return json({ url, key, user: privateMemberUser(updated) });
}

async function handleArticleMediaUpload(request, env, user) {
  return handleMediaUpload(request, env, user, "articles", "article-media");
}

async function handleCommunityMediaUpload(request, env, user) {
  return handleMediaUpload(request, env, user, "community", "community-media", [
    "image/",
    "video/",
    "application/pdf",
    "application/json",
    "application/rtf",
    "application/msword",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.oasis.opendocument.text",
    "application/zip",
    "text/plain",
    "text/csv",
    "application/octet-stream"
  ]);
}

async function handleMessengerMediaUpload(request, env, user) {
  return handleMediaUpload(request, env, user, "messenger", "messenger-media", ["image/", "video/", "audio/", "application/pdf", "text/plain", "application/octet-stream"]);
}

async function handleMediaUpload(request, env, user, area, purpose, allowedTypes) {
  if (!env.TPI_MEDIA) return json({ error: "R2 media bucket binding TPI_MEDIA is not configured yet." }, 501);
  const upload = await readUploadFile(request);
  if (!upload) return json({ error: "Choose a media file to upload." }, 400);

  const allowed = allowedTypes || [
    "image/",
    "video/",
    "audio/",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
  ];
  if (!allowed.some(prefix => upload.type === prefix || upload.type.startsWith(prefix))) {
    return json({ error: "That file type is not allowed for this upload." }, 400);
  }
  const maxBytes = upload.type.startsWith("audio/") ? 10 * 1024 * 1024 : 25 * 1024 * 1024;
  if (upload.size > maxBytes) {
    const sizeMessage = upload.type.startsWith("audio/")
      ? "Voice messages must be 10 MB or smaller."
      : purpose === "community-media"
        ? "Community attachments must be 25 MB or smaller."
        : purpose === "messenger-media"
          ? "Messenger attachments must be 25 MB or smaller."
        : "Messenger photos and videos must be 25 MB or smaller.";
    return json({ error: sizeMessage }, 413);
  }

  const key = makeMediaKey(area, user.username, upload.name, upload.type);
  await env.TPI_MEDIA.put(key, upload.body, {
    httpMetadata: { contentType: upload.type },
    customMetadata: { contributorId: user.id, purpose, originalName: upload.name }
  });
  const libraryId = await recordMemberUpload(env, user, key, upload);
  return json({ id: libraryId, url: `/api/media/${key}`, key, contentType: upload.type, name: upload.name });
}

async function hasMessengerMediaAccess(env, url, user) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT conversation_id AS conversationId, attachments
    FROM messages
    WHERE deleted_at IS NULL AND attachments LIKE ?
    LIMIT 100
  `).bind(`%${url}%`).all();
  for (const row of results || []) {
    const attachments = safeJsonParse(row.attachments);
    if (!Array.isArray(attachments) || !attachments.some(item => item?.url === url)) continue;
    if (await requireConversationAccess(env, row.conversationId, user)) return true;
  }
  return false;
}

async function handleMediaRequest(path, env, request) {
  if (!env.TPI_MEDIA) return json({ error: "R2 media bucket binding TPI_MEDIA is not configured yet." }, 501);
  const key = decodeURIComponent(path.replace(/^\/media\//, ""));
  if (!key || key.includes("..")) return json({ error: "Media key is invalid." }, 400);
  if (key.startsWith("messenger/")) {
    const user = await getSessionUser(request, env);
    if (!user) return json({ error: "Member login required." }, 401, { "Cache-Control": "private, no-store" });
    const url = `/api/media/${key}`;
    if (!await hasMessengerMediaAccess(env, url, user)) {
      return json({ error: "Media file not found." }, 404, { "Cache-Control": "private, no-store" });
    }
  }
  if (key.startsWith("private-library/")) {
    const user = await getSessionUser(request, env);
    if (!user) return json({ error: "Member login required." }, 401, { "Cache-Control": "private, no-store" });
    const metadata = await env.TPI_MEDIA.head(key);
    if (!metadata || metadata.customMetadata?.contributorId !== user.id) return json({ error: "Media file not found." }, 404, { "Cache-Control": "private, no-store" });
  }
  const object = await env.TPI_MEDIA.get(key);
  if (!object) return json({ error: "Media file not found." }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", key.startsWith("private-library/") ? "private, no-store" : "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Content-Security-Policy", "default-src 'none'; img-src 'self'; media-src 'self'; style-src 'none'");
  return new Response(object.body, { headers });
}

async function handleCreateArticle(request, env, user) {
  const data = await readJson(request);
  const id = clean(data.id || crypto.randomUUID());
  const status = data.status === "published" ? "published" : "draft";
  const href = clean(data.href || `published-article.html?id=${encodeURIComponent(id)}`);
  const destination = clean(data.destination);
  const title = clean(data.title || "Untitled Content");
  if (status === "published" && (!title || title.toLowerCase().startsWith("untitled"))) {
    return json({ error: "A real title is required before publishing." }, 400);
  }
  const subtitle = clean(data.subtitle);
  const contributionType = clean(data.contributionType || data.articleType || "Research Paper");
  const author = clean(data.author);
  const source = clean(data.source);
  const labels = clean(data.labels);
  const existingArticle = await env.TPI_DB.prepare("SELECT status FROM articles WHERE id = ?").bind(id).first();
  await env.TPI_DB.prepare(`
    INSERT INTO articles (id, destination, href, title, subtitle, article_type, author, source, body_html, article_html, labels, status, created_by, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      destination = excluded.destination,
      href = excluded.href,
      title = excluded.title,
      subtitle = excluded.subtitle,
      article_type = excluded.article_type,
      author = excluded.author,
      source = excluded.source,
      body_html = excluded.body_html,
      article_html = excluded.article_html,
      labels = excluded.labels,
      status = excluded.status,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    id,
    destination,
    href,
    title,
    subtitle,
    contributionType,
    author,
    source,
    String(data.bodyHtml || ""),
    String(data.articleHtml || ""),
    labels,
    status,
    user.id
  ).run();

  if (status === "published" && existingArticle?.status !== "published") {
    await notifyActiveMembers(env, {
      title: `New educational content: ${title}`,
      body: subtitle || `${contributionType} by ${author || user.display_name || user.username}`,
      actionHref: href,
      type: "education",
      createdBy: user.id,
      excludeContributorId: user.id
    });
  }

  return json({ article: { id, href, destination, title, subtitle, contributionType, author, source, labels, status } });
}

async function handleAdminArticles(request, env, actingUser) {
  const url = new URL(request.url);
  const search = clean(url.searchParams.get("search")).slice(0, 120);
  const requestedStatus = clean(url.searchParams.get("status")).toLowerCase();
  const status = ["draft", "published", "all"].includes(requestedStatus) ? requestedStatus : "all";
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "50", 10) || 50, 100));
  const where = [];
  const binds = [];
  if (status !== "all") {
    where.push("a.status = ?");
    binds.push(status);
  }
  if (search) {
    const like = `%${search}%`;
    where.push("(a.title LIKE ? OR a.destination LIKE ? OR a.article_type LIKE ? OR a.author LIKE ? OR c.username LIKE ? OR c.display_name LIKE ?)");
    binds.push(like, like, like, like, like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const count = await env.TPI_DB.prepare(`SELECT COUNT(*) AS total FROM articles a LEFT JOIN contributors c ON c.id = a.created_by ${whereSql}`).bind(...binds).first();
  const { results } = await env.TPI_DB.prepare(`
    SELECT a.id, a.destination, a.href, a.title, a.subtitle,
           a.article_type AS contributionType, a.author,
           c.username AS authorUsername, c.display_name AS authorDisplayName,
           a.source, a.labels, a.status, a.created_at AS createdAt, a.updated_at AS updatedAt
    FROM articles a
    LEFT JOIN contributors c ON c.id = a.created_by
    ${whereSql}
    ORDER BY COALESCE(a.updated_at, a.created_at) DESC
    LIMIT ? OFFSET ?
  `).bind(...binds, pageSize, (page - 1) * pageSize).all();
  const total = Number(count?.total || 0);
  return json({
    articles: results || [],
    search,
    status,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    metadataOnly: true,
    mutationBoundary: "Article publication status uses the protected administrative contract; article bodies remain on the contributor publishing workflow."
  }, 200, { "Cache-Control": "no-store" });
}

async function handleAdminArticleDetail(path, env) {
  const id = clean(decodeURIComponent(path.match(/^\/admin\/articles\/([^/]+)$/)?.[1] || ""));
  if (!id) return json({ error: "Article id is required." }, 400);
  const article = await env.TPI_DB.prepare(`
    SELECT a.id, a.destination, a.href, a.title, a.subtitle,
           a.article_type AS contributionType, a.author, a.source,
           a.body_html AS bodyHtml, a.article_html AS articleHtml, a.labels,
           a.status, a.created_at AS createdAt, a.updated_at AS updatedAt,
           c.username AS authorUsername, c.display_name AS authorDisplayName
    FROM articles a
    LEFT JOIN contributors c ON c.id = a.created_by
    WHERE a.id = ?
  `).bind(id).first();
  if (!article) return json({ error: "Article was not found." }, 404);
  const history = await env.TPI_DB.prepare(`
    SELECT id, actor_username AS actorUsername, actor_role AS actorRole,
           action, target_type AS targetType, target_id AS targetId,
           metadata_json AS metadata, created_at AS createdAt
    FROM admin_audit_logs
    WHERE target_type = 'article' AND target_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).bind(id).all().catch(() => ({ results: [] }));
  return json({ article, history: (history.results || []).map(row => ({ ...row, metadata: safeJsonParse(row.metadata) || {} })) }, 200, { "Cache-Control": "no-store" });
}

async function handleAdminArticleUpdate(path, request, env, actingUser) {
  const id = clean(decodeURIComponent(path.match(/^\/admin\/articles\/([^/]+)$/)?.[1] || ""));
  if (!id) return json({ error: "Article id is required." }, 400);
  const current = await env.TPI_DB.prepare("SELECT * FROM articles WHERE id = ?").bind(id).first();
  if (!current) return json({ error: "Article was not found." }, 404);
  const data = await readJson(request);
  const expectedUpdatedAt = clean(data.expectedUpdatedAt);
  if (expectedUpdatedAt && expectedUpdatedAt !== current.updated_at) {
    return json({ error: "This article changed since it was loaded. Refresh before saving.", code: "ARTICLE_EDIT_CONFLICT", currentUpdatedAt: current.updated_at }, 409);
  }
  const title = clean(Object.prototype.hasOwnProperty.call(data, "title") ? data.title : current.title);
  const destination = clean(Object.prototype.hasOwnProperty.call(data, "destination") ? data.destination : current.destination);
  const bodyHtml = String(Object.prototype.hasOwnProperty.call(data, "bodyHtml") ? data.bodyHtml || "" : current.body_html || "");
  if (!title || title.toLowerCase().startsWith("untitled")) return json({ error: "A real title is required." }, 400);
  if (!destination) return json({ error: "Article destination is required." }, 400);
  if (!bodyHtml.trim()) return json({ error: "Article body is required." }, 400);
  const href = clean(Object.prototype.hasOwnProperty.call(data, "href") ? data.href : current.href);
  const subtitle = clean(Object.prototype.hasOwnProperty.call(data, "subtitle") ? data.subtitle : current.subtitle);
  const contributionType = clean(Object.prototype.hasOwnProperty.call(data, "contributionType") ? data.contributionType : current.article_type);
  const author = clean(Object.prototype.hasOwnProperty.call(data, "author") ? data.author : current.author);
  const source = clean(Object.prototype.hasOwnProperty.call(data, "source") ? data.source : current.source);
  const articleHtml = String(Object.prototype.hasOwnProperty.call(data, "articleHtml") ? data.articleHtml || "" : current.article_html || "");
  const labels = clean(Object.prototype.hasOwnProperty.call(data, "labels") ? data.labels : current.labels);
  const updateResult = await env.TPI_DB.prepare(`
    UPDATE articles
    SET destination = ?, href = ?, title = ?, subtitle = ?, article_type = ?,
        author = ?, source = ?, body_html = ?, article_html = ?, labels = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND updated_at = ?
  `).bind(destination, href, title, subtitle, contributionType, author, source, bodyHtml, articleHtml, labels, id, current.updated_at).run();
  if (!Number(updateResult.meta?.changes || 0)) return json({ error: "This article changed before the save completed. Refresh before saving.", code: "ARTICLE_EDIT_CONFLICT" }, 409);
  const updated = await env.TPI_DB.prepare(`
    SELECT id, destination, href, title, subtitle, article_type AS contributionType,
           author, source, body_html AS bodyHtml, article_html AS articleHtml,
           labels, status, created_at AS createdAt, updated_at AS updatedAt
    FROM articles WHERE id = ?
  `).bind(id).first();
  await writeAdminAuditLog(env, actingUser, "article.updated", "article", id, {
    title, previousUpdatedAt: current.updated_at, updatedAt: updated?.updatedAt || null
  });
  return json({ article: updated, changed: true });
}

async function handleAdminArticleStatus(path, request, env, actingUser) {
  const id = clean(decodeURIComponent(path.match(/^\/admin\/articles\/([^/]+)\/status$/)?.[1] || ""));
  if (!id) return json({ error: "Article id is required." }, 400);
  const article = await env.TPI_DB.prepare("SELECT id, href, title, subtitle, article_type AS contributionType, author, status FROM articles WHERE id = ?").bind(id).first();
  if (!article) return json({ error: "Article was not found." }, 404);
  const data = await readJson(request);
  const status = clean(data.status).toLowerCase();
  if (!["draft", "published"].includes(status)) return json({ error: "Article status must be draft or published." }, 400);
  if (status === article.status) return json({ article: { ...article, changed: false } });
  if (status === "published" && (!clean(article.title) || clean(article.title).toLowerCase().startsWith("untitled"))) {
    return json({ error: "A real title is required before publishing." }, 400);
  }
  await env.TPI_DB.prepare("UPDATE articles SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(status, id).run();
  await writeAdminAuditLog(env, actingUser, `article.${status}`, "article", id, { previousStatus: article.status, title: article.title });
  if (status === "published") {
    await notifyActiveMembers(env, {
      title: `New educational content: ${article.title}`,
      body: article.subtitle || `${article.contributionType || "Article"} by ${article.author || actingUser.display_name || actingUser.username}`,
      actionHref: article.href || `published-article.html?id=${encodeURIComponent(id)}`,
      type: "education",
      createdBy: actingUser.id,
      excludeContributorId: actingUser.id
    });
  }
  return json({ article: { ...article, status, changed: true } });
}

async function handleListArticles(request, env) {
  const url = new URL(request.url);
  const destination = clean(url.searchParams.get("destination"));
  const destinationAlt = destination.endsWith(".html")
    ? destination.replace(/\.html$/, "")
    : `${destination}.html`;
  const paginated = url.searchParams.has("page") || url.searchParams.has("pageSize");
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "50", 10) || 50, 100));
  const where = destination ? "WHERE a.destination IN (?, ?) AND a.status = 'published'" : "WHERE a.status = 'published'";
  const binds = destination ? [destination, destinationAlt] : [];
  const limitSql = paginated ? "LIMIT ? OFFSET ?" : "";
  const { results } = await env.TPI_DB.prepare(`
    SELECT a.id, a.destination, a.href, a.title, a.subtitle, a.article_type AS contributionType, a.author, c.username AS authorUsername, c.display_name AS authorDisplayName, a.source, a.body_html AS bodyHtml, a.article_html AS articleHtml, a.labels, a.status, a.created_at AS createdAt, a.updated_at AS updatedAt
    FROM articles a
    LEFT JOIN contributors c ON c.id = a.created_by
    ${where}
    ORDER BY COALESCE(a.updated_at, a.created_at) DESC
    ${limitSql}
  `).bind(...(paginated ? [...binds, pageSize, (page - 1) * pageSize] : binds)).all();
  if (!paginated) return json({ articles: results });
  const count = await env.TPI_DB.prepare(`SELECT COUNT(*) AS total FROM articles a ${where}`).bind(...binds).first();
  const total = Number(count?.total || 0);
  return json({ articles: results, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}

async function handleContributorArticles(env, user) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT id, destination, href, title, subtitle, article_type AS contributionType, author, ? AS authorUsername, source, body_html AS bodyHtml, article_html AS articleHtml, labels, status, created_at AS createdAt, updated_at AS updatedAt
    FROM articles
    WHERE created_by = ?
    ORDER BY COALESCE(updated_at, created_at) DESC
  `).bind(user.username, user.id).all();
  return json({ articles: results });
}

async function handleDeleteArticle(path, env, user) {
  const id = clean(decodeURIComponent(path.replace(/^\/articles\//, "")));
  if (!id) return json({ error: "Article id is required." }, 400);
  const article = await env.TPI_DB.prepare("SELECT id, created_by FROM articles WHERE id = ?").bind(id).first();
  if (!article) return json({ deleted: false });
  if (article.created_by !== user.id && !["owner", "admin"].includes(user.role)) {
    return json({ error: "You can only delete your own articles." }, 403);
  }
  await env.TPI_DB.prepare("DELETE FROM articles WHERE id = ?").bind(id).run();
  return json({ deleted: true, id });
}

async function handleArticleReactions(request, env) {
  const pageId = clean(new URL(request.url).searchParams.get("pageId")).slice(0, 300);
  if (!pageId) return json({ error: "pageId is required." }, 400);

  try {
    const user = await getSessionUser(request, env);
    const reactionCounts = await getArticleReactionSummary(env, pageId);
    let userReaction = null;
    if (user) {
      const row = await env.TPI_DB.prepare(`
        SELECT reaction
        FROM article_reactions
        WHERE page_id = ? AND contributor_id = ?
        LIMIT 1
      `).bind(pageId, user.id).first();
      userReaction = row?.reaction || null;
    }
    return json({ pageId, reactionCounts, userReaction, signedIn: Boolean(user) });
  } catch (error) {
    return json({ pageId, reactionCounts: {}, userReaction: null, signedIn: false, migrationRequired: true });
  }
}

async function handleSetArticleReaction(request, env, user) {
  const data = await readJson(request);
  const pageId = clean(data.pageId).slice(0, 300);
  const reaction = clean(data.reaction).toLowerCase();
  if (!pageId) return json({ error: "pageId is required." }, 400);
  if (!isAllowedArticleReaction(reaction)) return json({ error: "Reaction was not recognized." }, 400);

  try {
    const existing = await env.TPI_DB.prepare(`
      SELECT reaction
      FROM article_reactions
      WHERE page_id = ? AND contributor_id = ?
      LIMIT 1
    `).bind(pageId, user.id).first();

    await env.TPI_DB.prepare("DELETE FROM article_reactions WHERE page_id = ? AND contributor_id = ?")
      .bind(pageId, user.id)
      .run();

    let userReaction = null;
    if (existing?.reaction !== reaction) {
      userReaction = reaction;
      await env.TPI_DB.prepare(`
        INSERT INTO article_reactions (id, page_id, contributor_id, reaction)
        VALUES (?, ?, ?, ?)
      `).bind(crypto.randomUUID(), pageId, user.id, reaction).run();
    }

    const reactionCounts = await getArticleReactionSummary(env, pageId);
    return json({ pageId, reactionCounts, userReaction, signedIn: true });
  } catch (error) {
    return json({ error: "Article reactions are not ready yet. Apply migrations/0011_article_reactions.sql in Cloudflare D1." }, 500);
  }
}

async function handleCommunityFeed(request, env) {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 50);
  const offset = Number(url.searchParams.get("offset")) || 0;
  const socialOnly = url.searchParams.get("scope") === "community";
  const user = await getSessionUser(request, env);

  // Community Feed posts (dedicated community_posts model — the Forum's
  // forum_topics/forum_posts were retired; see FORUM_DEPENDENCY_AUDIT.md).
  const { results: postItems } = await env.TPI_DB.prepare(`
    SELECT
      'community_post' AS type,
      cp.id,
      cp.title,
      cp.body,
      cp.status,
      cp.created_at AS createdAt,
      cp.edited_at AS editedAt,
      cc.id AS categoryId,
      cc.title AS categoryTitle,
      c.username AS authorUsername,
      c.display_name AS authorName,
      c.title AS authorTitle,
      c.photo_url AS authorPhotoUrl,
      c.chat_color AS authorChatColor,
      (SELECT COUNT(*) FROM community_comments cm WHERE cm.post_id = cp.id AND cm.status = 'visible') AS commentCount
    FROM community_posts cp
    LEFT JOIN community_categories cc ON cc.id = cp.category_id
    LEFT JOIN contributors c ON c.id = cp.author_id
    WHERE cp.status = 'visible'
    ORDER BY cp.created_at DESC
    LIMIT 200
  `).all().catch(function () { return { results: [] }; });

  let videoItems = [];
  let articleItems = [];
  if (!socialOnly) {
    const videoResult = await env.TPI_DB.prepare(`
      SELECT
        'video' AS type,
        id,
        slug,
        title,
        description,
        thumbnail,
        published_at AS publishedAt,
        is_live AS isLive,
        category
      FROM tpi_videos
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT 50
    `).all().catch(function () { return { results: [] }; });
    videoItems = videoResult.results || [];

    const articleResult = await env.TPI_DB.prepare(`
      SELECT
        'article' AS type,
        a.id,
        a.title,
        a.subtitle AS description,
        a.href,
        a.article_type AS contributionType,
        a.created_at AS createdAt,
        c.username AS authorUsername,
        c.display_name AS authorName,
        c.photo_url AS authorPhotoUrl
      FROM articles a
      LEFT JOIN contributors c ON c.id = a.created_by
      WHERE a.status = 'published'
      ORDER BY a.created_at DESC
      LIMIT 50
    `).all().catch(function () { return { results: [] }; });
    articleItems = articleResult.results || [];
  }

  const communityMapped = (postItems || []).map(function(item) {
    var commentCount = Number(item.commentCount || 0);
    return {
      type: "community_post",
      id: item.id,
      postId: item.id,
      title: item.title || "",
      body: item.body,
      categoryId: item.categoryId,
      categoryTitle: item.categoryTitle,
      authorUsername: item.authorUsername,
      authorName: item.authorName,
      authorTitle: item.authorTitle,
      authorPhotoUrl: item.authorPhotoUrl,
      authorChatColor: item.authorChatColor || "#a855f7",
      commentCount: commentCount,
      replyCount: commentCount,
      createdAt: item.createdAt,
      editedAt: item.editedAt || null,
      attachments: [],
      reactionCounts: {},
      userReaction: null
    };
  });

  // Batched attachment + reaction hydration (no N+1 per post).
  await attachCommunityMedia(env, communityMapped, "post");
  await attachCommunityReactions(env, communityMapped, "post", user?.id);

  const videoMapped = (videoItems || []).map(function(item) {
    return {
      type: "video",
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      thumbnail: item.thumbnail,
      publishedAt: item.publishedAt,
      isLive: Boolean(Number(item.isLive)),
      category: item.category
    };
  });

  const articleMapped = (articleItems || []).map(function(item) {
    return {
      type: "article",
      id: item.id,
      title: item.title,
      description: item.description,
      href: item.href,
      contributionType: item.contributionType,
      authorUsername: item.authorUsername,
      authorName: item.authorName,
      authorPhotoUrl: item.authorPhotoUrl,
      createdAt: item.createdAt
    };
  });

  var all = [].concat(communityMapped).concat(videoMapped).concat(articleMapped);
  all.sort(function(a, b) {
    var dateA = a.createdAt || a.publishedAt || "";
    var dateB = b.createdAt || b.publishedAt || "";
    return dateB.localeCompare(dateA);
  });

  var page = all.slice(offset, offset + limit);
  return json({ items: page, total: all.length });
}

async function handleUserFeed(request, env) {
  const url = new URL(request.url);
  const username = clean(url.searchParams.get("username") || "");
  const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 50);
  const offset = Number(url.searchParams.get("offset")) || 0;
  const socialOnly = url.searchParams.get("scope") === "community";
  if (!username) return json({ error: "Username is required." }, 400);

  const contributor = await env.TPI_DB.prepare(
    "SELECT id, username FROM contributors WHERE username = ? AND active = 1"
  ).bind(username).first();
  if (!contributor) return json({ error: "Member not found." }, 404);

  const { results: postItems } = await env.TPI_DB.prepare(`
    SELECT
      'community_post' AS type,
      cp.id,
      cp.title,
      cp.body,
      cp.created_at AS createdAt,
      cp.edited_at AS editedAt,
      cc.id AS categoryId,
      cc.title AS categoryTitle,
      c.username AS authorUsername,
      c.display_name AS authorName,
      c.title AS authorTitle,
      c.photo_url AS authorPhotoUrl,
      c.chat_color AS authorChatColor,
      (SELECT COUNT(*) FROM community_comments cm WHERE cm.post_id = cp.id AND cm.status = 'visible') AS commentCount
    FROM community_posts cp
    LEFT JOIN community_categories cc ON cc.id = cp.category_id
    LEFT JOIN contributors c ON c.id = cp.author_id
    WHERE cp.author_id = ? AND cp.status = 'visible'
    ORDER BY cp.created_at DESC
    LIMIT 200
  `).bind(contributor.id).all().catch(function () { return { results: [] }; });

  let articleItems = [];
  if (!socialOnly) {
    const articleResult = await env.TPI_DB.prepare(`
      SELECT
        'article' AS type,
        a.id,
        a.title,
        a.subtitle AS description,
        a.href,
        a.article_type AS contributionType,
        a.created_at AS createdAt,
        c.username AS authorUsername,
        c.display_name AS authorName,
        c.photo_url AS authorPhotoUrl
      FROM articles a
      LEFT JOIN contributors c ON c.id = a.created_by
      WHERE a.created_by = ? AND a.status = 'published'
      ORDER BY a.created_at DESC
      LIMIT 50
    `).bind(contributor.id).all().catch(function () { return { results: [] }; });
    articleItems = articleResult.results || [];
  }

  const communityMapped = (postItems || []).map(function(item) {
    var commentCount = Number(item.commentCount || 0);
    return {
      type: "community_post",
      id: item.id,
      postId: item.id,
      title: item.title || "",
      body: item.body,
      categoryId: item.categoryId,
      categoryTitle: item.categoryTitle,
      authorUsername: item.authorUsername,
      authorName: item.authorName,
      authorTitle: item.authorTitle,
      authorPhotoUrl: item.authorPhotoUrl,
      authorChatColor: item.authorChatColor || "#a855f7",
      commentCount: commentCount,
      replyCount: commentCount,
      createdAt: item.createdAt,
      editedAt: item.editedAt || null,
      attachments: [],
      reactionCounts: {},
      userReaction: null
    };
  });

  await attachCommunityMedia(env, communityMapped, "post");
  await attachCommunityReactions(env, communityMapped, "post", null);

  const articleMapped = (articleItems || []).map(function(item) {
    return {
      type: "article",
      id: item.id,
      title: item.title,
      description: item.description,
      href: item.href,
      contributionType: item.contributionType,
      authorUsername: item.authorUsername,
      authorName: item.authorName,
      authorPhotoUrl: item.authorPhotoUrl,
      createdAt: item.createdAt
    };
  });

  var all = [].concat(communityMapped).concat(articleMapped);
  all.sort(function(a, b) {
    var dateA = a.createdAt || "";
    var dateB = b.createdAt || "";
    return dateB.localeCompare(dateA);
  });

  var page = all.slice(offset, offset + limit);
  return json({ items: page, total: all.length });
}

// ===== Community Feed mutations (dedicated community data model) =====
// The retired Forum's topic/post model was replaced by community_posts +
// community_comments (see FORUM_DEPENDENCY_AUDIT.md, migrations 0032-0034).

async function handleListCommunityCategories(env) {
  try {
    const { results } = await env.TPI_DB.prepare(`
      SELECT id, title, description, sort_order AS sortOrder, active
      FROM community_categories
      WHERE active = 1
      ORDER BY sort_order ASC, title COLLATE NOCASE
    `).all();
    const categories = results || [];
    const counts = new Map();
    try {
      const { results: countRows } = await env.TPI_DB.prepare(`
        SELECT category_id AS categoryId, COUNT(*) AS n
        FROM community_posts
        WHERE status = 'visible'
        GROUP BY category_id
      `).all();
      (countRows || []).forEach(row => counts.set(row.categoryId, Number(row.n || 0)));
    } catch (e) { /* counts optional */ }
    return json({
      categories: categories.map(category => ({
        ...category,
        topicCount: counts.get(category.id) || 0,
        postCount: counts.get(category.id) || 0
      }))
    });
  } catch (error) {
    return json({ categories: [] });
  }
}

async function handleListCommunityPosts(request, env) {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 50);
  const offset = Number(url.searchParams.get("offset")) || 0;
  const user = await getSessionUser(request, env);

  const { results: rows } = await env.TPI_DB.prepare(`
    SELECT
      cp.id,
      cp.title,
      cp.body,
      cp.status,
      cp.created_at AS createdAt,
      cp.edited_at AS editedAt,
      cc.id AS categoryId,
      cc.title AS categoryTitle,
      c.username AS authorUsername,
      c.display_name AS authorName,
      c.title AS authorTitle,
      c.photo_url AS authorPhotoUrl,
      c.chat_color AS authorChatColor
    FROM community_posts cp
    LEFT JOIN community_categories cc ON cc.id = cp.category_id
    LEFT JOIN contributors c ON c.id = cp.author_id
    WHERE cp.status = 'visible'
    ORDER BY cp.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all().catch(function () { return { results: [] }; });

  const posts = (rows || []).map(function(item) {
    return {
      id: item.id,
      postId: item.id,
      title: item.title || "",
      body: item.body,
      categoryId: item.categoryId,
      categoryTitle: item.categoryTitle,
      authorUsername: item.authorUsername,
      authorName: item.authorName,
      authorTitle: item.authorTitle,
      authorPhotoUrl: item.authorPhotoUrl,
      authorChatColor: item.authorChatColor || "#a855f7",
      commentCount: 0,
      createdAt: item.createdAt,
      editedAt: item.editedAt || null,
      attachments: [],
      reactionCounts: {},
      userReaction: null
    };
  });

  try {
    if (posts.length) {
      const placeholders = posts.map(() => "?").join(",");
      const { results: countRows } = await env.TPI_DB.prepare(`
        SELECT post_id AS postId, COUNT(*) AS n
        FROM community_comments
        WHERE status = 'visible' AND post_id IN (${placeholders})
        GROUP BY post_id
      `).bind(...posts.map(p => p.id)).all();
      (countRows || []).forEach(row => {
        const post = posts.find(p => p.id === row.postId);
        if (post) post.commentCount = Number(row.n || 0);
      });
    }
  } catch (e) { /* counts optional */ }

  await attachCommunityMedia(env, posts, "post");
  await attachCommunityReactions(env, posts, "post", user?.id);
  return json({ posts, total: posts.length });
}

async function handleCreateCommunityPost(request, env, user) {
  const accessError = await getMemberActionAccessError(env, user, "post");
  if (accessError) return json({ error: accessError }, 403);
  const data = await readJson(request);
  const categoryId = clean(data.categoryId) || "general";
  const title = clean(data.title).slice(0, 160);
  const body = clean(data.body).slice(0, 6000);
  const attachments = sanitizeCommunityAttachments(data.attachments);
  if (!title || !body) return json({ error: "Post title and message are required." }, 400);

  const category = await env.TPI_DB.prepare("SELECT id FROM community_categories WHERE id = ? AND active = 1").bind(categoryId).first();
  if (!category) return json({ error: "Community category was not found." }, 404);

  const postId = crypto.randomUUID();
  try {
    await env.TPI_DB.prepare(`
      INSERT INTO community_posts (id, category_id, author_id, title, body, status, updated_at)
      VALUES (?, ?, ?, ?, ?, 'visible', CURRENT_TIMESTAMP)
    `).bind(postId, categoryId, user.id, title, body).run();
  } catch (error) {
    return json({ error: "Community data model is not ready yet. Apply migrations 0032 and 0033 in Cloudflare D1." }, 500);
  }
  await insertCommunityAttachments(env, postId, "post", attachments);
  await createCommunityContentNotifications(env, user, { postId, postTitle: title, body, attachments });

  return json({ post: { id: postId, categoryId, title, status: "visible" }, postId });
}

async function handleUpdateCommunityPost(path, request, env, user) {
  const postId = clean(decodeURIComponent(path.match(/^\/community\/posts\/([^/]+)$/)?.[1] || ""));
  if (!postId) return json({ error: "Post id is required." }, 400);
  const data = await readJson(request);
  const title = clean(data.title).slice(0, 160);
  const body = clean(data.body).slice(0, 6000);
  if (!title && !body) return json({ error: "Nothing to update." }, 400);

  // Owner or admin only.
  const post = await env.TPI_DB.prepare(`
    SELECT id, author_id AS authorId, title, status
    FROM community_posts
    WHERE id = ? AND status NOT IN ('deleted', 'hidden')
  `).bind(postId).first();
  if (!post) return json({ error: "Post was not found." }, 404);
  if (post.authorId !== user.id && !["owner", "admin"].includes(user.role)) {
    return json({ error: "You can only edit your own posts." }, 403);
  }

  if (body) {
    await env.TPI_DB.prepare(`
      UPDATE community_posts
      SET body = ?, edited_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(body, postId).run();
  }
  if (title) {
    await env.TPI_DB.prepare(`
      UPDATE community_posts
      SET title = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(title, postId).run();
  }
  return json({ ok: true, postId, title: title || post.title, body });
}

async function handleDeleteCommunityPost(path, env, user) {
  const postId = clean(decodeURIComponent(path.match(/^\/community\/posts\/([^/]+)$/)?.[1] || ""));
  if (!postId) return json({ error: "Post id is required." }, 400);

  const post = await env.TPI_DB.prepare("SELECT id, author_id AS authorId FROM community_posts WHERE id = ? AND status NOT IN ('deleted', 'hidden')").bind(postId).first();
  if (!post) return json({ deleted: false });
  if (post.authorId !== user.id && !["owner", "admin"].includes(user.role)) {
    return json({ error: "You can only delete your own posts." }, 403);
  }
  await env.TPI_DB.prepare("UPDATE community_posts SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(postId).run();
  return json({ deleted: true, id: postId });
}

async function handleListCommunityComments(path, request, env) {
  const postId = clean(decodeURIComponent(path.match(/^\/community\/posts\/([^/]+)\/comments$/)?.[1] || ""));
  if (!postId) return json({ error: "Post id is required." }, 400);
  const user = await getSessionUser(request, env);

  const post = await env.TPI_DB.prepare(`
    SELECT
      cp.id, cp.title, cp.body, cp.status, cp.created_at AS createdAt,
      cc.id AS categoryId, cc.title AS categoryTitle,
      c.username AS authorUsername, c.display_name AS authorName,
      c.title AS authorTitle, c.photo_url AS authorPhotoUrl, c.chat_color AS authorChatColor
    FROM community_posts cp
    LEFT JOIN community_categories cc ON cc.id = cp.category_id
    LEFT JOIN contributors c ON c.id = cp.author_id
    WHERE cp.id = ? AND cp.status = 'visible'
  `).bind(postId).first();
  if (!post) return json({ error: "Post was not found." }, 404);

  let results = [];
  try {
    ({ results } = await env.TPI_DB.prepare(`
      SELECT
        cm.id,
        cm.post_id AS postId,
        cm.body,
        cm.status,
        cm.created_at AS createdAt,
        cm.updated_at AS updatedAt,
        cm.edited_at AS editedAt,
        c.username AS authorUsername,
        c.display_name AS authorName,
        c.title AS authorTitle,
        c.role AS authorRole,
        c.photo_url AS authorPhotoUrl,
        c.chat_color AS authorChatColor
      FROM community_comments cm
      LEFT JOIN contributors c ON c.id = cm.author_id
      WHERE cm.post_id = ? AND cm.status = 'visible'
      ORDER BY cm.created_at ASC
    `).bind(postId).all());
  } catch (error) {
    results = [];
  }

  const comments = results.map(row => ({
    ...row,
    editedAt: row.editedAt || null,
    attachments: [],
    reactionCounts: {},
    userReaction: null
  }));
  await attachCommunityMedia(env, comments, "comment");
  await attachCommunityReactions(env, comments, "comment", user?.id);
  return json({ post, comments });
}

async function handleCreateCommunityComment(path, request, env, user) {
  const accessError = await getMemberActionAccessError(env, user, "comment");
  if (accessError) return json({ error: accessError }, 403);
  const postId = clean(decodeURIComponent(path.match(/^\/community\/posts\/([^/]+)\/comments$/)?.[1] || ""));
  const data = await readJson(request);
  const body = clean(data.body).slice(0, 6000);
  const attachments = sanitizeCommunityAttachments(data.attachments);
  if (!postId || !body) return json({ error: "Post id and message are required." }, 400);

  const post = await env.TPI_DB.prepare("SELECT id, author_id AS authorId, title, status FROM community_posts WHERE id = ? AND status NOT IN ('deleted', 'hidden')").bind(postId).first();
  if (!post) return json({ error: "Post was not found." }, 404);

  const commentId = crypto.randomUUID();
  try {
    await env.TPI_DB.prepare(`
      INSERT INTO community_comments (id, post_id, author_id, body, status, updated_at)
      VALUES (?, ?, ?, ?, 'visible', CURRENT_TIMESTAMP)
    `).bind(commentId, postId, user.id, body).run();
  } catch (error) {
    return json({ error: "Community data model is not ready yet. Apply migrations 0032 and 0033 in Cloudflare D1." }, 500);
  }
  await insertCommunityAttachments(env, commentId, "comment", attachments);
  await createCommunityContentNotifications(env, user, { postId, postTitle: post.title, body, attachments, isComment: true, commentId });

  return json({ comment: { id: commentId, postId, body, attachments }, post: { id: commentId, topicId: postId, body, attachments } });
}

async function handleDeleteCommunityComment(path, env, user) {
  const commentId = clean(decodeURIComponent(path.match(/^\/community\/comments\/([^/]+)$/)?.[1] || ""));
  if (!commentId) return json({ error: "Comment id is required." }, 400);
  const comment = await env.TPI_DB.prepare("SELECT id, author_id AS authorId FROM community_comments WHERE id = ? AND status = 'visible'").bind(commentId).first();
  if (!comment) return json({ deleted: false });
  if (comment.authorId !== user.id && !["owner", "admin"].includes(user.role)) {
    return json({ error: "You can only delete your own comments." }, 403);
  }
  await env.TPI_DB.prepare("UPDATE community_comments SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(commentId).run();
  return json({ deleted: true, id: commentId });
}

async function handleSetCommunityReaction(path, request, env, user, targetType) {
  const pattern = targetType === "post"
    ? /^\/community\/posts\/([^/]+)\/reactions$/
    : /^\/community\/comments\/([^/]+)\/reactions$/;
  const targetId = clean(decodeURIComponent(path.match(pattern)?.[1] || ""));
  const data = await readJson(request);
  const reaction = clean(data.reaction).toLowerCase();
  if (!targetId) return json({ error: "Target id is required." }, 400);
  if (!isAllowedCommunityReaction(reaction)) return json({ error: "Reaction was not recognized." }, 400);

  let table = communityTableName(targetType);
  if (!table) return json({ error: "Reaction target type was not recognized." }, 400);
  const target = await env.TPI_DB.prepare(`SELECT id FROM ${table} WHERE id = ? AND status = 'visible'`).bind(targetId).first();
  if (!target) return json({ error: targetType === "post" ? "Community post was not found." : "Community comment was not found." }, 404);

  try {
    const existing = await env.TPI_DB.prepare(`
      SELECT reaction
      FROM community_reactions
      WHERE target_type = ? AND target_id = ? AND contributor_id = ?
      LIMIT 1
    `).bind(targetType, targetId, user.id).first();

    await env.TPI_DB.prepare("DELETE FROM community_reactions WHERE target_type = ? AND target_id = ? AND contributor_id = ?")
      .bind(targetType, targetId, user.id)
      .run();

    let userReaction = null;
    if (existing?.reaction !== reaction) {
      userReaction = reaction;
      await env.TPI_DB.prepare("INSERT INTO community_reactions (id, target_type, target_id, contributor_id, reaction) VALUES (?, ?, ?, ?, ?)")
        .bind(crypto.randomUUID(), targetType, targetId, user.id, reaction)
        .run();
    }

    const reactionCounts = await getCommunityReactionSummary(env, targetType, targetId);
    return json({ targetId, reactionCounts, userReaction });
  } catch (error) {
    return json({ error: "Community reactions are not ready yet. Apply migrations 0032 and 0033 in Cloudflare D1." }, 500);
  }
}

async function handlePublicContributorProfile(request, env) {
  const username = clean(new URL(request.url).searchParams.get("username"));
  const user = await getUserByUsername(env, username);
  if (!user || !user.active) return json({ error: "Contributor profile not found." }, 404);
  const { results } = await env.TPI_DB.prepare(`
    SELECT id, href, title, subtitle, article_type AS contributionType, destination, source, status, created_at AS createdAt
    FROM articles
    WHERE created_by = ? AND status = 'published'
    ORDER BY created_at DESC
  `).bind(user.id).all();
  return json({ profile: publicUser(user), articles: results });
}

async function handleListPublicContributors(env) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT
      c.username,
      c.display_name AS displayName,
      c.title,
      c.role,
      c.affiliation,
      c.organization,
      c.website,
      c.bio,
      COUNT(a.id) AS publishedCount
    FROM contributors c
    LEFT JOIN articles a ON a.created_by = c.id AND a.status = 'published'
    WHERE c.active = 1
    GROUP BY c.id
    ORDER BY publishedCount DESC, c.display_name COLLATE NOCASE, c.username COLLATE NOCASE
    LIMIT 200
  `).all();
  return json({ contributors: results.map(profile => ({ ...profile, publishedCount: Number(profile.publishedCount || 0) })) });
}

async function handleListComments(request, env) {
  const pageId = new URL(request.url).searchParams.get("pageId");
  if (!pageId) return json({ error: "pageId is required." }, 400);

  const { results } = await env.TPI_DB.prepare(`
    SELECT cm.id, cm.parent_id AS parentId, cm.name, cm.author_title AS authorTitle, c.username AS authorUsername, cm.text, cm.created_at AS createdAt
    FROM comments cm
    LEFT JOIN contributors c ON c.id = cm.contributor_id
    WHERE cm.page_id = ? AND cm.status = 'approved'
    ORDER BY cm.created_at ASC
  `)
    .bind(pageId)
    .all();
  const comments = results.filter(row => !row.parentId).map(row => ({ ...row, replies: results.filter(reply => reply.parentId === row.id) }));
  return json({ comments });
}

async function handleCreateComment(request, env) {
  const data = await readJson(request);
  const user = await getSessionUser(request, env);
  if (user) {
    const accessError = await getMemberActionAccessError(env, user, "comment");
    if (accessError) return json({ error: accessError }, 403);
  }
  const id = crypto.randomUUID();
  const pageId = clean(data.pageId);
  const text = clean(data.text);
  if (!pageId || !text) return json({ error: "pageId and text are required." }, 400);

  const useContributor = Boolean(user && data.useContributorProfile !== false);
  const status = useContributor ? "approved" : "pending";
  await env.TPI_DB.prepare(`
    INSERT INTO comments (id, page_id, parent_id, name, author_title, text, status, contributor_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    pageId,
    clean(data.parentId),
    useContributor ? user.display_name : clean(data.name),
    useContributor ? user.title || user.role : clean(data.authorTitle),
    text,
    status,
    useContributor ? user.id : null
  ).run();

  return json({ ok: true, id, status });
}

const LIVE_REACTIONS = new Set(["like", "love", "care", "haha", "wow", "sad", "angry"]);

function liveBroadcastIdentifierFromPath(path) {
  const match = String(path || "").match(/^\/live-broadcasts\/([^/]+)/);
  return match ? clean(decodeURIComponent(match[1])) : "";
}

async function getLiveBroadcast(env, identifier) {
  const key = clean(identifier);
  if (!key) return null;
  return env.TPI_DB.prepare(`
    SELECT lb.*, tv.slug AS videoSlug
    FROM live_broadcasts lb
    LEFT JOIN tpi_videos tv ON tv.id = lb.video_id
    WHERE lb.id = ? OR lb.video_id = ? OR tv.slug = ?
    ORDER BY lb.created_at DESC
    LIMIT 1
  `).bind(key, key, key).first();
}

function liveBroadcastPayload(row) {
  if (!row) return null;
  return {
    id: row.id,
    creatorId: row.creator_id,
    videoId: row.video_id || null,
    videoSlug: row.videoSlug || null,
    title: row.title,
    status: row.status,
    scheduledAt: row.scheduled_at || null,
    scheduledTimezone: row.scheduled_timezone || null,
    visibility: row.visibility || "private",
    playbackProvider: row.playback_provider || null,
    playbackUrl: row.playback_verified ? (row.playback_url || null) : null,
    playbackVerified: Boolean(row.playback_verified),
    replayUrl: row.replay_url || null,
    replayPublished: Boolean(row.replay_published),
    moderationStatus: row.moderation_status || "approved",
    syncVersion: Number(row.sync_version || 1),
    lastSyncAt: row.last_sync_at || null,
    startedAt: row.started_at || null,
    endedAt: row.ended_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function liveCommentPayload(row) {
  return {
    id: row.id,
    broadcastId: row.broadcast_id,
    memberId: row.member_id,
    parentId: row.parent_id || null,
    displayName: row.display_name,
    avatarUrl: row.avatar_url || "",
    body: row.body,
    status: row.status,
    starred: Boolean(row.starred),
    displayed: Boolean(row.displayed),
    source: row.source || "tpi-live",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    moderatedBy: row.moderated_by || null,
    moderatedAt: row.moderated_at || null
  };
}

function liveModerator(user, broadcast) {
  return Boolean(user && broadcast && (
    broadcast.creator_id === user.id || ["owner", "admin"].includes(user.role)
  ));
}

async function syncTpiVideoFromLiveBroadcast(env, broadcastId, statusOverride = null) {
  const broadcast = await getLiveBroadcast(env, broadcastId);
  if (!broadcast) return null;
  const now = new Date().toISOString();
  const broadcastStatus = statusOverride || broadcast.status;
  const actualStartedAt = broadcastStatus === "live" ? (broadcast.started_at || now) : (broadcast.actual_started_at || null);
  const actualEndedAt = ["ended", "cancelled"].includes(broadcastStatus) ? (broadcast.ended_at || now) : (broadcast.actual_ended_at || null);
  await env.TPI_DB.prepare(`
    UPDATE tpi_videos
    SET broadcast_status = ?, is_live = CASE WHEN ? = 'live' AND playback_verified = 1 AND status = 'published' THEN 1 ELSE 0 END,
        live_started_at = CASE WHEN ? = 'live' AND playback_verified = 1 THEN COALESCE(live_started_at, ?) ELSE live_started_at END,
        actual_started_at = COALESCE(actual_started_at, ?),
        actual_ended_at = CASE WHEN ? IN ('ended', 'cancelled') THEN COALESCE(actual_ended_at, ?) ELSE actual_ended_at END,
        scheduled_at = COALESCE(?, scheduled_at), scheduled_timezone = COALESCE(?, scheduled_timezone),
        playback_provider = COALESCE(?, playback_provider), playback_url = COALESCE(?, playback_url),
        playback_verified = COALESCE(?, playback_verified), replay_url = COALESCE(?, replay_url),
        replay_published = COALESCE(?, replay_published), updated_at = ?, sync_version = sync_version + 1,
        last_sync_at = ?
    WHERE broadcast_id = ? OR id = ?
  `).bind(
    broadcastStatus, broadcastStatus, broadcastStatus, actualStartedAt, actualStartedAt,
    broadcastStatus, actualEndedAt, broadcast.scheduled_at || null, broadcast.scheduled_timezone || null,
    broadcast.playback_provider || null, broadcast.playback_url || null, Number(broadcast.playback_verified || 0),
    broadcast.replay_url || null, Number(broadcast.replay_published || 0), now, now, broadcast.id, broadcast.video_id || ""
  ).run();
  return broadcast;
}

async function listLiveCommentsForBroadcast(env, broadcast, user, options = {}) {
  const canModerate = liveModerator(user, broadcast);
  const after = clean(options.after) || "";
  const afterId = clean(options.afterId) || "";
  const limit = Math.min(Math.max(Number(options.limit) || 200, 1), 200);
  const params = [broadcast.id];
  let query = `
    SELECT id, broadcast_id, member_id, parent_id, display_name, avatar_url,
           body, status, starred, displayed, source, created_at, updated_at,
           moderated_by, moderated_at
    FROM live_comments
    WHERE broadcast_id = ?
  `;
  if (!canModerate) query += " AND status = 'visible'";
  if (after) {
    query += " AND (created_at > ? OR (created_at = ? AND id > ?))";
    params.push(after, after, afterId);
  }
  query += " ORDER BY created_at ASC, id ASC LIMIT ?";
  params.push(limit + 1);
  const { results } = await env.TPI_DB.prepare(query).bind(...params).all();
  const rows = results || [];
  const hasMore = rows.length > limit;
  const comments = rows.slice(0, limit);
  const last = comments[comments.length - 1];
  return {
    comments: comments.map(liveCommentPayload),
    hasMore,
    nextAfter: last?.created_at || after || null,
    nextAfterId: last?.id || afterId || null,
    canModerate
  };
}

async function getLiveReactionPayload(env, broadcastId, user) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT reaction, COUNT(*) AS count
    FROM live_reactions
    WHERE broadcast_id = ?
    GROUP BY reaction
  `).bind(broadcastId).all();
  const reactionCounts = {};
  (results || []).forEach(row => {
    if (LIVE_REACTIONS.has(row.reaction)) reactionCounts[row.reaction] = Number(row.count || 0);
  });
  let userReactions = [];
  if (user) {
    const mine = await env.TPI_DB.prepare(`
      SELECT reaction FROM live_reactions WHERE broadcast_id = ? AND member_id = ? ORDER BY reaction
    `).bind(broadcastId, user.id).all();
    userReactions = (mine.results || []).map(row => row.reaction).filter(reaction => LIVE_REACTIONS.has(reaction));
  }
  return { reactionCounts, userReactions, userReaction: userReactions[0] || null, signedIn: Boolean(user) };
}

async function handleRegisterLiveBroadcast(request, env, user) {
  const data = await readJson(request);
  const id = clean(data.broadcastId || data.id);
  const title = clean(data.title || "Live broadcast").slice(0, 240);
  const videoId = clean(data.videoId) || null;
  const requestedStatus = clean(data.status).toLowerCase();
  if (!id) return json({ error: "broadcastId is required." }, 400);
  if (!title) return json({ error: "Broadcast title is required." }, 400);

  const existing = await env.TPI_DB.prepare("SELECT * FROM live_broadcasts WHERE id = ?").bind(id).first();
  if (existing && existing.creator_id !== user.id && !["owner", "admin"].includes(user.role)) {
    return json({ error: "You cannot modify this broadcast." }, 403);
  }
  const status = ["ready", "live", "ended", "cancelled"].includes(requestedStatus)
    ? requestedStatus
    : (existing?.status || "ready");
  if (existing && requestedStatus && existing.status !== requestedStatus) {
    const allowed = (existing.status === "ready" && ["live", "cancelled"].includes(requestedStatus))
      || (existing.status === "live" && requestedStatus === "ended")
      || (existing.status === requestedStatus);
    if (!allowed) return json({ error: `Invalid broadcast transition from ${existing.status} to ${requestedStatus}.` }, 409);
  }
  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    INSERT INTO live_broadcasts (id, creator_id, video_id, title, status, started_at, ended_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      video_id = excluded.video_id,
      title = excluded.title,
      status = excluded.status,
      started_at = CASE WHEN excluded.status = 'live' THEN COALESCE(live_broadcasts.started_at, excluded.started_at) ELSE live_broadcasts.started_at END,
      ended_at = CASE WHEN excluded.status IN ('ended', 'cancelled') THEN COALESCE(live_broadcasts.ended_at, excluded.ended_at) ELSE live_broadcasts.ended_at END,
      updated_at = excluded.updated_at
  `).bind(
    id,
    existing?.creator_id || user.id,
    videoId,
    title,
    status,
    status === "live" ? now : null,
    ["ended", "cancelled"].includes(status) ? now : null,
    existing?.created_at || now,
    now
  ).run();
  const broadcast = await env.TPI_DB.prepare("SELECT lb.*, tv.slug AS videoSlug FROM live_broadcasts lb LEFT JOIN tpi_videos tv ON tv.id = lb.video_id WHERE lb.id = ?").bind(id).first();
  await syncTpiVideoFromLiveBroadcast(env, id, status);
  const syncedBroadcast = await env.TPI_DB.prepare("SELECT lb.*, tv.slug AS videoSlug FROM live_broadcasts lb LEFT JOIN tpi_videos tv ON tv.id = lb.video_id WHERE lb.id = ?").bind(id).first();
  return json({ ok: true, broadcast: liveBroadcastPayload(syncedBroadcast || broadcast) }, 200, { "Cache-Control": "no-store" });
}

async function handleSetLiveBroadcastStatus(path, request, env, user) {
  const identifier = path.split("/")[3] || "";
  const action = path.split("/")[4] || "";
  const broadcast = await getLiveBroadcast(env, decodeURIComponent(identifier));
  if (!broadcast) return json({ error: "Broadcast not found." }, 404);
  if (!liveModerator(user, broadcast)) return json({ error: "You cannot modify this broadcast." }, 403);
  const status = action === "start" ? "live" : action === "stop" ? "ended" : "";
  if (!status) return json({ error: "Unsupported broadcast status action." }, 400);
  if ((broadcast.status === "ready" && status !== "live") || (broadcast.status === "live" && status !== "ended") || ["ended", "cancelled"].includes(broadcast.status)) {
    if (broadcast.status !== status) return json({ error: `Invalid broadcast transition from ${broadcast.status} to ${status}.` }, 409);
  }
  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    UPDATE live_broadcasts
    SET status = ?, started_at = CASE WHEN ? = 'live' THEN COALESCE(started_at, ?) ELSE started_at END,
        ended_at = CASE WHEN ? = 'ended' THEN COALESCE(ended_at, ?) ELSE ended_at END,
        updated_at = ?
    WHERE id = ?
  `).bind(status, status, now, status, now, now, broadcast.id).run();
  await syncTpiVideoFromLiveBroadcast(env, broadcast.id, status);
  const updated = await getLiveBroadcast(env, broadcast.id);
  return json({ ok: true, broadcast: liveBroadcastPayload(updated) }, 200, { "Cache-Control": "no-store" });
}

async function handleListLiveComments(path, request, env, user) {
  const broadcast = await getLiveBroadcast(env, liveBroadcastIdentifierFromPath(path));
  if (!broadcast || broadcast.status === "cancelled") return json({ error: "Broadcast not found." }, 404);
  const url = new URL(request.url);
  const data = await listLiveCommentsForBroadcast(env, broadcast, user, {
    after: url.searchParams.get("after"),
    afterId: url.searchParams.get("afterId"),
    limit: url.searchParams.get("limit")
  });
  return json({ broadcast: liveBroadcastPayload(broadcast), ...data }, 200, { "Cache-Control": "no-store" });
}

async function handleLiveBroadcastEvents(path, request, env, user) {
  const broadcast = await getLiveBroadcast(env, liveBroadcastIdentifierFromPath(path));
  if (!broadcast || broadcast.status === "cancelled") return json({ error: "Broadcast not found." }, 404);
  const url = new URL(request.url);
  const data = await listLiveCommentsForBroadcast(env, broadcast, user, {
    after: url.searchParams.get("after"),
    afterId: url.searchParams.get("afterId"),
    limit: url.searchParams.get("limit") || 100
  });
  const reactions = await getLiveReactionPayload(env, broadcast.id, user);
  return json({ broadcast: liveBroadcastPayload(broadcast), ...data, reactions }, 200, { "Cache-Control": "no-store" });
}

async function createLiveCommentForBroadcast(request, env, user, broadcast) {
  const accessError = await getMemberActionAccessError(env, user, "comment");
  if (accessError) return json({ error: accessError }, 403);
  if (["ended", "cancelled"].includes(broadcast.status)) return json({ error: "This broadcast is no longer accepting comments." }, 409);
  const data = await readJson(request);
  const body = clean(data.body).slice(0, 2000);
  const parentId = clean(data.parentId) || null;
  if (!body) return json({ error: "Comment body is required." }, 400);
  const recent = await env.TPI_DB.prepare(`
    SELECT COUNT(*) AS count FROM live_comments
    WHERE broadcast_id = ? AND member_id = ? AND created_at >= datetime('now', '-1 minute')
  `).bind(broadcast.id, user.id).first();
  if (Number(recent?.count || 0) >= 30) return json({ error: "Comment rate limit reached. Please wait a moment." }, 429);
  if (parentId) {
    const parent = await env.TPI_DB.prepare("SELECT id FROM live_comments WHERE id = ? AND broadcast_id = ? AND status = 'visible'").bind(parentId, broadcast.id).first();
    if (!parent) return json({ error: "Reply target was not found." }, 400);
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    INSERT INTO live_comments (id, broadcast_id, member_id, parent_id, display_name, avatar_url, body, status, source, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'visible', 'tpi-live', ?, ?)
  `).bind(
    id, broadcast.id, user.id, parentId,
    clean(user.display_name || user.username || "A member").slice(0, 160),
    clean(user.photo_url || "").slice(0, 1000), body, now, now
  ).run();
  const comment = await env.TPI_DB.prepare("SELECT * FROM live_comments WHERE id = ?").bind(id).first();
  return json({ ok: true, comment: liveCommentPayload(comment) }, 201, { "Cache-Control": "no-store" });
}

async function handleCreateLiveComment(path, request, env, user) {
  const broadcast = await getLiveBroadcast(env, liveBroadcastIdentifierFromPath(path));
  if (!broadcast || broadcast.status === "cancelled") return json({ error: "Broadcast not found." }, 404);
  return createLiveCommentForBroadcast(request, env, user, broadcast);
}

async function handleLiveCommentControl(path, request, env, user) {
  const broadcast = await getLiveBroadcast(env, liveBroadcastIdentifierFromPath(path));
  if (!broadcast) return json({ error: "Broadcast not found." }, 404);
  if (!liveModerator(user, broadcast)) return json({ error: "Moderator access is required." }, 403);
  const parts = path.split("/");
  const commentId = parts[parts.length - 2] || "";
  const action = parts[parts.length - 1] || "";
  const comment = await env.TPI_DB.prepare("SELECT * FROM live_comments WHERE id = ? AND broadcast_id = ?").bind(commentId, broadcast.id).first();
  if (!comment) return json({ error: "Comment not found." }, 404);
  const now = new Date().toISOString();
  if (action === "reply") {
    const data = await readJson(request);
    const body = clean(data.body).slice(0, 2000);
    if (!body) return json({ error: "Reply body is required." }, 400);
    const id = crypto.randomUUID();
    await env.TPI_DB.prepare(`
      INSERT INTO live_comments (id, broadcast_id, member_id, parent_id, display_name, avatar_url, body, status, source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'visible', 'tpi-live-host', ?, ?)
    `).bind(id, broadcast.id, user.id, comment.id, clean(user.display_name || user.username || "Host").slice(0, 160), clean(user.photo_url || "").slice(0, 1000), body, now, now).run();
    const reply = await env.TPI_DB.prepare("SELECT * FROM live_comments WHERE id = ?").bind(id).first();
    return json({ ok: true, comment: liveCommentPayload(reply) }, 201, { "Cache-Control": "no-store" });
  }
  if (action === "star") {
    await env.TPI_DB.prepare("UPDATE live_comments SET starred = CASE WHEN starred = 1 THEN 0 ELSE 1 END, updated_at = ? WHERE id = ?").bind(now, comment.id).run();
  } else if (action === "display") {
    await env.TPI_DB.batch([
      env.TPI_DB.prepare("UPDATE live_comments SET displayed = 0, updated_at = ? WHERE broadcast_id = ?").bind(now, broadcast.id),
      env.TPI_DB.prepare("UPDATE live_comments SET displayed = 1, updated_at = ? WHERE id = ?").bind(now, comment.id)
    ]);
  } else if (action === "hide") {
    await env.TPI_DB.prepare("UPDATE live_comments SET status = 'hidden', displayed = 0, updated_at = ? WHERE id = ?").bind(now, comment.id).run();
  } else if (action === "moderate") {
    await env.TPI_DB.prepare("UPDATE live_comments SET status = 'moderated', displayed = 0, moderated_by = ?, moderated_at = ?, updated_at = ? WHERE id = ?").bind(user.id, now, now, comment.id).run();
  } else {
    return json({ error: "Unsupported comment action." }, 400);
  }
  const updated = await env.TPI_DB.prepare("SELECT * FROM live_comments WHERE id = ?").bind(comment.id).first();
  return json({ ok: true, comment: liveCommentPayload(updated) }, 200, { "Cache-Control": "no-store" });
}

async function setLiveReactionForBroadcast(request, env, user, broadcast) {
  if (["ended", "cancelled"].includes(broadcast.status)) return json({ error: "This broadcast is no longer accepting reactions." }, 409);
  const data = await readJson(request);
  const reaction = clean(data.reaction).toLowerCase();
  if (!LIVE_REACTIONS.has(reaction)) return json({ error: "Reaction was not recognized." }, 400);
  const recent = await env.TPI_DB.prepare(`
    SELECT COUNT(*) AS count FROM live_reactions WHERE broadcast_id = ? AND member_id = ? AND created_at >= datetime('now', '-1 minute')
  `).bind(broadcast.id, user.id).first();
  if (Number(recent?.count || 0) >= 60) return json({ error: "Reaction rate limit reached. Please wait a moment." }, 429);
  const existing = await env.TPI_DB.prepare("SELECT id FROM live_reactions WHERE broadcast_id = ? AND member_id = ? AND reaction = ?").bind(broadcast.id, user.id, reaction).first();
  if (existing) {
    await env.TPI_DB.prepare("DELETE FROM live_reactions WHERE id = ?").bind(existing.id).run();
  } else {
    await env.TPI_DB.prepare("INSERT INTO live_reactions (id, broadcast_id, member_id, reaction) VALUES (?, ?, ?, ?)").bind(crypto.randomUUID(), broadcast.id, user.id, reaction).run();
  }
  return json({ broadcastId: broadcast.id, ...(await getLiveReactionPayload(env, broadcast.id, user)) }, 200, { "Cache-Control": "no-store" });
}

async function handleSetLiveReaction(path, request, env, user) {
  const broadcast = await getLiveBroadcast(env, liveBroadcastIdentifierFromPath(path));
  if (!broadcast || broadcast.status === "cancelled") return json({ error: "Broadcast not found." }, 404);
  return setLiveReactionForBroadcast(request, env, user, broadcast);
}

async function handleGetLiveReactions(path, env, user) {
  const broadcast = await getLiveBroadcast(env, liveBroadcastIdentifierFromPath(path));
  if (!broadcast || broadcast.status === "cancelled") return json({ error: "Broadcast not found." }, 404);
  return json({ broadcastId: broadcast.id, ...(await getLiveReactionPayload(env, broadcast.id, user)) }, 200, { "Cache-Control": "no-store" });
}

async function handleListVideoComments(request, env) {
  const url = new URL(request.url);
  const videoId = clean(url.searchParams.get("videoId"));
  if (!videoId) return json({ error: "videoId is required." }, 400);

  const liveBroadcast = await getLiveBroadcast(env, videoId);
  if (liveBroadcast && liveBroadcast.status !== "cancelled") {
    const user = await getSessionUser(request, env);
    const data = await listLiveCommentsForBroadcast(env, liveBroadcast, user, { limit: 200 });
    return json({ comments: data.comments, liveBroadcast: liveBroadcastPayload(liveBroadcast) }, 200, { "Cache-Control": "no-store" });
  }

  const video = await env.TPI_DB.prepare(tpiVideoSelectSql() + " WHERE (tv.slug = ? OR tv.id = ?) LIMIT 1").bind(videoId, videoId).first();
  const viewer = await getSessionUser(request, env);
  if (video && !canReadTpiVideo(video, viewer)) return json({ error: "Video not found." }, 404, { "Cache-Control": "no-store" });
  if (!video) return json({ comments: [] }, 200, { "Cache-Control": "no-store" });

  const { results } = await env.TPI_DB.prepare(`
    SELECT vc.id, vc.video_id AS videoId, vc.parent_id AS parentId, vc.body, vc.status, vc.created_at AS createdAt,
           c.username, c.display_name AS displayName, c.role
    FROM video_comments vc
    JOIN contributors c ON c.id = vc.contributor_id
    WHERE vc.video_id = ? AND vc.status = 'visible'
    ORDER BY COALESCE(vc.parent_id, vc.id), vc.created_at ASC
    LIMIT 200
  `).bind(videoId).all();

  return json({ comments: results || [] });
}

async function handleCreateVideoComment(request, env, user) {
  const accessError = await getMemberActionAccessError(env, user, "comment");
  if (accessError) return json({ error: accessError }, 403);
  const data = await readJson(request);
  const videoId = clean(data.videoId);
  const body = clean(data.body);
  const parentId = clean(data.parentId);

  if (!videoId) return json({ error: "videoId is required." }, 400);
  if (!body) return json({ error: "Comment body is required." }, 400);
  if (body.length > 2000) return json({ error: "Comment must be 2000 characters or fewer." }, 400);

  const authoredVideo = await env.TPI_DB.prepare(tpiVideoSelectSql() + " WHERE (tv.slug = ? OR tv.id = ?) LIMIT 1").bind(videoId, videoId).first();
  if (authoredVideo && !canReadTpiVideo(authoredVideo, user)) return json({ error: "Video not found." }, 404);

  if (parentId) {
    const parent = await env.TPI_DB.prepare("SELECT id FROM video_comments WHERE id = ? AND video_id = ? AND status = 'visible'").bind(parentId, videoId).first();
    if (!parent) return json({ error: "The comment being replied to was not found." }, 404);
  }

  const liveBroadcast = await getLiveBroadcast(env, videoId);
  if (!authoredVideo && !(liveBroadcast && liveBroadcast.status !== "cancelled")) return json({ error: "Video not found." }, 404);
  if (liveBroadcast && liveBroadcast.status !== "cancelled") {
    return createLiveCommentForBroadcast(new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body })
    }), env, user, liveBroadcast);
  }

  const id = crypto.randomUUID();
  await env.TPI_DB.prepare(`
    INSERT INTO video_comments (id, video_id, contributor_id, parent_id, body, status)
    VALUES (?, ?, ?, ?, ?, 'visible')
  `).bind(id, videoId, user.id, parentId || null, body).run();

  return json({ ok: true, id, parentId: parentId || null });
}

const TPI_VIDEO_CATEGORIES = new Set([
  "Applied Paranormal Research and Studies", "Live Streams", "EVP & ITC", "Visual ITC & Scrying",
  "Paranormal Investigation", "Equipment & Technology", "Research Discussion", "Education", "Special Presentation"
]);

function tpiVideoSelectSql() {
  return `SELECT tv.*, ch.slug AS channelSlug, ch.display_name AS channelName, ch.description AS channelDescription,
    ch.artwork_url AS channelArtwork, c.username AS creatorUsername, c.display_name AS creatorDisplayName,
    c.title AS creatorTitle, c.photo_url AS creatorPhoto
    FROM tpi_videos tv
    LEFT JOIN tpi_video_channels ch ON ch.id = tv.channel_id
    LEFT JOIN contributors c ON c.id = tv.created_by`;
}

function tpiVideoPayload(row) {
  return {
    id: row.id, slug: row.slug, title: row.title, description: row.description,
    publishedAt: row.published_at, category: row.category,
    tags: row.tags ? row.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    platform: row.platform, videoUrl: row.video_url, embedUrl: row.embed_url,
    thumbnail: row.thumbnail, featured: Boolean(row.featured), isLive: Boolean(row.is_live),
    liveStartedAt: row.live_started_at, series: row.series, episode: row.episode,
    duration: row.duration, durationUnit: "formatted", viewingAccess: row.viewing_access || "members", status: row.status,
    channelId: row.channel_id || null, channelSlug: row.channelSlug || null,
    channelName: row.channelName || null,
    broadcastId: row.broadcast_id || null,
    broadcastStatus: row.broadcast_status || null,
    scheduledAt: row.scheduled_at || null,
    scheduledTimezone: row.scheduled_timezone || null,
    playbackProvider: row.playback_provider || null,
    playbackUrl: row.playback_verified ? (row.playback_url || "") : "",
    playbackVerified: Boolean(row.playback_verified),
    replayUrl: row.replay_url || null,
    replayPublished: Boolean(row.replay_published),
    actualStartedAt: row.actual_started_at || null,
    actualEndedAt: row.actual_ended_at || null,
    sourceType: row.sourceType || (row.created_by ? "creator" : "discovered"),
    format: row.format === "shorts" || row.format === "reel" || row.format === "reels" ? "shorts" : "regular",
    sourceName: row.sourceName || row.platform || null,
    creator: row.created_by ? { id: row.created_by, username: row.creatorUsername || "", displayName: row.creatorDisplayName || "", title: row.creatorTitle || "", photoUrl: row.creatorPhoto || "" } : null,
    createdAt: row.created_at, updatedAt: row.updated_at
  };
}

function canReadTpiVideo(row, user) {
  const owner = Boolean(user && (row.created_by === user.id || ["owner", "admin"].includes(user.role)));
  if (owner) return true;
  if (!["published", "unlisted"].includes(row.status)) return false;
  return row.viewing_access === "public" || Boolean(user);
}

function tpiVideoOwnerOrAdmin(row, user) {
  return Boolean(user && (row.created_by === user.id || ["owner", "admin"].includes(user.role)));
}

function cleanVideoText(value, max) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

function normalizeVideoTags(value) {
  const values = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(values.map(tag => cleanVideoText(tag, 40)).filter(Boolean))].slice(0, 20).join(", ");
}

async function ensureTpiChannel(env, user) {
  let channel = await env.TPI_DB.prepare("SELECT * FROM tpi_video_channels WHERE owner_id = ?").bind(user.id).first();
  if (channel) return channel;
  const base = slugify(user.username || user.display_name || "creator");
  let slug = base;
  const taken = await env.TPI_DB.prepare("SELECT id FROM tpi_video_channels WHERE slug = ?").bind(slug).first();
  if (taken) slug = `${base}-${user.id.slice(0, 8).toLowerCase()}`;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`INSERT INTO tpi_video_channels (id, owner_id, slug, display_name, description, artwork_url, visibility, created_at, updated_at)
    VALUES (?, ?, ?, ?, '', '', 'public', ?, ?)`).bind(id, user.id, slug, cleanVideoText(user.display_name || user.username, 120), now, now).run();
  channel = await env.TPI_DB.prepare("SELECT * FROM tpi_video_channels WHERE id = ?").bind(id).first();
  return channel;
}

function tpiBroadcastListingSql() {
  return `SELECT tv.*, lb.id AS liveBroadcastId, lb.creator_id AS liveCreatorId,
    lb.video_id AS liveVideoId, lb.title AS liveTitle, lb.status AS liveStatus,
    lb.scheduled_at AS liveScheduledAt, lb.scheduled_timezone AS liveScheduledTimezone,
    lb.visibility AS liveVisibility, lb.playback_provider AS livePlaybackProvider,
    lb.playback_url AS livePlaybackUrl, lb.playback_verified AS livePlaybackVerified,
    lb.replay_url AS liveReplayUrl, lb.replay_published AS liveReplayPublished,
    lb.moderation_status AS liveModerationStatus, lb.started_at AS liveStartedAt,
    lb.ended_at AS liveEndedAt, lb.sync_version AS liveSyncVersion, lb.last_sync_at AS liveLastSyncAt,
    lb.created_at AS liveCreatedAt, lb.updated_at AS liveUpdatedAt,
    ch.slug AS channelSlug, ch.display_name AS channelName, ch.description AS channelDescription,
    ch.artwork_url AS channelArtwork, c.username AS creatorUsername, c.display_name AS creatorDisplayName,
    c.title AS creatorTitle, c.photo_url AS creatorPhoto
    FROM live_broadcasts lb
    JOIN tpi_videos tv ON tv.broadcast_id = lb.id
    LEFT JOIN tpi_video_channels ch ON ch.id = tv.channel_id
    LEFT JOIN contributors c ON c.id = tv.created_by`;
}

function tpiBroadcastPayload(row, includePrivate = false) {
  if (!row) return null;
  const isJoined = Boolean(row.liveBroadcastId);
  const broadcast = isJoined ? {
    id: row.liveBroadcastId, creator_id: row.liveCreatorId, video_id: row.liveVideoId,
    title: row.liveTitle, status: row.liveStatus, scheduled_at: row.liveScheduledAt,
    scheduled_timezone: row.liveScheduledTimezone, visibility: row.liveVisibility,
    playback_provider: row.livePlaybackProvider, playback_url: row.livePlaybackUrl,
    playback_verified: row.livePlaybackVerified, replay_url: row.liveReplayUrl,
    replay_published: row.liveReplayPublished, moderation_status: row.liveModerationStatus,
    started_at: row.liveStartedAt, ended_at: row.liveEndedAt, created_at: row.liveCreatedAt,
    updated_at: row.liveUpdatedAt, sync_version: row.liveSyncVersion, last_sync_at: row.liveLastSyncAt
  } : row.broadcast;
  const video = isJoined ? row : row.video;
  if (!broadcast || !video) return null;
  const playbackVerified = Boolean(broadcast.playback_verified || video.playback_verified);
  const replayPublished = Boolean(broadcast.replay_published || video.replay_published);
  const playbackUrl = playbackVerified ? (broadcast.playback_url || video.video_url || "") : "";
  const replayUrl = replayPublished ? (broadcast.replay_url || video.replay_url || "") : "";
  const revision = Math.max(Number(broadcast.sync_version || 1), Number(video.sync_version || 1));
  const lifecycle = broadcast.status || "ready";
  const availability = lifecycle === "live" ? (playbackVerified ? "live" : "live_unverified")
    : lifecycle === "ended" ? (replayPublished ? "replay" : "ended")
      : lifecycle === "cancelled" ? "cancelled"
        : (broadcast.scheduled_at ? "upcoming" : "ready");
  return {
    id: broadcast.id,
    listingId: video.id,
    slug: video.slug,
    creatorId: broadcast.creator_id || video.created_by,
    channelId: video.channel_id || null,
    channelSlug: video.channelSlug || null,
    channelName: video.channelName || null,
    title: video.title || broadcast.title,
    description: video.description || "",
    category: video.category || "Live Streams",
    tags: video.tags ? video.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
    listingStatus: video.status,
    status: lifecycle,
    availability,
    scheduledAt: broadcast.scheduled_at || video.scheduled_at || null,
    scheduledTimezone: broadcast.scheduled_timezone || video.scheduled_timezone || null,
    visibility: broadcast.visibility || (video.viewing_access === "public" ? "public" : "members"),
    playbackProvider: broadcast.playback_provider || video.playback_provider || video.platform || null,
    playbackUrl: includePrivate || playbackVerified ? playbackUrl : "",
    playbackVerified,
    replayUrl: includePrivate || replayPublished ? replayUrl : "",
    replayPublished,
    moderationStatus: broadcast.moderation_status || "approved",
    startedAt: broadcast.started_at || video.actual_started_at || null,
    endedAt: broadcast.ended_at || video.actual_ended_at || null,
    video: tpiVideoPayload(video),
    revision,
    syncVersion: revision,
    lastSyncAt: broadcast.last_sync_at || video.last_sync_at || null,
    creator: video.created_by ? { id: video.created_by, username: video.creatorUsername || "", displayName: video.creatorDisplayName || "", title: video.creatorTitle || "", photoUrl: video.creatorPhoto || "" } : null,
    createdAt: broadcast.created_at || video.created_at,
    updatedAt: broadcast.updated_at || video.updated_at
  };
}

function tpiBroadcastRevision(record) {
  return Math.max(Number(record?.broadcast?.sync_version || 1), Number(record?.video?.sync_version || 1));
}

function expectedBroadcastRevision(data) {
  if (data?.expectedRevision === undefined || data?.expectedRevision === null || data?.expectedRevision === "") return null;
  const revision = Number(data.expectedRevision);
  return Number.isInteger(revision) && revision > 0 ? revision : NaN;
}

function sameOriginMutationAllowed(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function broadcastConflictResponse(record) {
  return json({
    error: "This broadcast changed elsewhere. Refresh the server copy before retrying.",
    code: "conflict",
    broadcast: tpiBroadcastPayload({ broadcast: record.broadcast, video: record.video }, true)
  }, 409, { "Cache-Control": "no-store" });
}

async function findTpiBroadcast(env, identifier) {
  const broadcast = await getLiveBroadcast(env, identifier);
  if (!broadcast) return null;
  const video = await env.TPI_DB.prepare(tpiVideoSelectSql() + " WHERE tv.broadcast_id = ? OR tv.id = ? LIMIT 1")
    .bind(broadcast.id, broadcast.video_id || "").first();
  return { broadcast, video };
}

function cleanBroadcastId(value) {
  const id = clean(value);
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/.test(id) ? id : "";
}

const STUDIO_WORKSPACE_MAX_STATE_BYTES = 32768;

function workspacePathId(path, suffix = "") {
  const prefix = "/studio/workspaces/";
  const raw = path.slice(prefix.length, suffix ? -suffix.length : undefined);
  return clean(decodeURIComponent(raw));
}

function normalizeStudioWorkspaceState(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const rawBroadcast = source.broadcast && typeof source.broadcast === "object" ? source.broadcast : {};
  const rawSettings = source.settings && typeof source.settings === "object" ? source.settings : {};
  const rawRecording = source.recording && typeof source.recording === "object" ? source.recording : {};
  const scheduled = parseBroadcastSchedule(rawBroadcast.scheduledAt);
  const broadcast = {
    id: cleanBroadcastId(rawBroadcast.id),
    title: cleanVideoText(rawBroadcast.title || "", 180),
    description: cleanVideoText(rawBroadcast.description || "", 1000),
    scheduledAt: scheduled.error ? null : scheduled.value,
    visibility: normalizeBroadcastVisibility(clean(rawBroadcast.visibility), "private"),
    status: ["draft", "ready", "upcoming", "live", "ended", "cancelled"].includes(clean(rawBroadcast.status)) ? clean(rawBroadcast.status) : "draft",
    tpiSync: rawBroadcast.tpiSync && typeof rawBroadcast.tpiSync === "object" ? {
      broadcastId: cleanBroadcastId(rawBroadcast.tpiSync.broadcastId),
      revision: Number.isInteger(Number(rawBroadcast.tpiSync.revision)) && Number(rawBroadcast.tpiSync.revision) > 0 ? Number(rawBroadcast.tpiSync.revision) : null,
      visibility: normalizeBroadcastVisibility(clean(rawBroadcast.tpiSync.visibility), "private"),
      syncState: clean(rawBroadcast.tpiSync.syncState).slice(0, 40),
      lastSyncedAt: clean(rawBroadcast.tpiSync.lastSyncedAt).slice(0, 80) || null
    } : null
  };
  const settings = {
    programOrientation: ["landscape", "portrait", "square"].includes(clean(rawSettings.programOrientation)) ? clean(rawSettings.programOrientation) : "landscape",
    recordingDestination: ["browser", "folder"].includes(clean(rawSettings.recordingDestination)) ? clean(rawSettings.recordingDestination) : "browser",
    keepLocalBackup: rawSettings.keepLocalBackup !== false,
    saveAutomatically: rawSettings.saveAutomatically === true,
    recordBackstageAutomatically: rawSettings.recordBackstageAutomatically === true,
    resumeBackstageAfterShow: rawSettings.resumeBackstageAfterShow === true
  };
  const recording = {
    localLibraryCount: Number.isInteger(Number(rawRecording.localLibraryCount)) && Number(rawRecording.localLibraryCount) >= 0 ? Math.min(Number(rawRecording.localLibraryCount), 100000) : 0,
    incompleteSessionCount: Number.isInteger(Number(rawRecording.incompleteSessionCount)) && Number(rawRecording.incompleteSessionCount) >= 0 ? Math.min(Number(rawRecording.incompleteSessionCount), 10000) : 0,
    storageMode: ["browser", "folder"].includes(clean(rawRecording.storageMode)) ? clean(rawRecording.storageMode) : "browser"
  };
  const normalized = { broadcast, settings, recording };
  const serialized = JSON.stringify(normalized);
  const bytes = typeof TextEncoder === "function" ? new TextEncoder().encode(serialized).length : serialized.length;
  if (bytes > STUDIO_WORKSPACE_MAX_STATE_BYTES) return { error: "Workspace state is too large to save." };
  return { value: normalized, serialized };
}

function studioWorkspacePayload(row) {
  if (!row) return null;
  return {
    id: row.id,
    channelId: row.channel_id || null,
    roomId: row.room_id || null,
    localBroadcastId: row.local_broadcast_id,
    title: row.title,
    description: row.description || "",
    workspaceType: row.workspace_type,
    status: row.status,
    state: safeJsonParse(row.state_json) || {},
    version: Number(row.version || 1),
    lastOpenedAt: row.last_opened_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getOwnedStudioWorkspace(env, id, userId) {
  return env.TPI_DB.prepare(`
    SELECT id, owner_id, channel_id, room_id, local_broadcast_id, title, description,
           workspace_type, status, state_json, version, last_opened_at, created_at, updated_at
    FROM studio_workspaces
    WHERE id = ? AND owner_id = ?
    LIMIT 1
  `).bind(id, userId).first();
}

async function handleListStudioWorkspaces(request, env, user) {
  const url = new URL(request.url);
  const includeArchived = url.searchParams.get("includeArchived") === "1" || url.searchParams.get("includeArchived") === "true";
  const { results } = await env.TPI_DB.prepare(`
    SELECT id, owner_id, channel_id, room_id, local_broadcast_id, title, description,
           workspace_type, status, state_json, version, last_opened_at, created_at, updated_at
    FROM studio_workspaces
    WHERE owner_id = ? ${includeArchived ? "" : "AND status = 'active'"}
    ORDER BY updated_at DESC
    LIMIT 50
  `).bind(user.id).all();
  return json({ workspaces: (results || []).map(studioWorkspacePayload) }, 200, { "Cache-Control": "private, no-store" });
}

async function handleCreateStudioWorkspace(request, env, user) {
  if (!sameOriginMutationAllowed(request)) return json({ error: "Cross-origin workspace mutations are not allowed." }, 403);
  const data = await readJson(request);
  const localBroadcastId = cleanBroadcastId(data.localBroadcastId || data.broadcast?.id) || `local-${crypto.randomUUID()}`;
  const title = cleanVideoText(data.title || data.broadcast?.title || "", 180);
  if (!title) return json({ error: "Workspace title is required." }, 400);
  const description = cleanVideoText(data.description || data.broadcast?.description || "", 1000);
  const state = normalizeStudioWorkspaceState(data.state || {});
  if (state.error) return json({ error: state.error }, 413);
  const existing = await env.TPI_DB.prepare("SELECT id FROM studio_workspaces WHERE owner_id = ? AND local_broadcast_id = ? LIMIT 1")
    .bind(user.id, localBroadcastId).first();
  if (existing) {
    const current = await getOwnedStudioWorkspace(env, existing.id, user.id);
    return json({ error: "A workspace already exists for this broadcast.", code: "workspace_exists", workspace: studioWorkspacePayload(current) }, 409, { "Cache-Control": "no-store" });
  }
  const channel = await env.TPI_DB.prepare("SELECT id FROM tpi_video_channels WHERE owner_id = ? LIMIT 1").bind(user.id).first();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    INSERT INTO studio_workspaces
      (id, owner_id, channel_id, local_broadcast_id, title, description, workspace_type, status, state_json, version, last_opened_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'broadcast', 'active', ?, 1, ?, ?, ?)
  `).bind(id, user.id, channel?.id || null, localBroadcastId, title, description, state.serialized, now, now, now).run();
  const workspace = await getOwnedStudioWorkspace(env, id, user.id);
  return json({ ok: true, workspace: studioWorkspacePayload(workspace) }, 201, { "Cache-Control": "private, no-store" });
}

async function handleGetStudioWorkspace(path, request, env, user) {
  const id = workspacePathId(path);
  const workspace = await getOwnedStudioWorkspace(env, id, user.id);
  if (!workspace) return json({ error: "Workspace not found." }, 404, { "Cache-Control": "no-store" });
  const now = new Date().toISOString();
  await env.TPI_DB.prepare("UPDATE studio_workspaces SET last_opened_at = ?, updated_at = updated_at WHERE id = ? AND owner_id = ?")
    .bind(now, id, user.id).run();
  workspace.last_opened_at = now;
  return json({ workspace: studioWorkspacePayload(workspace) }, 200, { "Cache-Control": "private, no-store" });
}

async function handleUpdateStudioWorkspace(path, request, env, user) {
  if (!sameOriginMutationAllowed(request)) return json({ error: "Cross-origin workspace mutations are not allowed." }, 403);
  const id = workspacePathId(path);
  const existing = await getOwnedStudioWorkspace(env, id, user.id);
  if (!existing) return json({ error: "Workspace not found." }, 404);
  const data = await readJson(request);
  const expectedVersion = data.expectedVersion === undefined || data.expectedVersion === null || data.expectedVersion === "" ? null : Number(data.expectedVersion);
  if (expectedVersion !== null && (!Number.isInteger(expectedVersion) || expectedVersion < 1)) return json({ error: "expectedVersion must be a positive integer." }, 400);
  if (expectedVersion !== null && expectedVersion !== Number(existing.version)) {
    return json({ error: "This workspace changed elsewhere. Refresh before saving again.", code: "conflict", workspace: studioWorkspacePayload(existing) }, 409, { "Cache-Control": "no-store" });
  }
  const title = data.title !== undefined ? cleanVideoText(data.title, 180) : existing.title;
  if (!title) return json({ error: "Workspace title is required." }, 400);
  const description = data.description !== undefined ? cleanVideoText(data.description, 1000) : existing.description || "";
  const state = data.state === undefined ? { serialized: existing.state_json } : normalizeStudioWorkspaceState(data.state);
  if (state.error) return json({ error: state.error }, 413);
  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    UPDATE studio_workspaces
    SET title = ?, description = ?, state_json = ?, version = version + 1, updated_at = ?, last_opened_at = ?
    WHERE id = ? AND owner_id = ? AND version = ?
  `).bind(title, description, state.serialized, now, now, id, user.id, Number(existing.version)).run();
  const updated = await getOwnedStudioWorkspace(env, id, user.id);
  return json({ ok: true, workspace: studioWorkspacePayload(updated) }, 200, { "Cache-Control": "private, no-store" });
}

async function handleArchiveStudioWorkspace(path, request, env, user) {
  if (!sameOriginMutationAllowed(request)) return json({ error: "Cross-origin workspace mutations are not allowed." }, 403);
  const id = workspacePathId(path, "/archive");
  const existing = await getOwnedStudioWorkspace(env, id, user.id);
  if (!existing) return json({ error: "Workspace not found." }, 404);
  const data = await readJson(request);
  const expectedVersion = data.expectedVersion === undefined || data.expectedVersion === null || data.expectedVersion === "" ? null : Number(data.expectedVersion);
  if (expectedVersion !== null && (!Number.isInteger(expectedVersion) || expectedVersion < 1)) return json({ error: "expectedVersion must be a positive integer." }, 400);
  if (expectedVersion !== null && expectedVersion !== Number(existing.version)) return json({ error: "This workspace changed elsewhere. Refresh before archiving again.", code: "conflict", workspace: studioWorkspacePayload(existing) }, 409, { "Cache-Control": "no-store" });
  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`UPDATE studio_workspaces SET status = 'archived', version = version + 1, updated_at = ? WHERE id = ? AND owner_id = ? AND version = ?`)
    .bind(now, id, user.id, Number(existing.version)).run();
  const archived = await getOwnedStudioWorkspace(env, id, user.id);
  return json({ ok: true, workspace: studioWorkspacePayload(archived) }, 200, { "Cache-Control": "private, no-store" });
}

function parseBroadcastSchedule(value) {
  const raw = clean(value);
  if (!raw) return { value: null };
  const time = Date.parse(raw);
  if (!Number.isFinite(time)) return { error: "scheduledAt must be a valid date and time." };
  return { value: new Date(time).toISOString() };
}

function normalizeBroadcastVisibility(value, fallback = "private") {
  return ["private", "members", "public"].includes(value) ? value : fallback;
}

function validateBroadcastPlayback(value) {
  const raw = clean(value);
  if (!raw) return { ok: true, url: "", provider: "" };
  const source = validateVideoSource(raw, "");
  if (!source.ok) return { ok: false, error: source.error };
  return { ok: true, url: source.videoUrl, provider: source.provider };
}

function broadcastOwnerOrAdmin(record, user) {
  return Boolean(record && user && (record.broadcast.creator_id === user.id || ["owner", "admin"].includes(user.role)));
}

async function handleListTpiBroadcasts(request, env) {
  const url = new URL(request.url);
  const user = await getSessionUser(request, env);
  const requestedStatus = clean(url.searchParams.get("status")).toLowerCase() || "all";
  const mine = url.searchParams.get("mine") === "true" || url.searchParams.get("mine") === "1";
  const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(url.searchParams.get("pageSize") || "24", 10) || 24, 1), 48);
  const offset = (page - 1) * pageSize;
  if (mine && (!user || !["owner", "admin", "contributor"].includes(user.role))) return json({ error: "Contributor login required." }, 401);
  const params = [];
  let query = tpiBroadcastListingSql() + " WHERE 1=1";
  if (mine) {
    query += " AND tv.created_by = ?";
    params.push(user.id);
  } else {
    query += " AND tv.status = 'published' AND lb.moderation_status = 'approved' AND (lb.visibility = 'public'";
    if (user) { query += " OR lb.visibility = 'members'"; }
    query += ")";
  }
  const now = new Date().toISOString();
  if (requestedStatus === "upcoming") query += " AND lb.status = 'ready' AND lb.scheduled_at IS NOT NULL AND lb.scheduled_at > ?", params.push(now);
  else if (requestedStatus === "live") query += " AND lb.status = 'live' AND COALESCE(lb.playback_verified, 0) = 1";
  else if (requestedStatus === "ended") query += " AND lb.status = 'ended' AND COALESCE(lb.replay_published, 0) = 0";
  else if (requestedStatus === "replay") query += " AND lb.status = 'ended' AND COALESCE(lb.replay_published, 0) = 1";
  else if (requestedStatus !== "all") return json({ error: "Unsupported broadcast status filter." }, 400);
  query += " ORDER BY CASE WHEN lb.status = 'live' THEN 0 WHEN lb.status = 'ready' THEN 1 ELSE 2 END, COALESCE(lb.scheduled_at, lb.updated_at) ASC LIMIT ? OFFSET ?";
  params.push(pageSize + 1, offset);
  const { results } = await env.TPI_DB.prepare(query).bind(...params).all();
  const rows = results || [];
  const hasMore = rows.length > pageSize;
  return json({ broadcasts: rows.slice(0, pageSize).map(row => tpiBroadcastPayload(row, mine)), page, pageSize, hasMore, nextPage: hasMore ? page + 1 : null }, 200, { "Cache-Control": mine ? "private, no-store" : "no-store" });
}

async function handleGetTpiBroadcast(path, request, env) {
  const identifier = clean(decodeURIComponent(path.replace(/^\/tpi-broadcasts\//, "")));
  const record = await findTpiBroadcast(env, identifier);
  if (!record || !record.video) return json({ error: "Broadcast not found." }, 404, { "Cache-Control": "no-store" });
  const user = await getSessionUser(request, env);
  const owner = broadcastOwnerOrAdmin(record, user);
  const publicReadable = record.video.status === "published" && record.broadcast.moderation_status === "approved"
    && (record.broadcast.visibility === "public" || Boolean(user));
  if (!owner && !publicReadable) return json({ error: "Broadcast not found." }, 404, { "Cache-Control": "no-store" });
  return json({ broadcast: tpiBroadcastPayload({ broadcast: record.broadcast, video: record.video }, owner) }, 200, { "Cache-Control": "no-store" });
}

async function handleCreateTpiBroadcast(request, env, user) {
  if (!sameOriginMutationAllowed(request)) return json({ error: "Cross-origin broadcast mutations are not allowed." }, 403);
  const data = await readJson(request);
  const id = cleanBroadcastId(data.broadcastId || data.id);
  const title = cleanVideoText(data.title || "", 180);
  if (!id) return json({ error: "broadcastId must contain only letters, numbers, dots, underscores, colons, or hyphens." }, 400);
  if (!title) return json({ error: "Broadcast title is required." }, 400);
  const schedule = parseBroadcastSchedule(data.scheduledAt);
  if (schedule.error) return json({ error: schedule.error }, 400);
  const channel = await ensureTpiChannel(env, user);
  const existing = await findTpiBroadcast(env, id);
  if (existing) {
    if (!broadcastOwnerOrAdmin(existing, user)) return json({ error: "You cannot modify this broadcast." }, 403);
    return json({ ok: true, existing: true, broadcast: tpiBroadcastPayload({ broadcast: existing.broadcast, video: existing.video }, true) }, 200, { "Cache-Control": "no-store" });
  }
  const visibility = normalizeBroadcastVisibility(clean(data.visibility), "private");
  const category = cleanVideoText(data.category || "Live Streams", 120);
  if (!TPI_VIDEO_CATEGORIES.has(category)) return json({ error: "Choose a supported TPI video category." }, 400);
  const playback = validateBroadcastPlayback(data.playbackUrl);
  if (!playback.ok) return json({ error: playback.error }, 400);
  const thumbnail = validateThumbnailUrl(clean(data.thumbnail));
  if (!thumbnail.ok) return json({ error: thumbnail.error }, 400);
  const now = new Date().toISOString();
  const videoId = crypto.randomUUID();
  const slugBase = slugify(data.slug || title);
  const slugTaken = await env.TPI_DB.prepare("SELECT id FROM tpi_videos WHERE slug = ?").bind(slugBase).first();
  const slug = slugTaken ? `${slugBase}-${Date.now()}` : slugBase;
  const status = schedule.value ? "upcoming" : "ready";
  await env.TPI_DB.batch([
    env.TPI_DB.prepare(`INSERT INTO live_broadcasts
      (id, creator_id, video_id, title, status, scheduled_at, scheduled_timezone, visibility, playback_provider, playback_url, playback_verified, replay_published, moderation_status, sync_version, last_sync_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'ready', ?, ?, ?, ?, ?, 0, 0, 'approved', 1, ?, ?, ?)`)
      .bind(id, user.id, videoId, title, schedule.value, clean(data.scheduledTimezone).slice(0, 120) || null, visibility, playback.provider || null, playback.url || null, now, now, now),
    env.TPI_DB.prepare(`INSERT INTO tpi_videos
      (id, slug, title, description, published_at, category, tags, platform, video_url, embed_url, thumbnail, featured, is_live, live_started_at, series, episode, duration, viewing_access, status, created_by, created_at, updated_at, channel_id, broadcast_id, broadcast_status, scheduled_at, scheduled_timezone, playback_provider, playback_url, playback_verified, replay_published, sync_version, last_sync_at)
      VALUES (?, ?, ?, ?, NULL, ?, ?, ?, '', '', ?, 0, 0, NULL, '', '', '', ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1, ?)`)
      .bind(videoId, slug, title, cleanVideoText(data.description, 10000), category, normalizeVideoTags(data.tags), playback.provider ? (playback.provider === "youtube" ? "YouTube" : playback.provider) : "", thumbnail.value, visibility === "public" ? "public" : "members", user.id, now, now, channel.id, id, status, schedule.value, clean(data.scheduledTimezone).slice(0, 120) || null, playback.provider || null, playback.url || null, now)
  ]);
  const record = await findTpiBroadcast(env, id);
  return json({ ok: true, existing: false, broadcast: tpiBroadcastPayload({ broadcast: record.broadcast, video: record.video }, true) }, 201, { "Cache-Control": "no-store" });
}

async function handleUpdateTpiBroadcast(path, request, env, user) {
  if (!sameOriginMutationAllowed(request)) return json({ error: "Cross-origin broadcast mutations are not allowed." }, 403);
  const identifier = clean(decodeURIComponent(path.replace(/^\/tpi-broadcasts\//, "")));
  const record = await findTpiBroadcast(env, identifier);
  if (!record || !record.video) return json({ error: "Broadcast not found." }, 404);
  if (!broadcastOwnerOrAdmin(record, user)) return json({ error: "You can only edit your own broadcasts." }, 403);
  const data = await readJson(request);
  const expectedRevision = expectedBroadcastRevision(data);
  if (Number.isNaN(expectedRevision)) return json({ error: "expectedRevision must be a positive integer." }, 400);
  if (expectedRevision !== null && expectedRevision !== tpiBroadcastRevision(record)) return broadcastConflictResponse(record);
  const title = data.title !== undefined ? cleanVideoText(data.title, 180) : record.video.title;
  if (!title) return json({ error: "Broadcast title is required." }, 400);
  const schedule = data.scheduledAt !== undefined ? parseBroadcastSchedule(data.scheduledAt) : { value: record.broadcast.scheduled_at || null };
  if (schedule.error) return json({ error: schedule.error }, 400);
  const category = data.category !== undefined ? cleanVideoText(data.category, 120) : record.video.category;
  if (!TPI_VIDEO_CATEGORIES.has(category)) return json({ error: "Choose a supported TPI video category." }, 400);
  const visibility = data.visibility !== undefined ? normalizeBroadcastVisibility(clean(data.visibility), record.broadcast.visibility || "private") : (record.broadcast.visibility || "private");
  const playback = data.playbackUrl !== undefined ? validateBroadcastPlayback(data.playbackUrl) : { ok: true, url: record.broadcast.playback_url || "", provider: record.broadcast.playback_provider || "" };
  if (!playback.ok) return json({ error: playback.error }, 400);
  const now = new Date().toISOString();
  const nextStatus = ["ready"].includes(record.broadcast.status) ? (schedule.value ? "upcoming" : "ready") : (record.video.broadcast_status || record.broadcast.status);
  await env.TPI_DB.batch([
    env.TPI_DB.prepare(`UPDATE live_broadcasts SET title=?, scheduled_at=?, scheduled_timezone=?, visibility=?, playback_provider=?, playback_url=?, playback_verified=CASE WHEN ? != COALESCE(playback_url, '') THEN 0 ELSE playback_verified END, updated_at=?, sync_version=sync_version+1, last_sync_at=? WHERE id=?`)
      .bind(title, schedule.value, data.scheduledTimezone !== undefined ? clean(data.scheduledTimezone).slice(0, 120) || null : record.broadcast.scheduled_timezone || null, visibility, playback.provider || null, playback.url || null, playback.url || "", now, now, record.broadcast.id),
    env.TPI_DB.prepare(`UPDATE tpi_videos SET title=?, description=?, category=?, tags=?, viewing_access=?, scheduled_at=?, scheduled_timezone=?, playback_provider=?, playback_url=?, playback_verified=CASE WHEN ? != COALESCE(playback_url, '') THEN 0 ELSE playback_verified END, broadcast_status=?, updated_at=?, sync_version=sync_version+1, last_sync_at=? WHERE id=?`)
      .bind(title, data.description !== undefined ? cleanVideoText(data.description, 10000) : record.video.description || "", category, data.tags !== undefined ? normalizeVideoTags(data.tags) : record.video.tags || "", visibility === "public" ? "public" : "members", schedule.value, data.scheduledTimezone !== undefined ? clean(data.scheduledTimezone).slice(0, 120) || null : record.video.scheduled_timezone || null, playback.provider || null, playback.url || null, playback.url || "", nextStatus, now, now, record.video.id)
  ]);
  const updated = await findTpiBroadcast(env, record.broadcast.id);
  return json({ ok: true, broadcast: tpiBroadcastPayload({ broadcast: updated.broadcast, video: updated.video }, true) }, 200, { "Cache-Control": "no-store" });
}

async function handleTpiBroadcastAction(path, request, env, user) {
  if (!sameOriginMutationAllowed(request)) return json({ error: "Cross-origin broadcast mutations are not allowed." }, 403);
  const match = path.match(/^\/tpi-broadcasts\/([^/]+)\/(publish|unpublish|cancel|status|playback|replay)$/);
  const identifier = clean(decodeURIComponent(match?.[1] || ""));
  const action = match?.[2] || "";
  const record = await findTpiBroadcast(env, identifier);
  if (!record || !record.video) return json({ error: "Broadcast not found." }, 404);
  if (!broadcastOwnerOrAdmin(record, user)) return json({ error: "You can only manage your own broadcasts." }, 403);
  const now = new Date().toISOString();
  const data = await readJson(request);
  const expectedRevision = expectedBroadcastRevision(data);
  if (Number.isNaN(expectedRevision)) return json({ error: "expectedRevision must be a positive integer." }, 400);
  if (expectedRevision !== null && expectedRevision !== tpiBroadcastRevision(record)) return broadcastConflictResponse(record);
  const wasPublished = record.video.status === "published";
  const hadReplay = Boolean(record.broadcast.replay_published || record.video.replay_published);
  if (action === "publish") {
    if (record.broadcast.status === "cancelled") return json({ error: "Cancelled broadcasts cannot be published." }, 409);
    if (record.broadcast.scheduled_at && Date.parse(record.broadcast.scheduled_at) <= Date.now()) return json({ error: "Scheduled time must be in the future before publishing." }, 400);
    const visibility = normalizeBroadcastVisibility(clean(data.visibility), record.broadcast.visibility || "public");
    await env.TPI_DB.batch([
      env.TPI_DB.prepare("UPDATE live_broadcasts SET visibility=?, updated_at=?, sync_version=sync_version+1, last_sync_at=? WHERE id=?").bind(visibility, now, now, record.broadcast.id),
      env.TPI_DB.prepare("UPDATE tpi_videos SET status='published', published_at=COALESCE(published_at, ?), viewing_access=?, broadcast_status=?, updated_at=?, sync_version=sync_version+1, last_sync_at=? WHERE id=?").bind(now, visibility === "public" ? "public" : "members", record.broadcast.scheduled_at ? "upcoming" : "ready", now, now, record.video.id)
    ]);
  } else if (action === "unpublish") {
    await env.TPI_DB.batch([
      env.TPI_DB.prepare("UPDATE tpi_videos SET status='draft', is_live=0, updated_at=?, sync_version=sync_version+1, last_sync_at=? WHERE id=?").bind(now, now, record.video.id),
      env.TPI_DB.prepare("UPDATE live_broadcasts SET updated_at=?, sync_version=sync_version+1, last_sync_at=? WHERE id=?").bind(now, now, record.broadcast.id)
    ]);
  } else if (action === "cancel") {
    if (["ended", "cancelled"].includes(record.broadcast.status)) return json({ error: "This broadcast is already finalized." }, 409);
    await env.TPI_DB.prepare("UPDATE live_broadcasts SET status='cancelled', ended_at=COALESCE(ended_at, ?), updated_at=?, sync_version=sync_version+1, last_sync_at=? WHERE id=?").bind(now, now, now, record.broadcast.id).run();
    await syncTpiVideoFromLiveBroadcast(env, record.broadcast.id, "cancelled");
  } else if (action === "status") {
    const next = clean(data.status).toLowerCase();
    if (!["ready", "live", "ended", "cancelled"].includes(next)) return json({ error: "Unsupported broadcast status." }, 400);
    const current = record.broadcast.status;
    const allowed = current === next || (current === "ready" && ["live", "cancelled"].includes(next)) || (current === "live" && next === "ended");
    if (!allowed) return json({ error: `Invalid broadcast transition from ${current} to ${next}.` }, 409);
    await env.TPI_DB.prepare(`UPDATE live_broadcasts SET status=?, started_at=CASE WHEN ?='live' THEN COALESCE(started_at, ?) ELSE started_at END, ended_at=CASE WHEN ? IN ('ended','cancelled') THEN COALESCE(ended_at, ?) ELSE ended_at END, updated_at=?, sync_version=sync_version+1, last_sync_at=? WHERE id=?`).bind(next, next, now, next, now, now, now, record.broadcast.id).run();
    await syncTpiVideoFromLiveBroadcast(env, record.broadcast.id, next);
  } else if (action === "playback") {
    const playback = validateBroadcastPlayback(data.playbackUrl);
    if (!playback.ok || !playback.url) return json({ error: playback.error || "A supported playback URL is required." }, 400);
    await env.TPI_DB.batch([
      env.TPI_DB.prepare("UPDATE live_broadcasts SET playback_provider=?, playback_url=?, playback_verified=0, updated_at=?, sync_version=sync_version+1, last_sync_at=? WHERE id=?").bind(playback.provider, playback.url, now, now, record.broadcast.id),
      env.TPI_DB.prepare("UPDATE tpi_videos SET playback_provider=?, playback_url=?, playback_verified=0, updated_at=?, sync_version=sync_version+1, last_sync_at=? WHERE id=?").bind(playback.provider, playback.url, now, now, record.video.id)
    ]);
  } else if (action === "replay") {
    const publish = data.publish !== false;
    const replay = validateBroadcastPlayback(data.replayUrl || record.broadcast.replay_url || record.video.replay_url);
    if (publish && (!replay.ok || !replay.url)) return json({ error: replay.error || "A supported replay URL is required." }, 400);
    await env.TPI_DB.batch([
      env.TPI_DB.prepare("UPDATE live_broadcasts SET replay_url=?, replay_published=?, updated_at=?, sync_version=sync_version+1, last_sync_at=? WHERE id=?").bind(publish ? replay.url : null, publish ? 1 : 0, now, now, record.broadcast.id),
      env.TPI_DB.prepare("UPDATE tpi_videos SET replay_url=?, replay_published=?, updated_at=?, sync_version=sync_version+1, last_sync_at=? WHERE id=?").bind(publish ? replay.url : null, publish ? 1 : 0, now, now, record.video.id)
    ]);
  }
  const updated = await findTpiBroadcast(env, record.broadcast.id);
  if (action === "publish" && !wasPublished && updated?.video?.status === "published") {
    await notifyVideoFollowers(env, updated.video.channel_id, {
      title: updated.video.title,
      description: updated.video.description || "A creator you follow published a live broadcast.",
      slug: updated.video.slug,
      creatorId: updated.video.created_by
    });
  }
  if (action === "replay" && data.publish !== false && !hadReplay && updated?.video?.replay_published) {
    await notifyVideoFollowers(env, updated.video.channel_id, {
      title: `${updated.video.title} replay available`,
      description: "A replay is now available from a creator you follow.",
      slug: updated.video.slug,
      creatorId: updated.video.created_by
    });
  }
  return json({ ok: true, broadcast: tpiBroadcastPayload({ broadcast: updated.broadcast, video: updated.video }, true) }, 200, { "Cache-Control": "no-store" });
}

async function handleListTpiVideos(request, env) {
  const url = new URL(request.url);
  const user = await getSessionUser(request, env);
  const requestedStatus = clean(url.searchParams.get("status"));
  const mine = url.searchParams.get("mine") === "true" || url.searchParams.get("mine") === "1";
  const category = clean(url.searchParams.get("category"));
  const source = clean(url.searchParams.get("source")).toLowerCase() || "all";
  const creator = clean(url.searchParams.get("creator")).slice(0, 120);
  const queryText = clean(url.searchParams.get("q")).slice(0, 120);
  const following = url.searchParams.get("following") === "true" || url.searchParams.get("following") === "1";
  const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(url.searchParams.get("pageSize") || "24", 10) || 24, 1), 48);
  const offset = (page - 1) * pageSize;
  const sort = ["oldest", "alpha", "relevance"].includes(clean(url.searchParams.get("sort")).toLowerCase())
    ? clean(url.searchParams.get("sort")).toLowerCase() : "newest";
  const liveFilter = url.searchParams.get("live");
  const requestedFormat = clean(url.searchParams.get("format")).toLowerCase();
  const formatFilter = ["regular", "shorts"].includes(requestedFormat) ? requestedFormat : "";

  if (mine && (!user || !["owner", "admin", "contributor"].includes(user.role))) {
    return json({ error: "Contributor login required." }, 401);
  }
  if (following && !user) return json({ error: "Member login required." }, 401);
  if (requestedStatus && !user) return json({ videos: [], page, pageSize, hasMore: false }, 200, { "Cache-Control": "private, no-store" });

  const authoredRows = [];
  const scrapedRows = [];
  const like = `%${queryText}%`;
  const authoredParams = [];
  let authoredQuery = tpiVideoSelectSql() + " WHERE 1=1";
  if (mine) {
    authoredQuery += " AND tv.created_by = ?";
    authoredParams.push(user.id);
    if (requestedStatus && requestedStatus !== "all") {
      authoredQuery += " AND tv.status = ?";
      authoredParams.push(requestedStatus);
    }
  } else if (requestedStatus) {
    authoredQuery += " AND tv.status = ?";
    authoredParams.push(requestedStatus);
    if (!["owner", "admin"].includes(user.role)) {
      authoredQuery += " AND tv.created_by = ?";
      authoredParams.push(user.id);
    }
  } else {
    authoredQuery += " AND tv.status = 'published'";
    if (!user) authoredQuery += " AND tv.viewing_access = 'public'";
  }
  if (category) { authoredQuery += " AND tv.category = ?"; authoredParams.push(category); }
  if (creator) {
    authoredQuery += " AND (ch.slug = ? OR c.username = ? OR c.display_name LIKE ?)";
    authoredParams.push(creator, creator, `%${creator}%`);
  }
  if (queryText) {
    authoredQuery += " AND (tv.title LIKE ? OR tv.description LIKE ? OR tv.tags LIKE ? OR tv.category LIKE ? OR ch.display_name LIKE ? OR c.display_name LIKE ? OR c.username LIKE ?)";
    authoredParams.push(like, like, like, like, like, like, like);
  }
  if (liveFilter === "true" || liveFilter === "1") authoredQuery += " AND tv.is_live = 1";
  if (liveFilter === "false" || liveFilter === "0") authoredQuery += " AND tv.is_live = 0";
  if (url.searchParams.get("featured") === "true") authoredQuery += " AND tv.featured = 1";
  if (following) {
    authoredQuery += " AND tv.viewing_access = 'public' AND EXISTS (SELECT 1 FROM tpi_video_follows vf WHERE vf.channel_id = tv.channel_id AND vf.follower_id = ?)";
    authoredParams.push(user.id);
  }
  if (source !== "discovered") {
    const result = await env.TPI_DB.prepare(authoredQuery + " ORDER BY COALESCE(NULLIF(tv.published_at, ''), tv.updated_at) DESC LIMIT 200")
      .bind(...authoredParams).all();
    authoredRows.push(...(result.results || []).filter(row => mine || canReadTpiVideo(row, user)).map(row => ({ ...row, sourceType: "creator" })));
  }

  if (!mine && !requestedStatus && source !== "creator" && !following && liveFilter !== "true" && liveFilter !== "1") {
    const scrapedParams = [];
    let scrapedQuery = `SELECT id, title, description, thumbnail_url AS thumbnail, source_url AS videoUrl,
      source_name AS platform, source_name AS sourceName, channel_name AS channelName,
      duration_seconds AS duration, category, published_at AS publishedAt, scraped_at AS createdAt
      FROM videos WHERE status = 'approved'`;
    if (category) { scrapedQuery += " AND category = ?"; scrapedParams.push(category.toLowerCase()); }
    if (queryText) {
      scrapedQuery += " AND (title LIKE ? OR description LIKE ? OR category LIKE ? OR source_name LIKE ? OR channel_name LIKE ?)";
      scrapedParams.push(like, like, like, like, like);
    }
    if (creator) { scrapedQuery += " AND channel_name LIKE ?"; scrapedParams.push(`%${creator}%`); }
    const scrapedResult = await env.TPI_DB.prepare(scrapedQuery + " ORDER BY COALESCE(NULLIF(published_at, ''), scraped_at) DESC LIMIT 200")
      .bind(...scrapedParams).all();
    scrapedRows.push(...(scrapedResult.results || []).map(row => ({ ...row, slug: `scraped-${row.id}`, sourceType: "discovered", status: "published", viewingAccess: "public", isLive: false, featured: false, tags: [] })));
  }

  const combined = authoredRows.concat(scrapedRows).filter(row => {
    if (!formatFilter) return true;
    return formatFilter === "shorts" ? ["shorts", "reel", "reels"].includes(String(row.format || "").toLowerCase()) : !["shorts", "reel", "reels"].includes(String(row.format || "").toLowerCase());
  });
  combined.sort((a, b) => {
    if (sort === "alpha") return String(a.title || "").localeCompare(String(b.title || ""));
    if (sort === "relevance" && queryText) {
      const q = queryText.toLowerCase();
      const score = row => (String(row.title || "").toLowerCase().startsWith(q) ? 0 : String(row.title || "").toLowerCase().includes(q) ? 1 : 2);
      return score(a) - score(b) || String(b.publishedAt || b.published_at || "").localeCompare(String(a.publishedAt || a.published_at || ""));
    }
    const left = String(a.publishedAt || a.published_at || a.createdAt || a.created_at || "");
    const right = String(b.publishedAt || b.published_at || b.createdAt || b.created_at || "");
    return sort === "oldest" ? left.localeCompare(right) : right.localeCompare(left);
  });
  const pageRows = combined.slice(offset, offset + pageSize + 1);
  const hasMore = pageRows.length > pageSize;
  const videos = pageRows.slice(0, pageSize).map(row => row.sourceType === "discovered" ? scrapedVideoPayload(row) : tpiVideoPayload(row));
  return json({ videos, page, pageSize, hasMore, nextPage: hasMore ? page + 1 : null }, 200, { "Cache-Control": mine || requestedStatus ? "private, no-store" : "no-store" });
}

function scrapedVideoPayload(row) {
  const durationSeconds = Number.isFinite(Number(row.duration)) && Number(row.duration) > 0 ? Math.floor(Number(row.duration)) : null;
  return {
    id: String(row.id), slug: row.slug || `scraped-${row.id}`, title: row.title, description: row.description || "",
    publishedAt: row.publishedAt || null, category: row.category || "Discovered Video", tags: [], platform: row.platform || "External source",
    sourceName: row.sourceName || row.platform || "External source", sourceType: "discovered", videoUrl: row.videoUrl || "", embedUrl: "",
    thumbnail: row.thumbnail || "", featured: false, isLive: false, liveStartedAt: null, series: "", episode: "",
    duration: durationSeconds === null ? "" : String(durationSeconds), durationSeconds, durationUnit: "seconds", viewingAccess: "public", status: "published", channelId: null,
    channelSlug: null, channelName: row.channelName || row.sourceName || null, creator: null,
    createdAt: row.createdAt || row.publishedAt || null, updatedAt: row.createdAt || row.publishedAt || null
  };
}

async function handleGetTpiVideo(path, env, request) {
  const slug = clean(decodeURIComponent(path.replace(/^\/tpi-videos\//, "")));
  if (!slug) return json({ error: "Video slug is required." }, 400);
  const user = await getSessionUser(request, env);
  const row = await env.TPI_DB.prepare(tpiVideoSelectSql() + " WHERE tv.slug = ? LIMIT 1").bind(slug).first();
  if (row) {
    if (!canReadTpiVideo(row, user)) return json({ error: "Video not found." }, 404, { "Cache-Control": "no-store" });
    return json({ video: tpiVideoPayload({ ...row, sourceType: "creator" }) }, 200, { "Cache-Control": "no-store" });
  }
  const scrapedId = slug.match(/^scraped-(\d+)$/)?.[1];
  if (scrapedId) {
    const scraped = await env.TPI_DB.prepare(`SELECT id, title, description, thumbnail_url AS thumbnail, source_url AS videoUrl,
      source_name AS platform, source_name AS sourceName, channel_name AS channelName,
      duration_seconds AS duration, category, published_at AS publishedAt, scraped_at AS createdAt
      FROM videos WHERE id = ? AND status = 'approved'`).bind(scrapedId).first();
    if (scraped) return json({ video: scrapedVideoPayload({ ...scraped, slug }) }, 200, { "Cache-Control": "no-store" });
  }
  return json({ error: "Video not found." }, 404, { "Cache-Control": "no-store" });
}

async function handleLinkPreview(request, env) {
  const requestUrl = new URL(request.url);
  const raw = requestUrl.searchParams.get("url") || "";
  const safe = isSafePreviewUrl(raw);
  if (!safe.ok) return json({ error: safe.error }, 400, { "Cache-Control": "no-store" });

  const host = safe.url.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "paranormalinitiative.com") {
    const id = safe.url.searchParams.get("id") || safe.url.searchParams.get("slug") || "";
    if (["/tpi-video", "/tpi-video.html"].includes(safe.url.pathname) && id) {
      const row = await env.TPI_DB.prepare(tpiVideoSelectSql() + " WHERE tv.slug = ? LIMIT 1").bind(clean(id)).first();
      if (row && row.status === "published" && row.viewing_access === "public") {
        return json({ url: safe.url.toString(), title: row.title, description: String(row.description || "").slice(0, 320), image: row.thumbnail || "", host, fetched: true }, 200, { "Cache-Control": "public, max-age=300" });
      }
      const scrapedId = id.match(/^scraped-(\d+)$/)?.[1];
      if (scrapedId) {
        const scraped = await env.TPI_DB.prepare("SELECT title, description, thumbnail_url AS thumbnail FROM videos WHERE id = ? AND status = 'approved'").bind(scrapedId).first();
        if (scraped) return json({ url: safe.url.toString(), title: scraped.title, description: String(scraped.description || "").slice(0, 320), image: scraped.thumbnail || "", host, fetched: true }, 200, { "Cache-Control": "public, max-age=300" });
      }
    }
    return json({ url: safe.url.toString(), title: "The Paranormal Initiative", description: "", image: "", host, fetched: false }, 200, { "Cache-Control": "public, max-age=300" });
  }

  const result = await fetchExternalLinkPreview(safe.url.toString());
  if (!result.ok) return json({ error: result.error }, result.status || 502, { "Cache-Control": "no-store" });
  return json(result.preview || { url: safe.url.toString(), title: safe.url.hostname, description: "", image: "", host, fetched: false }, 200, { "Cache-Control": "public, max-age=300" });
}

function validateTpiVideoFields(data, existing = null) {
  const title = cleanVideoText(data.title !== undefined ? data.title : existing?.title, 180);
  if (!title) return { error: "Title is required." };
  const description = cleanVideoText(data.description !== undefined ? data.description : existing?.description, 10000);
  const category = cleanVideoText(data.category !== undefined ? data.category : existing?.category, 120) || "Applied Paranormal Research and Studies";
  if (!TPI_VIDEO_CATEGORIES.has(category)) return { error: "Choose a supported TPI video category." };
  const videoUrl = clean(data.videoUrl !== undefined ? data.videoUrl : existing?.video_url);
  const embedUrl = clean(data.embedUrl !== undefined ? data.embedUrl : existing?.embed_url);
  const source = validateVideoSource(videoUrl, embedUrl);
  if (!source.ok) return { error: source.error };
  const thumbnail = clean(data.thumbnail !== undefined ? data.thumbnail : existing?.thumbnail);
  const thumb = validateThumbnailUrl(thumbnail);
  if (!thumb.ok) return { error: thumb.error };
  return {
    title, description, category, videoUrl: source.videoUrl, embedUrl: source.embedUrl,
    thumbnail: thumb.value, platform: source.platform, tags: normalizeVideoTags(data.tags !== undefined ? data.tags : existing?.tags),
    featured: data.featured !== undefined ? (data.featured ? 1 : 0) : Number(existing?.featured || 0),
    isLive: data.isLive !== undefined ? (data.isLive ? 1 : 0) : Number(existing?.is_live || 0),
    liveStartedAt: data.isLive ? (clean(data.liveStartedAt) || new Date().toISOString()) : (data.isLive === false ? null : (existing?.live_started_at || null)),
    series: cleanVideoText(data.series !== undefined ? data.series : existing?.series, 180),
    episode: cleanVideoText(data.episode !== undefined ? data.episode : existing?.episode, 40),
    duration: cleanVideoText(data.duration !== undefined ? data.duration : existing?.duration, 30),
    format: ["shorts", "reel", "reels"].includes(String(data.format !== undefined ? data.format : existing?.format || "").toLowerCase()) ? "shorts" : "regular",
    viewingAccess: data.viewingAccess === "public" ? "public" : (data.viewingAccess === "members" ? "members" : (existing?.viewing_access || "members"))
  };
}

async function resolveOwnedChannel(env, user, channelId) {
  if (!channelId) return ensureTpiChannel(env, user);
  const channel = await env.TPI_DB.prepare("SELECT * FROM tpi_video_channels WHERE id = ? AND owner_id = ?").bind(channelId, user.id).first();
  return channel || null;
}

async function handleCreateTpiVideo(request, env, user) {
  const data = await readJson(request);
  const fields = validateTpiVideoFields(data);
  if (fields.error) return json({ error: fields.error }, 400);
  const channel = await resolveOwnedChannel(env, user, clean(data.channelId));
  if (!channel) return json({ error: "Channel was not found or is not owned by this account." }, 403);
  const baseSlug = slugify(data.slug || fields.title);
  const existing = await env.TPI_DB.prepare("SELECT id FROM tpi_videos WHERE slug = ?").bind(baseSlug).first();
  const finalSlug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;
  const id = clean(data.id) || crypto.randomUUID();
  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`INSERT INTO tpi_videos
    (id, slug, title, description, published_at, category, tags, platform, video_url, embed_url, thumbnail, featured, is_live, live_started_at, series, episode, duration, format, viewing_access, status, created_by, created_at, updated_at, channel_id)
    VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?)`)
    .bind(id, finalSlug, fields.title, fields.description, fields.category, fields.tags, fields.platform, fields.videoUrl, fields.embedUrl, fields.thumbnail, fields.featured, fields.isLive, fields.liveStartedAt, fields.series, fields.episode, fields.duration, fields.format, fields.viewingAccess, user.id, now, now, channel.id).run();
  return json({ ok: true, id, slug: finalSlug, status: "draft", channelSlug: channel.slug });
}

async function handleUpdateTpiVideo(path, request, env, user) {
  const slug = clean(decodeURIComponent(path.replace(/^\/tpi-videos\//, "")));
  if (!slug) return json({ error: "Video slug is required." }, 400);
  const existing = await env.TPI_DB.prepare("SELECT * FROM tpi_videos WHERE slug = ?").bind(slug).first();
  if (!existing) return json({ error: "Video not found." }, 404);
  if (!tpiVideoOwnerOrAdmin(existing, user)) return json({ error: "You can only edit your own video listings." }, 403);
  const data = await readJson(request);
  const fields = validateTpiVideoFields(data, existing);
  if (fields.error) return json({ error: fields.error }, 400);
  const channel = await resolveOwnedChannel(env, user, data.channelId !== undefined ? clean(data.channelId) : existing.channel_id);
  if (!channel) return json({ error: "Channel was not found or is not owned by this account." }, 403);
  let newSlug = existing.slug;
  if (data.slug !== undefined) {
    const desired = slugify(data.slug);
    const taken = await env.TPI_DB.prepare("SELECT id FROM tpi_videos WHERE slug = ? AND id != ?").bind(desired, existing.id).first();
    if (taken) return json({ error: "That video slug is already in use." }, 409);
    newSlug = desired;
  }
  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`UPDATE tpi_videos SET slug=?, title=?, description=?, category=?, tags=?, platform=?, video_url=?, embed_url=?, thumbnail=?, featured=?, is_live=?, live_started_at=?, series=?, episode=?, duration=?, format=?, viewing_access=?, channel_id=?, updated_at=? WHERE id=?`)
    .bind(newSlug, fields.title, fields.description, fields.category, fields.tags, fields.platform, fields.videoUrl, fields.embedUrl, fields.thumbnail, fields.featured, fields.isLive, fields.liveStartedAt, fields.series, fields.episode, fields.duration, fields.format, fields.viewingAccess, channel.id, now, existing.id).run();
  return json({ ok: true, id: existing.id, slug: newSlug, status: existing.status, channelSlug: channel.slug });
}

async function handleTpiVideoLifecycle(path, env, user) {
  const match = path.match(/^\/tpi-videos\/([^/]+)\/(publish|unpublish|remove)$/);
  const slug = clean(decodeURIComponent(match?.[1] || ""));
  const action = match?.[2];
  const existing = await env.TPI_DB.prepare("SELECT * FROM tpi_videos WHERE slug = ?").bind(slug).first();
  if (!existing) return json({ error: "Video not found." }, 404);
  if (!tpiVideoOwnerOrAdmin(existing, user)) return json({ error: "You can only manage your own video listings." }, 403);
  if (action === "remove") {
    await env.TPI_DB.prepare("UPDATE tpi_videos SET status='removed', is_live=0, updated_at=? WHERE id=?").bind(new Date().toISOString(), existing.id).run();
    return json({ ok: true, id: existing.id, status: "removed" });
  }
  if (action === "unpublish") {
    await env.TPI_DB.prepare("UPDATE tpi_videos SET status='draft', is_live=0, updated_at=? WHERE id=?").bind(new Date().toISOString(), existing.id).run();
    return json({ ok: true, id: existing.id, status: "draft" });
  }
  const fields = validateTpiVideoFields(existing, existing);
  if (fields.error) return json({ error: `Cannot publish: ${fields.error}` }, 400);
  const now = new Date().toISOString();
  await env.TPI_DB.prepare("UPDATE tpi_videos SET status='published', published_at=COALESCE(NULLIF(published_at,''),?), updated_at=? WHERE id=?").bind(now, now, existing.id).run();
  if (existing.status !== "published") await notifyVideoFollowers(env, existing.channel_id, { title: fields.title, description: fields.description || fields.category, slug: existing.slug, creatorId: existing.created_by });
  return json({ ok: true, id: existing.id, status: "published" });
}

async function notifyMember(env, recipientId, notification) {
  const recipient = await env.TPI_DB.prepare("SELECT id, notification_prefs AS notificationPrefs FROM contributors WHERE id = ? AND active = 1").bind(recipientId).first();
  if (!recipient || !categoryEnabledForType(recipient.notificationPrefs, notification.type)) return false;
  await env.TPI_DB.prepare(`
    INSERT INTO member_notifications (id, contributor_id, title, body, action_href, type, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(crypto.randomUUID(), recipient.id, clean(notification.title).slice(0, 160), clean(notification.body).slice(0, 500), clean(notification.actionHref).slice(0, 500), clean(notification.type).slice(0, 60), notification.createdBy || null).run();
  return true;
}

async function notifyVideoFollowers(env, channelId, video) {
  if (!channelId) return 0;
  const { results } = await env.TPI_DB.prepare("SELECT follower_id AS followerId FROM tpi_video_follows WHERE channel_id = ? AND follower_id != ?").bind(channelId, video.creatorId || "").all();
  let sent = 0;
  for (const row of results || []) {
    if (await notifyMember(env, row.followerId, {
      title: `New video from ${video.title}`,
      body: video.description || "A creator you follow published a new video.",
      actionHref: `tpi-video.html?id=${encodeURIComponent(video.slug)}`,
      type: "video",
      createdBy: video.creatorId
    })) sent += 1;
  }
  return sent;
}

async function handleDeleteTpiVideo(path, env, user) {
  const slug = clean(decodeURIComponent(path.replace(/^\/tpi-videos\//, "")));
  const existing = await env.TPI_DB.prepare("SELECT id, created_by FROM tpi_videos WHERE slug = ?").bind(slug).first();
  if (!existing) return json({ error: "Video not found." }, 404);
  if (!tpiVideoOwnerOrAdmin(existing, user)) return json({ error: "You can only remove your own video listings." }, 403);
  await env.TPI_DB.prepare("UPDATE tpi_videos SET status='removed', is_live=0, updated_at=? WHERE id=?").bind(new Date().toISOString(), existing.id).run();
  return json({ ok: true, removed: true, id: existing.id, status: "removed" });
}

async function handleGetMyTpiChannel(env, user) {
  const channel = await ensureTpiChannel(env, user);
  return json({ channel: { id: channel.id, slug: channel.slug, displayName: channel.display_name, description: channel.description, artworkUrl: channel.artwork_url, visibility: channel.visibility, owner: { username: user.username, displayName: user.display_name, photoUrl: user.photo_url || "" } } }, 200, { "Cache-Control": "private, no-store" });
}

async function handleUpdateMyTpiChannel(request, env, user) {
  const data = await readJson(request);
  const existing = await ensureTpiChannel(env, user);
  const displayName = cleanVideoText(data.displayName !== undefined ? data.displayName : existing.display_name, 120);
  if (!displayName) return json({ error: "Channel name is required." }, 400);
  const description = cleanVideoText(data.description !== undefined ? data.description : existing.description, 1200);
  const artwork = validateThumbnailUrl(data.artworkUrl !== undefined ? data.artworkUrl : existing.artwork_url);
  if (!artwork.ok) return json({ error: artwork.error }, 400);
  const desiredSlug = slugify(data.slug !== undefined ? data.slug : existing.slug);
  const taken = await env.TPI_DB.prepare("SELECT id FROM tpi_video_channels WHERE slug=? AND id!=?").bind(desiredSlug, existing.id).first();
  if (taken) return json({ error: "That channel slug is already in use." }, 409);
  const visibility = data.visibility === "private" ? "private" : "public";
  const now = new Date().toISOString();
  await env.TPI_DB.prepare("UPDATE tpi_video_channels SET slug=?, display_name=?, description=?, artwork_url=?, visibility=?, updated_at=? WHERE id=? AND owner_id=?")
    .bind(desiredSlug, displayName, description, artwork.value, visibility, now, existing.id, user.id).run();
  return handleGetMyTpiChannel(env, user);
}

async function handleGetTpiChannel(path, env, request) {
  const slug = clean(decodeURIComponent(path.replace(/^\/tpi-channels\//, "")));
  const channel = await env.TPI_DB.prepare(`SELECT ch.*, c.username, c.display_name AS ownerDisplayName, c.title AS ownerTitle, c.photo_url AS ownerPhoto
    FROM tpi_video_channels ch JOIN contributors c ON c.id=ch.owner_id WHERE ch.slug=? AND ch.visibility='public' AND c.active=1`).bind(slug).first();
  if (!channel) return json({ error: "Channel not found." }, 404);
  const { results } = await env.TPI_DB.prepare(tpiVideoSelectSql() + " WHERE tv.channel_id=? AND tv.status='published' AND tv.viewing_access='public' ORDER BY tv.published_at DESC LIMIT 200").bind(channel.id).all();
  const user = request ? await getSessionUser(request, env) : null;
  const followCount = await env.TPI_DB.prepare("SELECT COUNT(*) AS count FROM tpi_video_follows WHERE channel_id = ?").bind(channel.id).first();
  const following = user ? await env.TPI_DB.prepare("SELECT id FROM tpi_video_follows WHERE channel_id = ? AND follower_id = ?").bind(channel.id, user.id).first() : null;
  return json({ channel: { id: channel.id, slug: channel.slug, displayName: channel.display_name, description: channel.description, artworkUrl: channel.artwork_url,
    followerCount: Number(followCount?.count || 0), following: Boolean(following),
    owner: { username: channel.username, displayName: channel.ownerDisplayName, title: channel.ownerTitle || "", photoUrl: channel.ownerPhoto || "" },
    videos: results.map(row => tpiVideoPayload({ ...row, sourceType: "creator" })) } }, 200, { "Cache-Control": "no-store" });
}

async function handleToggleTpiChannelFollow(path, env, user, shouldFollow) {
  const slug = clean(decodeURIComponent(path.match(/^\/tpi-channels\/([^/]+)\/follow$/)?.[1] || ""));
  const channel = await env.TPI_DB.prepare("SELECT id, owner_id AS ownerId, slug, display_name AS displayName, visibility FROM tpi_video_channels WHERE slug = ? AND visibility = 'public'").bind(slug).first();
  if (!channel) return json({ error: "Channel not found." }, 404);
  if (channel.ownerId === user.id) return json({ error: "You cannot follow your own channel." }, 400);
  if (shouldFollow) {
    const result = await env.TPI_DB.prepare("INSERT OR IGNORE INTO tpi_video_follows (id, channel_id, follower_id) VALUES (?, ?, ?)").bind(crypto.randomUUID(), channel.id, user.id).run();
    if (Number(result.meta?.changes || 0) > 0) {
      await notifyMember(env, channel.ownerId, { title: `${user.display_name || user.username} followed your channel`, body: "A TPI member is now following your creator channel.", actionHref: `tpi-channel.html?slug=${encodeURIComponent(channel.slug)}`, type: "video", createdBy: user.id });
    }
  } else {
    await env.TPI_DB.prepare("DELETE FROM tpi_video_follows WHERE channel_id = ? AND follower_id = ?").bind(channel.id, user.id).run();
  }
  const count = await env.TPI_DB.prepare("SELECT COUNT(*) AS count FROM tpi_video_follows WHERE channel_id = ?").bind(channel.id).first();
  return json({ channelSlug: channel.slug, following: shouldFollow, followerCount: Number(count?.count || 0) }, 200, { "Cache-Control": "no-store" });
}

async function handleShareTpiVideo(path, request, env, user) {
  const slug = clean(decodeURIComponent(path.match(/^\/tpi-videos\/([^/]+)\/share$/)?.[1] || ""));
  let video = await env.TPI_DB.prepare(tpiVideoSelectSql() + " WHERE tv.slug = ? LIMIT 1").bind(slug).first();
  if (video) {
    if (video.viewing_access !== "public" || !canReadTpiVideo(video, user) || video.status !== "published") return json({ error: "Video not found." }, 404);
    video = { ...video, sourceType: "creator" };
  } else {
    const scrapedId = slug.match(/^scraped-(\d+)$/)?.[1];
    if (!scrapedId) return json({ error: "Video not found." }, 404);
    const scraped = await env.TPI_DB.prepare(`SELECT id, title, description, thumbnail_url AS thumbnail, source_url AS videoUrl,
      source_name AS platform, source_name AS sourceName, channel_name AS channelName,
      duration_seconds AS duration, category, published_at AS publishedAt, scraped_at AS createdAt
      FROM videos WHERE id = ? AND status = 'approved'`).bind(scrapedId).first();
    if (!scraped || !validateExternalShareUrl(scraped.videoUrl)) return json({ error: "Video not found." }, 404);
    video = scrapedVideoPayload({ ...scraped, slug });
  }
  const data = await readJson(request);
  const message = clean(data.message).slice(0, 1000);
  const category = await env.TPI_DB.prepare("SELECT id FROM community_categories WHERE id = 'general' AND active = 1").first();
  if (!category) return json({ error: "Community sharing is not available." }, 503);
  const postId = crypto.randomUUID();
  const watchUrl = video.sourceType === "discovered" && video.videoUrl
    ? video.videoUrl
    : new URL(`/tpi-video?id=${encodeURIComponent(video.slug)}`, request.url).toString();
  const body = [message, `Watch: ${watchUrl}`].filter(Boolean).join("\n\n");
  await env.TPI_DB.prepare(`INSERT INTO community_posts (id, category_id, author_id, title, body, status, updated_at) VALUES (?, 'general', ?, ?, ?, 'visible', CURRENT_TIMESTAMP)`)
    .bind(postId, user.id, `Video: ${video.title}`.slice(0, 160), body).run();
  await insertCommunityAttachments(env, postId, "post", [{ url: watchUrl, key: "", name: video.title, contentType: "text/uri-list", mediaType: "link", sortOrder: 0 }]);
  await createCommunityContentNotifications(env, user, { postId, postTitle: video.title, body, attachments: [{ mediaType: "link" }] });
  return json({ ok: true, postId, href: `member-home.html?member=1#post-${encodeURIComponent(postId)}` });
}

function validateExternalShareUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" && !url.username && !url.password && !url.hash;
  } catch {
    return false;
  }
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled-video";
}

function detectPlatform(url) {
  const u = String(url || "").toLowerCase();
  if (u.includes("rumble.com")) return "Rumble";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "YouTube";
  return "";
}

const VIDEO_REACTIONS = new Set(["like", "love", "care", "haha", "wow", "sad", "angry"]);

async function handleGetVideoReactions(request, env) {
  const url = new URL(request.url);
  const videoId = clean(url.searchParams.get("videoId"));
  if (!videoId) return json({ error: "videoId is required." }, 400);

  const user = await getSessionUser(request, env);
  const liveBroadcast = await getLiveBroadcast(env, videoId);
  if (liveBroadcast && liveBroadcast.status !== "cancelled") {
    return json({ videoId, ...(await getLiveReactionPayload(env, liveBroadcast.id, user)) }, 200, { "Cache-Control": "no-store" });
  }

  const { results } = await env.TPI_DB.prepare(`
    SELECT reaction, COUNT(*) AS count
    FROM video_reactions
    WHERE video_id = ?
    GROUP BY reaction
  `).bind(videoId).all();

  const reactionCounts = {};
  (results || []).forEach(row => {
    if (VIDEO_REACTIONS.has(row.reaction)) {
      reactionCounts[row.reaction] = Number(row.count || 0);
    }
  });

  let userReaction = null;
  if (user) {
    const row = await env.TPI_DB.prepare(`
      SELECT reaction FROM video_reactions WHERE video_id = ? AND contributor_id = ? LIMIT 1
    `).bind(videoId, user.id).first();
    userReaction = row?.reaction || null;
  }

  return json({ videoId, reactionCounts, userReaction, signedIn: Boolean(user) });
}

async function handleSetVideoReaction(request, env, user) {
  const data = await readJson(request);
  const videoId = clean(data.videoId);
  const reaction = clean(data.reaction).toLowerCase();
  if (!videoId) return json({ error: "videoId is required." }, 400);
  if (!VIDEO_REACTIONS.has(reaction)) return json({ error: "Reaction was not recognized." }, 400);

  const liveBroadcast = await getLiveBroadcast(env, videoId);
  if (liveBroadcast && liveBroadcast.status !== "cancelled") {
    return setLiveReactionForBroadcast(new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reaction })
    }), env, user, liveBroadcast);
  }

  const existing = await env.TPI_DB.prepare(`
    SELECT reaction FROM video_reactions WHERE video_id = ? AND contributor_id = ? LIMIT 1
  `).bind(videoId, user.id).first();

  await env.TPI_DB.prepare("DELETE FROM video_reactions WHERE video_id = ? AND contributor_id = ?")
    .bind(videoId, user.id).run();

  let userReaction = null;
  if (existing?.reaction !== reaction) {
    userReaction = reaction;
    const now = new Date().toISOString();
    await env.TPI_DB.prepare(`
      INSERT INTO video_reactions (id, video_id, contributor_id, reaction, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), videoId, user.id, reaction, now, now).run();
  }

  const { results } = await env.TPI_DB.prepare(`
    SELECT reaction, COUNT(*) AS count FROM video_reactions WHERE video_id = ? GROUP BY reaction
  `).bind(videoId).all();
  const reactionCounts = {};
  (results || []).forEach(row => {
    if (VIDEO_REACTIONS.has(row.reaction)) reactionCounts[row.reaction] = Number(row.count || 0);
  });

  return json({ videoId, reactionCounts, userReaction, signedIn: true });
}

async function handleGetVideoSaves(env, user) {
  const legacy = await env.TPI_DB.prepare(`
    SELECT vs.video_id AS videoId, vs.created_at AS savedAt,
           tv.title, tv.slug, tv.thumbnail, tv.category, tv.duration, tv.published_at AS publishedAt
    FROM video_saves vs
    JOIN tpi_videos tv ON tv.id = vs.video_id
    WHERE vs.contributor_id = ? AND tv.status = 'published'
    ORDER BY vs.created_at DESC
  `).bind(user.id).all();
  const modern = await env.TPI_DB.prepare(`
    SELECT video_key AS videoId, created_at AS savedAt, title, video_key AS slug, thumbnail,
           category, duration, published_at AS publishedAt, source_type AS sourceType,
           destination_url AS destinationUrl, platform, channel_slug AS channelSlug,
           channel_name AS channelName
    FROM tpi_video_saved_items WHERE contributor_id = ? ORDER BY created_at DESC
  `).bind(user.id).all();
  const saves = (legacy.results || []).map(row => ({ ...row, sourceType: "creator", destinationUrl: `tpi-video.html?id=${encodeURIComponent(row.slug || row.videoId)}` }))
    .concat(modern.results || []);
  saves.sort((a, b) => String(b.savedAt || "").localeCompare(String(a.savedAt || "")));
  return json({ saves });
}

async function handleToggleVideoSave(request, env, user) {
  const data = await readJson(request);
  const videoId = clean(data.videoId || data.videoKey);
  if (!videoId) return json({ error: "videoId is required." }, 400);

  const modernExisting = await env.TPI_DB.prepare("SELECT id FROM tpi_video_saved_items WHERE video_key = ? AND contributor_id = ? LIMIT 1").bind(videoId, user.id).first();
  if (modernExisting) {
    await env.TPI_DB.prepare("DELETE FROM tpi_video_saved_items WHERE id = ?").bind(modernExisting.id).run();
    return json({ videoId, saved: false });
  }

  const existing = await env.TPI_DB.prepare(`
    SELECT vs.id FROM video_saves vs LEFT JOIN tpi_videos tv ON tv.id = vs.video_id
    WHERE (vs.video_id = ? OR tv.slug = ?) AND vs.contributor_id = ? LIMIT 1
  `).bind(videoId, videoId, user.id).first();

  if (existing) {
    await env.TPI_DB.prepare("DELETE FROM video_saves WHERE id = ?").bind(existing.id).run();
    return json({ videoId, saved: false });
  } else {
    let sourceType = "creator";
    let destinationUrl = `tpi-video.html?id=${encodeURIComponent(videoId)}`;
    let video = await env.TPI_DB.prepare(tpiVideoSelectSql() + " WHERE (tv.slug = ? OR tv.id = ?) AND tv.status = 'published' LIMIT 1").bind(videoId, videoId).first();
    if (!video) {
      sourceType = "discovered";
      const externalUrl = clean(data.destinationUrl || data.videoUrl);
      if (!validateExternalShareUrl(externalUrl)) return json({ error: "An approved external video URL is required." }, 400);
      video = { title: cleanVideoText(data.title, 180) || "TPI Video", description: cleanVideoText(data.description, 320), thumbnail: clean(data.thumbnail), category: clean(data.category), duration: clean(data.duration), publishedAt: clean(data.publishedAt), platform: clean(data.platform), channelSlug: clean(data.channelSlug), channelName: clean(data.channelName) };
      destinationUrl = externalUrl;
    }
    await env.TPI_DB.prepare(`INSERT INTO tpi_video_saved_items
      (id, contributor_id, video_key, source_type, destination_url, title, description, thumbnail, category, duration, published_at, platform, channel_slug, channel_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), user.id, videoId, sourceType, destinationUrl, video.title || "TPI Video", video.description || "", video.thumbnail || "", video.category || "", video.duration || "", video.publishedAt || video.published_at || null, video.platform || video.sourceName || "", video.channelSlug || null, video.channelName || null).run();
    return json({ videoId, saved: true });
  }
}

async function handleGetVideoHistory(env, user) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT video_key AS videoId, source_type AS sourceType, destination_url AS destinationUrl,
           title, thumbnail, platform, last_position_seconds AS lastPositionSeconds,
           completed, watched_at AS watchedAt
    FROM tpi_video_watch_history WHERE contributor_id = ? ORDER BY watched_at DESC LIMIT 200
  `).bind(user.id).all();
  return json({ history: results || [] });
}

async function handleRecordVideoHistory(request, env, user) {
  const data = await readJson(request);
  const videoId = clean(data.videoId || data.videoKey);
  if (!videoId) return json({ error: "videoId is required." }, 400);
  const isCreator = Boolean(await env.TPI_DB.prepare("SELECT id FROM tpi_videos WHERE (id = ? OR slug = ?) AND status = 'published' LIMIT 1").bind(videoId, videoId).first());
  const sourceType = isCreator ? "creator" : "discovered";
  const destinationUrl = isCreator ? `tpi-video.html?id=${encodeURIComponent(videoId)}` : clean(data.destinationUrl || data.videoUrl);
  if (!isCreator && !validateExternalShareUrl(destinationUrl)) return json({ error: "A valid external destination is required." }, 400);
  const position = Math.max(0, Math.min(86400, Number(data.lastPositionSeconds || 0)));
  const completed = data.completed ? 1 : 0;
  await env.TPI_DB.prepare(`INSERT INTO tpi_video_watch_history
    (id, contributor_id, video_key, source_type, destination_url, title, thumbnail, platform, last_position_seconds, completed, watched_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(contributor_id, video_key) DO UPDATE SET destination_url=excluded.destination_url, title=excluded.title,
      thumbnail=excluded.thumbnail, platform=excluded.platform, last_position_seconds=excluded.last_position_seconds,
      completed=excluded.completed, watched_at=CURRENT_TIMESTAMP`)
    .bind(crypto.randomUUID(), user.id, videoId, sourceType, destinationUrl, cleanVideoText(data.title, 180) || "TPI Video", clean(data.thumbnail), clean(data.platform), position, completed).run();
  return json({ ok: true, videoId });
}

async function handleClearVideoHistory(request, env, user) {
  const url = new URL(request.url);
  const videoId = clean(url.searchParams.get("videoId"));
  if (videoId) {
    await env.TPI_DB.prepare("DELETE FROM tpi_video_watch_history WHERE contributor_id = ? AND video_key = ?").bind(user.id, videoId).run();
  } else {
    await env.TPI_DB.prepare("DELETE FROM tpi_video_watch_history WHERE contributor_id = ?").bind(user.id).run();
  }
  return json({ ok: true });
}

async function handleCreateVideoReport(request, env, user) {
  const data = await readJson(request);
  const videoId = clean(data.videoId);
  const reason = clean(data.reason);
  if (!videoId) return json({ error: "videoId is required." }, 400);
  if (!reason) return json({ error: "Reason is required." }, 400);

  const allowedReasons = ["inappropriate", "wrong-video", "broken", "copyright", "explicit", "spam", "other"];
  if (!allowedReasons.includes(reason)) return json({ error: "Invalid reason." }, 400);

  await env.TPI_DB.prepare(`
    INSERT INTO video_reports (id, video_id, contributor_id, reason, details, status)
    VALUES (?, ?, ?, ?, ?, 'open')
  `).bind(crypto.randomUUID(), videoId, user.id, reason, clean(data.details)).run();

  return json({ ok: true, message: "Report received. A TPI administrator will review it." });
}

// ---- StudioFlow room relay (guest invite links; roomId is the credential) ----

const ROOM_GUEST_TTL_MS = 20000;
const ROOM_SIGNAL_TTL_MS = 120000;

function roomRelayId(path, pattern) {
  return clean(decodeURIComponent(path.match(pattern)?.[1] || ""));
}

function roomRelayGuestRow(row) {
  return {
    id: row.guest_id,
    displayName: row.display_name ?? "",
    headline: row.headline ?? "",
    cameraEnabled: Boolean(row.camera_enabled),
    micEnabled: Boolean(row.mic_enabled),
    screenSharing: Boolean(row.screen_sharing),
    joinedAt: Number(row.joined_at),
    lastSeen: Number(row.last_seen),
    waiting: Boolean(row.waiting)
  };
}

async function handleRoomListGuests(path, env) {
  const roomId = roomRelayId(path, /^\/rooms\/([^/]+)\/guests$/);
  if (!roomId) return json({ error: "Room id is required." }, 400);
  const cutoff = Date.now() - ROOM_GUEST_TTL_MS;
  await env.TPI_DB.prepare("DELETE FROM studio_room_guests WHERE room_id = ? AND last_seen < ?").bind(roomId, cutoff).run();
  const result = await env.TPI_DB.prepare(
    "SELECT * FROM studio_room_guests WHERE room_id = ? AND last_seen >= ? ORDER BY joined_at DESC"
  ).bind(roomId, cutoff).all();
  return json({ guests: (result.results ?? []).map(roomRelayGuestRow) });
}

async function handleRoomUpsertGuest(path, request, env) {
  const roomId = roomRelayId(path, /^\/rooms\/([^/]+)\/guests$/);
  if (!roomId) return json({ error: "Room id is required." }, 400);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }
  const guestId = clean(String(body?.id ?? ""));
  if (!guestId) return json({ error: "Guest id is required." }, 400);
  const now = Date.now();
  await env.TPI_DB.prepare(
    `INSERT INTO studio_room_guests
       (room_id, guest_id, display_name, headline, camera_enabled, mic_enabled, screen_sharing, joined_at, last_seen, waiting)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (room_id, guest_id) DO UPDATE SET
       display_name = excluded.display_name,
       headline = excluded.headline,
       camera_enabled = excluded.camera_enabled,
       mic_enabled = excluded.mic_enabled,
       screen_sharing = excluded.screen_sharing,
       last_seen = excluded.last_seen,
       waiting = excluded.waiting`
  ).bind(
    roomId,
    guestId,
    clean(String(body?.displayName ?? "")),
    clean(String(body?.headline ?? "")),
    body?.cameraEnabled ? 1 : 0,
    body?.micEnabled ? 1 : 0,
    body?.screenSharing ? 1 : 0,
    Number(body?.joinedAt) || now,
    Number(body?.lastSeen) || now,
    body?.waiting === false ? 0 : 1
  ).run();
  return json({ ok: true });
}

async function handleRoomRemoveGuest(path, env) {
  const match = path.match(/^\/rooms\/([^/]+)\/guests\/([^/]+)$/);
  const roomId = match ? clean(decodeURIComponent(match[1])) : "";
  const guestId = match ? clean(decodeURIComponent(match[2])) : "";
  if (!roomId || !guestId) return json({ error: "Room id and guest id are required." }, 400);
  await env.TPI_DB.prepare("DELETE FROM studio_room_guests WHERE room_id = ? AND guest_id = ?").bind(roomId, guestId).run();
  return json({ ok: true });
}

async function handleRoomStatus(path, env) {
  const roomId = roomRelayId(path, /^\/rooms\/([^/]+)\/status$/);
  if (!roomId) return json({ error: "Room id is required." }, 400);
  const guestRows = await env.TPI_DB.prepare(
    "SELECT * FROM studio_room_guests WHERE room_id = ? AND last_seen >= ? ORDER BY joined_at DESC"
  ).bind(roomId, Date.now() - ROOM_GUEST_TTL_MS).all();
  const guests = (guestRows.results ?? []).map(roomRelayGuestRow);
  const signalRows = await env.TPI_DB.prepare(
    "SELECT payload FROM studio_room_signals WHERE room_id = ? AND created_at >= ? ORDER BY id DESC LIMIT 10"
  ).bind(roomId, Date.now() - ROOM_SIGNAL_TTL_MS).all();
  const countRow = await env.TPI_DB.prepare("SELECT COUNT(*) AS count FROM studio_room_signals WHERE room_id = ?").bind(roomId).first();
  const recentSignals = (signalRows.results ?? []).map((row) => {
    try {
      const parsed = JSON.parse(row.payload);
      return { guestId: parsed?.guestId ?? "", type: parsed?.type ?? "" };
    } catch {
      return { guestId: "", type: "" };
    }
  });
  return json({
    roomId,
    clientCount: guests.length,
    guestCount: guests.length,
    guests,
    recentSignals,
    signalCount: Number(countRow?.count ?? 0)
  });
}

// ---- StudioFlow per-show invite codes (guest links expire when the show ends) ----
// Todd schedules several shows a month; every broadcast must get its own guest
// code so links from an earlier show stop working. The code is created (and
// re-created if the previous show ended) the first time the host's invite
// modal opens, stays valid for the whole show, and is closed when the host
// exits. Codes persist in D1 across host refreshes and scheduled shows.

const ROOM_CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no i/l/o/0/1 look-alikes

function generateRoomCode(length = 8) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let index = 0; index < length; index += 1) code += ROOM_CODE_ALPHABET[bytes[index] % ROOM_CODE_ALPHABET.length];
  return code;
}

async function ensureActiveRoomCode(env) {
  // Reuse the still-open code for an in-progress show; create a fresh one
  // when the previous show was closed (its links stay expired).
  const existing = await env.TPI_DB.prepare(
    "SELECT * FROM studio_room_codes WHERE status = 'active' ORDER BY created_at DESC LIMIT 1"
  ).first();
  if (existing) return existing;
  const code = generateRoomCode();
  const now = Date.now();
  await env.TPI_DB.prepare(
    "INSERT INTO studio_room_codes (code, room_id, status, created_at) VALUES (?, ?, 'active', ?)"
  ).bind(code, `show-${code}`, now).run();
  return { code, room_id: `show-${code}`, status: "active", created_at: now, activated_at: null, ended_at: null };
}

async function handleRoomCodeCurrent(env) {
  const row = await ensureActiveRoomCode(env);
  return json({ code: row.code, roomId: row.room_id, status: row.status, createdAt: Number(row.created_at) });
}

async function handleRoomCodeValidate(path, env) {
  const code = roomRelayId(path, /^\/room-codes\/([^/]+)$/);
  if (!code) return json({ error: "Code is required." }, 400);
  const row = await env.TPI_DB.prepare("SELECT * FROM studio_room_codes WHERE code = ? LIMIT 1").bind(code).first();
  if (!row || row.status !== "active") {
    return json({ valid: false, reason: row ? "show-ended" : "not-found" });
  }
  return json({ valid: true, code: row.code, roomId: row.room_id });
}

async function handleRoomCodeClose(env) {
  const now = Date.now();
  const result = await env.TPI_DB.prepare(
    "UPDATE studio_room_codes SET status = 'ended', ended_at = ? WHERE status = 'active'"
  ).bind(now).run();
  const closed = Number(result.meta?.changes ?? 0);
  if (closed) {
    // Show is over: tell anyone still polling the room, then sweep presence
    // and signals so the room relay stays clean.
    const rows = await env.TPI_DB.prepare(
      "SELECT room_id FROM studio_room_codes WHERE ended_at = ?"
    ).bind(now).all();
    for (const row of rows.results ?? []) {
      await env.TPI_DB.prepare("INSERT INTO studio_room_signals (room_id, type, payload, created_at) VALUES (?, 'show-ended', ?, ?)")
        .bind(row.room_id, JSON.stringify({ type: "show-ended", roomId: row.room_id }), now).run();
      await env.TPI_DB.prepare("DELETE FROM studio_room_guests WHERE room_id = ?").bind(row.room_id).run();
      await env.TPI_DB.prepare("DELETE FROM studio_room_signals WHERE room_id = ? AND created_at < ?")
        .bind(row.room_id, now).run();
    }
  }
  return json({ ok: true, closed });
}

async function handleRoomPostSignal(path, request, env) {
  const roomId = roomRelayId(path, /^\/rooms\/([^/]+)\/signals$/);
  if (!roomId) return json({ error: "Room id is required." }, 400);
  let message;
  try {
    message = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }
  if (!message || typeof message.type !== "string" || !message.type) {
    return json({ error: "Signal type is required." }, 400);
  }
  const payload = JSON.stringify(message);
  if (payload.length > 65536) return json({ error: "Signal payload is too large." }, 413);
  await env.TPI_DB.prepare("INSERT INTO studio_room_signals (room_id, type, payload, created_at) VALUES (?, ?, ?, ?)")
    .bind(roomId, clean(message.type), payload, Date.now()).run();
  if (Math.random() < 0.08) {
    await env.TPI_DB.prepare("DELETE FROM studio_room_signals WHERE room_id = ? AND created_at < ?")
      .bind(roomId, Date.now() - ROOM_SIGNAL_TTL_MS).run();
  }
  return json({ ok: true });
}

async function handleRoomGetSignals(path, request, env) {
  const roomId = roomRelayId(path, /^\/rooms\/([^/]+)\/signals$/);
  if (!roomId) return json({ error: "Room id is required." }, 400);
  const url = new URL(request.url);
  const since = Math.max(0, Number(url.searchParams.get("since") ?? 0) || 0);
  const result = await env.TPI_DB.prepare(
    "SELECT id, payload FROM studio_room_signals WHERE room_id = ? AND id > ? AND created_at >= ? ORDER BY id ASC LIMIT 100"
  ).bind(roomId, since, Date.now() - ROOM_SIGNAL_TTL_MS).all();
  const rows = result.results ?? [];
  const signals = rows.map((row) => {
    try {
      return JSON.parse(row.payload);
    } catch {
      return null;
    }
  }).filter(Boolean);
  const cursor = rows.length ? Number(rows[rows.length - 1].id) : since;
  return json({ signals, cursor });
}

// ---- StudioFlow Cloudflare RealtimeKit rooms ----

function studioRoomIdFromPath(path) {
  return clean(decodeURIComponent(path.match(/^\/studio\/rooms\/([^/]+)\//)?.[1] || ""));
}

function assertRealtimeKitConfigured(env) {
  const missing = [
    ["CLOUDFLARE_ACCOUNT_ID", env.CLOUDFLARE_ACCOUNT_ID],
    ["REALTIMEKIT_APP_ID", env.REALTIMEKIT_APP_ID],
    ["REALTIMEKIT_API_TOKEN", env.REALTIMEKIT_API_TOKEN],
    ["REALTIMEKIT_HOST_PRESET", env.REALTIMEKIT_HOST_PRESET],
    ["REALTIMEKIT_GUEST_PRESET", env.REALTIMEKIT_GUEST_PRESET]
  ].filter(([, value]) => !clean(value)).map(([name]) => name);
  if (missing.length) throw new Error(`StudioFlow RealtimeKit is not configured. Missing: ${missing.join(", ")}.`);
}

async function realtimeKitRequest(env, apiPath, options = {}) {
  assertRealtimeKitConfigured(env);
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(env.CLOUDFLARE_ACCOUNT_ID)}/realtime/kit/${encodeURIComponent(env.REALTIMEKIT_APP_ID)}${apiPath}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${env.REALTIMEKIT_API_TOKEN}`,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    }
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const detail = payload.errors?.[0]?.message || payload.error || payload.message || `RealtimeKit request failed (${response.status}).`;
    throw new Error(detail);
  }
  return payload.data || payload;
}

async function createRealtimeKitParticipant(env, meetingId, { customParticipantId, name, picture, presetName }) {
  return realtimeKitRequest(env, `/meetings/${encodeURIComponent(meetingId)}/participants`, {
    method: "POST",
    body: JSON.stringify({
      custom_participant_id: customParticipantId,
      name,
      picture: picture || undefined,
      preset_name: presetName
    })
  });
}

async function refreshRealtimeKitParticipantToken(env, meetingId, participantId) {
  return realtimeKitRequest(env, `/meetings/${encodeURIComponent(meetingId)}/participants/${encodeURIComponent(participantId)}/token`, {
    method: "POST",
    body: "{}"
  });
}

async function handleCreateStudioRoom(request, env, user) {
  assertRealtimeKitConfigured(env);
  const data = await readJson(request);
  const broadcastKey = clean(data.broadcastId).slice(0, 180);
  const title = clean(data.title || "StudioFlow session").slice(0, 180);
  if (!broadcastKey) return json({ error: "A broadcast ID is required." }, 400);

  let room = await env.TPI_DB.prepare(`
    SELECT * FROM studio_rooms
    WHERE host_id = ? AND broadcast_key = ? AND status = 'open'
    LIMIT 1
  `).bind(user.id, broadcastKey).first();

  if (room) {
    let participant;
    if (room.host_participant_id) {
      participant = await refreshRealtimeKitParticipantToken(env, room.realtimekit_meeting_id, room.host_participant_id);
    } else {
      participant = await createRealtimeKitParticipant(env, room.realtimekit_meeting_id, {
        customParticipantId: `${user.id}:host:${room.id}`,
        name: user.display_name || user.username || "StudioFlow Host",
        picture: user.photo_url,
        presetName: env.REALTIMEKIT_HOST_PRESET
      });
      await env.TPI_DB.prepare("UPDATE studio_rooms SET host_participant_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(participant.id, room.id).run();
    }
    return json({
      authToken: participant.token || participant.authToken,
      inviteToken: room.invite_token,
      meetingId: room.realtimekit_meeting_id,
      roomId: room.id
    }, 200, { "Cache-Control": "no-store" });
  }

  const meeting = await realtimeKitRequest(env, "/meetings", {
    method: "POST",
    body: JSON.stringify({ title, persist_chat: true })
  });
  const roomId = crypto.randomUUID();
  const inviteToken = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
  const participant = await createRealtimeKitParticipant(env, meeting.id, {
    customParticipantId: `${user.id}:host:${roomId}`,
    name: user.display_name || user.username || "StudioFlow Host",
    picture: user.photo_url,
    presetName: env.REALTIMEKIT_HOST_PRESET
  });

  await env.TPI_DB.prepare(`
    INSERT INTO studio_rooms
      (id, broadcast_key, title, host_id, realtimekit_meeting_id, host_participant_id, invite_token)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(roomId, broadcastKey, title, user.id, meeting.id, participant.id, inviteToken).run();

  return json({
    authToken: participant.token || participant.authToken,
    inviteToken,
    meetingId: meeting.id,
    roomId
  }, 201, { "Cache-Control": "no-store" });
}

async function handleListStudioRooms(request, env, user) {
  const url = new URL(request.url);
  const status = clean(url.searchParams.get("status")).toLowerCase();
  const params = [user.id];
  let query = `
    SELECT id, broadcast_key AS broadcastKey, title, status, closed_at AS closedAt,
           created_at AS createdAt, updated_at AS updatedAt
    FROM studio_rooms
    WHERE host_id = ?
  `;
  if (["open", "closed"].includes(status)) {
    query += " AND status = ?";
    params.push(status);
  }
  query += " ORDER BY updated_at DESC LIMIT 50";
  const { results } = await env.TPI_DB.prepare(query).bind(...params).all();
  return json({ rooms: results || [] }, 200, { "Cache-Control": "private, no-store" });
}

async function handleStudioGuestToken(path, request, env, user) {
  assertRealtimeKitConfigured(env);
  const roomId = studioRoomIdFromPath(path);
  const data = await readJson(request);
  const inviteToken = clean(data.inviteToken);
  const name = clean(data.name || "Guest").slice(0, 100);
  if (!roomId || !inviteToken) return json({ error: "This StudioFlow invitation is incomplete." }, 400);
  const room = await env.TPI_DB.prepare(`
    SELECT * FROM studio_rooms
    WHERE id = ? AND invite_token = ? AND status = 'open'
    LIMIT 1
  `).bind(roomId, inviteToken).first();
  if (!room) return json({ error: "This StudioFlow invitation is invalid or the room has closed." }, 403);
  if (room.host_id !== user.id && !["owner", "admin"].includes(user.role)) {
    return json({ error: "Only the StudioFlow room host can issue guest access." }, 403);
  }

  const participant = await createRealtimeKitParticipant(env, room.realtimekit_meeting_id, {
    customParticipantId: `guest:${crypto.randomUUID()}`,
    name,
    presetName: env.REALTIMEKIT_GUEST_PRESET
  });
  return json({
    authToken: participant.token || participant.authToken,
    meetingId: room.realtimekit_meeting_id,
    roomId: room.id
  }, 200, { "Cache-Control": "no-store" });
}

async function getOwnedStudioRoom(env, roomId, user) {
  const room = await env.TPI_DB.prepare("SELECT * FROM studio_rooms WHERE id = ? LIMIT 1").bind(roomId).first();
  if (!room) return null;
  if (room.host_id !== user.id && !["owner", "admin"].includes(user.role)) return false;
  return room;
}

async function handleCloseStudioRoom(path, env, user) {
  const roomId = studioRoomIdFromPath(path);
  const room = await getOwnedStudioRoom(env, roomId, user);
  if (room === false) return json({ error: "Only the room host can close this studio." }, 403);
  if (!room) return json({ error: "Studio room not found." }, 404);
  await env.TPI_DB.prepare(`
    UPDATE studio_rooms
    SET status = 'closed', closed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(roomId).run();
  return json({ ok: true });
}

async function handleStartStudioLivestream(path, request, env, user) {
  assertRealtimeKitConfigured(env);
  const roomId = studioRoomIdFromPath(path);
  const room = await getOwnedStudioRoom(env, roomId, user);
  if (room === false) return json({ error: "Only the room host can start this livestream." }, 403);
  if (!room || room.status !== "open") return json({ error: "Open StudioFlow room not found." }, 404);
  const data = await readJson(request);
  const rtmpUrl = clean(data.rtmpUrl);
  if (rtmpUrl && !/^rtmps?:\/\//i.test(rtmpUrl)) return json({ error: "The RTMP destination must start with rtmp:// or rtmps://." }, 400);
  const livestream = rtmpUrl
    ? await realtimeKitRequest(env, "/recordings", {
        method: "POST",
        body: JSON.stringify({
          meeting_id: room.realtimekit_meeting_id,
          file_name_prefix: clean(data.name || room.title).replace(/[^a-z0-9_-]+/gi, "-").slice(0, 100),
          max_seconds: 86400,
          video_config: { codec: "H264" },
          audio_config: { codec: "AAC", channel: "stereo" },
          rtmp_out_config: { rtmp_url: rtmpUrl }
        })
      })
    : await realtimeKitRequest(env, `/meetings/${encodeURIComponent(room.realtimekit_meeting_id)}/livestreams`, {
        method: "POST",
        body: JSON.stringify({
          name: clean(data.name || room.title).slice(0, 180),
          video_config: { width: 1280, height: 720 }
        })
      });
  await env.TPI_DB.prepare(`
    UPDATE studio_rooms
    SET livestream_id = ?, livestream_kind = ?, livestream_playback_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(livestream.id || livestream.recording?.id || null, rtmpUrl ? "rtmp" : "cloudflare", livestream.playback_url || null, room.id).run();
  return json({ livestream, mode: rtmpUrl ? "rtmp" : "cloudflare" }, 201, { "Cache-Control": "no-store" });
}

async function handleStopStudioLivestream(path, env, user) {
  assertRealtimeKitConfigured(env);
  const roomId = studioRoomIdFromPath(path);
  const room = await getOwnedStudioRoom(env, roomId, user);
  if (room === false) return json({ error: "Only the room host can stop this livestream." }, 403);
  if (!room) return json({ error: "Studio room not found." }, 404);
  const result = room.livestream_kind === "rtmp" && room.livestream_id
    ? await realtimeKitRequest(env, `/recordings/${encodeURIComponent(room.livestream_id)}`, {
        method: "PUT",
        body: JSON.stringify({ action: "stop" })
      })
    : await realtimeKitRequest(env, `/meetings/${encodeURIComponent(room.realtimekit_meeting_id)}/active-livestream/stop`, {
        method: "POST",
        body: "{}"
      });
  await env.TPI_DB.prepare(`
    UPDATE studio_rooms
    SET livestream_id = NULL, livestream_kind = NULL, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(room.id).run();
  return json({ ok: true, result });
}

// ---- Messenger member directory ----

function directoryMember(user) {
  const now = new Date();
  const lastSeen = user.last_seen_at ? new Date(user.last_seen_at) : null;
  const isOnline = Boolean(lastSeen && (now - lastSeen) <= 90 * 1000 && user.status === 'online');
  return {
    username: user.username,
    displayName: user.display_name,
    title: user.title || "",
    role: user.role,
    photoUrl: user.photo_url || "",
    chatColor: normalizeChatColor(user.chat_color || "#a855f7"),
    canMessage: user.can_message !== 0,
    active: user.active !== 0,
    online: isOnline,
    lastSeenAt: user.last_seen_at || null,
    status: isOnline ? 'online' : 'offline'
  };
}

async function handleMemberDirectory(request, env, user) {
  const url = new URL(request.url);
  const search = clean(url.searchParams.get("search")).slice(0, 80).toLowerCase();
  const like = `%${search}%`;
  const stmt = search
    ? env.TPI_DB.prepare(`
        SELECT c.id, c.username, c.display_name, c.title, c.role, c.photo_url, c.chat_color, c.can_message, c.active,
               mp.last_seen_at, mp.status
        FROM contributors c
        LEFT JOIN member_presence mp ON mp.contributor_id = c.id
        WHERE c.active = 1
          AND (lower(c.username) LIKE ? OR lower(c.display_name) LIKE ?)
        ORDER BY c.display_name COLLATE NOCASE, c.username COLLATE NOCASE
        LIMIT 200
      `).bind(like, like)
    : env.TPI_DB.prepare(`
        SELECT c.id, c.username, c.display_name, c.title, c.role, c.photo_url, c.chat_color, c.can_message, c.active,
               mp.last_seen_at, mp.status
        FROM contributors c
        LEFT JOIN member_presence mp ON mp.contributor_id = c.id
        WHERE c.active = 1
        ORDER BY c.display_name COLLATE NOCASE, c.username COLLATE NOCASE
        LIMIT 200
      `);
  const { results } = await stmt.all();
  const members = (results || [])
    .map(directoryMember)
    .filter(member => member.username !== user.username);
  return json({ members }, 200, { "Cache-Control": "no-store" });
}

// ---- Messenger conversations and messages ----

async function requireConversationAccess(env, conversationId, user) {
  if (!conversationId) return null;
  const participant = await env.TPI_DB.prepare(`
    SELECT cp.*, c.direct, c.title, c.created_by, c.created_at, c.updated_at
    FROM conversation_participants cp
    JOIN conversations c ON c.id = cp.conversation_id
    WHERE cp.conversation_id = ? AND cp.contributor_id = ?
  `).bind(conversationId, user.id).first();
  return participant || null;
}

async function getConversationMembers(env, conversationId) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT c.id, c.username, c.display_name AS displayName, c.title, c.role, c.photo_url AS photoUrl, c.chat_color AS chatColor, cp.can_message AS canMessage,
           mp.last_seen_at AS lastSeenAt, mp.status AS presenceStatus
    FROM conversation_participants cp
    JOIN contributors c ON c.id = cp.contributor_id
    LEFT JOIN member_presence mp ON mp.contributor_id = c.id
    WHERE cp.conversation_id = ?
    ORDER BY c.display_name COLLATE NOCASE
  `).bind(conversationId).all();
  return (results || []).map(row => {
    const now = new Date();
    const lastSeen = row.lastSeenAt ? new Date(row.lastSeenAt) : null;
    const isOnline = Boolean(lastSeen && (now - lastSeen) <= 90 * 1000 && row.presenceStatus === 'online');
    return {
      id: row.id,
      username: row.username,
      displayName: row.displayName,
      title: row.title || "",
      role: row.role,
      photoUrl: row.photoUrl || "",
      chatColor: normalizeChatColor(row.chatColor || "#a855f7"),
      canMessage: row.canMessage !== 0,
      online: isOnline,
      lastSeenAt: row.lastSeenAt || null,
      status: isOnline ? 'online' : 'offline'
    };
  });
}

async function getDirectConversation(env, userA, userB) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT c.id
    FROM conversations c
    JOIN conversation_participants p ON p.conversation_id = c.id
    WHERE c.direct = 1
    GROUP BY c.id
    HAVING SUM(CASE WHEN p.contributor_id = ? THEN 1 ELSE 0 END) = 1
       AND SUM(CASE WHEN p.contributor_id = ? THEN 1 ELSE 0 END) = 1
       AND COUNT(DISTINCT p.contributor_id) = 2
  `).bind(userA.id, userB.id).all();
  return results && results[0] ? results[0].id : null;
}

async function handleListConversations(request, env, user) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT c.id, c.title, c.direct, c.created_by AS createdById, c.created_at AS createdAt, c.updated_at AS updatedAt,
           cp.theme, cp.quick_emoji AS quickEmoji, cp.muted_until AS mutedUntil,
           cp.read_receipts_enabled AS readReceiptsEnabled,
           CASE WHEN c.direct = 1 AND EXISTS (
             SELECT 1 FROM member_blocks mb
             JOIN conversation_participants other_cp ON other_cp.conversation_id = c.id AND other_cp.contributor_id = mb.blocked_id
             WHERE mb.blocker_id = ? AND mb.blocked_id != ?
           ) THEN 1 ELSE 0 END AS blocked,
           CASE WHEN c.direct = 1 AND EXISTS (
             SELECT 1 FROM member_restrictions mr
             JOIN conversation_participants other_cp ON other_cp.conversation_id = c.id AND other_cp.contributor_id = mr.restricted_id
             WHERE mr.restrictor_id = ? AND mr.restricted_id != ?
           ) THEN 1 ELSE 0 END AS restricted,
           (SELECT body FROM messages WHERE conversation_id = c.id AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1) AS lastMessageBody,
           (SELECT created_at FROM messages WHERE conversation_id = c.id AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1) AS lastMessageAt,
           (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.deleted_at IS NULL AND m.contributor_id != ? AND m.created_at > COALESCE((SELECT last_read_at FROM message_read_state WHERE conversation_id = c.id AND contributor_id = ?), '1970-01-01')) AS unreadCount
    FROM conversations c
    JOIN conversation_participants cp ON cp.conversation_id = c.id
    WHERE cp.contributor_id = ?
      AND cp.hidden_at IS NULL
    ORDER BY c.updated_at DESC
    LIMIT 100
  `).bind(user.id, user.id, user.id, user.id, user.id, user.id, user.id).all();

  const conversations = [];
  for (const row of results || []) {
    const members = await getConversationMembers(env, row.id);
    const nicknames = await getConversationNicknames(env, row.id, user.id);
    conversations.push({
      id: row.id,
      title: row.title,
      direct: Boolean(row.direct),
      createdById: row.createdById,
      canManageMembers: !Boolean(row.direct) && (row.createdById === user.id || ["owner", "admin"].includes(user.role)),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      members,
      nicknames,
      lastMessage: row.lastMessageBody ? { body: row.lastMessageBody, createdAt: row.lastMessageAt } : null,
      unreadCount: Number(row.unreadCount || 0)
      ,theme: row.theme || "default"
      ,quickEmoji: row.quickEmoji || "👍"
      ,mutedUntil: row.mutedUntil || null
      ,readReceiptsEnabled: row.readReceiptsEnabled !== 0
      ,blocked: Boolean(row.blocked)
      ,restricted: Boolean(row.restricted)
    });
  }
  return json({ conversations }, 200, { "Cache-Control": "no-store" });
}

async function handleGetConversation(path, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);
  const members = await getConversationMembers(env, conversationId);
  const preferences = await getConversationParticipantState(env, conversationId, user.id, Boolean(access.direct));
  const nicknames = await getConversationNicknames(env, conversationId, user.id);
  return json({
    conversation: {
      id: access.conversation_id,
      title: access.title,
      direct: Boolean(access.direct),
      createdById: access.created_by,
      canManageMembers: !Boolean(access.direct) && (access.created_by === user.id || ["owner", "admin"].includes(user.role)),
      createdAt: access.created_at,
      updatedAt: access.updated_at,
      members,
      nicknames,
      ...preferences
    }
  }, 200, { "Cache-Control": "no-store" });
}

async function handleCreateConversation(request, env, user) {
  const data = await readJson(request);
  const title = clean(data.title).slice(0, 160);
  const usernames = Array.from(new Set(Array.isArray(data.usernames)
    ? data.usernames.filter(Boolean).map(clean).filter(username => username && username !== user.username)
    : [])).slice(0, 49);
  const isDirect = data.direct === true;

  if (!usernames.length) return json({ error: "Choose at least one member." }, 400);
  if (isDirect && usernames.length !== 1) return json({ error: "A direct chat can include only one other member." }, 400);
  if (!isDirect && !title) return json({ error: "A room name is required." }, 400);

  const accessError = await getMemberActionAccessError(env, user, "message");
  if (accessError) return json({ error: accessError }, 403);

  const members = [];
  for (const username of usernames) {
    const member = await getUserByUsername(env, username);
    if (!member || !member.active) return json({ error: `Member ${username} was not found.` }, 404);
    // Check if the target member has blocked the current user
    const isBlocked = await env.TPI_DB.prepare(`
      SELECT 1 FROM member_blocks WHERE blocker_id = ? AND blocked_id = ?
    `).bind(member.id, user.id).first();
    if (isBlocked) return json({ error: `Cannot start a conversation with ${username}.` }, 403);
    members.push(member);
  }
  members.push(user);

  let conversationId = crypto.randomUUID();
  if (isDirect && members.length === 2) {
    const other = members.find(m => m.id !== user.id);
    const existingId = await getDirectConversation(env, user, other);
    if (existingId) {
      // Clear hidden state for current user so conversation reappears in CHATS
      await env.TPI_DB.prepare(`
        UPDATE conversation_participants SET hidden_at = NULL, archived_at = NULL
        WHERE conversation_id = ? AND contributor_id = ?
      `).bind(existingId, user.id).run();
      const members = await getConversationMembers(env, existingId);
      const preferences = await getConversationParticipantState(env, existingId, user.id, true);
      const nicknames = await getConversationNicknames(env, existingId, user.id);
      return json({ conversation: { id: existingId, direct: true, members, nicknames, ...preferences } }, 200, { "Cache-Control": "no-store" });
    }
  }

  const finalTitle = title || getDefaultConversationTitle(members, user);
  await env.TPI_DB.prepare(`
    INSERT INTO conversations (id, title, created_by, direct, created_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(conversationId, finalTitle, user.id, isDirect ? 1 : 0).run();

  const inserts = members.map(member => env.TPI_DB.prepare(`
    INSERT INTO conversation_participants (conversation_id, contributor_id, can_message)
    VALUES (?, ?, ?)
  `).bind(conversationId, member.id, member.can_message === 0 ? 0 : 1));
  await env.TPI_DB.batch(inserts);

  const responseMembers = await getConversationMembers(env, conversationId);
  return json({ conversation: {
    id: conversationId,
    title: finalTitle,
    direct: isDirect,
    createdById: user.id,
    canManageMembers: !isDirect,
    members: responseMembers
  } }, 201, { "Cache-Control": "no-store" });
}

async function handleReplaceConversationMembers(path, request, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/members$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);
  if (Boolean(access.direct)) return json({ error: "Direct-chat membership cannot be changed." }, 400);
  const canManage = access.created_by === user.id || ["owner", "admin"].includes(user.role);
  if (!canManage) return json({ error: "Only the room creator or an administrator can manage its members." }, 403);

  const data = await readJson(request);
  const usernames = Array.from(new Set(Array.isArray(data.usernames)
    ? data.usernames.filter(Boolean).map(clean).filter(Boolean)
    : [])).slice(0, 49);
  const desiredMembers = [];
  for (const username of usernames) {
    const member = await getUserByUsername(env, username);
    if (!member || !member.active) return json({ error: `Member ${username} was not found.` }, 404);
    desiredMembers.push(member);
  }

  const desiredIds = new Set(desiredMembers.map(member => member.id));
  desiredIds.add(access.created_by);
  desiredIds.add(user.id);
  if (desiredIds.size < 2) return json({ error: "A room must keep at least two people." }, 400);
  if (desiredIds.size > 50) return json({ error: "A room can include up to 50 people." }, 400);

  const { results: existingRows } = await env.TPI_DB.prepare(`
    SELECT contributor_id AS contributorId
    FROM conversation_participants
    WHERE conversation_id = ?
  `).bind(conversationId).all();
  const existingIds = new Set((existingRows || []).map(row => row.contributorId));
  const addedMembers = desiredMembers.filter(member => !existingIds.has(member.id));
  const removedIds = Array.from(existingIds).filter(id => !desiredIds.has(id) && id !== access.created_by && id !== user.id);

  for (const member of addedMembers) {
    const isBlocked = await env.TPI_DB.prepare(`
      SELECT 1 FROM member_blocks WHERE blocker_id = ? AND blocked_id = ?
    `).bind(member.id, user.id).first();
    if (isBlocked) return json({ error: `Cannot add ${member.username} to this room.` }, 403);
  }

  const statements = addedMembers.map(member => env.TPI_DB.prepare(`
    INSERT OR IGNORE INTO conversation_participants (conversation_id, contributor_id, can_message)
    VALUES (?, ?, ?)
  `).bind(conversationId, member.id, member.can_message === 0 ? 0 : 1));
  for (const contributorId of removedIds) {
    statements.push(env.TPI_DB.prepare(`
      DELETE FROM conversation_nicknames
      WHERE conversation_id = ? AND (setter_id = ? OR target_id = ?)
    `).bind(conversationId, contributorId, contributorId));
    statements.push(env.TPI_DB.prepare(`
      DELETE FROM message_read_state WHERE conversation_id = ? AND contributor_id = ?
    `).bind(conversationId, contributorId));
    statements.push(env.TPI_DB.prepare(`
      DELETE FROM conversation_participants WHERE conversation_id = ? AND contributor_id = ?
    `).bind(conversationId, contributorId));
  }
  statements.push(env.TPI_DB.prepare(`UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(conversationId));
  await env.TPI_DB.batch(statements);

  if (addedMembers.length) {
    const actorName = user.display_name || user.username || "A member";
    await env.TPI_DB.batch(addedMembers.map(member => env.TPI_DB.prepare(`
      INSERT INTO member_notifications (id, contributor_id, title, body, action_href, type, created_by)
      VALUES (?, ?, ?, ?, ?, 'chat', ?)
    `).bind(
      crypto.randomUUID(),
      member.id,
      `Added to ${access.title || "a Messenger room"}`,
      `${actorName} added you to this Messenger room.`,
      `member-notifications.html?openChat=${encodeURIComponent(conversationId)}#messenger`,
      user.id
    )));
  }

  const members = await getConversationMembers(env, conversationId);
  return json({ conversation: {
    id: conversationId,
    title: access.title,
    direct: false,
    createdById: access.created_by,
    canManageMembers: true,
    createdAt: access.created_at,
    updatedAt: new Date().toISOString(),
    members
  } }, 200, { "Cache-Control": "no-store" });
}

async function handleListMessages(path, request, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/messages$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);

  const url = new URL(request.url);
  const before = clean(url.searchParams.get("before"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)));
  let sql = `
    SELECT m.id, m.body, m.attachments, m.created_at AS createdAt, m.edited_at AS editedAt,
           c.id AS authorId, c.username AS authorUsername, c.display_name AS authorDisplayName,
           c.photo_url AS authorPhotoUrl, c.chat_color AS authorChatColor
    FROM messages m
    LEFT JOIN contributors c ON c.id = m.contributor_id
    WHERE m.conversation_id = ? AND m.deleted_at IS NULL
  `;
  const params = [conversationId];
  if (before) {
    sql += " AND m.created_at < ?";
    params.push(before);
  }
  sql += " ORDER BY m.created_at DESC LIMIT ?";
  params.push(limit);

  const { results } = await env.TPI_DB.prepare(sql).bind(...params).all();
  const { results: readStates } = await env.TPI_DB.prepare(`
    SELECT rs.contributor_id AS contributorId, rs.last_read_at AS lastReadAt,
           c.username, c.display_name AS displayName
    FROM message_read_state rs
    JOIN conversation_participants cp ON cp.conversation_id = rs.conversation_id
      AND cp.contributor_id = rs.contributor_id
    JOIN contributors c ON c.id = rs.contributor_id
    WHERE rs.conversation_id = ? AND cp.read_receipts_enabled = 1
  `).bind(conversationId).all();
  const messages = (results || []).map(row => ({
    id: row.id,
    body: row.body,
    attachments: safeJsonParse(row.attachments),
    createdAt: row.createdAt,
    editedAt: row.editedAt || null,
    readBy: (readStates || []).filter(reader => reader.contributorId !== row.authorId && reader.lastReadAt >= row.createdAt).map(reader => ({
      username: reader.username,
      displayName: reader.displayName || reader.username
    })),
    author: row.authorId ? {
      id: row.authorId,
      username: row.authorUsername,
      displayName: row.authorDisplayName,
      photoUrl: row.authorPhotoUrl || "",
      chatColor: normalizeChatColor(row.authorChatColor || "#a855f7")
    } : null
  })).reverse();

  return json({ messages }, 200, { "Cache-Control": "no-store" });
}

async function handleCreateMessage(path, request, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/messages$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);
  if (access.can_message === 0) return json({ error: "Messaging is currently disabled for your account in this conversation." }, 403);

  const accessError = await getMemberActionAccessError(env, user, "message");
  if (accessError) return json({ error: accessError }, 403);

  // A block pauses direct messaging in both directions until the blocker reverses it.
  const isBlocked = access.direct ? await env.TPI_DB.prepare(`
    SELECT 1 FROM member_blocks mb
    JOIN conversation_participants blocker ON blocker.conversation_id = ? AND blocker.contributor_id = mb.blocker_id
    JOIN conversation_participants blocked ON blocked.conversation_id = ? AND blocked.contributor_id = mb.blocked_id
    WHERE mb.blocker_id = ? OR mb.blocked_id = ? LIMIT 1
  `).bind(conversationId, conversationId, user.id, user.id).first() : null;
  if (isBlocked) return json({ error: "You cannot send messages to this conversation." }, 403);

  const data = await readJson(request);
  const body = clean(data.body).slice(0, 4000);
  const attachments = sanitizeMessengerAttachments(data.attachments);
  if (!body && !attachments.length) return json({ error: "Message cannot be empty." }, 400);

  const messageId = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    INSERT INTO messages (id, conversation_id, contributor_id, body, attachments, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(messageId, conversationId, user.id, body, JSON.stringify(attachments), now).run();

  await env.TPI_DB.prepare(`
    UPDATE conversations SET updated_at = ? WHERE id = ?
  `).bind(now, conversationId).run();

  // Clear hidden state for other participants so conversation reappears in their CHATS
  await env.TPI_DB.prepare(`
    UPDATE conversation_participants SET hidden_at = NULL, archived_at = NULL
    WHERE conversation_id = ? AND contributor_id != ?
  `).bind(conversationId, user.id).run();

  return json({
    message: {
      id: messageId,
      body,
      attachments,
      createdAt: now,
      author: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        photoUrl: user.photo_url || "",
        chatColor: normalizeChatColor(user.chat_color || "#a855f7")
      }
    }
  }, 201, { "Cache-Control": "no-store" });
}

function getMessageRouteIds(path) {
  const match = path.match(/^\/conversations\/([^/]+)\/messages\/([^/]+)$/);
  return match ? { conversationId: clean(decodeURIComponent(match[1])), messageId: clean(decodeURIComponent(match[2])) } : { conversationId: "", messageId: "" };
}

async function handleUpdateMessage(path, request, env, user) {
  const { conversationId, messageId } = getMessageRouteIds(path);
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);
  const existing = await env.TPI_DB.prepare(`
    SELECT id, contributor_id, created_at FROM messages
    WHERE id = ? AND conversation_id = ? AND deleted_at IS NULL
  `).bind(messageId, conversationId).first();
  if (!existing) return json({ error: "Message not found." }, 404);
  if (existing.contributor_id !== user.id) return json({ error: "You can only edit your own messages." }, 403);

  const data = await readJson(request);
  const body = clean(data.body).slice(0, 4000);
  const attachments = sanitizeMessengerAttachments(data.attachments);
  if (!body && !attachments.length) return json({ error: "A message must contain text or media." }, 400);
  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    UPDATE messages SET body = ?, attachments = ?, edited_at = ?
    WHERE id = ? AND conversation_id = ? AND contributor_id = ? AND deleted_at IS NULL
  `).bind(body, JSON.stringify(attachments), now, messageId, conversationId, user.id).run();
  await env.TPI_DB.prepare("UPDATE conversations SET updated_at = ? WHERE id = ?").bind(now, conversationId).run();

  return json({ message: {
    id: messageId,
    body,
    attachments,
    createdAt: existing.created_at,
    editedAt: now,
    readBy: [],
    author: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      photoUrl: user.photo_url || "",
      chatColor: normalizeChatColor(user.chat_color || "#a855f7")
    }
  } }, 200, { "Cache-Control": "no-store" });
}

async function handleRemoveMessage(path, env, user) {
  const { conversationId, messageId } = getMessageRouteIds(path);
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);
  const existing = await env.TPI_DB.prepare(`
    SELECT id, contributor_id FROM messages
    WHERE id = ? AND conversation_id = ? AND deleted_at IS NULL
  `).bind(messageId, conversationId).first();
  if (!existing) return json({ error: "Message not found." }, 404);
  if (existing.contributor_id !== user.id) return json({ error: "You can only remove your own messages." }, 403);

  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    UPDATE messages SET deleted_at = ?
    WHERE id = ? AND conversation_id = ? AND contributor_id = ? AND deleted_at IS NULL
  `).bind(now, messageId, conversationId, user.id).run();
  await env.TPI_DB.prepare("UPDATE conversations SET updated_at = ? WHERE id = ?").bind(now, conversationId).run();
  return json({ ok: true, messageId, retained: true }, 200, { "Cache-Control": "no-store" });
}

async function handleMarkConversationRead(path, request, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/read$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);

  const latest = await env.TPI_DB.prepare(`
    SELECT id, created_at FROM messages
    WHERE conversation_id = ? AND deleted_at IS NULL
    ORDER BY created_at DESC LIMIT 1
  `).bind(conversationId).first();

  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    INSERT INTO message_read_state (conversation_id, contributor_id, last_read_message_id, last_read_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(conversation_id, contributor_id) DO UPDATE SET
      last_read_message_id = excluded.last_read_message_id,
      last_read_at = excluded.last_read_at
  `).bind(conversationId, user.id, latest ? latest.id : null, now).run();

  return json({ ok: true }, 200, { "Cache-Control": "no-store" });
}

async function handleHideConversation(path, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/hide$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);

  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    UPDATE conversation_participants SET hidden_at = ?, archived_at = NULL
    WHERE conversation_id = ? AND contributor_id = ?
  `).bind(now, conversationId, user.id).run();

  return json({ ok: true, hiddenAt: now }, 200, { "Cache-Control": "no-store" });
}

async function handleUnhideConversation(path, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/unhide$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);

  await env.TPI_DB.prepare(`
    UPDATE conversation_participants SET hidden_at = NULL, archived_at = NULL
    WHERE conversation_id = ? AND contributor_id = ?
  `).bind(conversationId, user.id).run();

  return json({ ok: true }, 200, { "Cache-Control": "no-store" });
}

async function handleArchiveConversation(path, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/archive$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);

  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    UPDATE conversation_participants SET hidden_at = ?, archived_at = NULL
    WHERE conversation_id = ? AND contributor_id = ?
  `).bind(now, conversationId, user.id).run();

  return json({ ok: true, hiddenAt: now }, 200, { "Cache-Control": "no-store" });
}

async function handleUnarchiveConversation(path, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/unarchive$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);

  await env.TPI_DB.prepare(`
    UPDATE conversation_participants SET hidden_at = NULL, archived_at = NULL
    WHERE conversation_id = ? AND contributor_id = ?
  `).bind(conversationId, user.id).run();

  return json({ ok: true }, 200, { "Cache-Control": "no-store" });
}

// ===== Conversation Preferences & Controls =====

async function handleUpdateConversationPreferences(path, request, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/preferences$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);

  const data = await readJson(request);
  const updates = [];
  const params = [];

  if (data.theme !== undefined) {
    const allowedThemes = ["default", "midnight", "slate", "deep-blue", "purple", "green", "amber", "warm", "flame"];
    const theme = clean(data.theme);
    if (!allowedThemes.includes(theme)) return json({ error: "That Messenger theme is not available." }, 400);
    updates.push("theme = ?");
    params.push(theme);
  }
  if (data.quickEmoji !== undefined) {
    updates.push("quick_emoji = ?");
    params.push(data.quickEmoji);
  }
  if (data.readReceiptsEnabled !== undefined) {
    updates.push("read_receipts_enabled = ?");
    params.push(data.readReceiptsEnabled ? 1 : 0);
  }

  if (updates.length === 0) return json({ error: "No valid preferences provided." }, 400);

  params.push(conversationId, user.id);
  await env.TPI_DB.prepare(`
    UPDATE conversation_participants
    SET ${updates.join(", ")}
    WHERE conversation_id = ? AND contributor_id = ?
  `).bind(...params).run();

  return json({ ok: true }, 200, { "Cache-Control": "no-store" });
}

async function handleSetNickname(path, request, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/nickname$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);

  const data = await readJson(request);
  const { targetUsername, nickname } = data;
  if (!targetUsername || !nickname) return json({ error: "Target username and nickname are required." }, 400);

  const target = await env.TPI_DB.prepare("SELECT id FROM contributors WHERE username = ?").bind(targetUsername).first();
  if (!target) return json({ error: "Target member not found." }, 404);

  // Verify target is a participant
  const targetParticipant = await env.TPI_DB.prepare(`
    SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND contributor_id = ?
  `).bind(conversationId, target.id).first();
  if (!targetParticipant) return json({ error: "Target member is not a participant in this conversation." }, 403);

  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    INSERT INTO conversation_nicknames (conversation_id, setter_id, target_id, nickname, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(conversation_id, setter_id, target_id) DO UPDATE SET
      nickname = excluded.nickname,
      updated_at = excluded.updated_at
  `).bind(conversationId, user.id, target.id, nickname, now, now).run();

  return json({ ok: true, nickname }, 200, { "Cache-Control": "no-store" });
}

async function handleGetNicknames(path, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/nicknames$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);

  const { results } = await env.TPI_DB.prepare(`
    SELECT cn.target_id, cn.nickname, c.username, c.display_name
    FROM conversation_nicknames cn
    JOIN contributors c ON c.id = cn.target_id
    WHERE cn.conversation_id = ? AND cn.setter_id = ?
  `).bind(conversationId, user.id).all();

  return json({ nicknames: results || [] }, 200, { "Cache-Control": "no-store" });
}

async function handleMuteConversation(path, request, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/mute$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);

  const data = await readJson(request);
  const { until } = data; // ISO timestamp or "indefinite"
  const mutedUntil = until === "indefinite" ? "9999-12-31T23:59:59.999Z" : until;
  if (!mutedUntil) return json({ error: "Mute duration required." }, 400);

  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    UPDATE conversation_participants SET muted_until = ? WHERE conversation_id = ? AND contributor_id = ?
  `).bind(mutedUntil, conversationId, user.id).run();

  return json({ ok: true, mutedUntil }, 200, { "Cache-Control": "no-store" });
}

async function handleUnmuteConversation(path, request, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/unmute$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);

  await env.TPI_DB.prepare(`
    UPDATE conversation_participants SET muted_until = NULL WHERE conversation_id = ? AND contributor_id = ?
  `).bind(conversationId, user.id).run();

  return json({ ok: true }, 200, { "Cache-Control": "no-store" });
}

async function handleBlockMember(path, request, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/block$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);

  const data = await readJson(request);
  const { targetUsername } = data;
  if (!targetUsername) return json({ error: "Target username required." }, 400);

  const target = await env.TPI_DB.prepare("SELECT id FROM contributors WHERE username = ?").bind(targetUsername).first();
  if (!target) return json({ error: "Target member not found." }, 404);
  if (target.id === user.id) return json({ error: "You cannot block yourself." }, 400);

  // Verify target is a participant
  const targetParticipant = await env.TPI_DB.prepare(`
    SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND contributor_id = ?
  `).bind(conversationId, target.id).first();
  if (!targetParticipant) return json({ error: "Target member is not a participant in this conversation." }, 403);

  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    INSERT INTO member_blocks (blocker_id, blocked_id, created_at)
    VALUES (?, ?, ?)
    ON CONFLICT(blocker_id, blocked_id) DO NOTHING
  `).bind(user.id, target.id, now).run();

  return json({ ok: true }, 200, { "Cache-Control": "no-store" });
}

async function handleUnblockMember(path, request, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/unblock$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);

  const data = await readJson(request);
  const { targetUsername } = data;
  if (!targetUsername) return json({ error: "Target username required." }, 400);

  const target = await env.TPI_DB.prepare("SELECT id FROM contributors WHERE username = ?").bind(targetUsername).first();
  if (!target) return json({ error: "Target member not found." }, 404);

  await env.TPI_DB.prepare(`
    DELETE FROM member_blocks WHERE blocker_id = ? AND blocked_id = ?
  `).bind(user.id, target.id).run();

  return json({ ok: true }, 200, { "Cache-Control": "no-store" });
}

async function handleRestrictMember(path, request, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/restrict$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);

  const data = await readJson(request);
  const { targetUsername } = data;
  if (!targetUsername) return json({ error: "Target username required." }, 400);

  const target = await env.TPI_DB.prepare("SELECT id FROM contributors WHERE username = ?").bind(targetUsername).first();
  if (!target) return json({ error: "Target member not found." }, 404);
  if (target.id === user.id) return json({ error: "You cannot restrict yourself." }, 400);

  // Verify target is a participant
  const targetParticipant = await env.TPI_DB.prepare(`
    SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND contributor_id = ?
  `).bind(conversationId, target.id).first();
  if (!targetParticipant) return json({ error: "Target member is not a participant in this conversation." }, 403);

  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    INSERT INTO member_restrictions (restrictor_id, restricted_id, created_at)
    VALUES (?, ?, ?)
    ON CONFLICT(restrictor_id, restricted_id) DO NOTHING
  `).bind(user.id, target.id, now).run();

  return json({ ok: true }, 200, { "Cache-Control": "no-store" });
}

async function handleUnrestrictMember(path, request, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/unrestrict$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);

  const data = await readJson(request);
  const { targetUsername } = data;
  if (!targetUsername) return json({ error: "Target username required." }, 400);

  const target = await env.TPI_DB.prepare("SELECT id FROM contributors WHERE username = ?").bind(targetUsername).first();
  if (!target) return json({ error: "Target member not found." }, 404);

  await env.TPI_DB.prepare(`
    DELETE FROM member_restrictions WHERE restrictor_id = ? AND restricted_id = ?
  `).bind(user.id, target.id).run();

  return json({ ok: true }, 200, { "Cache-Control": "no-store" });
}

async function handleReportConversation(path, request, env, user) {
  const conversationId = path.replace(/^\/conversations\//, "").replace(/\/report$/, "");
  const access = await requireConversationAccess(env, conversationId, user);
  if (!access) return json({ error: "Conversation not found." }, 404);

  const data = await readJson(request);
  const { reason, details, targetUsername } = data;
  if (!reason) return json({ error: "Report reason is required." }, 400);

  let reported = null;
  if (targetUsername) reported = await getUserByUsername(env, targetUsername);
  if (!reported) {
    reported = await env.TPI_DB.prepare(`
      SELECT c.id FROM conversation_participants cp
      JOIN contributors c ON c.id = cp.contributor_id
      WHERE cp.conversation_id = ? AND cp.contributor_id != ?
      ORDER BY cp.joined_at ASC LIMIT 1
    `).bind(conversationId, user.id).first();
  }
  if (!reported) return json({ error: "Choose a member to report." }, 400);
  const isParticipant = await env.TPI_DB.prepare(`
    SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND contributor_id = ?
  `).bind(conversationId, reported.id).first();
  if (!isParticipant || reported.id === user.id) return json({ error: "That member is not part of this conversation." }, 400);

  const reportId = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    INSERT INTO messenger_reports (id, reporter_id, reported_contributor_id, conversation_id, reason, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(reportId, user.id, reported.id, conversationId, reason, details || "", now).run();

  return json({ ok: true, reportId }, 201, { "Cache-Control": "no-store" });
}

async function handleConversationUnreadCount(env, user) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT COUNT(*) AS count
    FROM conversations c
    JOIN conversation_participants cp ON cp.conversation_id = c.id
    WHERE cp.contributor_id = ?
      AND cp.hidden_at IS NULL
      AND EXISTS (
        SELECT 1 FROM messages m
        WHERE m.conversation_id = c.id AND m.deleted_at IS NULL AND m.contributor_id != ?
          AND m.created_at > COALESCE((SELECT last_read_at FROM message_read_state WHERE conversation_id = c.id AND contributor_id = ?), '1970-01-01')
      )
  `).bind(user.id, user.id, user.id).all();
  return json({ count: Number((results && results[0] && results[0].count) || 0) }, 200, { "Cache-Control": "no-store" });
}

async function handlePresenceHeartbeat(request, env, user) {
  const now = new Date().toISOString();
  await env.TPI_DB.prepare(`
    INSERT INTO member_presence (contributor_id, last_seen_at, status)
    VALUES (?, ?, 'online')
    ON CONFLICT(contributor_id) DO UPDATE SET
      last_seen_at = excluded.last_seen_at,
      status = 'online'
  `).bind(user.id, now).run();
  return json({ ok: true, lastSeenAt: now }, 200, { "Cache-Control": "no-store" });
}

function getDefaultConversationTitle(members, currentUser) {
  const others = (members || []).filter(m => m.id !== currentUser.id);
  if (others.length === 1) return others[0].display_name || others[0].username || "Chat";
  const names = others.slice(0, 2).map(m => m.display_name || m.username);
  return names.join(", ") + (others.length > 2 ? ` +${others.length - 2}` : "");
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
}

async function requireContributor(request, env, handler) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: "Contributor login required." }, 401);
  if (!["owner", "admin", "contributor"].includes(user.role)) {
    return json({ error: "Contributor access is required." }, 403);
  }
  return handler(user);
}

async function requireContributorOrStudio(request, env, handler) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: "Contributor or Creator Studio access required." }, 401);
  if (["owner", "admin", "contributor"].includes(user.role) || await hasCreatorStudioAccess(env, user)) return handler(user);
  return json({ error: "Contributor or Creator Studio access required." }, 403);
}

async function requireMember(request, env, handler) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: "Member login required." }, 401);
  return handler(user);
}

async function requireAdmin(request, env, handler) {
  const user = await getSessionUser(request, env);
  if (!user || !["owner", "admin"].includes(user.role)) return json({ error: "Owner or admin access required." }, 403);
  return handler(user);
}

async function requireStudioAccess(request, env, handler) {
  const user = await getSessionUser(request, env);
  if (!user) return json({ error: "Creator Studio access requires an authenticated account." }, 401);
  if (!(await hasCreatorStudioAccess(env, user))) {
    return json({ error: "An active Creator Studio entitlement is required." }, 403);
  }
  return handler(user);
}

async function requireOwner(request, env, handler) {
  const user = await getSessionUser(request, env);
  if (!user || user.role !== "owner") return json({ error: "Owner access required." }, 403);
  return handler(user);
}

async function getSiteSettings(env) {
  const defaults = {
    autoRestrictUnverifiedEmail: false,
    requireVerifiedEmailToPost: false,
    requireVerifiedEmailToComment: false,
    requireVerifiedEmailToMessage: false
  };
  try {
    const { results } = await env.TPI_DB.prepare("SELECT key, value FROM site_settings").all();
    (results || []).forEach(row => {
      const enabled = row.value === "1" || row.value === "true";
      if (row.key === "auto_restrict_unverified_email") defaults.autoRestrictUnverifiedEmail = enabled;
      if (row.key === "require_verified_email_to_post") defaults.requireVerifiedEmailToPost = enabled;
      if (row.key === "require_verified_email_to_comment") defaults.requireVerifiedEmailToComment = enabled;
      if (row.key === "require_verified_email_to_message") defaults.requireVerifiedEmailToMessage = enabled;
    });
  } catch (error) {
    return defaults;
  }
  return defaults;
}

async function getMemberActionAccessError(env, user, action) {
  if (!user || ["owner", "admin"].includes(user.role)) return "";
  // Email verification is deliberately deferred until the site and Messenger
  // are complete. Individual account access controls still apply.
  if (action === "post" && user.can_post === 0) return "Posting is currently disabled for your account.";
  if (action === "comment" && user.can_comment === 0) return "Commenting is currently disabled for your account.";
  if (action === "message" && user.can_message === 0) return "Messaging is currently disabled for your account.";
  return "";
}

async function getConversationParticipantState(env, conversationId, userId, isDirect) {
  const row = await env.TPI_DB.prepare(`
    SELECT theme, quick_emoji AS quickEmoji, muted_until AS mutedUntil,
           read_receipts_enabled AS readReceiptsEnabled
    FROM conversation_participants WHERE conversation_id = ? AND contributor_id = ?
  `).bind(conversationId, userId).first();
  let blocked = false;
  let restricted = false;
  if (isDirect) {
    const relationship = await env.TPI_DB.prepare(`
      SELECT
        EXISTS(SELECT 1 FROM member_blocks mb JOIN conversation_participants cp ON cp.contributor_id = mb.blocked_id
          WHERE mb.blocker_id = ? AND cp.conversation_id = ? AND cp.contributor_id != ?) AS blocked,
        EXISTS(SELECT 1 FROM member_restrictions mr JOIN conversation_participants cp ON cp.contributor_id = mr.restricted_id
          WHERE mr.restrictor_id = ? AND cp.conversation_id = ? AND cp.contributor_id != ?) AS restricted
    `).bind(userId, conversationId, userId, userId, conversationId, userId).first();
    blocked = Boolean(relationship?.blocked);
    restricted = Boolean(relationship?.restricted);
  }
  return {
    theme: row?.theme || "default",
    quickEmoji: row?.quickEmoji || "👍",
    mutedUntil: row?.mutedUntil || null,
    readReceiptsEnabled: row?.readReceiptsEnabled !== 0,
    blocked,
    restricted
  };
}

async function getConversationNicknames(env, conversationId, setterId) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT cn.target_id, cn.nickname, c.username, c.display_name
    FROM conversation_nicknames cn
    JOIN contributors c ON c.id = cn.target_id
    WHERE cn.conversation_id = ? AND cn.setter_id = ?
  `).bind(conversationId, setterId).all();
  return results || [];
}

async function getUserByUsername(env, username) {
  if (!username) return null;
  return env.TPI_DB.prepare("SELECT * FROM contributors WHERE lower(username) = lower(?) LIMIT 1").bind(username).first();
}

async function getUserByLoginIdentifier(env, identifier) {
  const value = clean(identifier);
  if (!value) return null;
  if (!value.includes("@")) return getUserByUsername(env, value) || getUserByLegacyLoginAlias(env, value);
  const byEmail = await getUserByEmail(env, value.toLowerCase());
  return byEmail || getUserByUsername(env, value) || getUserByLegacyLoginAlias(env, value);
}

async function getUserByEmail(env, email) {
  const value = clean(email).toLowerCase();
  if (!value) return null;
  return env.TPI_DB.prepare("SELECT * FROM contributors WHERE lower(correspondence) = ?").bind(value).first();
}

async function getUserByLegacyLoginAlias(env, identifier) {
  const value = clean(identifier);
  if (!value) return null;
  const spaced = value.replace(/[_-]+/g, " ");
  const compact = value.replace(/[\s_-]+/g, "").toLowerCase();
  return env.TPI_DB.prepare(`
    SELECT *
    FROM contributors
    WHERE lower(display_name) = lower(?)
       OR lower(username) = lower(?)
       OR replace(replace(replace(lower(username), ' ', ''), '_', ''), '-', '') = ?
       OR replace(replace(replace(lower(display_name), ' ', ''), '_', ''), '-', '') = ?
    LIMIT 1
  `).bind(spaced, spaced, compact, compact).first();
}

async function getOpenInvite(env, code) {
  if (!code) return null;
  return env.TPI_DB.prepare("SELECT * FROM invite_codes WHERE code = ? AND used = 0").bind(code).first();
}

// ===== Community helpers (attachment/reaction hydration + shared logic) =====
// Names deliberately mirror the retired forum_* helpers so behavior carries
// over unchanged; queries now target community_* with polymorphic targets.
// attachCommunityMedia/attachCommunityReactions are batched (IN queries) to
// avoid N+1 per post/comment.

function communityTableName(targetType) {
  return targetType === "post" ? "community_posts" : targetType === "comment" ? "community_comments" : null;
}

async function attachCommunityMedia(env, items, targetType) {
  const safeItems = items || [];
  if (!safeItems.length) return safeItems;
  try {
    const ids = safeItems.map(item => item.id);
    const placeholders = ids.map(() => "?").join(",");
    const { results } = await env.TPI_DB.prepare(`
      SELECT
        target_id AS targetId,
        id,
        url,
        media_key AS key,
        name,
        content_type AS contentType,
        media_type AS mediaType,
        sort_order AS sortOrder
      FROM community_attachments
      WHERE target_type = ? AND target_id IN (${placeholders})
      ORDER BY sort_order ASC, created_at ASC
    `).bind(targetType, ...ids).all();
    const byTarget = new Map(safeItems.map(item => [item.id, []]));
    (results || []).forEach(row => {
      const list = byTarget.get(row.targetId);
      if (list) list.push(row);
    });
    safeItems.forEach(item => { item.attachments = byTarget.get(item.id) || []; });
  } catch (error) {
    safeItems.forEach(item => { item.attachments = item.attachments || []; });
  }
  return safeItems;
}

const COMMUNITY_REACTIONS = new Set(["like", "love", "care", "haha", "wow", "sad", "angry"]);

function isAllowedCommunityReaction(value) {
  return COMMUNITY_REACTIONS.has(String(value || "").toLowerCase());
}

async function getCommunityReactionSummary(env, targetType, targetId) {
  try {
    const { results } = await env.TPI_DB.prepare(`
      SELECT reaction, COUNT(*) AS count
      FROM community_reactions
      WHERE target_type = ? AND target_id = ?
      GROUP BY reaction
    `).bind(targetType, targetId).all();
    return Object.fromEntries((results || [])
      .filter(row => isAllowedCommunityReaction(row.reaction))
      .map(row => [row.reaction, Number(row.count || 0)]));
  } catch (error) {
    return {};
  }
}

async function getCommunityReactionSummaries(env, targetType, ids) {
  const summary = new Map(ids.map(id => [id, {}]));
  if (!ids.length) return summary;
  try {
    const placeholders = ids.map(() => "?").join(",");
    const { results } = await env.TPI_DB.prepare(`
      SELECT target_id AS targetId, reaction, COUNT(*) AS count
      FROM community_reactions
      WHERE target_type = ? AND target_id IN (${placeholders})
      GROUP BY target_id, reaction
    `).bind(targetType, ...ids).all();
    (results || []).forEach(row => {
      if (!isAllowedCommunityReaction(row.reaction)) return;
      const current = summary.get(row.targetId) || {};
      current[row.reaction] = Number(row.count || 0);
      summary.set(row.targetId, current);
    });
  } catch (error) { /* leave empty summaries */ }
  return summary;
}

async function getUserCommunityReactions(env, targetType, ids, contributorId) {
  const userReactions = new Map(ids.map(id => [id, null]));
  if (!contributorId || !ids.length) return userReactions;
  try {
    const placeholders = ids.map(() => "?").join(",");
    const { results } = await env.TPI_DB.prepare(`
      SELECT target_id AS targetId, reaction
      FROM community_reactions
      WHERE target_type = ? AND target_id IN (${placeholders}) AND contributor_id = ?
    `).bind(targetType, ...ids, contributorId).all();
    (results || []).forEach(row => userReactions.set(row.targetId, row.reaction || null));
  } catch (error) { /* leave nulls */ }
  return userReactions;
}

async function attachCommunityReactions(env, items, targetType, contributorId) {
  const safeItems = items || [];
  if (!safeItems.length) return safeItems;
  const ids = safeItems.map(item => item.id);
  const [summaries, mine] = await Promise.all([
    getCommunityReactionSummaries(env, targetType, ids),
    getUserCommunityReactions(env, targetType, ids, contributorId)
  ]);
  safeItems.forEach(item => {
    item.reactionCounts = summaries.get(item.id) || {};
    item.userReaction = mine.get(item.id) || null;
  });
  return safeItems;
}

function sanitizeCommunityAttachments(value) {
  const attachments = Array.isArray(value) ? value : [];
  const cleaned = attachments.map((item, index) => {
    const contentType = clean(item.contentType);
    const inferredMediaType = contentType.startsWith("video/") ? "video" : contentType.startsWith("image/") ? "image" : "file";
    const mediaType = clean(item.mediaType || inferredMediaType);
    return {
      url: clean(item.url).slice(0, 1000),
      key: clean(item.key).slice(0, 1000),
      name: clean(item.name).slice(0, 180),
      contentType: contentType.slice(0, 120),
      mediaType: mediaType === "video" ? "video" : mediaType === "link" ? "link" : mediaType === "file" ? "file" : "image",
      sortOrder: index
    };
  }).filter(item => item.url && ["image", "video", "file", "link"].includes(item.mediaType))
    // Links must be real http(s) URLs; uploaded media keys are only meaningful for image/video
    .filter(item => item.mediaType !== "link" || /^https?:\/\//i.test(item.url));

  const images = cleaned.filter(item => item.mediaType === "image");
  const videos = cleaned.filter(item => item.mediaType === "video");
  const files = cleaned.filter(item => item.mediaType === "file");
  const links = cleaned.filter(item => item.mediaType === "link");
  if (images.length > 10) throw new Error("Community posts can include up to 10 images.");
  if (videos.length > 2) throw new Error("Community posts can include up to 2 videos.");
  if (files.length > 5) throw new Error("Community posts can include up to 5 files.");
  if (links.length > 5) throw new Error("Community posts can include up to 5 links.");
  return cleaned;
}

async function insertCommunityAttachments(env, targetId, targetType, attachments) {
  if (!attachments.length) return;
  try {
    await env.TPI_DB.batch(attachments.map(item => env.TPI_DB.prepare(`
      INSERT INTO community_attachments (id, target_type, target_id, url, media_key, name, content_type, media_type, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), targetType, targetId, item.url, item.key, item.name, item.contentType, item.mediaType, item.sortOrder)));
  } catch (error) {
    throw new Error("community_attachments is not ready yet. Apply migrations 0032 and 0033 in Cloudflare D1.");
  }
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    return {};
  }
}

async function readUploadFile(request) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") return null;
  return {
    name: clean(file.name || "upload"),
    type: clean(file.type || "application/octet-stream"),
    size: Number(file.size || 0),
    body: await file.arrayBuffer()
  };
}

function sanitizeMessengerAttachments(value) {
  return (Array.isArray(value) ? value : []).slice(0, 6).map(item => {
    const type = clean(item?.type);
    const documentType = clean(item?.documentType);
    return {
      name: clean(item?.name).slice(0, 180),
      type: ["photo", "video", "voice", "file"].includes(type) ? type : "",
      documentType: type === "file" && ["PDF document", "Text document", "Document file"].includes(documentType) ? documentType : "",
      url: clean(item?.url).slice(0, 1000)
    };
  }).filter(item => item.type && item.url.startsWith("/api/media/messenger/"));
}

function clean(value) {
  return String(value || "").trim();
}

function normalizeChatColor(value) {
  const color = clean(value);
  return /^#[0-9a-f]{6}$/i.test(color) ? color : "#a855f7";
}

function isValidUsername(value) {
  const username = clean(value);
  return Boolean(username && !/\s/.test(username) && /^[A-Za-z0-9._!#$%&'*+/=?^`{|}~-]+$/.test(username));
}

function makeInviteCode() {
  return `TPI-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function getInviteAssignment(code) {
  const prefix = clean(code).toUpperCase().split("-")[0];
  return {
    D: { title: "Founder / Director", role: "owner" },
    AD: { title: "Assistant Director", role: "admin" },
    ABM: { title: "Advisory Board Member", role: "contributor" }
  }[prefix] || null;
}

function isProtectedOrgTitle(title) {
  const normalized = clean(title).toLowerCase().replace(/\s+/g, " ");
  return [
    "founder / director",
    "founder/director",
    "founder director",
    "assistant director",
    "advisory board member"
  ].includes(normalized);
}

function makeMediaKey(area, username, filename, contentType) {
  const safeArea = clean(area).toLowerCase().replace(/[^a-z0-9-]/g, "-") || "media";
  const safeUser = clean(username).toLowerCase().replace(/[^a-z0-9-]/g, "-") || "contributor";
  const safeName = clean(filename).toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-") || "upload";
  const ext = extensionFromNameOrType(safeName, contentType);
  const baseName = safeName.replace(/\.[a-z0-9]+$/, "").slice(0, 80) || "upload";
  const day = new Date().toISOString().slice(0, 10);
  return `${safeArea}/${safeUser}/${day}/${crypto.randomUUID()}-${baseName}${ext}`;
}

function extensionFromNameOrType(filename, contentType) {
  const match = filename.match(/(\.[a-z0-9]{2,8})$/);
  if (match) return match[1];
  const type = clean(contentType);
  if (type === "image/jpeg") return ".jpg";
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  if (type === "video/mp4") return ".mp4";
  if (type === "audio/mpeg") return ".mp3";
  if (type === "audio/wav") return ".wav";
  if (type === "application/pdf") return ".pdf";
  if (type === "text/plain") return ".txt";
  return "";
}

function publicUser(user) {
  return {
    username: user.username,
    displayName: user.display_name,
    title: user.title,
    role: user.role,
    affiliation: user.affiliation,
    organization: user.organization,
    website: user.website,
    bio: user.bio,
    photoUrl: user.photo_url,
    chatColor: user.chat_color || "#a855f7",
    commentSignatureEnabled: Boolean(user.comment_signature_enabled),
    active: user.active !== 0,
    createdAt: user.created_at
  };
}

function privateMemberUser(user, creatorStudioAccess = false) {
  return {
    id: user.id,
    ...publicUser(user),
    correspondence: user.correspondence,
    contactName: user.contact_name,
    phone: user.phone,
    addressLine1: user.address_line1,
    addressLine2: user.address_line2,
    city: user.city,
    state: user.state,
    postalCode: user.postal_code,
    emailVerified: Boolean(user.email_verified),
    phoneVerified: Boolean(user.phone_verified),
    canPost: user.can_post !== 0,
    canComment: user.can_comment !== 0,
    canMessage: user.can_message !== 0,
    theme: user.theme,
    // This is a server-derived capability for navigation only. All protected
    // routes and APIs repeat the authoritative entitlement check.
    creatorStudioAccess
  };
}

// ===== Notification categories + per-member preferences (ParaPost-style settings) =====
const NOTIFICATION_CATEGORIES = {
  admin: { label: "Administration Notices", description: "Profile requests, account warnings, and other messages from leadership." },
  posts: { label: "New Posts", description: "Community posts and member discussions." },
  education: { label: "Educational Content", description: "New papers and contributed research in the Education Center." },
  videos: { label: "New Videos", description: "New TPI videos and live content alerts." },
  photos: { label: "New Photos", description: "Photo updates from the community feed." },
  chat: { label: "Messages & Chat", description: "Messenger room activity and direct messages." }
};
const NOTIFICATION_TYPE_CATEGORY = {
  admin: "admin", team_submission: "admin", profile_request: "admin", warning: "admin",
  post: "posts", forum_post: "posts", community_post: "posts",
  contribution: "education", article: "education", education: "education",
  video: "videos", broadcast_published: "videos", broadcast_replay: "videos", photo: "photos",
  chat: "chat", message: "chat"
};

function normalizeNotificationType(type) {
  return clean(String(type || "")).replace(/-/g, "_");
}

function parseNotificationPrefs(raw) {
  let prefs = {};
  if (raw) { try { prefs = JSON.parse(raw) || {}; } catch (error) { prefs = {}; } }
  const out = {};
  for (const key of Object.keys(NOTIFICATION_CATEGORIES)) out[key] = prefs[key] !== 0;
  return out;
}

function categoryEnabledForType(prefsRaw, type) {
  const category = NOTIFICATION_TYPE_CATEGORY[normalizeNotificationType(type)];
  if (!category) return true;
  return parseNotificationPrefs(prefsRaw)[category];
}

function notificationPreferencesPayload(prefsRaw) {
  const prefs = parseNotificationPrefs(prefsRaw);
  const categories = Object.entries(NOTIFICATION_CATEGORIES).map(([key, meta]) => ({
    key,
    label: meta.label,
    description: meta.description,
    enabled: prefs[key]
  }));
  return { categories, onCount: categories.filter(item => item.enabled).length, total: categories.length };
}

async function handleGetNotificationPreferences(env, user) {
  return json(notificationPreferencesPayload(user.notification_prefs), 200, { "Cache-Control": "no-store" });
}

async function handleSetNotificationPreferences(request, env, user) {
  const data = await readJson(request);
  const incoming = data && typeof data.prefs === "object" && data.prefs ? data.prefs : {};
  const stored = {};
  for (const key of Object.keys(NOTIFICATION_CATEGORIES)) {
    if (!(key in incoming)) return json({ error: `Preference for "${key}" is required.` }, 400);
    stored[key] = incoming[key] === false || incoming[key] === 0 ? 0 : 1;
  }
  await env.TPI_DB.prepare("UPDATE contributors SET notification_prefs = ? WHERE id = ?")
    .bind(JSON.stringify(stored), user.id).run();
  return json({ ok: true, ...notificationPreferencesPayload(JSON.stringify(stored)) }, 200, { "Cache-Control": "no-store" });
}

function corsHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...extra
  };
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
      ...headers
    }
  });
}

// ============================================================
// PARANORMAL TEAMS API HANDLERS
// ============================================================

function teamRowToPublic(row) {
  if (!row) return null;
  let additionalStates = [];
  try {
    const parsedStates = row.additional_states ? JSON.parse(row.additional_states) : [];
    additionalStates = Array.isArray(parsedStates) ? parsedStates : [];
  } catch (error) {
    additionalStates = [];
  }
  return {
    id: row.id,
    name: row.name,
    acronym: row.acronym,
    scope: row.scope,
    city: row.city,
    state: row.state,
    country: row.country,
    zip: row.zip,
    address: row.address,
    contactName: row.contact_name,
    phone: row.phone,
    phoneAlt: row.phone_alt,
    fax: row.fax,
    email: row.email,
    emailAlt: row.email_alt,
    website: row.website,
    facebook: row.facebook,
    twitter: row.twitter,
    youtube: row.youtube,
    founder: row.founder,
    yearFounded: row.year_founded,
    members: row.members,
    areasServed: row.areas_served,
    specialties: row.specialties,
    description: row.description,
    details: row.details,
    additionalStates,
    createdAt: row.created_at,
    recordType: row.record_type,
    verificationStatus: row.verification_status
  };
}

function teamRowToAdmin(row) {
  if (!row) return null;
  return {
    ...teamRowToPublic(row),
    status: row.status,
    submitterName: row.submitter_name,
    submitterEmail: row.submitter_email,
    heardAbout: row.heard_about,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    externalId: row.external_id,
    externalSource: row.external_source,
    importedAt: row.imported_at,
    claimedAt: row.claimed_at,
    claimedBy: row.claimed_by,
    verifiedAt: row.verified_at,
    lastVerifiedAt: row.last_verified_at
  };
}

async function handleTeamCounts(env) {
  const approved = await env.TPI_DB.prepare(
    "SELECT scope, state, country, COUNT(*) as cnt FROM paranormal_teams WHERE status = 'approved' GROUP BY scope, state, country"
  ).all();

  const states = {};
  const countries = {};

  for (const row of (approved.results || [])) {
    if (row.scope === "us" && row.state) {
      states[row.state] = (states[row.state] || 0) + row.cnt;
    } else if (row.scope === "international" && row.country) {
      countries[row.country] = (countries[row.country] || 0) + row.cnt;
    }
  }

  return json({ states, countries }, 200, { "Cache-Control": "public, max-age=300" });
}

async function handleGetTeam(path, env) {
  const id = path.split("/").pop();
  if (!id) return json({ error: "Team ID required." }, 400);

  const row = await env.TPI_DB.prepare(
    "SELECT * FROM paranormal_teams WHERE id = ? AND status = 'approved'"
  ).bind(id).first();

  if (!row) return json({ error: "Team not found." }, 404);

  // The normalized link table is additive. Keep the public profile usable
  // while an older local database is being upgraded, then prefer normalized
  // links when they are available.
  let links = [];
  try {
    const linkRows = await env.TPI_DB.prepare(
      "SELECT id, platform, url, link_type, discovery_source, discovered_at, last_checked_at, link_status, verification_status, evidence_notes FROM organization_links WHERE team_id = ? ORDER BY platform, created_at"
    ).bind(row.id).all();
    links = linkRows.results || [];
  } catch (error) {
    links = [];
  }

  return json({ team: { ...teamRowToPublic(row), links } }, 200, { "Cache-Control": "public, max-age=300" });
}

async function handleListTeams(request, env) {
  const url = new URL(request.url);
  const state = clean(url.searchParams.get("state") || "");
  const country = clean(url.searchParams.get("country") || "");
  const q = clean(url.searchParams.get("q") || "");
  const scope = clean(url.searchParams.get("scope") || "");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 200);
  const offset = parseInt(url.searchParams.get("offset") || "0");

  let where = "status = 'approved'";
  const binds = [];

  if (scope === "us") {
    where += " AND scope = 'us'";
  } else if (scope === "international") {
    where += " AND scope = 'international'";
  }

  if (state) {
    where += " AND (state = ? OR additional_states LIKE ?)";
    binds.push(state, `%${state}%`);
  }

  if (country) {
    where += " AND country = ?";
    binds.push(country);
  }

  if (q) {
    where += " AND (name LIKE ? OR city LIKE ? OR specialties LIKE ? OR details LIKE ? OR contact_name LIKE ?)";
    const like = `%${q}%`;
    binds.push(like, like, like, like, like);
  }

  const countRow = await env.TPI_DB.prepare(
    `SELECT COUNT(*) as total FROM paranormal_teams WHERE ${where}`
  ).bind(...binds).first();

  const rows = await env.TPI_DB.prepare(
    `SELECT * FROM paranormal_teams WHERE ${where} ORDER BY name ASC LIMIT ? OFFSET ?`
  ).bind(...binds, limit, offset).all();

  return json({
    teams: (rows.results || []).map(teamRowToPublic),
    total: countRow?.total || 0,
    limit,
    offset
  }, 200, { "Cache-Control": "public, max-age=60" });
}

async function handleSubmitTeam(request, env) {
  const data = await readJson(request);

  // Honeypot check
  if (data.company_url) return json({ ok: true }, 200);

  // Validate required fields
  const name = clean(data.name);
  const city = clean(data.city);
  const email = clean(data.email);
  const submitterName = clean(data.submitterName);
  const submitterEmail = clean(data.submitterEmail);

  if (!name || !city || !email || !submitterName || !submitterEmail) {
    return json({ error: "Name, city, email, submitter name, and submitter email are required." }, 400);
  }

  if (!email.includes("@") || !submitterEmail.includes("@")) {
    return json({ error: "Valid email addresses are required." }, 400);
  }

  const scope = data.scope === "international" ? "international" : "us";
  if (scope === "us" && !clean(data.state)) {
    return json({ error: "State is required for U.S. teams." }, 400);
  }
  if (scope === "international" && !clean(data.country)) {
    return json({ error: "Country is required for international teams." }, 400);
  }

  // Rate limiting: check recent submissions from this IP
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const recentCount = await env.TPI_DB.prepare(
    "SELECT COUNT(*) as cnt FROM paranormal_teams WHERE submitted_ip = ? AND created_at > datetime('now', '-1 hour')"
  ).bind(ip).first();

  if ((recentCount?.cnt || 0) >= 5) {
    return json({ error: "Too many submissions. Please try again later." }, 429);
  }

  const id = crypto.randomUUID();
  const additionalStates = Array.isArray(data.additionalStates)
    ? data.additionalStates.filter(s => s && s !== clean(data.state)).slice(0, 4)
    : [];

  await env.TPI_DB.prepare(`
    INSERT INTO paranormal_teams (
      id, status, scope, name, acronym, address, city, state, country, zip,
      contact_name, phone, phone_alt, fax, email, email_alt, website,
      facebook, twitter, youtube, founder, year_founded, members,
      areas_served, specialties, description, details, additional_states,
      submitter_name, submitter_email, heard_about, submitted_ip, record_type
    ) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'REGISTERED_TEAM')
  `).bind(
    id, scope, name, clean(data.acronym), clean(data.address), city,
    clean(data.state), clean(data.country), clean(data.zip),
    clean(data.contactName), clean(data.phone), clean(data.phoneAlt),
    clean(data.fax), email, clean(data.emailAlt), clean(data.website),
    clean(data.facebook), clean(data.twitter), clean(data.youtube),
    clean(data.founder), clean(data.yearFounded), clean(data.members),
    clean(data.areasServed), clean(data.specialties), clean(data.description), clean(data.details),
    additionalStates.length ? JSON.stringify(additionalStates) : null,
    submitterName, submitterEmail, clean(data.heardAbout), ip
  ).run();

  // Send notification email to admin (best effort)
  try {
    const { sendTeamSubmissionNotification } = await import("../../lib/email.js");
    await sendTeamSubmissionNotification(env, { name, city: city, submitterName, submitterEmail });
  } catch (e) {
    // Email notification is best-effort
  }

  return json({ ok: true, id }, 201);
}

async function handleUpdateTeam(path, request, env, user) {
  const id = path.split("/").pop();
  if (!id) return json({ error: "Team ID required." }, 400);

  const team = await env.TPI_DB.prepare("SELECT * FROM paranormal_teams WHERE id = ?").bind(id).first();
  if (!team) return json({ error: "Team not found." }, 404);

  const membership = await env.TPI_DB.prepare(
    "SELECT role FROM team_members WHERE team_id = ? AND contributor_id = ? AND role IN ('owner', 'admin')"
  ).bind(id, user.id).first();
  if (!membership && !["owner", "admin"].includes(user.role)) {
    return json({ error: "You are not authorized to edit this team." }, 403);
  }

  const data = await readJson(request);
  const name = clean(data.name);
  const city = clean(data.city);
  const email = clean(data.email);
  if (!name || !city || !email || !email.includes("@")) {
    return json({ error: "Name, city, and a valid email address are required." }, 400);
  }

  const urlFields = ["website", "facebook", "youtube"];
  const normalizedUrls = {};
  for (const field of urlFields) {
    const raw = clean(data[field]);
    if (!raw) {
      normalizedUrls[field] = null;
      continue;
    }
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      const parsed = new URL(candidate);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Unsupported protocol");
      normalizedUrls[field] = candidate;
    } catch {
      return json({ error: `${field} must be a valid web URL.` }, 400);
    }
  }

  const additionalStates = Array.isArray(data.additionalStates)
    ? data.additionalStates.filter(value => value && value !== clean(data.state)).slice(0, 4)
    : [];
  const next = {
    name,
    acronym: clean(data.acronym),
    address: clean(data.address),
    city,
    state: clean(data.state),
    country: clean(data.country),
    zip: clean(data.zip),
    contact_name: clean(data.contactName),
    phone: clean(data.phone),
    phone_alt: clean(data.phoneAlt),
    fax: clean(data.fax),
    email,
    email_alt: clean(data.emailAlt),
    website: normalizedUrls.website,
    facebook: normalizedUrls.facebook,
    twitter: clean(data.twitter),
    youtube: normalizedUrls.youtube,
    founder: clean(data.founder),
    year_founded: clean(data.yearFounded),
    members: clean(data.members),
    areas_served: clean(data.areasServed),
    specialties: clean(data.specialties),
    description: clean(data.description),
    details: clean(data.details),
    additional_states: additionalStates.length ? JSON.stringify(additionalStates) : null
  };

  const changes = {};
  for (const [column, value] of Object.entries(next)) {
    const previous = team[column];
    if (String(previous == null ? "" : previous) !== String(value == null ? "" : value)) {
      changes[column] = { from: previous == null ? null : previous, to: value == null ? null : value };
    }
  }
  if (!Object.keys(changes).length) return json({ ok: true, changed: false });

  const assignments = Object.keys(next).map(column => `${column} = ?`).join(", ");
  const update = env.TPI_DB.prepare(`UPDATE paranormal_teams SET ${assignments} WHERE id = ?`)
    .bind(...Object.values(next), id);
  const audit = env.TPI_DB.prepare(
    "INSERT INTO team_edit_events (team_id, editor_id, editor_role, changes_json) VALUES (?, ?, ?, ?)"
  ).bind(id, user.id, membership?.role || user.role, JSON.stringify(changes));

  await env.TPI_DB.batch([update, audit]);
  return json({ ok: true, changed: true });
}

async function handleGetTeamLinks(path, env) {
  const id = path.split("/").slice(-2)[0];
  if (!id) return json({ error: "Team ID required." }, 400);

  const team = await env.TPI_DB.prepare(
    "SELECT id FROM paranormal_teams WHERE id = ? AND status = 'approved'"
  ).bind(id).first();
  if (!team) return json({ error: "Team not found." }, 404);

  const rows = await env.TPI_DB.prepare(
    "SELECT * FROM organization_links WHERE team_id = ? ORDER BY platform, created_at"
  ).bind(id).all();

  return json({ links: rows.results || [] }, 200, { "Cache-Control": "public, max-age=300" });
}

async function handleAddTeamLink(path, request, env, user) {
  const id = path.split("/").slice(-2)[0];
  if (!id) return json({ error: "Team ID required." }, 400);

  // Verify team exists and user has permission
  const team = await env.TPI_DB.prepare("SELECT * FROM paranormal_teams WHERE id = ?").bind(id).first();
  if (!team) return json({ error: "Team not found." }, 404);

  const isOwner = await env.TPI_DB.prepare(
    "SELECT 1 FROM team_members WHERE team_id = ? AND contributor_id = ? AND role IN ('owner', 'admin')"
  ).bind(id, user.id).first();

  if (!isOwner && !["owner", "admin"].includes(user.role)) {
    return json({ error: "Not authorized to add links to this team." }, 403);
  }

  const data = await readJson(request);
  const platform = clean(data.platform);
  const url = clean(data.url);
  const linkType = clean(data.linkType || "website");

  if (!platform || !url) return json({ error: "Platform and URL are required." }, 400);

  // Validate URL format and allow only externally navigable web URLs.
  const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const parsed = new URL(normalizedUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Unsupported protocol");
  } catch {
    return json({ error: "Invalid URL format." }, 400);
  }

  const linkId = crypto.randomUUID();
  await env.TPI_DB.prepare(`
    INSERT INTO organization_links (id, team_id, platform, url, link_type, discovery_source)
    VALUES (?, ?, ?, ?, ?, 'manual')
  `).bind(linkId, id, platform, normalizedUrl, linkType).run();

  return json({ ok: true, id: linkId }, 201);
}

async function handleGetTeamVerification(path, env) {
  const id = path.split("/").slice(-2)[0];
  if (!id) return json({ error: "Team ID required." }, 400);

  const team = await env.TPI_DB.prepare(
    "SELECT id FROM paranormal_teams WHERE id = ? AND status = 'approved'"
  ).bind(id).first();
  if (!team) return json({ error: "Team not found." }, 404);

  const rows = await env.TPI_DB.prepare(
    "SELECT * FROM team_verification_events WHERE team_id = ? ORDER BY created_at DESC"
  ).bind(id).all();

  return json({ events: rows.results || [] }, 200, { "Cache-Control": "public, max-age=300" });
}

async function handleAddTeamVerification(path, request, env, user) {
  const id = path.split("/").slice(-2)[0];
  if (!id) return json({ error: "Team ID required." }, 400);

  const team = await env.TPI_DB.prepare("SELECT * FROM paranormal_teams WHERE id = ?").bind(id).first();
  if (!team) return json({ error: "Team not found." }, 404);

  const data = await readJson(request);
  const status = clean(data.status);
  const validStatuses = ["ACTIVE", "POSSIBLY_ACTIVE", "UNABLE_TO_VERIFY", "APPEARS_DEFUNCT"];

  if (!validStatuses.includes(status)) {
    return json({ error: `Status must be one of: ${validStatuses.join(", ")}` }, 400);
  }

  await env.TPI_DB.prepare(`
    INSERT INTO team_verification_events (team_id, status, evidence_url, evidence_type, evidence_description, last_apparent_activity, confidence, verifier, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, status, clean(data.evidenceUrl), clean(data.evidenceType),
    clean(data.evidenceDescription), clean(data.lastApparentActivity),
    clean(data.confidence), user.username, clean(data.notes)
  ).run();

  // Update team verification status
  await env.TPI_DB.prepare(
    "UPDATE paranormal_teams SET verification_status = ?, last_verified_at = datetime('now') WHERE id = ?"
  ).bind(status, id).run();
  await writeAdminAuditLog(env, user, "team.verification_recorded", "team", id, { status, evidenceUrl: clean(data.evidenceUrl), confidence: clean(data.confidence) });

  return json({ ok: true }, 201);
}

async function handleSubmitClaim(path, request, env, user) {
  const id = path.split("/").slice(-2)[0];
  if (!id) return json({ error: "Team ID required." }, 400);

  const team = await env.TPI_DB.prepare("SELECT * FROM paranormal_teams WHERE id = ?").bind(id).first();
  if (!team) return json({ error: "Team not found." }, 404);

  // Check if already claimed
  if (team.claimed_by) return json({ error: "This team is already claimed." }, 400);

  // Check for existing pending claim
  const existingClaim = await env.TPI_DB.prepare(
    "SELECT 1 FROM team_claims WHERE team_id = ? AND claimant_id = ? AND status = 'pending'"
  ).bind(id, user.id).first();

  if (existingClaim) return json({ error: "You already have a pending claim for this team." }, 400);

  const data = await readJson(request);
  const claimantName = clean(data.claimantName || user.display_name);
  const claimantEmail = clean(data.claimantEmail || user.correspondence);
  const claimantRole = clean(data.claimantRole);

  if (!claimantName || !claimantEmail) {
    return json({ error: "Claimant name and email are required." }, 400);
  }

  const claimId = crypto.randomUUID();
  await env.TPI_DB.prepare(`
    INSERT INTO team_claims (id, team_id, claimant_id, claimant_name, claimant_email, claimant_role, evidence_url, evidence_description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    claimId, id, user.id, claimantName, claimantEmail, claimantRole,
    clean(data.evidenceUrl), clean(data.evidenceDescription)
  ).run();

  return json({ ok: true, id: claimId }, 201);
}

async function handleAdminListTeams(request, env, user) {
  const url = new URL(request.url);
  const status = clean(url.searchParams.get("status") || "pending");
  const paginated = url.searchParams.has("page") || url.searchParams.has("pageSize");
  const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") || "1", 10) || 1, 10000));
  const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") || "50", 10) || 50, 100));
  const limit = Math.max(1, Math.min(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 500));
  const offset = Math.max(0, parseInt(url.searchParams.get("offset") || "0", 10) || 0);
  const search = clean(url.searchParams.get("search") || "").slice(0, 120);

  const validStatuses = ["pending", "approved", "rejected"];
  if (!validStatuses.includes(status)) {
    return json({ error: `Status must be one of: ${validStatuses.join(", ")}` }, 400);
  }

  const filters = ["status = ?"];
  const binds = [status];
  if (search) {
    filters.push("(name LIKE ? OR acronym LIKE ? OR city LIKE ? OR state LIKE ? OR country LIKE ? OR submitter_name LIKE ?)");
    const pattern = `%${search}%`;
    binds.push(pattern, pattern, pattern, pattern, pattern, pattern);
  }
  const where = filters.join(" AND ");
  const requestedLimit = paginated ? pageSize : limit;
  const requestedOffset = paginated ? (page - 1) * pageSize : offset;
  const rows = await env.TPI_DB.prepare(
    `SELECT * FROM paranormal_teams WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).bind(...binds, requestedLimit, requestedOffset).all();

  if (!paginated) return json({ teams: (rows.results || []).map(teamRowToAdmin) });
  const count = await env.TPI_DB.prepare(`SELECT COUNT(*) AS total FROM paranormal_teams WHERE ${where}`).bind(...binds).first();
  const total = Number(count?.total || 0);
  return json({ teams: (rows.results || []).map(teamRowToAdmin), search, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}

async function handleAdminListClaims(request, env, user) {
  const url = new URL(request.url);
  const status = clean(url.searchParams.get("status") || "pending");
  const allowedStatuses = ["pending", "approved", "rejected"];
  if (!allowedStatuses.includes(status)) {
    return json({ error: `Claim status must be one of: ${allowedStatuses.join(", ")}` }, 400);
  }

  const rows = await env.TPI_DB.prepare(`
    SELECT tc.*, pt.name AS team_name, pt.record_type, pt.verification_status,
           pt.claimed_by AS team_claimed_by
    FROM team_claims tc
    JOIN paranormal_teams pt ON pt.id = tc.team_id
    WHERE tc.status = ?
    ORDER BY tc.created_at DESC
    LIMIT 200
  `).bind(status).all();

  return json({ claims: rows.results || [] });
}

async function handleAdminReviewClaim(path, request, env, user) {
  const match = path.match(/^\/admin\/teams\/claims\/([^/]+)\/(approve|reject)$/);
  const claimId = match?.[1];
  const action = match?.[2];
  if (!claimId || !action) return json({ error: "Claim action is required." }, 400);

  const claim = await env.TPI_DB.prepare(`
    SELECT tc.*, pt.claimed_by AS team_claimed_by
    FROM team_claims tc
    JOIN paranormal_teams pt ON pt.id = tc.team_id
    WHERE tc.id = ?
  `).bind(claimId).first();
  if (!claim) return json({ error: "Claim request not found." }, 404);
  if (claim.status !== "pending") return json({ error: "This claim request has already been reviewed." }, 409);

  const data = await readJson(request);
  const reviewNotes = clean(data.reviewNotes);
  const now = new Date().toISOString();

  if (action === "reject") {
    await env.TPI_DB.prepare(
      "UPDATE team_claims SET status = 'rejected', reviewed_at = ?, reviewed_by = ?, review_notes = ?, updated_at = datetime('now') WHERE id = ? AND status = 'pending'"
    ).bind(now, user.username, reviewNotes, claimId).run();
    await writeAdminAuditLog(env, user, "team.claim_rejected", "team_claim", claimId, { teamId: claim.team_id, previousStatus: "pending", status: "rejected", reviewNotes: reviewNotes || undefined });
    return json({ ok: true, status: "rejected" });
  }

  if (claim.team_claimed_by) return json({ error: "This team is already claimed by another account." }, 409);

  const claimUpdate = env.TPI_DB.prepare(
    "UPDATE team_claims SET status = 'approved', reviewed_at = ?, reviewed_by = ?, review_notes = ?, updated_at = datetime('now') WHERE id = ? AND status = 'pending'"
  ).bind(now, user.username, reviewNotes, claimId);
  const teamUpdate = env.TPI_DB.prepare(
    "UPDATE paranormal_teams SET claimed_at = ?, claimed_by = ? WHERE id = ? AND claimed_by IS NULL"
  ).bind(now, claim.claimant_id, claim.team_id);
  const membership = env.TPI_DB.prepare(
    "INSERT OR IGNORE INTO team_members (id, team_id, contributor_id, role) VALUES (?, ?, ?, 'owner')"
  ).bind(crypto.randomUUID(), claim.team_id, claim.claimant_id);

  await env.TPI_DB.batch([claimUpdate, teamUpdate, membership]);
  await writeAdminAuditLog(env, user, "team.claim_approved", "team_claim", claimId, { teamId: claim.team_id, previousStatus: "pending", status: "approved", reviewNotes: reviewNotes || undefined });
  return json({ ok: true, status: "approved" });
}

async function handleAdminTeamHistory(path, env, user) {
  const id = clean(decodeURIComponent(path.match(/^\/admin\/teams\/([^/]+)\/history$/)?.[1] || ""));
  if (!id) return json({ error: "Team ID is required." }, 400);
  const team = await env.TPI_DB.prepare("SELECT id, name, status, verification_status AS verificationStatus, reviewed_at AS reviewedAt, reviewed_by AS reviewedBy FROM paranormal_teams WHERE id = ?").bind(id).first();
  if (!team) return json({ error: "Team not found." }, 404);
  const [verification, claims, audits] = await Promise.all([
    env.TPI_DB.prepare(`SELECT id, team_id AS teamId, status, evidence_url AS evidenceUrl, evidence_type AS evidenceType, evidence_description AS evidenceDescription, last_apparent_activity AS lastApparentActivity, confidence, verifier, notes, created_at AS createdAt FROM team_verification_events WHERE team_id = ? ORDER BY created_at DESC`).bind(id).all(),
    env.TPI_DB.prepare(`SELECT id, team_id AS teamId, claimant_id AS claimantId, claimant_name AS claimantName, claimant_email AS claimantEmail, claimant_role AS claimantRole, evidence_url AS evidenceUrl, evidence_description AS evidenceDescription, status, reviewed_at AS reviewedAt, reviewed_by AS reviewedBy, review_notes AS reviewNotes, created_at AS createdAt, updated_at AS updatedAt FROM team_claims WHERE team_id = ? ORDER BY created_at DESC`).bind(id).all(),
    env.TPI_DB.prepare(`SELECT id, actor_username AS actorUsername, actor_role AS actorRole, action, target_type AS targetType, target_id AS targetId, metadata_json AS metadata, created_at AS createdAt FROM admin_audit_logs WHERE (target_type = 'team' AND target_id = ?) OR (target_type = 'team_claim' AND target_id IN (SELECT id FROM team_claims WHERE team_id = ?)) ORDER BY created_at DESC LIMIT 100`).bind(id, id).all().catch(() => ({ results: [] }))
  ]);
  return json({ team, verificationEvents: verification.results || [], claims: claims.results || [], auditLogs: (audits.results || []).map(row => ({ ...row, metadata: safeJsonParse(row.metadata) || {} })) }, 200, { "Cache-Control": "no-store" });
}

async function handleAdminDeleteTeam(path, env, user) {
  const id = path.split("/").pop();
  if (!id) return json({ error: "Team ID required." }, 400);

  const team = await env.TPI_DB.prepare("SELECT * FROM paranormal_teams WHERE id = ?").bind(id).first();
  if (!team) return json({ error: "Team not found." }, 404);

  if (team.status === "approved" || team.claimed_by || team.record_type !== "REGISTERED_TEAM") {
    return json({ error: "Approved, claimed, and imported team records cannot be deleted from this queue." }, 409);
  }

  // Delete related records first
  await env.TPI_DB.prepare("DELETE FROM organization_links WHERE team_id = ?").bind(id).run();
  await env.TPI_DB.prepare("DELETE FROM team_verification_events WHERE team_id = ?").bind(id).run();
  await env.TPI_DB.prepare("DELETE FROM team_claims WHERE team_id = ?").bind(id).run();
  await env.TPI_DB.prepare("DELETE FROM team_members WHERE team_id = ?").bind(id).run();
  await env.TPI_DB.prepare("DELETE FROM team_imports WHERE team_id = ?").bind(id).run();
  await env.TPI_DB.prepare("DELETE FROM paranormal_teams WHERE id = ?").bind(id).run();

  return json({ ok: true });
}

async function handleAdminApproveTeam(path, env, user) {
  const id = path.split("/").slice(-2)[0];
  if (!id) return json({ error: "Team ID required." }, 400);

  const team = await env.TPI_DB.prepare("SELECT * FROM paranormal_teams WHERE id = ?").bind(id).first();
  if (!team) return json({ error: "Team not found." }, 404);

  if (team.record_type && team.record_type !== "REGISTERED_TEAM") {
    return json({ error: "Imported listings require an approved publication policy before publication." }, 409);
  }

  const previousStatus = team.status;
  await env.TPI_DB.prepare(
    "UPDATE paranormal_teams SET status = 'approved', reviewed_at = datetime('now'), reviewed_by = ? WHERE id = ?"
  ).bind(user.username, id).run();
  await writeAdminAuditLog(env, user, "team.approved", "team", id, { previousStatus, status: "approved", name: team.name });

  return json({ ok: true });
}

async function handleAdminRejectTeam(path, env, user) {
  const id = path.split("/").slice(-2)[0];
  if (!id) return json({ error: "Team ID required." }, 400);

  const team = await env.TPI_DB.prepare("SELECT * FROM paranormal_teams WHERE id = ?").bind(id).first();
  if (!team) return json({ error: "Team not found." }, 404);

  const previousStatus = team.status;
  await env.TPI_DB.prepare(
    "UPDATE paranormal_teams SET status = 'rejected', reviewed_at = datetime('now'), reviewed_by = ? WHERE id = ?"
  ).bind(user.username, id).run();
  await writeAdminAuditLog(env, user, "team.rejected", "team", id, { previousStatus, status: "rejected", name: team.name });

  return json({ ok: true });
}

async function handleAdminSetTeamStatus(path, request, env, user) {
  const id = path.split("/").slice(-2)[0];
  if (!id) return json({ error: "Team ID required." }, 400);

  const data = await readJson(request);
  const status = clean(data.status);
  const validStatuses = ["pending", "approved", "rejected"];

  if (!validStatuses.includes(status)) {
    return json({ error: `Status must be one of: ${validStatuses.join(", ")}` }, 400);
  }

  const team = await env.TPI_DB.prepare("SELECT * FROM paranormal_teams WHERE id = ?").bind(id).first();
  if (!team) return json({ error: "Team not found." }, 404);

  if (status === "approved" && team.record_type && team.record_type !== "REGISTERED_TEAM") {
    return json({ error: "Imported listings require an approved publication policy before publication." }, 409);
  }

  const previousStatus = team.status;
  await env.TPI_DB.prepare(
    "UPDATE paranormal_teams SET status = ?, reviewed_at = datetime('now'), reviewed_by = ? WHERE id = ?"
  ).bind(status, user.username, id).run();
  await writeAdminAuditLog(env, user, `team.${status}`, "team", id, { previousStatus, status, name: team.name });

  return json({ ok: true });
}

// ============================================================
// EVENTS API HANDLERS
// ============================================================

async function handleListEvents(request, env) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const type = clean(url.searchParams.get("type") || "");
  const category = clean(url.searchParams.get("category") || "");

  let query = "SELECT * FROM events WHERE status = 'approved'";
  const binds = [];

  if (type) {
    query += " AND type = ?";
    binds.push(type);
  }
  if (category) {
    query += " AND category = ?";
    binds.push(category);
  }

  query += " ORDER BY start_date ASC, created_at DESC LIMIT ? OFFSET ?";
  binds.push(limit, offset);

  const { results } = await env.TPI_DB.prepare(query).bind(...binds).all();
  return json({ events: results || [] });
}

async function handleGetEvent(path, env) {
  const id = clean(decodeURIComponent(path.replace(/^\/events\//, "")));
  if (!id) return json({ error: "Event id is required." }, 400);
  const event = await env.TPI_DB.prepare("SELECT * FROM events WHERE id = ? AND status = 'approved'").bind(id).first();
  if (!event) return json({ error: "Event not found." }, 404);
  return json({ event });
}

async function handleCreateEvent(request, env, user) {
  const data = await readJson(request);
  const values = eventMutationValues({ ...data, status: "approved" });
  const validationError = validateEventMutation(values);
  if (validationError) return json({ error: validationError }, 400);

  const result = await env.TPI_DB.prepare(`
    INSERT INTO events (title, description, type, category, start_date, end_date,
      location_name, address, city, state, country, is_virtual, virtual_link, platform,
      organizer_name, organizer_url, image_url, max_attendees, price, source, status, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)
  `).bind(
    values.title, values.description, values.type, values.category, values.startDate, values.endDate,
    values.locationName, values.address, values.city, values.state, values.country, values.isVirtual,
    values.virtualLink, values.platform, values.organizerName, values.organizerUrl, values.imageUrl,
    values.maxAttendees, values.price, "admin", values.featured
  ).run();

  await writeAdminAuditLog(env, user, "event.created", "event", String(result.meta?.last_row_id || ""), { title: values.title, status: "approved" });
  return json({ ok: true, id: result.meta?.last_row_id });
}

async function handleCommunityEventSubmit(request, env) {
  const data = await readJson(request);
  if (!data.title || !data.type || !data.email) {
    return json({ error: "Title, type, and email are required." }, 400);
  }

  const result = await env.TPI_DB.prepare(`
    INSERT INTO events (title, description, type, category, start_date, end_date,
      location_name, city, state, country, is_virtual, virtual_link, platform,
      organizer_name, organizer_email, image_url, source, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'community', 'pending')
  `).bind(
    clean(data.title),
    clean(data.description || ""),
    clean(data.type),
    clean(data.category || "paranormal"),
    clean(data.startDate || ""),
    clean(data.endDate || ""),
    clean(data.locationName || ""),
    clean(data.city || ""),
    clean(data.state || ""),
    clean(data.country || "United States"),
    data.isVirtual ? 1 : 0,
    clean(data.virtualLink || ""),
    clean(data.platform || ""),
    clean(data.organizer || ""),
    clean(data.email),
    clean(data.imageUrl || "")
  ).run();

  return json({ ok: true, id: result.meta?.last_row_id, message: "Event submitted for review." });
}

async function handleEventRsvp(path, request, env) {
  const eventId = clean(decodeURIComponent(path.replace(/^\/events\//, "").replace(/\/rsvp$/, "")));
  if (!eventId) return json({ error: "Event id is required." }, 400);

  const event = await env.TPI_DB.prepare("SELECT id FROM events WHERE id = ? AND status = 'approved'").bind(eventId).first();
  if (!event) return json({ error: "Event not found." }, 404);

  return json({ ok: true, message: "RSVP recorded." });
}

async function handleRefreshEvents(env) {
  // Shared scraper (same code path as the daily cron) — see lib/event-scraper.js
  const result = await scrapeAndUpdateEvents(env, { trigger: "manual" });
  return json({ ok: true, scraped: result.scraped, inserted: result.inserted });
}

async function handleListNews(request, env) {
  const url = new URL(request.url);
  const category = clean(url.searchParams.get("category")).toLowerCase();
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "30"), 60);
  const offset = Math.max(parseInt(url.searchParams.get("offset") || "0"), 0);

  let query = "SELECT id, title, excerpt, image_url AS imageUrl, source_url AS sourceUrl, source_name AS sourceName, category, published_at AS publishedAt FROM news_articles WHERE status = 'approved'";
  const binds = [];
  if (category && category !== "all") {
    query += " AND category = ?";
    binds.push(category);
  }
  query += " ORDER BY COALESCE(NULLIF(published_at, ''), scraped_at) DESC LIMIT ? OFFSET ?";
  binds.push(limit, offset);

  const { results } = await env.TPI_DB.prepare(query).bind(...binds).all();
  return json({ news: results || [] });
}

async function handleRefreshNews(env) {
  // Shared scraper (same code path as the cron) — see lib/news-scraper.js
  const result = await scrapeNews(env, { trigger: "manual" });
  return json({ ok: true, ...result });
}

async function handleListVideos(request, env) {
  const url = new URL(request.url);
  const category = clean(url.searchParams.get("category")).toLowerCase();
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "30"), 60);
  const offset = Math.max(parseInt(url.searchParams.get("offset") || "0"), 0);

  let query = "SELECT id, title, description, thumbnail_url AS thumbnailUrl, source_url AS sourceUrl, source_name AS sourceName, channel_name AS channelName, duration_seconds AS durationSeconds, category, published_at AS publishedAt FROM videos WHERE status = 'approved'";
  const binds = [];
  if (category && category !== "all") {
    query += " AND category = ?";
    binds.push(category);
  }
  query += " ORDER BY COALESCE(NULLIF(published_at, ''), scraped_at) DESC LIMIT ? OFFSET ?";
  binds.push(limit, offset);

  const { results } = await env.TPI_DB.prepare(query).bind(...binds).all();
  return json({ videos: results || [] });
}

async function handleRefreshVideos(env) {
  // Shared scraper (same code path as the cron) — see lib/video-scraper.js
  const result = await scrapeVideos(env, { trigger: "manual" });
  return json({ ok: true, ...result });
}

// Scrape run history + provider status for the admin monitoring dashboard
// (admin-advanced-settings.html > Discovery & Scrapers). Sanitized at write
// time by scraper-log.js, so error messages here are display-safe.
async function handleAdminScraperRuns(request, env, user) {
  const url = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "20", 10)), 100);
  const scraperType = clean(url.searchParams.get("type"));
  const where = scraperType ? "WHERE scraper_type = ?" : "";
  const params = scraperType ? [scraperType, limit] : [limit];
  const { results: rawRuns } = await env.TPI_DB.prepare(`
    SELECT id, scraper_type AS scraperType, source, run_trigger AS trigger,
           started_at AS startedAt, completed_at AS completedAt, status,
           items_found AS found, items_inserted AS inserted, items_skipped AS skipped,
           error_count AS errorCount, error_message AS errorMessage, duration_ms AS durationMs,
           metadata_json AS metadataRaw
    FROM scraper_runs ${where}
    ORDER BY started_at DESC
    LIMIT ?
  `).bind(...params).all();
  // Parse the metadata blob (provider query counts, enabled flags) into a
  // plain object; contents are internal counters supplied by the scrapers,
  // never secrets.
  const runs = (rawRuns || []).map((row) => {
    let metadata = null;
    if (row.metadataRaw) {
      try { metadata = JSON.parse(row.metadataRaw); } catch (e) { metadata = null; }
    }
    const { metadataRaw, ...rest } = row;
    return { ...rest, metadata };
  });

  // Latest per-scraper last-run summary. Last completed run per type (and
  // per video provider) so the dashboard reflects reality, not an
  // in-progress run.
  const all = await env.TPI_DB.prepare(`
    SELECT scraper_type, source, status, started_at, completed_at,
           items_found, items_inserted, error_count, duration_ms
    FROM scraper_runs
    ORDER BY started_at DESC
    LIMIT 200
  `).all();
  const latest = {};
  for (const row of (all.results || [])) {
    const key = row.source ? `${row.scraper_type}/${row.source}` : row.scraper_type;
    if (!latest[key] && row.completed_at) latest[key] = row;
  }

  return json({
    runs,
    latest,
    providers: PROVIDER_STATUS,
  }, 200, { "Cache-Control": "no-store" });
}
