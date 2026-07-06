// main.js — maale-amos public site v2.0 (Eleventy)
// Zero fabricated defaults. All dynamic content from /data/*.json (owned by admin).
(function () {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  async function fetchJSON(path, fallback = null) {
    try {
      const res = await fetch(path, { cache: 'no-store' });
      if (!res.ok) return fallback;
      return await res.json();
    } catch { return fallback; }
  }

  function el(tag, attrs = {}, ...children) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    for (const c of children) {
      if (c == null) continue;
      e.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return e;
  }

  function empty(container, msg) {
    if (!container) return;
    container.innerHTML = `<div class="empty-state" style="text-align:center;padding:24px;color:var(--text-light,#666)">
      <i class="bi bi-inbox" aria-hidden="true" style="font-size:2rem;display:block;margin-bottom:8px;opacity:.5"></i>
      ${msg || 'אין תוכן כרגע'}
    </div>`;
  }

  async function renderNews() {
    const list = $('#newsGrid');
    if (!list) return;
    const items = await fetchJSON('/data/news.json', []);
    if (!items?.length) return empty(list, 'אין חדשות כרגע — יופיעו כאן ברגע שהמזכירות תפרסם');
    list.innerHTML = '';
    items.slice(0, 12).forEach(n => {
      list.appendChild(el('article', { class: 'news-card fade-up' },
        el('h3', {}, n.title || ''),
        el('p', { class: 'news-meta' }, [n.date, n.cat].filter(Boolean).join(' · ')),
        el('p', {}, n.desc || '')
      ));
    });
  }

  async function renderAnnouncements() {
    const list = $('#announcementsList');
    if (!list) return;
    const items = await fetchJSON('/data/announcements.json', []);
    if (!items?.length) return empty(list, 'אין הודעות כרגע');
    list.innerHTML = '';
    items.forEach(a => {
      list.appendChild(el('div', { class: 'announcement fade-up' },
        el('h3', {}, a.title || ''),
        el('p', {}, a.body || '')
      ));
    });
  }

  async function renderEvents() {
    const list = $('#eventsList');
    if (!list) return;
    const items = await fetchJSON('/data/events.json', []);
    if (!items?.length) return empty(list, 'אין אירועים כרגע');
    list.innerHTML = '';
    items.forEach(ev => {
      list.appendChild(el('div', { class: 'event-item fade-up' },
        el('strong', {}, ev.title || ''),
        el('span', {}, ' · ' + (ev.date || '') + (ev.location ? ' · ' + ev.location : ''))
      ));
    });
  }

  async function renderSimchot() {
    const list = $('#simchaList');
    if (!list) return;
    const items = await fetchJSON('/data/simchot.json', []);
    if (!items?.length) return empty(list, 'אין שמחות מדווחות כרגע');
    list.innerHTML = '';
    items.forEach(s => {
      list.appendChild(el('div', { class: 'simcha-item fade-up' },
        el('strong', {}, s.family || ''),
        el('span', {}, ' — ' + (s.event || '') + (s.date ? ' · ' + s.date : ''))
      ));
    });
  }

  async function renderGemachim() {
    const list = $('#gemachGrid');
    if (!list) return;
    const items = await fetchJSON('/data/gemachim.json', []);
    if (!items?.length) return empty(list, 'טרם דווחו גמ״חים');
    list.innerHTML = '';
    items.forEach(g => {
      list.appendChild(el('div', { class: 'gemach-card fade-up' },
        el('h4', {}, g.name || ''),
        el('p', {}, g.desc || ''),
        g.phone ? el('a', { href: 'tel:' + g.phone }, g.phone) : null
      ));
    });
  }

  async function renderMarket() {
    const list = $('#marketGrid');
    if (!list) return;
    const items = await fetchJSON('/data/market.json', []);
    if (!items?.length) return empty(list, 'אין פריטים בלוח יד שנייה');
    list.innerHTML = '';
    items.forEach(m => {
      list.appendChild(el('div', { class: 'market-card fade-up' },
        el('h4', {}, m.title || ''),
        el('p', {}, m.desc || ''),
        m.price ? el('p', {}, '₪ ' + m.price) : null
      ));
    });
  }

  async function renderHotBulletins() {
    const grid = $('#hotBulletinsGrid');
    const emptyEl = $('#hotBulletinsEmpty');
    if (!grid) return;
    const items = await fetchJSON('/data/bulletins.json', []);
    if (!items?.length) {
      grid.innerHTML = '';
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    grid.innerHTML = '';
    items.forEach(b => {
      grid.appendChild(el('div', { class: 'bulletin-card fade-up' },
        el('strong', {}, b.title || ''),
        el('p', {}, b.body || '')
      ));
    });
  }

  async function renderFeatured() {
    const list = $('#featuredItems');
    if (!list) return;
    const items = await fetchJSON('/data/featured.json', []);
    if (!items?.length) { list.innerHTML = ''; return; }
    list.innerHTML = '';
    items.forEach(f => list.appendChild(el('div', { class: 'featured-card fade-up' },
      el('strong', {}, f.title || ''),
      el('p', {}, f.desc || '')
    )));
  }

  async function renderTicker() {
    const inner = $('#tickerInner');
    if (!inner) return;
    const all = await fetchJSON('/data/all.json', {});
    const updates = (all && all.ticker) || [];
    if (!updates.length) { if (inner.parentElement) inner.parentElement.style.display = 'none'; return; }
    inner.innerHTML = updates.map(u => `<span>${u.text || ''}</span>`).join(' · ');
  }

  async function renderShabbat() {
    const parasha = $('#shabbatParasha');
    const candle = $('#candleLighting');
    const havdala = $('#shabbatEnd');
    if (!parasha && !candle && !havdala) return;

    const url = 'https://www.hebcal.com/shabbat?cfg=json&geo=pos&latitude=31.6&longitude=35.1&M=on&b=40';
    const data = await fetchJSON(url, null);
    if (!data) {
      if (parasha) parasha.textContent = 'לא ניתן לטעון זמנים כרגע';
      return;
    }
    const items = data.items || [];
    const p = items.find(i => i.category === 'parashat');
    const c = items.find(i => i.category === 'candles');
    const h = items.find(i => i.category === 'havdalah');
    if (parasha && p) parasha.textContent = p.hebrew || p.title;
    if (candle && c)  candle.textContent  = new Date(c.date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' });
    if (havdala && h) havdala.textContent  = new Date(h.date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' });
  }

  function wireSmoothScroll() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href.length < 2) return;
        const t = document.querySelector(href);
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
  }

  function wireSearch() {
    const box = $('#siteSearch');
    if (!box) return;
    box.addEventListener('input', () => {
      const q = box.value.trim().toLowerCase();
      $$('.section').forEach(sec => {
        const hit = !q || sec.textContent.toLowerCase().includes(q);
        sec.style.display = hit ? '' : 'none';
      });
    });
  }

  function wireExternalLinks() {
    $$('a[href^="http"]').forEach(a => {
      if (!a.href.includes(location.hostname)) {
        a.setAttribute('rel', 'noopener noreferrer');
        if (!a.hasAttribute('target')) a.setAttribute('target', '_blank');
      }
    });
  }

  function wireFadeUp() {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -60px 0px' });
    $$('.fade-up').forEach(el => io.observe(el));
  }

  document.addEventListener('DOMContentLoaded', () => {
    Promise.all([
      renderNews(), renderAnnouncements(), renderEvents(), renderSimchot(),
      renderGemachim(), renderMarket(), renderHotBulletins(), renderFeatured(),
      renderTicker(), renderShabbat()
    ]).catch(err => console.warn('render error:', err));

    wireSmoothScroll();
    wireSearch();
    wireExternalLinks();
    wireFadeUp();

    // Collapse sections whose only content is an empty-state placeholder
    setTimeout(() => {
      const collapsible = ['#news', '#events', '#simchot', '#gemachim', '#marketplace',
                           '#hot-bulletins', '#featured', '#announcements'];
      collapsible.forEach(sel => {
        const sec = document.querySelector(sel);
        if (!sec) return;
        const hasReal = sec.querySelector('article, .event-item, .simcha-item, .gemach-card, .market-card, .bulletin-card, .featured-card, .announcement');
        if (!hasReal) sec.classList.add('is-empty');
      });
    }, 400);
  });
})();
