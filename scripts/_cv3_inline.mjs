import { chromium } from 'playwright';
const b=await chromium.launch({headless:true}); const R={}; const errs=[];
const ctx=await b.newContext({viewport:{width:1280,height:950}}); const page=await ctx.newPage();
page.on('pageerror',e=>errs.push('PAGEERR '+e.message));
await page.goto('http://127.0.0.1:8090/',{waitUntil:'load'}); await page.waitForTimeout(400);
await page.fill('#loginTz','000000000'); await page.fill('#loginPw','1234'); await page.click('#loginBtn'); await page.waitForTimeout(500);
await page.evaluate(()=>showPage('behavior')); await page.waitForTimeout(500);
const opt0 = await page.evaluate(()=>document.querySelectorAll('#qCat option').length);
await page.click('#qCatAdd'); await page.waitForTimeout(300);
await page.fill('.modal-card #nc_name','עזרה בכיתה');
await page.click('.modal-card [data-act="save"]'); await page.waitForTimeout(300);
const opt1 = await page.evaluate(()=>document.querySelectorAll('#qCat option').length);
R.inlineCat = {before:opt0,after:opt1,selected:await page.evaluate(()=>document.getElementById('qCat').value),label:await page.evaluate(()=>[...document.querySelectorAll('#qCat option')].pop().textContent)};
// verify it persisted to store categories
R.inStore = await page.evaluate(()=>window.store._mem.categories.some(c=>c.name==='עזרה בכיתה'));
// and now report using it
await page.selectOption('.stu-pick[data-pick="q"] .pk-stu', await page.evaluate(()=>[...document.querySelectorAll('.stu-pick[data-pick="q"] .pk-stu option')].filter(x=>x.value)[0].value));
await page.click('#qSave'); await page.waitForTimeout(300);
R.reported = await page.evaluate(()=>document.querySelectorAll('#timeline .tl-item').length);
R.errors=errs;
await b.close();
console.log(JSON.stringify(R,null,1));
