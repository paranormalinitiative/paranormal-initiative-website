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
  const dashboardAdmin = document.querySelector("[data-dashboard-admin]");
  const dashboardProfile = document.querySelector("[data-dashboard-profile]");
  const dashboardArticles = document.querySelector("[data-dashboard-articles]");
  const dashboardName = document.querySelector("[data-dashboard-name]");
  const dashboardRole = document.querySelector("[data-dashboard-role]");

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

  function isDevUnlocked() {
    return localStorage.getItem("tpiDevCopyMode") === "enabled";
  }

  function isOwnerSetupUrl() {
    return new URLSearchParams(window.location.search).get("ownerSetup") === "1";
  }

  function installDeveloperAccessNotice() {
    if (!isDevUnlocked()) return;
    const shell = document.querySelector(".member-login-shell");
    if (!shell || document.querySelector("[data-dev-access-notice]")) return;

    const notice = document.createElement("div");
    notice.className = "editor-access-card dev-access-notice";
    notice.dataset.devAccessNotice = "true";
    notice.innerHTML = `
      <p class="portal-kicker">Developer Unlock Active</p>
      <h2>Local Dev Unlock</h2>
      <p>10-click is active for local editing. Real invite generation still requires an owner/admin login.</p>
      <a class="portal-button" href="paper-editor.html">Open Research Paper Editor</a>
    `;
    shell.prepend(notice);
  }

  function makeInviteCode() {
    return `TPI-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
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

  function showOwnerToolsForSetupOnly() {
    if (!inviteOwnerTools || !ownerBootstrapForm || !isDevUnlocked() || !isOwnerSetupUrl()) return;

    inviteOwnerTools.hidden = false;
    inviteOwnerTools.querySelector("[data-owner-invite-form]")?.setAttribute("hidden", "");
    if (inviteLinkList) inviteLinkList.innerHTML = `<p class="access-note">Sign in as owner/admin from Member Login to generate contributor invites.</p>`;
  }

  function renderOwnerInvites() {
    const currentUser = getUsers().find(user => user.username === localStorage.getItem(ACCESS_SESSION_KEY) && user.active !== false);
    if (!inviteOwnerTools || !inviteLinkList || !["admin", "editor"].includes(currentUser?.role)) return;

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
          <span>${escapeHtml(invite.role || "contributor")}</span>
          <input type="text" readonly value="${escapeHtml(link)}">
          <button type="button" data-copy-invite-link="${escapeHtml(link)}">Copy Link</button>
        </div>
      `;
    }).join("") : `<p class="access-note">No open invite links yet.</p>`;
  }

  async function renderCloudflareOwnerInvites() {
    const ownerToolsHost = dashboardAdmin || inviteOwnerTools;
    if (!ownerToolsHost || !inviteLinkList || !await cloudflareReady()) return false;

    try {
      const session = await window.TPIApi.me();
      if (!["admin", "editor"].includes(session.user?.role)) return false;
      const data = await window.TPIApi.listInvites();
      ownerToolsHost.hidden = false;
      ownerToolsHost.querySelector("[data-owner-invite-form]")?.removeAttribute("hidden");
      if (ownerBootstrapForm) ownerBootstrapForm.hidden = true;
      const openInvites = (data.invites || []).filter(invite => !invite.used);
      inviteLinkList.innerHTML = openInvites.length ? openInvites.map(invite => {
        const link = getInviteLink(invite);
        return `
          <div class="invite-link-row">
            <strong>${escapeHtml(invite.code)}</strong>
            <span>${escapeHtml(invite.role || "contributor")}</span>
            <input type="text" readonly value="${escapeHtml(link)}">
            <button type="button" data-copy-invite-link="${escapeHtml(link)}">Copy Link</button>
          </div>
        `;
      }).join("") : `<p class="access-note">No open invite links yet.</p>`;
      return true;
    } catch (error) {
      return false;
    }
  }

  function renderDashboardProfile(user) {
    if (!dashboardProfile || !user) return;
    if (dashboardName) dashboardName.textContent = user.displayName || user.username || "Contributor";
    if (dashboardRole) dashboardRole.textContent = [user.title, user.role].filter(Boolean).join(" - ");
    dashboardProfile.innerHTML = `
      <h2>${escapeHtml(user.displayName || user.username || "Contributor")}</h2>
      ${user.title ? `<p><strong>${escapeHtml(user.title)}</strong></p>` : ""}
      ${user.affiliation ? `<p>${escapeHtml(user.affiliation)}</p>` : ""}
      ${user.organization ? `<p>${escapeHtml(user.organization)}</p>` : ""}
      ${user.correspondence ? `<p>Correspondence: ${escapeHtml(user.correspondence)}</p>` : ""}
      ${user.website ? `<p><a href="${escapeHtml(user.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(user.website)}</a></p>` : ""}
    `;
  }

  async function renderDashboardArticles(user) {
    if (!dashboardArticles) return;
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

    dashboardArticles.innerHTML = articles.length ? articles.map(article => `
      <div class="invite-link-row">
        <strong>${escapeHtml(article.title || "Untitled Research Paper")}</strong>
        <span>${escapeHtml(article.subtitle || article.destination || "Research paper")}</span>
        <a class="portal-button portal-button-secondary" href="${escapeHtml(article.href || `published-article.html?id=${encodeURIComponent(article.id)}`)}">Open Paper</a>
      </div>
    `).join("") : `<p class="access-note">No published papers yet. Use the Research Paper Editor to create your first contribution.</p>`;
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

    const user = getUsers().find(candidate => candidate.username === localStorage.getItem(ACCESS_SESSION_KEY) && candidate.active !== false);
    if (!user) {
      window.location.href = "member-login.html";
      return;
    }
    renderDashboardProfile(user);
    await renderDashboardArticles(user);
    renderOwnerInvites();
  }

  document.addEventListener("submit", async event => {
    const loginForm = event.target.closest("[data-member-login]");
    const inviteCheckForm = event.target.closest("[data-invite-check]");
    const registerForm = event.target.closest("[data-invite-register]");
    const ownerInviteForm = event.target.closest("[data-owner-invite-form]");
    const ownerBootstrapForm = event.target.closest("[data-owner-bootstrap-form]");
    if (!loginForm && !inviteCheckForm && !registerForm && !ownerInviteForm && !ownerBootstrapForm) return;
    event.preventDefault();

    const data = new FormData(event.target);
    const users = getUsers();

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
          title: "Site Owner / Administrator"
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
          hasCloudflareInviteAccess = ["admin", "editor"].includes(session.user?.role);
        } catch (error) {
          hasCloudflareInviteAccess = false;
        }
      }

      if (!hasCloudflareInviteAccess && !["admin", "editor"].includes(localUser?.role)) {
        setStatus("Owner/admin login is required to create invite links.", true);
        return;
      }

      const code = String(data.get("inviteCode") || "").trim() || makeInviteCode();
      if (hasCloudflareInviteAccess) {
        try {
          await window.TPIApi.createInvite({ code, role: String(data.get("inviteRole") || "contributor") });
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
        role: String(data.get("inviteRole") || "contributor"),
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
      if (inviteCodePanel) inviteCodePanel.hidden = true;
      if (inviteSetupPanel) inviteSetupPanel.hidden = false;
      setStatus("Invite accepted. Create your contributor login.", false);
      inviteSetupPanel?.querySelector("input[name='displayName']")?.focus();
      return;
    }

    const inviteCode = String(data.get("inviteCode") || "").trim();
    const username = String(data.get("username") || "").trim();
    if (await cloudflareReady()) {
      try {
        await window.TPIApi.registerContributor({
          inviteCode,
          username,
          password: String(data.get("password") || ""),
          displayName: String(data.get("displayName") || username).trim(),
          title: String(data.get("title") || "").trim(),
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
      title: String(data.get("title") || "").trim(),
      role: invite.role || "contributor",
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

  if (inviteSetupPanel) inviteSetupPanel.hidden = true;
  if (inviteOwnerTools) inviteOwnerTools.hidden = true;
  importInviteFromUrl();
  installDeveloperAccessNotice();
  showOwnerToolsForSetupOnly();
  initDashboard();
  renderCloudflareOwnerInvites().then(renderedCloudflare => {
    if (!renderedCloudflare) renderOwnerInvites();
  });
})();
