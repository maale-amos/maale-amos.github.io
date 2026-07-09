// maale-amos-api — Cloudflare Worker
// Endpoints:
//   POST /api/admin/login    {username, password} → HttpOnly Secure SameSite=Strict cookie
//   POST /api/admin/logout   → clear session
//   GET  /api/me             → current admin or 401
//   GET  /api/content/:id    → dynamic content read (public)
//   POST /api/content/:id    → admin only
//   POST /api/admin/change-password  {oldPassword, newPassword}  → admin only

import { corsHeaders, json, error, setSessionCookie, clientIp } from './http.js';
import { verifyPassword, hashPassword } from './password.js';
import { issueSessionToken, getSession, revokeSession } from './session.js';
import { checkRateLimit } from './ratelimit.js';
import {
  handleKlitaRegister, handleKlitaMe, handleKlitaApplicant,
  handleKlitaFormSave, handleKlitaFormGet,
  handleKlitaUploadPost, handleKlitaUploadsList, handleKlitaUploadGet,
  handleKlitaCommitteeQueue, handleKlitaCommitteeDecide, handleKlitaCommitteeApplicant,
  handleKlitaStage
} from './klita.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    }

    try {
      // await so rejections from async handlers are caught here, not by CF middleware.
      if (path === '/api/admin/login')            return await handleLogin(request, env);
      if (path === '/api/admin/logout')           return await handleLogout(request, env);
      if (path === '/api/admin/change-password')  return await handleChangePassword(request, env);
      if (path === '/api/me')                     return await handleMe(request, env);
      if (path.startsWith('/api/content/'))       return await handleContent(request, env, path);
      // Klita (community-registration) flow
      if (path === '/api/klita/register')         return await handleKlitaRegister(request, env);
      if (path === '/api/klita/me')               return await handleKlitaMe(request, env);
      if (path === '/api/klita/applicant')        return await handleKlitaApplicant(request, env);
      if (path === '/api/klita/form')             return await handleKlitaFormSave(request, env);
      const mForm = path.match(/^\/api\/klita\/form\/(\d+)$/);
      if (mForm)                                  return await handleKlitaFormGet(request, env, mForm[1]);
      // Uploads
      if (path === '/api/klita/upload')           return await handleKlitaUploadPost(request, env);
      const mUploads = path.match(/^\/api\/klita\/uploads\/(\d+)$/);
      if (mUploads)                               return await handleKlitaUploadsList(request, env, mUploads[1]);
      const mUp = path.match(/^\/api\/klita\/upload\/(\d+)$/);
      if (mUp)                                    return await handleKlitaUploadGet(request, env, mUp[1]);
      // Committee
      if (path === '/api/klita/committee/queue')    return await handleKlitaCommitteeQueue(request, env);
      if (path === '/api/klita/committee/decide')   return await handleKlitaCommitteeDecide(request, env);
      const mAp = path.match(/^\/api\/klita\/committee\/applicant\/(\d+)$/);
      if (mAp)                                      return await handleKlitaCommitteeApplicant(request, env, mAp[1]);
      // Stages
      if (path === '/api/klita/stage')             return await handleKlitaStage(request, env);
      return error(404, 'not_found', env, undefined, request);
    } catch (e) {
      // Log full detail server-side, but do NOT echo the exception message to
      // the client. Prior code leaked D1 constraint names (username enum),
      // KV key hints, etc. Fix from 2026-07-09 audit competitive review.
      console.error('unhandled:', e && e.stack || e);
      return error(500, 'internal_error', env, 'internal_error', request);
    }
  }
};

// Sentinel hash used to keep response time uniform when the username doesn't
// exist. verifyPassword() runs against this so PBKDF2 executes on both paths,
// preventing timing-based user enumeration (H-2 in security audit 2026-07-08).
const DUMMY_HASH = '210000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';

