import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/admin/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2500);
// Should be in LOCAL mode. Try PIN
const bannerVisible = await p.evaluate(() => document.querySelector('#adminGate')?.innerHTML?.includes('מצב מקומי'));
console.log('LOCAL banner shown:', bannerVisible);

// Click Request button
await p.click('#adminRequestBtn');
await p.waitForTimeout(500);
const codeStepVisible = await p.evaluate(() => !document.getElementById('adminCodeStep').hidden);
console.log('Code step visible:', codeStepVisible);

// Enter wrong PIN
await p.fill('#adminCode', '9999');
await p.click('#adminVerifyBtn');
await p.waitForTimeout(500);
const msg1 = await p.evaluate(() => document.getElementById('adminAuthMsg').textContent);
console.log('wrong PIN msg:', msg1);

// SECURITY 2026-07-09: PIN supplied via ADMIN_PIN env var, not source.
await p.fill('#adminCode', process.env.ADMIN_PIN || '');
await p.click('#adminVerifyBtn');
await p.waitForTimeout(500);
const dashVisible = await p.evaluate(() => !document.getElementById('adminDashboard').hidden);
console.log('dashboard visible after PIN:', dashVisible);
await b.close();
