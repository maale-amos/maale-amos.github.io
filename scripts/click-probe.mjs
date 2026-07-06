import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900}, locale:'he-IL' })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);

// Click hero quick link "לוח אירועים" → #events
await p.click('.hero-quick-links a[href="#events"]');
await p.waitForTimeout(700);
const y = await p.evaluate(() => window.scrollY);
console.log('scroll after quick-link click:', y);

// Click floating widget "quickCall106" — expected to open tel: — just check it exists
const fabInfo = await p.evaluate(() => ({
  emergency: !!document.querySelector('.float-btn.emergency'),
  report: !!document.querySelector('.float-btn.report'),
  phone: !!document.querySelector('.float-btn.phone'),
  backTop: !!document.getElementById('backToTop')
}));
console.log('FABs:', JSON.stringify(fabInfo));

// Test dark toggle
await p.click('.dark-toggle');
await p.waitForTimeout(300);
const dark = await p.evaluate(() => document.documentElement.classList.contains('dark'));
console.log('dark mode on:', dark);

// Font size a11y
await p.click('.a11y-btn[onclick*="1)"]');
await p.waitForTimeout(300);
const fs = await p.evaluate(() => document.documentElement.style.fontSize);
console.log('font-size after +A:', fs);
await b.close();
