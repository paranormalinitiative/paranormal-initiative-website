# TPI-ADMIN-002 Founding 50

The schema models exactly 50 bounded slots through `founding50_allocations`.
Each future award associates a real existing contributor account with a
`founding50` membership and a `creator_studio_lifetime` entitlement. Duplicate
accounts and duplicate slots are database-constrained; concurrent conflicts
return a clear 409 response.

Production award behavior is intentionally disabled unless the explicit
`FOUNDING50_PRODUCTION_ACTIVATION=approved` gate is present. No production slot
was consumed and no account was granted access in this batch. Slots are not
silently recycled.
