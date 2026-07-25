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

  const id = new URLSearchParams(window.location.search).get("id");
  const article = await getCloudflareArticle(id) || getPublishedArticles().find(item => item.id === id);
  if (!article) return;

  document.title = `${article.title} | The Paranormal Initiative`;
  root.innerHTML = `
    <article class="lesson-reading-block paper-single-textbox">
      <p class="portal-kicker">Research Library · Field Paper</p>
      <h2>${escapeHtml(article.title)}</h2>
      ${article.subtitle ? `<p class="paper-preview-subtitle">${escapeHtml(article.subtitle)}</p>` : ""}
      <p class="paper-preview-meta">${[article.author, article.destinationLabel, article.source, article.labels].filter(Boolean).map(escapeHtml).join(" · ")}</p>
      <div class="lesson-reading-copy">${article.bodyHtml || ""}</div>
    </article>
    <section class="lesson-navigation-band">
      <a class="portal-button" href="${escapeHtml(article.destination)}">Back to ${escapeHtml(article.destinationLabel || "Research Library")}</a>
    </section>
  `;
})();
