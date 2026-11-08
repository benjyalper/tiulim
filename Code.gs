/**
 * הטיולים שלנו — Google Apps Script backend.
 * Bound to the Google Sheet that stores all the data.
 * Sheets (tabs) are created automatically on first run. Don't rename them.
 */

const TABLES = {
  Trips:       ['id', 'name', 'status', 'startDate', 'endDate', 'trailId', 'location', 'lat', 'lng', 'notes', 'createdBy', 'createdAt'],
  Trails:      ['id', 'name', 'region', 'lengthKm', 'difficulty', 'durationHrs', 'lat', 'lng', 'mapUrl', 'gpxFileId', 'notes', 'createdBy', 'createdAt'],
  Expenses:    ['id', 'tripId', 'date', 'description', 'amount', 'payer', 'splitWith', 'createdBy', 'createdAt'],
  Photos:      ['id', 'tripId', 'fileId', 'caption', 'takenBy', 'createdAt'],
  DateOptions: ['id', 'tripId', 'date', 'votes', 'createdAt'],
  Members:     ['name'],
};

const DEFAULT_MEMBERS = ['בנג׳י', 'חבר 2', 'חבר 3'];
const PHOTOS_FOLDER = 'תמונות';
const GPX_FOLDER = 'קבצי GPX';

/* ---------- Web app entry ---------- */

function doGet() {
  ensureSetup_();
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('הטיולים שלנו')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Run once from the editor to authorize and create the tabs. */
function setup() {
  ensureSetup_();
  folder_(PHOTOS_FOLDER);
  folder_(GPX_FOLDER);
}

/* ---------- Helpers ---------- */

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }

function ensureSetup_() {
  const ss = ss_();
  Object.keys(TABLES).forEach(function (name) {
    if (ss.getSheetByName(name)) return;
    const sh = ss.insertSheet(name);
    const head = TABLES[name];
    sh.getRange('A:Z').setNumberFormat('@'); // keep everything as plain text
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
    sh.setFrozenRows(1);
    if (name === 'Members') {
      sh.getRange(2, 1, DEFAULT_MEMBERS.length, 1).setValues(DEFAULT_MEMBERS.map(function (m) { return [m]; }));
    }
  });
  // Remove the empty default tab if it's still there.
  ['Sheet1', 'גיליון1'].forEach(function (n) {
    const s = ss.getSheetByName(n);
    if (s && s.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s);
  });
}

function sheet_(name) {
  if (!TABLES[name]) throw new Error('Unknown table: ' + name);
  return ss_().getSheetByName(name);
}

function folder_(name) {
  const parents = DriveApp.getFileById(ss_().getId()).getParents();
  const parent = parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function cell_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return v === null || v === undefined ? '' : String(v);
}

function readTable_(name) {
  const vals = sheet_(name).getDataRange().getValues();
  const head = vals.shift() || [];
  return vals
    .filter(function (r) { return r[0] !== ''; })
    .map(function (r) {
      const o = {};
      head.forEach(function (h, i) { o[h] = cell_(r[i]); });
      return o;
    });
}

