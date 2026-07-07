import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?cb='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(1500);
// Test keyboard nav — Tab should focus interactive elements
const skipLink = await p.evaluate(() => {
  const s = document.querySelector('.skip-link');
  return { exists: !!s, href: s?.getAttribute('href') };
});
console.log('skip-link:', JSON.stringify(skipLink));
// Try focusing skip-link
await p.keyboard.press('Tab');
const focused = await p.evaluate(() => ({ tag: document.activeElement.tagName, cls: document.activeElement.className, text: (document.activeElement.textContent || '').trim().slice(0,30) }));
console.log('first Tab focus:', JSON.stringify(focused));
await b.close();
