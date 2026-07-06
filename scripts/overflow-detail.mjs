import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:390,height:844} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
// Elements with left+width > 390 that are not position:fixed/absolute
const wide = await p.evaluate(() => {
  const results = [];
  document.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' || cs.position === 'absolute') return;
    if (r.right > 400 && r.width > 200) {
      results.push({ tag: el.tagName, cls: (el.className||'').toString().slice(0,40), right: Math.round(r.right), w: Math.round(r.width), left: Math.round(r.left) });
    }
  });
  return results.slice(0, 6);
});
console.log(JSON.stringify(wide, null, 2));
await b.close();
