/*
 * TPI-STUDIOFLOW-021.
 *
 * Adds the approved nine-slot sound-effects and nine-slot background-music
 * boards without replacing StudioFlow's workspace, IndexedDB, or backup
 * contracts. Audio metadata remains in the existing localStorage workspace
 * state and media bytes remain in the existing recordingBlobs object store.
 */
(function () {
  "use strict";

  var SOUND_KEY = "studioflow.customSounds";
  var MUSIC_KEY = "studioflow.backgroundMusicSlots";
  var LEGACY_MUSIC_KEY = "studioflow.backgroundMusic";
  var SOUND_VOLUME_KEY = "studioflow.soundVolume";
  var MUSIC_VOLUME_KEY = "studioflow.backgroundMusicVolume";
  var SLOT_COUNT = 9;
  var scheduled = false;
  var soundSource = null;
  var soundSlot = null;
  var soundGeneration = 0;
  var musicAudio = null;
  var musicUrl = "";
  var musicSlot = null;
  var lastSignature = "";

  function text(value) { return typeof value === "string" ? value : ""; }
  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (error) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }
  function titleFor(fileName) {
    return text(fileName).replace(/\.[^.]+$/, "").trim() || "Untitled audio";
  }
  function idFor(prefix, slot) {
    var random = window.crypto && typeof window.crypto.randomUUID === "function" ? window.crypto.randomUUID() : Date.now() + "-" + Math.random().toString(16).slice(2);
    return prefix + "-slot-" + (slot + 1) + "-" + random;
  }
  function blobKeyFor(prefix, slot) { return "media-" + prefix + "-slot-" + (slot + 1) + "-" + Date.now() + "-" + Math.random().toString(16).slice(2); }
  function slotArray(value) {
    var slots = new Array(SLOT_COUNT).fill(null);
    if (!Array.isArray(value)) return slots;
    value.forEach(function (asset, index) {
      if (!asset || typeof asset !== "object") return;
      var slot = Number.isInteger(asset.slot) && asset.slot >= 0 && asset.slot < SLOT_COUNT ? asset.slot : index;
      if (slot >= 0 && slot < SLOT_COUNT && !slots[slot]) slots[slot] = Object.assign({}, asset, { slot: slot });
    });
    return slots;
  }
  function soundSlots() {
    var stored = read(SOUND_KEY, []);
    if (!Array.isArray(stored) || !stored.length) {
      var legacy = read("studioflow.customSound", null);
      return slotArray(legacy ? [legacy] : []);
    }
    return slotArray(stored);
  }
  function musicSlots() {
    var stored = read(MUSIC_KEY, null);
    if (Array.isArray(stored)) return slotArray(stored);
    var legacy = read(LEGACY_MUSIC_KEY, null);
    return slotArray(legacy ? [legacy] : []);
  }
  function dispatchChange() {
    try { window.dispatchEvent(new Event("storage")); } catch (error) {}
    try { window.dispatchEvent(new CustomEvent("studioflow:storage-changed", { detail: { source: "audio-soundboards" } })); } catch (error) {}
  }
  function firstOpen(slots) {
    for (var index = 0; index < slots.length; index += 1) if (!slots[index]) return index;
    return -1;
  }
  function openMediaDb() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error("Browser media storage is unavailable.")); return; }
      var request = window.indexedDB.open("studioflow-recordings", 3);
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error || new Error("Browser media storage could not be opened.")); };
    });
  }
  function putBlob(blobKey, file) {
    return openMediaDb().then(function (db) { return new Promise(function (resolve, reject) {
      var transaction;
      try { transaction = db.transaction("recordingBlobs", "readwrite"); } catch (error) { db.close(); reject(error); return; }
      transaction.objectStore("recordingBlobs").put(file, blobKey);
      transaction.oncomplete = function () { db.close(); resolve(true); };
      transaction.onerror = function () { db.close(); reject(transaction.error || new Error("Audio could not be saved.")); };
      transaction.onabort = function () { db.close(); reject(transaction.error || new Error("Audio could not be saved.")); };
    }); });
  }
  function getBlob(blobKey) {
    return openMediaDb().then(function (db) { return new Promise(function (resolve, reject) {
      var request;
      try { request = db.transaction("recordingBlobs", "readonly").objectStore("recordingBlobs").get(blobKey); } catch (error) { db.close(); reject(error); return; }
      request.onsuccess = function () { db.close(); resolve(request.result || null); };
      request.onerror = function () { db.close(); reject(request.error || new Error("Audio could not be read.")); };
    }); });
  }
  function deleteBlob(blobKey) {
    if (!blobKey) return Promise.resolve(true);
    return openMediaDb().then(function (db) { return new Promise(function (resolve, reject) {
      var transaction;
      try { transaction = db.transaction("recordingBlobs", "readwrite"); } catch (error) { db.close(); reject(error); return; }
      transaction.objectStore("recordingBlobs").delete(blobKey);
      transaction.oncomplete = function () { db.close(); resolve(true); };
      transaction.onerror = function () { db.close(); reject(transaction.error || new Error("Audio could not be removed.")); };
    }); });
  }
  function audioType(file) {
    var type = text(file && file.type).toLowerCase();
    if (type.indexOf("audio/") === 0) return type;
    var extension = text(file && file.name).toLowerCase().split(".").pop();
    return { mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", m4a: "audio/mp4", aac: "audio/aac", webm: "audio/webm" }[extension] || "";
  }
  function validAudio(file, maxBytes) {
    if (!file || !audioType(file)) throw new Error("Choose an audio file.");
    if (file.size > maxBytes) throw new Error("This audio file is larger than the supported limit.");
  }
  function decode(file) {
    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return Promise.resolve(true);
    var context = new AudioContextClass();
    return file.arrayBuffer().then(function (bytes) { return new Promise(function (resolve, reject) {
      context.decodeAudioData(bytes, function () { context.close(); resolve(true); }, function () { context.close(); reject(new Error("The selected audio file could not be decoded.")); });
    }); });
  }
  function metadata(file, slot, category, prefix) {
    return { id: idFor(prefix, slot), slot: slot, category: category, blobKey: blobKeyFor(prefix, slot), fileName: text(file.name), mediaType: audioType(file), size: file.size, title: titleFor(file.name), uploadedAt: new Date().toISOString() };
  }
  function persistSound(file, slot) {
    var slots = soundSlots(), previous = slots[slot], asset = metadata(file, slot, "sound-effect", "custom-sound");
    return putBlob(asset.blobKey, file).then(function () {
      slots[slot] = asset;
      write(SOUND_KEY, slots.filter(Boolean));
      // The maintained React app reads customSounds first. Keep the legacy
      // single-item key empty so the same blob is not collected twice by a
      // portable backup.
      write("studioflow.customSound", null);
      dispatchChange();
      return previous && previous.blobKey ? deleteBlob(previous.blobKey) : true;
    });
  }
  function persistMusic(file, slot) {
    var slots = musicSlots(), previous = slots[slot], asset = metadata(file, slot, "background-music", "background-music");
    return putBlob(asset.blobKey, file).then(function () {
      slots[slot] = asset;
      write(MUSIC_KEY, slots.filter(Boolean));
      var current = read(LEGACY_MUSIC_KEY, null), replacement = slots.find(function (item) { return item; }) || null;
      if (!current || (previous && current.blobKey === previous.blobKey)) write(LEGACY_MUSIC_KEY, replacement);
      dispatchChange();
      return previous && previous.blobKey ? deleteBlob(previous.blobKey) : true;
    });
  }
  function stopSound() {
    soundGeneration += 1;
    if (soundSource) { try { soundSource.stop(); } catch (error) {} try { soundSource.disconnect(); } catch (error) {} }
    soundSource = null;
    soundSlot = null;
    renderState();
  }
  function playSound(slot) {
    var asset = soundSlots()[slot];
    if (!asset) return;
    stopSound();
    var generation = soundGeneration;
    getBlob(asset.blobKey).then(function (blob) {
      if (!blob) throw new Error("The sound file is no longer available.");
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error("Audio playback is unavailable in this browser.");
      var context = new AudioContextClass();
      return blob.arrayBuffer().then(function (bytes) { return new Promise(function (resolve, reject) {
        context.decodeAudioData(bytes, function (buffer) { resolve({ context: context, buffer: buffer }); }, reject);
      }); });
    }).then(function (decoded) {
      if (generation !== soundGeneration) { decoded.context.close(); return; }
      var source = decoded.context.createBufferSource(), gain = decoded.context.createGain();
      gain.gain.value = Math.max(0, Math.min(1, Number(read(SOUND_VOLUME_KEY, 0.72)) || 0.72));
      source.buffer = decoded.buffer; source.connect(gain); gain.connect(decoded.context.destination); source.onended = function () { if (soundSource === source) { soundSource = null; soundSlot = null; renderState(); } try { decoded.context.close(); } catch (error) {} };
      soundSource = source; soundSlot = slot; source.start(0); renderState();
    }).catch(function (error) { setStatus(error.message || "Sound playback failed."); });
  }
  function stopMusic() {
    if (musicAudio) { try { musicAudio.pause(); } catch (error) {} musicAudio.removeAttribute("src"); musicAudio.load(); }
    musicAudio = null;
    if (musicUrl) { URL.revokeObjectURL(musicUrl); musicUrl = ""; }
    musicSlot = null;
    renderState();
  }
  function playMusic(slot) {
    var asset = musicSlots()[slot];
    if (!asset) return;
    stopMusic();
    getBlob(asset.blobKey).then(function (blob) {
      if (!blob) throw new Error("The music file is no longer available.");
      musicUrl = URL.createObjectURL(blob);
      musicAudio = new Audio(musicUrl); musicAudio.loop = true; musicAudio.volume = Math.max(0, Math.min(1, Number(read(MUSIC_VOLUME_KEY, 0.42)) || 0.42));
      musicSlot = slot; renderState();
      var playing = musicAudio.play();
      return playing && typeof playing.catch === "function" ? playing.catch(function () { setStatus("Click the music card again to start playback."); }) : playing;
    }).catch(function (error) { setStatus(error.message || "Music playback failed."); });
  }
  function setStatus(message) {
    var node = document.querySelector("[data-tpi-audio-status]");
    if (node) node.textContent = message || "";
  }
  function fileInput(category, slot) {
    var input = document.createElement("input"); input.type = "file"; input.accept = "audio/*,.mp3,.wav,.ogg,.m4a,.aac,.webm"; input.multiple = slot === null; input.hidden = true;
    input.addEventListener("change", function () {
      var files = Array.prototype.slice.call(input.files || []), prefix = category === "sound" ? "Sound" : "Music", slots = category === "sound" ? soundSlots() : musicSlots(), max = category === "sound" ? 24 * 1024 * 1024 : 80 * 1024 * 1024;
      if (slot === null && firstOpen(slots) < 0) { setStatus("All nine " + prefix.toLowerCase() + " slots are occupied. Replace an individual slot instead."); input.remove(); return; }
      var next = slot === null ? firstOpen(slots) : slot;
      files.reduce(function (promise, file) { return promise.then(function () { if (next < 0 || next >= SLOT_COUNT) throw new Error("All nine " + prefix.toLowerCase() + " slots are occupied. Replace an individual slot instead."); validAudio(file, max); return decode(file).then(function () { return category === "sound" ? persistSound(file, next) : persistMusic(file, next); }).then(function () { next = slot === null ? firstOpen(category === "sound" ? soundSlots() : musicSlots()) : next; }); }); }, Promise.resolve()).then(function () { setStatus(prefix + " saved."); renderState(); }).catch(function (error) { setStatus(error.message || prefix + " could not be saved."); }).finally(function () { input.remove(); });
    });
    document.body.appendChild(input); input.click();
  }
  function removeAsset(category, slot) {
    var slots = category === "sound" ? soundSlots() : musicSlots(), asset = slots[slot];
    if (!asset) return;
    if (category === "sound" && soundSlot === slot) stopSound();
    if (category === "music" && musicSlot === slot) stopMusic();
    slots[slot] = null;
    if (category === "sound") { write(SOUND_KEY, slots.filter(Boolean)); write("studioflow.customSound", null); }
    else { write(MUSIC_KEY, slots.filter(Boolean)); var next = slots.find(function (item) { return item; }) || null; var current = read(LEGACY_MUSIC_KEY, null); if (current && current.blobKey === asset.blobKey) write(LEGACY_MUSIC_KEY, next); }
    deleteBlob(asset.blobKey).catch(function () {}).then(function () { dispatchChange(); renderState(); setStatus("Audio removed."); });
  }
  function makeCard(category, slot, asset) {
    var card = document.createElement("article"); card.className = "tpi-audio-slot" + (asset ? " assigned" : " empty"); card.dataset.tpiAudioCategory = category; card.dataset.tpiAudioSlot = String(slot); card.setAttribute("aria-label", (category === "sound" ? "Sound effect " : "Background music ") + (slot + 1) + (asset ? ": " + asset.title : ": empty"));
    var icon = document.createElement("span"); icon.className = "tpi-audio-slot-icon"; icon.textContent = "♫";
    var heading = document.createElement("strong"); heading.className = "tpi-audio-slot-title"; heading.textContent = asset ? asset.title : (category === "sound" ? "Sound " : "Music ") + (slot + 1);
    var detail = document.createElement("span"); detail.className = "tpi-audio-slot-detail"; detail.textContent = asset ? text(asset.fileName) : "Empty slot";
    var copy = document.createElement("span"); copy.className = "tpi-audio-slot-copy"; copy.append(heading, detail);
    var actions = document.createElement("span"); actions.className = "tpi-audio-slot-actions";
    function button(label, action, disabled) { var button = document.createElement("button"); button.type = "button"; button.className = "tpi-audio-slot-action"; button.dataset.tpiAudioAction = action; button.textContent = label; button.disabled = !!disabled; return button; }
    if (asset) actions.append(button("Play", "play", false), button("Replace", "replace", false), button("Remove", "remove", false));
    else actions.append(button("Upload", "play", false));
    card.append(icon, copy, actions);
    if (asset && ((category === "sound" && soundSlot === slot) || (category === "music" && musicSlot === slot))) card.classList.add("playing");
    card.addEventListener("click", function (event) {
      var target = event.target.closest("button[data-tpi-audio-action]");
      if (!target) { if (asset) category === "sound" ? playSound(slot) : playMusic(slot); else fileInput(category, slot); return; }
      var action = target.dataset.tpiAudioAction;
      if (action === "play") { if (asset) category === "sound" ? playSound(slot) : playMusic(slot); else fileInput(category, slot); }
      if (action === "replace") fileInput(category, slot);
      if (action === "remove") removeAsset(category, slot);
    });
    return card;
  }
  function board(category, label, slots) {
    var section = document.createElement("section"); section.className = "tpi-audio-board"; section.dataset.tpiAudioBoard = category;
    var header = document.createElement("div"); header.className = "tpi-audio-board-header";
    var heading = document.createElement("h3"); heading.textContent = label;
    var upload = document.createElement("button"); upload.type = "button"; upload.className = "outline-button tpi-audio-upload"; upload.textContent = "Upload " + (category === "sound" ? "Sound" : "Music"); upload.addEventListener("click", function () { fileInput(category, null); });
    header.append(heading, upload); section.appendChild(header);
    var grid = document.createElement("div"); grid.className = "tpi-audio-grid"; slots.forEach(function (asset, slot) { grid.appendChild(makeCard(category, slot, asset)); }); section.appendChild(grid);
    return section;
  }
  function stopButton(label, action) { var button = document.createElement("button"); button.type = "button"; button.className = "outline-button tpi-audio-stop"; button.textContent = label; button.dataset.tpiAudioStop = action; button.disabled = action === "sound" ? !soundSource : !musicAudio; button.addEventListener("click", action === "sound" ? stopSound : stopMusic); return button; }
  function volumeControl(label, key, kind) { var wrap = document.createElement("label"); wrap.className = "tpi-audio-volume"; var name = document.createElement("span"); name.textContent = label; var input = document.createElement("input"); input.type = "range"; input.min = "0"; input.max = "1"; input.step = "0.01"; input.value = String(Number(read(key, kind === "sound" ? 0.72 : 0.42))); input.addEventListener("input", function () { write(key, Number(input.value)); if (kind === "music" && musicAudio) musicAudio.volume = Number(input.value); dispatchChange(); }); wrap.append(name, input); return wrap; }
  function hideLegacy() { Array.prototype.slice.call(document.querySelectorAll("section.asset-section")).forEach(function (section) { var heading = section.querySelector("h3"); var value = text(heading).replace(/\s+/g, " ").trim().toLowerCase(); if (value === "sounds" || value === "background music") { section.dataset.tpiLegacyAudio = "true"; section.hidden = true; Array.prototype.slice.call(section.querySelectorAll("*")) .filter(function (node) { return text(node).trim() === "Heartbeat Fast"; }) .forEach(function (node) { var card = node.closest(".asset-grid-button"); if (card) card.remove(); }); } }); }
  function host() { var section = document.querySelector('section.asset-section[data-tpi-legacy-audio="true"]') || document.querySelector("section.asset-section"); return section && section.parentElement; }
  function renderState() {
    hideLegacy();
    var root = document.querySelector("[data-tpi-audio-soundboards]"); if (!root) return;
    var signature = JSON.stringify({ sounds: soundSlots(), music: musicSlots(), soundSlot: soundSlot, musicSlot: musicSlot, soundVolume: read(SOUND_VOLUME_KEY, 0.72), musicVolume: read(MUSIC_VOLUME_KEY, 0.42) });
    if (signature === lastSignature && root.childElementCount) return;
    lastSignature = signature;
    var existing = root.firstChild; if (existing) root.replaceChildren();
    var controls = document.createElement("div"); controls.className = "tpi-audio-controls"; controls.append(volumeControl("Sound effects volume", SOUND_VOLUME_KEY, "sound"), stopButton("Stop sound", "sound"), volumeControl("Background music volume", MUSIC_VOLUME_KEY, "music"), stopButton("Stop music", "music")); root.appendChild(controls);
    var status = document.createElement("p"); status.dataset.tpiAudioStatus = "true"; root.appendChild(status);
    root.append(board("sound", "Sound effects", soundSlots())); root.append(board("music", "Background music", musicSlots()));
  }
  function sync() {
    scheduled = false; hideLegacy();
    var parent = host(); if (!parent) return;
    var root = parent.querySelector("[data-tpi-audio-soundboards]");
    if (!root) { root = document.createElement("div"); root.dataset.tpiAudioSoundboards = "true"; root.className = "tpi-audio-soundboards"; parent.appendChild(root); }
    renderState();
  }
  function schedule() { if (scheduled) return; scheduled = true; window.setTimeout(sync, 0); }
  function start() {
    schedule();
    if (document.body && window.MutationObserver) new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    window.addEventListener("storage", schedule);
    window.addEventListener("studioflow:storage-changed", schedule);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start();
})();
