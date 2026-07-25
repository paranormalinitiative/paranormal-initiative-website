(function () {
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
  const mediaModal = document.getElementById("media-modal");
  const mediaModalTitle = document.getElementById("media-modal-title");
  const imageModalBody = document.querySelector(".media-modal-image");
  const videoModalBody = document.querySelector(".media-modal-video");
  const imageUrlInput = document.getElementById("image-url-input");
  const imageCaptionInput = document.getElementById("image-caption-input");
  const videoUrlInput = document.getElementById("video-url-input");
  const publishModal = document.getElementById("publish-modal");
  const publishSummary = document.getElementById("publish-summary");
  const publishFilename = document.getElementById("publish-filename");
  const publishDestination = document.getElementById("publish-destination");

  let activeView = "compose";
  let savedSelection = null;

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
    const title = titleInput.value.trim() || "Untitled Research Paper";
    const destination = destinationInput.value;
    const prefix = destination.startsWith("education-area-") ? "education-research" : destination.replace(/\.html$/, "");
    return `${prefix}-${slugify(title)}.html`;
  }

  function setStatus(message) {
    status.textContent = message;
    window.clearTimeout(setStatus.timer);
    setStatus.timer = window.setTimeout(() => {
      status.textContent = "Draft ready";
    }, 1800);
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
    mediaModalTitle.textContent = kind === "image" ? "Insert Image" : "Insert Video";
    if (kind === "image") {
      imageUrlInput.focus();
    } else {
      videoUrlInput.focus();
    }
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
    const alt = imageCaptionInput.value.trim();
    insertHtml(withMediaControls(`<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}">${alt ? `<figcaption>${escapeHtml(alt)}</figcaption>` : ""}`));
    imageUrlInput.value = "";
    imageCaptionInput.value = "";
    closeMediaModal();
  }

  function insertVideoUrl() {
    const url = videoUrlInput.value.trim();
    if (!url) return;
    const html = buildVideoEmbed(url);
    if (!html) {
      setStatus("Video URL not recognized");
      return;
    }
    insertHtml(html);
    videoUrlInput.value = "";
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

  function insertUploadedFile(file, kind) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (kind === "image") {
        const alt = imageCaptionInput.value.trim() || file.name.replace(/\.[^.]+$/, "");
        insertHtml(withMediaControls(`<img src="${escapeHtml(dataUrl)}" alt="${escapeHtml(alt)}">${alt ? `<figcaption>${escapeHtml(alt)}</figcaption>` : ""}`));
      } else {
        insertHtml(withMediaControls(`<video controls src="${escapeHtml(dataUrl)}"></video><figcaption>${escapeHtml(file.name)}</figcaption>`));
      }
      closeMediaModal();
      setStatus(`${kind === "image" ? "Image" : "Video"} uploaded`);
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
      `    <p class="dashboard-panel-kicker">Research Paper</p>`,
      `    <h3>${escapeHtml(title)}</h3>`,
      `    <p>${escapeHtml(subtitle)}</p>`,
      `    <span class="dashboard-panel-cta">Read Paper ›</span>`,
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
    if (action === "image-upload") imageFileInput.click();
    if (action === "image-url") insertImageUrl();
    if (action === "video-upload") videoFileInput.click();
    if (action === "video-url") insertVideoUrl();
    if (action === "embed") insertEmbedCode();
    if (action === "author-note") insertAuthorNote();
    if (action === "preview") openPreview();
    if (action === "publish") openPublishModal();
    if (action === "publish-close") closePublishModal();
    if (action === "download-article") downloadArticle();
    if (action === "copy-full-page") copyFullArticlePage();
    if (action === "open-destination") openDestinationPage();
    if (action === "copy") copyOutput();
    if (action === "copy-card") copyDestinationCard();
    if (action === "clear") clearDraft();
  });

  viewMode.addEventListener("change", event => {
    setViewMode(event.target.value);
  });

  document.getElementById("editor-block-format").addEventListener("change", event => {
    setBlock(event.target.value);
  });

  editor.addEventListener("input", saveSelection);
  editor.addEventListener("keyup", saveSelection);
  editor.addEventListener("mouseup", saveSelection);
  editor.addEventListener("focus", saveSelection);
  editor.addEventListener("paste", handlePaste);
  htmlView.addEventListener("input", () => setStatus("HTML edited"));
  imageFileInput.addEventListener("change", event => {
    insertUploadedFile(event.target.files[0], "image");
    imageFileInput.value = "";
  });
  videoFileInput.addEventListener("change", event => {
    insertUploadedFile(event.target.files[0], "video");
    videoFileInput.value = "";
  });
  mediaModal.addEventListener("click", event => {
    if (event.target === mediaModal) closeMediaModal();
  });
  publishModal.addEventListener("click", event => {
    if (event.target === publishModal) closePublishModal();
  });

  editor.innerHTML = `<p><br></p>${buildAuthorNoteHtml()}`;
  htmlView.value = cleanHtml(editor.innerHTML);
})();
