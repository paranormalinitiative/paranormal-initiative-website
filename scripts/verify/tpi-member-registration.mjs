import { readFileSync } from "node:fs";

const api = readFileSync(new URL("../../functions/api/[[path]].js", import.meta.url), "utf8");
const client = readFileSync(new URL("../../member-login.js", import.meta.url), "utf8");
const worker = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../../member-login.html", import.meta.url), "utf8");
const memberSurfaceFiles = [
  "member-login.html",
  "member-profile.html",
  "member-dashboard.html",
  "member-notifications.html",
  "contributor-profile.html",
  "contributor-invite.html",
  "admin-panel.html",
  "admin-advanced-settings.html",
  "moderation.html",
  "explore.html",
  "reels.html",
];
const memberSurfaces = memberSurfaceFiles.map(file => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8"));

const checks = [
  ["member registration route remains public POST", api.includes('path === "/members/register"') && api.includes("handleMemberRegister(request, env, context)")],
  ["email verification request and confirmation routes remain registered", api.includes('path === "/auth/verify-email/request"') && api.includes('path === "/auth/verify-email/confirm"') && api.includes("handleVerifyEmailRequest") && api.includes("handleVerifyEmailConfirm")],
  ["verification sends a branded one-time code without blocking signup", api.includes("verificationEmail") && api.includes("context?.waitUntil") && api.includes("welcome verification")],
  ["verification codes are rate-limited and removed when delivery fails", api.includes("verification-request-ip") && api.includes("verification-confirm-ip") && api.includes("DELETE FROM email_verification_tokens WHERE token = ?")],
  ["verification only consumes a code after the member update succeeds", api.includes("UPDATE contributors SET email_verified = 1 WHERE id = ? AND email_verified = 0") && api.includes("UPDATE email_verification_tokens SET used = 1")],
  ["signup creates a session in the same response", api.includes("signedIn: true") && api.includes('"Set-Cookie": `${SESSION_COOKIE}=${sessionToken}')],
  ["signup returns a safe member payload", api.includes("user: privateMemberUser(profile)")],
  ["signup maps duplicate races to a controlled conflict", /unique constraint\|unique failed\|already exists/.test(api) && api.includes("That username or email is already connected")],
  ["signup maps unexpected database failures to a safe retry message", api.includes("Account creation is temporarily unavailable")],
  ["browser uses the returned signup session without a second login", client.includes("registration?.signedIn") && !client.includes("await window.TPIApi.login(username, password);" )],
  ["registration submit button locks during the request and reopens after a controlled error", client.includes("registerSubmitButton.disabled = true") && client.includes("releaseRegisterSubmitButton()") && client.includes('setAttribute("aria-busy", "true")')],
  ["signup aliases redirect to the canonical form", worker.includes('"/register", "/signup", "/sign-up", "/members/register"') && worker.includes("#register")],
  ["canonical form contains a registration form and inline status", html.includes("data-member-register") && html.includes("data-member-register-status")],
  ["registration script cache version is refreshed", html.includes('member-login.js?v=53')],
  ["member-facing profile and support pages use the same current script version", memberSurfaces.every(surface => surface.includes('member-login.js?v=53'))],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
if (failed.length) process.exit(1);
console.log(`TPI member registration source verification passed: ${checks.length} checks.`);
