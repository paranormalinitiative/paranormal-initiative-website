(function () {
  let noticeShown = false;

  function showNotice() {
    if (noticeShown) return;
    noticeShown = true;

    const banner = document.createElement("div");
    banner.className = "content-protection-banner";
    banner.textContent = "Protected Content: Copy, paste, and selection are disabled.";
    document.body.prepend(banner);
  }

  function block(event) {
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
