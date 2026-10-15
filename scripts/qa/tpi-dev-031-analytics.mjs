import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const app = read("admin-center-app/src/app.tsx");
const api = read("admin-center-app/src/lib/api.ts");
const workerApi = read("functions/api/[[path]].js");
const css = read("admin-center-app/src/index.css");

const checks = [
  ["analytics remains on the protected admin route", workerApi.includes('path === "/admin/analytics"') && workerApi.includes("requireAdmin(request, env")],
  ["member growth includes new and cumulative series", app.includes("Member growth") && app.includes("newMembers") && app.includes("totalMembers") && workerApi.includes("getAdminMemberGrowthSeries")],
  ["community engagement includes posts comments and reactions", app.includes("Community engagement") && app.includes('label: "Posts"') && app.includes('label: "Comments"') && app.includes('label: "Reactions"') && workerApi.includes("communityEngagement")],
  ["membership distribution uses actual membership records or an unavailable state", app.includes("Membership distribution") && app.includes("AnalyticsDonut") && app.includes("membership?.available") && workerApi.includes("creator_partnership_memberships")],
  ["creator activity uses existing creator and content sources", app.includes("Creator activity") && app.includes("Published content") && workerApi.includes("getAdminCreatorEngagement")],
  ["moderation analytics exposes bounded report states", app.includes("Moderation analytics") && app.includes("Pending") && app.includes("Resolved") && app.includes("Dismissed") && workerApi.includes("getAdminModerationAnalytics")],
  ["content overview uses existing published and visible metrics", app.includes("Content overview") && app.includes("contentOverview") && workerApi.includes("contentOverview")],
  ["website analytics cannot be fabricated", app.includes("Website activity") && app.includes("websiteActivity?.reason") && workerApi.includes("No reliable first-party visits or page-views data source")],
  ["interactive chart affordances are present", app.includes("onMouseEnter") && app.includes("onFocus") && app.includes("chart-tooltip") && app.includes("role=\"img\"" )],
  ["chart layout includes responsive and personalization-aware styling", css.includes("analytics-stat-grid") && css.includes("@media (max-width: 720px)") && css.includes("var(--tpi-accent)")],
  ["analytics response types preserve unavailable states", api.includes("AnalyticsUnavailable") && api.includes("membershipDistribution") && api.includes("websiteActivity")]
];

for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
const failed = checks.filter(([, passed]) => !passed);
console.log(`TPI-DEV-031 analytics checks: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exit(1);
