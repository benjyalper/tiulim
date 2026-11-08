/**
 * Import of what was in the WhatsApp groups (exported 8.11.2026):
 *   "מזדקנים", "טיול זקנים למכתש" (Ramon crater, March 2022) and
 *   "טיול זקנים ל…" (Upper Galilee, April 2021), plus the full "מזדקנים" export with media (2020–2026).
 * In the Apps Script editor pick `importWhatsAppData` and press Run.
 * It renames the members and adds trails, trips, expenses and photos.
 * Anything that already exists (same name) is skipped, so running it again is safe.
 */

const WA_BY = 'ייבוא מוואטסאפ';

const WA_TRAILS = [
  { key: 'menashe', name: 'רמות מנשה – עין השופט / גלעד', region: 'רמות מנשה', lat: '32.578968', lng: '35.123795',
    notes: 'כניסה לשטח בין עין השופט לגוערה (ממש לפני גוערה כשמגיעים מעין השופט). תכנון: 2 רכבים, בגלעד ובעין השופט. בפברואר ירוק מאוד וחלק מהנחלים זורמים.' },
  { key: 'zavitan', name: 'נחל זויתן – שמורת יהודיה', region: 'גולן',
    notes: 'כל המסלולים יוצאים וחוזרים לחניון שמורת יהודיה (נפתחת ב־08:00). הגעה למים בנקודות, חלקים חשופים לשמש. לפחות 3 ליטר מים, סנדלים לחציות. המסלול הארוך כולל את בריכת המשושים.' },
  { key: 'tzalmon', name: 'נחל צלמון תחתון', region: 'גליל תחתון', lengthKm: '8.5',
    mapUrl: 'https://familytrips.co.il/%D7%A0%D7%97%D7%9C-%D7%A6%D7%9C%D7%9E%D7%95%D7%9F-%D7%AA%D7%97%D7%AA%D7%95%D7%9F-%D7%9E%D7%A1%D7%9C%D7%95%D7%9C-%D7%9E%D7%99%D7%9D-%D7%9E%D7%A9%D7%A4%D7%97%D7%AA%D7%99-%D7%A9%D7%97%D7%96%D7%A8-%D7%9C/',
    notes: 'מצומת צלמון עד מגדל. הזרמה של מי המוביל הארצי – מים לאורך כל המסלול (רעיון של יוני, אוגוסט 2026).' },
  { key: 'kibbutzim', name: 'נחל הקיבוצים', region: 'עמק המעיינות', durationHrs: '2',
    notes: 'מסלול מים, בעיקר שחייה, כשעתיים. אביב היה שם באוגוסט 2026: "ממליץ בחום!"' },
  { key: 'ein_moda', name: 'עין מודע (ליד רשפים)', region: 'עמק המעיינות',
    notes: 'אביב היה שם ביולי 2026: "פגז. נקי." רעיון למפגש משפחות – פיקניק, ערסלים, מים. עדיף ביום חול.' },
  { key: 'tzeelim', name: 'נחל צאלים', region: 'מדבר יהודה',
    notes: 'יוני שלח תמונה בדצמבר 2025 כשהנחל זרם – "פכפוך עדין וקסום".' },
  { key: 'negev', name: 'נחל מדור – גב זרחן – הר רכב – נחל צין – נחל טרף / נחל שרף', region: 'נגב (מפעל אורון)',
    mapUrl: 'https://mapeak.com/share/veKHFCMY4U',
    notes: 'יום 1: הקפצה בג׳יפ משער מפעל אורון לחניון לילה נחל מדור, משם לגב זרחן, הר רכב, נחל צין ולכיוון נחל טרף.\nיום 2: ממשיכים במעלה נחל טרף וחוזרים דרך נחל שרף, או דרך קצרה יותר לנחל שרף ויורדים בו. הקפצה חזרה למפעל אורון.\nהקפצת ג׳יפ: 1100 ₪ לשלושתנו, מזומן לנהג. משאירים את הרכב ליד ש.ג.' },
];

