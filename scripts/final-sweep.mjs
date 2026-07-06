import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2500);

// Search test
await p.evaluate(() => { const i = document.getElementById('siteSearch'); i.focus(); });
await p.keyboard.type('חינוך');
await p.waitForTimeout(500);
const searchResults = await p.evaluate(() => {
  const sr = document.getElementById('searchResults');
  return sr ? { display: getComputedStyle(sr).display, hits: sr.querySelectorAll('a').length } : null;
});
console.log('search "חינוך":', JSON.stringify(searchResults));

// Close search + click FAQ item test
await p.evaluate(() => {
  document.getElementById('searchResults').style.display = 'none';
  document.getElementById('siteSearch').value = '';
});
await p.goto('https://maale-amos.github.io/faq/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(1000);
await p.click('details.faq-item summary');
await p.waitForTimeout(300);
const faqOpen = await p.evaluate(() => document.querySelector('details.faq-item').open);
console.log('FAQ toggle:', faqOpen);

// Contact form structure
await p.goto('https://maale-amos.github.io/#contact?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(1500);
const form = await p.evaluate(() => {
  const f = document.getElementById('contactForm');
  return f ? {
    action: f.action,
    method: f.method,
    fields: [...f.querySelectorAll('input, textarea, select')].map(x => x.name).filter(Boolean)
  } : null;
});
console.log('contact form:', JSON.stringify(form, null, 2));

await b.close();
