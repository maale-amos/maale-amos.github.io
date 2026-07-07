// admin.js — פאנל ניהול. מדבר עם Cloudflare Worker.
// Auth: username + password → HttpOnly Secure session cookie מהשרת.
(function () {
  'use strict';

  const API = 'https://maale-amos-api.6742853.workers.dev';
  const $ = id => document.getElementById(id);
  const gate = $('adminGate');
  const dash = $('adminDashboard');

  async function api(path, opts = {}) {
    const res = await fetch(API + path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts
    });
    let body = null;
    try { body = await res.json(); } catch {}
    if (!res.ok) throw Object.assign(new Error('api_error'), { status: res.status, body });
    return body;
  }

  function show(msg, ok = true) {
    const el = $('adminAuthMsg'); if (!el) return;
    el.textContent = msg; el.style.color = ok ? 'var(--primary)' : 'var(--danger)';
  }

  // --- Login ---
  $('adminLoginBtn').addEventListener('click', async () => {
    const username = $('adminUsername').value.trim();
    const password = $('adminPassword').value;
    if (!username || !password) return show('הזינו שם משתמש וסיסמה', false);
    show('בודק…');
    try {
      const r = await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      unlock(r.user);
    } catch (e) {
      if (e.status === 401) show(e.body?.message || 'שם משתמש או סיסמה שגויים', false);
      else if (e.status === 429) show(e.body?.message || 'נסיונות רבים מדי — נסה שוב עוד דקה', false);
      else show('שגיאה מהשרת', false);
    }
  });
  // Enter key on password
  $('adminPassword').addEventListener('keydown', e => { if (e.key === 'Enter') $('adminLoginBtn').click(); });

  function unlock(user) {
    $('adminUser').textContent = user.username;
    $('adminRole').textContent = user.role;
    gate.hidden = true;
    dash.hidden = false;
    initDashboard();
  }

  // --- Logout ---
  $('adminLogout').addEventListener('click', async () => {
    try { await api('/api/admin/logout', { method: 'POST' }); } catch {}
    location.reload();
  });

  // --- Change password ---
  $('adminChangePwBtn').addEventListener('click', () => { $('adminChangePwDialog').hidden = false; });
  $('cancelChangePw').addEventListener('click', () => { $('adminChangePwDialog').hidden = true; });
  $('submitChangePw').addEventListener('click', async () => {
    const msg = $('changePwMsg');
    const oldPw = $('oldPw').value, newPw = $('newPw').value;
    if (!oldPw || newPw.length < 8) { msg.textContent = 'סיסמה חדשה חייבת 8 תווים לפחות'; msg.style.color = 'var(--danger)'; return; }
    try {
      await api('/api/admin/change-password', { method: 'POST', body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }) });
      msg.textContent = 'סיסמה עודכנה ✓'; msg.style.color = 'var(--primary)';
      $('oldPw').value = ''; $('newPw').value = '';
      setTimeout(() => { $('adminChangePwDialog').hidden = true; msg.textContent = ''; }, 1500);
    } catch (e) {
      msg.textContent = e.body?.message || 'שגיאה'; msg.style.color = 'var(--danger)';
    }
  });

  // --- Bootstrap on load: check session ---
  async function bootstrap() {
    try {
      const me = await api('/api/me');
      unlock(me);
    } catch { /* not signed in */ }
  }

  // --- Tabs ---
  document.querySelectorAll('.admin-tabs .tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tabs .tab').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('active'); btn.setAttribute('aria-selected','true');
      const which = btn.dataset.tab;
      document.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== which; });
    });
  });

  // --- Content editor ---
  async function loadSection(id) {
    let obj = null;
    try {
      const r = await api(`/api/content/${id}`);
      obj = r.data;
    } catch {}
    if (!obj) {
      try { const res = await fetch(`/data/sections/${id}.json`); if (res.ok) obj = await res.json(); } catch {}
    }
    $('sectionJson').value = obj ? JSON.stringify(obj, null, 2) : '';
  }
  $('sectionPicker').addEventListener('change', e => loadSection(e.target.value));
  $('saveContentBtn').addEventListener('click', async () => {
    const id = $('sectionPicker').value;
    const msg = $('saveMsg');
    let obj;
    try { obj = JSON.parse($('sectionJson').value); }
    catch { msg.textContent = 'JSON לא תקין'; msg.style.color = 'var(--danger)'; return; }
    try {
      await api(`/api/content/${id}`, { method: 'POST', body: JSON.stringify(obj) });
      msg.textContent = 'נשמר ✓'; msg.style.color = 'var(--primary)';
    } catch (e) {
      msg.textContent = 'שמירה נכשלה' + (e.status === 401 ? ' — יש להתחבר מחדש' : ''); msg.style.color = 'var(--danger)';
    }
  });

  // --- Theme editor ---
  const THEME_KEYS = [
    { key: 'primary',     label: 'צבע ראשי',       type: 'color', def: '#1a5c3a' },
    { key: 'primaryDark', label: 'ראשי כהה',        type: 'color', def: '#0f3a20' },
    { key: 'accent',      label: 'צבע דגש',         type: 'color', def: '#b09a4f' },
    { key: 'bg',          label: 'רקע',             type: 'color', def: '#ffffff' },
    { key: 'text',        label: 'טקסט',            type: 'color', def: '#1a1a1a' },
    { key: 'danger',      label: 'התראה',           type: 'color', def: '#dc2626' },
    { key: 'radius',      label: 'עיגול פינות (px)', type: 'text',  def: '12px' }
  ];
  function bindTheme() {
    const c = $('themeControls'); if (!c) return;
    c.innerHTML = '';
    THEME_KEYS.forEach(k => {
      const w = document.createElement('label');
      w.innerHTML = `<span style="display:block;font-size:0.85rem;margin-bottom:4px">${k.label}</span>
        <input data-theme-key="${k.key}" value="${k.def}" type="${k.type}" style="width:100%;height:${k.type==='color'?'40px':'auto'};padding:6px;border:1px solid #ddd;border-radius:6px">`;
      c.appendChild(w);
    });
  }
  $('saveThemeBtn').addEventListener('click', async () => {
    const theme = {};
    document.querySelectorAll('[data-theme-key]').forEach(inp => { theme[inp.dataset.themeKey] = inp.value; });
    try { await api('/api/content/__theme__', { method: 'POST', body: JSON.stringify(theme) }); alert('עיצוב נשמר'); }
    catch (e) { alert('שמירה נכשלה' + (e.status===401?' — התחבר מחדש':'')); }
  });

  // --- Structure ---
  async function bindStructure() {
    const list = $('structureList'); if (!list) return;
    let sections;
    try { const r = await fetch('/data/sections.json'); if (r.ok) sections = (await r.json()).sections; } catch {}
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
  $('saveStructureBtn').addEventListener('click', async () => {
    const sections = [...document.querySelectorAll('#structureList li')].map((li, i) => ({
      id: li.dataset.id, order: i + 1, visible: li.querySelector('[data-visible]').checked
    }));
    try { await api('/api/content/__sections__', { method: 'POST', body: JSON.stringify({ sections }) }); alert('מבנה נשמר'); }
    catch (e) { alert('שמירה נכשלה' + (e.status===401?' — התחבר מחדש':'')); }
  });

  function initDashboard() {
    bindTheme();
    bindStructure();
    loadSection($('sectionPicker').value);
  }

  bootstrap();
})();
