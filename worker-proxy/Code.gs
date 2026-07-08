/**
 * NetFree-bypass proxy for maale-amos-api.
 *
 * NetFree TLS-intercepts *.workers.dev and returns HTTP 418 blocking requests.
 * script.google.com is NOT blocked. This Apps Script forwards requests from the
 * browser to the Cloudflare Worker, returning the response verbatim.
 *
 * Usage from client:
 *   POST https://script.google.com/macros/s/<DEPLOY_ID>/exec
 *   Content-Type: text/plain     ← avoids preflight (see below)
 *   Body: JSON.stringify({ path: "/api/admin/login", method: "POST",
 *                          body: { username, password },
 *                          auth: "<bearer or undefined>" })
 *
 * Response: JSON from the Worker.
 *
 * WHY text/plain: application/json triggers CORS preflight (OPTIONS). Apps Script
 * Web Apps do not respond to OPTIONS with the ACAO header needed, so preflight
 * fails. text/plain is a "simple request" — no preflight → CORS just works.
 * Apps Script itself sets Access-Control-Allow-Origin: * on doPost responses.
 */

var WORKER_BASE = 'https://maale-amos-api.6742853.workers.dev';

function doPost(e) {
  try {
    var incoming = JSON.parse(e.postData.contents || '{}');
    var path   = String(incoming.path || '');
    var method = String(incoming.method || 'POST').toUpperCase();
    var body   = incoming.body;
    var auth   = incoming.auth;

    if (!/^\/api\/[a-z0-9_\/-]+$/i.test(path)) {
      return _out({ error: 'bad_path' }, 400);
    }
    if (method !== 'POST' && method !== 'GET') {
      return _out({ error: 'bad_method' }, 405);
    }

    var opts = {
      method: method.toLowerCase(),
      muteHttpExceptions: true,
      followRedirects: false,
      headers: { 'Content-Type': 'application/json' }
    };
    if (auth) opts.headers['Authorization'] = 'Bearer ' + auth;
    if (method === 'POST') opts.payload = JSON.stringify(body || {});

    var res = UrlFetchApp.fetch(WORKER_BASE + path, opts);
    var status = res.getResponseCode();
    var text = res.getContentText();

    // Wrap in envelope so client sees the Worker status even though Apps Script
    // always returns 200 on the ContentService output.
    var parsed;
    try { parsed = JSON.parse(text); } catch (_) { parsed = { raw: text }; }
    return _out({ status: status, body: parsed }, 200);
  } catch (err) {
    return _out({ error: 'proxy_exception', message: String(err) }, 500);
  }
}

function doGet(e) {
  // Health check
  return _out({ ok: true, proxy: 'maale-amos-api', worker: WORKER_BASE }, 200);
}

function _out(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
