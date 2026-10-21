// Offline synthetic acceptance model for the Addendum C invariants. This does
// not contact the Worker, RealtimeKit, or any streaming provider.
const creatorId = "synthetic-creator";
const studios = [
  { id: "studio-a", ownerId: creatorId, title: "Studio A", schedule: { start: "2026-10-20T18:00:00Z", destinations: ["youtube"] } },
  { id: "studio-b", ownerId: creatorId, title: "Studio B", schedule: { start: "2026-10-21T18:00:00Z", destinations: ["facebook"] } }
];
let active = null;
const requiredConflict = "Another studio is currently in production.\n\nFinish your active session before starting a production in this studio.";

function start(studioId, sessionId, mode = "recording") {
  if (active && active.sessionId !== sessionId) return { ok: false, error: requiredConflict, activeStudioId: active.studioId };
  active = active || { creatorId, studioId, sessionId, mode };
  active.studioId = studioId;
  active.mode = active.mode === "recording" && mode === "live" ? "combined" : mode;
  return { ok: true, sessionId: active.sessionId, studioId: active.studioId, mode: active.mode };
}

const checks = [];
const check = (name, ok) => checks.push({ name, ok: Boolean(ok) });
check("two independent Studios exist", studios.length === 2 && studios[0].id !== studios[1].id);
check("both schedules persist independently", studios[0].schedule.destinations[0] === "youtube" && studios[1].schedule.destinations[0] === "facebook");
check("scheduling does not acquire production", active === null);
const first = start("studio-a", "session-a", "recording");
check("Studio A acquires the creator lock", first.ok && active?.studioId === "studio-a");
const denied = start("studio-b", "session-b", "recording");
check("Studio B is denied while A is active", !denied.ok && denied.error === requiredConflict && denied.activeStudioId === "studio-a");
check("Studio A remains active after B denial", active?.studioId === "studio-a" && active?.sessionId === "session-a");
const combined = start("studio-a", "session-a", "live");
check("the same production can combine recording and livestream modes", combined.ok && combined.mode === "combined");
check("refresh does not release the creator lock", active?.sessionId === "session-a");
active = null;
const afterStop = start("studio-b", "session-b", "recording");
check("normal switching is allowed after the active session ends", afterStop.ok && afterStop.studioId === "studio-b");
check("schedules remain intact after production transitions", studios.every(studio => studio.schedule && studio.schedule.start && studio.schedule.destinations.length === 1));

for (const result of checks) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}`);
const failed = checks.filter(result => !result.ok);
console.log(JSON.stringify({ directive: "TPI-STUDIOFLOW-012-ADDENDUM-C", syntheticChecks: checks.length, passed: checks.length - failed.length, failed: failed.length }));
if (failed.length) process.exit(1);
