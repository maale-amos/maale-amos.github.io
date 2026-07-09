// klita.js — client for the community registration + acceptance-committee
// flow. Talks to the maale-amos-api Worker via /api/klita/*.
// - Auto-fills forms from the user's stored applicant record (D1).
// - Saves drafts; final submission redirects to a print view for signing.
// - Never mutates innerHTML with data — DOM builders + textContent everywhere.
(function () {
  'use strict';

  // API_BASE from src/js/config.js (window.API_BASE). Never hardcode here.
  const API_BASE = (window.API_BASE || '').replace(/\/+$/, '');
  const TOKEN_KEY = 'ma_klita_session_token';
  const $ = (id) => document.getElementById(id);
  const q = (sel, root) => (root || document).querySelector(sel);
  const qa = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } }
  function setToken(t) { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {} }

  async function api(path, opts = {}) {
    // text/plain avoids CORS preflight; Worker's request.json() parses regardless.
    const headers = { 'Content-Type': 'text/plain;charset=utf-8', ...(opts.headers || {}) };
    const tok = getToken();
    if (tok) headers['Authorization'] = 'Bearer ' + tok;
    let res;
    try {
      res = await fetch(API_BASE + path, { ...opts, headers });
    } catch (netErr) {
      throw Object.assign(new Error('network_error'), { status: 0, cause: String(netErr && netErr.message || netErr) });
    }
    let bodyJson = null; try { bodyJson = await res.json(); } catch {}
    if (!res.ok) throw Object.assign(new Error('api_error'), { status: res.status, body: bodyJson });
    return bodyJson;
  }

  // --------- Views ----------
  const VIEWS = ['welcome', 'register', 'login', 'portal', 'applicant', 'questionnaire', 'print', 'uploads', 'committee'];
  function showView(name) {
    qa('[data-view]').forEach(el => { el.hidden = (el.dataset.view !== name); });
    const app = $('klitaApp'); if (app) app.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (history.replaceState) history.replaceState(null, '', '#/' + name);
  }

  function msg(text, ok = true) {
    const el = $('klitaMsg'); if (!el) return;
    el.textContent = text || '';
    el.style.color = ok ? '#1a5c3a' : '#c62828';
  }

  // --------- State ----------
  let ME = null; // { applicant, forms, user }

  // --------- Init: wire nav buttons ----------
  qa('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => go(btn.dataset.goto));
  });

  async function go(view) {
    msg('');
    if (['portal','questionnaire','applicant','uploads','committee'].includes(view)) {
      if (!getToken()) return showView('welcome');
      if (!ME) { try { await refreshMe(); } catch (_) { return; } }
    }
    if (view === 'portal')        renderPortal();
    if (view === 'applicant')     renderApplicant();
    if (view === 'questionnaire') renderQuestionnaire();
    if (view === 'uploads')       renderUploads();
    if (view === 'committee')     renderCommittee();
    showView(view);
  }

  async function refreshMe() {
    try {
      ME = await api('/api/klita/me', { method: 'GET' });
    } catch (e) {
      if (e.status === 401) { setToken(''); ME = null; showView('welcome'); }
      throw e;
    }
  }

  // --------- Register ----------
  $('regSubmit').addEventListener('click', async () => {
    const body = {
      email:        $('reg_email').value.trim(),
      password:     $('reg_password').value,
      family_name:  $('reg_family_name').value.trim(),
      husband_name: $('reg_husband_name').value.trim(),
      wife_name:    $('reg_wife_name').value.trim(),
      husband_id:   $('reg_husband_id').value.trim(),
      wife_id:      $('reg_wife_id').value.trim(),
      phone:        $('reg_phone').value.trim(),
      track:        $('reg_track').value,
      address:      $('reg_address').value.trim()
    };
    if (!body.email || !body.password || !body.family_name) return msg('חובה: דוא״ל, סיסמה, שם משפחה', false);
    if (body.password.length < 10) return msg('סיסמה חייבת להיות באורך 10 תווים לפחות', false);
    msg('פותח תיק…');
    try {
      const r = await api('/api/klita/register', { method: 'POST', body: JSON.stringify(body) });
      if (r.sessionToken) setToken(r.sessionToken);
      msg('בעז״ה נפתח תיק — ממשיכים לפורטל');
      await refreshMe();
      go('portal');
    } catch (e) {
      if (e.status === 409) msg('הכתובת כבר רשומה — נסו להתחבר', false);
      else if (e.status === 400) msg('נתונים לא תקינים: ' + (e.body && e.body.message || 'בדוק שוב'), false);
      else if (e.status === 429) msg('נסיונות רבים — נסו שוב עוד שעה', false);
      else if (e.status === 0)  msg('בעיית רשת — נסו שוב', false);
      else msg('שגיאה', false);
    }
  });

  // --------- Login ----------
  $('loginSubmit').addEventListener('click', async () => {
    const username = $('login_email').value.trim();
    const password = $('login_password').value;
    if (!username || !password) return msg('הזינו דוא״ל וסיסמה', false);
    msg('בודק…');
    try {
      const r = await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      if (r.sessionToken) setToken(r.sessionToken);
      await refreshMe();
      msg('שלום ' + (r.user && r.user.username));
      go('portal');
    } catch (e) {
      if (e.status === 401)      msg('דוא״ל או סיסמה שגויים', false);
      else if (e.status === 429) msg('נסיונות רבים — נסו עוד רגע', false);
      else if (e.status === 0)   msg('בעיית רשת', false);
      else msg('שגיאה', false);
    }
  });

  // --------- Portal ----------
  const STAGES = [
    'פנייה ראשונית וסיור',
    'שאלון וממליצים',
    'ועדת היכרות יישובית',
    'חתימת מסמכי היישוב',
    'אבחון מקצועי',
    'ועדת קבלה אזורית',
    'עסקת הנכס',
    'תשלומים והקמת הו״ק',
    'טפסי החטיבה להתיישבות',
    'מפתח ואכלוס'
  ];

  function renderPortal() {
    const nameEl = $('portalUserName');
    const statusEl = $('portalStatus');
    const stagesEl = $('portalStages');
    const formsEl = $('portalForms');
    const badgeEl = $('autofillBadge');
    const badgeSummary = $('autofillSummary');
    const committeeBtn = $('portalCommitteeBtn');
    nameEl.textContent = (ME.applicant && ME.applicant.family_name) || (ME.user && ME.user.username) || '';
    const status = (ME.applicant && ME.applicant.status) || 'pending';
    statusEl.textContent = ({
      pending: 'ממתין',
      in_review: 'בבדיקת ועדה',
      approved: 'אושר',
      rejected: 'נדחה',
      archived: 'ארכיון'
    })[status] || status;

    // Highlight auto-fill: show a green badge that summarizes the fields the
    // portal will pre-populate on the next form. Empty when nothing yet.
    if (badgeEl && badgeSummary) {
      const a = ME.applicant;
      const bits = [];
      if (a) {
        if (a.husband_name) bits.push('שם הבעל: ' + a.husband_name);
        if (a.wife_name)    bits.push('שם האישה: ' + a.wife_name);
        if (a.husband_id)   bits.push('ת״ז הבעל');
        if (a.wife_id)      bits.push('ת״ז האישה');
        if (a.phone)        bits.push('טלפון: ' + a.phone);
      }
      if (bits.length) {
        badgeEl.hidden = false;
        badgeSummary.textContent = 'נשמרים: ' + bits.join(' · ');
      } else {
        badgeEl.hidden = true;
      }
    }

    // Committee button visible only for role=committee/admin.
    if (committeeBtn) {
      const role = ME.user && ME.user.role;
      committeeBtn.hidden = !(role === 'committee' || role === 'admin');
      committeeBtn.onclick = () => go('committee');
    }

    // Forms list
    formsEl.replaceChildren();
    if (!ME.forms || !ME.forms.length) {
      const p = document.createElement('p');
      p.textContent = 'עדיין לא הוגשו טפסים.';
      formsEl.append(p);
    } else {
      const ul = document.createElement('ul');
      ul.style.cssText = 'list-style:none;padding:0';
      ME.forms.forEach(f => {
        const li = document.createElement('li');
        li.style.cssText = 'padding:8px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center';
        const label = document.createElement('span');
        label.textContent = ({
          questionnaire: 'שאלון הרשמה',
          medical: 'טופס בריאות',
          financial: 'טופס פיננסי',
          stage: 'טופס שלב'
        })[f.form_type] || f.form_type;
        const status = document.createElement('small');
        status.className = 'verify-badge';
        status.textContent = ({
          draft: 'טיוטה',
          submitted: 'הוגש',
          signed: 'חתום',
          approved: 'אושר',
          rejected: 'נדחה'
        })[f.status] || f.status;
        li.append(label, status);
        ul.append(li);
      });
      formsEl.append(ul);
    }

    // Stages
    stagesEl.replaceChildren();
    const current = (ME.applicant && ME.applicant.current_stage) || 1;
    STAGES.forEach((s, i) => {
      const li = document.createElement('li');
      li.style.cssText = 'padding:4px 0';
      if (i + 1 < current)      li.style.color = '#1a5c3a';
      else if (i + 1 === current) li.style.fontWeight = '600';
      else li.style.color = '#999';
      li.textContent = s + (i + 1 === current ? '  ← שלב נוכחי' : '');
      stagesEl.append(li);
    });
  }

  // Auto-logout
  $('portalLogout').addEventListener('click', async () => {
    try { await api('/api/admin/logout', { method: 'POST' }); } catch {}
    setToken(''); ME = null;
    showView('welcome');
  });

  // --------- Applicant edit ----------
  const APPLICANT_FIELDS = [
    { key: 'family_name',  label: 'שם המשפחה*', required: true },
    { key: 'husband_name', label: 'שם הבעל' },
    { key: 'wife_name',    label: 'שם האישה' },
    { key: 'husband_id',   label: 'ת.ז. הבעל', pattern: '\\d{5,9}' },
    { key: 'wife_id',      label: 'ת.ז. האישה', pattern: '\\d{5,9}' },
    { key: 'phone',        label: 'טלפון', type: 'tel' },
    { key: 'email',        label: 'דוא״ל ליצירת קשר', type: 'email' },
    { key: 'address',      label: 'כתובת נוכחית' },
    { key: 'track',        label: 'מסלול', type: 'select', options: [
        { v: 'buy', l: 'רכישת דירה' },
        { v: 'rent', l: 'שכירות' },
        { v: 'plot', l: 'מגרש/בניה עצמית' }
      ]}
  ];

  function renderApplicant() {
    const root = $('applicantForm');
    root.replaceChildren();
    const cur = ME.applicant || {};
    APPLICANT_FIELDS.forEach(f => {
      const wrap = document.createElement('label');
      const span = document.createElement('span');
      span.textContent = f.label;
      wrap.append(span);
      let input;
      if (f.type === 'select') {
        input = document.createElement('select');
        f.options.forEach(o => {
          const opt = document.createElement('option');
          opt.value = o.v; opt.textContent = o.l;
          if ((cur[f.key] || 'buy') === o.v) opt.selected = true;
          input.append(opt);
        });
      } else {
        input = document.createElement('input');
        input.type = f.type || 'text';
        if (f.pattern) input.pattern = f.pattern;
        input.value = cur[f.key] || '';
      }
      input.id = 'app_' + f.key;
      wrap.append(input);
      root.append(wrap);
    });
  }

  $('applicantSave').addEventListener('click', async () => {
    const payload = {};
    APPLICANT_FIELDS.forEach(f => { payload[f.key] = $('app_' + f.key).value.trim(); });
    if (!payload.family_name) return msg('שם המשפחה חובה', false);
    msg('שומר…');
    try {
      await api('/api/klita/applicant', { method: 'POST', body: JSON.stringify(payload) });
      await refreshMe();
      msg('נשמר בעז״ה');
      go('portal');
    } catch (e) {
      msg('שמירה נכשלה: ' + (e.body && e.body.message || e.status), false);
    }
  });

  // --------- Questionnaire ----------
  // Mirrors the original klita-maale-amos questionnaire, extended with the
  // applicant auto-fill so the family never re-types names / IDs / phones.
  const Q_SECTIONS = [
    {
      title: 'פרטי המשפחה',
      fields: [
        { k: 'family_name',       l: 'שם המשפחה*', autofill: 'family_name' },
        { k: 'husband_name',      l: 'שם הבעל', autofill: 'husband_name' },
        { k: 'wife_name',         l: 'שם האישה', autofill: 'wife_name' },
        { k: 'husband_id',        l: 'ת.ז. הבעל', autofill: 'husband_id' },
        { k: 'wife_id',           l: 'ת.ז. האישה', autofill: 'wife_id' },
        { k: 'husband_birth',     l: 'תאריך לידה — הבעל', t: 'date' },
        { k: 'wife_birth',        l: 'תאריך לידה — האישה', t: 'date' },
        { k: 'husband_country',   l: 'ארץ לידה — הבעל' },
        { k: 'wife_country',      l: 'ארץ לידה — האישה' },
        { k: 'phone',             l: 'טלפון', t: 'tel', autofill: 'phone' },
        { k: 'address',           l: 'כתובת נוכחית', autofill: 'address' }
      ]
    },
    {
      title: 'הורים ולימודים',
      fields: [
        { k: 'husband_parents', l: 'שמות הורי הבעל וכתובתם', t: 'textarea' },
        { k: 'wife_parents',    l: 'שמות הורי האישה וכתובתם', t: 'textarea' },
        { k: 'husband_studies', l: 'מוסדות לימוד — הבעל', t: 'textarea' },
        { k: 'wife_studies',    l: 'מוסדות לימוד — האישה', t: 'textarea' },
        { k: 'kolel',           l: 'כולל / מקום עבודה + שם ראש הכולל/מנהל', t: 'textarea' }
      ]
    },
    {
      title: 'ילדים ומצב מיוחד',
      fields: [
        { k: 'children',      l: 'פרטי הילדים שיחיו (שם, ת.ז., כיתה)', t: 'textarea' },
        { k: 'special_notes', l: 'מצב רפואי/חינוכי מיוחד (אם רלוונטי)', t: 'textarea' }
      ]
    },
    {
      title: 'המניע',
      fields: [
        { k: 'how_heard',         l: 'היכן שמעתם על היישוב' },
        { k: 'why_here',          l: 'מדוע ברצונכם לגור בו', t: 'textarea' },
        { k: 'current_community', l: 'בית הכנסת והקהילה הנוכחית', t: 'textarea' }
      ]
    },
    {
      title: 'ממליצים',
      fields: [
        { k: 'ref_husband_1', l: 'ממליץ לבעל (1) — שם, טלפון, קשר' },
        { k: 'ref_husband_2', l: 'ממליץ לבעל (2) — שם, טלפון, קשר' },
        { k: 'ref_wife_1',    l: 'ממליצה לאישה (1)' },
        { k: 'ref_wife_2',    l: 'ממליצה לאישה (2)' },
        { k: 'ref_posek',     l: 'הרב הפוסק של המשפחה — שם וטלפון' }
      ]
    }
  ];

  let CURRENT_FORM_ID = null; // if we're editing a draft

  function renderQuestionnaire() {
    const root = $('questionnaireForm');
    root.replaceChildren();

    // Find existing draft for this form_type
    const draft = (ME.forms || []).find(f => f.form_type === 'questionnaire' && f.status === 'draft');
    CURRENT_FORM_ID = draft ? draft.id : null;

    // If draft exists we'll load its saved data async; otherwise seed from applicant
    const seed = seedFromApplicant();

    Q_SECTIONS.forEach(sec => {
      const box = document.createElement('fieldset');
      box.style.cssText = 'border:1px solid #ddd;border-radius:8px;padding:12px;margin-bottom:16px';
      const lg = document.createElement('legend');
      lg.textContent = sec.title;
      lg.style.padding = '0 8px';
      box.append(lg);
      sec.fields.forEach(f => {
        const wrap = document.createElement('label');
        wrap.style.display = 'block'; wrap.style.marginBottom = '10px';
        const span = document.createElement('span');
        span.textContent = f.l;
        wrap.append(span);
        let input;
        if (f.t === 'textarea') {
          input = document.createElement('textarea');
          input.rows = 2;
        } else {
          input = document.createElement('input');
          input.type = f.t || 'text';
        }
        input.id = 'q_' + f.k;
        input.dataset.qkey = f.k;
        if (f.autofill && seed[f.autofill]) input.value = seed[f.autofill];
        wrap.append(input);
        box.append(wrap);
      });
      root.append(box);
    });

    // If there's a saved draft, override seed with saved values
    if (CURRENT_FORM_ID) {
      api('/api/klita/form/' + CURRENT_FORM_ID, { method: 'GET' }).then(r => {
        const data = (r.form && r.form.form_data) || {};
        Object.keys(data).forEach(k => {
          const el = document.getElementById('q_' + k);
          if (el) el.value = data[k];
        });
      }).catch(() => {});
    }
  }

  function seedFromApplicant() {
    const a = ME.applicant || {};
    return {
      family_name: a.family_name || '',
      husband_name: a.husband_name || '',
      wife_name: a.wife_name || '',
      husband_id: a.husband_id || '',
      wife_id: a.wife_id || '',
      phone: a.phone || '',
      address: a.address || ''
    };
  }

  function collectQ() {
    const out = {};
    qa('#questionnaireForm [data-qkey]').forEach(el => { out[el.dataset.qkey] = el.value.trim(); });
    return out;
  }

  async function saveQ(status) {
    const form_data = collectQ();
    if (!form_data.family_name) { msg('שם המשפחה חובה', false); return null; }
    msg(status === 'draft' ? 'שומר טיוטה…' : 'שולח…');
    try {
      const r = await api('/api/klita/form', {
        method: 'POST',
        body: JSON.stringify({
          form_type: 'questionnaire',
          status,
          form_data,
          form_id: CURRENT_FORM_ID || undefined
        })
      });
      CURRENT_FORM_ID = r.form_id;
      await refreshMe();
      msg(status === 'draft' ? 'נשמר בעז״ה' : 'הוגש בעז״ה');
      return r;
    } catch (e) {
      msg('שגיאה: ' + (e.body && e.body.message || e.status), false);
      return null;
    }
  }

  $('qDraft').addEventListener('click', async () => { await saveQ('draft'); });
  $('qSubmit').addEventListener('click', async () => {
    const r = await saveQ('submitted');
    if (r) { renderPrint(); go('print'); }
  });

  // --------- Print view ----------
  function renderPrint() {
    const area = $('printArea');
    area.replaceChildren();

    const h = document.createElement('h1');
    h.textContent = 'שאלון הרשמה — קהילת קודש מעלה עמוס יצ״ו';
    area.append(h);

    const sub = document.createElement('p');
    sub.textContent = 'תאריך: ' + new Date().toLocaleDateString('he-IL');
    area.append(sub);

    const data = collectQ();
    Q_SECTIONS.forEach(sec => {
      const h2 = document.createElement('h3');
      h2.textContent = sec.title;
      area.append(h2);
      sec.fields.forEach(f => {
        const div = document.createElement('div');
        div.className = 'qfield';
        const lbl = document.createElement('div');
        lbl.className = 'qlabel';
        lbl.textContent = f.l;
        const val = document.createElement('div');
        val.textContent = data[f.k] || '—';
        div.append(lbl, val);
        area.append(div);
      });
    });

    // Signature block — DOM builders only, no innerHTML with data.
    const sig = document.createElement('div');
    sig.className = 'qsig';
    const p1 = document.createElement('p');
    p1.textContent = 'אני החתום מטה מצהיר/ה שכל הפרטים לעיל נכונים.';
    const sigRow = document.createElement('table');
    sigRow.style.cssText = 'width:100%; margin-top:20px; border-collapse:collapse';
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    td1.style.cssText = 'width:50%;padding:24px 0 0;border-bottom:1px solid #000';
    td1.textContent = 'חתימת הבעל';
    const td2 = document.createElement('td');
    td2.style.cssText = 'width:50%;padding:24px 0 0;border-bottom:1px solid #000';
    td2.textContent = 'חתימת האישה';
    tr.append(td1, td2);
    sigRow.append(tr);
    sig.append(p1, sigRow);
    area.append(sig);
  }

  $('doPrint').addEventListener('click', () => window.print());

  // ============ Uploads view ============
  async function renderUploads() {
    const sel = $('uploadFormSelect');
    sel.replaceChildren();
    if (!ME.forms || !ME.forms.length) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'אין טפסים — מלאו קודם שאלון';
      sel.append(opt);
    } else {
      ME.forms.forEach(f => {
        const opt = document.createElement('option');
        opt.value = String(f.id);
        opt.textContent = (({
          questionnaire: 'שאלון הרשמה', medical: 'טופס בריאות',
          financial: 'טופס פיננסי', stage: 'טופס שלב'
        })[f.form_type] || f.form_type) + ' — ' + (f.status || 'draft');
        sel.append(opt);
      });
    }
    sel.onchange = () => refreshExistingUploads();
    await refreshExistingUploads();
  }

  async function refreshExistingUploads() {
    const box = $('uploadsExisting');
    box.replaceChildren();
    const formId = $('uploadFormSelect').value;
    if (!formId) return;
    try {
      const r = await api('/api/klita/uploads/' + formId, { method: 'GET' });
      const list = r.uploads || [];
      if (!list.length) {
        const p = document.createElement('p');
        p.textContent = 'לא הועלו קבצים לטופס זה עדיין.';
        box.append(p);
        return;
      }
      const ul = document.createElement('ul');
      ul.style.cssText = 'list-style:none;padding:0;margin-top:8px';
      list.forEach(u => {
        const li = document.createElement('li');
        li.style.cssText = 'padding:6px 0;border-bottom:1px dashed #eee';
        li.textContent = `${u.filename} (${(u.size_bytes/1024).toFixed(1)}KB)`;
        ul.append(li);
      });
      box.append(ul);
    } catch (e) {
      const p = document.createElement('p');
      p.textContent = 'שגיאה בטעינת קבצים';
      p.style.color = '#c62828';
      box.append(p);
    }
  }

  $('uploadSubmit').addEventListener('click', async () => {
    const formId = $('uploadFormSelect').value;
    const file = $('uploadFile').files[0];
    if (!formId) return msg('בחר טופס', false);
    if (!file) return msg('בחר קובץ', false);
    if (file.size > 8 * 1024 * 1024) return msg('קובץ גדול מ-8MB', false);
    msg('מעלה…');
    try {
      const b64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => {
          const s = r.result;
          const idx = s.indexOf('base64,');
          resolve(idx >= 0 ? s.slice(idx + 7) : s);
        };
        r.onerror = () => reject(new Error('read'));
        r.readAsDataURL(file);
      });
      await api('/api/klita/upload', {
        method: 'POST',
        body: JSON.stringify({
          form_id: Number(formId),
          filename: file.name,
          content_type: file.type || 'application/octet-stream',
          data_b64: b64
        })
      });
      msg('הועלה בעז״ה');
      $('uploadFile').value = '';
      await refreshMe();
      await refreshExistingUploads();
    } catch (e) {
      const detail = e.body && (e.body.message || e.body.error);
      msg('העלאה נכשלה' + (detail ? ': ' + detail : ''), false);
    }
  });

  // ============ Committee view ============
  let CURRENT_COMMITTEE_APP = null;

  async function renderCommittee() {
    const qEl = $('committeeQueue');
    qEl.replaceChildren();
    try {
      const r = await api('/api/klita/committee/queue', { method: 'GET' });
      const list = r.applicants || [];
      if (!list.length) {
        const p = document.createElement('p');
        p.textContent = 'אין ממתינים להחלטה כרגע.';
        qEl.append(p);
      } else {
        const ul = document.createElement('ul');
        ul.style.cssText = 'list-style:none;padding:0';
        list.forEach(a => {
          const li = document.createElement('li');
          li.style.cssText = 'padding:10px;border:1px solid #eee;border-radius:8px;margin-bottom:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center';
          const label = document.createElement('div');
          const strong = document.createElement('strong');
          strong.textContent = a.family_name;
          const small = document.createElement('small');
          small.textContent = ' · ' + (a.track || '') + ' · שלב ' + (a.current_stage || 1);
          label.append(strong, small);
          const badge = document.createElement('small');
          badge.className = 'verify-badge';
          badge.textContent = a.status;
          li.append(label, badge);
          li.onclick = () => loadCommitteeApplicant(a.id);
          ul.append(li);
        });
        qEl.append(ul);
      }
    } catch (e) {
      qEl.textContent = 'שגיאה בטעינת הרשימה: ' + (e.body?.error || e.status);
    }
  }

  async function loadCommitteeApplicant(id) {
    try {
      const r = await api('/api/klita/committee/applicant/' + id, { method: 'GET' });
      CURRENT_COMMITTEE_APP = r.applicant;
      $('committeeDetail').hidden = false;
      $('committeeDetailName').textContent = r.applicant.family_name;
      const body = $('committeeDetailBody');
      body.replaceChildren();
      const rows = [
        ['בעל', r.applicant.husband_name],
        ['אישה', r.applicant.wife_name],
        ['ת״ז בעל (4 ספרות אחרונות)', r.applicant.husband_id_last4],
        ['ת״ז אישה (4 ספרות אחרונות)', r.applicant.wife_id_last4],
        ['טלפון', r.applicant.phone],
        ['דוא״ל', r.applicant.email],
        ['מסלול', r.applicant.track],
        ['סטטוס', r.applicant.status],
        ['שלב', r.applicant.current_stage]
      ];
      const tbl = document.createElement('table');
      tbl.style.cssText = 'width:100%;border-collapse:collapse';
      rows.forEach(([k, v]) => {
        if (!v) return;
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        td1.style.cssText = 'padding:4px 0;color:#666;width:40%';
        td1.textContent = k;
        const td2 = document.createElement('td');
        td2.style.cssText = 'padding:4px 0';
        td2.textContent = String(v);
        tr.append(td1, td2);
        tbl.append(tr);
      });
      body.append(tbl);
      // Existing decisions
      if (r.decisions && r.decisions.length) {
        const h = document.createElement('h4');
        h.textContent = 'החלטות עד עכשיו';
        h.style.marginTop = '12px';
        body.append(h);
        const ul = document.createElement('ul');
        r.decisions.forEach(d => {
          const li = document.createElement('li');
          li.textContent = `${d.by_user}: ${d.decision}${d.comment ? ' — ' + d.comment : ''}`;
          ul.append(li);
        });
        body.append(ul);
      }
    } catch (e) {
      msg('שגיאה בטעינת פרטי משפחה', false);
    }
  }

  qa('[data-decision]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!CURRENT_COMMITTEE_APP) return msg('בחרו משפחה קודם', false);
      const decision = btn.dataset.decision;
      const comment = ($('committeeComment').value || '').trim();
      msg('שולח החלטה…');
      try {
        const r = await api('/api/klita/committee/decide', {
          method: 'POST',
          body: JSON.stringify({
            applicant_id: CURRENT_COMMITTEE_APP.id,
            decision,
            comment
          })
        });
        msg('החלטה נשמרה — סטטוס כעת: ' + r.status);
        $('committeeComment').value = '';
        await renderCommittee();
        $('committeeDetail').hidden = true;
      } catch (e) {
        msg('שגיאה: ' + (e.body?.message || e.status), false);
      }
    });
  });

  // --------- Boot ----------
  async function boot() {
    // Route from hash
    const hash = (location.hash || '').replace(/^#\/?/, '');
    if (getToken()) {
      try {
        await refreshMe();
        // Deep-link to questionnaire/applicant if requested
        if (hash === 'questionnaire') { renderQuestionnaire(); showView('questionnaire'); }
        else if (hash === 'applicant') { renderApplicant(); showView('applicant'); }
        else { renderPortal(); showView('portal'); }
      } catch {
        setToken('');
        showView('welcome');
      }
    } else {
      if (hash === 'register') showView('register');
      else if (hash === 'login') showView('login');
      else showView('welcome');
    }
  }
  boot();
})();
