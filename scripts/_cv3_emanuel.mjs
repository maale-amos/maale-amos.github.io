import { chromium } from 'playwright';
const b=await chromium.launch({headless:true}); const R={}; const errs=[];
const base='http://127.0.0.1:8092/';
async function fresh(){const c=await b.newContext({viewport:{width:1300,height:950}});const p=await c.newPage();
  p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CON '+m.text().slice(0,100));});
  await p.goto(base,{waitUntil:'load'});await p.waitForTimeout(500);return {c,p};}
async function login(p,name,pw){await p.fill('#loginTz',name);await p.fill('#loginPw',pw);await p.click('#loginBtn');await p.waitForTimeout(500);}
async function tiles(p){return p.evaluate(()=>[...document.querySelectorAll('.tile')].filter(t=>t.style.display!=='none').map(t=>t.dataset.id));}

// (1) מנהל — כניסה בשם
{const {c,p}=await fresh(); await login(p,'עמנואל רקובסקי','0548451402');
 R.admin_login = await p.evaluate(()=>window.currentUser&&window.currentUser.role);
 R.admin_tiles = (await tiles(p)).length;
 // קטגוריות
 await p.evaluate(()=>showPage('behavior'));await p.waitForTimeout(400);
 R.categories = await p.evaluate(()=>[...document.querySelectorAll('#qCat option')].map(o=>o.textContent).filter(t=>t!=='קטגוריה…'));
 R.behTime = await p.evaluate(()=>!!document.getElementById('qTime'));
 R.behCsv = await p.evaluate(()=>!!document.getElementById('behCsv'));
 R.behCatFilter = await p.evaluate(()=>!!document.getElementById('fCat'));
 // tuition
 await p.evaluate(()=>showPage('tuition'));await p.waitForTimeout(400);
 R.tuition = await p.evaluate(()=>({method:!!document.getElementById('tMethod'),date:!!document.getElementById('tDate'),note:!!document.getElementById('tNote'),csv:!!document.getElementById('tCsv'),clsF:!!document.getElementById('tClsF')}));
 // cashbox
 await p.evaluate(()=>showPage('cashbox'));await p.waitForTimeout(400);
 R.cashbox = await p.evaluate(()=>({income:!!document.getElementById('inSave'),expense:!!document.getElementById('exSave'),balance:[...document.querySelectorAll('.stat-lbl')].some(e=>e.textContent.includes('יתרת')),csv:!!document.getElementById('cbCsv')}));
 // tests examiner
 await p.evaluate(()=>showPage('tests'));await p.waitForTimeout(400);
 R.testsExaminer = await p.evaluate(()=>!!document.querySelector('[data-f="examiner"]'));
 R.testsCsv = await p.evaluate(()=>!!document.getElementById('recCsv'));
 await c.close();}

// (2) מזכירה — כספים בלבד
{const {c,p}=await fresh(); await login(p,'מירי הולצמן','02-9931101');
 R.secretary_tiles = await tiles(p); await c.close();}
// (3) מפקח — צפייה בלבד
{const {c,p}=await fresh(); await login(p,'רמי אברמוביץ','0556700049');
 await p.evaluate(()=>showPage('behavior'));await p.waitForTimeout(400);
 R.supervisor_readonly = await p.evaluate(()=>getComputedStyle(document.getElementById('qSave')).display==='none');
 R.supervisor_seesTiles = (await tiles(p)).length; await c.close();}
// (4) מלמד — הזנה בלבד
{const {c,p}=await fresh(); await login(p,'גדליה גורפלד','0533199345');
 R.melamed_tiles = await tiles(p);
 await p.evaluate(()=>showPage('behavior'));await p.waitForTimeout(400);
 R.melamed_writeonly_listHidden = await p.evaluate(()=>{const t=document.getElementById('timeline');return t?getComputedStyle(t).display==='none':true;});
 R.melamed_canEnter = await p.evaluate(()=>!!document.getElementById('qSave')&&getComputedStyle(document.getElementById('qSave')).display!=='none'); await c.close();}
// (5) מחנך — כיתתו בלבד
{const {c,p}=await fresh(); await login(p,'משה רביבו','0583256040');
 await p.evaluate(()=>showPage('students'));await p.waitForTimeout(500);
 R.mechanech_studentCount = await p.evaluate(()=>document.querySelectorAll('#stuBody tr').length); await c.close();}

R.errors=[...new Set(errs)].slice(0,10);
await b.close();
console.log(JSON.stringify(R,null,1));
