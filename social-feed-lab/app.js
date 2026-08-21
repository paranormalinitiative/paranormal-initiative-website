const members = [
  { name: "Todd Wayne", initials: "TW", title: "Founder / Director", online: true },
  { name: "Steve Glanz", initials: "SG", title: "Researcher", online: true },
  { name: "Michelle", initials: "M", title: "Investigator", online: true },
  { name: "Roni", initials: "R", title: "Contributor", online: false },
  { name: "Rick Hale", initials: "RH", title: "Historian", online: true }
];

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
      { author: "Steve Glanz", body: "I can compare this against the baseline notes and add a timeline." }
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
      { author: "Todd Wayne", body: "This should be tied into the Education Center after review." }
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

let activeFilter = "all";
let selectedFile = null;

const feedList = document.querySelector("[data-feed-list]");
const onlineList = document.querySelector("[data-online-list]");
const feedCount = document.querySelector("[data-feed-count]");
const titleInput = document.querySelector("[data-composer-title]");
const bodyInput = document.querySelector("[data-composer-body]");
const typeInput = document.querySelector("[data-composer-type]");
const fileInput = document.querySelector("[data-composer-file]");
const preview = document.querySelector("[data-composer-preview]");

renderOnline();
renderFeed();

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(item => item.classList.toggle("is-active", item.dataset.filter === activeFilter));
    renderFeed();
  });
});

document.querySelector("[data-create-post]").addEventListener("click", createPost);
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
  renderFeed();
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
      const post = posts.find(item => item.id === form.dataset.postId);
      if (!post || !input.value.trim()) return;
      post.comments.push({ author: "Todd Wayne", body: input.value.trim() });
      post.unread = false;
      input.value = "";
      renderFeed();
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
        ${post.comments.map(comment => `<p class="comment"><strong>${escapeHtml(comment.author)}:</strong> ${escapeHtml(comment.body)}</p>`).join("")}
        <form class="comment-form" data-comment-form data-post-id="${post.id}">
          <input type="text" placeholder="Add a comment">
          <button class="post-action" type="submit">Reply</button>
        </form>
      </section>
    </article>
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
