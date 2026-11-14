#!/usr/bin/env node

// Disposable local-only Messenger media round trip. This verifies the full
// path that production exposed: browser MIME label -> upload -> message
// attachment -> authenticated R2 media response. It never targets production.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const base = (process.env.TPI_MESSENGER_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) {
  throw new Error("This regression is local-only and requires the loopback Worker on port 8787.");
}

const credentialsPath = resolve(import.meta.dirname, "../../.local-dev/local-auth-credentials.json");
if (!existsSync(credentialsPath)) throw new Error(`Missing local credentials: ${credentialsPath}`);
const credentials = JSON.parse(readFileSync(credentialsPath, "utf8"));
const member = credentials.accounts?.local_member;
const partner = credentials.accounts?.local_contributor;
if (!member?.username || !member?.password || !partner?.username) throw new Error("Required synthetic local accounts are unavailable.");

let cookie = "";
async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (cookie) headers.set("Cookie", cookie);
  const response = await fetch(`${base}${path}`, { ...options, headers });
  const setCookies = response.headers.getSetCookie?.() || [];
  if (setCookies.length) cookie = setCookies.map(value => value.split(";", 1)[0]).join("; ");
  let data = {};
  if ((response.headers.get("content-type") || "").includes("application/json")) {
    try { data = await response.json(); } catch (error) {}
  }
  return { response, data };
}

function check(label, condition, detail = "") {
  console.log(`${condition ? "PASS" : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!condition) throw new Error(`${label}${detail ? `: ${detail}` : ""}`);
}

const login = await api("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: member.username, password: member.password })
});
check("local synthetic member login", login.response.status === 200 && Boolean(login.data.user));

const conversations = await api("/api/conversations");
check("local Messenger conversations load", conversations.response.status === 200 && Array.isArray(conversations.data.conversations));
let conversation = conversations.data.conversations.find(item => item.direct && item.members?.some(memberItem => memberItem.username === partner.username));
if (!conversation) {
  const created = await api("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ direct: true, usernames: [partner.username] })
  });
  check("local disposable direct conversation is available", [200, 201].includes(created.response.status) && Boolean(created.data.conversation));
  conversation = created.data.conversation;
}

const cases = [
  { name: "tpi-roundtrip.mp4", browserType: "application/octet-stream", expectedType: "video/mp4", body: new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112, 109, 112, 52]) },
  { name: "tpi-roundtrip.zip", browserType: "application/x-zip-compressed", expectedType: "application/zip", body: new Uint8Array([80, 75, 3, 4, 20, 0, 0, 0, 8, 0, 0, 0]) }
];
const createdMessageIds = [];
try {
  for (const item of cases) {
    const form = new FormData();
    form.append("file", new File([item.body], item.name, { type: item.browserType }));
    const upload = await api("/api/uploads/messenger-media", { method: "POST", body: form });
    check(`${item.name} upload succeeds`, upload.response.status === 200 && Boolean(upload.data.url), JSON.stringify({ status: upload.response.status, error: upload.data.error }));
    check(`${item.name} MIME type is normalized`, upload.data.contentType === item.expectedType, JSON.stringify(upload.data));

    const sent = await api(`/api/conversations/${encodeURIComponent(conversation.id)}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "Disposable media round trip", attachments: [{ name: item.name, type: item.name.endsWith(".mp4") ? "video" : "file", documentType: item.name.endsWith(".zip") ? "ZIP archive" : "", url: upload.data.url }] })
    });
    check(`${item.name} can be attached to a message`, sent.response.status === 201 && Boolean(sent.data.message?.id));
    createdMessageIds.push(sent.data.message.id);

    const media = await api(upload.data.url);
    const bytes = new Uint8Array(await media.response.arrayBuffer());
    check(`${item.name} authenticated media response succeeds`, media.response.status === 200 && bytes.length === item.body.length, JSON.stringify({ status: media.response.status, contentType: media.response.headers.get("content-type"), bytes: bytes.length }));
    check(`${item.name} response has the normalized content type`, media.response.headers.get("content-type")?.startsWith(item.expectedType), media.response.headers.get("content-type") || "missing");
  }
} finally {
  for (const messageId of createdMessageIds) {
    await api(`/api/conversations/${encodeURIComponent(conversation.id)}/messages/${encodeURIComponent(messageId)}`, { method: "DELETE" });
  }
}

console.log(JSON.stringify({ suite: "TPI-MESSENGER-MEDIA-ROUNDTRIP", status: "PASS", environment: base, cleanedUpMessages: createdMessageIds.length }, null, 2));
