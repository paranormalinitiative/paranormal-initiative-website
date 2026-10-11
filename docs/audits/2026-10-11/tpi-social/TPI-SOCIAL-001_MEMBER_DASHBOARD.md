# Member Dashboard

`member-home.html` is the authenticated social hub. Existing source includes
the composer, community feed, member pulse, active-member/discussion rails,
notifications, profile links, Messenger shell, themes, and content links.

Local API E2E covers the backing feed, pulse counts, notification, directory,
and Messenger permissions. The dedicated Settings UI test source covers 13
settings sections and four viewport sizes, but its browser phase cannot run in
this checkout because `playwright` is not installed.

Status: **PARTIAL**. No dashboard runtime repair was required by this audit.
