(function () {
  const API_ROOT = "/api";

  async function request(path, options = {}) {
    const response = await fetch(`${API_ROOT}${path}`, {
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || "Request failed.");
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async function isAvailable() {
    try {
      await request("/auth/me");
      return true;
    } catch (error) {
      return false;
    }
  }

  window.TPIApi = {
    isAvailable,
    me: () => request("/auth/me"),
    login: (username, password) => request("/auth/login", { method: "POST", body: { username, password } }),
    logout: () => request("/auth/logout", { method: "POST" }),
    ownerBootstrap: payload => request("/owner/bootstrap", { method: "POST", body: payload }),
    listInvites: () => request("/invites"),
    createInvite: payload => request("/invites", { method: "POST", body: payload }),
    checkInvite: code => request("/invites/check", { method: "POST", body: { code } }),
    registerContributor: payload => request("/contributors/register", { method: "POST", body: payload }),
    updateProfile: payload => request("/contributors/me/profile", { method: "POST", body: payload }),
    contributorArticles: () => request("/contributors/me/articles"),
    publicProfile: username => request(`/contributors/profile?username=${encodeURIComponent(username)}`),
    listArticles: destination => request(`/articles${destination ? `?destination=${encodeURIComponent(destination)}` : ""}`),
    createArticle: payload => request("/articles", { method: "POST", body: payload }),
    listComments: pageId => request(`/comments?pageId=${encodeURIComponent(pageId)}`),
    createComment: payload => request("/comments", { method: "POST", body: payload })
  };
})();
