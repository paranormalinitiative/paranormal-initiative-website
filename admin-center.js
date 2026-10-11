(function () {
  "use strict";

  const root = document.querySelector("[data-admin-center]");
  if (!root) return;
  const esc = (value) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  const formatCount = (value) => Number.isFinite(Number(value)) ? Number(value).toLocaleString() : "Unavailable";
  const metricValue = (metrics, path) => path.split(".").reduce((value, key) => value && value[key], metrics);

  function showView(name) {
    root.querySelectorAll("[data-admin-view]").forEach((view) => {
      view.hidden = view.dataset.adminView !== name && !(name === "members" && view.id === "members");
    });
    root.querySelectorAll("[data-admin-nav]").forEach((link) => link.classList.toggle("is-active", link.dataset.adminNav === name));
  }

  function renderAudit(host, logs) {
    if (!host) return;
    host.innerHTML = logs.length ? logs.map((log) => `<div class="admin-audit-item"><strong>${esc(log.action)}</strong><span>${esc(log.createdAt || "")}</span><small>${esc(log.actorUsername || "unknown")} · ${esc(log.targetType || "system")}${log.targetId ? ` · ${esc(log.targetId)}` : ""}</small></div>`).join("") : '<p class="access-note">No administrative actions have been recorded yet.</p>';
  }

  async function load() {
    const [overviewResult, foundingResult, auditResult] = await Promise.allSettled([
      fetch("/api/admin/overview", { credentials: "same-origin" }),
      fetch("/api/admin/founding-50", { credentials: "same-origin" }),
      fetch("/api/admin/audit-logs?limit=8", { credentials: "same-origin" })
    ]);
    if (overviewResult.status === "fulfilled" && overviewResult.value.ok) {
      const data = await overviewResult.value.json();
      root.querySelectorAll("[data-admin-metric]").forEach((node) => node.textContent = formatCount(metricValue(data.metrics || {}, node.dataset.adminMetric)));
      const members = data.metrics?.members || {};
      const note = root.querySelector("[data-admin-metric-note='members']");
      if (note) note.textContent = members.unavailable ? "Source unavailable" : `${formatCount(members.active)} active · ${formatCount(members.inactive)} inactive`;
      const run = data.metrics?.scraperRuns || {};
      const statusHost = root.querySelector("[data-admin-program-status]");
      if (statusHost) statusHost.innerHTML = `<div><strong>Scraper history</strong><span>${run.unavailable ? "Unavailable" : `${formatCount(run.total)} recorded runs`}</span></div><div><strong>Last failure</strong><span>${esc(run.lastFailedAt || "No failure recorded")}</span></div><div><strong>Data source</strong><span>Live D1 counts</span></div>`;
    }
    if (foundingResult.status === "fulfilled" && foundingResult.value.ok) {
      const founding = await foundingResult.value.json();
      const host = root.querySelector("[data-admin-founding-status]");
      if (host) host.innerHTML = `<span class="admin-pill admin-pill-warning">${esc(founding.status === "not_activated" ? "Not activated" : founding.status)}</span><strong>${esc(founding.capacity)} reserved places</strong><span>${esc(founding.note)}</span>`;
    }
    if (auditResult.status === "fulfilled" && auditResult.value.ok) {
      const audit = await auditResult.value.json();
      renderAudit(root.querySelector("[data-admin-audit-preview]"), (audit.logs || []).slice(0, 5));
      renderAudit(root.querySelector("[data-admin-audit-full]"), audit.logs || []);
    }
  }

  root.addEventListener("click", (event) => {
    const link = event.target.closest("[data-admin-nav]");
    if (!link) return;
    const name = link.dataset.adminNav;
    if (!name) return;
    event.preventDefault();
    history.replaceState(null, "", `#${name}`);
    showView(name);
  });
  root.querySelector("[data-admin-refresh]")?.addEventListener("click", load);
  const initial = location.hash.replace(/^#/, "");
  if (initial && root.querySelector(`[data-admin-nav='${CSS.escape(initial)}']`)) showView(initial);
  load();
})();
