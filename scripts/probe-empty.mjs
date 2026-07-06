import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/', { waitUntil: 'load' });
await p.waitForTimeout(2500);
const info = await p.evaluate(() => {
  const IDs = ['#news','#events','#simchot','#gemachim','#marketplace','#hot-bulletins','#featured','#announcements'];
  return IDs.map(id => {
    const s = document.querySelector(id);
    if (!s) return { id, exists:false };
    const style = getComputedStyle(s);
    return {
      id,
      classes: s.className,
      paddingTop: style.paddingTop, paddingBottom: style.paddingBottom,
      hasReal: !!s.querySelector('article, .event-item, .simcha-item, .gemach-card, .market-card, .bulletin-card, .featured-card, .announcement'),
      emptyStateText: s.querySelector('.empty-state')?.textContent?.slice(0,60) || null
    };
  });
});
console.log(JSON.stringify(info, null, 2));
await b.close();
