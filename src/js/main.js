// main.js — maale-amos public site v2.0 (Eleventy)
// Zero fabricated defaults. All dynamic content from /data/*.json (owned by admin).

// --- Global inline-handler functions (called from chrome-body onclick attrs) ---
window.toggleMenu = function () {
  const menu = document.getElementById('navMenu');
  const btn  = document.querySelector('.mobile-toggle');
  if (!menu) return;
  const open = menu.classList.toggle('open');
  if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
};
window.toggleDark = function () {
  const on = document.documentElement.classList.toggle('dark');
  try { localStorage.setItem('ma_dark', on ? '1' : '0'); } catch (_) {}
};
window.changeFontSize = function (delta) {
  const s = document.documentElement.style;
  const cur = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const next = Math.min(24, Math.max(12, cur + delta * 2));
  s.fontSize = next + 'px';
  try { localStorage.setItem('ma_font_px', String(next)); } catch (_) {}
};
window.quickCall106 = function () { location.href = 'tel:106'; };
window.openReportMenu = function () { location.hash = '#security'; };
window.openContactMenu = function () { location.hash = '#contact'; };
window.closeActionSheet = function () {
  const o = document.getElementById('actionSheetOverlay');
  if (o) o.classList.remove('open');
};
window.closeSearch = function () {
  const sr = document.getElementById('searchResults');
  if (sr) sr.style.display = 'none';
};
window.searchSite = function (q) {
  q = (q || '').trim();
  const sr = document.getElementById('searchResults');
  const body = document.getElementById('searchResultsBody');
  if (!sr || !body) return;
  if (!q) { sr.style.display = 'none'; return; }
  const hits = [];
  document.querySelectorAll('main section').forEach(sec => {
    const t = sec.textContent || '';
    const idx = t.toLowerCase().indexOf(q.toLowerCase());
    if (idx >= 0) {
      const h = sec.querySelector('h1,h2,h3');
      hits.push({ id: sec.id, title: h ? h.textContent.trim() : sec.id, snippet: t.slice(Math.max(0, idx-40), idx+80) });
    }
  });
  body.innerHTML = hits.length
    ? hits.slice(0, 20).map(h => `<a href="#${h.id}" style="display:block;padding:10px;border-bottom:1px solid #eee;text-decoration:none;color:inherit"><strong>${h.title}</strong><br><small>…${h.snippet}…</small></a>`).join('')
    : '<p style="padding:12px">אין תוצאות</p>';
  sr.style.display = 'block';
};

// Restore prefs on load
document.addEventListener('DOMContentLoaded', () => {
  try {
    if (localStorage.getItem('ma_dark') === '1') document.documentElement.classList.add('dark');
    const fp = localStorage.getItem('ma_font_px');
    if (fp) document.documentElement.style.fontSize = fp + 'px';
  } catch (_) {}
});

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
