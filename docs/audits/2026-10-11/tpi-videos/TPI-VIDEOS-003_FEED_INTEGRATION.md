# TPI-VIDEOS-003 Feed Integration

Authenticated members can use Share to Community from a public authored video watch page. The server creates a normal visible `community_posts` record with a link attachment and invokes the existing community notification path. Members-only, draft, removed, and inaccessible videos are rejected; video media is not copied to R2.

Feed rendering remains owned by the existing Community Feed/member-home implementation. Production share rendering is NOT YET VERIFIED.
