import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/', { waitUntil: 'networkidle' });
await p.waitForTimeout(3000);
const info = await p.evaluate(() => {
  const s = document.querySelector('#news');
  const rect = s.getBoundingClientRect();
  const cs = getComputedStyle(s);
  // enumerate all CSS rules that match
  const matches = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const r of sheet.cssRules || []) {
        if (r.selectorText && (r.selectorText.includes('.section') || r.selectorText.includes('is-empty'))) {
          if (s.matches(r.selectorText)) matches.push({ sel: r.selectorText, style: r.style.cssText });
        }
      }
    } catch {}
  }
  return { classes: s.className, computedPad: cs.paddingTop+' / '+cs.paddingBottom, height: rect.height, matches };
});
console.log(JSON.stringify(info, null, 2));
await b.close();
