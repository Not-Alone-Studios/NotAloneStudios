// MLP/ARK-719: /early-access/apply/: the early-access application, as Shrinivas approved it on Tue 10 Nov 2026
// (~/Downloads/Maulya/5_PLANS_AND_REFERENCE/SITE_2026-11-10/EARLY_ACCESS_FORM_APPROVED_BY_SRK_2026-11-10.md).
// His words are the source: the heading, the intro, the five parts, the 26 questions, the reply under each answer, the consent
// line, the button and the confirmation. Nothing here is a new claim. build/tools/check-apply.mjs compares every one of them
// with that file by script (run it after any edit here).
// The few lines the approved text does not give (what is still missing, the page when sending is not open yet, a send that
// failed, the no-script line) are labelled "#31's call" in LW_ACTIONS.md.
// The page's behaviour is in src/assets/apply.js; the answers go to early-access-apps-script/code.gs.
import { esc } from "../../build/md.mjs";

// The sentences several replies share (the approved file calls them VISIT, RATE, CALC, INVOICE, TRACK).
const VISIT = "In Maulya the site engineer's answers on the phone go straight into the report form, office staff fill the rest, and you only set the rates and approve.";
const RATE = "Change the rate once: the land and building values, fair market, realisable and distress values update at once, and the report is remade in about a minute.";
const CALC = "Every value is worked out once, on Maulya's servers, by the same rules every time, and the report is checked for anything missing before it can go for approval. The screen, the Word file and the PDF always match.";
const INVOICE = "Maulya makes the GST invoice from the file itself, numbered in your firm's own series with no gaps, and keeps every payment against it.";
const TRACK = "Each file moves through the same steps, from the site visit to the payment, and everyone in your office sees where it stands and who has it.";

// A reply is [the bold opening, the rest]. An option with no reply shows none.
const R = (bold, rest = "") => ({ bold, rest });
const opt = (label, reply) => (reply ? { label, reply } : { label });
const plain = (...labels) => labels.map((l) => opt(l));

export const INTRO = [
  "Maulya is a workspace for Land & Building valuers, built by a practising valuer. One bank file goes from the site visit to the signed report and the payment in one place: the site engineer records the visit on the phone, office staff fill the report form, and the valuer sets the rates and approves. The report comes out in the bank's own format, starting with SBI Format A and co-operative bank formats.",
  "We are choosing 10–15 firms to use Maulya free for six weeks, on real files, and to tell us honestly what works and what doesn't.",
  "About 6 minutes. Questions marked * are needed.",
];
export const HEADING = "Apply to use Maulya free, and help shape it";
export const CONSENT = "I agree that Maulya may contact me about early access. My answers are used only to choose early-access firms.";
export const SEND = "Send my application";
export const CONFIRMATION = "We read every application and reply to everyone within a week, chosen or not.";