WA_TRAILS.push(
  { key: 'ramon', name: 'מכתש רמון – מפער נקרות, גב חולית, נחל קמאי, הר ארדון (3 ימים)', region: 'מכתש רמון',
    notes: 'יום 1: הקפצה מחניון בארות למפער נקרות. משם דרך כרבולת חרירים ועין גלד לחניון גב חולית (לילה 1).\nיום 2: נחל קמאי תחתון לכיוון הערוצים העליונים של נחל אנמר. לינה באזור פרשת המים אנמר–קמאי (מזרחית להר ארדון).\nיום 3: נחל קמאי עליון, ירידה בהר ארדון והליכה לחניון בארות.\nלוגיסטיקה: הקפצה 500 ₪; הטמנת מים בגב חולית (10 ₪ לליטר, ~4.5 ליטר לאדם ליום כולל בישול – 40 ליטר לארבעה); הטמנת עצים ללילה בגב חולית. ביום 1 – 3 ליטר למסלול.' });

WA_TRAILS.push(
  { key: 'galil', name: 'גליל עליון – חרבת חממה, נחל צבעון, נחל דישון, נחל אביב (יומיים)', region: 'גליל עליון', lengthKm: '20',
    notes: 'כיוון ההליכה צפונה.\nיום 1 (~7 ק״מ, בעיקר ירידה בשביל נוח): מתחילים בחרבת חממה ויורדים בנחל צבעון. לינה באזור עין פועה, סמוך למפגש עם נחל גוש חלב.\nיום 2 (~13 ק״מ, רובו ירידה): ממשיכים בנחל דישון ומסיימים בעלייה בנחל אביב.\n"מסלולי משפחות, לא קשים במיוחד." עד ~6 שעות הליכה ביום. 5 ליטר מים ליום. אפשר לקצר בקטעים שליד הכביש (העלייה ליראון רק מאריכה).' });

WA_TRAILS.push(
  { key: 'ramon_east', name: 'מכתש רמון ממזרח – חניון בארות, הר ארדון (3 ימים)', region: 'מכתש רמון',
    notes: 'התוכנית של יוני: להחנות בחניון בארות, לצאת מזרחה, להקיף מצפון־מזרח ולרדת בהר ארדון. חצי יום בחמישי, שישי מלא, שבת עד הצהריים. 2 לילות בשטח.\n5–6 ליטר מים לאדם ליום; הצעה להטמנת מים אחת או שתיים.' },
  { key: 'ramon_loop', name: 'סובב מכתש רמון – 3 ימים (12 / 15 / 13 ק״מ)', region: 'מכתש רמון', lengthKm: '40',
    notes: 'אופציה ב׳ שנבחרה: יום 1 – 12 ק״מ, יום 2 – 15 ק״מ, יום 3 – 13 ק״מ. דורש הקפצה חזרה לרכב (450 ₪), הטמנת מים.\nאופציה א׳ שנדחתה: ראש מעלה לוץ והר עריף (13.5 / 19 / 16 ק״מ).' },
  { key: 'amud', name: 'נחל עמוד', region: 'גליל עליון',
    notes: 'טיול מים – יוני הציע: "אולי נחל עמוד יהיה מתאים".' },
  { key: 'zaki', name: 'הזאכי – מסלול מים', region: 'צפון הכנרת',
    notes: 'הליכה ושחייה בנחל, חלקים על חלוקים וסלעים וחלקים בשחייה. "המסלול במים ארוך יותר ויהיו פחות אנשים" – יוני.\nלהביא: סנדלים, בגד ים, מגבת, כובע, מים, חולצה יבשה. חלופה שנשקלה: עמק המעיינות (ניר דוד).' },
  { key: 'bustan', name: 'עין הוד – נחל בוסתן – שביל ישראל', region: 'כרמל', lengthKm: '10.5', lat: '32.702213', lng: '34.983128',
    notes: 'סיבוב בכרמל: מעין הוד לנחל בוסתן וחזרה דרך שביל ישראל, כ־10.5 ק״מ. אפשר להשאיר רכב אחד קרוב יותר אם המסלול מתארך.' });

