import { createHash } from "node:crypto";

export function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function hashPassword(password) {
  return createHash("sha256").update(password, "utf8").digest("hex");
}

export function isEligibleTargetAccount(account, requestedUsername) {
  return Boolean(
    account &&
    account.username === requestedUsername &&
    ["admin", "owner"].includes(account.role) &&
    Number(account.active) === 1,
  );
}

export function buildTargetPasswordResetSql({ accountId, username, password }) {
  return `
UPDATE contributors
SET password_hash = ${sqlString(hashPassword(password))}
WHERE id = ${sqlString(accountId)}
  AND username = ${sqlString(username)}
  AND role IN ('admin', 'owner')
  AND active = 1;
DELETE FROM sessions WHERE contributor_id = ${sqlString(accountId)};
`;
}
