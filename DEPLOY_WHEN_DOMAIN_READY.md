# Deploy runbook — Custom Domain migration

מסמך זה הוא ה-**רשימת פעולות מדויקת** של יוסף אחרי שהוא חוזר עם דומיין קנוי.
כל הקוד מוכן. אין שינויי קוד נוספים נדרשים.

---

## שלב א׳ — רכישת דומיין

**המלצה עיקרית:** `maale-amos.org.il`  
**סיומת מומלצת:** `.org.il` (ולא `.co.il` או `.com`). למה:
1. יישוב/עמותה = לא-מסחרי → `.org.il` הוא הסיווג הנכון מבחינת ISOC-IL.
2. סיומת `.il` מקבלת חיסיון-סינון מוקדם יותר בבקשות אישור לנטפרי/רימון (הן מזהות שזה גוף ישראלי).
3. עלות שנתית ~₪90.

**איפה קונים** (בסדר עדיפויות):
1. **מנפיק ISOC-IL** (`isoc.org.il`) — הזול, ישיר, אבל דורש פתיחת חשבון.
2. **דומיין the-net** (`www.the-net.co.il`) — ממשק פשוט בעברית, ₪95/שנה.
3. **livedns / hostirealo** — אלטרנטיבות.

**חלופה זולה יותר:** `maale-amos.co.il` (~₪60/שנה) — מקובל, אבל ISOC-IL עשויים לדרוש הוכחת עסק מסחרי.

**נא לרשום על שמך אישית או על שם האגודה — לא על שם ספק חיצוני.**

---

## שלב ב׳ — חיבור ה-Zone ל-Cloudflare

1. היכנס ל-`https://dash.cloudflare.com` (חשבון קיים, לוגין OAuth דרך Google).
2. **+ Add site** → הכנס `maale-amos.org.il` → **Free plan** → Continue.
3. Cloudflare סורק את ה-DNS הקיים (יסטרי) → **Confirm** (יש רק זרם ריק בהתחלה, זה בסדר).
4. Cloudflare יציג **שני nameservers** בסגנון:
   ```
   nala.ns.cloudflare.com
   pete.ns.cloudflare.com
   ```
5. חזור ל-registrar (הספק שקנית ממנו) → **DNS settings / Nameservers** → מחק את ה-nameservers הקיימים והדבק את השניים של Cloudflare → שמור.
6. חזור ל-Cloudflare → **Check nameservers**. עד 24 שעות ה-Zone יעבור לסטטוס **Active** (בפועל עד שעתיים).
7. **חובה:** ב-Cloudflare → SSL/TLS → **Full (strict)** או `Full`, לא `Off`.

---

## שלב ג׳ — הוספת Custom Domain ל-Worker

**דרך ה-Dashboard (הכי פשוט):**
1. Cloudflare → Workers & Pages → **maale-amos-api** → **Settings** → **Domains & Routes** → **+ Add**.
2. Type: **Custom Domain** (לא Route).
3. Domain: `api.maale-amos.org.il` (או `api.maale-amos.co.il` אם ב-`.co.il`).
4. Cloudflare יוצר אוטומטית CNAME + תעודת SSL. ~2-5 דק׳.

**דרך wrangler (אחרי שה-Zone פעיל):**
1. פתח `worker/wrangler.toml` → הסר את ה-`#` מהבלוק:
   ```toml
   [[routes]]
   pattern = "api.maale-amos.org.il"
   custom_domain = true
   ```
2. הרץ:
   ```bash
   cd worker && wrangler deploy
   ```

---

## שלב ד׳ — עדכון הפרונטאנד למצביע על הדומיין החדש

1. פתח `src/js/config.js` → החלף את ה-URL:
   ```js
   window.API_BASE = (override || 'https://api.maale-amos.org.il').replace(/\/+$/, '');
   ```
