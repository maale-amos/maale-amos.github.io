const ALLOWED_ORIGINS = new Set([
  'https://maale-amos.github.io',
  // Add other trusted origins here if the site is ever fronted by a custom
  // domain. Never include '*' — Allow-Credentials + '*' is spec-rejected.
]);
const DEFAULT_ORIGIN = 'https://maale-amos.github.io';

export function corsHeaders(env, request) {
  // Prefer the request's Origin when it's in the allowlist. Fall back to the
  // default so preflights and non-browser callers still get a valid header.
  // env.CORS_ORIGIN is honored only if it exactly matches an allowed value —
  // guards against config drift (M-8).
  const reqOrigin = request && request.headers && request.headers.get('Origin');
  const envOrigin = env && env.CORS_ORIGIN;
  let origin = DEFAULT_ORIGIN;
  if (reqOrigin && ALLOWED_ORIGINS.has(reqOrigin)) origin = reqOrigin;
  else if (envOrigin && ALLOWED_ORIGINS.has(envOrigin)) origin = envOrigin;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Via-Proxy',
    'Access-Control-Max-Age': '86400',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Vary': 'Origin'
  };
}

export function json(data, env, status = 200, extra = {}, request = null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(env, request),
      ...extra
    }
  });
}

export function error(status, code, env, msg, request = null) {
  return json({ error: code, message: msg || code }, env, status, {}, request);
}

export function setSessionCookie(name, value, opts = {}) {
  const parts = [`${name}=${value}`, 'Path=/', 'HttpOnly', 'Secure', 'SameSite=Strict'];
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${opts.maxAge}`);
  return parts.join('; ');
}

export function readSessionCookie(request) {
  const cookie = request.headers.get('Cookie') || '';
  const m = cookie.match(/(?:^|; ?)session=([^;]+)/);
  return m ? m[1] : null;
}

export function clientIp(request) {
  // Trust only CF-Connecting-IP (set by Cloudflare edge, cannot be spoofed).
  // Never trust X-Forwarded-For (C-1: attacker-supplied header).
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}
