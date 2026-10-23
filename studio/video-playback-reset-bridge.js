/*
 * TPI-STUDIOFLOW-020.
 *
 * Intro and outro clips are transient program moments. Their playback
 * position is never workspace state: each mounted stage video starts at zero,
 * and a removed/stopped video is paused and reset before it can be reused.
 * This bridge covers the compiled StudioFlow bundle without changing
 * recording, livestream, or media-storage behavior.
 */
(function () {
  "use strict";

  var STAGE_VIDEO = ".program-stage > video.stage-video";
  var MIRROR_VIDEO = ".program-stage > video.stage-background-video, .program-stage > video.stage-video";

  function stageVideo() {
    return document.querySelector(STAGE_VIDEO);
  }

  function isStageVideo(node) {
    // Removal records are delivered after the node has been detached, so the
    // ancestor selector no longer matches during cleanup.
    return node && node.nodeType === 1 && node.matches && (
      node.matches(".program-stage video") ||
      node.matches("video.stage-video, video.stage-background-video")
    );
  }

  function isMirrorVideo(node) {
    return node && node.nodeType === 1 && node.matches && (
      node.matches(MIRROR_VIDEO) ||
      node.matches("video.stage-background-video, video.stage-video")
    );
  }

  function suppressNativeOverlays(video) {
    if (!video || video.nodeType !== 1) return;
    // The production preview is not an interactive media player. Keep the
    // browser's PiP/remote-playback affordances out of the stage while
    // retaining the separate StudioFlow Play/Stop buttons for Intro/Outro.
    try { video.controls = false; } catch (_) {}
    try { video.disablePictureInPicture = true; } catch (_) {}
    try { video.disableRemotePlayback = true; } catch (_) {}
    try { video.setAttribute("disablepictureinpicture", ""); } catch (_) {}
    try { video.setAttribute("disableremoteplayback", ""); } catch (_) {}
    try { video.setAttribute("controlslist", "nodownload noremoteplayback noplaybackrate"); } catch (_) {}
  }

  function resizeSurface(video, canvas) {
    var stage = video.closest && video.closest(".program-stage");
    if (!stage) return null;
    var rect = stage.getBoundingClientRect();
    var width = Math.max(1, Math.round(rect.width));
    var height = Math.max(1, Math.round(rect.height));
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = video.classList.contains("stage-background-video") ? "0" : "1";
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    return { width: width, height: height, dpr: dpr };
  }

  function drawSurface(video, canvas) {
    var size = resizeSurface(video, canvas);
    if (!size || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;
    var context = canvas.getContext("2d");
    if (!context) return;
    var width = size.width * size.dpr;
    var height = size.height * size.dpr;
    var sourceRatio = video.videoWidth / video.videoHeight;
    var targetRatio = size.width / size.height;
    var contain = video.classList.contains("stage-video");
    var scale = contain ? Math.min(size.width / video.videoWidth, size.height / video.videoHeight) : Math.max(size.width / video.videoWidth, size.height / video.videoHeight);
    var drawWidth = video.videoWidth * scale * size.dpr;
    var drawHeight = video.videoHeight * scale * size.dpr;
    var drawX = (width - drawWidth) / 2;
    var drawY = (height - drawHeight) / 2;
    context.save();
    context.clearRect(0, 0, width, height);
    if (contain && Math.abs(sourceRatio - targetRatio) > 0.001) {
      context.fillStyle = "#05060a";
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(video, drawX, drawY, drawWidth, drawHeight);
    context.restore();
  }

  function installSurface(video) {
    if (!isMirrorVideo(video) || video.__tpiStageSurfaceInstalled) return;
    video.__tpiStageSurfaceInstalled = true;
    var canvas = document.createElement("canvas");
    canvas.className = "tpi-stage-video-surface";
    canvas.setAttribute("aria-hidden", "true");
    video.insertAdjacentElement("afterend", canvas);
    video.__tpiStageSurfaceCanvas = canvas;
    // Opera's Video Popout/Video Skip UI is browser-level and is not
    // suppressible by page CSS or the standard video attributes. The stage
    // surface is therefore drawn from the same playback element into a
    // canvas; the video remains mounted for audio, looping, and onended.
    video.style.display = "none";
    var frame = 0;
    var paint = function () {
      if (!video.isConnected || !canvas.isConnected || video.paused) {
        frame = 0;
        return;
      }
      drawSurface(video, canvas);
      frame = window.requestAnimationFrame(paint);
    };
    var redraw = function () {
      drawSurface(video, canvas);
      if (!video.paused && !frame) frame = window.requestAnimationFrame(paint);
    };
    var stopPainting = function () {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };
    var clearSurface = function () {
      stopPainting();
      if (!canvas.isConnected) return;
      var context = canvas.getContext("2d");
      if (context) context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = "none";
    };
    var onPause = function () { stopPainting(); redraw(); };
    ["loadeddata", "loadedmetadata", "canplay", "seeked", "timeupdate"].forEach(function (eventName) {
      video.addEventListener(eventName, redraw);
    });
    video.addEventListener("play", redraw);
    video.addEventListener("pause", onPause);
    video.__tpiStageSurfaceClear = clearSurface;
    video.__tpiStageSurfaceCleanup = function () {
      stopPainting();
      ["loadeddata", "loadedmetadata", "canplay", "seeked", "timeupdate", "play"].forEach(function (eventName) {
        video.removeEventListener(eventName, redraw);
      });
      video.removeEventListener("pause", onPause);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      video.__tpiStageSurfaceCanvas = null;
      video.__tpiStageSurfaceClear = null;
    };
    redraw();
  }

  function reset(video) {
    try { video.pause(); } catch (_) {}
    try { video.currentTime = 0; } catch (_) {}
  }

  function install(video) {
    if (!isStageVideo(video) || video.__tpiPlaybackResetInstalled) return;
    video.__tpiPlaybackResetInstalled = true;
    suppressNativeOverlays(video);
    installSurface(video);
    video.addEventListener("play", function () {
      // A fresh activation must never resume a prior preview position.
      try { video.currentTime = 0; } catch (_) {}
    }, true);
    video.addEventListener("ended", function () {
      // Natural completion leaves the clip ready for a later fresh play.
      reset(video);
    }, true);
    video.addEventListener("emptied", function () {
      reset(video);
      if (video.__tpiStageSurfaceClear) video.__tpiStageSurfaceClear();
    }, true);
  }

  function inspect(root) {
    if (!root || root.nodeType !== 1) return;
    if (isStageVideo(root)) install(root);
    if (root.querySelectorAll) root.querySelectorAll(".program-stage video").forEach(install);
  }

  function sceneKind(card) {
    // My Scenes identities come from the stable data-tpi-scene-id attribute.
    // Text labels are user-editable titles and the music-shortcut buttons share
    // the scene-card styling, so neither may decide scene behavior.
    if (!card || !card.getAttribute) return "";
    var sceneId = card.getAttribute("data-tpi-scene-id") || "";
    if (sceneId === "intro") return "intro";
    if (sceneId === "outro") return "outro";
    return sceneId ? "demo" : "";
  }

  var returnSceneId = "";
  function rememberReturnScene(card) {
    if (card && card.getAttribute && sceneKind(card) === "demo") {
      returnSceneId = card.getAttribute("data-tpi-scene-id") || returnSceneId;
      return;
    }
    var selected = document.querySelector("[data-tpi-scene-id].selected");
    if (selected && sceneKind(selected) === "demo") {
      returnSceneId = selected.getAttribute("data-tpi-scene-id") || returnSceneId;
    }
  }

  function restoreDemoScene() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-tpi-scene-id]"));
    var scene = returnSceneId
      ? cards.find(function (card) { return card.getAttribute("data-tpi-scene-id") === returnSceneId; })
      : null;
    if (!scene) scene = cards.find(function (card) { return sceneKind(card) === "demo"; });
    if (scene) scene.click();
  }

  function stopProgramPreview(restoreScene) {
    var video = stageVideo();
    if (!video) return false;
    reset(video);
    if (restoreScene) window.setTimeout(restoreDemoScene, 0);
    return true;
  }

  function handleStudioClick(event) {
    var target = event.target;
    // Music shortcut buttons share scene-card styling but are Background Music
    // controls: they must never reset or switch the program preview.
    if (target && target.closest && target.closest("[data-tpi-scene-music-button]")) return;
    var card = target && target.closest ? target.closest(".scene-card") : null;
    if (card && !target.closest(".scene-menu-trigger")) {
      var kind = sceneKind(card);
      if (kind) rememberReturnScene(card);
      var selected = card.classList.contains("selected");
      if (stageVideo()) {
        if (selected && (kind === "intro" || kind === "outro")) {
          // The selected Intro/Outro card is the existing Play/Stop toggle.
          event.preventDefault();
          event.stopImmediatePropagation();
          stopProgramPreview(true);
          return;
        }
        if (!selected && (kind === "intro" || kind === "outro" || kind === "demo")) {
          // Switching scenes stops the previous program moment before React
          // mounts the next one, preventing overlapping playback.
          stopProgramPreview(false);
        }
        return;
      }
      return;
    }

    var button = target && target.closest ? target.closest("button") : null;
    if (!button || !stageVideo()) return;
    var label = (button.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (label === "record" || label === "go live") {
      // A preview must never leak a stale timestamp into a new production.
      // Do not start playback here; the host still controls Intro/Outro.
      stopProgramPreview(true);
    }
  }

  var observer = new MutationObserver(function (records) {
    records.forEach(function (record) {
      record.addedNodes.forEach(inspect);
      record.removedNodes.forEach(function (node) {
        if (isStageVideo(node)) {
          if (node.__tpiStageSurfaceCleanup) node.__tpiStageSurfaceCleanup();
          reset(node);
        }
      });
    });
  });

  function start() {
    inspect(document.documentElement);
    document.addEventListener("click", handleStudioClick, true);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
