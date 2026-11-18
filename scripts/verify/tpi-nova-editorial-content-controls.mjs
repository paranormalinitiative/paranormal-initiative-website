import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const repoRoot = new URL("../../", import.meta.url);
const api = readFileSync(new URL("functions/api/[[path]].js", repoRoot), "utf8");
const nova = readFileSync(new URL("lib/nova.js", repoRoot), "utf8");
const editor = readFileSync(new URL("paper-editor.js", repoRoot), "utf8");
const editorHtml = readFileSync(new URL("paper-editor.html", repoRoot), "utf8");
const client = readFileSync(new URL("api-client.js", repoRoot), "utf8");

const checks = [
  ["workspace routes accept only contributors or effective editorial managers", api.includes("requireEditorialWorkspaceAccess(request, env, user => handleCreateArticle") && api.includes("EDITORIAL_CONTENT_MANAGER_ROLES")],
  ["author ownership remains enforced", api.includes("existingArticle.created_by !== user.id && !editorialManager") && api.includes("You can only delete your own articles")],
  ["unpublished article deletion is a recoverable soft removal", api.includes("UPDATE articles SET status = 'deleted'") && api.includes("editorialHistoryPreserved: true") && api.includes("article.author_removed")],
  ["published document removal preserves the Education Center snapshot", api.includes("status = 'archived'") && api.includes("publicEducationCenterPreserved: true") && api.includes("article.document_removed")],
  ["manager edits preserve the article owner", api.includes("WHERE articles.created_by = excluded.created_by OR ? = 1") && api.includes("ownerId: existingArticle.created_by")],
  ["linked Nova documents stay owned by their author during manager edits", api.includes("itemOwnerId = article.created_by") && nova.includes("const ownerId = options.ownerId || user.id") && nova.includes("WHERE id = ? AND owner_id = ? AND version = ?")],
  ["manager Nova edits are audited", api.includes("article.nova_document_updated_by_manager") && api.includes("updateNovaItemForOwner(env, user, resolved.article.nova_item_id, data || {}, { ownerId: resolved.itemOwnerId })")],
  ["workspace managers can load all content through the protected admin list", editor.includes("window.TPIApi.adminArticles({ status: \"all\", includeContent: true, pageSize: 100 })") && client.includes("adminArticles:") && api.includes("includeContent = url.searchParams.get(\"includeContent\") === \"1\"")],
  ["deleted content is separated from editable drafts", editor.includes('const removed = articles.filter(article => article.status === "deleted")') && editor.includes('renderContentLibrarySection("Removed", removed)')],
  ["paper editor exposes a visible safe current-document delete action", editorHtml.includes('class="nova-document-action nova-document-action-danger" data-action="content-delete-current"') && editor.includes('Move this document to Trash?') && editor.includes('if (action === "content-delete-current") deleteContentArticle(currentArticleId)')],
  ["published content is separated into its own Nova list", editor.includes('all: a => a.status !== "deleted" && a.status !== "published"') && editor.includes('published: a => a.status !== "deleted" && a.publicationState === "published"') && editorHtml.includes('data-nova-filter="published"')],
  ["Documents is the single workspace collection navigation", !editorHtml.includes('data-nova-filter="mine"') && !editor.includes('mine: a =>') && editorHtml.includes('data-nova-filter="all"')],
  ["compatibility migration cannot flash before Nova opens", editorHtml.includes('editor-booting') && editor.includes('function finishEditorBoot()') && editor.includes('document.body.classList.remove("editor-booting")')],
  ["workspace removal uses the document-scoped route while admin moderation stays separate", editor.includes("window.TPIApi.deleteArticle(articleId)") && client.includes("deleteAdminArticle:") && api.includes('path.match(/^\\/admin\\/articles\\/[^/]+$/)')],
  ["login exposes the server-resolved staff appointment to the editor", api.includes("staffIdentity: await publicStaffIdentity(env, user)") && editor.includes("staffIdentity: result.user.staffIdentity")],
];

for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
assert.equal(checks.filter(([, passed]) => !passed).length, 0, "Nova editorial content-control contract failed");
console.log(`TPI-NOVA editorial content controls: ${checks.length}/${checks.length} passed`);
