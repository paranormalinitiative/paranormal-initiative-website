# TPI-SOCIAL-003 Feature Inventory

| Area | Current implementation | Status | Evidence / limitation |
|---|---|---|---|
| Community Feed | Posts, categories, attachments, comments, reactions, moderation, notifications | PASS | Local API suite 213/213; browser link-preview evidence carried forward |
| Profiles | Member profile editor, public contributor profile, profile media boundaries | PASS WITH LIMITATIONS | Local API/security coverage; authenticated production mutation not run |
| Relationships | Video channel follows; Messenger blocks/restrictions; Friends UI remains disabled | PARTIAL | Existing implemented boundaries passed; no general Friends graph exists |
| Messenger | Conversations, messages, read state, controls, reports, media authorization | PASS WITH LIMITATIONS | 213/213 and fake-R2 security matrix; physical/external-provider tests not applicable |
| Notifications | Feed, Messenger, article, room, preferences, read transitions | PASS | 213/213 and existing notification regression |
| Settings / personalization | Theme, Highlights/font API, block list, Settings navigation | PASS WITH LIMITATIONS | API PASS; browser phase blocked by missing Playwright |
| Privacy / safety | Server-side auth, blocks, restrictions, reports, moderation | PASS WITH LIMITATIONS | Local authorization PASS; full signed-in production mutation not run |
| Export / deletion | Request copy only; no automated export or account deletion endpoint | NOT IMPLEMENTED | Correctly disclosed in Settings; no destructive operation added |
| Search / navigation | Authenticated site search, member shell, TPI Creator Studio label | PASS | Navigation regression PASS; search is not a social relationship system |
| Accessibility / responsive | Existing responsive CSS and focus behavior | PARTIAL / NOT FULLY VERIFIED | Static/source checks pass; Playwright matrix unavailable |
| Cross-feature media integration | Feed/video links, Creator Studio access boundary, published video social actions | PASS WITH LIMITATIONS | 213/213; authorized production Creator Studio publication remains open |

No duplicate social datastore, Forum restoration, or parallel account system was
introduced.
