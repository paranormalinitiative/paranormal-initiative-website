import { readFileSync } from "node:fs";

const baseUrl = (process.env.TPI_DEV022_BASE_URL || "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev").replace(/\/$/, "");
const memberCredentialPath = process.env.TPI_DEV021_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-021/credentials.json";
const adminCredentialPath = process.env.TPI_DEV014_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-014/credentials.json";
const memberCredentials = JSON.parse(readFileSync(memberCredentialPath, "utf8"));
const adminCredentials = JSON.parse(readFileSync(adminCredentialPath, "utf8"));
const memberA = memberCredentials.accounts.find(account => account.username === "tpi-dev021-a");
const memberB = memberCredentials.accounts.find(account => account.username === "tpi-dev021-b");
const admin = adminCredentials.accounts.find(account => account.username === "tpi-dev014-admin");

if (!memberA || !memberB || !admin) throw new Error("Required local synthetic credentials are unavailable.");

const results = [];
const record = (name, ok, detail = "") => results.push({ name, ok, detail });

async function request(path, options = {}, cookie = "") {
  const headers = new Headers(options.headers || {});
  if (cookie) headers.set("cookie", cookie);
  if (options.body != null && typeof options.body === "string" && !headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers, redirect: "manual" });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text.slice(0, 300); }
  return { response, body, bytes: Buffer.byteLength(text) };
}

async function login(account) {
  const result = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ username: account.username, password: account.password }) });
  return { ...result, cookie: (result.response.headers.get("set-cookie") || "").split(";")[0] };
}

function expectStatus(name, result, expected) {
  record(name, result.response.status === expected, `HTTP ${result.response.status}; expected ${expected}`);
}

function expectAnyStatus(name, result, expected) {
  record(name, expected.includes(result.response.status), `HTTP ${result.response.status}; expected ${expected.join("/")}`);
}

function expect(name, condition, detail) { record(name, Boolean(condition), detail); }

