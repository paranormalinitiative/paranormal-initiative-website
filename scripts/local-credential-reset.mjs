import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const PBKDF2_PREFIX = "pbkdf2-sha256";
const PBKDF2_ITERATIONS = 120000;

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

export function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = pbkdf2Sync(String(password), salt, PBKDF2_ITERATIONS, 32, "sha256");
  return `${PBKDF2_PREFIX}$${PBKDF2_ITERATIONS}$${base64UrlEncode(salt)}$${base64UrlEncode(derived)}`;
}

export function legacyPasswordHash(password) {
  return createHash("sha256").update(password, "utf8").digest("hex");
}

export function verifyPassword(password, storedHash) {
  const stored = String(storedHash || "");
  if (/^[0-9a-f]{64}$/i.test(stored)) return stored.toLowerCase() === legacyPasswordHash(password);
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== PBKDF2_PREFIX || Number(parts[1]) < 100000) return false;
  try {
    const expected = Buffer.from(parts[3], "base64url");
    const actual = pbkdf2Sync(String(password), Buffer.from(parts[2], "base64url"), Number(parts[1]), expected.length, "sha256");
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
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
