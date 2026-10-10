/* Settings IA migrated from the isolated reference; all copy/behavior is TPI-owned.
 * No reference sessions, mock account statistics, legal promises or fake save handlers.
 */
(function () {
  const root = document.querySelector('.tpi-settings');
  if (!root) return;
  const groups = [
    ['Your Account', [['account','Account & Security'],['profile','Profile Settings'],['profile-visibility','Profile Visibility']]],
    ['Privacy & Safety', [['privacy-safety','Privacy & Safety'],['blocked-users','Blocked Users']]],
    ['Creator & Content', [['content-ownership','Content Ownership & Publishing']]],
    ['Preferences', [['personalization','Personalization'],['notifications','Notifications'],['content-feed','Content & Feed']]],
    ['Data & Support', [['data','Data & Account Files'],['help-support','Help & Support'],['legal','Legal & Policies']]],
    ['Monetization', [['payments','Payments']]]
  ];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const link = (key, title) => `<a href="#${key}">${title}</a>`;
  const card = (title, body) => `<article class="settings-card"><h3>${title}</h3>${body}</article>`;
  const pending = text => `<p><span class="settings-status">Not connected yet</span></p><p>${text}</p>`;
  const intro = (title, text) => `<article class="settings-card"><p class="portal-kicker">The Paranormal Initiative · Settings</p><h2 tabindex="-1">${title}</h2><p>${text}</p></article>`;
  const grid = content => `<div class="settings-grid">${content}</div>`;
  const pref = (title, text) => `<div class="settings-pref"><div><strong>${title}</strong><p>${text}</p></div><input type="checkbox" disabled aria-label="${title} — not connected yet"></div>`;
  const contact = '<a href="early-access.html?member=1">Open Contact &amp; Links</a>';
  const policies = [
    ['terms','Terms of Service','Accounts, user content, acceptable use, moderation, suspensions, and account termination.'],
    ['privacy','Privacy Policy','Account and profile information, posts, media, messages, safety records, and data requests.'],
    ['community-guidelines','Community Guidelines','Respectful conduct, harassment, scams, evidence integrity, reporting, and moderation.'],
    ['data-deletion','Data Deletion Policy','Data and account deletion, confirmation, support review, and retained records.'],
    ['safety-reporting','Safety & Reporting','Content and user reports, moderation review, appeals, and safety resources.'],
    ['cookies','Cookie Policy','Login sessions, security, essential cookies, preferences, and performance.'],
    ['copyright','Copyright & Intellectual Property','Ownership, permission to share, copyright reports, and platform branding.'],
    ['child-safety','Child Safety Standards','Child protection, reporting, account enforcement, and safety contacts.']
  ];
  const panels = {
    overview: intro('Settings Center', 'Manage your account, profile, appearance, notifications, privacy, and support from one place.') + groups.map(([group, items]) => card(group, `<div class="settings-actions">${items.map(([key,title])=>link(key,title)).join('')}</div>`)).join(''),
    profile: intro('Profile Settings', 'Your profile introduces your research, fieldwork, ITC interests, and community contributions.') +
      card('Name, biography & avatar', '<p>Use our existing profile editor for your display name, credentials, affiliation, organization, website, biography, and profile photo. Private contact fields stay in that editor and are not copied into this Settings page.</p><div class="settings-actions"><a href="member-profile.html#profile-editor">Edit your profile</a>'+link('account','Change username')+'</div>') +
      card('Profile preview', '<div class="profile-style-preview" data-profile-style-surface><div class="profile-style-ring" aria-hidden="true">TPI</div><h3 data-settings-member-name>Community member</h3><p data-settings-member-bio>Your profile biography will appear here.</p><span class="profile-style-badge">Profile highlight preview</span></div><div class="settings-actions">'+link('personalization','Themes & Highlights')+link('profile-visibility','Profile Visibility')+'</div>'),
    'profile-visibility': intro('Profile Visibility', 'The public/private profile controls from the reference are organized here for our next integration pass.') +
      card('Public / Private', pending('A private-profile switch must protect every profile route, post, media item, and direct link before it can be enabled. This migration does not change the visibility of your existing content.')+pref('Private Profile','Planned: keep a basic identity visible while limiting protected content to approved connections.')+'<button type="button" disabled>Save Visibility · Not connected</button>')+
      grid(card('Public profile','<p>Profile identity, biography, and published work currently use our existing public-profile routes.</p>')+card('Protected content','<p>Private Photos, Videos, and Files are already owner-only libraries. They are separate from a future private-profile setting.</p><div class="settings-actions"><a href="member-photos.html">Photos</a><a href="member-videos.html">Videos</a><a href="member-files.html">Files</a></div>')),
    'privacy-safety': intro('Privacy & Safety', 'Find profile controls, Messenger blocks, content preferences, reporting, and community support.')+
      card('Support & reporting', '<p>Use our current Contact &amp; Links page for privacy or safety concerns. The reference’s in-app safety message form is reserved below and cannot send messages yet.</p>'+contact+'<fieldset disabled><label>Issue Type<select><option>Privacy or Safety Concern</option><option>Report Content or User</option></select></label><label>Message<textarea rows="4" maxlength="5000" placeholder="This in-app form is not connected yet"></textarea></label><button type="button">Send to Support · Not connected</button></fieldset>')+
      grid(card('Privacy tools','<div class="settings-actions">'+link('profile-visibility','Profile Visibility')+link('blocked-users','Blocked Users')+link('content-feed','Content & Feed')+'</div>')+card('Additional safety areas','<div class="settings-actions">'+link('reel-preferences','Reel Preferences')+link('message-requests','Message Requests')+link('reporting-moderation','Reporting & Moderation')+link('help-support','Help & Support')+'</div>')),
    'content-ownership': intro('Content Ownership & Publishing', 'Your content belongs to you. The Paranormal Initiative provides tools to create, organize, and share your work. You control where your original recordings are stored and what you choose to publish.')+
      card('Recording & Storage', '<p>Creator Studio recordings remain private and are stored through the destination you choose: browser storage, computer storage, an external drive, or a creator-connected provider where an actual integration exists.</p><div class="settings-actions"><a href="/studio/">Open Creator Studio</a><a href="member-videos.html">Open My Videos</a></div>')+
      card('Automatic publication', '<p>Automatic publication to TPI is not connected yet. Recording alone never publishes a video. A future creator-controlled <em>Publish this video to TPI when ready</em> choice will require an accessible, playable source before TPI Videos or the Community Feed is updated.</p>')+
      grid(card('My Videos', '<p>Your existing member video library is owner-scoped. Adding or organizing a file there does not publish it to the public site.</p><div class="settings-actions"><a href="member-videos.html">Open My Videos</a></div>')+
        +card('Published Content', '<p>Publishing is an explicit action. TPI Videos and the Community Feed should receive only a canonical video record that you choose to publish; Creator Studio does not silently publish local recordings.</p><div class="settings-actions"><a href="tpi-videos.html?member=1">Open TPI Videos</a></div>')+
        +card('Content Visibility', '<p>Visibility controls for future TPI video records are not connected yet. Existing profile visibility remains separate and is not changed by this section.</p><div class="settings-actions">'+link('profile-visibility','Review visibility status')+'</div>')+
        +card('Connected Platforms', pending('Google Drive and Dropbox are not connected publishing or storage integrations. iCloud Drive uses supported device or Files workflows. No external provider is represented as active here.'))+
        +card('Data Export', pending('No Creator Studio or TPI Videos export endpoint is connected yet. Use the existing support path for an account-data request; external provider copies are outside TPI control.'))+
        +card('Content Removal', pending('Removal workflows are not automated yet. TPI cannot promise deletion of external-host copies or files already downloaded by viewers. Use Contact & Links for a request.'))),
    'blocked-users': intro('Blocked Users', 'Review your existing Messenger block list. Messenger blocking does not currently hide feed posts or public profiles.')+
      card('Your Messenger blocks','<label>Search blocked accounts<input type="search" data-block-search placeholder="Search your block list"></label><div data-block-list role="status">Open this section to load your block list.</div><p>To unblock someone, open the existing conversation and use its member controls.</p><a href="member-home.html">Open member home & Messenger</a>'),
    'content-feed': intro('Content & Feed', 'Keep the community feed focused on member conversation. Contributor articles and other published content belong in their own areas, with notification links—not automatic feed entries.')+
      card('Feed controls', pending('These reference preference controls are migrated for review. They do not change feed ranking or filtering yet.')+
        pref('Prioritize Friends','Prefer updates from accepted connections when our Friends system is ready.')+
        pref('Show TPI Reels','Review a future opt-in for shared clips; no automatic creator-content injection.')+
        pref('Trending in the Community','Topic and discovery suggestions for paranormal research and ITC.')+
        pref('Sponsored Content','No new advertising or sponsorship behavior is enabled by this migration.')+
        pref('Reduce Repeated Posts','Future control for already-viewed or repeated community posts.')+
        pref('Reduce Sensitive Content','Future content filtering with clear, enforceable rules.'))+
      grid(['Muted Words','Hidden Hashtags','Reel Preferences','Discovery Filters'].map(title=>card(title,pending('Reserved for TPI-specific filtering and preference behavior.'))).join('')),
    data: intro('Data & Account Files', 'Find your private uploaded documents and the planned account-data request areas.')+
      card('Your private library','<p>Photos and videos you upload, and documents you upload or save from a community post, have their own private library pages.</p><div class="settings-actions"><a href="member-photos.html">Your Photos & Albums</a><a href="member-videos.html">Your Videos</a><a href="member-files.html">Your Files</a></div>')+
      card('Data & account requests',pending('The request flow needs our own review process and wording. No data export, deletion, or account removal is performed by this migrated form. For help now, use Contact & Links.')+contact+'<fieldset disabled><label>Request Type<select><option>Request My Data</option><option>Correct My Data</option><option>Delete Some of My Data</option><option>Delete My Account</option><option>Privacy Question</option></select></label><label>Request Details<textarea rows="4" maxlength="5000" placeholder="Request form not connected yet"></textarea></label><button type="button">Send Request · Not connected</button></fieldset>')+
      card('Review before action','<p>Account ownership, confirmation, affected posts/media/messages, retained safety records, and follow-up all need to be defined before enabling deletion requests.</p>'),
    'help-support': intro('Help & Support','Find account help, privacy and safety tools, data requests, technical support, and policy information.')+
      card('Contact support','<p>Our existing contact page remains the working support path. The migrated in-app form is not connected yet. Never send a password or sensitive payment information.</p>'+contact+'<fieldset disabled><label>Topic<select><option>Account Help</option><option>Privacy & Safety</option><option>Report a Problem</option><option>Data / Delete Account</option><option>Payments</option><option>Bug Report</option><option>Legal / Policy</option><option>Other</option></select></label><label>Message<textarea rows="4" maxlength="5000" placeholder="In-app support form not connected yet"></textarea></label><button type="button">Send Message · Not connected</button></fieldset>')+
      card('Related settings','<div class="settings-actions">'+[['account','Account & Security'],['privacy-safety','Privacy & Safety'],['data','Data & Account Files'],['legal','Legal & Policies'],['payments','Payments']].map(([key,title])=>link(key,title)).join('')+'</div>'),
    legal: intro('Legal & Policies','All eight policy areas from the reference are organized here. Reference legal documents are not adopted as The Paranormal Initiative’s policies.')+
      grid(policies.map(([key,title,desc])=>card(title,`<p>${desc}</p><p><span class="settings-status">TPI wording pending</span></p>${link('legal/'+key,'Review policy area')}`)).join('')),
    payments: intro('Payments','Payments are not enabled. This section preserves the reference’s upcoming monetization areas for later discussion.')+
      grid(['Promoted Posts','Sponsored Posts','Business & Creator Tools','Billing History'].map(title=>card(title,'<p><span class="settings-status">Coming soon</span></p><p>No charges, new sponsored feed entries, billing, or promotion tools are enabled.</p>')).join('')),
    'reel-preferences': intro('Reel Preferences','Recommendations, sensitive content, muted topics, and autoplay controls will be adapted to TPI.')+card('Reel controls',pending('These additional reference settings remain a coming-soon area.')),
    'message-requests': intro('Message Requests','Future controls for who can start conversations and how filtered requests are handled.')+card('Request controls',pending('This migration does not change your existing Messenger permissions.')),
    'reporting-moderation': intro('Reporting & Moderation','Reporting content and users, report status, moderation information, and safety resources.')+card('Safety support','<p>Use the existing report action inside Messenger for conversation reports. Expanded Settings reporting is not connected yet.</p>'+contact)
  };
  policies.forEach(([key,title,desc]) => {
    panels['legal/'+key] = intro(title,desc)+card('TPI policy wording pending','<p>The reference policy is not published here as our own. This area is reserved for approved TPI wording and a working support/review process.</p><div class="settings-actions">'+link('legal','Back to Legal & Policies')+link('help-support','Help & Support')+'</div>');
  });
  const host = root.querySelector('[data-settings-content]');
  Object.entries(panels).forEach(([key, content]) => {
    const panel = document.createElement('div');
    panel.dataset.settingsPanel = key;
    panel.id = 'settings-'+key.replaceAll('/','-');
    panel.hidden = true;
    panel.innerHTML = content;
    host.appendChild(panel);
  });
  const nav = root.querySelector('[data-settings-nav]');
  nav.innerHTML = '<a class="settings-overview-link" href="#overview">All Settings</a>'+groups.map(([group,items])=>`<div class="settings-nav-group"><h3>${group}</h3>${items.map(([key,title])=>`<a href="#${key}" data-settings-link="${key}"><span>${title}</span>${key==='payments'?'<small>Soon</small>':''}</a>`).join('')}</div>`).join('');
  const menu = root.querySelector('[data-settings-menu]');
  const narrow = matchMedia('(max-width:800px)');
  if (menu) menu.open = !narrow.matches;
  narrow.addEventListener('change',()=>{if(menu) menu.open=!narrow.matches;});
  const valid = new Set(['account','personalization','notifications',...Object.keys(panels)]);
  function navigate(focus) {
    const key = location.hash.slice(1) || 'overview';
    const active = valid.has(key) ? key : 'overview';
    root.querySelectorAll('[data-settings-panel]').forEach(panel=>{panel.hidden=panel.dataset.settingsPanel!==active;});
    nav.querySelectorAll('a').forEach(a=>{
      const selected = a.getAttribute('href')==='#'+active || (active.startsWith('legal/') && a.dataset.settingsLink==='legal');
      if(selected) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
    if(menu && narrow.matches) menu.open=false;
    const panel = root.querySelector('[data-settings-panel="'+active+'"]');
    if(focus) { const heading=panel.querySelector('h2'); if(heading) heading.focus({preventScroll:true}); panel.scrollIntoView({block:'start'}); }
    if(active==='blocked-users') loadBlocks();
  }
  let blocks=[], loading=false, loaded=false;
  window.addEventListener('hashchange',()=>navigate(true));
  navigate(false);
  root.querySelector('#settings-search').addEventListener('input', event=>{
    const query=event.target.value.trim().toLowerCase();
    let count=0;
    nav.querySelectorAll('[data-settings-link]').forEach(a=>{
      const key=a.dataset.settingsLink;
      const text=host.querySelector('[data-settings-panel="'+key+'"]')?.textContent || '';
      a.hidden=!(`${a.textContent} ${text}`.toLowerCase().includes(query));
      if(!a.hidden) count++;
    });
    nav.querySelectorAll('.settings-nav-group').forEach(group=>{group.hidden=!group.querySelector('a:not([hidden])');});
    root.querySelector('[data-settings-search-status]').textContent=query?`${count} matching sections`:'';
    if(menu && query) menu.open=true;
  });
  function renderBlocks() {
    const q=root.querySelector('[data-block-search]').value.trim().toLowerCase();
    const items=blocks.filter(user=>`${user.username} ${user.displayName}`.toLowerCase().includes(q));
    root.querySelector('[data-block-list]').innerHTML=items.length?items.map(user=>`<div class="settings-pref"><div><strong>${esc(user.displayName || user.username)}</strong><p>@${esc(user.username)}</p></div><span class="settings-status">Messenger blocked</span></div>`).join(''):`<p class="settings-empty">${blocks.length?'No matching accounts.':'You have no Messenger blocks.'}</p>`;
  }
  async function loadBlocks() {
    if(loaded || loading) return;
    loading=true;
    const list=root.querySelector('[data-block-list]');
    list.textContent='Loading your block list…';
    try { const response=await fetch('/api/me/blocked-users',{credentials:'same-origin',cache:'no-store'}); const data=await response.json(); if(!response.ok) throw new Error(data.error || 'Could not load blocks.'); blocks=data.users || []; loaded=true; renderBlocks(); }
    catch(error) {list.textContent=error.message;}
    finally {loading=false;}
  }
  root.querySelector('[data-block-search]').addEventListener('input',renderBlocks);
  // Populate only public profile fields, without creating a second profile-edit form.
  window.TPIApi?.me().then(({user})=>{
    if(!user) return;
    root.querySelector('[data-settings-member-name]').textContent=user.displayName || user.username;
    root.querySelector('[data-settings-member-bio]').textContent=user.bio || 'Add a biography in your profile editor.';
  }).catch(()=>{});
})();
