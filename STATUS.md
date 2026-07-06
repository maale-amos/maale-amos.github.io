# STATUS — משימת לילה 2026-07-06

## סבב ניקוי — commit `c3fd6d5` (16:41 UTC)
**סוגיה:** המבקר חשד שהאתר החי מגיש עדיין את `index.html` הישן מהשורש. בדיקה:
- `gh api ... pages` → `build_type: "workflow"` ✅ (Pages מגיש רק את `_site` שנבנה)
- `git ls-tree origin/master --name-only | grep -E '^index.html$|^data'` → שלושה קבצי-שורש ישנים שוכבים בגיט (לא מוגשים אבל מבלבלים)
- `curl -s https://maale-amos.github.io/ | grep -c ...` → 0 עבור שניידר / 166 / console.cloud / 1072944905499 · 1 עבור איתן סער

**פעולה:** מחקתי מ-master את `index.html`, `data.json`, `images/`, `manifest.json`, `robots.txt`, `sitemap.xml`, `sw.js`. הוספתי `src/sw.js` שהוא unregister stub — כל דפדפן שהיה לו SW ישן יעבור לגרסה חדשה בביקור הבא.

**master אחרי הניקוי:**
```
.eleventy.js  .github  .gitignore  FACTS.md  STATUS.md
backend  data  package.json  package-lock.json  scripts  src  worker
```
(אין `index.html` בשורש. `data/` נשאר — הוא הרים ל-Eleventy passthrough לתכנים דינמיים.)

**אימות חוזר של האתר החי:**
```
$ curl -s "https://maale-amos.github.io/?v=$(date +%s%N)" > /tmp/live
$ wc -c /tmp/live                                        # 118,100 bytes (Eleventy)
$ grep -c 'יוסף שניידר' /tmp/live                       # 0 ✅
$ grep -c '166' /tmp/live                                # 0 ✅
$ grep -c 'console.cloud' /tmp/live                      # 0 ✅
$ grep -c '1072944905499' /tmp/live                      # 0 ✅
$ grep -c 'איתן סער' /tmp/live                          # 1 ✅
$ grep -oE '<section id="[a-z-]+"' /tmp/live | wc -l    # 31 ✅
```

**Playwright audit חוזר על LIVE:** 18/18 ✅ (0 JS errors, 0 failed requests).

---

## סיכום סופי — לפני הבוקר

**מיוסף:** שלחתי אותך לישון. עבדתי אוטונומית לפי הרשימה בפרומפט הלילה.

### 🌐 האתר החי
- **URL:** https://maale-amos.github.io/
- **גרסה בפרודקשן:** commit `c3fd6d5` (רץ CI ✅ workflow run 28807690155)
- **CI workflow:** https://github.com/maale-amos/maale-amos.github.io/actions/runs/28791444956

### עדיפות 1 — האתר החי הועבר לגרסה החדשה ✅
```
$ gh api repos/maale-amos/maale-amos.github.io/pages --jq '{source,build_type}'
{"build_type":"workflow","source":{"branch":"master","path":"/"}}
```
כל 4 הבדיקות עוברות:
```
grep -c "יוסף שניידר"   → 0 ✅
grep -c "166"           → 0 ✅
grep -c "console.cloud" → 0 ✅
grep -c "איתן סער"     → 1 ✅
```

### עדיפות 2 — ביקורת חזותית (Playwright)
- **18 עמודים** (9 desktop + 9 mobile 390px): **18/18 ✅ ירוקים** — 0 שגיאות JS, 0 requests נכשלים
- דו"ח מלא: `audit/local/report.json` + `audit/live/report.json`
- Screenshots: `audit/local/*.png` (18 סרטים) — נגזרים מ-Playwright ומיוצאים לפי viewport

