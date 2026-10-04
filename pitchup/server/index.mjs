import http from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { seed, stateFor, validateActivity, validateProfile, projectActivity } from './domain.mjs';
const port = Number(process.env.PORT || 3001);
const dataDir = resolve(process.env.PITCHUP_DATA_DIR || 'data'); mkdirSync(dataDir,{recursive:true});
const dbFile=resolve(dataDir,'pitchup.json');
let db;
try { db=existsSync(dbFile)?JSON.parse(readFileSync(dbFile,'utf8')):seed(); } catch { console.error('Could not read saved data. Restore the JSON file before restarting.'); process.exit(1); }
function save(){writeFileSync(dbFile+'.tmp',JSON.stringify(db,null,2));renameSync(dbFile+'.tmp',dbFile);} if(!existsSync(dbFile))save();
const sessions=new Map();
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
async function body(req){let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>16000)throw new Error('Request too large.');}try{return JSON.parse(raw||'{}');}catch{throw new Error('Invalid JSON.');}}
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(!url.pathname.startsWith('/api/')){
    const root=resolve('dist'); let target=resolve(root,'.'+decodeURIComponent(url.pathname));
    if(target!==root&&!target.startsWith(root+sep))return json(res,403,{error:'Forbidden'});
    if(!existsSync(target)||!statSync(target).isFile())target=resolve(root,'index.html');
    if(!existsSync(target))return json(res,404,{error:'Run npm run dev, or build the app first.'});
    const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'};
    res.writeHead(200,{'Content-Type':types[extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});return res.end(readFileSync(target));
  }
  const allowedOrigins=new Set([`http://127.0.0.1:${port}`,'http://127.0.0.1:5173']);
  if(req.method!=='GET'&&req.headers.origin&&!allowedOrigins.has(req.headers.origin))return json(res,403,{error:'Cross-origin write blocked.'});
  let sid=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('pitchup_session='))?.split('=')[1];
  if(!sessions.has(sid)){sid=randomUUID();sessions.set(sid,'athlete');res.setHeader('Set-Cookie',`pitchup_session=${sid}; HttpOnly; SameSite=Strict; Path=/`);}
  const role=sessions.get(sid);
  if(req.method==='GET'&&url.pathname==='/api/state')return json(res,200,stateFor(db,role));
  if(req.method==='POST'&&url.pathname==='/api/perspective'){
    const input=await body(req);if(!['athlete','coach','visitor'].includes(input.role))throw new Error('Unknown demo perspective.');sessions.set(sid,input.role);return json(res,200,stateFor(db,input.role));
  }
  if(req.method==='POST'&&url.pathname.match(/^\/api\/activities\/[^/]+\/review$/)){
    if(role!=='coach')return json(res,403,{error:'Switch to the demo coach perspective to review.'});
    const id=url.pathname.split('/')[3];const a=db.activities.find(x=>x.id===id);
    if(!a||!a.shareWithCoach)return json(res,404,{error:'Session not available to this coach.'});
    a.review='Reviewed in the fictional demo';save();return json(res,200,stateFor(db,role));
  }
  if(role!=='athlete')return json(res,403,{error:'This action is only available in your athlete perspective.'});
  if(req.method==='GET'&&url.pathname==='/api/export')return json(res,200,{profile:db.profile,activities:db.activities,exportedAt:new Date().toISOString(),demo:true});
  if(req.method==='POST'&&url.pathname==='/api/activities'){db.activities.push(validateActivity(await body(req)));save();return json(res,201,stateFor(db,role));}
  if(req.method==='PATCH'&&url.pathname==='/api/profile'){db.profile=validateProfile(await body(req));save();return json(res,200,stateFor(db,role));}
  if(req.method==='PATCH'&&url.pathname.match(/^\/api\/activities\/[^/]+$/)){
    const a=db.activities.find(x=>x.id===url.pathname.split('/')[3]);if(!a)return json(res,404,{error:'Session not found.'});const input=await body(req);
    if(input.visibility!==undefined){if(!['private','club','public'].includes(input.visibility))throw new Error('Choose a valid audience.');a.visibility=input.visibility;}
    if(input.shareWithCoach!==undefined){if(typeof input.shareWithCoach!=='boolean')throw new Error('Invalid coach permission.');a.shareWithCoach=input.shareWithCoach;}
    save();return json(res,200,stateFor(db,role));
  }
  if(req.method==='DELETE'&&url.pathname.match(/^\/api\/activities\/[^/]+$/)){db.activities=db.activities.filter(x=>x.id!==url.pathname.split('/')[3]);save();return json(res,200,stateFor(db,role));}
  if(req.method==='POST'&&url.pathname==='/api/cheer'){const {id}=await body(req);if(!stateFor(db,role).posts.some(p=>p.id===id))throw new Error('Post not found.');db.cheers=db.cheers.includes(id)?db.cheers.filter(x=>x!==id):[...db.cheers,id];save();return json(res,200,stateFor(db,role));}
  if(req.method==='POST'&&url.pathname==='/api/challenge'){db.challengeJoined=!db.challengeJoined;save();return json(res,200,stateFor(db,role));}
  if(req.method==='POST'&&url.pathname==='/api/report'){const {id,reason}=await body(req);if(!stateFor(db,role).posts.some(p=>p.id===id))throw new Error('Post not found.');if(!['Unwanted contact','Inappropriate content','Other concern'].includes(reason))throw new Error('Select a reason.');db.reports.push({id,reason,date:new Date().toISOString()});db.hiddenPosts.push(id);save();return json(res,200,stateFor(db,role));}
  return json(res,404,{error:'Not found.'});
 }catch(error){json(res,400,{error:error.message||'Unable to complete request.'});}
});
server.listen(port,'127.0.0.1',()=>console.log(`PitchUp API / production app: http://127.0.0.1:${port} (local fictional demo)`));
