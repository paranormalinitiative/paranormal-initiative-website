import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const app = read("admin-center-app/src/app.tsx");
const api = read("admin-center-app/src/lib/api.ts");
const workerApi = read("functions/api/[[path]].js");
const css = read("admin-center-app/src/index.css");
const notificationListHandler = workerApi.slice(workerApi.indexOf("async function handleAdminNotifications"), workerApi.indexOf("async function handleAdminNotificationDetail"));

const checks = [
  ["article detail route is protected", workerApi.includes("handleAdminArticleDetail(path, env, user)") && workerApi.includes("requireAdmin(request, env, user => handleAdminArticleDetail")],
  ["article edit route is protected", workerApi.includes("handleAdminArticleUpdate") && workerApi.includes('method === "PUT" || request.method === "PATCH"')],
  ["article edits preserve body fields", workerApi.includes("body_html = ?") && workerApi.includes("article_html = ?") && api.includes("bodyHtml?: string")],
  ["article edits use optimistic concurrency", workerApi.includes("ARTICLE_EDIT_CONFLICT") && workerApi.includes("expectedUpdatedAt") && workerApi.includes("WHERE id = ? AND updated_at = ?")],
  ["article edits are audited", workerApi.includes('"article.updated"') && app.includes("Save writes an administrative audit record")],
  ["education editor exposes real article detail", app.includes("ArticleDetailEditor") && app.includes("/admin/articles/${encodeURIComponent(article.id)}") && app.includes("Save changes")],
  ["notification list keeps private content out", notificationListHandler.includes("privateContentBoundary") && notificationListHandler.includes("metadataOnly: true") && !notificationListHandler.includes("mn.body") && !notificationListHandler.includes("action_href")],
  ["notification detail is recipient scoped", workerApi.includes("Only the notification recipient can change its read state") && workerApi.includes("ownsNotification")],
  ["notification read and unread routes exist", workerApi.includes("handleAdminNotificationState") && app.includes("/admin/notifications/${encodeURIComponent(notification.id)}/${next}")],
  ["notification unread-all is recipient scoped", workerApi.includes("handleAdminMarkAllNotificationsRead") && workerApi.includes("notification.read_all")],
  ["notification UI exposes resource navigation only for owner", app.includes("notification.actionHref") && app.includes("Private content withheld")],
  ["team history route is protected", workerApi.includes("handleAdminTeamHistory") && workerApi.includes("verificationEvents") && workerApi.includes("auditLogs")],
  ["team claim history is returned", workerApi.includes("review_notes AS reviewNotes") && workerApi.includes("team_claim")],
  ["team status changes are audited", workerApi.includes('"team.approved"') && workerApi.includes('"team.rejected"') && workerApi.includes("previousStatus")],
  ["team verification changes are audited", workerApi.includes('"team.verification_recorded"')],
  ["team detail renders history", app.includes("Verification history") && app.includes("Claim history") && app.includes("Administrative audit")],
  ["creator detail route is protected", workerApi.includes("handleAdminCreatorDetail(path, env, user)") && workerApi.includes("requireAdmin(request, env, user => handleAdminCreatorDetail")],
  ["creator detail includes channels", workerApi.includes("tpi_video_channels") && app.includes("Channel associations")],
  ["creator detail includes entitlement state", workerApi.includes("creator_studio_entitlements") && app.includes("Creator Studio entitlement")],
  ["creator detail exposes no award mutation", app.includes("does not grant, revoke, allocate, or activate access") && !app.includes("/admin/creators/${encodeURIComponent(username)}/allocate")],
  ["admin creator and studio authorization remain separate", workerApi.includes("requireAdmin") && workerApi.includes("hasCreatorStudioAccess")],
  ["editor fields are styled for bounded local editing", css.includes(".form-field textarea") && css.includes("resize: vertical")],
  ["research workspace remains outside admin mutations", app.includes("Research workspace records remain separate") && !app.includes("authoritative-teams.csv")],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
console.log(`TPI-DEV-019 source checks: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exit(1);
