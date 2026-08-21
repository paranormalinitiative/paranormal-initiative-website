(function () {
  const ACCESS_USERS_KEY = "tpiEditorContributors";
  const ACCESS_SESSION_KEY = "tpiEditorSession";
  const ACCESS_INVITES_KEY = "tpiEditorInvites";
  const VISIBLE_INVITE_KEY = "tpiVisibleInviteLink";
  const VISIBLE_INVITE_MS = 5 * 60 * 1000;
  let visibleInviteTimer = null;
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
  const dashboardKicker = document.querySelector("[data-dashboard-kicker]");
  const contributorTools = document.querySelectorAll("[data-contributor-tool]");
  const accountIdentity = document.querySelector("[data-account-identity]");
  const profileForm = document.querySelector("[data-profile-form]");
  const usernameForm = document.querySelector("[data-username-form]");
  const publicProfileLink = document.querySelector("[data-public-profile-link]");
  const publicProfileRoot = document.querySelector("[data-public-profile]");
  const profilePhotoPreview = document.querySelector("[data-profile-photo-preview]");
  const adminPanelRoot = document.querySelector("[data-admin-panel]");
  const adminSettingsPanel = document.querySelector("[data-admin-settings-panel]");
  const adminMemberSearchForm = document.querySelector("[data-admin-member-search-form]");
  const adminMemberResults = document.querySelector("[data-admin-member-results]");
  const adminDetailCard = document.querySelector("[data-admin-detail-card]");
  const adminMemberDetail = document.querySelector("[data-admin-member-detail]");
  const adminSelectedTitle = document.querySelector("[data-admin-selected-title]");
  let currentAdminUser = null;
  let selectedAdminUsername = "";

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

  function normalizeChatColor(value) {
    const color = String(value || "").trim();
    return /^#[0-9a-f]{6}$/i.test(color) ? color : "#55c8ff";
  }

  function getContactPayload(data) {
    return {
      contactName: String(data.get("contactName") || data.get("displayName") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      addressLine1: String(data.get("addressLine1") || "").trim(),
      addressLine2: String(data.get("addressLine2") || "").trim(),
      city: String(data.get("city") || "").trim(),
      state: String(data.get("state") || "").trim(),
      postalCode: String(data.get("postalCode") || "").trim()
    };
  }

  function getLegacyContributions(profile) {
    return window.TPILegacyContributions?.forProfile(profile) || [];
  }

  function normalizeLegacyHref(value) {
    return String(value || "").trim().replace(/^\.?\//, "");
  }

  function filterUnconvertedLegacyContributions(legacyArticles, articles) {
    const convertedSources = new Set((articles || [])
      .map(article => normalizeLegacyHref(article.source))
      .filter(Boolean));
    return (legacyArticles || []).filter(article => !convertedSources.has(normalizeLegacyHref(article.href)));
  }

  function getProfileContributions(profile, articles) {
    const dynamicArticles = (articles || []).map(article => ({
      title: article.title || "Untitled Content",
      subtitle: [article.contributionType || article.articleType, article.subtitle || article.destination || "Research paper"].filter(Boolean).join(" · "),
      href: article.href || `published-article.html?id=${encodeURIComponent(article.id)}`
    }));
    const legacyArticles = filterUnconvertedLegacyContributions(getLegacyContributions(profile), articles);
    const seen = new Set();
    return [...dynamicArticles, ...legacyArticles].filter(article => {
      const key = article.href || article.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function getLegacyDashboardArticles(profile, articles = []) {
    return filterUnconvertedLegacyContributions(getLegacyContributions(profile), articles).map(article => ({
      id: `legacy:${article.href}`,
      title: article.title,
      subtitle: article.subtitle,
      href: article.href,
      destination: article.destination || "",
      contributionType: article.contributionType || "Legacy Site Page",
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
      contributor: "Contributor Access",
      member: "Member Access"
    }[role] || "Member Access";
  }

  function getAccountAccessDetail(role) {
    return {
      owner: "Full site administration",
      admin: "Contributor support and administration",
      editor: "Can write, save drafts, and publish assigned work",
      contributor: "Can write, save drafts, and publish assigned work",
      member: "Can join discussions and manage a member profile"
    }[role] || "Member account";
  }

  function canUseContributorTools(user) {
    return ["owner", "admin", "contributor"].includes(String(user?.role || "").toLowerCase());
  }

  function canUseAdminTools(user) {
    return ["owner", "admin"].includes(String(user?.role || "").toLowerCase());
  }

  function updateDashboardToolVisibility(user) {
    const contributorAllowed = canUseContributorTools(user);
    contributorTools.forEach(element => {
      element.hidden = !contributorAllowed;
    });
    if (dashboardAdmin && !canUseAdminTools(user)) dashboardAdmin.hidden = true;
    if (dashboardKicker) dashboardKicker.textContent = contributorAllowed ? "Contributor Home" : "Member Home";
  }

  function isValidUsername(value) {
    const username = String(value || "").trim();
    return Boolean(username && !/\s/.test(username) && /^[A-Za-z0-9._!#$%&'*+/=?^`{|}~-]+$/.test(username));
  }

  function usernameErrorMessage() {
    return "Username cannot contain spaces. Use letters, numbers, dashes, underscores, periods, or symbols.";
  }

  function normalizeLoginAlias(value) {
    return String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, "");
  }

  function option(value, current, label = value) {
    return `<option value="${escapeHtml(value)}"${value === current ? " selected" : ""}>${escapeHtml(label)}</option>`;
  }

  const publicTitleOptions = [
    "Founder / Director",
    "Assistant Director",
    "Advisory Board Member",
    "Paranormal Researcher & Investigator",
    "EVP / ITC Researcher",
    "Field Investigator",
    "Technical Researcher",
    "Historical Researcher",
    "Evidence Reviewer",
    "Education & Outreach",
    "Community Liaison",
    "Contributor"
  ];

  function renderPublicTitleOptions(currentTitle) {
    return [
      option("", currentTitle, "No leadership title"),
      ...publicTitleOptions.map(title => option(title, currentTitle))
    ].join("");
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

  function saveVisibleInvite(invite) {
    if (!invite?.code) return;
    try {
      sessionStorage.setItem(VISIBLE_INVITE_KEY, JSON.stringify({
        code: invite.code,
        role: invite.role || "contributor",
        createdAt: invite.createdAt || invite.created_at || new Date().toISOString(),
        hideAt: Date.now() + VISIBLE_INVITE_MS
      }));
    } catch (error) {
      // Session storage is only for hiding the displayed link; the invite still exists in D1/local fallback.
    }
  }

  function clearVisibleInvite() {
    try {
      sessionStorage.removeItem(VISIBLE_INVITE_KEY);
    } catch (error) {
      // Ignore storage cleanup failures.
    }
    if (visibleInviteTimer) {
      window.clearTimeout(visibleInviteTimer);
      visibleInviteTimer = null;
    }
  }

  function getVisibleInvite(openInvites = []) {
    let visibleInvite = null;
    try {
      visibleInvite = JSON.parse(sessionStorage.getItem(VISIBLE_INVITE_KEY) || "null");
    } catch (error) {
      visibleInvite = null;
    }
    if (!visibleInvite?.code || Date.now() > Number(visibleInvite.hideAt || 0)) {
      clearVisibleInvite();
      return null;
    }
    const matchingOpenInvite = openInvites.find(invite => invite.code === visibleInvite.code);
    if (openInvites.length && !matchingOpenInvite) {
      clearVisibleInvite();
      return null;
    }
    return {
      ...visibleInvite,
      ...(matchingOpenInvite || {})
    };
  }

  function renderInviteLinks(openInvites = []) {
    if (!inviteLinkList) return;
    if (visibleInviteTimer) {
      window.clearTimeout(visibleInviteTimer);
      visibleInviteTimer = null;
    }

    const invite = getVisibleInvite(openInvites);
    if (!invite) {
      inviteLinkList.innerHTML = `<p class="access-note">No invite link is being displayed. Generated links auto-hide after a few minutes, but sent links stay valid until used.</p>`;
      return;
    }

    const link = getInviteLink(invite);
    const secondsLeft = Math.max(1, Math.ceil((Number(invite.hideAt) - Date.now()) / 1000));
    inviteLinkList.innerHTML = `
      <div class="invite-link-row">
        <strong>${escapeHtml(invite.code)}</strong>
        <span>${escapeHtml(getInviteAssignment(invite.code)?.label || invite.role || "contributor")}</span>
        <p class="access-note">This generated link will hide automatically in about ${Math.ceil(secondsLeft / 60)} minute${secondsLeft > 60 ? "s" : ""}. The invite remains valid for the person you sent it to until it is used.</p>
        <input type="text" readonly value="${escapeHtml(link)}">
        <div class="invite-link-actions">
          <button type="button" data-copy-invite-link="${escapeHtml(link)}">Copy Link</button>
          <button type="button" class="portal-button-secondary" data-clear-visible-invite>Clear Link</button>
        </div>
      </div>
    `;

    visibleInviteTimer = window.setTimeout(() => {
      clearVisibleInvite();
      renderInviteLinks(openInvites);
    }, Math.max(500, Number(invite.hideAt) - Date.now()));
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
      titleInput.placeholder = "Paranormal Researcher & Investigator";
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
    renderInviteLinks(invites.filter(invite => !invite.used));
    renderLocalContributorTitles(currentUser);
    if (commentModerationList) {
      commentModerationList.innerHTML = `<p class="access-note">Comment moderation is available after signing in through Cloudflare.</p>`;
    }
  }

  function renderContributorTitleRow(contributor, currentUser) {
    const name = contributor.displayName || contributor.username || "Contributor";
    const currentTitle = contributor.title || "";
    const currentRole = contributor.role || "contributor";
    const currentUserRole = currentUser?.role || "";
    const canChangeLeadershipAccess = currentUserRole === "owner";
    const canChangeStandardAccess = canChangeLeadershipAccess || (currentUserRole === "admin" && ["member", "contributor"].includes(currentRole));
    const lockLeadershipOptions = !canChangeLeadershipAccess;
    const active = contributor.active !== false;
    const isSelf = contributor.username === currentUser?.username;
    const createdAt = contributor.createdAt ? new Date(contributor.createdAt).toLocaleString() : "Unknown";
    const correspondence = contributor.correspondence || "";
    return `
      <form class="invite-link-row admin-title-row" data-admin-title-form>
        <input name="username" type="hidden" value="${escapeHtml(contributor.username)}">
        <div class="admin-member-heading">
          <strong>${escapeHtml(name)}</strong>
          <span class="${active ? "admin-member-active" : "admin-member-inactive"}">${active ? "Active" : "Inactive"}</span>
        </div>
        <div class="admin-member-facts">
          <span><b>Username</b>${escapeHtml(contributor.username)}</span>
          <span><b>Display Name</b>${escapeHtml(name)}</span>
          <span><b>Role</b>${escapeHtml(currentRole || "member")}</span>
          <span><b>Title</b>${escapeHtml(currentTitle || "No leadership title")}</span>
          <span><b>Correspondence</b>${escapeHtml(correspondence || "Not provided")}</span>
          <span><b>Created</b>${escapeHtml(createdAt)}</span>
        </div>
        <select name="title" aria-label="Public organization title for ${escapeHtml(name)}">
          ${renderPublicTitleOptions(currentTitle)}
        </select>
        <select name="role" aria-label="Account access for ${escapeHtml(name)}"${canChangeStandardAccess ? "" : " disabled"}>
          ${option("member", currentRole, "Member Access")}
          ${option("contributor", currentRole, "Contributor Access")}
          <option value="admin"${currentRole === "admin" ? " selected" : ""}${lockLeadershipOptions ? " disabled" : ""}>Admin Access</option>
          <option value="owner"${currentRole === "owner" ? " selected" : ""}${lockLeadershipOptions ? " disabled" : ""}>Owner Access</option>
        </select>
        <div class="admin-member-actions">
          <button type="submit">Save</button>
          ${active
            ? `<button type="button" class="portal-button-secondary" data-admin-member-active="deactivate" data-username="${escapeHtml(contributor.username)}"${isSelf ? " disabled" : ""}>Deactivate</button>`
            : `<button type="button" class="portal-button-secondary" data-admin-member-active="restore" data-username="${escapeHtml(contributor.username)}">Restore</button>`}
        </div>
      </form>
    `;
  }

  function renderLocalContributorTitles(currentUser) {
    if (!adminContributorList || !["owner", "admin"].includes(currentUser?.role)) return;
    const contributors = getUsers().filter(user => !user.developerOwner);
    adminContributorList.innerHTML = contributors.length
      ? contributors.map(contributor => renderContributorTitleRow(contributor, currentUser)).join("")
      : `<p class="access-note">No member accounts have been created yet.</p>`;
  }

  function getAdminRoleOptions(currentRole, currentUserRole) {
    const canChangeLeadershipAccess = currentUserRole === "owner";
    const lockLeadershipOptions = !canChangeLeadershipAccess;
    return `
      ${option("member", currentRole, "Member Access")}
      ${option("contributor", currentRole, "Contributor Access")}
      <option value="admin"${currentRole === "admin" ? " selected" : ""}${lockLeadershipOptions ? " disabled" : ""}>Admin Access</option>
      <option value="owner"${currentRole === "owner" ? " selected" : ""}${lockLeadershipOptions ? " disabled" : ""}>Owner Access</option>
    `;
  }

  function renderAdminMemberRow(member, currentUser) {
    const username = member.username || "";
    const name = member.displayName || member.display_name || username || "Member";
    const role = member.role || "member";
    const title = member.title || "";
    const active = member.active !== false;
    const currentUserRole = currentUser?.role || "";
    const canChangeLeadershipAccess = currentUserRole === "owner";
    const changingLeadershipLocked = !canChangeLeadershipAccess && ["owner", "admin"].includes(role);
    return `
      <article class="admin-member-result ${selectedAdminUsername === username ? "selected" : ""}">
        <button type="button" class="admin-member-select" data-admin-select-member="${escapeHtml(username)}">
          <strong>${escapeHtml(name)}</strong>
          <span>${escapeHtml(username)} · ${escapeHtml(role)}${title ? ` · ${escapeHtml(title)}` : ""}</span>
          <em class="${active ? "admin-member-active" : "admin-member-inactive"}">${active ? "Active" : "Inactive"}</em>
        </button>
        <form class="admin-member-access-form" data-admin-title-form>
          <input name="username" type="hidden" value="${escapeHtml(username)}">
          <select name="title" aria-label="Public organization title for ${escapeHtml(name)}">
            ${renderPublicTitleOptions(title)}
          </select>
          <select name="role" aria-label="Account access for ${escapeHtml(name)}"${changingLeadershipLocked ? " disabled" : ""}>
            ${getAdminRoleOptions(role, currentUserRole)}
          </select>
          <div class="admin-member-actions">
            <button type="submit">Save Access</button>
            ${active
              ? `<button type="button" class="admin-member-status-button admin-member-status-button-danger admin-member-status-button-locked" disabled title="Open this member's profile to block the account">Block</button>`
              : `<button type="button" class="admin-member-status-button admin-member-status-button-restore admin-member-status-button-locked" disabled title="Open this member's profile to restore the account">Restore</button>`}
          </div>
        </form>
      </article>
    `;
  }

  function lockAdvancedAdminControls(currentUser) {
    const isDirector = currentUser?.role === "owner";
    document.querySelectorAll("select[name='inviteAssignment']").forEach(select => {
      select.querySelector("option[value='D']")?.toggleAttribute("disabled", !isDirector);
      select.querySelector("option[value='AD']")?.toggleAttribute("disabled", !isDirector);
      if (!isDirector && ["D", "AD"].includes(select.value)) select.value = "standard";
    });
    document.querySelectorAll("select[name='inviteRole']").forEach(select => {
      select.querySelector("option[value='admin']")?.toggleAttribute("disabled", !isDirector);
      select.querySelector("option[value='owner']")?.toggleAttribute("disabled", !isDirector);
      if (!isDirector && ["admin", "owner"].includes(select.value)) select.value = "contributor";
    });
  }

  async function getAdminSessionUser() {
    if (currentAdminUser) return currentAdminUser;
    if (await cloudflareReady()) {
      const session = await window.TPIApi.me();
      currentAdminUser = session.user || null;
      return currentAdminUser;
    }
    currentAdminUser = getUsers().find(user => user.username === localStorage.getItem(ACCESS_SESSION_KEY) && user.active !== false) || null;
    return currentAdminUser;
  }

  async function loadAdminMembers(search = "") {
    if (!adminMemberResults) return;
    const currentUser = await getAdminSessionUser();
    if (!["owner", "admin"].includes(currentUser?.role)) {
      adminMemberResults.innerHTML = `<p class="access-note access-error">Owner or Admin access is required.</p>`;
      return;
    }
    adminMemberResults.innerHTML = `<p class="access-note">Loading members...</p>`;
    try {
      let members = [];
      if (await cloudflareReady()) {
        const data = await window.TPIApi.searchMembers(search);
        members = data.members || [];
      } else {
        const needle = String(search || "").trim().toLowerCase();
        members = getUsers()
          .filter(user => !user.developerOwner)
          .filter(user => !needle || [user.username, user.displayName, user.title, user.role].some(value => String(value || "").toLowerCase().includes(needle)));
      }
      adminMemberResults.innerHTML = members.length
        ? members.map(member => renderAdminMemberRow(member, currentUser)).join("")
        : `<p class="access-note">No members matched that search.</p>`;
    } catch (error) {
      adminMemberResults.innerHTML = `<p class="access-note access-error">${escapeHtml(error.message || "Could not load members.")}</p>`;
    }
  }

  function renderAttachmentList(items, emptyText) {
    if (!items || !items.length) return `<p class="access-note">${escapeHtml(emptyText)}</p>`;
    return items.map(item => `
      <a class="admin-media-item" href="${escapeHtml(item.url || "#")}" target="_blank" rel="noopener noreferrer">
        <strong>${escapeHtml(item.name || item.topicTitle || "Media")}</strong>
        <span>${escapeHtml(item.topicTitle || item.contentType || "Uploaded media")}</span>
      </a>
    `).join("");
  }

  function getAdminSearchValue() {
    return adminMemberSearchForm?.querySelector("input[name='search']")?.value || "";
  }

  function getAdminMemberFromHash() {
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    return params.get("member") || "";
  }

  function setAdminDetailVisible(visible) {
    if (adminDetailCard) adminDetailCard.hidden = !visible;
    if (!visible) {
      selectedAdminUsername = "";
      if (adminSelectedTitle) adminSelectedTitle.textContent = "Select a member";
      if (adminMemberDetail) {
        adminMemberDetail.innerHTML = `<p class="access-note">Choose a member to view account details, forum posts, uploaded forum media, and TPI videos connected to that account.</p>`;
      }
    }
  }

  function pushAdminMemberHash(username) {
    if (!username) return;
    const nextHash = `#member=${encodeURIComponent(username)}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState({ adminMember: username }, "", nextHash);
    }
  }

  function renderAdminActivity(data) {
    const member = data.member || {};
    const posts = data.posts || [];
    const photos = data.photos || [];
    const forumVideos = data.forumVideos || [];
    const tpiVideos = data.tpiVideos || [];
    const articles = data.articles || [];
    const comments = data.comments || [];
    const videoComments = data.videoComments || [];
    const displayName = member.displayName || member.username || "Member";
    const isSelf = member.username === currentAdminUser?.username;
    const activeAction = member.active === false ? "restore" : "deactivate";
    const activeLabel = member.active === false ? "Unblock / Restore Member" : "Block Member";
    const activeButtonClass = activeAction === "restore" ? "admin-member-status-button-restore" : "admin-member-status-button-danger";
    const activeTitle = activeAction === "restore" ? "Restore this member's account access" : "Block this member from login and posting until restored";
    const publicProfileUrl = member.username ? `contributor-profile.html?username=${encodeURIComponent(member.username)}` : "#";
    if (adminSelectedTitle) adminSelectedTitle.textContent = displayName;
    setAdminDetailVisible(true);
    if (!adminMemberDetail) return;
    adminMemberDetail.innerHTML = `
      <div class="admin-member-profile-head">
        <div>
          <p class="portal-kicker">Selected Member</p>
          <h3>${escapeHtml(displayName)}</h3>
          <span>${escapeHtml(member.title || "No public title")} · ${escapeHtml(member.role || "member")}</span>
        </div>
        <div class="admin-member-profile-actions">
          <a class="portal-button portal-button-secondary" href="${escapeHtml(publicProfileUrl)}" target="_blank" rel="noopener noreferrer">View Profile</a>
          <button type="button" class="admin-member-status-button ${activeButtonClass}" data-admin-member-active="${activeAction}" data-username="${escapeHtml(member.username || "")}" title="${escapeHtml(activeTitle)}"${isSelf || !member.username ? " disabled" : ""}>${activeLabel}</button>
        </div>
      </div>
      <div class="admin-member-overview">
        <div><span>Username</span><strong>${escapeHtml(member.username || "")}</strong></div>
        <div><span>Role</span><strong>${escapeHtml(member.role || "member")}</strong></div>
        <div><span>Status</span><strong>${member.active === false ? "Blocked" : "Active"}</strong></div>
        <div><span>Email Verified</span><strong>${member.emailVerified ? "Yes" : "No"}</strong></div>
        <div><span>Phone Verified</span><strong>${member.phoneVerified ? "Yes" : "No"}</strong></div>
        <div><span>Forum Posts</span><strong>${posts.length}</strong></div>
        <div><span>Contributions</span><strong>${articles.length}</strong></div>
        <div><span>Comments</span><strong>${comments.length + videoComments.length}</strong></div>
        <div><span>Photos</span><strong>${photos.length}</strong></div>
        <div><span>Videos</span><strong>${forumVideos.length + tpiVideos.length}</strong></div>
      </div>
      <section class="admin-activity-section">
        <h4>Private Contact Information</h4>
        <div class="admin-member-overview admin-member-contact-grid">
          <div><span>Contact Name</span><strong>${escapeHtml(member.contactName || displayName)}</strong></div>
          <div><span>Email</span><strong>${escapeHtml(member.correspondence || "Not provided")}</strong></div>
          <div><span>Phone</span><strong>${escapeHtml(member.phone || "Not provided")}</strong></div>
          <div><span>Street Address</span><strong>${escapeHtml(member.addressLine1 || "Not provided")}</strong></div>
          <div><span>Address Line 2</span><strong>${escapeHtml(member.addressLine2 || "Not provided")}</strong></div>
          <div><span>City</span><strong>${escapeHtml(member.city || "Not provided")}</strong></div>
          <div><span>State</span><strong>${escapeHtml(member.state || "Not provided")}</strong></div>
          <div><span>ZIP Code</span><strong>${escapeHtml(member.postalCode || "Not provided")}</strong></div>
        </div>
      </section>
      <section class="admin-activity-section">
        <h4>Contributed Posts</h4>
        <div class="admin-activity-list admin-contributed-posts-list">
          ${articles.length ? articles.map(article => `
            <article class="admin-activity-item">
              <strong>${escapeHtml(article.title || "Untitled contribution")}</strong>
              <span>${escapeHtml(article.contributionType || "Content")} · ${escapeHtml(article.status || "draft")} · ${escapeHtml(article.updatedAt || article.createdAt || "")}</span>
              <p>${escapeHtml(article.subtitle || article.destination || "No subtitle provided.")}</p>
              ${article.href ? `<a href="${escapeHtml(article.href)}" target="_blank" rel="noopener noreferrer">Open contribution</a>` : ""}
            </article>
          `).join("") : `<p class="access-note">No Content Editor contributions found for this member.</p>`}
        </div>
      </section>
      <section class="admin-activity-section">
        <h4>Forum Posts</h4>
        <div class="admin-activity-list">
          ${posts.length ? posts.map(post => `
            <article class="admin-activity-item">
              <strong>${escapeHtml(post.topicTitle || "Forum topic")}</strong>
              <span>${escapeHtml(post.categoryTitle || "Forum")} · ${escapeHtml(post.status || "visible")} · ${escapeHtml(post.createdAt || "")}</span>
              <p>${escapeHtml(post.body || "").slice(0, 420)}</p>
              ${(post.attachments || []).length ? `<em>${post.attachments.length} attachment${post.attachments.length === 1 ? "" : "s"}</em>` : ""}
            </article>
          `).join("") : `<p class="access-note">No forum posts found for this member.</p>`}
        </div>
      </section>
      <section class="admin-activity-section">
        <h4>Photos Posted</h4>
        <div class="admin-media-grid">${renderAttachmentList(photos, "No forum photos found for this member.")}</div>
      </section>
      <section class="admin-activity-section">
        <h4>Videos Posted</h4>
        <div class="admin-media-grid">
          ${forumVideos.length || !tpiVideos.length ? renderAttachmentList(forumVideos, "No video posts found for this member.") : ""}
          ${tpiVideos.map(video => `
            <a class="admin-media-item" href="tpi-video.html?id=${escapeHtml(video.slug || "")}" target="_blank" rel="noopener noreferrer">
              <strong>${escapeHtml(video.title || "TPI Video")}</strong>
              <span>${escapeHtml(video.category || "TPI Video")} · ${escapeHtml(video.status || "published")}</span>
            </a>
          `).join("")}
        </div>
      </section>
      <section class="admin-activity-section">
        <h4>Comments</h4>
        <div class="admin-activity-list">
          ${comments.length || videoComments.length ? `
            ${comments.map(comment => `
              <article class="admin-activity-item">
                <strong>${escapeHtml(comment.pageId || "Article comment")}</strong>
                <span>${escapeHtml(comment.status || "pending")} · ${escapeHtml(comment.createdAt || "")}</span>
                <p>${escapeHtml(comment.text || "").slice(0, 420)}</p>
              </article>
            `).join("")}
            ${videoComments.map(comment => `
              <article class="admin-activity-item">
                <strong>${escapeHtml(comment.videoTitle || "Video comment")}</strong>
                <span>${escapeHtml(comment.status || "visible")} · ${escapeHtml(comment.createdAt || "")}</span>
                <p>${escapeHtml(comment.body || "").slice(0, 420)}</p>
              </article>
            `).join("")}
          ` : `<p class="access-note">No comments found for this member.</p>`}
        </div>
      </section>
      <section class="admin-activity-section">
        <h4>Chat Logs</h4>
        <p class="access-note">Member chat logging is not connected yet. This panel is reserved for the chat moderation endpoint when Chat launches.</p>
      </section>
    `;
  }

  async function selectAdminMember(username, options = {}) {
    if (!username) {
      setAdminDetailVisible(false);
      await loadAdminMembers(getAdminSearchValue());
      return;
    }
    selectedAdminUsername = username;
    setAdminDetailVisible(true);
    if (options.pushHash !== false) pushAdminMemberHash(username);
    if (adminMemberDetail) adminMemberDetail.innerHTML = `<p class="access-note">Loading member activity...</p>`;
    try {
      if (await cloudflareReady()) {
        const data = await window.TPIApi.listMemberActivity(username);
        renderAdminActivity(data);
      } else {
        const user = getUsers().find(member => member.username === username);
        renderAdminActivity({ member: user, posts: [], photos: [], forumVideos: [], tpiVideos: [] });
      }
      await loadAdminMembers(getAdminSearchValue());
    } catch (error) {
      if (adminMemberDetail) adminMemberDetail.innerHTML = `<p class="access-note access-error">${escapeHtml(error.message || "Could not load member activity.")}</p>`;
    }
  }

  async function initAdminPanel() {
    if (!adminPanelRoot) return;
    const currentUser = await getAdminSessionUser();
    if (!["owner", "admin"].includes(currentUser?.role)) {
      adminPanelRoot.innerHTML = `
        <section class="editor-access-card">
          <p class="portal-kicker">Admin Panel</p>
          <h2>Access Required</h2>
          <p class="access-note access-error">Owner or Admin access is required to manage member accounts.</p>
        </section>
      `;
      return;
    }
    if (dashboardAdmin) dashboardAdmin.hidden = false;
    lockAdvancedAdminControls(currentUser);
    const initialAdminMember = getAdminMemberFromHash();
    selectedAdminUsername = initialAdminMember;
    setAdminDetailVisible(Boolean(initialAdminMember));
    await loadAdminMembers("");
    if (initialAdminMember) await selectAdminMember(initialAdminMember, { pushHash: false });
    const renderedCloudflare = await renderCloudflareOwnerInvites();
    if (!renderedCloudflare) renderOwnerInvites();
  }

  async function initAdminSettingsPanel() {
    if (!adminSettingsPanel) return;
    const currentUser = await getAdminSessionUser();
    if (!["owner", "admin"].includes(currentUser?.role)) {
      adminSettingsPanel.innerHTML = `
        <section class="editor-access-card">
          <p class="portal-kicker">Advanced Page Settings</p>
          <h2>Access Required</h2>
          <p class="access-note access-error">Owner or Admin access is required to manage website settings.</p>
        </section>
      `;
    }
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
      renderInviteLinks((data.invites || []).filter(invite => !invite.used));
      if (adminContributorList) {
        const contributors = contributorData.contributors || [];
        adminContributorList.innerHTML = contributors.length
          ? contributors.map(contributor => renderContributorTitleRow(contributor, session.user)).join("")
          : `<p class="access-note">No member accounts have been created yet.</p>`;
      }
      await renderCommentModeration(commentModerationList?.dataset.moderationStatus || "pending");
      return true;
    } catch (error) {
      return false;
    }
  }

  function renderDashboardProfile(user) {
    if (!dashboardProfile || !user) return;
    updateDashboardToolVisibility(user);
    if (dashboardName) dashboardName.textContent = user.displayName || user.username || "Contributor";
    if (dashboardRole) dashboardRole.textContent = [user.title, getAccountAccessLabel(user.role)].filter(Boolean).join(" - ");
    if (publicProfileLink) publicProfileLink.href = `contributor-profile.html?username=${encodeURIComponent(user.username)}`;
    if (accountIdentity) {
      const email = user.correspondence || "";
      accountIdentity.innerHTML = `
        <div>
          <span>Login Username</span>
          <strong>${escapeHtml(user.username || "Not set")}</strong>
        </div>
        <div>
          <span>Account Email</span>
          <strong>${escapeHtml(email || "Add an email for account recovery")}</strong>
        </div>
        <div>
          <span>Email Verification</span>
          <strong>${user.emailVerified ? "Verified" : "Not verified yet"}</strong>
        </div>
        <div>
          <span>Phone Verification</span>
          <strong>${user.phoneVerified ? "Verified" : "Not verified yet"}</strong>
        </div>
        <p>Password: protected and never displayed after saving.</p>
      `;
    }
    if (usernameForm) {
      usernameForm.hidden = false;
      if (usernameForm.username) usernameForm.username.value = user.username || "";
    }
    const profileName = user.displayName || user.username || "Contributor";
    const photoMarkup = user.photoUrl
      ? `<img class="member-profile-photo" src="${escapeHtml(user.photoUrl)}" alt="${escapeHtml(profileName)}">`
      : `<div class="member-profile-photo member-profile-photo-empty">${escapeHtml(profileName.charAt(0) || "C")}</div>`;
    dashboardProfile.innerHTML = `
      <div class="member-profile-summary">
        ${photoMarkup}
        <div>
          <h2>${escapeHtml(profileName)}</h2>
          <p class="public-profile-title">${escapeHtml(user.title || "Contributor")}</p>
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
      if (profileForm.contactName) profileForm.contactName.value = user.contactName || user.displayName || "";
      if (profileForm.phone) profileForm.phone.value = user.phone || "";
      if (profileForm.addressLine1) profileForm.addressLine1.value = user.addressLine1 || "";
      if (profileForm.addressLine2) profileForm.addressLine2.value = user.addressLine2 || "";
      if (profileForm.city) profileForm.city.value = user.city || "";
      if (profileForm.state) profileForm.state.value = user.state || "";
      if (profileForm.postalCode) profileForm.postalCode.value = user.postalCode || "";
      if (profileForm.chatColor) profileForm.chatColor.value = normalizeChatColor(user.chatColor || "#55c8ff");
      profileForm.photoUrl.value = user.photoUrl || "";
      profileForm.bio.value = user.bio || "";
      profileForm.commentSignature.checked = user.commentSignatureEnabled !== false;
    }
  }

  function getContributionLevel(publishedCount, role, title) {
    const leadershipLevel = getLeadershipContributionLevel(title, role);
    if (leadershipLevel) return leadershipLevel;
    if (role === "member") return { label: "Member", note: "Community discussion member" };
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

    const legacyArticles = getLegacyDashboardArticles(user, articles);
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
    const resetRequestForm = event.target.closest("[data-password-reset-request]");
    const memberRegisterForm = event.target.closest("[data-member-register]");
    const inviteCheckForm = event.target.closest("[data-invite-check]");
    const registerForm = event.target.closest("[data-invite-register]");
    const ownerInviteForm = event.target.closest("[data-owner-invite-form]");
    const ownerBootstrapForm = event.target.closest("[data-owner-bootstrap-form]");
    const profileSubmitForm = event.target.closest("[data-profile-form]");
    const usernameSubmitForm = event.target.closest("[data-username-form]");
    const passwordForm = event.target.closest("[data-password-form]");
    const adminTitleForm = event.target.closest("[data-admin-title-form]");
    const adminSearchForm = event.target.closest("[data-admin-member-search-form]");
    if (!loginForm && !resetRequestForm && !memberRegisterForm && !inviteCheckForm && !registerForm && !ownerInviteForm && !ownerBootstrapForm && !profileSubmitForm && !usernameSubmitForm && !passwordForm && !adminTitleForm && !adminSearchForm) return;
    event.preventDefault();

    const data = new FormData(event.target);
    const users = getUsers();

    if (adminSearchForm) {
      await loadAdminMembers(String(data.get("search") || "").trim());
      return;
    }

    if (resetRequestForm) {
      const email = String(data.get("email") || "").trim();
      if (!email || !email.includes("@")) {
        setStatus("Enter the email address on the account.", true);
        return;
      }
      if (await cloudflareReady()) {
        try {
          const response = await window.TPIApi.requestPasswordReset({ email });
          resetRequestForm.reset();
          setStatus(response.message || "If that email is on an account, reset instructions will be sent.", false);
        } catch (error) {
          setStatus(error.message, true);
        }
        return;
      }
      const localUser = users.find(user => String(user.correspondence || user.email || "").toLowerCase() === email.toLowerCase());
      setStatus(localUser
        ? "Local preview found that email. Cloudflare email delivery is needed for live reset instructions."
        : "If that email is on an account, reset instructions will be sent when email delivery is connected.", false);
      return;
    }

    if (adminTitleForm) {
      const payload = {
        username: String(data.get("username") || "").trim(),
        title: String(data.get("title") || "").trim(),
        role: String(data.get("role") || "").trim()
      };

      if (await cloudflareReady()) {
        try {
          await window.TPIApi.updateContributorTitle(payload);
          if (adminPanelRoot) {
            await loadAdminMembers(getAdminSearchValue());
            if (selectedAdminUsername) await selectAdminMember(selectedAdminUsername);
          } else {
            await renderCloudflareOwnerInvites();
          }
          setStatus("Member access saved.", false);
        } catch (error) {
          setStatus(error.message, true);
        }
        return;
      }

      const currentUser = users.find(user => user.username === localStorage.getItem(ACCESS_SESSION_KEY) && user.active !== false);
      if (!["owner", "admin"].includes(currentUser?.role)) {
        setStatus("Owner/admin login is required to change member access.", true);
        return;
      }
      const targetIndex = users.findIndex(user => user.username === payload.username);
      if (targetIndex >= 0) {
        const targetRole = users[targetIndex].role;
        const requestedRole = payload.role || targetRole;
        const changingLeadershipAccess = ["owner", "admin"].includes(requestedRole) || ["owner", "admin"].includes(targetRole);
        if (changingLeadershipAccess && currentUser.role !== "owner") {
          setStatus("Only the owner can change owner or admin access.", true);
          return;
        }
        const nextRole = requestedRole;
        users[targetIndex] = { ...users[targetIndex], title: payload.title, role: nextRole };
        saveUsers(users);
        if (adminPanelRoot) {
          await loadAdminMembers(getAdminSearchValue());
          if (selectedAdminUsername) await selectAdminMember(selectedAdminUsername);
        } else {
          renderLocalContributorTitles(currentUser);
        }
        setStatus("Member access saved locally.", false);
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

    if (usernameSubmitForm) {
      const username = String(data.get("username") || "").trim();
      if (!isValidUsername(username)) {
        setStatus(usernameErrorMessage(), true);
        return;
      }

      if (await cloudflareReady()) {
        try {
          const result = await window.TPIApi.updateUsername({ username });
          localStorage.setItem(ACCESS_SESSION_KEY, result.user.username);
          renderDashboardProfile(result.user);
          setStatus("Username updated.", false);
        } catch (error) {
          setStatus(error.message, true);
        }
        return;
      }

      const currentUsername = localStorage.getItem(ACCESS_SESSION_KEY);
      const localUsers = getUsers();
      if (localUsers.some(user => user.username === username && user.username !== currentUsername)) {
        setStatus("That username already exists.", true);
        return;
      }
      const userIndex = localUsers.findIndex(user => user.username === currentUsername && user.active !== false);
      if (userIndex >= 0) {
        localUsers[userIndex].username = username;
        saveUsers(localUsers);
        localStorage.setItem(ACCESS_SESSION_KEY, username);
        renderDashboardProfile(localUsers[userIndex]);
        setStatus("Username updated locally.", false);
      }
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
        ...getContactPayload(data),
        chatColor: normalizeChatColor(String(data.get("chatColor") || "#55c8ff")),
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
      const ownerUsername = String(data.get("username") || "tpi-owner").trim();
      if (!isValidUsername(ownerUsername)) {
        setStatus(usernameErrorMessage(), true);
        return;
      }

      try {
        await window.TPIApi.ownerBootstrap({
          setupKey: String(data.get("setupKey") || ""),
          username: ownerUsername,
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
      if (["owner", "admin"].includes(inviteRole)) {
        let currentRole = localUser?.role || "";
        if (await cloudflareReady()) {
          try {
            currentRole = (await window.TPIApi.me()).user?.role || "";
          } catch (error) {
            currentRole = "";
          }
        }
        if (currentRole !== "owner") {
          setStatus("Only the Director can create Director, Assistant Director, or Admin invites.", true);
          return;
        }
      }
      if (hasCloudflareInviteAccess) {
        try {
          const result = await window.TPIApi.createInvite({ code, role: inviteRole });
          saveVisibleInvite(result.invite || {
            code,
            role: inviteRole,
            createdAt: new Date().toISOString()
          });
          ownerInviteForm.reset();
          await renderCloudflareOwnerInvites();
          setStatus("Cloudflare invite link created. Copy it and send it to the contributor. The displayed link will auto-hide after a few minutes.", false);
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
      saveVisibleInvite({ code, role: inviteRole, createdAt: new Date().toISOString() });
      ownerInviteForm.reset();
      renderOwnerInvites();
      setStatus("Invite link created. Copy it and send it to the contributor. The displayed link will auto-hide after a few minutes.", false);
      return;
    }

    if (loginForm) {
      const identifier = String(data.get("username") || "").trim();
      const password = String(data.get("password") || "");
      if (await cloudflareReady()) {
        try {
          const result = await window.TPIApi.login(identifier, password);
          if (result.user) saveUsers([{ ...result.user, active: true }]);
          localStorage.setItem(ACCESS_SESSION_KEY, result.user?.username || identifier);
          var loginUsername = result.user?.username || identifier;
          window.location.href = "member-home.html?username=" + encodeURIComponent(loginUsername);
        } catch (error) {
          setStatus(error.message, true);
        }
        return;
      }

      const user = users.find(candidate => {
        const email = String(candidate.correspondence || candidate.email || "").toLowerCase();
        const alias = normalizeLoginAlias(identifier);
        const usernameAlias = normalizeLoginAlias(candidate.username);
        const displayAlias = normalizeLoginAlias(candidate.displayName || candidate.display_name);
        return (candidate.username === identifier || usernameAlias === alias || displayAlias === alias || email === identifier.toLowerCase()) && candidate.password === password && candidate.active !== false;
      });
      if (!user) {
        setStatus("Username or password did not match.", true);
        return;
      }
      localStorage.setItem(ACCESS_SESSION_KEY, user.username);
      window.location.href = "member-home.html?username=" + encodeURIComponent(user.username);
      return;
    }

    if (memberRegisterForm) {
      const username = String(data.get("username") || "").trim();
      const password = String(data.get("password") || "");
      const confirmPassword = String(data.get("confirmPassword") || "");
      const displayName = String(data.get("displayName") || username).trim();
      const email = String(data.get("email") || "").trim();
      if (!username || !password || !displayName) {
        setStatus("Display name, username, and password are required.", true);
        return;
      }
      if (!isValidUsername(username)) {
        setStatus(usernameErrorMessage(), true);
        return;
      }
      if (!email || !email.includes("@")) {
        setStatus("A valid email address is required.", true);
        return;
      }
      if (password.length < 8) {
        setStatus("Password must be at least 8 characters.", true);
        return;
      }
      if (password !== confirmPassword) {
        setStatus("Passwords do not match.", true);
        return;
      }

      if (await cloudflareReady()) {
        try {
          await window.TPIApi.registerMember({
            username,
            password,
            displayName,
            email,
            ...getContactPayload(data),
            title: "Member",
            commentSignatureEnabled: data.get("commentSignature") === "on"
          });
          await window.TPIApi.login(username, password);
          localStorage.setItem(ACCESS_SESSION_KEY, username);
          window.location.href = "member-home.html?username=" + encodeURIComponent(username);
        } catch (error) {
          setStatus(error.message, true);
        }
        return;
      }

      if (users.some(user => user.username === username)) {
        setStatus("That username already exists.", true);
        return;
      }
      if (users.some(user => String(user.correspondence || user.email || "").toLowerCase() === email.toLowerCase())) {
        setStatus("That email is already connected to an account.", true);
        return;
      }
      users.push({
        username,
        password,
        displayName,
        correspondence: email,
        ...getContactPayload(data),
        title: "Member",
        role: "member",
        commentSignatureEnabled: data.get("commentSignature") === "on",
        active: true
      });
      saveUsers(users);
      localStorage.setItem(ACCESS_SESSION_KEY, username);
      window.location.href = "member-home.html?username=" + encodeURIComponent(username);
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
    const password = String(data.get("password") || "");
    const confirmPassword = String(data.get("confirmPassword") || "");
    const inviteAssignment = getInviteAssignment(inviteCode);
    const requestedTitle = String(data.get("title") || "").trim();
    const assignedTitle = inviteAssignment?.title || requestedTitle;
    if (isProtectedOrgTitle(requestedTitle) && !inviteAssignment) {
      setStatus("That leadership title is assigned by site leadership. Please choose a contributor title.", true);
      return;
    }
    if (!isValidUsername(username)) {
      setStatus(usernameErrorMessage(), true);
      return;
    }
    if (password.length < 8) {
      setStatus("Password must be at least 8 characters.", true);
      return;
    }
    if (password !== confirmPassword) {
      setStatus("Passwords do not match.", true);
      return;
    }
    if (await cloudflareReady()) {
      try {
        await window.TPIApi.registerContributor({
          inviteCode,
          username,
          password,
          displayName: String(data.get("displayName") || username).trim(),
          title: assignedTitle,
          correspondence: String(data.get("correspondence") || "").trim(),
          ...getContactPayload(data),
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
      password,
      displayName: String(data.get("displayName") || username).trim(),
      title: assignedTitle,
      role: inviteAssignment?.role || invite.role || "contributor",
      correspondence: String(data.get("correspondence") || "").trim(),
      ...getContactPayload(data),
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
    window.location.href = "member-home.html?username=" + encodeURIComponent(username);
  });

  document.addEventListener("click", async event => {
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

    const activeButton = event.target.closest("[data-admin-member-active]");
    if (activeButton) {
      event.preventDefault();
      const username = activeButton.dataset.username;
      const action = activeButton.dataset.adminMemberActive;
      if (!username || !action) return;
      if (action === "deactivate" && !window.confirm(`Block ${username}? They will not be able to log in or post until restored.`)) return;

      if (await cloudflareReady()) {
        try {
          if (action === "deactivate") {
            await window.TPIApi.blockMember(username);
            setStatus("Member account blocked.", false);
          } else {
            await window.TPIApi.unblockMember(username);
            setStatus("Member account restored.", false);
          }
          if (adminPanelRoot) {
            await loadAdminMembers(getAdminSearchValue());
            if (selectedAdminUsername) await selectAdminMember(selectedAdminUsername);
          } else {
            await renderCloudflareOwnerInvites();
          }
        } catch (error) {
          setStatus(error.message || "Member status could not be changed.", true);
        }
        return;
      }

      const currentUser = getUsers().find(user => user.username === localStorage.getItem(ACCESS_SESSION_KEY) && user.active !== false);
      const localUsers = getUsers();
      const targetIndex = localUsers.findIndex(user => user.username === username);
      if (!["owner", "admin"].includes(currentUser?.role) || targetIndex < 0) {
        setStatus("Owner/admin login is required to change member status.", true);
        return;
      }
      if (username === currentUser.username) {
        setStatus("You cannot block your own account.", true);
        return;
      }
      localUsers[targetIndex].active = action !== "deactivate";
      saveUsers(localUsers);
      if (adminPanelRoot) {
        await loadAdminMembers(getAdminSearchValue());
        if (selectedAdminUsername) await selectAdminMember(selectedAdminUsername);
      } else {
        renderLocalContributorTitles(currentUser);
      }
      setStatus(action === "deactivate" ? "Member account blocked locally." : "Member account restored locally.", false);
      return;
    }

    const selectMemberButton = event.target.closest("[data-admin-select-member]");
    if (selectMemberButton) {
      event.preventDefault();
      await selectAdminMember(selectMemberButton.dataset.adminSelectMember);
      return;
    }

    const forgotToggle = event.target.closest("[data-forgot-password-toggle]");
    if (forgotToggle) {
      event.preventDefault();
      const resetForm = document.querySelector("[data-password-reset-request]");
      if (!resetForm) return;
      resetForm.hidden = !resetForm.hidden;
      if (!resetForm.hidden) resetForm.querySelector("input[name='email']")?.focus();
      return;
    }

    const clearInviteButton = event.target.closest("[data-clear-visible-invite]");
    if (clearInviteButton) {
      clearVisibleInvite();
      renderInviteLinks();
      setStatus("Invite link cleared from this screen. The sent invite still works until it is used.", false);
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

  window.addEventListener("hashchange", async () => {
    if (!adminPanelRoot) return;
    const username = getAdminMemberFromHash();
    if (username) {
      if (username !== selectedAdminUsername) await selectAdminMember(username, { pushHash: false });
      return;
    }
    setAdminDetailVisible(false);
    await loadAdminMembers(getAdminSearchValue());
  });

  if (inviteSetupPanel) inviteSetupPanel.hidden = true;
  if (inviteOwnerTools) inviteOwnerTools.hidden = true;
  importInviteFromUrl();
  showOwnerToolsForSetupOnly();
  initDashboard();
  initAdminPanel();
  initAdminSettingsPanel();
  initPublicProfile();
  renderCloudflareOwnerInvites().then(renderedCloudflare => {
    if (!renderedCloudflare) renderOwnerInvites();
  });
})();
