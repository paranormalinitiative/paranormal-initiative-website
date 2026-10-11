# TPI-SOCIAL-003 Baseline

Date: 2026-10-11
Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
Scope: existing TPI member shell, Community Feed, profiles, Messenger,
notifications, Settings, personalization, privacy/safety, data requests,
search/navigation, and cross-feature security.

This is an audit and focused repair of the existing social system. Community
Feed is the active discussion system; the retired Forum tables and UI were not
reopened. StudioFlow, TPI Videos, `/studio/`, `/live-video`, D1 production data,
R2 recordings, and unrelated dirty files remain outside the repair scope.

The first bounded local run initially hit the sandbox's loopback/log permission
boundary. Re-running the existing suite with the required local-server
permission completed **213/213 PASS**. This is local disposable evidence, not
authenticated production mutation evidence.

One confirmed UI defect was found in `member-settings.js`: six Content Ownership
cards were prefixed with unary `+` operators and could render as `NaN`. The
operators were removed without changing the panel's information architecture.
