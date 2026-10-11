# TPI-VIDEOS-009 Catalog Refresh

The TPI Videos page polls the first catalog item every five minutes only while visible. Requests are cancelable, one refresh loop is maintained, errors are quiet, and a `New videos available` button appears without disrupting browsing. Choosing the indicator refreshes the catalog while preserving the user's scroll position.

Status: IMPLEMENTED locally; browser lifecycle and production timing verification remain pending.
