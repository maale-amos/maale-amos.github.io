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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    try {
      // await so rejections from async handlers are caught here, not by CF middleware.
      if (path === '/api/admin/login')            return await handleLogin(request, env);
      if (path === '/api/admin/logout')           return await handleLogout(request, env);
      if (path === '/api/admin/change-password')  return await handleChangePassword(request, env);
      if (path === '/api/me')                     return await handleMe(request, env);
      if (path.startsWith('/api/content/'))       return await handleContent(request, env, path);
      return error(404, 'not_found', env);
    } catch (e) {
      console.error('unhandled:', e && e.stack || e);
      return error(500, 'internal_error', env, String((e && e.message) || 'internal_error'));
    }
  }
};

async function handleLogin(request, env) {
  if (request.method !== 'POST') return error(405, 'method_not_allowed', env);
  const ip = clientIp(request);
  const rate = await checkRateLimit(env, ip);
  if (!rate.allowed) return error(429, 'too_many_attempts', env, `נסיונות התחברות רבים מדי. נסה שוב עוד ${rate.resetInSec} שניות.`);

  const body = await request.json().catch(() => ({}));
  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!username || !password) return error(400, 'missing_fields', env);

  const row = await env.DB.prepare(
    'SELECT id, password_hash, role FROM admins WHERE username = ?'
  ).bind(username).first();
  if (!row) return error(401, 'bad_credentials', env, 'שם משתמש או סיסמה שגויים');

  const ok = await verifyPassword(password, row.password_hash);
  if (!ok)  return error(401, 'bad_credentials', env, 'שם משתמש או סיסמה שגויים');

  const token = await issueSessionToken(row.id, env);
  await env.DB.prepare('UPDATE admins SET last_login_at = unixepoch() WHERE id = ?').bind(row.id).run();
  await env.DB.prepare(
    'INSERT INTO audit_log (actor_id, action, ip) VALUES (?, ?, ?)'
  ).bind(row.id, 'login', ip).run();

  // Return token in body too (Apps Script proxy path — cookies scoped to
  // script.google.com won't reach us; client will use Authorization: Bearer).
  return json({
    ok: true,
    user: { id: row.id, username, role: row.role },
    sessionToken: token
  }, env, 200, {
    'Set-Cookie': setSessionCookie('session', token, { maxAge: Number(env.SESSION_TTL_SECONDS) })
  });
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
  const body = await request.json().catch(() => ({}));
  const oldp = String(body.oldPassword || '');
  const newp = String(body.newPassword || '');
  if (!oldp || newp.length < 8) return error(400, 'weak_password', env, 'סיסמה חדשה חייבת להיות באורך של 8 תווים לפחות');

  const row = await env.DB.prepare('SELECT password_hash FROM admins WHERE id = ?').bind(s.uid).first();
  if (!row || !(await verifyPassword(oldp, row.password_hash))) {
    return error(401, 'bad_old_password', env, 'סיסמה נוכחית שגויה');
  }
  const hash = await hashPassword(newp);
  await env.DB.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').bind(hash, s.uid).run();
  await env.DB.prepare('INSERT INTO audit_log (actor_id, action, ip) VALUES (?, ?, ?)')
    .bind(s.uid, 'change-password', clientIp(request)).run();
  return json({ ok: true }, env);
}

async function handleMe(request, env) {
  const s = await getSession(request, env);
  if (!s) return error(401, 'unauthorized', env);
  const row = await env.DB.prepare('SELECT id, username, role, last_login_at FROM admins WHERE id = ?').bind(s.uid).first();
  if (!row) return error(401, 'unauthorized', env);
  return json({ id: row.id, username: row.username, role: row.role, lastLoginAt: row.last_login_at }, env);
}

async function handleContent(request, env, path) {
  const section = path.replace('/api/content/', '');
  if (!/^[a-z0-9_-]+$/.test(section)) return error(400, 'bad_section', env);

  if (request.method === 'GET') {
    const row = await env.DB.prepare('SELECT json_data, updated_at FROM content WHERE section_id = ?').bind(section).first();
    if (!row) return json({ section, data: null }, env);
    return json({ section, data: JSON.parse(row.json_data), updatedAt: row.updated_at }, env);
  }
  if (request.method === 'POST') {
    const s = await getSession(request, env);
    if (!s) return error(401, 'unauthorized', env);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return error(400, 'bad_json', env);
    await env.DB.prepare(
      `INSERT INTO content (section_id, json_data, updated_by, updated_at)
       VALUES (?, ?, ?, unixepoch())
       ON CONFLICT(section_id) DO UPDATE SET
         json_data  = excluded.json_data,
         updated_by = excluded.updated_by,
         updated_at = excluded.updated_at`
    ).bind(section, JSON.stringify(body), s.uid).run();
    await env.DB.prepare('INSERT INTO audit_log (actor_id, action, target, ip) VALUES (?, ?, ?, ?)')
      .bind(s.uid, 'content_write', section, clientIp(request)).run();
    return json({ ok: true, section }, env);
  }
  return error(405, 'method_not_allowed', env);
}