// Trail ideas from the full "מזדקנים" history (2020–2025)
WA_TRAILS.push(
  {key: "idea0", name: "אצבע הגליל – יומיים־שלושה עם מים זורמים", region: "אצבע הגליל", notes: "רעיון מהקבוצה – בנג׳י, 24.7.2020: \"לדעתי כיוון צפון, אצבע הגליל, שתי לילות, מים זורמים וירוק, ולסיים אצל כהן באמירים או בידפת\""},
  {key: "idea1", name: "טרק מון בלאן", region: "חו״ל – האלפים", notes: "רעיון מהקבוצה – אביב, 24.7.2020: \"סטנדרט סביר לטיול 40 זה טראק במון בלאן\""},
  {key: "idea2", name: "צפון יוון", region: "חו״ל – יוון", notes: "רעיון מהקבוצה – יוני, 24.7.2020: \"נתפשר על צפון יוון השנה...\""},
  {key: "idea3", name: "קיאקים בבטיחה – הירדן, הזאכי והמג׳רסה", region: "צפון הכנרת", notes: "רעיון מהקבוצה – יוני, 30.7.2020: \"כל האזור בין הירדן לזאכי ולמג'רסה מוצף ואפשר לעשות שם קייקים כמו בג'ונגל\""},
  {key: "idea4", name: "דרום מדבר יהודה / מכתשי הנגב / ערבה תיכונה (עין ירקעם)", region: "נגב ומדבר יהודה", notes: "רעיון מהקבוצה – יוני, 28.11.2020: \"אני עדיין בודק עוד 2 אופציות - בדרום מדבר יהודה או במכתשי מרכז הנגב\""},
  {key: "idea5", name: "גליל מערבי – נחל בצת, שרך עליון, אבירים, כזיב", region: "גליל מערבי", notes: "רעיון מהקבוצה – יוני, 17.4.2021: \"ממשיכים בנחל שרך עליון, שהוא נחל לא מסומן שאנשים לא הולכים בו, עם תחושה של גונג'ל... אפשר גם לשמור אותו יותר לקיץ\""},
  {key: "idea6", name: "צפון הגולן", region: "גולן", notes: "רעיון מהקבוצה – יוני, 30.3.2021: \"הר מירון או צפון הגולן?\""},
  {key: "idea8", name: "סיני – ההר הגבוה", region: "חו״ל – סיני", notes: "רעיון מהקבוצה – אביב, 23.12.2021: \"סיני, ההר הגבוה..?\""},
  {key: "idea11", name: "איסלנד בחורף – קרח, אש וזוהר צפוני", region: "חו״ל – איסלנד", mapUrl: "https://medraft.co.il/trip/%d7%a7%d7%a8%d7%97-%d7%90%d7%a9-%d7%95%d7%96%d7%95%d7%94%d7%a8-%d7%a6%d7%a4%d7%95%d7%a0%d7%99-%d7%90%d7%99%d7%a1%d7%9c%d7%a0%d7%93-%d7%91%d7%97%d7%95%d7%a8%d7%a3/", notes: "רעיון מהקבוצה – אביב, 15.2.2022: \"טיול 40.... ? 🤔\""},
  {key: "idea12", name: "מסלול במכתש (כתבה ב־ynet)", region: "מכתש רמון", mapUrl: "https://www.ynet.co.il/vacation/israeltrips/article/bjxvicchc?utm_source=ynet.app.ios&utm_term=bjxvicchc&utm_campaign=general_share&utm_medium=social&utm_content=Header", notes: "רעיון מהקבוצה – בנג׳י, 7.5.2022: \"זה רק אני או שנראה שהוא פספס את כל המכתש?\""},
  {key: "idea13", name: "צפון הנגב – ניצנה, כביש 10", region: "נגב מערבי", notes: "רעיון מהקבוצה – בנג׳י, 29.8.2022: \"צפון הנגב, ניצנה, כביש 10 , אזור שווה?\""},
  {key: "idea14", name: "ראש מעלה לוץ והר עריף (3 ימים)", region: "הר הנגב", lengthKm: "48.5", notes: "רעיון מהקבוצה – יוני, 25.10.2022: \"אופציה 1 - ראש מעלה לוץ והר עריף (13.5/19/16 ק\"מ)\""},
  {key: "idea15", name: "טרק בטג׳יקיסטן", region: "חו״ל – טג׳יקיסטן", mapUrl: "https://www.eco.co.il/trip/%d7%98%d7%a8%d7%a7-%d7%91%d7%98%d7%92%d7%99%d7%a7%d7%99%d7%a1%d7%98%d7%9f/", notes: "רעיון מהקבוצה – יוני, 27.5.2023: \"או מי רוצה שנארגן כזה לעצמנו שנה הבאה בחצי מחיר?\""},
  {key: "idea17", name: "רכס רמים", region: "גליל עליון", notes: "רעיון מהקבוצה – בנג׳י, 7.3.2024: \"שמעתי שרכס רמים יפה בתקופה הזו\""},
  {key: "idea18", name: "נחל עיט ונחל סמך", region: "גולן", notes: "רעיון מהקבוצה – אביב (המלצת בוטקה), 3.4.2024: \"בוטקה היה עכשיו בנחל עיט וסמך בגולן. המליץ בחום.\""},
  {key: "idea19", name: "עמק המעיינות – ניר דוד (מסלול במים)", region: "עמק המעיינות", notes: "רעיון מהקבוצה – יוני, 8.5.2024: \"הכי טוב יהיה עמק המעיינות - אזור ניר דוד. יש שם מסלול במים\""},
  {key: "idea21", name: "נחל אשלים", region: "מדבר יהודה", notes: "רעיון מהקבוצה, 14.3.2025: \"נחל אשלים זה טוב?\" – בנג׳י; \"נחל אשלים זה תמיד טוב\" – יוני"},
  {key: "idea23", name: "פסגות ואגמים בפירנאים", region: "חו״ל – פירנאים", mapUrl: "https://medraft.co.il/?p=3756", notes: "רעיון מהקבוצה – אביב, 10.7.2025: \"אולי לגיל 50...?\""});

