#!/bin/bash
set -u
B=http://127.0.0.1:8799/api
M='Cookie: tpi_session=localtest-member-token-0002'
A='Cookie: tpi_session=localtest-admin-token-0001'

echo "1. mute admin category:"
curl -s -X POST $B/notifications/preferences -H "$M" -H 'Content-Type: application/json' \
  -d '{"prefs":{"admin":false,"posts":true,"education":true,"videos":true,"photos":true,"chat":true}}' \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); print("   ok:",d.get("ok"),"| onCount:",d.get("onCount"),"/",d.get("total"),"| admin enabled:",[c["enabled"] for c in d["categories"] if c["key"]=="admin"])'

U0=$(curl -s $B/notifications/unread-count -H "$M" | python3 -c 'import json,sys; print(json.load(sys.stdin)["unreadCount"])')
N0=$(curl -s $B/notifications -H "$M" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)["notifications"]))')
echo "2. baseline: unread=$U0 total=$N0"

echo "3. admin sends while muted:"
curl -s -X POST $B/admin/members/testuser/notifications -H "$A" -H 'Content-Type: application/json' \
  -d '{"title":"E2E test notice (should be suppressed)","body":"prefs test","actionHref":"member-dashboard.html","type":"profile-request"}' | head -c 200; echo

U1=$(curl -s $B/notifications/unread-count -H "$M" | python3 -c 'import json,sys; print(json.load(sys.stdin)["unreadCount"])')
N1=$(curl -s $B/notifications -H "$M" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)["notifications"]))')
echo "4. after muted send: unread=$U1 total=$N1 (expect unchanged $U0/$N0)"

echo "5. restore + resend:"
curl -s -X POST $B/notifications/preferences -H "$M" -H 'Content-Type: application/json' \
  -d '{"prefs":{"admin":true,"posts":true,"education":true,"videos":true,"photos":true,"chat":true}}' \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); print("   restored onCount:",d.get("onCount"))'
curl -s -X POST $B/admin/members/testuser/notifications -H "$A" -H 'Content-Type: application/json' \
  -d '{"title":"E2E test notice (delivered)","body":"prefs test 2","actionHref":"member-dashboard.html","type":"profile-request"}' | head -c 120; echo

U2=$(curl -s $B/notifications/unread-count -H "$M" | python3 -c 'import json,sys; print(json.load(sys.stdin)["unreadCount"])')
N2=$(curl -s $B/notifications -H "$M" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)["notifications"]))')
echo "6. after restored send: unread=$U2 total=$N2 (expect $((U0+1))/$((N0+1)))"

if [ "$U1" = "$U0" ] && [ "$N1" = "$N0" ] && [ "$U2" = "$((U0+1))" ] && [ "$N2" = "$((N0+1))" ]; then
  echo "RESULT: PASS"
else
  echo "RESULT: FAIL"
fi
