import pptxgen from 'pptxgenjs';
import {readFileSync,writeFileSync} from 'node:fs';
import {chromium} from '../pitchup/node_modules/@playwright/test/index.mjs';

const pptx=new pptxgen(); pptx.defineLayout({name:'PITCH',width:13.333333,height:7.5});pptx.layout='PITCH';
pptx.author='Vijaya Rupesh N';pptx.subject='ICC × Ignyte Hackathon — PitchUp';pptx.title='PitchUp | Women-first cricket development';pptx.company='PitchUp';pptx.lang='en-IN';
pptx.theme={headFontFace:'Arial',bodyFontFace:'Arial',lang:'en-IN'};
const C={paper:'F7F8F3',ink:'193D2D',muted:'596C60',lime:'D8EF86',line:'DCE2D7',white:'FFFFFF',soft:'EDF0E6'};
const pages=[];let s,els;const X=v=>v/120;
function rect(x,y,w,h,c){s.addShape(pptx.ShapeType.rect,{x:X(x),y:X(y),w:X(w),h:X(h),line:{color:c,transparency:100},fill:{color:c}});els.push(`<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:#${c}"></div>`);}
function txt(t,x,y,w,h,size=28,color=C.ink,bold=false,link){s.addText(t,{x:X(x),y:X(y),w:X(w),h:X(h),fontFace:'Arial',fontSize:size*.6,color,bold,margin:0,breakLine:false,paraSpaceAfter:0,valign:'top',lineSpacingMultiple:1.08,...(link?{hyperlink:{url:link}}:{})});els.push(`<div class="text" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;font-size:${size}px;color:#${color};font-weight:${bold?700:400}">${t.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('\n','<br>')}</div>`);}
function pic(path,x,y,w,h){s.addImage({path,x:X(x),y:X(y),w:X(w),h:X(h)});els.push(`<img src="data:image/png;base64,${readFileSync(path).toString('base64')}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`);}
function start(n,label,dark=false){s=pptx.addSlide();els=[];rect(0,0,1600,900,dark?C.ink:C.paper);txt('PITCHUP',72,44,300,40,28,dark?C.lime:C.ink,true);txt(label,800,49,725,35,20,dark?C.paper:C.muted);rect(72,828,1456,2,dark?'54715C':C.line);txt('ICC × IGNYTE  /  BEYOND BOUNDARIES',72,850,1100,24,16,dark?C.paper:C.muted);txt(`0${n} / 04`,1420,846,120,30,20,dark?C.lime:C.ink,true);}
function end(notes){s.addNotes(notes);pages.push({html:els.join(''),notes});}
function tag(t,x,y,w){rect(x,y,w,42,C.lime);txt(t,x+16,y+8,w-25,28,21,C.ink,true);}

start(1,'WOMEN-FIRST CRICKET DEVELOPMENT',true);
txt('Her progress should\ntravel beyond\nthe scorecard.',72,148,930,260,76,C.white,true);
txt('Turn everyday training into a personal record,\nuseful coach context and chosen moments of visibility.',77,456,860,102,32,C.paper);
tag('BATTING',77,604,155);tag('BOWLING',248,604,170);tag('FIELDING',434,604,168);
txt('Presented by Vijaya Rupesh N',77,722,830,50,29,C.lime,true);
rect(1030,145,498,609,'264D39');
txt('THE PROBLEM TO VALIDATE',1064,178,425,38,21,C.lime,true);
txt('01  Fragmented progress',1064,255,425,40,30,C.white,true);
txt('Practice records can get lost\nbetween matches and messages.',1064,308,425,85,26,C.paper);
txt('02  Limited visibility',1064,417,425,40,30,C.white,true);
txt('Everyday effort deserves a story\nbeyond match-day statistics.',1064,470,425,80,26,C.paper);
txt('03  Control over sharing',1064,577,425,40,30,C.white,true);
txt('Women athletes should choose\nwhat to share and with whom.',1064,630,425,85,26,C.paper);
end(`PitchUp is a women-first cricket development prototype. Our starting hypothesis is that grassroots women cricketers need a simple way to carry their practice history between sessions, make it useful to a coach, and choose which milestones others see. These are design hypotheses, not findings from completed user interviews. The current scope is batting, bowling and fielding. Presenter: Vijaya Rupesh N. Primary fit: Athlete Health, Performance & Inclusivity, through access and performance records; secondary fit: Sport Visibility & Engagement. We make no injury-prevention or performance-improvement claims. Official challenge: https://challenges.ignyte.ae/competition/1B9DF5DB-F9A0-F011-B3CD-002248CB5C1B`);

