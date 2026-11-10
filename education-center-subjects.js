// Education Center contributor index. Static legacy shelves remain intact;
// this index adds the live published article layer to every editor subject.
(function () {
  const subjects = window.TPI_EDUCATION_SUBJECTS || [];
  const directoryHost = document.getElementById("tpi-education-subject-directory");
  const host = document.getElementById("tpi-contributor-subject-index");
  if (!subjects.length || (!directoryHost && !host)) return;

  const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]));

  function articleHref(article) {
    const href = String(article.href || `published-article.html?id=${encodeURIComponent(article.id)}`);
    return window.preserveMemberMode ? window.preserveMemberMode(href) : href;
  }

  function subjectHref(value) {
    const path = String(value || "").replace(/^\/+/, "").replace(/\.html$/, "");
    const href = `/${path}`;
    return window.preserveMemberMode ? window.preserveMemberMode(href) : href;
  }

  function renderDirectory() {
    if (!directoryHost) return;
    directoryHost.innerHTML = `<div class="tpi-education-directory-grid">${subjects.map((subject) => `<a class="tpi-education-directory-card" data-subject="${escapeHtml(subject.value)}" href="${escapeHtml(subjectHref(subject.value))}"><span class="category-badge category-badge-education">Subject area</span><h3>${escapeHtml(subject.label)}</h3><p>${escapeHtml(subject.description)}</p><span class="dashboard-panel-cta">Open subject ›</span></a>`).join("")}</div>`;
    directoryHost.dataset.loaded = "true";
  }

  function render(groups) {
    host.innerHTML = `
      <section class="home-section tpi-contributor-publications" aria-labelledby="tpi-contributor-publications-title">
        <p class="portal-kicker">Contributor Publications</p>
        <h2 id="tpi-contributor-publications-title">Published work by subject area.</h2>
        <p class="tpi-subject-index-intro">Published research papers, field articles, notes, and media are listed under the same subjects contributors choose in the Editorial Workspace.</p>
        <div class="tpi-subject-index-grid">
          ${subjects.map((subject) => {
            const rows = groups.get(subject.value) || [];
            const legacy = subject.value === "evp-itc-lessons.html"
              ? `<a class="edu-article-card tpi-legacy-card" href="evp-itc-lesson-water-steam.html"><h4>Water &amp; Steam ITC</h4><p>Legacy reference material for water, steam, and reflective-surface experimentation.</p><div class="edu-article-meta"><span class="edu-article-tag">Legacy reference</span></div></a>`
              : "";
            return `<article class="tpi-subject-index-group" data-subject="${escapeHtml(subject.value)}">
              <div class="tpi-subject-index-heading"><div><span class="category-badge category-badge-education">Subject area</span><h3>${escapeHtml(subject.label)}</h3><p>${escapeHtml(subject.description)}</p></div><a class="dashboard-panel-cta" href="${escapeHtml(subjectHref(subject.value))}">Open subject ›</a></div>
              <div class="edu-accordion-grid">${rows.length ? rows.map((article) => `<a class="edu-article-card tpi-published-card" href="${escapeHtml(articleHref(article))}"><h4>${escapeHtml(article.title)}</h4>${article.subtitle ? `<p>${escapeHtml(article.subtitle)}</p>` : ""}<div class="edu-article-meta"><span class="edu-article-tag">${escapeHtml(article.contributionType || "Published Article")}</span>${article.authorDisplayName ? `<span>${escapeHtml(article.authorDisplayName)}</span>` : ""}</div></a>`).join("") : legacy || `<div class="tpi-subject-empty">No published contributor work is available in this subject yet.</div>`}</div>
            </article>`;
          }).join("")}
        </div>
      </section>`;
  }

  async function load() {
    renderDirectory();
    if (!host) return;
    try {
      const response = await fetch("/api/articles?page=1&pageSize=100", { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error(`Article index request failed (${response.status})`);
      const payload = await response.json();
      const groups = new Map(subjects.map((subject) => [subject.value, []]));
      (payload.articles || []).forEach((article) => {
        const destination = String(article.destination || "");
        const normalized = destination.endsWith(".html") ? destination : `${destination}.html`;
        if (!groups.has(normalized)) return;
        groups.get(normalized).push(article);
      });
      render(groups);
      host.dataset.loaded = "true";
    } catch (error) {
      host.innerHTML = `<section class="home-section"><p class="portal-kicker">Contributor Publications</p><h2>Published work by subject area.</h2><p class="notice-panel">The public publication index is temporarily unavailable. Static research shelves remain available.</p></section>`;
      host.dataset.error = error instanceof Error ? error.message : "unavailable";
    }
  }

  load();
})();
