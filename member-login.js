(function () {
  const ACCESS_USERS_KEY = "tpiEditorContributors";
  const ACCESS_SESSION_KEY = "tpiEditorSession";
  const ACCESS_INVITES_KEY = "tpiEditorInvites";
  const status = document.getElementById("member-login-status");

  function setStatus(message, isError) {
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

  document.addEventListener("submit", event => {
    const loginForm = event.target.closest("[data-member-login]");
    const registerForm = event.target.closest("[data-invite-register]");
    if (!loginForm && !registerForm) return;
    event.preventDefault();

    const data = new FormData(event.target);
    const users = getUsers();

    if (loginForm) {
      const username = String(data.get("username") || "").trim();
      const password = String(data.get("password") || "");
      const user = users.find(candidate => candidate.username === username && candidate.password === password && candidate.active !== false);
      if (!user) {
        setStatus("Username or password did not match.", true);
        return;
      }
      localStorage.setItem(ACCESS_SESSION_KEY, user.username);
      window.location.href = "paper-editor.html";
      return;
    }

    const inviteCode = String(data.get("inviteCode") || "").trim();
    const username = String(data.get("username") || "").trim();
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
      role: invite.role || "contributor",
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
})();
