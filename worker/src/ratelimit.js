// KV-based fixed-window rate limit.
// NOTE (M-1/C-2 in audit): This uses non-atomic get+put on KV, which is
// eventually consistent → real limits may exceed the configured max under
// bursts. For hard guarantees use Durable Objects or Cloudflare's Rate
// Limiting bindings. Reasonable protection for casual abuse; not for
// determined attackers.

export async function checkRateLimit(env, key, maxOverride, winOverride) {
  const max = Number(maxOverride ?? env.LOGIN_RATE_MAX) || 5;
  const win = Number(winOverride ?? env.LOGIN_RATE_WINDOW_SECONDS) || 60;
  const bucket = 'rl:' + key;
  const raw = await env.RATE_LIMIT.get(bucket);
  const count = raw ? Number(raw) : 0;
  if (count >= max) return { allowed: false, count, max, resetInSec: win };
  await env.RATE_LIMIT.put(bucket, String(count + 1), { expirationTtl: win });
  return { allowed: true, count: count + 1, max, resetInSec: win };
}
