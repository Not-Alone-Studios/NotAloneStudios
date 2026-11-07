// Who it's for. The jobs' names and one-line descriptions are the app's own (services/api/app/services/jobs.py, main
// 9a94cade8); "what they do" follows each job's abilities in the same file and Shrinivas's post 25 (who can use Maulya).

const JOBS = [
  {
    id: "owner", name: "Owner",
    line: "Sees every file, the money and the team, and looks after the firm's Maulya plan.",
    does: ["Sees what needs them first on Home: reports to approve, files not given to anyone, payments late.", "Approves and finalises reports as the registered valuer.", "Brings the team in and gives each person their job.", "Looks after the firm's Maulya plan in Settings."],
    pic: ["desk-home-owner", "The owner's Home with reports to approve and files to give out."],
  },
  {
    id: "associate", name: "Associate valuer",
    line: "Sees every file, the money and the team. Everything except the subscription.",
    does: ["Works across all the firm's files, like the owner.", "Checks, approves and finalises reports.", "Sees the money and the team."],
    pic: ["desk-home-associate", "Home for an associate valuer."],
  },
  {
    id: "assistant", name: "Assistant valuer",
    line: "Sees every file at every stage. Makes files, gives them out, visits, enters figures and prepares reports.",
    does: ["Makes files and gives them to the right person.", "Goes on site visits.", "Enters the valuation figures and prepares and makes reports."],
    pic: ["desk-home-assistant", "Home for an assistant valuer."],
  },
  {
    id: "office", name: "Office staff",
    line: "Makes files, gives site visits, prepares the report and hands it over. Sees the files they make and the files given to them.",
    does: ["Enters a new file once, as it comes in.", "Gives out the site visit.", "Prepares the report and hands it over.", "Never enters figures, approves or finalises: those stay with the valuer."],
    pic: ["desk-home-office-staff", "Home for office staff, with the files waiting at the desk."],
  },
  {
    id: "engineer", name: "Site engineer",
    line: "Sees the files given to them, for the site visit.",
    does: ["Accepts or declines a visit on the phone.", "Finds the site, meets the contact, and checks the site in steps.", "Takes the photos the report needs; each is kept on the phone, then sent by itself."],
    pic: ["phone-home-site-engineer", "The site engineer's Home on a phone with visits to accept.", true],
  },
  {
    id: "admin", name: "Admin",
    line: "Looks after the firm's settings. Sees no files and no money.",
    does: ["Looks after the firm's settings.", "Brings people into the firm and gives them their job."],
    pic: null,
  },
];

export default ({ L, shot }) => ({
  path: "/for-whom/",
  title: "Who it's for: valuers, office staff and site engineers",
  description:
    "Maulya is for property valuation offices in India: the owner, associate and assistant valuers, office staff, site engineers and an admin, each with their own view of the work.",
  body: `
    <section class="page-head on-body">
      <div class="wrap">
        <span class="kicker">Who it's for</span>
        <h1>For the whole valuation office, one person or twenty.</h1>
        <p class="lead">Maulya is for registered valuers and the people who work with them. Each person signs in as themselves and sees the work that is theirs. It is not for borrowers, buyers or brokers.</p>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <nav aria-label="Jobs on this page" class="chips" style="margin-bottom:24px">${JOBS.map((j) => `<a class="chip" style="text-decoration:none;display:inline-flex;align-items:center" href="#${j.id}">${j.name}</a>`).join("")}</nav>
        ${JOBS.map((j) => `
        <article class="job-full" id="${j.id}">
          <div>
            <h2>${j.name}</h2>
            <p class="lead">${j.line}</p>
            <ul>${j.does.map((d) => `<li>${d}</li>`).join("")}</ul>
          </div>
          ${j.pic ? `<figure class="${j.pic[2] ? "frame-phone" : "frame-desk"}" ${j.pic[2] ? 'style="max-width:300px;justify-self:center"' : ""}>${shot(j.pic[0], j.pic[1], { phone: !!j.pic[2] })}</figure>` : `<div class="note green"><p><strong>No picture on purpose.</strong> The admin's Maulya is the firm's settings: no files and no money.</p></div>`}
        </article>`).join("")}
      </div>
    </section>
    <section class="section face">
      <div class="wrap narrow">
        <h2>A solo valuer, too.</h2>
        <p>Maulya does not need a big team to be useful. A valuer working alone still has files coming in, visits to make, evidence to keep and reports to find again later. Start with yourself; add people when they join.</p>
        <p class="small muted">From <a href="/blog/is-maulya-for-small-valuation-offices/">Is Maulya only for large valuation firms?</a></p>
      </div>
    </section>
    <section class="closing on-body">
      <div class="wrap">
        <h2>Early access is free for six weeks.</h2>
        <div class="actions">${L.apply("btn btn-gold")}<a class="btn btn-line" href="/pricing/">See the prices</a></div>
      </div>
    </section>
`,
});
