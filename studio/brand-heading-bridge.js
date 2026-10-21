/* Keep the legacy Brand 1 heading from reappearing after the My Studios bridge attaches. */
(function () {
  "use strict";

  var reconciling = false;

  function reconcile() {
    if (reconciling) return;
    var host = document.querySelector(".asset-panel");
    var panel = host && host.querySelector("#tpi-my-studios-panel");
    if (!host || !panel) return;
    var rows = Array.prototype.slice.call(host.querySelectorAll(".brand-row"));
    var keeper = host.querySelector(".tpi-my-studios-brand-row") || rows[0];
    if (!keeper) return;
    reconciling = true;
    try {
      if (keeper.textContent !== "My Studios") keeper.textContent = "My Studios";
      if (keeper.getAttribute("aria-label") !== "My Studios") keeper.setAttribute("aria-label", "My Studios");
      if (!keeper.classList.contains("tpi-my-studios-brand-row")) keeper.classList.add("tpi-my-studios-brand-row");
      rows.forEach(function (row) {
        if (row !== keeper) row.remove();
      });
    } finally {
      reconciling = false;
    }
  }

  function start() {
    var host = document.querySelector(".asset-panel");
    if (!host) {
      window.setTimeout(start, 200);
      return;
    }
    reconcile();
    new MutationObserver(function () {
      if (!reconciling) reconcile();
    }).observe(host, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
