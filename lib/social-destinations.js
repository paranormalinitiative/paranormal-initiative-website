// TPI connected social destinations.
//
// Provider credentials never leave this module. The API only returns safe
// connection metadata and explicit capability states. A missing provider
// configuration fails closed instead of silently falling back to a guessed
// token, public URL, or stream key.

const PROVIDERS = Object.freeze({
  facebook: {
    label: "Facebook Pages",
    clientIdEnv: "META_APP_ID",
    clientSecretEnv: "META_APP_SECRET",
    graphVersionEnv: "META_GRAPH_VERSION",
    defaultGraphVersion: "v27.0",
    scopes: ["pages_show_list", "pages_read_engagement", "pages_manage_posts"],
    capabilities: {
      connect: true,
      publishLinks: true,
      startLivestream: false,
      stopLivestream: false,
      chat: false,
    },
  },
  youtube: {
    label: "YouTube",
    clientIdEnv: "YOUTUBE_CLIENT_ID",
    clientSecretEnv: "YOUTUBE_CLIENT_SECRET",
    scopes: ["https://www.googleapis.com/auth/youtube"],
    capabilities: {
      connect: true,
      publishLinks: false,
      startLivestream: false,
      stopLivestream: false,
      chat: false,
    },
  },
});

const PROVIDER_ALIASES = Object.freeze({ facebook: "facebook", facebook_page: "facebook", youtube: "youtube" });
const CONNECTION_COLUMNS = `id, owner_id, provider, provider_account_id, display_name,
  scopes_json, capabilities_json, status, token_expires_at, created_at, updated_at`;

export function supportedSocialProviders(env = {}) {
  return Object.entries(PROVIDERS).map(([provider, config]) => ({
    provider,
    label: config.label,
    configured: providerConfigured(config, env),
    capabilities: { ...config.capabilities },
    scopes: [...config.scopes],
  }));
}

export function normalizeSocialProvider(value) {
  return PROVIDER_ALIASES[String(value || "").trim().toLowerCase()] || null;
}

export function socialProviderConfig(provider) {
  const normalized = normalizeSocialProvider(provider);
  return normalized ? PROVIDERS[normalized] : null;
}

function providerConfigured(config, env) {
  return Boolean(config && String(env[config.clientIdEnv] || "").trim() && String(env[config.clientSecretEnv] || "").trim());
}

function providerClientConfig(env, provider) {
  const config = socialProviderConfig(provider);
  if (!config) throw new SocialDestinationError("unsupported_provider", "This destination provider is not supported.", 400);
  const clientId = String(env[config.clientIdEnv] || "").trim();
  const clientSecret = String(env[config.clientSecretEnv] || "").trim();
  if (!clientId || !clientSecret) {
    throw new SocialDestinationError("provider_not_configured", `${config.label} authorization is not configured yet.`, 503);
  }
  return { provider: normalizeSocialProvider(provider), config, clientId, clientSecret };
}

export class SocialDestinationError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = "SocialDestinationError";
    this.code = code;
    this.status = status;
  }
}

export function oauthRedirectUri(request, provider) {
  const origin = String(request.headers.get("Origin") || "").trim()
    || new URL(request.url).origin;
  const safeOrigin = origin.replace(/\/$/, "");
  return `${safeOrigin}/api/social/oauth/${encodeURIComponent(normalizeSocialProvider(provider) || provider)}/callback`;
}

export function safeReturnPath(value) {
  const candidate = String(value || "").trim();
  return candidate === "/admin-panel" || candidate === "/admin-panel#destinations"
    ? candidate
    : "/admin-panel#destinations";
}

export function buildAuthorizationUrl(request, env, provider, state, returnPath = "/admin-panel#destinations") {
  const normalized = normalizeSocialProvider(provider);
  const redirectUri = oauthRedirectUri(request, normalized);
  const client = providerClientConfig(env, normalized);
  const encodedState = encodeURIComponent(state);
  if (normalized === "facebook") {
    const version = String(env[client.config.graphVersionEnv] || client.config.defaultGraphVersion);
    const url = new URL(`https://www.facebook.com/${version}/dialog/oauth`);
    url.searchParams.set("client_id", client.clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", client.config.scopes.join(","));
    return url.toString();
  }
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", client.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("scope", client.config.scopes.join(" "));
  url.searchParams.set("state", state);
  // Keep this argument explicit in the call site so future providers cannot
  // accidentally treat an arbitrary redirect as trusted input.
  void returnPath;
  void encodedState;
  return url.toString();
}

async function parseProviderResponse(response, provider, operation) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = provider === "facebook" ? body?.error?.code : body?.error;
    throw new SocialDestinationError("provider_request_failed", `${operation} failed at ${provider} (${code || response.status}).`, 502);
  }
  return body;
}

