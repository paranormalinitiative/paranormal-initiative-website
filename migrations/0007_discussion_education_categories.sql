INSERT INTO forum_categories (id, title, description, sort_order, active) VALUES
  ('investigation', 'Investigation Science', 'Practice, planning, field methodology, responsible techniques, mentorship, and investigative workflows.', 10, 1),
  ('evidence-science', 'Evidence Science & Analysis', 'Collection, preservation, source files, audio, photo, video review, context, and evidence-based findings.', 20, 1),
  ('equipment', 'Instrumentation & Technology', 'Equipment literacy, sensor behavior, EMF, environmental tools, recording systems, and limitations.', 30, 1),
  ('environmental-research', 'Environmental Research', 'Baseline studies, weather, buildings, sound, atmospheric conditions, human factors, and correlation.', 40, 1),
  ('evp-itc', 'EVP & ITC Research', 'EVP methodology, ITC experimentation, controls, source-material transparency, ACS, phonemes, and allophones.', 50, 1),
  ('consciousness', 'Consciousness & Human Experience', 'NDE research, parapsychology, psi and psionics, consciousness studies, and witness-centered experiences.', 60, 1),
  ('ethics-standards', 'Ethics & Professional Standards', 'Client care, witness respect, confidentiality, responsible disclosure, professional conduct, and accountability.', 70, 1),
  ('reporting-documentation', 'Reporting & Documentation', 'Case reports, careful language, research transparency, evidence presentation, logs, and file preservation.', 80, 1),
  ('community-development', 'Community Development & Publication', 'Contributor resources, mentorship, publication, public outreach, respectful discussion, and ongoing field development.', 90, 1),
  ('technology-development', 'Technology Development', 'App workflows, research software, digital evidence management, platform planning, and responsible tool development.', 100, 1),
  ('science-ai', 'Artificial Intelligence', 'AI literacy, responsible use, source verification, research support, disclosure, safeguards, and investigator judgment.', 110, 1),
  ('locations', 'Historical & Cultural Research', 'Haunted locations, local legends, folklore, public records, archival studies, and historical context.', 120, 1),
  ('experiences', 'Your Paranormal Experiences', 'Personal accounts, witness questions, unusual events, dreams, apparitions, and meaningful encounters.', 130, 1),
  ('metaphysics', 'Spirituality, Metaphysics, OBE & NDE', 'Spiritual frameworks, metaphysical ideas, out-of-body experiences, near-death experiences, and meaning-making.', 140, 1),
  ('general', 'General Discussion', 'Introductions, community updates, collaboration ideas, research requests, and open paranormal conversation.', 150, 1)
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order,
  active = excluded.active;
