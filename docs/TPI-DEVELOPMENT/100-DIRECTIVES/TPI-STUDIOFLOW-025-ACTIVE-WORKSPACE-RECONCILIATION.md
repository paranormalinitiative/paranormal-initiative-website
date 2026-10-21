# TPI-STUDIOFLOW-025 — Active Workspace Reconciliation

## Scope

Local development only. Reconcile Opera's active local StudioFlow broadcast
with the matching server-backed workspace, then remove only the two owner-
authorized test Studios. Production, the room server, the guest gateway, and
browser storage were out of scope.

## Protected and authorized records

| Studio | Workspace ID | Action |
| --- | --- | --- |
| Studio 10 — Crossroads of the Unknown | `43b20614-69da-4d82-af9d-063cace4b6cc` | Preserve |
| Studio 8 — TPI-012 UI Test Studio | `92e5cee1-a1d6-4b0b-b038-0db47f731a4d` | Owner-authorized deletion |
| Studio 9 — TPI Learning — TEST | `feb36634-c704-4898-bfd4-62c52a4d9cc3` | Owner-authorized deletion |

## Required safety boundaries

- No production access, deployment, migration, reset, commit, or push.
- No direct D1 `DELETE` statement.
- No browser storage, cookie, or IndexedDB clearing.
- No Worker, room-server, or guest-gateway restart.
- No recording, livestream, or guest-session interruption.
- Crossroads and its media remain protected.

## Verification plan

1. Read the active Opera Studio and the local development D1 workspace rows.
2. Compare local broadcast IDs, persisted broadcast IDs, titles, and workspace IDs.
3. Correct only the bridge identity-resolution and save-precedence logic.
4. Verify that Crossroads can save through the existing workspace API.
5. Delete only the two exact authorized workspace IDs through StudioFlow's
   supported delete action.
6. Refresh only the existing Opera StudioFlow tab and verify the final list.
7. Run focused reconciliation and StudioFlow regression checks.

## Stop conditions

Stop before deletion if Crossroads cannot resolve to one workspace, if a save
cannot be confirmed, if the deletion action targets a different ID/title, or if
the application would overwrite conflicting state without a verified identity.
