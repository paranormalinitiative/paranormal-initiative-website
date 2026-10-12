# Known limitations

- Local Vite preview has no Worker/D1 backend, so live metrics and member
  responses cannot be verified there.
- No production deployment or session matrix is claimed by this local report.
- The preview currently covers the first dashboard/member/analytics/audit
  slice; publishing, reports, notifications, teams, settings, and Creator
  Partnership workflows remain linked to existing tools or documented.
- The npm audit has seven high findings in development tooling; production
  dependencies have zero high findings. A separate dev-toolchain remediation
  should not be mixed into this feature slice.
- No owner acceptance has been recorded for replacing `/admin-panel`.