async function exchangeCode(env, request, provider, code) {
  const normalized = normalizeSocialProvider(provider);
  const client = providerClientConfig(env, normalized);
  const redirectUri = oauthRedirectUri(request, normalized);
  if (normalized === "facebook") {
    const version = String(env[client.config.graphVersionEnv] || client.config.defaultGraphVersion);
    const url = new URL(`https://graph.facebook.com/${version}/oauth/access_token`);
    url.searchParams.set("client_id", client.clientId);
    url.searchParams.set("client_secret", client.clientSecret);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("code", code);
    return parseProviderResponse(await fetch(url), normalized, "Facebook authorization");
  }
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: client.clientId,
      client_secret: client.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  return parseProviderResponse(response, normalized, "YouTube authorization");
}

function base64Encode(bytes) {
  let output = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    output += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(output);
}

function base64Decode(value) {
  const binary = atob(String(value));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function encryptionKey(env) {
  const secret = String(env.SOCIAL_OAUTH_ENCRYPTION_KEY || "").trim();
  if (!secret) throw new SocialDestinationError("encryption_not_configured", "Connected destination encryption is not configured.", 503);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export async function encryptSecret(env, value) {
  const key = await encryptionKey(env);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(String(value || "")));
  return `${base64Encode(iv)}.${base64Encode(new Uint8Array(ciphertext))}`;
}

export async function decryptSecret(env, value) {
  try {
    const [ivValue, ciphertextValue] = String(value || "").split(".");
    if (!ivValue || !ciphertextValue) throw new Error("invalid ciphertext");
    const key = await encryptionKey(env);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64Decode(ivValue) }, key, base64Decode(ciphertextValue));
    return new TextDecoder().decode(plaintext);
  } catch (error) {
    if (error instanceof SocialDestinationError) throw error;
    throw new SocialDestinationError("credential_unavailable", "The connected destination credential could not be opened.", 503);
  }
}

function safeJson(value, fallback) {
  try { return JSON.parse(value || "") ?? fallback; } catch { return fallback; }
}

