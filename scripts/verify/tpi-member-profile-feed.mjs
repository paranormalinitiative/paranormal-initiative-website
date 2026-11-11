#!/usr/bin/env node

// Local-only API and document acceptance for the member profile/feed surface.
// Uses the disposable synthetic accounts and cleans up its follow/request state.
import { readFileSync } from "node:fs";

const base = process.env.TPI_LOCAL_ORIGIN || "http://127.0.0.1:8787";
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) throw new Error("This check is local-only.");
const credentials = JSON.parse(readFileSync(".local-dev/local-auth-credentials.json", "utf8"));
const checks = [];

function check(name, condition) {
  if (!condition) throw new Error(`${name} failed`);
  checks.push(name);
  console.log(`PASS ${name}`);
}

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    redirect: "manual",
    ...options,
    headers: { ...(options.headers || {}) }
  });
  const text = await response.text();
  let body = null;
  try { body = JSON.parse(text); } catch {}
  return { response, body, text };
}

function cookieFrom(response) {
  return (response.headers.get("set-cookie") || "").match(/tpi_session=([^;]*)/)?.[1] || "";
}

async function login(key) {
  const account = credentials.accounts[key];
  const result = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: account.username, password: account.password })
  });
  check(`${key} login`, result.response.status === 200 && Boolean(result.body?.user));
  return { token: cookieFrom(result.response), user: result.body.user };
}

function auth(token, options = {}) {
  return { ...options, headers: { ...(options.headers || {}), Cookie: `tpi_session=${token}` } };
}

const member = await login("local_member");
const contributor = await login("local_contributor");
const target = contributor.user.username;
const targetId = contributor.user.id;

const bannerSave = await request("/api/contributors/me/profile", auth(member.token, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    displayName: member.user.displayName,
    title: member.user.title || "",
    correspondence: member.user.correspondence,
    affiliation: member.user.affiliation || "",
    organization: member.user.organization || "",
    website: member.user.website || "",
    bio: member.user.bio || "",
    photoUrl: member.user.photoUrl || "",
    profileBannerUrl: "/assets/tpi-banner.png",
    commentSignatureEnabled: member.user.commentSignatureEnabled !== false,
    chatColor: member.user.chatColor || "#a855f7"
  })
}));
check("profile banner can be saved through the member editor API", bannerSave.response.status === 200 && bannerSave.body?.user?.profileBannerUrl === "/assets/tpi-banner.png");

const profilePage = await request(`/member-profile?username=${encodeURIComponent(target)}`, auth(member.token));
check("clean profile page is available", profilePage.response.status === 200);
check("clean profile page serves the profile identity and shared feed shell", profilePage.text.includes("data-member-profile-view") && profilePage.text.includes("data-member-feed") && profilePage.text.includes("data-feed-tab"));
check("profile shell includes banner, avatar edit, and profile options controls", profilePage.text.includes("data-member-profile-banner") && profilePage.text.includes("data-profile-avatar-edit") && profilePage.text.includes("data-profile-options-toggle"));
const editorPage = await request("/member-profile.html", auth(member.token));
check("profile editor remains a separate authenticated surface", editorPage.response.status === 200 && editorPage.text.includes("Update Profile") && editorPage.text.includes("data-profile-form") && editorPage.text.includes("profileBannerFile"));

const profile = await request(`/api/members/profile?username=${encodeURIComponent(target)}`, auth(member.token));
check("member profile returns the target and relationship", profile.response.status === 200 && profile.body?.profile?.username === target && profile.body?.relationship);
check("profile view is recorded without exposing private fields", profile.body?.profile?.correspondence === undefined && profile.body?.profile?.passwordHash === undefined);

const feed = await request(`/api/feed/user?username=${encodeURIComponent(target)}&limit=20&scope=community`, auth(member.token));
check("profile feed uses the user feed projection", feed.response.status === 200 && Array.isArray(feed.body?.items));

const discover = await request("/api/members/discover", auth(member.token));
check("people to discover is authenticated and returns a list", discover.response.status === 200 && Array.isArray(discover.body?.members));
const recent = await request("/api/members/recently-viewed", auth(member.token));
check("recently viewed is authenticated and includes the opened profile", recent.response.status === 200 && (recent.body?.members || []).some(item => item.username === target));

const follow = await request("/api/friends/follow", auth(member.token, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetId }) }));
check("profile follow action succeeds", follow.response.status === 200 && follow.body?.following === true);
const followedProfile = await request(`/api/members/profile?username=${encodeURIComponent(target)}`, auth(member.token));
check("profile relationship reflects following", followedProfile.body?.relationship?.following === true);
const unfollow = await request("/api/friends/unfollow", auth(member.token, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetId }) }));
check("profile unfollow cleanup succeeds", unfollow.response.status === 200 && unfollow.body?.following === false);

await request("/api/friends/request/cancel", auth(member.token, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetId }) }));
const friendRequest = await request("/api/friends/request", auth(member.token, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetId }) }));
check("Add Friend action creates a pending request", [200, 201].includes(friendRequest.response.status) && friendRequest.body?.friendStatus === "pending_sent");
const pending = await request(`/api/members/profile?username=${encodeURIComponent(target)}`, auth(member.token));
check("profile relationship reflects a sent friend request", pending.body?.relationship?.friendStatus === "pending_sent");
const cancel = await request("/api/friends/request/cancel", auth(member.token, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetId }) }));
check("friend-request cleanup succeeds", cancel.response.status === 200 && cancel.body?.friendStatus === "none");

console.log(JSON.stringify({ status: "PASSED", checksPassed: checks.length, remoteRequests: 0, credentialsPrinted: false }, null, 2));
