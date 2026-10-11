# TPI-SOCIAL-003 Defects and Repairs

## Repaired

`member-settings.js` had six Content Ownership cards written as `+card(...)`
after an existing concatenation operator. The extra unary operator converted
each HTML string to `NaN`, obscuring Published Content, Content Visibility,
Connected Platforms, Data Export, and Content Removal. The smallest repair
removed only the unary operators. A focused regression guard was added.

## Not defects / intentionally pending

Data export and account deletion are not implemented and remain honestly
disclosed as unconnected; no unsafe partial workflow was added. General Friends
relationships remain unavailable; existing video follows and Messenger controls
were preserved. The owner-reported Highlights concern was not reproduced in
local API/source checks; browser proof remains blocked by missing Playwright.

No rebuild, duplicate datastore, destructive migration, or production mutation
was performed.

## Release cache correction

The first read-only production asset check showed that the already-published
`member-settings.js?v=2` URL could remain cached even though a cache-busted URL
contained the repair. `member-dashboard.html` now requests `v=3`; no cache was
purged and no unrelated asset was changed.
