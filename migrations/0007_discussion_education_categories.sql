UPDATE forum_categories
SET title = 'Investigation Science',
    description = 'Practice, planning, field methodology, responsible techniques, mentorship, and investigative workflows.',
    sort_order = 10,
    active = 1
WHERE id = 'investigation';

UPDATE forum_categories
SET title = 'Instrumentation & Technology',
    description = 'Equipment literacy, sensor behavior, EMF, environmental tools, recording systems, and limitations.',
    sort_order = 30,
    active = 1
WHERE id = 'equipment';

UPDATE forum_categories
SET title = 'EVP & ITC Research',
    description = 'EVP methodology, ITC experimentation, controls, source-material transparency, ACS, phonemes, and allophones.',
    sort_order = 50,
    active = 1
WHERE id = 'evp-itc';

UPDATE forum_categories
SET title = 'Consciousness & Human Experience',
    description = 'NDE research, parapsychology, psi and psionics, consciousness studies, and witness-centered experiences.',
    sort_order = 60,
    active = 1
WHERE id = 'consciousness';

UPDATE forum_categories
SET title = 'Artificial Intelligence',
    description = 'AI literacy, responsible use, source verification, research support, disclosure, safeguards, and investigator judgment.',
    sort_order = 110,
    active = 1
WHERE id = 'science-ai';

UPDATE forum_categories
SET title = 'Historical & Cultural Research',
    description = 'Haunted locations, local legends, folklore, public records, archival studies, and historical context.',
    sort_order = 120,
    active = 1
WHERE id = 'locations';

INSERT OR IGNORE INTO forum_categories (id, title, description, sort_order, active) VALUES
  ('evidence-science', 'Evidence Science & Analysis', 'Collection, preservation, source files, audio, photo, video review, context, and evidence-based findings.', 20, 1),
  ('environmental-research', 'Environmental Research', 'Baseline studies, weather, buildings, sound, atmospheric conditions, human factors, and correlation.', 40, 1),
  ('ethics-standards', 'Ethics & Professional Standards', 'Client care, witness respect, confidentiality, responsible disclosure, professional conduct, and accountability.', 70, 1),
  ('reporting-documentation', 'Reporting & Documentation', 'Case reports, careful language, research transparency, evidence presentation, logs, and file preservation.', 80, 1),
  ('community-development', 'Community Development & Publication', 'Contributor resources, mentorship, publication, public outreach, respectful discussion, and ongoing field development.', 90, 1),
  ('technology-development', 'Technology Development', 'App workflows, research software, digital evidence management, platform planning, and responsible tool development.', 100, 1);

UPDATE forum_categories SET sort_order = 130 WHERE id = 'experiences';
UPDATE forum_categories SET sort_order = 140 WHERE id = 'metaphysics';
UPDATE forum_categories SET sort_order = 150 WHERE id = 'general';
