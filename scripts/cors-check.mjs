// Try to hit worker POST /api/admin/login via Playwright's raw request context,
// which uses a separate stack than the browser page fetch (avoids some MITM issues).
import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const ctx = await b.newContext();

for (const url of [
  'https://maale-amos-api.6742853.workers.dev/api/me',
  'https://maale-amos-api.6742853.workers.dev/api/admin/login'
]) {
  try {
    let res;
    if (url.endsWith('/login')) {
      res = await ctx.request.post(url, {
        headers: { 'Content-Type': 'application/json', 'Origin': 'https://maale-amos.github.io' },
        data: { username: 'admin', password: 'wrong' }
      });
    } else {
      res = await ctx.request.get(url, {
        headers: { 'Origin': 'https://maale-amos.github.io' }
      });
    }
    console.log('URL:', url);
    console.log('  status:', res.status());
    const h = res.headers();
    ['access-control-allow-origin', 'access-control-allow-credentials', 'access-control-allow-methods', 'vary'].forEach(k => {
      console.log(`  ${k}: ${h[k] || '(missing)'}`);
    });
    console.log('  body:', (await res.text()).slice(0, 100));
    console.log('');
  } catch (e) { console.log(url, 'ERR:', e.message.split('\n')[0].slice(0, 100)); }
}

await b.close();
