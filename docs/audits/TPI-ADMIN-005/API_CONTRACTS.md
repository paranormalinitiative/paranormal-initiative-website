# API contracts used by the preview

| Purpose | Method/path | Authorization | Preview use |
| --- | --- | --- | --- |
| Dashboard | GET `/api/admin/overview?range=30d` | `requireAdmin` | Metrics and trends |
| Members | GET `/api/admin/members` | `requireAdmin` | Refine `getList` adapter |
| Activity | GET `/api/admin/members/:username/activity` | `requireAdmin` | Detail panel |
| Active state | POST `/api/admin/members/:username/block` or `/unblock` | `requireAdmin` | Detail action |
| Audit | GET `/api/admin/audit-logs?limit=25` | `requireAdmin` | Audit view |

The adapter always uses same-origin credentials. It does not accept a role or
identity from the browser as authority. Unsupported actions throw an explicit
message rather than issuing guessed requests.
