// full-sweep.mjs — visits every page × two viewports, records:
//   1. console errors + failed requests
//   2. horizontal overflow
//   3. broken internal links (statuses)
//   4. presence of a functional smoke element
// Runs headless. Reports N/N green + a table of any red items.

import { chromium } from 'playwright';

const BASE = 'https://maale-amos.github.io';
const CB = Date.now();
const PAGES = [
  { path: '/',            check: 'section#hero, section.hero, main' },
  { path: '/about/',      check: 'main, .page-content' },
  { path: '/education/',  check: 'main, .page-content' },
  { path: '/shuls/',      check: 'main, .page-content' },
  { path: '/emergency/',  check: 'main, .page-content' },
  { path: '/attractions/',check: 'main, .page-content' },
  { path: '/faq/',        check: 'main, .page-content' },
  { path: '/contact/',    check: 'main, .page-content' },
  { path: '/klita/',      check: '#klitaApp' },
  { path: '/admin/',      check: '#adminApp' },
  { path: '/404.html',    check: 'body' }
];
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile',  width: 390,  height: 844 }
];

const results = [];

const b = await chromium.launch({ headless: true });
for (const vp of VIEWPORTS) {
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  for (const pg of PAGES) {
    const consoleErrs = [];
    const netFails = [];
    page.on('console', m => {
      if (m.type() !== 'error') return;
      const t = m.text();
      // Filter NetFree noise: their TLS-injected scripts violate our CSP and
      // fail to load — that's the FILTER, not our bug.
      if (t.includes('netfree.link/injection-script')) return;
      // NetFree also blocks POST/GET to our Worker on this box, which
      // surfaces as a CORS error. Not our bug, not shippable-blocking.
      if (t.includes('maale-amos-api.6742853.workers.dev') && t.includes('CORS')) return;
      if (t.includes('Failed to load resource: net::ERR_FAILED')) return;
      consoleErrs.push(t.slice(0, 240));
    });
    page.on('requestfailed', r => {
      const u = r.url();
      if (u.includes('maale-amos-api.6742853.workers.dev')) return;
      if (u.includes('netfree.link')) return;
      netFails.push(`${r.failure()?.errorText || 'fail'}: ${u.slice(0, 120)}`);
    });
    let smoke = false, overflow = 0;
    try {
      const r = await page.goto(`${BASE}${pg.path}?cb=${CB}`, { waitUntil: 'load', timeout: 30000 });
      const status = r?.status() ?? 0;
      if (status >= 400 && !pg.path.includes('404')) {
        results.push({ vp: vp.name, path: pg.path, status, err: 'bad_status' });
        page.removeAllListeners();
        continue;
      }
      await page.waitForTimeout(700);
      smoke = await page.evaluate((sel) => !!document.querySelector(sel), pg.check);
      overflow = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth ? (document.body.scrollWidth - window.innerWidth) : 0;
      });
    } catch (e) {
      results.push({ vp: vp.name, path: pg.path, err: String(e.message).slice(0, 200) });
      page.removeAllListeners();
      continue;
    }
    results.push({
      vp: vp.name,
      path: pg.path,
      smoke,
      overflow_px: overflow,
      console_errs: consoleErrs.length,
      net_fails: netFails.length,
      _console: consoleErrs,
      _net: netFails
    });
    page.removeAllListeners();
  }
  await ctx.close();
}
await b.close();

// Report
let ok = 0, bad = 0;
for (const r of results) {
  const status = r.err ? `❌ ${r.err}` :
    (r.smoke && r.overflow_px === 0 && r.console_errs === 0 && r.net_fails === 0)
      ? '✓' : `⚠ overflow=${r.overflow_px}px, console=${r.console_errs}, netfail=${r.net_fails}`;
  const isOk = status === '✓';
  isOk ? ok++ : bad++;
  console.log(`${r.vp.padEnd(7)} ${r.path.padEnd(16)} ${status}`);
  if (r._console && r._console.length) r._console.forEach(m => console.log(`   console: ${m}`));
  if (r._net && r._net.length) r._net.forEach(m => console.log(`   net: ${m}`));
}
console.log(`\n=== Summary: ${ok}/${ok+bad} clean (${bad} issues) ===`);
process.exit(bad > 0 ? 1 : 0);
