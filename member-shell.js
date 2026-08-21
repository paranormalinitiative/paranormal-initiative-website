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

    // Set up floating community chat
    await initFloatingChat(user);

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
    var count = getLocalChatUnreadCount();
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
    var currentChat = loadCurrentChat(user, roster);
    var chat = document.createElement("section");
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
          '<section class="member-chat-create" data-chat-create hidden>' +
            '<span class="member-chat-section-label">Create Chat</span>' +
            '<p>Add members you want in this chat.</p>' +
            '<div class="member-chat-member-list" data-chat-members></div>' +
            '<button type="button" data-chat-start>Start Chat</button>' +
          '</section>' +
        '</aside>' +
        '<section class="member-chat-thread">' +
          '<section class="member-chat-messages" data-chat-messages aria-label="Chat messages"></section>' +
          '<div class="member-chat-attachment-preview" data-chat-attachments hidden></div>' +
          '<div class="member-chat-emoji-picker" data-chat-emoji-picker hidden>' +
            '<button type="button" data-chat-emoji-value="😀">😀</button>' +
            '<button type="button" data-chat-emoji-value="😂">😂</button>' +
            '<button type="button" data-chat-emoji-value="❤️">❤️</button>' +
            '<button type="button" data-chat-emoji-value="🙏">🙏</button>' +
            '<button type="button" data-chat-emoji-value="👻">👻</button>' +
            '<button type="button" data-chat-emoji-value="👍">👍</button>' +
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
      '<span class="member-chat-resize" data-chat-resize aria-hidden="true"></span>';
    document.body.appendChild(chat);

    var onlineEl = chat.querySelector("[data-chat-online]");
    var membersEl = chat.querySelector("[data-chat-members]");
    var createEl = chat.querySelector("[data-chat-create]");
    var messagesEl = chat.querySelector("[data-chat-messages]");
    var titleEl = chat.querySelector("[data-chat-title]");
    var inputEl = chat.querySelector("[data-chat-input]");
    var attachmentPreviewEl = chat.querySelector("[data-chat-attachments]");
    var mediaInputEl = chat.querySelector("[data-chat-media-input]");
    var emojiPickerEl = chat.querySelector("[data-chat-emoji-picker]");
    var minimizeButton = chat.querySelector("[data-chat-minimize]");
    var pendingAttachments = [];
    var selectedMembers = new Set(currentChat.members.map(function(member) { return member.username; }));
    currentChat.title = getCommunityChatTitle(user);
    syncChatMinimizeButton();

    renderOnline();
    renderMemberPicker();
    renderMessages();
    setupNotificationBadge();

    chat.querySelector("[data-chat-new]").addEventListener("click", function () {
      createEl.hidden = !createEl.hidden;
    });

    chat.querySelector("[data-chat-start]").addEventListener("click", function () {
      var members = roster.filter(function(member) {
        return selectedMembers.has(member.username) || member.username === user.username;
      });
      if (!members.some(function(member) { return member.username === user.username; })) {
        members.unshift(normalizeChatMember(user, true));
      }
      currentChat = createChat(members, user);
      createEl.hidden = true;
      titleEl.textContent = currentChat.title;
      saveCurrentChat(user, currentChat);
      renderMessages();
    });

    minimizeButton.addEventListener("click", function () {
      chat.classList.toggle("is-collapsed");
      syncChatMinimizeButton();
      storeChatFrame(chat);
    });

    chat.querySelector("[data-chat-form]").addEventListener("submit", function (event) {
      event.preventDefault();
      var body = inputEl.value.trim();
      if (!body && !pendingAttachments.length) return;
      sendChatMessage(body, pendingAttachments);
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
          type: file.type && file.type.startsWith("video/") ? "video" : "photo"
        };
      });
      renderAttachmentPreview();
    });

    chat.querySelector("[data-chat-voice]").addEventListener("click", function () {
      pendingAttachments.push({ name: "Voice message", type: "voice" });
      renderAttachmentPreview();
      inputEl.focus();
    });

    chat.querySelector("[data-chat-emoji]").addEventListener("click", function () {
      emojiPickerEl.hidden = !emojiPickerEl.hidden;
    });

    emojiPickerEl.addEventListener("click", function (event) {
      var emojiButton = event.target.closest("[data-chat-emoji-value]");
      if (!emojiButton) return;
      inputEl.value += emojiButton.dataset.chatEmojiValue || "";
      inputEl.focus();
    });

    chat.querySelector("[data-chat-like]").addEventListener("click", function () {
      sendChatMessage("👍", []);
    });

    messagesEl.addEventListener("click", function () {
      markLocalChatRead();
      setupNotificationBadge();
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
        button.addEventListener("click", function() {
          selectedMembers.add(button.dataset.onlineMember);
          createEl.hidden = false;
          renderMemberPicker();
        });
      });
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
        ? currentChat.messages.map(renderChatMessage).join("")
        : "";
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function syncChatMinimizeButton() {
      if (!minimizeButton) return;
      minimizeButton.textContent = chat.classList.contains("is-collapsed") ? "Show" : "Hide";
      minimizeButton.setAttribute("aria-expanded", chat.classList.contains("is-collapsed") ? "false" : "true");
    }

    function sendChatMessage(body, attachments) {
      currentChat.messages.push({
        author: normalizeChatMember(user, true),
        body: body,
        attachments: attachments || [],
        createdAt: new Date().toISOString()
      });
      saveCurrentChat(user, currentChat);
      bumpLocalChatUnread();
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
      var feedResp = await fetch("/api/feed?limit=20&offset=0", { credentials: "same-origin", cache: "no-store" });
      if (feedResp.ok) {
        var feedData = await feedResp.json();
        (feedData.items || []).forEach(function(item) {
          if (!item.authorUsername && !item.authorName) return;
          members.push(normalizeChatMember({
            username: item.authorUsername || item.authorName,
            displayName: item.authorName || item.authorDisplayName || item.authorUsername,
            title: item.authorTitle || "Member",
            photoUrl: item.authorPhotoUrl || "",
            chatColor: item.authorChatColor || "",
            active: true
          }, false));
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

  function createChat(members, user) {
    var currentUsername = normalizeChatMember(user || {}, true).username || getStoredUsername();
    var title = getCommunityChatTitle(user);
    return {
      id: "chat-" + Date.now(),
      title: title,
      members: members,
      messages: []
    };
  }

  function loadCurrentChat(user, roster) {
    var current = normalizeChatMember(user, true);
    try {
      var saved = JSON.parse(localStorage.getItem("tpiFloatingChat") || "null");
      if (saved && Array.isArray(saved.members) && Array.isArray(saved.messages)) {
        saved.title = getCommunityChatTitle(user);
        if (!saved.members.some(function(member) { return member.username === current.username; })) {
          saved.members.unshift(current);
        }
        return saved;
      }
    } catch (e) {}
    var partner = roster.find(function(member) { return member.username !== current.username; });
    return {
      id: "chat-default",
      title: getCommunityChatTitle(user),
      members: partner ? [current, partner] : [current],
      messages: []
    };
  }

  function getCommunityChatTitle(user) {
    return normalizeChatMember(user || {}, true).displayName || "Community Chat";
  }

  function isCurrentChatUser(member, user) {
    return normalizeChatMember(member || {}, false).username === normalizeChatMember(user || {}, true).username;
  }

  function saveCurrentChat(user, chat) {
    try { localStorage.setItem("tpiFloatingChat", JSON.stringify(chat)); } catch (e) {}
  }

  function getStoredUsername() {
    try { return localStorage.getItem("tpiEditorSession") || ""; } catch (e) { return ""; }
  }

  function renderChatMessage(message) {
    var author = normalizeChatMember(message.author || {}, true);
    var currentUsername = normalizeChatUsername(getStoredUsername());
    var isOwn = currentUsername && author.username === currentUsername;
    return '<article class="member-chat-message' + (isOwn ? ' is-own' : '') + '" style="--member-chat-color: ' + escapeHtml(author.chatColor) + ';">' +
      renderChatAvatar(message.author || {}) +
      '<div class="member-chat-bubble"><strong>' + escapeHtml(author.displayName || "Member") + '</strong>' +
      '<small>' + escapeHtml(formatChatTime(message.createdAt)) + '</small>' +
      (message.body ? '<p>' + escapeHtml(message.body) + '</p>' : '') +
      renderChatAttachments(message.attachments) + '</div>' +
    '</article>';
  }

  function renderChatAttachments(attachments) {
    if (!Array.isArray(attachments) || !attachments.length) return "";
    return '<div class="member-chat-attachments">' + attachments.map(function(attachment) {
      return '<span>' + escapeHtml(getAttachmentLabel(attachment)) + '</span>';
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
      if (event.target.closest("button")) return;
      dragging = true;
      handle.setPointerCapture(event.pointerId);
      var rect = chat.getBoundingClientRect();
      offset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    });
    handle.addEventListener("pointermove", function(event) {
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
      storeChatFrame(chat);
    });
  }

  function setupFloatingChatResize(chat) {
    var handle = chat.querySelector("[data-chat-resize]");
    var resizing = false;
    handle.addEventListener("pointerdown", function(event) {
      resizing = true;
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    handle.addEventListener("pointermove", function(event) {
      if (!resizing) return;
      var rect = chat.getBoundingClientRect();
      var width = Math.min(Math.max(360, event.clientX - rect.left), 980);
      var height = Math.min(Math.max(360, event.clientY - rect.top), 780);
      chat.style.width = width + "px";
      chat.style.height = height + "px";
    });
    handle.addEventListener("pointerup", function(event) {
      resizing = false;
      try { handle.releasePointerCapture(event.pointerId); } catch (e) {}
      storeChatFrame(chat);
    });
  }

  function applyStoredChatFrame(chat) {
    var frame = null;
    try { frame = JSON.parse(localStorage.getItem("tpiFloatingChatFrame") || "null"); } catch (e) {}
    chat.style.width = frame && frame.width ? Math.max(360, frame.width) + "px" : "520px";
    chat.style.height = frame && frame.height ? Math.max(360, frame.height) + "px" : "520px";
    if (frame && frame.left && frame.top) {
      chat.style.left = frame.left + "px";
      chat.style.top = frame.top + "px";
    } else {
      chat.style.right = "24px";
      chat.style.bottom = "24px";
    }
    if (frame && frame.collapsed) chat.classList.add("is-collapsed");
  }

  function storeChatFrame(chat) {
    try {
      var rect = chat.getBoundingClientRect();
      localStorage.setItem("tpiFloatingChatFrame", JSON.stringify({
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        collapsed: chat.classList.contains("is-collapsed")
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
