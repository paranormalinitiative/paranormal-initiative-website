import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const base=process.env.TPI_104_BASE_URL || 'http://127.0.0.1:5194';
assert(/^http:\/\/127\.0\.0\.1:\d+$/.test(base),'local loopback only');
const accounts=JSON.parse(readFileSync('.local-dev/local-auth-credentials.json')).accounts;
let passed=0;const check=(name,ok)=>{assert(ok,name);passed++;console.log('PASS:',name);};
async function request(path,cookie='',method='GET',body,origin=base){
 const r=await fetch(base+path,{method,redirect:'manual',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 const text=await r.text();let data;try{data=JSON.parse(text);}catch{data=null;}return {r,status:r.status,data,text};
}
async function login(account){const q=await request('/api/auth/login','','POST',account);assert.equal(q.status,200);return q.r.headers.get('set-cookie').split(';')[0];}
check('signed-out private Studio API returns 401',(await request('/api/studio/workspaces')).status===401);
check('incorrect password cannot authenticate',(await request('/api/auth/login','','POST',{username:accounts.test_admin.username,password:'deliberately-invalid-disposable-password'})).status===401);
const a=await login(accounts.test_admin),b=await login(accounts.local_admin);
check('two synthetic accounts authenticate',!!a&&!!b);
const run=Date.now().toString(36);
const created=await request('/api/studio/workspaces',a,'POST',{title:'TPI-104 Worker '+run,localBroadcastId:'tpi-104-'+run,state:{broadcast:{id:'tpi-104-'+run,title:'TPI-104 Worker '+run},configuration:{}}});
check('owner creates persisted workspace',created.status===201&&!!created.data.workspace?.id);
const id=created.data.workspace.id,path='/api/studio/workspaces/'+id;
check('other account cannot read owned workspace',(await request(path,b)).status===404);
check('other account list excludes workspace',!(await request('/api/studio/workspaces',b)).data.workspaces.some(w=>w.id===id));
check('other account cannot rename workspace',(await request(path,b,'PATCH',{title:'must not change',expectedVersion:1})).status===404);
check('foreign Origin cannot mutate workspace',(await request(path,a,'PATCH',{title:'must not change'},'https://foreign.invalid')).status===403);
for(const mode of ['studio-only','with-contents']){
 check('anonymous '+mode+' purge returns 401',(await request(path+'/purge','','POST',{mode})).status===401);
 const before=(await request('/api/studio/workspaces',a)).data.workspaces.find(w=>w.id===id);
 const q=await request(path+'/purge',a,'POST',{mode,expectedVersion:before.version});
 check('legacy '+mode+' purge cannot bypass server gate',q.status===503&&q.data.code==='studio_permanent_deletion_unavailable'&&q.data.ok===false);
 const after=(await request('/api/studio/workspaces',a)).data.workspaces.find(w=>w.id===id);
 check(mode+' rejected without workspace mutation',JSON.stringify(before)===JSON.stringify(after));
}
check('foreign Origin purge rejected',(await request(path+'/purge',a,'POST',{mode:'with-contents'},'https://foreign.invalid')).status===403);
for(const [name,hash,type] of [
 ['assets/index-D1h4nSZd.js','4eed57a4f243c9474fb73957d9e567defb2bb43ef3bcc82c1749ba02fcf92557','javascript'],
 ['assets/index-CcFjA_0p.css','8501862945034d73a08df30e81291891491536edd82f16e0074b98a933e4cf69','css']]){
 const r=await fetch(base+'/studio/'+name,{headers:{Cookie:a}});const bytes=Buffer.from(await r.arrayBuffer());
 check('served '+name+' matches Directive 103 hash and MIME',r.status===200&&r.headers.get('content-type').includes(type)&&createHash('sha256').update(bytes).digest('hex')===hash);
}
const original=readFileSync('studio/index.html','utf8');
check('tracked entry point matches Directive 103',createHash('sha256').update(original).digest('hex')==='08ba5857dc352c6642430a90f2cd773d69091bfd7bc76a31c8b2d5f5d5ef2a4f');
const staged=readFileSync('.local-dev/assets/studio/index.html','utf8');
check('local staging changes only documented content-version queries',staged.replace(/\?v=[a-f0-9]{16}/g,'')===original);
const worker=readFileSync('worker.js','utf8');
const wrappers=vm.runInNewContext(worker.slice(worker.indexOf('const LOCAL_REQUEST_GUARD ='),worker.indexOf('async function serveAssets('))+';({LOCAL_REQUEST_GUARD,EARLY_THEME_BOOTSTRAP})');
const expected=staged.replace(/<head([^>]*)>/i,`<head$1>${wrappers.EARLY_THEME_BOOTSTRAP}`).replace(/<head([^>]*)>/i,`<head$1>${wrappers.LOCAL_REQUEST_GUARD}`);
const served=await fetch(base+'/studio/',{headers:{Cookie:a}});
check('served HTML equals staged candidate plus exact maintained local wrappers',served.status===200&&await served.text()===expected);
for(const name of ['voice-fx-worklet.js','openvoicechanger-bridge-worklet.js']){
 const r=await fetch(base+'/studio/'+name,{headers:{Cookie:a}});const bytes=Buffer.from(await r.arrayBuffer());
 check(name+' loads under /studio/',r.status===200&&r.headers.get('content-type').includes('javascript')&&bytes.equals(readFileSync('studio/'+name)));
}
check('logout terminates session',(await request('/api/auth/logout',a,'POST',{})).status===200&&(await request('/api/auth/me',a)).data.user===null&&(await request('/api/studio/workspaces',a)).status===401);
console.log(JSON.stringify({suite:'TPI-STUDIOFLOW-104-WORKER',passed,failed:0,base,production:false}));
