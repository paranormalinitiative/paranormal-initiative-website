import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(new URL("../..", import.meta.url).pathname);
const required = [
  "admin-center-app/package.json",
  "admin-center-app/components.json",
  "admin-center-app/src/main.tsx",
  "admin-center-app/src/app.tsx",
  "admin-center-app/src/index.css",
  "admin-center-preview/index.html",
  "worker.js",
  "docs/audits/TPI-ADMIN-005/BASELINE.md"
];
const missing = required.filter((file) => !existsSync(join(root, file)));
if (missing.length) throw new Error(`Missing TPI-ADMIN-005 preview files: ${missing.join(", ")}`);

const worker = readFileSync(join(root, "worker.js"), "utf8");
const app = readFileSync(join(root, "admin-center-app/src/app.tsx"), "utf8");
const built = readdirSync(join(root, "admin-center-preview/assets"));
const checks = {
  workerGate: worker.includes('url.pathname === "/admin-center-preview"') && worker.includes('url.pathname.startsWith("/admin-center-preview/")') && worker.includes('user.role === "owner" || user.role === "admin"'),
  refineRuntime: readFileSync(join(root, "admin-center-app/src/main.tsx"), "utf8").includes("<Refine dataProvider={dataProvider}"),
  shadcnSource: app.includes("@/components/ui/card") && existsSync(join(root, "admin-center-app/src/components/ui/button.tsx")),
  apiBoundaries: app.includes("/admin/members/") && app.includes("/admin/overview") && app.includes("/admin/audit-logs"),
  builtAssets: built.some((file) => file.endsWith(".js")) && built.some((file) => file.endsWith(".css")),
  legacyPreservation: worker.includes('"/admin-panel.html"') && worker.includes('"/admin-panel"')
};
const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
for (const [name, passed] of Object.entries(checks)) console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
if (failures.length) process.exitCode = 1;
