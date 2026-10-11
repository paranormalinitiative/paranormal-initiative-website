import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { onRequest } from "../../functions/api/[[path]].js";

const db = new DatabaseSync(":memory:");
db.exec(`
  CREATE TABLE contributors (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    active INTEGER NOT NULL DEFAULT 1,
    photo_url TEXT,
    chat_color TEXT
  );
  CREATE TABLE sessions (
    token TEXT PRIMARY KEY,
    contributor_id TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
  CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    title TEXT,
    direct INTEGER NOT NULL DEFAULT 1,
    created_by TEXT,
    created_at TEXT,
    updated_at TEXT
  );
  CREATE TABLE conversation_participants (
    conversation_id TEXT NOT NULL,
    contributor_id TEXT NOT NULL,
    can_message INTEGER NOT NULL DEFAULT 1,
    hidden_at TEXT,
    archived_at TEXT,
    theme TEXT,
    quick_emoji TEXT,
    muted_until TEXT,
    read_receipts_enabled INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    contributor_id TEXT NOT NULL,
    body TEXT NOT NULL,
    attachments TEXT NOT NULL,
    created_at TEXT NOT NULL,
    edited_at TEXT,
    deleted_at TEXT
  );
  CREATE TABLE message_read_state (
    conversation_id TEXT NOT NULL,
    contributor_id TEXT NOT NULL,
    last_read_message_id TEXT,
    last_read_at TEXT
  );
`);

db.exec(`
  INSERT INTO contributors (id, username, password_hash, display_name, role) VALUES
    ('a', 'alice', 'unused', 'Alice', 'member'),
    ('b', 'bob', 'unused', 'Bob', 'member'),
    ('c', 'carol', 'unused', 'Carol', 'member');
  INSERT INTO sessions (token, contributor_id, expires_at) VALUES
    ('session-a', 'a', '2099-01-01'),
    ('session-b', 'b', '2099-01-01'),
    ('session-c', 'c', '2099-01-01');
  INSERT INTO conversations (id, title, direct, created_by, created_at, updated_at)
    VALUES ('conversation-ab', 'Alice and Bob', 1, 'a', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  INSERT INTO conversation_participants (conversation_id, contributor_id)
    VALUES ('conversation-ab', 'a'), ('conversation-ab', 'b');
  INSERT INTO messages (id, conversation_id, contributor_id, body, attachments, created_at)
    VALUES (
      'message-ab',
      'conversation-ab',
      'a',
      'Shared image',
      '[{"name":"shared.png","type":"photo","documentType":"","url":"/api/media/messenger/alice/shared.png"}]',
      CURRENT_TIMESTAMP
    );
`);

const mediaReads = [];
const env = {
  TPI_DB: {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async first() { return db.prepare(sql).get(...args) || null; },
            async all() { return { results: db.prepare(sql).all(...args) }; },
            async run() { return db.prepare(sql).run(...args); }
          };
        }
      };
    }
  },
  TPI_MEDIA: {
    async get(key) {
      mediaReads.push(key);
      return {
        body: new Uint8Array([1, 2, 3]),
        writeHttpMetadata(headers) { headers.set("Content-Type", "image/png"); }
      };
    }
  }
};

async function call(path, token) {
  const headers = new Headers();
  if (token) headers.set("Cookie", `tpi_session=${token}`);
  return onRequest({
    request: new Request(`http://messenger-security.test/api${path}`, { headers }),
    env,
    params: { path: path.slice(1).split("/") }
  });
}

const mediaPath = "/media/messenger/alice/shared.png";
assert.equal((await call(mediaPath)).status, 401, "anonymous media request must be denied");
assert.equal((await call(mediaPath, "session-a")).status, 200, "participant A must receive shared media");
assert.equal((await call(mediaPath, "session-b")).status, 200, "participant B must receive shared media");
assert.equal((await call(mediaPath, "session-c")).status, 404, "nonparticipant C must not receive shared media");
assert.deepEqual(mediaReads, ["messenger/alice/shared.png", "messenger/alice/shared.png"], "denied requests must not fetch the R2 object");

const messages = await call("/conversations/conversation-ab/messages", "session-b");
assert.equal(messages.status, 200, "conversation participant can list message metadata");
const outsiderMessages = await call("/conversations/conversation-ab/messages", "session-c");
assert.equal(outsiderMessages.status, 404, "nonparticipant cannot list the message containing the attachment");

console.log("PASS Messenger media security: anonymous denied; participants A/B allowed; nonparticipant C denied; denied requests did not fetch R2; message metadata access remains participant-scoped.");
