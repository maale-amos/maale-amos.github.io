import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2500);

// Check for horizontal scroll
const overflow = await p.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  bodyScrollWidth: document.body.scrollWidth,
  hasHorizScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
}));
console.log('overflow:', JSON.stringify(overflow));

// Check meta viewport
const viewport = await p.evaluate(() => document.querySelector('meta[name="viewport"]')?.content);
console.log('viewport:', viewport);

// Check any hidden text (color same as background)
const contrast = await p.evaluate(() => {
  const problems = [];
  document.querySelectorAll('main *').forEach(el => {
    if (!el.textContent.trim()) return;
    const cs = getComputedStyle(el);
    if (cs.color === 'rgba(0, 0, 0, 0)') problems.push({ tag: el.tagName, text: el.textContent.trim().slice(0,30) });
  });
  return problems.slice(0,5);
});
console.log('transparent text:', contrast.length);
await b.close();
