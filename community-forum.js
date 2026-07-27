(function () {
  const fallbackCategories = [
    { id: "general", title: "General Discussion", description: "Introductions, community updates, collaboration ideas, research requests, and open paranormal conversation." },
    { id: "investigation", title: "Investigation Science", description: "Practice, planning, field methodology, responsible techniques, mentorship, and investigative workflows." },
    { id: "evidence-science", title: "Evidence Science & Analysis", description: "Collection, preservation, source files, audio, photo, video review, context, and evidence-based findings." },
    { id: "equipment", title: "Instrumentation & Technology", description: "Equipment literacy, sensor behavior, EMF, environmental tools, recording systems, and limitations." },
    { id: "environmental-research", title: "Environmental Research", description: "Baseline studies, weather, buildings, sound, atmospheric conditions, human factors, and correlation." },
    { id: "evp-itc", title: "EVP & ITC Research", description: "EVP methodology, ITC experimentation, controls, source-material transparency, ACS, phonemes, and allophones." },
    { id: "consciousness", title: "Consciousness & Human Experience", description: "NDE research, parapsychology, psi and psionics, consciousness studies, and witness-centered experiences." },
    { id: "ethics-standards", title: "Ethics & Professional Standards", description: "Client care, witness respect, confidentiality, responsible disclosure, professional conduct, and accountability." },
    { id: "reporting-documentation", title: "Reporting & Documentation", description: "Case reports, careful language, research transparency, evidence presentation, logs, and file preservation." },
    { id: "community-development", title: "Community Development & Publication", description: "Contributor resources, mentorship, publication, public outreach, respectful discussion, and ongoing field development." },
    { id: "technology-development", title: "Technology Development", description: "App workflows, research software, digital evidence management, platform planning, and responsible tool development." },
    { id: "science-ai", title: "Artificial Intelligence", description: "AI literacy, responsible use, source verification, research support, disclosure, safeguards, and investigator judgment." },
    { id: "locations", title: "Historical & Cultural Research", description: "Haunted locations, local legends, folklore, public records, archival studies, and historical context." },
    { id: "experiences", title: "Your Paranormal Experiences", description: "Personal accounts, witness questions, unusual events, dreams, apparitions, and meaningful encounters." },
    { id: "metaphysics", title: "Spirituality, Metaphysics, OBE & NDE", description: "Spiritual frameworks, metaphysical ideas, out-of-body experiences, near-death experiences, and meaning-making." },
    { id: "scrying", title: "Scrying, Divination & Visionary Practices", description: "Water, mirror, steam, smoke, flame, and other reflective or symbolic practices used for observation, meditation, intuitive exploration, and anomalous-experience discussion." }
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
    expandedCategories: new Set(),
    selectedAdminUsername: "",
    previewMode: false
  };

  const topicList = portal.querySelector("[data-topic-list]");
  const messageList = portal.querySelector("[data-message-list]");
  const topicHeader = portal.querySelector("[data-topic-header]");
  const filterInput = portal.querySelector("[data-topic-filter]");
  const replyForm = portal.querySelector("[data-reply-form]");
  const replyBody = portal.querySelector("[data-reply-body]");
  const replyAttachments = portal.querySelector("[data-reply-attachments]");
  const replyStatus = portal.querySelector("[data-reply-status]");
  const newTopicButton = portal.querySelector("[data-new-topic-button]");
  const newTopicPanel = portal.querySelector("[data-new-topic-panel]");
  const closeTopicPanel = portal.querySelector("[data-close-topic-panel]");
  const newTopicForm = portal.querySelector("[data-new-topic-form]");
  const newTopicCategory = portal.querySelector("[data-new-topic-category]");
  const newTopicTitle = portal.querySelector("[data-new-topic-title]");
  const newTopicBody = portal.querySelector("[data-new-topic-body]");
  const newTopicAttachments = portal.querySelector("[data-new-topic-attachments]");
  const newTopicStatus = portal.querySelector("[data-new-topic-status]");
  const memberAction = portal.querySelector("[data-member-action]");
  const memberToolsButton = portal.querySelector("[data-member-tools-button]");
  const memberToolsPanel = portal.querySelector("[data-member-tools-panel]");
  const closeMemberTools = portal.querySelector("[data-close-member-tools]");
  const memberSearchForm = portal.querySelector("[data-member-search-form]");
  const memberSearchInput = portal.querySelector("[data-member-search-input]");
  const memberSearchResults = portal.querySelector("[data-member-search-results]");
  const memberPostsPanel = portal.querySelector("[data-member-posts-panel]");
  const memberToolsStatus = portal.querySelector("[data-member-tools-status]");
  const memberResultCount = portal.querySelector("[data-member-result-count]");
  const memberPostCount = portal.querySelector("[data-member-post-count]");

  init();

  async function init() {
    state.activeUser = await getActiveUser();
    await loadForum();
    renderCategories();
    updateMemberAction();
    updateMemberToolsAccess();
    updateComposerState();
    [500, 1500, 3000].forEach(delay => window.setTimeout(refreshActiveUser, delay));
  }

  async function loadForum() {
    try {
      const data = await window.TPIApi.forumIndex();
      state.categories = data.categories || [];
      state.topics = data.topics || [];
      state.previewMode = false;
      applyLocalReadState();
    } catch (error) {
      state.categories = fallbackCategories;
      state.topics = fallbackTopics;
      state.previewMode = true;
      applyLocalReadState();
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
      memberAction.hidden = false;
      return;
    }
    const firstName = String(state.activeUser.displayName || state.activeUser.username || "Member").trim().split(/\s+/)[0] || "Member";
    memberAction.href = "member-dashboard.html";
    memberAction.textContent = `Dashboard: ${firstName}`;
    memberAction.hidden = false;
  }

  async function refreshActiveUser() {
    const latestUser = await getActiveUser();
    if (!latestUser && !readHeaderMemberName()) return;
    state.activeUser = latestUser || {
      username: "",
      displayName: readHeaderMemberName(),
      title: "Member",
      role: "contributor",
      headerOnly: true
    };
    updateMemberAction();
    updateMemberToolsAccess();
    updateComposerState();
  }

  function renderCategories() {
    const query = cleanText(filterInput.value).toLowerCase();
    const html = state.categories.map(category => {
      const topics = state.topics.filter(topic => topic.categoryId === category.id)
        .filter(topic => !query || `${topic.title} ${category.title}`.toLowerCase().includes(query));
      if (query && topics.length === 0) return "";
      const activeInCategory = topics.some(topic => topic.id === state.activeTopicId);
      const isExpanded = Boolean(query || activeInCategory || state.expandedCategories.has(category.id));
      const counts = getCategoryCounts(category, topics);
      const topicHtml = topics.length
        ? topics.map(renderTopicButton).join("")
        : `<p class="discussion-no-topics">No topics yet.</p>`;
      return `
        <section class="discussion-category-group${isExpanded ? " is-expanded" : ""}">
          <button class="discussion-category-title" type="button" data-category-toggle="${escapeAttr(category.id)}" aria-expanded="${isExpanded ? "true" : "false"}">
            <span>${escapeHtml(category.title)}</span>
            <span class="discussion-category-activity" aria-label="${counts.topicCount} topics and ${counts.commentCount} replies">
              ${counts.topicCount > 0 ? renderActivityBadge("topic", counts.topicCount, counts.unreadTopicCount) : ""}
              ${counts.commentCount > 0 ? renderActivityBadge("reply", counts.commentCount, counts.unreadReplyCount) : ""}
            </span>
          </button>
          <div class="discussion-category-topics" ${isExpanded ? "" : "hidden"}>${topicHtml}</div>
        </section>
      `;
    }).join("");

    topicList.innerHTML = html || `<p class="discussion-loading">No topics matched your search.</p>`;
    topicList.querySelectorAll("[data-category-toggle]").forEach(button => {
      button.addEventListener("click", () => toggleCategory(button.dataset.categoryToggle));
    });
    topicList.querySelectorAll("[data-topic-id]").forEach(button => {
      button.addEventListener("click", () => openTopic(button.dataset.topicId));
    });

    newTopicCategory.innerHTML = state.categories.map(category => `<option value="${escapeAttr(category.id)}">${escapeHtml(category.title)}</option>`).join("");
  }

  function renderTopicButton(topic) {
    const activeClass = topic.id === state.activeTopicId ? " is-active" : "";
    const replyCount = Number(topic.replyCount ?? Math.max(0, Number(topic.postCount || 0) - 1));
    return `
      <button class="discussion-topic-button${activeClass}" type="button" data-topic-id="${escapeAttr(topic.id)}">
        <span>
          ${escapeHtml(topic.title)}
          <small class="discussion-topic-icons">
            ${renderActivityBadge("topic", 1, Number(topic.unreadTopicCount || 0))}
            ${replyCount > 0 ? renderActivityBadge("reply", replyCount, Number(topic.unreadReplyCount || 0)) : ""}
          </small>
        </span>
        <small>${escapeHtml(topic.authorName || "Community")} · ${formatDate(topic.lastPostAt || topic.updatedAt || topic.createdAt)}</small>
      </button>
    `;
  }

  async function openTopic(topicId) {
    state.activeTopicId = topicId;
    const topic = state.topics.find(item => item.id === topicId);
    if (!topic) return;
    state.expandedCategories.add(topic.categoryId);
    renderCategories();

    topicHeader.innerHTML = `
      <div class="discussion-chat-heading">
        <div>
          <span>${escapeHtml(getCategoryTitle(topic.categoryId))}</span>
          <h3>${escapeHtml(topic.title)}</h3>
          <p>${escapeHtml(topic.authorName || "Community")} · ${escapeHtml(topic.authorTitle || "Member Discussion")} · ${formatDate(topic.lastPostAt || topic.updatedAt || topic.createdAt)}</p>
        </div>
        ${renderHeaderTopicControls(topic)}
      </div>
    `;
    messageList.innerHTML = `<p class="discussion-loading">Opening conversation...</p>`;

    try {
      const data = state.previewMode ? { posts: fallbackPosts[topicId] || [] } : await window.TPIApi.forumTopic(topicId);
      renderMessages(data.posts || []);
      await markTopicRead(topicId, data.posts || []);
    } catch (error) {
      const posts = fallbackPosts[topicId] || [];
      renderMessages(posts);
      await markTopicRead(topicId, posts);
    }
    updateComposerState();
  }

  function renderHeaderTopicControls(topic) {
    if (!isLeadership(state.activeUser) || state.previewMode) return "";
    return `
      <div class="discussion-topic-admin-controls" aria-label="Topic administration">
        ${renderTopicControlButtons(topic)}
      </div>
    `;
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

    messageList.innerHTML = posts.map(post => {
      return `
        <article class="discussion-message">
          <div class="discussion-message-meta">
            <strong>${renderAuthorLink(post)}</strong>
            <span>${escapeHtml(post.authorTitle || "Contributor")} · ${formatDate(post.createdAt)}</span>
          </div>
          <div class="discussion-bubble">
            ${escapeHtml(post.body).replace(/\n/g, "<br>")}
          </div>
          ${renderAttachments(post.attachments)}
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
    const activeTopic = getActiveTopic();
    const isStopped = activeTopic?.status === "locked";
    const canPost = Boolean(state.activeUser && state.activeTopicId && !state.previewMode && !isStopped);
    replyBody.disabled = !canPost;
    if (replyAttachments) replyAttachments.disabled = !canPost;
    replyForm.querySelector("button").disabled = !canPost;
    if (state.previewMode) {
      replyStatus.textContent = "Preview mode: apply the D1 forum migration to enable live posting.";
    } else if (!state.activeUser) {
      replyStatus.textContent = "Sign in as a member or contributor to reply.";
    } else if (!state.activeTopicId) {
      replyStatus.textContent = "Choose a topic to reply.";
    } else if (isStopped) {
      replyStatus.textContent = "This thread has been stopped by site leadership. It remains readable, but replies are closed.";
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
      const attachments = await uploadForumAttachments(replyAttachments?.files, replyStatus);
      await window.TPIApi.createForumPost(state.activeTopicId, { body, attachments });
      replyBody.value = "";
      if (replyAttachments) replyAttachments.value = "";
      await loadForum();
      renderCategories();
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
      const attachments = await uploadForumAttachments(newTopicAttachments?.files, newTopicStatus);
      const response = await window.TPIApi.createForumTopic({
        categoryId: newTopicCategory.value,
        title: newTopicTitle.value,
        body: newTopicBody.value,
        attachments
      });
      newTopicTitle.value = "";
      newTopicBody.value = "";
      if (newTopicAttachments) newTopicAttachments.value = "";
      newTopicPanel.hidden = true;
      await loadForum();
      renderCategories();
      await openTopic(response.topic.id);
    } catch (error) {
      newTopicStatus.textContent = error.message || "Topic could not be created.";
    }
  });

  filterInput.addEventListener("input", renderCategories);

  memberToolsButton?.addEventListener("click", async () => {
    if (!isLeadership(state.activeUser)) return;
    memberToolsPanel.hidden = false;
    memberSearchInput.focus();
    await loadMemberSearch();
  });

  closeMemberTools?.addEventListener("click", () => {
    memberToolsPanel.hidden = true;
  });

  memberToolsPanel?.addEventListener("click", event => {
    if (event.target === memberToolsPanel) memberToolsPanel.hidden = true;
  });

  memberSearchForm?.addEventListener("submit", async event => {
    event.preventDefault();
    await loadMemberSearch();
  });

  memberSearchInput?.addEventListener("input", debounce(() => loadMemberSearch(), 250));

  memberSearchResults?.addEventListener("click", async event => {
    const action = event.target.closest("[data-member-admin-action]");
    if (!action) return;
    const username = action.dataset.username;
    if (action.dataset.memberAdminAction === "posts") {
      await loadMemberPosts(username);
      return;
    }
    if (action.dataset.memberAdminAction === "block") {
      await setMemberBlocked(username, true);
      return;
    }
    if (action.dataset.memberAdminAction === "unblock") {
      await setMemberBlocked(username, false);
    }
  });

  memberPostsPanel?.addEventListener("click", async event => {
    const openButton = event.target.closest("[data-open-admin-topic]");
    if (openButton) {
      memberToolsPanel.hidden = true;
      await openTopic(openButton.dataset.openAdminTopic);
      return;
    }
    const deleteButton = event.target.closest("[data-delete-admin-post]");
    if (deleteButton) {
      await deleteMemberPost(deleteButton.dataset.deleteAdminPost);
      return;
    }
    const topicAction = event.target.closest("[data-topic-admin-action]");
    if (!topicAction) return;
    await setTopicStatus(topicAction.dataset.topicId, topicAction.dataset.topicAdminAction);
  });

  topicHeader?.addEventListener("click", async event => {
    const topicAction = event.target.closest("[data-topic-admin-action]");
    if (!topicAction) return;
    await setTopicStatus(topicAction.dataset.topicId, topicAction.dataset.topicAdminAction);
  });

  function toggleCategory(categoryId) {
    if (!categoryId) return;
    if (state.expandedCategories.has(categoryId)) {
      state.expandedCategories.delete(categoryId);
    } else {
      state.expandedCategories.add(categoryId);
    }
    renderCategories();
  }

  function getCategoryCounts(category, topics) {
    const topicCount = Number(category.topicCount ?? topics.length) || 0;
    const postCount = Number(category.postCount ?? topics.reduce((total, topic) => total + Number(topic.postCount || 0), 0)) || 0;
    const unreadTopicCount = Number(category.unreadTopicCount ?? topics.reduce((total, topic) => total + Number(topic.unreadTopicCount || 0), 0)) || 0;
    const unreadReplyCount = Number(category.unreadReplyCount ?? topics.reduce((total, topic) => total + Number(topic.unreadReplyCount || 0), 0)) || 0;
    return {
      topicCount,
      commentCount: Math.max(0, Number(category.replyCount ?? (postCount - topicCount)) || 0),
      unreadTopicCount,
      unreadReplyCount
    };
  }

  function renderActivityBadge(type, count, unreadCount) {
    const isReply = type === "reply";
    const unread = Number(unreadCount || 0);
    const label = `${count} ${isReply ? "replies" : "topics"}${unread ? `, ${unread} unread` : ", read"}`;
    return `
      <span class="discussion-activity-badge${isReply ? " is-reply" : " is-topic"}${unread ? " is-unread" : " is-read"}" title="${escapeAttr(label)}">
        <i class="discussion-chat-icon${isReply ? " discussion-chat-icon-reply" : " discussion-chat-icon-topic"}"></i>
        <strong>${Number(count || 0)}</strong>
      </span>
    `;
  }

  async function markTopicRead(topicId, posts) {
    if (!state.activeUser || !topicId) return;
    const topic = state.topics.find(item => item.id === topicId);
    if (!topic) return;
    const postCount = posts.length || Number(topic.postCount || 0);
    topic.postCount = postCount;
    topic.replyCount = Math.max(0, postCount - 1);
    topic.unreadTopicCount = 0;
    topic.unreadReplyCount = 0;
    setLocalTopicRead(topicId, postCount);
    try {
      await window.TPIApi.markForumTopicRead(topicId);
    } catch (error) {
      // Local read state still keeps the preview usable until D1 read tracking is applied.
    }
    renderCategories();
  }

  function setLocalTopicRead(topicId, postCount) {
    try {
      const username = state.activeUser?.username || "header-user";
      const key = `tpiForumReads:${username}`;
      const reads = JSON.parse(localStorage.getItem(key) || "{}");
      reads[topicId] = { seenPostCount: Number(postCount || 0), readAt: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify(reads));
    } catch (error) {
      // Read indicators are helpful, but they should never break topic reading.
    }
  }

  function applyLocalReadState() {
    if (!state.activeUser) return;
    try {
      const username = state.activeUser.username || "header-user";
      const reads = JSON.parse(localStorage.getItem(`tpiForumReads:${username}`) || "{}");
      state.topics = state.topics.map(topic => {
        const read = reads[topic.id];
        if (!read) return topic;
        const postCount = Number(topic.postCount || 0);
        const seenPostCount = Number(read.seenPostCount || 0);
        return {
          ...topic,
          replyCount: Number(topic.replyCount ?? Math.max(0, postCount - 1)),
          unreadTopicCount: 0,
          unreadReplyCount: Math.max(0, postCount - Math.max(1, seenPostCount))
        };
      });
      state.categories = state.categories.map(category => {
        const topics = state.topics.filter(topic => topic.categoryId === category.id);
        return {
          ...category,
          unreadTopicCount: topics.reduce((total, topic) => total + Number(topic.unreadTopicCount || 0), 0),
          unreadReplyCount: topics.reduce((total, topic) => total + Number(topic.unreadReplyCount || 0), 0)
        };
      });
    } catch (error) {
      // Ignore malformed local read cache.
    }
  }

  function readHeaderMemberName() {
    const greeting = document.querySelector(".member-dashboard-link span")?.textContent || "";
    const match = greeting.match(/hello,\s*(.+)/i);
    return match ? match[1].trim() : "";
  }

  function updateMemberToolsAccess() {
    if (!memberToolsButton) return;
    memberToolsButton.hidden = !isLeadership(state.activeUser);
  }

  function isLeadership(user) {
    if (!user) return false;
    const role = String(user.role || "").toLowerCase();
    if (role === "owner" || role === "admin") return true;
    const title = String(user.title || "").toLowerCase().replace(/\s+/g, " ").trim();
    return [
      "founder / director",
      "founder/director",
      "founder director",
      "assistant director",
      "administrator",
      "administration"
    ].includes(title);
  }

  async function loadMemberSearch() {
    if (!memberSearchResults) return;
    const query = cleanText(memberSearchInput.value);
    memberToolsStatus.textContent = "Searching members...";
    try {
      const data = await window.TPIApi.searchMembers(query);
      renderMemberResults(data.members || []);
      memberToolsStatus.textContent = data.members?.length ? "Choose View Posts to trace forum activity." : "No members matched that search.";
    } catch (error) {
      const members = searchLocalMembers(query);
      renderMemberResults(members);
      memberToolsStatus.textContent = members.length
        ? "Static preview mode: local member records are shown here."
        : error.message || "Members could not be loaded.";
    }
  }

  function renderMemberResults(members) {
    memberResultCount.textContent = `${members.length}`;
    if (!members.length) {
      memberSearchResults.innerHTML = `<p class="discussion-admin-empty">No members found.</p>`;
      return;
    }
    memberSearchResults.innerHTML = members.map(member => `
      <article class="discussion-member-card${member.active === false ? " is-blocked" : ""}">
        <div>
          <h5>${escapeHtml(member.displayName || member.username)}</h5>
          <p>${escapeHtml(member.title || "Member")} · ${escapeHtml(formatRole(member.role))}</p>
          <small>@${escapeHtml(member.username)} · ${member.active === false ? "Blocked" : "Active"} · ${Number(member.topicCount || 0)} topics · ${Number(member.postCount || 0)} posts</small>
        </div>
        <div class="discussion-member-actions">
          <button type="button" data-member-admin-action="posts" data-username="${escapeAttr(member.username)}">View Posts</button>
          ${member.active === false
            ? `<button type="button" data-member-admin-action="unblock" data-username="${escapeAttr(member.username)}">Unblock</button>`
            : `<button type="button" data-member-admin-action="block" data-username="${escapeAttr(member.username)}">Block</button>`}
        </div>
      </article>
    `).join("");
  }

  async function loadMemberPosts(username) {
    state.selectedAdminUsername = username;
    memberPostsPanel.innerHTML = `<p class="discussion-admin-empty">Loading forum activity...</p>`;
    memberPostCount.textContent = "0";
    try {
      const data = await window.TPIApi.memberForumPosts(username);
      renderMemberPosts(data.member, data.posts || []);
    } catch (error) {
      renderMemberPosts({ username }, []);
      memberToolsStatus.textContent = error.message || "Forum activity could not be loaded.";
    }
  }

  function renderMemberPosts(member, posts) {
    memberPostCount.textContent = `${posts.length}`;
    if (!posts.length) {
      memberPostsPanel.innerHTML = `<p class="discussion-admin-empty">No forum posts found for ${escapeHtml(member.displayName || member.username)}.</p>`;
      return;
    }
    memberPostsPanel.innerHTML = posts.map(post => `
      <article class="discussion-admin-post">
        <div>
          <h5>${escapeHtml(post.topicTitle || "Forum Topic")}</h5>
          <small>${escapeHtml(post.categoryTitle || "Discussion Portal")} · ${formatDate(post.createdAt)} · Topic: ${escapeHtml(formatTopicStatus(post.topicStatus))} · Post: ${escapeHtml(post.status || "visible")}</small>
        </div>
        <p>${escapeHtml(post.body).replace(/\n/g, "<br>")}</p>
        <div class="discussion-admin-post-actions">
          ${renderOpenTopicButton(post)}
          ${renderTopicControlButtons(post)}
          ${post.status === "deleted" ? "" : `<button type="button" data-delete-admin-post="${escapeAttr(post.id)}">Delete Post</button>`}
        </div>
      </article>
    `).join("");
  }

  function renderOpenTopicButton(post) {
    const status = String(post.topicStatus || "open").toLowerCase();
    if (["inactive", "deleted"].includes(status)) return "";
    return `<button type="button" data-open-admin-topic="${escapeAttr(post.topicId)}">Open Topic</button>`;
  }

  function renderTopicControlButtons(post) {
    const status = String(post.topicStatus || post.status || "open").toLowerCase();
    const topicId = escapeAttr(post.topicId || post.id);
    const lockButton = status === "locked"
      ? `<button type="button" data-topic-admin-action="open" data-topic-id="${topicId}">Reopen Thread</button>`
      : `<button type="button" data-topic-admin-action="locked" data-topic-id="${topicId}">Stop Thread</button>`;
    const inactiveButton = status === "inactive"
      ? `<button type="button" data-topic-admin-action="open" data-topic-id="${topicId}">Make Active</button>`
      : `<button type="button" data-topic-admin-action="inactive" data-topic-id="${topicId}">Mark Inactive</button>`;
    const deleteButton = status === "deleted"
      ? ""
      : `<button type="button" data-topic-admin-action="deleted" data-topic-id="${topicId}">Delete Thread</button>`;
    return `${lockButton}${inactiveButton}${deleteButton}`;
  }

  async function setTopicStatus(topicId, status) {
    if (!topicId || !status) return;
    if (status === "deleted" && !window.confirm("Delete this thread from the public forum?")) return;
    if (status === "inactive" && !window.confirm("Mark this thread inactive and hide it from the public forum list?")) return;
    try {
      memberToolsStatus.textContent = status === "deleted" ? "Deleting thread..." : "Updating thread...";
      await window.TPIApi.setForumTopicStatus(topicId, status);
      if (state.selectedAdminUsername) await loadMemberPosts(state.selectedAdminUsername);
      await loadForum();
      renderCategories();
      updateComposerState();
      if (state.activeTopicId === topicId && ["deleted", "inactive"].includes(status)) {
        state.activeTopicId = "";
        topicHeader.innerHTML = `
          <span>Discussion Portal</span>
          <h3>Select a topic to read the conversation.</h3>
          <p>Topics stay on the left so visitors can move through the community without losing their place.</p>
        `;
        messageList.innerHTML = `
          <article class="discussion-empty-state">
            <h3>Choose a topic from the left.</h3>
            <p>The conversation will open here in a messenger-style thread with member names, titles, timestamps, replies, and reactions.</p>
          </article>
        `;
        updateComposerState();
      }
      memberToolsStatus.textContent = status === "locked"
        ? "Thread stopped. It remains readable, but replies are closed."
        : status === "inactive"
          ? "Thread marked inactive and hidden from the public forum list."
          : status === "deleted"
            ? "Thread deleted from the public forum."
            : "Thread reopened.";
    } catch (error) {
      memberToolsStatus.textContent = error.message || "Thread status could not be changed.";
    }
  }

  async function deleteMemberPost(postId) {
    if (!postId) return;
    try {
      memberToolsStatus.textContent = "Deleting forum post...";
      await window.TPIApi.deleteForumPost(postId);
      if (state.selectedAdminUsername) await loadMemberPosts(state.selectedAdminUsername);
      await loadForum();
      renderCategories();
      memberToolsStatus.textContent = "Forum post deleted.";
    } catch (error) {
      memberToolsStatus.textContent = error.message || "Forum post could not be deleted.";
    }
  }

  async function setMemberBlocked(username, blocked) {
    if (!username) return;
    try {
      memberToolsStatus.textContent = blocked ? "Blocking member..." : "Restoring member...";
      if (blocked) {
        await window.TPIApi.blockMember(username);
      } else {
        await window.TPIApi.unblockMember(username);
      }
      await loadMemberSearch();
      if (state.selectedAdminUsername === username) await loadMemberPosts(username);
      memberToolsStatus.textContent = blocked ? "Member blocked." : "Member restored.";
    } catch (error) {
      if (setLocalMemberBlocked(username, blocked)) {
        await loadMemberSearch();
        memberToolsStatus.textContent = blocked ? "Local preview member blocked." : "Local preview member restored.";
        return;
      }
      memberToolsStatus.textContent = error.message || "Member status could not be changed.";
    }
  }

  function searchLocalMembers(query) {
    const needle = cleanText(query).toLowerCase();
    try {
      const users = JSON.parse(localStorage.getItem("tpiEditorContributors") || "[]")
        .filter(user => !user.developerOwner)
        .map(user => ({
          username: user.username,
          displayName: user.displayName || user.display_name || user.username,
          title: user.title,
          role: user.role || "member",
          active: user.active !== false,
          topicCount: 0,
          postCount: 0
        }));
      if (!needle) return users;
      return users.filter(user => `${user.username} ${user.displayName} ${user.title} ${user.role}`.toLowerCase().includes(needle));
    } catch (error) {
      return [];
    }
  }

  function setLocalMemberBlocked(username, blocked) {
    try {
      const users = JSON.parse(localStorage.getItem("tpiEditorContributors") || "[]");
      const index = users.findIndex(user => user.username === username);
      if (index < 0) return false;
      users[index].active = !blocked;
      localStorage.setItem("tpiEditorContributors", JSON.stringify(users));
      return true;
    } catch (error) {
      return false;
    }
  }

  function formatRole(role) {
    const value = String(role || "member").toLowerCase();
    return {
      owner: "Director",
      admin: "Administration",
      contributor: "Contributor",
      member: "Member"
    }[value] || value;
  }

  function formatTopicStatus(status) {
    return {
      open: "Open",
      locked: "Stopped",
      inactive: "Inactive",
      deleted: "Deleted"
    }[String(status || "open").toLowerCase()] || "Open";
  }

  function validateForumFiles(files) {
    const selected = Array.from(files || []);
    const images = selected.filter(file => file.type.startsWith("image/"));
    const videos = selected.filter(file => file.type.startsWith("video/"));
    const unsupported = selected.filter(file => !file.type.startsWith("image/") && !file.type.startsWith("video/"));
    if (unsupported.length) throw new Error("Forum uploads can only include photos and videos.");
    if (images.length > 10) throw new Error("Please choose 10 images or fewer.");
    if (videos.length > 2) throw new Error("Please choose 2 videos or fewer.");
    return selected;
  }

  async function uploadForumAttachments(files, statusElement) {
    const selected = validateForumFiles(files);
    if (!selected.length) return [];
    if (!window.TPIApi?.uploadForumMedia) throw new Error("Forum media upload is not available yet.");

    const uploaded = [];
    for (let index = 0; index < selected.length; index += 1) {
      const file = selected[index];
      if (statusElement) statusElement.textContent = `Uploading ${index + 1} of ${selected.length}...`;
      const result = await window.TPIApi.uploadForumMedia(file);
      uploaded.push({
        url: result.url,
        key: result.key,
        name: result.name || file.name,
        contentType: result.contentType || file.type,
        mediaType: file.type.startsWith("video/") ? "video" : "image"
      });
    }
    return uploaded;
  }

  function renderAttachments(attachments) {
    const items = Array.isArray(attachments) ? attachments : [];
    if (!items.length) return "";
    return `
      <div class="discussion-attachments">
        ${items.map(item => {
          const url = escapeAttr(item.url || "");
          const name = escapeHtml(item.name || "Forum attachment");
          if (!url) return "";
          if (String(item.mediaType || item.contentType || "").startsWith("video")) {
            return `<figure class="discussion-attachment discussion-attachment-video"><video src="${url}" controls preload="metadata"></video><figcaption>${name}</figcaption></figure>`;
          }
          return `<figure class="discussion-attachment discussion-attachment-image"><img src="${url}" alt="${name}" loading="lazy"><figcaption>${name}</figcaption></figure>`;
        }).join("")}
      </div>
    `;
  }

  function debounce(fn, wait) {
    let timeout;
    return function (...args) {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function renderAuthorLink(post) {
    const name = escapeHtml(post.authorName || "Community Member");
    if (!post.authorUsername) return name;
    return `<a class="discussion-author-link" href="contributor-profile.html?username=${encodeURIComponent(post.authorUsername)}">${name}</a>`;
  }

  function getCategoryTitle(categoryId) {
    return state.categories.find(category => category.id === categoryId)?.title || "Community Discussion";
  }

  function getActiveTopic() {
    return state.topics.find(item => item.id === state.activeTopicId) || null;
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
