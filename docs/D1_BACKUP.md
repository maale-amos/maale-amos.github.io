# D1 Backup — כיצד להפעיל את הגיבוי השבועי

**Workflow:** `.github/workflows/d1-backup.yml`
**תדירות:** ראשון כל שבוע ב-03:00 UTC + הפעלה ידנית ב-Actions tab.

## הכנה חד-פעמית — יוסף

### 1. הפק זוג מפתחות `age`
`age` הוא כלי הצפנה מודרני. הזוג נוצר מקומית פעם אחת על המחשב שלך:

```bash
# ל-Windows: winget install FiloSottile.age
# או ל-Linux/Mac: brew install age
age-keygen -o "$HOME/.secrets/maale-amos/d1_backup_key.txt"
```

הפלט:
```
Public key: age1abc...xyz          ← זה נכנס ל-secret (שם: D1_BACKUP_AGE_RECIPIENT)
# created: ...                     ← מפתח פרטי בפורמט decode
AGE-SECRET-KEY-1QQ...              ← מפתח פרטי
```

**המפתח הפרטי חייב להישמר אצלך + Z:\ + backup נוסף.** בלעדיו אי-אפשר לפענח.

### 2. Cloudflare API token עבור wrangler בתוך CI
1. `https://dash.cloudflare.com/profile/api-tokens` → **Create Token**
2. Template: **Edit Cloudflare Workers** → Continue
3. הוסף Permissions: `Account · D1 · Edit`
4. Account resources: Include · <your account>
5. Continue → Create Token
6. העתק את הטוקן.

### 3. הזן שני secrets ב-GitHub
```bash
gh secret set CLOUDFLARE_API_TOKEN --repo maale-amos/maale-amos.github.io
gh secret set D1_BACKUP_AGE_RECIPIENT --repo maale-amos/maale-amos.github.io
```

### 4. הפעל ראשית — הפעלה ידנית
1. GitHub → Actions → **D1 backup** → **Run workflow** → master → Run.
2. תוך ~2 דק׳ יופיע artifact `maale-amos-d1-<run_id>`.
3. הורד את ה-artifact — קובץ `maale-amos.sql.age` מוצפן.

מכאן זה יעבוד אוטומטית כל שבוע.

## שחזור מגיבוי

```bash
# 1. פענח (דורש את המפתח הפרטי).
age -d -i "$HOME/.secrets/maale-amos/d1_backup_key.txt" \
    -o dump.sql maale-amos.sql.age

# 2. הפעל את ה-SQL על D1.
cd worker
wrangler d1 execute maale-amos --remote --file=../dump.sql
```

## מה נכלל בגיבוי

`wrangler d1 export --remote` מייצא סכימה + נתונים:
- admins, applicants, application_forms, form_uploads (metadata)
- committee_decisions, content, audit_log

**לא נכלל:**
- KV (SESSIONS, RATE_LIMIT, KLITA_UPLOADS) — קצר-חיים.
- קבצי Drive — Drive עצמו מספק שחזור.
- secrets של Worker (SESSION_KEY_HEX, GDRIVE_*).

## אחסון קר

הריצה מייצרת artifact עם retention 30 יום. **הורד לפחות אחד לחודש** ושמור ב-Z:\ או כונן חיצוני.
