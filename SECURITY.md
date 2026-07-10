# מדיניות אבטחה — קהילת מעלה עמוס

## Reporting a vulnerability / דיווח על פרצה

מצאתם פרצת אבטחה? נא לפנות ישירות במייל, **לא** דרך GitHub Issues.

- **מייל:** `6742853@gmail.com`
- **קידומת נושא:** `[SECURITY]`
- שפות: עברית או אנגלית
- **PGP:** לא זמין כרגע — אם הפרטים רגישים במיוחד, בקשו במייל להעביר לערוץ מוצפן.

## מה לכלול בדיווח

1. תיאור הפרצה (איך היא עובדת, איזה נזק אפשרי).
2. שלבי-שחזור מדויקים או PoC. אם צריך משתמש בדיקה, נספק חשבון.
3. הרכיב המושפע — פרונטאנד (maale-amos.github.io), Worker (API), D1, KV.
4. פרטי גילוי (רשות/דרישה למתן קרדיט או השארה אנונימי).

## מה נעשה אחרי הדיווח

- **72 שעות** — אישור קבלה.
- **7 ימים** — הערכה ראשונית + סיווג חומרה (LOW/MEDIUM/HIGH/CRITICAL).
- **30 ימים** — יעד לפריסת תיקון (CRITICAL: הרבה יותר מהר).
- אחרי שהתיקון חי — אתם רשאים לפרסם. נא לתאם מועד פרסום איתנו.

## Scope

**In scope:**
- הפרונטאנד ב-`https://maale-amos.github.io/*`
- ה-API ב-`https://maale-amos-api.6742853.workers.dev/*` (יעבור ל-`https://api.maale-amos.org.il/*`)
- Repository `https://github.com/maale-amos/maale-amos.github.io`

**Out of scope:**
- שירותים חיצוניים (GitHub Pages עצמו, Cloudflare Workers infrastructure, Google Drive API — דיווחו ישירות לספק).
- DoS מבוסס-נפח (ידוע — מוגן ע"י Cloudflare).
- Missing SPF/DKIM/DMARC על דומיינים לא-שלנו.
- Reports אוטומטיים ללא PoC (mass-scanner findings בלי בדיקה ידנית).

## Safe Harbor

אנחנו לא נתבע דיווחים תום-לב שנעשו לפי המסמך הזה. הגבלות סבירות:
- אין לגשת לנתוני משתמשים אחרים ללא הסכמתם.
- אין להעתיק/לשמור בסיסי נתונים.
- לא לפעולות destructive (מחיקת נתונים, שינוי תוכן ציבורי, לוגין ל-admin ללא הרשאה).
- אם יצרתם עומס חריג — הודיעו לנו מיד.

## תקציר קונטרולים אבטחתיים פעילים

- אחסון סיסמאות: PBKDF2-SHA256 210,000 iterations, per-user salt.
- Sessions: HMAC-SHA256 חתומים, KV backing store, TTL 24h.
- Password change אטומית מבטלת כל session קודם (`gen` bump).
- Rate limit: 5 login/60s per IP + per username (KV-based).
- CORS allow-list, HSTS 1yr, X-Frame-Options: DENY, Referrer-Policy: no-referrer.
- CSRF defense-in-depth via Origin header check.
- SQL: 100% parameterized (D1 prepare/bind).
- XSS: DOM builder + textContent everywhere in admin/klita frontend.
- ת.ז. checksum validation (Luhn IL-ID).
- No public link sharing on Drive — email-only whitelisting.
- אין שליחת מייל אוטומטית עד אישור מפורש (`MAIL_ENABLED=false` + `approved:true` gate).

*עודכן: 2026-07-10*
