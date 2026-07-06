import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
// Scroll to gallery to trigger lazy loading
await p.evaluate(() => document.getElementById('gallery').scrollIntoView({ behavior: 'auto', block: 'center' }));
await p.waitForTimeout(4000);
const info = await p.evaluate(() => {
  return [...document.querySelectorAll('#gallery img')].map(i => ({
    src: i.src.split('/').slice(-1)[0],
    loaded: i.complete && i.naturalWidth > 0,
    natW: i.naturalWidth
  }));
});
info.forEach(i => console.log(i.loaded ? '✓' : '✗', i.src, i.natW));
await b.close();
