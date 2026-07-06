import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:390,height:844}, locale:'he-IL' })).newPage();
const urls = ['/', '/about/', '/shuls/', '/emergency/', '/faq/', '/buses/', '/residents/', '/accessibility/', '/admin/'];
for (const u of urls) {
  await p.goto('https://maale-amos.github.io'+u+'?v='+Date.now(), { waitUntil: 'load' });
  await p.waitForTimeout(1000);
  const info = await p.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }));
  const flag = info.overflow ? '✗' : '✓';
  console.log(flag, u.padEnd(15), 'scrollWidth=', info.sw, 'clientWidth=', info.cw);
}
await b.close();
