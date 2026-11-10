// MLP/SRK-99: runs early-access-apps-script/code.gs against a stand-in for Google (Sheet, Mail, Properties, Lock): no browser, no
// network, nothing is sent anywhere. Checks one row of 28 cells, the founders' email from the FOUNDER_EMAILS property (and that a failed
// email or a missing property never loses an application), and the refusals. It is NOT a test in Google: do that with the README.
//   node build/tools/check-appsscript.cjs early-access-apps-script/code.gs
const fs = require("fs"), vm = require("vm");
const code = fs.readFileSync(process.argv[2], "utf8");
let bad = 0;
const ok = (w, c, x) => { if (!c) bad++; console.log((c ? "  ok   " : "  FAIL ") + w + (x ? "  " + x : "")); };

function world({ emails, mailThrows }) {
  const rows = [], mails = [], logs = [];
  const sheet = { appendRow: (r) => rows.push(r), setFrozenRows() {}, getRange: () => ({ setWrap() { return this; }, setVerticalAlignment() { return this; }, setFontWeight() { return this; }, setNumberFormat() { return this; } }), setColumnWidth() {}, getMaxRows: () => 1000, getLastRow: () => rows.length, getName: () => "Applications" };
  let sheetExists = false;
  const ss = { getSheetByName: () => (sheetExists ? sheet : null), insertSheet: () => { sheetExists = true; return sheet; }, getName: () => "Test Sheet", getSheets: () => [sheet] };
  const ctx = {
    SpreadsheetApp: { getActiveSpreadsheet: () => ss },
    ContentService: { MimeType: { JSON: "json" }, createTextOutput(t) { return { _t: t || "", setMimeType() { return this; }, setContent(c) { this._t = c; return this; }, getContent() { return this._t; } }; } },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k === "FOUNDER_EMAILS" ? emails : null) }) },
    MailApp: { sendEmail(to, subject, body, opts) { if (mailThrows) throw new Error("quota"); mails.push({ to, subject, body, opts }); } },
    Logger: { log: (m) => logs.push(m) },
    console: { error: (m) => logs.push("E:" + m), warn: (m) => logs.push("W:" + m), log: () => {} },
  };
  vm.createContext(ctx); vm.runInContext(code, ctx);
  return { ctx, rows, mails, logs, get data() { return rows.slice(1); }, get header() { return rows[0]; } };
}
const post = (w, obj) => JSON.parse(w.ctx.doPost({ postData: { contents: typeof obj === "string" ? obj : JSON.stringify(obj) } }).getContent());
const answers = () => { const a = {}; for (let i = 1; i <= 27; i++) a["q" + i] = "a" + i; a.q8 = "Test\nPerson"; a.q9 = "test@example.com"; a.q10 = "09000000000"; a.q13 = "Test Valuers"; a.q15 = ["Site engineers", "Office staff"]; a.q27 = "=1+1"; return a; };

let w = world({ emails: "one@example.invalid, two@example.invalid", mailThrows: false });
let r = post(w, { timestamp_iso: "2026-11-10T10:00:00Z", form_version: "x", answers: answers() });
ok("a good application answers ok", r.ok === true);
ok("a header row of 28 headings is made once, then one data row of 28 cells (time + 27 answers)", w.header.length === 28 && w.header[0] === "sent_at" && w.data.length === 1 && w.data[0].length === 28, w.header.length + " / " + (w.data[0] && w.data[0].length));
ok("the time is first", w.data[0][0] === "2026-11-10T10:00:00Z");
ok("a tick-all list is joined with ' | '", w.data[0][15] === "Site engineers | Office staff");
ok("=1+1 is kept as text, a phone number keeps its zero", w.data[0][27] === "=1+1" && w.data[0][10] === "09000000000");
ok("one email, to both addresses from the property", w.mails.length === 1 && w.mails[0].to === "one@example.invalid,two@example.invalid", w.mails[0] && w.mails[0].to);
ok("subject has the name (on one line) and the firm", w.mails[0].subject === "Maulya early access: Test Person (Test Valuers)", w.mails[0].subject);
ok("the body has all 27 questions with answers", (w.mails[0].body.match(/^\d+\. /gm) || []).length === 27 && w.mails[0].body.includes("  Site engineers | Office staff"));
ok("Reply goes to the applicant", w.mails[0].opts.replyTo === "test@example.com");
ok("the health check shows nothing from the Sheet", (() => { const g = JSON.parse(w.ctx.doGet({}).getContent ? w.ctx.doGet({}).getContent() : "{}"); return g.ok === true && g.service === "maulya-early-access" && Object.keys(g).sort().join() === "form,ok,service,ts"; })());

w = world({ emails: "", mailThrows: false });
r = post(w, { answers: answers() });
ok("no FOUNDER_EMAILS: the row is still written, no email, still ok", r.ok === true && w.data.length === 1 && w.mails.length === 0 && w.logs.some((l) => /No FOUNDER_EMAILS/.test(l)));

w = world({ emails: "one@example.invalid", mailThrows: true });
r = post(w, { answers: answers() });
ok("a failing email never loses the application: row written, still ok", r.ok === true && w.data.length === 1 && w.logs.some((l) => /^E:Founders email failed/.test(l)));

w = world({ emails: "one@example.invalid", mailThrows: false });
ok("an empty body is refused and writes nothing", (() => { const o = JSON.parse(w.ctx.doPost({}).getContent()); return o.ok === false && w.data.length === 0 && w.mails.length === 0; })());
ok("bad JSON is refused and sends no email", (() => { const o = post(w, "{nope"); return o.ok === false && w.data.length === 0 && w.mails.length === 0; })());
ok("an oversize request is refused", (() => { const o = post(w, JSON.stringify({ answers: { q27: "x".repeat(61000) } })); return o.ok === false && w.data.length === 0; })());
r = post(w, { answers: { ...answers(), q27: "y".repeat(5000) } });
ok("a long answer is cut at 2000 characters", w.data[0][27].length === 2000);
ok("a bad reply-to address is not used", (() => { const w2 = world({ emails: "one@example.invalid", mailThrows: false }); post(w2, { answers: { ...answers(), q9: "not an email" } }); return w2.mails.length === 1 && w2.mails[0].opts.replyTo === undefined; })());
ok("the repo's code.gs has no email address in it", !/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(code.replace(/\^\[\^\s@,;<>\]\+@\[\^\s@,;<>\]\+\\.\[\^\s@,;<>\]\+\$/, "")));
console.log(bad ? `\n${bad} FAILED` : "\nall passed");
process.exit(bad ? 1 : 0);
