#!/usr/bin/env bash
# TPI-OPS-029: dedicated LaunchAgent for the disposable E2E Worker (port 8789).
# Independent of com.tpi.local-development. Never touches the owner's agent,
# port 8787, .local-dev/state or .local-dev/local-auth-credentials.json.
# Usage: scripts/e2e/isolated-launchagent.sh install|start|stop|status|uninstall
set -u
LABEL="com.tpi.isolated-e2e"
OWNER_LABEL="com.tpi.local-development"
[ "$LABEL" != "$OWNER_LABEL" ] || { echo "label collision with owner agent"; exit 2; }

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
TEST_ROOT="$(node -e 'console.log(require("os").tmpdir())')/tpi-isolated-e2e"
LOG_DIR="$TEST_ROOT/logs"
NODE_BIN="$(command -v node)"
WRANGLER_BIN="$(command -v wrangler || echo /opt/homebrew/bin/wrangler)"
DOMAIN="gui/$(id -u)"
TARGET="$DOMAIN/$LABEL"

write_plist() {
  mkdir -p "$HOME/Library/LaunchAgents" "$LOG_DIR"
  cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE_BIN</string>
    <string>$REPO/scripts/e2e/isolated-worker.mjs</string>
    <string>start</string>
  </array>
  <key>WorkingDirectory</key><string>$REPO</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    <key>WRANGLER_BIN</key><string>$WRANGLER_BIN</string>
    <key>TPI_ENV</key><string>local</string>
    <key>TPI_LOCAL_ONLY</key><string>1</string>
    <key>TPI_DISABLE_OUTBOUND</key><string>1</string>
  </dict>
  <key>RunAtLoad</key><false/>
  <key>KeepAlive</key><false/>
  <key>ProcessType</key><string>Interactive</string>
  <key>StandardOutPath</key><string>$LOG_DIR/isolated-worker.stdout.log</string>
  <key>StandardErrorPath</key><string>$LOG_DIR/isolated-worker.stderr.log</string>
</dict>
</plist>
PLIST
}

loaded() { launchctl print "$TARGET" >/dev/null 2>&1; }

case "${1:-status}" in
  install)
    write_plist
    loaded && launchctl bootout "$TARGET" >/dev/null 2>&1
    launchctl bootstrap "$DOMAIN" "$PLIST" && echo "installed $LABEL (not started)" ;;
  start)
    [ -f "$PLIST" ] || write_plist
    loaded || launchctl bootstrap "$DOMAIN" "$PLIST"
    launchctl kickstart "$TARGET" && echo "started $LABEL" ;;
  stop)
    loaded && launchctl bootout "$TARGET" && echo "stopped $LABEL" || echo "$LABEL not loaded" ;;
  status)
    echo "label: $LABEL  plist: $PLIST"
    loaded && echo "loaded: yes" || echo "loaded: no"
    curl -s -o /dev/null -w 'isolated :8789 http=%{http_code}\n' --max-time 3 http://127.0.0.1:8789/api/community/categories ;;
  uninstall)
    loaded && launchctl bootout "$TARGET" >/dev/null 2>&1
    rm -f "$PLIST" && echo "uninstalled $LABEL" ;;
  *) echo "usage: $0 install|start|stop|status|uninstall"; exit 2 ;;
esac
