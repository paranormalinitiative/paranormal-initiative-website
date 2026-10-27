import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { Builder } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox.js';

// No auth, Worker, production routes or owner profile. Ephemeral loopback origin
// and WebDriver's disposable profile; the only served code is the tested module.
const source = resolve(process.argv[2] || '../source-100');
const requireSource = createRequire(resolve(source, 'package.json'));
const ts = requireSource('typescript');
const module = ts.transpileModule(readFileSync(resolve(source, 'src/localRecordingDeletion.ts'), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 }
}).outputText;
const server = createServer((request, response) => {
  if (request.url === '/module.js') { response.writeHead(200, {'Content-Type':'text/javascript'}); response.end(module); }
  else { response.writeHead(200, {'Content-Type':'text/html'}); response.end('<!doctype html><title>Disposable TPI 102 storage fixture</title>'); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
let driver; let passed = 0;
const check = (name, value) => { assert(value, name); passed++; console.log('PASS:', name); };
async function js(body) {
  const result = await driver.executeAsyncScript(`const done=arguments[arguments.length-1]; (async()=>{${body}})().then(value=>done({value}),error=>done({error:String(error)}));`);
  if (result.error) throw Error(result.error);
  return result.value;
}
try {
  const options = new firefox.Options()
    .setBinary(process.env.TPI_FIREFOX_BINARY || '/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox')
    .addArguments('-headless', '-no-remote', '-new-instance');
  driver = await new Builder().forBrowser('firefox').setFirefoxOptions(options)
    .setFirefoxService(new firefox.ServiceBuilder(process.env.TPI_GECKODRIVER || '/opt/homebrew/bin/geckodriver')).build();
  await driver.manage().setTimeouts({script:15000});
  await driver.get(origin);
  const first = await driver.getWindowHandle();
  await js(`window.api=await import('/module.js');
    await new Promise(resolve=>{navigator.locks.request('tpi-102-proof',async()=>{resolve();await new Promise(done=>window.releaseProof=done);});});return true;`);
  await driver.switchTo().newWindow('tab'); await driver.get(origin);
  check('legacy tab can write ownership while another tab holds exclusive Web Lock', await js(`
    localStorage.setItem('studioflow.libraryItems',JSON.stringify([{id:'shared',studioId:'B',recordingBlobKey:'blob'}]));
    const locks=await navigator.locks.query();return locks.held.some(lock=>lock.name==='tpi-102-proof') && !!localStorage.getItem('studioflow.libraryItems');`));
  await driver.switchTo().window(first);
  check('participating tab observes legacy shared reference', await js(`return api.recordingDeletionPlan(localStorage.getItem('studioflow.libraryItems'),'A',['blob']).exclusive.length===0;`));
  check('candidate refuses destructive action even with available browser locks', await js(`let ran=false;try{await api.createDeletionCoordinator(navigator.locks).exclusive(async()=>{ran=true;});}catch(error){return !ran && String(error).includes('cannot be coordinated');}return false;`));
  check('real IndexedDB aborted batch rolls back every queued removal', await js(`
    window.db=await new Promise((resolve,reject)=>{const r=indexedDB.open('tpi-102-disposable',1);r.onupgradeneeded=()=>r.result.createObjectStore('blobs');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    window.tx=work=>new Promise((resolve,reject)=>{const t=db.transaction('blobs','readwrite');t.oncomplete=resolve;t.onabort=()=>reject(Error('transaction aborted'));t.onerror=()=>{};work(t.objectStore('blobs'),t);});
    await tx(s=>{s.put(new Blob(['A']),'blob');s.put(new Blob(['B']),'other');});
    try{await tx((s,t)=>{s.delete('blob');s.delete('other');t.abort();});}catch{}
    window.has=key=>new Promise((resolve,reject)=>{const r=db.transaction('blobs').objectStore('blobs').get(key);r.onsuccess=()=>resolve(!!r.result);r.onerror=()=>reject(r.error);});
    return await has('blob') && await has('other');`));
  check('injected real transaction failure persists incomplete retry journal', await js(`
    localStorage.setItem('studioflow.libraryItems',JSON.stringify([{id:'one',studioId:'A',recordingBlobKey:'blob'},{id:'two',studioId:'B',recordingBlobKey:'other'}]));
    try{await api.runLocalDeletion({studio:'A',mode:'with-contents',candidates:['blob'],storage:localStorage,shared:async()=>[],server:async()=>({ok:true}),remove:async()=>tx((s,t)=>{s.delete('blob');t.abort();})});}
    catch(error){return String(error).includes('incomplete') && JSON.parse(localStorage.getItem('studioflow.localDeletion.v1.A')).phase==='server-complete' && await has('blob');}return false;`));
  await driver.navigate().refresh();
  check('reload preserves pinned scope and server-complete recovery evidence', await js(`window.api=await import('/module.js');const j=JSON.parse(localStorage.getItem('studioflow.localDeletion.v1.A'));return j.mode==='with-contents' && j.phase==='server-complete' && j.candidates.join()==='blob';`));
  check('changed retry mode rejected after reload', await js(`try{await api.runLocalDeletion({studio:'A',mode:'studio-only',candidates:[],storage:localStorage,shared:async()=>[],server:async()=>{throw Error('must not run');},remove:async()=>{throw Error('must not run');}});}catch(e){return String(e).includes('scope');}return false;`));
  check('same-scope helper retry skips server and preserves unrelated blob', await js(`
    const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('tpi-102-disposable',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    try{await api.runLocalDeletion({studio:'A',mode:'with-contents',candidates:['blob','other'],storage:localStorage,shared:async()=>[],server:async()=>{throw Error('must not repeat server');},remove:async keys=>new Promise((resolve,reject)=>{const t=db.transaction('blobs','readwrite');keys.forEach(k=>t.objectStore('blobs').delete(k));t.oncomplete=resolve;t.onabort=()=>reject(t.error);})});
    return await new Promise(resolve=>{const t=db.transaction('blobs');const s=t.objectStore('blobs');let a,b;s.get('blob').onsuccess=e=>a=e.target.result;s.get('other').onsuccess=e=>b=e.target.result;t.oncomplete=()=>resolve(!a && !!b);});}finally{db.close();}`));
  console.log(`${passed}/${passed} boundary checks passed. Legacy writer race reproduced; content deletion remains BLOCKED. Helper recovery tests do not enable the application path.`);
} finally {
  if (driver) await driver.quit();
  await new Promise(done=>server.close(done));
}
