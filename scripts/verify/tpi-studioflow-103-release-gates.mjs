import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('functions/api/[[path]].js','utf8');
assert.match(source,/path\.match\(\/\^\\\/studio\\\/workspaces.*unavailablePermanentStudioDeletion\(request\)/);
const start=source.indexOf('function unavailablePermanentStudioDeletion(');
const end=source.indexOf('async function handlePurgeStudioWorkspace(',start);
let allow=true;
const context=vm.createContext({sameOriginMutationAllowed:()=>allow,json:(body,status,headers)=>({body,status,headers})});
vm.runInContext(source.slice(start,end)+';globalThis.gate=unavailablePermanentStudioDeletion;',context);
for(const mode of ['studio-only','with-contents']){
 const result=context.gate({body:{mode}});assert.equal(result.status,503);assert.equal(result.body.ok,false);assert.equal(result.body.code,'studio_permanent_deletion_unavailable');
}
allow=false;assert.equal(context.gate({}).status,403);
const bridge=readFileSync('studio/workspace-bridge.js','utf8');
const a=bridge.indexOf('function deleteStudioPermanently('),b=bridge.indexOf('function deleteWorkspace(',a);
const bc=vm.createContext({setMessage(){},describe:e=>e.message});
vm.runInContext(bridge.slice(a,b)+';globalThis.gate=deleteStudioPermanently;',bc);
for(const mode of ['studio-only','with-contents'])await assert.rejects(bc.gate('disposable',{mode}),/temporarily unavailable/);
const index=readFileSync('studio/index.html','utf8');
for(const match of index.matchAll(/(?:src|href)="(\/studio\/[^"?]+)(?:\?[^\"]*)?"/g)) readFileSync('.'+match[1]);
console.log('PASS: both authenticated purge modes fail closed, foreign origin rejected, browser/server bridge gate rejects both modes, integrated asset references exist. No DB, R2 or IndexedDB mutations invoked.');
