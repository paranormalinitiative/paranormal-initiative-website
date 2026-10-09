import { SESSION_COOKIE, getCookie, getSessionUser } from "../../lib/auth.js";
import { scrapeAndUpdateEvents } from "../../lib/event-scraper.js";
import { scrapeNews } from "../../lib/news-scraper.js";
import { scrapeVideos, PROVIDER_STATUS } from "../../lib/video-scraper.js";

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
    if (request.method === "GET" && path === "/me/pulse") return requireMember(request, env, user => handleMyPulse(request, env, user));
    if (request.method === "POST" && path === "/auth/login") return handleLogin(request, env);
    if (request.method === "POST" && path === "/auth/logout") return handleLogout();
    if (request.method === "POST" && path === "/auth/password-reset/request") return handlePasswordResetRequest(request, env);
    if (request.method === "POST" && path === "/members/register") return handleMemberRegister(request, env);
    if (request.method === "POST" && path === "/owner/bootstrap") return handleOwnerBootstrap(request, env);
    if (request.method === "GET" && path === "/invites") return requireAdmin(request, env, user => handleListInvites(env, user));
    if (request.method === "POST" && path === "/invites") return requireAdmin(request, env, user => handleCreateInvite(request, env, user));
    if (request.method === "GET" && path === "/admin/contributors") return requireAdmin(request, env, user => handleListContributors(env, user));
    if (request.method === "POST" && path === "/admin/contributors/title") return requireAdmin(request, env, user => handleUpdateContributorTitle(request, env, user));
    if (request.method === "GET" && path === "/admin/members") return requireAdmin(request, env, user => handleAdminListMembers(request, env, user));
    if (request.method === "GET" && path.match(/^\/admin\/members\/[^/]+\/activity$/)) return requireAdmin(request, env, user => handleAdminMemberActivity(path, env, user));
    if (request.method === "POST" && path.match(/^\/admin\/members\/[^/]+\/access$/)) return requireAdmin(request, env, user => handleAdminUpdateMemberAccess(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/admin\/members\/[^/]+\/notifications$/)) return requireAdmin(request, env, user => handleAdminSendMemberNotification(path, request, env, user));
    if (request.method === "POST" && path.startsWith("/admin/members/") && path.endsWith("/block")) return requireAdmin(request, env, user => handleAdminSetMemberActive(path, env, user, false));
    if (request.method === "POST" && path.startsWith("/admin/members/") && path.endsWith("/unblock")) return requireAdmin(request, env, user => handleAdminSetMemberActive(path, env, user, true));
    if (request.method === "GET" && path === "/admin/community/posts") return requireAdmin(request, env, user => handleAdminCommunityPosts(request, env, user));
    if (request.method === "POST" && path.match(/^\/admin\/community\/posts\/[^/]+\/status$/)) return requireAdmin(request, env, user => handleAdminSetCommunityPostStatus(path, request, env, user));
    if (request.method === "GET" && path === "/admin/comments") return requireAdmin(request, env, user => handleAdminListComments(request, env, user));
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
    if (request.method === "GET" && path === "/room-codes/current") return handleRoomCodeCurrent(env);
    if (request.method === "POST" && path === "/room-codes/current/close") return handleRoomCodeClose(env);
    if (request.method === "GET" && path.match(/^\/room-codes\/[^/]+$/)) return handleRoomCodeValidate(path, env);
    if (request.method === "GET" && path.match(/^\/rooms\/([^/]+)\/guests$/)) return handleRoomListGuests(path, env);
    if (request.method === "POST" && path.match(/^\/rooms\/([^/]+)\/guests$/)) return handleRoomUpsertGuest(path, request, env);
    if (request.method === "DELETE" && path.match(/^\/rooms\/([^/]+)\/guests\/[^/]+$/)) return handleRoomRemoveGuest(path, env);
    if (request.method === "GET" && path.match(/^\/rooms\/([^/]+)\/status$/)) return handleRoomStatus(path, env);
    if (request.method === "POST" && path.match(/^\/rooms\/([^/]+)\/signals$/)) return handleRoomPostSignal(path, request, env);
    if (request.method === "GET" && path.match(/^\/rooms\/([^/]+)\/signals$/)) return handleRoomGetSignals(path, request, env);
    if (request.method === "POST" && path === "/studio/rooms") return requireContributor(request, env, user => handleCreateStudioRoom(request, env, user));
    if (request.method === "POST" && path.match(/^\/studio\/rooms\/[^/]+\/guest-token$/)) return handleStudioGuestToken(path, request, env);
    if (request.method === "POST" && path.match(/^\/studio\/rooms\/[^/]+\/close$/)) return requireContributor(request, env, user => handleCloseStudioRoom(path, env, user));
    if (request.method === "POST" && path.match(/^\/studio\/rooms\/[^/]+\/livestream\/start$/)) return requireContributor(request, env, user => handleStartStudioLivestream(path, request, env, user));
    if (request.method === "POST" && path.match(/^\/studio\/rooms\/[^/]+\/livestream\/stop$/)) return requireContributor(request, env, user => handleStopStudioLivestream(path, env, user));
    if (request.method === "GET" && path.startsWith("/media/")) return handleMediaRequest(path, env);
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
    if (request.method === "GET" && path === "/tpi-videos") return handleListTpiVideos(request, env);
    if (request.method === "GET" && path.match(/^\/tpi-videos\/[^/]+$/)) return handleGetTpiVideo(path, env);
    if (request.method === "POST" && path === "/tpi-videos") return requireContributor(request, env, user => handleCreateTpiVideo(request, env, user));
    if (request.method === "PUT" && path.match(/^\/tpi-videos\/[^/]+$/)) return requireContributor(request, env, user => handleUpdateTpiVideo(path, request, env, user));
    if (request.method === "DELETE" && path.match(/^\/tpi-videos\/[^/]+$/)) return requireContributor(request, env, user => handleDeleteTpiVideo(path, env, user));
    if (request.method === "GET" && path === "/video-reactions") return handleGetVideoReactions(request, env);
    if (request.method === "POST" && path === "/video-reactions") return requireMember(request, env, user => handleSetVideoReaction(request, env, user));
    if (request.method === "GET" && path === "/video-saves") return requireMember(request, env, user => handleGetVideoSaves(env, user));
    if (request.method === "POST" && path === "/video-saves") return requireMember(request, env, user => handleToggleVideoSave(request, env, user));
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
  return json({ user: user ? privateMemberUser(user) : null });
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

