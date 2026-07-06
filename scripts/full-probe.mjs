import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900}, locale:'he-IL' })).newPage();
const errs = [];
p.on('pageerror', e => errs.push({ src:'page', msg: e.message }));
p.on('console', m => { if (m.type()==='error' && !/netfree/i.test(m.text())) errs.push({ src:'console', msg: m.text().slice(0,100) }); });
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2500);

// Check all `window.*` function refs from onclick attrs are defined
const undefined_ = await p.evaluate(() => {
  const attrs = new Set();
  document.querySelectorAll('[onclick]').forEach(el => {
    const s = el.getAttribute('onclick');
    const m = s.match(/^\s*([a-zA-Z_][\w]*)\s*\(/);
    if (m) attrs.add(m[1]);
  });
  return [...attrs].map(fn => ({ fn, defined: typeof window[fn] === 'function' }));
});
console.log('window handlers:');
undefined_.forEach(x => console.log(' ', x.defined ? '✓' : '✗', x.fn));

// Try clicking topic tabs
const topicTest = await p.evaluate(() => {
  const btn = document.querySelector('.topic-tab');
  if (!btn) return { err: 'no topic tab' };
  const target = document.getElementById(btn.dataset.topic);
  return { hasTarget: !!target, targetId: btn.dataset.topic };
});
console.log('topic tab test:', JSON.stringify(topicTest));

// FAQ toggle test
await p.goto('https://maale-amos.github.io/faq/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(1500);
const faq = await p.evaluate(() => {
  const items = document.querySelectorAll('details.faq-item');
  return {
    count: items.length,
    firstOpen: items[0] ? items[0].open : null
  };
});
console.log('FAQ:', JSON.stringify(faq));

console.log('errors:', errs.length);
errs.forEach(e => console.log(' ', e.src, '-', e.msg));
await b.close();
