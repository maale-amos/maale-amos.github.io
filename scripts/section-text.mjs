import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
const texts = await p.evaluate(() => {
  return [...document.querySelectorAll('main section[id]')].map(s => {
    const h = s.querySelector('h2, h3');
    const txt = (s.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100);
    return { id: s.id, h: h ? h.textContent.trim().slice(0, 40) : '(no header)', preview: txt };
  });
});
texts.forEach(t => console.log(t.id.padEnd(15), '→', t.h.padEnd(35), '···', t.preview.slice(0, 80)));
await b.close();
