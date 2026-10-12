# Existing Administration Inventory

This inventory distinguishes the current legacy production surface from the
ADMIN-005 isolated preview. `PARTIALLY WORKING` means an authenticated,
server-backed capability exists but the integrated preview or workflow is not
complete. `BLOCKED` means the current source contract does not safely support
the requested UI without new schema/API work.

| Area | Existing UI | Existing API/data | Status | ADMIN-006 integration decision |
| --- | --- | --- | --- | --- |
| Dashboard | `admin-panel.html`, ADMIN-005 preview | `/admin/overview` | PARTIALLY WORKING | Use live metrics and explicit unavailable states |
| Analytics | Legacy charts | `/admin/overview`, `/admin/analytics` | PARTIALLY WORKING | Add range-aware preview charts |
| Activity / audit | Legacy audit panels | `/admin/audit-logs`, `0047` | WORKING | Integrate read-only audit view |
| All Members | Legacy member controls, preview list | `/admin/members` | PARTIALLY WORKING | Add server filters, pagination, sortable columns |
| Member detail | Legacy detail panel | `/admin/members/:username/activity` | PARTIALLY WORKING | Add safe tabs; omit private conversations |
| Roles & permissions | Legacy access/title controls | member access/title endpoints | PARTIALLY WORKING | Show boundary; retain legacy link for mutation review |
| Account restrictions | Block/unblock in legacy UI | block/unblock endpoints | PARTIALLY WORKING | Add confirmed preview action |
| Community posts | Legacy Community Feed operations | `/admin/community/posts` and status mutation | WORKING | Integrate list/status control |
| Comments | Classic moderation panel | `/admin/comments` and approve/delete | WORKING | Integrate pending/approved moderation list |
| Reports | Messenger report count only | `messenger_reports` count in overview | BLOCKED | No unified report list; do not invent one |
| Moderation history | Audit records | `/admin/audit-logs` | PARTIALLY WORKING | Link to audit with scope stated |
| Creator directory | Creator partnership panel | `/admin/creator-partnership` | PARTIALLY WORKING | Preserve existing data-backed view boundary |
| Founding 50 | Legacy allocation view | `/admin/founding-50*`, `0048` | PARTIALLY WORKING | Preserve owner gate; no award activation |
| Creator Studio access | Entitlement table | `/admin/creator-studio/entitlements` | PARTIALLY WORKING | Read-only status; never grant access |
| TPI Videos | Existing publishing tools | Existing video routes | PARTIALLY WORKING | Link/reference until mutation contract is mapped |
| Education Center / content | Existing content tools | article/content routes | PARTIALLY WORKING | No new bulk controls |
| Contributors / invites | Invite panel in `admin-panel.html` | invite handlers | PARTIALLY WORKING | Move conceptually to publishing; retain legacy tool |
| Paranormal Teams | `teams/admin.html` approvals | `/admin/teams*` | WORKING | Link existing protected approval workflow |
| Events | `admin-events.html` | event admin handlers | WORKING | Link existing protected event manager |
| Notifications | Legacy counts/preferences | notification handlers | PARTIALLY WORKING | Informational preview; no fake send controls |
| Platform health | Legacy counts/scraper status | overview/scraper routes | PARTIALLY WORKING | Show source-backed health facts only |
| Security | Worker/API gates | `worker.js`, `requireAdmin` | WORKING | Document and regression-test boundary |
| System settings | `admin-advanced-settings.html` | `/admin/settings` | PARTIALLY WORKING | Link existing settings page |

The legacy global panels identified during review are Contributor Invites,
Team Approvals, and classic Comment Moderation. Their existing destinations
remain protected and are surfaced in the integrated preview as existing-system
links until their full data contracts are intentionally folded into the one
Administration Center.
