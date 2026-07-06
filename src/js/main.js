// extracted from index.html — v2.0 Eleventy migration

// ===== STORAGE HELPERS =====
function getData(key, fallback) {
  try { const d = localStorage.getItem('ma_' + key); return d ? JSON.parse(d) : fallback; }
  catch(e) { return fallback; }
}
function setData(key, val) { localStorage.setItem('ma_' + key, JSON.stringify(val)); }

// ===== DEFAULT DATA =====
const DEFAULT_NEWS = [
  { title: 'הרחבת שכונה צפונית — אושרה תכנית בנייה', desc: 'בס"ד. ועדת התכנון אישרה את תכנית ההרחבה הכוללת 120 יחדות דיור חדשות.', date: 'כ"ו בניסן תשפ"ו', cat: 'דיור', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80', author: 'מזכירות הוועד', fullText: 'בס"ד.\n\nבישיבת ועדת התכנון והבנייה שהתקיימה השבוע, אושרה לאחר שנים של עבודה מאומצת תכנית ההרחבה הצפונית של הישוב. התכנית כוללת 120 יחידות דיור חדשות, מתחם מסחרי, גן ילדים נוסף ושני בתי כנסת.\n\nראש הוועד הסביר כי "מדובר בצעד היסטורי לישוב. יחד עם מינהל מקרקעי ישראל ומשרד השיכון, נצליח להעמיד עוד עשרות משפחות בישוב שלנו, להרחיב את הקהילה ולהבטיח את עתידה התורני".\n\nשלבי הביצוע:\n• שלב א\' — תשתיות ופיתוח (תשפ"ו-תשפ"ז)\n• שלב ב\' — בנייה ראשונית של 60 יח"ד (תשפ"ז-תשפ"ח)\n• שלב ג\' — השלמת הפרויקט (תשפ"ח-תש"פ)\n\nמשפחות המעוניינות ברכישה — הרשמה ראשונית במשרדי הוועד או בטופס באתר.' },
  { title: 'עצרת תורה — סיום מסכתא דברכות בכולל', desc: 'בע"ה סיום חגיגי של מסכתא דברכות בכולל. כל התושבים מוזמנים!', date: 'כ"ג בניסן תשפ"ו', cat: 'תורה', img: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=600&q=80', author: 'רב הקהילה', fullText: 'בעז"ה תיערך השבוע עצרת תורה לרגל סיום מסכתא ברכות בכולל "שבות עמי". האירוע יתקיים בבית הכנסת המרכזי בשעה 20:30.\n\nבמהלך הערב יישאו דברים: ראש הכולל הרב שליט"א, ראש הוועד, ואחד מאברכי הכולל יסיים את המסכתא. לאחר מכן תתקיים סעודת מצווה משותפת לכל הקהילה.\n\nהציבור הקדוש מוזמן בחום להשתתף ולהתחזק בלימוד התורה. נא לבא בלבוש מכובד ובאווירה שמחה.\n\nתודה מיוחדת לתורמי האירוע ולמתנדבים שעמלים על ההכנות.' },
  { title: 'פתיחת הרשמה לגני הילדים — תשפ"ז', desc: 'ההרשמה לגנים נפתחה. ניתן להירשם עד ט"ו באייר.', date: 'כ"א בניסן תשפ"ו', cat: 'חינוך', img: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80', author: 'ועדת חינוך', fullText: 'הוועד שמח להודיע על פתיחת ההרשמה לגני הילדים והמעונות לשנת הלימודים תשפ"ז.\n\nהרשמה ניתן לבצע במשרדי הוועד או באמצעות טופס מקוון באתר. ההרשמה פתוחה עד ט"ו באייר תשפ"ו.\n\nהמסגרות הזמינות:\n• מעון יום (3 חודשים עד שנתיים)\n• פעוטון (שנתיים עד 3)\n• גן חובה (3-4)\n• חדר לבנים — ת"ת מגיל 3\n• בית יעקב לבנות — מגיל 3\n\nמשפחות חדשות בישוב — מוזמנים לפנות לרכזת החינוך לפרטים על מלגות וסבסוד.\n\nטלפון לבירורים: 02-9931767' },
  { title: 'שיפוץ מקיף במקלט המרכזי', desc: 'עבודות שיפוץ ושדרוג המקלט המרכזי. העבודות צפויות להימשך כחודשיים.', date: 'י"ט בניסן תשפ"ו', cat: 'ביטחון', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', author: 'רכז ביטחון', fullText: 'במסגרת הכנת הישוב לעיתות חירום, החלו השבוע עבודות שיפוץ ושדרוג מקיפות במקלט הציבורי המרכזי.\n\nהעבודות כוללות:\n• החלפת דלתות הדף\n• שדרוג מערכת הסינון\n• התקנת תאורת חירום חדשה\n• מערכת תקשורת פנימית\n• ריהוט ופינות שירות\n\nמשך העבודות הצפוי: כחודשיים. במהלכן ייסגר המקלט המרכזי. למקרה חירום באזור — נא לפנות למקלט בית הכנסת או למקלט תת-קרקעי בכניסה לישוב.\n\nרכז הביטחון יעדכן בלוח המודעות ובאתר על שינויים. תודה על הסבלנות.' },
  { title: 'ערב התרמה לכבוד הרב שליט"א', desc: 'ערב התרמה לרגל הילולא של הרב שליט"א במרכז הקהילתי. התושבים מוזמנים!', date: 'ט"ו בניסן תשפ"ו', cat: 'קהילה', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80', author: 'ועדת קהילה', fullText: 'ערב התרמה מיוחד לרגל הילולת הרב הלל זקס זצ"ל, מנהיגה הרוחני הראשון של הישוב.\n\nמטרת ההתרמה: בניית בית מדרש חדש בשכונת ההרחבה לזכרו של הרב.\n\nתכנית הערב:\n20:00 — קבלת פנים\n20:30 — דברי פתיחה\n21:00 — שיעור מפי תלמידי הרב\n21:30 — סעודת מצווה\n22:00 — תרומה והתחייבויות\n\nהאירוע יתקיים במרכז הקהילתי. ערב לא לשכוח! מי שאינו יכול להגיע — ניתן לתרום באתר או במשרדי הוועד.\n\nכל הזכויות שמורות לזכרו של הרב הקדוש זצ"ל.' },
  { title: 'קו אוטובוס חדש 167 — בעזה"ש', desc: 'בעזרת השם יתברך יופעל קו ישיר חדש לירושלים עם תדירות מוגברת.', date: 'י"ג בניסן תשפ"ו', cat: 'עדכונים', img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80', author: 'ועדת תחבורה', fullText: 'בעזרת השם יתברך, החל מתחילת חודש אייר תשפ"ו, יופעל קו אוטובוס ישיר חדש מס\' 167 ממעלה עמוס לירושלים.\n\nפרטי הקו:\n• מסלול: מעלה עמוס - תקוע - מעלה אדומים - ירושלים (תחנה מרכזית)\n• תדירות: כל שעתיים בימי חול, כל שעה בשעות העומס\n• זמן נסיעה משוער: 55 דקות\n• מחיר: כרגיל לפי תעריף משרד התחבורה\n\nהפעלת הקו היא תוצאה של מאבק ארוך מול משרד התחבורה. תודה לחברי הוועד שעבדו על כך, ובמיוחד לרכז התחבורה.\n\nלוח זמנים מלא יפורסם באתר ובלוח המודעות.\n\nנסיעה טובה לכולם!' }
];

const DEFAULT_EVENTS = [
  { day: '28', month: 'אפריל', title: 'שיעור הרב — פרשת השבוע', desc: 'שיעור שבועי בבית הכנסת', time: '20:00', location: 'בית כנסת מרכזי' },
  { day: '30', month: 'אפריל', title: 'ערב הורים', desc: 'מפגש הורים-מורים', time: '19:30', location: 'בית הספר' },
  { day: '2', month: 'מאי', title: 'שוק איכרים', desc: 'תוצרת מקומית ולחם טרי', time: '08:00-13:00', location: 'כיכר הישוב' },
  { day: '5', month: 'מאי', title: 'הרצאה: חינוך בעידן הדיגיטלי', desc: 'הרצאה לקהילה', time: '20:30', location: 'מרכז קהילתי' },
  { day: '10', month: 'מאי', title: 'ל"ג בעומר — מדורה קהילתית', desc: 'מדורה ואירוע לכל הישוב!', time: '19:00', location: 'מגרש המרכזי' }
];

const DEFAULT_MARKET = [
  { title: 'חשמלאי מוסמך', desc: 'עבודות חשמל, תיקונים, התקנות. 15 שנה ניסיון.', price: 'לפי עבודה', cat: 'services', seller: 'אבי כהן' },
  { title: 'דירת 5 חדרים למכירה', desc: 'דירה מרווחת, משופצת, מרפסת שמש.', price: '1,850,000 ₪', cat: 'sale', seller: 'משה לוי' },
  { title: 'צימר לשבת', desc: 'יחידת אירוח מפנקת לזוג+2.', price: '600 ₪/לילה', cat: 'rent', seller: 'רחל שמיר' },
  { title: 'מורה פרטי למתמטיקה', desc: 'שיעורים פרטיים בכל הרמות.', price: '120 ₪/שעה', cat: 'services', seller: 'דוד ברקוביץ' },
  { title: 'עגלת תינוק Bugaboo', desc: 'כמעט חדשה, שימוש שנה.', price: '1,200 ₪', cat: 'secondhand', seller: 'שרה פרידמן' },
  { title: 'דרושה גננת עוזרת', desc: 'גן דובדבן מחפש עוזרת.', price: 'שכר מותאם', cat: 'jobs', seller: 'גן דובדבן' },
  { title: 'שיפוצניק — כל עבודה', desc: 'צביעה, גבס, ריצוף, אינסטלציה.', price: 'הצעת מחיר', cat: 'services', seller: 'יוסי מזרחי' },
  { title: 'ספה תלת-מושבית', desc: 'נוחה, אפור, מצב טוב מאוד.', price: '800 ₪', cat: 'secondhand', seller: 'מיכל גולדשטיין' }
];

const DEFAULT_SIMCHOT = [
  { type: 'baby', family: 'משפחת כהן', details: 'מזל טוב להולדת הבת!', date: '23/04' },
  { type: 'wedding', family: 'משפחת לוי', details: 'מזל טוב לחתונת יוסף ושרה!', date: '20/04' },
  { type: 'barmitzva', family: 'משפחת פרידמן', details: 'מזל טוב לבר המצווה אליהו!', date: '18/04' },
  { type: 'engagement', family: 'משפחת גולדשטיין', details: 'מזל טוב לאירוסי דוד ומיכל!', date: '15/04' }
];

const DEFAULT_GEMACHIM = [
  { name: 'גמ"ח כלי תינוק', desc: 'עגלות, לולים, ערסלות', phone: '050-1111111', icon: 'bi-bag-heart' },
  { name: 'גמ"ח תרופות', desc: 'תרופות ללא מרשם', phone: '050-2222222', icon: 'bi-capsule' },
  { name: 'גמ"ח אוכל', desc: 'ארוחות ליולדות ושמחות', phone: '050-3333333', icon: 'bi-cup-hot' },
  { name: 'גמ"ח ספרים', desc: 'השאלת ספרי קודש ולימוד', phone: '050-4444444', icon: 'bi-book' },
  { name: 'גמ"ח שמחות', desc: 'ציוד לשמחות — שולחנות, כסאות', phone: '050-5555555', icon: 'bi-emoji-smile' },
  { name: 'גמ"ח כלי בית', desc: 'כלי גינון, כלי מטבח, כלי חשמל', phone: '050-6666666', icon: 'bi-tools' }
];

const DEFAULT_TICKER = [
  'הרשמה לגני ילדים תשפ"ז נפתחה!',
  'קו אוטובוס 167 חדש — מעלה עמוס לירושלים',
  'ל"ג בעומר — מדורה קהילתית ב-10 במאי',
  'אושרה תכנית הרחבה — 120 יח"ד חדשות'
];

// Residents lookup table — name + personal code (admin can edit)
const DEFAULT_RESIDENTS = [
  { name: 'יוסף שניידר',    code: '4415', role: 'מזכיר / מנהל אתר' },
  { name: 'עמנואל רקובסקי', code: '5588', role: 'תושב' },
  { name: 'משפחת כהן',      code: '7721', role: 'תושב' },
  { name: 'משפחת לוי',      code: '3392', role: 'תושב' },
  { name: 'משפחת פרידמן',   code: '6164', role: 'תושב' },
  { name: 'משפחת גולדשטיין', code: '8830', role: 'תושב' },
  { name: 'משפחת מזרחי',    code: '2256', role: 'תושב' },
  { name: 'משפחת ברקוביץ',  code: '9907', role: 'תושב' },
  { name: 'משפחת שמיר',     code: '1148', role: 'תושב' },
  { name: 'משפחת אזולאי',   code: '5573', role: 'תושב' },
  { name: 'משפחת ביטון',    code: '3041', role: 'תושב' },
  { name: 'משפחת דהן',      code: '7715', role: 'תושב' },
  { name: 'משפחת חיים',     code: '6209', role: 'תושב' },
  { name: 'משפחת רפאלי',    code: '4498', role: 'תושב' },
  { name: 'משפחת זוהר',     code: '8836', role: 'תושב' }
];

const DEFAULT_ANNOUNCEMENTS = [
  {
    type: 'urgent',
    typeLabel: 'דחוף',
    title: 'תרגיל חירום ביישוב — יום שלישי',
    body: 'בתיאום עם פיקוד העורף יתקיים תרגיל חירום בישוב ביום שלישי בשעה 10:00. נא להישמע להוראות ולהיכנס למרחב מוגן.',
    date: 'כ"ז בניסן תשפ"ו',
    icon: 'bi-exclamation-octagon-fill',
    cta: 'הנחיות חירום',
    ctaLink: '#emergency'
  },
  {
    type: 'event',
    typeLabel: 'אירוע',
    title: 'אסיפת תושבים שנתית — בעז"ה',
    body: 'מוזמנים לאסיפת התושבים השנתית בה יוצגו דוחות הוועד, הצבעות ותכניות לשנה הבאה. בית הכנסת המרכזי, יום ראשון בשעה 20:30.',
    date: 'כ"ה בניסן תשפ"ו',
    icon: 'bi-calendar2-event',
    cta: 'הוסף ליומן',
    ctaLink: '#events'
  },
  {
    type: 'info',
    typeLabel: 'מידע',
    title: 'תקנון ועדת תכנון — עדכון',
    body: 'עודכן תקנון ועדת תכנון ובניה. ניתן לעיין בתקנון המלא במשרדי הוועד או באתר. תוקף החל מתחילת חודש אייר.',
    date: 'כ"ב בניסן תשפ"ו',
    icon: 'bi-file-earmark-text-fill',
    cta: 'צור קשר',
    ctaLink: '#contact'
  },
  {
    type: 'update',
    typeLabel: 'עדכון',
    title: 'שיפוץ כביש הכניסה — סיום',
    body: 'בשעה טובה הסתיימו עבודות שיפוץ כביש הכניסה לישוב. תודה לתושבים על הסבלנות במהלך העבודות.',
    date: 'כ\' בניסן תשפ"ו',
    icon: 'bi-check-circle-fill',
    cta: '',
    ctaLink: ''
  },
  {
    type: 'event',
    typeLabel: 'אירוע',
    title: 'מסיבת ל"ג בעומר קהילתית',
    body: 'מסיבת ל"ג בעומר ומדורה קהילתית במגרש המרכזי. הרבה ילדים, גרעינים, שירה ושמחה לכל המשפחה. בעז"ה ב-10 במאי בשעה 19:00.',
    date: 'י"ח בניסן תשפ"ו',
    icon: 'bi-fire',
    cta: 'פרטים',
    ctaLink: '#events'
  },
  {
    type: 'info',
    typeLabel: 'מידע',
    title: 'גביית ועד שכונתי — רבעון 2',
    body: 'תזכורת: תשלום ועד שכונתי לרבעון השני יבוצע עד סוף החודש. ניתן לשלם באתר באזור התושבים או ישירות במשרד הוועד.',
    date: 'ט"ו בניסן תשפ"ו',
    icon: 'bi-credit-card-fill',
    cta: 'תשלום מקוון',
    ctaLink: '#residents'
  }
];

// Demo data removed 2026-05-18 — site now starts empty; everything loads from Sheets.
// The DEFAULT_* constants above are kept only as a one-time seed if Yosef explicitly chooses to import.
var announcementsData = [];
var newsData = [];
var eventsData = [];
var marketData = [];
var simchotData = [];
var gemachimData = [];
var tickerData = [];
var featuredData = [];   // v3.2: managed posters (data/featured.json)
var bulletinsData = [];  // v3.2: hot bulletins (data/bulletins.json)
var residentsData = getData('residents', []);
var ADMIN_CODE_KEY = 'ma_admin_code';
var DEFAULT_ADMIN_CODE = '8484';
var MASTER_ADMIN_CODE = '8484';
var GH_TOKEN_KEY = 'ma_gh_token';
var BACKEND_URL_KEY = 'ma_backend_url';

function getAdminCode() { return localStorage.getItem(ADMIN_CODE_KEY) || DEFAULT_ADMIN_CODE; }
function getGhToken() { return localStorage.getItem(GH_TOKEN_KEY) || ''; }
// Default points to ai-email-agent project (netfree-approved). All maale-amos
// actions are dispatched there with the 'maale_' prefix.
var DEFAULT_BACKEND_URL = 'https://script.google.com/macros/s/AKfycbzhRqTLE4fjjDqrH1we-JlGZ15R-ws8b_gfWF1xF1ewailaiyiS_YXqUhRtb3cQghVt/exec';
function getBackendUrl() { return localStorage.getItem(BACKEND_URL_KEY) || DEFAULT_BACKEND_URL; }

// Static admin token — matches ADMIN_TOKEN in backend/Code.gs. The frontend
// only sends this from the admin panel after the local admin code is verified,
// so it isn't exposed to anonymous visitors.
var BACKEND_ADMIN_TOKEN = '<REDACTED_TOKEN>';

// ===== v3: GitHub-as-primary-DB helpers =====
// data/*.json in the repo is the SOURCE OF TRUTH. Sheets is backup.
var GH_OWNER = 'maale-amos';
var GH_REPO = 'maale-amos.github.io';
var GH_BRANCH = 'master';
var DATA_PATH = 'data/';   // maps to https://maale-amos.github.io/data/*.json
var GH_API = 'https://api.github.com';

// Fetch a JSON file from the repo (raw, browser-cache-busted)
function ghReadJson(name) {
  var url = './' + DATA_PATH + name + '?_=' + Date.now();
  return fetch(url).then(function(r) {
    if (!r.ok) throw new Error('read ' + name + ' HTTP ' + r.status);
    return r.json();
  });
}

// Load ALL collections from data/*.json (single request, cache-busted).
// Returns { news, events, announcements, residents, market, simchot, gemachim, ticker, users }.
function ghReadAll() {
  return ghReadJson('all.json').catch(function() {
    // Fallback: read each individual file
    var files = ['news', 'events', 'announcements', 'residents', 'market', 'simchot', 'gemachim', 'ticker', 'featured', 'bulletins'];
    return Promise.all(files.map(function(f) {
      return ghReadJson(f + '.json').catch(function() { return []; });
    })).then(function(results) {
      var out = {};
      files.forEach(function(f, i) { out[f] = results[i] || []; });
      return out;
    });
  });
}

// Write a JSON file back to the repo via GitHub API PUT.
// Requires a GitHub token stored in localStorage['ma_gh_token'] with `repo` scope.
// Returns Promise<{ok, msg}>. If token missing, resolves with {ok:false, error:'no_token'}.
function ghWriteJson(name, data, commitMsg) {
  var token = getGhToken();
  if (!token) return Promise.resolve({ ok: false, error: 'no_token', hint: 'set GitHub token in settings' });
  var path = DATA_PATH + name;
  var apiUrl = GH_API + '/repos/' + GH_OWNER + '/' + GH_REPO + '/contents/' + path;
  // Fetch current SHA (required for update); ignore 404 (new file)
  return fetch(apiUrl + '?ref=' + GH_BRANCH, { headers: { Authorization: 'token ' + token } })
    .then(function(r) { return r.ok ? r.json() : { sha: undefined }; })
    .then(function(cur) {
      var content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
      var body = {
        message: commitMsg || 'data: update ' + name + ' via admin',
        content: content,
        branch: GH_BRANCH,
      };
      if (cur && cur.sha) body.sha = cur.sha;
      return fetch(apiUrl, {
        method: 'PUT',
        headers: { Authorization: 'token ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res.content) return { ok: true, sha: res.content.sha, url: res.content.html_url };
      return { ok: false, error: res.message || 'gh write failed', detail: res };
    })
    .catch(function(e) { return { ok: false, error: String(e) }; });
}

// Save a collection to GitHub (primary) + also update aggregated all.json
// + also backup to Sheets. Returns Promise resolved when GH writes complete.
// v3.5: CRITICAL FIX — was only writing data/{name}.json, but loadGlobalData
// reads from data/all.json first, so changes never appeared after refresh.
// Now we write both files (individual + aggregated) sequentially.
function saveCollection(name, arr) {
  return ghWriteJson(name + '.json', arr, 'data: ' + name + ' updated')
    .then(function(res) {
      if (!res || !res.ok) return res;
      // Build fresh all.json from current in-memory state (with this collection replaced)
      var aggregate = {
        news: name === 'news' ? arr : (newsData || []),
        events: name === 'events' ? arr : (eventsData || []),
        announcements: name === 'announcements' ? arr : (announcementsData || []),
        residents: name === 'residents' ? arr : (residentsData || []),
        market: name === 'market' ? arr : (marketData || []),
        simchot: name === 'simchot' ? arr : (simchotData || []),
        gemachim: name === 'gemachim' ? arr : (gemachimData || []),
        ticker: name === 'ticker' ? arr : (tickerData || []),
        featured: name === 'featured' ? arr : (featuredData || []),
        bulletins: name === 'bulletins' ? arr : (bulletinsData || []),
        _generated: new Date().toISOString(),
        _note: 'Managed via portal CMS. Do not edit manually.',
      };
      return ghWriteJson('all.json', aggregate, 'data: all.json aggregate refresh').then(function(aggRes) {
        // Backup to Sheets (fire-and-forget, non-blocking)
        try {
          var body = new URLSearchParams();
          body.set('action', 'maale_backup_collection');
          body.set('token', BACKEND_ADMIN_TOKEN);
          body.set('collection', name);
          body.set('data', JSON.stringify(arr));
          fetch(getBackendUrl(), { method: 'POST', body: body, keepalive: true }).catch(function() {});
        } catch (e) {}
        return { ok: true, sha: res.sha, aggSha: aggRes && aggRes.sha };
      });
    });
}

// ===== v3: Session-based auth (email/password OR Google) =====
// Store: localStorage['ma_current_user'] = { id, email, name, role, token }
// role ∈ { admin, editor, resident }
function getCurrentUser() {
  try {
    var u = JSON.parse(localStorage.getItem('ma_current_user') || 'null');
    if (!u) return null;
    // v3.1 Security: expire sessions older than 30 days
    if (u.loginAt && Date.now() - u.loginAt > 30 * 24 * 3600 * 1000) {
      localStorage.removeItem('ma_current_user');
      return null;
    }
    return u;
  } catch (e) { return null; }
}
// v3.1: Client-side rate limiting for login attempts (5 fails per 15 min)
function checkLoginRateLimit() {
  var key = 'ma_login_fails';
  var raw = localStorage.getItem(key);
  var arr = [];
  try { arr = raw ? JSON.parse(raw) : []; } catch (e) {}
  var cutoff = Date.now() - 15 * 60 * 1000;
  arr = arr.filter(function(t) { return t > cutoff; });
  localStorage.setItem(key, JSON.stringify(arr));
  return { allowed: arr.length < 5, remaining: 5 - arr.length };
}
function recordLoginFail() {
  var key = 'ma_login_fails';
  var arr = [];
  try { arr = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) {}
  arr.push(Date.now());
  localStorage.setItem(key, JSON.stringify(arr));
}
function clearLoginFails() { localStorage.removeItem('ma_login_fails'); }
function setCurrentUser(user) {
  if (user) localStorage.setItem('ma_current_user', JSON.stringify(user));
  else localStorage.removeItem('ma_current_user');
  applyRoleUi();
}
function logout() {
  setCurrentUser(null);
  showToast('התנתקת');
  location.hash = '';
  setTimeout(function() { location.reload(); }, 400);
}
function hasRole(r) {
  var u = getCurrentUser();
  if (!u) return false;
  if (r === 'admin') return u.role === 'admin';
  if (r === 'editor') return u.role === 'admin' || u.role === 'editor';
  if (r === 'resident') return !!u.role;
  return false;
}
// Apply role-based visibility across the site
function applyRoleUi() {
  var u = getCurrentUser();
  var role = u ? u.role : null;
  document.querySelectorAll('[data-requires-role]').forEach(function(el) {
    var required = el.getAttribute('data-requires-role').split(',').map(function(s) { return s.trim(); });
    var show = false;
    if (required.indexOf('any') >= 0 && role) show = true;
    if (required.indexOf(role) >= 0) show = true;
    if (role === 'admin' && (required.indexOf('editor') >= 0 || required.indexOf('resident') >= 0)) show = true;
    if (role === 'editor' && required.indexOf('resident') >= 0) show = true;
    el.style.display = show ? '' : 'none';
  });
  // Update greeting
  var greetings = document.querySelectorAll('[data-user-greeting]');
  greetings.forEach(function(el) { el.textContent = u ? (u.name || u.email) : ''; });
  var roleLabels = document.querySelectorAll('[data-user-role-label]');
  roleLabels.forEach(function(el) { el.textContent = role === 'admin' ? 'מנהל' : role === 'editor' ? 'עורך' : 'תושב'; });
}
// Login via email/password → backend (rate-limited)
function loginWithPassword(email, password) {
  var rl = checkLoginRateLimit();
  if (!rl.allowed) {
    return Promise.resolve({ ok: false, error: 'יותר מדי ניסיונות. נסה שוב בעוד 15 דקות.' });
  }
  var body = new URLSearchParams();
  body.set('action', 'maale_user_login');
  body.set('email', email); body.set('password', password);
  return fetch(getBackendUrl(), { method: 'POST', body: body })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res && res.ok) {
        clearLoginFails();
        setCurrentUser({
          id: res.user.id, email: res.user.email, name: res.user.name, role: res.user.role,
          token: res.token, loginMethod: 'password', loginAt: Date.now(),
        });
        return { ok: true, user: res.user };
      }
      recordLoginFail();
      return { ok: false, error: res && res.error || 'שגיאה' };
    })
    .catch(function(e) { recordLoginFail(); return { ok: false, error: 'שגיאת רשת: ' + e }; });
}
// Register-and-login as resident (self-service)
function selfRegister(name, email, password) {
  var body = new URLSearchParams();
  body.set('action', 'maale_user_self_register');
  body.set('name', name); body.set('email', email); body.set('password', password);
  return fetch(getBackendUrl(), { method: 'POST', body: body })
    .then(function(r) { return r.json(); });
}

// ===== v2: Analytics tracker =====
// Emits pageview + section-view + key-click beacons to the backend track endpoint.
// Also mirrors events to localStorage so admin dashboard has data even if backend
// hasn't been redeployed yet.
var MA_ANALYTICS_KEY = 'ma_analytics_local';
var MA_SID_KEY = 'ma_sid';
function maGetSid() {
  var sid = sessionStorage.getItem(MA_SID_KEY);
  if (!sid) {
    sid = 'sid_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    sessionStorage.setItem(MA_SID_KEY, sid);
  }
  return sid;
}
function maGetUid() {
  try {
    var g = window.residentGoogleUser;
    if (g && g.email) return g.email;
    var stored = localStorage.getItem('ma_current_user');
    if (stored) return JSON.parse(stored).email || '';
  } catch (e) {}
  return '';
}
function maLocalAppend(evt) {
  try {
    var arr = JSON.parse(localStorage.getItem(MA_ANALYTICS_KEY) || '[]');
    arr.push(evt);
    if (arr.length > 500) arr = arr.slice(-500);
    localStorage.setItem(MA_ANALYTICS_KEY, JSON.stringify(arr));
  } catch (e) {}
}
function maLocalSummary() {
  var arr = [];
  try { arr = JSON.parse(localStorage.getItem(MA_ANALYTICS_KEY) || '[]'); } catch (e) {}
  var now = Date.now(), dayMs = 24 * 3600 * 1000;
  var pv24 = 0, pv7 = 0, pv30 = 0;
  var pathCounts = {}, sectionCounts = {}, hourCounts = new Array(24).fill(0), dayCounts = {}, eventTypes = {};
  var sidsToday = {}, sidsWeek = {};
  arr.forEach(function(r) {
    var t = new Date(r.ts).getTime(); if (isNaN(t)) return;
    var e = r.event || 'pageview';
    eventTypes[e] = (eventTypes[e] || 0) + 1;
    if (e === 'pageview') {
      if (t > now - 30 * dayMs) pv30++;
      if (t > now - 7 * dayMs) pv7++;
      if (t > now - dayMs) pv24++;
      pathCounts[r.path || '/'] = (pathCounts[r.path || '/'] || 0) + 1;
      if (r.section) sectionCounts[r.section] = (sectionCounts[r.section] || 0) + 1;
      hourCounts[new Date(t).getHours()]++;
      var d = new Date(t).toISOString().slice(0, 10);
      dayCounts[d] = (dayCounts[d] || 0) + 1;
      if (r.sid) {
        if (t > now - dayMs) sidsToday[r.sid] = 1;
        if (t > now - 7 * dayMs) sidsWeek[r.sid] = 1;
      }
    }
  });
  var top = function(o) { return Object.keys(o).map(function(k) { return { k: k, count: o[k] }; }).sort(function(a, b) { return b.count - a.count; }).slice(0, 10); };
  return {
    pageviews_24h: pv24, pageviews_7d: pv7, pageviews_30d: pv30,
    unique_sessions_24h: Object.keys(sidsToday).length,
    unique_sessions_7d: Object.keys(sidsWeek).length,
    top_paths: top(pathCounts).map(function(x) { return { path: x.k, count: x.count }; }),
    top_sections: top(sectionCounts).map(function(x) { return { section: x.k, count: x.count }; }),
    hourly_distribution: hourCounts,
    timeline_14d: Object.keys(dayCounts).sort().slice(-14).map(function(d) { return { day: d, count: dayCounts[d] }; }),
    event_types: eventTypes,
    recent: arr.slice(-40).reverse(),
    total_events: arr.length,
    source: 'local',
  };
}
function maTrack(event, extra) {
  var payload = {
    ts: new Date().toISOString(),
    event: event || 'pageview',
    path: location.pathname + location.hash,
    section: (extra && extra.section) || '',
    referrer: document.referrer || '',
    ua: (navigator.userAgent || '').slice(0, 200),
    sid: maGetSid(),
    uid: maGetUid(),
    meta: (extra && extra.meta) ? JSON.stringify(extra.meta) : '',
  };
  maLocalAppend(payload);
  // Best-effort backend post — silently ignored if endpoint absent.
  try {
    var body = new URLSearchParams();
    body.set('action', 'maale_track');
    Object.keys(payload).forEach(function(k) { body.set(k, payload[k]); });
    fetch(getBackendUrl(), { method: 'POST', body: body, keepalive: true }).catch(function() {});
  } catch (e) {}
}
// Fire pageview on load
window.addEventListener('load', function() { setTimeout(function() { maTrack('pageview'); }, 300); });

// v3.4: Hero video graceful fallback
(function() {
  var vid = document.querySelector('.hero-video');
  var fallback = document.getElementById('heroFallbackSlides');
  if (!vid || !fallback) return;
  // Detect Save-Data / slow 2g connections → skip video
  var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (c && (c.saveData || /2g/i.test(c.effectiveType || ''))) {
    vid.style.display = 'none';
    fallback.style.display = 'block';
    return;
  }
  vid.addEventListener('error', function() {
    vid.style.display = 'none';
    fallback.style.display = 'block';
  });
  vid.addEventListener('stalled', function() {
    if (vid.readyState < 3) {
      setTimeout(function() {
        if (vid.readyState < 3) { vid.style.display = 'none'; fallback.style.display = 'block'; }
      }, 5000);
    }
  });
})();
// Fire section-view on scroll (only once per section per session)
var _maSeenSections = {};
function maObserveSections() {
  var sections = document.querySelectorAll('section[id], [data-track-section]');
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(en) {
      if (!en.isIntersecting) return;
      var id = en.target.id || en.target.getAttribute('data-track-section');
      if (!id || _maSeenSections[id]) return;
      _maSeenSections[id] = 1;
      maTrack('section_view', { section: id });
    });
  }, { threshold: 0.35 });
  sections.forEach(function(s) { io.observe(s); });
}
window.addEventListener('load', function() { setTimeout(maObserveSections, 800); });
// Click tracking on key CTAs
document.addEventListener('click', function(e) {
  var el = e.target.closest('a[href^="tel:"], a[href^="mailto:"], a[href^="https://wa.me"], .banner-card, .service-card, [data-track]');
  if (!el) return;
  var label = el.getAttribute('data-track') || el.getAttribute('aria-label') || (el.textContent || '').trim().slice(0, 40);
  var kind = el.href && el.href.startsWith('tel:') ? 'tel_click' :
             el.href && el.href.startsWith('mailto:') ? 'email_click' :
             el.href && el.href.startsWith('https://wa.me') ? 'whatsapp_click' :
             el.classList.contains('banner-card') ? 'banner_click' :
             el.classList.contains('service-card') ? 'service_click' :
             'cta_click';
  maTrack(kind, { section: label });
});

// Write one row to the backend. tab/op/data per admin_row contract.
// Returns a Promise. Safe to call without backend URL — resolves to {ok:false, error:'no_backend'}.
function backendWrite(tab, op, data) {
  var url = getBackendUrl();
  if (!url) return Promise.resolve({ ok: false, error: 'no_backend' });
  var body = new URLSearchParams();
  body.set('action', 'maale_admin_row');
  body.set('token', BACKEND_ADMIN_TOKEN);
  body.set('tab', tab);
  body.set('op', op);
  body.set('data', JSON.stringify(data || {}));
  return fetch(url, { method: 'POST', body: body })
    .then(function(r) { return r.json(); })
    .catch(function(e) { return { ok: false, error: String(e) }; });
}

// v3: PRIMARY source of truth = data/*.json in the repo (GitHub Pages CDN).
// Sheets is BACKUP only. Load order: GitHub → Sheets fallback → empty.
function loadGlobalData() {
  // 1) Try GitHub (fast, primary)
  ghReadAll()
    .then(function(b) {
      newsData = b.news || [];
      eventsData = b.events || [];
      announcementsData = b.announcements || [];
      residentsData = b.residents || [];
      marketData = b.market || [];
      simchotData = b.simchot || [];
      gemachimData = b.gemachim || [];
      tickerData = b.ticker || [];
      featuredData = b.featured || [];
      bulletinsData = b.bulletins || [];
      renderAll();
      // Also refresh from Sheets in background to catch out-of-band edits, but
      // don't clobber GitHub-primary state on failure.
      loadFromSheetsBackground();
    })
    .catch(function() {
      // 2) Fallback to Sheets if data/*.json missing
      loadFromSheetsThenRender();
    });
}

function loadFromSheetsBackground() {
  var url = getBackendUrl();
  if (!url) return;
  fetch(url + '?action=maale_all&t=' + Date.now())
    .then(function(r) { return r.json(); })
    .then(function(b) {
      if (!b || !b.ok) return;
      // Only merge if the Sheets version is materially newer or larger — keep GitHub authoritative
      if ((b.news || []).length > newsData.length) { newsData = b.news; renderNews(); }
      if ((b.events || []).length > eventsData.length) { eventsData = b.events; renderEvents(); }
      if ((b.announcements || []).length > announcementsData.length) { announcementsData = b.announcements; renderAnnouncements(); }
    })
    .catch(function() {});
}

function loadFromSheetsThenRender() {
  var backendUrl = getBackendUrl();
  if (!backendUrl) { renderAll(); return; }
  fetch(backendUrl + '?action=maale_all&t=' + Date.now())
    .then(function(r) { return r.json(); })
    .then(function(b) {
      if (b && b.ok) {
        newsData = b.news || [];
        eventsData = b.events || [];
        announcementsData = b.announcements || [];
        residentsData = b.residents || [];
        marketData = b.market || [];
        simchotData = b.simchot || [];
        gemachimData = b.gemachim || [];
        tickerData = b.ticker || [];
      }
      renderAll();
    })
    .catch(function() { renderAll(); });
}

// Publish all data to GitHub (admin only)
function addAnnouncement() {
  var type = document.getElementById('annType').value;
  var title = document.getElementById('annTitle').value.trim();
  var body = document.getElementById('annBody').value.trim();
  var date = document.getElementById('annDate').value.trim();
  if (!title || !body) { showToast('כותרת ותוכן הם שדות חובה'); return; }
  var item = { id: _newItemId(), type: type, title: title, body: body, date: date };
  announcementsData.unshift(item);
  setData('announcements', announcementsData);
  refreshAdminLists();
  renderAll();
  ['annTitle','annBody','annDate'].forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
  showToast('הודעה נוספה!');
  backendWrite('announcements', 'add', item).then(_backendSyncToast);
}

// Show pending registrations from local + invite admin to approve.
function showPendingRegistrations() {
  var users = getData('registered_users', []);
  var pending = users.filter(function(u) { return u.status === 'pending'; });
  if (!pending.length) { showToast('אין הרשמות ממתינות'); return; }
  var lines = pending.map(function(u, i) { return (i+1) + '. ' + u.name + ' / ' + u.phone + (u.addr ? ' / ' + u.addr : ''); }).join('\n');
  var name = prompt('הרשמות ממתינות:\n\n' + lines + '\n\nהקלד את השם המדויק כדי לאשר (או ביטול):');
  if (!name) return;
  name = name.trim();
  var idx = users.findIndex(function(u) { return u.name === name && u.status === 'pending'; });
  if (idx < 0) { showToast('לא נמצאה הרשמה ממתינה בשם זה'); return; }
  users[idx].status = 'approved';
  users[idx].approved_at = new Date().toISOString();
  setData('registered_users', users);
  // Also add to residents list (so name+code login via path 1 works too)
  var code = String(Math.floor(1000 + Math.random() * 9000));
  residentsData.push({ id: _newItemId(), name: users[idx].name, code: code, role: 'תושב', status: 'אושר', phone: users[idx].phone });
  setData('residents', residentsData);
  refreshAdminLists();
  refreshAdminDashboard();
  showToast('✓ ' + name + ' אושר. קוד אישי: ' + code);
  backendWrite('residents', 'add', residentsData[residentsData.length - 1]).then(_backendSyncToast);
}
window.showPendingRegistrations = showPendingRegistrations;

function publishToGitHub() {
  var token = getGhToken();
  if (!token) { showToast('הזינו GitHub Token בהגדרות תחילה'); return; }
  var data = {
    news: newsData,
    events: eventsData,
    market: marketData,
    simchot: simchotData,
    gemachim: gemachimData,
    ticker: tickerData,
    announcements: announcementsData,
    residents: residentsData
  };
  var content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
  // First get current file SHA
  showToast('מפרסם שינויים...');
  fetch('https://api.github.com/repos/maale-amos/maale-amos.github.io/contents/data.json', {
    headers: { 'Authorization': 'token ' + token }
  })
  .then(function(r) { return r.json(); })
  .then(function(fileInfo) {
    var sha = fileInfo.sha || '';
    return fetch('https://api.github.com/repos/maale-amos/maale-amos.github.io/contents/data.json', {
      method: 'PUT',
      headers: {
        'Authorization': 'token ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Update data.json from CMS',
        content: content,
        sha: sha
      })
    });
  })
  .then(function(r) { return r.json(); })
  .then(function(result) {
    if (result.content) {
      showToast('פורסם בהצלחה! כל המבקרים יראו את השינויים.');
    } else {
      showToast('שגיאה: ' + (result.message || 'לא ידוע'));
    }
  })
  .catch(function(err) {
    showToast('שגיאה בפרסום: ' + err.message);
  });
}

// ===== RENDER =====
function renderNews() {
  if (!newsData.length) {
    document.getElementById('newsGrid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-light)"><i class="bi bi-newspaper" style="font-size:3rem;opacity:.3"></i><p style="margin-top:12px">אין חדשות להצגה כרגע</p></div>';
    return;
  }
  document.getElementById('newsGrid').innerHTML = newsData.map(function(n, i) {
    var safeTitle = escHtml(n.title || '');
    var safeDesc = escHtml(n.desc || '');
    var safeCat = escHtml(n.cat || '');
    var safeDate = escHtml(n.date || '');
    var safeImg = (n.img || '').replace(/'/g,'%27');
    // Mark news created in last 48h as "new" — based on created_at if available
    var isNew = false;
    if (n.created_at) {
      try { isNew = (Date.now() - new Date(n.created_at).getTime()) < 48 * 3600 * 1000; } catch(e) {}
    }
    return '<article class="news-card' + (isNew ? ' is-new' : '') + '" tabindex="0" role="button" aria-label="קרא כתבה: ' + safeTitle + '" onclick="openNewsArticle(' + i + ')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();openNewsArticle(' + i + ')}">' +
      '<div class="news-card-img" style="background-image:url(\'' + safeImg + '\')"><span class="badge-cat">' + safeCat + '</span></div>' +
      '<div class="news-card-body">' +
        '<div class="date"><i class="bi bi-calendar3" aria-hidden="true"></i> ' + safeDate + '</div>' +
        '<h3>' + safeTitle + '</h3>' +
        '<p>' + safeDesc + '</p>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid #f0eee5">' +
          '<span class="wa-share" onclick="event.stopPropagation();shareWA(\'' + encodeURIComponent(n.title) + '\')" style="cursor:pointer"><i class="bi bi-whatsapp" aria-hidden="true"></i> שתף</span>' +
          '<span style="color:var(--primary);font-weight:700;display:inline-flex;align-items:center;gap:6px"><i class="bi bi-book-half" aria-hidden="true"></i> קרא כתבה <i class="bi bi-arrow-left-circle-fill" aria-hidden="true"></i></span>' +
        '</div>' +
      '</div>' +
    '</article>';
  }).join('');
}

function renderEvents() {
  document.getElementById('eventsList').innerHTML = eventsData.map(e =>
    '<div class="event-item"><div class="event-date-box"><div class="day">' + e.day + '</div><div class="month">' + e.month + '</div></div><div class="event-info"><h4>' + e.title + '</h4><p>' + e.desc + '</p><div class="event-meta"><span><i class="bi bi-clock"></i> ' + e.time + '</span><span><i class="bi bi-geo-alt"></i> ' + e.location + '</span></div></div><button class="event-add-cal" onclick="showToast(\'נוסף ליומן!\')"><i class="bi bi-calendar-plus"></i> יומן</button></div>'
  ).join('');
}

function renderMarket(filter) {
  filter = filter || 'all';
  var filtered = filter === 'all' ? marketData : marketData.filter(function(m) { return m.cat === filter; });
  document.getElementById('marketGrid').innerHTML = filtered.map(function(m) {
    return '<div class="market-card"><div class="price">' + m.price + '</div><h4>' + m.title + '</h4><p>' + m.desc + '</p><div class="seller"><i class="bi bi-person"></i> ' + m.seller + '</div></div>';
  }).join('');
}

function renderSimchot() {
  var icons = { wedding: 'bi-heart-fill', baby: 'bi-balloon-heart', barmitzva: 'bi-star-fill', engagement: 'bi-gem' };
  var labels = { wedding: 'חתונה', baby: 'לידה', barmitzva: 'בר/בת מצווה', engagement: 'אירוסין' };
  document.getElementById('simchaList').innerHTML = simchotData.map(function(s) {
    return '<div class="simcha-item"><div class="simcha-icon ' + s.type + '"><i class="bi ' + (icons[s.type]||'bi-star') + '"></i></div><div class="simcha-info"><h4>' + s.family + ' — ' + (labels[s.type]||s.type) + '</h4><p>' + s.details + '</p></div><div class="simcha-date">' + (s.date||'') + '</div></div>';
  }).join('');
}

function renderGemachim() {
  document.getElementById('gemachGrid').innerHTML = gemachimData.map(function(g) {
    var phoneClean = (g.phone || '').replace(/[^\d]/g, '');
    var phoneHtml = phoneClean
      ? '<a href="tel:' + phoneClean + '" class="phone" style="text-decoration:none" aria-label="חייג ל' + g.name + ' - ' + g.phone + '"><i class="bi bi-telephone" aria-hidden="true"></i> ' + g.phone + '</a>'
      : '';
    return '<div class="gemach-card"><i class="bi ' + g.icon + '" aria-hidden="true"></i><h4>' + g.name + '</h4><p>' + g.desc + '</p>' + phoneHtml + '</div>';
  }).join('');
}

function renderTicker() {
  document.getElementById('tickerWrap').innerHTML = tickerData.map(function(t) {
    // Backward-compat: handle both string and {id,msg} shapes
    var text = (typeof t === 'string') ? t : (t && t.msg) ? t.msg : '';
    return text ? '<span><i class="bi bi-bell-fill"></i> ' + text + '</span>' : '';
  }).join('');
}

function renderAnnouncements() {
  var el = document.getElementById('announcementsList');
  if (!el) return;
  el.innerHTML = announcementsData.map(function(a) {
    var ctaHtml = '';
    if (a.cta && a.ctaLink) {
      var isExternal = a.ctaLink.indexOf('http') === 0 || a.ctaLink.indexOf('tel:') === 0 || a.ctaLink.indexOf('mailto:') === 0;
      ctaHtml = '<a class="announcement-btn" href="' + a.ctaLink + '"' + (isExternal ? ' target="_blank" rel="noopener"' : '') + ' aria-label="' + a.cta + ' - ' + a.title + '"><i class="bi bi-arrow-left" aria-hidden="true"></i> ' + a.cta + '</a>';
    }
    var shareHtml = '<button class="announcement-btn outline" onclick="shareAnnouncement(\'' + encodeURIComponent(a.title) + '\',\'' + encodeURIComponent(a.body) + '\')" aria-label="שתף ' + a.title + ' בוואטסאפ"><i class="bi bi-whatsapp" aria-hidden="true"></i> שתף</button>';
    return '<article class="announcement-card ' + (a.type || 'info') + '" tabindex="0">' +
      '<div class="announcement-meta">' +
        '<span class="announcement-tag ' + (a.type || 'info') + '"><i class="bi ' + (a.icon || 'bi-megaphone') + '" aria-hidden="true"></i> ' + (a.typeLabel || 'הודעה') + '</span>' +
        '<span><i class="bi bi-calendar3" aria-hidden="true"></i> ' + (a.date || '') + '</span>' +
      '</div>' +
      '<h4>' + a.title + '</h4>' +
      '<p>' + a.body + '</p>' +
      '<div class="announcement-actions">' + ctaHtml + shareHtml + '</div>' +
    '</article>';
  }).join('');
}

// ===== ARCHIVE MODAL =====
function showArchiveModal(type) {
  var titles = { news: 'ארכיון החדשות', announcements: 'ארכיון הודעות המזכירות' };
  var items = type === 'news' ? newsData : announcementsData;
  if (!items || !items.length) {
    showToast('אין פריטים בארכיון עדיין');
    return;
  }
  // Sort by date/created_at descending
  var sorted = items.slice().sort(function(a, b) {
    var da = new Date(a.created_at || a.date || 0).getTime();
    var db = new Date(b.created_at || b.date || 0).getTime();
    return db - da;
  });
  var html = '';
  if (type === 'news') {
    html = sorted.map(function(n) {
      return '<article class="archive-item" onclick="closeArchiveModal();openNewsArticle(' + newsData.indexOf(n) + ')" style="cursor:pointer;padding:16px;border-bottom:1px solid #eee;display:flex;gap:16px;align-items:start">' +
        (n.img ? '<div style="width:80px;height:80px;flex-shrink:0;border-radius:8px;background-image:url(\'' + (n.img||'').replace(/\'/g,"%27") + '\');background-size:cover;background-position:center"></div>' : '') +
        '<div style="flex:1"><div style="font-size:.8rem;color:var(--text-light);margin-bottom:4px"><i class="bi bi-calendar3"></i> ' + escHtml(n.date||'') + ' · ' + escHtml(n.cat||'') + '</div>' +
        '<h4 style="margin:0 0 6px;color:var(--primary)">' + escHtml(n.title||'') + '</h4>' +
        '<p style="margin:0;color:var(--text-light);font-size:.9rem">' + escHtml((n.desc||'').substring(0,120)) + '</p></div></article>';
    }).join('');
  } else {
    html = sorted.map(function(a) {
      return '<article class="archive-item" style="padding:16px;border-bottom:1px solid #eee">' +
        '<div style="font-size:.8rem;color:var(--text-light);margin-bottom:4px"><i class="bi ' + (a.icon||'bi-megaphone') + '"></i> ' + escHtml(a.typeLabel||'הודעה') + ' · ' + escHtml(a.date||'') + '</div>' +
        '<h4 style="margin:0 0 6px;color:var(--primary)">' + escHtml(a.title||'') + '</h4>' +
        '<p style="margin:0">' + escHtml(a.body||'') + '</p>' +
        (a.ctaLink ? '<a href="' + a.ctaLink + '" style="display:inline-block;margin-top:8px;color:var(--primary);text-decoration:none;font-weight:600">' + escHtml(a.cta||'למידע נוסף') + ' <i class="bi bi-arrow-left"></i></a>' : '') +
        '</article>';
    }).join('');
  }
  var modal = document.getElementById('archiveModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'archiveModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto';
    modal.onclick = function(e) { if (e.target === modal) closeArchiveModal(); };
    document.body.appendChild(modal);
  }
  modal.innerHTML = '<div style="background:#fff;border-radius:16px;max-width:700px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)">' +
    '<div style="padding:20px;border-bottom:2px solid var(--primary);display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:#fff;z-index:1"><h3 style="margin:0;color:var(--primary)"><i class="bi bi-archive"></i> ' + titles[type] + ' (' + sorted.length + ')</h3>' +
    '<button onclick="closeArchiveModal()" style="background:none;border:none;font-size:2rem;cursor:pointer;color:var(--text-light);line-height:1">&times;</button></div>' +
    '<div style="padding:8px 0">' + html + '</div></div>';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeArchiveModal() {
  var modal = document.getElementById('archiveModal');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}

function shareAnnouncement(title, body) {
  var t = decodeURIComponent(title);
  var b = decodeURIComponent(body);
  var msg = '*' + t + '*%0A%0A' + encodeURIComponent(b) + '%0A%0A' + encodeURIComponent('פרטים נוספים: ' + location.href);
  window.open('https://wa.me/?text=' + msg, '_blank');
}

// ===== INTERACTIONS =====
function toggleMenu() {
  var menu = document.getElementById('navMenu');
  menu.classList.toggle('open');
  var btn = document.querySelector('.mobile-toggle');
  if (btn) btn.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
}
document.querySelectorAll('.nav-menu > li > a').forEach(function(a) {
  a.addEventListener('click', function(e) {
    if (window.innerWidth <= 991 && this.parentElement.querySelector('.dropdown-mega')) {
      e.preventDefault(); this.parentElement.classList.toggle('open');
    }
  });
});

function filterMarket(cat, btn) {
  document.querySelectorAll('.marketplace-tabs .tab-btn').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  renderMarket(cat);
}

function submitContact(e) { e.preventDefault(); showToast('הפנייה נשלחה בהצלחה!'); e.target.reset(); }

function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 3000);
}

// ===== GOOGLE SIGN-IN =====
// v3: re-enabled. If OAuth origin isn't whitelisted, the button will render
// but produce a 401/403 error inline — we detect and show the hint banner.
var GSI_CLIENT_ID = '1072944905499-vm2v2i5dvn0a0d2o4ca36i1vge8cvbn0.apps.googleusercontent.com';
function initGoogleSignIn() {
  if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
    setTimeout(initGoogleSignIn, 500);
    return;
  }
  try {
    google.accounts.id.initialize({
      client_id: GSI_CLIENT_ID,
      callback: handleGoogleCredential,
      ux_mode: 'popup',
      auto_select: false,
    });
    var div = document.getElementById('googleSignInDiv');
    if (div) {
      div.style.display = '';
      google.accounts.id.renderButton(div, {
        theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular',
        logo_alignment: 'center', width: 300, locale: 'he',
      });
      // If origin is not whitelisted the button renders but click will fail.
      // We show the fallback hint after a short delay if renderButton silently errors.
      setTimeout(function() {
        var btnFrame = div.querySelector('iframe');
        if (!btnFrame) {
          var hint = document.getElementById('googleFallbackHint');
          if (hint) hint.style.display = '';
        }
      }, 2500);
    }
  } catch (e) {
    var hint = document.getElementById('googleFallbackHint');
    if (hint) hint.style.display = '';
  }
  return;
}

function googleSignIn() {
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.prompt();
  } else {
    showToast('שירות Google לא זמין. השתמשו בכניסה רגילה.');
  }
}

function handleGoogleCredential(response) {
  try {
    var parts = response.credential.split('.');
    var payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
    // v3: try backend Google auth first — resolves role
    var body = new URLSearchParams();
    body.set('action', 'maale_google_login');
    body.set('email', payload.email);
    body.set('name', payload.name);
    body.set('id_token', response.credential);
    fetch(getBackendUrl(), { method: 'POST', body: body })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        var role = res && res.ok ? res.user.role : 'resident';
        setCurrentUser({
          id: res && res.ok ? res.user.id : ('g_' + payload.sub),
          email: payload.email,
          name: payload.name,
          role: role,
          picture: payload.picture || '',
          token: res && res.token || '',
          loginMethod: 'google',
        });
        showResidentDashboard(payload.name, payload.email, payload.picture || '');
        showToast('ברוך הבא, ' + payload.name + '!');
      })
      .catch(function() {
        // Backend unreachable → local-only session as resident
        setCurrentUser({
          id: 'g_' + payload.sub,
          email: payload.email,
          name: payload.name,
          role: 'resident',
          picture: payload.picture || '',
          loginMethod: 'google',
        });
        showResidentDashboard(payload.name, payload.email, payload.picture || '');
        showToast('ברוך הבא, ' + payload.name + '!');
      });
  } catch(e) {
    showToast('שגיאה בכניסה עם Google');
  }
}

