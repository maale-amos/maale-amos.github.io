import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(3000);
const info = await p.evaluate(() => {
  return [...document.querySelectorAll('#gallery img')].map(i => ({
    src: i.src.split('/').slice(-2).join('/'),
    loaded: i.complete && i.naturalWidth > 0
  }));
});
info.forEach(i => console.log(i.loaded ? '✓' : '✗', i.src));
await b.close();
