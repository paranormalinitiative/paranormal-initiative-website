#!/usr/bin/env node

// TPI-STUDIOFLOW-037 route regression. Uses only the existing synthetic local
// account and never reads or prints owner credentials, cookies, or tokens.
import { existsSync, readFileSync } from "node:fs";

const base = process.env.TPI_LOCAL_ORIGIN || "http://localhost:8787";
if (!/^http:\/\/(localhost|127\.0\.0\.1):8787$/.test(base)) {
  throw new Error("TPI-037 verification requires the approved local Worker origin");
}

const credentialPath = ".local-dev/local-auth-credentials.json";
if (!existsSync(credentialPath)) throw new Error("synthetic local authentication fixture is missing");
const credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
const account = credentials.accounts?.local_admin;
if (!account?.username || !account?.password) throw new Error("synthetic local administrator fixture is incomplete");

const checks = [];
function check(name, condition) {
  if (!condition) throw new Error(`${name} failed`);
  checks.push(name);
}

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    redirect: "manual",
    ...options,
    headers: { ...(options.headers || {}) },
  });
  return { response, text: await response.text() };
}

const anonymousMember = await request("/member-home?username=local_admin");
check("anonymous clean Member Home route serves a document", anonymousMember.response.status === 200 && anonymousMember.text.includes("data-member-content"));

const anonymousRoot = await request("/");
check("anonymous clean homepage route serves a document", anonymousRoot.response.status === 200 && anonymousRoot.text.includes("data-tpi-local-request-guard"));

const anonymousStudio = await request("/studio/");
check("anonymous clean Studio route remains protected", anonymousStudio.response.status === 403 && anonymousStudio.text.includes("Creator Studio"));

const login = await request("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: account.username, password: account.password }),
});
const setCookie = login.response.headers.get("set-cookie") || "";
const session = setCookie.match(/tpi_session=([^;]+)/)?.[1] || "";
check("synthetic local login succeeds", login.response.status === 200 && Boolean(session));

const cookieHeader = { Cookie: `tpi_session=${session}` };
const authenticatedMember = await request("/member-home?username=local_admin", { headers: cookieHeader });
check("authenticated clean Member Home route renders", authenticatedMember.response.status === 200 && authenticatedMember.text.includes("The Paranormal Initiative"));

const authenticatedStudio = await request("/studio/", { headers: cookieHeader });
check("authenticated clean Studio route renders", authenticatedStudio.response.status === 200 && authenticatedStudio.text.includes("id=\"root\""));

const logout = await request("/api/auth/logout", { method: "POST", headers: cookieHeader });
check("synthetic session logout succeeds", logout.response.status === 200);

console.log(JSON.stringify({
  status: "PASSED",
  origin: base,
  checksPassed: checks.length,
  checks,
  credentialsPrinted: false,
  ownerDataWritten: false,
}));