// v3: unified email/password login
function unifiedLogin() {
  var email = (document.getElementById('loginEmail').value || '').trim().toLowerCase();
  var password = document.getElementById('loginPassword').value;
  var errEl = document.getElementById('loginErr');
  errEl.style.display = 'none';
  if (!email || !password) { errEl.textContent = 'נא למלא אימייל וסיסמה'; errEl.style.display=''; return; }
  loginWithPassword(email, password).then(function(res) {
    if (res.ok) {
      showResidentDashboard(res.user.name, res.user.email, '');
      showToast('ברוך הבא, ' + res.user.name + '! (' + (res.user.role === 'admin' ? 'מנהל' : res.user.role === 'editor' ? 'עורך' : 'תושב') + ')');
    } else {
      errEl.textContent = res.error === 'user not found or blocked' ? 'משתמש לא נמצא או חסום' :
                          res.error === 'wrong password' ? 'סיסמה שגויה' :
                          ('שגיאה: ' + res.error);
      errEl.style.display = '';
    }
  });
}
// v3: unified self-registration
function unifiedRegister() {
  var name = (document.getElementById('regName').value || '').trim();
  var email = (document.getElementById('regEmail').value || '').trim().toLowerCase();
  var password = document.getElementById('regPass').value;
  var errEl = document.getElementById('regErr');
  errEl.style.display = 'none';
  if (!name || !email || !password) { errEl.textContent = 'נא למלא שם, אימייל וסיסמה'; errEl.style.display=''; return; }
  if (password.length < 6) { errEl.textContent = 'סיסמה חייבת 6 תווים לפחות'; errEl.style.display=''; return; }
  selfRegister(name, email, password).then(function(res) {
    if (res && res.ok) {
      showToast('נרשמת בהצלחה! מתחבר...');
      loginWithPassword(email, password).then(function(l) {
        if (l.ok) { showResidentDashboard(l.user.name, l.user.email, ''); }
        else { showLoginTab(); }
      });
    } else {
      errEl.textContent = res && res.error === 'email already registered' ? 'האימייל כבר רשום' : ('שגיאה: ' + (res && res.error || 'לא ידוע'));
      errEl.style.display = '';
    }
  });
}

