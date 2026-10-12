# Dashboard metrics

The preview reads the existing `/api/admin/overview` response and displays
members total, visible Community posts, published TPI Videos, and approved
teams. The source response also contains other metrics and trends; no missing
source is converted into a guessed value. A failed or unavailable request is
shown as unavailable.

Definitions remain those in the current Worker handler: counts are D1 table
counts and trends are grouped by authoritative `created_at` dates. No new
analytics table or production migration was added.
