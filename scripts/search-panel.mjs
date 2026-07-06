import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
// Trigger search
await p.evaluate(() => window.searchSite('בית'));
await p.waitForTimeout(500);
const info = await p.evaluate(() => {
  const sr = document.getElementById('searchResults');
  const r = sr.getBoundingClientRect();
  return {
    display: getComputedStyle(sr).display,
    position: getComputedStyle(sr).position,
    rect: { top: r.top, left: r.left, width: r.width, height: r.height, right: r.right },
    winW: innerWidth,
    hits: sr.querySelectorAll('a').length
  };
});
console.log(JSON.stringify(info, null, 2));
// Try click close button
await p.click('.search-close-btn');
await p.waitForTimeout(300);
const closed = await p.evaluate(() => document.getElementById('searchResults').style.display);
console.log('after close:', closed);
await b.close();
