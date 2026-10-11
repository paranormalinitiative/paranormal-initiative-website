# TPI-VIDEOS-007 Security

No new API endpoint, credential, database table, R2 bucket, or upload path was
introduced.

The watch page preserves server-side `canReadTpiVideo` filtering. The client
does not display an external source link for a viewer who cannot watch the
record. Embed URLs are independently host-allowlisted before iframe rendering;
direct media is independently host- and extension-checked before native media
rendering. Local recording identifiers are classified as private and are not
converted into URLs.

The production `/studio/` gate and public `/live-video` Coming Soon boundary
are unchanged. A production security check must still be repeated after the
runtime deployment.
