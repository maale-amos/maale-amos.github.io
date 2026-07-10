# קהילת מעלה עמוס — אתר קהילתי + פורטל קליטה

**Live:** [maale-amos.github.io](https://maale-amos.github.io/)
**API:** [maale-amos-api.6742853.workers.dev](https://maale-amos-api.6742853.workers.dev/) (יעבור ל-`api.maale-amos.org.il`)

אתר עברית RTL לישוב מעלה עמוס בגוש עציון. שלושה תפקידים:

1. **מידע ציבורי** — לוח מודעות, זמני תפילות, טלפוני חירום, בתי כנסת, מוסדות חינוך, אטרקציות באזור.
2. **פורטל קליטה** (`/klita/`) — משפחות חדשות רושמות תיק, ממלאות שאלון הרשמה, מעלות PDF חתום, ועוקבות אחרי 10 שלבי הקליטה של הישוב.
3. **פאנל ניהול** (`/admin/`) — רכז/הנהלה עורכים תוכן הדף הציבורי + מנהלים תיקים.

---

## ארכיטקטורה

```
┌────────────────────────────┐     ┌──────────────────────────────┐
│  GitHub Pages (frontend)   │◄────│  Eleventy (Nunjucks + JSON)  │
│  https://maale-amos.       │     │  Build on push to master     │
│  github.io                 │     └──────────────────────────────┘
└──────────┬─────────────────┘
           │  HTTPS + Bearer token (localStorage)
           ▼
┌────────────────────────────┐     ┌──────────────────────────────┐
│  Cloudflare Worker (API)   │◄────│  D1 (SQLite) + KV Namespaces │
│  https://api.maale-amos... │     │  DB: admins, applicants,     │
│  Session HMAC + PBKDF2     │     │      application_forms, ...  │
│  Rate limit, CORS, HSTS    │     │  KV: SESSIONS, RATE_LIMIT    │
└──────────┬─────────────────┘     └──────────────────────────────┘
           │  OAuth refresh_token
           ▼
┌────────────────────────────┐
│  Google Drive              │
│  Folder per family +       │
│  shared to email only.     │
│  Signed PDFs stored here.  │
└────────────────────────────┘
```

**Stack:**
- Frontend: Eleventy 3 · Nunjucks · vanilla JS (no framework) · CSP-locked
- Backend: Cloudflare Workers (JavaScript ES modules) · D1 (SQLite) · KV
- Auth: PBKDF2-SHA256 (210k iterations) + HMAC-signed session tokens
- Files: Google Drive REST v3 (OAuth 2.0 refresh_token flow)

---

## API endpoints

Full details in `worker/src/index.js` (top-level router).

### Auth
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/admin/login` | Public | Username + password → session token |
| POST | `/api/admin/logout` | Bearer | Revoke session |
| POST | `/api/admin/change-password` | Bearer | Rotate password + revoke session |
| GET | `/api/me` | Bearer | Current user info |
| GET | `/api/health` | Public | Liveness + feature flags |

### Content (admin/editor only)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/content/:section` | Public | Public site content JSON |
| POST | `/api/content/:section` | admin/editor | Overwrite section content |

### Klita — registration flow
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/klita/register` | Public (rate-limited) | Create family user + applicant + Drive folder |
| GET | `/api/klita/me` | family Bearer | Applicant + forms for current user |
| POST | `/api/klita/applicant` | family Bearer | Upsert own applicant profile |
| POST | `/api/klita/form` | family Bearer | Save form draft or submission |
| GET | `/api/klita/form/:id` | family (own) or committee/admin | Read one form |
| POST | `/api/klita/upload` | family (own form) or committee/admin | Upload signed PDF → Drive |
| GET | `/api/klita/uploads/:formId` | Same as above | List uploads for a form |
| GET | `/api/klita/upload/:id` | Same as above | Download an upload |
| POST | `/api/klita/stage` | family (1→2 only), committee/admin (any) | Advance stage |

### Klita — committee (role=committee/admin)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/klita/committee/queue` | Applicants pending decision |
| GET | `/api/klita/committee/applicant/:id` | Full applicant + forms + decisions |
| POST | `/api/klita/committee/decide` | Submit decision (approve/reject/abstain/question) |

---

## Repo layout

```
├── .eleventy.js              — Eleventy config (Nunjucks + safeUrl filter)
├── SECURITY.md               — Vulnerability disclosure policy
├── STATUS.md                 — Running session log (auto-generated, verbose)
├── DEPLOY_WHEN_DOMAIN_READY.md — Runbook for Custom Domain migration
├── src/
│   ├── .well-known/
│   │   └── security.txt      — RFC 9116 contact
│   ├── _data/                — Eleventy data (nav.json, site.json, sections/*.json)
│   ├── _includes/            — Layouts + section partials
│   ├── js/
│   │   ├── config.js         — window.API_BASE (single source of truth)
│   │   ├── admin.js          — Admin panel
│   │   ├── klita.js          — Klita SPA-lite
│   │   ├── main.js           — Public site (search, dark mode, etc.)
│   │   └── sw.js             — Service Worker (unregister stub)
│   └── pages/                — /admin/, /klita/, /about/, ...
├── scripts/
│   ├── full-sweep.mjs        — Playwright 22-URL smoke test
│   └── ...                   — Deploy + audit helpers
└── worker/
    ├── wrangler.toml         — Bindings + env vars
    ├── schema.sql            — Full schema (idempotent CREATE IF NOT EXISTS)
    ├── migrations/           — 001 klita, 002 hardening, 003 drive
    └── src/
        ├── index.js          — Router + top-level handlers
        ├── klita.js          — Klita endpoints (biggest module)
        ├── drive.js          — Google Drive REST client
        ├── http.js           — CORS, security headers, csrfCheck, cookies
        ├── session.js        — HMAC sessions + gen check
        ├── password.js       — PBKDF2 hash + verify
        ├── ratelimit.js      — KV fixed-window
        └── mail.js           — sendMail() — hard-disabled by default
```

---

## Local development

```bash
# Install deps
npm ci

# Frontend dev server (Eleventy)
npm run dev
# Opens http://localhost:8080 with hot reload

# Worker dev (needs wrangler login)
cd worker
wrangler dev --local        # in-memory D1 + KV, no touch to prod
```

### Deploying

**Frontend:** push to `master` → GitHub Actions builds Eleventy → publishes to Pages.

**Worker:**
```bash
cd worker
wrangler deploy
```

Migrations must be applied manually to remote D1 before deploy:
```bash
wrangler d1 execute maale-amos --remote --file=migrations/003_drive.sql
```

**Never commit `worker/.dev.vars` or `.wrangler/`.** Both are gitignored.

---

## Testing

```bash
# Frontend + node syntax check
node --check src/js/config.js src/js/admin.js src/js/klita.js src/js/main.js
# Worker syntax
node --check worker/src/*.js

# Playwright smoke test — 11 pages × 2 viewports = 22 checks
node scripts/full-sweep.mjs
```

CI runs the same on every push (see `.github/workflows/ci.yml`).

---

## Contributing

1. **Any PR must pass `node --check` on both frontend and worker JS.**
2. No hardcoded secrets. Sessions/passwords never written to logs.
3. Hebrew strings: use `״` (U+05F4 gershayim) inside JS single-quoted strings, not `"`.
4. In JS: DOM builder + `textContent` when rendering user-controlled data. Never `innerHTML` with template-string interpolation of variables.
5. In Nunjucks: pass admin-editable URLs through the `safeUrl` filter.
6. In the Worker: use parameterized D1 queries (`prepare().bind()`), never string concat.

See **[SECURITY.md](SECURITY.md)** for the vulnerability disclosure policy and full list of active controls.

---

*README last regenerated 2026-07-10 (Claude session, after Y1-Y7 + Z1-Z6).*
