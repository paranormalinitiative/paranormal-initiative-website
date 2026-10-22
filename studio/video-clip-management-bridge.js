/*
 * TPI-STUDIOFLOW-020 / 022.
 *
 * The maintained React bundle remains the owner of the Intro/Outro scene
 * assignments and its existing ring countdown renderer. This bridge adds the
 * approved nine-card media organization around those contracts. Video bytes
 * stay in StudioFlow's existing IndexedDB recordingBlobs store; only small
 * metadata and derived thumbnails are kept in the workspace configuration.
 */
(function () {
  "use strict";

  var VIDEO_CLIPS_KEY = "studioflow.videoClips";
  var VIDEO_SLOTS_KEY = "studioflow.videoClipSlots";
  var TIMER_KEY = "studioflow.videoTimers";
  var LABELS = ["Intro Video", "Outro Video", "", "", "Video 5", "Video 6", "Video 7", "Video 8", "Video 9", "Video 10"];
  var VISIBLE_VIDEO_SLOTS = [0, 1, 4, 5, 6, 7, 8, 9];
  var INTRO_OUTRO_SLOTS = [0, 1];
  var VIDEO_ONLY_SLOTS = [4, 5, 6, 7, 8, 9];
  var TIMER_PRESETS = [10, 20, 30, 60];
  var SLOT_COUNT = 10;
  var scheduled = false;
  var root = null;
  var lastSignature = "";
  var previewUrls = {};
  var stagePreviewUrl = "";
  var stageRestoreVideo = null;
  var stageRestoreWasPlaying = false;
  var timerHandle = null;
  var timerEnd = null;
  var timerRemaining = 0;
  var timerDuration = 0;
  var timerSlot = null;

  function text(value) { return typeof value === "string" ? value : ""; }
  function clean(value) { return text(value).replace(/\s+/g, " ").trim(); }
  function normalize(value) { return clean(value).toLowerCase(); }
  function read(key, fallback) { try { var raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); } catch (error) { return fallback; } }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {} }
  function dispatchChange() { try { window.dispatchEvent(new Event("storage")); } catch (error) {} try { window.dispatchEvent(new CustomEvent("studioflow:storage-changed", { detail: { source: "video-organization" } })); } catch (error) {} }
  function titleFor(fileName) { return clean(fileName).replace(/\.[^.]+$/, "") || "Untitled video"; }
  function idFor(slot) { return "video-clip-slot-" + (slot + 1) + "-" + Date.now() + "-" + Math.random().toString(16).slice(2); }
  function blobKeyFor(slot) { return "media-video-slot-" + (slot + 1) + "-" + Date.now() + "-" + Math.random().toString(16).slice(2); }
  function videoType(file) { var type = text(file && file.type).toLowerCase(); if (type.indexOf("video/") === 0) return type; var extension = clean(file && file.name).toLowerCase().split(".").pop(); return { mp4: "video/mp4", webm: "video/webm", ogv: "video/ogg", ogg: "video/ogg", mov: "video/quicktime" }[extension] || ""; }
  function validVideo(file) { if (!file || !videoType(file)) throw new Error("Choose an MP4, WebM, Ogg, or MOV video."); if (file.size > 250 * 1024 * 1024) throw new Error("This video is larger than the supported 250 MB limit."); }
  function openMediaDb() { return new Promise(function (resolve, reject) { if (!window.indexedDB) { reject(new Error("Browser media storage is unavailable.")); return; } var request = window.indexedDB.open("studioflow-recordings", 3); request.onsuccess = function () { resolve(request.result); }; request.onerror = function () { reject(request.error || new Error("Browser media storage could not be opened.")); }; }); }
  function putBlob(key, file) { return openMediaDb().then(function (db) { return new Promise(function (resolve, reject) { var transaction; try { transaction = db.transaction("recordingBlobs", "readwrite"); } catch (error) { db.close(); reject(error); return; } transaction.objectStore("recordingBlobs").put(file, key); transaction.oncomplete = function () { db.close(); resolve(true); }; transaction.onerror = function () { db.close(); reject(transaction.error || new Error("Video could not be saved.")); }; transaction.onabort = function () { db.close(); reject(transaction.error || new Error("Video could not be saved.")); }; }); }); }
  function getBlob(key) { return openMediaDb().then(function (db) { return new Promise(function (resolve, reject) { var request; try { request = db.transaction("recordingBlobs", "readonly").objectStore("recordingBlobs").get(key); } catch (error) { db.close(); reject(error); return; } request.onsuccess = function () { db.close(); resolve(request.result || null); }; request.onerror = function () { db.close(); reject(request.error || new Error("Video could not be read.")); }; }); }); }
  function getVideoBlob(asset, slot) {
    var fallback = slot === 0 ? "media-video-intro" : slot === 1 ? "media-video-outro" : "";
    var keys = [text(asset && asset.blobKey), fallback].filter(function (key, index, all) { return key && all.indexOf(key) === index; });
    function readNext(index) { if (index >= keys.length) return Promise.resolve(null); return getBlob(keys[index]).then(function (blob) { return blob || readNext(index + 1); }); }
    return readNext(0);
  }
  function deleteBlob(key) { if (!key) return Promise.resolve(true); return openMediaDb().then(function (db) { return new Promise(function (resolve, reject) { var transaction; try { transaction = db.transaction("recordingBlobs", "readwrite"); } catch (error) { db.close(); reject(error); return; } transaction.objectStore("recordingBlobs").delete(key); transaction.oncomplete = function () { db.close(); resolve(true); }; transaction.onerror = function () { db.close(); reject(transaction.error || new Error("Video could not be removed.")); }; }); }); }
  function slotArray(value) { var slots = new Array(SLOT_COUNT).fill(null); if (!Array.isArray(value)) return slots; value.forEach(function (asset, index) { if (!asset || typeof asset !== "object") return; var slot = Number.isInteger(asset.slot) && asset.slot >= 0 && asset.slot < SLOT_COUNT ? asset.slot : index; if (slot >= 0 && slot < SLOT_COUNT && !slots[slot]) slots[slot] = Object.assign({}, asset, { slot: slot }); }); return slots; }
  function syncFromReact(clips, slots) { var changed = false; ["intro", "outro"].forEach(function (kind, index) { var reactAsset = clips && clips[kind] && typeof clips[kind] === "object" ? clips[kind] : null; var storedAsset = slots[index]; var reactKey = reactAsset && text(reactAsset.blobKey); var storedKey = storedAsset && text(storedAsset.blobKey); if (reactKey && reactKey !== storedKey) { slots[index] = Object.assign({}, reactAsset, { slot: index, label: LABELS[index] }); changed = true; } else if (!reactKey && storedKey) { var matchingScene = (Array.isArray(read("studioflow.studioScenes", [])) ? read("studioflow.studioScenes", []) : []).some(function (scene) { var clip = scene && scene.videoClip; return scene && scene.kind === kind && clip && clip.blobKey === storedKey; }); if (matchingScene) { clips[kind] = Object.assign({}, storedAsset); write(VIDEO_CLIPS_KEY, clips); } else { slots[index] = null; changed = true; } } }); return changed; }
  function videoSlots() { var clips = read(VIDEO_CLIPS_KEY, { intro: null, outro: null }); var stored = read(VIDEO_SLOTS_KEY, null); var slots = slotArray(stored); if (stored === null || syncFromReact(clips, slots)) write(VIDEO_SLOTS_KEY, slots); return slots; }
  function saveSlots(slots) { write(VIDEO_SLOTS_KEY, slots); }
  function restoreSceneAssignments(slot, asset) { if (slot > 1 || !asset) return; var scenes = read("studioflow.studioScenes", []); if (!Array.isArray(scenes)) return; var kind = slot === 0 ? "intro" : "outro", updated = false; scenes.forEach(function (scene) { if (scene && scene.kind === kind) { scene.videoClip = Object.assign({}, asset); scene.videoClipId = asset.id; updated = true; } }); if (updated) write("studioflow.studioScenes", scenes); }
  function updateReactClip(slot, asset) { if (slot > 1) return; var clips = read(VIDEO_CLIPS_KEY, { intro: null, outro: null }) || {}; var kind = slot === 0 ? "intro" : "outro"; clips[kind] = asset ? Object.assign({}, asset) : null; if (clips[kind]) delete clips[kind].previewUrl; write(VIDEO_CLIPS_KEY, clips); }
  function setStatus(value, error) { if (!root) return; var status = root.querySelector("[data-tpi-video-status]"); if (status) { status.textContent = value || ""; status.classList.toggle("error", !!error); } }
  function thumbnail(file) {
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file), video = document.createElement("video"), canvas = document.createElement("canvas"), context = canvas.getContext("2d"), samples = [0.25, 0.5, 0.75, 0.05], index = 0;
      var finish = function (value) { try { URL.revokeObjectURL(url); } catch (error) {} video.removeAttribute("src"); video.load(); resolve(value || ""); };
      if (!context) { finish(""); return; }
      video.muted = true; video.preload = "metadata"; video.playsInline = true; video.src = url;
      video.onerror = function () { finish(""); };
      video.onloadedmetadata = function () { var duration = Number(video.duration); if (!isFinite(duration) || duration <= 0) { finish(""); return; } canvas.width = 320; canvas.height = 180; video.currentTime = Math.min(Math.max(0, duration * samples[index]), Math.max(0, duration - 0.05)); };
      video.onseeked = function () { try { context.drawImage(video, 0, 0, canvas.width, canvas.height); var pixels = context.getImageData(0, 0, canvas.width, canvas.height).data, total = 0; for (var pixel = 0; pixel < pixels.length; pixel += 16) total += pixels[pixel] + pixels[pixel + 1] + pixels[pixel + 2]; var average = total / Math.max(1, Math.floor(pixels.length / 16) * 3); if (average >= 12 || index === samples.length - 1) { finish(canvas.toDataURL("image/jpeg", 0.8)); return; } index += 1; video.currentTime = Math.min(Math.max(0, duration * samples[index]), Math.max(0, duration - 0.05)); } catch (error) { finish(""); } };
    });
  }
  function labelFor(slot) { return LABELS[slot] || "Video"; }
  function makeAsset(file, slot, thumbnailDataUrl) { return { id: idFor(slot), slot: slot, label: labelFor(slot), blobKey: blobKeyFor(slot), fileName: clean(file.name), mediaType: videoType(file), size: file.size, title: titleFor(file.name), thumbnailDataUrl: thumbnailDataUrl || "", uploadedAt: new Date().toISOString() }; }
  function chooseFile(slot) {
    var input = document.createElement("input"); input.type = "file"; input.accept = "video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogv,.mov"; input.hidden = true;
    input.addEventListener("change", function () { var file = input.files && input.files[0]; if (!file) { input.remove(); return; } var slots = videoSlots(), previous = slots[slot]; try { validVideo(file); } catch (error) { setStatus(error.message, true); input.remove(); return; } setStatus("Saving " + clean(file.name) + "…"); thumbnail(file).then(function (thumb) { var asset = makeAsset(file, slot, thumb); return putBlob(asset.blobKey, file).then(function () { slots[slot] = asset; saveSlots(slots); updateReactClip(slot, asset); restoreSceneAssignments(slot, asset); dispatchChange(); return true; }).then(function () { if (previous && previous.blobKey && previous.blobKey !== asset.blobKey) return deleteBlob(previous.blobKey); return true; }).then(function () { setStatus(labelFor(slot) + " saved."); render(); }); }).catch(function (error) { setStatus(error.message || "Video could not be saved.", true); }).finally(function () { input.remove(); }); });
    document.body.appendChild(input); input.click();
  }
  function removeAsset(slot) { var slots = videoSlots(), asset = slots[slot]; if (!asset) return; if (!requestSlotChange(slot, "remove")) return; slots[slot] = null; saveSlots(slots); updateReactClip(slot, null); restoreSceneAssignments(slot, null); dispatchChange(); deleteBlob(asset.blobKey).catch(function () {}).then(function () { setStatus(labelFor(slot) + " removed."); render(); }); }
  function previewAsset(card, asset) { if (!asset) return; var video = card.querySelector("video[data-tpi-preview]"); if (!video) return; if (!video.src) { setStatus("Loading " + asset.fileName + "…"); getBlob(asset.blobKey).then(function (blob) { if (!blob) throw new Error("The video file is no longer available."); var url = URL.createObjectURL(blob); previewUrls[asset.blobKey] = url; video.src = url; video.hidden = false; return video.play(); }).then(function () { setStatus("Playing " + asset.fileName + "."); }).catch(function (error) { setStatus(error.message || "Video playback failed.", true); }); return; } video.hidden = false; var playback = video.paused ? video.play() : video.pause(); if (playback && typeof playback.catch === "function") playback.catch(function () {}); }
  function preloadPreview(card, asset, slot) {
    if (!asset) return;
    var video = card.querySelector("video[data-tpi-preview]");
    if (!video || video.src) return;
    getVideoBlob(asset, slot).then(function (blob) {
      var badge = card.querySelector("[data-tpi-preview-label]"), preview = card.querySelector(".tpi-video-card-preview");
      if (!blob) { if (badge) badge.textContent = "Clip loaded"; return; }
      var media = blob && typeof blob.arrayBuffer === "function" && typeof blob.size === "number" ? blob : new Blob([blob], { type: asset.mediaType || "video/mp4" });
      var url = URL.createObjectURL(media);
      previewUrls[asset.blobKey] = url;
      video.src = url;
      video.hidden = true;
      video.load();
      return thumbnail(media).then(function (thumb) {
        if (thumb && preview) {
          var image = document.createElement("img");
          image.src = thumb;
          image.alt = (asset.title || asset.fileName || "Assigned video") + " thumbnail";
          image.dataset.tpiGeneratedPreview = "true";
          preview.insertBefore(image, video);
          var fallback = preview.querySelector(".tpi-video-card-fallback");
          if (fallback) fallback.remove();
        }
        if (badge) badge.textContent = thumb ? "Preview" : "Clip loaded";
      });
    }).catch(function () {});
  }
  function clearStagePlayback(restore) { var stage = document.querySelector(".program-stage"), video = stage && stage.querySelector("video.tpi-video-clip-stage-video"); if (video) { try { video.pause(); } catch (error) {} video.remove(); } if (stagePreviewUrl) { try { URL.revokeObjectURL(stagePreviewUrl); } catch (error) {} stagePreviewUrl = ""; } if (restore && stageRestoreVideo && stageRestoreVideo.isConnected && stageRestoreWasPlaying) { var playback = stageRestoreVideo.play(); if (playback && typeof playback.catch === "function") playback.catch(function () {}); } stageRestoreVideo = null; stageRestoreWasPlaying = false; }
  function playAssetOnStage(asset) { if (!asset) return; var stage = document.querySelector(".program-stage"); if (!stage) { setStatus("The StudioFlow stage is unavailable.", true); return; } clearStagePlayback(true); stageRestoreVideo = stage.querySelector("video.stage-video:not(.tpi-video-clip-stage-video)"); stageRestoreWasPlaying = !!(stageRestoreVideo && !stageRestoreVideo.paused); if (stageRestoreVideo) { try { stageRestoreVideo.pause(); } catch (error) {} } setStatus("Loading " + asset.fileName + " on stage…"); var existingUrl = previewUrls[asset.blobKey] || ""; var load = existingUrl ? Promise.resolve(null) : getBlob(asset.blobKey); load.then(function (blob) { if (!existingUrl && !blob) throw new Error("The video file is no longer available."); var url = existingUrl || URL.createObjectURL(blob); stagePreviewUrl = existingUrl ? "" : url; var video = document.createElement("video"); video.className = "stage-video contain tpi-video-clip-stage-video"; video.dataset.tpiVideoStagePlayback = "true"; video.autoplay = true; video.controls = false; video.muted = false; video.playsInline = true; video.preload = "auto"; video.src = url; video.addEventListener("ended", function () { clearStagePlayback(true); setStatus(asset.fileName + " finished on stage."); }, { once: true }); video.addEventListener("error", function () { clearStagePlayback(true); setStatus("The video could not play on stage.", true); }, { once: true }); stage.appendChild(video); var playback = video.play(); if (playback && typeof playback.catch === "function") playback.catch(function () { setStatus("Click the stage video to start playback.", true); }); setStatus("Playing " + asset.fileName + " on stage."); }).catch(function (error) { clearStagePlayback(true); setStatus(error.message || "Video playback failed.", true); }); }
  function clearPreviewUrls() { Object.keys(previewUrls).forEach(function (key) { try { URL.revokeObjectURL(previewUrls[key]); } catch (error) {} }); previewUrls = {}; }
  function makeButton(label, action, disabled) { var button = document.createElement("button"); button.type = "button"; button.className = "outline-button tpi-video-card-action"; button.dataset.tpiVideoAction = action; button.textContent = label; button.disabled = !!disabled; return button; }
  function protectedSlot(slot) { return slot < 2; }
  function requestSlotChange(slot, action) {
    if (!protectedSlot(slot)) return true;
    return window.confirm((slot === 0 ? "Intro" : "Outro") + " is a permanent podcast identity slot. " + (action === "remove" ? "Remove" : "Replace") + " its assigned video?");
  }
  function makeCard(asset, slot) {
    var card = document.createElement("article"); card.className = "tpi-video-card " + (asset ? "assigned" : "empty"); card.dataset.tpiVideoCard = String(slot); card.setAttribute("aria-label", labelFor(slot) + (asset ? ": " + asset.fileName : ": empty"));
    var preview = document.createElement("div"); preview.className = "tpi-video-card-preview";
    if (asset && asset.thumbnailDataUrl) { var image = document.createElement("img"); image.src = asset.thumbnailDataUrl; image.alt = asset.title + " thumbnail"; preview.appendChild(image); } else if (!asset) { var empty = document.createElement("span"); empty.className = "tpi-video-card-empty-icon"; empty.textContent = "▶"; empty.setAttribute("aria-hidden", "true"); preview.appendChild(empty); var placeholder = document.createElement("span"); placeholder.className = "tpi-video-card-placeholder"; placeholder.textContent = "Upload a video"; preview.appendChild(placeholder); } else { var fallback = document.createElement("span"); fallback.className = "tpi-video-card-fallback"; fallback.textContent = "Video assigned · preview unavailable"; preview.appendChild(fallback); }
    if (asset) { var video = document.createElement("video"); video.controls = slot >= 4; video.muted = true; video.playsInline = true; video.preload = "metadata"; video.hidden = true; video.dataset.tpiPreview = "true"; if (slot < 2) { video.disablePictureInPicture = true; video.disableRemotePlayback = true; video.setAttribute("controlslist", "nodownload noplaybackrate noremoteplayback"); video.style.pointerEvents = "none"; } preview.appendChild(video); if (slot < 2) { var previewLabel = document.createElement("span"); previewLabel.className = "tpi-video-card-preview-label"; previewLabel.dataset.tpiPreviewLabel = "true"; previewLabel.textContent = asset.thumbnailDataUrl ? "Preview" : "Loading preview…"; previewLabel.setAttribute("aria-label", "Assigned clip preview"); preview.appendChild(previewLabel); } }
    var body = document.createElement("div"); body.className = "tpi-video-card-body"; var heading = document.createElement("strong"); heading.className = "tpi-video-card-label"; heading.textContent = labelFor(slot); var file = document.createElement("span"); file.className = "tpi-video-card-file"; file.textContent = asset ? asset.fileName : "No video assigned"; file.title = asset ? asset.fileName : "No video assigned"; body.append(heading, file);
    var actions = document.createElement("div"); actions.className = "tpi-video-card-actions";
    var actionToggle = null, actionMenu = null;
    if (asset) {
      actionToggle = document.createElement("button"); actionToggle.type = "button"; actionToggle.className = "outline-button tpi-video-card-menu-toggle"; actionToggle.dataset.tpiVideoMenuToggle = "true"; actionToggle.setAttribute("aria-label", labelFor(slot) + " video actions"); actionToggle.setAttribute("aria-expanded", "false"); actionToggle.textContent = "•••";
      actionMenu = document.createElement("div"); actionMenu.className = "tpi-video-card-action-menu"; actionMenu.hidden = true; actionMenu.setAttribute("role", "group"); if (slot >= 4) actionMenu.append(makeButton("Play in stage", "stage-play", false), makeButton("Preview", "preview", false)); actionMenu.append(makeButton("Replace", "replace", false), makeButton("Remove", "remove", false)); actions.append(actionToggle, actionMenu);
    } else {
      actions.appendChild(makeButton("Upload", "upload", false));
    }
    card.append(preview, body, actions); if (asset && !asset.thumbnailDataUrl) preloadPreview(card, asset, slot);

    card.addEventListener("click", function (event) { var toggle = event.target.closest("button[data-tpi-video-menu-toggle]"); if (toggle && actionMenu && actionToggle) { var opening = actionMenu.hidden; actionMenu.hidden = !opening; toggle.setAttribute("aria-expanded", String(opening)); return; } var target = event.target.closest("button[data-tpi-video-action]"); if (!target) { if (asset && slot >= 4) playAssetOnStage(asset); else if (!asset) chooseFile(slot); return; } var action = target.dataset.tpiVideoAction; if (action === "stage-play") playAssetOnStage(asset); if (action === "preview") previewAsset(card, asset); if (action === "replace" && requestSlotChange(slot, "replace")) chooseFile(slot); if (action === "upload") chooseFile(slot); if (action === "remove") removeAsset(slot); if (actionMenu && actionToggle) { actionMenu.hidden = true; actionToggle.setAttribute("aria-expanded", "false"); } });
    return card;
  }
  function timerSettings() { var value = read(TIMER_KEY, {}); return value && typeof value === "object" ? { custom1: Math.max(1, Math.min(3600, Number(value.custom1) || 90)), custom2: Math.max(1, Math.min(3600, Number(value.custom2) || 120)) } : { custom1: 90, custom2: 120 }; }
  function updateTimerDisplay() { if (!root) return; var display = root.querySelector("[data-tpi-timer-status]"), countdown = root.querySelector("[data-tpi-timer-countdown]"); if (!display) return; var remaining = timerEnd ? Math.max(0, timerEnd - Date.now()) : timerRemaining; if (countdown) { var totalSeconds = Math.ceil(remaining / 1000); countdown.textContent = String(Math.floor(totalSeconds / 60)).padStart(2, "0") + ":" + String(totalSeconds % 60).padStart(2, "0"); } if (timerSlot === null) { display.textContent = "Select a timer"; return; } display.textContent = "Timer " + (timerSlot + 1) + (timerEnd ? " running · " : timerRemaining > 0 ? " paused · " : " selected · ") + Math.ceil(remaining / 1000) + " seconds"; }
  function timerControls() { var controls = Array.prototype.slice.call(document.querySelectorAll(".countdown-duration-row button")); return { presets: controls.filter(function (button) { return /^\d+s$/.test(normalize(button.textContent)); }), stop: controls.find(function (button) { return normalize(button.textContent) === "stop"; }), start: Array.prototype.slice.call(document.querySelectorAll("section.asset-section button.background-picker-tile")).find(function (button) { return normalize(button.title).indexOf("golden ring countdown") !== -1; }) }; }
  function selectTimerDuration(seconds) { var control = timerControls(), preset = control.presets.find(function (button) { return normalize(button.textContent) === String(seconds) + "s"; }); if (!preset || !control.start) { setStatus("The StudioFlow countdown controls are unavailable.", true); return false; } preset.click(); control.start.click(); return true; }
  function setTimerState(slot, seconds, remaining) { timerSlot = slot; timerDuration = seconds; timerRemaining = Math.max(0, remaining); timerEnd = timerRemaining > 0 ? Date.now() + timerRemaining : null; }
  function pauseTimer() { if (!timerEnd) return; timerRemaining = Math.max(0, timerEnd - Date.now()); timerEnd = null; if (timerHandle) window.clearInterval(timerHandle); timerHandle = null; render(); }
  function resumeTimer() { if (timerSlot === null || timerEnd || timerRemaining <= 0) return; var selectedSeconds = timerDuration; if (TIMER_PRESETS.indexOf(selectedSeconds) !== -1 && !selectTimerDuration(selectedSeconds)) return; if (TIMER_PRESETS.indexOf(selectedSeconds) === -1) { var native = timerControls(); var preset = native.presets.find(function (button) { return normalize(button.textContent) === "60s"; }); if (preset && native.start) { preset.click(); native.start.click(); } } timerEnd = Date.now() + timerRemaining; timerHandle = window.setInterval(function () { if (!timerEnd || Date.now() >= timerEnd) stopTimer(false); else { timerRemaining = Math.max(0, timerEnd - Date.now()); render(); } }, 250); render(); }
  function stopTimer(stopNative) { if (timerHandle) window.clearInterval(timerHandle); timerHandle = null; timerEnd = null; timerRemaining = 0; timerSlot = null; if (stopNative !== false) { var nativeStop = timerControls().stop; if (nativeStop) nativeStop.click(); } updateTimerDisplay(); render(); }
  function startTimer(slot, seconds) { if (TIMER_PRESETS.indexOf(seconds) !== -1) { if (!selectTimerDuration(seconds)) return; } else { var customControl = timerControls(); var preset = customControl.presets.find(function (button) { return normalize(button.textContent) === "60s"; }); if (preset && customControl.start) { preset.click(); customControl.start.click(); } }
    if (timerHandle) window.clearInterval(timerHandle); timerHandle = null; setTimerState(slot, seconds, seconds * 1000); timerHandle = window.setInterval(function () { if (!timerEnd || Date.now() >= timerEnd) stopTimer(false); else { timerRemaining = Math.max(0, timerEnd - Date.now()); render(); } }, 250); updateTimerDisplay(); render(); }
  function timerCard(slot, label, seconds, customKey) { var selected = timerSlot === slot, card = document.createElement("article"); card.className = "tpi-video-timer-card" + (selected ? " selected" : "") + (selected && timerEnd ? " running" : ""); card.setAttribute("aria-label", label + (selected ? ", selected" : "")); var heading = document.createElement("strong"); heading.textContent = label; var detail = document.createElement("span"); detail.className = "tpi-video-timer-duration"; detail.textContent = customKey ? seconds + " seconds" : seconds + " seconds"; card.append(heading, detail); if (customKey) { var input = document.createElement("input"); input.type = "number"; input.min = "1"; input.max = "3600"; input.value = String(seconds); input.setAttribute("aria-label", label + " duration in seconds"); input.addEventListener("change", function () { var next = timerSettings(); next[customKey] = Math.max(1, Math.min(3600, Number(input.value) || seconds)); write(TIMER_KEY, next); render(); }); card.appendChild(input); } var actions = document.createElement("div"); actions.className = "tpi-video-timer-actions"; var select = makeButton(selected ? "Selected" : "Select", "select-timer", false); select.dataset.tpiTimerSlot = String(slot); select.dataset.tpiTimerSeconds = String(seconds); actions.appendChild(select); if (selected && !timerEnd && timerRemaining > 0) actions.appendChild(makeButton("Resume", "resume-timer", false)); if (selected && timerEnd) actions.appendChild(makeButton("Pause", "pause-timer", false)); if (selected) { var start = makeButton("Start", "start-timer", false); start.dataset.tpiTimerSlot = String(slot); start.dataset.tpiTimerSeconds = String(seconds); actions.appendChild(start); } if (selected && (timerEnd || timerRemaining > 0)) actions.appendChild(makeButton("Stop", "stop-timer", false)); if (selected) actions.appendChild(makeButton("Reset", "reset-timer", false)); card.appendChild(actions); return card; }
  function makeTimerSection() { var section = document.createElement("section"); section.className = "tpi-video-timers"; section.dataset.tpiVideoTimers = "true"; var heading = document.createElement("h4"); heading.textContent = "VIDEO TIMERS"; section.appendChild(heading); var status = document.createElement("p"); status.dataset.tpiTimerStatus = "true"; status.className = "tpi-video-timer-status"; section.appendChild(status); var output = document.createElement("output"); output.className = "tpi-video-timer-countdown"; output.dataset.tpiTimerCountdown = "true"; output.setAttribute("aria-live", "off"); section.appendChild(output); var grid = document.createElement("div"); grid.className = "tpi-video-timer-grid"; var settings = timerSettings(); TIMER_PRESETS.forEach(function (seconds, index) { grid.appendChild(timerCard(index, seconds + " seconds", seconds, null)); }); grid.appendChild(timerCard(4, "Custom Timer 1", settings.custom1, "custom1")); grid.appendChild(timerCard(5, "Custom Timer 2", settings.custom2, "custom2")); section.appendChild(grid); return section; }
  function videoSection() { return Array.prototype.slice.call(document.querySelectorAll("section.asset-section")).find(function (section) { var heading = section.querySelector("h3"); return normalize(heading && heading.textContent) === "video clips"; }) || null; }
  function nativeTimerSection(section) {
    var timerSection = document.querySelector("section[data-tpi-video-timer-section='true']");
    if (timerSection) return timerSection;
    timerSection = document.createElement("section");
    timerSection.className = "asset-section tpi-video-timer-section";
    timerSection.dataset.tpiVideoTimerSection = "true";
    var heading = document.createElement("h3");
    heading.textContent = "Video Timers";
    var content = document.createElement("div");
    content.className = "tpi-video-timer-content";
    var grid = document.createElement("div");
    grid.className = "background-picker-grid tpi-native-video-timer-grid";
    grid.dataset.tpiNativeVideoTimerGrid = "true";
    var controls = document.createElement("div");
    controls.className = "countdown-duration-row tpi-native-video-timer-controls";
    controls.dataset.tpiNativeVideoTimerControls = "true";
    content.append(grid, controls);
    timerSection.append(heading, content);
    section.insertAdjacentElement("afterend", timerSection);
    return timerSection;
  }
  function isCountdownTile(tile) { var label = normalize(tile.textContent), title = normalize(tile.getAttribute("title")); return title.indexOf("golden ring countdown") !== -1 || label.indexOf("countdown") !== -1 || label.indexOf("timer") !== -1; }
  function hideLegacyVideoPlaceholders(section) { Array.prototype.slice.call(section.querySelectorAll(".asset-grid button")).forEach(function (button) { var label = normalize(button.textContent); if (label === "thank you" || label === "be right back") { button.hidden = true; button.dataset.tpiLegacyVideoPlaceholder = "true"; } }); }
  function prepareNativeTimer(section, nativeGrid, nativeTimers) {
    hideLegacyVideoPlaceholders(section);
    var timerSection = nativeTimerSection(section);
    var timerGrid = timerSection.querySelector("[data-tpi-native-video-timer-grid]");
    var timerControls = timerSection.querySelector("[data-tpi-native-video-timer-controls]");
    var tiles = Array.prototype.slice.call(document.querySelectorAll(".background-picker-tile"));
    var countdownTiles = tiles.filter(isCountdownTile);
    var countdownTile = (nativeGrid && countdownTiles.find(function (tile) { return nativeGrid.contains(tile); })) || countdownTiles[0] || null;
    countdownTiles.forEach(function (tile) {
      if (tile === countdownTile) return;
      tile.hidden = true;
      if (timerGrid.contains(tile)) tile.remove();
    });
    if (countdownTile) {
      countdownTile.hidden = false;
      countdownTile.dataset.tpiNativeVideoTimer = "true";
      countdownTile.setAttribute("data-tpi-native-video-timer", "true");
      if (countdownTile.parentNode !== timerGrid) timerGrid.appendChild(countdownTile);
    }
    if (nativeTimers) {
      nativeTimers.hidden = false;
      if (nativeTimers.parentNode !== timerControls) timerControls.appendChild(nativeTimers);
    }
    if (nativeGrid) {
      Array.prototype.slice.call(nativeGrid.querySelectorAll(".background-picker-tile")).forEach(function (tile) { tile.hidden = true; });
      nativeGrid.hidden = true;
      nativeGrid.setAttribute("data-tpi-native-video-hidden", "true");
    }
    timerSection.hidden = !countdownTile && !nativeTimers;
  }
  function videoGroup(title, slots, assets) { var group = document.createElement("section"); group.className = "tpi-video-subsection"; group.dataset.tpiVideoSubsection = normalize(title).replace(/\s+/g, "-"); var heading = document.createElement("h4"); heading.textContent = title; var grid = document.createElement("div"); grid.className = "tpi-video-grid"; slots.forEach(function (slot) { grid.appendChild(makeCard(assets[slot], slot)); }); group.append(heading, grid); return group; }
  function render() { var section = videoSection(); if (!section) return; var nativeGrid = section.querySelector(".background-picker-grid"); var nativeTimers = section.querySelector(".countdown-duration-row"); prepareNativeTimer(section, nativeGrid, nativeTimers); if (!root || !root.isConnected || !section.contains(root)) { root = section.querySelector("[data-tpi-video-organization]"); if (!root) { root = document.createElement("div"); root.className = "tpi-video-organization"; root.dataset.tpiVideoOrganization = "true"; (nativeGrid || section).insertAdjacentElement("afterend", root); } } var slots = videoSlots(), signature = JSON.stringify({ slots: slots, running: timerSlot, end: timerEnd ? Math.ceil((timerEnd - Date.now()) / 1000) : 0, remaining: Math.ceil(timerRemaining / 1000) }); if (signature === lastSignature && root.childElementCount) { updateTimerDisplay(); return; } lastSignature = signature; clearPreviewUrls(); root.replaceChildren(); root.append(videoGroup("INTRO & OUTRO", INTRO_OUTRO_SLOTS, slots), videoGroup("VIDEO CLIPS", VIDEO_ONLY_SLOTS, slots)); var status = document.createElement("p"); status.dataset.tpiVideoStatus = "true"; status.className = "tpi-video-status"; root.appendChild(status); updateTimerDisplay(); }
  function sync() { scheduled = false; render(); }
  function schedule() { if (scheduled) return; scheduled = true; window.setTimeout(sync, 0); }
  function start() { schedule(); if (document.body && window.MutationObserver) new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true }); window.addEventListener("storage", schedule); window.addEventListener("studioflow:storage-changed", schedule); if (window.setInterval) window.setInterval(function () { if (timerEnd) { timerRemaining = Math.max(0, timerEnd - Date.now()); updateTimerDisplay(); if (Date.now() >= timerEnd) stopTimer(false); } }, 250); document.addEventListener("click", function (event) { var target = event.target.closest("[data-tpi-video-action]"); if (!target || !root || !root.contains(target)) return; var slot = Number(target.dataset.tpiTimerSlot), seconds = Number(target.dataset.tpiTimerSeconds); if (target.dataset.tpiVideoAction === "select-timer") { if (timerHandle) window.clearInterval(timerHandle); timerHandle = null; timerSlot = slot; timerDuration = seconds; timerEnd = null; timerRemaining = 0; render(); } if (target.dataset.tpiVideoAction === "start-timer") startTimer(slot, seconds); if (target.dataset.tpiVideoAction === "pause-timer") pauseTimer(); if (target.dataset.tpiVideoAction === "resume-timer") resumeTimer(); if (target.dataset.tpiVideoAction === "stop-timer") stopTimer(); if (target.dataset.tpiVideoAction === "reset-timer") { stopTimer(); timerSlot = slot; timerDuration = seconds; render(); } }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start();
})();
