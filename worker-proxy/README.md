# worker-proxy — Apps Script bypass for NetFree

## למה זה קיים

NetFree חוסמת `*.workers.dev` (מחזירה HTTP 418). היא **לא חוסמת** את `script.google.com`.
ה-Apps Script הזה מקבל בקשות מהדפדפן ומעביר אותן ל-Worker, ומחזיר את התשובה כמו שהיא.

## פריסה חד-פעמית (יוסף)

1. פתח https://script.google.com → **New project** → קרא `maale-amos-api-proxy`.
2. מחק את התוכן של `Code.gs`, הדבק את התוכן של `worker-proxy/Code.gs` מהקוד.
3. Project Settings (⚙) → **Show "appsscript.json" manifest file in editor** ✓ → הדבק גם את `appsscript.json`.
4. **Deploy → New deployment → Web app**:
   - Description: `maale-amos-api-proxy`
   - Execute as: **Me** (החשבון שלך)
   - Who has access: **Anyone**
   - **Deploy**
5. אשר הרשאה למכן `script.external_request` (הצריכה הראשונה).
6. העתק את הדפלוימנט URL (משהו כמו `https://script.google.com/macros/s/AKfycb.../exec`).
7. עדכן ב-`src/js/admin.js` את `PROXY_URL` לערך שלך.
8. commit + push.

## עדכון קוד ה-proxy אחרי שינויים

Deploy → **Manage deployments** → העט (Edit) → **New version** → Deploy.
ה-URL לא משתנה.

## דיאגנוסטיקה

- `curl "https://script.google.com/macros/s/<DEPLOY>/exec"` → `{ok:true, proxy:"maale-amos-api"}`
- אם בדפדפן: `POST` עם `Content-Type: text/plain` (לא JSON — כדי להימנע מ-preflight)
