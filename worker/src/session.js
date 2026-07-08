import { readSessionCookie } from './http.js';

const enc = new TextEncoder();
const dec = new TextDecoder();

async function hmac(secretHex, data) {
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
  if (hex.length % 2) throw new Error('bad hex');
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}
function b64urlEncode(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function issueSessionToken(uid, env) {
  const nonce = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const payload = `${uid}.${nonce}.${now}`;
  const sig = await hmac(env.SESSION_KEY_HEX, payload);
  const token = `${payload}.${sig}`;
  await env.SESSIONS.put(
    token,
    JSON.stringify({ uid, issuedAt: now }),
    { expirationTtl: Number(env.SESSION_TTL_SECONDS) }
  );
  return token;
}

export async function getSession(request, env) {
  // Prefer Authorization: Bearer <token>. Fallback to session cookie.
  // Bearer path is needed for the Apps Script proxy flow (cookies are scoped to
  // script.google.com, not workers.dev, so we pass the token in a header).
  const authHeader = request.headers.get('Authorization') || '';
  const bearerMatch = authHeader.match(/^Bearer\s+([^\s]+)$/i);
  const token = bearerMatch ? bearerMatch[1] : readSessionCookie(request);
  if (!token) return null;
  const raw = await env.SESSIONS.get(token, 'json');
  if (!raw) return null;
  const parts = token.split('.');
  if (parts.length !== 4) return null;
  const [uid, nonce, iat, sig] = parts;
  const expected = await hmac(env.SESSION_KEY_HEX, `${uid}.${nonce}.${iat}`);
  if (expected !== sig) return null;
  return { ...raw, token };
}

export async function revokeSession(token, env) {
  if (token) await env.SESSIONS.delete(token);
}
