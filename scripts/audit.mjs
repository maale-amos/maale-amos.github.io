// Playwright audit: screenshots + JS console errors + dead-link check.
// Usage: node scripts/audit.mjs [--live | --local]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const IS_LIVE = process.argv.includes('--live');
const BASE = IS_LIVE ? 'https://maale-amos.github.io' : 'http://localhost:8080';
const OUT = path.join(process.cwd(), 'audit', IS_LIVE ? 'live' : 'local');
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  { slug: '',              name: 'home' },
  { slug: '/about/',       name: 'about' },
  { slug: '/education/',   name: 'education' },
  { slug: '/shuls/',       name: 'shuls' },
  { slug: '/emergency/',   name: 'emergency' },
  { slug: '/faq/',         name: 'faq' },
  { slug: '/buses/',       name: 'buses' },
  { slug: '/residents/',   name: 'residents' },
  { slug: '/admin/',       name: 'admin' },
  { slug: '/accessibility/', name: 'accessibility' },
  { slug: '/contact/',     name: 'contact' }
];

const results = [];

async function run() {
  const browser = await chromium.launch({ headless: true });

  for (const viewport of [
    { name: 'desktop', width: 1280, height: 900 },
    { name: 'mobile',  width: 390,  height: 844 }
  ]) {
    const ctx = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      locale: 'he-IL',
      timezoneId: 'Asia/Jerusalem'
    });

    for (const p of PAGES) {
      const url = BASE + p.slug;
      const errors = [];
      const requests = [];
      const page = await ctx.newPage();
      page.on('pageerror', e => errors.push({ type: 'pageerror', msg: e.message }));
      // Filter out NetFree-injected scripts (Yosef's ISP-level TLS interception).
      // They're OUR site's CSP blocking them — desirable, not a bug.
      const IGNORE_URL = /netfree\.link|netspark/i;
      page.on('console', msg => {
        if (msg.type() !== 'error') return;
        const t = msg.text();
        if (IGNORE_URL.test(t)) return;
        errors.push({ type: 'console', msg: t });
      });
      page.on('requestfailed', r => {
        if (IGNORE_URL.test(r.url())) return;
        requests.push({ url: r.url(), reason: r.failure()?.errorText });
      });
      page.on('response', r => {
        const u = r.url(); if (IGNORE_URL.test(u)) return;
        const s = r.status(); if (s >= 400) requests.push({ url: u, reason: `HTTP ${s}` });
      });

      let status = 0;
      try {
        const res = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
        status = res?.status() || 0;
      } catch (e) {
        errors.push({ type: 'nav', msg: e.message });
      }

      // Wait for any late JS
      await page.waitForTimeout(1500);

      // Collect dead links
      const links = await page.$$eval('a[href]', els =>
        els.map(a => ({ href: a.href, text: a.textContent?.trim().slice(0, 40) || '' })).filter(l => l.href)
      );

      // Full-page screenshot
      const shot = path.join(OUT, `${viewport.name}-${p.name}.png`);
      try { await page.screenshot({ path: shot, fullPage: true }); }
      catch (e) { errors.push({ type: 'screenshot', msg: e.message }); }

      results.push({
        viewport: viewport.name, page: p.name, url, status,
        errors, requests, linksCount: links.length,
        externalLinks: links.filter(l => !l.href.startsWith(BASE)).map(l => l.href).slice(0, 10)
      });
      await page.close();
    }
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(results, null, 2));

  // Terminal summary
  console.log(`\n=== AUDIT ${IS_LIVE ? 'LIVE' : 'LOCAL'} ===`);
  let ok = 0, bad = 0;
  for (const r of results) {
    const errCount = r.errors.length;
    const badReq  = r.requests.length;
    const flag = (r.status === 200 && errCount === 0 && badReq === 0) ? '✓' : '✗';
    if (flag === '✓') ok++; else bad++;
    console.log(`${flag} ${r.viewport.padEnd(7)} ${r.page.padEnd(14)} status=${r.status} errors=${errCount} failedReq=${badReq}`);
    if (errCount) for (const e of r.errors.slice(0, 3)) console.log(`     [${e.type}] ${e.msg.slice(0, 120)}`);
  }
  console.log(`\ntotal: ${ok} ok · ${bad} bad`);
  process.exit(bad ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(2); });