start(2,'SOLUTION  /  ATHLETE CONTROL');
txt('Record privately. Make progress visible.',72,132,1460,92,62,C.ink,true);
txt('A cricket-specific journey with separate choices for coach access and milestone sharing.',76,235,1430,50,29,C.muted);
pic('assets/journey.png',72,331,960,446);
txt('CURRENT PROTOTYPE • FICTIONAL RECORDS',78,795,945,25,16,C.muted,true);
const rows=[['01','Record','Session type, duration, effort\nand a private reflection.'],['02','Understand','Weekly history and comparison\nwith the athlete’s own plan.'],['03','Choose the audience','Keep private, share a milestone,\nor allow coach access separately.']];
rows.forEach((r,i)=>{const y=337+i*157;txt(r[0],1070,y,58,42,28,C.muted,true);txt(r[1],1132,y,400,42,30,C.ink,true);txt(r[2],1132,y+49,397,94,26,C.muted);});
end(`Walk through the current prototype: record a batting, bowling or fielding session. Batting and bowling capture deliveries; fielding captures duration and notes. See the history and a factual weekly summary. Session notes stay outside the milestone shown in this demonstration, and coach access and the milestone audience are separate choices. The screenshot uses a fictional athlete and records. Our intended differentiation is the combination of cricket-specific training records and athlete-controlled visibility, not simply adding cricket to a generic tracker. Strava already supports cricket. Women-first means designing and testing around women athletes' control, access and visibility; it does not mean unsupported biological assumptions. The current demo simulates roles and audience behavior; production identity, authorization and storage remain planned. Competitor reference: https://press.strava.com/en-gb/articles/strava-adds-five-new-sports-to-enable-more-comprehensive-activity-tracking`);

start(3,'PROTOTYPE  /  FEASIBILITY & INNOVATION');
txt('A working core. A clear path to scale.',72,132,1460,92,62,C.ink,true);
txt('Simple inputs → transparent summaries → athlete-selected visibility',76,234,1430,48,31,C.muted);
const cols=[72,570,1068];
cols.forEach(x=>rect(x,326,460,423,C.white));
txt('01 / WORKING TODAY',98,351,408,34,22,C.muted,true);
txt('Cricket records',98,413,408,48,37,C.ink,true);
txt('React web prototype\nBatting, bowling, fielding logs\nWeekly history and goals\nRule-based explanations\nSharing and coach demo views',98,486,406,224,27,C.ink);
txt('02 / RESPONSIBLE AI',596,351,408,34,22,C.muted,true);
txt('Grounded guidance',596,413,408,48,37,C.ink,true);
txt('Current insights use rules.\nPlanned AI explains logged data\nand helps draft milestones,\nwith athlete review before posting.\nNo injury-risk prediction.',596,486,406,224,27,C.ink);
txt('03 / PRODUCTION PATH',1094,351,408,34,22,C.muted,true);
txt('Trust before rollout',1094,413,408,48,37,C.ink,true);
txt('Add sign-in and verified roles\nEnforce consent on the server\nMove to a managed database\nTest access and data deletion\nAdapt rules for other sports',1094,486,406,224,27,C.ink);
txt('Demo: local / browser persistence and simulated roles. No ICC data integration or live athlete pilot claimed.',78,781,1450,35,22,C.muted);
end(`The deployed app demonstrates the core journey with browser storage fallback; the local prototype also includes a Node API and domain rules. Today, explanations are deterministic comparisons against self-reported records and the user's own plan. There is no integrated machine-learning model. A future grounded language model could turn validated records into a plain-language summary or draft milestone, but an athlete must review content before sharing. The production gate is secure authentication, verified coach membership, server-enforced access, durable storage and consent testing. Simulated demo role switching is not production security. Data export and deletion are demonstrated locally. We do not claim medical readiness or injury prediction, nor access to proprietary ICC data. Cross-sport scale would reuse the consent and community layer while adapting and validating sport-specific activity rules.`);

