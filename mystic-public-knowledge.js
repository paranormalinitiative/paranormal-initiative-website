(function () {
  "use strict";

  // Public/member-facing sources only. Internal Help Desk and Administration
  // material must never be added to this index.
  window.TPI_MYSTIC_PUBLIC_KNOWLEDGE = {
    version: 2,
    audience: "public-member",
    answers: [
      {
        id: "emf-meter-basics",
        sourceId: "emf-equipment",
        title: "How TPI uses MEL and EMF meters",
        patterns: ["how do mel meters work", "how does an emf meter work", "what is an emf meter", "what is a mel meter", "how do emf meters work", "mel meter"],
        answer: "A MEL or EMF meter measures electromagnetic-field conditions at the instrument. It is not a ghost detector by itself. Establish a baseline, note the device model and settings, check nearby wiring and electronics, repeat the reading, and record the location and time before treating a change as an observation worth investigating. A spike is data to explain, not proof of a paranormal cause."
      },
      {
        id: "weather-and-investigation-data",
        sourceId: "weather-environment",
        title: "How weather can affect investigation data",
        patterns: ["how does weather affect paranormal investigation", "weather affects data", "does weather affect emf", "weather and paranormal data", "humidity affect investigation", "barometric pressure paranormal"],
        answer: "Weather can change the environment around an investigation. Temperature, humidity, barometric pressure, wind, storms, moisture, static electricity, building movement, and power conditions can affect people, sensors, sound, light, and equipment. Record the conditions with the reading, compare them with a baseline, and do not treat a weather-linked change as proof of a paranormal cause."
      },
      {
        id: "investigation-intake-basics",
        sourceId: "investigation-compendium",
        title: "How to conduct a responsible case intake",
        patterns: ["how do i do an intake", "how to do intake", "paranormal case intake", "client intake investigation", "what goes in an investigation intake", "how do i take an intake"],
        answer: "Begin intake by recording permission and contact information, the location and dates, who experienced or witnessed what, the exact words used to describe it, prior reports, relevant environmental or medical context volunteered by the witness, safety concerns, and what the client wants investigated. Keep testimony separate from your interpretation, protect private information, and confirm permission before visiting or recording."
      },
      {
        id: "investigation-walkthrough-basics",
        sourceId: "walkthrough-guide",
        title: "How to conduct an investigation walkthrough",
        patterns: ["how do i conduct a walkthrough", "how to do a walkthrough", "investigation walkthrough", "walk through an investigation", "what do i do on a walkthrough", "walkthrough first investigation"],
        answer: "A walkthrough starts with permission, safety, and orientation. Move through the location without assuming a cause, identify rooms and ordinary sources, note access and hazards, establish baseline readings under normal conditions, and mark where later observations occur. Keep a time-stamped log and preserve the original notes so the walkthrough remains a map for disciplined follow-up rather than a hunt for dramatic moments."
      },
      {
        id: "ghost-definition",
        sourceId: "terminology-reference",
        title: "What TPI means by ghost",
        patterns: [
          "what is a ghost",
          "what are ghosts",
          "define ghost",
          "ghost definition",
          "what does ghost mean",
          "tell me about ghosts"
        ],
        answer: "At TPI, a ghost is a perceived manifestation, presence, or appearance believed to be associated with a deceased individual. We treat ghost as a working description of a report, not as a proven conclusion. A careful investigation documents what was observed and checks environmental explanations, witness contamination, suggestion, folklore influence, and perceptual error before assigning the label."
      },
      {
        id: "thoughtform-definition",
        sourceId: "terminology-reference",
        sourceIds: [
          "terminology-reference",
          "field-encyclopedia",
          "investigation-compendium",
          "evidence-compendium",
          "forensic-analysis-compendium",
          "ghostology-101"
        ],
        title: "What TPI means by thoughtform and tulpa",
        patterns: [
          "what is a thoughtform",
          "what is a thought form",
          "define thoughtform",
          "define thought form",
          "thoughtform meaning",
          "thought form meaning",
          "what is a tulpa",
          "define tulpa",
          "tulpas",
          "thoughtforms"
        ],
        answer: "A thoughtform is a concept from esoteric and paranormal traditions describing an apparent form, presence, or agent associated with sustained thought, expectation, emotion, imagination, or group belief. Tulpa is a related term whose meaning varies across Tibetan Buddhist, modern occult, and internet subcultures; it should not be treated as a single universally defined phenomenon. At TPI, these are research and report terms—not proof that an independently existing entity has been created. Document the witness account, circumstances, expectations, environmental conditions, and repeatability, then test ordinary explanations before drawing a conclusion."
      }
    ],
    sources: [
      {
        id: "repository",
        kind: "Public repository",
        title: "TPI Educational Repository",
        url: "/repository.html",
        summary: "Browse TPI field guides, terminology, investigation methods, evidence review, EVP/ITC references, equipment information, and public haunted-location research.",
        keywords: ["repository", "research library", "reference library", "field guide", "research material"]
      },
      {
        id: "repository-pathways",
        kind: "Guided reading",
        title: "Repository Pathways",
        url: "/repository-pathways.html",
        summary: "Choose a guided route through the public TPI references for new investigators, field cases, EVP/ITC, equipment, or haunted-location research.",
        keywords: ["pathway", "reading route", "where should i start", "beginner", "learn investigation"]
      },
      {
        id: "field-encyclopedia",
        kind: "Public reference guide",
        title: "Official Field Encyclopedia",
        url: "/TPI_Field_Encyclopedia.html",
        summary: "A broad field reference for haunting classification, equipment science, entity theory, and TPI investigation standards.",
        keywords: ["encyclopedia", "classification", "equipment science", "entity theory", "field reference"]
      },
      {
        id: "terminology-reference",
        kind: "Public reference guide",
        title: "Complete Paranormal Terminology",
        url: "/TPI_Terminology_Reference_Unified.html",
        summary: "An A-Z reference for paranormal research language, evidence classification, field methodology, entity theory, psychology, and analysis.",
        keywords: ["terminology", "definition", "term", "what does", "glossary", "language", "ghost", "ghosts", "spirit", "apparition", "thoughtform", "thought form", "tulpa", "tulpas"]
      },
      {
        id: "investigation-compendium",
        kind: "Public reference guide",
        title: "Investigation Compendium",
        url: "/TPI_Investigation_Compendium.html",
        summary: "End-to-end public guidance for intake, property research, walkthroughs, baselines, field work, evidence analysis, reporting, and case archival.",
        keywords: ["investigation methods", "run a case", "case process", "intake", "walkthrough", "baselines", "reporting"]
      },
      {
        id: "emf-equipment",
        kind: "Public equipment guide",
        title: "TPI EMF and MEL meter guidance",
        url: "/equipment-emf-k2-meters.html",
        summary: "Learn what electromagnetic-field meters measure, how to establish a baseline, and how to document readings without treating instrument changes as proof.",
        keywords: ["emf meter", "mel meter", "k2 meter", "electromagnetic field", "baseline reading", "equipment"]
      },
      {
        id: "weather-environment",
        kind: "Public environmental guide",
        title: "Weather, environment, and investigation data",
        url: "/education-research-weather-environment-building-science-causes.html",
        summary: "Document weather, building, electrical, and environmental conditions that may influence readings, witness experience, or recording quality.",
        keywords: ["weather", "humidity", "temperature", "barometric pressure", "environment", "building science", "data quality"]
      },
      {
        id: "walkthrough-guide",
        kind: "Public investigation guide",
        title: "Walkthroughs and baseline readings",
        url: "/investigation-development-walkthroughs-baseline-readings.html",
        summary: "Use permission, orientation, safety checks, ordinary-source notes, and baseline readings to prepare a responsible investigation.",
        keywords: ["walkthrough", "walk through", "baseline", "baselines", "orientation", "first investigation"]
      },
      {
        id: "forensic-analysis-compendium",
        kind: "Public reference guide",
        title: "Forensic Analysis Compendium",
        url: "/TPI_Forensic_Analysis_Compendium.html",
        summary: "Disciplined public guidance for reviewing photo, video, audio, EVP, blind-review, and final classification practices.",
        keywords: ["forensic", "analyze evidence", "photo analysis", "video analysis", "audio analysis", "evp review"]
      },
      {
        id: "evidence-compendium",
        kind: "Public reference guide",
        title: "Evidence Compendium",
        url: "/TPI_Evidence_Compendium.html",
        summary: "Use claim-versus-cause thinking to evaluate photographic, video, audio, environmental, and experiential material.",
        keywords: ["evidence", "claim versus cause", "anomaly", "contamination", "natural explanation"]
      },
      {
        id: "education-center",
        kind: "Public education",
        title: "TPI Education Center",
        url: "/education-center.html",
        summary: "Start with public lessons covering Ghostology 101, research methods, equipment, documentation, field safety, ethics, and responsible investigation.",
        keywords: ["education", "lessons", "ghostology", "learn", "training", "course"]
      },
      {
        id: "ghostology-101",
        kind: "Public education series",
        title: "Ghostology 101",
        url: "/ghostology-101.html",
        summary: "A public TPI foundation for ghost reports, hauntings, terminology, investigation methods, evidence review, history, ethics, and responsible field work.",
        keywords: ["ghost", "ghosts", "ghostology", "haunting", "apparition", "spirit", "ghost hunting", "paranormal investigation"]
      },
      {
        id: "haunted-locations",
        kind: "Public directory",
        title: "Haunted Locations Directory",
        url: "/haunted-locations.html",
        summary: "Explore the public TPI directory of documented haunted locations, historic sites, and culturally recognized paranormal landmarks.",
        keywords: ["haunted location", "haunted places", "location directory", "historic site", "place research"]
      },
      {
        id: "public-articles",
        kind: "Public research",
        title: "TPI Published Articles",
        url: "/published-article.html",
        summary: "Read public TPI research and contributor articles covering paranormal investigation, evidence, field work, and related research topics.",
        keywords: ["article", "published research", "paper", "field article", "contributor publication"]
      },
      {
        id: "tpi-apps",
        kind: "Public TPI apps",
        title: "TPI Apps and Workspaces",
        url: "/our-apps.html",
        summary: "See the public overview of TPI apps, including Creator Studio, StudioFlow, Nova Editorial Workspace, and community tools.",
        keywords: ["apps", "application", "creator studio", "studioflow", "nova", "workspace"]
      },
      {
        id: "tpi-videos",
        kind: "Public video library",
        title: "TPI Videos",
        url: "/tpi-videos.html",
        summary: "Browse public TPI investigation videos, field material, and research-focused video resources.",
        keywords: ["video library", "investigation video", "watch", "field video", "tpi video"]
      }
    ]
  };
})();
