import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:390,height:844} })).newPage();
await p.goto('http://localhost:8080/', { waitUntil: 'load' });
await p.waitForTimeout(1500);
const info = await p.evaluate(() => {
  const btn = document.querySelector('.mobile-toggle');
  const dark = document.querySelector('.dark-toggle');
  const a11y = document.querySelector('.a11y-widget');
  return {
    btn: btn && btn.getBoundingClientRect(),
    dark: dark && dark.getBoundingClientRect(),
    a11y: a11y && a11y.getBoundingClientRect(),
    winH: innerHeight
  };
});
console.log(JSON.stringify(info, null, 2));
try {
  await p.click('.mobile-toggle', { timeout: 3000 });
  await p.waitForTimeout(200);
  const after = await p.evaluate(() => {
    const m = document.getElementById('navMenu');
    return { display: getComputedStyle(m).display, hasOpen: m.classList.contains('open') };
  });
  console.log('after native click:', JSON.stringify(after));
} catch (e) {
  console.log('click failed:', e.message.split('\n')[0]);
}
await b.close();
