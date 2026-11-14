const HASH_ALGORITHM = "SHA-256";
const PBKDF2_PREFIX = "pbkdf2-sha256";
const PBKDF2_ITERATIONS = 120000;
const SALT_BYTES = 16;
const DERIVED_BYTES = 32;

function base64UrlEncode(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value) {
  const normalized = String(value || "").replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function hexEncode(bytes) {
  return [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function derivePassword(password, salt, iterations) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(String(password)),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: HASH_ALGORITHM },
    key,
    DERIVED_BYTES * 8
  );
  return new Uint8Array(bits);
}

function constantTimeEqual(left, right) {
  if (!(left instanceof Uint8Array) || !(right instanceof Uint8Array) || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

export function isLegacyPasswordHash(value) {
  return /^[0-9a-f]{64}$/i.test(String(value || ""));
}

export async function legacyPasswordHash(password) {
  const digest = await crypto.subtle.digest(HASH_ALGORITHM, new TextEncoder().encode(String(password)));
  return hexEncode(new Uint8Array(digest));
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const derived = await derivePassword(password, salt, PBKDF2_ITERATIONS);
  return `${PBKDF2_PREFIX}$${PBKDF2_ITERATIONS}$${base64UrlEncode(salt)}$${base64UrlEncode(derived)}`;
}

export async function verifyPassword(password, storedHash) {
  const stored = String(storedHash || "");
  if (isLegacyPasswordHash(stored)) {
    return constantTimeEqual(
      new TextEncoder().encode(await legacyPasswordHash(password)),
      new TextEncoder().encode(stored.toLowerCase())
    );
  }

  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== PBKDF2_PREFIX) return false;
  const iterations = Number(parts[1]);
  if (!Number.isSafeInteger(iterations) || iterations < 100000 || iterations > 1000000) return false;
  let salt;
  let expected;
  try {
    salt = base64UrlDecode(parts[2]);
    expected = base64UrlDecode(parts[3]);
  } catch (error) {
    return false;
  }
  if (salt.length < 16 || expected.length !== DERIVED_BYTES) return false;
  return constantTimeEqual(await derivePassword(password, salt, iterations), expected);
}

export async function hashRateLimitKey(value) {
  const digest = await crypto.subtle.digest(HASH_ALGORITHM, new TextEncoder().encode(String(value)));
  return hexEncode(new Uint8Array(digest));
}
