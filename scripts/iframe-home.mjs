import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
await p.evaluate(() => document.getElementById('about').scrollIntoView({ block: 'center' }));
await p.waitForTimeout(3000);
const info = await p.evaluate(() => {
  const iframes = [...document.querySelectorAll('iframe')];
  return iframes.map(f => ({ src: f.src.slice(0,80), title: f.title, w: f.clientWidth, h: f.clientHeight, ready: f.readyState || 'unknown' }));
});
console.log(JSON.stringify(info, null, 2));
await b.close();
