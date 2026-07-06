import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
// Compare content of #about on home vs /about/ page
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
const home = await p.evaluate(() => {
  const s = document.getElementById('about');
  return s ? s.textContent.replace(/\s+/g,' ').trim().length : 0;
});
await p.goto('https://maale-amos.github.io/about/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
const page = await p.evaluate(() => {
  const m = document.getElementById('mainContent');
  return m ? m.textContent.replace(/\s+/g,' ').trim().length : 0;
});
console.log('#about section (home):', home, 'chars');
console.log('/about/ page:', page, 'chars');
await b.close();
