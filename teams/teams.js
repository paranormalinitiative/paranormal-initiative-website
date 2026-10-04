/* Paranormal Teams Directory — shared chrome + helpers (every teams/ page) */
(function () {
  "use strict";

  const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "DC", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
    "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
    "Washington", "West Virginia", "Wisconsin", "Wyoming"
  ];

  const COUNTRIES = [
    "Australia", "Austria", "Belgium", "Brazil", "Canada", "Colombia",
    "Croatia", "Czech Republic", "Denmark", "Egypt", "England", "Finland",
    "France", "Germany", "Greece", "Hungary", "India", "Indonesia", "Ireland",
    "Italy", "Japan", "Kenya", "Malaysia", "Mexico", "Netherlands",
    "New Zealand", "Northern Ireland", "Norway", "Pakistan", "Peru",
    "Philippines", "Poland", "Portugal", "Romania", "Scotland", "Singapore",
    "South Africa", "Spain", "Sweden", "Switzerland", "Ukraine",
    "United Arab Emirates", "Wales"
  ];

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[char]));
  }

  async function api(path, options = {}) {
    const response = await fetch(`/api${path}`, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || "Request failed.");
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function installHeader() {
    if (document.querySelector(".ptd-header")) return;
    const current = document.body.dataset.ptdPage || "";
    const header = document.createElement("header");
    header.className = "ptd-header";
    header.innerHTML = `
      <div class="ptd-header-inner">
        <a class="ptd-brand" href="index.html" aria-label="TPI Paranormal Teams Directory home">
          <span class="ptd-brand-kicker">The Paranormal Initiative</span>
          <span class="ptd-brand-title">TPI Paranormal Teams Directory</span>
        </a>
        <nav class="ptd-nav" aria-label="Directory">
          <a href="index.html" data-ptd-nav="home">Directory Home</a>
          <a href="find.html" data-ptd-nav="find">Find a Team</a>
          <a href="add.html" data-ptd-nav="add">Add a Team</a>
          <a href="search.html" data-ptd-nav="search">Search</a>
          <a href="../index.html" class="ptd-nav-home">Back to TPI Home</a>
        </nav>
      </div>
    `;
    const active = header.querySelector(`[data-ptd-nav="${current}"]`);
    if (active) active.setAttribute("aria-current", "page");
    document.body.prepend(header);
    document.body.classList.add("ptd-body");
  }

  function installFooter() {
    if (document.querySelector(".ptd-footer")) return;
    const footer = document.createElement("footer");
    footer.className = "ptd-footer";
    footer.innerHTML = `
      <span>Part of The Paranormal Initiative — research, investigation, education.</span><br>
      <a href="../index.html">Back to TPI Home</a> ·
      <a href="../haunted-location-directory/index.html">Haunted Location Directory</a> ·
      <a href="../community-forum.html">Community Forum</a>
    `;
    document.body.append(footer);
  }

  window.PTD = { US_STATES, COUNTRIES, escapeHtml, api, installHeader, installFooter };

  installHeader();
  installFooter();
})();
