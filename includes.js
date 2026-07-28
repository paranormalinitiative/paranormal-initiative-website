(async function () {
  function isEditableTarget(target) {
    if (!target || target === document) return false;
    const editable = target.closest?.("input, textarea, select, [contenteditable='true']");
    return Boolean(editable);
  }

  function isLockedSiteChrome(target) {
    return Boolean(target?.closest?.(".command-header, .command-nav, footer"));
  }

  function isDiscussionPortalTarget(target) {
    return Boolean(target?.closest?.(".discussion-portal"));
  }

  function installContentProtection() {
    const blockedEvents = ["contextmenu", "copy", "cut", "dragstart"];
    let devUnlockClicks = 0;
    let devUnlockTimer;

    function isDevCopyMode() {
      return localStorage.getItem("tpiDevCopyMode") === "enabled";
    }

    function getCachedMember() {
      const username = localStorage.getItem("tpiEditorSession");
      if (!username) return null;
      try {
        const users = JSON.parse(localStorage.getItem("tpiEditorContributors") || "[]");
        return users.find(user => user.username === username && user.active !== false) || null;
      } catch (error) {
        return null;
      }
    }

    function isLeadershipCopyAllowed() {
      const user = getCachedMember();
      const role = String(user?.role || "").toLowerCase();
      const title = String(user?.title || "").toLowerCase().replace(/\s+/g, " ").trim();
      return role === "owner" ||
        role === "admin" ||
        ["founder / director", "founder/director", "founder director", "assistant director"].includes(title);
    }

    function isCopyAllowed(target) {
      return isDevCopyMode() ||
        isLeadershipCopyAllowed() ||
        isDiscussionPortalTarget(target) ||
        document.body?.dataset.editorCopyAllowed === "true";
    }

    function setDevCopyMode(enabled) {
      localStorage.setItem("tpiDevCopyMode", enabled ? "enabled" : "disabled");
      document.documentElement.classList.toggle("dev-copy-mode", enabled);
      showDevCopyToast(enabled);
    }

    function showDevCopyToast(enabled) {
      const existing = document.querySelector(".dev-copy-toast");
      if (existing) existing.remove();

      const toast = document.createElement("div");
      toast.className = "dev-copy-toast";
      toast.textContent = enabled ? "Dev copy mode enabled" : "Dev copy mode disabled";
      document.body.appendChild(toast);

      window.setTimeout(() => {
        toast.classList.add("dev-copy-toast-hide");
        window.setTimeout(() => toast.remove(), 350);
      }, 1800);
    }

    function installDevCopyUnlock() {
      document.documentElement.classList.toggle("dev-copy-mode", isDevCopyMode());

      document.addEventListener("click", event => {
        const x = event.clientX;
        const y = event.clientY;
        const inUnlockZone = x > window.innerWidth - 96 && y > window.innerHeight - 96;

        if (!inUnlockZone) {
          devUnlockClicks = 0;
          return;
        }

        devUnlockClicks += 1;
        window.clearTimeout(devUnlockTimer);
        devUnlockTimer = window.setTimeout(() => {
          devUnlockClicks = 0;
        }, 2500);

        if (devUnlockClicks >= 10) {
          devUnlockClicks = 0;
          setDevCopyMode(!isDevCopyMode());
        }
      });
    }

    blockedEvents.forEach(eventName => {
      document.addEventListener(eventName, event => {
        if (isLockedSiteChrome(event.target) && !isEditableTarget(event.target)) {
          event.preventDefault();
          return;
        }
        if (isCopyAllowed(event.target)) return;
        if (isEditableTarget(event.target)) return;
        event.preventDefault();
      });
    });

    document.addEventListener("selectstart", event => {
      if (isLockedSiteChrome(event.target) && !isEditableTarget(event.target)) {
        event.preventDefault();
        return;
      }
      if (isCopyAllowed(event.target)) return;
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
    });

    document.addEventListener("keydown", event => {
      if (isLockedSiteChrome(event.target) && !isEditableTarget(event.target)) {
        const key = event.key.toLowerCase();
        const modifier = event.metaKey || event.ctrlKey;
        if (modifier && ["a", "c", "x", "s", "u", "p"].includes(key)) {
          event.preventDefault();
        }
        return;
      }
      if (isCopyAllowed(event.target)) return;
      if (isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const modifier = event.metaKey || event.ctrlKey;
      const blockedShortcut = modifier && ["a", "c", "x", "s", "u", "p"].includes(key);
      const blockedDevTools =
        event.key === "F12" ||
        (modifier && event.shiftKey && ["i", "j", "c"].includes(key));

      if (blockedShortcut || blockedDevTools) {
        event.preventDefault();
      }
    });

    document.querySelectorAll("img").forEach(img => {
      img.setAttribute("draggable", "false");
    });

    installDevCopyUnlock();
  }

  async function inject(selector, url) {
    const host = document.querySelector(selector);
    if (!host) return;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`Failed to load ${url}:`, res.status);
      return;
    }

    host.innerHTML = await res.text();
  }

  await inject("#site-header", "header.html");
  await inject("#site-footer", "footer.html");
  installContentProtection();
  installMemberGreeting();
  installHeaderSearch();

  // Per-page title/subtitle (optional)
  const titleMeta = document.querySelector('meta[name="pp:title"]');
  const subtitleMeta = document.querySelector('meta[name="pp:subtitle"]');

  if (titleMeta) {
    const t = document.getElementById("page-title");
    if (t) t.textContent = titleMeta.content;
  }

  if (subtitleMeta) {
    const s = document.getElementById("page-subtitle");
    if (s) s.textContent = subtitleMeta.content;
  }

  async function installMemberGreeting() {
    const header = document.querySelector(".command-header");
    if (!header || document.querySelector(".member-greeting")) return;

    const user = await getSignedInUser();
    if (!user) return;

    const firstName = String(user.displayName || user.username || "Member").trim().split(/\s+/)[0] || "Member";
    const badge = document.createElement("div");
    badge.className = "member-greeting";
    badge.innerHTML = `
      <a class="member-dashboard-link" href="member-dashboard.html">
        <span>Hello, ${escapeGreeting(firstName)}</span>
        <strong>Member Dashboard</strong>
      </a>
      <button type="button" data-header-logout>Sign Out</button>
    `;
    header.appendChild(badge);

    badge.querySelector("[data-header-logout]").addEventListener("click", async () => {
      localStorage.removeItem("tpiEditorSession");
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        // Local previews do not always have the Cloudflare API.
      }
      window.location.href = "member-login.html";
    });
  }

  async function getSignedInUser() {
    try {
      const response = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (response.ok) {
        const data = await response.json();
        if (data.user) return data.user;
      }
    } catch (error) {
      // Fall back to local preview state.
    }

    const username = localStorage.getItem("tpiEditorSession");
    if (!username) return null;
    try {
      const users = JSON.parse(localStorage.getItem("tpiEditorContributors") || "[]");
      return users.find(user => user.username === username && user.active !== false && !user.developerOwner) || null;
    } catch (error) {
      return null;
    }
  }

  function escapeGreeting(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function installHeaderSearch() {
    const form = document.querySelector("[data-site-search-form]");
    const input = document.querySelector("[data-site-search-input]");
    if (!form || !input) return;

    form.addEventListener("submit", event => {
      event.preventDefault();
      const query = input.value.trim();
      window.location.href = query ? `search.html?q=${encodeURIComponent(query)}` : "search.html";
    });
  }

  function installComments() {
    if (document.body.classList.contains("paper-editor-page") || document.querySelector(".tpi-comments")) return;
    const footerHost = document.getElementById("site-footer");
    if (!footerHost) return;

    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const normalizedPath = window.location.pathname.replace(/\/+$/, "");
    const isPublishedArticleRoute =
      currentPage === "published-article.html" ||
      currentPage === "published-article" ||
      normalizedPath.endsWith("/published-article");
    const articleId = new URLSearchParams(window.location.search).get("id");
    const pageId = isPublishedArticleRoute && articleId ? `published-article:${articleId}` : currentPage;
    if (!shouldShowComments(currentPage, isPublishedArticleRoute)) return;

    const storageKey = `tpiComments:${pageId}`;
    const contributorSignature = getContributorSignature();
    let cloudflareComments = null;

    async function apiRequest(path, options = {}) {
      const response = await fetch(`/api${path}`, {
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined
      });
      if (!response.ok) throw new Error("Cloudflare API request failed.");
      return response.json();
    }

    function shouldShowComments(currentPage, isPublishedArticleRoute) {
      if (isPublishedArticleRoute) return true;

      const articlePrefixes = [
        "education-research-",
        "investigation-development-",
        "ghostology-101-lesson-",
        "evp-itc-lesson-"
      ];

      const hubPages = new Set([
        "investigation-development-series.html",
        "ghostology-101.html",
        "evp-itc-lessons.html",
        "field-articles.html",
        "method-exercises.html",
        "repository-pathways.html",
        "education-center.html"
      ]);

      const pageSlug = currentPage.replace(/\.html$/, "");

      if (hubPages.has(currentPage) || hubPages.has(`${pageSlug}.html`)) return false;
      if (pageSlug.startsWith("education-area-")) return false;
      if (
        pageSlug.startsWith("anabela-cardoso-") &&
        pageSlug !== "anabela-cardoso-profile" &&
        pageSlug !== "anabela-cardoso-papers"
      ) return true;

      return articlePrefixes.some(prefix => currentPage.startsWith(prefix));
    }

    function getComments() {
      if (cloudflareComments) return cloudflareComments;
      try {
        const comments = JSON.parse(localStorage.getItem(storageKey) || "[]");
        let changed = false;
        const normalized = comments.map(comment => {
          const normalizedComment = {
            ...comment,
            id: comment.id || makeCommentId(),
            replies: Array.isArray(comment.replies) ? comment.replies : []
          };
          if (!comment.id || !Array.isArray(comment.replies)) changed = true;
          return normalizedComment;
        });
        if (changed) saveComments(normalized);
        return normalized;
      } catch (error) {
        return [];
      }
    }

    function saveComments(comments) {
      localStorage.setItem(storageKey, JSON.stringify(comments));
    }

    async function loadCloudflareComments() {
      try {
        const data = await apiRequest(`/comments?pageId=${encodeURIComponent(pageId)}`);
        cloudflareComments = data.comments || [];
        renderComments();
      } catch (error) {
        cloudflareComments = null;
      }
    }

    function escapeComment(value) {
      return String(value || "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char]));
    }

    function makeCommentId() {
      if (window.crypto?.randomUUID) return window.crypto.randomUUID();
      return `comment-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    function formatCommentDate(value) {
      const date = value ? new Date(value) : null;
      if (!date || Number.isNaN(date.getTime())) return "";
      return date.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
    }

    function getContributorSignature() {
      const username = localStorage.getItem("tpiEditorSession");
      if (!username) return null;

      let users = [];
      try {
        users = JSON.parse(localStorage.getItem("tpiEditorContributors") || "[]");
      } catch (error) {
        users = [];
      }

      const user = users.find(candidate => candidate.username === username && candidate.active !== false);
      if (!user || user.commentSignatureEnabled === false) return null;

      const name = user.displayName || user.username || "";
      const title = user.title || user.role || "";
      if (!name) return null;
      return { name, title, username: user.username || "" };
    }

    function getSubmittedIdentity(form, nameField, useProfileField) {
      const useProfile = contributorSignature && form.querySelector(`[name='${useProfileField}']`)?.checked;
      if (useProfile) {
        return {
          name: contributorSignature.name,
          authorTitle: contributorSignature.title,
          authorUsername: contributorSignature.username
        };
      }

      return {
        name: String(new FormData(form).get(nameField) || "").trim(),
        authorTitle: "",
        authorUsername: ""
      };
    }

    function renderCommentAuthor(name, authorTitle, fallback, authorUsername) {
      const displayName = escapeComment(name || fallback);
      const nameHtml = authorUsername
        ? `<a href="contributor-profile.html?username=${encodeURIComponent(authorUsername)}">${displayName}</a>`
        : displayName;
      return `
        <div>
          <h3>${nameHtml}</h3>
          ${authorTitle ? `<strong class="tpi-comment-title">${escapeComment(authorTitle)}</strong>` : ""}
        </div>
      `;
    }

    const section = document.createElement("section");
    section.className = "tpi-comments";
    section.innerHTML = `
      <div class="tpi-comments-inner">
        <h2>Comments</h2>
        <p>${contributorSignature ? `Signed in comments can use your contributor name and title automatically.` : `You may comment anonymously or add your name if you would like it shown.`}</p>
        <form class="tpi-comment-form">
          ${contributorSignature ? `
          <label class="tpi-comment-profile">
            <input name="useContributorProfile" type="checkbox" checked>
            <span>Post as ${escapeComment(contributorSignature.name)}${contributorSignature.title ? ` - ${escapeComment(contributorSignature.title)}` : ""}</span>
          </label>` : ""}
          <label>
            <span>Name (optional)</span>
            <input name="name" type="text" placeholder="Anonymous Contributor">
          </label>
          <label>
            <span>Comment</span>
            <textarea name="comment" rows="4" required></textarea>
          </label>
          <button type="submit">Post Comment</button>
        </form>
        <div class="tpi-comment-list" aria-live="polite"></div>
      </div>
    `;

    function renderComments() {
      const list = section.querySelector(".tpi-comment-list");
      const comments = getComments();
      list.innerHTML = comments.length ? comments.map(comment => `
        <article class="tpi-comment">
          <div class="tpi-comment-meta">
            ${renderCommentAuthor(comment.name, comment.authorTitle, "Anonymous Contributor", comment.authorUsername)}
            <time>${escapeComment(formatCommentDate(comment.createdAt))}</time>
          </div>
          <p>${escapeComment(comment.text)}</p>
          ${Array.isArray(comment.replies) && comment.replies.length ? `
            <div class="tpi-replies">
              ${comment.replies.map(reply => `
                <article class="tpi-reply">
                  <div class="tpi-comment-meta">
                    ${renderCommentAuthor(reply.name, reply.authorTitle, "TPI Reply", reply.authorUsername)}
                    <time>${escapeComment(formatCommentDate(reply.createdAt))}</time>
                  </div>
                  <p>${escapeComment(reply.text)}</p>
                </article>
              `).join("")}
            </div>
          ` : ""}
          <form class="tpi-reply-form" data-comment-id="${escapeComment(comment.id || "")}">
            ${contributorSignature ? `
            <label class="tpi-comment-profile">
              <input name="useContributorProfile" type="checkbox" checked>
              <span>Reply as ${escapeComment(contributorSignature.name)}${contributorSignature.title ? ` - ${escapeComment(contributorSignature.title)}` : ""}</span>
            </label>` : ""}
            <label>
              <span>Reply name (optional)</span>
              <input name="name" type="text" placeholder="TPI Reply">
            </label>
            <label>
              <span>Reply</span>
              <textarea name="reply" rows="3" required></textarea>
            </label>
            <button type="submit">Reply</button>
          </form>
        </article>
      `).join("") : `<p class="tpi-comment-empty">No comments yet.</p>`;
    }

    section.addEventListener("submit", async event => {
      event.preventDefault();
      const replyForm = event.target.closest(".tpi-reply-form");
      if (replyForm) {
        const data = new FormData(replyForm);
        const identity = getSubmittedIdentity(replyForm, "name", "useContributorProfile");
        const text = String(data.get("reply") || "").trim();
        if (!text) return;

        const comments = getComments();
        const comment = comments.find(item => item.id === replyForm.dataset.commentId);
        if (!comment) return;

        if (cloudflareComments) {
          try {
            const result = await apiRequest("/comments", {
              method: "POST",
              body: {
                pageId,
                parentId: comment.id,
                name: identity.name,
                authorTitle: identity.authorTitle,
                authorUsername: identity.authorUsername,
                text,
                useContributorProfile: Boolean(contributorSignature && replyForm.querySelector("[name='useContributorProfile']")?.checked)
              }
            });
            replyForm.reset();
            if (result.status === "pending") {
              window.alert("Your reply was received and is waiting for approval.");
            }
            await loadCloudflareComments();
            return;
          } catch (error) {
            // Fall back to local prototype below.
          }
        }

        comment.replies = Array.isArray(comment.replies) ? comment.replies : [];
        comment.replies.push({
          name: identity.name,
          authorTitle: identity.authorTitle,
          authorUsername: identity.authorUsername,
          text,
          createdAt: new Date().toISOString()
        });
        saveComments(comments);
        replyForm.reset();
        renderComments();
        return;
      }

      const commentForm = event.target.closest(".tpi-comment-form");
      if (!commentForm) return;
      const data = new FormData(commentForm);
      const identity = getSubmittedIdentity(commentForm, "name", "useContributorProfile");
      const text = String(data.get("comment") || "").trim();
      if (!text) return;

      if (cloudflareComments) {
        try {
          const result = await apiRequest("/comments", {
            method: "POST",
            body: {
              pageId,
              name: identity.name,
              authorTitle: identity.authorTitle,
              text,
              useContributorProfile: Boolean(contributorSignature && commentForm.querySelector("[name='useContributorProfile']")?.checked)
            }
          });
          commentForm.reset();
          if (result.status === "pending") {
            window.alert("Your comment was received and is waiting for approval.");
          }
          await loadCloudflareComments();
          return;
        } catch (error) {
          // Fall back to local prototype below.
        }
      }

      const comments = getComments();
      comments.push({
        id: makeCommentId(),
        name: identity.name,
        authorTitle: identity.authorTitle,
        authorUsername: identity.authorUsername,
        text,
        replies: [],
        status: "local-prototype",
        createdAt: new Date().toISOString()
      });
      saveComments(comments);
      commentForm.reset();
      renderComments();
    });

    footerHost.before(section);
    renderComments();
    loadCloudflareComments();
  }

  function installPublishedArticleCards() {
    const current = window.location.pathname.split("/").pop() || "index.html";
    const currentWithoutExtension = current.replace(/\.html$/, "");
    const currentWithExtension = current.endsWith(".html") ? current : `${current}.html`;
    const grid =
      document.querySelector(".study-resource-grid") ||
      document.querySelector(".series-post-grid") ||
      document.querySelector(".learning-grid");
    if (!grid) return;

    function escapeCard(value) {
      return String(value || "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char]));
    }

    function appendArticleCard(article) {
      if ([...grid.querySelectorAll("[data-published-id]")].some(card => card.dataset.publishedId === article.id)) return;
      const contributionType = article.contributionType || article.articleType || "Published Article";
      const cardBadge = contributionType.replace(/\s*\/\s*/g, " / ").split(/\s+/)[0] || "Field";
      const card = document.createElement("a");
      card.className = grid.classList.contains("series-post-grid") ? "study-resource-card tpi-published-card" : "study-resource-card tpi-published-card";
      card.href = article.href || `published-article.html?id=${encodeURIComponent(article.id)}`;
      card.dataset.publishedId = article.id;
      card.innerHTML = `
        <div class="study-resource-card-media"><span>${escapeCard(cardBadge)}</span></div>
        <div class="study-resource-card-copy">
          <span>${escapeCard(contributionType)}</span>
          <h3>${escapeCard(article.title)}</h3>
          ${article.subtitle ? `<p>${escapeCard(article.subtitle)}</p>` : ""}
          <strong>Open ${escapeCard(contributionType)}</strong>
        </div>
      `;
      const firstStaticCard = grid.querySelector(":scope > :not(.tpi-published-card)");
      grid.insertBefore(card, firstStaticCard || null);
    }

    async function loadCloudflareArticleCards() {
      try {
        const response = await fetch(`/api/articles?destination=${encodeURIComponent(current)}`, { credentials: "same-origin", cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        (data.articles || []).forEach(appendArticleCard);
      } catch (error) {
        // Local-only previews do not have the Cloudflare API.
      }
    }

    let articles = [];
    try {
      articles = JSON.parse(localStorage.getItem("tpiPublishedArticles") || "[]");
    } catch (error) {
      articles = [];
    }

    articles
      .filter(article => article.destination === current || article.destination === currentWithoutExtension || article.destination === currentWithExtension)
      .forEach(appendArticleCard);
    loadCloudflareArticleCards();
  }

  installPublishedArticleCards();
  installComments();

  // Auto-active nav link (for injected header pages)
  try {
    const path = window.location.pathname;
    const current = path.split("/").pop() || "index.html";

    const nav = document.querySelector(".command-nav");
    if (nav) {
      const links = nav.querySelectorAll("a[href]");
      links.forEach(a => a.removeAttribute("aria-current"));

      links.forEach(a => {
        const href = a.getAttribute("href");
        if (!href) return;

        const hrefFile = href.split("/").pop();
        if (hrefFile === current) {
          a.setAttribute("aria-current", "page");
        }
      });
    }
  } catch (e) {
    console.warn("Nav active state failed:", e);
  }
})();
