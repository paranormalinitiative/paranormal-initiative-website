(function () {
  const fallbackCategories = [
    { id: "evp-itc", title: "EVP / ITC Research", description: "Voice-like material, ACS experimentation, recording methods, review language, and ITC theory." },
    { id: "experiences", title: "Your Paranormal Experiences", description: "Personal accounts, witness questions, unusual events, dreams, apparitions, and meaningful encounters." },
    { id: "investigation", title: "Paranormal Investigation", description: "Case intake, walkthroughs, baselines, documentation, team practice, field safety, and evidence review." },
    { id: "equipment", title: "Equipment & Technology", description: "Audio recorders, cameras, EMF meters, thermal tools, SLS, environmental sensors, and experimental devices." },
    { id: "consciousness", title: "Consciousness & Parapsychology", description: "Human experience, perception, psi research, survival questions, and responsible theoretical discussion." },
    { id: "metaphysics", title: "Spirituality, Metaphysics, OBE & NDE", description: "Spiritual frameworks, metaphysical ideas, out-of-body experiences, near-death experiences, and meaning-making." },
    { id: "science-ai", title: "AI, Quantum Ideas & Time", description: "Artificial intelligence, speculative models, quantum theory discussions, time questions, and technology culture." },
    { id: "locations", title: "Haunted Locations & History", description: "Location claims, historical context, folklore, cemeteries, buildings, legends, and responsible exploration planning." },
    { id: "general", title: "General Discussion", description: "Introductions, community updates, collaboration ideas, research requests, and open paranormal conversation." }
  ];

  const fallbackTopics = [
    { id: "preview-acs", categoryId: "evp-itc", title: "ACS experiments and phonetic review methods", authorName: "TPI Preview", authorTitle: "Discussion Example", postCount: 3, lastPostAt: new Date().toISOString() },
    { id: "preview-experiences", categoryId: "experiences", title: "How should personal experiences be documented?", authorName: "TPI Preview", authorTitle: "Discussion Example", postCount: 2, lastPostAt: new Date(Date.now() - 3600000).toISOString() },
    { id: "preview-equipment", categoryId: "equipment", title: "Best practices for recorder placement", authorName: "TPI Preview", authorTitle: "Discussion Example", postCount: 2, lastPostAt: new Date(Date.now() - 7200000).toISOString() },
    { id: "preview-general", categoryId: "general", title: "Introduce yourself and your research interests", authorName: "TPI Preview", authorTitle: "Discussion Example", postCount: 1, lastPostAt: new Date(Date.now() - 10800000).toISOString() }
  ];

  const fallbackPosts = {
    "preview-acs": [
      { id: "p1", authorName: "TPI Preview", authorTitle: "Discussion Example", body: "This is where members could compare ACS experiment notes, phonetic review methods, contamination controls, and repeatable listening procedures.", createdAt: new Date(Date.now() - 9000000).toISOString() },
      { id: "p2", authorName: "Todd Wayne", authorTitle: "Founder / Director", body: "The important part is keeping the original files, documenting the conditions, and avoiding claims that go beyond what the session actually supports.", createdAt: new Date(Date.now() - 8200000).toISOString() },
      { id: "p3", authorName: "TPI Preview", authorTitle: "Discussion Example", body: "Replies will appear as message bubbles like this, with names, titles, timestamps, and later reactions.", createdAt: new Date(Date.now() - 7600000).toISOString() }
    ],
    "preview-experiences": [
      { id: "p4", authorName: "TPI Preview", authorTitle: "Discussion Example", body: "A personal experience can be valuable without being treated as proof. This topic can help people describe what happened clearly.", createdAt: new Date(Date.now() - 6000000).toISOString() },
      { id: "p5", authorName: "TPI Preview", authorTitle: "Discussion Example", body: "Useful details might include date, location, witnesses, environmental conditions, emotional state, and what ordinary explanations were considered.", createdAt: new Date(Date.now() - 5400000).toISOString() }
    ],
    "preview-equipment": [
      { id: "p6", authorName: "TPI Preview", authorTitle: "Discussion Example", body: "Recorder placement changes what gets captured. Distance, surface vibration, clothing noise, and handling noise all matter.", createdAt: new Date(Date.now() - 5000000).toISOString() },
      { id: "p7", authorName: "TPI Preview", authorTitle: "Discussion Example", body: "This kind of topic gives investigators a place to compare practical field habits without turning it into a formal research paper.", createdAt: new Date(Date.now() - 4700000).toISOString() }
    ],
    "preview-general": [
      { id: "p8", authorName: "TPI Preview", authorTitle: "Discussion Example", body: "This category can be used for introductions, collaboration ideas, questions, and general community discussion.", createdAt: new Date(Date.now() - 4200000).toISOString() }
    ]
  };

  const portal = document.querySelector("[data-discussion-portal]");
  if (!portal) return;

  const state = {
    categories: [],
    topics: [],
    activeTopicId: "",
    activeUser: null,
    previewMode: false
  };

  const topicList = portal.querySelector("[data-topic-list]");
  const messageList = portal.querySelector("[data-message-list]");
  const topicHeader = portal.querySelector("[data-topic-header]");
  const filterInput = portal.querySelector("[data-topic-filter]");
  const replyForm = portal.querySelector("[data-reply-form]");
  const replyBody = portal.querySelector("[data-reply-body]");
  const replyStatus = portal.querySelector("[data-reply-status]");
  const newTopicButton = portal.querySelector("[data-new-topic-button]");
  const newTopicPanel = portal.querySelector("[data-new-topic-panel]");
  const closeTopicPanel = portal.querySelector("[data-close-topic-panel]");
  const newTopicForm = portal.querySelector("[data-new-topic-form]");
  const newTopicCategory = portal.querySelector("[data-new-topic-category]");
  const newTopicTitle = portal.querySelector("[data-new-topic-title]");
  const newTopicBody = portal.querySelector("[data-new-topic-body]");
  const newTopicStatus = portal.querySelector("[data-new-topic-status]");
  const memberAction = portal.querySelector("[data-member-action]");

  init();

  async function init() {
    state.activeUser = await getActiveUser();
    await loadForum();
    renderCategories();
    updateMemberAction();
    updateComposerState();
    if (state.topics[0]) openTopic(state.topics[0].id);
  }

  async function loadForum() {
    try {
      const data = await window.TPIApi.forumIndex();
      state.categories = data.categories || [];
      state.topics = data.topics || [];
      state.previewMode = false;
    } catch (error) {
      state.categories = fallbackCategories;
      state.topics = fallbackTopics;
      state.previewMode = true;
    }
  }

  async function getActiveUser() {
    try {
      const data = await window.TPIApi.me();
      if (data.user) return data.user;
    } catch (error) {
      // Local static previews fall back to the same cached session used by the site header.
    }

    return getCachedMember();
  }

  function getCachedMember() {
    const username = localStorage.getItem("tpiEditorSession");
    if (!username) return null;
    try {
      const users = JSON.parse(localStorage.getItem("tpiEditorContributors") || "[]");
      const user = users.find(item => item.username === username && item.active !== false && !item.developerOwner);
      if (!user) return null;
      return {
        username: user.username,
        displayName: user.displayName || user.display_name || user.username,
        title: user.title,
        role: user.role,
        localOnly: true
      };
    } catch (error) {
      return null;
    }
  }

  function updateMemberAction() {
    if (!memberAction) return;
    if (!state.activeUser) {
      memberAction.href = "member-login.html";
      memberAction.textContent = "Member Login";
      return;
    }
    const firstName = String(state.activeUser.displayName || state.activeUser.username || "Member").trim().split(/\s+/)[0] || "Member";
    memberAction.href = "member-dashboard.html";
    memberAction.textContent = `Dashboard: ${firstName}`;
  }

  function renderCategories() {
    const query = cleanText(filterInput.value).toLowerCase();
    const html = state.categories.map(category => {
      const topics = state.topics.filter(topic => topic.categoryId === category.id)
        .filter(topic => !query || `${topic.title} ${category.title}`.toLowerCase().includes(query));
      if (query && topics.length === 0) return "";
      const topicHtml = topics.length
        ? topics.map(renderTopicButton).join("")
        : `<p class="discussion-no-topics">No topics yet.</p>`;
      return `
        <section class="discussion-category-group">
          <button class="discussion-category-title" type="button" data-category-id="${escapeAttr(category.id)}">
            <span>${escapeHtml(category.title)}</span>
            <strong>${topics.length}</strong>
          </button>
          <div class="discussion-category-topics">${topicHtml}</div>
        </section>
      `;
    }).join("");

    topicList.innerHTML = html || `<p class="discussion-loading">No topics matched your search.</p>`;
    topicList.querySelectorAll("[data-topic-id]").forEach(button => {
      button.addEventListener("click", () => openTopic(button.dataset.topicId));
    });

    newTopicCategory.innerHTML = state.categories.map(category => `<option value="${escapeAttr(category.id)}">${escapeHtml(category.title)}</option>`).join("");
  }

  function renderTopicButton(topic) {
    const activeClass = topic.id === state.activeTopicId ? " is-active" : "";
    return `
      <button class="discussion-topic-button${activeClass}" type="button" data-topic-id="${escapeAttr(topic.id)}">
        <span>${escapeHtml(topic.title)}</span>
        <small>${escapeHtml(topic.authorName || "Community")} · ${formatDate(topic.lastPostAt || topic.updatedAt || topic.createdAt)}</small>
      </button>
    `;
  }

  async function openTopic(topicId) {
    state.activeTopicId = topicId;
    renderCategories();
    const topic = state.topics.find(item => item.id === topicId);
    if (!topic) return;

    topicHeader.innerHTML = `
      <span>${escapeHtml(getCategoryTitle(topic.categoryId))}</span>
      <h3>${escapeHtml(topic.title)}</h3>
      <p>${escapeHtml(topic.authorName || "Community")} · ${escapeHtml(topic.authorTitle || "Member Discussion")} · ${formatDate(topic.lastPostAt || topic.updatedAt || topic.createdAt)}</p>
    `;
    messageList.innerHTML = `<p class="discussion-loading">Opening conversation...</p>`;

    try {
      const data = state.previewMode ? { posts: fallbackPosts[topicId] || [] } : await window.TPIApi.forumTopic(topicId);
      renderMessages(data.posts || []);
    } catch (error) {
      renderMessages(fallbackPosts[topicId] || []);
    }
    updateComposerState();
  }

  function renderMessages(posts) {
    if (!posts.length) {
      messageList.innerHTML = `
        <article class="discussion-empty-state">
          <h3>No replies yet.</h3>
          <p>This topic is ready for its first message.</p>
        </article>
      `;
      return;
    }

    messageList.innerHTML = posts.map((post, index) => {
      const ownPost = state.activeUser && post.authorUsername === state.activeUser.username;
      const sideClass = ownPost || index % 3 === 1 ? " discussion-message-own" : "";
      return `
        <article class="discussion-message${sideClass}">
          <div class="discussion-message-meta">
            <strong>${escapeHtml(post.authorName || "Community Member")}</strong>
            <span>${escapeHtml(post.authorTitle || "Contributor")} · ${formatDate(post.createdAt)}</span>
          </div>
          <div class="discussion-bubble">
            ${escapeHtml(post.body).replace(/\n/g, "<br>")}
          </div>
          <div class="discussion-reactions">
            <button type="button" disabled>Insightful</button>
            <button type="button" disabled>Helpful</button>
            <button type="button" disabled>Follow</button>
          </div>
        </article>
      `;
    }).join("");
    messageList.scrollTop = messageList.scrollHeight;
  }

  function updateComposerState() {
    const canPost = Boolean(state.activeUser && state.activeTopicId && !state.previewMode);
    replyBody.disabled = !canPost;
    replyForm.querySelector("button").disabled = !canPost;
    if (state.previewMode) {
      replyStatus.textContent = "Preview mode: apply the D1 forum migration to enable live posting.";
    } else if (!state.activeUser) {
      replyStatus.textContent = "Sign in as a member or contributor to reply.";
    } else if (!state.activeTopicId) {
      replyStatus.textContent = "Choose a topic to reply.";
    } else {
      replyStatus.textContent = `Signed in as ${state.activeUser.displayName || state.activeUser.username}.`;
    }
  }

  replyForm.addEventListener("submit", async event => {
    event.preventDefault();
    const body = cleanText(replyBody.value);
    if (!body || !state.activeTopicId) return;
    try {
      replyStatus.textContent = "Sending reply...";
      await window.TPIApi.createForumPost(state.activeTopicId, { body });
      replyBody.value = "";
      await openTopic(state.activeTopicId);
      replyStatus.textContent = "Reply posted.";
    } catch (error) {
      replyStatus.textContent = error.message || "Reply could not be posted.";
    }
  });

  newTopicButton.addEventListener("click", () => {
    newTopicPanel.hidden = false;
    newTopicTitle.focus();
    newTopicStatus.textContent = state.previewMode
      ? "Preview mode: apply the D1 forum migration to enable live topic creation."
      : state.activeUser
        ? `Signed in as ${state.activeUser.displayName || state.activeUser.username}.`
        : "Sign in as a member or contributor to create a topic.";
  });

  closeTopicPanel.addEventListener("click", () => {
    newTopicPanel.hidden = true;
  });

  newTopicForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (state.previewMode) {
      newTopicStatus.textContent = "Apply the D1 forum migration before creating live topics.";
      return;
    }
    if (!state.activeUser) {
      newTopicStatus.textContent = "Please sign in before creating a topic.";
      return;
    }
    try {
      newTopicStatus.textContent = "Creating topic...";
      const response = await window.TPIApi.createForumTopic({
        categoryId: newTopicCategory.value,
        title: newTopicTitle.value,
        body: newTopicBody.value
      });
      newTopicTitle.value = "";
      newTopicBody.value = "";
      newTopicPanel.hidden = true;
      await loadForum();
      renderCategories();
      await openTopic(response.topic.id);
    } catch (error) {
      newTopicStatus.textContent = error.message || "Topic could not be created.";
    }
  });

  filterInput.addEventListener("input", renderCategories);

  function getCategoryTitle(categoryId) {
    return state.categories.find(category => category.id === categoryId)?.title || "Community Discussion";
  }

  function formatDate(value) {
    if (!value) return "New";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "New";
    return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }

  function cleanText(value) {
    return String(value || "").trim();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }
})();
