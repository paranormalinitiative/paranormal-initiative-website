(function () {
  "use strict";

  const root = document.querySelector("[data-admin-center]");
  if (!root) return;
  const esc = (value) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  const formatCount = (value) => Number.isFinite(Number(value)) ? Number(value).toLocaleString() : "Unavailable";
  const metricValue = (metrics, path) => path.split(".").reduce((value, key) => value && value[key], metrics);
  const get = (selector) => root.querySelector(selector);

  function showView(name) {
    root.querySelectorAll("[data-admin-view]").forEach((view) => {
      view.hidden = view.dataset.adminView !== name && !(name === "members" && view.id === "members");
    });
    root.querySelectorAll("[data-admin-nav]").forEach((link) => link.classList.toggle("is-active", link.dataset.adminNav === name));
    const sidebar = get("[data-admin-sidebar]");
    sidebar?.classList.remove("is-open");
    get("[data-admin-sidebar-toggle]")?.setAttribute("aria-expanded", "false");
  }

  function renderAudit(host, logs) {
    if (!host) return;
    host.innerHTML = logs.length ? logs.map((log) => `<div class="admin-audit-item"><strong>${esc(log.action)}</strong><span>${esc(log.createdAt || "")}</span><small>${esc(log.actorUsername || "unknown")} · ${esc(log.targetType || "system")}${log.targetId ? ` · ${esc(log.targetId)}` : ""}</small></div>`).join("") : '<p class="access-note">No administrative actions have been recorded yet.</p>';
  }

  async function fetchJson(path) {
    const response = await fetch(path, { credentials: "same-origin", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    return response.json();
  }

  function trendRows(trends, keys) {
    const rows = new Map();
    keys.forEach((key) => (Array.isArray(trends?.[key]) ? trends[key] : []).forEach((row) => rows.set(row.day, { ...(rows.get(row.day) || {}), [key]: Number(row.count || 0) })));
    return [...rows.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, values]) => ({ day, ...values }));
  }

  function renderChart(host, trends, keys, colors) {
    if (!host) return;
    if (trends?.[keys[0]]?.unavailable) {
      host.innerHTML = '<p class="access-note">Source unavailable for this range.</p>';
      return;
    }
    const rows = trendRows(trends, keys);
    const max = Math.max(1, ...rows.flatMap((row) => keys.map((key) => Number(row[key] || 0))));
    if (!rows.length) {
      host.innerHTML = '<p class="access-note">No records in this date range.</p>';
      return;
    }
    host.innerHTML = `<div class="admin-chart-bars" role="img" aria-label="${esc(keys.join(" and "))} over the selected date range">${rows.map((row) => `<div class="admin-chart-column"><div class="admin-chart-stack">${keys.map((key, index) => `<span class="admin-chart-bar" style="height:${Math.max(2, (Number(row[key] || 0) / max) * 100)}%;background:${colors[index] || "#a855f7"}" title="${esc(key)}: ${Number(row[key] || 0)}"></span>`).join("")}</div><small>${esc(row.day.slice(5))}</small></div>`).join("")}</div><div class="admin-chart-legend">${keys.map((key, index) => `<span><i style="background:${colors[index] || "#a855f7"}"></i>${esc(key)}</span>`).join("")}</div>`;
  }

  function renderFoundingStatus(data) {
    const host = get("[data-admin-founding-status]");
    if (!host) return;
    host.innerHTML = `<span class="admin-pill ${data.status === "not_activated" ? "admin-pill-warning" : "admin-pill-success"}">${esc(data.status || "Unavailable")}</span><strong>${esc(data.allocated ?? "Unavailable")} allocated · ${esc(data.remaining ?? "Unavailable")} remaining</strong><span>${esc(data.active ?? 0)} active · ${esc(data.pendingApplications ?? 0)} pending applications · ${esc(data.note || "")}</span>`;
  }

  async function loadOverview() {
    const range = get("[data-admin-range]")?.value || "30d";
    const data = await fetchJson(`/api/admin/overview?range=${encodeURIComponent(range)}`);
    root.querySelectorAll("[data-admin-metric]").forEach((node) => node.textContent = formatCount(metricValue(data.metrics || {}, node.dataset.adminMetric)));
    const members = data.metrics?.members || {};
    const note = get("[data-admin-metric-note='members']");
    if (note) note.textContent = members.unavailable ? "Source unavailable" : `${formatCount(members.active)} active · ${formatCount(members.inactive)} inactive`;
    const run = data.metrics?.scraperRuns || {};
    const statusHost = get("[data-admin-program-status]");
    if (statusHost) statusHost.innerHTML = `<div><strong>Scraper history</strong><span>${run.unavailable ? "Unavailable" : `${formatCount(run.total)} recorded runs`}</span></div><div><strong>Last failure</strong><span>${esc(run.lastFailedAt || "No failure recorded")}</span></div><div><strong>Data source</strong><span>Live D1 counts · ${esc(data.range?.start || "")} to ${esc(data.range?.end || "")}</span></div>`;
    renderChart(get("[data-admin-chart='members']"), data.trends, ["members"], ["#a855f7"]);
    renderChart(get("[data-admin-chart='community']"), data.trends, ["communityPosts", "communityComments"], ["#22c55e", "#38bdf8"]);
    renderChart(get("[data-admin-chart='publishing']"), data.trends, ["videos", "events"], ["#f59e0b", "#f97316"]);
  }

  async function loadFounding() {
    const data = await fetchJson("/api/admin/founding-50");
    renderFoundingStatus(data);
    const partnership = await fetchJson("/api/admin/creator-partnership?pageSize=100");
    const rows = (partnership.memberships || []).filter((row) => row.membershipType === "founding50");
    const host = get("[data-admin-founding-table]");
    if (host) host.innerHTML = rows.length ? rows.map((row) => `<tr><td>${esc(row.founding50Slot || "—")}</td><td>${esc(row.displayName || row.username)}</td><td>${esc(row.membershipState)}</td><td>${esc(row.creatorStudioEntitlementState || "not recorded")}</td><td>${esc(row.awardedAt || "—")}</td></tr>`).join("") : '<tr><td colspan="5">No production allocations are active.</td></tr>';
    const entitlementCount = get("[data-admin-entitlement-count]");
    if (entitlementCount) entitlementCount.textContent = "Owner/admin gate preserved";
    const entitlementTable = get("[data-admin-entitlement-table]");
    if (entitlementTable) entitlementTable.innerHTML = rows.length ? rows.map((row) => `<tr><td>${esc(row.displayName || row.username)}</td><td>${esc(row.entitlementCode)}</td><td>${esc(row.creatorStudioEntitlementState || "not recorded")}</td><td>${esc(row.awardedAt || "—")}</td></tr>`).join("") : '<tr><td colspan="4">No Creator Studio entitlement records are active.</td></tr>';
  }

  async function loadCommunity() {
    const search = get("[data-admin-community-search]")?.value || "";
    const status = get("[data-admin-community-status]")?.value || "all";
    const data = await fetchJson(`/api/admin/community/posts?status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}&pageSize=50`);
    const host = get("[data-admin-community-table]");
    if (host) host.innerHTML = (data.posts || []).length ? data.posts.map((post) => `<tr><td><strong>${esc(post.title || "Untitled post")}</strong><small>${esc(post.preview || "")}</small></td><td>${esc(post.authorDisplayName || post.authorUsername || "Unknown")}</td><td><span class="admin-pill admin-pill-${post.status === "visible" ? "success" : "warning"}">${esc(post.status)}</span></td><td>${formatCount(post.commentCount)} comments · ${formatCount(post.reactionCount)} reactions</td><td>${esc(post.createdAt || "")}</td></tr>`).join("") : '<tr><td colspan="5">No Community Feed posts matched.</td></tr>';
    const hidden = await fetchJson("/api/admin/community/posts?status=hidden&pageSize=1").catch(() => ({ pagination: { total: null } }));
    const hiddenHost = get("[data-admin-hidden-posts]");
    if (hiddenHost) hiddenHost.textContent = hidden.pagination?.total == null ? "Unavailable" : formatCount(hidden.pagination.total);
  }

  async function loadModeration() {
    const data = await fetchJson("/api/admin/comments?status=pending").catch(() => ({ comments: null }));
    const host = get("[data-admin-pending-comments]");
    if (host) host.textContent = data.comments == null ? "Unavailable" : formatCount(data.comments.length);
  }

  async function loadCreators() {
    const data = await fetchJson("/api/admin/creator-partnership?pageSize=100");
    const host = get("[data-admin-creator-table]");
    if (host) host.innerHTML = (data.memberships || []).length ? data.memberships.map((row) => `<tr><td>${esc(row.displayName || row.username)}<small>${esc(row.username || "")}</small></td><td>${esc(row.membershipType || "—")}</td><td>${esc(row.creatorStudioEntitlementState || "not recorded")}</td><td>${esc(row.membershipState || "—")}</td><td>${esc(row.awardedAt || "—")}</td></tr>`).join("") : '<tr><td colspan="5">No Creator Partnership memberships have been allocated.</td></tr>';
  }

  async function loadAudit() {
    const search = get("[data-admin-audit-search]")?.value || "";
    const query = search ? `&q=${encodeURIComponent(search)}` : "";
    const data = await fetchJson(`/api/admin/audit-logs?limit=50${query}`);
    renderAudit(get("[data-admin-audit-preview]"), (data.logs || []).slice(0, 5));
    renderAudit(get("[data-admin-audit-full]"), data.logs || []);
  }

  async function load() {
    await Promise.allSettled([loadOverview(), loadFounding(), loadCommunity(), loadCreators(), loadModeration(), loadAudit()]);
  }

  root.addEventListener("click", (event) => {
    const link = event.target.closest("[data-admin-nav]");
    if (link) {
      const name = link.dataset.adminNav;
      if (!name) return;
      event.preventDefault();
      history.replaceState(null, "", `#${name}`);
      showView(name);
      return;
    }
    if (event.target.closest("[data-admin-sidebar-toggle]")) {
      const sidebar = get("[data-admin-sidebar]");
      const open = sidebar?.classList.toggle("is-open");
      get("[data-admin-sidebar-toggle]")?.setAttribute("aria-expanded", String(Boolean(open)));
    }
  });
  get("[data-admin-refresh]")?.addEventListener("click", load);
  get("[data-admin-range]")?.addEventListener("change", () => loadOverview().catch(() => {}));
  get("[data-admin-community-refresh]")?.addEventListener("click", () => loadCommunity().catch(() => {}));
  get("[data-admin-community-status]")?.addEventListener("change", () => loadCommunity().catch(() => {}));
  get("[data-admin-creator-refresh]")?.addEventListener("click", () => loadCreators().catch(() => {}));
  get("[data-admin-founding-refresh]")?.addEventListener("click", () => loadFounding().catch(() => {}));
  get("[data-admin-moderation-refresh]")?.addEventListener("click", () => loadModeration().catch(() => {}));
  get("[data-admin-audit-refresh]")?.addEventListener("click", () => loadAudit().catch(() => {}));
  get("[data-admin-audit-apply]")?.addEventListener("click", () => loadAudit().catch(() => {}));
  get("[data-admin-founding-award-form]")?.addEventListener("submit", (event) => event.preventDefault());
  const initial = location.hash.replace(/^#/, "");
  const initialView = initial && !initial.includes("=") && get(`[data-admin-nav='${CSS.escape(initial)}']`) ? initial : "overview";
  showView(initialView);
  load();
})();
