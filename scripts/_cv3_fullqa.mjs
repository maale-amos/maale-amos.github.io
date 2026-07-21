import { chromium } from 'playwright';
const b=await chromium.launch({headless:true});
const ctx=await b.newContext({viewport:{width:1280,height:900}}); const page=await ctx.newPage();
const errs=[]; page.on('pageerror',e=>errs.push('PAGEERR '+e.message));
page.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text().slice(0,120));});
const R={screens:{},features:{},errors:[]};
await page.goto('http://127.0.0.1:8091/',{waitUntil:'load'}); await page.waitForTimeout(500);
await page.fill('#loginTz','000000000'); await page.fill('#loginPw','1234'); await page.click('#loginBtn'); await page.waitForTimeout(500);
R.loggedIn = await page.evaluate(()=>!!window.currentUser);
const mods=['behavior','reading','writing','attendance','tests','functioning','students','medical','conversations','meetings','forms','calendar','reports','tuition','settings'];
for(const m of mods){
  const before=errs.length;
  await page.evaluate(id=>showPage(id), m); await page.waitForTimeout(450);
  const rendered = await page.evaluate(id=>{const p=document.getElementById('page-'+id);return p&&p.classList.contains('active')&&p.querySelector('.page-head, .qr-card, .stat-row, table, .soon-card')?true:false;}, m);
  R.screens[m] = (rendered?'OK':'EMPTY') + (errs.length>before?' +'+(errs.length-before)+'err':'');
}
// feature spot-checks
await page.evaluate(()=>showPage('behavior')); await page.waitForTimeout(400);
await page.click('.stu-pick[data-pick="q"] .pk-search'); await page.waitForTimeout(150);
R.features.pickerResults = await page.evaluate(()=>document.querySelectorAll('.pk-results .pk-res-item').length);
R.features.catAddBtn = await page.evaluate(()=>!!document.getElementById('qCatAdd'));
R.features.pwBtn = await page.evaluate(()=>!!document.getElementById('pwBtn'));
await page.evaluate(()=>showPage('forms')); await page.waitForTimeout(400);
R.features.formsSeed = await page.evaluate(()=>document.querySelectorAll('.form-card').length);
await page.evaluate(()=>showPage('settings')); await page.waitForTimeout(400);
R.features.catMgmt = await page.evaluate(()=>!!document.getElementById('addCat'));
R.features.usrMgmt = await page.evaluate(()=>!!document.getElementById('usrAdd'));
R.errors = [...new Set(errs)].slice(0,12);
await b.close();
console.log(JSON.stringify(R,null,1));
