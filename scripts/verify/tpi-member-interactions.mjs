#!/usr/bin/env node

// Cross-browser member interaction regression checks. These are intentionally
// source-level checks for the shared navigation, notification deep links, and
// community share surface so browser-specific behavior cannot silently return.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("../..", import.meta.url)));
const read = file => readFileSync(join(root, file), "utf8");
const checks = [];
const check = (label, pass) => {
  checks.push({ label, pass: Boolean(pass) });
  console.log(`${pass ? "PASS" : "FAIL"} ${label}`);
};

const worker = read("worker.js");
const shell = read("member-shell.js");
const login = read("member-login.js");
const home = read("member-home.html");
const api = read("functions/api/[[path]].js");

check("Administration Center uses the shared effective staff-role resolver", worker.includes('import { effectiveStaffRole } from "./lib/staff-roles.js"') && worker.includes("const role = await effectiveStaffRole(env, user)") && worker.includes('["owner", "executive", "full_administrator", "administrator"].includes(role)'));
check("Owner and server-authorized accounts keep the Administration Center visible", shell.includes("var canUseAdminPanel = serverAdminAccess") && shell.includes('role === "owner"') && shell.includes('"owner", "executive", "full_administrator", "administrator"'));
check("Community notifications carry exact post and comment targets", api.includes("&post=${encodeURIComponent(content.postId)}&comment=${encodeURIComponent(content.commentId)}#${postTarget}") && api.includes('type: content.isComment ? "community_comment" : "community_post"') && api.includes("enrichCommunityNotificationTargets"));
check("Authenticated members can use the profile photo and banner upload routes", api.includes('path === "/uploads/profile-photo"') && api.includes('path === "/uploads/profile-banner"') && api.includes("requireMember(request, env, user => handleProfilePhotoUpload") && api.includes("requireMember(request, env, user => handleProfileBannerUpload"));
check("Profile editor keeps recovery email optional for media saves", !read("member-profile.html").includes('name="correspondence" type="email" autocomplete="email" required') && login.includes('correspondence: String(data.get("correspondence") || "").trim(),'));
check("Profile save preserves an existing email when the submitted field is blank", api.includes("const currentCorrespondence = clean(user.correspondence).toLowerCase();") && api.includes("const correspondence = submittedCorrespondence || currentCorrespondence;") && api.includes("if (submittedCorrespondence && !submittedCorrespondence.includes(\"@\"))"));
check("Profile media is validated before storage and is recorded in the contributor profile", api.includes("upload.type = profileImageContentType(upload);") && api.includes("if (upload.size > 12 * 1024 * 1024)") && api.includes("await env.TPI_MEDIA.put(key, upload.body") && api.includes("UPDATE contributors SET photo_url") && api.includes("UPDATE contributors SET profile_banner_url"));
check("Profile editor uploads both selected files before saving the profile", login.includes("const uploadedPhoto = profileSubmitForm.querySelector") && login.includes("const uploadedBanner = profileSubmitForm.querySelector") && login.includes("await window.TPIApi.uploadProfilePhoto(uploadedPhoto)") && login.includes("await window.TPIApi.uploadProfileBanner(uploadedBanner)") && login.includes("await window.TPIApi.updateProfile(payload)"));
check("Notification Open actions are normal links that do not wait on readiness", login.includes('<a class="portal-button portal-button-secondary" href="${escapeHtml(actionHref)}"') && login.includes("must never block the deep link") && !login.includes("if (!notificationHref || !await cloudflareReady()) return;"));
check("Notification timestamps treat SQLite values as UTC", login.includes("function parseNotificationDate(value)") && login.includes("SQLite CURRENT_TIMESTAMP is UTC") && login.includes('raw.replace(sqliteUtc, "$1T$2Z")') && login.includes('title="${escapeHtml(createdAt)}"'));
check("Notification post links retry focus after feed layout settles", home.includes("if (attempt < 20)") && home.includes("if (!commentId && (!inView || attempt === 0)) card.scrollIntoView({ block: \"center\", behavior: attempt === 0 ? \"smooth\" : \"auto\" });") && home.includes("if (attempt < 8) window.setTimeout(function() { focusPostFromHash(attempt + 1); }, 250);"));
check("Notification post links open and highlight the person's comment", home.includes("function getRequestedCommentId()") && home.includes("function focusNotificationComment(card, commentId)") && home.includes("function settleNotificationComment(comment, attempt)") && home.includes('panel.hidden = false;') && home.includes('comment.classList.add("is-notification-target")'));
check("Feed and comment dates treat SQLite values as UTC", home.includes("function parseMemberDate(value)") && home.includes('raw.replace(sqliteUtc, "$1T$2Z")') && home.includes("var d = parseMemberDate(value);"));
check("Community share opens the same in-page choices in every browser", home.includes("showShareModal(url, title);") && !home.includes("if (navigator.share) {\n            navigator.share({ title: title, url: url })"));
check("Community composer keeps a multi-line opening title out of the body", home.includes("var bodyForPost = body;") && home.includes("var firstBreak = body.search(/\\r?\\n/);") && home.includes("body: bodyForPost || title"));
check("Legacy community posts do not render an auto-title twice", home.includes("function shouldRenderCommunityPostTitle(title, body)") && home.includes("!normalizedBody.startsWith(normalizedTitle)") && home.includes("var showPostTitle = shouldRenderCommunityPostTitle(item.title, item.body)"));

const failed = checks.filter(row => !row.pass);
console.log(`\nMember interaction verification: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exitCode = 1;
