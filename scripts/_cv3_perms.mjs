import { chromium } from 'playwright';
const b=await chromium.launch({headless:true}); const R={};
async function login(page,tz,pw){await page.fill('#loginTz',tz);await page.fill('#loginPw',pw);await page.click('#loginBtn');await page.waitForTimeout(500);}
async function tiles(page){return page.evaluate(()=>[...document.querySelectorAll('.tile')].filter(t=>t.style.display!=='none').map(t=>t.dataset.id));}
// restricted teacher (222) — perms students/behavior/attendance
{ const ctx=await b.newContext({viewport:{width:1280,height:900}}); const page=await ctx.newPage();
  await page.goto('http://127.0.0.1:8090/',{waitUntil:'load'}); await page.waitForTimeout(500);
  await login(page,'222222222','1234');
  R.restrictedTiles=await tiles(page);
  // try navigate to disallowed 'tests' → should be blocked (stay/redirect home)
  await page.evaluate(()=>showPage('tests')); await page.waitForTimeout(300);
  R.testsBlocked=await page.evaluate(()=>{const el=document.getElementById('page-tests');return !(el&&el.classList.contains('active'));});
  await ctx.close(); }
// full teacher (111) — no perms restriction
{ const ctx=await b.newContext({viewport:{width:1280,height:900}}); const page=await ctx.newPage();
  await page.goto('http://127.0.0.1:8090/',{waitUntil:'load'}); await page.waitForTimeout(500);
  await login(page,'111111111','1234'); R.fullTeacherTiles=(await tiles(page)).length;
  await ctx.close(); }
// admin — can open user form with permGrid
{ const ctx=await b.newContext({viewport:{width:1280,height:900}}); const page=await ctx.newPage();
  await page.goto('http://127.0.0.1:8090/',{waitUntil:'load'}); await page.waitForTimeout(500);
  await login(page,'000000000','1234'); await page.evaluate(()=>showPage('settings')); await page.waitForTimeout(400);
  await page.click('#usrAdd'); await page.waitForTimeout(400);
  R.permGrid=await page.evaluate(()=>document.querySelectorAll('#permGrid input').length);
  R.permButtons=await page.evaluate(()=>!!document.querySelector('#permAll')&&!!document.querySelector('#permNone'));
  await ctx.close(); }
await b.close();
console.log(JSON.stringify(R,null,1));
