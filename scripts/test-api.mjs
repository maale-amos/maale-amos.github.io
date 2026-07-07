import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const ctx = await b.newContext();
const p = await ctx.newPage();
try {
  const res = await p.request.get('https://maale-amos-api.6742853.workers.dev/api/me');
  console.log('status:', res.status());
  console.log('body:', await res.text());
} catch (e) { console.log('err:', e.message.slice(0,200)); }
await b.close();