// type: one = pick one (buttons), many = tick all (buttons), text, para. Every question is required unless optional: true.
export const PARTS = [
  {
    title: "Your work today", sub: "Seven quick questions about the things every valuation office runs into.",
    questions: [
      { n: 1, type: "one", text: "Have you ever lost a bank's next file because a report went out late after the site visit?", options: [
        opt("Yes, more than once", R("Maulya keeps that from happening again.", "Every file shows its next step and who has it. A file waiting for its report stays on top of your Home until it moves.")),
        opt("Once or twice", R("Even once is one too many.", "Maulya shows every file's next step and who has it, so a report never slips quietly after the site visit.")),
        opt("No", R("That's a well-run office.", "Maulya keeps it that way as you grow: every file's next step and who has it, in one place for the whole team.")),
      ] },
      { n: 2, type: "one", text: "How long does one report take, from the site visit to the signed report?", options: [
        opt("Same day", R("Same day is impressive.", `Maulya can make that day calmer still. ${VISIT}`)),
        opt("1–2 days", R("That's a good pace.", `Maulya can make it quicker. ${VISIT}`)),
        opt("3–5 days", R("Most of that time is typing the same things again.", VISIT)),
        opt("More than 5 days", R("Maulya is built to bring this down.", `${VISIT} Every file also shows who has it, so nothing waits unnoticed.`)),
      ] },
      { n: 3, type: "one", text: "When a land rate changes, how long does it take to update the whole report?", options: [
        opt("Under 10 minutes", R("That's quick.", `Maulya makes it quicker still. ${RATE}`)),
        opt("10–30 minutes", R("With Maulya, about a minute.", RATE)),
        opt("30–60 minutes", R("With Maulya, about a minute.", RATE)),
        opt("More than an hour", R("That hour comes back to you.", RATE)),
      ] },
      { n: 4, type: "one", text: "Has a calculation mistake ever reached a bank or a client, or nearly?", options: [
        opt("Yes", R("Maulya is built so this doesn't happen.", CALC)),
        opt("Nearly, caught it in time", R("Maulya catches it for you.", CALC)),
        opt("No", R("Careful work shows.", `Maulya backs it up. ${CALC}`)),
      ] },
      { n: 5, type: "one", text: "Have you lost a payment because a client said \"I'll pay in two days\" and it slipped?", options: [
        opt("Yes, more than once", R("In Maulya, money owed stays in sight.", "Every file shows what is still owed. Whoever hands over the report records the payment right there, and a file closes only when it is paid.")),
        opt("Once or twice", R("In Maulya, money owed stays in sight.", "Every file shows what is still owed. Whoever hands over the report records the payment right there, and a file closes only when it is paid.")),
        opt("Never", R("Well kept.", "Maulya makes it effortless: what is owed shows on every file, and anyone in your office can record a payment the moment it comes in.")),
      ] },
      { n: 6, type: "one", text: "How do you make your invoices today?", options: [
        opt("Word or Excel", R("No more retyping.", INVOICE)),
        opt("Tally", R("Maulya sits alongside your accounts.", INVOICE)),
        opt("A paid billing app", R("One less app to pay for.", INVOICE)),
        opt("By hand", R("No more writing it out.", INVOICE)),
        opt("We usually don't make one", R("No problem.", "Maulya never forces a bill: payments are recorded on the file either way. When a bank or client does ask for one, it is made from the file itself.")),
      ] },
      { n: 7, type: "one", text: "How do you track a file from the first call to the payment: visit, documents, report, hand-over, money?", options: [
        opt("A diary or register", R("One place for every file.", TRACK)),
        opt("An Excel sheet", R("One place for every file, kept up to date by itself.", TRACK)),
        opt("WhatsApp groups", R("No more scrolling back through chats.", TRACK)),
        opt("Software", R("Good to hear.", "Maulya brings the tracking and the report together, so each file, its report and its payment live in one place.")),
        opt("Mostly in my head", R("Let Maulya remember for you.", TRACK)),
      ] },
    ],
  },
  {
    title: "About you", sub: "So we can reach you.",
    questions: [
      { n: 8, type: "text", text: "Full name", autocomplete: "name" },
      { n: 9, type: "text", text: "Email", hint: "name@example.com", input: "email", autocomplete: "email" },
      { n: 10, type: "text", text: "WhatsApp number", hint: "10-digit mobile number", input: "tel", autocomplete: "tel" },
      { n: 11, type: "text", text: "City or district, and state", hint: "For example: Mudhol, Karnataka", autocomplete: "address-level2" },
      { n: 12, type: "one", text: "Years in practice as a valuer", options: plain("Under 3", "3–10", "Over 10") },
    ],
  },
  {
    title: "Your firm", sub: "Maulya works best when the whole office uses it on the same file.",
    questions: [
      { n: 13, type: "text", text: "Firm name", autocomplete: "organization" },
      { n: 14, type: "one", text: "How many people work on valuation files?", options: plain("Just me", "2–5", "6–15", "More than 15") },
      { n: 15, type: "many", text: "Who is in your team?", options: plain("Assistant valuers", "Site engineers", "Office staff", "Associates") },
      { n: 16, type: "one", text: "Bank files per month", options: plain("Under 10", "10–30", "30–60", "Over 60") },
      { n: 17, type: "one", text: "How many nationalised banks are you empanelled with?", options: plain("None", "1–2", "3–5", "6 or more") },
      { n: 18, type: "one", text: "How many other banks and lenders are you empanelled with (co-operative banks, private banks, NBFCs)?", options: plain("None", "1–2", "3–5", "6 or more") },
      { n: 19, type: "many", text: "Property types you value most", options: plain("Houses", "Flats", "Plots", "Commercial", "Industrial", "Agricultural land") },
    ],
  },
  {
    title: "How you make reports", sub: "Pick what fits, or add your own under Other.",
    questions: [
      { n: 20, type: "one", text: "How do you make reports now?", options: [
        opt("Word templates", R("Keep the bank's format, lose the typing.", "Maulya fills the bank's own format from what the file already knows, starting with SBI Format A and co-operative bank formats.")),
        opt("Excel", R("Your sheets, without the copying.", "Maulya works out the values for you and puts them straight into the bank's format.")),
        opt("Other software", R("We'd love to hear what you miss in it.", "Maulya handles the whole file, not just the report: the visit, the documents, the approval and the payment.")),
        opt("Someone else types them", R("Let them type less.", "In Maulya the site visit and the file fill most of the form, so the person preparing the report checks instead of typing.")),
      ] },
      { n: 21, type: "many", other: true, text: "What takes the most time in a file?", replyHead: "Here is how Maulya helps with these:", options: [
        opt("Typing the report", "Typing: the site visit and the file fill most of the report form."),
        opt("Calculations", "Calculations: worked out for you, the same way every time."),
        opt("Collecting documents", "Documents: each bank's list on the file, with what is missing shown in red."),
        opt("Travel to the site", "Site visits: the engineer records everything on the phone, even without signal, and it reaches the office by itself."),
        opt("Bank corrections", "Corrections: change a figure once and the whole report follows."),
        opt("Following up for payment", "Payments: what is owed shows on every file and is recorded at hand-over."),
      ] },
      { n: 22, type: "many", other: true, text: "What would make a tool worth paying for?", replyHead: "Maulya already does these:", options: [
        opt("Faster reports", "Faster reports: the visit fills the form; you set the rates and approve."),
        opt("Fewer mistakes", "Fewer mistakes: one calculation, and a check before approval."),
        opt("Seeing where every file is", "Every file's step and who has it, on one screen."),
        opt("Tracking payments", "What is owed on every file, and payments recorded on the spot."),
        opt("Bank formats ready", "SBI Format A and co-operative bank formats are ready, with more coming."),
        opt("Site visits on the phone", "A phone visit that works without signal and fills the report."),
      ] },
    ],
  },
  {
    title: "Early access", sub: "Free for six weeks. In return, we ask for real use and honest feedback.",
    questions: [
      { n: 23, type: "one", text: "Will you use Maulya on your real bank files for six weeks?", options: [
        opt("Yes", R("Thank you.", "Real files are how Maulya gets better for offices like yours.")),
        opt("No", R("Early access needs real files.", "Real files are how we find what to fix. If now is not the right time, you can still use Maulya when it opens to everyone.")),
      ] },
      { n: 24, type: "one", text: "Would you be comfortable with a quick call every 2–3 days, for an update or your feedback?", options: [
        opt("Yes", R("Thank you.", "Those short calls are how your way of working gets built into Maulya.")),
        opt("No", R("These calls are the heart of early access.", "Short, frequent calls are how your office's way of working gets built into Maulya. Firms who can give them will be chosen first.")),
      ] },
      { n: 25, type: "one", text: "Site visits are done on", options: plain("Android phone", "iPhone", "Paper notes") },
      { n: 26, type: "para", optional: true, text: "Anything else we should know?" },
    ],
  },
];

