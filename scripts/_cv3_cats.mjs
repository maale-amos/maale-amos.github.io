import { chromium } from 'playwright';
const b=await chromium.launch({headless:true}); const R={}; const errs=[];
const ctx=await b.newContext({viewport:{width:1280,height:950}}); const page=await ctx.newPage();
page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
page.on('pageerror',e=>errs.push('PAGEERR '+e.message));
await page.goto('http://127.0.0.1:8090/',{waitUntil:'load'}); await page.waitForTimeout(400);
await page.fill('#loginTz','000000000'); await page.fill('#loginPw','1234'); await page.click('#loginBtn'); await page.waitForTimeout(500);
// (A) self password change button in header
R.pwBtn = await page.evaluate(()=>!!document.getElementById('pwBtn'));
await page.click('#pwBtn'); await page.waitForTimeout(300);
await page.fill('#cp_new','9999'); await page.fill('#cp_conf','9999');
await page.evaluate(()=>{[...document.querySelectorAll('.modal button, .modal-foot button, button')].find(b=>b.textContent.includes('עדכן סיסמה'))?.click();});
await page.waitForTimeout(300);
R.selfpw_changed = await page.evaluate(()=>window.store._mem.users.find(u=>u.id===1).password);
// (B) settings — category management
await page.evaluate(()=>showPage('settings')); await page.waitForTimeout(500);
R.catCard = await page.evaluate(()=>!!document.getElementById('catList')&&!!document.getElementById('addCat'));
const cat0 = await page.evaluate(()=>document.querySelectorAll('#catList .tl-item').length);
await page.fill('#newCat','כבוד הזולת'); await page.click('#addCat'); await page.waitForTimeout(300);
const cat1 = await page.evaluate(()=>document.querySelectorAll('#catList .tl-item').length);
R.catAdd = {before:cat0,after:cat1};
// edit first category
await page.click('#catList .tl-item [data-cedit]'); await page.waitForTimeout(300);
await page.fill('#cat_name','התנהגות מצוינת'); 
await page.evaluate(()=>{[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='שמירה')?.click();});
await page.waitForTimeout(300);
R.catEdit = await page.evaluate(()=>document.querySelector('#catList .tl-item .tl-main')?.textContent);
// (C) admin view/edit another user's password: open teacher (id2) form, check password prefilled
await page.click('#usrBody tr:nth-child(2) [data-uedit]'); await page.waitForTimeout(300);
R.pwPrefilled = await page.evaluate(()=>document.getElementById('u_pw')?.value);
R.pwType = await page.evaluate(()=>document.getElementById('u_pw')?.type);
await page.click('#u_pw_show'); await page.waitForTimeout(150);
R.pwTypeAfterShow = await page.evaluate(()=>document.getElementById('u_pw')?.type);
// change it
await page.fill('#u_pw','5555');
await page.evaluate(()=>{[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='שמירה')?.click();});
await page.waitForTimeout(300);
R.teacherPwChanged = await page.evaluate(()=>window.store._mem.users.find(u=>u.id===2).password);
// (D) inline add-category in behavior
await page.evaluate(()=>showPage('behavior')); await page.waitForTimeout(500);
R.qCatAdd = await page.evaluate(()=>!!document.getElementById('qCatAdd'));
const opt0 = await page.evaluate(()=>document.querySelectorAll('#qCat option').length);
await page.click('#qCatAdd'); await page.waitForTimeout(300);
await page.fill('#nc_name','עזרה בכיתה');
await page.evaluate(()=>{[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='הוסף')?.click();});
await page.waitForTimeout(300);
const opt1 = await page.evaluate(()=>document.querySelectorAll('#qCat option').length);
R.inlineCat = {before:opt0,after:opt1,selected:await page.evaluate(()=>document.getElementById('qCat').value)};
R.errors = errs.slice(0,8);
await b.close();
console.log(JSON.stringify(R,null,1));
