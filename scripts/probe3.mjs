import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/', { waitUntil: 'networkidle' });
await p.waitForTimeout(3000);
const info = await p.evaluate(() => {
  const sheets = [...document.styleSheets].map(s => ({
    href: s.href || 'inline',
    rulesCount: (() => { try { return s.cssRules.length; } catch { return 'blocked'; } })(),
    hasEmpty: (() => { try { for (const r of s.cssRules) if (r.cssText && r.cssText.includes('is-empty')) return true; return false; } catch { return 'blocked'; } })()
  }));
  return sheets;
});
console.log(JSON.stringify(info, null, 2));
await b.close();
