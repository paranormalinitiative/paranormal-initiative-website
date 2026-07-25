(function () {
  const titleInput = document.getElementById("editor-title");
  const subtitleInput = document.getElementById("editor-subtitle");
  const sourceInput = document.getElementById("editor-source");
  const authorInput = document.getElementById("editor-author");
  const editor = document.getElementById("paper-editor-body");
  const htmlView = document.getElementById("editor-html-view");
  const previewTitle = document.getElementById("preview-title");
  const previewSubtitle = document.getElementById("preview-subtitle");
  const previewMeta = document.getElementById("preview-meta");
  const previewBody = document.getElementById("preview-body");
  const status = document.getElementById("editor-status");
  const layout = document.querySelector(".paper-editor-layout");
  const modeButtons = document.querySelectorAll("[data-view]");

  let activeView = "compose";

  const defaultBody = [
    "<h3>Introduction</h3>",
    "<p>Begin the paper here. Write it like one continuous research article, not a collection of separate cards.</p>",
    "<h3>Evidence and Context</h3>",
    "<p>Add field background, source links, photographs, audio references, video embeds, review limits, and documentation that support the paper.</p>",
    "<h3>Working Notes</h3>",
    "<p>Use clear paragraphs, occasional bold labels, and restrained research language.</p>"
  ].join("");

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

  function setStatus(message) {
    status.textContent = message;
    window.clearTimeout(setStatus.timer);
    setStatus.timer = window.setTimeout(() => {
      status.textContent = "Draft ready";
    }, 1800);
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function isSafeUrl(rawUrl) {
    try {
      const url = new URL(rawUrl, window.location.href);
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

  function cleanHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = html;

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
      [...node.attributes].forEach(attr => {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim();
        const lowered = value.toLowerCase();

        if (name.startsWith("on") || lowered.startsWith("javascript:")) {
          node.removeAttribute(attr.name);
        }

        if (["href", "src"].includes(name) && value && !isSafeUrl(value)) {
          node.removeAttribute(attr.name);
        }
      });
    });

    return template.innerHTML;
  }

  function getDraftHtml() {
    return activeView === "html" ? htmlView.value : editor.innerHTML;
  }

  function buildArticleHtml() {
    return cleanHtml(getDraftHtml()).trim();
  }

  function updatePreview() {
    const title = titleInput.value.trim() || "Untitled Research Paper";
    const subtitle = subtitleInput.value.trim() || "Research Library Draft";
    const author = authorInput.value.trim();
    const source = sourceInput.value.trim();

    previewTitle.textContent = title;
    previewSubtitle.textContent = subtitle;
    previewMeta.textContent = [author, source].filter(Boolean).join(" · ");
    previewBody.innerHTML = buildArticleHtml();
  }

  function setViewMode(mode) {
    if (mode === activeView) return;

    if (activeView === "html") {
      editor.innerHTML = cleanHtml(htmlView.value);
    }

    activeView = mode;
    modeButtons.forEach(button => {
      button.classList.toggle("active", button.dataset.view === mode);
    });

    layout.classList.toggle("html-mode", mode === "html");
    layout.classList.toggle("preview-focus", mode === "preview");

    if (mode === "html") {
      htmlView.value = cleanHtml(editor.innerHTML);
      htmlView.focus();
      setStatus("HTML view");
    } else {
      editor.focus();
      setStatus(mode === "preview" ? "Preview focus" : "Compose view");
    }

    updatePreview();
  }

  function exec(command, value) {
    if (activeView === "html") setViewMode("compose");
    editor.focus();
    document.execCommand(command, false, value || null);
    updatePreview();
  }

  function setBlock(tagName) {
    exec("formatBlock", tagName);
  }

  function insertHtml(html) {
    if (activeView === "html") {
      htmlView.setRangeText(html, htmlView.selectionStart, htmlView.selectionEnd, "end");
      updatePreview();
      return;
    }

    editor.focus();
    document.execCommand("insertHTML", false, cleanHtml(html));
    updatePreview();
  }

  function insertLink() {
    const url = window.prompt("Paste the source URL");
    if (!url || !isSafeUrl(url)) return;
    exec("createLink", url);
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
        return `<figure class="embedded-media"><iframe src="${escapeHtml(src)}" title="Embedded video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></figure>`;
      }

      if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url.pathname)) {
        return `<figure class="embedded-media"><video controls src="${escapeHtml(rawUrl.trim())}"></video></figure>`;
      }

      return `<p><a href="${escapeHtml(rawUrl.trim())}">Video source</a></p>`;
    } catch (error) {
      return "";
    }
  }

  function insertImage() {
    const url = window.prompt("Paste the image URL");
    if (!url || !isSafeUrl(url)) return;
    const alt = window.prompt("Image description or caption", "") || "";
    insertHtml(`<figure class="embedded-media"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}">${alt ? `<figcaption>${escapeHtml(alt)}</figcaption>` : ""}</figure>`);
    setStatus("Image inserted");
  }

  function insertVideo() {
    const url = window.prompt("Paste a YouTube, Rumble, Google Drive preview, or MP4/WebM video URL");
    if (!url) return;
    const html = buildVideoEmbed(url);
    if (!html) {
      setStatus("Video URL not recognized");
      return;
    }
    insertHtml(html);
    setStatus("Video inserted");
  }

  function insertEmbedCode() {
    const html = window.prompt("Paste trusted iframe embed code");
    if (!html) return;
    const cleaned = cleanHtml(html);
    if (!cleaned.trim()) {
      setStatus("Embed was blocked");
      return;
    }
    insertHtml(`<figure class="embedded-media">${cleaned}</figure>`);
    setStatus("Embed inserted");
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

  function clearDraft() {
    if (!window.confirm("Clear the editor body?")) return;
    editor.innerHTML = "";
    htmlView.value = "";
    updatePreview();
    setStatus("Editor cleared");
  }

  function loadSample() {
    editor.innerHTML = defaultBody;
    htmlView.value = cleanHtml(defaultBody);
    updatePreview();
    setStatus("Sample loaded");
  }

  function handlePaste(event) {
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");

    if (html) {
      document.execCommand("insertHTML", false, cleanHtml(html));
      updatePreview();
      return;
    }

    const paragraphs = text
      .split(/\n{2,}/)
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => `<p>${escapeHtml(part).replace(/\n/g, "<br>")}</p>`)
      .join("");
    document.execCommand("insertHTML", false, paragraphs);
    updatePreview();
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("button[data-command], button[data-action], button[data-view]");
    if (!button) return;

    const command = button.dataset.command;
    const action = button.dataset.action;
    const view = button.dataset.view;

    if (view) setViewMode(view);
    if (command) exec(command);
    if (action === "link") insertLink();
    if (action === "image") insertImage();
    if (action === "video") insertVideo();
    if (action === "embed") insertEmbedCode();
    if (action === "copy") copyOutput();
    if (action === "clear") clearDraft();
    if (action === "sample") loadSample();
  });

  document.getElementById("editor-block-format").addEventListener("change", event => {
    setBlock(event.target.value);
  });

  [titleInput, subtitleInput, sourceInput, authorInput, editor].forEach(node => {
    node.addEventListener("input", updatePreview);
  });
  htmlView.addEventListener("input", updatePreview);
  editor.addEventListener("paste", handlePaste);

  loadSample();
})();
