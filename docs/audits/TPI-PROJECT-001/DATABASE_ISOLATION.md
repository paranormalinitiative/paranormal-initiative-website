# TPI-PROJECT-001 — Database isolation

The TPI Administration API uses the `env.TPI_DB` binding and queries the TPI
`community_posts` table. No cross-project database connection or credential is
present in the inspected TPI route.

The reported record was confirmed with a read-only query against TPI D1:

| Field | Value |
| --- | --- |
| ID | `b4aaecc6-e932-44e3-b71e-a45e1c4c84ce` |
| Title | `The Cauldron and The Craft Website` |
| Status | `deleted` |
| Created | `2026-10-06 20:17:29` |
| Updated | `2026-10-06 20:17:29` |

The query reported zero writes and zero database changes. The record is TPI
content that mentions another project; it was not imported from that project.
It remains preserved.
