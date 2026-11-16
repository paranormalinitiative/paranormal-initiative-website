import { readFileSync } from "node:fs";

const api = readFileSync(new URL("../../functions/api/[[path]].js", import.meta.url), "utf8");
const client = readFileSync(new URL("../../member-login.js", import.meta.url), "utf8");
const worker = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../../member-login.html", import.meta.url), "utf8");

const checks = [
  ["member registration route remains public POST", api.includes('path === "/members/register"') && api.includes("handleMemberRegister(request, env)")],
  ["signup creates a session in the same response", api.includes("signedIn: true") && api.includes('"Set-Cookie": `${SESSION_COOKIE}=${sessionToken}')],
  ["signup returns a safe member payload", api.includes("user: privateMemberUser(profile)")],
  ["signup maps duplicate races to a controlled conflict", /unique constraint\|unique failed\|already exists/.test(api) && api.includes("That username or email is already connected")],
  ["signup maps unexpected database failures to a safe retry message", api.includes("Account creation is temporarily unavailable")],
  ["browser uses the returned signup session without a second login", client.includes("registration?.signedIn") && !client.includes("await window.TPIApi.login(username, password);" )],
  ["signup aliases redirect to the canonical form", worker.includes('"/register", "/signup", "/sign-up", "/members/register"') && worker.includes("#register")],
  ["canonical form contains a registration form and inline status", html.includes("data-member-register") && html.includes("data-member-register-status")],
  ["registration script cache version is refreshed", html.includes('member-login.js?v=51')],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
if (failed.length) process.exit(1);
console.log(`TPI member registration source verification passed: ${checks.length} checks.`);
