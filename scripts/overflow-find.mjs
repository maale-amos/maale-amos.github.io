import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:390,height:844} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
const wide = await p.evaluate(() => {
  const results = [];
  document.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.right > 400 || r.width > 400) {
      results.push({
        tag: el.tagName,
        id: el.id,
        cls: (el.className || '').toString().slice(0,40),
        right: Math.round(r.right),
        w: Math.round(r.width),
        text: (el.textContent || '').trim().slice(0,20)
      });
    }
  });
  return results.slice(0, 8);
});
console.log(JSON.stringify(wide, null, 2));
await b.close();
