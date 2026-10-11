# TPI-VIDEOS-009 Performance

Catalog pagination remains capped by the existing API. New refresh polling performs one small page-one request at five-minute intervals, pauses while hidden, cancels in-flight checks, and never rebuilds the page until the member chooses to refresh. No media is proxied or uploaded by the new link-preview path. Long-session CPU, memory, network, and scroll performance remain unverified.
