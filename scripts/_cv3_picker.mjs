import { chromium } from 'playwright';
const b=await chromium.launch({headless:true}); const R={}; const errs=[];
const ctx=await b.newContext({viewport:{width:1280,height:900}}); const page=await ctx.newPage();
page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
page.on('pageerror',e=>errs.push('PAGEERR '+e.message));
await page.goto('http://127.0.0.1:8090/',{waitUntil:'load'}); await page.waitForTimeout(400);
await page.fill('#loginTz','000000000'); await page.fill('#loginPw','1234'); await page.click('#loginBtn'); await page.waitForTimeout(500);
// ----- behavior -----
await page.evaluate(()=>showPage('behavior')); await page.waitForTimeout(600);
R.beh_addPicker = await page.evaluate(()=>!!document.querySelector('.stu-pick[data-pick="q"] .pk-class')&&!!document.querySelector('.stu-pick[data-pick="q"] .pk-search')&&!!document.querySelector('.stu-pick[data-pick="q"] .pk-stu'));
R.beh_filterPicker = await page.evaluate(()=>!!document.querySelector('.stu-pick[data-pick="f"] .pk-search'));
// options count in add student select (all accessible)
R.beh_stuCount_all = await page.evaluate(()=>document.querySelectorAll('.stu-pick[data-pick="q"] .pk-stu option').length-1);
// type search "ד" -> filter
await page.fill('.stu-pick[data-pick="q"] .pk-search','לדוגמה ד'); await page.waitForTimeout(200);
R.beh_search_result = await page.evaluate(()=>{const o=[...document.querySelectorAll('.stu-pick[data-pick="q"] .pk-stu option')].filter(x=>x.value);return {n:o.length,sel:document.querySelector('.stu-pick[data-pick="q"] .pk-stu').value};});
// clear search, pick class 1 -> only class1 students
await page.fill('.stu-pick[data-pick="q"] .pk-search',''); await page.selectOption('.stu-pick[data-pick="q"] .pk-class','1'); await page.waitForTimeout(200);
R.beh_class1_count = await page.evaluate(()=>[...document.querySelectorAll('.stu-pick[data-pick="q"] .pk-stu option')].filter(x=>x.value).length);
// add a report for selected (choose first student of class1)
await page.selectOption('.stu-pick[data-pick="q"] .pk-stu', await page.evaluate(()=>[...document.querySelectorAll('.stu-pick[data-pick="q"] .pk-stu option')].filter(x=>x.value)[0].value));
await page.click('#qSave'); await page.waitForTimeout(400);
R.beh_added = await page.evaluate(()=>document.querySelectorAll('#timeline .tl-item').length);
// ----- tests -----
await page.evaluate(()=>showPage('tests')); await page.waitForTimeout(500);
R.tests_picker = await page.evaluate(()=>!!document.querySelector('.stu-pick[data-pick="tests"] .pk-stu'));
await page.fill('.stu-pick[data-pick="tests"] .pk-search','לדוגמה א'); await page.waitForTimeout(200);
R.tests_search_sel = await page.evaluate(()=>document.querySelector('.stu-pick[data-pick="tests"] .pk-stu').value);
await page.fill('[data-f="subject"]','פרשת וירא'); await page.fill('[data-f="grade"]','90');
await page.click('#recSave'); await page.waitForTimeout(300);
R.tests_added = await page.evaluate(()=>document.querySelectorAll('#recList .tl-item').length);
// ----- attendance filter -----
await page.evaluate(()=>showPage('attendance')); await page.waitForTimeout(500);
R.att_hasClass = await page.evaluate(()=>!!document.getElementById('attClass')&&!!document.getElementById('attSearch'));
const attAll = await page.evaluate(()=>document.querySelectorAll('#attBody tr').length);
await page.selectOption('#attClass','1'); await page.waitForTimeout(200);
const attC1 = await page.evaluate(()=>document.querySelectorAll('#attBody tr').length);
R.att_filter = {all:attAll,c1:attC1};
// ----- reading (makeLog) -----
await page.evaluate(()=>showPage('reading')); await page.waitForTimeout(500);
R.reading_picker = await page.evaluate(()=>!!document.querySelector('.stu-pick[data-pick="l"] .pk-stu'));
await page.screenshot({path:'C:/Users/יוסף שניידר/maale-amos-site/scripts/_cv3_beh.png'});
await page.evaluate(()=>showPage('behavior')); await page.waitForTimeout(400);
await page.screenshot({path:'C:/Users/יוסף שניידר/maale-amos-site/scripts/_cv3_pick.png'});
R.errors = errs.slice(0,8);
await b.close();
console.log(JSON.stringify(R,null,1));
