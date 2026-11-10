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
check("Education Center has one featured shelf directory", center.includes("Featured Research Shelves") && center.includes("Start with selected lessons and guides.") && !center.includes("Quick Start") && !center.includes("More Resources"));
check("public Education Center copy omits workspace implementation details", !center.includes("Nova Editorial Workspace") && !index.includes("Editorial Workspace"));
check("all subject shelves stay inside the member content area", center.indexOf('id="tpi-education-subject-directory"') < center.lastIndexOf('id="site-footer"'));
check("subject links use clean extensionless paths", index.includes("function subjectHref") && index.includes("replace(/\\.html$/, \"\")") && index.includes('const href = `/${path}`'));
check("published article API is used without local-only data", index.includes("/api/articles?page=1&pageSize=100") && index.includes("status"));
for (const destination of destinations) check(`subject is present: ${destination}`, catalog.includes(`"${destination}"`));
check("legacy Water & Steam ITC reference is visible", index.includes("evp-itc-lesson-water-steam"));
check("all catalog subjects render a shelf", index.includes("subjects.map((subject, index) =>") && index.includes("edu-accordion-item"));
check("subject shelves include direct subject guides", index.includes("subjectOverview: true") && index.includes("subjectHref(subject.value)"));
check("subject resources are collected from the subject pages", index.includes("study-resource-card") && index.includes("series-post-card") && index.includes("ghostology-lesson-card"));
check("subject articles link to their canonical destination", index.includes("articleHref") && index.includes("data-subject-overview"));
const failed = checks.filter((item) => !item.pass);
console.log(`\nTPI-GOVERNANCE-006 subject index: ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exitCode = 1;
