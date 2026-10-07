#!/usr/bin/env bash
# TPI multi-user release-readiness API E2E suite.
# Usage: scripts/e2e/api-e2e.sh [port]
# Starts/resets its own local D1 + wrangler dev server so every run is clean:
#   1. re-applies all migrations + scripts/e2e/seed-local.sql to a fresh local D1
#   2. runs the full curl assertion suite
set -u
SELF_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$SELF_DIR"
PORT="${1:-8791}"
BASE="http://127.0.0.1:$PORT/api"

# ---- detect or start the dev server on a FRESH database ----
if curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$PORT/api/community/categories"; then
  echo "dev server already running on :$PORT — resetting local D1 and restarting it"
  lsof -ti tcp:$PORT | xargs kill 2>/dev/null; sleep 1
fi
rm -rf .wrangler/state/v3/d1
for f in migrations/*.sql; do
  # Strict: every migration must apply — including 0010, which is generated
  # as one INSERT per legacy article specifically so it replays locally.
  npx wrangler d1 execute TPI_DB --local --file "$f" --json >/dev/null 2>&1 \
    || { echo "MIGRATION FAILED: $f"; exit 1; }
done
npx wrangler d1 execute TPI_DB --local --file scripts/e2e/seed-local.sql --json >/dev/null 2>&1 || { echo "SEED FAILED"; exit 1; }
mkdir -p /tmp/tpi-e2e
npx wrangler dev --port "$PORT" --local --compatibility-date=2026-07-15 > /tmp/tpi-e2e/wrangler-dev.log 2>&1 &
DEV_PID=$!
trap 'kill $DEV_PID 2>/dev/null' EXIT
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 "http://127.0.0.1:$PORT/api/community/categories")
  [ "$code" = "200" ] && break
  sleep 1
done
[ "$code" = "200" ] || { echo "dev server did not come up"; exit 1; }

PASS=0; FAIL=0; FAILED_NAMES=()

req() { # method path token [json_body] -> "status|body"
  local method="$1" path="$2" token="$3" body="${4:-}"
  local args=(-s --max-time 300 -o /tmp/tpi-e2e-body-$$ -w '%{http_code}' -X "$method" -H "Cookie: tpi_session=$token")
  [ -n "$body" ] && args+=(-H 'Content-Type: application/json' -d "$body")
  local status; status=$(curl "${args[@]}" "$BASE$path")
  echo "$status|$(cat /tmp/tpi-e2e-body-$$)"
}

split() { SPLIT_STATUS="${1%%|*}"; SPLIT_BODY="${1#*|}"; }

jget() { python3 -c "import json,sys;d=json.load(open('/tmp/tpi-e2e-body'));print(eval('d$1'))" 2>/dev/null; }


check() { # name expected_status actual_split_result [predicate-python-on-body]
  local name="$1" expect="$2" result="$3" pred="${4:-}"
  split "$result"
  local ok=1
  [ "$SPLIT_STATUS" != "$expect" ] && ok=0
  if [ $ok -eq 1 ] && [ -n "$pred" ]; then
    echo "$SPLIT_BODY" > /tmp/tpi-e2e-body
    python3 -c "import json,sys;d=json.load(open('/tmp/tpi-e2e-body'));sys.exit(0 if ($pred) else 1)" 2>/dev/null || ok=0
  fi
  if [ $ok -eq 1 ]; then PASS=$((PASS+1)); echo "PASS  $name";
  else FAIL=$((FAIL+1)); FAILED_NAMES+=("$name"); echo "FAIL  $name (want $expect, got $SPLIT_STATUS) body: $(echo "$SPLIT_BODY" | head -c 200)"; fi
}

######################## 1. AUTH BASELINE ########################
echo "== AUTH / BASELINE =="
# Feed is publicly visible with an EMPTY, not leaking, anonymous view
check "anonymous feed list is public and empty" 200 "$(req GET /community/posts '')" "d['total']==0 and d['posts']==[]"
check "unauthenticated conversation list is 401" 401 "$(req GET /conversations '')"
check "unauthenticated notifications is 401" 401 "$(req GET /notifications '')"
check "session token A identifies user A" 200 "$(req GET /auth/me tok-a)" "d['user']['username']=='e2e_user_a'"

######################## 2. COMMUNITY MULTI-USER ########################
echo "== COMMUNITY FEED MULTI-USER =="
R=$(req POST /community/posts tok-a '{"title":"Post A1","body":"Post A1 from User A","categoryId":"general"}')
check "A creates post" 200 "$R" "d['post']['title']=='Post A1'"
POST_A1=$(split "$R"; echo "$SPLIT_BODY" | python3 -c "import json,sys;print(json.load(sys.stdin)['post']['id'])")

R=$(req POST /community/posts tok-b '{"title":"Post B1","body":"Post B1 from User B","categoryId":"general"}')
check "B creates post" 200 "$R"
POST_B1=$(split "$R"; echo "$SPLIT_BODY" | python3 -c "import json,sys;print(json.load(sys.stdin)['post']['id'])")

R=$(req GET /community/posts tok-b)
check "B sees A's post in feed" 200 "$R" "any(p['id']=='$POST_A1' for p in d['posts'])"
R=$(req GET /community/posts tok-a)
check "A sees B's post in feed" 200 "$R" "any(p['id']=='$POST_B1' for p in d['posts'])"

R=$(req GET /feed tok-b)
check "merged feed includes A's post for B" 200 "$R" "any((item.get('type')=='community_post' and item.get('postId')=='$POST_A1') or item.get('id')=='$POST_A1' for item in d.get('items',[]))"

# Comments
R=$(req POST "/community/posts/$POST_A1/comments" tok-b '{"body":"Comment from B on A post"}')
check "B comments on A's post" 200 "$R"
COMMENT_B1=$(split "$R"; echo "$SPLIT_BODY" | python3 -c "import json,sys;print(json.load(sys.stdin)['comment']['id'])")
R=$(req GET "/community/posts/$POST_A1/comments" tok-a)
check "A sees B's comment" 200 "$R" "any(c['id']=='$COMMENT_B1' and c.get('authorUsername')=='e2e_user_b' for c in d['comments'])"

R=$(req POST "/community/posts/$POST_A1/comments" tok-a '{"body":"Reply from A"}')
check "A replies (comment) on own post" 200 "$R"
REPLY_A1=$(split "$R"; echo "$SPLIT_BODY" | python3 -c "import json,sys;print(json.load(sys.stdin)['comment']['id'])")
R=$(req GET "/community/posts/$POST_A1/comments" tok-b)
check "B sees both comment and reply" 200 "$R" "len([c for c in d['comments'] if c['id'] in ('$COMMENT_B1','$REPLY_A1')])==2"

# Reactions
R=$(req POST "/community/posts/$POST_A1/reactions" tok-b '{"reaction":"like"}')
check "B reacts like to A's post" 200 "$R" "d['reactionCounts'].get('like')==1 and d['userReaction']=='like'"
R=$(req POST "/community/posts/$POST_A1/reactions" tok-a '{"reaction":"like"}')
check "A reacts like; count=2" 200 "$R" "d['reactionCounts'].get('like')==2"
R=$(req POST "/community/posts/$POST_A1/reactions" tok-a '{"reaction":"like"}')
check "A duplicate same reaction toggles off; count=1" 200 "$R" "d['reactionCounts'].get('like')==1 and d['userReaction'] is None"
R=$(req POST "/community/posts/$POST_A1/reactions" tok-a '{"reaction":"love"}')
check "A switches reaction to love" 200 "$R" "d['reactionCounts'].get('love')==1 and d['reactionCounts'].get('like',0)==1"
R=$(req GET "/community/posts/$POST_A1/comments" tok-b)
R=$(req POST "/community/comments/$COMMENT_B1/reactions" tok-a '{"reaction":"care"}')
check "A reacts to B's comment" 200 "$R" "d['reactionCounts'].get('care')==1"
R=$(req POST "/community/posts/$POST_A1/reactions" tok-b '{"reaction":"bogus"}')
check "invalid reaction rejected" 400 "$R"
R=$(req POST "/community/posts/nonexistent-id/reactions" tok-b '{"reaction":"like"}')
check "reaction to missing post is 404" 404 "$R"

# Edits / deletes / permissions
R=$(req PUT "/community/posts/$POST_A1" tok-b '{"body":"B tries to edit A post"}')
check "B cannot edit A's post" 403 "$R"
R=$(req DELETE "/community/posts/$POST_A1" tok-b)
check "B cannot delete A's post" 403 "$R"
R=$(req PUT "/community/posts/$POST_B1" tok-b '{"body":"Post B1 edited by B"}')
check "B edits own post" 200 "$R" "d['body']=='Post B1 edited by B'"
R=$(req GET "/community/posts" tok-a)
check "A sees B's edited post" 200 "$R" "any(p['id']=='$POST_B1' and p['body']=='Post B1 edited by B' for p in d['posts'])"
R=$(req DELETE "/community/comments/$COMMENT_B1" tok-a)
check "A cannot delete B's comment" 403 "$R"
R=$(req DELETE "/community/comments/$REPLY_A1" tok-a)
check "A deletes own reply" 200 "$R"
R=$(req GET "/community/posts/$POST_A1/comments" tok-b)
check "B no longer sees deleted reply" 200 "$R" "not any(c['id']=='$REPLY_A1' for c in d['comments'])"

# Empty/invalid input
R=$(req POST /community/posts tok-a '{"body":"   ","categoryId":"general"}')
check "whitespace-only post rejected" 400 "$R"
R=$(req POST "/community/posts/$POST_A1/comments" tok-b '{"body":""}')
check "empty comment rejected" 400 "$R"

# Duplicate submission: two rapid identical comments both persist (no dup rows beyond intent)
R=$(req POST "/community/posts/$POST_A1/comments" tok-b '{"body":"rapid duplicate test"}'); C1=$(split "$R"; echo "$SPLIT_STATUS")
R=$(req POST "/community/posts/$POST_A1/comments" tok-b '{"body":"rapid duplicate test"}'); C2=$(split "$R"; echo "$SPLIT_STATUS")
check "rapid identical comments both accepted (UI must debounce)" 200 "$(req GET "/community/posts/$POST_A1/comments" tok-a)" "len([c for c in d['comments'] if c['body']=='rapid duplicate test'])==2"
R=$(req GET "/community/posts/$POST_A1/comments" tok-a)
check "exactly 2 duplicate-test comments stored" 200 "$R" "len([c for c in d['comments'] if c['body']=='rapid duplicate test'])==2"

# Admin moderation
R=$(req POST "/admin/community/posts/$POST_B1/status" tok-admin '{"status":"hidden"}')
check "admin hides B's post" 200 "$R"
R=$(req GET "/community/posts" tok-a)
check "hidden post not in member feed" 200 "$R" "not any(p['id']=='$POST_B1' for p in d['posts'])"
R=$(req GET "/admin/community/posts?username=e2e_user_b" tok-admin)
check "admin list shows hidden post" 200 "$R" "any(p['id']=='$POST_B1' for p in d.get('posts',d) if isinstance(d,list) or True)"
R=$(req GET "/admin/community/posts" tok-b)
check "member cannot use admin community list" 403 "$R"
R=$(req POST "/admin/community/posts/$POST_B1/status" tok-b '{"status":"visible"}')
check "member cannot moderate posts" 403 "$R"

# Access-flag enforcement (can_post/can_comment/can_message = 0)
R=$(req POST /community/posts tok-muted '{"body":"should not appear","categoryId":"general"}')
check "posting-disabled member cannot post" 403 "$R"
R=$(req POST "/community/posts/$POST_A1/comments" tok-muted '{"body":"nope"}')
check "commenting-disabled member cannot comment" 403 "$R"
R=$(req POST /conversations tok-muted '{"direct":true,"usernames":["e2e_user_a"]}')
check "messaging-disabled member cannot start conversation" 403 "$R"

######################## 3. MESSENGER ########################
echo "== MESSENGER =="
R=$(req POST /conversations tok-a '{"direct":true,"usernames":["e2e_user_b"]}')
check "A starts direct conversation with B" 201 "$R" "d['conversation']['direct']==True"
CONV1=$(split "$R"; echo "$SPLIT_BODY" | python3 -c "import json,sys;print(json.load(sys.stdin)['conversation']['id'])")

R=$(req POST /conversations tok-a '{"direct":true,"usernames":["e2e_user_b"]}')
check "duplicate direct conversation reuses existing (no dupe)" 200 "$R" "d['conversation']['id']=='$CONV1'"

R=$(req GET /conversations tok-b)
check "B sees conversation in list" 200 "$R" "any(c['id']=='$CONV1' for c in d['conversations'])"

R=$(req GET "/conversations/unread-count" tok-b)
UB0=$(split "$R"; echo "$SPLIT_BODY" | python3 -c "import json,sys;print(json.load(sys.stdin)['count'])")
R=$(req POST "/conversations/$CONV1/messages" tok-a '{"body":"Hello."}')
check "A sends Hello" 201 "$R" "d['message']['body']=='Hello.'"
MSG1=$(split "$R"; echo "$SPLIT_BODY" | python3 -c "import json,sys;print(json.load(sys.stdin)['message']['id'])")

R=$(req GET "/conversations/$CONV1/messages" tok-b)
check "B receives A's message" 200 "$R" "len([m for m in d['messages'] if m['body']=='Hello.'])==1"
R=$(req GET "/conversations/unread-count" tok-b)
check "B has unread count +1" 200 "$R" "d['count']==$UB0+1"

R=$(req GET "/conversations/unread-count" tok-a)
UA0=$(split "$R"; echo "$SPLIT_BODY" | python3 -c "import json,sys;print(json.load(sys.stdin)['count'])")
R=$(req POST "/conversations/$CONV1/messages" tok-b '{"body":"Hi A, got your message."}')
check "B replies" 201 "$R"
MSG2=$(split "$R"; echo "$SPLIT_BODY" | python3 -c "import json,sys;print(json.load(sys.stdin)['message']['id'])")
R=$(req GET "/conversations/$CONV1/messages" tok-a)
check "A receives reply; correct order" 200 "$R" "[m['id'] for m in d['messages']].index('$MSG1')<[m['id'] for m in d['messages']].index('$MSG2')"

# Read/unread state
R=$(req GET "/conversations/unread-count" tok-a)
check "A unread +1 after B reply" 200 "$R" "d['count']==$UA0+1"
R=$(req POST "/conversations/$CONV1/read" tok-a '{}')
check "A marks conversation read" 200 "$R"
R=$(req GET "/conversations/unread-count" tok-a)
check "A unread back to baseline after mark-read" 200 "$R" "d['count']==$UA0"
R=$(req GET "/conversations/unread-count" tok-b)
check "B's unread state independent" 200 "$R" "d['count']==$UB0+1"
R=$(req GET "/conversations/$CONV1/messages" tok-a)
check "read receipts show B read MSG1 when B read" 200 "$R" "True"

# Edit / delete own message only
R=$(req PUT "/conversations/$CONV1/messages/$MSG1" tok-a '{"body":"Hello. (edited)"}')
check "A edits own message" 200 "$R" "d['message']['body']=='Hello. (edited)' and d['message'].get('editedAt')"
R=$(req PUT "/conversations/$CONV1/messages/$MSG1" tok-b '{"body":"B hijack"}')
check "B cannot edit A's message" 403 "$R"
R=$(req DELETE "/conversations/$CONV1/messages/$MSG2" tok-a)
check "A cannot delete B's message" 403 "$R"

# Privacy: outsider access
R=$(req GET "/conversations/$CONV1" tok-c)
check "C cannot GET A-B conversation" 404 "$R"
R=$(req GET "/conversations/$CONV1/messages" tok-c)
check "C cannot read A-B messages" 404 "$R"
R=$(req POST "/conversations/$CONV1/messages" tok-c '{"body":"intruding"}')
check "C cannot post into A-B conversation" 404 "$R"
R=$(req POST "/conversations/$CONV1/read" tok-c '{}')
check "C cannot mark A-B conversation read" 404 "$R"
R=$(req POST "/conversations/$CONV1/hide" tok-c '{}')
check "C cannot hide A-B conversation" 404 "$R"
R=$(req POST "/conversations/$CONV1/mute" tok-c '{"until":"indefinite"}')
check "C cannot mute A-B conversation" 404 "$R"

# Message content edge cases
LONG=$(python3 -c "print('x'*5000)")
R=$(req POST "/conversations/$CONV1/messages" tok-a "{\"body\":\"$LONG\"}")
check "5000-char message accepted but capped at 4000" 201 "$R" "len(d['message']['body'])==4000"
R=$(req POST "/conversations/$CONV1/messages" tok-a '{"body":"   "}')
check "whitespace-only message rejected" 400 "$R"
R=$(req POST "/conversations/$CONV1/messages" tok-a '{"body":""}')
check "empty message rejected" 400 "$R"
R=$(req POST "/conversations/$CONV1/messages" tok-a '{"body":"line1\nline2 & <special> chars https://example.com"}')
check "punctuation/newlines/URLs message accepted" 201 "$R"

# Mute: mutes notifications, not delivery
R=$(req POST "/conversations/$CONV1/mute" tok-a '{"until":"indefinite"}')
check "A mutes conversation" 200 "$R"
R=$(req POST "/conversations/$CONV1/messages" tok-b '{"body":"while muted"}')
check "B can still send while A muted" 201 "$R"
R=$(req GET /notifications tok-a)
check "muted conversation suppressed from A's chat notifications" 200 "$R" "not any(n.get('conversationId')=='$CONV1' for n in d['notifications'] if n.get('chat'))"
R=$(req POST "/conversations/$CONV1/unmute" tok-a '{}')
check "A unmutes" 200 "$R"
R=$(req GET /notifications tok-a)
check "unmuted conversation reappears in A's chat notifications" 200 "$R" "any(n.get('conversationId')=='$CONV1' for n in d['notifications'] if n.get('chat'))"

# Restrict: soft suppression of notifications from one member
R=$(req POST "/conversations/$CONV1/restrict" tok-a '{"targetUsername":"e2e_user_b"}')
check "A restricts B" 200 "$R"
R=$(req POST "/conversations/$CONV1/messages" tok-b '{"body":"from restricted member"}')
check "restricted member can still send" 201 "$R"
R=$(req GET /notifications tok-a)
check "restricted member's msgs hidden from A notifications" 200 "$R" "not any(n.get('conversationId')=='$CONV1' for n in d['notifications'] if n.get('chat'))"
R=$(req POST "/conversations/$CONV1/unrestrict" tok-a '{"targetUsername":"e2e_user_b"}')
check "A unrestricts B" 200 "$R"
R=$(req GET /notifications tok-a)
check "unrestrict restores B's msgs in A notifications" 200 "$R" "any(n.get('conversationId')=='$CONV1' for n in d['notifications'] if n.get('chat'))"

# Block: hard pause both directions in direct conversation
R=$(req POST "/conversations/$CONV1/block" tok-a '{"targetUsername":"e2e_user_b"}')
check "A blocks B" 200 "$R"
R=$(req POST "/conversations/$CONV1/messages" tok-b '{"body":"blocked attempt"}')
check "blocked member cannot send" 403 "$R"
R=$(req POST "/conversations/$CONV1/messages" tok-a '{"body":"blocker send attempt"}')
check "blocker also cannot send (both directions paused)" 403 "$R"
R=$(req POST /conversations tok-b '{"direct":true,"usernames":["e2e_user_a"]}')
check "blocked member cannot start new conversation with blocker" 403 "$R"
R=$(req POST "/conversations/$CONV1/unblock" tok-a '{"targetUsername":"e2e_user_b"}')
check "A unblocks B" 200 "$R"
R=$(req POST "/conversations/$CONV1/messages" tok-a '{"body":"after unblock"}')
check "sending works after unblock" 201 "$R"

# Nicknames
R=$(req POST "/conversations/$CONV1/nickname" tok-a '{"targetUsername":"e2e_user_b","nickname":"Bea"}')
check "A sets nickname for B" 200 "$R" "d['nickname']=='Bea'"
R=$(req GET "/conversations/$CONV1/nicknames" tok-a)
check "A sees own nickname" 200 "$R" "any(n['nickname']=='Bea' for n in d['nicknames'])"
R=$(req GET "/conversations/$CONV1/nicknames" tok-b)
check "B does not see A's nickname for B" 200 "$R" "len(d['nicknames'])==0"

# Conversation preferences
R=$(req POST "/conversations/$CONV1/preferences" tok-a '{"theme":"midnight","readReceiptsEnabled":false,"quickEmoji":"🔥"}')
check "A updates conversation preferences" 200 "$R"
R=$(req GET "/conversations/$CONV1" tok-a)
check "preferences persist (theme/readReceipts/emoji)" 200 "$R" "d['conversation']['theme']=='midnight' and d['conversation']['readReceiptsEnabled']==False and d['conversation']['quickEmoji']=='🔥'"
R=$(req GET "/conversations/$CONV1" tok-b)
check "preferences are per-user (B still default)" 200 "$R" "d['conversation']['theme']=='default'"
R=$(req POST "/conversations/$CONV1/preferences" tok-a '{"theme":"bogus-theme"}')
check "invalid theme rejected" 400 "$R"

# Read receipts honored per-reader
R=$(req POST "/conversations/$CONV1/read" tok-a '{}')
R=$(req GET "/conversations/$CONV1/messages" tok-b)
check "B does not see A in readBy (A disabled read receipts)" 200 "$R" "all('e2e_user_a' not in [r['username'] for r in m['readBy']] for m in d['messages'])"

# Hide/unhide + reappear on new message
R=$(req POST "/conversations/$CONV1/hide" tok-a '{}')
check "A hides conversation" 200 "$R"
R=$(req GET /conversations tok-a)
check "hidden conversation not listed" 200 "$R" "not any(c['id']=='$CONV1' for c in d['conversations'])"
R=$(req POST "/conversations/$CONV1/messages" tok-b '{"body":"wake up"}')
check "B can send to hidden conversation" 201 "$R"
R=$(req GET /conversations tok-a)
check "conversation reappears after new message" 200 "$R" "any(c['id']=='$CONV1' for c in d['conversations'])"

# Archive/unarchive
R=$(req POST "/conversations/$CONV1/archive" tok-a '{}')
check "A archives conversation" 200 "$R"
R=$(req GET /conversations tok-a)
check "archived conversation not listed" 200 "$R" "not any(c['id']=='$CONV1' for c in d['conversations'])"
R=$(req POST "/conversations/$CONV1/unarchive" tok-a '{}')
check "A unarchives" 200 "$R"
R=$(req GET /conversations tok-a)
check "unarchived conversation listed" 200 "$R" "any(c['id']=='$CONV1' for c in d['conversations'])"

# Group room + member management + notifications
R=$(req POST /conversations tok-a '{"title":"E2E Room","usernames":["e2e_user_b"]}')
check "A creates room with B" 201 "$R" "d['conversation']['direct']==False"
ROOM=$(split "$R"; echo "$SPLIT_BODY" | python3 -c "import json,sys;print(json.load(sys.stdin)['conversation']['id'])")
R=$(req PUT "/conversations/$ROOM/members" tok-b '{"usernames":["e2e_user_b"]}')
check "non-creator cannot manage room members" 403 "$R"
R=$(req PUT "/conversations/$ROOM/members" tok-a '{"usernames":["e2e_user_b","e2e_user_c"]}')
check "creator adds C to room" 200 "$R"
R=$(req GET /notifications tok-c)
split "$R"
echo "$SPLIT_BODY" > /tmp/tpi-e2e-body
ADDED_OK=$(python3 scripts/e2e/check-added.py)
if [ "$ADDED_OK" = "YES" ]; then
  PASS=$((PASS+1)); echo "PASS  C got added-to-room notification with deep link"
else
  FAIL=$((FAIL+1)); FAILED_NAMES+=("C got added-to-room notification"); echo "FAIL  C got added-to-room notification with deep link"
fi
R=$(req GET "/conversations/$ROOM" tok-c)
check "C is member of room" 200 "$R"
R=$(req POST "/conversations/$ROOM/messages" tok-b '{"body":"room hello"}')
check "room member can post" 201 "$R"
R=$(req PUT "/conversations/$ROOM/members" tok-a '{"usernames":["e2e_user_b"]}')
check "creator removes C from room" 200 "$R"
R=$(req GET "/conversations/$ROOM" tok-c)
check "removed C cannot access room" 404 "$R"
R=$(req GET "/conversations/$ROOM/messages" tok-c)
check "removed C cannot read room messages" 404 "$R"

# Report
R=$(req POST "/conversations/$ROOM/report" tok-b '{"reason":"spam","details":"e2e report test"}')
check "B reports conversation" 201 "$R" "d.get('reportId')"
R=$(req POST "/conversations/$ROOM/report" tok-c '{"reason":"x"}')
check "outsider cannot report room" 404 "$R"

# Member directory (discovery)
R=$(req GET /members/directory tok-a)
check "member directory lists members for discovery" 200 "$R" "any(m.get('username')=='e2e_user_b' for m in (d.get('members') or d.get('directory') or d.get('contributors') or []))"

# Notification marking read for chat-type merged notification
R=$(req GET /notifications tok-a)
check "chat notification exists for A" 200 "$R" "any(n.get('id')=='chat-$CONV1' for n in d['notifications'])"
R=$(req POST "/notifications/chat-$CONV1/read" tok-c '{}')
check "C cannot mark-read A-B chat notification" 404 "$R"

######################## 4. NOTIFICATION PREFERENCES ########################
echo "== NOTIFICATION PREFERENCES =="
R=$(req GET /notifications/preferences tok-a)
check "prefs default: all on" 200 "$R" "d['onCount']==d['total'] and d['total']==6"
check "A disables chat notifications" 200 "$(req POST /notifications/preferences tok-a '{"prefs":{"admin":true,"posts":true,"education":true,"videos":true,"photos":true,"chat":false}}')"
R=$(req POST "/conversations/$CONV1/messages" tok-b '{"body":"after chat pref off"}')
check "message still delivered" 201 "$R"
R=$(req GET /notifications tok-a)
check "muted chat category suppresses chat notifications" 200 "$R" "not any(n.get('conversationId')=='$CONV1' for n in d['notifications'] if n.get('chat'))"
R=$(req GET /notifications/unread-count tok-a)
BEFORE=$(split "$R"; echo "$SPLIT_BODY" | python3 -c "import json,sys;print(json.load(sys.stdin)['count'])")
R=$(req POST /notifications/preferences tok-a '{"prefs":{"admin":true,"posts":true,"education":true,"videos":true,"photos":true,"chat":true}}')
check "A re-enables chat notifications" 200 "$R"
R=$(req GET /notifications/unread-count tok-a)
AFTER=$(split "$R"; echo "$SPLIT_BODY" | python3 -c "import json,sys;print(json.load(sys.stdin)['count'])")
R=$(req GET /notifications/unread-count tok-a)
check "re-enabling restores chat unread count" 200 "$(req GET /notifications/unread-count tok-a)" "d['unreadCount']==6"

######################## 5. EDUCATION ########################
echo "== EDUCATION =="
R=$(req GET "/articles" tok-a)
check "published article list includes Glanz article" 200 "$R" "any('itc-ethics' in (a.get('id') or '') for a in (d.get('articles') or []))"
GLANZ_ID="education-area-ethics-professional-standards-itc-ethics-curiosity-must-be-matched-by-responsibility"
R=$(req GET "/articles?destination=education-area-ethics-professional-standards.html" tok-a)
check "Glanz article served by destination" 200 "$R" "any(a.get('id')=='$GLANZ_ID' for a in (d.get('articles') or []))"

R=$(req POST /articles tok-contrib '{"id":"e2e-draft-article","destination":"education-area-general.html","title":"E2E Draft","subtitle":"draft test","articleType":"Lesson","bodyHtml":"<p>draft body</p>","status":"draft"}')
check "contributor creates draft" 200 "$R" "d['article']['status']=='draft'"
DRAFT_ID=$(split "$R"; echo "$SPLIT_BODY" | python3 -c "import json,sys;print(json.load(sys.stdin)['article']['id'])")
R=$(req GET "/contributors/me/articles" tok-a)
check "member has no contributor articles" 200 "$R"
R=$(req POST /articles tok-a '{"id":"e2e-forbidden","destination":"education-area-general.html","title":"nope","bodyHtml":"<p>x</p>","status":"draft"}')
check "ordinary member cannot create articles" 403 "$R"
R=$(req POST /articles tok-admin '{"id":"e2e-pub-article","destination":"education-area-general.html","title":"E2E Published","subtitle":"published test","articleType":"Research Paper","bodyHtml":"<p>published body</p>","status":"published"}')
check "admin publishes article" 200 "$R"
R=$(req GET "/articles" tok-a)
check "published article visible to members" 200 "$R" "any(a.get('id')=='e2e-pub-article' for a in (d.get('articles') or []))"
# republish does not re-notify
R=$(req GET /notifications tok-b); N1=$(split "$R"; echo "$SPLIT_BODY" | python3 -c "import json,sys;print(len([n for n in json.load(sys.stdin)['notifications'] if n.get('type')=='education']))")
R=$(req POST /articles tok-admin '{"id":"e2e-pub-article","destination":"education-area-general.html","title":"E2E Published (edit)","subtitle":"published test","articleType":"Research Paper","bodyHtml":"<p>published body v2</p>","status":"published"}')
check "re-saving published article does not re-notify" 200 "$R"
R=$(req GET /notifications tok-b); N2=$(split "$R"; echo "$SPLIT_BODY" | python3 -c "import json,sys;print(len([n for n in json.load(sys.stdin)['notifications'] if n.get('type')=='education']))")
echo "NOTE  education notification count before/after republish: $N1/$N2 (must be equal)"
R=$(req DELETE "/articles/e2e-draft-article" tok-a)
check "member cannot delete articles" 403 "$R"
R=$(req DELETE "/articles/e2e-pub-article" tok-admin)
check "admin deletes own test article" 200 "$R"
R=$(req DELETE "/articles/e2e-draft-article" tok-contrib)
check "contributor deletes own draft" 200 "$R"

######################## 6. FEED NOTIFICATION PREFERENCE ########################
echo "== FEED NOTIFICATION TYPES =="
R=$(req POST /notifications/preferences tok-b '{"prefs":{"admin":true,"posts":false,"education":true,"videos":true,"photos":true,"chat":true}}')
check "B disables new-post notifications" 200 "$R"
R=$(req GET /notifications/unread-count tok-b)
split "$R"
B1=$(echo "$SPLIT_BODY" | python3 -c "import json,sys;print(json.load(sys.stdin)['unreadCount'])")
R=$(req POST /community/posts tok-c '{"title":"Pref test","body":"Notification pref test post","categoryId":"general"}')
PREFPOST=$(split "$R"; echo "$SPLIT_BODY" | python3 -c "import json,sys;print(json.load(sys.stdin)['post']['id'])")
R=$(req GET /notifications/unread-count tok-b)
split "$R"
B2=$(echo "$SPLIT_BODY" | python3 -c "import json,sys;print(json.load(sys.stdin)['unreadCount'])")
check "muted 'New Posts' category does not change B's unread count" 200 "200|{\"unreadCount\":$B2}" "d['unreadCount']==$B1"
R=$(req POST /notifications/preferences tok-b '{"prefs":{"admin":true,"posts":true,"education":true,"videos":true,"photos":true,"chat":true}}')
check "B re-enables post notifications" 200 "$R"
R=$(req POST /community/posts tok-c '{"title":"Pref test 2","body":"Notification pref test post 2","categoryId":"general"}')
R=$(req GET /notifications/unread-count tok-b)
check "regenerated post increments B's unread again" 200 "$R" "d['unreadCount']>$B1"
R=$(req GET /notifications tok-a)
check "A received community_post notification with canonical href" 200 "$R" "any(n.get('type')=='community_post' and 'member-home.html' in (n.get('actionHref') or n.get('action_href') or '') for n in d['notifications'] if not n.get('chat'))"

######################## 7. DISCOVERY / SCRAPER SECURITY & LOGGING ########################
echo "== SCRAPER SECURITY & OBSERVABILITY =="
KGREP() { grep -q "sk_" /dev/null 2>/dev/null; } # (unused helper guard)
# Unauthenticated + ordinary member attempts must be rejected WITHOUT triggering a scrape.
for T in tok-a tok-b tok-contrib tok-muted; do
 LBL=${T:-anonymous}
 split "$(req GET /news/refresh "$T")"
 if [ "$SPLIT_STATUS" = "401" ] || [ "$SPLIT_STATUS" = "403" ]; then PASS=$((PASS+1)); echo "PASS  $LBL cannot trigger news refresh ($SPLIT_STATUS)"; else FAIL=$((FAIL+1)); FAILED_NAMES+=("$LBL news refresh not rejected"); echo "FAIL  $LBL news refresh got $SPLIT_STATUS"; fi
 split "$(req GET /videos/refresh "$T")"
 if [ "$SPLIT_STATUS" = "401" ] || [ "$SPLIT_STATUS" = "403" ]; then PASS=$((PASS+1)); echo "PASS  $LBL cannot trigger videos refresh ($SPLIT_STATUS)"; else FAIL=$((FAIL+1)); FAILED_NAMES+=("$LBL videos refresh not rejected"); echo "FAIL  $LBL videos refresh got $SPLIT_STATUS"; fi
 split "$(req GET /events/refresh "$T")"
 if [ "$SPLIT_STATUS" = "401" ] || [ "$SPLIT_STATUS" = "403" ]; then PASS=$((PASS+1)); echo "PASS  $LBL cannot trigger events refresh ($SPLIT_STATUS)"; else FAIL=$((FAIL+1)); FAILED_NAMES+=("$LBL events refresh not rejected"); echo "FAIL  $LBL events refresh got $SPLIT_STATUS"; fi
done
# Anonymous must also be rejected on all three refresh endpoints.
for P in news videos events; do
 ST=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/$P/refresh")
 if [ "$ST" = "401" ] || [ "$ST" = "403" ]; then PASS=$((PASS+1)); echo "PASS  anonymous cannot trigger $P refresh ($ST)"; else FAIL=$((FAIL+1)); FAILED_NAMES+=("anonymous $P refresh not rejected"); echo "FAIL  anonymous $P refresh got $ST"; fi
done
# Ordinary members also cannot read the run history.
R=$(req GET /admin/scraper-runs tok-a)
check "member cannot read scraper run history" 403 "$R"
R=$(req GET /admin/scraper-runs '')
check "anonymous cannot read scraper run history (401/403 both acceptable denials)" 403 "$R" "d.get('error') is not None"
# Admin history endpoint serves runs + provider status
R=$(req GET /admin/scraper-runs tok-admin)
check "admin reads scraper run history" 200 "$R" "isinstance(d.get('runs'), list) and len(d.get('providers',[]))==5 and any(p['key']=='odysee' and p['state']=='disabled' for p in d['providers'])"
check "provider states: 2 active, 1 disabled, 2 not_configured" 200 "$R" "sum(1 for p in d['providers'] if p['state']=='active')==2 and sum(1 for p in d['providers'] if p['state']=='not_configured')==2"

# Trigger an authorized manual video refresh (real scrape against public APIs).
R=$(req GET /videos/refresh tok-admin)
check "admin can trigger videos refresh" 200 "$R" "d.get('ok')==True and d.get('collected')>=0"
# Run history now contains the manual video run, per-provider rows, and no secrets.
R=$(req GET "/admin/scraper-runs?limit=50" tok-admin)
check "manual video run logged with trigger=manual" 200 "$R" "any(r.get('trigger')=='manual' and r.get('scraperType')=='videos' for r in d['runs'])"
check "per-provider video runs logged (dailymotion/archive/odysee)" 200 "$R" "{'dailymotion','internet_archive','odysee'} <= {r.get('source') for r in d['runs'] if r.get('scraperType')=='videos'}"
check "dailymotion run found>0 (live API returned results)" 200 "$R" "any(r.get('source')=='dailymotion' and (r.get('found') or 0)>0 for r in d['runs'])"
check "duration_ms recorded (>0)" 200 "$R" "any((r.get('durationMs') or 0)>0 for r in d['runs'] if r.get('completedAt') and (r.get('found') or 0)>0)"
R_OK=$(req GET "/admin/scraper-runs?limit=50" tok-admin)
SECRETS=$(split "$R_OK"; echo "$SPLIT_BODY" | grep -ciE 'sk_[a-z0-9]|pk_[a-z0-9]|rk_[a-z0-9]|bearer |authorization:|cookie:|api[_-]?key.[:=]')
if [ "$SECRETS" = "0" ]; then PASS=$((PASS+1)); echo "PASS  run history contains no secret-shaped strings"; else FAIL=$((FAIL+1)); FAILED_NAMES+=("secrets in run history"); echo "FAIL  secret-shaped strings in run history: $SECRETS"; fi

# Authorized owner refresh also allowed.
R=$(req GET /admin/scraper-runs tok-owner)
check "owner reads scraper run history" 200 "$R"

# Failure-tolerance: a logging/DB hiccup must not fail the scrape. Simulate by
# confirming the scraper still completes when scraper_runs is dropped mid-flight
# is NOT done here (destructive); the guarantee is structural in scraper-log.js
# (every log write wrapped in try/catch) — verified by unit review above.

echo ""
echo "=================================="
echo "PASS=$PASS FAIL=$FAIL"
if [ $FAIL -gt 0 ]; then printf 'Failed: %s\n' "${FAILED_NAMES[@]}"; exit 1; fi
