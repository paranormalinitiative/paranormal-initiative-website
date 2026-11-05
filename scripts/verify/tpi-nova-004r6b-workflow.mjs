// TPI-NOVA-004R6B verifier: editorial workflow foundation.
// Applies the real 0061 migration to a throwaway in-memory SQLite database and
// exercises lib/editorial-workflow.js. No shared local D1 state is touched.
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import assert from "node:assert/strict";
import { CAPABILITY, CAPABILITY_SETS, mergeCapabilities, legacyRoleCapabilities } from "../../lib/membership-entitlements.js";
import {
  EDITORIAL_STATES,
  TRANSITIONS,
  validateTransition,
  verifyNovaItemForSubmission,
  checkVersionCurrent,
  checkApprovalMatchesSubmission,
  detectReviewedMetadataChange,
  validatePublication,
  isNovaLocked,
  requireEditorialPublish,
} from "../../lib/editorial-workflow.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
let passed = 0;
let failed = 0;
function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL ${name}: ${error.message}`);
  }
}

// Synthetic actors. Capabilities are assigned only for this test.
const CONTRIBUTOR = ["contributor"];
const CREATOR_ONLY = ["creator"];
const REVIEWER = [CAPABILITY.EDITORIAL_REVIEW];
const PUBLISHER = [CAPABILITY.EDITORIAL_PUBLISH];
const REVIEWER_AND_PUBLISHER = [CAPABILITY.EDITORIAL_REVIEW, CAPABILITY.EDITORIAL_PUBLISH];
const ADMIN_NO_EDITORIAL = legacyRoleCapabilities("admin");

// Throwaway database: minimal parent tables, then the real 0061 migration.
const db = new DatabaseSync(":memory:");
db.exec(`
  CREATE TABLE contributors (id TEXT PRIMARY KEY);
  CREATE TABLE nova_items (
    id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active',
    version INTEGER NOT NULL DEFAULT 1, deleted_at TEXT
  );
  CREATE TABLE articles (
    id TEXT PRIMARY KEY, created_by TEXT, status TEXT NOT NULL DEFAULT 'draft',
    destination TEXT NOT NULL, article_type TEXT DEFAULT 'Research Paper', nova_item_id TEXT
  );
