const SESSION_COOKIE = "tpi_session";

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
    if (request.method === "POST" && path.startsWith("/admin/members/") && path.endsWith("/block")) return requireAdmin(request, env, user => handleAdminSetMemberActive(path, env, user, false));
    if (request.method === "POST" && path.startsWith("/admin/members/") && path.endsWith("/unblock")) return requireAdmin(request, env, user => handleAdminSetMemberActive(path, env, user, true));
    if (request.method === "GET" && path === "/admin/forum/posts") return requireAdmin(request, env, user => handleAdminMemberForumPosts(request, env, user));
    if (request.method === "POST" && path.match(/^\/admin\/forum\/topics\/[^/]+\/status$/)) return requireAdmin(request, env, user => handleAdminSetForumTopicStatus(path, request, env, user));
    if (request.method === "GET" && path === "/admin/comments") return requireAdmin(request, env, user => handleAdminListComments(request, env, user));
    if (request.method === "POST" && path.startsWith("/admin/comments/") && path.endsWith("/approve")) return requireAdmin(request, env, user => handleAdminApproveComment(path, env, user));
    if (request.method === "DELETE" && path.startsWith("/admin/comments/")) return requireAdmin(request, env, user => handleAdminDeleteComment(path, env, user));
    if (request.method === "POST" && path === "/invites/check") return handleCheckInvite(request, env);
    if (request.method === "POST" && path === "/contributors/register") return handleRegister(request, env);
    if (request.method === "POST" && path === "/contributors/me/profile") return requireMember(request, env, user => handleUpdateProfile(request, env, user));
    if (request.method === "POST" && path === "/contributors/me/username") return requireMember(request, env, user => handleUpdateUsername(request, env, user));
    if (request.method === "POST" && path === "/contributors/me/password") return requireMember(request, env, user => handleChangePassword(request, env, user));
    if (request.method === "GET" && path === "/contributors/me/articles") return requireMember(request, env, user => handleContributorArticles(env, user));
    if (request.method === "GET" && path === "/contributors") return handleListPublicContributors(env);
    if (request.method === "GET" && path === "/contributors/profile") return handlePublicContributorProfile(request, env);
    if (request.method === "POST" && path === "/uploads/profile-photo") return requireMember(request, env, user => handleProfilePhotoUpload(request, env, user));
    if (request.method === "POST" && path === "/uploads/forum-media") return requireMember(request, env, user => handleForumMediaUpload(request, env, user));
    if (request.method === "POST" && path === "/uploads/article-media") return requireContributor(request, env, user => handleArticleMediaUpload(request, env, user));
    if (request.method === "GET" && path.startsWith("/media/")) return handleMediaRequest(path, env);
    if (request.method === "GET" && path === "/articles") return handleListArticles(request, env);
    if (request.method === "POST" && path === "/articles") return requireContributor(request, env, user => handleCreateArticle(request, env, user));
    if (request.method === "DELETE" && path.startsWith("/articles/")) return requireContributor(request, env, user => handleDeleteArticle(path, env, user));
    if (request.method === "GET" && path === "/forum") return handleForumIndex(request, env);
    if (request.method === "GET" && path.startsWith("/forum/topics/")) return handleForumTopic(path, env);
    if (request.method === "POST" && path.match(/^\/forum\/topics\/[^/]+\/read$/)) return requireMember(request, env, user => handleMarkForumTopicRead(path, env, user));
    if (request.method === "POST" && path === "/forum/topics") return requireMember(request, env, user => handleCreateForumTopic(request, env, user));
    if (request.method === "POST" && path.match(/^\/forum\/topics\/[^/]+\/posts$/)) return requireMember(request, env, user => handleCreateForumPost(path, request, env, user));
    if (request.method === "DELETE" && path.startsWith("/forum/posts/")) return requireMember(request, env, user => handleDeleteForumPost(path, env, user));
    if (request.method === "GET" && path === "/comments") return handleListComments(request, env);
    if (request.method === "POST" && path === "/comments") return handleCreateComment(request, env);

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

  return json({ user: publicUser(user) }, 200, {
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
  return json({ user: user ? publicUser(user) : null });
}

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
    INSERT INTO contributors (id, username, password_hash, display_name, title, role, correspondence, affiliation, organization, website, bio, photo_url, comment_signature_enabled, active)
    VALUES (?, ?, ?, ?, ?, 'member', ?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(
    id,
    username,
    await hashPassword(password),
    displayName,
    clean(data.title || "Member"),
    email,
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
  if (role === "owner" && user.role !== "owner") {
    return json({ error: "Only the owner can create a Director invite." }, 403);
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
        COUNT(DISTINCT ft.id) AS topicCount,
        COUNT(DISTINCT fp.id) AS postCount
      FROM contributors c
      LEFT JOIN forum_topics ft ON ft.created_by = c.id AND ft.status != 'deleted'
      LEFT JOIN forum_posts fp ON fp.contributor_id = c.id AND fp.status = 'visible'
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
        COUNT(DISTINCT ft.id) AS topicCount,
        COUNT(DISTINCT fp.id) AS postCount
      FROM contributors c
      LEFT JOIN forum_topics ft ON ft.created_by = c.id AND ft.status != 'deleted'
      LEFT JOIN forum_posts fp ON fp.contributor_id = c.id AND fp.status = 'visible'
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

async function handleAdminMemberForumPosts(request, env) {
  const username = clean(new URL(request.url).searchParams.get("username"));
  if (!username) return json({ error: "Member username is required." }, 400);
  const member = await getUserByUsername(env, username);
  if (!member) return json({ error: "Member was not found." }, 404);

  const { results } = await env.TPI_DB.prepare(`
    SELECT
      fp.id,
      fp.topic_id AS topicId,
      fp.body,
      fp.status,
      fp.created_at AS createdAt,
      ft.title AS topicTitle,
      ft.status AS topicStatus,
      fc.title AS categoryTitle
    FROM forum_posts fp
    JOIN forum_topics ft ON ft.id = fp.topic_id
    JOIN forum_categories fc ON fc.id = ft.category_id
    WHERE fp.contributor_id = ?
    ORDER BY fp.created_at DESC
    LIMIT 100
  `).bind(member.id).all();

  return json({
    member: { username: member.username, displayName: member.display_name, title: member.title, role: member.role, active: Boolean(member.active) },
    posts: results
  });
}

async function handleAdminSetForumTopicStatus(path, request, env) {
  const topicId = clean(decodeURIComponent(path.match(/^\/admin\/forum\/topics\/([^/]+)\/status$/)?.[1] || ""));
  const data = await readJson(request);
  const status = clean(data.status).toLowerCase();
  if (!topicId) return json({ error: "Topic id is required." }, 400);
  if (!["open", "locked", "inactive", "deleted"].includes(status)) {
    return json({ error: "Topic status was not recognized." }, 400);
  }

  const topic = await env.TPI_DB.prepare("SELECT id, title, status FROM forum_topics WHERE id = ?").bind(topicId).first();
  if (!topic) return json({ error: "Topic was not found." }, 404);

  await env.TPI_DB.prepare("UPDATE forum_topics SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(status, topicId)
    .run();

  return json({ topic: { id: topic.id, title: topic.title, status } });
}

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
  if (email && await getUserByEmail(env, email)) return json({ error: "That email is already connected to an account." }, 409);
  const inviteAssignment = getInviteAssignment(invite.code);
  const assignedTitle = inviteAssignment?.title || clean(data.title);
  if (isProtectedOrgTitle(data.title) && !inviteAssignment && !["owner", "admin"].includes(invite.role)) {
    return json({ error: "That leadership title is assigned by site leadership." }, 403);
  }

  const id = crypto.randomUUID();
  await env.TPI_DB.batch([
    env.TPI_DB.prepare(`
      INSERT INTO contributors (id, username, password_hash, display_name, title, role, correspondence, affiliation, organization, website, bio, photo_url, comment_signature_enabled, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).bind(
      id,
      username,
      await hashPassword(password),
      clean(data.displayName),
      assignedTitle,
      inviteAssignment?.role || invite.role,
      email,
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
  if (correspondence && correspondence.includes("@")) {
    const existingEmailUser = await getUserByEmail(env, correspondence);
    if (existingEmailUser && existingEmailUser.id !== user.id) {
      return json({ error: "That email is already connected to another account." }, 409);
    }
  }
  await env.TPI_DB.prepare(`
    UPDATE contributors SET
      display_name = ?,
      title = ?,
      correspondence = ?,
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
      clean(data.affiliation),
      clean(data.organization),
      clean(data.website),
      clean(data.bio),
      clean(data.photoUrl || user.photo_url),
      data.commentSignatureEnabled === false ? 0 : 1,
      user.id
    ).run();
  });
  const updated = await env.TPI_DB.prepare("SELECT * FROM contributors WHERE id = ?").bind(user.id).first();
  return json({ user: publicUser(updated) });
}

async function handleUpdateUsername(request, env, user) {
  const data = await readJson(request);
  const username = clean(data.username);
  if (!isValidUsername(username)) {
    return json({ error: "Username cannot contain spaces. Use letters, numbers, dashes, underscores, periods, or symbols." }, 400);
  }
  if (username === user.username) return json({ user: publicUser(user) });
  const existing = await getUserByUsername(env, username);
  if (existing) return json({ error: "That username already exists." }, 409);

  await env.TPI_DB.prepare("UPDATE contributors SET username = ? WHERE id = ?")
    .bind(username, user.id)
    .run();
  await env.TPI_DB.prepare("UPDATE invite_codes SET used_by = ? WHERE used_by = ?")
    .bind(username, user.username)
    .run();

  const updated = await env.TPI_DB.prepare("SELECT * FROM contributors WHERE id = ?").bind(user.id).first();
  return json({ user: publicUser(updated) });
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
  return json({ url, key, user: publicUser(updated) });
}

async function handleArticleMediaUpload(request, env, user) {
  return handleMediaUpload(request, env, user, "articles", "article-media");
}

async function handleForumMediaUpload(request, env, user) {
  return handleMediaUpload(request, env, user, "forum", "forum-media", ["image/", "video/"]);
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
  const title = clean(data.title || "Untitled Research Paper");
  const subtitle = clean(data.subtitle);
  const contributionType = clean(data.contributionType || data.articleType || "Research Paper");
  const author = clean(data.author);
  const source = clean(data.source);
  const labels = clean(data.labels);
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

  return json({ article: { id, href, destination, title, subtitle, contributionType, author, source, labels, status } });
}

async function handleListArticles(request, env) {
  const url = new URL(request.url);
  const destination = url.searchParams.get("destination");
  const stmt = destination
    ? env.TPI_DB.prepare(`
      SELECT a.id, a.destination, a.href, a.title, a.subtitle, a.article_type AS contributionType, a.author, c.username AS authorUsername, c.display_name AS authorDisplayName, a.source, a.body_html AS bodyHtml, a.article_html AS articleHtml, a.labels, a.status, a.created_at AS createdAt
      FROM articles a
      LEFT JOIN contributors c ON c.id = a.created_by
      WHERE a.destination = ? AND a.status = 'published'
      ORDER BY a.created_at DESC
    `).bind(destination)
    : env.TPI_DB.prepare(`
      SELECT a.id, a.destination, a.href, a.title, a.subtitle, a.article_type AS contributionType, a.author, c.username AS authorUsername, c.display_name AS authorDisplayName, a.source, a.body_html AS bodyHtml, a.article_html AS articleHtml, a.labels, a.status, a.created_at AS createdAt
      FROM articles a
      LEFT JOIN contributors c ON c.id = a.created_by
      WHERE a.status = 'published'
      ORDER BY a.created_at DESC
    `);
  const { results } = await stmt.all();
  return json({ articles: results });
}

async function handleContributorArticles(env, user) {
  const { results } = await env.TPI_DB.prepare(`
    SELECT id, destination, href, title, subtitle, article_type AS contributionType, author, ? AS authorUsername, source, body_html AS bodyHtml, article_html AS articleHtml, labels, status, created_at AS createdAt
    FROM articles
    WHERE created_by = ?
    ORDER BY created_at DESC
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

async function handleForumIndex(request, env) {
  const user = await getSessionUser(request, env);
  const { results: categoryRows } = await env.TPI_DB.prepare(`
    SELECT
      fc.id,
      fc.title,
      fc.description,
      fc.sort_order AS sortOrder,
      COUNT(DISTINCT ft.id) AS topicCount,
      COUNT(fp.id) AS postCount
    FROM forum_categories fc
    LEFT JOIN forum_topics ft ON ft.category_id = fc.id AND ft.status NOT IN ('deleted', 'inactive')
    LEFT JOIN forum_posts fp ON fp.topic_id = ft.id AND fp.status = 'visible'
    WHERE fc.active = 1
    GROUP BY fc.id
    ORDER BY fc.sort_order ASC, fc.title COLLATE NOCASE
  `).all();

  const { results: topicRows } = await env.TPI_DB.prepare(`
    SELECT
      ft.id,
      ft.category_id AS categoryId,
      ft.title,
      ft.status,
      ft.created_at AS createdAt,
      ft.updated_at AS updatedAt,
      c.username AS authorUsername,
      c.display_name AS authorName,
      c.title AS authorTitle,
      COUNT(fp.id) AS postCount,
      MAX(fp.created_at) AS lastPostAt
    FROM forum_topics ft
    LEFT JOIN contributors c ON c.id = ft.created_by
    LEFT JOIN forum_posts fp ON fp.topic_id = ft.id AND fp.status = 'visible'
    WHERE ft.status NOT IN ('deleted', 'inactive')
    GROUP BY ft.id
    ORDER BY COALESCE(MAX(fp.created_at), ft.created_at) DESC
    LIMIT 80
  `).all();

  const readRows = user ? await getForumReadRows(env, user.id) : [];
  const readMap = new Map(readRows.map(row => [row.topic_id, row]));
  const topics = topicRows.map(topic => {
    const postCount = Number(topic.postCount || 0);
    const replyCount = Math.max(0, postCount - 1);
    const read = readMap.get(topic.id);
    const seenPostCount = Number(read?.seen_post_count || 0);
    const unreadTopicCount = user && !read ? 1 : 0;
    const unreadReplyCount = user ? Math.max(0, postCount - Math.max(1, seenPostCount)) : 0;
    return {
      ...topic,
      postCount,
      replyCount,
      unreadTopicCount,
      unreadReplyCount
    };
  });
  const categories = categoryRows.map(category => {
    const categoryTopics = topics.filter(topic => topic.categoryId === category.id);
    return {
      ...category,
      topicCount: Number(category.topicCount || 0),
      postCount: Number(category.postCount || 0),
      replyCount: Math.max(0, Number(category.postCount || 0) - Number(category.topicCount || 0)),
      unreadTopicCount: categoryTopics.reduce((total, topic) => total + Number(topic.unreadTopicCount || 0), 0),
      unreadReplyCount: categoryTopics.reduce((total, topic) => total + Number(topic.unreadReplyCount || 0), 0)
    };
  });

  return json({ categories, topics });
}

async function handleForumTopic(path, env) {
  const topicId = clean(decodeURIComponent(path.replace(/^\/forum\/topics\//, "")));
  if (!topicId) return json({ error: "Topic id is required." }, 400);

  const topic = await env.TPI_DB.prepare(`
    SELECT
      ft.id,
      ft.category_id AS categoryId,
      ft.title,
      ft.status,
      ft.created_at AS createdAt,
      ft.updated_at AS updatedAt,
      fc.title AS categoryTitle,
      c.username AS authorUsername,
      c.display_name AS authorName,
      c.title AS authorTitle
    FROM forum_topics ft
    JOIN forum_categories fc ON fc.id = ft.category_id
    LEFT JOIN contributors c ON c.id = ft.created_by
    WHERE ft.id = ? AND ft.status NOT IN ('deleted', 'inactive')
  `).bind(topicId).first();
  if (!topic) return json({ error: "Topic was not found." }, 404);

  let results = [];
  try {
    ({ results } = await env.TPI_DB.prepare(`
      SELECT
        fp.id,
        fp.topic_id AS topicId,
        fp.body,
        fp.created_at AS createdAt,
        fp.updated_at AS updatedAt,
        c.username AS authorUsername,
        c.display_name AS authorName,
        c.title AS authorTitle,
        c.role AS authorRole,
        c.photo_url AS authorPhotoUrl,
        c.chat_color AS authorChatColor
      FROM forum_posts fp
      LEFT JOIN contributors c ON c.id = fp.contributor_id
      WHERE fp.topic_id = ? AND fp.status = 'visible'
      ORDER BY fp.created_at ASC
    `).bind(topicId).all());
  } catch (error) {
    ({ results } = await env.TPI_DB.prepare(`
      SELECT
        fp.id,
        fp.topic_id AS topicId,
        fp.body,
        fp.created_at AS createdAt,
        fp.updated_at AS updatedAt,
        c.username AS authorUsername,
        c.display_name AS authorName,
        c.title AS authorTitle,
        c.role AS authorRole,
        c.photo_url AS authorPhotoUrl
      FROM forum_posts fp
      LEFT JOIN contributors c ON c.id = fp.contributor_id
      WHERE fp.topic_id = ? AND fp.status = 'visible'
      ORDER BY fp.created_at ASC
    `).bind(topicId).all());
  }

  const posts = await attachForumPostMedia(env, results);
  return json({ topic, posts });
}

async function handleCreateForumTopic(request, env, user) {
  const data = await readJson(request);
  const categoryId = clean(data.categoryId);
  const title = clean(data.title).slice(0, 160);
  const body = clean(data.body).slice(0, 6000);
  const attachments = sanitizeForumAttachments(data.attachments);
  if (!categoryId || !title || !body) return json({ error: "Category, topic title, and message are required." }, 400);

  const category = await env.TPI_DB.prepare("SELECT id FROM forum_categories WHERE id = ? AND active = 1").bind(categoryId).first();
  if (!category) return json({ error: "Forum category was not found." }, 404);

  const topicId = crypto.randomUUID();
  const postId = crypto.randomUUID();
  await env.TPI_DB.batch([
    env.TPI_DB.prepare("INSERT INTO forum_topics (id, category_id, title, created_by, status, updated_at) VALUES (?, ?, ?, ?, 'open', CURRENT_TIMESTAMP)")
      .bind(topicId, categoryId, title, user.id),
    env.TPI_DB.prepare("INSERT INTO forum_posts (id, topic_id, contributor_id, body, status) VALUES (?, ?, ?, ?, 'visible')")
      .bind(postId, topicId, user.id, body)
  ]);
  await insertForumAttachments(env, postId, attachments);

  return json({ topic: { id: topicId, categoryId, title, status: "open" }, post: { id: postId, topicId, body, attachments } });
}

async function handleCreateForumPost(path, request, env, user) {
  const topicId = clean(decodeURIComponent(path.match(/^\/forum\/topics\/([^/]+)\/posts$/)?.[1] || ""));
  const data = await readJson(request);
  const body = clean(data.body).slice(0, 6000);
  const attachments = sanitizeForumAttachments(data.attachments);
  if (!topicId || !body) return json({ error: "Topic id and message are required." }, 400);

  const topic = await env.TPI_DB.prepare("SELECT id, status FROM forum_topics WHERE id = ? AND status NOT IN ('deleted', 'inactive')").bind(topicId).first();
  if (!topic) return json({ error: "Topic was not found." }, 404);
  if (topic.status === "locked" && !["owner", "admin"].includes(user.role)) {
    return json({ error: "This topic is locked." }, 403);
  }

  const postId = crypto.randomUUID();
  await env.TPI_DB.batch([
    env.TPI_DB.prepare("INSERT INTO forum_posts (id, topic_id, contributor_id, body, status) VALUES (?, ?, ?, ?, 'visible')")
      .bind(postId, topicId, user.id, body),
    env.TPI_DB.prepare("UPDATE forum_topics SET updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(topicId)
  ]);
  await insertForumAttachments(env, postId, attachments);

  return json({ post: { id: postId, topicId, body, attachments } });
}

async function handleMarkForumTopicRead(path, env, user) {
  const topicId = clean(decodeURIComponent(path.match(/^\/forum\/topics\/([^/]+)\/read$/)?.[1] || ""));
  if (!topicId) return json({ error: "Topic id is required." }, 400);

  const topic = await env.TPI_DB.prepare(`
    SELECT
      ft.id,
      COUNT(fp.id) AS postCount,
      MAX(fp.created_at) AS lastPostAt
    FROM forum_topics ft
    LEFT JOIN forum_posts fp ON fp.topic_id = ft.id AND fp.status = 'visible'
    WHERE ft.id = ? AND ft.status NOT IN ('deleted', 'inactive')
    GROUP BY ft.id
  `).bind(topicId).first();
  if (!topic) return json({ error: "Topic was not found." }, 404);

  try {
    await env.TPI_DB.prepare(`
      INSERT INTO forum_topic_reads (contributor_id, topic_id, seen_post_count, seen_last_post_at, read_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(contributor_id, topic_id) DO UPDATE SET
        seen_post_count = excluded.seen_post_count,
        seen_last_post_at = excluded.seen_last_post_at,
        read_at = CURRENT_TIMESTAMP
    `).bind(user.id, topicId, Number(topic.postCount || 0), topic.lastPostAt || null).run();
  } catch (error) {
    return json({ ok: false, migrationRequired: true });
  }

  return json({ ok: true, topicId, seenPostCount: Number(topic.postCount || 0), seenLastPostAt: topic.lastPostAt || null });
}

async function handleDeleteForumPost(path, env, user) {
  const postId = clean(decodeURIComponent(path.replace(/^\/forum\/posts\//, "")));
  if (!postId) return json({ error: "Post id is required." }, 400);
  const post = await env.TPI_DB.prepare("SELECT id, contributor_id FROM forum_posts WHERE id = ?").bind(postId).first();
  if (!post) return json({ deleted: false });
  if (post.contributor_id !== user.id && !["owner", "admin"].includes(user.role)) {
    return json({ error: "You can only delete your own forum replies." }, 403);
  }
  await env.TPI_DB.prepare("UPDATE forum_posts SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(postId).run();
  return json({ deleted: true, id: postId });
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

async function getSessionUser(request, env) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const user = await env.TPI_DB.prepare(`
    SELECT c.* FROM sessions s
    JOIN contributors c ON c.id = s.contributor_id
    WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP AND c.active = 1
  `).bind(token).first();
  return user || null;
}

async function getUserByUsername(env, username) {
  if (!username) return null;
  return env.TPI_DB.prepare("SELECT * FROM contributors WHERE username = ?").bind(username).first();
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

async function getForumReadRows(env, contributorId) {
  try {
    const { results } = await env.TPI_DB.prepare(`
      SELECT topic_id, seen_post_count, seen_last_post_at, read_at
      FROM forum_topic_reads
      WHERE contributor_id = ?
    `).bind(contributorId).all();
    return results || [];
  } catch (error) {
    return [];
  }
}

async function attachForumPostMedia(env, posts) {
  const safePosts = posts || [];
  if (!safePosts.length) return safePosts;
  try {
    const postIds = safePosts.map(post => post.id);
    const attachmentsByPost = new Map(postIds.map(id => [id, []]));
    for (const postId of postIds) {
      const { results } = await env.TPI_DB.prepare(`
        SELECT
          id,
          post_id AS postId,
          url,
          media_key AS key,
          name,
          content_type AS contentType,
          media_type AS mediaType,
          sort_order AS sortOrder
        FROM forum_post_attachments
        WHERE post_id = ?
        ORDER BY sort_order ASC, created_at ASC
      `).bind(postId).all();
      attachmentsByPost.set(postId, results || []);
    }
    return safePosts.map(post => ({ ...post, attachments: attachmentsByPost.get(post.id) || [] }));
  } catch (error) {
    return safePosts.map(post => ({ ...post, attachments: [] }));
  }
}

function sanitizeForumAttachments(value) {
  const attachments = Array.isArray(value) ? value : [];
  const cleaned = attachments.map((item, index) => {
    const contentType = clean(item.contentType);
    const mediaType = clean(item.mediaType || (contentType.startsWith("video/") ? "video" : "image"));
    return {
      url: clean(item.url).slice(0, 1000),
      key: clean(item.key).slice(0, 1000),
      name: clean(item.name).slice(0, 180),
      contentType: contentType.slice(0, 120),
      mediaType: mediaType === "video" ? "video" : "image",
      sortOrder: index
    };
  }).filter(item => item.url && ["image", "video"].includes(item.mediaType));

  const images = cleaned.filter(item => item.mediaType === "image");
  const videos = cleaned.filter(item => item.mediaType === "video");
  if (images.length > 10) throw new Error("Forum posts can include up to 10 images.");
  if (videos.length > 2) throw new Error("Forum posts can include up to 2 videos.");
  return cleaned;
}

async function insertForumAttachments(env, postId, attachments) {
  if (!attachments.length) return;
  try {
    await env.TPI_DB.batch(attachments.map(item => env.TPI_DB.prepare(`
      INSERT INTO forum_post_attachments (id, post_id, url, media_key, name, content_type, media_type, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), postId, item.url, item.key, item.name, item.contentType, item.mediaType, item.sortOrder)));
  } catch (error) {
    throw new Error("Forum attachment table is not ready yet. Apply migrations/0008_forum_post_attachments.sql in Cloudflare D1.");
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
    body: await file.arrayBuffer()
  };
}

function clean(value) {
  return String(value || "").trim();
}

function normalizeChatColor(value) {
  const color = clean(value);
  return /^#[0-9a-f]{6}$/i.test(color) ? color : "#55c8ff";
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
    correspondence: user.correspondence,
    affiliation: user.affiliation,
    organization: user.organization,
    website: user.website,
    bio: user.bio,
    photoUrl: user.photo_url,
    chatColor: user.chat_color || "#55c8ff",
    commentSignatureEnabled: Boolean(user.comment_signature_enabled),
    active: user.active !== 0,
    createdAt: user.created_at
  };
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie.split(";").map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1) || "";
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
