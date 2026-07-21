// _local-sweep.mjs — QA sweep against LOCAL enriched build (localhost:8080).
// Headless. Captures console errors, net fails, horizontal overflow, smoke element,
// and a full-page desktop screenshot per page into the scratchpad shots dir.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.SWEEP_BASE || 'http://localhost:8080';
const SHOTS = process.env.SHOTS_DIR;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const PAGES = [
  { path: '/',             check: 'main', shot: 'home' },
  { path: '/about/',       check: 'main', shot: 'about' },
  { path: '/education/',   check: 'main', shot: 'education' },
  { path: '/shuls/',       check: 'main', shot: 'shuls' },
  { path: '/emergency/',   check: 'main', shot: 'emergency' },
  { path: '/attractions/', check: 'main', shot: 'attractions' },
  { path: '/buses/',       check: 'main', shot: 'buses' },
  { path: '/faq/',         check: 'main', shot: 'faq' },
  { path: '/contact/',     check: 'main', shot: 'contact' },
  { path: '/residents/',   check: 'main', shot: 'residents' },
  { path: '/accessibility/',check: 'main', shot: 'accessibility' },
  { path: '/klita/',       check: '#klitaApp', shot: 'klita' },
  { path: '/admin/',       check: '#adminApp', shot: 'admin' },
  { path: '/404.html',     check: 'body', shot: null }
];
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900, shot: true },
  { name: 'mobile',  width: 390,  height: 844, shot: false }
];

const results = [];
const b = await chromium.launch({ headless: true });
for (const vp of VIEWPORTS) {
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  for (const pg of PAGES) {
    const consoleErrs = [];
    const netFails = [];
    const onConsole = m => {
      if (m.type() !== 'error') return;
      const t = m.text();
      if (t.includes('netfree.link')) return;
      if (/status of 40[13]/i.test(t)) return;        // 401/403 from API without session = expected
      if (/status of 418/i.test(t)) return;           // NetFree block
      if (t.includes('Failed to load resource: net::ERR_FAILED')) return;
      if (t.includes('workers.dev')) return;          // API offline locally = expected
      consoleErrs.push(t.slice(0, 240));
    };
    const onFail = r => {
      const u = r.url(); const err = r.failure()?.errorText || 'fail';
      if (u.includes('workers.dev') || u.includes('netfree.link')) return;
      if (err === 'net::ERR_ABORTED' || err === 'net::ERR_BLOCKED_BY_ORB') return;
      if (u.includes('hebcal.com')) return;           // live external, may be flaky
      netFails.push(`${err}: ${u.slice(0, 100)}`);
    };
    page.on('console', onConsole);
    page.on('requestfailed', onFail);
    let smoke = false, overflow = 0, err = null;
    try {
      const r = await page.goto(`${BASE}${pg.path}`, { waitUntil: 'load', timeout: 20000 });
      const status = r?.status() ?? 0;
      if (status >= 400 && !pg.path.includes('404')) { err = 'bad_status_' + status; }
      else {
        await page.waitForTimeout(900);
        smoke = await page.evaluate(sel => !!document.querySelector(sel), pg.check);
        overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth ? document.body.scrollWidth - window.innerWidth : 0);
        if (vp.shot && SHOTS && pg.shot) {
          await page.screenshot({ path: `${SHOTS}/${pg.shot}.png`, fullPage: true }).catch(() => {});
        }
      }
    } catch (e) { err = String(e.message).slice(0, 160); }
    results.push({ vp: vp.name, path: pg.path, smoke, overflow, ce: consoleErrs.length, nf: netFails.length, _c: consoleErrs, _n: netFails, err });
    page.removeAllListeners();
  }
  await ctx.close();
}
await b.close();

let ok = 0, bad = 0;
for (const r of results) {
  const clean = !r.err && r.smoke && r.overflow === 0 && r.ce === 0 && r.nf === 0;
  clean ? ok++ : bad++;
  const status = r.err ? `❌ ${r.err}` : clean ? '✓' : `⚠ overflow=${r.overflow}px console=${r.ce} net=${r.nf} smoke=${r.smoke}`;
  console.log(`${r.vp.padEnd(7)} ${r.path.padEnd(17)} ${status}`);
  (r._c||[]).forEach(m => console.log(`   console: ${m}`));
  (r._n||[]).forEach(m => console.log(`   net: ${m}`));
}
console.log(`\n=== ${ok}/${ok+bad} clean (${bad} issues) ===`);
process.exit(0);
