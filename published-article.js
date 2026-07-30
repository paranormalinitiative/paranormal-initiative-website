(async function () {
  const root = document.getElementById("published-article-root");
  if (!root) return;

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function getPublishedArticles() {
    try {
      return JSON.parse(localStorage.getItem("tpiPublishedArticles") || "[]");
    } catch (error) {
      return [];
    }
  }

  async function getCloudflareArticle(id) {
    if (!window.TPIApi) return null;
    try {
      const data = await window.TPIApi.listArticles();
      return (data.articles || []).find(item => item.id === id) || null;
    } catch (error) {
      return null;
    }
  }

  function renderAuthorMeta(article, contributionType) {
    const parts = [];
    if (article.author) {
      const author = article.authorUsername
        ? `<a href="contributor-profile.html?username=${encodeURIComponent(article.authorUsername)}">${escapeHtml(article.author)}</a>`
        : escapeHtml(article.author);
      parts.push(author);
    }
    [contributionType, article.destinationLabel, article.source, article.labels].filter(Boolean).forEach(value => {
      parts.push(escapeHtml(value));
    });
    return parts.join(" · ");
  }

  const id = new URLSearchParams(window.location.search).get("id");
  const article = await getCloudflareArticle(id) || getPublishedArticles().find(item => item.id === id);
  if (!article) {
    root.innerHTML = `
      <article class="lesson-reading-block paper-single-textbox">
        <p class="portal-kicker">Research Library</p>
        <h2>Article Not Found</h2>
        <p class="access-note">This published article could not be found. It may still be deploying, may have been saved as a draft, or the shared link may point to an older article id.</p>
      </article>
      <section class="lesson-navigation-band">
        <a class="portal-button" href="education-center.html">Back to Education Center</a>
      </section>
    `;
    return;
  }

  const contributionType = article.contributionType || article.articleType || "Research Paper";
  document.body.dataset.articleAuthorUsername = article.authorUsername || "";
  document.body.dataset.articleAuthorName = article.author || article.authorDisplayName || "";
  document.title = `${article.title} | The Paranormal Initiative`;
  root.innerHTML = `
    <article class="lesson-reading-block paper-single-textbox">
      <p class="portal-kicker">Research Library · ${escapeHtml(contributionType)}</p>
      <h2>${escapeHtml(article.title)}</h2>
      ${article.subtitle ? `<p class="paper-preview-subtitle">${escapeHtml(article.subtitle)}</p>` : ""}
      <p class="paper-preview-meta">${renderAuthorMeta(article, contributionType)}</p>
      <div class="lesson-reading-copy">${article.bodyHtml || ""}</div>
    </article>
    <section class="lesson-navigation-band">
      <a class="portal-button" href="${escapeHtml(article.destination)}">Back to ${escapeHtml(article.destinationLabel || "Research Library")}</a>
    </section>
  `;
  window.dispatchEvent(new CustomEvent("tpi:article-ready", { detail: { article } }));
})();