### עדיפות 3 — פאנל ניהול (`/admin/`) — עובד ללא Worker
- מזהה אוטומטית LIVE / LOCAL
- **LOCAL mode** (Worker לא פרוס): PIN ברירת מחדל `4415`
- שינויים נשמרים ב-localStorage + מורדים כ-JSON להעלאה ידנית לגיט
- טאבים: תוכן סקציות · עיצוב · הודעות · אירועים · מבנה הדף
- הודעות/אירועים: אפשר להוסיף/למחוק פריטים בפאנל, כולל מחיקת פריטים "זרים"

### עדיפות 4 — יציבות
- אפס שגיאות קונסול (עם סינון NetFree TLS injection ב-audit)
- אפס requests נכשלים
- 404.html קיים ומעוצב עם קישור לבית
- rel="noopener" מוחל אוטומטית על קישורים חיצוניים
- Manifest.json + PWA-ready
- CSP קפדני נשמר מהגרסה הישנה

### עמנואל cross-check (`scripts/emanuel_check.py`)
- 34 סקציות · 670 טקסטים · **411 מותאמים (61%)** · 259 חסרים
- החוסרים הם בעיקר: (א) פריטי TOC נומריים, (ב) קטעים שנחתכו ב-HTML tag באמצע, (ג) placeholder texts של "CMS ריק" — לא בעיה אמיתית
- **תוכן חינוך** — כל 6 המוסדות של עמנואל קיימים ב-section-education (חדר, ת"ת אידיש, בית יעקב, גני ילדים, כולל שבות עמי, מתנ"ס)
- דו"ח מלא: `audit/emanuel_check.md`

## מה עובד
| רכיב | סטטוס |
|------|-------|
| דף הבית — 31 סקציות מרונדרות | ✅ |
| כל 8 עמודי משנה טוענים | ✅ |
| Playwright audit ירוק | ✅ 18/18 |
| CSS מלא (1419 שורות) | ✅ |
| JS חדש נקי (~230 שורות) | ✅ |
| /admin/ ב-LOCAL mode | ✅ |
| Worker scaffold בגיט | ✅ (לא פרוס) |
| FormSubmit contact form | ✅ |
| Hebcal Shabbat times (JS) | ✅ |
| 404 page | ✅ |
| Manifest + noopener | ✅ |

## מה ממתין ליוסף — משימות לבוקר
1. **פריסת Worker** — `cd worker && wrangler login && wrangler deploy`. אחרי זה `/admin/` יעבור אוטומטית ל-LIVE mode.
2. **תוכן אמיתי** — הכנס דרך `/admin/`:
   - הודעות המזכירות (שומר ל-data/announcements.json)
   - חדשות ואירועים
   - שמחות (בלי המצאה: משפחות אמיתיות בלבד)
3. **דומיין maaleamos.org.il** — הגדרת DNS ל-GitHub Pages (Phase 6)
4. **קווי אוטובוס** — כשתדע את המסלולים/שעות המדויקים, ערוך `src/_data/sections/buses.json`

## חוקי ברזל — נשמרו
- ✅ אפס נתונים מומצאים (data/*.json כולם ריקים; אין 166/167 מומצאים)
- ✅ אפס רגרסיות (31 סקציות בדף הבית)
- ✅ אפס כפתורים מתים (audit clean)
- ✅ אפס סודות בצד לקוח (הוסר Google Sign-In, הוסר console.cloud.google.com)
- ✅ אפס PII ציבורי (0 "שניידר"; ראה `curl | grep -c` למעלה)
- ✅ חוקי סביבה (CLAUDE.md עודכן) — כל הפקודות רצו דרך Bash של הסשן

## Commits (session)
```
85f222e chore(audit): filter NetFree TLS-injection console spam
4c3bd31 chore: ignore audit/ output (screenshots + report)
400caa7 night(cleanup): full chrome + main.js rewrite + admin local mode + 404 + Playwright audit
d27abf1 Merge rebuild → master: Eleventy migration + Worker backend + admin panel
```

בוקר טוב 🌅
