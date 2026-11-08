// Parts shared by pages. The scale's seven places are the app's own (a file's page, "Where the work stands":
// Not started, At site, Waiting at desk, At desk, With the valuer, Ready to go, Delivered). The quoted lines are words
// seen on the app's review-mode screens. MLP/ARK-693: the steps' words follow Shrinivas's train (SRK-84 who checks the
// visit, SRK-86 the form for office staff and approve in one press, SRK-89 a paid file closes itself); journey.mjs.

const STAGES = [
  {
    name: "Not started",
    title: "The file comes in",
    text: "The file is made once: who sent it (a bank, a client directly or another valuer), the bank and branch, the property and the borrower, where it is, and who does the work. You can save a draft and come back to it.",
    who: ["Owner", "Associate valuer", "Assistant valuer", "Office staff"],
    said: ["Documents this bank will need", "Choose the bank and the kind of property to see the documents this bank will need."],
    pics: [["desk-new-file", "The New file form: details filled 1 of 7, the documents the bank will need, and the report's due date, with sections for who sent it, the property and the borrower, where it is, and who does the work."]],
  },
  {
    name: "At site",
    title: "The site visit",
    text: "The site engineer sees the visit on the phone: when and where, who to meet, the site's exact location, and a check of the site in steps. Photos are taken against the list the report needs. When the visit is done, the phone asks who should check it.",
    who: ["Site engineer", "Assistant valuer"],
    said: ["Photos for the report", "Take each photo the report needs. Each one is kept on this phone first, then goes to the office by itself."],
    pics: [["phone-visit", "A site visit on the phone with the time, place, who to meet and buttons to go there and to call.", true], ["phone-visit-photos", "The visit's photos: 1 of 2 needed photos taken and sent.", true]],
  },
  {
    name: "Waiting at desk",
    title: "The evidence arrives",
    text: "Photos and documents land on the file, not in someone's gallery. The file says what has come and what is still missing, so the office can ask for it while the field person can still be reached. The owner or an assistant valuer checks the visit: accepts it, or sends it back to the site engineer.",
    who: ["Owner", "Assistant valuer", "Office staff"],
    said: ["Documents", "3 of 5 in. 2 missing."],
    pics: [["desk-file-overview", "A file's page: where the work stands on a seven-step scale, the documents with 3 of 5 in and 2 missing, the site visit, and who has the file now."]],
  },
  {
    name: "At desk",
    title: "The report is made",
    text: "The desk makes the report on the report form, from what is on the file: the property, the photos and the documents. Office staff can fill the whole form; the prevailing rate and the adopted rate stay with the valuer. The file shows who has it and since when.",
    who: ["Office staff", "Assistant valuer"],
    said: ["Where the file is now", "At desk. Report being written."],
    pics: [["desk-home-office-staff", "Home for office staff: files with you, waiting at the desk, visits today and ready to go, with each file's next step."]],
  },
  {
    name: "With the valuer",
    title: "The valuer checks and approves",
    text: "The report comes to the valuer to check. Approving it is the valuer's step, never assumed: one press approves it and asks who prints, signs and hands it over. Nobody approves their own report, and office staff never approve.",
    who: ["Owner", "Associate valuer", "Assistant valuer"],
    said: ["The report is ready to check", "Approve the report"],
    equals: true,
    pics: [["desk-home-owner", "The owner's Home with two files waiting for approval, each with an Approve button."]],
  },
  {
    name: "Ready to go",
    title: "Printed, signed and handed over",
    text: "The person the valuer chose prints the report, signs it and hands it over, marking each step on the file. The file shows what is left, such as signing the printed report. At hand-over the payment is recorded on the file.",
    who: ["Owner", "Associate valuer", "Office staff"],
    said: ["Ready to go", "Sign the printed report"],
    pics: [["desk-home-associate", "Home for an associate valuer, with files ready to go."]],
  },
  {
    name: "Delivered",
    title: "Handed over, and kept",
    text: "When the report is handed over and nothing is owed, the file closes by itself. The finished report stays with its file: the photos, the documents and the history of who did what. Months later, when a bank or borrower asks about an old report, it can be found.",
    who: ["Everyone who worked on it"],
    said: ["Files you worked on", "Finished"],
    pics: [["desk-queue-owner", "The Queue with the Finished tab and every file by where it is."]],
  },
];

export function fileScale(shot) {
  const tabs = STAGES.map((s, i) => `<li role="presentation"><button class="scale-btn" role="tab" id="st-${i}" aria-controls="sp-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span class="scale-dot" aria-hidden="true"></span><span class="scale-name">${s.name}</span></button></li>`).join("");
  const panels = STAGES.map((s, i) => `
          <div class="scale-panel" role="tabpanel" id="sp-${i}" aria-labelledby="st-${i}" tabindex="0">
            <div>
              <p class="small muted" style="margin:0 0 6px">${i + 1} of 7, ${s.name}</p>
              <h3>${s.title}</h3>
              <p>${s.text}</p>
              ${s.equals ? `<p style="display:flex;gap:12px;align-items:center"><svg class="equals" viewBox="0 0 44 30" aria-hidden="true" data-equals><rect x="2" y="6" width="40" height="6" rx="1"/><rect x="2" y="18" width="40" height="6" rx="1"/></svg><span class="small">In the app, the equals mark levels when a registered valuer finalises.</span></p>` : ""}
              <p class="said"><strong>On the screen:</strong> "${s.said.join('", "')}"</p>
              <ul class="who" aria-label="Who works here">${s.who.map((w) => `<li>${w}</li>`).join("")}</ul>
            </div>
            <div class="panel-pics">${s.pics.map(([n, alt, phone]) => `<figure class="${phone ? "frame-phone" : "frame-desk"}">${shot(n, alt, { phone: !!phone })}</figure>`).join("")}</div>
          </div>`).join("");
  return `
        <div class="scale" data-scale>
          <ol class="scale-rule" role="tablist" aria-label="Where a file is">
            ${tabs}
          </ol>
          <div class="scale-panels">${panels}
          </div>
        </div>`;
}
