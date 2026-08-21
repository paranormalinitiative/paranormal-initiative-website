const members = [
  { name: "Todd Wayne", initials: "TW", title: "Founder / Director", online: true },
  { name: "Steve Glanz", initials: "SG", title: "Researcher", online: true },
  { name: "Michelle", initials: "M", title: "Investigator", online: true },
  { name: "Roni", initials: "R", title: "Contributor", online: false },
  { name: "Rick Hale", initials: "RH", title: "Historian", online: true }
];

const commentEmojis = ["👍", "❤️", "😂", "🔥", "👻", "📷", "🎧", "🔎"];

let posts = [
  {
    id: "p1",
    type: "evidence",
    author: members[0],
    title: "Canoe Creek field review notes",
    body: "Posting a structured field note from the limestone kiln area. I want the team to look at environmental context before we classify anything as unusual.",
    media: "../join-the-paranormal-initiative.png",
    mediaType: "image",
    createdAt: Date.now() - 1000 * 60 * 12,
    unread: true,
    reactions: { useful: 4, follow: 2 },
    comments: [
      { author: "Steve Glanz", body: "I can compare this against the baseline notes and add a timeline.", media: "", mediaType: "" }
    ]
  },
  {
    id: "p2",
    type: "research",
    author: members[1],
    title: "The Absement Integrator discussion",
    body: "I added a short research note for anyone studying timing-based ITC review. It may help us keep subjective impressions separated from source timing.",
    media: "",
    mediaType: "",
    createdAt: Date.now() - 1000 * 60 * 56,
    unread: true,
    reactions: { useful: 7, follow: 5 },
    comments: [
      { author: "Todd Wayne", body: "This should be tied into the Education Center after review.", media: "", mediaType: "" }
    ]
  },
  {
    id: "p3",
    type: "media",
    author: members[2],
    title: "Photo set from last night",
    body: "Sharing the clean stills before anyone runs enhancement. Original context matters first.",
    media: "../professional-advisory-board-invitation.png",
    mediaType: "image",
    createdAt: Date.now() - 1000 * 60 * 122,
    unread: false,
    reactions: { useful: 3, follow: 1 },
    comments: []
  }
];

const refreshSamples = [
  {
    type: "post",
    author: members[3],
    title: "Question about home investigation notes",
    body: "When documenting a private residence, should we keep room names general until the homeowner approves the final version?",
    media: "",
    mediaType: ""
  },
  {
    type: "chat",
    author: members[1],
    title: "Chat started in General Room",
    body: "I am online for a bit if anyone wants to review the new contributor posts.",
    media: "",
    mediaType: ""
  },
  {
    type: "media",
    author: members[4],
    title: "Reference photo added",
    body: "Added a hallway reference still for equipment placement context before the next field review.",
    media: "../professional-advisory-board-invitation.png",
    mediaType: "image"
  }
];

let chatMessages = [
  { author: "Steve Glanz", body: "This floating chat could become the quick room for live forum discussion.", createdAt: Date.now() - 1000 * 60 * 18 },
  { author: "Todd Wayne", body: "Exactly. Quick chat here, permanent discussion in the feed and forum.", createdAt: Date.now() - 1000 * 60 * 9 }
];

let activeFilter = "all";
let selectedFile = null;

const feedList = document.querySelector("[data-feed-list]");
const onlineList = document.querySelector("[data-online-list]");
const feedCount = document.querySelector("[data-feed-count]");
const composerCard = document.querySelector(".composer-card");
const composerExpanded = document.querySelector("[data-composer-expanded]");
const openComposerButton = document.querySelector("[data-open-composer]");
const closeComposerButton = document.querySelector("[data-close-composer]");
const titleInput = document.querySelector("[data-composer-title]");
const bodyInput = document.querySelector("[data-composer-body]");
const typeInput = document.querySelector("[data-composer-type]");
const fileInput = document.querySelector("[data-composer-file]");
const preview = document.querySelector("[data-composer-preview]");
const refreshButton = document.querySelector("[data-refresh-feed]");
const chatBox = document.querySelector("[data-floating-chat]");
const chatBody = document.querySelector("[data-chat-body]");
const chatForm = document.querySelector("[data-chat-form]");
const chatInput = document.querySelector("[data-chat-input]");
const chatDrag = document.querySelector("[data-chat-drag]");
const toggleChatButton = document.querySelector("[data-toggle-chat]");

renderOnline();
renderFeed();
renderChat();

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(item => item.classList.toggle("is-active", item.dataset.filter === activeFilter));
    renderFeed();
  });
});

openComposerButton.addEventListener("click", openComposer);
closeComposerButton.addEventListener("click", closeComposer);
document.querySelector("[data-create-post]").addEventListener("click", createPost);
refreshButton.addEventListener("click", refreshFeed);
document.querySelector("[data-mark-all-read]").addEventListener("click", () => {
  posts = posts.map(post => ({ ...post, unread: false }));
  renderFeed();
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  selectedFile = null;
  preview.hidden = true;
  preview.innerHTML = "";
  if (!file) return;
  const url = URL.createObjectURL(file);
  selectedFile = { url, type: file.type.startsWith("video/") ? "video" : "image" };
  preview.hidden = false;
  preview.innerHTML = selectedFile.type === "video"
    ? `<video src="${url}" controls></video>`
    : `<img src="${url}" alt="Selected media preview">`;
});

