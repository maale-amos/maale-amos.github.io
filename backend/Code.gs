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
};
const ADMIN_TOKEN = '<REDACTED_TOKEN>';

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
    return _jsonResponse({ ok: true, service: 'maale-amos-backend', ts: new Date().toISOString() });
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

  return _jsonResponse({ ok: false, error: 'unknown action: ' + action });
}

// One-time setup: copy data.json content into the sheet tabs
function setupSeed() {
  const seed = {
    residents: [
      { name: 'יוסף שניידר', code: '4415', role: 'מזכיר / מנהל אתר', status: 'אושר' },
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
