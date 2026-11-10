#!/usr/bin/env node
// MLP/ARK-719, rewritten for MLP/SRK-99: compares the early-access page's words with the founder's content file
// (EARLY_ACCESS_FORM_CONTENT.md, kept beside this project), by script. Run after any edit to src/pages/early-access-apply.mjs or
// early-access-apps-script/code.gs, and after `node build/build.mjs`:
//
//   node build/tools/check-apply.mjs [path to EARLY_ACCESS_FORM_CONTENT.md]
//
// It reads the file, expands its shared sentences (VISIT, RATE, CALC, INVOICE, TRACK), applies its "Updates of 10 Nov"
// (the Email hint, the consent line, the line after the intro, the new district question) and compares, one by one:
//   the heading, intro, start line, consent line, button, confirmation; the five parts and their lines; all 27 questions
//   (text, kind, hint, options, the "Other" box); every reply under every answer, and the two "tick all" replies' headings and lines.
// It checks them in the page's source AND in what the build shipped (the JSON and the HTML in dist/live/early-access/apply/).
// It also checks that code.gs has one column per question, in the form's order; that the Privacy page has the founder's
// early-access line; that the form's own words are the same in the built page; and that the founder's name and photo appear
// on no page but About (in the live build and the preview). It prints every difference; "No differences." is the goal.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CONTENT = process.argv[2] || path.join(ROOT, "EARLY_ACCESS_FORM_CONTENT.md");
const md = fs.readFileSync(CONTENT, "utf8").split(/\r?\n/);
const mod = await import(pathToFileURL(path.join(ROOT, "src/pages/early-access-apply.mjs")).href);
const require = createRequire(import.meta.url);
const contract = require("./contract.cjs"); // the server contract, typed separately from the page (MLP/SRK-99 addendum 1)
const waitlistPhase = (await import(pathToFileURL(path.join(ROOT, "site.config.mjs")).href)).default.earlyAccess.phase === "waitlist"; // the build's phase decides which start line is expected
const diffs = [];
let checked = 0;
const eq = (what, got, want) => { checked++; if (got !== want) diffs.push(`${what}\n    page:     ${JSON.stringify(got)}\n    approved: ${JSON.stringify(want)}`); };

// ---- the content file
const consts = {};
for (const l of md) { const m = l.match(/called (VISIT|RATE|CALC|INVOICE|TRACK): "(.+)"$/); if (m) consts[m[1]] = m[2]; }
eq("shared sentences found", Object.keys(consts).sort().join(","), "CALC,INVOICE,RATE,TRACK,VISIT");

