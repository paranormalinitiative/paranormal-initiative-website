# Cloudflare Contributor Portal Setup

Last updated: July 25, 2026

## What Was Added

The static prototype now has a Cloudflare-ready backend:

- Worker entry: `worker.js`
- Cloudflare Pages Function API: `functions/api/[[path]].js`
- D1 schema: `migrations/0001_contributor_portal.sql`
- Contributor profile schema: `migrations/0002_contributor_profiles.sql`
- Front-end API helper: `api-client.js`
- D1 binding in `wrangler.toml`

The API supports:

- owner bootstrap
- contributor login
- invite-code creation
- invite-code checking
- invite-only contributor registration
- published article storage
- article card retrieval by destination
- comments and replies
- contributor profile bio/photo URL
- draft and published article status
- R2-backed profile photo upload endpoint
- R2-backed article media upload endpoint
- private R2 media serving through `/api/media/...`

## Cloudflare Storage Choice

Use **D1 SQLite database** for records:

- contributor accounts
- invite codes
- sessions
- profile text and profile photo URL
- article records
- draft/published status
- comments and replies

Use **R2 object storage** for uploaded files:

- profile photos
- paper images
- uploaded video/audio
- PDFs, DOCX, TXT research attachments
- AI-generated images/audio/video exports
- future media library files

Do not store large videos, audio files, or images directly in D1. D1 should store metadata and URLs/keys only.

Plain language version:

- D1 is the filing index. It remembers who can log in, what invite codes exist, where articles belong, what is a draft, what is published, and what comments exist.
- R2 is the file cabinet. It stores actual uploaded profile photos, paper images, video, audio, PDFs, DOCX, TXT, and AI-generated media.
- D1 stores a link/key pointing to the R2 file.
- Contributors do not need Cloudflare accounts. They only use the website login.

## D1 Steps Already Done / Expected

1. Create a D1 database in Cloudflare named:

```text
tpi_contributor_portal
```

2. Copy the D1 database ID into `wrangler.toml`:

```toml
database_id = "f36b9161-b517-4634-9857-bef4147cefe3"
```

3. Run the migration in Cloudflare/Wrangler:

```bash
wrangler d1 migrations apply tpi_contributor_portal --remote
```

4. Add a secret named:

```text
TPI_OWNER_SETUP_KEY
```

This is a one-time owner setup key. Keep it private.

5. Deploy the site.

6. Enable 10-click dev unlock in your browser and open:

```text
member-login.html
```

7. In Owner Setup, use the one-time setup key to create/update the owner login.

8. Go to `member-login.html`, sign in as owner/admin, then use Member Dashboard admin tools to create invite codes.

## Next Required Cloudflare Step: R2 Uploads

Add an R2 bucket for uploads. Suggested name:

```text
tpi-contributor-media
```

Dashboard path:

1. Open Cloudflare.
2. Go to **Storage & Databases**.
3. Open **R2 Object Storage**.
4. Click **Create bucket**.
5. Name it:

```text
tpi-contributor-media
```

6. Keep the default/private bucket behavior. Contributors do not need Cloudflare accounts.
7. After the bucket exists, update the site code by uncommenting the R2 binding block in `wrangler.toml`.

Then add an R2 binding to `wrangler.toml`, for example:

```toml
[[r2_buckets]]
binding = "TPI_MEDIA"
bucket_name = "tpi-contributor-media"
```

The binding is already present as a commented block in `wrangler.toml`. Do not uncomment it until the bucket exists in Cloudflare, because a missing bound bucket can break deployment.

After the bucket exists, these API endpoints are already wired:

- `POST /api/uploads/profile-photo`
- `POST /api/uploads/article-media`
- `GET /api/media/...`
- optional later: `POST /api/uploads/generated-media`

Upload flow:

1. Contributor chooses a file from the dashboard/editor.
2. Browser sends it to the authenticated API endpoint.
3. Worker verifies the contributor session.
4. Worker saves the file into R2.
5. Worker stores the R2 key/public URL in D1.
6. Browser shows the uploaded photo/media in the profile or article.

Needed frontend changes after R2 is bound:

- Profile Photo now has:
  - Upload from computer
  - Use image URL
- Replace editor data-URL media inserts with R2-backed URLs.
- Add image alt text/caption fields.
- Add video/audio source URL and caption fields.

## Important Security Notes

The local 10-click mode is a browser convenience only. It cannot securely prove identity to Cloudflare by itself.

Real Cloudflare owner/admin access comes from the owner account created with `TPI_OWNER_SETUP_KEY`, then normal member login.

The current API uses D1 and HttpOnly cookies for sessions. Before a final public launch, review password policy, moderation rules, backups, and uploaded-media storage.
