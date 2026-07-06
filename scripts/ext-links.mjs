import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
const externals = await p.evaluate(() => {
  return [...document.querySelectorAll('a[href^="http"]')].map(a => ({
    href: a.href,
    label: a.textContent.trim().slice(0,20),
    target: a.getAttribute('target'),
    rel: a.getAttribute('rel')
  })).filter(l => !l.href.includes('maale-amos.github.io'));
});
console.log('external count:', externals.length);
externals.forEach(l => console.log(' ', l.href.slice(0,60), '→', l.label, '· target=', l.target, '· rel=', l.rel));
await b.close();
