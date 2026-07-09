import { readSessionCookie } from './http.js';

const enc = new TextEncoder();

async function hmac(secretHex, data) {
  // Enforce a minimum key length so a mis-set env var doesn't silently
  // reduce HMAC strength (L-3 in security audit).
  if (typeof secretHex !== 'string' || secretHex.length < 64) {
    throw new Error('SESSION_KEY_HEX must be >= 32 bytes (>= 64 hex chars)');
  }
  const key = await crypto.subtle.importKey(
    'raw',
    hexToBytes(secretHex),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return b64urlEncode(new Uint8Array(sig));
}

function hexToBytes(hex) {
  // Reject non-hex — parseInt silently returns NaN which coerces to 0 in the
  // Uint8Array, resulting in an all-zero HMAC key on misconfiguration.
  // (Audit 2026-07-09 competitive review.)
  if (!/^[0-9a-fA-F]+$/.test(hex)) throw new Error('SESSION_KEY_HEX contains non-hex chars');
  if (hex.length % 2) throw new Error('bad hex');
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

// Constant-time string compare — mitigates M-1 (HMAC compare timing oracle).
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function b64urlEncode(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function issueSessionToken(uid, env) {
  // Embed the user's current password_changed_at ("gen") in the token so a
  // password change atomically invalidates all previously-issued tokens for
  // that user (H-1 in security audit). We also record `role` at issue time
  // but never trust it on read — always re-query on session verify.
  const nonce = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  let genRow = await env.DB.prepare('SELECT password_changed_at FROM admins WHERE id = ?').bind(uid).first();
  let gen = Number(genRow && genRow.password_changed_at) || 0;
  // If password_changed_at was never set (legacy row / migration), stamp it
  // NOW so gen>0 and getSession rejects gen=0. Prevents an unrevocable token.
  if (gen === 0) {
    gen = now;
    await env.DB.prepare('UPDATE admins SET password_changed_at = ? WHERE id = ? AND (password_changed_at IS NULL OR password_changed_at = 0)').bind(gen, uid).run();
  }
  const payload = `${uid}.${gen}.${nonce}.${now}`;
  const sig = await hmac(env.SESSION_KEY_HEX, payload);
  const token = `${payload}.${sig}`;
  await env.SESSIONS.put(
    token,
    JSON.stringify({ uid, gen, issuedAt: now }),
    { expirationTtl: Number(env.SESSION_TTL_SECONDS) }
  );
  return token;
}

export async function getSession(request, env) {
  // Prefer Authorization: Bearer <token>. Fallback to session cookie.
  const authHeader = request.headers.get('Authorization') || '';
  const bearerMatch = authHeader.match(/^Bearer\s+([^\s]+)$/i);
  const token = bearerMatch ? bearerMatch[1] : readSessionCookie(request);
  if (!token) return null;

  // Token shape: uid.gen.nonce.iat.sig
  const parts = token.split('.');
  if (parts.length !== 5) return null;
  const [uid, gen, nonce, iat, sig] = parts;
  if (!/^\d+$/.test(uid) || !/^\d+$/.test(gen) || !/^\d+$/.test(iat)) return null;

  // Verify HMAC BEFORE hitting KV/D1 — cheap; prevents token-existence timing
  // oracle (M-2) and saves quota on garbage input.
  const expected = await hmac(env.SESSION_KEY_HEX, `${uid}.${gen}.${nonce}.${iat}`);
  if (!timingSafeEqual(expected, sig)) return null;

  // Server-side TTL (M-3): defense in depth in case KV TTL misfires.
  const ttl = Number(env.SESSION_TTL_SECONDS) || 86400;
  if ((Math.floor(Date.now() / 1000) - Number(iat)) > ttl) return null;

  const raw = await env.SESSIONS.get(token, 'json');
  if (!raw) return null;

  // Look up the user's current role + password_changed_at. If the user has
  // rotated their password since this token was issued, the token's `gen`
  // won't match and we reject (H-1: password change invalidates all sessions).
  const user = await env.DB.prepare(
    'SELECT id, role, password_changed_at, active FROM admins WHERE id = ?'
  ).bind(Number(uid)).first();
  if (!user || !user.active) return null;
  // Reject gen=0 explicitly: prevents an admin row inserted without a
  // password_changed_at (NULL → Number 0) from having tokens that survive
  // password rotations (audit 2026-07-09). issueSessionToken now floors gen
  // to unixepoch() when 0.
  const uGen = Number(user.password_changed_at);
  const tGen = Number(gen);
  if (!uGen || !tGen) return null;
  if (uGen !== tGen) return null;

  return { uid: user.id, role: user.role, token, issuedAt: raw.issuedAt };
}

export async function revokeSession(token, env) {
  if (token) await env.SESSIONS.delete(token);
}
