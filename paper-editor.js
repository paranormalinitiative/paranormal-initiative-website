(function () {
  const titleInput = document.getElementById("editor-title");
  const subtitleInput = document.getElementById("editor-subtitle");
  const sourceInput = document.getElementById("editor-source");
  const authorInput = document.getElementById("editor-author");
  const editor = document.getElementById("paper-editor-body");
  const previewTitle = document.getElementById("preview-title");
  const previewSubtitle = document.getElementById("preview-subtitle");
  const previewMeta = document.getElementById("preview-meta");
  const previewBody = document.getElementById("preview-body");
  const htmlOutput = document.getElementById("editor-html-output");
  const status = document.getElementById("editor-status");
  const toolbar = document.querySelector(".editor-toolbar");

  const defaultBody = [
    "<h3>Introduction</h3>",
    "<p>Begin the paper here. Write it like one continuous research article, not a collection of separate cards.</p>",
    "<h3>Evidence and Context</h3>",
    "<p>Add the field background, examples, audio references, photographs, review limits, or source links that support the paper.</p>",
    "<h3>Working Notes</h3>",
    "<p>Use clear paragraphs, occasional bold labels, and restrained research language.</p>"
  ].join("");

  function setStatus(message) {
    status.textContent = message;
    window.clearTimeout(setStatus.timer);
    setStatus.timer = window.setTimeout(() => {
      status.textContent = "Draft ready";
    }, 1800);
  }

  function cleanHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = html;

    template.content.querySelectorAll("script, style, iframe, object, embed").forEach(node => node.remove());
    template.content.querySelectorAll("*").forEach(node => {
      [...node.attributes].forEach(attr => {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim().toLowerCase();
        if (name.startsWith("on") || value.startsWith("javascript:")) {
          node.removeAttribute(attr.name);
        }
      });
    });

    return template.innerHTML;
  }

  function buildArticleHtml() {
    return cleanHtml(editor.innerHTML).trim();
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
    htmlOutput.value = buildArticleHtml();
  }

  function exec(command, value) {
    editor.focus();
    document.execCommand(command, false, value || null);
    updatePreview();
  }

  function setBlock(tagName) {
    exec("formatBlock", tagName);
  }

  function insertLink() {
    const url = window.prompt("Paste the source URL");
    if (!url) return;
    exec("createLink", url);
  }

  function copyOutput() {
    htmlOutput.select();
    document.execCommand("copy");
    setStatus("HTML copied");
  }

  function clearDraft() {
    if (!window.confirm("Clear the editor body?")) return;
    editor.innerHTML = "";
    updatePreview();
    setStatus("Editor cleared");
  }

  function loadSample() {
    editor.innerHTML = defaultBody;
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
      .map(part => `<p>${part.replace(/\n/g, "<br>")}</p>`)
      .join("");
    document.execCommand("insertHTML", false, paragraphs);
    updatePreview();
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("button[data-command], button[data-block], button[data-action]");
    if (!button) return;

    const command = button.dataset.command;
    const block = button.dataset.block;
    const action = button.dataset.action;

    if (command) exec(command);
    if (block) setBlock(block);
    if (action === "link") insertLink();
    if (action === "copy") copyOutput();
    if (action === "clear") clearDraft();
    if (action === "sample") loadSample();
  });

  [titleInput, subtitleInput, sourceInput, authorInput, editor].forEach(node => {
    node.addEventListener("input", updatePreview);
  });
  editor.addEventListener("paste", handlePaste);

  loadSample();
})();
