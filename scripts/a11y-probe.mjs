import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
const audit = await p.evaluate(() => {
  const imgsNoAlt = [...document.querySelectorAll('img:not([alt])')].map(i => i.src.split('/').pop());
  const btnsNoLabel = [...document.querySelectorAll('button:not([aria-label])')].filter(b => !b.textContent.trim()).length;
  const linksNoText = [...document.querySelectorAll('a')].filter(a => !a.textContent.trim() && !a.querySelector('img[alt]') && !a.getAttribute('aria-label')).length;
  const headings = [...document.querySelectorAll('h1,h2,h3')].map(h => ({ tag: h.tagName, text: h.textContent.trim().slice(0, 40) }));
  const h1Count = headings.filter(h => h.tag === 'H1').length;
  return { imgsNoAlt: imgsNoAlt.length, imgsNoAltSample: imgsNoAlt.slice(0,3), btnsNoLabel, linksNoText, h1Count, headingsCount: headings.length };
});
console.log(JSON.stringify(audit, null, 2));
await b.close();
