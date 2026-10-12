import { chromium } from '../pitchup/node_modules/@playwright/test/index.mjs';
import { seed, stateFor } from '../pitchup/server/domain.mjs';
import { mkdirSync } from 'node:fs';
mkdirSync('assets',{recursive:true});
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const p=await b.newPage({viewport:{width:1250,height:930},deviceScaleFactor:2});
 await p.route('**/api/state',r=>r.fulfill({json:stateFor(seed(),'athlete')}));
 await p.goto('http://127.0.0.1:5173');await p.getByRole('heading',{name:'Make your next move.'}).waitFor();await p.evaluate(()=>document.fonts.ready);
 await p.getByRole('button',{name:'My journey',exact:true}).click();
 await p.locator('.journey-page').screenshot({path:'assets/journey.png'});
 await p.getByRole('button',{name:/Finding my rhythm in the nets/}).click();await p.getByRole('button',{name:'Choose milestone audience'}).click();
 await p.getByRole('dialog').screenshot({path:'assets/sharing.png'});
 console.log('Captured current prototype with fictional batting, bowling, and fielding records.');
}finally{await b.close();}
