/**
 * TPI Member Shell — Shared Member Mode Logic
 *
 * Provides the unified member navigation shell across all Member Mode pages.
 * Works alongside includes.js (which injects the public header/footer).
 *
 * Usage:
 *   <link rel="stylesheet" href="member-shell.css">
 *   <div data-member-content>...page content...</div>
 *   <script src="member-shell.js"></script>
 */
(async function () {
  var MEMBER_PARAM = "member";
  var STORAGE_KEY = "tpiMemberMode";
  var SIDEBAR_URL = "member-sidebar.html";

  // Pages that are ALWAYS member-only when authenticated.
  // These do NOT require ?member=1 — they check for a valid session directly.
  var INHERENT_MEMBER_PAGES = [
    "member-home",
    "member-dashboard",
    "member-notifications",
    "admin-panel",
    "admin-advanced-settings",
    "live-video",
    "podcast"
    // Future: "activity", "chat", "saved"
  ];

  // Run on every page load. If not member mode, do nothing.
  var memberMode = await detectMemberMode();
  if (!memberMode) return;

  if (document.readyState === "loading") {
    await new Promise(function (resolve) {
      document.addEventListener("DOMContentLoaded", resolve, { once: true });
    });
  }

  // Wait briefly for includes.js to finish injecting header/footer
  await delay(150);
  await initMemberShell();

  // ---- Member Mode Detection ----

  async function detectMemberMode() {
    var params = new URLSearchParams(window.location.search);
    var slug = getPageSlug();
    var isInherentMemberPage = INHERENT_MEMBER_PAGES.indexOf(slug) !== -1;

    // 1. Inherent member-only pages: activate if authenticated
    if (isInherentMemberPage) {
      var user = await quickSessionCheck();
      if (user) {
        try { localStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
        return true;
      }
      // Not authenticated on a member-only page — will redirect to login
      return true;
    }

    // 2. Explicit opt-in via ?member=1 query param (dual-mode pages)
    if (params.has(MEMBER_PARAM)) {
      try { localStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
      return true;
    }

    // 3. Persisted member mode from a previous ?member=1 visit (dual-mode pages)
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") {
        var sessionUser = await quickSessionCheck();
        if (sessionUser) return true;
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
    } catch (e) {}

    return false;
  }

  async function quickSessionCheck() {
    try {
      var resp = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (resp.ok) {
        var data = await resp.json();
        if (data.user) return data.user;
      }
    } catch (e) {}
    var username = null;
    try { username = localStorage.getItem("tpiEditorSession"); } catch (e) {}
    return username ? true : null;
  }

  // ---- Shell Initialization ----

  async function initMemberShell() {
    var contentEl = document.querySelector("[data-member-content]");
    if (!contentEl) return;

    // Set shell classes — hides public chrome and locks root page scroll via CSS
    document.documentElement.classList.add("member-mode-root");
    document.body.classList.add("member-mode");

    var user = await getSignedInUser();
    if (!user) {
      // Not signed in — exit member mode and redirect to login
      document.documentElement.classList.remove("member-mode-root");
      document.body.classList.remove("member-mode");
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      window.location.href = "member-login.html";
      return;
    }

    // Build shell structure: sidebar + main
    var shell = document.createElement("div");
    shell.className = "member-shell";
    var sidebar = document.createElement("aside");
    sidebar.className = "member-sidebar";
    sidebar.id = "member-sidebar-slot";
    var main = document.createElement("main");
    main.className = "member-main";

    // Insert shell before content, then move content into main
    contentEl.parentNode.insertBefore(shell, contentEl);
    shell.appendChild(sidebar);
    shell.appendChild(main);
    main.appendChild(contentEl);
    contentEl.hidden = false;

    // Inject sidebar HTML
    await injectSidebar(sidebar);

    // Set up page heading
    var greeting = getFirstName(user);
    setupPageHeading(main, greeting);

    // Set profile link
    setupProfileLink(user);

    // Set role-gated navigation
    setupRoleGatedNav(user);

    // Set notification badge
    setupNotificationBadge();
    setupExploreBadge();

    // Set up logout
    setupLogout();

    // Set up mobile nav
    injectMobileNav();

    // Mark ready
    document.body.classList.add("member-ready");
  }

  // ---- Sidebar Injection ----

  async function injectSidebar(sidebar) {
    if (sidebar.querySelector(".member-sidebar-identity")) return;
    try {
      var res = await fetch(SIDEBAR_URL, { cache: "no-store" });
      if (!res.ok) return;
      var html = await res.text();
      var template = document.createElement("template");
      template.innerHTML = html.trim();
      var loadedSidebar = template.content.querySelector(".member-sidebar");
      if (loadedSidebar) {
        sidebar.innerHTML = loadedSidebar.innerHTML;
        Array.prototype.forEach.call(loadedSidebar.attributes, function(attr) {
          if (attr.name !== "class") sidebar.setAttribute(attr.name, attr.value);
        });
      } else {
        sidebar.innerHTML = html;
      }
    } catch (e) {
      console.error("Failed to load member sidebar:", e);
      return;
    }

    // Activate current page in sidebar
    var slug = getPageSlug();
    var links = sidebar.querySelectorAll(".member-nav-link[data-nav]");
    links.forEach(function (link) {
      link.removeAttribute("aria-current");
      if (link.dataset.nav === slug) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  // ---- Page Heading ----

  function setupPageHeading(main, firstName) {
    // Check if page already has a custom heading (e.g. member-home.html has its own)
    if (main.querySelector(".member-page-header, .member-home-header, .community-home-header")) {
      // Just set greeting in existing elements
      var existingGreeting = main.querySelector("[data-member-greeting], .member-greeting-inline, .community-greeting-inline");
      if (existingGreeting) {
        existingGreeting.textContent = "Hello, " + firstName;
      }
      return;
    }

    // Auto-generate heading
    var pageTitle = getHeadingTitle();
    var header = document.createElement("div");
    header.className = "member-page-header";
    header.innerHTML =
      '<h2>' + escapeHtml(pageTitle) + '</h2>' +
      '<span class="member-greeting-inline">Hello, ' + escapeHtml(firstName) + '</span>';

    // Insert at top of main content
    var firstChild = main.firstChild;
    if (firstChild) {
      main.insertBefore(header, firstChild);
    } else {
      main.appendChild(header);
    }
  }

  function getHeadingTitle() {
    var ppTitle = document.querySelector('meta[name="pp:title"]');
    if (ppTitle && ppTitle.content) {
      // Map pp:title to friendly heading
      var title = ppTitle.content;
      if (title === "The Paranormal Initiative") return "Home";
      return title;
    }
    return document.title.split("|")[0].trim() || "Home";
  }

  // ---- Profile Link ----

  function setupProfileLink(user) {
    var href = "member-home.html?username=" + encodeURIComponent(user.username);
    var profileLink = document.querySelector('[data-nav-profile]');
    if (profileLink) profileLink.href = href;
    var profileLinkMobile = document.querySelector('[data-nav-profile-mobile]');
    if (profileLinkMobile) profileLinkMobile.href = href;
  }

  function setupRoleGatedNav(user) {
    var role = String(user && user.role || "").toLowerCase();
    var canUseAdminPanel = role === "owner" || role === "admin";
    document.querySelectorAll("[data-admin-only]").forEach(function (element) {
      element.hidden = !canUseAdminPanel;
    });
  }

  // ---- Logout ----

  function setupLogout() {
    var logoutLink = document.querySelector('[data-nav="logout"]');
    if (!logoutLink) return;
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      try { localStorage.removeItem(STORAGE_KEY); } catch (err) {}
      try { localStorage.removeItem("tpiEditorSession"); } catch (err) {}
      try {
        fetch("/api/auth/logout", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {}
      window.location.href = "member-login.html";
    });
  }

  // ---- Mobile Navigation ----

  function injectMobileNav() {
    if (document.querySelector(".member-mobile-nav")) return;
    var slug = getPageSlug();
    var nav = document.createElement("nav");
    nav.className = "member-mobile-nav";
    nav.setAttribute("aria-label", "Mobile member navigation");
    nav.innerHTML =
      '<div class="member-mobile-nav-inner">' +
        '<a class="mobile-nav-link" href="/?member=1" data-nav="home">' +
          '<span class="mobile-nav-icon">&#9679;</span>Home</a>' +
        '<a class="mobile-nav-link" href="tpi-videos.html?member=1" data-nav="tpi-videos">' +
          '<span class="mobile-nav-icon">&#9654;</span>Videos</a>' +
        '<a class="mobile-nav-link" href="community-forum.html?member=1" data-nav="community-forum">' +
          '<span class="mobile-nav-icon">&#9783;</span>Forum</a>' +
        '<a class="mobile-nav-link" href="member-home.html" data-nav="profile" data-nav-profile-mobile>' +
          '<span class="mobile-nav-icon">&#9786;</span>Profile</a>' +
        '<a class="mobile-nav-link" href="member-notifications.html" data-nav="member-notifications">' +
          '<span class="mobile-nav-icon">&#128276;</span>Alerts</a>' +
        '<a class="mobile-nav-link" href="member-dashboard.html" data-nav="settings">' +
          '<span class="mobile-nav-icon">&#9881;</span>Settings</a>' +
      '</div>';
    document.body.appendChild(nav);

    // Activate current page
    var links = nav.querySelectorAll(".mobile-nav-link[data-nav]");
    links.forEach(function (link) {
      if (link.dataset.nav === slug) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  async function setupNotificationBadge() {
    var badge = document.querySelector("[data-notification-count]");
    if (!badge) return;
    try {
      var resp = await fetch("/api/notifications/unread-count", { credentials: "same-origin", cache: "no-store" });
      if (!resp.ok) return;
      var data = await resp.json();
      var count = Number(data.unreadCount || 0);
      badge.textContent = count > 99 ? "99+" : String(count);
      badge.hidden = count <= 0;
    } catch (e) {}
  }

  async function setupExploreBadge() {
    var badge = document.querySelector("[data-explore-new]");
    if (!badge) return;
    try {
      var resp = await fetch("/api/feed?limit=1&offset=0", { credentials: "same-origin", cache: "no-store" });
      if (!resp.ok) return;
      var data = await resp.json();
      var item = Array.isArray(data.items) ? data.items[0] : null;
      var latest = getExploreItemDate(item);
      var lastSeen = localStorage.getItem("tpiExploreLastSeen") || "";
      var hasNew = latest && (!lastSeen || new Date(latest).getTime() > new Date(lastSeen).getTime());
      badge.hidden = !hasNew;
      var link = document.querySelector('[data-nav="explore"]');
      if (link) link.classList.toggle("has-new-content", Boolean(hasNew));
    } catch (e) {}
  }

  function getExploreItemDate(item) {
    if (!item) return "";
    return item.createdAt || item.publishedAt || item.startedAt || item.topicCreatedAt || "";
  }

  // ---- User Session ----

  async function getSignedInUser() {
    try {
      var response = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (response.ok) {
        var data = await response.json();
        if (data.user) return data.user;
      }
    } catch (error) {}
    var username = null;
    try { username = localStorage.getItem("tpiEditorSession"); } catch (e) {}
    if (!username) return null;
    try {
      var users = JSON.parse(localStorage.getItem("tpiEditorContributors") || "[]");
      return users.find(function (u) {
        return u.username === username && u.active !== false && !u.developerOwner;
      }) || null;
    } catch (error) {
      return null;
    }
  }

  // ---- Helpers ----

  function getPageSlug() {
    var path = window.location.pathname;
    var file = path.split("/").pop() || "index.html";
    var slug = file.replace(/\.html$/, "");
    if (!slug || slug === "index") return "home";
    return slug;
  }

  function getFirstName(user) {
    return String(user.displayName || user.username || "Member").trim().split(/\s+/)[0] || "Member";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function delay(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  // ---- Member Mode URL Preservation ----
  // Expose globally so inline JS in dual-mode pages can preserve ?member=1
  // when generating dynamic links to other dual-mode TPI pages.
  window.preserveMemberMode = function (url) {
    if (!url) return url;
    if (!document.body.classList.contains("member-mode")) return url;
    // Already has member param — leave it alone
    if (/[?&]member=/.test(url)) return url;

    // Separate fragment from URL
    var hashIndex = url.indexOf("#");
    var hash = hashIndex !== -1 ? url.substring(hashIndex) : "";
    var base = hashIndex !== -1 ? url.substring(0, hashIndex) : url;

    // Append member=1 preserving existing query string
    var separator = base.indexOf("?") !== -1 ? "&" : "?";
    return base + separator + "member=1" + hash;
  };
})();
