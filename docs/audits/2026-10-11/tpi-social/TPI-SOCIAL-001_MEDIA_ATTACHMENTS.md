# Media and Attachments

Community and Messenger uploads use R2 through Worker upload routes. Upload
metadata is recorded in the member library for supported media kinds. Community
attachments use the dedicated community attachment model; Messenger attachment
metadata is stored on the message as sanitized JSON URLs.

The audit confirmed a Messenger-specific authorization defect and repaired it.
Private-library media already checks R2 owner metadata. Community/public media
visibility remains governed by its existing post/attachment model.

Status: **PASS for the repaired local Messenger path; PARTIAL overall**. Actual
R2 production upload/download, quota exhaustion, and physical file workflows
were not performed.
