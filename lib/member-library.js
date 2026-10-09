const response = (body, status = 200) => new Response(JSON.stringify(body), {status, headers: {'Content-Type':'application/json', 'Cache-Control':'private, no-store'}});
export function mediaKind(type) {
  return type.startsWith('image/') ? 'photo' : type.startsWith('video/') ? 'video' : type.startsWith('audio/') ? null : 'file';
}
export async function recordMemberUpload(env, user, key, file, source = 'upload') {
  const kind = mediaKind(file.type);
  if (!kind) return;
  const id = crypto.randomUUID();
  await env.TPI_DB.prepare(`INSERT OR IGNORE INTO member_media_library
    (id, owner_id, media_key, name, content_type, kind, size, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, user.id, key, file.name, file.type, kind, file.size || 0, source).run();
  return id;
}
export async function handleMemberLibrary(path, request, env, user) {
  const url = new URL(request.url);
  if (path === '/me/library/import' && request.method === 'POST') {
    if (!env.TPI_MEDIA) return response({error:'Media storage is unavailable.'},503);
    const page = await env.TPI_MEDIA.list({limit:25, cursor:url.searchParams.get('cursor') || undefined, include:['customMetadata','httpMetadata']});
    let imported = 0;
    for (const object of page.objects) {
      if (object.customMetadata?.contributorId !== user.id) continue;
      const type = object.httpMetadata?.contentType || 'application/octet-stream';
      if (!mediaKind(type)) continue;
      const name = object.customMetadata?.originalName || object.key.split('/').pop().replace(/^[a-f0-9-]{36}-/, '');
      await recordMemberUpload(env,user,object.key,{name,type,size:object.size});
      imported++;
    }
    return response({imported,cursor:page.truncated ? page.cursor : null});
  }
  if (path === '/me/library/albums') {
    if (request.method === 'GET') {
      const {results} = await env.TPI_DB.prepare(`SELECT a.id, a.title, COUNT(m.id) AS count FROM member_media_albums a
        LEFT JOIN member_media_library m ON m.album_id=a.id AND m.owner_id=a.owner_id
        WHERE a.owner_id=? GROUP BY a.id ORDER BY a.created_at DESC`).bind(user.id).all();
      return response({albums:results});
    }
    if (request.method === 'POST') {
      const data = await request.json();
      const title = String(data.title || '').trim().slice(0,120);
      if (!title) return response({error:'Enter an album name.'},400);
      const id = crypto.randomUUID();
      await env.TPI_DB.prepare('INSERT INTO member_media_albums (id,owner_id,title) VALUES (?,?,?)').bind(id,user.id,title).run();
      return response({album:{id,title,count:0}},201);
    }
  }
  if (path === '/me/library/save' && request.method === 'POST') {
    const data = await request.json();
    const item = await env.TPI_DB.prepare(`SELECT a.*, p.id AS postId FROM community_attachments a
      JOIN community_posts p ON a.target_type='post' AND a.target_id=p.id
      WHERE a.id=? AND p.status='visible' AND a.media_type='file'`).bind(String(data.attachmentId || '')).first();
    if (!item || !item.url.startsWith('/api/media/')) return response({error:'This document is no longer available.'},404);
    const key = item.url.slice('/api/media/'.length);
    if (key.startsWith('private-library/') || key.includes('..')) return response({error:'This document cannot be saved.'},400);
    const object = await env.TPI_MEDIA?.head(key);
    if (!object) return response({error:'Document not found.'},404);
    await env.TPI_DB.prepare(`INSERT OR IGNORE INTO member_media_library
      (id,owner_id,media_key,name,content_type,kind,size,source,source_post_id) VALUES (?,?,?,?,?,'file',?,'saved',?)`)
      .bind(crypto.randomUUID(),user.id,key,item.name || 'Document',object.httpMetadata?.contentType || 'application/octet-stream',object.size,item.postId).run();
    return response({ok:true});
  }
  if (path === '/me/library' && request.method === 'GET') {
    const kind = url.searchParams.get('kind') || 'photo';
    if (!['photo','video','file'].includes(kind)) return response({error:'Choose Photos, Videos, or Files.'},400);
    const offset = Math.max(0,Number(url.searchParams.get('offset')) || 0);
    const album = url.searchParams.get('album') || '';
    const filter = (album ? ' AND album_id=?' : '') + (url.searchParams.get('ofMe') === '1' ? ' AND is_of_me=1' : '');
    const args = album ? [user.id,kind,album] : [user.id,kind];
    const {results} = await env.TPI_DB.prepare(`SELECT id,name,content_type AS contentType,kind,size,source,source_post_id AS sourcePostId,
      album_id AS albumId,is_of_me AS isOfMe,created_at AS createdAt,('/api/media/' || media_key) AS url
      FROM member_media_library WHERE owner_id=? AND kind=?${filter} ORDER BY created_at DESC,id DESC LIMIT 60 OFFSET ?`).bind(...args,offset).all();
    const count = await env.TPI_DB.prepare(`SELECT COUNT(*) AS total FROM member_media_library WHERE owner_id=? AND kind=?${filter}`).bind(...args).first();
    return response({items:results,total:count.total});
  }
  if (/^\/me\/library\/[^/]+$/.test(path) && request.method === 'PUT') {
    const id = path.split('/').pop();
    const item = await env.TPI_DB.prepare('SELECT id,album_id,is_of_me FROM member_media_library WHERE id=? AND owner_id=? AND kind=\'photo\'').bind(id,user.id).first();
    if (!item) return response({error:'Photo not found.'},404);
    const data = await request.json();
    const albumId = Object.hasOwn(data,'albumId') ? data.albumId || null : item.album_id;
    if (albumId && !await env.TPI_DB.prepare('SELECT id FROM member_media_albums WHERE id=? AND owner_id=?').bind(albumId,user.id).first()) return response({error:'Album not found.'},404);
    const ofMe = Object.hasOwn(data,'ofMe') ? data.ofMe ? 1 : 0 : item.is_of_me;
    await env.TPI_DB.prepare('UPDATE member_media_library SET album_id=?,is_of_me=? WHERE id=? AND owner_id=?').bind(albumId,ofMe,id,user.id).run();
    return response({ok:true});
  }
  return response({error:'Not found.'},404);
}
