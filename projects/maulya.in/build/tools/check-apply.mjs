#!/usr/bin/env node
// MLP/ARK-719: compares the early-access page's words with the form Shrinivas approved, by script. Run after any edit to
// src/pages/early-access-apply.mjs or early-access-apps-script/code.gs, and after `node build/build.mjs`:
//
//   node build/tools/check-apply.mjs [path to EARLY_ACCESS_FORM_APPROVED_BY_SRK_2026-11-10.md]
//
// It reads the approved file, expands its shared sentences (VISIT, RATE, CALC, INVOICE, TRACK) and compares, one by one:
//   the heading, intro, consent line, button, confirmation; the five parts and their lines; all 26 questions (text, kind,
//   hint, options); every reply under every answer, and the two "tick all" replies' headings and lines.
// It checks them in the page's source AND in what the build shipped (the JSON and the HTML in dist/live/early-access/apply/).
// It also checks that code.gs has one column per question, in the form's order. It prints every difference; none is the goal.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const APPROVED = process.argv[2] || path.join(process.env.HOME, "Downloads/Maulya/5_PLANS_AND_REFERENCE/SITE_2026-11-10/EARLY_ACCESS_FORM_APPROVED_BY_SRK_2026-11-10.md");
const md = fs.readFileSync(APPROVED, "utf8").split("\n");
const mod = await import(path.join(ROOT, "src/pages/early-access-apply.mjs"));
const diffs = [];
let checked = 0;
const eq = (what, got, want) => { checked++; if (got !== want) diffs.push(`${what}\n    page:     ${JSON.stringify(got)}\n    approved: ${JSON.stringify(want)}`); };

// ---- the approved file
const consts = {};
for (const l of md) { const m = l.match(/called (VISIT|RATE|CALC|INVOICE|TRACK) below: "(.+)"$/); if (m) consts[m[1]] = m[2]; }
eq("shared sentences found", Object.keys(consts).sort().join(","), "CALC,INVOICE,RATE,TRACK,VISIT");

const field = (label) => { const l = md.find((x) => x.startsWith(`**${label}`)); return l ? l.replace(/^\*\*[^*]+\*\*\s*/, "") : null; };
const heading = field("Heading:");
const consent = field("Consent box (required):").replace(/ \*$/, "");
const button = field("Button:");
const confLine = field("After sending (the confirmation):");
const introStart = md.findIndex((x) => x.startsWith("**Intro:**"));
const intro = [];
for (let i = introStart + 1; i < md.length && (md[i].startsWith(">") || md[i] === ""); i++) if (md[i].startsWith(">") && md[i].replace(/^>\s?/, "").trim()) intro.push(md[i].replace(/^>\s?/, ""));

const expectParts = [];
let curPart = null, curQ = null, replyHeadFor = null;
const expectQ = {};
const expandReply = (after) => {
  const m = after.match(/^\*\*(.+?)\*\*\s*(.*)$/);
  const bold = m[1];
  const pieces = m[2] ? m[2].split(" + ") : [];
  const rest = pieces.map((p) => (/^[A-Z]+$/.test(p) ? consts[p] : p.replace(/^"(.*)"$/, "$1"))).join(" ");
  return { bold, rest };
};
for (let i = 0; i < md.length; i++) {
  const l = md[i];
  let m = l.match(/^### Part (\d) of 5 · (.+)$/);
  if (m) { curPart = { title: m[2], sub: md[i + 1].replace(/^\*|\*$/g, ""), qs: [] }; expectParts.push(curPart); curQ = null; continue; }
  if (!curPart) continue;
  const plainLine = l.replace(/^\*\*(\d+\. .*?)\*\*/, "$1");
  m = plainLine.match(/^(\d+)\. (.*?) \((pick one|tick all[^)]*|text[^)]*|optional, paragraph)\)(?:: (.*?))?(?:\. Heading of the reply: \*\*(.*?)\*\*)?$/);
  if (m && !l.startsWith("- ")) {
    const n = +m[1], what = m[3];
    curQ = { n, text: m[2], kind: what.startsWith("pick") ? "one" : what.startsWith("tick") ? "many" : what === "optional, paragraph" ? "para" : "text", options: [], head: m[5] || "" };
    const hint = what.match(/hint "(.*)"/); curQ.hint = hint ? hint[1] : "";
    curQ.other = /"Other" opens/.test(what);
    if (m[4]) curQ.options = m[4].split(" / ").map((label) => ({ label }));
    expectQ[n] = curQ; curPart.qs.push(curQ);
    const hd = l.match(/Heading of the reply: \*\*(.*?)\*\*/); if (hd) curQ.head = hd[1];
    continue;
  }
  if (curQ && l.startsWith("- ") && l.includes(" → ")) {
    const [labels, after] = l.slice(2).split(" → ");
    if (curQ.kind === "many") { if (!/^no line\.?$/.test(after)) curQ.options.push({ label: labels, line: after }); }
    else for (const label of labels.split(" / ")) curQ.options.push({ label, reply: expandReply(after) });
  }
}

