import test from 'node:test';
import assert from 'node:assert/strict';
import { seed, summary, stateFor, validateActivity, validateProfile } from '../server/domain.mjs';
const now = new Date('2026-10-04T10:00:00Z');
test('weekly facts keep bowling separate and exclude old or future sessions',()=>{
 const db=seed(now);db.activities.push({...db.activities[0],date:'2026-09-20'}, {...db.activities[0],date:'2026-10-05'});
 const s=summary(db.activities,db.profile,now);assert.equal(s.sessions,3);assert.equal(s.minutes,95);assert.equal(s.bowling,48);
});
test('new activity always starts private, even when caller requests publication',()=>{
 const a=validateActivity({type:'Bowling',title:'Nets',date:'2026-10-04',duration:30,balls:36,effort:5,visibility:'public',shareWithCoach:true},now);
 assert.equal(a.visibility,'private');assert.equal(a.shareWithCoach,true);
});
test('rejects impossible dates, future dates, negative values, fractional counts, and missing titles',()=>{
 const input={type:'Bowling',title:'Nets',date:'2026-10-04',duration:30,balls:36,effort:5};
 for(const change of [{date:'2026-02-30'},{date:'2026-10-05'},{duration:-2},{balls:1.5},{title:''},{effort:11}])assert.throws(()=>validateActivity({...input,...change},now));
});
test('public state excludes private sessions, club posts, raw measurements, reflections, and goals',()=>{
 const db=seed(now);const state=stateFor(db,'visitor');assert.deepEqual(state.activities,[]);assert.equal(state.summary,null);assert.equal(state.profile.goal,undefined);
 assert.ok(state.posts.every(p=>p.visibility==='public'));
 const serialized=JSON.stringify(state);assert.ok(!serialized.includes('Private strength session reflection'));assert.ok(!serialized.includes('duration'));assert.ok(!serialized.includes('effort'));
});
test('coach sees only opted-in measurements and never private reflections',()=>{
 const db=seed(now);const state=stateFor(db,'coach');assert.equal(state.activities.length,2);assert.ok(state.activities.every(a=>a.notes===undefined));assert.ok(!state.activities.some(a=>a.id==='seed-2'));
});
test('revoking audience or coach access removes items from subsequent projections',()=>{
 const db=seed(now);db.activities[2].visibility='private';db.activities[0].shareWithCoach=false;
 assert.ok(!stateFor(db,'visitor').posts.some(p=>p.id==='seed-3'));assert.ok(!stateFor(db,'coach').activities.some(a=>a.id==='seed-1'));
});
test('above plan triggers review language, not diagnosis or training prescription',()=>{
 const db=seed(now);db.profile.plannedBowling=24;const s=summary(db.activities,db.profile,now);assert.equal(s.status,'Plan review suggested');assert.match(s.explanation,/not an injury-risk assessment/);
});
test('zero plan and empty records explicitly preserve uncertainty',()=>{
 const db=seed(now);assert.equal(summary([],db.profile,now).status,'Start your record');db.profile.plannedBowling=0;assert.equal(summary(db.activities,db.profile,now).status,'No bowling plan entered');
});
test('profile validation rejects unsupported role and invalid goals',()=>{
 const db=seed(now);assert.throws(()=>validateProfile({...db.profile,weeklySessions:0}));assert.throws(()=>validateProfile({...db.profile,role:'Unknown'}));assert.throws(()=>validateProfile({...db.profile,name:''}));
});
