/**
 * Maulya early-access applications: Google Apps Script web app (MLP/ARK-719)
 * ============================================================================
 * Built like survey-apps-script/code.gs. It WRITES ONLY: it appends one row per application and never sends a row
 * back to the browser (doGet answers a health check and nothing from the Sheet).
 *
 * The page it serves: /early-access/apply/ on maulya.in (src/pages/early-access-apply.mjs, src/assets/apply.js).
 * The approved form: 26 questions, each answer one column, in the form's order, plus the time it was sent.
 *
 * SETUP (once, in Google, with the Google account that will hold the Sheet; ARK does this with chat #31B):
 *
 *  1. Make a new Google Sheet (name it, for example, "Maulya early-access applications").
 *     In it: Extensions > Apps Script. Paste this whole file over the default code. Save.
 *
 *  2. Deploy > New deployment > type Web app:
 *       Execute as:      Me
 *       Who has access:  Anyone          <- needed, so the page can send without a sign-in
 *     Deploy, and authorise when Google asks.
 *
 *  3. Copy the Web app URL. It must contain /macros/s/ and end with /exec.
 *     (Never a /macros/library/ or /macros/edit address.)
 *
 *  4. Paste it into projects/maulya.in/site.config.mjs as earlyAccess.appsScriptUrl, run `node build/build.mjs`,
 *     and upload the new zip (3_DEPLOY card). While that setting is empty the page tells the visitor that nothing was sent.
 *
 *  5. Open the URL in a browser: it must show {"ok":true,"service":"maulya-early-access", ...}.
 *     Then, in the editor, run testSheet once (it writes nothing) and check the log names your Sheet.
 *
 *  6. After any change to this file: Deploy > Manage deployments > edit > New version. Edits do not reach a live
 *     deployment by themselves.
 *
 * CORS: the page sends Content-Type: text/plain (a "simple" request), because a web app does not answer a preflight.
 *
 * What it keeps out of the Sheet: nothing is stored but the answers and the time. No IP, no browser details, no page address.
 * Text is cut to a sensible length, and every cell is plain text (so "=..." is never a formula and a phone number keeps its zeros).
 */

var SHEET_NAME = 'Applications';
var FORM_VERSION = 'early-access-2026-11-10';
var MAX_CELL = 2000;

// The columns, in the form's order: [the key the page sends, the heading]. Keep in step with the form
// (build/tools/check-apply.mjs compares this list with the page's questions).
var COLUMNS = [
  ["q1", "1. Have you ever lost a bank's next file because a report went out late after the site visit?"],
  ["q2", "2. How long does one report take, from the site visit to the signed report?"],
  ["q3", "3. When a land rate changes, how long does it take to update the whole report?"],
  ["q4", "4. Has a calculation mistake ever reached a bank or a client, or nearly?"],
  ["q5", "5. Have you lost a payment because a client said \"I'll pay in two days\" and it slipped?"],
  ["q6", "6. How do you make your invoices today?"],
  ["q7", "7. How do you track a file from the first call to the payment: visit, documents, report, hand-over, money?"],
  ["q8", "8. Full name"],
  ["q9", "9. Email"],
  ["q10", "10. WhatsApp number"],
  ["q11", "11. City or district, and state"],
  ["q12", "12. Years in practice as a valuer"],
  ["q13", "13. Firm name"],
  ["q14", "14. How many people work on valuation files?"],
  ["q15", "15. Who is in your team?"],
  ["q16", "16. Bank files per month"],
  ["q17", "17. How many nationalised banks are you empanelled with?"],
  ["q18", "18. How many other banks and lenders are you empanelled with (co-operative banks, private banks, NBFCs)?"],
  ["q19", "19. Property types you value most"],
  ["q20", "20. How do you make reports now?"],
  ["q21", "21. What takes the most time in a file?"],
  ["q22", "22. What would make a tool worth paying for?"],
  ["q23", "23. Will you use Maulya on your real bank files for six weeks?"],
  ["q24", "24. Would you be comfortable with a quick call every 2–3 days, for an update or your feedback?"],
  ["q25", "25. Site visits are done on"],
  ["q26", "26. Anything else we should know?"]
];

function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  var lock = LockService.getScriptLock();
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error('Empty request body');
    if (e.postData.contents.length > 60000) throw new Error('Request too large');
    var payload = JSON.parse(e.postData.contents);
    var answers = payload.answers || {};

    lock.waitLock(20000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      var head = ['sent_at'].concat(COLUMNS.map(function (c) { return c[1]; }));
      sheet.appendRow(head);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, head.length).setWrap(true).setVerticalAlignment('top').setFontWeight('bold');
      sheet.setColumnWidth(1, 200);
      sheet.getRange(1, 1, sheet.getMaxRows(), head.length).setNumberFormat('@'); // plain text, every cell
    }

    var row = [cell(payload.timestamp_iso || new Date().toISOString())];
    for (var i = 0; i < COLUMNS.length; i++) row.push(cell(answers[COLUMNS[i][0]]));
    sheet.appendRow(row);

    output.setContent(JSON.stringify({ ok: true }));
  } catch (err) {
    output.setContent(JSON.stringify({ ok: false, error: String(err && err.message || err) }));
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
  return output;
}

// One answer as one cell: a list becomes "a | b | c"; long text is cut
function cell(v) {
  if (v === undefined || v === null) return '';
  var s = Object.prototype.toString.call(v) === '[object Array]' ? v.join(' | ') : String(v);
  return s.substring(0, MAX_CELL);
}

// Health check only: it never reads the Sheet. Open the /exec address in a browser to see it.
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'maulya-early-access', form: FORM_VERSION, ts: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run by hand in the Apps Script editor to check the Sheet is the right one. It writes nothing.
function testSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  Logger.log('Spreadsheet: ' + ss.getName());
  Logger.log('Sheet: ' + sheet.getName() + ' | rows so far: ' + sheet.getLastRow());
}
