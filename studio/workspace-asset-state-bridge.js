/*
 * TPI-STUDIOFLOW-012 Addendum B.
 * Extends the existing workspace bridge without replacing it. StudioFlow keeps
 * media bytes in IndexedDB/browser storage; blobKey references are persisted only as
 * metadata references and selected asset IDs needed to restore each workspace.
 */
(function () {
  "use strict";
  var KEYS = {
    selectedBackground: "studioflow.selectedBackground",
    activeSceneId: "studioflow.activeSceneId",
    showLogo: "studioflow.showLogo",
    logoPlacement: "studioflow.logoPlacement",
    styleSettings: "studioflow.styleSettings",
    widgetSettings: "studioflow.widgetSettings",
    generalSettings: "studioflow.generalSettings.v1",
    guestPermissionSettings: "studioflow.guestPermissionSettings",
    studioScenes: "studioflow.studioScenes",
    sceneMusicAssignments: "studioflow.sceneMusicAssignments",
    bannerScrollTicker: "studioflow.bannerScrollTicker",
    programOrientation: "studioflow.programOrientation",
    customBackground: "studioflow.customBackground",
    customLogo: "studioflow.customLogo",
    overlayAssets: "studioflow.overlayAssets",
    activeOverlayId: "studioflow.activeOverlayId",
    videoClips: "studioflow.videoClips",
    videoClipSlots: "studioflow.videoClipSlots",
    backgroundMusic: "studioflow.backgroundMusic",
    backgroundMusicSlots: "studioflow.backgroundMusicSlots",
    backgroundMusicVolume: "studioflow.backgroundMusicVolume",
    backgroundMusicLoop: "studioflow.backgroundMusicLoop",
    customSounds: "studioflow.customSounds",
    customSound: "studioflow.customSound",
    soundVolume: "studioflow.soundVolume"
  };
  function text(value) { return typeof value === "string" ? value : ""; }
  function read(key, fallback) { try { var raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); } catch (error) { return fallback; } }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {} }
  function clone(value) { try { return JSON.parse(JSON.stringify(value)); } catch (error) { return {}; } }
  function assetConfiguration() {
    var result = {};
    Object.keys(KEYS).forEach(function (name) {
      var value = read(KEYS[name], undefined);
      if (value !== undefined) result[name] = value;
    });
    return result;
  }
  function defaults() {
    return {
      selectedBackground: "default",
      activeSceneId: "scene-1",
      showLogo: true,
      logoPlacement: "top-right",
      styleSettings: { accentColor: "#1266e3", brandPreset: "studioflow", cameraFallbackStyle: "standard", fontFamily: "theme", nameplateStyle: "rounded", roundedCorners: true, showDisplayNames: true, showHeadlines: true, textSize: "default", theme: "bubble" },
      widgetSettings: { showClock: false, showElapsed: false, showCountdown: false, placement: "bottom-right" },
      generalSettings: { resolution: "1080p", orientation: "landscape" },
      guestPermissionSettings: { canStreamToOwnDestination: false, canSeeViewerComments: true, playEntrySound: true, mustAuthenticate: false, canControlSlides: false },
      studioScenes: [{ id: "intro", kind: "intro", title: "Intro video", layout: "Speaker view" }, { id: "scene-1", kind: "demo", title: "Demo scene 1", layout: "Speaker view" }, { id: "scene-2", kind: "demo", title: "Demo scene 2", layout: "Group discussion" }, { id: "outro", kind: "outro", title: "Outro video", layout: "Speaker view" }],
      sceneMusicAssignments: {},
      bannerScrollTicker: { enabled: false, text: "", position: "bottom" },
      programOrientation: "landscape",
      customBackground: null,
      customLogo: null,
      overlayAssets: [],
      activeOverlayId: null,
      videoClips: { intro: null, outro: null },
      videoClipSlots: [],
      backgroundMusic: null,
      backgroundMusicSlots: [],
      backgroundMusicVolume: 0.42,
      backgroundMusicLoop: true,
      customSounds: [],
      customSound: null,
      soundVolume: 0.72
    };
  }
  function normalizeStudioScenes(value) {
    var incoming = Array.isArray(value) ? value.filter(function (scene) { return scene && typeof scene === "object"; }).map(clone) : [];
    var used = {};
    incoming.forEach(function (scene) { if (text(scene.id)) used[text(scene.id)] = true; });
    function nextId(preferred) {
      if (!used[preferred]) { used[preferred] = true; return preferred; }
      var index = 2, candidate = preferred + "-" + index;
      while (used[candidate]) { index += 1; candidate = preferred + "-" + index; }
      used[candidate] = true;
      return candidate;
    }
    function baseline(id, kind, title, layout) { return { id: nextId(id), kind: kind, title: title, layout: layout }; }
    if (!incoming.length) return clone(defaults().studioScenes);
    var hasIntro = incoming.some(function (scene) { return scene.kind === "intro"; });
    var hasOutro = incoming.some(function (scene) { return scene.kind === "outro"; });
    var demoCount = incoming.filter(function (scene) { return scene.kind === "demo"; }).length;
    var result = incoming.slice();
    if (!hasIntro) result.unshift(baseline("intro", "intro", "Intro video", "Speaker view"));
    if (demoCount < 2) {
      var needed = 2 - demoCount;
      for (var index = 0; index < needed; index += 1) {
        result.push(baseline(index === 0 ? "scene-1" : "scene-2", "demo", index === 0 ? "Demo scene 1" : "Demo scene 2", index === 0 ? "Speaker view" : "Group discussion"));
      }
    }
    if (!hasOutro) result.push(baseline("outro", "outro", "Outro video", "Speaker view"));
    return result;
  }
  function normalizeStoredStudioScenes() {
    try {
      var raw = localStorage.getItem(KEYS.studioScenes);
      if (raw === null) return;
      var normalized = normalizeStudioScenes(JSON.parse(raw));
      localStorage.setItem(KEYS.studioScenes, JSON.stringify(normalized));
    } catch (error) {}
  }
  function serverPreview(asset) { if (!asset || typeof asset !== "object") return asset; return text(asset.serverUrl) && text(asset.serverAssetId) ? Object.assign({}, asset, { previewUrl: asset.serverUrl }) : asset; }
  // Snapshot of each stored key's raw value at request-send time. A response
  // echo must never overwrite a key the creator changed while the request was
  // in flight (TPI-STUDIOFLOW-030: a pad reorder made during a slow save was
  // reverted by the save's own response echo).
  function captureKeyGuard() {
    var guard = {};
    Object.keys(KEYS).forEach(function (name) { guard[name] = localStorage.getItem(KEYS[name]); });
    return guard;
  }
  function applyConfiguration(configuration, keyGuard) {
    if (!configuration || typeof configuration !== "object") return;
    var fallback = defaults();
    Object.keys(KEYS).forEach(function (name) {
      if (keyGuard && keyGuard[name] !== localStorage.getItem(KEYS[name])) return;
      var value = configuration[name] !== undefined ? configuration[name] : fallback[name];
      if (name === "studioScenes") value = normalizeStudioScenes(value);
      if (["customBackground", "customLogo", "backgroundMusic", "customSound"].includes(name)) value = serverPreview(value);
      if (["overlayAssets", "customSounds", "backgroundMusicSlots", "videoClipSlots"].includes(name)) value = Array.isArray(value) ? value.map(serverPreview) : value;
      if (name === "videoClips" && value && typeof value === "object") value = { intro: serverPreview(value.intro), outro: serverPreview(value.outro) };
      write(KEYS[name], value);
    });
    window.dispatchEvent(new Event("storage"));
  }
  function isWorkspaceCreate(url, method, body) {
    return method === "POST" && /\/api\/studio\/workspaces\/?$/.test(url) && body && body.restoreFromBackup !== true;
  }
  function workspaceIdFromUrl(url) { var match = String(url || "").match(/\/api\/studio\/workspaces\/([^/?#]+)/); return match ? decodeURIComponent(match[1]) : ""; }
  function openMediaDb() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error("Browser media storage is unavailable.")); return; }
      var request = window.indexedDB.open("studioflow-recordings", 3);
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error || new Error("Browser media storage could not be opened.")); };
    });
  }
  function readLocalMedia(blobKey) {
    return openMediaDb().then(function (db) { return new Promise(function (resolve, reject) {
      var request = db.transaction("recordingBlobs", "readonly").objectStore("recordingBlobs").get(blobKey);
      request.onsuccess = function () { db.close(); var value = request.result; resolve(value && typeof value.arrayBuffer === "function" && typeof value.size === "number" ? value : null); };
      request.onerror = function () { db.close(); reject(request.error || new Error("Browser media could not be read.")); };
    }); });
  }
  function visitAssets(configuration, callback) {
    if (!configuration || typeof configuration !== "object") return;
    function visit(asset, role) { if (asset && typeof asset === "object" && !Array.isArray(asset)) callback(asset, role); }
    visit(configuration.customBackground, "background");
    visit(configuration.customLogo, "logo");
    (Array.isArray(configuration.overlayAssets) ? configuration.overlayAssets : []).forEach(function (asset) { visit(asset, "overlay"); });
    var clips = configuration.videoClips && typeof configuration.videoClips === "object" ? configuration.videoClips : {};
    visit(clips.intro, "intro"); visit(clips.outro, "outro");
    var videoSlots = Array.isArray(configuration.videoClipSlots) ? configuration.videoClipSlots : [];
    var videoKeys = {};
    [clips.intro, clips.outro].forEach(function (asset) { if (asset && typeof asset.blobKey === "string" && asset.blobKey) videoKeys[asset.blobKey] = true; });
    videoSlots.forEach(function (asset) { if (asset && (!asset.blobKey || !videoKeys[asset.blobKey])) visit(asset, "video-clip"); });
    var musicSlots = Array.isArray(configuration.backgroundMusicSlots) ? configuration.backgroundMusicSlots : [];
    if (!musicSlots.some(function (asset) { return asset && typeof asset === "object" && text(asset.blobKey); })) visit(configuration.backgroundMusic, "background-music");
    visit(configuration.customSound, "sound");
    (Array.isArray(configuration.customSounds) ? configuration.customSounds : []).forEach(function (asset) { visit(asset, "sound"); });
    musicSlots.forEach(function (asset) { visit(asset, "background-music"); });
  }
  function extensionType(fileName) {
    var extension = text(fileName).toLowerCase().split(".").pop();
    return { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", svg: "image/svg+xml", mp4: "video/mp4", webm: "video/webm", mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", m4a: "audio/mp4" }[extension] || "";
  }
  function extensionForType(type) {
    return { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg", "video/mp4": "mp4", "video/webm": "webm" }[text(type).toLowerCase()] || "bin";
  }
  function mediaType(asset, role, blob) {
    var type = text(blob && blob.type).toLowerCase();
    if (/^(image|video|audio)\//.test(type)) return type;
    type = text(asset && asset.serverContentType).toLowerCase();
    if (/^(image|video|audio)\//.test(type)) return type;
    type = extensionType(asset && asset.fileName);
    if (type) return type;
    if (role === "background" && text(asset && asset.mediaType) === "video") return "video/mp4";
    if (role === "intro" || role === "outro") return "video/mp4";
    if (role === "background-music" || role === "sound") return "audio/mpeg";
    return "image/png";
  }
  function persistLocalAsset(workspaceId, asset, role) {
    return readLocalMedia(asset.blobKey).then(function (blob) {
      if (!blob) return { asset: asset, changed: false };
      var type = mediaType(asset, role, blob), name = text(asset.fileName) || (role + ".bin"), form = new FormData();
      form.append("file", new File([blob], name, { type: type }));
      return originalFetch("/api/studio/workspaces/" + encodeURIComponent(workspaceId) + "/media", { method: "POST", credentials: "same-origin", body: form }).then(function (response) {
        return response.text().then(function (raw) {
          var body = {}; try { body = raw ? JSON.parse(raw) : {}; } catch (error) {}
          if (!response.ok || !body.asset) throw new Error(body.error || "Studio media upload failed.");
          var uploaded = body.asset;
          return { asset: Object.assign({}, asset, { serverAssetId: uploaded.serverAssetId || uploaded.id, serverUrl: uploaded.serverUrl, serverContentType: uploaded.contentType || type, mediaKind: uploaded.mediaKind || role }), changed: true };
        });
      });
    });
  }
  function ensureCustomBackground(configuration) {
    if (!configuration || configuration.selectedBackground !== "custom-image" || configuration.customBackground) return Promise.resolve(configuration);
    var blobKey = "media-custom-background";
    return readLocalMedia(blobKey).then(function (blob) {
      if (!blob) return configuration;
      var type = mediaType({}, "background", blob);
      configuration.customBackground = {
        blobKey: blobKey,
        fileName: "custom-background." + extensionForType(type),
        mediaType: /^video\//.test(type) ? "video" : "image",
        size: blob.size,
        title: "Custom background",
        uploadedAt: new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
      };
      return configuration;
    }).catch(function () { return configuration; });
  }
  function uploadAsset(workspaceId, asset, role) {
    if (!asset || !text(asset.blobKey)) return Promise.resolve({ asset: asset, changed: false });
    if (text(asset.serverAssetId) && text(asset.serverUrl)) {
      return originalFetch(asset.serverUrl, { method: "GET", credentials: "same-origin", cache: "no-store" }).then(function (response) {
        if (response.ok || response.status !== 404) return { asset: asset, changed: false };
        return persistLocalAsset(workspaceId, asset, role);
      }).catch(function () { return { asset: asset, changed: false }; });
    }
    return persistLocalAsset(workspaceId, asset, role);
  }
  function replaceAssets(configuration, replacements) {
    var index = 0, replace = function (asset) { return asset && replacements[index++] ? replacements[index - 1] : asset; };
    if (configuration.customBackground) configuration.customBackground = replace(configuration.customBackground);
    if (configuration.customLogo) configuration.customLogo = replace(configuration.customLogo);
    configuration.overlayAssets = Array.isArray(configuration.overlayAssets) ? configuration.overlayAssets.map(replace) : configuration.overlayAssets;
    if (configuration.videoClips && typeof configuration.videoClips === "object") { configuration.videoClips.intro = replace(configuration.videoClips.intro); configuration.videoClips.outro = replace(configuration.videoClips.outro); }
    configuration.videoClipSlots = Array.isArray(configuration.videoClipSlots) ? configuration.videoClipSlots.map(replace) : configuration.videoClipSlots;
    configuration.backgroundMusic = replace(configuration.backgroundMusic);
    configuration.customSound = replace(configuration.customSound);
    configuration.customSounds = Array.isArray(configuration.customSounds) ? configuration.customSounds.map(replace) : configuration.customSounds;
    configuration.backgroundMusicSlots = Array.isArray(configuration.backgroundMusicSlots) ? configuration.backgroundMusicSlots.map(replace) : configuration.backgroundMusicSlots;
  }
  function syncMedia(workspaceId, configuration) {
    var next = clone(configuration || {}), assets = [], replacements = [];
    return ensureCustomBackground(next).then(function () {
      visitAssets(next, function (asset, role) { assets.push({ asset: asset, role: role }); });
      return assets.reduce(function (promise, item) { return promise.then(function () { return uploadAsset(workspaceId, item.asset, item.role).then(function (result) { replacements.push(result.asset); }); }); }, Promise.resolve());
    }).then(function () {
      replaceAssets(next, replacements);
      return { configuration: next, changed: replacements.some(function (asset, index) { return assets[index] && asset !== assets[index].asset; }) };
    });
  }
  var originalFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    var method = String((init && init.method) || (input && input.method) || "GET").toUpperCase();
    var requestInit = init ? Object.assign({}, init) : {};
    var parsedBody = null;
    if (requestInit.body && typeof requestInit.body === "string") { try { parsedBody = JSON.parse(requestInit.body); } catch (error) {} }
    var isCreate = parsedBody && isWorkspaceCreate(url, method, parsedBody);
    var isPatch = parsedBody && method === "PATCH" && /\/api\/studio\/workspaces\//.test(url);
    // Captured at send time — before syncMedia's upload window — so edits made
    // while the request (and its media uploads) are in flight are preserved.
    var keyGuard = captureKeyGuard();
    var prepare = Promise.resolve();
    if (parsedBody && (isCreate || isPatch)) {
      var restoringFromBackup = isCreate && parsedBody.restoreFromBackup === true;
      var configuration = isCreate ? (restoringFromBackup ? Object.assign({}, parsedBody.state && parsedBody.state.configuration || {}) : Object.assign({}, defaults(), parsedBody.state && parsedBody.state.configuration || {}, assetConfiguration())) : Object.assign({}, parsedBody.state && parsedBody.state.configuration || {}, assetConfiguration());
      if (isCreate) {
        if (!restoringFromBackup) applyConfiguration(configuration);
        parsedBody.state = { broadcast: parsedBody.state && parsedBody.state.broadcast || { id: parsedBody.localBroadcastId, title: parsedBody.title || "Untitled Studio", description: parsedBody.description || "", scheduledAt: null, visibility: "private", status: "draft", tpiSync: null }, settings: parsedBody.state && parsedBody.state.settings || { programOrientation: "landscape", recordingDestination: "browser", keepLocalBackup: true, saveAutomatically: false, recordBackstageAutomatically: false, resumeBackstageAfterShow: false }, recording: parsedBody.state && parsedBody.state.recording || { localLibraryCount: 0, incompleteSessionCount: 0, storageMode: "browser" }, configuration: configuration };
        delete parsedBody.restoreFromBackup;
        requestInit.body = JSON.stringify(parsedBody);
      } else {
        prepare = syncMedia(workspaceIdFromUrl(url), configuration).then(function (result) { parsedBody.state = Object.assign({}, parsedBody.state || {}, { configuration: result.configuration }); requestInit.body = JSON.stringify(parsedBody); });
      }
    }
    return prepare.then(function () { return originalFetch(input, requestInit); }).then(async function (response) {
      if (response.ok && isCreate) {
        try {
          var created = await response.clone().json(), workspace = created && created.workspace;
          if (workspace && workspace.id && workspace.state && workspace.state.configuration) {
            var synced = await syncMedia(workspace.id, workspace.state.configuration);
            if (synced.changed) {
              var patched = await originalFetch("/api/studio/workspaces/" + encodeURIComponent(workspace.id), { method: "PATCH", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: workspace.title, description: workspace.description || "", state: Object.assign({}, workspace.state, { configuration: synced.configuration }), expectedVersion: workspace.version }) });
              if (patched.ok) response = patched;
              else window.dispatchEvent(new CustomEvent("tpi:studio-media-sync-failed", { detail: { workspaceId: workspace.id } }));
            }
          }
        } catch (error) {
          window.dispatchEvent(new CustomEvent("tpi:studio-media-sync-failed", { detail: { error: error } }));
        }
      }
      if (response.ok && /\/api\/studio\/workspaces(?:\/[^/]+)?$/.test(url)) {
        try { var body = await response.clone().json(); if (body && body.workspace && body.workspace.state) applyConfiguration(body.workspace.state.configuration, keyGuard); } catch (error) {}
      }
      return response;
    });
  };
  normalizeStoredStudioScenes();
})();
