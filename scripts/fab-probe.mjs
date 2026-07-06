import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2000);
// Test openReportMenu — expected: sets location.hash to #security
await p.evaluate(() => window.openReportMenu());
await p.waitForTimeout(300);
const hash1 = await p.evaluate(() => location.hash);
console.log('openReportMenu → hash =', hash1);

// Test openContactMenu
await p.evaluate(() => window.openContactMenu());
await p.waitForTimeout(300);
const hash2 = await p.evaluate(() => location.hash);
console.log('openContactMenu → hash =', hash2);

// Verify #security and #contact are visible and scrolled to
const scrolled = await p.evaluate(() => window.scrollY);
console.log('scrollY:', scrolled);
await b.close();