async function handleLogin(request, env) {
  if (request.method !== 'POST') return error(405, 'method_not_allowed', env);
  const ip = clientIp(request);

  // Read body first so we can key rate-limit by IP + username (defense against
  // C-1: single Apps-Script-proxied IP shared by all real users).
  const raw = await request.text();
  if (raw.length > 4096) return error(413, 'payload_too_large', env);
  let body; try { body = JSON.parse(raw); } catch { body = {}; }
  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');
  // Length bounds prevent oversize KV keys (>512B) blowing up ratelimit path.
  if (!username || !password) return error(400, 'missing_fields', env);
  if (username.length > 254) return error(400, 'bad_username', env);
  if (password.length > 512) return error(400, 'bad_password', env);

  // Rate-limit key is a hash prefix — keeps KV key < 128B regardless of input.
  const rlUser = username.slice(0, 96);
  const rateIp   = await checkRateLimit(env, `ip:${ip}`);
  const rateUser = await checkRateLimit(env, `user:${rlUser}`);
  if (!rateIp.allowed || !rateUser.allowed) {
    const s = Math.max(rateIp.resetInSec || 0, rateUser.resetInSec || 0);
    return error(429, 'too_many_attempts', env, `נסיונות התחברות רבים מדי. נסה שוב עוד ${s} שניות.`);
  }

  const row = await env.DB.prepare(
    'SELECT id, password_hash, role FROM admins WHERE username = ?'
  ).bind(username).first();

  // Always run PBKDF2 (against real hash or dummy) so response time doesn't
  // reveal whether the username exists.
  const hashToCheck = row ? row.password_hash : DUMMY_HASH;
  const ok = await verifyPassword(password, hashToCheck);
  if (!row || !ok) return error(401, 'bad_credentials', env, 'שם משתמש או סיסמה שגויים');

  const token = await issueSessionToken(row.id, env);
  await env.DB.prepare('UPDATE admins SET last_login_at = unixepoch() WHERE id = ?').bind(row.id).run();
  try {
    await env.DB.prepare(
      'INSERT INTO audit_log (actor_id, action, ip) VALUES (?, ?, ?)'
    ).bind(row.id, 'login', ip).run();
  } catch (e) { console.error('audit_log login failed:', e); }

  // sessionToken in JSON is required for the cross-site call from
  // maale-amos.github.io → maale-amos-api.workers.dev, because a
  // SameSite=Strict cookie won't be sent cross-site. XSS-mitigation instead
  // relies on the frontend defenses (CSP, textContent-only DOM writes, and
  // safeUrl filter on admin-editable URLs). The cookie is set as a fallback
  // for same-origin future setups (custom domain).
  return json({
    ok: true,
    user: { id: row.id, username, role: row.role },
    sessionToken: token
  }, env, 200, {
    'Set-Cookie': setSessionCookie('session', token, { maxAge: Number(env.SESSION_TTL_SECONDS) })
  }, request);
}

async function handleLogout(request, env) {
  if (request.method !== 'POST') return error(405, 'method_not_allowed', env);
  const s = await getSession(request, env);
  if (s) await revokeSession(s.token, env);
  return json({ ok: true }, env, 200, {
    'Set-Cookie': setSessionCookie('session', '', { maxAge: 0 })
  });
}

async function handleChangePassword(request, env) {
  if (request.method !== 'POST') return error(405, 'method_not_allowed', env);
  const s = await getSession(request, env);
  if (!s) return error(401, 'unauthorized', env);
  // Rate-limit brute-forcing of oldPassword (audit 2026-07-09 M/H).
  const rl = await checkRateLimit(env, `chpw:${s.uid}`, 5, 300);
  if (!rl.allowed) return error(429, 'too_many_attempts', env, `נסיונות רבים מדי — נסה שוב עוד ${rl.resetInSec} שניות.`);

  const body = await request.json().catch(() => ({}));
  const oldp = String(body.oldPassword || '');
  const newp = String(body.newPassword || '');
  // Modest stronger minimum + upper bound to avoid oversized PBKDF2 inputs.
  if (!oldp || oldp.length > 512) return error(400, 'bad_input', env);
  if (newp.length < 10 || newp.length > 512) return error(400, 'weak_password', env, 'סיסמה חדשה חייבת להיות באורך 10 תווים לפחות');

  const row = await env.DB.prepare('SELECT password_hash FROM admins WHERE id = ?').bind(s.uid).first();
  if (!row || !(await verifyPassword(oldp, row.password_hash))) {
    return error(401, 'bad_old_password', env, 'סיסמה נוכחית שגויה');
  }
  const hash = await hashPassword(newp);
  await env.DB.prepare(
    'UPDATE admins SET password_hash = ?, password_changed_at = unixepoch() WHERE id = ?'
  ).bind(hash, s.uid).run();
  // Delete current session's KV row immediately. gen bump invalidates every
  // token via getSession check, but the current token still lives in KV until
  // TTL. Removing it here closes the KV eventual-consistency read window.
  try { await revokeSession(s.token, env); } catch (e) { console.error('revoke on chpw', e); }
  await env.DB.prepare('INSERT INTO audit_log (actor_id, action, ip) VALUES (?, ?, ?)')
    .bind(s.uid, 'change-password', clientIp(request)).run();
  return json({ ok: true }, env);
}

