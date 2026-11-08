/**
 * One-time import of what was in the WhatsApp group "מזדקנים" (exported 8.11.2026).
 * In the Apps Script editor pick `importWhatsAppData` and press Run — once.
 * It renames the members and adds trails, trips and expenses. If trips or trails
 * already exist it does nothing, so running it twice is safe.
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

const WA_TRIPS = [
  { name: 'רמות מנשה', status: 'done', startDate: '2026-02-13', endDate: '2026-02-13', trail: 'menashe',
    location: 'עין השופט / גוערה', lat: '32.578968', lng: '35.123795',
    notes: 'נבחר בסקר מבין 30/1, 6/2, 13/2, 20/2. יוני ואביב יצאו לסיבוב; בנג׳י לא הצליח להצטרף.\n"יש סחמניות לכולם".' },
  { name: 'נחל זויתן – שמורת יהודיה', status: 'done', startDate: '2026-08-09', endDate: '2026-08-09', trail: 'zavitan',
    location: 'חניון שמורת יהודיה, 08:00',
    notes: 'איסוף: יקנעם אזור תעשייה 07:00 / מחלף אליקים 06:50.\nכל אחד מביא גבינות, טונה, ירקות ופירות לפריסה לאורך המסלול.\n"היה כיף גדול!! כן ירבו"' },
  { name: 'נגב – לילה בנחל מדור', status: 'done', startDate: '2026-11-06', endDate: '2026-11-07', trail: 'negev',
    location: 'שער מפעל אורון (ג׳יפ ב־08:00, חזרה בשבת 16:30–17:00)',
    notes: 'איסופים: בנג׳י ביקנעם 05:30, אביב בתחנת הדלק ניר אליהו ~06:15.\nמים: 6 בקבוקים של 1.5 ליטר לכל אחד. ערב: נודלס עם תרנגולת ומדורה.\nאביב קנה את האוכל; יוני הביא גזיה וסיר; בנג׳י פקל קפה (בלי קפה…).\nהקפצת ג׳יפ: 1100 ₪ לשלושתנו – לבדוק מי שילם.' },
  { name: 'הטיול הבא – מרץ 2027', status: 'idea', startDate: '', endDate: '',
    notes: '"מצפה לטיול הבא במרץ 🙂" – צריך לנעוץ תאריך (ולא 31/2…).' },
];

// [trip name, description, amount, payer]
const WA_EXPENSES = [
  ['נגב – לילה בנחל מדור', 'דליל', '300', 'בנג׳י'],
  ['נגב – לילה בנחל מדור', 'אוכל', '350', 'אביב'],
];

function importWhatsAppData() {
  ensureSetup_();
  const members = readTable_('Members').map(function (m) { return m.name; });
  if (members.indexOf('חבר 2') >= 0) renameMember('חבר 2', 'אביב');
  if (members.indexOf('חבר 3') >= 0) renameMember('חבר 3', 'יוני');

  if (readTable_('Trips').length || readTable_('Trails').length) {
    Logger.log('There are already trips or trails, so nothing was imported.');
    return;
  }
  const trailIds = {};
  WA_TRAILS.forEach(function (t) {
    const rec = Object.assign({ createdBy: WA_BY }, t);
    delete rec.key;
    trailIds[t.key] = saveRecord('Trails', rec).id;
  });
  const tripIds = {};
  WA_TRIPS.forEach(function (t) {
    const rec = Object.assign({ createdBy: WA_BY, trailId: t.trail ? trailIds[t.trail] : '' }, t);
    delete rec.trail;
    tripIds[t.name] = saveRecord('Trips', rec).id;
  });
  WA_EXPENSES.forEach(function (e) {
    const trip = WA_TRIPS.filter(function (t) { return t.name === e[0]; })[0];
    saveRecord('Expenses', { tripId: tripIds[e[0]], date: trip.endDate, description: e[1], amount: e[2], payer: e[3], splitWith: [], createdBy: WA_BY });
  });
  Logger.log('Imported ' + WA_TRAILS.length + ' trails, ' + WA_TRIPS.length + ' trips, ' + WA_EXPENSES.length + ' expenses.');
}
