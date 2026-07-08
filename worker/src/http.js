const ALLOWED_ORIGIN = 'https://maale-amos.github.io';

export function corsHeaders(env) {
  // Fallback to the constant if env var missing — never send bare '*'
  // because credentials:'include' requires exact origin.
  const origin = (env && env.CORS_ORIGIN) || ALLOWED_ORIGIN;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

export function json(data, env, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(env),
      ...extra
    }
  });
}

export function error(status, code, env, msg) {
  return json({ error: code, message: msg || code }, env, status);
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
  return request.headers.get('CF-Connecting-IP')
      || request.headers.get('X-Forwarded-For')?.split(',')[0]
      || 'unknown';
}
