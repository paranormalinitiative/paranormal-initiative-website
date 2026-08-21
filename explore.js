(function () {
  const feedEl = document.querySelector("[data-explore-feed]");
  if (!feedEl) return;

  let items = [];
  let activeFilter = "all";
  let readItems = loadReadItems();

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
    items.forEach(item => readItems.add(getItemKey(item)));
    saveReadItems();
    renderFeed();
  });

  document.querySelector("[data-explore-mark-unread]")?.addEventListener("click", () => {
    items.forEach(item => readItems.delete(getItemKey(item)));
    saveReadItems();
    renderFeed();
  });

  loadFeed();
  markExploreSeen();
  window.setInterval(loadFeed, 45000);

  async function loadFeed() {
    try {
      const data = await window.TPIApi.communityFeed(40, 0);
      items = Array.isArray(data.items) ? data.items : [];
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

  function renderFeed() {
    const visible = items.filter(item => activeFilter === "all" || item.type === activeFilter);
    if (!visible.length) {
      feedEl.innerHTML = `
        <article class="member-explore-empty">
          <h3>No activity in this view yet.</h3>
          <p>New community posts, contributed work, and videos will appear here when members add them.</p>
        </article>
      `;
      return;
    }
    feedEl.innerHTML = visible.map(renderItem).join("");
    feedEl.querySelectorAll("[data-explore-item]").forEach(link => {
      link.addEventListener("click", () => {
        readItems.add(link.dataset.exploreItem);
        saveReadItems();
      });
    });
  }

  function renderItem(item) {
    const meta = getItemMeta(item);
    const href = getItemHref(item);
    const key = getItemKey(item);
    const readClass = readItems.has(key) ? " is-read" : " is-unread";
    return `
      <a class="member-explore-item${readClass}" href="${escapeAttr(href)}" data-explore-item="${escapeAttr(key)}">
        <div>
          <span class="member-explore-type">${escapeHtml(meta.typeLabel)}</span>
          <h3>${escapeHtml(meta.title)}</h3>
          <p>${escapeHtml(meta.description)}</p>
        </div>
        <small>${escapeHtml(meta.author)} · ${escapeHtml(formatDate(meta.date))}</small>
      </a>
    `;
  }

  function getItemMeta(item) {
    if (item.type === "forum_post") {
      return {
        typeLabel: item.categoryTitle || "Community Post",
        title: item.topicTitle || "Forum Topic",
        description: item.body || "Join the conversation.",
        author: item.authorName || "Community Member",
        date: item.topicCreatedAt || item.createdAt
      };
    }
    if (item.type === "chat") {
      return {
        typeLabel: "Chat",
        title: item.title || "Community Chat",
        description: item.description || item.body || "Join the live conversation.",
        author: item.authorName || "Community Member",
        date: item.startedAt || item.createdAt
      };
    }
    if (item.type === "article") {
      return {
        typeLabel: item.contributionType || "Contribution",
        title: item.title || "Published Contribution",
        description: item.description || "Read the contributed work.",
        author: item.authorName || "Contributor",
        date: item.createdAt
      };
    }
    if (item.type === "video") {
      return {
        typeLabel: item.isLive ? "Live Video" : "TPI Video",
        title: item.title || "TPI Video",
        description: item.description || "Watch the latest video activity.",
        author: "TPI Videos",
        date: item.publishedAt
      };
    }
    if (item.type === "photo") {
      return {
        typeLabel: "Photo",
        title: item.title || "Community Photo",
        description: item.description || "View the shared photo activity.",
        author: item.authorName || "Community Member",
        date: item.createdAt || item.publishedAt
      };
    }
    return {
      typeLabel: "Activity",
      title: item.title || "Community Activity",
      description: item.description || "",
      author: item.authorName || "TPI",
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

  function getItemKey(item) {
    return `${item.type || "activity"}:${item.id || item.topicId || item.slug || item.href || item.title || ""}`;
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