async function handleMe(request, env) {
  if (request.method !== 'GET') return error(405, 'method_not_allowed', env);
  const s = await getSession(request, env);
  if (!s) return error(401, 'unauthorized', env);
  const row = await env.DB.prepare('SELECT id, username, role, last_login_at FROM admins WHERE id = ?').bind(s.uid).first();
  if (!row) return error(401, 'unauthorized', env);
  return json({ id: row.id, username: row.username, role: row.role, lastLoginAt: row.last_login_at }, env);
}

// Recursive prototype-pollution guard. Returns true if any nested object
// key equals __proto__, constructor, or prototype. Handles arrays.
function hasBadKeys(v, depth = 0) {
  if (v === null || typeof v !== 'object' || depth > 30) return false;
  if (Array.isArray(v)) return v.some(x => hasBadKeys(x, depth + 1));
  for (const k of Object.keys(v)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') return true;
    if (hasBadKeys(v[k], depth + 1)) return true;
  }
  return false;
}

async function handleContent(request, env, path) {
  const section = path.replace('/api/content/', '');
  // C-1 defense: section must be short + safe. 64 char cap prevents storage
  // amplification by a compromised session.
  if (!/^[a-z0-9_-]{1,64}$/.test(section)) return error(400, 'bad_section', env);

  if (request.method === 'GET') {
    const row = await env.DB.prepare('SELECT json_data, updated_at FROM content WHERE section_id = ?').bind(section).first();
    if (!row) return json({ section, data: null }, env, 200, {}, request);
    let data = null;
    try { data = JSON.parse(row.json_data); } catch (_) { data = null; }
    return json({ section, data, updatedAt: row.updated_at }, env, 200, {}, request);
  }
  if (request.method === 'POST') {
    const s = await getSession(request, env);
    if (!s) return error(401, 'unauthorized', env, undefined, request);
    // CRITICAL fix (audit 2026-07-09 C-1): only admin+editor may write site
    // content. Prior code accepted ANY authenticated session — including
    // self-service klita family users — allowing anonymous defacement.
    if (s.role !== 'admin' && s.role !== 'editor') {
      return error(403, 'forbidden', env, 'תוכן האתר מיועד למנהלי אתר בלבד', request);
    }
    const raw = await request.text();
    if (raw.length > 256 * 1024) return error(413, 'payload_too_large', env, undefined, request);
    let body;
    try { body = JSON.parse(raw); } catch { return error(400, 'bad_json', env, undefined, request); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return error(400, 'bad_json', env, undefined, request);
    if (hasBadKeys(body)) {
      return error(400, 'bad_json', env, 'forbidden object key found in payload', request);
    }
    await env.DB.prepare(
      `INSERT INTO content (section_id, json_data, updated_by, updated_at)
       VALUES (?, ?, ?, unixepoch())
       ON CONFLICT(section_id) DO UPDATE SET
         json_data  = excluded.json_data,
         updated_by = excluded.updated_by,
         updated_at = excluded.updated_at`
    ).bind(section, JSON.stringify(body), s.uid).run();
    try {
      await env.DB.prepare('INSERT INTO audit_log (actor_id, action, target, ip) VALUES (?, ?, ?, ?)')
        .bind(s.uid, 'content_write', section, clientIp(request)).run();
    } catch (e) { console.error('audit content_write failed:', e); }
    return json({ ok: true, section }, env, 200, {}, request);
  }
  return error(405, 'method_not_allowed', env, undefined, request);
}
