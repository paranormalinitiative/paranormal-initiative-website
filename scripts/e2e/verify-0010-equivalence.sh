#!/usr/bin/env bash
# Proves migration 0010 equivalence: the pre-split monolithic statement, the
# regenerated per-article 0010, and the 21 chunk files must all produce
# byte-identical `articles` rows (excluding the CURRENT_TIMESTAMP column).
#
# Usage: scripts/e2e/verify-0010-equivalence.sh
set -u
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

OLD_0010="backups/pre-split-0010-convert-todd-legacy-contributions.sql"
NEW_0010="migrations/0010_convert_todd_legacy_contributions.sql"
CHUNKS_DIR="migrations/0010_legacy_conversion_chunks"
TMP="/tmp/tpi-verify-0010"
mkdir -p "$TMP"

dump_articles() { # $1 = output path
  npx wrangler d1 execute TPI_DB --local --command \
    "SELECT id, destination, href, title, subtitle, article_type, author, source, body_html, article_html, labels, status, created_by FROM articles ORDER BY id" \
    --json 2>/dev/null > "$1"
}

build_db() { # $1 = mode: old | new | chunks
  local mode="$1"
  rm -rf .wrangler/state/v3/d1
  for f in migrations/000*.sql; do
    npx wrangler d1 execute TPI_DB --local --file "$f" --json >/dev/null 2>&1 \
      || { echo "SETUP FAILED: $f"; exit 1; }
  done
  # The conversion JOINs contributors on the legacy username, so the probe needs one.
  npx wrangler d1 execute TPI_DB --local --command \
    "INSERT INTO contributors (id, username, password_hash, display_name, role) VALUES ('legacy-todd-probe','Todd_Wayne','probe','Todd Wayne','owner')" \
    --json >/dev/null 2>&1 || { echo "PROBE INSERT FAILED"; exit 1; }

  case "$mode" in
    old)
      # The 1MB single statement hits wrangler's transfer cap (the bug being
      # fixed), so apply the pre-split file through the sqlite3 CLI directly —
      # same SQLite engine, no wrangler limit.
      DB_FILE=$(ls "$REPO_ROOT/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/"*.sqlite | grep -v metadata | head -1)
      [ -n "$DB_FILE" ] || { echo "LOCAL D1 SQLITE FILE NOT FOUND"; exit 1; }
      sqlite3 "$DB_FILE" < "$OLD_0010" >/dev/null \
        || { echo "OLD 0010 FAILED TO APPLY"; exit 1; } ;;
    new)
      npx wrangler d1 execute TPI_DB --local --file "$NEW_0010" --json >/dev/null 2>&1 \
        || { echo "NEW 0010 FAILED TO APPLY"; exit 1; } ;;
    chunks)
      for f in "$CHUNKS_DIR"/*.sql; do
        npx wrangler d1 execute TPI_DB --local --file "$f" --json >/dev/null 2>&1 \
          || { echo "CHUNK FAILED: $f"; exit 1; }
      done ;;
  esac
}

normalize() { # $1 = raw wrangler json, $2 = normalized output
  python3 - "$1" "$2" <<'PYEOF'
import json, sys
raw = json.load(open(sys.argv[1]))
rows = raw[0]["results"] if raw else []
json.dump(rows, open(sys.argv[2], "w"), indent=1, sort_keys=True)
PYEOF
}

echo "== building with PRE-SPLIT monolithic 0010 =="
build_db old
dump_articles "$TMP/old-raw.json"; normalize "$TMP/old-raw.json" "$TMP/old.json"
OLD_ROWS=$(python3 -c "import json;print(len(json.load(open('$TMP/old.json'))))")
echo "   rows: $OLD_ROWS"

echo "== building with REGENERATED per-article 0010 =="
build_db new
dump_articles "$TMP/new-raw.json"; normalize "$TMP/new-raw.json" "$TMP/new.json"
NEW_ROWS=$(python3 -c "import json;print(len(json.load(open('$TMP/new.json'))))")
echo "   rows: $NEW_ROWS"

echo "== building with the 21 CHUNK files =="
build_db chunks
dump_articles "$TMP/chunks-raw.json"; normalize "$TMP/chunks-raw.json" "$TMP/chunks.json"
CHUNK_ROWS=$(python3 -c "import json;print(len(json.load(open('$TMP/chunks.json'))))")
echo "   rows: $CHUNK_ROWS"

echo ""
FAIL=0
[ "$OLD_ROWS" = "$NEW_ROWS" ] && echo "PASS  row count old == new ($OLD_ROWS)" || { echo "FAIL  row count old=$OLD_ROWS new=$NEW_ROWS"; FAIL=1; }
[ "$OLD_ROWS" = "$CHUNK_ROWS" ] && echo "PASS  row count old == chunks ($OLD_ROWS)" || { echo "FAIL  row count old=$OLD_ROWS chunks=$CHUNK_ROWS"; FAIL=1; }
[ "$OLD_ROWS" -gt 0 ] && echo "PASS  migration actually produced rows" || { echo "FAIL  no rows produced (probe would be vacuous)"; FAIL=1; }
diff -q "$TMP/old.json" "$TMP/new.json" >/dev/null && echo "PASS  all article columns identical: old == new" || { echo "FAIL  old vs new differ:"; diff "$TMP/old.json" "$TMP/new.json" | head -20; FAIL=1; }
diff -q "$TMP/old.json" "$TMP/chunks.json" >/dev/null && echo "PASS  all article columns identical: old == chunks" || { echo "FAIL  old vs chunks differ:"; diff "$TMP/old.json" "$TMP/chunks.json" | head -20; FAIL=1; }

echo ""
if [ $FAIL -eq 0 ]; then echo "EQUIVALENCE VERIFIED"; else echo "EQUIVALENCE FAILED"; fi
exit $FAIL
