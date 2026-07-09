// ============================================
// Maale Amos Backend — Apps Script
// Sheet: 1Nz3Kf4Wdubgikt-N9tc-QNYeoNUOxNXi3OYK98NDM7c
// Read live data + accept resident-registration requests
// ============================================

const SHEET_ID = '1Nz3Kf4Wdubgikt-N9tc-QNYeoNUOxNXi3OYK98NDM7c';
const TABS = {
  RESIDENTS: 'residents',
  NEWS: 'news',
  EVENTS: 'events',
  ANNOUNCEMENTS: 'announcements',
  REGISTRATIONS: 'registrations',
  MARKET: 'market',
  SIMCHOT: 'simchot',
  GEMACHIM: 'gemachim',
  TICKER: 'ticker',
  ANALYTICS: 'analytics',        // v2: page views + click events
  USERS: 'users',                // v2: email/password auth users
  AUDIT: 'audit',                // v2: admin action audit trail
  SESSIONS: 'sessions',          // v2: active login sessions
};
// SECURITY 2026-07-09: hardcoded token removed. Set via Apps Script
// PropertiesService: File → Project settings → Script properties → ADMIN_TOKEN.
// The Apps Script backend is legacy — the current auth is via Cloudflare Worker.
const ADMIN_TOKEN = (function() {
  try { return PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN') || ''; }
  catch (e) { return ''; }
})();

function _sheet(name) {
  let ss;
  try { ss = SpreadsheetApp.openById(SHEET_ID); }
  catch (e) { return null; }
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function _rowsToObjects(sh) {
  if (!sh) return [];
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0].map(h => String(h).trim());
  return data.slice(1)
    .map(row => {
      const o = {};
      headers.forEach((h, i) => { if (h) o[h] = row[i]; });
      return o;
    })
    .filter(o => Object.values(o).some(v => v && String(v).trim() !== ''));
}

function _jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'all';

  if (action === 'all') {
    return _jsonResponse({
      ok: true,
      ts: new Date().toISOString(),
      residents: _rowsToObjects(_sheet(TABS.RESIDENTS)),
      news: _rowsToObjects(_sheet(TABS.NEWS)),
      events: _rowsToObjects(_sheet(TABS.EVENTS)),
      announcements: _rowsToObjects(_sheet(TABS.ANNOUNCEMENTS)),
      market: _rowsToObjects(_sheet(TABS.MARKET)),
      simchot: _rowsToObjects(_sheet(TABS.SIMCHOT)),
      gemachim: _rowsToObjects(_sheet(TABS.GEMACHIM)),
      ticker: _rowsToObjects(_sheet(TABS.TICKER)),
    });
  }
  if (action === 'residents') {
    return _jsonResponse({ ok: true, residents: _rowsToObjects(_sheet(TABS.RESIDENTS)) });
  }
  if (action === 'news') {
    return _jsonResponse({ ok: true, news: _rowsToObjects(_sheet(TABS.NEWS)) });
  }
  if (action === 'market') {
    return _jsonResponse({ ok: true, market: _rowsToObjects(_sheet(TABS.MARKET)) });
  }
  if (action === 'simchot') {
    return _jsonResponse({ ok: true, simchot: _rowsToObjects(_sheet(TABS.SIMCHOT)) });
  }
  if (action === 'gemachim') {
    return _jsonResponse({ ok: true, gemachim: _rowsToObjects(_sheet(TABS.GEMACHIM)) });
  }
  if (action === 'ticker') {
    return _jsonResponse({ ok: true, ticker: _rowsToObjects(_sheet(TABS.TICKER)) });
  }
  if (action === 'health') {
    return _jsonResponse({ ok: true, service: 'maale-amos-backend', ts: new Date().toISOString(), version: 'v2-analytics' });
  }

  // v2: Analytics summary — returns aggregate stats for dashboard
  if (action === 'analytics_summary') {
    if (p.token !== ADMIN_TOKEN) return _jsonResponse({ ok: false, error: 'invalid token' });
    return _jsonResponse({ ok: true, summary: _analyticsSummary() });
  }

  // v2: List users (admin only)
  if (action === 'user_list') {
    if (p.token !== ADMIN_TOKEN) return _jsonResponse({ ok: false, error: 'invalid token' });
    const rows = _rowsToObjects(_sheet(TABS.USERS));
    // Strip password hashes from response
    return _jsonResponse({ ok: true, users: rows.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, status: u.status, created: u.created, last_login: u.last_login })) });
  }

  // v2: List audit entries (admin only, most-recent first)
  if (action === 'audit_list') {
    if (p.token !== ADMIN_TOKEN) return _jsonResponse({ ok: false, error: 'invalid token' });
    const limit = parseInt(p.limit || '100', 10);
    const rows = _rowsToObjects(_sheet(TABS.AUDIT));
    return _jsonResponse({ ok: true, entries: rows.reverse().slice(0, limit) });
  }

  return _jsonResponse({ ok: false, error: 'unknown action: ' + action });
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  const action = p.action || '';

  if (action === 'register') {
    // Public endpoint: anyone can register, status starts as "pending"
    const name = (p.name || '').trim();
    const phone = (p.phone || '').trim();
    const address = (p.address || '').trim();
    const email = (p.email || '').trim();
    if (!name || !phone) {
      return _jsonResponse({ ok: false, error: 'name + phone required' });
    }
    const sh = _sheet(TABS.REGISTRATIONS);
    if (sh.getLastRow() === 0) {
      sh.appendRow(['ts', 'name', 'phone', 'address', 'email', 'status']);
    }
    sh.appendRow([new Date().toISOString(), name, phone, address, email, 'pending']);
    return _jsonResponse({ ok: true, msg: 'נרשמתָ. הוועד יאשר את הבקשה.' });
  }

  // Upload an image to a dedicated Drive folder, return its public-read URL.
  // Body: token, filename, mimeType, dataBase64 (data URL prefix stripped).
  if (action === 'upload_image') {
    if (p.token !== ADMIN_TOKEN) return _jsonResponse({ ok: false, error: 'invalid token' });
    const filename = (p.filename || ('image_' + Date.now() + '.jpg')).replace(/[^a-zA-Z0-9א-ת._-]/g, '_');
    const mimeType = p.mimeType || 'image/jpeg';
    const dataBase64 = (p.dataBase64 || '').replace(/^data:[^;]+;base64,/, '');
    if (!dataBase64) return _jsonResponse({ ok: false, error: 'no image data' });
    try {
      // Find or create the "maale-amos-images" folder, get/create it shared
      const folderName = 'maale-amos-images';
      let folder;
      const it = DriveApp.getFoldersByName(folderName);
      if (it.hasNext()) folder = it.next();
      else folder = DriveApp.createFolder(folderName);
      // Make folder public-read once (idempotent)
      try { folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
      const blob = Utilities.newBlob(Utilities.base64Decode(dataBase64), mimeType, filename);
      const file = folder.createFile(blob);
      try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
      // Direct view URL (works as <img src>)
      const fileId = file.getId();
      const url = 'https://drive.google.com/uc?export=view&id=' + fileId;
      return _jsonResponse({ ok: true, url: url, id: fileId, filename: filename });
    } catch (e) {
      return _jsonResponse({ ok: false, error: String(e) });
    }
  }

  if (action === 'approve_registration') {
    if (p.token !== ADMIN_TOKEN) return _jsonResponse({ ok: false, error: 'invalid token' });
    const rowIdx = parseInt(p.row || '0', 10);
    const sh = _sheet(TABS.REGISTRATIONS);
    if (rowIdx < 2 || rowIdx > sh.getLastRow()) return _jsonResponse({ ok: false, error: 'bad row' });
    sh.getRange(rowIdx, 6).setValue('approved');
    // Copy to residents
    const row = sh.getRange(rowIdx, 1, 1, 6).getValues()[0];
    const res = _sheet(TABS.RESIDENTS);
    if (res.getLastRow() === 0) res.appendRow(['name', 'code', 'role', 'status']);
    const code = String(Math.floor(1000 + Math.random() * 9000));
    res.appendRow([row[1], code, 'תושב', 'אושר']);
    return _jsonResponse({ ok: true, msg: 'אושר ונוסף לרשימת תושבים', code });
  }

  // Admin CRUD across tabs. Body must include: token, tab, op, data (JSON).
  // tab: news|events|announcements|market|simchot|gemachim|ticker
  // op: add|update|delete
  // data: object with column→value pairs. For update/delete must include 'id'.
  if (action === 'admin_row') {
    if (p.token !== ADMIN_TOKEN) return _jsonResponse({ ok: false, error: 'invalid token' });
    const tab = (p.tab || '').toLowerCase();
    const allowed = ['news', 'events', 'announcements', 'market', 'simchot', 'gemachim', 'ticker'];
    if (allowed.indexOf(tab) < 0) return _jsonResponse({ ok: false, error: 'tab not allowed: ' + tab });
    const sh = _sheet(tab);
    if (!sh) return _jsonResponse({ ok: false, error: 'sheet open failed' });
    const op = (p.op || '').toLowerCase();
    let data;
    try { data = JSON.parse(p.data || '{}'); }
    catch (e) { return _jsonResponse({ ok: false, error: 'bad data json' }); }

    if (op === 'add') {
      let headers;
      if (sh.getLastRow() === 0) {
        headers = Object.keys(data);
        if (headers.indexOf('id') < 0) headers.unshift('id');
        sh.appendRow(headers);
      } else {
        headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(h => String(h).trim());
      }
      if (!data.id) data.id = Date.now().toString(36);
      const row = headers.map(h => data[h] !== undefined ? data[h] : '');
      sh.appendRow(row);
      return _jsonResponse({ ok: true, id: data.id });
    }

    if (op === 'update' || op === 'delete') {
      if (!data.id) return _jsonResponse({ ok: false, error: 'id required' });
      if (sh.getLastRow() < 2) return _jsonResponse({ ok: false, error: 'empty sheet' });
      const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(h => String(h).trim());
      const idCol = headers.indexOf('id');
      if (idCol < 0) return _jsonResponse({ ok: false, error: 'no id column' });
      const allRows = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
      let rowIdx = -1;
      for (let i = 0; i < allRows.length; i++) {
        if (String(allRows[i][idCol]) === String(data.id)) { rowIdx = i + 2; break; }
      }
      if (rowIdx < 0) return _jsonResponse({ ok: false, error: 'id not found' });
      if (op === 'delete') {
        sh.deleteRow(rowIdx);
        return _jsonResponse({ ok: true, deleted: data.id });
      }
      // update
      const newRow = headers.map((h, i) => data[h] !== undefined ? data[h] : allRows[rowIdx - 2][i]);
      sh.getRange(rowIdx, 1, 1, newRow.length).setValues([newRow]);
      return _jsonResponse({ ok: true, updated: data.id });
    }

    return _jsonResponse({ ok: false, error: 'op required (add|update|delete)' });
  }

  // ===== v2: Analytics track (no token — public write, rate-limited by client) =====
  if (action === 'track') {
    const evt = (p.event || 'pageview').substring(0, 40);
    const path = (p.path || '/').substring(0, 200);
    const section = (p.section || '').substring(0, 60);
    const referrer = (p.referrer || '').substring(0, 200);
    const ua = (p.ua || '').substring(0, 200);
    const sid = (p.sid || '').substring(0, 40);   // session id — client-generated UUID
    const uid = (p.uid || '').substring(0, 40);   // user id if logged in
    const meta = (p.meta || '').substring(0, 500);
    const sh = _sheet(TABS.ANALYTICS);
    if (sh.getLastRow() === 0) {
      sh.appendRow(['ts', 'event', 'path', 'section', 'referrer', 'ua', 'sid', 'uid', 'meta']);
    }
    sh.appendRow([new Date().toISOString(), evt, path, section, referrer, ua, sid, uid, meta]);
    return _jsonResponse({ ok: true });
  }

  // ===== v2: User auth (email/password) =====
  if (action === 'user_login') {
    const email = (p.email || '').trim().toLowerCase();
    const password = (p.password || '');
    if (!email || !password) return _jsonResponse({ ok: false, error: 'email + password required' });
    const users = _rowsToObjects(_sheet(TABS.USERS));
    const u = users.find(function(x) { return String(x.email || '').toLowerCase() === email; });
    if (!u || String(u.status || 'active') === 'blocked') return _jsonResponse({ ok: false, error: 'user not found or blocked' });
    if (_hashPw(password, u.salt) !== u.pw_hash) {
      _audit('login_fail', '', email, 'wrong password');
      return _jsonResponse({ ok: false, error: 'wrong password' });
    }
    // Create session
    const sessionToken = _rand(32);
    const shS = _sheet(TABS.SESSIONS);
    if (shS.getLastRow() === 0) shS.appendRow(['token', 'user_id', 'email', 'created', 'expires']);
    const expires = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();  // 30d
    shS.appendRow([sessionToken, u.id, u.email, new Date().toISOString(), expires]);
    // Update last_login
    _updateUserField(u.id, 'last_login', new Date().toISOString());
    _audit('login_ok', u.id, u.email, '');
    return _jsonResponse({ ok: true, token: sessionToken, user: { id: u.id, email: u.email, name: u.name, role: u.role } });
  }

  if (action === 'user_create') {
    if (p.token !== ADMIN_TOKEN) return _jsonResponse({ ok: false, error: 'invalid token' });
    const email = (p.email || '').trim().toLowerCase();
    const password = (p.password || '');
    const name = (p.name || '').trim();
    const role = (p.role || 'resident');
    if (!email || !password || !name) return _jsonResponse({ ok: false, error: 'email+password+name required' });
    if (password.length < 6) return _jsonResponse({ ok: false, error: 'password too short (min 6)' });
    const sh = _sheet(TABS.USERS);
    if (sh.getLastRow() === 0) sh.appendRow(['id', 'email', 'name', 'role', 'status', 'salt', 'pw_hash', 'created', 'last_login']);
    const existing = _rowsToObjects(sh).find(function(x) { return String(x.email || '').toLowerCase() === email; });
    if (existing) return _jsonResponse({ ok: false, error: 'email already registered' });
    const id = 'u_' + Date.now().toString(36) + '_' + _rand(4);
    const salt = _rand(16);
    const pw_hash = _hashPw(password, salt);
    sh.appendRow([id, email, name, role, 'active', salt, pw_hash, new Date().toISOString(), '']);
    _audit('user_create', id, email, 'role=' + role);
    return _jsonResponse({ ok: true, id: id });
  }

  if (action === 'user_update') {
    if (p.token !== ADMIN_TOKEN) return _jsonResponse({ ok: false, error: 'invalid token' });
    const id = (p.id || '');
    if (!id) return _jsonResponse({ ok: false, error: 'id required' });
    const updates = {};
    if (p.name !== undefined) updates.name = p.name;
    if (p.role !== undefined) updates.role = p.role;
    if (p.status !== undefined) updates.status = p.status;
    Object.keys(updates).forEach(function(k) { _updateUserField(id, k, updates[k]); });
    if (p.password) {
      const salt = _rand(16);
      _updateUserField(id, 'salt', salt);
      _updateUserField(id, 'pw_hash', _hashPw(p.password, salt));
    }
    _audit('user_update', id, '', JSON.stringify(updates));
    return _jsonResponse({ ok: true });
  }

  if (action === 'user_delete') {
    if (p.token !== ADMIN_TOKEN) return _jsonResponse({ ok: false, error: 'invalid token' });
    const id = (p.id || '');
    if (!id) return _jsonResponse({ ok: false, error: 'id required' });
    const sh = _sheet(TABS.USERS);
    const data = sh.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sh.deleteRow(i + 1);
        _audit('user_delete', id, '', '');
        return _jsonResponse({ ok: true });
      }
    }
    return _jsonResponse({ ok: false, error: 'not found' });
  }

  return _jsonResponse({ ok: false, error: 'unknown action: ' + action });
}

