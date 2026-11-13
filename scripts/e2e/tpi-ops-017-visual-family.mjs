import { createRequire } from 'node:module';
import fs from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const require=createRequire(resolve(repo,'package.json'));
const {firefox}=require('playwright');
const base='http://127.0.0.1:8787';
const credentialPath=resolve(repo,'.local-dev/local-auth-credentials.json');
if((fs.statSync(credentialPath).mode&0o777)!==0o600)throw new Error('Synthetic audit credentials must have mode 0600.');
const creds=JSON.parse(fs.readFileSync(credentialPath,'utf8')).accounts;
const themes=['cryptid','seance','cosmic','asylum','fieldops','gothicnight'];
const sizes=[{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}];
const routes=[
 {path:'/',role:'anonymous'}, {path:'/about.html',role:'anonymous'}, {path:'/education-center.html',role:'anonymous'},
 {path:'/education-area-investigation-science.html',role:'anonymous'}, {path:'/education-research-what-is-ghost-hunting.html',role:'anonymous'},
 {path:'/ghostology-101.html',role:'anonymous'}, {path:'/member-home.html',role:'member'}, {path:'/member-profile.html',role:'member'},
 {path:'/friends.html',role:'member'}, {path:'/community-home.html',role:'member'}, {path:'/member-dashboard.html',role:'member'},
 {path:'/paratube.html',role:'member'}, {path:'/reels.html',role:'member'}, {path:'/admin-panel.html',role:'admin'},
 {path:'/paper-editor.html',role:'contributor'}, {path:'/teams/index.html',role:'anonymous'},
 {path:'/creator-videos.html',role:'contributor'}
];
const screenshots=new Set(['/','/education-center.html','/member-home.html','/member-profile.html','/friends.html','/admin-panel.html','/teams/index.html']);
const browser=await firefox.launch({headless:true});
const out=[]; const blocked=new Set();
async function makeContext(theme,role){
 const context=await browser.newContext({viewport:sizes[0]});
 await context.addInitScript(t=>{try{localStorage.setItem('tpiSiteTheme',t)}catch{}},theme);
 await context.route('**/*',async route=>{const u=new URL(route.request().url()); if(u.protocol==='http:'&&['127.0.0.1','localhost'].includes(u.hostname)&&['8787','8788'].includes(u.port)) await route.continue(); else {blocked.add(u.origin); await route.abort('blockedbyclient')}});
 const page=await context.newPage();
 if(role!=='anonymous'){
  await page.goto(base+'/member-login.html',{waitUntil:'domcontentloaded',timeout:15000});
  const account=role==='admin'?creds.local_admin:role==='contributor'?creds.local_contributor:creds.local_member;
  await page.locator('form[data-member-login] input[name="username"]').fill(account.username);
  await page.locator('form[data-member-login] input[name="password"]').fill(account.password);
  await page.locator('form[data-member-login] button[type="submit"]').click();
  await page.waitForFunction(async()=>{try{return(await(await fetch('/api/auth/me',{credentials:'same-origin'})).json()).user!=null}catch{return false}},{timeout:10000});
  await page.waitForTimeout(300);
 }
 return {context,page};
}
for(const theme of themes){
 const contexts={}; for(const role of ['anonymous','member','admin','contributor'])contexts[role]=await makeContext(theme,role);
 for(const route of routes){const {page}=contexts[route.role]; for(const size of sizes){
  await page.setViewportSize({width:size.width,height:size.height}); const errors=[];
  page.removeAllListeners('pageerror');page.on('pageerror',e=>errors.push(e.message.slice(0,180)));
  let response=null,navError='';try{response=await page.goto(base+route.path,{waitUntil:'domcontentloaded',timeout:15000});await page.waitForTimeout(140)}catch(e){navError=String(e).slice(0,160)}
  await page.evaluate(t=>document.documentElement.setAttribute('data-theme',t),theme);
  const metrics=await page.evaluate(()=>{const de=document.documentElement,b=document.body,w=innerWidth;const over=[...document.querySelectorAll('body *')].filter(el=>{const r=el.getBoundingClientRect();if(!r.width||!r.height||r.right<=w+2||r.left>=w-2)return false;for(let p=el.parentElement;p&&p!==b;p=p.parentElement){const s=getComputedStyle(p);if((s.overflowX==='auto'||s.overflowX==='scroll')&&p.scrollWidth>p.clientWidth)return false}return r.right>w+3||r.left< -3}).slice(0,6).map(el=>({tag:el.tagName,cls:String(el.className||'').slice(0,70),left:Math.round(el.getBoundingClientRect().left),right:Math.round(el.getBoundingClientRect().right)}));const greeting=document.querySelector('.member-greeting')?.getBoundingClientRect();const heading=document.querySelector('.command-header h1');let title=null;if(heading){const range=document.createRange();range.selectNodeContents(heading);const r=range.getBoundingClientRect();title={left:r.left,right:r.right,top:r.top,bottom:r.bottom}}const greetingOverlap=Boolean(greeting&&title&&greeting.left<title.right&&greeting.right>title.left&&greeting.top<title.bottom&&greeting.bottom>title.top);const banner=document.querySelector('.profile-banner-preview')?.getBoundingClientRect();const profileCard=document.querySelector('.member-profile-card')?.getBoundingClientRect();return{titleText:document.title,theme:de.getAttribute('data-theme'),width:w,docWidth:de.scrollWidth,bodyWidth:b?.scrollWidth||0,bodyHeight:de.scrollHeight,horizontalOverflow:Math.max(0,de.scrollWidth-w),outsideViewport:over,blank:(b?.innerText||'').trim().length<10,brokenImages:[...document.images].filter(i=>i.getAttribute('src')&&i.complete&&i.naturalWidth===0&&!/^https?:/.test(i.currentSrc)).length,greetingOverlap,profileCardRight:profileCard?Math.round(profileCard.right):null,bannerRight:banner?Math.round(banner.right):null}}).catch(()=>({titleText:'',theme:'',horizontalOverflow:0,blank:true,outsideViewport:[]}));
  out.push({theme,size:size.name,route:route.path,role:route.role,expectedTheme:theme,status:response?.status()||0,...metrics,pageErrors:errors,navigationError:navError});
  if(screenshots.has(route.path)&&(size.name==='desktop'||['/','/member-home.html','/member-profile.html','/education-center.html'].includes(route.path))){const dir=`${repo}/.local-dev/tpi-ops017-visual/${theme}/${size.name}`;fs.mkdirSync(dir,{recursive:true});const name=route.path==='/'?'home':route.path.split('/').pop().replace(/\.html$/,'');await page.screenshot({path:`${dir}/${name}.png`,fullPage:false}).catch(()=>{})}
 }}
 for(const c of Object.values(contexts))await c.context.close();console.log(`completed theme ${theme}; page checks ${out.length}`);
}
await browser.close();
const result={themes,routeCount:routes.length,viewportCount:2,totalChecks:out.length,overflow:out.filter(x=>x.horizontalOverflow>8||x.outsideViewport?.length).map(({theme,size,route,horizontalOverflow,outsideViewport})=>({theme,size,route,horizontalOverflow,outsideViewport})),wrongTheme:out.filter(x=>x.theme!==x.expectedTheme),blank:out.filter(x=>x.blank||x.status!==200).map(x=>({theme:x.theme,size:x.size,route:x.route,status:x.status,navigationError:x.navigationError})),brokenImages:out.filter(x=>x.brokenImages).map(x=>({theme:x.theme,size:x.size,route:x.route,count:x.brokenImages})),pageErrors:out.filter(x=>x.pageErrors.length).map(x=>({theme:x.theme,size:x.size,route:x.route,errors:x.pageErrors})),greetingOverlaps:out.filter(x=>x.greetingOverlap).map(x=>({theme:x.theme,size:x.size,route:x.route})),blockedExternal:[...blocked],results:out};
fs.writeFileSync(repo+'/.local-dev/tpi-ops017-visual-family.json',JSON.stringify(result,null,2));
const failures=result.overflow.length+result.wrongTheme.length+result.blank.length+result.brokenImages.length+result.pageErrors.length+result.greetingOverlaps.length;
console.log(JSON.stringify({status:failures?'FAIL':'PASS',totalChecks:result.totalChecks,overflowCount:result.overflow.length,wrongThemeCount:result.wrongTheme.length,blankCount:result.blank.length,brokenImageRoutes:result.brokenImages.length,pageErrorRoutes:result.pageErrors.length,greetingOverlapCount:result.greetingOverlaps.length,blockedExternal:result.blockedExternal.length,report:'.local-dev/tpi-ops017-visual-family.json'},null,2));
if(failures)process.exitCode=1;