2. Commit + push:
   ```bash
   git add src/js/config.js
   git commit -m "config: point API_BASE at Custom Domain"
   git push origin master
   ```
   GitHub Pages בונה + פורס אוטומטית תוך ~1 דק׳.

**חלופה:** במקום לערוך את הקובץ, פשוט הוסף למטא בכל דף שמצריך API:
```html
<meta name="ma-api-base" content="https://api.maale-amos.org.il">
```
Config.js אוטומטית מעדיף את המטא על ה-fallback.

---

## שלב ה׳ — הפעלת Drive integration (חד-פעמי)

**דורש שיוסף יאשר OAuth ידנית פעם אחת.**

### ה.1 — צור OAuth Client ב-Google Cloud Console
1. `https://console.cloud.google.com/apis/credentials` → **+ Create Credentials** → **OAuth client ID**.
2. Application type: **Desktop app** (הכי פשוט לתחזוקה).
3. שם: `maale-amos-api-drive`. **Create**.
4. שמור את `client_id` + `client_secret`.

### ה.2 — הפעל Google Drive API
1. באותו פרויקט Cloud → **APIs & Services** → **Library** → **Google Drive API** → **Enable**.

### ה.3 — הפק refresh_token עם gcloud CLI (או ב-manual OAuth playground)
דרך ה-CLI (מומלץ):
```bash
gcloud auth application-default login --scopes=https://www.googleapis.com/auth/drive,openid,https://www.googleapis.com/auth/userinfo.email
```
זה יפתח דפדפן. אשר → יש refresh_token בקובץ `~/.config/gcloud/application_default_credentials.json`.

