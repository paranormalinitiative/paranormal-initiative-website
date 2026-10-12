# Browser acceptance

Authenticated owner/admin browser acceptance is pending because no already
authorized session was available in this run. The protected preview route can
be deployed and reviewed by the owner. Anonymous access must continue to show
the server gate; direct asset access must not bypass it.

Anonymous production verification completed after the protected-preview
deployment: `/admin-center-preview/` and a direct generated JS asset both
returned HTTP 403 with the restricted gate behavior. This verifies access
control, not authenticated application acceptance.

Recommended owner pass: open `/admin-center-preview/`, change each navigation
group, load Overview/Analytics/Members/Community/Audit, open one member, and
confirm the legacy destination links. Use a test admin account for mutations.
