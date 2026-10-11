# TPI-VIDEOS-004 Creator Ownership

Ownership is tied to the existing authenticated contributor ID and its existing
TPI channel. Draft creation, metadata edits, publication, lifecycle changes,
playback references, replay publication, and unpublication require the owner,
admin, or owner role already recognized by TPI authorization helpers.

Local isolated E2E: PASS. Anonymous and ordinary-member mutation attempts were
rejected; a second member could not read or edit the creator draft.

Creator-owned recording storage remains unchanged. TPI does not accept or store
recording blobs through these endpoints.
