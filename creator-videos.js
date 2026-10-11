(function () {
  const $ = id => document.getElementById(id);
  const form = $("creator-video-form");
  const list = $("creator-video-list");
  const status = $("creator-video-status");
  let videos = [];

  function esc(value) { return String(value || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
  async function request(url, options) {
    const response = await fetch(url, { credentials: "same-origin", headers: { "Content-Type": "application/json" }, ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Request failed.");
    return data;
  }
  function say(message) { status.textContent = message || ""; }
  function resetForm() { form.reset(); $("creator-video-slug").value = ""; $("creator-video-category").value = "Applied Paranormal Research and Studies"; $("creator-video-access").value = "members"; }
  function loadInto(video) {
    $("creator-video-slug").value = video.slug || ""; $("creator-video-title").value = video.title || ""; $("creator-video-description").value = video.description || "";
    $("creator-video-url").value = video.videoUrl || ""; $("creator-video-embed").value = video.embedUrl || ""; $("creator-video-thumbnail").value = video.thumbnail || "";
    $("creator-video-category").value = video.category || "Applied Paranormal Research and Studies"; $("creator-video-tags").value = (video.tags || []).join(", "); $("creator-video-access").value = video.viewingAccess || "members";
    window.scrollTo({ top: 0, behavior: "smooth" }); say("Editing " + (video.title || "video"));
  }
  function render() {
    if (!videos.length) { list.innerHTML = '<p class="creator-video-note">No listings yet. Save your first video as a draft.</p>'; return; }
    list.innerHTML = videos.map(video => `<article class="creator-video-row"><div><strong>${esc(video.title)}</strong><small>${esc(video.status)} · ${esc(video.platform || "External source")} · ${esc(video.viewingAccess || "members")}</small></div><div class="creator-video-actions"><button type="button" data-edit="${esc(video.slug)}">Edit</button>${video.status === "published" ? `<button type="button" data-unpublish="${esc(video.slug)}">Unpublish</button>` : video.status !== "removed" ? `<button type="button" data-publish="${esc(video.slug)}">Publish</button>` : ""}${video.status !== "removed" ? `<button type="button" data-remove="${esc(video.slug)}">Remove</button>` : ""}</div></article>`).join("");
  }
  async function load() {
    try {
      const [videoData, channelData] = await Promise.all([request("/api/tpi-videos?mine=true&status=all"), request("/api/tpi-channels/me")]);
      videos = videoData.videos || []; render();
      const channel = channelData.channel;
      $("creator-channel-name").value = channel.displayName || ""; $("creator-channel-slug").value = channel.slug || ""; $("creator-channel-description").value = channel.description || ""; $("creator-channel-artwork").value = channel.artworkUrl || ""; $("creator-channel-visibility").value = channel.visibility || "public";
      $("creator-channel-link").href = "tpi-channel.html?slug=" + encodeURIComponent(channel.slug);
    } catch (error) { list.innerHTML = `<p class="creator-video-note">${esc(error.message)}</p>`; say("Contributor access is required."); }
  }
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const slug = $("creator-video-slug").value;
    const payload = { title: $("creator-video-title").value, description: $("creator-video-description").value, videoUrl: $("creator-video-url").value, embedUrl: $("creator-video-embed").value, thumbnail: $("creator-video-thumbnail").value, category: $("creator-video-category").value, tags: $("creator-video-tags").value, viewingAccess: $("creator-video-access").value };
    try { const data = await request(slug ? "/api/tpi-videos/" + encodeURIComponent(slug) : "/api/tpi-videos", { method: slug ? "PUT" : "POST", body: JSON.stringify(payload) }); say("Draft saved."); resetForm(); await load(); } catch (error) { say(error.message); }
  });
  $("creator-channel-form").addEventListener("submit", async event => { event.preventDefault(); try { await request("/api/tpi-channels/me", { method: "PUT", body: JSON.stringify({ displayName: $("creator-channel-name").value, slug: $("creator-channel-slug").value, description: $("creator-channel-description").value, artworkUrl: $("creator-channel-artwork").value, visibility: $("creator-channel-visibility").value }) }); say("Channel saved."); await load(); } catch (error) { say(error.message); } });
  $("creator-video-clear").addEventListener("click", resetForm);
  list.addEventListener("click", async event => { const button = event.target.closest("button"); if (!button) return; const slug = button.dataset.edit || button.dataset.publish || button.dataset.unpublish || button.dataset.remove; const video = videos.find(item => item.slug === slug); if (button.dataset.edit) return loadInto(video); if (button.dataset.remove && !window.confirm("Remove this listing from TPI? External media will not be deleted.")) return; const action = button.dataset.publish ? "publish" : button.dataset.unpublish ? "unpublish" : "remove"; try { await request("/api/tpi-videos/" + encodeURIComponent(slug) + "/" + action, { method: "POST", body: "{}" }); say(action === "publish" ? "Video published." : action === "unpublish" ? "Video unpublished." : "Video removed."); await load(); } catch (error) { say(error.message); } });
  load();
})();
