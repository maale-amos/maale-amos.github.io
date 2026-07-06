import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/about/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(5000);
const info = await p.evaluate(() => {
  const iframes = [...document.querySelectorAll('iframe')];
  return iframes.map(f => ({ src: f.src.slice(0,60), title: f.title, w: f.clientWidth, h: f.clientHeight }));
});
console.log('iframes:', JSON.stringify(info, null, 2));
await b.close();
