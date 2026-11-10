#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const checks = [];
function check(name, passed, detail = "") {
  checks.push({ name, passed: Boolean(passed), detail });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}
const api = readFileSync(resolve(root, "functions/api/[[path]].js"), "utf8");
const sidebar = readFileSync(resolve(root, "member-sidebar.html"), "utf8");
const shell = readFileSync(resolve(root, "member-shell.js"), "utf8");
const memberShellCss = readFileSync(resolve(root, "member-shell.css"), "utf8");
const migration = readFileSync(resolve(root, "migrations/0065_member_social_and_bug_reports.sql"), "utf8");
const friends = readFileSync(resolve(root, "friends.html"), "utf8");

check("Friends page exists", existsSync(resolve(root, "friends.html")));
check("Report a bug page exists", existsSync(resolve(root, "bug-report.html")));
check("member navigation exposes Friends", sidebar.includes('data-nav="friends"') && sidebar.includes("Friends"));
check("member navigation exposes Report a bug", sidebar.includes('data-nav="bug-report"') && sidebar.includes("Report a bug"));
check("Friends routes are authenticated", api.includes('path === "/friends"') && api.includes('path === "/friends/follow"') && api.includes('path === "/friends/unfollow"') && api.includes('requireMember'));
check("Bug reports are authenticated", api.includes('path === "/bug-reports"') && api.includes('requireMember'));
check("Bug reports enter the protected admin queue", api.includes("'bug' AS reportType") && api.includes("member_bug_reports") && api.includes("reportType === \"messenger\""));
check("Messenger identities preserve a readable name and username", shell.includes("chatMemberName") && shell.includes("chatMemberUsername") && shell.includes("member-chat-author-username"));
check("Chat navigation is the authenticated Messenger home", sidebar.includes('data-nav="chat"') && sidebar.includes('data-messenger-trigger') && sidebar.includes('aria-controls="member-floating-chat"'));
check("Chat navigation opens and restores Messenger", shell.includes("setupMessengerNavigation") && shell.includes("window.TPIMessenger.show") && shell.includes("isOpen"));
check("Mobile navigation exposes the Messenger home", shell.includes('class="mobile-nav-link" href="#messenger" data-nav="chat"') && shell.includes('data-messenger-trigger aria-controls="member-floating-chat"'));
check("Hide returns Messenger to navigation state", shell.includes('chat.classList.add("is-hidden")') && shell.includes("syncMessengerNavigationState(!collapsed)"));
check("Messenger frame persistence survives hide and restore", shell.includes("hidden: false") && shell.includes("frame.hidden || frame.collapsed") && shell.includes("storeChatFrame(chat)"));
check("Messenger drag and resize hooks remain wired", shell.includes("setupFloatingChatDrag(chat)") && shell.includes("setupFloatingChatResize(chat)") && shell.includes("pointermove"));
check("Messenger labels and previews wrap without clipping", memberShellCss.includes("overflow-wrap: anywhere") && memberShellCss.includes("white-space: normal") && memberShellCss.includes("member-chat-list-open .member-chat-presence"));
check("Migration creates follow and bug-report storage", migration.includes("CREATE TABLE IF NOT EXISTS member_follows") && migration.includes("CREATE TABLE IF NOT EXISTS member_bug_reports"));
check("Friends page uses shared member panel styling", friends.includes('class="member-panel social-panel"') && friends.includes('class="member-section-title"'));
check("Friends controls use shared member-mode controls", friends.includes('class="member-input"') && friends.includes('class="member-btn member-btn-primary"') && friends.includes('class="member-btn member-btn-secondary member-btn-sm"'));
check("Friends panel restores padding after the member section reset", friends.includes("body.member-mode .social-panel { padding: 24px; }") && friends.includes("body.member-mode .social-panel { padding: 18px; }"));
check("Friends layout has a responsive mobile mode", friends.includes("@media (max-width: 640px)") && friends.includes("grid-template-columns: 1fr") && friends.includes("width: 100%"));

const passed = checks.filter((item) => item.passed).length;
console.log(JSON.stringify({ status: passed === checks.length ? "PASS" : "FAIL", passed, total: checks.length, results: checks }, null, 2));
process.exit(passed === checks.length ? 0 : 1);