export function destinationPayload(row) {
  const capabilities = safeJson(row.capabilities_json, {});
  return {
    id: row.id,
    provider: row.provider,
    providerAccountId: row.provider_account_id,
    displayName: row.display_name,
    scopes: safeJson(row.scopes_json, []),
    capabilities,
    status: row.status,
    tokenExpiresAt: row.token_expires_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listConnections(env, ownerId) {
  const result = await env.TPI_DB.prepare(`SELECT ${CONNECTION_COLUMNS} FROM social_destination_connections WHERE owner_id = ? AND status = 'active' ORDER BY provider, display_name`).bind(ownerId).all();
  return (result.results || []).map(destinationPayload);
}

async function storeConnection(env, ownerId, input) {
  const existing = await env.TPI_DB.prepare("SELECT id FROM social_destination_connections WHERE owner_id = ? AND provider = ? AND provider_account_id = ? LIMIT 1").bind(ownerId, input.provider, input.providerAccountId).first();
  const id = existing?.id || crypto.randomUUID();
  const encryptedAccessToken = await encryptSecret(env, input.accessToken);
  const encryptedRefreshToken = input.refreshToken ? await encryptSecret(env, input.refreshToken) : null;
  const capabilities = JSON.stringify(input.capabilities || {});
  if (existing) {
    await env.TPI_DB.prepare(`UPDATE social_destination_connections SET display_name = ?, scopes_json = ?, capabilities_json = ?, status = 'active', access_token_ciphertext = ?, refresh_token_ciphertext = COALESCE(?, refresh_token_ciphertext), token_expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(input.displayName, JSON.stringify(input.scopes || []), capabilities, encryptedAccessToken, encryptedRefreshToken, input.tokenExpiresAt || null, id).run();
  } else {
    await env.TPI_DB.prepare(`INSERT INTO social_destination_connections (id, owner_id, provider, provider_account_id, display_name, access_token_ciphertext, refresh_token_ciphertext, scopes_json, capabilities_json, status, token_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`).bind(id, ownerId, input.provider, input.providerAccountId, input.displayName, encryptedAccessToken, encryptedRefreshToken, JSON.stringify(input.scopes || []), capabilities, input.tokenExpiresAt || null).run();
  }
  return env.TPI_DB.prepare(`SELECT ${CONNECTION_COLUMNS} FROM social_destination_connections WHERE id = ?`).bind(id).first();
}

export async function completeAuthorization(env, request, stateRow, code) {
  const token = await exchangeCode(env, request, stateRow.provider, code);
  const normalized = stateRow.provider;
  const config = socialProviderConfig(normalized);
  if (normalized === "facebook") {
    const version = String(env[config.graphVersionEnv] || config.defaultGraphVersion);
    const accountsUrl = new URL(`https://graph.facebook.com/${version}/me/accounts`);
    accountsUrl.searchParams.set("fields", "id,name,access_token,category");
    accountsUrl.searchParams.set("access_token", token.access_token);
    const accounts = await parseProviderResponse(await fetch(accountsUrl), normalized, "Facebook Page discovery");
    const pages = Array.isArray(accounts.data) ? accounts.data : [];
    if (!pages.length) throw new SocialDestinationError("no_pages", "Facebook authorization succeeded, but no Facebook Page was available to connect.", 409);
    const stored = [];
    for (const page of pages.slice(0, 20)) {
      if (!page?.id || !page?.access_token) continue;
      const row = await storeConnection(env, stateRow.owner_id, {
        provider: "facebook",
        providerAccountId: String(page.id),
        displayName: String(page.name || `Facebook Page ${page.id}`).slice(0, 180),
        accessToken: page.access_token,
        scopes: config.scopes,
        capabilities: config.capabilities,
      });
      stored.push(destinationPayload(row));
    }
    if (!stored.length) throw new SocialDestinationError("no_pages", "Facebook returned no usable Page connection.", 409);
    return stored;
  }
  const channelsUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
  channelsUrl.searchParams.set("part", "snippet,contentDetails,statistics");
  channelsUrl.searchParams.set("mine", "true");
  channelsUrl.searchParams.set("access_token", token.access_token);
  const channels = await parseProviderResponse(await fetch(channelsUrl), normalized, "YouTube channel discovery");
  const channel = Array.isArray(channels.items) ? channels.items[0] : null;
  if (!channel?.id) throw new SocialDestinationError("no_channel", "YouTube authorization succeeded, but no channel was available to connect.", 409);
  const row = await storeConnection(env, stateRow.owner_id, {
    provider: "youtube",
    providerAccountId: String(channel.id),
    displayName: String(channel.snippet?.title || `YouTube channel ${channel.id}`).slice(0, 180),
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    tokenExpiresAt: token.expires_in ? new Date(Date.now() + Number(token.expires_in) * 1000).toISOString() : null,
    scopes: config.scopes,
    capabilities: config.capabilities,
  });
  return [destinationPayload(row)];
}

export async function getConnectionWithToken(env, ownerId, connectionId, provider = null) {
  const row = await env.TPI_DB.prepare(`SELECT ${CONNECTION_COLUMNS}, access_token_ciphertext, refresh_token_ciphertext FROM social_destination_connections WHERE owner_id = ? AND id = ? AND status = 'active' LIMIT 1`).bind(ownerId, connectionId).first();
  if (!row || (provider && row.provider !== provider)) return null;
  return { ...row, accessToken: await decryptSecret(env, row.access_token_ciphertext), refreshToken: row.refresh_token_ciphertext ? await decryptSecret(env, row.refresh_token_ciphertext) : null };
}

export async function disconnectConnection(env, ownerId, connectionId) {
  const result = await env.TPI_DB.prepare("UPDATE social_destination_connections SET status = 'disconnected', access_token_ciphertext = '', refresh_token_ciphertext = NULL, updated_at = CURRENT_TIMESTAMP WHERE owner_id = ? AND id = ? AND status = 'active'").bind(ownerId, connectionId).run();
  return Number(result.meta?.changes || 0) > 0;
}

export async function publishFacebookLink(env, ownerId, input) {
  const row = input.connectionId
    ? await getConnectionWithToken(env, ownerId, input.connectionId, "facebook")
    : (await env.TPI_DB.prepare(`SELECT ${CONNECTION_COLUMNS}, access_token_ciphertext, refresh_token_ciphertext FROM social_destination_connections WHERE owner_id = ? AND provider = 'facebook' AND status = 'active' ORDER BY updated_at DESC LIMIT 1`).bind(ownerId).first());
  if (!row) throw new SocialDestinationError("facebook_not_connected", "Connect a Facebook Page in Administration Center before publishing.", 409);
  const accessToken = row.accessToken || await decryptSecret(env, row.access_token_ciphertext);
  const version = String(env.META_GRAPH_VERSION || "v27.0");
  const body = new URLSearchParams({ access_token: accessToken, message: String(input.message || "").trim().slice(0, 63206) });
  if (input.link) body.set("link", String(input.link).trim().slice(0, 2000));
  const response = await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(row.provider_account_id)}/feed`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const payload = await parseProviderResponse(response, "facebook", "Facebook Page publishing");
  return { connection: destinationPayload(row), providerPostId: payload.id || null };
}
