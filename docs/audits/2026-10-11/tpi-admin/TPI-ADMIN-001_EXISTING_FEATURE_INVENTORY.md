# TPI-ADMIN-001 Existing Feature Inventory

| Area | Existing source | Current status |
|---|---|---|
| Authentication | `lib/auth.js`, sessions, `contributors` | Preserved; server session required |
| Member administration | `/api/admin/members*`, `admin-panel.html` | Existing controls preserved |
| Roles | owner/admin/contributor/member | Existing roles preserved; owner-only leadership changes remain |
| Community | `community_*` tables and `/api/community/*` | Feed remains the single discussion system |
| Moderation | admin post/comment routes | Existing actions preserved; selected changes now audit |
| Creator Studio | Worker `/studio` gate and StudioFlow integration | Preserved; no entitlement activation |
| TPI Videos | `/api/tpi-videos*`, `tpi-videos.html` | Existing feature preserved |
| Events | `/api/events*`, `admin-events.html` | Existing protected event manager preserved |
| Notifications | `member_notifications` and preferences | Existing delivery rules preserved |
| Scrapers | `/api/admin/scraper-runs` | Existing sanitized monitoring preserved |
| R2 | `TPI_MEDIA` | No new recording storage or bucket behavior |
| Audit logs | No prior general admin table | Added additively in migration 0047 |
| Founding 50 | Prior owner decision only | Status surface added; not activated |
