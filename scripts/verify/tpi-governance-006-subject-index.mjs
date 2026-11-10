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
check("Education Center loads the live subject index", center.includes('id="tpi-contributor-subject-index"') && center.includes("education-center-subjects.js"));
check("Education Center exposes the complete subject directory", center.includes('id="tpi-education-subject-directory"') && index.includes("tpi-education-directory-grid") && index.includes("TPI_EDUCATION_SUBJECTS"));
check("subject links use clean extensionless paths", index.includes("function subjectHref") && index.includes("replace(/\\.html$/, \"\")") && index.includes('const href = `/${path}`'));
check("published article API is used without local-only data", index.includes("/api/articles?page=1&pageSize=100") && index.includes("status"));
for (const destination of destinations) check(`subject is present: ${destination}`, catalog.includes(`"${destination}"`));
check("legacy Water & Steam ITC reference is visible", index.includes("evp-itc-lesson-water-steam.html"));
check("subject articles link to their canonical destination", index.includes("Open subject") && index.includes("articleHref"));
const failed = checks.filter((item) => !item.pass);
console.log(`\nTPI-GOVERNANCE-006 subject index: ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exitCode = 1;
