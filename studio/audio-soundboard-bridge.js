/*
 * TPI-STUDIOFLOW-021.
 *
 * Adds the approved nine-slot sound-effects and nine-slot background-music
 * boards without replacing StudioFlow's workspace, IndexedDB, or backup
 * contracts. Audio metadata remains in the existing localStorage workspace
 * state and media bytes remain in the existing recordingBlobs object store.
 * TPI-STUDIOFLOW-017: reusable SMART Pad presentation and scene music button.
 */
(function () {
  "use strict";

  var SOUND_KEY = "studioflow.customSounds";
  var MUSIC_KEY = "studioflow.backgroundMusicSlots";
  var LEGACY_MUSIC_KEY = "studioflow.backgroundMusic";
  var SOUND_VOLUME_KEY = "studioflow.soundVolume";
  var MUSIC_VOLUME_KEY = "studioflow.backgroundMusicVolume";
  var MUSIC_LOOP_KEY = "studioflow.backgroundMusicLoop";
  var SCENE_MUSIC_KEY = "studioflow.sceneMusicAssignments";
  var AUDIO_ACCEPT = "audio/*,.mp3,.m4a,.wav,.wave,.ogg,.oga,.aac,.flac,.aif,.aiff,.webm,.opus,.amr";
  var MUSIC_MAX_BYTES = 512 * 1024 * 1024;
  var PAD_COLORS = ["#5f3b8f", "#8c3f67", "#315d87", "#2f7668", "#7a5b2c", "#704c75"];
  var SLOT_COUNT = 9;
  var scheduled = false;
  var soundSource = null;
  var soundGain = null;
  var soundSlot = null;
  var soundGeneration = 0;
  var musicAudio = null;
  var musicUrl = "";
  var musicSlot = null;
  var musicExternal = false;
  var lastSignature = "";
  var lastSceneId = "";

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
  function padColor(asset, category, slot) { return text(asset && asset.color) || PAD_COLORS[(slot + (category === "music" ? 2 : 0)) % PAD_COLORS.length]; }
  function sceneAssignments() { var value = read(SCENE_MUSIC_KEY, {}); return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
  function writeSceneAssignments(value) { write(SCENE_MUSIC_KEY, value); dispatchChange(); }
  function audioCommand(category, action, asset) { var event = new CustomEvent("studioflow:audio-command", { cancelable: true, detail: Object.assign({ category: category, action: action }, asset || {}) }); window.dispatchEvent(event); return event.defaultPrevented; }
  function audioEnded(category, asset) { try { window.dispatchEvent(new CustomEvent("studioflow:audio-ended", { detail: Object.assign({ category: category }, asset || {}) })); } catch (error) {} }
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
    var stored = read(SOUND_KEY, null), legacy = read("studioflow.customSound", null);
    if (Array.isArray(stored)) {
      var assigned = stored.filter(function (asset) { return asset && typeof asset === "object"; });
      if (legacy && typeof legacy === "object" && !assigned.some(function (asset) { return asset.blobKey && asset.blobKey === legacy.blobKey; })) assigned.unshift(legacy);
      return slotArray(assigned);
    }
    return slotArray(legacy && typeof legacy === "object" ? [legacy] : []);
  }
  function musicSlots() {
    var stored = read(MUSIC_KEY, null), legacy = read(LEGACY_MUSIC_KEY, null);
    if (Array.isArray(stored)) {
      var assigned = stored.filter(function (asset) { return asset && typeof asset === "object"; });
      if (legacy && typeof legacy === "object" && !assigned.some(function (asset) { return asset.blobKey && asset.blobKey === legacy.blobKey; })) assigned.unshift(legacy);
      return slotArray(assigned);
    }
    return slotArray(legacy && typeof legacy === "object" ? [legacy] : []);
  }
  function musicLoopEnabled() { return read(MUSIC_LOOP_KEY, true) !== false; }
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
    return {
      mp3: "audio/mpeg", wav: "audio/wav", wave: "audio/wav", ogg: "audio/ogg", oga: "audio/ogg",
      m4a: "audio/mp4", aac: "audio/aac", flac: "audio/flac", aif: "audio/aiff", aiff: "audio/aiff",
      webm: "audio/webm", opus: "audio/opus", amr: "audio/amr"
    }[extension] || "";
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
  function embeddedTitle(file) {
    if (!file || !/\.mp3$/i.test(text(file.name))) return Promise.resolve("");
    return file.slice(0, 256 * 1024).arrayBuffer().then(function (bytes) {
      var view = new DataView(bytes); if (view.byteLength < 10 || view.getUint8(0) !== 73 || view.getUint8(1) !== 68 || view.getUint8(2) !== 51) return "";
      var version = view.getUint8(3), position = 10, tagSize = (view.getUint8(6) << 21) | (view.getUint8(7) << 14) | (view.getUint8(8) << 7) | view.getUint8(9);
      var limit = Math.min(view.byteLength, 10 + tagSize);
      while (position + 10 <= limit) {
        var frameId = String.fromCharCode(view.getUint8(position), view.getUint8(position + 1), view.getUint8(position + 2), view.getUint8(position + 3));
        var frameSize = version >= 4 ? ((view.getUint8(position + 4) << 21) | (view.getUint8(position + 5) << 14) | (view.getUint8(position + 6) << 7) | view.getUint8(position + 7)) : view.getUint8(position + 4) * 16777216 + view.getUint8(position + 5) * 65536 + view.getUint8(position + 6) * 256 + view.getUint8(position + 7);
        if (!frameId.trim() || !frameSize) break;
        if (frameId === "TIT2" && position + 10 + frameSize <= limit) {
          var data = new Uint8Array(bytes, position + 11, Math.max(0, frameSize - 1)), encoding = view.getUint8(position + 10), decoded;
          try { decoded = new TextDecoder(encoding === 1 || encoding === 2 ? "utf-16" : "utf-8").decode(data); } catch (error) { decoded = ""; }
          return decoded.replace(/\u0000/g, "").trim();
        }
        position += 10 + frameSize;
      }
      return "";
    }).catch(function () { return ""; });
  }
  function metadata(file, slot, category, prefix, titleOverride, previous) {
    var isMusic = category === "background-music";
    return { id: idFor(prefix, slot), slot: slot, category: category, blobKey: blobKeyFor(prefix, slot), fileName: text(file.name), mediaType: audioType(file), size: file.size, title: previous && previous.titleCustomized ? previous.title : (text(titleOverride).trim() || titleFor(file.name)), titleCustomized: !!(previous && previous.titleCustomized), color: padColor(previous, isMusic ? "music" : "sound", slot), uploadedAt: new Date().toISOString() };
  }
  function persistSound(file, slot, titleOverride) {
    var slots = soundSlots(), previous = slots[slot], asset = metadata(file, slot, "sound-effect", "custom-sound", titleOverride, previous);
    return putBlob(asset.blobKey, file).then(function () {
      slots[slot] = asset;
      write(SOUND_KEY, slots.filter(Boolean));
      // Keep the original playback engine and legacy single-sound selector
      // bound to the first assigned custom effect while retaining every slot.
      var firstSound = slots.find(function (item) { return item; }) || null;
      write("studioflow.customSound", firstSound);
      dispatchChange();
      return previous && previous.blobKey ? deleteBlob(previous.blobKey) : true;
    });
  }
  function persistMusic(file, slot, titleOverride) {
    var slots = musicSlots(), previous = slots[slot], asset = metadata(file, slot, "background-music", "background-music", titleOverride, previous);
    return putBlob(asset.blobKey, file).then(function () {
      slots[slot] = asset;
      write(MUSIC_KEY, slots.filter(Boolean));
      var current = read(LEGACY_MUSIC_KEY, null), selected = current && slots.find(function (item) { return item && item.blobKey === current.blobKey; });
      if (selected) write(LEGACY_MUSIC_KEY, selected);
      dispatchChange();
      return previous && previous.blobKey ? deleteBlob(previous.blobKey) : true;
    });
  }
  function stopSound() {
    soundGeneration += 1;
    if (soundSource && soundSource.external) audioCommand("sound", "stop");
    if (soundSource) { var context = soundSource.context; try { soundSource.stop(); } catch (error) {} try { soundSource.disconnect(); } catch (error) {} if (context) context.close().catch(function () {}); }
    soundSource = null;
    soundGain = null;
    soundSlot = null;
    renderState();
  }
  function playSound(slot) {
    var asset = soundSlots()[slot];
    if (!asset) return;
    stopSound();
    if (audioCommand("sound", "play", Object.assign({}, asset, { title: asset.title || titleFor(asset.fileName) }))) { soundSource = { external: true }; soundSlot = slot; renderState(); return; }
    var generation = soundGeneration, playbackContext = null;
    getBlob(asset.blobKey).then(function (blob) {
      if (!blob) throw new Error("The sound file is no longer available.");
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error("Audio playback is unavailable in this browser.");
      playbackContext = new AudioContextClass();
      return blob.arrayBuffer().then(function (bytes) { return new Promise(function (resolve, reject) {
        playbackContext.decodeAudioData(bytes, function (buffer) { resolve({ context: playbackContext, buffer: buffer }); }, function (error) { playbackContext.close().catch(function () {}); reject(error || new Error("The sound file could not be decoded.")); });
      }); });
    }).then(function (decoded) {
      if (generation !== soundGeneration) { decoded.context.close().catch(function () {}); return; }
      var source = decoded.context.createBufferSource(), gain = decoded.context.createGain();
      gain.gain.value = Math.max(0, Math.min(1, Number(read(SOUND_VOLUME_KEY, 0.72))));
      source.buffer = decoded.buffer; source.connect(gain); gain.connect(decoded.context.destination); source.onended = function () { if (soundSource === source) { soundSource = null; soundGain = null; soundSlot = null; renderState(); } decoded.context.close().catch(function () {}); };
      soundSource = source; soundGain = gain; soundSlot = slot; source.start(0); renderState();
    }).catch(function (error) { if (playbackContext && playbackContext.state !== "closed") playbackContext.close().catch(function () {}); setStatus(error.message || "Sound playback failed."); });
  }
  function stopMusic() {
    if (musicExternal) audioCommand("music", "stop");
    if (musicAudio) { try { musicAudio.pause(); } catch (error) {} musicAudio.removeAttribute("src"); musicAudio.load(); }
    musicAudio = null;
    if (musicUrl) { URL.revokeObjectURL(musicUrl); musicUrl = ""; }
    musicSlot = null;
    musicExternal = false;
    renderState();
  }
  function playMusic(slot) {
    var asset = musicSlots()[slot];
    if (!asset) return;
    stopMusic();
    if (audioCommand("music", "play", Object.assign({}, asset, { title: asset.title || titleFor(asset.fileName), loop: musicLoopEnabled() }))) { musicExternal = true; musicSlot = slot; renderState(); return; }
    getBlob(asset.blobKey).then(function (blob) {
      if (!blob) throw new Error("The music file is no longer available.");
      musicUrl = URL.createObjectURL(blob);
      musicAudio = new Audio(musicUrl); musicAudio.loop = musicLoopEnabled(); musicAudio.volume = Math.max(0, Math.min(1, Number(read(MUSIC_VOLUME_KEY, 0.42))));
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
    var input = document.createElement("input"); input.type = "file"; input.accept = AUDIO_ACCEPT; input.multiple = slot === null; input.hidden = true; input.dataset.tpiAudioInput = category;
    input.addEventListener("change", function () {
      var files = Array.prototype.slice.call(input.files || []), prefix = category === "sound" ? "Sound" : "Music", slots = category === "sound" ? soundSlots() : musicSlots(), max = category === "sound" ? 24 * 1024 * 1024 : MUSIC_MAX_BYTES;
      if (slot === null && firstOpen(slots) < 0) { setStatus("All nine " + prefix.toLowerCase() + " slots are occupied. Replace an individual slot instead."); input.remove(); return; }
      var next = slot === null ? firstOpen(slots) : slot;
      files.reduce(function (promise, file) { return promise.then(function () {
        if (next < 0 || next >= SLOT_COUNT) throw new Error("All nine " + prefix.toLowerCase() + " slots are occupied. Replace an individual slot instead.");
        validAudio(file, max);
        // Sound effects use the Web Audio playback path and must be decoded
        // before saving. Background music uses the browser Audio element;
        // requiring AudioContext decoding here rejects valid M4A/AAC files in
        // Firefox before they can be saved or played by that supported path.
        var prepared = category === "sound" ? decode(file) : Promise.resolve(true);
        return prepared.then(function () { return embeddedTitle(file); }).then(function (embedded) {
          return category === "sound" ? persistSound(file, next, embedded) : persistMusic(file, next, embedded);
        }).then(function () { next = slot === null ? firstOpen(category === "sound" ? soundSlots() : musicSlots()) : next; });
      }); }, Promise.resolve()).then(function () { setStatus(prefix + " saved."); renderState(); }).catch(function (error) { setStatus(error.message || prefix + " could not be saved."); }).finally(function () { input.remove(); });
    });
    document.body.appendChild(input); input.click();
  }
  function removeAsset(category, slot) {
    var slots = category === "sound" ? soundSlots() : musicSlots(), asset = slots[slot];
    if (!asset) return;
    if (category === "sound" && soundSlot === slot) stopSound();
    if (category === "music" && musicSlot === slot) stopMusic();
    slots[slot] = null;
    if (category === "sound") { write(SOUND_KEY, slots.filter(Boolean)); var nextSound = slots.find(function (item) { return item; }) || null; var legacySound = read("studioflow.customSound", null); if (legacySound && legacySound.blobKey === asset.blobKey) write("studioflow.customSound", nextSound); }
    else { write(MUSIC_KEY, slots.filter(Boolean)); var next = slots.find(function (item) { return item; }) || null; var current = read(LEGACY_MUSIC_KEY, null); if (current && current.blobKey === asset.blobKey) write(LEGACY_MUSIC_KEY, next); }
    deleteBlob(asset.blobKey).catch(function () {}).then(function () { dispatchChange(); renderState(); setStatus("Audio removed."); });
  }
  function makeCard(category, slot, asset) {
    var card = document.createElement("article"); card.className = "tpi-audio-slot" + (asset ? " assigned" : " empty"); card.dataset.tpiAudioCategory = category; card.dataset.tpiAudioSlot = String(slot); card.setAttribute("aria-label", (category === "sound" ? "Sound effect " : "Background music ") + (slot + 1) + (asset ? ": " + asset.title : ": empty"));
    if (asset) card.tabIndex = 0;
    var topLine = document.createElement("div"); topLine.className = "tpi-audio-slot-topline";
    var icon = document.createElement("span"); icon.className = "tpi-audio-slot-icon"; icon.textContent = category === "sound" ? "♬" : "♫"; icon.setAttribute("aria-hidden", "true");
    var slotLabel = document.createElement("span"); slotLabel.className = "tpi-audio-slot-label"; slotLabel.textContent = (category === "sound" ? "Sound effect" : "Music") + " " + String(slot + 1).padStart(2, "0");
    var menuTrigger = document.createElement("button"); menuTrigger.type = "button"; menuTrigger.className = "tpi-audio-slot-menu-trigger"; menuTrigger.textContent = "⋯"; menuTrigger.title = "Audio options"; menuTrigger.setAttribute("aria-label", "Audio options");
    if (!asset) menuTrigger.hidden = true;
    topLine.append(icon, slotLabel, menuTrigger);
    var heading = document.createElement("strong"); heading.className = "tpi-audio-slot-title"; heading.textContent = asset ? asset.title : (category === "sound" ? "Sound " : "Music ") + (slot + 1);
    var detail = document.createElement("span"); detail.className = "tpi-audio-slot-detail"; detail.textContent = asset ? text(asset.fileName) : "Empty slot";
    var copy = document.createElement("span"); copy.className = "tpi-audio-slot-copy"; copy.append(heading, detail);
    var actions = asset ? null : document.createElement("div"); if (actions) actions.className = "tpi-audio-slot-actions";
    function button(label, action, disabled) { var button = document.createElement("button"); button.type = "button"; button.className = "tpi-audio-slot-action"; button.dataset.tpiAudioAction = action; button.textContent = label; button.disabled = !!disabled; button.title = label; return button; }
    function menuItem(label, action) { var item = document.createElement("button"); item.type = "button"; item.className = "tpi-audio-slot-menu-item"; item.dataset.tpiAudioMenuAction = action; item.textContent = label; return item; }
    var menu = document.createElement("div"); menu.className = "tpi-audio-slot-menu"; menu.hidden = true; menu.setAttribute("role", "menu");
    if (asset) menu.append(menuItem("Rename", "rename"), menuItem("Change color", "color"), menuItem("Replace audio", "replace"), menuItem("Remove", "remove"));
    function positionMenu() {
      if (menu.hidden || !menu.isConnected) return;
      var triggerRect = menuTrigger.getBoundingClientRect();
      var margin = 8;
      var left = triggerRect.right - menu.offsetWidth;
      var top = triggerRect.bottom + 6;
      if (top + menu.offsetHeight > window.innerHeight - margin) top = triggerRect.top - menu.offsetHeight - 6;
      left = Math.max(margin, Math.min(left, window.innerWidth - menu.offsetWidth - margin));
      top = Math.max(margin, Math.min(top, window.innerHeight - menu.offsetHeight - margin));
      menu.style.left = Math.round(left) + "px";
      menu.style.top = Math.round(top) + "px";
    }
    function dismissMenu(event) {
      if (event.target === menuTrigger || menu.contains(event.target)) return;
      closeMenu();
    }
    function closeMenu() {
      menu.hidden = true;
      menuTrigger.setAttribute("aria-expanded", "false");
      card.classList.remove("menu-open");
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
      document.removeEventListener("click", dismissMenu, true);
      if (menu.parentNode) menu.parentNode.removeChild(menu);
    }
    menu.__tpiClose = closeMenu;
    function openMenu() {
      if (!asset) return;
      document.querySelectorAll(".tpi-audio-slot-menu").forEach(function (item) {
        if (item !== menu && typeof item.__tpiClose === "function") item.__tpiClose();
        else if (item !== menu && item.parentNode) item.parentNode.removeChild(item);
      });
      document.querySelectorAll(".tpi-audio-slot.menu-open").forEach(function (item) { if (item !== card) item.classList.remove("menu-open"); });
      menu.dataset.tpiAudioFloating = "true";
      menu.hidden = false;
      document.body.appendChild(menu);
      menuTrigger.setAttribute("aria-expanded", "true");
      card.classList.add("menu-open");
      positionMenu();
      window.addEventListener("resize", positionMenu);
      window.addEventListener("scroll", positionMenu, true);
      document.addEventListener("click", dismissMenu, true);
    }
    function manage(action) {
      if (!asset) return;
      closeMenu();
      if (action === "rename") { var nextTitle = window.prompt("Name this " + (category === "sound" ? "sound effect" : "music track"), asset.title || titleFor(asset.fileName)); if (nextTitle && nextTitle.trim()) { asset.title = nextTitle.trim(); asset.titleCustomized = true; var renamed = category === "sound" ? soundSlots() : musicSlots(); renamed[slot] = asset; write(category === "sound" ? SOUND_KEY : MUSIC_KEY, renamed.filter(Boolean)); dispatchChange(); renderState(); } }
      if (action === "color") { var nextColor = window.prompt("Pad color (hex, for example #7b4bb7)", padColor(asset, category, slot)); if (nextColor && /^#[0-9a-f]{6}$/i.test(nextColor.trim())) { asset.color = nextColor.trim(); var colored = category === "sound" ? soundSlots() : musicSlots(); colored[slot] = asset; write(category === "sound" ? SOUND_KEY : MUSIC_KEY, colored.filter(Boolean)); dispatchChange(); renderState(); } }
      if (action === "replace") fileInput(category, slot);
      if (action === "remove") removeAsset(category, slot);
    }
    if (asset) {
      var playLabel = category === "sound" ? "Play live" : "Smart Play";
      card.dataset.tpiAudioPlayLabel = playLabel;
    } else {
      var uploadButton = button("＋ Add audio", "upload", false); uploadButton.classList.add("primary", "empty-action"); actions.append(uploadButton);
    }
    card.style.setProperty("--tpi-pad-color", padColor(asset, category, slot)); card.append(topLine, copy); if (actions) card.append(actions);
    if (asset && ((category === "sound" && soundSlot === slot) || (category === "music" && musicSlot === slot))) card.classList.add("playing");
    menuTrigger.setAttribute("aria-expanded", "false");
    menuTrigger.addEventListener("click", function (event) { event.preventDefault(); event.stopPropagation(); if (menu.hidden) openMenu(); else closeMenu(); });
    menu.addEventListener("click", function (event) { event.preventDefault(); event.stopPropagation(); var item = event.target.closest("button[data-tpi-audio-menu-action]"); if (item) manage(item.dataset.tpiAudioMenuAction); });
    card.addEventListener("contextmenu", function (event) { if (!asset) return; event.preventDefault(); openMenu(); });
    card.addEventListener("keydown", function (event) { if (!asset || (event.key !== "Enter" && event.key !== " ")) return; event.preventDefault(); category === "sound" ? playSound(slot) : playMusic(slot); });
    card.addEventListener("click", function (event) {
      var target = event.target.closest("button[data-tpi-audio-action]");
      if (!target) { if (asset) category === "sound" ? playSound(slot) : playMusic(slot); else fileInput(category, slot); return; }
      var action = target.dataset.tpiAudioAction;
      if (action === "play") { if (asset) category === "sound" ? playSound(slot) : playMusic(slot); else fileInput(category, slot); }
      if (action === "upload") fileInput(category, slot);
    });
    return card;
  }
  function board(category, label, slots) {
    var section = document.createElement("section"); section.className = "tpi-audio-board"; section.dataset.tpiAudioBoard = category;
    var header = document.createElement("div"); header.className = "tpi-audio-board-header";
    var heading = document.createElement("h4"); heading.textContent = label;
    var upload = document.createElement("button"); upload.type = "button"; upload.className = "outline-button tpi-audio-upload"; upload.textContent = "Upload " + (category === "sound" ? "Sound" : "Music"); upload.disabled = firstOpen(slots) < 0; upload.addEventListener("click", function () { fileInput(category, null); });
    header.append(heading, upload); section.appendChild(header);
    var grid = document.createElement("div"); grid.className = "tpi-audio-grid"; slots.forEach(function (asset, slot) { grid.appendChild(makeCard(category, slot, asset)); }); section.appendChild(grid);
    return section;
  }
  function selectedSceneMusic() {
    var assignments = sceneAssignments();
    if (assignments.global && typeof assignments.global === "object") return assignments.global;
    var legacyKey = Object.keys(assignments).find(function (key) { return assignments[key] && typeof assignments[key] === "object"; });
    return legacyKey ? assignments[legacyKey] : null;
  }
  function saveSceneMusic(asset, startAfterIntro) {
    var next = sceneAssignments();
    if (!asset) delete next.global;
    else next.global = { blobKey: asset.blobKey, assetId: asset.id, title: asset.title || titleFor(asset.fileName), startAfterIntro: !!startAfterIntro };
    writeSceneAssignments(next);
  }
  function sceneMusicButton() {
    var intro = document.querySelector('[data-tpi-scene-id="intro"]');
    if (!intro || !intro.parentElement) return;
    var button = intro.parentElement.querySelector("[data-tpi-scene-music-button]");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "scene-card compact dashed tpi-scene-music-button";
      button.dataset.tpiSceneMusicButton = "true";
      var icon = document.createElement("span"); icon.className = "tpi-scene-music-icon"; icon.textContent = "♫"; icon.setAttribute("aria-hidden", "true");
      var label = document.createElement("span"); label.className = "tpi-scene-music-label";
      button.append(icon, label);
      button.addEventListener("click", function (event) {
        event.preventDefault(); event.stopPropagation();
        var assignment = selectedSceneMusic();
        var current = assignment && musicSlots().find(function (item) { return item && item.blobKey === assignment.blobKey; });
        if (!current && musicSlot !== null) current = musicSlots()[musicSlot] || null;
        if (!current) { setStatus("Choose a Background Music SMART Pad first."); return; }
        saveSceneMusic(current, !(assignment && assignment.startAfterIntro));
        setStatus(assignment && assignment.startAfterIntro ? "Background music removed from Intro handoff." : "Background music will start after Intro.");
        sceneMusicButton();
      });
      intro.parentElement.insertBefore(button, intro.nextSibling);
    }
    var assignment = selectedSceneMusic();
    var current = assignment && musicSlots().find(function (item) { return item && item.blobKey === assignment.blobKey; });
    var label = button.querySelector(".tpi-scene-music-label");
    if (label) label.textContent = current && assignment ? (assignment.title || current.title || titleFor(current.fileName)) : "Background music";
    button.classList.toggle("selected", !!(current && assignment && assignment.startAfterIntro));
    button.setAttribute("aria-pressed", String(!!(current && assignment && assignment.startAfterIntro)));
    button.title = current && assignment ? (assignment.startAfterIntro ? "Background music starts after Intro" : "Enable background music after Intro") : "Choose a music SMART Pad, then click to add it to the Scenes";
  }
  function syncSceneMusic() {
    var assignment = selectedSceneMusic();
    var active = text(read("studioflow.activeSceneId", ""));
    if (lastSceneId === "intro" && active && active !== "intro" && assignment && assignment.startAfterIntro) {
      var musicIndex = musicSlots().findIndex(function (item) { return item && item.blobKey === assignment.blobKey; });
      if (musicIndex >= 0) playMusic(musicIndex);
    }
    lastSceneId = active;
    sceneMusicButton();
  }
  function stopButton(label, action) { var button = document.createElement("button"); button.type = "button"; button.className = "outline-button tpi-audio-stop"; button.textContent = label; button.dataset.tpiAudioStop = action; button.disabled = action === "sound" ? !soundSource : !musicAudio; button.addEventListener("click", action === "sound" ? stopSound : stopMusic); return button; }
  function volumeControl(label, key, kind) {    var wrap = document.createElement("label"); wrap.className = "tpi-audio-volume"; var name = document.createElement("span"); name.textContent = label; var input = document.createElement("input"); input.type = "range"; input.min = "0"; input.max = "1"; input.step = "0.01"; input.value = String(Number(read(key, kind === "sound" ? 0.72 : 0.42))); input.setAttribute("aria-label", label); input.addEventListener("input", function () { var volume = Number(input.value); write(key, volume); if (kind === "sound" && soundGain) soundGain.gain.value = volume; if (kind === "music" && musicAudio) musicAudio.volume = volume; audioCommand(kind, "settings", { volume: volume }); dispatchChange(); }); wrap.append(name, input); return wrap; }
  function loopControl() { var wrap = document.createElement("label"); wrap.className = "tpi-audio-loop-control"; var input = document.createElement("input"); input.type = "checkbox"; input.checked = musicLoopEnabled(); input.setAttribute("aria-label", "Loop background music"); var textNode = document.createElement("span"); textNode.textContent = "Loop music"; input.addEventListener("change", function () { write(MUSIC_LOOP_KEY, input.checked); if (musicAudio) musicAudio.loop = input.checked; audioCommand("music", "settings", { loop: input.checked }); dispatchChange(); renderState(); }); wrap.append(input, textNode); return wrap; }

  function headingText(section) { var heading = section.querySelector("h3"); return heading ? (heading.textContent || "").replace(/\s+/g, " ").trim().toLowerCase() : ""; }
  function hideLegacy() { Array.prototype.slice.call(document.querySelectorAll("section.asset-section")).forEach(function (section) { var heading = headingText(section); if (heading === "sounds" || heading === "background music") { section.dataset.tpiLegacyAudio = "true"; section.hidden = true; } }); }
  function host() {
    var panel = document.querySelector(".asset-panel");
    if (!panel) return null;
    var hasMediaSections = Array.prototype.some.call(panel.querySelectorAll("section.asset-section"), function (section) {
      return ["video clips", "backgrounds", "sounds", "background music"].includes(headingText(section));
    });
    return hasMediaSections ? panel : null;
  }
  function renderState() {
    hideLegacy();
    var root = document.querySelector("[data-tpi-audio-soundboards]"); if (!root) return;
    var signature = JSON.stringify({ sounds: soundSlots(), music: musicSlots(), sceneMusic: sceneAssignments(), soundSlot: soundSlot, musicSlot: musicSlot, soundVolume: read(SOUND_VOLUME_KEY, 0.72), musicVolume: read(MUSIC_VOLUME_KEY, 0.42), musicLoop: musicLoopEnabled() });
    if (signature === lastSignature && root.childElementCount) { sceneMusicButton(); return; }
    lastSignature = signature;
    document.querySelectorAll(".tpi-audio-slot-menu[data-tpi-audio-floating]").forEach(function (menu) { if (typeof menu.__tpiClose === "function") menu.__tpiClose(); else if (menu.parentNode) menu.parentNode.removeChild(menu); });
    document.querySelectorAll(".tpi-audio-slot.menu-open").forEach(function (card) { card.classList.remove("menu-open"); });
    var existing = root.firstChild; if (existing) root.replaceChildren();
    var soundSection = document.createElement("section"); soundSection.className = "tpi-audio-original-section"; soundSection.dataset.tpiAudioOriginal = "sounds"; var soundHeading = document.createElement("h3"); soundHeading.textContent = "Sounds"; soundSection.appendChild(soundHeading);
    var musicSection = document.createElement("section"); musicSection.className = "tpi-audio-original-section"; musicSection.dataset.tpiAudioOriginal = "background-music"; var musicHeading = document.createElement("h3"); musicHeading.textContent = "Background music"; musicSection.appendChild(musicHeading);
    root.append(soundSection, musicSection);
    var controls = document.createElement("div"); controls.className = "tpi-audio-controls"; controls.append(volumeControl("Sound effects volume", SOUND_VOLUME_KEY, "sound"), stopButton("Stop sound", "sound")); soundSection.appendChild(controls);
    var musicControls = document.createElement("div"); musicControls.className = "tpi-audio-controls"; musicControls.append(volumeControl("Background music volume", MUSIC_VOLUME_KEY, "music"), loopControl(), stopButton("Stop music", "music")); musicSection.appendChild(musicControls);
    soundSection.append(board("sound", "Sound effects", soundSlots())); musicSection.append(board("music", "Background music", musicSlots()));
    var status = document.createElement("p"); status.dataset.tpiAudioStatus = "true"; root.insertBefore(status, root.firstChild);
    sceneMusicButton();
  }
  function sync() {
    scheduled = false; hideLegacy();
    var hostSection = host(); if (!hostSection) return;
    var root = hostSection.querySelector("[data-tpi-audio-soundboards]");
    if (!root) { root = document.createElement("div"); root.dataset.tpiAudioSoundboards = "true"; root.className = "tpi-audio-soundboards"; }
    var firstLegacyAudio = Array.prototype.slice.call(hostSection.querySelectorAll("section.asset-section")).find(function (section) { var heading = headingText(section); return heading === "sounds" || heading === "background music"; });
    if (firstLegacyAudio) hostSection.insertBefore(root, firstLegacyAudio);
    else if (!root.parentElement) hostSection.appendChild(root);
    renderState();
    sceneMusicButton();
  }
  function schedule() { if (scheduled) return; scheduled = true; window.setTimeout(sync, 0); }
  function start() {
    schedule();
    if (document.body && window.MutationObserver) new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    window.addEventListener("storage", schedule);
    window.addEventListener("studioflow:storage-changed", schedule);
    window.addEventListener("studioflow:scene-changed", syncSceneMusic);
    window.addEventListener("studioflow:audio-ended", function (event) { var detail = event.detail || {}; if (detail.category === "sound") { soundSource = null; soundSlot = null; renderState(); } if (detail.category === "music") { musicExternal = false; musicSlot = null; renderState(); } });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start();
})();