export const QUESTIONS = PARTS.flatMap((p) => p.questions);

// The lines the approved text does not give (listed in LW_ACTIONS.md as #31's call, ARK may overrule)
export const SAYS = {
  noScript: (mail) => `This form needs JavaScript. If it will not run for you, write to ${mail}.`,
  needed: "Still needed before you can send:",
  notOpen: "Sending applications opens soon. Nothing was sent. Your answers are still on this screen.",
  failed: (mail) => `Your application was not sent. Your answers are still on this screen: try again in a moment, or write to ${mail}.`,
  sending: "Sending…",
};

const replyHtml = (r) => `<strong>${esc(r.bold)}</strong>${r.rest ? " " + esc(r.rest) : ""}`;
const req = `<span class="req" aria-hidden="true"> *</span><span class="sr-only"> (required)</span>`;

function questionHtml(q) {
  const id = `q${q.n}`;
  const mark = q.optional ? "" : req;
  const legend = `<span class="q-n">${q.n}.</span> ${esc(q.text)}${mark}`;
  if (q.type === "text" || q.type === "para") {
    const common = `id="${id}" name="${id}" data-q="${q.n}"${q.optional ? "" : " required"}`;
    const field = q.type === "para"
      ? `<textarea ${common} rows="4" maxlength="2000" class="field"></textarea>`
      : `<input ${common} class="field" type="${q.input === "email" ? "email" : q.input === "tel" ? "tel" : "text"}"${q.input === "tel" ? ' inputmode="tel"' : q.input === "email" ? ' inputmode="email"' : ""} autocomplete="${q.autocomplete}"${q.hint ? ` placeholder="${esc(q.hint)}"` : ""} maxlength="200" />`;
    return `<div class="q" data-qwrap="${q.n}"><label class="q-label" for="${id}">${legend}</label>${field}</div>`;
  }
  const many = q.type === "many";
  const buttons = q.options.map((o, i) =>
    `<button type="button" class="opt" aria-pressed="false" data-i="${i}">${esc(o.label)}</button>`).join("")
    + (q.other ? `<button type="button" class="opt" aria-pressed="false" data-other="1">Other</button>` : "");
  const otherBox = q.other
    ? `<div class="other" hidden><label class="other-label" for="${id}-other">Other</label><input id="${id}-other" class="field" type="text" maxlength="200" data-other-text /></div>`
    : "";
  return `<fieldset class="q" data-qwrap="${q.n}" data-q="${q.n}" data-kind="${many ? "many" : "one"}">`
    + `<legend class="q-label">${legend}</legend>`
    + `<div class="opts">${buttons}</div>${otherBox}`
    + `<div class="reply" role="status"></div></fieldset>`;
}

