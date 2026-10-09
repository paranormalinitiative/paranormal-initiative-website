export const MEMBER_THEMES = ['cryptid', 'fieldops', 'seance', 'cosmic', 'asylum', 'gothicnight'];
const HIGHLIGHTS = ['theme', ...MEMBER_THEMES];
const FONTS = ['default', 'modern', 'rounded', 'creator', 'serif', 'minimal'];
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});
const normalize = row => ({
  highlight: HIGHLIGHTS.includes(row?.highlight) ? row.highlight : 'theme',
  font: FONTS.includes(row?.font) ? row.font : 'default'
});

export async function handlePersonalization(request, env, user) {
  if (request.method === 'GET') {
    const row = await env.TPI_DB.prepare('SELECT highlight, font FROM member_personalization WHERE owner_id = ?').bind(user.id).first();
    return json({ style: normalize(row) });
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  let data;
  try { data = await request.json(); } catch { return json({ error: 'Invalid settings.' }, 400); }
  if (!HIGHLIGHTS.includes(data?.highlight) || !FONTS.includes(data?.font)) return json({ error: 'Choose a supported highlight and font.' }, 400);
  await env.TPI_DB.prepare(`INSERT INTO member_personalization (owner_id, highlight, font)
    VALUES (?, ?, ?) ON CONFLICT(owner_id) DO UPDATE SET highlight = excluded.highlight,
    font = excluded.font, updated_at = CURRENT_TIMESTAMP`).bind(user.id, data.highlight, data.font).run();
  return json({ style: normalize(data) });
}

export async function handleSiteTheme(request, env, user) {
  let data;
  try { data = await request.json(); } catch { return json({ error: 'Invalid theme.' }, 400); }
  if (!MEMBER_THEMES.includes(data?.theme)) return json({ error: 'Choose a supported TPI theme.' }, 400);
  await env.TPI_DB.prepare('UPDATE contributors SET theme = ? WHERE id = ?').bind(data.theme, user.id).run();
  return json({ theme: data.theme });
}

// Only the public presentation choices are exposed, never account/contact information.
export async function handlePublicStyle(request, env) {
  const username = new URL(request.url).searchParams.get('username');
  if (!username || username.length > 160) return json({ error: 'Profile not found.' }, 404);
  const row = await env.TPI_DB.prepare(`SELECT p.highlight, p.font FROM contributors c
    LEFT JOIN member_personalization p ON p.owner_id = c.id WHERE c.username = ? AND c.active = 1`).bind(username).first();
  if (!row) return json({ error: 'Profile not found.' }, 404);
  return json({ style: normalize(row) });
}

export async function handleBlockedUsers(request, env, user) {
  // These are existing Messenger blocks, not a claim of feed/profile blocking.
  const { results } = await env.TPI_DB.prepare(`SELECT c.username, c.display_name AS displayName,
    b.created_at AS blockedAt FROM member_blocks b JOIN contributors c ON c.id = b.blocked_id
    WHERE b.blocker_id = ? ORDER BY b.created_at DESC`).bind(user.id).all();
  return json({ users: results });
}
