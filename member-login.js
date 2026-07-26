(function () {
  const ACCESS_USERS_KEY = "tpiEditorContributors";
  const ACCESS_SESSION_KEY = "tpiEditorSession";
  const ACCESS_INVITES_KEY = "tpiEditorInvites";
  const status = document.getElementById("member-login-status");
  const inviteCodePanel = document.querySelector("[data-invite-code-panel]");
  const inviteSetupPanel = document.querySelector("[data-invite-setup-panel]");
  const inviteOwnerTools = document.querySelector("[data-invite-owner-tools]");
  const ownerBootstrapForm = document.querySelector("[data-owner-bootstrap-form]");
  const inviteLinkList = document.querySelector("[data-invite-link-list]");
  const adminContributorList = document.querySelector("[data-admin-contributor-list]");
  const commentModerationList = document.querySelector("[data-comment-moderation-list]");
  const dashboardAdmin = document.querySelector("[data-dashboard-admin]");
  const dashboardProfile = document.querySelector("[data-dashboard-profile]");
  const dashboardArticles = document.querySelector("[data-dashboard-articles]");
  const dashboardName = document.querySelector("[data-dashboard-name]");
  const dashboardRole = document.querySelector("[data-dashboard-role]");
  const profileForm = document.querySelector("[data-profile-form]");
  const publicProfileLink = document.querySelector("[data-public-profile-link]");
  const publicProfileRoot = document.querySelector("[data-public-profile]");
  const profilePhotoPreview = document.querySelector("[data-profile-photo-preview]");

  function setStatus(message, isError) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("access-error", Boolean(isError));
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(ACCESS_USERS_KEY) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(ACCESS_USERS_KEY, JSON.stringify(users));
  }

  function getInvites() {
    try {
      return JSON.parse(localStorage.getItem(ACCESS_INVITES_KEY) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveInvites(invites) {
    localStorage.setItem(ACCESS_INVITES_KEY, JSON.stringify(invites));
  }

  async function cloudflareReady() {
    return Boolean(window.TPIApi && await window.TPIApi.isAvailable());
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function getLegacyContributions(profile) {
    return window.TPILegacyContributions?.forProfile(profile) || [];
  }

  function getProfileContributions(profile, articles) {
    const dynamicArticles = (articles || []).map(article => ({
      title: article.title || "Untitled Research Paper",
      subtitle: [article.contributionType || article.articleType, article.subtitle || article.destination || "Research paper"].filter(Boolean).join(" · "),
      href: article.href || `published-article.html?id=${encodeURIComponent(article.id)}`
    }));
    const legacyArticles = getLegacyContributions(profile);
    const seen = new Set();
    return [...dynamicArticles, ...legacyArticles].filter(article => {
      const key = article.href || article.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function getLegacyDashboardArticles(profile) {
    return getLegacyContributions(profile).map(article => ({
      id: `legacy:${article.href}`,
      title: article.title,
      subtitle: article.subtitle,
      href: article.href,
      contributionType: "Legacy Site Page",
      status: "legacy-published",
      legacy: true
    }));
  }

  function isDevUnlocked() {
    return localStorage.getItem("tpiDevCopyMode") === "enabled";
  }

  function makeInviteCode(prefix = "TPI") {
    return `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  function getInviteAssignment(codeOrKind) {
    const key = String(codeOrKind || "")
      .trim()
      .toUpperCase()
      .split("-")[0];
    const assignments = {
      D: { prefix: "D", title: "Founder / Director", role: "owner", label: "Director" },
      AD: { prefix: "AD", title: "Assistant Director", role: "admin", label: "Assistant Director" },
      ABM: { prefix: "ABM", title: "Advisory Board Member", role: "contributor", label: "Advisory Board Member" }
    };
    return assignments[key] || null;
  }

  function normalizeOrgTitle(title) {
    return String(title || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function isProtectedOrgTitle(title) {
    const normalized = normalizeOrgTitle(title);
    return [
      "founder / director",
      "founder/director",
      "founder director",
      "assistant director",
      "advisory board member"
    ].includes(normalized);
  }

  function getLeadershipContributionLevel(title, role) {
    const normalized = normalizeOrgTitle(title);
    const leadershipLevels = {
      "founder / director": { label: "Director", note: "Founder / Director" },
      "founder/director": { label: "Director", note: "Founder / Director" },
      "founder director": { label: "Director", note: "Founder / Director" },
      "assistant director": { label: "Assistant Director", note: "Organizational leadership" },
      "advisory board member": { label: "Advisory Board Member", note: "Professional advisory role" }
    };

    if (leadershipLevels[normalized]) return leadershipLevels[normalized];
    if (role === "owner") return { label: "Director", note: "Founder / Director" };
    if (role === "admin") return { label: "Assistant Director", note: "Organizational leadership" };
    return null;
  }

  function getAccountAccessLabel(role) {
    return {
      owner: "Owner Access",
      admin: "Admin Access",
      editor: "Contributor Access",
      contributor: "Contributor Access"
    }[role] || "Contributor Access";
  }

  function getAccountAccessDetail(role) {
    return {
      owner: "Full site administration",
      admin: "Contributor support and administration",
      editor: "Can write, save drafts, and publish assigned work",
      contributor: "Can write, save drafts, and publish assigned work"
    }[role] || "Contributor account";
  }

  function option(value, current, label = value) {
    return `<option value="${escapeHtml(value)}"${value === current ? " selected" : ""}>${escapeHtml(label)}</option>`;
  }

  function encodeInvite(invite) {
    return btoa(JSON.stringify({
      code: invite.code,
      role: invite.role || "contributor",
      createdAt: invite.createdAt
    }));
  }

  function decodeInvite(value) {
    try {
      const invite = JSON.parse(atob(value));
      if (!invite.code) return null;
      return {
        code: String(invite.code),
        role: String(invite.role || "contributor"),
        used: false,
        createdAt: invite.createdAt || new Date().toISOString(),
        portableInvite: true
      };
    } catch (error) {
      return null;
    }
  }

  function getInviteLink(invite) {
    const url = new URL("contributor-invite.html", window.location.href);
    url.searchParams.set("invite", encodeInvite(invite));
    return url.href;
  }

  function importInviteFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const packedInvite = params.get("invite");
    const invite = packedInvite ? decodeInvite(packedInvite) : null;
    if (!invite) return;

    const invites = getInvites();
    const existing = invites.find(item => item.code === invite.code);
    if (!existing) {
      invites.push(invite);
      saveInvites(invites);
    }

    const input = inviteCodePanel?.querySelector("input[name='inviteCode']");
    if (input) input.value = invite.code;
    setStatus("Invite link loaded. Submit the invite code to continue.", false);
  }

  function showAssignedInviteTitle(inviteCode) {
    const assignment = getInviteAssignment(inviteCode);
    const titleInput = inviteSetupPanel?.querySelector("input[name='title']");
    if (!titleInput) return;
    if (assignment) {
      titleInput.value = assignment.title;
      titleInput.readOnly = true;
      titleInput.placeholder = `${assignment.label} assigned by invite code`;
    } else {
      titleInput.readOnly = false;
      if (isProtectedOrgTitle(titleInput.value)) titleInput.value = "";
      titleInput.placeholder = "Research Contributor";
    }
  }

  function showOwnerToolsForSetupOnly() {
    if (!inviteOwnerTools || !ownerBootstrapForm || !isDevUnlocked()) return;

    inviteOwnerTools.hidden = false;
    inviteOwnerTools.querySelector("[data-owner-invite-form]")?.setAttribute("hidden", "");
    if (inviteLinkList) inviteLinkList.innerHTML = "";
  }

  function renderOwnerInvites() {
    const currentUser = getUsers().find(user => user.username === localStorage.getItem(ACCESS_SESSION_KEY) && user.active !== false && !user.developerOwner);
    if (!inviteOwnerTools || !inviteLinkList || !["owner", "admin"].includes(currentUser?.role)) return;

    inviteOwnerTools.hidden = false;
    inviteOwnerTools.querySelector("[data-owner-invite-form]")?.removeAttribute("hidden");
    if (ownerBootstrapForm) ownerBootstrapForm.hidden = true;
    const invites = getInvites();
    const openInvites = invites.filter(invite => !invite.used);
    inviteLinkList.innerHTML = openInvites.length ? openInvites.map(invite => {
      const link = getInviteLink(invite);
      return `
        <div class="invite-link-row">
          <strong>${escapeHtml(invite.code)}</strong>
          <span>${escapeHtml(getInviteAssignment(invite.code)?.label || invite.role || "contributor")}</span>
          <input type="text" readonly value="${escapeHtml(link)}">
          <button type="button" data-copy-invite-link="${escapeHtml(link)}">Copy Link</button>
        </div>
      `;
    }).join("") : `<p class="access-note">No open invite links yet.</p>`;
    renderLocalContributorTitles(currentUser);
    if (commentModerationList) {
      commentModerationList.innerHTML = `<p class="access-note">Comment moderation is available after signing in through Cloudflare.</p>`;
    }
  }

  function renderContributorTitleRow(contributor, currentUser) {
    const canChangeAccess = currentUser?.role === "owner";
    const name = contributor.displayName || contributor.username || "Contributor";
    const currentTitle = contributor.title || "";
    const currentRole = contributor.role || "contributor";
    return `
      <form class="invite-link-row admin-title-row" data-admin-title-form>
        <input name="username" type="hidden" value="${escapeHtml(contributor.username)}">
        <strong>${escapeHtml(name)}</strong>
        <span>${escapeHtml(contributor.username)}</span>
        <select name="title" aria-label="Public organization title for ${escapeHtml(name)}">
          ${option("", currentTitle, "No leadership title")}
          ${option("Founder / Director", currentTitle)}
          ${option("Assistant Director", currentTitle)}
          ${option("Advisory Board Member", currentTitle)}
          ${option("Research Contributor", currentTitle)}
          ${option("Field Contributor", currentTitle)}
          ${option("Editor / Reviewer", currentTitle)}
          ${option("Technical Contributor", currentTitle)}
          ${option("Education Contributor", currentTitle)}
          ${option("Community Liaison", currentTitle)}
          ${option("Researcher", currentTitle)}
          ${option("Investigator", currentTitle)}
        </select>
        <select name="role" aria-label="Account access for ${escapeHtml(name)}"${canChangeAccess ? "" : " disabled"}>
          ${option("contributor", currentRole, "Contributor Access")}
          ${option("admin", currentRole, "Admin Access")}
          ${option("owner", currentRole, "Owner Access")}
        </select>
        <button type="submit">Save</button>
      </form>
    `;
  }

  function renderLocalContributorTitles(currentUser) {
    if (!adminContributorList || !["owner", "admin"].includes(currentUser?.role)) return;
    const contributors = getUsers().filter(user => user.active !== false && !user.developerOwner);
    adminContributorList.innerHTML = contributors.length
      ? contributors.map(contributor => renderContributorTitleRow(contributor, currentUser)).join("")
      : `<p class="access-note">No contributors have been created yet.</p>`;
  }

  function renderModerationComment(comment, statusFilter) {
    const author = [comment.name || "Anonymous Contributor", comment.authorTitle].filter(Boolean).join(" - ");
    const pageUrl = comment.pageId || "";
    const date = comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "";
    return `
      <article class="moderation-comment">
        <div class="moderation-comment-meta">
          <strong>${escapeHtml(author)}</strong>
          <span>${escapeHtml(date)}</span>
        </div>
        <p>${escapeHtml(comment.text)}</p>
        <a href="${escapeHtml(pageUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(pageUrl || "Article page")}</a>
        <div class="moderation-comment-actions">
          ${statusFilter === "pending" ? `<button type="button" data-comment-approve="${escapeHtml(comment.id)}">Approve</button>` : ""}
          <button type="button" data-comment-delete="${escapeHtml(comment.id)}">Delete</button>
        </div>
      </article>
    `;
  }

  async function renderCommentModeration(statusFilter = "pending") {
    if (!commentModerationList) return;
    if (!await cloudflareReady()) {
      commentModerationList.innerHTML = `<p class="access-note">Cloudflare login is required for comment moderation.</p>`;
      return;
    }
    try {
      const data = await window.TPIApi.listModerationComments(statusFilter);
      const comments = data.comments || [];
      commentModerationList.dataset.moderationStatus = statusFilter;
      commentModerationList.innerHTML = comments.length
        ? comments.map(comment => renderModerationComment(comment, statusFilter)).join("")
        : `<p class="access-note">No ${escapeHtml(statusFilter)} comments.</p>`;
    } catch (error) {
      commentModerationList.innerHTML = `<p class="access-note access-error">${escapeHtml(error.message || "Could not load comments.")}</p>`;
    }
  }

  async function renderCloudflareOwnerInvites() {
    const ownerToolsHost = dashboardAdmin || inviteOwnerTools;
    if (!ownerToolsHost || !inviteLinkList || !await cloudflareReady()) return false;

    try {
      const session = await window.TPIApi.me();
      if (!["owner", "admin"].includes(session.user?.role)) return false;
      const [data, contributorData] = await Promise.all([
        window.TPIApi.listInvites(),
        adminContributorList ? window.TPIApi.listContributors() : Promise.resolve({ contributors: [] })
      ]);
      ownerToolsHost.hidden = false;
      ownerToolsHost.querySelector("[data-owner-invite-form]")?.removeAttribute("hidden");
      if (ownerBootstrapForm) ownerBootstrapForm.hidden = true;
      const openInvites = (data.invites || []).filter(invite => !invite.used);
      inviteLinkList.innerHTML = openInvites.length ? openInvites.map(invite => {
        const link = getInviteLink(invite);
        return `
          <div class="invite-link-row">
            <strong>${escapeHtml(invite.code)}</strong>
            <span>${escapeHtml(getInviteAssignment(invite.code)?.label || invite.role || "contributor")}</span>
            <input type="text" readonly value="${escapeHtml(link)}">
            <button type="button" data-copy-invite-link="${escapeHtml(link)}">Copy Link</button>
          </div>
        `;
      }).join("") : `<p class="access-note">No open invite links yet.</p>`;
      if (adminContributorList) {
        const contributors = contributorData.contributors || [];
        adminContributorList.innerHTML = contributors.length
          ? contributors.map(contributor => renderContributorTitleRow(contributor, session.user)).join("")
          : `<p class="access-note">No contributors have been created yet.</p>`;
      }
      await renderCommentModeration(commentModerationList?.dataset.moderationStatus || "pending");
      return true;
    } catch (error) {
      return false;
    }
  }

  function renderDashboardProfile(user) {
    if (!dashboardProfile || !user) return;
    if (dashboardName) dashboardName.textContent = user.displayName || user.username || "Contributor";
    if (dashboardRole) dashboardRole.textContent = [user.title, getAccountAccessLabel(user.role)].filter(Boolean).join(" - ");
    if (publicProfileLink) publicProfileLink.href = `contributor-profile.html?username=${encodeURIComponent(user.username)}`;
    const profileName = user.displayName || user.username || "Contributor";
    const photoMarkup = user.photoUrl
      ? `<img class="member-profile-photo" src="${escapeHtml(user.photoUrl)}" alt="${escapeHtml(profileName)}">`
      : `<div class="member-profile-photo member-profile-photo-empty">${escapeHtml(profileName.charAt(0) || "C")}</div>`;
    dashboardProfile.innerHTML = `
      <div class="member-profile-summary">
        ${photoMarkup}
        <div>
          <h2>${escapeHtml(profileName)}</h2>
          <p class="public-profile-title">${escapeHtml(user.title || "Research Contributor")}</p>
          <p class="member-profile-role">${escapeHtml(getAccountAccessDetail(user.role))}</p>
        </div>
      </div>
      <div class="member-profile-facts">
        ${user.affiliation ? `<p><span>Affiliation</span>${escapeHtml(user.affiliation)}</p>` : ""}
        ${user.organization ? `<p><span>Organization</span>${escapeHtml(user.organization)}</p>` : ""}
        ${user.correspondence ? `<p><span>Correspondence</span>${escapeHtml(user.correspondence)}</p>` : ""}
        ${user.website ? `<p><span>Website</span><a href="${escapeHtml(user.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(user.website)}</a></p>` : ""}
      </div>
      <div class="member-profile-bio-preview">
        <strong>Biography</strong>
        <p>${user.bio ? escapeHtml(user.bio).replace(/\n/g, "<br>") : "Biography coming soon."}</p>
      </div>
    `;
    if (profilePhotoPreview) {
      profilePhotoPreview.innerHTML = photoMarkup;
    }
    if (profileForm) {
      profileForm.displayName.value = user.displayName || "";
      profileForm.title.value = user.title || "";
      profileForm.affiliation.value = user.affiliation || "";
      profileForm.organization.value = user.organization || "";
      profileForm.correspondence.value = user.correspondence || "";
      profileForm.website.value = user.website || "";
      profileForm.photoUrl.value = user.photoUrl || "";
      profileForm.bio.value = user.bio || "";
      profileForm.commentSignature.checked = user.commentSignatureEnabled !== false;
    }
  }

  function getContributionLevel(publishedCount, role, title) {
    const leadershipLevel = getLeadershipContributionLevel(title, role);
    if (leadershipLevel) return leadershipLevel;
    if (publishedCount >= 25) return { label: "Principal Contributor", note: `${publishedCount} published contributions` };
    if (publishedCount >= 15) return { label: "Senior Research Contributor", note: `${publishedCount} published contributions` };
    if (publishedCount >= 10) return { label: "Published Researcher", note: `${publishedCount} published contributions` };
    if (publishedCount >= 5) return { label: "Research Contributor", note: `${publishedCount} published contributions` };
    if (publishedCount >= 1) return { label: "Contributing Researcher", note: `${publishedCount} published contribution${publishedCount === 1 ? "" : "s"}` };
    return { label: "Contributor", note: "New contributor profile" };
  }

  function renderContributionLevel(level, className = "") {
    return `
      <div class="contribution-level ${escapeHtml(className)}">
        <span>Contribution Level</span>
        <strong>${escapeHtml(level.label)}</strong>
        <em>${escapeHtml(level.note)}</em>
      </div>
    `;
  }

  async function renderDashboardArticles(user) {
    const dashboardDrafts = document.querySelector("[data-dashboard-drafts]");
    if (!dashboardArticles && !dashboardDrafts) return;
    let articles = [];
    if (await cloudflareReady()) {
      try {
        const response = await fetch("/api/contributors/me/articles", { credentials: "same-origin" });
        if (response.ok) {
          articles = (await response.json()).articles || [];
        }
      } catch (error) {
        articles = [];
      }
    } else {
      try {
        articles = JSON.parse(localStorage.getItem("tpiPublishedArticles") || "[]")
          .filter(article => !user?.displayName || article.author === user.displayName);
      } catch (error) {
        articles = [];
      }
    }

    const legacyArticles = getLegacyDashboardArticles(user);
    const seen = new Set();
    const drafts = articles.filter(article => article.status !== "published");
    const published = [...articles.filter(article => article.status === "published"), ...legacyArticles].filter(article => {
      const key = article.href || article.id || article.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const level = getContributionLevel(published.length, user?.role, user?.title);
    const levelHost = document.querySelector("[data-dashboard-level]");
    if (levelHost) levelHost.innerHTML = renderContributionLevel(level);
    if (dashboardDrafts) dashboardDrafts.textContent = String(drafts.length);
    if (dashboardArticles) dashboardArticles.textContent = String(published.length);
  }

  async function initDashboard() {
    if (!dashboardProfile) return;
    if (await cloudflareReady()) {
      const session = await window.TPIApi.me();
      if (!session.user) {
        window.location.href = "member-login.html";
        return;
      }
      renderDashboardProfile(session.user);
      await renderDashboardArticles(session.user);
      await renderCloudflareOwnerInvites();
      return;
    }

    const user = getUsers().find(candidate => candidate.username === localStorage.getItem(ACCESS_SESSION_KEY) && candidate.active !== false && !candidate.developerOwner);
    if (!user) {
      window.location.href = "member-login.html";
      return;
    }
    renderDashboardProfile(user);
    await renderDashboardArticles(user);
    renderOwnerInvites();
  }

  async function initPublicProfile() {
    if (!publicProfileRoot) return;
    const username = new URLSearchParams(window.location.search).get("username");
    if (!username) {
      publicProfileRoot.innerHTML = `<p class="access-note">Contributor profile was not specified.</p>`;
      return;
    }
    try {
      const response = await fetch(`/api/contributors/profile?username=${encodeURIComponent(username)}`, { credentials: "same-origin" });
      if (!response.ok) throw new Error("Contributor profile was not found.");
      const data = await response.json();
      const profile = data.profile;
      const articles = data.articles || [];
      const contributions = getProfileContributions(profile, articles.filter(article => article.status === "published" || !article.status));
      const publishedCount = contributions.length;
      const contributionLevel = getContributionLevel(publishedCount, profile.role, profile.title);
      document.title = `${profile.displayName || profile.username} | The Paranormal Initiative`;
      const profileName = profile.displayName || profile.username || "Contributor";
      publicProfileRoot.innerHTML = `
        <article class="public-profile-card">
          <aside class="public-profile-sidebar">
            ${profile.photoUrl ? `<img class="public-profile-photo" src="${escapeHtml(profile.photoUrl)}" alt="${escapeHtml(profileName)}">` : `<div class="public-profile-photo public-profile-photo-empty">${escapeHtml(profileName.charAt(0) || "C")}</div>`}
            <p class="portal-kicker">${escapeHtml(contributionLevel.label)}</p>
            <h2>${escapeHtml(profileName)}</h2>
            ${profile.title ? `<p class="public-profile-title">${escapeHtml(profile.title)}</p>` : ""}
            ${renderContributionLevel(contributionLevel, "public-contribution-level")}
          </aside>
          <div class="public-profile-main">
            <div class="public-profile-heading">
              <p class="portal-kicker">Contributor Profile</p>
              <h1>${escapeHtml(profileName)}</h1>
              ${profile.title ? `<p>${escapeHtml(profile.title)}</p>` : ""}
            </div>
            <div class="public-profile-details">
              ${profile.affiliation ? `<div><span>Affiliation</span><strong>${escapeHtml(profile.affiliation)}</strong></div>` : ""}
              ${profile.organization ? `<div><span>Organization</span><strong>${escapeHtml(profile.organization)}</strong></div>` : ""}
              ${profile.correspondence ? `<div><span>Correspondence</span><strong>${escapeHtml(profile.correspondence)}</strong></div>` : ""}
              ${profile.website ? `<div><span>Website</span><strong><a href="${escapeHtml(profile.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(profile.website)}</a></strong></div>` : ""}
            </div>
            <section class="public-profile-bio">
              <h3>Biography</h3>
              ${profile.bio ? `<p>${escapeHtml(profile.bio).replace(/\n/g, "<br>")}</p>` : `<p class="access-note">Biography coming soon.</p>`}
            </section>
          </div>
        </article>
        <section class="editor-access-card public-profile-work">
          <p class="portal-kicker">Contributions</p>
          <h2>Published Work</h2>
          <div class="invite-link-list public-profile-work-grid">
            ${contributions.length ? contributions.map(article => `
              <div class="invite-link-row public-profile-work-item">
                <strong>${escapeHtml(article.title)}</strong>
                <span>${escapeHtml(article.subtitle || "Research paper")}</span>
                <a class="portal-button portal-button-secondary" href="${escapeHtml(article.href)}">Open Paper</a>
              </div>
            `).join("") : `<p class="access-note">No published contributions yet.</p>`}
          </div>
        </section>
      `;
    } catch (error) {
      publicProfileRoot.innerHTML = `<p class="access-note">${escapeHtml(error.message)}</p>`;
    }
  }

  document.addEventListener("submit", async event => {
    const loginForm = event.target.closest("[data-member-login]");
    const inviteCheckForm = event.target.closest("[data-invite-check]");
    const registerForm = event.target.closest("[data-invite-register]");
    const ownerInviteForm = event.target.closest("[data-owner-invite-form]");
    const ownerBootstrapForm = event.target.closest("[data-owner-bootstrap-form]");
    const profileSubmitForm = event.target.closest("[data-profile-form]");
    const passwordForm = event.target.closest("[data-password-form]");
    const adminTitleForm = event.target.closest("[data-admin-title-form]");
    if (!loginForm && !inviteCheckForm && !registerForm && !ownerInviteForm && !ownerBootstrapForm && !profileSubmitForm && !passwordForm && !adminTitleForm) return;
    event.preventDefault();

    const data = new FormData(event.target);
    const users = getUsers();

    if (adminTitleForm) {
      const payload = {
        username: String(data.get("username") || "").trim(),
        title: String(data.get("title") || "").trim(),
        role: String(data.get("role") || "").trim()
      };

      if (await cloudflareReady()) {
        try {
          await window.TPIApi.updateContributorTitle(payload);
          await renderCloudflareOwnerInvites();
          setStatus("Contributor title saved.", false);
        } catch (error) {
          setStatus(error.message, true);
        }
        return;
      }

      const currentUser = users.find(user => user.username === localStorage.getItem(ACCESS_SESSION_KEY) && user.active !== false);
      if (!["owner", "admin"].includes(currentUser?.role)) {
        setStatus("Owner/admin login is required to change contributor titles.", true);
        return;
      }
      const targetIndex = users.findIndex(user => user.username === payload.username);
      if (targetIndex >= 0) {
        const nextRole = currentUser.role === "owner" && payload.role ? payload.role : users[targetIndex].role;
        users[targetIndex] = { ...users[targetIndex], title: payload.title, role: nextRole };
        saveUsers(users);
        renderLocalContributorTitles(currentUser);
        setStatus("Contributor title saved locally.", false);
      }
      return;
    }

    if (passwordForm) {
      const currentPassword = String(data.get("currentPassword") || "");
      const newPassword = String(data.get("newPassword") || "");
      const confirmPassword = String(data.get("confirmPassword") || "");
      if (newPassword.length < 8) {
        setStatus("New password must be at least 8 characters.", true);
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatus("New passwords do not match.", true);
        return;
      }

      if (await cloudflareReady()) {
        try {
          await window.TPIApi.changePassword({ currentPassword, newPassword });
          passwordForm.reset();
          setStatus("Password updated.", false);
        } catch (error) {
          setStatus(error.message, true);
        }
        return;
      }

      const username = localStorage.getItem(ACCESS_SESSION_KEY);
      const localUsers = getUsers();
      const userIndex = localUsers.findIndex(user => user.username === username && user.active !== false);
      if (userIndex < 0 || localUsers[userIndex].password !== currentPassword) {
        setStatus("Current password did not match.", true);
        return;
      }
      localUsers[userIndex].password = newPassword;
      saveUsers(localUsers);
      passwordForm.reset();
      setStatus("Password updated locally.", false);
      return;
    }

    if (profileSubmitForm) {
      const uploadedPhoto = profileSubmitForm.querySelector("input[name='profilePhotoFile']")?.files?.[0];
      let photoUrl = String(data.get("photoUrl") || "").trim();
      if (uploadedPhoto) {
        if (!window.TPIApi || !await cloudflareReady()) {
          setStatus("Profile photo upload needs the Cloudflare R2 media bucket. Save an image URL for now.", true);
          return;
        }
        try {
          setStatus("Uploading profile photo...", false);
          const upload = await window.TPIApi.uploadProfilePhoto(uploadedPhoto);
          photoUrl = upload.url || photoUrl;
        } catch (error) {
          setStatus(error.message, true);
          return;
        }
      }
      const payload = {
        displayName: String(data.get("displayName") || "").trim(),
        title: String(data.get("title") || "").trim(),
        affiliation: String(data.get("affiliation") || "").trim(),
        organization: String(data.get("organization") || "").trim(),
        correspondence: String(data.get("correspondence") || "").trim(),
        website: String(data.get("website") || "").trim(),
        photoUrl,
        bio: String(data.get("bio") || "").trim(),
        commentSignatureEnabled: data.get("commentSignature") === "on"
      };
      if (isProtectedOrgTitle(payload.title)) {
        let currentRole = "";
        if (await cloudflareReady()) {
          try {
            currentRole = (await window.TPIApi.me()).user?.role || "";
          } catch (error) {
            currentRole = "";
          }
        } else {
          currentRole = getUsers().find(user => user.username === localStorage.getItem(ACCESS_SESSION_KEY))?.role || "";
        }
        if (!["owner", "admin"].includes(currentRole)) {
          setStatus("That leadership title is assigned by site leadership. Please choose a contributor title.", true);
          return;
        }
      }
      if (await cloudflareReady()) {
        try {
          const response = await fetch("/api/contributors/me/profile", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Profile save failed.");
          renderDashboardProfile(result.user);
          await renderDashboardArticles(result.user);
          setStatus("Profile saved.", false);
        } catch (error) {
          setStatus(error.message, true);
        }
        return;
      }
      const username = localStorage.getItem(ACCESS_SESSION_KEY);
      const localUsers = getUsers();
      const userIndex = localUsers.findIndex(user => user.username === username);
      if (userIndex >= 0) {
        localUsers[userIndex] = { ...localUsers[userIndex], ...payload };
        saveUsers(localUsers);
        renderDashboardProfile(localUsers[userIndex]);
        await renderDashboardArticles(localUsers[userIndex]);
        setStatus("Profile saved locally.", false);
      }
      return;
    }

    if (ownerBootstrapForm) {
      if (!await cloudflareReady()) {
        setStatus("Cloudflare API is not available in this preview.", true);
        return;
      }

      try {
        await window.TPIApi.ownerBootstrap({
          setupKey: String(data.get("setupKey") || ""),
          username: String(data.get("username") || "tpi-owner").trim(),
          password: String(data.get("password") || ""),
          displayName: "Todd Wayne",
          title: "Founder / Director"
        });
        ownerBootstrapForm.reset();
        setStatus("Owner login created. Go to Member Login and sign in with that username and password.", false);
      } catch (error) {
        setStatus(error.message, true);
      }
      return;
    }

    if (ownerInviteForm) {
      const localUser = getUsers().find(user => user.username === localStorage.getItem(ACCESS_SESSION_KEY) && user.active !== false);
      let hasCloudflareInviteAccess = false;
      if (await cloudflareReady()) {
        try {
          const session = await window.TPIApi.me();
          hasCloudflareInviteAccess = ["owner", "admin"].includes(session.user?.role);
        } catch (error) {
          hasCloudflareInviteAccess = false;
        }
      }

      if (!hasCloudflareInviteAccess && !["owner", "admin"].includes(localUser?.role)) {
        setStatus("Owner/admin login is required to create invite links.", true);
        return;
      }

      const inviteAssignment = getInviteAssignment(data.get("inviteAssignment"));
      const typedCode = String(data.get("inviteCode") || "").trim();
      const code = typedCode
        ? (inviteAssignment && !typedCode.toUpperCase().startsWith(`${inviteAssignment.prefix}-`) ? `${inviteAssignment.prefix}-${typedCode}` : typedCode)
        : makeInviteCode(inviteAssignment?.prefix || "TPI");
      const inviteRole = inviteAssignment?.role || String(data.get("inviteRole") || "contributor");
      if (hasCloudflareInviteAccess) {
        try {
          await window.TPIApi.createInvite({ code, role: inviteRole });
          ownerInviteForm.reset();
          await renderCloudflareOwnerInvites();
          setStatus("Cloudflare invite link created. Copy it and send it to the contributor.", false);
        } catch (error) {
          setStatus(error.message, true);
        }
        return;
      }

      const invites = getInvites();
      if (invites.some(invite => invite.code === code && !invite.used)) {
        setStatus("That invite code already exists.", true);
        return;
      }

      invites.push({
        code,
        role: inviteRole,
        used: false,
        createdAt: new Date().toISOString()
      });
      saveInvites(invites);
      ownerInviteForm.reset();
      renderOwnerInvites();
      setStatus("Invite link created. Copy it and send it to the contributor.", false);
      return;
    }

    if (loginForm) {
      const username = String(data.get("username") || "").trim();
      const password = String(data.get("password") || "");
      if (await cloudflareReady()) {
        try {
          const result = await window.TPIApi.login(username, password);
          if (result.user) saveUsers([{ ...result.user, active: true }]);
          localStorage.setItem(ACCESS_SESSION_KEY, username);
          window.location.href = "member-dashboard.html";
        } catch (error) {
          setStatus(error.message, true);
        }
        return;
      }

      const user = users.find(candidate => candidate.username === username && candidate.password === password && candidate.active !== false);
      if (!user) {
        setStatus("Username or password did not match.", true);
        return;
      }
      localStorage.setItem(ACCESS_SESSION_KEY, user.username);
      window.location.href = "member-dashboard.html";
      return;
    }

    if (inviteCheckForm) {
      const inviteCode = String(data.get("inviteCode") || "").trim();
      if (await cloudflareReady()) {
        try {
          await window.TPIApi.checkInvite(inviteCode);
          const hiddenCode = inviteSetupPanel?.querySelector("input[name='inviteCode']");
          if (hiddenCode) hiddenCode.value = inviteCode;
          showAssignedInviteTitle(inviteCode);
          if (inviteCodePanel) inviteCodePanel.hidden = true;
          if (inviteSetupPanel) inviteSetupPanel.hidden = false;
          setStatus("Invite accepted. Create your contributor login.", false);
          inviteSetupPanel?.querySelector("input[name='displayName']")?.focus();
        } catch (error) {
          setStatus(error.message, true);
        }
        return;
      }

      const invites = getInvites();
      const invite = invites.find(item => item.code === inviteCode && !item.used);
      if (!invite) {
        setStatus("Invite code was not found or has already been used.", true);
        return;
      }

      const hiddenCode = inviteSetupPanel?.querySelector("input[name='inviteCode']");
      if (hiddenCode) hiddenCode.value = inviteCode;
      showAssignedInviteTitle(inviteCode);
      if (inviteCodePanel) inviteCodePanel.hidden = true;
      if (inviteSetupPanel) inviteSetupPanel.hidden = false;
      setStatus("Invite accepted. Create your contributor login.", false);
      inviteSetupPanel?.querySelector("input[name='displayName']")?.focus();
      return;
    }

    const inviteCode = String(data.get("inviteCode") || "").trim();
    const username = String(data.get("username") || "").trim();
    const inviteAssignment = getInviteAssignment(inviteCode);
    const requestedTitle = String(data.get("title") || "").trim();
    const assignedTitle = inviteAssignment?.title || requestedTitle;
    if (isProtectedOrgTitle(requestedTitle) && !inviteAssignment) {
      setStatus("That leadership title is assigned by site leadership. Please choose a contributor title.", true);
      return;
    }
    if (await cloudflareReady()) {
      try {
        await window.TPIApi.registerContributor({
          inviteCode,
          username,
          password: String(data.get("password") || ""),
          displayName: String(data.get("displayName") || username).trim(),
          title: assignedTitle,
          correspondence: String(data.get("correspondence") || "").trim(),
          affiliation: String(data.get("affiliation") || "").trim(),
          organization: String(data.get("organization") || "").trim(),
          website: String(data.get("website") || "").trim(),
          commentSignatureEnabled: data.get("commentSignature") === "on"
        });
        setStatus("Contributor login created. Go to Member Login and sign in.", false);
        window.setTimeout(() => {
          window.location.href = "member-login.html";
        }, 900);
      } catch (error) {
        setStatus(error.message, true);
      }
      return;
    }

    const invites = getInvites();
    const invite = invites.find(item => item.code === inviteCode && !item.used);
    if (!invite) {
      setStatus("Invite code was not found or has already been used.", true);
      return;
    }
    if (users.some(user => user.username === username)) {
      setStatus("That username already exists.", true);
      return;
    }

    users.push({
      username,
      password: String(data.get("password") || ""),
      displayName: String(data.get("displayName") || username).trim(),
      title: assignedTitle,
      role: inviteAssignment?.role || invite.role || "contributor",
      correspondence: String(data.get("correspondence") || "").trim(),
      affiliation: String(data.get("affiliation") || "").trim(),
      organization: String(data.get("organization") || "").trim(),
      website: String(data.get("website") || "").trim(),
      commentSignatureEnabled: data.get("commentSignature") === "on",
      active: true
    });
    invite.used = true;
    invite.usedBy = username;
    invite.usedAt = new Date().toISOString();
    saveUsers(users);
    saveInvites(invites);
    localStorage.setItem(ACCESS_SESSION_KEY, username);
    window.location.href = "member-dashboard.html";
  });

  document.addEventListener("click", event => {
    const logoutButton = event.target.closest("[data-member-logout]");
    if (logoutButton) {
      event.preventDefault();
      localStorage.removeItem(ACCESS_SESSION_KEY);
      if (window.TPIApi) window.TPIApi.logout().finally(() => {
        window.location.href = "member-login.html";
      });
      else window.location.href = "member-login.html";
      return;
    }

    const moderationFilter = event.target.closest("[data-moderation-filter]");
    if (moderationFilter) {
      event.preventDefault();
      renderCommentModeration(moderationFilter.dataset.moderationFilter || "pending");
      return;
    }

    const approveButton = event.target.closest("[data-comment-approve]");
    if (approveButton) {
      event.preventDefault();
      const id = approveButton.dataset.commentApprove;
      if (!id) return;
      window.TPIApi.approveComment(id).then(() => {
        setStatus("Comment approved.", false);
        return renderCommentModeration(commentModerationList?.dataset.moderationStatus || "pending");
      }).catch(error => setStatus(error.message || "Comment approval failed.", true));
      return;
    }

    const deleteButton = event.target.closest("[data-comment-delete]");
    if (deleteButton) {
      event.preventDefault();
      const id = deleteButton.dataset.commentDelete;
      if (!id) return;
      if (!window.confirm("Delete this comment?")) return;
      window.TPIApi.deleteComment(id).then(() => {
        setStatus("Comment deleted.", false);
        return renderCommentModeration(commentModerationList?.dataset.moderationStatus || "pending");
      }).catch(error => setStatus(error.message || "Comment delete failed.", true));
      return;
    }

    const button = event.target.closest("[data-copy-invite-link]");
    if (!button) return;
    const link = button.dataset.copyInviteLink;
    if (!link) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(link).then(() => {
        setStatus("Invite link copied.", false);
      }).catch(() => {
        setStatus("Copy failed. Select the link field and copy it manually.", true);
      });
      return;
    }

    setStatus("Select the invite link field and copy it manually.", false);
  });

  document.addEventListener("change", event => {
    const photoInput = event.target.closest("input[name='profilePhotoFile']");
    if (!photoInput || !profilePhotoPreview || !photoInput.files?.[0]) return;
    const file = photoInput.files[0];
    if (!file.type.startsWith("image/")) {
      setStatus("Profile photo must be an image file.", true);
      photoInput.value = "";
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    profilePhotoPreview.innerHTML = `<img class="member-profile-photo" src="${previewUrl}" alt="Selected profile photo preview">`;
  });

  if (inviteSetupPanel) inviteSetupPanel.hidden = true;
  if (inviteOwnerTools) inviteOwnerTools.hidden = true;
  importInviteFromUrl();
  showOwnerToolsForSetupOnly();
  initDashboard();
  initPublicProfile();
  renderCloudflareOwnerInvites().then(renderedCloudflare => {
    if (!renderedCloudflare) renderOwnerInvites();
  });
})();
