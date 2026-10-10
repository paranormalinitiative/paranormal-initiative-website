import fs from 'node:fs';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createRequire} from 'node:module';
import {onRequest} from '../../functions/api/[[path]].js';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url)).replace(/\/$/,'');
const db=new DatabaseSync(':memory:');
for(const name of ['0001_contributor_portal.sql','0016_member_contact_fields.sql','0027_contributor_theme.sql','0028_notification_prefs.sql','0038_member_personalization.sql']) db.exec(fs.readFileSync(root+'/migrations/'+name,'utf8'));
db.exec(`ALTER TABLE contributors ADD COLUMN bio TEXT; ALTER TABLE contributors ADD COLUMN photo_url TEXT;
CREATE TABLE member_blocks (blocker_id TEXT, blocked_id TEXT, created_at TEXT);
INSERT INTO contributors (id,username,password_hash,display_name,role,correspondence,bio,theme) VALUES
('a','Alice','unused','Alice Researcher','member','researcher@example.invalid','Paranormal and ITC research.','asylum'),
('b','Bob','unused','Bob Investigator','member','bob@example.invalid','Fieldwork.','cryptid');
INSERT INTO sessions (token,contributor_id,expires_at) VALUES ('test-a','a','2099-01-01'),('test-b','b','2099-01-01');
INSERT INTO member_blocks VALUES ('a','b','2026-10-09');`);
const env={TPI_DB:{prepare(sql){return {bind(...args){return {
async first(){return db.prepare(sql).get(...args)||null},
async all(){return {results:db.prepare(sql).all(...args)}},
async run(){return db.prepare(sql).run(...args)}
}}}}}};
async function call(path,owner='a',method='GET',body) {
 const headers=new Headers({'Content-Type':'application/json'}); if(owner) headers.set('Cookie','tpi_session=test-'+owner);
 return onRequest({request:new Request('http://settings.test/api'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)}),env,params:{path:path.split('?')[0].slice(1).split('/')}});
}
async function json(...args){const res=await call(...args);const data=await res.json();assert(res.ok,JSON.stringify(data));return data;}
for(const path of ['/me/personalization','/me/blocked-users']) assert.equal((await call(path,null)).status,401);
assert.equal((await call('/contributors/me/theme',null,'POST',{theme:'asylum'})).status,401);
assert.equal((await call('/me/personalization',null,'POST',{highlight:'asylum',font:'serif'})).status,401);
assert.equal((await call('/me/personalization','a','POST',{highlight:'anything',font:'serif'})).status,400);
assert.equal((await call('/contributors/me/theme','a','POST',{theme:'light'})).status,400);
assert.deepEqual((await json('/me/personalization')).style,{highlight:'theme',font:'default'});
await json('/me/personalization','a','POST',{highlight:'gothicnight',font:'serif',owner_id:'b'});
assert.deepEqual((await json('/me/personalization','b')).style,{highlight:'theme',font:'default'});
assert.deepEqual((await json('/profile-style?username=Alice',null)).style,{highlight:'gothicnight',font:'serif'});
assert.equal((await json('/me/blocked-users')).users.length,1);
assert.equal((await json('/me/blocked-users','b')).users.length,0);
for(const theme of ['cryptid','fieldops','seance','cosmic','asylum','gothicnight']) {await json('/contributors/me/theme','a','POST',{theme});assert.equal(db.prepare('SELECT theme FROM contributors WHERE id=?').get('a').theme,theme);}
console.log('PASS real API/SQLite: auth gates, enum validation, owner isolation, theme persistence, public style only, real Messenger block list.');
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.SETTINGS_PLAYWRIGHT || 'playwright');
const browser=await chromium.launch({executablePath:process.env.SETTINGS_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage();
await page.addInitScript(()=>localStorage.setItem('tpiFloatingChatFrame',JSON.stringify({collapsed:true})));
const errors=[];page.on('pageerror',e=>errors.push(e.message));
let failStyle=false, failTheme=false;
await page.route('**/*',async route=>{
 const request=route.request(),u=new URL(request.url());
 if(u.hostname!=='settings.test')return route.abort();
 if(u.pathname.startsWith('/api/')) {
  const path=u.pathname.slice(4)+u.search;
  const real=['/auth/me','/me/personalization','/contributors/me/theme','/profile-style','/me/blocked-users','/notifications/preferences'];
  if((failStyle&&path==='/me/personalization'&&request.method()==='POST') || (failTheme&&path==='/contributors/me/theme')) return route.fulfill({status:500,json:{error:'Test save failure'}});
  if(real.some(p=>path.split('?')[0]===p)) {
   const body=request.postData()?JSON.parse(request.postData()):undefined;
   const result=await call(path,'a',request.method(),body);
   return route.fulfill({status:result.status,headers:Object.fromEntries(result.headers),body:await result.text()});
  }
  if(path.startsWith('/contributors/profile'))return route.fulfill({json:{profile:{username:'Alice',displayName:'Alice Researcher',role:'member',bio:'Paranormal and ITC research.'},articles:[]}});
  return route.fulfill({json:{articles:[],categories:[],notifications:[],conversations:[],members:[],users:[],count:0,unreadCount:0,ok:true}});
 }
 const path=u.pathname==='/'?'index.html':u.pathname.slice(1);
 if(path.includes('..')) return route.fulfill({status:404,body:''});
 try { const content=fs.readFileSync(root+'/'+path);return route.fulfill({contentType:path.endsWith('.css')?'text/css':path.endsWith('.js')?'text/javascript':path.endsWith('.html')?'text/html':'application/octet-stream',body:content}); }
 catch {return route.fulfill({status:404,body:''});}
});
const sections=['account','profile','profile-visibility','privacy-safety','blocked-users','content-ownership','personalization','notifications','content-feed','data','help-support','legal','payments'];
async function goto(key) { await page.evaluate(key=>{location.hash=key},key);await page.waitForFunction(key=>document.querySelector('[data-settings-panel="'+key+'"]')?.hidden===false,key); }
for(const width of [1440,1024,768,390]) {
 await page.setViewportSize({width,height:1000});
 await page.goto('http://settings.test/member-dashboard.html#account');
 await page.waitForSelector('body.member-mode');
 await page.waitForFunction(()=>document.querySelector('[data-account-identity]')?.textContent.includes('Alice'));
 await page.waitForFunction(()=>!document.querySelector('[data-style-save]').disabled);
 if(width===390) {
  assert.equal(await page.locator('.member-mobile-nav [data-nav="studio"]').getAttribute('aria-label'),'Creator Studio');
  assert.equal(await page.locator('.member-mobile-nav [data-nav="studio"]').getAttribute('aria-disabled'),'true');
 }
 assert.equal(await page.locator('[data-settings-link]').count(),13);
 for(const key of sections) {
  await goto(key);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  assert(!overflow,`${width} ${key} page overflow`);
  const outside=await page.locator('[data-settings-panel]:not([hidden])').evaluate(panel=>[...panel.querySelectorAll('input:not([type=checkbox]),select,textarea,button')].filter(el=>{
   const r=el.getBoundingClientRect(), p=panel.getBoundingClientRect();return r.width&& (r.left<p.left-1||r.right>p.right+1);
  }).map(el=>el.outerHTML.slice(0,100)));
  assert.deepEqual(outside,[],`${width} ${key} overflowing controls`);
  if(['account','personalization'].includes(key))await page.screenshot({path:`/tmp/tpi-settings-${key}-${width}.png`,fullPage:true});
 }
}
await page.setViewportSize({width:1440,height:1000});
await goto('overview');
await page.locator('#settings-search').fill('password');
assert.equal(await page.locator('[data-settings-link]:not([hidden])').count(),2);
await page.locator('#settings-search').fill('zzzz-not-a-setting');
assert.equal(await page.locator('[data-settings-link]:not([hidden])').count(),0);
await page.locator('#settings-search').fill('');
await goto('personalization');
await page.locator('[data-theme-option=fieldops]').click();
await page.waitForFunction(()=>document.querySelector('[data-theme-save-status]').textContent.startsWith('Theme saved'));
assert.equal(db.prepare('SELECT theme FROM contributors WHERE id=?').get('a').theme,'fieldops');
await page.locator('[data-style-option=highlight][data-value=cosmic]').click();
await page.locator('[data-style-option=font][data-value=creator]').click();
assert.equal(await page.locator('html').getAttribute('data-theme'),'fieldops');
await page.locator('[data-style-save]').click();
await page.waitForFunction(()=>document.querySelector('[data-style-status]').textContent.startsWith('Highlights and font saved'));
assert.deepEqual((await json('/me/personalization')).style,{highlight:'cosmic',font:'creator'});
await page.reload();await page.waitForFunction(()=>!document.querySelector('[data-style-save]').disabled);
assert.equal(await page.locator('[data-style-option=highlight][data-value=cosmic]').getAttribute('aria-pressed'),'true');
failStyle=true;
await page.locator('[data-style-option=highlight][data-value=asylum]').click();await page.locator('[data-style-save]').click();
await page.waitForFunction(()=>document.querySelector('[data-style-status]').textContent.includes('restored'));
assert.equal(await page.locator('[data-style-option=highlight][data-value=cosmic]').getAttribute('aria-pressed'),'true');
failTheme=true;
await page.locator('[data-theme-option=asylum]').click();
await page.waitForFunction(()=>document.querySelector('[data-theme-save-status]').textContent.includes('restored'));
assert.equal(await page.locator('html').getAttribute('data-theme'),'fieldops');
for(const key of ['reel-preferences','message-requests','reporting-moderation',...['terms','privacy','community-guidelines','data-deletion','safety-reporting','cookies','copyright','child-safety'].map(k=>'legal/'+k)]) await goto(key);
await page.goto('http://settings.test/member-dashboard.html#blocked-users');
await page.getByText('@Bob',{exact:true}).waitFor();
await page.goto('http://settings.test/member-profile.html');
await page.waitForSelector('.member-profile-summary h2');
await page.waitForFunction(()=>document.querySelector('.member-profile-card')?.dataset.profileHighlight==='cosmic');
assert((await page.locator('.member-profile-summary h2').evaluate(el=>getComputedStyle(el).fontFamily)).includes('Arial Black'));
await page.goto('http://settings.test/contributor-profile.html?username=Alice');
await page.waitForFunction(()=>document.querySelector('.public-profile-card')?.dataset.profileHighlight==='cosmic');
assert((await page.locator('.public-profile-heading h1').evaluate(el=>getComputedStyle(el).fontFamily)).includes('Arial Black'));
await browser.close();
assert.deepEqual(errors,[]);
console.log('PASS actual member shell/UI with real Settings API: all 13 pages, 8 policy areas, 3 secondary routes, 4 viewport sizes, search, deep links, theme/style save & reload & failure rollback, private/public profile styling; no JS errors or overflowing controls. Other background APIs use empty fixtures; no live member data changed.');

