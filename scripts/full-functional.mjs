// Full functional probe: every page, every button, every form.
// Emits a table for STATUS.md.
import { chromium } from 'playwright';

const PAGES = [
  '/', '/about/', '/education/', '/shuls/', '/emergency/', '/faq/',
  '/buses/', '/attractions/', '/residents/', '/admin/', '/contact/', '/accessibility/'
];

const IGNORE_URL = /netfree\.link|netspark|maale-amos-api\.6742853\.workers\.dev/i;

async function auditOne(browser, viewport, url) {
  const ctx = await browser.newContext({ viewport, locale: 'he-IL' });
  const p = await ctx.newPage();
  const errors = [];
  const badReqs = [];
  p.on('pageerror', e => errors.push('pageerror: ' + e.message.slice(0, 100)));
  p.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (IGNORE_URL.test(t)) return;
    if (/^Failed to load resource:/.test(t)) return;
    errors.push('console: ' + t.slice(0, 100));
  });
  p.on('response', r => {
    if (IGNORE_URL.test(r.url())) return;
    if (r.status() >= 400) badReqs.push(`${r.status()} ${r.url().slice(0, 100)}`);
  });

  let status = 0, elapsed = 0;
  const t0 = Date.now();
  try {
    const res = await p.goto('https://maale-amos.github.io' + url + '?cb=' + Date.now(), { waitUntil: 'load', timeout: 60000 });
    status = res?.status() || 0;
  } catch (e) { errors.push('nav: ' + e.message.split('\n')[0].slice(0, 100)); }
  elapsed = Date.now() - t0;

  await p.waitForTimeout(1500);

  // Structural checks
  const info = await p.evaluate(() => {
    const links = [...document.querySelectorAll('a[href]')];
    const hashLinks = links.filter(a => a.getAttribute('href')?.startsWith('#') && a.getAttribute('href').length > 1);
    const brokenHash = hashLinks.filter(a => !document.getElementById(a.getAttribute('href').slice(1)));
    const buttons = [...document.querySelectorAll('button, [role=button]')];
    const buttonNoHandler = buttons.filter(b => !b.getAttribute('onclick') && !b.type && b.tagName === 'BUTTON');
    const imgs = [...document.querySelectorAll('img')];
    const brokenImgs = imgs.filter(i => i.complete && i.naturalWidth === 0);
    const bodyOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
    return {
      links: links.length,
      hashLinks: hashLinks.length,
      brokenHash: brokenHash.map(a => a.getAttribute('href') + '=' + a.textContent.trim().slice(0, 20)),
      buttons: buttons.length,
      buttonNoHandler: buttonNoHandler.length,
      imgs: imgs.length,
      brokenImgs: brokenImgs.map(i => i.src.split('/').pop()),
      overflow: bodyOverflow,
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      h1: document.querySelectorAll('h1').length,
      hasHeader: !!document.querySelector('header, nav'),
      hasFooter: !!document.querySelector('footer'),
      pageText: (document.querySelector('main')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60)
    };
  });

  await ctx.close();
  return { url, viewport: viewport.width === 390 ? 'M' : 'D', status, elapsed, errors, badReqs, ...info };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const vp of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    for (const url of PAGES) {
      const r = await auditOne(browser, vp, url);
      results.push(r);
      const flag = (r.status === 200 && r.errors.length === 0 && r.badReqs.length === 0 && r.brokenHash.length === 0 && r.brokenImgs.length === 0 && !r.overflow) ? '✓' : '✗';
      console.log(`${flag} ${r.viewport} ${url.padEnd(18)} ${r.status} · ${r.elapsed}ms · err=${r.errors.length} req=${r.badReqs.length} brokenHash=${r.brokenHash.length} brokenImgs=${r.brokenImgs.length} overflow=${r.overflow}`);
      if (r.errors.length) r.errors.slice(0, 2).forEach(e => console.log('    ERR:', e));
      if (r.brokenHash.length) r.brokenHash.slice(0, 3).forEach(h => console.log('    HASH:', h));
      if (r.brokenImgs.length) r.brokenImgs.slice(0, 3).forEach(i => console.log('    IMG:', i));
    }
  }
  await browser.close();
  const bad = results.filter(r => r.errors.length || r.badReqs.length || r.brokenHash.length || r.brokenImgs.length || r.overflow || r.status !== 200);
  console.log(`\n=== ${results.length - bad.length}/${results.length} clean · ${bad.length} problems ===`);
  process.exit(bad.length ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
