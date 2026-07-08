// klita.js — client for the community registration + acceptance-committee
// flow. Talks to the maale-amos-api Worker via /api/klita/*.
// - Auto-fills forms from the user's stored applicant record (D1).
// - Saves drafts; final submission redirects to a print view for signing.
// - Never mutates innerHTML with data — DOM builders + textContent everywhere.
(function () {
  'use strict';

  const API = 'https://maale-amos-api.6742853.workers.dev';
  const TOKEN_KEY = 'ma_klita_session_token';
  const $ = (id) => document.getElementById(id);
  const q = (sel, root) => (root || document).querySelector(sel);
  const qa = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } }
  function setToken(t) { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {} }

  // --------- API ----------
  async function api(path, opts = {}) {
    // text/plain avoids CORS preflight; Worker's request.json() parses regardless.
    const headers = { 'Content-Type': 'text/plain;charset=utf-8', ...(opts.headers || {}) };
    const tok = getToken();
    if (tok) headers['Authorization'] = 'Bearer ' + tok;
    let res;
    try {
      res = await fetch(API + path, { ...opts, headers });
    } catch (netErr) {
      throw Object.assign(new Error('network_error'), { status: 0, cause: String(netErr && netErr.message || netErr) });
    }
    let bodyJson = null; try { bodyJson = await res.json(); } catch {}
    if (!res.ok) throw Object.assign(new Error('api_error'), { status: res.status, body: bodyJson });
    return bodyJson;
  }

  // --------- Views ----------
  const VIEWS = ['welcome', 'register', 'login', 'portal', 'applicant', 'questionnaire', 'print'];
  function showView(name) {
    qa('[data-view]').forEach(el => { el.hidden = (el.dataset.view !== name); });
    // Scroll to top of section
    const app = $('klitaApp'); if (app) app.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Update hash so refreshing keeps you in place
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
    if (view === 'portal' || view === 'questionnaire' || view === 'applicant') {
      if (!getToken()) return showView('welcome');
      if (!ME) await refreshMe();
    }
    if (view === 'portal')        renderPortal();
    if (view === 'applicant')     renderApplicant();
    if (view === 'questionnaire') renderQuestionnaire();
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
    if (!body.email || !body.password || !body.family_name) return msg('חובה: דוא"ל, סיסמה, שם משפחה', false);
    if (body.password.length < 10) return msg('סיסמה חייבת להיות באורך 10 תווים לפחות', false);
    msg('פותח תיק…');
    try {
      const r = await api('/api/klita/register', { method: 'POST', body: JSON.stringify(body) });
      if (r.sessionToken) setToken(r.sessionToken);
      msg('בעז"ה נפתח תיק — ממשיכים לפורטל');
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
    if (!username || !password) return msg('הזינו דוא"ל וסיסמה', false);
    msg('בודק…');
    try {
      const r = await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      if (r.sessionToken) setToken(r.sessionToken);
      await refreshMe();
      msg('שלום ' + (r.user && r.user.username));
      go('portal');
    } catch (e) {
      if (e.status === 401)      msg('דוא"ל או סיסמה שגויים', false);
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
    'תשלומים והקמת הו"ק',
    'טפסי החטיבה להתיישבות',
    'מפתח ואכלוס'
  ];

  function renderPortal() {
    const nameEl = $('portalUserName');
    const statusEl = $('portalStatus');
    const stagesEl = $('portalStages');
    const formsEl = $('portalForms');
    nameEl.textContent = (ME.applicant && ME.applicant.family_name) || (ME.user && ME.user.username) || '';
    const status = (ME.applicant && ME.applicant.status) || 'pending';
    statusEl.textContent = ({
      pending: 'ממתין',
      in_review: 'בבדיקת ועדה',
      approved: 'אושר',
      rejected: 'נדחה',
      archived: 'ארכיון'
    })[status] || status;

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
    { key: 'email',        label: 'דוא"ל ליצירת קשר', type: 'email' },
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
      msg('נשמר בעז"ה');
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
      msg(status === 'draft' ? 'נשמר בעז"ה' : 'הוגש בעז"ה');
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
    h.textContent = 'שאלון הרשמה — קהילת קודש מעלה עמוס יצ"ו';
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

    // Signature block
    const sig = document.createElement('div');
    sig.className = 'qsig';
    sig.innerHTML = '';
    const p1 = document.createElement('p');
    p1.textContent = 'אני החתום מטה מצהיר/ה שכל הפרטים לעיל נכונים.';
    const sigRow = document.createElement('table');
    sigRow.style.cssText = 'width:100%; margin-top:20px; border-collapse:collapse';
    sigRow.innerHTML = '<tr><td style="width:50%;padding:24px 0 0;border-bottom:1px solid #000">חתימת הבעל</td><td style="width:50%;padding:24px 0 0;border-bottom:1px solid #000">חתימת האישה</td></tr>';
    sig.append(p1, sigRow);
    area.append(sig);
  }

  $('doPrint').addEventListener('click', () => window.print());

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
