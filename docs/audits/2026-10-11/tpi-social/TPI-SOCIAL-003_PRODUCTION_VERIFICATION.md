# TPI-SOCIAL-003 Production Verification

Production verification is performed only after the verified source commit is
published. The required read-only checks are:

* public root returns 200;
* public `/live-video` remains Coming Soon;
* anonymous `/studio/` remains denied with the owner-only gate;
* anonymous notifications, Messenger, admin, and private media remain denied;
* public Community Feed/category discovery remains available without private
  member data leakage.

Authenticated production mutations, real member messages/posts, physical
devices, external providers, and destructive data requests are not part of this
verification. Final status and deployment identifier are appended after the
release smoke run.
