// e2e-check.mjs — בדיקה אמיתית בדפדפן על ה-build המקומי.
// דסקטופ (1280) + מובייל (390): שגיאות קונסולה, גלישה אופקית, בקשות חיצוניות,
// נכסים שנכשלו (404), והופעת התוכן שהוטמע. צילום לכל עמוד.
// שימוש: node scripts/e2e-check.mjs [baseUrl]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:8123';
const SHOTS = '_e2e-shots';
mkdirSync(SHOTS, { recursive: true });

const PAGES = [
  ['home', '/'],
  ['about', '/about/'],
  ['shuls', '/shuls/'],
  ['education', '/education/'],
  ['emergency', '/emergency/'],
  ['buses', '/buses/'],
  ['faq', '/faq/'],
  ['attractions', '/attractions/'],
  ['contact', '/contact/'],
  ['klita', '/klita/'],
  ['admin', '/admin/'],
  ['residents', '/residents/'],
];

const VIEWPORTS = [
  ['desktop', { width: 1280, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
];

// טקסטים שחייבים להופיע לגולש בפועל (לא רק ב-HTML הגולמי)
const VISIBLE = {
  home: ['מעלה עמוס', 'מיקום היישוב'],   // כרטיס המפה המקומי יושב בסקציית אודות בעמוד הבית
  about: ['748'],
  shuls: ['בית המדרש דחסידי ביאלא'],
  emergency: ['90 שניות'],
  faq: ['365'],                            // בתוך <details> — נפתח לפני הבדיקה
};

// עמודים שתלויים ב-Worker חי — מקומית ה-API אינו נגיש ולכן שגיאות ה-CORS צפויות.
// הם נבדקים ברמת UI בלבד, וזה מסומן במפורש בפלט.
const BACKEND_PAGES = new Set(['admin']);

// קריאות חיצוניות מוכרות ומכוונות (לא כשל): זמני שבת + ה-API של פאנל הניהול
const ALLOWED_EXTERNAL = [/^https:\/\/www\.hebcal\.com\//, /^https:\/\/maale-amos-api\./];

const results = [];
const browser = await chromium.launch();

for (const [vpName, viewport] of VIEWPORTS) {
  for (const [name, path] of PAGES) {
    const ctx = await browser.newContext({ viewport, locale: 'he-IL' });
    const page = await ctx.newPage();
    const consoleErrors = [], external = [], failed = [];

    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
    page.on('pageerror', e => consoleErrors.push('pageerror: ' + String(e).slice(0, 200)));
    page.on('request', r => { if (!r.url().startsWith(BASE) && !r.url().startsWith('data:')) external.push(r.url().slice(0, 120)); });
    page.on('requestfailed', r => { if (r.url().startsWith(BASE)) failed.push(r.url().slice(0, 120) + ' — ' + (r.failure()?.errorText || '')); });

    let status = 0;
    try {
      const resp = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
      status = resp ? resp.status() : 0;
    } catch (e) {
      consoleErrors.push('navigation: ' + String(e).slice(0, 160));
    }
    await page.waitForTimeout(600);
    // פותחים אקורדיונים כדי שטקסט מקופל ייחשב "גלוי" לבדיקה
    await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; })).catch(() => {});

    // גלישה אופקית — הגוף לא אמור לגלוש מעבר לרוחב החלון
    const overflow = await page.evaluate(() =>
      Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth);

    // טקסטים שחייבים להיות גלויים
    const missing = [];
    for (const needle of (VISIBLE[name] || [])) {
      const found = await page.evaluate(t => (document.body.innerText || '').includes(t), needle);
      if (!found) missing.push(needle);
    }

    await page.screenshot({ path: `${SHOTS}/${vpName}-${name}.png`, fullPage: true }).catch(() => {});
    const ext = [...new Set(external)];
    results.push({ vp: vpName, name, status, consoleErrors, failed, overflow, missing,
      external: ext.filter(u => !ALLOWED_EXTERNAL.some(re => re.test(u))),
      externalAllowed: ext.filter(u => ALLOWED_EXTERNAL.some(re => re.test(u))) });
    await ctx.close();
  }
}
await browser.close();

let fail = 0;
for (const r of results) {
  const problems = [];
  if (r.status !== 200) problems.push(`status ${r.status}`);
  const backendOnly = BACKEND_PAGES.has(r.name);
  if (r.consoleErrors.length && !backendOnly) problems.push(`${r.consoleErrors.length} שגיאות קונסולה`);
  if (r.external.length) problems.push(`${r.external.length} בקשות חיצוניות`);
  if (r.failed.length) problems.push(`${r.failed.length} נכסים שנכשלו`);
  if (r.overflow > 1) problems.push(`גלישה אופקית ${r.overflow}px`);
  if (r.missing.length) problems.push(`טקסט חסר: ${r.missing.join(', ')}`);
  if (problems.length) {
    fail++;
    console.log(`✗ ${r.vp}/${r.name}: ${problems.join(' · ')}`);
    r.consoleErrors.slice(0, 3).forEach(e => console.log(`    קונסולה: ${e}`));
    r.external.slice(0, 5).forEach(e => console.log(`    חיצוני: ${e}`));
    r.failed.slice(0, 3).forEach(e => console.log(`    נכשל: ${e}`));
  } else if (backendOnly) {
    console.log(`✓ ${r.vp}/${r.name} — נבדק UI בלבד (דורש Worker חי; ${r.consoleErrors.length} שגיאות API מקומיות צפויות)`);
  } else {
    console.log(`✓ ${r.vp}/${r.name}`);
  }
}
console.log(`\nעמודים שנבדקו: ${results.length} · עם ממצאים: ${fail}`);
console.log(`צילומים: ${SHOTS}/`);
process.exit(fail ? 1 : 0);
