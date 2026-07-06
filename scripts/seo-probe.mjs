import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();
await p.goto('https://maale-amos.github.io/?v='+Date.now(), { waitUntil: 'load' });
await p.waitForTimeout(1500);
const seo = await p.evaluate(() => {
  const meta = (name, prop='name') => document.querySelector(`meta[${prop}="${name}"]`)?.content || null;
  return {
    title: document.title,
    description: meta('description'),
    ogTitle: meta('og:title', 'property'),
    ogDesc: meta('og:description', 'property'),
    ogImage: meta('og:image', 'property'),
    ogUrl: meta('og:url', 'property'),
    twitter: meta('twitter:card'),
    canonical: document.querySelector('link[rel="canonical"]')?.href || null,
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    viewport: meta('viewport'),
  };
});
console.log(JSON.stringify(seo, null, 2));
await b.close();
