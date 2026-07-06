import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
// Get all hash links that reference internal sections
const links = await p.evaluate(() => {
  const anchors = [...document.querySelectorAll('a[href^="#"]')];
  return anchors.map(a => {
    const href = a.getAttribute('href');
    const targetId = href.slice(1);
    const target = targetId ? document.getElementById(targetId) : null;
    return { href, exists: !!target, label: a.textContent.trim().slice(0,20) };
  }).filter(l => l.href !== '#');
});
const bad = links.filter(l => !l.exists);
console.log('total hash links:', links.length);
console.log('broken:', bad.length);
bad.slice(0,10).forEach(l => console.log(' ', l.href, '→', l.label));
await b.close();
