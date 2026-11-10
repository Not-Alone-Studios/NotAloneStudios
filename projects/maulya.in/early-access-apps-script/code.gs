/**
 * Maulya early-access applications: Google Apps Script web app (MLP/ARK-719, extended by MLP/SRK-99)
 * ============================================================================
 * Built like survey-apps-script/code.gs. It WRITES ONLY: it appends one row per application to the Sheet, emails the
 * founders that application, and never sends a row back to the browser (doGet answers a health check and nothing
 * from the Sheet).
 *
 * The page it serves: /early-access/ on maulya.in (src/pages/early-access.mjs, src/assets/apply.js).
 * The form: 27 questions, each answer one column, in the form's order, plus the time it was sent.
 *
 * SETUP: see README.md beside this file (Sheet, paste this file, the founders' emails in Script properties, deploy as a
 * Web app: Execute as Me, Who has access Anyone, paste the /exec address into site.config.mjs, rebuild, upload).
 *
 * THE FOUNDERS' EMAIL ADDRESSES ARE NOT IN THIS FILE OR IN THE REPO. They are read from the script's own Script properties:
 *   FOUNDER_EMAILS   one or more addresses, separated by commas
 * If the property is empty, the row is still written and no email is sent (the log says so).
 *
 * CORS: the page sends Content-Type: text/plain (a "simple" request), because a web app does not answer a preflight.
 *
 * What it keeps out of the Sheet: nothing is stored but the answers and the time. No IP, no browser details, no page address.
 * Text is cut to a sensible length, and every cell is plain text (so "=..." is never a formula and a phone number keeps its zeros).
 */

var SHEET_NAME = 'Applications';
var FORM_VERSION = 'early-access-2026-11-10-27q';
var MAX_CELL = 2000;
var EMAILS_PROPERTY = 'FOUNDER_EMAILS';

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
  ["q17", "17. How many districts do you work in?"],
  ["q18", "18. How many nationalised banks are you empanelled with?"],
  ["q19", "19. How many other banks and lenders are you empanelled with (co-operative banks, private banks, NBFCs)?"],
  ["q20", "20. Property types you value most"],
  ["q21", "21. How do you make reports now?"],
  ["q22", "22. What takes the most time in a file?"],
  ["q23", "23. What would make a tool worth paying for?"],
  ["q24", "24. Will you use Maulya on your real bank files for six weeks?"],
  ["q25", "25. Would you be comfortable with a quick call every 2–3 days, for an update or your feedback?"],
  ["q26", "26. Site visits are done on"],
  ["q27", "27. Anything else we should know?"]
];

function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  var lock = LockService.getScriptLock();
  var row = null;
  var written = false;
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

    row = [cell(payload.timestamp_iso || new Date().toISOString())];
    for (var i = 0; i < COLUMNS.length; i++) row.push(cell(answers[COLUMNS[i][0]]));
    sheet.appendRow(row);
    written = true;

    output.setContent(JSON.stringify({ ok: true }));
  } catch (err) {
    output.setContent(JSON.stringify({ ok: false, error: String(err && err.message || err) }));
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
  // The email is sent after the row is safely written and after the lock is released. If the email fails the application
  // is still in the Sheet and the visitor still sees "sent": a failed email never loses an application.
  if (written) {
    try { emailFounders(row); } catch (mailErr) { console.error('Founders email failed: ' + mailErr); }
  }
  return output;
}

// One answer as one cell: a list becomes "a | b | c"; long text is cut
function cell(v) {
  if (v === undefined || v === null) return '';
  var s = Object.prototype.toString.call(v) === '[object Array]' ? v.join(' | ') : String(v);
  return s.substring(0, MAX_CELL);
}

// The founders' addresses, from Script properties (Project Settings > Script properties > FOUNDER_EMAILS). Never in the code.
function founderEmails() {
  var raw = PropertiesService.getScriptProperties().getProperty(EMAILS_PROPERTY) || '';
  return raw.split(',').map(function (a) { return a.trim(); }).filter(function (a) { return a.length > 0; });
}

// One plain-text email per application: who it is, then every question with the answer. Nothing is sent to the applicant.
function emailFounders(row) {
  var to = founderEmails();
  if (!to.length) { console.warn('No ' + EMAILS_PROPERTY + ' in Script properties: the application is in the Sheet, no email was sent.'); return; }
  var name = oneLine(row[8]) || 'someone';          // column 8 of the row is q8, "Full name" (column 0 is the time)
  var firm = oneLine(row[13]);                       // q13, "Firm name"
  var subject = 'Maulya early access: ' + name + (firm ? ' (' + firm + ')' : '');
  var lines = ['A new early-access application, sent ' + row[0], ''];
  for (var i = 0; i < COLUMNS.length; i++) {
    lines.push(COLUMNS[i][1]);
    lines.push('  ' + (row[i + 1] || '(no answer)'));
    lines.push('');
  }
  lines.push('It is also in the Sheet "' + SHEET_NAME + '", in the last row.');
  var options = { name: 'Maulya applications' };
  var applicantEmail = oneLine(row[9]);              // q9, "Email": lets a founder press Reply to write to the applicant
  if (/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(applicantEmail)) options.replyTo = applicantEmail;
  MailApp.sendEmail(to.join(','), subject.substring(0, 150), lines.join('\n'), options);
}

// A value on one line only (it goes into an email subject)
function oneLine(v) { return String(v === undefined || v === null ? '' : v).replace(/[\r\n]+/g, ' ').trim(); }

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
  Logger.log('Founder emails set: ' + founderEmails().length + ' address(es)');
}

// Run by hand once: it asks Google for permission to send email, then sends ONE test message to FOUNDER_EMAILS.
// It writes nothing to the Sheet and is not an application.
function testEmail() {
  var to = founderEmails();
  if (!to.length) { Logger.log('Set FOUNDER_EMAILS in Script properties first (Project Settings > Script properties).'); return; }
  MailApp.sendEmail(to.join(','), 'Maulya early access: test message', 'This is a test from the early-access script. No application was received.', { name: 'Maulya applications' });
  Logger.log('Test message sent to ' + to.length + ' address(es).');
}
