# TPI-ADMIN-003 Navigation Matrix

Source inventory from `admin-panel.html`; all links are hash views except System Settings, which is `admin-advanced-settings.html`.

| Label | Route/view | Implementation/API | Required role | Result |
|---|---|---|---|---|
| Dashboard | `#overview` | `admin-center.js`, `/api/admin/overview` | owner/admin | SOURCE REVIEWED; BROWSER BLOCKED |
| Analytics | `#analytics` | `/api/admin/overview`, range selector | owner/admin | SOURCE REVIEWED; BROWSER BLOCKED |
| Activity | `#audit` | `/api/admin/audit-logs` | owner/admin | SOURCE REVIEWED; BROWSER BLOCKED |
| All Members | `#members` | existing member controls/API | owner/admin | SOURCE REVIEWED; BROWSER BLOCKED |
| Roles & Permissions | `#members` | existing member controls/API | owner/admin | SOURCE REVIEWED; BROWSER BLOCKED |
| Community Overview | `#community` | `/api/admin/community/posts` | owner/admin | SOURCE REVIEWED; BROWSER BLOCKED |
| Moderation | `#moderation` | existing comments/status controls | owner/admin | SOURCE REVIEWED; BROWSER BLOCKED |
| Creator Directory | `#creators` | `/api/admin/creator-partnership` | owner/admin | SOURCE REVIEWED; BROWSER BLOCKED |
| Founding 50 | `#founding-50` | `/api/admin/founding-50`, partnership register | owner/admin; award owner + gate | SOURCE REVIEWED; BROWSER BLOCKED |
| Creator Studio Access | `#creator-studio` | `/api/admin/creator-studio/entitlements` | owner/admin | SOURCE REVIEWED; BROWSER BLOCKED |
| TPI Videos | `#videos` | existing TPI Videos systems | owner/admin | NOT IMPLEMENTED as a new admin table; existing systems preserved |
| Education & Content | `#content` | existing content/contributor systems | owner/admin | NOT IMPLEMENTED as a new admin table; existing systems preserved |
| Events | `#events` | existing event manager | owner/admin | NOT IMPLEMENTED as a new admin table; existing manager preserved |
| Notifications | `#notifications` | existing notification systems | owner/admin | NOT IMPLEMENTED as a new admin table; existing rules preserved |
| Platform Health | `#system` | D1/scraper status copy | owner/admin | PASS WITH LIMITATIONS; source/API evidence only |
| Security | `#security` | status surface and server gates | owner/admin | PASS WITH LIMITATIONS; production anonymous boundary verified |
| System Settings | `admin-advanced-settings.html` | existing settings API | owner/admin | SOURCE REVIEWED; authenticated browser BLOCKED |

No dead hash destinations were found in source review. The two `#members` labels intentionally point to the same existing member-management surface; this is a product grouping choice, not a second implementation.
