import { CAPABILITY, resolveMemberEntitlements } from "./membership-entitlements.js";
import { effectiveStaffRole } from "./staff-roles.js";

export const SESSION_COOKIE = "tpi_session";

// The hosted Workers remain Secure-cookie deployments. The local Wrangler
// runtime is intentionally HTTP-only on loopback, so the browser will not
// send a Secure cookie there. Keep this exception fail-closed: it requires
// the explicit local environment markers, HTTP, and an approved loopback
// host/port. Forwarded headers are deliberately not consulted.
export function sessionCookieAttributes(request, env, maxAge) {
  let localHttp = false;
  try {
    const url = new URL(request.url);
    localHttp = env?.TPI_ENV === "local"
      && env?.TPI_LOCAL_ONLY === "1"
      && url.protocol === "http:"
      && (url.hostname === "127.0.0.1" || url.hostname === "localhost")
      && url.port === "8787";
  } catch (error) {
    localHttp = false;
  }

  const attributes = ["Path=/", "HttpOnly"];
  if (!localHttp) attributes.push("Secure");
  attributes.push("SameSite=Lax", `Max-Age=${maxAge}`);
  return attributes.join("; ");
}

export function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie.split(";").map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1) || "";
}

export async function getSessionUser(request, env) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const user = await env.TPI_DB.prepare(`
    SELECT c.* FROM sessions s
    JOIN contributors c ON c.id = s.contributor_id
    WHERE s.token = ? AND datetime(s.expires_at) > CURRENT_TIMESTAMP AND c.active = 1
  `).bind(token).first();
  return user || null;
}

// Creator Studio is separate from general Administration Center access.
// Owner and Executive leadership retain the platform's leadership access;
// other members require an active Creator capability recorded by the server.
//
// TPI-CREATOR-INCENTIVE-001: this is the single, minimal StudioFlow integration
// point. The capability resolver unions every legitimate source (existing role,
// legacy Creator Studio entitlement from migration 0048, and an active Founding
// Creator or Founding All-Access membership), so previously approved access is
// preserved and a suspended/revoked source stops granting access. StudioFlow
// behaviour itself is unchanged.
export async function hasCreatorStudioAccess(env, user) {
  if (!user) return false;
  if (user.role === "owner" || user.role === "admin") return true;
  try {
    if (await effectiveStaffRole(env, user) === "executive") return true;
  } catch (error) {
    // Older databases may not yet have the additive staff-appointment table.
    // Continue to the existing entitlement check, which also fails closed.
  }
  try {
    const entitlements = await resolveMemberEntitlements(env, user);
    return entitlements.capabilities.includes(CAPABILITY.CREATOR);
  } catch (error) {
    // Older development databases may not have the additive entitlement
    // tables yet. Default deny until the schema is available.
    return false;
  }
}