start(4,'IMPACT  /  PILOT & SUSTAINABLE GROWTH',true);
txt('Start with women’s cricket.\nEarn the right to scale.',72,126,1470,161,65,C.white,true);
txt('VALIDATE WITH WOMEN ATHLETES',76,329,670,32,22,C.lime,true);
txt('20 athletes  ·  4 weeks',76,380,700,63,45,C.white,true);
txt('Proposed adult-player pilot; recruitment pending.\nStart directly with players; no club deal required.',76,455,700,82,28,C.paper);
txt('Measure logging time, weekly return, sharing\ncomprehension and usefulness of progress records.',76,562,700,94,28,C.paper);
txt('Ask: ICC / Ignyte introductions to women athletes\nfor interviews, usability testing and an opt-in pilot.',76,703,718,84,27,C.lime,true);
rect(832,330,696,328,'264D39');
txt('VALUE & VIABILITY',862,355,630,33,22,C.lime,true);
txt('Players: progress records. Coaches: chosen context.\nCommunities: athlete-approved milestones.',862,407,631,83,27,C.white);
txt('Planned model: free core player access; paid club tools.\nMobile web, no wearable needed; Hindi summary.\nSmall text records limit storage and compute needs.',862,519,635,113,25,C.paper);
txt('EXPLORE THE LIVE PROTOTYPE',860,693,650,32,20,C.lime,true);
txt('ignyte-icc.vercel.app ↗',860,739,650,49,35,C.white,true,'https://ignyte-icc.vercel.app/');
end(`The proposed first validation is four weeks with twenty consenting adult women cricketers, recruited directly where possible. No participants or clubs are currently confirmed, and these numbers are a proposed plan, not traction. Before recruiting, complete the production trust work or use moderated usability sessions with fictional data. Measure time to log, weekly return, comprehension of sharing controls and perceived usefulness; use interviews to decide whether coach access solves a real need. Later, willing coaches can test the review workflow. We propose keeping basic player access free and testing paid tools for clubs and academies; no pricing or revenue has been validated. Mobile web and no required wearable reduce hardware barriers. The current Hindi feature is a short summary, not a fully translated app. Text-first records avoid routine video processing, but no environmental savings have been measured. A future ICC pathway could offer opt-in athlete milestones around community programmes or events, with permission and moderation. Our ask is introductions and feedback, not a claim of an ICC partnership. Live prototype: https://ignyte-icc.vercel.app/ . A separate demo video of at most three minutes is still needed for the prototype submission. Official requirements checked against the public competition data on 4 October 2026. Team eligibility and contribution declarations must reflect actual contributors.`);

await pptx.writeFile({fileName:'PitchUp_Hackathon_Vijaya_Rupesh_N.pptx'});
const html=`<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#ddd}.slide{position:relative;width:1600px;height:900px;overflow:hidden;page-break-after:always}.text{position:absolute;font-family:Arial,sans-serif;line-height:1.08;white-space:normal}@page{size:1600px 900px;margin:0}@media print{body{background:white}}</style></head><body>${pages.map(p=>`<section class="slide">${p.html}</section>`).join('')}</body></html>`;
writeFileSync('PitchUp_Preview.html',html);
writeFileSync('PitchUp_Speaker_Notes.md',pages.map((p,i)=>`## Slide ${i+1}\n\n${p.notes}`).join('\n\n'));
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const p=await b.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});await p.goto('file:///D:/IGNYTE%20ICC/presentation/PitchUp_Preview.html');await p.evaluate(()=>document.fonts.ready);for(let i=0;i<4;i++)await p.locator('.slide').nth(i).screenshot({path:`assets/slide-${i+1}.png`});await p.pdf({path:'PitchUp_Hackathon_Vijaya_Rupesh_N.pdf',width:'1600px',height:'900px',printBackground:true,preferCSSPageSize:true});console.log('Created 4-slide PPTX, matching PDF, previews and speaker notes.');}finally{await b.close();}
