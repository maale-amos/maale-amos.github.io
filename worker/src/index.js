// maale-amos-api — Cloudflare Worker
// Endpoints:
//   POST /api/auth/request        {phone}          → sends 6-digit OTP
//   POST /api/auth/verify         {phone,code}     → sets session cookie
//   POST /api/auth/logout                          → clears session
//   GET  /api/me                                    → current user or 401
//   GET  /api/residents                             → paged residents list (401 if not authed)
//   GET  /api/content/:section                     → dynamic content (public reads OK)
//   POST /api/content/:section    {json}           → admin only
//   POST /api/announcements       {title,body,...} → admin only

import { handleAuth } from './auth.js';
import { handleResidents } from './residents.js';
import { handleContent } from './content.js';
import { corsHeaders, json, error } from './http.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    try {
      if (path.startsWith('/api/auth/')) return await handleAuth(request, env, path);
      if (path === '/api/me')            return await handleMe(request, env);
      if (path === '/api/residents')     return await handleResidents(request, env);
      if (path.startsWith('/api/content/')) return await handleContent(request, env, path);
      return error(404, 'not_found', env);
    } catch (e) {
      console.error(e);
      return error(500, 'internal_error', env);
    }
  }
};

async function handleMe(request, env) {
  const session = await getSession(request, env);
  if (!session) return error(401, 'unauthorized', env);
  return json({ id: session.uid, role: session.role, name: session.name }, env);
}

async function getSession(request, env) {
  const cookie = request.headers.get('Cookie') || '';
  const m = cookie.match(/session=([^;]+)/);
  if (!m) return null;
  const raw = await env.SESSIONS.get(m[1], 'json');
  return raw;
}

export { getSession };
