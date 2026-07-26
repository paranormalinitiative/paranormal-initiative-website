(function () {
  const destinations = {
    investigation: "education-area-investigation-science.html",
    evidence: "education-area-evidence-science-analysis.html",
    instrumentation: "education-area-instrumentation-technology.html",
    environment: "education-area-environmental-research.html",
    evpItc: "education-area-evp-itc-research.html",
    consciousness: "education-area-consciousness-human-experience.html",
    ethics: "education-area-ethics-professional-standards.html",
    reporting: "education-area-reporting-documentation.html",
    historical: "education-area-historical-cultural-research.html",
    investigationDevelopment: "investigation-development-series.html"
  };

  const contributions = {
    todd: [
      { title: "EVP / ITC Research", subtitle: "Research position", href: "evp-itc-research.html", destination: destinations.evpItc, contributionType: "Research Paper" },
      { title: "Raising The Standards Of Paranormal Investigation", subtitle: "Investigation Development Series", href: "investigation-development-raising-the-standards.html", destination: destinations.investigationDevelopment, contributionType: "Field Article" },
      { title: "What Is Paranormal Investigation?", subtitle: "Education Center Research", href: "education-research-what-is-paranormal-investigation.html", destination: destinations.investigation, contributionType: "Research Paper" },
      { title: "What Is Ghost Hunting?", subtitle: "Education Center Research", href: "education-research-what-is-ghost-hunting.html", destination: destinations.investigation, contributionType: "Research Paper" },
      { title: "Why People Choose to Investigate the Paranormal", subtitle: "Education Center Research", href: "education-research-why-investigate-paranormal.html", destination: destinations.investigation, contributionType: "Research Paper" },
      { title: "Basic Terminology and Foundational Language", subtitle: "Education Center Research", href: "education-research-foundational-terminology-paranormal-research.html", destination: destinations.investigation, contributionType: "Research Paper" },
      { title: "Basic Field Safety and Permission", subtitle: "Education Center Research", href: "education-research-field-safety-permission.html", destination: destinations.ethics, contributionType: "Field Article" },
      { title: "Basic Observation and Note-Taking", subtitle: "Education Center Research", href: "education-research-observation-note-taking.html", destination: destinations.reporting, contributionType: "Field Article" },
      { title: "Introduction to Equipment and What Tools Actually Measure", subtitle: "Education Center Research", href: "education-research-equipment-what-tools-measure.html", destination: destinations.instrumentation, contributionType: "Technical Note" },
      { title: "How Beginners Choose and Research a Location", subtitle: "Education Center Research", href: "education-research-choosing-researching-location.html", destination: destinations.historical, contributionType: "Field Article" },
      { title: "Introduction to Audio, Photo, and Video Review", subtitle: "Education Center Research", href: "education-research-audio-photo-video-review.html", destination: destinations.evidence, contributionType: "Media Review" },
      { title: "Investigation Ethics and Professional Conduct", subtitle: "Education Center Research", href: "education-research-investigation-ethics-professional-conduct.html", destination: destinations.ethics, contributionType: "Research Paper" },
      { title: "Professional Investigation Documentation and Reporting", subtitle: "Education Center Research", href: "education-research-professional-documentation-reporting.html", destination: destinations.reporting, contributionType: "Research Paper" },
      { title: "Debunking Basics and Natural Explanations", subtitle: "Education Center Research", href: "education-research-debunking-natural-explanations.html", destination: destinations.evidence, contributionType: "Research Paper" },
      { title: "Weather, Environment, and Building-Science Causes", subtitle: "Education Center Research", href: "education-research-weather-environment-building-science-causes.html", destination: destinations.environment, contributionType: "Research Paper" },
      { title: "Psychological Triggers of Paranormal Experiences", subtitle: "Education Center Research", href: "education-research-psychological-triggers-paranormal-experiences.html", destination: destinations.consciousness, contributionType: "Research Paper" },
      { title: "Spiritual, Religious, and Demonic-Claim Language", subtitle: "Education Center Research", href: "education-research-spiritual-religious-demonic-claim-language.html", destination: destinations.historical, contributionType: "Research Paper" },
      { title: "Types of Hauntings and Claim Categories", subtitle: "Education Center Research", href: "education-research-types-hauntings-claim-categories.html", destination: destinations.investigation, contributionType: "Research Paper" },
      { title: "Historical Records, Local Legends, Cemeteries, and Oral History", subtitle: "Education Center Research", href: "education-research-historical-records-local-legends-cemeteries-oral-history.html", destination: destinations.historical, contributionType: "Case / Location Study" },
      { title: "History of Hauntings, Folklore, Ghost Hunting, and Psychical Research", subtitle: "Education Center Research", href: "education-research-history-hauntings-folklore-psychical-research.html", destination: destinations.historical, contributionType: "Research Paper" },
      { title: "Personal Experience, Curiosity, Belief, Fear, Grief, Social Media, and the Search for Meaning", subtitle: "Education Center Research", href: "education-research-motivations-meaning-paranormal-experience.html", destination: destinations.consciousness, contributionType: "Research Paper" }
    ]
  };

  function contributorKey(profile) {
    const name = `${profile?.displayName || ""} ${profile?.username || ""}`.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (name.includes("toddwayne") || name.includes("tpiowner")) return "todd";
    return "";
  }

  function forProfile(profile) {
    return contributions[contributorKey(profile)] || [];
  }

  window.TPILegacyContributions = {
    all: contributions,
    destinations,
    contributorKey,
    forProfile
  };
}());
