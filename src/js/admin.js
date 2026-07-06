// admin.js — פאנל ניהול.
// שני מצבים:
//   1) LIVE  — worker פרוס. שולח ל-Cloudflare Worker.
//   2) LOCAL — worker לא פרוס. עורך מוריד JSON למחשב + שומר טיוטה ב-localStorage.
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const gate = $('adminGate');
  const dash = $('adminDashboard');
  const LS = 'ma_admin_v1';

  // Detect mode: try to hit /api/me. If fails → LOCAL.
  const API = window.__API__ || null;   // set to full URL when worker deployed
  let MODE = 'local';

  const store = {
    get()      { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; } },
    set(v)     { localStorage.setItem(LS, JSON.stringify(v)); },
    section(id, val) {
      const s = this.get(); s.sections = s.sections || {};
      if (val === undefined) return s.sections[id];
      s.sections[id] = val; this.set(s);
    },
    theme(val) {
      const s = this.get();
      if (val === undefined) return s.theme;
      s.theme = val; this.set(s);
    },
    struct(val) {
      const s = this.get();
      if (val === undefined) return s.sectionsOrder;
      s.sectionsOrder = val; this.set(s);
    }
  };

  async function api(path, opts = {}) {
    if (!API) throw Object.assign(new Error('local_mode'), { local: true });
    const res = await fetch(API + path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts
    });
    if (!res.ok) throw Object.assign(new Error('api_error'), { status: res.status });
    return res.json();
  }

  function show(msg, ok = true) {
    const el = $('adminAuthMsg');
    if (!el) return;
    el.textContent = msg;
    el.style.color = ok ? 'var(--primary)' : 'var(--danger)';
  }

  function showBanner(text) {
    if ($('adminBanner')) return;
    const b = document.createElement('div');
    b.id = 'adminBanner';
    b.style.cssText = 'background:#fef3c7;color:#78350f;padding:10px 16px;border-radius:8px;margin-bottom:16px;font-size:0.9rem';
    b.innerHTML = '<i class="bi bi-info-circle" aria-hidden="true"></i> ' + text;
    const dashEl = $('adminDashboard') || $('adminApp') || document.body;
    dashEl.insertBefore(b, dashEl.firstChild);
  }

  function download(name, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
  }

  // --- Bootstrap: decide LIVE vs LOCAL ---
  async function detectMode() {
    if (!API) { MODE = 'local'; return; }
    try { await api('/api/me'); MODE = 'live'; }
    catch (e) { if (e.status === 401) MODE = 'live'; else MODE = 'local'; }
  }

  // --- Local login (PIN) ---
  const LOCAL_PIN = () => localStorage.getItem('ma_admin_pin') || '4415';

  function unlockLocalAdmin() {
    gate.hidden = true;
    dash.hidden = false;
    $('adminUser').textContent = 'מנהל (מקומי)';
    $('adminRole').textContent = 'admin';
    showBanner('מצב מקומי — Worker לא פרוס. שינויים נשמרים בדפדפן ולהורדה כ-JSON. יש להעלות את הקבצים לגיט.');
    initDashboard();
  }

  // --- Wire auth buttons ---
  const requestBtn = $('adminRequestBtn');
  const verifyBtn = $('adminVerifyBtn');

  if (requestBtn) requestBtn.addEventListener('click', async () => {
    if (MODE === 'local') {
      $('adminCodeStep').hidden = false;
      show('מצב מקומי: הזינו PIN מנהל (4 ספרות)');
      return;
    }
    const phone = $('adminPhone').value.trim();
    const deliver = $('adminDeliver').value;
    if (!phone) return show('הזינו טלפון', false);
    try {
      await api('/api/auth/request', { method: 'POST', body: JSON.stringify({ phone, deliver }) });
      $('adminCodeStep').hidden = false;
      show(deliver === 'voice' ? 'שיחה קולית בדרך…' : 'קוד נשלח ב-SMS');
    } catch (e) {
      show(e.status === 403 ? 'הטלפון לא רשום כמנהל' : 'שליחה נכשלה', false);
    }
  });

  if (verifyBtn) verifyBtn.addEventListener('click', async () => {
    const code = $('adminCode').value.trim();
    if (MODE === 'local') {
      if (code === LOCAL_PIN()) return unlockLocalAdmin();
      return show('PIN שגוי', false);
    }
    const phone = $('adminPhone').value.trim();
    if (!/^\d{6}$/.test(code)) return show('קוד חייב 6 ספרות', false);
    try {
      const r = await api('/api/auth/verify', { method: 'POST', body: JSON.stringify({ phone, code }) });
      if (r.user.role !== 'admin') return show('אין הרשאת מנהל', false);
      $('adminUser').textContent = r.user.name;
      $('adminRole').textContent = r.user.role;
      gate.hidden = true;
      dash.hidden = false;
      initDashboard();
    } catch (e) {
      show(e.status === 401 ? 'קוד שגוי או פג תוקף' : 'שגיאה', false);
    }
  });

  const logoutBtn = $('adminLogout');
  if (logoutBtn) logoutBtn.addEventListener('click', async () => {
    if (MODE === 'live') await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    location.reload();
  });

  // --- Tabs ---
  document.querySelectorAll('.admin-tabs .tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tabs .tab').forEach(b => {
        b.classList.remove('active'); b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
      const which = btn.dataset.tab;
      document.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== which; });
    });
  });

  // --- Content editor ---
  async function loadSectionData(id) {
    // 1) local override wins
    const local = store.section(id);
    if (local) return local;
    // 2) live worker
    if (MODE === 'live') {
      try { const r = await api(`/api/content/${id}`); if (r.data) return r.data; } catch {}
    }
    // 3) shipped source of truth — sections config lives under /data/sections/
    return await fetch(`/data/sections/${id}.json`).then(r => r.ok ? r.json() : null).catch(() => null);
  }

  async function bindContentPicker() {
    const picker = $('sectionPicker');
    const area = $('sectionJson');
    if (!picker || !area) return;
    async function load() {
      const id = picker.value;
      const d = await loadSectionData(id);
      area.value = d ? JSON.stringify(d, null, 2) : '';
    }
    picker.addEventListener('change', load);
    load();
  }

  const saveBtn = $('saveContentBtn');
  if (saveBtn) saveBtn.addEventListener('click', async () => {
    const id = $('sectionPicker').value;
    const msg = $('saveMsg');
    let obj;
    try { obj = JSON.parse($('sectionJson').value); }
    catch { msg.textContent = 'JSON לא תקין'; msg.style.color = 'var(--danger)'; return; }
    store.section(id, obj);
    if (MODE === 'live') {
      try { await api(`/api/content/${id}`, { method: 'POST', body: JSON.stringify(obj) }); msg.textContent = 'נשמר לשרת ✓'; msg.style.color = 'var(--primary)'; return; }
      catch { /* fall through to download */ }
    }
    download(`${id}.json`, obj);
    msg.textContent = 'נשמר בדפדפן + הורד כ-JSON — העלה ידנית לתיקיית data/'; msg.style.color = 'var(--primary)';
  });

  // --- Theme ---
  const THEME_KEYS = [
    { key: 'primary',     label: 'צבע ראשי',     type: 'color', def: '#1a5c3a' },
    { key: 'primaryDark', label: 'ראשי כהה',      type: 'color', def: '#0f3a20' },
    { key: 'accent',      label: 'צבע דגש',       type: 'color', def: '#b09a4f' },
    { key: 'bg',          label: 'רקע',           type: 'color', def: '#ffffff' },
    { key: 'text',        label: 'טקסט',          type: 'color', def: '#1a1a1a' },
    { key: 'danger',      label: 'התראה',         type: 'color', def: '#dc2626' },
    { key: 'radius',      label: 'עיגול פינות (px)', type: 'text', def: '12px' }
  ];

  function bindTheme() {
    const c = $('themeControls');
    if (!c) return;
    c.innerHTML = '';
    const t = store.theme() || {};
    THEME_KEYS.forEach(k => {
      const val = t[k.key] || k.def;
      const wrap = document.createElement('label');
      wrap.style.display = 'block';
      wrap.innerHTML = `<span style="display:block;font-size:0.85rem;margin-bottom:4px">${k.label}</span>
        <input data-theme-key="${k.key}" value="${val}" type="${k.type}" style="width:100%;height:${k.type==='color'?'40px':'auto'};padding:6px;border:1px solid #ddd;border-radius:6px">`;
      c.appendChild(wrap);
    });
  }

  const saveThemeBtn = $('saveThemeBtn');
  if (saveThemeBtn) saveThemeBtn.addEventListener('click', async () => {
    const theme = {};
    document.querySelectorAll('[data-theme-key]').forEach(inp => { theme[inp.dataset.themeKey] = inp.value; });
    store.theme(theme);
    if (MODE === 'live') {
      try { await api('/api/content/__theme__', { method: 'POST', body: JSON.stringify(theme) }); alert('עיצוב נשמר לשרת'); return; }
      catch {}
    }
    download('theme.json', theme);
    alert('עיצוב נשמר בדפדפן + הורד כ-JSON');
  });

  // --- Structure ---
  async function bindStructure() {
    const list = $('structureList');
    if (!list) return;
    let sections;
    try {
      const local = store.struct();
      if (local && local.length) sections = local;
      else {
        const r = await fetch('/data/sections.json').catch(() => null);
        if (r && r.ok) sections = (await r.json()).sections;
      }
    } catch {}
    if (!sections) { list.innerHTML = '<li>לא ניתן לטעון מבנה</li>'; return; }
    list.innerHTML = '';
    sections.forEach(s => {
      const li = document.createElement('li');
      li.dataset.id = s.id;
      li.style.cssText = 'display:flex;gap:12px;align-items:center;padding:10px;background:#fff;border-radius:8px;margin-bottom:6px;box-shadow:0 1px 4px rgba(0,0,0,.05)';
      li.innerHTML = `<button data-move="up" aria-label="למעלה" style="background:none;border:1px solid #ddd;border-radius:4px;padding:2px 8px">▲</button>
        <button data-move="down" aria-label="למטה" style="background:none;border:1px solid #ddd;border-radius:4px;padding:2px 8px">▼</button>
        <span style="flex:1">${s.title}</span>
        <label><input type="checkbox" data-visible ${s.visible ? 'checked' : ''}> מוצג</label>`;
      list.appendChild(li);
    });
    list.addEventListener('click', e => {
      const btn = e.target.closest('button[data-move]');
      if (!btn) return;
      const li = btn.closest('li');
      if (btn.dataset.move === 'up' && li.previousElementSibling) li.parentNode.insertBefore(li, li.previousElementSibling);
      if (btn.dataset.move === 'down' && li.nextElementSibling) li.parentNode.insertBefore(li.nextElementSibling, li);
    });
  }

  const saveStructBtn = $('saveStructureBtn');
  if (saveStructBtn) saveStructBtn.addEventListener('click', async () => {
    const sections = [...document.querySelectorAll('#structureList li')].map((li, i) => ({
      id: li.dataset.id, order: i + 1, visible: li.querySelector('[data-visible]').checked
    }));
    store.struct(sections);
    if (MODE === 'live') {
      try { await api('/api/content/__sections__', { method: 'POST', body: JSON.stringify({ sections }) }); alert('מבנה נשמר לשרת'); return; }
      catch {}
    }
    download('sections.json', { sections });
    alert('מבנה נשמר בדפדפן + הורד כ-JSON');
  });

  // --- Announcements / Events (local editor) ---
  function makeCollectionEditor(rootId, key, newBtnId, defaultShape) {
    const root = $(rootId);
    if (!root) return;
    const newBtn = $(newBtnId);

    async function load() {
      const items = (store.get()[key] || await fetchInit(key));
      root.innerHTML = '';
      if (!items.length) { root.innerHTML = '<p><em>אין פריטים כרגע</em></p>'; return; }
      items.forEach((it, idx) => {
        const div = document.createElement('div');
        div.style.cssText = 'background:#fff;padding:12px;border-radius:8px;margin-bottom:8px;box-shadow:0 1px 4px rgba(0,0,0,.05)';
        div.innerHTML = `<div style="display:flex;justify-content:space-between"><strong>${escape(it.title || it.family || '(ללא כותרת)')}</strong>
          <button data-del="${idx}" style="background:var(--danger,#dc2626);color:#fff;border:0;border-radius:4px;padding:4px 8px">מחק</button></div>
          <p>${escape(it.body || it.desc || it.event || '')}</p>`;
        root.appendChild(div);
      });
    }
    async function fetchInit(k) {
      const r = await fetch(`/data/${k}.json`).catch(() => null);
      return r && r.ok ? await r.json() : [];
    }
    root.addEventListener('click', e => {
      const btn = e.target.closest('button[data-del]');
      if (!btn) return;
      const idx = Number(btn.dataset.del);
      const s = store.get();
      s[key] = s[key] || [];
      s[key].splice(idx, 1);
      store.set(s);
      load();
    });
    if (newBtn) newBtn.addEventListener('click', () => {
      const s = store.get();
      s[key] = s[key] || [];
      const obj = { ...defaultShape };
      Object.keys(obj).forEach(k => {
        const v = prompt(k, obj[k] || '');
        if (v !== null) obj[k] = v;
      });
      if (Object.values(obj).some(v => v)) {
        s[key].unshift(obj);
        store.set(s);
        download(`${key}.json`, s[key]);
        load();
      }
    });
    load();
  }

  function escape(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  function initDashboard() {
    bindContentPicker();
    bindTheme();
    bindStructure();
    makeCollectionEditor('announcementsList', 'announcements', 'newAnnouncementBtn', { title: '', body: '' });
    makeCollectionEditor('eventsList', 'events', 'newEventBtn', { title: '', date: '', location: '' });
  }

  // --- Boot ---
  detectMode().then(async () => {
    if (MODE === 'live') {
      try {
        const me = await api('/api/me');
        if (me.role === 'admin') {
          $('adminUser').textContent = me.name;
          $('adminRole').textContent = me.role;
          gate.hidden = true;
          dash.hidden = false;
          initDashboard();
        }
      } catch (_) { /* not signed in — stay on gate */ }
    } else {
      // LOCAL — show banner on gate and swap to PIN prompt
      const banner = document.createElement('div');
      banner.style.cssText = 'max-width:520px;margin:0 auto 16px;padding:12px;background:#fef3c7;color:#78350f;border-radius:8px;font-size:0.9rem';
      banner.innerHTML = '<i class="bi bi-info-circle" aria-hidden="true"></i> מצב מקומי — Worker לא פרוס. השינויים יישמרו בדפדפן שלך + יורדו כ-JSON להעלאה ידנית לגיט. PIN ברירת מחדל: <code>4415</code>.';
      gate.insertBefore(banner, gate.firstChild);
      const phoneInp = $('adminPhone'); if (phoneInp) phoneInp.placeholder = '(לא חובה במצב מקומי)';
    }
  });
})();
