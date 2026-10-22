#!/bin/zsh

set -euo pipefail

repo_root="${0:A:h:h}"
credential_file="$repo_root/.local-dev/local-auth-credentials.json"

if [[ ! -t 0 || ! -t 1 ]]; then
  print -u2 "Refusing to display credentials outside an interactive owner Terminal."
  exit 2
fi

if [[ ! -f "$credential_file" ]]; then
  print -u2 "The protected local credential file is missing. Run the documented local_admin recovery procedure."
  exit 2
fi

permission_mode="$(stat -f '%Lp' "$credential_file")"
if [[ "$permission_mode" != "600" ]]; then
  print -u2 "The protected credential file must have permission mode 0600; current mode is $permission_mode."
  exit 2
fi

node_bin="${TPI_NODE_BIN:-$(command -v node || true)}"
if [[ -z "$node_bin" || ! -x "$node_bin" ]]; then
  print -u2 "Node.js is unavailable in this Terminal."
  exit 2
fi

print "This displays the local-only development administrator password in this Terminal."
print "It must never be pasted into chat, committed, or used on the production website."
print -n "Type SHOW to continue: "
read -r confirmation
if [[ "$confirmation" != "SHOW" ]]; then
  print "Canceled."
  exit 1
fi

"$node_bin" --input-type=module - "$credential_file" <<'NODE'
import { readFileSync } from "node:fs";

const path = process.argv[2];
const credentials = JSON.parse(readFileSync(path, "utf8"));
const account = credentials?.accounts?.local_admin;
if (account?.username !== "local_admin" || typeof account?.password !== "string" || account.password.length < 12) {
  throw new Error("The protected local_admin credential is unavailable or invalid.");
}
console.log("\nLocal development only");
console.log(`URL: http://127.0.0.1:8787/member-login.html`);
console.log(`Username: ${account.username}`);
console.log(`Password: ${account.password}`);
console.log("\nClose this Terminal after signing in.");
NODE