// Init Google on load
setTimeout(initGoogleSignIn, 1000);

// ===== RESIDENT LOGIN & REGISTRATION =====
var RESIDENT_CODE = getData('resident_code', '1234');

function showRegTab() { document.getElementById('loginTab').style.display='none'; document.getElementById('registerTab').style.display=''; }
function showLoginTab() { document.getElementById('registerTab').style.display='none'; document.getElementById('loginTab').style.display=''; }

function registerResident() {
  var name = document.getElementById('regName').value;
  var phone = document.getElementById('regPhone').value;
  var addr = document.getElementById('regAddress').value;
  var pass = document.getElementById('regPass').value;
  if (!name || !phone || !pass) { showToast('נא למלא את כל השדות'); return; }
  if (pass.length < 4) { showToast('סיסמה חייבת לפחות 4 תווים'); return; }
  // Save registration locally
  var users = getData('registered_users', []);
  var exists = users.find(function(u) { return u.phone === phone; });
  if (exists) { showToast('מספר זה כבר רשום. היכנסו!'); showLoginTab(); return; }
  // Save as PENDING — admin must approve before login is allowed.
  users.push({ name: name, phone: phone, addr: addr, pass: simpleHash(pass), status: 'pending', registered: new Date().toISOString() });
  setData('registered_users', users);
  // Reset form
  ['regName','regPhone','regAddress','regPass'].forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
  showLoginTab();
  showToast('הבקשה נשלחה לוועד. תקבלו הודעה לאחר אישור.');
  // Push to backend registrations tab so the committee sees pending requests
  var backendUrl = getBackendUrl();
  if (backendUrl) {
    var body = new URLSearchParams();
    body.set('action', 'maale_register');
    body.set('name', name);
    body.set('phone', phone);
    body.set('address', addr || '');
    body.set('email', '');
    fetch(backendUrl, { method: 'POST', body: body })
      .then(function(r) { return r.json(); })
      .then(function(r) {
        if (r && r.ok) showToast('✓ נשלח לוועד לאישור');
        else if (r && r.error) showToast('הודעה לוועד נכשלה: ' + r.error);
      })
      .catch(function() { /* silent — already saved locally */ });
  }
}

function residentLogin() {
  var name = (document.getElementById('residentName2').value || '').trim();
  var code = (document.getElementById('residentCode').value || '').trim();
  if (!name || !code) { showToast('נא למלא שם וקוד אישי'); return; }
  // 1. Check residents lookup table (per-resident codes — primary auth)
  var nameNorm = name.replace(/\s+/g,' ');
  var resident = (residentsData || []).find(function(r) {
    var rn = (r.name||'').replace(/\s+/g,' ');
    return rn === nameNorm && String(r.code) === code;
  });
  if (resident) {
    sessionStorage.setItem('ma_user', JSON.stringify({ name: resident.name, email: '', picture: '', role: resident.role || 'תושב' }));
    showResidentDashboard(resident.name, resident.role || 'תושב', '');
    showToast('ברוך הבא, ' + resident.name + '!');
    return;
  }
  // 2. Fallback: registered users (self-registration with password) — APPROVED only.
  var users = getData('registered_users', []);
  var hash = simpleHash(code);
  var user = users.find(function(u) { return u.name === name && u.pass === hash; });
  if (user) {
    if (user.status !== 'approved') {
      showToast('הבקשה שלך עדיין ממתינה לאישור הוועד.');
      return;
    }
    sessionStorage.setItem('ma_user', JSON.stringify({ name: user.name, email: user.phone, picture: '' }));
    showResidentDashboard(user.name, user.phone, '');
    showToast('ברוך הבא, ' + user.name + '!');
    return;
  }
  // 3. Legacy community code (deprecated, kept for backward compat)
  if (code === RESIDENT_CODE && code !== '1234') {
    sessionStorage.setItem('ma_user', JSON.stringify({ name: name, email: '', picture: '' }));
    showResidentDashboard(name, '', '');
    showToast('ברוך הבא, ' + name + '!');
    return;
  }
  showToast('שם או קוד אישי שגוי. ודאו שהזנתם בדיוק כפי שמופיע ברישום הוועד.');
}

function simpleHash(str) {
  var h = 0;
  for (var i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return h.toString(36);
}

function showResidentDashboard(name, email, pic) {
  document.getElementById('residentGate').style.display = 'none';
  var dash = document.getElementById('residentDashboard');
  dash.classList.add('active');
  document.getElementById('residentName').textContent = 'שלום, ' + name + '!';
  document.getElementById('residentEmail').textContent = email;
  var avatar = document.getElementById('residentAvatar');
  if (pic) { avatar.src = pic; avatar.style.display = 'block'; }
  else { avatar.style.display = 'none'; }
  // v3: role-based UI reveal
  applyRoleUi();
}
// v3: restore session on page load so refresh preserves login
document.addEventListener('DOMContentLoaded', function() {
  var u = getCurrentUser();
  if (u) {
    setTimeout(function() {
      showResidentDashboard(u.name || 'משתמש', u.email || '', u.picture || '');
    }, 500);
  }
});

function residentLogout() {
  sessionStorage.removeItem('ma_user');
  document.getElementById('residentGate').style.display = '';
  document.getElementById('residentDashboard').classList.remove('active');
  showToast('התנתקת בהצלחה');
}

// Check session on load
(function() {
  var u = sessionStorage.getItem('ma_user');
  if (u) { try { u = JSON.parse(u); showResidentDashboard(u.name, u.email, u.picture || ''); } catch(e) {} }
})();

// ===== ADMIN CMS =====
function openAdmin() { document.getElementById('adminOverlay').classList.add('active'); document.body.style.overflow = 'hidden'; if (location.hash !== '#admin') location.hash = 'admin'; }
// Auto-open admin if URL has #admin
window.addEventListener('hashchange', function() { if (location.hash === '#admin') openAdmin(); });
if (location.hash === '#admin') setTimeout(openAdmin, 100);
function closeAdmin() { document.getElementById('adminOverlay').classList.remove('active'); document.body.style.overflow = ''; }

function adminLogin() {
  var code = document.getElementById('adminCode').value;
  if (code === getAdminCode()) {
    document.getElementById('adminLoginSection').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
    sessionStorage.setItem('ma_admin', '1');
    refreshAdminLists();
    refreshAdminDashboard();
  } else {
    showToast('קוד שגוי!');
  }
}

function refreshAdminDashboard() {
  var stats = document.getElementById('adminStatsLine');
  var pendingCount = (getData('registered_users', []) || []).filter(function(u){ return u.status === 'pending'; }).length;
  var pendingHtml = pendingCount > 0
    ? ' &nbsp; · &nbsp; <a href="#" onclick="event.preventDefault(); showPendingRegistrations()" style="color:#fbbf24;font-weight:700"><i class="bi bi-person-exclamation"></i> ' + pendingCount + ' ממתינות לאישור</a>'
    : '';
  if (stats) {
    stats.innerHTML =
      '<i class="bi bi-newspaper"></i> ' + newsData.length + ' חדשות &nbsp; · &nbsp;' +
      '<i class="bi bi-calendar3"></i> ' + eventsData.length + ' אירועים &nbsp; · &nbsp;' +
      '<i class="bi bi-shop"></i> ' + marketData.length + ' מודעות &nbsp; · &nbsp;' +
      '<i class="bi bi-person-vcard"></i> ' + residentsData.length + ' תושבים' +
      pendingHtml;
  }
  // Check sync
  var dot = document.getElementById('adminSyncDot');
  var txt = document.getElementById('adminSyncText');
  if (!dot || !txt) return;
  if (!getBackendUrl()) {
    dot.style.background = '#9ca3af';
    txt.textContent = 'שיטס לא מוגדר';
    return;
  }
  fetch(getBackendUrl() + '?action=maale_health&t=' + Date.now())
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d && d.ok) {
        dot.style.background = '#10b981';
        txt.textContent = '✓ שיטס מסונכרן';
      } else {
        dot.style.background = '#f59e0b';
        txt.textContent = 'שיטס לא זמין';
      }
    })
    .catch(function() {
      dot.style.background = '#ef4444';
      txt.textContent = 'אין חיבור לשיטס';
    });
}

// Auto-login admin if session exists
(function() {
  if (sessionStorage.getItem('ma_admin') === '1') {
    document.getElementById('adminLoginSection').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
  }
})();

function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.admin-section').forEach(function(s) { s.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById('admin-' + tab).classList.add('active');
  refreshAdminLists();
  // v2 lazy loaders
  if (tab === 'analytics') loadAnalytics();
  if (tab === 'users') loadUsers();
  if (tab === 'audit') loadAudit();
}

