# API Reference — maale-amos-api

Base URL: `https://maale-amos-api.6742853.workers.dev` → `https://api.maale-amos.org.il` after domain migration.

Send `Content-Type: text/plain;charset=utf-8` in browser to skip CORS preflight — Worker parses regardless.

Bearer token in `Authorization: Bearer <sessionToken>` where required.

## Common error shape

```json
{ "error": "code_slug", "message": "משפט לעברית" }
```

Codes: `unauthorized`, `forbidden`, `bad_json`, `bad_email`, `bad_form_id`, `bad_section`, `weak_password`, `email_taken`, `too_many_attempts`, `payload_too_large`, `not_found`, `internal_error`, `drive_not_configured`, ...

## Endpoints (summary)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | `{ok, drive_configured, mail_enabled, time}` |
| POST | `/api/admin/login` | Public | → sessionToken |
| POST | `/api/admin/logout` | Bearer | Revoke |
| POST | `/api/admin/change-password` | Bearer | Rotate + revoke current |
| GET | `/api/me` | Bearer | Current identity |
| GET | `/api/content/:section` | Public | Public content JSON |
| POST | `/api/content/:section` | admin/editor | Overwrite (256 KB cap) |
| POST | `/api/klita/register` | Public | New family + Drive folder |
| GET | `/api/klita/me` | Bearer | Own applicant + forms |
| POST | `/api/klita/applicant` | Bearer | Upsert profile |
| POST | `/api/klita/form` | Bearer | Save form draft/submit |
| GET | `/api/klita/form/:id` | Bearer + owner/committee | Read form |
| GET | `/api/klita/export` | Bearer | GDPR archive |
| POST | `/api/klita/upload` | Bearer + owner | Upload signed PDF → Drive |
| GET | `/api/klita/uploads/:formId` | Bearer + owner | List uploads |
| GET | `/api/klita/upload/:id` | Bearer + owner | Download |
| POST | `/api/klita/stage` | Bearer | Advance stage (family 1→2 only) |
| GET | `/api/klita/committee/queue` | committee/admin | Search + filter + paginate |
| GET | `/api/klita/committee/applicant/:id` | committee/admin | Full details |
| POST | `/api/klita/committee/decide` | committee/admin | Vote |
| GET | `/api/klita/stale-drafts?days=14` | committee/admin | Nudge list, no email |

## Committee queue params

`?status=(active\|pending\|review\|approved\|rejected\|all) &q=<free text ≤60 chars> &limit=1..100 &offset=≥0`

Response includes `pagination: { total, limit, offset, filter, search }`.

## Security headers

Every response:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=(), usb=()
```

Cookies: `__Host-session=...; Path=/; HttpOnly; Secure; SameSite=Strict`.

CORS Origin allowlist: `https://maale-amos.github.io`, `https://maale-amos.org.il`, `https://www.maale-amos.org.il`.

CSRF: state-changing requests with browser Origin reject non-allowlist origins. Non-browser callers (curl) may omit `Origin` — Bearer stays authoritative.
