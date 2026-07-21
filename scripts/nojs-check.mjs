// nojs-check.mjs — מוודא שהאתר קריא גם בלי JavaScript.
// הרקע: .fade-up היה opacity:0 כברירת מחדל, כך שכשל סקריפט או חסימת סינון
// הותירו עמוד לבן לגמרי. הבדיקה מריצה את העמודים עם JS מנוטרל.
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:8123';
const PAGES = [['home', '/'], ['about', '/about/'], ['shuls', '/shuls/'], ['faq', '/faq/'], ['emergency', '/emergency/']];

const browser = await chromium.launch();
const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 }, locale: 'he-IL' });
let fail = 0;
for (const [name, path] of PAGES) {
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: 'load', timeout: 30000 });
  // כמה טקסט באמת נראה לגולש, ואיזה חלק ממנו מוסתר ב-opacity:0
  const { visibleChars, hidden } = await page.evaluate(() => {
    const hidden = [...document.querySelectorAll('.fade-up')]
      .filter(el => parseFloat(getComputedStyle(el).opacity) < 0.05).length;
    return { visibleChars: (document.body.innerText || '').trim().length, hidden };
  });
  const ok = visibleChars > 400 && hidden === 0;
  if (!ok) fail++;
  console.log(`${ok ? '✓' : '✗'} ${name}: ${visibleChars} תווים גלויים · ${hidden} אלמנטים שקופים`);
  await page.close();
}
await browser.close();
console.log(`\nעמודים ללא JS: ${PAGES.length} · כשלים: ${fail}`);
process.exit(fail ? 1 : 0);
