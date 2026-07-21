import { chromium } from 'playwright';
const b=await chromium.launch({headless:true}); const R={}; const errs=[];
async function fresh(){const c=await b.newContext({viewport:{width:1300,height:950}});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text().slice(0,90));});
  await p.goto('http://127.0.0.1:8094/',{waitUntil:'load'});await p.waitForTimeout(500);return {c,p};}
async function login(p,n,pw){await p.fill('#loginTz',n);await p.fill('#loginPw',pw);await p.click('#loginBtn');await p.waitForTimeout(600);}
// מלמד
{const {c,p}=await fresh(); await login(p,'גדליה גורפלד','0533199345');
 R.melamed = await p.evaluate(()=>({teacherHomeShown:document.getElementById('teacherHome').style.display!=='none',tilesHidden:document.getElementById('tileGrid').style.display==='none',card:!!document.querySelector('.teacher-card'),btns:[...document.querySelectorAll('.teacher-btn span')].map(s=>s.textContent),hero:document.querySelector('.home-hero h1').textContent}));
 // quick save
 await p.click('.teacher-card .stu-pick[data-pick="th"] .pk-search');await p.waitForTimeout(150);
 const has=await p.evaluate(()=>document.querySelectorAll('.teacher-card .pk-results .pk-res-item').length);
 if(has){await p.click('.teacher-card .pk-results .pk-res-item');await p.waitForTimeout(100);
   await p.selectOption('#thCat',await p.evaluate(()=>document.querySelector('#thCat option[value]:not([value=""])').value));
   await p.fill('#thNote','רישום מורה');await p.click('#thSave');await p.waitForTimeout(300);
   R.melamed_saved=await p.evaluate(()=>document.getElementById('thMsg').textContent.includes('נשמר'));}
 await p.screenshot({path:'C:/Users/יוסף שניידר/maale-amos-site/scripts/_cv3_teacher.png'});
 await c.close();}
// מחנך
{const {c,p}=await fresh(); await login(p,'משה רביבו','0583256040');
 R.mechanech_btns = await p.evaluate(()=>[...document.querySelectorAll('.teacher-btn span')].map(s=>s.textContent));
 R.mechanech_teacherHome = await p.evaluate(()=>document.getElementById('teacherHome').style.display!=='none'); await c.close();}
// מנהל — רשת רגילה
{const {c,p}=await fresh(); await login(p,'עמנואל רקובסקי','0548451402');
 R.admin_tiles = await p.evaluate(()=>({tilesShown:document.getElementById('tileGrid').style.display!=='none',teacherHidden:document.getElementById('teacherHome').style.display==='none'})); await c.close();}
R.errors=[...new Set(errs)].slice(0,8);
await b.close();console.log(JSON.stringify(R,null,1));
