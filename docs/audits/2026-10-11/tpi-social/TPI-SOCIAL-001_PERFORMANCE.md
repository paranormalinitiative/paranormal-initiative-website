# Performance

The local API suite completed 211 checks successfully. The Messenger media gate
does a bounded message lookup (100 candidate rows) and exact URL/membership
checks before R2 fetch; denied requests do not fetch the object.

No long-duration browser, production load, R2 throughput, large-feed, or mobile
device performance run was available. Status: **PARTIAL**.
