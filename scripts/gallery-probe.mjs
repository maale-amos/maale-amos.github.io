import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
const gallery = await p.evaluate(() => {
  const imgs = [...document.querySelectorAll('#gallery img')];
  return {
    count: imgs.length,
    loadedCount: imgs.filter(i => i.complete && i.naturalWidth > 0).length,
    firstSrc: imgs[0]?.src,
    hasClickHandler: imgs[0]?.onclick !== null || imgs[0]?.parentElement?.onclick !== null
  };
});
console.log('gallery:', JSON.stringify(gallery));
// About counter check
const stats = await p.evaluate(() => {
  const nums = [...document.querySelectorAll('.about-stats .num')];
  return nums.map(n => n.textContent.trim());
});
console.log('stats:', JSON.stringify(stats));
await b.close();
