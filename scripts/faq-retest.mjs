import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/faq/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
try {
  await p.click('details.faq-item summary', { timeout: 5000 });
  await p.waitForTimeout(300);
  const open = await p.evaluate(() => document.querySelector('details.faq-item').open);
  console.log('FAQ click succeeded, open=', open);
} catch (e) {
  console.log('FAQ still blocked:', e.message.split('\n')[0]);
}
await b.close();
