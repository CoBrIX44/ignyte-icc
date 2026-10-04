import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
const localChrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser=await chromium.launch({headless:true,...(existsSync(localChrome)?{executablePath:localChrome}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1080}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.PITCHUP_TEST_URL||'http://127.0.0.1:5173';
mkdirSync('test-results',{recursive:true});
let createdId;
try{
 await page.goto(base);await page.getByRole('heading',{name:'Make your next move.'}).waitFor();
 await page.screenshot({path:'test-results/dashboard-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Record activity',exact:true}).first().click();
 const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'Save session'}).click();assert.equal(await dialog.isVisible(),true);
 await dialog.getByLabel('Session title').fill('Browser test — private bowling');await dialog.getByLabel('Duration (minutes)').fill('35');await dialog.getByLabel('Deliveries bowled').fill('30');await dialog.getByRole('textbox',{name:/Private reflection/}).fill('PRIVATE-BROWSER-REFLECTION');await dialog.getByLabel('Let the demo coach see session measurements').check();
 await dialog.getByRole('button',{name:'Save session'}).click();await dialog.waitFor({state:'hidden'});
 let state=await page.evaluate(async()=> (await fetch('/api/state')).json());const created=state.activities.find(a=>a.title==='Browser test — private bowling');assert.ok(created);createdId=created.id;assert.equal(created.visibility,'private');
 await page.reload();await page.getByRole('heading',{name:'Make your next move.'}).waitFor();await page.getByRole('button',{name:'My journey',exact:true}).click();await page.getByRole('button',{name:/Browser test — private bowling/}).click();await page.getByRole('button',{name:'Choose milestone audience'}).click();await page.getByRole('radio',{name:/Public/}).check();await page.getByRole('button',{name:'Save audience'}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.getByLabel('Demo perspective').selectOption('visitor');await page.getByRole('heading',{name:'Every journey deserves a cheer.'}).waitFor();await page.getByRole('heading',{name:'Browser test — private bowling',exact:true}).waitFor();
 state=await page.evaluate(async()=> (await fetch('/api/state')).json());assert.deepEqual(state.activities,[]);assert.ok(!JSON.stringify(state).includes('PRIVATE-BROWSER-REFLECTION'));assert.equal(await page.evaluate(async()=> (await fetch('/api/export')).status),403);
 await page.getByLabel('Demo perspective').selectOption('coach');await page.getByRole('heading',{name:'Support the next step.'}).waitFor();await page.getByRole('button',{name:/Browser test — private bowling/}).click();assert.equal(await page.getByText('PRIVATE-BROWSER-REFLECTION').count(),0);await page.getByRole('button',{name:'Mark reviewed in demo'}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.getByLabel('Demo perspective').selectOption('athlete');await page.getByRole('heading',{name:'Make your next move.'}).waitFor();await page.getByRole('button',{name:'My journey',exact:true}).click();await page.getByRole('button',{name:/Browser test — private bowling/}).click();await page.getByText('Demo review completed',{exact:true}).waitFor();await page.getByRole('button',{name:'Choose milestone audience'}).click();await page.getByRole('radio',{name:/Only me/}).check();await page.getByRole('button',{name:'Save audience'}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.getByLabel('Demo perspective').selectOption('visitor');await page.getByRole('heading',{name:'Every journey deserves a cheer.'}).waitFor();assert.equal(await page.getByRole('heading',{name:'Browser test — private bowling',exact:true}).count(),0);
 await page.getByLabel('Demo perspective').selectOption('athlete');await page.getByRole('heading',{name:'Make your next move.'}).waitFor();
 await page.getByRole('button',{name:'My journey',exact:true}).click();await page.getByRole('button',{name:/Browser test — private bowling/}).click();await page.getByRole('button',{name:'Delete',exact:true}).click();await page.getByRole('button',{name:'Delete session',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});createdId=null;
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Overview',exact:true}).click();await page.screenshot({path:'test-results/dashboard-mobile.png',fullPage:true});
 for(const name of ['Overview','My journey','Club feed','Challenges','Privacy & profile']){await page.getByRole('button',{name,exact:true}).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow on ${name}`);}
 await page.getByRole('button',{name:'Edit profile & plan'}).count();
 await page.getByRole('button',{name:'Record activity',exact:true}).first().click();await page.screenshot({path:'test-results/record-mobile.png',fullPage:true});await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
 assert.deepEqual(errors,[]);console.log('Browser checks passed: logging, validation, reload, publication, API privacy, coach review, revocation, deletion, mobile navigation/overflow, Escape, no browser errors.');
}finally{
 if(createdId){await page.evaluate(async id=>{await fetch('/api/perspective',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:'athlete'})});await fetch('/api/activities/'+id,{method:'DELETE'});},createdId).catch(()=>{});}
 await browser.close();
}