// ---- the page's source
eq("heading", mod.HEADING, heading);
eq("consent", mod.CONSENT, consent);
eq("button", mod.SEND, button);
eq("confirmation", mod.CONFIRMATION, confLine);
eq("intro, paragraphs", mod.INTRO.length, intro.length);
intro.forEach((t, i) => eq(`intro paragraph ${i + 1}`, mod.INTRO[i], t));
eq("parts", mod.PARTS.length, expectParts.length);
expectParts.forEach((p, i) => {
  const g = mod.PARTS[i]; if (!g) return;
  eq(`part ${i + 1} title`, g.title, p.title); eq(`part ${i + 1} line`, g.sub, p.sub);
  eq(`part ${i + 1} questions`, g.questions.map((q) => q.n).join(","), p.qs.map((q) => q.n).join(","));
});
eq("26 questions", mod.QUESTIONS.length, 26);
let replies = 0;
for (const q of mod.QUESTIONS) {
  const e = expectQ[q.n];
  if (!e) { diffs.push(`question ${q.n} is not in the approved file`); continue; }
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

// ---- what the build shipped
const shipped = path.join(ROOT, "dist/live/early-access/apply/index.html");
if (!fs.existsSync(shipped)) diffs.push("dist/live/early-access/apply/index.html is missing: run node build/build.mjs first");
else {
  const html = fs.readFileSync(shipped, "utf8");
  const un = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  const data = JSON.parse(html.match(/<script type="application\/json" id="apply-data">(.*?)<\/script>/)[1]);
  for (const [n, e] of Object.entries(expectQ)) {
    if (e.kind !== "one" && e.kind !== "many") continue;
    const d = data[n];
    if (!d) { diffs.push(`shipped data has no question ${n}`); continue; }
    eq(`shipped Q${n} options`, d.options.map((o) => o.label).join(" | "), e.options.map((o) => o.label).join(" | "));
    if (e.kind === "many") {
      eq(`shipped Q${n} heading`, d.head, e.head);
      e.options.forEach((w, i) => eq(`shipped Q${n} "${w.label}" line`, (d.options[i].reply && d.options[i].reply.line) || undefined, w.line));
    } else e.options.forEach((w, i) => { const wr = w.reply || { bold: undefined, rest: undefined }; eq(`shipped Q${n} "${w.label}" bold`, d.options[i].reply ? d.options[i].reply.bold : undefined, wr.bold); eq(`shipped Q${n} "${w.label}" rest`, d.options[i].reply ? d.options[i].reply.rest : undefined, wr.rest); });
  }
  const textOf = (s) => un(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ");
  const has = (what, t) => eq(`page shows ${what}`, textOf(html).includes(t.replace(/\s+/g, " ")), true);
  has("the heading", heading); has("the consent line", consent); has("the button", button);
  intro.forEach((t, i) => has(`intro ${i + 1}`, t));
  has("the confirmation", confLine);
  for (const p of expectParts) { has(`"${p.title}"`, p.title); has("its line", p.sub); for (const q of p.qs) has(`question ${q.n}`, `${q.n}. ${q.text}`); }
  for (const [n, e] of Object.entries(expectQ)) for (const o of e.options) eq(`page has a button "${o.label}" (Q${n})`, html.includes(`>${o.label.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}</button>`), true);
}

// ---- the Sheet script
const gs = fs.readFileSync(path.join(ROOT, "early-access-apps-script/code.gs"), "utf8");
const cols = [...gs.matchAll(/^\s+\["(q\d+)", "(.*)"\],?$/gm)].map((m) => [m[1], JSON.parse(`"${m[2]}"`)]);
eq("code.gs columns", cols.map((c) => c[0]).join(","), mod.QUESTIONS.map((q) => "q" + q.n).join(","));
cols.forEach((c, i) => { const q = mod.QUESTIONS[i]; if (q) eq(`code.gs heading for Q${q.n}`, c[1], `${q.n}. ${q.text}`); });

console.log(`Compared ${checked} things (${replies} replies) with ${path.basename(APPROVED)}.`);
if (diffs.length) { console.log(`${diffs.length} DIFFERENCE(S):\n` + diffs.map((d) => "  - " + d).join("\n")); process.exit(1); }
else console.log("No differences.");
