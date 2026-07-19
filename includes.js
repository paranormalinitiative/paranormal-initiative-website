(async function () {
  function isEditableTarget(target) {
    if (!target || target === document) return false;
    const editable = target.closest?.("input, textarea, select, [contenteditable='true']");
    return Boolean(editable);
  }

  function installContentProtection() {
    const blockedEvents = ["contextmenu", "copy", "cut", "dragstart"];

    blockedEvents.forEach(eventName => {
      document.addEventListener(eventName, event => {
        if (isEditableTarget(event.target)) return;
        event.preventDefault();
      });
    });

    document.addEventListener("selectstart", event => {
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
    });

    document.addEventListener("keydown", event => {
      if (isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const modifier = event.metaKey || event.ctrlKey;
      const blockedShortcut = modifier && ["a", "c", "x", "s", "u", "p"].includes(key);
      const blockedDevTools =
        event.key === "F12" ||
        (modifier && event.shiftKey && ["i", "j", "c"].includes(key));

      if (blockedShortcut || blockedDevTools) {
        event.preventDefault();
      }
    });

    document.querySelectorAll("img").forEach(img => {
      img.setAttribute("draggable", "false");
    });
  }

  async function inject(selector, url) {
    const host = document.querySelector(selector);
    if (!host) return;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`Failed to load ${url}:`, res.status);
      return;
    }

    host.innerHTML = await res.text();
  }

  await inject("#site-header", "header.html");
  await inject("#site-footer", "footer.html");
  installContentProtection();

  // Per-page title/subtitle (optional)
  const titleMeta = document.querySelector('meta[name="pp:title"]');
  const subtitleMeta = document.querySelector('meta[name="pp:subtitle"]');

  if (titleMeta) {
    const t = document.getElementById("page-title");
    if (t) t.textContent = titleMeta.content;
  }

  if (subtitleMeta) {
    const s = document.getElementById("page-subtitle");
    if (s) s.textContent = subtitleMeta.content;
  }

  // Auto-active nav link (for injected header pages)
  try {
    const path = window.location.pathname;
    const current = path.split("/").pop() || "index.html";

    const nav = document.querySelector(".command-nav");
    if (nav) {
      const links = nav.querySelectorAll("a[href]");
      links.forEach(a => a.removeAttribute("aria-current"));

      links.forEach(a => {
        const href = a.getAttribute("href");
        if (!href) return;

        const hrefFile = href.split("/").pop();
        if (hrefFile === current) {
          a.setAttribute("aria-current", "page");
        }
      });
    }
  } catch (e) {
    console.warn("Nav active state failed:", e);
  }
})();
