import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
const tabs = await p.evaluate(() => {
  return [...document.querySelectorAll('.topic-tab')].map(t => ({
    topic: t.dataset.topic,
    label: t.textContent.trim().slice(0,20),
    targetExists: !!document.getElementById(t.dataset.topic)
  }));
});
console.log('topic tabs:', tabs.length);
tabs.forEach(t => console.log(' ', t.targetExists ? '✓' : '✗', t.topic, '→', t.label));
await b.close();
