import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2500);

// Get all section geometries
const info = await p.evaluate(() => {
  return [...document.querySelectorAll('main section[id]')].map(s => {
    const r = s.getBoundingClientRect();
    return {
      id: s.id,
      height: Math.round(r.height),
      empty: s.classList.contains('is-empty'),
      hasContent: !!s.querySelector('article, .event-item, .simcha-item, .card, .shul-card, li, td, form, iframe')
    };
  });
});
console.log(info.map(x => `${x.id.padEnd(15)} h=${String(x.height).padStart(4)}px ${x.empty?'[empty]':''} ${x.hasContent?'[content]':''}`).join('\n'));
await b.close();
