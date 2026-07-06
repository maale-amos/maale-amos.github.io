import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900}, locale:'he-IL' })).newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message));
p.on('console', m => { if (m.type()==='error' && !/netfree/i.test(m.text())) errors.push('console: '+m.text().slice(0,120)); });
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(2500);

// 1) desktop nav dropdown hover
const dropdown = await p.evaluate(() => {
  const item = document.querySelector('.nav-menu li');
  if (!item) return { err: 'no nav item' };
  const mega = item.querySelector('.dropdown-mega');
  if (!mega) return { err: 'no dropdown' };
  return { hasDropdown: true, itemsInside: mega.querySelectorAll('a').length };
});

// 2) search input
const searchTest = await p.evaluate(() => {
  const inp = document.getElementById('siteSearch');
  if (!inp) return { err: 'no search input' };
  inp.value = 'קהילה';
  inp.dispatchEvent(new Event('input', { bubbles: true }));
  if (typeof window.searchSite === 'function') window.searchSite('קהילה');
  const results = document.getElementById('searchResults');
  return {
    hasResultsPanel: !!results,
    resultsDisplay: results && getComputedStyle(results).display,
    hitCount: results ? results.querySelectorAll('a').length : 0
  };
});

// 3) hero quick links
const quickLinks = await p.evaluate(() => {
  const links = document.querySelectorAll('.hero-quick-links a');
  return [...links].map(a => ({ label: a.textContent.trim().slice(0,20), href: a.getAttribute('href') }));
});

// 4) click a quick link
await p.evaluate(() => location.hash = '#announcements');
await p.waitForTimeout(500);
const scrollY = await p.evaluate(() => window.scrollY);

console.log('dropdown:', JSON.stringify(dropdown));
console.log('search:', JSON.stringify(searchTest));
console.log('quickLinks:', JSON.stringify(quickLinks));
console.log('scrolled to:', scrollY);
console.log('errors:', errors.length, errors.slice(0,3));
await b.close();
