import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:390,height:844} })).newPage();
await p.goto('http://localhost:8080/', { waitUntil: 'load' });
await p.waitForTimeout(1500);
// Invoke toggleMenu() directly
const result = await p.evaluate(() => {
  window.toggleMenu();
  const menu = document.getElementById('navMenu');
  return { menuDisplay: getComputedStyle(menu).display, menuHasOpen: menu.classList.contains('open') };
});
console.log('after JS call:', JSON.stringify(result));

// Check overlap issue
const rects = await p.evaluate(() => {
  const btn = document.querySelector('.mobile-toggle');
  const dark = document.querySelector('.dark-toggle');
  const a11y = document.querySelector('.a11y-widget');
  return {
    btn: btn && btn.getBoundingClientRect(),
    dark: dark && dark.getBoundingClientRect(),
    a11y: a11y && a11y.getBoundingClientRect()
  };
});
console.log('rects:', JSON.stringify(rects, null, 2));
await b.close();
