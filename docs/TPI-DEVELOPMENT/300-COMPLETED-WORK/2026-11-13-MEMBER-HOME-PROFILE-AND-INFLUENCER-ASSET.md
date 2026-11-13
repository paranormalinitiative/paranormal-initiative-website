# Member Home Profile and Influencer Asset — 2026-11-13

Status: **SOURCE IMPLEMENTATION AND LOCAL ACCEPTANCE COMPLETE; PRODUCTION RELEASE PENDING; NOT DEPLOYED.**

## Requested behavior

- The public, nonmember home keeps the Paranormal Initiative brand banner.
- Signed-in Home presents the current member's personal banner, avatar, profile
  summary, social counts, Posts/About/Reels/Photos/Events tabs, and Honors &
  Distinctions above member search and the shared Community Feed.
- The member's Posts tab and the right-rail View Profile link open the
  member-specific posts feed. This keeps the shared community feed on Home and
  personal posts on the profile page.
- The right-rail activity card no longer displays the “My Pulse” heading.
- The Influencer medallion is retained as future source artwork only. It is not
  displayed, awarded to members, or treated as an access credential.

## Implementation

The shared member renderer in `member-home.html` now renders the personal
profile summary on signed-in Home and keeps the public brand banner exclusive
to the public home. Profile and community feed loading remain distinct. The
owner-supplied Influencer image is stored at
`assets/influencers/masters/InfluencerMedallionMaster.png`; `.assetsignore`
excludes the source master from published site assets, and the asset README
records its dimensions and source checksum.

## Verification

- `npm run verify:member-profile-feed`: **40/40 passed**, zero remote requests.
- `npm run verify:member-profile-feed-firefox`: **38/38 passed** in Firefox
  Developer Edition against the official local Worker at `127.0.0.1:8787`.
  This included checking the member Home profile, personal banner, Honors wall,
  search and shared feed; clicking View Profile and observing the own-post
  feed; and confirming the public home retains its complete brand banner.
- Acceptance used synthetic local accounts. Owner account/profile data was not
  used or modified.
- The first guarded live attempt activated its candidate, passed anonymous
  smoke 10/10, then rolled back automatically when the Firefox acceptance
  checker timed out despite the login page showing its server-confirmed signed-
  in state. The rollback completed successfully; no new feature version remains
  live.
- A fresh isolated production QA login and full Firefox acceptance against the
  rolled-back site passed 65/65. The checker now accepts the login page's
  server-confirmed authenticated card and waits one second between fallback
  session probes. Local Firefox acceptance passed 65/65 after this adjustment.
- The updated checker has not yet passed a new guarded preflight and live
  release. Production deployment and live acceptance remain pending.

## Scope

No member profile, post, honor, membership, or account data was changed. No
Haunted Location books or standalone Repository books were in scope.
