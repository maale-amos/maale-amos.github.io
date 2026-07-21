import { chromium } from 'playwright';
const b=await chromium.launch({headless:true}); const R={}; const errs=[];
const ctx=await b.newContext({viewport:{width:1280,height:950}}); const page=await ctx.newPage();
page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
page.on('pageerror',e=>errs.push('PAGEERR '+e.message));
await page.goto('http://127.0.0.1:8090/',{waitUntil:'load'}); await page.waitForTimeout(400);
await page.fill('#loginTz','000000000'); await page.fill('#loginPw','1234'); await page.click('#loginBtn'); await page.waitForTimeout(500);
// ===== (1) SEARCH COMBOBOX FIX — behavior =====
await page.evaluate(()=>showPage('behavior')); await page.waitForTimeout(500);
await page.click('.stu-pick[data-pick="q"] .pk-search'); await page.waitForTimeout(150);
R.results_on_focus = await page.evaluate(()=>[...document.querySelectorAll('.stu-pick[data-pick="q"] .pk-results .pk-res-item')].length);
await page.fill('.stu-pick[data-pick="q"] .pk-search','לדוגמה ג'); await page.waitForTimeout(200);
R.results_on_type = await page.evaluate(()=>[...document.querySelectorAll('.stu-pick[data-pick="q"] .pk-results .pk-res-item')].map(e=>e.querySelector('span').textContent));
// click first result -> selects
await page.click('.stu-pick[data-pick="q"] .pk-results .pk-res-item'); await page.waitForTimeout(150);
R.value_after_click = await page.evaluate(()=>document.querySelector('.stu-pick[data-pick="q"]').dataset.value);
R.search_shows_name = await page.evaluate(()=>document.querySelector('.stu-pick[data-pick="q"] .pk-search').value);
// ===== (2) FORMS MODULE =====
await page.evaluate(()=>showPage('forms')); await page.waitForTimeout(500);
R.forms_seed = await page.evaluate(()=>document.querySelectorAll('#formsList .form-card').length);
R.forms_progress = await page.evaluate(()=>document.querySelector('.form-card .det-badge')?.textContent);
// create new form
await page.click('#fNew'); await page.waitForTimeout(300);
await page.fill('.modal-card #nf_title','אישור יציאה לשבתון');
await page.fill('.modal-card #nf_body','נא לאשר יציאת בנכם לשבתון');
await page.selectOption('.modal-card #nf_scope','1'); // class 1 only
await page.click('.modal-card [data-act="save"]'); await page.waitForTimeout(400);
R.forms_after_create = await page.evaluate(()=>document.querySelectorAll('#formsList .form-card').length);
// open detail of the new form (first card = newest, reversed)
await page.click('#formsList .form-card [data-open]'); await page.waitForTimeout(400);
R.detail_rows = await page.evaluate(()=>document.querySelectorAll('#fBody tr').length);
R.detail_stats = await page.evaluate(()=>[...document.querySelectorAll('.stat-num')].map(e=>e.textContent));
// toggle first response to signed
await page.click('#fBody tr:first-child [data-tog]'); await page.waitForTimeout(300);
R.after_sign_stats = await page.evaluate(()=>[...document.querySelectorAll('.stat-num')].map(e=>e.textContent));
R.signed_in_store = await page.evaluate(()=>window.store._mem.form_responses.filter(r=>r.status==='signed').length);
// back to list
await page.click('#fBack'); await page.waitForTimeout(300);
R.back_ok = await page.evaluate(()=>!!document.getElementById('fNew'));
// forms tile visible on home
await page.evaluate(()=>showPage('home')); await page.waitForTimeout(300);
R.forms_tile = await page.evaluate(()=>!!document.querySelector('.tile[data-id="forms"]'));
await page.screenshot({path:'C:/Users/יוסף שניידר/maale-amos-site/scripts/_cv3_forms.png',fullPage:true});
// ===== (3) sign.html DEMO =====
await page.goto("http://127.0.0.1:8090/sign.html?f=1&t=demo2b",{waitUntil:"load"});
await page.waitForTimeout(500);
R.sign_text = await page.evaluate(()=>document.getElementById('content')?.textContent.trim().slice(0,40));
R.errors = errs.slice(0,8);
await b.close();
console.log(JSON.stringify(R,null,1));
