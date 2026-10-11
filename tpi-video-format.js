(function (global) {
    "use strict";

    function finiteNonNegative(value) {
        var number = typeof value === "number" ? value : Number(String(value).trim());
        return Number.isFinite(number) && number >= 0 ? number : null;
    }

    function parseTimestamp(value) {
        var parts = String(value).trim().split(":");
        if (parts.length < 2 || parts.length > 3 || parts.some(function (part) { return !/^\d+$/.test(part); })) return null;
        var numbers = parts.map(Number);
        if (numbers.some(function (part) { return !Number.isFinite(part); })) return null;
        if (parts.length === 2 && numbers[1] >= 60) return null;
        if (parts.length === 3 && (numbers[1] >= 60 || numbers[2] >= 60)) return null;
        return parts.length === 2 ? numbers[0] * 60 + numbers[1] : numbers[0] * 3600 + numbers[1] * 60 + numbers[2];
    }

    function normalizeDuration(value, unit) {
        if (value === null || value === undefined || String(value).trim() === "") return null;
        if (unit === "seconds") {
            var seconds = finiteNonNegative(value);
            return seconds && seconds > 0 ? Math.floor(seconds) : null;
        }
        if (unit === "formatted") return parseTimestamp(value);
        return null;
    }

    function formatDuration(value, unit) {
        var seconds = normalizeDuration(value, unit);
        if (seconds === null) return "";
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var remainder = seconds % 60;
        if (hours > 0) return hours + ":" + String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0");
        return minutes + ":" + String(remainder).padStart(2, "0");
    }

    function durationSeconds(video) {
        if (!video) return null;
        return normalizeDuration(video.durationSeconds, "seconds") || normalizeDuration(video.duration, video.durationUnit);
    }

    function durationBucket(video) {
        var seconds = durationSeconds(video);
        if (seconds === null) return "unknown";
        if (seconds < 60) return "under-1";
        if (seconds < 5 * 60) return "1-5";
        if (seconds < 20 * 60) return "5-20";
        if (seconds <= 60 * 60) return "20-60";
        return "over-60";
    }

    function formatDate(value) {
        if (!value) return "";
        var raw = String(value).trim();
        var date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw + "T00:00:00Z" : raw);
        if (Number.isNaN(date.getTime())) return "";
        return date.toLocaleDateString("en-US", {
            timeZone: "UTC",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    global.TPI_VIDEO_FORMAT = {
        normalizeDuration: normalizeDuration,
        formatDuration: formatDuration,
        durationSeconds: durationSeconds,
        durationBucket: durationBucket,
        formatDate: formatDate
    };
}(window));
