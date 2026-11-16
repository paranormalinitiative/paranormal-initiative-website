(function () {
  "use strict";

  var app = document.getElementById("help-center-app");
  var INTERNAL = Boolean((app && app.dataset.hcAudience === "internal") || (document.body && document.body.dataset.tpiAssistantAudience === "internal"));
  var ROOT_ID = "tpi-nova-help-center";
  var DATA = INTERNAL ? window.TPI_INTERNAL_HELP_CENTER : window.TPI_HELP_CENTER;
  var STOP_WORDS = { a: 1, an: 1, and: 1, are: 1, can: 1, do: 1, for: 1, how: 1, i: 1, in: 1, is: 1, it: 1, me: 1, my: 1, of: 1, on: 1, please: 1, the: 1, to: 1, what: 1, when: 1, where: 1, why: 1, with: 1, you: 1, your: 1 };
  var ALIASES = [
    { terms: ["profile", "avatar", "background", "bio"], ids: ["manage-profile-theme", "profile-basics"] },
    { terms: ["notification", "comment notification"], ids: ["notifications-and-activity", "community-feed-notifications"] },
    { terms: ["message", "messenger", "chat", "dm"], ids: ["messaging-in-tpi", "community-feed-messenger"] },
    { terms: ["video", "youtube", "mp4", "external link", "preview"], ids: ["videos-and-external-links", "external-link-previews"] },
    { terms: ["studioflow", "creator studio", "nova editorial", "app"], ids: ["tpi-apps-overview", "studioflow-member-guide", "nova-editorial-workspace"] },
    { terms: ["policy", "privacy", "safety", "report", "abuse", "bug"], ids: ["privacy-and-safety", "policies-and-community-standards", "report-bug-community-issue", "report-abuse-and-appeal"] },
    { terms: ["admin", "administration", "moderator", "ban", "release", "deployment"], ids: ["administration-center-overview", "block-or-restore-member", "protected-applications-and-release-boundaries"] }
  ];

  function escapeHtml(value) { return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
  function normalize(value) { return String(value || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim(); }
  function tokens(value) { return normalize(value).split(" ").filter(function (token) { return token.length > 1 && !STOP_WORDS[token]; }); }
  function articleText(article) { return [article.title, article.excerpt].concat((article.body || []).map(function (block) { return block.text || (block.items || []).join(" "); })).join(" "); }
  function articles() { return DATA && Array.isArray(DATA.articles) ? DATA.articles : []; }
  function articleUrl(id) { return (INTERNAL ? "/internal-help-center-article.html" : "/help-center-article.html") + "?id=" + encodeURIComponent(id); }
  function findMatches(query) {
    var normalizedQuery = normalize(query), queryTokens = tokens(query), aliasIds = [];
    ALIASES.forEach(function (alias) { if (alias.terms.some(function (term) { return normalizedQuery.indexOf(normalize(term)) >= 0; })) aliasIds = aliasIds.concat(alias.ids); });
    return articles().map(function (article) {
      var title = normalize(article.title), excerpt = normalize(article.excerpt), body = normalize(articleText(article));
      var score = aliasIds.indexOf(article.id) >= 0 ? 14 : 0;
      if (normalizedQuery && title.indexOf(normalizedQuery) >= 0) score += 18;
      if (normalizedQuery && excerpt.indexOf(normalizedQuery) >= 0) score += 9;
      queryTokens.forEach(function (token) { if (title.indexOf(token) >= 0) score += 7; if (excerpt.indexOf(token) >= 0) score += 3; if (body.indexOf(token) >= 0) score += 1; });
      return { article: article, score: score };
    }).filter(function (match) { return match.score > 0; }).sort(function (a, b) { return b.score - a.score; });
  }
  function firstAnswer(article) { var block = (article.body || []).find(function (item) { return item.type === "p" && item.text; }); var answer = block ? block.text : article.excerpt; return answer.length > 360 ? answer.slice(0, 357).replace(/\s+\S*$/, "") + "…" : answer; }
  function localMessage(match) { var article = match.article; return '<p>Here is the verified TPI guide that best matches your question:</p><div class="hc-nova-result"><strong>' + escapeHtml(article.title) + '</strong><p>' + escapeHtml(firstAnswer(article)) + '</p><a href="' + articleUrl(article.id) + '">Open the full guide <span aria-hidden="true">›</span></a></div><p>If that does not answer it, tell me what you were trying to do and what you saw.</p>'; }
  function remoteMessage(result) { var answer = escapeHtml(result.answer || "").replace(/\r?\n/g, "<br>"); var sources = Array.isArray(result.sources) ? result.sources : []; var sourceMarkup = sources.length ? '<p><strong>Approved TPI sources</strong></p><ul>' + sources.map(function (source) { return '<li>' + escapeHtml(source.title || source.sourceKey || "TPI source") + '</li>'; }).join("") + '</ul>' : ""; return '<p>Here is what I found in TPI’s approved knowledge base:</p><div class="hc-nova-result"><p>' + answer + '</p>' + sourceMarkup + '</div><p>If the documented procedure does not fit what you see, record the route, time, browser, and visible result and use the ' + (INTERNAL ? '<a href="/internal-help-center-contact.html">internal request path</a>' : '<a href="/help-center-contact.html">member support path</a>') + '.</p>'; }
  function specialAnswer(query) {
    var normalized = normalize(query);
    if (/^(hi|hello|hey|help)$/.test(normalized)) return '<p>Hi! I’m Nova, TPI’s Everything Assistant. I can help you use the site, find a guide, understand a policy, or locate an internal procedure when your account is authorized.</p>';
    if (!INTERNAL && /(ban|administration center|admin center|help desk|moderator tools|staff role|internal procedure)/.test(normalized)) return '<p>That is protected internal guidance. Authorized staff can use Nova inside the protected Help Desk in the Administration Center.</p><p>For a member-facing problem, use <a href="/help-center-contact.html">member support</a>.</p>';
    if (INTERNAL && /(password|recovery code|session cookie|api token|secret|stream key)/.test(normalized)) return '<p>Never place credentials, recovery codes, session cookies, API tokens, stream keys, or other secrets in Nova or the Help Desk. Use the approved secure escalation path.</p>';
    if (/(ghost|haunting|paranormal|evp|itc|apparition|cryptid)/.test(normalized)) return '<p>Mystic is TPI’s paranormal research assistant. Ask Mystic for paranormal concepts, Ghostology, haunted locations, and research material; I will stay focused on how TPI works.</p><p><a href="/help-center.html#assistants">Open the public Help Center</a> and choose Ask Mystic.</p>';
    return "";
  }
  function mount() {
    if (!DATA || document.getElementById(ROOT_ID)) return;
    var root = document.createElement("div"); root.id = ROOT_ID; root.className = "hc-nova";
    var intro = INTERNAL
      ? "Hi! I’m Nova — TPI’s internal Help Desk Assistant. I explain approved Administration Center, moderation, policy, security, and operational procedures for authorized staff."
      : "Hi! I’m Nova — TPI’s TPI Help Center Assistant. I explain how TPI works, where to find something, and the documented next step. For paranormal research, ask Mystic.";
    var quick = INTERNAL
      ? '<button type="button" data-nova-prompt="How do I use the Administration Center?">Admin Center</button><button type="button" data-nova-prompt="How do I review a report?">Reports</button><button type="button" data-nova-prompt="How do I protect member data?">Security</button>'
      : '<button type="button" data-nova-prompt="How do I update my profile?">Profile</button><button type="button" data-nova-prompt="How does Messenger work?">Messenger</button><button type="button" data-nova-prompt="Where do I report a bug?">Report a bug</button>';
    var note = INTERNAL
      ? "Protected Help Desk guidance. Nova explains approved procedures but cannot grant access, change roles, ban members, delete data, inspect private messages, or deploy releases."
      : "TPI Help Center guidance only. Nova handles TPI, accounts, community, apps, policies, and support. Ask Mystic for paranormal research.";
    var alternate = INTERNAL
      ? '<a class="hc-nova-identity-link" href="/help-center.html#assistants">Need paranormal research? Open Mystic in the public Help Center.</a>'
      : '<a class="hc-nova-identity-link" href="/help-center.html#assistants">Need paranormal research? Ask Mystic. Need TPI help? You are in the right place.</a>';
    root.innerHTML = '<button class="hc-nova-launcher" type="button" data-nova-toggle aria-expanded="false" aria-controls="hc-nova-panel"><span class="hc-nova-spark" aria-hidden="true">✦</span><span>Ask Nova <small>· TPI Help</small></span></button><section class="hc-nova-panel" id="hc-nova-panel" role="dialog" aria-labelledby="hc-nova-title" aria-modal="false" hidden><header class="hc-nova-header"><div><p class="hc-nova-kicker">TPI ' + (INTERNAL ? 'Help Desk' : 'Help Center') + '</p><h2 id="hc-nova-title">Nova</h2><span class="hc-nova-role">' + (INTERNAL ? 'Internal operations assistant' : 'TPI everything assistant') + '</span></div><button class="hc-nova-close" type="button" data-nova-close aria-label="Close Nova">×</button></header><div class="hc-nova-intro"><span class="hc-nova-avatar" aria-hidden="true">N</span><p>' + intro + '</p></div><div class="hc-nova-messages" data-nova-messages aria-live="polite"></div><div class="hc-nova-quick" aria-label="Suggested questions">' + quick + '</div><form class="hc-nova-form" data-nova-form><input name="question" type="text" maxlength="240" autocomplete="off" placeholder="Ask Nova about TPI…" aria-label="Ask Nova about TPI"><button type="submit">Ask</button></form><p class="hc-nova-note">' + note + '</p><div class="hc-nova-alternate">' + alternate + '</div></section>';
    document.body.appendChild(root);
    var toggle = root.querySelector("[data-nova-toggle]"), close = root.querySelector("[data-nova-close]"), panel = root.querySelector(".hc-nova-panel"), messages = root.querySelector("[data-nova-messages]"), form = root.querySelector("[data-nova-form]"), input = form.querySelector("input");
    function setOpen(open) { panel.hidden = !open; toggle.setAttribute("aria-expanded", String(open)); if (open) input.focus(); }
    function addMessage(markup, kind) { var message = document.createElement("div"); message.className = "hc-nova-message " + (kind === "user" ? "is-user" : "is-nova"); message.innerHTML = markup; messages.appendChild(message); messages.scrollTop = messages.scrollHeight; return message; }
    async function ask(query) {
      var clean = String(query || "").trim(); if (!clean) return; addMessage("<p>" + escapeHtml(clean) + "</p>", "user");
      var special = specialAnswer(clean); if (special) { addMessage(special, "nova"); input.value = ""; return; }
      var matches = findMatches(clean); if (matches.length && matches[0].score >= 4) { addMessage(localMessage(matches[0]), "nova"); input.value = ""; return; }
      var loading = addMessage("<p>Nova is checking TPI’s approved knowledge base…</p>", "nova");
      try { var response = await fetch("/api/nova/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: clean, audience: INTERNAL ? "internal" : "public" }) }); var result = await response.json(); if (loading && loading.parentNode) loading.parentNode.removeChild(loading); addMessage(result && result.ok && result.answer ? remoteMessage(result) : '<p>I don’t have a verified ' + (INTERNAL ? 'internal' : 'public') + ' answer for that yet.</p><p>Try a shorter question or use the ' + (INTERNAL ? '<a href="/internal-help-center-search.html">full Help Desk</a>' : '<a href="/help-center-search.html">full Help Center</a>') + '.</p>', "nova"); } catch (error) { if (loading && loading.parentNode) loading.parentNode.removeChild(loading); addMessage('<p>I could not reach the approved knowledge service right now.</p><p>Use the ' + (INTERNAL ? '<a href="/internal-help-center-contact.html">internal request path</a>' : '<a href="/help-center-contact.html">member support path</a>') + ' and include what you were trying to do.</p>', "nova"); }
      input.value = "";
    }
    toggle.addEventListener("click", function () { setOpen(panel.hidden); }); close.addEventListener("click", function () { setOpen(false); }); root.querySelectorAll("[data-nova-prompt]").forEach(function (button) { button.addEventListener("click", function () { ask(button.dataset.novaPrompt); }); }); form.addEventListener("submit", function (event) { event.preventDefault(); ask(input.value); }); document.addEventListener("keydown", function (event) { if (event.key === "Escape" && !panel.hidden) setOpen(false); });
  }
  window.TPINovaHelpCenter = { mount: mount };
  if (app) mount();
})();
