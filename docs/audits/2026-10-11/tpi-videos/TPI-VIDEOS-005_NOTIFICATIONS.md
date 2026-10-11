# Notifications

The existing follower notification helper and `videos` preference category are reused. A first explicit broadcast publication can notify channel followers, and a first explicit replay publication can notify them. Repeated publish/replay retries do not re-notify because the prior state is checked first. Notification preference suppression remains honored.

Production delivery and inbox rendering require signed-in owner/member verification; local API coverage verifies the route and preference infrastructure but does not claim a real recipient inbox test.
