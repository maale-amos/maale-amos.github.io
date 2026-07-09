// klita.js — endpoints for the community-registration (קליטה) flow.
// Roles used: 'family' (applicant), 'committee' (ועדת קבלה), 'admin' (רכז).
// Data model: admins → 1:1 applicants → 1:N application_forms.

import { json, error, clientIp, setSessionCookie } from './http.js';
import { verifyPassword, hashPassword } from './password.js';
import { issueSessionToken, getSession } from './session.js';
import { checkRateLimit } from './ratelimit.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEB_TEXT_RE = /^[\p{L}\p{N}\s'\-.,()]{1,120}$/u;
const ID_RE = /^\d{5,9}$/;
const PHONE_RE = /^[\d+\-() ]{7,20}$/;

function pickApplicantFields(input) {
  // Coerce and strip anything not on the whitelist. Keeps writes deterministic
  // and blocks prototype-pollution vectors.
  const out = {};
  const s = (v) => (typeof v === 'string' ? v.trim().slice(0, 200) : '');
  out.family_name  = s(input.family_name);
  out.husband_name = s(input.husband_name);
  out.wife_name    = s(input.wife_name);
  out.husband_id   = s(input.husband_id);
  out.wife_id      = s(input.wife_id);
  out.phone        = s(input.phone);
  out.email        = s(input.email);
  out.address      = s(input.address);
  const track = s(input.track);
  out.track = ['buy','rent','plot'].includes(track) ? track : 'buy';
  return out;
}

function validateApplicant(a, { requireContact = true } = {}) {
  const errs = [];
  if (!a.family_name || !HEB_TEXT_RE.test(a.family_name)) errs.push('family_name');
  if (a.husband_name && !HEB_TEXT_RE.test(a.husband_name)) errs.push('husband_name');
  if (a.wife_name && !HEB_TEXT_RE.test(a.wife_name)) errs.push('wife_name');
  if (a.husband_id && !ID_RE.test(a.husband_id)) errs.push('husband_id');
  if (a.wife_id && !ID_RE.test(a.wife_id)) errs.push('wife_id');
  if (a.phone && !PHONE_RE.test(a.phone)) errs.push('phone');
  if (a.email && !EMAIL_RE.test(a.email)) errs.push('email');
  if (requireContact && !a.phone && !a.email) errs.push('phone_or_email');
  return errs;
}

// ---------- registration + login ----------

// Email normalization: NFKC + strip zero-width chars + ASCII-only enforcement.
// Blocks homograph/impersonation registrations like admin​@x.com
// (audit 2026-07-09).
function normalizeEmail(raw) {
  const s = String(raw || '')
    .normalize('NFKC')
    .replace(/[​-‏‪-‮⁠﻿]/g, '')  // zero-widths + bidi
    .trim()
    .toLowerCase();
  return s;
}
function isAsciiEmail(s) {
  return /^[\x21-\x7E]+@[\x21-\x7E]+$/.test(s) && EMAIL_RE.test(s);
}