// What the page script needs: the replies, by question and option (the page's words stay in this one file)
function dataJson(mail) {
  const d = {};
  for (const q of QUESTIONS) {
    if (q.type !== "one" && q.type !== "many") continue;
    d[q.n] = {
      kind: q.type, head: q.replyHead || "", other: !!q.other,
      options: q.options.map((o) => ({
        label: o.label,
        reply: o.reply ? (typeof o.reply === "string" ? { line: o.reply } : { bold: o.reply.bold, rest: o.reply.rest }) : null,
      })),
    };
  }
  d.text = Object.fromEntries(QUESTIONS.filter((q) => q.type === "text" || q.type === "para").map((q) => [q.n, { optional: !!q.optional, input: q.input || "" }]));
  d.says = { needed: SAYS.needed, notOpen: SAYS.notOpen, sending: SAYS.sending };
  d.failed = SAYS.failed(mail);
  return JSON.stringify(d).replace(/</g, "\\u003c");
}

export default ({ cfg }) => {
  const url = String(cfg.earlyAccess.appsScriptUrl || "").trim();
  const mail = cfg.site.supportEmail;
  const dataText = dataJson(mail);
  if (!cfg.earlyAccess.open) {
    // earlyAccess.open: false (the 10 to 15 are chosen): the page keeps its address but takes no applications
    return {
      path: "/early-access/apply/", title: HEADING, noindex: true,
      description: "Applications for early access to Maulya are closed.",
      body: `
    <section class="page-head on-body"><div class="wrap">
      <span class="kicker">Early access</span><h1>Applications are closed</h1>
      <div class="actions"><a class="btn btn-line" href="/early-access/">How early access works</a></div>
    </div></section>
`,
    };
  }
  const parts = PARTS.map((p, i) => `
        <section class="apply-part" aria-labelledby="part-${i + 1}">
          <h2 id="part-${i + 1}">Part ${i + 1} of ${PARTS.length} · ${esc(p.title)}</h2>
          <p class="muted part-sub">${esc(p.sub)}</p>
          ${p.questions.map(questionHtml).join("\n          ")}
        </section>`).join("\n");
  return {
    path: "/early-access/apply/",
    title: HEADING,
    description: "An application to use Maulya free for six weeks, on real files, from the 10–15 firms we are choosing.",
    body: `
    <section class="page-head on-body">
      <div class="wrap">
        <span class="kicker">Early access</span>
        <h1>${esc(HEADING)}</h1>
        ${INTRO.map((t, i) => `<p class="${i === 0 ? "lead" : "apply-intro"}">${esc(t)}</p>`).join("\n        ")}
      </div>
    </section>
    <section class="section">
      <div class="wrap apply-wrap">
        <noscript><div class="note"><p>${esc(SAYS.noScript(mail))}</p></div></noscript>
        <div class="apply-done" id="apply-done" tabindex="-1" hidden role="status"><div class="note green"><p><strong>${esc(CONFIRMATION)}</strong></p></div></div>
        <form class="apply" id="apply" novalidate data-endpoint="${esc(url)}" data-open="${cfg.earlyAccess.open ? "1" : "0"}" autocomplete="on">
${parts}
          <div class="apply-send">
            <label class="consent"><input type="checkbox" id="consent" /><span>${esc(CONSENT)}${req}</span></label>
            <p class="apply-missing small" id="apply-missing"></p>
            <button type="submit" class="btn btn-gold apply-btn" id="apply-btn" aria-disabled="true" aria-describedby="apply-missing">${esc(SEND)}</button>
            <p class="apply-state" id="apply-state" role="status"></p>
          </div>
        </form>
        <script type="application/json" id="apply-data">${dataText}</script>
      </div>
    </section>
    <script src="/assets/apply.js?v=${cfg.__buildId}" defer></script>
`,
  };
};
