import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(3000);
const grids = ['leadershipGrid', 'newspaperGrid', 'tzimerGrid', 'storesGrid', 'housingGrid', 'gemachGrid', 'marketGrid'];
const info = await p.evaluate((ids) => {
  return ids.map(id => {
    const el = document.getElementById(id);
    return el ? {
      id,
      children: el.children.length,
      textContent: (el.textContent || '').trim().slice(0, 60)
    } : { id, missing: true };
  });
}, grids);
console.log(JSON.stringify(info, null, 2));
await b.close();
