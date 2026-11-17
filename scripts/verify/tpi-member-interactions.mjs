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
const profile = read("member-profile.html");
const productionConfig = read("wrangler.toml");

check("Administration Center uses the shared effective staff-role resolver", worker.includes('effectiveStaffRole, hasAdministrationCenterRole') && worker.includes("const role = await effectiveStaffRole(env, user)") && worker.includes("hasAdministrationCenterRole(role)"));
check("Owner and server-authorized accounts keep the Administration Center visible", shell.includes("var canUseAdminPanel = serverAdminAccess") && shell.includes('role === "owner"') && shell.includes('"owner", "executive", "full_administrator", "administrator"'));
check("Community notifications carry exact post and comment targets", api.includes("&post=${encodeURIComponent(content.postId)}&comment=${encodeURIComponent(content.commentId)}#${postTarget}") && api.includes('type: content.isComment ? "community_comment" : "community_post"') && api.includes("enrichCommunityNotificationTargets"));
check("Authenticated members can use the profile photo and banner upload routes", api.includes('path === "/uploads/profile-photo"') && api.includes('path === "/uploads/profile-banner"') && api.includes("requireMember(request, env, user => handleProfilePhotoUpload") && api.includes("requireMember(request, env, user => handleProfileBannerUpload"));
check("Profile editor keeps recovery email optional for media saves", !read("member-profile.html").includes('name="correspondence" type="email" autocomplete="email" required') && login.includes('correspondence: String(data.get("correspondence") || "").trim(),'));
check("Profile save preserves an existing email when the submitted field is blank", api.includes("const currentCorrespondence = clean(user.correspondence).toLowerCase();") && api.includes("const correspondence = submittedCorrespondence || currentCorrespondence;") && api.includes("if (submittedCorrespondence && !submittedCorrespondence.includes(\"@\"))"));
check("Profile media is validated before storage and is recorded in the contributor profile", api.includes("upload.type = profileImageContentType(upload);") && api.includes("if (upload.size > 12 * 1024 * 1024)") && api.includes("await env.TPI_MEDIA.put(key, upload.body") && api.includes("UPDATE contributors SET photo_url") && api.includes("UPDATE contributors SET profile_banner_url"));
check("Profile editor uploads both selected files before saving the profile", login.includes("const uploadedPhoto = profileSubmitForm.querySelector") && login.includes("const uploadedBanner = profileSubmitForm.querySelector") && login.includes("await window.TPIApi.uploadProfilePhoto(uploadedPhoto)") && login.includes("await window.TPIApi.uploadProfileBanner(uploadedBanner)") && login.includes("await window.TPIApi.updateProfile(payload)"));
check("Notification Open actions mark read before following the deep link", login.includes('<a class="portal-button portal-button-secondary" href="${escapeHtml(actionHref)}"') && login.includes("function markNotificationReadBeforeNavigation") && login.includes("navigator.sendBeacon") && login.includes("keepalive: true") && login.includes("event.preventDefault();") && !login.includes("must never block the deep link"));
check("Notification timestamps treat SQLite values as UTC", login.includes("function parseNotificationDate(value)") && login.includes("SQLite CURRENT_TIMESTAMP is UTC") && login.includes('raw.replace(sqliteUtc, "$1T$2Z")') && login.includes('title="${escapeHtml(createdAt)}"'));
check("Notification post links retry focus after feed layout settles", home.includes("if (attempt < 20)") && home.includes("if (!commentId && (!inView || attempt === 0)) card.scrollIntoView({ block: \"center\", behavior: attempt === 0 ? \"smooth\" : \"auto\" });") && home.includes("if (attempt < 8) window.setTimeout(function() { focusPostFromHash(attempt + 1); }, 250);"));
check("Notification post links open and highlight the person's comment", home.includes("function getRequestedCommentId()") && home.includes("function focusNotificationComment(card, commentId)") && home.includes("function settleNotificationComment(comment, attempt)") && home.includes('panel.hidden = false;') && home.includes('comment.classList.add("is-notification-target")'));
check("Feed and comment dates treat SQLite values as UTC", home.includes("function parseMemberDate(value)") && home.includes('raw.replace(sqliteUtc, "$1T$2Z")') && home.includes("var d = parseMemberDate(value);"));
check("Community share opens the same in-page choices in every browser", home.includes("showShareModal(url, title);") && !home.includes("if (navigator.share) {\n            navigator.share({ title: title, url: url })"));
check("Community composer keeps a multi-line opening title out of the body", home.includes("var bodyForPost = body;") && home.includes("var firstBreak = body.search(/\\r?\\n/);") && home.includes("body: bodyForPost || title"));
check("Legacy community posts do not render an auto-title twice", home.includes("function shouldRenderCommunityPostTitle(title, body)") && home.includes("!normalizedBody.startsWith(normalizedTitle)") && home.includes("var showPostTitle = shouldRenderCommunityPostTitle(item.title, item.body)"));
check("Community composer uses rectangular, responsive text and attachment controls", home.includes(".composer-textarea") && home.includes("border-radius: 12px;") && home.includes("box-sizing: border-box;") && home.includes(".composer-media-btn") && home.includes("border-radius: 8px;") && home.includes(".composer-preview-item") && home.includes("width: 148px;") && home.includes("height: 88px;") && home.includes("border-radius: 12px;") && home.includes(".composer-link-input") && home.includes("border-radius: 8px;"));
check("Community previews hydrate both saved links and URLs found in post text", home.includes("function linkPreviewUrlsForPost(item)") && home.includes("item.attachments") && home.includes("String(item.body || \"\").match(/https?:\\/\\/[^\\s<>\"']+/gi)") && home.includes("var links = linkPreviewUrlsForPost(item)"));
check("External page previews show their image or safe live preview without a click", home.includes("external-page-preview-static") && home.includes("external-page-preview-live") && home.includes("<iframe class=\"external-page-preview-frame\"") && home.includes("Open interactive preview</a>") && !home.includes("data-external-page-play"));
check("Public profiles show the short bio and the Update Profile link opens the editor", home.includes('data-member-short-bio') && home.includes('href="/member-profile.html#profile-editor"') && home.includes('profileEditLink.href = "/member-profile.html#profile-editor"') && home.includes('data-profile-option-edit'));
check("Profile editor provides a protected 175-character short bio", profile.includes('<span>Short Bio</span>') && profile.includes('name="bio" rows="4" maxlength="175"') && profile.includes('data-bio-count') && api.includes('clean(data.bio).slice(0, 175)'));
check("Production preserves the direct profile editor document route", productionConfig.includes('[assets]') && productionConfig.includes('html_handling = "none"') && home.includes('href="/member-profile.html#profile-editor"'));
check("Messenger chat previews stay concise and separate from the member roster", shell.includes("function getChatListPreview(chat)") && shell.includes("preview.length > 88") && shell.includes("var preview = getChatListPreview(savedChat)") && read("member-shell.css").includes(".member-chat-list-open .member-chat-presence") && read("member-shell.css").includes("text-overflow: ellipsis") && read("member-shell.css").includes("flex: 1 1 0"));
check("Messenger shows friends by default but can search non-friends for direct chats", api.includes('path === "/messenger/roster"') && api.includes("handleMessengerRoster") && shell.includes('"/api/messenger/roster"') && shell.includes('placeholder="Search friends or members"') && shell.includes('data-chat-friend'));
check("Messenger friends stay pinned to the top of the contacts column", read("member-shell.css").includes(".member-chat-online-list") && read("member-shell.css").includes("align-content: start") && read("member-shell.css").includes("grid-auto-rows: max-content") && read("member-shell.css").includes("flex: 0 1 auto"));
check("Profile Chat opens the profile member instead of the previously selected chat", home.includes("window.TPIMessenger.openDirectChat(target)") && home.includes("profileUser && profileUser.username") && shell.includes("async function openDirectChat(member)") && shell.includes("openDirectChat: openDirectChat"));
check("New Chat is a direct-chat chooser and never asks for a room name", shell.includes('conversationBuilderMode === "chat"') && shell.includes('createSubmitEl.hidden = conversationBuilderMode === "chat"') && shell.includes('chatNameLabelEl.hidden = conversationBuilderMode === "manage" || conversationBuilderMode === "chat"') && shell.includes("Choose one member to start a direct chat"));
check("Messenger accepts MP4 video and ZIP document attachments", shell.includes('accept="image/*,video/*,.mp4,.m4v,.mov,.webm"') && shell.includes('accept=".txt,.pdf,.zip,text/plain,application/pdf,application/zip,application/x-zip-compressed"') && api.includes('"application/zip"'));
check("Media uploads normalize browser-specific MP4 and ZIP MIME labels", api.includes("function normalizeUploadContentType(upload)") && api.includes('application/x-zip-compressed') && api.includes('mp4: "video/mp4"') && api.includes('zip: "application/zip"') && api.includes("upload.type = normalizeUploadContentType(upload)"));
check("Media responses recover a usable type for older objects", api.includes("try { object.writeHttpMetadata(headers); } catch (error) {}") && api.includes("function mediaContentTypeFromKey(key)"));
check("Messenger media authorization compares attachment URLs after JSON parsing", api.includes("attachments IS NOT NULL") && api.includes("Do the URL comparison after JSON parsing") && !api.includes("attachments LIKE ?"));
check("Messenger and community text controls support plain-text paste", shell.includes("function bindPlainTextPaste(element, multiline)") && shell.includes("element.setRangeText(text, start, end, \"end\")") && home.includes("function bindPlainTextPasteControls()") && home.includes("textarea[data-comment-input]") && home.includes("textarea[data-edit-textarea]") && home.includes("target.setRangeText(text, start, end, \"end\")"));
check("Community file selection classifies MP4 by extension when browsers omit its MIME", home.includes("/\\.(mp4|m4v|mov|webm)$/i.test(file.name || \"\")") && home.includes(".zip,application/zip,application/x-zip-compressed"));
check("Published Nova Education articles are part of the shared member-home discovery feed", api.includes("const socialOnly = url.searchParams.get(\"scope\") === \"community\";") && api.includes("'article' AS type") && home.includes("window.TPIApi.communityFeed(FEED_LIMIT, feedOffset);" ) && home.includes("window.TPIApi.userFeed(profileUser.username, FEED_LIMIT, feedOffset)"));
check("The member-home refresh notice detects a newly published article as well as a new community post", home.includes("var latest = (latestData.items || [])[0];") && home.includes("getAttribute(\"data-article-id\")") && home.includes("var latestKey = latest ? String(latest.type || \"\")"));

const failed = checks.filter(row => !row.pass);
console.log(`\nMember interaction verification: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exitCode = 1;
