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

    // Set notification badge
    setupNotificationBadge();
    setupExploreBadge();

    // Set up logout
    setupLogout();

    // Set up mobile nav
    injectMobileNav();
    setupProfileLink(user);
    setupRoleGatedNav(user);

    // Set up floating community chat for signed-in members only.
    if (!user.guest) {
      await initFloatingChat(user);
    }

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
    var count = getLocalChatUnreadCount();
    try {
      var remoteChatCount = await getRemoteUnreadCount();
      count += remoteChatCount;
    } catch (e) {}
    try {
      var resp = await fetch("/api/notifications/unread-count", { credentials: "same-origin", cache: "no-store" });
      if (!resp.ok) {
        renderNotificationBadge(badge, count);
        return;
      }
      var data = await resp.json();
      count += Number(data.unreadCount || 0);
    } catch (e) {}
    renderNotificationBadge(badge, count);
  }

  function renderNotificationBadge(badge, count) {
    badge.textContent = count > 99 ? "99+" : String(count);
    badge.hidden = count <= 0;
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
        '<div><span class="member-chat-kicker">Community Chat</span><strong data-chat-title>' + escapeHtml(currentChat.title) + '</strong></div>' +
        '<div class="member-chat-header-actions">' +
          '<button type="button" data-chat-new>New Chat</button>' +
          '<button type="button" data-chat-minimize>Hide</button>' +
        '</div>' +
      '</header>' +
      '<div class="member-floating-chat-content">' +
        '<aside class="member-chat-contacts" aria-label="Online now">' +
          '<span class="member-chat-section-label">Online Now</span>' +
          '<div class="member-chat-online-list" data-chat-online></div>' +
          '<span class="member-chat-section-label member-chat-list-label">Chats</span>' +
          '<div class="member-chat-list" data-chat-list></div>' +
          '<section class="member-chat-create" data-chat-create hidden>' +
            '<span class="member-chat-section-label">Create Chat <button type="button" data-chat-create-close>Hide</button></span>' +
            '<p>Add members you want in this chat.</p>' +
            '<input type="text" data-chat-name placeholder="Chat name, optional">' +
            '<div class="member-chat-member-list" data-chat-members></div>' +
            '<button type="button" data-chat-start>Start Chat</button>' +
          '</section>' +
        '</aside>' +
        '<section class="member-chat-thread">' +
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
            '<div class="member-chat-tools" aria-label="Message tools">' +
              '<button type="button" data-chat-media title="Add photos or videos">Photo</button>' +
              '<button type="button" data-chat-voice title="Add a voice message">Voice</button>' +
              '<button type="button" data-chat-emoji title="Open emojis">Emoji</button>' +
            '</div>' +
            '<input type="file" data-chat-media-input accept="image/*,video/*" multiple hidden>' +
            '<input type="text" data-chat-input placeholder="Send a message">' +
            '<button type="button" data-chat-like title="Send thumbs up">Like</button>' +
            '<button type="submit">Send</button>' +
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
    var messagesEl = chat.querySelector("[data-chat-messages]");
    var titleEl = chat.querySelector("[data-chat-title]");
    var inputEl = chat.querySelector("[data-chat-input]");
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
    var selectedMembers = new Set(currentChat.members.map(function(member) { return member.username; }));
    syncChatMinimizeButton();

    renderOnline();
    renderChatList();
    renderMemberPicker();
    renderMessages();
    setupNotificationBadge();

    async function syncActiveChatMessages() {
      if (!isRemoteConversation(currentChat)) return;
      try {
        var messages = await loadRemoteMessages(currentChat.id);
        if (messages.length && JSON.stringify(messages) !== JSON.stringify(currentChat.messages)) {
          currentChat.messages = messages;
          renderMessages();
        }
      } catch (e) {}
    }

    async function syncConversationList() {
      try {
        var remote = await loadConversationList();
        var changed = false;
        remote.forEach(function(conv) {
          var existing = chatList.find(function(c) { return c.id === conv.id; });
          if (!existing) {
            chatList.push(normalizeRemoteConversation(conv));
            changed = true;
          } else if (conv.updatedAt && conv.updatedAt > (existing.updatedAt || "")) {
            existing.updatedAt = conv.updatedAt;
            existing.unreadCount = Number(conv.unreadCount || 0);
            changed = true;
          }
        });
        if (changed) {
          replaceStoredChats(user, chatList);
          renderChatList();
        }
      } catch (e) {}
    }

    var chatSyncInterval = setInterval(function() {
      syncActiveChatMessages();
      syncConversationList();
    }, 15000);

    window.addEventListener("beforeunload", function() { clearInterval(chatSyncInterval); });

    chat.querySelector("[data-chat-new]").addEventListener("click", function () {
      createEl.hidden = !createEl.hidden;
    });

    chat.querySelector("[data-chat-create-close]").addEventListener("click", function () {
      createEl.hidden = true;
    });

    chat.querySelector("[data-chat-start]").addEventListener("click", async function () {
      var members = roster.filter(function(member) {
        return selectedMembers.has(member.username) || member.username === user.username;
      });
      if (!members.some(function(member) { return member.username === user.username; })) {
        members.unshift(normalizeChatMember(user, true));
      }
      var title = chatNameEl ? chatNameEl.value : "";
      var usernames = members.filter(function(member) { return member.username !== user.username; }).map(function(member) { return member.username; });
      var remote = await createRemoteConversation(title, usernames, usernames.length === 1);
      if (remote) {
        currentChat = normalizeRemoteConversation(remote);
      } else {
        currentChat = createChat(members, user, title);
      }
      createEl.hidden = true;
      if (chatNameEl) chatNameEl.value = "";
      await openChat(currentChat);
    });

    minimizeButton.addEventListener("click", function () {
      var willCollapse = !chat.classList.contains("is-collapsed");
      if (willCollapse) {
        storeChatFrame(chat);
        chat.classList.add("is-collapsed");
        dockCollapsedChat(chat);
      } else {
        chat.classList.remove("is-collapsed");
        applyStoredChatFrame(chat, true);
      }
      syncChatMinimizeButton();
      storeChatFrame(chat);
    });

    chat.addEventListener("click", function () {
      if (chat.classList.contains("is-collapsed")) dockCollapsedChat(chat);
    });

    window.addEventListener("resize", function () {
      if (chat.classList.contains("is-collapsed")) dockCollapsedChat(chat);
    });

    chat.querySelector("[data-chat-form]").addEventListener("submit", async function (event) {
      event.preventDefault();
      var body = inputEl.value.trim();
      if (editingMessageIndex >= 0) {
        if (!body) return;
        currentChat.messages[editingMessageIndex].body = body;
        currentChat.messages[editingMessageIndex].editedAt = new Date().toISOString();
        editingMessageIndex = -1;
        inputEl.value = "";
        saveCurrentChat(user, currentChat);
        upsertStoredChat(user, currentChat);
        chatList = loadStoredChats(user);
        renderChatList();
        renderMessages();
        return;
      }
      if (!body && !pendingAttachments.length) return;
      await sendChatMessage(body, pendingAttachments);
      inputEl.value = "";
      pendingAttachments = [];
      renderAttachmentPreview();
    });

    chat.querySelector("[data-chat-media]").addEventListener("click", function () {
      mediaInputEl.click();
    });

    mediaInputEl.addEventListener("change", function () {
      pendingAttachments = Array.from(mediaInputEl.files || []).slice(0, 6).map(function(file) {
        return {
          name: file.name,
          type: file.type && file.type.startsWith("video/") ? "video" : "photo",
          url: URL.createObjectURL(file)
        };
      });
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
        pendingAttachments.push({ name: "Voice message", type: "voice" });
        renderAttachmentPreview();
        inputEl.focus();
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
          pendingAttachments.push({ name: "Voice message", type: "voice", url: URL.createObjectURL(blob) });
          renderAttachmentPreview();
          inputEl.focus();
        });
        voiceRecorder.start();
        button.textContent = "Stop";
      } catch (e) {
        pendingAttachments.push({ name: "Voice message", type: "voice" });
        renderAttachmentPreview();
        inputEl.focus();
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
      await sendChatMessage("👍", []);
    });

    messagesEl.addEventListener("click", function (event) {
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
          inputEl.value = currentChat.messages[editIndex].body || "";
          inputEl.focus();
        }
        return;
      }
      if (deleteButton) {
        var index = Number(deleteButton.dataset.chatDelete);
        if (Number.isInteger(index) && index >= 0 && index < currentChat.messages.length && window.confirm("Delete this message?")) {
          currentChat.messages.splice(index, 1);
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

    chat.querySelector("[data-chat-members]").addEventListener("change", function (event) {
      var checkbox = event.target.closest("[data-chat-member]");
      if (!checkbox) return;
      if (checkbox.checked) selectedMembers.add(checkbox.value);
      else selectedMembers.delete(checkbox.value);
    });

    setupFloatingChatDrag(chat);
    setupFloatingChatResize(chat);

    function renderOnline() {
      onlineEl.innerHTML = roster.map(function(member) {
        return '<button class="member-chat-online-person' + (member.online ? ' is-online' : '') + '" type="button" data-online-member="' + escapeHtml(member.username) + '">' +
          renderChatAvatar(member) +
          '<span class="member-chat-person-copy"><strong>' + escapeHtml(member.displayName) + '</strong>' +
          '<span class="member-chat-presence">' + escapeHtml(member.online ? "Online" : "Offline") + '</span></span>' +
        '</button>';
      }).join("");
      onlineEl.querySelectorAll("[data-online-member]").forEach(function(button) {
        button.addEventListener("click", async function() {
          var member = roster.find(function(candidate) { return candidate.username === button.dataset.onlineMember; });
          if (!member) return;
          var existing = findDirectChat(chatList, member, user);
          if (existing && isRemoteConversation(existing)) {
            currentChat = existing;
          } else {
            var remote = await createRemoteConversation("", [member.username], true);
            if (remote) {
              currentChat = normalizeRemoteConversation(remote);
            } else {
              currentChat = existing || createDirectChat(member, user);
            }
          }
          await openChat(currentChat);
          inputEl.focus();
        });
      });
    }

    function renderChatList() {
      if (!chatListEl) return;
      if (!chatList.length) {
        chatListEl.innerHTML = '<p class="member-chat-list-empty">No chats yet.</p>';
        return;
      }
      chatListEl.innerHTML = chatList.map(function(savedChat) {
        var active = savedChat.id === currentChat.id ? " is-active" : "";
        return '<article class="member-chat-list-item' + active + '">' +
          '<button class="member-chat-list-open" type="button" data-chat-open="' + escapeHtml(savedChat.id) + '">' +
            '<span class="member-chat-stack">' + savedChat.members.slice(0, 3).map(renderChatAvatar).join("") + '</span>' +
            '<span class="member-chat-person-copy"><strong>' + escapeHtml(savedChat.title || "Community Chat") + '</strong>' +
            '<span class="member-chat-presence">' + escapeHtml(getChatListSubtitle(savedChat)) + '</span></span>' +
          '</button>' +
          '<span class="member-chat-list-actions">' +
            '<button type="button" data-chat-rename="' + escapeHtml(savedChat.id) + '">Rename</button>' +
            '<button type="button" data-chat-remove="' + escapeHtml(savedChat.id) + '">Remove</button>' +
          '</span>' +
        '</article>';
      }).join("");
      chatListEl.querySelectorAll("[data-chat-open]").forEach(function(button) {
        button.addEventListener("click", function() {
          var saved = chatList.find(function(item) { return item.id === button.dataset.chatOpen; });
          if (!saved) return;
          openSavedChat(saved);
        });
      });
      chatListEl.querySelectorAll("[data-chat-rename]").forEach(function(button) {
        button.addEventListener("click", function() {
          var saved = chatList.find(function(item) { return item.id === button.dataset.chatRename; });
          if (!saved) return;
          var nextTitle = window.prompt("Chat name", saved.title || "Community Chat");
          if (nextTitle === null) return;
          nextTitle = nextTitle.trim();
          if (!nextTitle) return;
          saved.title = nextTitle;
          if (currentChat.id === saved.id) currentChat.title = nextTitle;
          saveCurrentChat(user, currentChat);
          replaceStoredChats(user, chatList);
          renderChatList();
          renderMessages();
        });
      });
      chatListEl.querySelectorAll("[data-chat-remove]").forEach(function(button) {
        button.addEventListener("click", function() {
          var saved = chatList.find(function(item) { return item.id === button.dataset.chatRemove; });
          if (!saved || !window.confirm("Remove this chat from your visible chat list? The visible shortcut will be removed, but this action is not a server-side audit delete.")) return;
          archiveRemovedChat(user, saved);
          chatList = chatList.filter(function(item) { return item.id !== saved.id; });
          replaceStoredChats(user, chatList);
          if (currentChat.id === saved.id) {
            currentChat = loadCurrentChat(user, roster);
            if (currentChat.id === saved.id) currentChat = createEmptyChat(user);
            selectedMembers = new Set(currentChat.members.map(function(member) { return member.username; }));
            saveCurrentChat(user, currentChat);
          }
          renderChatList();
          renderMemberPicker();
          renderMessages();
        });
      });
    }

    async function openChat(chat) {
      currentChat = chat;
      selectedMembers = new Set(currentChat.members.map(function(member) { return member.username; }));
      saveCurrentChat(user, currentChat);
      upsertStoredChat(user, currentChat);
      chatList = loadStoredChats(user);
      if (isRemoteConversation(currentChat)) {
        var messages = await loadRemoteMessages(currentChat.id);
        if (messages.length) {
          currentChat.messages = messages;
        }
        markRemoteConversationRead(currentChat.id);
      }
      renderChatList();
      renderMemberPicker();
      renderMessages();
    }

    function openSavedChat(saved) {
      openChat(saved);
      inputEl.focus();
    }

    function renderMemberPicker() {
      membersEl.innerHTML = roster.filter(function(member) {
        return member.username !== user.username;
      }).map(function(member) {
        var checked = selectedMembers.has(member.username) ? " checked" : "";
        return '<label class="member-chat-member-option">' +
          '<input type="checkbox" value="' + escapeHtml(member.username) + '" data-chat-member' + checked + '>' +
          renderChatAvatar(member) +
          '<span><strong>' + escapeHtml(member.displayName) + '</strong><small>' + escapeHtml(member.title || member.role || "Member") + '</small></span>' +
        '</label>';
      }).join("");
    }

    function renderMessages() {
      titleEl.textContent = currentChat.title;
      messagesEl.innerHTML = currentChat.messages.length
        ? currentChat.messages.map(function(message, index) { return renderChatMessage(message, index); }).join("")
        : "";
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function syncChatMinimizeButton() {
      if (!minimizeButton) return;
      minimizeButton.textContent = chat.classList.contains("is-collapsed") ? "Show" : "Hide";
      minimizeButton.setAttribute("aria-expanded", chat.classList.contains("is-collapsed") ? "false" : "true");
    }

    async function sendChatMessage(body, attachments) {
      var safeAttachments = (attachments || []).slice(0, 20).map(function(att) {
        return { name: att.name || "", type: att.type || "photo", url: att.url || "" };
      });
      if (!body && !safeAttachments.length) return;
      var localMessage = {
        author: normalizeChatMember(user, true),
        body: body,
        attachments: safeAttachments,
        createdAt: new Date().toISOString(),
        pending: true
      };
      currentChat.messages.push(localMessage);
      renderMessages();
      if (isRemoteConversation(currentChat)) {
        var remoteMessage = await sendRemoteMessage(currentChat.id, body, safeAttachments);
        if (remoteMessage) {
          localMessage.pending = false;
          localMessage.id = remoteMessage.id;
          localMessage.createdAt = remoteMessage.createdAt;
        }
      }
      saveCurrentChat(user, currentChat);
      upsertStoredChat(user, currentChat);
      chatList = loadStoredChats(user);
      if (!isRemoteConversation(currentChat)) bumpLocalChatUnread();
      renderMessages();
      setupNotificationBadge();
    }

    function renderAttachmentPreview() {
      if (!attachmentPreviewEl) return;
      if (!pendingAttachments.length) {
        attachmentPreviewEl.hidden = true;
        attachmentPreviewEl.innerHTML = "";
        return;
      }
      attachmentPreviewEl.hidden = false;
      attachmentPreviewEl.innerHTML = pendingAttachments.map(function(attachment) {
        return '<span>' + escapeHtml(getAttachmentLabel(attachment)) + '</span>';
      }).join("");
    }
  }

  async function loadChatRoster(user) {
    var members = [normalizeChatMember(user, true)];
    try {
      var directoryResp = await fetch("/api/members/directory", { credentials: "same-origin", cache: "no-store" });
      if (directoryResp.ok) {
        var directoryData = await directoryResp.json();
        (directoryData.members || []).forEach(function(member) {
          members.push(normalizeChatMember(member, false));
        });
      }
    } catch (e) {}
    try {
      var local = JSON.parse(localStorage.getItem("tpiEditorContributors") || "[]");
      local.forEach(function(member) {
        if (member.developerOwner) return;
        members.push(normalizeChatMember(member, isCurrentChatUser(member, user)));
      });
    } catch (e) {}
    return dedupeChatMembers(members);
  }

  function normalizeChatMember(member, online) {
    var name = member.displayName || member.display_name || member.name || member.username || "Member";
    return {
      username: String(member.username || name).toLowerCase().replace(/\s+/g, "_"),
      displayName: name,
      title: member.title || "",
      role: member.role || "",
      photoUrl: member.photoUrl || member.photo_url || "",
      chatColor: normalizeChatBubbleColor(member.chatColor || member.chat_color || "#55c8ff"),
      online: Boolean(online)
    };
  }

  function dedupeChatMembers(members) {
    var seen = {};
    return members.filter(function(member) {
      if (!member.username || seen[member.username]) return false;
      seen[member.username] = true;
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
      title: getCommunityChatTitle(user),
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
    var current = normalizeChatMember(user, true);
    var remoteConversations = [];
    try { remoteConversations = await loadConversationList(); } catch (e) {}
    var localChats = loadStoredChats(user);
    var merged = [];

    remoteConversations.forEach(function(conv) {
      var local = localChats.find(function(c) { return c.id === conv.id; });
      merged.push(local && local.messages && local.messages.length > (conv.messages || []).length
        ? local
        : normalizeRemoteConversation(conv));
    });

    localChats.forEach(function(local) {
      if (!merged.some(function(c) { return c.id === local.id; })) {
        merged.push(local);
      }
    });

    var active = null;
    try {
      var saved = JSON.parse(localStorage.getItem("tpiFloatingChat") || "null");
      if (saved && saved.id && merged.some(function(c) { return c.id === saved.id; })) {
        active = merged.find(function(c) { return c.id === saved.id; });
      }
    } catch (e) {}

    if (!active && merged.length) {
      active = merged[0];
    }
    if (!active) {
      var partner = roster.find(function(member) { return member.username !== current.username; });
      active = partner ? createDirectChat(partner, user) : createEmptyChat(user);
    }

    return { currentChat: active, chatList: merged };
  }

  function normalizeRemoteConversation(conv) {
    return {
      id: conv.id,
      title: conv.title || "Community Chat",
      direct: Boolean(conv.direct),
      members: Array.isArray(conv.members) ? conv.members.map(function(m) { return normalizeChatMember(m, false); }) : [],
      messages: [],
      unreadCount: Number(conv.unreadCount || 0),
      updatedAt: conv.updatedAt || new Date().toISOString()
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

  function getChatArchiveStorageKey(user) {
    return "tpiFloatingChatArchive:" + normalizeChatMember(user || {}, true).username;
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

  function archiveRemovedChat(user, chat) {
    if (!chat || !chat.id) return;
    try {
      var archive = JSON.parse(localStorage.getItem(getChatArchiveStorageKey(user)) || "[]");
      if (!Array.isArray(archive)) archive = [];
      var copy = Object.assign({}, chat, {
        removedAt: new Date().toISOString(),
        removedFromVisibleList: true
      });
      archive = archive.filter(function(item) { return item.id !== copy.id; });
      archive.unshift(copy);
      localStorage.setItem(getChatArchiveStorageKey(user), JSON.stringify(archive.slice(0, 100)));
    } catch (e) {}
  }

  function getChatListSubtitle(chat) {
    var count = Array.isArray(chat.members) ? chat.members.length : 0;
    var latest = Array.isArray(chat.messages) && chat.messages.length ? chat.messages[chat.messages.length - 1] : null;
    if (latest && latest.body) return latest.body.slice(0, 38);
    if (count === 1) return "Direct chat";
    return count + " members";
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
    if (!res.ok) return null;
    return res.data.conversation || null;
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
    return res.ok ? res.data.message : null;
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

  function renderChatMessage(message, index) {
    var author = normalizeChatMember(message.author || {}, true);
    var currentUsername = normalizeChatUsername(getStoredUsername());
    var isOwn = currentUsername && author.username === currentUsername;
    return '<article class="member-chat-message' + (isOwn ? ' is-own' : '') + '" style="--member-chat-color: ' + escapeHtml(author.chatColor) + ';">' +
      '<div class="member-chat-bubble"><strong>' + escapeHtml(author.displayName || "Member") + '</strong>' +
      '<span class="member-chat-message-actions">' +
        (isOwn ? '<button class="member-chat-edit" type="button" data-chat-edit="' + escapeHtml(String(index)) + '" title="Edit message">Edit</button>' : '') +
        '<button class="member-chat-delete" type="button" data-chat-delete="' + escapeHtml(String(index)) + '" title="Delete message">Delete</button>' +
      '</span>' +
      '<small>' + escapeHtml(formatChatTime(message.createdAt)) + '</small>' +
      (message.editedAt ? '<small>Edited</small>' : '') +
      (message.body ? '<p>' + escapeHtml(message.body) + '</p>' : '') +
      renderChatAttachments(message.attachments) + '</div>' +
    '</article>';
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

  function renderChatAvatar(member) {
    var name = member.displayName || member.username || "Member";
    var initial = name.trim().charAt(0).toUpperCase() || "M";
    var image = member.photoUrl
      ? '<img src="' + escapeHtml(member.photoUrl) + '" alt="' + escapeHtml(name) + '">'
      : '<span>' + escapeHtml(initial) + '</span>';
    return '<span class="member-chat-avatar">' + image + (member.online ? '<i aria-hidden="true"></i>' : '') + '</span>';
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
