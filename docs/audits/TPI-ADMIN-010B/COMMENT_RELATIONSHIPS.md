# Comment Relationships

Status: **PARTIAL**.

The current schema links each Community Feed comment to a parent post through
`post_id`. It does not include a parent-comment/reply field. The new detail API
therefore returns the parent post and explicitly reports
`repliesAvailable: false`; it does not flatten or invent reply relationships.

Community comment reactions are returned from the existing polymorphic
`community_reactions` table when the target is the selected comment.

Education Center article comments remain a separate system and are not merged
into this workspace.
