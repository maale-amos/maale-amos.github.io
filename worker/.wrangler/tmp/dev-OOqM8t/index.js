var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/http.js
var ALLOWED_ORIGIN = "https://maale-amos.github.io";
function corsHeaders(env) {
  const origin = env && env.CORS_ORIGIN || ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
__name(corsHeaders, "corsHeaders");
function json(data, env, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(env),
      ...extra
    }
  });
}
__name(json, "json");
function error(status, code, env, msg) {
  return json({ error: code, message: msg || code }, env, status);
}
__name(error, "error");
function setSessionCookie(name, value, opts = {}) {
  const parts = [`${name}=${value}`, "Path=/", "HttpOnly", "Secure", "SameSite=Strict"];
  if (opts.maxAge !== void 0) parts.push(`Max-Age=${opts.maxAge}`);
  return parts.join("; ");
}
__name(setSessionCookie, "setSessionCookie");
function readSessionCookie(request) {
  const cookie = request.headers.get("Cookie") || "";
  const m = cookie.match(/(?:^|; ?)session=([^;]+)/);
  return m ? m[1] : null;
}
__name(readSessionCookie, "readSessionCookie");
function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For")?.split(",")[0] || "unknown";
}
__name(clientIp, "clientIp");

// src/password.js
var ITERATIONS = 21e4;
var KEY_BITS = 256;
var SALT_BYTES = 16;
function b64encode(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
__name(b64encode, "b64encode");
function b64decode(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
__name(b64decode, "b64decode");
async function pbkdf2(password, saltBytes, iterations) {
  const enc2 = new TextEncoder();
  const keyMat = await crypto.subtle.importKey(
    "raw",
    enc2.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations },
    keyMat,
    KEY_BITS
  );
  return new Uint8Array(bits);
}
__name(pbkdf2, "pbkdf2");
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await pbkdf2(password, salt, ITERATIONS);
  return `${ITERATIONS}$${b64encode(salt)}$${b64encode(hash)}`;
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, stored) {
  try {
    const [iterStr, saltB64, hashB64] = stored.split("$");
    const iter = parseInt(iterStr, 10);
    if (!iter || !saltB64 || !hashB64) return false;
    const salt = b64decode(saltB64);
    const expect = b64decode(hashB64);
    const got = await pbkdf2(password, salt, iter);
    if (got.length !== expect.length) return false;
    let diff = 0;
    for (let i = 0; i < got.length; i++) diff |= got[i] ^ expect[i];
    return diff === 0;
  } catch {
    return false;
  }
}
__name(verifyPassword, "verifyPassword");

