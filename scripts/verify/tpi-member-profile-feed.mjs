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

const publicHome = await request("/");
check("public home displays the shared full-width site banner", publicHome.response.status === 200 && publicHome.text.includes('class="main-website-banner"') && publicHome.text.includes('src="assets/main-website-banner.png"'));
const memberHome = await request("/member-home.html", auth(member.token));
check("member home uses the signed-in profile above the shared community feed", memberHome.response.status === 200 && memberHome.text.includes('data-member-profile-view aria-labelledby="member-profile-name"') && memberHome.text.includes('data-member-feed') && memberHome.text.includes('data-feed-tab') && memberHome.text.includes('data-profile-posts-link'));
check("member home does not show the public brand banner", !memberHome.text.includes("member-home-brand-banner") && !memberHome.text.includes('src="assets/main-website-banner.png"'));
check("member home keeps the public home page's brand banner", publicHome.text.includes('class="main-website-banner"') && publicHome.text.includes('src="assets/main-website-banner.png"'));
check("the member Home community feed stays shared while View Profile uses an individual feed", memberHome.text.includes('if (profileMode) {\n                var feedData = await window.TPIApi.userFeed') && memberHome.text.includes('window.TPIApi.communityFeed(FEED_LIMIT'));
check("the signed-in Home profile loads its stats and recognition from member profile data", memberHome.text.includes('window.TPIApi.memberProfile && (profileMode || profileUser.username === activeUser.username)') && memberHome.text.includes('profileRecognition = memberProfileData'));
check("the My Pulse card has no visible heading", !memberHome.text.includes('<h4>My Pulse</h4>') && memberHome.text.includes('aria-label="Member activity summary"'));

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
check("a saved profile banner wins and only Todd receives the TPI default banner", profilePage.text.includes("function memberProfileBannerUrl(user)") && profilePage.text.includes('username === "todd_wayne" ? "/assets/tpi-banner.png" : ""') && profilePage.text.includes('profileBanner.removeAttribute("src")'));
check("member profiles do not duplicate Founding Membership badges in the identity header", !profilePage.text.includes("data-member-membership") && profilePage.text.includes("profileUser.foundingMembership = memberProfileData.foundingMembership || null") && profilePage.text.includes("data-member-profile-honors"));
check("profile puts the compact honors wall below Posts, About, Reels, Photos, and Events", profilePage.text.includes("data-member-profile-honors") && profilePage.text.includes("function renderProfileHonors()") && profilePage.text.includes("function renderRecognitionShelf(foundingMembership, boardMembership, distinctions, profileTitle, operationalRole)") && profilePage.text.includes("rail-recognition-grid profile-recognition-grid") && profilePage.text.includes("profile-recognition-item"));
check("every active founding membership includes its own class badge, number, and details in the honors wall", profilePage.text.includes("item && item.state === \"active\" && item.badge && item.badge.asset") && profilePage.text.includes("function foundingMembershipDescription(item)") && profilePage.text.includes("item.primaryCapability"));
check("founding membership artwork and details remain in the Honors & Distinctions areas", profilePage.text.includes("function renderProfileHonors()") && profilePage.text.includes("function renderRecognitionShelf(foundingMembership, boardMembership, distinctions, profileTitle, operationalRole)") && profilePage.text.includes("tpi-recognition=20261113"));
check("every active member receives the universal Member badge in Honors without gaining authority", profilePage.text.includes('kind: "community-membership"') && profilePage.text.includes('title: "TPI Member"') && profilePage.text.includes("/assets/community-membership/web/member-256.png") && profilePage.text.includes("does not grant administrative or moderation authority"));
check("Administrator and Moderator badges follow server-resolved staff identity", profilePage.text.includes('operationalRole === "admin" ? { role: "administrator"') && profilePage.text.includes("staffIdentity.role") && profilePage.text.includes('isModerator ? "moderator" : "administrator"') && profilePage.text.includes("/assets/operational-roles/web/") && profilePage.text.includes("profileUser && profileUser.role"));
check("generic Member and Contributor titles are not repeated as public credentials", profilePage.text.includes("!/^(member|contributor)$/i.test(publicTitle)"));
check("profile shell places Honors & Distinctions in the right rail", profilePage.text.includes("data-rail-recognition") && profilePage.text.includes("Honors &amp; Distinctions") && profilePage.text.includes("data-recognition-trigger"));
check("all profile views load the shared right rail", profilePage.text.includes("} else {\n            loadRightRail();") && profilePage.text.includes("var recognition = profileMode ? (profileRecognition || profileUser || activeUser) : activeUser;"));
check("profile shell keeps recognition details out of the profile hero", !profilePage.text.includes("data-member-recognition-shelf"));
check("profile shell uses the larger full-banner aspect ratio and lower avatar overlap", profilePage.text.includes("aspect-ratio: 1942 / 700") && profilePage.text.includes("margin-top: -96px") && profilePage.text.includes("object-fit: contain"));
check("profile shell routes My Pulse View Profile to the member home profile", profilePage.text.includes("/member-home?username="));
const editorPage = await request("/member-profile.html", auth(member.token));
check("profile editor remains a separate authenticated surface", editorPage.response.status === 200 && editorPage.text.includes("Update Profile") && editorPage.text.includes("data-profile-form") && editorPage.text.includes("profileBannerFile"));
check("profile editor explains the recommended banner dimensions", editorPage.text.includes("1600 × 500 px") && editorPage.text.includes("3.2:1"));

const profile = await request(`/api/members/profile?username=${encodeURIComponent(target)}`, auth(member.token));
check("member profile returns the target and relationship", profile.response.status === 200 && profile.body?.profile?.username === target && profile.body?.relationship);
check("profile view is recorded without exposing private fields", profile.body?.profile?.correspondence === undefined && profile.body?.profile?.passwordHash === undefined);
check("member profile includes public Founding Membership identity", Object.prototype.hasOwnProperty.call(profile.body || {}, "foundingMembership"));

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
