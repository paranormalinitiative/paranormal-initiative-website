/*
 * TPI-STUDIOFLOW-012 Addendum C.
 *
 * This is a thin browser adapter for local recording. The authoritative lock
 * is the server-side studio_production_sessions row; this bridge only gates
 * the existing local MediaRecorder entry point and keeps that row alive while
 * IndexedDB recording checkpoints exist. Recording bytes remain local.
 */
(function () {
  "use strict";

  var ACTIVE_STATUSES = ["recording", "live", "stopping", "finalizing", "recovery"];
  var activeStudioKey = "studioflow.tpiActiveStudioId.v1";
  var activeBroadcastKey = "studioflow.activeBroadcastId";
  var fixedSession = null;
  var heartbeatTimer = null;
  var pollTimer = null;
  var bypassNextClick = false;
  var reservationInFlight = null;

  function text(value) { return String(value == null ? "" : value).trim(); }
  function json(value) { try { return JSON.parse(value); } catch (_) { return null; } }
  function currentWorkspaceId() { return text(window.localStorage.getItem(activeStudioKey)); }
  function currentBroadcastId() { return text(window.localStorage.getItem(activeBroadcastKey)); }
  function errorMessage(body) {
    return text(body && body.error) || "Another studio is currently in production.\n\nFinish your active session before starting a production in this studio.";
  }

  function showMessage(message, isError) {
    var node = document.getElementById("tpi-production-lock-message");
    if (!node) {
      node = document.createElement("div");
      node.id = "tpi-production-lock-message";
      node.setAttribute("role", "alert");
      node.style.cssText = "position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:1100;max-width:min(560px,calc(100vw - 32px));padding:12px 16px;border:1px solid #d46a7e;border-radius:10px;background:#1b1222;color:#fff;white-space:pre-line;box-shadow:0 10px 30px #0008;font:600 13px/1.45 system-ui,sans-serif";
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.style.borderColor = isError ? "#d46a7e" : "#4bb263";
    window.clearTimeout(Number(node.dataset.dismissTimer || 0));
    node.dataset.dismissTimer = String(window.setTimeout(function () { node.remove(); }, isError ? 8000 : 3000));
  }

  function activeLocalSessions() {
    if (!window.indexedDB) return Promise.resolve([]);
    return new Promise(function (resolve) {
      var request;
      try { request = window.indexedDB.open("studioflow-recordings"); } catch (_) { resolve([]); return; }
      request.onerror = function () { resolve([]); };
      request.onsuccess = function () {
        var db = request.result;
        if (!db.objectStoreNames.contains("recordingSessions")) { db.close(); resolve([]); return; }
        var tx = db.transaction("recordingSessions", "readonly");
        var get = tx.objectStore("recordingSessions").getAll();
        get.onerror = function () { db.close(); resolve([]); };
        get.onsuccess = function () {
          var rows = Array.isArray(get.result) ? get.result : [];
          db.close();
          var now = Date.now();
          resolve(rows.filter(function (row) {
            if (!row) return false;
            if (ACTIVE_STATUSES.indexOf(text(row.status).toLowerCase()) >= 0) return true;
            // The compiled local recorder predates an explicit status field.
            // Its checkpoint is updated for each media chunk, so a recent
            // checkpoint is an active/reconnecting recording; old rows remain
            // recoverable without acquiring a new production lock.
            return Number.isFinite(Number(row.updatedAt)) && now - Number(row.updatedAt) < 15000;
          }));
        };
      };
    });
  }

  function api(path, options) {
    options = options || {};
    options.credentials = "same-origin";
    options.headers = Object.assign({ "content-type": "application/json" }, options.headers || {});
    // TPI-STUDIOFLOW-088: a wedged request must never freeze the lock state.
    // Reserves, heartbeats and releases time out so the bridge keeps
    // self-healing instead of leaving a stale "recording is active" latch
    // behind that blocks Studio deletion and switching.
    var timer = null;
    if (window.AbortController && !options.signal) {
      var controller = new AbortController();
      options.signal = controller.signal;
      timer = window.setTimeout(function () { try { controller.abort(); } catch (_) {} }, 10000);
    }
    return window.fetch(path, options).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (body) {
        if (!response.ok) { var error = new Error(errorMessage(body)); error.body = body; error.status = response.status; throw error; }
        return body;
      });
    }).finally(function () { if (timer) window.clearTimeout(timer); });
  }

  function productionSessionId() {
    if (!fixedSession) fixedSession = "browser-production-" + (currentWorkspaceId() || currentBroadcastId() || "studio");
    return fixedSession;
  }

  function reserve() {
    var workspaceId = currentWorkspaceId();
    var broadcastId = currentBroadcastId();
    if (!workspaceId && !broadcastId) return Promise.reject(new Error("Select a saved Studio before starting a recording."));
    if (reservationInFlight) return reservationInFlight;
    reservationInFlight = api("/api/studio/production/start", { method: "POST", body: JSON.stringify({
      studioWorkspaceId: workspaceId || null,
      localBroadcastId: broadcastId || null,
      sessionId: productionSessionId(),
      mode: "recording"
    }) }).then(function (body) {
      window.__tpiStudioProductionLock = { locked: true, studioWorkspaceId: body.studioWorkspaceId || workspaceId, sessionId: body.sessionId || productionSessionId() };
      beginHeartbeat();
      return body;
    }).catch(function (error) {
      // A denied reservation means this browser does not own the active
      // production lock. Keep the denial visible to the recording gate, but
      // do not poison Studio switching with a lock that this tab never held.
      window.__tpiStudioProductionLock = { locked: false, denied: true };
      showMessage(error.message, true);
      throw error;
    }).finally(function () { reservationInFlight = null; });
    return reservationInFlight;
  }

  function beginHeartbeat() {
    if (heartbeatTimer) return;
    heartbeatTimer = window.setInterval(function () {
      var lock = window.__tpiStudioProductionLock;
      if (!lock || !lock.locked || !lock.sessionId) return;
      api("/api/studio/production/heartbeat", { method: "POST", body: JSON.stringify({ sessionId: lock.sessionId }) }).catch(function (error) {
        if (error && (error.status === 409 || error.status === 404)) {
          // The server no longer recognizes this session (it expired or was
          // taken over). Drop the latch instead of claiming a phantom lock.
          window.__tpiStudioProductionLock = { locked: false, cleared: "session-gone" };
          return;
        }
        if (error && error.name === "AbortError") return;
        showMessage(error.message, true);
      });
    }, 5000);
  }

  function release() {
    var lock = window.__tpiStudioProductionLock;
    if (!lock || !lock.locked || !lock.sessionId) return Promise.resolve(false);
    return api("/api/studio/production/stop", { method: "POST", body: JSON.stringify({ sessionId: lock.sessionId }) }).then(function () {
      window.__tpiStudioProductionLock = { locked: false };
      return true;
    }).catch(function () { return false; }).finally(function () {
      // release() only runs when no local recording session exists, so the
      // latch must not survive the release attempt even when the request
      // fails: a stale latch would keep blocking Studio deletion and
      // switching with a phantom "recording is active".
      var current = window.__tpiStudioProductionLock;
      if (current && current.locked && current.sessionId === lock.sessionId) window.__tpiStudioProductionLock = { locked: false, cleared: "release-incomplete" };
    });
  }

  function syncFromIndexedDb() {
    activeLocalSessions().then(function (rows) {
      if (rows.length) {
        reserve().catch(function () {});
        return;
      }
      var lock = window.__tpiStudioProductionLock;
      if (lock && lock.locked) release();
    });
  }

  function isRecordingStartButton(button) {
    if (!button || button.closest(".settings-panel,.modal-backdrop,[role=dialog]")) return false;
    var label = text(button.textContent).toLowerCase();
    return label === "record" || label === "start recording" || label === "start stream/recording";
  }

  function installClickGate() {
    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest("button") : null;
      if (!isRecordingStartButton(button)) return;
      if (bypassNextClick) { bypassNextClick = false; return; }
      event.preventDefault();
      event.stopImmediatePropagation();
      reserve().then(function () {
        bypassNextClick = true;
        button.click();
        // The re-click consumes the bypass synchronously. If it never reached
        // this listener (the button was replaced mid-flight), clear the flag so
        // the next click is gated again instead of silently skipping its
        // reservation.
        bypassNextClick = false;
      }).catch(function () {});
    }, true);
  }

  function start() {
    installClickGate();
    syncFromIndexedDb();
    pollTimer = window.setInterval(syncFromIndexedDb, 1200);
    window.addEventListener("pagehide", function () {
      // Do not release here: refresh/navigation must not release an active
      // creator lock while a persisted recording checkpoint remains active.
      window.clearInterval(pollTimer);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
