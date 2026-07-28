# Legacy Conversion SQL Chunks

Use these if Cloudflare D1 Console has trouble with the large all-in-one migration.

Run each `.sql` file in this folder one at a time:

1. Open a chunk file.
2. Copy the full SQL text.
3. Paste it into Cloudflare D1 Console.
4. Click Execute.
5. Move to the next chunk.

Each chunk is safe to rerun because it uses the same stable article id and `ON CONFLICT(id) DO UPDATE`.

After all chunks are run, check the count with:

```sql
SELECT COUNT(*) AS converted_legacy_articles
FROM articles
WHERE source IN (
  'evp-itc-research.html',
  'investigation-development-raising-the-standards.html',
  'education-research-what-is-paranormal-investigation.html',
  'education-research-what-is-ghost-hunting.html',
  'education-research-why-investigate-paranormal.html',
  'education-research-foundational-terminology-paranormal-research.html',
  'education-research-field-safety-permission.html',
  'education-research-observation-note-taking.html',
  'education-research-equipment-what-tools-measure.html',
  'education-research-choosing-researching-location.html',
  'education-research-audio-photo-video-review.html',
  'education-research-investigation-ethics-professional-conduct.html',
  'education-research-professional-documentation-reporting.html',
  'education-research-debunking-natural-explanations.html',
  'education-research-weather-environment-building-science-causes.html',
  'education-research-psychological-triggers-paranormal-experiences.html',
  'education-research-spiritual-religious-demonic-claim-language.html',
  'education-research-types-hauntings-claim-categories.html',
  'education-research-historical-records-local-legends-cemeteries-oral-history.html',
  'education-research-history-hauntings-folklore-psychical-research.html',
  'education-research-motivations-meaning-paranormal-experience.html'
);
```
