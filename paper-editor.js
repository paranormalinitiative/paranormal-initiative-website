(function () {
  const ACCESS_USERS_KEY = "tpiEditorContributors";
  const ACCESS_SESSION_KEY = "tpiEditorSession";
  const ACCESS_INVITES_KEY = "tpiEditorInvites";
  const PUBLISHED_ARTICLES_KEY = "tpiPublishedArticles";
  const titleInput = document.getElementById("editor-title");
  const subtitleInput = document.getElementById("editor-subtitle");
  const destinationInput = document.getElementById("editor-destination");
  const sourceInput = document.getElementById("editor-source");
  const authorInput = document.getElementById("editor-author");
  const affiliationInput = document.getElementById("editor-affiliation");
  const organizationInput = document.getElementById("editor-organization");
  const correspondenceInput = document.getElementById("editor-correspondence");
  const websiteInput = document.getElementById("editor-website");
  const labelsInput = document.getElementById("editor-labels");
  const editor = document.getElementById("paper-editor-body");
  const htmlView = document.getElementById("editor-html-view");
  const status = document.getElementById("editor-status");
  const layout = document.querySelector(".paper-editor-layout");
  const viewMode = document.getElementById("editor-view-mode");
  const imageFileInput = document.getElementById("image-file-input");
  const videoFileInput = document.getElementById("video-file-input");
  const audioFileInput = document.getElementById("audio-file-input");
  const mediaModal = document.getElementById("media-modal");
  const mediaModalTitle = document.getElementById("media-modal-title");
  const imageModalBody = document.querySelector(".media-modal-image");
  const videoModalBody = document.querySelector(".media-modal-video");
  const audioModalBody = document.querySelector(".media-modal-audio");
  const imageUrlInput = document.getElementById("image-url-input");
  const imageAltInput = document.getElementById("image-alt-input");
  const imageCaptionInput = document.getElementById("image-caption-input");
  const videoUrlInput = document.getElementById("video-url-input");
  const videoCaptionInput = document.getElementById("video-caption-input");
  const audioUrlInput = document.getElementById("audio-url-input");
  const audioCaptionInput = document.getElementById("audio-caption-input");
  const publishModal = document.getElementById("publish-modal");
  const publishSummary = document.getElementById("publish-summary");
  const publishFilename = document.getElementById("publish-filename");
  const publishDestination = document.getElementById("publish-destination");

  let activeView = "compose";
  let savedSelection = null;
  let currentUser = null;
  let autosaveTimer = null;

  const allowedIframeHosts = [
    "youtube.com",
    "www.youtube.com",
    "youtube-nocookie.com",
    "www.youtube-nocookie.com",
    "rumble.com",
    "www.rumble.com",
    "drive.google.com",
    "docs.google.com"
  ];

  function getDestinationLabel() {
    return destinationInput.options[destinationInput.selectedIndex].textContent.trim();
  }

  function slugify(value) {
    return value
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled-research-paper";
  }

  function getSuggestedArticleHref() {
    return `published-article.html?id=${encodeURIComponent(getArticleId())}`;
  }

  function getArticleId() {
    const title = titleInput.value.trim() || "Untitled Research Paper";
    const destination = destinationInput.value.replace(/\.html$/, "");
    return `${destination}-${slugify(title)}`;
  }

  function getPublishedArticles() {
    try {
      return JSON.parse(localStorage.getItem(PUBLISHED_ARTICLES_KEY) || "[]");
    } catch (error) {
      return [];
    }
  }

  function savePublishedArticles(articles) {
    localStorage.setItem(PUBLISHED_ARTICLES_KEY, JSON.stringify(articles));
  }

  function setStatus(message) {
    status.textContent = message;
    window.clearTimeout(setStatus.timer);
    setStatus.timer = window.setTimeout(() => {
      status.textContent = "Draft ready";
    }, 1800);
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(ACCESS_USERS_KEY) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(ACCESS_USERS_KEY, JSON.stringify(users));
  }

  function getInvites() {
    try {
      return JSON.parse(localStorage.getItem(ACCESS_INVITES_KEY) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveInvites(invites) {
    localStorage.setItem(ACCESS_INVITES_KEY, JSON.stringify(invites));
  }

  function isDevUnlocked() {
    return localStorage.getItem("tpiDevCopyMode") === "enabled";
  }

  function getSessionUser() {
    const username = localStorage.getItem(ACCESS_SESSION_KEY);
    if (!username) return null;
    return getUsers().find(user => user.username === username && user.active !== false) || null;
  }

  function applyContributorProfile(user) {
    if (!user) return;
    authorInput.value = user.displayName || user.username || "";
    if (user.affiliation) affiliationInput.value = user.affiliation;
    if (user.organization) organizationInput.value = user.organization;
    if (user.correspondence) correspondenceInput.value = user.correspondence;
    if (user.website) websiteInput.value = user.website;
  }

  function unlockEditor(user) {
    currentUser = user;
    if (user.username) localStorage.setItem(ACCESS_SESSION_KEY, user.username);
    document.body.classList.remove("editor-locked");
    document.body.classList.add("editor-authenticated");
    applyContributorProfile(user);
    setStatus(`Signed in as ${user.displayName || user.username}`);
    const gate = document.getElementById("editor-access-gate");
    if (gate) gate.remove();
  }

  function lockEditor() {
    currentUser = null;
    localStorage.removeItem(ACCESS_SESSION_KEY);
    document.body.classList.add("editor-locked");
    document.body.classList.remove("editor-authenticated");
    setStatus("Contributor signed out");
    showAccessGate();
  }

  function showAccessGate() {
    const existing = document.getElementById("editor-access-gate");
    if (existing) existing.remove();

    const gate = document.createElement("div");
    gate.id = "editor-access-gate";
    gate.className = "editor-access-gate";
    gate.innerHTML = `
      <form class="editor-access-card" data-access-form="login">
        <p class="portal-kicker">Contributor Access</p>
        <h2>Sign In</h2>
        <p>Use your contributor username and password to open the Research Paper Editor. Dev copy mode also unlocks this page for site work.</p>
        <label><span>Username</span><input name="username" type="text" autocomplete="username" required></label>
        <label><span>Password</span><input name="password" type="password" autocomplete="current-password" required></label>
        <button type="submit">Open Editor</button>
        <p class="access-note">Need access? Use your invite code on the Contributor Invite page. Returning contributors can sign in from Member Login.</p>
      </form>
    `;
    document.body.appendChild(gate);
  }

  async function handleAccessSubmit(event) {
    const form = event.target.closest("[data-access-form]");
    if (!form) return;
    event.preventDefault();

    const data = new FormData(form);
    const mode = form.dataset.accessForm;
    const username = String(data.get("username") || "").trim();
    const password = String(data.get("password") || "");

    if (window.TPIApi && await window.TPIApi.isAvailable()) {
      try {
        const result = await window.TPIApi.login(username, password);
        unlockEditor({
          username: result.user.username,
          displayName: result.user.displayName,
          title: result.user.title,
          role: result.user.role,
          correspondence: result.user.correspondence,
          affiliation: result.user.affiliation,
          organization: result.user.organization,
          website: result.user.website,
          commentSignatureEnabled: result.user.commentSignatureEnabled,
          active: true
        });
      } catch (error) {
        form.querySelector(".access-note")?.remove();
        const note = document.createElement("p");
        note.className = "access-note access-error";
        note.textContent = error.message || "Username or password did not match.";
        form.appendChild(note);
      }
      return;
    }

    const user = getUsers().find(candidate => candidate.username === username && candidate.password === password && candidate.active !== false);
    if (!user) {
      form.querySelector(".access-note")?.remove();
      const note = document.createElement("p");
      note.className = "access-note access-error";
      note.textContent = "Username or password did not match.";
      form.appendChild(note);
      return;
    }
    unlockEditor(user);
  }

  function openContributorManager() {
    const existing = document.getElementById("contributors-modal");
    if (existing) existing.remove();

    const users = getUsers();
    const hasAdmin = users.some(user => user.role === "admin");
    const modal = document.createElement("div");
    modal.id = "contributors-modal";
    modal.className = "media-modal";
    modal.innerHTML = `
      <div class="media-modal-card contributor-modal-card" role="dialog" aria-modal="true" aria-labelledby="contributors-title">
        <div class="media-modal-header">
          <h3 id="contributors-title">Contributors</h3>
          <button type="button" data-action="contributors-close">Close</button>
        </div>
        <div class="media-modal-body contributor-manager">
          <form data-invite-form class="contributor-login-panel">
            <p class="access-note">Create invite-only access codes. Give a code to a contributor so they can register from the Contributor Invite page.</p>
            <label><span>Invite Code</span><input name="inviteCode" type="text" placeholder="Example: TPI-RESEARCH-2026" required></label>
            <label><span>Role</span><select name="inviteRole"><option value="contributor">Contributor</option><option value="admin">Admin</option><option value="owner">Owner</option></select></label>
            <button type="submit">Create Invite</button>
          </form>
          ${hasAdmin && !currentUser ? `
          <form data-access-form="login" class="contributor-login-panel">
            <p class="access-note">Optional contributor sign-in. The editor itself stays open.</p>
            <label><span>Username</span><input name="username" type="text" autocomplete="username" required></label>
            <label><span>Password</span><input name="password" type="password" autocomplete="current-password" required></label>
            <button type="submit">Sign In</button>
          </form>` : ""}
          <form data-contributor-form>
            <label><span>Display Name</span><input name="displayName" type="text" required></label>
            <label><span>Title / Role Label</span><input name="title" type="text" placeholder="Research Contributor"></label>
            <label><span>Username</span><input name="username" type="text" required></label>
            <label><span>Password</span><input name="password" type="text" required></label>
            <label><span>Role</span><select name="role"><option value="contributor">Contributor</option><option value="admin">Admin</option><option value="owner">Owner</option></select></label>
            <label><span>Correspondence</span><input name="correspondence" type="email"></label>
            <label><span>Affiliation</span><input name="affiliation" type="text"></label>
            <label><span>Organization</span><input name="organization" type="text"></label>
            <label><span>Website</span><input name="website" type="url"></label>
            <label class="access-checkbox"><input name="commentSignature" type="checkbox" checked><span>Use this name and title automatically on comments and replies.</span></label>
            <button type="submit">Add Contributor</button>
          </form>
          <div class="contributor-list">
            ${currentUser ? `<p class="access-note">Signed in as ${escapeHtml(currentUser.displayName || currentUser.username)}.</p>` : `<p class="access-note">Local contributor accounts are for workflow testing only.</p>`}
            ${users.map(user => `<div class="contributor-row"><strong>${escapeHtml(user.displayName || user.username)}</strong><span>${escapeHtml(user.username)} · ${escapeHtml(user.role || "contributor")}</span></div>`).join("") || "<p>No contributors yet.</p>"}
            ${getInvites().map(invite => `<div class="contributor-row"><strong>Invite: ${escapeHtml(invite.code)}</strong><span>${escapeHtml(invite.role || "contributor")} · ${invite.used ? "used" : "open"}</span></div>`).join("")}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function addContributor(event) {
    const form = event.target.closest("[data-contributor-form]");
    if (!form) return;
    event.preventDefault();

    const data = new FormData(form);
    const users = getUsers();
    const username = String(data.get("username") || "").trim();
    if (!username || users.some(user => user.username === username)) {
      setStatus("Contributor username already exists");
      return;
    }

    users.push({
      username,
      password: String(data.get("password") || ""),
      displayName: String(data.get("displayName") || username).trim(),
      title: String(data.get("title") || "").trim(),
      role: String(data.get("role") || "contributor"),
      correspondence: String(data.get("correspondence") || "").trim(),
      affiliation: String(data.get("affiliation") || "").trim(),
      organization: String(data.get("organization") || "").trim(),
      website: String(data.get("website") || "").trim(),
      commentSignatureEnabled: data.get("commentSignature") === "on",
      active: true
    });
    saveUsers(users);
    setStatus("Contributor added");
    openContributorManager();
  }

  function addInvite(event) {
    const form = event.target.closest("[data-invite-form]");
    if (!form) return;
    event.preventDefault();
    const data = new FormData(form);
    const code = String(data.get("inviteCode") || "").trim();
    if (!code) return;
    const invites = getInvites();
    if (invites.some(invite => invite.code === code && !invite.used)) {
      setStatus("Invite code already exists");
      return;
    }
    invites.push({ code, role: String(data.get("inviteRole") || "contributor"), used: false, createdAt: new Date().toISOString() });
    saveInvites(invites);
    setStatus("Invite created");
    openContributorManager();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function isSafeUrl(rawUrl, allowDataMedia) {
    try {
      const url = new URL(rawUrl, window.location.href);
      if (allowDataMedia && url.protocol === "data:") {
        return /^data:(image|video)\//i.test(rawUrl);
      }
      return ["http:", "https:", "mailto:"].includes(url.protocol);
    } catch (error) {
      return false;
    }
  }

  function isAllowedIframe(rawUrl) {
    try {
      const url = new URL(rawUrl, window.location.href);
      return ["http:", "https:"].includes(url.protocol) && allowedIframeHosts.includes(url.hostname);
    } catch (error) {
      return false;
    }
  }

  function cleanHtml(html, stripEditorControls) {
    const template = document.createElement("template");
    template.innerHTML = html;

    if (stripEditorControls !== false) {
      template.content.querySelectorAll(".media-edit-controls").forEach(node => node.remove());
    }
    template.content.querySelectorAll("script, style, object, embed").forEach(node => node.remove());
    template.content.querySelectorAll("iframe").forEach(node => {
      const src = node.getAttribute("src") || "";
      if (!isAllowedIframe(src)) {
        node.remove();
        return;
      }
      [...node.attributes].forEach(attr => {
        if (!["src", "title", "allow", "allowfullscreen", "loading", "referrerpolicy"].includes(attr.name.toLowerCase())) {
          node.removeAttribute(attr.name);
        }
      });
      node.setAttribute("loading", "lazy");
      node.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      if (!node.getAttribute("title")) node.setAttribute("title", "Embedded video");
      node.setAttribute("allowfullscreen", "");
    });

    template.content.querySelectorAll("*").forEach(node => {
      if (stripEditorControls !== false) {
        node.removeAttribute("contenteditable");
        [...node.attributes].forEach(attr => {
          if (attr.name.toLowerCase().startsWith("data-")) {
            node.removeAttribute(attr.name);
          }
        });
      }

      [...node.attributes].forEach(attr => {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim();
        const lowered = value.toLowerCase();

        if (name.startsWith("on") || lowered.startsWith("javascript:")) {
          node.removeAttribute(attr.name);
        }

        if (["href", "src"].includes(name) && value && !isSafeUrl(value, name === "src")) {
          node.removeAttribute(attr.name);
        }
      });
    });

    return template.innerHTML;
  }

  function saveSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      savedSelection = range.cloneRange();
    }
  }

  function restoreSelection() {
    if (activeView === "html") return;
    if (!savedSelection) {
      editor.focus();
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedSelection);
  }

  function getDraftHtml() {
    return activeView === "html" ? htmlView.value : editor.innerHTML;
  }

  function buildArticleHtml() {
    return cleanHtml(getDraftHtml(), true).trim();
  }

  function syncHtmlToCompose() {
    editor.innerHTML = cleanHtml(htmlView.value, false);
  }

  function setViewMode(mode) {
    if (activeView === mode) return;

    if (activeView === "html") {
      syncHtmlToCompose();
    } else {
      htmlView.value = cleanHtml(editor.innerHTML, true);
    }

    activeView = mode;
    viewMode.value = mode;
    layout.classList.toggle("html-mode", mode === "html");

    if (mode === "html") {
      htmlView.focus();
      setStatus("HTML view");
      return;
    }

    editor.focus();
    setStatus("Compose view");
  }

  function exec(command, value) {
    if (activeView === "html") setViewMode("compose");
    restoreSelection();
    document.execCommand(command, false, value || null);
    saveSelection();
    setStatus("Format applied");
  }

  function setBlock(tagName) {
    exec("formatBlock", tagName);
  }

  function insertHtml(html) {
    const cleaned = cleanHtml(html, activeView !== "compose");

    if (activeView === "html") {
      htmlView.setRangeText(cleaned, htmlView.selectionStart, htmlView.selectionEnd, "end");
      setStatus("HTML inserted");
      return;
    }

    restoreSelection();
    document.execCommand("insertHTML", false, cleaned);
    saveSelection();
    setStatus("Inserted");
  }

  function buildAuthorNoteHtml() {
    const author = authorInput.value.trim();
    const affiliation = affiliationInput.value.trim();
    const organization = organizationInput.value.trim();
    const correspondence = correspondenceInput.value.trim();
    const website = websiteInput.value.trim();
    const lines = [author, affiliation, organization].filter(Boolean).map(escapeHtml);

    if (correspondence) {
      lines.push(`Correspondence: ${escapeHtml(correspondence)}`);
    }

    if (website) {
      lines.push(`Website: <a href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(website)}</a>`);
    }

    return `<h3>Author Note</h3><p>${lines.join("<br>")}</p>`;
  }

  function withMediaControls(mediaHtml, width) {
    return `<figure class="embedded-media editable-media" style="max-width:${width || "100%"}"><div class="media-edit-controls" contenteditable="false"><button type="button" data-media-action="up">Move Up</button><button type="button" data-media-action="down">Move Down</button><button type="button" data-media-action="small">Small</button><button type="button" data-media-action="medium">Medium</button><button type="button" data-media-action="full">Full</button></div>${mediaHtml}</figure>`;
  }

  function openMediaModal(kind) {
    saveSelection();
    mediaModal.hidden = false;
    imageModalBody.hidden = kind !== "image";
    videoModalBody.hidden = kind !== "video";
    audioModalBody.hidden = kind !== "audio";
    const titleMap = { image: "Insert Image", video: "Insert Video", audio: "Insert Audio" };
    mediaModalTitle.textContent = titleMap[kind] || "Insert Media";
    const focusMap = { image: imageUrlInput, video: videoUrlInput, audio: audioUrlInput };
    (focusMap[kind] || imageUrlInput).focus();
  }

  function closeMediaModal() {
    mediaModal.hidden = true;
  }

  function insertLink() {
    const url = window.prompt("Address to link");
    if (!url || !isSafeUrl(url, false)) return;
    const openNewWindow = window.confirm("Open this link in a new window?");

    if (activeView === "html") {
      const text = window.prompt("Link text", url) || url;
      insertHtml(`<a href="${escapeHtml(url)}"${openNewWindow ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(text)}</a>`);
      return;
    }

    restoreSelection();
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      insertHtml(`<a href="${escapeHtml(url)}"${openNewWindow ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(url)}</a>`);
      return;
    }

    document.execCommand("createLink", false, url);
    if (openNewWindow) {
      const anchor = selection.anchorNode.parentElement.closest("a");
      if (anchor) {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
      }
    }
    saveSelection();
    setStatus("Link inserted");
  }

  function buildVideoEmbed(rawUrl) {
    try {
      const url = new URL(rawUrl.trim());
      const host = url.hostname.replace(/^www\./, "");
      let src = "";

      if (host === "youtu.be") {
        src = `https://www.youtube.com/embed/${url.pathname.replace("/", "")}`;
      } else if (host.endsWith("youtube.com") && url.pathname === "/watch" && url.searchParams.get("v")) {
        src = `https://www.youtube.com/embed/${url.searchParams.get("v")}`;
      } else if (host.endsWith("youtube.com") && url.pathname.startsWith("/shorts/")) {
        src = `https://www.youtube.com/embed/${url.pathname.split("/")[2]}`;
      } else if (host.endsWith("youtube.com") && url.pathname.startsWith("/embed/")) {
        src = rawUrl.trim();
      } else if (host === "rumble.com" && url.pathname.startsWith("/embed/")) {
        src = rawUrl.trim();
      } else if (host === "rumble.com") {
        const match = url.pathname.match(/\/(v[a-z0-9]+)[-/]/i);
        if (match) src = `https://rumble.com/embed/${match[1]}/`;
      } else if (host === "drive.google.com" && url.pathname.includes("/file/d/")) {
        const id = url.pathname.split("/file/d/")[1].split("/")[0];
        src = `https://drive.google.com/file/d/${id}/preview`;
      }

      if (src && isAllowedIframe(src)) {
        return withMediaControls(`<iframe src="${escapeHtml(src)}" title="Embedded video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`);
      }

      if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url.pathname)) {
        return withMediaControls(`<video controls src="${escapeHtml(rawUrl.trim())}"></video>`);
      }
    } catch (error) {
      return "";
    }

    return "";
  }

  function insertImageUrl() {
    const url = imageUrlInput.value.trim();
    if (!url || !isSafeUrl(url, false)) return;
    const alt = imageAltInput.value.trim();
    const caption = imageCaptionInput.value.trim();
    insertHtml(withMediaControls(`<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}">${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}`));
    imageUrlInput.value = "";
    imageAltInput.value = "";
    imageCaptionInput.value = "";
    closeMediaModal();
  }

  function insertVideoUrl() {
    const url = videoUrlInput.value.trim();
    const caption = videoCaptionInput.value.trim();
    if (!url) return;
    const html = buildVideoEmbed(url);
    if (!html) {
      setStatus("Video URL not recognized");
      return;
    }
    if (caption) {
      const figcaption = `<figcaption>${escapeHtml(caption)}</figcaption>`;
      insertHtml(html.replace("</figure>", figcaption + "</figure>"));
    } else {
      insertHtml(html);
    }
    videoUrlInput.value = "";
    videoCaptionInput.value = "";
    closeMediaModal();
  }

  function insertAudioUrl() {
    const url = audioUrlInput.value.trim();
    const caption = audioCaptionInput.value.trim();
    if (!url || !isSafeUrl(url, false)) return;
    const audioHtml = `<audio controls src="${escapeHtml(url)}"></audio>${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}`;
    insertHtml(withMediaControls(audioHtml));
    audioUrlInput.value = "";
    audioCaptionInput.value = "";
    closeMediaModal();
  }

  function insertEmbedCode() {
    const html = window.prompt("Paste trusted iframe embed code");
    if (!html) return;
    const cleaned = cleanHtml(html, true);
    if (!cleaned.trim()) {
      setStatus("Embed was blocked");
      return;
    }
    insertHtml(`<figure class="embedded-media">${cleaned}</figure>`);
  }

  function insertAuthorNote() {
    insertHtml(buildAuthorNoteHtml());
    setStatus("Author note inserted");
  }

  async function insertUploadedFile(file, kind) {
    if (!file) return;

    if (window.TPIApi?.uploadArticleMedia) {
      try {
        setStatus(`Uploading ${kind === "image" ? "image" : kind === "video" ? "video" : "audio"}...`);
        const upload = await window.TPIApi.uploadArticleMedia(file);
        const mediaUrl = upload.url;
        if (mediaUrl) {
          if (kind === "image") {
            const alt = imageAltInput.value.trim() || file.name.replace(/\.[^.]+$/, "");
            const caption = imageCaptionInput.value.trim();
            insertHtml(withMediaControls(`<img src="${escapeHtml(mediaUrl)}" alt="${escapeHtml(alt)}">${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}`));
          } else if (kind === "video") {
            const caption = videoCaptionInput.value.trim() || file.name.replace(/\.[^.]+$/, "");
            insertHtml(withMediaControls(`<video controls src="${escapeHtml(mediaUrl)}"></video>${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}`));
          } else {
            const caption = audioCaptionInput.value.trim() || file.name.replace(/\.[^.]+$/, "");
            insertHtml(withMediaControls(`<audio controls src="${escapeHtml(mediaUrl)}"></audio>${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}`));
          }
          closeMediaModal();
          setStatus(`${kind === "image" ? "Image" : kind === "video" ? "Video" : "Audio"} uploaded`);
          return;
        }
      } catch (error) {
        if (error.status !== 401 && error.status !== 501 && error.status !== 500) {
          setStatus(error.message, true);
          return;
        }
        setStatus("R2 upload is not ready yet. Using local draft embed for now.");
      }
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (kind === "image") {
        const alt = imageAltInput.value.trim() || file.name.replace(/\.[^.]+$/, "");
        const caption = imageCaptionInput.value.trim();
        insertHtml(withMediaControls(`<img src="${escapeHtml(dataUrl)}" alt="${escapeHtml(alt)}">${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}`));
      } else if (kind === "video") {
        const caption = videoCaptionInput.value.trim() || file.name.replace(/\.[^.]+$/, "");
        insertHtml(withMediaControls(`<video controls src="${escapeHtml(dataUrl)}"></video>${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}`));
      } else {
        const caption = audioCaptionInput.value.trim() || file.name.replace(/\.[^.]+$/, "");
        insertHtml(withMediaControls(`<audio controls src="${escapeHtml(dataUrl)}"></audio>${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}`));
      }
      closeMediaModal();
      setStatus(`${kind === "image" ? "Image" : kind === "video" ? "Video" : "Audio"} uploaded`);
    };
    reader.readAsDataURL(file);
  }

  function buildPreviewDocument() {
    return buildFullArticleDocument("Preview");
  }

  function buildFullArticleDocument(label) {
    const title = titleInput.value.trim() || "Untitled Research Paper";
    const subtitle = subtitleInput.value.trim();
    const author = authorInput.value.trim();
    const source = sourceInput.value.trim();
    const labels = labelsInput.value.trim();
    const destination = getDestinationLabel();
    const meta = [author, destination, source, labels].filter(Boolean).join(" · ");

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)}${label ? ` ${escapeHtml(label)}` : ""}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body{margin:0;background:#0f1419;color:#d7e2ec;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;line-height:1.65}
main{max-width:900px;margin:0 auto;padding:46px 24px 72px}
.kicker{color:#55c8ff;font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
h1{margin:12px 0 8px;color:#f4f8fb;font-size:42px;line-height:1.1}
.subtitle{margin:0;color:#c7d3de;font-size:18px}
.meta{margin:12px 0 34px;color:#8aa0b6;font-size:13px}
h3{margin:34px 0 12px;color:#f4f8fb;font-size:23px;line-height:1.25}
p{margin:0 0 16px}
a{color:#55c8ff}
blockquote{margin:20px 0;padding:4px 0 4px 18px;border-left:3px solid #55c8ff}
.embedded-media{margin:26px 0}.embedded-media iframe,.embedded-media video,.embedded-media img{display:block;width:100%;max-width:100%;background:#05080c;border:1px solid #243140;border-radius:6px}.embedded-media iframe,.embedded-media video{aspect-ratio:16/9;height:auto}.embedded-media img{height:auto}.embedded-media figcaption{margin-top:8px;color:#8aa0b6;font-size:13px}
</style>
</head>
<body><main>
<p class="kicker">Research Library · Field Paper</p>
<h1>${escapeHtml(title)}</h1>
${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ""}
${meta ? `<p class="meta">${escapeHtml(meta)}</p>` : ""}
${buildArticleHtml()}
</main></body></html>`;
  }

  function openPreview() {
    if (activeView === "html") syncHtmlToCompose();
    const previewWindow = window.open("", "tpiPaperPreview");
    if (!previewWindow) {
      setStatus("Preview blocked");
      return;
    }
    previewWindow.document.open();
    previewWindow.document.write(buildPreviewDocument());
    previewWindow.document.close();
    setStatus("Preview opened");
  }

  async function copyOutput() {
    const html = buildArticleHtml();

    try {
      await navigator.clipboard.writeText(html);
    } catch (error) {
      const temporary = document.createElement("textarea");
      temporary.value = html;
      temporary.setAttribute("readonly", "");
      temporary.style.position = "fixed";
      temporary.style.left = "-9999px";
      document.body.appendChild(temporary);
      temporary.select();
      document.execCommand("copy");
      temporary.remove();
    }

    setStatus("Post HTML copied");
  }

  function buildDestinationCard() {
    const title = titleInput.value.trim() || "Untitled Research Paper";
    const subtitle = subtitleInput.value.trim() || "Field paper";
    const href = getSuggestedArticleHref();
    const destination = getDestinationLabel();
    return [
      `<!-- Add this card to ${destination}: ${destinationInput.value} -->`,
      `<a class="study-resource-card" href="${escapeHtml(href)}">`,
      `    <div class="study-resource-card-media"><span>Field</span></div>`,
      `    <div class="study-resource-card-copy">`,
      `    <p class="dashboard-panel-kicker">Research Paper</p>`,
      `    <h3>${escapeHtml(title)}</h3>`,
      `    <p>${escapeHtml(subtitle)}</p>`,
      `    <span class="dashboard-panel-cta">Read Paper ›</span>`,
      `    </div>`,
      `</a>`
    ].join("\n");
  }

  async function writeClipboard(value, message) {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      const temporary = document.createElement("textarea");
      temporary.value = value;
      temporary.setAttribute("readonly", "");
      temporary.style.position = "fixed";
      temporary.style.left = "-9999px";
      document.body.appendChild(temporary);
      temporary.select();
      document.execCommand("copy");
      temporary.remove();
    }

    setStatus(message);
  }

  function openPublishModal() {
    if (activeView === "html") syncHtmlToCompose();
    const title = titleInput.value.trim() || "Untitled Research Paper";
    publishFilename.value = getSuggestedArticleHref();
    publishDestination.value = destinationInput.value;
    publishSummary.textContent = `"${title}" is ready for ${getDestinationLabel()}.`;
    publishModal.hidden = false;
  }

  function closePublishModal() {
    publishModal.hidden = true;
  }

  function buildPublishedRecord() {
    const title = titleInput.value.trim() || "Untitled Research Paper";
    return {
      id: getArticleId(),
      href: getSuggestedArticleHref(),
      title,
      subtitle: subtitleInput.value.trim() || "Field paper",
      destination: destinationInput.value,
      destinationLabel: getDestinationLabel(),
      author: authorInput.value.trim(),
      source: sourceInput.value.trim(),
      labels: labelsInput.value.trim(),
      bodyHtml: buildArticleHtml(),
      fullHtml: buildFullArticleDocument(""),
      status: "draft",
      updatedAt: new Date().toISOString()
    };
  }

  async function saveDraft(isAutosave) {
    if (activeView === "html") syncHtmlToCompose();
    const record = { ...buildPublishedRecord(), status: "draft" };
    if (window.TPIApi && await window.TPIApi.isAvailable()) {
      try {
        await window.TPIApi.createArticle({ ...record, articleHtml: record.fullHtml, status: "draft" });
        setStatus(isAutosave ? "Draft autosaved" : "Draft saved");
        return;
      } catch (error) {
        setStatus(error.message || "Draft save failed");
        return;
      }
    }

    const articles = getPublishedArticles();
    const existingIndex = articles.findIndex(article => article.id === record.id);
    if (existingIndex >= 0) articles[existingIndex] = record;
    else articles.push(record);
    savePublishedArticles(articles);
    setStatus(isAutosave ? "Draft autosaved locally" : "Draft saved locally");
  }

  function scheduleAutosave() {
    window.clearTimeout(autosaveTimer);
    autosaveTimer = window.setTimeout(() => {
      saveDraft(true);
    }, 2500);
  }

  async function publishToDestination() {
    const record = { ...buildPublishedRecord(), status: "published" };
    if (window.TPIApi && await window.TPIApi.isAvailable()) {
      try {
        await window.TPIApi.createArticle({
          ...record,
          articleHtml: record.fullHtml,
          status: "published"
        });
        publishFilename.value = record.href;
        publishDestination.value = record.destination;
        setStatus("Published to Cloudflare destination");
        window.open(record.destination, "_blank");
        return;
      } catch (error) {
        setStatus(error.message || "Cloudflare publish failed");
        return;
      }
    }

    const articles = getPublishedArticles();
    const existingIndex = articles.findIndex(article => article.id === record.id);
    if (existingIndex >= 0) {
      articles[existingIndex] = record;
    } else {
      articles.push(record);
    }
    savePublishedArticles(articles);
    publishFilename.value = record.href;
    publishDestination.value = record.destination;
    setStatus("Published to destination");
    window.open(record.destination, "_blank");
  }

  function downloadArticle() {
    const html = buildFullArticleDocument("");
    const blob = new Blob([html], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = publishFilename.value || getSuggestedArticleHref();
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
    setStatus("Article downloaded");
  }

  async function copyFullArticlePage() {
    await writeClipboard(buildFullArticleDocument(""), "Full article copied");
  }

  async function copyDestinationCard() {
    const card = buildDestinationCard();
    await writeClipboard(card, "Destination card copied");
  }

  function openDestinationPage() {
    window.open(destinationInput.value, "_blank");
    setStatus("Destination opened");
  }

  function clearDraft() {
    if (!window.confirm("Clear the editor body?")) return;
    editor.innerHTML = `<p><br></p>${buildAuthorNoteHtml()}`;
    htmlView.value = cleanHtml(editor.innerHTML, true);
    setStatus("Draft cleared");
  }

  function handleMediaAction(button) {
    const figure = button.closest(".embedded-media");
    if (!figure) return;
    const action = button.dataset.mediaAction;

    if (action === "up" && figure.previousElementSibling) {
      figure.parentNode.insertBefore(figure, figure.previousElementSibling);
    }

    if (action === "down" && figure.nextElementSibling) {
      figure.parentNode.insertBefore(figure.nextElementSibling, figure);
    }

    if (action === "small") figure.style.maxWidth = "45%";
    if (action === "medium") figure.style.maxWidth = "70%";
    if (action === "full") figure.style.maxWidth = "100%";
    setStatus("Media adjusted");
  }

  function handlePaste(event) {
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");

    if (html) {
      document.execCommand("insertHTML", false, cleanHtml(html, false));
      saveSelection();
      return;
    }

    const paragraphs = text
      .split(/\n{2,}/)
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => `<p>${escapeHtml(part).replace(/\n/g, "<br>")}</p>`)
      .join("");
    document.execCommand("insertHTML", false, paragraphs);
    saveSelection();
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("button[data-command], button[data-action], button[data-block], button[data-media-action]");
    if (!button) return;

    if (button.dataset.mediaAction) {
      handleMediaAction(button);
      return;
    }

    const command = button.dataset.command;
    const action = button.dataset.action;
    const block = button.dataset.block;

    if (command) exec(command);
    if (block) setBlock(block);
    if (action === "link") insertLink();
    if (action === "image-menu") openMediaModal("image");
    if (action === "video-menu") openMediaModal("video");
    if (action === "media-close") closeMediaModal();
    if (action === "contributors") openContributorManager();
    if (action === "contributors-close") document.getElementById("contributors-modal")?.remove();
    if (action === "image-upload") imageFileInput.click();
    if (action === "image-url") insertImageUrl();
    if (action === "video-upload") videoFileInput.click();
    if (action === "video-url") insertVideoUrl();
    if (action === "audio-menu") openMediaModal("audio");
    if (action === "audio-upload") audioFileInput.click();
    if (action === "audio-url") insertAudioUrl();
    if (action === "embed") insertEmbedCode();
    if (action === "author-note") insertAuthorNote();
    if (action === "preview") openPreview();
    if (action === "save-draft") saveDraft(false);
    if (action === "publish") openPublishModal();
    if (action === "publish-close") closePublishModal();
    if (action === "download-article") downloadArticle();
    if (action === "publish-destination") publishToDestination();
    if (action === "copy-full-page") copyFullArticlePage();
    if (action === "open-destination") openDestinationPage();
    if (action === "copy") copyOutput();
    if (action === "copy-card") copyDestinationCard();
    if (action === "clear") clearDraft();
  });

  document.addEventListener("submit", event => {
    handleAccessSubmit(event);
    addContributor(event);
    addInvite(event);
  });

  viewMode.addEventListener("change", event => {
    setViewMode(event.target.value);
  });

  document.getElementById("editor-block-format").addEventListener("change", event => {
    setBlock(event.target.value);
  });

  editor.addEventListener("input", () => {
    saveSelection();
    scheduleAutosave();
  });
  editor.addEventListener("keyup", saveSelection);
  editor.addEventListener("mouseup", saveSelection);
  editor.addEventListener("focus", saveSelection);
  editor.addEventListener("paste", handlePaste);
  htmlView.addEventListener("input", () => {
    setStatus("HTML edited");
    scheduleAutosave();
  });
  imageFileInput.addEventListener("change", event => {
    insertUploadedFile(event.target.files[0], "image");
    imageFileInput.value = "";
  });
  videoFileInput.addEventListener("change", event => {
    insertUploadedFile(event.target.files[0], "video");
    videoFileInput.value = "";
  });
  audioFileInput.addEventListener("change", event => {
    insertUploadedFile(event.target.files[0], "audio");
    audioFileInput.value = "";
  });
  mediaModal.addEventListener("click", event => {
    if (event.target === mediaModal) closeMediaModal();
  });
  publishModal.addEventListener("click", event => {
    if (event.target === publishModal) closePublishModal();
  });

  async function initEditorAccess() {
    editor.innerHTML = `<p><br></p>${buildAuthorNoteHtml()}`;
    htmlView.value = cleanHtml(editor.innerHTML);
    await loadArticleForEditing();

    if (isDevUnlocked()) {
      unlockEditor({
        username: "",
        displayName: "Developer Unlock",
        role: "admin",
        active: true
      });
      return;
    }

    if (window.TPIApi && await window.TPIApi.isAvailable()) {
      try {
        const result = await window.TPIApi.me();
        if (result.user) {
          unlockEditor({
            username: result.user.username,
            displayName: result.user.displayName,
            title: result.user.title,
            role: result.user.role,
            correspondence: result.user.correspondence,
            affiliation: result.user.affiliation,
            organization: result.user.organization,
            website: result.user.website,
            commentSignatureEnabled: result.user.commentSignatureEnabled,
            active: true
          });
          return;
        }
      } catch (error) {
        // Fall back to local prototype login below.
      }
    }

    const sessionUser = getSessionUser();
    if (sessionUser) {
      unlockEditor(sessionUser);
    } else {
      showAccessGate();
    }
  }

  async function loadArticleForEditing() {
    const articleId = new URLSearchParams(window.location.search).get("article");
    if (!articleId) return;

    let article = null;
    if (window.TPIApi && await window.TPIApi.isAvailable()) {
      try {
        const response = await fetch("/api/contributors/me/articles", { credentials: "same-origin" });
        if (response.ok) {
          const articles = (await response.json()).articles || [];
          article = articles.find(item => item.id === articleId);
        }
      } catch (error) {
        article = null;
      }
    } else {
      article = getPublishedArticles().find(item => item.id === articleId);
    }

    if (!article) return;
    titleInput.value = article.title || "Untitled Research Paper";
    subtitleInput.value = article.subtitle || "Research Library Draft";
    if (article.destination) destinationInput.value = article.destination;
    if (article.author) authorInput.value = article.author;
    if (article.source) sourceInput.value = article.source;
    if (article.labels) labelsInput.value = article.labels;
    editor.innerHTML = article.bodyHtml || "<p><br></p>";
    htmlView.value = cleanHtml(editor.innerHTML);
    setStatus(article.status === "published" ? "Loaded published paper" : "Loaded draft");
  }

  initEditorAccess();
})();