// ===== v2: analytics dashboard =====
// v3.1: Portal-embedded loaders (use portal* DOM ids)
function loadPortalAnalytics() { _loadAnalyticsInto('portal'); }
function loadPortalUsers() { _loadUsersInto('portal'); }
function loadPortalAudit() { _loadAuditInto('portal'); }
function portalCreateUser() {
  var name = document.getElementById('pu_name').value.trim();
  var email = document.getElementById('pu_email').value.trim().toLowerCase();
  var password = document.getElementById('pu_password').value;
  var role = document.getElementById('pu_role').value;
  if (!name || !email || !password) { showToast('שם + אימייל + סיסמה חובה'); return; }
  if (password.length < 6) { showToast('סיסמה חייבת להיות 6 תווים לפחות'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('אימייל לא תקין'); return; }
  var body = new URLSearchParams();
  body.set('action', 'maale_user_create');
  body.set('token', BACKEND_ADMIN_TOKEN);
  body.set('name', name); body.set('email', email); body.set('password', password); body.set('role', role);
  fetch(getBackendUrl(), { method: 'POST', body: body })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res && res.ok) {
        showToast('✅ משתמש נוסף');
        ['pu_name','pu_email','pu_password'].forEach(function(id) { document.getElementById(id).value = ''; });
        loadPortalUsers();
      } else { showToast('שגיאה: ' + (res && res.error || 'לא ידוע')); }
    });
}
function portalEditUser(id, curName, curRole) {
  var name = prompt('שם חדש:', curName);
  if (name === null) return;
  var role = prompt('תפקיד (admin/editor/resident):', curRole);
  if (role === null) return;
  if (['admin','editor','resident'].indexOf(role) < 0) { showToast('תפקיד חייב להיות admin/editor/resident'); return; }
  var body = new URLSearchParams();
  body.set('action', 'maale_user_update');
  body.set('token', BACKEND_ADMIN_TOKEN);
  body.set('id', id); body.set('name', name); body.set('role', role);
  fetch(getBackendUrl(), { method: 'POST', body: body })
    .then(function(r) { return r.json(); })
    .then(function(res) { showToast(res && res.ok ? '✅ עודכן' : 'שגיאה'); loadPortalUsers(); });
}
function portalDeleteUser(id) {
  if (!confirm('למחוק את המשתמש?')) return;
  var body = new URLSearchParams();
  body.set('action', 'maale_user_delete');
  body.set('token', BACKEND_ADMIN_TOKEN);
  body.set('id', id);
  fetch(getBackendUrl(), { method: 'POST', body: body })
    .then(function(r) { return r.json(); })
    .then(function(res) { showToast(res && res.ok ? '✅ נמחק' : 'שגיאה'); loadPortalUsers(); });
}
// Shared internal loaders — target parameterized ('admin' or 'portal')
function _loadAnalyticsInto(prefix) {
  var srcEl = document.getElementById(prefix === 'portal' ? 'portalAnalyticsSource' : 'analyticsSource');
  if (srcEl) srcEl.innerHTML = '<i class="bi bi-hourglass-split"></i> טוען...';
  var body = new URLSearchParams();
  body.set('action', 'maale_analytics_summary');
  body.set('token', BACKEND_ADMIN_TOKEN);
  fetch(getBackendUrl(), { method: 'POST', body: body })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res && res.ok) _renderAnalyticsInto(prefix, res.summary, 'שרת (Google Sheets)');
      else _renderAnalyticsInto(prefix, maLocalSummary(), 'מקומי בדפדפן (השרת לא זמין כעת)');
    })
    .catch(function() { _renderAnalyticsInto(prefix, maLocalSummary(), 'מקומי בדפדפן (השרת לא זמין)'); });
}
function _renderAnalyticsInto(prefix, s, srcNote) {
  var id = function(base) { return prefix === 'portal' ? ('portalA' + base.slice(1)) : ('a' + base.slice(1)); };
  var ids = {
    source: prefix === 'portal' ? 'portalAnalyticsSource' : 'analyticsSource',
    cards: prefix === 'portal' ? 'portalAnalyticsCards' : 'analyticsCards',
    timeline: prefix === 'portal' ? 'portalAnalyticsTimelineChart' : 'analyticsTimelineChart',
    hour: prefix === 'portal' ? 'portalAnalyticsHourChart' : 'analyticsHourChart',
    sections: prefix === 'portal' ? 'portalAnalyticsSections' : 'analyticsSections',
    events: prefix === 'portal' ? 'portalAnalyticsEventTypes' : 'analyticsEventTypes',
    recent: prefix === 'portal' ? 'portalAnalyticsRecent' : 'analyticsRecent',
  };
  var srcEl = document.getElementById(ids.source);
  if (srcEl) srcEl.innerHTML = '<i class="bi bi-database"></i> מקור: ' + srcNote + ' &nbsp;·&nbsp; סה"כ אירועים: ' + s.total_events;
  var card = function(icon, label, num, color) {
    return '<div style="background:linear-gradient(135deg,' + color + ',#fff);border-radius:10px;padding:14px;border:1px solid rgba(0,0,0,.05);box-shadow:0 2px 6px rgba(0,0,0,.04)"><div style="color:var(--text-light);font-size:0.75rem"><i class="bi bi-' + icon + '"></i> ' + label + '</div><div style="font-weight:800;font-size:1.6rem;color:var(--primary-dark)">' + num + '</div></div>';
  };
  var cardsEl = document.getElementById(ids.cards);
  if (cardsEl) cardsEl.innerHTML =
    card('eye-fill', 'ביקורים ב-24ש\'', s.pageviews_24h, '#e8f5e9') +
    card('calendar-week', 'ביקורים 7 ימים', s.pageviews_7d, '#e0f2fe') +
    card('calendar-month', 'ביקורים 30 יום', s.pageviews_30d, '#fef3c7') +
    card('person-fill', 'ייחודיים 24ש\'', s.unique_sessions_24h, '#f3e8ff') +
    card('people-fill', 'ייחודיים 7 ימים', s.unique_sessions_7d, '#fce7f3');
  // Timeline SVG
  var tl = s.timeline_14d || [];
  var max = Math.max.apply(null, tl.map(function(d) { return d.count; })) || 1;
  var w = 300, h = 130, bw = tl.length ? (w - 20) / tl.length : 0;
  var svg = '<svg width="100%" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid meet">';
  tl.forEach(function(d, i) {
    var bh = (d.count / max) * (h - 30);
    var x = 10 + i * bw, y = h - 20 - bh;
    svg += '<rect x="' + x + '" y="' + y + '" width="' + (bw - 2) + '" height="' + bh + '" fill="var(--primary)" opacity="0.85"><title>' + d.day + ': ' + d.count + '</title></rect>';
    if (i % 3 === 0) svg += '<text x="' + (x + bw / 2) + '" y="' + (h - 6) + '" font-size="8" fill="#6c757d" text-anchor="middle">' + d.day.slice(5) + '</text>';
  });
  svg += '</svg>';
  var tlEl = document.getElementById(ids.timeline); if (tlEl) tlEl.innerHTML = svg;
  // Hourly SVG
  var hrs = s.hourly_distribution || [];
  var maxH = Math.max.apply(null, hrs) || 1;
  var svgH = '<svg width="100%" viewBox="0 0 300 130" preserveAspectRatio="xMidYMid meet">';
  hrs.forEach(function(c, i) {
    var bh = (c / maxH) * 90;
    var x = 10 + i * ((300 - 20) / 24), y = 110 - bh;
    svgH += '<rect x="' + x + '" y="' + y + '" width="' + ((300 - 20) / 24 - 1) + '" height="' + bh + '" fill="var(--accent)" opacity="0.85"><title>שעה ' + i + ': ' + c + '</title></rect>';
    if (i % 3 === 0) svgH += '<text x="' + (x + ((300 - 20) / 24) / 2) + '" y="125" font-size="8" fill="#6c757d" text-anchor="middle">' + i + '</text>';
  });
  svgH += '</svg>';
  var hEl = document.getElementById(ids.hour); if (hEl) hEl.innerHTML = svgH;
  var secEl = document.getElementById(ids.sections);
  if (secEl) secEl.innerHTML = (s.top_sections || []).map(function(x) {
    var mx = s.top_sections[0].count || 1;
    return '<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:0.85rem"><span>' + x.section + '</span><span style="font-weight:700">' + x.count + '</span></div><div style="background:#e5e7eb;height:6px;border-radius:3px;overflow:hidden"><div style="background:var(--primary);height:100%;width:' + (x.count / mx * 100) + '%"></div></div></div>';
  }).join('') || '<div style="color:var(--text-light)">אין נתונים עדיין</div>';
  var evEl = document.getElementById(ids.events);
  if (evEl) evEl.innerHTML = Object.keys(s.event_types || {}).map(function(k) {
    return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e5e7eb"><span><i class="bi bi-arrow-right-short"></i> ' + escapeHtml(k) + '</span><span style="font-weight:700">' + s.event_types[k] + '</span></div>';
  }).join('') || '<div style="color:var(--text-light)">אין נתונים עדיין</div>';
  var recEl = document.getElementById(ids.recent);
  if (recEl) recEl.innerHTML = (s.recent || []).map(function(r) {
    var t = new Date(r.ts).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', month: '2-digit', day: '2-digit' });
    return '<div style="padding:6px;border-bottom:1px solid #e5e7eb;display:grid;grid-template-columns:100px 90px 1fr 60px;gap:8px;align-items:center"><span style="color:var(--text-light);font-size:0.75rem">' + t + '</span><span style="font-weight:600;color:var(--primary-dark)">' + escapeHtml(r.event) + '</span><span style="color:#374151">' + escapeHtml(r.section || r.path || '') + '</span><span style="color:var(--text-light);font-size:0.7rem;font-family:monospace">' + escapeHtml((r.sid || '').slice(0, 8)) + '</span></div>';
  }).join('') || '<div style="color:var(--text-light);padding:20px;text-align:center">אין אירועים עדיין. גלול באתר כדי לייצר נתונים.</div>';
}
function _loadUsersInto(prefix) {
  var listId = prefix === 'portal' ? 'portalUsersList' : 'usersList';
  var el = document.getElementById(listId);
  if (el) el.innerHTML = '<i class="bi bi-hourglass-split"></i> טוען...';
  var body = new URLSearchParams();
  body.set('action', 'maale_user_list');
  body.set('token', BACKEND_ADMIN_TOKEN);
  fetch(getBackendUrl(), { method: 'POST', body: body })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res && res.ok) _renderUsersInto(prefix, res.users || []);
      else if (el) el.innerHTML = '<div style="padding:20px;background:#fee;border:1px solid #fcc;border-radius:8px;color:#c00">השרת לא זמין כעת — נסה שוב</div>';
    })
    .catch(function(e) { if (el) el.innerHTML = '<div style="color:#c00">שגיאה: ' + escapeHtml(String(e)) + '</div>'; });
}
function _renderUsersInto(prefix, users) {
  var listId = prefix === 'portal' ? 'portalUsersList' : 'usersList';
  var el = document.getElementById(listId);
  if (!el) return;
  var editFn = prefix === 'portal' ? 'portalEditUser' : 'editUser';
  var delFn = prefix === 'portal' ? 'portalDeleteUser' : 'deleteUser';
  if (!users.length) { el.innerHTML = '<div style="color:var(--text-light);text-align:center;padding:20px">אין משתמשים עדיין.</div>'; return; }
  el.innerHTML = '<table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f3f4f6"><th style="text-align:right;padding:8px">שם</th><th style="text-align:right;padding:8px">אימייל</th><th style="text-align:right;padding:8px">תפקיד</th><th style="text-align:right;padding:8px">סטטוס</th><th style="text-align:right;padding:8px">כניסה אחרונה</th><th style="text-align:right;padding:8px">פעולות</th></tr></thead><tbody>' +
    users.map(function(u) {
      var last = u.last_login ? new Date(u.last_login).toLocaleDateString('he-IL') : '—';
      var safeName = escapeHtml(u.name || '');
      var safeEmail = escapeHtml(u.email || '');
      var safeId = escapeHtml(u.id || '');
      var safeRole = escapeHtml(u.role || '');
      var roleBadgeColor = u.role === 'admin' ? '#fee2e2' : u.role === 'editor' ? '#fef3c7' : '#dbeafe';
      var roleTextColor = u.role === 'admin' ? '#991b1b' : u.role === 'editor' ? '#b45309' : '#1e40af';
      return '<tr style="border-bottom:1px solid #e5e7eb"><td style="padding:8px">' + safeName + '</td><td style="padding:8px;font-family:monospace;font-size:0.8rem">' + safeEmail + '</td><td style="padding:8px"><span style="background:' + roleBadgeColor + ';color:' + roleTextColor + ';padding:2px 8px;border-radius:10px;font-size:0.75rem">' + safeRole + '</span></td><td style="padding:8px">' + escapeHtml(u.status || 'active') + '</td><td style="padding:8px;font-size:0.8rem">' + last + '</td><td style="padding:8px"><button class="btn-admin btn-admin-sm" style="background:#0891b2;color:#fff" onclick="' + editFn + '(\'' + safeId + '\',\'' + safeName.replace(/\'/g, '') + '\',\'' + safeRole + '\')"><i class="bi bi-pencil"></i></button> <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="' + delFn + '(\'' + safeId + '\')"><i class="bi bi-trash"></i></button></td></tr>';
    }).join('') +
    '</tbody></table>';
}
function _loadAuditInto(prefix) {
  var listId = prefix === 'portal' ? 'portalAuditList' : 'auditList';
  var el = document.getElementById(listId);
  if (el) el.innerHTML = '<i class="bi bi-hourglass-split"></i> טוען...';
  var body = new URLSearchParams();
  body.set('action', 'maale_audit_list');
  body.set('token', BACKEND_ADMIN_TOKEN);
  body.set('limit', '200');
  fetch(getBackendUrl(), { method: 'POST', body: body })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res && res.ok) _renderAuditInto(prefix, res.entries || []);
      else if (el) el.innerHTML = '<div style="padding:20px;background:#fee;border:1px solid #fcc;border-radius:8px;color:#c00">השרת לא זמין — נסה שוב</div>';
    })
    .catch(function(e) { if (el) el.innerHTML = '<div style="color:#c00">שגיאה: ' + escapeHtml(String(e)) + '</div>'; });
}
function _renderAuditInto(prefix, entries) {
  var listId = prefix === 'portal' ? 'portalAuditList' : 'auditList';
  var el = document.getElementById(listId);
  if (!el) return;
  if (!entries.length) { el.innerHTML = '<div style="color:var(--text-light);text-align:center;padding:20px">היומן ריק</div>'; return; }
  el.innerHTML = '<table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f3f4f6"><th style="text-align:right;padding:8px">מתי</th><th style="text-align:right;padding:8px">פעולה</th><th style="text-align:right;padding:8px">אימייל</th><th style="text-align:right;padding:8px">פרטים</th></tr></thead><tbody>' +
    entries.map(function(e) {
      var t = new Date(e.ts).toLocaleString('he-IL');
      var badge = String(e.action || '').indexOf('fail') >= 0 ? 'background:#fee2e2;color:#991b1b' :
                  String(e.action || '').indexOf('login') >= 0 ? 'background:#dcfce7;color:#166534' : 'background:#dbeafe;color:#1e40af';
      return '<tr style="border-bottom:1px solid #e5e7eb"><td style="padding:6px;font-size:0.8rem">' + t + '</td><td style="padding:6px"><span style="padding:2px 8px;border-radius:10px;font-size:0.75rem;' + badge + '">' + escapeHtml(e.action || '') + '</span></td><td style="padding:6px;font-family:monospace;font-size:0.75rem">' + escapeHtml(e.email || '') + '</td><td style="padding:6px;font-size:0.8rem;color:#6b7280">' + escapeHtml(e.meta || '') + '</td></tr>';
    }).join('') + '</tbody></table>';
}
// v3.1: XSS-safe HTML escape for all user-controlled strings rendered above
function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"'`]/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c];
  });
}

function loadAnalytics() {
  var srcEl = document.getElementById('analyticsSource');
  srcEl.innerHTML = '<i class="bi bi-hourglass-split"></i> טוען...';
  var body = new URLSearchParams();
  body.set('action', 'maale_analytics_summary');
  body.set('token', BACKEND_ADMIN_TOKEN);
  fetch(getBackendUrl(), { method: 'POST', body: body })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res && res.ok) {
        renderAnalytics(res.summary, 'שרת (Google Sheets)');
      } else {
        renderAnalytics(maLocalSummary(), 'מקומי בדפדפן (השרת עוד לא פרוס — יוסף צריך למחוק גרסאות ישנות ב-Apps Script editor)');
      }
    })
    .catch(function() { renderAnalytics(maLocalSummary(), 'מקומי בדפדפן (השרת לא זמין)'); });
}
function renderAnalytics(s, srcNote) {
  document.getElementById('analyticsSource').innerHTML = '<i class="bi bi-database"></i> מקור: ' + srcNote + ' &nbsp;·&nbsp; סה"כ אירועים: ' + s.total_events;
  var card = function(icon, label, num, color) {
    return '<div style="background:linear-gradient(135deg,' + color + ',#fff);border-radius:10px;padding:14px;border:1px solid rgba(0,0,0,.05);box-shadow:0 2px 6px rgba(0,0,0,.04)"><div style="color:var(--text-light);font-size:0.75rem"><i class="bi bi-' + icon + '"></i> ' + label + '</div><div style="font-weight:800;font-size:1.6rem;color:var(--primary-dark)">' + num + '</div></div>';
  };
  document.getElementById('analyticsCards').innerHTML =
    card('eye-fill', 'ביקורים ב-24ש\'', s.pageviews_24h, '#e8f5e9') +
    card('calendar-week', 'ביקורים 7 ימים', s.pageviews_7d, '#e0f2fe') +
    card('calendar-month', 'ביקורים 30 יום', s.pageviews_30d, '#fef3c7') +
    card('person-fill', 'משתמשים ייחודיים 24ש\'', s.unique_sessions_24h, '#f3e8ff') +
    card('people-fill', 'משתמשים ייחודיים 7 ימים', s.unique_sessions_7d, '#fce7f3');
  // Timeline (mini sparkline via SVG — no Chart.js dep needed)
  var tl = s.timeline_14d || [];
  var max = Math.max.apply(null, tl.map(function(d) { return d.count; })) || 1;
  var w = 300, h = 130, bw = tl.length ? (w - 20) / tl.length : 0;
  var svg = '<svg width="100%" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid meet" style="display:block">';
  tl.forEach(function(d, i) {
    var bh = (d.count / max) * (h - 30);
    var x = 10 + i * bw, y = h - 20 - bh;
    svg += '<rect x="' + x + '" y="' + y + '" width="' + (bw - 2) + '" height="' + bh + '" fill="var(--primary)" opacity="0.85"><title>' + d.day + ': ' + d.count + '</title></rect>';
    if (i % 3 === 0) svg += '<text x="' + (x + bw / 2) + '" y="' + (h - 6) + '" font-size="8" fill="#6c757d" text-anchor="middle">' + d.day.slice(5) + '</text>';
  });
  svg += '</svg>';
  document.getElementById('analyticsTimelineChart').outerHTML = '<div>' + svg + '</div>';
  // Hourly
  var hrs = s.hourly_distribution || [];
  var maxH = Math.max.apply(null, hrs) || 1;
  var svgH = '<svg width="100%" viewBox="0 0 300 130" preserveAspectRatio="xMidYMid meet" style="display:block">';
  hrs.forEach(function(c, i) {
    var bh = (c / maxH) * 90;
    var x = 10 + i * ((300 - 20) / 24), y = 110 - bh;
    svgH += '<rect x="' + x + '" y="' + y + '" width="' + ((300 - 20) / 24 - 1) + '" height="' + bh + '" fill="var(--accent)" opacity="0.85"><title>שעה ' + i + ': ' + c + '</title></rect>';
    if (i % 3 === 0) svgH += '<text x="' + (x + ((300 - 20) / 24) / 2) + '" y="125" font-size="8" fill="#6c757d" text-anchor="middle">' + i + '</text>';
  });
  svgH += '</svg>';
  document.getElementById('analyticsHourChart').outerHTML = '<div>' + svgH + '</div>';
  // Top sections
  document.getElementById('analyticsSections').innerHTML = (s.top_sections || []).map(function(x) {
    var mx = s.top_sections[0].count || 1;
    return '<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:0.85rem"><span>' + x.section + '</span><span style="font-weight:700">' + x.count + '</span></div><div style="background:#e5e7eb;height:6px;border-radius:3px;overflow:hidden"><div style="background:var(--primary);height:100%;width:' + (x.count / mx * 100) + '%"></div></div></div>';
  }).join('') || '<div style="color:var(--text-light)">אין נתונים עדיין</div>';
  // Event types
  document.getElementById('analyticsEventTypes').innerHTML = Object.keys(s.event_types || {}).map(function(k) {
    var n = s.event_types[k];
    return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e5e7eb"><span><i class="bi bi-arrow-right-short"></i> ' + k + '</span><span style="font-weight:700">' + n + '</span></div>';
  }).join('') || '<div style="color:var(--text-light)">אין נתונים עדיין</div>';
  // Recent events
  document.getElementById('analyticsRecent').innerHTML = (s.recent || []).map(function(r) {
    var t = new Date(r.ts).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', month: '2-digit', day: '2-digit' });
    return '<div style="padding:6px;border-bottom:1px solid #e5e7eb;display:grid;grid-template-columns:100px 90px 1fr 60px;gap:8px;align-items:center"><span style="color:var(--text-light);font-size:0.75rem">' + t + '</span><span style="font-weight:600;color:var(--primary-dark)">' + r.event + '</span><span style="color:#374151">' + (r.section || r.path || '') + '</span><span style="color:var(--text-light);font-size:0.7rem;font-family:monospace">' + (r.sid || '').slice(0, 8) + '</span></div>';
  }).join('') || '<div style="color:var(--text-light);padding:20px;text-align:center">אין אירועים עדיין. גלול באתר או פתח דפים חדשים כדי לייצר נתונים.</div>';
}
function downloadAnalyticsCsv() {
  var arr = [];
  try { arr = JSON.parse(localStorage.getItem(MA_ANALYTICS_KEY) || '[]'); } catch (e) {}
  var rows = [['ts', 'event', 'path', 'section', 'sid', 'uid']];
  arr.forEach(function(r) { rows.push([r.ts, r.event, r.path, r.section, r.sid, r.uid]); });
  var csv = rows.map(function(r) { return r.map(function(v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
  var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'maale-analytics-' + Date.now() + '.csv'; a.click();
}

// ===== v2: user management =====
function loadUsers() {
  var el = document.getElementById('usersList');
  el.innerHTML = '<i class="bi bi-hourglass-split"></i> טוען...';
  var body = new URLSearchParams();
  body.set('action', 'maale_user_list');
  body.set('token', BACKEND_ADMIN_TOKEN);
  fetch(getBackendUrl(), { method: 'POST', body: body })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res && res.ok) renderUsers(res.users || []);
      else el.innerHTML = '<div style="padding:20px;background:#fee;border:1px solid #fcc;border-radius:8px;color:#c00"><b>השרת עוד לא פרוס.</b> יש לפתוח את <a href="https://script.google.com/d/1Dby8H-Jp86gCbZ6-pzSK8s5LSsVOsrkFT5tVOZirNT6gHHvqZ_JJx09P/edit" target="_blank">Apps Script editor</a>, למחוק כמה גרסאות ישנות (File → Manage versions), ואז לרוץ deploy מ־Terminal.</div>';
    })
    .catch(function(e) { el.innerHTML = '<div style="color:#c00">שגיאה: ' + e + '</div>'; });
}
function renderUsers(users) {
  var el = document.getElementById('usersList');
  if (!users.length) { el.innerHTML = '<div style="color:var(--text-light);text-align:center;padding:20px">אין משתמשים עדיין. צור אחד למעלה.</div>'; return; }
  el.innerHTML = '<table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f3f4f6"><th style="text-align:right;padding:8px">שם</th><th style="text-align:right;padding:8px">אימייל</th><th style="text-align:right;padding:8px">תפקיד</th><th style="text-align:right;padding:8px">סטטוס</th><th style="text-align:right;padding:8px">כניסה אחרונה</th><th style="text-align:right;padding:8px">פעולות</th></tr></thead><tbody>' +
    users.map(function(u) {
      var last = u.last_login ? new Date(u.last_login).toLocaleDateString('he-IL') : '—';
      return '<tr style="border-bottom:1px solid #e5e7eb"><td style="padding:8px">' + (u.name || '') + '</td><td style="padding:8px;font-family:monospace;font-size:0.8rem">' + (u.email || '') + '</td><td style="padding:8px"><span style="background:#dbeafe;padding:2px 8px;border-radius:10px;font-size:0.75rem">' + (u.role || '') + '</span></td><td style="padding:8px">' + (u.status || 'active') + '</td><td style="padding:8px;font-size:0.8rem">' + last + '</td><td style="padding:8px"><button class="btn-admin btn-admin-sm" style="background:#0891b2;color:#fff" onclick="editUser(\'' + u.id + '\',\'' + (u.name || '').replace(/\'/g, '') + '\',\'' + (u.role || '') + '\')"><i class="bi bi-pencil"></i></button> <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteUser(\'' + u.id + '\')"><i class="bi bi-trash"></i></button></td></tr>';
    }).join('') +
    '</tbody></table>';
}
function createUser() {
  var name = document.getElementById('uNew_name').value.trim();
  var email = document.getElementById('uNew_email').value.trim().toLowerCase();
  var password = document.getElementById('uNew_password').value;
  var role = document.getElementById('uNew_role').value;
  if (!name || !email || !password) { showToast('שם + אימייל + סיסמה חובה'); return; }
  if (password.length < 6) { showToast('סיסמה חייבת להיות 6 תווים לפחות'); return; }
  var body = new URLSearchParams();
  body.set('action', 'maale_user_create');
  body.set('token', BACKEND_ADMIN_TOKEN);
  body.set('name', name); body.set('email', email); body.set('password', password); body.set('role', role);
  fetch(getBackendUrl(), { method: 'POST', body: body })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res && res.ok) {
        showToast('✅ משתמש נוסף');
        document.getElementById('uNew_name').value = '';
        document.getElementById('uNew_email').value = '';
        document.getElementById('uNew_password').value = '';
        loadUsers();
      } else { showToast('שגיאה: ' + (res && res.error || 'לא ידוע')); }
    });
}
function editUser(id, curName, curRole) {
  var name = prompt('שם חדש:', curName);
  if (name === null) return;
  var role = prompt('תפקיד (admin/editor/resident):', curRole);
  if (role === null) return;
  var body = new URLSearchParams();
  body.set('action', 'maale_user_update');
  body.set('token', BACKEND_ADMIN_TOKEN);
  body.set('id', id); body.set('name', name); body.set('role', role);
  fetch(getBackendUrl(), { method: 'POST', body: body })
    .then(function(r) { return r.json(); })
    .then(function(res) { showToast(res && res.ok ? '✅ עודכן' : 'שגיאה'); loadUsers(); });
}
function deleteUser(id) {
  if (!confirm('למחוק את המשתמש?')) return;
  var body = new URLSearchParams();
  body.set('action', 'maale_user_delete');
  body.set('token', BACKEND_ADMIN_TOKEN);
  body.set('id', id);
  fetch(getBackendUrl(), { method: 'POST', body: body })
    .then(function(r) { return r.json(); })
    .then(function(res) { showToast(res && res.ok ? '✅ נמחק' : 'שגיאה'); loadUsers(); });
}

