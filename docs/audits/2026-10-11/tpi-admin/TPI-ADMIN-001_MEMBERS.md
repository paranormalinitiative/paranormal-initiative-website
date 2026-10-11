# TPI-ADMIN-001 Members

The existing member search and profile activity controls remain the source of
truth. They use `/api/admin/members` and the protected activity/access/
notification handlers. Search remains bounded to 100 results. Existing account
privacy behavior is preserved; this batch does not add export, deletion, or
bulk account mutation controls.
