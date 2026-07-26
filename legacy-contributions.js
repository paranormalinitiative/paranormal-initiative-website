(function () {
  const contributions = {
    todd: [
      { title: "EVP / ITC Research", subtitle: "Research position", href: "evp-itc-research.html" },
      { title: "Raising The Standards Of Paranormal Investigation", subtitle: "Investigation Development Series", href: "investigation-development-raising-the-standards.html" },
      { title: "What Is Paranormal Investigation?", subtitle: "Education Center Research", href: "education-research-what-is-paranormal-investigation.html" },
      { title: "What Is Ghost Hunting?", subtitle: "Education Center Research", href: "education-research-what-is-ghost-hunting.html" },
      { title: "Why People Choose to Investigate the Paranormal", subtitle: "Education Center Research", href: "education-research-why-investigate-paranormal.html" },
      { title: "Basic Terminology and Foundational Language", subtitle: "Education Center Research", href: "education-research-foundational-terminology-paranormal-research.html" },
      { title: "Basic Field Safety and Permission", subtitle: "Education Center Research", href: "education-research-field-safety-permission.html" },
      { title: "Basic Observation and Note-Taking", subtitle: "Education Center Research", href: "education-research-observation-note-taking.html" },
      { title: "Introduction to Equipment and What Tools Actually Measure", subtitle: "Education Center Research", href: "education-research-equipment-what-tools-measure.html" },
      { title: "How Beginners Choose and Research a Location", subtitle: "Education Center Research", href: "education-research-choosing-researching-location.html" },
      { title: "Introduction to Audio, Photo, and Video Review", subtitle: "Education Center Research", href: "education-research-audio-photo-video-review.html" },
      { title: "Investigation Ethics and Professional Conduct", subtitle: "Education Center Research", href: "education-research-investigation-ethics-professional-conduct.html" },
      { title: "Professional Investigation Documentation and Reporting", subtitle: "Education Center Research", href: "education-research-professional-documentation-reporting.html" },
      { title: "Debunking Basics and Natural Explanations", subtitle: "Education Center Research", href: "education-research-debunking-natural-explanations.html" },
      { title: "Weather, Environment, and Building-Science Causes", subtitle: "Education Center Research", href: "education-research-weather-environment-building-science-causes.html" },
      { title: "Psychological Triggers of Paranormal Experiences", subtitle: "Education Center Research", href: "education-research-psychological-triggers-paranormal-experiences.html" },
      { title: "Spiritual, Religious, and Demonic-Claim Language", subtitle: "Education Center Research", href: "education-research-spiritual-religious-demonic-claim-language.html" },
      { title: "Types of Hauntings and Claim Categories", subtitle: "Education Center Research", href: "education-research-types-hauntings-claim-categories.html" },
      { title: "Historical Records, Local Legends, Cemeteries, and Oral History", subtitle: "Education Center Research", href: "education-research-historical-records-local-legends-cemeteries-oral-history.html" },
      { title: "History of Hauntings, Folklore, Ghost Hunting, and Psychical Research", subtitle: "Education Center Research", href: "education-research-history-hauntings-folklore-psychical-research.html" },
      { title: "Personal Experience, Curiosity, Belief, Fear, Grief, Social Media, and the Search for Meaning", subtitle: "Education Center Research", href: "education-research-motivations-meaning-paranormal-experience.html" }
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
    contributorKey,
    forProfile
  };
}());
