#!/usr/bin/env node

// Bounded loopback-only integration checks for TPI-OPS-012.
// No recording, livestream, RealtimeKit, public Worker, or external media
// request is made by this suite.
import { existsSync, readFileSync } from "node:fs";

const base = process.env.TPI_LOCAL_ORIGIN || "http://127.0.0.1:8787";
const roomBase = "http://127.0.0.1:8788";
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) throw new Error("OPS-012 QA requires the approved loopback Worker origin");
if (!existsSync(".local-dev/local-auth-credentials.json")) throw new Error("local authentication fixtures are missing");
const credentials = JSON.parse(readFileSync(".local-dev/local-auth-credentials.json", "utf8"));
const checks = [];
const createdWorkspaces = [];

function check(name, condition, detail = "") {
  checks.push({ name, ok: Boolean(condition), detail });
}

async function request(origin, path, options = {}, cookie = "") {
  const headers = new Headers(options.headers || {});
  if (options.body != null && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);
  const response = await fetch(`${origin}${path}`, { ...options, headers, redirect: "manual" });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text.slice(0, 240); }
  return { response, body, text };
}

function cookieFrom(response) {
  const token = (response.headers.get("set-cookie") || "").match(/tpi_session=([^;]*)/)?.[1] || "";
  return token ? `tpi_session=${token}` : "";
}

function account(key) {
  return credentials.accounts[key];
}

async function login(key) {
  const record = account(key);
  const result = await request(base, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username: record.username, password: record.password }),
  });
  check(`${key} login`, result.response.status === 200 && Boolean(cookieFrom(result.response)));
  return cookieFrom(result.response);
}

function state(id, title) {
  return {
    broadcast: { id, title, description: "Fictional OPS-012 local integration fixture", status: "draft", visibility: "private" },
    settings: { programOrientation: "landscape", recordingDestination: "browser", keepLocalBackup: true, saveAutomatically: true },
    recording: { localLibraryCount: 0, incompleteSessionCount: 0, storageMode: "browser" },
    configuration: { selectedBackground: "default", styleSettings: { accentColor: "#7c3aed" } },
  };
}

const anonymousStudio = await request(base, "/studio/");
check("anonymous StudioFlow route is protected", anonymousStudio.response.status === 403, `HTTP ${anonymousStudio.response.status}`);
const anonymousParaTube = await request(base, "/paratube");
check("ParaTube route renders locally", anonymousParaTube.response.status === 200 && /ParaTube/i.test(anonymousParaTube.text), `HTTP ${anonymousParaTube.response.status}`);
const anonymousWorkspaces = await request(base, "/api/studio/workspaces");
check("anonymous StudioFlow workspace API is protected", anonymousWorkspaces.response.status === 401, `HTTP ${anonymousWorkspaces.response.status}`);
const anonymousTpiVideos = await request(base, "/api/tpi-videos?limit=6");
check("anonymous TPI video listing is available", anonymousTpiVideos.response.status === 200 && Array.isArray(anonymousTpiVideos.body?.videos), `HTTP ${anonymousTpiVideos.response.status}`);
const scrapedVideos = await request(base, "/api/videos?limit=6");
check("ParaTube listing API is available", scrapedVideos.response.status === 200 && scrapedVideos.body?.videos?.some(video => video.externalId === "local-ops011-video" || video.title === "Local OPS-011 Synthetic Video Listing"), `HTTP ${scrapedVideos.response.status}`);
const thumbnail = await request(base, "/api/media/ops012/thumbnail.svg");
check("local R2 thumbnail is retrievable", thumbnail.response.status === 200 && thumbnail.response.headers.get("content-type")?.includes("image/svg+xml") && thumbnail.text.includes("TPI LOCAL TEST"), `HTTP ${thumbnail.response.status}`);
const missingMedia = await request(base, "/api/media/ops012/missing.svg");
check("missing local R2 object returns 404", missingMedia.response.status === 404, `HTTP ${missingMedia.response.status}`);
const invalidMedia = await request(base, "/api/media/../secret");
check("invalid media path is rejected", [400, 404].includes(invalidMedia.response.status), `HTTP ${invalidMedia.response.status}`);

