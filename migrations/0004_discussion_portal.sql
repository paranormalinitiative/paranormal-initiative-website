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
  ('evp-itc', 'EVP / ITC Research', 'Voice-like material, ACS experimentation, recording methods, review language, and ITC theory.', 10),
  ('experiences', 'Your Paranormal Experiences', 'Personal accounts, witness questions, unusual events, dreams, apparitions, and meaningful encounters.', 20),
  ('investigation', 'Paranormal Investigation', 'Case intake, walkthroughs, baselines, documentation, team practice, field safety, and evidence review.', 30),
  ('equipment', 'Equipment & Technology', 'Audio recorders, cameras, EMF meters, thermal tools, SLS, environmental sensors, and experimental devices.', 40),
  ('consciousness', 'Consciousness & Parapsychology', 'Human experience, perception, psi research, survival questions, and responsible theoretical discussion.', 50),
  ('metaphysics', 'Spirituality, Metaphysics, OBE & NDE', 'Spiritual frameworks, metaphysical ideas, out-of-body experiences, near-death experiences, and meaning-making.', 60),
  ('science-ai', 'AI, Quantum Ideas & Time', 'Artificial intelligence, speculative models, quantum theory discussions, time questions, and technology culture.', 70),
  ('locations', 'Haunted Locations & History', 'Location claims, historical context, folklore, cemeteries, buildings, legends, and responsible exploration planning.', 80),
  ('general', 'General Discussion', 'Introductions, community updates, collaboration ideas, research requests, and open paranormal conversation.', 90);
