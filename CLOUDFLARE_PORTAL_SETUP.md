# Cloudflare Contributor Portal Setup

Last updated: July 26, 2026

## What Was Added

The static prototype now has a Cloudflare-ready backend:

- Worker entry: `worker.js`
- Cloudflare Pages Function API: `functions/api/[[path]].js`
- D1 schema: `migrations/0001_contributor_portal.sql`
- Contributor profile schema: `migrations/0002_contributor_profiles.sql`
- Comment moderation schema: `migrations/0003_comment_moderation.sql`
- Discussion Portal schema: `migrations/0004_discussion_portal.sql`
- Forum read tracking schema: `migrations/0005_forum_read_tracking.sql`
- Account recovery schema: `migrations/0006_account_recovery.sql`
- Education-aligned forum categories: `migrations/0007_discussion_education_categories.sql`
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
- Discussion Portal categories, topics, replies, read tracking, and admin cleanup controls
- account recovery/password reset token foundation

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

## Important D1 Console Rule

When using the Cloudflare dashboard Console, paste the **full SQL contents**, not the migration filename.

Do **not** paste this by itself:

```text
migrations/0007_discussion_education_categories.sql
```

Instead:

1. Open Cloudflare.
2. Go to **Storage & Databases**.
3. Open **D1 SQLite Database**.
4. Open `tpi_contributor_portal`.
5. Click **Console**.
6. Paste the full SQL text from the migration file.
7. Click **Execute**.

If Cloudflare Console rejects a multi-statement file, paste and execute one complete SQL statement at a time.

## Current Required D1 Migration SQL

The latest category migration is `migrations/0007_discussion_education_categories.sql`. Paste this full SQL into the D1 Console:

```sql
INSERT INTO forum_categories (id, title, description, sort_order, active) VALUES
  ('investigation', 'Investigation Science', 'Practice, planning, field methodology, responsible techniques, mentorship, and investigative workflows.', 10, 1),
  ('evidence-science', 'Evidence Science & Analysis', 'Collection, preservation, source files, audio, photo, video review, context, and evidence-based findings.', 20, 1),
  ('equipment', 'Instrumentation & Technology', 'Equipment literacy, sensor behavior, EMF, environmental tools, recording systems, and limitations.', 30, 1),
  ('environmental-research', 'Environmental Research', 'Baseline studies, weather, buildings, sound, atmospheric conditions, human factors, and correlation.', 40, 1),
  ('evp-itc', 'EVP & ITC Research', 'EVP methodology, ITC experimentation, controls, source-material transparency, ACS, phonemes, and allophones.', 50, 1),
  ('consciousness', 'Consciousness & Human Experience', 'NDE research, parapsychology, psi and psionics, consciousness studies, and witness-centered experiences.', 60, 1),
  ('ethics-standards', 'Ethics & Professional Standards', 'Client care, witness respect, confidentiality, responsible disclosure, professional conduct, and accountability.', 70, 1),
  ('reporting-documentation', 'Reporting & Documentation', 'Case reports, careful language, research transparency, evidence presentation, logs, and file preservation.', 80, 1),
  ('community-development', 'Community Development & Publication', 'Contributor resources, mentorship, publication, public outreach, respectful discussion, and ongoing field development.', 90, 1),
  ('technology-development', 'Technology Development', 'App workflows, research software, digital evidence management, platform planning, and responsible tool development.', 100, 1),
  ('science-ai', 'Artificial Intelligence', 'AI literacy, responsible use, source verification, research support, disclosure, safeguards, and investigator judgment.', 110, 1),
  ('locations', 'Historical & Cultural Research', 'Haunted locations, local legends, folklore, public records, archival studies, and historical context.', 120, 1),
  ('experiences', 'Your Paranormal Experiences', 'Personal accounts, witness questions, unusual events, dreams, apparitions, and meaningful encounters.', 130, 1),
  ('metaphysics', 'Spirituality, Metaphysics, OBE & NDE', 'Spiritual frameworks, metaphysical ideas, out-of-body experiences, near-death experiences, and meaning-making.', 140, 1),
  ('general', 'General Discussion', 'Introductions, community updates, collaboration ideas, research requests, and open paranormal conversation.', 150, 1)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order,
  active = excluded.active;
```

## R2 Uploads

R2 is used for uploaded media. The user has confirmed an R2 bucket exists:

```text
tpi-contributor-media
```

If this ever needs to be recreated, use this dashboard path:

1. Open Cloudflare.
2. Go to **Storage & Databases**.
3. Open **R2 Object Storage**.
4. Click **Create bucket**.
5. Name it:

```text
tpi-contributor-media
```

6. Keep the default/private bucket behavior. Contributors do not need Cloudflare accounts.
7. After the bucket exists, update the site code by confirming the R2 binding block in `wrangler.toml`.

Then add an R2 binding to `wrangler.toml`, for example:

```toml
[[r2_buckets]]
binding = "TPI_MEDIA"
bucket_name = "tpi-contributor-media"
```

If the binding is commented in `wrangler.toml`, do not uncomment it until the bucket exists in Cloudflare, because a missing bound bucket can break deployment.

Current live note: the user has confirmed an R2 bucket named `tpi-contributor-media` exists and profile media is being stored under object paths such as `articles/todd-wayne/2026-07-26/...`. Continue using this bucket for profile photos and article media.

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