const WA_TRIPS = [
  { name: 'רמות מנשה', status: 'done', startDate: '2026-02-13', endDate: '2026-02-13', trail: 'menashe',
    location: 'עין השופט / גוערה', lat: '32.578968', lng: '35.123795',
    notes: 'נבחר בסקר מבין 30/1, 6/2, 13/2, 20/2. יוני ואביב יצאו בבוקר, ובנג׳י חבר אליהם בשטח בצהריים (הגיע ב־12:05).\n"יש סחמניות לכולם".' },
  { name: 'נחל זויתן – שמורת יהודיה', status: 'done', startDate: '2026-08-09', endDate: '2026-08-09', trail: 'zavitan',
    location: 'חניון שמורת יהודיה, 08:00',
    notes: 'איסוף: יקנעם אזור תעשייה 07:00 / מחלף אליקים 06:50.\nכל אחד מביא גבינות, טונה, ירקות ופירות לפריסה לאורך המסלול.\n"היה כיף גדול!! כן ירבו"' },
  { name: 'נגב – לילה בנחל מדור', status: 'done', startDate: '2026-11-06', endDate: '2026-11-07', trail: 'negev',
    location: 'שער מפעל אורון (ג׳יפ ב־08:00, חזרה בשבת 16:30–17:00)',
    notes: 'איסופים: בנג׳י ביקנעם 05:30, אביב בתחנת הדלק ניר אליהו ~06:15.\nמים: 6 בקבוקים של 1.5 ליטר לכל אחד. ערב: נודלס עם תרנגולת ומדורה.\nאביב קנה את האוכל; יוני הביא גזיה וסיר; בנג׳י פקל קפה (בלי קפה…).\nהקפצת ג׳יפ: 1100 ₪ לשלושתנו – לבדוק מי שילם.' },
  { name: 'מכתש רמון – 3 ימים', status: 'done', startDate: '2022-03-10', endDate: '2022-03-12', trail: 'ramon',
    location: 'חניון בארות (הקפצה ב־09:45)',
    notes: 'משתתפים: בנג׳י, אביב, יוני וגלעד (חבר של אורית). דותן ויתר בגלל פציעה.\nיציאה ב־05:30 מבנג׳י, ~06:45 מאביב בכפר סבא, ברכב של גלעד (אאוטלנדר).\nיוני תכנן את המסלול וקנה את האוכל (תפריט בתמונות). גזיה אחת עם בלון מלא, בלי ערכת ע״ר.\nסגירת תקציב: 360 ₪ לאדם, הועבר ליוני.\nאלבום משותף: https://photos.app.goo.gl/KLp6ceREGWqjigGXA\n"היה מעולה!"' },
  { name: 'גליל עליון – צבעון, דישון ואביב', status: 'done', startDate: '2021-04-23', endDate: '2021-04-24', trail: 'galil',
    location: 'חרבת חממה, 11:00', lat: '33.008911', lng: '35.393562',
    notes: 'הטיול הראשון של הקבוצה. משתתפים: בנג׳י, אביב, יוני, גיא (חבר של בנג׳י) וכהן.\nמסיימים בנחל אביב – לכבוד יום ההולדת של אביב.\nאביב אסף את בנג׳י ממגדים; ארבעה רכבים.\nקניות: 345 ₪ (בנג׳י), 50 ₪ מכל אחד בביט – "1+1=3".\nמיקומים שבנג׳י שלח ביום היציאה: 33.008911, 35.393562 ואחר כך "בואו לפה" – 33.082539, 35.459522.\n"תודה רבה לכולם. היה ממש מעולה"' },
  { name: 'מכתש רמון ממזרח – דצמבר 2020', status: 'done', startDate: '2020-12-03', endDate: '2020-12-05', trail: 'ramon_east',
    location: 'חניון בארות',
    notes: 'הטיול הרב־יומי הראשון של שלושתנו. המסלול סוכם בשיחת ועידה ב־1/12.\nיוני עבר תאונת דרכים יום לפני, אז עשינו קניות יחד ב־3/12. רכב אחד (יוני אוסף).\nאוהלים: ליוני שני אוהלים של 2 ק״ג; התיק של בנג׳י ~15 ק״ג לפני אוכל ומים.\n"פעם ראשונה מאז גיל 22 שאני צועד עם ציוד על הגב ומקווה לקבוע את המועד הבא מיד בסוף הטיול הזה 😉" – בנג׳י' },
  { name: 'סובב מכתש רמון – דצמבר 2022', status: 'done', startDate: '2022-12-01', endDate: '2022-12-03', trail: 'ramon_loop',
    location: 'מכתש רמון (הקפצה חזרה לרכב)',
    notes: 'נבחרה אופציה ב׳ – "סגור – נלך על אופציה ב׳" (יוני). הצטרפו גם בוטקה וגיא.\nהקפצה: 450 ₪. הטמנת מים. "יאללה. תכינו מעילי פוך" – יוני.\nהתאריכים (1–3/12) משוערים – לתקן אם צריך.' },
  { name: 'נחל עמוד – יוני 2023', status: 'done', startDate: '2023-06-09', endDate: '2023-06-10', trail: 'amud',
    notes: 'טיול מים של בנג׳י ויוני – אביב לא הגיע (יום הולדת וטיסה). שישי מלא וחזרה בשבת בבוקר.\n"אלמן פעם הבאה אין תירוצים!" – יוני. "וואו! נראה כיף." – אביב' },
  { name: 'הזאכי – מאי 2024', status: 'done', startDate: '2024-05-10', endDate: '2024-05-10', trail: 'zaki',
    location: 'צומת יהודיה, 09:00 (בנג׳י ואביב נפגשים ב־08:10 ביוקנעם)',
    notes: 'הלו״ז של יוני: 09:00–10:00 ארוחת בוקר למרגלות הזאכי; 10:00–14:00 המסלול ורביצה במים; 14:00–16:00 המבורגר במושבוצ (מושב רמות).\nבנג׳י – פק״ל קפה, יוני – כוסות ונעלי צפרדעים לאביב. חמסין; הייתה התראה על זיהום ("אני לא מאמין להם" – יוני).' },
  { name: 'עין הוד – נחל בוסתן', status: 'done', startDate: '2025-03-07', endDate: '2025-03-07', trail: 'bustan',
    location: 'הכניסה לעין הוד, 08:15', lat: '32.702213', lng: '34.983128',
    notes: 'כ־10.5 ק״מ בכרמל. "תביאו מטריות...." – יוני.\nסיום בארוחת ערב בדוניה רוסה בעין הוד (17:30).\nמיקומים מהדרך: 32.702213, 34.983128 (בבוקר) ו־32.701683, 34.996548 (בצהריים).\n"פעם שאלתי עץ – \'עץ, איך זה להיות עץ?\'" – אביב, באמצע הטיול' },
  { name: 'הטיול הבא – מרץ 2027', status: 'idea', startDate: '', endDate: '',
    notes: '"מצפה לטיול הבא במרץ 🙂" – צריך לנעוץ תאריך (ולא 31/2…).' },
];

