const ALLOWED_ORIGINS = new Set([
  // Current GitHub Pages front-end.
  'https://maale-amos.github.io',
  // Future custom-domain front-ends (both apex and www variants).
  'https://maale-amos.org.il',
  'https://www.maale-amos.org.il',
  // Never include '*' — Allow-Credentials + '*' is spec-rejected.
]);
const DEFAULT_ORIGIN = 'https://maale-amos.github.io';

export function corsHeaders(env, request) {
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
    // Z3 hardening: HSTS + defense-in-depth security headers on every response.
    // preload eligibility requires 1yr+ and includeSubDomains; safe since the
    // Worker only ever serves HTTPS.
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',                    // Worker responses are JSON — never frameable.
    'Referrer-Policy': 'no-referrer',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-site',
    'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), payment=(), usb=()',
    'Vary': 'Origin'
  };
}

// Z2: Anti-CSRF via Origin header check on state-changing endpoints. The
// Bearer scheme already defeats most CSRF (no credentials sent by browser
// on cross-origin fetch), but this closes the gap if a future flow adds
// cookie/basic auth. Idempotent GETs are exempt. Non-browser callers
// (curl, servers) may omit Origin — allowed only for non-mutating methods.
export function csrfCheck(request) {
  const m = request.method;
  if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return true;
  const origin = request.headers.get('Origin');
  if (!origin) return true;   // no Origin → non-browser caller (Bearer still required upstream)
  return ALLOWED_ORIGINS.has(origin);
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