const adminCookie = await login("local_admin");
const memberCookie = await login("local_member");
const authenticatedStudio = await request(base, "/studio/", {}, adminCookie);
check("authenticated StudioFlow route renders locally", authenticatedStudio.response.status === 200 && /StudioFlow/i.test(authenticatedStudio.text), `HTTP ${authenticatedStudio.response.status}`);
const studioRooms = await request(base, "/api/studio/rooms", {}, adminCookie);
check("admin StudioFlow room listing is local", studioRooms.response.status === 200 && Array.isArray(studioRooms.body?.rooms), `HTTP ${studioRooms.response.status}`);
const roomRelay = await request(base, "/api/rooms/ops012-room/guests", {}, adminCookie);
check("local Worker room relay is available", roomRelay.response.status === 200 && Array.isArray(roomRelay.body?.guests), `HTTP ${roomRelay.response.status}`);
const guest = await request(base, "/api/rooms/ops012-room/guests", {
  method: "POST",
  body: JSON.stringify({ id: "ops012-guest", displayName: "Synthetic Guest", headline: "Local test", waiting: true }),
}, adminCookie);
check("room relay accepts synthetic guest metadata", guest.response.status === 200, `HTTP ${guest.response.status}`);
const guestList = await request(base, "/api/rooms/ops012-room/guests", {}, adminCookie);
check("room relay returns synthetic guest metadata", guestList.response.status === 200 && guestList.body?.guests?.some(item => item.id === "ops012-guest"), `HTTP ${guestList.response.status}`);
const guestDelete = await request(base, "/api/rooms/ops012-room/guests/ops012-guest", { method: "DELETE" }, adminCookie);
check("room relay removes synthetic guest metadata", guestDelete.response.status === 200, `HTTP ${guestDelete.response.status}`);
const memberWorkspaces = await request(base, "/api/studio/workspaces", {}, memberCookie);
check("ordinary member cannot use StudioFlow workspace API", memberWorkspaces.response.status === 403, `HTTP ${memberWorkspaces.response.status}`);

const workspaceId = `ops012-${Date.now()}`;
const created = await request(base, "/api/studio/workspaces", {
  method: "POST",
  body: JSON.stringify({ localBroadcastId: workspaceId, title: "OPS-012 Local Studio", state: state(workspaceId, "OPS-012 Local Studio") }),
}, adminCookie);
check("admin can create local Studio metadata", created.response.status === 201 && Boolean(created.body?.workspace?.id), `HTTP ${created.response.status}`);
if (created.body?.workspace?.id) createdWorkspaces.push(created.body.workspace);
const workspace = created.body?.workspace;
if (workspace) {
  const read = await request(base, `/api/studio/workspaces/${encodeURIComponent(workspace.id)}`, {}, adminCookie);
  check("admin can read persisted Studio metadata", read.response.status === 200 && read.body?.workspace?.localBroadcastId === workspaceId, `HTTP ${read.response.status}`);
  const crossAccount = await request(base, `/api/studio/workspaces/${encodeURIComponent(workspace.id)}`, {}, memberCookie);
  check("cross-account Studio metadata is denied", crossAccount.response.status === 403, `HTTP ${crossAccount.response.status}`);
  const update = await request(base, `/api/studio/workspaces/${encodeURIComponent(workspace.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ expectedVersion: workspace.version, title: "OPS-012 Local Studio Updated" }),
  }, adminCookie);
  check("admin can update local Studio metadata", update.response.status === 200 && update.body?.workspace?.title === "OPS-012 Local Studio Updated", `HTTP ${update.response.status}`);
  const archived = update.body?.workspace ? await request(base, `/api/studio/workspaces/${encodeURIComponent(workspace.id)}/archive`, {
    method: "POST",
    body: JSON.stringify({ expectedVersion: update.body.workspace.version }),
  }, adminCookie) : null;
  check("Studio metadata can be archived locally", archived?.response.status === 200 && archived.body?.workspace?.status === "archived", `HTTP ${archived?.response.status || 0}`);
}

const tpiVideo = await request(base, "/api/tpi-videos/local-ops011-tpi-video", {}, adminCookie);
check("admin can read synthetic TPI video metadata", tpiVideo.response.status === 200 && tpiVideo.body?.video?.id === "local-ops011-tpi-video", `HTTP ${tpiVideo.response.status}`);
const videoComments = await request(base, "/api/video-comments?videoId=local-ops011-tpi-video", {}, memberCookie);
check("TPI video comments API is available", videoComments.response.status === 200 && Array.isArray(videoComments.body?.comments), `HTTP ${videoComments.response.status}`);
const videoReactions = await request(base, "/api/video-reactions?videoId=local-ops011-tpi-video", {}, memberCookie);
check("TPI video reactions API is available", videoReactions.response.status === 200 && videoReactions.body?.videoId === "local-ops011-tpi-video", `HTTP ${videoReactions.response.status}`);

const roomServerStatus = await request(roomBase, "/api/rooms/ops012-room/status");
check("preserved StudioFlow room server responds on 8788", [200, 404].includes(roomServerStatus.response.status), `HTTP ${roomServerStatus.response.status}`);

for (const fixture of createdWorkspaces) {
  const current = await request(base, `/api/studio/workspaces/${encodeURIComponent(fixture.id)}`, {}, adminCookie);
  if (current.response.status === 200 && current.body?.workspace?.status === "active") {
    await request(base, `/api/studio/workspaces/${encodeURIComponent(fixture.id)}/archive`, {
      method: "POST",
      body: JSON.stringify({ expectedVersion: current.body.workspace.version }),
    }, adminCookie);
  }
}

const failed = checks.filter(result => !result.ok);
for (const result of checks) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
console.log(JSON.stringify({
  directive: "TPI-OPS-012",
  base,
  roomBase,
  checks: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  externalRequests: 0,
  realtimeKitUsed: false,
  livestreamStarted: false,
  recordingsUploaded: false,
}));
if (failed.length) process.exit(1);
