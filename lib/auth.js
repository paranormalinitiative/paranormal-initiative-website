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
    WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP AND c.active = 1
  `).bind(token).first();
  return user || null;
}

// Creator Studio is separate from Administration Center access. Leadership
// retains the existing StudioFlow access, while creators require an explicit
// active entitlement recorded by the server. The membership-state check keeps
// a revoked or suspended source membership from leaving a usable entitlement.
export async function hasCreatorStudioAccess(env, user) {
  if (!user) return false;
  if (user.role === "owner" || user.role === "admin") return true;
  try {
    const entitlement = await env.TPI_DB.prepare(`
      SELECT 1
      FROM creator_studio_entitlements cse
      LEFT JOIN creator_partnership_memberships cpm
        ON cpm.id = cse.source_membership_id
      WHERE cse.contributor_id = ?
        AND cse.entitlement_code = 'creator_studio_lifetime'
        AND cse.entitlement_state = 'active'
        AND (cse.source_membership_id IS NULL OR cpm.membership_state = 'active')
      LIMIT 1
    `).bind(user.id).first();
    return Boolean(entitlement);
  } catch (error) {
    // Older development databases may not have the additive entitlement
    // tables yet. Default deny until the schema is available.
    return false;
  }
}
