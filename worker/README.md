# maale-amos-api — Cloudflare Worker backend

Backend for the Maale Amos site (Phase 3 of rebuild). Handles auth, resident
directory, dynamic content editing.

## Endpoints

| Method | Path                        | Auth        | Purpose                      |
|--------|-----------------------------|-------------|------------------------------|
| POST   | /api/auth/request           | —           | Send OTP via Yemot SMS       |
| POST   | /api/auth/verify            | —           | Verify OTP, set session      |
| POST   | /api/auth/logout            | session     | Clear session                |
| GET    | /api/me                     | session     | Current user                 |
| GET    | /api/residents?q=&page=     | session     | Paged directory              |
| GET    | /api/content/:section       | —           | Read dynamic section         |
| POST   | /api/content/:section       | admin       | Overwrite dynamic section    |

## Deploy (one-time)

```bash
cd worker
npm install -g wrangler
wrangler login

# Create resources
wrangler kv:namespace create SESSIONS
wrangler kv:namespace create OTP
wrangler d1 create maale-amos

# Update wrangler.toml with the returned IDs
# Then create schema:
wrangler d1 execute maale-amos --file=schema.sql

# Set secrets
wrangler secret put JWT_SECRET       # 32-byte hex
wrangler secret put YEMOT_USER
wrangler secret put YEMOT_PASS
wrangler secret put ADMIN_PIN_HASH   # bcrypt

# Deploy
wrangler deploy
```

## Security notes

- Sessions stored in KV (opaque token, 30-day TTL). No JWT on client.
- OTP TTL 5 min, single-use, deleted on verify.
- CORS locked to `https://maale-amos.github.io` (production) via env var.
- All PII stays server-side. Client sees only session cookie.
- Phone normalization: `+972` canonical.

## Local dev

```bash
wrangler dev --local
```
