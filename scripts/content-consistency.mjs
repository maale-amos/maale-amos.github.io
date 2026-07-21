// content-consistency.mjs — מוכיח שהתוכן שהוטמע בקבצי המקור באמת מופיע ב-_site הבנוי.
// נועד לתפוס בדיוק את הכשל שעמנואל דיווח עליו: "הרבה מהטקסטים לא הוטמעו".
// שימוש: node scripts/content-consistency.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SITE = '_site';

function allHtml(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...allHtml(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// נרמול: ישויות HTML + רווחים, כדי שההשוואה תהיה על הטקסט ולא על הקידוד
const norm = s => s
  .replace(/&quot;/g, '"').replace(/&#34;/g, '"')
  .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ').trim();

const files = allHtml(SITE);
// /klita/ הוא פורטל הקליטה — שם "בבדיקה" הוא סטטוס בקשה מול המשתמש, לא סימון נתון פנימי
const publicHtml = norm(files.filter(f => !f.includes('klita')).map(f => readFileSync(f, 'utf8')).join('\n'));
const html = norm(files.map(f => readFileSync(f, 'utf8')).join('\n'));
// רחובות מרונדרים בצד-לקוח מ-/data/sections/streets.json — נבדקים דרך ה-JSON המוגש
const servedJson = norm(readdirSync(join(SITE, 'data', 'sections'))
  .map(f => readFileSync(join(SITE, 'data', 'sections', f), 'utf8')).join('\n'));
const haystack = html + ' ' + servedJson;

// הערכים הסמכותיים שהוטמעו — כל אחד חייב להופיע ב-HTML הבנוי
const CHECKS = [
  ['אודות · גובה מאומת', '748'],
  ['אודות · תושבים מאומת', '1,340'],
  ['אודות · גוש עציון', 'היישוב החרדי הראשון בגוש'],
  ['אודות · מרא דאתרא', 'חרל"פ'],
  ['פוטר · מנכ"ל היישוב', 'איתן סער'],
  ['חירום · זמן כניסה', '90 שניות'],
  ['חירום · מקלט מרכזי', 'ליד בית הכנסת המרכזי'],
  ['חירום · שכונה צפונית', 'רחוב רמב"ן'],
  ['חירום · שכונה דרומית', 'רחוב רש"י'],
  ['בתי כנסת · ביאלא', 'בית המדרש דחסידי ביאלא'],
  ['בתי כנסת · ספרדי', 'בית הכנסת ה-ספרדי'],
  ['בתי כנסת · הערת זמנים', 'זמני התפילות מתפרסמים בלוח המודעות'],
  ['רחובות · מרכז הישוב', 'מרכז הישוב'],
  ['שאלות נפוצות · קווי אוטובוס', '365'],
  ['שאלות נפוצות · קו 411', '411'],
  ['שאלות נפוצות · מרפאה', 'בימים אלו עובדים על פתיחתה של מרפאה'],
  ['שאלות נפוצות · חינוך', 'בית ספר בית יעקב לבנות'],
  ['קישורים · זמני שבת', 'כניסת ויציאת שבת'],
  ['קישורים · חירום', 'מקלטים ציבוריים וכוננות חירום'],
  ['מפה מקומית', 'מיקום היישוב'],
];

// ערכים שנשללו במכוון (FACTS.md — "עדיף ריק מאשר שגוי") ואסור שיחזרו
const FORBIDDEN = [
  ['גובה לא מאומת', '725 מ'],
  ['מספר משפחות לא מאומת', '175+'],
  ['מספר תושבים לא מאומת', '1,592'],
  ['מייסדים לא מאומתים', 'אש התורה'],
  ['מייסדים לא מאומתים', 'הסוכנות היהודית'],
  ['קווי אוטובוס שגויים', '166/167'],
  ['טלפון פרטי', '053-3177636'],
  ['סימון פנימי גלוי', 'בבדיקה'],
  ['תמונות חיצוניות', 'maaleamos.co.il/pictures'],
  ['מפת גוגל מוטמעת', 'google.com/maps/embed'],
  ['CDN חיצוני', 'cdn.jsdelivr.net'],
  ['פונטים חיצוניים', 'fonts.googleapis.com'],
];

let fail = 0;
console.log('— ערכים שחייבים להופיע ב-_site —');
for (const [label, needle] of CHECKS) {
  const ok = haystack.includes(norm(needle));
  if (!ok) fail++;
  console.log(`${ok ? '✓' : '✗ חסר'}  ${label}: "${needle}"`);
}
console.log('\n— ערכים שאסור שיופיעו —');
for (const [label, needle] of FORBIDDEN) {
  const bad = (label === 'סימון פנימי גלוי' ? publicHtml : haystack).includes(norm(needle));
  if (bad) fail++;
  console.log(`${bad ? '✗ נמצא' : '✓ נקי'}  ${label}: "${needle}"`);
}
console.log(`\nסה"כ כשלים: ${fail}`);
process.exit(fail ? 1 : 0);
