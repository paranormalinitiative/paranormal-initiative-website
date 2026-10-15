/*
 * TPI-DEV-024 StudioFlow workspace bridge.
 *
 * The deployed StudioFlow bundle remains the source of truth for the editor.
 * This small bridge persists only an allow-listed broadcast/settings snapshot;
 * recording blobs and file handles stay in the browser's existing storage.
 */
(function () {
  "use strict";

  var KEYS = {
    active: "studioflow.activeBroadcastId",
    broadcasts: "studioflow.broadcasts",
    orientation: "studioflow.programOrientation",
    preferences: "studioflow.recordingPreferences.v2",
    storage: "studioflow.recordingStorage.v1",
    workspaceCache: "studioflow.tpiWorkspaceCache.v1"
  };
  var panel;
  var list;
  var message;
  var workspaces = [];

  function read(key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }

  function text(value) { return typeof value === "string" ? value : ""; }

  function activeBroadcast() {
    var id = text(localStorage.getItem(KEYS.active));
    var broadcasts = read(KEYS.broadcasts, []);
    return Array.isArray(broadcasts) ? broadcasts.find(function (item) { return item && item.id === id; }) || null : null;
  }

  function stateForSave() {
    var broadcast = activeBroadcast();
    if (!broadcast) return null;
    var preferences = read(KEYS.preferences, {}) || {};
    var storage = read(KEYS.storage, {}) || {};
    var libraryItems = read("studioflow.libraryItems", []);
    var sessions = read("studioflow.recordingSessions", []);
    return {
      broadcast: {
        id: text(broadcast.id),
        title: text(broadcast.title),
        description: text(broadcast.description),
        scheduledAt: text(broadcast.scheduledAt),
        visibility: text(broadcast.visibility),
        status: text(broadcast.status),
        tpiSync: broadcast.tpiSync ? {
          broadcastId: text(broadcast.tpiSync.broadcastId),
          revision: Number(broadcast.tpiSync.revision) || null,
          visibility: text(broadcast.tpiSync.visibility),
          syncState: text(broadcast.tpiSync.syncState),
          lastSyncedAt: text(broadcast.tpiSync.lastSyncedAt)
        } : null
      },
      settings: {
        programOrientation: text(localStorage.getItem(KEYS.orientation)) || "landscape",
        recordingDestination: text(storage.mode || storage.destination || storage.storageMode) || "browser",
        keepLocalBackup: preferences.keepLocalBackup !== false,
        saveAutomatically: preferences.saveAutomatically === true,
        recordBackstageAutomatically: preferences.recordBackstageAutomatically === true,
        resumeBackstageAfterShow: preferences.resumeBackstageAfterShow === true
      },
      recording: {
        localLibraryCount: Array.isArray(libraryItems) ? libraryItems.length : 0,
        incompleteSessionCount: Array.isArray(sessions) ? sessions.filter(function (item) { return item && item.status === "recording"; }).length : 0,
        storageMode: text(storage.mode || storage.destination || storage.storageMode) || "browser"
      }
    };
  }

  function setMessage(value, isError) {
    if (!message) return;
    message.textContent = value || "";
    message.className = isError ? "tpi-ws-message error" : "tpi-ws-message";
  }

  function workspaceRequestError(status, body) {
    var code = text(body && body.code);
    var messages = {
      workspace_schema_unsupported: "Saved workspaces are not enabled in this environment yet. Export the configuration to keep a local copy.",
      workspace_backend_unavailable: "Saved workspace storage is temporarily unavailable. Export the configuration and try Refresh again later.",
      workspace_not_found: "That workspace was not found. Refresh the list to see the current saved workspaces.",
      workspace_conflict: "This workspace changed elsewhere. Refresh the list before saving again.",
      workspace_exists: "A workspace for this broadcast already exists. Refresh the list and open the saved copy.",
      workspace_invalid: body && body.error ? body.error : "The workspace configuration is not valid.",
      workspace_too_large: body && body.error ? body.error : "The workspace configuration is too large to save."
    };
    var error = new Error(messages[code] || (body && text(body.error)) || "The workspace request could not be completed.");
    error.code = code;
    error.status = status;
    error.body = body || {};
    return error;
  }

  function describeWorkspaceFailure(error, fallback) {
    if (error && error.code === "auth_required") return "Your member session is no longer active. Sign in again, then Refresh the workspace list.";
    if (error && error.code === "access_denied") return "Your account is not permitted to use Saved Workspaces. Contact the site owner if this is unexpected.";
    if (error && error.code === "network_failure") return "The workspace service could not be reached. Check your connection and try Refresh again.";
    return error && error.message ? error.message : fallback;
  }

  function api(path, options) {
    return fetch(path, Object.assign({ credentials: "same-origin", headers: { "Content-Type": "application/json" } }, options || {}))
      .then(function (response) {
        return response.text().then(function (raw) {
          var body = {};
          try { body = raw ? JSON.parse(raw) : {}; } catch (error) { body = {}; }
          if (!response.ok) {
            var requestError = workspaceRequestError(response.status, body);
            if (response.status === 401) requestError.code = "auth_required";
            else if (response.status === 403) requestError.code = "access_denied";
            throw requestError;
          }
          return body;
        });
      })
      .catch(function (error) {
        if (error && (error.status || error.code === "auth_required" || error.code === "access_denied")) throw error;
        var networkError = new Error("The workspace service could not be reached. Check your connection and try Refresh again.");
        networkError.code = "network_failure";
        networkError.cause = error;
        throw networkError;
      });
  }

  function cacheWorkspaces() { write(KEYS.workspaceCache, workspaces); }

  function backupPayload(workspace) {
    var state = workspace && workspace.state ? workspace.state : stateForSave();
    if (!state) return null;
    return {
      applicationId: "tpi-studioflow",
      formatVersion: 1,
      backupType: "workspace-configuration",
      exportedAt: new Date().toISOString(),
      workspace: {
        title: text(workspace && workspace.title) || text(state.broadcast && state.broadcast.title) || "Untitled workspace",
        description: text(workspace && workspace.description) || text(state.broadcast && state.broadcast.description) || "",
        state: state
      }
    };
  }

  function downloadBackup(payload) {
    if (!payload) {
      setMessage("Select or create a StudioFlow broadcast before exporting.", true);
      return;
    }
    var blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    var slug = String(payload.workspace.title || "workspace").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "workspace";
    anchor.href = url;
    anchor.download = "tpi-studioflow-" + slug + "-backup.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setMessage("Configuration backup downloaded. Recording files are not included.");
  }

  function exportCurrent() { downloadBackup(backupPayload(null)); }

  function exportWorkspace(workspace) {
    downloadBackup(backupPayload(workspace));
  }

  function validateBackup(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("The backup must be a JSON object.");
    if (raw.applicationId !== "tpi-studioflow" || raw.backupType !== "workspace-configuration") throw new Error("This file is not a supported StudioFlow workspace backup.");
    if (raw.formatVersion !== 1) throw new Error("This workspace backup version is not supported.");
    if (!raw.workspace || typeof raw.workspace !== "object" || Array.isArray(raw.workspace)) throw new Error("The backup is missing workspace data.");
    if (!text(raw.workspace.title).trim()) throw new Error("The backup is missing a workspace title.");
    if (!raw.workspace.state || typeof raw.workspace.state !== "object" || Array.isArray(raw.workspace.state)) throw new Error("The backup is missing supported workspace settings.");
    ["ownerId", "owner_id", "workspaceId", "workspace_id", "serverId", "server_id"].forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(raw, key) || Object.prototype.hasOwnProperty.call(raw.workspace, key)) throw new Error("Protected server ownership fields are not accepted in backups.");
    });
    return raw;
  }

  function importBackupFile(file) {
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setMessage("Backup files must be 1 MB or smaller.", true);
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var backup = validateBackup(JSON.parse(String(reader.result || "")));
        if (!window.confirm("Import this configuration as a new workspace? Existing workspaces and recordings will not be overwritten.")) return;
        var newId = "imported-" + (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : String(Date.now()));
        var state = JSON.parse(JSON.stringify(backup.workspace.state));
        state.broadcast = state.broadcast && typeof state.broadcast === "object" ? state.broadcast : {};
        state.broadcast.id = newId;
        delete state.broadcast.tpiSync;
        api("/api/studio/workspaces", {
          method: "POST",
          body: JSON.stringify({
            localBroadcastId: newId,
            title: text(backup.workspace.title).slice(0, 180),
            description: text(backup.workspace.description).slice(0, 1000),
            state: state
          })
        }).then(function () {
          setMessage("Workspace configuration imported as a new workspace. No recording files were imported.");
          return refresh();
        }).catch(function (error) { setMessage(describeWorkspaceFailure(error, "The imported workspace could not be saved."), true); });
      } catch (error) {
        setMessage(error && error.message ? error.message : "The workspace backup could not be read.", true);
      }
    };
    reader.onerror = function () { setMessage("The workspace backup could not be read.", true); };
    reader.readAsText(file);
  }

  function renderList() {
    if (!list) return;
    while (list.firstChild) list.removeChild(list.firstChild);
    if (!workspaces.length) {
      var empty = document.createElement("div");
      empty.className = "tpi-ws-empty";
      empty.textContent = "No saved workspaces yet.";
      list.appendChild(empty);
      return;
    }
    workspaces.forEach(function (workspace) {
      var row = document.createElement("div");
      row.className = "tpi-ws-row" + (workspace.status === "archived" ? " archived" : "");
      var name = document.createElement("div");
      name.className = "tpi-ws-name";
      name.textContent = workspace.title || workspace.localBroadcastId;
      var meta = document.createElement("div");
      meta.className = "tpi-ws-meta";
      meta.textContent = workspace.status === "archived" ? "Archived" : "Saved locally + server metadata";
      var actions = document.createElement("div");
      actions.className = "tpi-ws-actions";
      if (workspace.status !== "archived") {
        var open = document.createElement("button");
        open.type = "button";
        open.textContent = "Open";
        open.addEventListener("click", function () { openWorkspace(workspace); });
        actions.appendChild(open);
        var archive = document.createElement("button");
        archive.type = "button";
        archive.textContent = "Archive";
        archive.addEventListener("click", function () { archiveWorkspace(workspace); });
        actions.appendChild(archive);
      }
      var exportButton = document.createElement("button");
      exportButton.type = "button";
      exportButton.textContent = "Export";
      exportButton.addEventListener("click", function () { exportWorkspace(workspace); });
      actions.appendChild(exportButton);
      row.appendChild(name);
      row.appendChild(meta);
      row.appendChild(actions);
      list.appendChild(row);
    });
  }

  function refresh() {
    return api("/api/studio/workspaces?includeArchived=true").then(function (body) {
      workspaces = Array.isArray(body.workspaces) ? body.workspaces : [];
      cacheWorkspaces();
      renderList();
      setMessage("Workspace list refreshed.");
    }).catch(function (error) {
      setMessage(describeWorkspaceFailure(error, "Saved workspaces could not be refreshed."), true);
    });
  }

  function saveCurrent() {
    var state = stateForSave();
    if (!state) {
      setMessage("Select or create a StudioFlow broadcast before saving.", true);
      return;
    }
    var id = state.broadcast.id;
    var existing = workspaces.find(function (workspace) { return workspace.localBroadcastId === id; });
    var body = JSON.stringify({
      localBroadcastId: id,
      title: state.broadcast.title || "Untitled workspace",
      description: state.broadcast.description || "",
      state: state,
      expectedVersion: existing ? existing.version : undefined
    });
    var request = existing ? api("/api/studio/workspaces/" + encodeURIComponent(existing.id), { method: "PATCH", body: body }) : api("/api/studio/workspaces", { method: "POST", body: body });
    request.then(function () {
      setMessage(existing ? "Workspace saved." : "Workspace saved for this account.");
      return refresh();
    }).catch(function (error) {
      setMessage(describeWorkspaceFailure(error, "Workspace could not be saved. No success was recorded."), true);
      if (error.body && error.body.workspace) {
        workspaces = workspaces.map(function (item) { return item.id === error.body.workspace.id ? error.body.workspace : item; });
        renderList();
      }
    });
  }

  function openWorkspace(workspace) {
    api("/api/studio/workspaces/" + encodeURIComponent(workspace.id)).then(function (body) {
      var saved = body.workspace;
      var state = saved.state || {};
      var broadcast = state.broadcast || {};
      var broadcasts = read(KEYS.broadcasts, []);
      if (!Array.isArray(broadcasts)) broadcasts = [];
      var restored = broadcasts.find(function (item) { return item && item.id === saved.localBroadcastId; });
      if (!restored) {
        restored = { id: saved.localBroadcastId, kind: "live", title: saved.title, description: saved.description || "", status: broadcast.status || "draft" };
        broadcasts.push(restored);
      } else {
        restored.title = broadcast.title || saved.title;
        restored.description = broadcast.description || saved.description || "";
        if (broadcast.status) restored.status = broadcast.status;
      }
      write(KEYS.broadcasts, broadcasts);
      localStorage.setItem(KEYS.active, saved.localBroadcastId);
      var settings = state.settings || {};
      if (settings.programOrientation) localStorage.setItem(KEYS.orientation, settings.programOrientation);
      write(KEYS.preferences, Object.assign(read(KEYS.preferences, {}) || {}, {
        keepLocalBackup: settings.keepLocalBackup !== false,
        saveAutomatically: settings.saveAutomatically === true,
        recordBackstageAutomatically: settings.recordBackstageAutomatically === true,
        resumeBackstageAfterShow: settings.resumeBackstageAfterShow === true
      }));
      setMessage("Workspace restored. Browser recordings were left in place.");
      window.setTimeout(function () { window.location.reload(); }, 350);
    }).catch(function (error) { setMessage(describeWorkspaceFailure(error, "Workspace could not be restored."), true); });
  }

  function archiveWorkspace(workspace) {
    if (!window.confirm("Archive this workspace? Its browser recordings will remain untouched.")) return;
    api("/api/studio/workspaces/" + encodeURIComponent(workspace.id) + "/archive", { method: "POST", body: JSON.stringify({ expectedVersion: workspace.version }) })
      .then(function () { setMessage("Workspace archived. Recordings were not deleted."); return refresh(); })
      .catch(function (error) { setMessage(describeWorkspaceFailure(error, "Workspace could not be archived."), true); });
  }

  function inject() {
    if (panel || !document.body) return;
    panel = document.createElement("aside");
    panel.id = "tpi-workspace-bridge";
    panel.innerHTML = "<div class=\"tpi-ws-header\"><strong>Saved Workspaces</strong><button type=\"button\" class=\"tpi-ws-close\" aria-label=\"Close saved workspaces\">×</button></div><div class=\"tpi-ws-help\"><strong>Configuration only.</strong> Save syncs supported StudioFlow settings to your account when backend support is available. Export downloads a local configuration backup. Import loads one as a new workspace. Refresh reloads your account's saved list. Recording files remain in Browser Storage until you download them separately; they are never included in workspace saves.</div><div class=\"tpi-ws-toolbar\"><button type=\"button\" data-action=\"save\">Save Workspace</button><button type=\"button\" data-action=\"export\">Export Workspace</button><button type=\"button\" data-action=\"import\">Import Workspace</button><button type=\"button\" data-action=\"refresh\">Refresh</button><input type=\"file\" data-action=\"file\" accept=\"application/json,.json\" hidden></div><div class=\"tpi-ws-message\" role=\"status\"></div><div class=\"tpi-ws-list\"></div>";
    document.body.appendChild(panel);
    list = panel.querySelector(".tpi-ws-list");
    message = panel.querySelector(".tpi-ws-message");
    panel.querySelector("[data-action=save]").addEventListener("click", saveCurrent);
    panel.querySelector("[data-action=export]").addEventListener("click", exportCurrent);
    panel.querySelector("[data-action=import]").addEventListener("click", function () { panel.querySelector("[data-action=file]").click(); });
    panel.querySelector("[data-action=file]").addEventListener("change", function (event) { importBackupFile(event.target.files && event.target.files[0]); event.target.value = ""; });
    panel.querySelector("[data-action=refresh]").addEventListener("click", refresh);
    panel.querySelector(".tpi-ws-close").addEventListener("click", function () { panel.classList.toggle("collapsed"); });
    renderList();
    refresh();
  }

  function start() {
    api("/api/auth/me").then(function (body) {
      if (body && body.user && body.user.creatorStudioAccess === true) inject();
    }).catch(function () {});
  }

  var style = document.createElement("style");
  style.textContent = "#tpi-workspace-bridge{position:fixed;z-index:2147483000;right:18px;bottom:18px;width:340px;max-height:70vh;overflow:auto;background:var(--panel,#1e2630);color:var(--text,#f2f7f3);border:1px solid var(--line,#34404a);border-radius:12px;box-shadow:0 16px 44px rgba(0,0,0,.35);padding:14px;font:13px/1.4 system-ui,sans-serif}#tpi-workspace-bridge.collapsed{width:auto;max-height:none}#tpi-workspace-bridge.collapsed>*:not(.tpi-ws-header){display:none}.tpi-ws-header{display:flex;justify-content:space-between;align-items:center;font-size:14px}.tpi-ws-close,.tpi-ws-actions button,#tpi-workspace-bridge .tpi-ws-toolbar button{border:1px solid var(--line,#34404a);border-radius:7px;background:var(--panel-2,#323d38);color:inherit;padding:6px 9px;cursor:pointer}.tpi-ws-close{font-size:18px;line-height:1}.tpi-ws-help{color:var(--muted,#9ba8a0);margin:8px 0}.tpi-ws-toolbar{display:flex;gap:7px;margin:8px 0}.tpi-ws-message{min-height:19px;color:var(--blue,#4bb263);margin:4px 0}.tpi-ws-message.error{color:#ff9d9d}.tpi-ws-row{border-top:1px solid var(--line,#34404a);padding:9px 0}.tpi-ws-row.archived{opacity:.7}.tpi-ws-name{font-weight:650}.tpi-ws-meta{color:var(--muted,#9ba8a0);font-size:11px;margin:2px 0 7px}.tpi-ws-actions{display:flex;gap:6px}.tpi-ws-empty{color:var(--muted,#9ba8a0);padding:10px 0}";
  document.head.appendChild(style);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
