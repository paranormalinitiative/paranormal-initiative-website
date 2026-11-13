# Member Home Profile and Influencer Asset — 2026-11-13

Status: **SOURCE IMPLEMENTATION COMPLETE; LOCAL ACCEPTANCE PENDING; NOT DEPLOYED.**

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
- Production deployment and live acceptance have not occurred for this change.

## Scope

No member profile, post, honor, membership, or account data was changed. No
Haunted Location books or standalone Repository books were in scope.