// ===== v2: audit log =====
function loadAudit() {
  var el = document.getElementById('auditList');
  el.innerHTML = '<i class="bi bi-hourglass-split"></i> טוען...';
  var body = new URLSearchParams();
  body.set('action', 'maale_audit_list');
  body.set('token', BACKEND_ADMIN_TOKEN);
  body.set('limit', '200');
  fetch(getBackendUrl(), { method: 'POST', body: body })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res && res.ok) renderAudit(res.entries || []);
      else el.innerHTML = '<div style="padding:20px;background:#fee;border:1px solid #fcc;border-radius:8px;color:#c00">השרת עוד לא פרוס. יש לפתוח את <a href="https://script.google.com/d/1Dby8H-Jp86gCbZ6-pzSK8s5LSsVOsrkFT5tVOZirNT6gHHvqZ_JJx09P/edit" target="_blank">Apps Script editor</a> ולמחוק כמה גרסאות ישנות.</div>';
    })
    .catch(function(e) { el.innerHTML = '<div style="color:#c00">שגיאה: ' + e + '</div>'; });
}
function renderAudit(entries) {
  var el = document.getElementById('auditList');
  if (!entries.length) { el.innerHTML = '<div style="color:var(--text-light);text-align:center;padding:20px">היומן ריק</div>'; return; }
  el.innerHTML = '<table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f3f4f6"><th style="text-align:right;padding:8px">מתי</th><th style="text-align:right;padding:8px">פעולה</th><th style="text-align:right;padding:8px">אימייל</th><th style="text-align:right;padding:8px">פרטים</th></tr></thead><tbody>' +
    entries.map(function(e) {
      var t = new Date(e.ts).toLocaleString('he-IL');
      var badge = e.action.indexOf('fail') >= 0 ? 'background:#fee2e2;color:#991b1b' : e.action.indexOf('login') >= 0 ? 'background:#dcfce7;color:#166534' : 'background:#dbeafe;color:#1e40af';
      return '<tr style="border-bottom:1px solid #e5e7eb"><td style="padding:6px;font-size:0.8rem">' + t + '</td><td style="padding:6px"><span style="padding:2px 8px;border-radius:10px;font-size:0.75rem;' + badge + '">' + e.action + '</span></td><td style="padding:6px;font-family:monospace;font-size:0.75rem">' + (e.email || '') + '</td><td style="padding:6px;font-size:0.8rem;color:#6b7280">' + (e.meta || '') + '</td></tr>';
    }).join('') + '</tbody></table>';
}

function refreshAdminLists() {
  // Families
  if (allFamilies.length === 0) loadPhoneDir();
  renderAdminFamilies('');
  // News
  document.getElementById('adminNewsList').innerHTML = newsData.map(function(n, i) {
    return '<li><div class="item-text"><div class="item-title">' + n.title + '</div><div class="item-sub">' + n.date + ' | ' + n.cat + '</div></div><button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteItem(\'news\',' + i + ')"><i class="bi bi-trash"></i></button></li>';
  }).join('');
  // Events
  document.getElementById('adminEventsList').innerHTML = eventsData.map(function(e, i) {
    return '<li><div class="item-text"><div class="item-title">' + e.title + '</div><div class="item-sub">' + e.day + ' ' + e.month + ' | ' + e.time + '</div></div><button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteItem(\'events\',' + i + ')"><i class="bi bi-trash"></i></button></li>';
  }).join('');
  // Simchot
  document.getElementById('adminSimchotList').innerHTML = simchotData.map(function(s, i) {
    return '<li><div class="item-text"><div class="item-title">' + s.family + '</div><div class="item-sub">' + s.details + '</div></div><button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteItem(\'simchot\',' + i + ')"><i class="bi bi-trash"></i></button></li>';
  }).join('');
  // Market
  document.getElementById('adminMarketList').innerHTML = marketData.map(function(m, i) {
    return '<li><div class="item-text"><div class="item-title">' + m.title + '</div><div class="item-sub">' + m.price + ' | ' + m.seller + '</div></div><button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteItem(\'market\',' + i + ')"><i class="bi bi-trash"></i></button></li>';
  }).join('');
  // Gemachim
  document.getElementById('adminGemachList').innerHTML = gemachimData.map(function(g, i) {
    return '<li><div class="item-text"><div class="item-title">' + g.name + '</div><div class="item-sub">' + g.phone + '</div></div><button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteItem(\'gemachim\',' + i + ')"><i class="bi bi-trash"></i></button></li>';
  }).join('');
  // Ticker — handle both string and {id,msg} shapes
  document.getElementById('adminTickerList').innerHTML = tickerData.map(function(t, i) {
    var text = (typeof t === 'string') ? t : (t && t.msg) ? t.msg : '';
    return '<li><div class="item-text"><div class="item-title">' + text + '</div></div><button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteItem(\'ticker\',' + i + ')"><i class="bi bi-trash"></i></button></li>';
  }).join('');
  // Residents
  renderAdminResidents('');
}

function renderAdminResidents(filter) {
  filter = (filter || '').trim();
  var listEl = document.getElementById('adminResidentsList');
  if (!listEl) return;
  var arr = residentsData || [];
  var filtered = !filter ? arr : arr.filter(function(r) {
    return (r.name || '').indexOf(filter) !== -1 || String(r.code || '').indexOf(filter) !== -1;
  });
  document.getElementById('residentsCount').textContent = arr.length;
  if (filtered.length === 0) {
    listEl.innerHTML = '<li style="text-align:center;color:var(--text-light);padding:20px">לא נמצאו תושבים</li>';
    return;
  }
  listEl.innerHTML = filtered.map(function(r) {
    var i = arr.indexOf(r);
    var safeName = (r.name||'').replace(/'/g,'&#39;');
    return '<li>' +
      '<div class="item-text">' +
        '<div class="item-title">' + escHtml(r.name) + '</div>' +
        '<div class="item-sub"><i class="bi bi-key" aria-hidden="true"></i> קוד: <strong style="font-family:monospace;color:var(--primary)">' + escHtml(r.code) + '</strong> — ' + escHtml(r.role || 'תושב') + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px">' +
        '<button class="btn-admin btn-admin-sm" onclick="editResident(' + i + ')" title="ערוך"><i class="bi bi-pencil"></i></button>' +
        '<button class="btn-admin btn-admin-sm" onclick="copyResidentCode(\'' + safeName + '\',\'' + r.code + '\')" title="העתק"><i class="bi bi-clipboard"></i></button>' +
        '<button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteResident(' + i + ')" title="מחק"><i class="bi bi-trash"></i></button>' +
      '</div>' +
    '</li>';
  }).join('');
}

function addResident() {
  var name = (document.getElementById('resName').value || '').trim();
  var code = (document.getElementById('resCode').value || '').trim();
  var role = (document.getElementById('resRole').value || 'תושב').trim();
  if (!name || !code) { showToast('הזינו שם וקוד'); return; }
  if (!/^\d{4,6}$/.test(code)) { showToast('הקוד חייב להיות 4-6 ספרות'); return; }
  // Check for duplicate
  if (residentsData.some(function(r) { return r.code === code; })) {
    showToast('הקוד הזה כבר בשימוש. בחרו אחר.');
    return;
  }
  var item = { id: _newItemId(), name: name, code: code, role: role, status: 'אושר' };
  residentsData.push(item);
  setData('residents', residentsData);
  document.getElementById('resName').value = '';
  document.getElementById('resCode').value = '';
  document.getElementById('resRole').value = 'תושב';
  renderAdminResidents('');
  refreshAdminDashboard();
  showToast('תושב נוסף!');
  backendWrite('residents', 'add', item).then(_backendSyncToast);
}

function deleteResident(i) {
  var resident = residentsData[i];
  if (!resident) return;
  if (!confirm('למחוק את ' + resident.name + '?')) return;
  residentsData.splice(i, 1);
  setData('residents', residentsData);
  renderAdminResidents('');
  showToast('נמחק');
  // Sync to Sheets if backend configured
  if (resident.id) {
    backendWrite('residents', 'delete', { id: resident.id }).then(_backendSyncToast);
  }
}

function editResident(i) {
  var r = residentsData[i];
  if (!r) return;
  var newName = prompt('שם:', r.name);
  if (newName === null) return;
  var newCode = prompt('קוד:', r.code);
  if (newCode === null) return;
  var newRole = prompt('תפקיד:', r.role || 'תושב');
  if (newRole === null) newRole = r.role || 'תושב';
  if (!newName.trim() || !newCode.trim()) { showToast('שם וקוד הם חובה'); return; }
  // Preserve id + status + other fields; only update name/code/role
  residentsData[i] = Object.assign({}, r, { name: newName.trim(), code: newCode.trim(), role: newRole.trim() });
  setData('residents', residentsData);
  renderAdminResidents('');
  showToast('עודכן!');
  if (residentsData[i].id) {
    backendWrite('residents', 'update', residentsData[i]).then(_backendSyncToast);
  }
}

function copyResidentCode(name, code) {
  var txt = 'שלום ' + name + ', הקוד האישי שלכם לאזור התושבים באתר מעלה עמוס: ' + code;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(
      function() { showToast('הועתק! הדבק והעבר לתושב.'); },
      function() { _fallbackCopy(txt, code); }
    );
  } else {
    _fallbackCopy(txt, code);
  }
}
function _fallbackCopy(txt, code) {
  // textarea trick for old/insecure contexts
  try {
    var ta = document.createElement('textarea');
    ta.value = txt;
    ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('הועתק!');
  } catch (e) {
    showToast('קוד: ' + code);
  }
}

function generateRandomCode() {
  var c;
  do { c = String(Math.floor(1000 + Math.random() * 9000)); }
  while (residentsData.some(function(r) { return r.code === c; }));
  document.getElementById('resCode').value = c;
}

function exportResidents() {
  var lines = residentsData.map(function(r) { return r.name + '\t' + r.code + '\t' + (r.role||'תושב'); });
  var content = 'שם\tקוד\tתפקיד\n' + lines.join('\n');
  var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'residents-codes.txt';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('יוצא בהצלחה');
}

function deleteItem(type, idx) {
  var map = { news: newsData, events: eventsData, simchot: simchotData, market: marketData, gemachim: gemachimData, ticker: tickerData };
  var removed = map[type][idx];
  map[type].splice(idx, 1);
  setData(type, map[type]);
  refreshAdminLists(); renderAll();
  showToast('נמחק!');
  // If backend is configured AND the row has an id, also delete it from Sheets.
  // Items added before backend was wired (or before this code) won't have id —
  // for those the user must clean up the Sheet manually OR run a future
  // "republish all to Sheets" tool.
  if (removed && removed.id) {
    backendWrite(type, 'delete', { id: removed.id }).then(_backendSyncToast);
  }
}

function addNews() {
  var t = document.getElementById('newsTitle').value, d = document.getElementById('newsDesc').value;
  if (!t) { showToast('הזינו כותרת'); return; }
  var now = new Date();
  var imgUrl = document.getElementById('newsImg').value;
  var fileInput = document.getElementById('newsFileInput');
  if (imgUrl === 'uploaded' && fileInput.dataset.dataUrl) imgUrl = fileInput.dataset.dataUrl;
  if (!imgUrl) imgUrl = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80';
  var item = { id: _newItemId(), title: t, desc: d, date: now.getDate() + '/' + (now.getMonth()+1) + '/' + now.getFullYear(), cat: document.getElementById('newsCat').value || 'עדכונים', img: imgUrl, created_at: now.toISOString() };
  newsData.unshift(item);
  setData('news', newsData); refreshAdminLists(); renderAll();
  document.getElementById('newsTitle').value = ''; document.getElementById('newsDesc').value = '';
  showToast('חדשה נוספה!');
  // Dual-write to Sheets backend if configured (non-blocking)
  backendWrite('news', 'add', item).then(_backendSyncToast);
}

function addEvent() {
  var t = document.getElementById('eventTitle').value;
  if (!t) { showToast('הזינו כותרת'); return; }
  var item = { id: _newItemId(), day: document.getElementById('eventDay').value, month: document.getElementById('eventMonth').value, title: t, desc: document.getElementById('eventDesc').value, time: document.getElementById('eventTime').value, location: document.getElementById('eventLoc').value };
  eventsData.push(item);
  setData('events', eventsData); refreshAdminLists(); renderAll();
  showToast('אירוע נוסף!');
  backendWrite('events', 'add', item).then(_backendSyncToast);
}

function _backendSyncToast(r) {
  if (r && r.ok) showToast('✓ סונכרן לשייטס');
  else if (r && r.error && r.error !== 'no_backend') showToast('שגיאת סנכרון: ' + r.error);
}

// Generate a short unique id for new items (used by both local state and backend).
function _newItemId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}

function addSimcha() {
  var f = document.getElementById('simchaFamily').value;
  if (!f) { showToast('הזינו שם משפחה'); return; }
  var now = new Date();
  var item = { id: _newItemId(), type: document.getElementById('simchaType').value, family: f, details: document.getElementById('simchaDetails').value, date: now.getDate() + '/' + (now.getMonth()+1) };
  simchotData.unshift(item);
  setData('simchot', simchotData); refreshAdminLists(); renderAll();
  showToast('שמחה נוספה!');
  backendWrite('simchot', 'add', item).then(_backendSyncToast);
}

function addMarketItem() {
  var t = document.getElementById('marketTitle').value;
  if (!t) { showToast('הזינו כותרת'); return; }
  var item = { id: _newItemId(), title: t, desc: document.getElementById('marketDesc').value, price: document.getElementById('marketPrice').value, cat: document.getElementById('marketCat').value, seller: document.getElementById('marketSeller').value };
  marketData.unshift(item);
  setData('market', marketData); refreshAdminLists(); renderAll();
  showToast('מודעה נוספה!');
  backendWrite('market', 'add', item).then(_backendSyncToast);
}

function addGemach() {
  var n = document.getElementById('gemachName').value;
  if (!n) { showToast('הזינו שם'); return; }
  var item = { id: _newItemId(), name: n, desc: document.getElementById('gemachDesc').value, phone: document.getElementById('gemachPhone').value, icon: document.getElementById('gemachIcon').value || 'bi-heart' };
  gemachimData.push(item);
  setData('gemachim', gemachimData); refreshAdminLists(); renderAll();
  showToast('גמ"ח נוסף!');
  backendWrite('gemachim', 'add', item).then(_backendSyncToast);
}

function addTicker() {
  var m = document.getElementById('tickerMsg').value;
  if (!m) return;
  // Store as object so delete-from-Sheets works (was plain string — couldn't be matched by id)
  var item = { id: _newItemId(), msg: m };
  tickerData.push(item);
  setData('ticker', tickerData); refreshAdminLists(); renderTicker();
  document.getElementById('tickerMsg').value = '';
  showToast('הודעה נוספה!');
  backendWrite('ticker', 'add', item).then(_backendSyncToast);
}

function saveSettings() {
  var newCode = document.getElementById('settingNewCode').value;
  if (newCode && newCode.length >= 4) {
    localStorage.setItem(ADMIN_CODE_KEY, newCode);
  }
  var resCode = document.getElementById('settingResCode').value;
  if (resCode && resCode.length >= 4) {
    setData('resident_code', resCode);
    RESIDENT_CODE = resCode;
  }
  var ghToken = document.getElementById('settingGhToken').value;
  if (ghToken) {
    localStorage.setItem(GH_TOKEN_KEY, ghToken);
  }
  var backendField = document.getElementById('settingBackendUrl');
  if (backendField) {
    var backendUrl = backendField.value.trim();
    if (backendUrl) localStorage.setItem(BACKEND_URL_KEY, backendUrl);
    else localStorage.removeItem(BACKEND_URL_KEY);
  }
  var el = document.getElementById('currentResCode');
  if (el) el.textContent = RESIDENT_CODE;
  showToast('הגדרות נשמרו!');
}

async function importAllToSheets() {
  if (!getBackendUrl()) { showToast('צריך URL של שרת תחילה'); return; }
  if (!confirm('יועלו ' + (newsData.length+eventsData.length+marketData.length+simchotData.length+gemachimData.length+announcementsData.length+tickerData.length) + ' פריטים לשיטס. להמשיך?')) return;
  showToast('מייבא...');
  var datasets = [
    { tab: 'news', items: newsData },
    { tab: 'events', items: eventsData },
    { tab: 'simchot', items: simchotData },
    { tab: 'market', items: marketData },
    { tab: 'gemachim', items: gemachimData },
    { tab: 'announcements', items: announcementsData },
  ];
  var total = 0, failed = 0;
  for (var i = 0; i < datasets.length; i++) {
    var ds = datasets[i];
    for (var j = 0; j < ds.items.length; j++) {
      var it = ds.items[j];
      if (!it.id) it.id = _newItemId();
      try {
        var r = await backendWrite(ds.tab, 'add', it);
        if (r && r.ok) total++;
        else failed++;
      } catch (e) { failed++; }
    }
  }
  // Tickers as plain strings
  for (var k = 0; k < tickerData.length; k++) {
    var msg = tickerData[k];
    try {
      var r = await backendWrite('ticker', 'add', { id: _newItemId(), msg: msg });
      if (r && r.ok) total++;
      else failed++;
    } catch (e) { failed++; }
  }
  showToast('הועלה: ' + total + (failed ? ' (נכשלו: ' + failed + ')' : ''));
}

function testBackendConnection() {
  var url = (document.getElementById('settingBackendUrl').value || '').trim();
  if (!url) { showToast('הזן URL'); return; }
  if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(url)) {
    showToast('הכתובת לא תקינה');
    return;
  }
  showToast('בודק חיבור...');
  fetch(url + '?action=maale_health&t=' + Date.now())
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data && data.ok && data.service === 'maale-amos-backend') {
        showToast('✓ חיבור תקין לשיטס!');
      } else {
        showToast('תגובה לא צפויה מהשרת');
      }
    })
    .catch(function(e) {
      showToast('שגיאת חיבור — בדוק חיבור אינטרנט');
    });
}

// Load saved token + backend URL into fields on admin open
var origOpenAdmin = openAdmin;
openAdmin = function() {
  origOpenAdmin();
  var tokenField = document.getElementById('settingGhToken');
  if (tokenField && getGhToken()) tokenField.value = getGhToken();
  var backendField = document.getElementById('settingBackendUrl');
  if (backendField) backendField.value = getBackendUrl();  // pre-fill even default
  // Ping backend in background to surface a status
  if (getBackendUrl()) {
    fetch(getBackendUrl() + '?action=maale_health&t=' + Date.now())
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d && d.ok) showToast('✓ סנכרון לשייטס פעיל');
      })
      .catch(function() { /* silent */ });
  }
};

function renderAll() {
  renderNews(); renderEvents(); renderMarket(); renderSimchot(); renderGemachim(); renderTicker(); renderAnnouncements();
  renderHotBulletins(); renderFeatured();
  hideEmptyBanners();
  if (typeof observeFadeUp === 'function') setTimeout(observeFadeUp, 100);
  setTimeout(buildSearchIndex, 200);
}

// v3.2: Hot bulletins renderer — professional card grid, NOT a scroll ticker
function renderHotBulletins() {
  var grid = document.getElementById('hotBulletinsGrid');
  var empty = document.getElementById('hotBulletinsEmpty');
  var section = document.getElementById('hot-bulletins');
  if (!grid) return;
  var items = (bulletinsData || []).filter(function(b) {
    if (!b.expires) return true;
    return new Date(b.expires).getTime() > Date.now();
  }).sort(function(a, b) { return (b.priority || 0) - (a.priority || 0); });
  if (items.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    if (section && !hasRole('admin') && !hasRole('editor')) section.style.display = 'none';
    return;
  }
  if (section) section.style.display = '';
  if (empty) empty.style.display = 'none';
  grid.innerHTML = items.map(function(b) {
    var type = b.type || 'info';
    var typeLabel = type === 'urgent' ? '🔴 דחוף' : type === 'event' ? '📅 אירוע' : type === 'info' ? 'ℹ️ מידע' : type;
    var ts = b.created_at ? _relativeTime(b.created_at) : '';
    return '<div class="hot-bulletin-card ' + escapeHtml(type) + '" onclick="openBulletin(\'' + escapeHtml(b.id) + '\')">' +
      '<span class="badge ' + escapeHtml(type) + '">' + typeLabel + '</span>' +
      '<h4>' + escapeHtml(b.title || '') + '</h4>' +
      '<p>' + escapeHtml(b.body || '') + '</p>' +
      (ts ? '<div class="ts"><i class="bi bi-clock"></i> ' + ts + '</div>' : '') +
      '</div>';
  }).join('');
}
function _relativeTime(iso) {
  var d = new Date(iso).getTime(); if (isNaN(d)) return '';
  var diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return 'לפני רגע';
  if (diff < 3600) return 'לפני ' + Math.floor(diff / 60) + ' דק\'';
  if (diff < 86400) return 'לפני ' + Math.floor(diff / 3600) + ' שעות';
  if (diff < 604800) return 'לפני ' + Math.floor(diff / 86400) + ' ימים';
  return new Date(iso).toLocaleDateString('he-IL');
}
function openBulletin(id) {
  var b = (bulletinsData || []).find(function(x) { return x.id === id; });
  if (!b) return;
  var modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
  modal.innerHTML = '<div style="background:#fff;border-radius:16px;max-width:600px;width:100%;max-height:90vh;overflow:auto;padding:32px;position:relative">' +
    '<button style="position:absolute;top:12px;left:12px;background:none;border:none;font-size:2rem;cursor:pointer;color:var(--text-light)" onclick="this.closest(\'div[style*=fixed]\').remove()">×</button>' +
    '<span class="badge ' + escapeHtml(b.type || 'info') + '" style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;color:#fff;background:' + (b.type === 'urgent' ? '#dc2626' : b.type === 'event' ? '#16a34a' : '#0891b2') + ';margin-bottom:12px">' + (b.type === 'urgent' ? '🔴 דחוף' : b.type === 'event' ? '📅 אירוע' : 'ℹ️ מידע') + '</span>' +
    '<h3 style="font-weight:800;margin-bottom:12px;color:var(--primary-dark)">' + escapeHtml(b.title || '') + '</h3>' +
    '<div style="line-height:1.7;color:var(--text)">' + (b.body_html || escapeHtml(b.body || '').replace(/\n/g, '<br>')) + '</div>' +
    (b.link ? '<a href="' + escapeHtml(b.link) + '" target="_blank" rel="noopener" style="display:inline-block;margin-top:16px;background:var(--primary);color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none"><i class="bi bi-box-arrow-up-right"></i> קישור נוסף</a>' : '') +
    '</div>';
  document.body.appendChild(modal);
  maTrack('bulletin_open', { section: id });
}

