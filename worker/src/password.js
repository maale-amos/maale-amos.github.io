// PBKDF2-SHA256 password hashing/verification.
// Stored format: "iterations$salt_b64$hash_b64"
// Uses Web Crypto (available in Cloudflare Workers).

const ITERATIONS = 210000;    // OWASP 2023 rec for PBKDF2-SHA256
const KEY_BITS   = 256;
const SALT_BYTES = 16;

function b64encode(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function b64decode(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pbkdf2(password, saltBytes, iterations) {
  const enc = new TextEncoder();
  const keyMat = await crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes, iterations },
    keyMat,
    KEY_BITS
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await pbkdf2(password, salt, ITERATIONS);
  return `${ITERATIONS}$${b64encode(salt)}$${b64encode(hash)}`;
}

export async function verifyPassword(password, stored) {
  try {
    const [iterStr, saltB64, hashB64] = stored.split('$');
    const iter = parseInt(iterStr, 10);
    if (!iter || !saltB64 || !hashB64) return false;
    const salt = b64decode(saltB64);
    const expect = b64decode(hashB64);
    const got = await pbkdf2(password, salt, iter);
    // constant-time compare
    if (got.length !== expect.length) return false;
    let diff = 0;
    for (let i = 0; i < got.length; i++) diff |= got[i] ^ expect[i];
    return diff === 0;
  } catch { return false; }
}
