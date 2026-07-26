(function () {
  let noticeTimer;

  function isEditableTarget(target) {
    if (!target || target === document) return false;
    return Boolean(target.closest?.("input, textarea, select, [contenteditable='true']"));
  }

  function isLockedSiteChrome(target) {
    return Boolean(target?.closest?.(".command-header, .command-nav, footer"));
  }

  function isDevCopyMode() {
    return localStorage.getItem("tpiDevCopyMode") === "enabled";
  }

  function getCachedMember() {
    const username = localStorage.getItem("tpiEditorSession");
    if (!username) return null;
    try {
      const users = JSON.parse(localStorage.getItem("tpiEditorContributors") || "[]");
      return users.find(user => user.username === username && user.active !== false) || null;
    } catch (error) {
      return null;
    }
  }

  function isLeadershipCopyAllowed() {
    const user = getCachedMember();
    const role = String(user?.role || "").toLowerCase();
    const title = String(user?.title || "").toLowerCase().replace(/\s+/g, " ").trim();
    return role === "owner" ||
      role === "admin" ||
      ["founder / director", "founder/director", "founder director", "assistant director"].includes(title);
  }

  function isCopyAllowed() {
    return isDevCopyMode() ||
      isLeadershipCopyAllowed() ||
      document.body?.dataset.editorCopyAllowed === "true";
  }

  function showNotice() {
    let banner = document.querySelector(".content-protection-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.className = "content-protection-banner";
      document.body.appendChild(banner);
    }
    banner.textContent = "Protected Content: Copy, paste, and selection are disabled.";
    banner.classList.remove("content-protection-banner-hide");

    window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => {
      banner.classList.add("content-protection-banner-hide");
      window.setTimeout(() => banner.remove(), 300);
    }, 2200);
  }

  function block(event) {
    if (isLockedSiteChrome(event.target)) {
      event.preventDefault();
      showNotice();
      return;
    }
    if (isCopyAllowed()) return;
    if (isEditableTarget(event.target)) return;
    event.preventDefault();
    showNotice();
  }

  document.addEventListener("contextmenu", block);
  document.addEventListener("copy", block);
  document.addEventListener("cut", block);
  document.addEventListener("paste", block);
  document.addEventListener("selectstart", block);
  document.addEventListener("dragstart", block);

  document.addEventListener("keydown", function (event) {
    const key = event.key.toLowerCase();
    const shortcut = event.ctrlKey || event.metaKey;

    if (shortcut && ["a", "c", "x", "v", "s", "u", "p"].includes(key)) {
      block(event);
      return;
    }

    if (key === "f12") {
      block(event);
    }
  });
})();
