# TPI-ADMIN-002 Defects and Repairs

1. The original admin member endpoint capped results without pagination. It now
   provides bounded server-side pagination and filters while preserving its
   response member list.
2. The original overview had no historical measurements. It now groups real
   D1 timestamps and explicitly reports empty/unavailable states.
3. The original audit endpoint accepted only limit/offset. It now supports
   actor/action/target/date filters and pagination metadata.
4. Founding 50 had only a status message. The additive schema and owner-gated
   allocation path now provide safe infrastructure without activation.
5. The local E2E harness could enter a Wrangler live-reload loop while its
   local D1 was being recreated. The harness now disables live reload for
   deterministic test runs.

No unrelated StudioFlow, storage, database data, or public access defect was
repaired in this batch.
