# TPI-VIDEOS-009 Security

Preserved `/studio/` access control, `/live-video` Coming Soon, existing authentication, private recording boundaries, and R2 usage. Added link-preview SSRF protections and member authorization around saved items/history. The new migration contains no recording storage, quota, credential, or destructive data operation. Production security verification must confirm anonymous `/studio/` denial, member-only history/save APIs, no stream keys in logs, and no R2 changes.

Known limitation: Worker URL validation cannot prove DNS ownership for arbitrary hostnames; private IP literals, reserved hostnames, redirects, credentials, and nonstandard ports are blocked and remote fetches are bounded.
