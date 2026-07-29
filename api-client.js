(function () {
  const API_ROOT = "/api";

  async function request(path, options = {}) {
    const response = await fetch(`${API_ROOT}${path}`, {
      credentials: "same-origin",
      cache: options.cache || "no-store",
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

  async function upload(path, file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_ROOT}${path}`, {
      method: "POST",
      credentials: "same-origin",
      body: formData
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || "Upload failed.");
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
    registerMember: payload => request("/members/register", { method: "POST", body: payload }),
    requestPasswordReset: payload => request("/auth/password-reset/request", { method: "POST", body: payload }),
    ownerBootstrap: payload => request("/owner/bootstrap", { method: "POST", body: payload }),
    listInvites: () => request("/invites"),
    createInvite: payload => request("/invites", { method: "POST", body: payload }),
    listContributors: () => request("/admin/contributors"),
    updateContributorTitle: payload => request("/admin/contributors/title", { method: "POST", body: payload }),
    searchMembers: search => request(`/admin/members?search=${encodeURIComponent(search || "")}`),
    blockMember: username => request(`/admin/members/${encodeURIComponent(username)}/block`, { method: "POST" }),
    unblockMember: username => request(`/admin/members/${encodeURIComponent(username)}/unblock`, { method: "POST" }),
    memberForumPosts: username => request(`/admin/forum/posts?username=${encodeURIComponent(username || "")}`),
    setForumTopicStatus: (id, status) => request(`/admin/forum/topics/${encodeURIComponent(id)}/status`, { method: "POST", body: { status } }),
    deleteForumTopic: id => request(`/admin/forum/topics/${encodeURIComponent(id)}/status`, { method: "POST", body: { status: "deleted" } }),
    listModerationComments: status => request(`/admin/comments?status=${encodeURIComponent(status || "pending")}`),
    approveComment: id => request(`/admin/comments/${encodeURIComponent(id)}/approve`, { method: "POST" }),
    deleteComment: id => request(`/admin/comments/${encodeURIComponent(id)}`, { method: "DELETE" }),
    checkInvite: code => request("/invites/check", { method: "POST", body: { code } }),
    registerContributor: payload => request("/contributors/register", { method: "POST", body: payload }),
    updateProfile: payload => request("/contributors/me/profile", { method: "POST", body: payload }),
    updateUsername: payload => request("/contributors/me/username", { method: "POST", body: payload }),
    changePassword: payload => request("/contributors/me/password", { method: "POST", body: payload }),
    uploadProfilePhoto: file => upload("/uploads/profile-photo", file),
    uploadForumMedia: file => upload("/uploads/forum-media", file),
    uploadArticleMedia: file => upload("/uploads/article-media", file),
    contributorArticles: () => request("/contributors/me/articles"),
    publicProfile: username => request(`/contributors/profile?username=${encodeURIComponent(username)}`),
    listArticles: destination => request(`/articles${destination ? `?destination=${encodeURIComponent(destination)}` : ""}`),
    createArticle: payload => request("/articles", { method: "POST", body: payload }),
    deleteArticle: id => request(`/articles/${encodeURIComponent(id)}`, { method: "DELETE" }),
    forumIndex: () => request("/forum"),
    forumTopic: id => request(`/forum/topics/${encodeURIComponent(id)}`),
    markForumTopicRead: id => request(`/forum/topics/${encodeURIComponent(id)}/read`, { method: "POST" }),
    createForumTopic: payload => request("/forum/topics", { method: "POST", body: payload }),
    createForumPost: (topicId, payload) => request(`/forum/topics/${encodeURIComponent(topicId)}/posts`, { method: "POST", body: payload }),
    setForumReaction: (postId, reaction) => request(`/forum/posts/${encodeURIComponent(postId)}/reactions`, { method: "POST", body: { reaction } }),
    deleteForumPost: id => request(`/forum/posts/${encodeURIComponent(id)}`, { method: "DELETE" }),
    listComments: pageId => request(`/comments?pageId=${encodeURIComponent(pageId)}`),
    createComment: payload => request("/comments", { method: "POST", body: payload })
  };
})();
