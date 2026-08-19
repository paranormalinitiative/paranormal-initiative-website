(async function () {
  const form = document.querySelector("[data-site-search-page-form]");
  const input = document.querySelector("[data-site-search-page-input]");
  const resultsHost = document.querySelector("[data-site-search-results]");
  const summary = document.querySelector("[data-site-search-summary]");
  if (!form || !input || !resultsHost) return;

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  input.value = initialQuery;

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9\s/]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function makeSnippet(text, terms) {
    const plain = String(text || "").replace(/\s+/g, " ").trim();
    const lowered = plain.toLowerCase();
    const index = terms.map(term => lowered.indexOf(term)).filter(value => value >= 0).sort((a, b) => a - b)[0] || 0;
    const start = Math.max(0, index - 90);
    const snippet = plain.slice(start, start + 240);
    return `${start > 0 ? "..." : ""}${snippet}${start + 240 < plain.length ? "..." : ""}`;
  }

  async function getPublishedArticles() {
    const articles = [];
    try {
      const local = JSON.parse(localStorage.getItem("tpiPublishedArticles") || "[]");
      articles.push(...local.filter(article => article.status === "published"));
    } catch (error) {
      // Ignore malformed local preview state.
    }

    try {
      const response = await fetch("/api/articles", { credentials: "same-origin", cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        articles.push(...(data.articles || []));
      }
    } catch (error) {
      // Static/local previews do not always have the Cloudflare API.
    }

    const seen = new Set();
    return articles.filter(article => {
      const key = article.id || article.href || article.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map(article => ({
      title: article.title || "Untitled Contribution",
      subtitle: [article.contributionType || article.articleType, article.destinationLabel].filter(Boolean).join(" · "),
      href: window.preserveMemberMode ? window.preserveMemberMode(article.href || `published-article.html?id=${encodeURIComponent(article.id)}`) : (article.href || `published-article.html?id=${encodeURIComponent(article.id)}`),
      description: article.subtitle || article.source || "Published contributor article.",
      text: [
        article.title,
        article.subtitle,
        article.contributionType || article.articleType,
        article.author,
        article.authorDisplayName,
        article.authorUsername,
        article.source,
        article.labels,
        article.bodyHtml
      ].filter(Boolean).join(" ")
    }));
  }

  async function getPublicProfiles() {
    try {
      const response = await fetch("/api/contributors", { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) return [];
      const data = await response.json();
      return (data.contributors || []).map(profile => {
        const displayName = profile.displayName || profile.username || "Contributor";
        return {
          title: displayName,
          subtitle: ["Contributor Profile", profile.title].filter(Boolean).join(" · "),
          href: `contributor-profile.html?username=${encodeURIComponent(profile.username)}`,
          description: profile.bio || profile.affiliation || profile.organization || "Public contributor profile.",
          text: [
            displayName,
            profile.username,
            profile.title,
            profile.role,
            profile.affiliation,
            profile.organization,
            profile.website,
            profile.bio,
            profile.publishedCount ? `${profile.publishedCount} published contribution${profile.publishedCount === 1 ? "" : "s"}` : ""
          ].filter(Boolean).join(" ")
        };
      });
    } catch (error) {
      return [];
    }
  }

  async function getSearchItems() {
    const staticPages = Array.isArray(window.TPI_SEARCH_INDEX) ? window.TPI_SEARCH_INDEX : [];
    const [publishedArticles, publicProfiles] = await Promise.all([
      getPublishedArticles(),
      getPublicProfiles()
    ]);
    return [...staticPages, ...publicProfiles, ...publishedArticles];
  }

  function scoreItem(item, terms, phrase) {
    const title = normalize(item.title);
    const subtitle = normalize(item.subtitle);
    const description = normalize(item.description);
    const text = normalize(item.text);
    let score = 0;

    if (title.includes(phrase)) score += 80;
    if (subtitle.includes(phrase)) score += 40;
    if (description.includes(phrase)) score += 24;
    if (text.includes(phrase)) score += 18;

    terms.forEach(term => {
      if (title.includes(term)) score += 18;
      if (subtitle.includes(term)) score += 10;
      if (description.includes(term)) score += 7;
      if (text.includes(term)) score += 3;
    });

    return score;
  }

  async function runSearch(query) {
    const phrase = normalize(query);
    const terms = phrase.split(/\s+/).filter(term => term.length > 1);
    if (!phrase || !terms.length) {
      summary.textContent = "Enter a word or phrase to search the site.";
      resultsHost.innerHTML = "";
      return;
    }

    const items = await getSearchItems();
    const results = items
      .map(item => ({ ...item, score: scoreItem(item, terms, phrase) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 80);

    summary.textContent = results.length
      ? `${results.length} result${results.length === 1 ? "" : "s"} for "${query}".`
      : `No results found for "${query}".`;

    resultsHost.innerHTML = results.length ? results.map(result => `
      <a class="site-search-result" href="${escapeHtml(result.href)}">
        <span>${escapeHtml(result.subtitle || "The Paranormal Initiative")}</span>
        <h3>${escapeHtml(result.title)}</h3>
        <p>${escapeHtml(makeSnippet(result.text || result.description, terms))}</p>
      </a>
    `).join("") : `
      <div class="dashboard-panel">
        <h3>No Matching Pages Yet</h3>
        <p>Try a broader term such as EVP, ITC, equipment, ethics, evidence, haunting, location, consciousness, or investigation.</p>
      </div>
    `;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const query = input.value.trim();
    const nextUrl = query ? `search.html?q=${encodeURIComponent(query)}` : "search.html";
    window.history.replaceState(null, "", nextUrl);
    runSearch(query);
  });

  runSearch(initialQuery);
})();
