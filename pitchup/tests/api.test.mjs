import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
test('API enforces perspective permissions, persistence, consent revocation, and same-origin writes',async()=>{
 const dir=mkdtempSync(resolve(tmpdir(),'pitchup-test-'));const port=3187;
 const launch=()=>spawn(process.execPath,['server/index.mjs'],{env:{...process.env,PORT:String(port),PITCHUP_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});
 async function ready(child){await new Promise((ok,no)=>{const timer=setTimeout(()=>no(new Error('Server did not start')),10000);child.stdout.once('data',()=>{clearTimeout(timer);ok()});child.once('error',no);child.once('exit',code=>{if(code)no(new Error('Server failed '+code))});});}
 let child=launch();await ready(child);let cookie='';
 async function call(path,method='GET',body,headers={}){const r=await fetch(`http://127.0.0.1:${port}/api${path}`,{method,headers:{'Content-Type':'application/json',Cookie:cookie,...headers},body:body?JSON.stringify(body):undefined});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()};}
 try{
  await call('/state');const created=await call('/activities','POST',{type:'Bowling',title:'API privacy test',date:new Date().toISOString().slice(0,10),duration:25,balls:30,effort:4,notes:'SECRET-REFLECTION',shareWithCoach:true});assert.equal(created.status,201);const id=created.data.activities.find(a=>a.title==='API privacy test').id;
  await call('/activities/'+id,'PATCH',{visibility:'public'});let r=await call('/perspective','POST',{role:'visitor'});assert.ok(r.data.posts.some(p=>p.id===id));assert.ok(!JSON.stringify(r.data).includes('SECRET-REFLECTION'));assert.equal((await call('/export')).status,403);assert.equal((await call('/activities/'+id,'DELETE')).status,403);
  r=await call('/perspective','POST',{role:'coach'});assert.ok(r.data.activities.some(a=>a.id===id));assert.ok(!JSON.stringify(r.data).includes('SECRET-REFLECTION'));assert.equal((await call('/activities/'+id+'/review','POST',{})).status,200);
  await call('/perspective','POST',{role:'athlete'});await call('/activities/'+id,'PATCH',{visibility:'private',shareWithCoach:false});r=await call('/perspective','POST',{role:'visitor'});assert.ok(!r.data.posts.some(p=>p.id===id));await call('/perspective','POST',{role:'athlete'});
  assert.equal((await call('/profile','PATCH',{}, {Origin:'https://unrelated.example'})).status,403);
  child.kill();await new Promise(ok=>child.once('exit',ok));cookie='';child=launch();await ready(child);r=await call('/state');assert.ok(r.data.activities.some(a=>a.id===id&&a.notes==='SECRET-REFLECTION'&&a.visibility==='private'));
 }finally{child.kill();}
});