chatForm.addEventListener("submit", event => {
  event.preventDefault();
  const body = chatInput.value.trim();
  if (!body) return;
  chatMessages.push({ author: "Todd Wayne", body, createdAt: Date.now() });
  posts.unshift({
    id: `chat-${Date.now()}`,
    type: "chat",
    author: members[0],
    title: "Chat update from General Room",
    body,
    media: "",
    mediaType: "",
    createdAt: Date.now(),
    unread: true,
    reactions: { useful: 0, follow: 0 },
    comments: []
  });
  chatInput.value = "";
  renderChat();
  renderFeed();
  feedList.scrollTop = 0;
});

toggleChatButton.addEventListener("click", () => {
  chatBox.classList.toggle("is-collapsed");
  toggleChatButton.textContent = chatBox.classList.contains("is-collapsed") ? "Show" : "Hide";
});

let draggingChat = false;
let chatDragOffset = { x: 0, y: 0 };

chatDrag.addEventListener("pointerdown", event => {
  if (event.target.closest("button")) return;
  draggingChat = true;
  chatDrag.setPointerCapture(event.pointerId);
  const rect = chatBox.getBoundingClientRect();
  chatDragOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top };
});

chatDrag.addEventListener("pointermove", event => {
  if (!draggingChat) return;
  const width = chatBox.offsetWidth;
  const height = chatBox.offsetHeight;
  const left = Math.min(Math.max(12, event.clientX - chatDragOffset.x), window.innerWidth - width - 12);
  const top = Math.min(Math.max(12, event.clientY - chatDragOffset.y), window.innerHeight - height - 12);
  chatBox.style.left = `${left}px`;
  chatBox.style.top = `${top}px`;
});

chatDrag.addEventListener("pointerup", event => {
  draggingChat = false;
  chatDrag.releasePointerCapture(event.pointerId);
});

function openComposer() {
  composerExpanded.hidden = false;
  composerCard.classList.add("is-open");
  titleInput.focus();
}

function closeComposer() {
  composerExpanded.hidden = true;
  composerCard.classList.remove("is-open");
}

function createPost() {
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  if (!title || !body) return;
  posts.unshift({
    id: `p${Date.now()}`,
    type: typeInput.value,
    author: members[0],
    title,
    body,
    media: selectedFile?.url || "",
    mediaType: selectedFile?.type || "",
    createdAt: Date.now(),
    unread: true,
    reactions: { useful: 0, follow: 0 },
    comments: []
  });
  titleInput.value = "";
  bodyInput.value = "";
  fileInput.value = "";
  selectedFile = null;
  preview.hidden = true;
  preview.innerHTML = "";
  closeComposer();
  renderFeed();
  feedList.scrollTop = 0;
}

function refreshFeed() {
  const sample = refreshSamples[Math.floor(Math.random() * refreshSamples.length)];
  posts.unshift({
    id: `refresh-${Date.now()}`,
    ...sample,
    createdAt: Date.now(),
    unread: true,
    reactions: { useful: 0, follow: 0 },
    comments: []
  });
  renderFeed();
  feedList.scrollTop = 0;
  refreshButton.textContent = "Feed Updated";
  window.setTimeout(() => {
    refreshButton.textContent = "Refresh Feed";
  }, 1300);
}

function renderOnline() {
  onlineList.innerHTML = members
    .filter(member => member.online)
    .map(member => `
      <div class="online-person">
        <span class="avatar">${member.initials}</span>
        <div>
          <strong>${member.name}</strong>
          <small>${member.title}</small>
        </div>
      </div>
    `).join("");
}