async function main() {
  const memberLogin = await login(memberA);
  const memberBLogin = await login(memberB);
  const adminLogin = await login(admin);
  expectStatus("member A login", memberLogin, 200);
  expectStatus("member B login", memberBLogin, 200);
  expectStatus("admin login", adminLogin, 200);
  const cookieA = memberLogin.cookie;
  const cookieB = memberBLogin.cookie;
  const adminCookie = adminLogin.cookie;

  const privateUnauthenticated = await request("/api/admin/events?status=all&pageSize=1");
  expectAnyStatus("admin event API is protected", privateUnauthenticated, [401, 403]);
  const nonAdminEvents = await request("/api/admin/events?status=all&pageSize=1", {}, cookieA);
  expectStatus("member cannot read admin event API", nonAdminEvents, 403);
  const anonymousEventCreate = await request("/api/events", { method: "POST", body: JSON.stringify({}) });
  expectAnyStatus("anonymous event create is protected", anonymousEventCreate, [401, 403]);
  const memberEventCreate = await request("/api/events", { method: "POST", body: JSON.stringify({}) }, cookieA);
  expectStatus("ordinary member event create is protected", memberEventCreate, 403);

  const uploadBody = new FormData();
  uploadBody.append("file", new File([Buffer.from("TPI-DEV-022 private media fixture\n")], "tpi-dev-022-fixture.txt", { type: "text/plain" }));
  const upload = await request("/api/uploads/library", { method: "POST", body: uploadBody }, cookieA);
  expectStatus("private library upload", upload, 200);
  const privateUrl = upload.body?.url || "";
  const privateKey = upload.body?.key || "";
  expect("private library upload returns media URL and key", Boolean(privateUrl && privateKey), JSON.stringify({ hasUrl: Boolean(privateUrl), hasKey: Boolean(privateKey) }));
  if (privateUrl) {
    const ownerMedia = await request(privateUrl, {}, cookieA);
    expectStatus("owner can retrieve private media", ownerMedia, 200);
    expect("private media content type is preserved", ownerMedia.response.headers.get("content-type") === "text/plain", ownerMedia.response.headers.get("content-type") || "missing");
    const anonymousMedia = await request(privateUrl);
    expectStatus("anonymous private media denied", anonymousMedia, 401);
    const otherMedia = await request(privateUrl, {}, cookieB);
    expectStatus("other member private media denied", otherMedia, 404);
  }
  const library = await request("/api/me/library?kind=file", {}, cookieA);
  expectStatus("private library listing", library, 200);
  expect("uploaded private media appears in library", (library.body?.items || []).some(item => item.url === privateUrl), `items=${library.body?.items?.length || 0}`);

  if (process.env.TPI_DEV022_SKIP_EVENT_MUTATION !== "1") {
  const syntheticTitle = `[TPI-DEV-022] API event ${Date.now()}`;
  const eventPayload = {
    title: syntheticTitle,
    type: "workshop",
    category: "education",
    description: "Development-only event persistence fixture.",
    startDate: "2026-12-01T19:00",
    endDate: "2026-12-01T21:00",
    locationName: "TPI Development Lab",
    address: "1 Synthetic Way",
    city: "Somerset",
    state: "NJ",
    country: "United States",
    isVirtual: false,
    organizerName: "TPI Development QA",
    organizerUrl: "https://example.invalid/tpi-dev-022",
    maxAttendees: 25,
    price: "Free",
    source: "tpi-dev-022"
  };
  const createEvent = await request("/api/events", { method: "POST", body: JSON.stringify(eventPayload) }, adminCookie);
  expectStatus("admin event create", createEvent, 200);
  const eventId = String(createEvent.body?.id || "");
  expect("event id returned", Boolean(eventId), "id present");
  if (eventId) {
    const detail = await request(`/api/admin/events/${encodeURIComponent(eventId)}`, {}, adminCookie);
    expectStatus("admin event detail", detail, 200);
    expect("created event persists tested fields and server-owned source", detail.body?.event?.address === eventPayload.address && detail.body?.event?.max_attendees === eventPayload.maxAttendees && detail.body?.event?.price === eventPayload.price && detail.body?.event?.source === "admin", JSON.stringify({ address: detail.body?.event?.address, maxAttendees: detail.body?.event?.max_attendees, price: detail.body?.event?.price, source: detail.body?.event?.source }));
    const invalidUpdate = await request(`/api/admin/events/${encodeURIComponent(eventId)}`, { method: "PUT", body: JSON.stringify({ ...eventPayload, endDate: "2026-11-30T21:00", organizerUrl: "javascript:alert(1)" }) }, adminCookie);
    expectStatus("invalid event update is rejected", invalidUpdate, 400);
    const memberEventUpdate = await request(`/api/admin/events/${encodeURIComponent(eventId)}`, { method: "PUT", body: JSON.stringify(eventPayload) }, cookieA);
    expectStatus("ordinary member event update is protected", memberEventUpdate, 403);
    const updated = await request(`/api/admin/events/${encodeURIComponent(eventId)}`, { method: "PUT", body: JSON.stringify({ ...eventPayload, title: `${syntheticTitle} updated`, city: "New Brunswick" }) }, adminCookie);
    expectStatus("admin event update", updated, 200);
    expect("event update persisted", updated.body?.event?.title === `${syntheticTitle} updated` && updated.body?.event?.city === "New Brunswick", "updated title and city read from API");
    const publicEvent = await request(`/api/events/${encodeURIComponent(eventId)}`);
    expectStatus("approved event is publicly readable", publicEvent, 200);
    const cancelled = await request(`/api/admin/events/${encodeURIComponent(eventId)}`, { method: "DELETE" }, adminCookie);
    expectStatus("admin event cancel", cancelled, 200);
    expect("event cancellation is non-destructive", cancelled.body?.status === "cancelled", JSON.stringify(cancelled.body));
    const cancelledDetail = await request(`/api/admin/events/${encodeURIComponent(eventId)}`, {}, adminCookie);
    expect("cancelled event remains auditable", cancelledDetail.body?.event?.status === "cancelled" && Boolean(cancelledDetail.body?.event?.updated_at), JSON.stringify({ status: cancelledDetail.body?.event?.status, updatedAt: cancelledDetail.body?.event?.updated_at }));
    const memberEventCancel = await request(`/api/admin/events/${encodeURIComponent(eventId)}`, { method: "DELETE" }, cookieA);
    expectStatus("ordinary member event cancellation is protected", memberEventCancel, 403);
    const hiddenEvent = await request(`/api/events/${encodeURIComponent(eventId)}`);
    expectStatus("cancelled event is hidden from public detail", hiddenEvent, 404);
    const audit = await request(`/api/admin/audit-logs?target=${encodeURIComponent(eventId)}&limit=10`, {}, adminCookie);
    expectStatus("event audit history is readable to admin", audit, 200);
    const auditedActions = new Set((audit.body?.logs || []).map(log => log.action));
    expect("event create update cancel actions are audited", auditedActions.has("event.created") && auditedActions.has("event.updated") && auditedActions.has("event.cancelled"), JSON.stringify({ actions: [...auditedActions] }));
  }
  }

  const studioDenied = await request("/api/studio/rooms", { method: "POST", body: JSON.stringify({ title: "TPI-DEV-022 should remain denied", broadcastKey: "tpi-dev-022" }) }, cookieA);
  expectStatus("ordinary member StudioFlow entitlement gate", studioDenied, 403);

  const sourceChecks = [
    ["search uses static index", readFileSync("search.js", "utf8").includes("window.TPI_SEARCH_INDEX")],
    ["search loads published API content", readFileSync("search.js", "utf8").includes("/api/articles") && readFileSync("search.js", "utf8").includes("/api/contributors")],
    ["media retrieval enforces private-library ownership", readFileSync("functions/api/[[path]].js", "utf8").includes("customMetadata?.contributorId !== user.id")],
    ["event admin page calls API", readFileSync("admin-events.html", "utf8").includes("/api/admin/events") && !readFileSync("admin-events.html", "utf8").includes("TODO: Send to API")],
    ["StudioFlow browser library boundary is explicit", readFileSync("studio/assets/index-j2x9m9vI.js", "utf8").includes("Browser Storage")]
  ];
  sourceChecks.forEach(([name, ok]) => record(name, ok, ok ? "source contract present" : "source contract missing"));

  const summary = { passed: results.filter(item => item.ok).length, failed: results.filter(item => !item.ok).length, results };
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failed) process.exitCode = 1;
}

main().catch(error => {
  console.error(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
  process.exitCode = 1;
});
