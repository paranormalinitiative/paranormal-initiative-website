// Shared Education Center subject catalog.
// The Content Editor and public library consume the same destination values so
// published contributor work cannot disappear because two lists drift apart.
(function () {
  const subjects = [
    ["education-area-investigation-science.html", "Investigation Science", "Practice, planning, methodology, techniques, and workflows."],
    ["education-area-evidence-science-analysis.html", "Evidence Science & Analysis", "Collection, preservation, review, and evidence-based findings."],
    ["education-area-instrumentation-technology.html", "Instrumentation & Technology", "Tools, instruments, technical controls, and responsible use."],
    ["education-area-environmental-research.html", "Environmental Research", "Environmental context, location conditions, and field documentation."],
    ["education-area-evp-itc-research.html", "EVP / ITC Research", "Audio, instrumental transcommunication, review, and source awareness."],
    ["education-area-consciousness-human-experience.html", "Consciousness & Human Experience", "Experience reports, perception, belief, grief, and careful interpretation."],
    ["education-area-ethics-professional-standards.html", "Ethics & Professional Standards", "Consent, privacy, conduct, evidence language, and professional responsibility."],
    ["education-area-reporting-documentation.html", "Reporting & Documentation", "Case records, field notes, citation, preservation, and reproducible reporting."],
    ["education-area-education-community-development.html", "Community Development & Publication", "Teaching, outreach, collaboration, and public-facing research."],
    ["education-area-technology-development-ai.html", "Technology Development", "Software, engineering, experiments, and applied technical research."],
    ["education-area-artificial-intelligence.html", "Artificial Intelligence", "AI-assisted research, transparency, limitations, and responsible use."],
    ["education-area-historical-cultural-research.html", "Historical & Cultural Research", "History, folklore, cultural context, and source-aware interpretation."],
    ["investigation-development-series.html", "Investigation Development Series", "Foundational and advanced investigation development lessons."],
    ["ghostology-101.html", "Ghostology Reference", "Foundational lessons and paranormal vocabulary."],
    ["evp-itc-lessons.html", "EVP / ITC Research Notes", "EVP, ITC, water, steam, and reflective-surface research notes."],
    ["field-articles.html", "Field Articles", "Field articles and practical investigator reports."],
    ["method-exercises.html", "Method Exercises", "Methods, exercises, and guided practice."],
    ["tpi-videos.html", "TPI Videos", "Video-linked contributor work and demonstrations."],
  ].map(([value, label, description]) => ({ value, label, description }));

  window.TPI_EDUCATION_SUBJECTS = Object.freeze(subjects);

  const destination = document.getElementById("editor-destination");
  if (destination) {
    const current = destination.value;
    destination.replaceChildren(...subjects.map((subject) => {
      const option = document.createElement("option");
      option.value = subject.value;
      option.textContent = subject.label;
      return option;
    }));
    if (subjects.some((subject) => subject.value === current)) destination.value = current;
  }
})();