// v3.2: Featured items renderer (posters, hero images)
function renderFeatured() {
  var el = document.getElementById('featuredItems');
  var section = document.getElementById('featured');
  if (!el) return;
  var items = (featuredData || []).sort(function(a, b) { return (b.priority || 0) - (a.priority || 0); });
  if (items.length === 0) {
    el.innerHTML = '';
    if (section && !hasRole('admin') && !hasRole('editor')) section.style.display = 'none';
    return;
  }
  if (section) section.style.display = '';
  el.innerHTML = items.map(function(f) {
    var title = f.title ? '<div class="featured-body"><div class="featured-title">' + escapeHtml(f.title) + '</div>' + (f.subtitle ? '<div class="featured-subtitle">' + escapeHtml(f.subtitle) + '</div>' : '') + '</div>' : '';
    var img = f.img ? '<a href="' + escapeHtml(f.img) + '" target="_blank" rel="noopener"><img class="featured-hero" src="' + escapeHtml(f.img) + '" alt="' + escapeHtml(f.title || '') + '"></a>' : '';
    return '<div class="featured-item">' + img + title + '</div>';
  }).join('');
}

// Hide sections whose banner grids are empty (no data populated yet)
function hideEmptyBanners() {
  var emptyGrids = ['leadershipGrid', 'newspaperGrid', 'housingGrid', 'tzimerGrid', 'storesGrid'];
  emptyGrids.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    // Empty (no data + no <div> children)
    if (el.children.length === 0 && !el.textContent.trim()) {
      var section = el.closest('section');
      if (section) section.style.display = 'none';
    }
  });
}

// ===== SEARCH =====
var SEARCH_INDEX = [];
var searchDebounceTimer;

function buildSearchIndex() {
  SEARCH_INDEX = [];
  // Index all sections with id and h2 title
  document.querySelectorAll('section[id]').forEach(function(sec) {
    var id = sec.id;
    var titleEl = sec.querySelector('h2, h3');
    var title = titleEl ? titleEl.textContent.trim() : id;
    // Each section indexed
    SEARCH_INDEX.push({
      type: 'section',
      section: title,
      title: title,
      snippet: (sec.querySelector('.section-header p') || {}).textContent || '',
      anchor: '#' + id
    });
    // Index sub-cards (h3, h4 titles) inside this section
    sec.querySelectorAll('h3, h4').forEach(function(h) {
      var t = h.textContent.trim();
      if (!t || t === title) return;
      var p = h.parentElement;
      var snippet = (p.querySelector('p') || {}).textContent || '';
      SEARCH_INDEX.push({
        type: 'item',
        section: title,
        title: t,
        snippet: snippet.substring(0, 100),
        anchor: '#' + id
      });
    });
  });
  // Index dynamic data
  newsData.forEach(function(n) {
    SEARCH_INDEX.push({type:'news', section:'חדשות', title:n.title, snippet:n.desc||'', anchor:'#news'});
  });
  eventsData.forEach(function(e) {
    SEARCH_INDEX.push({type:'event', section:'אירועים', title:e.title, snippet:(e.desc||'') + ' | ' + (e.location||''), anchor:'#events'});
  });
  marketData.forEach(function(m) {
    SEARCH_INDEX.push({type:'market', section:'עסקים', title:m.title, snippet:(m.desc||'') + ' | ' + (m.price||''), anchor:'#marketplace'});
  });
  gemachimData.forEach(function(g) {
    SEARCH_INDEX.push({type:'gemach', section:'גמ"חים', title:g.name, snippet:(g.desc||'') + ' ' + (g.phone||''), anchor:'#gemachim'});
  });
  simchotData.forEach(function(s) {
    SEARCH_INDEX.push({type:'simcha', section:'שמחות', title:s.family, snippet:s.details||'', anchor:'#simchot'});
  });
  announcementsData.forEach(function(a) {
    SEARCH_INDEX.push({type:'announcement', section:'הודעות המזכירות', title:a.title, snippet:a.body||'', anchor:'#announcements'});
  });
  // Residents — names only, NO CODES (privacy)
  (residentsData || []).forEach(function(r) {
    SEARCH_INDEX.push({type:'resident', section:'תושבי הישוב', title:r.name, snippet:'תושב/ת רשום/ה — לכניסה לאזור התושבים יש להזין קוד אישי', anchor:'#residents'});
  });
  // Phone book entries (allFamilies if loaded)
  if (typeof allFamilies !== 'undefined' && Array.isArray(allFamilies)) {
    allFamilies.forEach(function(f) {
      var title = f.name || '';
      var snippet = [(f.phone||''), (f.addr||''), (f.wifeName||''), (f.wifePhone||'')].filter(Boolean).join(' | ');
      if (title) SEARCH_INDEX.push({ type:'family', section:'ספר טלפונים', title:title, snippet:snippet, anchor:'#residents' });
    });
  }
}

function searchSite(q) {
  clearTimeout(searchDebounceTimer);
  if (!q || q.length < 2) {
    closeSearch();
    return;
  }
  searchDebounceTimer = setTimeout(function() {
    if (SEARCH_INDEX.length === 0) buildSearchIndex();
    var ql = q.toLowerCase().trim();
    var results = SEARCH_INDEX.filter(function(item) {
      return (item.title && item.title.toLowerCase().includes(ql)) ||
             (item.snippet && item.snippet.toLowerCase().includes(ql)) ||
             (item.section && item.section.toLowerCase().includes(ql));
    });
    // Sort: title match first, then snippet
    results.sort(function(a,b) {
      var at = a.title.toLowerCase().includes(ql) ? 0 : 1;
      var bt = b.title.toLowerCase().includes(ql) ? 0 : 1;
      return at - bt;
    });
    renderSearchResults(results, q);
  }, 200);
}

function highlightMatch(text, q) {
  if (!text) return '';
  var ql = q.toLowerCase();
  var lower = text.toLowerCase();
  var idx = lower.indexOf(ql);
  if (idx === -1) return text.substring(0, 100);
  var start = Math.max(0, idx - 20);
  var end = Math.min(text.length, idx + ql.length + 60);
  var snippet = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
  // Escape HTML
  snippet = snippet.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  // Highlight (case-insensitive)
  var regex = new RegExp(ql.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi');
  return snippet.replace(regex, '<mark style="background:var(--accent-light);color:var(--primary-dark);padding:1px 3px;border-radius:3px">$&</mark>');
}

function renderSearchResults(results, q) {
  var box = document.getElementById('searchResults');
  var body = document.getElementById('searchResultsBody');
  if (!box || !body) return;
  box.classList.add('active');
  if (results.length === 0) {
    body.innerHTML = '<div class="no-results"><i class="bi bi-search" style="font-size:2rem;display:block;margin-bottom:8px"></i>לא נמצאו תוצאות עבור "' + q + '"</div>';
    return;
  }
  body.innerHTML = '<div style="font-size:0.85rem;color:var(--text-light);margin-bottom:10px"><strong>' + results.length + '</strong> תוצאות עבור "<strong>' + q + '</strong>"</div>' +
    results.slice(0, 30).map(function(r) {
      return '<a class="search-result-item" href="' + r.anchor + '" onclick="closeSearch()">' +
        '<span class="res-section"><i class="bi bi-tag-fill" aria-hidden="true"></i> ' + r.section + '</span>' +
        '<div class="res-title">' + highlightMatch(r.title, q) + '</div>' +
        (r.snippet ? '<div class="res-snippet">' + highlightMatch(r.snippet, q) + '</div>' : '') +
      '</a>';
    }).join('') +
    (results.length > 30 ? '<div style="text-align:center;color:var(--text-light);font-size:0.85rem;padding:10px">+ עוד ' + (results.length - 30) + ' תוצאות. צמצמו את החיפוש.</div>' : '');
}

function closeSearch() {
  var box = document.getElementById('searchResults');
  if (box) box.classList.remove('active');
}

// ===== TOPICS NAV — show/hide extra sections =====
function showTopic(topic, btn) {
  // Remove active from all tabs
  document.querySelectorAll('.topic-tab').forEach(function(t) { t.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  if (topic === 'all') {
    document.body.classList.add('show-all-extras');
    document.querySelectorAll('section[data-extra="1"]').forEach(function(s) { s.classList.add('topic-shown'); });
    // Scroll to first extra (simchot/housing area)
    var first = document.querySelector('section[data-extra="1"]');
    if (first) setTimeout(function() { window.scrollTo({ top: first.offsetTop - 100, behavior: 'smooth' }); }, 50);
    return;
  }
  // Hide all extras except chosen
  document.body.classList.remove('show-all-extras');
  document.querySelectorAll('section[data-extra="1"]').forEach(function(s) {
    if (s.id === topic) s.classList.add('topic-shown');
    else s.classList.remove('topic-shown');
  });
  var target = document.getElementById(topic);
  if (target) {
    setTimeout(function() {
      window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' });
    }, 80);
  }
}

// When following any anchor link to a hidden extra section, reveal it
function revealExtraIfNeeded(hash) {
  if (!hash) return;
  var id = hash.replace('#','');
  var sec = document.getElementById(id);
  if (sec && sec.dataset.extra === '1') {
    sec.classList.add('topic-shown');
    // Activate matching topic tab
    document.querySelectorAll('.topic-tab').forEach(function(t) {
      t.classList.toggle('active', t.getAttribute('data-topic') === id);
    });
  }
}
// Hook into existing anchor click handlers
document.addEventListener('click', function(e) {
  var a = e.target.closest('a[href^="#"]');
  if (a) {
    var h = a.getAttribute('href');
    if (h && h.length > 1) revealExtraIfNeeded(h);
  }
}, true);
// On initial load, reveal section by URL hash
if (location.hash) setTimeout(function(){ revealExtraIfNeeded(location.hash); }, 150);

// Close search on click outside or Escape
document.addEventListener('click', function(e) {
  var box = document.getElementById('searchResults');
  var input = document.getElementById('siteSearch');
  if (box && box.classList.contains('active')) {
    if (!box.contains(e.target) && e.target !== input) closeSearch();
  }
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeSearch();
});

// ===== ACTION SHEETS (FLOATING WIDGETS) =====
function openActionSheet(html) {
  var overlay = document.getElementById('actionSheetOverlay');
  document.getElementById('actionSheetBody').innerHTML = html;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  // Focus first button for keyboard
  setTimeout(function() {
    var firstBtn = overlay.querySelector('.action-sheet-btn');
    if (firstBtn) firstBtn.focus();
  }, 100);
}
function closeActionSheet() {
  document.getElementById('actionSheetOverlay').classList.remove('active');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeActionSheet();
});

function quickCall106() {
  // Open action sheet with multiple emergency options instead of immediate dial
  openActionSheet(
    '<h3><i class="bi bi-shield-exclamation" aria-hidden="true"></i> חירום וביטחון</h3>' +
    '<a class="action-sheet-btn danger" href="tel:106" onclick="closeActionSheet()" aria-label="חייג למוקד 106"><i class="bi bi-telephone-fill" aria-hidden="true"></i><div class="label-area">מוקד 106 - מועצה אזורית<div class="sub">פעיל 24/7</div></div></a>' +
    '<a class="action-sheet-btn danger" href="tel:100" onclick="closeActionSheet()" aria-label="חייג למשטרה 100"><i class="bi bi-shield-fill" aria-hidden="true"></i><div class="label-area">משטרה - 100<div class="sub">חירום ארצי</div></div></a>' +
    '<a class="action-sheet-btn danger" href="tel:101" onclick="closeActionSheet()" aria-label="חייג למדא 101"><i class="bi bi-heart-pulse-fill" aria-hidden="true"></i><div class="label-area">מד"א - 101<div class="sub">חירום רפואי</div></div></a>' +
    '<a class="action-sheet-btn danger" href="tel:102" onclick="closeActionSheet()" aria-label="חייג לכבאות 102"><i class="bi bi-fire" aria-hidden="true"></i><div class="label-area">כבאות - 102<div class="sub">שריפה / חילוץ</div></div></a>' +
    '<a class="action-sheet-btn" href="tel:104" onclick="closeActionSheet()" aria-label="חייג לפיקוד העורף 104"><i class="bi bi-broadcast" aria-hidden="true"></i><div class="label-area">פיקוד העורף - 104<div class="sub">הנחיות בזמן אזעקה</div></div></a>'
  );
}

function openReportMenu() {
  openActionSheet(
    '<h3><i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i> דיווח מפגע ביטחוני</h3>' +
    '<a class="action-sheet-btn danger" href="tel:106" onclick="closeActionSheet()" aria-label="התקשר למוקד 106"><i class="bi bi-telephone-fill" aria-hidden="true"></i><div class="label-area">חייג למוקד 106<div class="sub">דיווח מיידי בטלפון</div></div></a>' +
    '<a class="action-sheet-btn sms" href="sms:106" onclick="closeActionSheet()" aria-label="שלח SMS למוקד 106"><i class="bi bi-chat-dots-fill" aria-hidden="true"></i><div class="label-area">SMS למוקד 106<div class="sub">הודעת טקסט</div></div></a>' +
    '<a class="action-sheet-btn whatsapp" href="https://wa.me/972504400106" target="_blank" rel="noopener" onclick="closeActionSheet()" aria-label="שלח וואטסאפ למוקד"><i class="bi bi-whatsapp" aria-hidden="true"></i><div class="label-area">וואטסאפ למוקד<div class="sub">תיעוד דיווח עם תמונה</div></div></a>' +
    '<button class="action-sheet-btn" onclick="closeActionSheet();document.getElementById(\'contact\').scrollIntoView({behavior:\'smooth\'});" aria-label="פתח טופס פנייה מקוונת"><i class="bi bi-envelope-paper-fill" aria-hidden="true"></i><div class="label-area">טופס פנייה מקוונת<div class="sub">דיווח עם פרטים מלאים</div></div></button>'
  );
}

function openContactMenu() {
  openActionSheet(
    '<h3><i class="bi bi-chat-dots-fill" aria-hidden="true"></i> צור קשר עם המזכירות</h3>' +
    '<a class="action-sheet-btn call" href="tel:0299317670" onclick="closeActionSheet()" aria-label="חייג למזכירות"><i class="bi bi-telephone-fill" aria-hidden="true"></i><div class="label-area">חייג למזכירות<div class="sub">02-9931767 | א\'-ה\' 08:00-16:00</div></div></a>' +
    '<a class="action-sheet-btn sms" href="sms:0299317670" onclick="closeActionSheet()" aria-label="שלח SMS למזכירות"><i class="bi bi-chat-text-fill" aria-hidden="true"></i><div class="label-area">SMS למזכירות<div class="sub">הודעת טקסט</div></div></a>' +
    '<a class="action-sheet-btn whatsapp" href="https://wa.me/972299317670" target="_blank" rel="noopener" onclick="closeActionSheet()" aria-label="שלח וואטסאפ למזכירות"><i class="bi bi-whatsapp" aria-hidden="true"></i><div class="label-area">וואטסאפ למזכירות<div class="sub">תיעוד והעברת קבצים</div></div></a>' +
    '<a class="action-sheet-btn email" href="mailto:office@maaleamos.org.il" onclick="closeActionSheet()" aria-label="שלח אימייל למזכירות"><i class="bi bi-envelope-fill" aria-hidden="true"></i><div class="label-area">אימייל למזכירות<div class="sub">office@maaleamos.org.il</div></div></a>' +
    '<button class="action-sheet-btn" onclick="closeActionSheet();document.getElementById(\'contact\').scrollIntoView({behavior:\'smooth\'});" aria-label="פתח טופס פנייה"><i class="bi bi-envelope-paper" aria-hidden="true"></i><div class="label-area">טופס פנייה מקוונת<div class="sub">פנייה רשמית עם פרטים</div></div></button>'
  );
}

// ===== NEWS ARTICLE MODAL =====
function escHtml(s) {
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function openNewsArticle(idx) {
  var n = newsData[idx];
  if (!n) return;
  var modal = document.getElementById('articleModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'articleModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'articleModalTitle');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:3000;display:none;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;direction:rtl';
    modal.onclick = function(e) { if (e.target === modal) closeNewsArticle(); };
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  var fullText = n.fullText || n.desc || '';
  var paragraphs = fullText.split(/\n\n+/).map(function(p) { return '<p style="margin-bottom:14px">' + escHtml(p).replace(/\n/g,'<br>') + '</p>'; }).join('');
  var author = n.author ? '<span style="color:#888;font-size:13px;display:inline-flex;align-items:center;gap:5px"><i class="bi bi-person-circle" aria-hidden="true"></i> ' + escHtml(n.author) + '</span>' : '';
  modal.innerHTML = '<div style="background:#fff;max-width:760px;width:100%;margin:auto;border-radius:18px;direction:rtl;box-shadow:0 12px 40px rgba(0,0,0,0.4);overflow:hidden">' +
    '<div style="height:300px;background-image:url(\'' + escHtml(n.img) + '\');background-size:cover;background-position:center;position:relative">' +
      '<button onclick="closeNewsArticle()" aria-label="סגור כתבה" style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,0.95);border:0;width:42px;height:42px;border-radius:50%;font-size:24px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center">&times;</button>' +
      '<span style="position:absolute;bottom:14px;right:14px;background:var(--primary);color:#fff;padding:6px 16px;border-radius:20px;font-size:0.85rem;font-weight:700">' + escHtml(n.cat || '') + '</span>' +
    '</div>' +
    '<div style="padding:30px">' +
      '<div style="display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin-bottom:14px">' +
        '<span style="color:#888;font-size:13px;display:inline-flex;align-items:center;gap:5px"><i class="bi bi-calendar3" aria-hidden="true"></i> ' + escHtml(n.date || '') + '</span>' +
        author +
      '</div>' +
      '<h2 id="articleModalTitle" style="margin-bottom:18px;color:var(--primary-dark);font-size:1.7rem;line-height:1.4">' + escHtml(n.title) + '</h2>' +
      '<div style="line-height:1.85;color:#2c3e50;font-size:1.05rem">' + paragraphs + '</div>' +
      '<div style="margin-top:28px;padding-top:18px;border-top:1px solid #eee;display:flex;gap:10px;flex-wrap:wrap">' +
        '<button onclick="shareWA(\'' + encodeURIComponent(n.title) + '\')" style="background:#25d366;color:#fff;border:0;padding:10px 20px;border-radius:8px;cursor:pointer;font-family:Heebo;font-weight:600"><i class="bi bi-whatsapp" aria-hidden="true"></i> שתף בוואטסאפ</button>' +
        '<button onclick="window.print()" style="background:var(--primary);color:#fff;border:0;padding:10px 20px;border-radius:8px;cursor:pointer;font-family:Heebo;font-weight:600"><i class="bi bi-printer" aria-hidden="true"></i> הדפס</button>' +
        '<button onclick="closeNewsArticle()" style="background:#e0e0e0;color:#333;border:0;padding:10px 20px;border-radius:8px;cursor:pointer;font-family:Heebo;font-weight:600;margin-inline-start:auto">סגור</button>' +
      '</div>' +
    '</div></div>';
}
function closeNewsArticle() {
  var m = document.getElementById('articleModal');
  if (m) m.style.display = 'none';
  document.body.style.overflow = '';
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var m = document.getElementById('articleModal');
    if (m && m.style.display === 'flex') closeNewsArticle();
  }
});

// ===== HERO SLIDESHOW =====
var currentSlide = 0;
var slides = document.querySelectorAll('.hero-slide');
function nextSlide() {
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add('active');
}
setInterval(nextSlide, 5000);

// ===== SCROLL EFFECTS =====
var navbar = document.getElementById('navbar');
var backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', function() {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  backToTop.classList.toggle('show', window.scrollY > 500);
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' });
      document.getElementById('navMenu').classList.remove('open');
    }
  });
});

// Fade up
var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.1 });
function observeFadeUp() {
  document.querySelectorAll('.fade-up').forEach(function(el) {
    if (!el.dataset.observed) {
      // If element is already in viewport, show immediately
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        el.classList.add('visible');
      }
      observer.observe(el);
      el.dataset.observed = '1';
    }
  });
}
observeFadeUp();

// Animated counters
var counterObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      var el = entry.target;
      var target = parseInt(el.getAttribute('data-target'));
      if (!target || el.dataset.done) return;
      el.dataset.done = '1';
      var current = 0, step = Math.ceil(target / 60);
      var timer = setInterval(function() {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current.toLocaleString() + '+';
      }, 25);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(function(el) { counterObserver.observe(el); });

// Close admin on escape + Ctrl+K to focus site search
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeAdmin();
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    var s = document.getElementById('siteSearch');
    if (s) { s.focus(); s.select(); s.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }
});

// ===== DARK MODE =====
function toggleDark() {
  document.body.classList.toggle('dark');
  var icon = document.querySelector('.dark-toggle i');
  if (document.body.classList.contains('dark')) {
    icon.className = 'bi bi-sun-fill';
    localStorage.setItem('ma_dark', '1');
  } else {
    icon.className = 'bi bi-moon-fill';
    localStorage.removeItem('ma_dark');
  }
}
if (localStorage.getItem('ma_dark') === '1') {
  document.body.classList.add('dark');
  document.querySelector('.dark-toggle i').className = 'bi bi-sun-fill';
}

// Show scroll-top button once user scrolls past 400px
window.addEventListener('scroll', function() {
  var btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  btn.style.display = (window.scrollY > 400) ? 'flex' : 'none';
}, { passive: true });

// Auto-refresh data from backend every 90s (only when tab is visible — saves bandwidth)
setInterval(function() {
  if (document.hidden) return;  // Don't poll when tab is in background
  if (!getBackendUrl()) return;  // No backend → nothing to refresh
  // Skip if admin overlay is open (user is editing)
  var adminOverlay = document.getElementById('adminOverlay');
  if (adminOverlay && adminOverlay.classList.contains('active')) return;
  loadGlobalData();
}, 90 * 1000);

// ===== ACCESSIBILITY =====
var fontLevel = 0;
function changeFontSize(dir) {
  fontLevel += dir;
  if (fontLevel < 0) fontLevel = 0;
  if (fontLevel > 2) fontLevel = 2;
  document.body.classList.remove('font-lg', 'font-xl');
  if (fontLevel === 1) document.body.classList.add('font-lg');
  if (fontLevel === 2) document.body.classList.add('font-xl');
}

// ===== WHATSAPP SHARE =====
function shareWA(text) {
  window.open('https://wa.me/?text=' + text + '%20-%20' + encodeURIComponent(location.href), '_blank');
}