// [trip name, description, amount, payer]
const WA_EXPENSES = [
  ['נגב – לילה בנחל מדור', 'דליל', '300', 'בנג׳י'],
  ['נגב – לילה בנחל מדור', 'אוכל', '350', 'אביב'],
];

// Photos taken straight out of a WhatsApp export ZIP that is in Drive: { file in zip: caption }
const WA_PHOTOS = [
  // Unzipped "טיול זקנים למכתש" folder: only the route maps and the menu (the rest are Waze screenshots).
  { trip: 'מכתש רמון – 3 ימים', folderId: '1awJ9zKOy0Ioo9dCizbc952fRqJPPuwmU', only: [12, 15, 26],
    by: function () { return 'יוני'; },
    captions: { 12: 'מפת המסלול – בירוק הקפצה, בצהוב הליכה', 15: 'מפת המסלול – יום 1', 26: 'התפריט' } },
  // Unzipped export folder in Drive: every photo in it is added (captions by WhatsApp file number).
  { trip: 'גליל עליון – צבעון, דישון ואביב', folderId: '1FP0LJYxcN27J18apJCil2ZTLAXD075Zm',
    by: function (n) { return n >= 98 && n <= 131 ? 'גיא' : 'בנג׳י'; },
    captions: { 3: 'מפת המסלול', 4: 'מפת המסלול', 26: 'רשימת ציוד (חורף)', 96: 'היה ממש נורא 😉', 151: 'כרוב אלמוגים' } },
  // "מזדקנים" export with media (unzipped in Drive): photos and videos picked by the date in the file name.
  { trip: 'רמות מנשה', folderId: '1CRNyiU5WefBmc1AVwg4h7dVgcnYTErDE', dates: ['2026-02-13'],
    by: function () { return 'בנג׳י'; }, captions: {} },
  { trip: 'נחל זויתן – שמורת יהודיה', folderId: '1CRNyiU5WefBmc1AVwg4h7dVgcnYTErDE', dates: ['2026-08-09'],
    by: function (n, d, hm) { return hm < '21:00' ? 'אביב' : 'בנג׳י'; }, captions: {} },
  { trip: 'נגב – לילה בנחל מדור', folderId: '1CRNyiU5WefBmc1AVwg4h7dVgcnYTErDE', dates: ['2026-11-04', '2026-11-05', '2026-11-07'],
    by: function (n, d, hm) {
      if (d === '2026-11-04') return 'יוני';
      if (d === '2026-11-05') return 'אביב';
      return hm < '12:00' ? 'בנג׳י' : hm < '22:00' ? 'אביב' : 'יוני';
    },
    captions: { 2236: 'רשימת האוכל מהפעם הקודמת', 2264: 'ארוחת ערב', 2281: 'מספיק לנו? (שמן זית)' } },
  // Older trips from the full "מזדקנים" export (2020–2025): picked by WhatsApp file number.
  { trip: 'מכתש רמון ממזרח – דצמבר 2020', folderId: '1CRNyiU5WefBmc1AVwg4h7dVgcnYTErDE', only: [140, 141, 142, 157, 163, 171],
    by: function (n) { return n >= 157 ? 'בנג׳י' : 'יוני'; }, captions: {} },
  { trip: 'גליל עליון – צבעון, דישון ואביב', folderId: '1CRNyiU5WefBmc1AVwg4h7dVgcnYTErDE', only: [277, 278, 281],
    by: function () { return 'יוני'; }, captions: { 277: 'אופציות למסלול', 278: 'אופציות למסלול', 281: 'אופציות למסלול' } },
  { trip: 'מכתש רמון – 3 ימים', folderId: '1CRNyiU5WefBmc1AVwg4h7dVgcnYTErDE', only: [468, 558, 575],
    by: function () { return 'יוני'; }, captions: {} },
  { trip: 'סובב מכתש רמון – דצמבר 2022', folderId: '1CRNyiU5WefBmc1AVwg4h7dVgcnYTErDE', only: [776, 777, 778, 780, 781, 782, 824],
    by: function () { return 'יוני'; }, captions: { 776: 'אופציות למסלול', 777: 'אופציות למסלול', 778: 'אופציות למסלול', 780: 'אופציות למסלול', 781: 'אופציות למסלול', 782: 'אופציות למסלול' } },
  { trip: 'נחל עמוד – יוני 2023', folderId: '1CRNyiU5WefBmc1AVwg4h7dVgcnYTErDE', only: [886, 887],
    by: function () { return 'יוני'; }, captions: {} },
  { trip: 'עין הוד – נחל בוסתן', folderId: '1CRNyiU5WefBmc1AVwg4h7dVgcnYTErDE', only: [1451],
    by: function () { return 'יוני'; }, captions: { 1451: 'מפת המסלול' } },
];

