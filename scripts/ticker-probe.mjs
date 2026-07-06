import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(3000);
const t = await p.evaluate(() => {
  const wrap = document.getElementById('tickerWrap');
  const inner = document.getElementById('tickerInner');
  const dateEl = document.getElementById('hebrewDateDisplay');
  return {
    wrapVisible: wrap && getComputedStyle(wrap).display !== 'none',
    innerHtml: inner ? inner.textContent.trim() : null,
    dateContent: dateEl ? dateEl.textContent.trim() : null
  };
});
console.log(JSON.stringify(t, null, 2));
await b.close();