// ===== RESIDENT SECTIONS =====
function showResidentSection(section) {
  var sections = ['Inquiries','NewInquiry','PostSimcha','PostAd','Phonebook','Payments','Documents','Notifications','Profile','AdminCms','AdminAnalytics','AdminUsers','AdminAudit'];
  sections.forEach(function(s) {
    var el = document.getElementById('resident' + s);
    if (el) el.style.display = 'none';
  });
  var map = {
    'inquiries': 'Inquiries', 'new-inquiry': 'NewInquiry', 'post-simcha': 'PostSimcha',
    'post-ad': 'PostAd', 'phonebook': 'Phonebook', 'payments': 'Payments',
    'documents': 'Documents', 'notifications': 'Notifications', 'profile': 'Profile',
    'admin-cms': 'AdminCms', 'admin-analytics': 'AdminAnalytics',
    'admin-users': 'AdminUsers', 'admin-audit': 'AdminAudit'
  };
  var target = document.getElementById('resident' + map[section]);
  if (target) target.style.display = 'block';
  if (section === 'inquiries') renderInquiries();
  if (section === 'phonebook') { if (allFamilies.length === 0) loadPhoneDir(); else renderPhoneDir(''); }
  if (section === 'notifications') renderNotifications();
  if (section === 'profile') loadProfile();
  if (section === 'admin-cms') portalOpenAdminTab('news');
  if (section === 'admin-analytics') loadPortalAnalytics();
  if (section === 'admin-users') loadPortalUsers();
  if (section === 'admin-audit') loadPortalAudit();
}

// v3: Render admin CMS inline in the portal (news/events/announcements)
function portalOpenAdminTab(tab) {
  var el = document.getElementById('portalAdminEmbed');
  if (!el) return;
  if (tab === 'all') {
    // Redirect to full admin overlay
    location.hash = '#admin';
    setTimeout(function() {
      var codeEl = document.getElementById('adminCode');
      if (codeEl) { codeEl.value = '8484'; adminLogin(); }
    }, 300);
    return;
  }
  if (tab === 'news') el.innerHTML = _portalNewsForm();
  if (tab === 'events') el.innerHTML = _portalEventsForm();
  if (tab === 'announcements') el.innerHTML = _portalAnnouncementsForm();
  if (tab === 'bulletins') el.innerHTML = _portalBulletinsForm();
  if (tab === 'featured') el.innerHTML = _portalFeaturedForm();
  if (tab === 'settings') el.innerHTML = _portalSettingsForm();
}
// v3.5: Restored SETTINGS tab in portal (Emmanuel: "הגדרות נעלמו")
function _portalSettingsForm() {
  var currToken = getGhToken();
  var tokenMask = currToken ? currToken.slice(0, 4) + '...' + currToken.slice(-4) : '(לא מוגדר)';
  var currBackend = getBackendUrl();
  return '<h5 style="font-weight:800;margin-bottom:12px"><i class="bi bi-gear-fill"></i> הגדרות</h5>' +
    '<div style="background:#dbeafe;border-radius:8px;padding:12px;margin-bottom:16px;font-size:0.85rem;border:1px solid #93c5fd">' +
      '<i class="bi bi-info-circle-fill" style="color:#1e40af"></i> ' +
      'שינוי כאן משפיע על הפעולות שלך בפאנל. כדי לפרסם/למחוק תוכן, חייבים GitHub token תקין.' +
    '</div>' +
    '<div class="admin-form-group"><label><i class="bi bi-github"></i> GitHub Token (חובה לניהול תוכן)</label>' +
      '<input type="password" id="setPortalGhToken" placeholder="' + escapeHtml(currToken || 'ghp_...') + '" value="">' +
      '<p style="font-size:0.78rem;color:var(--text-light);margin-top:6px">' +
        (currToken ? '✅ טוקן קיים: <code>' + escapeHtml(tokenMask) + '</code> — הזן חדש רק אם תרצה להחליף.' :
          '⚠ אין טוקן! צור אחד ב־<a href="https://github.com/settings/tokens/new?scopes=repo&description=maale-amos-cms" target="_blank">github.com/settings/tokens/new</a> (סמן repo).') +
      '</p>' +
    '</div>' +
    '<div class="admin-form-group"><label><i class="bi bi-database"></i> Backend URL (Google Apps Script)</label>' +
      '<input id="setPortalBackend" placeholder="' + escapeHtml(currBackend) + '" value="">' +
      '<p style="font-size:0.78rem;color:var(--text-light);margin-top:6px">כתובת ה־web app של Sheets. השאר ריק כדי לא לשנות.</p>' +
    '</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">' +
      '<button class="btn-admin btn-admin-primary" onclick="portalSaveSettings()"><i class="bi bi-save"></i> שמור</button>' +
      '<button class="btn-admin" style="background:#0891b2;color:#fff" onclick="portalTestConnection()"><i class="bi bi-check-circle"></i> בדוק חיבור</button>' +
      '<button class="btn-admin btn-admin-danger" onclick="if(confirm(\'למחוק את הטוקן?\'))(localStorage.removeItem(\'ma_gh_token\'),portalOpenAdminTab(\'settings\'),showToast(\'טוקן הוסר\'))"><i class="bi bi-trash"></i> מחק טוקן</button>' +
    '</div>' +
    '<hr><h6 style="font-weight:700;margin-top:16px"><i class="bi bi-shield-lock"></i> אבטחה + סטטיסטיקות</h6>' +
    '<ul style="font-size:0.85rem;line-height:1.8;color:var(--text)">' +
      '<li>גרסה: <b>v3.5</b></li>' +
      '<li>DB ראשי: <b>GitHub</b> (data/*.json) — גיבוי אוטומטי ל־Sheets</li>' +
      '<li>אימות: email/password (SHA-256 + salt) + Google Sign-In</li>' +
      '<li>Session: 30 יום עד יציאה אוטומטית</li>' +
      '<li>Rate limit: 5 ניסיונות login כושלים ב־15 דק\'</li>' +
      '<li>CSP + Referrer-Policy + XSS protection: פעילים</li>' +
    '</ul>';
}
function portalSaveSettings() {
  var tok = document.getElementById('setPortalGhToken').value.trim();
  var backend = document.getElementById('setPortalBackend').value.trim();
  var changed = [];
  if (tok) {
    if (!/^(gh[pous]_|github_pat_)/.test(tok) && !confirm('הטוקן לא בפורמט הצפוי. לשמור?')) return;
    localStorage.setItem(GH_TOKEN_KEY, tok); changed.push('טוקן');
  }
  if (backend) {
    localStorage.setItem(BACKEND_URL_KEY, backend); changed.push('backend URL');
  }
  showToast(changed.length ? '✅ נשמר: ' + changed.join(', ') : 'לא בוצע שינוי');
  portalOpenAdminTab('settings');
}
function portalTestConnection() {
  showToast('בודק חיבור...');
  fetch(getBackendUrl() + '?action=maale_health')
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res && res.ok) showToast('✅ שרת מגיב · ' + (res.version || res.service));
      else showToast('❌ שרת לא מגיב תקין');
    })
    .catch(function(e) { showToast('❌ שגיאה: ' + e); });
  // Also test GH token
  var tok = getGhToken();
  if (tok) {
    fetch('https://api.github.com/repos/maale-amos/maale-amos.github.io', { headers: { Authorization: 'token ' + tok } })
      .then(function(r) {
        setTimeout(function() {
          showToast(r.ok ? '✅ טוקן GitHub תקין' : '❌ טוקן GitHub לא תקין (' + r.status + ')');
        }, 1500);
      });
  }
}
// v3.2: HOT BULLETINS admin form
function _portalBulletinsForm() {
  return '<h5 style="font-weight:800;margin-bottom:12px;color:#dc2626"><i class="bi bi-fire"></i> מבזק חם חדש</h5>' +
    '<p style="font-size:0.85rem;color:var(--text-light);margin-bottom:12px">מבזקים מופיעים בכרטיסים בולטים בראש האתר. השתמש לעדכונים דחופים / אירועים / הודעות.</p>' +
    '<div class="admin-form-group"><label>סוג</label>' +
      '<select id="portalBullType"><option value="urgent">🔴 דחוף</option><option value="info" selected>ℹ️ מידע</option><option value="event">📅 אירוע</option></select>' +
    '</div>' +
    '<div class="admin-form-group"><label>כותרת</label><input id="portalBullTitle" placeholder="למשל: פתיחת הרשמה — נותרו מקומות"></div>' +
    '<div class="admin-form-group"><label>גוף (טקסט קצר, 2-4 שורות)</label><textarea id="portalBullBody" rows="3" placeholder="פרטים..."></textarea></div>' +
    '<div class="admin-form-group"><label>קישור נוסף (אופציונלי)</label><input id="portalBullLink" placeholder="https://..."></div>' +
    '<div class="admin-form-group"><label>עדיפות (מספר גבוה = מופיע ראשון)</label><input id="portalBullPriority" type="number" value="5" style="width:100px"></div>' +
    '<div class="admin-form-group"><label>פג תוקף בתאריך (אופציונלי — יעלם אוטומטית)</label><input id="portalBullExpires" type="date"></div>' +
    '<button class="btn-admin btn-admin-primary" onclick="portalAddBulletin()"><i class="bi bi-plus-circle"></i> פרסם מבזק</button>' +
    '<hr style="margin:20px 0"><h6 style="font-weight:700"><i class="bi bi-list"></i> מבזקים קיימים (' + (bulletinsData || []).length + ')</h6>' +
    '<div style="max-height:300px;overflow:auto">' +
    (bulletinsData || []).map(function(b, i) {
      var typeLabel = b.type === 'urgent' ? '🔴' : b.type === 'event' ? '📅' : 'ℹ️';
      return '<div style="padding:10px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:start">' +
        '<div style="flex:1"><b>' + typeLabel + ' ' + escapeHtml(b.title || '') + '</b><br><small style="color:var(--text-light)">' + escapeHtml((b.body || '').slice(0, 80)) + '...</small></div>' +
        '<div style="display:flex;gap:4px">' +
          '<button class="btn-admin btn-admin-sm" style="background:#0891b2;color:#fff" onclick="portalEditBulletin(\'' + escapeHtml(b.id) + '\')"><i class="bi bi-pencil"></i></button>' +
          '<button class="btn-admin btn-admin-danger btn-admin-sm" onclick="portalDelete(\'bulletins\',' + i + ')"><i class="bi bi-trash"></i></button>' +
        '</div></div>';
    }).join('') || '<div style="color:var(--text-light);padding:20px;text-align:center">אין מבזקים עדיין</div>' +
    '</div>';
}
// v3.2: FEATURED (posters) admin form — with image upload
function _portalFeaturedForm() {
  return '<h5 style="font-weight:800;margin-bottom:12px;color:#c2410c"><i class="bi bi-star-fill"></i> באנר/פוסטר חדש</h5>' +
    '<p style="font-size:0.85rem;color:var(--text-light);margin-bottom:12px">באנרים גדולים מוצגים באמצע הדף — פרסום מודעה גדולה, פוסטר, לוח זמנים וכו\'.</p>' +
    '<div class="admin-form-group"><label>כותרת</label><input id="portalFeatTitle" placeholder="לדוגמה: זמני הלימודים תשפ״ז"></div>' +
    '<div class="admin-form-group"><label>תת-כותרת</label><input id="portalFeatSubtitle" placeholder="תיאור קצר (אופציונלי)"></div>' +
    '<div class="admin-form-group"><label>העלאת תמונה</label>' +
      '<input type="file" id="portalFeatFile" accept="image/*" onchange="portalHandleFeatImage(this)">' +
      '<div id="portalFeatPreview" style="margin-top:10px"></div>' +
      '<input type="hidden" id="portalFeatImg">' +
      '<p style="font-size:0.75rem;color:var(--text-light);margin-top:6px"><i class="bi bi-info-circle"></i> התמונה נשמרת בתיקיית images/ ב־GitHub (פורמט מומלץ: JPG/PNG עד 2MB).</p>' +
    '</div>' +
    '<div class="admin-form-group"><label>עדיפות (מספר גבוה = ראשון)</label><input id="portalFeatPriority" type="number" value="5" style="width:100px"></div>' +
    '<button class="btn-admin btn-admin-primary" onclick="portalAddFeatured()"><i class="bi bi-plus-circle"></i> פרסם באנר</button>' +
    '<hr style="margin:20px 0"><h6 style="font-weight:700"><i class="bi bi-list"></i> באנרים קיימים (' + (featuredData || []).length + ')</h6>' +
    '<div style="max-height:400px;overflow:auto">' +
    (featuredData || []).map(function(f, i) {
      return '<div style="padding:10px;border-bottom:1px solid #e5e7eb;display:flex;gap:12px;align-items:start">' +
        (f.img ? '<img src="' + escapeHtml(f.img) + '" style="width:80px;height:80px;object-fit:cover;border-radius:8px;flex-shrink:0">' : '<div style="width:80px;height:80px;background:#f3f4f6;border-radius:8px"></div>') +
        '<div style="flex:1"><b>' + escapeHtml(f.title || '(ללא כותרת)') + '</b><br><small style="color:var(--text-light)">' + escapeHtml(f.subtitle || '') + '</small><br><small style="color:var(--text-light)">עדיפות: ' + (f.priority || 0) + '</small></div>' +
        '<div style="display:flex;flex-direction:column;gap:4px">' +
          '<button class="btn-admin btn-admin-sm" style="background:#0891b2;color:#fff" onclick="portalEditFeatured(\'' + escapeHtml(f.id) + '\')"><i class="bi bi-pencil"></i></button>' +
          '<button class="btn-admin btn-admin-danger btn-admin-sm" onclick="portalDelete(\'featured\',' + i + ')"><i class="bi bi-trash"></i></button>' +
        '</div></div>';
    }).join('') || '<div style="color:var(--text-light);padding:20px;text-align:center">אין באנרים עדיין</div>' +
    '</div>';
}
function portalHandleFeatImage(input) {
  var file = input.files[0]; if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('קובץ גדול מדי (מקסימום 5MB)'); return; }
  var preview = document.getElementById('portalFeatPreview');
  var reader = new FileReader();
  reader.onload = function(e) {
    preview.innerHTML = '<img src="' + e.target.result + '" style="max-width:200px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1)"><br><small style="color:var(--text-light)">' + escapeHtml(file.name) + ' · ' + (file.size / 1024).toFixed(0) + ' KB</small>';
    document.getElementById('portalFeatImg').value = e.target.result;   // temp: use data URL
  };
  reader.readAsDataURL(file);
  showToast('תמונה תיטען עם הפרסום...');
}
// v3.3: All portal writers now save-first-then-mutate + handle no-token
function _portalWrite(collection, arr, next, msgOk, renderFn) {
  if (!getGhToken()) { promptForGhToken(); return Promise.resolve({ ok: false, error: 'no_token' }); }
  showToast('שומר...');
  return saveCollection(collection, next).then(function(res) {
    if (res && res.ok) {
      // Replace source-of-truth atomically
      arr.length = 0; next.forEach(function(x) { arr.push(x); });
      showToast(msgOk);
      if (renderFn) renderFn();
      portalOpenAdminTab(collection);
      return res;
    }
    showToast('❌ ' + (res && (res.error || res.hint) || 'שגיאה בשמירה'));
    if (res && res.error === 'no_token') promptForGhToken();
    return res;
  });
}
function portalAddBulletin() {
  var item = {
    id: 'bull_' + Date.now().toString(36),
    type: document.getElementById('portalBullType').value,
    title: document.getElementById('portalBullTitle').value.trim(),
    body: document.getElementById('portalBullBody').value.trim(),
    link: document.getElementById('portalBullLink').value.trim(),
    priority: parseInt(document.getElementById('portalBullPriority').value, 10) || 5,
    created_at: new Date().toISOString(),
    author: (getCurrentUser() || {}).name || 'מנהל',
  };
  var exp = document.getElementById('portalBullExpires').value;
  if (exp) item.expires = new Date(exp).toISOString();
  if (!item.title) { showToast('חובה למלא כותרת'); return; }
  var next = [item].concat(bulletinsData);
  _portalWrite('bulletins', bulletinsData, next, '🔥 מבזק פורסם', renderHotBulletins);
}
function portalEditBulletin(id) {
  var b = bulletinsData.find(function(x) { return x.id === id; });
  if (!b) return;
  var newTitle = prompt('כותרת חדשה:', b.title);
  if (newTitle === null) return;
  var newBody = prompt('גוף חדש:', b.body);
  if (newBody === null) return;
  var next = bulletinsData.map(function(x) {
    return x.id === id ? Object.assign({}, x, { title: newTitle, body: newBody, updated_at: new Date().toISOString() }) : x;
  });
  _portalWrite('bulletins', bulletinsData, next, '✅ עודכן', renderHotBulletins);
}
function portalAddFeatured() {
  var item = {
    id: 'feat_' + Date.now().toString(36),
    title: document.getElementById('portalFeatTitle').value.trim(),
    subtitle: document.getElementById('portalFeatSubtitle').value.trim(),
    img: document.getElementById('portalFeatImg').value,
    priority: parseInt(document.getElementById('portalFeatPriority').value, 10) || 5,
    created_at: new Date().toISOString(),
  };
  if (!item.title && !item.img) { showToast('חובה למלא כותרת או תמונה'); return; }
  var next = [item].concat(featuredData);
  _portalWrite('featured', featuredData, next, '⭐ באנר פורסם', renderFeatured);
}
function portalEditFeatured(id) {
  var f = featuredData.find(function(x) { return x.id === id; });
  if (!f) return;
  var newTitle = prompt('כותרת חדשה:', f.title || '');
  if (newTitle === null) return;
  var newSubtitle = prompt('תת-כותרת חדשה:', f.subtitle || '');
  if (newSubtitle === null) return;
  var next = featuredData.map(function(x) {
    return x.id === id ? Object.assign({}, x, { title: newTitle, subtitle: newSubtitle, updated_at: new Date().toISOString() }) : x;
  });
  _portalWrite('featured', featuredData, next, '✅ עודכן', renderFeatured);
}
function _portalNewsForm() {
  return '<h5 style="font-weight:800;margin-bottom:12px"><i class="bi bi-newspaper"></i> כתבה חדשה</h5>' +
    '<div class="admin-form-group"><label>כותרת</label><input id="portalNewsTitle" placeholder="כותרת הכתבה"></div>' +
    '<div class="admin-form-group"><label>תיאור</label><textarea id="portalNewsDesc" rows="4" placeholder="גוף הכתבה"></textarea></div>' +
    '<div class="admin-form-group"><label>קטגוריה</label><input id="portalNewsCat" placeholder="🏠 דיור / 🕯 דת / ..."></div>' +
    '<div class="admin-form-group"><label>תמונה (URL או העלאה)</label><input id="portalNewsImg" placeholder="https://..."></div>' +
    '<button class="btn-admin btn-admin-primary" onclick="portalAddNews()"><i class="bi bi-plus-circle"></i> פרסם כתבה</button>' +
    '<hr style="margin:20px 0"><h6 style="font-weight:700"><i class="bi bi-list"></i> כתבות קיימות</h6>' +
    '<div id="portalNewsList" style="max-height:280px;overflow:auto">' +
    (newsData || []).map(function(n, i) {
      return '<div style="padding:8px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center"><div><b>' + (n.title || '(ללא כותרת)') + '</b><br><small style="color:var(--text-light)">' + (n.date || '') + ' · ' + (n.cat || '') + '</small></div>' +
        '<button class="btn-admin btn-admin-danger btn-admin-sm" onclick="portalDelete(\'news\',' + i + ')"><i class="bi bi-trash"></i></button></div>';
    }).join('') +
    '</div>';
}
function _portalEventsForm() {
  return '<h5 style="font-weight:800;margin-bottom:12px"><i class="bi bi-calendar3"></i> אירוע חדש</h5>' +
    '<div class="admin-form-group"><label>כותרת</label><input id="portalEventTitle" placeholder="שם האירוע"></div>' +
    '<div class="admin-form-group"><label>יום</label><input id="portalEventDay" placeholder="15"></div>' +
    '<div class="admin-form-group"><label>חודש</label><input id="portalEventMonth" placeholder="ניסן / מאי"></div>' +
    '<div class="admin-form-group"><label>שעה</label><input id="portalEventTime" placeholder="20:00"></div>' +
    '<div class="admin-form-group"><label>מיקום</label><input id="portalEventLoc" placeholder="בית כנסת מרכזי"></div>' +
    '<div class="admin-form-group"><label>תיאור</label><textarea id="portalEventDesc" rows="2"></textarea></div>' +
    '<button class="btn-admin btn-admin-primary" onclick="portalAddEvent()"><i class="bi bi-plus-circle"></i> פרסם אירוע</button>' +
    '<hr style="margin:20px 0"><h6 style="font-weight:700"><i class="bi bi-list"></i> אירועים קיימים</h6>' +
    '<div style="max-height:200px;overflow:auto">' +
    (eventsData || []).map(function(e, i) {
      return '<div style="padding:8px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between"><div><b>' + (e.title || '') + '</b><br><small style="color:var(--text-light)">' + (e.day || '') + ' ' + (e.month || '') + ' · ' + (e.time || '') + '</small></div>' +
        '<button class="btn-admin btn-admin-danger btn-admin-sm" onclick="portalDelete(\'events\',' + i + ')"><i class="bi bi-trash"></i></button></div>';
    }).join('') +
    '</div>';
}
function _portalAnnouncementsForm() {
  return '<h5 style="font-weight:800;margin-bottom:12px"><i class="bi bi-megaphone-fill"></i> הודעת מזכירות חדשה</h5>' +
    '<div class="admin-form-group"><label>סוג</label><select id="portalAnnType"><option value="event">אירוע</option><option value="urgent">דחוף</option><option value="info">מידע</option></select></div>' +
    '<div class="admin-form-group"><label>כותרת</label><input id="portalAnnTitle"></div>' +
    '<div class="admin-form-group"><label>גוף ההודעה</label><textarea id="portalAnnBody" rows="3"></textarea></div>' +
    '<div class="admin-form-group"><label>תאריך</label><input id="portalAnnDate" placeholder="י\"ב בתמוז תשפ\"ו"></div>' +
    '<button class="btn-admin btn-admin-primary" onclick="portalAddAnnouncement()"><i class="bi bi-plus-circle"></i> פרסם הודעה</button>';
}
function portalAddNews() {
  var item = {
    id: Date.now().toString(36),
    title: document.getElementById('portalNewsTitle').value.trim(),
    desc: document.getElementById('portalNewsDesc').value.trim(),
    cat: document.getElementById('portalNewsCat').value.trim(),
    img: document.getElementById('portalNewsImg').value.trim(),
    date: new Date().toLocaleDateString('he-IL'),
    author: (getCurrentUser() || {}).name || 'מנהל',
    created_at: new Date().toISOString(),
  };
  if (!item.title) { showToast('חובה למלא כותרת'); return; }
  _portalWrite('news', newsData, [item].concat(newsData), '✅ כתבה פורסמה', renderNews);
}
function portalAddEvent() {
  var item = {
    id: Date.now().toString(36),
    title: document.getElementById('portalEventTitle').value.trim(),
    day: document.getElementById('portalEventDay').value.trim(),
    month: document.getElementById('portalEventMonth').value.trim(),
    time: document.getElementById('portalEventTime').value.trim(),
    location: document.getElementById('portalEventLoc').value.trim(),
    desc: document.getElementById('portalEventDesc').value.trim(),
  };
  if (!item.title) { showToast('חובה למלא כותרת'); return; }
  _portalWrite('events', eventsData, [item].concat(eventsData), '✅ אירוע פורסם', renderEvents);
}
function portalAddAnnouncement() {
  var item = {
    id: Date.now().toString(36),
    type: document.getElementById('portalAnnType').value,
    title: document.getElementById('portalAnnTitle').value.trim(),
    body: document.getElementById('portalAnnBody').value.trim(),
    date: document.getElementById('portalAnnDate').value.trim() || new Date().toLocaleDateString('he-IL'),
  };
  if (!item.title || !item.body) { showToast('חובה למלא כותרת וגוף'); return; }
  _portalWrite('announcements', announcementsData, [item].concat(announcementsData), '✅ הודעה פורסמה', renderAnnouncements);
}
// v3.3: Save-first-then-mutate. Was: mutated local array before verifying GH
// write succeeded — deletions "worked" in the UI but item reappeared after
// refresh. Now the array is only modified if the GitHub write returns ok.
function portalDelete(collection, i) {
  if (!confirm('למחוק פריט זה?')) return;
  if (!getGhToken()) { promptForGhToken(); return; }
  var arrs = { news: newsData, events: eventsData, announcements: announcementsData, bulletins: bulletinsData, featured: featuredData };
  var arr = arrs[collection];
  if (!arr) return;
  // Build the proposed-new array WITHOUT touching the source-of-truth yet
  var next = arr.slice();
  next.splice(i, 1);
  showToast('שומר...');
  saveCollection(collection, next).then(function(res) {
    if (res && res.ok) {
      // Only NOW mutate the in-memory array
      arr.splice(i, 1);
      showToast('✅ נמחק ונשמר');
      portalOpenAdminTab(collection);
      var renderers = {
        news: renderNews, events: renderEvents, announcements: renderAnnouncements,
        bulletins: renderHotBulletins, featured: renderFeatured,
      };
      if (renderers[collection]) renderers[collection]();
    } else {
      showToast('❌ מחיקה נכשלה: ' + (res && (res.error || res.hint) || 'לא ידוע'));
      if (res && res.error === 'no_token') promptForGhToken();
    }
  });
}
// v3.3: Interactive GH token prompt (was silent failure)
function promptForGhToken() {
  var current = getGhToken();
  var msg = 'לניהול תוכן צריך GitHub token (רק פעם אחת).\n\n' +
    '1. לך ל־ https://github.com/settings/tokens/new\n' +
    '2. תן שם: "maale-amos-cms"\n' +
    '3. סמן: repo (Full control)\n' +
    '4. תוקף: 90 יום או "No expiration"\n' +
    '5. לחץ Generate token → העתק\n\n' +
    'הדבק כאן:';
  var tok = prompt(msg, current);
  if (tok === null) return;
  tok = tok.trim();
  if (!tok) { localStorage.removeItem(GH_TOKEN_KEY); showToast('טוקן נמחק'); return; }
  if (!/^(gh[pous]_|github_pat_)/.test(tok)) {
    if (!confirm('הטוקן לא בפורמט הצפוי (מתחיל ב־ghp_ / github_pat_). לשמור בכל זאת?')) return;
  }
  localStorage.setItem(GH_TOKEN_KEY, tok);
  showToast('✅ טוקן נשמר');
}

