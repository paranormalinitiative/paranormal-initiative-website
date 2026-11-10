// Education Center subject shelves. Every catalog destination is represented
// by one compact shelf, with only its assigned subject work inside.
(function () {
  const subjects = window.TPI_EDUCATION_SUBJECTS || [];
  const host = document.getElementById("tpi-education-subject-directory");
  if (!host || !subjects.length) return;

  const subjectIcons = {
    "education-area-investigation-science.html": "🔍",
    "education-area-evidence-science-analysis.html": "📋",
    "education-area-instrumentation-technology.html": "🧰",
    "education-area-environmental-research.html": "🌡️",
    "education-area-evp-itc-research.html": "🎙️",
    "education-area-consciousness-human-experience.html": "🧠",
    "education-area-ethics-professional-standards.html": "⚖️",
    "education-area-reporting-documentation.html": "📝",
    "education-area-education-community-development.html": "🤝",
    "education-area-technology-development-ai.html": "💻",
    "education-area-artificial-intelligence.html": "✨",
    "education-area-historical-cultural-research.html": "📚",
    "investigation-development-series.html": "🧭",
    "ghostology-101.html": "👻",
    "evp-itc-lessons.html": "📻",
    "field-articles.html": "🗂️",
    "method-exercises.html": "🧪",
    "tpi-videos.html": "🎬",
  };

  const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]));

  function subjectHref(value) {
    const path = String(value || "").replace(/^\/+/, "").replace(/\.html$/, "");
    const href = `/${path}`;
    return window.preserveMemberMode ? window.preserveMemberMode(href) : href;
  }

  function articleHref(article) {
    const href = String(article.href || `published-article.html?id=${encodeURIComponent(article.id)}`);
    return window.preserveMemberMode ? window.preserveMemberMode(href) : href;
  }

  function normalizedTitle(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  async function loadPublishedGroups() {
    const groups = new Map(subjects.map((subject) => [subject.value, []]));
    try {
      const response = await fetch("/api/articles?page=1&pageSize=100", { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error(`Article index request failed (${response.status})`);
      const payload = await response.json();
      (payload.articles || []).forEach((article) => {
        const destination = String(article.destination || "");
        const normalized = destination.endsWith(".html") ? destination : `${destination}.html`;
        if (groups.has(normalized)) groups.get(normalized).push({
          href: articleHref(article),
          title: article.title,
          subtitle: article.subtitle || "",
          contributionType: article.contributionType || "Published article",
          authorDisplayName: article.authorDisplayName || "",
        });
      });
    } catch (error) {
      host.dataset.apiError = error instanceof Error ? error.message : "unavailable";
    }
    return groups;
  }

  function subjectResources(subject, publishedResources) {
    const resources = [{
      href: subjectHref(subject.value),
      title: `${subject.label} overview`,
      subtitle: subject.description,
      contributionType: "Subject guide",
      subjectOverview: true,
    }];
    const seenTitles = new Set([normalizedTitle(resources[0].title)]);
    if (subject.value === "evp-itc-lessons.html") {
      publishedResources = [...(publishedResources || []), {
        href: "/evp-itc-lesson-water-steam",
        title: "Water & Steam ITC",
        subtitle: "Experimental visual ITC approaches using water, steam, light, and careful controls.",
        contributionType: "Experiment note",
      }];
    }
    (publishedResources || []).forEach((resource) => {
      const key = normalizedTitle(resource.title);
      if (!key || seenTitles.has(key)) return;
      seenTitles.add(key);
      resources.push(resource);
    });
    return resources;
  }

  function render(publishedGroups) {
    const shelves = subjects.map((subject, index) => {
      const resources = subjectResources(subject, publishedGroups.get(subject.value));
      const shelfId = `tpi-education-shelf-${index}`;
      const articleLabel = resources.length === 1 ? "article" : "articles";
      return `<article class="edu-accordion-item" data-subject="${escapeHtml(subject.value)}">
        <button type="button" class="edu-accordion-header" data-accordion-toggle aria-expanded="false" aria-controls="${shelfId}">
          <span class="edu-accordion-header-left">
            <span class="edu-accordion-icon" aria-hidden="true">${subjectIcons[subject.value] || "📖"}</span>
            <span>
              <span class="edu-accordion-title">${escapeHtml(subject.label)}</span>
              <span class="edu-accordion-description">${escapeHtml(subject.description)}</span>
            </span>
          </span>
          <span class="edu-accordion-count">${resources.length} ${articleLabel}</span>
          <span class="edu-accordion-arrow" aria-hidden="true">▼</span>
        </button>
        <div class="edu-accordion-content" id="${shelfId}" role="region" aria-label="${escapeHtml(subject.label)} articles">
          <div class="edu-accordion-grid">
            ${resources.map((resource) => `<a class="edu-article-card" data-subject-overview="${resource.subjectOverview ? "true" : "false"}" href="${escapeHtml(resource.href)}">
              <h4>${escapeHtml(resource.title)}</h4>
              ${resource.subtitle ? `<p>${escapeHtml(resource.subtitle)}</p>` : ""}
              <div class="edu-article-meta"><span class="edu-article-tag">${escapeHtml(resource.contributionType || "Education Center")}</span><span class="edu-article-subject">${escapeHtml(subject.label)}</span>${resource.authorDisplayName ? `<span>${escapeHtml(resource.authorDisplayName)}</span>` : ""}</div>
            </a>`).join("")}
          </div>
        </div>
      </article>`;
    }).join("");

    host.innerHTML = `<div class="edu-accordion">${shelves}</div>`;
    host.dataset.loaded = "true";
    host.querySelectorAll("[data-accordion-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.closest(".edu-accordion-item");
        const isOpen = item.classList.contains("is-open");
        host.querySelectorAll(".edu-accordion-item").forEach((other) => {
          other.classList.remove("is-open");
          other.querySelector("[data-accordion-toggle]")?.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  async function load() {
    const publishedGroups = await loadPublishedGroups();
    render(publishedGroups);
  }

  load();
})();