const field = (label) => { const l = md.find((x) => x.startsWith(`**${label}`)); return l ? l.replace(/^\*\*[^*]+\*\*\s*/, "") : null; };
const quoted = (re) => { const l = md.find((x) => re.test(x)); const m = l && l.match(/"(.*)"/); return m ? m[1] : null; };
const heading = field("Heading:");
const button = field("Button:");
const confLine = field("After sending (the confirmation):");
const consent = (quoted(/\*\*The consent box\*\* reads/) || "").replace(/ \*$/, "");
const startLine = quoted(/\*\*A line after the intro:\*\*/);
const emailHint = (md.find((x) => /\*\*Under "Email"\*\*, the hint is/.test(x)) || "").match(/the hint is "(.*)"/)?.[1];
const whatsapp = (md.find((x) => /\*\*The support WhatsApp\*\*/.test(x)) || "").match(/(\d{5} \d{5})/)?.[1];
const privacyLine = quoted(/\*\*The Privacy page's early-access line:\*\*/);
const introStart = md.findIndex((x) => x.startsWith("**Intro:**"));
const intro = [];
for (let i = introStart + 1; i < md.length && (md[i].startsWith(">") || md[i] === ""); i++) if (md[i].startsWith(">") && md[i].replace(/^>\s?/, "").trim()) intro.push(md[i].replace(/^>\s?/, ""));

const expectParts = [];
let curPart = null, curQ = null, n = 0;
const expectQ = {};
const expandReply = (after) => {
  const m = after.match(/^\*\*(.+?)\*\*\s*(.*)$/);
  const pieces = m[2] ? m[2].split(" + ") : [];
  return { bold: m[1], rest: pieces.map((p) => (/^[A-Z]+$/.test(p) ? consts[p] : p.replace(/^"(.*)"$/, "$1"))).join(" ") };
};
const startQ = (num, text, what, rest) => {
  n = num || n + 1;
  curQ = { n, text, kind: what.startsWith("pick") ? "one" : what.startsWith("tick") ? "many" : what.startsWith("optional") ? "para" : "text", options: [], head: "", hint: "", other: /"Other" opens/.test(what) };
  const hint = what.match(/hint "(.*)"/); if (hint) curQ.hint = hint[1];
  const head = rest.match(/heading is \*\*(.*?)\*\*/); if (head) curQ.head = head[1];
  const list = rest.match(/^:\s*(.+)$/); if (list) curQ.options = list[1].split(" / ").map((label) => ({ label }));
  expectQ[n] = curQ; curPart.qs.push(curQ);
};
for (let i = 0; i < md.length; i++) {
  const l = md[i];
  let m = l.match(/^#### Part (\d) of 5 · (.+)$/);
  if (m) { curPart = { title: m[2], sub: md[i + 1].replace(/^\*|\*$/g, ""), qs: [] }; expectParts.push(curPart); curQ = null; continue; }
  if (!curPart) continue;
  // a question led in bold: **1. text** (pick one) / **text** (tick all; "Other" opens ...). The reply's heading is **...** / **text** (optional; a paragraph)
  m = l.match(/^\*\*(?:(\d+)\. )?(.+?)\*\* \((pick one|tick all[^)]*|optional[^)]*)\)(.*)$/);
  if (m) { startQ(m[1] && +m[1], m[2], m[3], m[4]); continue; }
  // a question in a list (Parts 2 and 3): - Text (pick one): a / b  or  - Text (text; hint "...")  or  - **Text (pick one): a / b** (new, 10 Nov)
  if (l.startsWith("- ")) {
    const body = l.slice(2).replace(/\*\*/g, "").replace(/ \(new, 10 Nov\)$/, "");
    if (!body.includes(" → ")) {
      m = body.match(/^(.+?) \((pick one|tick all|text[^)]*)\)(?::\s*(.*))?$/);
      if (m) { startQ(0, m[1], m[2], m[3] ? ": " + m[3] : ""); continue; }
    }
  }
  if (curQ && l.startsWith("- ") && l.includes(" → ")) {
    const [labels, after] = l.slice(2).split(" → ");
    if (curQ.kind === "many") { if (!/^no line\.?$/.test(after)) curQ.options.push({ label: labels, line: after }); }
    else for (const label of labels.split(" / ")) curQ.options.push({ label, reply: expandReply(after) });
  }
}
const nQuestions = n;
// "Text questions in a list" have their options in the bullet itself; tick-all questions' options come from the reply lines (above)

