(function () {
  const feedEl = document.querySelector("[data-explore-feed]");
  if (!feedEl) return;

  let items = [];
  let activeFilter = "all";
  let readItems = loadReadItems();
  let memberProfiles = new Map();
  const selectedItems = new Set();
  const selectAllBox = document.querySelector("[data-explore-select-all]");
  const composer = document.querySelector("[data-explore-composer]");
  const composerOpen = document.querySelector("[data-explore-composer-open]");
  const composerCancel = document.querySelector("[data-explore-composer-cancel]");
  const composerDelete = document.querySelector("[data-explore-composer-delete]");
  const composerExpanded = document.querySelector("[data-explore-composer-expanded]");
  const composerAvatar = document.querySelector("[data-explore-composer-avatar]");
  const composerName = document.querySelector("[data-explore-composer-name]");
  const composerRole = document.querySelector("[data-explore-composer-role]");
  const composeStatus = document.querySelector("[data-explore-compose-status]");
  const membersEl = document.querySelector("[data-feed-members]");
  const refreshButton = document.querySelector("[data-explore-refresh]");

  renderComposerIdentity();

  document.querySelectorAll("[data-explore-filter]").forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.exploreFilter || "all";
      document.querySelectorAll("[data-explore-filter]").forEach(filterButton => {
        filterButton.classList.toggle("portal-button-secondary", filterButton !== button);
      });
      renderFeed();
    });
  });

  document.querySelector("[data-explore-mark-read]")?.addEventListener("click", () => {
    getSelectedKeys().forEach(key => readItems.add(key));
    saveReadItems();
    renderFeed();
  });

  document.querySelector("[data-explore-mark-unread]")?.addEventListener("click", () => {
    getSelectedKeys().forEach(key => readItems.delete(key));
    saveReadItems();
    renderFeed();
  });

  refreshButton?.addEventListener("click", async () => {
    refreshButton.textContent = "Refreshing...";
    await loadFeed();
    refreshButton.textContent = "Feed Updated";
    window.setTimeout(() => {
      refreshButton.textContent = "Refresh Feed";
    }, 1300);
  });

  selectAllBox?.addEventListener("change", () => {
    getVisibleItems().forEach(item => {
      const key = getItemKey(item);
      if (selectAllBox.checked) {
        selectedItems.add(key);
      } else {
        selectedItems.delete(key);
      }
    });
    renderFeed();
  });

  composer?.addEventListener("submit", async event => {
    event.preventDefault();
    const titleInput = document.querySelector("[data-explore-title]");
    const bodyInput = document.querySelector("[data-explore-body]");
    const fileInput = document.querySelector("[data-explore-files]");
    const title = titleInput?.value.trim() || "";
    const body = bodyInput?.value.trim() || "";
    if (!title || !body) {
      setComposeStatus("Add a title and message before posting.");
      return;
    }
    try {
      setComposeStatus("Posting...");
      const attachments = await uploadFeedAttachments(fileInput?.files);
      const response = await window.TPIApi.createForumTopic({ categoryId: "general", title, body, attachments });
      titleInput.value = "";
      bodyInput.value = "";
      if (fileInput) fileInput.value = "";
      closeComposer();
      setComposeStatus("Posted to your feed.");
      await loadFeed();
      if (response?.topic?.id) {
        window.location.href = `community-forum.html?member=1&topic=${encodeURIComponent(response.topic.id)}${response.post?.id ? `&post=${encodeURIComponent(response.post.id)}` : ""}`;
      }
    } catch (error) {
      setComposeStatus(error.message || "Post could not be created.");
    }
  });

  composerOpen?.addEventListener("click", openComposer);
  composerCancel?.addEventListener("click", () => {
    clearComposer();
    closeComposer();
    setComposeStatus("");
  });

  composerDelete?.addEventListener("click", () => {
    clearComposer();
    closeComposer();
    setComposeStatus("");
  });

  loadFeed();
  markExploreSeen();
  window.setInterval(loadFeed, 45000);

  async function loadFeed() {
    try {
      const data = await window.TPIApi.communityFeed(40, 0);
      items = Array.isArray(data.items) ? data.items : [];
      renderActiveMembers();
      renderFeed();
    } catch (error) {
      feedEl.innerHTML = `
        <article class="member-explore-empty">
          <h3>Explore is ready for live community activity.</h3>
          <p>Once the live feed is available, new posts, contributions, videos, and chats will appear here with their start time.</p>
          <a class="portal-button" href="community-forum.html?member=1">Open Community Forum</a>
        </article>
      `;
    }
  }

  function openComposer() {
    if (!composerExpanded) return;
    composerExpanded.hidden = false;
    composer?.classList.add("is-open");
    composerOpen?.setAttribute("aria-expanded", "true");
    document.querySelector("[data-explore-title]")?.focus();
  }

  function closeComposer() {
    if (!composerExpanded) return;
    composerExpanded.hidden = true;
    composer?.classList.remove("is-open");
    composerOpen?.setAttribute("aria-expanded", "false");
  }

  function clearComposer() {
    const titleInput = document.querySelector("[data-explore-title]");
    const bodyInput = document.querySelector("[data-explore-body]");
    const fileInput = document.querySelector("[data-explore-files]");
    if (titleInput) titleInput.value = "";
    if (bodyInput) bodyInput.value = "";
    if (fileInput) fileInput.value = "";
  }

  async function renderComposerIdentity() {
    const user = await getActiveUser();
    const displayName = user?.displayName || user?.display_name || user?.username || "Todd Wayne";
    const role = user?.title || getRoleLabel(user?.role) || "Member";
    if (composerName) composerName.textContent = displayName;
    if (composerRole) composerRole.textContent = role;
    if (!composerAvatar) return;
    if (user?.photoUrl || user?.photo_url) {
      composerAvatar.innerHTML = `<img src="${escapeAttr(user.photoUrl || user.photo_url)}" alt="${escapeAttr(displayName)}">`;
      return;
    }
    composerAvatar.textContent = (displayName.trim().charAt(0) || "M").toUpperCase();
  }

  async function getActiveUser() {
    try {
      const data = await window.TPIApi.me();
      if (data.user) return data.user;
    } catch (error) {}
    const username = localStorage.getItem("tpiEditorSession");
    if (!username) return null;
    try {
      const users = JSON.parse(localStorage.getItem("tpiEditorContributors") || "[]");
      return users.find(user => user.username === username && user.active !== false) || null;
    } catch (error) {
      return null;
    }
  }

  function getRoleLabel(role) {
    return { owner: "Owner Access", admin: "Admin Access", contributor: "Contributor Access", member: "Member Access" }[role] || "";
  }

  function renderFeed() {
    const visible = getVisibleItems();
    if (!visible.length) {
      feedEl.innerHTML = `
        <article class="member-explore-empty">
          <h3>No activity in this view yet.</h3>
          <p>New community posts, contributed work, and videos will appear here when members add them.</p>
        </article>
      `;
      updateSelectAllState([]);
      return;
    }
    feedEl.innerHTML = visible.map(renderItem).join("");
    updateSelectAllState(visible);
    feedEl.querySelectorAll("[data-explore-check]").forEach(checkbox => {
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          selectedItems.add(checkbox.value);
        } else {
          selectedItems.delete(checkbox.value);
        }
        updateSelectAllState(getVisibleItems());
      });
    });
    feedEl.querySelectorAll("[data-explore-item]").forEach(link => {
      link.addEventListener("click", () => {
        readItems.add(link.dataset.exploreItem);
        saveReadItems();
      });
    });
    feedEl.querySelectorAll("[data-explore-share]").forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        shareItem(button.dataset.shareUrl, button.dataset.shareTitle);
      });
    });
  }

  function renderActiveMembers() {
    if (!membersEl) return;
    const members = [];
    const seen = new Set();
    memberProfiles = new Map();
    items.forEach(item => {
      const username = item.authorUsername || "";
      const name = item.authorName || item.authorDisplayName || "";
      const key = username || name;
      if (!key || seen.has(key)) return;
      seen.add(key);
      const member = {
        username,
        name: name || username,
        photoUrl: item.authorPhotoUrl || "",
        title: item.authorTitle || ""
      };
      members.push(member);
      memberProfiles.set(getMemberProfileKey(username, name), member);
    });
    if (!members.length) {
      membersEl.hidden = true;
      membersEl.innerHTML = "";
      return;
    }
    membersEl.hidden = false;
    membersEl.innerHTML = `
      <span class="member-feed-members-label">Active in feed</span>
      <div class="member-feed-member-list">
        ${members.slice(0, 12).map(renderActiveMember).join("")}
      </div>
    `;
  }

  function renderActiveMember(member) {
    const href = member.username ? `contributor-profile.html?username=${encodeURIComponent(member.username)}` : "community-forum.html?member=1";
    const initial = escapeHtml((member.name || "M").trim().charAt(0) || "M");
    return `
      <a class="member-feed-member" href="${escapeAttr(href)}">
        ${member.photoUrl
          ? `<img src="${escapeAttr(member.photoUrl)}" alt="${escapeAttr(member.name)}" loading="lazy">`
          : `<span>${initial}</span>`}
        <strong>${escapeHtml(member.name)}</strong>
      </a>
    `;
  }

  function renderItem(item) {
    const meta = getItemMeta(item);
    const href = getItemHref(item);
    const key = getItemKey(item);
    const readClass = readItems.has(key) ? " is-read" : " is-unread";
    const checked = selectedItems.has(key) ? " checked" : "";
    const absoluteHref = new URL(href, window.location.href).href;
    return `
      <article class="member-explore-row member-feed-post-card${readClass}">
        <label class="member-explore-check">
          <input type="checkbox" value="${escapeAttr(key)}" data-explore-check${checked}>
          <span>Select item</span>
        </label>
        <div class="member-explore-item-shell">
          <a class="member-explore-item" href="${escapeAttr(href)}" data-explore-item="${escapeAttr(key)}">
            <header class="member-feed-post-head">
              ${renderFeedAvatar(meta)}
              <div class="member-feed-post-author">
                <strong>${escapeHtml(meta.author)}</strong>
                <span>${escapeHtml(meta.authorTitle || meta.typeLabel)} · ${escapeHtml(formatDate(meta.date))}</span>
              </div>
              <span class="member-explore-type">${escapeHtml(meta.typeLabel)}</span>
            </header>
            <div class="member-feed-post-preview">
              <h3>${escapeHtml(meta.title)}</h3>
              <p>${escapeHtml(meta.description)}</p>
              ${renderMediaPreview(item)}
            </div>
          </a>
          <div class="member-explore-share-row">
            <a class="portal-button portal-button-secondary" href="${escapeAttr(href)}">Open</a>
            <button class="portal-button portal-button-secondary" type="button" data-explore-share data-share-url="${escapeAttr(absoluteHref)}" data-share-title="${escapeAttr(meta.title)}">Share</button>
          </div>
        </div>
      </article>
    `;
  }

  function getItemMeta(item) {
    if (item.type === "forum_post") {
      return {
        typeLabel: item.categoryTitle || "Community Post",
        title: item.topicTitle || "Forum Topic",
        description: getItemDescription(item, "Join the conversation."),
        author: getAuthorName(item, "Community Member"),
        authorTitle: item.authorTitle || "Community Member",
        authorPhotoUrl: getAuthorPhotoUrl(item),
        authorUsername: item.authorUsername || "",
        date: item.topicCreatedAt || item.createdAt
      };
    }
    if (item.type === "chat") {
      return {
        typeLabel: "Chat",
        title: item.title || "Community Chat",
        description: getItemDescription(item, "Join the live conversation."),
        author: getAuthorName(item, "Community Member"),
        authorTitle: item.authorTitle || "Chat",
        authorPhotoUrl: getAuthorPhotoUrl(item),
        authorUsername: item.authorUsername || "",
        date: item.startedAt || item.createdAt
      };
    }
    if (item.type === "article") {
      return {
        typeLabel: item.contributionType || "Contribution",
        title: item.title || "Published Contribution",
        description: getItemDescription(item, "Read the contributed work."),
        author: getAuthorName(item, "Contributor"),
        authorTitle: item.authorTitle || item.contributionType || "Contributor",
        authorPhotoUrl: getAuthorPhotoUrl(item),
        authorUsername: item.authorUsername || "",
        date: item.createdAt
      };
    }
    if (item.type === "video") {
      return {
        typeLabel: item.isLive ? "Live Video" : "TPI Video",
        title: item.title || "TPI Video",
        description: getItemDescription(item, "Watch the latest video activity."),
        author: "TPI Videos",
        authorTitle: item.isLive ? "Live Video" : "Video",
        authorPhotoUrl: getAuthorPhotoUrl(item),
        authorUsername: "",
        date: item.publishedAt
      };
    }
    if (item.type === "photo") {
      return {
        typeLabel: "Photo",
        title: item.title || "Community Photo",
        description: getItemDescription(item, "View the shared photo activity."),
        author: getAuthorName(item, "Community Member"),
        authorTitle: item.authorTitle || "Photo",
        authorPhotoUrl: getAuthorPhotoUrl(item),
        authorUsername: item.authorUsername || "",
        date: item.createdAt || item.publishedAt
      };
    }
    return {
      typeLabel: "Activity",
      title: item.title || "Community Activity",
      description: getItemDescription(item, ""),
      author: getAuthorName(item, "TPI"),
      authorTitle: item.authorTitle || "Activity",
      authorPhotoUrl: getAuthorPhotoUrl(item),
      authorUsername: item.authorUsername || "",
      date: item.createdAt || item.publishedAt
    };
  }

  function getItemHref(item) {
    if (item.type === "forum_post" && item.topicId) {
      const postParam = item.id ? `&post=${encodeURIComponent(item.id)}` : "";
      return `community-forum.html?member=1&topic=${encodeURIComponent(item.topicId)}${postParam}`;
    }
    if (item.type === "chat") return item.href || "community-forum.html?member=1";
    if (item.type === "article") return item.href || "education-center.html?member=1";
    if (item.type === "photo") return item.href || "community-forum.html?member=1";
    if (item.type === "video" && item.slug) return `tpi-video.html?slug=${encodeURIComponent(item.slug)}&member=1`;
    return "community-forum.html?member=1";
  }

  async function uploadFeedAttachments(files) {
    const selected = validateFeedFiles(files);
    if (!selected.length) return [];
    if (!window.TPIApi?.uploadForumMedia) throw new Error("Feed media upload is not available yet.");
    const uploaded = [];
    for (let index = 0; index < selected.length; index += 1) {
      const file = selected[index];
      setComposeStatus(`Uploading ${index + 1} of ${selected.length}...`);
      const result = await window.TPIApi.uploadForumMedia(file);
      uploaded.push({
        url: result.url,
        key: result.key,
        name: result.name || file.name,
        contentType: result.contentType || file.type,
        mediaType: file.type.startsWith("video/") ? "video" : "image"
      });
    }
    return uploaded;
  }

  function validateFeedFiles(files) {
    const selected = Array.from(files || []);
    const images = selected.filter(file => file.type.startsWith("image/"));
    const videos = selected.filter(file => file.type.startsWith("video/"));
    const unsupported = selected.filter(file => !file.type.startsWith("image/") && !file.type.startsWith("video/"));
    if (unsupported.length) throw new Error("Feed uploads can only include photos and videos.");
    if (images.length > 10) throw new Error("Please choose 10 images or fewer.");
    if (videos.length > 2) throw new Error("Please choose 2 videos or fewer.");
    return selected;
  }

  function renderMediaPreview(item) {
    const attachments = Array.isArray(item.attachments) ? item.attachments : [];
    if (item.type === "video" && item.thumbnail) {
      return `<div class="member-explore-media"><img src="${escapeAttr(item.thumbnail)}" alt="${escapeAttr(item.title || "Video preview")}" loading="lazy"></div>`;
    }
    if (!attachments.length) return "";
    return `
      <div class="member-explore-media">
        ${attachments.slice(0, 3).map(attachment => {
          const url = escapeAttr(attachment.url || "");
          if (!url) return "";
          const isVideo = String(attachment.mediaType || attachment.contentType || "").startsWith("video");
          return isVideo
            ? `<video src="${url}" muted preload="metadata"></video>`
            : `<img src="${url}" alt="${escapeAttr(attachment.name || "Feed attachment")}" loading="lazy">`;
        }).join("")}
      </div>
    `;
  }

  function renderFeedAvatar(meta) {
    const name = meta.author || "Member";
    const initial = escapeHtml(name.trim().charAt(0) || "M");
    if (meta.authorPhotoUrl) {
      return `<span class="member-feed-post-avatar"><img src="${escapeAttr(meta.authorPhotoUrl)}" alt="${escapeAttr(name)}" loading="lazy"></span>`;
    }
    return `<span class="member-feed-post-avatar">${initial}</span>`;
  }

  function getAuthorName(item, fallback) {
    return item.authorName || item.authorDisplayName || item.displayName || item.username || fallback;
  }

  function getAuthorPhotoUrl(item) {
    const profile = memberProfiles.get(getMemberProfileKey(item.authorUsername || "", item.authorName || item.authorDisplayName || ""));
    return item.authorPhotoUrl || profile?.photoUrl || "";
  }

  function getItemDescription(item, fallback) {
    return item.body || item.description || item.excerpt || item.summary || item.content || fallback;
  }

  function getMemberProfileKey(username, name) {
    return String(username || name || "").trim().toLowerCase();
  }

  async function shareItem(url, title) {
    try {
      if (navigator.share) {
        await navigator.share({ title: title || "TPI Feed", url });
      } else {
        await navigator.clipboard.writeText(url);
        setComposeStatus("Feed link copied.");
      }
    } catch (error) {}
  }

  function getItemKey(item) {
    return `${item.type || "activity"}:${item.id || item.topicId || item.slug || item.href || item.title || ""}`;
  }

  function getVisibleItems() {
    return items.filter(item => activeFilter === "all" || item.type === activeFilter);
  }

  function getSelectedKeys() {
    const visibleKeys = new Set(getVisibleItems().map(getItemKey));
    return Array.from(selectedItems).filter(key => visibleKeys.has(key));
  }

  function updateSelectAllState(visible) {
    if (!selectAllBox) return;
    const keys = visible.map(getItemKey);
    const selectedCount = keys.filter(key => selectedItems.has(key)).length;
    selectAllBox.checked = keys.length > 0 && selectedCount === keys.length;
    selectAllBox.indeterminate = selectedCount > 0 && selectedCount < keys.length;
  }

  function setComposeStatus(message) {
    if (composeStatus) composeStatus.textContent = message || "";
  }

  function loadReadItems() {
    try {
      return new Set(JSON.parse(localStorage.getItem("tpiExploreReadItems") || "[]"));
    } catch (error) {
      return new Set();
    }
  }

  function saveReadItems() {
    try {
      localStorage.setItem("tpiExploreReadItems", JSON.stringify(Array.from(readItems)));
    } catch (error) {}
  }

  function formatDate(value) {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function markExploreSeen() {
    try {
      localStorage.setItem("tpiExploreLastSeen", new Date().toISOString());
    } catch (error) {}
  }
})();
