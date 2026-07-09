// admin.js — פאנל ניהול. מדבר עם Cloudflare Worker ישירות.
// API_BASE נקבע ב-src/js/config.js (window.API_BASE) — לא לקבע כאן דומיין.
// אחרי מעבר ל-Custom Domain: מספיק לעדכן את config.js או meta ma-api-base.
(function () {
  'use strict';

  const API_BASE = (window.API_BASE || '').replace(/\/+$/, '');

  const $ = id => document.getElementById(id);
  const gate = $('adminGate');
  const dash = $('adminDashboard');

  const TOKEN_KEY = 'ma_admin_session_token';
  function getToken()   { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } }
  function setToken(t)  { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {} }

  async function api(path, opts = {}) {
    // text/plain avoids CORS preflight (application/json triggers OPTIONS
    // which some filters block even when POST passes). Worker's request.json()
    // parses the body regardless of Content-Type.
    const headers = { 'Content-Type': 'text/plain;charset=utf-8', ...(opts.headers || {}) };
    const tok = getToken();
    if (tok) headers['Authorization'] = 'Bearer ' + tok;
    let res;
    try {
      res = await fetch(API_BASE + path, { ...opts, headers });
    } catch (netErr) {
      throw Object.assign(new Error('network_error'), {
        status: 0,
        cause: String(netErr && netErr.message || netErr)
      });
    }
    let bodyJson = null; try { bodyJson = await res.json(); } catch {}
    if (!res.ok) throw Object.assign(new Error('api_error'), { status: res.status, body: bodyJson });
    return bodyJson;
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
      if (r.sessionToken) setToken(r.sessionToken);
      unlock(r.user);
    } catch (e) {
      if (e.status === 401) show(e.body?.message || 'שם משתמש או סיסמה שגויים', false);
      else if (e.status === 429) show(e.body?.message || 'נסיונות רבים מדי — נסה שוב עוד דקה', false);
      else if (e.status === 0) show('בעיית רשת / CORS — פרטים: ' + (e.cause || 'unknown') + ' (בדוק Console+Network)', false);
      else show('שגיאה מהשרת (סטטוס ' + (e.status || '?') + '): ' + (e.body?.message || e.body?.error || 'unknown'), false);
    }
  });
  // Enter key on password
  $('adminPassword').addEventListener('keydown', e => { if (e.key === 'Enter') $('adminLoginBtn').click(); });

  // --- Connection self-test (helps diagnose CORS/NetFree issues from browser) ---
  const diagBtn = $('adminDiagBtn');
  const diagOut = $('adminDiagOut');
  if (diagBtn && diagOut) {
    diagBtn.addEventListener('click', async () => {
      diagOut.hidden = false;
      diagOut.textContent = 'בודק…\n';
      const lines = [];
      const now = new Date().toISOString();
      lines.push(`Time: ${now}`);
      lines.push(`Origin: ${location.origin}`);
      lines.push(`Direct URL: ${API_BASE}`);
      lines.push('');
      // Test 1: /api/me GET — simple request, no preflight, expects 401 with CORS
      lines.push('--- Test 1: GET /api/me (should return 401 with CORS) ---');
      try {
        const res = await fetch(API_BASE + '/api/me', { method: 'GET' });
        lines.push(`Status: ${res.status} ${res.statusText}`);
        lines.push(`ACAO:   ${res.headers.get('access-control-allow-origin') || '(missing!)'}`);
        lines.push(`ACAC:   ${res.headers.get('access-control-allow-credentials') || '(missing)'}`);
        const t = await res.text();
        lines.push(`Body:   ${t.slice(0, 200)}`);
      } catch (e) {
        lines.push(`✗ Network/CORS error: ${e.name}: ${e.message}`);
        lines.push('  → הדפדפן דחה את הבקשה. פתח DevTools → Network → בדוק אם הבקשה נשלחה בכלל.');
      }
      lines.push('');
      // Test 2: POST /api/admin/login with text/plain (should return 401 with CORS)
      lines.push('--- Test 2: POST /api/admin/login (bad creds — should return 401 with CORS) ---');
      try {
        const res = await fetch(API_BASE + '/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ username: '__diag__', password: '__diag__' })
        });
        lines.push(`Status: ${res.status} ${res.statusText}`);
        lines.push(`ACAO:   ${res.headers.get('access-control-allow-origin') || '(missing!)'}`);
        const t = await res.text();
        lines.push(`Body:   ${t.slice(0, 200)}`);
      } catch (e) {
        lines.push(`✗ Network/CORS error: ${e.name}: ${e.message}`);
      }
      diagOut.textContent = lines.join('\n');
    });
  }

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
    setToken('');
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
      // SECURITY: build DOM nodes with textContent to prevent XSS via s.title.
      // s.title comes from JSON that could be attacker-influenced (H-M2 in audit).
      const btnUp   = document.createElement('button');
      btnUp.dataset.move = 'up'; btnUp.setAttribute('aria-label','למעלה');
      btnUp.style.cssText = 'background:none;border:1px solid #ddd;border-radius:4px;padding:2px 8px';
      btnUp.textContent = '▲';
      const btnDn   = document.createElement('button');
      btnDn.dataset.move = 'down'; btnDn.setAttribute('aria-label','למטה');
      btnDn.style.cssText = 'background:none;border:1px solid #ddd;border-radius:4px;padding:2px 8px';
      btnDn.textContent = '▼';
      const span    = document.createElement('span');
      span.style.flex = '1';
      span.textContent = String(s.title || '');
      const lbl     = document.createElement('label');
      const chk     = document.createElement('input');
      chk.type = 'checkbox'; chk.dataset.visible = ''; chk.checked = !!s.visible;
      lbl.append(chk, document.createTextNode(' מוצג'));
      li.append(btnUp, btnDn, span, lbl);
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
