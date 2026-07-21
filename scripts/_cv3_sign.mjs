import { chromium } from 'playwright';
const b=await chromium.launch({headless:true}); const errs=[];
const page=await (await b.newContext()).newPage();
page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
page.on('pageerror',e=>errs.push('PAGEERR '+e.message));
await page.goto('http://127.0.0.1:8090/sign.html?f=2&t=hl902vs1',{waitUntil:'load'}); await page.waitForTimeout(600);
const txt = await page.evaluate(()=>document.getElementById('content')?.textContent.trim().slice(0,50));
console.log(JSON.stringify({txt, errors:errs},null,1));
await b.close();
