// MLP/ARK-693: "How a file moves", told as one file's way through a valuer's office, in the app's own words.
// Sources, all Shrinivas's (his train mlp/srk/srk-train-2026-11-08 @ 347e8e21a, his GO of Sun 8 Nov, his reports
// SRK84_DONE to SRK90_DONE): the seven places are the app's scale ("Where the work stands"); the history lines are the
// file's own (uiReviewFixtures/fileJourney.ts: "File opened", "Site visit done", "Site work sent in", "Site work
// checked", "Sent to the valuer to approve"); the buttons are the app's ("Check the site visit", "Accept the visit",
// "Make the report", "Approve the report", "Mark it printed", "Mark it signed", "Mark it handed over", "Record a payment").
//   SRK-84: the phone and the computer ask "Who should check this visit?"; only the owner or an assistant valuer accepts.
//   SRK-88: a visit sent back returns to the site engineer.
//   SRK-87: the report form in groups, starting answers, enclosures from documents, valuer details from Settings.
//   SRK-86: office staff use the whole form, the prevailing and adopted rates stay with the valuer (R2); "Next: they
//           read it and approve it." (R4); approve in one press (R5); "Who prints, signs and hands it over?" (R6);
//           the payment is taken at hand-over (R8). No approving your own report.
//   SRK-89: a file closes by itself when handed over and paid ("✓ Complete").
//   SRK-90: the floors the engineer records on the phone are kept as the actual built-up area.
// Nothing here is a feature the app doesn't have. The app never says "seal", so neither does this.
// The moving card is decoration (aria-hidden): the list carries every word, with or without the script or motion.

export const JOURNEY = [
  {
    place: "Not started",
    title: "A new file, made once",
    text: "The office makes the file as it comes in: who sent it, the bank and branch, the property and the borrower, and where it is. Choose the bank and the kind of property, and the file lists the documents this bank will need. Then the site visit is given to someone.",
    said: ["Documents this bank will need", "Give it to someone"],
    who: ["Owner", "Assistant valuer", "Office staff"],
    card: ["File opened", "Give it to someone"],
  },
  {
    place: "At site",
    title: "The site visit, on the phone",
    text: "The site engineer accepts the visit, finds the site, meets the contact and checks the site in steps. Each photo the report needs is kept on the phone first, then goes to the office by itself. The floors measured on the phone are kept as the actual built-up area.",
    said: ["Done at the site", "Who should check this visit?"],
    who: ["Site engineer", "Assistant valuer"],
    card: ["Given to the site engineer for the site visit", "Done at the site"],
  },
  {
    place: "Waiting at desk",
    title: "The visit is checked",
    text: "The visit goes to the person the engineer chose: the owner or an assistant valuer. They see what came in from the site, then accept the visit, or send it back to the site engineer to be corrected. No visit skips the check.",
    said: ["Check the site visit", "Accept the visit"],
    who: ["Owner", "Assistant valuer"],
    card: ["Site work sent in", "Check the site visit"],
  },
  {
    place: "At desk",
    title: "Make the report",
    text: "The report form comes in groups, with starting answers from the file, the enclosures from its documents, and the valuer's details from Settings. Office staff can fill the whole form; the prevailing rate and the adopted rate stay with the valuer. The report is made in the bank's format, as a Word file and its PDF, then sent to be checked.",
    said: ["Make the report", "Next: they read it and approve it."],
    who: ["Office staff", "Assistant valuer"],
    card: ["Site work checked", "Make the report"],
  },
  {
    place: "With the valuer",
    title: "Approve the report, in one press",
    text: "The valuer reads the report: the preview, the Word file or the PDF. One press approves it, and the same question asks who prints, signs and hands it over. Or the valuer sends it back with a note. Nobody approves their own report.",
    said: ["Approve the report", "Who prints, signs and hands it over?"],
    who: ["Owner", "Associate valuer", "Assistant valuer"],
    card: ["Sent to the valuer to approve", "Approve the report"],
    equals: true,
  },
  {
    place: "Ready to go",
    title: "Print, sign and hand over",
    text: "The person the valuer chose prints the report, signs it and hands it over, marking each step on the file. At hand-over the file shows the bill, what has been received and what is still owed, and the payment is recorded there: who paid, how, and how much.",
    said: ["Mark it printed", "Mark it signed", "Mark it handed over", "Record a payment"],
    who: ["Office staff", "Owner", "Assistant valuer"],
    card: ["The report is approved.", "Mark it printed"],
  },
  {
    place: "Delivered",
    title: "Handed over, paid, and kept",
    text: "When the report is handed over and nothing is owed, the file closes by itself. The report stays with its file, with the photos, the documents and who did what, so it can be found when a bank asks about it months later.",
    said: ["✓ Complete"],
    who: ["Everyone who worked on it"],
    card: ["Closed by itself: handed over and paid", "✓ Complete", "Now:"],
  },
];

const EQUALS = `<svg class="equals" viewBox="0 0 44 30" aria-hidden="true" data-equals><rect x="2" y="6" width="40" height="6" rx="1"/><rect x="2" y="18" width="40" height="6" rx="1"/></svg>`;

/** The app's seven-bar place mark: the bars up to here filled, this one gold. */
const bars = (at) => `<span class="jc-bars" aria-hidden="true">${JOURNEY.map((_, i) => `<i class="${i < at ? "done" : i === at ? "here" : ""}"></i>`).join("")}</span>`;

export function fileJourney() {
  const first = JOURNEY[0];
  const steps = JOURNEY.map((s, i) => `
            <li class="journey-step" data-at="${i}" data-place="${s.place}" data-event="${s.card[0]}" data-next="${s.card[1]}" data-next-label="${s.card[2] || "Next:"}">
              <span class="journey-dot" aria-hidden="true"></span>
              <p class="journey-place"><span class="num">${i + 1}</span> of 7 · ${s.place}</p>
              <h3>${s.title}</h3>
              <p>${s.text}</p>
              ${s.equals ? `<p class="journey-eq">${EQUALS}<span class="small">In the app, the equals mark levels when a registered valuer finalises.</span></p>` : ""}
              <p class="said"><strong>On the screen:</strong> "${s.said.join('", "')}"</p>
              <ul class="who" aria-label="Who works here">${s.who.map((w) => `<li>${w}</li>`).join("")}</ul>
            </li>`).join("");
  return `
        <div class="journey" data-journey>
          <div class="journey-rail" aria-hidden="true">
            <div class="journey-card" data-journey-card>
              <p class="jc-file"><b>Borrower K</b><span>Co-op Bank A Branch 2 · House</span></p>
              <p class="jc-where">${bars(0)}<b data-jc-place>${first.place}</b></p>
              <p class="jc-line"><span>Last:</span> <span data-jc-event>${first.card[0]}</span></p>
              <p class="jc-line"><span data-jc-label>Next:</span> <b data-jc-next>${first.card[1]}</b></p>
            </div>
          </div>
          <ol class="journey-steps">${steps}
          </ol>
        </div>
        <p class="small muted journey-foot">The file card is a sample from the app's review mode: the borrower and the branch are made up.</p>`;
}
