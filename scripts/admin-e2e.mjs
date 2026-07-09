import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport:{width:1280,height:900}, locale:'he-IL' });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push('pageerror:' + e.message));
p.on('console', m => { if (m.type()==='error' && !/netfree/i.test(m.text())) errs.push('console:' + m.text().slice(0,120)); });

const RESULTS = [];

async function step(name, fn) {
  try { const r = await fn(); RESULTS.push([name, 'OK', r]); }
  catch(e) { RESULTS.push([name, 'FAIL', e.message?.split('\n')[0] || String(e)]); }
}

await step('load /admin/', async () => {
  const r = await p.goto('https://maale-amos.github.io/admin/?cb='+Date.now(), { waitUntil: 'load' });
  return 'status=' + r.status();
});
await p.waitForTimeout(1500);

await step('username+password form present', async () => {
  const has = await p.evaluate(() => {
    return !!document.getElementById('adminUsername') && !!document.getElementById('adminPassword');
  });
  return 'has=' + has;
});

await step('no OTP fields', async () => {
  const has = await p.evaluate(() => {
    return !!document.getElementById('adminPhone') || !!document.getElementById('adminDeliver') || !!document.getElementById('adminCode');
  });
  return 'legacy-present=' + has;
});

await step('POST wrong password (expect 401)', async () => {
  await p.fill('#adminUsername', 'admin');
  await p.fill('#adminPassword', 'wrong123');
  await p.click('#adminLoginBtn');
  await p.waitForTimeout(2500);
  const msg = await p.evaluate(() => document.getElementById('adminAuthMsg').textContent);
  return 'msg=' + msg;
});

await step('POST correct password (expect dash visible)', async () => {
  await p.fill('#adminPassword', process.env.ADMIN_PASSWORD || '');
  await p.click('#adminLoginBtn');
  await p.waitForTimeout(3000);
  const dashHidden = await p.evaluate(() => document.getElementById('adminDashboard').hidden);
  return 'dashboard hidden=' + dashHidden;
});

console.log('\n=== ADMIN E2E ===');
RESULTS.forEach(([n, s, r]) => console.log(s === 'OK' ? '✓' : '✗', n, '→', r));
if (errs.length) { console.log('\nERRORS:'); errs.forEach(e => console.log(' ', e)); }
await b.close();