export async function handleKlitaRegister(request, env) {
  if (request.method !== 'POST') return error(405, 'method_not_allowed', env);
  const ip = clientIp(request);
  // Register is heavier on abuse than login (creates records) — cap tight.
  const rate = await checkRateLimit(env, `reg:${ip}`, 3, 3600);
  if (!rate.allowed) return error(429, 'too_many_attempts', env);

  const raw = await request.text();
  if (raw.length > 8192) return error(413, 'payload_too_large', env);
  let body; try { body = JSON.parse(raw); } catch { return error(400, 'bad_json', env); }

  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  if (!email || email.length > 254 || !isAsciiEmail(email)) return error(400, 'bad_email', env);
  if (password.length < 10 || password.length > 512) {
    return error(400, 'weak_password', env, 'סיסמה חייבת להיות באורך 10-512 תווים');
  }
  const applicant = pickApplicantFields(body);
  const vErrs = validateApplicant(applicant, { requireContact: false });
  if (vErrs.length) return error(400, 'validation', env, 'שדות לא תקינים: ' + vErrs.join(', '));

  const existing = await env.DB.prepare('SELECT id FROM admins WHERE username = ?').bind(email).first();
  if (existing) return error(409, 'email_taken', env, 'הכתובת כבר רשומה');

  const hash = await hashPassword(password);
  const now = Math.floor(Date.now() / 1000);
  const ins = await env.DB.prepare(
    'INSERT INTO admins (username, password_hash, role, email, password_changed_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(email, hash, 'family', email, now).run();
  const uid = ins.meta.last_row_id;

  await env.DB.prepare(
    `INSERT INTO applicants (user_id, family_name, husband_name, wife_name, husband_id, wife_id,
                              phone, email, address, track)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    uid, applicant.family_name, applicant.husband_name || null, applicant.wife_name || null,
    applicant.husband_id || null, applicant.wife_id || null,
    applicant.phone || null, applicant.email || email, applicant.address || null, applicant.track
  ).run();

  try {
    await env.DB.prepare('INSERT INTO audit_log (actor_id, action, ip) VALUES (?, ?, ?)')
      .bind(uid, 'klita_register', ip).run();
  } catch (e) { console.error('audit klita_register', e); }

  const token = await issueSessionToken(uid, env);
  return json({
    ok: true,
    user: { id: uid, username: email, role: 'family' },
    sessionToken: token
  }, env, 200, {
    'Set-Cookie': setSessionCookie('session', token, { maxAge: Number(env.SESSION_TTL_SECONDS) })
  }, request);
}

// ---------- read own applicant record (for auto-fill) ----------

export async function handleKlitaMe(request, env) {
  if (request.method !== 'GET') return error(405, 'method_not_allowed', env);
  const s = await getSession(request, env);
  if (!s) return error(401, 'unauthorized', env);

  const applicant = await env.DB.prepare(
    `SELECT id, family_name, husband_name, wife_name, husband_id, wife_id,
            phone, email, address, track, current_stage, status, created_at, updated_at
     FROM applicants WHERE user_id = ?`
  ).bind(s.uid).first();
  if (!applicant) return json({ ok: true, applicant: null, forms: [] }, env, 200, {}, request);

  const forms = await env.DB.prepare(
    'SELECT id, form_type, status, created_at, updated_at FROM application_forms WHERE applicant_id = ? ORDER BY updated_at DESC LIMIT 50'
  ).bind(applicant.id).all();

  return json({ ok: true, applicant, forms: forms.results || [] }, env, 200, {}, request);
}

// ---------- upsert applicant fields (auto-fill source) ----------

export async function handleKlitaApplicant(request, env) {
  if (request.method !== 'POST') return error(405, 'method_not_allowed', env);
  const s = await getSession(request, env);
  if (!s) return error(401, 'unauthorized', env);

  const raw = await request.text();
  if (raw.length > 8192) return error(413, 'payload_too_large', env);
  let body; try { body = JSON.parse(raw); } catch { return error(400, 'bad_json', env); }
  const applicant = pickApplicantFields(body);
  const errs = validateApplicant(applicant, { requireContact: false });
  if (errs.length) return error(400, 'validation', env, 'שדות לא תקינים: ' + errs.join(', '));

  const now = Math.floor(Date.now() / 1000);
  const existing = await env.DB.prepare('SELECT id FROM applicants WHERE user_id = ?').bind(s.uid).first();
  if (existing) {
    await env.DB.prepare(
      `UPDATE applicants SET family_name=?, husband_name=?, wife_name=?, husband_id=?, wife_id=?,
                             phone=?, email=?, address=?, track=?, updated_at=? WHERE id=?`
    ).bind(
      applicant.family_name, applicant.husband_name || null, applicant.wife_name || null,
      applicant.husband_id || null, applicant.wife_id || null,
      applicant.phone || null, applicant.email || null, applicant.address || null,
      applicant.track, now, existing.id
    ).run();
    return json({ ok: true, applicant_id: existing.id }, env, 200, {}, request);
  } else {
    const ins = await env.DB.prepare(
      `INSERT INTO applicants (user_id, family_name, husband_name, wife_name, husband_id, wife_id,
                                phone, email, address, track)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      s.uid, applicant.family_name, applicant.husband_name || null, applicant.wife_name || null,
      applicant.husband_id || null, applicant.wife_id || null,
      applicant.phone || null, applicant.email || null, applicant.address || null, applicant.track
    ).run();
    return json({ ok: true, applicant_id: ins.meta.last_row_id }, env, 200, {}, request);
  }
}