function findRow_(sh, id) {
  const ids = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getValues();
  for (let i = 1; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 1;
  return -1;
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function toCell_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

/* ---------- API used by the page ---------- */

function getData() {
  ensureSetup_();
  return {
    members: readTable_('Members').map(function (m) { return m.name; }),
    trips: readTable_('Trips'),
    trails: readTable_('Trails'),
    expenses: readTable_('Expenses'),
    photos: readTable_('Photos'),
    dateOptions: readTable_('DateOptions'),
    photosFolderUrl: folder_(PHOTOS_FOLDER).getUrl(),
    sheetUrl: ss_().getUrl(),
  };
}

/** Insert (no id) or update (with id) a row. Returns the saved object. */
function saveRecord(table, obj) {
  if (table === 'Members') throw new Error('Use renameMember');
  return withLock_(function () {
    const sh = sheet_(table);
    const head = TABLES[table];
    if (!obj.id) {
      obj.id = Utilities.getUuid().slice(0, 8);
      obj.createdAt = new Date().toISOString();
      sh.appendRow(head.map(function (h) { return toCell_(obj[h]); }));
      return obj;
    }
    const row = findRow_(sh, obj.id);
    if (row < 0) throw new Error('Record not found');
    const current = sh.getRange(row, 1, 1, head.length).getValues()[0];
    const merged = head.map(function (h, i) { return h in obj ? toCell_(obj[h]) : current[i]; });
    sh.getRange(row, 1, 1, head.length).setValues([merged]);
    return obj;
  });
}

function deleteRecord(table, id) {
  return withLock_(function () {
    const sh = sheet_(table);
    if (table === 'Photos' || table === 'Trails') {
      const rec = readTable_(table).filter(function (r) { return r.id === id; })[0];
      const fid = rec && (rec.fileId || rec.gpxFileId);
      if (fid) { try { DriveApp.getFileById(fid).setTrashed(true); } catch (e) {} }
    }
    const row = findRow_(sh, id);
    if (row > 0) sh.deleteRow(row);
    if (table === 'Trips') {
      ['Expenses', 'Photos', 'DateOptions'].forEach(function (t) {
        const s = sheet_(t);
        const vals = s.getDataRange().getValues();
        const col = TABLES[t].indexOf('tripId');
        for (let i = vals.length - 1; i >= 1; i--) {
          if (String(vals[i][col]) === String(id)) {
            if (t === 'Photos') { try { DriveApp.getFileById(vals[i][2]).setTrashed(true); } catch (e) {} }
            s.deleteRow(i + 1);
          }
        }
      });
    }
    return true;
  });
}

function vote(optionId, member, value) {
  return withLock_(function () {
    const sh = sheet_('DateOptions');
    const row = findRow_(sh, optionId);
    if (row < 0) throw new Error('Date option not found');
    const col = TABLES.DateOptions.indexOf('votes') + 1;
    let votes = {};
    try { votes = JSON.parse(sh.getRange(row, col).getValue() || '{}'); } catch (e) {}
    if (value) votes[member] = value; else delete votes[member];
    sh.getRange(row, col).setValue(JSON.stringify(votes));
    return votes;
  });
}

function renameMember(oldName, newName) {
  newName = String(newName || '').trim();
  if (!newName) throw new Error('Empty name');
  return withLock_(function () {
    const swap = function (t, fn) {
      const s = sheet_(t);
      const vals = s.getDataRange().getValues();
      for (let i = 1; i < vals.length; i++) vals[i] = fn(vals[i]);
      if (vals.length > 1) s.getRange(1, 1, vals.length, vals[0].length).setValues(vals);
    };
    swap('Members', function (r) { if (r[0] === oldName) r[0] = newName; return r; });
    swap('Expenses', function (r) {
      const p = TABLES.Expenses.indexOf('payer'), sw = TABLES.Expenses.indexOf('splitWith');
      if (r[p] === oldName) r[p] = newName;
      try {
        const list = JSON.parse(r[sw] || '[]').map(function (m) { return m === oldName ? newName : m; });
        r[sw] = JSON.stringify(list);
      } catch (e) {}
      return r;
    });
    swap('DateOptions', function (r) {
      const c = TABLES.DateOptions.indexOf('votes');
      try {
        const v = JSON.parse(r[c] || '{}');
        if (oldName in v) { v[newName] = v[oldName]; delete v[oldName]; r[c] = JSON.stringify(v); }
      } catch (e) {}
      return r;
    });
    swap('Photos', function (r) { const c = TABLES.Photos.indexOf('takenBy'); if (r[c] === oldName) r[c] = newName; return r; });
    return true;
  });
}

/** dataUrl: "data:image/jpeg;base64,...." (already resized by the page) */
function uploadPhoto(tripId, dataUrl, filename, caption, member) {
  const m = String(dataUrl).match(/^data:([^;]+);base64,(.*)$/);
  if (!m) throw new Error('Bad image data');
  const blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], filename || 'photo.jpg');
  const file = folder_(PHOTOS_FOLDER).createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
  return saveRecord('Photos', { tripId: tripId, fileId: file.getId(), caption: caption || '', takenBy: member || '' });
}

function uploadGpx(trailId, text, filename) {
  const file = folder_(GPX_FOLDER).createFile(filename || 'track.gpx', text, 'application/gpx+xml');
  saveRecord('Trails', { id: trailId, gpxFileId: file.getId() });
  return file.getId();
}

function getGpx(fileId) {
  return DriveApp.getFileById(fileId).getBlob().getDataAsString();
}

/** Follow short links (maps.app.goo.gl, goo.gl/maps) so the page can read coordinates. */
function resolveLink(url) {
  let current = url;
  for (let i = 0; i < 4; i++) {
    try {
      const r = UrlFetchApp.fetch(current, { followRedirects: false, muteHttpExceptions: true });
      const h = r.getHeaders();
      const loc = h.Location || h.location;
      if (!loc) break;
      current = loc;
    } catch (e) { break; }
  }
  return current;
}
