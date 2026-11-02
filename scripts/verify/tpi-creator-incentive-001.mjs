#!/usr/bin/env node

// TPI-CREATOR-INCENTIVE-001 — permanent membership, entitlement, and numbering
// regression suite.
//
// Part A exercises the pure entitlement model (no database). Part B exercises
// the real registry module against a disposable SQLite database built from the
// repository migrations, using a small D1-shaped shim over the sqlite3 CLI.
//
// Nothing here touches .local-dev, Cloudflare, or production. The database is
// created in the OS temp directory and deleted afterwards.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  CAPABILITY,
  FEATURE_AVAILABILITY,
  LIFETIME_CAPACITY,
  MEMBERSHIP_CLASSES,
  capabilitiesForClass,
  describeCapabilities,
  incentiveEligibility,
  legacyRoleCapabilities,
  membershipNumber,
  mergeCapabilities,
  nextSequenceFromSequences,
  parseMembershipNumber,
  primaryBadge,
} from "../../lib/membership-entitlements.js";
import {
  MembershipError,
  assignFoundingMembership,
  foundingClassSummary,
  grantCapability,
  listFoundingRegistry,
  revokeCapability,
  setFoundingMembershipState,
} from "../../lib/founding-memberships.js";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);
let passed = 0;
let failed = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`PASS  ${name}`);
  } else {
    failed += 1;
    failures.push(name);
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function section(title) {
  console.log(`\n== ${title} ==`);
}

// ---------------------------------------------------------------------------
// Part A — entitlement model
// ---------------------------------------------------------------------------
section("Entitlement model: the three classes");

const FC = capabilitiesForClass("FC");
const FCT = capabilitiesForClass("FCT");
const FAA = capabilitiesForClass("FAA");

check("Founding Creator grants the Creator capability only", FC.length === 1 && FC[0] === CAPABILITY.CREATOR, JSON.stringify(FC));
check("Founding Contributor grants the Contributor capability only", FCT.length === 1 && FCT[0] === CAPABILITY.CONTRIBUTOR, JSON.stringify(FCT));
check("Founding All-Access grants both capabilities", FAA.includes(CAPABILITY.CREATOR) && FAA.includes(CAPABILITY.CONTRIBUTOR), JSON.stringify(FAA));
check(
  "Founding All-Access is exactly the union of Creator and Contributor",
  JSON.stringify([...FAA].sort()) === JSON.stringify(mergeCapabilities(FC, FCT)),
  `${JSON.stringify(FAA)} vs ${JSON.stringify(mergeCapabilities(FC, FCT))}`,
);
check(
  "All-Access is derived from the shared capability sets, not a duplicated list",
  MEMBERSHIP_CLASSES.find((entry) => entry.classCode === "FAA").capabilitySet === "all_access"
    && MEMBERSHIP_CLASSES.find((entry) => entry.classCode === "FAA").capabilities.length === 2,
);

section("Entitlement model: cumulative dual access (no last-role-wins)");

check("Creator then Contributor accumulates both", JSON.stringify(mergeCapabilities(FC, FCT)) === JSON.stringify([CAPABILITY.CONTRIBUTOR, CAPABILITY.CREATOR].sort()));
check("Contributor then Creator yields the identical set", JSON.stringify(mergeCapabilities(FCT, FC)) === JSON.stringify(mergeCapabilities(FC, FCT)));
check("Adding Contributor to Creator does not drop Creator", mergeCapabilities(FC, FCT).includes(CAPABILITY.CREATOR));
check("Adding Creator to Contributor does not drop Contributor", mergeCapabilities(FCT, FC).includes(CAPABILITY.CONTRIBUTOR));
check("Ordinary member holds no capability", mergeCapabilities(legacyRoleCapabilities("member")).length === 0);
check("Legacy contributor role still maps to Contributor capability", legacyRoleCapabilities("contributor").includes(CAPABILITY.CONTRIBUTOR));
check("Legacy creator role still maps to Creator capability", legacyRoleCapabilities("creator").includes(CAPABILITY.CREATOR));
check("Leadership keeps both capability sets", legacyRoleCapabilities("owner").length === 2 && legacyRoleCapabilities("admin").length === 2);

section("Entitlement model: Nova contract and incentive eligibility");

const creatorOnly = describeCapabilities(FC);
const contributorOnly = describeCapabilities(FCT);
const allAccess = describeCapabilities(FAA);

check("Creator is entitled to StudioFlow Nova Edit", creatorOnly.entitled.studioFlowNovaEdit === true);
check("Creator is entitled to Nova Edit Documents and Slides", creatorOnly.entitled.novaEditDocuments && creatorOnly.entitled.novaEditSlides);
check("Creator is NOT entitled to the Nova Editorial Workspace", creatorOnly.entitled.novaEditorialWorkspace === false);
check("Contributor is entitled to the Nova Editorial Workspace", contributorOnly.entitled.novaEditorialWorkspace === true);
check("Contributor is entitled to Nova Docs and Nova Slides", contributorOnly.entitled.novaDocs && contributorOnly.entitled.novaSlides);
check("Contributor is NOT entitled to StudioFlow Nova Edit", contributorOnly.entitled.studioFlowNovaEdit === false);
check("All-Access holds every Nova entitlement of both groups", Object.entries(creatorOnly.entitled).every(([key, value]) => !value || allAccess.entitled[key]) && Object.entries(contributorOnly.entitled).every(([key, value]) => !value || allAccess.entitled[key]));
check("Unbuilt Nova features remain unavailable even when entitled", Object.values(FEATURE_AVAILABILITY).every((value) => value === false) && Object.values(allAccess.available).every((value) => value === false));
check("Contributor does not imply Education Center publishing authority", contributorOnly.entitled.educationCenterPublishing === false && allAccess.entitled.educationCenterPublishing === false);
check("Creator holds Creator Incentive eligibility", incentiveEligibility({ capabilities: FC }).eligible === true);
check("All-Access holds Creator Incentive eligibility", incentiveEligibility({ capabilities: FAA }).eligible === true);
check("Contributor alone is NOT Creator Incentive eligible", incentiveEligibility({ capabilities: FCT }).eligible === false);
check("Ordinary member is NOT Creator Incentive eligible", incentiveEligibility({ capabilities: [] }).eligible === false);
check(
  "Incentive financial policy is reported as unresolved",
  incentiveEligibility({ capabilities: FC }).financialPolicyStatus === "UNRESOLVED — OWNER DECISION REQUIRED",
);
check("A suspended participation state removes eligibility", incentiveEligibility({ capabilities: FC, participationState: "suspended" }).eligible === false);

section("Entitlement model: badge identity");

check("Founding Creator badge is green", MEMBERSHIP_CLASSES.find((entry) => entry.classCode === "FC").badgeColor === "green");
check("Founding Contributor badge is blue", MEMBERSHIP_CLASSES.find((entry) => entry.classCode === "FCT").badgeColor === "blue");
check("Founding All-Access badge is purple", MEMBERSHIP_CLASSES.find((entry) => entry.classCode === "FAA").badgeColor === "purple");
check("All-Access displays the All-Access identity, not two badges", primaryBadge(["FC", "FAA"])?.classCode === "FAA");
check("Creator + Contributor without All-Access shows the Creator identity", primaryBadge(["FCT", "FC"])?.classCode === "FC");
check("Contributor alone shows the Contributor identity", primaryBadge(["FCT"])?.classCode === "FCT");
check("No membership shows no badge", primaryBadge([]) === null);

section("Numbering");

check("FC sequence 1 formats as FC-001", membershipNumber("FC", 1) === "FC-001");
check("FC sequence 7 is zero padded as FC-007", membershipNumber("FC", 7) === "FC-007");
check("FCT sequence 50 formats as FCT-050", membershipNumber("FCT", 50) === "FCT-050");
check("FAA sequence 10 formats as FAA-010", membershipNumber("FAA", 10) === "FAA-010");
check("Sequence 0 is rejected", membershipNumber("FC", 0) === null);
check("Sequence 51 is impossible", membershipNumber("FC", 51) === null);
check("Unknown class prefix is rejected", membershipNumber("XX", 1) === null);
check("FC-001 parses back to class FC sequence 1", JSON.stringify(parseMembershipNumber("FC-001")) === JSON.stringify({ classCode: "FC", sequenceNumber: 1 }));
check("FC-051 is rejected by the parser", parseMembershipNumber("FC-051") === null);
check("FC-1 (unpadded) is rejected by the parser", parseMembershipNumber("FC-1") === null);
check("FC-000 is rejected by the parser", parseMembershipNumber("FC-000") === null);
check("Next sequence after FC-001..003 is 4", nextSequenceFromSequences([1, 2, 3]) === 4);
check("An empty registry starts at 1", nextSequenceFromSequences([]) === 1);
check("Issued 050 exhausts the class (no 051)", nextSequenceFromSequences([50]) === null);
check("A revoked highest number is not recycled", nextSequenceFromSequences([1, 2, 3, 50]) === null);

// ---------------------------------------------------------------------------
// Part B — registry against a disposable database
// ---------------------------------------------------------------------------
section("Registry: disposable database from repository migrations");

const workDir = mkdtempSync(join(tmpdir(), "tpi-creator-incentive-"));
const dbPath = join(workDir, "registry.sqlite");
const migrations = [
  "migrations/0001_contributor_portal.sql",
  // Audit table used by every membership mutation.
  "migrations/0047_admin_audit_logs.sql",
  "migrations/0058_founding_membership_entitlements.sql",
];

// SQL is passed on stdin: migration files begin with comments, and a leading
// "--" in an argv position is parsed as a sqlite3 option.
function sqlRaw(sql) {
  return execFileSync("sqlite3", ["-bail", dbPath], { input: sql, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}
function sqlJson(sql) {
  const output = execFileSync("sqlite3", ["-bail", "-json", dbPath], { input: sql, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
  return output ? JSON.parse(output) : [];
}
function literal(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}
function interpolate(sql, values) {
  let index = 0;
  return sql.replace(/\?/g, () => literal(values[index++]));
}

class Statement {
  constructor(sql) {
    this.sql = sql;
    this.values = [];
  }
  bind(...values) {
    this.values = values;
    return this;
  }
  text() {
    return interpolate(this.sql, this.values).trim().replace(/;$/, "");
  }
  async first() {
    return sqlJson(`${this.text()};`)[0] || null;
  }
  async all() {
    return { results: sqlJson(`${this.text()};`) };
  }
  async run() {
    sqlRaw(`${this.text()};`);
    return { success: true };
  }
}

const fakeEnv = {
  TPI_DB: {
    prepare: (sql) => new Statement(sql),
    // D1 batch runs as one transaction; sqlite3 aborts the whole transaction on
    // the first failing statement, which is what the production rollback relies on.
    async batch(statements) {
      sqlRaw(`BEGIN;\n${statements.map((statement) => `${statement.text()};`).join("\n")}\nCOMMIT;`);
      return statements.map(() => ({ success: true }));
    },
  },
};

for (const file of migrations) {
  sqlRaw(readFileSync(resolve(repoRoot, file), "utf8"));
}

function addAccount(id, username, role = "member") {
  sqlRaw(`INSERT INTO contributors (id, username, password_hash, display_name, role, correspondence, active)
          VALUES (${literal(id)}, ${literal(username)}, 'x', ${literal(username)}, ${literal(role)}, ${literal(`${username}@example.invalid`)}, 1);`);
  return { id, username, role, active: 1 };
}

const creatorA = addAccount("acct-creator", "acct_creator");
const creatorB = addAccount("acct-creator-b", "acct_creator_b");
const contributorA = addAccount("acct-contributor", "acct_contributor");
const allAccessA = addAccount("acct-allaccess", "acct_allaccess");
const plainA = addAccount("acct-plain", "acct_plain");

check("disposable database built and seeded", sqlJson("SELECT COUNT(*) AS total FROM contributors;")[0].total === 5);

section("Registry: issuance and idempotent duplicates");

const firstIssue = await assignFoundingMembership(fakeEnv, { member: creatorA, classCode: "FC", actor: { id: null, username: "owner", role: "owner" }, notes: "first" });
check("first Creator issuance is FC-001", firstIssue.membership.membershipNumber === "FC-001", firstIssue.membership.membershipNumber);
check("Creator issuance grants the Creator capability", JSON.stringify(firstIssue.membership.capabilities) === JSON.stringify(["creator"]));
const secondIssue = await assignFoundingMembership(fakeEnv, { member: creatorB, classCode: "FC", actor: { username: "owner", role: "owner" } });
check("second Creator issuance is FC-002 (sequence continues)", secondIssue.membership.membershipNumber === "FC-002", secondIssue.membership.membershipNumber);

let duplicateError = null;
try {
  await assignFoundingMembership(fakeEnv, { member: creatorA, classCode: "FC", actor: { username: "owner", role: "owner" } });
} catch (error) {
  duplicateError = error;
}
check("duplicate class assignment is refused with 409", duplicateError instanceof MembershipError && duplicateError.status === 409, duplicateError?.message);
check("duplicate refusal reports the existing permanent number", duplicateError?.detail?.membershipNumber === "FC-001", JSON.stringify(duplicateError?.detail));
check("duplicate refusal issues no second number", sqlJson("SELECT COUNT(*) AS total FROM founding_memberships WHERE class_code='FC';")[0].total === 2);

const contributorIssue = await assignFoundingMembership(fakeEnv, { member: contributorA, classCode: "FCT", actor: { username: "owner", role: "owner" } });
check("Founding Contributor issuance is FCT-001", contributorIssue.membership.membershipNumber === "FCT-001");
const allAccessIssue = await assignFoundingMembership(fakeEnv, { member: allAccessA, classCode: "FAA", actor: { username: "owner", role: "owner" } });
check("Founding All-Access issuance is FAA-001", allAccessIssue.membership.membershipNumber === "FAA-001");
check(
  "All-Access issuance writes both capability rows (union, not a third set)",
  sqlJson("SELECT capability FROM member_entitlements WHERE contributor_id='acct-allaccess' ORDER BY capability;").map((row) => row.capability).join(",") === "contributor,creator",
);

section("Registry: cumulative dual access through real assignments");

const dualFirst = await assignFoundingMembership(fakeEnv, { member: creatorA, classCode: "FCT", actor: { username: "owner", role: "owner" } });
check("an existing Founding Creator can receive Founding Contributor", dualFirst.membership.membershipNumber === "FCT-002");
check(
  "Creator capability survives the additional Contributor membership",
  sqlJson("SELECT COUNT(*) AS total FROM member_entitlements WHERE contributor_id='acct-creator' AND capability='creator' AND state='active';")[0].total === 1,
);
check(
  "Contributor capability is present for the dual account",
  sqlJson("SELECT COUNT(*) AS total FROM member_entitlements WHERE contributor_id='acct-creator' AND capability='contributor' AND state='active';")[0].total === 1,
);
check(
  "the dual account keeps both permanent numbers",
  sqlJson("SELECT membership_number FROM founding_memberships WHERE contributor_id='acct-creator' ORDER BY membership_number;").map((row) => row.membership_number).join(",") === "FC-001,FCT-002",
);
const dualReverse = await assignFoundingMembership(fakeEnv, { member: contributorA, classCode: "FC", actor: { username: "owner", role: "owner" } });
check("inverse ordering also accumulates (Contributor then Creator)", dualReverse.membership.membershipNumber === "FC-003");
check(
  "inverse ordering preserves the Contributor capability",
  sqlJson("SELECT COUNT(*) AS total FROM member_entitlements WHERE contributor_id='acct-contributor' AND capability='contributor' AND state='active';")[0].total === 1,
);
check(
  "inverse ordering adds the Creator capability",
  sqlJson("SELECT COUNT(*) AS total FROM member_entitlements WHERE contributor_id='acct-contributor' AND capability='creator' AND state='active';")[0].total === 1,
);

section("Registry: lifecycle, non-recycling, and audit");

const suspended = await setFoundingMembershipState(fakeEnv, { membershipId: secondIssue.membership.id, state: "suspended", actor: { username: "owner", role: "owner" }, notes: "test suspension" });
check("a membership can be suspended without deleting history", suspended.membership.state === "suspended");
check(
  "a suspended membership stops granting capability",
  sqlJson("SELECT COUNT(*) AS total FROM member_entitlements WHERE source_id=" + literal(secondIssue.membership.id) + " AND state='active';")[0].total === 0,
);
check("the suspended permanent number still exists", sqlJson("SELECT COUNT(*) AS total FROM founding_memberships WHERE membership_number='FC-002';")[0].total === 1);
const summaryAfterSuspend = await foundingClassSummary(fakeEnv);
const fcClass = summaryAfterSuspend.classes.find((entry) => entry.classCode === "FC");
check("a suspended number still counts toward the lifetime limit", fcClass.issued === 3 && fcClass.active === 2, `issued=${fcClass.issued} active=${fcClass.active}`);
check("the next number after suspension is FC-004, never FC-002 again", fcClass.nextNumber === "FC-004", fcClass.nextNumber);
check("audit history records issuance and state change", sqlJson("SELECT COUNT(*) AS total FROM founding_membership_history WHERE membership_id=" + literal(secondIssue.membership.id) + ";")[0].total === 2);
check("administrative audit log records the issuance", sqlJson("SELECT COUNT(*) AS total FROM admin_audit_logs WHERE action='founding_membership.issued';")[0].total >= 5);

const reactivated = await setFoundingMembershipState(fakeEnv, { membershipId: secondIssue.membership.id, state: "active", actor: { username: "owner", role: "owner" } });
check("a suspended membership can be reactivated", reactivated.membership.state === "active");
check(
  "reactivation restores the capability",
  sqlJson("SELECT COUNT(*) AS total FROM member_entitlements WHERE source_id=" + literal(secondIssue.membership.id) + " AND state='active';")[0].total === 1,
);
check("history preserves the full state trail", reactivated.history.length === 3, String(reactivated.history.length));

section("Registry: explicit capability grants (supported dual-access mechanism)");

const granted = await grantCapability(fakeEnv, { member: plainA, capability: "creator", actor: { username: "owner", role: "owner" } });
check("an explicit creator grant is recorded", granted.entitlement.capability === "creator");
const secondGrant = await grantCapability(fakeEnv, { member: plainA, capability: "contributor", actor: { username: "owner", role: "owner" } });
check("a contributor grant is added alongside it", secondGrant.entitlement.capability === "contributor");
check(
  "both granted capabilities remain active at once",
  sqlJson("SELECT capability FROM member_entitlements WHERE contributor_id='acct-plain' AND state='active' ORDER BY capability;").map((row) => row.capability).join(",") === "contributor,creator",
);
let duplicateGrant = null;
try {
  await grantCapability(fakeEnv, { member: plainA, capability: "creator", actor: { username: "owner", role: "owner" } });
} catch (error) {
  duplicateGrant = error;
}
check("a duplicate neighbours grant is refused", duplicateGrant instanceof MembershipError && duplicateGrant.status === 409);
await revokeCapability(fakeEnv, { entitlementId: granted.entitlement.id, actor: { username: "owner", role: "owner" } });
check(
  "revoking the creator grant leaves the contributor grant intact",
  sqlJson("SELECT capability FROM member_entitlements WHERE contributor_id='acct-plain' AND state='active' ORDER BY capability;").map((row) => row.capability).join(",") === "contributor",
);
check("the revoked row is preserved, not deleted", sqlJson("SELECT COUNT(*) AS total FROM member_entitlements WHERE contributor_id='acct-plain';")[0].total === 2);

section("Registry: database-enforced uniqueness and numbering");

let uniqueViolation = null;
try {
  sqlRaw(`INSERT INTO founding_memberships (id, contributor_id, class_code, sequence_number, membership_number, state)
          VALUES ('dup-attempt', 'acct-plain', 'FC', 1, 'FC-001', 'active');`);
} catch (error) {
  uniqueViolation = error;
}
check("the database refuses a duplicate membership number", uniqueViolation !== null);
let overflowViolation = null;
try {
  sqlRaw(`INSERT INTO founding_memberships (id, contributor_id, class_code, sequence_number, membership_number, state)
          VALUES ('overflow-attempt', 'acct-plain', 'FC', 51, 'FC-051', 'active');`);
} catch (error) {
  overflowViolation = error;
}
check("the database refuses a 51st sequence in a class", overflowViolation !== null);
let paddingViolation = null;
try {
  sqlRaw(`INSERT INTO founding_memberships (id, contributor_id, class_code, sequence_number, membership_number, state)
          VALUES ('padding-attempt', 'acct-plain', 'FC', 9, 'FC-9', 'active');`);
} catch (error) {
  paddingViolation = error;
}
check("the database refuses an unpadded or mismatched number", paddingViolation !== null);

section("Registry: 50-member lifetime exhaustion");

// FC already holds 3 issued numbers. Issue through 050, then prove no 051.
const bulkAccounts = [];
for (let index = 4; index <= LIFETIME_CAPACITY; index += 1) {
  const account = addAccount(`acct-fill-${index}`, `acct_fill_${index}`);
  bulkAccounts.push(account);
  const issued = await assignFoundingMembership(fakeEnv, { member: account, classCode: "FC", actor: { username: "owner", role: "owner" } });
  if (issued.membership.membershipNumber !== membershipNumber("FC", index)) {
    check(`bulk issuance ${index} produced ${membershipNumber("FC", index)}`, false, issued.membership.membershipNumber);
  }
}
const exhaustedSummary = await foundingClassSummary(fakeEnv);
const exhaustedFc = exhaustedSummary.classes.find((entry) => entry.classCode === "FC");
check("the class reports exactly 50 lifetime issuances", exhaustedFc.issued === LIFETIME_CAPACITY, String(exhaustedFc.issued));
check("the class reports exhaustion", exhaustedFc.exhausted === true);
check("an exhausted class offers no next number", exhaustedFc.nextNumber === null);
check("the frozen number FC-050 exists", sqlJson("SELECT COUNT(*) AS total FROM founding_memberships WHERE membership_number='FC-050';")[0].total === 1);
check("no FC-051 exists", sqlJson("SELECT COUNT(*) AS total FROM founding_memberships WHERE membership_number='FC-051';")[0].total === 0);
check("Other classes remain independently available", exhaustedSummary.classes.filter((entry) => entry.classCode !== "FC").every((entry) => entry.exhausted === false));

const overflowAccount = addAccount("acct-overflow", "acct_overflow");
let exhaustionError = null;
try {
  await assignFoundingMembership(fakeEnv, { member: overflowAccount, classCode: "FC", actor: { username: "owner", role: "owner" } });
} catch (error) {
  exhaustionError = error;
}
check("issuing FC-051 is refused with 409", exhaustionError instanceof MembershipError && exhaustionError.status === 409 && exhaustionError.code === "class_exhausted", exhaustionError?.message);
check("no membership was created for the refused assignment", sqlJson("SELECT COUNT(*) AS total FROM founding_memberships WHERE contributor_id='acct-overflow';")[0].total === 0);

const registry = await listFoundingRegistry(fakeEnv, { classCode: "FCT", pageSize: 10 });
check("the registry lists permanent numbers for a class", registry.memberships.length === 2 && registry.memberships.every((row) => /^FCT-0\d\d$/.test(row.membershipNumber)));

section("Registry: transactional rollback");

let partialFailure = null;
try {
  // A duplicate number in the middle of the batch must roll back the whole
  // assignment: no membership row and no capability rows.
  await fakeEnv.TPI_DB.batch([
    fakeEnv.TPI_DB.prepare("INSERT INTO founding_memberships (id, contributor_id, class_code, sequence_number, membership_number, state) VALUES ('rollback-attempt', 'acct-overflow', 'FCT', 1, 'FCT-001', 'active')"),
    fakeEnv.TPI_DB.prepare("INSERT INTO member_entitlements (id, contributor_id, capability, source_type, source_id, state) VALUES ('rollback-ent', 'acct-overflow', 'contributor', 'founding_membership', 'rollback-attempt', 'active')"),
  ]);
} catch (error) {
  partialFailure = error;
}
check("a conflicting batch fails", partialFailure !== null);
check("no partial membership row survives the failure", sqlJson("SELECT COUNT(*) AS total FROM founding_memberships WHERE id='rollback-attempt';")[0].total === 0);
check("no partial entitlement row survives the failure", sqlJson("SELECT COUNT(*) AS total FROM member_entitlements WHERE id='rollback-ent';")[0].total === 0);

rmSync(workDir, { recursive: true, force: true });
check("disposable database removed", !existsSync(workDir));

console.log("\n==================================");
console.log(`PASS=${passed} FAIL=${failed}`);
if (failed > 0) {
  console.log(`Failed: ${failures.join(" | ")}`);
  process.exit(1);
}
