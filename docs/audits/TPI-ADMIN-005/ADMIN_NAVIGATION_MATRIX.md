# Administration navigation matrix

| Preview item | View | Data/API | Status |
| --- | --- | --- | --- |
| Dashboard | Operations snapshot | `GET /api/admin/overview` | IMPLEMENTED |
| Members | Search, detail, activity, active state | `/api/admin/members*` | IMPLEMENTED against existing contracts |
| Analytics | Five source trend cards | `GET /api/admin/overview?range=30d` | IMPLEMENTED |
| Audit activity | Recent administrative actions | `GET /api/admin/audit-logs` | IMPLEMENTED |
| Legacy Admin Center | Existing production UI | `/admin-panel.html` | PRESERVED |
| System settings | Existing settings tool | `/admin-advanced-settings.html` | PRESERVED/link only |

Future areas remain in the legacy UI until their contracts and acceptance
criteria are mapped: moderation reports, publishing workflows, notification
delivery, system health detail, Creator Partnership allocation review, and
team approvals.