// src/session.js
var enc = new TextEncoder();
var dec = new TextDecoder();
async function hmac(secretHex, data) {
  const key = await crypto.subtle.importKey(
    "raw",
    hexToBytes(secretHex),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64urlEncode(new Uint8Array(sig));
}
__name(hmac, "hmac");
function hexToBytes(hex) {
  if (hex.length % 2) throw new Error("bad hex");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}
__name(hexToBytes, "hexToBytes");
function b64urlEncode(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(b64urlEncode, "b64urlEncode");
async function issueSessionToken(uid, env) {
  const nonce = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1e3);
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
__name(issueSessionToken, "issueSessionToken");
async function getSession(request, env) {
  const authHeader = request.headers.get("Authorization") || "";
  const bearerMatch = authHeader.match(/^Bearer\s+([^\s]+)$/i);
  const token = bearerMatch ? bearerMatch[1] : readSessionCookie(request);
  if (!token) return null;
  const raw = await env.SESSIONS.get(token, "json");
  if (!raw) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [uid, nonce, iat, sig] = parts;
  const expected = await hmac(env.SESSION_KEY_HEX, `${uid}.${nonce}.${iat}`);
  if (expected !== sig) return null;
  return { ...raw, token };
}
__name(getSession, "getSession");
async function revokeSession(token, env) {
  if (token) await env.SESSIONS.delete(token);
}
__name(revokeSession, "revokeSession");

// src/ratelimit.js
async function checkRateLimit(env, key) {
  const max = Number(env.LOGIN_RATE_MAX);
  const win = Number(env.LOGIN_RATE_WINDOW_SECONDS);
  const bucket = "rl:" + key;
  const raw = await env.RATE_LIMIT.get(bucket);
  const count = raw ? Number(raw) : 0;
  if (count >= max) return { allowed: false, count, max, resetInSec: win };
  await env.RATE_LIMIT.put(bucket, String(count + 1), { expirationTtl: win });
  return { allowed: true, count: count + 1, max, resetInSec: win };
}
__name(checkRateLimit, "checkRateLimit");

// src/index.js
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }
    try {
      if (path === "/api/admin/login") return await handleLogin(request, env);
      if (path === "/api/admin/logout") return await handleLogout(request, env);
      if (path === "/api/admin/change-password") return await handleChangePassword(request, env);
      if (path === "/api/me") return await handleMe(request, env);
      if (path.startsWith("/api/content/")) return await handleContent(request, env, path);
      return error(404, "not_found", env);
    } catch (e) {
      console.error("unhandled:", e && e.stack || e);
      return error(500, "internal_error", env, String(e && e.message || "internal_error"));
    }
  }
};
async function handleLogin(request, env) {
  if (request.method !== "POST") return error(405, "method_not_allowed", env);
  const ip = clientIp(request);
  const rate = await checkRateLimit(env, ip);
  if (!rate.allowed) return error(429, "too_many_attempts", env, `\u05E0\u05E1\u05D9\u05D5\u05E0\u05D5\u05EA \u05D4\u05EA\u05D7\u05D1\u05E8\u05D5\u05EA \u05E8\u05D1\u05D9\u05DD \u05DE\u05D3\u05D9. \u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1 \u05E2\u05D5\u05D3 ${rate.resetInSec} \u05E9\u05E0\u05D9\u05D5\u05EA.`);
  const body = await request.json().catch(() => ({}));
  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!username || !password) return error(400, "missing_fields", env);
  const row = await env.DB.prepare(
    "SELECT id, password_hash, role FROM admins WHERE username = ?"
  ).bind(username).first();
  if (!row) return error(401, "bad_credentials", env, "\u05E9\u05DD \u05DE\u05E9\u05EA\u05DE\u05E9 \u05D0\u05D5 \u05E1\u05D9\u05E1\u05DE\u05D4 \u05E9\u05D2\u05D5\u05D9\u05D9\u05DD");
  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) return error(401, "bad_credentials", env, "\u05E9\u05DD \u05DE\u05E9\u05EA\u05DE\u05E9 \u05D0\u05D5 \u05E1\u05D9\u05E1\u05DE\u05D4 \u05E9\u05D2\u05D5\u05D9\u05D9\u05DD");
  const token = await issueSessionToken(row.id, env);
  await env.DB.prepare("UPDATE admins SET last_login_at = unixepoch() WHERE id = ?").bind(row.id).run();
  await env.DB.prepare(
    "INSERT INTO audit_log (actor_id, action, ip) VALUES (?, ?, ?)"
  ).bind(row.id, "login", ip).run();
  return json({
    ok: true,
    user: { id: row.id, username, role: row.role },
    sessionToken: token
  }, env, 200, {
    "Set-Cookie": setSessionCookie("session", token, { maxAge: Number(env.SESSION_TTL_SECONDS) })
  });
}
__name(handleLogin, "handleLogin");
async function handleLogout(request, env) {
  if (request.method !== "POST") return error(405, "method_not_allowed", env);
  const s = await getSession(request, env);
  if (s) await revokeSession(s.token, env);
  return json({ ok: true }, env, 200, {
    "Set-Cookie": setSessionCookie("session", "", { maxAge: 0 })
  });
}
__name(handleLogout, "handleLogout");
async function handleChangePassword(request, env) {
  if (request.method !== "POST") return error(405, "method_not_allowed", env);
  const s = await getSession(request, env);
  if (!s) return error(401, "unauthorized", env);
  const body = await request.json().catch(() => ({}));
  const oldp = String(body.oldPassword || "");
  const newp = String(body.newPassword || "");
  if (!oldp || newp.length < 8) return error(400, "weak_password", env, "\u05E1\u05D9\u05E1\u05DE\u05D4 \u05D7\u05D3\u05E9\u05D4 \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05D9\u05D5\u05EA \u05D1\u05D0\u05D5\u05E8\u05DA \u05E9\u05DC 8 \u05EA\u05D5\u05D5\u05D9\u05DD \u05DC\u05E4\u05D7\u05D5\u05EA");
  const row = await env.DB.prepare("SELECT password_hash FROM admins WHERE id = ?").bind(s.uid).first();
  if (!row || !await verifyPassword(oldp, row.password_hash)) {
    return error(401, "bad_old_password", env, "\u05E1\u05D9\u05E1\u05DE\u05D4 \u05E0\u05D5\u05DB\u05D7\u05D9\u05EA \u05E9\u05D2\u05D5\u05D9\u05D4");
  }
  const hash = await hashPassword(newp);
  await env.DB.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").bind(hash, s.uid).run();
  await env.DB.prepare("INSERT INTO audit_log (actor_id, action, ip) VALUES (?, ?, ?)").bind(s.uid, "change-password", clientIp(request)).run();
  return json({ ok: true }, env);
}
__name(handleChangePassword, "handleChangePassword");
async function handleMe(request, env) {
  const s = await getSession(request, env);
  if (!s) return error(401, "unauthorized", env);
  const row = await env.DB.prepare("SELECT id, username, role, last_login_at FROM admins WHERE id = ?").bind(s.uid).first();
  if (!row) return error(401, "unauthorized", env);
  return json({ id: row.id, username: row.username, role: row.role, lastLoginAt: row.last_login_at }, env);
}
__name(handleMe, "handleMe");
async function handleContent(request, env, path) {
  const section = path.replace("/api/content/", "");
  if (!/^[a-z0-9_-]+$/.test(section)) return error(400, "bad_section", env);
  if (request.method === "GET") {
    const row = await env.DB.prepare("SELECT json_data, updated_at FROM content WHERE section_id = ?").bind(section).first();
    if (!row) return json({ section, data: null }, env);
    return json({ section, data: JSON.parse(row.json_data), updatedAt: row.updated_at }, env);
  }
  if (request.method === "POST") {
    const s = await getSession(request, env);
    if (!s) return error(401, "unauthorized", env);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") return error(400, "bad_json", env);
    await env.DB.prepare(
      `INSERT INTO content (section_id, json_data, updated_by, updated_at)
       VALUES (?, ?, ?, unixepoch())
       ON CONFLICT(section_id) DO UPDATE SET
         json_data  = excluded.json_data,
         updated_by = excluded.updated_by,
         updated_at = excluded.updated_at`
    ).bind(section, JSON.stringify(body), s.uid).run();
    await env.DB.prepare("INSERT INTO audit_log (actor_id, action, target, ip) VALUES (?, ?, ?, ?)").bind(s.uid, "content_write", section, clientIp(request)).run();
    return json({ ok: true, section }, env);
  }
  return error(405, "method_not_allowed", env);
}
__name(handleContent, "handleContent");

// ../../../../openclaw-app/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../openclaw-app/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error2 = reduceError(e);
    return Response.json(error2, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-vjPqM8/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../../openclaw-app/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-vjPqM8/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