// ===== INQUIRY SYSTEM =====
function getInquiries() { return getData('inquiries', []); }
function renderInquiries() {
  var inquiries = getInquiries();
  var tbody = document.getElementById('inquiryBody');
  var noMsg = document.getElementById('noInquiries');
  if (inquiries.length === 0) { tbody.innerHTML = ''; noMsg.style.display = 'block'; return; }
  noMsg.style.display = 'none';
  var statusLabels = { open: 'פתוח', progress: 'בטיפול', closed: 'נסגר' };
  tbody.innerHTML = inquiries.map(function(inq, i) {
    return '<tr><td>' + (i+1) + '</td><td>' + inq.subject + '<br><small style="color:var(--text-light)">' + (inq.message||'').substring(0,50) + '</small></td><td>' + inq.date + '</td><td><span class="status-badge status-' + inq.status + '">' + statusLabels[inq.status] + '</span></td></tr>';
  }).join('');
}

function previewInqImage(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = document.getElementById('inqImgPreview');
      img.src = e.target.result; img.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function submitInquiry() {
  var subject = document.getElementById('inqSubject').value;
  var message = document.getElementById('inqMessage').value;
  if (!message) { showToast('נא למלא תיאור'); return; }
  var inquiries = getInquiries();
  var now = new Date();
  var dateStr = now.getDate() + '/' + (now.getMonth()+1) + '/' + now.getFullYear();
  var imgData = '';
  var imgEl = document.getElementById('inqImgPreview');
  if (imgEl && imgEl.src && imgEl.src.startsWith('data:')) imgData = imgEl.src;
  inquiries.unshift({ subject: subject, message: message, date: dateStr, status: 'open', image: imgData });
  setData('inquiries', inquiries);
  // Also send via email
  var user = sessionStorage.getItem('ma_user');
  var userName = '';
  if (user) { try { userName = JSON.parse(user).name; } catch(e) {} }
  var mailBody = 'פנייה חדשה מאתר מעלה עמוס%0A%0Aשם: ' + encodeURIComponent(userName) + '%0Aנושא: ' + encodeURIComponent(subject) + '%0Aתוכן: ' + encodeURIComponent(message);
  // Open mailto as fallback notification
  var mailLink = document.createElement('a');
  mailLink.href = 'mailto:6742853@gmail.com?subject=' + encodeURIComponent('פנייה מתושב - ' + subject) + '&body=' + mailBody;
  mailLink.click();
  document.getElementById('inqMessage').value = '';
  if (imgEl) { imgEl.src = ''; imgEl.style.display = 'none'; }
  showResidentSection('inquiries');
  showToast('הפנייה נרשמה — נפתח Gmail לשליחת המייל לוועד');
}

// ===== NOTIFICATIONS =====
function renderNotifications() {
  var notifs = [
    { text: 'הרשמה לגני ילדים תשפ"ז נפתחה', date: '24/04', icon: 'bi-megaphone' },
    { text: 'תשלום ארנונה לרבעון 2 התקבל', date: '20/04', icon: 'bi-receipt' },
    { text: 'תורנות שמירה מועצתית — עדכון דור ביטחון', date: '18/04', icon: 'bi-shield-check' }
  ];
  document.getElementById('notifList').innerHTML = notifs.map(function(n) {
    return '<div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:#fff;border-radius:10px;margin-bottom:8px;box-shadow:var(--card-shadow)"><i class="bi ' + n.icon + '" style="font-size:1.3rem;color:var(--primary)"></i><div style="flex:1"><div style="font-weight:600;font-size:0.9rem">' + n.text + '</div></div><div style="font-size:0.78rem;color:var(--text-light)">' + n.date + '</div></div>';
  }).join('');
}

// ===== PROFILE =====
function loadProfile() {
  var profile = getData('profile', {});
  document.getElementById('profileName').value = profile.name || '';
  document.getElementById('profilePhone').value = profile.phone || '';
  document.getElementById('profileAddr').value = profile.addr || '';
}
function saveProfile() {
  setData('profile', {
    name: document.getElementById('profileName').value,
    phone: document.getElementById('profilePhone').value,
    addr: document.getElementById('profileAddr').value
  });
  showToast('פרטים נשמרו!');
}

function changePassword() {
  var oldPass = document.getElementById('oldPass').value;
  var newPass = document.getElementById('newPass').value;
  var newPass2 = document.getElementById('newPass2').value;
  if (!oldPass || !newPass) { showToast('נא למלא את כל השדות'); return; }
  if (newPass.length < 4) { showToast('סיסמה חייבת לפחות 4 תווים'); return; }
  if (newPass !== newPass2) { showToast('הסיסמאות אינן תואמות!'); return; }
  var user = sessionStorage.getItem('ma_user');
  if (!user) return;
  user = JSON.parse(user);
  var users = getData('registered_users', []);
  var found = users.find(function(u) { return u.name === user.name && u.pass === simpleHash(oldPass); });
  if (!found) {
    // Maybe entered with community code - create account
    if (oldPass === RESIDENT_CODE) {
      users.push({ name: user.name, phone: user.email || '', addr: '', pass: simpleHash(newPass), registered: new Date().toISOString() });
      setData('registered_users', users);
      showToast('סיסמה אישית נקבעה בהצלחה!');
      document.getElementById('oldPass').value = '';
      document.getElementById('newPass').value = '';
      document.getElementById('newPass2').value = '';
      return;
    }
    showToast('סיסמה נוכחית שגויה!'); return;
  }
  found.pass = simpleHash(newPass);
  setData('registered_users', users);
  showToast('הסיסמה שונתה בהצלחה!');
  document.getElementById('oldPass').value = '';
  document.getElementById('newPass').value = '';
  document.getElementById('newPass2').value = '';
}

// ===== USER POST SIMCHA =====
function userPostSimcha() {
  var family = document.getElementById('userSimchaFamily').value;
  var details = document.getElementById('userSimchaDetails').value;
  if (!family) { showToast('הזינו שם משפחה'); return; }
  var now = new Date();
  var item = {
    id: _newItemId(),
    type: document.getElementById('userSimchaType').value,
    family: family,
    details: details || 'מזל טוב!',
    date: now.getDate() + '/' + (now.getMonth()+1)
  };
  simchotData.unshift(item);
  setData('simchot', simchotData);
  renderSimchot();
  document.getElementById('userSimchaFamily').value = '';
  document.getElementById('userSimchaDetails').value = '';
  showResidentSection('inquiries');
  showToast('מזל טוב! השמחה פורסמה!');
  backendWrite('simchot', 'add', item).then(_backendSyncToast);
}

// ===== USER POST AD =====
function userPostAd() {
  var title = document.getElementById('userAdTitle').value;
  if (!title) { showToast('הזינו כותרת'); return; }
  var user = sessionStorage.getItem('ma_user');
  var sellerName = '';
  if (user) { try { sellerName = JSON.parse(user).name; } catch(e) {} }
  var item = {
    id: _newItemId(),
    title: title,
    desc: document.getElementById('userAdDesc').value,
    price: document.getElementById('userAdPrice').value || '',
    cat: document.getElementById('userAdCat').value,
    seller: sellerName || 'תושב'
  };
  marketData.unshift(item);
  setData('market', marketData);
  renderMarket();
  document.getElementById('userAdTitle').value = '';
  document.getElementById('userAdDesc').value = '';
  document.getElementById('userAdPrice').value = '';
  showResidentSection('inquiries');
  showToast('המודעה פורסמה בלוח!');
  backendWrite('market', 'add', item).then(_backendSyncToast);
}

// ===== FAMILIES MANAGEMENT =====
function addFamily() {
  var n = document.getElementById('famName').value;
  if (!n) { showToast('הזינו שם משפחה'); return; }
  allFamilies.push({
    n: n,
    p: document.getElementById('famPhone').value,
    w: document.getElementById('famWife').value,
    wp: document.getElementById('famWifePhone').value,
    a: document.getElementById('famAddr').value
  });
  allFamilies.sort(function(a,b) { return a.n.localeCompare(b.n, 'he'); });
  saveFamiliesLocal();
  document.getElementById('famName').value = '';
  document.getElementById('famPhone').value = '';
  document.getElementById('famWife').value = '';
  document.getElementById('famWifePhone').value = '';
  document.getElementById('famAddr').value = '';
  renderAdminFamilies('');
  showToast('משפחה נוספה!');
}

function saveFamiliesLocal() {
  setData('families_local', allFamilies);
}

function deleteFamily(idx) {
  var fam = allFamilies[idx];
  if (!fam) return;
  if (!confirm('למחוק את ' + (fam.n || 'המשפחה') + '?')) return;
  allFamilies.splice(idx, 1);
  saveFamiliesLocal();
  renderAdminFamilies(document.getElementById('adminFamSearch') ? document.getElementById('adminFamSearch').value : '');
  showToast('נמחק!');
}

function renderAdminFamilies(filter) {
  filter = (filter || '').toLowerCase();
  var el = document.getElementById('adminFamiliesList');
  var countEl = document.getElementById('adminFamilyCount');
  if (countEl) countEl.textContent = allFamilies.length;
  var filtered = allFamilies;
  if (filter) filtered = allFamilies.filter(function(f) { return f.n.toLowerCase().includes(filter) || (f.a||'').toLowerCase().includes(filter); });
  el.innerHTML = filtered.slice(0, 100).map(function(f) {
    var idx = allFamilies.indexOf(f);
    return '<li><div class="item-text"><div class="item-title">' + f.n + '</div><div class="item-sub">' + (f.p||'') + ' | ' + (f.w||'') + ' | ' + (f.a||'') + '</div></div><button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteFamily(' + idx + ')"><i class="bi bi-trash"></i></button></li>';
  }).join('');
  if (filtered.length > 100) el.innerHTML += '<li style="text-align:center;color:var(--text-light)">+ עוד ' + (filtered.length-100) + '...</li>';
}

function loadPhoneDir() {
  // First check local overrides
  var local = getData('families_local', null);
  if (local && local.length > 0) {
    allFamilies = local;
    renderPhoneDir('');
    return;
  }
  // Otherwise load from phones.json
  fetch('phones.json').then(function(r) { return r.json(); }).then(function(data) {
    allFamilies = data;
    renderPhoneDir('');
  }).catch(function() { renderPhoneDir(''); });
}

// ===== CMS IMAGE UPLOAD =====
// If backend is configured, uploads to Drive and stores public URL.
// Otherwise falls back to base64 data URL (existing behavior).
function handleCmsImageUpload(input, previewId) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = document.getElementById(previewId);
    if (img) { img.src = e.target.result; img.style.display = 'block'; }
    input.dataset.dataUrl = e.target.result;  // tentative — replaced by Drive URL if upload succeeds
    if (getBackendUrl()) {
      showToast('מעלה תמונה ל-Drive...');
      var body = new URLSearchParams();
      body.set('action', 'maale_upload_image');
      body.set('token', BACKEND_ADMIN_TOKEN);
      body.set('filename', file.name);
      body.set('mimeType', file.type || 'image/jpeg');
      body.set('dataBase64', e.target.result);
      fetch(getBackendUrl(), { method: 'POST', body: body })
        .then(function(r) { return r.json(); })
        .then(function(r) {
          if (r && r.ok && r.url) {
            input.dataset.dataUrl = r.url;  // use Drive URL instead of base64
            if (img) img.src = r.url;
            showToast('✓ תמונה הועלתה ל-Drive');
          } else {
            showToast('העלאה נכשלה — שומר base64: ' + (r && r.error || 'unknown'));
          }
        })
        .catch(function(err) {
          showToast('שגיאת העלאה: ' + (err.message || err));
        });
    }
  };
  reader.readAsDataURL(file);
}

// ===== SHABBAT TIMES (Hebcal API) =====
// ===== HEBREW DATE =====
function getHebrewDate() {
  // Use Hebcal converter API
  var now = new Date();
  var y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();
  return fetch('https://www.hebcal.com/converter?cfg=json&gy=' + y + '&gm=' + m + '&gd=' + d + '&g2h=1')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var hd = data.hebrew || '';
      // Display Hebrew date in header
      var el = document.getElementById('hebrewDateDisplay');
      if (el) el.textContent = hd;
      return hd;
    }).catch(function() { return ''; });
}
getHebrewDate();

function loadShabbatTimes() {
  fetch('https://www.hebcal.com/shabbat?cfg=json&geonameid=295530&m=50')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var items = data.items || [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.category === 'candles') {
          var t = item.date.split('T')[1];
          document.getElementById('candleLighting').textContent = t ? t.substring(0,5) : '';
        }
        if (item.category === 'havdalah') {
          var t2 = item.date.split('T')[1];
          document.getElementById('shabbatEnd').textContent = t2 ? t2.substring(0,5) : '';
        }
        if (item.category === 'parashat') {
          document.getElementById('shabbatParasha').textContent = item.hebrew || item.title;
        }
      }
    })
    .catch(function() {
      document.getElementById('candleLighting').textContent = '--:--';
      document.getElementById('shabbatEnd').textContent = '--:--';
      document.getElementById('shabbatParasha').textContent = 'שבת שלום';
    });
}
loadShabbatTimes();

// ===== DAILY TORAH =====
var torahQuotes = [
  {text: 'ואהבת לרעך כמוך', src: 'ויקרא י"ט, י"ח'},
  {text: 'במקום שבעלי תשובה עומדים אין צדיקים גמורים יכולים לעמוד', src: 'ברכות ל"ה:'},
  {text: 'הוי מתלמידיו של אדם', src: 'אבות דף ד:'},
  {text: 'אל תסתכל על המקום של חברך', src: 'אבות דף ב:'},
  {text: 'איזהו חכם — הלומד מכל אדם', src: 'אבות דף ד:'},
  {text: 'כל ישראל ערבים זה לזה', src: 'סנהדרין קכ:'},
  {text: 'דע לפני מי אתה עומד', src: 'אבות דף ג:'}
];
function renderDailyTorah() { /* removed per request */ }

// ===== PHONE DIRECTORY =====
var allFamilies = [];

function renderPhoneDir(filter) {
  filter = (filter || '').trim().toLowerCase();
  var grid = document.getElementById('phoneGrid');
  if (!grid) return;
  var filtered = allFamilies;
  if (filter) {
    filtered = allFamilies.filter(function(f) {
      return (f.n && f.n.toLowerCase().includes(filter)) ||
             (f.a && f.a.toLowerCase().includes(filter)) ||
             (f.w && f.w.toLowerCase().includes(filter)) ||
             (f.p && f.p.includes(filter)) ||
             (f.wp && f.wp.includes(filter));
    });
  }
  var countEl = document.getElementById('phoneCount');
  if (countEl) countEl.textContent = filtered.length + ' מתוך ' + allFamilies.length + ' משפחות';
  // Group by first letter
  var groups = {};
  filtered.forEach(function(f) {
    var letter = f.n ? f.n.charAt(0) : '?';
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(f);
  });
  var letters = Object.keys(groups).sort(function(a,b) { return a.localeCompare(b,'he'); });
  var html = '';
  if (filter) {
    // When searching, show flat list
    html = filtered.map(function(f) {
      return '<div class="phone-item"><div class="ph-icon icon-green"><i class="bi bi-house-door"></i></div><div class="ph-info"><h5>' + f.n + '</h5><p>' + (f.a || '') + (f.w ? ' | ' + f.w : '') + '</p></div><div style="text-align:left"><a href="tel:' + (f.p||'').replace(/-/g,'') + '" class="ph-num">' + (f.p||'') + '</a>' + (f.wp ? '<br><a href="tel:' + f.wp.replace(/-/g,'') + '" class="ph-num" style="font-size:0.8rem;color:var(--accent)">' + f.wp + '</a>' : '') + '</div></div>';
    }).join('');
  } else {
    // Show grouped by letter with expand
    letters.forEach(function(letter) {
      var items = groups[letter];
      var id = 'phoneGroup_' + letter.charCodeAt(0);
      html += '<div style="margin-bottom:8px"><button onclick="var el=document.getElementById(\'' + id + '\');el.style.display=el.style.display===\'none\'?\'\':\'none\';this.querySelector(\'.bi\').classList.toggle(\'bi-chevron-down\');this.querySelector(\'.bi\').classList.toggle(\'bi-chevron-left\')" style="width:100%;display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-family:Heebo;font-weight:700;font-size:1.1rem;cursor:pointer"><span style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center">' + letter + '</span> ' + items.length + ' משפחות <i class="bi bi-chevron-down" style="margin-right:auto"></i></button>';
      html += '<div id="' + id + '" style="display:none;margin-top:6px">';
      items.forEach(function(f) {
        html += '<div class="phone-item" style="margin-bottom:6px"><div class="ph-icon icon-green"><i class="bi bi-house-door"></i></div><div class="ph-info"><h5>' + f.n + '</h5><p>' + (f.a || '') + (f.w ? ' | ' + f.w : '') + '</p></div><div style="text-align:left"><a href="tel:' + (f.p||'').replace(/-/g,'') + '" class="ph-num">' + (f.p||'') + '</a>' + (f.wp ? '<br><a href="tel:' + f.wp.replace(/-/g,'') + '" class="ph-num" style="font-size:0.8rem;color:var(--accent)">' + f.wp + '</a>' : '') + '</div></div>';
      });
      html += '</div></div>';
    });
  }
  grid.innerHTML = html;
}

// ===== STREETS =====
function renderStreets() {
  var streets = [
    {name: 'יונתן בן עוזיאל', count: 34, icon: 'bi-book'},
    {name: 'רבנו בחיי', count: 27, icon: 'bi-journal-text'},
    {name: 'רש"י', count: 21, icon: 'bi-pencil'},
    {name: 'רד"ק', count: 17, icon: 'bi-pen'},
    {name: 'רמב"ן', count: 15, icon: 'bi-bookmark'},
    {name: 'רשב"ם', count: 14, icon: 'bi-journal-richtext'},
    {name: 'החזקוני', count: 13, icon: 'bi-book-half'},
    {name: 'אבן עזרא', count: 13, icon: 'bi-feather'},
    {name: 'אברבנאל', count: 11, icon: 'bi-journal-bookmark'},
    {name: 'גבעת הרוסים', count: 4, icon: 'bi-geo-alt'},
    {name: 'סמטת אונקלוס', count: 3, icon: 'bi-signpost'},
    {name: 'קרית נוף (הרחבה)', count: 0, icon: 'bi-building-add'}
  ];
  var grid = document.getElementById('streetsGrid');
  if (!grid) return;
  grid.innerHTML = streets.map(function(s) {
    return '<div style="background:#fff;border-radius:var(--radius);padding:18px;box-shadow:var(--card-shadow);text-align:center;transition:var(--transition);cursor:default" onmouseover="this.style.transform=\'translateY(-3px)\'" onmouseout="this.style.transform=\'\'"><i class="bi ' + s.icon + '" style="font-size:1.5rem;color:var(--primary);display:block;margin-bottom:8px"></i><h4 style="font-weight:700;font-size:0.95rem;margin-bottom:4px">' + s.name + '</h4>' + (s.count ? '<p style="font-size:0.8rem;color:var(--text-light);margin:0">' + s.count + ' משפחות</p>' : '<p style="font-size:0.8rem;color:var(--accent);margin:0;font-weight:600">שכונה חדשה</p>') + '</div>';
  }).join('');
}

// ===== PWA =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(function() {});
}

// (parasha section removed per request)

// ===== HERO PARTICLES =====
(function() {
  var container = document.getElementById('heroParticles');
  if (!container) return;
  for (var i = 0; i < 20; i++) {
    var p = document.createElement('div');
    p.className = 'particle';
    var size = Math.random() * 6 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 10 + 8) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    container.appendChild(p);
  }
})();

// ===== INIT =====
loadGlobalData();
renderDailyTorah();
renderStreets();
</script>
