(function () {
  "use strict";

  var ROOT_ID = "tpi-mystic-help-center";
  var STOP_WORDS = {
    a: true, an: true, and: true, are: true, can: true, do: true, for: true,
    how: true, i: true, in: true, is: true, it: true, me: true, my: true,
    of: true, on: true, please: true, the: true, to: true, what: true,
    when: true, where: true, why: true, with: true, you: true, your: true
  };
  var ALIASES = [
    { terms: ["avatar", "profile picture", "profile photo", "headshot"], ids: ["manage-profile-theme"] },
    { terms: ["banner", "background image", "cover photo", "profile background"], ids: ["manage-profile-theme"] },
    { terms: ["dm", "direct message", "chat", "messenger"], ids: ["messaging-in-tpi", "community-feed-messenger"] },
    { terms: ["password", "sign in", "signin", "login", "locked out", "recovery"], ids: ["account-access", "recover-account", "login-troubleshooting"] },
    { terms: ["report", "abuse", "harassment", "unsafe", "bug"], ids: ["report-bug-community-issue", "report-abuse-and-appeal"] },
    { terms: ["video", "reel", "story", "photo", "upload"], ids: ["photos-on-tpi", "videos-and-external-links", "tpi-reels", "tpi-stories"] },
    { terms: ["privacy", "private", "safety", "personal information"], ids: ["privacy-and-safety"] }
  ];

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
  }

  function tokens(value) {
    return normalize(value).split(" ").filter(function (token) {
      return token.length > 1 && !STOP_WORDS[token];
    });
  }

  function articleText(article) {
    return [article.title, article.excerpt].concat((article.body || []).map(function (block) {
      return block.text || (block.items || []).join(" ");
    })).join(" ");
  }

  function articles() {
    return window.TPI_HELP_CENTER && Array.isArray(window.TPI_HELP_CENTER.articles) ? window.TPI_HELP_CENTER.articles : [];
  }

  function publicSources() {
    var knowledge = window.TPI_MYSTIC_PUBLIC_KNOWLEDGE;
    return knowledge && knowledge.audience === "public-member" && Array.isArray(knowledge.sources) ? knowledge.sources : [];
  }

  function publicAnswers() {
    var knowledge = window.TPI_MYSTIC_PUBLIC_KNOWLEDGE;
    return knowledge && knowledge.audience === "public-member" && Array.isArray(knowledge.answers) ? knowledge.answers : [];
  }

  function articleUrl(id) {
    return "help-center-article.html?id=" + encodeURIComponent(id);
  }

  function findMatches(query) {
    var normalizedQuery = normalize(query);
    var queryTokens = tokens(query);
    var aliasIds = [];
    ALIASES.forEach(function (alias) {
      if (alias.terms.some(function (term) { return normalizedQuery.indexOf(normalize(term)) >= 0; })) {
        aliasIds = aliasIds.concat(alias.ids);
      }
    });
    return articles().map(function (article) {
      var title = normalize(article.title);
      var excerpt = normalize(article.excerpt);
      var body = normalize(articleText(article));
      var score = aliasIds.indexOf(article.id) >= 0 ? 14 : 0;
      if (normalizedQuery && title.indexOf(normalizedQuery) >= 0) score += 18;
      if (normalizedQuery && excerpt.indexOf(normalizedQuery) >= 0) score += 9;
      queryTokens.forEach(function (token) {
        if (title.indexOf(token) >= 0) score += 7;
        if (excerpt.indexOf(token) >= 0) score += 3;
        if (body.indexOf(token) >= 0) score += 1;
      });
      return { article: article, score: score };
    }).filter(function (match) { return match.score > 0; }).sort(function (left, right) {
      return right.score - left.score;
    });
  }

  function firstAnswer(article) {
    var block = (article.body || []).find(function (item) { return item.type === "p" && item.text; });
    var answer = block ? block.text : article.excerpt;
    return answer.length > 360 ? answer.slice(0, 357).replace(/\s+\S*$/, "") + "…" : answer;
  }

  function resultMessage(match) {
    var article = match.article;
    return '<p>Here is the verified TPI guide that best matches your question:</p>' +
      '<div class="hc-mystic-result"><strong>' + escapeHtml(article.title) + '</strong><p>' + escapeHtml(firstAnswer(article)) + '</p><a href="' + articleUrl(article.id) + '">Open the full guide <span aria-hidden="true">›</span></a></div>' +
      '<p>If that does not answer it, tell me what you were trying to do and what you saw.</p>';
  }

  function sourceResultMessage(match) {
    var source = match.source;
    return '<p>Here is a verified public TPI source that best matches your question:</p>' +
      '<div class="hc-mystic-result"><strong>' + escapeHtml(source.title) + '</strong><p class="hc-mystic-result-kind">' + escapeHtml(source.kind) + '</p><p>' + escapeHtml(source.summary) + '</p><a href="' + escapeHtml(source.url) + '">Open the source <span aria-hidden="true">›</span></a></div>' +
      '<p>Mystic will stay grounded in the published source and will not present an unverified claim as fact.</p>';
  }

  function directAnswerMessage(match) {
    var answer = match.answer;
    var source = publicSources().find(function (item) { return item.id === answer.sourceId; });
    if (!source) return "";
    return '<p>Here is a verified public TPI answer:</p>' +
      '<div class="hc-mystic-result"><strong>' + escapeHtml(answer.title) + '</strong><p>' + escapeHtml(answer.answer) + '</p><a href="' + escapeHtml(source.url) + '">Open the full source: ' + escapeHtml(source.title) + ' <span aria-hidden="true">›</span></a></div>' +
      '<p>Mystic will separate a reported experience from a proven conclusion.</p>';
  }

  function aiResultMessage(result) {
    var answer = escapeHtml(result.answer || "").replace(/\r?\n/g, "<br>");
    var sources = Array.isArray(result.sources) ? result.sources : [];
    var sourceMarkup = sources.length ? '<p><strong>Public TPI sources</strong></p><ul>' + sources.map(function (source) {
      return '<li><a href="' + escapeHtml(source.url) + '">' + escapeHtml(source.title) + '</a></li>';
    }).join("") + '</ul>' : "";
    return '<p>Here is what I found in TPI’s verified public knowledge base:</p>' +
      '<div class="hc-mystic-result"><p>' + answer + '</p>' + sourceMarkup + '</div>' +
      '<p>If that does not answer it, tell me what you were trying to do and what you saw.</p>';
  }

  function findDirectAnswer(query) {
    var normalizedQuery = normalize(query);
    return publicAnswers().map(function (answer) {
      var score = (answer.patterns || []).some(function (pattern) {
        return normalizedQuery.indexOf(normalize(pattern)) >= 0;
      }) ? 1 : 0;
      return { answer: answer, score: score };
    }).filter(function (match) { return match.score > 0; }).sort(function (left, right) {
      return right.score - left.score;
    })[0] || null;
  }

  function findSourceMatches(query) {
    var normalizedQuery = normalize(query);
    var queryTokens = tokens(query);
    return publicSources().map(function (source) {
      var title = normalize(source.title);
      var summary = normalize(source.summary);
      var keywords = normalize((source.keywords || []).join(" "));
      var score = 0;
      if (normalizedQuery && title.indexOf(normalizedQuery) >= 0) score += 18;
      if (normalizedQuery && summary.indexOf(normalizedQuery) >= 0) score += 9;
      queryTokens.forEach(function (token) {
        if (title.indexOf(token) >= 0) score += 7;
        if (keywords.indexOf(token) >= 0) score += 5;
        if (summary.indexOf(token) >= 0) score += 2;
      });
      return { source: source, score: score };
    }).filter(function (match) { return match.score > 0; }).sort(function (left, right) {
      return right.score - left.score;
    });
  }

  function isGreeting(query) {
    return /^(hi|hello|hey|good morning|good afternoon|good evening|help)$/i.test(String(query || "").trim());
  }

  function specialAnswer(query) {
    var normalized = normalize(query);
    if (isGreeting(query)) return '<p>Mystic is standing by. I can help you find a verified member Help Center answer.</p><p>Tell me what you are trying to do, such as updating your profile, sending a message, finding a notification, or reporting a problem.</p>';
    if (/(administration center|admin center|help desk|moderator tools|ban someone|staff role)/.test(normalized)) {
      return '<p>The member Help Center does not provide internal administrative procedures. Those instructions belong to the protected Help Desk inside the Administration Center and are available only to authorized staff.</p><p>For a member-facing access question, open <a href="help-center-contact.html">member support</a>.</p>';
    }
    if (/(bug|broken|not working|error|failed to load|doesn.t work)/.test(normalized)) {
      return '<p>That sounds like a bug or a feature that is not working as expected. Please include the page, what you tried, what you expected, and what happened.</p><p><a href="bug-report.html">Open Report a bug</a>. Your report is submitted to the protected Administration Center for review. Never include a password, recovery code, session cookie, or other secret.</p>';
    }
    if (/(password|recovery code|session cookie|api token|secret|credential)/.test(normalized) && /(send|share|give|tell|post|include)/.test(normalized)) {
      return '<p>Please do not share passwords, recovery codes, session cookies, API tokens, or other secrets in chat or support requests.</p><p>Use the <a href="help-center-article.html?id=login-recovery-security">login, recovery, and security guide</a> for the safe next step.</p>';
    }
    return "";
  }

  function mount() {
    if (document.getElementById(ROOT_ID)) return;
    var root = document.createElement("div");
    root.id = ROOT_ID;
    root.className = "hc-mystic";
    root.innerHTML =
      '<button class="hc-mystic-launcher" type="button" data-mystic-toggle aria-expanded="false" aria-controls="hc-mystic-panel"><span class="hc-mystic-spark" aria-hidden="true"><img src="assets/mystic-ghost.png" alt=""></span><span>Ask Mystic</span></button>' +
      '<section class="hc-mystic-panel" id="hc-mystic-panel" role="dialog" aria-labelledby="hc-mystic-title" aria-modal="false" hidden>' +
        '<header class="hc-mystic-header"><div><p class="hc-mystic-kicker">TPI Help Center</p><h2 id="hc-mystic-title">Ask Mystic</h2></div><button class="hc-mystic-close" type="button" data-mystic-close aria-label="Close Mystic">×</button></header>' +
        '<div class="hc-mystic-intro"><span class="hc-mystic-avatar" aria-hidden="true"><img src="assets/mystic-ghost.png" alt=""></span><p>Hi! I’m Mystic — TPI’s Spirit Guide, Researcher, and Shadow Seeker. Ask me about TPI, the community, Help Center guidance, or a problem you need to report.</p></div>' +
        '<div class="hc-mystic-messages" data-mystic-messages aria-live="polite"></div>' +
        '<div class="hc-mystic-quick" data-mystic-quick aria-label="Suggested questions"><button type="button" data-mystic-prompt="How do I update my profile?">Update my profile</button><button type="button" data-mystic-prompt="How do I send a message?">Messaging</button><button type="button" data-mystic-prompt="I need to report a bug">Report a bug</button></div>' +
        '<form class="hc-mystic-form" data-mystic-form><input name="question" type="text" maxlength="240" autocomplete="off" placeholder="Ask about using TPI…" aria-label="Ask Mystic a question"><button type="submit">Ask</button></form>' +
      '<p class="hc-mystic-note">Grounded in TPI’s public member guidance. Mystic will say when a verified answer is not available.</p>' +
      '</section>';
    document.body.appendChild(root);

    var toggle = root.querySelector("[data-mystic-toggle]");
    var close = root.querySelector("[data-mystic-close]");
    var panel = root.querySelector("[data-mystic-panel]") || root.querySelector(".hc-mystic-panel");
    var messages = root.querySelector("[data-mystic-messages]");
    var form = root.querySelector("[data-mystic-form]");
    var input = form.querySelector("input");

    function setOpen(open) {
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      if (open) input.focus();
    }

    function addMessage(markup, kind) {
      var message = document.createElement("div");
      message.className = "hc-mystic-message " + (kind === "user" ? "is-user" : "is-mystic");
      message.innerHTML = markup;
      messages.appendChild(message);
      messages.scrollTop = messages.scrollHeight;
      return message;
    }

    function localAnswer(query) {
      var special = specialAnswer(query);
      if (special) return special;
      var direct = findDirectAnswer(query);
      if (direct) return directAnswerMessage(direct);
      var matches = findMatches(query);
      if (matches.length && matches[0].score >= 4) return resultMessage(matches[0]);
      var sourceMatches = findSourceMatches(query);
      if (sourceMatches.length && sourceMatches[0].score >= 5) return sourceResultMessage(sourceMatches[0]);
      return '<p>I don’t have a verified member Help Center answer for that yet.</p><p>Try a shorter question, search the <a href="help-center-search.html">full Help Center</a>, or <a href="help-center-contact.html">contact member support</a> with the page, steps, expected result, and what happened.</p>';
    }

    async function ask(query) {
      var clean = String(query || "").trim();
      if (!clean) return;
      addMessage("<p>" + escapeHtml(clean) + "</p>", "user");
      var special = specialAnswer(clean);
      var direct = findDirectAnswer(clean);
      if (special || direct) {
        addMessage(special || directAnswerMessage(direct), "mystic");
        input.value = "";
        return;
      }
      var matches = findMatches(clean);
      if (matches.length && matches[0].score >= 4) {
        addMessage(resultMessage(matches[0]), "mystic");
        input.value = "";
        return;
      }
      var sourceMatches = findSourceMatches(clean);
      if (sourceMatches.length && sourceMatches[0].score >= 5) {
        addMessage(sourceResultMessage(sourceMatches[0]), "mystic");
        input.value = "";
        return;
      }
      var loading = addMessage("<p>Mystic is searching TPI’s public knowledge base…</p>", "mystic");
      try {
        var response = await fetch("/api/mystic/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: clean })
        });
        var result = await response.json();
        if (loading && loading.parentNode) loading.parentNode.removeChild(loading);
        addMessage(result && result.ok && result.answer ? aiResultMessage(result) : localAnswer(clean), "mystic");
      } catch (error) {
        if (loading && loading.parentNode) loading.parentNode.removeChild(loading);
        addMessage(localAnswer(clean), "mystic");
      }
      input.value = "";
    }

    toggle.addEventListener("click", function () { setOpen(panel.hidden); });
    close.addEventListener("click", function () { setOpen(false); });
    root.querySelectorAll("[data-mystic-prompt]").forEach(function (button) {
      button.addEventListener("click", function () { ask(button.dataset.mysticPrompt); });
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      ask(input.value);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) setOpen(false);
    });
  }

  window.TPIMysticHelpCenter = { mount: mount };
})();