או דרך **OAuth 2.0 Playground** (https://developers.google.com/oauthplayground):
1. סמל גלגל שיניים ⚙ → סמן **Use your own OAuth credentials** → הכנס client_id/secret.
2. סקופ: `https://www.googleapis.com/auth/drive` → **Authorize APIs** → אשר.
3. **Exchange authorization code for tokens** → קבל `refresh_token`.

### ה.4 — שים בסודות ה-Worker
```bash
cd worker
wrangler secret put GDRIVE_CLIENT_ID
# הדבק את client_id, Enter
wrangler secret put GDRIVE_CLIENT_SECRET
wrangler secret put GDRIVE_REFRESH_TOKEN
```

### ה.5 — צור תיקיית האב ב-Drive
1. פתח `https://drive.google.com` באותו חשבון שאישרת ב-OAuth.
2. צור תיקייה בשם: **קליטה - קהילת מעלה עמוס**.
3. פתח את התיקייה → העתק את ה-**folder id** מה-URL (החלק אחרי `/folders/`).
4. פתח `worker/wrangler.toml` → הזן:
   ```toml
   KLITA_DRIVE_ROOT_ID = "1AbC...xyz"  # folder id מ-Drive
   KLITA_COMMITTEE_EMAILS = "committee1@example.com,rakaz@example.com"
   ```

### ה.6 — הרץ את המיגרציה + פרוס Worker
```bash
cd worker
wrangler d1 execute maale-amos --remote --file=migrations/003_drive.sql
wrangler deploy
```

### ה.7 — בדוק מקצה לקצה
1. הרשם דרך `/klita/` → לחץ "פתח תיק".
2. פתח את תיקיית האב ב-Drive → תראה תת-תיקייה חדשה בשם משפחתך.
3. במייל של המשפחה שהרשמת (Gmail) → תראה הזמנה לצפייה בתיקייה.

---

## שלב ו׳ — הגשת בקשת אישור לפילטרים

**כתובת הבקשה** (זהה לשלושתם, שנה רק את הסיומת):

- **נטפרי:** `https://netfree.link/site-request/` (טופס אונליין)
- **רימון:** `https://rimon.net.il/hishavshavot/` → "בקשה לפתיחת אתר"
- **אתרוג:** `https://etrog.net.il/contact/` → "בקשה לפתיחת אתר"

**נוסח מוכן להעתקה (עברית):**

> שלום רב,
>
> אני מבקש לאשר גישה לאתר הקהילתי של יישוב מעלה עמוס (גוש עציון).
>
> **כתובת האתר:** `https://maale-amos.org.il` (או `www.maale-amos.org.il`)  
> **כתובת ה-API:** `https://api.maale-amos.org.il`  
> **הריפו הפומבי:** `https://github.com/maale-amos/maale-amos.github.io`
>
> האתר משמש את התושבים והנקלטים של הישוב לשלושה תפקידים:
> 1. **דף פרסום קהילתי** — לוח מודעות, זמני תפילות, טלפוני חירום, פרטי בתי כנסת.
> 2. **פורטל קליטה למשפחות חדשות** — טופס שאלון הרשמה מקוון + תהליך אישור ועדת קבלה + מעקב אחר עשרת שלבי הקליטה של הישוב.
> 3. **פאנל ניהול תוכן** לרכז הקליטה של הישוב.
>
> האתר סטטי (HTML/CSS/JavaScript) על GitHub Pages. ה-API הוא Cloudflare Worker (JavaScript צד-שרת). כל התקשורת ב-HTTPS. אין בשירות תוכן חיצוני שאינו מנוהל על ידינו. אין דברים לא-צנועים או פרסומות.
>
> אני עומד לרשות התמיכה לכל בירור נוסף.
>
> תודה רבה,  
> יוסף שניידר · מזכיר קהילת מעלה עמוס  
> yosef@... · 054-...

---

## שלב ז׳ — Google OAuth revoke (עדיין רלוונטי מהערב הקודם!)

יש refresh_token של Google OAuth שדלף בעבר בריפו `vimeo-downloader`. סובבתי את הריפו והסרתי את המפתחות ב-git filter-repo — אבל **ה-refresh_token עצמו עדיין תקף לגישה ל-Drive של `6742853@gmail.com` עד ש-Yosef ידנית מבטל אותו**.

**פעולה נדרשת:**
1. `https://console.cloud.google.com/apis/credentials` → מחק/החלף `client_secret` של הלקוח `1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com`.
2. `https://myaccount.google.com/permissions` → revoke ל-OAuth client.
3. עדכן `GOOGLE_REFRESH_TOKEN` בכל ריפו שהריצה workflows (vimeo-downloader, BHT, cheder-bht, gabbaim, tochen-echad).

**חשוב:** ה-OAuth החדש שתפיק ב-שלב ה׳ (לפורטל הקליטה) יכול להיות אותו client_id אחרי הרוטציה — כי הוא נוצר מחדש בכל מקרה.

---

## שלב ח׳ — קטע קוד לצריבה בזיכרון

אחרי שהכל חי:
- הקומיט הראשון ל-Worker מאחורי Custom Domain: **פרוס פעם אחת ובדוק** שהמסכת TLS/CORS/D1/KV נסגרת בלי שגיאה בקונסול הדפדפן.
- **סיסמת ה-admin החדשה שהוזנה ב-D1 היום:** `YpCpnew@Gck6wyXEAFQb4Sus` (שמורה גם ב-`$HOME/.secrets/maale-amos/admin_password_2026-07-09.txt`).
- שנה אותה מיד ב-`/admin/` → "שנה סיסמה" ברגע שנכנסת ראשונה.

---

## מה קורה אם יוסף רוצה לוותר על Custom Domain?

חלופה: **NetFree admin whitelist** לדומיין `maale-amos-api.6742853.workers.dev`.
- פונים דרך אותו טופס בקשה של נטפרי, מבקשים לאשר workers.dev specifiacally לדומיין הזה.
- חסרון: תלוי בסבב אישור. יתרון: אפס עלות.

עדיין דורש בקשה נפרדת לרימון + אתרוג.

---

*מסמך זה נוצר אוטומטית ע"י Claude ב-2026-07-09. עדכן ידנית אם הפרטים משתנים.*