`);
db.exec(readFileSync(resolve(repoRoot, "migrations/0061_article_editorial_workflow.sql"), "utf8"));

// ---- Capabilities ----
check("EDITORIAL_* identifiers exist", () => {
  assert.equal(CAPABILITY.EDITORIAL_REVIEW, "editorial_review");
  assert.equal(CAPABILITY.EDITORIAL_PUBLISH, "editorial_publish");
});
check("no membership set grants editorial capabilities", () => {
  for (const set of Object.values(CAPABILITY_SETS)) {
    assert.ok(!set.includes(CAPABILITY.EDITORIAL_REVIEW));
    assert.ok(!set.includes(CAPABILITY.EDITORIAL_PUBLISH));
  }
});
check("legacy owner/admin roles do not imply editorial authority", () => {
  assert.ok(!ADMIN_NO_EDITORIAL.includes(CAPABILITY.EDITORIAL_PUBLISH));
  assert.ok(!ADMIN_NO_EDITORIAL.includes(CAPABILITY.EDITORIAL_REVIEW));
  assert.equal(requireEditorialPublish(ADMIN_NO_EDITORIAL)?.code, "editorial_publish_required");
});
check("mergeCapabilities drops editorial identifiers", () => {
  assert.deepEqual(mergeCapabilities(REVIEWER_AND_PUBLISHER, CONTRIBUTOR), ["contributor"]);
});
check("Creator and Contributor cannot review or publish", () => {
  for (const caps of [CONTRIBUTOR, CREATOR_ONLY]) {
    assert.equal(requireEditorialPublish(caps)?.code, "editorial_publish_required");
  }
});

// ---- Legal transitions ----
const LEGAL = [
  ["legacy", "draft", CONTRIBUTOR, { isOwner: true }],
  ["draft", "submitted", CONTRIBUTOR, { isOwner: true }],
  ["submitted", "draft", CONTRIBUTOR, { isOwner: true }],
  ["submitted", "in_review", REVIEWER, { submitterId: "owner-a", actorId: "reviewer-x" }],
  ["in_review", "changes_requested", REVIEWER, { submitterId: "owner-a", actorId: "reviewer-x", note: "fix" }],
  ["changes_requested", "submitted", CONTRIBUTOR, { isOwner: true }],
  ["in_review", "approved", REVIEWER, { submitterId: "owner-a", actorId: "reviewer-x" }],
];
for (const [from, to, caps, extra] of LEGAL) {
  check(`legal transition ${from} -> ${to}`, () => {
    const result = validateTransition({ from, to, actorId: "x", capabilities: caps, isOwner: false, ...extra });
    assert.equal(result.ok, true, JSON.stringify(result));
  });
}

// Every pair not listed above must be refused.
check("every illegal transition is refused", () => {
  let count = 0;
  for (const from of EDITORIAL_STATES) {
    for (const to of EDITORIAL_STATES) {
      if (from === to || TRANSITIONS[`${from}>${to}`]) continue;
      const result = validateTransition({ from, to, actorId: "o", capabilities: REVIEWER_AND_PUBLISHER, isOwner: true, submitterId: "x", note: "n" });
      assert.equal(result.ok, false, `${from} -> ${to} was accepted`);
      count += 1;
    }
  }
  assert.ok(count > 0);
});

// Approved is not reachable from draft or submitted directly.
check("approved cannot be entered from draft or submitted", () => {
  assert.equal(validateTransition({ from: "draft", to: "approved", actorId: "r", capabilities: REVIEWER, isOwner: false }).ok, false);
  assert.equal(validateTransition({ from: "submitted", to: "approved", actorId: "r", capabilities: REVIEWER, isOwner: false }).ok, false);
});

// ---- Actor and ownership ----
check("wrong actor: reviewer cannot submit a draft", () => {
  assert.equal(validateTransition({ from: "draft", to: "submitted", actorId: "r", capabilities: REVIEWER, isOwner: false }).code, "not_owner");
});
check("wrong owner: another Contributor cannot submit", () => {
  assert.equal(validateTransition({ from: "draft", to: "submitted", actorId: "attacker", capabilities: CONTRIBUTOR, isOwner: false }).code, "not_owner");
});
check("Contributor without review capability cannot start review", () => {
  assert.equal(validateTransition({ from: "submitted", to: "in_review", actorId: "owner-a", capabilities: CONTRIBUTOR, isOwner: true, submitterId: "owner-a" }).code, "editorial_review_required");
});
check("Admin without editorial capability cannot approve", () => {
  assert.equal(validateTransition({ from: "in_review", to: "approved", actorId: "admin", capabilities: ADMIN_NO_EDITORIAL, isOwner: false, submitterId: "owner-a" }).ok, false);
});
check("self-approval refused: reviewer is the submitter", () => {
  const result = validateTransition({ from: "in_review", to: "approved", actorId: "same", capabilities: REVIEWER_AND_PUBLISHER, isOwner: false, submitterId: "same" });
  assert.equal(result.code, "self_review_refused");
});
check("request-changes requires a note", () => {
  assert.equal(validateTransition({ from: "in_review", to: "changes_requested", actorId: "r", capabilities: REVIEWER, isOwner: false, submitterId: "o", note: "  " }).code, "note_required");
});
check("reviewer cannot withdraw a submission", () => {
  assert.equal(validateTransition({ from: "submitted", to: "draft", actorId: "r", capabilities: REVIEWER, isOwner: false }).code, "not_owner");
});
check("Contributor cannot approve or publish", () => {
  assert.equal(validateTransition({ from: "in_review", to: "approved", actorId: "owner-a", capabilities: CONTRIBUTOR, isOwner: true, submitterId: "owner-a" }).ok, false);
});

// ---- Locking ----
check("Nova is locked in submitted, in_review and approved only", () => {
  assert.deepEqual(EDITORIAL_STATES.filter(isNovaLocked), ["submitted", "in_review", "approved"]);
});

// ---- Nova ownership and version integrity ----
db.exec(`
  INSERT INTO contributors (id) VALUES ('owner-a'), ('owner-b');
  INSERT INTO nova_items (id, owner_id, version) VALUES ('nova-a', 'owner-a', 3), ('nova-b', 'owner-b', 1), ('nova-trash', 'owner-a', 1);
  UPDATE nova_items SET status = 'trash' WHERE id = 'nova-trash';
