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

  if (document.readyState === "loading") {
    await new Promise(function (resolve) {
      document.addEventListener("DOMContentLoaded", resolve, { once: true });
    });
  }

  // Run on pages that use the shared shell. Public visitors should see the
  // same navigation chrome; only member-only actions stay protected.
  var shellMode = await detectMemberMode();
  if (!shellMode) return;

  // Wait briefly for includes.js to finish injecting header/footer
  await delay(150);
  await initMemberShell();

  // ---- Member Mode Detection ----

  async function detectMemberMode() {
    var params = new URLSearchParams(window.location.search);
    var slug = getPageSlug();
    var isInherentMemberPage = INHERENT_MEMBER_PAGES.indexOf(slug) !== -1;
    var hasShellContent = Boolean(document.querySelector("[data-member-content]"));

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

    // 3. Pages that already opted into the shared shell use it publicly too.
    // This keeps Opera/Safari/Chrome from seeing a different "old" site.
    if (hasShellContent) {
      return true;
    }

    // 4. Persisted member mode from a previous ?member=1 visit (legacy support)
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
    var requiresAuth = INHERENT_MEMBER_PAGES.indexOf(getPageSlug()) !== -1;

    // Set shell classes — hides public chrome and locks root page scroll via CSS
    document.documentElement.classList.add("member-mode-root");
    document.body.classList.add("member-mode");

    var user = await getSignedInUser();
    if (!user) {
      if (requiresAuth) {
        // Not signed in on a protected page — redirect to login.
        document.documentElement.classList.remove("member-mode-root");
        document.body.classList.remove("member-mode");
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        window.location.href = "member-login.html";
        return;
      }
      user = {
        username: "guest",
        displayName: "Visitor",
        role: "guest",
        guest: true
      };
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
    var greeting = user.guest ? "" : getFirstName(user);
    setupPageHeading(main, greeting);

    // Set profile link
    setupProfileLink(user);

    // Set role-gated navigation
    setupRoleGatedNav(user);

    // Set up mobile nav before badges so desktop and mobile alerts update together.
    injectMobileNav();

    // Set notification badge
    setupNotificationBadge();
    startNotificationBadgePolling();
    setupExploreBadge();

    // Set up logout
    setupLogout();

    // Finish mobile navigation identity and role access.
    setupProfileLink(user);
    setupRoleGatedNav(user);

    // Set up floating community chat for signed-in members only.
    if (!user.guest) {
      await initFloatingChat(user);
      setupMessengerNavigation();
      try {
        var params = new URLSearchParams(window.location.search);
        var openChatId = params.get("openChat");
        if (openChatId && window.TPIMessenger && typeof window.TPIMessenger.openConversation === "function") {
          await window.TPIMessenger.openConversation(openChatId);
          params.delete("openChat");
          var newUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "") + window.location.hash;
          window.history.replaceState({}, "", newUrl);
        }
      } catch (e) {}
    }

    // Mark ready
    document.body.classList.add("member-ready");
  }

  function setupMessengerNavigation() {
    function openMessenger() {
      if (window.TPIMessenger && typeof window.TPIMessenger.show === "function") {
        window.TPIMessenger.show();
      }
    }
    document.querySelectorAll('a[href="#messenger"], [data-nav="chat"]').forEach(function(link) {
      link.addEventListener("click", function(event) {
        event.preventDefault();
        openMessenger();
        window.history.replaceState({}, "", window.location.pathname + window.location.search + "#messenger");
      });
    });
    if (window.location.hash === "#messenger") openMessenger();
    window.addEventListener("hashchange", function() {
      if (window.location.hash === "#messenger") openMessenger();
    });
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
        if (firstName) {
          existingGreeting.textContent = "Hello, " + firstName;
        } else {
          existingGreeting.remove();
        }
      }
      return;
    }

    // Auto-generate heading
    var pageTitle = getHeadingTitle();
    var header = document.createElement("div");
    header.className = "member-page-header";
    header.innerHTML =
      '<h2>' + escapeHtml(pageTitle) + '</h2>' +
      (firstName ? '<span class="member-greeting-inline">Hello, ' + escapeHtml(firstName) + '</span>' : "");

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
    if (user && user.guest) {
      document.querySelectorAll('[data-nav="profile"], [data-nav="settings"], [data-nav="logout"], [data-nav="member-notifications"], [data-nav="explore"], [data-nav="paper-editor"]').forEach(function(link) {
        link.href = "member-login.html";
      });
      return;
    }
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
    document.body.classList.toggle("member-guest-mode", Boolean(user && user.guest));
    if (user && user.guest) {
      document.querySelectorAll('[data-nav="logout"]').forEach(function (element) {
        element.innerHTML = '<span class="nav-icon">&#8594;</span> Member Login';
      });
      document.querySelectorAll('[data-nav="profile"]').forEach(function (element) {
        element.innerHTML = '<span class="nav-icon">&#9786;</span> Free Membership';
      });
      document.querySelectorAll('[data-nav="settings"], [data-nav="saved"]').forEach(function (element) {
        element.hidden = true;
      });
      document.querySelectorAll('[data-nav="member-notifications"], [data-nav="explore"], [data-nav="paper-editor"]').forEach(function (element) {
        element.classList.add("is-member-protected");
      });
    }
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
          '<span class="mobile-nav-icon">&#128276;</span>Alerts' +
          '<span class="member-mobile-notification-badge" data-notification-count hidden>0</span></a>' +
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

  var notificationBadgeRefreshInFlight = false;
  var notificationBadgeTimer = null;

  async function setupNotificationBadge() {
    var badges = Array.from(document.querySelectorAll("[data-notification-count]"));
    if (!badges.length || notificationBadgeRefreshInFlight) return;
    notificationBadgeRefreshInFlight = true;
    try {
      var resp = await fetch("/api/notifications/unread-count", { credentials: "same-origin", cache: "no-store" });
      if (!resp.ok) {
        renderNotificationBadges(badges, 0);
        return;
      }
      var data = await resp.json();
      renderNotificationBadges(badges, Number(data.unreadCount || 0));
    } catch (e) {
      renderNotificationBadges(badges, 0);
    } finally {
      notificationBadgeRefreshInFlight = false;
    }
  }

  function renderNotificationBadges(badges, count) {
    badges.forEach(function(badge) {
      badge.textContent = count > 99 ? "99+" : String(count);
      badge.hidden = count <= 0;
      var link = badge.closest("a");
      if (!link) return;
      link.classList.toggle("has-unread-notifications", count > 0);
      link.setAttribute("aria-label", count > 0 ? "Notifications, " + count + " unread" : "Notifications");
    });
  }

  function startNotificationBadgePolling() {
    if (notificationBadgeTimer) return;
    notificationBadgeTimer = window.setInterval(setupNotificationBadge, 15000);
    window.addEventListener("focus", setupNotificationBadge);
    window.addEventListener("tpi:notifications-changed", setupNotificationBadge);
    document.addEventListener("visibilitychange", function() {
      if (!document.hidden) setupNotificationBadge();
    });
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

  async function initFloatingChat(user) {
    if (document.querySelector("[data-member-floating-chat]")) return;
    var roster = await loadChatRoster(user);
    var chatState = await loadChatState(user, roster);
    var currentChat = chatState.currentChat;
    var chatList = chatState.chatList;
    var chat = document.createElement("section");
    var emojiGroups = [
      {
            "label": "Recent",
            "icons": "🙂 😀 😃 😄 😁 😆 😅 😂 🤣 😊 😍 😘 😎 🥳 🤔 😴 👍 👎 ❤️ ✅ 🎉 👻 📷 🎧 🔎"
      },
      {
            "label": "Smileys & Emotion",
            "icons": "😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 🫠 😉 😊 😇 🥰 😍 🤩 😘 😗 ☺️ 😚 😙 🥲 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🫢 🫣 🤫 🤔 🫡 🤐 🤨 😐 😑 😶 🫥 😶‍🌫️ 😏 😒 🙄 😬 😮‍💨 🤥 🫨 🙂‍↔️ 🙂‍↕️ 😌 😔 😪 🤤 😴 🫩 😷 🤒 🤕 🤢 🤮 🤧 🥵 🥶 🥴 😵 😵‍💫 🤯 🤠 🥳 🥸 😎 🤓 🧐 😕 🫤 😟 🙁 ☹️ 😮 😯 😲 😳 🫪 🥺 🥹 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 ☠️ 💩 🤡 👹 👺 👻 👽 👾 🤖 😺 😸 😹 😻 😼 😽 🙀 😿 😾 🙈 🙉 🙊 💌 💘 💝 💖 💗 💓 💞 💕 💟 ❣️ 💔 ❤️‍🔥 ❤️‍🩹 ❤️ 🩷 🧡 💛 💚 💙 🩵 💜 🤎 🖤 🩶 🤍 💋 💯 💢 🫯 💥 💫 💦 💨 🕳️ 💬 👁️‍🗨️ 🗨️ 🗯️ 💭 💤"
      },
      {
            "label": "People & Body",
            "icons": "👋 🤚 🖐️ ✋ 🖖 🫱 🫲 🫳 🫴 🫷 🫸 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝️ 🫵 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 🫶 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦿 🦵 🦶 👂 🦻 👃 🧠 🫀 🫁 🦷 🦴 👀 👁️ 👅 👄 🫦 👶 🧒 👦 👧 🧑 👱 👨 🧔 🧔‍♂️ 🧔‍♀️ 👨‍🦰 👨‍🦱 👨‍🦳 👨‍🦲 👩 👩‍🦰 🧑‍🦰 👩‍🦱 🧑‍🦱 👩‍🦳 🧑‍🦳 👩‍🦲 🧑‍🦲 👱‍♀️ 👱‍♂️ 🧓 👴 👵 🙍 🙍‍♂️ 🙍‍♀️ 🙎 🙎‍♂️ 🙎‍♀️ 🙅 🙅‍♂️ 🙅‍♀️ 🙆 🙆‍♂️ 🙆‍♀️ 💁 💁‍♂️ 💁‍♀️ 🙋 🙋‍♂️ 🙋‍♀️ 🧏 🧏‍♂️ 🧏‍♀️ 🙇 🙇‍♂️ 🙇‍♀️ 🤦 🤦‍♂️ 🤦‍♀️ 🤷 🤷‍♂️ 🤷‍♀️ 🧑‍⚕️ 👨‍⚕️ 👩‍⚕️ 🧑‍🎓 👨‍🎓 👩‍🎓 🧑‍🏫 👨‍🏫 👩‍🏫 🧑‍⚖️ 👨‍⚖️ 👩‍⚖️ 🧑‍🌾 👨‍🌾 👩‍🌾 🧑‍🍳 👨‍🍳 👩‍🍳 🧑‍🔧 👨‍🔧 👩‍🔧 🧑‍🏭 👨‍🏭 👩‍🏭 🧑‍💼 👨‍💼 👩‍💼 🧑‍🔬 👨‍🔬 👩‍🔬 🧑‍💻 👨‍💻 👩‍💻 🧑‍🎤 👨‍🎤 👩‍🎤 🧑‍🎨 👨‍🎨 👩‍🎨 🧑‍✈️ 👨‍✈️ 👩‍✈️ 🧑‍🚀 👨‍🚀 👩‍🚀 🧑‍🚒 👨‍🚒 👩‍🚒 👮 👮‍♂️ 👮‍♀️ 🕵️ 🕵️‍♂️ 🕵️‍♀️ 💂 💂‍♂️ 💂‍♀️ 🥷 👷 👷‍♂️ 👷‍♀️ 🫅 🤴 👸 👳 👳‍♂️ 👳‍♀️ 👲 🧕 🤵 🤵‍♂️ 🤵‍♀️ 👰 👰‍♂️ 👰‍♀️ 🤰 🫃 🫄 🤱 👩‍🍼 👨‍🍼 🧑‍🍼 👼 🎅 🤶 🧑‍🎄 🦸 🦸‍♂️ 🦸‍♀️ 🦹 🦹‍♂️ 🦹‍♀️ 🧙 🧙‍♂️ 🧙‍♀️ 🧚 🧚‍♂️ 🧚‍♀️ 🧛 🧛‍♂️ 🧛‍♀️ 🧜 🧜‍♂️ 🧜‍♀️ 🧝 🧝‍♂️ 🧝‍♀️ 🧞 🧞‍♂️ 🧞‍♀️ 🧟 🧟‍♂️ 🧟‍♀️ 🧌 🫈 💆 💆‍♂️ 💆‍♀️ 💇 💇‍♂️ 💇‍♀️ 🚶 🚶‍♂️ 🚶‍♀️ 🚶‍➡️ 🚶‍♀️‍➡️ 🚶‍♂️‍➡️ 🧍 🧍‍♂️ 🧍‍♀️ 🧎 🧎‍♂️ 🧎‍♀️ 🧎‍➡️ 🧎‍♀️‍➡️ 🧎‍♂️‍➡️ 🧑‍🦯 🧑‍🦯‍➡️ 👨‍🦯 👨‍🦯‍➡️ 👩‍🦯 👩‍🦯‍➡️ 🧑‍🦼 🧑‍🦼‍➡️ 👨‍🦼 👨‍🦼‍➡️ 👩‍🦼 👩‍🦼‍➡️ 🧑‍🦽 🧑‍🦽‍➡️ 👨‍🦽 👨‍🦽‍➡️ 👩‍🦽 👩‍🦽‍➡️ 🏃 🏃‍♂️ 🏃‍♀️ 🏃‍➡️ 🏃‍♀️‍➡️ 🏃‍♂️‍➡️ 🧑‍🩰 💃 🕺 🕴️ 👯 👯‍♂️ 👯‍♀️ 🧖 🧖‍♂️ 🧖‍♀️ 🧗 🧗‍♂️ 🧗‍♀️ 🤺 🏇 ⛷️ 🏂 🏌️ 🏌️‍♂️ 🏌️‍♀️ 🏄 🏄‍♂️ 🏄‍♀️ 🚣 🚣‍♂️ 🚣‍♀️ 🏊 🏊‍♂️ 🏊‍♀️ ⛹️ ⛹️‍♂️ ⛹️‍♀️ 🏋️ 🏋️‍♂️ 🏋️‍♀️ 🚴 🚴‍♂️ 🚴‍♀️ 🚵 🚵‍♂️ 🚵‍♀️ 🤸 🤸‍♂️ 🤸‍♀️ 🤼 🤼‍♂️ 🤼‍♀️ 🤽 🤽‍♂️ 🤽‍♀️ 🤾 🤾‍♂️ 🤾‍♀️ 🤹 🤹‍♂️ 🤹‍♀️ 🧘 🧘‍♂️ 🧘‍♀️ 🛀 🛌 🧑‍🤝‍🧑 👭 👫 👬 💏 👩‍❤️‍💋‍👨 👨‍❤️‍💋‍👨 👩‍❤️‍💋‍👩 💑 👩‍❤️‍👨 👨‍❤️‍👨 👩‍❤️‍👩 👨‍👩‍👦 👨‍👩‍👧 👨‍👩‍👧‍👦 👨‍👩‍👦‍👦 👨‍👩‍👧‍👧 👨‍👨‍👦 👨‍👨‍👧 👨‍👨‍👧‍👦 👨‍👨‍👦‍👦 👨‍👨‍👧‍👧 👩‍👩‍👦 👩‍👩‍👧 👩‍👩‍👧‍👦 👩‍👩‍👦‍👦 👩‍👩‍👧‍👧 👨‍👦 👨‍👦‍👦 👨‍👧 👨‍👧‍👦 👨‍👧‍👧 👩‍👦 👩‍👦‍👦 👩‍👧 👩‍👧‍👦 👩‍👧‍👧 🗣️ 👤 👥 🫂 👪 🧑‍🧑‍🧒 🧑‍🧑‍🧒‍🧒 🧑‍🧒 🧑‍🧒‍🧒 👣 🫆"
      },
      {
            "label": "Animals & Nature",
            "icons": "🐵 🐒 🦍 🦧 🐶 🐕 🦮 🐕‍🦺 🐩 🐺 🦊 🦝 🐱 🐈 🐈‍⬛ 🦁 🐯 🐅 🐆 🐴 🫎 🫏 🐎 🦄 🦓 🦌 🦬 🐮 🐂 🐃 🐄 🐷 🐖 🐗 🐽 🐏 🐑 🐐 🐪 🐫 🦙 🦒 🐘 🦣 🦏 🦛 🐭 🐁 🐀 🐹 🐰 🐇 🐿️ 🦫 🦔 🦇 🐻 🐻‍❄️ 🐨 🐼 🦥 🦦 🦨 🦘 🦡 🐾 🦃 🐔 🐓 🐣 🐤 🐥 🐦 🐧 🕊️ 🦅 🦆 🦢 🦉 🦤 🪶 🦩 🦚 🦜 🪽 🐦‍⬛ 🪿 🐦‍🔥 🐸 🐊 🐢 🦎 🐍 🐲 🐉 🦕 🦖 🐳 🐋 🐬 🫍 🦭 🐟 🐠 🐡 🦈 🐙 🐚 🪸 🪼 🦀 🦞 🦐 🦑 🦪 🐌 🦋 🐛 🐜 🐝 🪲 🐞 🦗 🪳 🕷️ 🕸️ 🦂 🦟 🪰 🪱 🦠 💐 🌸 💮 🪷 🏵️ 🌹 🥀 🌺 🌻 🌼 🌷 🪻 🌱 🪴 🌲 🌳 🌴 🌵 🌾 🌿 ☘️ 🍀 🍁 🍂 🍃 🪹 🪺 🍄 🪾"
      },
      {
            "label": "Food & Drink",
            "icons": "🍇 🍈 🍉 🍊 🍋 🍋‍🟩 🍌 🍍 🥭 🍎 🍏 🍐 🍑 🍒 🍓 🫐 🥝 🍅 🫒 🥥 🥑 🍆 🥔 🥕 🌽 🌶️ 🫑 🥒 🥬 🥦 🧄 🧅 🥜 🫘 🌰 🫚 🫛 🍄‍🟫 🫜 🍞 🥐 🥖 🫓 🥨 🥯 🥞 🧇 🧀 🍖 🍗 🥩 🥓 🍔 🍟 🍕 🌭 🥪 🌮 🌯 🫔 🥙 🧆 🥚 🍳 🥘 🍲 🫕 🥣 🥗 🍿 🧈 🧂 🥫 🍱 🍘 🍙 🍚 🍛 🍜 🍝 🍠 🍢 🍣 🍤 🍥 🥮 🍡 🥟 🥠 🥡 🍦 🍧 🍨 🍩 🍪 🎂 🍰 🧁 🥧 🍫 🍬 🍭 🍮 🍯 🍼 🥛 ☕ 🫖 🍵 🍶 🍾 🍷 🍸 🍹 🍺 🍻 🥂 🥃 🫗 🥤 🧋 🧃 🧉 🧊 🥢 🍽️ 🍴 🥄 🔪 🫙 🏺"
      },
      {
            "label": "Travel & Places",
            "icons": "🌍 🌎 🌏 🌐 🗺️ 🗾 🧭 🏔️ ⛰️ 🛘 🌋 🗻 🏕️ 🏖️ 🏜️ 🏝️ 🏞️ 🏟️ 🏛️ 🏗️ 🧱 🪨 🪵 🛖 🏘️ 🏚️ 🏠 🏡 🏢 🏣 🏤 🏥 🏦 🏨 🏩 🏪 🏫 🏬 🏭 🏯 🏰 💒 🗼 🗽 ⛪ 🕌 🛕 🕍 ⛩️ 🕋 ⛲ ⛺ 🌁 🌃 🏙️ 🌄 🌅 🌆 🌇 🌉 ♨️ 🎠 🛝 🎡 🎢 💈 🎪 🚂 🚃 🚄 🚅 🚆 🚇 🚈 🚉 🚊 🚝 🚞 🚋 🚌 🚍 🚎 🚐 🚑 🚒 🚓 🚔 🚕 🚖 🚗 🚘 🚙 🛻 🚚 🚛 🚜 🏎️ 🏍️ 🛵 🦽 🦼 🛺 🚲 🛴 🛹 🛼 🚏 🛣️ 🛤️ 🛢️ ⛽ 🛞 🚨 🚥 🚦 🛑 🚧 ⚓ 🛟 ⛵ 🛶 🚤 🛳️ ⛴️ 🛥️ 🚢 ✈️ 🛩️ 🛫 🛬 🪂 💺 🚁 🚟 🚠 🚡 🛰️ 🚀 🛸 🛎️ 🧳 ⌛ ⏳ ⌚ ⏰ ⏱️ ⏲️ 🕰️ 🕛 🕧 🕐 🕜 🕑 🕝 🕒 🕞 🕓 🕟 🕔 🕠 🕕 🕡 🕖 🕢 🕗 🕣 🕘 🕤 🕙 🕥 🕚 🕦 🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘 🌙 🌚 🌛 🌜 🌡️ ☀️ 🌝 🌞 🪐 ⭐ 🌟 🌠 🌌 ☁️ ⛅ ⛈️ 🌤️ 🌥️ 🌦️ 🌧️ 🌨️ 🌩️ 🌪️ 🌫️ 🌬️ 🌀 🌈 🌂 ☂️ ☔ ⛱️ ⚡ ❄️ ☃️ ⛄ ☄️ 🔥 💧 🌊"
      },
      {
            "label": "Activities",
            "icons": "🎃 🎄 🎆 🎇 🧨 ✨ 🎈 🎉 🎊 🎋 🎍 🎎 🎏 🎐 🎑 🧧 🎀 🎁 🎗️ 🎟️ 🎫 🎖️ 🏆 🏅 🥇 🥈 🥉 ⚽ ⚾ 🥎 🏀 🏐 🏈 🏉 🎾 🥏 🎳 🏏 🏑 🏒 🥍 🏓 🏸 🥊 🥋 🥅 ⛳ ⛸️ 🎣 🤿 🎽 🎿 🛷 🥌 🎯 🪀 🪁 🔫 🎱 🔮 🪄 🎮 🕹️ 🎰 🎲 🧩 🧸 🪅 🪩 🪆 ♠️ ♥️ ♦️ ♣️ ♟️ 🃏 🀄 🎴 🎭 🖼️ 🎨 🧵 🪡 🧶 🪢"
      },
      {
            "label": "Objects",
            "icons": "👓 🕶️ 🥽 🥼 🦺 👔 👕 👖 🧣 🧤 🧥 🧦 👗 👘 🥻 🩱 🩲 🩳 👙 👚 🪭 👛 👜 👝 🛍️ 🎒 🩴 👞 👟 🥾 🥿 👠 👡 🩰 👢 🪮 👑 👒 🎩 🎓 🧢 🪖 ⛑️ 📿 💄 💍 💎 🔇 🔈 🔉 🔊 📢 📣 📯 🔔 🔕 🎼 🎵 🎶 🎙️ 🎚️ 🎛️ 🎤 🎧 📻 🎷 🎺 🪊 🪗 🎸 🎹 🎻 🪕 🥁 🪘 🪇 🪈 🪉 📱 📲 ☎️ 📞 📟 📠 🔋 🪫 🔌 💻 🖥️ 🖨️ ⌨️ 🖱️ 🖲️ 💽 💾 💿 📀 🧮 🎥 🎞️ 📽️ 🎬 📺 📷 📸 📹 📼 🔍 🔎 🕯️ 💡 🔦 🏮 🪔 📔 📕 📖 📗 📘 📙 📚 📓 📒 📃 📜 📄 📰 🗞️ 📑 🔖 🏷️ 🪙 💰 🪎 💴 💵 💶 💷 💸 💳 🧾 💹 ✉️ 📧 📨 📩 📤 📥 📦 📫 📪 📬 📭 📮 🗳️ ✏️ ✒️ 🖋️ 🖊️ 🖌️ 🖍️ 📝 💼 📁 📂 🗂️ 📅 📆 🗒️ 🗓️ 📇 📈 📉 📊 📋 📌 📍 📎 🖇️ 📏 📐 ✂️ 🗃️ 🗄️ 🗑️ 🔒 🔓 🔏 🔐 🔑 🗝️ 🔨 🪓 ⛏️ ⚒️ 🛠️ 🗡️ ⚔️ 💣 🪃 🏹 🛡️ 🪚 🔧 🪛 🔩 ⚙️ 🗜️ ⚖️ 🦯 🔗 ⛓️‍💥 ⛓️ 🪝 🧰 🧲 🪜 🪏 ⚗️ 🧪 🧫 🧬 🔬 🔭 📡 💉 🩸 💊 🩹 🩼 🩺 🩻 🚪 🛗 🪞 🪟 🛏️ 🛋️ 🪑 🚽 🪠 🚿 🛁 🪤 🪒 🧴 🧷 🧹 🧺 🧻 🪣 🧼 🫧 🪥 🧽 🧯 🛒 🚬 ⚰️ 🪦 ⚱️ 🧿 🪬 🗿 🪧 🪪"
      },
      {
            "label": "Symbols",
            "icons": "🏧 🚮 🚰 ♿ 🚹 🚺 🚻 🚼 🚾 🛂 🛃 🛄 🛅 ⚠️ 🚸 ⛔ 🚫 🚳 🚭 🚯 🚱 🚷 📵 🔞 ☢️ ☣️ ⬆️ ↗️ ➡️ ↘️ ⬇️ ↙️ ⬅️ ↖️ ↕️ ↔️ ↩️ ↪️ ⤴️ ⤵️ 🔃 🔄 🔙 🔚 🔛 🔜 🔝 🛐 ⚛️ 🕉️ ✡️ ☸️ ☯️ ✝️ ☦️ ☪️ ☮️ 🕎 🔯 🪯 ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ ⛎ 🔀 🔁 🔂 ▶️ ⏩ ⏭️ ⏯️ ◀️ ⏪ ⏮️ 🔼 ⏫ 🔽 ⏬ ⏸️ ⏹️ ⏺️ ⏏️ 🎦 🔅 🔆 📶 🛜 📳 📴 ♀️ ♂️ ⚧️ ✖️ ➕ ➖ ➗ 🟰 ♾️ ‼️ ⁉️ ❓ ❔ ❕ ❗ 〰️ 💱 💲 ⚕️ ♻️ ⚜️ 🔱 📛 🔰 ⭕ ✅ ☑️ ✔️ ❌ ❎ ➰ ➿ 〽️ ✳️ ✴️ ❇️ ©️ ®️ ™️ 🫟 #️⃣ *️⃣ 0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟 🔠 🔡 🔢 🔣 🔤 🅰️ 🆎 🅱️ 🆑 🆒 🆓 ℹ️ 🆔 Ⓜ️ 🆕 🆖 🅾️ 🆗 🅿️ 🆘 🆙 🆚 🈁 🈂️ 🈷️ 🈶 🈯 🉐 🈹 🈚 🈲 🉑 🈸 🈴 🈳 ㊗️ ㊙️ 🈺 🈵 🔴 🟠 🟡 🟢 🔵 🟣 🟤 ⚫ ⚪ 🟥 🟧 🟨 🟩 🟦 🟪 🟫 ⬛ ⬜ ◼️ ◻️ ◾ ◽ ▪️ ▫️ 🔶 🔷 🔸 🔹 🔺 🔻 💠 🔘 🔳 🔲"
      },
      {
            "label": "Flags",
            "icons": "🏁 🚩 🎌 🏴 🏳️ 🏳️‍🌈 🏳️‍⚧️ 🏴‍☠️ 🇦🇨 🇦🇩 🇦🇪 🇦🇫 🇦🇬 🇦🇮 🇦🇱 🇦🇲 🇦🇴 🇦🇶 🇦🇷 🇦🇸 🇦🇹 🇦🇺 🇦🇼 🇦🇽 🇦🇿 🇧🇦 🇧🇧 🇧🇩 🇧🇪 🇧🇫 🇧🇬 🇧🇭 🇧🇮 🇧🇯 🇧🇱 🇧🇲 🇧🇳 🇧🇴 🇧🇶 🇧🇷 🇧🇸 🇧🇹 🇧🇻 🇧🇼 🇧🇾 🇧🇿 🇨🇦 🇨🇨 🇨🇩 🇨🇫 🇨🇬 🇨🇭 🇨🇮 🇨🇰 🇨🇱 🇨🇲 🇨🇳 🇨🇴 🇨🇵 🇨🇶 🇨🇷 🇨🇺 🇨🇻 🇨🇼 🇨🇽 🇨🇾 🇨🇿 🇩🇪 🇩🇬 🇩🇯 🇩🇰 🇩🇲 🇩🇴 🇩🇿 🇪🇦 🇪🇨 🇪🇪 🇪🇬 🇪🇭 🇪🇷 🇪🇸 🇪🇹 🇪🇺 🇫🇮 🇫🇯 🇫🇰 🇫🇲 🇫🇴 🇫🇷 🇬🇦 🇬🇧 🇬🇩 🇬🇪 🇬🇫 🇬🇬 🇬🇭 🇬🇮 🇬🇱 🇬🇲 🇬🇳 🇬🇵 🇬🇶 🇬🇷 🇬🇸 🇬🇹 🇬🇺 🇬🇼 🇬🇾 🇭🇰 🇭🇲 🇭🇳 🇭🇷 🇭🇹 🇭🇺 🇮🇨 🇮🇩 🇮🇪 🇮🇱 🇮🇲 🇮🇳 🇮🇴 🇮🇶 🇮🇷 🇮🇸 🇮🇹 🇯🇪 🇯🇲 🇯🇴 🇯🇵 🇰🇪 🇰🇬 🇰🇭 🇰🇮 🇰🇲 🇰🇳 🇰🇵 🇰🇷 🇰🇼 🇰🇾 🇰🇿 🇱🇦 🇱🇧 🇱🇨 🇱🇮 🇱🇰 🇱🇷 🇱🇸 🇱🇹 🇱🇺 🇱🇻 🇱🇾 🇲🇦 🇲🇨 🇲🇩 🇲🇪 🇲🇫 🇲🇬 🇲🇭 🇲🇰 🇲🇱 🇲🇲 🇲🇳 🇲🇴 🇲🇵 🇲🇶 🇲🇷 🇲🇸 🇲🇹 🇲🇺 🇲🇻 🇲🇼 🇲🇽 🇲🇾 🇲🇿 🇳🇦 🇳🇨 🇳🇪 🇳🇫 🇳🇬 🇳🇮 🇳🇱 🇳🇴 🇳🇵 🇳🇷 🇳🇺 🇳🇿 🇴🇲 🇵🇦 🇵🇪 🇵🇫 🇵🇬 🇵🇭 🇵🇰 🇵🇱 🇵🇲 🇵🇳 🇵🇷 🇵🇸 🇵🇹 🇵🇼 🇵🇾 🇶🇦 🇷🇪 🇷🇴 🇷🇸 🇷🇺 🇷🇼 🇸🇦 🇸🇧 🇸🇨 🇸🇩 🇸🇪 🇸🇬 🇸🇭 🇸🇮 🇸🇯 🇸🇰 🇸🇱 🇸🇲 🇸🇳 🇸🇴 🇸🇷 🇸🇸 🇸🇹 🇸🇻 🇸🇽 🇸🇾 🇸🇿 🇹🇦 🇹🇨 🇹🇩 🇹🇫 🇹🇬 🇹🇭 🇹🇯 🇹🇰 🇹🇱 🇹🇲 🇹🇳 🇹🇴 🇹🇷 🇹🇹 🇹🇻 🇹🇼 🇹🇿 🇺🇦 🇺🇬 🇺🇲 🇺🇳 🇺🇸 🇺🇾 🇺🇿 🇻🇦 🇻🇨 🇻🇪 🇻🇬 🇻🇮 🇻🇳 🇻🇺 🇼🇫 🇼🇸 🇽🇰 🇾🇪 🇾🇹 🇿🇦 🇿🇲 🇿🇼 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🏴󠁧󠁢󠁳󠁣󠁴󠁿 🏴󠁧󠁢󠁷󠁬󠁳󠁿"
      }
];
    var emojiSearchIndex = {
      "#️⃣": "symbols keycap: #",
      "*️⃣": "symbols keycap: *",
      "0️⃣": "symbols keycap: 0",
      "1️⃣": "symbols keycap: 1",
      "2️⃣": "symbols keycap: 2",
      "3️⃣": "symbols keycap: 3",
      "4️⃣": "symbols keycap: 4",
      "5️⃣": "symbols keycap: 5",
      "6️⃣": "symbols keycap: 6",
      "7️⃣": "symbols keycap: 7",
      "8️⃣": "symbols keycap: 8",
      "9️⃣": "symbols keycap: 9",
      "©️": "symbols copyright",
      "®️": "symbols registered",
      "‼️": "symbols double exclamation mark",
      "⁉️": "symbols exclamation question mark",
      "™️": "symbols trade mark",
      "ℹ️": "symbols information",
      "↔️": "symbols left-right arrow",
      "↕️": "symbols up-down arrow",
      "↖️": "symbols up-left arrow",
      "↗️": "symbols up-right arrow",
      "↘️": "symbols down-right arrow",
      "↙️": "symbols down-left arrow",
      "↩️": "symbols right arrow curving left",
      "↪️": "symbols left arrow curving right",
      "⌚": "travel & places watch",
      "⌛": "travel & places hourglass done",
      "⌨️": "objects keyboard",
      "⏏️": "symbols eject button",
      "⏩": "symbols fast-forward button",
      "⏪": "symbols fast reverse button",
      "⏫": "symbols fast up button",
      "⏬": "symbols fast down button",
      "⏭️": "symbols next track button",
      "⏮️": "symbols last track button",
      "⏯️": "symbols play or pause button",
      "⏰": "travel & places alarm clock",
      "⏱️": "travel & places stopwatch",
      "⏲️": "travel & places timer clock",
      "⏳": "travel & places hourglass not done",
      "⏸️": "symbols pause button",
      "⏹️": "symbols stop button",
      "⏺️": "symbols record button",
      "Ⓜ️": "symbols circled m",
      "▪️": "symbols black small square",
      "▫️": "symbols white small square",
      "▶️": "symbols play button",
      "◀️": "symbols reverse button",
      "◻️": "symbols white medium square",
      "◼️": "symbols black medium square",
      "◽": "symbols white medium-small square",
      "◾": "symbols black medium-small square",
      "☀️": "travel & places sun",
      "☁️": "travel & places cloud",
      "☂️": "travel & places umbrella",
      "☃️": "travel & places snowman",
      "☄️": "travel & places comet",
      "☎️": "objects telephone",
      "☑️": "symbols check box with check",
      "☔": "travel & places umbrella with rain drops",
      "☕": "food & drink hot beverage",
      "☘️": "animals & nature shamrock",
      "☝️": "people & body index pointing up",
      "☠️": "smileys & emotion skull and crossbones",
      "☢️": "symbols radioactive",
      "☣️": "symbols biohazard",
      "☦️": "symbols orthodox cross",
      "☪️": "symbols star and crescent",
      "☮️": "symbols peace symbol",
      "☯️": "symbols yin yang",
      "☸️": "symbols wheel of dharma",
      "☹️": "smileys & emotion frowning face",
      "☺️": "smileys & emotion smiling face",
      "♀️": "symbols female sign",
      "♂️": "symbols male sign",
      "♈": "symbols aries",
      "♉": "symbols taurus",
      "♊": "symbols gemini",
      "♋": "symbols cancer",
      "♌": "symbols leo",
      "♍": "symbols virgo",
      "♎": "symbols libra",
      "♏": "symbols scorpio",
      "♐": "symbols sagittarius",
      "♑": "symbols capricorn",
      "♒": "symbols aquarius",
      "♓": "symbols pisces",
      "♟️": "activities chess pawn",
      "♠️": "activities spade suit",
      "♣️": "activities club suit",
      "♥️": "activities heart suit",
      "♦️": "activities diamond suit",
      "♨️": "travel & places hot springs",
      "♻️": "symbols recycling symbol",
      "♾️": "symbols infinity",
      "♿": "symbols wheelchair symbol",
      "⚒️": "objects hammer and pick",
      "⚓": "travel & places anchor",
      "⚔️": "objects crossed swords",
      "⚕️": "symbols medical symbol",
      "⚖️": "objects balance scale",
      "⚗️": "objects alembic",
      "⚙️": "objects gear",
      "⚛️": "symbols atom symbol",
      "⚜️": "symbols fleur-de-lis",
      "⚠️": "symbols warning",
      "⚡": "travel & places high voltage",
      "⚧️": "symbols transgender symbol",
      "⚪": "symbols white circle",
      "⚫": "symbols black circle",
      "⚰️": "objects coffin",
      "⚱️": "objects funeral urn",
      "⚽": "activities soccer ball",
      "⚾": "activities baseball",
      "⛄": "travel & places snowman without snow",
      "⛅": "travel & places sun behind cloud",
      "⛈️": "travel & places cloud with lightning and rain",
      "⛎": "symbols ophiuchus",
      "⛏️": "objects pick",
      "⛑️": "objects rescue worker’s helmet",
      "⛓️": "objects chains",
      "⛓️‍💥": "objects broken chain",
      "⛔": "symbols no entry",
      "⛩️": "travel & places shinto shrine",
      "⛪": "travel & places church",
      "⛰️": "travel & places mountain",
      "⛱️": "travel & places umbrella on ground",
      "⛲": "travel & places fountain",
      "⛳": "activities flag in hole",
      "⛴️": "travel & places ferry",
      "⛵": "travel & places sailboat",
      "⛷️": "people & body skier",
      "⛸️": "activities ice skate",
      "⛹️": "people & body person bouncing ball",
      "⛹️‍♀️": "people & body woman bouncing ball",
      "⛹️‍♂️": "people & body man bouncing ball",
      "⛺": "travel & places tent",
      "⛽": "travel & places fuel pump",
      "✂️": "objects scissors",
      "✅": "symbols check mark button",
      "✈️": "travel & places airplane",
      "✉️": "objects envelope",
      "✊": "people & body raised fist",
      "✋": "people & body raised hand",
      "✌️": "people & body victory hand",
      "✍️": "people & body writing hand",
      "✏️": "objects pencil",
      "✒️": "objects black nib",
      "✔️": "symbols check mark",
      "✖️": "symbols multiply",
      "✝️": "symbols latin cross",
      "✡️": "symbols star of david",
      "✨": "activities sparkles",
      "✳️": "symbols eight-spoked asterisk",
      "✴️": "symbols eight-pointed star",
      "❄️": "travel & places snowflake",
      "❇️": "symbols sparkle",
      "❌": "symbols cross mark",
      "❎": "symbols cross mark button",
      "❓": "symbols red question mark",
      "❔": "symbols white question mark",
      "❕": "symbols white exclamation mark",
      "❗": "symbols red exclamation mark",
      "❣️": "smileys & emotion heart exclamation",
      "❤️": "smileys & emotion red heart",
      "❤️‍🔥": "smileys & emotion heart on fire",
      "❤️‍🩹": "smileys & emotion mending heart",
      "➕": "symbols plus",
      "➖": "symbols minus",
      "➗": "symbols divide",
      "➡️": "symbols right arrow",
      "➰": "symbols curly loop",
      "➿": "symbols double curly loop",
      "⤴️": "symbols right arrow curving up",
      "⤵️": "symbols right arrow curving down",
      "⬅️": "symbols left arrow",
      "⬆️": "symbols up arrow",
      "⬇️": "symbols down arrow",
      "⬛": "symbols black large square",
      "⬜": "symbols white large square",
      "⭐": "travel & places star",
      "⭕": "symbols hollow red circle",
      "〰️": "symbols wavy dash",
      "〽️": "symbols part alternation mark",
      "㊗️": "symbols japanese “congratulations” button",
      "㊙️": "symbols japanese “secret” button",
      "🀄": "activities mahjong red dragon",
      "🃏": "activities joker",
      "🅰️": "symbols a button (blood type)",
      "🅱️": "symbols b button (blood type)",
      "🅾️": "symbols o button (blood type)",
      "🅿️": "symbols p button",
      "🆎": "symbols ab button (blood type)",
      "🆑": "symbols cl button",
      "🆒": "symbols cool button",
      "🆓": "symbols free button",
      "🆔": "symbols id button",
      "🆕": "symbols new button",
      "🆖": "symbols ng button",
      "🆗": "symbols ok button",
      "🆘": "symbols sos button",
      "🆙": "symbols up! button",
      "🆚": "symbols vs button",
      "🇦🇨": "flags flag: ascension island",
      "🇦🇩": "flags flag: andorra",
      "🇦🇪": "flags flag: united arab emirates",
      "🇦🇫": "flags flag: afghanistan",
      "🇦🇬": "flags flag: antigua & barbuda",
      "🇦🇮": "flags flag: anguilla",
      "🇦🇱": "flags flag: albania",
      "🇦🇲": "flags flag: armenia",
      "🇦🇴": "flags flag: angola",
      "🇦🇶": "flags flag: antarctica",
      "🇦🇷": "flags flag: argentina",
      "🇦🇸": "flags flag: american samoa",
      "🇦🇹": "flags flag: austria",
      "🇦🇺": "flags flag: australia",
      "🇦🇼": "flags flag: aruba",
      "🇦🇽": "flags flag: åland islands",
      "🇦🇿": "flags flag: azerbaijan",
      "🇧🇦": "flags flag: bosnia & herzegovina",
      "🇧🇧": "flags flag: barbados",
      "🇧🇩": "flags flag: bangladesh",
      "🇧🇪": "flags flag: belgium",
      "🇧🇫": "flags flag: burkina faso",
      "🇧🇬": "flags flag: bulgaria",
      "🇧🇭": "flags flag: bahrain",
      "🇧🇮": "flags flag: burundi",
      "🇧🇯": "flags flag: benin",
      "🇧🇱": "flags flag: st. barthélemy",
      "🇧🇲": "flags flag: bermuda",
      "🇧🇳": "flags flag: brunei",
      "🇧🇴": "flags flag: bolivia",
      "🇧🇶": "flags flag: caribbean netherlands",
      "🇧🇷": "flags flag: brazil",
      "🇧🇸": "flags flag: bahamas",
      "🇧🇹": "flags flag: bhutan",
      "🇧🇻": "flags flag: bouvet island",
      "🇧🇼": "flags flag: botswana",
      "🇧🇾": "flags flag: belarus",
      "🇧🇿": "flags flag: belize",
      "🇨🇦": "flags flag: canada",
      "🇨🇨": "flags flag: cocos (keeling) islands",
      "🇨🇩": "flags flag: congo - kinshasa",
      "🇨🇫": "flags flag: central african republic",
      "🇨🇬": "flags flag: congo - brazzaville",
      "🇨🇭": "flags flag: switzerland",
      "🇨🇮": "flags flag: côte d’ivoire",
      "🇨🇰": "flags flag: cook islands",
      "🇨🇱": "flags flag: chile",
      "🇨🇲": "flags flag: cameroon",
      "🇨🇳": "flags flag: china",
      "🇨🇴": "flags flag: colombia",
      "🇨🇵": "flags flag: clipperton island",
      "🇨🇶": "flags flag: sark",
      "🇨🇷": "flags flag: costa rica",
      "🇨🇺": "flags flag: cuba",
      "🇨🇻": "flags flag: cape verde",
      "🇨🇼": "flags flag: curaçao",
      "🇨🇽": "flags flag: christmas island",
      "🇨🇾": "flags flag: cyprus",
      "🇨🇿": "flags flag: czechia",
      "🇩🇪": "flags flag: germany",
      "🇩🇬": "flags flag: diego garcia",
      "🇩🇯": "flags flag: djibouti",
      "🇩🇰": "flags flag: denmark",
      "🇩🇲": "flags flag: dominica",
      "🇩🇴": "flags flag: dominican republic",
      "🇩🇿": "flags flag: algeria",
      "🇪🇦": "flags flag: ceuta & melilla",
      "🇪🇨": "flags flag: ecuador",
      "🇪🇪": "flags flag: estonia",
      "🇪🇬": "flags flag: egypt",
      "🇪🇭": "flags flag: western sahara",
      "🇪🇷": "flags flag: eritrea",
      "🇪🇸": "flags flag: spain",
      "🇪🇹": "flags flag: ethiopia",
      "🇪🇺": "flags flag: european union",
      "🇫🇮": "flags flag: finland",
      "🇫🇯": "flags flag: fiji",
      "🇫🇰": "flags flag: falkland islands",
      "🇫🇲": "flags flag: micronesia",
      "🇫🇴": "flags flag: faroe islands",
      "🇫🇷": "flags flag: france",
      "🇬🇦": "flags flag: gabon",
      "🇬🇧": "flags flag: united kingdom",
      "🇬🇩": "flags flag: grenada",
      "🇬🇪": "flags flag: georgia",
      "🇬🇫": "flags flag: french guiana",
      "🇬🇬": "flags flag: guernsey",
      "🇬🇭": "flags flag: ghana",
      "🇬🇮": "flags flag: gibraltar",
      "🇬🇱": "flags flag: greenland",
      "🇬🇲": "flags flag: gambia",
      "🇬🇳": "flags flag: guinea",
      "🇬🇵": "flags flag: guadeloupe",
      "🇬🇶": "flags flag: equatorial guinea",
      "🇬🇷": "flags flag: greece",
      "🇬🇸": "flags flag: south georgia & south sandwich islands",
      "🇬🇹": "flags flag: guatemala",
      "🇬🇺": "flags flag: guam",
      "🇬🇼": "flags flag: guinea-bissau",
      "🇬🇾": "flags flag: guyana",
      "🇭🇰": "flags flag: hong kong sar china",
      "🇭🇲": "flags flag: heard & mcdonald islands",
      "🇭🇳": "flags flag: honduras",
      "🇭🇷": "flags flag: croatia",
      "🇭🇹": "flags flag: haiti",
      "🇭🇺": "flags flag: hungary",
      "🇮🇨": "flags flag: canary islands",
      "🇮🇩": "flags flag: indonesia",
      "🇮🇪": "flags flag: ireland",
      "🇮🇱": "flags flag: israel",
      "🇮🇲": "flags flag: isle of man",
      "🇮🇳": "flags flag: india",
      "🇮🇴": "flags flag: british indian ocean territory",
      "🇮🇶": "flags flag: iraq",
      "🇮🇷": "flags flag: iran",
      "🇮🇸": "flags flag: iceland",
      "🇮🇹": "flags flag: italy",
      "🇯🇪": "flags flag: jersey",
      "🇯🇲": "flags flag: jamaica",
      "🇯🇴": "flags flag: jordan",
      "🇯🇵": "flags flag: japan",
      "🇰🇪": "flags flag: kenya",
      "🇰🇬": "flags flag: kyrgyzstan",
      "🇰🇭": "flags flag: cambodia",
      "🇰🇮": "flags flag: kiribati",
      "🇰🇲": "flags flag: comoros",
      "🇰🇳": "flags flag: st. kitts & nevis",
      "🇰🇵": "flags flag: north korea",
      "🇰🇷": "flags flag: south korea",
      "🇰🇼": "flags flag: kuwait",
      "🇰🇾": "flags flag: cayman islands",
      "🇰🇿": "flags flag: kazakhstan",
      "🇱🇦": "flags flag: laos",
      "🇱🇧": "flags flag: lebanon",
      "🇱🇨": "flags flag: st. lucia",
      "🇱🇮": "flags flag: liechtenstein",
      "🇱🇰": "flags flag: sri lanka",
      "🇱🇷": "flags flag: liberia",
      "🇱🇸": "flags flag: lesotho",
      "🇱🇹": "flags flag: lithuania",
      "🇱🇺": "flags flag: luxembourg",
      "🇱🇻": "flags flag: latvia",
      "🇱🇾": "flags flag: libya",
      "🇲🇦": "flags flag: morocco",
      "🇲🇨": "flags flag: monaco",
      "🇲🇩": "flags flag: moldova",
      "🇲🇪": "flags flag: montenegro",
      "🇲🇫": "flags flag: st. martin",
      "🇲🇬": "flags flag: madagascar",
      "🇲🇭": "flags flag: marshall islands",
      "🇲🇰": "flags flag: north macedonia",
      "🇲🇱": "flags flag: mali",
      "🇲🇲": "flags flag: myanmar (burma)",
      "🇲🇳": "flags flag: mongolia",
      "🇲🇴": "flags flag: macao sar china",
      "🇲🇵": "flags flag: northern mariana islands",
      "🇲🇶": "flags flag: martinique",
      "🇲🇷": "flags flag: mauritania",
      "🇲🇸": "flags flag: montserrat",
      "🇲🇹": "flags flag: malta",
      "🇲🇺": "flags flag: mauritius",
      "🇲🇻": "flags flag: maldives",
      "🇲🇼": "flags flag: malawi",
      "🇲🇽": "flags flag: mexico",
      "🇲🇾": "flags flag: malaysia",
      "🇲🇿": "flags flag: mozambique",
      "🇳🇦": "flags flag: namibia",
      "🇳🇨": "flags flag: new caledonia",
      "🇳🇪": "flags flag: niger",
      "🇳🇫": "flags flag: norfolk island",
      "🇳🇬": "flags flag: nigeria",
      "🇳🇮": "flags flag: nicaragua",
      "🇳🇱": "flags flag: netherlands",
      "🇳🇴": "flags flag: norway",
      "🇳🇵": "flags flag: nepal",
      "🇳🇷": "flags flag: nauru",
      "🇳🇺": "flags flag: niue",
      "🇳🇿": "flags flag: new zealand",
      "🇴🇲": "flags flag: oman",
      "🇵🇦": "flags flag: panama",
      "🇵🇪": "flags flag: peru",
      "🇵🇫": "flags flag: french polynesia",
      "🇵🇬": "flags flag: papua new guinea",
      "🇵🇭": "flags flag: philippines",
      "🇵🇰": "flags flag: pakistan",
      "🇵🇱": "flags flag: poland",
      "🇵🇲": "flags flag: st. pierre & miquelon",
      "🇵🇳": "flags flag: pitcairn islands",
      "🇵🇷": "flags flag: puerto rico",
      "🇵🇸": "flags flag: palestinian territories",
      "🇵🇹": "flags flag: portugal",
      "🇵🇼": "flags flag: palau",
      "🇵🇾": "flags flag: paraguay",
      "🇶🇦": "flags flag: qatar",
      "🇷🇪": "flags flag: réunion",
      "🇷🇴": "flags flag: romania",
      "🇷🇸": "flags flag: serbia",
      "🇷🇺": "flags flag: russia",
      "🇷🇼": "flags flag: rwanda",
      "🇸🇦": "flags flag: saudi arabia",
      "🇸🇧": "flags flag: solomon islands",
      "🇸🇨": "flags flag: seychelles",
      "🇸🇩": "flags flag: sudan",
      "🇸🇪": "flags flag: sweden",
      "🇸🇬": "flags flag: singapore",
      "🇸🇭": "flags flag: st. helena",
      "🇸🇮": "flags flag: slovenia",
      "🇸🇯": "flags flag: svalbard & jan mayen",
      "🇸🇰": "flags flag: slovakia",
      "🇸🇱": "flags flag: sierra leone",
      "🇸🇲": "flags flag: san marino",
      "🇸🇳": "flags flag: senegal",
      "🇸🇴": "flags flag: somalia",
      "🇸🇷": "flags flag: suriname",
      "🇸🇸": "flags flag: south sudan",
      "🇸🇹": "flags flag: são tomé & príncipe",
      "🇸🇻": "flags flag: el salvador",
      "🇸🇽": "flags flag: sint maarten",
      "🇸🇾": "flags flag: syria",
      "🇸🇿": "flags flag: eswatini",
      "🇹🇦": "flags flag: tristan da cunha",
      "🇹🇨": "flags flag: turks & caicos islands",
      "🇹🇩": "flags flag: chad",
      "🇹🇫": "flags flag: french southern territories",
      "🇹🇬": "flags flag: togo",
      "🇹🇭": "flags flag: thailand",
      "🇹🇯": "flags flag: tajikistan",
      "🇹🇰": "flags flag: tokelau",
      "🇹🇱": "flags flag: timor-leste",
      "🇹🇲": "flags flag: turkmenistan",
      "🇹🇳": "flags flag: tunisia",
      "🇹🇴": "flags flag: tonga",
      "🇹🇷": "flags flag: türkiye",
      "🇹🇹": "flags flag: trinidad & tobago",
      "🇹🇻": "flags flag: tuvalu",
      "🇹🇼": "flags flag: taiwan",
      "🇹🇿": "flags flag: tanzania",
      "🇺🇦": "flags flag: ukraine",
      "🇺🇬": "flags flag: uganda",
      "🇺🇲": "flags flag: u.s. outlying islands",
      "🇺🇳": "flags flag: united nations",
      "🇺🇸": "flags flag: united states",
      "🇺🇾": "flags flag: uruguay",
      "🇺🇿": "flags flag: uzbekistan",
      "🇻🇦": "flags flag: vatican city",
      "🇻🇨": "flags flag: st. vincent & grenadines",
      "🇻🇪": "flags flag: venezuela",
      "🇻🇬": "flags flag: british virgin islands",
      "🇻🇮": "flags flag: u.s. virgin islands",
      "🇻🇳": "flags flag: vietnam",
      "🇻🇺": "flags flag: vanuatu",
      "🇼🇫": "flags flag: wallis & futuna",
      "🇼🇸": "flags flag: samoa",
      "🇽🇰": "flags flag: kosovo",
      "🇾🇪": "flags flag: yemen",
      "🇾🇹": "flags flag: mayotte",
      "🇿🇦": "flags flag: south africa",
      "🇿🇲": "flags flag: zambia",
      "🇿🇼": "flags flag: zimbabwe",
      "🈁": "symbols japanese “here” button",
      "🈂️": "symbols japanese “service charge” button",
      "🈚": "symbols japanese “free of charge” button",
      "🈯": "symbols japanese “reserved” button",
      "🈲": "symbols japanese “prohibited” button",
      "🈳": "symbols japanese “vacancy” button",
      "🈴": "symbols japanese “passing grade” button",
      "🈵": "symbols japanese “no vacancy” button",
      "🈶": "symbols japanese “not free of charge” button",
      "🈷️": "symbols japanese “monthly amount” button",
      "🈸": "symbols japanese “application” button",
      "🈹": "symbols japanese “discount” button",
      "🈺": "symbols japanese “open for business” button",
      "🉐": "symbols japanese “bargain” button",
      "🉑": "symbols japanese “acceptable” button",
      "🌀": "travel & places cyclone",
      "🌁": "travel & places foggy",
      "🌂": "travel & places closed umbrella",
      "🌃": "travel & places night with stars",
      "🌄": "travel & places sunrise over mountains",
      "🌅": "travel & places sunrise",
      "🌆": "travel & places cityscape at dusk",
      "🌇": "travel & places sunset",
      "🌈": "travel & places rainbow",
      "🌉": "travel & places bridge at night",
      "🌊": "travel & places water wave",
      "🌋": "travel & places volcano",
      "🌌": "travel & places milky way",
      "🌍": "travel & places globe showing europe-africa",
      "🌎": "travel & places globe showing americas",
      "🌏": "travel & places globe showing asia-australia",
      "🌐": "travel & places globe with meridians",
      "🌑": "travel & places new moon",
      "🌒": "travel & places waxing crescent moon",
      "🌓": "travel & places first quarter moon",
      "🌔": "travel & places waxing gibbous moon",
      "🌕": "travel & places full moon",
      "🌖": "travel & places waning gibbous moon",
      "🌗": "travel & places last quarter moon",
      "🌘": "travel & places waning crescent moon",
      "🌙": "travel & places crescent moon",
      "🌚": "travel & places new moon face",
      "🌛": "travel & places first quarter moon face",
      "🌜": "travel & places last quarter moon face",
      "🌝": "travel & places full moon face",
      "🌞": "travel & places sun with face",
      "🌟": "travel & places glowing star",
      "🌠": "travel & places shooting star",
      "🌡️": "travel & places thermometer",
      "🌤️": "travel & places sun behind small cloud",
      "🌥️": "travel & places sun behind large cloud",
      "🌦️": "travel & places sun behind rain cloud",
      "🌧️": "travel & places cloud with rain",
      "🌨️": "travel & places cloud with snow",
      "🌩️": "travel & places cloud with lightning",
      "🌪️": "travel & places tornado",
      "🌫️": "travel & places fog",
      "🌬️": "travel & places wind face",
      "🌭": "food & drink hot dog",
      "🌮": "food & drink taco",
      "🌯": "food & drink burrito",
      "🌰": "food & drink chestnut",
      "🌱": "animals & nature seedling",
      "🌲": "animals & nature evergreen tree",
      "🌳": "animals & nature deciduous tree",
      "🌴": "animals & nature palm tree",
      "🌵": "animals & nature cactus",
      "🌶️": "food & drink hot pepper",
      "🌷": "animals & nature tulip",
      "🌸": "animals & nature cherry blossom",
      "🌹": "animals & nature rose",
      "🌺": "animals & nature hibiscus",
      "🌻": "animals & nature sunflower",
      "🌼": "animals & nature blossom",
      "🌽": "food & drink ear of corn",
      "🌾": "animals & nature sheaf of rice",
      "🌿": "animals & nature herb",
      "🍀": "animals & nature four leaf clover",
      "🍁": "animals & nature maple leaf",
      "🍂": "animals & nature fallen leaf",
      "🍃": "animals & nature leaf fluttering in wind",
      "🍄": "animals & nature mushroom",
      "🍄‍🟫": "food & drink brown mushroom",
      "🍅": "food & drink tomato",
      "🍆": "food & drink eggplant",
      "🍇": "food & drink grapes",
      "🍈": "food & drink melon",
      "🍉": "food & drink watermelon",
      "🍊": "food & drink tangerine",
      "🍋": "food & drink lemon",
      "🍋‍🟩": "food & drink lime",
      "🍌": "food & drink banana",
      "🍍": "food & drink pineapple",
      "🍎": "food & drink red apple",
      "🍏": "food & drink green apple",
      "🍐": "food & drink pear",
      "🍑": "food & drink peach",
      "🍒": "food & drink cherries",
      "🍓": "food & drink strawberry",
      "🍔": "food & drink hamburger",
      "🍕": "food & drink pizza",
      "🍖": "food & drink meat on bone",
      "🍗": "food & drink poultry leg",
      "🍘": "food & drink rice cracker",
      "🍙": "food & drink rice ball",
      "🍚": "food & drink cooked rice",
      "🍛": "food & drink curry rice",
      "🍜": "food & drink steaming bowl",
      "🍝": "food & drink spaghetti",
      "🍞": "food & drink bread",
      "🍟": "food & drink french fries",
      "🍠": "food & drink roasted sweet potato",
      "🍡": "food & drink dango",
      "🍢": "food & drink oden",
      "🍣": "food & drink sushi",
      "🍤": "food & drink fried shrimp",
      "🍥": "food & drink fish cake with swirl",
      "🍦": "food & drink soft ice cream",
      "🍧": "food & drink shaved ice",
      "🍨": "food & drink ice cream",
      "🍩": "food & drink doughnut",
      "🍪": "food & drink cookie",
      "🍫": "food & drink chocolate bar",
      "🍬": "food & drink candy",
      "🍭": "food & drink lollipop",
      "🍮": "food & drink custard",
      "🍯": "food & drink honey pot",
      "🍰": "food & drink shortcake",
      "🍱": "food & drink bento box",
      "🍲": "food & drink pot of food",
      "🍳": "food & drink cooking",
      "🍴": "food & drink fork and knife",
      "🍵": "food & drink teacup without handle",
      "🍶": "food & drink sake",
      "🍷": "food & drink wine glass",
      "🍸": "food & drink cocktail glass",
      "🍹": "food & drink tropical drink",
      "🍺": "food & drink beer mug",
      "🍻": "food & drink clinking beer mugs",
      "🍼": "food & drink baby bottle",
      "🍽️": "food & drink fork and knife with plate",
      "🍾": "food & drink bottle with popping cork",
      "🍿": "food & drink popcorn",
      "🎀": "activities ribbon",
      "🎁": "activities wrapped gift",
      "🎂": "food & drink birthday cake",
      "🎃": "activities jack-o-lantern",
      "🎄": "activities christmas tree",
      "🎅": "people & body santa claus",
      "🎆": "activities fireworks",
      "🎇": "activities sparkler",
      "🎈": "activities balloon",
      "🎉": "activities party popper",
      "🎊": "activities confetti ball",
      "🎋": "activities tanabata tree",
      "🎌": "flags crossed flags",
      "🎍": "activities pine decoration",
      "🎎": "activities japanese dolls",
      "🎏": "activities carp streamer",
      "🎐": "activities wind chime",
      "🎑": "activities moon viewing ceremony",
      "🎒": "objects backpack",
      "🎓": "objects graduation cap",
      "🎖️": "activities military medal",
      "🎗️": "activities reminder ribbon",
      "🎙️": "objects studio microphone",
      "🎚️": "objects level slider",
      "🎛️": "objects control knobs",
      "🎞️": "objects film frames",
      "🎟️": "activities admission tickets",
      "🎠": "travel & places carousel horse",
      "🎡": "travel & places ferris wheel",
      "🎢": "travel & places roller coaster",
      "🎣": "activities fishing pole",
      "🎤": "objects microphone",
      "🎥": "objects movie camera",
      "🎦": "symbols cinema",
      "🎧": "objects headphone",
      "🎨": "activities artist palette",
      "🎩": "objects top hat",
      "🎪": "travel & places circus tent",
      "🎫": "activities ticket",
      "🎬": "objects clapper board",
      "🎭": "activities performing arts",
      "🎮": "activities video game",
      "🎯": "activities bullseye",
      "🎰": "activities slot machine",
      "🎱": "activities pool 8 ball",
      "🎲": "activities game die",
      "🎳": "activities bowling",
      "🎴": "activities flower playing cards",
      "🎵": "objects musical note",
      "🎶": "objects musical notes",
      "🎷": "objects saxophone",
      "🎸": "objects guitar",
      "🎹": "objects musical keyboard",
      "🎺": "objects trumpet",
      "🎻": "objects violin",
      "🎼": "objects musical score",
      "🎽": "activities running shirt",
      "🎾": "activities tennis",
      "🎿": "activities skis",
      "🏀": "activities basketball",
      "🏁": "flags chequered flag",
      "🏂": "people & body snowboarder",
      "🏃": "people & body person running",
      "🏃‍♀️": "people & body woman running",
      "🏃‍♀️‍➡️": "people & body woman running facing right",
      "🏃‍♂️": "people & body man running",
      "🏃‍♂️‍➡️": "people & body man running facing right",
      "🏃‍➡️": "people & body person running facing right",
      "🏄": "people & body person surfing",
      "🏄‍♀️": "people & body woman surfing",
      "🏄‍♂️": "people & body man surfing",
      "🏅": "activities sports medal",
      "🏆": "activities trophy",
      "🏇": "people & body horse racing",
      "🏈": "activities american football",
      "🏉": "activities rugby football",
      "🏊": "people & body person swimming",
      "🏊‍♀️": "people & body woman swimming",
      "🏊‍♂️": "people & body man swimming",
      "🏋️": "people & body person lifting weights",
      "🏋️‍♀️": "people & body woman lifting weights",
      "🏋️‍♂️": "people & body man lifting weights",
      "🏌️": "people & body person golfing",
      "🏌️‍♀️": "people & body woman golfing",
      "🏌️‍♂️": "people & body man golfing",
      "🏍️": "travel & places motorcycle",
      "🏎️": "travel & places racing car",
      "🏏": "activities cricket game",
      "🏐": "activities volleyball",
      "🏑": "activities field hockey",
      "🏒": "activities ice hockey",
      "🏓": "activities ping pong",
      "🏔️": "travel & places snow-capped mountain",
      "🏕️": "travel & places camping",
      "🏖️": "travel & places beach with umbrella",
      "🏗️": "travel & places building construction",
      "🏘️": "travel & places houses",
      "🏙️": "travel & places cityscape",
      "🏚️": "travel & places derelict house",
      "🏛️": "travel & places classical building",
      "🏜️": "travel & places desert",
      "🏝️": "travel & places desert island",
      "🏞️": "travel & places national park",
      "🏟️": "travel & places stadium",
      "🏠": "travel & places house",
      "🏡": "travel & places house with garden",
      "🏢": "travel & places office building",
      "🏣": "travel & places japanese post office",
      "🏤": "travel & places post office",
      "🏥": "travel & places hospital",
      "🏦": "travel & places bank",
      "🏧": "symbols atm sign",
      "🏨": "travel & places hotel",
      "🏩": "travel & places love hotel",
      "🏪": "travel & places convenience store",
      "🏫": "travel & places school",
      "🏬": "travel & places department store",
      "🏭": "travel & places factory",
      "🏮": "objects red paper lantern",
      "🏯": "travel & places japanese castle",
      "🏰": "travel & places castle",
      "🏳️": "flags white flag",
      "🏳️‍⚧️": "flags transgender flag",
      "🏳️‍🌈": "flags rainbow flag",
      "🏴": "flags black flag",
      "🏴‍☠️": "flags pirate flag",
      "🏴󠁧󠁢󠁥󠁮󠁧󠁿": "flags flag: england",
      "🏴󠁧󠁢󠁳󠁣󠁴󠁿": "flags flag: scotland",
      "🏴󠁧󠁢󠁷󠁬󠁳󠁿": "flags flag: wales",
      "🏵️": "animals & nature rosette",
      "🏷️": "objects label",
      "🏸": "activities badminton",
      "🏹": "objects bow and arrow",
      "🏺": "food & drink amphora",
      "🐀": "animals & nature rat",
      "🐁": "animals & nature mouse",
      "🐂": "animals & nature ox",
      "🐃": "animals & nature water buffalo",
      "🐄": "animals & nature cow",
      "🐅": "animals & nature tiger",
      "🐆": "animals & nature leopard",
      "🐇": "animals & nature rabbit",
      "🐈": "animals & nature cat",
      "🐈‍⬛": "animals & nature black cat",
      "🐉": "animals & nature dragon",
      "🐊": "animals & nature crocodile",
      "🐋": "animals & nature whale",
      "🐌": "animals & nature snail",
      "🐍": "animals & nature snake",
      "🐎": "animals & nature horse",
      "🐏": "animals & nature ram",
      "🐐": "animals & nature goat",
      "🐑": "animals & nature ewe",
      "🐒": "animals & nature monkey",
      "🐓": "animals & nature rooster",
      "🐔": "animals & nature chicken",
      "🐕": "animals & nature dog",
      "🐕‍🦺": "animals & nature service dog",
      "🐖": "animals & nature pig",
      "🐗": "animals & nature boar",
      "🐘": "animals & nature elephant",
      "🐙": "animals & nature octopus",
      "🐚": "animals & nature spiral shell",
      "🐛": "animals & nature bug",
      "🐜": "animals & nature ant",
      "🐝": "animals & nature honeybee",
      "🐞": "animals & nature lady beetle",
      "🐟": "animals & nature fish",
      "🐠": "animals & nature tropical fish",
      "🐡": "animals & nature blowfish",
      "🐢": "animals & nature turtle",
      "🐣": "animals & nature hatching chick",
      "🐤": "animals & nature baby chick",
      "🐥": "animals & nature front-facing baby chick",
      "🐦": "animals & nature bird",
      "🐦‍⬛": "animals & nature black bird",
      "🐦‍🔥": "animals & nature phoenix",
      "🐧": "animals & nature penguin",
      "🐨": "animals & nature koala",
      "🐩": "animals & nature poodle",
      "🐪": "animals & nature camel",
      "🐫": "animals & nature two-hump camel",
      "🐬": "animals & nature dolphin",
      "🐭": "animals & nature mouse face",
      "🐮": "animals & nature cow face",
      "🐯": "animals & nature tiger face",
      "🐰": "animals & nature rabbit face",
      "🐱": "animals & nature cat face",
      "🐲": "animals & nature dragon face",
      "🐳": "animals & nature spouting whale",
      "🐴": "animals & nature horse face",
      "🐵": "animals & nature monkey face",
      "🐶": "animals & nature dog face",
      "🐷": "animals & nature pig face",
      "🐸": "animals & nature frog",
      "🐹": "animals & nature hamster",
      "🐺": "animals & nature wolf",
      "🐻": "animals & nature bear",
      "🐻‍❄️": "animals & nature polar bear",
      "🐼": "animals & nature panda",
      "🐽": "animals & nature pig nose",
      "🐾": "animals & nature paw prints",
      "🐿️": "animals & nature chipmunk",
      "👀": "people & body eyes",
      "👁️": "people & body eye",
      "👁️‍🗨️": "smileys & emotion eye in speech bubble",
      "👂": "people & body ear",
      "👃": "people & body nose",
      "👄": "people & body mouth",
      "👅": "people & body tongue",
      "👆": "people & body backhand index pointing up",
      "👇": "people & body backhand index pointing down",
      "👈": "people & body backhand index pointing left",
      "👉": "people & body backhand index pointing right",
      "👊": "people & body oncoming fist",
      "👋": "people & body waving hand",
      "👌": "people & body ok hand",
      "👍": "people & body thumbs up",
      "👎": "people & body thumbs down",
      "👏": "people & body clapping hands",
      "👐": "people & body open hands",
      "👑": "objects crown",
      "👒": "objects woman’s hat",
      "👓": "objects glasses",
      "👔": "objects necktie",
      "👕": "objects t-shirt",
      "👖": "objects jeans",
      "👗": "objects dress",
      "👘": "objects kimono",
      "👙": "objects bikini",
      "👚": "objects woman’s clothes",
      "👛": "objects purse",
      "👜": "objects handbag",
      "👝": "objects clutch bag",
      "👞": "objects man’s shoe",
      "👟": "objects running shoe",
      "👠": "objects high-heeled shoe",
      "👡": "objects woman’s sandal",
      "👢": "objects woman’s boot",
      "👣": "people & body footprints",
      "👤": "people & body bust in silhouette",
      "👥": "people & body busts in silhouette",
      "👦": "people & body boy",
      "👧": "people & body girl",
      "👨": "people & body man",
      "👨‍⚕️": "people & body man health worker",
      "👨‍⚖️": "people & body man judge",
      "👨‍✈️": "people & body man pilot",
      "👨‍❤️‍👨": "people & body couple with heart: man, man",
      "👨‍❤️‍💋‍👨": "people & body kiss: man, man",
      "👨‍🌾": "people & body man farmer",
      "👨‍🍳": "people & body man cook",
      "👨‍🍼": "people & body man feeding baby",
      "👨‍🎓": "people & body man student",
      "👨‍🎤": "people & body man singer",
      "👨‍🎨": "people & body man artist",
      "👨‍🏫": "people & body man teacher",
      "👨‍🏭": "people & body man factory worker",
      "👨‍👦": "people & body family: man, boy",
      "👨‍👦‍👦": "people & body family: man, boy, boy",
      "👨‍👧": "people & body family: man, girl",
      "👨‍👧‍👦": "people & body family: man, girl, boy",
      "👨‍👧‍👧": "people & body family: man, girl, girl",
      "👨‍👨‍👦": "people & body family: man, man, boy",
      "👨‍👨‍👦‍👦": "people & body family: man, man, boy, boy",
      "👨‍👨‍👧": "people & body family: man, man, girl",
      "👨‍👨‍👧‍👦": "people & body family: man, man, girl, boy",
      "👨‍👨‍👧‍👧": "people & body family: man, man, girl, girl",
      "👨‍👩‍👦": "people & body family: man, woman, boy",
      "👨‍👩‍👦‍👦": "people & body family: man, woman, boy, boy",
      "👨‍👩‍👧": "people & body family: man, woman, girl",
      "👨‍👩‍👧‍👦": "people & body family: man, woman, girl, boy",
      "👨‍👩‍👧‍👧": "people & body family: man, woman, girl, girl",
      "👨‍💻": "people & body man technologist",
      "👨‍💼": "people & body man office worker",
      "👨‍🔧": "people & body man mechanic",
      "👨‍🔬": "people & body man scientist",
      "👨‍🚀": "people & body man astronaut",
      "👨‍🚒": "people & body man firefighter",
      "👨‍🦯": "people & body man with white cane",
      "👨‍🦯‍➡️": "people & body man with white cane facing right",
      "👨‍🦰": "people & body man: red hair",
      "👨‍🦱": "people & body man: curly hair",
      "👨‍🦲": "people & body man: bald",
      "👨‍🦳": "people & body man: white hair",
      "👨‍🦼": "people & body man in motorized wheelchair",
      "👨‍🦼‍➡️": "people & body man in motorized wheelchair facing right",
      "👨‍🦽": "people & body man in manual wheelchair",
      "👨‍🦽‍➡️": "people & body man in manual wheelchair facing right",
      "👩": "people & body woman",
      "👩‍⚕️": "people & body woman health worker",
      "👩‍⚖️": "people & body woman judge",
      "👩‍✈️": "people & body woman pilot",
      "👩‍❤️‍👨": "people & body couple with heart: woman, man",
      "👩‍❤️‍👩": "people & body couple with heart: woman, woman",
      "👩‍❤️‍💋‍👨": "people & body kiss: woman, man",
      "👩‍❤️‍💋‍👩": "people & body kiss: woman, woman",
      "👩‍🌾": "people & body woman farmer",
      "👩‍🍳": "people & body woman cook",
      "👩‍🍼": "people & body woman feeding baby",
      "👩‍🎓": "people & body woman student",
      "👩‍🎤": "people & body woman singer",
      "👩‍🎨": "people & body woman artist",
      "👩‍🏫": "people & body woman teacher",
      "👩‍🏭": "people & body woman factory worker",
      "👩‍👦": "people & body family: woman, boy",
      "👩‍👦‍👦": "people & body family: woman, boy, boy",
      "👩‍👧": "people & body family: woman, girl",
      "👩‍👧‍👦": "people & body family: woman, girl, boy",
      "👩‍👧‍👧": "people & body family: woman, girl, girl",
      "👩‍👩‍👦": "people & body family: woman, woman, boy",
      "👩‍👩‍👦‍👦": "people & body family: woman, woman, boy, boy",
      "👩‍👩‍👧": "people & body family: woman, woman, girl",
      "👩‍👩‍👧‍👦": "people & body family: woman, woman, girl, boy",
      "👩‍👩‍👧‍👧": "people & body family: woman, woman, girl, girl",
      "👩‍💻": "people & body woman technologist",
      "👩‍💼": "people & body woman office worker",
      "👩‍🔧": "people & body woman mechanic",
      "👩‍🔬": "people & body woman scientist",
      "👩‍🚀": "people & body woman astronaut",
      "👩‍🚒": "people & body woman firefighter",
      "👩‍🦯": "people & body woman with white cane",
      "👩‍🦯‍➡️": "people & body woman with white cane facing right",
      "👩‍🦰": "people & body woman: red hair",
      "👩‍🦱": "people & body woman: curly hair",
      "👩‍🦲": "people & body woman: bald",
      "👩‍🦳": "people & body woman: white hair",
      "👩‍🦼": "people & body woman in motorized wheelchair",
      "👩‍🦼‍➡️": "people & body woman in motorized wheelchair facing right",
      "👩‍🦽": "people & body woman in manual wheelchair",
      "👩‍🦽‍➡️": "people & body woman in manual wheelchair facing right",
      "👪": "people & body family",
      "👫": "people & body woman and man holding hands",
      "👬": "people & body men holding hands",
      "👭": "people & body women holding hands",
      "👮": "people & body police officer",
      "👮‍♀️": "people & body woman police officer",
      "👮‍♂️": "people & body man police officer",
      "👯": "people & body people with bunny ears",
      "👯‍♀️": "people & body women with bunny ears",
      "👯‍♂️": "people & body men with bunny ears",
      "👰": "people & body person with veil",
      "👰‍♀️": "people & body woman with veil",
      "👰‍♂️": "people & body man with veil",
      "👱": "people & body person: blond hair",
      "👱‍♀️": "people & body woman: blond hair",
      "👱‍♂️": "people & body man: blond hair",
      "👲": "people & body person with skullcap",
      "👳": "people & body person wearing turban",
      "👳‍♀️": "people & body woman wearing turban",
      "👳‍♂️": "people & body man wearing turban",
      "👴": "people & body old man",
      "👵": "people & body old woman",
      "👶": "people & body baby",
      "👷": "people & body construction worker",
      "👷‍♀️": "people & body woman construction worker",
      "👷‍♂️": "people & body man construction worker",
      "👸": "people & body princess",
      "👹": "smileys & emotion ogre",
      "👺": "smileys & emotion goblin",
      "👻": "smileys & emotion ghost",
      "👼": "people & body baby angel",
      "👽": "smileys & emotion alien",
      "👾": "smileys & emotion alien monster",
      "👿": "smileys & emotion angry face with horns",
      "💀": "smileys & emotion skull",
      "💁": "people & body person tipping hand",
      "💁‍♀️": "people & body woman tipping hand",
      "💁‍♂️": "people & body man tipping hand",
      "💂": "people & body guard",
      "💂‍♀️": "people & body woman guard",
      "💂‍♂️": "people & body man guard",
      "💃": "people & body woman dancing",
      "💄": "objects lipstick",
      "💅": "people & body nail polish",
      "💆": "people & body person getting massage",
      "💆‍♀️": "people & body woman getting massage",
      "💆‍♂️": "people & body man getting massage",
      "💇": "people & body person getting haircut",
      "💇‍♀️": "people & body woman getting haircut",
      "💇‍♂️": "people & body man getting haircut",
      "💈": "travel & places barber pole",
      "💉": "objects syringe",
      "💊": "objects pill",
      "💋": "smileys & emotion kiss mark",
      "💌": "smileys & emotion love letter",
      "💍": "objects ring",
      "💎": "objects gem stone",
      "💏": "people & body kiss",
      "💐": "animals & nature bouquet",
      "💑": "people & body couple with heart",
      "💒": "travel & places wedding",
      "💓": "smileys & emotion beating heart",
      "💔": "smileys & emotion broken heart",
      "💕": "smileys & emotion two hearts",
      "💖": "smileys & emotion sparkling heart",
      "💗": "smileys & emotion growing heart",
      "💘": "smileys & emotion heart with arrow",
      "💙": "smileys & emotion blue heart",
      "💚": "smileys & emotion green heart",
      "💛": "smileys & emotion yellow heart",
      "💜": "smileys & emotion purple heart",
      "💝": "smileys & emotion heart with ribbon",
      "💞": "smileys & emotion revolving hearts",
      "💟": "smileys & emotion heart decoration",
      "💠": "symbols diamond with a dot",
      "💡": "objects light bulb",
      "💢": "smileys & emotion anger symbol",
      "💣": "objects bomb",
      "💤": "smileys & emotion zzz",
      "💥": "smileys & emotion collision",
      "💦": "smileys & emotion sweat droplets",
      "💧": "travel & places droplet",
      "💨": "smileys & emotion dashing away",
      "💩": "smileys & emotion pile of poo",
      "💪": "people & body flexed biceps",
      "💫": "smileys & emotion dizzy",
      "💬": "smileys & emotion speech balloon",
      "💭": "smileys & emotion thought balloon",
      "💮": "animals & nature white flower",
      "💯": "smileys & emotion hundred points",
      "💰": "objects money bag",
      "💱": "symbols currency exchange",
      "💲": "symbols heavy dollar sign",
      "💳": "objects credit card",
      "💴": "objects yen banknote",
      "💵": "objects dollar banknote",
      "💶": "objects euro banknote",
      "💷": "objects pound banknote",
      "💸": "objects money with wings",
      "💹": "objects chart increasing with yen",
      "💺": "travel & places seat",
      "💻": "objects laptop",
      "💼": "objects briefcase",
      "💽": "objects computer disk",
      "💾": "objects floppy disk",
      "💿": "objects optical disk",
      "📀": "objects dvd",
      "📁": "objects file folder",
      "📂": "objects open file folder",
      "📃": "objects page with curl",
      "📄": "objects page facing up",
      "📅": "objects calendar",
      "📆": "objects tear-off calendar",
      "📇": "objects card index",
      "📈": "objects chart increasing",
      "📉": "objects chart decreasing",
      "📊": "objects bar chart",
      "📋": "objects clipboard",
      "📌": "objects pushpin",
      "📍": "objects round pushpin",
      "📎": "objects paperclip",
      "📏": "objects straight ruler",
      "📐": "objects triangular ruler",
      "📑": "objects bookmark tabs",
      "📒": "objects ledger",
      "📓": "objects notebook",
      "📔": "objects notebook with decorative cover",
      "📕": "objects closed book",
      "📖": "objects open book",
      "📗": "objects green book",
      "📘": "objects blue book",
      "📙": "objects orange book",
      "📚": "objects books",
      "📛": "symbols name badge",
      "📜": "objects scroll",
      "📝": "objects memo",
      "📞": "objects telephone receiver",
      "📟": "objects pager",
      "📠": "objects fax machine",
      "📡": "objects satellite antenna",
      "📢": "objects loudspeaker",
      "📣": "objects megaphone",
      "📤": "objects outbox tray",
      "📥": "objects inbox tray",
      "📦": "objects package",
      "📧": "objects e-mail",
      "📨": "objects incoming envelope",
      "📩": "objects envelope with arrow",
      "📪": "objects closed mailbox with lowered flag",
      "📫": "objects closed mailbox with raised flag",
      "📬": "objects open mailbox with raised flag",
      "📭": "objects open mailbox with lowered flag",
      "📮": "objects postbox",
      "📯": "objects postal horn",
      "📰": "objects newspaper",
      "📱": "objects mobile phone",
      "📲": "objects mobile phone with arrow",
      "📳": "symbols vibration mode",
      "📴": "symbols mobile phone off",
      "📵": "symbols no mobile phones",
      "📶": "symbols antenna bars",
      "📷": "objects camera",
      "📸": "objects camera with flash",
      "📹": "objects video camera",
      "📺": "objects television",
      "📻": "objects radio",
      "📼": "objects videocassette",
      "📽️": "objects film projector",
      "📿": "objects prayer beads",
      "🔀": "symbols shuffle tracks button",
      "🔁": "symbols repeat button",
      "🔂": "symbols repeat single button",
      "🔃": "symbols clockwise vertical arrows",
      "🔄": "symbols counterclockwise arrows button",
      "🔅": "symbols dim button",
      "🔆": "symbols bright button",
      "🔇": "objects muted speaker",
      "🔈": "objects speaker low volume",
      "🔉": "objects speaker medium volume",
      "🔊": "objects speaker high volume",
      "🔋": "objects battery",
      "🔌": "objects electric plug",
      "🔍": "objects magnifying glass tilted left",
      "🔎": "objects magnifying glass tilted right",
      "🔏": "objects locked with pen",
      "🔐": "objects locked with key",
      "🔑": "objects key",
      "🔒": "objects locked",
      "🔓": "objects unlocked",
      "🔔": "objects bell",
      "🔕": "objects bell with slash",
      "🔖": "objects bookmark",
      "🔗": "objects link",
      "🔘": "symbols radio button",
      "🔙": "symbols back arrow",
      "🔚": "symbols end arrow",
      "🔛": "symbols on! arrow",
      "🔜": "symbols soon arrow",
      "🔝": "symbols top arrow",
      "🔞": "symbols no one under eighteen",
      "🔟": "symbols keycap: 10",
      "🔠": "symbols input latin uppercase",
      "🔡": "symbols input latin lowercase",
      "🔢": "symbols input numbers",
      "🔣": "symbols input symbols",
      "🔤": "symbols input latin letters",
      "🔥": "travel & places fire",
      "🔦": "objects flashlight",
      "🔧": "objects wrench",
      "🔨": "objects hammer",
      "🔩": "objects nut and bolt",
      "🔪": "food & drink kitchen knife",
      "🔫": "activities water pistol",
      "🔬": "objects microscope",
      "🔭": "objects telescope",
      "🔮": "activities crystal ball",
      "🔯": "symbols dotted six-pointed star",
      "🔰": "symbols japanese symbol for beginner",
      "🔱": "symbols trident emblem",
      "🔲": "symbols black square button",
      "🔳": "symbols white square button",
      "🔴": "symbols red circle",
      "🔵": "symbols blue circle",
      "🔶": "symbols large orange diamond",
      "🔷": "symbols large blue diamond",
      "🔸": "symbols small orange diamond",
      "🔹": "symbols small blue diamond",
      "🔺": "symbols red triangle pointed up",
      "🔻": "symbols red triangle pointed down",
      "🔼": "symbols upwards button",
      "🔽": "symbols downwards button",
      "🕉️": "symbols om",
      "🕊️": "animals & nature dove",
      "🕋": "travel & places kaaba",
      "🕌": "travel & places mosque",
      "🕍": "travel & places synagogue",
      "🕎": "symbols menorah",
      "🕐": "travel & places one o’clock",
      "🕑": "travel & places two o’clock",
      "🕒": "travel & places three o’clock",
      "🕓": "travel & places four o’clock",
      "🕔": "travel & places five o’clock",
      "🕕": "travel & places six o’clock",
      "🕖": "travel & places seven o’clock",
      "🕗": "travel & places eight o’clock",
      "🕘": "travel & places nine o’clock",
      "🕙": "travel & places ten o’clock",
      "🕚": "travel & places eleven o’clock",
      "🕛": "travel & places twelve o’clock",
      "🕜": "travel & places one-thirty",
      "🕝": "travel & places two-thirty",
      "🕞": "travel & places three-thirty",
      "🕟": "travel & places four-thirty",
      "🕠": "travel & places five-thirty",
      "🕡": "travel & places six-thirty",
      "🕢": "travel & places seven-thirty",
      "🕣": "travel & places eight-thirty",
      "🕤": "travel & places nine-thirty",
      "🕥": "travel & places ten-thirty",
      "🕦": "travel & places eleven-thirty",
      "🕧": "travel & places twelve-thirty",
      "🕯️": "objects candle",
      "🕰️": "travel & places mantelpiece clock",
      "🕳️": "smileys & emotion hole",
      "🕴️": "people & body person in suit levitating",
      "🕵️": "people & body detective",
      "🕵️‍♀️": "people & body woman detective",
      "🕵️‍♂️": "people & body man detective",
      "🕶️": "objects sunglasses",
      "🕷️": "animals & nature spider",
      "🕸️": "animals & nature spider web",
      "🕹️": "activities joystick",
      "🕺": "people & body man dancing",
      "🖇️": "objects linked paperclips",
      "🖊️": "objects pen",
      "🖋️": "objects fountain pen",
      "🖌️": "objects paintbrush",
      "🖍️": "objects crayon",
      "🖐️": "people & body hand with fingers splayed",
      "🖕": "people & body middle finger",
      "🖖": "people & body vulcan salute",
      "🖤": "smileys & emotion black heart",
      "🖥️": "objects desktop computer",
      "🖨️": "objects printer",
      "🖱️": "objects computer mouse",
      "🖲️": "objects trackball",
      "🖼️": "activities framed picture",
      "🗂️": "objects card index dividers",
      "🗃️": "objects card file box",
      "🗄️": "objects file cabinet",
      "🗑️": "objects wastebasket",
      "🗒️": "objects spiral notepad",
      "🗓️": "objects spiral calendar",
      "🗜️": "objects clamp",
      "🗝️": "objects old key",
      "🗞️": "objects rolled-up newspaper",
      "🗡️": "objects dagger",
      "🗣️": "people & body speaking head",
      "🗨️": "smileys & emotion left speech bubble",
      "🗯️": "smileys & emotion right anger bubble",
      "🗳️": "objects ballot box with ballot",
      "🗺️": "travel & places world map",
      "🗻": "travel & places mount fuji",
      "🗼": "travel & places tokyo tower",
      "🗽": "travel & places statue of liberty",
      "🗾": "travel & places map of japan",
      "🗿": "objects moai",
      "😀": "smileys & emotion grinning face",
      "😁": "smileys & emotion beaming face with smiling eyes",
      "😂": "smileys & emotion face with tears of joy",
      "😃": "smileys & emotion grinning face with big eyes",
      "😄": "smileys & emotion grinning face with smiling eyes",
      "😅": "smileys & emotion grinning face with sweat",
      "😆": "smileys & emotion grinning squinting face",
      "😇": "smileys & emotion smiling face with halo",
      "😈": "smileys & emotion smiling face with horns",
      "😉": "smileys & emotion winking face",
      "😊": "smileys & emotion smiling face with smiling eyes",
      "😋": "smileys & emotion face savoring food",
      "😌": "smileys & emotion relieved face",
      "😍": "smileys & emotion smiling face with heart-eyes",
      "😎": "smileys & emotion smiling face with sunglasses",
      "😏": "smileys & emotion smirking face",
      "😐": "smileys & emotion neutral face",
      "😑": "smileys & emotion expressionless face",
      "😒": "smileys & emotion unamused face",
      "😓": "smileys & emotion downcast face with sweat",
      "😔": "smileys & emotion pensive face",
      "😕": "smileys & emotion confused face",
      "😖": "smileys & emotion confounded face",
      "😗": "smileys & emotion kissing face",
      "😘": "smileys & emotion face blowing a kiss",
      "😙": "smileys & emotion kissing face with smiling eyes",
      "😚": "smileys & emotion kissing face with closed eyes",
      "😛": "smileys & emotion face with tongue",
      "😜": "smileys & emotion winking face with tongue",
      "😝": "smileys & emotion squinting face with tongue",
      "😞": "smileys & emotion disappointed face",
      "😟": "smileys & emotion worried face",
      "😠": "smileys & emotion angry face",
      "😡": "smileys & emotion enraged face",
      "😢": "smileys & emotion crying face",
      "😣": "smileys & emotion persevering face",
      "😤": "smileys & emotion face with steam from nose",
      "😥": "smileys & emotion sad but relieved face",
      "😦": "smileys & emotion frowning face with open mouth",
      "😧": "smileys & emotion anguished face",
      "😨": "smileys & emotion fearful face",
      "😩": "smileys & emotion weary face",
      "😪": "smileys & emotion sleepy face",
      "😫": "smileys & emotion tired face",
      "😬": "smileys & emotion grimacing face",
      "😭": "smileys & emotion loudly crying face",
      "😮": "smileys & emotion face with open mouth",
      "😮‍💨": "smileys & emotion face exhaling",
      "😯": "smileys & emotion hushed face",
      "😰": "smileys & emotion anxious face with sweat",
      "😱": "smileys & emotion face screaming in fear",
      "😲": "smileys & emotion astonished face",
      "😳": "smileys & emotion flushed face",
      "😴": "smileys & emotion sleeping face",
      "😵": "smileys & emotion face with crossed-out eyes",
      "😵‍💫": "smileys & emotion face with spiral eyes",
      "😶": "smileys & emotion face without mouth",
      "😶‍🌫️": "smileys & emotion face in clouds",
      "😷": "smileys & emotion face with medical mask",
      "😸": "smileys & emotion grinning cat with smiling eyes",
      "😹": "smileys & emotion cat with tears of joy",
      "😺": "smileys & emotion grinning cat",
      "😻": "smileys & emotion smiling cat with heart-eyes",
      "😼": "smileys & emotion cat with wry smile",
      "😽": "smileys & emotion kissing cat",
      "😾": "smileys & emotion pouting cat",
      "😿": "smileys & emotion crying cat",
      "🙀": "smileys & emotion weary cat",
      "🙁": "smileys & emotion slightly frowning face",
      "🙂": "smileys & emotion slightly smiling face",
      "🙂‍↔️": "smileys & emotion head shaking horizontally",
      "🙂‍↕️": "smileys & emotion head shaking vertically",
      "🙃": "smileys & emotion upside-down face",
      "🙄": "smileys & emotion face with rolling eyes",
      "🙅": "people & body person gesturing no",
      "🙅‍♀️": "people & body woman gesturing no",
      "🙅‍♂️": "people & body man gesturing no",
      "🙆": "people & body person gesturing ok",
      "🙆‍♀️": "people & body woman gesturing ok",
      "🙆‍♂️": "people & body man gesturing ok",
      "🙇": "people & body person bowing",
      "🙇‍♀️": "people & body woman bowing",
      "🙇‍♂️": "people & body man bowing",
      "🙈": "smileys & emotion see-no-evil monkey",
      "🙉": "smileys & emotion hear-no-evil monkey",
      "🙊": "smileys & emotion speak-no-evil monkey",
      "🙋": "people & body person raising hand",
      "🙋‍♀️": "people & body woman raising hand",
      "🙋‍♂️": "people & body man raising hand",
      "🙌": "people & body raising hands",
      "🙍": "people & body person frowning",
      "🙍‍♀️": "people & body woman frowning",
      "🙍‍♂️": "people & body man frowning",
      "🙎": "people & body person pouting",
      "🙎‍♀️": "people & body woman pouting",
      "🙎‍♂️": "people & body man pouting",
      "🙏": "people & body folded hands",
      "🚀": "travel & places rocket",
      "🚁": "travel & places helicopter",
      "🚂": "travel & places locomotive",
      "🚃": "travel & places railway car",
      "🚄": "travel & places high-speed train",
      "🚅": "travel & places bullet train",
      "🚆": "travel & places train",
      "🚇": "travel & places metro",
      "🚈": "travel & places light rail",
      "🚉": "travel & places station",
      "🚊": "travel & places tram",
      "🚋": "travel & places tram car",
      "🚌": "travel & places bus",
      "🚍": "travel & places oncoming bus",
      "🚎": "travel & places trolleybus",
      "🚏": "travel & places bus stop",
      "🚐": "travel & places minibus",
      "🚑": "travel & places ambulance",
      "🚒": "travel & places fire engine",
      "🚓": "travel & places police car",
      "🚔": "travel & places oncoming police car",
      "🚕": "travel & places taxi",
      "🚖": "travel & places oncoming taxi",
      "🚗": "travel & places automobile",
      "🚘": "travel & places oncoming automobile",
      "🚙": "travel & places sport utility vehicle",
      "🚚": "travel & places delivery truck",
      "🚛": "travel & places articulated lorry",
      "🚜": "travel & places tractor",
      "🚝": "travel & places monorail",
      "🚞": "travel & places mountain railway",
      "🚟": "travel & places suspension railway",
      "🚠": "travel & places mountain cableway",
      "🚡": "travel & places aerial tramway",
      "🚢": "travel & places ship",
      "🚣": "people & body person rowing boat",
      "🚣‍♀️": "people & body woman rowing boat",
      "🚣‍♂️": "people & body man rowing boat",
      "🚤": "travel & places speedboat",
      "🚥": "travel & places horizontal traffic light",
      "🚦": "travel & places vertical traffic light",
      "🚧": "travel & places construction",
      "🚨": "travel & places police car light",
      "🚩": "flags triangular flag",
      "🚪": "objects door",
      "🚫": "symbols prohibited",
      "🚬": "objects cigarette",
      "🚭": "symbols no smoking",
      "🚮": "symbols litter in bin sign",
      "🚯": "symbols no littering",
      "🚰": "symbols potable water",
      "🚱": "symbols non-potable water",
      "🚲": "travel & places bicycle",
      "🚳": "symbols no bicycles",
      "🚴": "people & body person biking",
      "🚴‍♀️": "people & body woman biking",
      "🚴‍♂️": "people & body man biking",
      "🚵": "people & body person mountain biking",
      "🚵‍♀️": "people & body woman mountain biking",
      "🚵‍♂️": "people & body man mountain biking",
      "🚶": "people & body person walking",
      "🚶‍♀️": "people & body woman walking",
      "🚶‍♀️‍➡️": "people & body woman walking facing right",
      "🚶‍♂️": "people & body man walking",
      "🚶‍♂️‍➡️": "people & body man walking facing right",
      "🚶‍➡️": "people & body person walking facing right",
      "🚷": "symbols no pedestrians",
      "🚸": "symbols children crossing",
      "🚹": "symbols men’s room",
      "🚺": "symbols women’s room",
      "🚻": "symbols restroom",
      "🚼": "symbols baby symbol",
      "🚽": "objects toilet",
      "🚾": "symbols water closet",
      "🚿": "objects shower",
      "🛀": "people & body person taking bath",
      "🛁": "objects bathtub",
      "🛂": "symbols passport control",
      "🛃": "symbols customs",
      "🛄": "symbols baggage claim",
      "🛅": "symbols left luggage",
      "🛋️": "objects couch and lamp",
      "🛌": "people & body person in bed",
      "🛍️": "objects shopping bags",
      "🛎️": "travel & places bellhop bell",
      "🛏️": "objects bed",
      "🛐": "symbols place of worship",
      "🛑": "travel & places stop sign",
      "🛒": "objects shopping cart",
      "🛕": "travel & places hindu temple",
      "🛖": "travel & places hut",
      "🛗": "objects elevator",
      "🛘": "travel & places landslide",
      "🛜": "symbols wireless",
      "🛝": "travel & places playground slide",
      "🛞": "travel & places wheel",
      "🛟": "travel & places ring buoy",
      "🛠️": "objects hammer and wrench",
      "🛡️": "objects shield",
      "🛢️": "travel & places oil drum",
      "🛣️": "travel & places motorway",
      "🛤️": "travel & places railway track",
      "🛥️": "travel & places motor boat",
      "🛩️": "travel & places small airplane",
      "🛫": "travel & places airplane departure",
      "🛬": "travel & places airplane arrival",
      "🛰️": "travel & places satellite",
      "🛳️": "travel & places passenger ship",
      "🛴": "travel & places kick scooter",
      "🛵": "travel & places motor scooter",
      "🛶": "travel & places canoe",
      "🛷": "activities sled",
      "🛸": "travel & places flying saucer",
      "🛹": "travel & places skateboard",
      "🛺": "travel & places auto rickshaw",
      "🛻": "travel & places pickup truck",
      "🛼": "travel & places roller skate",
      "🟠": "symbols orange circle",
      "🟡": "symbols yellow circle",
      "🟢": "symbols green circle",
      "🟣": "symbols purple circle",
      "🟤": "symbols brown circle",
      "🟥": "symbols red square",
      "🟦": "symbols blue square",
      "🟧": "symbols orange square",
      "🟨": "symbols yellow square",
      "🟩": "symbols green square",
      "🟪": "symbols purple square",
      "🟫": "symbols brown square",
      "🟰": "symbols heavy equals sign",
      "🤌": "people & body pinched fingers",
      "🤍": "smileys & emotion white heart",
      "🤎": "smileys & emotion brown heart",
      "🤏": "people & body pinching hand",
      "🤐": "smileys & emotion zipper-mouth face",
      "🤑": "smileys & emotion money-mouth face",
      "🤒": "smileys & emotion face with thermometer",
      "🤓": "smileys & emotion nerd face",
      "🤔": "smileys & emotion thinking face",
      "🤕": "smileys & emotion face with head-bandage",
      "🤖": "smileys & emotion robot",
      "🤗": "smileys & emotion smiling face with open hands",
      "🤘": "people & body sign of the horns",
      "🤙": "people & body call me hand",
      "🤚": "people & body raised back of hand",
      "🤛": "people & body left-facing fist",
      "🤜": "people & body right-facing fist",
      "🤝": "people & body handshake",
      "🤞": "people & body crossed fingers",
      "🤟": "people & body love-you gesture",
      "🤠": "smileys & emotion cowboy hat face",
      "🤡": "smileys & emotion clown face",
      "🤢": "smileys & emotion nauseated face",
      "🤣": "smileys & emotion rolling on the floor laughing",
      "🤤": "smileys & emotion drooling face",
      "🤥": "smileys & emotion lying face",
      "🤦": "people & body person facepalming",
      "🤦‍♀️": "people & body woman facepalming",
      "🤦‍♂️": "people & body man facepalming",
      "🤧": "smileys & emotion sneezing face",
      "🤨": "smileys & emotion face with raised eyebrow",
      "🤩": "smileys & emotion star-struck",
      "🤪": "smileys & emotion zany face",
      "🤫": "smileys & emotion shushing face",
      "🤬": "smileys & emotion face with symbols on mouth",
      "🤭": "smileys & emotion face with hand over mouth",
      "🤮": "smileys & emotion face vomiting",
      "🤯": "smileys & emotion exploding head",
      "🤰": "people & body pregnant woman",
      "🤱": "people & body breast-feeding",
      "🤲": "people & body palms up together",
      "🤳": "people & body selfie",
      "🤴": "people & body prince",
      "🤵": "people & body person in tuxedo",
      "🤵‍♀️": "people & body woman in tuxedo",
      "🤵‍♂️": "people & body man in tuxedo",
      "🤶": "people & body mrs. claus",
      "🤷": "people & body person shrugging",
      "🤷‍♀️": "people & body woman shrugging",
      "🤷‍♂️": "people & body man shrugging",
      "🤸": "people & body person cartwheeling",
      "🤸‍♀️": "people & body woman cartwheeling",
      "🤸‍♂️": "people & body man cartwheeling",
      "🤹": "people & body person juggling",
      "🤹‍♀️": "people & body woman juggling",
      "🤹‍♂️": "people & body man juggling",
      "🤺": "people & body person fencing",
      "🤼": "people & body people wrestling",
      "🤼‍♀️": "people & body women wrestling",
      "🤼‍♂️": "people & body men wrestling",
      "🤽": "people & body person playing water polo",
      "🤽‍♀️": "people & body woman playing water polo",
      "🤽‍♂️": "people & body man playing water polo",
      "🤾": "people & body person playing handball",
      "🤾‍♀️": "people & body woman playing handball",
      "🤾‍♂️": "people & body man playing handball",
      "🤿": "activities diving mask",
      "🥀": "animals & nature wilted flower",
      "🥁": "objects drum",
      "🥂": "food & drink clinking glasses",
      "🥃": "food & drink tumbler glass",
      "🥄": "food & drink spoon",
      "🥅": "activities goal net",
      "🥇": "activities 1st place medal",
      "🥈": "activities 2nd place medal",
      "🥉": "activities 3rd place medal",
      "🥊": "activities boxing glove",
      "🥋": "activities martial arts uniform",
      "🥌": "activities curling stone",
      "🥍": "activities lacrosse",
      "🥎": "activities softball",
      "🥏": "activities flying disc",
      "🥐": "food & drink croissant",
      "🥑": "food & drink avocado",
      "🥒": "food & drink cucumber",
      "🥓": "food & drink bacon",
      "🥔": "food & drink potato",
      "🥕": "food & drink carrot",
      "🥖": "food & drink baguette bread",
      "🥗": "food & drink green salad",
      "🥘": "food & drink shallow pan of food",
      "🥙": "food & drink stuffed flatbread",
      "🥚": "food & drink egg",
      "🥛": "food & drink glass of milk",
      "🥜": "food & drink peanuts",
      "🥝": "food & drink kiwi fruit",
      "🥞": "food & drink pancakes",
      "🥟": "food & drink dumpling",
      "🥠": "food & drink fortune cookie",
      "🥡": "food & drink takeout box",
      "🥢": "food & drink chopsticks",
      "🥣": "food & drink bowl with spoon",
      "🥤": "food & drink cup with straw",
      "🥥": "food & drink coconut",
      "🥦": "food & drink broccoli",
      "🥧": "food & drink pie",
      "🥨": "food & drink pretzel",
      "🥩": "food & drink cut of meat",
      "🥪": "food & drink sandwich",
      "🥫": "food & drink canned food",
      "🥬": "food & drink leafy green",
      "🥭": "food & drink mango",
      "🥮": "food & drink moon cake",
      "🥯": "food & drink bagel",
      "🥰": "smileys & emotion smiling face with hearts",
      "🥱": "smileys & emotion yawning face",
      "🥲": "smileys & emotion smiling face with tear",
      "🥳": "smileys & emotion partying face",
      "🥴": "smileys & emotion woozy face",
      "🥵": "smileys & emotion hot face",
      "🥶": "smileys & emotion cold face",
      "🥷": "people & body ninja",
      "🥸": "smileys & emotion disguised face",
      "🥹": "smileys & emotion face holding back tears",
      "🥺": "smileys & emotion pleading face",
      "🥻": "objects sari",
      "🥼": "objects lab coat",
      "🥽": "objects goggles",
      "🥾": "objects hiking boot",
      "🥿": "objects flat shoe",
      "🦀": "animals & nature crab",
      "🦁": "animals & nature lion",
      "🦂": "animals & nature scorpion",
      "🦃": "animals & nature turkey",
      "🦄": "animals & nature unicorn",
      "🦅": "animals & nature eagle",
      "🦆": "animals & nature duck",
      "🦇": "animals & nature bat",
      "🦈": "animals & nature shark",
      "🦉": "animals & nature owl",
      "🦊": "animals & nature fox",
      "🦋": "animals & nature butterfly",
      "🦌": "animals & nature deer",
      "🦍": "animals & nature gorilla",
      "🦎": "animals & nature lizard",
      "🦏": "animals & nature rhinoceros",
      "🦐": "animals & nature shrimp",
      "🦑": "animals & nature squid",
      "🦒": "animals & nature giraffe",
      "🦓": "animals & nature zebra",
      "🦔": "animals & nature hedgehog",
      "🦕": "animals & nature sauropod",
      "🦖": "animals & nature t-rex",
      "🦗": "animals & nature cricket",
      "🦘": "animals & nature kangaroo",
      "🦙": "animals & nature llama",
      "🦚": "animals & nature peacock",
      "🦛": "animals & nature hippopotamus",
      "🦜": "animals & nature parrot",
      "🦝": "animals & nature raccoon",
      "🦞": "animals & nature lobster",
      "🦟": "animals & nature mosquito",
      "🦠": "animals & nature microbe",
      "🦡": "animals & nature badger",
      "🦢": "animals & nature swan",
      "🦣": "animals & nature mammoth",
      "🦤": "animals & nature dodo",
      "🦥": "animals & nature sloth",
      "🦦": "animals & nature otter",
      "🦧": "animals & nature orangutan",
      "🦨": "animals & nature skunk",
      "🦩": "animals & nature flamingo",
      "🦪": "animals & nature oyster",
      "🦫": "animals & nature beaver",
      "🦬": "animals & nature bison",
      "🦭": "animals & nature seal",
      "🦮": "animals & nature guide dog",
      "🦯": "objects white cane",
      "🦴": "people & body bone",
      "🦵": "people & body leg",
      "🦶": "people & body foot",
      "🦷": "people & body tooth",
      "🦸": "people & body superhero",
      "🦸‍♀️": "people & body woman superhero",
      "🦸‍♂️": "people & body man superhero",
      "🦹": "people & body supervillain",
      "🦹‍♀️": "people & body woman supervillain",
      "🦹‍♂️": "people & body man supervillain",
      "🦺": "objects safety vest",
      "🦻": "people & body ear with hearing aid",
      "🦼": "travel & places motorized wheelchair",
      "🦽": "travel & places manual wheelchair",
      "🦾": "people & body mechanical arm",
      "🦿": "people & body mechanical leg",
      "🧀": "food & drink cheese wedge",
      "🧁": "food & drink cupcake",
      "🧂": "food & drink salt",
      "🧃": "food & drink beverage box",
      "🧄": "food & drink garlic",
      "🧅": "food & drink onion",
      "🧆": "food & drink falafel",
      "🧇": "food & drink waffle",
      "🧈": "food & drink butter",
      "🧉": "food & drink mate",
      "🧊": "food & drink ice",
      "🧋": "food & drink bubble tea",
      "🧌": "people & body troll",
      "🧍": "people & body person standing",
      "🧍‍♀️": "people & body woman standing",
      "🧍‍♂️": "people & body man standing",
      "🧎": "people & body person kneeling",
      "🧎‍♀️": "people & body woman kneeling",
      "🧎‍♀️‍➡️": "people & body woman kneeling facing right",
      "🧎‍♂️": "people & body man kneeling",
      "🧎‍♂️‍➡️": "people & body man kneeling facing right",
      "🧎‍➡️": "people & body person kneeling facing right",
      "🧏": "people & body deaf person",
      "🧏‍♀️": "people & body deaf woman",
      "🧏‍♂️": "people & body deaf man",
      "🧐": "smileys & emotion face with monocle",
      "🧑": "people & body person",
      "🧑‍⚕️": "people & body health worker",
      "🧑‍⚖️": "people & body judge",
      "🧑‍✈️": "people & body pilot",
      "🧑‍🌾": "people & body farmer",
      "🧑‍🍳": "people & body cook",
      "🧑‍🍼": "people & body person feeding baby",
      "🧑‍🎄": "people & body mx claus",
      "🧑‍🎓": "people & body student",
      "🧑‍🎤": "people & body singer",
      "🧑‍🎨": "people & body artist",
      "🧑‍🏫": "people & body teacher",
      "🧑‍🏭": "people & body factory worker",
      "🧑‍💻": "people & body technologist",
      "🧑‍💼": "people & body office worker",
      "🧑‍🔧": "people & body mechanic",
      "🧑‍🔬": "people & body scientist",
      "🧑‍🚀": "people & body astronaut",
      "🧑‍🚒": "people & body firefighter",
      "🧑‍🤝‍🧑": "people & body people holding hands",
      "🧑‍🦯": "people & body person with white cane",
      "🧑‍🦯‍➡️": "people & body person with white cane facing right",
      "🧑‍🦰": "people & body person: red hair",
      "🧑‍🦱": "people & body person: curly hair",
      "🧑‍🦲": "people & body person: bald",
      "🧑‍🦳": "people & body person: white hair",
      "🧑‍🦼": "people & body person in motorized wheelchair",
      "🧑‍🦼‍➡️": "people & body person in motorized wheelchair facing right",
      "🧑‍🦽": "people & body person in manual wheelchair",
      "🧑‍🦽‍➡️": "people & body person in manual wheelchair facing right",
      "🧑‍🧑‍🧒": "people & body family: adult, adult, child",
      "🧑‍🧑‍🧒‍🧒": "people & body family: adult, adult, child, child",
      "🧑‍🧒": "people & body family: adult, child",
      "🧑‍🧒‍🧒": "people & body family: adult, child, child",
      "🧑‍🩰": "people & body ballet dancer",
      "🧒": "people & body child",
      "🧓": "people & body older person",
      "🧔": "people & body person: beard",
      "🧔‍♀️": "people & body woman: beard",
      "🧔‍♂️": "people & body man: beard",
      "🧕": "people & body woman with headscarf",
      "🧖": "people & body person in steamy room",
      "🧖‍♀️": "people & body woman in steamy room",
      "🧖‍♂️": "people & body man in steamy room",
      "🧗": "people & body person climbing",
      "🧗‍♀️": "people & body woman climbing",
      "🧗‍♂️": "people & body man climbing",
      "🧘": "people & body person in lotus position",
      "🧘‍♀️": "people & body woman in lotus position",
      "🧘‍♂️": "people & body man in lotus position",
      "🧙": "people & body mage",
      "🧙‍♀️": "people & body woman mage",
      "🧙‍♂️": "people & body man mage",
      "🧚": "people & body fairy",
      "🧚‍♀️": "people & body woman fairy",
      "🧚‍♂️": "people & body man fairy",
      "🧛": "people & body vampire",
      "🧛‍♀️": "people & body woman vampire",
      "🧛‍♂️": "people & body man vampire",
      "🧜": "people & body merperson",
      "🧜‍♀️": "people & body mermaid",
      "🧜‍♂️": "people & body merman",
      "🧝": "people & body elf",
      "🧝‍♀️": "people & body woman elf",
      "🧝‍♂️": "people & body man elf",
      "🧞": "people & body genie",
      "🧞‍♀️": "people & body woman genie",
      "🧞‍♂️": "people & body man genie",
      "🧟": "people & body zombie",
      "🧟‍♀️": "people & body woman zombie",
      "🧟‍♂️": "people & body man zombie",
      "🧠": "people & body brain",
      "🧡": "smileys & emotion orange heart",
      "🧢": "objects billed cap",
      "🧣": "objects scarf",
      "🧤": "objects gloves",
      "🧥": "objects coat",
      "🧦": "objects socks",
      "🧧": "activities red envelope",
      "🧨": "activities firecracker",
      "🧩": "activities puzzle piece",
      "🧪": "objects test tube",
      "🧫": "objects petri dish",
      "🧬": "objects dna",
      "🧭": "travel & places compass",
      "🧮": "objects abacus",
      "🧯": "objects fire extinguisher",
      "🧰": "objects toolbox",
      "🧱": "travel & places brick",
      "🧲": "objects magnet",
      "🧳": "travel & places luggage",
      "🧴": "objects lotion bottle",
      "🧵": "activities thread",
      "🧶": "activities yarn",
      "🧷": "objects safety pin",
      "🧸": "activities teddy bear",
      "🧹": "objects broom",
      "🧺": "objects basket",
      "🧻": "objects roll of paper",
      "🧼": "objects soap",
      "🧽": "objects sponge",
      "🧾": "objects receipt",
      "🧿": "objects nazar amulet",
      "🩰": "objects ballet shoes",
      "🩱": "objects one-piece swimsuit",
      "🩲": "objects briefs",
      "🩳": "objects shorts",
      "🩴": "objects thong sandal",
      "🩵": "smileys & emotion light blue heart",
      "🩶": "smileys & emotion grey heart",
      "🩷": "smileys & emotion pink heart",
      "🩸": "objects drop of blood",
      "🩹": "objects adhesive bandage",
      "🩺": "objects stethoscope",
      "🩻": "objects x-ray",
      "🩼": "objects crutch",
      "🪀": "activities yo-yo",
      "🪁": "activities kite",
      "🪂": "travel & places parachute",
      "🪃": "objects boomerang",
      "🪄": "activities magic wand",
      "🪅": "activities piñata",
      "🪆": "activities nesting dolls",
      "🪇": "objects maracas",
      "🪈": "objects flute",
      "🪉": "objects harp",
      "🪊": "objects trombone",
      "🪎": "objects treasure chest",
      "🪏": "objects shovel",
      "🪐": "travel & places ringed planet",
      "🪑": "objects chair",
      "🪒": "objects razor",
      "🪓": "objects axe",
      "🪔": "objects diya lamp",
      "🪕": "objects banjo",
      "🪖": "objects military helmet",
      "🪗": "objects accordion",
      "🪘": "objects long drum",
      "🪙": "objects coin",
      "🪚": "objects carpentry saw",
      "🪛": "objects screwdriver",
      "🪜": "objects ladder",
      "🪝": "objects hook",
      "🪞": "objects mirror",
      "🪟": "objects window",
      "🪠": "objects plunger",
      "🪡": "activities sewing needle",
      "🪢": "activities knot",
      "🪣": "objects bucket",
      "🪤": "objects mouse trap",
      "🪥": "objects toothbrush",
      "🪦": "objects headstone",
      "🪧": "objects placard",
      "🪨": "travel & places rock",
      "🪩": "activities mirror ball",
      "🪪": "objects identification card",
      "🪫": "objects low battery",
      "🪬": "objects hamsa",
      "🪭": "objects folding hand fan",
      "🪮": "objects hair pick",
      "🪯": "symbols khanda",
      "🪰": "animals & nature fly",
      "🪱": "animals & nature worm",
      "🪲": "animals & nature beetle",
      "🪳": "animals & nature cockroach",
      "🪴": "animals & nature potted plant",
      "🪵": "travel & places wood",
      "🪶": "animals & nature feather",
      "🪷": "animals & nature lotus",
      "🪸": "animals & nature coral",
      "🪹": "animals & nature empty nest",
      "🪺": "animals & nature nest with eggs",
      "🪻": "animals & nature hyacinth",
      "🪼": "animals & nature jellyfish",
      "🪽": "animals & nature wing",
      "🪾": "animals & nature leafless tree",
      "🪿": "animals & nature goose",
      "🫀": "people & body anatomical heart",
      "🫁": "people & body lungs",
      "🫂": "people & body people hugging",
      "🫃": "people & body pregnant man",
      "🫄": "people & body pregnant person",
      "🫅": "people & body person with crown",
      "🫆": "people & body fingerprint",
      "🫈": "people & body hairy creature",
      "🫍": "animals & nature orca",
      "🫎": "animals & nature moose",
      "🫏": "animals & nature donkey",
      "🫐": "food & drink blueberries",
      "🫑": "food & drink bell pepper",
      "🫒": "food & drink olive",
      "🫓": "food & drink flatbread",
      "🫔": "food & drink tamale",
      "🫕": "food & drink fondue",
      "🫖": "food & drink teapot",
      "🫗": "food & drink pouring liquid",
      "🫘": "food & drink beans",
      "🫙": "food & drink jar",
      "🫚": "food & drink ginger root",
      "🫛": "food & drink pea pod",
      "🫜": "food & drink root vegetable",
      "🫟": "symbols splatter",
      "🫠": "smileys & emotion melting face",
      "🫡": "smileys & emotion saluting face",
      "🫢": "smileys & emotion face with open eyes and hand over mouth",
      "🫣": "smileys & emotion face with peeking eye",
      "🫤": "smileys & emotion face with diagonal mouth",
      "🫥": "smileys & emotion dotted line face",
      "🫦": "people & body biting lip",
      "🫧": "objects bubbles",
      "🫨": "smileys & emotion shaking face",
      "🫩": "smileys & emotion face with bags under eyes",
      "🫪": "smileys & emotion distorted face",
      "🫯": "smileys & emotion fight cloud",
      "🫰": "people & body hand with index finger and thumb crossed",
      "🫱": "people & body rightwards hand",
      "🫲": "people & body leftwards hand",
      "🫳": "people & body palm down hand",
      "🫴": "people & body palm up hand",
      "🫵": "people & body index pointing at the viewer",
      "🫶": "people & body heart hands",
      "🫷": "people & body leftwards pushing hand",
      "🫸": "people & body rightwards pushing hand"
};
    var emojiValues = Array.from(new Set(emojiGroups.reduce(function(values, group) {
      return values.concat(group.icons.split(" "));
    }, [])));
    chat.className = "member-floating-chat";
    chat.setAttribute("data-member-floating-chat", "");
    chat.setAttribute("aria-label", "Floating community chat");
    applyStoredChatFrame(chat);
    chat.innerHTML =
      '<header class="member-floating-chat-header" data-chat-drag>' +
        '<button type="button" class="member-chat-owner" data-chat-owner aria-haspopup="menu" aria-expanded="false" aria-label="Messenger menu">' + renderOwnerIdentity(user) + '</button>' +
        '<div class="member-chat-header-actions">' +
          '<button type="button" data-chat-new>New Chat</button>' +
          '<button type="button" data-chat-minimize>Hide</button>' +
        '</div>' +
      '</header>' +
      '<div class="member-chat-identity-menu" data-chat-identity-menu hidden>' +
        '<div role="menu"></div>' +
      '</div>' +
      '<div class="member-floating-chat-content">' +
        '<aside class="member-chat-contacts" aria-label="Members">' +
          '<span class="member-chat-section-label">Members</span>' +
          '<input type="search" class="member-chat-member-search" data-chat-member-search placeholder="Search members" aria-label="Search members">' +
          '<div class="member-chat-online-list" data-chat-online></div>' +
          '<div class="member-chat-section-label member-chat-list-label"><span>Chats</span></div>' +
          '<div class="member-chat-list" data-chat-list></div>' +
        '</aside>' +
        '<section class="member-chat-thread">' +
          '<section class="member-chat-create" data-chat-create role="dialog" aria-labelledby="messenger-room-builder-title" hidden>' +
            '<header class="member-chat-create-header">' +
              '<div><span class="member-chat-kicker">Messenger rooms</span><strong id="messenger-room-builder-title" data-chat-create-title>Create Room</strong></div>' +
              '<button type="button" data-chat-create-close aria-label="Close room builder">Close</button>' +
            '</header>' +
            '<p data-chat-create-description>Name the room, then add at least one member from the left. You are included automatically.</p>' +
            '<label class="member-chat-create-name"><span>Room name</span><input type="text" data-chat-name maxlength="160" placeholder="Example: Investigation Team"></label>' +
            '<span class="member-chat-create-count" data-chat-create-count>0 members selected</span>' +
            '<div class="member-chat-member-list" data-chat-members aria-label="Selected room members"></div>' +
            '<p class="member-chat-create-status" data-chat-create-status role="status" aria-live="polite" hidden></p>' +
            '<button type="button" class="member-chat-create-submit" data-chat-start>Create Room</button>' +
          '</section>' +
          '<div class="member-chat-conversation-bar" data-chat-conversation-bar hidden>' +
            '<div class="member-chat-identity member-chat-active-identity" data-chat-identity aria-label="Active conversation">' + renderChatIdentity(currentChat, user) + '</div>' +
          '</div>' +
          '<div class="member-chat-thread-search" data-chat-thread-search hidden>' +
            '<input type="search" data-chat-search-input placeholder="Search in conversation" aria-label="Search in conversation">' +
            '<span data-chat-search-count></span>' +
            '<button type="button" data-chat-search-prev>Prev</button>' +
            '<button type="button" data-chat-search-next>Next</button>' +
            '<button type="button" data-chat-search-close>Close</button>' +
          '</div>' +
          '<section class="member-chat-messages" data-chat-messages aria-label="Chat messages"></section>' +
          '<div class="member-chat-attachment-preview" data-chat-attachments hidden></div>' +
          '<div class="member-chat-emoji-picker" data-chat-emoji-picker hidden>' +
            '<input type="search" data-chat-emoji-search placeholder="Search emojis" aria-label="Search emojis">' +
            '<div class="member-chat-emoji-categories" aria-label="Emoji categories">' +
              emojiGroups.map(function(group) {
                return '<button type="button" data-chat-emoji-category="' + escapeHtml(group.label) + '">' + escapeHtml(group.label) + '</button>';
              }).join("") +
            '</div>' +
            '<div class="member-chat-emoji-grid" data-chat-emoji-grid>' +
              emojiValues.map(function(emoji) {
                return '<button type="button" data-chat-emoji-value="' + escapeHtml(emoji) + '" title="' + escapeHtml(emoji) + '">' + escapeHtml(emoji) + '</button>';
              }).join("") +
            '</div>' +
          '</div>' +
          '<form class="member-chat-form" data-chat-form>' +
            '<p class="member-chat-status" data-chat-status role="status" aria-live="polite" hidden></p>' +
            '<div class="member-chat-tools" aria-label="Message tools">' +
              '<button type="button" data-chat-media title="Add photos or videos">Photo</button>' +
              '<button type="button" data-chat-voice title="Add a voice message">Voice</button>' +
              '<button type="button" data-chat-emoji title="Open emojis">Emoji</button>' +
            '</div>' +
            '<input type="file" data-chat-media-input accept="image/*,video/*" multiple hidden>' +
            '<input type="text" data-chat-input placeholder="Send a message">' +
              '<button type="button" data-chat-like title="Send thumbs up">Like</button>' +
              '<button type="submit" data-chat-send>Send</button>' +
          '</form>' +
        '</section>' +
      '</div>' +
      '<span class="member-chat-resize" data-chat-resize aria-hidden="true"></span>' +
      '<div class="member-chat-lightbox" data-chat-lightbox hidden>' +
        '<button type="button" data-chat-lightbox-close>Close</button>' +
        '<img src="" alt="" data-chat-lightbox-image>' +
      '</div>';
    document.body.appendChild(chat);

    var onlineEl = chat.querySelector("[data-chat-online]");
    var chatListEl = chat.querySelector("[data-chat-list]");
    var membersEl = chat.querySelector("[data-chat-members]");
    var createEl = chat.querySelector("[data-chat-create]");
    var chatNameEl = chat.querySelector("[data-chat-name]");
    var chatNameLabelEl = chatNameEl ? chatNameEl.closest("label") : null;
    var createTitleEl = chat.querySelector("[data-chat-create-title]");
    var createDescriptionEl = chat.querySelector("[data-chat-create-description]");
    var createCountEl = chat.querySelector("[data-chat-create-count]");
    var createStatusEl = chat.querySelector("[data-chat-create-status]");
    var createSubmitEl = chat.querySelector("[data-chat-start]");
    var messagesEl = chat.querySelector("[data-chat-messages]");
    var identityEl = chat.querySelector("[data-chat-identity]");
    var identityMenuEl = chat.querySelector("[data-chat-identity-menu]");
    var ownerEl = chat.querySelector("[data-chat-owner]");
    var conversationBarEl = chat.querySelector("[data-chat-conversation-bar]");
    var memberSearchEl = chat.querySelector("[data-chat-member-search]");
    var threadSearchEl = chat.querySelector("[data-chat-thread-search]");
    var searchInputEl = chat.querySelector("[data-chat-search-input]");
    var searchCountEl = chat.querySelector("[data-chat-search-count]");
    var searchPrevEl = chat.querySelector("[data-chat-search-prev]");
    var searchNextEl = chat.querySelector("[data-chat-search-next]");
    var searchCloseEl = chat.querySelector("[data-chat-search-close]");
    var inputEl = chat.querySelector("[data-chat-input]");
    var sendButton = chat.querySelector("[data-chat-send]");
    var chatStatusEl = chat.querySelector("[data-chat-status]");
    var attachmentPreviewEl = chat.querySelector("[data-chat-attachments]");
    var mediaInputEl = chat.querySelector("[data-chat-media-input]");
    var emojiPickerEl = chat.querySelector("[data-chat-emoji-picker]");
    var emojiSearchEl = chat.querySelector("[data-chat-emoji-search]");
    var emojiGridEl = chat.querySelector("[data-chat-emoji-grid]");
    var minimizeButton = chat.querySelector("[data-chat-minimize]");
    var lightboxEl = chat.querySelector("[data-chat-lightbox]");
    var lightboxImageEl = chat.querySelector("[data-chat-lightbox-image]");
    var pendingAttachments = [];
    var voiceRecorder = null;
    var voiceChunks = [];
    var editingMessageIndex = -1;
    var conversationBuilderMode = "room";
    var selectedMembers = new Set(currentChat.members.map(function(member) { return member.username; }));
    var memberSearchQuery = "";
    var activeSearchIndex = -1;
    var activeSearchMatches = [];
    var activeMessageSyncTimer = null;
    var conversationListSyncTimer = null;
    syncChatMinimizeButton();

    renderOnline();
    renderChatList();
    renderMemberPicker();
    renderMessages();
    setupNotificationBadge();

    async function syncActiveChatMessages() {
      if (!isRemoteConversation(currentChat)) return;
      if (activeMessageSyncInFlight) return;
      activeMessageSyncInFlight = true;
      try {
        var messages = await loadRemoteMessages(currentChat.id);
        if (!messages.length) return;
        var remoteSignature = JSON.stringify(messages.map(function(message) {
          return [message.id, message.body, message.editedAt || "", JSON.stringify(message.attachments || []), JSON.stringify(message.readBy || [])];
        }));
        var currentSignature = JSON.stringify((currentChat.messages || []).map(function(message) {
          return [message.id, message.body, message.editedAt || "", JSON.stringify(message.attachments || []), JSON.stringify(message.readBy || [])];
        }));
        var changed = remoteSignature !== currentSignature;
        if (changed) {
          currentChat.messages = messages;
          renderMessages();
          updateChatListPreview(currentChat);
          renderChatList();
          setupNotificationBadge();
        }
      } catch (e) {}
      activeMessageSyncInFlight = false;
    }

    async function syncConversationList() {
      await loadChatListFromRemote();
      await syncRosterPresence();
    }

    async function syncRosterPresence() {
      var nextRoster = await loadChatRoster(user);
      if (!Array.isArray(nextRoster)) return;
      roster = nextRoster;
      var presenceByUsername = {};
      roster.forEach(function(member) {
        presenceByUsername[normalizeChatUsername(member.username)] = member;
      });
      function applyPresence(members) {
        return (members || []).map(function(member) {
          var fresh = presenceByUsername[normalizeChatUsername(member.username)];
          return fresh ? Object.assign({}, member, {
            online: Boolean(fresh.online),
            lastSeenAt: fresh.lastSeenAt || null,
            status: fresh.status || (fresh.online ? "online" : "offline")
          }) : member;
        });
      }
      currentChat.members = applyPresence(currentChat.members);
      chatList.forEach(function(conversation) {
        conversation.members = applyPresence(conversation.members);
      });
      renderOnline();
      renderMemberPicker();
      renderIdentity();
      renderChatList();
    }

    var activeMessageSyncInFlight = false;
    function startActiveSync() {
      stopActiveSync();
      activeMessageSyncTimer = setInterval(syncActiveChatMessages, 4000);
      syncActiveChatMessages();
    }
    function stopActiveSync() {
      if (activeMessageSyncTimer) {
        clearInterval(activeMessageSyncTimer);
        activeMessageSyncTimer = null;
      }
    }
    function startListSync() {
      stopListSync();
      conversationListSyncTimer = setInterval(syncConversationList, 12000);
      syncConversationList();
    }
    function stopListSync() {
      if (conversationListSyncTimer) {
        clearInterval(conversationListSyncTimer);
        conversationListSyncTimer = null;
      }
    }
    var presenceHeartbeatTimer = null;
    function startPresenceHeartbeat() {
      stopPresenceHeartbeat();
      sendPresenceHeartbeat();
      presenceHeartbeatTimer = setInterval(sendPresenceHeartbeat, 30000);
    }
    function stopPresenceHeartbeat() {
      if (presenceHeartbeatTimer) {
        clearInterval(presenceHeartbeatTimer);
        presenceHeartbeatTimer = null;
      }
    }
    async function sendPresenceHeartbeat() {
      try {
        await apiFetch("POST", "/api/messenger/presence");
      } catch (e) {}
    }
    function setSyncForVisibility() {
      if (chat.classList.contains("is-collapsed")) {
        stopActiveSync();
        startListSync();
      } else {
        startActiveSync();
        startListSync();
      }
      startPresenceHeartbeat();
    }
    setSyncForVisibility();

    window.addEventListener("beforeunload", function() {
      stopActiveSync();
      stopListSync();
      stopPresenceHeartbeat();
    });

    document.addEventListener("visibilitychange", function() {
      if (document.visibilityState === "visible") {
        sendPresenceHeartbeat();
      }
    });

    chat.querySelector("[data-chat-new]").addEventListener("click", function () {
      openConversationBuilder("chat");
    });

    chat.querySelector("[data-chat-create-close]").addEventListener("click", closeConversationBuilder);

    chat.querySelector("[data-chat-start]").addEventListener("click", async function () {
      var usernames = roster.filter(function(member) {
        return selectedMembers.has(member.username);
      }).map(function(member) { return member.username; });
      var title = chatNameEl ? chatNameEl.value.trim() : "";
      var managingRoom = conversationBuilderMode === "manage";
      var creatingRoom = conversationBuilderMode === "room" || usernames.length > 1;
      if (!usernames.length) {
        setConversationBuilderStatus(managingRoom ? "A room must keep at least two people. Add one member before saving." : "Choose at least one member.", true);
        return;
      }
      if (!managingRoom && creatingRoom && !title) {
        setConversationBuilderStatus("Give this room a name before creating it.", true);
        if (chatNameEl) chatNameEl.focus();
        return;
      }
      setChatStatus("");
      setConversationBuilderStatus(managingRoom ? "Saving room members..." : "Creating " + (creatingRoom ? "room" : "chat") + "...");
      if (createSubmitEl) createSubmitEl.disabled = true;
      var createdChat = null;
      try {
        var remote = managingRoom
          ? await replaceRemoteConversationMembers(currentChat.id, usernames)
          : await createRemoteConversation(title, usernames, !creatingRoom);
        createdChat = normalizeRemoteConversation(remote);
      } catch (error) {
        setConversationBuilderStatus(error.message || (managingRoom ? "The room members could not be saved." : "The conversation could not be created. Please try again."), true);
        if (createSubmitEl) createSubmitEl.disabled = false;
        return;
      }
      closeConversationBuilder();
      await refreshChatListFromRemote();
      var savedCreatedChat = chatList.find(function(conversation) { return conversation.id === createdChat.id; }) || createdChat;
      await openChat(savedCreatedChat);
      saveCurrentChat(user, savedCreatedChat);
      renderChatList();
      if (inputEl) inputEl.focus();
    });

    function setMessengerCollapsed(collapsed) {
      if (collapsed) {
        storeChatFrame(chat);
        chat.classList.add("is-collapsed");
        dockCollapsedChat(chat);
      } else {
        chat.classList.remove("is-collapsed");
        applyStoredChatFrame(chat, true);
      }
      syncChatMinimizeButton();
      storeChatFrame(chat);
      closeIdentityMenu();
      closeOwnerMenu();
      setSyncForVisibility();
    }

    minimizeButton.addEventListener("click", function () {
      setMessengerCollapsed(!chat.classList.contains("is-collapsed"));
    });

    chat.addEventListener("click", function () {
      if (chat.classList.contains("is-collapsed")) dockCollapsedChat(chat);
    });

    window.addEventListener("resize", function () {
      if (chat.classList.contains("is-collapsed")) dockCollapsedChat(chat);
      closeIdentityMenu();
      closeOwnerMenu();
    });

    chat.querySelector("[data-chat-form]").addEventListener("submit", async function (event) {
      event.preventDefault();
      var body = inputEl.value.trim();
      if (editingMessageIndex >= 0) {
        if (!body && !pendingAttachments.length) return;
        var editingMessage = currentChat.messages[editingMessageIndex];
        try {
          if (isRemoteConversation(currentChat) && editingMessage.id) {
            setChatStatus("Saving edit...");
            var editedAttachments = await prepareMessengerAttachments(pendingAttachments);
            var updatedMessage = await updateRemoteMessage(currentChat.id, editingMessage.id, body, editedAttachments);
            currentChat.messages[editingMessageIndex] = updatedMessage;
          } else {
            editingMessage.body = body;
            editingMessage.attachments = pendingAttachments.slice();
            editingMessage.editedAt = new Date().toISOString();
          }
        } catch (editError) {
          setChatStatus(editError.message || "The message could not be updated.", true);
          return;
        }
        finishEditingMessage();
        saveCurrentChat(user, currentChat);
        upsertStoredChat(user, currentChat);
        chatList = loadStoredChats(user);
        renderChatList();
        renderMessages();
        setChatStatus("");
        return;
      }
      if (!body && !pendingAttachments.length) return;
      var sent = await sendChatMessage(body, pendingAttachments);
      if (sent) {
        inputEl.value = "";
        pendingAttachments = [];
        renderAttachmentPreview();
      }
    });

    chat.querySelector("[data-chat-media]").addEventListener("click", function () {
      mediaInputEl.click();
    });

    mediaInputEl.addEventListener("change", function () {
      var chosenAttachments = Array.from(mediaInputEl.files || []).map(function(file) {
        return {
          name: file.name,
          type: file.type && file.type.startsWith("video/") ? "video" : "photo",
          url: URL.createObjectURL(file),
          file: file
        };
      });
      pendingAttachments = (editingMessageIndex >= 0 ? pendingAttachments.concat(chosenAttachments) : chosenAttachments).slice(0, 6);
      mediaInputEl.value = "";
      renderAttachmentPreview();
    });

    chat.querySelector("[data-chat-voice]").addEventListener("click", async function (event) {
      var button = event.currentTarget;
      if (voiceRecorder && voiceRecorder.state === "recording") {
        voiceRecorder.stop();
        button.textContent = "Voice";
        return;
      }
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        setChatStatus("Voice recording is not supported in this browser.", true);
        return;
      }
      try {
        var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        voiceChunks = [];
        voiceRecorder = new MediaRecorder(stream);
        voiceRecorder.addEventListener("dataavailable", function(recordEvent) {
          if (recordEvent.data && recordEvent.data.size) voiceChunks.push(recordEvent.data);
        });
        voiceRecorder.addEventListener("stop", function() {
          stream.getTracks().forEach(function(track) { track.stop(); });
          var blob = new Blob(voiceChunks, { type: "audio/webm" });
          var voiceFile = new File([blob], "voice-message.webm", { type: "audio/webm" });
          pendingAttachments.push({ name: "Voice message", type: "voice", url: URL.createObjectURL(blob), file: voiceFile });
          renderAttachmentPreview();
          inputEl.focus();
        });
        voiceRecorder.start();
        button.textContent = "Stop";
      } catch (e) {
        setChatStatus("Microphone access is needed to record a voice message.", true);
      }
    });

    chat.querySelector("[data-chat-emoji]").addEventListener("click", function () {
      emojiPickerEl.hidden = !emojiPickerEl.hidden;
      if (!emojiPickerEl.hidden && emojiSearchEl) emojiSearchEl.focus();
    });

    if (emojiSearchEl) {
      emojiSearchEl.addEventListener("input", function () {
        renderEmojiButtons(filterEmojiValues(emojiSearchEl.value, emojiGroups, emojiValues, emojiSearchIndex), emojiGridEl);
      });
    }

    emojiPickerEl.addEventListener("click", function (event) {
      var categoryButton = event.target.closest("[data-chat-emoji-category]");
      if (categoryButton) {
        var group = emojiGroups.find(function(item) { return item.label === categoryButton.dataset.chatEmojiCategory; });
        if (emojiSearchEl) emojiSearchEl.value = "";
        renderEmojiButtons(group ? group.icons.split(" ") : emojiValues, emojiGridEl);
        return;
      }
      var emojiButton = event.target.closest("[data-chat-emoji-value]");
      if (!emojiButton) return;
      inputEl.value += emojiButton.dataset.chatEmojiValue || "";
      inputEl.focus();
    });

    chat.querySelector("[data-chat-like]").addEventListener("click", async function () {
      await sendChatMessage(currentChat && currentChat.quickEmoji ? currentChat.quickEmoji : "👍", []);
    });

    messagesEl.addEventListener("click", async function (event) {
      var deleteButton = event.target.closest("[data-chat-delete]");
      var editButton = event.target.closest("[data-chat-edit]");
      var previewButton = event.target.closest("[data-chat-preview-image]");
      if (previewButton && lightboxEl && lightboxImageEl) {
        lightboxImageEl.src = previewButton.dataset.chatPreviewImage || "";
        lightboxImageEl.alt = previewButton.dataset.chatPreviewAlt || "Chat image";
        lightboxEl.hidden = false;
        return;
      }
      if (editButton) {
        var editIndex = Number(editButton.dataset.chatEdit);
        if (Number.isInteger(editIndex) && currentChat.messages[editIndex]) {
          editingMessageIndex = editIndex;
          var messageToEdit = currentChat.messages[editIndex];
          inputEl.value = messageToEdit.body || "";
          pendingAttachments = Array.isArray(messageToEdit.attachments) ? messageToEdit.attachments.map(function(item) { return Object.assign({}, item); }) : [];
          renderAttachmentPreview();
          if (sendButton) sendButton.textContent = "Save Edit";
          setChatStatus("Editing your message. Remove or add media, then save.");
          inputEl.focus();
        }
        return;
      }
      if (deleteButton) {
        var index = Number(deleteButton.dataset.chatDelete);
        if (Number.isInteger(index) && index >= 0 && index < currentChat.messages.length && window.confirm("Remove this message from the conversation? Its retained record will remain available to authorized administration.")) {
          var messageToRemove = currentChat.messages[index];
          try {
            if (isRemoteConversation(currentChat) && messageToRemove.id) {
              await removeRemoteMessage(currentChat.id, messageToRemove.id);
            }
          } catch (removeError) {
            setChatStatus(removeError.message || "The message could not be removed.", true);
            return;
          }
          currentChat.messages.splice(index, 1);
          if (editingMessageIndex === index) finishEditingMessage();
          saveCurrentChat(user, currentChat);
          upsertStoredChat(user, currentChat);
          chatList = loadStoredChats(user);
          renderChatList();
          renderMessages();
        }
        return;
      }
      markLocalChatRead();
      setupNotificationBadge();
    });

    chat.querySelector("[data-chat-lightbox-close]").addEventListener("click", function () {
      if (!lightboxEl || !lightboxImageEl) return;
      lightboxEl.hidden = true;
      lightboxImageEl.src = "";
      lightboxImageEl.alt = "";
    });

    setupFloatingChatDrag(chat);
    setupFloatingChatResize(chat);

    function renderOnline() {
      var query = String(memberSearchQuery || "").trim().toLowerCase();
      var filtered = roster.filter(function(member) {
        if (!query) return true;
        return String(member.displayName || "").toLowerCase().indexOf(query) !== -1 ||
          String(member.username || "").toLowerCase().indexOf(query) !== -1;
      });
      onlineEl.innerHTML = filtered.length ? filtered.map(function(member) {
        var online = Boolean(member.online);
        var selectingForRoom = createEl && !createEl.hidden;
        var selectedForRoom = selectingForRoom && selectedMembers.has(member.username);
        var presenceText = online ? "Online" : "Offline";
        var presenceClass = online ? "is-online" : "is-offline";
        return '<button class="member-chat-online-person' + (selectedForRoom ? ' is-room-selected' : '') + '" type="button" data-online-member="' + escapeHtml(member.username) + '"' +
          (selectingForRoom ? ' aria-pressed="' + (selectedForRoom ? 'true' : 'false') + '"' : '') + '>' +
          renderChatAvatar(member) +
          '<span class="member-chat-person-copy"><strong>' + escapeHtml(member.displayName) + '</strong>' +
          '<span class="member-chat-presence ' + presenceClass + '">' + escapeHtml(selectedForRoom ? "Added to room" : presenceText) + '</span></span>' +
        '</button>';
      }).join("") : '<p class="member-chat-list-empty">No members found.</p>';
    }

    onlineEl.addEventListener("click", async function(event) {
      var button = event.target.closest("[data-online-member]");
      if (!button || !onlineEl.contains(button)) return;
      var requestedUsername = button.getAttribute("data-online-member") || "";
      var member = roster.find(function(candidate) {
        return normalizeChatUsername(candidate.username) === normalizeChatUsername(requestedUsername);
      });
      if (!member) return;
      if (createEl && !createEl.hidden) {
        if (selectedMembers.has(member.username)) selectedMembers.delete(member.username);
        else selectedMembers.add(member.username);
        setConversationBuilderStatus("");
        renderOnline();
        renderMemberPicker();
        return;
      }
      await openOrCreateDirectConversation(member);
    });

    if (memberSearchEl) {
      memberSearchEl.addEventListener("input", function() {
        memberSearchQuery = memberSearchEl.value;
        renderOnline();
      });
    }

    async function loadChatListFromRemote() {
      try {
        var res = await apiFetch("GET", "/api/conversations");
        var remote = res.ok && Array.isArray(res.data.conversations) ? res.data.conversations : [];
        chatList = remote.map(function(conv) {
          return normalizeRemoteConversation(conv);
        }).sort(function(a, b) {
          return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
        });
        replaceStoredChats(user, chatList);
        renderChatList();
      } catch (e) {}
    }

    async function openOrCreateDirectConversation(member) {
      closeIdentityMenu();
      closeOwnerMenu();
      if (!member || !member.username) return;
      setChatStatus("");
      try {
        var remote = await createRemoteConversation("", [member.username], true);
        currentChat = normalizeRemoteConversation(remote);
      } catch (error) {
        setChatStatus(error.message || "That conversation could not be opened. Please try again.", true);
        return;
      }
      await refreshChatListFromRemote();
      await openChat(currentChat);
      if (inputEl) inputEl.focus();
    }

    async function refreshChatListFromRemote() {
      await loadChatListFromRemote();
    }

    function renderChatList() {
      if (!chatListEl) return;
      if (!chatList.length) {
        chatListEl.innerHTML = '<p class="member-chat-list-empty">Select a chat or start a new conversation.</p>';
        return;
      }
      chatListEl.innerHTML = chatList.map(function(savedChat) {
        var active = savedChat.id === currentChat.id ? " is-active" : "";
        var unread = Number(savedChat.unreadCount || 0);
        var title = getConversationDisplayTitle(savedChat, user);
        var time = savedChat.lastMessage && savedChat.lastMessage.createdAt ? formatChatTime(savedChat.lastMessage.createdAt) : "";
        var preview = (savedChat.lastMessage && savedChat.lastMessage.body) ? savedChat.lastMessage.body : getChatListSubtitle(savedChat);
        var unreadBadge = unread > 0 ? '<span class="member-chat-unread-badge">' + (unread > 99 ? "99+" : String(unread)) + '</span>' : "";
        return '<article class="member-chat-list-item' + active + (unread > 0 ? ' is-unread' : '') + '">' +
          '<button class="member-chat-list-open" type="button" data-chat-open="' + escapeHtml(savedChat.id) + '">' +
            getConversationAvatarHtml(savedChat, user) +
            '<span class="member-chat-person-copy"><strong>' + escapeHtml(title) + '</strong>' +
            '<span class="member-chat-presence">' + escapeHtml(preview.slice(0, 38)) + (time ? ' · ' + escapeHtml(time) : "") + '</span></span>' +
            unreadBadge +
          '</button>' +
        '</article>';
      }).join("");
      chatListEl.querySelectorAll("[data-chat-open]").forEach(function(button) {
        button.addEventListener("click", function() {
          var saved = chatList.find(function(item) { return item.id === button.dataset.chatOpen; });
          if (!saved) return;
          openSavedChat(saved);
        });
      });
    }

    async function openChat(chat) {
      closeIdentityMenu();
      closeOwnerMenu();
      currentChat = chat;
      selectedMembers = new Set(currentChat.members.map(function(member) { return member.username; }));
      saveCurrentChat(user, currentChat);
      upsertStoredChat(user, currentChat);
      if (isRemoteConversation(currentChat)) {
        var messages = await loadRemoteMessages(currentChat.id);
        currentChat.messages = messages;
        markRemoteConversationRead(currentChat.id);
        currentChat.unreadCount = 0;
      }
      renderIdentity();
      renderChatList();
      renderMemberPicker();
      renderMessages();
      setupNotificationBadge();
    }

    function openSavedChat(saved) {
      if (createEl && !createEl.hidden) closeConversationBuilder();
      openChat(saved);
      if (inputEl) inputEl.focus();
    }

    function setConversationBuilderStatus(message, isError) {
      if (!createStatusEl) return;
      createStatusEl.textContent = message || "";
      createStatusEl.hidden = !message;
      createStatusEl.classList.toggle("is-error", Boolean(isError));
    }

    function updateConversationBuilderCount() {
      if (!createCountEl) return;
      var selectedCount = roster.filter(function(member) {
        return selectedMembers.has(member.username);
      }).length;
      var selectedLabel = selectedCount + (selectedCount === 1 ? " member selected" : " members selected");
      var totalCount = selectedCount + 1;
      createCountEl.textContent = conversationBuilderMode === "room" || conversationBuilderMode === "manage"
        ? selectedLabel + " · " + totalCount + (totalCount === 1 ? " person" : " people") + " total including you"
        : selectedLabel;
    }

    function openConversationBuilder(mode, membersToPreselect) {
      if (!createEl) return;
      if (chat.classList.contains("is-collapsed")) setMessengerCollapsed(false);
      conversationBuilderMode = mode === "chat" ? "chat" : (mode === "manage" ? "manage" : "room");
      selectedMembers.clear();
      (membersToPreselect || []).forEach(function(member) {
        if (member && member.username && member.username !== user.username) selectedMembers.add(member.username);
      });
      if (chatNameEl) chatNameEl.value = conversationBuilderMode === "manage" && currentChat ? currentChat.title : "";
      if (chatNameLabelEl) chatNameLabelEl.hidden = conversationBuilderMode === "manage";
      if (createTitleEl) createTitleEl.textContent = conversationBuilderMode === "manage" ? "Manage People" : (conversationBuilderMode === "room" ? "Create Room" : "Start a Chat");
      if (createDescriptionEl) createDescriptionEl.textContent = conversationBuilderMode === "manage"
        ? "Click members in the left column to add or remove them from this room. Then save your changes."
        : (conversationBuilderMode === "room"
          ? "Name the room, then add at least one member from the left. You are included automatically."
          : "Click one member in the left column for a direct chat, or select several people and name the room.");
      if (createSubmitEl) {
        createSubmitEl.textContent = conversationBuilderMode === "manage" ? "Save People" : (conversationBuilderMode === "room" ? "Create Room" : "Start Chat");
        createSubmitEl.disabled = false;
      }
      setConversationBuilderStatus("");
      createEl.hidden = false;
      chat.classList.add("is-building-room");
      renderOnline();
      renderMemberPicker();
      window.setTimeout(function() {
        if (conversationBuilderMode === "room" && chatNameEl) chatNameEl.focus();
        else if (memberSearchEl) memberSearchEl.focus();
      }, 0);
    }

    function closeConversationBuilder() {
      if (!createEl) return;
      createEl.hidden = true;
      chat.classList.remove("is-building-room");
      selectedMembers.clear();
      if (chatNameEl) chatNameEl.value = "";
      if (chatNameLabelEl) chatNameLabelEl.hidden = false;
      setConversationBuilderStatus("");
      if (createSubmitEl) createSubmitEl.disabled = false;
      renderOnline();
    }

    function renderMemberPicker() {
      var selectedRoster = roster.filter(function(member) {
        return selectedMembers.has(member.username);
      });
      membersEl.innerHTML = selectedRoster.length ? selectedRoster.map(function(member) {
        return '<div class="member-chat-member-option is-room-selected">' +
          renderChatAvatar(member) +
          '<span><strong>' + escapeHtml(member.displayName) + '</strong><small>' + escapeHtml(member.title || member.role || "Member") + '</small></span>' +
          '<button type="button" data-chat-member-remove="' + escapeHtml(member.username) + '" aria-label="Remove ' + escapeHtml(member.displayName) + ' from room">Remove</button>' +
        '</div>';
      }).join("") : '<p class="member-chat-list-empty">No members added yet. Click names in the left column.</p>';
      membersEl.querySelectorAll("[data-chat-member-remove]").forEach(function(button) {
        button.addEventListener("click", function() {
          selectedMembers.delete(button.dataset.chatMemberRemove);
          setConversationBuilderStatus("");
          renderOnline();
          renderMemberPicker();
        });
      });
      updateConversationBuilderCount();
    }

    function renderMessages() {
      renderIdentity();
      if (!currentChat || currentChat.id === "chat-default") {
        messagesEl.innerHTML = '<p class="member-chat-empty">Select a chat or choose a member to start a conversation.</p>';
        updateSendButtonState();
        return;
      }
      messagesEl.innerHTML = currentChat.messages.length
        ? currentChat.messages.map(function(message, index) { return renderChatMessage(message, index); }).join("")
        : '<p class="member-chat-empty">No messages yet. Send the first message.</p>';
      messagesEl.scrollTop = messagesEl.scrollHeight;
      updateSendButtonState();
    }

    function renderIdentity() {
      var hasConversation = Boolean(currentChat && currentChat.id && currentChat.id !== "chat-default");
      if (conversationBarEl) conversationBarEl.hidden = !hasConversation;
      chat.setAttribute("data-conversation-theme", currentChat && currentChat.theme ? currentChat.theme : "default");
      var quickButton = chat.querySelector("[data-chat-like]");
      if (quickButton) {
        quickButton.textContent = currentChat && currentChat.quickEmoji ? currentChat.quickEmoji : "👍";
        quickButton.setAttribute("aria-label", "Send " + quickButton.textContent);
      }
      if (!identityEl) return;
      identityEl.innerHTML = renderChatIdentity(currentChat, user);
    }

    function updateSendButtonState() {
      var isValid = currentChat && currentChat.id && currentChat.id !== "chat-default";
      if (sendButton) sendButton.disabled = !isValid;
      if (inputEl) {
        inputEl.disabled = !isValid;
        if (!isValid) inputEl.value = "";
      }
    }

    function syncChatMinimizeButton() {
      if (!minimizeButton) return;
      minimizeButton.textContent = chat.classList.contains("is-collapsed") ? "Show" : "Hide";
      minimizeButton.setAttribute("aria-expanded", chat.classList.contains("is-collapsed") ? "false" : "true");
    }

    async function sendChatMessage(body, attachments) {
      try {
        var safeAttachments = await prepareMessengerAttachments(attachments);
      } catch (uploadError) {
        setChatStatus(uploadError.message || "The attachment could not be uploaded.", true);
        return false;
      }
      if (!body && !safeAttachments.length) return;
      if (!currentChat || currentChat.id === "chat-default") return;
      if (!isRemoteConversation(currentChat)) {
        setChatStatus("This conversation is not connected to Messenger. Choose the member again to reopen it.", true);
        return false;
      }
      setChatStatus("Sending...");
      try {
        var remoteMessage = await sendRemoteMessage(currentChat.id, body, safeAttachments);
        currentChat.messages.push(remoteMessage);
        currentChat.lastMessage = { body: remoteMessage.body, createdAt: remoteMessage.createdAt };
        currentChat.updatedAt = remoteMessage.createdAt;
      } catch (error) {
        setChatStatus(error.message || "Message could not be sent. Please try again.", true);
        return false;
      }
      saveCurrentChat(user, currentChat);
      upsertStoredChat(user, currentChat);
      chatList = loadStoredChats(user);
      renderChatList();
      renderMessages();
      setupNotificationBadge();
      setChatStatus("");
      return true;
    }

    function setChatStatus(message, isError) {
      if (!chatStatusEl) return;
      chatStatusEl.textContent = message || "";
      chatStatusEl.hidden = !message;
      chatStatusEl.classList.toggle("is-error", Boolean(isError));
    }

    function renderAttachmentPreview() {
      if (!attachmentPreviewEl) return;
      if (!pendingAttachments.length) {
        attachmentPreviewEl.hidden = true;
        attachmentPreviewEl.innerHTML = "";
        return;
      }
      attachmentPreviewEl.hidden = false;
      attachmentPreviewEl.innerHTML = pendingAttachments.map(function(attachment, index) {
        return '<span>' + escapeHtml(getAttachmentLabel(attachment)) + '<button type="button" data-chat-attachment-remove="' + escapeHtml(String(index)) + '" aria-label="Remove ' + escapeHtml(getAttachmentLabel(attachment)) + '">×</button></span>';
      }).join("");
    }

    attachmentPreviewEl.addEventListener("click", function(event) {
      var removeAttachmentButton = event.target.closest("[data-chat-attachment-remove]");
      if (!removeAttachmentButton) return;
      var attachmentIndex = Number(removeAttachmentButton.dataset.chatAttachmentRemove);
      if (!Number.isInteger(attachmentIndex) || attachmentIndex < 0 || attachmentIndex >= pendingAttachments.length) return;
      var removedAttachment = pendingAttachments.splice(attachmentIndex, 1)[0];
      if (removedAttachment && removedAttachment.file && removedAttachment.url && String(removedAttachment.url).startsWith("blob:")) {
        try { URL.revokeObjectURL(removedAttachment.url); } catch (e) {}
      }
      renderAttachmentPreview();
    });

    function finishEditingMessage() {
      editingMessageIndex = -1;
      inputEl.value = "";
      pendingAttachments = [];
      renderAttachmentPreview();
      if (sendButton) sendButton.textContent = "Send";
    }

    window.TPIMessenger = {
      isReady: function() { return true; },
      show: function() {
        setMessengerCollapsed(false);
        if (ownerEl) ownerEl.focus();
      },
      openConversation: async function(conversationId) {
        if (!conversationId) return;
        closeIdentityMenu();
        closeOwnerMenu();
        if (chat.classList.contains("is-collapsed")) {
          chat.classList.remove("is-collapsed");
          applyStoredChatFrame(chat, true);
          syncChatMinimizeButton();
          setSyncForVisibility();
        }
        await refreshChatListFromRemote();
        var existing = chatList.find(function(c) { return c.id === conversationId; });
        if (existing) {
          await openChat(existing);
        } else {
          try {
            var res = await apiFetch("GET", "/api/conversations/" + encodeURIComponent(conversationId));
            if (res.ok && res.data.conversation) {
              var remote = normalizeRemoteConversation(res.data.conversation);
              chatList.unshift(remote);
              replaceStoredChats(user, chatList);
              await openChat(remote);
            }
          } catch (e) {}
        }
        if (inputEl) inputEl.focus();
      }
    };

    // ---- Unified Messenger menu, settings, thread search ----
    // Must live INSIDE initFloatingChat: these closures read identityEl,
    // ownerEl, currentChat, user, chatList, etc. They previously sat outside
    // the function (misplaced brace), threw ReferenceError at load, and left
    // every menu listener unattached.
    function renderIdentityMenu() {
      if (!identityMenuEl) return;
      var menu = identityMenuEl.querySelector('[role="menu"]');
      var items = [
        { type: "label", label: "Messenger" }
      ];
      var other = getOtherParticipant(currentChat, user);
      var isDirect = currentChat && currentChat.direct && !isGroupConversation(currentChat);
      var hasConversation = currentChat && currentChat.id !== "chat-default";

      if (hasConversation) {
        items.push({ type: "separator" });
        items.push({ type: "label", label: "Conversation: " + getConversationDisplayTitle(currentChat, user) });
      }

      // Section 1: Basic conversation actions
      if (hasConversation && other && isDirect) {
        items.push({ action: "view-profile", label: "View Profile", username: other.username });
      }
      if (hasConversation) {
        items.push({ action: "search", label: "Search in Conversation" });
      }

      if (hasConversation) items.push({ type: "separator" });

      // Section 2: Conversation customization
      if (hasConversation) {
        items.push({ action: "theme", label: "Change Theme" });
        items.push({ action: "emoji", label: "Conversation Emoji" });
        if (isDirect) {
          items.push({ action: "nicknames", label: "Nicknames" });
          items.push({ action: "create-group", label: "Create Room" });
        } else if (currentChat.canManageMembers) {
          items.push({ action: "manage-members", label: "Manage People" });
        }
      }

      if (hasConversation) items.push({ type: "separator" });

      // Section 3: Notification & Privacy controls
      if (hasConversation) {
        // Mute - check current state
        var isMuted = currentChat.mutedUntil && new Date(currentChat.mutedUntil) > new Date();
        items.push({ action: isMuted ? "unmute" : "mute", label: isMuted ? "Unmute Notifications" : "Mute Notifications" });

        // Block/Restrict - only for direct conversations
        if (isDirect && other) {
          items.push({ action: currentChat.blocked ? "unblock" : "block", label: (currentChat.blocked ? "Unblock " : "Block ") + other.displayName });
          items.push({ action: currentChat.restricted ? "unrestrict" : "restrict", label: (currentChat.restricted ? "Unrestrict " : "Restrict ") + other.displayName });
        }

        // Read Receipts
        items.push({ action: "read-receipts", label: "Read Receipts" });
      }

      if (hasConversation) items.push({ type: "separator" });

      // Section 4: Non-destructive hide
      if (hasConversation) {
        items.push({ action: "remove", label: isDirect ? "Remove Chat" : "Remove Room" });
      }

      if (hasConversation) items.push({ type: "separator" });

      // Section 5: Report
      if (hasConversation) {
        items.push({ action: "report", label: "Report Conversation" });
      }

      items.push({ type: "separator" });
      items.push({ scope: "owner", action: "close", label: "Close Messenger" });

      menu.innerHTML = items.map(function(item) {
        if (item.type === "separator") {
          return '<hr class="member-chat-menu-separator">';
        }
        if (item.type === "label") {
          return '<span class="member-chat-menu-label">' + escapeHtml(item.label) + '</span>';
        }
        if (item.scope === "owner") {
          return '<button type="button" role="menuitem" data-owner-action="' + escapeHtml(item.action) + '">' +
            escapeHtml(item.label) + '</button>';
        }
        return '<button type="button" role="menuitem" data-identity-action="' + escapeHtml(item.action) + '"' +
          (item.username ? ' data-identity-username="' + escapeHtml(item.username) + '"' : '') + '>' +
          escapeHtml(item.label) + '</button>';
      }).join("");
      menu.querySelectorAll("[data-identity-action]").forEach(function(button) {
        button.addEventListener("click", handleIdentityAction);
      });
      menu.querySelectorAll("[data-owner-action]").forEach(function(button) {
        button.addEventListener("click", handleOwnerAction);
      });
    }

    function closeIdentityMenu() {
      if (identityMenuEl) identityMenuEl.hidden = true;
      if (ownerEl) ownerEl.setAttribute("aria-expanded", "false");
    }

    // ---- Owner (signed-in member) Messenger-wide menu ----

    function renderOwnerMenu() {
      renderIdentityMenu();
    }

    // Viewport-anchored positioning: immune to overflow:hidden clipping on the
    // Messenger frame and to any transformed ancestor.
    function positionPanelBelowOwner(panel) {
      if (!panel || !ownerEl) return;
      var rect = ownerEl.getBoundingClientRect();
      var left = Math.max(12, Math.min(rect.left, window.innerWidth - 252));
      panel.style.left = left + "px";
      panel.style.top = (rect.bottom + 6) + "px";
      panel.style.maxHeight = Math.max(180, window.innerHeight - rect.bottom - 18) + "px";
    }

    function clampPanelToViewport(panel) {
      if (!panel) return;
      var rect = panel.getBoundingClientRect();
      var maxLeft = Math.max(12, window.innerWidth - rect.width - 12);
      var maxTop = Math.max(12, window.innerHeight - rect.height - 12);
      var left = parseFloat(panel.style.left || "0");
      var top = parseFloat(panel.style.top || "0");
      panel.style.left = Math.min(left, maxLeft) + "px";
      panel.style.top = Math.min(top, maxTop) + "px";
    }

    function openOwnerMenu() {
      if (!identityMenuEl || !ownerEl) return;
      renderOwnerMenu();
      positionPanelBelowOwner(identityMenuEl);
      identityMenuEl.hidden = false;
      clampPanelToViewport(identityMenuEl);
      ownerEl.setAttribute("aria-expanded", "true");
      var first = identityMenuEl.querySelector('[role="menuitem"]');
      if (first) first.focus();
    }

    function closeOwnerMenu() {
      closeIdentityMenu();
    }

    function toggleOwnerMenu() {
      if (!identityMenuEl) return;
      if (identityMenuEl.hidden) openOwnerMenu();
      else closeOwnerMenu();
    }

    async function handleOwnerAction(event) {
      var button = event.currentTarget;
      var action = button.dataset.ownerAction;
      if (action === "close") {
        setMessengerCollapsed(true);
      }
      closeOwnerMenu();
    }

    async function handleIdentityAction(event) {
      var button = event.currentTarget;
      var action = button.dataset.identityAction;
      var keepMenuOpen = false;
      if (action === "view-profile") {
        var username = button.dataset.identityUsername;
        if (username) window.open("contributor-profile.html?username=" + encodeURIComponent(username), "_blank");
      } else if (action === "search") {
        openThreadSearch();
      } else if (action === "remove") {
        if (!currentChat || currentChat.id === "chat-default") return;
        var conversationKind = currentChat.direct ? "chat" : "room";
        if (!window.confirm("Remove this " + conversationKind + " from your Messenger? Its complete history will be retained securely and a new message will make it visible again.")) return;
        var removeResult = await apiFetch("POST", "/api/conversations/" + encodeURIComponent(currentChat.id) + "/hide");
        if (!removeResult.ok) {
          setChatStatus(removeResult.data.error || "The " + conversationKind + " could not be removed.", true);
          return;
        }
        chatList = chatList.filter(function(item) { return item.id !== currentChat.id; });
        replaceStoredChats(user, chatList);
        currentChat = createEmptyChat(user);
        selectedMembers = new Set(currentChat.members.map(function(member) { return member.username; }));
        saveCurrentChat(user, currentChat);
        renderChatList();
        renderMessages();
        renderIdentity();
      } else if (action === "theme") {
        keepMenuOpen = true;
        openThemePicker();
      } else if (action === "emoji") {
        keepMenuOpen = true;
        openEmojiPicker();
      } else if (action === "nicknames") {
        keepMenuOpen = true;
        openNicknameEditor();
      } else if (action === "create-group") {
        openCreateGroupFromDirect();
      } else if (action === "manage-members") {
        openManageRoomMembers();
      } else if (action === "mute") {
        keepMenuOpen = true;
        openMutePicker();
      } else if (action === "unmute") {
        if (!currentChat || currentChat.id === "chat-default") return;
        await apiFetch("POST", "/api/conversations/" + encodeURIComponent(currentChat.id) + "/unmute");
        currentChat.mutedUntil = null;
        renderIdentity();
      } else if (action === "block") {
        var other = getOtherParticipant(currentChat, user);
        if (!other) return;
        if (!window.confirm("Block " + other.displayName + "?\nThey will no longer be able to send you direct messages.\nExisting conversation history will be retained.")) return;
        await apiFetch("POST", "/api/conversations/" + encodeURIComponent(currentChat.id) + "/block", { targetUsername: other.username });
        currentChat.blocked = true;
        renderIdentity();
      } else if (action === "unblock") {
        var blockedMember = getOtherParticipant(currentChat, user);
        if (!blockedMember) return;
        await apiFetch("POST", "/api/conversations/" + encodeURIComponent(currentChat.id) + "/unblock", { targetUsername: blockedMember.username });
        currentChat.blocked = false;
        renderIdentity();
      } else if (action === "restrict") {
        var other = getOtherParticipant(currentChat, user);
        if (!other) return;
        if (!window.confirm("Restrict " + other.displayName + "?\nMessages will still be received, but notifications from this member will be limited.\nThey will not be told that you restricted them.")) return;
        await apiFetch("POST", "/api/conversations/" + encodeURIComponent(currentChat.id) + "/restrict", { targetUsername: other.username });
        // Restrict is a soft action - keep conversation visible but may suppress notifications
        currentChat.restricted = true;
        renderIdentity();
      } else if (action === "unrestrict") {
        var restrictedMember = getOtherParticipant(currentChat, user);
        if (!restrictedMember) return;
        await apiFetch("POST", "/api/conversations/" + encodeURIComponent(currentChat.id) + "/unrestrict", { targetUsername: restrictedMember.username });
        currentChat.restricted = false;
        renderIdentity();
      } else if (action === "read-receipts") {
        keepMenuOpen = true;
        openReadReceiptsPicker();
      } else if (action === "report") {
        keepMenuOpen = true;
        openReportDialog();
      }
      if (!keepMenuOpen) closeOwnerMenu();
    }

    if (ownerEl) {
      ownerEl.addEventListener("click", function() {
        toggleOwnerMenu();
      });
    }

    // Capture phase: the closer evaluates BEFORE any target/bubble handlers, so the
    // same click that opens a menu can never immediately close it, and genuine
    // outside clicks close menus regardless of event retargeting.
    document.addEventListener("click", function(event) {
      if (!identityMenuEl || identityMenuEl.hidden) return;
      if (!identityMenuEl.contains(event.target) && !(ownerEl && ownerEl.contains(event.target))) {
        closeOwnerMenu();
      }
    }, true);

    document.addEventListener("keydown", function(event) {
      if (event.key !== "Escape") return;
      if (identityMenuEl && !identityMenuEl.hidden) {
        closeOwnerMenu();
        if (ownerEl) ownerEl.focus();
      }
    });

    // Thread search
    function openThreadSearch() {
      if (!threadSearchEl) return;
      threadSearchEl.hidden = false;
      if (searchInputEl) searchInputEl.focus();
      activeSearchMatches = [];
      activeSearchIndex = -1;
      updateSearchUi();
    }

    function closeThreadSearch() {
      if (!threadSearchEl) return;
      threadSearchEl.hidden = true;
      messagesEl.querySelectorAll(".member-chat-message-search-highlight").forEach(function(el) {
        var parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
      });
      activeSearchMatches = [];
      activeSearchIndex = -1;
    }

    function runThreadSearch() {
      var query = String(searchInputEl ? searchInputEl.value : "").trim().toLowerCase();
      activeSearchMatches = [];
      activeSearchIndex = -1;
      messagesEl.querySelectorAll(".member-chat-message-search-highlight").forEach(function(el) {
        var parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
      });
      if (!query) {
        updateSearchUi();
        return;
      }
      var messageEls = messagesEl.querySelectorAll(".member-chat-message");
      messageEls.forEach(function(messageEl) {
        var p = messageEl.querySelector("p");
        if (!p) return;
        var text = p.textContent;
        var lower = text.toLowerCase();
        var index = lower.indexOf(query);
        if (index === -1) return;
        var before = text.slice(0, index);
        var match = text.slice(index, index + query.length);
        var after = text.slice(index + query.length);
        p.innerHTML = escapeHtml(before) + '<mark class="member-chat-message-search-highlight">' + escapeHtml(match) + '</mark>' + escapeHtml(after);
        activeSearchMatches.push({ el: messageEl, mark: p.querySelector("mark") });
      });
      if (activeSearchMatches.length) {
        activeSearchIndex = 0;
        scrollToSearchMatch(0);
      }
      updateSearchUi();
    }

    function scrollToSearchMatch(index) {
      if (!activeSearchMatches[index]) return;
      var mark = activeSearchMatches[index].mark;
      if (mark) mark.scrollIntoView({ block: "center" });
    }

    function updateSearchUi() {
      if (!searchCountEl) return;
      if (!activeSearchMatches.length) {
        searchCountEl.textContent = "No matches";
      } else {
        searchCountEl.textContent = (activeSearchIndex + 1) + " / " + activeSearchMatches.length;
      }
    }

    if (searchInputEl) {
      searchInputEl.addEventListener("input", runThreadSearch);
    }
    if (searchPrevEl) {
      searchPrevEl.addEventListener("click", function() {
        if (!activeSearchMatches.length) return;
        activeSearchIndex = (activeSearchIndex - 1 + activeSearchMatches.length) % activeSearchMatches.length;
        scrollToSearchMatch(activeSearchIndex);
        updateSearchUi();
      });
    }
    if (searchNextEl) {
      searchNextEl.addEventListener("click", function() {
        if (!activeSearchMatches.length) return;
        activeSearchIndex = (activeSearchIndex + 1) % activeSearchMatches.length;
        scrollToSearchMatch(activeSearchIndex);
        updateSearchUi();
      });
    }
    if (searchCloseEl) {
      searchCloseEl.addEventListener("click", closeThreadSearch);
    }

    // ---- Conversation menu action helpers ----

    function openThemePicker() {
      if (!identityMenuEl) return;
      var menu = identityMenuEl.querySelector('[role="menu"]');
      var themes = [
        { id: 'default', label: 'TPI Command', description: 'Original black and electric blue', colors: ['#05070a', '#55c8ff'] },
        { id: 'midnight', label: 'Midnight Signal', description: 'Deep navy and spectral blue', colors: ['#030711', '#397dcc'] },
        { id: 'slate', label: 'Storm Watch', description: 'Charcoal, steel, and cool light', colors: ['#111820', '#7798b8'] },
        { id: 'deep-blue', label: 'Abyss Current', description: 'Dark ocean blue and cyan', colors: ['#020b17', '#16b8e6'] },
        { id: 'purple', label: 'Violet Veil', description: 'Black violet and luminous purple', colors: ['#12051d', '#a855f7'] },
        { id: 'green', label: 'Ectoplasm Glow', description: 'Black green and vivid emerald', colors: ['#031109', '#34d173'] },
        { id: 'amber', label: 'Golden Lantern', description: 'Burnished gold and warm amber', colors: ['#1a0e02', '#ffc247'] },
        { id: 'warm', label: 'Ember Watch', description: 'Smoldering orange and copper', colors: ['#1c0802', '#f47b20'] },
        { id: 'flame', label: 'Burning Flame', description: 'Blackened red, orange, and firelight', colors: ['#170202', '#ff4d00'] }
      ];
      var currentTheme = currentChat && currentChat.theme ? currentChat.theme : 'default';

      menu.innerHTML = '<span class="member-chat-menu-label">Change Theme</span><p class="member-chat-theme-help">Changes the complete Messenger appearance for you.</p>' + themes.map(function(t) {
        var isActive = t.id === currentTheme;
        return '<button class="member-chat-theme-choice" type="button" role="menuitem" data-theme-action="' + escapeHtml(t.id) + '"' +
          (isActive ? ' aria-current="true"' : '') + '>' +
          '<span class="theme-swatch" style="background: linear-gradient(90deg, ' + t.colors[0] + ', ' + t.colors[1] + ');"></span>' +
          '<span><strong>' + escapeHtml(t.label) + (isActive ? ' ✓' : '') + '</strong><small>' + escapeHtml(t.description) + '</small></span></button>';
      }).join("");

      menu.querySelectorAll("[data-theme-action]").forEach(function(button) {
        button.addEventListener("click", function() {
          var themeId = button.dataset.themeAction;
          applyTheme(themeId);
          closeIdentityMenu();
        });
      });
    }

    function applyTheme(themeId) {
      if (!currentChat || currentChat.id === "chat-default") return;
      currentChat.theme = themeId;
      apiFetch("POST", "/api/conversations/" + encodeURIComponent(currentChat.id) + "/preferences", { theme: themeId });
      // Apply immediately to UI
      renderIdentity();
      renderChatList();
      renderMessages();
    }

    function openEmojiPicker() {
      if (!identityMenuEl) return;
      var menu = identityMenuEl.querySelector('[role="menu"]');
      var emojis = ['👍', '❤️', '👻', '🔮', '😂', '🔥', '🎉', '🤔', '🎯', '💯', '👻', '🦄', '🚀', '✨', '💫'];
      var currentEmoji = currentChat && currentChat.quickEmoji ? currentChat.quickEmoji : '👍';

      menu.innerHTML = emojis.map(function(emoji) {
        var isActive = emoji === (currentChat && currentChat.quickEmoji ? currentChat.quickEmoji : '👍');
        return '<button type="button" role="menuitem" data-emoji-action="' + escapeHtml(emoji) + '"' +
          (emoji === currentEmoji ? ' aria-current="true"' : '') + ' style="font-size: 1.5em;">' +
          emoji + (emoji === currentEmoji ? ' ✓' : '') + '</button>';
      }).join("");

      menu.querySelectorAll("[data-emoji-action]").forEach(function(button) {
        button.addEventListener("click", function() {
          var emoji = button.dataset.emojiAction;
          applyQuickEmoji(emoji);
          closeIdentityMenu();
        });
      });
    }

    function applyQuickEmoji(emoji) {
      if (!currentChat || currentChat.id === "chat-default") return;
      currentChat.quickEmoji = emoji;
      apiFetch("POST", "/api/conversations/" + encodeURIComponent(currentChat.id) + "/preferences", { quickEmoji: emoji });
      // Update the quick-send button
      var likeBtn = chat.querySelector("[data-chat-like]");
      if (likeBtn) likeBtn.textContent = emoji;
      renderIdentity();
    }

    function openNicknameEditor() {
      if (!identityMenuEl) return;
      var menu = identityMenuEl.querySelector('[role="menu"]');
      var other = getOtherParticipant(currentChat, user);
      if (!other) return;

      // Get existing nickname if any
      var existingNickname = "";
      if (currentChat && currentChat.nicknames) {
        var nick = currentChat.nicknames.find(function(n) { return n.target_id === other.id; });
        if (nick) existingNickname = nick.nickname;
      }

      menu.innerHTML =
        '<div class="nickname-editor" style="padding: 12px; min-width: 280px;">' +
          '<label style="display: block; margin-bottom: 8px; color: #c7d5e2; font-size: 12px;">Nickname for ' + escapeHtml(other.displayName) + '</label>' +
          '<input type="text" data-nickname-input value="' + escapeHtml(existingNickname) + '" placeholder="Enter nickname" style="width: 100%; padding: 8px; background: #081018; border: 1px solid #263646; border-radius: 6px; color: #e6edf3; font-size: 13px;">' +
          '<div style="display: flex; gap: 8px; margin-top: 12px;">' +
            '<button type="button" data-nickname-save style="flex: 1; padding: 8px; background: #55c8ff; color: #061018; border: none; border-radius: 6px; font-weight: 900;">Save</button>' +
            '<button type="button" data-nickname-cancel style="flex: 1; padding: 8px; background: #081018; color: #c7d5e2; border: 1px solid #263646; border-radius: 6px;">Cancel</button>' +
          '</div>' +
        '</div>';

      var input = menu.querySelector('[data-nickname-input]');
      if (input) input.focus();
      menu.querySelector('[data-nickname-save]').addEventListener("click", function() {
        var nickname = input.value.trim();
        if (!nickname) return;
        saveNickname(other.username, nickname);
        closeIdentityMenu();
      });
      menu.querySelector('[data-nickname-cancel]').addEventListener("click", closeIdentityMenu);
    }

    function saveNickname(targetUsername, nickname) {
      if (!currentChat || currentChat.id === "chat-default") return;
      apiFetch("POST", "/api/conversations/" + encodeURIComponent(currentChat.id) + "/nickname", { targetUsername: targetUsername, nickname: nickname })
        .then(function() {
          // Refresh nicknames
          return apiFetch("GET", "/api/conversations/" + encodeURIComponent(currentChat.id) + "/nicknames");
        })
        .then(function(res) {
          if (res.ok && res.data.nicknames) {
            currentChat.nicknames = res.data.nicknames;
            renderIdentity();
            renderChatList();
          }
        });
    }

    function openCreateGroupFromDirect() {
      closeIdentityMenu();
      if (!currentChat || currentChat.id === "chat-default") return;
      // Carry the current participants into a clearly visible room builder;
      // the creator can add more people and must give the new room a name.
      openConversationBuilder("room", currentChat.members || []);
    }

    function openManageRoomMembers() {
      closeIdentityMenu();
      if (!currentChat || currentChat.id === "chat-default" || currentChat.direct || !currentChat.canManageMembers) return;
      openConversationBuilder("manage", currentChat.members || []);
    }

    function openMutePicker() {
      if (!identityMenuEl) return;
      var menu = identityMenuEl.querySelector('[role="menu"]');
      var options = [
        { value: '1h', label: '1 hour' },
        { value: '8h', label: '8 hours' },
        { value: '24h', label: '24 hours' },
        { value: 'indefinite', label: 'Until I turn it back on' }
      ];

      menu.innerHTML = '<div class="mute-picker" style="padding: 12px; min-width: 220px;">' +
        '<div style="color: #c7d5e2; font-size: 12px; margin-bottom: 8px;">Mute notifications for</div>' +
        options.map(function(opt) {
          return '<button type="button" role="menuitem" data-mute-duration="' + escapeHtml(opt.value) + '" style="display: block; width: 100%; text-align: left; padding: 8px; background: transparent; border: none; color: #c7d5e2; font-size: 13px; border-radius: 6px;">' + escapeHtml(opt.label) + '</button>';
        }).join('') +
        '<button type="button" data-mute-cancel style="display: block; width: 100%; text-align: left; padding: 8px; margin-top: 8px; background: transparent; border: none; color: #8aa0b6; font-size: 13px; border-radius: 6px;">Cancel</button>' +
        '</div>';

      menu.querySelectorAll('[data-mute-duration]').forEach(function(button) {
        button.addEventListener("click", function() {
          var duration = button.dataset.muteDuration;
          muteConversation(duration);
          closeIdentityMenu();
        });
      });
      menu.querySelector('[data-mute-cancel]').addEventListener("click", closeIdentityMenu);
    }

    function muteConversation(duration) {
      if (!currentChat || currentChat.id === "chat-default") return;
      var until = duration === 'indefinite' ? '9999-12-31T23:59:59.999Z' : new Date(Date.now() + parseDuration(duration)).toISOString();
      currentChat.mutedUntil = until;
      apiFetch("POST", "/api/conversations/" + encodeURIComponent(currentChat.id) + "/mute", { until: duration === 'indefinite' ? 'indefinite' : until });
      currentChat.mutedUntil = duration === 'indefinite' ? '9999-12-31T23:59:59.999Z' : until;
      renderIdentity();
    }

    function parseDuration(str) {
      var match = str.match(/^(\d+)([h])$/);
      if (!match) return 0;
      var value = parseInt(match[1], 10);
      var unit = match[2];
      if (unit === 'h') return value * 60 * 60 * 1000;
      return 0;
    }

    function openReadReceiptsPicker() {
      if (!identityMenuEl) return;
      var menu = identityMenuEl.querySelector('[role="menu"]');
      var current = currentChat && currentChat.readReceiptsEnabled !== false;

      menu.innerHTML = '<div class="read-receipts-picker" style="padding: 12px; min-width: 200px;">' +
        '<div style="color: #c7d5e2; font-size: 12px; margin-bottom: 8px;">Read Receipts</div>' +
        '<button type="button" role="menuitem" data-read-receipts="on" style="display: block; width: 100%; text-align: left; padding: 8px; background: transparent; border: none; color: ' + (current ? '#55c8ff' : '#c7d5e2') + '; font-size: 13px; border-radius: 6px;">' + (current ? '✓ ' : '') + 'On</button>' +
        '<button type="button" role="menuitem" data-read-receipts="off" style="display: block; width: 100%; text-align: left; padding: 8px; background: transparent; border: none; color: ' + (!current ? '#55c8ff' : '#c7d5e2') + '; font-size: 13px; border-radius: 6px;">' + (!current ? '✓ ' : '') + 'Off</button>' +
        '</div>';

      menu.querySelectorAll('[data-read-receipts]').forEach(function(button) {
        button.addEventListener("click", function() {
          var value = button.dataset.readReceipts === 'on';
          toggleReadReceipts(value);
          closeIdentityMenu();
        });
      });
    }

    function toggleReadReceipts(enabled) {
      if (!currentChat || currentChat.id === "chat-default") return;
      currentChat.readReceiptsEnabled = enabled;
      apiFetch("POST", "/api/conversations/" + encodeURIComponent(currentChat.id) + "/preferences", { readReceiptsEnabled: enabled });
      renderIdentity();
    }

    function openReportDialog() {
      if (!identityMenuEl) return;
      var menu = identityMenuEl.querySelector('[role="menu"]');
      var reasons = [
        'Harassment',
        'Threats',
        'Spam',
        'Impersonation',
        'Inappropriate Content',
        'Scam / Fraud',
        'Other'
      ];

      menu.innerHTML = '<div class="report-dialog" style="padding: 12px; min-width: 280px;">' +
        '<div style="color: #c7d5e2; font-size: 12px; margin-bottom: 8px;">Report Conversation</div>' +
        (isGroupConversation(currentChat) ? '<div style="margin-bottom: 12px;"><label style="display: block; color: #c7d5e2; font-size: 11px; margin-bottom: 4px;">Member</label><select data-report-member style="width: 100%; padding: 8px; background: #081018; border: 1px solid #263646; border-radius: 6px; color: #e6edf3; font-size: 12px;">' + (currentChat.members || []).filter(function(member) { return !isCurrentChatUser(member, user); }).map(function(member) { return '<option value="' + escapeHtml(member.username) + '">' + escapeHtml(member.displayName) + '</option>'; }).join('') + '</select></div>' : '') +
        '<div style="margin-bottom: 12px;">' +
          '<label style="display: block; color: #c7d5e2; font-size: 11px; margin-bottom: 4px;">Reason</label>' +
          '<select data-report-reason style="width: 100%; padding: 8px; background: #081018; border: 1px solid #263646; border-radius: 6px; color: #e6edf3; font-size: 12px;">' +
            reasons.map(function(r) { return '<option value="' + escapeHtml(r) + '">' + escapeHtml(r) + '</option>'; }).join('') +
          '</select>' +
        '</div>' +
        '<div style="margin-bottom: 12px;">' +
          '<label style="display: block; color: #c7d5e2; font-size: 11px; margin-bottom: 4px;">Details (optional)</label>' +
          '<textarea data-report-details style="width: 100%; min-height: 60px; padding: 8px; background: #081018; border: 1px solid #263646; border-radius: 6px; color: #e6edf3; font-size: 12px; resize: vertical;"></textarea>' +
        '</div>' +
        '<div style="display: flex; gap: 8px;">' +
          '<button type="button" data-report-submit style="flex: 1; padding: 8px; background: #dc3545; color: white; border: none; border-radius: 6px; font-weight: 900;">Submit Report</button>' +
          '<button type="button" data-report-cancel style="flex: 1; padding: 8px; background: #081018; color: #c7d5e2; border: 1px solid #263646; border-radius: 6px;">Cancel</button>' +
        '</div>' +
        '</div>';

      menu.querySelector('[data-report-submit]').addEventListener("click", function() {
        var reason = menu.querySelector('[data-report-reason]').value;
        var details = menu.querySelector('[data-report-details]').value;
        var memberSelect = menu.querySelector('[data-report-member]');
        submitReport(reason, details, memberSelect ? memberSelect.value : "");
        closeIdentityMenu();
      });
      menu.querySelector('[data-report-cancel]').addEventListener("click", closeIdentityMenu);
    }

    function submitReport(reason, details, targetUsername) {
      if (!currentChat || currentChat.id === "chat-default") return;
      var other = getOtherParticipant(currentChat, user);
      if (!other) return;
      apiFetch("POST", "/api/conversations/" + encodeURIComponent(currentChat.id) + "/report", { reason: reason, details: details, targetUsername: targetUsername || other.username })
        .then(function(res) {
          if (res.ok) {
            // Show confirmation
            var menu = identityMenuEl.querySelector('[role="menu"]');
            menu.innerHTML = '<div style="padding: 16px; text-align: center; color: #55c8ff;">Report submitted. Thank you.</div>';
            setTimeout(closeIdentityMenu, 2000);
          }
        });
    }
  function renderChatMessage(message, index) {
    var author = normalizeChatMember(message.author || {}, true);
    var currentUsername = normalizeChatUsername(getStoredUsername());
    var isOwn = currentUsername && normalizeChatUsername(author.username) === currentUsername;
      var canEditDelete = Boolean(isOwn && ((!isRemoteConversation(currentChat) && !message.id) || (isRemoteConversation(currentChat) && message.id)));
      return '<article class="member-chat-message' + (isOwn ? ' is-own' : '') + '" style="--member-chat-color: ' + escapeHtml(author.chatColor) + ';">' +
      '<div class="member-chat-bubble"><strong>' + escapeHtml(author.displayName || "Member") + '</strong>' +
      '<span class="member-chat-message-actions">' +
        (isOwn && canEditDelete ? '<button class="member-chat-edit" type="button" data-chat-edit="' + escapeHtml(String(index)) + '" title="Edit message">Edit</button>' : '') +
        (canEditDelete ? '<button class="member-chat-delete" type="button" data-chat-delete="' + escapeHtml(String(index)) + '" title="Remove message">Remove</button>' : '') +
      '</span>' +
      '<small>' + escapeHtml(formatChatTime(message.createdAt)) + '</small>' +
      (message.editedAt ? '<small>Edited</small>' : '') +
      (message.body ? '<p>' + escapeHtml(message.body) + '</p>' : '') +
      renderChatAttachments(message.attachments) +
      (isOwn && Array.isArray(message.readBy) && message.readBy.length ? '<span class="member-chat-read-receipt">Seen by ' + escapeHtml(message.readBy.map(function(reader) { return reader.displayName || reader.username; }).join(", ")) + '</span>' : '') + '</div>' +
    '</article>';
  }

  }

  async function loadChatRoster(user) {
    var members = [];
    var loadedRemoteDirectory = false;
    try {
      var directoryResp = await fetch("/api/members/directory", { credentials: "same-origin", cache: "no-store" });
      if (directoryResp.ok) {
        var directoryData = await directoryResp.json();
        (directoryData.members || []).forEach(function(member) {
          members.push(normalizeChatMember(member, Boolean(member.online)));
        });
        loadedRemoteDirectory = true;
      }
    } catch (e) {}
    if (!loadedRemoteDirectory) {
      try {
        var local = JSON.parse(localStorage.getItem("tpiEditorContributors") || "[]");
        local.forEach(function(member) {
          if (member.developerOwner) return;
          members.push(normalizeChatMember(member, false));
        });
      } catch (e) {}
    }
    var currentUsername = normalizeChatUsername(user && user.username);
    return dedupeChatMembers(members).filter(function(member) {
      return normalizeChatUsername(member.username) !== currentUsername;
    });
  }

  function normalizeChatMember(member, online) {
    var name = member.displayName || member.display_name || member.name || member.username || "Member";
    return {
      id: member.id || member.contributorId || member.contributor_id || "",
      username: String(member.username || name).trim().replace(/\s+/g, "_"),
      displayName: name,
      title: member.title || "",
      role: member.role || "",
      photoUrl: member.photoUrl || member.photo_url || member.avatar || member.avatarUrl || "",
      chatColor: normalizeChatBubbleColor(member.chatColor || member.chat_color || "#55c8ff"),
      online: typeof online === "boolean" ? online : Boolean(member.online),
      lastSeenAt: member.lastSeenAt || member.last_seen_at || null,
      status: member.status || (online ? "online" : "offline")
    };
  }

  function dedupeChatMembers(members) {
    var seen = {};
    return members.filter(function(member) {
      var key = normalizeChatUsername(member.username);
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function createChat(members, user, requestedTitle) {
    var title = String(requestedTitle || "").trim() || getDefaultChatTitle(members, user);
    return {
      id: "chat-" + Date.now(),
      title: title,
      members: members,
      messages: []
    };
  }

  function createDirectChat(member, user) {
    var current = normalizeChatMember(user || {}, true);
    var normalizedMember = normalizeChatMember(member || {}, false);
    return {
      id: getDirectChatId(normalizedMember, current),
      title: normalizedMember.displayName || "Community Chat",
      members: dedupeChatMembers([current, normalizedMember]),
      messages: [],
      direct: true
    };
  }

  function createEmptyChat(user) {
    var current = normalizeChatMember(user || {}, true);
    return {
      id: "chat-default",
      title: "Community Chat",
      members: [current],
      messages: []
    };
  }

  function findDirectChat(chats, member, user) {
    var current = normalizeChatMember(user || {}, true);
    var other = normalizeChatMember(member || {}, false);
    return (chats || []).find(function(chat) {
      if (!chat.direct) return false;
      var usernames = (chat.members || []).map(function(m) { return m.username; });
      return usernames.indexOf(current.username) !== -1 && usernames.indexOf(other.username) !== -1 && usernames.length === 2;
    });
  }

  function getDirectChatId(member, current) {
    return "direct-" + [member.username, current.username].filter(Boolean).sort().join("-");
  }

  async function loadChatState(user, roster) {
    var remoteConversations = [];
    try { remoteConversations = await loadConversationList(); } catch (e) {}
    var chatList = remoteConversations.map(normalizeRemoteConversation).sort(function(a, b) {
      return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
    });

    var active = null;
    try {
      var saved = JSON.parse(localStorage.getItem("tpiFloatingChat") || "null");
      if (saved && saved.id && chatList.some(function(c) { return c.id === saved.id; })) {
        active = chatList.find(function(c) { return c.id === saved.id; });
      }
    } catch (e) {}

    if (!active && chatList.length) {
      active = chatList[0];
    }
    if (!active) {
      active = createEmptyChat(user);
    }

    return { currentChat: active, chatList: chatList };
  }

  function normalizeRemoteConversation(conv) {
    return {
      id: conv.id,
      title: conv.title || "Community Chat",
      direct: Boolean(conv.direct),
      createdById: conv.createdById || "",
      canManageMembers: Boolean(conv.canManageMembers),
      members: Array.isArray(conv.members) ? conv.members.map(function(m) { return normalizeChatMember(m, Boolean(m.online)); }) : [],
      messages: [],
      unreadCount: Number(conv.unreadCount || 0),
      updatedAt: conv.updatedAt || new Date().toISOString(),
      lastMessage: conv.lastMessage || null,
      theme: conv.theme || "default",
      quickEmoji: conv.quickEmoji || "👍",
      mutedUntil: conv.mutedUntil || null,
      readReceiptsEnabled: conv.readReceiptsEnabled !== false,
      blocked: Boolean(conv.blocked),
      restricted: Boolean(conv.restricted),
      nicknames: Array.isArray(conv.nicknames) ? conv.nicknames : []
    };
  }

  function loadCurrentChat(user, roster) {
    var current = normalizeChatMember(user, true);
    try {
      var saved = JSON.parse(localStorage.getItem("tpiFloatingChat") || "null");
      if (saved && Array.isArray(saved.members) && Array.isArray(saved.messages)) {
        saved.title = saved.title || getDefaultChatTitle(saved.members, user);
        if (!saved.members.some(function(member) { return member.username === current.username; })) {
          saved.members.unshift(current);
        }
        return saved;
      }
    } catch (e) {}
    var partner = roster.find(function(member) { return member.username !== current.username; });
    return partner ? createDirectChat(partner, user) : createEmptyChat(user);
  }

  function getCommunityChatTitle(user) {
    return normalizeChatMember(user || {}, true).displayName || "Community Chat";
  }

  function getDefaultChatTitle(members, user) {
    var current = normalizeChatMember(user || {}, true);
    var others = (members || []).filter(function(member) { return member.username !== current.username; });
    if (!others.length) return getCommunityChatTitle(user);
    if (others.length === 1) return others[0].displayName || "Community Chat";
    return others.slice(0, 2).map(function(member) { return member.displayName; }).join(", ") + (others.length > 2 ? " +" + (others.length - 2) : "");
  }

  function isCurrentChatUser(member, user) {
    return normalizeChatMember(member || {}, false).username === normalizeChatMember(user || {}, true).username;
  }

  function saveCurrentChat(user, chat) {
    try { localStorage.setItem("tpiFloatingChat", JSON.stringify(chat)); } catch (e) {}
  }

  function getChatStorageKey(user) {
    return "tpiFloatingChats:" + normalizeChatMember(user || {}, true).username;
  }

  function loadStoredChats(user) {
    try {
      var stored = JSON.parse(localStorage.getItem(getChatStorageKey(user)) || "[]");
      return Array.isArray(stored) ? stored.filter(function(chat) {
        return chat && chat.id && Array.isArray(chat.members) && Array.isArray(chat.messages);
      }) : [];
    } catch (e) {
      return [];
    }
  }

  function upsertStoredChat(user, chat) {
    if (!chat || !chat.id) return;
    var chats = loadStoredChats(user).filter(function(item) { return item.id !== chat.id; });
    chats.unshift(chat);
    replaceStoredChats(user, chats.slice(0, 24));
  }

  function replaceStoredChats(user, chats) {
    try { localStorage.setItem(getChatStorageKey(user), JSON.stringify((chats || []).slice(0, 24))); } catch (e) {}
  }

  function getChatListSubtitle(chat) {
    var count = Array.isArray(chat.members) ? chat.members.length : 0;
    if (chat.direct) return "Direct chat";
    return count + " members";
  }

  function getOtherParticipant(chat, user) {
    var currentUsername = normalizeChatUsername(user && user.username);
    return (chat && Array.isArray(chat.members) ? chat.members : []).find(function(member) {
      return normalizeChatUsername(member.username) !== currentUsername;
    });
  }

  function isGroupConversation(chat) {
    return Boolean(chat && !chat.direct && Array.isArray(chat.members) && chat.members.length >= 2);
  }


  // ---- Shared messenger helpers (inside initFloatingChat) ----

  function getConversationDisplayTitle(chat, user) {
    if (!chat || chat.id === "chat-default") return "Community Chat";
    if (!chat.direct) return chat.title || getDefaultChatTitle(chat.members, user);
    var other = getOtherParticipant(chat, user);
    var nickname = other && Array.isArray(chat.nicknames) ? chat.nicknames.find(function(item) { return item.target_id === other.id; }) : null;
    return nickname ? nickname.nickname : (other ? (other.displayName || other.username || "Member") : (chat.title || "Community Chat"));
  }

  function getConversationAvatarHtml(chat, user, sizeClass) {
    sizeClass = sizeClass || "";
    if (!chat || chat.id === "chat-default") {
      // No active conversation: neutral glyph instead of a misleading "?" participant.
      return '<span class="member-chat-avatar ' + sizeClass + '"><span>💬</span></span>';
    }
    if (chat.direct) {
      var other = getOtherParticipant(chat, user);
      return renderChatAvatar(other || { displayName: chat.title }, sizeClass);
    }
    var roomMembers = Array.isArray(chat.members) ? chat.members : [];
    var visibleMembers = roomMembers.slice(0, 2).map(function(member) {
      return renderChatAvatar(member, "", false);
    }).join("");
    var remainingCount = Math.max(0, roomMembers.length - 2);
    var remainingBadge = remainingCount
      ? '<span class="member-chat-stack-count" aria-label="' + remainingCount + ' more ' + (remainingCount === 1 ? 'member' : 'members') + '">+' + remainingCount + '</span>'
      : '';
    return '<span class="member-chat-stack" aria-label="Room with ' + roomMembers.length + ' members">' + visibleMembers + remainingBadge + '</span>';
  }

  function renderChatIdentity(chat, user) {
    var title = getConversationDisplayTitle(chat, user);
    var avatar = getConversationAvatarHtml(chat, user, "member-chat-identity-avatar");
    var presenceHtml = "";
    if (chat && chat.direct && !isGroupConversation(chat)) {
      var other = getOtherParticipant(chat, user);
      if (other) {
        var online = Boolean(other.online);
        var presenceText = online ? "Online" : "Offline";
        var presenceClass = online ? "is-online" : "is-offline";
        presenceHtml = '<span class="member-chat-identity-presence ' + presenceClass + '">' + escapeHtml(presenceText) + '</span>';
      }
    }
    return avatar +
      '<span class="member-chat-identity-copy"><strong>' + escapeHtml(title) + '</strong>' + presenceHtml + '</span>';
  }

  function updateChatListPreview(chat) {
    if (!chat || !chat.messages || !chat.messages.length) return;
    var latest = chat.messages[chat.messages.length - 1];
    chat.lastMessage = { body: latest.body, createdAt: latest.createdAt };
  }

  async function apiFetch(method, path, body) {
    var options = { method: method, credentials: "same-origin", cache: "no-store" };
    if (body !== undefined) {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(body);
    }
    var resp = await fetch(path, options);
    var data = {};
    try { data = await resp.json(); } catch (e) {}
    return { ok: resp.ok, status: resp.status, data: data };
  }

  async function loadConversationList() {
    var res = await apiFetch("GET", "/api/conversations");
    return res.ok && Array.isArray(res.data.conversations) ? res.data.conversations : [];
  }

  async function createRemoteConversation(title, usernames, isDirect) {
    var res = await apiFetch("POST", "/api/conversations", { title: title, usernames: usernames, direct: isDirect });
    if (!res.ok || !res.data.conversation) {
      throw new Error(res.data.error || "The conversation could not be created.");
    }
    return res.data.conversation;
  }

  async function replaceRemoteConversationMembers(conversationId, usernames) {
    var res = await apiFetch("PUT", "/api/conversations/" + encodeURIComponent(conversationId) + "/members", { usernames: usernames });
    if (!res.ok || !res.data.conversation) {
      throw new Error(res.data.error || "The room members could not be saved.");
    }
    return res.data.conversation;
  }

  async function loadRemoteMessages(conversationId) {
    var res = await apiFetch("GET", "/api/conversations/" + encodeURIComponent(conversationId) + "/messages");
    return res.ok && Array.isArray(res.data.messages) ? res.data.messages : [];
  }

  async function sendRemoteMessage(conversationId, body, attachments) {
    var res = await apiFetch("POST", "/api/conversations/" + encodeURIComponent(conversationId) + "/messages", {
      body: body,
      attachments: attachments
    });
    if (!res.ok || !res.data.message) {
      throw new Error(res.data.error || "Message could not be sent.");
    }
    return res.data.message;
  }

  async function updateRemoteMessage(conversationId, messageId, body, attachments) {
    var res = await apiFetch("PUT", "/api/conversations/" + encodeURIComponent(conversationId) + "/messages/" + encodeURIComponent(messageId), {
      body: body,
      attachments: attachments
    });
    if (!res.ok || !res.data.message) throw new Error(res.data.error || "The message could not be updated.");
    return res.data.message;
  }

  async function removeRemoteMessage(conversationId, messageId) {
    var res = await apiFetch("DELETE", "/api/conversations/" + encodeURIComponent(conversationId) + "/messages/" + encodeURIComponent(messageId));
    if (!res.ok) throw new Error(res.data.error || "The message could not be removed.");
    return res.data;
  }

  async function prepareMessengerAttachments(attachments) {
    var safeAttachments = [];
    var selectedAttachments = (attachments || []).slice(0, 6);
    for (var attachmentIndex = 0; attachmentIndex < selectedAttachments.length; attachmentIndex += 1) {
      var att = selectedAttachments[attachmentIndex];
      if (att.file) {
        var statusElement = document.querySelector("[data-chat-status]");
        if (statusElement) {
          statusElement.textContent = "Uploading attachment " + (attachmentIndex + 1) + " of " + selectedAttachments.length + "...";
          statusElement.hidden = false;
        }
        var uploaded = await uploadMessengerAttachment(att.file);
        safeAttachments.push({ name: uploaded.name || att.name || "", type: att.type || "photo", url: uploaded.url || "" });
      } else if (att.url && String(att.url).indexOf("/api/media/messenger/") === 0) {
        safeAttachments.push({ name: att.name || "", type: att.type || "photo", url: att.url });
      }
    }
    return safeAttachments;
  }

  async function uploadMessengerAttachment(file) {
    var formData = new FormData();
    formData.append("file", file);
    var response = await fetch("/api/uploads/messenger-media", {
      method: "POST",
      credentials: "same-origin",
      body: formData
    });
    var data = {};
    try { data = await response.json(); } catch (e) {}
    if (!response.ok || !data.url) throw new Error(data.error || "The attachment could not be uploaded.");
    return data;
  }

  async function markRemoteConversationRead(conversationId) {
    await apiFetch("POST", "/api/conversations/" + encodeURIComponent(conversationId) + "/read");
  }

  async function getRemoteUnreadCount() {
    var res = await apiFetch("GET", "/api/conversations/unread-count");
    return res.ok ? Number(res.data.count || 0) : 0;
  }

  function isRemoteConversation(chat) {
    if (!chat || !chat.id) return false;
    var id = String(chat.id);
    return !id.startsWith("chat-") && !id.startsWith("direct-");
  }

  function getStoredUsername() {
    try { return localStorage.getItem("tpiEditorSession") || ""; } catch (e) { return ""; }
  }

  function renderEmojiButtons(values, target) {
    if (!target) return;
    target.innerHTML = values.map(function(emoji) {
      return '<button type="button" data-chat-emoji-value="' + escapeHtml(emoji) + '" title="' + escapeHtml(emoji) + '">' + escapeHtml(emoji) + '</button>';
    }).join("");
  }

  function filterEmojiValues(query, groups, fallbackValues, searchIndex) {
    var cleanQuery = String(query || "").trim().toLowerCase();
    if (!cleanQuery) return fallbackValues;
    var matches = groups.filter(function(group) {
      return group.label.toLowerCase().indexOf(cleanQuery) !== -1;
    }).reduce(function(values, group) {
      return values.concat(group.icons.split(" "));
    }, []);
    if (!matches.length) {
      matches = fallbackValues.filter(function(emoji) {
        return emoji.indexOf(cleanQuery) !== -1 || String((searchIndex || {})[emoji] || "").indexOf(cleanQuery) !== -1;
      });
    }
    return Array.from(new Set(matches));
  }

  function renderChatAttachments(attachments) {
    if (!Array.isArray(attachments) || !attachments.length) return "";
    return '<div class="member-chat-attachments">' + attachments.map(function(attachment) {
      var label = escapeHtml(getAttachmentLabel(attachment));
      if (attachment && attachment.url && attachment.type === "photo") {
        return '<figure><button type="button" class="member-chat-image-preview" data-chat-preview-image="' + escapeHtml(attachment.url) + '" data-chat-preview-alt="' + label + '"><img src="' + escapeHtml(attachment.url) + '" alt="' + label + '"></button><figcaption>' + label + '</figcaption></figure>';
      }
      if (attachment && attachment.url && attachment.type === "video") {
        return '<figure><video src="' + escapeHtml(attachment.url) + '" controls></video><figcaption>' + label + '</figcaption></figure>';
      }
      if (attachment && attachment.url && attachment.type === "voice") {
        return '<figure><audio src="' + escapeHtml(attachment.url) + '" controls></audio><figcaption>' + label + '</figcaption></figure>';
      }
      return '<span>' + label + '</span>';
    }).join("") + '</div>';
  }

  function getAttachmentLabel(attachment) {
    var type = attachment && attachment.type ? attachment.type : "file";
    var name = attachment && attachment.name ? attachment.name : type;
    if (type === "photo") return "Photo: " + name;
    if (type === "video") return "Video: " + name;
    if (type === "voice") return "Voice message";
    return name;
  }

  function normalizeChatBubbleColor(value) {
    var color = String(value || "").trim();
    return /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#55c8ff";
  }

  function normalizeChatUsername(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "_");
  }

  function getMemberInitials(name) {
    var parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function renderChatAvatar(member, sizeClass, showPresence) {
    var name = member.displayName || member.username || "Member";
    var initials = getMemberInitials(name) || "M";
    var image = member.photoUrl
      ? '<img src="' + escapeHtml(member.photoUrl) + '" alt="' + escapeHtml(name) + '">'
      : '<span>' + escapeHtml(initials) + '</span>';
    var presenceVisible = showPresence !== false && member.online;
    return '<span class="member-chat-avatar' + (sizeClass ? " " + sizeClass : "") + '">' + image + (presenceVisible ? '<i aria-hidden="true"></i>' : '') + '</span>';
  }

  // Identity A — persistent signed-in Messenger owner.
  // Derived ONLY from the authenticated user; never from currentChat/conversation state.
  function renderOwnerIdentity(user) {
    var member = normalizeChatMember(user || {}, true);
    var name = member.displayName || member.username || "Member";
    var initials = getMemberInitials(name) || "?";
    var photoUrl = member.photoUrl || "";
    var avatar = '<span class="member-chat-avatar member-chat-identity-avatar">' +
      (photoUrl
        ? '<img src="' + escapeHtml(photoUrl) + '" alt="' + escapeHtml(name) + '">'
        : '<span>' + escapeHtml(initials) + '</span>') +
      '<i class="is-online" aria-hidden="true"></i>' +
      '</span>';
    return avatar +
      '<span class="member-chat-identity-copy"><strong>' + escapeHtml(name) + '</strong></span>' +
      '<span class="member-chat-identity-chevron" aria-hidden="true">▼</span>';
  }

  function setupFloatingChatDrag(chat) {
    var handle = chat.querySelector("[data-chat-drag]");
    var dragging = false;
    var offset = { x: 0, y: 0 };
    handle.addEventListener("pointerdown", function(event) {
      if (chat.classList.contains("is-collapsed")) {
        dockCollapsedChat(chat);
        return;
      }
      if (event.target.closest("button")) return;
      dragging = true;
      handle.setPointerCapture(event.pointerId);
      var rect = chat.getBoundingClientRect();
      offset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    });
    handle.addEventListener("pointermove", function(event) {
      if (chat.classList.contains("is-collapsed")) {
        dragging = false;
        dockCollapsedChat(chat);
        return;
      }
      if (!dragging) return;
      var left = Math.min(Math.max(12, event.clientX - offset.x), window.innerWidth - chat.offsetWidth - 12);
      var top = Math.min(Math.max(12, event.clientY - offset.y), window.innerHeight - chat.offsetHeight - 12);
      chat.style.left = left + "px";
      chat.style.top = top + "px";
      chat.style.right = "auto";
      chat.style.bottom = "auto";
    });
    handle.addEventListener("pointerup", function(event) {
      dragging = false;
      try { handle.releasePointerCapture(event.pointerId); } catch (e) {}
      if (chat.classList.contains("is-collapsed")) {
        dockCollapsedChat(chat);
        storeChatFrame(chat);
        return;
      }
      storeChatFrame(chat);
    });
  }

  function setupFloatingChatResize(chat) {
    var handle = chat.querySelector("[data-chat-resize]");
    var resizing = false;
    var start = null;
    handle.addEventListener("pointerdown", function(event) {
      if (chat.classList.contains("is-collapsed")) {
        dockCollapsedChat(chat);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      resizing = true;
      var rect = chat.getBoundingClientRect();
      start = {
        x: event.clientX,
        y: event.clientY,
        width: rect.width,
        height: rect.height
      };
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
    });
    handle.addEventListener("pointermove", function(event) {
      if (chat.classList.contains("is-collapsed")) {
        resizing = false;
        start = null;
        dockCollapsedChat(chat);
        return;
      }
      if (!resizing || !start) return;
      var width = Math.min(Math.max(420, start.width + (event.clientX - start.x)), 980);
      var height = Math.min(Math.max(360, start.height + (event.clientY - start.y)), 780);
      chat.style.width = width + "px";
      chat.style.height = height + "px";
      event.preventDefault();
      event.stopPropagation();
    });
    handle.addEventListener("pointerup", function(event) {
      resizing = false;
      start = null;
      try { handle.releasePointerCapture(event.pointerId); } catch (e) {}
      storeChatFrame(chat);
      event.stopPropagation();
    });
  }

  function applyStoredChatFrame(chat, forceOpen) {
    var frame = getStoredChatFrame();
    chat.style.width = frame && frame.width ? Math.max(420, frame.width) + "px" : "520px";
    chat.style.height = frame && frame.height ? Math.max(360, frame.height) + "px" : "520px";
    if (frame && frame.left && frame.top) {
      chat.style.left = frame.left + "px";
      chat.style.top = frame.top + "px";
      chat.style.right = "auto";
      chat.style.bottom = "auto";
    } else {
      chat.style.left = "auto";
      chat.style.top = "auto";
      chat.style.right = "24px";
      chat.style.bottom = "24px";
    }
    if (!forceOpen && frame && frame.collapsed) {
      chat.classList.add("is-collapsed");
      dockCollapsedChat(chat);
    }
  }

  function dockCollapsedChat(chat) {
    var left = document.body.classList.contains("member-mode") || document.body.classList.contains("feed-app-page") ? 278 : 18;
    left = Math.max(left, 18);
    chat.style.left = left + "px";
    chat.style.top = "10px";
    chat.style.right = "auto";
    chat.style.bottom = "auto";
    chat.style.width = Math.min(420, Math.max(320, window.innerWidth - left - 18)) + "px";
    chat.style.height = "auto";
  }

  function getStoredChatFrame() {
    try { return JSON.parse(localStorage.getItem("tpiFloatingChatFrame") || "null"); } catch (e) { return null; }
  }

  function storeChatFrame(chat) {
    try {
      var existing = getStoredChatFrame() || {};
      if (chat.classList.contains("is-collapsed")) {
        existing.collapsed = true;
        localStorage.setItem("tpiFloatingChatFrame", JSON.stringify(existing));
        return;
      }
      var rect = chat.getBoundingClientRect();
      localStorage.setItem("tpiFloatingChatFrame", JSON.stringify({
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        collapsed: false
      }));
    } catch (e) {}
  }

  function bumpLocalChatUnread() {
    try {
      var count = Number(localStorage.getItem("tpiChatUnreadCount") || "0") || 0;
      localStorage.setItem("tpiChatUnreadCount", String(count + 1));
    } catch (e) {}
  }

  function markLocalChatRead() {
    try { localStorage.removeItem("tpiChatUnreadCount"); } catch (e) {}
  }

  function getLocalChatUnreadCount() {
    try { return Number(localStorage.getItem("tpiChatUnreadCount") || "0") || 0; } catch (e) { return 0; }
  }

  function formatChatTime(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
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
