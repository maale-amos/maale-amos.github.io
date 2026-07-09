// mail.js — outgoing mail helper for the klita platform.
//
// SAFETY: Sending is HARD-DISABLED by default. Yosef required that no outgoing
// message reach anyone without an explicit approval flag. Every path that
// wants to send goes through sendMail() below, which:
//   1. Refuses to send unless env.MAIL_ENABLED === 'true' AND the caller
//      supplies an explicit `approved:true` flag on the payload.
//   2. Otherwise records a would-be-sent audit_log entry (target=email) and
//      returns { queued:false, reason:'disabled' }.
//
// When you enable, plug in a real transport (Cloudflare Email Routing / SES /
// SendGrid). Kept as a stub so wiring is provably in place.
export async function sendMail(env, opts) {
  const { to, subject, body_text, body_html, approved } = opts || {};
  const enabled = env && env.MAIL_ENABLED === 'true';
  if (!enabled || approved !== true) {
    // Log the would-be-send for observability. Do NOT include body_text in the
    // log to avoid persisting PII.
    try {
      await env.DB.prepare(
        'INSERT INTO audit_log (actor_id, action, target, ip, meta) VALUES (?, ?, ?, ?, ?)'
      ).bind(0, 'mail_suppressed', String(to || '').slice(0, 128), '', JSON.stringify({
        subject: String(subject || '').slice(0, 200), enabled, approved: !!approved
      })).run();
    } catch (e) { console.error('mail_suppressed audit', e); }
    return { queued: false, reason: enabled ? 'not_approved' : 'disabled' };
  }
  // Placeholder for a real transport. Left unimplemented on purpose so
  // enabling MAIL_ENABLED without wiring transport yields a clear error, not
  // a silent successful "send".
  throw new Error('mail transport not configured — hook up SES/SendGrid here');
}