// ---- the page's source
eq("heading", mod.HEADING, heading);
eq("consent", mod.CONSENT, consent);
eq("start line", mod.START_LINE, startLine);
eq("button", mod.SEND, button);
// SRK-101 (the founder, Tue 10 Nov 15:06): ONE confirmation for both ways of sending, "Thank you. You're on the waiting list." + the file's own line
eq("confirmation (one constant; the founder's 15:06 answer, word for word)", mod.CONFIRMATION, "Thank you. You're on the waiting list. We read every application and reply to everyone within a week, chosen or not.");
eq("confirmation ends with the content file's line", mod.CONFIRMATION.endsWith(" " + confLine), true);
eq("there is no second confirmation constant", "CONFIRMATION_SERVER" in mod, false);
eq("waiting-list heading (the founder, 15:06)", mod.HEADING_WAITLIST, "Join Maulya's waiting list");
eq("'Why is it free?' paragraph (approved 15:06, word for word)", mod.WHY_FREE, "Why is it free? We want honest feedback from real valuation offices. Maulya is free for the firms we choose until 28 December. We do not ask for a card or any payment, and your firm's files and data stay your firm's own.");
eq("support WhatsApp", mod.SUPPORT_WHATSAPP, whatsapp);
eq("sending-not-open line names the WhatsApp", mod.SAYS.notOpen.includes(whatsapp), true);
eq("failed-send line names the WhatsApp", mod.SAYS.failed.includes(whatsapp), true);
eq("intro, paragraphs", mod.INTRO.length, intro.length);
intro.forEach((t, i) => eq(`intro paragraph ${i + 1}`, mod.INTRO[i], t));
eq("parts", mod.PARTS.length, expectParts.length);
expectParts.forEach((p, i) => {
  const g = mod.PARTS[i]; if (!g) return;
  eq(`part ${i + 1} title`, g.title, p.title); eq(`part ${i + 1} line`, g.sub, p.sub);
  eq(`part ${i + 1} questions`, g.questions.map((q) => q.n).join(","), p.qs.map((q) => q.n).join(","));
});
eq("number of questions in the file", nQuestions, 27);
eq("number of questions on the page", mod.QUESTIONS.length, 27);
eq("the Email hint (Question 9)", (mod.QUESTIONS.find((q) => q.n === 9) || {}).hint, emailHint);
let replies = 0;
for (const q of mod.QUESTIONS) {
  const e = expectQ[q.n];
  if (!e) { diffs.push(`question ${q.n} is not in the content file`); continue; }
  eq(`Q${q.n} text`, q.text, e.text);
  eq(`Q${q.n} kind`, q.type, e.kind);
  eq(`Q${q.n} hint`, q.hint || "", e.hint);
  eq(`Q${q.n} Other box`, !!q.other, !!e.other);
  eq(`Q${q.n} optional`, !!q.optional, e.kind === "para");
  eq(`Q${q.n} options`, (q.options || []).map((o) => o.label).join(" | "), e.options.map((o) => o.label).join(" | "));
  if (q.type === "many" && q.replyHead !== undefined) eq(`Q${q.n} reply heading`, q.replyHead, e.head);
  (q.options || []).forEach((o, i) => {
    const w = e.options[i]; if (!w) return;
    if (e.kind === "many") { if (w.line) replies++; eq(`Q${q.n} "${o.label}" line`, o.reply, w.line); }
    else { const wr = w.reply || { bold: undefined, rest: undefined }; if (w.reply) replies++; eq(`Q${q.n} "${o.label}" bold`, o.reply && o.reply.bold, wr.bold); eq(`Q${q.n} "${o.label}" rest`, o.reply && o.reply.rest, wr.rest); }
  });
}
// the new district question: Part 3, straight after "Bank files per month", pick one, no reply
const dq = mod.QUESTIONS.find((q) => q.text === "How many districts do you work in?");
eq("districts question is Q17, straight after Bank files per month", dq && dq.n, 17);
eq("districts question follows Bank files per month", (mod.QUESTIONS[15] || {}).text, "Bank files per month");
eq("districts options", dq && dq.options.map((o) => o.label).join(" | "), "1 | 2–3 | 4–6 | More than 6");
eq("districts has no reply message", dq && dq.options.every((o) => !o.reply), true);

