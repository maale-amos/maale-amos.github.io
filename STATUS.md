# STATUS — pointer

**מסמך זה מכיל רק מצב נוכחי + הפניות. יומני הסשן המפורטים מארכיון ב-`docs/session-logs/`.**

## מצב נוכחי (2026-07-10)

**Frontend:** [maale-amos.github.io](https://maale-amos.github.io) — פרוס דרך GitHub Pages.
**Worker:** `https://maale-amos-api.6742853.workers.dev` — Version `dc965725-98d3-46ae-a8dc-041aba1b62d8` פרוס אחרון.

יש שינויים בקוד לא-פרוסים ל-Worker (Z14-Z18) — מחכים ל-`wrangler deploy` הבא (לפני מעבר לדומיין או אחרי).

## תשומת לב

- **`MAIL_ENABLED=false`** — אין מיילים אוטומטיים לתושבים.
- **`KLITA_DRIVE_ROOT_ID=""`** — Drive לא פעיל, יוסף חייב להזין folder id.
- **`GDRIVE_*` secrets לא הוגדרו** — העלאת PDF תחזיר `503 drive_not_configured` עד שיוסף מגדיר.
- **`workers.dev` API URL עדיין פעיל** — יעבור ל-`api.maale-amos.org.il` אחרי רכישת דומיין.
- **סיסמת admin נוכחית:** מסובבת ל-`YpCpnew@Gck6wyXEAFQb4Sus` ב-2026-07-09. שמורה גם ב-`$HOME/.secrets/maale-amos/`.

## הפניות עיקריות

- [README.md](README.md) — סקירת ארכיטקטורה + API + repo layout.
- [SECURITY.md](SECURITY.md) — vulnerability disclosure policy.
- [DEPLOY_WHEN_DOMAIN_READY.md](DEPLOY_WHEN_DOMAIN_READY.md) — runbook מעבר ל-Custom Domain.
- [docs/D1_BACKUP.md](docs/D1_BACKUP.md) — הפעלת גיבוי שבועי.
- [docs/session-logs/](docs/session-logs/) — יומני עבודה מפורטים לפי תאריך.

## פעולות שנותרו רק ליוסף

הפוסט המלא ב-[DEPLOY_WHEN_DOMAIN_READY.md](DEPLOY_WHEN_DOMAIN_READY.md). תמצית:

1. רכישת דומיין `maale-amos.org.il`
2. חיבור zone ל-Cloudflare
3. הוספת Custom Domain ל-Worker
4. עדכון `src/js/config.js` API_BASE
5. Google OAuth setup + Drive folder + 3 secrets
6. הרצת migration `003_drive.sql` + `wrangler deploy`
7. הגשת בקשות אישור לנטפרי/רימון/אתרוג (נוסח מוכן)
8. revoke של OAuth הדולף מ-vimeo-downloader
9. הגדרת גיבוי D1 (מפתחות age + Cloudflare API token) — ראה `docs/D1_BACKUP.md`