// ===== v2 helpers =====

function _rand(n) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let s = '';
  for (let i = 0; i < n; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

function _hashPw(password, salt) {
  // SHA-256 of salt + password, hex-encoded — good enough for GAS w/o bcrypt
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, (salt || '') + password);
  return raw.map(function(b) { return ('0' + (b < 0 ? b + 256 : b).toString(16)).slice(-2); }).join('');
}

function _updateUserField(userId, field, value) {
  const sh = _sheet(TABS.USERS);
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return false;
  const headers = data[0].map(function(h) { return String(h).trim(); });
  const idCol = headers.indexOf('id');
  const fieldCol = headers.indexOf(field);
  if (idCol < 0 || fieldCol < 0) return false;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(userId)) {
      sh.getRange(i + 1, fieldCol + 1).setValue(value);
      return true;
    }
  }
  return false;
}

function _audit(action, userId, email, meta) {
  try {
    const sh = _sheet(TABS.AUDIT);
    if (sh.getLastRow() === 0) sh.appendRow(['ts', 'action', 'user_id', 'email', 'meta']);
    sh.appendRow([new Date().toISOString(), action, userId || '', email || '', meta || '']);
  } catch (e) { /* silent */ }
}

function _analyticsSummary() {
  const rows = _rowsToObjects(_sheet(TABS.ANALYTICS));
  const now = Date.now();
  const dayMs = 24 * 3600 * 1000;
  const dayAgo = now - dayMs;
  const weekAgo = now - 7 * dayMs;
  const monthAgo = now - 30 * dayMs;

  const pathCounts = {};
  const sectionCounts = {};
  const hourCounts = new Array(24).fill(0);
  const dayCounts = {};
  const sessionsToday = {};
  const sessionsWeek = {};
  const eventTypes = {};
  let pv24 = 0, pv7 = 0, pv30 = 0;
  const recent = [];

  rows.forEach(function(r) {
    const t = new Date(r.ts).getTime();
    if (isNaN(t)) return;
    const evt = String(r.event || 'pageview');
    eventTypes[evt] = (eventTypes[evt] || 0) + 1;
    if (evt === 'pageview') {
      if (t > monthAgo) pv30++;
      if (t > weekAgo) pv7++;
      if (t > dayAgo) pv24++;
      const p = String(r.path || '/');
      pathCounts[p] = (pathCounts[p] || 0) + 1;
      const s = String(r.section || '');
      if (s) sectionCounts[s] = (sectionCounts[s] || 0) + 1;
      const h = new Date(t).getHours();
      hourCounts[h]++;
      const d = new Date(t).toISOString().substring(0, 10);
      dayCounts[d] = (dayCounts[d] || 0) + 1;
      const sid = String(r.sid || '');
      if (sid) {
        if (t > dayAgo) sessionsToday[sid] = true;
        if (t > weekAgo) sessionsWeek[sid] = true;
      }
    }
    if (recent.length < 30) recent.push({ ts: r.ts, event: evt, path: r.path, section: r.section, sid: (String(r.sid || '') || '').substring(0, 8) });
  });

  const topPaths = Object.keys(pathCounts).map(function(k) { return { path: k, count: pathCounts[k] }; })
    .sort(function(a, b) { return b.count - a.count; }).slice(0, 10);
  const topSections = Object.keys(sectionCounts).map(function(k) { return { section: k, count: sectionCounts[k] }; })
    .sort(function(a, b) { return b.count - a.count; }).slice(0, 10);
  const timeline = Object.keys(dayCounts).sort().slice(-14).map(function(d) { return { day: d, count: dayCounts[d] }; });

  return {
    pageviews_24h: pv24,
    pageviews_7d: pv7,
    pageviews_30d: pv30,
    unique_sessions_24h: Object.keys(sessionsToday).length,
    unique_sessions_7d: Object.keys(sessionsWeek).length,
    top_paths: topPaths,
    top_sections: topSections,
    hourly_distribution: hourCounts,
    timeline_14d: timeline,
    event_types: eventTypes,
    recent: recent.reverse().slice(0, 30),
    total_events: rows.length,
  };
}

// One-time setup: copy data.json content into the sheet tabs
function setupSeed() {
  const seed = {
    residents: [
      // SECURITY 2026-07-09: seed row scrubbed of PIN. Admins set their own
      // code via the admin panel (or D1-backed Cloudflare Worker auth).
      { name: 'יוסף שניידר', code: '', role: 'מזכיר / מנהל אתר', status: 'אושר' },
    ],
  };
  Object.keys(seed).forEach(tab => {
    const sh = _sheet(tab);
    sh.clear();
    const rows = seed[tab];
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    sh.appendRow(headers);
    rows.forEach(r => sh.appendRow(headers.map(h => r[h] || '')));
  });
  return 'seed done';
}
