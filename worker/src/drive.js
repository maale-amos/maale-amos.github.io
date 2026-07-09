// drive.js — thin REST client for Google Drive from a Cloudflare Worker.
//
// Auth: OAuth 2.0 offline refresh_token flow. All three env values must be set
// via `wrangler secret put`:
//   GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET, GDRIVE_REFRESH_TOKEN
// The refresh_token is minted once by the account that owns the master folder,
// with scope: https://www.googleapis.com/auth/drive
//
// Sharing policy (Yosef): every share is to a specific email address only.
// NEVER call permissions.create with role='reader' + type='anyone'. We only
// support type='user' with a specific emailAddress.

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

// Basic env-var check. Returns null when Drive isn't configured yet so
// callers can degrade gracefully during the pre-domain deploy window.
export function driveConfigured(env) {
  return !!(env && env.GDRIVE_CLIENT_ID && env.GDRIVE_CLIENT_SECRET && env.GDRIVE_REFRESH_TOKEN);
}

// Access token cache — 55min TTL so we never race the 1h expiry.
let _tokenCache = { value: null, expiresAt: 0 };

export async function getAccessToken(env) {
  if (!driveConfigured(env)) {
    throw new Error('drive_not_configured');
  }
  const now = Date.now();
  if (_tokenCache.value && _tokenCache.expiresAt > now + 30_000) {
    return _tokenCache.value;
  }
  const params = new URLSearchParams({
    client_id: env.GDRIVE_CLIENT_ID,
    client_secret: env.GDRIVE_CLIENT_SECRET,
    refresh_token: env.GDRIVE_REFRESH_TOKEN,
    grant_type: 'refresh_token'
  });
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error('drive_token_failed:' + r.status + ':' + t.slice(0, 200));
  }
  const j = await r.json();
  _tokenCache = { value: j.access_token, expiresAt: now + (j.expires_in || 3500) * 1000 };
  return j.access_token;
}

// Create a folder inside the root folder. Returns the new folder's id.
export async function createFolder(env, name, parentId) {
  const tok = await getAccessToken(env);
  const r = await fetch(`${DRIVE_API}/files?fields=id,name,parents`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tok}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: String(name || '').slice(0, 120),
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined
    })
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error('drive_create_folder:' + r.status + ':' + t.slice(0, 200));
  }
  const j = await r.json();
  return j.id;
}

// Share a Drive resource with a specific user email. Enforces user+email
// combination — never anyone/anyDomain/link (Yosef's rule).
export async function shareToUser(env, fileId, emailAddress, role) {
  if (!emailAddress || typeof emailAddress !== 'string' || !/@/.test(emailAddress)) {
    throw new Error('bad_email_for_share');
  }
  role = ['reader', 'commenter', 'writer'].includes(role) ? role : 'reader';
  const tok = await getAccessToken(env);
  const r = await fetch(`${DRIVE_API}/files/${encodeURIComponent(fileId)}/permissions?sendNotificationEmail=false&fields=id,role,emailAddress`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tok}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'user', role, emailAddress })
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error('drive_share:' + r.status + ':' + t.slice(0, 200));
  }
  return await r.json();
}

// Multipart upload: metadata + binary body. Returns the new file's id + webViewLink.
export async function uploadFile(env, parentFolderId, filename, contentType, uint8Data) {
  const tok = await getAccessToken(env);
  const boundary = '----MABoundary' + crypto.randomUUID();
  const enc = new TextEncoder();
  const meta = JSON.stringify({
    name: String(filename || '').slice(0, 200),
    parents: [parentFolderId]
  });
  // Build multipart body as Uint8Array
  const pre = enc.encode(
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${meta}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${contentType || 'application/octet-stream'}\r\n\r\n`
  );
  const suf = enc.encode(`\r\n--${boundary}--`);
  const body = new Uint8Array(pre.length + uint8Data.length + suf.length);
  body.set(pre, 0);
  body.set(uint8Data, pre.length);
  body.set(suf, pre.length + uint8Data.length);

  const r = await fetch(`${UPLOAD_API}/files?uploadType=multipart&fields=id,name,size,mimeType,webViewLink`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tok}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error('drive_upload:' + r.status + ':' + t.slice(0, 200));
  }
  return await r.json();
}

// Download binary as ArrayBuffer.
export async function downloadFile(env, fileId) {
  const tok = await getAccessToken(env);
  const r = await fetch(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`, {
    headers: { 'Authorization': `Bearer ${tok}` }
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error('drive_download:' + r.status + ':' + t.slice(0, 200));
  }
  return await r.arrayBuffer();
}

// Delete a file (used when cleaning up on committee reject etc.).
export async function deleteFile(env, fileId) {
  const tok = await getAccessToken(env);
  const r = await fetch(`${DRIVE_API}/files/${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tok}` }
  });
  if (!r.ok && r.status !== 404) {
    const t = await r.text();
    throw new Error('drive_delete:' + r.status + ':' + t.slice(0, 200));
  }
  return true;
}

// Utility: base64 → Uint8Array.
export function b64ToUint8(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Utility: Uint8Array → base64 (via Blob route for large payloads).
export function uint8ToB64(u8) {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    bin += String.fromCharCode.apply(null, u8.subarray(i, i + chunk));
  }
  return btoa(bin);
}
