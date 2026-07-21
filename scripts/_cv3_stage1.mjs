import { chromium } from 'playwright';
const b=await chromium.launch({headless:true}); const R={}; const errs=[];
const c=await b.newContext({viewport:{width:1300,height:950}}); const p=await c.newPage();
p.on('pageerror',e=>errs.push('PE '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text().slice(0,90));});
await p.goto('http://127.0.0.1:8093/',{waitUntil:'load'}); await p.waitForTimeout(500);
await p.fill('#loginTz','עמנואל רקובסקי'); await p.fill('#loginPw','0548451402'); await p.click('#loginBtn'); await p.waitForTimeout(500);
R.tiles = await p.evaluate(()=>[...document.querySelectorAll('.tile')].filter(t=>t.style.display!=='none').map(t=>t.dataset.id));
await p.evaluate(()=>showPage('behavior')); await p.waitForTimeout(500);
R.trackForm = await p.evaluate(()=>({stu:!!document.querySelector('.stu-pick[data-pick="q"]'),cat:!!document.getElementById('qCat'),date:!!document.getElementById('qDate'),time:!!document.getElementById('qTime'),note:!!document.getElementById('qNote'),noSeverity:!document.getElementById('qSev'),csv:!!document.getElementById('behCsv')}));
R.h2 = await p.evaluate(()=>document.querySelector('#page-behavior h2')?.textContent);
// add a record
await p.click('.stu-pick[data-pick="q"] .pk-search'); await p.waitForTimeout(150);
await p.click('.stu-pick[data-pick="q"] .pk-results .pk-res-item'); await p.waitForTimeout(100);
await p.selectOption('#qCat', await p.evaluate(()=>document.querySelector('#qCat option[value]:not([value=""])').value));
await p.fill('#qNote','בדיקת מעקב מאוחד'); await p.click('#qSave'); await p.waitForTimeout(300);
R.added = await p.evaluate(()=>document.querySelectorAll('#timeline .tl-item').length);
R.errors=[...new Set(errs)].slice(0,8);
await b.close(); console.log(JSON.stringify(R,null,1));
