# TPI-ADMIN-002 Security

Admin HTML/API routes remain server-gated. `requireAdmin` protects read and
existing admin actions; `requireOwner` protects Founding 50 allocation. The
award handler additionally requires an explicit activation environment gate.
No secrets, session tokens, stream keys, private messages, recordings, or R2
object keys are returned by the new endpoints.

Public `/live-video` and the existing Creator Studio gate remain unchanged.
