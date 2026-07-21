import { chromium } from 'playwright';
const b=await chromium.launch({headless:true}); const errs=[]; const R={};
const c=await b.newContext({viewport:{width:1300,height:950}}); const p=await c.newPage();
p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8095/',{waitUntil:'load'});await p.waitForTimeout(500);
await p.fill('#loginTz','גדליה גורפלד');await p.fill('#loginPw','0533199345');await p.click('#loginBtn');await p.waitForTimeout(600);
await p.click('.teacher-card .stu-pick[data-pick="th"] .pk-search');await p.waitForTimeout(200);
R.studentsVisible=await p.evaluate(()=>document.querySelectorAll('.teacher-card .pk-results .pk-res-item').length);
if(R.studentsVisible){await p.click('.teacher-card .pk-results .pk-res-item');await p.waitForTimeout(100);
  await p.selectOption('#thCat',await p.evaluate(()=>document.querySelector('#thCat option[value]:not([value=""])').value));
  await p.fill('#thNote','רישום מלמד');await p.click('#thSave');await p.waitForTimeout(300);
  R.saved=await p.evaluate(()=>document.getElementById('thMsg').textContent.includes('נשמר'));
  R.inStore=await p.evaluate(()=>window.store._mem.behavior_events.some(e=>e.note==='רישום מלמד'));}
R.errors=errs.slice(0,5);
await b.close();console.log(JSON.stringify(R));
