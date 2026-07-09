import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/admin/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2500);
// Login
await p.click('#adminRequestBtn');
await p.waitForTimeout(300);
// SECURITY 2026-07-09: hard-coded PIN removed. Provide via env var when running the script.
await p.fill('#adminCode', process.env.ADMIN_PIN || '');
await p.click('#adminVerifyBtn');
await p.waitForTimeout(500);
// Test tabs
const tabs = await p.evaluate(() => [...document.querySelectorAll('.admin-tabs .tab')].map(t => ({ label: t.textContent.trim().slice(0,20), active: t.classList.contains('active') })));
console.log('tabs:', JSON.stringify(tabs));

// Verify content textarea loaded
await p.waitForTimeout(1000);
const content = await p.evaluate(() => document.getElementById('sectionJson')?.value?.slice(0,80));
console.log('section JSON preview:', content);

// Try switching to theme tab
await p.click('[data-tab="theme"]');
await p.waitForTimeout(300);
const themeCount = await p.evaluate(() => document.querySelectorAll('[data-theme-key]').length);
console.log('theme controls:', themeCount);

// Try structure tab
await p.click('[data-tab="structure"]');
await p.waitForTimeout(500);
const structureCount = await p.evaluate(() => document.querySelectorAll('#structureList li').length);
console.log('structure list items:', structureCount);
await b.close();
