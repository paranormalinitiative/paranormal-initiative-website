#!/usr/bin/env node
// TPI-GOVERNANCE-006 — shared Education Center subject-index contract.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const read = (file) => readFileSync(resolve(root, file), "utf8");
const catalog = read("education-subjects.js");
const index = read("education-center-subjects.js");
const center = read("education-center.html");
const editor = read("paper-editor.html");
const sidebar = read("member-sidebar.html");
const shell = read("member-shell.js");
const checks = [];
const check = (label, pass) => { checks.push({ label, pass: Boolean(pass) }); console.log(`${pass ? "PASS" : "FAIL"} ${label}`); };
const destinations = [
  "education-area-investigation-science.html", "education-area-evidence-science-analysis.html", "education-area-instrumentation-technology.html",
  "education-area-environmental-research.html", "education-area-evp-itc-research.html", "education-area-consciousness-human-experience.html",
  "education-area-ethics-professional-standards.html", "education-area-reporting-documentation.html", "education-area-education-community-development.html",
  "education-area-technology-development-ai.html", "education-area-artificial-intelligence.html", "education-area-historical-cultural-research.html",
  "investigation-development-series.html", "ghostology-101.html", "evp-itc-lessons.html", "field-articles.html", "method-exercises.html", "tpi-videos.html",
];
check("shared subject catalog exists", existsSync(resolve(root, "education-subjects.js")) && catalog.includes("TPI_EDUCATION_SUBJECTS"));
check("editor loads the shared catalog", editor.includes("education-subjects.js"));
check("Education Center loads the live subject index", center.includes('id="tpi-education-subject-directory"') && center.includes("education-center-subjects.js"));
check("Education Center exposes the complete subject shelves", center.includes('id="tpi-education-subject-directory"') && index.includes("edu-accordion-item") && index.includes("TPI_EDUCATION_SUBJECTS"));
check("Education Center has one research shelf directory", center.includes("Research Shelves") && center.includes("Browse the research library by subject.") && center.includes("Open a shelf to explore") && !center.includes("Featured Research Shelves") && !center.includes("Quick Start") && !center.includes("More Resources"));
check("Education Center explains its full research scope", center.includes("metaphysical traditions") && center.includes("witchcraft and folklore") && center.includes("consciousness and human experience") && center.includes("EVP and ITC"));
check("public Education Center copy omits workspace implementation details", !center.includes("Nova Editorial Workspace") && !index.includes("Editorial Workspace"));
check("public subject wording omits legacy labels", !catalog.includes("Legacy") && !index.includes("Legacy") && !center.includes("Legacy"));
check("Ghostology is the public subject label", catalog.includes('["ghostology-101.html", "Ghostology",') && !catalog.includes("Ghostology Reference") && !editor.includes("Ghostology Reference"));
check("left navigation links directly to Ghostology", sidebar.includes('href="ghostology-101?member=1" data-nav="ghostology"') && sidebar.includes("> Ghostology"));
check("Ghostology pages keep the Ghostology navigation item active", shell.includes('link.dataset.nav === "ghostology" && ghostologyPage') && shell.includes('slug.indexOf("ghostology-101-lesson-") === 0'));
check("all subject shelves stay inside the member content area", center.indexOf('id="tpi-education-subject-directory"') < center.lastIndexOf('id="site-footer"'));
check("subject links use clean extensionless paths", index.includes("function subjectHref") && index.includes("replace(/\\.html$/, \"\")") && index.includes('const href = `/${path}`'));
check("published article API is used without local-only data", index.includes("/api/articles?page=1&pageSize=100") && index.includes("status"));
for (const destination of destinations) check(`subject is present: ${destination}`, catalog.includes(`"${destination}"`));
check("Water & Steam ITC subject resource is available", index.includes("evp-itc-lesson-water-steam"));
check("all catalog subjects render a shelf", index.includes("subjects.map((subject, index) =>") && index.includes("edu-accordion-item"));
check("subject shelves include direct subject guides", index.includes("subjectOverview: true") && index.includes("subjectHref(subject.value)"));
check("published resources stay with their assigned subject", index.includes("groups.has(normalized)") && index.includes("groups.get(normalized).push"));
check("subject articles link to their canonical destination", index.includes("articleHref") && index.includes("data-subject-overview"));
const failed = checks.filter((item) => !item.pass);
console.log(`\nTPI-GOVERNANCE-006 subject index: ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exitCode = 1;
