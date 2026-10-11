(function (global) {
    "use strict";

    var PROVIDERS = [
        { key: "youtube", label: "YouTube", sourceHosts: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"], embedHosts: ["youtube.com", "www.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"] },
        { key: "rumble", label: "Rumble", sourceHosts: ["rumble.com", "www.rumble.com"], embedHosts: ["rumble.com", "www.rumble.com"] },
        { key: "odysee", label: "Odysee", sourceHosts: ["odysee.com", "www.odysee.com"], embedHosts: [] },
        { key: "dailymotion", label: "Dailymotion", sourceHosts: ["dailymotion.com", "www.dailymotion.com", "dai.ly"], embedHosts: ["geo.dailymotion.com", "dailymotion.com", "www.dailymotion.com"] },
        { key: "internet_archive", label: "Internet Archive", sourceHosts: ["archive.org", "www.archive.org"], embedHosts: [] }
    ];
    var DIRECT_HOSTS = ["paranormalinitiative.com", "www.paranormalinitiative.com", "media.paranormalinitiative.com"];
    var MEDIA_EXTENSIONS = /\.(mp4|m4v|webm|ogv|mov)(?:$|[?#])/i;

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
        });
    }

    function parseHttps(value) {
        var raw = String(value || "").trim();
        if (!raw) return null;
        var url;
        try { url = new URL(raw); } catch (e) { return null; }
        if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash) return null;
        return url;
    }

    function providerForHost(host, field) {
        var normalized = String(host || "").toLowerCase().replace(/\.$/, "");
        return PROVIDERS.find(function (provider) {
            return (field === "embed" ? provider.embedHosts : provider.sourceHosts).indexOf(normalized) !== -1;
        }) || null;
    }

    function hasProviderVideoId(provider, url) {
        var path = url.pathname.replace(/\/+$/, "");
        if (provider.key === "youtube") return Boolean((path.match(/^\/embed\/[^/]+/) || path.match(/^\/shorts\/[^/]+/) || url.searchParams.get("v")));
        if (provider.key === "rumble") return Boolean(path.match(/\/(?:embed\/)?v[a-z0-9]+$/i));
        if (provider.key === "dailymotion") {
            if (url.hostname === "geo.dailymotion.com") {
                return Boolean(path.match(/^\/player\/[^/]+\.html$/i) && url.searchParams.get("video"));
            }
            return Boolean(path.match(/\/(?:video\/|embed\/video\/)[a-z0-9]+$/i));
        }
        return false;
    }

    function isLocalHost(host) {
        var currentHost = global.location && global.location.hostname;
        return (currentHost === "localhost" || currentHost === "127.0.0.1" || currentHost === "::1") &&
            (host === "localhost" || host === "127.0.0.1" || host === "::1");
    }

    function isDirectMediaUrl(value) {
        var url = parseHttps(value);
        if (url) return (DIRECT_HOSTS.indexOf(url.hostname.toLowerCase()) !== -1 || isLocalHost(url.hostname)) && MEDIA_EXTENSIONS.test(url.pathname + url.search);
        if (global.location && (global.location.hostname === "localhost" || global.location.hostname === "127.0.0.1" || global.location.hostname === "::1")) {
            try {
                var localUrl = new URL(String(value || ""), global.location.href);
                return isLocalHost(localUrl.hostname) && MEDIA_EXTENSIONS.test(localUrl.pathname + localUrl.search);
            } catch (e) {}
        }
        return false;
    }

    function safeProviderEmbed(value) {
        var url = parseHttps(value);
        if (!url) return null;
        var provider = providerForHost(url.hostname, "embed");
        if (!provider || !hasProviderVideoId(provider, url)) return null;
        return { url: url.toString(), provider: provider };
    }

    function safeProviderSource(value) {
        var url = parseHttps(value);
        if (!url) return null;
        var provider = providerForHost(url.hostname, "source");
        if (!provider || !url.pathname || url.pathname === "/") return null;
        return { url: url.toString(), provider: provider };
    }

    function resolveSource(video) {
        video = video || {};
        if (video.storageLocation === "browser" || video.storageLocation === "folder" || video.recordingBlobKey || video.fileHandleKey || video.sourceType === "local") {
            return { kind: "LOCAL_PRIVATE_RECORDING", label: "Private local recording" };
        }

        var directCandidates = [];
        if (video.playbackVerified && video.playbackUrl) directCandidates.push({ value: video.playbackUrl, label: "Verified playback" });
        if (video.replayPublished && video.replayUrl) directCandidates.push({ value: video.replayUrl, label: "Published replay" });
        if (video.directMediaUrl) directCandidates.push({ value: video.directMediaUrl, label: "Direct media" });
        for (var i = 0; i < directCandidates.length; i++) {
            if (isDirectMediaUrl(directCandidates[i].value)) {
                return { kind: "DIRECT_BROWSER_MEDIA", url: directCandidates[i].value, label: directCandidates[i].label };
            }
        }

        var embed = safeProviderEmbed(video.embedUrl);
        if (embed) return { kind: "APPROVED_PROVIDER_EMBED", url: embed.url, provider: embed.provider.key, label: embed.provider.label };

        var external = safeProviderSource(video.videoUrl);
        if (external) return {
            kind: "APPROVED_EXTERNAL_WATCH",
            intent: external.provider.key === "odysee" ? "EXTERNAL_BY_DESIGN" : "EXTERNAL_FALLBACK",
            url: external.url,
            provider: external.provider.key,
            label: external.provider.label,
            actionLabel: external.provider.key === "odysee" ? "WATCH ON ODYSEE" : "WATCH ON " + external.provider.label.toUpperCase()
        };

        return { kind: video.videoUrl || video.embedUrl ? "UNSUPPORTED" : "UNAVAILABLE", label: "Playback is not available" };
    }

    function renderPlayer(video, source) {
        var title = escapeHtml(video && video.title || "TPI Video");
        var poster = video && video.thumbnail ? ' poster="' + escapeHtml(video.thumbnail) + '"' : "";
        if (source.kind === "DIRECT_BROWSER_MEDIA") {
            return '<div class="video-player-area video-player-native" data-player-kind="DIRECT_BROWSER_MEDIA">' +
                '<video class="tpi-native-video" controls playsinline preload="metadata"' + poster + ' aria-label="' + title + '">' +
                '<source src="' + escapeHtml(source.url) + '">' +
                'Your browser does not support HTML5 video.</video>' +
                '<p class="video-player-status" role="status" aria-live="polite">Loading video…</p></div>';
        }
        if (source.kind === "APPROVED_PROVIDER_EMBED") {
            return '<div class="video-player-area video-player-embed" data-player-kind="APPROVED_PROVIDER_EMBED">' +
                '<iframe src="' + escapeHtml(source.url) + '" title="' + title + '" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>' +
                '</div>';
        }
        var message = source.kind === "APPROVED_EXTERNAL_WATCH"
            ? source.intent === "EXTERNAL_BY_DESIGN"
                ? "Odysee external viewing is intentional."
                : "This video does not have an approved embedded source."
            : source.kind === "LOCAL_PRIVATE_RECORDING"
                ? "This recording has not been published. It remains private in the creator's local StudioFlow storage."
                : "A playable source has not been published for this video yet.";
        var heading = source.kind === "APPROVED_EXTERNAL_WATCH"
            ? "Watch this video on " + escapeHtml(source.label)
            : source.kind === "LOCAL_PRIVATE_RECORDING"
                ? "Private recording"
                : "Playback unavailable here";
        return '<div class="video-player-area video-player-unavailable" data-player-kind="' + escapeHtml(source.kind) + '">' +
            '<div class="video-player-status-panel" role="status"><strong>' + heading + '</strong><span>' + escapeHtml(message) + '</span></div></div>';
    }

    function wire(root) {
        if (!root) return;
        var video = root.querySelector(".tpi-native-video");
        var status = root.querySelector(".video-player-status");
        if (!video || !status) return;
        video.addEventListener("loadedmetadata", function () { status.textContent = "Ready to play"; });
        video.addEventListener("playing", function () { status.textContent = "Playing"; });
        video.addEventListener("pause", function () { if (!video.ended) status.textContent = "Paused"; });
        video.addEventListener("ended", function () { status.textContent = "Playback ended"; });
        video.addEventListener("error", function () { status.textContent = "This media could not be played in the browser."; });
    }

    global.TPI_VIDEO_PLAYER = {
        resolveSource: resolveSource,
        renderPlayer: renderPlayer,
        wire: wire,
        isDirectMediaUrl: isDirectMediaUrl,
        actionFor: function (video) {
            var source = resolveSource(video);
            return {
                source: source,
                label: source.kind === "APPROVED_EXTERNAL_WATCH" ? source.actionLabel : "WATCH NOW",
                href: source.kind === "APPROVED_EXTERNAL_WATCH" ? source.url : ""
            };
        }
    };
}(window));