function renderFeed() {
  const visible = posts
    .filter(post => activeFilter === "all" || post.type === activeFilter)
    .sort((a, b) => b.createdAt - a.createdAt);
  feedCount.textContent = `${visible.length} update${visible.length === 1 ? "" : "s"}`;
  feedList.innerHTML = visible.map(renderPost).join("");

  feedList.querySelectorAll("[data-reaction]").forEach(button => {
    button.addEventListener("click", () => {
      const post = posts.find(item => item.id === button.dataset.postId);
      if (!post) return;
      post.reactions[button.dataset.reaction] += 1;
      post.unread = false;
      renderFeed();
    });
  });

  feedList.querySelectorAll("[data-comment-form]").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const input = form.querySelector("input");
      const preview = form.querySelector("[data-comment-preview]");
      const fileInput = form.querySelector("[data-comment-file]");
      const post = posts.find(item => item.id === form.dataset.postId);
      const attachment = form.__commentAttachment || null;
      if (!post || (!input.value.trim() && !attachment)) return;
      post.comments.push({
        author: "Todd Wayne",
        body: input.value.trim(),
        media: attachment?.url || "",
        mediaType: attachment?.type || ""
      });
      post.unread = false;
      input.value = "";
      fileInput.value = "";
      form.__commentAttachment = null;
      preview.hidden = true;
      preview.innerHTML = "";
      renderFeed();
    });
  });

  feedList.querySelectorAll("[data-comment-emoji]").forEach(button => {
    button.addEventListener("click", () => {
      const form = button.closest("[data-comment-form]");
      const input = form.querySelector("input");
      input.value = `${input.value}${button.dataset.commentEmoji}`;
      input.focus();
    });
  });

  feedList.querySelectorAll("[data-comment-file]").forEach(input => {
    input.addEventListener("change", () => {
      const form = input.closest("[data-comment-form]");
      const preview = form.querySelector("[data-comment-preview]");
      const file = input.files?.[0];
      form.__commentAttachment = null;
      preview.hidden = true;
      preview.innerHTML = "";
      if (!file) return;
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith("video/") ? "video" : "image";
      form.__commentAttachment = { url, type };
      preview.hidden = false;
      preview.innerHTML = type === "video"
        ? `<video src="${url}" controls></video>`
        : `<img src="${url}" alt="Comment media preview">`;
    });
  });

  feedList.querySelectorAll("[data-share-post]").forEach(button => {
    button.addEventListener("click", async () => {
      const post = posts.find(item => item.id === button.dataset.postId);
      if (!post) return;
      const shareText = `${post.title} - ${post.body}`;
      if (navigator.share) {
        await navigator.share({ title: post.title, text: shareText }).catch(() => {});
      } else {
        await navigator.clipboard?.writeText(shareText).catch(() => {});
        button.textContent = "Copied";
      }
    });
  });
}

function renderChat() {
  chatBody.innerHTML = chatMessages.slice(-8).map(message => `
    <article class="chat-message">
      <strong>${escapeHtml(message.author)} <span class="post-meta">${formatTime(message.createdAt)}</span></strong>
      <p>${escapeHtml(message.body)}</p>
    </article>
  `).join("");
  chatBody.scrollTop = chatBody.scrollHeight;
}

function renderPost(post) {
  return `
    <article class="post-card${post.unread ? " is-unread" : ""}">
      <header class="post-head">
        <span class="avatar">${post.author.initials}</span>
        <div class="post-author">
          <strong>${post.author.name}</strong>
          <span class="post-meta">${post.author.title} · ${formatTime(post.createdAt)}</span>
        </div>
        <span class="post-type">${formatType(post.type)}</span>
      </header>
      <div class="post-body">
        <h2>${escapeHtml(post.title)}</h2>
        <p>${escapeHtml(post.body)}</p>
        ${renderMedia(post)}
        <div class="post-actions">
          <button class="post-action" type="button" data-reaction="useful" data-post-id="${post.id}">Useful ${post.reactions.useful}</button>
          <button class="post-action" type="button" data-reaction="follow" data-post-id="${post.id}">Follow ${post.reactions.follow}</button>
          <button class="post-action" type="button" data-share-post data-post-id="${post.id}">Share</button>
        </div>
      </div>
      <section class="comments">
        ${post.comments.map(renderComment).join("")}
        <form class="comment-form" data-comment-form data-post-id="${post.id}">
          <input type="text" placeholder="Add a comment">
          <div class="comment-tools" aria-label="Comment tools">
            <div class="comment-emojis">
              ${commentEmojis.map(emoji => `<button class="emoji-button" type="button" data-comment-emoji="${emoji}" aria-label="Add ${emoji}">${emoji}</button>`).join("")}
            </div>
            <label class="comment-upload">
              <input data-comment-file type="file" accept="image/gif,image/*,video/*">
              Upload Photo / GIF
            </label>
          </div>
          <div class="comment-preview" data-comment-preview hidden></div>
          <button class="post-action" type="submit">Reply</button>
        </form>
      </section>
    </article>
  `;
}

function renderComment(comment) {
  return `
    <article class="comment">
      <p><strong>${escapeHtml(comment.author)}:</strong> ${escapeHtml(comment.body)}</p>
      ${renderCommentMedia(comment)}
    </article>
  `;
}

function renderCommentMedia(comment) {
  if (!comment.media) return "";
  return `
    <div class="comment-media">
      ${comment.mediaType === "video"
        ? `<video src="${comment.media}" controls></video>`
        : `<img src="${comment.media}" alt="Comment attachment">`}
    </div>
  `;
}

function renderMedia(post) {
  if (!post.media) return "";
  return `
    <div class="post-media">
      ${post.mediaType === "video"
        ? `<video src="${post.media}" controls></video>`
        : `<img src="${post.media}" alt="${escapeHtml(post.title)}">`}
    </div>
  `;
}

function formatType(type) {
  return {
    post: "Post",
    chat: "Chat",
    evidence: "Investigation",
    media: "Media",
    research: "Research"
  }[type] || "Post";
}

function formatTime(value) {
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