// ---- what the build shipped
const shipped = path.join(ROOT, "dist/live/early-access/apply/index.html");
if (!fs.existsSync(shipped)) diffs.push("dist/live/early-access/apply/index.html is missing: run node build/build.mjs first");
else {
  const html = fs.readFileSync(shipped, "utf8");
  const un = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  const data = JSON.parse(html.match(/<script type="application\/json" id="apply-data">(.*?)<\/script>/)[1]);
  for (const [num, e] of Object.entries(expectQ)) {
    if (e.kind !== "one" && e.kind !== "many") continue;
    const d = data[num];
    if (!d) { diffs.push(`shipped data has no question ${num}`); continue; }
    eq(`shipped Q${num} options`, d.options.map((o) => o.label).join(" | "), e.options.map((o) => o.label).join(" | "));
    if (e.kind === "many") {
      eq(`shipped Q${num} heading`, d.head, e.head);
      e.options.forEach((w, i) => eq(`shipped Q${num} "${w.label}" line`, (d.options[i].reply && d.options[i].reply.line) || undefined, w.line));
    } else e.options.forEach((w, i) => { const wr = w.reply || { bold: undefined, rest: undefined }; eq(`shipped Q${num} "${w.label}" bold`, d.options[i].reply ? d.options[i].reply.bold : undefined, wr.bold); eq(`shipped Q${num} "${w.label}" rest`, d.options[i].reply ? d.options[i].reply.rest : undefined, wr.rest); });
  }
  const textOf = (s) => un(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ");
  const has = (what, t) => eq(`page shows ${what}`, textOf(html).includes(t.replace(/\s+/g, " ")), true);
  has(waitlistPhase ? "the waiting-list heading (phase waitlist)" : "the heading", waitlistPhase ? mod.HEADING_WAITLIST : heading);
  eq("the page's h1 is the heading of this phase", textOf((html.match(/<h1>(.*?)<\/h1>/) || [])[1] || ""), waitlistPhase ? mod.HEADING_WAITLIST : heading);
  eq("the page's <title> starts with the heading of this phase", un(((html.match(/<title>(.*?)<\/title>/) || [])[1] || "")).startsWith(waitlistPhase ? mod.HEADING_WAITLIST : heading), true);
  has("the consent line", consent); has(waitlistPhase ? "the waiting-list start line (phase waitlist)" : "the start line", waitlistPhase ? mod.WAITLIST_LINE : startLine); has("the button", button);
  has("the 'why it is free' draft", mod.WHY_FREE);
  intro.forEach((t, i) => has(`intro ${i + 1}`, t));
  has("the confirmation", mod.CONFIRMATION); has("the email hint", emailHint);
  eq("the shipped data carries the one confirmation and no second one", data.says.confirm === mod.CONFIRMATION && !("confirmServer" in data.says), true);
  for (const p of expectParts) { has(`"${p.title}"`, p.title); has("its line", p.sub); for (const q of p.qs) has(`question ${q.n}`, `${q.n}. ${q.text}`); }
  for (const [num, e] of Object.entries(expectQ)) for (const o of e.options) eq(`page has a button "${o.label}" (Q${num})`, html.includes(`>${o.label.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}</button>`), true);
  eq("every question has its own wrapper id (the missing list links to it)", [...html.matchAll(/id="qw(\d+)"/g)].map((m) => +m[1]).join(","), Array.from({ length: 27 }, (_, i) => i + 1).join(","));
  eq("the trap field 'website' is hidden from people and screen readers", /<div class="hp" aria-hidden="true"><input type="text" id="website" name="website" value="" tabindex="-1" autocomplete="off" \/><\/div>/.test(html), true);
  eq("the apply page loads the shared visit script with apply_view", /<script src="\/assets\/visit\.js\?v=[^"]+" id="ea-visit" defer data-api-base="https:\/\/app\.maulya\.in" data-send-to="(sheet|server)" data-event="apply_view"><\/script>/.test(html), true);
  eq("the apply page names no tracker", /google-analytics|googletagmanager|gtag\(|fbq\(|doubleclick|plausible|hotjar/i.test(html), false);
}
for (const [f, ev] of [["dist/live/early-access/index.html", "ea_view"], ["dist/live/survey/index.html", "site_survey_view"]]) {
  const fp = path.join(ROOT, f);
  if (!fs.existsSync(fp)) { diffs.push(f + " is missing: run node build/build.mjs first"); continue; }
  const h = fs.readFileSync(fp, "utf8");
  eq(`${f} loads the shared visit script with ${ev}`, new RegExp(`<script src="/assets/visit\\.js\\?v=[^"]+" id="ea-visit" defer data-api-base="https://app\\.maulya\\.in" data-send-to="(sheet|server)" data-event="${ev}"></script>`).test(h), true);
  eq(`${f} names no tracker`, /google-analytics|googletagmanager|gtag\(|fbq\(|doubleclick|plausible|hotjar/i.test(h), false);
}

// ---- the server contract (addendum 1) and the two addendum-2 lines: the page's table against contract.cjs, and the fixed words
eq("server network-error/5xx line (addendum 1)", mod.SAYS.failedServer, "Not sent. Your answers are still on this screen. Please try again, or WhatsApp 99801 40777.");
eq("waiting-list start line (addendum 2)", mod.WAITLIST_LINE, "The first group is full. Join the waiting list and we'll write when places open.");
{
  const covered = new Set();
  for (const q of mod.QUESTIONS) {
    const rule = contract.APPLICATION[q.key];
    if (!rule) { diffs.push(`Q${q.n}: key "${q.key}" is not in the server contract`); continue; }
    covered.add(q.key); if (q.keyOther) covered.add(q.keyOther);
    if (q.options && q.options.length && q.type !== "text") {
      const want = (rule.one || rule.many || []).filter((v) => v !== "other");
      eq(`Q${q.n} (${q.key}) values, in the page's option order`, q.options.map((o) => o.v).join("|"), want.join("|"));
      eq(`Q${q.n} (${q.key}) is ${rule.one ? "pick one" : "tick all"} in the contract`, q.type, rule.one ? "one" : "many");
      if (q.other) { eq(`Q${q.n} allows "other" in the contract`, (rule.many || []).includes("other"), true); eq(`Q${q.n} other-text key`, q.keyOther in contract.APPLICATION, true); eq(`Q${q.n} other-text limit`, q.otherMax, contract.APPLICATION[q.keyOther].text); }
    } else if (rule.text !== undefined) eq(`Q${q.n} (${q.key}) text limit`, q.max, rule.text);
    eq(`Q${q.n} (${q.key}) is required exactly as in the contract`, !q.optional, !rule.optional);
  }
  eq("every contract key is covered by a question (or is an other-text key)", Object.keys(contract.APPLICATION).filter((k) => !covered.has(k)).join(","), "");
  eq("27 keys + 2 other-text keys in the contract", Object.keys(contract.APPLICATION).length, 29);
}

// ---- the Privacy page: the founder's early-access line, shipped
const priv = path.join(ROOT, "dist/live/privacy/index.html");
if (fs.existsSync(priv)) {
  const ph = fs.readFileSync(priv, "utf8").replace(/&#39;/g, "'");
  eq("privacy page has the early-access line", ph.includes(privacyLine), true);
  // SRK-101 (the founder, 15:06): one more line, directly after it, word for word
  const countLine = "Visits to the early-access pages are counted with a random number kept only in your browser tab, with no cookie, and sent only to Maulya's own server. We use no analytics or advertising tracker.";
  eq("privacy page has the visit-counting line directly after the early-access line", ph.includes(`${privacyLine}</li>\n        <li>${countLine}</li>`), true);
} else diffs.push("dist/live/privacy/index.html is missing: run node build/build.mjs first");

// ---- the Sheet script
const gs = fs.readFileSync(path.join(ROOT, "early-access-apps-script/code.gs"), "utf8");
const cols = [...gs.matchAll(/^\s+\["(q\d+)", "(.*)"\],?$/gm)].map((m) => [m[1], JSON.parse(`"${m[2]}"`)]);
eq("code.gs columns", cols.map((c) => c[0]).join(","), mod.QUESTIONS.map((q) => "q" + q.n).join(","));
cols.forEach((c, i) => { const q = mod.QUESTIONS[i]; if (q) eq(`code.gs heading for Q${q.n}`, c[1], `${q.n}. ${q.text}`); });
eq("code.gs has no email address in it", /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(gs.replace(/\^\[\^\\s@,;<>\]\+@\[\^\\s@,;<>\]\+\\\.\[\^\\s@,;<>\]\+\$/, "")), false);
const readme = fs.readFileSync(path.join(ROOT, "early-access-apps-script/README.md"), "utf8");
eq("README.md names FOUNDER_EMAILS and the Web app steps", ["FOUNDER_EMAILS", "Execute as:** Me", "Who has access:** Anyone"].every((s) => readme.includes(s)), true);

// ---- the founder's name and photo: About only (the live build and the preview)
const walk = (d) => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]) : [];
for (const base of ["dist/live", "dist/preview"]) {
  for (const f of walk(path.join(ROOT, base)).filter((x) => /\.(html|xml)$/.test(x))) {
    const rel = path.relative(path.join(ROOT, base), f).replace(/\\/g, "/");
    if (rel === "about/index.html" || rel.endsWith("/about/index.html")) continue;
    const t = fs.readFileSync(f, "utf8");
    eq(`${base}/${rel}: no founder name or photo`, /Shrinivas|founders\/shrinivas/i.test(t), false);
  }
}

console.log(`Compared ${checked} things (${replies} replies) with ${path.basename(CONTENT)}.`);
if (diffs.length) { console.log(`${diffs.length} DIFFERENCE(S):\n` + diffs.map((d) => "  - " + d).join("\n")); process.exit(1); }
else console.log("No differences.");