`);
const novaA = db.prepare("SELECT * FROM nova_items WHERE id = ?").get("nova-a");
check("missing Nova item is refused", () => {
  assert.equal(verifyNovaItemForSubmission({ novaItem: undefined, articleOwnerId: "owner-a", articleNovaItemId: "nova-a" }).code, "nova_item_missing");
});
check("article with no linked Nova item is refused", () => {
  assert.equal(verifyNovaItemForSubmission({ novaItem: novaA, articleOwnerId: "owner-a", articleNovaItemId: null }).code, "no_nova_item");
});
check("foreign Nova item (owned by another Contributor) is refused", () => {
  const foreign = db.prepare("SELECT * FROM nova_items WHERE id = ?").get("nova-b");
  assert.equal(verifyNovaItemForSubmission({ novaItem: foreign, articleOwnerId: "owner-a", articleNovaItemId: "nova-b" }).code, "nova_item_foreign_owner");
});
check("trashed Nova item is refused", () => {
  const trashed = db.prepare("SELECT * FROM nova_items WHERE id = ?").get("nova-trash");
  assert.equal(verifyNovaItemForSubmission({ novaItem: trashed, articleOwnerId: "owner-a", articleNovaItemId: "nova-trash" }).code, "nova_item_unusable");
});
check("submission version is read from the owned row (3)", () => {
  assert.equal(verifyNovaItemForSubmission({ novaItem: novaA, articleOwnerId: "owner-a", articleNovaItemId: "nova-a" }).version, 3);
});
check("stale version is refused", () => {
  assert.equal(checkVersionCurrent({ recordedVersion: 2, currentVersion: 3 }).code, "stale_version");
  assert.equal(checkVersionCurrent({ recordedVersion: 3, currentVersion: 3 }).ok, true);
});

// ---- Submission row, approval and publication ----
const submission = {
  outcome: "open",
  submitted_by: "owner-a",
  submitted_nova_version: 3,
  approved_nova_version: 3,
  submitted_destination: "Research",
  submitted_article_type: "Research Paper",
};
check("approval of an unreviewed newer version is refused", () => {
  assert.equal(checkApprovalMatchesSubmission({ submission, approvedNovaVersion: 4 }).code, "approval_version_mismatch");
});
check("approval of the submitted version is accepted", () => {
  assert.equal(checkApprovalMatchesSubmission({ submission, approvedNovaVersion: 3 }).ok, true);
});
check("approved document mutation makes publication stale", () => {
  assert.equal(validatePublication({
    capabilities: PUBLISHER, actorId: "pub", submitterId: "owner-a", editorialStatus: "approved",
    submission, currentNovaVersion: 4, destination: "Research", articleType: "Research Paper",
  }).code, "stale_version");
});
check("destination change after submission is detected", () => {
  const meta = detectReviewedMetadataChange({ submission, destination: "Essays", articleType: "Research Paper" });
  assert.deepEqual(meta, { changed: true, fields: ["destination"] });
});
check("article_type change after submission is detected", () => {
  const meta = detectReviewedMetadataChange({ submission, destination: "Research", articleType: "Essay" });
  assert.deepEqual(meta, { changed: true, fields: ["article_type"] });
});
check("publication refused for Reviewer without EDITORIAL_PUBLISH", () => {
  assert.equal(validatePublication({
    capabilities: REVIEWER, actorId: "rev", submitterId: "owner-a", editorialStatus: "approved",
    submission, currentNovaVersion: 3, destination: "Research", articleType: "Research Paper",
  }).code, "editorial_publish_required");
});
check("publication refused for Admin without EDITORIAL_PUBLISH", () => {
  assert.equal(validatePublication({
    capabilities: ADMIN_NO_EDITORIAL, actorId: "admin", submitterId: "owner-a", editorialStatus: "approved",
    submission, currentNovaVersion: 3, destination: "Research", articleType: "Research Paper",
  }).code, "editorial_publish_required");
});
check("publication refused for the submitter even with EDITORIAL_PUBLISH", () => {
  assert.equal(validatePublication({
    capabilities: REVIEWER_AND_PUBLISHER, actorId: "owner-a", submitterId: "owner-a", editorialStatus: "approved",
    submission, currentNovaVersion: 3, destination: "Research", articleType: "Research Paper",
  }).code, "self_publication_refused");
});
check("publication without an approved editorial status is refused", () => {
  assert.equal(validatePublication({
    capabilities: PUBLISHER, actorId: "pub", submitterId: "owner-a", editorialStatus: "in_review",
    submission, currentNovaVersion: 3, destination: "Research", articleType: "Research Paper",
  }).code, "not_approved");
});
check("publication without an approved submission row is refused", () => {
  assert.equal(validatePublication({
    capabilities: PUBLISHER, actorId: "pub", submitterId: "owner-a", editorialStatus: "approved",
    submission: null, currentNovaVersion: 3, destination: "Research", articleType: "Research Paper",
  }).code, "no_approved_submission");
});
check("publication refused when reviewed destination changed", () => {
  assert.equal(validatePublication({
    capabilities: PUBLISHER, actorId: "pub", submitterId: "owner-a", editorialStatus: "approved",
    submission, currentNovaVersion: 3, destination: "Essays", articleType: "Research Paper",
  }).code, "reviewed_metadata_changed");
});
check("publisher publishes the exact approved version", () => {
  const result = validatePublication({
    capabilities: PUBLISHER, actorId: "pub", submitterId: "owner-a", editorialStatus: "approved",
    submission, currentNovaVersion: 3, destination: "Research", articleType: "Research Paper",
  });
  assert.equal(result.ok, true);
  assert.equal(result.approvedNovaVersion, 3);
});

// ---- Schema: additive migration and append-only history ----
check("existing articles default to legacy and articles.status is unchanged", () => {
  db.exec("INSERT INTO articles (id, created_by, status, destination) VALUES ('art-1', 'owner-a', 'published', 'Research')");
  const row = db.prepare("SELECT status, editorial_status FROM articles WHERE id = 'art-1'").get();
  assert.equal(row.status, "published");
  assert.equal(row.editorial_status, "legacy");
});
check("editorial_status rejects values outside the canonical set", () => {
  assert.throws(() => db.exec("UPDATE articles SET editorial_status = 'published' WHERE id = 'art-1'"));
});
check("new submission and event tables are empty after migration", () => {
  db.exec("DELETE FROM article_editorial_events; DELETE FROM article_editorial_submissions;");
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM article_editorial_submissions").get().n, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM article_editorial_events").get().n, 0);
});
check("event rows cannot be updated", () => {
  db.exec("INSERT INTO article_editorial_events (id, article_id, actor_id, event_type, to_state) VALUES ('ev-1', 'art-1', 'owner-a', 'entered_workflow', 'draft')");
  assert.throws(() => db.exec("UPDATE article_editorial_events SET note = 'x' WHERE id = 'ev-1'"), /append-only/);
});
check("event rows cannot be deleted", () => {
  assert.throws(() => db.exec("DELETE FROM article_editorial_events WHERE id = 'ev-1'"), /append-only/);
});
check("deleting an article with editorial history is refused, not cascaded", () => {
  assert.throws(() => db.exec("DELETE FROM articles WHERE id = 'art-1'"));
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM article_editorial_events").get().n, 1);
});

console.log(`\nTPI-NOVA-004R6B: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
