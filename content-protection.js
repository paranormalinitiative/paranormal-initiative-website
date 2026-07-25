(function () {
  let noticeTimer;

  function isEditableTarget(target) {
    if (!target || target === document) return false;
    return Boolean(target.closest?.("input, textarea, select, [contenteditable='true']"));
  }

  function isDevCopyMode() {
    return localStorage.getItem("tpiDevCopyMode") === "enabled";
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
    if (isDevCopyMode()) return;
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