function seedPhoto_(tripId, file, caption, by) {
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (err) {}
  saveRecord('Photos', { tripId: tripId, fileId: file.getId(), caption: caption || '', takenBy: by || '' });
}

function importWhatsAppData() {
  ensureSetup_();
  const members = readTable_('Members').map(function (m) { return m.name; });
  if (members.indexOf('חבר 2') >= 0) renameMember('חבר 2', 'אביב');
  if (members.indexOf('חבר 3') >= 0) renameMember('חבר 3', 'יוני');

  const byName = function (table) {
    const o = {};
    readTable_(table).forEach(function (r) { o[r.name] = r.id; });
    return o;
  };
  const trails = byName('Trails'), trips = byName('Trips'), added = { trails: 0, trips: 0, expenses: 0, photos: 0 };
  const trailIds = {};
  WA_TRAILS.forEach(function (t) {
    if (trails[t.name]) { trailIds[t.key] = trails[t.name]; return; }
    const rec = Object.assign({ createdBy: WA_BY }, t);
    delete rec.key;
    trailIds[t.key] = saveRecord('Trails', rec).id;
    added.trails++;
  });
  const newTrips = {};
  WA_TRIPS.forEach(function (t) {
    if (trips[t.name]) return;
    const rec = Object.assign({ createdBy: WA_BY, trailId: t.trail ? trailIds[t.trail] : '' }, t);
    delete rec.trail;
    newTrips[t.name] = saveRecord('Trips', rec).id;
    added.trips++;
  });
  WA_EXPENSES.forEach(function (e) {
    if (!newTrips[e[0]]) return;
    const trip = WA_TRIPS.filter(function (t) { return t.name === e[0]; })[0];
    saveRecord('Expenses', { tripId: newTrips[e[0]], date: trip.endDate, description: e[1], amount: e[2], payer: e[3], splitWith: [], createdBy: WA_BY });
    added.expenses++;
  });
  const have = {};
  readTable_('Photos').forEach(function (r) { have[r.fileId] = true; });
  WA_PHOTOS.forEach(function (p) {
    const tripId = newTrips[p.trip] || trips[p.trip];
    if (!tripId) return;
    if (p.folderId) {
      let files = [];
      try {
        const it = DriveApp.getFolderById(p.folderId).getFiles();
        while (it.hasNext()) {
          const f = it.next(), name = f.getName();
          if (p.dates) {
            // WhatsApp names: 00002291-PHOTO-2026-11-07-11-56-24.jpg (GIFs, stickers and voice notes are skipped)
            const m = name.match(/^\d+-(PHOTO|VIDEO)-(\d{4}-\d\d-\d\d)-(\d\d)-(\d\d)/);
            if (m && p.dates.indexOf(m[2]) >= 0) files.push(f);
          } else if (/^image\//.test(f.getMimeType()) && (!p.only || p.only.indexOf(parseInt(name, 10)) >= 0)) files.push(f);
        }
      } catch (err) { Logger.log('Could not open the photo folder for "' + p.trip + '": ' + err); return; }
      files.sort(function (a, b) { return a.getName() < b.getName() ? -1 : 1; });
      files.forEach(function (f) {
        if (have[f.getId()]) return;
        have[f.getId()] = true;
        const name = f.getName(), n = parseInt(name, 10);
        const m = name.match(/-(\d{4}-\d\d-\d\d)-(\d\d)-(\d\d)/) || [];
        seedPhoto_(tripId, f, p.captions[n], p.by(n, m[1], m[2] + ':' + m[3]));
        added.photos++;
      });
      return;
    }
    let blobs = [];
    try { blobs = Utilities.unzip(DriveApp.getFileById(p.zipId).getBlob().setContentType('application/zip')); }
    catch (err) { Logger.log('Could not open the ZIP for "' + p.trip + '": ' + err); return; }
    blobs.forEach(function (b) {
      const name = String(b.getName()).split('/').pop();
      if (!(name in p.files)) return;
      const file = folder_(PHOTOS_FOLDER).createFile(b.setContentType('image/jpeg').setName(name));
      seedPhoto_(tripId, file, p.files[name], p.by);
      added.photos++;
    });
  });
  Logger.log('Added ' + added.trails + ' trails, ' + added.trips + ' trips, ' + added.expenses + ' expenses, ' + added.photos + ' photos.');
}