async function handleListInvites(env) {
  const { results } = await env.TPI_DB.prepare("SELECT code, role, used, used_by, used_at, created_at FROM invite_codes ORDER BY created_at DESC").all();
  return json({ invites: results });
}

async function handleListContributors(env) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT username, display_name, title, role, correspondence, active, created_at
    FROM contributors
    ORDER BY active DESC, display_name COLLATE NOCASE, username COLLATE NOCASE
  `).all();
  return json({ contributors: results.map(publicUser) });
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

  const updated = await getUserByUsername(env, username);
  return json({ contributor: publicUser(updated) });
}

async function handleAdminListMembers(request, env) {
  const url = new URL(request.url);
  const search = clean(url.searchParams.get("search")).slice(0, 80);
  const like = `%${search}%`;
  const stmt = search
    ? env.TPI_DB.prepare(`
      SELECT
        c.username,
        c.display_name AS displayName,
        c.title,
        c.role,
        c.active,
        c.created_at AS createdAt,
        COUNT(DISTINCT cp.id) AS topicCount,
        COUNT(DISTINCT cm.id) AS postCount
      FROM contributors c
      LEFT JOIN community_posts cp ON cp.author_id = c.id AND cp.status != 'deleted'
      LEFT JOIN community_comments cm ON cm.author_id = c.id AND cm.status = 'visible'
      WHERE c.username LIKE ? OR c.display_name LIKE ? OR c.title LIKE ? OR c.role LIKE ?
      GROUP BY c.id
      ORDER BY c.active DESC, c.display_name COLLATE NOCASE, c.username COLLATE NOCASE
      LIMIT 100
    `).bind(like, like, like, like)
    : env.TPI_DB.prepare(`
      SELECT
        c.username,
        c.display_name AS displayName,
        c.title,
        c.role,
        c.active,
        c.created_at AS createdAt,
        COUNT(DISTINCT cp.id) AS topicCount,
        COUNT(DISTINCT cm.id) AS postCount
      FROM contributors c
      LEFT JOIN community_posts cp ON cp.author_id = c.id AND cp.status != 'deleted'
      LEFT JOIN community_comments cm ON cm.author_id = c.id AND cm.status = 'visible'
      GROUP BY c.id
      ORDER BY c.active DESC, c.display_name COLLATE NOCASE, c.username COLLATE NOCASE
      LIMIT 100
    `);
  const { results } = await stmt.all();
  return json({
    members: results.map(member => ({
      ...member,
      active: Boolean(member.active),
      topicCount: Number(member.topicCount || 0),
      postCount: Number(member.postCount || 0)
    }))
  });
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
  const username = clean(new URL(request.url).searchParams.get("username"));
  if (!username) return json({ error: "Member username is required." }, 400);
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

async function handleAdminSetCommunityPostStatus(path, request, env) {
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

  return json({ post: { id: post.id, title: post.title, status } });
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
  return json({ settings: await getSiteSettings(env) });
}

async function handleAdminMemberActivity(path, env) {
  const username = clean(decodeURIComponent(path.match(/^\/admin\/members\/([^/]+)\/activity$/)?.[1] || ""));
  if (!username) return json({ error: "Member username is required." }, 400);
  const member = await getUserByUsername(env, username);
  if (!member) return json({ error: "Member was not found." }, 404);

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
    LIMIT 100
  `).bind(member.id).all();

  const { results: commentResultsRows } = await env.TPI_DB.prepare(`
    SELECT
      cm.id,
      cm.body,
      cm.status,
      cm.created_at AS createdAt
    FROM community_comments cm
    WHERE cm.author_id = ?
    ORDER BY cm.created_at DESC
    LIMIT 100
  `).bind(member.id).all();

  const { results: videoResults } = await env.TPI_DB.prepare(`
    SELECT id, slug, title, category, status, published_at AS publishedAt, created_at AS createdAt, thumbnail, video_url AS videoUrl
    FROM tpi_videos
    WHERE created_by = ?
    ORDER BY created_at DESC
    LIMIT 100
  `).bind(member.id).all();

  const { results: articleResults } = await env.TPI_DB.prepare(`
    SELECT id, destination, href, title, subtitle, article_type AS contributionType, author, source, labels, status, created_at AS createdAt, updated_at AS updatedAt
    FROM articles
    WHERE created_by = ? OR lower(author) IN (lower(?), lower(?))
    ORDER BY COALESCE(updated_at, created_at) DESC
    LIMIT 200
  `).bind(member.id, member.display_name || "", member.username || "").all();

  const { results: commentResults } = await env.TPI_DB.prepare(`
    SELECT id, page_id AS pageId, parent_id AS parentId, name, author_title AS authorTitle, text, status, created_at AS createdAt
    FROM comments
    WHERE contributor_id = ?
    ORDER BY created_at DESC
    LIMIT 100
  `).bind(member.id).all();

  const { results: videoCommentResults } = await env.TPI_DB.prepare(`
    SELECT vc.id, vc.video_id AS videoId, vc.body, vc.status, vc.created_at AS createdAt, tv.slug AS videoSlug, tv.title AS videoTitle
    FROM video_comments vc
    LEFT JOIN tpi_videos tv ON tv.id = vc.video_id
    WHERE vc.contributor_id = ?
    ORDER BY vc.created_at DESC
    LIMIT 100
  `).bind(member.id).all();

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

  const { results: conversationRows } = await env.TPI_DB.prepare(`
    SELECT c.id, c.title, c.direct, c.created_at AS createdAt, c.updated_at AS updatedAt,
           cp.hidden_at AS hiddenAt, cp.archived_at AS archivedAt
    FROM conversations c
    JOIN conversation_participants cp ON cp.conversation_id = c.id
    WHERE cp.contributor_id = ?
    ORDER BY c.updated_at DESC
    LIMIT 100
  `).bind(member.id).all();
  const conversations = [];
  for (const conversation of conversationRows || []) {
    const { results: messageRows } = await env.TPI_DB.prepare(`
      SELECT m.id, m.body, m.attachments, m.created_at AS createdAt, m.edited_at AS editedAt, m.deleted_at AS deletedAt,
             author.username AS authorUsername, author.display_name AS authorDisplayName
      FROM messages m
      LEFT JOIN contributors author ON author.id = m.contributor_id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
      LIMIT 500
    `).bind(conversation.id).all();
    conversations.push({
      ...conversation,
      direct: Boolean(conversation.direct),
      hidden: Boolean(conversation.hiddenAt),
      members: await getConversationMembers(env, conversation.id),
      messages: (messageRows || []).map(message => ({
        ...message,
        attachments: safeJsonParse(message.attachments),
        deleted: Boolean(message.deletedAt)
      }))
    });
  }

  return json({
    member: privateMemberUser(member),
    posts,
    photos,
    communityVideos,
    tpiVideos: videoResults || [],
    articles: articleResults || [],
    comments: commentResults || [],
    videoComments: videoCommentResults || [],
    conversations
  });
}

