/*
 * TPI-DEV-033 navigation compatibility bridge.
 *
 * StudioFlow's generated bundle owns its internal navigation. The member
 * homepage, however, is owned by the website shell. Keep the existing
 * StudioFlow control and point it at the canonical signed-in destination in
 * both development and production without changing the current session.
 */
(function () {
  "use strict";

  var MEMBER_HOME = "/member-home.html";

  function syncReturnLink() {
    document.querySelectorAll("a.nav-return").forEach(function (link) {
      link.setAttribute("href", MEMBER_HOME);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncReturnLink, { once: true });
  } else {
    syncReturnLink();
  }

  if (document.body && window.MutationObserver) {
    new MutationObserver(syncReturnLink).observe(document.body, { childList: true, subtree: true });
  }
})();
