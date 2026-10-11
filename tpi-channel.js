(function () {
  const root = document.getElementById("channel-root");
  const esc = value => String(value || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const slug = new URLSearchParams(location.search).get("slug") || "";
  if (!slug) { root.innerHTML = "<p>Channel not found.</p>"; return; }
  fetch("/api/tpi-channels/" + encodeURIComponent(slug), { credentials: "same-origin" }).then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "Channel not found."); return data; }).then(data => {
    const channel = data.channel; document.title = (channel.displayName || "Creator Channel") + " | TPI Videos";
    const owner = channel.owner || {}; const avatar = owner.photoUrl ? `<img src="${esc(owner.photoUrl)}" alt="">` : "";
    const videos = (channel.videos || []).map(video => `<article class="channel-video"><a href="tpi-video.html?id=${encodeURIComponent(video.slug)}">${video.thumbnail ? `<img src="${esc(video.thumbnail)}" alt="${esc(video.title)} thumbnail" loading="lazy">` : ""}<div class="channel-video-copy"><h2>${esc(video.title)}</h2><p>${esc(video.description || video.category || "TPI Video")}</p></div></a></article>`).join("");
    root.innerHTML = `<section class="channel-hero">${avatar}<div><p class="portal-kicker">Creator Channel</p><h1>${esc(channel.displayName)}</h1><p>${esc(channel.description || "")}</p><p>By ${esc(owner.displayName || owner.username || "TPI creator")}</p></div></section><section><h2>Published videos</h2><div class="channel-grid">${videos || "<p>No public videos have been published yet.</p>"}</div></section>`;
  }).catch(error => { root.innerHTML = `<p>${esc(error.message)}</p>`; });
})();
