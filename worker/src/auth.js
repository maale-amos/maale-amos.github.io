import { json, error, setCookie, corsHeaders } from './http.js';

function normPhone(p) {
  const d = (p || '').replace(/\D/g, '');
  if (d.startsWith('972')) return '+' + d;
  if (d.startsWith('0'))   return '+972' + d.slice(1);
  if (d.length === 9)      return '+972' + d;
  return null;
}

function otp6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Yemot SMS — for phones that accept text messages
async function sendOTPviaSMS(env, phone, code) {
  const url = 'https://www.call2all.co.il/ym/api/RunCampaign' +
    `?token=${env.YEMOT_USER}:${env.YEMOT_PASS}` +
    `&templateId=SMSTemplate&phoneNumbers=${encodeURIComponent(phone)}` +
    `&smsText=${encodeURIComponent(`קוד גישה לאתר מעלה עמוס: ${code} (בתוקף 5 דקות)`)}`;
  const res = await fetch(url);
  return res.ok;
}

// Yemot voice call TTS — for kosher phones (no SMS). Yemot dials phone and
// reads code with 3s pauses. Falls back to Israeli feminine voice.
async function sendOTPviaVoice(env, phone, code) {
  const digits = code.split('').join(' ');   // "123456" → "1 2 3 4 5 6" for clarity
  const say = `קוד הגישה שלך לאתר מעלה עמוס הוא: ${digits}. אני חוזרת: ${digits}. הקוד בתוקף חמש דקות. שלום.`;
  const url = 'https://www.call2all.co.il/ym/api/RunCampaign' +
    `?token=${env.YEMOT_USER}:${env.YEMOT_PASS}` +
    `&templateId=OutgoingCallTemplate&phoneNumbers=${encodeURIComponent(phone)}` +
    `&ttsText=${encodeURIComponent(say)}` +
    `&ttsVoice=Sivan_Neural`;
  const res = await fetch(url);
  return res.ok;
}

async function sign(payload, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function newSessionToken(uid, secret) {
  const nonce = crypto.randomUUID();
  const sig = await sign(`${uid}:${nonce}`, secret);
  return `${uid}.${nonce}.${sig}`;
}

export async function handleAuth(request, env, path) {
  if (request.method !== 'POST') return error(405, 'method_not_allowed', env);
  const body = await request.json().catch(() => ({}));

  if (path === '/api/auth/request') {
    const phone = normPhone(body.phone);
    if (!phone) return error(400, 'bad_phone', env);

    // deliver: 'sms' (default) or 'voice' for kosher phones without SMS
    const deliver = body.deliver === 'voice' ? 'voice' : 'sms';

    const row = await env.DB.prepare('SELECT id, active FROM residents WHERE phone = ?')
      .bind(phone).first();
    if (!row || !row.active) return error(403, 'not_registered', env);

    const code = otp6();
    await env.OTP.put(phone, code, { expirationTtl: Number(env.OTP_TTL_SECONDS) });

    const sent = deliver === 'voice'
      ? await sendOTPviaVoice(env, phone, code)
      : await sendOTPviaSMS(env, phone, code);
    if (!sent) return error(502, `${deliver}_failed`, env);

    return json({ ok: true, deliver, expiresIn: Number(env.OTP_TTL_SECONDS) }, env);
  }

  if (path === '/api/auth/verify') {
    const phone = normPhone(body.phone);
    const code  = String(body.code || '').trim();
    if (!phone || !code) return error(400, 'missing_fields', env);

    const expected = await env.OTP.get(phone);
    if (!expected || expected !== code) return error(401, 'bad_code', env);
    await env.OTP.delete(phone);

    const user = await env.DB.prepare(
      'SELECT id, family_name, first_name, role FROM residents WHERE phone = ? AND active = 1'
    ).bind(phone).first();
    if (!user) return error(403, 'not_registered', env);

    const token = await newSessionToken(user.id, env.JWT_SECRET);
    const session = {
      uid: user.id,
      role: user.role,
      name: `${user.first_name || ''} ${user.family_name}`.trim(),
      createdAt: Date.now()
    };
    await env.SESSIONS.put(token, JSON.stringify(session), {
      expirationTtl: Number(env.SESSION_TTL_SECONDS)
    });

    return json({ ok: true, user: session }, env, 200, {
      'Set-Cookie': setCookie('session', token, { maxAge: env.SESSION_TTL_SECONDS })
    });
  }

  if (path === '/api/auth/logout') {
    const cookie = request.headers.get('Cookie') || '';
    const m = cookie.match(/session=([^;]+)/);
    if (m) await env.SESSIONS.delete(m[1]);
    return json({ ok: true }, env, 200, {
      'Set-Cookie': setCookie('session', '', { maxAge: 0 })
    });
  }

  return error(404, 'not_found', env);
}
