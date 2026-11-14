(function () {
  "use strict";

  var app = document.getElementById("help-center-app");
  var INTERNAL = Boolean(app && app.dataset.hcAudience === "internal");
  var DATA = INTERNAL ? window.TPI_INTERNAL_HELP_CENTER : window.TPI_HELP_CENTER;
  if (!DATA || !app) return;

  if (INTERNAL) document.body.classList.add("internal-help-center");

  var CENTER_TITLE = DATA.title || "Help Center";
  var CENTER_SUBTITLE = DATA.subtitle || "The Paranormal Initiative";
  var PATHS = INTERNAL ? {
    home: "internal-help-center.html",
    category: "internal-help-center-category.html",
    article: "internal-help-center-article.html",
    search: "internal-help-center-search.html",
    contact: "internal-help-center-contact.html"
  } : {
    home: "help-center.html",
    category: "help-center-category.html",
    article: "help-center-article.html",
    search: "help-center-search.html",
    contact: "help-center-contact.html"
  };

  var THEMES = DATA.themes.map(function (theme) { return theme.id; });
  var THEME_KEY = "tpiSiteTheme";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function currentTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      return THEMES.indexOf(saved) >= 0 ? saved : "cryptid";
    } catch (error) {
      return "cryptid";
    }
  }

  function applyTheme(theme) {
    var nextTheme = THEMES.indexOf(theme) >= 0 ? theme : "cryptid";
    document.documentElement.setAttribute("data-theme", nextTheme);
    try { localStorage.setItem(THEME_KEY, nextTheme); } catch (error) {}
    var select = document.querySelector("[data-hc-theme]");
    if (select) select.value = nextTheme;
  }

  function categoryById(id) {
    return DATA.categories.find(function (category) { return category.id === id; });
  }

  function articleById(id) {
    return DATA.articles.find(function (article) { return article.id === id; });
  }

  function articlesForCategory(id) {
    return DATA.articles.filter(function (article) { return article.category === id; });
  }

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function articleUrl(id) {
    return PATHS.article + "?id=" + encodeURIComponent(id);
  }

  function categoryUrl(id) {
    return PATHS.category + "?id=" + encodeURIComponent(id);
  }

  function searchUrl(query) {
    return PATHS.search + "?q=" + encodeURIComponent(query);
  }

  function shell(content, activeCategory) {
    var active = activeCategory || "";
    var categoryLinks = DATA.categories.map(function (category) {
      return '<a class="hc-sidebar-link ' + (active === category.id ? "is-active" : "") + '" href="' + categoryUrl(category.id) + '">' +
        '<span class="hc-sidebar-icon">' + category.icon + '</span>' +
        '<span>' + escapeHtml(category.shortLabel) + '</span>' +
        '<small>' + articlesForCategory(category.id).length + '</small>' +
      '</a>';
    }).join("");

    app.innerHTML =
      '<div class="hc-app">' +
        '<header class="hc-topbar">' +
          '<button class="hc-icon-button hc-menu-button" type="button" data-hc-menu aria-expanded="false" aria-controls="hc-sidebar" aria-label="Open Help Center navigation">☰</button>' +
          '<a class="hc-brand" href="' + PATHS.home + '" aria-label="' + escapeHtml(CENTER_TITLE) + ' home">' +
            '<span class="hc-brand-mark">✦</span>' +
            '<span class="hc-brand-copy"><strong>' + escapeHtml(CENTER_TITLE) + '</strong><span>' + escapeHtml(CENTER_SUBTITLE) + '</span></span>' +
          '</a>' +
          '<span class="hc-topbar-spacer"></span>' +
          '<div class="hc-topbar-actions">' +
            '<a class="hc-topbar-link" href="' + PATHS.contact + '">' + (INTERNAL ? "Internal escalation" : "Help Desk") + '</a>' +
            (INTERNAL ? '<a class="hc-topbar-link" href="/admin-panel">Administration Center</a><a class="hc-topbar-link" href="help-center.html">Member Help Center</a>' : '<a class="hc-topbar-link" href="member-login.html" data-member-link>Sign in</a>') +
            '<select class="hc-theme-select" data-hc-theme aria-label="Help Center theme">' +
              DATA.themes.map(function (theme) { return '<option value="' + theme.id + '">' + escapeHtml(theme.label) + '</option>'; }).join("") +
            '</select>' +
          '</div>' +
        '</header>' +
        '<div class="hc-layout">' +
          '<aside class="hc-sidebar" id="hc-sidebar" aria-label="Help Center topics">' +
            '<p class="hc-sidebar-kicker">' + (INTERNAL ? "Staff operations" : "TPI support topics") + '</p>' +
            '<a class="hc-sidebar-link ' + (!active ? "is-active" : "") + '" href="' + PATHS.home + '">' +
              '<span class="hc-sidebar-icon">⌂</span><span>' + (INTERNAL ? "Internal Help Center home" : "Help Center home") + '</span>' +
            '</a>' +
            '<div class="hc-sidebar-section"><span class="hc-sidebar-label">Browse by topic</span>' + categoryLinks + '</div>' +
            '<div class="hc-sidebar-section"><span class="hc-sidebar-label">' + (INTERNAL ? "Operational links" : "Your TPI space") + '</span>' +
              (INTERNAL ? '<a class="hc-sidebar-link" href="/admin-panel"><span class="hc-sidebar-icon">⌑</span><span>Administration Center</span></a><a class="hc-sidebar-link" href="help-center.html"><span class="hc-sidebar-icon">?</span><span>Member Help Center</span></a>' : '<a class="hc-sidebar-link" href="member-home.html" data-member-space><span class="hc-sidebar-icon">●</span><span>Member Home</span></a><a class="hc-sidebar-link" href="bug-report.html"><span class="hc-sidebar-icon">!</span><span>Report a bug</span></a><a class="hc-sidebar-link" href="help-center-contact.html"><span class="hc-sidebar-icon">✉</span><span>Contact the Help Desk</span></a>') +
            '</div>' +
          '</aside>' +
          '<main class="hc-main"><div class="hc-main-inner">' + content + '</div></main>' +
        '</div>' +
      '</div>';

    applyTheme(currentTheme());
    bindShell();
    hydrateAccount();
  }

  function bindShell() {
    var menu = document.querySelector("[data-hc-menu]");
    var sidebar = document.getElementById("hc-sidebar");
    if (menu && sidebar) {
      menu.addEventListener("click", function () {
        var open = sidebar.classList.toggle("is-open");
        menu.setAttribute("aria-expanded", String(open));
      });
      sidebar.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
          sidebar.classList.remove("is-open");
          menu.setAttribute("aria-expanded", "false");
        }
      });
    }
    var theme = document.querySelector("[data-hc-theme]");
    if (theme) theme.addEventListener("change", function () { saveTheme(theme.value); });
  }

  async function saveTheme(theme) {
    applyTheme(theme);
    try {
      await fetch("/api/contributors/me/theme", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: theme })
      });
    } catch (error) {}
  }

  async function hydrateAccount() {
    var memberLink = document.querySelector("[data-member-link]");
    var memberSpace = document.querySelector("[data-member-space]");
    try {
      var response = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (!response.ok) return;
      var data = await response.json();
      var user = data && data.user;
      if (!user) return;
      if (user.theme && THEMES.indexOf(user.theme) >= 0) applyTheme(user.theme);
      if (memberLink) {
        memberLink.href = "member-home.html";
        memberLink.textContent = "Member Home";
      }
      if (memberSpace) memberSpace.href = "member-home.html";
    } catch (error) {}
  }

  function searchForm(value) {
    return '<form class="hc-search" data-hc-search-form role="search">' +
      '<span class="hc-search-icon" aria-hidden="true">⌕</span>' +
      '<input type="search" name="q" value="' + escapeHtml(value || "") + '" placeholder="Search TPI help articles…" autocomplete="off" aria-label="Search TPI help articles">' +
      '<button type="submit">Search</button>' +
    '</form>';
  }

  function bindSearch() {
    var form = document.querySelector("[data-hc-search-form]");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name=q]");
      var query = String(input && input.value || "").trim();
        window.location.href = query ? searchUrl(query) : PATHS.home;
    });
  }

  function articleRow(article) {
    return '<a class="hc-article-row" href="' + articleUrl(article.id) + '">' +
      '<span class="hc-article-row-copy"><h3>' + escapeHtml(article.title) + '</h3><p>' + escapeHtml(article.excerpt) + '</p></span>' +
      '<span class="hc-article-row-meta">Read <span class="hc-arrow" aria-hidden="true">›</span></span>' +
    '</a>';
  }

  function contactCard() {
    return '<section class="hc-contact-card" aria-labelledby="hc-contact-heading">' +
      '<div><h2 id="hc-contact-heading">' + (INTERNAL ? "Need an internal answer?" : "Still need a hand?") + '</h2><p>' + (INTERNAL ? "Describe the operational question and route it to the authorized TPI owner or operations contact." : "Tell us what you were trying to do and the Help Desk can route the question to the right TPI team.") + '</p></div>' +
      '<div class="hc-contact-actions"><a class="hc-primary-button" href="' + PATHS.contact + '">' + (INTERNAL ? "Open internal escalation" : "Open the Help Desk") + '</a>' + (INTERNAL ? '<a class="hc-secondary-button" href="help-center.html">Member Help Center</a>' : '<a class="hc-secondary-button" href="bug-report.html">Report a bug</a>') + '</div>' +
    '</section>';
  }

  function renderHome() {
    var popular = DATA.articles.filter(function (article) { return article.popular; }).slice(0, 5);
    var categories = DATA.categories.map(function (category) {
      return '<a class="hc-category-card" data-tone="' + category.tone + '" href="' + categoryUrl(category.id) + '">' +
        '<span class="hc-category-icon" aria-hidden="true">' + category.icon + '</span>' +
        '<h3>' + escapeHtml(category.label) + '</h3>' +
        '<p>' + escapeHtml(category.description) + '</p>' +
        '<span class="hc-category-meta">' + articlesForCategory(category.id).length + ' guides <span class="hc-arrow" aria-hidden="true">›</span></span>' +
      '</a>';
    }).join("");
    shell(
      '<section class="hc-hero">' +
        '<p class="hc-eyebrow">' + (INTERNAL ? "Operational guidance for approved staff" : "Support for every part of the Initiative") + '</p>' +
        '<h1>' + (INTERNAL ? "What do you need to do?" : "How can we help you?") + '</h1>' +
        '<p>' + (INTERNAL ? "Find the procedure for Administration Center work, moderation, member actions, publishing, apps, security, and escalation." : "Find clear guidance for your member account, community tools, research, apps, policies, safety, and the people behind TPI.") + '</p>' +
        searchForm("") +
      '</section>' +
      '<section class="hc-section" aria-labelledby="hc-topics-heading"><div class="hc-section-heading"><div><h2 id="hc-topics-heading">Browse TPI help</h2><p>Choose the area closest to your question.</p></div></div><div class="hc-category-grid">' + categories + '</div></section>' +
      '<section class="hc-section" aria-labelledby="hc-popular-heading"><div class="hc-section-heading"><div><h2 id="hc-popular-heading">Popular guides</h2><p>Good places to start when you are new or stuck.</p></div><a href="' + PATHS.search + '?q=">Search all guides</a></div><div class="hc-article-list">' + popular.map(articleRow).join("") + '</div></section>' +
      contactCard(),
      ""
    );
    bindSearch();
  }

  function renderCategory() {
    var category = categoryById(params().get("id")) || DATA.categories[0];
    var articles = articlesForCategory(category.id);
    var list = articles.map(function (article) {
      return '<a class="hc-category-article" href="' + articleUrl(article.id) + '"><div><h2>' + escapeHtml(article.title) + '</h2><p>' + escapeHtml(article.excerpt) + '</p></div><aside aria-hidden="true">›</aside></a>';
    }).join("");
    shell(
      '<nav class="hc-breadcrumbs" aria-label="Breadcrumb"><a href="' + PATHS.home + '">' + escapeHtml(CENTER_TITLE) + '</a><span>›</span><span>' + escapeHtml(category.shortLabel) + '</span></nav>' +
      '<section class="hc-page-heading"><p class="hc-eyebrow">TPI support topic</p><h1>' + escapeHtml(category.label) + '</h1><p>' + escapeHtml(category.description) + '</p><div class="hc-topic-count">' + articles.length + ' guides in this topic</div></section>' +
      '<div class="hc-category-article-list">' + list + '</div>' +
      contactCard(),
      category.id
    );
  }

  function renderBody(article) {
    return article.body.map(function (block) {
      if (block.type === "h2") return '<h2>' + escapeHtml(block.text) + '</h2>';
      if (block.type === "ul" || block.type === "ol") return '<' + block.type + '>' + block.items.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join("") + '</' + block.type + '>';
      if (block.type === "callout") return '<aside class="hc-callout" data-tone="' + escapeHtml(block.tone || "info") + '"><span class="hc-callout-title">' + escapeHtml(block.title) + '</span><p>' + escapeHtml(block.text) + '</p></aside>';
      return '<p>' + escapeHtml(block.text) + '</p>';
    }).join("");
  }

  function renderArticle() {
    var article = articleById(params().get("id")) || DATA.articles[0];
    var category = categoryById(article.category);
    var headings = article.body.filter(function (block) { return block.type === "h2"; });
    var toc = headings.length ? '<aside class="hc-toc"><strong>On this page</strong>' + headings.map(function (heading, index) { return '<a href="#hc-heading-' + index + '">' + escapeHtml(heading.text) + '</a>'; }).join("") + '</aside>' : "";
    var body = renderBody(article).replace(/<h2>/g, function () { var index = 0; return function () { return '<h2 id="hc-heading-' + (index++) + '">'; }; }());
    // The replacement above is intentionally followed by a DOM-safe fallback for older browsers.
    var related = DATA.articles.filter(function (item) { return item.category === article.category && item.id !== article.id; }).slice(0, 2);
    shell(
      '<nav class="hc-breadcrumbs" aria-label="Breadcrumb"><a href="' + PATHS.home + '">' + escapeHtml(CENTER_TITLE) + '</a><span>›</span><a href="' + categoryUrl(category.id) + '">' + escapeHtml(category.shortLabel) + '</a><span>›</span><span>' + escapeHtml(article.title) + '</span></nav>' +
      '<div class="hc-article-layout"><article><header class="hc-article-header"><p class="hc-eyebrow">' + escapeHtml(category.label) + '</p><h1>' + escapeHtml(article.title) + '</h1><p>' + escapeHtml(article.excerpt) + '</p><div class="hc-article-meta">Updated ' + escapeHtml(article.updated) + ' · ' + escapeHtml(CENTER_TITLE) + '</div></header><div class="hc-article-body">' + body + '</div><div class="hc-helpful"><span>Was this helpful?</span><button type="button" data-helpful="yes">Yes</button><button type="button" data-helpful="no">Not quite</button><span data-helpful-status></span></div>' + (related.length ? '<section class="hc-related"><h2>Next steps</h2><div class="hc-related-grid">' + related.map(articleRow).join("") + '</div></section>' : "") + '</article>' + toc + '</div>',
      category.id
    );
    bindHelpful(article.id);
  }

  function bindHelpful(articleId) {
    var buttons = document.querySelectorAll("[data-helpful]");
    var status = document.querySelector("[data-helpful-status]");
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) { item.classList.remove("is-selected"); });
        button.classList.add("is-selected");
        if (status) status.textContent = button.dataset.helpful === "yes" ? "Thanks — glad it helped." : "Thanks. The Help Desk can help with the next step.";
        try { localStorage.setItem("tpiHelpfulness:" + articleId, button.dataset.helpful); } catch (error) {}
      });
    });
  }

  function renderSearch() {
    var query = String(params().get("q") || "").trim();
    var normalized = query.toLowerCase();
    var results = normalized ? DATA.articles.filter(function (article) {
      var category = categoryById(article.category);
      var text = [article.title, article.excerpt, category && category.label].concat(article.body.map(function (block) { return block.text || (block.items || []).join(" "); })).join(" ").toLowerCase();
      return text.indexOf(normalized) >= 0;
    }) : DATA.articles;
    var resultMarkup = results.map(function (article) {
      var category = categoryById(article.category);
      return '<a class="hc-result" href="' + articleUrl(article.id) + '"><span class="hc-result-category">' + escapeHtml(category.shortLabel) + '</span><h2>' + escapeHtml(article.title) + '</h2><p>' + escapeHtml(article.excerpt) + '</p></a>';
    }).join("");
    shell(
      '<section class="hc-page-heading"><p class="hc-eyebrow">' + escapeHtml(CENTER_TITLE) + '</p><h1>Search help articles</h1><p>' + (INTERNAL ? "Search procedures for staff operations, moderation, member records, publishing, apps, security, and audit." : "Search across account access, community, research, apps, safety, policies, and reporting guidance.") + '</p>' + searchForm(query) + '</section>' +
      '<p class="hc-result-count">' + results.length + ' ' + (results.length === 1 ? "guide" : "guides") + (query ? ' matching “' + escapeHtml(query) + '”' : " available") + '</p>' +
      (results.length ? '<div class="hc-search-results">' + resultMarkup + '</div>' : '<div class="hc-empty"><h2>No guide matched that search.</h2><p>Try a shorter phrase, or open the ' + (INTERNAL ? "internal escalation path" : "Help Desk") + ' and tell us what you were trying to do.</p><a class="hc-primary-button" href="' + PATHS.contact + '">' + (INTERNAL ? "Open internal escalation" : "Open the Help Desk") + '</a></div>') +
      (results.length ? contactCard() : ""),
      ""
    );
    bindSearch();
  }

  function renderContact() {
    shell(
      '<nav class="hc-breadcrumbs" aria-label="Breadcrumb"><a href="' + PATHS.home + '">' + escapeHtml(CENTER_TITLE) + '</a><span>›</span><span>' + (INTERNAL ? "Internal escalation" : "Help Desk") + '</span></nav>' +
      '<section class="hc-page-heading"><p class="hc-eyebrow">' + (INTERNAL ? "Protected operations" : "Human support") + '</p><h1>' + (INTERNAL ? "Prepare an internal escalation" : "Open a Help Desk request") + '</h1><p>' + (INTERNAL ? "Give the authorized owner or operations contact enough context to review the issue. Never include credentials or unnecessary member data." : "Give us enough context to route your question. For account or privacy issues, never include a password, recovery code, or private message content.") + '</p></section>' +
      '<div class="hc-contact-grid"><section class="hc-contact-panel"><h2>Choose the closest route</h2><p>' + (INTERNAL ? "Open the matching protected surface first, then escalate when the procedure, permission, or production behavior is unclear." : "These existing TPI surfaces are often the fastest next step while the Help Desk grows into a full support queue.") + '</p><ul class="hc-contact-list">' + (INTERNAL ? '<li><a href="/admin-panel">⌑ <span>Administration Center</span></a></li><li><a href="/moderation">⚖ <span>Moderation queue</span></a></li><li><a href="help-center.html">? <span>Member Help Center</span></a></li>' : '<li><a href="member-login.html">⌁ <span>Account access and recovery</span></a></li><li><a href="bug-report.html">! <span>Broken page or feature</span></a></li><li><a href="early-access.html">✉ <span>General contact and links</span></a></li>') + '<li><a href="mailto:' + DATA.email + '?subject=' + encodeURIComponent(INTERNAL ? "TPI internal escalation" : "TPI Help Desk request") + '">@ <span>Email the TPI team</span></a></li></ul></section>' +
      '<form class="hc-form" data-hc-contact-form><h2>' + (INTERNAL ? "Prepare an escalation" : "Prepare a request") + '</h2><p>Submitting opens your email app with the details you provide.</p><div class="hc-form-grid"><label>Topic<select name="topic">' + (INTERNAL ? '<option>Authorization or role boundary</option><option>Moderation or abuse report</option><option>Member account action</option><option>Content or publishing</option><option>Creator Studio, Nova, or events</option><option>Security, privacy, or audit</option><option>Other internal operations</option>' : '<option>Account access</option><option>Community or Messenger</option><option>Research or Education</option><option>Apps, StudioFlow, or Nova</option><option>Privacy, safety, or reporting</option><option>Policies or standards</option><option>Other</option>') + '</select></label><label>Your email<input type="email" name="email" placeholder="you@example.com" autocomplete="email"></label><label class="full">Subject<input required name="subject" placeholder="What do you need help with?" maxlength="120"></label><label class="full">What happened?<textarea required name="details" placeholder="' + (INTERNAL ? "Give the route, action, account role, time, visible result, and safe record reference." : "Tell us the page, steps, expected result, and what happened.") + '"></textarea></label></div><div class="hc-form-note">Do not include passwords, recovery codes, private messages, exact residential addresses, session cookies, or other sensitive information.</div><div class="hc-form-actions"><button class="hc-primary-button" type="submit">Open email draft</button><span class="hc-form-status" data-hc-form-status role="status"></span></div></form></div>',
      ""
    );
    bindContactForm();
  }

  function bindContactForm() {
    var form = document.querySelector("[data-hc-contact-form]");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var values = new FormData(form);
      var subject = "[TPI Help Desk] " + String(values.get("subject") || "").trim();
      var body = [
        "Topic: " + values.get("topic"),
        "Reply email: " + values.get("email"),
        "",
        String(values.get("details") || "").trim(),
        "",
        "Please do not include passwords or recovery codes."
      ].join("\n");
      var link = "mailto:" + DATA.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      window.location.href = link;
      var status = document.querySelector("[data-hc-form-status]");
      if (status) status.textContent = "Your email draft is ready.";
    });
  }

  applyTheme(currentTheme());
  var page = app.dataset.hcPage;
  if (page === "category") renderCategory();
  else if (page === "article") renderArticle();
  else if (page === "search") renderSearch();
  else if (page === "contact") renderContact();
  else renderHome();
})();