// ===== Admin: member community activity + post status =====

async function handleAdminListComments(request, env) {
  const url = new URL(request.url);
  const status = clean(url.searchParams.get("status") || "pending");
  const allowedStatus = ["pending", "approved"].includes(status) ? status : "pending";
  const { results } = await env.TPI_DB.prepare(`
    SELECT cm.id, cm.page_id AS pageId, cm.parent_id AS parentId, cm.name, cm.author_title AS authorTitle, c.username AS authorUsername, cm.text, cm.status, cm.created_at AS createdAt
    FROM comments cm
    LEFT JOIN contributors c ON c.id = cm.contributor_id
    WHERE cm.status = ?
    ORDER BY cm.created_at DESC
    LIMIT 100
  `).bind(allowedStatus).all();
  return json({ comments: results });
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
    customMetadata: { contributorId: user.id, purpose: "profile-photo" }
  });
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
    customMetadata: { contributorId: user.id, purpose }
  });
  return json({ url: `/api/media/${key}`, key, contentType: upload.type, name: upload.name });
}

async function handleMediaRequest(path, env) {
  if (!env.TPI_MEDIA) return json({ error: "R2 media bucket binding TPI_MEDIA is not configured yet." }, 501);
  const key = decodeURIComponent(path.replace(/^\/media\//, ""));
  if (!key || key.includes("..")) return json({ error: "Media key is invalid." }, 400);
  const object = await env.TPI_MEDIA.get(key);
  if (!object) return json({ error: "Media file not found." }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
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

async function handleListArticles(request, env) {
  const url = new URL(request.url);
  const destination = clean(url.searchParams.get("destination"));
  const destinationAlt = destination.endsWith(".html")
    ? destination.replace(/\.html$/, "")
    : `${destination}.html`;
  const stmt = destination
    ? env.TPI_DB.prepare(`
      SELECT a.id, a.destination, a.href, a.title, a.subtitle, a.article_type AS contributionType, a.author, c.username AS authorUsername, c.display_name AS authorDisplayName, a.source, a.body_html AS bodyHtml, a.article_html AS articleHtml, a.labels, a.status, a.created_at AS createdAt, a.updated_at AS updatedAt
      FROM articles a
      LEFT JOIN contributors c ON c.id = a.created_by
      WHERE a.destination IN (?, ?) AND a.status = 'published'
      ORDER BY COALESCE(a.updated_at, a.created_at) DESC
    `).bind(destination, destinationAlt)
    : env.TPI_DB.prepare(`
      SELECT a.id, a.destination, a.href, a.title, a.subtitle, a.article_type AS contributionType, a.author, c.username AS authorUsername, c.display_name AS authorDisplayName, a.source, a.body_html AS bodyHtml, a.article_html AS articleHtml, a.labels, a.status, a.created_at AS createdAt, a.updated_at AS updatedAt
      FROM articles a
      LEFT JOIN contributors c ON c.id = a.created_by
      WHERE a.status = 'published'
      ORDER BY COALESCE(a.updated_at, a.created_at) DESC
    `);
  const { results } = await stmt.all();
  return json({ articles: results });
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

async function handleListVideoComments(request, env) {
  const url = new URL(request.url);
  const videoId = clean(url.searchParams.get("videoId"));
  if (!videoId) return json({ error: "videoId is required." }, 400);

  const { results } = await env.TPI_DB.prepare(`
    SELECT vc.id, vc.video_id AS videoId, vc.body, vc.status, vc.created_at AS createdAt,
           c.username, c.display_name AS displayName, c.role
    FROM video_comments vc
    JOIN contributors c ON c.id = vc.contributor_id
    WHERE vc.video_id = ? AND vc.status = 'visible'
    ORDER BY vc.created_at DESC
  `).bind(videoId).all();

  return json({ comments: results });
}

async function handleCreateVideoComment(request, env, user) {
  const accessError = await getMemberActionAccessError(env, user, "comment");
  if (accessError) return json({ error: accessError }, 403);
  const data = await readJson(request);
  const videoId = clean(data.videoId);
  const body = clean(data.body);

  if (!videoId) return json({ error: "videoId is required." }, 400);
  if (!body) return json({ error: "Comment body is required." }, 400);
  if (body.length > 2000) return json({ error: "Comment must be 2000 characters or fewer." }, 400);

  const id = crypto.randomUUID();
  await env.TPI_DB.prepare(`
    INSERT INTO video_comments (id, video_id, contributor_id, body, status)
    VALUES (?, ?, ?, ?, 'visible')
  `).bind(id, videoId, user.id, body).run();

  return json({ ok: true, id });
}

async function handleListTpiVideos(request, env) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");
  const featured = url.searchParams.get("featured");
  const isLive = url.searchParams.get("isLive");

  let query = "SELECT * FROM tpi_videos WHERE 1=1";
  const params = [];

  if (status) {
    query += " AND status = ?";
    params.push(status);
  } else {
    query += " AND status = 'published'";
  }
  if (category) {
    query += " AND category = ?";
    params.push(category);
  }
  if (featured === "true") {
    query += " AND featured = 1";
  }
  if (isLive === "true") {
    query += " AND is_live = 1";
  }

  query += " ORDER BY published_at DESC";

  const stmt = params.length
    ? env.TPI_DB.prepare(query).bind(...params)
    : env.TPI_DB.prepare(query);
  const { results } = await stmt.all();

  return json({
    videos: results.map(row => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      publishedAt: row.published_at,
      category: row.category,
      tags: row.tags ? row.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      platform: row.platform,
      videoUrl: row.video_url,
      embedUrl: row.embed_url,
      thumbnail: row.thumbnail,
      featured: Boolean(row.featured),
      isLive: Boolean(row.is_live),
      liveStartedAt: row.live_started_at,
      series: row.series,
      episode: row.episode,
      duration: row.duration,
      viewingAccess: row.viewing_access || "members",
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  });
}

async function handleGetTpiVideo(path, env) {
  const slug = clean(decodeURIComponent(path.replace(/^\/tpi-videos\//, "")));
  if (!slug) return json({ error: "Video slug is required." }, 400);

  const row = await env.TPI_DB.prepare("SELECT * FROM tpi_videos WHERE slug = ?").bind(slug).first();
  if (!row) return json({ error: "Video not found." }, 404);

  return json({
    video: {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      publishedAt: row.published_at,
      category: row.category,
      tags: row.tags ? row.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      platform: row.platform,
      videoUrl: row.video_url,
      embedUrl: row.embed_url,
      thumbnail: row.thumbnail,
      featured: Boolean(row.featured),
      isLive: Boolean(row.is_live),
      liveStartedAt: row.live_started_at,
      series: row.series,
      episode: row.episode,
      duration: row.duration,
      viewingAccess: row.viewing_access || "members",
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  });
}

async function handleCreateTpiVideo(request, env, user) {
  const data = await readJson(request);
  const title = clean(data.title);
  const videoUrl = clean(data.videoUrl);
  if (!title) return json({ error: "Title is required." }, 400);
  if (!videoUrl) return json({ error: "Video URL is required." }, 400);

  const slug = clean(data.slug) || slugify(title);
  const existing = await env.TPI_DB.prepare("SELECT id FROM tpi_videos WHERE slug = ?").bind(slug).first();
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const id = clean(data.id) || crypto.randomUUID();
  const now = new Date().toISOString();
  const publishedAt = clean(data.publishedAt) || now;
  const category = clean(data.category) || "Applied Paranormal Research and Studies";
  const tags = Array.isArray(data.tags) ? data.tags.join(", ") : clean(data.tags);
  const platform = clean(data.platform) || detectPlatform(videoUrl);
  const status = data.status === "published" ? "published" : "draft";
  const viewingAccess = data.viewingAccess === "public" ? "public" : "members";

  await env.TPI_DB.prepare(`
    INSERT INTO tpi_videos (id, slug, title, description, published_at, category, tags, platform, video_url, embed_url, thumbnail, featured, is_live, live_started_at, series, episode, duration, viewing_access, status, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, finalSlug, title,
    clean(data.description),
    publishedAt, category, tags, platform,
    videoUrl, clean(data.embedUrl), clean(data.thumbnail),
    data.featured ? 1 : 0,
    data.isLive ? 1 : 0,
    clean(data.liveStartedAt),
    clean(data.series), clean(data.episode), clean(data.duration),
    viewingAccess,
    status, user.id, now, now
  ).run();

  if (status === "published") {
    await notifyActiveMembers(env, {
      title: `New video: ${title}`,
      body: clean(data.description) || category,
      actionHref: `tpi-video.html?id=${encodeURIComponent(finalSlug)}`,
      type: "video",
      createdBy: user.id,
      excludeContributorId: user.id
    });
  }

  return json({ ok: true, id, slug: finalSlug, status });
}

async function handleUpdateTpiVideo(path, request, env, user) {
  const slug = clean(decodeURIComponent(path.replace(/^\/tpi-videos\//, "")));
  if (!slug) return json({ error: "Video slug is required." }, 400);

  const existing = await env.TPI_DB.prepare("SELECT * FROM tpi_videos WHERE slug = ?").bind(slug).first();
  if (!existing) return json({ error: "Video not found." }, 404);

  const data = await readJson(request);
  const now = new Date().toISOString();
  const title = clean(data.title) || existing.title;
  const videoUrl = clean(data.videoUrl) || existing.video_url;
  const category = clean(data.category) || existing.category;
  const tags = data.tags !== undefined ? (Array.isArray(data.tags) ? data.tags.join(", ") : clean(data.tags)) : existing.tags;
  const platform = clean(data.platform) || detectPlatform(videoUrl);
  const status = data.status !== undefined ? (data.status === "published" ? "published" : "draft") : existing.status;

  let newSlug = existing.slug;
  if (data.slug && clean(data.slug) !== existing.slug) {
    const desiredSlug = clean(data.slug);
    const slugTaken = await env.TPI_DB.prepare("SELECT id FROM tpi_videos WHERE slug = ? AND id != ?").bind(desiredSlug, existing.id).first();
    newSlug = slugTaken ? `${desiredSlug}-${Date.now()}` : desiredSlug;
  }

  await env.TPI_DB.prepare(`
    UPDATE tpi_videos SET
      slug = ?, title = ?, description = ?, published_at = ?, category = ?, tags = ?,
      platform = ?, video_url = ?, embed_url = ?, thumbnail = ?, featured = ?,
      is_live = ?, live_started_at = ?, series = ?, episode = ?, duration = ?,
      viewing_access = ?, status = ?, updated_at = ?
    WHERE id = ?
  `).bind(
    newSlug, title,
    clean(data.description) ?? existing.description,
    clean(data.publishedAt) || existing.published_at,
    category, tags, platform,
    videoUrl,
    clean(data.embedUrl) ?? existing.embed_url,
    clean(data.thumbnail) ?? existing.thumbnail,
    data.featured !== undefined ? (data.featured ? 1 : 0) : existing.featured,
    data.isLive !== undefined ? (data.isLive ? 1 : 0) : existing.is_live,
    clean(data.liveStartedAt) ?? existing.live_started_at,
    clean(data.series) ?? existing.series,
    clean(data.episode) ?? existing.episode,
    clean(data.duration) ?? existing.duration,
    data.viewingAccess === "public" ? "public" : (data.viewingAccess === "members" ? "members" : existing.viewing_access),
    status, now, existing.id
  ).run();

  if (status === "published" && existing.status !== "published") {
    await notifyActiveMembers(env, {
      title: `New video: ${title}`,
      body: clean(data.description) || existing.description || category,
      actionHref: `tpi-video.html?id=${encodeURIComponent(newSlug)}`,
      type: "video",
      createdBy: user.id,
      excludeContributorId: user.id
    });
  }

  return json({ ok: true, id: existing.id, slug: newSlug, status });
}

async function handleDeleteTpiVideo(path, env, user) {
  const slug = clean(decodeURIComponent(path.replace(/^\/tpi-videos\//, "")));
  if (!slug) return json({ error: "Video slug is required." }, 400);

  const existing = await env.TPI_DB.prepare("SELECT id FROM tpi_videos WHERE slug = ?").bind(slug).first();
  if (!existing) return json({ error: "Video not found." }, 404);

  await env.TPI_DB.prepare("DELETE FROM tpi_videos WHERE id = ?").bind(existing.id).run();
  return json({ ok: true, deleted: true, id: existing.id });
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
  const { results } = await env.TPI_DB.prepare(`
    SELECT vs.video_id AS videoId, vs.created_at AS savedAt,
           tv.title, tv.slug, tv.thumbnail, tv.category, tv.duration, tv.published_at AS publishedAt
    FROM video_saves vs
    JOIN tpi_videos tv ON tv.id = vs.video_id
    WHERE vs.contributor_id = ? AND tv.status = 'published'
    ORDER BY vs.created_at DESC
  `).bind(user.id).all();
  return json({ saves: results });
}

async function handleToggleVideoSave(request, env, user) {
  const data = await readJson(request);
  const videoId = clean(data.videoId);
  if (!videoId) return json({ error: "videoId is required." }, 400);

  const existing = await env.TPI_DB.prepare(`
    SELECT id FROM video_saves WHERE video_id = ? AND contributor_id = ? LIMIT 1
  `).bind(videoId, user.id).first();

  if (existing) {
    await env.TPI_DB.prepare("DELETE FROM video_saves WHERE id = ?").bind(existing.id).run();
    return json({ videoId, saved: false });
  } else {
    await env.TPI_DB.prepare("INSERT INTO video_saves (id, video_id, contributor_id) VALUES (?, ?, ?)")
      .bind(crypto.randomUUID(), videoId, user.id).run();
    return json({ videoId, saved: true });
  }
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

async function handleStudioGuestToken(path, request, env) {
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

function privateMemberUser(user) {
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
    theme: user.theme
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
  video: "videos", photo: "photos",
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
    details: row.details,
    additionalStates: row.additional_states ? JSON.parse(row.additional_states) : [],
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
  return json({ team: teamRowToPublic(row) }, 200, { "Cache-Control": "public, max-age=300" });
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
      areas_served, specialties, details, additional_states,
      submitter_name, submitter_email, heard_about, submitted_ip, record_type
    ) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'REGISTERED_TEAM')
  `).bind(
    id, scope, name, clean(data.acronym), clean(data.address), city,
    clean(data.state), clean(data.country), clean(data.zip),
    clean(data.contactName), clean(data.phone), clean(data.phoneAlt),
    clean(data.fax), email, clean(data.emailAlt), clean(data.website),
    clean(data.facebook), clean(data.twitter), clean(data.youtube),
    clean(data.founder), clean(data.yearFounded), clean(data.members),
    clean(data.areasServed), clean(data.specialties), clean(data.details),
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

async function handleGetTeamLinks(path, env) {
  const id = path.split("/").slice(-2)[0];
  if (!id) return json({ error: "Team ID required." }, 400);

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

  // Validate URL format
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    return json({ error: "Invalid URL format." }, 400);
  }

  const linkId = crypto.randomUUID();
  await env.TPI_DB.prepare(`
    INSERT INTO organization_links (id, team_id, platform, url, link_type, discovery_source)
    VALUES (?, ?, ?, ?, ?, 'manual')
  `).bind(linkId, id, platform, url.startsWith("http") ? url : `https://${url}`, linkType).run();

  return json({ ok: true, id: linkId }, 201);
}

async function handleGetTeamVerification(path, env) {
  const id = path.split("/").slice(-2)[0];
  if (!id) return json({ error: "Team ID required." }, 400);

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
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500);
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const validStatuses = ["pending", "approved", "rejected"];
  if (!validStatuses.includes(status)) {
    return json({ error: `Status must be one of: ${validStatuses.join(", ")}` }, 400);
  }

  const rows = await env.TPI_DB.prepare(
    "SELECT * FROM paranormal_teams WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
  ).bind(status, limit, offset).all();

  return json({ teams: (rows.results || []).map(teamRowToAdmin) });
}

async function handleAdminDeleteTeam(path, env, user) {
  const id = path.split("/").pop();
  if (!id) return json({ error: "Team ID required." }, 400);

  const team = await env.TPI_DB.prepare("SELECT * FROM paranormal_teams WHERE id = ?").bind(id).first();
  if (!team) return json({ error: "Team not found." }, 404);

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

  await env.TPI_DB.prepare(
    "UPDATE paranormal_teams SET status = 'approved', reviewed_at = datetime('now'), reviewed_by = ? WHERE id = ?"
  ).bind(user.username, id).run();

  return json({ ok: true });
}

async function handleAdminRejectTeam(path, env, user) {
  const id = path.split("/").slice(-2)[0];
  if (!id) return json({ error: "Team ID required." }, 400);

  const team = await env.TPI_DB.prepare("SELECT * FROM paranormal_teams WHERE id = ?").bind(id).first();
  if (!team) return json({ error: "Team not found." }, 404);

  await env.TPI_DB.prepare(
    "UPDATE paranormal_teams SET status = 'rejected', reviewed_at = datetime('now'), reviewed_by = ? WHERE id = ?"
  ).bind(user.username, id).run();

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

  await env.TPI_DB.prepare(
    "UPDATE paranormal_teams SET status = ?, reviewed_at = datetime('now'), reviewed_by = ? WHERE id = ?"
  ).bind(status, user.username, id).run();

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
  if (!data.title) return json({ error: "Title is required." }, 400);

  const result = await env.TPI_DB.prepare(`
    INSERT INTO events (title, description, type, category, start_date, end_date,
      location_name, city, state, country, is_virtual, virtual_link, image_url,
      organizer_name, source, status, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)
  `).bind(
    clean(data.title),
    clean(data.description || ""),
    clean(data.type || "other"),
    clean(data.category || "paranormal"),
    clean(data.startDate || ""),
    clean(data.endDate || ""),
    clean(data.locationName || ""),
    clean(data.city || ""),
    clean(data.state || ""),
    clean(data.country || "United States"),
    data.isVirtual ? 1 : 0,
    clean(data.virtualLink || ""),
    clean(data.imageUrl || ""),
    clean(data.organizerName || ""),
    clean(data.source || "admin"),
    data.featured ? 1 : 0
  ).run();

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
