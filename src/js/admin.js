// admin.js — פאנל ניהול. מדבר עם Cloudflare Worker (Phase 3).
(function () {
  'use strict';

  const API = window.__API__ || 'https://maale-amos-api.workers.dev';
  const $ = id => document.getElementById(id);
  const gate = $('adminGate');
  const dash = $('adminDashboard');

  async function api(path, opts = {}) {
    const res = await fetch(API + path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      ...opts
    });
    if (!res.ok) throw Object.assign(new Error('api_error'), { status: res.status, body: await res.text().catch(() => '') });
    return res.json();
  }

  function show(msg, ok = true) {
    const el = $('adminAuthMsg');
    if (!el) return;
    el.textContent = msg;
    el.style.color = ok ? 'var(--primary)' : 'var(--danger)';
  }

  // --- Auth flow ---
  $('adminRequestBtn').addEventListener('click', async () => {
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

  $('adminVerifyBtn').addEventListener('click', async () => {
    const phone = $('adminPhone').value.trim();
    const code  = $('adminCode').value.trim();
    if (!/^\d{6}$/.test(code)) return show('קוד חייב 6 ספרות', false);
    try {
      const r = await api('/api/auth/verify', { method: 'POST', body: JSON.stringify({ phone, code }) });
      if (r.user.role !== 'admin') return show('אין הרשאת מנהל', false);
      $('adminUser').textContent = r.user.name;
      $('adminRole').textContent = r.user.role;
      gate.hidden = true;
      dash.hidden = false;
      await initDashboard();
    } catch (e) {
      show(e.status === 401 ? 'קוד שגוי או פג תוקף' : 'שגיאה', false);
    }
  });

  $('adminLogout').addEventListener('click', async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    location.reload();
  });

  // --- On load: check existing session ---
  async function bootstrap() {
    try {
      const me = await api('/api/me');
      if (me.role === 'admin') {
        $('adminUser').textContent = me.name;
        $('adminRole').textContent = me.role;
        gate.hidden = true;
        dash.hidden = false;
        await initDashboard();
      }
    } catch (_) { /* not signed in */ }
  }
  bootstrap();

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
  async function loadSection(id) {
    try {
      const r = await api(`/api/content/${id}`);
      $('sectionJson').value = JSON.stringify(r.data || {}, null, 2);
    } catch (_) {
      $('sectionJson').value = '';
    }
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
      msg.textContent = 'שמירה נכשלה'; msg.style.color = 'var(--danger)';
    }
  });

  // --- Theme editor ---
  const THEME_KEYS = [
    { key: 'primary',     label: 'צבע ראשי',     type: 'color' },
    { key: 'primaryDark', label: 'ראשי כהה',      type: 'color' },
    { key: 'accent',      label: 'צבע דגש',       type: 'color' },
    { key: 'bg',          label: 'רקע',           type: 'color' },
    { key: 'text',        label: 'טקסט',          type: 'color' },
    { key: 'danger',      label: 'התראה',         type: 'color' },
    { key: 'radius',      label: 'עיגול פינות',   type: 'text' }
  ];

  function initDashboard() {
    // theme controls
    const c = $('themeControls'); c.innerHTML = '';
    THEME_KEYS.forEach(k => {
      const wrap = document.createElement('label');
      wrap.style.display = 'block';
      wrap.innerHTML = `<span style="display:block;font-size:0.85rem;margin-bottom:4px">${k.label}</span>
        <input data-theme-key="${k.key}" type="${k.type}" style="width:100%;height:${k.type==='color'?'40px':'auto'};padding:6px;border:1px solid #ddd;border-radius:6px">`;
      c.appendChild(wrap);
    });
    loadSection($('sectionPicker').value);
    loadStructure();
  }

  $('saveThemeBtn') && $('saveThemeBtn').addEventListener('click', async () => {
    const theme = {};
    document.querySelectorAll('[data-theme-key]').forEach(inp => {
      theme[inp.dataset.themeKey] = inp.value;
    });
    try {
      await api('/api/content/__theme__', { method: 'POST', body: JSON.stringify(theme) });
      alert('עיצוב נשמר');
    } catch { alert('שמירה נכשלה'); }
  });

  // --- Structure editor (order + visible) ---
  async function loadStructure() {
    const list = $('structureList');
    if (!list) return;
    let sections;
    try {
      const r = await api('/api/content/__sections__');
      sections = r.data && r.data.sections;
    } catch { sections = null; }
    if (!sections) {
      try {
        const res = await fetch('/_data/sections.json');
        sections = (await res.json()).sections;
      } catch { list.innerHTML = '<li>לא ניתן לטעון מבנה</li>'; return; }
    }
    list.innerHTML = '';
    sections.forEach(s => {
      const li = document.createElement('li');
      li.draggable = true;
      li.dataset.id = s.id;
      li.style.cssText = 'display:flex;gap:12px;align-items:center;padding:10px;background:#fff;border-radius:8px;margin-bottom:6px;box-shadow:0 1px 4px rgba(0,0,0,.05);cursor:move';
      li.innerHTML = `<i class="bi bi-grip-vertical"></i>
        <span style="flex:1"><strong>#${s.order}</strong> ${s.title}</span>
        <label><input type="checkbox" data-visible ${s.visible ? 'checked' : ''}> מוצג</label>`;
      list.appendChild(li);
    });
  }

  $('saveStructureBtn') && $('saveStructureBtn').addEventListener('click', async () => {
    const sections = [...document.querySelectorAll('#structureList li')].map((li, i) => ({
      id: li.dataset.id,
      order: i + 1,
      visible: li.querySelector('[data-visible]').checked
    }));
    try {
      await api('/api/content/__sections__', { method: 'POST', body: JSON.stringify({ sections }) });
      alert('מבנה נשמר');
    } catch { alert('שמירה נכשלה'); }
  });
})();
