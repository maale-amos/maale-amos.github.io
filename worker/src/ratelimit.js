// KV-based sliding rate limit.
// Key: `login:${ip}` → counter of attempts within window.
// Simplification: fixed window using key TTL.

export async function checkRateLimit(env, key) {
  const max = Number(env.LOGIN_RATE_MAX);
  const win = Number(env.LOGIN_RATE_WINDOW_SECONDS);
  const bucket = 'rl:' + key;
  const raw = await env.RATE_LIMIT.get(bucket);
  const count = raw ? Number(raw) : 0;
  if (count >= max) return { allowed: false, count, max, resetInSec: win };
  await env.RATE_LIMIT.put(bucket, String(count + 1), { expirationTtl: win });
  return { allowed: true, count: count + 1, max, resetInSec: win };
}
