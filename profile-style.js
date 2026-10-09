(async function () {
  const highlights = [['theme','Follow my theme'],['cryptid','Cryptid Green'],['fieldops','Field Blue'],['seance','Séance Rose'],['cosmic','Cosmic Cyan'],['asylum','Investigation Amber'],['gothicnight','Gothic Purple']];
  const fonts = [['default','TPI Default'],['modern','Clean Modern'],['rounded','Rounded'],['creator','Bold Creator'],['serif','Classic Serif'],['minimal','Minimal']];
  const controls = document.querySelector('[data-personalization-controls]');
  const profile = document.querySelector('.member-profile-card, [data-public-profile]');
  if (!controls && !profile) return;
  let saved = {highlight:'theme',font:'default'}, draft = {...saved};
  let loaded = false;
  const publicPage = Boolean(document.querySelector('[data-public-profile]'));
  const username = new URLSearchParams(location.search).get('username');
  function apply(style) {
    document.querySelectorAll('[data-profile-style-surface], .member-profile-card, .public-profile-card').forEach(surface => {
      surface.setAttribute('data-profile-style-surface','');
      surface.dataset.profileHighlight = style.highlight;
      surface.dataset.profileFont = style.font;
    });
  }
  function sync() {
    if(!controls) return;
    controls.querySelectorAll('[data-style-option]').forEach(button=>button.setAttribute('aria-pressed',String(draft[button.dataset.styleOption]===button.dataset.value)));
    apply(draft);
  }
  if (controls) {
    const options = (list,kind) => list.map(([value,label])=>`<button type="button" data-style-option="${kind}" data-value="${value}" aria-pressed="false" disabled>${kind==='highlight'?`<span class="profile-highlight-swatch" data-highlight-swatch="${value}" aria-hidden="true"></span>`:''}<span${kind==='font'?` data-profile-font="${value}" style="font-family:var(--profile-font)"`:''}>${label}</span></button>`).join('');
    controls.innerHTML = `<article class="settings-card"><p class="portal-kicker">Personalization · Profile</p><h3>Highlights</h3><p>Choose a profile highlight for your name and avatar ring. Our six site themes stay independent. Follow my theme uses your current theme’s accent.</p><div class="profile-style-options">${options(highlights,'highlight')}</div></article>
      <article class="settings-card"><h3>Font Style</h3><p>Choose the heading style for your profile. Forms and the rest of the community keep our readable TPI layout.</p><div class="profile-style-options">${options(fonts,'font')}</div></article>
      <article class="settings-card"><h3>Live Profile Preview</h3><div class="profile-style-preview" data-profile-style-surface><div class="profile-style-ring" aria-hidden="true">TPI</div><h3>Your community profile</h3><p>Research · Fieldwork · Paranormal & ITC</p><span class="profile-style-badge">Profile highlights</span></div><div class="settings-actions"><button type="button" data-style-reset disabled>Reset Highlights & Font</button><button type="button" data-style-save disabled>Save Highlights & Font</button></div><p data-style-status role="status">Loading your account style…</p></article>`;
    controls.addEventListener('click',event=>{
      const option=event.target.closest('[data-style-option]');
      if(option) {draft[option.dataset.styleOption]=option.dataset.value;sync();controls.querySelector('[data-style-status]').textContent='Preview only — save to update your profile.';}
      if(event.target.closest('[data-style-reset]')) {draft={highlight:'theme',font:'default'};sync();controls.querySelector('[data-style-status]').textContent='Defaults previewed — save to update your profile.';}
    });
    controls.querySelector('[data-style-save]').addEventListener('click', async()=>{
      if(!loaded) return;
      const status=controls.querySelector('[data-style-status]');
      controls.querySelectorAll('button').forEach(button=>{button.disabled=true;});
      status.textContent='Saving to your account…';
      try {
        const response=await fetch('/api/me/personalization',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(draft)});
        const data=await response.json();
        if(!response.ok) throw new Error(data.error || 'Could not save your style.');
        saved=data.style;draft={...saved};sync();status.textContent='Highlights and font saved to your account.';
      } catch(error) {draft={...saved};sync();status.textContent=error.message+' Your saved style was restored.';}
      finally {controls.querySelectorAll('button').forEach(button=>{button.disabled=false;});}
    });
  }
  try {
    const endpoint=publicPage?'/api/profile-style?username='+encodeURIComponent(username || ''):'/api/me/personalization';
    const response=await fetch(endpoint,{credentials:'same-origin',cache:'no-store'});
    const data=await response.json();
    if(!response.ok) throw new Error(data.error || 'Could not load your style.');
    saved=data.style;draft={...saved};loaded=true;apply(saved);sync();
    if(controls) {controls.querySelectorAll('button').forEach(button=>{button.disabled=false;});controls.querySelector('[data-style-status]').textContent='Your account style is loaded.';}
  } catch(error) {if(controls) controls.querySelector('[data-style-status]').textContent=error.message+' Reload to try again.';}
  // The public-profile card is inserted asynchronously by member-login.js.
  if(publicPage && profile) new MutationObserver(()=>{if(loaded) apply(saved);}).observe(profile,{childList:true,subtree:true});
})();
