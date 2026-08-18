(function () {
  const ACCESS_USERS_KEY = "tpiEditorContributors";
  const ACCESS_SESSION_KEY = "tpiEditorSession";
  const ACCESS_INVITES_KEY = "tpiEditorInvites";
  const PUBLISHED_ARTICLES_KEY = "tpiPublishedArticles";
  const POST_SETTINGS_WIDTH_KEY = "tpiPostSettingsWidth";
  const titleInput = document.getElementById("editor-title");
  const subtitleInput = document.getElementById("editor-subtitle");
  const destinationInput = document.getElementById("editor-destination");
  const contributionTypeInput = document.getElementById("editor-contribution-type");
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
  const resizeHandle = document.querySelector(".editor-resize-handle");
  const viewMode = document.getElementById("editor-view-mode");
  const fontFamilyInput = document.getElementById("editor-font-family");
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
  const writingGuidesModal = document.getElementById("writing-guides-modal");
  const writingGuideContent = document.getElementById("writing-guide-content");
  const tpiVideoFields = document.getElementById("tpi-video-fields");
  const videoUrlEditorInput = document.getElementById("editor-video-url");
  const embedUrlInput = document.getElementById("editor-embed-url");
  const thumbnailUrlInput = document.getElementById("editor-thumbnail-url");
  const videoCategoryInput = document.getElementById("editor-video-category");
  const videoTagsInput = document.getElementById("editor-video-tags");
  const videoSeriesInput = document.getElementById("editor-video-series");
  const videoEpisodeInput = document.getElementById("editor-video-episode");
  const videoDurationInput = document.getElementById("editor-video-duration");
  const videoFeaturedInput = document.getElementById("editor-video-featured");
  const videoLiveInput = document.getElementById("editor-video-live");

  let activeView = "compose";
  let savedSelection = null;
  let currentUser = null;
  let currentArticleId = null;
  let autosaveTimer = null;
  let resizeState = null;
  let modalDragState = null;

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

  const templateStarters = {
    "research-paper": {
      label: "Research Paper Template",
      html: "<h3>Title</h3><p>Replace this with the paper title or remove this heading if the title field above already covers it.</p><h3>Subtitle or Short Description</h3><p>Briefly state what this paper examines and why the subject matters.</p><h3>Introduction</h3><p>Introduce the topic, question, method, claim, or research area. Explain what the reader should understand by the end of the paper.</p><h3>Background or Context</h3><p>Provide the field, historical, technical, environmental, cultural, or investigative context needed to understand the subject.</p><h3>Key Terms or Definitions</h3><p>Define any important terms, methods, equipment names, theories, or claim categories used in the paper.</p><h3>Main Discussion</h3><p>Develop the central argument, explanation, comparison, or research discussion in clear paragraphs.</p><h3>Evidence, Examples, Sources, or Observations</h3><p>Include documented examples, source links, field observations, photographs, charts, audio, video, or other supporting material where useful.</p><h3>Limitations</h3><p>State what cannot be concluded, what remains uncertain, and what information would be needed for stronger interpretation.</p><h3>Conclusion</h3><p>Summarize the most important points without overstating the claim.</p><h3>Author Note</h3><p>Add the author note manually from the toolbar when ready, or replace this text with the final author information.</p><h3>References or Source Links</h3><p>Add source links, citations, author pages, books, articles, archives, or related references.</p>"
    },
    "research-note": {
      label: "Research Note Template",
      html: "<h3>Title</h3><p>Replace this with the note title or remove this heading if the title field above already covers it.</p><h3>Note Type or Topic</h3><p>Describe whether this is a field note, source note, equipment note, EVP/ITC note, theory note, or working question.</p><h3>Date or Context</h3><p>Add the date, location, session, source, or situation if relevant.</p><h3>Observation, Question, or Idea</h3><p>Write the main note clearly. What did you observe, wonder, notice, compare, or want to preserve?</p><h3>Why It Matters</h3><p>Explain why this note may be useful for future research, field work, review, education, or discussion.</p><h3>Supporting Details</h3><p>Add details, source links, timestamps, images, graphs, screenshots, audio, video, or equipment settings where useful.</p><h3>Limits or Concerns</h3><p>State what is uncertain, incomplete, private, untested, or not ready for a stronger conclusion.</p><h3>Possible Next Steps</h3><p>List follow-up questions, tests, sources to review, or ways this note could become a larger paper.</p><h3>Author Note</h3><p>Add the author note manually from the toolbar when ready, or replace this text with the final author information.</p>"
    },
    "experimental-report": {
      label: "Experimental Report Template",
      html: "<h3>Title</h3><p>Replace this with the experiment title or remove this heading if the title field above already covers it.</p><h3>Experiment Type</h3><p>State whether this is EVP, ITC, ACS, environmental, equipment, audio, visual, consciousness, or another type of experiment.</p><h3>Purpose or Research Question</h3><p>Explain what the experiment was designed to explore, compare, test, or document.</p><h3>Date, Time, and Location</h3><p>Add relevant date, time, session, room, site, or controlled environment information.</p><h3>Equipment or Software Used</h3><p>List devices, software, microphones, cameras, sensors, apps, settings, versions, or experimental tools.</p><h3>Setup</h3><p>Describe how the experiment was arranged before it began.</p><h3>Procedure</h3><p>Describe what was done, in what order, and for how long.</p><h3>Controls</h3><p>Document controls, baseline checks, contamination checks, silence periods, control files, or comparison conditions.</p><h3>Observations</h3><p>Write what was observed during the session or review, including timestamps where useful.</p><h3>Results</h3><p>Describe the outcome carefully. Separate raw observations from interpretation.</p><h3>Limitations</h3><p>State weaknesses, unknowns, possible contamination, equipment limits, environmental concerns, or review limits.</p><h3>Conclusion</h3><p>Summarize what the experiment suggests and what it does not prove.</p><h3>Suggested Follow-Up</h3><p>Describe what should be repeated, changed, controlled, or reviewed next.</p><h3>Author Note</h3><p>Add the author note manually from the toolbar when ready, or replace this text with the final author information.</p>"
    },
    "technical-note": {
      label: "Technical Note Template",
      html: "<h3>Title</h3><p>Replace this with the technical note title or remove this heading if the title field above already covers it.</p><h3>Tool, Method, or System Being Discussed</h3><p>Name the device, method, software, workflow, setting, sensor, file type, or concept.</p><h3>Plain-Language Summary</h3><p>Explain the subject in practical language for investigators and readers.</p><h3>What It Does</h3><p>Describe what the tool or method actually measures, produces, changes, records, or helps review.</p><h3>What It Does Not Do</h3><p>Clarify common misunderstandings and claims the tool or method cannot support by itself.</p><h3>Common Uses</h3><p>List appropriate research, documentation, review, or field uses.</p><h3>Common Mistakes</h3><p>Describe frequent errors, misreadings, setup problems, contamination issues, or exaggerated claims.</p><h3>Setup or Workflow Notes</h3><p>Add settings, steps, file handling notes, repeatable workflow details, or recommended documentation.</p><h3>Limitations</h3><p>Explain what can affect reliability, interpretation, accuracy, or usefulness.</p><h3>Example Field Language</h3><p>Provide careful wording investigators can use when documenting this tool or method.</p><h3>Author Note</h3><p>Add the author note manually from the toolbar when ready, or replace this text with the final author information.</p>"
    },
    "field-article": {
      label: "Field Article Template",
      html: "<h3>Title</h3><p>Replace this with the field article title or remove this heading if the title field above already covers it.</p><h3>Field Topic or Lesson</h3><p>State the practical investigation topic, lesson, situation, or issue being discussed.</p><h3>What Happened or Prompted This Article</h3><p>Describe the field experience, question, mistake, observation, case pattern, or training need that led to the article.</p><h3>Practical Context</h3><p>Explain the real-world investigation context so readers understand when this matters.</p><h3>What Investigators Should Notice</h3><p>Point out details, behaviors, environmental factors, documentation needs, or review habits that matter in the field.</p><h3>Documentation or Safety Concerns</h3><p>Include permission, privacy, witness care, physical safety, contamination, equipment handling, or reporting concerns.</p><h3>What This Teaches</h3><p>Explain the main lesson clearly and practically.</p><h3>Limitations</h3><p>State where the lesson may not apply, what remains uncertain, or what depends on the case.</p><h3>Author Note</h3><p>Add the author note manually from the toolbar when ready, or replace this text with the final author information.</p>"
    },
    "review-paper": {
      label: "Review Paper Template",
      html: "<h3>Title</h3><p>Replace this with the review title or remove this heading if the title field above already covers it.</p><h3>Topic or Question Being Reviewed</h3><p>State the subject, claim, method, theory, author, equipment issue, or research question being reviewed.</p><h3>Why The Topic Matters</h3><p>Explain why readers, investigators, researchers, or contributors should care about the topic.</p><h3>Sources, Authors, Methods, or Ideas Being Compared</h3><p>List or describe the sources, positions, methods, evidence, papers, books, videos, or claims being examined.</p><h3>Summary of Major Positions</h3><p>Summarize the main views fairly before offering analysis.</p><h3>Strengths</h3><p>Describe what is useful, credible, well documented, thoughtful, or worth preserving.</p><h3>Weaknesses or Limitations</h3><p>Describe missing context, weak evidence, unclear claims, unsupported certainty, or unresolved issues.</p><h3>Open Questions</h3><p>List questions that remain after the review.</p><h3>Conclusion</h3><p>Summarize the review in careful language without turning it into a verdict.</p><h3>References or Source Links</h3><p>Add source links, citations, author pages, books, articles, archives, or related references.</p><h3>Author Note</h3><p>Add the author note manually from the toolbar when ready, or replace this text with the final author information.</p>"
    },
    "case-location-study": {
      label: "Case / Location Study Template",
      html: "<h3>Title</h3><p>Replace this with the case or location title or remove this heading if the title field above already covers it.</p><h3>Location, Case, or Claim Being Studied</h3><p>Name the location, case type, historical claim, reported activity, or subject of study.</p><h3>Reason for Study</h3><p>Explain why this case, location, or claim deserves documentation or review.</p><h3>Historical or Cultural Background</h3><p>Add relevant history, folklore, records, local context, timelines, or cultural material.</p><h3>Reported Claims</h3><p>Document reported experiences or claims carefully, separating witness reports from verified facts.</p><h3>Known Sources and Records</h3><p>List records, archives, books, articles, interviews, maps, newspaper items, cemetery records, or other sources.</p><h3>Field Observations</h3><p>Add investigation observations if available, including environmental conditions, access limits, and field notes.</p><h3>Evidence or Documentation Reviewed</h3><p>Include photographs, audio, video, documents, maps, timelines, or other reviewed material.</p><h3>Limitations</h3><p>State what could not be verified, what is missing, and what should not be concluded.</p><h3>Conclusion</h3><p>Summarize what the study documents and what remains open.</p><h3>Author Note</h3><p>Add the author note manually from the toolbar when ready, or replace this text with the final author information.</p>"
    },
    "media-review": {
      label: "Media Review Template",
      html: "<h3>Title</h3><p>Replace this with the media review title or remove this heading if the title field above already covers it.</p><h3>Media Type Being Reviewed</h3><p>State whether this is audio, EVP, ITC, photo, video, screenshot, spectrogram, metadata, or another file type.</p><h3>Source, Date, and File Context</h3><p>Document where the file came from, when it was created, who provided it, and what surrounding context matters.</p><h3>Original-File Status</h3><p>State whether the original file is preserved, whether a copy was used, and whether edits or compression are known.</p><h3>Review Method</h3><p>Describe how the media was reviewed, including software, listening/viewing method, timestamps, blind review, comparisons, or controls.</p><h3>Observations</h3><p>Describe what was observed without telling readers what they must hear or see. Include timestamps where useful.</p><h3>Possible Contamination or Ordinary Explanations</h3><p>Consider voices, handling noise, compression, reflections, blur, radio, team movement, environmental sound, equipment behavior, or other ordinary causes.</p><h3>Classification</h3><p>Classify the material as explained, likely explained, unresolved, unusable, contamination suspected, or requiring further review.</p><h3>Limitations</h3><p>State what cannot be determined from the media and what context is missing.</p><h3>Conclusion</h3><p>Summarize the review carefully. Unresolved media is not proof; it is material for further analysis.</p><h3>Author Note</h3><p>Add the author note manually from the toolbar when ready, or replace this text with the final author information.</p>"
    },
    "tpi-video": {
      label: "TPI Video Template",
      html: "<h3>Video Description</h3><p>Summarize what viewers will see, hear, or learn in this video. Include the main topics, experiments, discussions, or presentations covered.</p><h3>Topics Covered</h3><p>List the key subjects, research areas, or discussion points featured in this video.</p><h3>Key Moments</h3><p>Note important timestamps, demonstrations, findings, or highlights viewers should pay attention to.</p><h3>Related Research</h3><p>Connect this video to related TPI research, articles, education materials, or previous broadcasts.</p><h3>Equipment or Methods Shown</h3><p>Describe any equipment, software, techniques, or experimental methods demonstrated in the video.</p><h3>Notes for Researchers</h3><p>Add any context, caveats, follow-up questions, or additional resources relevant to researchers watching this video.</p>"
    }
  };

  const guideTemplateMap = {
    "research-papers.md": "research-paper",
    "research-notes.md": "research-note",
    "experimental-reports.md": "experimental-report",
    "technical-notes.md": "technical-note",
    "field-articles.md": "field-article",
    "case-location-studies.md": "case-location-study",
    "review-papers.md": "review-paper",
    "media-reviews.md": "media-review",
    "tpi-videos.md": "tpi-video"
  };

  function getDestinationLabel() {
    return destinationInput.options[destinationInput.selectedIndex].textContent.trim();
  }

  function getContributionType() {
    return contributionTypeInput?.value?.trim() || "Research Paper";
  }

  function isTpiVideoType() {
    return getContributionType() === "TPI Video";
  }

  function updateVideoFieldsVisibility() {
    if (tpiVideoFields) {
      tpiVideoFields.hidden = !isTpiVideoType();
    }
    const publishBtn = document.querySelector('[data-action="publish"]');
    if (publishBtn) {
      publishBtn.textContent = isTpiVideoType() ? "Publish Video" : "Publish Article";
    }
  }

  function detectPlatformFromUrl(url) {
    const u = String(url || "").toLowerCase();
    if (u.includes("rumble.com")) return "Rumble";
    if (u.includes("youtube.com") || u.includes("youtu.be")) return "YouTube";
    return "";
  }

  function getVideoSlug() {
    const title = titleInput.value.trim() || "untitled-video";
    return title.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "untitled-video";
  }

  function buildVideoRecord() {
    const title = titleInput.value.trim() || "Untitled Video";
    const videoUrl = videoUrlEditorInput?.value?.trim() || "";
    const tags = videoTagsInput?.value?.trim() || "";
    return {
      id: currentArticleId || crypto.randomUUID(),
      slug: getVideoSlug(),
      title,
      description: buildArticleHtml(),
      publishedAt: new Date().toISOString().slice(0, 10),
      category: videoCategoryInput?.value || "Applied Paranormal Research and Studies",
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      platform: detectPlatformFromUrl(videoUrl),
      videoUrl,
      embedUrl: embedUrlInput?.value?.trim() || "",
      thumbnail: thumbnailUrlInput?.value?.trim() || "",
      featured: videoFeaturedInput?.checked || false,
      isLive: videoLiveInput?.checked || false,
      liveStartedAt: videoLiveInput?.checked ? new Date().toISOString() : "",
      series: videoSeriesInput?.value?.trim() || "",
      episode: videoEpisodeInput?.value?.trim() || "",
      duration: videoDurationInput?.value?.trim() || "",
      status: "published"
    };
  }

  function getArticleMediaLabelFromHtml(html) {
    const source = String(html || "");
    if (/<(?:video|iframe)\b/i.test(source)) return "Video";
    if (/<audio\b/i.test(source)) return "Audio";
    if (/<img\b/i.test(source)) return "Images";
    return "";
  }

  function getDisplayContributionType(baseType, html) {
    const contributionType = baseType || "Research Paper";
    const mediaLabel = getArticleMediaLabelFromHtml(html);
    return mediaLabel && !contributionType.toLowerCase().includes(mediaLabel.toLowerCase())
      ? `${contributionType} / ${mediaLabel}`
      : contributionType;
  }

  const UNTITLED_TITLE_MAP = {
    "Research Paper": "Untitled Research Paper",
    "Research Note": "Untitled Research Note",
    "Experimental Report": "Untitled Experimental Report",
    "Technical Note": "Untitled Technical Note",
    "Field Article": "Untitled Article",
    "Case / Location Study": "Untitled Case / Location",
    "Review Paper": "Untitled Review",
    "Media Review": "Untitled Media Review",
    "Method Exercise": "Untitled Content",
    "Contributor Note": "Untitled Content",
    "TPI Video": "Untitled Video"
  };
  const DEFAULT_UNTITLED_TITLE = "Untitled Content";

  function getUntitledTitleForType(type) {
    return UNTITLED_TITLE_MAP[type] || DEFAULT_UNTITLED_TITLE;
  }

  function getCurrentUntitledTitle() {
    return getUntitledTitleForType(getContributionType());
  }

  function isUntitledTitle(title) {
    const t = String(title || "").trim();
    if (!t) return true;
    const lower = t.toLowerCase();
    if (lower === "untitled content") return true;
    return Object.values(UNTITLED_TITLE_MAP).some(v => lower === v.toLowerCase());
  }

  function updateTitleForContributionType() {
    const current = titleInput.value.trim();
    if (isUntitledTitle(current)) {
      titleInput.value = getCurrentUntitledTitle();
    }
  }

  function getPublishableTitle() {
    const title = titleInput.value.trim();
    if (!title || isUntitledTitle(title)) return "";
    return title;
  }

  function slugify(value) {
    return value
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled-content";
  }

  function getSuggestedArticleHref() {
    return `published-article.html?id=${encodeURIComponent(getArticleId())}`;
  }

  function getArticleId() {
    const title = titleInput.value.trim() || getCurrentUntitledTitle();
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

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function setPostSettingsWidth(width) {
    const maxWidth = Math.max(380, Math.min(620, Math.floor(window.innerWidth * 0.46)));
    const nextWidth = clamp(Math.round(width), 380, maxWidth);
    layout?.style.setProperty("--post-settings-width", `${nextWidth}px`);
    return nextWidth;
  }

  function loadPostSettingsWidth() {
    const savedWidth = Number(localStorage.getItem(POST_SETTINGS_WIDTH_KEY));
    if (Number.isFinite(savedWidth) && savedWidth > 0) setPostSettingsWidth(savedWidth);
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

  function getLegacyEditorArticles(profile) {
    return (window.TPILegacyContributions?.forProfile(profile) || []).map(article => ({
      id: `legacy:${article.href}`,
      title: article.title,
      subtitle: article.subtitle,
      href: article.href,
      destination: article.destination || "",
      contributionType: article.contributionType || "Legacy Site Page",
      status: "legacy-published",
      legacy: true
    }));
  }

  function normalizeLegacyHref(value) {
    return String(value || "").trim().replace(/^\.?\//, "");
  }

  function getConvertedLegacySources(articles) {
    return new Set((articles || [])
      .map(article => normalizeLegacyHref(article.source))
      .filter(Boolean));
  }

  function getLegacySourceTitle(source) {
    const normalizedSource = normalizeLegacyHref(source);
    if (!normalizedSource) return "";
    return getLegacyEditorArticles(currentUser).find(article => normalizeLegacyHref(article.href) === normalizedSource)?.title || "";
  }

  function getLegacyArticleId(legacyArticle) {
    return `legacy-${normalizeLegacyHref(legacyArticle?.href)
      .replace(/\.html$/i, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()}`;
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

  function setDefaultDraftBody() {
    titleInput.value = getCurrentUntitledTitle();
    editor.innerHTML = "<p><br></p>";
    htmlView.value = cleanHtml(editor.innerHTML, true);
    focusEditorStart();
  }

  function focusEditorStart() {
    if (activeView === "html") {
      htmlView.focus();
      htmlView.setSelectionRange(0, 0);
      return;
    }
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    savedSelection = range.cloneRange();
  }

  function hasContributorAccess(user) {
    return ["owner", "admin", "contributor"].includes(String(user?.role || "").toLowerCase());
  }

  function isEditorBlank() {
    return !editor.textContent.trim() && !editor.querySelector("img, video, audio, iframe, figure");
  }

  function unlockEditor(user, options = {}) {
    currentUser = user;
    if (user.username) localStorage.setItem(ACCESS_SESSION_KEY, user.username);
    document.body.classList.remove("editor-locked");
    document.body.classList.add("editor-authenticated");
    document.body.dataset.editorCopyAllowed = "true";
    if (options.applyProfile !== false) applyContributorProfile(user);
    if (options.initializeDraft && isEditorBlank()) setDefaultDraftBody();
    if (options.focusEditor) focusEditorStart();
    setStatus(`Signed in as ${user.displayName || user.username}`);
    const gate = document.getElementById("editor-access-gate");
    if (gate) gate.remove();
  }

  function lockEditor() {
    currentUser = null;
    localStorage.removeItem(ACCESS_SESSION_KEY);
    document.body.classList.add("editor-locked");
    document.body.classList.remove("editor-authenticated");
    delete document.body.dataset.editorCopyAllowed;
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
        <p>Use your contributor username and password to open the Content Editor. Dev copy mode also unlocks this page for site work.</p>
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
        if (!hasContributorAccess(result.user)) {
          throw new Error("Contributor access is required to open the Content Editor.");
        }
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
        }, { initializeDraft: true, focusEditor: true });
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
    if (!user || !hasContributorAccess(user)) {
      form.querySelector(".access-note")?.remove();
      const note = document.createElement("p");
      note.className = "access-note access-error";
      note.textContent = !user ? "Username or password did not match." : "Contributor access is required to open the Content Editor.";
      form.appendChild(note);
      return;
    }
    unlockEditor(user, { initializeDraft: true, focusEditor: true });
  }

  function startResize(event) {
    if (!resizeHandle || window.matchMedia("(max-width: 900px)").matches) return;
    resizeState = {
      startX: event.clientX,
      startWidth: resizeHandle.nextElementSibling?.getBoundingClientRect().width || 430
    };
    layout.classList.add("is-resizing");
    resizeHandle.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function moveResize(event) {
    if (!resizeState) return;
    const delta = resizeState.startX - event.clientX;
    setPostSettingsWidth(resizeState.startWidth + delta);
  }

  function stopResize(event) {
    if (!resizeState) return;
    const width = resizeHandle.nextElementSibling?.getBoundingClientRect().width || resizeState.startWidth;
    localStorage.setItem(POST_SETTINGS_WIDTH_KEY, String(Math.round(width)));
    resizeState = null;
    layout.classList.remove("is-resizing");
    resizeHandle.releasePointerCapture?.(event.pointerId);
  }

  function handleResizeKey(event) {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    const currentWidth = resizeHandle.nextElementSibling?.getBoundingClientRect().width || 430;
    const step = event.shiftKey ? 40 : 16;
    const nextWidth = setPostSettingsWidth(currentWidth + (event.key === "ArrowLeft" ? step : -step));
    localStorage.setItem(POST_SETTINGS_WIDTH_KEY, String(nextWidth));
    event.preventDefault();
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

  function setFontFamily(fontName) {
    if (!fontName) {
      setStatus("Site font selected");
      return;
    }
    exec("fontName", fontName);
  }

  function toggleSpellcheck(button) {
    const enabled = editor.getAttribute("spellcheck") !== "false";
    const nextEnabled = !enabled;
    editor.setAttribute("spellcheck", String(nextEnabled));
    button.textContent = nextEnabled ? "Spellcheck On" : "Spellcheck Off";
    setStatus(nextEnabled ? "Spellcheck on" : "Spellcheck off");
  }

  function renderGuideMarkdown(markdown) {
    const lines = markdown.replace(/\r/g, "").split("\n");
    const html = [];
    let listOpen = false;
    let tableRows = [];

    function closeList() {
      if (!listOpen) return;
      html.push("</ul>");
      listOpen = false;
    }

    function closeTable() {
      if (!tableRows.length) return;
      html.push("<table><tbody>");
      tableRows.forEach(row => {
        const cells = row.split("|").slice(1, -1).map(cell => cell.trim());
        if (!cells.length || cells.every(cell => /^-+$/.test(cell.replace(/\s/g, "")))) return;
        html.push(`<tr>${cells.map(cell => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`);
      });
      html.push("</tbody></table>");
      tableRows = [];
    }

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) {
        closeList();
        closeTable();
        return;
      }
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        closeList();
        tableRows.push(trimmed);
        return;
      }
      closeTable();
      if (trimmed.startsWith("## ")) {
        closeList();
        html.push(`<h3>${escapeHtml(trimmed.slice(3))}</h3>`);
        return;
      }
      if (trimmed.startsWith("# ")) {
        closeList();
        html.push(`<h2>${escapeHtml(trimmed.slice(2))}</h2>`);
        return;
      }
      if (trimmed.startsWith("- ")) {
        if (!listOpen) {
          html.push("<ul>");
          listOpen = true;
        }
        html.push(`<li>${escapeHtml(trimmed.slice(2))}</li>`);
        return;
      }
      closeList();
      html.push(`<p>${escapeHtml(trimmed)}</p>`);
    });
    closeList();
    closeTable();
    return html.join("");
  }

  async function openWritingGuides(fileName = "choosing-a-contribution-type.md") {
    writingGuidesModal.hidden = false;
    await loadWritingGuide(fileName);
  }

  async function loadWritingGuide(fileName) {
    const buttons = writingGuidesModal.querySelectorAll("[data-guide-file]");
    buttons.forEach(button => button.classList.toggle("is-active", button.dataset.guideFile === fileName));
    writingGuideContent.innerHTML = `<p class="access-note">Loading guide...</p>`;
    try {
      const response = await fetch(`contributor-guidelines/${fileName}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Guide unavailable");
      const guideHtml = renderGuideMarkdown(await response.text());
      writingGuideContent.innerHTML = `${renderTemplateInsertControls(fileName)}${guideHtml}`;
    } catch (error) {
      writingGuideContent.innerHTML = `
        <h2>Writing Guides</h2>
        <p>The guide files could not be loaded in this browser preview. Open the contributor-guidelines folder to review the writing standards.</p>
      `;
    }
  }

  function renderTemplateInsertControls(fileName) {
    const templateKey = guideTemplateMap[fileName];
    if (!templateKey || !templateStarters[templateKey]) return "";
    const template = templateStarters[templateKey];
    return `
      <div class="template-insert-panel">
        <h3>${escapeHtml(template.label)}</h3>
        <p>Add the full working template to the editor, then remove or rewrite anything you do not need.</p>
        <button type="button" data-template-insert="${escapeHtml(templateKey)}">Add Template To Editor</button>
      </div>
    `;
  }

  function insertTemplate(key) {
    const template = templateStarters[key];
    if (!template) return;
    if (activeView === "html") setViewMode("compose");
    insertHtml(template.html);
    writingGuidesModal.hidden = true;
    scheduleAutosave();
    setStatus(`${template.label} inserted`);
  }

  function startGuideDrag(event) {
    const handle = event.target.closest("[data-modal-drag-handle]");
    if (!handle) return;
    const card = handle.closest("[data-floating-modal-card]");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    modalDragState = {
      card,
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    };
    card.classList.add("is-dragging");
    card.style.position = "fixed";
    card.style.left = `${rect.left}px`;
    card.style.top = `${rect.top}px`;
    card.style.margin = "0";
    handle.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function moveGuideDrag(event) {
    if (!modalDragState) return;
    const card = modalDragState.card;
    const rect = card.getBoundingClientRect();
    const left = clamp(event.clientX - modalDragState.offsetX, 8, window.innerWidth - rect.width - 8);
    const top = clamp(event.clientY - modalDragState.offsetY, 8, window.innerHeight - rect.height - 8);
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
  }

  function stopGuideDrag(event) {
    if (!modalDragState) return;
    const handle = event.target.closest("[data-modal-drag-handle]");
    handle?.releasePointerCapture?.(modalDragState.pointerId || event.pointerId);
    modalDragState.card?.classList.remove("is-dragging");
    modalDragState = null;
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
        setStatus(error.message || "Upload failed.", true);
        return;
      }
    }

    if (kind !== "image") {
      setStatus("Upload failed. Audio and video files require the media server.", true);
      return;
    }

    if (!window.confirm("The file could not be uploaded. Embed as a local draft image placeholder? It will not be saved permanently.")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const alt = imageAltInput.value.trim() || file.name.replace(/\.[^.]+$/, "");
      const caption = imageCaptionInput.value.trim();
      insertHtml(withMediaControls(`<img src="${escapeHtml(dataUrl)}" alt="${escapeHtml(alt)}">${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}`));
      closeMediaModal();
      setStatus("Image added as local placeholder (not uploaded to server)");
    };
    reader.readAsDataURL(file);
  }

  function buildPreviewDocument() {
    return buildFullArticleDocument("Preview");
  }

  function buildFullArticleDocument(label) {
    const title = titleInput.value.trim() || getCurrentUntitledTitle();
    const subtitle = subtitleInput.value.trim();
    const author = authorInput.value.trim();
    const articleHtml = buildArticleHtml();
    const contributionType = getDisplayContributionType(getContributionType(), articleHtml);
    const source = sourceInput.value.trim();
    const labels = labelsInput.value.trim();
    const destination = getDestinationLabel();
    const meta = [author, contributionType, destination, source, labels].filter(Boolean).join(" · ");

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
<p class="kicker">Research Library · ${escapeHtml(contributionType)}</p>
<h1>${escapeHtml(title)}</h1>
${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ""}
${meta ? `<p class="meta">${escapeHtml(meta)}</p>` : ""}
${articleHtml}
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
    const title = titleInput.value.trim() || getCurrentUntitledTitle();
    const subtitle = subtitleInput.value.trim();
    const href = getSuggestedArticleHref();
    const destination = getDestinationLabel();
    const articleHtml = buildArticleHtml();
    const contributionType = getDisplayContributionType(getContributionType(), articleHtml);
    const cardBadge = contributionType.replace(/\s*\/\s*/g, " / ").split(/\s+/)[0] || "Field";
    return [
      `<!-- Add this card to ${destination}: ${destinationInput.value} -->`,
      `<a class="study-resource-card" href="${escapeHtml(href)}">`,
      `    <div class="study-resource-card-media"><span>${escapeHtml(cardBadge)}</span></div>`,
      `    <div class="study-resource-card-copy">`,
      `    <p class="dashboard-panel-kicker">${escapeHtml(contributionType)}</p>`,
      `    <h3>${escapeHtml(title)}</h3>`,
      subtitle ? `    <p>${escapeHtml(subtitle)}</p>` : "",
      `    <span class="dashboard-panel-cta">Open ${escapeHtml(contributionType)} ›</span>`,
      `    </div>`,
      `</a>`
    ].join("\n");
  }

  async function loadEditorArticles() {
    let articles = [];
    if (window.TPIApi && await window.TPIApi.isAvailable()) {
      try {
        const data = await window.TPIApi.contributorArticles();
        articles = data.articles || [];
      } catch (error) {
        setStatus(error.message || "Could not load content");
        articles = [];
      }
    } else {
      articles = getPublishedArticles().filter(article => {
        if (!currentUser?.displayName) return true;
        return !article.author || article.author === currentUser.displayName;
      });
    }

    const convertedLegacySources = getConvertedLegacySources(articles);
    const legacyArticles = getLegacyEditorArticles(currentUser)
      .filter(article => !convertedLegacySources.has(normalizeLegacyHref(article.href)));
    const seen = new Set();
    return [...articles, ...legacyArticles].filter(article => {
      const key = article.href || article.id || article.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async function openContentLibrary() {
    const existing = document.getElementById("content-library-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "content-library-modal";
    modal.className = "media-modal";
    modal.innerHTML = `
      <div class="media-modal-card content-library-card" data-floating-modal-card role="dialog" aria-modal="true" aria-labelledby="content-library-title">
        <div class="media-modal-header">
          <h3 id="content-library-title">My Content</h3>
          <span class="modal-drag-handle" data-modal-drag-handle>Move</span>
          <button type="button" data-action="content-library-close">Close</button>
        </div>
        <div class="media-modal-body content-library-body">
          <p class="access-note">Open drafts and published articles to edit them here. Legacy pages are a conversion queue: once a legacy page is saved or published from the editor, it leaves the legacy list.</p>
          <div id="content-library-list" class="content-library-list"><p class="access-note">Loading content...</p></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", event => {
      if (event.target === modal) modal.remove();
    });
    await renderContentLibraryList();
  }

  async function openCommentModeration(statusFilter = "pending") {
    const existing = document.getElementById("editor-comment-moderation-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "editor-comment-moderation-modal";
    modal.className = "media-modal";
    modal.innerHTML = `
      <div class="media-modal-card content-library-card" role="dialog" aria-modal="true" aria-labelledby="editor-comment-moderation-title">
        <div class="media-modal-header">
          <h3 id="editor-comment-moderation-title">Comment Moderation</h3>
          <button type="button" data-action="comment-moderation-close">Close</button>
        </div>
        <div class="media-modal-body content-library-body">
          <p class="access-note">Approve or delete public comments before they appear on article pages.</p>
          <div class="moderation-toolbar">
            <button type="button" data-action="comment-moderation-filter" data-moderation-filter="pending">Pending</button>
            <button type="button" data-action="comment-moderation-filter" data-moderation-filter="approved">Approved</button>
          </div>
          <div id="editor-comment-moderation-list" class="comment-moderation-list" data-moderation-status="${escapeHtml(statusFilter)}">
            <p class="access-note">Loading comments...</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    await renderEditorCommentModeration(statusFilter);
  }

  function renderEditorModerationComment(comment, statusFilter) {
    const author = [comment.name || "Anonymous Contributor", comment.authorTitle].filter(Boolean).join(" - ");
    const pageUrl = comment.pageId || "";
    const date = comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "";
    return `
      <article class="moderation-comment">
        <div class="moderation-comment-meta">
          <strong>${escapeHtml(author)}</strong>
          <span>${escapeHtml(date)}</span>
        </div>
        <p>${escapeHtml(comment.text)}</p>
        <a href="${escapeHtml(pageUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(pageUrl || "Article page")}</a>
        <div class="moderation-comment-actions">
          ${statusFilter === "pending" ? `<button type="button" data-action="comment-approve" data-comment-id="${escapeHtml(comment.id)}">Approve</button>` : ""}
          <button type="button" data-action="comment-delete" data-comment-id="${escapeHtml(comment.id)}">Delete</button>
        </div>
      </article>
    `;
  }

  async function renderEditorCommentModeration(statusFilter = "pending") {
    const host = document.getElementById("editor-comment-moderation-list");
    if (!host) return;
    host.dataset.moderationStatus = statusFilter;
    if (!window.TPIApi?.listModerationComments || !await window.TPIApi.isAvailable()) {
      host.innerHTML = `<p class="access-note">Owner/admin Cloudflare login is required for comment moderation.</p>`;
      return;
    }

    try {
      const data = await window.TPIApi.listModerationComments(statusFilter);
      const comments = data.comments || [];
      host.innerHTML = comments.length
        ? comments.map(comment => renderEditorModerationComment(comment, statusFilter)).join("")
        : `<p class="access-note">No ${escapeHtml(statusFilter)} comments.</p>`;
    } catch (error) {
      host.innerHTML = `<p class="access-note access-error">${escapeHtml(error.message || "Could not load comments.")}</p>`;
    }
  }

  async function approveModerationComment(commentId) {
    if (!commentId || !window.TPIApi?.approveComment) return;
    try {
      await window.TPIApi.approveComment(commentId);
      setStatus("Comment approved");
      const statusFilter = document.getElementById("editor-comment-moderation-list")?.dataset.moderationStatus || "pending";
      await renderEditorCommentModeration(statusFilter);
    } catch (error) {
      setStatus(error.message || "Comment approval failed");
    }
  }

  async function deleteModerationComment(commentId) {
    if (!commentId || !window.TPIApi?.deleteComment) return;
    if (!window.confirm("Delete this comment?")) return;
    try {
      await window.TPIApi.deleteComment(commentId);
      setStatus("Comment deleted");
      const statusFilter = document.getElementById("editor-comment-moderation-list")?.dataset.moderationStatus || "pending";
      await renderEditorCommentModeration(statusFilter);
    } catch (error) {
      setStatus(error.message || "Comment delete failed");
    }
  }

  async function renderContentLibraryList() {
    const host = document.getElementById("content-library-list");
    if (!host) return;
    const articles = await loadEditorArticles();
    const drafts = articles.filter(article => article.status !== "published" && article.status !== "legacy-published");
    const published = articles.filter(article => article.status === "published");
    const legacy = articles.filter(article => article.status === "legacy-published");
    host.innerHTML = `
      ${renderContentLibrarySection("Drafts", drafts)}
      ${renderContentLibrarySection("Published", published)}
      ${renderContentLibrarySection("Legacy Conversion Queue", legacy)}
    `;
  }

  function renderContentLibrarySection(title, items) {
    const countLabel = `${items.length} ${items.length === 1 ? "item" : "items"}`;
    const emptyMessages = {
      Drafts: "No drafts yet. Saved drafts will appear here so you can keep working on them.",
      Published: "No published articles yet. Once you publish from the editor, those articles will appear here.",
      "Legacy Conversion Queue": "No remaining legacy pages found for this profile."
    };
    if (!items.length) {
      return `
        <section class="content-library-section">
          <div class="content-library-section-header">
            <h4>${escapeHtml(title)}</h4>
            <span>${escapeHtml(countLabel)}</span>
          </div>
          <div class="content-library-row content-library-empty">
            <p>${escapeHtml(emptyMessages[title] || `No ${title.toLowerCase()} yet.`)}</p>
            <div class="content-library-actions content-library-actions-placeholder" aria-hidden="true"></div>
          </div>
        </section>
      `;
    }
    return `
      <section class="content-library-section">
        <div class="content-library-section-header">
          <h4>${escapeHtml(title)}</h4>
          <span>${escapeHtml(countLabel)}</span>
          ${title === "Legacy Conversion Queue" ? `<button class="content-library-header-button" type="button" data-action="content-import-all-legacy">Convert All Legacy</button>` : ""}
        </div>
        ${items.map(article => `
          <div class="content-library-row" data-article-id="${escapeHtml(article.id)}" ${article.legacy ? `data-legacy="true"` : ""}>
            <div>
              <strong>${escapeHtml(article.title || "Untitled Content")}</strong>
          <span>${escapeHtml([article.legacy ? "Legacy Conversion" : article.contributionType || article.articleType, article.subtitle || article.destination || "Research paper", article.legacy ? article.contributionType : ""].filter(Boolean).join(" · "))}</span>
          ${article.legacy ? `<em class="legacy-archive-note">Needs conversion - open it as-is or convert it into an editable Content Editor article.</em>` : ""}
          ${!article.legacy && getLegacySourceTitle(article.source) ? `<em class="legacy-archive-note">Converted from legacy page: ${escapeHtml(getLegacySourceTitle(article.source))}</em>` : ""}
            </div>
            <div class="content-library-actions">
              <button type="button" data-action="${article.legacy ? "content-import-legacy" : "content-edit"}" data-article-id="${escapeHtml(article.id)}">${article.legacy ? "Convert" : "Edit"}</button>
              ${article.status === "published" ? `<a class="portal-button portal-button-secondary" href="${escapeHtml(article.href || `published-article.html?id=${encodeURIComponent(article.id)}`)}">Open</a>` : ""}
              ${article.legacy ? `<a class="portal-button portal-button-secondary" href="${escapeHtml(article.href)}">Open</a>` : `<button type="button" data-action="content-delete" data-article-id="${escapeHtml(article.id)}">Delete</button>`}
            </div>
          </div>
        `).join("")}
      </section>
    `;
  }

  async function findEditorArticle(articleId) {
    const articles = await loadEditorArticles();
    return articles.find(article => article.id === articleId) || null;
  }

  function loadArticleIntoEditor(article) {
    currentArticleId = article.id;
    titleInput.value = article.title || getCurrentUntitledTitle();
    subtitleInput.value = article.subtitle || "";
    if (article.destination) destinationInput.value = article.destination;
    if (article.contributionType || article.articleType) contributionTypeInput.value = article.contributionType || article.articleType;
    if (article.author) authorInput.value = article.author;
    if (article.source) sourceInput.value = article.source;
    if (article.labels) labelsInput.value = article.labels;
    editor.innerHTML = article.bodyHtml || "<p><br></p>";
    htmlView.value = cleanHtml(editor.innerHTML);
    focusEditorStart();
    setStatus(article.status === "published" ? "Loaded published contribution" : "Loaded draft");
  }

  async function editContentArticle(articleId) {
    const article = await findEditorArticle(articleId);
    if (!article) {
      setStatus("Article could not be found");
      return;
    }
    loadArticleIntoEditor(article);
    document.getElementById("content-library-modal")?.remove();
  }

  async function importLegacyArticle(articleId) {
    const legacyArticle = (await loadEditorArticles()).find(article => article.id === articleId && article.legacy);
    if (!legacyArticle) {
      setStatus("Legacy page could not be found");
      return;
    }
    await importLegacyPage(legacyArticle);
  }

  function getLegacyImportHtml(documentCopy) {
    const fullArticleSections = [
      ...documentCopy.querySelectorAll(".lesson-reading-section"),
      ...documentCopy.querySelectorAll(".paper-author-note")
    ];
    if (fullArticleSections.length) {
      return fullArticleSections.map(section => section.outerHTML).join("\n\n");
    }

    const bodyCopy = documentCopy.body.cloneNode(true);
    bodyCopy.querySelectorAll("#site-header, #site-footer, script, style, link, .lesson-navigation-band").forEach(node => node.remove());
    return bodyCopy.innerHTML || "<p><br></p>";
  }

  async function buildLegacyConversionRecord(legacyArticle) {
    if (!legacyArticle?.href) throw new Error("Legacy page could not be found");
    const response = await fetch(legacyArticle.href, { cache: "no-store" });
    if (!response.ok) throw new Error(`Legacy page unavailable: ${legacyArticle.title || legacyArticle.href}`);
    const html = await response.text();
    const documentCopy = new DOMParser().parseFromString(html, "text/html");
    const importHtml = getLegacyImportHtml(documentCopy);
    const title =
      documentCopy.querySelector('meta[name="pp:title"]')?.getAttribute("content") ||
      documentCopy.querySelector("h2")?.textContent ||
      legacyArticle.title ||
      "";
    const subtitle =
      documentCopy.querySelector('meta[name="pp:subtitle"]')?.getAttribute("content") ||
      legacyArticle.subtitle ||
      "Imported site page";
    const id = getLegacyArticleId(legacyArticle);
    const contributionType = legacyArticle.contributionType || (subtitle.toLowerCase().includes("research paper") ? "Research Paper" : "Field Article");
    const bodyHtml = cleanHtml(importHtml, false);
    return {
      id,
      href: `published-article.html?id=${encodeURIComponent(id)}`,
      title: title.trim() || legacyArticle.title || "Imported Legacy Page",
      subtitle: subtitle.trim(),
      contributionType,
      destination: legacyArticle.destination || destinationInput.value,
      destinationLabel: legacyArticle.destinationLabel || legacyArticle.destination || "",
      author: authorInput.value.trim() || currentUser?.displayName || currentUser?.username || "",
      authorUsername: currentUser?.username || "",
      source: legacyArticle.href,
      labels: "Imported, Legacy Site Page",
      bodyHtml,
      fullHtml: "",
      status: "published",
      updatedAt: new Date().toISOString()
    };
  }

  async function importLegacyPage(legacyArticle) {
    if (!legacyArticle?.href) {
      setStatus("Legacy page could not be found");
      return;
    }

    try {
      const record = await buildLegacyConversionRecord(legacyArticle);

      currentArticleId = null;
      titleInput.value = record.title;
      subtitleInput.value = record.subtitle;
      if (record.destination && [...destinationInput.options].some(option => option.value === record.destination)) {
        destinationInput.value = record.destination;
      }
      contributionTypeInput.value = record.contributionType;
      sourceInput.value = record.source;
      labelsInput.value = record.labels;
      editor.innerHTML = record.bodyHtml;
      htmlView.value = cleanHtml(editor.innerHTML);
      focusEditorStart();
      document.getElementById("content-library-modal")?.remove();
      setStatus("Legacy page converted into the editor. Review it, then Save Draft or Publish Article.");
    } catch (error) {
      setStatus(error.message || "Legacy import failed");
    }
  }

  async function bulkConvertLegacyArticles() {
    try {
      const articles = await loadEditorArticles();
      const legacyArticles = articles.filter(article => article.status === "legacy-published");
      if (!legacyArticles.length) {
        setStatus("No legacy pages remain to convert");
        return;
      }
      if (!window.confirm(`Convert ${legacyArticles.length} legacy page${legacyArticles.length === 1 ? "" : "s"} into published editable articles?`)) return;

      const useCloudflare = Boolean(window.TPIApi && await window.TPIApi.isAvailable());
      const localArticles = useCloudflare ? [] : getPublishedArticles();
      let converted = 0;

      for (const legacyArticle of legacyArticles) {
        setStatus(`Converting ${converted + 1} of ${legacyArticles.length}: ${legacyArticle.title}`);
        const record = await buildLegacyConversionRecord(legacyArticle);
        if (useCloudflare) {
          await window.TPIApi.createArticle({
            ...record,
            articleHtml: record.fullHtml || "",
            status: "published"
          });
        } else {
          const existingIndex = localArticles.findIndex(article => article.id === record.id);
          if (existingIndex >= 0) localArticles[existingIndex] = record;
          else localArticles.push(record);
        }
        converted += 1;
      }

      if (!useCloudflare) savePublishedArticles(localArticles);
      setStatus(`Converted ${converted} legacy page${converted === 1 ? "" : "s"} into published articles`);
      await renderContentLibraryList();
    } catch (error) {
      setStatus(error.message || "Bulk legacy conversion failed");
    }
  }

  async function deleteContentArticle(articleId) {
    if (!window.confirm("Delete this contribution? This removes it from your dashboard and published lists.")) return;
    if (window.TPIApi && await window.TPIApi.isAvailable()) {
      try {
        await window.TPIApi.deleteArticle(articleId);
      } catch (error) {
        setStatus(error.message || "Delete failed");
        return;
      }
    } else {
      savePublishedArticles(getPublishedArticles().filter(article => article.id !== articleId));
    }
    if (currentArticleId === articleId) currentArticleId = null;
    await renderContentLibraryList();
    setStatus("Contribution deleted");
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
    const title = getPublishableTitle();
    if (!title) {
      setStatus("Add a real title before publishing");
      titleInput.focus();
      return;
    }
    publishFilename.value = getSuggestedArticleHref();
    publishDestination.value = destinationInput.value;
    publishSummary.textContent = `"${title}" is ready for ${getDestinationLabel()}.`;
    publishModal.hidden = false;
  }

  function closePublishModal() {
    publishModal.hidden = true;
  }

  function hasStaleId() {
    if (!currentArticleId) return false;
    return currentArticleId.includes("untitled-") &&
      titleInput.value.trim() &&
      !isUntitledTitle(titleInput.value.trim());
  }

  function buildPublishedRecord() {
    const title = titleInput.value.trim() || getCurrentUntitledTitle();
    const id = (currentArticleId && !hasStaleId()) ? currentArticleId : getArticleId();
    const bodyHtml = buildArticleHtml();
    const mediaType = getArticleMediaLabelFromHtml(bodyHtml);
    return {
      id,
      href: `published-article.html?id=${encodeURIComponent(id)}`,
      title,
      subtitle: subtitleInput.value.trim(),
      contributionType: getContributionType(),
      mediaType,
      destination: destinationInput.value,
      destinationLabel: getDestinationLabel(),
      author: authorInput.value.trim(),
      authorUsername: currentUser?.username || "",
      source: sourceInput.value.trim(),
      labels: labelsInput.value.trim(),
      bodyHtml,
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
        const data = await window.TPIApi.createArticle({ ...record, articleHtml: record.fullHtml, status: "draft" });
        currentArticleId = data.article?.id || record.id;
        setStatus(isAutosave ? "Draft autosaved" : "Draft saved");
        await renderContentLibraryList();
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
    currentArticleId = record.id;
    setStatus(isAutosave ? "Draft autosaved locally" : "Draft saved locally");
    await renderContentLibraryList();
  }

  function scheduleAutosave() {
    window.clearTimeout(autosaveTimer);
    autosaveTimer = window.setTimeout(() => {
      saveDraft(true);
    }, 2500);
  }

  async function publishToDestination() {
    if (!getPublishableTitle()) {
      setStatus("Add a real title before publishing");
      titleInput.focus();
      return;
    }

    if (isTpiVideoType()) {
      await publishTpiVideo();
      return;
    }

    const record = { ...buildPublishedRecord(), status: "published" };
    if (window.TPIApi && await window.TPIApi.isAvailable()) {
      try {
        const data = await window.TPIApi.createArticle({
          ...record,
          articleHtml: record.fullHtml,
          status: "published"
        });
        currentArticleId = data.article?.id || record.id;
        publishFilename.value = record.href;
        publishDestination.value = record.destination;
        setStatus("Published to Cloudflare destination");
        await renderContentLibraryList();
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
    currentArticleId = record.id;
    publishFilename.value = record.href;
    publishDestination.value = record.destination;
    setStatus("Published to destination");
    await renderContentLibraryList();
    window.open(record.destination, "_blank");
  }

  async function publishTpiVideo() {
    const videoUrl = videoUrlEditorInput?.value?.trim();
    if (!videoUrl) {
      setStatus("Video URL is required");
      videoUrlEditorInput?.focus();
      return;
    }

    const record = buildVideoRecord();
    try {
      const res = await fetch("/api/tpi-videos", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");
      currentArticleId = data.id;
      publishFilename.value = data.slug;
      publishDestination.value = "tpi-videos.html";
      setStatus("TPI Video published");
      await renderContentLibraryList();
      window.open("tpi-video.html?id=" + encodeURIComponent(data.slug), "_blank");
    } catch (error) {
      setStatus(error.message || "TPI Video publish failed");
    }
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
    currentArticleId = null;
    setDefaultDraftBody();
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
    const button = event.target.closest("button[data-command], button[data-action], button[data-block], button[data-media-action], button[data-template-insert]");
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
    if (action === "content-library") openContentLibrary();
    if (action === "content-library-close") document.getElementById("content-library-modal")?.remove();
    if (action === "comment-moderation") openCommentModeration();
    if (action === "comment-moderation-close") document.getElementById("editor-comment-moderation-modal")?.remove();
    if (action === "comment-moderation-filter") renderEditorCommentModeration(button.dataset.moderationFilter || "pending");
    if (action === "comment-approve") approveModerationComment(button.dataset.commentId);
    if (action === "comment-delete") deleteModerationComment(button.dataset.commentId);
    if (action === "content-edit") editContentArticle(button.dataset.articleId);
    if (action === "content-import-legacy") importLegacyArticle(button.dataset.articleId);
    if (action === "content-import-all-legacy") bulkConvertLegacyArticles();
    if (action === "content-delete") deleteContentArticle(button.dataset.articleId);
    if (action === "writing-guides") openWritingGuides();
    if (action === "writing-guides-close") writingGuidesModal.hidden = true;
    if (action === "spellcheck-toggle") toggleSpellcheck(button);
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

    const templateKey = button.dataset.templateInsert;
    if (templateKey) insertTemplate(templateKey);
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

  fontFamilyInput?.addEventListener("change", event => {
    setFontFamily(event.target.value);
    event.target.value = "";
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
  [
    titleInput,
    subtitleInput,
    destinationInput,
    contributionTypeInput,
    sourceInput,
    authorInput,
    affiliationInput,
    organizationInput,
    correspondenceInput,
    websiteInput,
    labelsInput
  ].forEach(input => {
    input?.addEventListener("input", scheduleAutosave);
    input?.addEventListener("change", scheduleAutosave);
  });
  contributionTypeInput?.addEventListener("change", function() {
    updateVideoFieldsVisibility();
    updateTitleForContributionType();
  });
  [
    videoUrlEditorInput, embedUrlInput, thumbnailUrlInput,
    videoCategoryInput, videoTagsInput, videoSeriesInput,
    videoEpisodeInput, videoDurationInput
  ].forEach(input => {
    input?.addEventListener("input", scheduleAutosave);
    input?.addEventListener("change", scheduleAutosave);
  });
  [videoFeaturedInput, videoLiveInput].forEach(input => {
    input?.addEventListener("change", scheduleAutosave);
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
  writingGuidesModal.addEventListener("click", event => {
    if (event.target === writingGuidesModal) writingGuidesModal.hidden = true;
    const guideButton = event.target.closest("[data-guide-file]");
    if (guideButton) loadWritingGuide(guideButton.dataset.guideFile);
  });
  document.addEventListener("pointerdown", startGuideDrag);
  document.addEventListener("pointermove", moveGuideDrag);
  document.addEventListener("pointerup", stopGuideDrag);
  document.addEventListener("pointercancel", stopGuideDrag);
  resizeHandle?.addEventListener("pointerdown", startResize);
  resizeHandle?.addEventListener("pointermove", moveResize);
  resizeHandle?.addEventListener("pointerup", stopResize);
  resizeHandle?.addEventListener("pointercancel", stopResize);
  resizeHandle?.addEventListener("keydown", handleResizeKey);

  async function initEditorAccess() {
    loadPostSettingsWidth();
    editor.innerHTML = "<p><br></p>";
    htmlView.value = cleanHtml(editor.innerHTML);
    const articleLoaded = await loadArticleForEditing();

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
          }, { applyProfile: !articleLoaded, initializeDraft: !articleLoaded, focusEditor: !articleLoaded });
          return;
        }
      } catch (error) {
        // Fall back to local prototype login below.
      }
    }

    const sessionUser = getSessionUser();
    if (sessionUser) {
      unlockEditor(sessionUser, { applyProfile: !articleLoaded, initializeDraft: !articleLoaded, focusEditor: !articleLoaded });
    } else if (isDevUnlocked()) {
      unlockEditor({
        username: "",
        displayName: "Developer Unlock",
        role: "admin",
        active: true
      }, { applyProfile: !articleLoaded, initializeDraft: !articleLoaded, focusEditor: !articleLoaded });
    } else {
      showAccessGate();
    }
  }

  async function loadArticleForEditing() {
    const params = new URLSearchParams(window.location.search);
    const legacyHref = params.get("legacy");
    if (legacyHref) {
      await importLegacyPage(getLegacyEditorArticles(currentUser).find(article => article.href === legacyHref) || {
        id: `legacy:${legacyHref}`,
        title: "Imported Site Page",
        subtitle: "Legacy Site Page",
        href: legacyHref,
        legacy: true
      });
      return true;
    }

    const articleId = params.get("article");
    if (!articleId) return false;

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

    if (!article) return false;
    loadArticleIntoEditor(article);
    return true;
  }

  initEditorAccess();
})();
