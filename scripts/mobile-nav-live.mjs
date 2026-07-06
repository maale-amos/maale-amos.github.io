import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:390,height:844}, locale:'he-IL' })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
try {
  await p.click('.mobile-toggle', { timeout: 5000 });
  await p.waitForTimeout(400);
  const after = await p.evaluate(() => {
    const m = document.getElementById('navMenu');
    const items = [...m.querySelectorAll('li > a')].map(a => a.textContent.trim().slice(0, 20));
    return { display: getComputedStyle(m).display, hasOpen: m.classList.contains('open'), itemCount: items.length, sample: items.slice(0, 5) };
  });
  console.log('LIVE mobile nav click:', JSON.stringify(after, null, 2));
} catch (e) {
  console.log('FAIL:', e.message.split('\n')[0]);
}
await b.close();
