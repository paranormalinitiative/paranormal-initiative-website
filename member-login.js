(function () {
  const ACCESS_USERS_KEY = "tpiEditorContributors";
  const ACCESS_SESSION_KEY = "tpiEditorSession";
  const ACCESS_INVITES_KEY = "tpiEditorInvites";
  const status = document.getElementById("member-login-status");
  const inviteCodePanel = document.querySelector("[data-invite-code-panel]");
  const inviteSetupPanel = document.querySelector("[data-invite-setup-panel]");
  const inviteOwnerTools = document.querySelector("[data-invite-owner-tools]");
  const inviteLinkList = document.querySelector("[data-invite-link-list]");

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

  function ensureDeveloperSession() {
    if (!isDevUnlocked()) return null;

    const users = getUsers();
    const owner = {
      username: "tpi-owner",
      password: "",
      displayName: "Todd Wayne",
      title: "Site Owner / Administrator",
      role: "admin",
      correspondence: "paranormalinitiative@yahoo.com",
      affiliation: "The Paranormal Initiative - Applied Paranormal Research and Studies",
      organization: "Somerset Paranormal Research Society",
      website: "",
      commentSignatureEnabled: true,
      active: true,
      developerOwner: true
    };

    const index = users.findIndex(user => user.username === owner.username);
    if (index >= 0) {
      users[index] = { ...users[index], ...owner };
    } else {
      users.push(owner);
    }

    saveUsers(users);
    localStorage.setItem(ACCESS_SESSION_KEY, owner.username);
    return owner;
  }

  function installDeveloperAccessNotice(owner) {
    if (!owner) return;
    const shell = document.querySelector(".member-login-shell");
    if (!shell || document.querySelector("[data-dev-access-notice]")) return;

    const notice = document.createElement("div");
    notice.className = "editor-access-card dev-access-notice";
    notice.dataset.devAccessNotice = "true";
    notice.innerHTML = `
      <p class="portal-kicker">Developer Unlock Active</p>
      <h2>Owner Access Ready</h2>
      <p>You are signed in locally as ${escapeHtml(owner.displayName)}. This lets you open the editor and generate invite links while 10-click mode is active.</p>
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

  function renderOwnerInvites() {
    if (!inviteOwnerTools || !inviteLinkList || !isDevUnlocked()) return;

    inviteOwnerTools.hidden = false;
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
    if (!inviteOwnerTools || !inviteLinkList || !isDevUnlocked() || !await cloudflareReady()) return false;

    try {
      const data = await window.TPIApi.listInvites();
      inviteOwnerTools.hidden = false;
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
      if (!isDevUnlocked()) {
        setStatus("10-click developer unlock is required to create invite links.", true);
        return;
      }

      const code = String(data.get("inviteCode") || "").trim() || makeInviteCode();
      if (await cloudflareReady()) {
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
          window.location.href = "paper-editor.html";
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
      window.location.href = "paper-editor.html";
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
    window.location.href = "paper-editor.html";
  });

  document.addEventListener("click", event => {
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

  importInviteFromUrl();
  const developerOwner = ensureDeveloperSession();
  installDeveloperAccessNotice(developerOwner);
  renderCloudflareOwnerInvites().then(renderedCloudflare => {
    if (!renderedCloudflare) renderOwnerInvites();
  });
})();
