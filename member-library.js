(async function () {
  const host = document.querySelector('[data-library-kind]');
  if (!host) return;
  const kind = host.dataset.libraryKind;
  const grid = host.querySelector('[data-library-grid]');
  const status = host.querySelector('[data-library-status]');
  const more = host.querySelector('[data-library-more]');
  const upload = host.querySelector('[data-library-upload]');
  const albumForm = host.querySelector('[data-album-form]');
  let view = 'all', album = '', offset = 0, albums = [];
  const e = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function api(path, options = {}) {
    const response = await fetch('/api' + path, {credentials:'same-origin',cache:'no-store',...options});
    const data = await response.json();
    if (response.status === 401) { location.href='member-login.html'; throw new Error('Sign in to open your library.'); }
    if (!response.ok) throw new Error(data.error || 'Your library could not be loaded.');
    return data;
  }
  const send = (path,method,body) => api(path,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  function documentType(item) {
    if (item.contentType === 'application/pdf' || /\.pdf$/i.test(item.name)) return 'PDF document';
    if (item.contentType === 'text/plain' || /\.txt$/i.test(item.name)) return 'Text document';
    return (item.name.split('.').pop() || 'File').toUpperCase() + ' file';
  }
  function card(item) {
    const media = kind==='photo' ? `<a href="${e(item.url)}" target="_blank" rel="noopener"><img src="${e(item.url)}" alt="${e(item.name)}" loading="lazy"></a>` : kind==='video' ? `<video src="${e(item.url)}" controls preload="metadata"></video>` : '<div class="library-document-icon" aria-hidden="true">📄</div>';
    const label = kind==='file' ? documentType(item) : kind==='photo' ? 'Photo' : 'Video';
    const source = item.source==='saved' ? 'Saved from a post' : 'Your upload';
    const organize = kind==='photo' ? `<select data-photo-album="${e(item.id)}" aria-label="Album for ${e(item.name)}"><option value="">No album</option>${albums.map(a=>`<option value="${e(a.id)}" ${a.id===item.albumId?'selected':''}>${e(a.title)}</option>`).join('')}</select><button type="button" data-photo-of-me="${e(item.id)}" data-of-me="${item.isOfMe?'1':'0'}">${item.isOfMe?'Unmark photo of me':'Mark as photo of me'}</button>` : '';
    return `<article class="library-item">${media}<h3>${e(item.name)}</h3><p>${e(label)} · ${e(source)}</p><a href="${e(item.url)}" download="${e(item.name)}" target="_blank" rel="noopener">Open / Download</a>${organize}</article>`;
  }
  async function load(append=false) {
    if (!append) offset=0;
    albums=(await api('/me/library/albums')).albums;
    albumForm.hidden=view!=='albums';
    if (view==='albums' && !album) {
      grid.innerHTML=albums.map(a=>`<article class="library-item"><h3>${e(a.title)}</h3><p>${a.count} photos</p><button type="button" data-open-album="${e(a.id)}">Open Album</button></article>`).join('');
      status.textContent=albums.length ? 'Your private albums.' : 'Create an album to organize your photos.';
      more.hidden=true;
      return;
    }
    const params=new URLSearchParams({kind,offset});
    if (view==='ofMe') params.set('ofMe','1');
    if (album) params.set('album',album);
    const data=await api('/me/library?'+params);
    if (append) grid.insertAdjacentHTML('beforeend',data.items.map(card).join('')); else grid.innerHTML=data.items.map(card).join('');
    offset+=data.items.length;
    more.hidden=offset>=data.total;
    status.textContent=view==='ofMe' ? 'Photos you have marked as photos of you.' : data.total ? `${data.total} ${kind==='photo'?'photos':kind==='video'?'videos':'files'} in your private library.` : 'Your library is empty. Add an upload to get started.';
  }
  function error(err) { status.textContent=err.message || 'Please try again.'; }
  host.querySelector('[data-library-tabs]').addEventListener('click',async event=>{
    const button=event.target.closest('[data-library-view]'); if (!button) return;
    view=button.dataset.libraryView; album='';
    host.querySelectorAll('[data-library-view]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
    try { await load(); } catch(err) { error(err); }
  });
  grid.addEventListener('click',async event=>{
    const open=event.target.closest('[data-open-album]');
    const mark=event.target.closest('[data-photo-of-me]');
    try {
      if (open) {album=open.dataset.openAlbum;await load();}
      if (mark) { await send('/me/library/'+mark.dataset.photoOfMe,'PUT',{ofMe:mark.dataset.ofMe!=='1'});await load(); }
    } catch(err) { error(err); }
  });
  grid.addEventListener('change',async event=>{
    const select=event.target.closest('[data-photo-album]'); if (!select) return;
    try { await send('/me/library/'+select.dataset.photoAlbum,'PUT',{albumId:select.value || null});status.textContent='Album saved.'; } catch(err) { error(err); }
  });
  albumForm.addEventListener('submit',async event=>{
    event.preventDefault();
    try {await send('/me/library/albums','POST',{title:new FormData(albumForm).get('title')});albumForm.reset();album='';await load();} catch(err) {error(err);}
  });
  more.addEventListener('click',async()=>{more.disabled=true;try {await load(true);}catch(err){error(err);}finally{more.disabled=false;}});
  upload.addEventListener('change',async()=>{
    const files=Array.from(upload.files); upload.disabled=true;
    let completed=0;
    try {
      for (const file of files) {
        if (file.size>25*1024*1024) throw new Error(`${file.name} must be 25 MB or smaller.`);
        status.textContent=`Uploading ${file.name}…`;
        const form=new FormData();form.append('file',file);
        const result=await api('/uploads/library',{method:'POST',body:form});
        if (album && result.id && result.contentType.startsWith('image/')) await send('/me/library/'+result.id,'PUT',{albumId:album});
        completed++;
      }
      await load();status.textContent=`${completed} upload${completed===1?'':'s'} added.`+(kind==='photo'?' Videos are in your Videos library.':'');
    } catch(err) {try {await load();}catch{} error(err);} finally {upload.disabled=false;upload.value='';}
  });
  try {
    const data=await api('/auth/me');
    if (!data.user) {location.href='member-login.html';return;}
    await load();
    const importKey='tpi-library-import:'+data.user.username;
    if (!sessionStorage.getItem(importKey)) {
      status.textContent='Finding your earlier uploads…';
      let cursor='';
      do {const result=await api('/me/library/import'+(cursor?'?cursor='+encodeURIComponent(cursor):''),{method:'POST'});cursor=result.cursor;} while (cursor);
      sessionStorage.setItem(importKey,'1');await load();
    }
  } catch(err) {error(err);}
})();
