import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:390,height:844} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
// Find elements at right ~ 421 (the actual overflow edge)
const wide = await p.evaluate(() => {
  const results = [];
  document.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.right >= 400 && r.right <= 425 && r.width > 100) {
      results.push({ tag: el.tagName, cls: (el.className||'').toString().slice(0,40), id: el.id, right: Math.round(r.right), w: Math.round(r.width), left: Math.round(r.left), text: (el.textContent||'').trim().slice(0,30) });
    }
  });
  return results.slice(0, 10);
});
console.log(JSON.stringify(wide, null, 2));
await b.close();
