import { readFileSync } from "node:fs";

const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const api = read("functions/api/[[path]].js");
const auth = read("lib/auth.js");
const worker = read("worker.js");
const shell = read("member-shell.js");
const sidebar = read("member-sidebar.html");
const liveVideo = read("live-video.html");
const podcast = read("podcast.html");
const devConfig = read("wrangler.dev.toml");

const checks = [
  ["Creator Studio uses the existing entitlement tables", auth.includes("creator_studio_entitlements") && auth.includes("creator_partnership_memberships") && auth.includes("entitlement_state = 'active'")],
  ["Creator Studio defaults to deny when entitlement schema is unavailable", auth.includes("return false") && auth.includes("Older development databases")],
  ["owner/admin Studio access remains preserved", auth.includes('user.role === "owner" || user.role === "admin"')],
  ["Studio HTML is server-gated by the shared capability", worker.includes("hasCreatorStudioAccess(env, user)") && worker.includes('url.pathname === "/studio"')],
  ["Studio APIs have an independent server-side capability gate", api.includes("async function requireStudioAccess") && api.includes("hasCreatorStudioAccess(env, user)")],
  ["Studio room operations use the Studio capability gate", api.includes('path === "/studio/rooms"') && api.includes("requireStudioAccess(request, env")],
  ["Creator guest tokens remain room-owner protected", api.includes("Only the StudioFlow room host can issue guest access") && api.includes("room.host_id !== user.id")],
  ["Live broadcast operations use the Studio capability gate", api.includes('path === "/studio/live-broadcasts"') && api.includes("requireStudioAccess(request, env")],
  ["Creator Studio nav is entitlement-gated on desktop and mobile", sidebar.includes("data-studio-only hidden") && shell.includes("data-studio-only hidden") && shell.includes("user.creatorStudioAccess")],
  ["Unauthorized Studio nav is hidden rather than presented as a disabled privilege", shell.includes('document.querySelectorAll("[data-studio-only]")') && shell.includes("element.hidden = !canUseCreatorStudio")],
  ["Live and podcast launch controls use Studio capability", liveVideo.includes("data-studio-only hidden") && podcast.includes("data-studio-only hidden")],
  ["Administration Center remains separate owner/admin navigation", sidebar.includes("data-admin-only hidden") && shell.includes("canUseAdminPanel") && api.includes("async function requireAdmin")],
  ["Contributor content tools remain separate from Studio and admin access", api.includes("requireContributor") && sidebar.includes("data-contributor-only") && !sidebar.includes('data-studio-only hidden">\n                <span class="nav-icon">⚙</span> Administration')],
  ["Cross-account Studio room ownership check remains enforced", api.includes("room.host_id !== user.id") && api.includes("Only the room host can close this studio")],
  ["Development deployment bindings remain isolated", devConfig.includes('name = "theparanormalinitiative-dev"') && devConfig.includes("tpi_contributor_portal_dev") && devConfig.includes("tpi-contributor-media-dev") && devConfig.includes('TPI_DISABLE_OUTBOUND = "1"')],
  ["No production worker target is introduced", !devConfig.includes('name = "theparanormalinitiative"') && !worker.includes('name = "theparanormalinitiative"')],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
if (failed.length) process.exit(1);
console.log(`TPI-DEV-012 authorization checks: ${checks.length}/${checks.length} passed`);
