# TPI-VIDEOS-009 Link Previews

Repaired the existing Community Feed `/api/link-preview` route. The resolver validates HTTP(S) URLs, rejects localhost/private/link-local/metadata targets, rejects credentials and custom ports, follows only bounded safe redirects, applies a timeout and response-size bound, parses bounded Open Graph/title metadata, and returns the original URL unchanged. Public TPI video links use published D1 metadata rather than fetching private pages. Images are returned as safe external references, not proxied through TPI.

The prior production defect was HTTP 500: `handleLinkPreview is not defined`. Focused regression coverage now passes 7/7.
