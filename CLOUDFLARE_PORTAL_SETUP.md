# Cloudflare Contributor Portal Setup

Last updated: July 25, 2026

## What Was Added

The static prototype now has a Cloudflare-ready backend:

- Cloudflare Pages Function API: `functions/api/[[path]].js`
- D1 schema: `migrations/0001_contributor_portal.sql`
- Front-end API helper: `api-client.js`
- D1 binding placeholder in `wrangler.toml`

The API supports:

- owner bootstrap
- contributor login
- invite-code creation
- invite-code checking
- invite-only contributor registration
- published article storage
- article card retrieval by destination
- comments and replies

## Cloudflare Storage Choice

Use **D1 SQLite database** for this portal.

Use R2 later for large uploaded files such as images, videos, PDFs, or DOCX files. Do not store large videos directly in D1.

## Required Cloudflare Steps

1. Create a D1 database in Cloudflare named:

```text
tpi_contributor_portal
```

2. Copy the D1 database ID into `wrangler.toml`:

```toml
database_id = "REPLACE_WITH_CLOUDFLARE_D1_DATABASE_ID"
```

3. Run the migration in Cloudflare/Wrangler:

```bash
wrangler d1 migrations apply tpi_contributor_portal
```

4. Add a secret named:

```text
TPI_OWNER_SETUP_KEY
```

This is a one-time owner setup key. Keep it private.

5. Deploy the site.

6. Enable 10-click dev unlock in your browser and open:

```text
contributor-invite.html
```

7. In Owner Tools, use the one-time setup key to create/update the owner login.

8. Go to `member-login.html`, sign in as owner/admin, then use Contributor Invite or the editor contributor tools to create invite codes.

## Important Security Notes

The local 10-click mode is a browser convenience only. It cannot securely prove identity to Cloudflare by itself.

Real Cloudflare owner/admin access comes from the owner account created with `TPI_OWNER_SETUP_KEY`, then normal member login.

The current API uses D1 and HttpOnly cookies for sessions. Before a final public launch, review password policy, moderation rules, backups, and uploaded-media storage.
