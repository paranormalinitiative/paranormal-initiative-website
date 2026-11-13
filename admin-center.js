(function () {
  "use strict";

  const root = document.querySelector("[data-admin-center]");
  if (!root) return;
  const esc = (value) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  const formatCount = (value) => Number.isFinite(Number(value)) ? Number(value).toLocaleString() : "Unavailable";
  const metricValue = (metrics, path) => path.split(".").reduce((value, key) => value && value[key], metrics);
  const get = (selector) => root.querySelector(selector);
  let executiveToolsAllowed = false;

  function showView(name) {
    if (name === "staff-roles" && !executiveToolsAllowed) name = "overview";
    root.dataset.adminActiveView = name;
    root.querySelectorAll("[data-admin-view]").forEach((view) => {
      view.hidden = view.dataset.adminView !== name && !(name === "members" && view.id === "members");
    });
    root.querySelectorAll("[data-admin-nav]").forEach((link) => link.classList.toggle("is-active", link.dataset.adminNav === name));
    const sidebar = get("[data-admin-sidebar]");
    sidebar?.classList.remove("is-open");
    get("[data-admin-sidebar-toggle]")?.setAttribute("aria-expanded", "false");
    if (name === "staff-roles") loadStaffRoles();
  }

  async function loadStaffRoles() {
    const host = get("[data-admin-staff-table]");
    if (!host) return;
    host.innerHTML = '<tr><td colspan="6">Loading staff appointments…</td></tr>';
    try {
      const data = await fetchJson("/api/admin/staff-roles");
      host.innerHTML = (data.appointments || []).length ? data.appointments.map((row) => {
        const label = row.roleCode === "executive" ? row.officeTitle : row.roleCode.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
        const current = row.status === "active";
        return `<tr><td><strong>${esc(row.displayName || row.username)}</strong><small>${esc(row.username)}</small></td><td>${esc(label)}</td><td>${esc(row.status)}</td><td>${esc(row.appointedAt || "—")}</td><td>${esc(row.status === "active" ? row.reason : row.changeNote || row.reason || "—")}</td><td>${current ? `<button type="button" class="admin-center-refresh" data-admin-staff-revoke="${esc(row.id)}">Revoke</button>` : "—"}</td></tr>`;
      }).join("") : '<tr><td colspan="6">No staff appointments yet. Legacy Owner and Administrator account roles remain recognized.</td></tr>';
    } catch (error) {
      host.innerHTML = `<tr><td colspan="6">${esc(error.message)}. Staff appointment management is available to Owner and Executive leadership.</td></tr>`;
    }
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

  async function revealExecutiveStaffTools() {
    const response = await fetch("/api/auth/me", { credentials: "same-origin", headers: { Accept: "application/json" } });
    if (!response.ok) return;
    const data = await response.json().catch(() => ({}));
    const identity = data.user?.staffIdentity;
    const role = String(identity?.role || (data.user?.role === "owner" ? "owner" : "")).toLowerCase();
    executiveToolsAllowed = role === "owner" || role === "executive";
    root.querySelectorAll("[data-executive-only]").forEach((element) => { element.hidden = !executiveToolsAllowed; });
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
    const status = get("[data-admin-community-status]")?.value || "active";
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

  function renderMembershipClasses(classes) {
    const host = get("[data-admin-membership-classes]");
    if (!host) return;
    host.innerHTML = (classes || []).map((entry) => `<div><strong>${esc(entry.displayName)} · ${esc(entry.numberPrefix)}-001 to ${esc(entry.numberPrefix)}-${String(entry.lifetimeCapacity).padStart(3, "0")}</strong><span class="admin-pill admin-pill-${entry.exhausted ? "warning" : "success"}">${entry.exhausted ? "Exhausted" : `${esc(entry.remaining)} remaining`}</span><span>${esc(entry.issued)} issued · ${esc(entry.active)} active · ${entry.exhausted ? "permanently closed, no further issuance" : `next number ${esc(entry.nextNumber || "unavailable")}`}</span></div>`).join("") || '<div><strong>Class capacity unavailable</strong><span>The additive membership migration is not applied in this environment.</span></div>';
  }

  async function loadFoundingMemberships() {
    const data = await fetchJson("/api/admin/founding-memberships?pageSize=150");
    renderMembershipClasses(data.classes || []);
    const host = get("[data-admin-membership-table]");
    if (host) {
      host.innerHTML = (data.memberships || []).length
        ? data.memberships.map((row) => `<tr><td><strong>${esc(row.membershipNumber)}</strong></td><td>${esc(row.displayName || row.username || "Unknown")}<small>${esc(row.username || "")}${row.role ? ` · ${esc(row.role)}` : ""}</small></td><td>${esc(row.className || row.classCode)}</td><td><span class="admin-pill admin-pill-${row.state === "active" ? "success" : "warning"}">${esc(row.state)}</span></td><td>${esc(row.issuedAt || "—")}</td><td>${esc(row.issuedBy || "—")}</td></tr>`).join("")
        : '<tr><td colspan="6">No Founding Memberships have been issued.</td></tr>';
    }
    return data;
  }

  async function inspectMembershipCapabilities() {
    const username = get("[data-admin-membership-inspect-input]")?.value?.trim() || "";
    const host = get("[data-admin-membership-inspect-result]");
    if (!host) return;
    if (!username) {
      host.innerHTML = '<div><strong>Enter a username</strong><span>Capabilities are resolved from server-side records only.</span></div>';
      return;
    }
    try {
      const data = await fetchJson(`/api/admin/members/${encodeURIComponent(username)}/entitlements`);
      const memberships = (data.memberships || []).map((row) => `${row.membershipNumber} ${row.state}`).join(" · ");
      host.innerHTML = [
        `<div><strong>${esc(data.account.displayName || data.account.username)}</strong><span>role ${esc(data.account.role)} · ${data.account.active ? "active account" : "inactive account"}</span></div>`,
        `<div><strong>Creator capability</strong><span class="admin-pill admin-pill-${data.creator ? "success" : "muted"}">${data.creator ? "Yes" : "No"}</span></div>`,
        `<div><strong>Contributor capability</strong><span class="admin-pill admin-pill-${data.contributor ? "success" : "muted"}">${data.contributor ? "Yes" : "No"}</span></div>`,
        `<div><strong>Badge</strong><span>${data.badge ? esc(`${data.badge.label} (${data.badge.color})`) : "None"}</span></div>`,
        `<div><strong>Creator Incentive</strong><span>${data.creatorIncentive?.eligible ? "Eligible" : "Not eligible"} · ${esc(data.creatorIncentive?.participationState || "not_enrolled")}</span></div>`,
        `<div><strong>Founding Memberships</strong><span>${memberships ? esc(memberships) : "None"}</span></div>`
      ].join("");
    } catch (error) {
      host.innerHTML = `<div><strong>Unable to resolve capabilities</strong><span>${esc(error.message)}</span></div>`;
    }
  }

  async function loadLeadershipDistinctions() {
    const data = await fetchJson("/api/admin/leadership/distinctions");
    const profileHost = get("[data-admin-leadership-profiles]");
    if (profileHost) {
      profileHost.innerHTML = (data.profiles || []).map(profile => `<div><strong>${esc(profile.displayName)}</strong><span>${esc(profile.roleTitle)}</span><small>${esc(profile.transparencyNote)}</small></div>`).join("") || '<div><strong>No leadership profiles are available</strong><span>Profiles will appear after the additive governance migration is applied.</span></div>';
    }
    const table = get("[data-admin-leadership-table]");
    if (!table) return;
    table.innerHTML = (data.distinctions || []).length
      ? data.distinctions.map(row => `<tr><td><strong>${esc(row.displayName || row.profileName || row.username || row.slug || "Identity")}</strong><small>${esc(row.username || row.slug || row.subjectType)}</small></td><td><span class="admin-pill admin-pill-success">${esc(row.label || row.code)}</span></td><td>${esc(row.description || "—")}</td><td>${esc(row.issuedAt || "—")}</td><td>${row.subjectType === "member" ? `<button type="button" class="admin-center-refresh" data-admin-leadership-revoke="${esc(row.id)}">Revoke</button>` : "Owner-managed"}</td></tr>`).join("")
      : '<tr><td colspan="5">No active member distinctions have been assigned.</td></tr>';
  }

  async function loadAudit() {
    const search = get("[data-admin-audit-search]")?.value || "";
    const query = search ? `&q=${encodeURIComponent(search)}` : "";
    const data = await fetchJson(`/api/admin/audit-logs?limit=50${query}`);
    renderAudit(get("[data-admin-audit-preview]"), (data.logs || []).slice(0, 5));
    renderAudit(get("[data-admin-audit-full]"), data.logs || []);
  }

  async function load() {
    await Promise.allSettled([loadOverview(), loadFounding(), loadFoundingMemberships(), loadLeadershipDistinctions(), loadCommunity(), loadCreators(), loadModeration(), loadAudit()]);
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
  get("[data-admin-membership-refresh]")?.addEventListener("click", () => loadFoundingMemberships().catch(() => {}));
  get("[data-admin-leadership-refresh]")?.addEventListener("click", () => loadLeadershipDistinctions().catch(() => {}));
  get("[data-admin-staff-refresh]")?.addEventListener("click", () => loadStaffRoles());
  get("[data-admin-staff-form] [name='roleCode']")?.addEventListener("change", (event) => {
    const wrap = get("[data-staff-office-wrap]");
    const isExecutive = event.currentTarget.value === "executive";
    if (wrap) wrap.hidden = !isExecutive;
  });
  get("[data-admin-staff-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = get("[data-admin-staff-message]");
    if (message) message.textContent = "Saving staff appointment…";
    try {
      const response = await fetch("/api/admin/staff-roles", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ username: form.elements.username.value, roleCode: form.elements.roleCode.value, officeTitle: form.elements.officeTitle.value, reason: form.elements.reason.value }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`);
      if (message) message.textContent = `${result.appointment.roleCode.replaceAll("_", " ")} appointed for ${result.appointment.username}. The member’s profile recognition now reflects the server appointment.`;
      form.reset();
      const wrap = get("[data-staff-office-wrap]");
      if (wrap) wrap.hidden = true;
      await loadStaffRoles();
    } catch (error) { if (message) message.textContent = error.message; }
  });
  get("[data-admin-membership-inspect]")?.addEventListener("click", () => inspectMembershipCapabilities());
  get("[data-admin-membership-inspect-input]")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); inspectMembershipCapabilities(); }
  });
  get("[data-admin-membership-assign-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = get("[data-admin-membership-message]");
    if (message) message.textContent = "Issuing membership…";
    try {
      const response = await fetch("/api/admin/founding-memberships/assign", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          classCode: form.elements.classCode?.value,
          username: form.elements.username?.value,
          notes: form.elements.notes?.value
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`);
      if (message) message.textContent = `${result.membership.displayName} ${result.membership.membershipNumber} issued to ${result.account.username}. Capabilities: ${(result.capabilities || []).join(" + ") || "none"}.`;
      form.reset();
      await loadFoundingMemberships();
    } catch (error) {
      if (message) message.textContent = error.message;
    }
  });
  get("[data-admin-leadership-assign-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = get("[data-admin-leadership-message]");
    if (message) message.textContent = "Assigning distinction…";
    try {
      const response = await fetch("/api/admin/leadership/distinctions", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          username: form.elements.username?.value,
          code: form.elements.code?.value,
          description: form.elements.description?.value,
          notes: form.elements.notes?.value,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`);
      if (message) message.textContent = `${result.distinction.label} assigned to ${result.account.displayName} (${result.account.username}). It is recognition only and does not change access.`;
      form.reset();
      await loadLeadershipDistinctions();
    } catch (error) {
      if (message) message.textContent = error.message;
    }
  });
  root.addEventListener("click", async (event) => {
    const staffButton = event.target.closest("[data-admin-staff-revoke]");
    if (staffButton) {
      const reason = window.prompt("Reason for revoking this staff appointment:");
      if (!reason || reason.trim().length < 8) return;
      staffButton.disabled = true;
      try {
        const response = await fetch("/api/admin/staff-roles", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ appointmentId: staffButton.dataset.adminStaffRevoke, reason }) });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`);
        await loadStaffRoles();
      } catch (error) { staffButton.disabled = false; window.alert(error.message); }
      return;
    }
    const button = event.target.closest("[data-admin-leadership-revoke]");
    if (!button) return;
    if (!window.confirm("Revoke this visual leadership distinction? This does not change account access.")) return;
    button.disabled = true;
    try {
      const response = await fetch(`/api/admin/leadership/distinctions/${encodeURIComponent(button.dataset.adminLeadershipRevoke)}/revoke`, { method: "POST", credentials: "same-origin", headers: { Accept: "application/json" } });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`);
      await loadLeadershipDistinctions();
    } catch (error) {
      button.disabled = false;
      window.alert(error.message);
    }
  });
  const initial = location.hash.replace(/^#/, "");
  const initialView = initial && !initial.includes("=") && get(`[data-admin-nav='${CSS.escape(initial)}']`) ? initial : "overview";
  window.TPIAdminCenter = { refreshView: () => showView(root.dataset.adminActiveView || initialView) };
  new MutationObserver(() => window.TPIAdminCenter.refreshView()).observe(root, { subtree: true, attributes: true, attributeFilter: ["data-admin-authorized"] });
  revealExecutiveStaffTools().finally(() => {
    showView(initialView);
    load();
  });
})();
