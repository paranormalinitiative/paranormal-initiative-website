(function () {
  const root = document.getElementById("channel-root");
  const esc = value => String(value || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const slug = new URLSearchParams(location.search).get("slug") || "";
  if (!slug) { root.innerHTML = "<p>Channel not found.</p>"; return; }
  fetch("/api/tpi-channels/" + encodeURIComponent(slug), { credentials: "same-origin" }).then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "Channel not found."); return data; }).then(data => {
    const channel = data.channel; document.title = (channel.displayName || "Creator Channel") + " | TPI Videos";
    const owner = channel.owner || {}; const avatar = owner.photoUrl ? `<img src="${esc(owner.photoUrl)}" alt="">` : "";
    const videos = (channel.videos || []).map(video => `<article class="channel-video"><a href="tpi-video.html?id=${encodeURIComponent(video.slug)}">${video.thumbnail ? `<img src="${esc(video.thumbnail)}" alt="${esc(video.title)} thumbnail" loading="lazy">` : ""}<div class="channel-video-copy"><h2>${esc(video.title)}</h2><p>${esc(video.description || video.category || "TPI Video")}</p></div></a></article>`).join("");
    const count = Number(channel.followerCount || 0);
    root.innerHTML = `<section class="channel-hero">${avatar}<div><p class="portal-kicker">Creator Channel</p><h1>${esc(channel.displayName)}</h1><p>${esc(channel.description || "")}</p><p>By ${esc(owner.displayName || owner.username || "TPI creator")}</p><div class="channel-actions"><button class="channel-follow-btn${channel.following ? " active" : ""}" id="channel-follow-btn" type="button">${channel.following ? "Following" : "Follow channel"}</button><span id="channel-follower-count">${count} follower${count === 1 ? "" : "s"}</span><button class="channel-follow-btn" id="channel-share-btn" type="button">Share channel</button><span class="channel-share-status" id="channel-share-status" role="status" aria-live="polite"></span></div></div></section><section><h2>Published videos</h2><div class="channel-grid">${videos || "<p>No public videos have been published yet.</p>"}</div></section>`;
    const followButton = document.getElementById("channel-follow-btn");
    const followerCount = document.getElementById("channel-follower-count");
    const status = document.getElementById("channel-share-status");
    followButton.addEventListener("click", async () => {
      const me = await fetch("/api/auth/me", { credentials: "same-origin" }).then(response => response.ok ? response.json() : { user: null }).catch(() => ({ user: null }));
      if (!me.user) { window.location.href = "member-login.html"; return; }
      const following = followButton.classList.contains("active");
      followButton.disabled = true;
      try {
        const response = await fetch("/api/tpi-channels/" + encodeURIComponent(slug) + "/follow", { method: following ? "DELETE" : "POST", credentials: "same-origin" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not update channel follow state.");
        followButton.classList.toggle("active", result.following);
        followButton.textContent = result.following ? "Following" : "Follow channel";
        const nextCount = Number(result.followerCount || 0);
        followerCount.textContent = `${nextCount} follower${nextCount === 1 ? "" : "s"}`;
      } catch (error) { status.textContent = error.message; } finally { followButton.disabled = false; }
    });
    document.getElementById("channel-share-btn").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(window.location.href); status.textContent = "Channel link copied."; } catch (error) { status.textContent = window.location.href; }
    });
  }).catch(error => { root.innerHTML = `<p>${esc(error.message)}</p>`; });
})();
