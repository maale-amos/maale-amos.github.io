import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:390,height:844} })).newPage();
await p.goto('http://localhost:8080/', { waitUntil: 'load' });
await p.waitForTimeout(1500);
const before = await p.evaluate(() => {
  const btn = document.querySelector('.mobile-toggle');
  const menu = document.getElementById('navMenu');
  return {
    btnVisible: btn && getComputedStyle(btn).display !== 'none',
    menuDisplay: menu && getComputedStyle(menu).display,
    menuHasOpen: menu && menu.classList.contains('open')
  };
});
console.log('before:', JSON.stringify(before));
await p.click('.mobile-toggle');
await p.waitForTimeout(300);
const after = await p.evaluate(() => {
  const menu = document.getElementById('navMenu');
  return { menuDisplay: getComputedStyle(menu).display, menuHasOpen: menu.classList.contains('open') };
});
console.log('after click:', JSON.stringify(after));
await b.close();
