// Bootstrap / add / reset admin user in D1.
// Usage:
//   node scripts/create-admin.mjs <username> <password>
// Runs `wrangler d1 execute` under the hood — must be run from worker/ dir
// after `wrangler login` (or with $CLOUDFLARE_API_TOKEN set).

import { execSync } from 'node:child_process';
import { webcrypto } from 'node:crypto';

const ITERATIONS = 210000;
const SALT_BYTES = 16;

function b64encode(bytes) {
  return Buffer.from(bytes).toString('base64');
}

async function pbkdf2(password, salt) {
  const keyMat = await webcrypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
  );
  const bits = await webcrypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
    keyMat, 256
  );
  return new Uint8Array(bits);
}

async function main() {
  const username = (process.argv[2] || '').trim().toLowerCase();
  const password = process.argv[3] || '';
  if (!username || !password) {
    console.error('Usage: node scripts/create-admin.mjs <username> <password>');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const salt = webcrypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await pbkdf2(password, salt);
  const stored = `${ITERATIONS}$${b64encode(salt)}$${b64encode(hash)}`;

  const sql = `INSERT INTO admins (username, password_hash) VALUES ('${username.replace(/'/g,"''")}', '${stored}')
ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash;`;

  console.log('→ Upserting admin user:', username);
  execSync(`wrangler d1 execute maale-amos --remote --command "${sql.replace(/"/g,'\\"')}"`, { stdio: 'inherit' });
  console.log('✓ Admin ready.');
}

main().catch(e => { console.error(e); process.exit(1); });
