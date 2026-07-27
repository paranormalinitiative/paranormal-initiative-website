CREATE TABLE IF NOT EXISTS forum_categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_topics (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_by TEXT,
  status TEXT DEFAULT 'open',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES forum_categories(id),
  FOREIGN KEY (created_by) REFERENCES contributors(id)
);

CREATE TABLE IF NOT EXISTS forum_posts (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  contributor_id TEXT,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'visible',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES forum_topics(id),
  FOREIGN KEY (contributor_id) REFERENCES contributors(id)
);

CREATE TABLE IF NOT EXISTS forum_reactions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  contributor_id TEXT,
  reaction TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (post_id, contributor_id, reaction),
  FOREIGN KEY (post_id) REFERENCES forum_posts(id),
  FOREIGN KEY (contributor_id) REFERENCES contributors(id)
);

INSERT OR IGNORE INTO forum_categories (id, title, description, sort_order) VALUES
  ('general', 'General Discussion', 'Introductions, community updates, collaboration ideas, research requests, and open paranormal conversation.', 0),
  ('investigation', 'Investigation Science', 'Practice, planning, field methodology, responsible techniques, mentorship, and investigative workflows.', 10),
  ('evidence-science', 'Evidence Science & Analysis', 'Collection, preservation, source files, audio, photo, video review, context, and evidence-based findings.', 20),
  ('equipment', 'Instrumentation & Technology', 'Equipment literacy, sensor behavior, EMF, environmental tools, recording systems, and limitations.', 30),
  ('environmental-research', 'Environmental Research', 'Baseline studies, weather, buildings, sound, atmospheric conditions, human factors, and correlation.', 40),
  ('evp-itc', 'EVP & ITC Research', 'EVP methodology, ITC experimentation, controls, source-material transparency, ACS, phonemes, and allophones.', 50),
  ('consciousness', 'Consciousness & Human Experience', 'NDE research, parapsychology, psi and psionics, consciousness studies, and witness-centered experiences.', 60),
  ('ethics-standards', 'Ethics & Professional Standards', 'Client care, witness respect, confidentiality, responsible disclosure, professional conduct, and accountability.', 70),
  ('reporting-documentation', 'Reporting & Documentation', 'Case reports, careful language, research transparency, evidence presentation, logs, and file preservation.', 80),
  ('community-development', 'Community Development & Publication', 'Contributor resources, mentorship, publication, public outreach, respectful discussion, and ongoing field development.', 90),
  ('technology-development', 'Technology Development', 'App workflows, research software, digital evidence management, platform planning, and responsible tool development.', 100),
  ('science-ai', 'Artificial Intelligence', 'AI literacy, responsible use, source verification, research support, disclosure, safeguards, and investigator judgment.', 110),
  ('locations', 'Historical & Cultural Research', 'Haunted locations, local legends, folklore, public records, archival studies, and historical context.', 120),
  ('experiences', 'Your Paranormal Experiences', 'Personal accounts, witness questions, unusual events, dreams, apparitions, and meaningful encounters.', 130),
  ('metaphysics', 'Spirituality, Metaphysics, OBE & NDE', 'Spiritual frameworks, metaphysical ideas, out-of-body experiences, near-death experiences, and meaning-making.', 140);