// ---------- save a form submission ----------

const ALLOWED_FORM_TYPES = new Set(['questionnaire', 'medical', 'financial', 'stage']);

// Recursive prototype-pollution guard for nested payloads (audit 2026-07-09).
function hasBadKeys(v, depth = 0) {
  if (v === null || typeof v !== 'object' || depth > 30) return false;
  if (Array.isArray(v)) return v.some(x => hasBadKeys(x, depth + 1));
  for (const k of Object.keys(v)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') return true;
    if (hasBadKeys(v[k], depth + 1)) return true;
  }
  return false;
}

export async function handleKlitaFormSave(request, env) {
  if (request.method !== 'POST') return error(405, 'method_not_allowed', env);
  const s = await getSession(request, env);
  if (!s) return error(401, 'unauthorized', env);

  const raw = await request.text();
  if (raw.length > 128 * 1024) return error(413, 'payload_too_large', env);
  let body; try { body = JSON.parse(raw); } catch { return error(400, 'bad_json', env); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return error(400, 'bad_json', env);
  if (hasBadKeys(body)) return error(400, 'bad_json', env, 'forbidden object key');

  const formType = String(body.form_type || '').trim();
  if (!ALLOWED_FORM_TYPES.has(formType)) return error(400, 'bad_form_type', env);
  const status = ['draft','submitted'].includes(body.status) ? body.status : 'draft';
  const formData = body.form_data && typeof body.form_data === 'object' && !Array.isArray(body.form_data)
    ? body.form_data : {};
  const dataJson = JSON.stringify(formData);
  if (dataJson.length > 100 * 1024) return error(413, 'form_too_large', env);

  const applicant = await env.DB.prepare('SELECT id FROM applicants WHERE user_id = ?').bind(s.uid).first();
  if (!applicant) return error(400, 'no_applicant', env, 'יש להשלים פרטי משפחה קודם');

  // Cap forms per applicant to prevent D1 bloat DoS by an authenticated user.
  const cnt = await env.DB.prepare('SELECT COUNT(*) as c FROM application_forms WHERE applicant_id = ?').bind(applicant.id).first();
  if (!body.form_id && cnt && Number(cnt.c) >= 100) return error(429, 'too_many_forms', env, 'הגעת למקסימום 100 טפסים');

  // Applicant auto-fill promotion — restricted to form_type='questionnaire'
  // (audit M-1) and validated with the same rules as the applicant endpoint,
  // so garbage form data can't corrupt the profile.
  if (formType === 'questionnaire') {
    const applicantFields = pickApplicantFields(formData);
    if (applicantFields.family_name) {
      const errs = validateApplicant(applicantFields, { requireContact: false });
      if (errs.length) return error(400, 'validation', env, 'שדות בטופס לא תקינים: ' + errs.join(', '));
      await env.DB.prepare(
        `UPDATE applicants SET family_name=COALESCE(NULLIF(?, ''), family_name),
                               husband_name=COALESCE(NULLIF(?, ''), husband_name),
                               wife_name=COALESCE(NULLIF(?, ''), wife_name),
                               husband_id=COALESCE(NULLIF(?, ''), husband_id),
                               wife_id=COALESCE(NULLIF(?, ''), wife_id),
                               phone=COALESCE(NULLIF(?, ''), phone),
                               email=COALESCE(NULLIF(?, ''), email),
                               address=COALESCE(NULLIF(?, ''), address),
                               updated_at=unixepoch()
         WHERE id=?`
      ).bind(
        applicantFields.family_name, applicantFields.husband_name, applicantFields.wife_name,
        applicantFields.husband_id, applicantFields.wife_id, applicantFields.phone,
        applicantFields.email, applicantFields.address, applicant.id
      ).run();
    }
  }

  let formId;
  if (body.form_id) {
    // form_id must be a positive integer
    const fid = Number(body.form_id);
    if (!Number.isInteger(fid) || fid <= 0) return error(400, 'bad_form_id', env);
    // Enforce form_type match on update to prevent type spoofing (audit H-1).
    const own = await env.DB.prepare('SELECT id, form_type FROM application_forms WHERE id=? AND applicant_id=?')
      .bind(fid, applicant.id).first();
    if (!own) return error(404, 'form_not_found', env);
    if (own.form_type !== formType) return error(400, 'form_type_mismatch', env);
    await env.DB.prepare(
      'UPDATE application_forms SET form_data=?, status=?, updated_at=unixepoch() WHERE id=?'
    ).bind(dataJson, status, own.id).run();
    formId = own.id;
  } else {
    const ins = await env.DB.prepare(
      'INSERT INTO application_forms (applicant_id, form_type, form_data, status) VALUES (?, ?, ?, ?)'
    ).bind(applicant.id, formType, dataJson, status).run();
    formId = ins.meta.last_row_id;
  }

  try {
    await env.DB.prepare('INSERT INTO audit_log (actor_id, action, target, ip) VALUES (?, ?, ?, ?)')
      .bind(s.uid, `klita_form_${status}`, `${formType}:${formId}`, clientIp(request)).run();
  } catch (e) { console.error('audit klita_form', e); }

  return json({ ok: true, form_id: formId, status }, env, 200, {}, request);
}

// ---------- list / get form (for pre-fill of new submissions) ----------

export async function handleKlitaFormGet(request, env, formId) {
  if (request.method !== 'GET') return error(405, 'method_not_allowed', env);
  const s = await getSession(request, env);
  if (!s) return error(401, 'unauthorized', env);
  const id = Number(formId);
  if (!Number.isInteger(id) || id <= 0) return error(400, 'bad_id', env);

  // Explicit split (audit C-2 fix): family users go through the owner-scoped
  // JOIN. Only committee/admin may read any form. viewer/other roles get 403.
  if (s.role === 'family' || s.role === 'viewer') {
    const row = await env.DB.prepare(
      `SELECT f.id, f.form_type, f.form_data, f.status, f.created_at, f.updated_at, f.applicant_id
       FROM application_forms f
       JOIN applicants a ON a.id = f.applicant_id
       WHERE f.id = ? AND a.user_id = ?`
    ).bind(id, s.uid).first();
    if (!row) return error(404, 'not_found', env);
    let data; try { data = JSON.parse(row.form_data); } catch { data = null; }
    return json({ ok: true, form: { ...row, form_data: data } }, env, 200, {}, request);
  }
  if (s.role === 'committee' || s.role === 'admin') {
    const anyRow = await env.DB.prepare(
      'SELECT id, applicant_id, form_type, form_data, status, created_at, updated_at FROM application_forms WHERE id = ?'
    ).bind(id).first();
    if (!anyRow) return error(404, 'not_found', env);
    let data; try { data = JSON.parse(anyRow.form_data); } catch { data = null; }
    return json({ ok: true, form: { ...anyRow, form_data: data } }, env, 200, {}, request);
  }
  return error(403, 'forbidden', env);
}
